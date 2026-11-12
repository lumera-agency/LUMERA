"use client";
/*
 * The site's two modes (the owner, 11 Nov 2026: FULL and LITE, nothing between them).
 * FULL: everything, the live 3D scenes (the glide, Lenis, is off in both modes since 12 Nov 2026: fx/smooth-scroll).
 * LITE: the same page, content and navigation, no three.js and no Lenis fetched, no preloader, the text's animations off (the list: lib/lite.ts); its 3D objects play as films recorded
 * from the live scenes (the home stone, the robot, the droplet: the owner, 11 Nov 2026, «статические вообще не имеет
 * смысла»), each drawn by one small shader (fx/alpha-film); the ads page's fibres and the sites page's lines are still
 * pictures. Where the browser has no WebGL at all the films cannot be drawn and their stills stand. The footer's
 * chrome name keeps its lens in LITE wherever a graphics card draws it, its metal standing (layout/footer/Wordmark).
 *
 * Who decides, in this order (the early script, lib/perf/early.ts, before anything is drawn; this module after it):
 * 1. what the device cannot do: no WebGL or a software renderer is LITE whatever was chosen;
 * 2. a test for the visit: ?lite=1, ?full=1;
 * 3. the device: a computer by a score of its threads, memory, graphics, connection and its reduced-motion setting,
 *    no single one of them alone; a phone is not scored and stays FULL (the owner, 12 Nov 2026);
 * 4. the frames the page really keeps (lib/perf/monitor.ts): a FULL page that stays slow goes LITE for the visit.
 * LITE never goes back to FULL by itself, so the mode cannot flip back and forth.
 */
import { useSyncExternalStore } from "react";

export type Mode = "full" | "lite";

/** sessionStorage: this visit's mode, "1" LITE (a test, or the page was slow), "0" FULL for a test */
export const LITE_KEY = "eclo:lite";
/** sessionStorage: what the early script found out about the device, once a visit */
export const DEVICE_KEY = "eclo:device";

const CLASS = "is-lite";
const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render|software/i;

const listeners = new Set<() => void>();
const root = () => document.documentElement;
const write = (store: "sessionStorage", key: string, value: string) => {
  try {
    window[store].setItem(key, value);
  } catch {}
};

export const isLite = () => typeof document !== "undefined" && root().classList.contains(CLASS);
export const getMode = (): Mode => (isLite() ? "lite" : "full");
/** Why the page is in its mode: "weak", "test", "no-webgl", "software", "slow", "default". */
export const modeReason = () => (typeof document === "undefined" ? "default" : root().dataset.modeWhy || "default");

let graphics: "none" | "software" | "ok" | undefined;
/** What this browser's WebGL is: asked once, the probe's context released. */
function probeGraphics() {
  if (graphics) return graphics;
  // a computer's graphics the early script found out once this visit (lib/perf/early.ts, DEVICE_KEY: "computer|limit|
  // score", limit "no-webgl", "software" or none): that answer stands, so no second throwaway context is made on every
  // page (12 Nov 2026: 5 to 6 ms a load, 254 ms on a busy machine). A phone is not looked at there: asked here
  try {
    const facts = sessionStorage.getItem(DEVICE_KEY)?.split("|");
    if (facts?.[0] === "computer") return (graphics = facts[1] === "no-webgl" ? "none" : facts[1] === "software" ? "software" : "ok");
  } catch {}
  try {
    const context = document.createElement("canvas").getContext("webgl");
    const info = context?.getExtension("WEBGL_debug_renderer_info");
    const name = context && info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    graphics = !context ? "none" : SOFTWARE.test(name) ? "software" : "ok";
  } catch {
    graphics = "none";
  }
  return graphics;
}

/** Whether FULL can run here at all: a graphics card behind WebGL. */
export const canRunFull = () => probeGraphics() === "ok";

/**
 * Whether a live WebGL effect may start (a 3D scene, a shader canvas): never in LITE, and only where the browser has
 * WebGL. Every canvas effect asks this before it makes its context.
 */
export const allowWebGL = () => !isLite() && probeGraphics() !== "none";

/**
 * Whether a film with its own transparency may play (fx/alpha-film): in both modes, wherever the browser has WebGL (the
 * film's two halves are put together by one small shader; no three.js comes with it).
 */
export const allowFilm = () => probeGraphics() !== "none";

function apply(mode: Mode, why: string) {
  root().classList.toggle(CLASS, mode === "lite");
  root().dataset.mode = mode;
  root().dataset.modeWhy = why;
  listeners.forEach((listener) => listener());
}

/**
 * The page was slow: LITE for the rest of the visit, in place (nothing reloads, the scroll and the forms stay).
 */
export function goLite(why = "slow") {
  if (isLite()) return false;
  write("sessionStorage", LITE_KEY, "1");
  apply("lite", why);
  return true;
}

/** Calls `listener` when the mode changes; returns the stop. */
export const watchMode = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** Whether LITE is on (false on the server and in the hydrating render; the browser's answer right after). */
export const useLite = () => useSyncExternalStore(watchMode, isLite, () => false);

/** Whether a WebGL context may be made (null on the server and in the hydrating render). */
export const useWebGLAllowed = () => useSyncExternalStore<boolean | null>(watchMode, allowWebGL, () => null);
