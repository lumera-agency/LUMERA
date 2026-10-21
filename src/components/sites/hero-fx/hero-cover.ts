/** The first screen counts as covered once less than this much of it shows under the topbar (px; QA 19 Oct, N-05). */
const COVER_EDGE = 20;

/**
 * Whether block 2 covers the pinned first screen (it slides over it): told now and on every change as the page
 * scrolls or resizes. Returns the stop.
 */
export function watchCover(onChange: (covered: boolean) => void, under = "#formats") {
  const next = document.querySelector<HTMLElement>(under);
  const bar = document.querySelector<HTMLElement>("[data-topbar]");
  let covered: boolean | null = null;
  let raf = 0;
  const check = () => {
    raf = 0;
    const edge = Math.max(0, bar?.getBoundingClientRect().bottom ?? 0) + COVER_EDGE;
    const now = !!next && next.getBoundingClientRect().top <= edge;
    if (now !== covered) {
      covered = now;
      onChange(now);
    }
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(check);
  };
  check();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onScroll);
  };
}
