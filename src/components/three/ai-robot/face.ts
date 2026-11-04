/*
 * The robot's face: a screen drawn on a canvas each frame (the owner, 4 Nov 2026, after bidapp's robot: the face is a
 * screen, its feelings are drawn on it; theirs was a looping video, ours follows the story). A near-black glass with a
 * faint lime grid; two lime pixel eyes with brows that look where the head looks, blink, run along the lines while it
 * reads; a mouth always there (the owner: «а то он без рта»): a small smile at rest, a flat line while it reads, moving
 * while it talks, wide when it is pleased (the eyes then ^^).
 */
import { LIME_CSS, type FaceMood } from "./shared";

/** the canvas, in the screen's proportions (2.04 × 1.2) */
export const FACE = { width: 640, height: 376 };

export type FaceFrame = {
  mood: FaceMood;
  /** seconds, the face's own clock */
  time: number;
  /** -1…1: where the eyes look across the screen and up or down */
  lookX: number;
  lookY: number;
  /** 0 open … 1 shut */
  blink: number;
};

function bar(context: CanvasRenderingContext2D, centerX: number, centerY: number, width: number, height: number) {
  context.beginPath();
  context.roundRect(centerX - width / 2, centerY - height / 2, width, height, Math.min(width, height) / 2);
  context.fill();
}

export function paintFace(context: CanvasRenderingContext2D, frame: FaceFrame) {
  const { width, height } = context.canvas;
  context.fillStyle = "#040504";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(218, 255, 2, 0.07)";
  context.lineWidth = 1;
  context.beginPath();
  for (let x = 20; x < width; x += 24) {
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
  }
  for (let y = 8; y < height; y += 24) {
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
  }
  context.stroke();
  const shade = context.createRadialGradient(width / 2, height / 2, height * 0.25, width / 2, height / 2, width * 0.62);
  shade.addColorStop(0, "rgba(0, 0, 0, 0)");
  shade.addColorStop(1, "rgba(0, 0, 0, 0.65)");
  context.fillStyle = shade;
  context.fillRect(0, 0, width, height);

  context.save();
  context.fillStyle = LIME_CSS;
  context.strokeStyle = LIME_CSS;
  context.shadowColor = LIME_CSS;
  context.shadowBlur = 26;
  context.lineCap = "round";
  const { mood, time, lookX, lookY, blink } = frame;
  const shiftX = lookX * 44;
  const shiftY = lookY * 26;
  const eyesY = height * 0.4 + shiftY;
  const spread = width * 0.17;
  const scan = mood === "read" ? Math.sin(time * 9) * 18 : 0;
  for (const side of [-1, 1]) {
    const eyeX = width / 2 + side * spread + shiftX + scan;
    if (mood === "happy") {
      context.lineWidth = 17;
      context.beginPath();
      context.arc(eyeX, eyesY + 20, 36, Math.PI * 1.12, Math.PI * 1.88);
      context.stroke();
      continue;
    }
    const open = (mood === "read" ? 0.66 : 1) * (1 - blink * 0.9);
    const eyeHeight = 98 * open;
    bar(context, eyeX, eyesY, 78, Math.max(10, eyeHeight));
    // the brows: level at rest, drawn in while it reads, raised while it talks
    context.save();
    context.globalAlpha = 0.85;
    context.translate(eyeX, eyesY - Math.max(eyeHeight, 54) / 2 - (mood === "talk" ? 34 : mood === "idle" ? 28 : 20));
    context.rotate(mood === "read" ? side * 0.14 : 0);
    bar(context, 0, 0, 86, 13);
    context.restore();
  }
  // the mouth
  const mouthX = width / 2 + shiftX * 0.8;
  const mouthY = height * 0.76 + shiftY * 0.8;
  if (mood === "talk") {
    const open = 8 + 22 * Math.abs(Math.sin(time * 13)) * (0.6 + 0.4 * Math.sin(time * 5.3));
    bar(context, mouthX, mouthY, 54, open);
  } else if (mood === "happy") {
    context.beginPath();
    context.moveTo(mouthX - 40, mouthY - 10);
    context.quadraticCurveTo(mouthX, mouthY + 44, mouthX + 40, mouthY - 10);
    context.closePath();
    context.fill();
  } else if (mood === "read") {
    bar(context, mouthX, mouthY, 34, 9);
  } else {
    context.lineWidth = 9;
    context.beginPath();
    context.arc(mouthX, mouthY - 16, 26, Math.PI * 0.2, Math.PI * 0.8);
    context.stroke();
  }
  context.restore();
}
