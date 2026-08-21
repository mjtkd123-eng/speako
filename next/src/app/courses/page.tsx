import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/course-card";
import { FilterBar } from "@/components/filter-bar";
import { matchesFilter, type CourseFilter } from "@/lib/catalog";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const filter: CourseFilter =
    type === "vod" || type === "ebook" || type === "package" ? type : "all";
  const courses = (await prisma.course.findMany({ orderBy: { createdAt: "desc" } })).filter((c) =>
    matchesFilter(c, filter),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">콘텐츠</h1>
      <div className="mt-6">
        <FilterBar active={filter} />
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      {courses.length === 0 && (
        <p className="mt-12 text-center text-ink-500">해당 유형의 콘텐츠가 없습니다.</p>
      )}
    </div>
  );
}
