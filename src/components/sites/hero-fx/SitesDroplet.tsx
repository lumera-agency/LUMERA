"use client";
/*
 * «Дизайн і сайти»: the first screen's object, the droplet of liquid metal (three/droplet, the owner's VarianteMain of
 * 12 Oct 2026), in place of the stone (the owner, 20 Oct). The still under it is a frame of the droplet at the canvas'
 * size (img/droplet/droplet-*.webp); the live one dissolves in over it, in that same pose, once the still's entrance has
 * ended and the body has been drawn (sites-hero.css), and then comes to life. It renders only while it can be seen: it rests once less than ~20 px of the first
 * screen shows under the topbar (the block sliding over the pinned first screen), and in a hidden tab.
 */
import { useEffect, useRef, useState } from "react";
import DropletScene from "@/components/three/droplet/DropletScene";

/** The first screen counts as covered once less than this much of it shows under the topbar (px). */
const COVER_EDGE = 20;

export default function SitesDroplet({ host }: { host: HTMLElement }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [interactive] = useState(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  const [awake, setAwake] = useState(false);
  // its turn in the picture plane: the page's CSS sets it (--droplet-roll on the hero, the still turns by the same)
  const [roll] = useState(() => (-parseFloat(getComputedStyle(host).getPropertyValue("--droplet-roll")) || 0) * (Math.PI / 180));

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let inView = false;
    let covered = false;
    const sync = () => setVisible(inView && !covered && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    const sheet = host.closest(".ai-hero")?.nextElementSibling;
    const bar = document.querySelector<HTMLElement>("[data-topbar]");
    let raf = 0;
    const check = () => {
      raf = 0;
      if (!sheet) return;
      const now = sheet.getBoundingClientRect().top <= Math.max(0, bar?.getBoundingClientRect().bottom ?? 0) + COVER_EDGE;
      if (now === covered) return;
      covered = now;
      sync();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [host]);

  // the live droplet takes over once the still's entrance (CSS st-stone-in) has ended, never in the middle of it; it holds
  // the still's pose until the still has gone (sites-hero.css: 0.4 s), then comes to life
  const takeOver = () => {
    const still = host.querySelector<HTMLImageElement>(".ai-hero__stone");
    const running = still?.getAnimations().filter((a) => a.playState === "running") ?? [];
    Promise.all(running.map((a) => a.finished.catch(() => {}))).then(() => {
      host.classList.add("is-live");
      setTimeout(() => setAwake(true), 450);
    });
  };

  return (
    <div ref={box} className="ai-hero__canvas" aria-hidden="true">
      <DropletScene active={visible} interactive={interactive} awake={awake} roll={roll} onReady={takeOver} />
    </div>
  );
}
