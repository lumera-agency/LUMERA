"use client";
/*
 * The intro, ~2.8 s: the header rule draws → the stone is lit out of darkness → the orbit draws →
 * the headline's lines unmask → CTA → the rail (site → ads → leads). Then a sheen crosses the
 * headline and a light pulse starts along the rail, so the process reads as one system.
 * Nothing blocks input; every tween runs on transform/opacity or the scene's state.
 */
import { gsap, SplitText } from "@/lib/gsap";
import { heroState } from "@/components/three/hero/state";

const LIT = 2.3; // when the sheen crosses the headline (.is-lit, hero.css)

export function playIntro(hero: HTMLElement) {
  const root = document.documentElement;
  const q = (s: string) => hero.querySelectorAll<HTMLElement>(s);
  const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 });

  tl.from(q("[data-rule]"), { scaleX: 0, duration: 1.6, ease: "expo.inOut" }, 0)
    .from(q('[data-reveal="nav"]'), { autoAlpha: 0, y: -12, duration: 1.1, stagger: 0.06 }, 0.2)
    .to(heroState, { stoneReveal: 1, duration: 2.8, ease: "power2.inOut" }, 0.5)
    .to(heroState, { stoneIntro: 1, duration: 3.0, ease: "expo.out" }, 0.45)
    .to(heroState, { ringProgress: 1, duration: 2.0, ease: "expo.inOut" }, 1.0)
    .to(heroState, { shards: 1, duration: 2.4, ease: "power2.out" }, 1.0)
    .to(heroState, { dots: 1, duration: 1.0, ease: "power2.out" }, 2.4);

  const title = hero.querySelector<HTMLElement>("[data-title]")!;
  // a re-split (a new width) hands the slide over to the new lines; once played, they stay at rest
  let slide: gsap.core.Tween | null = null;
  const split = SplitText.create(title, {
    type: "lines",
    mask: "lines",
    linesClass: "line",
    autoSplit: false,
    onSplit(self) {
      if (title.classList.contains("is-lit")) {
        const elapsed = tl.time() - LIT;
        for (const tone of title.querySelectorAll<HTMLElement>(".tone")) {
          const i = parseFloat(tone.style.getPropertyValue("--i")) || 0;
          tone.style.animationDelay = `${(i * 0.14 - elapsed).toFixed(3)}s`;
        }
      }
      if (slide && slide.progress() === 1) return;
      slide?.kill();
      slide = gsap.from(self.lines, { yPercent: 115, duration: 1.3, stagger: 0.1, ease: "expo.out" });
      tl.add(slide, 0.95);
    },
  });
  let width = title.offsetWidth;
  let timer = 0;
  const ro = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (title.offsetWidth === width) return;
      width = title.offsetWidth;
      split.split({});
    }, 200);
  });
  ro.observe(title);

  tl.from(q('[data-reveal="cta"]'), { autoAlpha: 0, y: 20, duration: 1.2 }, 1.35)
    .from(q("[data-rail-track]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.3, ease: "expo.inOut" }, 1.5)
    .from(q('[data-reveal="step"]'), { autoAlpha: 0, y: 12, duration: 1.0, stagger: 0.1 }, 1.7)
    .call(() => title.classList.add("is-lit"), undefined, LIT)
    .call(() => hero.querySelector("[data-rail]")?.classList.add("is-live"), undefined, 3.0)
    // the sheen's end state is the title's own resting style: dropping the class changes nothing
    .call(() => title.classList.remove("is-lit"), undefined, LIT + 0.28 + 1.7 + 0.12);

  // the start states are inline now: lift the CSS pre-paint guard
  root.classList.add("is-ready");
  return { timeline: tl, dispose: () => ro.disconnect() };
}
