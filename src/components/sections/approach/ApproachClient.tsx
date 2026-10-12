"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";

const StageStone = dynamic(() => import("@/components/three/stage-stone/StageStone"), { ssr: false });
const DECK = "(min-width: 1101px)";

let setSlot: ((on: boolean) => void) | null = null;

/**
 * The section box. Marks the deck before the page's reveals start (they skip its cards), then
 * starts the stages (stages.js), the checks, and the phone picture (approach-phone.js).
 */
export function ApproachClient({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const stages = root.current?.querySelector("[data-stages]");
    const on = matchMedia(DECK).matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    stages?.classList.toggle("is-deck", on);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = matchMedia("(max-width: 600px)");
    let alive = true;
    (async () => {
      const [{ initApproach, deckOn }, { mountApproach }, { ScrollTrigger }] = await Promise.all([import("./stages.js"), import("./approach-phone.js"), import("@/lib/gsap")]);
      if (!alive) return;
      initApproach({ motion: !reducedMotion, reducedMotion });
      setSlot?.(deckOn());
      matchMedia(DECK).addEventListener("change", () => setSlot?.(deckOn()));
      let mounted = false;
      const mountPhone = () => {
        if (mounted || !phone.matches) return;
        mounted = true;
        mountApproach(el, { reducedMotion });
      };
      mountPhone();
      phone.addEventListener("change", mountPhone);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    })();
    return () => {
      alive = false;
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
  useEffect(() => {
    setSlot = setOn;
    return () => {
      setSlot = null;
    };
  }, []);
  const empty = <span className="process__stone" aria-hidden="true" />;
  return on ? <WebGLGate fallback={empty}><StageStone /></WebGLGate> : empty;
}
