/**
 * Speako lesson cancellation / refund policy (source of truth).
 * Windows are measured from scheduled lesson start time.
 */
export const REFUND_POLICY = {
  tiers: [
    {
      id: 'full',
      window: {
        KR: '수업 시작 24시간 이전',
        EN: 'More than 24 hours before the lesson',
      },
      student: {
        KR: '100% 환불 또는 횟수 차감 없음',
        EN: '100% refund, or no lesson credit deducted',
      },
      tutor: {
        KR: '수업료 미지급 (정상 취소)',
        EN: 'No lesson payout (valid cancellation)',
      },
    },
    {
      id: 'half',
      window: {
        KR: '24시간 ~ 12시간 전',
        EN: '24 hours to 12 hours before the lesson',
      },
      student: {
        KR: '50% 환불 또는 수업료의 50% 차감',
        EN: '50% refund, or 50% of the lesson fee deducted',
      },
      tutor: {
        KR: '수업료의 50% 정산',
        EN: '50% of the lesson fee paid out',
      },
    },
    {
      id: 'none',
      window: {
        KR: '12시간 미만 ~ 당일',
        EN: 'Less than 12 hours before / same day',
      },
      student: {
        KR: '환불 불가',
        EN: 'No refund',
      },
      tutor: {
        KR: '강사에게 수업료 100% 지급',
        EN: 'Tutor receives 100% of the lesson fee',
      },
    },
  ],
  exceptions: {
    KR: '튜터 사전 취소·플랫폼 장애로 수업이 진행되지 못한 경우 수강생에게 전액 보전됩니다. 튜터 노쇼(시작 후 10분 미입실)는 100% 환불+보상 쿠폰이 적용됩니다.',
    EN: 'If the tutor cancels in advance or a platform outage prevents the lesson, the learner is fully credited. Tutor no-show (not joined within 10 minutes of start) triggers 100% refund + compensation coupon.',
  },
} as const;

export function refundPolicyFaqAnswer(lang: 'KR' | 'EN'): string {
  if (lang === 'KR') {
    return [
      '수업 취소·환불은 시작 시각 기준으로 아래와 같습니다.',
      '• 24시간 이전: 100% 환불 또는 횟수 차감 없음',
      '• 24시간 ~ 12시간 전: 50% 환불 또는 수업료의 50% 차감',
      '• 12시간 미만 ~ 당일: 환불 불가 (강사에게 수업료 100% 지급)',
      REFUND_POLICY.exceptions.KR,
    ].join('\n');
  }
  return [
    'Cancellations are based on time until lesson start:',
    '• More than 24 hours before: 100% refund, or no lesson credit deducted',
    '• 24–12 hours before: 50% refund, or 50% of the lesson fee deducted',
    '• Less than 12 hours / same day: no refund (tutor receives 100% of the lesson fee)',
    REFUND_POLICY.exceptions.EN,
  ].join('\n');
}
