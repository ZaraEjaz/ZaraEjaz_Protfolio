import { useEffect, useState } from 'react';
import { handleAnchor } from '../lib/scroll';
import './Nav.css';

const NAV_LINKS = [
  { id: 'about', label: 'about' },
  { id: 'skills', label: 'skills' },
  { id: 'experience', label: 'experience' },
  { id: 'work', label: 'work' },
  { id: 'contact', label: 'contact' },
];

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  hour: '2-digit',
  minute: '2-digit',
});

function useClock() {
  const [now, setNow] = useState(() => fmt.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 15000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Nav() {
  const time = useClock();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav-inner shell">
        <a href="#top" className="nav-logo" onClick={go} aria-label="Zara Ejaz — back to top">
          ZE<span className="nav-logo-tick">_</span>
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
