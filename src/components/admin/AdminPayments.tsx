import { useEffect, useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { supabase } from '@/lib/supabase';

type Props = { uiLang: UiLang };

type Tx = {
  id: string;
  amount: number;
  type: string;
  created_at: string;
  description: string | null;
};

export default function AdminPayments({ uiLang }: Props) {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('point_transactions')
        .select('id, amount, type, created_at, description')
        .order('created_at', { ascending: false })
        .limit(50);
      setTxs((data ?? []) as Tx[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3.5">{t('admin', 'txDate', uiLang)}</th>
              <th className="px-5 py-3.5">{t('admin', 'txType', uiLang)}</th>
              <th className="px-5 py-3.5">{t('admin', 'txDesc', uiLang)}</th>
              <th className="px-5 py-3.5 text-right">{t('admin', 'txAmount', uiLang)}</th>
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-ink-400">
                  <CreditCard className="mx-auto mb-3 h-8 w-8 text-ink-300" />
                  {t('admin', 'noTransactions', uiLang)}
                </td>
              </tr>
            ) : (
              txs.map((tx) => {
                const positive = tx.amount >= 0;
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/40"
                  >
                    <td className="px-5 py-4 text-ink-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          positive
                            ? 'bg-success-50 text-success-700'
                            : 'bg-error-50 text-error-700'
                        }`}
                      >
                        {tx.type || (positive ? 'charge' : 'spend')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-600">{tx.description ?? '—'}</td>
                    <td
                      className={`px-5 py-4 text-right font-bold ${
                        positive ? 'text-success-600' : 'text-error-600'
                      }`}
                    >
                      {positive ? '+' : ''}₩{Math.abs(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
