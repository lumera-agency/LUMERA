"use client";
/*
 * A slow computer (the owner, 10 Nov 2026, after «на рабочем компьютере сильно лагает»): html.is-lite, set by PerfProbe
 * once it has measured slow frames (or a software renderer), kept for the visit (sessionStorage, read back before the
 * first paint by the layout's early script). It takes away the glide (SmoothScroll) and the double density of the
 * home stone and the sites title (HeroScene, TitleFx: a sharp screen draws them at up to 2, a slow computer at 1, the
 * owner, 10 Nov 2026); everything else is the same for every computer, the site's light look (no grain, no glass
 * blurs, still glows and shards) being everyone's since the same day.
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

/** Calls `listener` when the light mode comes on; returns the stop. */
export const watchLite = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** Whether the light mode is on (false on the server and in the hydrating render; the browser's answer right after). */
export const useLite = () => useSyncExternalStore(watchLite, isLite, () => false);
