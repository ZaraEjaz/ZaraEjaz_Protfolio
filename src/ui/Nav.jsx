import { useEffect, useState } from 'react';
import { handleAnchor } from '../lib/scroll';
import { useClock } from '../hooks/useClock';
import './Nav.css';

const NAV_LINKS = [
  { id: 'about', label: 'about' },
  { id: 'skills', label: 'skills' },
  { id: 'experience', label: 'experience' },
  { id: 'work', label: 'work' },
  { id: 'contact', label: 'contact' },
];

export default function Nav() {
  const time = useClock();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // the hero has its own top bar (name, status, menu); the fixed nav takes over once it scrolls away
  const [onHero, setOnHero] = useState(true);

  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return setOnHero(false);
    const io = new IntersectionObserver(([e]) => setOnHero(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 1] });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    window.addEventListener('nav:toggle', onToggle);
    return () => window.removeEventListener('nav:toggle', onToggle);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e) => {
    setOpen(false);
    handleAnchor(e);
  };

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''} ${onHero && !open ? 'is-tucked' : ''}`} inert={onHero && !open ? '' : undefined}>
      <div className="nav-inner shell">
        <a href="#top" className="nav-logo" onClick={go}>
          <span aria-hidden="true">
            ZE<span className="nav-logo-tick">_</span>
          </span>
          <span className="sr-only">Zara Ejaz, back to top</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} onClick={go}>
              <span className="nav-idx">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-meta mono">
          <span className="nav-pulse" aria-hidden="true" />
          PKT {time}
        </div>

        <button
          type="button"
          className="nav-toggle mono"
          aria-expanded={open}
          aria-controls="nav-sheet"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'close' : 'menu'}
        </button>
      </div>

      <div id="nav-sheet" className="nav-sheet" hidden={!open}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} onClick={go}>
              <span className="nav-idx mono">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <p className="mono">PKT {time} — local time</p>
      </div>
    </header>
  );
}
