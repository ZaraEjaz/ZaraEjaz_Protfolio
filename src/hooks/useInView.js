import { useEffect, useRef, useState } from 'react';

/**
 * seen:    became visible (or near-visible) at least once → mount heavy stuff
 * visible: currently on screen → run the render loop
 */
export function useInView({ rootMargin = '300px 0px' } = {}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, seen, visible];
}
