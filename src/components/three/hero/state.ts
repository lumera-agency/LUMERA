/*
 * The hero scene's shared, mutable state: GSAP tweens it (the intro, sections/hero/useHeroIntro.ts),
 * both canvases read it every frame. Plain objects on purpose — no React re-render per frame.
 * No three.js here: the intro and the start-up import this file, and they run in LITE too, where three.js is never
 * fetched (lib/perf/mode.ts).
 */

export const heroState = {
  stoneReveal: 1, // the stone's light (lit from the first frame; kept for a dimmed start, should one come back)
  stoneIntro: 0, // it settles into its pose
  ringProgress: 0, // the orbit draws itself in
  dots: 0, // the silver dust
};
export type HeroState = typeof heroState;

/** The settled composition (reduced motion, or no intro). */
export const settleHero = () => Object.assign(heroState, { stoneReveal: 1, stoneIntro: 1, ringProgress: 1, dots: 1 });

/** Pointer, -1…1 across the window; `x`/`y` trail `tx`/`ty` (damped in the frame loop). */
export const heroPointer = { x: 0, y: 0, tx: 0, ty: 0 };

/** One clock for both canvases, so the stone and the shards move in step. */
export const heroClock = { time: 0 };

/**
 * The stone's film (LITE played it until 12 Nov 2026; LITE's still of the stone is now taken from its first frame) is
 * recorded from the live scene over one loop of this many seconds (tools/record-film.mjs in the optimization folder
 * sets the key before the page starts). While it is set every motion of the scene closes on itself within the loop, so the film's last frame runs
 * into its first: each sway at the rate nearest its own that fits the loop a whole number of times, the light's drift
 * and the chrome's flow as a sway of the same pace, the orbit's text a whole number of its lengths. 0, as on the site:
 * the scene's own free rates.
 */
export const FILM_LOOP_KEY = "eclo:film-loop";
/**
 * And how it moves in a short film (set by the same script: tools/record-film.mjs, FILM_SWAY / FILM_BOB): `sway` scales
 * the stone's turn and tip (a loop of a few seconds runs them at a whole turn of the loop, far quicker than the site's
 * 33 s: 0.29 keeps it to about ±10°), `bob` its rise and fall (0 for a film whose page moves the stone and its CSS
 * orbit together: LITE's film, 12 Nov 2026). Not set: as on the site.
 */
export const FILM_MOTION_KEY = "eclo:film-motion";
export const heroLoop = { seconds: 0, sway: 1, bob: 1 };
if (typeof window !== "undefined") {
  try {
    heroLoop.seconds = Number(sessionStorage.getItem(FILM_LOOP_KEY)) || 0;
    const motion = JSON.parse(sessionStorage.getItem(FILM_MOTION_KEY) || "{}") as { sway?: number; bob?: number };
    if (typeof motion.sway === "number") heroLoop.sway = motion.sway;
    if (typeof motion.bob === "number") heroLoop.bob = motion.bob;
  } catch {}
}

/** Where the stone sits (world units), computed from the hero's layout by the stone's canvas. */
export const heroLayout = { base: { x: 0, y: 0 }, baseScale: 1, mobile: false, glowX: 0, glowY: 0, width: 1, height: 1 };

export const FOV = 28;
export const CAMERA_Z = 11;
export const VIS_H = 2 * CAMERA_Z * Math.tan(((FOV / 2) * Math.PI) / 180);
export const STONE_EXTENT = 3.1; // world height of the stone at scale 1
export const REST_TILT = 0.62; // the diagonal pose from the layout
export const SEAM_FACING = Math.atan2(0.45, 1); // the chrome runs down the face at this yaw
export const SWAY = 0.6; // rad, slow product-shot sway around that pose

export const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

/**
 * Where the stone sits in the hero's box and how tall it is, css px: beside the headline on a wide screen, between the
 * header and the headline on a phone. The live scene (HeroScene) and LITE's still (HeroShell) both place it by this,
 * so the picture stands exactly where the stone would.
 */
export function stonePlace(hero: HTMLElement, width: number, height: number) {
  const mobile = matchMedia("(max-width: 860px)").matches || width / height < 0.85;
  if (!mobile) return { mobile, centerX: width * 0.655, centerY: height * 0.54, size: Math.min(height * 0.74, width * 0.46) };
  // places in the layout (offsets), not on screen: a transform (the lift) does not move them
  const offsetTop = (el: HTMLElement | null) => {
    let top = 0;
    for (let node: HTMLElement | null = el; node && node !== hero; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
    return top;
  };
  const header = hero.querySelector<HTMLElement>(".header");
  const title = hero.querySelector<HTMLElement>("h1");
  const headerBottom = header ? offsetTop(header) + header.offsetHeight : 0;
  const titleTop = title ? offsetTop(title) : height * 0.6;
  const room = titleTop - headerBottom;
  return { mobile, centerX: width * 0.6, centerY: headerBottom + room * 0.5, size: Math.min(Math.max(room, width * 0.55), width * 1.0) };
}
