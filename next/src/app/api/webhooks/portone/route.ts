import { NextResponse } from "next/server";
import { fulfillPortOnePayment } from "@/lib/purchases";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  const raw = await req.text();
  if (secret) {
    const header = req.headers.get("webhook-signature") ?? req.headers.get("authorization") ?? "";
    if (!header.includes(secret)) {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
    }
  }

  const body = JSON.parse(raw || "{}") as {
    type?: string;
    data?: { paymentId?: string; transactionId?: string };
  };
  const paymentId = body.data?.paymentId ?? body.data?.transactionId;
  if (!paymentId) return NextResponse.json({ received: true });

  const purchase = await prisma.purchase.findFirst({
    where: { stripeSessionId: paymentId },
  });
  if (!purchase) return NextResponse.json({ received: true });

  try {
    await fulfillPortOnePayment({
      paymentId,
      purchaseId: purchase.id,
      expectedAmount: purchase.amountGross,
    });
  } catch (error) {
    console.error("[portone webhook]", error);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
