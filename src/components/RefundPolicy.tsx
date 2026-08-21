import { ArrowLeft, CircleDollarSign, Clock3, Headphones, UserX } from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { REFUND_POLICY } from '@/lib/refund-policy';
import { TUTOR_ATTENDANCE_POLICY } from '@/lib/tutor-attendance-policy';

type Props = {
  uiLang: UiLang;
  onBack: () => void;
};

export default function RefundPolicy({ uiLang, onBack }: Props) {
  const attendance = TUTOR_ATTENDANCE_POLICY;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-white pt-20 pb-20 lg:pt-24">
      <div className="container-page max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('refundPolicy', 'back', uiLang)}
        </button>

        <header className="mb-8">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-700">
            <CircleDollarSign className="h-4 w-4" />
            {t('refundPolicy', 'eyebrow', uiLang)}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('refundPolicy', 'heading', uiLang)}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            {t('refundPolicy', 'sub', uiLang)}
          </p>
        </header>

        <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
          {t('refundPolicy', 'cancelTitle', uiLang)}
        </h2>
        <div className="space-y-3">
          {REFUND_POLICY.tiers.map((tier, i) => (
            <div
              key={tier.id}
              className={`rounded-2xl border bg-white p-5 ${
                tier.id === 'none'
                  ? 'border-rose-200'
                  : tier.id === 'half'
                    ? 'border-amber-200'
                    : 'border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    tier.id === 'none'
                      ? 'bg-rose-100 text-rose-800'
                      : tier.id === 'half'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    {tier.window[uiLang]}
                  </div>
                  <p className="mt-2 text-base font-bold text-ink-900">{tier.student[uiLang]}</p>
                  <p className="mt-1 text-sm text-ink-600">
                    {t('refundPolicy', 'tutorLabel', uiLang)}: {tier.tutor[uiLang]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 rounded-2xl border border-ink-100 bg-ink-50/80 px-4 py-3 text-sm leading-relaxed text-ink-600">
          {REFUND_POLICY.exceptions[uiLang]}
        </p>

        <div className="mt-10 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:p-5">
          <div className="flex gap-3">
            <UserX className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
            <div>
              <p className="font-bold text-emerald-950">
                {t('refundPolicy', 'noShowHighlight', uiLang)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-900/90">
                {attendance.noShow.definition[uiLang]} → {attendance.noShow.studentBenefit[uiLang]}
              </p>
              <p className="mt-2 text-sm text-emerald-900/90">{attendance.lateness.under10[uiLang]}</p>
              <p className="mt-1 text-sm text-emerald-900/90">{attendance.lateness.over10[uiLang]}</p>
              <a
                href="#/tutor-attendance"
                className="mt-3 inline-block text-sm font-semibold text-emerald-900 underline-offset-2 hover:underline"
              >
                {t('refundPolicy', 'attendanceLink', uiLang)}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href="mailto:support@speako.app"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <Headphones className="h-4 w-4" />
            {t('refundPolicy', 'contactCta', uiLang)}
          </a>
        </div>
      </div>
    </div>
  );
}
