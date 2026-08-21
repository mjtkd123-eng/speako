import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PurchaseCard } from "@/components/purchase-card";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await prisma.course.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { tutor: true },
  });
  if (!course) notFound();

  const session = await auth();

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_340px]">
      <article>
        <div
          className="h-64 rounded-3xl bg-cover bg-center"
          style={{ backgroundImage: `url(${course.thumbnail})` }}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {course.hasVod && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">VOD</span>}
          {course.hasEbook && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">전자책</span>}
          {course.hasVod && course.hasEbook && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">패키지</span>
          )}
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold">{course.title}</h1>
        <p className="mt-2 text-ink-500">{course.subtitle}</p>
        <p className="mt-2 text-sm text-ink-400">튜터 {course.tutor.name}</p>
        <div className="mt-6 whitespace-pre-wrap leading-7 text-ink-700">{course.description}</div>
      </article>
      <PurchaseCard course={course} signedIn={Boolean(session?.user)} />
    </div>
  );
}
