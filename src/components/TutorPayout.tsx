import { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Clock,
  Percent,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Loader2,
  Crown,
  Info,
} from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { t, type UiLang } from '@/i18n';
import { COMMISSION_RATE, EARLY_BIRD_COMMISSION_RATE } from '@/lib/wallet-types';
import { TUTOR_SETTLEMENTS_URL } from '@/lib/store-url';

type Props = {
  uiLang: UiLang;
  onBack: () => void;
};

export default function TutorPayout({ uiLang, onBack }: Props) {
  const { tutorWallet, payouts, requestPayout, loading } = useWallet();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'paypal' | 'bank'>('paypal');
  const [methodDetail, setMethodDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableBalance = tutorWallet?.balance ?? 0;
  const totalEarned = tutorWallet?.total_earned ?? 0;
  const totalCommission = tutorWallet?.total_commission ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) {
      setErrorMsg(t('wallet', 'invalidAmount', uiLang));
      return;
    }
    if (amt > availableBalance) {
      setErrorMsg(t('wallet', 'insufficientBalance', uiLang));
      return;
    }
    if (!methodDetail.trim()) {
      setErrorMsg(
        method === 'paypal' ? t('wallet', 'enterPaypalEmail', uiLang) : t('wallet', 'enterBankInfo', uiLang),
      );
      return;
    }

    setSubmitting(true);
    try {
      await requestPayout(amt, method, methodDetail.trim());
      setSuccessMsg(t('wallet', 'payoutSuccess', uiLang));
      setAmount('');
      setMethodDetail('');
    } catch (err) {
      console.error('payout request failed', err);
      setErrorMsg(
        uiLang === 'KR'
          ? '지급 신얭을 처리하지 못했습니다. 지금액을 확인한 후 다시 시도해 주세요.'
          : 'We could not submit your payout request. Check the amount and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-warning-100 text-warning-700',
    approved: 'bg-brand-100 text-brand-700',
    completed: 'bg-success-100 text-success-700',
    rejected: 'bg-error-100 text-error-700',
  };

  return (
    <div className="min-h-screen bg-ink-50/40 pt-16 lg:pt-[72px]">
      <div className="container-page py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-ink-100"
            aria-label={t('wallet', 'backToHome', uiLang)}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">{t('wallet', 'payoutPage', uiLang)}</h1>
            <p className="text-sm text-ink-500">{t('wallet', 'tutorDashboard', uiLang)}</p>
          </div>
        </div>

        <a
          href={TUTOR_SETTLEMENTS_URL}
          className="mb-6 flex items-center justify-between rounded-2xl border border-primary-200 bg-primary-50 px-5 py-4 transition-colors hover:bg-primary-100"
        >
          <div>
            <p className="font-display text-lg font-bold text-ink-900">{t('wallet', 'contentSettlements', uiLang)}</p>
            <p className="mt-1 text-sm text-ink-500">{t('wallet', 'contentSettlementsDesc', uiLang)}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-primary-700" />
        </a>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={TrendingUp}
            label={t('wallet', 'totalEarnings', uiLang)}
            value={`${totalEarned.toLocaleString()}`}
            unit={t('wallet', 'points', uiLang)}
            color="primary"
          />
          <StatCard
            icon={Wallet}
            label={t('wallet', 'availableBalance', uiLang)}
            value={`${availableBalance.toLocaleString()}`}
            unit={t('wallet', 'points', uiLang)}
            color="brand"
          />
          <StatCard
            icon={Percent}
            label={t('wallet', 'platformFees', uiLang)}
            value={`${totalCommission.toLocaleString()}`}
            unit={t('wallet', 'points', uiLang)}
            color="accent"
          />
        </div>

        {/* Early Bird / Commission Badge */}
        <div
          className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm ${
            tutorWallet?.is_early_bird
              ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900'
              : 'border-ink-200 bg-ink-50 text-ink-700'
          }`}
        >
          {tutorWallet?.is_early_bird ? (
            <Crown className="h-5 w-5 shrink-0 text-amber-500" />
          ) : (
            <Percent className="h-4 w-4 shrink-0 text-ink-400" />
          )}
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="font-semibold">
              {tutorWallet?.is_early_bird
                ? t('wallet', 'earlyBirdBadge', uiLang)
                : t('wallet', 'standardRateBadge', uiLang)}
            </span>
            {tutorWallet?.is_early_bird && (
              <span className="flex items-center gap-1 text-xs text-amber-700/80">
                <Info className="h-3 w-3" />
                {t('wallet', 'earlyBirdTooltip', uiLang)}
              </span>
            )}
          </div>
        </div>

        {/* Commission info banner */}
        <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Percent className="h-4 w-4 shrink-0" />
          <span>
            {t('wallet', 'commissionRate', uiLang)}:{' '}
            {((tutorWallet?.is_early_bird ? EARLY_BIRD_COMMISSION_RATE : COMMISSION_RATE) * 100).toFixed(0)}% ·{' '}
            {uiLang === 'KR'
              ? '수업 완료 시 수익에서 자동 차감됩니다'
              : 'Automatically deducted from lesson earnings upon completion'}
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* Payout form */}
          <div className="lg:col-span-2">
            <div className="card-surface p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">{t('wallet', 'requestPayout', uiLang)}</h2>

              {successMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Amount */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                    {t('wallet', 'payoutAmount', uiLang)}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={t('wallet', 'enterAmount', uiLang)}
                      className="h-12 w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-4 pr-20 text-sm font-semibold text-ink-900 transition-colors hover:border-primary-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-400">
                      {t('wallet', 'points', uiLang)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-400">
                    {t('wallet', 'availableBalance', uiLang)}: {availableBalance.toLocaleString()} {t('wallet', 'points', uiLang)}
                  </p>
                </div>

                {/* Method */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                    {t('wallet', 'payoutMethod', uiLang)}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMethod('paypal')}
                      className={`flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                        method === 'paypal' ? 'border-primary-500 bg-primary-50/50 text-primary-700' : 'border-ink-100 text-ink-600 hover:border-ink-200'
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('bank')}
                      className={`flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                        method === 'bank' ? 'border-primary-500 bg-primary-50/50 text-primary-700' : 'border-ink-100 text-ink-600 hover:border-ink-200'
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      {t('wallet', 'method_bank', uiLang)}
                    </button>
                  </div>
                </div>

                {/* Method detail */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                    {method === 'paypal' ? t('wallet', 'paypalEmail', uiLang) : t('wallet', 'bankAccount', uiLang)}
                  </label>
                  <input
                    type={method === 'paypal' ? 'email' : 'text'}
                    value={methodDetail}
                    onChange={(e) => setMethodDetail(e.target.value)}
                    placeholder={method === 'paypal' ? t('wallet', 'enterPaypalEmail', uiLang) : t('wallet', 'enterBankInfo', uiLang)}
                    className="h-12 w-full rounded-xl border border-ink-200 bg-ink-50/50 px-4 text-sm text-ink-900 transition-colors hover:border-primary-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t('wallet', 'requestPayout', uiLang)}
                </button>
              </form>
            </div>
          </div>

          {/* Payout history */}
          <div className="lg:col-span-3">
            <div className="card-surface overflow-hidden">
              <div className="border-b border-ink-100 px-5 py-4">
                <h2 className="font-display text-lg font-bold text-ink-900">{t('wallet', 'payoutHistory', uiLang)}</h2>
              </div>
              {payouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                  <Clock className="h-10 w-10 text-ink-300" />
                  <p className="mt-3 text-sm text-ink-400">{t('wallet', 'noPayouts', uiLang)}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                        <th className="px-5 py-3">{t('wallet', 'date', uiLang)}</th>
                        <th className="px-5 py-3">{t('wallet', 'amount', uiLang)}</th>
                        <th className="px-5 py-3">{t('wallet', 'method', uiLang)}</th>
                        <th className="px-5 py-3">{t('wallet', 'status', uiLang)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id} className="border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/30">
                          <td className="px-5 py-3.5 text-ink-600">
                            {new Date(p.created_at).toLocaleDateString(uiLang === 'KR' ? 'ko-KR' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-ink-900">
                            {p.amount.toLocaleString()} {t('wallet', 'points', uiLang)}
                          </td>
                          <td className="px-5 py-3.5 text-ink-600">
                            {p.method === 'paypal' ? t('wallet', 'method_paypal', uiLang) : t('wallet', 'method_bank', uiLang)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusColor[p.status]}`}>
                              {t('wallet', `status_${p.status}` as const, uiLang)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  unit: string;
  color: 'primary' | 'brand' | 'accent';
}) {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    brand: 'bg-brand-100 text-brand-600',
    accent: 'bg-accent-100 text-accent-600',
  };
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
          <p className="mt-0.5 font-display text-xl font-extrabold text-ink-900">
            {value} <span className="text-sm font-medium text-ink-400">{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
