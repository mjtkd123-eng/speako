/** Lesson-discount points: display value, redeem cap, FIFO spend, 60-day expiry. */

export const POINTS_PER_USD = 100;
/** Max share of lesson price payable with (reward) points */
export const LESSON_POINT_CAP_RATIO = 0.3;
/** Days from earn date until automatic expiry */
export const POINT_EXPIRY_DAYS = 60;

export type PointLot = {
  id: string;
  amountRemaining: number;
  earnedAt: Date;
  expiresAt: Date;
};

export function expiresAtFromEarn(earnedAt: Date, days = POINT_EXPIRY_DAYS): Date {
  const d = new Date(earnedAt.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Max points that may be applied toward a lesson (30% of lesson price in points). */
export function maxLessonPointSpend(lessonPricePoints: number): number {
  if (!Number.isFinite(lessonPricePoints) || lessonPricePoints <= 0) return 0;
  return Math.floor(lessonPricePoints * LESSON_POINT_CAP_RATIO);
}

export function formatUsdFromPoints(points: number, rate = POINTS_PER_USD): string {
  return (points / rate).toFixed(2);
}

/** Sort for FIFO: soonest expiry first, then earliest earn. */
export function sortLotsFifo(lots: PointLot[]): PointLot[] {
  return [...lots].sort((a, b) => {
    const exp = a.expiresAt.getTime() - b.expiresAt.getTime();
    if (exp !== 0) return exp;
    return a.earnedAt.getTime() - b.earnedAt.getTime();
  });
}

/**
 * Deduct `amount` from lots using FIFO (nearest expiry first).
 * Does not mutate input; returns updated lots and whether the full amount was covered.
 */
export function spendPointsFifo(
  lots: PointLot[],
  amount: number,
  now = new Date(),
): { lots: PointLot[]; spent: number; ok: boolean } {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { lots: lots.map((l) => ({ ...l })), spent: 0, ok: true };
  }

  const active = sortLotsFifo(
    lots.filter((l) => l.amountRemaining > 0 && l.expiresAt.getTime() > now.getTime()),
  ).map((l) => ({ ...l }));

  let remaining = Math.floor(amount);
  let spent = 0;

  for (const lot of active) {
    if (remaining <= 0) break;
    const take = Math.min(lot.amountRemaining, remaining);
    lot.amountRemaining -= take;
    remaining -= take;
    spent += take;
  }

  const byId = new Map(active.map((l) => [l.id, l]));
  const next = lots.map((l) => {
    const updated = byId.get(l.id);
    return updated ? { ...updated } : { ...l };
  });

  return { lots: next, spent, ok: remaining === 0 };
}

/** Zero out lots past expiresAt; returns expired total. */
export function expireLots(
  lots: PointLot[],
  now = new Date(),
): { lots: PointLot[]; expiredAmount: number } {
  let expiredAmount = 0;
  const next = lots.map((l) => {
    if (l.amountRemaining > 0 && l.expiresAt.getTime() <= now.getTime()) {
      expiredAmount += l.amountRemaining;
      return { ...l, amountRemaining: 0 };
    }
    return { ...l };
  });
  return { lots: next, expiredAmount };
}

export function availableBalance(lots: PointLot[], now = new Date()): number {
  return lots
    .filter((l) => l.amountRemaining > 0 && l.expiresAt.getTime() > now.getTime())
    .reduce((sum, l) => sum + l.amountRemaining, 0);
}
