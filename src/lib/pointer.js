/** Window-level pointer in NDC (-1..1, y up). Read in useFrame without re-renders. */
export const pointer = { x: 0, y: 0, active: false };

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.active = e.pointerType === 'mouse';
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => (pointer.active = false));
}
