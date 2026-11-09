import { gsap, prefersReduced, ScrollTrigger } from './anim';

/**
 * Scroll reveals for anything marked [data-reveal] ("up" default, "left", "right", "fade").
 * Elements entering together are staggered as a batch. Hidden state is applied only once
 * JS runs and motion is allowed (html.motion), so content is never lost without JS.
 */
export function initReveals() {
  if (prefersReduced()) return () => {};
  const root = document.documentElement;
  root.classList.add('motion');
  const triggers = ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, x: 0, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.09, overwrite: true }),
  });
  ScrollTrigger.refresh();
  return () => {
    triggers.forEach((t) => t.kill());
    root.classList.remove('motion');
  };
}
