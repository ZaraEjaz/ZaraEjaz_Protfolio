import { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import Avatar from '../journey/Avatar';
import { M } from './materials';
import Enter from './Enter';
import { Blueprint, Label, Tree, Pill } from './props';
import { easeInOut, useChapterFrame, useHer } from './anim';
import { PEACH } from '../palette';

/* Bahria University story: CV facts only (degree, Sep 2022 – Jun 2026). Screen-aligned coordinates. */

/* ------------------------------------------------------- 1 · enrolled */

/** Flat roof with an overhang and a lit edge. */
function Roof({ len, d }) {
  return (
    <group>
      <RoundedBox args={[len, 0.12, d]} radius={0.03} position-y={0.06} material={M.roofLight} />
      <mesh material={M.glow} position={[0, 0.06, d / 2 + 0.002]}>
        <planeGeometry args={[len - 0.1, 0.025]} />
      </mesh>
    </group>
  );
}

export function Campus() {
  const her = useHer(null);
  useChapterFrame(({ t }) => {
    her.current.walking = t > 0.5 && t < 1.7; // she walks up to the building
  });
  return (
    <>
      <Enter delay={0} position={[0.45, 0, -0.6]}>
        <RoundedBox args={[3.0, 1.35, 1.2]} radius={0.04} position-y={0.675} material={M.campus} />
        {[-1.15, -0.65, 0.65, 1.15].map((x) => (
          <mesh key={x} material={M.glowDim} position={[x, 0.75, 0.605]}>
            <planeGeometry args={[0.34, 0.42]} />
          </mesh>
        ))}
        <mesh material={M.roof} position={[0, 0.42, 0.605]}>
          <planeGeometry args={[0.52, 0.84]} />
        </mesh>
        <RoundedBox args={[1.1, 0.06, 0.4]} radius={0.02} position={[0, 0.03, 0.78]} material={M.slab} />
        <group position={[0, 1.08, 0.63]}>
          <RoundedBox args={[1.25, 0.24, 0.04]} radius={0.02} material={M.screenFrame} />
          <Label position-z={0.03} size={0.085}>
            BAHRIA UNIVERSITY
          </Label>
        </group>
      </Enter>
      <Enter delay={0.3} dur={0.9} grow={false} from={[0, 0.7, 0]} position={[0.45, 1.35, -0.6]}>
        <Roof len={3.3} d={1.45} />
      </Enter>
      <Enter delay={0.62} position={[2.55, 0, 0.35]}>
        <Tree />
      </Enter>
      <Enter delay={0.5} dur={1.2} grow={false} from={[-1.1, 0, 0.2]} position={[-1.45, 0, 0.95]} rotation-y={1.15}>
        <Avatar motion={her} />
      </Enter>
      <Enter delay={1.8} dur={0.7} position={[-1.45, 2.75, 0.95]}>
        <Pill text={'Sep 2022'} h={0.206} />
      </Enter>
    </>
  );
}

/* ---------------------------------------------- 2 · studying while working */

// Years → x on the timeline (blueprint-local). Dates are from the CV.
const T0 = 2022.6;
const T1 = 2026.6;
const X0 = -0.95;
const X1 = 2.1;
const xOf = (t) => X0 + ((t - T0) / (T1 - T0)) * (X1 - X0);
const LANES = [
  { label: 'degree', from: 2022.67, to: 2026.42, mat: 'tealSolid', at: 0.6, dur: 1.3 }, // Sep 2022 – Jun 2026
  { label: 'Quantaflix', from: 2024.0, to: 2025.42, mat: 'tan', at: 1.9 }, // Jan 2024 – Jun 2025
  { label: 'Abidi', from: 2025.25, to: 2025.5, mat: 'tan', at: 2.3 }, // Apr 2025 – Jul 2025
  { label: 'TRPL', from: 2026.08, to: T1, mat: 'peachSolid', at: 2.7 }, // Feb 2026 – present
];
const LANE_Z = (i) => -0.58 + i * 0.48;

/** A bar that grows from its start date to its end date. */
function Bar({ from, to, z, mat, at, dur = 0.7 }) {
  const ref = useRef();
  const w = xOf(to) - xOf(from);
  useChapterFrame(({ t, out }) => {
    ref.current.scale.x = Math.max(0.0001, easeInOut((t - at) / dur) * (1 - out));
  });
  return (
    <group ref={ref} position={[xOf(from), 0.08, z]}>
      <RoundedBox args={[w, 0.12, 0.36]} radius={0.04} position={[w / 2, 0.06, 0]} material={M[mat]} />
    </group>
  );
}

export function Overlap() {
  const her = useHer('talk');
  return (
    <>
      <Enter delay={0} grow={false} from={[0, -0.2, 0]}>
        <Blueprint x={0.15}>
          {[2023, 2024, 2025, 2026].map((y, i) => (
            <Enter key={y} delay={0.3 + i * 0.08} position={[xOf(y), 0.09, -0.92]}>
              <Label rotation-x={-Math.PI / 2} size={0.12} color={PEACH}>
                {String(y)}
              </Label>
            </Enter>
          ))}
          {LANES.map((l, i) => (
            <group key={l.label}>
              <Enter delay={0.25 + i * 0.12} position={[-1.65, 0.08, LANE_Z(i)]}>
                <RoundedBox args={[0.95, 0.14, 0.4]} radius={0.04} position-y={0.07} material={M.node} />
                <Label position={[0, 0.145, 0]} rotation-x={-Math.PI / 2} size={0.12}>
                  {l.label}
                </Label>
              </Enter>
              <Bar from={l.from} to={l.to} z={LANE_Z(i)} mat={l.mat} at={l.at} dur={l.dur} />
            </group>
          ))}
        </Blueprint>
      </Enter>
      <Enter delay={0.15} position={[-2.85, 0, 0.9]} rotation-y={0.75}>
        <Avatar motion={her} />
      </Enter>
    </>
  );
}

/* --------------------------------------------------------- 3 · the degree */

export function Degree() {
  const her = useHer('talk');
  const cap = useRef();
  useChapterFrame(({ now }) => {
    cap.current.rotation.y = Math.PI / 4 + Math.sin(now * 0.6) * 0.25;
  });
  return (
    <>
      <Enter delay={0} position={[0.3, 0, -0.2]}>
        <mesh material={M.node} position-y={0.3}>
          <cylinderGeometry args={[0.72, 0.8, 0.6, 48]} />
        </mesh>
        <mesh material={M.glow} position-y={0.605} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.6, 0.66, 64]} />
        </mesh>
      </Enter>
      {/* mortarboard drops onto the pedestal */}
      <Enter delay={0.5} dur={1.0} grow={false} from={[0, 1.4, 0]} position={[0.3, 0.6, -0.2]}>
        <group ref={cap}>
          <mesh material={M.screenFrame} position-y={0.13}>
            <cylinderGeometry args={[0.3, 0.32, 0.26, 24]} />
          </mesh>
          <RoundedBox args={[0.95, 0.05, 0.95]} radius={0.015} position-y={0.29} material={M.screenFrame} />
          <mesh material={M.peachGlow} position={[0.4, 0.17, 0.4]}>
            <cylinderGeometry args={[0.018, 0.018, 0.24, 6]} />
          </mesh>
        </group>
      </Enter>
      {/* rolled diploma with a peach ribbon */}
      <Enter delay={1.0} position={[0.45, 0.68, 0.35]} rotation-y={-0.3}>
        <mesh material={M.paper} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.07, 0.07, 0.75, 16]} />
        </mesh>
        <mesh material={M.peachSolid} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.075, 0.018, 8, 20]} />
        </mesh>
      </Enter>
      {/* a stack of books */}
      {[
        ['tealSolid', 0.0],
        ['tan', 0.17],
        ['peachSolid', 0.34],
      ].map(([m, y], i) => (
        <Enter key={m} delay={0.7 + i * 0.15} from={[0, 0.5, 0]} position={[1.75, y + 0.08, 0.35]} rotation-y={i * 0.25 - 0.2}>
          <RoundedBox args={[0.75, 0.16, 0.52]} radius={0.03} material={M[m]} />
        </Enter>
      ))}
      <Enter delay={0.2} position={[-1.55, 0, 0.6]} rotation-y={0.65}>
        <Avatar motion={her} />
      </Enter>
      <Enter delay={1.6} dur={0.7} position={[0.3, 2.35, -0.2]}>
        <Pill text={'Sep 2022 – Jun 2026'} h={0.344} />
      </Enter>
    </>
  );
}
