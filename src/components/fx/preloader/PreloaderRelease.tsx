"use client";
/*
 * The preloader's way out on a page with no start-up of its own: every page but the home page, whose hero leads it out
 * as its intro starts (hero/useBoot). Here it goes once the page has loaded (its pictures and fonts in) and the roll has
 * played, or 6 s after this runs whatever is still loading; the page's entrances wait for it (lib/curtain
 * whenCurtainLifts). No preloader on the page (later in the visit, LITE): nothing to do.
 */
import { useEffect } from "react";

type Clock = { finish(): Promise<void> };

export function PreloaderRelease() {
  useEffect(() => {
    const clock = (window as Window & { ecloLoader?: Clock }).ecloLoader;
    if (!clock || document.querySelector("[data-hero]")) return;
    let alive = true;
    const loaded =
      document.readyState === "complete" ? Promise.resolve() : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
    void Promise.race([loaded, new Promise<void>((resolve) => setTimeout(resolve, 6000))]).then(() => {
      if (alive) void clock.finish();
    });
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
