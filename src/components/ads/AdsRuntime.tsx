"use client";
import { useEffect } from "react";

/** Starts the page's behaviour (runtime/ads-runtime.js: the scenes, the reveals, the steps' line, the quick picks, the
 *  price cards' «Обговорити», the sticky bar) once the page is in. */
export function AdsRuntime() {
  useEffect(() => {
    let alive = true;
    import("./runtime/ads-runtime.js").then(({ startAds }) => alive && startAds());
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
