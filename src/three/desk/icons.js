import * as THREE from 'three';

/** Simplified, flat tech marks drawn on canvas in the site palette (platinum marks, peach detail, teal disc). */
const INK = '#d1e8e2';
const WARM = '#ffcb9a';
const DRAW = {
  React(g, s) {
    g.strokeStyle = INK;
    g.lineWidth = s * 0.045;
    for (const a of [0, Math.PI / 3, -Math.PI / 3]) {
      g.save();
      g.translate(s / 2, s / 2);
      g.rotate(a);
      g.beginPath();
      g.ellipse(0, 0, s * 0.36, s * 0.14, 0, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }
    g.fillStyle = INK;
    g.beginPath();
    g.arc(s / 2, s / 2, s * 0.065, 0, Math.PI * 2);
    g.fill();
  },
  'Next.js'(g, s) {
    g.fillStyle = '#0e1a1a';
    g.beginPath();
    g.arc(s / 2, s / 2, s * 0.36, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.font = `700 ${s * 0.42}px "Clash Display", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('N', s / 2, s / 2 + s * 0.02);
  },
  Python(g, s) {
    const r = s * 0.06;
    const box = (x, y, c) => {
      g.fillStyle = c;
      g.beginPath();
      g.roundRect(x, y, s * 0.36, s * 0.36, r);
      g.fill();
    };
    box(s * 0.18, s * 0.18, INK);
    box(s * 0.46, s * 0.46, WARM);
    g.fillStyle = '#0e1a1a';
    g.beginPath();
    g.arc(s * 0.29, s * 0.28, s * 0.03, 0, Math.PI * 2);
    g.arc(s * 0.71, s * 0.72, s * 0.03, 0, Math.PI * 2);
    g.fill();
  },
  Frappe(g, s) {
    g.fillStyle = WARM;
    g.beginPath();
    g.roundRect(s * 0.2, s * 0.2, s * 0.6, s * 0.6, s * 0.12);
    g.fill();
    g.fillStyle = '#0e1a1a';
    g.font = `700 ${s * 0.4}px "Clash Display", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('F', s / 2, s / 2 + s * 0.02);
  },
  'Node.js'(g, s) {
    g.fillStyle = INK;
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      g[i ? 'lineTo' : 'moveTo'](s / 2 + Math.cos(a) * s * 0.36, s / 2 + Math.sin(a) * s * 0.36);
    }
    g.closePath();
    g.fill();
    g.fillStyle = '#0e1a1a';
    g.font = `700 ${s * 0.22}px "JetBrains Mono", monospace`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('JS', s / 2, s / 2 + s * 0.01);
  },
};

export const ICON_NAMES = Object.keys(DRAW);

export function iconTexture(name) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#116466';
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  g.fill();
  DRAW[name](g, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
