/*
 * «Дизайн і сайти» · the glass shop sample «Кольорова тінь» (Магазин): all its words, Ukrainian and Russian (the page has
 * /dyzain-i-saity and /ru/dyzain-i-saity), and the English twins shown with the calculator's «Друга мова» (the header and
 * the first screen). The client is «Ваш бренд», vash-sait.ua. Prices are the sample's own (illustrative); no ratings, no
 * reviews, no new promises: delivery, returns and payment repeat the main page's shop copy (sites-pv-copy.js, c.shop).
 */
import type { Col, Type } from "./products";

export type Lang = "uk" | "ru";

const uk = {
  ann: "Доставка по Україні за 1–2 дні",
  h1: ["Скло, яке", "ловить світло"],
  sub: "Вази, келихи й лампи з кольорового скла. Доставка по Україні за 1–2 дні.",
  toCat: "До каталогу",
  facts: [
    ["Ручна робота", "Кожну річ шліфують вручну"],
    ["Повернення", "14 днів"],
    ["Оплата", "При отриманні або карткою"],
  ],
  heightCm: (n: number) => `висота ${n} см`,
  heightCap: (n: number) => `Висота ${n} см`,
  added: "Додано",
  search: "Пошук",
  searchPh: "Ваза, келих, глечик…",
  noMatch: "Нічого не знайшли",
  cart: "Кошик",
  menu: "Меню",
  close: "Закрити",
  all: "Усі",
  allGoods: "Усі товари",
  types: { vases: "Вази", goblets: "Келихи", pitchers: "Глечики й карафи", lamps: "Лампи" } as Record<Type, string>,
  tabs: { vases: "Вази", goblets: "Келихи", pitchers: "Глечики", lamps: "Лампи" } as Record<Type, string>,
  cols: { kryshtal: "Кришталь", dym: "Дим", burshtyn: "Бурштин", olyva: "Олива", kobalt: "Кобальт", malyna: "Малина" } as Record<Col, string>,
  coll: {
    k: "Нова колекція",
    h: "Колекція «Світло»",
    p: "Кольорове скло ручної роботи. Кожну річ шліфують вручну, тому відтінок трохи різниться.",
    go: "Дивитися колекцію",
  },
  home: "Головна",
  catalog: "Каталог",
  colour: "Колір",
  sort: ["Спершу популярні", "Спершу дешевші", "Спершу дорожчі"],
  sortBy: "Сортування",
  reset: "Скинути фільтри",
  of: (n: number) => `${n} з 30`,
  filters: "Фільтри",
  empty: "Немає товарів із цими фільтрами",
  more: "Показати ще",
  seen: (n: number) => `Ви переглянули ${n} з 30`,
  allSeen: "Це всі товари прикладу",
  handmade: "Скло ручної роботи",
  isNew: "Новинка",
  quick: "Швидкий перегляд",
  details: "Детальніше",
  qty: "Кількість",
  pdp: {
    acc: ["Опис", "Характеристики", "Доставка"],
    material: "Матеріал",
    pressed: "Пресоване скло",
    glass: "Кольорове скло",
    height: "Висота",
    volume: "Обʼєм",
    stock: ["Наявність", "Є на складі"],
    upsell: "Набір із трьох",
    upsellGo: "Додати набір",
  },
  steps: ["Кошик", "Доставка", "Оплата"],
  delivery: "Доставка",
  post: "У відділення пошти",
  courier: "Курʼєром",
  fields: [
    ["Імʼя", "Ваше імʼя"],
    ["Телефон", "+380"],
    ["Місто", "Київ"],
  ],
  pay: "Оплата",
  payCod: "Оплата при отриманні",
  payCard: "Карткою на сайті",
  goods: "Товари",
  tariff: "за тарифом перевізника",
  total: "Разом",
  order: "Оформити замовлення",
  ordered: "Замовлення прийнято",
  goOn: "Продовжити покупки",
  emptyCart: "Кошик порожній",
  ship: {
    h: "Доставка й оплата",
    rows: ["Доставка по Україні за 1–2 дні", "Пакуємо в мʼяку тару", "Повернення 14 днів", "Оплата при отриманні або карткою на сайті"],
  },
  hint3d: "Потягніть, щоб покрутити",
  foot: { byColour: "Скло за кольором", shop: "Магазин", social: "Соцмережі", up: "Нагору" },
  items: ["товар", "товари", "товарів"],
};

export type Copy = typeof uk;

const ru: Copy = {
  ann: "Доставка по Украине за 1–2 дня",
  h1: ["Стекло, которое", "ловит свет"],
  sub: "Вазы, бокалы и лампы из цветного стекла. Доставка по Украине за 1–2 дня.",
  toCat: "В каталог",
  facts: [
    ["Ручная работа", "Каждую вещь шлифуют вручную"],
    ["Возврат", "14 дней"],
    ["Оплата", "При получении или картой"],
  ],
  heightCm: (n: number) => `высота ${n} см`,
  heightCap: (n: number) => `Высота ${n} см`,
  added: "Добавлено",
  search: "Поиск",
  searchPh: "Ваза, бокал, кувшин…",
  noMatch: "Ничего не нашли",
  cart: "Корзина",
  menu: "Меню",
  close: "Закрыть",
  all: "Все",
  allGoods: "Все товары",
  types: { vases: "Вазы", goblets: "Бокалы", pitchers: "Кувшины и графины", lamps: "Лампы" },
  tabs: { vases: "Вазы", goblets: "Бокалы", pitchers: "Кувшины", lamps: "Лампы" },
  cols: { kryshtal: "Хрусталь", dym: "Дым", burshtyn: "Янтарь", olyva: "Олива", kobalt: "Кобальт", malyna: "Малина" },
  coll: {
    k: "Новая коллекция",
    h: "Коллекция «Свет»",
    p: "Цветное стекло ручной работы. Каждую вещь шлифуют вручную, поэтому оттенок немного отличается.",
    go: "Смотреть коллекцию",
  },
  home: "Главная",
  catalog: "Каталог",
  colour: "Цвет",
  sort: ["Сначала популярные", "Сначала дешевле", "Сначала дороже"],
  sortBy: "Сортировка",
  reset: "Сбросить фильтры",
  of: (n: number) => `${n} из 30`,
  filters: "Фильтры",
  empty: "Нет товаров с этими фильтрами",
  more: "Показать ещё",
  seen: (n: number) => `Вы просмотрели ${n} из 30`,
  allSeen: "Это все товары примера",
  handmade: "Стекло ручной работы",
  isNew: "Новинка",
  quick: "Быстрый просмотр",
  details: "Подробнее",
  qty: "Количество",
  pdp: {
    acc: ["Описание", "Характеристики", "Доставка"],
    material: "Материал",
    pressed: "Прессованное стекло",
    glass: "Цветное стекло",
    height: "Высота",
    volume: "Объём",
    stock: ["Наличие", "Есть на складе"],
    upsell: "Набор из трёх",
    upsellGo: "Добавить набор",
  },
  steps: ["Корзина", "Доставка", "Оплата"],
  delivery: "Доставка",
  post: "В отделение почты",
  courier: "Курьером",
  fields: [
    ["Имя", "Ваше имя"],
    ["Телефон", "+380"],
    ["Город", "Киев"],
  ],
  pay: "Оплата",
  payCod: "Оплата при получении",
  payCard: "Картой на сайте",
  goods: "Товары",
  tariff: "по тарифу перевозчика",
  total: "Итого",
  order: "Оформить заказ",
  ordered: "Заказ принят",
  goOn: "Продолжить покупки",
  emptyCart: "Корзина пуста",
  ship: {
    h: "Доставка и оплата",
    rows: ["Доставка по Украине за 1–2 дня", "Упаковываем в мягкую тару", "Возврат 14 дней", "Оплата при получении или картой на сайте"],
  },
  hint3d: "Потяните, чтобы повернуть",
  foot: { byColour: "Стекло по цвету", shop: "Магазин", social: "Соцсети", up: "Наверх" },
  items: ["товар", "товара", "товаров"],
};

export const COPY: Record<Lang, Copy> = { uk, ru };

/** «Друга мова»: the English twins (the header and the first screen; the bar's links come from the frame's EN copy) */
export const EN = {
  ann: "Delivery across Ukraine in 1–2 days",
  h1: ["Glass that", "catches the light"],
  sub: "Vases, goblets and lamps in coloured glass. Delivery across Ukraine in 1–2 days.",
  toCat: "View catalogue",
  search: "Search",
  cart: "Cart",
  eyebrow: "New collection · handmade glass",
  nav: ["Catalogue", "New in", "Delivery", "Contacts"],
  btn: "Add to cart",
};
export type EnCopy = typeof EN;

/** the page's data from the frame (sites-pv-copy.js, c.shop): the menu, the eyebrow, the button, the perks, the footer */
export type ShopData = {
  nav: string[];
  eyebrow: string;
  btn: string;
  catsTitle: string;
  card: { perks: string[] };
  perks: string[][];
  footer: { addr: string; phone: string; copy: string; links?: string[] };
};

const NB = " ";
/** 1 290 ₴ (no-break spaces between the groups and before the sign) */
export const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB)}${NB}₴`;
/** 3 товари / 3 товара */
export function plural(n: number, forms: string[]) {
  const a = n % 10;
  const b = n % 100;
  const f = a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 1 : 2;
  return `${n}${NB}${forms[f]}`;
}
/** «1–2» never breaks */
export const nb = (s: string) => s.replace(/(\d)–(\d)/g, "$1–⁠$2");
