"use client";
/*
 * HoverReveal — over a row of a list, its picture follows the cursor: the frame trails the pointer
 * (lerp), leans with the pointer's sideways speed and is unmasked from the side the pointer came
 * from; another row swaps the picture inside the same frame. Keyboard focus shows the picture beside
 * the row. Mouse only (touch screens show their own thumbnails), never with reduced motion.
 *
 * After Codrops' «Rapid Image Hover Menu» (MIT, github.com/codrops/RapidImageHoverMenu, © Codrops),
 * rewritten for one shared frame and GSAP 3.
 *
 *   useHoverReveal(listRef, { rows: "[data-reveal-row]", images: ["/a.webp", "/b.webp"], avoid: ".row__go" })
 * `avoid`: what the frame never covers (a row's own button): it keeps to the left of it, and over it
 * the frame steps away.
 * The frame's look is CSS: .hover-reveal / .hover-reveal__in / img (hover-reveal.css), or your class.
 */
import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import "./hover-reveal.css";

type Options = {
  /** the rows inside the list, in the order of `images` */
  rows: string;
  /** one picture per row */
  images: string[];
  /** extra class on the frame (sizes, radius) */
  className?: string;
  /** how fast the frame closes in on the pointer, per frame */
  follow?: number;
  /** the same for the lean */
  lean?: number;
  /** degrees */
  maxLean?: number;
  /** s: a pointer only passing over the list shows nothing */
  delay?: number;
  /** picture width/height (the images' own size, for layout) */
  size?: [number, number];
  /** inside the list: what the frame never covers, and over which it steps away */
  avoid?: string;
};

export function useHoverReveal(list: RefObject<HTMLElement | null>, { rows: rowSel, images, className = "", follow = 0.14, lean: leanRate = 0.09, maxLean = 9, delay = 0.08, size = [680, 850], avoid }: Options) {
  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = [...root.querySelectorAll<HTMLElement>(rowSel)];

    const reveal = document.createElement("div");
    reveal.className = `hover-reveal ${className}`.trim();
    reveal.setAttribute("aria-hidden", "true");
    const inner = document.createElement("div");
    inner.className = "hover-reveal__in";
    const pictures = images.map((src) => {
      const img = new Image(size[0], size[1]);
      img.alt = "";
      img.decoding = "async";
      img.src = src; // fetched now: the picture is there before the pointer is
      inner.append(img);
      return img;
    });
    reveal.append(inner);
    document.body.append(reveal);

    const pointer = { x: 0, y: 0 };
    const pos = { x: 0, y: 0, lean: 0 };
    let lastX = 0;
    let active = -1;
    let shown = false;
    let frame = 0;
    let showCall: gsap.core.Tween | null = null;
    const box = () => ({ w: reveal.offsetWidth, h: reveal.offsetHeight });
    const keepOut = avoid ? [...root.querySelectorAll<HTMLElement>(avoid)] : [];
    const GAP = 24;
    /** the left edge of what the frame keeps clear of (the column of the rows' buttons) */
    const clearOf = () => (keepOut.length ? Math.min(...keepOut.map((el) => el.getBoundingClientRect().left)) - GAP : Infinity);
    /** is the pointer on (or right by) one of them */
    const onKeepOut = () =>
      keepOut.some((el) => {
        const r = el.getBoundingClientRect();
        return pointer.x > r.left - GAP && pointer.x < r.right + GAP && pointer.y > r.top - GAP && pointer.y < r.bottom + GAP;
      });

    const place = (snap: boolean) => {
      const { w, h } = box();
      const tx = Math.max(16, Math.min(pointer.x + w * 0.18, window.innerWidth - w - 16, clearOf() - w));
      const ty = Math.min(Math.max(pointer.y - h / 2, 16), window.innerHeight - h - 16); // never cut by the edge
      const speed = pointer.x - lastX;
      lastX = pointer.x;
      const lean = gsap.utils.clamp(-maxLean, maxLean, speed * 0.35);
      if (snap) Object.assign(pos, { x: tx, y: ty, lean: 0 });
      else {
        pos.x += (tx - pos.x) * follow;
        pos.y += (ty - pos.y) * follow;
        pos.lean += (lean - pos.lean) * leanRate;
      }
      reveal.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) rotate(${pos.lean.toFixed(2)}deg)`;
    };
    const loop = () => {
      place(false);
      frame = shown || Math.abs(pos.lean) > 0.05 ? requestAnimationFrame(loop) : 0;
    };
    const run = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };

    /** unmask picture i from the side the pointer came from (down the list: from below) */
    const swapTo = (i: number, fromBelow: boolean) => {
      const prev = active;
      active = i;
      pictures.forEach((img, k) => (img.style.zIndex = String(k === i ? 2 : k === prev ? 1 : 0)));
      gsap.killTweensOf(pictures[i]);
      gsap.fromTo(
        pictures[i],
        { clipPath: fromBelow ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", scale: 1.18 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.7, ease: "expo.out", overwrite: true },
      );
      if (prev >= 0 && prev !== i) {
        const old = pictures[prev];
        gsap.to(old, { scale: 0.92, duration: 0.7, ease: "expo.out", onComplete: () => void (active !== prev && gsap.set(old, { clipPath: "inset(100% 0% 0% 0%)", scale: 1 })) });
      }
    };
    const show = (i: number, fromBelow: boolean, at?: { x: number; y: number }) => {
      showCall?.kill();
      if (shown) {
        if (i !== active) swapTo(i, fromBelow);
        return;
      }
      showCall = gsap.delayedCall(delay, () => {
        shown = true;
        if (at) Object.assign(pointer, at);
        place(true);
        run();
        gsap.killTweensOf(inner);
        gsap.set(reveal, { autoAlpha: 1 });
        gsap.fromTo(inner, { autoAlpha: 0, scale: 0.72 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "expo.out" });
        swapTo(i, fromBelow);
      });
    };
    const hide = () => {
      showCall?.kill();
      if (!shown) return;
      shown = false;
      gsap.killTweensOf(inner);
      gsap.to(inner, {
        autoAlpha: 0,
        scale: 0.8,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          if (shown) return;
          gsap.set(reveal, { autoAlpha: 0 });
          pictures.forEach((img) => gsap.set(img, { clipPath: "inset(100% 0% 0% 0%)", scale: 1 }));
          active = -1;
        },
      });
    };

    let lastRow = -1;
    const offs: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Document | Window, type: K | string, fn: (e: never) => void, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn as EventListener, opts);
      offs.push(() => el.removeEventListener(type, fn as EventListener, opts));
    };
    rows.forEach((row, i) => {
      on(row, "pointerenter", (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        if (onKeepOut()) return;
        show(i, i >= lastRow);
        lastRow = i;
      });
      on(row, "focus", () => {
        if (!row.matches(":focus-visible")) return;
        const r = row.getBoundingClientRect();
        show(i, i >= lastRow, { x: r.right - box().w * 1.35, y: r.top + r.height / 2 });
        lastRow = i;
      });
      on(row, "blur", () => !root.matches(":hover") && hide());
    });
    on(root, "pointermove", (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!keepOut.length || e.pointerType !== "mouse") return;
      // over a row's button the frame steps away, and comes back once the pointer is off it
      if (onKeepOut()) return hide();
      if (shown || showCall?.isActive()) return;
      const row = (e.target as Element).closest<HTMLElement>(rowSel);
      const i = row ? rows.indexOf(row) : -1;
      if (i < 0) return;
      show(i, i >= lastRow);
      lastRow = i;
    }, { passive: true });
    on(root, "pointerleave", hide);
    // a pointer that left without a leave event (a jump, a window switch): the next move anywhere hides it
    on(document, "pointermove", (e: PointerEvent) => shown && !root.contains(e.target as Node) && hide(), { passive: true });
    // the page scrolls under a still pointer: the frame goes
    on(window, "scroll", () => shown && !root.matches(":hover") && hide(), { passive: true });

    return () => {
      offs.forEach((off) => off());
      cancelAnimationFrame(frame);
      showCall?.kill();
      gsap.killTweensOf([inner, ...pictures]);
      reveal.remove();
    };
  }, [list, rowSel, images, className, follow, leanRate, maxLean, delay, size, avoid]);
}
