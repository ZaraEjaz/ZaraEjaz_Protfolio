import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, RoundedBox, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { paintTubeGradient, PEACH, PLATINUM, TAN, TEAL, TEAL_HI } from '../palette';
import monoFont from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?url';
import { curve, journeyAt, journeyState, STOPS } from './path';
import { journey } from '../../content';

const TEAL_C = new THREE.Color(TEAL_HI);
const WIN_OFF = new THREE.Color('#1e2b29');
const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra });

const M = {
  ground: flat('#2a4a46'),
  groundEdge: flat('#152927'),
  pad: flat('#2e4a46'),
  wall: flat('#2c3531'),
  wallB: flat('#24302c'),
  roof: flat('#16201e'),
  desk: flat('#4a5c57'),
  screen: new THREE.MeshBasicMaterial({ color: TEAL_HI, toneMapped: false }),
  leaf: flat('#4f6b3a'),
  leafB: flat('#3f5a2f'),
  pot: flat('#5a4a3c'),
  trunk: flat('#3b2f27'),
  rock: flat('#33504b'),
  teal: new THREE.MeshBasicMaterial({ color: TEAL_C, toneMapped: false }),
  pathDim: new THREE.MeshBasicMaterial({ color: '#2d4744', toneMapped: false }),
  pathLit: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
};

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ ground */

function Ground({ lite }) {
  const trees = useMemo(() => {
    const r = (s) => {
      const x = Math.sin(s * 91.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const spots = [];
    for (let i = 0; spots.length < (lite ? 10 : 22) && i < 400; i++) {
      const x = -13 + r(i) * 26;
      const z = -8 + r(i + 7) * 16;
      // keep clear of the path and buildings
      let clear = STOPS.every((s) => Math.hypot(x - s.pos[0], z - s.pos[2]) > 2.8);
      for (let u = 0; clear && u <= 1; u += 0.02) {
        const p = curve.getPointAt(u);
        if (Math.hypot(x - p.x, z - p.z) < 1.1) clear = false;
      }
      if (clear) spots.push({ x, z, s: 0.6 + r(i + 3) * 0.6, rock: r(i + 5) > 0.7 });
    }
    return spots;
  }, [lite]);

  return (
    <group>
      {/* plateau */}
      <mesh material={M.ground} position-y={-0.25} receiveShadow>
        <boxGeometry args={[30, 0.5, 20]} />
      </mesh>
      <mesh material={M.groundEdge} position-y={-0.9}>
        <cylinderGeometry args={[17, 15.5, 0.8, 6]} />
      </mesh>
      {trees.map((t, i) =>
        t.rock ? (
          <mesh key={i} material={M.rock} position={[t.x, 0.12 * t.s, t.z]} scale={t.s * 0.35} rotation-y={i}>
            <dodecahedronGeometry args={[1, 0]} />
          </mesh>
        ) : (
          <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
            <mesh material={M.trunk} position-y={0.2}>
              <cylinderGeometry args={[0.05, 0.07, 0.4, 5]} />
            </mesh>
            <mesh material={i % 2 ? M.leaf : M.leafB} position-y={0.62} castShadow>
              <coneGeometry args={[0.32, 0.7, 6]} />
            </mesh>
          </group>
        ),
      )}
    </group>
  );
}

/* -------------------------------------------------------------------- path */

function Path() {
  const lit = useRef();
  const geo = useMemo(() => paintTubeGradient(new THREE.TubeGeometry(curve, 300, 0.05, 6, false), 300, 6), []);
  const total = geo.index.count;
  const base = useMemo(() => new THREE.TubeGeometry(curve, 300, 0.32, 6, false), []);
  useEffect(() => () => [geo, base].forEach((g) => g.dispose()), [geo, base]);

  useFrame(() => {
    // the walked part of the path glows; the rest waits dimly
    const { u } = journeyAt(journeyState.p);
    const segs = Math.ceil(u * 300);
    lit.current.geometry.setDrawRange(0, Math.min(total, segs * 6 * 6));
  });

  return (
    <group position-y={0.012}>
      <mesh geometry={base} scale={[1, 0.06, 1]} material={M.pad} receiveShadow />
      <mesh geometry={geo} material={M.pathDim} position-y={0.03} />
      <mesh ref={lit} geometry={geo.clone()} material={M.pathLit} position-y={0.035} />
    </group>
  );
}

/* ---------------------------------------------------------------- buildings */

function Plant({ position, s = 1 }) {
  return (
    <group position={position} scale={s}>
      <mesh material={M.pot} position-y={0.08}>
        <cylinderGeometry args={[0.07, 0.05, 0.16, 6]} />
      </mesh>
      <mesh material={M.leaf} position-y={0.26}>
        <icosahedronGeometry args={[0.13, 0]} />
      </mesh>
    </group>
  );
}

function Desk({ position, rot = 0 }) {
  return (
    <group position={position} rotation-y={rot}>
      <mesh material={M.desk} position-y={0.3}>
        <boxGeometry args={[0.7, 0.04, 0.38]} />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} material={M.desk} position={[x, 0.15, 0]}>
          <boxGeometry args={[0.04, 0.3, 0.34]} />
        </mesh>
      ))}
      <mesh material={M.roof} position={[0, 0.48, -0.1]}>
        <boxGeometry args={[0.42, 0.26, 0.03]} />
      </mesh>
      <mesh material={M.screen} position={[0, 0.48, -0.083]}>
        <planeGeometry args={[0.36, 0.2]} />
      </mesh>
    </group>
  );
}

/** Interior props differ per building so each stop feels like its own place. */
function Interior({ variant }) {
  if (variant === 'campus')
    return (
      <>
        {[-0.7, 0, 0.7].map((x) => (
          <Desk key={x} position={[x, 0, 0.25]} />
        ))}
        <mesh material={M.wallB} position={[0, 0.6, -0.75]}>
          <boxGeometry args={[1.8, 0.7, 0.04]} />
        </mesh>
        <Plant position={[1.1, 0, -0.5]} />
      </>
    );
  if (variant === 'studio')
    return (
      <>
        <Desk position={[-0.55, 0, 0]} />
        <Desk position={[0.55, 0, 0]} />
        <Plant position={[1.05, 0, -0.55]} s={1.3} />
        <Plant position={[-1.05, 0, 0.5]} />
      </>
    );
  if (variant === 'agency')
    return (
      <>
        {/* big design table with a lit "artboard" */}
        <mesh material={M.desk} position={[0, 0.32, 0]}>
          <boxGeometry args={[1.3, 0.05, 0.7]} />
        </mesh>
        <mesh material={M.screen} position={[0, 0.355, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.5, 0.32]} />
        </mesh>
        <Plant position={[0.9, 0, 0.5]} s={1.2} />
        <Plant position={[-0.9, 0, -0.5]} />
      </>
    );
  return (
    <>
      {/* HQ: row of desks + a server rack */}
      <Desk position={[-0.7, 0, 0.1]} />
      <Desk position={[0.1, 0, 0.1]} />
      <group position={[0.95, 0, -0.35]}>
        <mesh material={M.roof} position-y={0.5}>
          <boxGeometry args={[0.36, 1, 0.36]} />
        </mesh>
        {[0.25, 0.45, 0.65, 0.85].map((y) => (
          <mesh key={y} material={M.screen} position={[0, y, 0.182]}>
            <planeGeometry args={[0.24, 0.03]} />
          </mesh>
        ))}
      </group>
      <Plant position={[-1.15, 0, -0.5]} s={1.2} />
    </>
  );
}

// each stop gets its own shape, wall colour and sign colour so the four places read as different
const SIZES = {
  campus: { w: 3.2, d: 2.2, h: 1.7, roof: 'pitched', wall: '#6b5a49', wallB: '#5a4b3d', roofC: '#3a2f27', sign: TAN, name: 'Bahria University' },
  studio: { w: 2.8, d: 2.0, h: 1.3, roof: 'flat', wall: TEAL, wallB: '#0d4f51', roofC: '#0a3536', sign: TEAL_HI, name: 'Quantaflix' },
  agency: { w: 2.6, d: 2.0, h: 1.5, roof: 'saw', wall: '#8fa59e', wallB: '#778d86', roofC: '#2c3531', sign: PEACH, name: 'Abidi Solutions' },
  hq: { w: 3.2, d: 2.2, h: 2.3, roof: 'flat', wall: '#2c3531', wallB: '#222c29', roofC: '#121a19', sign: PLATINUM, name: 'TRPL Solutions' },
};
const matCache = {};
const tone = (c) => (matCache[c] ??= flat(c));

function Building({ stop, index, data }) {
  const look = SIZES[stop.variant];
  const { w, d, h, roof } = look;
  const wall = tone(look.wall);
  const wallB = tone(look.wallB);
  const roofM = tone(look.roofC);
  const signC = useMemo(() => new THREE.Color(look.sign), [look.sign]);
  const signText = useRef();
  const signLight = useRef();
  const roofRef = useRef();
  const front = useRef();
  const glow = useRef();
  const winMat = useMemo(() => new THREE.MeshBasicMaterial({ color: WIN_OFF.clone(), toneMapped: false }), []);
  const signMat = useMemo(() => new THREE.MeshBasicMaterial({ color: look.sign, toneMapped: false }), [look.sign]);
  const signFrame = useMemo(() => new THREE.MeshBasicMaterial({ color: look.sign, toneMapped: false, depthTest: false, depthWrite: false }), [look.sign]);
  const s = useRef({ open: 0 });

  useEffect(() => () => [winMat, signMat, signFrame].forEach((m) => m.dispose()), [winMat, signMat, signFrame]);

  useFrame((_, delta) => {
    const j = journeyAt(journeyState.p);
    // "open" while she's here (and after); lights stay on once visited
    const here = j.stop === index && !j.walking ? smooth(0, 0.25, j.dwell) : 0;
    const visited = j.stop > index || (j.stop === index && !j.walking) ? 1 : 0;
    s.current.open += (here - s.current.open) * (1 - Math.exp(-delta * 6));
    const o = s.current.open;
    roofRef.current.position.y = h + o * 0.9;
    roofRef.current.rotation.z = o * 0.08;
    front.current.position.z = d / 2 + o * 0.6;
    front.current.position.y = h / 2 - o * (h + 0.1);
    winMat.color.copy(WIN_OFF).lerp(signC, Math.max(visited * 0.6, o));
    glow.current.intensity = o * 6 + visited * 1.2;
    // the sign is softly lit from the start and fully lit once she has been here
    const lit = Math.max(visited, o, 0.5);
    if (signText.current) signText.current.fillOpacity = lit;
    signLight.current.intensity = lit * 3;
  });

  const winCols = Math.floor(w / 0.6);
  return (
    <group position={stop.pos} rotation-y={stop.rot}>
      {/* plinth */}
      <mesh material={M.pad} position-y={0.04} receiveShadow>
        <boxGeometry args={[w + 0.8, 0.08, d + 0.8]} />
      </mesh>
      <group position-y={0.08}>
        <Interior variant={stop.variant} />
        {/* back + side walls */}
        <mesh material={wall} position={[0, h / 2, -d / 2]} castShadow>
          <boxGeometry args={[w, h, 0.08]} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} material={wallB} position={[(sx * w) / 2, h / 2, 0]} castShadow>
            <boxGeometry args={[0.08, h, d]} />
          </mesh>
        ))}
        {/* front wall slides down into the ground to "open" the office */}
        <group ref={front} position={[0, h / 2, d / 2]}>
          <mesh material={wall} castShadow>
            <boxGeometry args={[w, h, 0.08]} />
          </mesh>
          {Array.from({ length: winCols }, (_, i) => (
            <mesh key={i} material={winMat} position={[(i - (winCols - 1) / 2) * 0.6, h * 0.18, 0.045]}>
              <planeGeometry args={[0.34, h * 0.32]} />
            </mesh>
          ))}
          <mesh material={roofM} position={[0, -h / 2 + 0.32, 0.045]}>
            <planeGeometry args={[0.4, 0.64]} />
          </mesh>
        </group>
        {/* roof lifts off */}
        <group ref={roofRef} position-y={h}>
          {roof === 'pitched' ? (
            <mesh material={roofM} rotation-y={Math.PI / 4} position-y={0.35} castShadow>
              <coneGeometry args={[Math.max(w, d) * 0.78, 0.7, 4]} />
            </mesh>
          ) : roof === 'saw' ? (
            [-0.65, 0, 0.65].map((x) => (
              <mesh key={x} material={roofM} position={[x, 0.18, 0]} rotation-z={0.5} castShadow>
                <boxGeometry args={[0.8, 0.08, d + 0.1]} />
              </mesh>
            ))
          ) : (
            <mesh material={roofM} position-y={0.05} castShadow>
              <boxGeometry args={[w + 0.12, 0.1, d + 0.12]} />
            </mesh>
          )}
          <mesh material={signMat} position={[0, 0.005, d / 2 + 0.065]}>
            <boxGeometry args={[w + 0.12, 0.02, 0.01]} />
          </mesh>
        </group>
        <pointLight ref={glow} position={[0, h * 0.7, 0]} color={look.sign} distance={4.5} decay={2} />
      </group>
      {/* glowing company sign high above the building (clear of the lifting roof); drawn on top so it never clips */}
      <Billboard position={[0, h + 1.65, 0]} renderOrder={20}>
        <mesh position={[0, 0, -0.02]} material={signFrame} renderOrder={20}>
          <planeGeometry args={[look.name.length * 0.158 + 0.5, 0.6]} />
        </mesh>
        <mesh position={[0, 0, -0.01]} renderOrder={21}>
          <planeGeometry args={[look.name.length * 0.158 + 0.44, 0.54]} />
          <meshBasicMaterial color="#0b1514" toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
        <Text ref={signText} font={monoFont} fontSize={0.25} color={look.sign} anchorX="center" anchorY="middle" position={[0, 0.07, 0]} renderOrder={22} material-depthTest={false}>
          {look.name}
        </Text>
        <Text font={monoFont} fontSize={0.12} color={PLATINUM} fillOpacity={0.75} anchorX="center" anchorY="middle" position={[0, -0.16, 0]} renderOrder={22} material-depthTest={false}>
          {data.period}
        </Text>
        <pointLight ref={signLight} position={[0, -0.6, 0.6]} color={look.sign} distance={3} decay={2} />
      </Billboard>
    </group>
  );
}

/* -------------------------------------------------------------- tech tiles */

/** Tiles rise out of the office, orbit her, then fly up to the on-screen inventory. */
function Tiles({ index, avatar }) {
  const stack = journey[index].stack;
  const refs = useRef([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const home = useMemo(() => new THREE.Vector3(...STOPS[index].pos), [index]);

  useFrame(({ clock, camera }) => {
    const j = journeyAt(journeyState.p);
    const active = j.stop === index && !j.walking ? j.dwell : -1;
    const t = clock.elapsedTime;
    stack.forEach((_, i) => {
      const m = refs.current[i];
      if (!m) return;
      if (active < 0) {
        m.visible = false;
        return;
      }
      const delay = i * 0.03;
      const rise = smooth(0.05 + delay, 0.3 + delay, active);
      const collect = smooth(0.5 + delay, 0.68 + delay, active);
      m.visible = collect < 0.999 && rise > 0.001;
      if (!m.visible) return;
      const a = (i / stack.length) * Math.PI * 2 + t * 0.8;
      const r = 1.25;
      const center = avatar.current.position;
      // from the building → orbit around her
      tmp.set(home.x, 0.4, home.z).lerp(
        new THREE.Vector3(center.x + Math.cos(a) * r, 1.3 + Math.sin(a * 2) * 0.15, center.z + Math.sin(a) * r),
        rise,
      );
      // → up and toward the camera (the inventory bar lives at the bottom of the screen)
      if (collect > 0) tmp.lerp(camera.position, collect * 0.35).add(new THREE.Vector3(0, -collect * 2.2, 0));
      m.position.copy(tmp);
      m.scale.setScalar(Math.max(0.001, rise * (1 - collect * 0.8)));
    });
  });

  return stack.map((label, i) => (
    <Billboard key={label} ref={(el) => (refs.current[i] = el)} visible={false}>
      <RoundedBox args={[0.98, 0.34, 0.08]} radius={0.06} smoothness={2}>
        <meshStandardMaterial color="#172422" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, -0.15, 0.042]} material={M.teal}>
        <planeGeometry args={[0.7, 0.014]} />
      </mesh>
      <Text font={monoFont} fontSize={0.13} color="#ededf0" position-z={0.05} anchorX="center" anchorY="middle">
        {label}
      </Text>
    </Billboard>
  ));
}

export default function World({ avatar, lite }) {
  return (
    <group>
      <Ground lite={lite} />
      {/* dusk fireflies */}
      {!lite && <Sparkles count={60} scale={[26, 3, 16]} position={[0, 1.4, 0]} size={3} speed={0.25} color={PEACH} opacity={0.6} />}
      <Path />
      {STOPS.map((s, i) => (
        <Building key={s.id} stop={s} index={i} data={journey[i]} />
      ))}
      {STOPS.map((s, i) => journey[i].stack.length > 0 && <Tiles key={s.id} index={i} avatar={avatar} />)}
    </group>
  );
}

