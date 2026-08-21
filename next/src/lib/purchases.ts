import { ProductOption } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calcNetPayout, calcPgFee, fetchPortOnePayment, isPortOnePaid } from "@/lib/portone";
import { optionPrice } from "@/lib/catalog";

export async function createPendingPurchase(input: {
  userId: string;
  courseId: string;
  option: ProductOption;
}) {
  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course) throw new Error("코스를 찾을 수 없습니다.");
  if (input.option === "VOD" && !course.hasVod) throw new Error("VOD를 판매하지 않습니다.");
  if (input.option === "EBOOK" && !course.hasEbook) throw new Error("전자책을 판매하지 않습니다.");
  if (input.option === "PACKAGE" && !(course.hasVod && course.hasEbook)) {
    throw new Error("패키지를 판매하지 않습니다.");
  }

  const existing = await prisma.purchase.findFirst({
    where: {
      userId: input.userId,
      courseId: input.courseId,
      option: input.option,
      hasAccess: true,
    },
  });
  if (existing) return existing;

  const amountGross = optionPrice(course, input.option);
  const pgFee = calcPgFee(amountGross);

  return prisma.purchase.create({
    data: {
      userId: input.userId,
      courseId: input.courseId,
      option: input.option,
      amountGross,
      platformFee: 0,
      stripeFee: pgFee,
      netPayout: calcNetPayout(amountGross, pgFee, 0),
      hasAccess: false,
      status: "PENDING",
    },
  });
}

export async function fulfillDemoPurchase(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) throw new Error("구매 내역이 없습니다.");
  const pgFee = calcPgFee(purchase.amountGross);
  return prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      hasAccess: true,
      status: "PAID",
      platformFee: 0,
      stripeFee: pgFee,
      netPayout: calcNetPayout(purchase.amountGross, pgFee, 0),
      stripeSessionId: purchase.stripeSessionId ?? `demo_${purchaseId}`,
    },
  });
}

export async function fulfillPortOnePayment(input: {
  paymentId: string;
  purchaseId: string;
  expectedAmount: number;
}) {
  const payment = await fetchPortOnePayment(input.paymentId);
  if (!isPortOnePaid(payment.status)) {
    throw new Error("결제가 완료되지 않았습니다.");
  }
  const paidAmount = payment.amount?.total ?? 0;
  if (paidAmount !== input.expectedAmount) {
    throw new Error("결제 금액이 주문 금액과 일치하지 않습니다.");
  }

  const purchase = await prisma.purchase.findUnique({ where: { id: input.purchaseId } });
  if (!purchase) throw new Error("구매 내역이 없습니다.");
  const pgFee = calcPgFee(purchase.amountGross);

  return prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      hasAccess: true,
      status: "PAID",
      stripeSessionId: input.paymentId,
      stripePaymentIntentId: payment.id,
      stripeFee: pgFee,
      platformFee: 0,
      netPayout: calcNetPayout(purchase.amountGross, pgFee, 0),
    },
  });
}

export function includesVod(option: ProductOption) {
  return option === "VOD" || option === "PACKAGE";
}

export function includesEbook(option: ProductOption) {
  return option === "EBOOK" || option === "PACKAGE";
}
