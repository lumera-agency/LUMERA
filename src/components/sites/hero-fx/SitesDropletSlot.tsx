"use client";
/*
 * «Дизайн і сайти»: where the live droplet goes (SitesDroplet.tsx): only once the page has loaded and the browser is
 * idle, so the first screen never waits for three.js; on a phone too (the owner, 20 Oct: it flows there, the finger
 * doesn't pull it); never with reduced motion, Save-Data or without WebGL: then the still under it simply stays.
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";

const SitesDroplet = dynamic(() => import("./SitesDroplet"), { ssr: false });

export function SitesDropletSlot() {
  const mark = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
          <SitesDroplet host={host} />
        </WebGLGate>
      )}
    </>
  );
}
