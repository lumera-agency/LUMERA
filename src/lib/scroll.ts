"use client";
/*
 * Scripted scrolls that glide like the wheel: through Lenis when it runs (fx/smooth-scroll), else the
 * browser's smooth scroll. One place, so a button, a link and the wheel never fight over the page.
 */
import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (instance: Lenis | null) => void (lenis = instance);
export const getLenis = () => lenis;

export function scrollToY(y: number, { immediate = false } = {}) {
  const top = Math.max(0, Math.round(y));
  const reduced = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) lenis.scrollTo(top, { immediate: immediate || reduced, duration: 1.1 });
  else window.scrollTo({ top, behavior: immediate || reduced ? "instant" : "smooth" });
}
