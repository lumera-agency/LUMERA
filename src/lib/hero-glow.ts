/*
 * Where the home hero's glow is, as numbers: its centre in the hero's own box (css px, written by the stone's frame
 * loop as it moves the glow) and how far the sticky hero is held as the page scrolls (lift, written by HeroShell). The page's bridge (PageShell)
 * carries the same light on under the hero from these, instead of measuring both boxes every frame: those reads laid
 * the whole page out again on each frame, 56 times during the preloader's roll on a slow processor (11 Nov 2026).
 * NaN: the glow has not been moved yet, it still sits where the CSS put it.
 * Whoever writes the numbers says so (heroGlowMoved), and the bridge follows then: it ran a frame loop of its own while
 * it was on screen, at rest too, and that loop had the page's thread restyle every CSS animation on every frame (12 Nov
 * 2026: the orbit and the rail's pulse, 60 times a second).
 */
export const heroGlow = { centerX: Number.NaN, centerY: Number.NaN, lift: 0 };

const listeners = new Set<() => void>();

/** follow the glow; returns the way to stop */
export function onHeroGlow(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** the numbers above changed (called by their writers, right after) */
export function heroGlowMoved() {
  for (const listener of listeners) listener();
}
