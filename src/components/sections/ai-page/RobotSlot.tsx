"use client";
/*
 * Where the first screen's robot goes (three/ai-robot): its canvas over the whole screen, the head on this slot. Once
 * the page has loaded and the browser is idle, so the page never waits for three.js; without WebGL nothing comes and
 * the page shows the table's still, every request booked (.is-still on the screen: robot-hero.css keeps the rows as
 * waiting slots only while a robot is to come). It moves with reduced motion too (the owner, 9 Nov 2026).
 * A phone plays the scene as a film instead, from the first moment (RobotFilm); if it can't, the live scene comes; only
 * where neither can be drawn (no WebGL) a picture of the robot stands (RobotPicture).
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";
import type { BotWords } from "@/components/three/ai-robot/shared";
import { RobotFilm } from "./RobotFilm";
import { RobotPicture } from "./RobotPicture";

const RobotStage = dynamic(() => import("@/components/three/ai-robot/RobotStage"), { ssr: false });

/** the phones the film is for: the layout it was recorded in (robot-hero.css, under 600 px), a finger */
const PHONE = "(max-width: 599px) and (hover: none) and (pointer: coarse)";

export function RobotSlot({ words, film }: { words: BotWords; film: string }) {
  const mark = useRef<HTMLSpanElement>(null);
  const [places, setPlaces] = useState<{ host: HTMLElement; slot: HTMLElement } | null>(null);
  const [mode, setMode] = useState<"film" | "live" | "picture" | null>(null);
  useEffect(() => {
    let idle = 0;
    const find = () => {
      const slot = mark.current?.parentElement;
      const host = slot?.closest<HTMLElement>(".ai-bot");
      if (slot && host) setPlaces({ host, slot });
    };
    if (matchMedia(PHONE).matches) {
      const frame = requestAnimationFrame(() => {
        find();
        setMode("film");
      });
      return () => cancelAnimationFrame(frame);
    }
    const go = () => {
      find();
      setMode("live");
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
  // the live scene fills the page's table itself: on a phone it shows only now (robot-hero.css, .is-3d)
  useEffect(() => {
    if (mode === "live") places?.host.classList.add("is-3d");
  }, [mode, places]);
  return (
    <>
      <span ref={mark} hidden />
      {places && mode === "film" && <RobotFilm host={places.host} slot={places.slot} src={film} onFail={() => setMode("live")} />}
      {places && mode === "live" && (
        <WebGLGate
          onSkip={() => {
            places.host.classList.add("is-still");
            setMode("picture");
          }}
        >
          <RobotStage host={places.host} slot={places.slot} words={words} still={false} />
        </WebGLGate>
      )}
      {places && mode === "picture" && <RobotPicture host={places.host} slot={places.slot} />}
    </>
  );
}
