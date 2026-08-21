import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { useAuth, type SocialProvider } from '@/lib/auth-context';

type Mode = 'login' | 'signup';

type Props = {
  uiLang: UiLang;
  open: boolean;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onClose: () => void;
};

const SOCIAL: {
  id: SocialProvider;
  labelKey: 'kakao' | 'facebook' | 'instagram' | 'google' | 'apple';
  className: string;
}[] = [
  { id: 'kakao', labelKey: 'kakao', className: 'bg-[#FEE500] text-[#191919] hover:brightness-95' },
  { id: 'facebook', labelKey: 'facebook', className: 'bg-[#1877F2] text-white hover:brightness-95' },
  { id: 'instagram', labelKey: 'instagram', className: 'bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:brightness-95' },
  { id: 'google', labelKey: 'google', className: 'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50' },
  { id: 'apple', labelKey: 'apple', className: 'bg-black text-white hover:bg-ink-800' },
];

export default function AuthModal({ uiLang, open, mode, onModeChange, onClose }: Props) {
  const { signInWithSocial, signInWithEmail, signUpWithEmail } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setBusy(false);
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

  async function oauth(provider: SocialProvider) {
    setBusy(true);
    setError('');
    const { error: err } = await signInWithSocial(provider, '#');
    if (err) {
      setError(err);
      setBusy(false);
    }
  }

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const { error: err } = await signInWithEmail(
      String(form.get('email') ?? ''),
      String(form.get('password') ?? ''),
    );
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  }

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('passwordConfirm') ?? '');
    if (password !== confirm) {
      setBusy(false);
      setError(uiLang === 'KR' ? '비밀번호가 일치하지 않습니다.' : 'Passwords do not match.');
      return;
    }
    const { error: err } = await signUpWithEmail({
      email: String(form.get('email') ?? ''),
      password,
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
    });
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[101] w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl animate-fade-up sm:rounded-3xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex gap-2 rounded-2xl bg-ink-100 p-1">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}
          >
            {t('nav', 'login', uiLang)}
          </button>
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}
          >
            {t('nav', 'signup', uiLang)}
          </button>
        </div>

        {mode === 'login' ? (
          <form className="space-y-3" onSubmit={onLogin} autoComplete="on">
            <div className="space-y-2.5">
              {SOCIAL.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={busy}
                  onClick={() => oauth(p.id)}
                  className={`flex h-12 w-full items-center justify-center rounded-2xl text-base font-bold transition-all active:scale-[0.99] disabled:opacity-70 ${p.className}`}
                >
                  {t('tutorAuth', p.labelKey, uiLang)}
                </button>
              ))}
            </div>
            <p className="relative py-2 text-center text-xs text-ink-400">
              <span className="relative z-10 bg-white px-3">
                {uiLang === 'KR' ? '또는 이메일로 로그인' : 'or email'}
              </span>
            </p>
            <label className="block text-sm font-medium text-ink-700">
              {uiLang === 'KR' ? '이메일' : 'Email'}
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block text-sm font-medium text-ink-700">
              {uiLang === 'KR' ? '비밀번호' : 'Password'}
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-primary-500"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input name="remember" type="checkbox" defaultChecked className="h-4 w-4 accent-primary-600" />
              {uiLang === 'KR' ? '로그인 상태 유지' : 'Stay signed in'}
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary-600 font-bold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t('nav', 'login', uiLang)}
            </button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={onSignup} autoComplete="on">
            <label className="block text-sm font-medium text-ink-700">
              {uiLang === 'KR' ? '이메일' : 'Email'}
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block text-sm font-medium text-ink-700">
              {uiLang === 'KR' ? '비밀번호' : 'Password'}
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block text-sm font-medium text-ink-700">
              {uiLang === 'KR' ? '비밀번호 확인' : 'Confirm password'}
              <input
                name="passwordConfirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block text-sm font-medium text-ink-700">
              {uiLang === 'KR' ? '이름' : 'Name'}
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block text-sm font-medium text-ink-700">
              {uiLang === 'KR' ? '연락처' : 'Phone'}
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-primary-500"
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-ink-600">
              <input name="terms" type="checkbox" required className="mt-1 h-4 w-4 accent-primary-600" />
              {uiLang === 'KR'
                ? '이용약관 및 개인정보 처리방침에 동의합니다.'
                : 'I agree to the Terms and Privacy Policy.'}
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary-600 font-bold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t('nav', 'signup', uiLang)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
