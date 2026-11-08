import { useCallback, useEffect, useState } from 'react';
// Legacy styles: removed once every old section below has been redesigned.
import 'bootstrap/dist/css/bootstrap.min.css';
import Intro from './Components/Introduction/Intro';
import Skills from './Components/Skills/Skills';
import Experience from './Components/Experience/Experience';
import Projects from './Components/Projects/Projects';
import Footer from './Components/Footer/Footer';

import Loader from './ui/Loader';
import Cursor from './ui/Cursor';
import Nav from './ui/Nav';
import Hero from './sections/Hero/Hero';
import { startSmoothScroll } from './lib/scroll';
import { useReducedMotion } from './hooks/useMediaQuery';

export default function App() {
  const [booted, setBooted] = useState(false);
  const onBooted = useCallback(() => setBooted(true), []);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    return startSmoothScroll();
  }, [reduced]);

  return (
    <>
      <Loader onDone={onBooted} />
      <Cursor />
      <Nav />
      <main>
        <Hero ready={booted} />

        <div className="legacy">
          <div id="about" className="container Introduction">
            <Intro />
          </div>
          <div id="skills" className="Skills container">
            <Skills />
          </div>
          <div id="experience" className="Skills container">
            <Experience />
          </div>
          <div id="work" className="container">
            <Projects />
          </div>
        </div>
      </main>
      <div id="contact" className="legacy">
        <Footer />
      </div>
    </>
  );
}
