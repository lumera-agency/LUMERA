"use client";
/*
 * The case's result as a shrinking morning: after React Bits Count Up, its idea rebuilt on GSAP (lib/gsap; no new
 * dependencies). As the column comes into view the number counts down (60 → 15) while its bar shrinks with it, once.
 * The markup is the final frame: without a script or with reduced motion the result simply stands.
 */
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export function ShrinkTotal({ value, when, share = 1, from }: { value: string; when: string; /** the bar's final width, 0–1 */ share?: number; /** the number it counts down from */ from?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [, head = "", num = "", tail = ""] = value.match(/^(\D*)(\d+)(.*)$/) ?? [];

  useGSAP(
    () => {
      const el = ref.current;
      const n = el?.querySelector<HTMLElement>(".ai-split__n");
      const bar = el?.querySelector<HTMLElement>(".ai-split__fill");
      if (!el || !n || !bar || from === undefined) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const to = Number(num);
        const v = { n: from };
        gsap.set(bar, { scaleX: 1 });
        n.textContent = String(from);
        const tl = gsap.timeline({ paused: true, defaults: { duration: 1.6, ease: "power2.inOut" } });
        tl.to(v, { n: to, onUpdate: () => void (n.textContent = String(Math.round(v.n))) }, 0).to(bar, { scaleX: share }, 0);
        ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => void tl.play() });
        return () => {
          n.textContent = num;
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <p className="ai-split__total" ref={ref}>
      <span className="ai-split__v">{head}<span className="ai-split__n">{num}</span>{tail}</span>
      <span className="ai-split__when">{when}</span>
      <span className="ai-split__bar" aria-hidden="true"><i className="ai-split__fill" style={{ transform: `scaleX(${share})` }} /></span>
    </p>
  );
}
