/*
  Speako Community — Q&A Reward & Peer Correction
  Economy: 100p = $1.00 display · lesson redeem max 30% · expires 60 days from grant · no cash-out
  Safety: 2-Strike community access
*/

-- Extend point ledger types used by community (additive; existing CHECK may need alter in prod)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'point_transactions'
  ) THEN
    ALTER TABLE public.point_transactions DROP CONSTRAINT IF EXISTS point_transactions_type_check;
    ALTER TABLE public.point_transactions
      ADD CONSTRAINT point_transactions_type_check
      CHECK (type IN (
        'purchase', 'lesson_booking', 'lesson_earning', 'commission', 'payout', 'refund',
        'qa_bounty_escrow', 'qa_bounty_refund', 'qa_bounty_payout', 'qa_like_bonus',
        'qa_quality_bonus', 'qa_tutor_bonus', 'qa_mission', 'qa_platform_fee'
      ));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.community_access (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  strike_count smallint NOT NULL DEFAULT 0 CHECK (strike_count >= 0 AND strike_count <= 2),
  write_blocked_until timestamptz,
  community_access text NOT NULL DEFAULT 'allowed'
    CHECK (community_access IN ('allowed', 'write_paused', 'denied')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_strikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  strike_number smallint NOT NULL CHECK (strike_number IN (1, 2)),
  reason_code text NOT NULL,
  evidence_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qa_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asker_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN (
    'grammar', 'writing', 'pronunciation', 'culture', 'translation', 'exam', 'business', 'beginner'
  )),
  level text NOT NULL DEFAULT 'beginner'
    CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  purpose text NOT NULL DEFAULT 'daily'
    CHECK (purpose IN ('daily', 'exam', 'business')),
  title text NOT NULL,
  body text NOT NULL,
  language_pair text NOT NULL DEFAULT 'ko-en',
  voice_path text,
  voice_seconds integer CHECK (voice_seconds IS NULL OR (voice_seconds > 0 AND voice_seconds <= 60)),
  bounty_points integer NOT NULL CHECK (bounty_points > 0),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'answered', 'adopted', 'expired', 'cancelled', 'blinded')),
  adopted_answer_id uuid,
  escrow_points integer NOT NULL,
  auto_close_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qa_questions_status_created_idx
  ON public.qa_questions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS qa_questions_category_idx
  ON public.qa_questions (category);
CREATE INDEX IF NOT EXISTS qa_questions_asker_idx
  ON public.qa_questions (asker_id);

CREATE TABLE IF NOT EXISTS public.qa_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.qa_questions (id) ON DELETE CASCADE,
  answerer_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  is_verified_tutor boolean NOT NULL DEFAULT false,
  like_count integer NOT NULL DEFAULT 0,
  quality_score smallint NOT NULL DEFAULT 0,
  voice_path text,
  voice_seconds integer CHECK (voice_seconds IS NULL OR (voice_seconds > 0 AND voice_seconds <= 30)),
  status text NOT NULL DEFAULT 'visible'
    CHECK (status IN ('visible', 'blinded', 'removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, answerer_id)
);

CREATE INDEX IF NOT EXISTS qa_answers_question_idx
  ON public.qa_answers (question_id, created_at);

-- Peer correction segments on an answer
CREATE TABLE IF NOT EXISTS public.qa_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid NOT NULL REFERENCES public.qa_answers (id) ON DELETE CASCADE,
  original_text text NOT NULL,
  corrected_text text NOT NULL,
  reason_tag text NOT NULL DEFAULT 'grammar'
    CHECK (reason_tag IN ('grammar', 'vocab', 'naturalness', 'politeness', 'other')),
  start_offset integer,
  end_offset integer,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qa_answer_likes (
  answer_id uuid NOT NULL REFERENCES public.qa_answers (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (answer_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.qa_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL UNIQUE REFERENCES public.qa_questions (id) ON DELETE CASCADE,
  adopted_answer_id uuid REFERENCES public.qa_answers (id) ON DELETE SET NULL,
  bounty_points integer NOT NULL,
  to_adopter integer NOT NULL DEFAULT 0,
  to_like_runner_up integer NOT NULL DEFAULT 0,
  to_platform integer NOT NULL DEFAULT 0,
  tutor_bonus integer NOT NULL DEFAULT 0,
  quality_bonus integer NOT NULL DEFAULT 0,
  settled_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qa_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('question', 'answer', 'user')),
  target_id uuid NOT NULL,
  reason_code text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qa_daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title_kr text NOT NULL,
  title_en text NOT NULL,
  reward_points integer NOT NULL CHECK (reward_points > 0),
  redeemable text NOT NULL DEFAULT 'lesson_only'
    CHECK (redeemable IN ('lesson_only', 'cashable')),
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.qa_questions
  DROP CONSTRAINT IF EXISTS qa_questions_adopted_answer_fk;
ALTER TABLE public.qa_questions
  ADD CONSTRAINT qa_questions_adopted_answer_fk
  FOREIGN KEY (adopted_answer_id) REFERENCES public.qa_answers (id) ON DELETE SET NULL;

ALTER TABLE public.community_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_answer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_daily_missions ENABLE ROW LEVEL SECURITY;

-- Read-open community content; writes require auth (tighten in follow-up RPCs)
CREATE POLICY qa_questions_select ON public.qa_questions
  FOR SELECT TO anon, authenticated USING (status <> 'blinded');
CREATE POLICY qa_answers_select ON public.qa_answers
  FOR SELECT TO anon, authenticated USING (status = 'visible');
CREATE POLICY qa_corrections_select ON public.qa_corrections
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY qa_missions_select ON public.qa_daily_missions
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE POLICY qa_questions_insert ON public.qa_questions
  FOR INSERT TO authenticated WITH CHECK (asker_id = auth.uid());
CREATE POLICY qa_answers_insert ON public.qa_answers
  FOR INSERT TO authenticated WITH CHECK (answerer_id = auth.uid());
CREATE POLICY qa_corrections_insert ON public.qa_corrections
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY qa_likes_insert ON public.qa_answer_likes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY qa_reports_insert ON public.qa_reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

INSERT INTO public.qa_daily_missions (code, title_kr, title_en, reward_points)
VALUES
  ('one_sentence', '오늘의 한 문장', 'One sentence today', 15),
  ('pronounce_10s', '10초 발음 챌린지', '10s pronunciation challenge', 20),
  ('correct_once', '고쳐주기 1회', 'Correct once', 25),
  ('thank_you', '감사 한마디', 'Say thanks', 10),
  ('weekend_quiz', '주말 짝 퀴즈 라이트', 'Weekend buddy quiz (lite)', 30)
ON CONFLICT (code) DO NOTHING;
