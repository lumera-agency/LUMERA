"use client";
/*
 * React Bits BlurText (MIT + Commons Clause), its default «blur» effect from the top, rebuilt on GSAP (lib/gsap):
 * the published component needs the `motion` package, which this project doesn't have and won't add (the owner's
 * brief, 21 Oct 2026: no new dependencies). Each word comes in out of a blur, from above, one after another, as the
 * text comes into view, and again each time it comes back. `parts` keeps the page's two tones (the pause: a muted
 * sentence, then a bright one). With reduced motion the words simply stand.
 */
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Part = { text: string; className?: string };

export function BlurText({
  parts,
  className = "",
  stagger = 0.2,
  stepDuration = 0.35,
  blur = 10,
  distance = 50,
}: {
  parts: Part[];
  className?: string;
  /** the delay between words (s) */
  stagger?: number;
  /** each of the two steps of a word's way in (s) */
  stepDuration?: number;
  /** how blurred a word starts (px) */
  blur?: number;
  /** how far above it starts (px) */
  distance?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const words = el.querySelectorAll<HTMLElement>(".blur-text__w");
        const from = { opacity: 0, filter: `blur(${blur}px)`, y: -distance };
        gsap.set(words, from);
        // the published «blur» effect: halfway (half the blur, a touch past its place), then sharp in place
        const tl = gsap.timeline({ paused: true });
        tl.to(words, {
          keyframes: [
            { opacity: 0.5, filter: `blur(${blur / 2}px)`, y: distance / 10, duration: stepDuration, ease: "none" },
            { opacity: 1, filter: "blur(0px)", y: 0, duration: stepDuration, ease: "power2.out" },
          ],
          stagger,
        });
        ScrollTrigger.create({
          trigger: el,
          start: "top 82%",
          end: "bottom 10%",
          onEnter: () => void tl.restart(),
          onEnterBack: () => void tl.restart(),
          // gone from the screen: back to the start, so it comes in again next time
          onLeave: () => void tl.pause(0),
          onLeaveBack: () => void tl.pause(0),
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={`blur-text ${className}`}>
      {parts.map((part, p) => (
        <span className={part.className} key={p}>
          {part.text.split(" ").filter(Boolean).map((word, w, all) => (
            <span key={w}>
              <span className="blur-text__w">{word}</span>
              {w < all.length - 1 || p < parts.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}
