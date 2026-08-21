import { STEPS } from '@/data';
import { t, type UiLang } from '@/i18n';

type Props = { uiLang: UiLang };

export default function HowItWorks({ uiLang }: Props) {
  return (
    <section className="py-16 lg:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mb-3 bg-primary-50 text-primary-700">{t('how', 'chip', uiLang)}</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('how', 'heading', uiLang)}
          </h2>
          <p className="mt-3 text-ink-600">
            {t('how', 'sub', uiLang)}
          </p>
        </div>

        <div className="relative mt-14">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title.KR} className="relative text-center lg:text-left">
                  <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-ink-100 shadow-soft lg:mx-0">
                    <Icon className="h-6 w-6 text-primary-600" strokeWidth={2} />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-soft">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink-900">{step.title[uiLang]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.description[uiLang]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
