"use client";
import { useEffect, useRef } from "react";

/**
 * The search demo's morning (SearchDemo), beat by beat, while a third of the window is on the screen and the tab is
 * seen; it waits where it is otherwise and goes on from there. With reduced motion it does nothing: the markup is the
 * last frame. The beats: 0 an empty morning · 1–4 the ads come in · 5–8 the robot checks one ad each (9 decides the
 * last) · 10 the one that fits goes over to the chat · 11 the order arrives · 12 its row in the table · 13 the morning
 * fades, and again.
 */
const BEATS = [700, 420, 420, 420, 800, 760, 760, 760, 760, 650, 650, 1000, 3600, 700];
const SENT = 10;

export function SearchRun({ className, label, children }: { className: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ads = Array.from(root.querySelectorAll<HTMLElement>(".sd-ad"));
    const steps = Array.from(root.querySelectorAll<HTMLElement>(".sd__step"));
    const card = root.querySelector<HTMLElement>(".sd-card");
    const sheet = root.querySelector<HTMLElement>(".sd-sheet");
    const ghost = root.querySelector<HTMLElement>(".sd-ghost");
    const body = root.querySelector<HTMLElement>(".sd__body");
    const tg = root.querySelector<HTMLElement>(".sd__tg");
    let beat = 0;
    let timer = 0;
    let shown = false;
    let flight: Animation | null = null;

    /** narrow windows scroll from the ads down to the chat: by as much as the chat's foot is under the window's */
    const measure = () => {
      if (!body || !tg) return;
      root.style.setProperty("--sd-shift", `${Math.max(0, tg.offsetTop + tg.offsetHeight - body.clientHeight)}px`);
    };
    const stacked = () => getComputedStyle(root).getPropertyValue("--sd-stack").trim() === "1";

    /** the order that fits, from its row to the order's title in the chat (wide windows; narrow ones scroll instead) */
    const fly = () => {
      const from = root.querySelector<HTMLElement>(".sd-ad--ok .sd-ad__t");
      const to = root.querySelector<HTMLElement>(".sd-card__t");
      if (!ghost || !body || !from || !to || typeof ghost.animate !== "function" || stacked()) return;
      const base = body.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const dx = b.left - a.left;
      const dy = b.top - a.top;
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
        { duration: 1150, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
    };

    const show = (n: number) => {
      beat = n;
      const stage = n < 5 ? 0 : n < SENT ? 1 : 2;
      root.classList.toggle("is-reset", n === 0);
      ads.forEach((ad, i) => {
        ad.classList.toggle("is-in", n >= i + 1);
        ad.classList.toggle("is-scan", n === i + 5);
        ad.classList.toggle("is-done", n >= i + 6);
      });
      steps.forEach((step, i) => {
        step.classList.toggle("is-on", i === stage);
        step.classList.toggle("is-done", i < stage);
      });
      root.classList.toggle("is-busy", stage === 1);
      root.classList.toggle("is-sent", n >= SENT && n < BEATS.length - 1);
      card?.classList.toggle("is-in", n > SENT);
      sheet?.classList.toggle("is-in", n > SENT + 1);
      root.classList.toggle("is-out", n === BEATS.length - 1);
      if (n === 0) flight?.cancel();
      if (n === SENT) fly();
    };
    const tick = () => {
      show((beat + 1) % BEATS.length);
      timer = window.setTimeout(tick, BEATS[beat]);
    };
    const play = () => {
      window.clearTimeout(timer);
      if (shown && !document.hidden) timer = window.setTimeout(tick, BEATS[beat]);
    };

    root.classList.add("is-live");
    show(0);
    measure();
    const io = new IntersectionObserver(
      ([entry]) => {
        shown = entry.isIntersecting;
        play();
      },
      { threshold: 0.33 },
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
  }, []);
  return (
    <div ref={ref} className={className} role="img" aria-label={label}>
      {children}
    </div>
  );
}
