import { Star, BadgeCheck, Sparkles, Heart, ArrowUpRight } from 'lucide-react';
import { TUTORS, type Tutor } from '@/data';
import { t, type UiLang } from '@/i18n';

type Props = { uiLang: UiLang; onJoinLesson?: () => void };

function formatPrice(won: number) {
  const usd = Math.round(won / 1350);
  return '$' + usd.toLocaleString('en-US');
}

const badgeMap: Record<NonNullable<Tutor['badge']>, { labelKey: 'badgeSuper' | 'badgePro' | 'badgeNew'; class: string; icon: typeof BadgeCheck }> = {
  super: { labelKey: 'badgeSuper', class: 'bg-accent-50 text-accent-600 ring-accent-200', icon: Sparkles },
  pro: { labelKey: 'badgePro', class: 'bg-brand-50 text-brand-600 ring-brand-200', icon: BadgeCheck },
  new: { labelKey: 'badgeNew', class: 'bg-primary-50 text-primary-600 ring-primary-200', icon: Heart },
};

function TutorCard({ tutor, uiLang, onJoinLesson }: { tutor: Tutor; uiLang: UiLang; onJoinLesson?: () => void }) {
  const badge = tutor.badge ? badgeMap[tutor.badge] : null;
  const BadgeIcon = badge?.icon;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-lift">
      {/* Avatar */}
      <div className="relative aspect-[5/4] overflow-hidden bg-ink-100">
        <img
          src={tutor.avatar}
          alt={tutor.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" />
        {badge && BadgeIcon && (
          <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badge.class} backdrop-blur`}>
            <BadgeIcon className="h-3 w-3" />
            {t('tutors', badge.labelKey, uiLang)}
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg shadow-soft backdrop-blur">
          {tutor.flag}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">{tutor.name}</h3>
            <p className="mt-0.5 text-sm text-ink-500">
              {tutor.teaches[uiLang]} · {tutor.nationality[uiLang]}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-accent-50 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
            <span className="text-sm font-bold text-ink-800">{tutor.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">{tutor.bio[uiLang]}</p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tutor.tags.map((tag, i) => (
            <span key={i} className="chip bg-ink-50 text-ink-600">{tag[uiLang]}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
          <span><span className="font-semibold text-ink-700">{tutor.reviews}</span>{t('tutors', 'reviews', uiLang)}</span>
          <span className="h-3 w-px bg-ink-200" />
          <span><span className="font-semibold text-ink-700">{tutor.lessons.toLocaleString()}</span>{t('tutors', 'lessons', uiLang)}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="mt-5 flex items-end justify-between border-t border-ink-100 pt-4">
          <div>
            <p className="text-xs text-ink-400">{t('tutors', 'trial', uiLang)}</p>
            <p className="text-lg font-extrabold text-primary-600">{formatPrice(tutor.trialPrice)}</p>
            <p className="mt-0.5 text-xs text-ink-400">{t('tutors', 'regular', uiLang)} {formatPrice(tutor.price)}{t('tutors', 'perLesson', uiLang)}</p>
          </div>
          <button onClick={onJoinLesson} className="btn-primary group/btn">
            {t('tutors', 'bookBtn', uiLang)}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PopularTutors({ uiLang, onJoinLesson }: Props) {
  return (
    <section id="tutors" className="py-16 lg:py-24">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="chip mb-3 bg-primary-50 text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
              {t('tutors', 'chip', uiLang)}
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              {t('tutors', 'heading', uiLang)}
            </h2>
            <p className="mt-2 max-w-xl text-ink-600">
              {t('tutors', 'sub', uiLang)}
            </p>
          </div>
          <a href="#" className="btn-outline shrink-0">
            {t('tutors', 'viewAll', uiLang)}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TUTORS.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} uiLang={uiLang} onJoinLesson={onJoinLesson} />
          ))}
        </div>
      </div>
    </section>
  );
}
