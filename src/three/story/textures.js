import * as THREE from 'three';

/** Canvas textures for the process scene (cached, created on first use). */
const cache = new Map();
const once = (key, make) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};

const finish = (c) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Line icons, drawn into a 100×100 box at (x, y). */
export function drawIcon(g, kind, x, y, s = 1, color = '#ffcb9a') {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = 7;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (kind === 'problem') {
    g.beginPath();
    g.moveTo(50, 10);
    g.lineTo(92, 86);
    g.lineTo(8, 86);
    g.closePath();
    g.stroke();
    g.beginPath();
    g.moveTo(50, 38);
    g.lineTo(50, 60);
    g.stroke();
    g.beginPath();
    g.arc(50, 73, 4.5, 0, Math.PI * 2);
    g.fill();
  } else if (kind === 'process') {
    [
      [16, 30],
      [84, 30],
      [50, 78],
    ].forEach(([cx, cy]) => {
      g.beginPath();
      g.arc(cx, cy, 12, 0, Math.PI * 2);
      g.stroke();
    });
    g.beginPath();
    g.moveTo(30, 30);
    g.lineTo(70, 30);
    g.moveTo(78, 42);
    g.lineTo(60, 68);
    g.moveTo(40, 68);
    g.lineTo(22, 42);
    g.stroke();
  } else if (kind === 'goals') {
    [40, 26, 12].forEach((r) => {
      g.beginPath();
      g.arc(50, 52, r, 0, Math.PI * 2);
      g.stroke();
    });
    g.beginPath();
    g.arc(50, 52, 4, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

/** Speech bubble: dark glass card, teal rim, peach icon + label, tail at the bottom. */
export const bubbleTexture = (kind, label) =>
  once(`bubble:${kind}`, () => {
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 300;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(23, 36, 35, 0.94)';
    g.strokeStyle = '#3fb8b0';
    g.lineWidth = 6;
    roundRect(g, 10, 10, 300, 230, 46);
    g.fill();
    g.stroke();
    // tail
    g.beginPath();
    g.moveTo(130, 236);
    g.lineTo(150, 288);
    g.lineTo(182, 236);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(130, 239);
    g.lineTo(150, 288);
    g.lineTo(182, 239);
    g.stroke();
    drawIcon(g, kind, 115, 36, 0.9);
    g.fillStyle = '#d1e8e2';
    g.font = '600 38px "JetBrains Mono", ui-monospace, monospace';
    g.textAlign = 'center';
    g.fillText(label, 160, 200);
    return finish(c);
  });

/** A handwritten-looking note card with the matching icon. */
export const noteTexture = (kind) =>
  once(`note:${kind}`, () => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 192;
    const g = c.getContext('2d');
    g.fillStyle = '#ece6d6';
    g.fillRect(0, 0, 256, 192);
    g.fillStyle = '#ffcb9a';
    g.fillRect(0, 0, 256, 18);
    drawIcon(g, kind, 18, 40, 0.5, '#116466');
    g.strokeStyle = '#7b8a86';
    g.lineWidth = 6;
    g.lineCap = 'round';
    [44, 72, 100, 128, 156].forEach((y, i) => {
      g.beginPath();
      g.moveTo(i < 2 ? 84 : 20, y);
      g.lineTo(i % 2 ? 196 : 232, y);
      g.stroke();
    });
    return finish(c);
  });

/** Blueprint mat: deep teal with a fine grid and a bright border. */
export const blueprintTexture = () =>
  once('blueprint', () => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 640;
    const g = c.getContext('2d');
    const bg = g.createRadialGradient(512, 320, 40, 512, 320, 620);
    bg.addColorStop(0, '#14504f');
    bg.addColorStop(1, '#0c2c2c');
    g.fillStyle = bg;
    g.fillRect(0, 0, 1024, 640);
    g.strokeStyle = 'rgba(143, 214, 207, 0.12)';
    g.lineWidth = 2;
    for (let x = 0; x <= 1024; x += 32) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 640);
      g.stroke();
    }
    for (let y = 0; y <= 640; y += 32) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(1024, y);
      g.stroke();
    }
    g.strokeStyle = 'rgba(143, 214, 207, 0.28)';
    for (let x = 0; x <= 1024; x += 128) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 640);
      g.stroke();
    }
    g.strokeStyle = 'rgba(63, 184, 176, 0.9)';
    g.lineWidth = 6;
    g.strokeRect(14, 14, 996, 612);
    return finish(c);
  });

const MONO = '"JetBrains Mono", ui-monospace, monospace';

/** Server spec card: CPU / RAM / cost as dot meters (relative, no invented numbers). */
export const specTexture = (level, picked = false) =>
  once(`spec:${level}:${picked}`, () => {
    const c = document.createElement('canvas');
    c.width = 360;
    c.height = 250;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(23, 36, 35, 0.95)';
    g.strokeStyle = picked ? '#ffcb9a' : 'rgba(143, 214, 207, 0.55)';
    g.lineWidth = picked ? 7 : 4;
    roundRect(g, 8, 8, 344, 234, 30);
    g.fill();
    g.stroke();
    const rows = [
      ['CPU', level],
      ['RAM', level],
      ['cost', level],
    ];
    g.font = `500 34px ${MONO}`;
    rows.forEach(([k, n], i) => {
      const y = 70 + i * 62;
      g.fillStyle = '#b3cbc4';
      g.textAlign = 'left';
      g.fillText(k, 36, y + 12);
      for (let d = 0; d < 3; d++) {
        g.beginPath();
        g.arc(212 + d * 42, y, 13, 0, Math.PI * 2);
        if (d < n) {
          g.fillStyle = k === 'cost' ? '#ffcb9a' : '#3fb8b0';
          g.fill();
        } else {
          g.strokeStyle = 'rgba(143, 214, 207, 0.35)';
          g.lineWidth = 3;
          g.stroke();
        }
      }
    });
    return finish(c);
  });

/** "purchased ✓" stamp. */
export const stampTexture = () =>
  once('stamp', () => {
    const c = document.createElement('canvas');
    c.width = 420;
    c.height = 140;
    const g = c.getContext('2d');
    g.strokeStyle = '#ffcb9a';
    g.lineWidth = 9;
    roundRect(g, 10, 10, 400, 120, 26);
    g.stroke();
    g.fillStyle = '#ffcb9a';
    g.font = `700 52px ${MONO}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('purchased ✓', 210, 72);
    return finish(c);
  });

/** Rounded pill with a status dot, sized to its text; aspect (w / h) is on texture.userData.aspect. */
export const pillTexture = (text) =>
  once(`pill:${text}`, () => {
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    const font = `600 40px ${MONO}`;
    g.font = font;
    const w = Math.ceil(g.measureText(text).width) + 150;
    c.width = w;
    c.height = 110;
    g.font = font;
    g.fillStyle = 'rgba(23, 36, 35, 0.95)';
    g.strokeStyle = '#3fb8b0';
    g.lineWidth = 5;
    roundRect(g, 6, 6, w - 12, 98, 49);
    g.fill();
    g.stroke();
    g.fillStyle = '#3fb8b0';
    g.beginPath();
    g.arc(62, 55, 15, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#d1e8e2';
    g.textBaseline = 'middle';
    g.fillText(text, 100, 57);
    const t = finish(c);
    t.userData.aspect = w / 110;
    return t;
  });

/** Terminal window whose lines can be revealed one by one: draw(n) shows the first n lines. */
export function terminalTexture(lines) {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 300;
  const g = c.getContext('2d');
  const tex = finish(c);
  let shown = -1;
  const draw = (n) => {
    if (n === shown) return;
    shown = n;
    g.clearRect(0, 0, 640, 300);
    g.fillStyle = 'rgba(14, 26, 26, 0.96)';
    g.strokeStyle = 'rgba(143, 214, 207, 0.4)';
    g.lineWidth = 4;
    roundRect(g, 6, 6, 628, 288, 26);
    g.fill();
    g.stroke();
    ['#e08a7a', '#ffcb9a', '#3fb8b0'].forEach((col, i) => {
      g.fillStyle = col;
      g.beginPath();
      g.arc(40 + i * 30, 38, 9, 0, Math.PI * 2);
      g.fill();
    });
    g.font = `500 34px ${MONO}`;
    lines.slice(0, n).forEach((l, i) => {
      const y = 108 + i * 62;
      g.fillStyle = '#8aa39c';
      g.fillText('$', 34, y);
      g.fillStyle = '#d1e8e2';
      g.fillText(l, 70, y);
      g.fillStyle = '#3fb8b0';
      g.textAlign = 'right';
      g.fillText('✓', 604, y);
      g.textAlign = 'left';
    });
    tex.needsUpdate = true;
  };
  draw(0);
  return { texture: tex, draw };
}
