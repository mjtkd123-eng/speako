import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { FAQS } from '@/data';
import { t, type UiLang } from '@/i18n';

type Props = { uiLang: UiLang };

export default function Faq({ uiLang }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 lg:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <a
            href="#/faq"
            className="chip mb-3 inline-flex bg-brand-50 text-brand-700 transition-colors hover:bg-brand-100"
          >
            {t('faq', 'chip', uiLang)}
          </a>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('faq', 'heading', uiLang)}
          </h2>
          <p className="mt-3 text-ink-600">{t('faq', 'sub', uiLang)}</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                  isOpen ? 'border-primary-200 shadow-soft' : 'border-ink-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-ink-900">{item.q[uiLang]}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary-500' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 leading-relaxed text-ink-600">{item.a[uiLang]}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#/faq"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            {t('faq', 'viewAll', uiLang)}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
