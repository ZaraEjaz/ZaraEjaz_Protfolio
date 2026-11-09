// 24px line icons (stroke = currentColor) for the CV skill groups.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ICONS = {
  // stacked modules
  erp: (
    <svg {...base}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <path d="M13.5 17.25h7.5M17.25 13.5v7.5" />
    </svg>
  ),
  // browser window with brackets
  frontend: (
    <svg {...base}>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="M2.5 8h19" />
      <path d="M9.5 12l-2.5 2.5 2.5 2.5M14.5 12l2.5 2.5-2.5 2.5" />
    </svg>
  ),
  // server stack
  backend: (
    <svg {...base}>
      <rect x="3" y="3.5" width="18" height="7" rx="1.5" />
      <rect x="3" y="13.5" width="18" height="7" rx="1.5" />
      <path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
    </svg>
  ),
  // database cylinder
  databases: (
    <svg {...base}>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.75" />
      <path d="M4.5 5.5v13c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75v-13" />
      <path d="M4.5 12c0 1.5 3.4 2.75 7.5 2.75S19.5 13.5 19.5 12" />
    </svg>
  ),
  // pen nib
  design: (
    <svg {...base}>
      <path d="M12 3l6 9-6 9-6-9z" />
      <path d="M12 3v7.5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  ),
  // git branch
  tools: (
    <svg {...base}>
      <circle cx="6" cy="5.5" r="2" />
      <circle cx="6" cy="18.5" r="2" />
      <circle cx="18" cy="8.5" r="2" />
      <path d="M6 7.5v9M18 10.5c0 4-6 3-10.5 6.5" />
    </svg>
  ),
};

export function SkillIcon({ id }) {
  return ICONS[id] ?? null;
}

export const Arrow = ({ dir = 'up-right' }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    {dir === 'up-right' ? <path d="M4 10L10 4M5 4h5v5" /> : <path d="M7 2v10M3 8l4 4 4-4" />}
  </svg>
);
