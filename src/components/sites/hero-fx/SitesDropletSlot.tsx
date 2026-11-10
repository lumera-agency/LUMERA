"use client";
/*
 * «Дизайн і сайти»: where the live droplet goes (SitesDroplet.tsx): asked for as soon as the browser has a moment, not
 * after the whole page has loaded (it comes once, whole: the sooner the better; the words are painted before it anyway);
 * never without WebGL: then the still under it simply stays (.is-still). A phone plays the droplet as a film instead,
 * from the first moment (SitesDropletFilm, the owner, 6 Nov 2026); if it can't, the live droplet comes. It moves with
 * reduced motion and Save-Data too (the owner, 9 Nov 2026: the picture only where nothing else can run).
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";
import { SitesDropletFilm } from "./SitesDropletFilm";

const SitesDroplet = dynamic(() => import("./SitesDroplet"), { ssr: false });

/** the screens the film is for: a finger (the droplet doesn't follow one, so the film is all it does) */
const TOUCH = "(hover: none) and (pointer: coarse)";
const FILM = "/img/droplet/droplet-film.mp4";

export function SitesDropletSlot() {
  const mark = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<"film" | "live" | null>(null);
  useEffect(() => {
    const rock = mark.current?.parentElement ?? null;
    if (matchMedia(TOUCH).matches) {
      const frame = requestAnimationFrame(() => {
        setHost(rock);
        setMode("film");
      });
      return () => cancelAnimationFrame(frame);
    }
    const go = () => {
      setHost(rock);
      setMode("live");
    };
    const idle = typeof requestIdleCallback === "function" ? requestIdleCallback(go, { timeout: 300 }) : window.setTimeout(go, 100);
    return () => {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      clearTimeout(idle);
    };
  }, []);
  return (
    <>
      <span ref={mark} hidden />
      {host && mode === "film" && <SitesDropletFilm host={host} src={FILM} onFail={() => setMode("live")} />}
      {host && mode === "live" && (
        <WebGLGate onSkip={() => host.classList.add("is-still")}>
          <SitesDroplet host={host} />
        </WebGLGate>
      )}
    </>
  );
}
