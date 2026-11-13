"use client";
/*
 * The page's own measures, and the fall from FULL to LITE when it stays slow (the owner, 11 Nov 2026).
 *
 * Measured, cheaply (the browser's own observers, read only when asked; frames are timed in short windows, not all the
 * time): the largest paint (LCP), layout shifts (CLS), the slowest interactions (INP), long tasks, script errors, lost
 * WebGL contexts, the parts of the page that run now (lib/perf/sections.ts), and the frames' pace at rest and during the
 * visitor's own scrolling. `window.ecloPerf()` in the console gives the lot; nothing is sent anywhere.
 *
 * The fall to LITE (lib/perf/mode.ts goLite: in place, nothing reloads). A window of frames is slow when its median
 * frame is past 22 ms (under ~45 a second) or a fifth of its frames are past 40 ms; five seconds with more than a
 * second and a half of long tasks count as a slow window too. One slow window decides nothing: two in a row do, and a
 * good window between them starts the count again (a single stall, a tab waking up, one heavy moment never switch the
 * mode). A WebGL context lost twice also does. Nothing is measured in LITE, in a FULL the visitor chose themselves or
 * a test asked for, before the start-up has settled, or in a hidden tab; a computer that measured fine three times is
 * left alone for the rest of the page. LITE never goes back to FULL by itself.
 */
import { LITE_KEY, getMode, goLite, isLite, modeReason } from "./mode";
import { scrollMotion, sectionStats } from "./sections";

/** frames timed at rest, and while scrolling */
const REST_FRAMES = 120;
const SCROLL_FRAMES = 90;
/** ms after the last scroll event that still count as scrolling */
const SCROLLING = 150;
/** ms after the page is let go before timing starts: the start-up's one-off work is over by then */
const SETTLE = 1500;
/** ms between two rest windows */
const REST_GAP = 2000;
/** the median frame past this (ms) */
const SLOW_MEDIAN = 22;
/** or this share of frames past 40 ms */
const SLOW_SHARE = 0.2;
/** slow windows in a row that mean LITE */
const SLOW_RUN = 2;
/** good windows after which the page is left alone */
const GOOD_ENOUGH = 3;
/** a span of long tasks: its length, and the blocked time in it that makes it a slow window (ms) */
const TASK_SPAN = 5000;
const TASK_BLOCKED = 1500;

type FrameWindow = { kind: "rest" | "scroll" | "tasks"; median: number; late: number; slow: boolean };

const state = {
  lcp: 0,
  cls: 0,
  interactions: [] as number[],
  longTasks: 0,
  longTaskTime: 0,
  errors: 0,
  contextsLost: 0,
  windows: [] as FrameWindow[],
  heapAtStart: 0,
  wentLiteAt: 0,
};

const heap = () => (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0;

/** The page's measures now (the console: ecloPerf()). */
export function perfReport() {
  const sorted = [...state.interactions].sort((first, second) => second - first);
  const resources: Record<string, number> = {};
  for (const entry of performance.getEntriesByType("resource") as PerformanceResourceTiming[]) {
    resources[entry.initiatorType] = (resources[entry.initiatorType] ?? 0) + Math.round((entry.transferSize || 0) / 1024);
  }
  return {
    mode: getMode(),
    why: modeReason(),
    lcpMs: Math.round(state.lcp),
    cls: Number(state.cls.toFixed(4)),
    // (the slowest interaction, the visit's worst but one once there are many: INP as the browser reports it)
    inpMs: Math.round(sorted[sorted.length >= 50 ? 1 : 0] ?? 0),
    longTasks: state.longTasks,
    longTaskMs: Math.round(state.longTaskTime),
    errors: state.errors,
    webglContextsLost: state.contextsLost,
    frameWindows: state.windows.map((frames) => `${frames.kind} ${frames.median.toFixed(1)} ms${frames.slow ? " slow" : ""}`),
    sections: sectionStats(),
    canvases: document.querySelectorAll("canvas").length,
    scroll: { speed: Number(scrollMotion().speed.toFixed(2)), direction: scrollMotion().direction },
    heapMB: heap() ? Math.round(heap() / 1048576) : null,
    heapGrowthMB: heap() && state.heapAtStart ? Math.round((heap() - state.heapAtStart) / 1048576) : null,
    transferredKB: resources,
    wentLiteAtMs: state.wentLiteAt || null,
  };
}

declare global {
  interface Window {
    ecloPerf?: typeof perfReport;
  }
}

function measure(gaps: number[], kind: FrameWindow["kind"]): FrameWindow {
  const sorted = [...gaps].sort((first, second) => first - second);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const late = gaps.filter((gap) => gap > 40).length / Math.max(1, gaps.length);
  return { kind, median, late, slow: median > SLOW_MEDIAN || late > SLOW_SHARE };
}

function observe(type: string, each: (entry: PerformanceEntry) => void, options: PerformanceObserverInit = {}) {
  try {
    const observer = new PerformanceObserver((list) => list.getEntries().forEach(each));
    observer.observe({ type, buffered: true, ...options });
    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/** Starts the measures and the watch over FULL; returns the stop. */
export function startMonitor() {
  const root = document.documentElement;
  const stops: (() => void)[] = [];
  window.ecloPerf = perfReport;

  // the watch over FULL
  let watching = false;
  let slowRun = 0;
  let good = 0;
  let frame = 0;
  let scrollFrame = 0;
  let timer = 0;
  let classes: MutationObserver | null = null;
  const fall = () => {
    if (goLite("slow")) state.wentLiteAt = Math.round(performance.now());
    end();
  };
  const end = () => {
    watching = false;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(scrollFrame);
    clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
  };
  function judge(frames: FrameWindow) {
    if (!watching) return;
    state.windows.push(frames);
    if (state.windows.length > 12) state.windows.shift();
    if (frames.slow) {
      good = 0;
      if (++slowRun >= SLOW_RUN) fall();
    } else {
      slowRun = 0;
      // a computer that keeps its frames is left alone
      if (++good >= GOOD_ENOUGH) end();
    }
  }

  // the vitals: read by the browser itself, nothing per frame
  stops.push(observe("largest-contentful-paint", (entry) => void (state.lcp = entry.startTime)));
  let shiftRun = 0;
  let shiftRunStart = 0;
  let shiftLast = 0;
  stops.push(
    observe("layout-shift", (entry) => {
      const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (shift.hadRecentInput) return;
      // (shifts less than a second apart, five seconds at most, are one run; the page's CLS is its worst run)
      if (shift.startTime - shiftLast > 1000 || shift.startTime - shiftRunStart > 5000) {
        shiftRun = 0;
        shiftRunStart = shift.startTime;
      }
      shiftLast = shift.startTime;
      shiftRun += shift.value;
      state.cls = Math.max(state.cls, shiftRun);
    }),
  );
  stops.push(
    observe(
      "event",
      (entry) => {
        const event = entry as PerformanceEntry & { interactionId?: number };
        if (!event.interactionId) return;
        state.interactions.push(event.duration);
        if (state.interactions.length > 60) state.interactions.sort((first, second) => second - first).length = 30;
      },
      { durationThreshold: 40 } as PerformanceObserverInit,
    ),
  );
  // long tasks by spans of TASK_SPAN: a span opens at the first long task after the last span closed, and is called
  // slow once (and only once) the tasks in it have held the thread for more than TASK_BLOCKED
  let spanStart = -Infinity;
  let spanBlocked = 0;
  let spanJudged = false;
  stops.push(
    observe("longtask", (entry) => {
      state.longTasks++;
      state.longTaskTime += entry.duration;
      if (!watching || document.hidden) return;
      if (entry.startTime > spanStart + TASK_SPAN) {
        spanStart = entry.startTime;
        spanBlocked = 0;
        spanJudged = false;
      }
      spanBlocked += entry.duration;
      if (!spanJudged && spanBlocked > TASK_BLOCKED) {
        spanJudged = true;
        judge({ kind: "tasks", median: 0, late: 0, slow: true });
      }
    }),
  );
  const onError = () => void state.errors++;
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onError);
  stops.push(() => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onError);
  });
  // (the event does not bubble: caught on its way down)
  const onContextLost = () => {
    state.contextsLost++;
    if (state.contextsLost >= 2 && watching) fall();
  };
  document.addEventListener("webglcontextlost", onContextLost, true);
  stops.push(() => document.removeEventListener("webglcontextlost", onContextLost, true));

  const restGaps: number[] = [];
  let restLast = 0;
  const restTick = (now: number) => {
    if (!watching) return;
    if (document.hidden) {
      // a hidden tab draws no frames: start over once it shows
      restGaps.length = 0;
      restLast = 0;
      frame = requestAnimationFrame(restTick);
      return;
    }
    if (restLast) restGaps.push(now - restLast);
    restLast = now;
    if (restGaps.length < REST_FRAMES) {
      frame = requestAnimationFrame(restTick);
      return;
    }
    const frames = measure(restGaps, "rest");
    restGaps.length = 0;
    restLast = 0;
    judge(frames);
    // a slow window at rest is looked at once more before it decides; a good one is the last at rest
    if (watching && frames.slow) timer = window.setTimeout(() => (frame = requestAnimationFrame(restTick)), REST_GAP);
  };

  // the visitor's scrolling (a scroll is where a slow computer shows: «когда скролишь дергается»)
  const scrollGaps: number[] = [];
  let scrollLast = 0;
  let lastScroll = 0;
  const scrollTick = (now: number) => {
    scrollFrame = 0;
    if (!watching) return;
    if (now - lastScroll > SCROLLING || document.hidden) {
      scrollLast = 0;
      return;
    }
    if (scrollLast) scrollGaps.push(now - scrollLast);
    scrollLast = now;
    if (scrollGaps.length >= SCROLL_FRAMES) {
      const frames = measure(scrollGaps, "scroll");
      scrollGaps.length = 0;
      scrollLast = 0;
      judge(frames);
      return;
    }
    scrollFrame = requestAnimationFrame(scrollTick);
  };
  function onScroll() {
    lastScroll = performance.now();
    if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollTick);
  }

  const read = (store: Storage, key: string) => {
    try {
      return store.getItem(key);
    } catch {
      return null;
    }
  };
  const mayFall = !isLite() && read(sessionStorage, LITE_KEY) !== "0";
  if (mayFall) {
    const start = () => {
      timer = window.setTimeout(() => {
        if (isLite()) return;
        watching = true;
        state.heapAtStart = heap();
        window.addEventListener("scroll", onScroll, { passive: true });
        frame = requestAnimationFrame(restTick);
      }, SETTLE);
    };
    if (root.classList.contains("is-ready")) start();
    else {
      classes = new MutationObserver(() => {
        if (!root.classList.contains("is-ready")) return;
        classes?.disconnect();
        start();
      });
      classes.observe(root, { attributes: true, attributeFilter: ["class"] });
    }
  }

  return () => {
    end();
    classes?.disconnect();
    stops.forEach((stop) => stop());
  };
}
