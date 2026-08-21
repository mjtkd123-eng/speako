import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { includesVod } from "@/lib/purchases";

export async function GET(
  _req: Request,
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
    !includesVod(purchase.option)
  ) {
    return NextResponse.json({ error: "시청 권한이 없습니다." }, { status: 403 });
  }

  return NextResponse.json({
    title: purchase.course.title,
    src: purchase.course.vodUrl,
    progress: purchase.vodProgress,
  });
}
