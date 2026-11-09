import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll, unlockScroll } from '../lib/scroll';
import { useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery';
import { useDeviceTier } from '../hooks/useDeviceTier';
import TechIcon from './TechIcon';
import { STORY_ART } from './storyArt';
import './StoryOverlay.css';

const StoryScene = lazy(() => import('../three/story/StoryScene'));
const pad = (n) => String(n).padStart(2, '0');

/**
 * Full-screen story for one journey stop: 3D chapters (desktop) or swipeable cards
 * (mobile / reduced motion). Next/Back, ←/→, progress bar, ✕ and Esc to close.
 */
export default function StoryOverlay({ stop, story, onClose }) {
  const reduced = useReducedMotion();
  const tier = useDeviceTier();
  const wide = useMediaQuery('(min-width: 768px)');
  const use3D = wide && !reduced && tier !== 'static';

  const n = story.chapters.length;
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  const [closing, setClosing] = useState(false);
  const root = useRef(null);
  const track = useRef(null);
  const last = i === n - 1;
  const ch = story.chapters[i];

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, reduced ? 0 : 320);
  }, [onClose, reduced]);

  const go = useCallback(
    (to) => {
      const next = Math.max(0, Math.min(n - 1, to));
      setI(next);
      // cards: scroll the chosen card into view
      const el = track.current?.children[next];
      el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    },
    [n, reduced],
  );

  useEffect(() => {
    lockScroll();
    const prev = document.activeElement;
    root.current?.focus(); // focus the dialog; rings appear only once the visitor tabs
    return () => {
      unlockScroll();
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(i + 1);
      else if (e.key === 'ArrowLeft') go(i - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go, close]);

  // cards: keep the index in sync with swiping
  useEffect(() => {
    if (use3D || !track.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setI(Number(en.target.dataset.index))),
      { root: track.current, threshold: 0.6 },
    );
    [...track.current.children].forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [use3D]);

  const stack = (
    <div className="st-stack">
      <p className="mono st-stack-label">stack</p>
      <ul>
        {stop.stack.map((t, k) => (
          <li key={t} style={{ '--k': k }}>
            <TechIcon name={t} />
            <span className="mono">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return createPortal(
    <div ref={root} tabIndex={-1} className={`story ${closing ? 'is-closing' : ''} ${use3D ? 'is-3d' : 'is-cards'}`} role="dialog" aria-modal="true" aria-labelledby="story-title">
      {use3D && (
        <div className={`story-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true">
          <Suspense fallback={null}>
            <StoryScene storyId={stop.id} chapter={i} lite={tier === 'lite'} onReady={() => setReady(true)} />
          </Suspense>
        </div>
      )}

      <header className="story-top">
        <div>
          <p className="mono story-kicker">
            <span className="hl">story</span> · {stop.period}
          </p>
          <h2 id="story-title" className="story-name">
            {stop.place}
            <span>{stop.title}</span>
          </h2>
        </div>
        <button type="button" className="story-close" onClick={close} aria-label="Close story">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      {use3D ? (
        <div className="story-caption" aria-live="polite">
          <div key={ch.id} className="story-caption-inner">
            <p className="mono story-meta">
              <span className="hl">{pad(i + 1)}</span> / {pad(n)} · {ch.label.toLowerCase()}
            </p>
            <h3 className="story-title">{ch.title}</h3>
            <p className="story-text">{ch.caption}</p>
            {last && stack}
          </div>
        </div>
      ) : (
        <ol className={`story-cards ${reduced ? '' : 'is-animated'}`} ref={track}>
          {story.chapters.map((c, k) => (
            <li key={c.id} data-index={k} className={`story-card ${k === i ? 'is-current' : ''}`} aria-current={k === i ? 'step' : undefined}>
              <svg className="story-art" viewBox="0 0 96 56" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {STORY_ART[c.id]}
              </svg>
              <p className="mono story-meta">
                <span className="hl">{pad(k + 1)}</span> / {pad(n)} · {c.label.toLowerCase()}
              </p>
              <h3 className="story-title">{c.title}</h3>
              <p className="story-text">{c.caption}</p>
              {k === n - 1 && stack}
            </li>
          ))}
        </ol>
      )}

      <nav className="story-nav" aria-label="Story chapters">
        <button type="button" className="story-btn" onClick={() => go(i - 1)} disabled={i === 0}>
          <span aria-hidden="true">←</span> Back
        </button>
        <ol className="story-progress">
          {story.chapters.map((c, k) => (
            <li key={c.id}>
              <button
                type="button"
                className={k < i ? 'is-done' : k === i ? 'is-current' : ''}
                onClick={() => go(k)}
                aria-label={`Chapter ${k + 1}: ${c.label}`}
                aria-current={k === i ? 'step' : undefined}
              />
            </li>
          ))}
        </ol>
        {last ? (
          <button type="button" className="story-btn story-btn--primary" onClick={close}>
            Done
          </button>
        ) : (
          <button type="button" className="story-btn story-btn--primary" onClick={() => go(i + 1)}>
            Next <span aria-hidden="true">→</span>
          </button>
        )}
      </nav>
    </div>,
    document.body,
  );
}
