"use client";
/*
 * ScrollReveals — blocks marked [data-sr] rise and fade in as they scroll into view (in batches,
 * staggered); headings marked [data-split] unmask line by line. Touch screens only fade (a block
 * sliding as it scrolls would trail the finger). A jump down the page shows what it passed at once,
 * so the stagger is spent only on what can be seen; a keyboard focus shows its block at once.
 * Opacity only, never visibility: a block waiting for its reveal stays in the Tab order.
 */
import { useEffect } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

export function ScrollReveals({ root = "[data-page]", exclude = ".is-deck .stages" }: { root?: string; exclude?: string }) {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>(root);
    if (!scope || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const items = [...scope.querySelectorAll<HTMLElement>("[data-sr]")].filter((el) => !el.closest(exclude));
      const touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
      const rise = touch ? 0 : 24;
      gsap.set(items, { opacity: 0, y: rise });
      ScrollTrigger.batch(items, {
        start: touch ? "top 98%" : "top 88%",
        once: true,
        onEnter: (batch) => {
          const passed = batch.filter((el) => el.getBoundingClientRect().bottom < 0);
          if (passed.length) gsap.set(passed, { opacity: 1, y: 0, overwrite: true });
          const seen = batch.filter((el) => !passed.includes(el));
          if (seen.length)
            gsap.to(seen, { opacity: 1, y: 0, duration: touch ? 0.6 : 1.1, ease: touch ? "power2.out" : "expo.out", stagger: touch ? 0.05 : 0.08, overwrite: true });
        },
      });
      const onFocus = (e: FocusEvent) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>("[data-sr]");
        if (el && items.includes(el) && Number(gsap.getProperty(el, "opacity")) < 1) gsap.to(el, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", overwrite: true });
      };
      scope.addEventListener("focusin", onFocus);

      for (const title of scope.querySelectorAll<HTMLElement>("[data-split]")) {
        SplitText.create(title, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
          autoSplit: true,
          reduceWhiteSpace: false, // keeps the no-break spaces of the typesetting
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: title, start: "top 86%", once: true } }),
        });
      }
      return () => scope.removeEventListener("focusin", onFocus);
    }, scope);
    return () => ctx.revert();
  }, [root, exclude]);
  return null;
}
