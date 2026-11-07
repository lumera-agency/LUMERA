"use client";
/*
 * The robot where nothing of it can move (no WebGL: neither its film nor its live scene can be drawn, the owner, 6 Nov
 * 2026: the picture only then): one frame of its film, the table left out (the page's own table stands as its still),
 * laid on the head's slot as the film is.
 */
import { useEffect, useRef } from "react";
import { keepOnHead } from "./RobotFilm";

export function RobotPicture({ host, slot }: { host: HTMLElement; slot: HTMLElement }) {
  const picture = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const frame = picture.current;
    if (!frame) return;
    return keepOnHead(frame, host, slot);
  }, [host, slot]);
  return (
    <div className="ai-bot__picture" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- a transparent frame laid by script, not a content image */}
      <img ref={picture} src="/img/ai/robot-still.webp" width={804} height={1274} alt="" decoding="async" />
    </div>
  );
}
