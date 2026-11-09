import { useCallback, useEffect, useState } from 'react';
import Loader from './ui/Loader';
import Cursor from './ui/Cursor';
import Nav from './ui/Nav';
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Journey from './sections/Journey';
import Projects from './sections/Projects';
import Contact from './sections/Contact';
import { startSmoothScroll } from './lib/scroll';
import { initReveals } from './lib/reveals';
import { initSpotlight } from './lib/spotlight';
import Marquee from './ui/Marquee';
import { skills } from './content';
import { useReducedMotion } from './hooks/useMediaQuery';
import './sections/sections.css';

// one marquee: every CV skill, once (Skills shows them grouped)
const MARQUEE = [...new Set(skills.flatMap((g) => g.items))];

export default function App() {
  const [booted, setBooted] = useState(false);
  const onBooted = useCallback(() => setBooted(true), []);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    return startSmoothScroll();
  }, [reduced]);

  useEffect(() => initReveals(), []);
  useEffect(() => initSpotlight(), []);

  return (
    <>
      <Loader onDone={onBooted} />
      <Cursor />
      <Nav />
      <main>
        <Hero ready={booted} />
        <Marquee items={MARQUEE} speed={70} label="Skills" />
        <About />
        <Skills />
        <Journey />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
