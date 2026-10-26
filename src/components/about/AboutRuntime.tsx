"use client";
import { useEffect } from "react";

/** Starts the page's behaviour (runtime/about-runtime.js: the cards coming in, the tilt, the sticky bar) once the page
 *  is in. */
export function AboutRuntime() {
  useEffect(() => {
    let alive = true;
    import("./runtime/about-runtime.js").then(({ startAbout }) => alive && startAbout());
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
