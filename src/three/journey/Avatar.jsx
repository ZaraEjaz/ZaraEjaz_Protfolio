import { forwardRef, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Stylized low-poly "Zara": hijab, long modest dress, small backpack.
 * Cute proportions, flat-shaded. Driven by a `motion` ref: { walking, wave, pose }.
 * pose (optional): 'sit' (lowered, hands on the table) | 'point' (right arm raised forward) | 'talk' (small gestures).
 * A GLB can replace this later with the same props.
 */
const C = {
  skin: '#d6a07c',
  hijab: '#a9bf93', // soft sage
  hijabShade: '#8fa57b',
  dress: '#2c3442',
  dressTrim: '#ffcb9a',
  pack: '#1b1d22',
  shoe: '#15161a',
  eye: '#1a1410',
  blush: '#e08a7a',
};

function useMat(color, extra) {
  return useMemo(() => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75, ...extra }), [color, extra]);
}

const Avatar = forwardRef(function Avatar({ motion }, ref) {
  const skin = useMat(C.skin);
  const hijab = useMat(C.hijab);
  const hijabShade = useMat(C.hijabShade);
  const dress = useMat(C.dress);
  const trim = useMemo(() => new THREE.MeshBasicMaterial({ color: C.dressTrim, toneMapped: false }), []);
  const pack = useMat(C.pack);
  const shoe = useMat(C.shoe);
  const eye = useMat(C.eye, { roughness: 0.3 });
  const blush = useMat(C.blush);

  const body = useRef();
  const lArm = useRef();
  const rArm = useRef();
  const rFore = useRef();
  const head = useRef();
  const skirt = useRef();
  const lShoe = useRef();
  const rShoe = useRef();
  const seat = useRef();

  useFrame(({ clock }, delta) => {
    const m = motion.current;
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 10);
    const step = t * 9;
    const w = m.walking ? 1 : 0;

    const pose = m.walking ? null : m.pose;
    const seated = pose === 'sit';
    const sitY = seated ? -0.42 : 0;
    // seated: swap the floor-length dress for a lap + shins so she reads as sitting on the chair
    skirt.current.visible = !seated;
    lShoe.current.visible = !seated;
    rShoe.current.visible = !seated;
    seat.current.visible = seated;

    // bob + sway while walking, gentle breathing at rest
    body.current.position.y += ((w ? Math.abs(Math.sin(step)) * 0.05 : sitY + Math.sin(t * 1.8) * 0.008) - body.current.position.y) * k;
    body.current.rotation.z += ((w ? Math.sin(step) * 0.05 : 0) - body.current.rotation.z) * k;
    skirt.current.rotation.z = w ? Math.sin(step + 0.6) * 0.06 : 0;
    lShoe.current.position.z = w ? Math.sin(step) * 0.09 : 0;
    rShoe.current.position.z = w ? -Math.sin(step) * 0.09 : 0;

    // arms swing; right arm waves when asked
    const swing = w ? Math.sin(step) * 0.55 : 0;
    const lx = pose === 'sit' ? -0.95 : pose === 'talk' ? -0.5 + Math.sin(t * 2.3) * 0.12 : swing;
    lArm.current.rotation.x += (lx - lArm.current.rotation.x) * k;
    lArm.current.rotation.z += (0.12 - lArm.current.rotation.z) * k;
    if (pose === 'sit' || pose === 'point' || pose === 'talk') {
      const rx = pose === 'point' ? -1.45 : pose === 'sit' ? -0.95 : -0.6;
      const fz = pose === 'sit' ? Math.sin(t * 7) * 0.12 : pose === 'talk' ? Math.sin(t * 3.1) * 0.25 : 0; // writing / gesturing
      rArm.current.rotation.x += (rx - rArm.current.rotation.x) * k;
      rArm.current.rotation.z += ((pose === 'point' ? 0.15 : -0.12) - rArm.current.rotation.z) * k;
      rFore.current.rotation.z += (fz - rFore.current.rotation.z) * k;
    } else if (m.wave) {
      rArm.current.rotation.x += (0 - rArm.current.rotation.x) * k;
      rArm.current.rotation.z += (-2.6 - rArm.current.rotation.z) * k;
      rFore.current.rotation.z = -0.3 + Math.sin(t * 9) * 0.45;
    } else {
      rArm.current.rotation.x += (-swing - rArm.current.rotation.x) * k;
      rArm.current.rotation.z += (-0.12 - rArm.current.rotation.z) * k;
      rFore.current.rotation.z += (0 - rFore.current.rotation.z) * k;
    }
    // little head tilt when idle
    head.current.rotation.z = m.walking ? 0 : Math.sin(t * 0.9) * 0.06;
  });

  return (
    <group ref={ref}>
      <group ref={body} scale={1.25}>
        {/* shoes */}
        <mesh ref={lShoe} material={shoe} position={[0.1, 0.04, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.2]} />
        </mesh>
        <mesh ref={rShoe} material={shoe} position={[-0.1, 0.04, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.2]} />
        </mesh>

        {/* long dress */}
        <group ref={skirt} position-y={0.08}>
          <mesh material={dress} position-y={0.42} castShadow>
            <cylinderGeometry args={[0.2, 0.36, 0.84, 8]} />
          </mesh>
          <mesh material={trim} position-y={0.02}>
            <torusGeometry args={[0.36, 0.012, 4, 8]} />
          </mesh>
        </group>
        {/* seated legs (shown instead of the dress while sitting): lap forward, shins down to the floor */}
        <group ref={seat} visible={false}>
          <mesh material={dress} position={[0, 0.74, 0.2]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.16, 0.19, 0.5, 8]} />
          </mesh>
          <mesh material={dress} position={[0, 0.54, 0.42]} castShadow>
            <cylinderGeometry args={[0.16, 0.23, 0.4, 8]} />
          </mesh>
          <mesh material={trim} position={[0, 0.345, 0.42]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.23, 0.012, 4, 8]} />
          </mesh>
          {[0.09, -0.09].map((x) => (
            <mesh key={x} material={shoe} position={[x, 0.37, 0.6]}>
              <boxGeometry args={[0.12, 0.07, 0.14]} />
            </mesh>
          ))}
        </group>
        {/* torso */}
        <mesh material={dress} position-y={1.08} castShadow>
          <cylinderGeometry args={[0.17, 0.21, 0.36, 8]} />
        </mesh>

        {/* backpack */}
        <group position={[0, 1.02, -0.21]}>
          <mesh material={pack} castShadow>
            <boxGeometry args={[0.32, 0.36, 0.14]} />
          </mesh>
          <mesh material={trim} position={[0, 0.06, -0.072]}>
            <boxGeometry args={[0.22, 0.014, 0.01]} />
          </mesh>
          <mesh material={pack} position={[0, -0.12, -0.08]}>
            <boxGeometry args={[0.24, 0.1, 0.05]} />
          </mesh>
        </group>

        {/* arms (sleeves) with hands */}
        <group ref={lArm} position={[0.24, 1.22, 0]}>
          <mesh material={dress} position-y={-0.2}>
            <cylinderGeometry args={[0.06, 0.075, 0.4, 6]} />
          </mesh>
          <mesh material={skin} position-y={-0.43}>
            <icosahedronGeometry args={[0.055, 0]} />
          </mesh>
        </group>
        <group ref={rArm} position={[-0.24, 1.22, 0]}>
          <mesh material={dress} position-y={-0.1}>
            <cylinderGeometry args={[0.065, 0.07, 0.2, 6]} />
          </mesh>
          <group ref={rFore} position-y={-0.2}>
            <mesh material={dress} position-y={-0.1}>
              <cylinderGeometry args={[0.06, 0.075, 0.2, 6]} />
            </mesh>
            <mesh material={skin} position-y={-0.23}>
              <icosahedronGeometry args={[0.055, 0]} />
            </mesh>
          </group>
        </group>

        {/* hijab drape over shoulders */}
        <mesh material={hijab} position-y={1.31} castShadow>
          <cylinderGeometry args={[0.16, 0.3, 0.26, 8]} />
        </mesh>

        {/* head: hijab shell with the face peeking out of the front */}
        <group ref={head} position-y={1.56}>
          <mesh material={hijab} position-z={-0.03} scale={[1, 1.08, 1]} castShadow>
            <icosahedronGeometry args={[0.25, 1]} />
          </mesh>
          {/* chin wrap sits under and behind the face, so the face stays clear */}
          <mesh material={hijabShade} position={[0, -0.17, -0.02]} scale={[1.05, 0.45, 0.95]}>
            <icosahedronGeometry args={[0.22, 1]} />
          </mesh>
          {/* face: a slightly larger, rounder oval that comes forward out of the hijab */}
          <mesh material={skin} position={[0, 0.0, 0.085]} scale={[0.95, 1.05, 0.85]}>
            <icosahedronGeometry args={[0.19, 2]} />
          </mesh>
          {/* eyes with a tiny highlight */}
          {[-0.068, 0.068].map((x) => (
            <group key={`e${x}`} position={[x, 0.025, 0.238]}>
              <mesh material={eye}>
                <sphereGeometry args={[0.028, 10, 8]} />
              </mesh>
              <mesh position={[0.009, 0.01, 0.022]}>
                <sphereGeometry args={[0.008, 6, 4]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
          {[-0.115, 0.115].map((x) => (
            <mesh key={`b${x}`} material={blush} position={[x, -0.04, 0.2]} scale={[1, 0.6, 0.4]}>
              <sphereGeometry args={[0.032, 8, 6]} />
            </mesh>
          ))}
          {/* small soft smile */}
          <mesh material={blush} position={[0, -0.065, 0.24]} rotation-z={Math.PI} scale={[1, 0.8, 0.4]}>
            <torusGeometry args={[0.026, 0.006, 4, 12, Math.PI]} />
          </mesh>
        </group>
      </group>
    </group>
  );
});

export default Avatar;
