"use client";
/*
 * Where the first screen's robot goes (three/ai-robot): its canvas over the whole screen, the head on this slot. Once
 * the page has loaded and the browser is idle, so the page never waits for three.js; without WebGL nothing comes and
 * the page shows the table's still, every request booked (.is-still on the screen: robot-hero.css keeps the rows as
 * waiting slots only while a robot is to come). With reduced motion the robot still comes, drawn once in its pose.
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";
import type { BotWords } from "@/components/three/ai-robot/shared";

const RobotStage = dynamic(() => import("@/components/three/ai-robot/RobotStage"), { ssr: false });

export function RobotSlot({ words }: { words: BotWords }) {
  const mark = useRef<HTMLSpanElement>(null);
  const [places, setPlaces] = useState<{ host: HTMLElement; slot: HTMLElement } | null>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    let idle = 0;
    const go = () => {
      setStill(matchMedia("(prefers-reduced-motion: reduce)").matches);
      const slot = mark.current?.parentElement;
      const host = slot?.closest<HTMLElement>(".ai-bot");
      if (slot && host) setPlaces({ host, slot });
    };
    const later = () => {
      idle = typeof requestIdleCallback === "function" ? requestIdleCallback(go, { timeout: 1200 }) : window.setTimeout(go, 200);
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
      {places && (
        <WebGLGate onSkip={() => places.host.classList.add("is-still")}>
          <RobotStage host={places.host} slot={places.slot} words={words} still={still} />
        </WebGLGate>
      )}
    </>
  );
}
