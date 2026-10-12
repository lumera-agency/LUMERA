/*
 * The layout is in rem and the root grows on big screens (styles/base.css), so a length from the CSS
 * is turned into pixels here, and so are the scripts' own offsets ("design px", 16 to the rem).
 */
const root = () => (typeof document === "undefined" ? null : document.documentElement);

/** The root font size in px: 16 up to ~1680×1000, more on bigger screens. */
export function remPx() {
  const el = root();
  return (el && parseFloat(getComputedStyle(el).fontSize)) || 16;
}

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
