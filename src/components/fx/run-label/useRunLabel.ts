"use client";
/*
 * RunLabel — on hover a button's label starts running like a ticker (the hero's orbit, in small):
 * two copies of the text, the second one gap after the first, slide left in a loop; leaving, the run
 * glides on to the end of the current cycle and stops on the text at rest — never mid-word.
 * Markup: .run-label > .run-label__track > span + span (RunLabel.tsx renders it). Mouse only, never
 * with reduced motion.
 */
import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

export function useRunLabel(host: RefObject<HTMLElement | null>, { speed = 85 } = {}) {
  useEffect(() => {
    const el = host.current;
    const track = el?.querySelector<HTMLElement>(".run-label__track");
    if (!el || !track) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let loop: gsap.core.Tween | null = null;
    const cycle = () => {
      const second = track.children[1] as HTMLElement | undefined;
      return second ? second.offsetLeft : track.offsetWidth; // one copy + the gap
    };
    const enter = () => {
      el.classList.add("is-running");
      loop?.kill();
      const c = cycle();
      const from = Number(gsap.getProperty(track, "x")) || 0;
      // from wherever it is, on to the cycle's end, then round and round
      loop = gsap.to(track, {
        x: -c,
        duration: (c + from) / speed,
        ease: "none",
        onComplete: () => {
          loop = gsap.fromTo(track, { x: 0 }, { x: -c, duration: c / speed, ease: "none", repeat: -1 });
        },
      });
    };
    const leave = () => {
      el.classList.remove("is-running");
      loop?.kill();
      const c = cycle();
      const x = Number(gsap.getProperty(track, "x")) || 0;
      if (x === 0) return;
      // glide on to the end of this cycle (the text comes back to rest), never back
      loop = gsap.to(track, { x: -c, duration: Math.max(0.25, (c + x) / (speed * 2.2)), ease: "power2.out", onComplete: () => void gsap.set(track, { x: 0 }) });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      loop?.kill();
      gsap.set(track, { clearProps: "transform" });
    };
  }, [host, speed]);
}
