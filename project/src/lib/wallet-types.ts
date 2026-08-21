export type OwnerType = 'student' | 'tutor';

export type Wallet = {
  id: string;
  owner_type: OwnerType;
  owner_name: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  total_commission: number;
  commission_rate: number;
  is_early_bird: boolean;
  created_at: string;
  updated_at: string;
};

export type LessonStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export type Lesson = {
  id: string;
  student_wallet_id: string;
  tutor_wallet_id: string;
  price: number;
  status: LessonStatus;
  commission_rate: number;
  platform_fee: number;
  tutor_payout: number;
  scheduled_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionType =
  | 'purchase'
  | 'lesson_booking'
  | 'lesson_earning'
  | 'commission'
  | 'payout'
  | 'refund'
  | 'expiry';

export type PointTransaction = {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference: string;
  created_at: string;
};

export type PayoutStatus = 'pending' | 'approved' | 'completed' | 'rejected';

export type PayoutMethod = 'paypal' | 'bank';

export type PayoutRequest = {
  id: string;
  wallet_id: string;
  amount: number;
  method: PayoutMethod;
  method_detail: string;
  status: PayoutStatus;
  created_at: string;
  processed_at: string | null;
};

export type PointPackage = {
  id: string;
  points: number;
  price: number;
  bonus: number;
  label: { KR: string; EN: string };
  popular?: boolean;
};

export const POINT_PACKAGES: PointPackage[] = [
  {
    id: 'pkg-10',
    points: 10000,
    price: 10,
    bonus: 0,
    label: { KR: '스타터', EN: 'Starter' },
  },
  {
    id: 'pkg-50',
    points: 50000,
    price: 50,
    bonus: 5000,
    label: { KR: '스탠다드', EN: 'Standard' },
    popular: true,
  },
  {
    id: 'pkg-100',
    points: 100000,
    price: 100,
    bonus: 15000,
    label: { KR: '프리미엄', EN: 'Premium' },
  },
];

export const COMMISSION_RATE = 0.15;
export const EARLY_BIRD_COMMISSION_RATE = 0.10;
export const EARLY_BIRD_CUTOFF_DATE = '2026-12-31T23:59:59Z';

export const STUDENT_WALLET_ID = 'a0000000-0000-4000-8000-000000000001';
export const TUTOR_WALLET_ID = 'a0000000-0000-4000-8000-000000000002';
