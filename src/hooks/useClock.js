import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' });

/** Live Pakistan time (HH:MM), refreshed every 15 s. */
export function useClock() {
  const [now, setNow] = useState(() => fmt.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 15000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Opens / toggles the site menu sheet from anywhere (e.g. the hero's menu button). */
export const toggleMenu = () => window.dispatchEvent(new CustomEvent('nav:toggle'));
