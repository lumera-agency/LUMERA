"use client";
import { useEffect, useRef } from "react";
import { isLite } from "@/lib/lite";
import { switching } from "@/lib/place";

/** The ads page's pause, the same sentence on black (ads-runtime initBlurText): ms between two words, a word's way in. */
const WORD_STEP = 50;
const WORD_TIME = 1100;
const SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * The section box: its sentence comes in out of a blur, from a little above, word by word, once, as it comes up the
 * screen (the browser's own animations of opacity, filter and transform: nothing is driven from script). In LITE
 * (lib/lite: the text's animations are off) the sentence fades in as one. With reduced motion it simply stands.
 */
export function ManifestoClient({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current;
    const text = section?.querySelector<HTMLElement>(".manifesto__text");
    if (!section || !text || typeof text.animate !== "function") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // passed already (a kept place further down the page), or seen a moment ago in the other language: it stands
    const box = text.getBoundingClientRect();
    if (box.bottom < 0 || (switching() && box.top < window.innerHeight)) return;
    section.classList.add("is-waiting");
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        section.classList.remove("is-waiting");
        // (asked now, not when the page started: a slow page may have gone LITE since)
        if (isLite()) {
          text.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: "ease-out" });
          return;
        }
        // (the marker is one piece: on a phone it runs over two lines, where the browser does not move it, only clears it)
        text.querySelectorAll<HTMLElement>(".manifesto__word, .manifesto__mark").forEach((part, index) =>
          part.animate(
            [
              { opacity: 0, filter: "blur(8px)", transform: "translateY(-0.35em)" },
              { opacity: 1, filter: "blur(0)", transform: "none" },
            ],
            { duration: WORD_TIME, delay: index * WORD_STEP, easing: SOFT, fill: "backwards" },
          ),
        );
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(text);
    return () => {
      io.disconnect();
      section.classList.remove("is-waiting");
    };
  }, []);
  return (
    <section ref={root} className="section section--ivory manifesto" id="manifesto" aria-labelledby="manifesto-text" data-manifesto="">
      {children}
    </section>
  );
}
