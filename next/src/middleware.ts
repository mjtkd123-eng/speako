import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  if (!session?.user && (pathname.startsWith("/my-courses") || pathname.startsWith("/tutor"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "login");
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/tutor") && session?.user?.role !== "TUTOR") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/my-courses/:path*", "/tutor/:path*"],
};
