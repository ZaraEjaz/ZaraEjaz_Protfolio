/**
 * Cursor spotlight for cards. Every `.spot` inside a `.spot-group` gets --mx/--my relative to
 * itself, so the hovered card glows under the cursor and its neighbours' borders pick up the
 * light at their nearest edge (CSS in sections.css).
 */
export function initSpotlight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  let frame = 0;
  let last = null;
  const update = () => {
    frame = 0;
    const e = last;
    const group = e.target.closest?.('.spot-group');
    if (!group) return;
    for (const card of group.querySelectorAll('.spot')) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }
  };
  const move = (e) => {
    last = e;
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener('pointermove', move, { passive: true });
  return () => {
    window.removeEventListener('pointermove', move);
    cancelAnimationFrame(frame);
  };
}
