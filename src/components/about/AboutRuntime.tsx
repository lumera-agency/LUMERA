"use client";
import { useEffect } from "react";

/** TEMPORARY: each whole-page variant's own scenes (?p=a|b|c), loaded after the page's shared ones */
const VARIANT_RUNTIME: Record<string, () => Promise<{ start: () => void }>> = {
  a: () => import("./runtime/pa.js"),
  b: () => import("./runtime/pb.js"),
  c: () => import("./runtime/pc.js"),
};

/** Starts the page's behaviour (runtime/about-runtime.js: the cards coming in, the tilt, the sticky bar) once the page
 *  is in. */
export function AboutRuntime() {
  useEffect(() => {
    let alive = true;
    import("./runtime/about-runtime.js").then(({ startAbout }) => alive && startAbout());
    const p = document.querySelector("main[data-about-p]")?.getAttribute("data-about-p");
    if (p && VARIANT_RUNTIME[p]) VARIANT_RUNTIME[p]().then(({ start }) => alive && start());
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
