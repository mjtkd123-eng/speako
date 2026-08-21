import { NextResponse } from "next/server";
import { ProductOption } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPortOneConfigured } from "@/lib/portone";
import { createPendingPurchase, fulfillDemoPurchase } from "@/lib/purchases";
import { optionLabel } from "@/lib/catalog";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    courseId?: string;
    option?: ProductOption;
  } | null;
  if (!body?.courseId || !body.option || !["VOD", "EBOOK", "PACKAGE"].includes(body.option)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: body.courseId } });
  if (!course) {
    return NextResponse.json({ error: "코스를 찾을 수 없습니다." }, { status: 404 });
  }

  const purchase = await createPendingPurchase({
    userId: session.user.id,
    courseId: course.id,
    option: body.option,
  });

  if (purchase.hasAccess) {
    return NextResponse.json({ alreadyOwned: true, redirectTo: "/my-courses" });
  }

  if (!isPortOneConfigured()) {
    const paid = await fulfillDemoPurchase(purchase.id);
    return NextResponse.json({
      demo: true,
      purchaseId: paid.id,
      redirectTo: `/checkout/success?demo=1&purchaseId=${paid.id}`,
    });
  }

  const paymentId = `pay_${purchase.id}_${Date.now()}`;
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { stripeSessionId: paymentId },
  });

  return NextResponse.json({
    purchaseId: purchase.id,
    paymentId,
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
    orderName: `${course.title} · ${optionLabel(body.option)}`,
    totalAmount: purchase.amountGross,
    currency: "CURRENCY_KRW",
  });
}
