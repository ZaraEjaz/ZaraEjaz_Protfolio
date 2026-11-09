import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import Adaptive from '../Adaptive';
import { MAX_DPR } from '../quality';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import Avatar from './Avatar';
import World from './World';
import { curve, journeyAt, journeyState, STOPS } from './path';

const ISO = new THREE.Vector3(10, 11, 12); // camera offset → isometric-ish diorama view
// screen-right direction for this view; used to keep her right of the HTML card
const RIGHT = new THREE.Vector3().crossVectors(ISO.clone().negate(), new THREE.Vector3(0, 1, 0)).normalize();

/** Moves her along the path, faces her the right way, and drives the camera. */
function Director({ avatar, motion }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(
    () => ({ pos: new THREE.Vector3(), tan: new THREE.Vector3(), focus: new THREE.Vector3(), cam: new THREE.Vector3() }),
    [],
  );
  const s = useRef({ yaw: 0, zoom: 0, init: false });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const j = journeyAt(journeyState.p);
    curve.getPointAt(j.u, v.pos);
    curve.getTangentAt(j.u, v.tan);

    // her position + facing (walk direction; turn toward the viewer while at a stop)
    avatar.current.position.copy(v.pos);
    const walkYaw = Math.atan2(v.tan.x, v.tan.z);
    const viewYaw = Math.atan2(ISO.x, ISO.z);
    const wantYaw = j.walking ? walkYaw : viewYaw;
    let dy = wantYaw - s.current.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    s.current.yaw += dy * (1 - Math.exp(-dt * 6));
    avatar.current.rotation.y = s.current.yaw;

    motion.current.walking = j.walking;
    motion.current.wave = !j.walking && j.stop === STOPS.length - 1 && j.dwell > 0.25;

    // camera: follow her; ease in on the office during a stop
    const office = STOPS[j.stop].pos;
    const dwellIn = j.walking ? 0 : Math.sin(Math.min(1, j.dwell * 1.6) * Math.PI * 0.5);
    v.focus.copy(v.pos).lerp(new THREE.Vector3(office[0], 0.6, office[2]), dwellIn * 0.45);
    v.focus.y += 0.6;
    // wide screens: frame her right of centre (the card lives on the left)
    const wide = size.width / size.height > 1.1;
    const base0 = Math.min(size.width / 15, size.height / 9); // world→px scale (always > 0)
    if (wide) v.focus.addScaledVector(RIGHT, -(size.width / base0) * 0.14);
    v.cam.copy(v.focus).add(ISO);
    const k = s.current.init ? 1 - Math.exp(-dt * 3) : 1;
    camera.position.lerp(v.cam, k);
    camera.lookAt(v.focus);

    // zoom scales with viewport so the framing is similar on any screen
    const base = Math.min(size.width / 15, size.height / 9);
    const want = base * (1 + dwellIn * 0.22);
    s.current.zoom = s.current.init ? s.current.zoom + (want - s.current.zoom) * k : want;
    camera.zoom = s.current.zoom;
    camera.updateProjectionMatrix();
    s.current.init = true;
  });
  return null;
}

export default function JourneyScene({ active = true, lite = false, onReady }) {
  const avatar = useRef();
  const motion = useRef({ walking: false, wave: false });
  return (
    <Canvas
      shadows={!lite}
      dpr={lite ? 1 : [1, MAX_DPR]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
    >
      <Adaptive max={lite ? 1 : MAX_DPR} />
      <OrthographicCamera makeDefault near={-50} far={200} position={[ISO.x, ISO.y, ISO.z]} zoom={60} />
      {/* teal dusk: cool sky fill, low warm sun, teal back light */}
      <hemisphereLight args={['#a6e0da', '#1d4542', 1.35]} />
      <directionalLight
        position={[-9, 7, 9]}
        intensity={1.7}
        color="#ffcb9a"
        castShadow={!lite}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[10, 9, -8]} intensity={1.1} color="#3fb8b0" />
      <World lite={lite} />
      <Avatar ref={avatar} motion={motion} />
      <Director avatar={avatar} motion={motion} />
      <fog attach="fog" args={['#163735', 21, 46]} />
    </Canvas>
  );
}

