import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '../lib/anim';
import { handleAnchor } from '../lib/scroll';
import { Reveal, Scramble } from '../ui/Reveal';
import Magnetic from '../ui/Magnetic';
import Lazy3D from '../ui/Lazy3D';
import { useDeviceTier } from '../hooks/useDeviceTier';
import { Arrow } from './icons';
import Terminal from '../ui/Terminal';
import { experience, profile } from '../content';

const current = experience[0];

export default function Hero({ ready }) {
  const root = useRef(null);
  // phones wait longer: the hero copy and first interaction come first, the desk fades in after
  const tier = useDeviceTier();

  useEffect(() => {
    if (!ready || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.to('.hero-in', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.6 });
      gsap.to('.hero-stage', { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out', delay: 0.2 });
      // the setup fades out as the hero scrolls away (the camera pull-back happens in 3D)
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
      <div className="container grid hero-grid">
        <div className="hero-copy">
          <p className="mono hero-label">
            <span className="hl">{'//'}</span> <Scramble play={ready}>{profile.role.toLowerCase()}</Scramble>
          </p>
          <Reveal as="h1" id="hero-title" mode="assemble" play={ready} className="hero-name">
            {profile.name.split(' ')[0]} <span className="grad-text">{profile.name.split(' ').slice(1).join(' ')}.</span>
          </Reveal>
          <Reveal as="p" mode="words" play={ready} className="hero-title">
            {profile.title}
          </Reveal>
          <p className="hero-sub hero-in">{profile.summary}</p>
          <div className="hero-ctas hero-in">
            <Magnetic>
              <a className="btn" data-variant="primary" href="#work" onClick={handleAnchor}>
                View work <span className="btn-icon" aria-hidden="true">→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn" href={profile.cv} download data-icon-dir="down">
                Download CV{' '}
                <span className="btn-icon">
                  <Arrow dir="down" />
                </span>
              </a>
            </Magnetic>
          </div>
          <p className="mono hero-now hero-in">
            <span className="status-dot" aria-hidden="true" /> currently {current.role.split(' / ')[0].toLowerCase()} @{' '}
            {current.company}
          </p>
        </div>

        <div className="hero-stage">
          {/* the desk scene mounts once the intro has played, so it never competes with first paint */}
          <Lazy3D kind="desk" className="hero-3d" delay={tier === 'lite' ? 3500 : 1400} after={ready} fallback={<div className="hero-3d-glow" />} />
          <Terminal />
          <p className="mono hero-hint" aria-hidden="true">
            {'// click the screen · click the lamp'}
          </p>
        </div>
      </div>
    </section>
  );
}
