import { FEATURES, STATS } from '@/data';
import { t, type UiLang } from '@/i18n';

type Props = { uiLang: UiLang };

const accentMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'group-hover:ring-primary-200' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', ring: 'group-hover:ring-accent-200' },
  brand: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'group-hover:ring-brand-200' },
};

export default function Features({ uiLang }: Props) {
  return (
    <section className="bg-gradient-to-b from-white to-ink-50/60 py-16 lg:py-24">
      <div className="container-page">
        {/* Stats strip */}
        <div className="mb-16 grid grid-cols-2 gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-4 lg:gap-8">
          {STATS.map((s) => (
            <div key={s.labelKey} className="text-center">
              <p className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-ink-500">{t('stats', s.labelKey, uiLang)}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mb-3 bg-brand-50 text-brand-700">{t('features', 'chip', uiLang)}</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('features', 'heading', uiLang)}
          </h2>
          <p className="mt-3 text-ink-600">
            {t('features', 'sub', uiLang)}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => {
            const a = accentMap[f.accent];
            const Icon = f.icon;
            return (
              <article
                key={f.title.KR}
                className="group rounded-2xl border border-ink-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${a.bg} ${a.text} ring-1 ring-transparent transition-all ${a.ring}`}>
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ink-900">{f.title[uiLang]}</h3>
                <p className="mt-2.5 leading-relaxed text-ink-600">{f.description[uiLang]}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
