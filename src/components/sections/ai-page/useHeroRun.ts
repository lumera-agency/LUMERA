"use client";
/*
 * The AI page's first screen (the owner's pick, 26 Oct 2026: «Пульт»): whether its console may run now. True while the stage is in
 * view (IntersectionObserver 0.15), block 2 does not cover the pinned first screen (watchCover, "#case") and the tab
 * is visible; never with reduced motion. It also sets .is-on on the stage, and pauses / resumes the stage's own
 * WAAPI and CSS animations, so a conductor only has to stop scheduling its next step while it is false.
 */
import { useEffect, useState, type RefObject } from "react";
import { watchCover } from "@/components/sites/hero-fx/hero-cover";

export function useHeroRun(stage: RefObject<HTMLElement | null>) {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const el = stage.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let seen = false;
    let covered = false;
    let now = false;
    const sync = () => {
      const next = seen && !covered && !document.hidden;
      if (next === now) return;
      now = next;
      el.classList.toggle("is-on", next);
      for (const a of el.getAnimations({ subtree: true })) {
        if (next) {
          if (a.playState === "paused") a.play();
        } else if (a.playState === "running") a.pause();
      }
      setRunning(next);
    };
    const io = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      sync();
    }, { threshold: 0.15 });
    io.observe(el);
    const stop = watchCover((c) => {
      covered = c;
      sync();
    }, "#case");
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      stop();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [stage]);
  return running;
}
