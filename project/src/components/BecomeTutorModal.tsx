import { useEffect, useState } from 'react';
import { X, GraduationCap, Loader2 } from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { useAuth, type SocialProvider } from '@/lib/auth-context';
import { TUTOR_ONBOARDING_HASH } from '@/lib/tutor-onboarding';

type Props = {
  uiLang: UiLang;
  open: boolean;
  onClose: () => void;
};

const PROVIDERS: {
  id: SocialProvider;
  labelKey: 'google' | 'kakao' | 'apple' | 'facebook';
  bg: string;
  text: string;
  icon: string;
}[] = [
  { id: 'google', labelKey: 'google', bg: 'bg-white border border-ink-200 hover:bg-ink-50', text: 'text-ink-800', icon: 'G' },
  { id: 'kakao', labelKey: 'kakao', bg: 'bg-[#FEE500] hover:brightness-95', text: 'text-[#191919]', icon: 'K' },
  { id: 'apple', labelKey: 'apple', bg: 'bg-ink-900 hover:bg-ink-800', text: 'text-white', icon: '' },
  { id: 'facebook', labelKey: 'facebook', bg: 'bg-[#1877F2] hover:brightness-95', text: 'text-white', icon: 'f' },
];

export default function BecomeTutorModal({ uiLang, open, onClose }: Props) {
  const { signInWithSocial, isLoggedIn } = useAuth();
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setBusy(null);
      setError('');
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  async function handleSocial(provider: SocialProvider) {
    setError('');
    setBusy(provider);
    const { error: err } = await signInWithSocial(provider, TUTOR_ONBOARDING_HASH);
    if (err) {
      setError(err);
      setBusy(null);
    }
  }

  function continueToOnboarding() {
    onClose();
    window.location.hash = TUTOR_ONBOARDING_HASH;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => !busy && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="become-tutor-auth-title"
        className="relative z-[101] w-full max-w-md animate-fade-up rounded-3xl border border-ink-100 bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          onClick={onClose}
          disabled={!!busy}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-40"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-brand-500 text-white shadow-soft">
            <GraduationCap className="h-7 w-7" />
          </span>
          <h2 id="become-tutor-auth-title" className="mt-4 font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
            {t('tutorAuth', 'title', uiLang)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            {t('tutorAuth', 'desc', uiLang)}
          </p>
        </div>

        {isLoggedIn && (
          <button
            type="button"
            onClick={continueToOnboarding}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-700 active:scale-[0.98]"
          >
            {t('tutorAuth', 'continueApply', uiLang)}
          </button>
        )}

        <div className={`space-y-2.5 ${isLoggedIn ? 'mt-4' : 'mt-6'}`}>
          {isLoggedIn && (
            <p className="mb-1 text-center text-xs font-medium text-ink-400">
              {t('tutorAuth', 'orSwitchAccount', uiLang)}
            </p>
          )}
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={!!busy}
              onClick={() => handleSocial(p.id)}
              className={`flex w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 ${p.bg} ${p.text}`}
            >
              {busy === p.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : p.id === 'apple' ? (
                <AppleMark />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center text-base font-black leading-none">
                  {p.icon}
                </span>
              )}
              {t('tutorAuth', p.labelKey, uiLang)}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-error-50 px-3 py-2 text-center text-xs text-error-700">{error}</p>
        )}

        <p className="mt-5 text-center text-[11px] leading-relaxed text-ink-400">
          {t('tutorAuth', 'legal', uiLang)}
        </p>
      </div>
    </div>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.2 3.02-.9.95-2.17 1.55-3.3 1.45-.1-1.1.4-2.25 1.2-3.1.9-.95 2.25-1.55 3.3-1.37zM20.5 17.2c-.55 1.25-.82 1.8-1.53 2.9-.99 1.55-2.38 3.48-4.1 3.5-1.53.02-1.93-.98-4.02-.97-2.08.01-2.53.99-4.06.97-1.72-.02-3.04-1.76-4.03-3.3C.98 17.3-.5 12.7 1.3 9.55c1.14-2 2.95-3.17 4.66-3.17 1.74 0 2.83.98 4.27.98 1.4 0 2.25-1 4.27-.98 1.5.02 3.1.88 4.1 2.4-3.6 1.95-3.02 7.05.9 8.42z" />
    </svg>
  );
}
