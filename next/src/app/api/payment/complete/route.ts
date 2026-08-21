import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPortOneConfigured } from "@/lib/portone";
import { fulfillDemoPurchase, fulfillPortOnePayment } from "@/lib/purchases";

async function complete(params: {
  paymentId?: string;
  purchaseId?: string;
  demo?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (params.demo && params.purchaseId) {
    const purchase = await prisma.purchase.findUnique({ where: { id: params.purchaseId } });
    if (!purchase || purchase.userId !== session.user.id) {
      return NextResponse.json({ error: "구매 내역이 없습니다." }, { status: 404 });
    }
    const paid = purchase.hasAccess ? purchase : await fulfillDemoPurchase(purchase.id);
    return NextResponse.json({ ok: true, hasAccess: paid.hasAccess, purchaseId: paid.id });
  }

  if (!params.paymentId || !params.purchaseId) {
    return NextResponse.json({ error: "paymentId와 purchaseId가 필요합니다." }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({ where: { id: params.purchaseId } });
  if (!purchase || purchase.userId !== session.user.id) {
    return NextResponse.json({ error: "구매 내역이 없습니다." }, { status: 404 });
  }
  if (purchase.hasAccess) {
    return NextResponse.json({ ok: true, hasAccess: true, purchaseId: purchase.id });
  }

  if (!isPortOneConfigured()) {
    return NextResponse.json({ error: "PortOne이 설정되지 않았습니다." }, { status: 400 });
  }

  const paid = await fulfillPortOnePayment({
    paymentId: params.paymentId,
    purchaseId: purchase.id,
    expectedAmount: purchase.amountGross,
  });

  return NextResponse.json({ ok: true, hasAccess: paid.hasAccess, purchaseId: paid.id });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return complete({
    paymentId: url.searchParams.get("paymentId") ?? undefined,
    purchaseId: url.searchParams.get("purchaseId") ?? undefined,
    demo: url.searchParams.get("demo") === "1",
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    paymentId?: string;
    purchaseId?: string;
    demo?: boolean;
  } | null;
  return complete({
    paymentId: body?.paymentId,
    purchaseId: body?.purchaseId,
    demo: Boolean(body?.demo),
  });
}
