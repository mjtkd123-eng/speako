"use client";

import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { ProductOption, type Course } from "@prisma/client";
import { formatKrw, optionPrice } from "@/lib/catalog";
import { useAuthModal } from "@/components/auth-modals";
import { useSession } from "next-auth/react";

export function PurchaseCard({
  course,
  signedIn,
}: {
  course: Course;
  signedIn: boolean;
}) {
  const options: ProductOption[] = [
    ...(course.hasVod ? (["VOD"] as const) : []),
    ...(course.hasEbook ? (["EBOOK"] as const) : []),
    ...(course.hasVod && course.hasEbook ? (["PACKAGE"] as const) : []),
  ];
  const [option, setOption] = useState<ProductOption>(options[0] ?? "VOD");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const { openLogin } = useAuthModal();
  const { status } = useSession();

  async function startCheckout() {
    if (!signedIn || status !== "authenticated") {
      openLogin();
      return;
    }
    setPending(true);
    setMessage("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, option }),
    });
    const json = await res.json();
    if (!res.ok) {
      setPending(false);
      setMessage(json.error ?? "결제 시작에 실패했습니다.");
      return;
    }
    if (json.alreadyOwned || json.demo) {
      window.location.href = json.redirectTo;
      return;
    }

    const payment = await PortOne.requestPayment({
      storeId: json.storeId,
      channelKey: json.channelKey,
      paymentId: json.paymentId,
      orderName: json.orderName,
      totalAmount: json.totalAmount,
      currency: json.currency,
      payMethod: "CARD",
    });

    if (payment?.code) {
      setPending(false);
      setMessage(payment.message ?? "결제가 취소되었습니다.");
      return;
    }

    const complete = await fetch("/api/payment/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: json.paymentId, purchaseId: json.purchaseId }),
    });
    const done = await complete.json();
    setPending(false);
    if (!complete.ok) {
      setMessage(done.error ?? "결제 검증에 실패했습니다.");
      return;
    }
    window.location.href = `/checkout/success?purchaseId=${json.purchaseId}`;
  }

  return (
    <aside className="rounded-3xl border border-ink-100 bg-white p-5 shadow-lg lg:sticky lg:top-24">
      <p className="text-sm font-semibold text-ink-500">구매 옵션</p>
      <div className="mt-3 space-y-2">
        {options.map((item) => (
          <label
            key={item}
            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-3 ${
              option === item ? "border-brand-500 bg-brand-50" : "border-ink-200"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-ink-800">
              <input
                type="radio"
                name="option"
                checked={option === item}
                onChange={() => setOption(item)}
              />
              {item === "VOD" ? "VOD 단품" : item === "EBOOK" ? "전자책 단품" : "VOD+전자책 패키지 할인"}
            </span>
            <span className="text-sm font-bold">{formatKrw(optionPrice(course, item))}</span>
          </label>
        ))}
      </div>
      {course.hasVod && course.hasEbook && (
        <p className="mt-2 text-xs text-brand-700">
          패키지 구매 시 {formatKrw(course.vodPrice + course.ebookPrice - course.packagePrice)} 할인
        </p>
      )}
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={startCheckout}
        className="mt-4 h-12 w-full rounded-2xl bg-brand-600 font-bold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "결제 진행 중..." : "결제하기"}
      </button>
    </aside>
  );
}
