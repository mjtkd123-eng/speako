/**
 * Tutor platform commission tiers (source of truth for Tutor Guide / ack modal).
 * Rate is resolved at lesson completion for the current KST calendar month.
 */

export const TUTOR_COMMISSION_POLICY = {
  window: {
    KR: '한국시간(KST) 기준 매월 1일부터 말일까지 집계합니다. 적용 요율은 해당 수업이 완료되는 시점에 확정됩니다.',
    EN: 'Totals run from the 1st to the last day of each month in Korea time (KST). The rate is locked when that lesson is completed.',
  },
  base: {
    KR: '수수료는 수업 정가 전액 기준입니다. 수강생이 포인트로 일부(또는 시범 수업 전액)를 결제한 경우에도 같습니다.',
    EN: 'Commission is taken from the full lesson price, including any portion the learner pays with points (or a 100% point trial).',
  },
  reset: {
    KR: '월 누적 수업 시간과 매출은 매월 1일에 다시 0부터 집계됩니다.',
    EN: 'Monthly hours and revenue reset to zero on the 1st of each month.',
  },
  overlap: {
    KR: '두 가지 이상 조건이 겹치면 더 낮은 수수료(튜터에게 유리한 요율)가 적용됩니다.',
    EN: 'If more than one tier applies, the lower (better for the tutor) rate is used.',
  },
  tiers: [
    {
      id: 'base',
      rate: 0.12,
      name: { KR: '기본 수수료', EN: 'Standard' },
      criteria: {
        KR: '신규 튜터 또는 월 누적 수업 10시간 미만',
        EN: 'New tutors, or under 10 completed lesson hours in the month',
      },
    },
    {
      id: 'good',
      rate: 0.11,
      name: { KR: '우수 튜터', EN: 'High-volume' },
      criteria: {
        KR: '월 누적 수업 10시간 이상 ~ 30시간 미만',
        EN: '10 hours or more and under 30 hours of completed lessons in the month',
      },
    },
    {
      id: 'best',
      rate: 0.1,
      name: { KR: '최우수 튜터', EN: 'Top tutor' },
      criteria: {
        KR: '월 누적 수업 30시간 이상 또는 월 누적 매출 상위 10%',
        EN: '30+ hours in the month, or top 10% of tutors by monthly revenue',
      },
    },
  ],
} as const;

export function formatCommissionPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
