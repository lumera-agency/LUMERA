"use client";
import { useEffect } from "react";

/** The hero's small stones beside the number drift a little with the pointer (a mouse only; nothing on touch screens
 *  or with reduced motion). The number's own light is the chrome's lens (ChromeNumber). */
export function NotFoundLight() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-nf]");
    // (the still page, without the metal: ChromeNumber marks it)
    if (!root || root.hasAttribute("data-still")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--px", ((x / innerWidth) * 2 - 1).toFixed(3));
        root.style.setProperty("--py", ((y / innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return null;
}
