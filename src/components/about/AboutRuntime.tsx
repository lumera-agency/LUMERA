"use client";
import { useEffect } from "react";
import { whenCurtainLifts } from "@/lib/curtain";

/** Starts the page's behaviour once the page is in: the shared parts (runtime/about-runtime.js: the parts coming in, the
 *  labels' shuffle, where the visitor lands), then the blocks' own scenes (runtime/pb.js). Reached through the page
 *  curtain (fx/page-curtain), they start as it lifts, not behind it (as the ads page). */
export function AboutRuntime() {
  useEffect(() => {
    let alive = true;
    void Promise.all([import("./runtime/about-runtime.js"), whenCurtainLifts()])
      .then(([{ startAbout }]) => alive && startAbout())
      .then(() => import("./runtime/pb.js"))
      .then(({ start }) => alive && start());
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
