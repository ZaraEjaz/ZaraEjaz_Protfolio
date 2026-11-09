import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import Adaptive from '../Adaptive';
import { MAX_DPR, useQuality } from '../quality';
import { Billboard, Environment, Lightformer, MeshReflectorMaterial, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { BASE, gradientMaterial, PEACH, TEAL, TEAL_HI } from '../palette';
import monoFont from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?url';
import { createCodeScreen, FILES } from './codeScreen';
import { iconTexture, ICON_NAMES } from './icons';
import { pointer } from '../../lib/pointer';

const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.7, ...extra });
const smooth = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.4, ...extra });
const M = {
  desk: smooth('#1a2826', { roughness: 0.32, metalness: 0.25 }),
  deskEdge: smooth('#101b1a', { roughness: 0.5 }),
  metal: smooth('#4a5a55', { metalness: 0.85, roughness: 0.28 }),
  dark: smooth('#0b1313', { metalness: 0.6, roughness: 0.32 }),
  key: smooth('#24322f', { roughness: 0.45, metalness: 0.2 }),
  mug: smooth('#e9e2d6', { roughness: 0.3 }),
  coffee: flat('#2a1a10'),
  pot: smooth(TEAL, { roughness: 0.45 }),
  leaf: flat('#5d8a3c'),
  leafB: flat('#47702c'),
  soil: flat('#21180f'),
  teal: new THREE.MeshBasicMaterial({ color: TEAL_HI, toneMapped: false }),
  peach: new THREE.MeshBasicMaterial({ color: PEACH, toneMapped: false }),
  grad: gradientMaterial(),
};
const damp = (cur, to, rate, dt) => cur + (to - cur) * (1 - Math.exp(-rate * dt));
const label = (text) => window.dispatchEvent(new CustomEvent('cursor:label', { detail: text }));

/* ------------------------------------------------------------------ keyboard */

const ROWS = ['`1234567890-=', 'qwertyuiop[]', "asdfghjkl;'", 'zxcvbnm,./'];
const KEY = 0.088;
const GAP = 0.016;

function useKeyLayout() {
  return useMemo(() => {
    const keys = [];
    const map = {};
    ROWS.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        map[ch] = keys.length;
        keys.push({ x: -0.62 + r * 0.04 + c * (KEY + GAP), z: -0.16 + r * (KEY + GAP), w: KEY });
      });
    });
    map[' '] = keys.length;
    keys.push({ x: -0.07, z: -0.16 + 4 * (KEY + GAP), w: KEY * 5.6 }); // space
    map['\n'] = keys.length;
    keys.push({ x: 0.62, z: -0.16 + 2 * (KEY + GAP), w: KEY * 1.8 }); // enter
    return { keys, map };
  }, []);
}

function Keyboard({ pressRef }) {
  const { keys, map } = useKeyLayout();
  const inst = useRef();
  const depress = useMemo(() => new Float32Array(keys.length), [keys]);
  const o = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    // the typing loop calls this for each character
    pressRef.current = (ch) => {
      const lower = ch.toLowerCase();
      const i = map[lower] ?? map[ch] ?? Math.floor(Math.random() * (keys.length - 2));
      depress[i] = 1;
    };
  }, [pressRef, map, keys, depress]);

  useFrame((_, delta) => {
    keys.forEach((k, i) => {
      depress[i] = Math.max(0, depress[i] - delta * 9);
      o.position.set(k.x + k.w / 2, 0.035 - depress[i] * 0.022, k.z);
      o.scale.set(k.w / KEY, 1, 1);
      o.updateMatrix();
      inst.current.setMatrixAt(i, o.matrix);
    });
    inst.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[0, 0, 0.42]}>
      <RoundedBox args={[1.5, 0.04, 0.56]} radius={0.02} smoothness={2} material={M.metal} position-y={0.02} />
      <instancedMesh ref={inst} args={[undefined, M.key, keys.length]}>
        <boxGeometry args={[KEY, 0.03, KEY]} />
      </instancedMesh>
      <mesh material={M.grad} position={[0, 0.042, 0.27]}>
        <boxGeometry args={[1.4, 0.004, 0.006]} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------------------- monitor */

function Monitor({ screenTex, onHover, onClick, glowRef }) {
  return (
    <group position={[0, 0, -0.45]}>
      <mesh material={M.metal} position-y={0.015}>
        <cylinderGeometry args={[0.32, 0.36, 0.03, 8]} />
      </mesh>
      <mesh material={M.metal} position={[0, 0.32, -0.04]}>
        <boxGeometry args={[0.1, 0.62, 0.05]} />
      </mesh>
      <group position-y={1.02}>
        <RoundedBox args={[2.14, 1.28, 0.08]} radius={0.035} smoothness={2} material={M.dark} />
        <mesh
          position-z={0.042}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(true);
            label('switch');
          }}
          onPointerOut={() => {
            onHover(false);
            label('');
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <planeGeometry args={[2.04, 1.195]} />
          <meshBasicMaterial map={screenTex} toneMapped={false} />
        </mesh>
        <mesh material={M.teal} position={[0, -0.62, 0.042]}>
          <boxGeometry args={[0.16, 0.008, 0.004]} />
        </mesh>
        <pointLight ref={glowRef} position={[0, 0, 0.7]} color={TEAL_HI} distance={3} decay={2} />
      </group>
    </group>
  );
}

/* --------------------------------------------------------------- props */

function Mouse() {
  return (
    <group position={[1.08, 0, 0.48]}>
      <mesh material={M.dark} position-y={0.004} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.5, 0.42]} />
      </mesh>
      <mesh material={M.metal} position-y={0.04} scale={[0.75, 0.45, 1]}>
        <sphereGeometry args={[0.09, 10, 8]} />
      </mesh>
      <mesh material={M.peach} position={[0, 0.075, -0.035]}>
        <boxGeometry args={[0.006, 0.006, 0.05]} />
      </mesh>
    </group>
  );
}

function Mug({ animate }) {
  const steam = useRef([]);
  useFrame(({ clock }) => {
    steam.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.35 + i / 3) % 1;
      m.position.set(Math.sin(t * 6 + i) * 0.03, 0.3 + t * 0.4, 0);
      m.scale.setScalar(0.4 + t * 0.9);
      m.material.opacity = animate ? (1 - t) * 0.25 : 0;
    });
  });
  return (
    <group position={[-1.18, 0, 0.55]}>
      <mesh material={M.mug} position-y={0.12}>
        <cylinderGeometry args={[0.1, 0.09, 0.24, 10]} />
      </mesh>
      <mesh material={M.coffee} position-y={0.235} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.088, 10]} />
      </mesh>
      <mesh material={M.mug} position={[0.12, 0.13, 0]} rotation-z={Math.PI / 2}>
        <torusGeometry args={[0.05, 0.016, 6, 10, Math.PI]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (steam.current[i] = el)}>
          <sphereGeometry args={[0.04, 6, 5]} />
          <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Plant() {
  const leaves = [
    [0, 0.42, 0, 0, 0.85],
    [0.09, 0.36, 0.03, -0.5, 0.7],
    [-0.09, 0.37, -0.02, 0.55, 0.72],
    [0.03, 0.34, 0.09, 0.2, 0.6],
    [-0.04, 0.33, -0.09, -0.3, 0.62],
  ];
  return (
    <group position={[1.72, 0, -0.62]}>
      <mesh material={M.pot} position-y={0.13}>
        <cylinderGeometry args={[0.15, 0.11, 0.26, 7]} />
      </mesh>
      <mesh material={M.soil} position-y={0.255} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.135, 7]} />
      </mesh>
      {leaves.map(([x, y, z, rz, s], i) => (
        <mesh key={i} material={i % 2 ? M.leafB : M.leaf} position={[x, y, z]} rotation={[rz * 0.4, i, rz]} scale={[0.6 * s, s, 0.25 * s]}>
          <coneGeometry args={[0.12, 0.42, 4]} />
        </mesh>
      ))}
    </group>
  );
}

/** Desk lamp — click to toggle. Drives a spotlight on the desk. */
function Lamp({ on, onToggle }) {
  const spot = useRef();
  const bulb = useRef();
  const halo = useRef();
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-0.6, 0, 0.3);
    return o;
  }, []);
  const level = useRef(on ? 1 : 0);

  useFrame((_, delta) => {
    level.current = damp(level.current, on ? 1 : 0, 8, Math.min(delta, 0.1));
    spot.current.intensity = level.current * 34;
    halo.current.intensity = level.current * 2.6;
    bulb.current.color.setRGB(0.22 + level.current * 0.78, 0.2 + level.current * 0.6, 0.18 + level.current * 0.42);
  });

  const handlers = {
    onPointerOver: (e) => {
      e.stopPropagation();
      label(on ? 'off' : 'on');
    },
    onPointerOut: () => label(''),
    onClick: (e) => {
      e.stopPropagation();
      onToggle();
    },
  };

  return (
    <group position={[-1.72, 0, -0.55]} {...handlers}>
      <primitive object={target} />
      <mesh material={M.metal} position-y={0.02}>
        <cylinderGeometry args={[0.2, 0.22, 0.04, 8]} />
      </mesh>
      {/* lower arm */}
      <mesh material={M.metal} position={[0.05, 0.38, 0]} rotation-z={-0.18}>
        <cylinderGeometry args={[0.022, 0.022, 0.74, 6]} />
      </mesh>
      <mesh material={M.peach} position={[0.12, 0.74, 0]}>
        <sphereGeometry args={[0.035, 8, 6]} />
      </mesh>
      {/* upper arm, reaching over the desk */}
      <mesh material={M.metal} position={[0.37, 0.88, 0.04]} rotation-z={-1.05}>
        <cylinderGeometry args={[0.02, 0.02, 0.58, 6]} />
      </mesh>
      {/* head */}
      <group position={[0.64, 0.94, 0.08]} rotation-z={-2.3}>
        <mesh material={M.metal}>
          <coneGeometry args={[0.15, 0.24, 8, 1, true]} />
        </mesh>
        <mesh position-y={-0.06}>
          <sphereGeometry args={[0.055, 8, 6]} />
          <meshBasicMaterial ref={bulb} toneMapped={false} />
        </mesh>
      </group>
      <spotLight ref={spot} position={[0.66, 0.88, 0.1]} target={target} angle={0.78} penumbra={0.85} distance={4.5} color="#ffd2a6" />
      {/* warm halo around the shade — reads as the lamp's glow on nearby surfaces */}
      <pointLight ref={halo} position={[0.6, 0.78, 0.12]} color={PEACH} distance={1.6} decay={2} />
    </group>
  );
}

/* ---------------------------------------------------------- orbit icons */

function OrbitIcons({ animate }) {
  const textures = useMemo(() => ICON_NAMES.map(iconTexture), []);
  const refs = useRef([]);
  const [hover, setHover] = useState(-1);
  const scale = useRef(ICON_NAMES.map(() => 1));
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame(({ clock }, delta) => {
    const t = animate ? clock.elapsedTime * 0.22 : 0;
    ICON_NAMES.forEach((_, i) => {
      const g = refs.current[i];
      if (!g) return;
      const a = t + (i / ICON_NAMES.length) * Math.PI * 2;
      // tilted orbit: front pass rides above the monitor, back pass dips behind it — never over the code
      const front = Math.sin(a);
      g.position.set(Math.cos(a) * 1.95, 1.2 + front * 0.78, front * 1.15 - 0.35);
      scale.current[i] = damp(scale.current[i], hover === i ? 1.35 : 1, 10, Math.min(delta, 0.1));
      g.scale.setScalar(scale.current[i]);
    });
  });

  return ICON_NAMES.map((name, i) => (
    <Billboard key={name} ref={(el) => (refs.current[i] = el)}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(i);
          label(name);
        }}
        onPointerOut={() => {
          setHover((h) => (h === i ? -1 : h));
          label('');
        }}
      >
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial map={textures[i]} toneMapped={false} />
      </mesh>
      {/* glow ring */}
      <mesh position-z={-0.005}>
        <ringGeometry args={[0.2, hover === i ? 0.245 : 0.215, 40]} />
        <meshBasicMaterial color={hover === i ? PEACH : TEAL} toneMapped={false} />
      </mesh>
      {hover === i && (
        <Text font={monoFont} fontSize={0.11} color={PEACH} position={[0, -0.34, 0]} anchorX="center">
          {name}
        </Text>
      )}
    </Billboard>
  ));
}

/* ---------------------------------------------------------- composition */

function Setup({ lite, animate }) {
  // reflections + studio environment only once the device has shown it keeps up (see Adaptive)
  const quality = useQuality();
  const rich = !lite && quality === 'high';
  const root = useRef();
  const glow = useRef();
  const pressRef = useRef(() => {});
  const camera = useThree((s) => s.camera);
  const screen = useMemo(createCodeScreen, []);
  const [lampOn, setLampOn] = useState(true);
  // first file starts part-typed so the screen never opens empty
  const st = useRef({ file: 0, chars: FILES[0].code.split('\n').slice(0, 9).join('\n').length, acc: 0, hold: 0, blink: 0, drawn: '', hover: false, zoom: 0, tx: 0, ty: 0 });
  // phones: a touch closer, framed higher (no orbiting icons to make room for)
  const base = useMemo(() => (lite ? new THREE.Vector3(0.3, 2.1, 7.0) : new THREE.Vector3(0.2, 2.05, 6.5)), [lite]);
  const zoomTo = useMemo(() => new THREE.Vector3(0.05, 1.6, 4.6), []);
  const look = useMemo(() => new THREE.Vector3(0, lite ? 0.62 : 0.95, -0.2), [lite]);
  const camGoal = useMemo(() => new THREE.Vector3(), []);
  const ambient = useRef();

  useEffect(() => () => screen.tex.dispose(), [screen]);

  const nextFile = () => {
    const s = st.current;
    s.file = (s.file + 1) % FILES.length;
    s.chars = animate ? 0 : FILES[s.file].code.length;
    s.hold = 0;
    s.drawn = '';
  };

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = st.current;
    const code = FILES[s.file].code;

    // live typing (with small natural pauses at line ends)
    if (animate) {
      if (s.chars < code.length) {
        s.acc += dt * (code[s.chars] === '\n' ? 14 : 38);
        while (s.acc >= 1 && s.chars < code.length) {
          s.acc -= 1;
          pressRef.current(code[s.chars]);
          s.chars += 1;
          if (code[s.chars - 1] === '\n') break;
        }
      } else {
        s.hold += dt;
        if (s.hold > 2.6) nextFile();
      }
    } else if (s.chars === 0) s.chars = code.length;

    const cursorOn = !animate || Math.floor(clock.elapsedTime * 2.2) % 2 === 0;
    const key = `${s.file}|${s.chars}|${cursorOn}`;
    if (key !== s.drawn) {
      screen.draw(s.file, s.chars, cursorOn);
      s.drawn = key;
    }

    // tilt toward the mouse (desktop only)
    const live = !lite && animate && pointer.active;
    s.tx = damp(s.tx, live ? pointer.x * 0.28 : 0, 3, dt);
    s.ty = damp(s.ty, live ? -pointer.y * 0.08 : 0, 3, dt);
    root.current.rotation.set(s.ty, -0.32 + s.tx, 0);

    // camera: zoom on monitor hover, pull back as the hero scrolls away
    s.zoom = damp(s.zoom, !lite && s.hover ? 1 : 0, 4, dt);
    const p = Math.min(1, window.scrollY / window.innerHeight);
    camGoal.lerpVectors(base, zoomTo, s.zoom * 0.35);
    camGoal.z += p * 4;
    camGoal.y += p * 1.2;
    camera.position.lerp(camGoal, lite ? 1 : 1 - Math.exp(-dt * 4));
    camera.lookAt(look);

    // lighting follows the lamp
    const on = lampOn ? 1 : 0;
    ambient.current.intensity = damp(ambient.current.intensity, 0.18 + on * 0.22, 6, dt);
    glow.current.intensity = damp(glow.current.intensity, lampOn ? 1.6 : 3.6, 6, dt);
  });

  return (
    <>
      {/* cinematic: low ambient, teal rims from behind, warm lamp key (in <Lamp>), screen glow */}
      <hemisphereLight ref={ambient} args={['#8fd6cf', BASE, 0.4]} />
      <directionalLight position={[2.5, 4, 3]} intensity={0.35} color="#d1e8e2" />
      <directionalLight position={[-4, 3, -4]} intensity={3.2} color={TEAL_HI} />
      <directionalLight position={[4.5, 2, -3.5]} intensity={1.6} color={TEAL_HI} />
      <pointLight position={[-2.6, 0.6, 1.6]} color={TEAL} intensity={6} distance={6} decay={2} />
      <pointLight position={[2.4, 0.9, 1.4]} color={PEACH} intensity={1.2} distance={5} decay={2} />
      {rich && (
        // soft studio reflections on the metal + glossy desk (rendered once)
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" color={TEAL_HI} intensity={2.2} position={[-5, 2, -2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer form="rect" color={PEACH} intensity={1.4} position={[5, 3, 1]} rotation-y={-Math.PI / 2} scale={[3, 2, 1]} />
          <Lightformer form="rect" color="#d1e8e2" intensity={0.5} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[6, 3, 1]} />
        </Environment>
      )}
      <group ref={root}>
        {/* desk */}
        <RoundedBox args={[4.4, 0.1, 2.0]} radius={0.04} smoothness={2} material={M.desk} position={[0, -0.05, 0]} />
        {rich && (
          <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
            <planeGeometry args={[4.3, 1.92]} />
            <MeshReflectorMaterial
              resolution={512}
              blur={[260, 80]}
              mixBlur={1}
              mixStrength={2.2}
              roughness={0.6}
              metalness={0.2}
              color="#162422"
              mirror={0.4}
              depthScale={0.6}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.2}
            />
          </mesh>
        )}
        <mesh material={M.grad} position={[0, -0.05, 1.0]}>
          <boxGeometry args={[4.3, 0.008, 0.008]} />
        </mesh>
        {[-2, 2].map((x) => (
          <mesh key={x} material={M.deskEdge} position={[x, -0.75, 0]}>
            <boxGeometry args={[0.08, 1.3, 1.8]} />
          </mesh>
        ))}
        <Monitor
          screenTex={screen.tex}
          glowRef={glow}
          onHover={(h) => (st.current.hover = h)}
          onClick={nextFile}
        />
        <Keyboard pressRef={pressRef} />
        <Mouse />
        <Mug animate={animate} />
        <Plant />
        <Lamp on={lampOn} onToggle={() => setLampOn((v) => !v)} />
        {!lite && <OrbitIcons animate={animate} />}
      </group>
    </>
  );
}

export default function DeskScene({ active = true, lite = false, reduced = false, onReady }) {
  const animate = !reduced;
  return (
    <Canvas
      dpr={lite ? 1 : [1, MAX_DPR]}
      frameloop={!active ? 'never' : 'always'}
      camera={{ position: [0.2, 2.15, 6.9], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMappingExposure: 1.15 }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
    >
      <Adaptive max={lite ? 1 : MAX_DPR}>
        <Setup lite={lite} animate={animate} />
      </Adaptive>
    </Canvas>
  );
}
