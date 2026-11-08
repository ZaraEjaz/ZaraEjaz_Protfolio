import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * How much 3D this device should get.
 *  'full'   — desktop-class: full scene, pointer interaction
 *  'lite'   — phones / small or weak devices: fewer nodes, no pointer tracking
 *  'static' — no WebGL or Save-Data: SVG poster only
 */
export function useDeviceTier() {
  const small = useMediaQuery('(max-width: 767px)');
  const coarse = useMediaQuery('(pointer: coarse)');

  return useMemo(() => {
    if (typeof window === 'undefined') return 'static';
    const conn = navigator.connection;
    if (conn?.saveData || !hasWebGL()) return 'static';
    const weak =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4);
    if (small || coarse || weak) return 'lite';
    return 'full';
  }, [small, coarse]);
}
