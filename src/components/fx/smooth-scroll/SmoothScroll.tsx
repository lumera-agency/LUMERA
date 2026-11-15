"use client";
/*
 * SmoothScroll — Lenis: the page glides to where the wheel points instead of jumping in steps.
 * The page still scrolls natively (window.scrollY), so ScrollTrigger, sticky blocks and anchor links
 * keep working; Lenis drives ScrollTrigger from GSAP's ticker (one clock, no frame loop of its own). Off with reduced
 * motion and on touch (the finger already scrolls smoothly). Elements that scroll by themselves (dialogs,
 * lists, [data-lenis-prevent]) keep the wheel. The preloader, the open menu and the prices' editor stop it.
 * Off in both modes since 12 Nov 2026 (the owner: «сделай версию без lenis»): measured on a computer slowed six times,
 * with the glide only about half of the frames of a wheeled scroll came whole, each frame waiting for the page's
 * scripts; without it 75 to 89 in a hundred (tools/wheelsmooth.mjs in the optimization folder). The page scrolls
 * natively, on the browser's own thread. `?glide=1` brings the glide back for that visit, to compare; Lenis is fetched
 * only then (its code comes by import() only here, after the checks below).
 */
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";
import { isLite, useLite } from "@/lib/lite";
import "./smooth-scroll.css";

export function SmoothScroll({ lerp = 0.095 }: { lerp?: number }) {
  // LITE scrolls natively, no glide at all (the owner, 10 Nov 2026): the browser moves the page on its own thread, so
  // a busy page never holds a frame of the scroll back (each frame of a glide waits for the page's script)
  const light = useLite();
  useEffect(() => {
    // (the page's own word, not the render's: the first render does not know the mode yet)
    if (light || isLite()) return;
    if (!/[?&]glide=1(&|$)/.test(location.search)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let stop: (() => void) | null = null;
    let alive = true;
    void import("lenis").then(({ default: Lenis }) => {
      if (!alive || isLite()) return;
      const lenis = new Lenis({
        lerp,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) => Boolean(node.closest?.("dialog, [data-lenis-prevent]")),
      });
      setLenis(lenis); // scripted scrolls (lib/scroll) glide through it
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      // the preloader, the open menu and the prices' editor hold the page still
      const root = document.documentElement;
      let held = false;
      const hold = () => {
        const now = ["menu-open", "is-loading", "cfg-editing"].some((name) => root.classList.contains(name));
        if (now === held) return;
        held = now;
        if (now) lenis.stop();
        else lenis.start();
      };
      hold();
      const classes = new MutationObserver(hold);
      classes.observe(root, { attributes: true, attributeFilter: ["class"] });
      stop = () => {
        classes.disconnect();
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      };
    });
    return () => {
      alive = false;
      stop?.();
    };
  }, [lerp, light]);
  return null;
}
