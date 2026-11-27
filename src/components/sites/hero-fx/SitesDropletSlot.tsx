"use client";
/*
 * «Дизайн і сайти»: where the live droplet goes (SitesDroplet.tsx): asked for at once, its body and photo too
 * (droplet-prefetch), so it comes in with the first screen's other entrances, not last (the owner, 10 Nov 2026);
 * never without WebGL: then the still under it simply stays (.is-still). A phone plays the droplet as a film instead,
 * from the first moment (SitesDropletFilm, the owner, 6 Nov 2026); if it can't, the live droplet comes. It moves with
 * reduced motion and Save-Data too (the owner, 9 Nov 2026: the picture only where nothing else can run).
 * LITE (lib/lite, the owner, 11 Nov 2026: films there, not stills): the film on a computer too, no three.js fetched; if
 * the film cannot play there (no WebGL), the still under it stays (.is-still). A page that goes LITE while the live
 * droplet runs swaps it for the film.
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";
import { SitesDropletFilm } from "./SitesDropletFilm";
import { prefetchDroplet } from "@/components/three/droplet/droplet-prefetch";
import { isLite, useLite } from "@/lib/lite";
import { afterRoll } from "@/lib/boot";

const SitesDroplet = dynamic(() => import("./SitesDroplet"), { ssr: false });

/** the screens the film is for: a finger (the droplet doesn't follow one, so the film is all it does) */
const TOUCH = "(hover: none) and (pointer: coarse)";
const FILM = "/img/droplet/droplet-film.mp4";

/**
 * The still where nothing can move (no film, no live droplet), put on a canvas as it is shown. The photo itself never
 * paints: shown seconds in, once the page had found out nothing else could run, it was the first screen's largest
 * element and so its LCP (PageSpeed's phone, 16 Nov 2026: 6.5 s). A canvas is not counted; the title is, at first paint.
 * Without scripts the photo stays as it is (sites-hero.css).
 */
function showStill(host: HTMLElement) {
  const photo = host.querySelector<HTMLImageElement>("img.ai-hero__stone");
  const draw = () => {
    if (host.classList.contains("is-still")) return;
    if (photo?.naturalWidth) {
      // the photo's own class: its size, place, turn and entrance (sites-hero.css)
      const canvas = document.createElement("canvas");
      canvas.className = "ai-hero__stone";
      canvas.width = photo.naturalWidth;
      canvas.height = photo.naturalHeight;
      canvas.getContext("2d")?.drawImage(photo, 0, 0);
      photo.after(canvas);
    }
    host.classList.add("is-still");
  };
  if (!photo || (photo.complete && photo.naturalWidth)) draw();
  else {
    photo.addEventListener("load", draw, { once: true });
    photo.addEventListener("error", draw, { once: true });
  }
}

export function SitesDropletSlot() {
  const mark = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<"film" | "live" | "still" | null>(null);
  const lite = useLite();
  useEffect(() => {
    const rock = mark.current?.parentElement ?? null;
    // where a visit starts on this page the preloader plays first (the owner, 12 Nov 2026): the droplet comes once its
    // roll has played, as the home page's stone does (lib/boot afterRoll), so it never stalls the roll's letters; the
    // first screen's entrances wait for the preloader too (lib/curtain whenCurtainLifts)
    let alive = true;
    let frame = 0;
    void afterRoll().then(() => {
      if (!alive) return;
      // (LITE by the page's own word, not the render's: the first render does not know the mode yet)
      if (matchMedia(TOUCH).matches || lite || isLite()) {
        frame = requestAnimationFrame(() => {
          setHost(rock);
          setMode("film");
        });
        return;
      }
      // the body's build and the photo start now, alongside the 3D chunk (they used to wait for it, one after the other)
      prefetchDroplet();
      setHost(rock);
      setMode("live");
    });
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [lite]);
  return (
    <>
      <span ref={mark} hidden />
      {host && mode === "film" && (
        <SitesDropletFilm
          host={host}
          src={FILM}
          onFail={() => {
            // the film cannot play: the live droplet in FULL; in LITE the still
            if (isLite()) showStill(host);
            setMode(isLite() ? "still" : "live");
          }}
          onLost={() => {
            // its graphics context taken back by the browser (Safari under memory pressure): the still
            showStill(host);
            setMode("still");
          }}
        />
      )}
      {host && mode === "live" && (
        <WebGLGate onSkip={() => showStill(host)}>
          <SitesDroplet
            host={host}
            onLost={() => {
              showStill(host);
              setMode("still");
            }}
          />
        </WebGLGate>
      )}
    </>
  );
}
