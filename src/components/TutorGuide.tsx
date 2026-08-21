import { ArrowLeft, BadgeCheck, Users, Video, FileCheck, CheckCircle2, Percent } from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import { TUTOR_ATTENDANCE_POLICY } from '@/lib/tutor-attendance-policy';
import {
  TUTOR_COMMISSION_POLICY,
  formatCommissionPercent,
} from '@/lib/tutor-commission-policy';

type Props = {
  uiLang: UiLang;
  onBack: () => void;
  onApply: () => void;
};

export default function TutorGuide({ uiLang, onBack, onApply }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/60 via-white to-white pt-20 pb-16 lg:pt-24">
      <div className="container-page max-w-4xl">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('tutorGuide', 'back', uiLang)}
        </button>

        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            {t('tutorGuide', 'eyebrow', uiLang)}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('tutorGuide', 'heading', uiLang)}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
            {t('tutorGuide', 'sub', uiLang)}
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <TypeCard
            icon={BadgeCheck}
            accent="primary"
            title={t('tutorGuide', 'proTitle', uiLang)}
            badge={t('tutorGuide', 'proBadge', uiLang)}
            requirement={t('tutorGuide', 'proReq', uiLang)}
            required={[
              t('tutorGuide', 'reqVideo', uiLang),
              t('tutorGuide', 'reqCredential', uiLang),
            ]}
            uiLang={uiLang}
          />
          <TypeCard
            icon={Users}
            accent="brand"
            title={t('tutorGuide', 'communityTitle', uiLang)}
            badge={t('tutorGuide', 'communityBadge', uiLang)}
            requirement={t('tutorGuide', 'communityReq', uiLang)}
            required={[t('tutorGuide', 'reqVideo', uiLang)]}
            optional={[t('tutorGuide', 'optCredential', uiLang)]}
            uiLang={uiLang}
          />
        </div>

        <section className="mt-8 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink-900">
            {t('tutorGuide', 'flowTitle', uiLang)}
          </h2>
          <ol className="mt-5 space-y-4">
            {(
              [
                ['flow1Title', 'flow1Desc'],
                ['flow2Title', 'flow2Desc'],
                ['flow3Title', 'flow3Desc'],
                ['flow4Title', 'flow4Desc'],
              ] as const
            ).map(([titleKey, descKey], i) => (
              <li key={titleKey} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink-900">{t('tutorGuide', titleKey, uiLang)}</p>
                  <p className="mt-0.5 text-sm text-ink-600">{t('tutorGuide', descKey, uiLang)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-5 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary-600" />
            <h2 className="font-display text-xl font-bold text-ink-900">
              {t('tutorGuide', 'feeTitle', uiLang)}
            </h2>
          </div>
          <p className="mt-2 text-sm text-ink-600">{t('tutorGuide', 'feeSub', uiLang)}</p>
          <ul className="mt-5 space-y-2">
            {TUTOR_COMMISSION_POLICY.tiers.map((tier) => (
              <li
                key={tier.id}
                className="flex flex-col gap-1 rounded-2xl border border-ink-100 bg-ink-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-ink-900">{tier.name[uiLang]}</p>
                  <p className="mt-0.5 text-sm text-ink-600">{tier.criteria[uiLang]}</p>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-primary-700">
                  {t('tutorGuide', 'feeRateLabel', uiLang)} {formatCommissionPercent(tier.rate)}
                </p>
              </li>
            ))}
          </ul>
          <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-ink-600">
            <li>{TUTOR_COMMISSION_POLICY.window[uiLang]}</li>
            <li>{TUTOR_COMMISSION_POLICY.base[uiLang]}</li>
            <li>{TUTOR_COMMISSION_POLICY.overlap[uiLang]}</li>
            <li>{TUTOR_COMMISSION_POLICY.reset[uiLang]}</li>
          </ul>
        </section>

        <section className="mt-5 rounded-3xl border border-rose-200 bg-rose-50/40 p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink-900">
            {t('tutorGuide', 'penaltyTitle', uiLang)}
          </h2>
          <p className="mt-2 text-sm text-ink-600">{t('tutorGuide', 'penaltySub', uiLang)}</p>

          <div className="mt-5 rounded-2xl border border-white bg-white/90 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              {t('tutorGuide', 'noShowDefLabel', uiLang)}
            </p>
            <p className="mt-1 text-sm text-ink-800">
              {TUTOR_ATTENDANCE_POLICY.noShow.definition[uiLang]}
            </p>
          </div>

          <p className="mt-5 text-sm font-bold text-ink-900">
            {t('tutorGuide', 'penaltyListTitle', uiLang)}
          </p>
          <ul className="mt-2 space-y-2">
            {TUTOR_ATTENDANCE_POLICY.noShow.tutorPenalties.map((item) => (
              <li
                key={item.EN}
                className="flex gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm text-ink-800"
              >
                <span className="font-bold text-rose-600">·</span>
                {item[uiLang]}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm font-bold text-ink-900">
            {t('tutorGuide', 'lateRulesTitle', uiLang)}
          </p>
          <ul className="mt-2 space-y-2 text-sm text-ink-700">
            <li className="rounded-xl bg-white px-3.5 py-2.5">
              {TUTOR_ATTENDANCE_POLICY.lateness.under10[uiLang]}
            </li>
            <li className="rounded-xl bg-white px-3.5 py-2.5">
              {TUTOR_ATTENDANCE_POLICY.lateness.over10[uiLang]}
            </li>
          </ul>

          <a
            href="#/tutor-attendance"
            className="mt-5 inline-flex text-sm font-semibold text-primary-700 hover:underline"
          >
            {t('tutorGuide', 'attendancePolicyLink', uiLang)} →
          </a>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={onApply}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-700 active:scale-[0.98]"
          >
            {t('cta', 'btnApply', uiLang)}
          </button>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-6 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            {t('tutorGuide', 'back', uiLang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeCard({
  icon: Icon,
  accent,
  title,
  badge,
  requirement,
  required,
  optional,
  uiLang,
}: {
  icon: typeof BadgeCheck;
  accent: 'primary' | 'brand';
  title: string;
  badge: string;
  requirement: string;
  required: string[];
  optional?: string[];
  uiLang: UiLang;
}) {
  const iconBg = accent === 'primary' ? 'bg-primary-100 text-primary-700' : 'bg-brand-100 text-brand-700';
  const badgeBg = accent === 'primary' ? 'bg-primary-50 text-primary-700' : 'bg-brand-50 text-brand-700';

  return (
    <article className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-7">
      <div className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${badgeBg}`}>
            {badge}
          </span>
          <h3 className="mt-1.5 font-display text-lg font-bold text-ink-900">{title}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-600">{requirement}</p>

      <div className="mt-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">
          {t('tutorGuide', 'requiredLabel', uiLang)}
        </p>
        {required.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-ink-700">
            {item.includes('동영상') || item.toLowerCase().includes('video') ? (
              <Video className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            ) : (
              <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            )}
            <span>{item}</span>
          </div>
        ))}
        {optional?.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-ink-500">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
