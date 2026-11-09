import { useMemo, useRef } from 'react';
import { Billboard, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import Avatar from '../journey/Avatar';
import Person from './Person';
import { M } from './materials';
import Enter from './Enter';
import { Arrow, Blueprint, Card, Chair, Label, Laptop, Note, Rack, Table, Pill } from './props';
import { clamp01, easeBack, easeInOut, easeOut, smooth, useChapterFrame, useHer } from './anim';
import { bubbleTexture, specTexture, stampTexture, terminalTexture } from './textures';
import { PEACH } from '../palette';

/*
 * TRPL story: seven chapters, one moment each. Coordinates are screen-aligned
 * (the scene rotates them to face the camera): +x right, +z toward the viewer, +y up.
 */







/* ------------------------------------------------- 1 · client meeting */

const TOPICS = [
  { kind: 'problem', at: [-1.2, 3.0, -0.2] },
  { kind: 'process', at: [0, 3.25, -0.2] },
  { kind: 'goals', at: [1.2, 3.0, -0.2] },
];
const TOPIC_T = (i) => 1.0 + i * 0.6;

function Bubble({ kind, at, start }) {
  const ref = useRef();
  const from = useMemo(() => new THREE.Vector3(1.05, 1.95, -0.1), []);
  const to = useMemo(() => new THREE.Vector3(...at), [at]);
  useChapterFrame(({ t, out, now }) => {
    const a = clamp01((t - start) / 0.9);
    const leave = easeInOut(out * 1.3);
    ref.current.position.copy(from).lerp(to, easeOut(a));
    ref.current.position.y += Math.sin(now * 1.5 + start * 3) * 0.04 * a + leave * 0.4;
    ref.current.scale.setScalar(Math.max(0.0001, (a < 1 ? easeBack(a, 1.1) : 1) * (1 - leave)));
    ref.current.visible = a > 0;
  });
  return (
    <group ref={ref} visible={false}>
      <Card map={bubbleTexture(kind, kind)} w={0.96} h={0.9} />
    </group>
  );
}


export function Meeting() {
  const her = useHer('sit');
  const client = useRef({ pose: 'sit', talk: false, thumbs: 0 });
  useChapterFrame(({ t }) => {
    client.current.talk = t > 0.8 && t < 3.4;
  });
  return (
    <>
      <Enter delay={0}>
        <Table />
        <Enter delay={0.5} position={[0.45, 0.84, 0.2]}>
          <mesh material={M.cup}>
            <cylinderGeometry args={[0.05, 0.045, 0.11, 16]} />
          </mesh>
        </Enter>
      </Enter>
      <Enter delay={0.15} position={[-1.05, 0, 0.1]} rotation-y={Math.PI / 2 - 0.3}>
        <Chair />
        <Avatar motion={her} />
      </Enter>
      <Enter delay={0.3} position={[1.05, 0, -0.1]} rotation-y={-Math.PI / 2 + 0.3}>
        <Chair />
        <Person motion={client} shirt="#d9b08c" />
      </Enter>
      {TOPICS.map((tp, i) => (
        <Bubble key={tp.kind} kind={tp.kind} at={tp.at} start={TOPIC_T(i)} />
      ))}
      {TOPICS.map((tp, i) => (
        <Enter key={tp.kind} delay={TOPIC_T(i) + 0.55} dur={0.5} from={[0, 0.25, 0]} position={[-0.45 + i * 0.05, 0.795, -0.25 + i * 0.24]}>
          <Note kind={tp.kind} />
        </Enter>
      ))}
    </>
  );
}

/* --------------------------------------------------- 2 · requirements */

const FLOW = [
  { label: 'Sales', doc: 'Sales Order' },
  { label: 'Stock', doc: 'Delivery Note' },
  { label: 'Accounts', doc: 'Sales Invoice' },
];
const FLOW_X = [-1.05, 0.45, 1.95];
const NODE_W = 1.1;
const FLY = (i) => 0.7 + i * 0.65; // note i leaves her hand
const HER2 = { pos: [-2.55, 0, 0.55], yaw: Math.PI / 2 - 0.55 };


function FlyingNote({ kind, i, target }) {
  const ref = useRef();
  const hand = useMemo(
    () => new THREE.Vector3(HER2.pos[0] + Math.sin(HER2.yaw) * 0.42, 1.15 + i * 0.03, HER2.pos[2] + Math.cos(HER2.yaw) * 0.42),
    [i],
  );
  useChapterFrame(({ t, out }) => {
    const appear = easeOut((t - 0.25) / 0.4);
    const a = easeInOut((t - FLY(i)) / 0.6);
    const g = ref.current;
    g.position.copy(hand).lerp(target, a);
    g.position.y += Math.sin(a * Math.PI) * 0.7;
    g.rotation.set(-Math.PI / 2 + (1 - a) * 1.1, 0, 0);
    g.scale.setScalar(Math.max(0.0001, appear * (1 - smooth(0.7, 1, a)) * (1 - out)));
  });
  return (
    <group ref={ref}>
      <Note kind={kind} rotation-x={0} />
    </group>
  );
}


export function Requirements() {
  const her = useHer('point');
  const targets = useMemo(() => FLOW_X.map((x) => new THREE.Vector3(x, 0.45, -0.3)), []);
  return (
    <>
      <Enter delay={0} grow={false} from={[0, -0.2, 0]}>
        <Blueprint x={0}>
          {FLOW.map((n, i) => (
            <group key={n.label}>
              <Enter delay={FLY(i) + 0.45} position={[FLOW_X[i], 0.08, -0.3]}>
                <RoundedBox args={[NODE_W, 0.4, 0.55]} radius={0.06} position-y={0.2} material={M.node} />
                <mesh material={M.glow} position-y={0.405}>
                  <boxGeometry args={[NODE_W - 0.16, 0.012, 0.42]} />
                </mesh>
                <Label position={[0, 0.2, 0.28]} size={0.15}>
                  {n.label}
                </Label>
              </Enter>
              <Enter delay={FLY(i) + 0.75} from={[0, 0.25, 0]} position={[FLOW_X[i], 0.09, 0.42]}>
                <RoundedBox args={[NODE_W, 0.05, 0.28]} radius={0.02} material={M.chip} />
                <Label position={[0, 0.03, 0]} rotation-x={-Math.PI / 2} size={0.11} color={PEACH}>
                  {n.doc}
                </Label>
              </Enter>
            </group>
          ))}
          <group position={[0, 0.3, -0.3]}>
            {[0, 1].map((i) => (
              <Arrow key={i} from={FLOW_X[i] + NODE_W / 2 + 0.04} to={FLOW_X[i + 1] - NODE_W / 2 - 0.1} start={FLY(i + 1) + 0.2} packets />
            ))}
          </group>
        </Blueprint>
      </Enter>
      <Enter delay={0.1} position={HER2.pos} rotation-y={HER2.yaw}>
        <Avatar motion={her} />
      </Enter>
      {TOPICS.map((tp, i) => (
        <FlyingNote key={tp.kind} kind={tp.kind} i={i} target={targets[i]} />
      ))}
    </>
  );
}

/* ------------------------------------------------------- 3 · planning */

const LANES = [
  { label: 'Sales', z: -0.72, bars: [[-0.55, 1.1, 'doctypes'], [0.75, 1.0, 'workflow']] },
  { label: 'Stock', z: 0.0, bars: [[-0.15, 1.0, 'setup'], [1.05, 0.9, 'doctypes']] },
  { label: 'Accounts', z: 0.72, bars: [[0.6, 0.95, 'reports'], [1.75, 0.6, 'go-live']] },
];

export function Planning() {
  const her = useHer('talk');
  let n = 0;
  return (
    <>
      <Enter delay={0} grow={false} from={[0, -0.2, 0]}>
        <Blueprint x={0.15}>
          {/* timeline ticks along the back edge */}
          {[...Array(6)].map((_, i) => (
            <Enter key={i} delay={0.3 + i * 0.06} position={[-0.75 + i * 0.6, 0.09, -1.06]}>
              <mesh material={M.glowDim}>
                <boxGeometry args={[0.02, 0.01, 0.12]} />
              </mesh>
            </Enter>
          ))}
          {LANES.map((l, li) => (
            <group key={l.label} position-z={l.z}>
              {/* module = lane header */}
              <Enter delay={0.35 + li * 0.15} position={[-1.65, 0.08, 0]}>
                <RoundedBox args={[0.95, 0.16, 0.48]} radius={0.04} position-y={0.08} material={M.node} />
                <Label position={[0, 0.165, 0]} rotation-x={-Math.PI / 2} size={0.14}>
                  {l.label}
                </Label>
              </Enter>
              {/* doctype / timeline blocks drop into place */}
              {l.bars.map(([x, w, label]) => {
                const d = 1.0 + n++ * 0.22;
                return (
                  <Enter key={label} delay={d} dur={0.7} grow={false} from={[0.5, 0.9, 0]} position={[x + w / 2 - 0.6, 0.08, 0]}>
                    <RoundedBox args={[w, 0.12, 0.44]} radius={0.04} position-y={0.06} material={label === 'go-live' ? M.peachSolid : li === 1 ? M.tan : M.tealSolid} />
                    <Label position={[0, 0.125, 0]} rotation-x={-Math.PI / 2} size={0.12} color="#0e1a1a">
                      {label}
                    </Label>
                  </Enter>
                );
              })}
            </group>
          ))}
        </Blueprint>
      </Enter>
      <Enter delay={0.15} position={[-2.75, 0, 0.75]} rotation-y={0.75}>
        <Avatar motion={her} />
      </Enter>
    </>
  );
}

/* ------------------------------------------------ 4 · team discussion */

const COLS = ['to do', 'doing', 'done'];
const TASKS = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [2, 0],
];

export function Team() {
  const her = useHer('point');
  const mates = [useRef({ pose: 'stand', talk: false }), useRef({ pose: 'stand', talk: false })];
  useChapterFrame(({ t }) => {
    mates[0].current.talk = t > 2.2 && t < 3.2;
  });
  return (
    <>
      <Enter delay={0} position={[0.35, 0, -0.9]}>
        {/* whiteboard on two legs */}
        {[-1.45, 1.45].map((x) => (
          <mesh key={x} material={M.woodDark} position={[x, 0.75, -0.02]}>
            <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          </mesh>
        ))}
        <RoundedBox args={[3.2, 1.75, 0.06]} radius={0.04} position-y={1.6} material={M.board} />
        <mesh material={M.boardFace} position={[0, 1.6, 0.032]}>
          <planeGeometry args={[3.04, 1.6]} />
        </mesh>
        {COLS.map((c, i) => (
          <group key={c} position={[-1.0 + i * 1.0, 0, 0.04]}>
            <Label position={[0, 2.25, 0]} size={0.12} color="#2c3531">
              {c}
            </Label>
            {i > 0 && (
              <mesh material={M.boardLine} position={[-0.5, 1.55, 0]}>
                <planeGeometry args={[0.012, 1.35]} />
              </mesh>
            )}
          </group>
        ))}
        {/* tasks fly in from the roadmap (off to the right) */}
        {TASKS.map(([col, row], i) => (
          <Enter key={i} delay={0.9 + i * 0.22} dur={0.75} grow={false} from={[2.6, 0.9, 1.4]} position={[-1.0 + col * 1.0, 1.95 - row * 0.36, 0.05]}>
            <RoundedBox args={[0.78, 0.26, 0.03]} radius={0.02} material={col === 2 ? M.tealSolid : i % 2 ? M.peachSolid : M.tan} />
          </Enter>
        ))}
      </Enter>
      <Enter delay={0.15} position={[-1.85, 0, -0.35]} rotation-y={0.55}>
        <Avatar motion={her} />
      </Enter>
      <Enter delay={0.3} position={[0.15, 0, 1.15]} rotation-y={Math.PI - 0.25}>
        <Person motion={mates[0]} shirt="#3d6e6a" hair="#3b2a20" skin="#b98263" />
      </Enter>
      <Enter delay={0.42} position={[1.45, 0, 0.95]} rotation-y={Math.PI + 0.35}>
        <Person motion={mates[1]} shirt="#8a6f9e" hair="#151515" skin="#d9a982" />
      </Enter>
    </>
  );
}

/* ---------------------------------------------------- 5 · agile sprints */

const RING_R = 1.85;
const STEPS = ['plan', 'build', 'test', 'demo'];
const LOOP = 3.4; // seconds per sprint
const LOOP_START = 1.2;
const ringAt = (theta, y = 0) => [Math.sin(theta) * RING_R, y, Math.cos(theta) * RING_R];
// front-left → back-left → back-right → front-right: nothing sits behind her, and "demo" lands by the client
const STEP_THETA = [-Math.PI / 4, -0.75 * Math.PI, -1.25 * Math.PI, -1.75 * Math.PI];

function AppScreen() {
  // UI blocks of the custom app; one more appears every sprint
  const blocks = [
    { p: [0, 0.3, 0], s: [1.3, 0.12], m: 'tealSolid' },
    { p: [-0.52, -0.08, 0], s: [0.26, 0.6], m: 'chip' },
    { p: [0.15, 0.08, 0], s: [0.9, 0.1], m: 'peachSolid' },
    { p: [0.15, -0.07, 0], s: [0.9, 0.1], m: 'chip' },
    { p: [0.15, -0.22, 0], s: [0.9, 0.1], m: 'chip' },
  ];
  const refs = useRef([]);
  useChapterFrame(({ t, out }) => {
    const sprints = (t - LOOP_START) / LOOP;
    refs.current.forEach((r, i) => {
      if (!r) return;
      const a = easeOut((sprints + 0.75 - i * 0.55) / 0.4) * (1 - out);
      r.scale.set(Math.max(0.0001, a), 1, 1);
    });
  });
  return (
    <Billboard position={[0, 2.75, -0.2]}>
      <RoundedBox args={[1.55, 0.95, 0.04]} radius={0.04} material={M.screenFrame} />
      {blocks.map((b, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} material={M[b.m]} position={[b.p[0], b.p[1], 0.03]}>
          <planeGeometry args={b.s} />
        </mesh>
      ))}
    </Billboard>
  );
}

export function Agile() {
  const her = useHer('sit');
  const client = useRef({ pose: 'stand', talk: false, thumbs: 0 });
  const token = useRef();
  const review = useRef();
  const lights = useRef([]);
  useChapterFrame(({ t, out }) => {
    const phase = Math.max(0, t - LOOP_START) / LOOP;
    const f = phase % 1;
    const theta = -Math.PI / 4 - f * Math.PI * 2;
    token.current.position.set(...ringAt(theta, 0.12));
    token.current.scale.setScalar(Math.max(0.0001, smooth(0, 0.3, t - LOOP_START) * (1 - out)));
    // client review at the end of each loop (token passing "demo")
    const r = t > LOOP_START + LOOP * 0.7 ? smooth(0.72, 0.8, f) * (1 - smooth(0.97, 1, f)) : 0;
    const reviewed = phase > 0.8;
    client.current.thumbs = r > 0.5 || (reviewed && f > 0.72) ? 1 : 0;
    review.current.scale.setScalar(Math.max(0.0001, easeBack(r) * (1 - out)));
    lights.current.forEach((m, i) => {
      if (!m) return;
      const lit = Math.abs(((f * 4 - i + 4.5) % 4) - 0.5) < 0.35;
      m.material = lit ? M.peachGlow : M.glow;
    });
  });
  return (
    <>
      <group position-x={-0.35}>
        <Enter delay={0} grow={false} from={[0, -0.15, 0]}>
          <mesh material={M.glowDim} rotation-x={-Math.PI / 2} position-y={0.02}>
            <ringGeometry args={[RING_R - 0.05, RING_R + 0.05, 96]} />
          </mesh>
        </Enter>
        {STEPS.map((s, i) => (
          <Enter key={s} delay={0.3 + i * 0.15} position={ringAt(STEP_THETA[i])}>
            <mesh ref={(el) => (lights.current[i] = el)} material={M.glow} position-y={0.04}>
              <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
            </mesh>
            <Billboard position-y={0.42}>
              <Label size={0.15}>{s}</Label>
            </Billboard>
          </Enter>
        ))}
        <mesh ref={token} material={M.peachGlow}>
          <sphereGeometry args={[0.1, 20, 14]} />
        </mesh>
        {/* her desk in the middle of the loop */}
        <Enter delay={0.2}>
          <RoundedBox args={[1.0, 0.06, 0.6]} radius={0.025} position={[0.2, 0.72, 0]} material={M.wood} />
          {[-0.2, 0.6].map((x) => (
            <mesh key={x} material={M.woodDark} position={[x, 0.35, 0]}>
              <boxGeometry args={[0.05, 0.7, 0.5]} />
            </mesh>
          ))}
          <group position={[0.3, 0.75, 0]} rotation-y={-Math.PI / 2}>
            <Laptop />
          </group>
        </Enter>
        <Enter delay={0.3} position={[-0.45, 0, 0]} rotation-y={Math.PI / 2}>
          <Chair />
          <Avatar motion={her} />
        </Enter>
        <Enter delay={0.6}>
          <AppScreen />
        </Enter>
      </group>
      <Enter delay={0.45} position={[2.55, 0, 0.1]} rotation-y={-Math.PI / 2 + 0.55}>
        <Person motion={client} shirt="#d9b08c" />
      </Enter>
      <group ref={review} position={[2.55, 2.55, 0.1]}>
        <Pill text={'client review ✓'} h={0.285} />
      </group>
    </>
  );
}

/* -------------------------------------------------------- 6 · servers */

const RACK_X = [-1.2, 0.3, 1.8];
const PICK_T = 2.6;

export function Servers() {
  const her = useHer('talk');
  const picked = useRef();
  const cards = useRef([]);
  const stamp = useRef();
  const halo = useRef();
  const specMats = useMemo(
    () => ({
      base: [1, 2, 3].map((l) => new THREE.MeshBasicMaterial({ map: specTexture(l), transparent: true, toneMapped: false, depthWrite: false })),
      pick: new THREE.MeshBasicMaterial({ map: specTexture(2, true), transparent: true, toneMapped: false, depthWrite: false }),
    }),
    [],
  );
  const stampMat = useMemo(() => new THREE.MeshBasicMaterial({ map: stampTexture(), transparent: true, toneMapped: false, depthWrite: false }), []);
  useChapterFrame(({ t, out }) => {
    const p = easeOut((t - PICK_T) / 0.6);
    picked.current.position.y = p * 0.12;
    halo.current.scale.setScalar(Math.max(0.0001, p * (1 - out)));
    cards.current.forEach((c, i) => {
      if (!c) return;
      c.material = i === 1 && p > 0.1 ? specMats.pick : specMats.base[i];
      // the others step back once one is chosen
      c.parent.scale.setScalar(i === 1 ? 1 + p * 0.08 : 1 - p * 0.12);
    });
    const s = clamp01((t - PICK_T - 0.5) / 0.45);
    stamp.current.scale.setScalar(Math.max(0.0001, (s > 0 ? 1.7 - 0.7 * easeOut(s) : 0) * (1 - out)));
    stamp.current.rotation.z = -0.06 - (1 - easeOut(s)) * 0.2;
  });
  return (
    <>
      {RACK_X.map((x, i) => (
        <Enter key={x} delay={0.15 + i * 0.15} position={[x, 0, -0.3]}>
          <group ref={i === 1 ? picked : undefined}>
            <Rack lit={i === 1 ? 1 : 0.3} />
          </group>
          <Enter delay={0.8 + i * 0.2} position={[0, 2.15, 0]}>
            <Billboard>
              <mesh ref={(el) => (cards.current[i] = el)} material={specMats.base[i]} renderOrder={10}>
                <planeGeometry args={[1.1, 0.76]} />
              </mesh>
              {i === 1 && (
                <mesh ref={stamp} material={stampMat} position={[0, 0.66, 0.01]} renderOrder={11}>
                  <planeGeometry args={[1.0, 0.333]} />
                </mesh>
              )}
            </Billboard>
          </Enter>
        </Enter>
      ))}
      <mesh ref={halo} material={M.glowDim} rotation-x={-Math.PI / 2} position={[RACK_X[1], 0.015, -0.3]}>
        <ringGeometry args={[0.62, 0.72, 64]} />
      </mesh>
      <Enter delay={0} position={[-2.55, 0, 0.85]} rotation-y={0.95}>
        <Avatar motion={her} />
      </Enter>
    </>
  );
}

/* ---------------------------------------------------- 7 · deployment */

const TERM_LINES = ['bench setup', 'bench migrate', 'go live'];
const LINE_T = [1.2, 2.0, 2.8];
const ONLINE_T = 3.3;

export function Deploy() {
  const her = useHer('sit');
  const term = useMemo(() => terminalTexture(TERM_LINES), []);
  const termMat = useMemo(() => new THREE.MeshBasicMaterial({ map: term.texture, transparent: true, toneMapped: false, depthWrite: false }), [term]);
  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.4, 1.05, 0), new THREE.Vector3(0.3, 2.5, 0), new THREE.Vector3(1.85, 1.45, -0.1)),
    [],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.018, 8, false), [curve]);
  const packets = useRef([]);
  const online = useRef();
  const rackRef = useRef();
  const tubeRef = useRef();
  useChapterFrame(({ t, out, now }) => {
    term.draw(LINE_T.filter((x) => t > x).length);
    const draw = easeInOut((t - 0.5) / 0.8);
    tubeRef.current.geometry.setDrawRange(0, Math.floor(draw * (1 - out) * tube.index.count / 6) * 6);
    packets.current.forEach((p, i) => {
      if (!p) return;
      const f = (now * 0.55 + i / 4) % 1;
      curve.getPointAt(f, p.position);
      p.scale.setScalar(Math.max(0.0001, smooth(1.0, 1.5, t) * Math.sin(f * Math.PI) * (1 - out)));
    });
    const o = clamp01((t - ONLINE_T) / 0.6);
    online.current.scale.setScalar(Math.max(0.0001, (o > 0 ? easeBack(o, 1.1) : 0) * (1 - out)));
  });
  return (
    <>
      {/* desk + her */}
      <Enter delay={0} position={[-1.75, 0, 0.1]}>
        <RoundedBox args={[0.95, 0.06, 0.6]} radius={0.025} position={[0.2, 0.72, 0]} material={M.wood} />
        {[-0.2, 0.6].map((x) => (
          <mesh key={x} material={M.woodDark} position={[x, 0.35, 0]}>
            <boxGeometry args={[0.05, 0.7, 0.5]} />
          </mesh>
        ))}
        <group position={[0.3, 0.75, 0]} rotation-y={-Math.PI / 2}>
          <Laptop />
        </group>
      </Enter>
      <Enter delay={0.15} position={[-2.2, 0, 0.1]} rotation-y={Math.PI / 2}>
        <Chair />
        <Avatar motion={her} />
      </Enter>
      {/* the server chosen in the previous chapter */}
      <Enter delay={0.25} position={[1.95, 0, -0.2]}>
        <group ref={rackRef}>
          <Rack lit={1} />
        </group>
      </Enter>
      {/* code travels as light packets */}
      <mesh ref={tubeRef} geometry={tube} material={M.glowDim} />
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(el) => (packets.current[i] = el)} material={M.peachGlow}>
          <sphereGeometry args={[0.065, 14, 10]} />
        </mesh>
      ))}
      <Enter delay={0.6} position={[0.15, 3.25, -0.4]}>
        <Billboard>
          <mesh material={termMat} renderOrder={10}>
            <planeGeometry args={[2.0, 0.94]} />
          </mesh>
        </Billboard>
      </Enter>
      <group ref={online} position={[1.95, 2.2, -0.2]}>
        <Pill text={'production: online'} h={0.314} />
      </group>
    </>
  );
}

