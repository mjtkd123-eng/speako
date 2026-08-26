"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useAuthModal } from "@/components/auth-modals";

export function SiteHeader() {
  const { data } = useSession();
  const { openLogin, openSignup } = useAuthModal();

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-xl font-extrabold text-brand-700">
          Speako
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 md:flex">
          <Link href="/" className="hover:text-ink-900">
            1:1 선생님
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {data?.user ? (
            <>
              <span className="hidden text-sm text-ink-500 sm:inline">{data.user.name ?? data.user.email}</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={openLogin}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={openSignup}
                className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
