/*
# Create tutor_applications table and intro video storage

1. New Tables
- `tutor_applications`
  - `id` (uuid, primary key)
  - `applicant_name` (text, not null) — full name of the applicant
  - `email` (text, not null) — contact email
  - `teaches_language` (text, not null) — language code the applicant wants to teach (e.g. "en", "ko")
  - `native_language` (text, not null) — applicant's native language code
  - `bio` (text, not null) — short self-introduction text
  - `experience_years` (integer, default 0) — years of teaching experience
  - `video_url` (text, nullable) — public URL of the uploaded intro video in storage
  - `video_path` (text, nullable) — storage path of the uploaded video
  - `status` (text, default 'pending') — application status: pending / reviewing / approved / rejected
  - `created_at` (timestamptz, default now())

2. Storage
- Create public bucket `tutor-intro-videos` for storing self-introduction video files.
- Policy: anyone can upload (anon + authenticated) since there is no sign-in yet.
- Policy: anyone can read the videos (public bucket).

3. Security
- Enable RLS on `tutor_applications`.
- Allow anon + authenticated to INSERT (submit application) and SELECT (view status).
- No UPDATE or DELETE from the client — managed server-side only.

4. Notes
- This is a no-auth app (no sign-in screen), so policies use `TO anon, authenticated`.
- Video files are stored in Supabase Storage bucket `tutor-intro-videos`.
*/

CREATE TABLE IF NOT EXISTS tutor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  email text NOT NULL,
  teaches_language text NOT NULL,
  native_language text NOT NULL,
  bio text NOT NULL,
  experience_years integer NOT NULL DEFAULT 0,
  video_url text,
  video_path text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tutor_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_applications" ON tutor_applications;
CREATE POLICY "anon_select_applications" ON tutor_applications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_applications" ON tutor_applications;
CREATE POLICY "anon_insert_applications" ON tutor_applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Create storage bucket for intro videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-intro-videos', 'tutor-intro-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow anon + authenticated to upload and read
DROP POLICY IF EXISTS "allow_public_read_videos" ON storage.objects;
CREATE POLICY "allow_public_read_videos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'tutor-intro-videos');

DROP POLICY IF EXISTS "allow_public_upload_videos" ON storage.objects;
CREATE POLICY "allow_public_upload_videos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'tutor-intro-videos');