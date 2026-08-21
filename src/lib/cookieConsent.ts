import {
  COOKIE_TRANSLATIONS,
  SUPPORTED_COOKIE_LOCALES,
  type CookieLocale,
} from '@/constants/cookieTranslations';

export type CountryMode = 'eu' | 'default';

export type CookieConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  countryMode: CountryMode;
  countryCode?: string;
  locale?: CookieLocale;
};

export const COOKIE_CONSENT_STORAGE_KEY = 'speako_cookie_consent_v1';

/** EU / EEA member states (ISO 3166-1 alpha-2) for GDPR opt-in mode */
export const EU_COUNTRY_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA often treated like GDPR for cookies
  'IS', 'LI', 'NO',
]);

const COUNTRY_DEFAULT_LOCALE: Record<string, CookieLocale> = {
  KR: 'ko',
  FR: 'fr',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  US: 'en',
  GB: 'en',
  IE: 'en',
  AU: 'en',
  CA: 'en',
};

export function isEuCountry(code: string | null | undefined): boolean {
  if (!code) return false;
  return EU_COUNTRY_CODES.has(code.toUpperCase());
}

export function resolveCookieLocale(
  browserLanguage: string,
  countryCode?: string | null,
): CookieLocale {
  const primary = browserLanguage.toLowerCase().split('-')[0] as CookieLocale;
  if (SUPPORTED_COOKIE_LOCALES.includes(primary)) return primary;

  const fromCountry = countryCode
    ? COUNTRY_DEFAULT_LOCALE[countryCode.toUpperCase()]
    : undefined;
  if (fromCountry) return fromCountry;

  return 'en';
}

export function getCookieCopy(locale: CookieLocale) {
  return COOKIE_TRANSLATIONS[locale] ?? COOKIE_TRANSLATIONS.en;
}

export function readStoredConsent(): CookieConsentState | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (typeof parsed.analytics !== 'boolean' || typeof parsed.marketing !== 'boolean') {
      return null;
    }
    if (parsed.countryMode !== 'eu' && parsed.countryMode !== 'default') return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
      countryMode: parsed.countryMode,
      countryCode: parsed.countryCode,
      locale: parsed.locale,
    };
  } catch {
    return null;
  }
}

export function writeStoredConsent(state: CookieConsentState) {
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
}

export function clearStoredConsent() {
  localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
}

type GeoResult = {
  countryCode: string | null;
  countryMode: CountryMode;
};

async function fetchIpApi(): Promise<string | null> {
  const res = await fetch('https://ipapi.co/json/', {
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error('ipapi failed');
  const data = (await res.json()) as { country_code?: string };
  return data.country_code ?? null;
}

async function fetchIpWho(): Promise<string | null> {
  const res = await fetch('https://ipwho.is/', {
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error('ipwho failed');
  const data = (await res.json()) as { success?: boolean; country_code?: string };
  if (data.success === false) throw new Error('ipwho unsuccessful');
  return data.country_code ?? null;
}

/** Geo-IP with fallback; on total failure infer EU from browser language. */
export async function detectCountryMode(): Promise<GeoResult> {
  const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en';

  try {
    let code: string | null = null;
    try {
      code = await fetchIpApi();
    } catch {
      code = await fetchIpWho();
    }

    if (code) {
      return {
        countryCode: code.toUpperCase(),
        countryMode: isEuCountry(code) ? 'eu' : 'default',
      };
    }
  } catch {
    // fall through to language heuristic
  }

  const lang = browserLang.toLowerCase();
  const euLangHint = /^(fr|de|es|it|nl|pl|sv|da|fi|pt|el|cs|sk|hu|ro|bg|hr|sl|et|lv|lt|mt|ga)(-|$)/.test(
    lang,
  );
  return {
    countryCode: null,
    countryMode: euLangHint ? 'eu' : 'default',
  };
}
