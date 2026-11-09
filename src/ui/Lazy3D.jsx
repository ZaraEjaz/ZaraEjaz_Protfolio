import { lazy, Suspense, useEffect, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { useDeviceTier } from '../hooks/useDeviceTier';
import SceneBoundary from './SceneBoundary';

const BlobScene = lazy(() => import('../three/BlobScene'));
const ModuleAccent = lazy(() => import('../three/ModuleAccent'));
const DeskScene = lazy(() => import('../three/desk/DeskScene'));

/**
 * Waits until `after` is true, then `delay` ms, then an idle moment — so a heavy scene doesn't
 * compete with the page's first paint and intro animation. Without `delay`, opens immediately.
 */
function useDeferred(delay, after) {
  const [open, setOpen] = useState(!delay);
  useEffect(() => {
    if (!delay || !after) return;
    let idle;
    const timer = setTimeout(() => {
      const ric = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1));
      idle = ric(() => setOpen(true), { timeout: 1500 });
    }, delay);
    return () => {
      clearTimeout(timer);
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(idle);
    };
  }, [delay, after]);
  return open;
}

/**
 * Mounts a 3D view only once it's near the viewport, pauses it when off-screen,
 * and fades it in when its first frame is ready. `fallback` shows meanwhile / without WebGL.
 * `delay` + `after`: defer mounting (see useDeferred), e.g. for the hero scene.
 */
export default function Lazy3D({ kind, variant, className = '', fallback = null, enabled = true, delay = 0, after = true }) {
  const [ref, seen, visible] = useInView();
  const reduced = useReducedMotion();
  const tier = useDeviceTier();
  const [ready, setReady] = useState(false);
  const can = enabled && tier !== 'static';
  const open = useDeferred(delay, after);
  const onReady = () => setReady(true);

  return (
    <div ref={ref} className={`lazy3d ${ready ? 'is-ready' : ''} ${className}`} aria-hidden="true">
      {(!can || !ready) && <div className="lazy3d-fallback">{fallback}</div>}
      {can && seen && open && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <div className="lazy3d-canvas">
              {kind === 'desk' ? (
                <DeskScene active={visible} lite={tier === 'lite'} reduced={reduced} onReady={onReady} />
              ) : kind === 'blob' ? (
                <BlobScene variant={variant} active={visible} lite={tier === 'lite'} reduced={reduced} onReady={onReady} />
              ) : (
                <ModuleAccent active={visible} reduced={reduced} onReady={onReady} />
              )}
            </div>
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
