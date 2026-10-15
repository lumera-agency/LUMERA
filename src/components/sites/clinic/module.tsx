/*
 * The clinic sample «Петроль» as a module of the sample-site engine (runtime/sites-pv.js, dispatcher sites-pv-v2.js →
 * N.corporate). The engine stays vanilla; this adapter speaks its contract:
 *   meta = { theme, cube, bg }, object3d = true (the sample draws its own 3D object: the shade guide),
 *   build(H, c, data, e, opts) → the site's shell: one .pv-scroll that carries this render's id (its copy, its page);
 *   enhance(site, ctx) → React takes the site element (createRoot) and renders the whole page synchronously (flushSync),
 *     so the tour, which measures .pv-scroll right after render(), finds the real height; ctx.onDispose unmounts it.
 * Why not renderToString + hydrateRoot: enhance() runs inside render() before fx.set()/fx.page() read the layout, so a
 * synchronous client render gives the same guarantee without shipping react-dom/server, and with no hydration step there
 * is nothing to mismatch (the engine rewrites <img> tags in the HTML string on phones).
 * The page change: the engine keeps the old page on top and fades it; here a petrol shutter rises over it showing
 * «02 / Послуги», the old page goes, the shutter leaves upward, and the new page's blocks enter. Links inside the sample
 * click the frame's own tab (the engine's showPage), and the section they aim at is scrolled to once the new page shows
 * (ctx.scrollTo: the visitor's mode).
 */
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { ClinicSite } from "./ClinicSite";
import { COPY, EN, type Lang } from "./copy";
import type { Clock, Env, Target } from "./env";
import { Stage } from "./stage";

export const meta = { theme: "light", cube: "light", bg: "#EFEFEA" };
export const object3d = true;

type TurnSite = HTMLElement & { _clTl?: gsap.core.Timeline };
type FrameCopy = { brand: string; url: string; tabs: { corporate: string[] } };
type EnCopy = { nav?: string[] } | null | undefined;
type Opts = { plus?: boolean; page?: number; lang?: string; three?: boolean };
type Ctx = {
  reducedMotion?: boolean;
  lang?: string;
  page?: number;
  three?: boolean;
  phone?: boolean;
  viewport: HTMLElement;
  onDispose: (fn: () => void) => void;
  scrollTo?: (el: Element) => void;
  readonly user?: boolean;
  onUser?: (fn: () => void) => void;
};

/* each build's copy waits here for its enhance (the same render() call) */
const BUILDS = new Map<string, { c: FrameCopy; e: EnCopy; opts: Opts }>();
let seq = 0;
/* a link to another page: what it asked for there (read by that page's render, within a few seconds) */
let pending: { page: number; t: Target; at: number } | null = null;

const clampPage = (p?: number) => Math.max(0, Math.min(3, Math.round(p || 0)));

export function build(_H: unknown, c: FrameCopy, _data: unknown, e: EnCopy, opts: Opts = {}) {
  const id = `cl${++seq}`;
  BUILDS.set(id, { c, e, opts });
  while (BUILDS.size > 6) BUILDS.delete(BUILDS.keys().next().value as string);
  return `<div class="pv-scroll cl-scroll" data-cl-build="${id}"></div>`;
}

/** the clinic now, Kyiv time: open Пн–Пт 9–20, Сб 10–16; the next five working days (the booking's days) */
function kyivClock(): Clock {
  let wd = new Date().getDay();
  let h = new Date().getHours();
  let base = new Date();
  try {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Kyiv", weekday: "short", hour: "2-digit", hourCycle: "h23", day: "numeric", month: "numeric", year: "numeric" })
        .formatToParts(new Date())
        .map((x) => [x.type, x.value]),
    );
    wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    h = Number(p.hour);
    base = new Date(Number(p.year), Number(p.month) - 1, Number(p.day));
  } catch {
    /* the device's own time */
  }
  const open = (wd >= 1 && wd <= 5 && h >= 9 && h < 20) || (wd === 6 && h >= 10 && h < 16);
  const days: [number, number][] = [];
  const d = new Date(base);
  while (days.length < 5) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) days.push([d.getDay(), d.getDate()]);
  }
  return { wd, open, closeAt: wd === 6 ? "16:00" : "20:00", todayRow: wd === 0 ? 2 : wd === 6 ? 1 : 0, days };
}

export function enhance(site: HTMLElement, ctx: Ctx) {
  const shell = site.querySelector<HTMLElement>("[data-cl-build]");
  const id = shell?.dataset.clBuild || "";
  const built = BUILDS.get(id);
  if (!shell || !built) return;
  BUILDS.delete(id);
  const { c, e } = built;
  const lang: Lang = ctx.lang === "ru" ? "ru" : "uk";
  const page = clampPage(ctx.page ?? built.opts.page);
  const rm = !!ctx.reducedMotion;
  const vp = ctx.viewport;

  // the page before (the engine's crossfade keeps it on top for a moment): a page change, or this page drawn again
  const old = site.parentElement?.querySelector<HTMLElement>(".pv-site--old");
  const oldClinic = old && old.dataset.clPage != null ? old : null;
  const oldPage = oldClinic ? Number(oldClinic.dataset.clPage) : null;
  const turning = oldClinic != null && oldPage !== page && !rm;
  const same = oldClinic != null && oldPage === page;
  const armed = !rm && !same;
  site.dataset.clPage = String(page);
  if (armed) site.classList.add("cl-armed");
  if (rm) site.classList.add("cl-still");

  const intent = pending && pending.page === page && Date.now() - pending.at < 6000 ? pending.t : null;
  pending = null;
  const intentFns = new Set<(t: Target) => void>();
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      if (site.isConnected && !site.classList.contains("pv-site--old")) fn();
    }, ms);
    timers.add(t);
  };
  const scrollToAnchor = (to?: string) => {
    const el = to ? site.querySelector(`[data-anc="${to}"]`) : site.querySelector("[data-sec]");
    if (el && ctx.scrollTo) ctx.scrollTo(el);
  };
  // a link inside the sample (after the click has finished: the engine re-renders the frame synchronously)
  const go = (i: number, t: Target = {}) => {
    later(() => {
      if (i === page) {
        intentFns.forEach((fn) => fn(t));
        scrollToAnchor(t.to);
        return;
      }
      pending = { page: i, t, at: Date.now() };
      site.closest(".pvw")?.querySelector<HTMLElement>(`.pvw__tab[data-page="${i}"]`)?.click();
    }, 0);
  };

  const tabs = c.tabs.corporate;
  const env: Env = {
    lang,
    W: COPY[lang],
    E: e ? { ...EN, nav: e.nav || ["Home", "Services", "About", "Contact"] } : null,
    page,
    tabs,
    brand: c.brand,
    url: c.url,
    phone: !!ctx.phone,
    rm,
    three: !!(ctx.three ?? built.opts.three),
    armed,
    vp,
    clock: kyivClock(),
    oldPage,
    intent,
    go,
    onIntent: (fn) => {
      intentFns.add(fn);
      return () => intentFns.delete(fn);
    },
    user: () => !!ctx.user,
    onUser: (fn) => ctx.onUser?.(fn),
  };

  const stage = new Stage(site, vp, armed, turning);
  const root = createRoot(site);
  flushSync(() => root.render(<ClinicSite env={env} />));
  stage.start();

  // every click inside stays inside (a tap on a touch screen never turns the page by itself)
  const stop = (ev: Event) => ev.stopPropagation();
  site.addEventListener("click", stop);

  let tl: gsap.core.Timeline | null = null;
  ctx.onDispose(() => {
    tl?.kill();
    timers.forEach(clearTimeout);
    timers.clear();
    stage.destroy();
    intentFns.clear();
    site.removeEventListener("click", stop);
    root.unmount();
  });

  // the old page keeps where the tour had moved it (the tour's animation is about to be cancelled)
  const os = oldClinic?.querySelector<HTMLElement>(".pv-scroll");
  if (os) os.style.translate = getComputedStyle(os).translate;

  const arrive = () => {
    if (intent?.to) scrollToAnchor(intent.to);
  };
  if (turning && oldClinic) {
    // ≤ 1.1 s: the shutter rises over the old page carrying this page's number and title (word by word, out of masks),
    // the old page goes, the words leave and the shutter lifts off the new page, whose head (photo curtain, then the title
    // lines) enters under it. Interruptible: a page change during it stops it where it is (below, on the next render).
    const prevTl = (oldClinic as TurnSite)._clTl;
    prevTl?.kill();
    const fades = oldClinic.getAnimations();
    fades.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    site.classList.add("cl-turning");
    const sh = site.querySelector(".cl-shutter");
    const label = site.querySelector(".cl-shutter__t");
    const words = site.querySelectorAll(".cl-sh__w");
    tl = gsap.timeline();
    (site as TurnSite)._clTl = tl;
    // (y: 0: GSAP would otherwise read the CSS translateY(101%) as pixels and add it to yPercent)
    tl.set(label, { opacity: 1 })
      .fromTo(sh, { y: 0, yPercent: 101 }, { yPercent: 0, duration: 0.4, ease: "power3.inOut" }, 0)
      .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 0.42, ease: "expo.out", stagger: 0.05 }, 0.14)
      .add(() => {
        if (fades.length) fades.forEach((a) => a.finish());
        else oldClinic.style.visibility = "hidden";
        site.classList.remove("cl-turning");
      }, 0.42)
      .to(words, { yPercent: -115, duration: 0.24, ease: "power2.in", stagger: 0.03 }, 0.56)
      .to(sh, { yPercent: -101, duration: 0.42, ease: "power3.inOut" }, 0.6)
      .add(() => {
        stage.release();
        arrive();
      }, 0.62)
      .add(() => {
        gsap.set([sh, label, ...words], { clearProps: "all" });
      }, 1.04);
  } else if (intent) {
    requestAnimationFrame(() => {
      if (site.isConnected) arrive();
    });
  }
}
