"use client";

import { useState } from "react";

export function ConnectOnboardButton() {
  const [error, setError] = useState("");

  async function start() {
    setError("");
    const res = await fetch("/api/tutor/connect", { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "연결에 실패했습니다.");
      return;
    }
    window.location.href = json.url;
  }

  return (
    <div>
      <button
        type="button"
        onClick={start}
        className="rounded-xl bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white"
      >
        Stripe Connect 연결
      </button>
      {error && <p className="mt-1 text-xs text-amber-700">{error}</p>}
    </div>
  );
}
