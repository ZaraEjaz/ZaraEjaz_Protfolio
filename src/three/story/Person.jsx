import { forwardRef, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Generic low-poly person for the client and teammates (no likeness of anyone real).
 * Same proportions as her avatar. `motion` ref: { pose: 'sit' | 'stand', thumbs: 0..1, talk: bool }.
 */
const flat = (color) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.8 });

const Person = forwardRef(function Person({ motion, shirt = '#d9b08c', hair = '#2a211c', skin = '#c99472', pants = '#24302c' }, ref) {
  const M = useMemo(
    () => ({ shirt: flat(shirt), hair: flat(hair), skin: flat(skin), pants: flat(pants), shoe: flat('#15161a'), eye: flat('#1a1410') }),
    [shirt, hair, skin, pants],
  );
  const body = useRef();
  const lLeg = useRef();
  const rLeg = useRef();
  const lArm = useRef();
  const rArm = useRef();
  const rFore = useRef();
  const thumb = useRef();
  const head = useRef();

  useFrame(({ clock }, delta) => {
    const m = motion?.current ?? {};
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 9);
    const sit = m.pose === 'sit';
    const ease = (obj, key, v) => (obj[key] += (v - obj[key]) * k);

    ease(body.current.position, 'y', (sit ? -0.4 : 0) + Math.sin(t * 1.7 + 1) * 0.008);
    ease(lLeg.current.rotation, 'x', sit ? -1.45 : 0);
    ease(rLeg.current.rotation, 'x', sit ? -1.45 : 0);

    const talk = m.talk ? 1 : 0;
    const thumbs = m.thumbs ?? 0;
    ease(lArm.current.rotation, 'x', sit ? -0.9 : talk * (-0.5 + Math.sin(t * 2.6) * 0.15));
    ease(rArm.current.rotation, 'x', thumbs > 0.5 ? -1.2 : sit ? -0.9 + talk * Math.sin(t * 3.3) * 0.25 : 0);
    ease(rFore.current.rotation, 'x', thumbs > 0.5 ? -1.1 : 0);
    thumb.current.scale.setScalar(Math.max(0.001, thumbs));
    head.current.rotation.z = Math.sin(t * 0.8 + 2) * 0.05;
    head.current.rotation.x = talk * Math.sin(t * 4.2) * 0.05;
  });

  return (
    <group ref={ref}>
      <group ref={body} scale={1.25}>
        {/* legs pivot at the hip so they fold forward when seated */}
        {[
          [lLeg, 0.09],
          [rLeg, -0.09],
        ].map(([r, x]) => (
          <group key={x} ref={r} position={[x, 0.82, 0]}>
            <mesh material={M.pants} position-y={-0.38}>
              <boxGeometry args={[0.15, 0.76, 0.17]} />
            </mesh>
            <mesh material={M.shoe} position={[0, -0.78, 0.04]}>
              <boxGeometry args={[0.14, 0.08, 0.22]} />
            </mesh>
          </group>
        ))}
        {/* torso */}
        <mesh material={M.shirt} position-y={1.1} castShadow>
          <cylinderGeometry args={[0.2, 0.19, 0.6, 8]} />
        </mesh>
        <mesh material={M.shirt} position-y={1.39}>
          <cylinderGeometry args={[0.13, 0.2, 0.08, 8]} />
        </mesh>
        {/* arms */}
        <group ref={lArm} position={[0.25, 1.33, 0]}>
          <mesh material={M.shirt} position-y={-0.2}>
            <cylinderGeometry args={[0.06, 0.07, 0.4, 6]} />
          </mesh>
          <mesh material={M.skin} position-y={-0.43}>
            <icosahedronGeometry args={[0.055, 0]} />
          </mesh>
        </group>
        <group ref={rArm} position={[-0.25, 1.33, 0]}>
          <mesh material={M.shirt} position-y={-0.1}>
            <cylinderGeometry args={[0.065, 0.07, 0.2, 6]} />
          </mesh>
          <group ref={rFore} position-y={-0.2}>
            <mesh material={M.shirt} position-y={-0.1}>
              <cylinderGeometry args={[0.06, 0.065, 0.2, 6]} />
            </mesh>
            <mesh material={M.skin} position-y={-0.23}>
              <icosahedronGeometry args={[0.06, 0]} />
            </mesh>
            <mesh ref={thumb} material={M.skin} position={[0, -0.23, 0.07]} rotation-x={Math.PI / 2}>
              <capsuleGeometry args={[0.02, 0.06, 2, 6]} />
            </mesh>
          </group>
        </group>
        {/* neck + head */}
        <mesh material={M.skin} position-y={1.47}>
          <cylinderGeometry args={[0.06, 0.07, 0.1, 6]} />
        </mesh>
        <group ref={head} position-y={1.66}>
          <mesh material={M.skin} scale={[0.95, 1.05, 0.95]} castShadow>
            <icosahedronGeometry args={[0.2, 1]} />
          </mesh>
          {/* short hair cap */}
          <mesh material={M.hair} position={[0, 0.06, -0.03]} scale={[1.03, 0.85, 1.03]}>
            <sphereGeometry args={[0.205, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {[-0.065, 0.065].map((x) => (
            <mesh key={x} material={M.eye} position={[x, 0.0, 0.185]}>
              <sphereGeometry args={[0.024, 8, 6]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
});

export default Person;
