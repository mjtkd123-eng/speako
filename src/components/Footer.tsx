import { Globe, Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import { t, STRINGS, type UiLang } from '@/i18n';
import { useCookieConsent } from '@/hooks/useCookieConsent';

type Props = { uiLang: UiLang };

function footerSupportHref(link: string): string {
  if (link === '강사 지원하기' || link === 'Apply to Teach' || link === 'Become a Tutor') {
    return '#become-tutor';
  }
  if (link === '자주 묻는 질문' || link === 'FAQ') return '#/faq';
  if (link === '안전 가이드' || link === 'Safety Guide') return '#/safety';
  if (link === '커뮤니티' || link === 'Community') return '#/community';
  if (link === '환불 정책' || link === 'Refund Policy') return '#/refund';
  if (link === '노쇼·지각 정책' || link === 'No-show Policy') return '#/tutor-attendance';
  return '#';
}

export default function Footer({ uiLang }: Props) {
  const { openPreferences, copy } = useCookieConsent();

  const linkSections: {
    titleKey: 'colService' | 'colCompany' | 'colSupport' | 'colLegal';
    linksKey: 'service' | 'company' | 'support' | 'legal';
  }[] = [
    { titleKey: 'colService', linksKey: 'service' },
    { titleKey: 'colCompany', linksKey: 'company' },
    { titleKey: 'colSupport', linksKey: 'support' },
    { titleKey: 'colLegal', linksKey: 'legal' },
  ];

  return (
    <footer className="border-t border-ink-100 bg-ink-50/40">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <a href="#" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-brand-500 text-white shadow-soft">
                <Globe className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">
                Speako
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              {t('footer', 'desc', uiLang)}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-600">
                <Globe className="h-4 w-4 text-ink-400" />
                {t('footer', 'langLabel', uiLang)}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-600">
                $ USD
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {[Twitter, Instagram, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-500 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                  aria-label={t('footer', 'socialLabel', uiLang)}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {linkSections.map((section) => {
              const links = STRINGS.footer.links[section.linksKey][uiLang] as readonly string[];
              return (
                <div key={section.titleKey}>
                  <h4 className="text-sm font-bold text-ink-900">
                    {t('footer', section.titleKey, uiLang)}
                  </h4>
                  <ul className="mt-4 space-y-3">
                    {links.map((link) => {
                      const href = footerSupportHref(link);
                      return (
                        <li key={link}>
                          <a
                            href={href}
                            onClick={(e) => {
                              if (href === '#') return;
                              e.preventDefault();
                              window.location.hash = href.replace(/^#/, '');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-sm text-ink-500 transition-colors hover:text-primary-600"
                          >
                            {link}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 text-sm text-ink-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Speako Inc. {t('footer', 'bottomRights', uiLang)}
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-primary-600">
              {t('footer', 'terms', uiLang)}
            </a>
            <a href="#" className="transition-colors hover:text-primary-600">
              {t('footer', 'privacy', uiLang)}
            </a>
            <button
              type="button"
              onClick={openPreferences}
              className="transition-colors hover:text-primary-600"
            >
              {copy.settingsLink}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
