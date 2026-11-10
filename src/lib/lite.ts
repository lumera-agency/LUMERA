"use client";
/*
 * A slow computer (the owner, 10 Nov 2026, after «на рабочем компьютере сильно лагает»): html.is-lite, set by PerfProbe
 * once it has measured slow frames (or a software renderer), kept for the visit (sessionStorage, read back before the
 * first paint by the layout's early script). It takes away the glide only (SmoothScroll): everything else is the
 * same for every computer, the site's light look (no grain, no glass blurs, still glows and shards, the 3D at one
 * pixel per CSS pixel) being everyone's since the same day.
 */
import { useSyncExternalStore } from "react";

const CLASS = "is-lite";
export const LITE_KEY = "eclo:lite";

const listeners = new Set<() => void>();

export const isLite = () => typeof document !== "undefined" && document.documentElement.classList.contains(CLASS);

/** Switches the light mode on for the rest of the visit. */
export function goLite() {
  if (isLite()) return;
  document.documentElement.classList.add(CLASS);
  try {
    sessionStorage.setItem(LITE_KEY, "1");
  } catch {}
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** Whether the light mode is on (false on the server and in the hydrating render; the browser's answer right after). */
export const useLite = () => useSyncExternalStore(subscribe, isLite, () => false);
