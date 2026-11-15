"use client";
/** GSAP for the whole site: one place registers the plugins; components import from here. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * ScrollTrigger keeps an empty frame loop running for as long as it is on (its _rafBugFix: «in some browsers (like
 * Firefox), screen repaints weren't consistent unless we had SOMETHING queued up in requestAnimationFrame()»). It asks
 * the page's thread for every frame, at rest too, and on each such frame the browser restyles all that a CSS animation
 * moves, even what the compositor runs on its own: the home hero's orbit and the rail's pulse cost 60 restyles a second
 * at rest (12 Nov 2026). Its frames are not asked for here, so the loop never starts; Firefox, the browser it is for,
 * keeps it. It is known by its source, a function that is nothing but «flag && requestAnimationFrame(itself)», looked
 * at once per function.
 */
function stopRepaintLoop() {
  if (/firefox/i.test(navigator.userAgent)) return;
  const request = window.requestAnimationFrame.bind(window);
  const known = new WeakMap<FrameRequestCallback, boolean>();
  const named = /^function\s*([\w$]*)\s*\(\)\s*\{\s*return\s+[\w$]+\s*&&\s*requestAnimationFrame\(\s*([\w$]+)\s*\)\s*;?\s*\}$/;
  const arrow = /^\(\)\s*=>\s*[\w$]+\s*&&\s*requestAnimationFrame\(\s*[\w$]+\s*\)$/;
  const isRepaintLoop = (callback: FrameRequestCallback) => {
    let verdict = known.get(callback);
    if (verdict === undefined) {
      const source = Function.prototype.toString.call(callback).trim();
      const match = named.exec(source);
      verdict = match ? match[1] !== "" && match[1] === match[2] : arrow.test(source);
      known.set(callback, verdict);
    }
    return verdict;
  };
  window.requestAnimationFrame = (callback: FrameRequestCallback) => (isRepaintLoop(callback) ? 0 : request(callback));
}

if (typeof window !== "undefined") {
  stopRepaintLoop();
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // phones: the address bar sliding in and out is not a layout change
  ScrollTrigger.config({ ignoreMobileResize: true });
  // QA from the console and the headless checks (development only)
  if (process.env.NODE_ENV !== "production") Object.assign(window, { gsap, ScrollTrigger });
}

let refreshTimer = 0;
/** when the last ask came, and when the last full measure began (ScrollTrigger's refreshInit) */
let askedAt = -1;
let measuredAt = -1;
if (typeof window !== "undefined") ScrollTrigger.addEventListener("refreshInit", () => void (measuredAt = performance.now()));
/**
 * Every scroll scene measured again, once, a moment from now, however many blocks ask: the home page's services, ride,
 * approach and its deck each asked for a full measure of their own as they started, four within 60 ms right after the
 * preloader's roll, about 100 ms each on a processor four times slower (11 Nov 2026). Not at all when a full measure
 * began after the last ask: a pinned scene queues one of its own as it is made, so this one measured an unchanged page
 * on the intro's first frames (12 Nov 2026: 84 to 107 ms at CPU 4x; every scene's start and end the same without it)
 */
export function refreshSoon() {
  askedAt = performance.now();
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    if (measuredAt < askedAt) ScrollTrigger.refresh();
  }, 60);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
