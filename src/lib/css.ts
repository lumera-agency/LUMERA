/*
 * The layout is in rem and the root grows on big screens (styles/base.css), so a length from the CSS
 * is turned into pixels here, and so are the scripts' own offsets ("design px", 16 to the rem).
 */
const root = () => (typeof document === "undefined" ? null : document.documentElement);

let rem = 0;
/**
 * The root font size in px: 16 up to ~1680×1000, more on bigger screens. Read from the styles once and again only after
 * a resize (the one thing that changes it): every dpx() asked for it, and each read had the browser work the page's
 * styles out first, 224 ms of the home page's load on a processor four times slower (11 Nov 2026).
 */
export function remPx() {
  if (rem) return rem;
  const el = root();
  if (!el) return 16;
  rem = parseFloat(getComputedStyle(el).fontSize) || 16;
  return rem;
}
if (typeof window !== "undefined") window.addEventListener("resize", () => void (rem = 0));

/** A design px (the size at 16 px to the rem) on this screen. */
export const dpx = (n: number) => (n * remPx()) / 16;

/** A length custom property on :root, in px (px, rem or a bare number). */
export function lengthVar(name: string, fallback = 0) {
  const el = root();
  const value = el ? getComputedStyle(el).getPropertyValue(name).trim() : "";
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  return value.endsWith("rem") ? n * remPx() : n;
}

/** The topbar's height, px. */
export const topbarHeight = () => lengthVar("--topbar-h", dpx(64));
