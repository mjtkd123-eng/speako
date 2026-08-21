-- F1: applicant PII (name, email, bio, video) must not be world-readable.
-- F2: application status must not be client-writable (self-approval).
DROP POLICY IF EXISTS anon_select_applications ON public.tutor_applications;
DROP POLICY IF EXISTS anon_update_applications ON public.tutor_applications;

REVOKE SELECT, UPDATE, DELETE ON public.tutor_applications FROM anon, authenticated;

-- Keep the public application form working, but only for applicant-supplied columns.
REVOKE INSERT ON public.tutor_applications FROM anon, authenticated;
GRANT INSERT (applicant_name, email, teaches_language, native_language, bio, experience_years, video_url, video_path)
  ON public.tutor_applications TO anon, authenticated;
