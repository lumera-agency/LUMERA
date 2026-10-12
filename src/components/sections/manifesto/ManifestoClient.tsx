"use client";
import { useEffect, useRef } from "react";

/** The section box: plays the marker swipe and one glitch burst on arrival (55% in view). */
export function ManifestoClient({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const glitch = el.querySelector<HTMLElement>("[data-glitch]");
    let timer = 0;
    const burst = (ms: number) => {
      glitch?.classList.add("is-glitching");
      clearTimeout(timer);
      timer = window.setTimeout(() => glitch?.classList.remove("is-glitching"), ms);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        burst(1600);
        io.disconnect();
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    const tap = (e: PointerEvent) => e.pointerType !== "mouse" && burst(1400);
    glitch?.addEventListener("pointerdown", tap);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      glitch?.removeEventListener("pointerdown", tap);
    };
  }, []);
  return (
    <section ref={root} className="section section--ivory manifesto" id="manifesto" aria-labelledby="manifesto-text" data-manifesto="">
      {children}
    </section>
  );
}
