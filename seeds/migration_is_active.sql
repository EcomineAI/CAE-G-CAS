ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;
