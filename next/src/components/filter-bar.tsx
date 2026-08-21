import Link from "next/link";
import type { CourseFilter } from "@/lib/catalog";

const FILTERS: { id: CourseFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "vod", label: "VOD" },
  { id: "ebook", label: "전자책" },
  { id: "package", label: "패키지" },
];

export function FilterBar({ active }: { active: CourseFilter }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((item) => {
        const selected = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.id === "all" ? "/courses" : `/courses?type=${item.id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${
              selected ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
