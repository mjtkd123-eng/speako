export type SensitiveMatchType = 'phone' | 'account' | 'messenger' | 'other';

export type SensitiveMatch = {
  type: SensitiveMatchType;
  value: string;
  index: number;
  length: number;
};

export type DetectSensitiveResult = {
  hasSensitiveInfo: boolean;
  matches: SensitiveMatch[];
  /** Popup / toast copy when personal data is detected */
  warningMessage: string;
};

export const SENSITIVE_INFO_WARNING =
  '개인정보 공유 및 외부 거래 유도는 제재 대상이 될 수 있습니다';

export const SENSITIVE_INFO_WARNING_EN =
  'Sharing personal contact details or off-platform payments may result in penalties.';

/** Digits that may appear as hangul spellings in Korean chats */
const HANGUL_DIGIT: Record<string, string> = {
  공: '0',
  영: '0',
  일: '1',
  이: '2',
  삼: '3',
  사: '4',
  오: '5',
  육: '6',
  칠: '7',
  팔: '8',
  구: '9',
};

const PHONE_PATTERNS: RegExp[] = [
  // +82 / 82 international KR
  /(?:\+?82[-\s.]?)?0?1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}\b/g,
  // US-style / general intl
  /(?:\+?\d{1,3}[-\s.]?)?\(?\d{2,4}\)?[-\s.]?\d{3,4}[-\s.]?\d{4}\b/g,
  // Hangul-spelled mobile e.g. 공일공일이삼사오육칠팔
  /(?:공|영)?일[공영일이삼사오육칠팔구]{8,12}/g,
];

const ACCOUNT_PATTERNS: RegExp[] = [
  // Bank-ish: 6+ digit groups with dashes/spaces
  /\b\d{2,6}[-\s]\d{2,6}[-\s]\d{2,8}(?:[-\s]\d{1,6})?\b/g,
  // Long continuous digit sequences typical of accounts (10–16) — exclude phones handled above
  /(?<!\d)\d{10,16}(?!\d)/g,
  /(?:계좌|입금|송금|계좌번호)\s*[:：]?\s*[\d\-]+/gi,
];

const MESSENGER_PATTERNS: RegExp[] = [
  /(?:카톡|카카오톡|kakao(?:talk)?|ㅋㅌ)\s*(?:id|아이디|ID)?\s*[:：]?\s*@?[\w.\-]{3,20}/gi,
  /(?:라인|line)\s*(?:id|아이디|ID)?\s*[:：]?\s*@?[\w.\-]{3,20}/gi,
  /(?:텔레그램|telegram|tg)\s*(?:id|아이디|@)?\s*[:：]?\s*@?[\w.]{3,32}/gi,
  /(?:whats?app|왓츠?앱|위챗|wechat)\s*[:：]?\s*[\w+.\-]{3,32}/gi,
  /(?:instagram|인스타|ig)\s*(?:dm|디엠)?\s*[:：]?\s*@?[\w.]{3,30}/gi,
  /@[\w.]{4,30}(?=\s|$|[^\w.])/g,
];

function pushMatches(
  text: string,
  patterns: RegExp[],
  type: SensitiveMatchType,
  into: SensitiveMatch[],
) {
  for (const pattern of patterns) {
    const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      into.push({
        type,
        value: m[0],
        index: m.index,
        length: m[0].length,
      });
    }
  }
}

function normalizeHangulDigits(text: string): string {
  return text.replace(/[공영일이삼사오육칠팔구]/g, (ch) => HANGUL_DIGIT[ch] ?? ch);
}

/**
 * Detect phone numbers, bank accounts, and messenger IDs in a chat message.
 */
export function detectSensitiveInfo(message: string): DetectSensitiveResult {
  if (!message?.trim()) {
    return { hasSensitiveInfo: false, matches: [], warningMessage: SENSITIVE_INFO_WARNING };
  }

  const matches: SensitiveMatch[] = [];
  pushMatches(message, PHONE_PATTERNS, 'phone', matches);
  pushMatches(message, ACCOUNT_PATTERNS, 'account', matches);
  pushMatches(message, MESSENGER_PATTERNS, 'messenger', matches);

  // Hangul-digit phones after normalization (map positions approximately via secondary scan)
  const normalized = normalizeHangulDigits(message);
  if (normalized !== message) {
    const phoneRe = /(?:\+?82)?0?1[016789]\d{7,8}/g;
    let m: RegExpExecArray | null;
    while ((m = phoneRe.exec(normalized)) !== null) {
      matches.push({
        type: 'phone',
        value: message.slice(m.index, m.index + m[0].length) || m[0],
        index: m.index,
        length: m[0].length,
      });
    }
  }

  // Deduplicate overlapping spans (keep earliest / longest)
  const sorted = [...matches].sort((a, b) => a.index - b.index || b.length - a.length);
  const deduped: SensitiveMatch[] = [];
  let end = -1;
  for (const match of sorted) {
    if (match.index < end) continue;
    deduped.push(match);
    end = match.index + match.length;
  }

  return {
    hasSensitiveInfo: deduped.length > 0,
    matches: deduped,
    warningMessage: SENSITIVE_INFO_WARNING,
  };
}

/**
 * Replace detected sensitive spans with `***`.
 */
export function maskSensitiveInfo(message: string): string {
  const { matches } = detectSensitiveInfo(message);
  if (matches.length === 0) return message;

  let out = '';
  let cursor = 0;
  for (const match of matches) {
    out += message.slice(cursor, match.index);
    out += '***';
    cursor = match.index + match.length;
  }
  out += message.slice(cursor);
  return out;
}

/**
 * Convenience: mask + optional warning for UI popups.
 */
export function filterMessageForSafety(message: string): {
  masked: string;
  blocked: boolean;
  warningMessage: string | null;
} {
  const detected = detectSensitiveInfo(message);
  if (!detected.hasSensitiveInfo) {
    return { masked: message, blocked: false, warningMessage: null };
  }
  return {
    masked: maskSensitiveInfo(message),
    blocked: true,
    warningMessage: detected.warningMessage,
  };
}
