import { useMemo, useRef } from 'react';
import { Billboard, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import monoFont from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?url';
import { M } from './materials';
import { easeInOut, smooth, useChapterFrame } from './anim';
import { blueprintTexture, noteTexture, pillTexture } from './textures';
import { PLATINUM } from '../palette';

/*
 * Shared story props. Coordinates are screen-aligned (+x right, +z toward the viewer, +y up);
 * keep shapes simple and rounded, and labels few and large.
 */

export const Label = ({ children, size = 0.14, color = PLATINUM, ...p }) => (
  <Text font={monoFont} fontSize={size} color={color} anchorX="center" anchorY="middle" {...p}>
    {children}
  </Text>
);

/** Billboard plane with a texture (bubbles, cards, pills). */
export function Card({ map, w, h, ...p }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, depthWrite: false }), [map]);
  return (
    <Billboard {...p}>
      <mesh material={mat} renderOrder={10}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </Billboard>
  );
}

export function Table({ w = 1.6, d = 0.95 }) {
  return (
    <group>
      <RoundedBox args={[w, 0.07, d]} radius={0.03} position-y={0.75} material={M.wood} />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} material={M.woodDark} position={[x * (w / 2 - 0.1), 0.36, z * (d / 2 - 0.1)]}>
          <cylinderGeometry args={[0.03, 0.03, 0.72, 8]} />
        </mesh>
      ))}
    </group>
  );
}

export function Chair() {
  return (
    <group>
      <RoundedBox args={[0.5, 0.06, 0.5]} radius={0.02} position-y={0.46} material={M.chair} />
      <RoundedBox args={[0.5, 0.56, 0.06]} radius={0.02} position={[0, 0.77, -0.24]} material={M.chair} />
      <mesh material={M.woodDark} position-y={0.22}>
        <cylinderGeometry args={[0.035, 0.035, 0.44, 8]} />
      </mesh>
      <mesh material={M.woodDark} position-y={0.02}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
      </mesh>
    </group>
  );
}

export function Laptop({ screen = M.glow }) {
  return (
    <group>
      <RoundedBox args={[0.5, 0.025, 0.34]} radius={0.01} position-y={0.0125} material={M.metal} />
      <group position={[0, 0.02, -0.16]} rotation-x={-0.25}>
        <RoundedBox args={[0.5, 0.32, 0.02]} radius={0.01} position-y={0.16} material={M.metal} />
        <mesh material={screen} position={[0, 0.16, 0.012]}>
          <planeGeometry args={[0.44, 0.26]} />
        </mesh>
      </group>
    </group>
  );
}

export function Rack({ lit = 0.4 }) {
  return (
    <group>
      <RoundedBox args={[0.8, 1.55, 0.7]} radius={0.05} position-y={0.775} material={M.rack} />
      {[0.35, 0.65, 0.95, 1.25].map((y) => (
        <group key={y} position={[0, y, 0.352]}>
          <mesh material={M.rackPanel}>
            <planeGeometry args={[0.66, 0.2]} />
          </mesh>
          <mesh material={lit > 0.5 ? M.glow : M.glowDim} position={[-0.2, 0, 0.002]}>
            <planeGeometry args={[0.18, 0.035]} />
          </mesh>
          <mesh material={M.peachGlow} position={[0.24, 0, 0.002]}>
            <circleGeometry args={[0.022, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Note({ kind, ...p }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: noteTexture(kind), roughness: 0.9 }), [kind]);
  return (
    <mesh material={mat} rotation-x={-Math.PI / 2} {...p}>
      <planeGeometry args={[0.3, 0.225]} />
    </mesh>
  );
}

export function Blueprint({ children, x = 0.45 }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: blueprintTexture(), toneMapped: false }), []);
  return (
    <group position-x={x}>
      <RoundedBox args={[4.5, 0.08, 2.3]} radius={0.035} position-y={0.04} material={M.slab} />
      <mesh material={mat} position-y={0.082} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4.4, 2.2]} />
      </mesh>
      {children}
    </group>
  );
}

export function Arrow({ from, to, start, packets = false }) {
  const bar = useRef();
  const head = useRef();
  const dot = useRef();
  const len = to - from;
  useChapterFrame(({ t, out, now }) => {
    const g = easeInOut((t - start) / 0.5) * (1 - out);
    bar.current.scale.x = Math.max(0.0001, g);
    bar.current.position.x = from + (len * g) / 2;
    head.current.position.x = from + len * g;
    head.current.scale.setScalar(Math.max(0.0001, smooth(0.5, 1, g)));
    if (dot.current) {
      const f = (now * 0.7 + start) % 1;
      dot.current.position.x = from + len * f;
      dot.current.scale.setScalar(Math.max(0.0001, smooth(0, 0.6, (t - start - 1.2) / 1) * Math.sin(f * Math.PI) * (1 - out)));
    }
  });
  return (
    <group>
      <mesh ref={bar} material={M.glow}>
        <boxGeometry args={[len, 0.03, 0.03]} />
      </mesh>
      <mesh ref={head} material={M.glow} rotation-z={-Math.PI / 2}>
        <coneGeometry args={[0.055, 0.12, 12]} />
      </mesh>
      {packets && (
        <mesh ref={dot} material={M.peachGlow}>
          <sphereGeometry args={[0.05, 12, 8]} />
        </mesh>
      )}
    </group>
  );
}

/** Desk with a laptop facing whoever sits on its left (her chair goes at x ≈ -0.45). */
export function Desk() {
  return (
    <group>
      <RoundedBox args={[1.0, 0.06, 0.6]} radius={0.025} position={[0.2, 0.72, 0]} material={M.wood} />
      {[-0.2, 0.6].map((x) => (
        <mesh key={x} material={M.woodDark} position={[x, 0.35, 0]}>
          <boxGeometry args={[0.05, 0.7, 0.5]} />
        </mesh>
      ))}
      <group position={[0.3, 0.75, 0]} rotation-y={-Math.PI / 2}>
        <Laptop />
      </group>
    </group>
  );
}

/** Standing screen / window facing the viewer, with a title bar; children render on its face (z = 0.03). */
export function Panel({ w = 2, h = 1.3, children, frame = M.screenFrame, face = M.panelFace }) {
  return (
    <group>
      <RoundedBox args={[w, h, 0.05]} radius={0.05} material={frame} />
      <mesh material={face} position-z={0.027}>
        <planeGeometry args={[w - 0.1, h - 0.22]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={i === 0 ? M.peachGlow : M.glowDim} position={[-w / 2 + 0.12 + i * 0.1, h / 2 - 0.07, 0.03]}>
          <circleGeometry args={[0.028, 12]} />
        </mesh>
      ))}
      <group position-y={-0.05}>{children}</group>
    </group>
  );
}

/** Flat block on a panel face that grows in from the left at `at` seconds. */
export function Block({ x, y, w, h, at, material = M.chip }) {
  const ref = useRef();
  useChapterFrame(({ t, out }) => {
    const a = easeInOut((t - at) / 0.45) * (1 - out);
    ref.current.scale.x = Math.max(0.0001, a);
    ref.current.position.x = x - (w / 2) * (1 - a);
  });
  return (
    <mesh ref={ref} material={material} position={[x, y, 0.035]}>
      <planeGeometry args={[w, h]} />
    </mesh>
  );
}

/** Low-poly round tree. */
export function Tree({ s = 1 }) {
  return (
    <group scale={s}>
      <mesh material={M.woodDark} position-y={0.3}>
        <cylinderGeometry args={[0.06, 0.08, 0.6, 8]} />
      </mesh>
      <mesh material={M.leaf} position-y={0.85}>
        <icosahedronGeometry args={[0.38, 1]} />
      </mesh>
    </group>
  );
}

/** Database: stacked discs. */
export function Database({ discs = 3 }) {
  return (
    <group>
      {Array.from({ length: discs }, (_, i) => (
        <group key={i} position-y={0.22 + i * 0.36}>
          <mesh material={M.node}>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
          </mesh>
          <mesh material={M.glow} position-y={0.152} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.38, 0.42, 48]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Packets running along a curve (a dim line underneath, glowing dots on top). */
export function Flow({ curve, from = 0.8, count = 3, speed = 0.5, material = M.peachGlow, reverse = false, line = true }) {
  const dots = useRef([]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.016, 6, false), [curve]);
  const lineRef = useRef();
  useChapterFrame(({ t, out, now }) => {
    const draw = easeInOut((t - from + 0.4) / 0.6) * (1 - out);
    if (lineRef.current) lineRef.current.geometry.setDrawRange(0, Math.floor((draw * tube.index.count) / 6) * 6);
    dots.current.forEach((d, i) => {
      if (!d) return;
      let f = (now * speed + i / count) % 1;
      if (reverse) f = 1 - f;
      curve.getPointAt(f, d.position);
      d.scale.setScalar(Math.max(0.0001, smooth(from, from + 0.5, t) * Math.sin(f * Math.PI) * (1 - out)));
    });
  });
  return (
    <group>
      {line && <mesh ref={lineRef} geometry={tube} material={M.glowDim} />}
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => (dots.current[i] = el)} material={material}>
          <sphereGeometry args={[0.055, 12, 8]} />
        </mesh>
      ))}
    </group>
  );
}

/** Status pill (sized to its text), always facing the camera. */
export function Pill({ text, h = 0.3, ...p }) {
  const map = pillTexture(text);
  return <Card map={map} w={h * map.userData.aspect} h={h} {...p} />;
}
