# 🗄️ GCAS — Supabase Database Setup Guide

> **What this does:** Sets up the database tables so the app can save schedules, requests, and user profiles. Without this, nothing persists.

---

## Before You Start

1. You need a Supabase project → [supabase.com](https://supabase.com)
2. Your `.env` file must have these two values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. You'll be pasting SQL into the **SQL Editor** in your Supabase Dashboard

---

## How To Use This Guide

1. Go to [app.supabase.com](https://app.supabase.com) → Select your project
2. Click **SQL Editor** in the left sidebar (looks like a `>_` terminal icon)
3. Click **"New Query"**
4. **Copy-paste** each SQL block below → Click **"Run"** (or `Ctrl+Enter`)
5. You should see `Success` after each one

> ⚠️ **Run each block one at a time, in order.** Don't skip any.

---

## BLOCK 1 of 6 — Create `profiles` table

> Stores all user info (students & faculty). Auto-filled when someone signs up.

```sql
-- ================================================
-- BLOCK 1: PROFILES TABLE
-- ================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('student', 'faculty')),
  department text default 'CCS',
  avatar_url text,
  status text default 'Available' check (status in ('Available', 'Busy', 'Unavailable')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

✅ Paste → Run → You should see `Success. No rows returned.`

---

## BLOCK 2 of 6 — Create `schedules` table

> Faculty consultation time slots (day, time, room, max students).

```sql
-- ================================================
-- BLOCK 2: SCHEDULES TABLE
-- ================================================
create table if not exists public.schedules (
  id uuid default gen_random_uuid() primary key,
  faculty_id uuid references public.profiles(id) on delete cascade not null,
  day text not null check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  start_time time not null,
  end_time time not null,
  max_slots integer default 5,
  room text default 'TBA',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

✅ Paste → Run → `Success. No rows returned.`

---

## BLOCK 3 of 6 — Create `requests` table

> Student appointment requests. Faculty can approve or decline.

```sql
-- ================================================
-- BLOCK 3: REQUESTS TABLE
-- ================================================
create table if not exists public.requests (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  faculty_id uuid references public.profiles(id) on delete cascade not null,
  schedule_id uuid references public.schedules(id) on delete set null,
  subject text,
  details text,
  cancel_reason text,
  status text default 'Pending' check (status in ('Pending','Approved','Declined','Completed','Cancelled')),
  request_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

✅ Paste → Run → `Success. No rows returned.`

---

## BLOCK 4 of 6 — Auto-create profiles on sign-up ⚡

> **This is the magic.** When someone signs up, this trigger automatically detects if they're a student or faculty based on their email, and creates their profile row.

### How it decides:

| Email pattern | Role | Name saved |
|--------------|------|------------|
| `202110123@gordoncollege.edu.ph` | **Student** | `202110123` |
| `202310456@gordoncollege.edu.ph` | **Student** | `202310456` |
| `arnie.armada@gordoncollege.edu.ph` | **Faculty** | `Arnie Armada` |
| `kenneth_bautista@gordoncollege.edu.ph` | **Faculty** | `Kenneth Bautista` |
| `cherryl-azucenas@gordoncollege.edu.ph` | **Faculty** | `Cherryl Azucenas` |

**Rule:** All numbers before `@` → Student. Any letters before `@` → Faculty.

### Copy this:

```sql
-- ================================================
-- BLOCK 4: AUTO-PROFILE TRIGGER
-- Automatically creates a profile when a user signs up
-- ================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  user_name text;
begin
  if (split_part(new.email, '@', 1) ~ '^\d+$') then
    user_role := 'student';
    user_name := split_part(new.email, '@', 1);
  else
    user_role := 'faculty';
    user_name := initcap(replace(replace(replace(split_part(new.email, '@', 1), '.', ' '), '_', ' '), '-', ' '));
  end if;

  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (
    new.id,
    new.email,
    user_name,
    user_role,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

✅ Paste → Run → `Success. No rows returned.`

### Test it:
1. Go to **Authentication** → **Users** in dashboard
2. Click **"Add user"** → **"Create new user"**
3. Enter `202199999@gordoncollege.edu.ph` with any password
4. Go to **Table Editor** → **profiles**
5. You should see a row with `role = student`, `full_name = 202199999` ✅

---

## BLOCK 5 of 6 — Security policies (RLS)

> Controls who can read/write what. Without this, nobody can access the data.

```sql
-- ================================================
-- BLOCK 5: ROW LEVEL SECURITY
-- ================================================

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.schedules enable row level security;
alter table public.requests enable row level security;

-- PROFILES: anyone can read, users update own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- SCHEDULES: anyone can read, faculty manage own
create policy "Schedules are viewable by everyone"
  on public.schedules for select using (true);
create policy "Faculty can insert own schedules"
  on public.schedules for insert with check (auth.uid() = faculty_id);
create policy "Faculty can update own schedules"
  on public.schedules for update using (auth.uid() = faculty_id);
create policy "Faculty can delete own schedules"
  on public.schedules for delete using (auth.uid() = faculty_id);

-- REQUESTS: users see own, students insert, faculty update
create policy "Users can view own requests"
  on public.requests for select
  using (auth.uid() = student_id or auth.uid() = faculty_id);
create policy "Students can insert requests"
  on public.requests for insert
  with check (auth.uid() = student_id);
create policy "Faculty can update request status"
  on public.requests for update
  using (auth.uid() = faculty_id);
```

✅ Paste → Run → `Success. No rows returned.`

---

## BLOCK 6 of 6 — Backfill existing users (only if needed)

> **Skip this if you haven't signed up anyone yet.** Only run this if you had users before running Block 4.

```sql
-- ================================================
-- BLOCK 6: BACKFILL (only for pre-existing users)
-- ================================================
insert into public.profiles (id, email, full_name, role, avatar_url)
select
  u.id,
  u.email,
  case
    when split_part(u.email, '@', 1) ~ '^\d+$'
    then split_part(u.email, '@', 1)
    else initcap(replace(replace(replace(split_part(u.email, '@', 1), '.', ' '), '_', ' '), '-', ' '))
  end,
  case
    when split_part(u.email, '@', 1) ~ '^\d+$' then 'student'
    else 'faculty'
  end,
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || u.email
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
```

✅ Paste → Run → It will say how many rows were inserted.

---

## After All 6 Blocks: Enable Realtime

This makes changes sync live between faculty and student views.

1. In dashboard sidebar → **Database** → **Replication**
2. Find **"supabase_realtime"** → click **"Source"**
3. Toggle ON these tables:
   - ✅ `profiles`
   - ✅ `schedules`
   - ✅ `requests`
4. Click **Save**

---

## ✅ Verify Everything Works

1. Click **Table Editor** in sidebar
2. You should see 3 tables: `profiles`, `schedules`, `requests`
3. If you created a test user in Block 4, click `profiles` — you should see their row

---

## Quick Reference: What Each Table Stores

### `profiles`
| Column | What it is |
|--------|-----------|
| `id` | User's unique ID (from Supabase Auth) |
| `email` | Their email |
| `full_name` | Display name (auto-detected from email) |
| `role` | `'student'` or `'faculty'` (auto-detected) |
| `department` | Default: `'CCS'` |
| `avatar_url` | Auto-generated avatar |
| `status` | Faculty only: `'Available'`, `'Busy'`, or `'Unavailable'` |

### `schedules`
| Column | What it is |
|--------|-----------|
| `id` | Auto-generated ID |
| `faculty_id` | Which faculty owns this schedule |
| `day` | Day of the week |
| `start_time` / `end_time` | Time range |
| `max_slots` | How many students can book |
| `room` | Room number |
| `notes` | Optional faculty notes for the students |

### `requests`
| Column | What it is |
|--------|-----------|
| `id` | Auto-generated ID |
| `student_id` | Who submitted the request |
| `faculty_id` | Which faculty it's for |
| `schedule_id` | Which time slot they picked |
| `subject` | What the consultation is about |
| `details` | Extra details |
| `cancel_reason` | Optional text providing the reason if the student cancels the appointment |
| `status` | `'Pending'` → `'Approved'` / `'Declined'` / `'Completed'` / `'Cancelled'` |
| `request_date` | When it was submitted |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `relation "profiles" does not exist` | You skipped Block 1. Go back and run it. |
| `policy already exists` | Safe to ignore. The policy was already created from a previous run. |
| `permission denied` | Make sure SQL Editor is using the `postgres` role (it does by default). |
| Profiles not auto-creating on sign-up | Re-run Block 4. Test with the steps above. |
| Realtime not working | Check the "Enable Realtime" section — make sure tables are toggled on. |
| App shows "Loading..." forever | Your `.env` file might be wrong. Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |

---

ALTER TABLE public.requests ADD COLUMN cancel_reason text;
```

---

## BLOCK 7 of 7 — History Cleanup (Auto-Delete Old Records) 🧹

> **Performance & Privacy:** This trigger ensures that history doesn't grow forever. It automatically deletes the oldest "Completed", "Cancelled", or "Declined" records when the limit is reached.
> - **Student Limit:** Keeps only the **10** most recent history records.
> - **Faculty Limit:** Keeps only the **100** most recent history records.

```sql
-- ================================================
-- BLOCK 7: HISTORY CLEANUP TRIGGER
-- ================================================
CREATE OR REPLACE FUNCTION public.cleanup_request_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run if the status is a "History" status
  IF NEW.status IN ('Completed', 'Cancelled', 'Declined') THEN
    
    -- 1. Student Cleanup: Keep only top 10
    DELETE FROM public.requests
    WHERE id IN (
      SELECT id FROM (
        SELECT id, row_number() OVER (PARTITION BY student_id ORDER BY updated_at DESC) as rn
        FROM public.requests
        WHERE status IN ('Completed', 'Cancelled', 'Declined')
        AND student_id = NEW.student_id
      ) t
      WHERE rn > 10
    );

    -- 2. Faculty Cleanup: Keep only top 100
    DELETE FROM public.requests
    WHERE id IN (
      SELECT id FROM (
        SELECT id, row_number() OVER (PARTITION BY faculty_id ORDER BY updated_at DESC) as rn
        FROM public.requests
        WHERE status IN ('Completed', 'Cancelled', 'Declined')
        AND faculty_id = NEW.faculty_id
      ) t
      WHERE rn > 100
    );

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_cleanup_history ON public.requests;
CREATE TRIGGER tr_cleanup_history
  AFTER INSERT OR UPDATE ON public.requests
  FOR EACH ROW EXECUTE PROCEDURE public.cleanup_request_history();
```

✅ Paste → Run → `Success. No rows returned.`
