/**
 * The droplet's shape and its look, VarianteMain (the owner's pick in the /form tuner, 12 Oct 2026): every number that
 * sets how it flows, shines and answers the pointer. Shared by the worker (no three.js here) and the scene.
 *
 * World units = the reference's viewBox units (704 × 715), y up. The body is centred on its own middle (the reference
 * sits it a little up and left in its frame), so a square canvas holds it centred.
 */
import { FORM_CONTOUR, type Ring } from "./form-contour";
import type { InflateOptions } from "./inflate-geometry";

export const DROPLET = {
  /** seconds per loop: the whole deformation repeats exactly */
  period: 11,
  /** 0 = a straight travelling wave, 1 = the orbit morph (every point on its own ellipse) */
  swirl: 0.65,
  /** the orbit's turn: 1 or −1 */
  spin: 1,
  /** the orbit fields' size, in body half-widths */
  cell: 1.6,
  /** the straight wave's length, in body widths, and where it travels (screen degrees: 168 = left) */
  waveLength: 1.6,
  travelDeg: 168,
  /** the second harmonic's share */
  harmonic: 0.15,
  /** swelling along the normal, the material's orbit, the big hole's breathing, the faint ripple, the stream to the left */
  swell: 9,
  orbit: 7,
  breathe: 9,
  ripple: 1.5,
  stream: 12,
  /** 0–1: thin parts resist being pinched */
  thinGuard: 1,
  /** body depth: z = depth·√u of the Poisson inflation, softly capped at depthMax */
  depth: 2,
  depthMax: 140,
  /** the photo look: highlights sliding with the tilt, gloss of faces turning to the viewer, the light wave with the
   *  stream, the rim lookup pulled inside, the smoothing of the photo's fine stripes */
  swim: 0.2,
  gloss: 0.35,
  streamUv: 0.02,
  rimInset: 0.01,
  smooth: 1,
  /** the whole body: the pointer's parallax and its idle sway */
  tilt: 1,
  sway: 0.6,
  /** the pointer over the body: field radius, how fast it follows, pull toward it, a dent (negative rise), the core's repulsion */
  pointerRadius: 30,
  pointerFollow: 7,
  pointerPull: 28,
  pointerRise: -27,
  pointerRepel: 13,
} as const;

export const [VIEW_W, VIEW_H] = FORM_CONTOUR.viewBox;
/** the viewBox point at the world origin */
export const ORIGIN = [VIEW_W / 2, VIEW_H / 2] as const;

const xs = FORM_CONTOUR.outer.map((p) => p[0]);
const ys = FORM_CONTOUR.outer.map((p) => p[1]);
/** the body's half-size, world units (normalises the falloffs) */
export const EXTENT = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2;
/** the body's centre (bounding box), world units: the orbit fields, the tilt and the framing are centred here */
export const BODY_CENTER = [(Math.min(...xs) + Math.max(...xs)) / 2 - ORIGIN[0], ORIGIN[1] - (Math.min(...ys) + Math.max(...ys)) / 2] as const;

/** Area centroid of a ring, world units. */
function centroid(ring: Ring): [number, number] {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % ring.length];
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  a *= 0.5;
  return [cx / (6 * a) - ORIGIN[0], ORIGIN[1] - cy / (6 * a)];
}
/** the big hole's centre (the largest hole): it breathes once per loop */
export const BIG_HOLE = centroid([...FORM_CONTOUR.holes].sort((p, q) => q.length - p.length)[0]);

/** the inflation: cell 3 keeps ~27k vertices (smooth; more would only cost) */
export const SHELL: InflateOptions = { cell: 3, origin: ORIGIN, scale: DROPLET.depth, zMax: DROPLET.depthMax };
