"use client";
/*
 * The page's start-up, shared by the components that take part in it: the preloader's clock
 * (index script, window.lumeraLoader), the hero's 3D scene (loaded → shaders compiled) and the
 * intro. Signals are one-shot promises; the scene's run state is a tiny store.
 */
import { useSyncExternalStore } from "react";

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

export const boot = {
  /** the scene's module is in (three.js loaded) */
  sceneLoaded: deferred(),
  /** its shaders are compiled: the first frames won't stall */
  sceneReady: deferred(),
  /** the intro has played: work that waits for a quiet first screen may start */
  introDone: deferred(),
};

let running = false;
const listeners = new Set<() => void>();
/** Whether the hero's canvases render frames (off before the intro, off-screen, in a hidden tab). */
export const sceneRun = {
  get: () => running,
  set(value: boolean) {
    if (value === running) return;
    running = value;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
};
export const useSceneRunning = () => useSyncExternalStore(sceneRun.subscribe, sceneRun.get, () => false);

/** The preloader's clock (its inline script in fx/preloader/Preloader.tsx). */
export type PreloaderClock = { step(progress: number, stage?: number): void; finish(): Promise<void> };
declare global {
  interface Window {
    lumeraLoader?: PreloaderClock;
  }
}
export const loader = () => (typeof window === "undefined" ? undefined : window.lumeraLoader);

/** Back where the visitor was after a language switch (layout/lang-switch). */
export function restoreScroll() {
  try {
    const y = sessionStorage.getItem("lumera:lang-scroll");
    if (y == null) return false;
    sessionStorage.removeItem("lumera:lang-scroll");
    window.scrollTo({ top: Number(y), behavior: "instant" });
    return true;
  } catch {
    return false;
  }
}
