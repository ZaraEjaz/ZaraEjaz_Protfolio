// Deterministic "system graph": nodes on a squashed sphere, linked to nearest neighbours.
// Shared by the WebGL scene and the SVG poster so both draw the same picture.

export const CAMERA_Z = 7.2;
export const CAMERA_FOV = 38;

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildGraph(count, { scale = 1, seed = 11 } = {}) {
  const rand = mulberry32(seed);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes = [];

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const radius = (1.45 + rand() * 0.75) * scale;
    nodes.push({
      p: [Math.cos(theta) * r * radius * 1.2, y * radius * 0.92, Math.sin(theta) * r * radius],
      hub: i % 7 === 3, // every 7th node is a "module"
    });
  }

  const key = new Set();
  const edges = [];
  const dist2 = (a, b) =>
    (a.p[0] - b.p[0]) ** 2 + (a.p[1] - b.p[1]) ** 2 + (a.p[2] - b.p[2]) ** 2;

  nodes.forEach((n, i) => {
    const k = n.hub ? 4 : 2;
    nodes
      .map((m, j) => [j, dist2(n, m)])
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, k)
      .forEach(([j]) => {
        const id = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!key.has(id)) {
          key.add(id);
          edges.push(i < j ? [i, j] : [j, i]);
        }
      });
  });

  const adj = nodes.map(() => []);
  edges.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });

  return { nodes, edges, adj };
}
