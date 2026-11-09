import { useRef } from 'react';
import { PEACH, TEAL_HI } from './palette';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, RoundedBox } from '@react-three/drei';
import { pointer } from '../lib/pointer';


function Module({ animate }) {
  const root = useRef();
  const minis = useRef([]);
  useFrame(({ clock }, delta) => {
    const t = animate ? clock.elapsedTime : 0;
    const g = root.current;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 3);
    const tx = (pointer.active ? -pointer.y * 0.35 : 0) + 0.45;
    const ty = (pointer.active ? pointer.x * 0.5 : 0) + t * 0.25;
    g.rotation.x += (tx - g.rotation.x) * k;
    g.rotation.y += (ty - g.rotation.y) * k;
    g.position.y = Math.sin(t * 1.1) * 0.06;
    minis.current.forEach((m, i) => {
      if (!m) return;
      const a = t * (0.6 + i * 0.15) + (i * Math.PI * 2) / 3;
      m.position.set(Math.cos(a) * 1.05, Math.sin(a * 1.3) * 0.35, Math.sin(a) * 1.05);
      m.rotation.set(t + i, t * 1.2, 0);
    });
  });
  return (
    <group>
      <group ref={root}>
        <RoundedBox args={[1, 1, 1]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#192725" roughness={0.45} metalness={0.4} />
        </RoundedBox>
        <mesh scale={1.04}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial visible={false} />
          <Edges color={TEAL_HI} threshold={15} />
        </mesh>
        {/* a lit "port" on one face */}
        <mesh position={[0, 0, 0.505]}>
          <planeGeometry args={[0.42, 0.06]} />
          <meshBasicMaterial color={PEACH} toneMapped={false} />
        </mesh>
      </group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (minis.current[i] = el)}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial color="#192725" roughness={0.5} metalness={0.3} />
          <Edges color={TEAL_HI} threshold={15} />
        </mesh>
      ))}
    </group>
  );
}

/** Small floating 3D "module" used as a section accent. */
export default function ModuleAccent({ active = true, reduced = false, onReady }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ position: [0, 0, 4.2], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[3, 4, 4]} angle={0.6} penumbra={0.8} intensity={30} />
      <pointLight position={[-2, -1, 2]} color={TEAL_HI} intensity={4} distance={6} decay={2} />
      <Module animate={!reduced} />
    </Canvas>
  );
}
