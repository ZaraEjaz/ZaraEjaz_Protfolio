import { useEffect, useState } from 'react';
import { prefersReduced } from '../lib/anim';

const COMMANDS = ['npm run dev', 'bench migrate', 'bench build', 'git push'];

/** Little terminal that pops up now and then beside the hero setup. Decorative. */
export default function Terminal() {
  const [i, setI] = useState(-1);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReduced()) return;
    let n = 0;
    const timers = [];
    const show = () => {
      const cmd = COMMANDS[n % COMMANDS.length];
      n += 1;
      setI(n);
      setTyped('');
      setDone(false);
      [...cmd].forEach((_, k) => timers.push(setTimeout(() => setTyped(cmd.slice(0, k + 1)), 300 + k * 55)));
      timers.push(setTimeout(() => setDone(true), 300 + cmd.length * 55 + 450));
      timers.push(setTimeout(() => setI(-1), 300 + cmd.length * 55 + 2600));
    };
    const first = setTimeout(show, 3500);
    const loop = setInterval(show, 9000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={`term ${i > 0 ? 'is-open' : ''}`} aria-hidden="true">
      <div className="term-bar">
        <i />
        <i />
        <i />
        <span>zsh</span>
      </div>
      <p>
        <span className="term-prompt">&gt;</span> {typed}
        {!done && <span className="term-caret" />}
        {done && <span className="term-ok"> ✓</span>}
      </p>
    </div>
  );
}
