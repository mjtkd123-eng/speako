import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CreditCard,
  Globe,
  Shield,
  ShieldOff,
  ArrowLeft,
} from 'lucide-react';
import { t, type UiLang } from '@/i18n';

export type AdminPage = 'dashboard' | 'tutors' | 'students' | 'payments';

type Props = {
  uiLang: UiLang;
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  adminMode: boolean;
  onToggleAdmin: () => void;
  onBackToSite: () => void;
  children: ReactNode;
};

const MENU: { key: AdminPage; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'tutors', icon: UserCheck },
  { key: 'students', icon: Users },
  { key: 'payments', icon: CreditCard },
];

export default function AdminLayout({
  uiLang,
  activePage,
  onNavigate,
  adminMode,
  onToggleAdmin,
  onBackToSite,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-200 bg-white lg:flex">
        <SidebarContent
          uiLang={uiLang}
          activePage={activePage}
          onNavigate={onNavigate}
          onBackToSite={onBackToSite}
        />
      </aside>

      {/* Mobile sidebar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center border-t border-ink-200 bg-white lg:hidden">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-semibold transition-colors ${
                active ? 'text-primary-600' : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              {t('admin', item.key, uiLang)}
            </button>
          );
        })}
      </div>

      {/* Main area */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-200 bg-white/90 px-5 backdrop-blur-lg sm:px-8">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-ink-900">
              {t('admin', activePage, uiLang)}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin mode toggle */}
            <button
              onClick={onToggleAdmin}
              className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                adminMode
                  ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                  : 'bg-ink-100 text-ink-500 ring-1 ring-ink-200'
              }`}
            >
              {adminMode ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
              {t('admin', 'adminMode', uiLang)}
              <span
                className={`ml-0.5 inline-block h-2 w-2 rounded-full ${
                  adminMode ? 'bg-primary-500' : 'bg-ink-300'
                }`}
              />
            </button>

            {/* Profile avatar */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 text-sm font-bold text-white">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-ink-800">Admin</p>
                <p className="text-xs text-ink-400">admin@speako.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-5 py-6 pb-24 sm:px-8 sm:pb-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  uiLang,
  activePage,
  onNavigate,
  onBackToSite,
}: {
  uiLang: UiLang;
  activePage: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onBackToSite: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-ink-100 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-brand-500 text-white shadow-soft">
          <Globe className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
            Speako
          </span>
          <span className="ml-1.5 rounded-md bg-ink-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            Admin
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Menu
        </p>
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-ink-400'}`} />
              {t('admin', item.key, uiLang)}
            </button>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="border-t border-ink-100 p-4">
        <button
          onClick={onBackToSite}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('admin', 'backToSite', uiLang)}
        </button>
      </div>
    </>
  );
}
