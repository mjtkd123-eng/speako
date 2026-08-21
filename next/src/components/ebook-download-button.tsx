"use client";

import { useState } from "react";

export function EbookDownloadButton({ purchaseId }: { purchaseId: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function download() {
    setPending(true);
    setMessage("");
    const res = await fetch(`/api/ebook/${purchaseId}`, { method: "POST" });
    const json = await res.json();
    setPending(false);
    if (!res.ok) {
      setMessage(json.error ?? "링크를 만들 수 없습니다.");
      return;
    }
    setMessage(`링크 유효시간 ${json.ttlMinutes}분`);
    window.location.href = json.url;
  }

  return (
    <div>
      <button
        type="button"
        onClick={download}
        disabled={pending}
        className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
      >
        {pending ? "준비 중..." : "PDF 다운로드"}
      </button>
      {message && <p className="mt-1 text-xs text-ink-500">{message}</p>}
    </div>
  );
}
