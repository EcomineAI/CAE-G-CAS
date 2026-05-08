// ============================================================
// G-CAS Application Constants — single source of truth
// ============================================================

export const APP_NAME = 'G-CAS';
export const APP_FULL_NAME = 'Guidance & Consultation Appointment System';
export const APP_SHORT = 'GCAS';

// Room number range for schedule room selection (300–500)
export const ROOM_OPTIONS = ['TBA', ...Array.from({ length: 201 }, (_, i) => String(300 + i))];

// Philippine name prefixes (grouped)
export const PH_PREFIXES = {
  'General / Civil': ['Mr.', 'Ms.', 'Mrs.', 'Miss'],
  'Academic / Professional': ['Dr.', 'Prof.', 'Engr.', 'Arch.', 'Atty.', 'CPA', 'RN', 'RPh', 'RMT', 'PT', 'OD'],
  'Military / Government': ['Gen.', 'Col.', 'Maj.', 'Capt.', 'Lt.', 'Sgt.', 'Hon.'],
  'Religious': ['Fr.', 'Sr.', 'Bro.', 'Rev.', 'Deacon', 'Bishop'],
  'Traditional': ['Datu', 'Lakan', 'Bai'],
};

// Philippine name suffixes (grouped)
export const PH_SUFFIXES = {
  'Generational': ['Jr.', 'Sr.', 'II', 'III', 'IV'],
  'Academic Degrees': ['Ph.D.', 'Ed.D.', 'D.B.A.', 'M.D.', 'J.D.', 'LL.B.', 'LL.M.'],
  'Professional Licenses': ['CPA', 'RN', 'RPh', 'RMT', 'PT', 'OD', 'Engr.', 'Arch.', 'Atty.'],
  'Military': ['Ret.'],
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
export const SCHEDULE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
