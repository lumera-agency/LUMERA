/*
 * The hero scene's shared, mutable state: GSAP tweens it (the intro, sections/hero/useHeroIntro.ts),
 * both canvases read it every frame. Plain objects on purpose — no React re-render per frame.
 * No three.js here: the page's own bundle imports this (the intro, the boot), three.js comes with the scenes.
 */

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
export const heroLayout = { base: { x: 0, y: 0 }, baseScale: 1, mobile: false, glowX: 0, glowY: 0, width: 1, height: 1 };

/**
 * Where the stone stands in the hero, in px of its box: centre and height. Wide screens: right of the headline;
 * phones: between the header and the headline. The 3D stone and its still picture (lite graphics) both take it.
 */
export function stonePlacement(hero: HTMLElement, width: number, height: number) {
  const W = Math.max(1, width);
  const H = Math.max(1, height);
  const mobile = matchMedia("(max-width: 860px)").matches || W / H < 0.85;
  if (!mobile) return { mobile, cx: W * 0.655, cy: H * 0.54, s: Math.min(H * 0.74, W * 0.46) };
  // places in the layout (offsets), not on screen: a transform (the lift) does not move them
  const top = (el: HTMLElement | null) => {
    let y = 0;
    for (let n: HTMLElement | null = el; n && n !== hero; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    return y;
  };
  const header = hero.querySelector<HTMLElement>(".header");
  const title = hero.querySelector<HTMLElement>("h1");
  const headerBottom = header ? top(header) + header.offsetHeight : 0;
  const bottom = title ? top(title) : H * 0.6;
  return { mobile, cx: W * 0.6, cy: headerBottom + (bottom - headerBottom) * 0.5, s: Math.min(Math.max(bottom - headerBottom, W * 0.55), W * 1.0) };
}

export const FOV = 28;
export const CAMERA_Z = 11;
export const VIS_H = 2 * CAMERA_Z * Math.tan(((FOV / 2) * Math.PI) / 180);
export const STONE_EXTENT = 3.1; // world height of the stone at scale 1
export const REST_TILT = 0.62; // the diagonal pose from the layout
export const SEAM_FACING = Math.atan2(0.45, 1); // the chrome runs down the face at this yaw
export const SWAY = 0.6; // rad, slow product-shot sway around that pose

export const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
