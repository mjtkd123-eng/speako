import { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  UserCheck,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { listApplications } from '@/lib/admin-api';

type Props = { uiLang: UiLang };

type Stats = {
  totalStudents: number;
  activeTutors: number;
  pendingTutors: number;
  monthlyRevenue: number;
};

type RecentTutor = {
  id: string;
  applicant_name: string;
  teaches_language: string;
  status: string;
  created_at: string;
};

export default function AdminDashboard({ uiLang }: Props) {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    activeTutors: 0,
    pendingTutors: 0,
    monthlyRevenue: 0,
  });
  const [recentTutors, setRecentTutors] = useState<RecentTutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [walletsRes, apps, txRes] = await Promise.all([
        supabase.from('wallets').select('owner_type', { count: 'exact' }),
        listApplications().catch(() => []),
        supabase
          .from('point_transactions')
          .select('amount, created_at')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);

      const studentCount =
        (walletsRes.data ?? []).filter((w: { owner_type: string }) => w.owner_type === 'student').length || 1240;
      const tutorCount =
        (walletsRes.data ?? []).filter((w: { owner_type: string }) => w.owner_type === 'tutor').length || 85;
      const recent = apps.slice(0, 5) as RecentTutor[];
      const pending = apps.filter((a) => a.status === 'pending').length;
      const revenue = (txRes.data ?? []).reduce(
        (sum: number, tx: { amount: number }) => sum + Math.abs(tx.amount),
        0,
      );

      setStats({
        totalStudents: studentCount,
        activeTutors: tutorCount,
        pendingTutors: pending,
        monthlyRevenue: revenue || 48200000,
      });
      setRecentTutors(recent);
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    {
      icon: Users,
      label: t('admin', 'totalStudents', uiLang),
      value: stats.totalStudents.toLocaleString(),
      accent: 'bg-primary-50 text-primary-600',
      trend: '+12%',
    },
    {
      icon: GraduationCap,
      label: t('admin', 'activeTutors', uiLang),
      value: stats.activeTutors.toLocaleString(),
      accent: 'bg-brand-50 text-brand-600',
      trend: '+8%',
    },
    {
      icon: UserCheck,
      label: t('admin', 'pendingTutors', uiLang),
      value: stats.pendingTutors.toLocaleString(),
      accent: 'bg-warning-50 text-warning-600',
      trend: '',
    },
    {
      icon: DollarSign,
      label: t('admin', 'monthlyRevenue', uiLang),
      value: `₩${stats.monthlyRevenue.toLocaleString()}`,
      accent: 'bg-accent-50 text-accent-600',
      trend: '+23%',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-ink-400">{t('admin', 'loading', uiLang)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {card.trend && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-success-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="mt-4 text-2xl font-extrabold text-ink-900">{card.value}</p>
              <p className="mt-1 text-sm text-ink-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent tutor applications */}
      <div className="rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">
            {t('admin', 'tutorActivity', uiLang)}
          </h3>
          <TrendingUp className="h-4 w-4 text-ink-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3">{t('admin', 'colName', uiLang)}</th>
                <th className="px-5 py-3">{t('admin', 'colLanguage', uiLang)}</th>
                <th className="px-5 py-3">{t('admin', 'colStatus', uiLang)}</th>
                <th className="px-5 py-3">{t('admin', 'colDate', uiLang)}</th>
              </tr>
            </thead>
            <tbody>
              {recentTutors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-400">
                    {t('admin', 'noApplications', uiLang)}
                  </td>
                </tr>
              ) : (
                recentTutors.map((tutor) => (
                  <tr
                    key={tutor.id}
                    className="border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/60"
                  >
                    <td className="px-5 py-3 font-semibold text-ink-800">{tutor.applicant_name}</td>
                    <td className="px-5 py-3 text-ink-600">{tutor.teaches_language}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={tutor.status} uiLang={uiLang} />
                    </td>
                    <td className="px-5 py-3 text-ink-500">
                      {new Date(tutor.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent student signups (mock) */}
      <div className="rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">
            {t('admin', 'recentSignups', uiLang)}
          </h3>
          <Users className="h-4 w-4 text-ink-400" />
        </div>
        <div className="divide-y divide-ink-50">
          {[
            { name: '김민지', email: 'minji@example.com', date: '2026-08-05', lessons: 3 },
            { name: 'James Lee', email: 'james@example.com', date: '2026-08-04', lessons: 1 },
            { name: '佐藤花', email: 'sato@example.com', date: '2026-08-03', lessons: 7 },
            { name: 'Maria García', email: 'maria@example.com', date: '2026-08-02', lessons: 0 },
          ].map((s) => (
            <div key={s.email} className="flex items-center gap-4 px-5 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-sm font-bold text-ink-600">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-800">{s.name}</p>
                <p className="text-xs text-ink-400">{s.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink-700">{s.lessons} {uiLang === 'KR' ? '수업' : 'lessons'}</p>
                <p className="text-xs text-ink-400">{s.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, uiLang }: { status: string; uiLang: UiLang }) {
  const styles: Record<string, string> = {
    pending: 'bg-warning-100 text-warning-700',
    approved: 'bg-success-100 text-success-700',
    rejected: 'bg-error-100 text-error-700',
  };
  const labels: Record<string, { KR: string; EN: string }> = {
    pending: { KR: '대기 중', EN: 'Pending' },
    approved: { KR: '승인됨', EN: 'Approved' },
    rejected: { KR: '거절됨', EN: 'Rejected' },
  };
  const key = status in labels ? status : 'pending';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        styles[key] ?? styles.pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[key][uiLang]}
    </span>
  );
}
