-- F20: enforce the upload size and type limits server-side, not only in the browser.
-- F21: applicant intro videos must not be publicly readable or listable.
UPDATE storage.buckets
   SET public = false,
       file_size_limit = 104857600,
       allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/webm']
 WHERE id = 'tutor-intro-videos';

DROP POLICY IF EXISTS allow_public_read_videos ON storage.objects;
