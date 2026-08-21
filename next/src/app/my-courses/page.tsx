import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EbookDownloadButton } from "@/components/ebook-download-button";
import { includesEbook, includesVod } from "@/lib/purchases";

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, hasAccess: true },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const vods = purchases.filter((p) => includesVod(p.option));
  const ebooks = purchases.filter((p) => includesEbook(p.option));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">내 강의실</h1>
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">VOD</h2>
        <div className="mt-4 space-y-3">
          {vods.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.course.title}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${item.vodProgress}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-400">진도율 {item.vodProgress}%</p>
              </div>
              <Link
                href={`/my-courses/${item.id}/watch`}
                className="rounded-xl bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                학습하기
              </Link>
            </div>
          ))}
          {vods.length === 0 && <p className="text-sm text-ink-500">구매한 VOD가 없습니다.</p>}
        </div>
      </section>
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold">전자책</h2>
        <div className="mt-4 space-y-3">
          {ebooks.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{item.course.title}</p>
                <p className="text-xs text-ink-400">다운로드 링크는 발급 후 15분간 유효합니다.</p>
              </div>
              <EbookDownloadButton purchaseId={item.id} />
            </div>
          ))}
          {ebooks.length === 0 && <p className="text-sm text-ink-500">구매한 전자책이 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}
