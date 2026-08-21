import { Globe, GraduationCap, ArrowRight } from 'lucide-react';
import { t, type UiLang } from '@/i18n';

type Props = {
  uiLang: UiLang;
  onApply: () => void;
  onGuide: () => void;
};

export default function CtaBanner({ uiLang, onApply, onGuide }: Props) {
  return (
    <section id="become-tutor" className="scroll-mt-24 py-16 lg:scroll-mt-28 lg:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-primary-600 to-brand-600 px-6 py-14 shadow-lift sm:px-12 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-brand-400/20 blur-2xl" />
          </div>

          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur">
                <GraduationCap className="h-4 w-4" />
                {t('cta', 'badge', uiLang)}
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                {t('cta', 'title1', uiLang)}
                <br />
                {t('cta', 'title2', uiLang)}
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-primary-50">
                {t('cta', 'desc', uiLang)}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={onApply}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lift transition-all hover:bg-primary-50 hover:shadow-glow active:scale-[0.98]"
                >
                  {t('cta', 'btnApply', uiLang)}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onGuide}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  <Globe className="h-4 w-4" />
                  {t('cta', 'btnGuide', uiLang)}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:justify-end">
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                <p className="font-display text-3xl font-extrabold text-white">{t('cta', 'stat1Val', uiLang)}</p>
                <p className="mt-1 text-sm text-primary-50">{t('cta', 'stat1Label', uiLang)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                <p className="font-display text-3xl font-extrabold text-white">{t('cta', 'stat2Val', uiLang)}</p>
                <p className="mt-1 text-sm text-primary-50">{t('cta', 'stat2Label', uiLang)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                <p className="font-display text-3xl font-extrabold text-white">{t('cta', 'stat3Val', uiLang)}</p>
                <p className="mt-1 text-sm text-primary-50">{t('cta', 'stat3Label', uiLang)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                <p className="font-display text-3xl font-extrabold text-white">{t('cta', 'stat4Val', uiLang)}</p>
                <p className="mt-1 text-sm text-primary-50">{t('cta', 'stat4Label', uiLang)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
