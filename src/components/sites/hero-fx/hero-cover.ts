/** The first screen counts as covered once less than this much of it shows under the topbar (px; QA 19 Oct, N-05). */
const COVER_EDGE = 20;

/**
 * Whether block 2 covers the pinned first screen (it slides over it): told now and on every change as the page
 * scrolls or resizes. Returns the stop.
 *
 * (10 Nov 2026: the next block's place in the document and the topbar's foot are measured when they can change, not
 * on every frame of a scroll: two boxes read after the scroll's own writes had the browser lay the page out again each
 * frame, the ads page's costliest script of a scroll. The next block lies in the page's flow, the first screen only
 * pinned over it, so its place moves with the page alone.)
 */
export function watchCover(onChange: (covered: boolean) => void, under = "#formats") {
  const next = document.querySelector<HTMLElement>(under);
  const bar = document.querySelector<HTMLElement>("[data-topbar]");
  let covered: boolean | null = null;
  let raf = 0;
  let nextTop = Infinity;
  let edge = COVER_EDGE;
  const measure = () => {
    nextTop = next ? next.getBoundingClientRect().top + window.scrollY : Infinity;
    edge = Math.max(0, bar?.getBoundingClientRect().bottom ?? 0) + COVER_EDGE;
  };
  const check = () => {
    raf = 0;
    const now = nextTop - window.scrollY <= edge;
    if (now !== covered) {
      covered = now;
      onChange(now);
    }
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(check);
  };
  const remeasure = () => {
    measure();
    onScroll();
  };
  measure();
  check();
  // the page grows or shrinks (pictures, fonts, a resize); the topbar slides in or out (its foot moves)
  const sized = new ResizeObserver(remeasure);
  sized.observe(document.body);
  const barMoves = new MutationObserver(() => window.setTimeout(remeasure, 650));
  if (bar) barMoves.observe(bar, { attributes: true, attributeFilter: ["class"] });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", remeasure);
  return () => {
    cancelAnimationFrame(raf);
    sized.disconnect();
    barMoves.disconnect();
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", remeasure);
  };
}
