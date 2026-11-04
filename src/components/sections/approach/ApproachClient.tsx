"use client";
import { useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";

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
      const [{ initApproach, deckOn }, { mountApproach }, { ScrollTrigger }] = await Promise.all([import("./stages.js"), import("./approach-phone.js"), import("@/lib/gsap")]);
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
      const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      stop = () => {
        cancelAnimationFrame(frame);
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

/** Where the stone sits in the deck's lane; it mounts once the deck is on (wide screens, motion). */
export function StageStoneSlot() {
  const [on, setOn] = useState(false);
  // a layout effect, so it is there when the block's layout effect (it runs after its children's) calls it
  useLayoutEffect(() => {
    setSlot = setOn;
    return () => {
      if (setSlot === setOn) setSlot = null;
    };
  }, []);
  const empty = <span className="process__stone" aria-hidden="true" />;
  return on ? <WebGLGate fallback={empty}><StageStone /></WebGLGate> : empty;
}
