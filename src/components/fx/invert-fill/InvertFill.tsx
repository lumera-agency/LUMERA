"use client";
import { useEffect } from "react";

/**
 * InvertFill — buttons invert from the pointer: this tracks where the pointer enters and leaves any
 * element matching `selector` and writes it to --x / --y on it; the button's CSS grows a circle of
 * the inverse colour from there (ui/button/button.css .btn::after). One delegated listener for the
 * whole page, so buttons rendered later (the configurator's) get it too. Without it the circle grows
 * from the centre.
 */
export function InvertFill({ selector = ".btn" }: { selector?: string }) {
  useEffect(() => {
    const mark = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(selector);
      if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return; // a move inside it
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${(e.clientX - r.left).toFixed(1)}px`);
      el.style.setProperty("--y", `${(e.clientY - r.top).toFixed(1)}px`);
    };
    document.addEventListener("pointerover", mark, { passive: true });
    document.addEventListener("pointerout", mark, { passive: true });
    return () => {
      document.removeEventListener("pointerover", mark);
      document.removeEventListener("pointerout", mark);
    };
  }, [selector]);
  return null;
}
