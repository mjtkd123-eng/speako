/**
 * Tutor no-show & lateness policy (source of truth for FAQ / refund / tutor guide).
 */

export const TUTOR_ATTENDANCE_POLICY = {
  noShow: {
    definition: {
      KR: '수업 시작 후 10분이 지나도 튜터가 입실하지 않은 경우',
      EN: 'The tutor has not joined within 10 minutes after the scheduled start',
    },
    studentBenefit: {
      KR: '수업료 100% 환불(포인트 즉시 복구) + 튜터 노쇼 보상 쿠폰 자동 발급',
      EN: '100% lesson refund (points restored immediately) + automatic no-show compensation coupon',
    },
    tutorPenalties: [
      {
        KR: '해당 수업료 미정산',
        EN: 'No payout for that lesson',
      },
      {
        KR: '프로필 ‘수업 완수율’ 감점',
        EN: 'Completion-rate score on profile is reduced',
      },
      {
        KR: '3회 적발 시 튜터 자격 정지',
        EN: 'Tutor privileges suspended after 3 confirmed cases',
      },
    ],
  },
  lateness: {
    under10: {
      KR: '10분 미만 지각: 지각한 시간만큼 수업 연장 제공',
      EN: 'Under 10 minutes late: extend the lesson by the late time',
    },
    over10: {
      KR: '10분 이상 지각: 수강생이 [전액 환불 취소] 또는 [지각 시간 차감 후 수업 진행] 중 선택',
      EN: '10+ minutes late: learner chooses full refund/cancel or continue with late time deducted',
    },
  },
  reportSteps: [
    {
      title: {
        KR: '수업 문제 신고',
        EN: 'Report a lesson issue',
      },
      desc: {
        KR: '수업 종료 후 24시간 이내 마이페이지에서 [수업 문제 신고]를 클릭합니다.',
        EN: 'Within 24 hours after the lesson, open My Page and tap Report a lesson issue.',
      },
    },
    {
      title: {
        KR: '사유·증거 제출',
        EN: 'Select reason & attach proof',
      },
      desc: {
        KR: '사유(노쇼/지각)를 선택하고 대기 화면 캡처를 첨부합니다.',
        EN: 'Choose No-show or Lateness and attach a waiting-screen screenshot.',
      },
    },
    {
      title: {
        KR: '환불 처리',
        EN: 'Refund processing',
      },
      desc: {
        KR: '운영진/튜터 확인 후 24시간 이내 포인트 환불이 완료됩니다.',
        EN: 'After ops/tutor review, points are refunded within 24 hours.',
      },
    },
  ],
} as const;

export function tutorNoShowFaqAnswer(lang: 'KR' | 'EN'): string {
  const p = TUTOR_ATTENDANCE_POLICY;
  if (lang === 'KR') {
    return `튜터 노쇼는 ${p.noShow.definition.KR}입니다. 수강생에게는 ${p.noShow.studentBenefit.KR}. 자세한 신고 절차는 노쇼·지각 정책 페이지를 확인해 주세요.`;
  }
  return `A tutor no-show means ${p.noShow.definition.EN}. Learners receive ${p.noShow.studentBenefit.EN}. See the No-show & Lateness policy page for the report steps.`;
}

export function tutorLatenessFaqAnswer(lang: 'KR' | 'EN'): string {
  const p = TUTOR_ATTENDANCE_POLICY;
  if (lang === 'KR') {
    return `${p.lateness.under10.KR}. ${p.lateness.over10.KR}.`;
  }
  return `${p.lateness.under10.EN}. ${p.lateness.over10.EN}.`;
}
