import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function CookieConsentBanner() {
  const {
    ready,
    bannerOpen,
    preferencesOpen,
    countryMode,
    copy,
    consent,
    acceptAll,
    rejectAll,
    savePreferences,
    closeBanner,
    openPreferences,
  } = useCookieConsent();

  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!bannerOpen) return;
    setAnalytics(consent?.analytics ?? false);
    setMarketing(consent?.marketing ?? false);
    setShowDetails(preferencesOpen);
  }, [bannerOpen, preferencesOpen, consent]);

  if (!ready || !bannerOpen) return null;

  const isEu = countryMode === 'eu';
  const description = isEu ? copy.descriptionEu : copy.description;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[80] p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="mx-auto flex max-h-[min(85vh,640px)] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl border border-ink-200 bg-white p-5 shadow-lift sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="cookie-consent-title"
              className="font-display text-lg font-bold text-ink-900 sm:text-xl"
            >
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{description}</p>
          </div>
          {!isEu && consent && (
            <button
              type="button"
              onClick={closeBanner}
              className="shrink-0 rounded-full px-2 py-1 text-sm text-ink-500 hover:bg-ink-100 hover:text-ink-800"
              aria-label={copy.close}
            >
              {copy.close}
            </button>
          )}
        </div>

        {showDetails && (
          <div className="mt-5 space-y-3 border-t border-ink-100 pt-4">
            <CategoryRow
              title={copy.necessary}
              description={copy.necessaryDesc}
              checked
              disabled
              badge={copy.alwaysOn}
            />
            <CategoryRow
              title={copy.analytics}
              description={copy.analyticsDesc}
              checked={analytics}
              onChange={setAnalytics}
            />
            <CategoryRow
              title={copy.marketing}
              description={copy.marketingDesc}
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        <div className={`mt-5 grid gap-2 ${isEu && !showDetails ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {showDetails ? (
            <>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
              >
                {copy.close}
              </button>
              <button
                type="button"
                onClick={() => savePreferences({ analytics, marketing })}
                className="rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                {copy.save}
              </button>
            </>
          ) : isEu ? (
            <>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50"
              >
                {copy.acceptAll}
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="rounded-full border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50"
              >
                {copy.rejectAll}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDetails(true);
                  openPreferences();
                }}
                className="rounded-full border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50"
              >
                {copy.customize}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowDetails(true);
                  openPreferences();
                }}
                className="rounded-full border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
              >
                {copy.customize}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                {copy.acceptAll}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  badge,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  badge?: string;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-ink-50/80 px-3.5 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          {badge && (
            <span className="rounded-full bg-ink-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-ink-300'
        } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
