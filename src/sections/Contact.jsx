import { useState } from 'react';
import { Reveal, Scramble } from '../ui/Reveal';
import Magnetic from '../ui/Magnetic';
import Lazy3D from '../ui/Lazy3D';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Arrow } from './icons';
import { profile } from '../content';

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      const t = document.createElement('textarea');
      t.value = profile.email;
      document.body.append(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" className={`btn ${copied ? 'is-copied' : ''}`} onClick={copy}>
      {copied ? 'Copied ✓' : 'Copy email'}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email copied to clipboard' : ''}
      </span>
    </button>
  );
}

export default function Contact() {
  const wide = useMediaQuery('(min-width: 768px)');
  return (
    <section id="contact" data-section="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container contact-inner">
        {wide && <Lazy3D kind="blob" variant="mini" className="contact-3d" />}
        <p className="eyebrow mono">
          <span className="hl">05</span> — <Scramble>contact</Scramble>
        </p>
        <Reveal id="contact-title" className="h-display">
          Let&apos;s build something.
        </Reveal>
        <p className="mono contact-email" data-reveal>
          {profile.email}
        </p>
        <div className="contact-actions" data-reveal>
          <Magnetic strength={0.4}>
            <a className="btn btn--lg" data-variant="primary" href={`mailto:${profile.email}`}>
              Start a conversation <span className="btn-icon" aria-hidden="true">→</span>
            </a>
          </Magnetic>
          <CopyEmail />
        </div>
        <ul className="socials" data-reveal>
          <li>
            <a className="link mono" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <Arrow />
            </a>
          </li>
          <li>
            <a className="link mono" href={`mailto:${profile.email}`}>
              Email <Arrow />
            </a>
          </li>
        </ul>
      </div>
      <footer className="container site-foot mono">
        <span>{'// built by hand, not a template.'}</span>
        <span>© 2026 Zara Ejaz</span>
      </footer>
    </section>
  );
}
