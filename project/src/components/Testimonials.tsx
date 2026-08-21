import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/data';
import { t, type UiLang } from '@/i18n';

type Props = { uiLang: UiLang };

export default function Testimonials({ uiLang }: Props) {
  return (
    <section className="bg-ink-50/50 py-16 lg:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mb-3 bg-accent-50 text-accent-700">{t('testimonials', 'chip', uiLang)}</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('testimonials', 'heading', uiLang)}
          </h2>
          <p className="mt-3 text-ink-600">
            {t('testimonials', 'sub', uiLang)}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="relative flex flex-col rounded-2xl border border-ink-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <Quote className="h-8 w-8 text-primary-200" />
              <blockquote className="mt-3 flex-1 leading-relaxed text-ink-700">
                "{item.text[uiLang]}"
              </blockquote>
              <div className="mt-5 flex items-center gap-1">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent-400 text-accent-400" />
                ))}
              </div>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-11 w-11 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-ink-900">{item.name}</p>
                  <p className="text-sm text-ink-500">{item.role[uiLang]}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
