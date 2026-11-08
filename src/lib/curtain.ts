/*
 * The curtain between the site's pages (fx/page-curtain), shared with the parts that start the next page. That page
 * comes up under it (html.is-curtain, set before the first frame by the root layout's EARLY script) and it lifts once
 * the page is ready to play its entrance: the CSS entrances wait under it (base.css), a page that needs longer holds it
 * (the home page until its intro starts: hero/useBoot), the script parts wait for whenCurtainLifts().
 */

/** Set by the page that is left, read once by the next one (the root layout's EARLY script). */
export const CURTAIN_KEY = "eclo:curtain";
export const CURTAIN = "is-curtain";

const curtainDown = () => typeof document !== "undefined" && document.documentElement.classList.contains(CURTAIN);

let resolveLift!: () => void;
const lift = new Promise<void>((resolve) => (resolveLift = resolve));
let holds = 0;
const waiting = new Set<() => void>();

/** Keeps the curtain down until the returned function is called (no curtain: does nothing). */
export function holdCurtain() {
  if (!curtainDown()) return () => {};
  holds++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds--;
    if (holds) return;
    waiting.forEach((done) => done());
    waiting.clear();
  };
}

/** Resolves once nothing holds the curtain. */
export function curtainFree() {
  if (!holds) return Promise.resolve();
  return new Promise<void>((resolve) => waiting.add(resolve));
}

/** The curtain starts to lift: the page's entrance may play. At once when there is none. */
export function whenCurtainLifts() {
  return curtainDown() ? lift : Promise.resolve();
}

/** (PageCurtain, as the lift starts) */
export function curtainLifting() {
  resolveLift();
}
