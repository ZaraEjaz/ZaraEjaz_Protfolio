import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '../lib/anim';

/** Pulls its child toward the cursor when it gets close; springs back on leave. */
export default function Magnetic({ children, strength = 0.35, radius = 1.6 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (prefersReduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = Math.max(r.width, r.height) * radius;
      if (Math.hypot(dx, dy) < reach) {
        xTo(dx * strength);
        yTo(dy * strength);
      } else {
        xTo(0);
        yTo(0);
      }
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, radius]);

  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}
