"use client";
/*
 * The page's start-up, shared by the components that take part in it: the preloader's clock
 * (index script, window.lumeraLoader), the hero's 3D scene (loaded → shaders compiled) and the
 * intro. Signals are one-shot promises; the scene's run state is a tiny store.
 */
import { useSyncExternalStore } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { scrollToY } from "@/lib/scroll";

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

/** Resolves once the preloader lets the page go (html.is-loading off) and Lenis has had a frame to start. */
export function pageLetGo() {
  return new Promise<void>((resolve) => {
    const root = document.documentElement;
    const free = () => !root.classList.contains("is-loading");
    const done = () => requestAnimationFrame(() => resolve());
    if (free()) return done();
    const mo = new MutationObserver(() => {
      if (!free()) return;
      mo.disconnect();
      done();
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
  });
}

/**
 * Opened afresh by a link to a block (/ru#faq): the browser jumps there while the page is still being
 * laid out (the preloader holds it, the pinned blocks add their room later) and ends up elsewhere.
 * Called once the page is let go, it goes there through Lenis, and follows the block for a moment
 * while the page settles (a pin re-measured, late fonts), until the visitor scrolls themselves.
 */
export function jumpToHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const el = id ? document.getElementById(id) : null;
  if (!el) return false;
  let moved = false;
  const own = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  const mine = () => void (moved = true);
  own.forEach((type) => window.addEventListener(type, mine, { passive: true }));
  const go = () => {
    if (moved) return;
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0; // under the topbar
    scrollToY(el.getBoundingClientRect().top + window.scrollY - margin, { immediate: true });
  };
  ScrollTrigger.refresh(); // the pins' room in place before measuring
  go();
  const again = () => requestAnimationFrame(go);
  ScrollTrigger.addEventListener("refresh", again);
  window.setTimeout(() => {
    ScrollTrigger.removeEventListener("refresh", again);
    own.forEach((type) => window.removeEventListener(type, mine));
  }, 4000);
  window.setTimeout(again, 600);
  return true;
}
