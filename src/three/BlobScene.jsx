import { useRef } from 'react';
import { PEACH, TEAL_HI } from './palette';
import { Canvas, useFrame } from '@react-three/fiber';
import Adaptive from './Adaptive';
import { MAX_DPR } from './quality';
import { Environment, Lightformer, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { pointer } from '../lib/pointer';

const damp = (cur, to, rate, dt) => cur + (to - cur) * (1 - Math.exp(-rate * dt));

/**
 * Glossy morphing blob inside a slowly turning teal wireframe.
 *  - cursor: blob leans toward it; fast movement makes it ripple harder
 *  - scroll: sinks, shrinks and spins the wireframe as the hero scrolls away
 */
function Blob({ animate, size }) {
  const blob = useRef();
  const mat = useRef();
  const wire = useRef();
  const s = useRef({ px: 0, py: 0, energy: 0, rx: 0, ry: 0 });

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = animate ? clock.elapsedTime : 0;
    const st = s.current;

    // pointer speed → extra ripple
    const speed = Math.hypot(pointer.x - st.px, pointer.y - st.py) / Math.max(dt, 0.001);
    st.px = pointer.x;
    st.py = pointer.y;
    st.energy = damp(st.energy, Math.min(speed * 0.08, 0.35), speed > 0.01 ? 6 : 1.5, dt);

    const p = Math.min(1, window.scrollY / window.innerHeight); // hero scroll progress
    if (mat.current) mat.current.distort = 0.32 + (animate ? st.energy : 0) + p * 0.15;

    const lx = pointer.active ? -pointer.y * 0.5 : 0;
    const ly = pointer.active ? pointer.x * 0.7 : 0;
    st.rx = damp(st.rx, lx, 3, dt);
    st.ry = damp(st.ry, ly, 3, dt);
    blob.current.rotation.set(st.rx + t * 0.12, st.ry + t * 0.18, 0);
    blob.current.position.y = Math.sin(t * 0.8) * 0.06 - p * 0.5;
    blob.current.scale.setScalar(size * (1 - p * 0.22));

    wire.current.rotation.set(t * 0.08 + p * 1.2, -t * 0.12 + st.ry * 0.4, t * 0.05);
    wire.current.scale.setScalar(size * 1.38 * (1 + p * 0.1));
  });

  return (
    <group>
      <mesh ref={blob}>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          ref={mat}
          color="#192725"
          roughness={0.12}
          metalness={0.85}
          clearcoat={1}
          clearcoatRoughness={0.15}
          distort={0.32}
          speed={animate ? 1.4 : 0}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={TEAL_HI} wireframe transparent opacity={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Reflections come from procedural light strips — no HDR download. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" color="#ffffff" intensity={3} position={[0, 4, 2]} rotation-x={Math.PI / 2} scale={[8, 1.2, 1]} />
      <Lightformer form="rect" color={TEAL_HI} intensity={5} position={[-4, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.2, 6, 1]} />
      <Lightformer form="rect" color={PEACH} intensity={2.4} position={[4, -1, -1]} rotation-y={-Math.PI / 2} scale={[0.6, 5, 1]} />
      <Lightformer form="rect" color="#c9c9d6" intensity={1.4} position={[2.5, 2, 3]} scale={[2.5, 0.4, 1]} />
      <Lightformer form="rect" color="#6b6b78" intensity={1} position={[0, -4, 1]} rotation-x={-Math.PI / 2} scale={[8, 2, 1]} />
    </Environment>
  );
}

export default function BlobScene({ variant = 'hero', active = true, lite = false, reduced = false, onReady }) {
  const animate = !reduced;
  const hero = variant === 'hero';
  return (
    <Canvas
      dpr={lite ? 1 : [1, MAX_DPR]}
      frameloop={!active ? 'never' : animate ? 'always' : 'demand'}
      camera={{ position: [0, 0, hero ? 6.4 : 6.6], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
    >
      <Adaptive max={lite ? 1 : MAX_DPR} />
      <ambientLight intensity={0.2} />
      <Studio />
      <Blob animate={animate} size={hero ? 1.15 : 1} />
      {hero && !lite && <Sparkles count={36} scale={[5, 4, 2]} size={2.2} speed={animate ? 0.3 : 0} color={TEAL_HI} opacity={0.7} />}
    </Canvas>
  );
}
