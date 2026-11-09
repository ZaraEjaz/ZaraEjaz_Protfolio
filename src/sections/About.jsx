import SectionHead from './SectionHead';
import { about, education, experience } from '../content';

const current = experience[0];
const path = [...experience].reverse(); // oldest → newest

/** Bento grid — four cards, each one clear fact from the CV. */
export default function About() {
  return (
    <section id="about" data-section="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <SectionHead index="01" label="about" title={<span id="about-title">Hi, I&apos;m Zara.</span>} />

        <div className="bento spot-group">
          <article className="card spot bento-intro" data-reveal>
            <p className="mono bento-label">about me</p>
            {about.map((p) => (
              <p key={p.slice(0, 24)} className="bento-lead">
                {p}
              </p>
            ))}
          </article>

          <article className="card spot bento-now" data-reveal>
            <p className="mono bento-label">
              <span className="status-dot" aria-hidden="true" />
              now · {current.period}
            </p>
            <p className="bento-title bento-title--lg">{current.role}</p>
            <p className="bento-sub">{current.company}</p>
          </article>

          <article className="card spot bento-path" data-reveal>
            <p className="mono bento-label">career path</p>
            <ol className="bento-steps">
              {path.map((e) => (
                <li key={e.company} className={e === current ? 'is-now' : undefined}>
                  <span className="mono">{e.year}</span>
                  {e.company}
                </li>
              ))}
            </ol>
          </article>

          <article className="card spot bento-edu" data-reveal>
            <p className="mono bento-label">education</p>
            <p className="bento-title">{education.degree}</p>
            <p className="bento-sub">{education.school}</p>
            <p className="mono muted">{education.period}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
