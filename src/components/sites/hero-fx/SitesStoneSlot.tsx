"use client";
/*
 * «Дизайн і сайти»: where this page's live stone goes (SitesStone.tsx, a copy of the AI page's slot, components/ai/
 * AiStoneSlot.tsx, untouched): only once the page has loaded and the browser is idle, so the first screen never waits
 * for three.js; never with reduced motion or without WebGL: then the still under it simply stays.
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";

const SitesStone = dynamic(() => import("./SitesStone"), { ssr: false });

export function SitesStoneSlot() {
  const mark = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let idle = 0;
    const go = () => setHost(mark.current?.parentElement ?? null);
    const later = () => {
      idle = typeof requestIdleCallback === "function" ? requestIdleCallback(go, { timeout: 1500 }) : window.setTimeout(go, 200);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.removeEventListener("load", later);
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      clearTimeout(idle);
    };
  }, []);
  return (
    <>
      <span ref={mark} hidden />
      {host && (
        <WebGLGate>
          <SitesStone host={host} />
        </WebGLGate>
      )}
    </>
  );
}
