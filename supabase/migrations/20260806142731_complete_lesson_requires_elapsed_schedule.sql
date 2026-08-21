-- F10 (second route): the lesson-ops function is a public endpoint, so the
-- state gate must live in the function that moves the money, not in the caller.
CREATE OR REPLACE FUNCTION public.complete_lesson(p_lesson_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- A lesson cannot be settled before it was due to take place.
  IF v_lesson.scheduled_at > now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lesson has not taken place yet');
  END IF;

  v_platform_fee := ROUND(v_lesson.price * v_lesson.commission_rate);
  v_tutor_payout := v_lesson.price - v_platform_fee;

  UPDATE lessons
     SET status = 'completed',
         platform_fee = v_platform_fee,
         tutor_payout = v_tutor_payout,
         completed_at = now(),
         updated_at = now()
   WHERE id = p_lesson_id;

  UPDATE wallets
     SET balance = balance + v_tutor_payout,
         total_earned = total_earned + v_tutor_payout,
         total_commission = total_commission + v_platform_fee,
         updated_at = now()
   WHERE id = v_lesson.tutor_wallet_id;

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (v_lesson.tutor_wallet_id, 'lesson_earning', v_tutor_payout,
          'Lesson earnings (lesson ' || p_lesson_id || ')', 'lesson-' || p_lesson_id);

  INSERT INTO point_transactions (wallet_id, type, amount, description, reference)
  VALUES (v_lesson.tutor_wallet_id, 'commission', -v_platform_fee,
          'Platform commission (lesson ' || p_lesson_id || ')', 'lesson-' || p_lesson_id);

  INSERT INTO lesson_audit_log (lesson_id, action, detail)
  VALUES (p_lesson_id, 'completed',
          'Payout=' || v_tutor_payout || ', Fee=' || v_platform_fee || ', Rate=' || v_lesson.commission_rate);

  RETURN jsonb_build_object('success', true, 'platform_fee', v_platform_fee, 'tutor_payout', v_tutor_payout);
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_lesson(uuid) FROM PUBLIC, anon, authenticated;
