import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink-100 bg-ink-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Speako Inc.</p>
        <div className="flex gap-4">
          <Link href="/">1:1 선생님</Link>
        </div>
      </div>
    </footer>
  );
}
