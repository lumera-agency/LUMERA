"use client";
/*
 * Whether the AI page's console (LiveConsole, ConsoleFx) may run now: while it is in view (IntersectionObserver 0.15)
 * and the tab is visible; never with reduced motion. It also sets .is-on on the stage, and pauses / resumes the stage's
 * own WAAPI and CSS animations, so a conductor only has to stop scheduling its next step while it is false.
 */
import { useEffect, useState, type RefObject } from "react";

export function useConsoleRun(stage: RefObject<HTMLElement | null>) {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const el = stage.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let seen = false;
    let now = false;
    const sync = () => {
      const next = seen && !document.hidden;
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
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [stage]);
  return running;
}
