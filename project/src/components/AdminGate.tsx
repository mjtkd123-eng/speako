import { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';
import { t, type UiLang } from '@/i18n';

type Props = {
  uiLang: UiLang;
  onSubmit: (password: string) => boolean | Promise<boolean>;
  onClose: () => void;
};

export default function AdminGate({ uiLang, onSubmit, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    try {
      const ok = await onSubmit(password);
      if (!ok) {
        setError(true);
        setPassword('');
      }
    } catch {
      setError(true);
      setPassword('');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">
                {t('admin', 'gateTitle', uiLang)}
              </h2>
              <p className="text-sm text-ink-500">{t('admin', 'gateDesc', uiLang)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">
              {t('admin', 'gatePassword', uiLang)}
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                error
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-ink-200 focus:border-primary-500'
              }`}
              placeholder="••••••••"
            />
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {t('admin', 'gateError', uiLang)}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100"
            >
              {t('admin', 'gateCancel', uiLang)}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              {t('admin', 'gateSubmit', uiLang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
