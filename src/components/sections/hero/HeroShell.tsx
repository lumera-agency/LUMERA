"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { boot, sceneRun, useSceneRunning } from "@/lib/boot";
import { liteGraphics } from "@/lib/device";
import { useReducedMotion } from "@/lib/hooks";
import { lockViewport } from "@/lib/viewport";
import { WebGLGate, hasWebGL } from "@/components/three/lib/WebGLGate";
import { stonePlacement } from "@/components/three/hero/state";
import { useBoot } from "./useBoot";
import "./hero.css";

// three.js and the scenes are chunks of their own, fetched once the first screen is in view; the page works without them
const HeroScene = dynamic(
  () =>
    import("@/components/three/hero/HeroScene").then((m) => {
      boot.sceneLoaded.resolve();
      return m;
    }),
  { ssr: false },
);
const ShardsScene = dynamic(() => import("@/components/three/hero/ShardsScene"), { ssr: false });

// the page opens at its top, the first screen in view: its scenes start loading with the page's own code, not a few
// renders after it has hydrated (the same chunks the components above load; lite graphics and no WebGL: nothing)
if (typeof window !== "undefined" && window.scrollY < window.innerHeight && !liteGraphics() && hasWebGL()) {
  void import("@/components/three/hero/HeroScene").catch(() => {});
  void import("@/components/three/hero/ShardsScene").catch(() => {});
}

/** The page rides over the first screen: the hero's content is held back as the page scrolls
 *  (HOLD of the scroll, so it nearly stays put) and dims, and the blocks slide over it. */
const HOLD = 0.7;

/** No 3D here: the start-up doesn't wait for a scene that won't come. */
const skipScene = () => {
  boot.sceneLoaded.resolve();
  boot.sceneReady.resolve();
};

// lite graphics (lib/device) follow reduced motion as it is switched; null on the server and while hydrating
const subscribeMotion = (onChange: () => void) => {
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/**
 * The first screen's stage: background light, the 3D canvases (or, with lite graphics or without WebGL, a still
 * of the stone in their place), grain, and the boot sequence. The copy, header and rail come in as children
 * (server-rendered).
 */
export function HeroShell({ orbitLabel, children }: { orbitLabel: string; children: React.ReactNode }) {
  const hero = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const lang = useLocale() === "ru" ? "ru" : "uk";
  const lite = useSyncExternalStore(subscribeMotion, liteGraphics, () => null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  const started = useSceneRunning();
  const [visible, setVisible] = useState(true);
  const still = lite === true || failed;
  const onSkip = useCallback(() => {
    skipScene();
    setFailed(true);
  }, []);

  useBoot(hero, reducedMotion);
  useEffect(() => lockViewport(), []);
  useEffect(() => {
    if (lite) skipScene();
  }, [lite]);

  // the scenes (three.js) are fetched once the first screen is in view: on load at once (the page starts at its
  // top, held there by the preloader; asked right away, not a frame later through an observer), otherwise when
  // it comes into view
  useEffect(() => {
    const el = hero.current;
    if (!el || lite !== false || near) return;
    const box = el.getBoundingClientRect();
    if (box.bottom > 0 && box.top < window.innerHeight) return setNear(true);
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setNear(true);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [lite, near]);

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

  // the still (a frame of the scene itself: the stone, its orbit, the dust) stands where the 3D stone would
  // (three/hero/state stonePlacement), the glow behind it; with a mouse it leans toward the pointer a little, as the
  // stone does (hero.css moves it: transform and opacity only)
  useEffect(() => {
    const el = hero.current;
    if (!el || !still) return;
    const place = () => {
      const { cx, cy, s } = stonePlacement(el, el.offsetWidth, el.offsetHeight);
      el.style.setProperty("--still-x", `${cx.toFixed(1)}px`);
      el.style.setProperty("--still-y", `${cy.toFixed(1)}px`);
      el.style.setProperty("--still-s", `${s.toFixed(1)}px`);
      if (glow.current) glow.current.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    const img = el.querySelector<HTMLElement>(".hero__still img");
    const lean = matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let px = 0;
    let py = 0;
    const move = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        img?.style.setProperty("--px", px.toFixed(3));
        img?.style.setProperty("--py", py.toFixed(3));
      });
    };
    if (lean && img) window.addEventListener("pointermove", move, { passive: true });
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, [still]);

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
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion]);

  useEffect(() => () => sceneRun.set(false), []);
  const running = started && visible;
  const live = running && lite === false && near && !failed;
  useEffect(() => {
    hero.current?.classList.toggle("is-live", live);
  }, [live]);

  return (
    <div className="hero" data-hero ref={hero}>
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow" data-glow ref={glow} />
      </div>
      {still && (
        <div className="hero__still" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- a frame of the 3D scene in this language (its orbit names the services), placed by the script */}
          <img
            src={`/img/still/hero-${lang}-1960.webp`}
            srcSet={`/img/still/hero-${lang}-980.webp 980w, /img/still/hero-${lang}-1960.webp 1960w`}
            sizes="(max-width: 860px) 160vw, 80vw"
            alt=""
            width={1970}
            height={1506}
            decoding="async"
            fetchPriority="high"
          />
        </div>
      )}
      {lite === false && near && (
        <WebGLGate onSkip={onSkip}>
          <ShardsScene running={running} reducedMotion={reducedMotion} />
          <HeroScene heroRef={hero} glowRef={glow} orbitLabel={orbitLabel} running={running} reducedMotion={reducedMotion} />
        </WebGLGate>
      )}
      <div className="hero__grain" aria-hidden="true" />
      {children}
    </div>
  );
}
