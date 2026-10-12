"use client";
/*
 * InvertCursor — inside `scope` the mouse pointer becomes a circle that inverts whatever is under it
 * (white with mix-blend-mode: difference), like the lens on the footer's LUMERA; outside it the
 * native pointer stays. It trails the pointer a little, grows over anything clickable, presses in on
 * click; text fields keep the native caret, and over `quiet` areas it steps aside.
 * Mouse only; with reduced motion it follows without the trail. `scope` "body" = the whole page.
 */
import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import "./invert-cursor.css";

type Props = {
  /** where the circle replaces the pointer (selector; several are fine) */
  scope?: string;
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
  scope = "body",
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
    const el = document.createElement("div");
    el.className = "invert-cursor";
    el.setAttribute("aria-hidden", "true");
    el.style.setProperty("--size", `${size}px`);
    el.style.setProperty("--grow", String(grow));
    el.innerHTML = '<span class="invert-cursor__dot"></span>';
    document.body.append(el);
    // the native pointer hides only inside the scope (invert-cursor.css)
    const areas = [...document.querySelectorAll<HTMLElement>(scope)];
    areas.forEach((a) => a.setAttribute("data-invert-cursor", ""));

    const opts = { duration: reduced ? 0 : 0.28, ease: "power3.out" };
    const xTo = gsap.quickTo(el, "x", opts);
    const yTo = gsap.quickTo(el, "y", opts);
    let placed = false;
    const at = { x: 0, y: 0 };
    const read = (target: Element | null) => {
      el.classList.toggle("is-hover", Boolean(target?.closest?.(clickable)));
      el.classList.toggle("is-away", Boolean(target?.closest?.(`${quiet}, ${text}`)));
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!placed) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        placed = true;
      }
      at.x = e.clientX;
      at.y = e.clientY;
      xTo(e.clientX);
      yTo(e.clientY);
      read(e.target as Element | null);
      el.classList.toggle("is-on", Boolean((e.target as Element | null)?.closest?.(scope)));
    };
    // the page scrolls under a still pointer: what is under the circle changes
    let queued = 0;
    const onScroll = () => {
      if (queued || !placed) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        const under = document.elementFromPoint(at.x, at.y);
        read(under);
        el.classList.toggle("is-on", Boolean(under?.closest(scope)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    const leave = () => el.classList.remove("is-on");

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(queued);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      gsap.killTweensOf(el);
      el.remove();
      areas.forEach((a) => a.removeAttribute("data-invert-cursor"));
    };
  }, [scope, size, grow, clickable, quiet, text]);
  return null;
}
