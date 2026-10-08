-- ============================================================
-- FACS Migration: Faculty Blocked Dates
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Create the blocked_dates table
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  from_date date not null,
  to_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint blocked_dates_valid_range check (to_date >= from_date)
);

-- 2. Index for faster per-faculty lookups
create index if not exists blocked_dates_faculty_idx
  on public.blocked_dates (faculty_id);

create index if not exists blocked_dates_range_idx
  on public.blocked_dates (faculty_id, from_date, to_date);

-- 3. Enable Row Level Security
alter table public.blocked_dates enable row level security;

-- 4. Policies
-- Faculty can read their own blocks
drop policy if exists "Faculty can read own blocks" on public.blocked_dates;
create policy "Faculty can read own blocks"
  on public.blocked_dates for select
  using (auth.uid() = faculty_id);

-- Students (any logged-in user) can read ANY faculty's blocks so the UI can
-- show blocked dates in the booking flow.
drop policy if exists "Authenticated can read all blocks" on public.blocked_dates;
create policy "Authenticated can read all blocks"
  on public.blocked_dates for select
  using (auth.role() = 'authenticated');

-- Faculty can create their own blocks
drop policy if exists "Faculty can create own blocks" on public.blocked_dates;
create policy "Faculty can create own blocks"
  on public.blocked_dates for insert
  with check (auth.uid() = faculty_id);

-- Faculty can delete their own blocks
drop policy if exists "Faculty can delete own blocks" on public.blocked_dates;
create policy "Faculty can delete own blocks"
  on public.blocked_dates for delete
  using (auth.uid() = faculty_id);

-- 5. Enable realtime (so UI stays in sync across devices/tabs)
alter publication supabase_realtime add table public.blocked_dates;
