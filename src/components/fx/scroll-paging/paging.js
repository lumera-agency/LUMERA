/*
 * Scroll paging: inside a pinned stretch of the page, one wheel gesture glides to the next stop
 * (through Lenis) and the rest of that gesture, the trackpad's momentum included, is swallowed.
 * Coming from above or below, the scroll lands softly on the first or the last stop; one more
 * gesture past them and the page goes on as usual. The keyboard and the scrollbar scroll freely,
 * and a scroll that rests between two stops settles on the nearer one. Wheel events are caught
 * before Lenis sees them (capture on window; Lenis skips an event marked `lenisStopPropagation`).
 *
 *   const paging = initPaging({ stops: () => [y0, y1, y2], sideways: true, busy: () => skipping });
 *   paging.destroy();
 *
 * A new gesture is told from a tail by the pushes: after a pause or a turn of direction, or while
 * they hold or grow (a wheel spun on, a fresh swipe); pushes that fade are momentum (fullPage.js).
 */
import { getLenis, scrollToY } from '@/lib/scroll';

const EDGE = 2;
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const mean = (list) => list.reduce((sum, value) => sum + value, 0) / (list.length || 1);

/**
 * @param {object} o
 * @param {() => number[]} o.stops   scroll positions to stop at, ascending (read on every event)
 * @param {boolean} [o.sideways]     a sideways swipe inside turns too
 * @param {() => boolean} [o.busy]   while true every wheel event is swallowed (a scripted move runs)
 * @param {number} [o.duration]      s, one glide
 */
export function initPaging({ stops, sideways = false, busy = () => false, duration = 1 }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paging = false;
  let armed = true;
  let lastWheel = 0;
  let lastDir = 0;
  const pushes = [];

  const swallow = (e) => {
    if (e.cancelable) e.preventDefault();
    e.lenisStopPropagation = true;
  };
  const glideTo = (y) => {
    const lenis = getLenis();
    paging = true;
    armed = false;
    const done = () => { paging = false; };
    if (lenis) lenis.scrollTo(y, { duration, easing: inOut, lock: true, force: true, onComplete: done });
    else {
      window.scrollTo({ top: y, behavior: reducedMotion ? 'auto' : 'smooth' });
      setTimeout(done, reducedMotion ? 0 : duration * 900);
    }
  };

  const onWheel = (e) => {
    if (e.ctrlKey || e.lenisStopPropagation) return; // pinch zoom, or another paging took it
    const list = stops();
    if (!list || list.length < 2) return;
    const first = list[0];
    const last = list[list.length - 1];
    const lenis = getLenis();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    const side = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = (side ? e.deltaX : e.deltaY) * unit;
    if (!delta) return;
    const dir = Math.sign(delta);
    const abs = Math.abs(delta);
    const now = e.timeStamp || performance.now(); // when the input happened, not when it got through
    if (now - lastWheel > 180 || dir !== lastDir) pushes.length = 0;
    lastWheel = now;
    lastDir = dir;
    pushes.push(abs);
    if (pushes.length > 150) pushes.shift();
    const fresh = pushes.length === 1 || (abs >= 4 && mean(pushes.slice(-10)) >= mean(pushes.slice(-70)));

    const y = lenis ? lenis.animatedScroll : window.scrollY;
    const inside = y >= first - EDGE && y <= last + EDGE;
    if (busy()) return swallow(e);
    if (paging) {
      if (inside) swallow(e);
      return;
    }
    if (inside) {
      if (side && !sideways) return;
      if (fresh) armed = true;
      const to = dir > 0 ? list.find((s) => s > y + EDGE) : [...list].reverse().find((s) => s < y - EDGE);
      // past the first or the last stop: a fresh gesture leaves, a tail stays put
      if (to == null) {
        if (!armed) swallow(e);
        return;
      }
      swallow(e);
      if (armed) glideTo(to);
      return;
    }
    if (side) return; // outside, a sideways swipe is the browser's (back / forward)
    // on the way in: the scroll may not run past the first (or last) stop, it settles on it
    const target = (lenis ? lenis.targetScroll : y) + delta;
    const edge = dir > 0 && y < first && target > first ? first : dir < 0 && y > last && target < last ? last : null;
    if (edge == null) return;
    swallow(e);
    armed = false;
    if (lenis) lenis.scrollTo(edge, { programmatic: false, lerp: lenis.options.lerp });
    else window.scrollTo({ top: edge, behavior: 'smooth' });
  };

  // the keyboard and the scrollbar: a scroll that rests between two stops settles on the nearer one
  let restTimer = 0;
  const onScroll = () => {
    clearTimeout(restTimer);
    restTimer = window.setTimeout(() => {
      if (paging || busy() || reducedMotion || performance.now() - lastWheel < 600) return;
      const list = stops();
      if (!list || list.length < 2) return;
      const at = window.scrollY;
      if (at <= list[0] + EDGE || at >= list[list.length - 1] - EDGE) return;
      const nearest = list.reduce((best, s) => (Math.abs(s - at) < Math.abs(best - at) ? s : best), list[0]);
      if (Math.abs(nearest - at) > EDGE) scrollToY(nearest, { duration: 0.8 });
    }, 200);
  };

  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  return {
    glideTo,
    isPaging: () => paging,
    destroy() {
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('scroll', onScroll);
      clearTimeout(restTimer);
    },
  };
}
