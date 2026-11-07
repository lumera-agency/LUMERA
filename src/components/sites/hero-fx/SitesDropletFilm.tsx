"use client";
/*
 * The droplet on a phone (the owner, 6 Nov 2026): the live droplet (three/droplet) recorded once over one period of its
 * flow (it loops on 11 s by itself) into a film with its own transparency (fx/alpha-film), drawn in the very box the live
 * canvas takes. A phone then neither downloads three.js nor builds it, and the droplet comes in already flowing, never
 * the still first and the live one over it. onFail hands the box to the live droplet.
 */
import { useEffect, useRef } from "react";
import { playAlphaFilm } from "@/components/fx/alpha-film/alpha-film";

export function SitesDropletFilm({ host, src, onFail }: { host: HTMLElement; src: string; onFail: () => void }) {
  const failRef = useRef(onFail);
  useEffect(() => {
    failRef.current = onFail;
  }, [onFail]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "ai-hero__canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.append(canvas);
    const stop = playAlphaFilm({
      canvas,
      src,
      watch: host,
      // drawn: it comes in (sites-hero.css, .is-live)
      onShown: () => host.classList.add("is-live"),
      onFail: () => failRef.current(),
    });
    return () => {
      stop();
      canvas.remove();
      host.classList.remove("is-live");
    };
  }, [host, src]);

  return null;
}
