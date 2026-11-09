import { useEffect, useRef } from 'react';
import { lockScroll, unlockScroll } from '../lib/scroll';
import { Arrow } from './icons';

const pad = (n) => String(n).padStart(2, '0');

export function Links({ project, size = 'sm' }) {
  return (
    <>
      {project.live && (
        <a className={`btn btn--${size}`} href={project.live} target="_blank" rel="noreferrer">
          Live site <Arrow />
        </a>
      )}
      {project.github && (
        <a className={`btn btn--${size}`} href={project.github} target="_blank" rel="noreferrer">
          GitHub <Arrow />
        </a>
      )}
    </>
  );
}

/** Case-study drawer (native <dialog>: focus handling, Esc and backdrop for free). */

export default function CaseStudy({ project, index, onClose }) {
  const dialog = useRef(null);

  useEffect(() => {
    const d = dialog.current;
    if (!project) return;
    d.showModal();
    lockScroll();
    const onCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener('cancel', onCancel);
    return () => {
      d.removeEventListener('cancel', onCancel);
      if (d.open) d.close();
      unlockScroll();
    };
  }, [project, onClose]);

  const rows = project
    ? [
        ['What it is', project.description],
        ['Who it was for', project.client],
        ['My role', project.role],
      ].filter(([, v]) => v)
    : [];

  return (
    <dialog
      ref={dialog}
      className="case"
      aria-labelledby="case-title"
      onClick={(e) => e.target === dialog.current && onClose()}
      data-lenis-prevent
    >
      {project && (
        <div className="case-inner">
          <header className="case-head">
            <p className="mono">
              <span className="hl">{pad(index + 1)}</span> / case study
            </p>
            <button type="button" className="case-close" onClick={onClose} aria-label="Close case study">
              ✕
            </button>
          </header>
          <h2 id="case-title" className="case-title">
            {project.title}
          </h2>
          <p className="case-tagline">{project.tagline}</p>
          <img
            className="case-shot"
            src={project.image}
            srcSet={`${project.image.replace(/\.webp$/, '-640.webp')} 640w, ${project.image} 1280w`}
            sizes="(max-width: 900px) 92vw, 800px"
            alt={`Screenshot of ${project.title}`}
            width="1280"
            height="720"
            decoding="async"
          />

          <dl className="case-facts">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            {project.stack.length > 0 && (
              <div>
                <dt className="mono">Tech stack</dt>
                <dd>
                  <ul className="chips chips--anim is-in">
                    {project.stack.map((t, i) => (
                      <li key={t} style={{ '--d': i }}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            <div>
              <dt className="mono">Key features</dt>
              <dd>
                <ul className="case-features">
                  {project.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className="case-actions">
            <Links project={project} size="lg" />
          </div>
        </div>
      )}
    </dialog>
  );
}
