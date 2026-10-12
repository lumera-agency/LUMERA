"use client";
import { useEffect } from "react";

/**
 * The block's live parts, started once it is in the page: the demo clips (demos/timelines.js), the
 * horizontal ride (fx/horizontal-ride), the dialogs, the stack and the phone switcher (behaviors.js).
 * The modules are framework-free and load in the browser only.
 */
export function ServicesClient() {
  useEffect(() => {
    let alive = true;
    const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    (async () => {
      const [{ initDemos }, { initRide }, { initServices }, { ScrollTrigger }] = await Promise.all([
        import("./demos/timelines.js"),
        import("@/components/fx/horizontal-ride/ride.js"),
        import("./behaviors.js"),
        import("@/lib/gsap"),
      ]);
      if (!alive) return;
      initDemos({ motion, reducedMotion: !motion });
      initRide({ motion }); // before the stack: it stands down where the ride is on
      initServices({ motion, reducedMotion: !motion });
      // the switcher and the ride change the block's layout: every trigger below is measured again
      requestAnimationFrame(() => ScrollTrigger.refresh());
    })();
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
