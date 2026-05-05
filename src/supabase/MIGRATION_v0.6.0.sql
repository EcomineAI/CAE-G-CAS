/* 
  GCAS DATABASE SCHEMA - v0.6.0 (Soft Delete & History Persistence)
  
  Run this in your Supabase SQL Editor.
*/

-- 1. Add soft-delete flags to requests table
ALTER TABLE IF EXISTS public.requests 
ADD COLUMN IF NOT EXISTS is_student_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_faculty_deleted BOOLEAN DEFAULT FALSE;

-- 2. Update existing data to have false values
UPDATE public.requests 
SET is_student_deleted = FALSE, is_faculty_deleted = FALSE 
WHERE is_student_deleted IS NULL;

-- 3. Enable Realtime for the profiles table
-- ALTER publication supabase_realtime ADD TABLE profiles;
