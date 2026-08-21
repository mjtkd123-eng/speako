import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TUTOR") {
    return NextResponse.json({ error: "튜터만 연결할 수 있습니다." }, { status: 403 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "데모 모드입니다. Stripe 키를 설정하면 Connect 온보딩이 활성화됩니다." },
      { status: 400 },
    );
  }

  const tutor = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!tutor) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const stripe = getStripe();
  let accountId = tutor.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: tutor.email ?? undefined,
      capabilities: { transfers: { requested: true } },
      metadata: { tutorId: tutor.id },
    });
    accountId = account.id;
    await prisma.user.update({
      where: { id: tutor.id },
      data: { stripeAccountId: accountId },
    });
  }

  const origin = new URL(req.url).origin;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/tutor/settlements?connect=refresh`,
    return_url: `${origin}/tutor/settlements?connect=return`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
