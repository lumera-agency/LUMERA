/*
 * The shop's one model (spec §10): a useReducer cart that feeds the header's count, the drawer, the quick view, the
 * product page and the Кошик part; and what the visitor has chosen (the catalogue's filters, the product on its page, the
 * quick view, the drawer). ShopSite holds it; every part reads it from ShopCtx.
 */
import { createContext, useContext, type Dispatch, type RefObject } from "react";
import { lineKey, PRODUCTS, type Col, type Line, type Type } from "./products";

export type CartAction = { t: "add"; pid: string; col: Col; qty?: number } | { t: "qty"; key: string; qty: number } | { t: "rm"; key: string };

export function cartReducer(s: Line[], a: CartAction): Line[] {
  if (a.t === "add") {
    const k = lineKey(a);
    const n = a.qty ?? 1;
    return s.some((l) => lineKey(l) === k) ? s.map((l) => (lineKey(l) === k ? { ...l, qty: Math.min(99, l.qty + n) } : l)) : [...s, { pid: a.pid, col: a.col, qty: n }];
  }
  if (a.t === "qty") return s.map((l) => (lineKey(l) === a.key ? { ...l, qty: Math.max(1, Math.min(99, a.qty)) } : l));
  return s.filter((l) => lineKey(l) !== a.key);
}

export const countOf = (s: readonly Line[]) => s.reduce((n, l) => n + l.qty, 0);
export const sumOf = (s: readonly Line[]) => s.reduce((n, l) => n + PRODUCTS[l.pid].price * l.qty, 0);

export type Sort = 0 | 1 | 2;
export type Filter = { type: Type | "all"; col: Col | null; sort: Sort };
export const FILTER0: Filter = { type: "all", col: null, sort: 0 };

export type Shop = {
  lines: Line[];
  cart: Dispatch<CartAction>;
  filter: Filter;
  /** a filter change: the grid reflows (GSAP Flip) when it is in the frame */
  filterTo: (f: Partial<Filter>) => void;
  more: boolean;
  showMore: () => void;
  /** the product page: which piece in which glass */
  pdp: { pid: string; col: Col };
  showProduct: (pid: string, col?: Col | null, scroll?: boolean) => void;
  setPdpCol: (col: Col) => void;
  /** the quick view: the piece, its glass and the well it morphs from */
  qv: { pid: string; col: Col; from: HTMLElement | null } | null;
  openQV: (pid: string, col: Col, from: HTMLElement | null) => void;
  closeQV: () => void;
  drawer: boolean;
  setDrawer: (v: boolean) => void;
  /** the line just added (the drawer marks it) */
  justAdded: string | null;
  add: (pid: string, col: Col, qty?: number, drawer?: boolean) => void;
  /** the first screen's vase: Кобальт or Малина (the photo or the 3D glass) */
  heroCol: Col;
  setHeroCol: (c: Col) => void;
  /** the phone's sheets */
  sheet: "menu" | "filters" | null;
  setSheet: (s: "menu" | "filters" | null) => void;
  gridRef: RefObject<HTMLDivElement | null>;
};

export const ShopCtx = createContext<Shop | null>(null);
export function useShop(): Shop {
  const s = useContext(ShopCtx);
  if (!s) throw new Error("shop: no ShopCtx");
  return s;
}
