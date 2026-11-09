import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import SectionHead from './SectionHead';
import { ScrollTrigger } from '../lib/anim';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { useDeviceTier } from '../hooks/useDeviceTier';
import { useInView } from '../hooks/useInView';
import { journeyPhase, journeyState } from '../three/journey/timing';
import { journey, stories } from '../content';
import StoryOverlay from '../ui/StoryOverlay';
import SceneBoundary from '../ui/SceneBoundary';

const JourneyScene = lazy(() => import('../three/journey/JourneyScene'));

const pad = (n) => String(n).padStart(2, '0');

/** Stop card: name, role, dates and a way into the full story. */
function StopCard({ stop, index, visible, onStory }) {
  const hasStory = Boolean(stories[stop.id]);
  return (
    <article className={`jr-card ${visible ? 'is-visible' : ''}`} aria-live="polite">
      <p className="mono jr-card-meta">
        <span className="hl">{pad(index + 1)}</span> · {stop.kind === 'education' ? 'education' : 'experience'}
      </p>
      <h3 className="jr-card-title">{stop.place}</h3>
      <p className="jr-card-role">{stop.title}</p>
      <p className="mono jr-card-period">{stop.period}</p>
      {hasStory ? (
        <button type="button" className="jr-story-btn" onClick={() => onStory(stop.id)} tabIndex={visible ? 0 : -1}>
          View story <span aria-hidden="true">→</span>
        </button>
      ) : (
        <p className="mono jr-story-soon">story coming soon</p>
      )}
    </article>
  );
}

/** Reduced motion / no WebGL: the same stops as static, illustrated cards. */
function StaticSteps({ onStory }) {
  return (
    <ol className="jr-static">
      {journey.map((s, i) => (
        <li key={s.id} className="card jr-static-step">
          <span className="jr-static-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6">
              {s.kind === 'education' ? (
                <path d="M6 20 24 10l18 10-18 10L6 20Zm6 4v9c4 4 20 4 24 0v-9" />
              ) : (
                <path d="M10 40V14h18v26M28 22h10v18M15 20h3m-3 6h3m-3 6h3m5-12h3m-3 6h3m-3 6h3m9-4h3" />
              )}
            </svg>
          </span>
          <StopCard stop={s} index={i} visible onStory={onStory} />
        </li>
      ))}
    </ol>
  );
}

export default function Journey() {
  const reduced = useReducedMotion();
  const tier = useDeviceTier();
  const [viewRef, seen, visible] = useInView({ rootMargin: '600px 0px' });
  const pin = useRef(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState({ stop: 0, walking: false, dwell: 0, key: '' });
  const [storyId, setStoryId] = useState(null);
  const animated = !reduced && tier !== 'static';

  useEffect(() => {
    // created in the same commit as later sections' triggers, so pins are measured top to bottom
    if (!animated) return;
    journeyState.p = 0;
    const st = ScrollTrigger.create({
      trigger: pin.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * 5}`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        journeyState.p = self.progress;
        const j = journeyPhase(self.progress);
        // only re-render when something the HTML shows actually changes
        const shown = !j.walking && j.dwell > 0.12;
        const key = `${j.stop}|${j.walking}|${shown}`;
        setView((v) => (v.key === key ? v : { ...j, key }));
      },
    });
    return () => st.kill();
  }, [animated]);

  const stop = storyId && journey.find((s) => s.id === storyId);
  const overlay = stop && <StoryOverlay stop={stop} story={stories[storyId]} onClose={() => setStoryId(null)} />;

  if (!animated) {
    return (
      <section id="experience" data-section="experience" className="section" aria-labelledby="exp-title">
        <div className="container">
          <SectionHead index="03" label="journey" title={<span id="exp-title">The road so far.</span>} />
          <StaticSteps onStory={setStoryId} />
        </div>
        {overlay}
      </section>
    );
  }

  const current = journey[view.stop];
  const next = journey[view.stop + 1];
  const cardVisible = !view.walking && view.dwell > 0.12;

  return (
    <section id="experience" data-section="experience" className="journey" aria-labelledby="exp-title" ref={viewRef}>
      <div className="journey-pin" ref={pin}>
        <div className={`journey-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true">
          {seen && (
            <SceneBoundary>
              <Suspense fallback={null}>
                <JourneyScene active={visible && !storyId} lite={tier === 'lite'} onReady={() => setReady(true)} />
              </Suspense>
            </SceneBoundary>
          )}
        </div>

        <div className="journey-ui container">
          <header className="jr-head">
            <p className="eyebrow mono">
              <span className="hl">03</span> — journey
            </p>
            <h2 id="exp-title" className="h2">
              The road so far.
            </h2>
          </header>


          <div className="jr-card-slot">
            <StopCard key={current.id} stop={current} index={view.stop} visible={cardVisible} onStory={setStoryId} />
            {view.walking && next && (
              <p className="mono jr-walking">
                <span className="status-dot" aria-hidden="true" /> walking to {next.place}…
              </p>
            )}
          </div>

          <ol className="jr-rail" aria-label="Journey stops">
            {journey.map((s, i) => (
              <li key={s.id} className={i <= view.stop ? 'is-done' : ''}>
                <span className="jr-rail-dot" />
                <span className="mono">{s.place.split(' ')[0]}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {overlay}
    </section>
  );
}
