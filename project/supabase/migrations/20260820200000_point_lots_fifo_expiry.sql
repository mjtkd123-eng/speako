/*
  Lesson-discount points: lot-based ledger
  - Display: 100p = $1.00
  - Redeem cap: max 30% of lesson price (enforced when applying reward spend helpers)
  - Validity: 60 days from earn → auto-expire
  - Spend: FIFO by expires_at ASC (nearest expiry first), then earned_at ASC
  - No cash-out for these points (product policy; tutor payouts unchanged)
*/

-- ── Transaction type: expiry ──
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
        'expiry',
        'qa_bounty_escrow', 'qa_bounty_refund', 'qa_bounty_payout', 'qa_like_bonus',
        'qa_quality_bonus', 'qa_tutor_bonus', 'qa_mission', 'qa_platform_fee'
      ));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.point_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'purchase'
    CHECK (source IN (
      'purchase', 'bonus', 'reward', 'mission', 'refund', 'qa_payout', 'other'
    )),
  original_amount integer NOT NULL CHECK (original_amount > 0),
  amount_remaining integer NOT NULL CHECK (amount_remaining >= 0),
  earned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  expired_at timestamptz,
  reference text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT point_lots_remaining_lte_original CHECK (amount_remaining <= original_amount)
);

CREATE INDEX IF NOT EXISTS idx_point_lots_wallet_fifo
  ON public.point_lots (wallet_id, expires_at ASC, earned_at ASC)
  WHERE amount_remaining > 0 AND expired_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_point_lots_expire
  ON public.point_lots (expires_at)
  WHERE amount_remaining > 0 AND expired_at IS NULL;

ALTER TABLE public.point_lots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_point_lots" ON public.point_lots;
CREATE POLICY "anon_select_point_lots" ON public.point_lots FOR SELECT
  TO anon, authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.point_lots FROM anon, authenticated;

-- Backfill: one lot per student wallet balance (60 days from now)
INSERT INTO public.point_lots (
  wallet_id, source, original_amount, amount_remaining, earned_at, expires_at, reference
)
SELECT
  w.id,
  'other',
  w.balance,
  w.balance,
  now(),
  now() + interval '60 days',
  'backfill-balance'
FROM public.wallets w
WHERE w.owner_type = 'student'
  AND w.balance > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.point_lots pl WHERE pl.wallet_id = w.id
  );

-- ── Credit a lot (earn) ──
CREATE OR REPLACE FUNCTION public.credit_point_lot(
  p_wallet_id uuid,
  p_amount integer,
  p_source text DEFAULT 'reward',
  p_reference text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_lot_id uuid;
  v_earned timestamptz := now();
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'credit_point_lot: invalid amount';
  END IF;

  INSERT INTO point_lots (
    wallet_id, source, original_amount, amount_remaining, earned_at, expires_at, reference
  )
  VALUES (
    p_wallet_id,
    COALESCE(NULLIF(trim(p_source), ''), 'reward'),
    p_amount,
    p_amount,
    v_earned,
    v_earned + interval '60 days',
    COALESCE(p_reference, '')
  )
  RETURNING id INTO v_lot_id;

  RETURN v_lot_id;
END;
$function$;

-- ── FIFO debit: nearest expiry first ──
CREATE OR REPLACE FUNCTION public.debit_point_lots_fifo(
  p_wallet_id uuid,
  p_amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_need integer;
  v_lot record;
  v_take integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN true;
  END IF;

  v_need := p_amount;

  FOR v_lot IN
    SELECT id, amount_remaining
      FROM point_lots
     WHERE wallet_id = p_wallet_id
       AND amount_remaining > 0
       AND expired_at IS NULL
       AND expires_at > now()
     ORDER BY expires_at ASC, earned_at ASC, id ASC
     FOR UPDATE
  LOOP
    EXIT WHEN v_need <= 0;
    v_take := LEAST(v_lot.amount_remaining, v_need);
    UPDATE point_lots
       SET amount_remaining = amount_remaining - v_take
     WHERE id = v_lot.id;
    v_need := v_need - v_take;
  END LOOP;

  RETURN v_need = 0;
END;
$function$;

-- ── Expire lots for one wallet (call while holding that wallet row lock) ──
CREATE OR REPLACE FUNCTION public.expire_point_lots_for_wallet(p_wallet_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_amt integer;
BEGIN
  SELECT COALESCE(SUM(amount_remaining), 0)::integer INTO v_amt
    FROM point_lots
   WHERE wallet_id = p_wallet_id
     AND amount_remaining > 0
     AND expired_at IS NULL
     AND expires_at <= now();

  IF v_amt <= 0 THEN
    RETURN 0;
  END IF;

  UPDATE point_lots
     SET expired_at = now(),
         amount_remaining = 0
   WHERE wallet_id = p_wallet_id
     AND amount_remaining > 0
     AND expired_at IS NULL
     AND expires_at <= now();

  UPDATE wallets
     SET balance = GREATEST(0, balance - v_amt),
         updated_at = now()
   WHERE id = p_wallet_id;

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (
    p_wallet_id,
    'expiry',
    -v_amt,
    'Points expired after 60 days from grant',
    'expiry-' || to_char(now() AT TIME ZONE 'utc', 'YYYYMMDDHH24MI')
  );

  RETURN v_amt;
END;
$function$;

-- ── Expire all due lots (scheduler / ops) ──
CREATE OR REPLACE FUNCTION public.expire_point_lots()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row record;
  v_total integer := 0;
  v_wallets integer := 0;
  v_amt integer;
BEGIN
  FOR v_row IN
    SELECT DISTINCT wallet_id
      FROM point_lots
     WHERE amount_remaining > 0
       AND expired_at IS NULL
       AND expires_at <= now()
  LOOP
    PERFORM 1 FROM wallets WHERE id = v_row.wallet_id FOR UPDATE;
    v_amt := public.expire_point_lots_for_wallet(v_row.wallet_id);
    IF v_amt > 0 THEN
      v_total := v_total + v_amt;
      v_wallets := v_wallets + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'expired_points', v_total,
    'wallets_affected', v_wallets
  );
END;
$function$;

-- Max redeemable reward points toward a lesson (30%)
CREATE OR REPLACE FUNCTION public.max_lesson_point_spend(p_lesson_price integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_lesson_price IS NULL OR p_lesson_price <= 0 THEN 0
    ELSE floor(p_lesson_price * 0.3)::integer
  END;
$$;

-- ── purchase_points: credit wallet + lot ──
CREATE OR REPLACE FUNCTION public.purchase_points(p_wallet_id uuid, p_package_id text, p_method text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_points integer;
  v_bonus integer;
  v_total integer;
  v_method text;
  v_wallet wallets%ROWTYPE;
BEGIN
  CASE p_package_id
    WHEN 'pkg-10'  THEN v_points := 10000;  v_bonus := 0;
    WHEN 'pkg-50'  THEN v_points := 50000;  v_bonus := 5000;
    WHEN 'pkg-100' THEN v_points := 100000; v_bonus := 15000;
    ELSE RETURN jsonb_build_object('success', false, 'error', 'Unknown package');
  END CASE;

  v_method := CASE p_method WHEN 'Stripe' THEN 'Stripe' WHEN 'PayPal' THEN 'PayPal' WHEN 'PortOne' THEN 'PortOne' ELSE 'Card' END;
  v_total := v_points + v_bonus;

  SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  IF v_wallet.owner_type <> 'student' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not a student wallet');
  END IF;

  PERFORM public.expire_point_lots_for_wallet(p_wallet_id);

  UPDATE wallets
     SET balance = balance + v_total,
         updated_at = now()
   WHERE id = p_wallet_id;

  PERFORM public.credit_point_lot(p_wallet_id, v_points, 'purchase', 'pkg-' || p_package_id || '-' || v_method);
  IF v_bonus > 0 THEN
    PERFORM public.credit_point_lot(p_wallet_id, v_bonus, 'bonus', 'pkg-bonus-' || p_package_id);
  END IF;

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (p_wallet_id, 'purchase', v_total,
          'Purchased ' || v_total || ' points via ' || v_method,
          'payment-' || gen_random_uuid());

  RETURN jsonb_build_object('success', true, 'points', v_total);
END;
$function$;

-- ── book_lesson: FIFO debit lots then wallet ──
CREATE OR REPLACE FUNCTION public.book_lesson(
  p_student_wallet_id uuid,
  p_tutor_wallet_id uuid,
  p_price integer,
  p_scheduled_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_student wallets%ROWTYPE;
  v_tutor wallets%ROWTYPE;
  v_lesson_id uuid;
  v_ok boolean;
BEGIN
  IF p_price IS NULL OR p_price <= 0 OR p_price > 1000000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid lesson price');
  END IF;
  IF p_scheduled_at IS NULL OR p_scheduled_at < now() - interval '1 hour' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid schedule');
  END IF;

  SELECT * INTO v_student FROM wallets WHERE id = p_student_wallet_id FOR UPDATE;
  IF NOT FOUND OR v_student.owner_type <> 'student' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Student wallet not found');
  END IF;

  PERFORM public.expire_point_lots_for_wallet(p_student_wallet_id);
  SELECT * INTO v_student FROM wallets WHERE id = p_student_wallet_id;

  SELECT * INTO v_tutor FROM wallets WHERE id = p_tutor_wallet_id;
  IF NOT FOUND OR v_tutor.owner_type <> 'tutor' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tutor wallet not found');
  END IF;

  IF v_student.balance < p_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  SELECT public.debit_point_lots_fifo(p_student_wallet_id, p_price) INTO v_ok;
  IF NOT v_ok THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient lot balance');
  END IF;

  UPDATE wallets
     SET balance = balance - p_price,
         total_spent = total_spent + p_price,
         updated_at = now()
   WHERE id = p_student_wallet_id;

  INSERT INTO lessons (student_wallet_id, tutor_wallet_id, price, status, commission_rate, scheduled_at)
  VALUES (p_student_wallet_id, p_tutor_wallet_id, p_price, 'pending', v_tutor.commission_rate, p_scheduled_at)
  RETURNING id INTO v_lesson_id;

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (p_student_wallet_id, 'lesson_booking', -p_price,
          'Lesson booked for ' || p_price || ' points', 'lesson-' || v_lesson_id);

  RETURN jsonb_build_object('success', true, 'lesson_id', v_lesson_id);
END;
$function$;

-- ── cancel_lesson: refund credits a new 60-day lot ──
CREATE OR REPLACE FUNCTION public.cancel_lesson(p_lesson_id uuid, p_cancelled_by text DEFAULT 'student')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  UPDATE wallets
  SET balance = balance + v_lesson.price,
      total_spent = total_spent - v_lesson.price,
      updated_at = now()
  WHERE id = v_lesson.student_wallet_id;

  PERFORM public.credit_point_lot(
    v_lesson.student_wallet_id,
    v_lesson.price,
    'refund',
    'lesson-' || p_lesson_id
  );

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (v_lesson.student_wallet_id, 'refund', v_lesson.price,
          'Full refund for cancelled lesson (' || p_lesson_id || ')', 'lesson-' || p_lesson_id);

  UPDATE lessons
  SET status = 'refunded',
      cancelled_at = now(),
      updated_at = now()
  WHERE id = p_lesson_id;

  INSERT INTO lesson_audit_log (lesson_id, action, detail)
  VALUES (p_lesson_id, 'refunded',
          'Full refund by ' || p_cancelled_by || ', hours_before=' || ROUND(v_hours_before, 1));

  RETURN jsonb_build_object('success', true, 'refunded_amount', v_lesson.price);
END;
$function$;

REVOKE ALL ON FUNCTION public.credit_point_lot(uuid, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.debit_point_lots_fifo(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_point_lots_for_wallet(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_point_lots() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.max_lesson_point_spend(integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.expire_point_lots() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.max_lesson_point_spend(integer) TO anon, authenticated;
-- credit/debit stay definer-only via other RPCs; do not grant to clients

-- Optional hourly scheduler (skipped if pg_cron unavailable)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-point-lots') THEN
      PERFORM cron.unschedule('expire-point-lots');
    END IF;
    PERFORM cron.schedule('expire-point-lots', '15 * * * *', 'SELECT public.expire_point_lots()');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron schedule skipped: %', SQLERRM;
END $$;
