-- F3: the admin password must be verified server-side, never in the browser bundle.
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salt text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- No policies and no grants: only the service role (edge function) can read this.
REVOKE ALL ON public.admin_credentials FROM anon, authenticated;

INSERT INTO public.admin_credentials (salt, password_hash)
SELECT 'c739af5fa49c98a1ea9baf675987ed8f',
       'd215bcd4aafbd818109ff49812518dc1b0763f9c0ce60c2c7b379ed98bb413a1'
WHERE NOT EXISTS (SELECT 1 FROM public.admin_credentials);
