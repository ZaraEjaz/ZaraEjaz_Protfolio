import * as THREE from 'three';

/**
 * World layout (units ≈ metres) and the scroll → journey mapping.
 *
 *        Quantaflix            TRPL
 *     ╭────●─────╮        ╭────●
 *  ●──╯           ╰───●───╯
 * Bahria            Abidi
 */

// Where each building stands and where its doorstep (the stop on the path) is.
export const STOPS = [
  { id: 'bahria', pos: [-10, 0, 2.5], door: [-7.6, 0, 3.2], rot: 0.35, variant: 'campus' },
  { id: 'quantaflix', pos: [-3.6, 0, -4.2], door: [-3.2, 0, -1.6], rot: 0, variant: 'studio' },
  { id: 'abidi', pos: [2.6, 0, 4.6], door: [2.4, 0, 2.0], rot: Math.PI, variant: 'agency' },
  { id: 'trpl', pos: [9.4, 0, -2.8], door: [8.2, 0, -0.4], rot: -0.3, variant: 'hq' },
];

// Path through every doorstep with gentle bends between them.
const POINTS = [
  [-7.6, 0, 3.2],
  [-6.2, 0, 1.2],
  [-4.6, 0, -0.6],
  [-3.2, 0, -1.6],
  [-1.4, 0, -1.4],
  [0.4, 0, 0.6],
  [2.4, 0, 2.0],
  [4.4, 0, 1.8],
  [6.4, 0, 0.4],
  [8.2, 0, -0.4],
].map(([x, y, z]) => new THREE.Vector3(x, y, z));

export const curve = new THREE.CatmullRomCurve3(POINTS, false, 'centripetal', 0.5);

// Arc-length position (0..1) of each stop on the curve.
export const STOP_U = STOPS.map(({ door }) => {
  const d = new THREE.Vector3(...door);
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i <= 600; i++) {
    const u = i / 600;
    const dist = curve.getPointAt(u).distanceToSquared(d);
    if (dist < bestDist) {
      bestDist = dist;
      best = u;
    }
  }
  return best;
});

/**
 * Scroll progress p (0..1) is split into: dwell at stop 0, travel, dwell at stop 1, … dwell at stop 3.
 * Dwells are where things happen (lights, tiles, card); travels are the walk.
 */
const DWELL = [0.07, 0.17, 0.17, 0.2]; // last stop lingers longer (wave + full inventory)
const TRAVEL = 1 - DWELL.reduce((a, b) => a + b, 0);
const TRAVEL_EACH = TRAVEL / (STOPS.length - 1);

const SEGMENTS = [];
{
  let at = 0;
  STOPS.forEach((_, i) => {
    SEGMENTS.push({ kind: 'dwell', stop: i, from: at, to: (at += DWELL[i]) });
    if (i < STOPS.length - 1) SEGMENTS.push({ kind: 'travel', stop: i, from: at, to: (at += TRAVEL_EACH) });
  });
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** → { u (curve position), stop (current/last stop index), dwell (0..1 or -1 while walking), walking } */
export function journeyAt(p) {
  const clamped = Math.min(1, Math.max(0, p));
  const seg = SEGMENTS.find((s) => clamped <= s.to) ?? SEGMENTS[SEGMENTS.length - 1];
  const local = (clamped - seg.from) / Math.max(1e-6, seg.to - seg.from);
  if (seg.kind === 'dwell') {
    return { u: STOP_U[seg.stop], stop: seg.stop, dwell: local, walking: false };
  }
  const t = easeInOut(local);
  return { u: STOP_U[seg.stop] + (STOP_U[seg.stop + 1] - STOP_U[seg.stop]) * t, stop: seg.stop, dwell: -1, walking: true };
}

/** Shared, mutable: written by ScrollTrigger, read every frame. */
export const journeyState = { p: 0 };
