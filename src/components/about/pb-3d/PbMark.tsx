"use client";
/*
 * «Про нас», B, the first screen's object: the studio's mark in chrome (scene.ts). The still (the scene's own first
 * frame, rendered once: public/img/about/pb-mark.webp) is in the page's HTML and stays wherever the live object can't
 * or shouldn't run: reduced motion, Save-Data, no WebGL, phones and small tablets (≤ 860 px: the still only, so the page
 * stays light there). Elsewhere the scene is asked for once the page has loaded and the browser has a moment; it takes
 * over the still from the same pose (.is-live fades the canvas in over it) and then turns slowly. Decorative: hidden
 * from screen readers, no pointer events (the lean reads the pointer from the window, a mouse only).
 */
import { useEffect, useRef } from "react";

/** the still: the scene's pose at t = 0, rendered from scene.ts (window.__pbMark.snap in development) */
const STILL = "/img/about/pb-mark.webp";
const STILL_S = "/img/about/pb-mark-s.webp";

/** the live object: wide screens only */
const LIVE = "(min-width: 861px)";
const MOUSE = "(hover: hover) and (pointer: fine)";

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function PbMark() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia(LIVE).matches || !canWebGL()) return;
    let alive = true;
    let destroy: (() => void) | null = null;
    let idle = 0;
    const go = () => {
      const run = () => {
        void import("./scene").then(({ mountMark }) => {
          if (!alive) return;
          try {
            destroy = mountMark(el, {
              maxDpr: matchMedia("(pointer: coarse)").matches ? 1 : 1.5,
              lean: matchMedia(MOUSE).matches,
              onReady: () => alive && box.classList.add("is-live"),
            });
          } catch (error) {
            console.warn("[pb-mark] the still stays.", error);
          }
        });
      };
      idle = typeof requestIdleCallback === "function" ? requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 200);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      alive = false;
      window.removeEventListener("load", go);
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      clearTimeout(idle);
      box.classList.remove("is-live");
      destroy?.();
    };
  }, []);
  return (
    <div className="pb-mark" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed still under the canvas, sized by its box */}
      <img
        className="pb-mark__still"
        src={STILL}
        srcSet={`${STILL_S} 480w, ${STILL} 960w`}
        sizes="(max-width: 860px) 40vw, 30vw"
        width={960}
        height={960}
        alt=""
        decoding="async"
      />
      <div ref={host} className="pb-mark__gl-box" />
    </div>
  );
}
