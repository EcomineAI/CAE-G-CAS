-- =============================================================
-- FACS Sample Data Seed
-- Faculty Appointment & Consultation System
--
-- HOW TO USE:
--   1. Go to your Supabase project → SQL Editor
--   2. Paste and run this entire file
--   3. These are INSERT ... ON CONFLICT DO NOTHING, so safe to re-run
--
-- IMPORTANT: These rows use pre-set UUIDs so relationships work.
--   Passwords for all sample accounts: Gordon@2024
--   (Set via Supabase Auth → Users → manually or use the Auth API)
-- =============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
--    role: 'faculty' | 'student'
--    status: 'Available' | 'Busy' | 'Unavailable'
-- ────────────────────────────────────────────────────────────

INSERT INTO profiles (id, full_name, email, role, department, status, name_prefix, name_suffix, tnc_accepted, created_at)
VALUES
  -- Faculty
  ('f1000000-0000-0000-0000-000000000001', 'Maria Santos',   'msantos@institution.edu.ph',   'faculty', 'Computing', 'Available',   'Prof.',  'M.Sc.',  true, NOW() - INTERVAL '60 days'),
  ('f1000000-0000-0000-0000-000000000002', 'Jose Reyes',     'jreyes@institution.edu.ph',    'faculty', 'Computing', 'Busy',        'Dr.',    'Ph.D.',  true, NOW() - INTERVAL '55 days'),
  ('f1000000-0000-0000-0000-000000000003', 'Ana Cruz',       'acruz@institution.edu.ph',     'faculty', 'Computing', 'Available',   'Prof.',  '',       true, NOW() - INTERVAL '50 days'),
  ('f1000000-0000-0000-0000-000000000004', 'Ramon Dela Paz', 'rdelapaz@institution.edu.ph',  'faculty', 'Computing', 'Unavailable', 'Engr.', 'MSCS',   true, NOW() - INTERVAL '45 days'),
  ('f1000000-0000-0000-0000-000000000005', 'Liza Fernandez', 'lfernandez@institution.edu.ph','faculty', 'Computing', 'Available',   'Dr.',    'Ed.D.',  true, NOW() - INTERVAL '40 days'),

  -- Students
  ('s2000000-0000-0000-0000-000000000001', 'Juan dela Cruz',    '2021100001@institution.edu.ph', 'student', 'Computing', NULL, '', '', true, NOW() - INTERVAL '30 days'),
  ('s2000000-0000-0000-0000-000000000002', 'Maria Clara Lopez', '2021100002@institution.edu.ph', 'student', 'Computing', NULL, '', '', true, NOW() - INTERVAL '28 days'),
  ('s2000000-0000-0000-0000-000000000003', 'Pedro Penduko',     '2022100003@institution.edu.ph', 'student', 'Computing', NULL, '', '', true, NOW() - INTERVAL '25 days'),
  ('s2000000-0000-0000-0000-000000000004', 'Elena Reyes',       '2022100004@institution.edu.ph', 'student', 'Computing', NULL, '', '', true, NOW() - INTERVAL '20 days'),
  ('s2000000-0000-0000-0000-000000000005', 'Carlos Garcia',     '2023100005@institution.edu.ph', 'student', 'Computing', NULL, '', '', false, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. SCHEDULES
--    schedule_type: 'recurring' | 'one-time'
--    For recurring: day is set, specific_date is null
--    For one-time:  day is null, specific_date is set
-- ────────────────────────────────────────────────────────────

INSERT INTO schedules (id, faculty_id, day, specific_date, schedule_type, start_time, end_time, max_slots, room, notes, created_at)
VALUES
  -- Prof. Maria Santos — Mon 9-11 AM (2 slots), Wed 2-3 PM (1 slot)
  ('sc100000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Monday',    NULL, 'recurring', '09:00:00', '11:00:00', 2, '301', 'Please bring your printed report.', NOW() - INTERVAL '30 days'),
  ('sc100000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'Wednesday', NULL, 'recurring', '14:00:00', '15:00:00', 1, 'Online', NULL, NOW() - INTERVAL '30 days'),

  -- Dr. Jose Reyes — Tue/Thu 10-11 AM (1 slot each)
  ('sc100000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000002', 'Tuesday',  NULL, 'recurring', '10:00:00', '11:00:00', 1, '405', NULL, NOW() - INTERVAL '25 days'),
  ('sc100000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000002', 'Thursday', NULL, 'recurring', '10:00:00', '11:00:00', 1, '405', 'Thesis students only.', NOW() - INTERVAL '25 days'),

  -- Prof. Ana Cruz — Fri 1-3 PM (2 slots), one-time slot Oct 5
  ('sc100000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000003', 'Friday', NULL, 'recurring', '13:00:00', '15:00:00', 2, '302', NULL, NOW() - INTERVAL '20 days'),
  ('sc100000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000003', NULL, '2026-10-05', 'one-time', '09:00:00', '10:00:00', 1, 'Online', 'Special capstone review session.', NOW() - INTERVAL '3 days'),

  -- Dr. Liza Fernandez — Mon/Wed/Fri 3-4 PM (1 slot)
  ('sc100000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000005', 'Monday',    NULL, 'recurring', '15:00:00', '16:00:00', 1, '500', NULL, NOW() - INTERVAL '15 days'),
  ('sc100000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000005', 'Wednesday', NULL, 'recurring', '15:00:00', '16:00:00', 1, '500', NULL, NOW() - INTERVAL '15 days'),
  ('sc100000-0000-0000-0000-000000000009', 'f1000000-0000-0000-0000-000000000005', 'Friday',    NULL, 'recurring', '15:00:00', '16:00:00', 1, '500', NULL, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 3. REQUESTS
--    status: 'Pending' | 'Approved' | 'Declined' | 'Completed' | 'Cancelled'
-- ────────────────────────────────────────────────────────────

INSERT INTO requests (id, student_id, faculty_id, schedule_id, subject, details, status, request_date, consultation_type, is_student_deleted, is_faculty_deleted, created_at)
VALUES
  -- Juan → Prof. Santos (Approved, Mon slot)
  ('rq100000-0000-0000-0000-000000000001',
   's2000000-0000-0000-0000-000000000001',
   'f1000000-0000-0000-0000-000000000001',
   'sc100000-0000-0000-0000-000000000001',
   'Discrete Mathematics',
   'I need help understanding graph theory and tree traversal algorithms for my exam.',
   'Approved', '2026-09-16', 'General', false, false, NOW() - INTERVAL '14 days'),

  -- Maria Clara → Dr. Reyes (Pending, Thesis slot)
  ('rq100000-0000-0000-0000-000000000002',
   's2000000-0000-0000-0000-000000000002',
   'f1000000-0000-0000-0000-000000000002',
   'sc100000-0000-0000-0000-000000000004',
   'Thesis Chapter 3 Review',
   'Requesting feedback on my methodology section before final submission.',
   'Pending', '2026-09-20', 'Thesis / Capstone', false, false, NOW() - INTERVAL '3 days'),

  -- Pedro → Prof. Cruz (Completed)
  ('rq100000-0000-0000-0000-000000000003',
   's2000000-0000-0000-0000-000000000003',
   'f1000000-0000-0000-0000-000000000003',
   'sc100000-0000-0000-0000-000000000005',
   'Grade Concern — Data Structures',
   'I believe there was a discrepancy in my midterm grade and would like to discuss.',
   'Completed', '2026-09-10', 'Grade Appeal', false, false, NOW() - INTERVAL '20 days'),

  -- Elena → Dr. Reyes (Declined)
  ('rq100000-0000-0000-0000-000000000004',
   's2000000-0000-0000-0000-000000000004',
   'f1000000-0000-0000-0000-000000000002',
   'sc100000-0000-0000-0000-000000000003',
   'Academic Advising',
   'I want to discuss my study plan and course load for next semester.',
   'Declined', '2026-09-12', 'Academic Advising', false, false, NOW() - INTERVAL '18 days'),

  -- Carlos → Dr. Fernandez (Pending)
  ('rq100000-0000-0000-0000-000000000005',
   's2000000-0000-0000-0000-000000000005',
   'f1000000-0000-0000-0000-000000000005',
   'sc100000-0000-0000-0000-000000000007',
   'Scholarship Requirements',
   'Asking for guidance on the academic requirements needed to maintain my scholarship.',
   'Pending', '2026-09-22', 'Scholarship', false, false, NOW() - INTERVAL '1 day'),

  -- Juan → Prof. Cruz (Cancelled)
  ('rq100000-0000-0000-0000-000000000006',
   's2000000-0000-0000-0000-000000000001',
   'f1000000-0000-0000-0000-000000000003',
   'sc100000-0000-0000-0000-000000000006',
   'Capstone Proposal Review',
   'Need feedback on my system proposal before the panel presentation.',
   'Cancelled', '2026-09-19', 'Thesis / Capstone', false, false, NOW() - INTERVAL '5 days'),

  -- Maria Clara → Dr. Fernandez (Approved)
  ('rq100000-0000-0000-0000-000000000007',
   's2000000-0000-0000-0000-000000000002',
   'f1000000-0000-0000-0000-000000000005',
   'sc100000-0000-0000-0000-000000000008',
   'Enrollment Concern',
   'I was unable to enroll in one of my required subjects and need assistance.',
   'Approved', '2026-09-18', 'Enrollment Concern', false, false, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 4. NOTIFICATIONS (optional — shows the bell icon working)
-- ────────────────────────────────────────────────────────────

INSERT INTO notifications (user_id, type, message, is_read, created_at)
VALUES
  ('s2000000-0000-0000-0000-000000000001', 'approved',     'Your consultation request with Prof. Santos has been approved!',         false, NOW() - INTERVAL '13 days'),
  ('s2000000-0000-0000-0000-000000000002', 'new_request',  'Dr. Reyes received your consultation request.',                          true,  NOW() - INTERVAL '3 days'),
  ('s2000000-0000-0000-0000-000000000004', 'declined',     'Your request with Dr. Reyes was declined.',                             false, NOW() - INTERVAL '17 days'),
  ('f1000000-0000-0000-0000-000000000001', 'new_request',  'Juan dela Cruz requested a consultation on Monday at 09:00 - 11:00.',   false, NOW() - INTERVAL '14 days'),
  ('f1000000-0000-0000-0000-000000000002', 'new_request',  'Maria Clara Lopez requested a consultation on Thursday at 10:00 - 11:00.', false, NOW() - INTERVAL '3 days'),
  ('f1000000-0000-0000-0000-000000000005', 'new_request',  'Carlos Garcia requested a consultation on Monday at 15:00 - 16:00.',    false, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
