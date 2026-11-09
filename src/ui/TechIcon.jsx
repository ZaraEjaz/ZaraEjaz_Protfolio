/** Small line-icon set for the journey inventory (24×24, stroke = currentColor). Simplified marks, not logos. */
const T = (label, size = 8.5) => (
  <text x="12" y="12.5" textAnchor="middle" dominantBaseline="middle" fontSize={size} fontFamily="var(--font-mono)" fontWeight="600" fill="currentColor" stroke="none">
    {label}
  </text>
);

const ICONS = {
  React: (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </>
  ),
  'Next.js': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 16V8l7 9M15 8v5" />
    </>
  ),
  'Node.js': (
    <>
      <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />
      {T('N', 8)}
    </>
  ),
  Express: T('ex', 10),
  JavaScript: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      {T('JS', 7.5)}
    </>
  ),
  HTML: <path d="M8.5 7 4 12l4.5 5M15.5 7 20 12l-4.5 5M13.5 5.5l-3 13" />,
  CSS: (
    <path d="M9 4.5c-2 0-2.5 1-2.5 2.5v2.5c0 1.4-.8 2.5-2 2.5 1.2 0 2 1.1 2 2.5V17c0 1.5.5 2.5 2.5 2.5M15 4.5c2 0 2.5 1 2.5 2.5v2.5c0 1.4.8 2.5 2 2.5-1.2 0-2 1.1-2 2.5V17c0 1.5-.5 2.5-2.5 2.5" />
  ),
  'REST APIs': <path d="M4 9h14l-3.5-3.5M20 15H6l3.5 3.5" />,
  MySQL: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.6" />
      <path d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" />
    </>
  ),
  Figma: (
    <>
      <path d="M12 3H9a3 3 0 0 0 0 6h3zM12 9H9a3 3 0 0 0 0 6h3zM12 15H9a3 3 0 1 0 3 3zM12 3h3a3 3 0 0 1 0 6h-3z" />
      <circle cx="15" cy="12" r="3" />
    </>
  ),
  'Tailwind CSS': <path d="M3 11c1.5-3 3.5-4 6-3s3 3 6 3 4-1 6-3M3 17c1.5-3 3.5-4 6-3s3 3 6 3 4-1 6-3" />,
  Redux: (
    <>
      <path d="M15.5 16.5c-2.5 3-7.5 3-10-1M17.5 8.5c1.5 3.5 0 7.5-3.5 9M6.5 9c1.5-3.5 6-5 9.5-3" />
      <circle cx="16.5" cy="16.5" r="1.4" />
      <circle cx="17.8" cy="7.6" r="1.4" />
      <circle cx="6.2" cy="10.4" r="1.4" />
    </>
  ),
  Agile: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v3.2h-3.2" />
    </>
  ),
  ERPNext: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M15 8H9v8h6M9 12h5" />
    </>
  ),
  Frappe: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M15 8H9.5v8M9.5 12H14" />
    </>
  ),
  Python: (
    <>
      <path d="M12 3.5c-4 0-4 1.5-4 3v2.5h4.5v1H6c-2 0-2.5 1.8-2.5 3.5S4 17 6 17h1.5v-2.5c0-1.6 1.3-3 3-3h4c1.4 0 2.5-1.1 2.5-2.5V6.5c0-1.5-1-3-5-3z" />
      <path d="M12 20.5c4 0 4-1.5 4-3V15h-4.5v-1H18c2 0 2.5-1.8 2.5-3.5S20 7 18 7" />
    </>
  ),
};

export default function TechIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name] ?? T(name.slice(0, 2))}
    </svg>
  );
}
