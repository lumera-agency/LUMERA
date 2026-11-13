"use client";
import { useLayoutEffect } from "react";
import { afterRoll } from "@/lib/boot";
import { isLite } from "@/lib/lite";
import { watchSection } from "@/lib/perf/sections";

type Part = { destroy: () => void };
type Clips = typeof import("./demos/timelines.js");

/** the clips' code once it has come (a language switch starts the block anew, with the code at hand) */
let clipsCode: Clips | null = null;

/**
 * The block's live parts, started once it is in the page: the demo clips (demos/timelines.js), the
 * horizontal ride (fx/horizontal-ride), the dialogs, the stack and the phone switcher (behaviors.js).
 * The modules are framework-free and load in the browser only. They come down with the block: a
 * language switch renders it anew and starts them again on the new markup.
 * The ride and the stack pin the block and change the page's height, so they start with the page; the clips only
 * play inside it, and in FULL their code comes as the visitor nears the block (until then each window holds its
 * clip's finished frame, the CSS default, out of sight). The switcher and the stack ask the clips through
 * demos/control.js, which keeps what they asked until a clip is built.
 */
export function ServicesClient() {
  // a layout effect: a language switch commits as a transition, where a passive effect runs after the
  // paint and the ride would show as a list first. The modules are cached by then, so the imports
  // resolve in this task's microtasks, still before the paint
  useLayoutEffect(() => {
    let alive = true;
    let parts: Part[] = [];
    let clips: Part | null = null;
    let stopWatching = () => {};
    const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startClips = (code: Clips) => {
      clipsCode = code;
      if (alive && !clips) clips = code.initDemos({ motion, reducedMotion: !motion });
    };
    (async () => {
      // (LITE as before: the clips' code with the block's)
      const [{ initRide }, { initServices }, { refreshSoon }, nowCode] = await Promise.all([
        import("@/components/fx/horizontal-ride/ride.js"),
        import("./behaviors.js"),
        import("@/lib/gsap"),
        clipsCode || isLite() ? import("./demos/timelines.js") : null,
      ]);
      if (!alive) return; // gone before the imports came in: nothing to start
      // the ride and the stack pin: set up after the preloader's roll (lib/boot)
      await afterRoll();
      if (!alive) return;
      if (nowCode) startClips(nowCode);
      parts = [
        initRide({ motion }), // before the stack: it stands down where the ride is on
        initServices({ motion, reducedMotion: !motion }),
      ];
      // the switcher and the ride change the block's layout: every trigger below is measured again (once for all the
      // blocks that start now: lib/gsap refreshSoon)
      refreshSoon();
      const section = document.getElementById("services");
      if (clips || !section) {
        if (!clips) startClips(await import("./demos/timelines.js"));
        return;
      }
      // half a screen before the block's top comes into view, built at once: a clip built in sight would jump from its
      // finished frame to its start
      stopWatching = watchSection(section, { preload: () => import("./demos/timelines.js").then(startClips) }, { name: "service clips", near: 0.5 });
    })();
    return () => {
      alive = false;
      stopWatching();
      // the last started goes first: the stack and the switcher still call into the clips
      parts.reverse().forEach((part) => part.destroy());
      parts = [];
      clips?.destroy();
      clips = null;
    };
  }, []);
  return null;
}
