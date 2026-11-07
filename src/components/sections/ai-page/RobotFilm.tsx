"use client";
/*
 * The robot on a phone (the owner, 6 Nov 2026): the live scene (three/ai-robot) recorded once into a looped film
 * (fx/alpha-film), so a phone neither downloads three.js nor builds it, and the robot, its cards, its answers and the
 * table come in together, already moving, never one part after another. The film keeps its own transparency, so the
 * antennas stand over the question's last line as the live robot's do. onFail hands the screen to the live scene.
 */
import { useEffect, useRef } from "react";
import { playAlphaFilm } from "@/components/fx/alpha-film/alpha-film";

/** Where the film was recorded (a screen 402 px wide, where the table's words all fit): the head's slot, and the
 *  film's frame from above the antennas to the table's foot, in that screen's css px. Recorded again, these change. */
const RECORDED = { headWidth: 273.36, headCenter: 201, frameWidth: 402, frameHeight: 637, fromHeadTop: -152.09 };

/** A recorded frame (the film's, or the still's: robot-still.webp, the same frame) laid over the screen where the live
 *  scene would draw it: the head on its slot, scaled with it. Kept so on every resize; returns its stop. */
export function keepOnHead(frame: HTMLElement, host: HTMLElement, slot: HTMLElement) {
  const place = () => {
    const room = host.getBoundingClientRect();
    const head = slot.getBoundingClientRect();
    const scale = head.width / RECORDED.headWidth;
    frame.style.left = `${head.left + head.width / 2 - room.left - RECORDED.headCenter * scale}px`;
    frame.style.top = `${head.top - room.top + RECORDED.fromHeadTop * scale}px`;
    frame.style.width = `${RECORDED.frameWidth * scale}px`;
    frame.style.height = `${RECORDED.frameHeight * scale}px`;
  };
  place();
  const resized = new ResizeObserver(place);
  resized.observe(host);
  resized.observe(slot);
  return () => resized.disconnect();
}

export function RobotFilm({ host, slot, src, onFail }: { host: HTMLElement; slot: HTMLElement; src: string; onFail: () => void }) {
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

    const stopPlacing = keepOnHead(canvas, host, slot);

    const stop = playAlphaFilm({
      canvas,
      src,
      watch: host,
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
  }, [host, slot, src]);

  return <div ref={layer} className="ai-bot__canvas" aria-hidden="true" />;
}
