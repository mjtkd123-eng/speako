/** Post-auth redirect target for tutor onboarding flow */
export const TUTOR_ONBOARDING_HASH = '#/tutor/onboarding';
export const TUTOR_GUIDE_HASH = '#/tutor/guide';
export const AUTH_CALLBACK_HASH = '#/auth/callback';

const PENDING_REDIRECT_KEY = 'speako_post_auth_redirect';
const TUTOR_INTENT_KEY = 'speako_tutor_apply_intent';

export type TutorType = 'professional' | 'community';

export function setPendingAuthRedirect(hash: string) {
  sessionStorage.setItem(PENDING_REDIRECT_KEY, hash);
  sessionStorage.setItem(TUTOR_INTENT_KEY, '1');
}

export function consumePendingAuthRedirect(): string | null {
  const hash = sessionStorage.getItem(PENDING_REDIRECT_KEY);
  sessionStorage.removeItem(PENDING_REDIRECT_KEY);
  return hash;
}

export function hasTutorApplyIntent(): boolean {
  return sessionStorage.getItem(TUTOR_INTENT_KEY) === '1';
}

export function clearTutorApplyIntent() {
  sessionStorage.removeItem(TUTOR_INTENT_KEY);
}

export function getOAuthRedirectTo(): string {
  const origin = window.location.origin;
  // Land on callback hash so the SPA can finish auth then send users to onboarding.
  return `${origin}/${AUTH_CALLBACK_HASH}`;
}
