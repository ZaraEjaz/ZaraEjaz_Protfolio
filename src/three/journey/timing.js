/**
 * Journey scroll timing, kept free of three.js so the page can use it without loading the 3D chunk.
 * Scroll progress p (0..1) is split into: dwell at stop 0, travel, dwell at stop 1, … dwell at stop 3.
 * Dwells are where things happen (lights, card); travels are the walk.
 */
export const STOP_COUNT = 4;
const DWELL = [0.07, 0.17, 0.17, 0.2]; // last stop lingers longer (wave)
const TRAVEL = 1 - DWELL.reduce((a, b) => a + b, 0);
const TRAVEL_EACH = TRAVEL / (STOP_COUNT - 1);

const SEGMENTS = [];
{
  let at = 0;
  for (let i = 0; i < STOP_COUNT; i++) {
    SEGMENTS.push({ kind: 'dwell', stop: i, from: at, to: (at += DWELL[i]) });
    if (i < STOP_COUNT - 1) SEGMENTS.push({ kind: 'travel', stop: i, from: at, to: (at += TRAVEL_EACH) });
  }
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** → { stop (current/last stop index), dwell (0..1, or -1 while walking), walking, travel (eased 0..1 of the walk) } */
export function journeyPhase(p) {
  const clamped = Math.min(1, Math.max(0, p));
  const seg = SEGMENTS.find((s) => clamped <= s.to) ?? SEGMENTS[SEGMENTS.length - 1];
  const local = (clamped - seg.from) / Math.max(1e-6, seg.to - seg.from);
  if (seg.kind === 'dwell') return { stop: seg.stop, dwell: local, walking: false, travel: 0 };
  return { stop: seg.stop, dwell: -1, walking: true, travel: easeInOut(local) };
}

/** Shared, mutable: written by ScrollTrigger, read every frame. */
export const journeyState = { p: 0 };
