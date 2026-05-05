/* 
  GCAS DATABASE SCHEMA - v0.6.0 (Soft Delete & History Persistence)
  
  Run this in your Supabase SQL Editor.
  Updates: Enforces that students can only clear history AFTER faculty does.
*/

-- 1. Add soft-delete flags to requests table (if not exists)
ALTER TABLE IF EXISTS public.requests 
ADD COLUMN IF NOT EXISTS is_student_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_faculty_deleted BOOLEAN DEFAULT FALSE;

-- 2. Update existing data to ensure clean booleans
UPDATE public.requests 
SET is_student_deleted = FALSE 
WHERE is_student_deleted IS NULL;

UPDATE public.requests 
SET is_faculty_deleted = FALSE 
WHERE is_faculty_deleted IS NULL;

-- 3. [OPTIONAL BUT RECOMMENDED] Enforce Logic at DB Level
-- Prevents student from setting is_student_deleted to TRUE unless is_faculty_deleted is already TRUE
ALTER TABLE public.requests
DROP CONSTRAINT IF EXISTS student_delete_check;

ALTER TABLE public.requests
ADD CONSTRAINT student_delete_check 
CHECK (is_student_deleted = false OR is_faculty_deleted = true);

-- 4. Enable Realtime for the requests table (ensure updates reflect live)
ALTER publication supabase_realtime ADD TABLE requests;
