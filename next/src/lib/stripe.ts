import Stripe from "stripe";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_"));
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}

export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? 1000);
export const PLATFORM_COUNTRY = (process.env.PLATFORM_COUNTRY ?? "KR").toUpperCase();

export function calcPlatformFee(gross: number) {
  return Math.round((gross * PLATFORM_FEE_BPS) / 10_000);
}

/** Estimate until the webhook writes balance_transaction.fee. */
export function estimateStripeFee(gross: number, international: boolean) {
  const rate = international ? 0.044 : 0.029;
  return Math.round(gross * rate);
}

export function calcNetPayout(gross: number, stripeFee: number, platformFee: number) {
  return Math.max(0, gross - stripeFee - platformFee);
}
