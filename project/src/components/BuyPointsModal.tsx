import { useState, useEffect, type ReactNode } from 'react';
import { X, Check, CreditCard, Wallet, Sparkles, Loader2, PartyPopper } from 'lucide-react';
import { POINT_PACKAGES } from '@/lib/wallet-types';
import { useWallet } from '@/lib/wallet-context';
import { t, type UiLang } from '@/i18n';

type Props = {
  open: boolean;
  onClose: () => void;
  uiLang: UiLang;
};

type Step = 'package' | 'payment' | 'processing' | 'success';

export default function BuyPointsModal({ open, onClose, uiLang }: Props) {
  const { buyPoints, studentWallet } = useWallet();
  const [step, setStep] = useState<Step>('package');
  const [selectedPkg, setSelectedPkg] = useState(POINT_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'portone'>('stripe');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('package');
      setSelectedPkg(POINT_PACKAGES[1]);
      setPaymentMethod('stripe');
      setErrorMsg(null);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handlePay = async () => {
    setStep('processing');
    setErrorMsg(null);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      await buyPoints(
        selectedPkg.id,
        paymentMethod === 'stripe' ? 'Stripe' : paymentMethod === 'paypal' ? 'PayPal' : 'PortOne',
      );
      setStep('success');
    } catch (err) {
      console.error('purchase failed', err);
      setErrorMsg(
        uiLang === 'KR'
          ? '결제를 완료할 수 없습니다. 다시 시도해 주세요.'
          : 'We could not complete the payment. Please try again.',
      );
      setStep('payment');
    }
  };

  const totalPoints = selectedPkg.points + selectedPkg.bonus;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-overlay-in bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-fade-up overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-brand-500 text-white">
              <Wallet className="h-5 w-5" />
            </span>
            <h2 className="font-display text-lg font-bold text-ink-900">{t('wallet', 'buyPoints', uiLang)}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100"
            aria-label={t('wallet', 'close', uiLang)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current balance */}
        {studentWallet && (
          <div className="bg-gradient-to-r from-primary-50 to-brand-50 px-5 py-3">
            <p className="text-sm text-ink-600">
              {t('wallet', 'currentBalance', uiLang)}:{' '}
              <span className="font-bold text-primary-700">
                {studentWallet.balance.toLocaleString()} {t('wallet', 'points', uiLang)}
              </span>
            </p>
          </div>
        )}

        {/* Step: Package selection */}
        {step === 'package' && (
          <div className="p-5">
            <p className="mb-3 text-sm font-semibold text-ink-700">{t('wallet', 'choosePackage', uiLang)}</p>
            <div className="space-y-2.5">
              {POINT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                    selectedPkg.id === pkg.id
                      ? 'border-primary-500 bg-primary-50/50 shadow-soft'
                      : 'border-ink-100 bg-white hover:border-ink-200'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-4 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {t('wallet', 'popular', uiLang)}
                    </span>
                  )}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      selectedPkg.id === pkg.id ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-500'
                    }`}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-base font-bold text-ink-900">
                      {pkg.label[uiLang]} · ${pkg.price}
                    </p>
                    <p className="text-sm text-ink-500">
                      {pkg.points.toLocaleString()} {t('wallet', 'points', uiLang)}
                      {pkg.bonus > 0 && (
                        <span className="ml-1.5 font-semibold text-accent-600">
                          + {pkg.bonus.toLocaleString()} {t('wallet', 'bonus', uiLang)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                      selectedPkg.id === pkg.id ? 'border-primary-600 bg-primary-600' : 'border-ink-200'
                    }`}
                  >
                    {selectedPkg.id === pkg.id && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setStep('payment')} className="btn-primary mt-5 w-full">
              {t('wallet', 'paymentMethod', uiLang)}
            </button>
          </div>
        )}

        {/* Step: Payment method */}
        {step === 'payment' && (
          <div className="p-5">
            {errorMsg && (
              <div className="mb-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                {errorMsg}
              </div>
            )}
            <div className="mb-4 rounded-2xl border border-ink-100 bg-ink-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">{t('wallet', 'choosePackage', uiLang)}</span>
                <span className="font-bold text-ink-900">
                  {totalPoints.toLocaleString()} {t('wallet', 'points', uiLang)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm text-ink-600">{t('wallet', 'paymentMethod', uiLang)}</span>
                <span className="font-bold text-primary-700">${selectedPkg.price}</span>
              </div>
            </div>

            <p className="mb-3 text-sm font-semibold text-ink-700">{t('wallet', 'paymentMethod', uiLang)}</p>
            <div className="space-y-2.5">
              {[
                { id: 'stripe' as const, label: 'Stripe', desc: 'Visa, Mastercard, AMEX', color: 'bg-[#635BFF]' },
                { id: 'paypal' as const, label: 'PayPal', desc: 'PayPal Balance / Card', color: 'bg-[#003087]' },
                { id: 'portone' as const, label: 'PortOne', desc: '카카오페이, 네이버페이, 토스', color: 'bg-[#1AE4B6]' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-4 transition-all ${
                    paymentMethod === m.id ? 'border-primary-500 bg-primary-50/50' : 'border-ink-100 hover:border-ink-200'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${m.color}`}>
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-ink-900">{m.label}</p>
                    <p className="text-xs text-ink-500">{m.desc}</p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      paymentMethod === m.id ? 'border-primary-600 bg-primary-600' : 'border-ink-200'
                    }`}
                  >
                    {paymentMethod === m.id && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 flex gap-2.5">
              <button onClick={() => setStep('package')} className="btn-outline flex-1">
                {t('wallet', 'close', uiLang)}
              </button>
              <button onClick={handlePay} className="btn-primary flex-[2]">
                {t('wallet', 'payNow', uiLang)} · ${selectedPkg.price}
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center px-5 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            <p className="mt-4 text-sm font-semibold text-ink-700">{t('wallet', 'processing', uiLang)}</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <PartyPopper className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-ink-900">{t('wallet', 'paymentSuccess', uiLang)}</h3>
            <p className="mt-2 text-sm text-ink-500">
              {totalPoints.toLocaleString()} {t('wallet', 'pointsAdded', uiLang)}
            </p>
            <button onClick={onClose} className="btn-primary mt-6 w-full">
              {t('wallet', 'close', uiLang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalPortal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
