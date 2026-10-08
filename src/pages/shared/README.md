# `src/pages/shared/` — Faculty + Student Shared Code

Anything used by **both** the faculty and student side lives here.
Edit once → both sides update automatically.

## Folders

### `components/`
Reusable React components (modals, cards, pickers, etc.) that both roles render.
Example: `AppointmentDetailsModal.jsx` — same modal shown when a student clicks
"View Details" on their Appointments tab, and when faculty clicks a notification.

### `styles/`
Shared style constants and tokens. Any color/spacing/layout value used by both
roles. Edit here instead of hard-coding it twice.

Example: `selection.js` exports the hover/selected pill colors used by date
pickers, time chips, filter tabs across both student and faculty.

### `hooks/`
Custom hooks used by both sides. For now mostly empty — add here if a hook
would be useful in both student and faculty dashboards.

## Rules of thumb
1. If only ONE side uses it → keep it in `student/` or `faculty/`
2. If BOTH sides use it → move it here
3. When you add a new shared component, re-export it from `shared/index.js`
   so imports stay short:
   `import { AppointmentDetailsModal } from '../shared';`
