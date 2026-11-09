import { lazy, Suspense, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { useDeviceTier } from '../hooks/useDeviceTier';

const BlobScene = lazy(() => import('../three/BlobScene'));
const ModuleAccent = lazy(() => import('../three/ModuleAccent'));
const DeskScene = lazy(() => import('../three/desk/DeskScene'));

/**
 * Mounts a 3D view only once it's near the viewport, pauses it when off-screen,
 * and fades it in when its first frame is ready. `fallback` shows meanwhile / without WebGL.
 */
export default function Lazy3D({ kind, variant, className = '', fallback = null, enabled = true }) {
  const [ref, seen, visible] = useInView();
  const reduced = useReducedMotion();
  const tier = useDeviceTier();
  const [ready, setReady] = useState(false);
  const can = enabled && tier !== 'static';
  const onReady = () => setReady(true);

  return (
    <div ref={ref} className={`lazy3d ${ready ? 'is-ready' : ''} ${className}`} aria-hidden="true">
      {(!can || !ready) && <div className="lazy3d-fallback">{fallback}</div>}
      {can && seen && (
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
      )}
    </div>
  );
}
