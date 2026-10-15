"use client";
/*
 * SmoothScroll — Lenis: the page glides to where the wheel points instead of jumping in steps.
 * The page still scrolls natively (window.scrollY), so ScrollTrigger, sticky blocks and anchor links
 * keep working; Lenis drives ScrollTrigger from GSAP's ticker (one clock). Off with reduced motion
 * and on touch (the finger already scrolls smoothly). Elements that scroll by themselves (dialogs,
 * lists, [data-lenis-prevent]) keep the wheel. The preloader and the open menu stop it.
 */
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";
import "./smooth-scroll.css";


export function SmoothScroll({ lerp = 0.095 }: { lerp?: number }) {
  useEffect(() => {
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
    // the preloader and the open menu hold the page still
    const root = document.documentElement;
    let held = false;
    const hold = () => {
      const now = root.classList.contains("menu-open") || root.classList.contains("is-loading");
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
  }, [lerp]);
  return null;
}
