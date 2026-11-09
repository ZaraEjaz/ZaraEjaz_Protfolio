import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import SectionHead from './SectionHead';
import CaseStudy, { Links } from './CaseStudy';
import { ScrollTrigger } from '../lib/anim';
import { scrollToY } from '../lib/scroll';
import Magnetic from '../ui/Magnetic';
import { useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery';
import { useDeviceTier } from '../hooks/useDeviceTier';
import { useInView } from '../hooks/useInView';
import { workState } from '../three/work/workState';
import { projects } from '../content';
import SceneBoundary from '../ui/SceneBoundary';

const WorkScene = lazy(() => import('../three/work/WorkScene'));
const N = projects.length;
const pad = (n) => String(n).padStart(2, '0');

function Panel({ project, index, onOpen }) {
  return (
    <div className="wk-panel" key={project.id}>
      <p className="mono wk-count">
        <span className="hl">{pad(index + 1)}</span> / {pad(N)}
      </p>
      <h3 className="wk-title">{project.title}</h3>
      <p className="wk-desc">{project.tagline}</p>
      {project.stack.length > 0 && (
        <ul className="chips chips--anim is-in">
          {project.stack.map((t, j) => (
            <li key={t} style={{ '--d': j }}>
              {t}
            </li>
          ))}
        </ul>
      )}
      <div className="wk-actions">
        <Magnetic strength={0.3}>
          <button type="button" className="btn btn--sm" data-variant="primary" onClick={onOpen}>
            View case study <span className="btn-icon" aria-hidden="true">→</span>
          </button>
        </Magnetic>
        <Links project={project} />
      </div>
    </div>
  );
}

/* ---------------- static version: phones, reduced motion, no WebGL ---------------- */

/** Light CSS prop animation per project (no 3D). */
function MiniProps({ id }) {
  if (id === 'algorithm-visualizer')
    return (
      <div className="mp mp-bars" aria-hidden="true">
        {[5, 2, 8, 3, 6, 1, 7, 4].map((h, i) => (
          <i key={i} style={{ '--h': h, '--i': i }} />
        ))}
      </div>
    );
  const svg = (d) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
  const glyphs = {
    'talha-portfolio': [<b key="t">T</b>, <b key="a">A</b>, svg('M4 20l4-1L19 8l-3-3L5 16l-1 4zM14 7l3 3')],
    'research-professionals': [
      svg('M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z'),
      svg('M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5'),
      svg('M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5'),
    ],
    'my-portfolio': [svg('M12 3l8 5v8l-8 5-8-5V8z'), svg('M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'), svg('M4 8h16v8H4z')],
  }[id];
  return (
    <div className="mp" aria-hidden="true">
      {glyphs.map((g, i) => (
        <span key={i} style={{ '--i': i }}>
          {g}
        </span>
      ))}
    </div>
  );
}

/** 640w variant for phones + the 1280w original (both WebP). */
const screenSrcSet = (src) => `${src.replace(/\.webp$/, '-640.webp')} 640w, ${src} 1280w`;

function StaticWork({ onOpen }) {
  return (
    <div className="wk-static">
      {projects.map((p, i) => (
        <article key={p.id} className="wk-static-item" data-reveal>
          <div className="laptop-mock">
            <div className="laptop-screen">
              <img src={p.image} srcSet={screenSrcSet(p.image)} sizes="(max-width: 900px) 92vw, 600px" alt={`Screenshot of ${p.title}`} width="1280" height="800" loading="lazy" decoding="async" />
            </div>
            <div className="laptop-base" />
            <MiniProps id={p.id} />
          </div>
          <Panel project={p} index={i} onOpen={() => onOpen(i)} />
        </article>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ section */

export default function Projects() {
  const reduced = useReducedMotion();
  const tier = useDeviceTier();
  const wide = useMediaQuery('(min-width: 900px)');
  const use3D = wide && !reduced && tier === 'full';

  const pin = useRef(null);
  const st = useRef(null);
  const [viewRef, seen, visible] = useInView({ rootMargin: '600px 0px' });
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(-1);
  const close = useCallback(() => setOpen(-1), []);

  useEffect(() => {
    if (!use3D) return;
    workState.f = 0;
    st.current = ScrollTrigger.create({
      trigger: pin.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * (N - 0.2)}`,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        workState.f = self.progress * (N - 1);
        const i = Math.round(workState.f);
        setCurrent((c) => (c === i ? c : i));
      },
    });
    return () => st.current?.kill();
  }, [use3D]);

  const goTo = useCallback((i) => {
    const t = st.current;
    if (!t) return;
    const clamped = Math.max(0, Math.min(N - 1, i));
    scrollToY(t.start + (t.end - t.start) * (clamped / (N - 1)) + (clamped === N - 1 ? -2 : 2));
  }, []);

  // ← / → jump between projects while the section is pinned on screen
  useEffect(() => {
    if (!use3D) return;
    const onKey = (e) => {
      // only while the work section covers the middle of the screen
      const r = pin.current?.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      if (open >= 0 || !r || r.top > mid || r.bottom < mid) return;
      if (e.target.closest?.('input, textarea, [contenteditable]')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(current - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [use3D, current, open, goTo]);

  const head = (
    <SectionHead
      index="04"
      label="work"
      title={<span id="work-title">Selected work.</span>}
      className={use3D ? 'wk-head' : ''}
    />
  );

  return (
    <section
      id="work"
      data-section="work"
      className={use3D ? 'work-3d' : 'section'}
      aria-labelledby="work-title"
      ref={viewRef}
    >
      {use3D ? (
        <div className="wk-pin" ref={pin}>
          <div className={`wk-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true">
            {seen && (
              <SceneBoundary>
                <Suspense fallback={null}>
                  <WorkScene active={visible} reduced={reduced} onReady={() => setReady(true)} />
                </Suspense>
              </SceneBoundary>
            )}
          </div>
          <div className="container wk-ui">
            {head}
            <Panel project={projects[current]} index={current} onOpen={() => setOpen(current)} />
            <nav className="wk-nav" aria-label="Projects">
              <button
                type="button"
                className="wk-arrow"
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                aria-label="Previous project"
              >
                ←
              </button>
              <ol className="wk-dots">
                {projects.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={i === current ? 'is-active' : ''}
                      onClick={() => goTo(i)}
                      aria-label={`${pad(i + 1)}: ${p.title}`}
                      aria-current={i === current ? 'true' : undefined}
                    >
                      {pad(i + 1)}
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="wk-arrow"
                onClick={() => goTo(current + 1)}
                disabled={current === N - 1}
                aria-label="Next project"
              >
                →
              </button>
              <span className="mono wk-hint">or use ← → keys</span>
            </nav>
          </div>
        </div>
      ) : (
        <div className="container">
          {head}
          <StaticWork onOpen={setOpen} />
        </div>
      )}
      <CaseStudy project={projects[open] ?? null} index={open} onClose={close} />
    </section>
  );
}
