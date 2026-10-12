"use client";
import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Magnetic — a gentle pull toward the cursor (mouse only, never with reduced motion): the element
 * follows the pointer a little, its label a little less, so it reads as depth. Presses squash it.
 * `strength` scales the pull (0.5 for wide buttons). `inner` is the part that lags (the label).
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, { strength = 1, inner = ".btn__label", enabled = true } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const label = inner ? el.querySelector<HTMLElement>(inner) : null;
    const opts = { duration: 0.6, ease: "power3.out" };
    const xTo = gsap.quickTo(el, "x", opts);
    const yTo = gsap.quickTo(el, "y", opts);
    const lxTo = label ? gsap.quickTo(label, "x", opts) : null;
    const lyTo = label ? gsap.quickTo(label, "y", opts) : null;
    let rest: { cx: number; cy: number } | null = null;

    const enter = () => {
      // measured at rest, so the pull doesn't feed back into itself
      const r = el.getBoundingClientRect();
      const x = Number(gsap.getProperty(el, "x"));
      const y = Number(gsap.getProperty(el, "y"));
      rest = { cx: r.left - x + r.width / 2, cy: r.top - y + r.height / 2 };
    };
    const move = (e: PointerEvent) => {
      if (!rest) return;
      const dx = e.clientX - rest.cx;
      const dy = e.clientY - rest.cy;
      xTo(dx * 0.22 * strength);
      yTo(dy * 0.32 * strength);
      lxTo?.(dx * 0.08 * strength);
      lyTo?.(dy * 0.1 * strength);
    };
    const leave = () => {
      rest = null;
      xTo(0); yTo(0); lxTo?.(0); lyTo?.(0);
    };
    const down = () => gsap.to(el, { scale: 0.97, duration: 0.2, ease: "power2.out" });
    const up = () => gsap.to(el, { scale: 1, duration: 0.5, ease: "expo.out" });

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    for (const t of ["pointerup", "pointercancel", "pointerleave"]) el.addEventListener(t, up);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
      for (const t of ["pointerup", "pointercancel", "pointerleave"]) el.removeEventListener(t, up);
      gsap.killTweensOf([el, label]);
    };
  }, [ref, strength, inner, enabled]);
}
