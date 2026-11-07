"use client";
import { useEffect } from "react";
import { whenCurtainLifts } from "@/lib/curtain";

/** Starts the page's behaviour (runtime/ads-runtime.js: the scenes, the reveals, the steps' line, the quick picks, the
 *  price cards' «Обговорити») once the page is in. */
export function AdsRuntime() {
  useEffect(() => {
    let alive = true;
    // (reached through the page curtain: its scenes start as it lifts, not behind it)
    void Promise.all([import("./runtime/ads-runtime.js"), whenCurtainLifts()]).then(([{ startAds }]) => alive && startAds());
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
