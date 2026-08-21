"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccessClient() {
  const params = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    const paymentId = params.get("paymentId");
    const purchaseId = params.get("purchaseId");
    const demo = params.get("demo") === "1";

    if (purchaseId && !sessionId && !paymentId && !demo) {
      setState("ok");
      return;
    }

    fetch("/api/payment/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, paymentId, purchaseId, demo }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "검증에 실패했습니다.");
        setState("ok");
      })
      .catch((err: Error) => {
        setError(err.message);
        setState("error");
      });
  }, [params]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {state === "loading" && <p>결제를 확인하고 있습니다...</p>}
      {state === "ok" && (
        <>
          <h1 className="font-display text-3xl font-extrabold">구매가 완료되었습니다</h1>
          <p className="mt-3 text-ink-500">시청 권한(hasAccess)이 활성화되었습니다.</p>
          <Link
            href="/my-courses"
            className="mt-8 inline-flex h-12 items-center rounded-2xl bg-brand-600 px-6 font-bold text-white"
          >
            내 강의실로 이동
          </Link>
        </>
      )}
      {state === "error" && <p className="text-red-600">{error}</p>}
    </div>
  );
}
