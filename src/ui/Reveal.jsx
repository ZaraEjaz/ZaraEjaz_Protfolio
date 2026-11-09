import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReduced, SCRAMBLE_CHARS, SplitText } from '../lib/anim';

const fontsReady = () => document.fonts?.ready ?? Promise.resolve();

/**
 * Heading with a split reveal.
 *  mode="words"    — words rise out of a mask (section headings), on scroll-in
 *  mode="assemble" — letters fly in from scattered positions (hero name)
 * Pass `play` to control timing yourself instead of scroll-triggering.
 * Splits only after web fonts load (so measurements are right); SplitText's aria handling
 * keeps the heading readable as one string.
 */
export function Reveal({ as: Tag = 'h2', mode = 'words', start = 'top 85%', play, className, children, ...rest }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (prefersReduced()) return;
    const el = ref.current;
    let split;
    let st;
    let cancelled = false;
    el.style.visibility = 'hidden'; // until split + parked, avoids a flash of the final state

    fontsReady().then(() => {
      if (cancelled) return;
      if (mode === 'assemble') {
        split = SplitText.create(el, { type: 'chars', aria: 'auto' });
        // gradient text survives splitting: each letter paints its own slice of one shared gradient
        el.querySelectorAll('.grad-text').forEach((span) => {
          const box = span.getBoundingClientRect();
          span.style.backgroundImage = 'none'; // letters paint the gradient now
          split.chars
            .filter((c) => span.contains(c))
            .forEach((c) => {
              const r = c.getBoundingClientRect();
              Object.assign(c.style, {
                backgroundImage: 'var(--grad)',
                backgroundSize: `${box.width}px 100%`,
                backgroundPosition: `${box.left - r.left}px 0`,
                webkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              });
            });
        });
        gsap.set(split.chars, {
          opacity: 0,
          x: () => gsap.utils.random(-70, 70),
          y: () => gsap.utils.random(-45, 45),
          rotate: () => gsap.utils.random(-30, 30),
          filter: 'blur(6px)',
        });
      } else {
        split = SplitText.create(el, { type: 'words', mask: 'words', aria: 'auto' });
        gsap.set(split.words, { yPercent: 115 });
      }
      el.style.visibility = '';

      const animate = () =>
        mode === 'assemble'
          ? gsap.to(split.chars, {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              filter: 'blur(0px)',
              duration: 1.2,
              ease: 'expo.out',
              stagger: { each: 0.05, from: 'random' },
            })
          : gsap.to(split.words, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.07 });

      if (play === true) animate();
      else if (play === undefined) st = gsap.timeline({ scrollTrigger: { trigger: el, start, once: true } }).call(animate);
      // play === false: stay parked until it flips to true (effect re-runs)
    });

    return () => {
      cancelled = true;
      st?.scrollTrigger?.kill();
      if (split) {
        gsap.killTweensOf(mode === 'assemble' ? split.chars : split.words);
        split.revert();
      }
      el.style.visibility = '';
    };
  }, [mode, play, start]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

/** Mono label that decodes itself when it scrolls into view (or when `play` turns true). */
export function Scramble({ as: Tag = 'span', className, children, delay = 0, play, ...rest }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (prefersReduced() || play === false) return;
    const el = ref.current;
    const text = el.textContent;
    let tween;
    const run = () => {
      tween = gsap.to(el, {
        duration: Math.min(1.4, 0.4 + text.length * 0.025),
        delay,
        scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.6, revealDelay: 0.15 },
        ease: 'none',
      });
    };
    let st;
    if (play) run();
    else st = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 92%', once: true } }).call(run);
    return () => {
      st?.scrollTrigger?.kill();
      tween?.kill();
      el.textContent = text;
    };
  }, [delay, play]);
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
