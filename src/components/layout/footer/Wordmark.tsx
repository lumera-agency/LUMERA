"use client";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { brandName } from "@/config/site";
import { canRunFull, isLite, useLite, watchMode } from "@/lib/perf/mode";

/** the effect's code is in already (a language switch finds it so and starts at once) */
let fetched = false;

/** The still that stands where no graphics card draws the chrome: a frame of it cut to the letters (tools/capture-mark.mjs, mark-still.py). */
const STILL = { wide: "/img/footer/eclo-chrome-d.webp", narrow: "/img/footer/eclo-chrome-m.webp", width: 2000, height: 421 };

/**
 * The brand's name at the very end of the page, in liquid chrome (fx/chrome-wordmark, plain WebGL): set up as the
 * visitor nears the footer, in a pause of the scrolling (wordmark.js), rendered only while the footer is on screen; an ivory lens
 * follows the cursor. Without WebGL the CSS text with a static chrome gradient stays. The effect reads the word off
 * this text and measures everything from it, so the name in config/site is the only place it is set.
 * LITE keeps the effect, calm (the owner, 12 Nov 2026: «в лайт версии не надо чтоб был хром переливающийся, хватит
 * картинки, но с линзой»; for a day a plain still stood there): the metal stands as a picture, drawn once, and the
 * lens follows the cursor as in FULL; frames are drawn only while the lens is out. Only LITE without a graphics card
 * (no WebGL, a software renderer, where the shader would run on the processor) shows a still of that chrome in its
 * place, with no lens, sized as the live mark is (footer.css, [data-still]); the effect's code is not fetched there,
 * and the picture is asked for only near the footer. The still is a picture of the word ECLO: a new name needs a new
 * frame.
 * Its code is asked for once the browser is idle after the page has loaded, not with the first screen's (11 Nov 2026:
 * it was fetched in the page's first fifth of a second for a block at its very end).
 * A layout effect: after a language switch (the footer's own UA · RU) the module is in already and the mark is live
 * before the page is painted; leaving stops it and lets its WebGL context go. A page that goes LITE keeps its mark
 * and brings its metal to rest where it is (setCalm).
 */
/** LITE without a graphics card: the still stands and the effect is not started */
const stillOnly = () => isLite() && !canRunFull();

export function Wordmark() {
  const root = useRef<HTMLDivElement>(null);
  const still = useSyncExternalStore(watchMode, stillOnly, () => false);
  const lite = useLite();
  const live = useRef<{ setCalm(on: boolean): void; destroy(): void } | null>(null);
  useLayoutEffect(() => {
    // (asked of the page itself: the first render does not know the mode yet)
    if (stillOnly()) return;
    let alive = true;
    // (what cancels the wait, by its own kind: an idle callback's number given to clearTimeout cancels whichever timer
    // happens to have that number; it put out the early script's first timer, so html.is-ready never came in LITE)
    let cancelWait = () => {};
    const start = () =>
      void import("@/components/fx/chrome-wordmark/wordmark.js").then(({ initWordmark }) => {
        fetched = true;
        if (alive) live.current = initWordmark({ reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches, root: root.current, calm: isLite() });
      });
    const whenIdle = () => {
      if (typeof requestIdleCallback === "function") {
        const handle = requestIdleCallback(start, { timeout: 2500 });
        cancelWait = () => cancelIdleCallback(handle);
      } else {
        const timer = window.setTimeout(start, 600);
        cancelWait = () => clearTimeout(timer);
      }
    };
    if (fetched) start();
    else if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      alive = false;
      window.removeEventListener("load", whenIdle);
      cancelWait();
      live.current?.destroy();
      live.current = null;
    };
  }, [still]);
  // the mode changed under a mark that is already built
  useEffect(() => {
    live.current?.setCalm(lite);
  }, [lite]);
  return (
    // (data-lens-handoff: the footer's pointer lens hands over to the mark's own at its edge at once: InvertCursor)
    <div className="container footer__mark" data-wordmark="" data-still={still ? "" : undefined} data-lens-handoff={still ? undefined : ""} aria-hidden="true" ref={root}>
      <span className="footer__mark-text">{brandName}</span>
      <canvas className="footer__mark-canvas" />
      {/* (a phone gets the narrow file whatever its screen's density: its mark is a third of a thousand px wide) */}
      <picture className="footer__mark-still">
        <source media="(max-width: 700px)" srcSet={STILL.narrow} />
        {/* (not drawn beside the live mark, so never fetched there) */}
        <img src={STILL.wide} width={STILL.width} height={STILL.height} alt="" loading="lazy" decoding="async" />
      </picture>
      <span className="footer__drop" data-slot="drop" />
    </div>
  );
}
