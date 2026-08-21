import type { LucideIcon } from 'lucide-react';
import type { UiLang } from '@/i18n';
import {
  Globe,
  BadgeCheck,
  Sparkles,
  GraduationCap,
  Languages,
  CalendarClock,
  ShieldCheck,
  Wallet,
  HeartHandshake,
  Video,
  Star,
} from 'lucide-react';

export type Language = {
  code: string;
  name: Record<UiLang, string>;
  flag: string;
};

export const LANGUAGES: Language[] = [
  { code: 'af', name: { KR: '아프리칸스어', EN: 'Afrikaans' }, flag: '🇿🇦' },
  { code: 'sq', name: { KR: '알바니아어', EN: 'Albanian' }, flag: '🇦🇱' },
  { code: 'am', name: { KR: '암하라어', EN: 'Amharic' }, flag: '🇪🇹' },
  { code: 'ar', name: { KR: '아랍어', EN: 'Arabic' }, flag: '🇸🇦' },
  { code: 'hy', name: { KR: '아르메니아어', EN: 'Armenian' }, flag: '🇦🇲' },
  { code: 'az', name: { KR: '아제르바이잔어', EN: 'Azerbaijani' }, flag: '🇦🇿' },
  { code: 'eu', name: { KR: '바스크어', EN: 'Basque' }, flag: '🇪🇸' },
  { code: 'be', name: { KR: '벨라루스어', EN: 'Belarusian' }, flag: '🇧🇾' },
  { code: 'bn', name: { KR: '벵골어', EN: 'Bengali' }, flag: '🇧🇩' },
  { code: 'bs', name: { KR: '보스니아어', EN: 'Bosnian' }, flag: '🇧🇦' },
  { code: 'bg', name: { KR: '불가리아어', EN: 'Bulgarian' }, flag: '🇧🇬' },
  { code: 'km', name: { KR: '크메르어', EN: 'Cambodian' }, flag: '🇰🇭' },
  { code: 'ca', name: { KR: '카탈루냐어', EN: 'Catalan' }, flag: '🇪🇸' },
  { code: 'zh', name: { KR: '중국어', EN: 'Chinese' }, flag: '🇨🇳' },
  { code: 'zh-tw', name: { KR: '중국어(대만)', EN: 'Chinese (Taiwan)' }, flag: '🇹🇼' },
  { code: 'hr', name: { KR: '크로아티아어', EN: 'Croatian' }, flag: '🇭🇷' },
  { code: 'cs', name: { KR: '체코어', EN: 'Czech' }, flag: '🇨🇿' },
  { code: 'da', name: { KR: '덴마크어', EN: 'Danish' }, flag: '🇩🇰' },
  { code: 'nl', name: { KR: '네덜란드어', EN: 'Dutch' }, flag: '🇳🇱' },
  { code: 'en', name: { KR: '영어', EN: 'English' }, flag: '🇺🇸' },
  { code: 'en-gb', name: { KR: '영어(영국)', EN: 'English (UK)' }, flag: '🇬🇧' },
  { code: 'et', name: { KR: '에스토니아어', EN: 'Estonian' }, flag: '🇪🇪' },
  { code: 'fi', name: { KR: '핀란드어', EN: 'Finnish' }, flag: '🇫🇮' },
  { code: 'fr', name: { KR: '프랑스어', EN: 'French' }, flag: '🇫🇷' },
  { code: 'gl', name: { KR: '갈리시아어', EN: 'Galician' }, flag: '🇪🇸' },
  { code: 'ka', name: { KR: '조지아어', EN: 'Georgian' }, flag: '🇬🇪' },
  { code: 'de', name: { KR: '독일어', EN: 'German' }, flag: '🇩🇪' },
  { code: 'el', name: { KR: '그리스어', EN: 'Greek' }, flag: '🇬🇷' },
  { code: 'gu', name: { KR: '구자라트어', EN: 'Gujarati' }, flag: '🇮🇳' },
  { code: 'ht', name: { KR: '아이티어', EN: 'Haitian Creole' }, flag: '🇭🇹' },
  { code: 'ha', name: { KR: '하우사어', EN: 'Hausa' }, flag: '🇳🇬' },
  { code: 'he', name: { KR: '히브리어', EN: 'Hebrew' }, flag: '🇮🇱' },
  { code: 'hi', name: { KR: '힌디어', EN: 'Hindi' }, flag: '🇮🇳' },
  { code: 'hu', name: { KR: '헝가리어', EN: 'Hungarian' }, flag: '🇭🇺' },
  { code: 'is', name: { KR: '아이슬란드어', EN: 'Icelandic' }, flag: '🇮🇸' },
  { code: 'ig', name: { KR: '이그보어', EN: 'Igbo' }, flag: '🇳🇬' },
  { code: 'id', name: { KR: '인도네시아어', EN: 'Indonesian' }, flag: '🇮🇩' },
  { code: 'ga', name: { KR: '아일랜드어', EN: 'Irish' }, flag: '🇮🇪' },
  { code: 'it', name: { KR: '이탈리아어', EN: 'Italian' }, flag: '🇮🇹' },
  { code: 'ja', name: { KR: '일본어', EN: 'Japanese' }, flag: '🇯🇵' },
  { code: 'jv', name: { KR: '자바어', EN: 'Javanese' }, flag: '🇮🇩' },
  { code: 'kn', name: { KR: '칸나다어', EN: 'Kannada' }, flag: '🇮🇳' },
  { code: 'kk', name: { KR: '카자흐어', EN: 'Kazakh' }, flag: '🇰🇿' },
  { code: 'rw', name: { KR: '르완다어', EN: 'Kinyarwanda' }, flag: '🇷🇼' },
  { code: 'ko', name: { KR: '한국어', EN: 'Korean' }, flag: '🇰🇷' },
  { code: 'ku', name: { KR: '쿠르드어', EN: 'Kurdish' }, flag: '🇮🇶' },
  { code: 'ky', name: { KR: '키르기스어', EN: 'Kyrgyz' }, flag: '🇰🇬' },
  { code: 'lo', name: { KR: '라오어', EN: 'Lao' }, flag: '🇱🇦' },
  { code: 'la', name: { KR: '라틴어', EN: 'Latin' }, flag: '🇻🇦' },
  { code: 'lv', name: { KR: '라트비아어', EN: 'Latvian' }, flag: '🇱🇻' },
  { code: 'lt', name: { KR: '리투아니아어', EN: 'Lithuanian' }, flag: '🇱🇹' },
  { code: 'lb', name: { KR: '룩셈부르크어', EN: 'Luxembourgish' }, flag: '🇱🇺' },
  { code: 'mk', name: { KR: '마케도니아어', EN: 'Macedonian' }, flag: '🇲🇰' },
  { code: 'ms', name: { KR: '말레이어', EN: 'Malay' }, flag: '🇲🇾' },
  { code: 'ml', name: { KR: '말라얄람어', EN: 'Malayalam' }, flag: '🇮🇳' },
  { code: 'mt', name: { KR: '몰타어', EN: 'Maltese' }, flag: '🇲🇹' },
  { code: 'mr', name: { KR: '마라티어', EN: 'Marathi' }, flag: '🇮🇳' },
  { code: 'mn', name: { KR: '몽골어', EN: 'Mongolian' }, flag: '🇲🇳' },
  { code: 'ne', name: { KR: '네팔어', EN: 'Nepali' }, flag: '🇳🇵' },
  { code: 'no', name: { KR: '노르웨이어', EN: 'Norwegian' }, flag: '🇳🇴' },
  { code: 'ps', name: { KR: '파슈토어', EN: 'Pashto' }, flag: '🇦🇫' },
  { code: 'fa', name: { KR: '페르시아어', EN: 'Persian' }, flag: '🇮🇷' },
  { code: 'pl', name: { KR: '폴란드어', EN: 'Polish' }, flag: '🇵🇱' },
  { code: 'pt', name: { KR: '포르투갈어', EN: 'Portuguese' }, flag: '🇵🇹' },
  { code: 'pt-br', name: { KR: '포르투갈어(브라질)', EN: 'Portuguese (Brazil)' }, flag: '🇧🇷' },
  { code: 'pa', name: { KR: '펀자브어', EN: 'Punjabi' }, flag: '🇮🇳' },
  { code: 'ro', name: { KR: '루마니아어', EN: 'Romanian' }, flag: '🇷🇴' },
  { code: 'ru', name: { KR: '러시아어', EN: 'Russian' }, flag: '🇷🇺' },
  { code: 'sr', name: { KR: '세르비아어', EN: 'Serbian' }, flag: '🇷🇸' },
  { code: 'si', name: { KR: '싱할라어', EN: 'Sinhala' }, flag: '🇱🇰' },
  { code: 'sk', name: { KR: '슬로바키아어', EN: 'Slovak' }, flag: '🇸🇰' },
  { code: 'sl', name: { KR: '슬로베니아어', EN: 'Slovenian' }, flag: '🇸🇮' },
  { code: 'so', name: { KR: '소말리아어', EN: 'Somali' }, flag: '🇸🇴' },
  { code: 'es', name: { KR: '스페인어', EN: 'Spanish' }, flag: '🇪🇸' },
  { code: 'sw', name: { KR: '스와힐리어', EN: 'Swahili' }, flag: '🇰🇪' },
  { code: 'sv', name: { KR: '스웨덴어', EN: 'Swedish' }, flag: '🇸🇪' },
  { code: 'tl', name: { KR: '타갈로그어', EN: 'Tagalog' }, flag: '🇵🇭' },
  { code: 'ta', name: { KR: '타밀어', EN: 'Tamil' }, flag: '🇮🇳' },
  { code: 'te', name: { KR: '텔루구어', EN: 'Telugu' }, flag: '🇮🇳' },
  { code: 'th', name: { KR: '태국어', EN: 'Thai' }, flag: '🇹🇭' },
  { code: 'tr', name: { KR: '튀르키예어', EN: 'Turkish' }, flag: '🇹🇷' },
  { code: 'uk', name: { KR: '우크라이나어', EN: 'Ukrainian' }, flag: '🇺🇦' },
  { code: 'ur', name: { KR: '우르두어', EN: 'Urdu' }, flag: '🇵🇰' },
  { code: 'uz', name: { KR: '우즈베크어', EN: 'Uzbek' }, flag: '🇺🇿' },
  { code: 'vi', name: { KR: '베트남어', EN: 'Vietnamese' }, flag: '🇻🇳' },
  { code: 'cy', name: { KR: '웨일스어', EN: 'Welsh' }, flag: '🇬🇧' },
  { code: 'yo', name: { KR: '요루바어', EN: 'Yoruba' }, flag: '🇳🇬' },
  { code: 'zu', name: { KR: '줄루어', EN: 'Zulu' }, flag: '🇿🇦' },
];

/** 예전 내비 드롭다운과 같은 인기 학습 언어 Top 10 순서 */
export const POPULAR_LANGUAGE_CODES = [
  'en',
  'en-gb',
  'es',
  'fr',
  'it',
  'ko',
  'de',
  'ja',
  'zh',
  'pt',
] as const;

export function getLanguagesByPopularity(): {
  popular: Language[];
  other: Language[];
} {
  const byCode = new Map(LANGUAGES.map((l) => [l.code, l]));
  const popular: Language[] = [];
  const popularSet = new Set<string>();

  for (const code of POPULAR_LANGUAGE_CODES) {
    const found = byCode.get(code);
    if (found) {
      popular.push(found);
      popularSet.add(code);
    }
  }

  const other = LANGUAGES.filter((l) => !popularSet.has(l.code)).sort((a, b) =>
    a.name.EN.localeCompare(b.name.EN),
  );

  return { popular, other };
}

type Bi = Record<UiLang, string>;

export type Tutor = {
  id: string;
  name: string;
  avatar: string;
  teaches: Bi;
  teachesCode: string;
  flag: string;
  nationality: Bi;
  rating: number;
  reviews: number;
  lessons: number;
  price: number;
  trialPrice: number;
  tags: Bi[];
  bio: Bi;
  speaks: Bi[];
  badge?: 'super' | 'new' | 'pro';
};

export const TUTORS: Tutor[] = [
  {
    id: 't1',
    name: 'Emma Wilson',
    avatar: 'https://images.pexels.com/photos/38707525/pexels-photo-38707525.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    teaches: { KR: '영어', EN: 'English' },
    teachesCode: 'en',
    flag: '🇺🇸',
    nationality: { KR: '미국', EN: 'USA' },
    rating: 5.0,
    reviews: 312,
    lessons: 1840,
    price: 28000,
    trialPrice: 12000,
    tags: [
      { KR: '비즈니스 영어', EN: 'Business English' },
      { KR: '회화', EN: 'Conversation' },
      { KR: 'IELTS', EN: 'IELTS' },
    ],
    bio: {
      KR: '8년 차 공인 영어 강사. 비즈니스 영어와 IELTS 대비 밀착 코칭.',
      EN: 'Certified English instructor with 8 years of experience. Business English and IELTS coaching.',
    },
    speaks: [
      { KR: '영어(원어민)', EN: 'English (Native)' },
      { KR: '한국어(중급)', EN: 'Korean (Intermediate)' },
    ],
    badge: 'super',
  },
  {
    id: 't2',
    name: 'Haruto Tanaka',
    avatar: 'https://images.pexels.com/photos/14950779/pexels-photo-14950779.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    teaches: { KR: '일본어', EN: 'Japanese' },
    teachesCode: 'ja',
    flag: '🇯🇵',
    nationality: { KR: '일본', EN: 'Japan' },
    rating: 4.9,
    reviews: 208,
    lessons: 1120,
    price: 24000,
    trialPrice: 10000,
    tags: [
      { KR: 'JLPT 대비', EN: 'JLPT Prep' },
      { KR: '일상 회화', EN: 'Daily Conversation' },
      { KR: '비즈니스', EN: 'Business' },
    ],
    bio: {
      KR: '도쿄 출신. JLPT N1~N5까지 레벨 맞춤 커리큘럼 제공.',
      EN: 'From Tokyo. Level-tailored curriculum for JLPT N1–N5.',
    },
    speaks: [
      { KR: '일본어(원어민)', EN: 'Japanese (Native)' },
      { KR: '영어(고급)', EN: 'English (Advanced)' },
    ],
    badge: 'pro',
  },
  {
    id: 't3',
    name: 'Sofia García',
    avatar: 'https://images.pexels.com/photos/7752808/pexels-photo-7752808.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    teaches: { KR: '스페인어', EN: 'Spanish' },
    teachesCode: 'es',
    flag: '🇪🇸',
    nationality: { KR: '스페인', EN: 'Spain' },
    rating: 5.0,
    reviews: 176,
    lessons: 940,
    price: 22000,
    trialPrice: 9000,
    tags: [
      { KR: 'DELE', EN: 'DELE' },
      { KR: '회화', EN: 'Conversation' },
      { KR: '여행 스페인어', EN: 'Travel Spanish' },
    ],
    bio: {
      KR: '마드리드 출신. DELE 시험 대비와 실생활 회화 특화.',
      EN: 'From Madrid. Specializes in DELE prep and everyday conversation.',
    },
    speaks: [
      { KR: '스페인어(원어민)', EN: 'Spanish (Native)' },
      { KR: '영어(고급)', EN: 'English (Advanced)' },
      { KR: '프랑스어(중급)', EN: 'French (Intermediate)' },
    ],
    badge: 'super',
  },
  {
    id: 't4',
    name: 'Min-jun Kim',
    avatar: 'https://images.pexels.com/photos/35681211/pexels-photo-35681211.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    teaches: { KR: '한국어', EN: 'Korean' },
    teachesCode: 'ko',
    flag: '🇰🇷',
    nationality: { KR: '한국', EN: 'Korea' },
    rating: 4.9,
    reviews: 143,
    lessons: 620,
    price: 20000,
    trialPrice: 8000,
    tags: [
      { KR: 'TOPIK', EN: 'TOPIK' },
      { KR: '발음 교정', EN: 'Pronunciation' },
      { KR: 'K-컬처', EN: 'K-Culture' },
    ],
    bio: {
      KR: 'TOPIK 대비와 K-드라마/문화 기반 학습으로 재미있게 한국어를.',
      EN: 'Fun Korean learning through TOPIK prep and K-drama/culture.',
    },
    speaks: [
      { KR: '한국어(원어민)', EN: 'Korean (Native)' },
      { KR: '영어(고급)', EN: 'English (Advanced)' },
      { KR: '일본어(중급)', EN: 'Japanese (Intermediate)' },
    ],
    badge: 'new',
  },
];

export type Feature = {
  icon: LucideIcon;
  title: Bi;
  description: Bi;
  accent: string;
};

export const FEATURES: Feature[] = [
  {
    icon: GraduationCap,
    title: { KR: '1:1 맞춤 수업', EN: '1:1 Personalized Lessons' },
    description: {
      KR: '내 수준과 목표에 딱 맞춘 커리큘럼. 튜터와 함께 학습 계획을 세우고 매 수업마다 피드백을 받아요.',
      EN: 'A curriculum tailored to your level and goals. Plan with your tutor and get feedback every lesson.',
    },
    accent: 'primary',
  },
  {
    icon: Wallet,
    title: { KR: '합리적인 가격', EN: 'Affordable Pricing' },
    description: {
      KR: '내 예산에 맞는 튜터를 자유롭게 선택. 첫 수업은 트라이얼 가격으로 부담 없이 시작할 수 있어요.',
      EN: 'Choose a tutor that fits your budget. Start with a trial lesson at a reduced price.',
    },
    accent: 'accent',
  },
  {
    icon: ShieldCheck,
    title: { KR: '검증된 튜터', EN: 'Verified Tutors' },
    description: {
      KR: '모든 튜터는 자격증·경력·데모 수업 심사를 통과한 전문가. 안심하고 학습하세요.',
      EN: 'Every tutor passes credential, experience, and demo lesson screening. Learn with confidence.',
    },
    accent: 'brand',
  },
];

export type Stat = { value: string; labelKey: 'languages' | 'tutors' | 'lessons' | 'rating' };

export const STATS: Stat[] = [
  { value: '150+', labelKey: 'languages' },
  { value: '30,000+', labelKey: 'tutors' },
  { value: '2.4M+', labelKey: 'lessons' },
  { value: '4.9/5', labelKey: 'rating' },
];

export type Step = { icon: LucideIcon; title: Bi; description: Bi };

export const STEPS: Step[] = [
  {
    icon: Languages,
    title: { KR: '언어와 튜터 찾기', EN: 'Find Your Language & Tutor' },
    description: {
      KR: '배우고 싶은 언어를 고르고, 가격·시간·스타일로 튜터를 검색하세요.',
      EN: 'Pick a language and search tutors by price, time, and teaching style.',
    },
  },
  {
    icon: CalendarClock,
    title: { KR: '수업 시간 예약', EN: 'Book a Time Slot' },
    description: {
      KR: '원하는 날짜와 시간에 예약. 첫 수업은 트라이얼 가격으로 가볍게.',
      EN: 'Book your preferred date and time. Start light with a trial lesson.',
    },
  },
  {
    icon: Video,
    title: { KR: '1:1 화상 수업', EN: '1:1 Video Lesson' },
    description: {
      KR: '플랫폼 내 화상룸에서 바로 수업. 자료 공유와 실시간 피드백까지.',
      EN: 'Join the built-in video room. Share materials and get real-time feedback.',
    },
  },
  {
    icon: Star,
    title: { KR: '후기로 성장', EN: 'Grow with Reviews' },
    description: {
      KR: '수업 후 리뷰를 남기고, 다음 목표를 튜터와 함께 조정해요.',
      EN: 'Leave a review after class and adjust your next goals with your tutor.',
    },
  },
];

export type Testimonial = {
  name: string;
  role: Bi;
  avatar: string;
  text: Bi;
  rating: number;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Ji-woo Park',
    role: { KR: '영어 학습자 · 직장인', EN: 'English learner · Professional' },
    avatar: 'https://images.pexels.com/photos/8199255/pexels-photo-8199255.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    text: {
      KR: '매일 아침 30분 원어민과 회화하니 3개월 만에 미팅이 편해졌어요. 튜터가 내 업무 맥락까지 알아서 맞춰줍니다.',
      EN: '30 minutes of conversation every morning with a native speaker made meetings comfortable in 3 months. My tutor tailors lessons to my work context.',
    },
    rating: 5,
  },
  {
    name: 'Seo-yeon Lee',
    role: { KR: '일본어 학습자 · 대학생', EN: 'Japanese learner · Student' },
    avatar: 'https://images.pexels.com/photos/6893810/pexels-photo-6893810.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    text: {
      KR: 'JLPT N2 합격! 문법만 외우던 게 아니라 진짜 대화로 익혀서 듣기도 자신감이 생겼어요.',
      EN: 'Passed JLPT N2! Learning through real conversation, not just memorizing grammar, gave me confidence in listening too.',
    },
    rating: 5,
  },
  {
    name: 'Hyun-woo Choi',
    role: { KR: '스페인어 학습자 · 여행가', EN: 'Spanish learner · Traveler' },
    avatar: 'https://images.pexels.com/photos/4492194/pexels-photo-4492194.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    text: {
      KR: '남미 여행 전 2주 집중 수업. 튜터가 여행 상황별 표현을 짚어줘서 도착하자마자 소통이 됐어요.',
      EN: 'Two weeks of intensive lessons before a South America trip. My tutor covered travel-specific phrases so I could communicate the moment I arrived.',
    },
    rating: 5,
  },
];

export type Faq = { q: Bi; a: Bi };

export const FAQS: Faq[] = [
  {
    q: { KR: '처음 이용하는데 어떻게 시작하나요?', EN: 'How do I get started?' },
    a: {
      KR: '배우고 싶은 언어를 고르고 튜터를 검색한 뒤, 원하는 시간에 예약하세요. 첫 수업은 트라이얼 가격으로 부담 없이 시작할 수 있어요.',
      EN: 'Pick a language, search for a tutor, and book a time that works for you. Start with a trial lesson at a reduced price.',
    },
  },
  {
    q: { KR: '수업은 어떻게 진행되나요?', EN: 'How are lessons conducted?' },
    a: {
      KR: '예약 시간에 맞춰 플랫폼 내 화상룸에 입장하면 됩니다. 별도 앱 설치 없이 브라우저에서 바로 1:1 화상 수업이 진행돼요.',
      EN: 'Join the in-platform video room at your booked time. No app install needed — 1:1 video lessons run right in your browser.',
    },
  },
  {
    q: { KR: '튜터는 어떻게 검증되나요?', EN: 'How are tutors verified?' },
    a: {
      KR: '모든 튜터는 자격증·경력 확인과 데모 수업 심사를 거칩니다. 학습자 리뷰도 공개되어 있어 선택에 참고할 수 있어요.',
      EN: 'Every tutor passes credential, experience, and demo lesson screening. Learner reviews are public to help you choose.',
    },
  },
  {
    q: { KR: '결제와 환불은 어떻게 되나요?', EN: 'How do payments and refunds work?' },
    a: {
      KR: '수업 단위로 결제합니다. 취소 시 환불: 24시간 이전 100% 환불(또는 횟수 미차감), 24~12시간 전 50% 환불(또는 수업료 50% 차감), 12시간 미만·당일 환불 불가(강사 100% 지급). 튜터 사전 취소·장애 시 전액 보전.',
      EN: 'Pay per lesson. Cancellations: >24h 100% refund (or no credit used); 24–12h 50% refund (or 50% fee); <12h/same day no refund (tutor paid 100%). Tutor cancel or outage: full learner credit.',
    },
  },
  {
    q: { KR: '언제든 수업을 취소할 수 있나요?', EN: 'Can I cancel a lesson anytime?' },
    a: {
      KR: '언제든 취소할 수 있지만 환불 비율이 달라요. 24시간 이전은 전액, 24~12시간 전은 50%, 12시간 미만·당일은 환불되지 않으며 강사에게 수업료 100%가 지급됩니다.',
      EN: 'You can cancel anytime, but refunds depend on timing: full if >24h out, 50% if 24–12h out, and none under 12h/same day (tutor receives 100%).',
    },
  },
  {
    q: { KR: '튜터가 노쇼·지각하면 어떻게 되나요?', EN: 'What if a tutor no-shows or is late?' },
    a: {
      KR: '시작 후 10분 미입실은 노쇼로 100% 환불+보상 쿠폰이 적용됩니다. 10분 미만 지각은 연장, 10분 이상이면 전액 환불 또는 시간 차감 후 진행을 선택할 수 있어요.',
      EN: 'No join within 10 minutes of start = no-show with 100% refund + coupon. Under 10 min late: extend. 10+ min: choose full refund or continue with time deducted.',
    },
  },
];

export const ICONS = { Globe, BadgeCheck, Sparkles, HeartHandshake };
