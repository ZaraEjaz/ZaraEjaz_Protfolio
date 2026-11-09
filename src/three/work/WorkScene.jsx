import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Environment, Lightformer, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { gradientMaterial, PEACH, TEAL_HI } from '../palette';
import { projects } from '../../content';
import { pointer } from '../../lib/pointer';
import { workState } from './workState';


const N = projects.length;
const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75, ...extra });
const M = {
  shell: flat('#2c3531', { metalness: 0.4, roughness: 0.45 }),
  shellDark: flat('#1d2c29', { metalness: 0.3, roughness: 0.5 }),
  key: flat('#12201e'),
  teal: new THREE.MeshBasicMaterial({ color: TEAL_HI, toneMapped: false }),
  paper: flat('#e9e6dc'),
  paperB: flat('#d8d4c6'),
  bookA: flat('#116466'),
  bookB: flat('#d9b08c'),
  bookC: flat('#3d5a3a'),
  cap: flat('#172422'),
  gold: flat('#d9b08c', { metalness: 0.6, roughness: 0.35 }),
  red: flat('#ffcb9a'),
  white: flat('#ededf0'),
  bar: flat('#3c4a45'),
  peach: new THREE.MeshBasicMaterial({ color: PEACH, toneMapped: false }),
  grad: gradientMaterial(),
  glossy: new THREE.MeshPhysicalMaterial({ color: '#16161b', metalness: 0.85, roughness: 0.12, clearcoat: 1 }),
};

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** How "present" project i is: 1 when centred on it, 0 by halfway to its neighbours. */
const presence = (i, f) => 1 - smooth(0.12, 0.48, Math.abs(f - i));

/* ------------------------------------------------------------------ laptop */

const SCREEN = { w: 2.3, h: 1.44 };

function Laptop({ textures, animate }) {
  const root = useRef();
  const lid = useRef();
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const s = useRef({ shown: -1, scroll: 0, dir: 1, hold: 0, open: 0, yaw: 0, tx: 0, ty: 0 });

  useEffect(() => () => screenMat.dispose(), [screenMat]);
  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    });
  }, [textures]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const f = workState.f;
    const st = s.current;
    const idx = Math.min(N - 1, Math.max(0, Math.round(f)));

    // swap the screen while it's turned away (halfway between projects)
    if (idx !== st.shown) {
      st.shown = idx;
      st.scroll = 0;
      st.dir = 1;
      st.hold = 1.2;
      const tex = textures[idx];
      screenMat.map = tex;
      screenMat.needsUpdate = true;
    }

    // screen shows a 16:10 window of the full page and scrolls it down and back
    const tex = textures[idx];
    const img = tex.image;
    const view = Math.min(1, (img.width / img.height) * (SCREEN.h / SCREEN.w));
    if (animate && view < 1) {
      if (st.hold > 0) st.hold -= dt;
      else {
        st.scroll += st.dir * dt * 0.045 * (1 / (1 - view + 0.2));
        if (st.scroll >= 1 || st.scroll <= 0) {
          st.scroll = Math.min(1, Math.max(0, st.scroll));
          st.dir *= -1;
          st.hold = 1.4;
        }
      }
    }
    tex.repeat.set(1, view);
    tex.offset.set(0, (1 - view) * (1 - smooth(0, 1, st.scroll)));
    // dim the screen as it turns away mid-transition
    const away = Math.abs(f - idx) * 2;
    screenMat.color.setScalar(1 - away * 0.75);

    // lid opens once; laptop swings round between projects and leans toward the cursor
    st.open += (1 - st.open) * (1 - Math.exp(-dt * 2.5));
    lid.current.rotation.x = -0.15 - (1 - st.open) * 1.42;
    const swing = Math.sin(f * Math.PI) * 0.9; // 0 at each project, max halfway
    const k = 1 - Math.exp(-dt * 4);
    st.tx += ((pointer.active ? pointer.x * 0.18 : 0) - st.tx) * k;
    st.ty += ((pointer.active ? -pointer.y * 0.1 : 0) - st.ty) * k;
    root.current.rotation.y = -0.38 + swing + st.tx;
    root.current.rotation.x = 0.08 + st.ty;
    root.current.position.y = animate ? Math.sin(clock.elapsedTime * 0.9) * 0.04 : 0;
  });

  return (
    <group ref={root} position={[0, -0.55, 0]}>
      {/* base */}
      <RoundedBox args={[2.6, 0.09, 1.75]} radius={0.04} smoothness={2} material={M.shell} position={[0, 0.045, 0]} />
      <mesh material={M.key} position={[0, 0.092, -0.12]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.2, 0.95]} />
      </mesh>
      {/* key rows */}
      {[0, 1, 2, 3].map((r) => (
        <mesh key={r} material={M.shellDark} position={[0, 0.095, -0.5 + r * 0.24]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[2.1, 0.012]} />
        </mesh>
      ))}
      <mesh material={M.shellDark} position={[0, 0.093, 0.56]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.9, 0.42]} />
      </mesh>
      <mesh material={M.teal} position={[0, 0.06, 0.876]}>
        <boxGeometry args={[0.3, 0.012, 0.004]} />
      </mesh>

      {/* lid, hinged at the back edge */}
      <group ref={lid} position={[0, 0.09, -0.86]}>
        <RoundedBox args={[2.6, 1.66, 0.06]} radius={0.04} smoothness={2} material={M.shell} position={[0, 0.83, -0.03]} />
        <mesh material={M.shellDark} position={[0, 0.83, 0.002]}>
          <planeGeometry args={[2.5, 1.58]} />
        </mesh>
        <mesh material={screenMat} position={[0, 0.84, 0.004]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        </mesh>
        <mesh material={M.teal} position={[0, 0.83, -0.062]}>
          <circleGeometry args={[0.07, 6]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------ prop scenes */

/** Wraps a project's props: scales/rotates/floats them in when that project is current. */
function PropSet({ index, children }) {
  const g = useRef();
  useFrame(({ clock }) => {
    const v = presence(index, workState.f);
    g.current.visible = v > 0.01;
    if (!g.current.visible) return;
    const e = smooth(0, 1, v);
    g.current.scale.setScalar(0.3 + 0.7 * e);
    g.current.rotation.y = (1 - e) * 1.4 * (workState.f > index ? -1 : 1) + Math.sin(clock.elapsedTime * 0.3) * 0.05;
    g.current.position.y = (1 - e) * -1.2;
  });
  return <group ref={g}>{children}</group>;
}

/** Floats a single prop on its own rhythm. */
function Float({ position, rotation = [0, 0, 0], speed = 1, amp = 0.08, spin = 0, children }) {
  const r = useRef();
  const seed = useMemo(() => position[0] * 3.1 + position[1] * 1.7, [position]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + seed;
    r.current.position.y = position[1] + Math.sin(t) * amp;
    r.current.rotation.x = rotation[0] + Math.sin(t * 0.7) * 0.12;
    r.current.rotation.y = rotation[1] + (spin ? clock.elapsedTime * spin : Math.cos(t * 0.6) * 0.15);
    r.current.rotation.z = rotation[2] + Math.cos(t * 0.8) * 0.08;
  });
  return (
    <group ref={r} position={position}>
      {children}
    </group>
  );
}

/* Talha — brand letters + design tools */
function Letter({ shape, material }) {
  // block letters from boxes
  const T = [
    [0, 0.25, 0.6, 0.14],
    [0, -0.07, 0.15, 0.5],
  ];
  const A = [
    [-0.13, 0, 0.13, 0.64, -0.36],
    [0.13, 0, 0.13, 0.64, 0.36],
    [0, -0.1, 0.26, 0.09, 0],
  ];
  const parts = shape === 'T' ? T.map(([x, y, w, h]) => [x, y, w, h, 0]) : A;
  return parts.map(([x, y, w, h, rz], i) => (
    <mesh key={i} material={material} position={[x, y, 0]} rotation-z={rz}>
      <boxGeometry args={[w, h, 0.14]} />
    </mesh>
  ));
}

function TalhaProps() {
  return (
    <>
      <Float position={[-2.3, 1.2, 0.2]} speed={0.8}>
        <Letter shape="T" material={M.white} />
      </Float>
      <Float position={[-1.6, 1.75, -0.4]} speed={0.9}>
        <Letter shape="A" material={M.red} />
      </Float>
      {/* the glassy ring from the site's hero */}
      <Float position={[2.2, 1.1, -0.2]} speed={0.6} spin={0.5}>
        <mesh material={M.glossy}>
          <torusGeometry args={[0.42, 0.12, 12, 32]} />
        </mesh>
      </Float>
      {/* pen tool */}
      <Float position={[2.35, -0.2, 0.6]} rotation={[0, 0, 0.7]} speed={1.1}>
        <mesh material={M.white} position-y={0.15}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
        </mesh>
        <mesh material={M.teal} position-y={-0.17}>
          <coneGeometry args={[0.05, 0.16, 6]} />
        </mesh>
      </Float>
      {/* ruler */}
      <Float position={[-2.2, -0.35, 0.7]} rotation={[0.3, 0, -0.4]} speed={0.9}>
        <mesh material={M.gold}>
          <boxGeometry args={[0.9, 0.12, 0.03]} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} material={M.cap} position={[-0.39 + i * 0.11, 0.035, 0.017]}>
            <planeGeometry args={[0.012, i % 2 ? 0.04 : 0.06]} />
          </mesh>
        ))}
      </Float>
      {/* colour swatches */}
      {['#ffcb9a', '#ededf0', TEAL_HI].map((c, i) => (
        <Float key={c} position={[1.4 + i * 0.32, 1.9 - i * 0.12, -0.6]} speed={1.2 + i * 0.2}>
          <mesh>
            <boxGeometry args={[0.22, 0.22, 0.04]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* The Research Professionals — books, papers, graduation cap */
function ResearchProps() {
  return (
    <>
      <Float position={[-2.3, 0.1, 0.4]} speed={0.7}>
        {[M.bookA, M.bookB, M.bookC].map((m, i) => (
          <group key={i} position={[i * 0.02, i * 0.16, 0]} rotation-y={i * 0.25}>
            <mesh material={m}>
              <boxGeometry args={[0.7, 0.14, 0.5]} />
            </mesh>
            <mesh material={M.paper} position={[0.02, 0, 0]}>
              <boxGeometry args={[0.66, 0.11, 0.46]} />
            </mesh>
          </group>
        ))}
      </Float>
      <Float position={[2.1, 1.65, -0.3]} speed={0.8} rotation={[0.25, 0, 0]}>
        {/* graduation cap */}
        <mesh material={M.cap} position-y={-0.12}>
          <cylinderGeometry args={[0.24, 0.27, 0.22, 8]} />
        </mesh>
        <mesh material={M.cap} rotation-y={Math.PI / 4}>
          <boxGeometry args={[0.75, 0.04, 0.75]} />
        </mesh>
        <mesh material={M.gold} position-y={0.03}>
          <cylinderGeometry args={[0.03, 0.03, 0.03, 6]} />
        </mesh>
        <mesh material={M.gold} position={[0.3, -0.12, 0.05]}>
          <boxGeometry args={[0.02, 0.26, 0.02]} />
        </mesh>
      </Float>
      {/* loose papers */}
      {[
        [-1.7, 1.75, -0.5, 0.4],
        [2.4, 0.3, 0.5, -0.5],
        [-2.6, 1.1, -0.2, 0.2],
      ].map(([x, y, z, r], i) => (
        <Float key={i} position={[x, y, z]} rotation={[0.2, r, r * 0.5]} speed={0.9 + i * 0.2} amp={0.12}>
          <mesh material={i % 2 ? M.paperB : M.paper}>
            <boxGeometry args={[0.45, 0.6, 0.01]} />
          </mesh>
          {[0, 1, 2, 3].map((l) => (
            <mesh key={l} material={M.bar} position={[-0.02, 0.18 - l * 0.1, 0.006]}>
              <planeGeometry args={[0.3 - (l % 2) * 0.08, 0.02]} />
            </mesh>
          ))}
        </Float>
      ))}
    </>
  );
}

/* Algorithm Visualizer — bars running a live bubble sort */
function SortBars({ animate }) {
  const n = 10;
  const bars = useRef([]);
  const mats = useMemo(() => Array.from({ length: n }, () => flat('#3c4a45')), []);
  const st = useRef({ arr: [], i: 0, j: 0, t: 0, done: 0, h: [] });

  const shuffle = () => {
    const a = Array.from({ length: n }, (_, k) => k + 1);
    for (let k = a.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [a[k], a[r]] = [a[r], a[k]];
    }
    return a;
  };
  if (!st.current.arr.length) {
    st.current.arr = shuffle();
    st.current.h = st.current.arr.slice();
  }
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);

  useFrame((_, delta) => {
    const s = st.current;
    const dt = Math.min(delta, 0.1);
    if (animate) {
      s.t += dt;
      if (s.done > 0) {
        s.done -= dt;
        if (s.done <= 0) Object.assign(s, { arr: shuffle(), i: 0, j: 0 });
      } else if (s.t > 0.16) {
        // one bubble-sort comparison per tick
        s.t = 0;
        if (s.arr[s.j] > s.arr[s.j + 1]) [s.arr[s.j], s.arr[s.j + 1]] = [s.arr[s.j + 1], s.arr[s.j]];
        s.j++;
        if (s.j >= n - 1 - s.i) {
          s.j = 0;
          s.i++;
          if (s.i >= n - 1) s.done = 1.6;
        }
      }
    }
    const k = 1 - Math.exp(-dt * 14);
    bars.current.forEach((b, idx) => {
      if (!b) return;
      s.h[idx] += (s.arr[idx] - s.h[idx]) * k;
      const h = 0.12 + s.h[idx] * 0.17;
      b.scale.y = h;
      b.position.y = h / 2;
      const comparing = s.done <= 0 && (idx === s.j || idx === s.j + 1);
      const sorted = s.done > 0 || idx >= n - s.i;
      mats[idx].color.set(comparing ? PEACH : sorted ? '#116466' : '#3c4a45');
      mats[idx].emissive.set(comparing ? '#5a3a22' : '#000000');
    });
  });

  return (
    <group position={[2.25, -0.6, -0.1]} rotation-y={0.6} scale={0.55}>
      <mesh material={M.shellDark} position-y={-0.03}>
        <boxGeometry args={[n * 0.3 + 0.3, 0.06, 0.5]} />
      </mesh>
      {mats.map((m, idx) => (
        <mesh key={idx} ref={(el) => (bars.current[idx] = el)} material={m} position={[(idx - (n - 1) / 2) * 0.3, 0, 0]}>
          <boxGeometry args={[0.2, 1, 0.2]} />
        </mesh>
      ))}
    </group>
  );
}

function AlgoProps({ animate }) {
  return (
    <>
      <SortBars animate={animate} />
      {/* a small node graph (pathfinding) */}
      <Float position={[-2.3, 1.3, 0.1]} speed={0.7}>
        {[
          [0, 0],
          [0.4, 0.3],
          [0.5, -0.25],
          [0.9, 0.05],
        ].map(([x, y], i) => (
          <mesh key={i} material={i === 3 ? M.peach : M.white} position={[x - 0.45, y, 0]}>
            <icosahedronGeometry args={[0.07, 0]} />
          </mesh>
        ))}
        {[
          [0, 0, 0.4, 0.3],
          [0, 0, 0.5, -0.25],
          [0.4, 0.3, 0.9, 0.05],
          [0.5, -0.25, 0.9, 0.05],
        ].map(([x1, y1, x2, y2], i) => (
          <mesh
            key={`l${i}`}
            material={i > 1 ? M.teal : M.bar}
            position={[(x1 + x2) / 2 - 0.45, (y1 + y2) / 2, 0]}
            rotation-z={Math.atan2(y2 - y1, x2 - x1)}
          >
            <boxGeometry args={[Math.hypot(x2 - x1, y2 - y1), 0.015, 0.015]} />
          </mesh>
        ))}
      </Float>
      {/* stack of plates (stack & queue) */}
      <Float position={[2.3, 1.2, -0.2]} speed={0.8}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={i === 3 ? M.peach : M.bar} position-y={i * 0.11}>
            <boxGeometry args={[0.5, 0.08, 0.5]} />
          </mesh>
        ))}
      </Float>
    </>
  );
}

/* My Portfolio — a mini floating version of this site's elements */
function PortfolioProps({ animate }) {
  const wire = useRef();
  useFrame(({ clock }) => {
    if (wire.current) wire.current.rotation.set(clock.elapsedTime * 0.2, clock.elapsedTime * 0.3, 0);
  });
  return (
    <>
      {/* the hero blob, in miniature */}
      <Float position={[2.2, 1.35, -0.2]} speed={0.7}>
        <mesh material={M.glossy}>
          <icosahedronGeometry args={[0.36, 3]} />
        </mesh>
        <mesh ref={wire} scale={0.5}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color={TEAL_HI} wireframe transparent opacity={0.4} toneMapped={false} />
        </mesh>
      </Float>
      {/* bento cards */}
      {[
        [-2.4, 1.5, 0.62, 0.42],
        [-1.75, 1.75, 0.38, 0.38],
        [-2.2, 0.95, 0.9, 0.36],
      ].map(([x, y, w, h], i) => (
        <Float key={i} position={[x, y, -0.3]} speed={0.8 + i * 0.15}>
          <RoundedBox args={[w, h, 0.05]} radius={0.04} smoothness={2} material={M.shellDark}>
            <Edges color={i === 1 ? PEACH : '#3c4a45'} threshold={20} />
          </RoundedBox>
          {i === 1 && (
            <mesh material={M.teal} position={[0, 0, 0.03]}>
              <boxGeometry args={[0.1, 0.16, 0.01]} />
            </mesh>
          )}
        </Float>
      ))}
      {/* the primary pill button */}
      <Float position={[2.3, 0.1, 0.6]} speed={1.1}>
        <RoundedBox args={[0.7, 0.2, 0.06]} radius={0.09} smoothness={3} material={M.grad} />
      </Float>
      {/* cursor ring */}
      <Float position={[-2.3, -0.2, 0.7]} speed={1.3} spin={animate ? 0.6 : 0}>
        <mesh material={M.peach}>
          <torusGeometry args={[0.16, 0.015, 6, 32]} />
        </mesh>
        <mesh material={M.teal}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
      </Float>
    </>
  );
}

function Props({ animate }) {
  return (
    <>
      <PropSet index={0}>
        <TalhaProps />
      </PropSet>
      <PropSet index={1}>
        <ResearchProps />
      </PropSet>
      <PropSet index={2}>
        <AlgoProps animate={animate} />
      </PropSet>
      <PropSet index={3}>
        <PortfolioProps animate={animate} />
      </PropSet>
    </>
  );
}

function Stage({ animate }) {
  const textures = useTexture(projects.map((p) => p.screenTex));
  return (
    <group position={[1.3, 0, 0]}>
      <Laptop textures={textures} animate={animate} />
      <Props animate={animate} />
    </group>
  );
}

export default function WorkScene({ active = true, reduced = false, onReady }) {
  const animate = !reduced;
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 1.7, 9.0], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.45, 0);
        requestAnimationFrame(() => onReady?.());
      }}
    >
      <hemisphereLight args={['#d1e8e2', '#0e1a1a', 0.9]} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <pointLight position={[-3, 1.5, 2]} color={TEAL_HI} intensity={6} distance={7} decay={2} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" color="#ffffff" intensity={2.5} position={[0, 4, 2]} rotation-x={Math.PI / 2} scale={[8, 1.2, 1]} />
        <Lightformer form="rect" color={TEAL_HI} intensity={4} position={[-4, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" color={PEACH} intensity={2.5} position={[4, -0.5, 1]} rotation-y={-Math.PI / 2} scale={[0.8, 5, 1]} />
      </Environment>
      <Stage animate={animate} />
    </Canvas>
  );
}
