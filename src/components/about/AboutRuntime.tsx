"use client";
import { useEffect } from "react";

/** Starts the page's behaviour once the page is in: the shared parts (runtime/about-runtime.js: the parts coming in, the
 *  labels' shuffle, where the visitor lands), then the blocks' own scenes (runtime/pb.js: the desk, the notes). */
export function AboutRuntime() {
  useEffect(() => {
    let alive = true;
    import("./runtime/about-runtime.js")
      .then(({ startAbout }) => alive && startAbout())
      .then(() => import("./runtime/pb.js"))
      .then(({ start }) => alive && start());
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
