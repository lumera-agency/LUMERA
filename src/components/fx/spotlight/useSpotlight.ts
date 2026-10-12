"use client";
import { useEffect, type RefObject } from "react";

/**
 * Spotlight — cards light up under the cursor: --mx/--my follow the pointer inside each card, and
 * the card's CSS draws a radial light there (page.css .card::before/::after). Mouse only.
 */
export function useSpotlight(scope: RefObject<HTMLElement | null>, selector = ".card") {
  useEffect(() => {
    const root = scope.current;
    if (!root || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(selector);
      if (!card || !root.contains(card)) return;
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
      });
    };
    root.addEventListener("pointermove", move, { passive: true });
    return () => root.removeEventListener("pointermove", move);
  }, [scope, selector]);
}
