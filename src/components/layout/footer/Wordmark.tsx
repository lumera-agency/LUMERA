"use client";
import { useLayoutEffect, useRef } from "react";
import { brandName } from "@/config/site";

/**
 * The brand's name at the very end of the page, in liquid chrome (fx/chrome-wordmark, plain WebGL): set up
 * ahead in a pause of the scrolling, rendered only while the footer is on screen; an ivory lens
 * follows the cursor. Without WebGL the CSS text with a static chrome gradient stays. The effect reads the word off
 * this text and measures everything from it, so the name in config/site is the only place it is set.
 * A layout effect: after a language switch (the footer's own UA · RU) the module is in already and the mark is live
 * before the page is painted; leaving stops it and lets its WebGL context go.
 */
export function Wordmark() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let alive = true;
    let mark: { destroy(): void } | undefined;
    import("@/components/fx/chrome-wordmark/wordmark.js").then(({ initWordmark }) => {
      if (alive) mark = initWordmark({ reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches, root: root.current });
    });
    return () => {
      alive = false;
      mark?.destroy();
    };
  }, []);
  return (
    <div className="container footer__mark" data-wordmark="" aria-hidden="true" ref={root}>
      <span className="footer__mark-text">{brandName}</span>
      <canvas className="footer__mark-canvas" />
      <span className="footer__drop" data-slot="drop" />
    </div>
  );
}
