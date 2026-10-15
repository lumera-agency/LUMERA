"use client";
/*
 * The page's start-up, in order: the headline's font and the dictionary are in → the 3D scene is
 * loaded → its shaders are compiled (or 4 s pass) → the preloader counts to 100 and lifts → the
 * intro plays under it. Each milestone moves the preloader's counter (honest progress).
 * Reduced motion: the settled composition at once, the preloader just fades.
 */
import { useEffect, type RefObject } from "react";
import { boot, jumpToHash, loader, pageLetGo, restoreScroll, sceneRun } from "@/lib/boot";
import { settleHero } from "@/components/three/hero/state";
import { wait } from "@/lib/hooks";
import { playIntro } from "./useHeroIntro";


let started = false; // once per page load (React's dev double-mount runs effects twice)

export function useBoot(heroRef: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || started) return;
    started = true;
    const root = document.documentElement;
    const clock = loader();
    const introDone = () => {
      root.classList.add("intro-done");
      boot.introDone.resolve();
      window.dispatchEvent(new Event("lumera:intro-done"));
    };

    (async () => {
      // SplitText measures lines, so the headline's own letters must be in first
      const text = hero.querySelector("[data-title]")?.textContent ?? "";
      await Promise.race([
        Promise.all([document.fonts.load("400 64px Geologica", text), document.fonts.load("300 20px Geologica", text)]).catch(() => {}),
        wait(2500),
      ]);
      clock?.step(0.3, 1);
      await Promise.race([boot.sceneLoaded.promise, wait(4000)]);
      clock?.step(0.55, 2);
      await Promise.race([boot.sceneReady.promise, wait(4000)]);
      clock?.step(0.8, 3);
      clock?.step(0.95, 3);

      // once the preloader lets the page go (not before: the page is held, Lenis stopped): back where
      // the visitor was (a language switch), or at the block the link named
      const arrive = () => void pageLetGo().then(() => restoreScroll() || jumpToHash());
      if (reducedMotion) {
        settleHero();
        sceneRun.set(true);
        await clock?.finish();
        arrive();
        root.classList.add("is-ready");
        introDone();
        return;
      }
      // the columns start to lift first; the intro starts under them (a stalled loader: after 4 s)
      await Promise.race([clock?.finish() ?? Promise.resolve(), wait(4000)]);
      arrive();
      sceneRun.set(true);
      const intro = playIntro(hero);
      intro.timeline.then(introDone);
    })();
  }, [heroRef, reducedMotion]);
}
