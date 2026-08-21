import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { Wallet, PointTransaction, PayoutRequest, Lesson } from '@/lib/wallet-types';
import { STUDENT_WALLET_ID, TUTOR_WALLET_ID } from '@/lib/wallet-types';

type WalletContextValue = {
  studentWallet: Wallet | null;
  tutorWallet: Wallet | null;
  studentTransactions: PointTransaction[];
  tutorTransactions: PointTransaction[];
  payouts: PayoutRequest[];
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  buyPoints: (packageId: string, method: string) => Promise<void>;
  requestPayout: (amount: number, method: 'paypal' | 'bank', methodDetail: string) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<{ platform_fee: number; tutor_payout: number }>;
  cancelLesson: (lessonId: string, cancelledBy?: string) => Promise<{ refunded_amount: number }>;
  registerTutor: (walletId: string) => Promise<void>;
  bookLesson: (price: number, scheduledAt: string) => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [studentWallet, setStudentWallet] = useState<Wallet | null>(null);
  const [tutorWallet, setTutorWallet] = useState<Wallet | null>(null);
  const [studentTransactions, setStudentTransactions] = useState<PointTransaction[]>([]);
  const [tutorTransactions, setTutorTransactions] = useState<PointTransaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [studentRes, tutorRes, studentTxRes, tutorTxRes, payoutRes, lessonRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('id', STUDENT_WALLET_ID).maybeSingle(),
        supabase.from('wallets').select('*').eq('id', TUTOR_WALLET_ID).maybeSingle(),
        supabase
          .from('point_transactions')
          .select('*')
          .eq('wallet_id', STUDENT_WALLET_ID)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('point_transactions')
          .select('*')
          .eq('wallet_id', TUTOR_WALLET_ID)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('payout_requests')
          // method_detail (PayPal / bank details) is intentionally never read by the client
          .select('id, wallet_id, amount, method, status, created_at, processed_at')
          .eq('wallet_id', TUTOR_WALLET_ID)
          .order('created_at', { ascending: false }),
        supabase
          .from('lessons')
          .select('*')
          .or(`student_wallet_id.eq.${STUDENT_WALLET_ID},tutor_wallet_id.eq.${TUTOR_WALLET_ID}`)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (studentRes.error) throw studentRes.error;
      if (tutorRes.error) throw tutorRes.error;
      if (studentTxRes.error) throw studentTxRes.error;
      if (tutorTxRes.error) throw tutorTxRes.error;
      if (payoutRes.error) throw payoutRes.error;
      if (lessonRes.error) throw lessonRes.error;

      setStudentWallet(studentRes.data as Wallet | null);
      setTutorWallet(tutorRes.data as Wallet | null);
      setStudentTransactions((studentTxRes.data ?? []) as PointTransaction[]);
      setTutorTransactions((tutorTxRes.data ?? []) as PointTransaction[]);
      setPayouts((payoutRes.data ?? []) as PayoutRequest[]);
      setLessons((lessonRes.data ?? []) as Lesson[]);
    } catch (err) {
      console.error('wallet load failed', err);
      setError('WALLET_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const buyPoints = useCallback(
    async (packageId: string, method: string) => {
      // The point amount is resolved server-side from the package id.
      const { data, error: rpcErr } = await supabase.rpc('purchase_points', {
        p_wallet_id: STUDENT_WALLET_ID,
        p_package_id: packageId,
        p_method: method,
      });
      if (rpcErr) {
        console.error('purchase failed', rpcErr);
        throw new Error('PURCHASE_FAILED');
      }
      if (data && data.success === false) throw new Error(data.error ?? 'PURCHASE_FAILED');

      await refresh();
    },
    [refresh],
  );

  const requestPayout = useCallback(
    async (amount: number, method: 'paypal' | 'bank', methodDetail: string) => {
      // Amount, balance and status are all re-validated server-side.
      const { data, error: rpcErr } = await supabase.rpc('request_payout', {
        p_wallet_id: TUTOR_WALLET_ID,
        p_amount: amount,
        p_method: method,
        p_method_detail: methodDetail,
      });
      if (rpcErr) {
        console.error('payout request failed', rpcErr);
        throw new Error('PAYOUT_FAILED');
      }
      if (data && data.success === false) throw new Error(data.error ?? 'PAYOUT_FAILED');

      await refresh();
    },
    [refresh],
  );

  const callEdgeFunction = useCallback(async (payload: Record<string, unknown>) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lesson-ops`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('lesson-ops request failed', res.status);
      throw new Error('LESSON_OP_FAILED');
    }
    const data = await res.json();
    if (data.success === false) {
      console.error('lesson-ops rejected the request', data.error);
      throw new Error('LESSON_OP_FAILED');
    }
    return data;
  }, []);

  const completeLesson = useCallback(
    async (lessonId: string) => {
      const data = await callEdgeFunction({ action: 'complete', lessonId });
      await refresh();
      return { platform_fee: data.platform_fee, tutor_payout: data.tutor_payout };
    },
    [callEdgeFunction, refresh],
  );

  const cancelLesson = useCallback(
    async (lessonId: string, cancelledBy = 'student') => {
      const data = await callEdgeFunction({ action: 'cancel', lessonId, cancelledBy });
      await refresh();
      return { refunded_amount: data.refunded_amount };
    },
    [callEdgeFunction, refresh],
  );

  const registerTutor = useCallback(
    async (walletId: string) => {
      await callEdgeFunction({ action: 'register_tutor', walletId });
      await refresh();
    },
    [callEdgeFunction, refresh],
  );

  const bookLesson = useCallback(
    async (price: number, scheduledAt: string) => {
      // Price bounds, balance check and the debit all happen server-side.
      const { data, error } = await supabase.rpc('book_lesson', {
        p_student_wallet_id: STUDENT_WALLET_ID,
        p_tutor_wallet_id: TUTOR_WALLET_ID,
        p_price: price,
        p_scheduled_at: scheduledAt,
      });
      if (error) {
        console.error('booking failed', error);
        throw new Error('BOOKING_FAILED');
      }
      if (data && data.success === false) throw new Error(data.error ?? 'BOOKING_FAILED');

      await refresh();
    },
    [refresh],
  );

  return (
    <WalletContext.Provider
      value={{
        studentWallet,
        tutorWallet,
        studentTransactions,
        tutorTransactions,
        payouts,
        lessons,
        loading,
        error,
        refresh,
        buyPoints,
        requestPayout,
        completeLesson,
        cancelLesson,
        registerTutor,
        bookLesson,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
