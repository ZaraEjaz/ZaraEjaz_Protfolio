import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { buildGraph, CAMERA_FOV, CAMERA_Z } from './graph';

const C_NODE = new THREE.Color('#5c5c66');
const C_HUB = new THREE.Color('#b4b4bc');
const C_LINE = new THREE.Color('#26262c');
const C_ACCENT = new THREE.Color('#c6ff3d');

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Graph({ graph, pointer, animate, interactive, pulseCount }) {
  const { nodes, edges, adj } = graph;
  const spin = useRef();
  const tilt = useRef();
  const dots = useRef();
  const pulses = useRef();
  const halos = useRef();
  const hubRefs = useRef([]);

  const plain = useMemo(() => nodes.map((n, i) => (n.hub ? -1 : i)).filter((i) => i >= 0), [nodes]);
  const hubs = useMemo(() => nodes.map((n, i) => (n.hub ? i : -1)).filter((i) => i >= 0), [nodes]);
  const glow = useMemo(() => new Float32Array(nodes.length), [nodes]);
  const flash = useMemo(() => new Float32Array(nodes.length), [nodes]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), v: new THREE.Vector3(), c: new THREE.Color() }), []);
  const hubBox = useMemo(() => new THREE.BoxGeometry(0.17, 0.17, 0.17), []);
  const hubEdges = useMemo(() => new THREE.EdgesGeometry(hubBox), [hubBox]);

  const lineGeo = useMemo(() => {
    const pos = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      pos.set(nodes[a].p, i * 6);
      pos.set(nodes[b].p, i * 6 + 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    return g;
  }, [nodes, edges]);

  const flow = useMemo(
    () =>
      Array.from({ length: pulseCount }, (_, i) => {
        const [from, to] = edges[(i * 7919) % edges.length];
        return { from, to, t: (i * 0.377) % 1, speed: 0.25 + ((i * 0.618) % 1) * 0.35 };
      }),
    [edges, pulseCount],
  );

  useEffect(() => () => [lineGeo, hubBox, hubEdges].forEach((g) => g.dispose()), [lineGeo, hubBox, hubEdges]);

  useLayoutEffect(() => {
    plain.forEach((n, j) => {
      tmp.o.position.fromArray(nodes[n].p);
      tmp.o.scale.setScalar(1);
      tmp.o.updateMatrix();
      dots.current.setMatrixAt(j, tmp.o.matrix);
      dots.current.setColorAt(j, C_NODE);
    });
    dots.current.instanceMatrix.needsUpdate = true;
  }, [plain, nodes, tmp]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = pointer.current;
    const live = interactive && p.active;

    if (animate) spin.current.rotation.y += dt * 0.05;
    const k = Math.min(1, dt * 2.5);
    tilt.current.rotation.x += ((live ? -p.y * 0.25 : 0) - tilt.current.rotation.x) * k;
    tilt.current.rotation.y += ((live ? p.x * 0.4 : 0) - tilt.current.rotation.y) * k;
    tilt.current.updateMatrixWorld();

    // proximity glow: project each node to screen space and compare with the pointer
    const aspect = state.size.width / state.size.height;
    const ease = Math.min(1, dt * 7);
    for (let i = 0; i < nodes.length; i++) {
      let target = 0;
      if (live) {
        tmp.v.fromArray(nodes[i].p).applyMatrix4(tilt.current.matrixWorld).project(state.camera);
        const d = Math.hypot((tmp.v.x - p.x) * aspect, tmp.v.y - p.y);
        target = 1 - smoothstep(0.06, 0.42, d);
      }
      glow[i] += (target - glow[i]) * ease;
      flash[i] = Math.max(0, flash[i] - dt * 2.2);
    }
    const lit = (i) => Math.max(glow[i], flash[i] * 0.55);

    plain.forEach((n, j) => {
      const g = lit(n);
      tmp.o.position.fromArray(nodes[n].p);
      tmp.o.scale.setScalar(1 + g * 1.3);
      tmp.o.updateMatrix();
      dots.current.setMatrixAt(j, tmp.o.matrix);
      dots.current.setColorAt(j, tmp.c.copy(C_NODE).lerp(C_ACCENT, g));
    });
    dots.current.instanceMatrix.needsUpdate = true;
    dots.current.instanceColor.needsUpdate = true;

    hubs.forEach((n, j) => {
      const h = hubRefs.current[j];
      if (!h) return;
      if (animate) {
        h.rotation.x += dt * 0.35;
        h.rotation.y += dt * 0.5;
      }
      h.children[1].material.color.copy(C_HUB).lerp(C_ACCENT, lit(n));
    });

    const col = lineGeo.attributes.color;
    edges.forEach(([a, b], i) => {
      tmp.c.copy(C_LINE).lerp(C_ACCENT, Math.max(lit(a), lit(b)) * 0.75);
      col.setXYZ(i * 2, tmp.c.r, tmp.c.g, tmp.c.b);
      col.setXYZ(i * 2 + 1, tmp.c.r, tmp.c.g, tmp.c.b);
    });
    col.needsUpdate = true;

    // data pulses travelling along edges; they hop to a neighbour on arrival
    flow.forEach((f, i) => {
      if (animate) {
        f.t += dt * f.speed;
        if (f.t >= 1) {
          flash[f.to] = 1;
          const next = adj[f.to].filter((n) => n !== f.from);
          const pool = next.length ? next : adj[f.to];
          f.from = f.to;
          f.to = pool[Math.floor(Math.random() * pool.length)];
          f.t = 0;
        }
      }
      const a = nodes[f.from].p;
      const b = nodes[f.to].p;
      tmp.o.position.set(a[0] + (b[0] - a[0]) * f.t, a[1] + (b[1] - a[1]) * f.t, a[2] + (b[2] - a[2]) * f.t);
      tmp.o.scale.setScalar(1);
      tmp.o.updateMatrix();
      pulses.current.setMatrixAt(i, tmp.o.matrix);
      halos.current.setMatrixAt(i, tmp.o.matrix);
    });
    pulses.current.instanceMatrix.needsUpdate = true;
    halos.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={spin}>
      <group ref={tilt}>
        <lineSegments geometry={lineGeo}>
          <lineBasicMaterial vertexColors toneMapped={false} />
        </lineSegments>

        <instancedMesh ref={dots} args={[undefined, undefined, plain.length]}>
          <icosahedronGeometry args={[0.034, 1]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>

        {hubs.map((n, j) => (
          <group key={n} position={nodes[n].p} ref={(el) => (hubRefs.current[j] = el)}>
            <mesh geometry={hubBox}>
              <meshBasicMaterial color="#0a0a0b" />
            </mesh>
            <lineSegments geometry={hubEdges}>
              <lineBasicMaterial color={C_HUB} toneMapped={false} />
            </lineSegments>
          </group>
        ))}

        <instancedMesh ref={pulses} args={[undefined, undefined, pulseCount]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial color={C_ACCENT} toneMapped={false} />
        </instancedMesh>
        <instancedMesh ref={halos} args={[undefined, undefined, pulseCount]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial
            color={C_ACCENT}
            transparent
            opacity={0.12}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </instancedMesh>
      </group>
    </group>
  );
}

/**
 * Interactive "living system" for the hero.
 * Pointer events are read from window so the canvas can sit behind the text (pointer-events: none).
 */
export default function NodeGraph({ lite = false, animate = true, onReady }) {
  const wrap = useRef(null);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const [inView, setInView] = useState(true);
  const [dpr, setDpr] = useState(lite ? 1.25 : 1.75);
  const graph = useMemo(() => buildGraph(lite ? 26 : 44, { scale: lite ? 0.82 : 1 }), [lite]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (lite) return;
    const move = (e) => {
      const r = wrap.current.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      pointer.current.active = e.clientY < r.bottom && e.clientY > r.top;
    };
    const leave = () => (pointer.current.active = false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [lite]);

  return (
    <div ref={wrap} className="hero-canvas">
      <Canvas
        frameloop={animate && inView ? 'always' : 'demand'}
        dpr={[1, dpr]}
        camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={() => requestAnimationFrame(() => onReady?.())}
      >
        <fog attach="fog" args={['#0a0a0b', CAMERA_Z - 2, CAMERA_Z + 3.2]} />
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Graph
          graph={graph}
          pointer={pointer}
          animate={animate}
          interactive={!lite && animate}
          pulseCount={lite ? 5 : 11}
        />
      </Canvas>
    </div>
  );
}
