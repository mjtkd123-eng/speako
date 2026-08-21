import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Ban,
  CameraOff,
  Flag,
  Headphones,
  MessageSquareWarning,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { t, type UiLang } from '@/i18n';

type Props = {
  uiLang: UiLang;
  onBack: () => void;
  onContactSupport?: () => void;
  onReport?: () => void;
};

export default function SafetyGuide({ uiLang, onBack, onContactSupport, onReport }: Props) {
  const penalties = [
    { key: 'p1' as const, tone: 'amber' },
    { key: 'p2' as const, tone: 'orange' },
    { key: 'p3' as const, tone: 'red' },
  ];

  const steps = ['s1', 's2', 's3', 's4'] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-white pt-20 pb-20 lg:pt-24">
      <div className="container-page max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('safetyGuide', 'back', uiLang)}
        </button>

        <header className="mb-8">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-rose-600">
            <ShieldCheck className="h-4 w-4" />
            {t('safetyGuide', 'eyebrow', uiLang)}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('safetyGuide', 'heading', uiLang)}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
            {t('safetyGuide', 'sub', uiLang)}
          </p>
        </header>

        {/* Penalty alert */}
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:p-5">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-rose-900 sm:text-lg">
                {t('safetyGuide', 'penaltyTitle', uiLang)}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-rose-800/90">
                {t('safetyGuide', 'penaltyIntro', uiLang)}
              </p>
              <ul className="mt-4 space-y-2.5">
                {penalties.map(({ key, tone }) => (
                  <li
                    key={key}
                    className={`rounded-xl border px-3.5 py-2.5 text-sm ${
                      tone === 'red'
                        ? 'border-rose-300 bg-white text-rose-950'
                        : tone === 'orange'
                          ? 'border-orange-200 bg-white text-orange-950'
                          : 'border-amber-200 bg-white text-amber-950'
                    }`}
                  >
                    <span className="font-bold">{t('safetyGuide', `${key}Label`, uiLang)}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed opacity-90">
                      {t('safetyGuide', `${key}Desc`, uiLang)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3 section cards */}
        <div className="grid gap-5">
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <Scale className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-ink-900">
                  {t('safetyGuide', 'sec1Title', uiLang)}
                </h2>
                <p className="mt-1 text-sm text-ink-500">{t('safetyGuide', 'sec1Sub', uiLang)}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-4">
              <RuleItem
                title={t('safetyGuide', 'privacyTitle', uiLang)}
                body={t('safetyGuide', 'privacyBody', uiLang)}
              />
              <RuleItem
                title={t('safetyGuide', 'offPlatformTitle', uiLang)}
                body={t('safetyGuide', 'offPlatformBody', uiLang)}
                warn
              />
            </ul>
          </section>

          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <MessageSquareWarning className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-ink-900">
                  {t('safetyGuide', 'sec2Title', uiLang)}
                </h2>
                <p className="mt-1 text-sm text-ink-500">{t('safetyGuide', 'sec2Sub', uiLang)}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-4">
              <RuleItem
                title={t('safetyGuide', 'harassmentTitle', uiLang)}
                body={t('safetyGuide', 'harassmentBody', uiLang)}
                icon={<Ban className="h-4 w-4 text-rose-600" />}
                warn
              />
              <RuleItem
                title={t('safetyGuide', 'captureTitle', uiLang)}
                body={t('safetyGuide', 'captureBody', uiLang)}
                icon={<CameraOff className="h-4 w-4 text-ink-600" />}
              />
            </ul>
          </section>

          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Flag className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-ink-900">
                  {t('safetyGuide', 'sec3Title', uiLang)}
                </h2>
                <p className="mt-1 text-sm text-ink-500">{t('safetyGuide', 'sec3Sub', uiLang)}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {steps.map((key, i) => (
                <div key={key} className="flex gap-3 rounded-2xl bg-ink-50/80 px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {t('safetyGuide', `${key}Title`, uiLang)}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-600">
                      {t('safetyGuide', `${key}Desc`, uiLang)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Legal monitoring notice */}
        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:p-5">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
            <div>
              <h2 className="text-sm font-bold text-orange-950">
                {t('safetyGuide', 'monitorTitle', uiLang)}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-orange-900/90">
                {t('safetyGuide', 'monitorBody', uiLang)}
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onContactSupport}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
          >
            <Headphones className="h-4 w-4" />
            {t('safetyGuide', 'contactCta', uiLang)}
          </button>
          <button
            type="button"
            onClick={onReport}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            <Flag className="h-4 w-4" />
            {t('safetyGuide', 'reportCta', uiLang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function RuleItem({
  title,
  body,
  warn,
  icon,
}: {
  title: string;
  body: string;
  warn?: boolean;
  icon?: ReactNode;
}) {
  return (
    <li className={`rounded-2xl border px-4 py-3.5 ${warn ? 'border-rose-100 bg-rose-50/40' : 'border-ink-100 bg-ink-50/50'}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-bold text-ink-900">{title}</p>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
    </li>
  );
}
