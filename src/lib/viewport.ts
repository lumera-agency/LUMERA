/*
 * Touch screens: the hero is laid out in viewport units, and some phone browsers (in-app browsers
 * above all) resize the viewport as their bars slide away mid-scroll; the hero would re-flow and the
 * stone would resize under the finger. The viewport is measured once (the large and small heights
 * Safari's units use: --vh, --hero-min) and again only for a new width (a turn). From website-v2. Every page runs it
 * (PageShell): the first screens are sized from it (tokens.css: --screen-l, --screen-s, --screen-under).
 * Safari on iOS 26 and later draws the page on under its floating bar, to the screen's foot, below even the large
 * viewport (iOS 27, measured: small 714, large 754, the page seen to 812 under the status bar). Its strip under the
 * small viewport is taken from the screen's height; the status bar is not known to the page, so the strip is that
 * much longer than needed, the safe side (the next block never shows under the bar).
 */
export function lockViewport() {
  if (!matchMedia("(hover: none) and (pointer: coarse)").matches) return () => {};
  const root = document.documentElement;
  const measure = (unit: string) => {
    const probe = document.createElement("div");
    probe.style.cssText = `position:fixed;left:0;top:0;width:0;height:100${unit};visibility:hidden;pointer-events:none`;
    document.body.append(probe);
    const h = probe.offsetHeight;
    probe.remove();
    return h || window.innerHeight;
  };
  const webkitTouch = CSS.supports("-webkit-touch-callout", "none");
  const lock = () => {
    const large = measure("lvh");
    const small = measure("svh");
    root.style.setProperty("--vh", `${large / 100}px`);
    root.style.setProperty("--hero-min", `${small}px`);
    if (!webkitTouch) return;
    // (an iPhone's screen keeps its upright sizes when turned)
    const upright = matchMedia("(orientation: portrait)").matches;
    const screenHeight = upright ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
    root.style.setProperty("--screen-under", `${Math.max(large - small, screenHeight - small)}px`);
  };
  lock();
  let width = window.innerWidth;
  const onResize = () => {
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    lock();
  };
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}
