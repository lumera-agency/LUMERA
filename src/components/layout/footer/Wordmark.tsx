"use client";
import { useEffect } from "react";
import { brandName } from "@/config/site";
import { liteGraphics } from "@/lib/device";

/**
 * The brand's name at the very end of the page, in liquid chrome (fx/chrome-wordmark, plain WebGL): set up
 * ahead in a pause of the scrolling, rendered only while the footer is on screen; an ivory lens
 * follows the cursor. Without WebGL, and with lite graphics (reduced motion, Save-Data, a weak device: lib/device), the
 * CSS text with a static chrome gradient stays: the word is always there as text. The effect reads the word off
 * this text and measures everything from it, so the name in config/site is the only place it is set.
 */
export function Wordmark() {
  useEffect(() => {
    let alive = true;
    import("@/components/fx/chrome-wordmark/wordmark.js").then(({ initWordmark }) => {
      if (alive) initWordmark({ reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches, textOnly: liteGraphics() });
    });
    return () => {
      alive = false;
    };
  }, []);
  return (
    // data-cursor-size: without WebGL the site's invert cursor is the lens over the word (layout.tsx); data-art: the word's
    // chrome is pre-rendered for this name (img/still/wordmark-eclo*.webp, footer.css), another name keeps the gradient
    <div className="container footer__mark" data-wordmark="" data-cursor-size="220" data-art={brandName === "ECLO" ? "" : undefined} aria-hidden="true">
      <span className="footer__mark-text">{brandName}</span>
      <canvas className="footer__mark-canvas" />
      <span className="footer__drop" data-slot="drop" />
    </div>
  );
}
