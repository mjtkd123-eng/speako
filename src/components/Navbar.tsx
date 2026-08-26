import { useEffect, useRef, useState } from 'react';
import {
  Globe,
  Menu,
  X,
  GraduationCap,
  Wallet,
  ArrowRight,
  Shield,
  ShieldOff,
  LayoutDashboard,
} from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import WalletBadge from '@/components/WalletBadge';
import AuthModal from '@/components/AuthModal';

type Props = {
  selectedLang: string;
  onSelectLang: (code: string) => void;
  uiLang: UiLang;
  onUiLangChange: (lang: UiLang) => void;
  onBuyPoints: () => void;
  onNavigatePayout: () => void;
  onBecomeTutor: () => void;
  adminMode: boolean;
  onToggleAdmin: () => void;
  onNavigateAdmin: () => void;
};

export default function Navbar({
  uiLang,
  onUiLangChange,
  onBuyPoints,
  onNavigatePayout,
  onBecomeTutor,
  adminMode,
  onToggleAdmin,
  onNavigateAdmin,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authOpen, setAuthOpen] = useState(false);

  const navLinks = [
    { href: '#tutors', label: t('nav', 'findTutor', uiLang), action: null as null | 'become-tutor' },
    { href: '#group', label: t('nav', 'groupClass', uiLang), action: null },
    { href: '#become-tutor', label: t('nav', 'becomeTutor', uiLang), action: 'become-tutor' as const },
    { href: '#/community', label: t('nav', 'community', uiLang), action: null },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-ink-100 bg-white/85 backdrop-blur-lg shadow-soft'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-5 sm:px-6 lg:h-[72px] lg:px-8">
          {/* Logo */}
          <a href="#" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-brand-500 text-white shadow-soft">
              <Globe className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">
              Speako
            </span>
          </a>

          {/* Desktop nav links — always show from sm up */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 sm:flex">
            {navLinks.map((link) =>
              link.action === 'become-tutor' ? (
                <button
                  key={link.href}
                  type="button"
                  onClick={onBecomeTutor}
                  className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:px-3.5"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:px-3.5"
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>

          {/* Desktop right: auth toggle + flags */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {import.meta.env.DEV && (
              <>
                <button
                  onClick={onToggleAdmin}
                  title={adminMode ? 'Admin Mode ON' : 'Admin Mode OFF'}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all ${
                    adminMode
                      ? 'bg-ink-900 text-white'
                      : 'border border-ink-200 text-ink-400 hover:bg-ink-100 hover:text-ink-700'
                  }`}
                >
                  {adminMode ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                </button>
                {adminMode && (
                  <button
                    onClick={onNavigateAdmin}
                    className="flex items-center gap-1.5 rounded-full bg-primary-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </button>
                )}
              </>
            )}

            <WalletBadge uiLang={uiLang} onClick={onBuyPoints} />

            {/* Signup / Login toggle */}
            <div
              className="flex items-center rounded-full border border-ink-200 bg-white/80 p-0.5 shadow-sm"
              role="group"
              aria-label="Auth"
            >
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setAuthOpen(true);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  authMode === 'signup'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {t('nav', 'signup', uiLang)}
              </button>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthOpen(true);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  authMode === 'login'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {t('nav', 'login', uiLang)}
              </button>
            </div>

            {/* KR / EN flag toggle */}
            <div
              className="flex items-center gap-0.5 rounded-full border border-ink-200 bg-white/80 p-0.5 shadow-sm"
              role="group"
              aria-label="UI language"
            >
              <button
                onClick={() => onUiLangChange('KR')}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-base leading-none transition-all ${
                  uiLang === 'KR' ? 'bg-primary-50 ring-1 ring-primary-300' : 'opacity-55 hover:opacity-100'
                }`}
                aria-label="한국어"
                title="한국어"
              >
                🇰🇷
              </button>
              <button
                onClick={() => onUiLangChange('EN')}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-base leading-none transition-all ${
                  uiLang === 'EN' ? 'bg-primary-50 ring-1 ring-primary-300' : 'opacity-55 hover:opacity-100'
                }`}
                aria-label="English"
                title="English"
              >
                🇺🇸
              </button>
            </div>
          </div>

          {/* Mobile right cluster */}
          <div className="ml-auto flex items-center gap-1.5 sm:hidden">
            <div
              className="flex shrink-0 items-center gap-0.5 rounded-full border border-ink-200 bg-white/80 p-0.5 shadow-sm"
              role="group"
              aria-label="UI language"
            >
              <button
                onClick={() => onUiLangChange('KR')}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-base leading-none transition-all ${
                  uiLang === 'KR' ? 'bg-primary-50 ring-1 ring-primary-300' : 'opacity-55 hover:opacity-100'
                }`}
                aria-label="한국어"
                title="한국어"
              >
                🇰🇷
              </button>
              <button
                onClick={() => onUiLangChange('EN')}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-base leading-none transition-all ${
                  uiLang === 'EN' ? 'bg-primary-50 ring-1 ring-primary-300' : 'opacity-55 hover:opacity-100'
                }`}
                aria-label="English"
                title="English"
              >
                🇺🇸
              </button>
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-700 transition-colors hover:bg-ink-100"
              aria-label={t('nav', 'openMenu', uiLang)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out drawer */}
      {drawerOpen && (
        <MobileDrawer
          onClose={() => setDrawerOpen(false)}
          uiLang={uiLang}
          onUiLangChange={onUiLangChange}
          authMode={authMode}
          onAuthModeChange={setAuthMode}
          onNavigatePayout={onNavigatePayout}
          onBecomeTutor={() => {
            setDrawerOpen(false);
            onBecomeTutor();
          }}
          adminMode={adminMode}
          onToggleAdmin={onToggleAdmin}
          onNavigateAdmin={() => {
            setDrawerOpen(false);
            onNavigateAdmin();
          }}
          onOpenAuth={(mode) => {
            setDrawerOpen(false);
            setAuthMode(mode);
            setAuthOpen(true);
          }}
        />
      )}
      <AuthModal
        uiLang={uiLang}
        open={authOpen}
        mode={authMode === 'login' ? 'login' : 'signup'}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}

/* ---------- Drawer ---------- */

type DrawerProps = {
  onClose: () => void;
  uiLang: UiLang;
  onUiLangChange: (lang: UiLang) => void;
  authMode: 'signup' | 'login';
  onAuthModeChange: (mode: 'signup' | 'login') => void;
  onNavigatePayout: () => void;
  onBecomeTutor: () => void;
  adminMode: boolean;
  onToggleAdmin: () => void;
  onNavigateAdmin: () => void;
  onOpenAuth: (mode: 'signup' | 'login') => void;
};

function MobileDrawer({
  onClose,
  uiLang,
  onUiLangChange,
  authMode,
  onAuthModeChange,
  onNavigatePayout,
  onBecomeTutor,
  adminMode,
  onToggleAdmin,
  onNavigateAdmin,
  onOpenAuth,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] sm:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 animate-overlay-in bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm animate-slide-in-right flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <a href="#" className="flex items-center gap-2" onClick={onClose}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-brand-500 text-white">
              <Globe className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
              Speako
            </span>
          </a>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100"
            aria-label={t('nav', 'closeMenu', uiLang)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* ===== Top: Auth toggle ===== */}
          <div className="animate-drawer-item flex justify-center">
            <div
              className="flex w-full items-center rounded-full border border-ink-200 bg-white p-1 shadow-sm"
              role="group"
              aria-label="Auth"
            >
              <button
                onClick={() => onOpenAuth('signup')}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  authMode === 'signup'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {t('nav', 'signup', uiLang)}
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  authMode === 'login'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {t('nav', 'login', uiLang)}
              </button>
            </div>
          </div>

          {/* ===== KR / EN flag toggle in drawer ===== */}
          <div className="mt-4 flex items-center justify-center">
            <div
              className="flex items-center gap-0.5 rounded-full border border-ink-200 bg-white p-0.5 shadow-sm"
              role="group"
              aria-label="UI language"
            >
              <button
                onClick={() => onUiLangChange('KR')}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-lg leading-none transition-all ${
                  uiLang === 'KR' ? 'bg-primary-50 ring-1 ring-primary-300' : 'opacity-55 hover:opacity-100'
                }`}
                aria-label="한국어"
              >
                🇰🇷
              </button>
              <button
                onClick={() => onUiLangChange('EN')}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-lg leading-none transition-all ${
                  uiLang === 'EN' ? 'bg-primary-50 ring-1 ring-primary-300' : 'opacity-55 hover:opacity-100'
                }`}
                aria-label="English"
              >
                🇺🇸
              </button>
            </div>
          </div>

          {/* ===== Menu links ===== */}
          <div className="mt-6 space-y-1.5">
            <a
              href="#tutors"
              onClick={onClose}
              className="block rounded-xl px-3.5 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
            >
              {t('nav', 'findTutor', uiLang)}
            </a>
            <a
              href="#group"
              onClick={onClose}
              className="block rounded-xl px-3.5 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
            >
              {t('nav', 'groupClass', uiLang)}
            </a>
            <button
              type="button"
              onClick={onBecomeTutor}
              className="block w-full rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
            >
              {t('nav', 'becomeTutor', uiLang)}
            </button>
            <a
              href="#/community"
              onClick={onClose}
              className="block rounded-xl px-3.5 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
            >
              {t('nav', 'community', uiLang)}
            </a>
          </div>

          {/* ===== Admin entry (mobile drawer) — dev mode only ===== */}
          {import.meta.env.DEV && (
            <div className="mt-4">
              <button
                onClick={onToggleAdmin}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  adminMode
                    ? 'bg-ink-900 text-white hover:bg-ink-800'
                    : 'border border-ink-200 text-ink-500 hover:bg-ink-100'
                }`}
              >
                {adminMode ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                {adminMode ? 'Admin Mode ON' : 'Admin Mode'}
              </button>
              {adminMode && (
                <button
                  onClick={onNavigateAdmin}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-700"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </button>
              )}
            </div>
          )}

          {/* ===== Highlight: Become a tutor ===== */}
          <div className="mt-6">
            <button
              onClick={() => {
                onClose();
                onNavigatePayout();
              }}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              <Wallet className="h-4 w-4" />
              {t('wallet', 'payoutPage', uiLang)}
            </button>
            <button
              type="button"
              onClick={onBecomeTutor}
              className="group relative block w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-brand-600 p-5 text-left text-white shadow-lift transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <GraduationCap className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-50">
                    {t('drawer', 'tutorRecruit', uiLang)}
                  </p>
                  <h3 className="mt-0.5 font-display text-lg font-bold leading-tight">
                    {t('drawer', 'tutorCtaTitle', uiLang)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-primary-50">
                    {t('drawer', 'tutorCtaDesc', uiLang)}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-primary-700 transition-transform group-hover:translate-x-0.5">
                    {t('drawer', 'tutorCtaBtn', uiLang)}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
