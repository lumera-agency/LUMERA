/*
 * The hero scene's shared, mutable state: GSAP tweens it (the intro, sections/hero/useHeroIntro.ts),
 * both canvases read it every frame. Plain objects on purpose — no React re-render per frame.
 */
import * as THREE from "three";

export const heroState = {
  stoneReveal: 0, // the stone lit out of darkness
  stoneIntro: 0, // it settles into its pose
  ringProgress: 0, // the orbit draws itself in
  dots: 0, // the silver dust
  shards: 0, // the blurred fragments behind
};
export type HeroState = typeof heroState;

/** The settled composition (reduced motion, or no intro). */
export const settleHero = () => Object.assign(heroState, { stoneReveal: 1, stoneIntro: 1, ringProgress: 1, dots: 1, shards: 1 });

/** Pointer, -1…1 across the window; `x`/`y` trail `tx`/`ty` (damped in the frame loop). */
export const heroPointer = { x: 0, y: 0, tx: 0, ty: 0 };

/** One clock for both canvases, so the stone and the shards move in step. */
export const heroClock = { time: 0 };

/** Where the stone sits (world units), computed from the hero's layout by the stone's canvas. */
export const heroLayout = { base: new THREE.Vector3(), baseScale: 1, mobile: false, glowX: 0, glowY: 0, width: 1, height: 1 };

export const FOV = 28;
export const CAMERA_Z = 11;
export const VIS_H = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
export const STONE_EXTENT = 3.1; // world height of the stone at scale 1
export const REST_TILT = 0.62; // the diagonal pose from the layout
export const SEAM_FACING = Math.atan2(0.45, 1); // the chrome runs down the face at this yaw
export const SWAY = 0.6; // rad, slow product-shot sway around that pose

export const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
