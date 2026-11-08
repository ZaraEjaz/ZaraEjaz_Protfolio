import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap, handleAnchor } from '../../lib/scroll';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { useDeviceTier } from '../../hooks/useDeviceTier';
import HeroPoster from './HeroPoster';
import './Hero.css';

// three.js + R3F live in their own chunk, fetched only after first paint.
const NodeGraph = lazy(() => import('./NodeGraph'));

const idle = (cb) =>
  'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200);
const cancelIdle = (id) =>
  'cancelIdleCallback' in window ? cancelIdleCallback(id) : clearTimeout(id);

export default function Hero({ ready }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  const tier = useDeviceTier();
  const lite = tier !== 'full';
  const [mount3d, setMount3d] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Load the 3D chunk once the page is idle (after the loader).
  useEffect(() => {
    if (!ready || tier === 'static') return;
    const id = idle(() => setMount3d(true));
    return () => cancelIdle(id);
  }, [ready, tier]);

  // Entrance: masked line reveal, then fade the supporting bits.
  useEffect(() => {
    if (!ready || reduced) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to('.hero-reveal', { y: 0, duration: 1.3, stagger: 0.08 })
        .to('.hero-fade', { opacity: 1, y: 0, duration: 1, stagger: 0.07 }, 0.45);

      // Scroll-out: the system recedes as you move on.
      gsap.to('.hero-stage', {
        yPercent: 18,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section id="top" ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-stage" aria-hidden="true">
        <HeroPoster lite={lite} hidden={canvasReady} />
        {mount3d && (
          <Suspense fallback={null}>
            <div className={`hero-canvas-fade ${canvasReady ? 'is-ready' : ''}`}>
              <NodeGraph lite={lite} animate={!reduced} onReady={() => setCanvasReady(true)} />
            </div>
          </Suspense>
        )}
      </div>

      <div className="hero-content shell">
        <p className="hero-status mono hero-fade">
          <span className="hl">{'//'}</span> sys.status: <span className="hl">online</span>
          <span className="hero-status-sep">·</span>erp<span className="hero-status-sep">·</span>ai
          <span className="hero-status-sep">·</span>research
        </p>

        <h1 id="hero-title" className="hero-name">
          <span className="line">
            <span className="hero-reveal">Zara</span>
          </span>
          <span className="line">
            <span className="hero-reveal">
              Ejaz<span className="hero-dot">.</span>
            </span>
          </span>
        </h1>

        <p className="hero-tagline">
          <span className="line">
            <span className="hero-reveal">I build systems that</span>
          </span>{' '}
          <span className="line">
            <span className="hero-reveal">
              <em>run businesses.</em>
            </span>
          </span>
        </p>

        <p className="hero-sub hero-fade">
          ERPNext developer at TRPL by day. AI tools and research by night — and occasionally the other
          way round.
        </p>

        <div className="hero-ctas hero-fade">
          <a className="btn" data-variant="primary" href="#work" onClick={handleAnchor}>
            View work <span className="btn-icon" aria-hidden="true">→</span>
          </a>
          <a className="btn" href="/Zara_Ejaz_CV.pdf" download data-icon-dir="down">
            Download CV <span className="btn-icon" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <div className="hero-foot shell mono hero-fade">
        <span>
          {'// currently compiling'}: my master&apos;s in Germany
          <span className="caret" aria-hidden="true" />
        </span>
        <a href="#about" className="hero-scroll" onClick={handleAnchor}>
          scroll <span aria-hidden="true">↓</span>
        </a>
        <span className="hero-fig">fig.01 — modules, connected · 0 known bugs</span>
      </div>
    </section>
  );
}
