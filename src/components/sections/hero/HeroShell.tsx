"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { boot, sceneRun, useSceneRunning } from "@/lib/boot";
import { useReducedMotion } from "@/lib/hooks";
import { WebGLGate } from "@/components/three/lib/WebGLGate";
import { useBoot } from "./useBoot";
import "./hero.css";

// three.js and the scenes load after the first paint; the page works without them
const HeroScene = dynamic(
  () =>
    import("@/components/three/hero/HeroScene").then((m) => {
      boot.sceneLoaded.resolve();
      return m;
    }),
  { ssr: false },
);
const ShardsScene = dynamic(() => import("@/components/three/hero/ShardsScene"), { ssr: false });

/** The page rides over the first screen: the hero's content is held back as the page scrolls
 *  (HOLD of the scroll, so it nearly stays put) and dims, and the blocks slide over it. */
const HOLD = 0.7;

/** No 3D here: the start-up doesn't wait for a scene that won't come. */
const skipScene = () => {
  boot.sceneLoaded.resolve();
  boot.sceneReady.resolve();
};

/**
 * The first screen's stage: background light, the 3D canvases, grain, and the boot sequence.
 * The copy, header and rail come in as children (server-rendered).
 */
export function HeroShell({ orbitLabel, children }: { orbitLabel: string; children: React.ReactNode }) {
  const hero = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const started = useSceneRunning();
  const [visible, setVisible] = useState(true);

  useBoot(hero, reducedMotion);

  // pause the canvases off-screen and in a background tab
  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    let inView = true;
    const sync = () => {
      const on = inView && !document.hidden;
      setVisible(on);
      el.classList.toggle("is-away", !inView);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // the lift
  useEffect(() => {
    const el = hero.current;
    if (!el || reducedMotion) return;
    let queued = 0;
    const apply = () => {
      queued = 0;
      const h = el.offsetHeight || 1;
      const y = Math.min(Math.max(window.scrollY, 0), h);
      el.style.setProperty("--lift", `${(y * HOLD).toFixed(1)}px`);
      el.style.setProperty("--lift-dim", (0.55 * (y / h)).toFixed(3));
    };
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  useEffect(() => () => sceneRun.set(false), []);
  const running = started && visible;

  return (
    <div className="hero" data-hero ref={hero}>
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow" data-glow ref={glow} />
      </div>
      <WebGLGate onSkip={skipScene}>
        <ShardsScene running={running} reducedMotion={reducedMotion} />
        <HeroScene heroRef={hero} glowRef={glow} orbitLabel={orbitLabel} running={running} reducedMotion={reducedMotion} />
      </WebGLGate>
      <div className="hero__grain" aria-hidden="true" />
      {children}
    </div>
  );
}
