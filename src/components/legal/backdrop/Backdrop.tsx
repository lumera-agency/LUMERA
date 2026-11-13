"use client";
/*
 * The first screen's moving backdrop (the owner, 13 Nov 2026: a background from 21st.dev in the site's colours, or the
 * black kept with something alive on it). Three to choose from, ?bg= in the address while he chooses: a «Потоки»
 * (streams), b «Точки» (a field of dots), c «Рельєф» (contour lines); 0 none.
 *
 * Only where a graphics card draws the page and the page is FULL (lib/perf/mode): without one, or LITE, the first
 * screen keeps its plain dark light. It starts once the browser is idle (never in the first paint's way), plays only
 * while the first screen is in view and the tab is shown, a still frame with reduced motion; the page going LITE takes
 * it down. Its code is fetched only for the backdrop shown.
 */
import { useEffect, useRef } from "react";
import { canRunFull, isLite, watchMode } from "@/lib/perf/mode";
import type { Effect, Pointer } from "./types";

type Kind = "streams" | "dots" | "relief" | "none";
const PICK: Record<string, Kind> = { a: "streams", b: "dots", c: "relief", "0": "none" };
const DEFAULT: Kind = "streams";
/** frames a second: the streams and the dots move on every other screen frame or so; the relief changes slowly */
const FPS: Record<Exclude<Kind, "none">, number> = { streams: 50, dots: 40, relief: 30 };

const load = (kind: Exclude<Kind, "none">) =>
  kind === "streams" ? import("./streams") : kind === "dots" ? import("./dots") : import("./relief");

export function Backdrop() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    // the choice in the address (read in the browser: the page itself is the same for everyone)
    const asked = new URLSearchParams(window.location.search).get("bg");
    const kind: Kind = (asked && PICK[asked]) || DEFAULT;
    if (el) el.dataset.bg = kind;
    if (!el || !cv || kind === "none" || isLite() || !canRunFull()) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer: Pointer = { x: -9999, y: -9999, on: false };
    const gap = 1000 / FPS[kind];
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
      effect?.draw(now, dt);
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
    const drawStill = () => {
      // the streams need some steps to lay their trails; the others are one frame
      const steps = kind === "streams" ? 120 : 1;
      for (let i = 0; i < steps; i++) effect?.draw(4000 + i * 20, 20);
    };
    const size = () => {
      const r = el.getBoundingClientRect();
      effect?.resize(r.width, r.height, Math.min(window.devicePixelRatio || 1, 1.5));
      if (still) drawStill();
    };
    const resizeWatch = new ResizeObserver(size);
    const viewWatch = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    const onPointer = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = event.clientX - r.left;
      pointer.y = event.clientY - r.top;
      pointer.on = pointer.y >= 0 && pointer.y <= r.height;
    };
    const offPointer = () => {
      pointer.on = false;
    };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const stop = () => {
      alive = false;
      cancelAnimationFrame(frame);
      frame = 0;
      resizeWatch.disconnect();
      viewWatch.disconnect();
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", offPointer);
      el.classList.remove("is-on");
      effect?.dispose();
      effect = null;
    };
    // the page going LITE takes it down
    const stopMode = watchMode(() => isLite() && stop());

    const start = () =>
      load(kind).then((module) => {
        if (!alive) return;
        effect = module.create(cv, pointer);
        if (!effect) return;
        size();
        resizeWatch.observe(el);
        viewWatch.observe(el);
        document.addEventListener("visibilitychange", run);
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
    <div ref={box} className="lg-bg" data-bg={DEFAULT} aria-hidden="true">
      <canvas ref={canvas} className="lg-bg__canvas" />
    </div>
  );
}
