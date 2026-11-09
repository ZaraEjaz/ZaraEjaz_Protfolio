import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import monoFont from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?url';
import Adaptive from '../Adaptive';
import { MAX_DPR, useQuality } from '../quality';
import { pointer } from '../../lib/pointer';
import { PEACH, PLATINUM, TEAL_HI } from '../palette';

/*
 * Hero centrepiece — "The System Stack": four frosted-glass layers (Database → Backend → API → Frontend)
 * floating with gaps, joined by thin glowing lines with light packets running up and down.
 * Slow sway, tilts toward the cursor; hover (or tap) spreads the layers and speeds the packets up.
 */

const LAYERS = ['Database', 'Backend', 'API', 'Frontend']; // bottom → top
const W = 2.3; // layer width (x)
const D = 1.5; // layer depth (z)
const T = 0.1; // layer thickness
const GAP = 0.56; // resting distance between layer centres
const SPREAD = 0.86; // on hover
// connector positions on the layer plane, and which way their packets travel
const LINKS = [
  { x: -0.78, z: -0.36, up: true },
  { x: 0.72, z: 0.3, up: false },
  { x: -0.12, z: 0.46, up: true },
  { x: 0.34, z: -0.42, up: false },
];
const layerY = (i, gap) => (i - (LAYERS.length - 1) / 2) * gap;
const damp = (cur, to, rate, dt) => cur + (to - cur) * (1 - Math.exp(-rate * dt));

/**
 * Frosted glass. Real transmission can't see the page behind a transparent canvas (it would refract
 * nothing), so both levels use true transparency; full quality adds studio reflections, a stronger
 * iridescent sheen and a peach-tinted specular rim.
 */
function useGlass(rich) {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: rich ? '#9fd9d2' : '#8fd6cf',
        roughness: rich ? 0.12 : 0.22,
        metalness: 0.05,
        transparent: true,
        opacity: rich ? 0.34 : 0.3,
        depthWrite: false,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        iridescence: rich ? 0.9 : 0.5,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [180, 620],
        specularIntensity: 1,
        specularColor: new THREE.Color(rich ? PEACH : '#ffffff'),
        envMapIntensity: 1.2,
      }),
    [rich],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

const LINE = {
  teal: new THREE.LineBasicMaterial({ color: TEAL_HI, transparent: true, opacity: 0.85, toneMapped: false }),
  peach: new THREE.LineBasicMaterial({ color: PEACH, transparent: true, opacity: 0.9, toneMapped: false }),
  faint: new THREE.LineBasicMaterial({ color: TEAL_HI, transparent: true, opacity: 0.3, toneMapped: false }),
};
const GEO = {
  outline: new THREE.EdgesGeometry(new THREE.BoxGeometry(W, T, D)),
  inset: (() => {
    // a smaller rectangle traced on the top face
    const w = W / 2 - 0.16;
    const d = D / 2 - 0.16;
    const pts = [
      [-w, d],
      [w, d],
      [w, -d],
      [-w, -d],
      [-w, d],
    ].map(([x, z]) => new THREE.Vector3(x, T / 2 + 0.002, z));
    return new THREE.BufferGeometry().setFromPoints(pts);
  })(),
  link: new THREE.CylinderGeometry(0.006, 0.006, 1, 6),
  packet: new THREE.SphereGeometry(0.035, 12, 8),
};
const MAT = {
  link: new THREE.MeshBasicMaterial({ color: TEAL_HI, transparent: true, opacity: 0.45, toneMapped: false }),
  teal: new THREE.MeshBasicMaterial({ color: TEAL_HI, toneMapped: false }),
  peach: new THREE.MeshBasicMaterial({ color: PEACH, toneMapped: false }),
};

function Layer({ index, label, glass, lite }) {
  const top = index === LAYERS.length - 1;
  return (
    <group>
      <RoundedBox args={[W, T, D]} radius={0.035} smoothness={4} material={glass} renderOrder={index} />
      <lineSegments geometry={GEO.outline} material={top ? LINE.peach : LINE.teal} />
      <line geometry={GEO.inset} material={LINE.faint} />
      {/* tiny mono label on the front edge */}
      <Text
        font={monoFont}
        fontSize={lite ? 0.11 : 0.072} // phones get a larger label so it stays legible
        letterSpacing={0.12}
        color={PLATINUM}
        fillOpacity={0.78}
        anchorX="right"
        anchorY="middle"
        position={[W / 2 - 0.1, 0, D / 2 + 0.004]}
      >
        {`0${index + 1} · ${label.toUpperCase()}`}
      </Text>
    </group>
  );
}

function Stack({ reduced, lite }) {
  const quality = useQuality();
  const glass = useGlass(quality === 'high');
  const root = useRef();
  const layers = useRef([]);
  const links = useRef([]);
  const packets = useRef([]);
  const s = useRef({ gap: GAP, speed: 0.22, hover: false, pinned: false, tx: 0, ty: 0, phase: 0 });

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const st = s.current;
    const t = reduced ? 0 : clock.elapsedTime;
    const open = st.hover || st.pinned;
    st.gap = damp(st.gap, open ? SPREAD : GAP, 4, dt);
    st.speed = damp(st.speed, open ? 0.7 : 0.22, 3, dt);
    st.phase += reduced ? 0 : dt * st.speed;

    layers.current.forEach((g, i) => g && (g.position.y = layerY(i, st.gap)));
    const bottom = layerY(0, st.gap) + T / 2;
    const top = layerY(LAYERS.length - 1, st.gap) - T / 2;
    links.current.forEach((m) => {
      if (!m) return;
      m.position.y = (bottom + top) / 2;
      m.scale.y = top - bottom;
    });
    packets.current.forEach((p, k) => {
      if (!p) return;
      const link = LINKS[k % LINKS.length];
      let f = (st.phase + k * 0.37) % 1;
      if (!link.up) f = 1 - f;
      p.position.set(link.x, bottom + (top - bottom) * f, link.z);
      p.scale.setScalar(Math.max(0.0001, Math.sin(f * Math.PI)));
    });

    // slow sway + tilt toward the cursor + gentle float
    const live = !lite && !reduced && pointer.active;
    st.tx = damp(st.tx, live ? pointer.x * 0.35 : 0, 2.5, dt);
    st.ty = damp(st.ty, live ? -pointer.y * 0.18 : 0, 2.5, dt);
    root.current.rotation.set(0.32 + st.ty, -0.62 + Math.sin(t * 0.18) * 0.32 + st.tx, 0);
    root.current.position.y = Math.sin(t * 0.7) * 0.05;
  });

  const setHover = (v) => (s.current.hover = v);
  return (
    <group ref={root}>
      {LAYERS.map((label, i) => (
        <group key={label} ref={(el) => (layers.current[i] = el)} position-y={layerY(i, GAP)}>
          <Layer index={i} label={label} glass={glass} lite={lite} />
        </group>
      ))}
      {LINKS.map((l, i) => (
        <mesh key={i} ref={(el) => (links.current[i] = el)} geometry={GEO.link} material={MAT.link} position={[l.x, 0, l.z]} />
      ))}
      {[...LINKS, ...LINKS].map((l, k) => (
        <mesh key={k} ref={(el) => (packets.current[k] = el)} geometry={GEO.packet} material={k % 3 === 0 ? MAT.peach : MAT.teal} />
      ))}
      {/* invisible hit volume: hover spreads the layers; tap toggles it on touch screens */}
      <mesh
        visible={false}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={() => (s.current.pinned = !s.current.pinned)}
      >
        <boxGeometry args={[W + 0.4, SPREAD * 3 + 0.6, D + 0.4]} />
      </mesh>
    </group>
  );
}

function Studio() {
  const quality = useQuality();
  if (quality !== 'high') return null;
  // reflections for the glass: teal panels, a warm peach rim, a soft key from above (rendered once)
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" color={TEAL_HI} intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
      <Lightformer form="rect" color={PEACH} intensity={2.4} position={[4, 2, -4]} rotation-y={-Math.PI / 3} scale={[4, 3, 1]} />
      <Lightformer form="rect" color="#d1e8e2" intensity={1.2} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[6, 4, 1]} />
      <Lightformer form="ring" color={TEAL_HI} intensity={1.5} position={[2, -3, 3]} scale={2} />
    </Environment>
  );
}

export default function HeroScene({ active = true, lite = false, reduced = false, onReady }) {
  return (
    <Canvas
      dpr={lite ? 1 : [1, MAX_DPR]}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ position: [0, lite ? 2.5 : 2.9, lite ? 9.4 : 10.6], fov: 30 }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0, 0);
        requestAnimationFrame(() => onReady?.());
      }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      {/* phones also start at DPR 1 but may sharpen to MAX_DPR when they keep up: the labels need it */}
      <Adaptive max={MAX_DPR}>
        <ambientLight intensity={0.25} />
        {/* peach rim from behind, teal fill from the left */}
        <directionalLight position={[2, 3, -5]} intensity={2.2} color={PEACH} />
        <directionalLight position={[-5, 2, 3]} intensity={1.4} color={TEAL_HI} />
        <Studio />
        <Stack reduced={reduced} lite={lite} />
      </Adaptive>
    </Canvas>
  );
}
