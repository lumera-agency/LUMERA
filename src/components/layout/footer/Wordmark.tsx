"use client";
import { useEffect } from "react";

/**
 * LUMERA at the very end of the page, in liquid chrome (fx/chrome-wordmark, plain WebGL): set up
 * ahead in a pause of the scrolling, rendered only while the footer is on screen; an ivory lens
 * follows the cursor. Without WebGL the CSS text with a static chrome gradient stays.
 */
export function Wordmark() {
  useEffect(() => {
    let alive = true;
    import("@/components/fx/chrome-wordmark/wordmark.js").then(({ initWordmark }) => {
      if (alive) initWordmark({ reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches });
    });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="container footer__mark" data-wordmark="" aria-hidden="true">
      <span className="footer__mark-text">LUMERA</span>
      <canvas className="footer__mark-canvas" />
      <span className="footer__drop" data-slot="drop" />
    </div>
  );
}
