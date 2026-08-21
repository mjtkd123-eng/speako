import { useEffect, useState } from 'react';
import { Check, X, Loader2, ExternalLink, FileVideo } from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import {
  listApplications,
  updateApplicationStatus,
  type AdminApplication as Application,
} from '@/lib/admin-api';

type Props = { uiLang: UiLang };

export default function AdminTutors({ uiLang }: Props) {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setApps(await listApplications());
    } catch {
      setApps([]);
      setToast({ msg: t('admin', 'updateError', uiLang), ok: false });
      setTimeout(() => setToast(null), 2500);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, status);
      setToast({ msg: t('admin', 'updateSuccess', uiLang), ok: true });
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch {
      setToast({ msg: t('admin', 'updateError', uiLang), ok: false });
    } finally {
      setUpdatingId(null);
    }

    setTimeout(() => setToast(null), 2500);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lift animate-fade-up ${
            toast.ok ? 'bg-success-600 text-white' : 'bg-error-600 text-white'
          }`}
        >
          {toast.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3.5">{t('admin', 'colName', uiLang)}</th>
                <th className="px-5 py-3.5">{t('admin', 'colLanguage', uiLang)}</th>
                <th className="px-5 py-3.5">{t('admin', 'colDate', uiLang)}</th>
                <th className="px-5 py-3.5">{t('admin', 'colVideo', uiLang)}</th>
                <th className="px-5 py-3.5">{t('admin', 'colStatus', uiLang)}</th>
                <th className="px-5 py-3.5 text-right">{t('admin', 'colActions', uiLang)}</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-400">
                    {t('admin', 'noApplications', uiLang)}
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/40"
                  >
                    {/* Name + email */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-brand-400 text-sm font-bold text-white">
                          {app.applicant_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-800">{app.applicant_name}</p>
                          <p className="truncate text-xs text-ink-400">{app.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Language */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                        {app.teaches_language.toUpperCase()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-ink-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>

                    {/* Video link */}
                    <td className="px-5 py-4">
                      {app.video_url ? (
                        <a
                          href={app.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                        >
                          <FileVideo className="h-3.5 w-3.5" />
                          {uiLang === 'KR' ? '영상 보기' : 'Watch'}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} uiLang={uiLang} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateStatus(app.id, 'approved')}
                          disabled={updatingId === app.id || app.status === 'approved'}
                          className="inline-flex items-center gap-1 rounded-lg bg-success-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-success-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {updatingId === app.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          {t('admin', 'approve', uiLang)}
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, 'rejected')}
                          disabled={updatingId === app.id || app.status === 'rejected'}
                          className="inline-flex items-center gap-1 rounded-lg bg-error-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-error-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {updatingId === app.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                          {t('admin', 'reject', uiLang)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
