import { useMemo } from 'react';
import { buildGraph, CAMERA_FOV, CAMERA_Z } from './graph';

const NEAR = CAMERA_Z - 2;
const FAR = CAMERA_Z + 3.2;
const H = 2 * CAMERA_Z * Math.tan((CAMERA_FOV * Math.PI) / 360);

/**
 * Static SVG render of frame 0 of the WebGL graph (same camera, same fog).
 * Shown instantly, crossfades to the canvas, and is the full fallback for no-WebGL / Save-Data.
 * The tiny-width viewBox + "meet" + overflow:visible makes it scale by height, like a vertical FOV.
 */
export default function HeroPoster({ lite, hidden }) {
  const { dots, hubs, lines } = useMemo(() => {
    const g = buildGraph(lite ? 26 : 44, { scale: lite ? 0.82 : 1 });
    const proj = ([x, y, z]) => {
      const s = CAMERA_Z / (CAMERA_Z - z);
      const fog = Math.min(1, Math.max(0, (CAMERA_Z - z - NEAR) / (FAR - NEAR)));
      return { x: x * s, y: -y * s, s, a: 1 - fog };
    };
    const pts = g.nodes.map((n) => proj(n.p));
    return {
      dots: g.nodes.map((n, i) => ({ ...pts[i], hub: n.hub, i })).filter((d) => !d.hub),
      hubs: g.nodes.map((n, i) => ({ ...pts[i], hub: n.hub, i })).filter((d) => d.hub),
      lines: g.edges.map(([a, b]) => ({ a: pts[a], b: pts[b], o: Math.min(pts[a].a, pts[b].a) })),
    };
  }, [lite]);

  return (
    <svg
      className={`hero-poster ${hidden ? 'is-hidden' : ''}`}
      viewBox={`-0.001 ${-H / 2} 0.002 ${H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#26262c" vectorEffect="non-scaling-stroke">
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.a.x}
            y1={l.a.y}
            x2={l.b.x}
            y2={l.b.y}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity={l.o}
          />
        ))}
      </g>
      {dots.map((d) => (
        <circle key={d.i} cx={d.x} cy={d.y} r={0.034 * d.s} fill="#5c5c66" opacity={d.a} />
      ))}
      {hubs.map((d) => {
        const h = 0.085 * d.s;
        return (
          <rect
            key={d.i}
            x={d.x - h}
            y={d.y - h}
            width={h * 2}
            height={h * 2}
            fill="#0a0a0b"
            stroke="#b4b4bc"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity={d.a}
          />
        );
      })}
    </svg>
  );
}
