import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MAX_DPR, QualityContext } from './quality';

const WARMUP = 15; // first frames include shader compiles; don't judge on them
const WINDOW = 30; // frames per measurement
const UP = 1 / 45; // avg frame time to upgrade (≥ ~45 fps)
const DOWN = 1 / 30; // avg frame time to downgrade (< ~30 fps)
const MAX_FLIPS = 3; // then stay where we are

// QA override: ?quality=high pins full quality (e.g. to review the glass on a machine without a GPU)
const FORCED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('quality') === 'high';

/**
 * Progressive, adaptive quality for a canvas: starts cheap (DPR 1, 'low'), upgrades to `max` DPR and
 * 'high' once frames are consistently fast, and steps back down if they slow. Expensive extras
 * (reflections, environment maps) read useQuality(). Wrap the scene with it, or use it self-closing.
 */
export default function Adaptive({ max = MAX_DPR, children = null }) {
  const setDpr = useThree((s) => s.setDpr);
  const [quality, setQuality] = useState(FORCED ? 'high' : 'low');
  const s = useRef({ frames: 0, n: 0, sum: 0, level: FORCED ? 'high' : 'low', flips: FORCED ? MAX_FLIPS : 0 });

  useEffect(() => setDpr(FORCED ? Math.min(max, window.devicePixelRatio || 1) : 1), [setDpr, max]);

  useFrame((_, delta) => {
    const st = s.current;
    if (st.flips >= MAX_FLIPS) return;
    if (++st.frames < WARMUP || delta > 0.25) return; // warm-up, or resuming after a pause
    st.sum += delta;
    if (++st.n < WINDOW) return;
    const avg = st.sum / st.n;
    st.sum = 0;
    st.n = 0;
    if (st.level === 'low' && avg < UP) {
      st.level = 'high';
      st.flips++;
      setDpr(Math.min(max, window.devicePixelRatio || 1));
      setQuality('high');
    } else if (st.level === 'high' && avg > DOWN) {
      st.level = 'low';
      st.flips++;
      setDpr(1);
      setQuality('low');
    }
  });

  return <QualityContext.Provider value={quality}>{children}</QualityContext.Provider>;
}
