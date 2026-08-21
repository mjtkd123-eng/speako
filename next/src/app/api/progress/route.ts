import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { includesVod } from "@/lib/purchases";

const schema = z.object({
  purchaseId: z.string().min(1),
  progress: z.number().min(0).max(100),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: parsed.data.purchaseId },
  });
  if (
    !purchase ||
    purchase.userId !== session.user.id ||
    !purchase.hasAccess ||
    !includesVod(purchase.option)
  ) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const next = Math.max(purchase.vodProgress, Math.round(parsed.data.progress));
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { vodProgress: next },
  });

  return NextResponse.json({ ok: true, progress: next });
}
