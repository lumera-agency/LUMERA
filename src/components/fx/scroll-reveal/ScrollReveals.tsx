"use client";
/*
 * ScrollReveals — blocks marked [data-sr] rise and fade in as they scroll into view (in batches,
 * staggered); headings marked [data-split] unmask line by line. Touch screens only fade (a block
 * sliding as it scrolls would trail the finger). A jump down the page shows what it passed at once,
 * so the stagger is spent only on what can be seen; a keyboard focus shows its block at once.
 * Opacity only, never visibility: a block waiting for its reveal stays in the Tab order.
 *
 * Told by IntersectionObservers, not ScrollTriggers (10 Nov 2026): these are one-off, and as triggers about forty of
 * them were each looked at on every frame of every scroll until they fired. The observed area reaches far above the
 * screen, so a block jumped past counts as come in as well (and is shown at once, as before).
 */
import { useEffect } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { switching } from "@/lib/place";

/** The line a block's top crosses to come in, as a share of the screen's height from its top (as «top 88%» was). */
const LINE = { block: 0.88, touch: 0.98, title: 0.86 };

/** Calls `enter` with the elements that have come in since the last frame, in the page's order, once each. */
function observeIn(elements: HTMLElement[], line: number, enter: (batch: HTMLElement[]) => void) {
  let pending: HTMLElement[] = [];
  let frame = 0;
  const flush = () => {
    frame = 0;
    const batch = pending;
    pending = [];
    if (batch.length) enter(batch);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        pending.push(entry.target as HTMLElement);
      }
      if (pending.length && !frame) frame = requestAnimationFrame(flush);
    },
    { rootMargin: `100000px 0px ${-Math.round((1 - line) * 100)}% 0px` },
  );
  elements.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    cancelAnimationFrame(frame);
  };
}

export function ScrollReveals({ root = "[data-page]", exclude = ".is-deck .stages" }: { root?: string; exclude?: string }) {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>(root);
    if (!scope || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // a language switch: what is on screen or above it was seen already and simply stays (only what is below comes in)
    const seen = (el: HTMLElement) => switching() && el.getBoundingClientRect().top < window.innerHeight;
    const stops: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const items = [...scope.querySelectorAll<HTMLElement>("[data-sr]")].filter((el) => !el.closest(exclude) && !seen(el));
      const touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
      const rise = touch ? 0 : 24;
      // (a page with no [data-sr] blocks, e.g. the AI page: GSAP would warn «target not found» on an empty set)
      if (items.length) {
        gsap.set(items, { opacity: 0, y: rise });
        stops.push(
          observeIn(items, touch ? LINE.touch : LINE.block, (batch) => {
            const passed = batch.filter((el) => el.getBoundingClientRect().bottom < 0);
            // done: the transform goes (a transformed ancestor would break a pinned, fixed child)
            if (passed.length) gsap.set(passed, { opacity: 1, y: 0, overwrite: true, clearProps: "transform" });
            const now = batch.filter((el) => !passed.includes(el));
            if (now.length)
              gsap.to(now, { opacity: 1, y: 0, duration: touch ? 0.6 : 1.1, ease: touch ? "power2.out" : "expo.out", stagger: touch ? 0.05 : 0.08, overwrite: true, clearProps: "transform" });
          }),
        );
      }
      const onFocus = (e: FocusEvent) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>("[data-sr]");
        if (el && items.includes(el) && Number(gsap.getProperty(el, "opacity")) < 1) gsap.to(el, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", overwrite: true });
      };
      scope.addEventListener("focusin", onFocus);

      // the headings: split into lines, held under their masks until they come in. A split made again (the face
      // coming in, a resize) carries the reveal's progress over (SplitText's autoSplit, from the returned animation)
      const titles = [...scope.querySelectorAll<HTMLElement>("[data-split]")].filter((title) => !seen(title));
      const reveals = new Map<HTMLElement, { entered: boolean; tween: gsap.core.Tween | null }>();
      for (const title of titles) {
        const state = { entered: false, tween: null as gsap.core.Tween | null };
        reveals.set(title, state);
        SplitText.create(title, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
          autoSplit: true,
          reduceWhiteSpace: false, // keeps the no-break spaces of the typesetting
          onSplit: (self) => (state.tween = gsap.from(self.lines, { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.09, paused: !state.entered })),
        });
      }
      if (titles.length)
        stops.push(
          observeIn(titles, LINE.title, (batch) => {
            for (const title of batch) {
              const state = reveals.get(title);
              if (!state) continue;
              state.entered = true;
              state.tween?.play();
            }
          }),
        );
      return () => scope.removeEventListener("focusin", onFocus);
    }, scope);
    return () => {
      stops.forEach((stop) => stop());
      ctx.revert();
    };
  }, [root, exclude]);
  return null;
}
