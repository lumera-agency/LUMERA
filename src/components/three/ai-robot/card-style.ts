/*
 * The request cards' glass (the owner, 4 Nov 2026: «стиль стекло», of five after three references the dark frosted one,
 * as on a glassmorphism mockup): the card's body (the slab: its material, how see-through, how thick) and its face
 * (painted on a canvas: the veil, the frost, the rim, the words).
 */
import * as THREE from "three";
import type { BotLead } from "./shared";

/** the source's colour on a card */
export const CARD_SOURCE: Record<string, string> = { Instagram: "#e1306c", Telegram: "#2aa3e0" };
const SOURCE = CARD_SOURCE;
/** the face's grid: its texture's pixels, and the page's words laid out on the same (card-words.ts) */
export const FACE_GRID = { width: 900, height: 516 };

type Ink = { name: string; message: string; source: string; time: string; rule: string; pill: string; pillInk: string; shadow?: string };

export type CardStyle = {
  body: THREE.MeshPhysicalMaterial;
  /** the body's opacity when the card is fully there (it fades as the card goes into the table) */
  bodyOpacity: number;
  /** the slab's thickness, against the base one */
  depth: number;
  /** the face; `withWords` false: the glass alone, its words are the page's text over it (card-words.ts) */
  paint: (context: CanvasRenderingContext2D, lead: BotLead, tag: string, withWords?: boolean) => void;
};

function outline(context: CanvasRenderingContext2D, inset: number, radius: number) {
  const { width, height } = context.canvas;
  context.beginPath();
  context.roundRect(inset, inset, width - inset * 2, height - inset * 2, radius);
}

/** the words, the same on every glass: the source with its colour, «Нова заявка» as a pill, the name, the message */
function words(context: CanvasRenderingContext2D, lead: BotLead, tag: string, ink: Ink) {
  const { width } = context.canvas;
  const root = getComputedStyle(document.documentElement);
  const sans = root.getPropertyValue("--font-sans").trim() || "system-ui, sans-serif";
  const mono = root.getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
  context.save();
  if (ink.shadow) {
    context.shadowColor = ink.shadow;
    context.shadowBlur = 10;
  }
  context.fillStyle = SOURCE[lead.via] ?? "#d9d6cf";
  context.beginPath();
  context.arc(72, 80, 15, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = ink.source;
  context.font = `500 34px ${mono}`;
  context.letterSpacing = "4px";
  context.textBaseline = "middle";
  context.fillText(lead.via.toUpperCase(), 102, 82);
  context.font = `500 28px ${mono}`;
  context.letterSpacing = "3px";
  const label = tag.toUpperCase();
  const labelWidth = context.measureText(label).width + 40;
  context.fillStyle = ink.pill;
  context.beginPath();
  context.roundRect(width - 54 - labelWidth, 56, labelWidth, 52, 26);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = ink.pillInk;
  context.fillText(label, width - 34 - labelWidth, 83);
  context.letterSpacing = "0px";
  if (ink.shadow) context.shadowBlur = 10;
  context.fillStyle = ink.name;
  context.font = `600 80px ${sans}`;
  context.fillText(lead.who, 58, 212, width - 116);
  context.fillStyle = ink.message;
  context.font = `400 50px ${sans}`;
  context.fillText(`«${lead.msg}»`, 58, 320, width - 116);
  context.shadowBlur = 0;
  context.fillStyle = ink.rule;
  context.fillRect(58, 404, width - 116, 2);
  context.fillStyle = ink.time;
  context.font = `400 32px ${mono}`;
  context.fillText("08:02", 58, 452);
  context.restore();
}

/** a colour wash across the glass, corner to corner (the owner: «добавь градиента») */
function wash(context: CanvasRenderingContext2D, stops: [number, string][]) {
  const { width, height } = context.canvas;
  const gradient = context.createLinearGradient(0, 0, width, height);
  stops.forEach(([offset, colour]) => gradient.addColorStop(offset, colour));
  outline(context, 3, 46);
  context.fillStyle = gradient;
  context.fill();
}

/** a sheen from the top left, as light lying on glass */
function sheen(context: CanvasRenderingContext2D, strength: number) {
  const { width } = context.canvas;
  const light = context.createRadialGradient(width * 0.15, 0, 0, width * 0.15, 0, width * 0.8);
  light.addColorStop(0, `rgba(255, 255, 255, ${strength})`);
  light.addColorStop(1, "rgba(255, 255, 255, 0)");
  outline(context, 3, 46);
  context.fillStyle = light;
  context.fill();
}

/** a fine frost: dense pale grain, so the glass reads matte (frosted), not clear */
function frost(context: CanvasRenderingContext2D, alpha: number) {
  const { width, height } = context.canvas;
  context.save();
  outline(context, 3, 46);
  context.clip();
  for (let speck = 0; speck < 9000; speck++) {
    context.fillStyle = `rgba(255, 255, 255, ${alpha * Math.random()})`;
    context.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
  }
  context.restore();
}

/** a rim: a gradient line round the card */
function rim(context: CanvasRenderingContext2D, stops: [number, string][], line: number) {
  const { width, height } = context.canvas;
  const gradient = context.createLinearGradient(0, 0, width, height);
  stops.forEach(([offset, colour]) => gradient.addColorStop(offset, colour));
  context.save();
  outline(context, line / 2 + 1, 46);
  context.lineWidth = line;
  context.strokeStyle = gradient;
  context.stroke();
  context.restore();
}

const WHITE_INK: Ink = {
  name: "#ffffff",
  message: "rgba(255, 255, 255, 0.84)",
  source: "rgba(255, 255, 255, 0.78)",
  time: "rgba(255, 255, 255, 0.5)",
  rule: "rgba(255, 255, 255, 0.16)",
  pill: "rgba(218, 255, 2, 0.92)",
  pillInk: "#0f0e0d",
};

/** the glass card's ink, on its texture and as the page's words over it */
export const CARD_INK: Ink = { ...WHITE_INK, message: "rgba(255, 255, 255, 0.72)" };

export function makeCardStyle(mirror: THREE.Texture): CardStyle {
  // dark frosted glass (the mockup): a smoked veil with a lime-to-teal glow under a fine frost, a thin light edge,
  // brightest along the top
  return {
    body: new THREE.MeshPhysicalMaterial({ color: 0x1b1b1d, metalness: 0, roughness: 0.6, clearcoat: 1, clearcoatRoughness: 0.5, transparent: true, envMap: mirror, envMapIntensity: 0.6, depthWrite: false }),
    bodyOpacity: 0.6,
    depth: 1,
    paint: (context, lead, tag, withWords = true) => {
      const { width, height } = context.canvas;
      context.clearRect(0, 0, width, height);
      const veil = context.createLinearGradient(0, 0, 0, height);
      veil.addColorStop(0, "rgba(44, 44, 47, 0.82)");
      veil.addColorStop(1, "rgba(22, 22, 24, 0.86)");
      outline(context, 3, 46);
      context.fillStyle = veil;
      context.fill();
      wash(context, [[0, "rgba(218, 255, 2, 0.1)"], [0.5, "rgba(40, 40, 44, 0)"], [1, "rgba(60, 200, 190, 0.16)"]]);
      frost(context, 0.09);
      sheen(context, 0.1);
      rim(context, [[0, "rgba(255, 255, 255, 0.55)"], [0.4, "rgba(255, 255, 255, 0.14)"], [1, "rgba(255, 255, 255, 0.26)"]], 3);
      if (withWords) words(context, lead, tag, CARD_INK);
    },
  };
}
