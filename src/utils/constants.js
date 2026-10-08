// ============================================================
// FACS Application Constants — single source of truth
// ============================================================

export const APP_NAME = 'FACS';
export const APP_FULL_NAME = 'Faculty Appointment & Consultation System';
export const APP_SHORT = 'FACS';

// Room number range for schedule room selection (300–500)
export const ROOM_OPTIONS = ['TBA', ...Array.from({ length: 201 }, (_, i) => String(300 + i))];

// Philippine name prefixes (grouped) — General/Civil + Academic only
export const PH_PREFIXES = {
  'General / Civil': ['Mr.', 'Ms.', 'Mrs.', 'Miss', 'Mx.'],
  'Academic': ['Dr.', 'Prof.', 'Asst. Prof.', 'Assoc. Prof.'],
};

// Philippine name suffixes (grouped) — Military/Government removed
export const PH_SUFFIXES = {
  'Generational': ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'],
  'Doctoral': ['Ph.D.', 'Ed.D.', 'D.B.A.', 'D.M.', 'D.Sc.', 'D.Eng.', 'M.D.', 'J.D.', 'LL.D.'],
  'Masters': ['M.A.', 'M.S.', 'M.B.A.', 'M.Ed.', 'M.Eng.', 'M.P.A.', 'LL.M.', 'M.P.H.'],
  "Bachelor's": ['LL.B.', 'A.B.', 'B.S.', 'B.A.', 'B.Ed.'],
  'Professional Licenses': ['CPA', 'RN', 'RPh', 'RMT', 'PT', 'OD', 'Engr.', 'Arch.', 'Atty.', 'LPT', 'PME', 'BSMT'],
};

// Consultation type options
export const CONSULTATION_TYPES = [
  'General',
  'Thesis / Capstone',
  'Grade Appeal',
  'Academic Advising',
  'Enrollment Concern',
  'Scholarship',
  'Personal / Guidance',
];

// Days of the week for schedule forms
export const SCHEDULE_DAYS = ['Monday', 'Tuesday', 'Wednesday',  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const FACULTY_TITLES = {
  'Academic': ['Instructor', 'Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer'],
  'Administrative': ['Department Head', 'Dean', 'Registrar', 'Director', 'Chairperson']
};

export const ROOM_NUMBERS = [
  "TBA",
  "Online",
  ...Array.from({ length: 201 }, (_, i) => String(300 + i))
];

// Request status labels
export const STATUS_LABELS = {
  Pending:     { label: 'Pending',      icon: '⏳', color: '#ca8a04', bg: '#fef9c3' },
  Approved:    { label: 'Approved',     icon: '✅', color: '#16a34a', bg: '#dcfce7' },
  Declined:    { label: 'Declined',     icon: '❌', color: '#dc2626', bg: '#fee2e2' },
  Completed:   { label: 'Completed',    icon: '🎓', color: '#ea580c', bg: '#fff7ed' },
  Cancelled:   { label: 'Cancelled',    icon: '🚫', color: '#64748b', bg: '#f1f5f9' },
  Rescheduling:{ label: 'Rescheduling', icon: '📅', color: '#7c3aed', bg: '#ede9fe' },
};

// Max active requests per student
export const MAX_ACTIVE_REQUESTS = 2;
