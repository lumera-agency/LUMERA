/*
 * Touch screens: the hero is laid out in viewport units, and some phone browsers (in-app browsers
 * above all) resize the viewport as their bars slide away mid-scroll; the hero would re-flow and the
 * stone would resize under the finger. The viewport is measured once (the large and small heights
 * Safari's units use: --vh, --hero-min) and again only for a new width (a turn). From website-v2.
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
  const lock = () => {
    root.style.setProperty("--vh", `${measure("lvh") / 100}px`);
    root.style.setProperty("--hero-min", `${measure("svh")}px`);
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
