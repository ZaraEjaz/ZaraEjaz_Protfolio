import * as THREE from 'three';

/** Illustrative snippets (generic React / Frappe patterns — not tied to any project). */
export const FILES = [
  {
    name: 'App.jsx',
    code: `import { useEffect, useState } from 'react';
import { getProjects } from './api';

export default function App() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  return (
    <main className="grid">
      {projects.map((p) => (
        <Card key={p.id} {...p} />
      ))}
    </main>
  );
}`,
  },
  {
    name: 'api.py',
    code: `import frappe

@frappe.whitelist()
def get_open_orders(customer):
    """Open sales orders for a customer."""
    return frappe.get_all(
        "Sales Order",
        filters={"customer": customer, "status": "To Deliver"},
        fields=["name", "grand_total", "delivery_date"],
        order_by="delivery_date asc",
    )`,
  },
  {
    name: 'hooks.py',
    code: `app_name = "custom_app"
app_title = "Custom App"

doc_events = {
    "Sales Order": {
        "on_submit": "custom_app.events.notify_team",
    }
}

scheduler_events = {
    "daily": ["custom_app.tasks.send_reminders"],
}`,
  },
];

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'function', 'const', 'let', 'return', 'def', 'async', 'await',
  'if', 'else', 'for', 'in', 'class', 'new', 'True', 'False', 'None',
]);
// syntax colours: teal / peach / platinum family (all readable on the dark editor)
const COLORS = {
  text: '#d1e8e2',
  kw: '#3fb8b0',
  str: '#ffcb9a',
  com: '#6f8580',
  num: '#d9b08c',
  fn: '#8fd6cf',
  tag: '#ffcb9a',
  punct: '#8aa39c',
};
const TOKEN = /(\/\/.*$|#.*$|"""[^]*?(?:"""|$)|'[^'\n]*'?|"[^"\n]*"?|`[^`\n]*`?|@\w[\w.]*|<\/?[A-Za-z]\w*|\b\d+\b|\b\w+\b|\s+|.)/g;

function colorFor(tok, next) {
  if (/^(\/\/|#)/.test(tok)) return COLORS.com;
  if (/^['"`]/.test(tok)) return COLORS.str;
  if (tok[0] === '@') return COLORS.fn;
  if (/^<\/?[A-Za-z]/.test(tok)) return COLORS.tag;
  if (/^\d+$/.test(tok)) return COLORS.num;
  if (KEYWORDS.has(tok)) return COLORS.kw;
  if (/^\w+$/.test(tok) && next === '(') return COLORS.fn;
  if (/^\w+$/.test(tok)) return COLORS.text;
  return COLORS.punct;
}

const W = 1024; // layout units; the canvas is drawn at 1.5x for crisp text
const H = 600;
const RES = 1.5;
const PAD_X = 92;
const TOP = 104;
const LINE_H = 41;
const VISIBLE = Math.floor((H - TOP - 30) / LINE_H);

/** Creates the screen texture and returns a `draw(fileIndex, chars, cursorOn)` updater. */
export function createCodeScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = W * RES;
  canvas.height = H * RES;
  const g = canvas.getContext('2d');
  g.scale(RES, RES);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  function draw(fileIndex, chars, cursorOn) {
    const file = FILES[fileIndex];
    const shown = file.code.slice(0, chars);
    const lines = shown.split('\n');

    g.fillStyle = '#0f1c1c';
    g.fillRect(0, 0, W, H);

    // tab bar
    g.fillStyle = '#13211f';
    g.fillRect(0, 0, W, 56);
    g.font = '500 21px "JetBrains Mono", monospace';
    let x = 18;
    FILES.forEach((f, i) => {
      const w = g.measureText(f.name).width + 36;
      if (i === fileIndex) {
        g.fillStyle = '#0f1c1c';
        g.fillRect(x, 0, w, 56);
        const tab = g.createLinearGradient(x, 0, x + w, 0);
        tab.addColorStop(0, '#3fb8b0');
        tab.addColorStop(1, '#ffcb9a');
        g.fillStyle = tab;
        g.fillRect(x, 52, w, 4);
      }
      g.fillStyle = i === fileIndex ? '#d1e8e2' : '#6f8580';
      g.fillText(f.name, x + 18, 36);
      x += w + 4;
    });

    // scroll once the file grows past the screen
    const first = Math.max(0, lines.length - VISIBLE);
    g.font = '500 30px "JetBrains Mono", monospace';
    for (let i = first; i < lines.length; i++) {
      const y = TOP + (i - first) * LINE_H;
      g.fillStyle = '#4a5c57';
      g.textAlign = 'right';
      g.fillText(String(i + 1), PAD_X - 26, y);
      g.textAlign = 'left';
      let cx = PAD_X;
      const toks = lines[i].match(TOKEN) || [];
      toks.forEach((tok, k) => {
        g.fillStyle = colorFor(tok, toks[k + 1]);
        g.fillText(tok, cx, y);
        cx += g.measureText(tok).width;
      });
      if (i === lines.length - 1 && cursorOn) {
        g.fillStyle = '#3fb8b0';
        g.fillRect(cx + 2, y - 25, 15, 32);
      }
    }

    // status bar
    g.fillStyle = '#13211f';
    g.fillRect(0, H - 30, W, 30);
    g.fillStyle = '#ffcb9a';
    g.fillRect(0, H - 30, 6, 30);
    g.font = '500 16px "JetBrains Mono", monospace';
    g.fillStyle = '#8aa39c';
    g.fillText(`${file.name}  ·  Ln ${lines.length}, Col ${(lines[lines.length - 1] || '').length + 1}`, 18, H - 9);

    tex.needsUpdate = true;
  }

  return { tex, draw };
}
