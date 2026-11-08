import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

/** Start Lenis and drive it from GSAP's ticker so ScrollTrigger stays in sync. */
export function startSmoothScroll() {
  if (lenis) return () => {};
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = -Math.min(72, window.innerHeight * 0.08);
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4 });
  } else {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }
}

/** onClick handler for in-page anchor links. */
export function handleAnchor(e) {
  const href = e.currentTarget.getAttribute('href');
  if (!href?.startsWith('#')) return;
  e.preventDefault();
  scrollToId(href.slice(1));
  history.replaceState(null, '', href);
}

export { gsap, ScrollTrigger };
