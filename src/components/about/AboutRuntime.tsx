"use client";
import { useEffect } from "react";
import { whenCurtainLifts } from "@/lib/curtain";

/** Each page's own scenes: the page as it is (B, runtime/pb.js) and, TEMPORARY, the variants behind ?p=d|e|f */
const SCENES: Record<string, () => Promise<{ start: () => void }>> = {
  b: () => import("./runtime/pb.js"),
  d: () => import("./runtime/pd.js"),
  e: () => import("./runtime/pe.js"),
  f: () => import("./runtime/pf.js"),
};

/** Starts the page's behaviour once the page is in: the shared parts (runtime/about-runtime.js: the parts coming in, the
 *  labels' shuffle, where the visitor lands), then the blocks' own scenes. Reached through the page curtain
 *  (fx/page-curtain), they start as it lifts, not behind it (as the ads page). */
export function AboutRuntime() {
  useEffect(() => {
    let alive = true;
    const p = document.querySelector("main[data-about-p]")?.getAttribute("data-about-p");
    const scenes = SCENES[p && SCENES[p] ? p : "b"];
    void Promise.all([import("./runtime/about-runtime.js"), whenCurtainLifts()])
      .then(([{ startAbout }]) => alive && startAbout())
      .then(scenes)
      .then(({ start }) => alive && start());
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
