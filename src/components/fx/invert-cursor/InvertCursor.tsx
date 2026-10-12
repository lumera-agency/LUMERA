"use client";
/*
 * InvertCursor — the mouse pointer becomes a circle that inverts whatever is under it (white with
 * mix-blend-mode: difference), like the lens on the footer's LUMERA, across the whole site. It trails
 * the pointer a little, grows over anything clickable, presses in on click; text fields keep the
 * native caret, and over `quiet` areas (the wordmark, which has its own lens) it steps aside.
 * Mouse only; with reduced motion it follows without the trail.
 */
import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import "./invert-cursor.css";

type Props = {
  /** px, at rest */
  size?: number;
  /** scale over clickable things */
  grow?: number;
  /** what counts as clickable */
  clickable?: string;
  /** where the circle steps aside (an effect there is the cursor) */
  quiet?: string;
  /** where the native caret stays */
  text?: string;
};

export function InvertCursor({
  size = 22,
  grow = 2.9,
  clickable = 'a, button, [role="button"], [role="tab"], summary, label, select, [data-cursor="hover"]',
  quiet = "[data-wordmark]",
  text = 'input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]',
}: Props) {
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const el = document.createElement("div");
    el.className = "invert-cursor";
    el.setAttribute("aria-hidden", "true");
    el.style.setProperty("--size", `${size}px`);
    el.style.setProperty("--grow", String(grow));
    el.innerHTML = '<span class="invert-cursor__dot"></span>';
    document.body.append(el);
    root.classList.add("has-invert-cursor");

    const opts = { duration: reduced ? 0 : 0.28, ease: "power3.out" };
    const xTo = gsap.quickTo(el, "x", opts);
    const yTo = gsap.quickTo(el, "y", opts);
    let placed = false;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!placed) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        placed = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const target = e.target as Element | null;
      el.classList.toggle("is-hover", Boolean(target?.closest?.(clickable)));
      el.classList.toggle("is-away", Boolean(target?.closest?.(`${quiet}, ${text}`)));
      el.classList.add("is-on");
    };
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    const leave = () => el.classList.remove("is-on");

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      gsap.killTweensOf(el);
      el.remove();
      root.classList.remove("has-invert-cursor");
    };
  }, [size, grow, clickable, quiet, text]);
  return null;
}
