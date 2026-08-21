"use client";

import { useEffect, useState } from "react";
import { readCookieConsent, writeCookieConsent } from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [optional, setOptional] = useState(false);

  useEffect(() => {
    setVisible(!readCookieConsent());
  }, []);

  if (!visible) return null;

  function save(nextOptional: boolean) {
    writeCookieConsent(nextOptional);
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-ink-200 bg-white/95 p-5 shadow-2xl backdrop-blur animate-slide-up">
        <p className="font-display text-lg font-bold text-ink-900">쿠키 동의</p>
        <p className="mt-1 text-sm leading-6 text-ink-600">
          필수 쿠키는 로그인·결제 보안을 위해 항상 사용됩니다. 선택 쿠키는 분석·마케팅에만 쓰입니다.
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm text-ink-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked disabled className="h-4 w-4 accent-brand-600" />
            필수 쿠키 (항상 허용)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={optional}
              onChange={(e) => setOptional(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            선택 쿠키 (분석·마케팅)
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => save(optional)}
            className="h-11 flex-1 rounded-2xl bg-brand-600 font-semibold text-white hover:bg-brand-700"
          >
            동의하고 계속
          </button>
          <button
            type="button"
            onClick={() => save(false)}
            className="h-11 flex-1 rounded-2xl border border-ink-200 font-semibold text-ink-700 hover:bg-ink-50"
          >
            필수만 허용
          </button>
        </div>
      </div>
    </div>
  );
}
