"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { liteGraphics } from "@/lib/device";
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

/** Where the stone sits in the deck's lane; it mounts once the deck is on (wide screens, motion). With lite
 *  graphics (a weak device, Save-Data: lib/device) or without WebGL, a still of it stands there instead. */
export function StageStoneSlot() {
  const [on, setOn] = useState(false);
  const [near, setNear] = useState(false);
  const slot = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    setSlot = setOn;
    return () => {
      setSlot = null;
    };
  }, []);
  // its scene (three.js, a WebGL context, the shaders) comes a screen ahead of the block, not with the page
  useEffect(() => {
    const el = slot.current;
    if (!on || near || !el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[entries.length - 1].isIntersecting) setNear(true);
    }, { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [on, near]);
  if (!on || !near) return <span className="process__stone" aria-hidden="true" ref={slot} />;
  const still = (
    <span className="process__stone" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- a frame of the 3D stone's own scene */}
      <img className="process__still" src="/img/still/stage-stone.webp" alt="" width={366} height={423} loading="lazy" decoding="async" />
    </span>
  );
  return liteGraphics() ? still : <WebGLGate fallback={still}><StageStone /></WebGLGate>;
}
