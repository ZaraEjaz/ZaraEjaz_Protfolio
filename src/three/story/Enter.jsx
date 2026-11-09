import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { chapterTime, clamp01, easeBack, easeInOut, easeOut, useChapterClock } from './anim';

/**
 * Wraps children; eases them in after `delay` seconds: rising from `from` and scaling up.
 * On exit they sink and shrink a little faster, in reverse stagger.
 */
function Enter({ delay = 0, dur = 0.8, from = [0, -0.35, 0], grow = true, position = [0, 0, 0], children, ...rest }) {
  const ref = useRef();
  const clock = useChapterClock();
  useFrame(({ clock: c }) => {
    const { t, out } = chapterTime(clock, c.elapsedTime);
    const a = clamp01((t - delay) / dur);
    const leave = easeInOut(clamp01(out * 1.25 - Math.min(delay, 2) * 0.05));
    const v = easeOut(a) * (1 - leave);
    const g = ref.current;
    g.position.set(position[0] + from[0] * (1 - v), position[1] + from[1] * (1 - v), position[2] + from[2] * (1 - v));
    const s = grow ? (leave > 0 ? 1 - leave : easeBack(a)) : 1;
    g.scale.setScalar(Math.max(0.0001, s));
    g.visible = a > 0 && leave < 1;
  });
  return (
    <group ref={ref} position={position} visible={false} {...rest}>
      {children}
    </group>
  );
}

export default Enter;
