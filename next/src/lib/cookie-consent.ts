export const COOKIE_STORAGE_KEY = "speako_cookie_consent_v1";

export type CookieConsent = {
  necessary: true;
  optional: boolean;
  timestamp: number;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.necessary !== true || typeof parsed.optional !== "boolean") return null;
    return {
      necessary: true,
      optional: parsed.optional,
      timestamp: parsed.timestamp ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(optional: boolean): CookieConsent {
  const next: CookieConsent = { necessary: true, optional, timestamp: Date.now() };
  localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(next));
  return next;
}
