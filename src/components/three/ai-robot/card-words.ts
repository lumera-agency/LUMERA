/*
 * The request card's words as page text over the 3D (the owner, 10 Nov 2026: «карточку ещё четче, только карточку»).
 * Painted into the card's texture they could be no sharper than the robot's canvas, one pixel per CSS pixel; as text
 * of the page they are drawn at the screen's own density. Each card's words are laid out on the face's own 900 × 516
 * grid (card-style.ts paints the glass on it) and, every frame the card shows, mapped onto the four corners of its face
 * as the camera sees them (one projective transform: the tilt and the perspective with it). The robot keeps its pixels.
 */
import * as THREE from "three";
import type { BotLead } from "./shared";
import { CARD_INK, CARD_SOURCE, FACE_GRID } from "./card-style";

export type CardWords = { element: HTMLElement; shown: boolean };

/** One card's words, laid out as card-style.ts painted them on the face's grid. */
export function makeCardWords(layer: HTMLElement, lead: BotLead, tag: string): CardWords {
  const element = document.createElement("div");
  element.className = "bot-card";
  element.setAttribute("aria-hidden", "true");
  const part = (className: string, text = "") => {
    const node = document.createElement("span");
    node.className = className;
    node.textContent = text;
    element.append(node);
    return node;
  };
  part("bot-card__dot").style.background = CARD_SOURCE[lead.via] ?? "#d9d6cf";
  part("bot-card__via", lead.via.toUpperCase()).style.color = CARD_INK.source;
  const pill = part("bot-card__tag", tag.toUpperCase());
  pill.style.background = CARD_INK.pill;
  pill.style.color = CARD_INK.pillInk;
  part("bot-card__who", lead.who).style.color = CARD_INK.name;
  part("bot-card__msg", `«${lead.msg}»`).style.color = CARD_INK.message;
  part("bot-card__rule").style.background = CARD_INK.rule;
  part("bot-card__time", "08:02").style.color = CARD_INK.time;
  layer.append(element);
  return { element, shown: false };
}

const corner = new THREE.Vector3();
const projected = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];

/**
 * Lays the words over the face: `face` is the face mesh (its plane `width` × `height` around its centre), `size` the
 * canvas in CSS pixels; `opacity` the face's.
 */
export function placeCardWords(words: CardWords, face: THREE.Object3D, camera: THREE.Camera, size: { width: number; height: number }, width: number, height: number, opacity: number) {
  // the face's corners, top left round to bottom left, on the screen
  const corners: [number, number][] = [[-width / 2, height / 2], [width / 2, height / 2], [width / 2, -height / 2], [-width / 2, -height / 2]];
  corners.forEach(([x, y], index) => {
    corner.set(x, y, 0).applyMatrix4(face.matrixWorld).project(camera);
    projected[index].set(((corner.x + 1) / 2) * size.width, ((1 - corner.y) / 2) * size.height);
  });
  words.element.style.transform = quadTransform(FACE_GRID.width, FACE_GRID.height, projected);
  words.element.style.opacity = opacity.toFixed(3);
  if (!words.shown) {
    words.element.style.visibility = "visible";
    words.shown = true;
  }
}

export function hideCardWords(words: CardWords) {
  if (!words.shown) return;
  words.element.style.visibility = "hidden";
  words.shown = false;
}

/** The CSS matrix that takes a `width` × `height` box onto the quad `points` (top left, top right, bottom right, bottom
 *  left): the square to quad projective map (Heckbert), scaled from the box. */
function quadTransform(width: number, height: number, points: THREE.Vector2[]) {
  const [p0, p1, p2, p3] = points;
  const sumX = p0.x - p1.x + p2.x - p3.x;
  const sumY = p0.y - p1.y + p2.y - p3.y;
  // x = (acrossX·u + downX·v + p0.x) / w, y = (acrossY·u + downY·v + p0.y) / w, w = 1 + bendU·u + bendV·v
  let acrossX: number, downX: number, acrossY: number, downY: number, bendU: number, bendV: number;
  if (Math.abs(sumX) < 1e-6 && Math.abs(sumY) < 1e-6) {
    // a parallelogram: no perspective
    acrossX = p1.x - p0.x; downX = p3.x - p0.x; acrossY = p1.y - p0.y; downY = p3.y - p0.y; bendU = 0; bendV = 0;
  } else {
    const rightX = p1.x - p2.x, bottomX = p3.x - p2.x, rightY = p1.y - p2.y, bottomY = p3.y - p2.y;
    const determinant = rightX * bottomY - bottomX * rightY;
    bendU = (sumX * bottomY - bottomX * sumY) / determinant;
    bendV = (rightX * sumY - sumX * rightY) / determinant;
    acrossX = p1.x - p0.x + bendU * p1.x; downX = p3.x - p0.x + bendV * p3.x;
    acrossY = p1.y - p0.y + bendU * p1.y; downY = p3.y - p0.y + bendV * p3.y;
  }
  const values = [acrossX / width, acrossY / width, 0, bendU / width, downX / height, downY / height, 0, bendV / height, 0, 0, 1, 0, p0.x, p0.y, 0, 1];
  return `matrix3d(${values.map((value) => (Number.isFinite(value) ? value.toFixed(6) : "0")).join(",")})`;
}
