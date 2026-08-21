import { useEffect, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { supabase } from '@/lib/supabase';

type Props = { uiLang: UiLang };

type Student = {
  id: string;
  owner_name: string;
  balance: number;
  total_spent: number;
  created_at: string;
};

export default function AdminStudents({ uiLang }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('wallets')
        .select('id, owner_name, balance, total_spent, created_at')
        .eq('owner_type', 'student')
        .order('created_at', { ascending: false });
      setStudents((data ?? []) as Student[]);
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
                <th className="px-5 py-3.5">{t('admin', 'studentName', uiLang)}</th>
                <th className="px-5 py-3.5">{t('admin', 'studentEmail', uiLang)}</th>
                <th className="px-5 py-3.5">{t('admin', 'joinedDate', uiLang)}</th>
                <th className="px-5 py-3.5 text-right">{t('admin', 'txAmount', uiLang)}</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-ink-400">
                    <Users className="mx-auto mb-3 h-8 w-8 text-ink-300" />
                    {t('admin', 'noStudents', uiLang)}
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-brand-400 text-sm font-bold text-white">
                          {s.owner_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-ink-800">{s.owner_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-500">—</td>
                    <td className="px-5 py-4 text-ink-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-ink-700">
                      ₩{(s.total_spent || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}
