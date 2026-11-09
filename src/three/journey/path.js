import * as THREE from 'three';
import { journeyPhase, journeyState } from './timing';

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

/** Scroll timing + curve position: → { u, stop, dwell, walking } */
export function journeyAt(p) {
  const j = journeyPhase(p);
  const u = j.walking ? STOP_U[j.stop] + (STOP_U[j.stop + 1] - STOP_U[j.stop]) * j.travel : STOP_U[j.stop];
  return { ...j, u };
}

export { journeyState };
