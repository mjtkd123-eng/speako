import {
  ArrowLeft,
  BadgePercent,
  Camera,
  Clock3,
  Flag,
  ShieldAlert,
  Timer,
  UserX,
} from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { TUTOR_ATTENDANCE_POLICY } from '@/lib/tutor-attendance-policy';

type Props = {
  uiLang: UiLang;
  onBack: () => void;
};

export default function TutorAttendancePolicy({ uiLang, onBack }: Props) {
  const policy = TUTOR_ATTENDANCE_POLICY;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 via-white to-white pt-20 pb-20 lg:pt-24">
      <div className="container-page max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('tutorAttendance', 'back', uiLang)}
        </button>

        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            {t('tutorAttendance', 'eyebrow', uiLang)}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('tutorAttendance', 'heading', uiLang)}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            {t('tutorAttendance', 'sub', uiLang)}
          </p>
        </header>

        {/* Highlight guarantee */}
        <div className="mb-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:p-5">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <BadgePercent className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-base font-bold text-emerald-950 sm:text-lg">
                {t('tutorAttendance', 'guaranteeTitle', uiLang)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-900/90">
                {t('tutorAttendance', 'guaranteeBody', uiLang)}
              </p>
            </div>
          </div>
        </div>

        {/* No-show */}
        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <UserX className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900">
                {t('tutorAttendance', 'noShowTitle', uiLang)}
              </h2>
              <p className="mt-2 text-sm text-ink-600">
                <span className="font-semibold text-ink-800">
                  {t('tutorAttendance', 'definitionLabel', uiLang)}:
                </span>{' '}
                {policy.noShow.definition[uiLang]}
              </p>
              <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-900">
                {policy.noShow.studentBenefit[uiLang]}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {t('tutorAttendance', 'tutorPenaltyNote', uiLang)}
              </p>
              <p className="mt-1 text-sm text-ink-600">
                {t('tutorAttendance', 'tutorPenaltyLink', uiLang)}{' '}
                <a href="#/tutor/guide" className="font-semibold text-primary-700 hover:underline">
                  {t('tutorAttendance', 'tutorGuideCta', uiLang)}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Lateness */}
        <section className="mt-5 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Timer className="h-5 w-5" />
            </span>
            <div className="w-full">
              <h2 className="font-display text-xl font-bold text-ink-900">
                {t('tutorAttendance', 'lateTitle', uiLang)}
              </h2>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 px-4 py-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
                  <p className="text-sm leading-relaxed text-ink-700">
                    {policy.lateness.under10[uiLang]}
                  </p>
                </li>
                <li className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <p className="text-sm leading-relaxed text-ink-700">
                    {policy.lateness.over10[uiLang]}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Report steps */}
        <section className="mt-5">
          <h2 className="font-display text-xl font-bold text-ink-900">
            {t('tutorAttendance', 'stepsTitle', uiLang)}
          </h2>
          <p className="mt-1 text-sm text-ink-500">{t('tutorAttendance', 'stepsSub', uiLang)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {policy.reportSteps.map((step, i) => (
              <article
                key={step.title.EN}
                className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {i === 0 ? (
                    <Flag className="h-4 w-4 text-ink-500" />
                  ) : i === 1 ? (
                    <Camera className="h-4 w-4 text-ink-500" />
                  ) : (
                    <BadgePercent className="h-4 w-4 text-ink-500" />
                  )}
                </div>
                <h3 className="mt-3 text-sm font-bold text-ink-900">{step.title[uiLang]}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{step.desc[uiLang]}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#/refund"
            className="inline-flex rounded-full border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50"
          >
            {t('tutorAttendance', 'refundLink', uiLang)}
          </a>
          <a
            href="#/faq"
            className="inline-flex rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            {t('tutorAttendance', 'faqLink', uiLang)}
          </a>
        </div>
      </div>
    </div>
  );
}
