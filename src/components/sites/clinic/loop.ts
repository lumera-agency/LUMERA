/*
 * The scroll-linked parts of the clinic sample (the photos' drift, the pinned process image, the stacking cards): the
 * sample's page never scrolls natively, the engine moves .pv-scroll by a translate (the tour's animation or the visitor's
 * wheel and finger). onFrame runs in a rAF loop only while the block is in the frame's viewport AND that translate is
 * changing; after a few unchanged frames the loop stops. It wakes on the block crossing fine IntersectionObserver
 * thresholds (the block and its parts, [data-mv]), on the wheel, a finger or a click in the frame (a link's glide). Off on reduced motion; once at mount so the
 * layout starts in its place.
 */
import { useEffect, useRef, type RefObject } from "react";

export function useMoveLoop(ref: RefObject<HTMLElement | null>, vp: HTMLElement, onFrame: (v: DOMRect, cq: number) => void, enabled = true) {
  const cb = useRef(onFrame);
  useEffect(() => {
    cb.current = onFrame;
  });
  useEffect(() => {
    const block = ref.current;
    const sc = block?.closest<HTMLElement>(".pv-scroll");
    if (!block || !sc || !enabled) return;
    let raf = 0;
    let still = 0;
    let last = NaN;
    let inView = false;
    const ty = () => {
      const t = getComputedStyle(sc).translate;
      const m = t && t !== "none" ? t.split(" ") : [];
      return m.length > 1 ? parseFloat(m[1]) || 0 : 0;
    };
    const run = () => {
      const v = vp.getBoundingClientRect();
      cb.current(v, v.width / 100);
    };
    const tick = () => {
      raf = 0;
      const y = ty();
      if (y === last) {
        if (++still > 6) return;
      } else {
        still = 0;
        last = y;
        run();
      }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!inView || raf) return;
      still = 0;
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.target === block) inView = e.isIntersecting;
        kick();
      },
      { root: vp, threshold: Array.from({ length: 41 }, (_, i) => i / 40) },
    );
    io.observe(block);
    // a block taller than the frame keeps a constant ratio while it covers it: its parts ([data-mv]) still cross the edges
    block.querySelectorAll("[data-mv]").forEach((el) => io.observe(el));
    for (const ev of ["wheel", "touchmove", "pointerdown", "click"]) vp.addEventListener(ev, kick, { passive: true });
    run();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      for (const ev of ["wheel", "touchmove", "pointerdown", "click"]) vp.removeEventListener(ev, kick);
    };
  }, [ref, vp, enabled]);
}
