import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  BookOpen,
  CircleDollarSign,
  Clock3,
  Percent,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { REFUND_POLICY } from '@/lib/refund-policy';
import { TUTOR_ATTENDANCE_POLICY } from '@/lib/tutor-attendance-policy';
import {
  TUTOR_COMMISSION_POLICY,
  formatCommissionPercent,
} from '@/lib/tutor-commission-policy';

type Props = {
  uiLang: UiLang;
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

type Step = 'intro' | 'review';

export default function TutorGuideAckModal({ uiLang, open, onClose, onContinue }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [acked, setAcked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep('intro');
    setAcked(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (step === 'review') {
      scrollRef.current?.scrollTo({ top: 0 });
    }
  }, [step]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/45"
        aria-label={t('tutorGuideAck', 'close', uiLang)}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutor-guide-ack-title"
        className={`relative z-10 flex w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl ${
          step === 'review'
            ? 'h-[92vh] max-h-[92vh] max-w-2xl'
            : 'max-w-md sm:max-h-[90vh]'
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ink-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="tutor-guide-ack-title"
                className="font-display text-xl font-bold text-ink-900"
              >
                {step === 'intro'
                  ? t('tutorGuideAck', 'title', uiLang)
                  : t('tutorGuideAck', 'reviewTitle', uiLang)}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">
                {step === 'intro'
                  ? t('tutorGuideAck', 'desc', uiLang)
                  : t('tutorGuideAck', 'reviewSub', uiLang)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            aria-label={t('tutorGuideAck', 'close', uiLang)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'intro' ? (
          <div className="px-5 py-5 sm:px-6">
            <button
              type="button"
              onClick={() => setStep('review')}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-100"
            >
              <BookOpen className="h-4 w-4" />
              {t('tutorGuideAck', 'openGuide', uiLang)}
            </button>
            <p className="mt-3 text-center text-xs text-ink-500">
              {t('tutorGuideAck', 'openGuideHint', uiLang)}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                {t('tutorGuideAck', 'cancel', uiLang)}
              </button>
              <button
                type="button"
                disabled
                className="flex-1 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white opacity-40"
              >
                {t('tutorGuideAck', 'continue', uiLang)}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Types */}
              <section>
                <h3 className="font-display text-base font-bold text-ink-900">
                  {t('tutorGuide', 'heading', uiLang)}
                </h3>
                <p className="mt-1 text-sm text-ink-600">{t('tutorGuide', 'sub', uiLang)}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TypeMini
                    icon={BadgeCheck}
                    title={t('tutorGuide', 'proTitle', uiLang)}
                    badge={t('tutorGuide', 'proBadge', uiLang)}
                    body={t('tutorGuide', 'proReq', uiLang)}
                    required={[
                      t('tutorGuide', 'reqVideo', uiLang),
                      t('tutorGuide', 'reqCredential', uiLang),
                    ]}
                    requiredLabel={t('tutorGuide', 'requiredLabel', uiLang)}
                  />
                  <TypeMini
                    icon={Users}
                    title={t('tutorGuide', 'communityTitle', uiLang)}
                    badge={t('tutorGuide', 'communityBadge', uiLang)}
                    body={t('tutorGuide', 'communityReq', uiLang)}
                    required={[t('tutorGuide', 'reqVideo', uiLang)]}
                    requiredLabel={t('tutorGuide', 'requiredLabel', uiLang)}
                  />
                </div>
              </section>

              {/* Process */}
              <section className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                <h3 className="font-display text-base font-bold text-ink-900">
                  {t('tutorGuide', 'flowTitle', uiLang)}
                </h3>
                <ol className="mt-3 space-y-3">
                  {(
                    [
                      ['flow1Title', 'flow1Desc'],
                      ['flow2Title', 'flow2Desc'],
                      ['flow3Title', 'flow3Desc'],
                      ['flow4Title', 'flow4Desc'],
                    ] as const
                  ).map(([titleKey, descKey], i) => (
                    <li key={titleKey} className="flex gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink-900">
                          {t('tutorGuide', titleKey, uiLang)}
                        </p>
                        <p className="text-xs leading-relaxed text-ink-600">
                          {t('tutorGuide', descKey, uiLang)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-2xl border border-primary-200 bg-primary-50/40 p-4">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary-700" />
                  <h3 className="font-display text-base font-bold text-ink-900">
                    {t('tutorGuide', 'feeTitle', uiLang)}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-ink-600">{t('tutorGuide', 'feeSub', uiLang)}</p>
                <ul className="mt-3 space-y-2">
                  {TUTOR_COMMISSION_POLICY.tiers.map((tier) => (
                    <li
                      key={tier.id}
                      className="rounded-xl border border-white bg-white px-3 py-2.5 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-ink-900">{tier.name[uiLang]}</p>
                        <p className="shrink-0 text-xs font-bold text-primary-700">
                          {t('tutorGuide', 'feeRateLabel', uiLang)}{' '}
                          {formatCommissionPercent(tier.rate)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-600">{tier.criteria[uiLang]}</p>
                    </li>
                  ))}
                </ul>
                <ul className="mt-3 space-y-1 text-xs leading-relaxed text-ink-600">
                  <li>{TUTOR_COMMISSION_POLICY.window[uiLang]}</li>
                  <li>{TUTOR_COMMISSION_POLICY.base[uiLang]}</li>
                  <li>{TUTOR_COMMISSION_POLICY.overlap[uiLang]}</li>
                  <li>{TUTOR_COMMISSION_POLICY.reset[uiLang]}</li>
                </ul>
              </section>

              {/* Refund */}
              <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-amber-700" />
                  <h3 className="font-display text-base font-bold text-ink-900">
                    {t('tutorGuideAck', 'refundTitle', uiLang)}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-ink-600">{t('tutorGuideAck', 'refundSub', uiLang)}</p>
                <ul className="mt-3 space-y-2">
                  {REFUND_POLICY.tiers.map((tier) => (
                    <li
                      key={tier.id}
                      className="rounded-xl border border-white bg-white px-3 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {tier.window[uiLang]}
                      </div>
                      <p className="mt-1 font-semibold text-ink-900">{tier.student[uiLang]}</p>
                      <p className="mt-0.5 text-xs text-ink-600">
                        {t('refundPolicy', 'tutorLabel', uiLang)}: {tier.tutor[uiLang]}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs leading-relaxed text-ink-600">
                  {REFUND_POLICY.exceptions[uiLang]}
                </p>
              </section>

              {/* Penalties */}
              <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-rose-700" />
                  <h3 className="font-display text-base font-bold text-ink-900">
                    {t('tutorGuide', 'penaltyTitle', uiLang)}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-ink-600">{t('tutorGuide', 'penaltySub', uiLang)}</p>
                <p className="mt-3 text-xs font-semibold text-rose-800">
                  {t('tutorGuide', 'noShowDefLabel', uiLang)}
                </p>
                <p className="mt-0.5 text-sm text-ink-800">
                  {TUTOR_ATTENDANCE_POLICY.noShow.definition[uiLang]}
                </p>
                <p className="mt-3 text-xs font-semibold text-ink-800">
                  {t('tutorGuide', 'penaltyListTitle', uiLang)}
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {TUTOR_ATTENDANCE_POLICY.noShow.tutorPenalties.map((item) => (
                    <li
                      key={item.EN}
                      className="rounded-lg bg-white px-3 py-2 text-sm text-ink-800"
                    >
                      · {item[uiLang]}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-semibold text-ink-800">
                  {t('tutorGuide', 'lateRulesTitle', uiLang)}
                </p>
                <ul className="mt-1.5 space-y-1.5 text-sm text-ink-700">
                  <li className="rounded-lg bg-white px-3 py-2">
                    {TUTOR_ATTENDANCE_POLICY.lateness.under10[uiLang]}
                  </li>
                  <li className="rounded-lg bg-white px-3 py-2">
                    {TUTOR_ATTENDANCE_POLICY.lateness.over10[uiLang]}
                  </li>
                </ul>
              </section>
            </div>

            <div className="shrink-0 border-t border-ink-100 bg-white px-5 py-4 sm:px-6">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 px-3.5 py-3">
                <input
                  type="checkbox"
                  checked={acked}
                  onChange={(e) => setAcked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm leading-relaxed text-ink-800">
                  {t('tutorGuideAck', 'checkbox', uiLang)}
                </span>
              </label>
              {!acked && (
                <p className="mt-2 text-xs text-ink-500">{t('tutorGuideAck', 'hint', uiLang)}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('intro')}
                  className="rounded-full border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                >
                  {t('tutorGuideAck', 'backIntro', uiLang)}
                </button>
                <button
                  type="button"
                  disabled={!acked}
                  onClick={() => {
                    if (!acked) return;
                    onContinue();
                  }}
                  className="flex-1 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('tutorGuideAck', 'continue', uiLang)}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TypeMini({
  icon: Icon,
  title,
  badge,
  body,
  required,
  requiredLabel,
}: {
  icon: typeof BadgeCheck;
  title: string;
  badge: string;
  body: string;
  required: string[];
  requiredLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3.5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink-900">{title}</p>
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary-700">
            {badge}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-600">{body}</p>
      <p className="mt-2 text-[11px] font-semibold text-ink-500">{requiredLabel}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-ink-700">
        {required.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
