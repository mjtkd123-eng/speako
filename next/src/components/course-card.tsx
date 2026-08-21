import Link from "next/link";
import type { Course } from "@prisma/client";
import { formatKrw } from "@/lib/catalog";

export function CourseCard({ course }: { course: Course }) {
  const price =
    course.hasVod && course.hasEbook
      ? course.packagePrice
      : course.hasVod
        ? course.vodPrice
        : course.ebookPrice;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${course.thumbnail})` }}
      />
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {course.hasVod && <Badge tone="violet">VOD</Badge>}
          {course.hasEbook && <Badge tone="amber">전자책</Badge>}
          {course.hasVod && course.hasEbook && <Badge tone="brand">패키지</Badge>}
        </div>
        <h3 className="font-display text-lg font-bold text-ink-900 group-hover:text-brand-700">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-500">{course.subtitle}</p>
        <p className="font-semibold text-ink-900">{formatKrw(price)}~</p>
      </div>
    </Link>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "violet" | "amber" | "brand";
}) {
  const cls =
    tone === "violet"
      ? "bg-violet-50 text-violet-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-brand-50 text-brand-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>
  );
}
