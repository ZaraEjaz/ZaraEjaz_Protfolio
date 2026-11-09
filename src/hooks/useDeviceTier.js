import { useMemo, useSyncExternalStore } from 'react';
import { useMediaQuery } from './useMediaQuery';

/*
 * WebGL support. The first render trusts the API being present: probing by creating a context costs
 * ~0.6 s of GPU-process start-up, which shouldn't sit on the initial load. The real check runs once,
 * right before the first 3D scene mounts (that scene would pay the start-up anyway). If it fails,
 * every subscriber re-renders with the static versions.
 */
let webgl = typeof window !== 'undefined' && ('WebGL2RenderingContext' in window || 'WebGLRenderingContext' in window);
let confirmed = false;
const listeners = new Set();

/** Creates (and immediately releases) a context once; returns whether WebGL really works. */
export function confirmWebGL() {
  if (confirmed) return webgl;
  confirmed = true;
  let ok = false;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    ok = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    ok = false;
  }
  if (!ok && webgl) {
    webgl = false;
    // notify after the current render
    queueMicrotask(() => listeners.forEach((l) => l()));
  }
  return webgl;
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const useWebGL = () => useSyncExternalStore(subscribe, () => webgl, () => false);

/**
 * How much 3D this device should get.
 *  'full'   — desktop-class: full scene, pointer interaction
 *  'lite'   — phones / small or weak devices: fewer nodes, no pointer tracking
 *  'static' — no WebGL or Save-Data: SVG poster only
 */
export function useDeviceTier() {
  const small = useMediaQuery('(max-width: 767px)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const gl = useWebGL();

  return useMemo(() => {
    if (!gl) return 'static';
    if (navigator.connection?.saveData) return 'static';
    const weak =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4);
    if (small || coarse || weak) return 'lite';
    return 'full';
  }, [small, coarse, gl]);
}
