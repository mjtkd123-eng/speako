import { Wallet } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { t, type UiLang } from '@/i18n';

type Props = {
  uiLang: UiLang;
  onClick: () => void;
};

export default function WalletBadge({ uiLang, onClick }: Props) {
  const { studentWallet, loading } = useWallet();

  const balance = studentWallet?.balance ?? 0;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/80 px-3 py-2 text-sm font-semibold text-ink-700 transition-all hover:border-primary-300 hover:bg-primary-50"
      aria-label={t('wallet', 'myWallet', uiLang)}
    >
      <Wallet className="h-4 w-4 text-primary-500" />
      <span className={loading ? 'animate-pulse' : ''}>
        {loading ? '...' : balance.toLocaleString()}
      </span>
      <span className="hidden text-xs font-medium text-ink-400 sm:inline">{t('wallet', 'points', uiLang)}</span>
    </button>
  );
}
