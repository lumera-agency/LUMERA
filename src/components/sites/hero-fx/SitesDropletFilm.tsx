"use client";
/*
 * The droplet on a phone (the owner, 6 Nov 2026): the live droplet (three/droplet) recorded once over one period of its
 * flow (it loops on 11 s by itself) into a film with its own transparency (fx/alpha-film), drawn in the very box the live
 * canvas takes. A phone then neither downloads three.js nor builds it, and the droplet comes in already flowing, never
 * the still first and the live one over it. onFail hands the box to the live droplet.
 */
import { useEffect, useRef } from "react";
import { playAlphaFilm } from "@/components/fx/alpha-film/alpha-film";
import { watchCover } from "./hero-cover";

export function SitesDropletFilm({ host, src, onFail, onLost }: { host: HTMLElement; src: string; onFail: () => void; onLost?: () => void }) {
  const failRef = useRef(onFail);
  const lostRef = useRef(onLost);
  useEffect(() => {
    failRef.current = onFail;
    lostRef.current = onLost;
  }, [onFail, onLost]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "ai-hero__canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.append(canvas);
    const stop = playAlphaFilm({
      canvas,
      src,
      watch: host,
      // held while block 2 covers the pinned first screen (a computer in LITE: the film is on screen all the while and
      // played on under the block, drawn 30 times a second into a canvas nobody saw: 11 Nov 2026)
      hold: (set) => watchCover(set),
      // drawn: it comes in (sites-hero.css, .is-live)
      onShown: () => host.classList.add("is-live"),
      onFail: () => failRef.current(),
    });
    // its context taken back by the browser (27 Nov 2026, an iPhone: Safari under memory pressure): the still instead
    // (a lost canvas can show as a flat dark sheet)
    let ended = false;
    const end = () => {
      if (ended) return;
      ended = true;
      stop();
      canvas.remove();
      host.classList.remove("is-live");
    };
    const onCtxLost = (e: Event) => {
      e.preventDefault();
      end();
      lostRef.current?.();
    };
    canvas.addEventListener("webglcontextlost", onCtxLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", onCtxLost);
      end();
    };
  }, [host, src]);

  return null;
}
