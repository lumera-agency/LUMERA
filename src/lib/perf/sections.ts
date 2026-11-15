"use client";
/*
 * The page's heavy parts by where the visitor is (the owner, 11 Nov 2026: only what is needed now is fetched, runs and
 * holds memory). A part (a block's scripts, a 3D scene, a canvas effect) is registered with its element and goes
 * through:
 *
 *   unloaded → preloading → ready → active ⇄ paused → disposed → (near again) preloading …
 *
 * - near (within `near` screens of the view): `preload` fetches its code and pictures; nothing runs yet;
 * - on screen: `activate` starts or resumes it; off screen or the tab hidden: `pause` stops its frames;
 * - far for `disposeAfter` ms: `dispose` frees what is heavy (a WebGL context, textures); coming near again it
 *   preloads anew. Without `disposeAfter` a part is kept: nothing is torn down on a small move of the scroll.
 *
 * A fast scroll (several screens a second) passes parts by: one that only came near in passing is not fetched, the
 * part the visitor stops at is. One observer per distance watches every part; the scroll's speed and direction are
 * read from one passive listener (scrollMotion, for whoever needs them).
 *
 * A part that changes the page's height when it starts (`layout: true`) can be asked for ahead of a jump to a block
 * below it or of putting the visitor back at a kept place (settleLayout), so the place measured is the final one.
 * `fullOnly`: the part exists in FULL alone; in LITE it is never fetched, and a page going LITE disposes it.
 */
import { isLite, watchMode } from "./mode";

export type SectionPhase = "unloaded" | "preloading" | "ready" | "active" | "paused" | "disposed";

export type SectionHooks = {
  /** Fetch what the part needs; it is ready when this resolves. Called again after a dispose. */
  preload?: () => Promise<unknown> | void;
  /** On screen: start, or carry on. */
  activate?: () => void;
  /** Off screen, or the tab hidden: stop the frames, keep the state. */
  pause?: () => void;
  /** Far away for a while, or the page went LITE: free what is heavy. */
  dispose?: () => void;
};

export type SectionOptions = {
  /** for the monitor's report */
  name?: string;
  /** screens around the view within which the part is fetched (1.5 by default) */
  near?: number;
  /** ms far from the view before `dispose` (never by default) */
  disposeAfter?: number;
  /** starting it changes the page's height: settleLayout waits for it */
  layout?: boolean;
  /** FULL only */
  fullOnly?: boolean;
};

type Section = {
  el: Element;
  hooks: SectionHooks;
  options: Required<Pick<SectionOptions, "near" | "disposeAfter" | "layout" | "fullOnly">> & { name: string };
  phase: SectionPhase;
  near: boolean;
  onScreen: boolean;
  /** the preload under way (settleLayout waits for it) */
  loading: Promise<void> | null;
  disposeTimer: number;
  passTimer: number;
};

/** screens a second above which a scroll counts as passing by */
const FAST = 3;
/** ms between two looks at a part that came near during a fast scroll */
const PASS_WAIT = 140;

const sections = new Set<Section>();
/** the parts by their element (several may watch one) */
const byElement = new Map<Element, Set<Section>>();
const nearObservers = new Map<number, IntersectionObserver>();
let screenObserver: IntersectionObserver | null = null;
let listening = false;

const motion = { y: 0, at: 0, speed: 0, direction: 0 as -1 | 0 | 1 };
/** The scroll now: where, how fast (screens a second, smoothed) and which way (1 down, -1 up). */
export const scrollMotion = () => {
  // (a scroll that has stopped has no speed: the last event's would stand forever)
  if (performance.now() - motion.at > 200) motion.speed = 0;
  return motion;
};

function onScroll() {
  const now = performance.now();
  const y = window.scrollY;
  const elapsed = now - motion.at;
  if (elapsed > 0 && elapsed < 400) {
    const screensPerSecond = Math.abs(y - motion.y) / Math.max(1, window.innerHeight) / (elapsed / 1000);
    motion.speed = motion.speed * 0.6 + screensPerSecond * 0.4;
  } else motion.speed = 0;
  motion.direction = y > motion.y ? 1 : y < motion.y ? -1 : motion.direction;
  motion.y = y;
  motion.at = now;
}

function onVisibility() {
  for (const section of sections) sync(section);
}

function onMode() {
  if (!isLite()) return;
  for (const section of sections) if (section.options.fullOnly) drop(section);
}

function listen() {
  if (listening) return;
  listening = true;
  motion.y = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  watchMode(onMode);
}

function nearObserver(screens: number) {
  let observer = nearObservers.get(screens);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          for (const section of byElement.get(entry.target) ?? []) {
            if (section.options.near !== screens) continue;
            section.near = entry.isIntersecting;
            sync(section);
          }
        }
      },
      { rootMargin: `${screens * 100}% 0px` },
    );
    nearObservers.set(screens, observer);
  }
  return observer;
}

function onScreenObserver() {
  screenObserver ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      for (const section of byElement.get(entry.target) ?? []) {
        section.onScreen = entry.isIntersecting;
        sync(section);
      }
    }
  });
  return screenObserver;
}

/** Frees a part's heavy things now. */
function drop(section: Section) {
  clearTimeout(section.disposeTimer);
  clearTimeout(section.passTimer);
  section.disposeTimer = section.passTimer = 0;
  if (section.phase === "active") section.hooks.pause?.();
  if (section.phase === "active" || section.phase === "paused" || section.phase === "ready") section.hooks.dispose?.();
  if (section.phase !== "unloaded") section.phase = "disposed";
}

function load(section: Section) {
  clearTimeout(section.passTimer);
  section.passTimer = 0;
  if (section.loading) return section.loading;
  section.phase = "preloading";
  const done = () => {
    section.loading = null;
    // (dropped meanwhile: the page went LITE, or the part was taken off)
    if (section.phase !== "preloading" || !sections.has(section)) return;
    section.phase = "ready";
    sync(section);
  };
  section.loading = Promise.resolve()
    .then(() => section.hooks.preload?.())
    .then(() => undefined, (error) => console.warn(`[sections] ${section.options.name}: preload failed.`, error))
    .then(done);
  return section.loading;
}

/** Moves a part to the phase its place on the page calls for. */
function sync(section: Section) {
  const { hooks, options } = section;
  if (options.fullOnly && isLite()) return;
  const shown = section.onScreen && !document.hidden;

  if (section.phase === "unloaded" || section.phase === "disposed") {
    if (!section.near && !section.onScreen) return;
    // passing by at speed: fetched only if the visitor stops here, or it is on screen already
    if (!section.onScreen && scrollMotion().speed > FAST) {
      if (!section.passTimer) {
        section.passTimer = window.setTimeout(() => {
          section.passTimer = 0;
          sync(section);
        }, PASS_WAIT);
      }
      return;
    }
    void load(section);
    return;
  }
  if (section.phase === "preloading") return;

  if (shown && section.phase !== "active") {
    clearTimeout(section.disposeTimer);
    section.disposeTimer = 0;
    section.phase = "active";
    hooks.activate?.();
  } else if (!shown && section.phase === "active") {
    section.phase = "paused";
    hooks.pause?.();
  }

  if (!options.disposeAfter) return;
  if (section.near || section.onScreen) {
    clearTimeout(section.disposeTimer);
    section.disposeTimer = 0;
  } else if (!section.disposeTimer && (section.phase === "paused" || section.phase === "ready")) {
    section.disposeTimer = window.setTimeout(() => {
      section.disposeTimer = 0;
      if (!section.near && !section.onScreen) drop(section);
    }, options.disposeAfter);
  }
}

/** Registers a part of the page; returns the stop (which pauses and disposes it). */
export function watchSection(el: Element, hooks: SectionHooks, options: SectionOptions = {}) {
  listen();
  const section: Section = {
    el,
    hooks,
    options: { name: options.name ?? (el.id || el.className.toString().split(" ")[0] || "part"), near: options.near ?? 1.5, disposeAfter: options.disposeAfter ?? 0, layout: options.layout ?? false, fullOnly: options.fullOnly ?? false },
    phase: "unloaded",
    near: false,
    onScreen: false,
    loading: null,
    disposeTimer: 0,
    passTimer: 0,
  };
  sections.add(section);
  const sharing = byElement.get(el) ?? new Set<Section>();
  sharing.add(section);
  byElement.set(el, sharing);
  // (observed anew even where another part watches the element already: an observer tells an element's state only
  // when it starts to watch it, and this part needs to be told too)
  for (const observer of [nearObserver(section.options.near), onScreenObserver()]) {
    observer.unobserve(el);
    observer.observe(el);
  }
  return () => {
    drop(section);
    sections.delete(section);
    sharing.delete(section);
    if (sharing.size) return;
    // (the element's last part: the observers let it go)
    byElement.delete(el);
    nearObservers.forEach((observer) => observer.unobserve(el));
    screenObserver?.unobserve(el);
  };
}

/**
 * The parts that change the page's height (`layout: true`) are started now, wherever they are: all of them, or those
 * above `before` only. Resolves once they are in, so a place measured after it is the final one.
 */
export function settleLayout(before?: Element) {
  const waits: Promise<void>[] = [];
  for (const section of sections) {
    if (!section.options.layout || (section.options.fullOnly && isLite())) continue;
    if (section.phase !== "unloaded" && section.phase !== "preloading" && section.phase !== "disposed") continue;
    if (before && !(section.el.compareDocumentPosition(before) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
    waits.push(load(section));
  }
  return Promise.all(waits).then(() => undefined);
}

/** Whether a part that changes the page's height is still to come (above `before`, or anywhere). */
export function layoutPending(before?: Element) {
  for (const section of sections) {
    if (!section.options.layout || (section.options.fullOnly && isLite())) continue;
    if (section.phase !== "unloaded" && section.phase !== "preloading" && section.phase !== "disposed") continue;
    if (before && !(section.el.compareDocumentPosition(before) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
    return true;
  }
  return false;
}

/**
 * Resolves once the scroll rests (no scroll event for `quiet` ms), or `el` has come within a screen of the view, or
 * `longest` ms have passed. For work that takes one long frame (a block mounted into the page): done while the page
 * moves it shows as a hitch in the scroll, in a pause nobody sees it.
 */
export function scrollCalm(el?: Element, { quiet = 160, longest = 4000 } = {}) {
  listen();
  const started = performance.now();
  return new Promise<void>((resolve) => {
    const look = () => {
      const now = performance.now();
      const resting = now - motion.at > quiet;
      const close = el ? el.getBoundingClientRect().top < window.innerHeight * 2 : false;
      if (resting || close || now - started > longest) resolve();
      else window.setTimeout(look, 60);
    };
    look();
  });
}

/** How many parts are in each phase and which run now (the monitor's report). */
export function sectionStats() {
  const phases: Record<SectionPhase, number> = { unloaded: 0, preloading: 0, ready: 0, active: 0, paused: 0, disposed: 0 };
  const active: string[] = [];
  for (const section of sections) {
    phases[section.phase]++;
    if (section.phase === "active") active.push(section.options.name);
  }
  return { phases, active };
}
