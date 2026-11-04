"use client";
import { useLayoutEffect } from "react";

type Part = { destroy: () => void };

/**
 * The block's live parts, started once it is in the page: the demo clips (demos/timelines.js), the
 * horizontal ride (fx/horizontal-ride), the dialogs, the stack and the phone switcher (behaviors.js).
 * The modules are framework-free and load in the browser only. They come down with the block: a
 * language switch renders it anew and starts them again on the new markup.
 */
export function ServicesClient() {
  // a layout effect: a language switch commits as a transition, where a passive effect runs after the
  // paint and the ride would show as a list first. The modules are cached by then, so the imports
  // resolve in this task's microtasks, still before the paint
  useLayoutEffect(() => {
    let alive = true;
    let frame = 0;
    let parts: Part[] = [];
    const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    (async () => {
      const [{ initDemos }, { initRide }, { initServices }, { ScrollTrigger }] = await Promise.all([
        import("./demos/timelines.js"),
        import("@/components/fx/horizontal-ride/ride.js"),
        import("./behaviors.js"),
        import("@/lib/gsap"),
      ]);
      if (!alive) return; // gone before the imports came in: nothing to start
      parts = [
        initDemos({ motion, reducedMotion: !motion }),
        initRide({ motion }), // before the stack: it stands down where the ride is on
        initServices({ motion, reducedMotion: !motion }),
      ];
      // the switcher and the ride change the block's layout: every trigger below is measured again
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      // the last started goes first: the stack and the switcher still call into the clips
      parts.reverse().forEach((part) => part.destroy());
      parts = [];
    };
  }, []);
  return null;
}
