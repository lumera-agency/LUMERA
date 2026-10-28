"use client";

type Nav = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

/**
 * Lite graphics: the WebGL scenes stay out and their still pictures (or, for the footer's wordmark, its live
 * text) stand instead. With reduced motion, with Save-Data on, and on a weak device: fewer than 4 cores
 * (Safari reports 4 or 8, so phones that report 4 keep their 3D), 1 GB of memory or less. Chrome rounds deviceMemory to
 * 0.25 / 0.5 / 1 / 2 / 4 / 8: a budget Android with 3 GB reports 2 and runs the scene well, so 2 keeps its 3D.
 */
export function liteGraphics() {
  if (typeof window === "undefined") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const nav = navigator as Nav;
  if (nav.connection?.saveData) return true;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return true;
  return nav.deviceMemory != null && nav.deviceMemory <= 1;
}
