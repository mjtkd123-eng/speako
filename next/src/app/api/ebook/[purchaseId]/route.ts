import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { includesEbook } from "@/lib/purchases";

const LINK_TTL_MS = 15 * 60 * 1000;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ purchaseId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { purchaseId } = await ctx.params;
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { course: true },
  });

  if (
    !purchase ||
    purchase.userId !== session.user.id ||
    !purchase.hasAccess ||
    !includesEbook(purchase.option)
  ) {
    return NextResponse.json({ error: "다운로드 권한이 없습니다." }, { status: 403 });
  }

  const issued = Number(new URL(req.url).searchParams.get("exp") ?? Date.now());
  if (Date.now() - issued > LINK_TTL_MS) {
    return NextResponse.json(
      { error: "다운로드 링크가 만료되었습니다. 다시 발급해 주세요." },
      { status: 410 },
    );
  }

  const relative = purchase.course.ebookPath ?? "content/ebooks/sample.pdf";
  const filePath = path.join(process.cwd(), relative);
  let bytes: Buffer;
  try {
    bytes = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const filename = `${purchase.course.slug}.pdf`;
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ purchaseId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { purchaseId } = await ctx.params;
  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (
    !purchase ||
    purchase.userId !== session.user.id ||
    !purchase.hasAccess ||
    !includesEbook(purchase.option)
  ) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const exp = Date.now();
  return NextResponse.json({
    url: `/api/ebook/${purchaseId}?exp=${exp}`,
    expiresAt: new Date(exp + LINK_TTL_MS).toISOString(),
    ttlMinutes: 15,
  });
}
