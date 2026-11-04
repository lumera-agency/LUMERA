import { ScrollTrigger } from "@/lib/gsap";

/*
 * The visitor's reading place, kept across a language switch: the block a third of the way down the screen and how
 * far into it (a pinned block measured by its spacer), so the other language, its lines longer or shorter and the
 * page still settling, comes back to the same words rather than the same pixel.
 */
export type ReadingPlace = { y: number; sel: string; at: number };

/** A language switch is under way (LangSwitch sets it on <html> for a moment): what the visitor has already seen stays
 *  as it is, nothing on screen plays its way in again (ScrollReveals, the chain's glyphs). */
export const SWITCHING = "lang-switch";
export const switching = () => document.documentElement.classList.contains(SWITCHING);

/** The switch renders the root layout anew and React resets <html> to its own props, wiping what the scripts put there
 *  (js, motion, is-ready, the switch itself, the --vh of lib/viewport…): kept as the switch starts (LangSwitch), put
 *  back first thing in the new render (RootKeep), before any block reads it or the page is drawn. What a block keeps
 *  for itself while it is open (the menu, an editor, Lenis) is left to it. */
const OWN = /^(menu-open|cfg-editing|is-loading|lenis(-.+)?)$/;
let kept: { classes: string[]; style: string } | null = null;
export function keepRoot() {
  const root = document.documentElement;
  kept = { classes: [...root.classList].filter((name) => !OWN.test(name)), style: root.getAttribute("style") ?? "" };
}
export function restoreRoot() {
  if (!kept) return;
  const root = document.documentElement;
  root.classList.add(...kept.classes);
  if (kept.style && !root.getAttribute("style")) root.setAttribute("style", kept.style);
  kept = null;
}

const line = () => window.innerHeight / 3;
const box = (block: HTMLElement) => ((block.closest(".pin-spacer") as HTMLElement | null) ?? block).getBoundingClientRect();

export function readingPlace(): ReadingPlace {
  for (const block of document.querySelectorAll<HTMLElement>("section[id], .footer")) {
    const r = box(block);
    if (r.top <= line() && r.bottom > line()) return { y: Math.round(window.scrollY), sel: block.id ? "#" + block.id : ".footer", at: (line() - r.top) / r.height };
  }
  return { y: Math.round(window.scrollY), sel: "", at: 0 };
}

/** Where a kept place is on the page as it is now (a plain number: a pixel). */
export function placeY(place: ReadingPlace | number) {
  if (typeof place === "number") return place;
  const block = place.sel ? document.querySelector<HTMLElement>(place.sel) : null;
  if (!block) return place.y;
  const r = box(block);
  return r.top + window.scrollY + place.at * r.height - line();
}

/** There in one step, and held there every frame (before it is drawn) while the page settles under it, its blocks
 *  started anew and their pins adding their room above, for `ms` or until the visitor scrolls themselves. */
export function holdPlace(place: ReadingPlace, ms = 1800) {
  let moved = false;
  const mine = () => void (moved = true);
  const input = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  input.forEach((type) => window.addEventListener(type, mine, { passive: true, once: true }));
  const go = () => {
    const y = Math.max(0, Math.round(placeY(place)));
    if (!moved && Math.abs(y - window.scrollY) > 2) window.scrollTo({ top: y, behavior: "instant" });
  };
  const until = performance.now() + ms;
  const hold = () => {
    go();
    if (!moved && performance.now() < until) requestAnimationFrame(hold);
    else {
      input.forEach((type) => window.removeEventListener(type, mine));
      ScrollTrigger.removeEventListener("refresh", go);
    }
  };
  // also right after each refresh: a block reverting its media queries can have it put back a scroll from before the
  // switch, and that frame would be drawn before the next hold
  ScrollTrigger.addEventListener("refresh", go);
  go();
  requestAnimationFrame(hold);
}
