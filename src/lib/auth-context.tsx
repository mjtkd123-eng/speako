import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Provider, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  AUTH_CALLBACK_HASH,
  consumePendingAuthRedirect,
  getOAuthRedirectTo,
  setPendingAuthRedirect,
  TUTOR_ONBOARDING_HASH,
} from '@/lib/tutor-onboarding';

export type SocialProvider = 'google' | 'kakao' | 'apple' | 'facebook' | 'instagram';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoggedIn: boolean;
  signInWithSocial: (provider: SocialProvider, redirectHash?: string) => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (input: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  /** Logged-in → go onboarding; otherwise caller should open auth modal */
  startTutorApply: (openAuthModal: () => void) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PROVIDER_MAP: Record<SocialProvider, Provider> = {
  google: 'google',
  kakao: 'kakao',
  apple: 'apple',
  facebook: 'facebook',
  instagram: 'facebook',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Finish OAuth / magic-link return on #/auth/callback
  useEffect(() => {
    const raw = window.location.hash.replace(/^#\/?/, '');
    if (raw !== 'auth/callback' && !raw.startsWith('auth/callback')) return;

    let cancelled = false;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      } else {
        await supabase.auth.getSession();
      }
      if (cancelled) return;

      const next = consumePendingAuthRedirect() ?? TUTOR_ONBOARDING_HASH;
      const cleanHash = next.startsWith('#') ? next : `#${next}`;
      window.history.replaceState({}, '', `${window.location.pathname}${cleanHash}`);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithSocial = useCallback(
    async (provider: SocialProvider, redirectHash: string = TUTOR_ONBOARDING_HASH) => {
      setPendingAuthRedirect(redirectHash);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: PROVIDER_MAP[provider],
        options: {
          redirectTo: getOAuthRedirectTo(),
          skipBrowserRedirect: false,
        },
      });
      if (error) {
        sessionStorage.removeItem('speako_post_auth_redirect');
        return { error: error.message };
      }
      return {};
    },
    [],
  );

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signUpWithEmail = useCallback(
    async (input: { email: string; password: string; name: string; phone: string }) => {
      const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { name: input.name, phone: input.phone } },
      });
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const startTutorApply = useCallback(
    (openAuthModal: () => void) => {
      if (session?.user) {
        window.location.hash = TUTOR_ONBOARDING_HASH;
        return;
      }
      setPendingAuthRedirect(TUTOR_ONBOARDING_HASH);
      openAuthModal();
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isLoggedIn: !!session?.user,
      signInWithSocial,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      startTutorApply,
    }),
    [session, loading, signInWithSocial, signInWithEmail, signUpWithEmail, signOut, startTutorApply],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Safe hook when AuthProvider might not wrap (tests) */
export function useAuthOptional() {
  return useContext(AuthContext);
}

export { AUTH_CALLBACK_HASH };
