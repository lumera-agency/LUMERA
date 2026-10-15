/* The clinic sample's runtime: what the engine gave this render (language, page, 3D, phone, reduced motion, the frame's
   viewport, the visitor's hands) and the links inside the sample (a page, and on it a section). */
import { createContext, useContext, useLayoutEffect, useRef, type RefObject } from "react";
import type { Copy, Lang } from "./copy";
import { EN } from "./copy";
import type { InDetail } from "./stage";

/** where a link inside the sample leads on its page: a section ([data-anc]) and a choice to make there */
export type Target = { to?: string; svc?: number; day?: number; time?: number; row?: number };

/** the clinic now (Kyiv time): open or closed, today's row in the week, the next five working days */
export type Clock = { wd: number; open: boolean; closeAt: string; todayRow: number; days: [number, number][] };

export type Env = {
  lang: Lang;
  W: Copy;
  /** «Друга мова» on: the English twins, with the bar's links */
  E: (typeof EN & { nav: string[] }) | null;
  page: number;
  tabs: string[];
  brand: string;
  url: string;
  phone: boolean;
  rm: boolean;
  three: boolean;
  /** the blocks enter as they come into the frame (off: the final frame at once) */
  armed: boolean;
  vp: HTMLElement;
  clock: Clock;
  /** the page shown before this one (the page change), or null */
  oldPage: number | null;
  /** what a link on another page asked this page for */
  intent: Target | null;
  go: (page: number, t?: Target) => void;
  /** a link to this same page: the blocks that hold a choice listen */
  onIntent: (fn: (t: Target) => void) => () => void;
  /** the visitor has taken the sample (the tour's scripted demo stops) */
  user: () => boolean;
  onUser: (fn: () => void) => void;
};

export const EnvCtx = createContext<Env | null>(null);

export function useEnv(): Env {
  const env = useContext(EnvCtx);
  if (!env) throw new Error("clinic: no Env");
  return env;
}

export const two = (n: number) => String(n).padStart(2, "0");
export const PH = "/img/sites/photos/corp/";

/** Calls fn once, when the block ([data-sec]) around ref comes into the frame (stage.ts); at once if it already has. */
export function useIn(ref: RefObject<Element | null>, fn: (d: InDetail) => void) {
  const cb = useRef(fn);
  useLayoutEffect(() => {
    cb.current = fn;
  });
  useLayoutEffect(() => {
    const sec = ref.current?.closest("[data-sec]");
    if (!sec) return;
    if (sec.classList.contains("is-in")) {
      cb.current({ animate: false, delay: 0 });
      return;
    }
    const h = (e: Event) => cb.current((e as CustomEvent<InDetail>).detail);
    sec.addEventListener("cl:in", h, { once: true });
    return () => sec.removeEventListener("cl:in", h);
  }, [ref]);
}
