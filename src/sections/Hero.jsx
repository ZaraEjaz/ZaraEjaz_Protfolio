import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '../lib/anim';
import { handleAnchor } from '../lib/scroll';
import { Reveal } from '../ui/Reveal';
import Lazy3D from '../ui/Lazy3D';
import { useDeviceTier } from '../hooks/useDeviceTier';
import { toggleMenu, useClock } from '../hooks/useClock';
import { Arrow } from './icons';
import { profile } from '../content';
import './Hero.css';

/**
 * Full-screen hero: 3D workstation in the centre, text in the corners.
 * top-left name · top-right status/time/CTA/menu · right tagline · bottom-left statement · bottom-right CTA.
 */
export default function Hero({ ready }) {
  const root = useRef(null);
  const time = useClock();
  // phones wait longer: the copy and first interaction come first, the 3D fades in after
  const tier = useDeviceTier();

  useEffect(() => {
    if (!ready || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.to('.hero-in', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.35 });
      gsap.to('.hero-stage', { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out', delay: 0.2 });
      // the scene fades as the hero scrolls away (the camera pulls back in 3D)
      gsap.fromTo(
        '.hero-3d',
        { opacity: 1 },
        { opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } },
      );
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="top" data-section="top" ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" aria-hidden="true">
        {/* mounts once the intro has played, so it never competes with first paint */}
        <Lazy3D kind="hero" className="hero-3d" delay={tier === 'lite' ? 3500 : 1400} after={ready} fallback={<div className="hero-3d-glow" />} />
      </div>

      <div className="hero-name-wrap">
        <Reveal as="h1" id="hero-title" mode="words" play={ready} className="hero-name">
          {profile.name}
        </Reveal>
      </div>

      <div className="hero-bar hero-in">
        <p className="hero-status">
          <span className="hero-status-dot" aria-hidden="true" />
          Open to opportunities
        </p>
        <p className="hero-time">
          <span className="hero-time-now">{time}</span>
          <span className="hero-time-zone mono">PKT (GMT+5)</span>
        </p>
        <a className="hero-talk" href="#contact" onClick={handleAnchor}>
          Let&apos;s talk
        </a>
        <button type="button" className="hero-menu" onClick={toggleMenu} aria-label="Open menu" aria-controls="nav-sheet">
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <p className="hero-tagline hero-in">
        <span className="hero-tag-hl">Systems</span>
        <span className="hero-tag-hl">That Run</span>
        <span>Businesses,</span>
        <span>Built to Scale.</span>
      </p>

      <p className="hero-statement hero-in">
        <span className="hero-statement-hi">I build ERP solutions, web apps and SaaS platforms</span>{' '}
        <span className="hero-statement-lo">from first client call to production.</span>
      </p>

      <div className="hero-actions hero-in">
        <a className="hero-cta" href="#work" onClick={handleAnchor}>
          View my work
        </a>
        <a className="hero-cv" href={profile.cv} download>
          Download CV <Arrow dir="down" />
        </a>
      </div>
    </section>
  );
}
