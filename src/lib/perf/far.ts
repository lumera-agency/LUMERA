"use client";
/*
 * Blocks far from the view are not rendered (content-visibility: auto, FULL only). The browser skips their styles,
 * layout and paint while they are more than a screen and a half away, and keeps their place by the size they last had
 * (contain-intrinsic-size: auto), so the page's height and every scroll scene's start and end stay as measured.
 *
 * Only blocks that are not pinned and hold no pin take it (the page names them: PageShell `skip`). The skipping is off
 * while ScrollTrigger measures the page (refreshInit) and back on two frames after: a block skipped at once would keep
 * a size from before a resize or a language switch, while two frames rendered make the browser remember the new one.
 * What is inside a skipped block is out of sight for IntersectionObserver, wherever it is. The observers inside these
 * blocks look no farther than the browser renders, so what plays as it comes into view plays as before; those that
 * count a reveal as passed once it is above the screen hear of a skipped one when it is rendered again, a screen and
 * a half before it is back in view (after a jump down the page, not at once).
 */
import { ScrollTrigger } from "@/lib/gsap";
import { isLite, watchMode } from "./mode";

const SKIPPING = "is-far";

/** Lets `blocks` skip their rendering while far from the view; returns the stop. */
export function skipFarBlocks(blocks: HTMLElement[]) {
  if (!blocks.length || !CSS.supports("content-visibility", "auto")) return () => {};
  let frame = 0;
  const release = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    blocks.forEach((block) => block.classList.remove(SKIPPING));
  };
  const apply = () => {
    release();
    if (isLite()) return;
    // (the height measured now is only the fallback: the size the browser remembers from the frames below wins)
    const heights = blocks.map((block) => block.getBoundingClientRect().height);
    blocks.forEach((block, index) => block.style.setProperty("contain-intrinsic-block-size", `auto ${heights[index]}px`));
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0;
        blocks.forEach((block) => block.classList.add(SKIPPING));
      });
    });
  };
  ScrollTrigger.addEventListener("refreshInit", release);
  ScrollTrigger.addEventListener("refresh", apply);
  // (the page may be measured already: its first refresh comes with the window's load)
  const loaded = () => apply();
  if (document.readyState === "complete") apply();
  else window.addEventListener("load", loaded, { once: true });
  // a page that goes LITE on the way renders everything again, as LITE always does
  const stopMode = watchMode(() => {
    if (isLite()) release();
  });
  return () => {
    release();
    stopMode();
    window.removeEventListener("load", loaded);
    ScrollTrigger.removeEventListener("refreshInit", release);
    ScrollTrigger.removeEventListener("refresh", apply);
    blocks.forEach((block) => block.style.removeProperty("contain-intrinsic-block-size"));
  };
}
