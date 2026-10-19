"use client";
/*
 * The first screen's background (the owner, 19 Oct 2026: «сделаем чёрный и максимально так, как я сделал в промте»):
 * React Bits FluxLines on pure black, with exactly the owner's settings. The lines take the first screen (sites-hero.css
 * fades them out towards the sample site below); they stop when block 2 has slid over the pinned hero (less than 20 px of
 * it left under the topbar) and start again when it leaves. The component itself stops when the hero is off screen or the tab is
 * hidden, and shows a still with reduced motion. (19 Oct, «немного подлагивает»:) it draws at most 30 frames a second
 * (the flow is slow, so it looks the same) and at the screen's CSS pixels or below (the lines are soft glow, so the
 * canvas scaled up reads the same): about a fifth of the work on a Retina screen.
 */
import { useEffect, useState } from "react";
import FluxLines from "./FluxLines";

/** The first screen counts as covered once less than this much of it shows under the topbar (px; QA 19 Oct, N-05). */
const COVER_EDGE = 20;

/** `under`: the block that slides over the pinned first screen; the lines rest while it covers it (the AI page: #how). */
export function HeroFlux({ under = "#formats" }: { under?: string } = {}) {
  const [covered, setCovered] = useState(false);
  // (read once on the client: the component mounts after hydration, so the first render already knows the screen)
  const [dpr] = useState(() => (typeof matchMedia === "function" && matchMedia("(max-width: 600px)").matches ? 0.85 : 1));
  useEffect(() => {
    const next = document.querySelector<HTMLElement>(under);
    if (!next) return;
    const bar = document.querySelector<HTMLElement>("[data-topbar]");
    let raf = 0;
    // (N-05) covered: less than COVER_EDGE px of the first screen left under the topbar (before: only once the block's
    // top reached the screen's top, so the lines drew a strip hidden under the topbar)
    const check = () => {
      raf = 0;
      const edge = Math.max(0, bar?.getBoundingClientRect().bottom ?? 0) + COVER_EDGE;
      setCovered(next.getBoundingClientRect().top <= edge);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [under]);
  return (
    <FluxLines
      colors={["#f06200", "#f16300", "#f06200"]}
      glow={2}
      rimWidth={0.2}
      lineWidth={0.4}
      flowDirection="down"
      mouseInteraction
      clickSwirl
      speed={0.15}
      turbulence={1.2}
      sharpness={5.8}
      shimmer={1.55}
      mouseStrength={1.45}
      paused={covered}
      dpr={dpr}
      fps={30}
    />
  );
}
