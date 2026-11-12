"use client";
/*
 * The robot as a picture: one frame of a film of it, laid on the head's slot as the film is. A phone's (robot-still.webp,
 * the table left out: the page's own table stands as its still) where nothing of the robot can move (no WebGL: neither
 * its film nor its live scene can be drawn; the owner, 6 Nov 2026: the picture only then). A computer's in LITE
 * (RobotSlot): the frame its film starts from, there at once, the film taking over from it.
 */
import { useEffect, useRef } from "react";
import { RECORDED, keepOnHead, type Recorded } from "./RobotFilm";

type Props = { host: HTMLElement; slot: HTMLElement; src?: string; width?: number; height?: number; recorded?: Recorded };

export function RobotPicture({ host, slot, src = "/img/ai/robot-still.webp", width = 804, height = 1274, recorded = RECORDED }: Props) {
  const picture = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const frame = picture.current;
    if (!frame) return;
    return keepOnHead(frame, host, slot, recorded);
  }, [host, slot, recorded]);
  return (
    <div className="ai-bot__picture" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- a transparent frame laid by script, not a content image */}
      <img ref={picture} src={src} width={width} height={height} alt="" decoding="async" />
    </div>
  );
}
