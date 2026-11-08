import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery';
import './Cursor.css';

const INTERACTIVE = 'a, button, [data-cursor], input, textarea, label, summary';

export default function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (!fine) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');

    const lag = reduced ? 0 : 0.45;
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: lag, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: lag, ease: 'power3' });

    let shown = false;
    const move = (e) => {
      if (!shown) {
        shown = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        root.classList.add('cursor-visible');
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e) => {
      const el = e.target.closest?.(INTERACTIVE);
      root.classList.toggle('cursor-hover', !!el);
      const text = el?.getAttribute('data-cursor') || '';
      label.current.textContent = text;
      root.classList.toggle('cursor-label', !!text);
    };
    const leave = () => {
      shown = false;
      root.classList.remove('cursor-visible');
    };
    const down = () => root.classList.add('cursor-down');
    const up = () => root.classList.remove('cursor-down');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      root.classList.remove('has-cursor', 'cursor-visible', 'cursor-hover', 'cursor-label', 'cursor-down');
    };
  }, [fine, reduced]);

  if (!fine) return null;
  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-text" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
