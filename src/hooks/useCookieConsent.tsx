import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CookieLocale } from '@/constants/cookieTranslations';
import {
  clearStoredConsent,
  detectCountryMode,
  getCookieCopy,
  readStoredConsent,
  resolveCookieLocale,
  writeStoredConsent,
  type CookieConsentState,
  type CountryMode,
} from '@/lib/cookieConsent';
import { loadGoogleAnalytics, unloadGoogleAnalytics } from '@/lib/loadGoogleAnalytics';

type Preferences = {
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentContextValue = {
  ready: boolean;
  consent: CookieConsentState | null;
  countryMode: CountryMode;
  countryCode: string | null;
  locale: CookieLocale;
  copy: ReturnType<typeof getCookieCopy>;
  bannerOpen: boolean;
  preferencesOpen: boolean;
  openPreferences: () => void;
  closeBanner: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: Preferences) => void;
  withdrawAndReopen: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function applyScripts(consent: CookieConsentState | null) {
  if (consent?.analytics) {
    loadGoogleAnalytics();
  } else {
    unloadGoogleAnalytics();
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [countryMode, setCountryMode] = useState<CountryMode>('default');
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [locale, setLocale] = useState<CookieLocale>('en');
  const [bannerOpen, setBannerOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const stored = readStoredConsent();
      const browserLang = navigator.language || 'en';

      if (stored) {
        const loc =
          stored.locale ??
          resolveCookieLocale(browserLang, stored.countryCode ?? null);
        if (cancelled) return;
        setConsent(stored);
        setCountryMode(stored.countryMode);
        setCountryCode(stored.countryCode ?? null);
        setLocale(loc);
        setBannerOpen(false);
        setReady(true);
        applyScripts(stored);
        return;
      }

      const geo = await detectCountryMode();
      if (cancelled) return;

      const loc = resolveCookieLocale(browserLang, geo.countryCode);
      setCountryMode(geo.countryMode);
      setCountryCode(geo.countryCode);
      setLocale(loc);
      setBannerOpen(true);
      setReady(true);

      // Non-EU: still wait for interaction before analytics (safer default).
      // EU: hard block until opt-in (no scripts).
      applyScripts(null);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    (next: CookieConsentState) => {
      writeStoredConsent(next);
      setConsent(next);
      setBannerOpen(false);
      setPreferencesOpen(false);
      applyScripts(next);
    },
    [],
  );

  const acceptAll = useCallback(() => {
    persist({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
      countryMode,
      countryCode: countryCode ?? undefined,
      locale,
    });
  }, [persist, countryMode, countryCode, locale]);

  const rejectAll = useCallback(() => {
    persist({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
      countryMode,
      countryCode: countryCode ?? undefined,
      locale,
    });
  }, [persist, countryMode, countryCode, locale]);

  const savePreferences = useCallback(
    (prefs: Preferences) => {
      persist({
        necessary: true,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        timestamp: Date.now(),
        countryMode,
        countryCode: countryCode ?? undefined,
        locale,
      });
    },
    [persist, countryMode, countryCode, locale],
  );

  const openPreferences = useCallback(() => {
    setBannerOpen(true);
    setPreferencesOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    // EU: cannot dismiss without a choice
    if (countryMode === 'eu' && !consent) return;
    if (!consent && countryMode === 'default') {
      rejectAll();
      return;
    }
    setBannerOpen(false);
    setPreferencesOpen(false);
  }, [countryMode, consent, rejectAll]);

  const withdrawAndReopen = useCallback(() => {
    clearStoredConsent();
    unloadGoogleAnalytics();
    setConsent(null);
    setPreferencesOpen(true);
    setBannerOpen(true);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      ready,
      consent,
      countryMode,
      countryCode,
      locale,
      copy: getCookieCopy(locale),
      bannerOpen,
      preferencesOpen,
      openPreferences,
      closeBanner,
      acceptAll,
      rejectAll,
      savePreferences,
      withdrawAndReopen,
    }),
    [
      ready,
      consent,
      countryMode,
      countryCode,
      locale,
      bannerOpen,
      preferencesOpen,
      openPreferences,
      closeBanner,
      acceptAll,
      rejectAll,
      savePreferences,
      withdrawAndReopen,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return ctx;
}
