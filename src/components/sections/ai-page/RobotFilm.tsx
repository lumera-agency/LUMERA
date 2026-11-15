"use client";
/*
 * The robot on a phone (the owner, 6 Nov 2026): the live scene (three/ai-robot) recorded once into a looped film
 * (fx/alpha-film), so a phone neither downloads three.js nor builds it, and the robot, its cards, its answers and the
 * table come in together, already moving, never one part after another. The film keeps its own transparency, so the
 * antennas stand over the question's last line as the live robot's do. onFail hands the screen to the live scene.
 */
import { useEffect, useRef } from "react";
import { playAlphaFilm } from "@/components/fx/alpha-film/alpha-film";

/** Where a film was recorded: the head's slot, and the film's frame around it, in that screen's css px. Recorded
 *  again, these change. */
export type Recorded = { headWidth: number; headCenter: number; frameWidth: number; frameHeight: number; fromHeadTop: number };

/** A phone's film (a screen 402 px wide, where the table's words all fit): from above the antennas to the table's
 *  foot, the table in it. */
export const RECORDED: Recorded = { headWidth: 273.36, headCenter: 201, frameWidth: 402, frameHeight: 637, fromHeadTop: -152.09 };

/** A computer's film, LITE's (lib/lite; the owner, 11 Nov 2026: a film there, not a still): the robot, its hands and
 *  the card it reads, recorded at 1440 × 900 over one round of 19.2 s (tools/record-film.mjs robot, in the optimization
 *  folder); the table is the page's own. The frame's left, top and bottom edges fade out, where the cards leave for the
 *  table and come in. */
export const RECORDED_DESK: Recorded = { headWidth: 517, headCenter: 537.5, frameWidth: 912, frameHeight: 540, fromHeadTop: -45 };

/** A recorded frame (a film's, or its still's) laid over the screen where the live scene would draw it: the head on
 *  its slot, scaled with it. Kept so on every resize; returns its stop. */
export function keepOnHead(frame: HTMLElement, host: HTMLElement, slot: HTMLElement, recorded: Recorded = RECORDED) {
  const place = () => {
    const room = host.getBoundingClientRect();
    const head = slot.getBoundingClientRect();
    const scale = head.width / recorded.headWidth;
    frame.style.left = `${head.left + head.width / 2 - room.left - recorded.headCenter * scale}px`;
    frame.style.top = `${head.top - room.top + recorded.fromHeadTop * scale}px`;
    frame.style.width = `${recorded.frameWidth * scale}px`;
    frame.style.height = `${recorded.frameHeight * scale}px`;
  };
  place();
  const resized = new ResizeObserver(place);
  resized.observe(host);
  resized.observe(slot);
  return () => resized.disconnect();
}

export function RobotFilm({ host, slot, src, onFail, recorded = RECORDED }: { host: HTMLElement; slot: HTMLElement; src: string; onFail: () => void; recorded?: Recorded }) {
  const layer = useRef<HTMLDivElement>(null);
  const failRef = useRef(onFail);
  useEffect(() => {
    failRef.current = onFail;
  }, [onFail]);

  useEffect(() => {
    const box = layer.current;
    if (!box) return;
    const canvas = document.createElement("canvas");
    canvas.className = "ai-bot__film";
    box.append(canvas);

    const stopPlacing = keepOnHead(canvas, host, slot, recorded);

    const stop = playAlphaFilm({
      canvas,
      src,
      watch: host,
      // held while the next block covers the pinned first screen (.is-under, ai-runtime.js): the film is on screen
      // all the while and would play on, unseen
      hold: (set) => {
        const screen = host.closest(".ai-hero");
        if (!screen) return () => {};
        const tell = () => set(screen.classList.contains("is-under"));
        const classes = new MutationObserver(tell);
        classes.observe(screen, { attributes: true, attributeFilter: ["class"] });
        tell();
        return () => classes.disconnect();
      },
      // drawn: the robot and the table come in together (robot-hero.css)
      onShown: () => host.classList.add("is-film", "is-live"),
      onFail: () => failRef.current(),
    });
    return () => {
      stop();
      stopPlacing();
      canvas.remove();
      host.classList.remove("is-film");
    };
  }, [host, slot, src, recorded]);

  return <div ref={layer} className="ai-bot__canvas" aria-hidden="true" />;
}
