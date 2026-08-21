"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

type Mode = "login" | "signup";

type AuthModalContextValue = {
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode | null>(null);

  const value = useMemo<AuthModalContextValue>(
    () => ({
      openLogin: () => setMode("login"),
      openSignup: () => setMode("signup"),
      close: () => setMode(null),
    }),
    [],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {mode && <AuthModal mode={mode} onMode={setMode} onClose={() => setMode(null)} />}
    </AuthModalContext.Provider>
  );
}

function AuthModal({
  mode,
  onMode,
  onClose,
}: {
  mode: Mode;
  onMode: (mode: Mode) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/50 animate-fade-in"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up sm:rounded-3xl sm:p-8">
        <div className="mb-5 flex gap-2 rounded-2xl bg-ink-100 p-1">
          <button
            type="button"
            onClick={() => onMode("login")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === "login" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"}`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => onMode("signup")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === "signup" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"}`}
          >
            회원가입
          </button>
        </div>
        {mode === "login" ? <LoginForm onDone={onClose} /> : <SignupForm onDone={onClose} />}
      </div>
    </div>
  );
}

function SocialButtons() {
  const [error, setError] = useState("");

  async function oauth(provider: "kakao" | "facebook" | "instagram" | "google" | "apple") {
    setError("");
    const mapped = provider === "instagram" ? "facebook" : provider;
    const res = await signIn(mapped, { callbackUrl: "/" });
    if (res?.error) {
      setError("소셜 로그인이 아직 설정되지 않았습니다. 이메일로 로그인해 주세요.");
    }
  }

  return (
    <div className="space-y-2.5">
      <button type="button" onClick={() => oauth("kakao")} className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#FEE500] text-base font-bold text-[#191919] hover:brightness-95">
        카카오로 계속하기
      </button>
      <button type="button" onClick={() => oauth("facebook")} className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#1877F2] text-base font-bold text-white hover:brightness-95">
        Facebook으로 계속하기
      </button>
      <button type="button" onClick={() => oauth("instagram")} className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-base font-bold text-white hover:brightness-95">
        Instagram으로 계속하기
      </button>
      <button type="button" onClick={() => oauth("google")} className="flex h-12 w-full items-center justify-center rounded-2xl border border-ink-200 bg-white text-base font-bold text-ink-900 hover:bg-ink-50">
        Google로 계속하기
      </button>
      <button type="button" onClick={() => oauth("apple")} className="flex h-12 w-full items-center justify-center rounded-2xl bg-black text-base font-bold text-white hover:bg-ink-800">
        Apple로 계속하기
      </button>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      remember: form.get("remember") === "on" ? "true" : "false",
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    onDone();
    window.location.reload();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} autoComplete="on">
      <SocialButtons />
      <div className="relative py-2 text-center text-xs text-ink-400">
        <span className="relative z-10 bg-white px-3">또는 이메일로 로그인</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-ink-200" />
      </div>
      <label className="block text-sm font-medium text-ink-700">
        이메일
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500"
        />
      </label>
      <label className="block text-sm font-medium text-ink-700">
        비밀번호
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-ink-900 outline-none focus:border-brand-500"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-600">
        <input name="remember" type="checkbox" defaultChecked className="h-4 w-4 accent-brand-600" />
        로그인 상태 유지
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-2xl bg-brand-600 font-bold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-center text-xs text-ink-400">
        데모 학생 student@speako.one / speako1234
        <br />
        데모 튜터 tutor@speako.one / speako1234
      </p>
    </form>
  );
}

function SignupForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      passwordConfirm: String(form.get("passwordConfirm") ?? ""),
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      terms: form.get("terms") === "on",
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPending(false);
      setError(json.error ?? "회원가입에 실패했습니다.");
      return;
    }
    const login = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      remember: "true",
      redirect: false,
    });
    setPending(false);
    if (login?.error) {
      setError("가입은 완료됐습니다. 로그인해 주세요.");
      return;
    }
    onDone();
    window.location.reload();
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit} autoComplete="on">
      <label className="block text-sm font-medium text-ink-700">
        이메일
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
        />
      </label>
      <label className="block text-sm font-medium text-ink-700">
        비밀번호
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
        />
      </label>
      <label className="block text-sm font-medium text-ink-700">
        비밀번호 확인
        <input
          name="passwordConfirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
        />
      </label>
      <label className="block text-sm font-medium text-ink-700">
        이름
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
        />
      </label>
      <label className="block text-sm font-medium text-ink-700">
        연락처
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5 outline-none focus:border-brand-500"
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-ink-600">
        <input name="terms" type="checkbox" required className="mt-1 h-4 w-4 accent-brand-600" />
        이용약관 및 개인정보 처리방침에 동의합니다.
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-2xl bg-brand-600 font-bold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
