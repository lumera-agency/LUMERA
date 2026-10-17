/* The shop sample's runtime: what the engine gave this render (language, 3D, phone, reduced motion, the frame's viewport,
   the visitor's hands) and the way around the one long page (a part, scrolled to through the frame: ctx.scrollTo). */
import { createContext, useContext, useLayoutEffect, useRef, type RefObject } from "react";
import type { Copy, EnCopy, Lang, ShopData } from "./copy";
import type { InDetail } from "./stage";

/** the page's parts ([data-part]): Головна · Категорії · Колекція · Каталог · Товар · Кошик · Доставка · the footer */
export type Part = "top" | "cats" | "coll" | "catalog" | "product" | "cart" | "ship" | "ftr";

export type Env = {
  lang: Lang;
  W: Copy;
  /** the frame's shop copy (the menu, the eyebrow, the perks, the footer) */
  D: ShopData;
  /** «Друга мова» on: the English twins */
  E: EnCopy | null;
  brand: string;
  url: string;
  phone: boolean;
  rm: boolean;
  three: boolean;
  /** the blocks enter as they come into the frame (off: the final frame at once) */
  armed: boolean;
  vp: HTMLElement;
  /** a part (or an element) to the top of the frame, under the header: the visitor's mode */
  go: (to: Part | Element) => void;
  /** the visitor has taken the sample (the tour's scripted demos stop) */
  user: () => boolean;
  onUser: (fn: () => void) => void;
  /** a timeout that dies with the sample */
  later: (fn: () => void, ms: number) => void;
};

export const EnvCtx = createContext<Env | null>(null);

export function useEnv(): Env {
  const env = useContext(EnvCtx);
  if (!env) throw new Error("shop: no Env");
  return env;
}

export const PH = "/img/sites/photos/shop/";

/** a pointer that hovers (the cards' quick bar, the zoom, the mega panel on hover) */
export const fine = () => typeof matchMedia === "function" && matchMedia("(hover: hover) and (pointer: fine)").matches;
/** the phone composition (the frame is phone-sized: the same query as the CSS) */
export const narrow = () => typeof matchMedia === "function" && matchMedia("(max-width: 700px)").matches;

/** Calls fn once, when the block ([data-sec]) around ref comes into the frame (stage.ts); at once if it already has. */
export function useIn(ref: RefObject<Element | null>, fn: (d: InDetail) => void) {
  const cb = useRef(fn);
  useLayoutEffect(() => {
    cb.current = fn;
  });
  useLayoutEffect(() => {
    const sec = ref.current?.closest("[data-sec]");
    if (!sec) return;
    if (sec.hasAttribute("data-in")) {
      cb.current({ animate: false, delay: 0 });
      return;
    }
    const h = (e: Event) => cb.current((e as CustomEvent<InDetail>).detail);
    sec.addEventListener("sh:in", h, { once: true });
    return () => sec.removeEventListener("sh:in", h);
  }, [ref]);
}
