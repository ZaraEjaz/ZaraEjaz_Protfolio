import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './Loader.css';

const LINES = [
  ['booting zara.os', ''],
  ['reading resume.pdf', 'ok'],
  ['mounting frontend + backend', 'ok'],
  ['linking frappe ↔ erpnext', 'ok'],
];
const KEY = 'ze-booted';

function shouldSkip() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** ~1.1s boot log. Plays once per session; skipped for reduced motion. */
export default function Loader({ onDone }) {
  const [skip] = useState(shouldSkip);
  const [count, setCount] = useState(0);
  const root = useRef(null);

  useEffect(() => {
    if (skip) {
      onDone();
      return;
    }
    const timers = LINES.map((_, i) => setTimeout(() => setCount(i + 1), 120 + i * 170));
    let tween;
    const exit = setTimeout(() => {
      onDone();
      tween = gsap.to(root.current, {
        yPercent: -100,
        duration: 0.9,
        ease: 'expo.inOut',
        onComplete: () => root.current && (root.current.style.display = 'none'),
      });
      try {
        sessionStorage.setItem(KEY, '1');
      } catch {
        /* storage unavailable — loader just plays again next visit */
      }
    }, 120 + LINES.length * 170 + 260);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(exit);
      tween?.kill();
    };
  }, [skip, onDone]);

  if (skip) return null;

  return (
    <div ref={root} className="loader" role="status" aria-label="Loading">
      <div className="loader-log">
        {LINES.slice(0, count).map(([text, status], i) => (
          <div key={text} className="loader-line">
            <span className="loader-prompt">&gt;</span> {text}
            {status && (
              <>
                <span className="loader-dots" /> <span className="loader-ok">{status}</span>
              </>
            )}
            {i === count - 1 && <span className="caret" />}
          </div>
        ))}
      </div>
      <div className="loader-bar">
        <span style={{ transform: `scaleX(${count / LINES.length})` }} />
      </div>
    </div>
  );
}
