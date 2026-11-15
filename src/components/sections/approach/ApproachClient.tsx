"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";
import { afterRoll } from "@/lib/boot";
import { useLite } from "@/lib/lite";
import { watchSection } from "@/lib/perf/sections";

const StageStone = dynamic(() => import("@/components/three/stage-stone/StageStone"), { ssr: false });
const DECK = "(min-width: 1101px)";

let setSlot: ((on: boolean) => void) | null = null;

/**
 * The section box. Marks the deck before the page's reveals start (they skip its cards), then
 * starts the stages (stages.js), the checks, and the phone picture (approach-phone.js); the
 * cleanup stops them all, so the block starts again on the tree a language switch brings.
 */
export function ApproachClient({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const stages = root.current?.querySelector("[data-stages]");
    const on = matchMedia(DECK).matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    stages?.classList.toggle("is-deck", on);
  }, []);

  // a layout effect: after a language switch (a transition, its passive effects run after paint) the
  // modules are cached, their imports resolve before paint, and the deck is never seen unbuilt
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deck = matchMedia(DECK);
    const phone = matchMedia("(max-width: 600px)");
    let alive = true;
    let stop: (() => void) | null = null;
    (async () => {
      const [{ initApproach, deckOn }, { mountApproach }, { refreshSoon }] = await Promise.all([import("./stages.js"), import("./approach-phone.js"), import("@/lib/gsap")]);
      if (!alive) return;
      // the deck pins: set up after the preloader's roll (lib/boot)
      await afterRoll();
      if (!alive) return;
      const stopApproach = initApproach(el, { motion: !reducedMotion, reducedMotion });
      const slot = () => setSlot?.(deckOn());
      slot();
      deck.addEventListener("change", slot);
      let picture: { destroy(): void } | null = null;
      let mounted = false;
      const mountPhone = () => {
        if (mounted || !phone.matches) return;
        mounted = true;
        picture = mountApproach(el, { reducedMotion });
      };
      mountPhone();
      phone.addEventListener("change", mountPhone);
      refreshSoon();
      stop = () => {
        phone.removeEventListener("change", mountPhone);
        deck.removeEventListener("change", slot);
        picture?.destroy();
        stopApproach();
      };
    })();
    return () => {
      alive = false;
      stop?.();
    };
  }, []);

  return (
    <section ref={root} className="section process" id="approach" aria-labelledby="approach-title">
      {children}
    </section>
  );
}

/**
 * Where the stone sits in the deck's lane; it mounts once the deck is on (wide screens, motion) and the block is near
 * the view (lib/perf/sections.ts: three.js and the scene are fetched then, not with the page), and is taken down, its
 * WebGL context with it, once the visitor has been far from the block for a while; near again, it is built anew.
 * LITE (lib/lite): no scene; the stone's five poses as pictures, swapped as the deck turns (StageStills).
 */
export function StageStoneSlot() {
  const [on, setOn] = useState(false);
  const [near, setNear] = useState(false);
  const lite = useLite();
  useEffect(() => {
    const block = document.getElementById("approach");
    if (!block) return;
    return watchSection(block, { preload: () => setNear(true), dispose: () => setNear(false) }, { name: "approach stone", near: 1.5, disposeAfter: 20000, fullOnly: true });
  }, []);
  // a layout effect, so it is there when the block's layout effect (it runs after its children's) calls it
  useLayoutEffect(() => {
    setSlot = setOn;
    return () => {
      if (setSlot === setOn) setSlot = null;
    };
  }, []);
  const empty = <span className="process__stone" aria-hidden="true" />;
  if (lite) return <StageStills />;
  return on && near ? <WebGLGate fallback={empty}><StageStone /></WebGLGate> : empty;
}

/** The stone's poses, one a stage (tools/capture-stage-stones.mjs: the live stone's canvas at each stage's rest). */
const POSES = [0, 1, 2, 3, 4].map((stage) => `/img/hero/stage-stone-${stage}.webp`);
/** ms the deck is looked at after the last scroll event: its scrub (stages.js, 0.3 s) is still catching up */
const SETTLE = 700;

/**
 * LITE's stone of the deck (the owner, 12 Nov 2026: «камень у каждого этапа при скроле должен меняться», pictures
 * instead of the 3D): the live stone's pose at each of the five stages as a picture, the one shown swapped once a card
 * is half way in (deckProgress, stages.js), with a short turn and hop in CSS (approach.css: opacity and transform only,
 * on the compositor). The deck is looked at only while the block is near and the page scrolls, and a moment after.
 * The pictures are fetched only where the deck is shown (lazy pictures in a box that is not displayed are not fetched).
 */
function StageStills() {
  const box = useRef<HTMLSpanElement>(null);
  const [stage, setStage] = useState(0);
  const [back, setBack] = useState(false);
  useEffect(() => {
    const block = document.getElementById("approach");
    if (!block) return;
    let alive = true;
    let near = false;
    let frame = 0;
    let lastScroll = 0;
    let shown = 0;
    let progressOf: (() => number) | null = null;
    let midpoint = 0.5;
    const look = () => {
      frame = 0;
      if (!alive || !progressOf) return;
      const progress = progressOf();
      // the stage whose card is half way in or further (cards 1 … 4 slide in from k + DECK_IN[0] to k + DECK_REST)
      let next = 0;
      for (let card = 1; card < POSES.length; card++) if (progress >= card + midpoint) next = card;
      if (next !== shown) {
        setBack(next < shown);
        shown = next;
        setStage(next);
      }
      if (near && performance.now() - lastScroll < SETTLE) frame = requestAnimationFrame(look);
    };
    const onScroll = () => {
      lastScroll = performance.now();
      if (near && !frame) frame = requestAnimationFrame(look);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) onScroll();
      },
      { rootMargin: "50% 0px" },
    );
    void import("./stages.js").then(({ deckProgress, DECK_IN, DECK_REST }) => {
      if (!alive) return;
      progressOf = deckProgress;
      midpoint = DECK_IN[0] + (DECK_REST - DECK_IN[0]) / 2;
      io.observe(block);
      window.addEventListener("scroll", onScroll, { passive: true });
    });
    return () => {
      alive = false;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <span ref={box} className={`process__stone process__stone--still${back ? " is-back" : ""}`} aria-hidden="true">
      {POSES.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- transparent frames in the canvas's own box, not content images
        <img key={src} src={src} width={693} height={952} alt="" loading="lazy" decoding="async" className={index === stage ? "is-on" : undefined} />
      ))}
    </span>
  );
}
