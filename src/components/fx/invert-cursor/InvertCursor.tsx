"use client";
/*
 * InvertCursor — inside `scope` the mouse pointer becomes a liquid lens that inverts whatever is under
 * it (white, mix-blend-mode: difference), like the lens on the footer's LUMERA: it trails the pointer
 * with a little lag, its rim ripples (the wordmark shader's own ripple, two sines round the edge), it
 * stretches along the way it moves and settles round when it stops, and it grows in and out softly.
 * Bigger over anything clickable and over large type ([data-cursor-lens]); [data-cursor-size] on an
 * area sets its own diameter, [data-cursor-still] keeps it a plain round circle there (no ripple, no stretch). Text fields keep the native caret; over `quiet` areas it steps aside;
 * outside the scope the native pointer stays. Mouse only; reduced motion: no lag, no ripple.
 */
import { useEffect } from "react";
import "./invert-cursor.css";

type Props = {
  /** where the lens replaces the pointer (selector; several are fine) */
  scope?: string;
  /** diameter at rest, px */
  size?: number;
  /** scale over clickable things */
  grow?: number;
  /** where it opens wider (large type), and how much */
  lens?: string;
  lensGrow?: number;
  /** how much the rim ripples (1 = the wordmark's, scaled for a small lens) */
  ripple?: number;
  /** what counts as clickable */
  clickable?: string;
  /** where it steps aside */
  quiet?: string;
  /** where the native caret stays */
  text?: string;
};

const NS = "http://www.w3.org/2000/svg";
const POINTS = 44;

export function InvertCursor({
  scope = "body",
  size = 22,
  grow = 2.9,
  lens = "[data-cursor-lens]",
  lensGrow = 5,
  ripple = 1,
  clickable = 'a, button, [role="button"], [role="tab"], summary, label, select, [data-cursor="hover"]',
  quiet = "[data-wordmark]",
  text = 'input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]',
}: Props) {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // the canvas for the shape: room for the biggest lens, stretched
    const box = Math.ceil(Math.max(size, ...[...document.querySelectorAll<HTMLElement>("[data-cursor-size]")].map((e) => Number(e.dataset.cursorSize) || 0)) * Math.max(1, grow, lensGrow) * 1.5) + 8;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "invert-cursor");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", String(box));
    svg.setAttribute("height", String(box));
    svg.setAttribute("viewBox", `${-box / 2} ${-box / 2} ${box} ${box}`);
    const path = document.createElementNS(NS, "path");
    svg.append(path);
    document.body.append(svg);
    // the native pointer hides only inside the scope (invert-cursor.css)
    const areas = [...document.querySelectorAll<HTMLElement>(scope)];
    areas.forEach((a) => a.setAttribute("data-invert-cursor", ""));

    const target = { x: -box, y: -box, r: 0 };
    const cur = { x: -box, y: -box, r: 0 };
    const vel = { x: 0, y: 0 };
    let inScope = false;
    let down = false;
    let under: Element | null = null;
    let still = false; // a plain circle here ([data-cursor-still])
    let placed = false;
    let time = 0;
    let last = 0;
    let raf = 0;

    const radiusFor = (el: Element | null) => {
      if (!inScope || !el || el.closest(`${quiet}, ${text}`)) return 0;
      const area = el.closest<HTMLElement>("[data-cursor-size]");
      const base = (Number(area?.dataset.cursorSize) || size) / 2;
      const k = el.closest(lens) ? lensGrow : el.closest(clickable) ? grow : 1;
      return base * k * (down ? 0.9 : 1);
    };
    const aim = () => {
      target.r = radiusFor(under);
      still = Boolean(under?.closest?.("[data-cursor-still]"));
      wake();
    };

    // a closed, smooth outline through the rim's points (Catmull-Rom as cubic Béziers)
    const outline = (r: number, t: number, stretch: number, angle: number) => {
      const a1 = reduced || still ? 0 : 0.026 * ripple; // the wordmark lens: 0.022 / 0.016, a touch more on a small lens
      const a2 = reduced || still ? 0 : 0.019 * ripple;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const pts: [number, number][] = [];
      for (let i = 0; i < POINTS; i++) {
        const th = (i / POINTS) * Math.PI * 2;
        const rr = r * (1 + a1 * Math.sin(th * 5 + t * 1.6) + a2 * Math.sin(th * 3 - t * 2.1));
        // along the motion it stretches, across it narrows a little (volume roughly kept)
        const u = Math.cos(th) * rr * (1 + stretch);
        const v = Math.sin(th) * rr * (1 - stretch * 0.55);
        pts.push([u * cos - v * sin, u * sin + v * cos]);
      }
      const p = (i: number) => pts[(i + POINTS) % POINTS];
      let d = `M${p(0)[0].toFixed(2)} ${p(0)[1].toFixed(2)}`;
      for (let i = 0; i < POINTS; i++) {
        const [x0, y0] = p(i - 1);
        const [x1, y1] = p(i);
        const [x2, y2] = p(i + 1);
        const [x3, y3] = p(i + 2);
        d += `C${(x1 + (x2 - x0) / 6).toFixed(2)} ${(y1 + (y2 - y0) / 6).toFixed(2)} ${(x2 - (x3 - x1) / 6).toFixed(2)} ${(y2 - (y3 - y1) / 6).toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
      }
      return `${d}Z`;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      time += dt;
      const px = cur.x;
      const py = cur.y;
      if (reduced) {
        cur.x = target.x;
        cur.y = target.y;
        cur.r = target.r;
      } else {
        const follow = 1 - Math.exp(-dt * 14); // the wordmark lens's lag
        cur.x += (target.x - cur.x) * follow;
        cur.y += (target.y - cur.y) * follow;
        cur.r += (target.r - cur.r) * (1 - Math.exp(-dt * 9));
      }
      if (cur.r < 0.3 && target.r === 0) cur.r = 0;
      // smoothed velocity → the stretch and its direction
      const k = 1 - Math.exp(-dt * 10);
      vel.x += ((cur.x - px) / dt - vel.x) * k;
      vel.y += ((cur.y - py) / dt - vel.y) * k;
      const speed = Math.hypot(vel.x, vel.y);
      const stretch = reduced || still ? 0 : Math.min(0.16, speed / 5200);
      path.setAttribute("d", cur.r > 0 ? outline(cur.r, time, stretch, Math.atan2(vel.y, vel.x)) : "");
      svg.style.transform = `translate3d(${(cur.x - box / 2).toFixed(1)}px, ${(cur.y - box / 2).toFixed(1)}px, 0)`;
      // runs while the lens is out (its rim keeps rippling) or still settling
      const busy = cur.r > 0 || target.r > 0 || speed > 2;
      raf = busy && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    function wake() {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!placed || cur.r === 0) {
        // it grows in where the pointer is, not on its way from somewhere else
        cur.x = target.x;
        cur.y = target.y;
        placed = true;
      }
      under = e.target as Element | null;
      inScope = Boolean(under?.closest?.(scope));
      aim();
    };
    const press = (on: boolean) => () => {
      down = on;
      aim();
    };
    const pressDown = press(true);
    const pressUp = press(false);
    const leave = () => {
      inScope = false;
      aim();
    };
    // the page scrolls under a still pointer: what is under the lens changes
    let queued = 0;
    const onScroll = () => {
      if (queued || !placed) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        under = document.elementFromPoint(target.x, target.y);
        inScope = Boolean(under?.closest(scope));
        aim();
      });
    };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", pressDown);
    document.addEventListener("pointerup", pressUp);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", pressDown);
      document.removeEventListener("pointerup", pressUp);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(queued);
      svg.remove();
      areas.forEach((a) => a.removeAttribute("data-invert-cursor"));
    };
  }, [scope, size, grow, lens, lensGrow, ripple, clickable, quiet, text]);
  return null;
}
