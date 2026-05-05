/* 
  GCAS DATABASE SCHEMA - v0.6.0 (Soft Delete & History Persistence)
  
  Run this in your Supabase SQL Editor.
*/

-- 1. Add soft-delete flags to requests table
ALTER TABLE IF EXISTS public.requests 
ADD COLUMN IF NOT EXISTS is_student_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_faculty_deleted BOOLEAN DEFAULT FALSE;

-- 2. Clean up existing data to prevent constraint violations
-- If a student deleted something the faculty hasn't, revert the student deletion
UPDATE public.requests 
SET is_student_deleted = FALSE 
WHERE is_faculty_deleted = FALSE AND is_student_deleted = TRUE;

-- Handle nulls
UPDATE public.requests 
SET is_student_deleted = FALSE, is_faculty_deleted = FALSE 
WHERE is_student_deleted IS NULL OR is_faculty_deleted IS NULL;

-- 3. Enforce deletion logic at the database level:
-- A student cannot delete (is_student_deleted=true) unless the faculty has already deleted it (is_faculty_deleted=true)
ALTER TABLE public.requests 
DROP CONSTRAINT IF EXISTS student_delete_after_faculty;

ALTER TABLE public.requests
ADD CONSTRAINT student_delete_after_faculty 
CHECK (
  (is_student_deleted = FALSE) OR 
  (is_student_deleted = TRUE AND is_faculty_deleted = TRUE)
);

-- 3. Enable Realtime for the profiles table
-- ALTER publication supabase_realtime ADD TABLE profiles;
