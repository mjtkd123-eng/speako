import { ProductOption } from "@prisma/client";
import type { Course } from "@prisma/client";

export type CourseFilter = "all" | "vod" | "ebook" | "package";

export function optionPrice(course: Course, option: ProductOption) {
  if (option === "VOD") return course.vodPrice;
  if (option === "EBOOK") return course.ebookPrice;
  return course.packagePrice;
}

export function optionLabel(option: ProductOption) {
  if (option === "VOD") return "VOD";
  if (option === "EBOOK") return "전자책";
  return "패키지";
}

export function matchesFilter(course: Course, filter: CourseFilter) {
  if (filter === "all") return true;
  if (filter === "vod") return course.hasVod;
  if (filter === "ebook") return course.hasEbook;
  return course.hasVod && course.hasEbook;
}

export function formatKrw(amount: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(date));
}
