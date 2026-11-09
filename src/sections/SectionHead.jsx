import { Reveal, Scramble } from '../ui/Reveal';

/** Eyebrow + heading (+ optional lead) used at the top of every section. */
export default function SectionHead({ index, label, title, lead, children, className = '' }) {
  return (
    <header className={`section-head ${className}`}>
      <div className="section-head-text">
        <p className="eyebrow mono">
          <span className="hl">{index}</span> — <Scramble>{label}</Scramble>
        </p>
        <Reveal className="h2">{title}</Reveal>
        {lead && (
          <p className="lead" data-reveal>
            {lead}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}
