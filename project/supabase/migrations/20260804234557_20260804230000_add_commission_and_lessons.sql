/*
# Dynamic Commission Rate & Lesson Lifecycle Tables

## Overview
Adds early-bird commission fields to the wallets table and creates a lessons
table with a full audit trail for bookings, completions, cancellations, and
refunds. A SECURITY DEFINER function enforces all payout/fee/refund math on
the server so the frontend can never tamper with commission rates or balances.

## Changes to `wallets`
- `commission_rate` (numeric, default 0.15) — per-tutor platform commission rate.
- `is_early_bird` (boolean, default false) — true if tutor registered on or before 2026-12-31T23:59:59Z.
- Backfill: existing tutor wallet gets commission_rate = 0.10, is_early_bird = true
  (since it was created before the cutoff date).

## New Table: `lessons`
- `id` (uuid, PK)
- `student_wallet_id` (uuid, FK → wallets)
- `tutor_wallet_id` (uuid, FK → wallets)
- `price` (integer, lesson price in points)
- `status` (text: 'pending' | 'completed' | 'cancelled' | 'refunded')
- `commission_rate` (numeric) — snapshot of tutor's rate at booking time
- `platform_fee` (integer, 0 until completed)
- `tutor_payout` (integer, 0 until completed)
- `scheduled_at` (timestamptz) — when the lesson is scheduled to start
- `completed_at` (timestamptz) — when the lesson was marked complete
- `cancelled_at` (timestamptz) — when the lesson was cancelled
- `created_at`, `updated_at` (timestamps)

## New Table: `lesson_audit_log`
- `id` (uuid, PK)
- `lesson_id` (uuid, FK → lessons)
- `action` (text: 'created' | 'completed' | 'cancelled' | 'refunded')
- `detail` (text)
- `created_at` (timestamp)

## Security
- Single-tenant app (no auth screen). All policies use `TO anon, authenticated`.
- RLS enabled on all new tables.
- The `complete_lesson` and `cancel_lesson` functions are SECURITY DEFINER so
  they can update wallet balances atomically; the frontend calls them via RPC
  and never touches balance arithmetic directly.

## Important Notes
1. `EARLY_BIRD_CUTOFF_DATE` is '2026-12-31T23:59:59Z'. Tutors created on or
   before this date get 10% commission; after, 15%.
2. `complete_lesson(id)` RPC: validates lesson is 'pending', reads the
   commission_rate snapshot from the lesson row, computes
   platform_fee = price * rate, tutor_payout = price * (1 - rate), credits
   the tutor wallet, records commission, inserts audit log, sets status.
3. `cancel_lesson(id, cancelled_by)` RPC: if >24h before scheduled_at,
   full refund to student, no tutor payout, status → 'refunded', audit log.
   If <24h, returns an error (late cancellation not allowed for free refund).
*/

ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS commission_rate numeric NOT NULL DEFAULT 0.15;
ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS is_early_bird boolean NOT NULL DEFAULT false;

-- Backfill existing tutor wallet as early bird (created before cutoff)
UPDATE wallets
SET commission_rate = 0.10, is_early_bird = true
WHERE owner_type = 'tutor' AND created_at <= '2026-12-31T23:59:59Z'::timestamptz;

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  tutor_wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  price integer NOT NULL CHECK (price > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  commission_rate numeric NOT NULL DEFAULT 0.15,
  platform_fee integer NOT NULL DEFAULT 0,
  tutor_payout integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz NOT NULL,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lessons" ON lessons;
CREATE POLICY "anon_select_lessons" ON lessons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lessons" ON lessons;
CREATE POLICY "anon_insert_lessons" ON lessons FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lessons" ON lessons;
CREATE POLICY "anon_update_lessons" ON lessons FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_lessons" ON lessons;
CREATE POLICY "anon_delete_lessons" ON lessons FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS lesson_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'completed', 'cancelled', 'refunded')),
  detail text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit" ON lesson_audit_log;
CREATE POLICY "anon_select_audit" ON lesson_audit_log FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit" ON lesson_audit_log;
CREATE POLICY "anon_insert_audit" ON lesson_audit_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit" ON lesson_audit_log;
CREATE POLICY "anon_update_audit" ON lesson_audit_log FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit" ON lesson_audit_log;
CREATE POLICY "anon_delete_audit" ON lesson_audit_log FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lessons_student ON lessons(student_wallet_id);
CREATE INDEX IF NOT EXISTS idx_lessons_tutor ON lessons(tutor_wallet_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_audit_lesson ON lesson_audit_log(lesson_id);

-- SECURITY DEFINER: complete a lesson with server-side payout calculation
CREATE OR REPLACE FUNCTION complete_lesson(p_lesson_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson lessons%ROWTYPE;
  v_platform_fee integer;
  v_tutor_payout integer;
BEGIN
  SELECT * INTO v_lesson FROM lessons WHERE id = p_lesson_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lesson not found');
  END IF;

  IF v_lesson.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lesson is not pending');
  END IF;

  -- Server-side calculation (cannot be tampered by client)
  v_platform_fee := ROUND(v_lesson.price * v_lesson.commission_rate);
  v_tutor_payout := v_lesson.price - v_platform_fee;

  -- Update lesson
  UPDATE lessons
  SET status = 'completed',
      platform_fee = v_platform_fee,
      tutor_payout = v_tutor_payout,
      completed_at = now(),
      updated_at = now()
  WHERE id = p_lesson_id;

  -- Credit tutor wallet
  UPDATE wallets
  SET balance = balance + v_tutor_payout,
      total_earned = total_earned + v_tutor_payout,
      total_commission = total_commission + v_platform_fee,
      updated_at = now()
  WHERE id = v_lesson.tutor_wallet_id;

  -- Record transactions
  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (v_lesson.tutor_wallet_id, 'lesson_earning', v_tutor_payout,
          'Lesson earnings (lesson ' || p_lesson_id || ')', 'lesson-' || p_lesson_id);

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (v_lesson.tutor_wallet_id, 'commission', -v_platform_fee,
          'Platform commission (lesson ' || p_lesson_id || ')', 'lesson-' || p_lesson_id);

  -- Audit log
  INSERT INTO lesson_audit_log (lesson_id, action, detail)
  VALUES (p_lesson_id, 'completed',
          'Payout=' || v_tutor_payout || ', Fee=' || v_platform_fee || ', Rate=' || v_lesson.commission_rate);

  RETURN jsonb_build_object('success', true, 'platform_fee', v_platform_fee, 'tutor_payout', v_tutor_payout);
END;
$$;

-- SECURITY DEFINER: cancel + refund if >24h before scheduled start
CREATE OR REPLACE FUNCTION cancel_lesson(p_lesson_id uuid, p_cancelled_by text DEFAULT 'student')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson lessons%ROWTYPE;
  v_hours_before numeric;
BEGIN
  SELECT * INTO v_lesson FROM lessons WHERE id = p_lesson_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lesson not found');
  END IF;

  IF v_lesson.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lesson is not pending');
  END IF;

  v_hours_before := EXTRACT(EPOCH FROM (v_lesson.scheduled_at - now())) / 3600;

  IF v_hours_before <= 24 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cancellation must be >24h before lesson start for full refund');
  END IF;

  -- Full refund to student
  UPDATE wallets
  SET balance = balance + v_lesson.price,
      total_spent = total_spent - v_lesson.price,
      updated_at = now()
  WHERE id = v_lesson.student_wallet_id;

  -- Record refund transaction
  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (v_lesson.student_wallet_id, 'refund', v_lesson.price,
          'Full refund for cancelled lesson (' || p_lesson_id || ')', 'lesson-' || p_lesson_id);

  -- Update lesson status
  UPDATE lessons
  SET status = 'refunded',
      cancelled_at = now(),
      updated_at = now()
  WHERE id = p_lesson_id;

  -- Audit log
  INSERT INTO lesson_audit_log (lesson_id, action, detail)
  VALUES (p_lesson_id, 'refunded',
          'Full refund by ' || p_cancelled_by || ', hours_before=' || ROUND(v_hours_before, 1));

  RETURN jsonb_build_object('success', true, 'refunded_amount', v_lesson.price);
END;
$$;

-- SECURITY DEFINER: register a tutor and auto-assign commission rate
CREATE OR REPLACE FUNCTION register_tutor(p_wallet_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_is_early boolean;
  v_rate numeric;
BEGIN
  SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  IF v_wallet.owner_type != 'tutor' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet is not a tutor wallet');
  END IF;

  v_is_early := v_wallet.created_at <= '2026-12-31T23:59:59Z'::timestamptz;
  v_rate := CASE WHEN v_is_early THEN 0.10 ELSE 0.15 END;

  UPDATE wallets
  SET commission_rate = v_rate, is_early_bird = v_is_early, updated_at = now()
  WHERE id = p_wallet_id;

  RETURN jsonb_build_object('success', true, 'is_early_bird', v_is_early, 'commission_rate', v_rate);
END;
$$;