import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ChapterClock, EXIT, easeInOut } from './anim';
import { M } from './materials';
import { STORIES } from './stories';

const ISO = new THREE.Vector3(10, 8.5, 12); // a touch lower than the journey: closer, more cinematic
const VIEW_YAW = Math.atan2(ISO.x, ISO.z);
const INTRO = 1.8; // seconds for the opening camera move
const Y = new THREE.Vector3(0, 1, 0);

/** Camera: opening orbit + zoom-in, then eases between chapter framings. Leaves room for the caption. */
function Rig({ framing, chapter }) {
  const s = useRef({ y: framing[chapter].y, zoom: framing[chapter].zoom, elev: framing[chapter].elev ?? 1 });
  const v = useMemo(() => ({ focus: new THREE.Vector3(), off: new THREE.Vector3() }), []);
  useFrame(({ camera, size, clock }, delta) => {
    const f = framing[chapter];
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 3);
    s.current.y += (f.y - s.current.y) * k;
    s.current.zoom += (f.zoom - s.current.zoom) * k;
    s.current.elev += ((f.elev ?? 1) - s.current.elev) * k;

    const intro = easeInOut(clock.elapsedTime / INTRO);
    v.off.copy(ISO).applyAxisAngle(Y, (1 - intro) * 0.6);
    v.off.y = ISO.y * s.current.elev + (1 - intro) * 3;
    v.focus.set(0, s.current.y, 0);
    camera.position.copy(v.focus).add(v.off);
    camera.lookAt(v.focus);

    // fit ~7.4 × 4.5 world units into the area above the caption
    const base = Math.min(size.width / 7.4, (size.height * 0.64) / 4.5);
    camera.zoom = base * s.current.zoom * (0.7 + 0.3 * intro);
    camera.setViewOffset(size.width, size.height, 0, size.height * 0.16, size.width, size.height);
    camera.updateProjectionMatrix();
  });
  return null;
}

/** Plays the target chapter; on change, lets the current one ease out first. */
function Chapters({ chapters, target }) {
  const clock = useMemo(() => ({ start: 0.5, exitAt: null }), []);
  const [shown, setShown] = useState(target);
  useFrame(({ clock: c }) => {
    const now = c.elapsedTime;
    if (target === shown) {
      clock.exitAt = null;
      return;
    }
    if (clock.exitAt == null) clock.exitAt = now;
    else if (now - clock.exitAt > EXIT) {
      clock.exitAt = null;
      clock.start = now;
      setShown(target);
    }
  });
  const Chapter = chapters[shown];
  return (
    <ChapterClock.Provider value={clock}>
      <group rotation-y={VIEW_YAW}>
        <Chapter key={shown} />
      </group>
    </ChapterClock.Provider>
  );
}

function Ground() {
  return (
    <group>
      <mesh material={M.ground} position-y={-0.12}>
        <cylinderGeometry args={[3.35, 3.35, 0.24, 96]} />
      </mesh>
      <mesh material={M.groundSide} position-y={-0.55}>
        <cylinderGeometry args={[3.28, 2.7, 0.6, 96]} />
      </mesh>
      <mesh material={M.glowDim} rotation-x={-Math.PI / 2} position-y={0.004}>
        <ringGeometry args={[3.18, 3.24, 128]} />
      </mesh>
    </group>
  );
}

export default function StoryScene({ storyId, chapter, lite = false, onReady }) {
  const story = STORIES[storyId];
  return (
    <Canvas
      dpr={lite ? 1 : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
    >
      <OrthographicCamera makeDefault near={-50} far={200} zoom={60} />
      <hemisphereLight args={['#bfe8e2', '#1d4542', 1.5]} />
      <directionalLight position={[-6, 9, 8]} intensity={1.5} color="#ffd9b5" />
      <directionalLight position={[8, 6, -8]} intensity={0.9} color="#3fb8b0" />
      <Ground />
      <ContactShadows position={[0, 0.006, 0]} scale={8} resolution={lite ? 256 : 512} blur={2.6} far={3.5} opacity={0.55} color="#061412" frames={Infinity} />
      <Chapters chapters={story.chapters} target={chapter} />
      <Rig framing={story.framing} chapter={chapter} />
    </Canvas>
  );
}
