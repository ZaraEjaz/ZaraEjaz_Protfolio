/**
 * Infinite marquee. The track holds the list twice and slides by exactly one copy,
 * so the loop is seamless. Pauses on hover; static (and scrollable) with reduced motion.
 */
export default function Marquee({ items, reverse = false, speed = 40, label }) {
  const row = (hidden) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t}>
          <span>{t}</span>
          <i aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`marquee ${reverse ? 'marquee--rev' : ''}`} style={{ '--marquee-dur': `${speed}s` }} aria-label={label}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
