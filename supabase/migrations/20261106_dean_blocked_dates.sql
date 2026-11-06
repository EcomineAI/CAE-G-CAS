CREATE TABLE public.dean_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  reason text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dean_blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dean can manage blocked dates"
  ON public.dean_blocked_dates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
