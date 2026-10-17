/*
 * The glass shop sample «Кольорова тінь» as a module of the sample-site engine (runtime/sites-pv.js, dispatcher
 * sites-pv-v2.js → N.ecommerce). The engine stays vanilla; this adapter speaks its contract, as the clinic's does:
 *   meta = { theme, cube, bg }, object3d = true (the sample draws its own 3D object: the glass vase of the first screen),
 *   build(H, c, data, e, opts) → the site's shell: one .pv-scroll that carries this render's id (its copy);
 *   enhance(site, ctx) → React takes the site element (createRoot) and renders the whole page synchronously (flushSync),
 *     so the tour, which measures .pv-scroll right after render(), finds the real height; ctx.onDispose unmounts it.
 * The frame's tabs (Головна · Каталог · Товар · Кошик) lead to their parts (ctx.scrollTo), and the tab of the part in
 * view is lit.
 */
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ShopSite } from "./ShopSite";
import { COPY, EN, type ShopData, type Lang } from "./copy";
import type { Env, Part } from "./env";
import { Stage } from "./stage";

export const meta = { theme: "light", cube: "light", bg: "#FFFFFF" };
export const object3d = true;

type FrameCopy = { brand: string; url: string };
type EnCopy = { nav?: string[]; eyebrow?: string; btn?: string } | null | undefined;
type Opts = { plus?: boolean; page?: number; lang?: string; three?: boolean };
type Ctx = {
  reducedMotion?: boolean;
  lang?: string;
  three?: boolean;
  phone?: boolean;
  viewport: HTMLElement;
  onDispose: (fn: () => void) => void;
  scrollTo?: (el: Element) => void;
  readonly user?: boolean;
  onUser?: (fn: () => void) => void;
};

/* each build's copy waits here for its enhance (the same render() call) */
const BUILDS = new Map<string, { c: FrameCopy; d: ShopData; e: EnCopy; opts: Opts }>();
let seq = 0;
const TAB_PARTS: Part[] = ["top", "catalog", "product", "cart"];

export function build(_H: unknown, c: FrameCopy, d: ShopData, e: EnCopy, opts: Opts = {}) {
  if (!d?.nav || !d.footer) return "";
  const id = `sh${++seq}`;
  BUILDS.set(id, { c, d, e, opts });
  while (BUILDS.size > 6) BUILDS.delete(BUILDS.keys().next().value as string);
  return `<div class="pv-scroll sh-scroll" data-sh-build="${id}"></div>`;
}

export function enhance(site: HTMLElement, ctx: Ctx) {
  const shell = site.querySelector<HTMLElement>("[data-sh-build]");
  const id = shell?.dataset.shBuild || "";
  const built = BUILDS.get(id);
  if (!shell || !built) return;
  BUILDS.delete(id);
  const { c, d, e } = built;
  const lang: Lang = ctx.lang === "ru" ? "ru" : "uk";
  const rm = !!ctx.reducedMotion;
  const vp = ctx.viewport;

  // the shop drawn again over itself (3D or the second language switched): the final frame at once, no entrances
  const old = site.parentElement?.querySelector<HTMLElement>(".pv-site--old");
  const same = !!old && old.dataset.shop != null;
  const armed = !rm && !same;
  site.dataset.shop = "1";
  site.classList.add(lang === "ru" ? "sh-ru" : "sh-uk");
  if (armed) site.classList.add("sh-armed");
  if (rm) site.classList.add("sh-still");

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      if (site.isConnected && !site.classList.contains("pv-site--old")) fn();
    }, ms);
    timers.add(t);
  };
  const go = (to: Part | Element) => {
    const el = typeof to === "string" ? site.querySelector(`[data-part="${to}"]`) : to;
    if (el && ctx.scrollTo) ctx.scrollTo(el);
  };

  const env: Env = {
    lang,
    W: COPY[lang],
    D: d,
    E: e ? { ...EN, nav: e.nav || EN.nav, eyebrow: e.eyebrow || EN.eyebrow, btn: e.btn || EN.btn } : null,
    brand: c.brand,
    url: c.url,
    phone: !!ctx.phone,
    rm,
    three: !!(ctx.three ?? built.opts.three),
    armed,
    vp,
    go,
    user: () => !!ctx.user,
    onUser: (fn) => ctx.onUser?.(fn),
    later,
  };

  const stage = new Stage(site, vp, armed, false);
  const root = createRoot(site);
  flushSync(() => root.render(<ShopSite env={env} />));
  stage.start();

  // every click inside stays inside; so does typing in the search (the calculator's form around the frame would read
  // an «input» event as a change of the configuration and restart the tour)
  const stop = (ev: Event) => ev.stopPropagation();
  const STOP = ["click", "input", "change", "submit"] as const;
  STOP.forEach((t) => site.addEventListener(t, stop));

  // the frame's tabs: a click leads to its part; the part in view lights its tab
  const pvw = site.closest(".pvw");
  const tabsBox = pvw?.querySelector<HTMLElement>(".pvw__tabs");
  const onTab = (ev: Event) => {
    const t = (ev.target as Element | null)?.closest<HTMLElement>(".pvw__tab");
    if (!t || !site.isConnected || site.classList.contains("pv-site--old")) return;
    go(TAB_PARTS[Number(t.dataset.page) || 0]);
  };
  tabsBox?.addEventListener("click", onTab);
  const ratio = new Map<Element, number>();
  const parts = TAB_PARTS.map((p) => site.querySelector(`[data-part="${p}"]`)).filter((x): x is Element => !!x);
  const tio = new IntersectionObserver(
    (es) => {
      for (const x of es) ratio.set(x.target, x.isIntersecting ? x.intersectionRect.height : 0);
      let best = 0;
      let bi = 0;
      parts.forEach((p, i) => {
        const r = ratio.get(p) || 0;
        if (r > best) {
          best = r;
          bi = i;
        }
      });
      if (!best || site.classList.contains("pv-site--old")) return;
      tabsBox?.querySelectorAll<HTMLElement>(".pvw__tab").forEach((t) => t.classList.toggle("is-on", Number(t.dataset.page) === bi));
    },
    { root: vp, threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  parts.forEach((p) => tio.observe(p));

  ctx.onDispose(() => {
    timers.forEach(clearTimeout);
    timers.clear();
    stage.destroy();
    tio.disconnect();
    tabsBox?.removeEventListener("click", onTab);
    STOP.forEach((t) => site.removeEventListener(t, stop));
    root.unmount();
  });
}
