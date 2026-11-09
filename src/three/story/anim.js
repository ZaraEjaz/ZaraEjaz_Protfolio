import { createContext, useContext, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Chapter timing for story scenes. Every chapter mounts fresh; its elements read the
 * shared clock to ease in (staggered by `delay`) and to ease out when the chapter is left.
 * clock = { start, exitAt } in seconds of the R3F clock.
 */
export const ChapterClock = createContext({ start: 0, exitAt: null });
export const useChapterClock = () => useContext(ChapterClock);

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const easeOut = (t) => 1 - (1 - clamp01(t)) ** 3;
export const easeInOut = (t) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
/** Gentle overshoot for scale-ins (settles, never snaps). */
export const easeBack = (t, c = 1.25) => {
  const x = clamp01(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};
export const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const EXIT = 0.42; // seconds the outgoing chapter takes to clear

/** Seconds since this chapter started, and 0..1 exit progress (0 while showing). */
export function chapterTime(clock, now) {
  return { t: now - clock.start, out: clock.exitAt == null ? 0 : clamp01((now - clock.exitAt) / EXIT) };
}

/** Per-frame hook: calls fn({ t, out, now }) with this chapter's local time. */
export function useChapterFrame(fn) {
  const clock = useChapterClock();
  useFrame((state, delta) => {
    const { t, out } = chapterTime(clock, state.clock.elapsedTime);
    fn({ t, out, now: state.clock.elapsedTime, delta, state });
  });
}

/** Motion ref for her avatar in a chapter (pose: 'sit' | 'point' | 'talk' | null). */
export const useHer = (pose) => useRef({ walking: false, wave: false, pose });
