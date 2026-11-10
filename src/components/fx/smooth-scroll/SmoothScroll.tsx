"use client";
/*
 * SmoothScroll — Lenis: the page glides to where the wheel points instead of jumping in steps.
 * The page still scrolls natively (window.scrollY), so ScrollTrigger, sticky blocks and anchor links
 * keep working; Lenis drives ScrollTrigger from GSAP's ticker (one clock). Off with reduced motion
 * and on touch (the finger already scrolls smoothly). Elements that scroll by themselves (dialogs,
 * lists, [data-lenis-prevent]) keep the wheel. The preloader, the open menu and the prices' editor stop it.
 */
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";
import { useLite } from "@/lib/lite";
import "./smooth-scroll.css";


export function SmoothScroll({ lerp = 0.095 }: { lerp?: number }) {
  // the light mode (lib/lite.ts) scrolls natively, no glide at all (the owner, 10 Nov 2026): the browser moves the
  // page on its own thread, so a busy page never holds a frame of the scroll back (each frame of a glide waits for the
  // page's script); every other computer glides as before
  const light = useLite();
  useEffect(() => {
    if (light) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
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
    const mo = new MutationObserver(hold);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [lerp, light]);
  return null;
}
