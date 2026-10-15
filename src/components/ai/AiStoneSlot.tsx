"use client";
/*
 * Where the AI page's live stone goes (three/ai-stone): only once the page has loaded and the browser is idle, so the
 * first screen never waits for three.js; on every device (owner, 2026-10-15), never with reduced motion or without
 * WebGL: then the still under it simply stays.
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";

const AiStone = dynamic(() => import("@/components/three/ai-stone/AiStone"), { ssr: false });

export function AiStoneSlot() {
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
          <AiStone host={host} />
        </WebGLGate>
      )}
    </>
  );
}
