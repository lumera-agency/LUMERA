"use client";
/*
 * The page's moving backdrop, one ground under the whole page (the owner, 13 Nov 2026: «полноценный единый фон … ты
 * как будто скроллишь, и этот фон продолжается»; the blocks over it are glass). Fixed to the screen and drawn there,
 * it rides with the scroll at a slower pace, so the ground runs on under the page. The ground is «Сяйво» (glowing
 * fibres, after the owner's reference reel of 13 Nov 2026, in the ads page's language: backdrop/aurora.ts); the
 * other three tried on 13 Nov are gone with the owner's OK.
 *
 * Only where a graphics card draws the page and the page is FULL (lib/perf/mode): without one, or LITE, the page keeps
 * its plain dark ground. It starts once the browser is idle (never in the first paint's way), plays only while the
 * page's main part is in view (not under the footer) and the tab is shown, a still frame with reduced motion; the page
 * going LITE takes it down. Its code is fetched only when it starts.
 */
import { useEffect, useRef } from "react";
import { canRunFull, isLite, watchMode } from "@/lib/perf/mode";
import type { Effect, Pointer } from "./types";

/** frames a second, and fewer on a touch screen */
const FPS = 45;

export function Backdrop() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv || isLite() || !canRunFull()) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer: Pointer = { x: -9999, y: -9999, on: false };
    const gap = 1000 / (fine ? FPS : Math.min(30, FPS));
    let effect: Effect | null = null;
    let alive = true;
    let frame = 0;
    let last = 0;
    let visible = true;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (last && now - last < gap - 1) return;
      const dt = last ? Math.min(100, now - last) : gap;
      last = now;
      effect?.draw(now, dt, window.scrollY);
    };
    const run = () => {
      const go = effect && !still && visible && !document.hidden;
      if (go && !frame) frame = requestAnimationFrame(loop);
      if (!go && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      }
    };
    const drawStill = () => effect?.draw(4000, 20, window.scrollY);
    // with reduced motion the still follows the scroll (a frame per scroll, no loop)
    const onScrollStill = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        effect?.draw(4000, 20, window.scrollY);
      });
    };
    const size = () => {
      effect?.resize(window.innerWidth, window.innerHeight, fine ? Math.min(window.devicePixelRatio || 1, 1.5) : 1);
      if (still) drawStill();
    };
    const resizeWatch = new ResizeObserver(size);
    // the page's main part on screen (the footer has a ground of its own)
    const main = document.querySelector("main");
    const viewWatch = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.on = true;
    };
    const offPointer = () => {
      pointer.on = false;
    };
    const stop = () => {
      alive = false;
      cancelAnimationFrame(frame);
      frame = 0;
      resizeWatch.disconnect();
      viewWatch.disconnect();
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("scroll", onScrollStill);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", offPointer);
      el.classList.remove("is-on");
      effect?.dispose();
      effect = null;
    };
    // the page going LITE takes it down
    const stopMode = watchMode(() => isLite() && stop());

    const start = () =>
      import("./aurora").then((module) => {
        if (!alive) return;
        effect = module.create(cv, pointer);
        if (!effect) return;
        size();
        resizeWatch.observe(el);
        if (main) viewWatch.observe(main);
        document.addEventListener("visibilitychange", run);
        if (still) window.addEventListener("scroll", onScrollStill, { passive: true });
        if (fine) {
          window.addEventListener("pointermove", onPointer, { passive: true });
          document.documentElement.addEventListener("pointerleave", offPointer);
        }
        el.classList.add("is-on");
        run();
      });
    // (Safari has no idle callback: a short wait instead)
    const idleApi = window as Window & { requestIdleCallback?: Window["requestIdleCallback"]; cancelIdleCallback?: Window["cancelIdleCallback"] };
    const viaIdle = typeof idleApi.requestIdleCallback === "function";
    const idle = viaIdle ? idleApi.requestIdleCallback!(() => start(), { timeout: 1500 }) : window.setTimeout(start, 600);

    return () => {
      if (viaIdle) idleApi.cancelIdleCallback?.(idle);
      else window.clearTimeout(idle);
      stopMode();
      stop();
    };
  }, []);

  return (
    <div ref={box} className="lg-bg" aria-hidden="true">
      <canvas ref={canvas} className="lg-bg__canvas" />
    </div>
  );
}
