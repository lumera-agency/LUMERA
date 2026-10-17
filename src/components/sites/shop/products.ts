/*
 * The glass shop's catalogue (spec round 15, «Кольорова тінь»): six glass colours (the interface's only colour), four
 * types (30 pieces in the catalogue: 10 + 10 + 6 + 4), eight products on show and four colour twins behind «Показати ще».
 * Photos: public/img/sites/photos/shop/ (CREDITS.md there); phones load the 640-px copies in m/. Prices are illustrative.
 */
import type { Lang } from "./copy";

export type Col = "kryshtal" | "dym" | "burshtyn" | "olyva" | "kobalt" | "malyna";
export const COLS: readonly Col[] = ["kryshtal", "dym", "burshtyn", "olyva", "kobalt", "malyna"];
/** the swatch: linear-gradient(155deg, a, b) */
export const SW: Record<Col, readonly [string, string]> = {
  kryshtal: ["#EEF1F0", "#AEB6B3"],
  dym: ["#9AA0A8", "#4B5059"],
  burshtyn: ["#F2A93B", "#A85A0C"],
  olyva: ["#B9C23A", "#5E6614"],
  kobalt: ["#2F6FE0", "#0C2F88"],
  malyna: ["#D63A78", "#7C0E3E"],
};
/** the catalogue's pieces per glass (30 in all; the footer's shelf and the mega panel) */
export const COL_N: Record<Col, number> = { kryshtal: 6, dym: 2, burshtyn: 6, olyva: 5, kobalt: 6, malyna: 5 };

export type Type = "vases" | "goblets" | "pitchers" | "lamps";
export const TYPES: readonly Type[] = ["vases", "goblets", "pitchers", "lamps"];
export const TYPE_N: Record<Type, number> = { vases: 10, goblets: 10, pitchers: 6, lamps: 4 };

export type PhotoKey =
  | "vase-kobalt"
  | "vase-malyna"
  | "lamp-amber"
  | "lamp-amber-p"
  | "lamps-pair"
  | "lamp-dym"
  | "goblets-trio"
  | "goblet-kobalt"
  | "goblet-olyva"
  | "goblet-burshtyn"
  | "goblets-close"
  | "pitcher"
  | "carafe"
  | "tumbler-pink"
  | "goblet-green"
  | "pitchers-colour"
  | "light-caustics";

/** a photo as shown: its file, its focus (object-position), a zoom toward the focus, and whether its white ground
 *  multiplies into the well (the studio shots on white) */
export type Shot = { k: PhotoKey; f?: string; z?: number; mul?: boolean };

const S = (k: PhotoKey, f?: string, mul = false, z?: number): Shot => ({ k, f, mul, z });

export type Product = {
  id: string;
  name: Record<Lang, string>;
  type: Type;
  price: number;
  old?: number;
  isNew?: boolean;
  /** the glasses it comes in (the first is its default) */
  cols: readonly Col[];
  /** the 4:5 photo per glass */
  shots: Partial<Record<Col, Shot>>;
  /** a wide card's photos: its own view, and per glass (a dot's wipe) */
  wide?: { base: Shot; by?: Partial<Record<Col, Shot>> };
  /** the second view a pointer crossfades to (wide cards) */
  alt?: Shot;
  /** the caption's line under the name (else the dots) */
  meta?: Record<Lang, string>;
  /** the product page's extra views after the chosen glass */
  gallery?: readonly Shot[];
  /** the size line and the specs */
  height?: number;
  volume?: string;
  pressed?: boolean;
};

const KOR = "kobalt";
export const PRODUCTS: Record<string, Product> = {
  nabir: {
    id: "nabir",
    name: { uk: "Набір «Корона», 3 келихи", ru: "Набор «Корона», 3 бокала" },
    type: "goblets",
    price: 1590,
    old: 1770,
    cols: ["kobalt", "olyva", "burshtyn"],
    shots: { kobalt: S("goblets-close", "50% 45%", true), olyva: S("goblets-close", "50% 45%", true), burshtyn: S("goblets-close", "50% 45%", true) },
    wide: { base: S("goblets-trio", "50% 55%", true) },
    alt: S("goblets-close", "50% 42%", true),
    meta: { uk: "Кобальт, Олива, Бурштин", ru: "Кобальт, Олива, Янтарь" },
    gallery: [S("goblets-trio", "50% 55%", true), S("goblet-kobalt", "50% 50%", true)],
    height: 15,
    pressed: true,
  },
  hran: {
    id: "hran",
    name: { uk: "Ваза «Грань»", ru: "Ваза «Грань»" },
    type: "vases",
    price: 1290,
    cols: ["kobalt", "malyna"],
    shots: { kobalt: S("vase-kobalt", "50% 72%", true), malyna: S("vase-malyna", "50% 72%", true) },
    height: 24,
  },
  svitanok: {
    id: "svitanok",
    name: { uk: "Склянка «Світанок»", ru: "Стакан «Рассвет»" },
    type: "goblets",
    price: 390,
    isNew: true,
    cols: ["malyna"],
    shots: { malyna: S("tumbler-pink", "50% 50%") },
    meta: { uk: "Малина", ru: "Малина" },
  },
  korona: {
    id: "korona",
    name: { uk: "Келих «Корона»", ru: "Бокал «Корона»" },
    type: "goblets",
    price: 590,
    cols: [KOR, "olyva", "burshtyn"],
    shots: { kobalt: S("goblet-kobalt", "50% 50%", true), olyva: S("goblet-olyva", "50% 50%", true), burshtyn: S("goblet-burshtyn", "50% 50%", true) },
    gallery: [S("goblets-trio", "50% 55%", true), S("goblets-close", "50% 45%", true)],
    height: 15,
    pressed: true,
  },
  romb: {
    id: "romb",
    name: { uk: "Глечик «Ромб»", ru: "Кувшин «Ромб»" },
    type: "pitchers",
    price: 1100,
    cols: ["kryshtal"],
    shots: { kryshtal: S("pitcher", "50% 55%") },
    meta: { uk: "Кришталь · 1,2 л", ru: "Хрусталь · 1,2 л" },
    volume: "1,2 л",
    pressed: true,
  },
  kraplyna: {
    id: "kraplyna",
    name: { uk: "Карафа «Краплина»", ru: "Графин «Капелька»" },
    type: "pitchers",
    price: 890,
    cols: ["kryshtal"],
    shots: { kryshtal: S("carafe", "50% 60%") },
    meta: { uk: "Кришталь", ru: "Хрусталь" },
  },
  liniia: {
    id: "liniia",
    name: { uk: "Келих «Лінія»", ru: "Бокал «Линия»" },
    type: "goblets",
    price: 520,
    cols: ["olyva"],
    shots: { olyva: S("goblet-green", "55% 30%") },
    meta: { uk: "Олива", ru: "Олива" },
  },
  kraplia: {
    id: "kraplia",
    name: { uk: "Лампа «Крапля»", ru: "Лампа «Капля»" },
    type: "lamps",
    price: 2900,
    cols: ["burshtyn", "dym"],
    shots: { burshtyn: S("lamp-amber-p", "50% 55%"), dym: S("lamp-dym", "50% 55%") },
    wide: { base: S("lamps-pair", "50% 60%"), by: { burshtyn: S("lamp-amber", "40% 60%"), dym: S("lamps-pair", "31% 62%", false, 1.55) } },
    alt: S("lamp-amber", "40% 60%"),
    gallery: [S("lamps-pair", "50% 60%")],
  },
};

/** a card in the grid: a product in a glass; the wide ones span six columns (two on a phone); twins come with «Показати ще» */
export type Item = { key: string; pid: string; col: Col | null; wide?: boolean; twin?: boolean };
export const ITEMS: readonly Item[] = [
  { key: "nabir", pid: "nabir", col: null, wide: true },
  { key: "hran", pid: "hran", col: "kobalt" },
  { key: "svitanok", pid: "svitanok", col: "malyna" },
  { key: "korona", pid: "korona", col: "kobalt" },
  { key: "romb", pid: "romb", col: "kryshtal" },
  { key: "kraplyna", pid: "kraplyna", col: "kryshtal" },
  { key: "liniia", pid: "liniia", col: "olyva" },
  { key: "kraplia", pid: "kraplia", col: null, wide: true },
  { key: "hran-m", pid: "hran", col: "malyna", twin: true },
  { key: "korona-o", pid: "korona", col: "olyva", twin: true },
  { key: "korona-b", pid: "korona", col: "burshtyn", twin: true },
  { key: "kraplia-d", pid: "kraplia", col: "dym", twin: true },
];
/** the grid's note sits after the seventh card, «Показати ще» after the eighth (the zigzag's third row) */
export const NOTE_AT = 7;

export const shotOf = (p: Product, c: Col | null): Shot => p.shots[c && p.shots[c] ? c : p.cols[0]] as Shot;
export const firstCol = (p: Product) => p.cols[0];

/** the cart as the Кошик part shows it first: Келих «Корона», Кобальт × 2; Ваза «Грань», Малина × 1 (2 470 ₴) */
export type Line = { pid: string; col: Col; qty: number };
export const CART0: readonly Line[] = [
  { pid: "korona", col: "kobalt", qty: 2 },
  { pid: "hran", col: "malyna", qty: 1 },
];
export const lineKey = (l: { pid: string; col: Col }) => `${l.pid}:${l.col}`;
