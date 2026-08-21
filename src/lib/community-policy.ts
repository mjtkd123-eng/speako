/**
 * Speako Community enforcement policy (product source of truth).
 * Harassment / hate speech: immediate suspension — no prior warning, no 2-Strike ladder.
 */

export type CommunityViolationClass =
  | 'harassment_hate' // swearing, discriminatory speech, sexual harassment
  | 'spam_abuse' // spam, mild abuse, quality abuse
  | 'fraud_economy'; // bounty farming, confirmed fraud

export type CommunityEnforcement = {
  priorWarning: boolean;
  action:
    | 'immediate_suspension'
    | 'strike_1'
    | 'strike_2_permanent'
    | 'content_remove';
  note: string;
};

/** Map violation class → enforcement. */
export function getCommunityEnforcement(
  violation: CommunityViolationClass,
): CommunityEnforcement {
  if (violation === 'harassment_hate') {
    return {
      priorWarning: false,
      action: 'immediate_suspension',
      note:
        '욕설·차별적 발언·성희롱 확인 시 사전 경고 없이 즉시 이용 정지 (커뮤니티 제로 톨러런스).',
    };
  }
  if (violation === 'fraud_economy') {
    return {
      priorWarning: false,
      action: 'strike_2_permanent',
      note: '확정 자작극·사기는 즉시 커뮤니티 영구 차단 가능.',
    };
  }
  return {
    priorWarning: true,
    action: 'strike_1',
    note: '스팸·경미 비매너 등은 경고/1차 Strike 후 재위반 시 강화.',
  };
}

export const COMMUNITY_HARASSMENT_POLICY_KR =
  '커뮤니티에서 욕설, 차별적 발언, 성희롱이 확인되면 사전 경고 없이 즉시 이용 정지됩니다.';

export const COMMUNITY_HARASSMENT_POLICY_EN =
  'In the community, confirmed swearing, discriminatory speech, or sexual harassment results in immediate suspension without prior warning.';
