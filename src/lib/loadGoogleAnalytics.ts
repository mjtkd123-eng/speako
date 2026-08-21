const GA_SCRIPT_ID = 'speako-ga4-gtag';
const GA_INLINE_ID = 'speako-ga4-inline';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Dynamically inject GA4 only after analytics consent.
 * Pass measurement ID or set VITE_GA_MEASUREMENT_ID.
 */
export function loadGoogleAnalytics(measurementId?: string): boolean {
  const id =
    measurementId?.trim() ||
    (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();

  if (!id || typeof document === 'undefined') return false;
  if (document.getElementById(GA_SCRIPT_ID)) return true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });

  const script = document.createElement('script');
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  const inline = document.createElement('script');
  inline.id = GA_INLINE_ID;
  inline.textContent = '';
  document.head.appendChild(inline);

  return true;
}

/** Remove injected GA tags (consent withdrawn). Does not delete historical hits. */
export function unloadGoogleAnalytics() {
  document.getElementById(GA_SCRIPT_ID)?.remove();
  document.getElementById(GA_INLINE_ID)?.remove();
  try {
    delete window.gtag;
  } catch {
    window.gtag = undefined;
  }
}
