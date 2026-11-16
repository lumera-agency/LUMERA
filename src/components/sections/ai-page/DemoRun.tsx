"use client";
import { useEffect, useRef } from "react";
import { lit, read, within, type Flag, type Flight } from "./demo-beats";

/**
 * Plays a task's demo (block 3) beat by beat, while most of its window (60 %) is on the screen and the tab is seen; it
 * waits where it is otherwise and goes on from there. With reduced motion it does nothing: the markup is the last
 * frame (demo-beats.ts). Beat 0 empties the window without transitions (.is-reset); the last beat fades it (.is-out).
 * `flags` light classes on the window for spans of beats; `flights` send a lit copy of some words across the window
 * (.sd-ghost). Narrow windows that scroll to their end ([data-shift]) get how far as --sd-shift.
 */
export function DemoRun({
  className,
  label,
  beats,
  flags = {},
  flights = [],
  children,
}: {
  className: string;
  label: string;
  beats: readonly number[];
  flags?: Record<string, Flag>;
  flights?: readonly Flight[];
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hold = beats.length - 2;
  const held = Object.entries(flags)
    .filter(([, flag]) => lit(flag, hold))
    .map(([name]) => name);
  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const parts = Array.from(root.querySelectorAll<HTMLElement>("[data-in], [data-scan], [data-done], [data-step]")).map((el) => ({
      el,
      in: read(el.dataset.in),
      scan: read(el.dataset.scan),
      done: read(el.dataset.done),
      step: read(el.dataset.step) as readonly [number, number] | undefined,
    }));
    const body = root.querySelector<HTMLElement>(".sd__body");
    const ghost = root.querySelector<HTMLElement>(".sd-ghost");
    const end = root.querySelector<HTMLElement>("[data-shift]");
    const last = beats.length - 1;
    let beat = 0;
    let timer = 0;
    let shown = false;
    let flight: Animation | null = null;

    const measure = () => {
      if (!body || !end) return;
      root.style.setProperty("--sd-shift", `${Math.max(0, end.offsetTop + end.offsetHeight - body.clientHeight)}px`);
    };
    const stacked = () => getComputedStyle(root).getPropertyValue("--sd-stack").trim() === "1";

    const fly = (order: Flight) => {
      const from = root.querySelector<HTMLElement>(order.from);
      const to = root.querySelector<HTMLElement>(order.to);
      if (!ghost || !body || !from || !to || typeof ghost.animate !== "function" || (order.wide && stacked())) return;
      const base = body.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const dx = b.left - a.left;
      const dy = b.top - a.top;
      ghost.textContent = from.dataset.ghost ?? from.textContent ?? "";
      ghost.style.left = `${a.left - base.left}px`;
      ghost.style.top = `${a.top - base.top}px`;
      flight?.cancel();
      flight = ghost.animate(
        [
          { transform: "translate(0, 0) scale(0.96)", opacity: 0 },
          { transform: "translate(0, 0) scale(1)", opacity: 1, offset: 0.16 },
          { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 1, offset: 0.84 },
          { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 0 },
        ],
        { duration: 1100, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
    };

    const show = (n: number) => {
      beat = n;
      root.classList.toggle("is-reset", n === 0);
      root.classList.toggle("is-out", n === last);
      for (const p of parts) {
        if (p.in !== undefined) p.el.classList.toggle("is-in", within(p.in, n));
        if (p.scan !== undefined) p.el.classList.toggle("is-scan", within(p.scan, n));
        if (p.done !== undefined) p.el.classList.toggle("is-done", within(p.done, n));
        if (p.step) {
          p.el.classList.toggle("is-on", within(p.step, n));
          p.el.classList.toggle("is-done", n >= p.step[1]);
        }
      }
      for (const [name, flag] of Object.entries(flags)) root.classList.toggle(name, n !== last && lit(flag, n));
      if (n === 0) flight?.cancel();
      for (const order of flights) if (order.at === n) fly(order);
    };
    const tick = () => {
      show((beat + 1) % beats.length);
      timer = window.setTimeout(tick, beats[beat]);
    };
    const play = () => {
      window.clearTimeout(timer);
      if (shown && !document.hidden) timer = window.setTimeout(tick, beats[beat]);
    };

    root.classList.add("is-live");
    show(0);
    measure();
    const io = new IntersectionObserver(
      ([entry]) => {
        shown = entry.isIntersecting;
        play();
      },
      { threshold: 0.6 },
    );
    io.observe(root);
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    document.addEventListener("visibilitychange", play);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", play);
      flight?.cancel();
    };
    // the beats, flags and flights are the page's constants
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={ref} className={[className, ...held].join(" ")} role="img" aria-label={label}>
      {children}
    </div>
  );
}
