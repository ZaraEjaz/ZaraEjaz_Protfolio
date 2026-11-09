import { useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import Avatar from '../journey/Avatar';
import Person from './Person';
import { M } from './materials';
import Enter from './Enter';
import { Block, Chair, Database, Desk, Flow, Label, Panel, Pill } from './props';
import { easeBack, clamp01, useChapterFrame, useHer } from './anim';

/* Quantaflix story: one chapter per CV bullet. Screen-aligned coordinates. */

const v = (x, y, z) => new THREE.Vector3(x, y, z);
const arc = (a, mid, b) => new THREE.QuadraticBezierCurve3(v(...a), v(...mid), v(...b));

/** Panel on a slim stand; `y` is the panel centre. */
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

/** A Card that eases in at `at` seconds. */
function PopCard({ at, children, ...p }) {
  const ref = useRef();
  useChapterFrame(({ t, out }) => {
    const a = clamp01((t - at) / 0.6);
    ref.current.scale.setScalar(Math.max(0.0001, (a < 1 ? easeBack(a, 1.1) : 1) * (1 - out)));
  });
  return (
    <group ref={ref} {...p}>
      {children}
    </group>
  );
}

/* ------------------------------------------------- 1 · full-stack apps */

export function Apps() {
  const her = useHer('sit');
  return (
    <>
      <Enter delay={0} position={[-2.0, 0, 0.45]}>
        <Desk />
      </Enter>
      <Enter delay={0.12} position={[-2.45, 0, 0.45]} rotation-y={Math.PI / 2}>
        <Chair />
        <Avatar motion={her} />
      </Enter>
      {/* desktop browser */}
      <Enter delay={0.3} position={[0.65, 0, -0.55]}>
        <Stand y={1.4}>
          <Panel w={2.3} h={1.5}>
            <Block x={0} y={0.5} w={2.05} h={0.12} at={0.9} material={M.tealSolid} />
            <Block x={-0.45} y={0.17} w={1.1} h={0.42} at={1.15} material={M.peachSolid} />
            <Block x={0.62} y={0.3} w={0.78} h={0.08} at={1.35} />
            <Block x={0.52} y={0.14} w={0.58} h={0.08} at={1.45} />
            {[-0.68, 0, 0.68].map((x, i) => (
              <Block key={x} x={x} y={-0.36} w={0.6} h={0.42} at={1.6 + i * 0.12} />
            ))}
          </Panel>
        </Stand>
      </Enter>
      {/* the same layout, responsive on a phone */}
      <Enter delay={1.9} position={[2.5, 0, 0.35]}>
        <Stand y={0.95}>
          <Panel w={0.62} h={1.1}>
            <Block x={0} y={0.36} w={0.5} h={0.07} at={2.3} material={M.tealSolid} />
            <Block x={0} y={0.16} w={0.5} h={0.26} at={2.45} material={M.peachSolid} />
            <Block x={0} y={-0.1} w={0.5} h={0.18} at={2.6} />
            <Block x={0} y={-0.32} w={0.5} h={0.18} at={2.7} />
          </Panel>
        </Stand>
      </Enter>
    </>
  );
}

/* ---------------------------------------------------- 2 · APIs + MySQL */

export function Data() {
  const her = useHer('talk');
  const toApi = useMemo(() => arc([-1.1, 1.0, -0.25], [-0.6, 1.6, -0.2], [-0.15, 0.62, -0.1]), []);
  const toDb = useMemo(() => arc([0.45, 0.62, -0.1], [1.0, 1.6, -0.2], [1.55, 1.05, -0.25]), []);
  return (
    <>
      <Enter delay={0} position={[-1.75, 0, -0.25]}>
        <Stand y={1.15}>
          <Panel w={1.2} h={0.85}>
            <Block x={0} y={0.24} w={1.0} h={0.08} at={0.5} material={M.tealSolid} />
            <Block x={-0.2} y={0.02} w={0.6} h={0.24} at={0.65} material={M.peachSolid} />
            <Block x={0} y={-0.2} w={1.0} h={0.1} at={0.8} />
          </Panel>
        </Stand>
      </Enter>
      <Enter delay={0.3} position={[0.15, 0, -0.1]}>
        <RoundedBox args={[0.95, 0.55, 0.6]} radius={0.06} position-y={0.275} material={M.node} />
        <mesh material={M.glow} position-y={0.555}>
          <boxGeometry args={[0.8, 0.012, 0.46]} />
        </mesh>
        <Label position={[0, 0.28, 0.305]} size={0.12}>
          REST API
        </Label>
      </Enter>
      <Enter delay={0.5} position={[1.95, 0, -0.25]}>
        <Database />
        <Label position={[0, 0.6, 0.52]} size={0.12}>
          MySQL
        </Label>
      </Enter>
      {/* requests out (peach), responses back (teal) */}
      <Flow curve={toApi} from={1.0} />
      <Flow curve={toApi} from={1.3} reverse line={false} material={M.glow} />
      <Flow curve={toDb} from={1.4} />
      <Flow curve={toDb} from={1.7} reverse line={false} material={M.glow} />
      <Enter delay={0.15} position={[-2.75, 0, 1.0]} rotation-y={0.7}>
        <Avatar motion={her} />
      </Enter>
    </>
  );
}

/* ---------------------------------------------------- 3 · SaaS platform */

const TENANTS = [
  [-1.35, 0, -1.95],
  [2.4, 0, -0.75],
  [2.25, 0, 1.15],
];

export function Saas() {
  const her = useHer('talk');
  const links = useMemo(
    () => TENANTS.map(([x, , z]) => arc([x * 0.82, 0.75, z * 0.82], [x * 0.5, 1.5, z * 0.5], [x * 0.25, 0.4, z * 0.25])),
    [],
  );
  return (
    <>
      <Enter delay={0} position={[0, 0, -0.1]}>
        <mesh material={M.node} position-y={0.14}>
          <cylinderGeometry args={[1.05, 1.12, 0.28, 48]} />
        </mesh>
        <mesh material={M.glow} position-y={0.285} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.92, 0.98, 64]} />
        </mesh>
        <group position-y={0.28}>
          <Stand y={1.05}>
            <Panel w={1.8} h={1.15}>
              <Block x={0} y={0.36} w={1.6} h={0.1} at={0.6} material={M.tealSolid} />
              {[-0.55, 0, 0.55].map((x, i) => (
                <Block key={x} x={x} y={0.13} w={0.48} h={0.22} at={0.8 + i * 0.12} material={i === 1 ? M.peachSolid : M.chip} />
              ))}
              {[0.9, 1.25, 0.7, 1.4].map((w, i) => (
                <Block key={i} x={-0.78 + w / 2} y={-0.14 - i * 0.1} w={w} h={0.06} at={1.2 + i * 0.1} material={M.glowDim} />
              ))}
            </Panel>
          </Stand>
        </group>
      </Enter>
      <Enter delay={1.6} position={[0, 2.55, -0.1]}>
        <Pill text={'SaaS platform'} h={0.265} />
      </Enter>
      {/* people using the platform */}
      {TENANTS.map((p, i) => (
        <Enter key={i} delay={0.9 + i * 0.2} position={p}>
          <Stand y={0.7}>
            <Panel w={0.62} h={0.44}>
              <Block x={0} y={0.06} w={0.5} h={0.06} at={1.3 + i * 0.2} material={M.tealSolid} />
              <Block x={0} y={-0.06} w={0.5} h={0.1} at={1.4 + i * 0.2} />
            </Panel>
          </Stand>
        </Enter>
      ))}
      {links.map((c, i) => (
        <Flow key={i} curve={c} from={1.5 + i * 0.2} count={2} speed={0.4} />
      ))}
      <Enter delay={0.2} position={[-1.85, 0, 1.15]} rotation-y={0.55}>
        <Avatar motion={her} />
      </Enter>
    </>
  );
}

/* --------------------------------------------------------- 4 · mentoring */

const CODE = [
  [0.0, 1.2, 'chip'],
  [0.15, 0.9, 'chip'],
  [0.15, 1.05, 'tealSolid'],
  [0.15, 0.75, 'tealSolid'],
  [0.0, 1.3, 'chip'],
  [0.15, 0.85, 'peachSolid'],
  [0.0, 0.6, 'chip'],
];

export function Mentor() {
  const her = useHer('point');
  const juniors = [useRef({ pose: 'sit', talk: false }), useRef({ pose: 'sit', talk: false })];
  useChapterFrame(({ t }) => {
    juniors[0].current.talk = t > 2.4 && t < 3.2;
  });
  return (
    <>
      <Enter delay={0} position={[-0.25, 0, -0.85]}>
        <Stand y={1.45}>
          <Panel w={2.2} h={1.45}>
            {CODE.map(([indent, w, m], i) => (
              <Block key={i} x={-0.9 + indent + w / 2} y={0.45 - i * 0.14} w={w} h={0.07} at={0.6 + i * 0.12} material={M[m]} />
            ))}
          </Panel>
        </Stand>
      </Enter>
      <PopCard at={2.2} position={[0.9, 2.45, -0.85]}>
        <Pill text={'code review ✓'} h={0.285} />
      </PopCard>
      <Enter delay={0.15} position={[-1.85, 0, -0.15]} rotation-y={0.75}>
        <Avatar motion={her} />
      </Enter>
      <Enter delay={0.3} position={[1.65, 0, 0.45]} rotation-y={-2.25}>
        <Chair />
        <Person motion={juniors[0]} shirt="#3d6e6a" hair="#3b2a20" skin="#b98263" />
      </Enter>
      <Enter delay={0.42} position={[0.55, 0, 1.2]} rotation-y={-2.75}>
        <Chair />
        <Person motion={juniors[1]} shirt="#8a6f9e" hair="#151515" skin="#d9a982" />
      </Enter>
    </>
  );
}
