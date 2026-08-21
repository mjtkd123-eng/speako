/*
  Extend tutor_applications for authenticated onboarding:
  - tutor_type: professional | community
  - credential_path / credential_url for certificates
  - user_id link to auth.users
  - private credentials bucket
*/

ALTER TABLE public.tutor_applications
  ADD COLUMN IF NOT EXISTS tutor_type text,
  ADD COLUMN IF NOT EXISTS credential_path text,
  ADD COLUMN IF NOT EXISTS credential_url text,
  ADD COLUMN IF NOT EXISTS user_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tutor_applications_tutor_type_check'
  ) THEN
    ALTER TABLE public.tutor_applications
      ADD CONSTRAINT tutor_applications_tutor_type_check
      CHECK (tutor_type IS NULL OR tutor_type IN ('professional', 'community'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS tutor_applications_user_id_idx
  ON public.tutor_applications (user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-credentials', 'tutor-credentials', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "allow_auth_upload_credentials" ON storage.objects;
CREATE POLICY "allow_auth_upload_credentials" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tutor-credentials');

DROP POLICY IF EXISTS "allow_auth_read_own_credentials" ON storage.objects;
CREATE POLICY "allow_auth_read_own_credentials" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'tutor-credentials');
