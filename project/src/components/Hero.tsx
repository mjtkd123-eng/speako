import { useMemo, useState } from 'react';
import { Search, ChevronDown, Star, Play, Sparkles, Globe2 } from 'lucide-react';
import { getLanguagesByPopularity } from '@/data';
import { t, type UiLang } from '@/i18n';

type Props = {
  selectedLang: string;
  onSelectLang: (code: string) => void;
  uiLang: UiLang;
};

export default function Hero({ selectedLang, onSelectLang, uiLang }: Props) {
  const [price, setPrice] = useState('all');
  const [time, setTime] = useState('all');
  const { popular, other } = useMemo(() => getLanguagesByPopularity(), []);

  const priceRanges = [
    { value: 'all', label: t('priceRanges', 'all', uiLang) },
    { value: '0-20000', label: t('priceRanges', '0-20000', uiLang) },
    { value: '20000-30000', label: t('priceRanges', '20000-30000', uiLang) },
    { value: '30000+', label: t('priceRanges', '30000+', uiLang) },
  ];

  const timeSlots = [
    { value: 'all', label: t('timeSlots', 'all', uiLang) },
    { value: 'morning', label: t('timeSlots', 'morning', uiLang) },
    { value: 'afternoon', label: t('timeSlots', 'afternoon', uiLang) },
    { value: 'evening', label: t('timeSlots', 'evening', uiLang) },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white pt-16 lg:pt-[72px]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent-200/20 blur-3xl" />
      </div>

      <div className="container-page relative">
        <div className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-8 lg:py-20">
          {/* Left: copy + search */}
          <div className="animate-fade-up">
            <span className="chip mb-5 bg-white/70 text-primary-700 ring-1 ring-primary-100">
              <Sparkles className="h-3.5 w-3.5" />
              {t('hero', 'badge', uiLang)}
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              {t('hero', 'title1', uiLang)}
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-brand-500 bg-clip-text text-transparent">
                {t('hero', 'title2', uiLang)}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-600">
              {t('hero', 'desc', uiLang)}
            </p>

            {/* Search card */}
            <div className="mt-8 rounded-2xl border border-ink-100 bg-white/90 p-2 shadow-lift backdrop-blur-sm sm:p-3">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {/* Language */}
                <div className="relative">
                  <label className="absolute left-3 top-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    {t('hero', 'labelLang', uiLang)}
                  </label>
                  <select
                    value={selectedLang}
                    onChange={(e) => onSelectLang(e.target.value)}
                    className="h-[60px] w-full appearance-none rounded-xl border border-ink-100 bg-ink-50/50 pl-3 pt-5 pr-9 text-sm font-semibold text-ink-800 transition-colors hover:border-primary-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    <optgroup label={t('nav', 'popularLangs', uiLang)}>
                      {popular.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.name[uiLang]}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={t('nav', 'otherLangs', uiLang)}>
                      {other.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.name[uiLang]}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                </div>

                {/* Price */}
                <div className="relative">
                  <label className="absolute left-3 top-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    {t('hero', 'labelPrice', uiLang)}
                  </label>
                  <select
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-[60px] w-full appearance-none rounded-xl border border-ink-100 bg-ink-50/50 pl-3 pt-5 pr-9 text-sm font-semibold text-ink-800 transition-colors hover:border-primary-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    {priceRanges.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                </div>

                {/* Time */}
                <div className="relative">
                  <label className="absolute left-3 top-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    {t('hero', 'labelTime', uiLang)}
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-[60px] w-full appearance-none rounded-xl border border-ink-100 bg-ink-50/50 pl-3 pt-5 pr-9 text-sm font-semibold text-ink-800 transition-colors hover:border-primary-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                </div>

                {/* Search button */}
                <a
                  href="#tutors"
                  className="btn-primary h-[60px] !rounded-xl text-base"
                >
                  <Search className="h-5 w-5" />
                  {t('hero', 'searchBtn', uiLang)}
                </a>
              </div>
            </div>

            {/* Trust row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-500">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
                <span className="font-semibold text-ink-700">4.9/5</span> {t('hero', 'trustRating', uiLang)}
              </div>
              <div className="flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-primary-500" />
                <span className="font-semibold text-ink-700">150+</span> {t('hero', 'trustLangs', uiLang)}
              </div>
              <div className="flex items-center gap-1.5">
                <Play className="h-4 w-4 fill-brand-500 text-brand-500" />
                {t('hero', 'trustTrial', uiLang)}
              </div>
            </div>
          </div>

          {/* Right: image */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/60 shadow-lift">
                <img
                  src="https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=900&h=1000&fit=crop"
                  alt={t('hero', 'imgAlt', uiLang)}
                  className="h-[380px] w-full object-cover sm:h-[480px] lg:h-[520px]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent" />
              </div>

              {/* Floating card: rating */}
              <div className="absolute -left-4 top-10 hidden animate-float rounded-2xl border border-ink-100 bg-white/95 p-3 shadow-lift backdrop-blur sm:flex sm:items-center sm:gap-3 lg:-left-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                  <Star className="h-5 w-5 fill-accent-400 text-accent-400" />
                </div>
                <div>
                  <p className="text-lg font-extrabold leading-none text-ink-900">4.9/5</p>
                  <p className="mt-1 text-xs text-ink-500">{t('hero', 'floatReviews', uiLang)}</p>
                </div>
              </div>

              {/* Floating card: live lesson */}
              <div className="absolute -right-3 bottom-12 hidden animate-float [animation-delay:1.5s] rounded-2xl border border-ink-100 bg-white/95 p-3 shadow-lift backdrop-blur sm:block lg:-right-6">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success-400" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success-500" />
                  </span>
                  <p className="text-sm font-semibold text-ink-800">{t('hero', 'floatLive', uiLang)}</p>
                </div>
                <p className="mt-1.5 text-xs text-ink-500">{t('hero', 'floatLiveSub', uiLang)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="pointer-events-none">
        <svg viewBox="0 0 1440 80" className="h-12 w-full text-white sm:h-16" preserveAspectRatio="none">
          <path
            fill="currentColor"
            d="M0,40 C240,80 480,0 720,32 C960,64 1200,80 1440,40 L1440,80 L0,80 Z"
          />
        </svg>
      </div>
    </section>
  );
}
