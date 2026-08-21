-- F4, F5, F6, F7, F8, F16: no client may write value-bearing tables directly.
-- All balance movement now happens inside SECURITY DEFINER functions that
-- validate amounts and update balances atomically.

DROP POLICY IF EXISTS anon_insert_wallets ON public.wallets;
DROP POLICY IF EXISTS anon_update_wallets ON public.wallets;
DROP POLICY IF EXISTS anon_delete_wallets ON public.wallets;
REVOKE INSERT, UPDATE, DELETE ON public.wallets FROM anon, authenticated;

DROP POLICY IF EXISTS anon_insert_transactions ON public.point_transactions;
DROP POLICY IF EXISTS anon_update_transactions ON public.point_transactions;
DROP POLICY IF EXISTS anon_delete_transactions ON public.point_transactions;
REVOKE INSERT, UPDATE, DELETE ON public.point_transactions FROM anon, authenticated;

DROP POLICY IF EXISTS anon_insert_payouts ON public.payout_requests;
DROP POLICY IF EXISTS anon_update_payouts ON public.payout_requests;
DROP POLICY IF EXISTS anon_delete_payouts ON public.payout_requests;
REVOKE INSERT, UPDATE, DELETE ON public.payout_requests FROM anon, authenticated;

DROP POLICY IF EXISTS anon_insert_lessons ON public.lessons;
DROP POLICY IF EXISTS anon_update_lessons ON public.lessons;
DROP POLICY IF EXISTS anon_delete_lessons ON public.lessons;
REVOKE INSERT, UPDATE, DELETE ON public.lessons FROM anon, authenticated;

-- ── Points purchase: the amount comes from a server-side package table ──
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
  -- Package catalogue is server-side: the caller cannot choose an amount.
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

  UPDATE wallets
     SET balance = balance + v_total,
         updated_at = now()
   WHERE id = p_wallet_id;

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (p_wallet_id, 'purchase', v_total,
          'Purchased ' || v_total || ' points via ' || v_method,
          'payment-' || gen_random_uuid());

  RETURN jsonb_build_object('success', true, 'points', v_total);
END;
$function$;

-- ── Lesson booking: validates the price and debits the student atomically ──
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

  SELECT * INTO v_tutor FROM wallets WHERE id = p_tutor_wallet_id;
  IF NOT FOUND OR v_tutor.owner_type <> 'tutor' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tutor wallet not found');
  END IF;

  IF v_student.balance < p_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Debit the student for real (previously only a ledger row was written).
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

-- ── Payout request: bounds the amount, debits atomically, forces status ──
CREATE OR REPLACE FUNCTION public.request_payout(
  p_wallet_id uuid,
  p_amount integer,
  p_method text,
  p_method_detail text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_detail text;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 100000000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;
  IF p_method NOT IN ('paypal', 'bank') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid method');
  END IF;

  v_detail := left(coalesce(trim(p_method_detail), ''), 300);
  IF v_detail = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payout details required');
  END IF;

  SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id FOR UPDATE;
  IF NOT FOUND OR v_wallet.owner_type <> 'tutor' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tutor wallet not found');
  END IF;

  IF v_wallet.balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  UPDATE wallets
     SET balance = balance - p_amount,
         updated_at = now()
   WHERE id = p_wallet_id;

  INSERT INTO payout_requests (wallet_id, amount, method, method_detail, status)
  VALUES (p_wallet_id, p_amount, p_method, v_detail, 'pending');

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (p_wallet_id, 'payout', -p_amount,
          'Payout request via ' || CASE p_method WHEN 'paypal' THEN 'PayPal' ELSE 'Bank Transfer' END,
          'payout-' || gen_random_uuid());

  RETURN jsonb_build_object('success', true);
END;
$function$;

REVOKE ALL ON FUNCTION public.purchase_points(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.book_lesson(uuid, uuid, integer, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.request_payout(uuid, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_points(uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_lesson(uuid, uuid, integer, timestamptz) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_payout(uuid, integer, text, text) TO anon, authenticated;
