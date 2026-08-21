-- F10, F11, F12, F13: these SECURITY DEFINER routines move money and platform
-- state. They are called by edge functions with the service role, so the browser
-- roles must not be able to invoke them directly through /rest/v1/rpc.
REVOKE EXECUTE ON FUNCTION public.complete_lesson(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cancel_lesson(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.register_tutor(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.start_video_call(uuid, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.end_video_call(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_active_provider() FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.complete_lesson(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_lesson(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.register_tutor(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_video_call(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.end_video_call(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_active_provider() FROM PUBLIC;
