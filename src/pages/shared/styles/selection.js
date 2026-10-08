// Shared selection/hover color tokens for date cells, time chips, filter tabs,
// and any other picker-style UI used by both student and faculty.
// Edit here → both sides update.

export const SELECTION = {
  // IDLE
  idleBorder: '#e5e8f0',
  idleBg:     '#f0f2f8',
  idleText:   '#1f2937',

  // HOVER (lighter blue tint)
  hoverBorder: '#3d5fa8',
  hoverBg:     '#eef2fb',
  hoverText:   '#1a2d5a',

  // SELECTED (dark navy fill, bold white text)
  selectedBorder: '#1a2d5a',
  selectedBg:     '#1a2d5a',
  selectedText:   '#ffffff',
  selectedWeight: 800,

  // SELECTED (soft variant — light blue bg, navy bold text, used for time chips)
  selectedSoftBorder: '#1a2d5a',
  selectedSoftBg:     '#e0e8f7',
  selectedSoftText:   '#1a2d5a',

  // ACCENT highlights (for notification deep-link rows, etc.)
  highlightBg:    '#eef2fb',
  highlightFlash: '#d9e2f5',
  highlightBar:   '#1a2d5a',
};

// Convenience CSS block for a standard "picker cell" (date / chip / tab)
export const pickerCellCss = (prefix = 'sel') => `
.${prefix}-cell {
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  border: 1.5px solid ${SELECTION.idleBorder};
  background: ${SELECTION.idleBg};
  color: ${SELECTION.idleText};
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.${prefix}-cell:hover {
  border-color: ${SELECTION.hoverBorder};
  background: ${SELECTION.hoverBg};
  color: ${SELECTION.hoverText};
}
.${prefix}-cell.selected {
  background: ${SELECTION.selectedBg};
  border-color: ${SELECTION.selectedBorder};
  color: ${SELECTION.selectedText};
  font-weight: ${SELECTION.selectedWeight};
}
.${prefix}-cell.selected * {
  font-weight: ${SELECTION.selectedWeight} !important;
}
`;
