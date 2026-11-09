import SectionHead from './SectionHead';
import Lazy3D from '../ui/Lazy3D';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { SkillIcon } from './icons';
import { skills } from '../content';

export default function Skills() {
  const wide = useMediaQuery('(min-width: 768px)');
  return (
    <section id="skills" data-section="skills" className="section" aria-labelledby="skills-title">
      <div className="container">
        <SectionHead
          index="02"
          label="skills"
          title={<span id="skills-title">The modules I ship with.</span>}
          className="section-head--split"
        >
          {wide && <Lazy3D kind="module" className="accent-3d" />}
        </SectionHead>

        <div className="skill-grid spot-group">
          {skills.map((g) => (
            <article key={g.id} className="card spot skill-card" data-reveal>
              <div className="skill-card-top">
                <span className="skill-icon">
                  <SkillIcon id={g.id} />
                </span>
                <span className="mono muted">
                  {String(g.items.length).padStart(2, '0')} skills
                </span>
              </div>
              <h3 className="h3">{g.label}</h3>
              <ul className="chips">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
