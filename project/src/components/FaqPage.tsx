import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Headphones, Search } from 'lucide-react';
import { t, type UiLang } from '@/i18n';
import {
  FAQ_CATEGORIES,
  FAQ_PAGE_ITEMS,
  type FaqAudience,
  type FaqCategory,
} from '@/data/faqPageData';

type Props = {
  uiLang: UiLang;
  onBack: () => void;
};

export default function FaqPage({ uiLang, onBack }: Props) {
  const [audience, setAudience] = useState<FaqAudience>('student');
  const [category, setCategory] = useState<FaqCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const visibleCategories = useMemo(() => {
    if (audience === 'student') {
      return FAQ_CATEGORIES.filter((c) => c.id !== 'payout');
    }
    return FAQ_CATEGORIES;
  }, [audience]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_PAGE_ITEMS.filter((item) => {
      if (!item.audience.includes(audience)) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      const hay = [
        item.question.KR,
        item.question.EN,
        item.answer.KR,
        item.answer.EN,
        ...(item.keywords ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [audience, category, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/40 via-white to-white pt-20 pb-20 lg:pt-24">
      <div className="container-page max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('faqPage', 'back', uiLang)}
        </button>

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            {t('faqPage', 'eyebrow', uiLang)}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('faqPage', 'heading', uiLang)}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            {t('faqPage', 'sub', uiLang)}
          </p>
        </header>

        {/* Audience tabs */}
        <div className="flex rounded-full border border-ink-200 bg-ink-50 p-1">
          {(
            [
              ['student', 'tabStudent'],
              ['tutor', 'tabTutor'],
            ] as const
          ).map(([id, key]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setAudience(id);
                setCategory('all');
                setOpenId(null);
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                audience === id
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              {t('faqPage', key, uiLang)}
            </button>
          ))}
        </div>

        {/* Search */}
        <label className="relative mt-5 block">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('faqPage', 'searchPlaceholder', uiLang)}
            className="w-full rounded-2xl border border-ink-200 bg-white py-3 pr-4 pl-10 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-primary-400"
          />
        </label>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategory(c.id);
                setOpenId(null);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === c.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {c.label[uiLang]}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="mt-8 space-y-3">
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink-200 bg-white px-5 py-8 text-center text-sm text-ink-500">
              {t('faqPage', 'empty', uiLang)}
            </p>
          ) : (
            items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen ? 'border-primary-200 shadow-soft' : 'border-ink-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-ink-900">
                      {item.question[uiLang]}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-primary-500' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-600">
                        {item.answer[uiLang]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Support CTA */}
        <div className="mt-12 rounded-3xl border border-ink-100 bg-ink-50/70 px-6 py-8 text-center">
          <h2 className="font-display text-xl font-bold text-ink-900">
            {t('faqPage', 'ctaTitle', uiLang)}
          </h2>
          <p className="mt-2 text-sm text-ink-600">{t('faqPage', 'ctaSub', uiLang)}</p>
          <a
            href="mailto:support@speako.app"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <Headphones className="h-4 w-4" />
            {t('faqPage', 'ctaBtn', uiLang)}
          </a>
        </div>
      </div>
    </div>
  );
}
