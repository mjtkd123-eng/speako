import type { UiLang } from '@/i18n';
import {
  POINTS_PER_USD,
  LESSON_POINT_CAP_RATIO,
  POINT_EXPIRY_DAYS,
  formatUsdFromPoints,
} from '@/lib/point-ledger';

export {
  POINTS_PER_USD,
  LESSON_POINT_CAP_RATIO,
  POINT_EXPIRY_DAYS,
  formatUsdFromPoints,
};

export const VERIFIED_TUTOR_ADOPT_BONUS = 50;
export const AUTO_CLOSE_HOURS = 72;

export type QaCategory =
  | 'grammar'
  | 'writing'
  | 'pronunciation'
  | 'culture'
  | 'translation'
  | 'exam'
  | 'business'
  | 'beginner';

export type QaLevel = 'beginner' | 'intermediate' | 'advanced';
export type QaPurpose = 'daily' | 'exam' | 'business';
export type CorrectionReason = 'grammar' | 'vocab' | 'naturalness' | 'politeness' | 'other';

export type CorrectionSegment = {
  id: string;
  originalText: string;
  correctedText: string;
  reason: CorrectionReason;
};

export type QaAnswer = {
  id: string;
  authorName: string;
  authorId: string;
  isVerifiedTutor: boolean;
  body: string;
  corrections: CorrectionSegment[];
  likeCount: number;
  likedByMe?: boolean;
  voiceSeconds?: number;
  createdAtLabel: Record<UiLang, string>;
};

export type QaQuestion = {
  id: string;
  askerName: string;
  askerId: string;
  isMine?: boolean;
  category: QaCategory;
  level: QaLevel;
  purpose: QaPurpose;
  title: Record<UiLang, string>;
  body: Record<UiLang, string>;
  languagePair: string;
  bountyPoints: number;
  status: 'open' | 'answered' | 'adopted';
  adoptedAnswerId?: string;
  answerCount: number;
  voiceSeconds?: number;
  createdAtLabel: Record<UiLang, string>;
  answers: QaAnswer[];
};

export type DailyMission = {
  id: string;
  title: Record<UiLang, string>;
  rewardPoints: number;
  done?: boolean;
};

export const QA_CATEGORIES: {
  id: QaCategory;
  label: Record<UiLang, string>;
  bounty: [number, number, number];
}[] = [
  { id: 'grammar', label: { KR: '문법 교정', EN: 'Grammar' }, bounty: [30, 80, 150] },
  { id: 'writing', label: { KR: '작문 피드백', EN: 'Writing' }, bounty: [80, 200, 400] },
  { id: 'pronunciation', label: { KR: '발음/음성', EN: 'Pronunciation' }, bounty: [50, 120, 250] },
  { id: 'culture', label: { KR: '문화/표현', EN: 'Culture' }, bounty: [40, 100, 200] },
  { id: 'translation', label: { KR: '번역 요청', EN: 'Translation' }, bounty: [30, 70, 140] },
  { id: 'exam', label: { KR: '시험 대비', EN: 'Exam prep' }, bounty: [60, 150, 300] },
  { id: 'business', label: { KR: '비즈니스', EN: 'Business' }, bounty: [80, 180, 350] },
  { id: 'beginner', label: { KR: '초급 전용', EN: 'Beginner' }, bounty: [20, 50, 100] },
];

export const CORRECTION_REASONS: { id: CorrectionReason; label: Record<UiLang, string> }[] = [
  { id: 'grammar', label: { KR: '문법', EN: 'Grammar' } },
  { id: 'vocab', label: { KR: '어휘', EN: 'Vocab' } },
  { id: 'naturalness', label: { KR: '자연스러움', EN: 'Natural' } },
  { id: 'politeness', label: { KR: '존댓말/톤', EN: 'Tone' } },
  { id: 'other', label: { KR: '기타', EN: 'Other' } },
];

export const DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'one_sentence',
    title: { KR: '오늘의 한 문장', EN: 'One sentence today' },
    rewardPoints: 15,
  },
  {
    id: 'pronounce_10s',
    title: { KR: '10초 발음 챌린지', EN: '10s pronunciation' },
    rewardPoints: 20,
  },
  {
    id: 'correct_once',
    title: { KR: '고쳐주기 1회', EN: 'Correct once' },
    rewardPoints: 25,
    done: true,
  },
  {
    id: 'thank_you',
    title: { KR: '감사 한마디', EN: 'Say thanks' },
    rewardPoints: 10,
  },
  {
    id: 'weekend_quiz',
    title: { KR: '주말 짝 퀴즈 라이트', EN: 'Weekend buddy quiz' },
    rewardPoints: 30,
  },
];

export const MOCK_BALANCE = 2400;

export const MOCK_QUESTIONS: QaQuestion[] = [
  {
    id: 'q1',
    askerName: 'Mina',
    askerId: 'u-mina',
    isMine: true,
    category: 'grammar',
    level: 'beginner',
    purpose: 'daily',
    title: {
      KR: '“went to store” 앞에 the가 필요한가요?',
      EN: 'Do I need “the” before “store”?',
    },
    body: {
      KR: 'I went to store yesterday. 이 문장이 맞나요?',
      EN: 'I wrote: “I went to store yesterday.” Is this correct?',
    },
    languagePair: 'ko-en',
    bountyPoints: 80,
    status: 'answered',
    answerCount: 2,
    createdAtLabel: { KR: '2시간 전', EN: '2h ago' },
    answers: [
      {
        id: 'a1',
        authorName: 'Emma',
        authorId: 'u-emma',
        isVerifiedTutor: true,
        body: '관사 the가 필요해요. 이유를 짧게 적었어요.',
        corrections: [
          {
            id: 'c1',
            originalText: 'I went to store yesterday.',
            correctedText: 'I went to the store yesterday.',
            reason: 'grammar',
          },
        ],
        likeCount: 4,
        voiceSeconds: 9,
        createdAtLabel: { KR: '1시간 전', EN: '1h ago' },
      },
      {
        id: 'a2',
        authorName: 'Ken',
        authorId: 'u-ken',
        isVerifiedTutor: false,
        body: '특정한 가게를 말할 때 the를 씁니다.',
        corrections: [
          {
            id: 'c2',
            originalText: 'to store',
            correctedText: 'to the store',
            reason: 'grammar',
          },
        ],
        likeCount: 1,
        createdAtLabel: { KR: '40분 전', EN: '40m ago' },
      },
    ],
  },
  {
    id: 'q2',
    askerName: 'Carlos',
    askerId: 'u-carlos',
    category: 'writing',
    level: 'intermediate',
    purpose: 'daily',
    title: {
      KR: '일기 한 단락 교정 부탁해요',
      EN: 'Please correct my diary paragraph',
    },
    body: {
      KR: 'Today I am cooking kimchi stew for my roommate. It is smell good and I feel happy.',
      EN: 'Today I am cooking kimchi stew for my roommate. It is smell good and I feel happy.',
    },
    languagePair: 'es-ko',
    bountyPoints: 200,
    status: 'open',
    answerCount: 0,
    createdAtLabel: { KR: '35분 전', EN: '35m ago' },
    answers: [],
  },
  {
    id: 'q3',
    askerName: 'Yuki',
    askerId: 'u-yuki',
    category: 'pronunciation',
    level: 'beginner',
    purpose: 'daily',
    title: {
      KR: '“감사합니다” 발음 확인해 주세요',
      EN: 'Check my “thank you” pronunciation',
    },
    body: {
      KR: '음성으로 녹음했어요. 자연스럽게 들리나요?',
      EN: 'I recorded my voice — does it sound natural?',
    },
    languagePair: 'ja-ko',
    bountyPoints: 120,
    status: 'open',
    answerCount: 1,
    voiceSeconds: 10,
    createdAtLabel: { KR: '1시간 전', EN: '1h ago' },
    answers: [
      {
        id: 'a3',
        authorName: 'Sora',
        authorId: 'u-sora',
        isVerifiedTutor: false,
        body: '마지막 음절을 조금 더 가볍게 말해 보세요.',
        corrections: [],
        likeCount: 2,
        voiceSeconds: 12,
        createdAtLabel: { KR: '20분 전', EN: '20m ago' },
      },
    ],
  },
  {
    id: 'q4',
    askerName: 'Alex',
    askerId: 'u-alex',
    category: 'business',
    level: 'advanced',
    purpose: 'business',
    title: {
      KR: '미팅 일정 조율 이메일 톤',
      EN: 'Tone for a meeting reschedule email',
    },
    body: {
      KR: 'Can we move the meeting to next Tuesday? 더 공손하게 쓰고 싶어요.',
      EN: 'I drafted: “Can we move the meeting to next Tuesday?” Want a more polite tone.',
    },
    languagePair: 'ko-en',
    bountyPoints: 180,
    status: 'adopted',
    adoptedAnswerId: 'a4',
    answerCount: 1,
    createdAtLabel: { KR: '어제', EN: 'Yesterday' },
    answers: [
      {
        id: 'a4',
        authorName: 'Jordan',
        authorId: 'u-jordan',
        isVerifiedTutor: true,
        body: '비즈니스에서는 양해를 구하는 표현이 자연스러워요.',
        corrections: [
          {
            id: 'c4',
            originalText: 'Can we move the meeting to next Tuesday?',
            correctedText:
              'Would it be possible to reschedule our meeting to next Tuesday?',
            reason: 'politeness',
          },
        ],
        likeCount: 7,
        createdAtLabel: { KR: '어제', EN: 'Yesterday' },
      },
    ],
  },
];

export function categoryLabel(id: QaCategory, lang: UiLang) {
  return QA_CATEGORIES.find((c) => c.id === id)?.label[lang] ?? id;
}

export function suggestedBounty(category: QaCategory) {
  return QA_CATEGORIES.find((c) => c.id === category)?.bounty[1] ?? 80;
}

export function bountyRange(category: QaCategory) {
  return QA_CATEGORIES.find((c) => c.id === category)?.bounty ?? ([30, 80, 150] as const);
}

/** Split escrow on adopt: 80% adopter, 10% like runner-up, 10% platform */
export function splitBounty(bounty: number, opts: { verifiedTutor: boolean; runnerUpLikes: boolean }) {
  const platform = Math.round(bounty * 0.1);
  const runnerUp = opts.runnerUpLikes ? Math.round(bounty * 0.1) : 0;
  const adopter = bounty - platform - runnerUp;
  const tutorBonus = opts.verifiedTutor ? VERIFIED_TUTOR_ADOPT_BONUS : 0;
  return { adopter, runnerUp, platform, tutorBonus, totalToAdopter: adopter + tutorBonus };
}

