-- F17: the audit trail must not be forgeable or erasable by a visitor.
DROP POLICY IF EXISTS anon_select_audit ON public.lesson_audit_log;
DROP POLICY IF EXISTS anon_insert_audit ON public.lesson_audit_log;
DROP POLICY IF EXISTS anon_update_audit ON public.lesson_audit_log;
DROP POLICY IF EXISTS anon_delete_audit ON public.lesson_audit_log;
REVOKE ALL ON public.lesson_audit_log FROM anon, authenticated;

-- F18: call records are written only by the video edge function.
DROP POLICY IF EXISTS anon_select_video_calls ON public.video_calls;
DROP POLICY IF EXISTS anon_insert_video_calls ON public.video_calls;
DROP POLICY IF EXISTS anon_update_video_calls ON public.video_calls;
DROP POLICY IF EXISTS anon_delete_video_calls ON public.video_calls;
REVOKE ALL ON public.video_calls FROM anon, authenticated;

-- F19: usage counters decide which paid provider is used; they must not be client-writable.
DROP POLICY IF EXISTS anon_select_provider_usage ON public.provider_usage;
DROP POLICY IF EXISTS anon_insert_provider_usage ON public.provider_usage;
DROP POLICY IF EXISTS anon_update_provider_usage ON public.provider_usage;
DROP POLICY IF EXISTS anon_delete_provider_usage ON public.provider_usage;
REVOKE ALL ON public.provider_usage FROM anon, authenticated;
