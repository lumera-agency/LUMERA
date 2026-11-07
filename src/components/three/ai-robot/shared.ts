/*
 * What the AI page's robot (the first screen: RobotHero, BotStory, three/ai-robot) shares between its scene and the
 * page's words: the requests it catches, what its face shows, the bridge the scene tells the page through (a row to
 * put a card into, a line to say, a row recorded), the pointer, whether the screen can be seen, the lime, small maths.
 */
import * as THREE from "three";

export const LIME = new THREE.Color(0xdaff02);
export const LIME_CSS = "#daff02";

export const damp = (from: number, to: number, lambda: number, dt: number) => from + (to - from) * (1 - Math.exp(-lambda * dt));
export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const easeInOut = (value: number) => (value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2);
/** progress 0…1 of a phase that runs from `start` to `end` seconds */
export const phase = (time: number, start: number, end: number) => clamp01((time - start) / (end - start));

/** a request the robot catches: who, from where, what they wrote, what it answers, when they are booked, the status */
export type BotLead = { who: string; via: string; msg: string; reply: string; when: string; state: string };
export type BotWords = { tag: string; leads: BotLead[] };

/** what the face shows: at rest (it blinks, a small smile), reading (the eyes run along the lines), talking (the mouth
 *  moves), pleased (^^ and a wide smile) */
export type FaceMood = "idle" | "read" | "talk" | "happy";

export { botStage } from "./stage";

/** Where the pointer is (window pixels) and when it last moved: the head turns to it for a moment, then back to work. */
export const robotPointer = { x: 0, y: 0, movedAt: -1e9 };

export function followPointer() {
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    robotPointer.x = event.clientX;
    robotPointer.y = event.clientY;
    robotPointer.movedAt = performance.now();
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  return () => window.removeEventListener("pointermove", onPointer);
}

/** a canvas texture that can be painted again (the face each frame, a card once its fonts are in) */
export function paintedTexture(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { context, texture };
}

/** Whether the first screen can be seen: on screen, not covered by the block that slides over it (its next sibling,
 *  ai.css: html.ai-stick), the tab not hidden. Calls back on every change; returns the stop. */
export function watchSeen(host: HTMLElement, onChange: (seen: boolean) => void) {
  let inView = false;
  let covered = false;
  const sync = () => onChange(inView && !covered && !document.hidden);
  const view = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });
  view.observe(host);
  const sheet = host.nextElementSibling;
  const cover = sheet
    ? new IntersectionObserver(
        ([entry]) => {
          covered = entry.isIntersecting || entry.boundingClientRect.bottom < 0;
          sync();
        },
        { rootMargin: "0px 0px -90% 0px" },
      )
    : null;
  if (sheet) cover?.observe(sheet);
  document.addEventListener("visibilitychange", sync);
  return () => {
    view.disconnect();
    cover?.disconnect();
    document.removeEventListener("visibilitychange", sync);
  };
}
