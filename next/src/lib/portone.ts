export const PG_FEE_RATE = 0.033;

export function isPortOneConfigured() {
  return Boolean(
    process.env.PORTONE_API_SECRET &&
      process.env.NEXT_PUBLIC_PORTONE_STORE_ID &&
      process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
  );
}

export function calcPgFee(gross: number) {
  return Math.round(gross * PG_FEE_RATE);
}

export function calcNetPayout(gross: number, pgFee: number, platformFee = 0) {
  return Math.max(0, gross - pgFee - platformFee);
}

export type PortOnePayment = {
  id: string;
  status: string;
  amount?: { total?: number };
  orderName?: string;
};

export async function fetchPortOnePayment(paymentId: string): Promise<PortOnePayment> {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) throw new Error("PORTONE_API_SECRET is not set");

  const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${secret}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PortOne 조회 실패 (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as PortOnePayment;
}

export function isPortOnePaid(status: string) {
  return status === "PAID" || status === "PARTIAL_CANCELLED";
}
