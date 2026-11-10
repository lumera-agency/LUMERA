"use client";
/*
 * Decides whether this is a slow computer (lib/lite.ts: then the page scrolls without the glide) by measuring, twice: once the page has settled (the preloader and the intro
 * behind it, a moment after html.is-ready), about two seconds of frames while the tab shows; and the frames of the
 * visitor's own scrolling (a scroll is where a slow computer shows: «когда скролишь дергается»), about a second and a
 * half of them. Most frames late (the median past 22 ms, under ~45 a second) or many very late ones means the computer
 * cannot keep the site's frames. A software renderer (no graphics card in use) counts as slow at once. Nothing is
 * measured once slow, and a page that measured fine measures again on the next load.
 * For a test, ?lite=1 in the address makes the visit a slow computer's and ?full=1 (or ?lite=0) a fast one's (the
 * layout's early script; nothing is measured then).
 */
import { useEffect } from "react";
import { LITE_KEY, goLite, isLite } from "@/lib/lite";

/** frames timed at rest, and while scrolling */
const SAMPLE = 120;
const SCROLL_SAMPLE = 90;
/** ms after the last scroll event that still count as scrolling */
const SCROLLING = 150;
/** ms after the page is let go before timing starts: the start-up's one-off work is over by then */
const SETTLE = 1500;
/** the median frame past this (ms) */
const SLOW_MEDIAN = 22;
/** or this share of frames past 40 ms */
const SLOW_SHARE = 0.2;

const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render|software/i;

/** Too slow: most frames late, or many very late. */
function slow(gaps: number[]) {
  const sorted = [...gaps].sort((first, second) => first - second);
  const median = sorted[Math.floor(sorted.length / 2)];
  const late = gaps.filter((gap) => gap > 40).length / gaps.length;
  return median > SLOW_MEDIAN || late > SLOW_SHARE;
}

function softwareRenderer() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl!.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return SOFTWARE.test(name);
  } catch {
    return false;
  }
}

export function PerfProbe() {
  useEffect(() => {
    if (isLite()) return;
    try {
      if (sessionStorage.getItem(LITE_KEY) === "0") return;
    } catch {}
    if (softwareRenderer()) return goLite();
    const root = document.documentElement;
    let frame = 0;
    let timer = 0;
    let gone = false;
    let watch: MutationObserver | null = null;
    const gaps: number[] = [];
    let last = 0;
    const tick = (now: number) => {
      if (gone) return;
      if (document.hidden) {
        // a hidden tab draws no frames: start over once it shows
        gaps.length = 0;
        last = 0;
        frame = requestAnimationFrame(tick);
        return;
      }
      if (last) gaps.push(now - last);
      last = now;
      if (gaps.length < SAMPLE) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (slow(gaps)) goLite();
    };
    // the visitor's scrolling: its frames timed while it lasts, until enough are in
    const scrollGaps: number[] = [];
    let scrollFrame = 0;
    let scrollLast = 0;
    let lastScroll = 0;
    const scrollTick = (now: number) => {
      scrollFrame = 0;
      if (gone || isLite()) return;
      if (now - lastScroll > SCROLLING || document.hidden) {
        scrollLast = 0;
        return;
      }
      if (scrollLast) scrollGaps.push(now - scrollLast);
      scrollLast = now;
      if (scrollGaps.length >= SCROLL_SAMPLE) {
        removeEventListener("scroll", onScroll);
        if (slow(scrollGaps)) goLite();
        return;
      }
      scrollFrame = requestAnimationFrame(scrollTick);
    };
    let settled = false;
    const onScroll = () => {
      // (only once the start-up has settled: a scroll during it would time the start-up's own work)
      if (!settled) return;
      lastScroll = performance.now();
      if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollTick);
    };
    addEventListener("scroll", onScroll, { passive: true });
    const start = () => {
      timer = window.setTimeout(() => {
        settled = true;
        frame = requestAnimationFrame(tick);
      }, SETTLE);
    };
    if (root.classList.contains("is-ready")) start();
    else {
      watch = new MutationObserver(() => {
        if (!root.classList.contains("is-ready")) return;
        watch?.disconnect();
        start();
      });
      watch.observe(root, { attributes: true, attributeFilter: ["class"] });
    }
    return () => {
      gone = true;
      watch?.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
