import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatKrw, optionLabel } from "@/lib/catalog";
import { PG_FEE_RATE } from "@/lib/portone";

export default async function SettlementsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const rows = await prisma.purchase.findMany({
    where: { course: { tutorId: session.user.id }, hasAccess: true },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const gross = rows.reduce((s, r) => s + r.amountGross, 0);
  const fees = rows.reduce((s, r) => s + r.stripeFee + r.platformFee, 0);
  const net = rows.reduce((s, r) => s + r.netPayout, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">콘텐츠 결산</h1>
          <p className="mt-1 text-sm text-ink-500">
            플랫폼·PG 수수료 {(PG_FEE_RATE * 100).toFixed(1)}%를 반영한 정산 내역입니다. 원천징수 영수증이 아닌 지급
            내역서(Invoice)를 내려받으세요.
          </p>
        </div>
        <a
          href="/api/tutor/statement"
          className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
        >
          지급 내역서 PDF
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Summary label="총 판매 금액" value={formatKrw(gross)} hint="Gross Sales" />
        <Summary
          label="플랫폼 수수료 및 PG 수수료"
          value={formatKrw(fees)}
          hint={`Fee ${(PG_FEE_RATE * 100).toFixed(1)}%`}
        />
        <Summary label="최종 정산 예정 금액" value={formatKrw(net)} hint="Net Payout" />
      </div>

      <div className="mt-10 overflow-x-auto rounded-3xl border border-ink-100 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs font-semibold tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">주문일시</th>
              <th className="px-4 py-3">콘텐츠명</th>
              <th className="px-4 py-3">판매가</th>
              <th className="px-4 py-3">수수료</th>
              <th className="px-4 py-3">최종 정산금</th>
              <th className="px-4 py-3">정산 상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-ink-100">
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                <td className="px-4 py-3">
                  {row.course.title}
                  <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-bold">
                    {optionLabel(row.option)}
                  </span>
                </td>
                <td className="px-4 py-3">{formatKrw(row.amountGross)}</td>
                <td className="px-4 py-3">{formatKrw(row.stripeFee + row.platformFee)}</td>
                <td className="px-4 py-3 font-semibold">{formatKrw(row.netPayout)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      row.status === "PAID" ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {row.status === "PAID" ? "정산 완료" : "정산 대기"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-ink-500">아직 정산할 주문이 없습니다.</p>}
      </div>
    </div>
  );
}

function Summary({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-5">
      <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">{hint}</p>
      <p className="mt-1 text-sm text-ink-600">{label}</p>
      <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}
