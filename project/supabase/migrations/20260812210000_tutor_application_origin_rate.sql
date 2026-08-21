/*
  Add origin (출신지) and hourly_rate (요금) to tutor applications basic info.
*/

ALTER TABLE public.tutor_applications
  ADD COLUMN IF NOT EXISTS origin text,
  ADD COLUMN IF NOT EXISTS hourly_rate numeric;
