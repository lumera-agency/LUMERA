"use client";
/*
 * Scripted scrolls that glide like the wheel: through Lenis when it runs (fx/smooth-scroll), else the
 * browser's smooth scroll. One place, so a button, a link and the wheel never fight over the page.
 */
import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (instance: Lenis | null) => void (lenis = instance);
export const getLenis = () => lenis;

export function scrollToY(y: number, { immediate = false, duration = 1.1 } = {}) {
  const top = Math.max(0, Math.round(y));
  const reduced = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) lenis.scrollTo(top, { immediate: immediate || reduced, duration });
  else window.scrollTo({ top, behavior: immediate || reduced ? "instant" : "smooth" });
}

let jumping = false;
/**
 * To a far place without the run there (a glide through the whole page would play every block on
 * the way): the page dims to its own black, jumps, and comes up again where it lands.
 */
export function fadeJumpTo(y: number, { dim = 380, rise = 750 } = {}) {
  if (jumping) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !document.body.animate) return scrollToY(y, { immediate: true });
  jumping = true;
  const veil = document.createElement("div");
  veil.setAttribute("aria-hidden", "true");
  // above the topbar and the page's floating buttons, under the menu and the preloader
  veil.style.cssText = "position:fixed;inset:0;z-index:150;background:var(--bg,#0a0a0a);opacity:0;pointer-events:none";
  document.body.append(veil);
  veil
    .animate([{ opacity: 0 }, { opacity: 1 }], { duration: dim, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" })
    .finished.then(() => {
      scrollToY(y, { immediate: true });
      return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    })
    .then(() => veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: rise, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }).finished)
    .finally(() => {
      veil.remove();
      jumping = false;
    });
}
