import { useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import Avatar from '../journey/Avatar';
import Person from './Person';
import { M } from './materials';
import Enter from './Enter';
import { Block, Chair, Flow, Label, Panel, Rack, Pill } from './props';
import { clamp01, easeBack, easeInOut, useChapterFrame, useHer } from './anim';

/* Abidi Solutions story: one chapter per CV bullet. Screen-aligned coordinates. */

const v = (x, y, z) => new THREE.Vector3(x, y, z);
const arc = (a, mid, b) => new THREE.QuadraticBezierCurve3(v(...a), v(...mid), v(...b));

function Stand({ y, children }) {
  return (
    <>
      <mesh material={M.woodDark} position-y={y / 2}>
        <cylinderGeometry args={[0.03, 0.03, y, 8]} />
      </mesh>
      <mesh material={M.woodDark} position-y={0.02}>
        <cylinderGeometry args={[0.24, 0.24, 0.04, 20]} />
      </mesh>
      <group position-y={y}>{children}</group>
    </>
  );
}

/* --------------------------------------------------------- 1 · Figma */

// where the cursor goes while she sketches the two artboards (panel-local)
const PATH = [
  [-0.2, 0.55],
  [-0.95, 0.28],
  [-0.2, 0.0],
  [0.25, -0.3],
  [0.95, 0.3],
  [0.95, -0.2],
  [0.55, -0.45],
];

function Cursor() {
  const ref = useRef();
  useChapterFrame(({ t, out }) => {
    const f = clamp01((t - 0.8) / 2.6) * (PATH.length - 1);
    const i = Math.min(PATH.length - 2, Math.floor(f));
    const k = easeInOut(f - i);
    ref.current.position.set(PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * k, PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * k, 0.06);
    ref.current.scale.setScalar(Math.max(0.0001, clamp01((t - 0.7) / 0.3) * (1 - out)));
  });
  return (
    <mesh ref={ref} material={M.peachGlow} rotation-z={0.5}>
      <coneGeometry args={[0.055, 0.16, 3]} />
    </mesh>
  );
}

export function Design() {
  const her = useHer('point');
  return (
    <>
      <Enter delay={0} position={[0.55, 0, -0.6]}>
        <Stand y={1.45}>
          <Panel w={2.9} h={1.75} face={M.canvas}>
            {/* desktop artboard */}
            <Block x={-0.45} y={0.0} w={1.45} h={1.0} at={0.8} material={M.artboard} />
            <Block x={-0.45} y={0.38} w={1.25} h={0.1} at={1.3} material={M.tealSolid} />
            <Block x={-0.75} y={0.08} w={0.6} h={0.36} at={1.6} material={M.peachSolid} />
            <Block x={-0.08} y={0.14} w={0.5} h={0.07} at={1.8} material={M.chip} />
            <Block x={-0.45} y={-0.3} w={1.25} h={0.18} at={2.0} material={M.chip} />
            {/* phone artboard */}
            <Block x={0.9} y={-0.05} w={0.5} h={0.95} at={2.3} material={M.artboard} />
            <Block x={0.9} y={0.3} w={0.4} h={0.08} at={2.6} material={M.tealSolid} />
            <Block x={0.9} y={0.05} w={0.4} h={0.3} at={2.8} material={M.peachSolid} />
            <Block x={0.9} y={-0.28} w={0.4} h={0.18} at={3.0} material={M.chip} />
            <Cursor />
          </Panel>
        </Stand>
      </Enter>
      <Enter delay={0.15} position={[-1.85, 0, 0.35]} rotation-y={0.55}>
        <Avatar motion={her} />
      </Enter>
    </>
  );
}

/* ------------------------------------------------------ 2 · Figma → code */

export function Build() {
  const her = useHer('talk');
  const toWeb = useMemo(() => arc([-1.25, 1.4, -0.4], [-0.4, 2.55, -0.55], [0.3, 1.6, -0.6]), []);
  const toPhone = useMemo(() => arc([-1.25, 1.25, -0.4], [0.9, 2.5, -0.25], [2.15, 1.2, 0.15]), []);
  return (
    <>
      <Enter delay={0} position={[-1.85, 0, -0.4]}>
        <Stand y={1.2}>
          <Panel w={1.25} h={0.95} face={M.canvas}>
            <Block x={-0.18} y={0.02} w={0.62} h={0.55} at={0.4} material={M.artboard} />
            <Block x={0.38} y={0.0} w={0.26} h={0.5} at={0.55} material={M.artboard} />
          </Panel>
        </Stand>
      </Enter>
      <Flow curve={toWeb} from={1.0} speed={0.45} />
      <Flow curve={toPhone} from={1.2} speed={0.45} />
      <Enter delay={0.35} position={[1.05, 0, -0.6]}>
        <Stand y={1.4}>
          <Panel w={1.6} h={1.05}>
            <Block x={0} y={0.32} w={1.4} h={0.09} at={1.6} material={M.tealSolid} />
            <Block x={-0.32} y={0.04} w={0.72} h={0.34} at={1.8} material={M.peachSolid} />
            <Block x={0.4} y={0.1} w={0.52} h={0.07} at={1.95} />
            <Block x={0} y={-0.26} w={1.4} h={0.16} at={2.1} />
          </Panel>
        </Stand>
      </Enter>
      <Enter delay={0.5} position={[2.4, 0, 0.15]}>
        <Stand y={0.95}>
          <Panel w={0.55} h={1.0}>
            <Block x={0} y={0.32} w={0.44} h={0.07} at={2.0} material={M.tealSolid} />
            <Block x={0} y={0.1} w={0.44} h={0.26} at={2.15} material={M.peachSolid} />
            <Block x={0} y={-0.18} w={0.44} h={0.2} at={2.3} />
          </Panel>
        </Stand>
      </Enter>
      <Enter delay={0.2} position={[-0.45, 0, 1.45]} rotation-y={0.3}>
        <Avatar motion={her} />
      </Enter>
    </>
  );
}

/* --------------------------------------------------- 3 · Redux + APIs */

const COMPONENTS = [
  [-2.45, 0, -0.25],
  [-1.3, 0, -1.55],
  [0.4, 0, -1.75],
];
const STORE = [-0.35, 0, 0.15];

export function State() {
  const her = useHer('talk');
  const toComp = useMemo(
    () => COMPONENTS.map(([x, , z]) => arc([STORE[0], 0.9, STORE[2]], [(x + STORE[0]) / 2, 1.45, (z + STORE[2]) / 2], [x, 0.95, z])),
    [],
  );
  const api = useMemo(() => arc([0.1, 0.9, 0.15], [1.0, 1.8, 0.0], [1.75, 1.2, -0.2]), []);
  return (
    <>
      <Enter delay={0} position={STORE}>
        <mesh material={M.node} position-y={0.2}>
          <cylinderGeometry args={[0.55, 0.6, 0.4, 32]} />
        </mesh>
        <RoundedBox args={[0.62, 0.62, 0.62]} radius={0.08} position-y={0.72} material={M.peachSolid} />
        <Label position={[0, 0.72, 0.32]} size={0.12} color="#0e1a1a">
          store
        </Label>
      </Enter>
      {COMPONENTS.map((p, i) => (
        <Enter key={i} delay={0.4 + i * 0.15} position={p}>
          <Stand y={0.95}>
            <Panel w={0.7} h={0.5}>
              <Block x={0} y={0.08} w={0.56} h={0.07} at={1.1 + i * 0.15} material={M.tealSolid} />
              <Block x={0} y={-0.06} w={0.56} h={0.12} at={1.2 + i * 0.15} />
            </Panel>
          </Stand>
        </Enter>
      ))}
      {toComp.map((c, i) => (
        <Flow key={i} curve={c} from={1.2 + i * 0.15} count={2} speed={0.55} material={M.glow} />
      ))}
      <Enter delay={0.7} position={[2.15, 0, -0.2]}>
        <Rack lit={1} />
        <Label position={[0, 1.8, 0]} size={0.13}>
          API
        </Label>
      </Enter>
      {/* real-time: data both ways */}
      <Flow curve={api} from={1.6} speed={0.6} />
      <Flow curve={api} from={1.8} speed={0.6} reverse line={false} material={M.glow} />
      <Enter delay={0.2} position={[1.0, 0, 1.8]} rotation-y={-0.3}>
        <Avatar motion={her} />
      </Enter>
    </>
  );
}

/* ---------------------------------------------------- 4 · Agile team */

/** Project boxes land on a stack one after another. */
function Shipped({ i, at }) {
  const ref = useRef();
  useChapterFrame(({ t, out }) => {
    const a = clamp01((t - at) / 0.7);
    const e = 1 - (1 - a) ** 3;
    ref.current.position.set(-1.6 * (1 - e), 0.13 + i * 0.27 + Math.sin(a * Math.PI) * 0.9, 0.9 * (1 - e));
    ref.current.scale.setScalar(Math.max(0.0001, (a > 0 ? 1 : 0) * (1 - out)));
  });
  return (
    <group ref={ref}>
      <RoundedBox args={[0.55, 0.25, 0.45]} radius={0.04} material={i % 2 ? M.tan : M.tealSolid} />
      <mesh material={M.peachSolid} position-y={0.126}>
        <boxGeometry args={[0.08, 0.005, 0.46]} />
      </mesh>
    </group>
  );
}

export function Team() {
  const her = useHer('sit');
  const mates = [useRef({ pose: 'sit', talk: false }), useRef({ pose: 'sit', talk: false })];
  const pill = useRef();
  useChapterFrame(({ t, out }) => {
    mates[0].current.talk = t > 0.8 && t < 1.8;
    mates[1].current.talk = t > 1.9 && t < 2.8;
    const a = clamp01((t - 3.0) / 0.6);
    pill.current.scale.setScalar(Math.max(0.0001, (a < 1 ? easeBack(a, 1.1) : 1) * (1 - out)));
  });
  return (
    <>
      <Enter delay={0} position={[-0.4, 0, -0.1]}>
        <mesh material={M.wood} position-y={0.75}>
          <cylinderGeometry args={[0.85, 0.85, 0.06, 48]} />
        </mesh>
        <mesh material={M.woodDark} position-y={0.37}>
          <cylinderGeometry args={[0.06, 0.06, 0.74, 10]} />
        </mesh>
        <mesh material={M.woodDark} position-y={0.02}>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 24]} />
        </mesh>
      </Enter>
      <Enter delay={0.12} position={[-1.45, 0, 0.0]} rotation-y={Math.PI / 2 - 0.2}>
        <Chair />
        <Avatar motion={her} />
      </Enter>
      <Enter delay={0.24} position={[0.65, 0, -0.25]} rotation-y={-Math.PI / 2 + 0.25}>
        <Chair />
        <Person motion={mates[0]} shirt="#3d6e6a" hair="#3b2a20" skin="#b98263" />
      </Enter>
      <Enter delay={0.36} position={[-0.45, 0, -1.15]} rotation-y={0.1}>
        <Chair />
        <Person motion={mates[1]} shirt="#8a6f9e" hair="#151515" skin="#d9a982" />
      </Enter>
      <group position={[1.95, 0, 0.75]}>
        {[0, 1, 2].map((i) => (
          <Shipped key={i} i={i} at={1.0 + i * 0.6} />
        ))}
        <group ref={pill} position-y={1.45}>
          <Pill text={'projects delivered ✓'} h={0.344} />
        </group>
      </group>
    </>
  );
}
