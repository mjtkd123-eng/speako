export type FaqAudience = 'student' | 'tutor';

export type FaqCategory =
  | 'lesson'
  | 'payment'
  | 'safety'
  | 'payout';

export type FaqItem = {
  id: string;
  audience: FaqAudience[];
  category: FaqCategory;
  question: { KR: string; EN: string };
  answer: { KR: string; EN: string };
  keywords?: string[];
};

/**
 * Speako FAQ dataset (page source of truth).
 * Categories: lesson=수업/예약, payment=결제/환불, safety=안전/직거래, payout=정산/수수료
 */
export const FAQ_PAGE_ITEMS: FaqItem[] = [
  {
    id: 'cancel-24h-refund',
    audience: ['student', 'tutor'],
    category: 'payment',
    question: {
      KR: '수업 취소 시 환불은 어떻게 되나요?',
      EN: 'What is the lesson cancellation refund policy?',
    },
    answer: {
      KR: '수업 시작 시각 기준입니다. 24시간 이전: 100% 환불 또는 횟수 차감 없음. 24시간~12시간 전: 50% 환불 또는 수업료의 50% 차감. 12시간 미만~당일: 환불 불가(강사에게 수업료 100% 지급). 튜터 사전 취소·플랫폼 장애 시 수강생 전액 보전.',
      EN: 'Based on time until start. >24h: 100% refund or no credit deducted. 24–12h: 50% refund or 50% fee deducted. <12h/same day: no refund (tutor paid 100%). Tutor cancel or platform outage: learner fully credited.',
    },
    keywords: ['취소', '환불', '24시간', '12시간', 'cancel', 'refund'],
  },
  {
    id: 'no-kakao-contact',
    audience: ['student', 'tutor'],
    category: 'safety',
    question: {
      KR: '튜터와 카카오톡 등 개인 연락처를 교환해도 되나요?',
      EN: 'Can I exchange KakaoTalk or other personal contacts with a tutor?',
    },
    answer: {
      KR: '아니요. 전화번호, 카카오톡/라인 ID, 계좌번호 등 개인 연락처 교환과 플랫폼 밖 직거래는 금지됩니다. 위반이 확인되면 경고·이용 제한·계정 정지 등 제재가 적용되며, 외부 거래 피해는 보상되지 않습니다. 모든 수업·결제는 Speako 안에서만 진행해 주세요.',
      EN: 'No. Sharing phone numbers, KakaoTalk/LINE IDs, bank details, or arranging off-platform deals is prohibited. Violations can lead to warnings, restrictions, or suspension, and off-platform losses are not covered. Keep lessons and payments inside Speako.',
    },
    keywords: ['카톡', '연락처', '직거래', 'kakao', 'safety'],
  },
  {
    id: 'video-join-troubleshoot',
    audience: ['student', 'tutor'],
    category: 'lesson',
    question: {
      KR: '화상 수업 접속 오류가 나면 어떻게 하나요?',
      EN: 'What should I do if I cannot join the video lesson?',
    },
    answer: {
      KR: '1) Chrome/Edge 최신 버전으로 다시 접속 2) 카메라·마이크 권한 허용 3) VPN/광고 차단 확장 프로그램 일시 해제 4) 다른 기기·네트워크로 재시도. 수업 시작 시각에 입장되지 않으면 고객센터에 거래/수업 번호를 남겨 주세요. 플랫폼 장애로 확인되면 수업권 보전 또는 재예약을 지원합니다.',
      EN: '1) Retry in the latest Chrome/Edge 2) Allow camera/mic permissions 3) Disable VPN/ad blockers temporarily 4) Try another device or network. If you still cannot join at start time, contact support with your lesson ID. Confirmed platform outages are credited or rescheduled.',
    },
    keywords: ['화상', '접속', '오류', 'video', '연결'],
  },
  {
    id: 'tutor-payout-cycle-fee',
    audience: ['tutor'],
    category: 'payout',
    question: {
      KR: '튜터 수강료 정산 주기와 수수료는 어떻게 되나요?',
      EN: 'What is the tutor payout cycle and fee policy?',
    },
    answer: {
      KR: '완료된 수업 수익은 지갑에 적립되며, 출금(환전)은 최소 금액 충족 시 신청할 수 있습니다. 플랫폼 수수료는 튜터 유형·프로모션에 따라 달라질 수 있으며, 정산 화면에서 적용 요율을 확인할 수 있습니다. 수강생이 12시간 미만·당일 취소하면 해당 수업료 100%가 정산에 반영될 수 있습니다. 안전 수칙 위반 시 정산이 일시 동결될 수 있습니다.',
      EN: 'Earnings from completed lessons are credited to your wallet. You can request payout once the minimum threshold is met. Platform fees vary by tutor type/promo and are shown on the payout screen. If a learner cancels under 12 hours/same day, 100% of that lesson fee may be paid out. Payouts may be frozen if safety policies are violated.',
    },
    keywords: ['정산', '수수료', '출금', 'payout', 'commission'],
  },
  {
    id: 'tutor-apply-video-review',
    audience: ['tutor'],
    category: 'lesson',
    question: {
      KR: '튜터 지원과 소개 영상 심사는 어떻게 진행되나요?',
      EN: 'How do tutor applications and intro-video reviews work?',
    },
    answer: {
      KR: '‘강사되기’에서 유형(전문/일반)을 선택한 뒤 기본 정보·소개 영상(필수)·자격 증빙(전문 강사)을 제출합니다. 운영팀이 영상·서류·가이드라인 적합성을 검토하며, 결과는 알림으로 안내됩니다. 보완이 필요하면 재제출을 요청할 수 있습니다. 자세한 기준은 튜터 가이드를 참고하세요.',
      EN: 'In Teach/Become a Tutor, choose professional or community, then submit profile details, a required intro video, and credentials (for professionals). Our team reviews video, documents, and guideline fit; you’ll be notified of the result and may be asked to resubmit. See the Tutor Guide for criteria.',
    },
    keywords: ['지원', '소개 영상', '심사', 'apply', 'onboarding'],
  },
  {
    id: 'tutor-no-show',
    audience: ['student', 'tutor'],
    category: 'payment',
    question: {
      KR: '튜터가 노쇼하면 환불되나요?',
      EN: 'Do I get a refund if the tutor no-shows?',
    },
    answer: {
      KR: '네. 수업 시작 후 10분이 지나도 튜터가 입실하지 않으면 노쇼로 처리됩니다. 수업료 100% 환불(포인트 즉시 복구)과 노쇼 보상 쿠폰이 자동 발급됩니다. 수업 종료 후 24시간 이내 마이페이지에서 신고해 주세요.',
      EN: 'Yes. If the tutor has not joined within 10 minutes of start, it counts as a no-show. You get a 100% refund (points restored immediately) plus an automatic compensation coupon. Report within 24 hours via My Page.',
    },
    keywords: ['노쇼', 'no-show', '환불', '10분'],
  },
  {
    id: 'tutor-lateness',
    audience: ['student', 'tutor'],
    category: 'lesson',
    question: {
      KR: '튜터가 지각하면 어떻게 되나요?',
      EN: 'What happens if a tutor is late?',
    },
    answer: {
      KR: '10분 미만 지각은 지각한 시간만큼 수업이 연장됩니다. 10분 이상 지각 시 수강생이 전액 환불 취소 또는 지각 시간 차감 후 수업 진행 중 선택할 수 있습니다.',
      EN: 'Under 10 minutes late: the lesson is extended by that time. 10+ minutes late: the learner may choose a full refund/cancel or continue with the late time deducted.',
    },
    keywords: ['지각', 'late', '연장'],
  },
  {
    id: 'how-to-book',
    audience: ['student'],
    category: 'lesson',
    question: {
      KR: '첫 수업은 어떻게 예약하나요?',
      EN: 'How do I book my first lesson?',
    },
    answer: {
      KR: '배우고 싶은 언어와 예산을 고른 뒤 튜터 프로필에서 가능한 시간을 선택해 예약합니다. 포인트 구매 후 결제가 완료되면 예약이 확정되고, 시작 시간에 화상룸으로 입장하면 됩니다. 많은 튜터가 트라이얼 요금을 제공합니다.',
      EN: 'Pick a language and budget, choose an available slot on a tutor profile, and pay with points. After payment the booking is confirmed—join the video room at start time. Many tutors offer a trial rate.',
    },
    keywords: ['예약', '첫 수업', 'book'],
  },
  {
    id: 'points-payment',
    audience: ['student'],
    category: 'payment',
    question: {
      KR: '수업 결제는 어떻게 이루어지나요?',
      EN: 'How does lesson payment work?',
    },
    answer: {
      KR: 'Speako는 포인트 기반으로 수업을 결제합니다. 지갑에서 패키지를 구매한 뒤 예약 시 포인트가 차감됩니다. 커뮤니티 등으로 적립한 포인트는 정책에 따라 수업 결제에 일부 사용할 수 있습니다.',
      EN: 'Lessons are paid with Speako points. Buy a package in your wallet, then points are deducted when you book. Community reward points may apply toward lessons per policy caps.',
    },
    keywords: ['포인트', '결제', 'points'],
  },
  {
    id: 'report-user',
    audience: ['student', 'tutor'],
    category: 'safety',
    question: {
      KR: '비매너·성희롱이 있으면 어떻게 신고하나요?',
      EN: 'How do I report abuse or harassment?',
    },
    answer: {
      KR: '채팅/수업 화면의 차단·신고 기능을 사용하거나 안전 가이드의 ‘1:1 신고하기’로 제보해 주세요. 커뮤니티에서 욕설·차별·성희롱이 확인되면 사전 경고 없이 즉시 이용 정지될 수 있습니다.',
      EN: 'Use Block/Report in chat or lessons, or open Report on the Safety Guide. Confirmed swearing, discrimination, or sexual harassment in the community can lead to immediate suspension without prior warning.',
    },
    keywords: ['신고', '성희롱', 'report'],
  },
  {
    id: 'group-class',
    audience: ['student'],
    category: 'lesson',
    question: {
      KR: '그룹수업과 1:1 수업의 차이는 무엇인가요?',
      EN: 'What is the difference between group and 1:1 lessons?',
    },
    answer: {
      KR: '1:1은 개인 맞춤 진도와 피드백에 최적화되어 있고, 그룹수업은 여러 학습자와 함께하는 가성비·연습 중심 형식입니다. 목표와 예산에 맞게 선택하면 됩니다.',
      EN: '1:1 is optimized for personalized pacing and feedback; group classes are shared practice at a lower cost. Choose based on your goals and budget.',
    },
    keywords: ['그룹', '1:1', 'group'],
  },
  {
    id: 'tutor-schedule',
    audience: ['tutor'],
    category: 'lesson',
    question: {
      KR: '수업 가능 시간은 어떻게 설정하나요?',
      EN: 'How do I set my availability?',
    },
    answer: {
      KR: '튜터 대시보드(출시 예정 포함)에서 요일·시간대를 열어 두면 학습자가 해당 슬롯으로 예약합니다. 일정 변경 시 기존 예약 학습자에게 충분히 미리 안내해 주세요.',
      EN: 'Open weekly slots in the tutor dashboard (including upcoming tools) so learners can book those times. Give booked students plenty of notice if you need to change availability.',
    },
    keywords: ['일정', '가능 시간', 'availability'],
  },
  {
    id: 'early-cancel-student',
    audience: ['student', 'tutor'],
    category: 'payment',
    question: {
      KR: '24시간·12시간 구간별 환불 비율은 어떻게 되나요?',
      EN: 'What are the 24h and 12h refund tiers?',
    },
    answer: {
      KR: '24시간 이전은 100% 환불(또는 횟수 미차감), 24~12시간 전은 50% 환불(또는 수업료 50% 차감), 12시간 미만·당일은 환불 불가이며 강사에게 수업료 100%가 지급됩니다. 자세한 표는 환불 정책 페이지를 확인해 주세요.',
      EN: '>24h: 100% refund (or no credit used). 24–12h: 50% refund (or 50% fee). Under 12h/same day: no refund; tutor receives 100%. See the Refund Policy page for the full table.',
    },
    keywords: ['12시간', '50%', '환불 비율', 'refund tier'],
  },
  {
    id: 'tutor-fee-display',
    audience: ['tutor'],
    category: 'payout',
    question: {
      KR: '수업 요금(시급)은 어디에 표시되나요?',
      EN: 'Where is my hourly rate shown?',
    },
    answer: {
      KR: '튜터 지원 시 입력한 수업 요금(USD)이 프로필에 반영됩니다. 변경이 필요하면 고객센터 또는 프로필 설정(제공 시)에서 요청할 수 있습니다.',
      EN: 'The USD hourly rate you set during onboarding appears on your profile. Request changes via support or profile settings when available.',
    },
    keywords: ['시급', '요금', 'rate'],
  },
];

export const FAQ_CATEGORIES: {
  id: FaqCategory | 'all';
  label: { KR: string; EN: string };
}[] = [
  { id: 'all', label: { KR: '전체', EN: 'All' } },
  { id: 'lesson', label: { KR: '수업/예약', EN: 'Lessons' } },
  { id: 'payment', label: { KR: '결제/환불', EN: 'Payments' } },
  { id: 'safety', label: { KR: '안전/직거래', EN: 'Safety' } },
  { id: 'payout', label: { KR: '정산/수수료', EN: 'Payouts' } },
];
