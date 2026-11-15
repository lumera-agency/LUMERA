"use client";
/*
 * Where the first screen's robot goes (three/ai-robot): its canvas over the whole screen, the head on this slot. Once
 * the page has loaded and the browser is idle, so the page never waits for three.js; without WebGL nothing comes and
 * the page shows the table's still, every request booked (.is-still on the screen: robot-hero.css keeps the rows as
 * waiting slots only while a robot is to come). It moves with reduced motion too (the owner, 9 Nov 2026).
 * A phone plays the scene as a film instead, from the first moment (RobotFilm); if it can't, the live scene comes; only
 * where neither can be drawn (no WebGL) a picture of the robot stands (RobotPicture).
 * LITE (lib/lite; the owner, 11 Nov 2026: films there, not stills): a phone plays its film as in FULL; a computer
 * shows the first frame of its own film at once (RobotPicture: decoded from the film itself, so it is the same
 * picture to the pixel) and the table's still, then, the page loaded and the browser idle, the film in its place, in
 * one step (RECORDED_DESK: the robot, its hands, the cards it reads). No three.js is fetched. A
 * film that cannot play there (no WebGL) leaves the picture: the live scene it would hand over to is refused in LITE
 * (WebGLGate). A page that goes LITE while the live robot runs swaps it for the film.
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { WebGLGate } from "@/components/three/lib/WebGLGate";
import type { BotWords } from "@/components/three/ai-robot/shared";
import { RECORDED_DESK, RobotFilm } from "./RobotFilm";
import { RobotPicture } from "./RobotPicture";
import { isLite, useLite } from "@/lib/lite";
import { afterRoll } from "@/lib/boot";

const RobotStage = dynamic(() => import("@/components/three/ai-robot/RobotStage"), { ssr: false });

/** the phones the film is for: the layout it was recorded in (robot-hero.css, under 600 px), a finger */
const PHONE = "(max-width: 599px) and (hover: none) and (pointer: coarse)";

type Props = {
  words: BotWords;
  /** a phone's film */
  film: string;
  /** a computer's film in LITE, and the frame it starts from */
  deskFilm: string;
  deskStill: string;
};

export function RobotSlot({ words, film, deskFilm, deskStill }: Props) {
  const mark = useRef<HTMLSpanElement>(null);
  const [places, setPlaces] = useState<{ host: HTMLElement; slot: HTMLElement } | null>(null);
  const [mode, setMode] = useState<"film" | "desk" | "live" | "picture" | null>(null);
  /** LITE on a computer: the film may come (the page has loaded, the browser is idle) */
  const [deskReady, setDeskReady] = useState(false);
  const lite = useLite();
  useEffect(() => {
    // (what cancels the wait, by its own kind: an idle callback's number given to clearTimeout would cancel whichever
    // timer happens to have that number)
    let cancelWait = () => {};
    const find = () => {
      const slot = mark.current?.parentElement;
      const host = slot?.closest<HTMLElement>(".ai-bot");
      if (slot && host) setPlaces({ host, slot });
      return host;
    };
    // where a visit starts on this page the preloader plays first (the owner, 12 Nov 2026): the film and the live scene
    // come once its roll has played, as the home page's stone does (lib/boot afterRoll), so they never stall its letters
    let alive = true;
    if (matchMedia(PHONE).matches) {
      let frame = 0;
      void afterRoll().then(() => {
        if (!alive) return;
        frame = requestAnimationFrame(() => {
          find();
          setMode("film");
        });
      });
      return () => {
        alive = false;
        cancelAnimationFrame(frame);
      };
    }
    // (LITE by the page's own word, not the render's: the first render does not know the mode yet)
    if (lite || isLite()) {
      let screen: HTMLElement | null | undefined;
      const frame = requestAnimationFrame(() => {
        screen = find();
        // (.is-still: the table's still; .is-desk: the film takes over from the picture in one step, robot-hero.css)
        screen?.classList.add("is-still", "is-desk");
        setMode("desk");
      });
      const ready = () => {
        if (typeof requestIdleCallback === "function") {
          const handle = requestIdleCallback(() => setDeskReady(true), { timeout: 2500 });
          cancelWait = () => cancelIdleCallback(handle);
        } else {
          const timer = window.setTimeout(() => setDeskReady(true), 600);
          cancelWait = () => clearTimeout(timer);
        }
      };
      if (document.readyState === "complete") ready();
      else window.addEventListener("load", ready, { once: true });
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("load", ready);
        cancelWait();
        screen?.classList.remove("is-desk");
      };
    }
    const go = () => {
      find();
      setMode("live");
    };
    const later = () => {
      if (typeof requestIdleCallback === "function") {
        const handle = requestIdleCallback(go, { timeout: 1200 });
        cancelWait = () => cancelIdleCallback(handle);
      } else {
        const timer = window.setTimeout(go, 200);
        cancelWait = () => clearTimeout(timer);
      }
    };
    void afterRoll().then(() => {
      if (!alive) return;
      if (document.readyState === "complete") later();
      else window.addEventListener("load", later, { once: true });
    });
    return () => {
      alive = false;
      window.removeEventListener("load", later);
      cancelWait();
    };
  }, [lite]);
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
      {places && mode === "desk" && (
        <>
          <RobotPicture host={places.host} slot={places.slot} src={deskStill} width={RECORDED_DESK.frameWidth} height={RECORDED_DESK.frameHeight} recorded={RECORDED_DESK} />
          {/* (it cannot play: the picture simply stays) */}
          {deskReady && <RobotFilm host={places.host} slot={places.slot} src={deskFilm} recorded={RECORDED_DESK} onFail={() => {}} />}
        </>
      )}
    </>
  );
}
