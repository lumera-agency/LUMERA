"use client";
/*
 * The robot's canvas on the AI page's first screen (sections/ai-page/RobotHero): over the whole screen, the robot's
 * head on its slot and its hands (BotScene); run only while the first screen can be seen (off screen and in a hidden
 * tab the loop stops), faded in once the robot stands in its first pose. With reduced motion it draws its pose once
 * and stops.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Resume } from "../lib/Resume";
import { BotScene } from "./BotScene";
import { followPointer, watchSeen, type BotWords } from "./shared";

export default function RobotStage({ host, slot, words, still }: { host: HTMLElement; slot: HTMLElement; words: BotWords; still: boolean }) {
  const [visible, setVisible] = useState(false);
  // with reduced motion: a second of frames for the pose, then none
  const [warm, setWarm] = useState(true);

  useEffect(() => {
    const stopSeen = watchSeen(host, setVisible);
    const stopPointer = followPointer();
    return () => {
      stopSeen();
      stopPointer();
    };
  }, [host]);

  useEffect(() => {
    if (!still) return;
    const timer = window.setTimeout(() => setWarm(false), 1500);
    return () => clearTimeout(timer);
  }, [still]);

  const running = visible && (!still || warm);
  // the canvas covers the screen: as sharp as the screen's own pixels while that stays near three million drawn ones
  // (a phone at its full density, the card's words crisp; a large screen at 1.5, as before)
  const sharpest = useMemo(() => Math.min(3, Math.max(1.5, Math.sqrt(3e6 / (innerWidth * innerHeight)))), []);
  return (
    <div className="ai-bot__canvas" aria-hidden="true">
      <Canvas
        /* not measured again on every scroll (react-use-measure's default): the page's scroll would re-render the scene's
           root each time; the pointer is read from offsetX/Y, so the canvas' place on the page is never needed */
        resize={{ scroll: false }}
        dpr={[1, sharpest]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 14, near: 0.1, far: 100, position: [0, 0, 18] }}
        frameloop={running ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <BotScene slot={slot} words={words} still={still} />
        <LiveAfter frames={4} onLive={() => requestAnimationFrame(() => host.classList.add("is-live"))} />
        <Resume running={running} />
      </Canvas>
    </div>
  );
}

/** the canvas fades in a few frames after the robot first draws its pose (its shaders were compiled before) */
function LiveAfter({ frames, onLive }: { frames: number; onLive: () => void }) {
  const count = useRef(0);
  useFrame(() => {
    if (++count.current === frames) onLive();
  });
  return null;
}
