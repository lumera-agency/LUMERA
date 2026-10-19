"use client";
/*
 * The first screen's background (the owner, 19 Oct 2026: «сделаем чёрный и максимально так, как я сделал в промте»):
 * React Bits FluxLines on pure black, with exactly the owner's settings. The lines take the first screen (sites-hero.css
 * fades them out towards the sample site below); they stop when block 2 has slid over the pinned hero (its top reaches
 * the screen's top) and start again when it leaves. The component itself stops when the hero is off screen or the tab is
 * hidden, and shows a still with reduced motion. (19 Oct, «немного подлагивает»:) it draws at most 30 frames a second
 * (the flow is slow, so it looks the same) and at the screen's CSS pixels or below (the lines are soft glow, so the
 * canvas scaled up reads the same): about a fifth of the work on a Retina screen.
 */
import { useEffect, useState } from "react";
import FluxLines from "./FluxLines";

/** `under`: the block that slides over the pinned first screen; the lines rest while it covers it (the AI page: #how). */
export function HeroFlux({ under = "#formats" }: { under?: string } = {}) {
  const [covered, setCovered] = useState(false);
  // (read once on the client: the component mounts after hydration, so the first render already knows the screen)
  const [dpr] = useState(() => (typeof matchMedia === "function" && matchMedia("(max-width: 600px)").matches ? 0.85 : 1));
  useEffect(() => {
    const next = document.querySelector<HTMLElement>(under);
    if (!next) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      setCovered(next.getBoundingClientRect().top <= 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
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
