"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import dynamic from "next/dynamic";
import { boot, loader, sceneRun, useSceneRunning } from "@/lib/boot";
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
 * The 3D lives in a React root of its own, outside the page's: a language switch renders the page anew in the other
 * language (LangSwitch, the router), this shell with it, and the canvases would start over. Instead the new shell
 * takes the same root over, moves its box into its own hero before it is drawn and renders it with its own words (the
 * orbit's); the stone moves on as it was (the owner, 3 Nov). Left without a shell (another page), it is let go.
 */
let island: { box: HTMLDivElement; root: Root; drop: number } | null = null;
/** The hero and its glow as the scenes see them: whichever shell holds the island now. */
const heroBox: { current: HTMLDivElement | null } = { current: null };
const glowBox: { current: HTMLDivElement | null } = { current: null };

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
  // the scenes are built (a few hundred ms of the main thread, in long blocks) only once the preloader's roll has
  // played, so they can't stall it; their code is fetched at once («сначала появление, потом ждать, пока догрузится»)
  // Already built (a language switch): taken over at once
  const [build, setBuild] = useState(() => island != null);

  useBoot(hero, reducedMotion);
  useEffect(() => {
    let alive = true;
    void import("@/components/three/hero/HeroScene");
    void import("@/components/three/hero/ShardsScene");
    (loader()?.rolled ?? Promise.resolve()).then(() => alive && setBuild(true));
    return () => {
      alive = false;
    };
  }, []);

  // pause the canvases off-screen, under the page (touch: the hero is sticky, never off-screen, only
  // covered) and in a background tab; the hero's height for its sticky top (hero.css)
  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    const page = document.querySelector<HTMLElement>("[data-page]");
    let inView = true;
    let covered = false;
    const sync = () => {
      const away = !inView || covered;
      setVisible(!away && !document.hidden);
      el.classList.toggle("is-away", away);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    let queued = 0;
    const onScroll = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        const now = Boolean(page && page.getBoundingClientRect().top <= 0);
        if (now !== covered) {
          covered = now;
          sync();
        }
      });
    };
    const ro = new ResizeObserver(() => el.style.setProperty("--hero-height", `${el.offsetHeight}px`));
    ro.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    onScroll();
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // the lift. Touch screens scroll natively, a step ahead of a script: there the browser runs it
  // itself with the scroll (a scroll-driven animation, hero.css), or there is none
  useEffect(() => {
    const el = hero.current;
    if (!el || reducedMotion || matchMedia("(hover: none) and (pointer: coarse)").matches) return;
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

  const running = started && visible;

  // the island (see above): made once, taken over by each shell, its box moved into this hero before it is drawn
  useLayoutEffect(() => {
    const host = hero.current;
    if (!build || !host) return;
    heroBox.current = host;
    glowBox.current = glow.current;
    if (!island) {
      const box = document.createElement("div");
      box.style.display = "contents";
      island = { box, root: createRoot(box), drop: 0 };
    }
    clearTimeout(island.drop);
    host.insertBefore(island.box, host.querySelector(".hero__grain"));
    const held = island;
    return () => {
      // a moment for the next shell (the other language) to take it over; else the 3D goes
      held.drop = window.setTimeout(() => {
        if (island !== held) return;
        island = null;
        held.root.unmount();
        held.box.remove();
        sceneRun.set(false);
      }, 1500);
    };
  }, [build]);
  useEffect(() => {
    if (!build) return;
    island?.root.render(
      <WebGLGate onSkip={skipScene}>
        <ShardsScene running={running} reducedMotion={reducedMotion} />
        <HeroScene heroRef={heroBox} glowRef={glowBox} orbitLabel={orbitLabel} running={running} reducedMotion={reducedMotion} />
      </WebGLGate>,
    );
  }, [build, running, reducedMotion, orbitLabel]);

  return (
    <div className="hero" data-hero ref={hero}>
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow" data-glow ref={glow} />
      </div>
      {/* (the 3D: the island's box goes here, before the grain) */}
      <div className="hero__grain" aria-hidden="true" />
      {children}
    </div>
  );
}
