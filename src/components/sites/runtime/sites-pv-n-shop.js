/* «Дизайн і сайти» (Next): copied from the static page's js/sites-pv-n-shop.js (the working folder); unchanged. */
/* «Дизайн і сайти» (/dyzain-i-saity): round 6, the new Базовий sample of the glass decor shop (Магазин), «Дзеркало».
 * A glass gallery-shop: coloured glass stands on a mirror in front of grey plaster, and the whole site copies that. Every
 * product, headline and price stands on a hairline mirror line and has a soft reflection under it; the colour lives only
 * in the glass. One long page whose parts read as the shop's four pages: Головна (the first screen on the mirror line,
 * colour stories, best sellers, the «Світло» collection, promises), Каталог (type chips, glass swatches, sorting, the
 * grid that reflows), Картка товару (Ваза «Жар»: gallery with a zoom lens, colour, size, quantity, «У кошик», tabs, «З цим
 * купують»), Кошик (steps, lines that recount, delivery, payment, honest totals, «Оформити замовлення»), the footer.
 * The cart is one model for the whole page: every «У кошик» flies the product to the header, rolls the badge, adds the
 * line to the Кошик part and recounts its total. The auto-tour plays two interactions, once each: a quick add on the best
 * sellers and a tap on the «Бурштин» swatch in the catalogue (then «Усі» again). Nothing runs at rest.
 * 3D option (object3d): a ruby glass vase on the first screen's mirror line, in the empty mirror to the right of the
 * photographed vases (three.js r186 core: LatheGeometry with fluted radius, MeshPhysicalMaterial transmission, an
 * environment of emissive softbox planes through PMREMGenerator; a transparent canvas; its reflection is a second draw
 * under the line faded by a CSS mask; the light pool, contact shadow and ruby caustic are CSS layers). It turns 20° once
 * on entry, then rests; a drag turns it; it renders only while visible and only while it moves.
 *
 * Components (the behaviour rebuilt in vanilla JS / CSS / WAAPI inside the cqw miniature):
 *   ReactBits (reactbits.dev, David Haz, MIT + Commons Clause, notice below; ported, not shipped as a set):
 *     EchoText (text-animations/echo-text: the hero headline's ghost copies settle into one, transform/opacity only),
 *     GlareHover (animations/glare-hover: a glint crosses each product photo once on entry and on hover),
 *     ScrollExpand (animations/scroll-expand: the collection's frame grows to full bleed once on entry, not scroll-tied),
 *     SpringCheck (micro/spring-check: the ticks of «Додано» and «Замовлення прийнято»),
 *     SpecularButton (components/specular-button: «У кошик» on the product page, its edge catches the light at the
 *     pointer), Counter (components/counter: the badge and the totals, via js/sites-rb.js rollNumber).
 *   21st.dev (no code taken: rebuilt from the public demos; MIT): Interactive Checkout (@kokonutd, Kokonut UI: the fly
 *     to the cart, the badge, the side drawer), Shop by Category Grid (@ziegfiroyt/ecommerce4, uğur sözen), Product
 *     Listing Card (@shadcnstore/product-card-1, ShadcnStore), Ecommerce Category Page (@mohammadshehadeh/ecommerce-04,
 *     Mohammad Shehadeh: filters, counts, removable state, sorting, the empty state, the phone's filter sheet), Featured
 *     Product Showcase (@ziegfiroyt/ecommerce5, uğur sözen), Thumbnail image viewer (@ibrandify, Waqar H. Syed), Shipping
 *     Info Cards (@ziegfiroyt/ecommerce15, uğur sözen: the «Доставка» tab), Checkout Summary (@astralyxdev), Add to
 *     Cart Button (@bidyut10: the button sinks, then «Додано»), Halftone Wordmark Footer (@kedhareswer, Kedhareswer
 *     Naidu: structure only, no halftone, no pointer springs).
 * Round 7 (15 Oct): the visitor's own hands and more light. Every control leads somewhere through ctx.scrollTo (the
 *   menu, «До каталогу», the cart icon → Кошик, a colour story → Каталог with that glass, «Усі товари», breadcrumbs, the
 *   footer, the phone's menu sheet); any card opens its product page (the vase family in three glasses, the other pieces
 *   with their two views); sorting really sorts; «Показати ще» shows how much was seen; a cart line at 1 folds away;
 *   the steps follow the form. The scripted demos stop at ctx.onUser. New effects, ported (ReactBits, MIT + Commons
 *   Clause, notice below): ClickSpark (shards of light in the glass's colour on «У кошик»,
 *   «+», the order), TiltedCard + GlareHover's moving light (product photos), RubberSegment (the type chips' and the
 *   sizes' ink thumb), GlideSelect (the sort menu), PulseHeart (the hearts), SplitText (headings' words rise from
 *   behind their shelf line), Counter (the product price, the count, the drawer's total), SwipeToast (the toast's
 *   fuse), Stepper (the checkout's line fills step by step), StatusMark (the order button's ring → tick), SpotlightCard
 *   (the cart's summary). Our own: the colour stories lift off the mirror while their reflections drop away; the
 *   gallery's band of light that uncovers the next photo and tints with a new glass; the drawer's light edge and its
 *   lines coming in one by one; the ghost buttons' ink fill from the pointer. Hover/press only, nothing at rest;
 *   reduced motion shows the end state.
 * Round 10 (15 Oct, the owner: no magnetic buttons): every button is one glass button, ReactBits SpecularButton
 *   (components/specular-button, MIT + Commons Clause): a dark or clear glass bar whose rim catches the light where the
 *   pointer is, with GlareHover's band of light sweeping across it once as the pointer comes in (once on entry for the
 *   first screen's and the order's buttons). Used for «До каталогу», «У кошик» (the first screen's chip, the cards' «+»,
 *   the product page, the phone's pinned bar), «Оформити замовлення» (the summary, the drawer, the pinned total) and the
 *   ghost buttons («Показати ще», «Продовжити покупки»). Pressing sinks it; nothing moves at rest.
 *   The header and the footer, redesigned (ideas only: footer.design's shelf-and-columns footers, 21st.dev / ReactBits
 *   shop headers with a mega menu, a search field and a cart preview; no code taken): a mirror-graphite strip of the
 *   shop's promises with the UA/EN switch and the phone; the bar with «Каталог ▾» opening a mega panel (the types with
 *   a photo and a count, the five glasses, one featured piece), a search field, the heart, the bag with a preview of
 *   the cart; the phone's menu sheet gained the glasses. The footer: the five glasses standing on a mirror line with
 *   their reflections (each opens the catalogue in that glass), five columns (the shop, the types, contacts,
 *   socials), a bar with the payment line and «Нагору», the wordmark on its line. Every link goes through ctx.scrollTo.
 * Photos (img/sites/photos/shop/, CREDITS.md): Valentin Ivantsov's series of coloured glass on a mirror against grey plaster,
 * Pexels License (pexels.com/photo/36124521, 40085655, 34252710, 34252709, 39316283, 39881454, 33389717, 33960384,
 * 39650401). Product cards are crops of single vessels from the group shots; the wall and the mirror beside a vessel are
 * extended from the same photo's own tones and grain where the crop needed room.
 * Facts: the store's copy (c.shop) and the product spec pd.md §4 (prices illustrative); product types follow what the
 * photographs show (vases, a bowl, a candle holder, a set; no cubes). New words live below as { uk, ru } pairs.
 *
 * build(H, c, data, e, opts) → the inner HTML of .pv-site (css/sites-pv-n-shop.css, all under .pv-site--n.pv-n-ecommerce)
 * enhance(site, ctx): the interactions, the entrances (once per part, on entering view), the 3D vase.
 *
 * ---------------------------------------------------------------------------------------------------------
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * ## Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**
 *
 * ## No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------------------------------------
 */
import { rollNumber } from './sites-rb.js';

export const meta = { theme: 'light', cube: 'light', bg: '#d9d6d2' };
export const object3d = true;

// (lead, 15 Oct) phones get the 640-px copies in m/: a phone frame never shows a photo wider than that, and the
// full-size ones decoded together outgrow a phone browser's memory
const IMG = typeof matchMedia === 'function' && matchMedia('(max-width: 700px)').matches ? '/img/sites/photos/shop/m/' : '/img/sites/photos/shop/';
const NB = ' ';
const money = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB)}${NB}₴`;
const plural = (n, lang) => {
  const a = n % 10, b = n % 100;
  const f = a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 1 : 2;
  return `${n}${NB}${(lang === 'ru' ? ['товар', 'товара', 'товаров'] : ['товар', 'товари', 'товарів'])[f]}`;
};

/* ---------- the words this sample adds (UA / RU); EN for the hero under «Друга мова» (pd.md §4) ---------- */
const TX = {
  h1: { uk: 'Скло, яке', ru: 'Стекло, которое' },
  em: { uk: 'ловить світло', ru: 'ловит свет' },
  sub: { uk: 'Вази, чаші й свічники з кольорового скла. Доставка по Україні за 1–2 дні.', ru: 'Вазы, чаши и подсвечники из цветного стекла. Доставка по Украине за 1–2 дня.' },
  toCat: { uk: 'До каталогу', ru: 'В каталог' },
  toast: { uk: 'Додано в кошик', ru: 'Добавлено в корзину' },
  band: { uk: 'Колекція «Світло»', ru: 'Коллекция «Свет»' },
  bandK: { uk: 'Нова колекція', ru: 'Новая коллекция' },
  bandGo: { uk: 'Дивитися колекцію', ru: 'Смотреть коллекцию' },
  perk0: { uk: 'Кожну річ шліфують вручну', ru: 'Каждую вещь шлифуют вручную' },
  home: { uk: 'Головна', ru: 'Главная' },
  cat: { uk: 'Каталог', ru: 'Каталог' },
  colour: { uk: 'Колір', ru: 'Цвет' },
  sort: { uk: 'Спершу популярні', ru: 'Сначала популярные' },
  filters: { uk: 'Фільтри', ru: 'Фильтры' },
  more: { uk: 'Показати ще', ru: 'Показать ещё' },
  reset: { uk: 'Скинути фільтри', ru: 'Сбросить фильтры' },
  isNew: { uk: 'Новинка', ru: 'Новинка' },
  height: { uk: 'Висота', ru: 'Высота' },
  diam: { uk: 'Діаметр', ru: 'Диаметр' },
  pcs: { uk: '3 предмети', ru: '3 предмета' },
  cm: { uk: 'см', ru: 'см' },
  vases: { uk: 'Вази', ru: 'Вазы' },
  reviews: { uk: 'Відгуки клієнтів', ru: 'Отзывы клиентов' },
  size: { uk: 'Розмір', ru: 'Размер' },
  qty: { uk: 'Кількість', ru: 'Количество' },
  tabs: { uk: ['Опис', 'Характеристики', 'Доставка'], ru: ['Описание', 'Характеристики', 'Доставка'] },
  about: { uk: 'Кольорове скло ручної роботи. Кожну вазу шліфують вручну, тому відтінок трохи різниться.', ru: 'Цветное стекло ручной работы. Каждую вазу шлифуют вручную, поэтому оттенок немного отличается.' },
  spec: { uk: [['Матеріал', 'Кольорове скло'], ['Висота', '24 см'], ['Наявність', 'Є на складі']], ru: [['Материал', 'Цветное стекло'], ['Высота', '24 см'], ['Наличие', 'Есть на складе']] },
  withIt: { uk: 'З цим купують', ru: 'С этим покупают' },
  cart: { uk: 'Кошик', ru: 'Корзина' },
  steps: { uk: ['Кошик', 'Доставка', 'Оплата'], ru: ['Корзина', 'Доставка', 'Оплата'] },
  delivery: { uk: 'Доставка', ru: 'Доставка' },
  post: { uk: 'У відділення пошти', ru: 'В отделение почты' },
  courier: { uk: 'Курʼєром', ru: 'Курьером' },
  fields: { uk: [['Імʼя', 'Ваше імʼя'], ['Телефон', '+380'], ['Місто', 'Київ']], ru: [['Имя', 'Ваше имя'], ['Телефон', '+380'], ['Город', 'Киев']] },
  pay: { uk: 'Оплата', ru: 'Оплата' },
  payCod: { uk: 'Оплата при отриманні', ru: 'Оплата при получении' },
  payCard: { uk: 'Карткою на сайті', ru: 'Картой на сайте' },
  goods: { uk: 'Товари', ru: 'Товары' },
  tariff: { uk: 'за тарифом перевізника', ru: 'по тарифу перевозчика' },
  total: { uk: 'Разом', ru: 'Итого' },
  order: { uk: 'Оформити замовлення', ru: 'Оформить заказ' },
  ordered: { uk: 'Замовлення прийнято', ru: 'Заказ принят' },
  added: { uk: 'Додано', ru: 'Добавлено' },
  goOn: { uk: 'Продовжити покупки', ru: 'Продолжить покупки' },
  moreN: { uk: (n) => `і ще ${n}`, ru: (n) => `и ещё ${n}` },
  sizeOf: { uk: 'Розмір', ru: 'Размер' },
  ftrNote: { uk: 'Скло ручної роботи', ru: 'Стекло ручной работы' },
  sortOpts: { uk: ['Спершу популярні', 'Спершу дешевші', 'Спершу дорожчі'], ru: ['Сначала популярные', 'Сначала дешевле', 'Сначала дороже'] },
  seen: { uk: (n) => `Ви переглянули ${n} з 30`, ru: (n) => `Вы просмотрели ${n} из 30` },
  allSeen: { uk: 'Це всі товари прикладу', ru: 'Это все товары примера' },
  aboutAny: { uk: 'Кольорове скло ручної роботи. Кожну річ шліфують вручну, тому відтінок трохи різниться.', ru: 'Цветное стекло ручной работы. Каждую вещь шлифуют вручную, поэтому оттенок немного отличается.' },
  set: { uk: 'Комплект', ru: 'Комплект' },
  emptyCart: { uk: 'Кошик порожній', ru: 'Корзина пуста' },
  searchPh: { uk: 'Ваза, чаша, свічник…', ru: 'Ваза, чаша, подсвечник…' },
  byColour: { uk: 'Скло за кольором', ru: 'Стекло по цвету' },
  shopH: { uk: 'Магазин', ru: 'Магазин' },
  socialH: { uk: 'Соцмережі', ru: 'Соцсети' },
  up: { uk: 'Нагору', ru: 'Наверх' },
};
const EN = { h1: 'Glass that', em: 'catches the light', sub: 'Vases, bowls and candle holders in coloured glass. Delivery across Ukraine in 1–2 days.', toCat: 'View catalogue' };

/* the five glass colours (pd.md: Кришталь · Бурштин · Жар · Дим · Шавлія): the swatches' two tones and the catalogue's counts */
const COL = {
  kryshtal: { uk: 'Кришталь', ru: 'Хрусталь', a: '#f1f3f1', b: '#a5afac', n: 5 },
  burshtyn: { uk: 'Бурштин', ru: 'Янтарь', a: '#ecaa5c', b: '#a3540e', n: 7 },
  zhar: { uk: 'Жар', ru: 'Жар', a: '#e0434a', b: '#8a0c13', n: 8 },
  dym: { uk: 'Дим', ru: 'Дым', a: '#94826a', b: '#4b3f2c', n: 4 },
  shavliia: { uk: 'Шавлія', ru: 'Шалфей', a: '#86b8a4', b: '#2c6a5f', n: 6 },
};
const COLS = ['kryshtal', 'burshtyn', 'zhar', 'dym', 'shavliia'];
// the types (the catalogue's 30 = 14 + 6 + 6 + 4)
const TYPES = [['all', { uk: 'Усі', ru: 'Все' }, 30], ['vases', { uk: 'Вази', ru: 'Вазы' }, 14], ['bowls', { uk: 'Чаші', ru: 'Чаши' }, 6], ['candles', { uk: 'Свічники', ru: 'Подсвечники' }, 6], ['sets', { uk: 'Набори', ru: 'Наборы' }, 4]];
// the eight products (pd.md's prices; the names follow the photographed pieces)
const P = [
  { id: 'zhar', img: 'p-zhar', alt: 'b-zhar', type: 'vases', col: 'zhar', price: 1290, h: 24, n: { uk: 'Ваза «Жар»', ru: 'Ваза «Жар»' } },
  { id: 'burshtyn', img: 'p-burshtyn', alt: 'b-burshtyn', type: 'vases', col: 'burshtyn', price: 1290, old: 1590, h: 24, n: { uk: 'Ваза «Бурштин»', ru: 'Ваза «Янтарь»' } },
  { id: 'shavliia', img: 'p-shavliia', alt: 'd-shavliia', type: 'vases', col: 'shavliia', price: 890, h: 30, isNew: true, n: { uk: 'Ваза «Шавлія»', ru: 'Ваза «Шалфей»' } },
  { id: 'svichnyk', img: 'p-svichnyk', alt: 'd-svichnyk', type: 'candles', col: 'burshtyn', price: 890, h: 16, n: { uk: 'Свічник «Бурштин»', ru: 'Подсвечник «Янтарь»' } },
  { id: 'dym', img: 'p-dym', alt: 'b-dym', type: 'vases', col: 'dym', price: 1100, h: 24, n: { uk: 'Ваза «Дим»', ru: 'Ваза «Дым»' } },
  { id: 'chasha', img: 'p-chasha', alt: 'd-chasha', type: 'bowls', col: 'shavliia', price: 1100, d: 22, n: { uk: 'Чаша «Шавлія»', ru: 'Чаша «Шалфей»' } },
  { id: 'kolba', img: 'p-kolba', alt: 'd-kolba', type: 'vases', col: 'zhar', price: 890, h: 32, n: { uk: 'Ваза-колба «Жар»', ru: 'Ваза-колба «Жар»' } },
  { id: 'nabir', img: 'p-nabir', alt: 'd-nabir', type: 'sets', col: 'kryshtal', price: 2450, set: true, n: { uk: 'Набір із трьох флаконів', ru: 'Набор из трёх флаконов' } },
];
const PI = Object.fromEntries(P.map((p, i) => [p.id, i]));
// the menu (Каталог · Новинки · Доставка · Контакти) → the part of the page each item leads to
const NAVGO = ['catalog', 'hits', 'ship', 'ftr'];
// the product page's vase in its three colours (the same piece as the first screen's three vases)
const PDP = ['zhar', 'burshtyn', 'dym'];
// the colour stories (Категорії)
const CATS = [['zhar', 'c-zhar'], ['burshtyn', 'c-burshtyn'], ['shavliia', 'c-shavliia'], ['kryshtal', 'c-kryshtal']];
// the cart as the Кошик part shows it first: Ваза «Жар», M × 1; Ваза «Дим» × 2 = 3 490 ₴ (pd.md)
const CART0 = [{ id: 'zhar', size: 'M', qty: 1 }, { id: 'dym', size: '', qty: 2 }];

const CHECK = '<svg class="dz-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5.5 12.5 4.2 4.2 8.8-9.4"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>';
const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';
const SLIDERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';

export function build(H, c, d, e, opts = {}) {
  if (!d?.nav || !d.perks || !d.card || !d.footer) return '';
  const { esc, ICO, lx, stars } = H;
  const lang = opts.lang === 'ru' ? 'ru' : 'uk';
  const t = (k) => TX[k][lang];
  const nm = (p) => p.n[lang];
  const nb = (s) => String(s).replace(/(\d)–(\d)/g, '$1–⁠$2');
  const metaOf = (p) => (p.h ? `${t('height')} ${p.h}${NB}${t('cm')}` : p.d ? `${t('diam')} ${p.d}${NB}${t('cm')}` : t('pcs'));
  const img = (name, cls = '', eager = false) => `<img class="${cls}" ${eager ? 'src' : 'data-src'}="${IMG}${name}.jpg" alt="" decoding="async" draggable="false">`;
  const sw = (k, on = false, attr = 'data-col') => `<span class="dz-sw${on ? ' is-on' : ''}" ${attr}="${k}" style="--a:${COL[k].a};--b:${COL[k].b}" title="${esc(COL[k][lang])}"><i></i></span>`;
  const price = (p) => `<span class="dz-price"><b${p.old ? ' class="is-sale"' : ''}>${money(p.price)}</b>${p.old ? `<s>${money(p.old)}</s>` : ''}</span>`;
  // a product card (Product Listing Card): the photo (its own mirror inside), the glint, the quick add; the italic name
  // rises from behind the card's shelf line
  const card = (p, k = '', i = 0) => `<div class="dz-card${k}" data-p="${p.id}" data-type="${p.type}" data-col="${p.col}" data-i="${i}">
      <div class="dz-card__img">${img(p.img, 'dz-card__a')}${img(p.alt, 'dz-card__b')}<i class="dz-card__lite" aria-hidden="true"></i><i class="dz-glint" aria-hidden="true"></i>${p.isNew ? `<span class="dz-badge">${esc(t('isNew'))}</span>` : ''}<span class="dz-add" data-add title="${esc(d.btn)}">${ICO.plus}</span></div>
      <div class="dz-card__t"><span class="dz-card__n"><span>${esc(nm(p))}</span></span><span class="dz-card__m">${esc(metaOf(p))}</span>${price(p)}</div>
    </div>`;
  // a heading's words rise from behind its shelf line (SplitText's mechanics: each word in its own mask)
  const words = (h) => String(h).split(/\s+/).filter(Boolean).map((w) => `<span class="dz-w"><span>${esc(w)}</span></span>`).join(' ');
  const head = (h2, right = '') => `<div class="dz-head"><h2 class="dz-h2">${words(h2)}</h2>${right}</div>`;
  // breadcrumbs: [label, data attributes] (the last one is the page itself)
  const crumbs = (list) => `<span class="dz-crumbs">${list.map(([x, at = ''], i) => `<span${i === list.length - 1 ? ' class="is-on"' : ` class="dz-crumb" ${at}`}>${esc(x)}</span>`).join('<i>/</i>')}</span>`;
  const reflOf = (html, cls) => `<span class="${cls} dz-refl" aria-hidden="true">${html}</span>`;

  /* ---------- the header: the mark (a vase standing on its own line), the menu, search, heart, the cart ---------- */
  const lang2 = e ? '<span class="pv-lang" aria-hidden="true"><b class="pv-lang__a">UA</b><b class="pv-lang__b">EN</b></span>' : '';
  const shipLine = String(t('sub')).split(/\.\s+/)[1]?.replace(/\.$/, '') || d.card.perks[0];
  const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19.5v-15M6 10.5l6-6 6 6"/></svg>';
  const typeImg = { vases: 'p-zhar', bowls: 'p-chasha', candles: 'p-svichnyk', sets: 'p-nabir' };
  const fp = P[PI.burshtyn];
  const mega = `<div class="dz-mega" aria-hidden="true">
      <div class="dz-mega__col"><span class="dz-mega__h">${esc(d.catsTitle)}</span>${TYPES.slice(1).map(([k, n, cnt]) => `<span class="dz-mega__t" data-go="catalog" data-ftype="${k}"><span class="dz-mega__img">${img(typeImg[k])}</span><b>${esc(n[lang])}</b><small>${esc(plural(cnt, lang))}</small></span>`).join('')}</div>
      <div class="dz-mega__col"><span class="dz-mega__h">${esc(t('colour'))}</span>${COLS.map((k) => `<span class="dz-mega__c" data-go="catalog" data-fcol="${k}"><i class="dz-dot" style="--a:${COL[k].a};--b:${COL[k].b}"></i><b>${esc(COL[k][lang])}</b><small>${esc(plural(COL[k].n, lang))}</small></span>`).join('')}</div>
      <div class="dz-mega__feat" data-open="${fp.id}"><span class="dz-mega__fimg">${img(fp.img)}</span><span class="dz-mega__ft"><span class="dz-kicker">${esc(t('bandK'))}</span><b>${esc(nm(fp))}</b>${price(fp)}</span></div>
    </div>`;
  const header = `<header class="pv-hdr dz-hdr">
      <div class="dz-strip"><span class="dz-strip__l"><span>${ICO.truck}${esc(nb(shipLine))}</span><i></i><span>${ICO.card}${esc(d.perks[2][0])}</span><i></i><span>${ICO.check}${esc(nb(d.card.perks[1]))}</span></span><span class="dz-strip__r">${lang2}<span>${ICO.phone}${esc(d.footer.phone)}</span></span></div>
      <div class="dz-bar">
        <span class="dz-logo" data-go="top"><i class="dz-logo__m" aria-hidden="true"></i><span>${esc(c.brand)}</span></span>
        <nav class="dz-nav">${d.nav.map((x, i) => `<span data-go="${NAVGO[i] || 'top'}"${i ? '' : ' class="is-on" data-mega'}>${lx(x, e?.nav?.[i])}${i ? '' : CHEV}</span>`).join('')}</nav>
        <span class="dz-search" data-go="catalog">${ICO.search}<span>${esc(t('searchPh'))}</span></span>
        <span class="dz-toast" data-go="cart" aria-hidden="true">${CHECK}<span>${esc(t('toast'))}</span><i class="dz-toast__fuse"></i></span>
        <div class="dz-hdr__r"><span class="dz-ico dz-ico--find" data-search data-go="catalog">${ICO.search}</span><span class="dz-ico dz-ico--fav dz-heart" data-fav>${ICO.heart}</span><span class="dz-cartw"><span class="dz-cartbtn" data-cartbtn data-go="cart">${ICO.bag}<b class="dz-cartbtn__n" data-badge>3</b></span><span class="dz-cartpv" aria-hidden="true"></span></span><span class="dz-burger" data-menu aria-hidden="true"><i></i><i></i></span></div>
      </div>
      ${mega}
    </header>`;

  /* ---------- Головна · 1 · the first screen: the headline stands on the mirror line, its reflection under it ---------- */
  const enH = e ? EN : null;
  const h1Inner = enH
    ? `<span class="pv-lx pv-lx--blk"><span class="pv-lx__a">${esc(t('h1'))} <em>${esc(t('em'))}</em></span><span class="pv-lx__b" lang="en">${esc(enH.h1)} <em>${esc(enH.em)}</em></span></span>`
    : `${esc(t('h1'))} <em>${esc(t('em'))}</em>`;
  const hp = P[PI.burshtyn];
  const obj = opts.three ? `<div class="dz-obj" data-obj><i class="dz-obj__pool" aria-hidden="true"></i><i class="dz-obj__caustic" aria-hidden="true"></i><i class="dz-obj__shadow" aria-hidden="true"></i><canvas class="dz-obj__gl" aria-hidden="true"></canvas></div>` : '';
  const hero = `<section class="dz-hero${lang === 'ru' || e ? ' dz-hero--long' : ''}" data-sc="hero">
      <div class="dz-hero__pic">${img('hero', 'dz-hero__d', true)}${img('hero-m', 'dz-hero__m', true)}<i class="dz-hero__line" aria-hidden="true"></i>${obj}</div>
      <div class="dz-hero__top">
        <span class="dz-eyebrow">${lx(d.eyebrow, e?.eyebrow)}</span>
        <h1 class="dz-h1"><span class="dz-h1__echo" aria-hidden="true">${h1Inner}</span><span class="dz-h1__echo" aria-hidden="true">${h1Inner}</span><span class="dz-h1__t">${h1Inner}</span></h1>
        ${reflOf(h1Inner, 'dz-h1 dz-h1--refl')}
      </div>
      <div class="dz-hero__low">
        <p class="dz-sub">${lx(nb(t('sub')), enH ? nb(enH.sub) : null)}</p>
        <div class="dz-hero__row">
          <span class="dz-btn" data-go="catalog"><span class="dz-btn__l">${lx(t('toCat'), enH?.toCat)}${ICO.right}</span></span>
          <span class="dz-chip" data-p="${hp.id}" data-open="${hp.id}">${img(hp.img, 'dz-chip__img', true)}<span class="dz-chip__t"><span class="dz-chip__n">${esc(nm(hp))}</span>${price(hp)}</span><span class="dz-chip__go" data-add>${ICO.bag}<span>${lx(d.btn, e?.btn)}</span></span></span>
        </div>
      </div>
    </section>`;

  /* 2 · colour stories (Shop by Category Grid): four tiles on one shelf line, each with its reflection */
  const cats = `<section class="dz-sec dz-cats" data-sc="cats">
      ${head(d.catsTitle)}
      <div class="dz-cats__row">${CATS.map(([k, im]) => `<div class="dz-cat" data-col="${k}">
          <div class="dz-cat__img">${img(im)}</div>
          <i class="dz-cat__refl" aria-hidden="true">${img(im)}</i>
          <span class="dz-cat__t"><i class="dz-dot" style="--a:${COL[k].a};--b:${COL[k].b}"></i><b>${esc(COL[k][lang])}</b><span>${esc(plural(COL[k].n, lang))}</span></span>
        </div>`).join('')}</div>
    </section>`;

  /* 3 · best sellers: four cards; the tour adds one, once */
  const link = (s) => `<span class="dz-link">${esc(String(s).replace(/\s*[→>]+\s*$/, ''))}${ICO.right}</span>`;
  const hits = `<section class="dz-sec dz-hits" data-sc="hits">
      ${head(d.gridTitle, link(d.gridLink).replace('class="dz-link"', 'class="dz-link" data-go="catalog" data-fclear'))}
      <div class="dz-rail">${['zhar', 'burshtyn', 'shavliia', 'svichnyk'].map((id) => card(P[PI[id]])).join('')}</div>
    </section>`;

  /* 4 · the collection (ScrollExpand): the frame grows to full bleed once; one line of copy on the linen */
  const band = `<section class="dz-band" data-sc="band">
      <div class="dz-band__frame">${img('band', 'dz-band__d')}${img('band-m', 'dz-band__m')}
        <div class="dz-band__t"><span class="dz-kicker">${esc(t('bandK'))}</span><h2 class="dz-h2 dz-band__h">${words(t('band'))}</h2><span class="dz-link dz-link--ink" data-go="catalog" data-fcol="shavliia">${esc(t('bandGo'))}${ICO.right}</span></div>
      </div>
    </section>`;

  /* 5 · the promises: three quiet columns on one line */
  const perks = [[d.perks[0][0], t('perk0')], ...d.perks.slice(1)];
  const promise = `<section class="dz-sec dz-perks" data-sc="perks">${perks.map(([a, b], i) => `<div class="dz-perk"><span class="dz-perk__i">${[ICO.hand, ICO.truck, ICO.card][i] || ICO.check}</span><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</section>`;

  /* ---------- Каталог: the page head, the filters, the grid ---------- */
  const catalog = `<section class="dz-page dz-catalog" data-sc="catalog">
      <div class="dz-pagehead">${crumbs([[t('home'), 'data-go="top"'], [t('cat')]])}<div class="dz-pagehead__row"><h2 class="dz-h1s">${words(t('cat'))}</h2><span class="dz-count"><span class="dz-reset" data-reset hidden>${esc(t('reset'))}</span><span data-count>${esc(plural(30, lang))}</span></span></div></div>
      <div class="dz-filters" data-filters>
        <div class="dz-chips" data-rubber><i class="dz-thumbp" aria-hidden="true"></i>${TYPES.map(([k, n], i) => `<span class="dz-fchip${i ? '' : ' is-on'}" data-type="${k}">${esc(n[lang])}</span>`).join('')}</div>
        <div class="dz-filters__r">
          <span class="dz-swatches"><span class="dz-swatches__l">${esc(t('colour'))}</span>${COLS.map((k) => sw(k)).join('')}</span>
          <span class="dz-sortw"><span class="dz-sort" data-sortbtn><span data-sortl>${esc(t('sortOpts')[0])}</span>${CHEV}</span>
            <span class="dz-sortm" aria-hidden="true"><i class="dz-sortm__hl"></i>${t('sortOpts').map((o, i) => `<span class="dz-sortm__o${i ? '' : ' is-on'}" data-sort="${i}">${esc(o)}</span>`).join('')}</span></span>
          <span class="dz-fbtn" data-sheet>${SLIDERS}${esc(t('filters'))}<b data-fnum></b></span>
        </div>
      </div>
      <div class="dz-grid" data-grid>${P.map((p, i) => card(p, '', i)).join('')}</div>
      <div class="dz-morebar"><span class="dz-progress"><span data-seen>${esc(TX.seen[lang](8))}</span><i><b data-seenbar></b></i></span><span class="dz-btn dz-btn--ghost" data-more><span class="dz-btn__l" data-morel>${esc(t('more'))}</span><span class="dz-dots3" aria-hidden="true"><i></i><i></i><i></i></span></span></div>
    </section>`;

  /* ---------- Картка товару: Ваза «Жар» ---------- */
  const pp = P[PI.zhar];
  const views = (k) => [`v-${k}`, `r-${k}`, `b-${k}`, 'v-trio'];
  const spec = t('spec');
  const pdp = `<section class="dz-page dz-pdp" data-sc="pdp" data-pc="zhar">
      <div class="dz-pagehead dz-pagehead--slim">${crumbs([[t('cat'), 'data-go="catalog" data-fclear'], [t('vases'), 'data-go="catalog" data-ftype="vases" data-pt'], [nm(pp)]])}</div>
      <div class="dz-pdp__grid">
        <div class="dz-gal">
          <div class="dz-thumbs">${views('zhar').map((v, i) => `<span class="dz-thumb${i ? '' : ' is-on'}" data-view="${i}">${img(v)}</span>`).join('')}</div>
          <div class="dz-stage" data-stage>
            <div class="dz-stage__track">${views('zhar').map((v, i) => `<span class="dz-view${i ? '' : ' is-on'}" data-v="${i}">${img(v)}</span>`).join('')}</div>
            <i class="dz-tintflash" aria-hidden="true"></i><i class="dz-sweep" aria-hidden="true"></i><i class="dz-lens" aria-hidden="true"></i>
            <span class="dz-dots">${views('zhar').map((_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</span>
          </div>
        </div>
        <div class="dz-buy">
          <h2 class="dz-pdp__n" data-pn>${esc(nm(pp))}</h2>
          <span class="dz-pdp__m" data-pm>${esc(metaOf(pp))}</span>
          <div class="dz-pdp__pr"><span class="dz-price dz-price--l" data-pp><b>${money(pp.price)}</b><s hidden>${money(1590)}</s></span><span class="dz-rate">${stars()}<span>${esc(t('reviews'))}</span></span></div>
          <div class="dz-opt"><span class="dz-opt__l">${esc(t('colour'))} <b data-pcn>${esc(COL.zhar[lang])}</b></span><span class="dz-opt__r" data-pcols>${PDP.map((k, i) => sw(k, !i, 'data-pcol')).join('')}</span></div>
          <div class="dz-opt"><span class="dz-opt__l">${esc(t('size'))}</span><span class="dz-seg" data-rubber><i class="dz-thumbp" aria-hidden="true"></i>${['S', 'M', 'L'].map((s) => `<i${s === 'M' ? ' class="is-on"' : ''} data-size="${s}">${s}</i>`).join('')}</span></div>
          <div class="dz-opt dz-opt--buy">
            <span class="dz-step" data-qtybox><span data-q="-1">${MINUS}</span><b data-qty>1</b><span data-q="1">${PLUS}</span></span>
            <span class="dz-spec" data-addpdp><i class="dz-spec__sheen" aria-hidden="true"></i><span class="dz-spec__face">${ICO.bag}<span class="dz-spec__a">${esc(d.btn)}</span><span class="dz-spec__b">${CHECK}${esc(t('added'))}</span></span></span>
            <span class="dz-sq dz-heart" data-fav>${ICO.heart}</span>
          </div>
          <div class="dz-pdp__perks">${d.card.perks.map((x, i) => `<span>${[ICO.truck, ICO.check][i] || ''}${esc(nb(x))}</span>`).join('')}</div>
          <div class="dz-tabs">
            <div class="dz-tabs__h">${t('tabs').map((x, i) => `<span class="dz-tab${i ? '' : ' is-on'}" data-tab="${i}">${esc(x)}</span>`).join('')}<i class="dz-tabs__bar" aria-hidden="true"></i></div>
            <div class="dz-tabs__b">
              <div class="dz-panel is-on" data-panel="0"><p data-about>${esc(t('about'))}</p></div>
              <div class="dz-panel" data-panel="1"><dl class="dz-dl">${spec.map(([k, v], i) => `<div><dt${i === 1 ? ' data-specl' : ''}>${esc(k)}</dt><dd${i === 1 ? ' data-specv' : ''}>${esc(v)}</dd></div>`).join('')}</dl></div>
              <div class="dz-panel" data-panel="2"><div class="dz-ship">${[[ICO.truck, d.card.perks[0], d.perks[1][1]], [ICO.hand, d.perks[1][0], d.perks[0][1] ? t('perk0') : ''], [ICO.check, d.card.perks[1], d.perks[2][0]]].map(([i, a, b]) => `<span>${i}<b>${esc(nb(a))}</b><small>${esc(b)}</small></span>`).join('')}</div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="dz-with">${head(t('withIt'))}<div class="dz-rail dz-rail--3">${['svichnyk', 'nabir', 'shavliia'].map((id) => card(P[PI[id]], ' dz-card--s')).join('')}</div></div>
    </section>`;

  /* ---------- Кошик: steps, the lines (room for three), delivery, payment, the honest totals ---------- */
  const fields = t('fields');
  const cartSec = `<section class="dz-page dz-cart" data-sc="cart">
      <div class="dz-pagehead"><div class="dz-pagehead__row"><h2 class="dz-h1s">${words(t('cart'))}</h2>
        <span class="dz-steps" data-steps>${t('steps').map((x, i) => `<span class="dz-stp${i ? '' : ' is-on'}" data-stepgo="${i}"><i>${i + 1}</i>${esc(x)}</span>`).join('<b aria-hidden="true"><i></i></b>')}</span></div></div>
      <div class="dz-cart__grid">
        <div class="dz-cart__l">
          <div class="dz-lines" data-lines></div>
          <div class="dz-block" data-block="1"><span class="dz-block__h">${esc(t('delivery'))}</span>
            <div class="dz-radios" data-radio="ship"><span class="dz-radio is-on"><i></i>${esc(t('post'))}</span><span class="dz-radio"><i></i>${esc(t('courier'))}</span></div>
            <div class="dz-fields">${fields.map(([k, v]) => `<span class="dz-field" data-field><small>${esc(k)}</small><b>${esc(v)}</b></span>`).join('')}</div>
          </div>
          <div class="dz-block" data-block="2"><span class="dz-block__h">${esc(t('pay'))}</span>
            <div class="dz-radios" data-radio="pay"><span class="dz-radio is-on"><i></i>${esc(t('payCod'))}</span><span class="dz-radio"><i></i>${esc(t('payCard'))}</span></div>
          </div>
        </div>
        <div class="dz-sum" data-sum><i class="dz-sum__spot" aria-hidden="true"></i>
          <div class="dz-sum__row"><span>${esc(t('goods'))} <span data-sumn>(3)</span></span><b data-sumg>${money(3490)}</b></div>
          <div class="dz-sum__row"><span>${esc(t('delivery'))}</span><span class="dz-sum__soft">${esc(t('tariff'))}</span></div>
          <div class="dz-sum__tot"><span>${esc(t('total'))}</span><b data-sumt>${money(3490)}</b></div>
          <span class="dz-btn dz-btn--full dz-order" data-order><span class="dz-order__a">${esc(t('order'))}</span><span class="dz-order__ring" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg></span><span class="dz-order__b">${CHECK}${esc(t('ordered'))}</span></span>
          <span class="dz-sum__note">${ICO.truck}${esc(nb(d.card.perks[0]))}</span>
        </div>
      </div>
    </section>`;

  /* ---------- the footer (Halftone Wordmark Footer, structure only): columns, then the wordmark on its line ---------- */
  const f = d.footer;
  const footer = `<footer class="dz-ftr" data-sc="ftr">
      <div class="dz-ftr__shelf">
        <div class="dz-ftr__lead"><span class="dz-kicker">${esc(t('byColour'))}</span><span class="dz-ftr__lt">${esc(t('ftrNote'))}</span></div>
        <div class="dz-ftr__glass">${COLS.map((k) => `<span class="dz-ftr__g" data-go="catalog" data-fcol="${k}"><span class="dz-ftr__ball" style="--a:${COL[k].a};--b:${COL[k].b}"></span><i class="dz-ftr__ballr" aria-hidden="true" style="--a:${COL[k].a};--b:${COL[k].b}"></i><b>${esc(COL[k][lang])}</b><small>${esc(plural(COL[k].n, lang))}</small></span>`).join('')}</div>
      </div>
      <div class="dz-ftr__cols">
        <div class="dz-ftr__brand"><span class="dz-logo" data-go="top"><i class="dz-logo__m" aria-hidden="true"></i><span>${esc(c.brand)}</span></span><span>${esc(nb(t('sub')))}</span></div>
        <div class="dz-ftr__col"><span class="dz-ftr__h">${esc(t('shopH'))}</span><nav class="dz-ftr__nav">${d.nav.map((x, i) => `<span data-go="${NAVGO[i] || 'top'}">${esc(x)}</span>`).join('')}</nav></div>
        <div class="dz-ftr__col"><span class="dz-ftr__h">${esc(d.catsTitle)}</span><nav class="dz-ftr__nav">${TYPES.slice(1).map(([k, n]) => `<span data-go="catalog" data-ftype="${k}">${esc(n[lang])}</span>`).join('')}</nav></div>
        <div class="dz-ftr__col dz-ftr__col--c"><span class="dz-ftr__h">${esc(d.nav[3] || '')}</span><div class="dz-ftr__c"><span>${ICO.pin}${esc(f.addr)}</span><span>${ICO.phone}${esc(f.phone)}</span><span>${ICO.mail}hello@vash-sait.ua</span></div></div>
        <div class="dz-ftr__col"><span class="dz-ftr__h">${esc(t('socialH'))}</span><div class="dz-ftr__soc">${(f.links || ['Instagram', 'Telegram', 'Facebook']).map((x, i) => `<span>${[ICO.ig, ICO.tg, ICO.fb][i] || ''}${esc(x)}</span>`).join('')}</div></div>
      </div>
      <div class="dz-ftr__bar"><span>${esc(f.copy)}</span><span class="dz-ftr__pay">${ICO.card}${esc(d.perks[2][0])} · ${esc(String(d.perks[2][1]).toLowerCase())}</span><span class="dz-btn dz-btn--ghost dz-up" data-go="top"><span class="dz-btn__l">${esc(t('up'))}${UP}</span></span></div>
      <div class="dz-ftr__word"><span class="dz-ftr__clip"><span class="dz-ftr__w">${esc(c.brand)}</span></span><span class="dz-ftr__clip dz-ftr__clip--r" aria-hidden="true"><span class="dz-ftr__w dz-ftr__w--refl">${esc(c.brand)}</span></span><i class="dz-ftr__line" aria-hidden="true"></i></div>
    </footer>`;

  /* outside the page's scroll: the toast, the mini-cart drawer and its scrim, the phone's filter sheet and pinned bar */
  const overlay = `<i class="dz-scrim" data-close aria-hidden="true"></i>
    <aside class="dz-drawer" aria-hidden="true">
      <div class="dz-drawer__h"><b>${esc(t('cart'))}</b><span class="dz-drawer__n" data-dn>3</span><span class="dz-x" data-close>${CLOSE}</span></div>
      <div class="dz-drawer__lines" data-dlines></div>
      <div class="dz-drawer__tot"><span>${esc(t('total'))}</span><b data-dtot>${money(3490)}</b></div>
      <span class="dz-btn dz-btn--full" data-close data-go="cart"><span class="dz-btn__l">${esc(t('order'))}${ICO.right}</span></span>
      <span class="dz-btn dz-btn--ghost dz-btn--full" data-close><span class="dz-btn__l">${esc(t('goOn'))}</span></span>
    </aside>
    <div class="dz-sheet" aria-hidden="true"><div class="dz-sheet__h"><b>${esc(t('filters'))}</b><span class="dz-x" data-close>${CLOSE}</span></div>
      <span class="dz-sheet__l">${esc(t('colour'))}</span><div class="dz-sheet__sw">${COLS.map((k) => `<span class="dz-sheet__o" data-col="${k}">${sw(k, false, 'data-x')}${esc(COL[k][lang])}</span>`).join('')}</div>
      <span class="dz-sort dz-sort--sheet" data-sortcycle><span data-sortl>${esc(t('sortOpts')[0])}</span>${CHEV}</span></div>
    <div class="dz-menu" aria-hidden="true">${d.nav.map((x, i) => `<span class="dz-menu__i" data-go="${NAVGO[i] || 'top'}"><span>${esc(x)}</span>${ICO.right}</span>`).join('')}<span class="dz-menu__glass">${COLS.map((k) => `<span class="dz-menu__g" data-go="catalog" data-fcol="${k}"><i class="dz-dot" style="--a:${COL[k].a};--b:${COL[k].b}"></i>${esc(COL[k][lang])}</span>`).join('')}</span><span class="dz-menu__i dz-menu__i--cart" data-go="cart"><span>${esc(t('cart'))}</span><b data-mbadge>3</b></span></div>
    <div class="dz-pin" aria-hidden="true">
      <span class="dz-pin__pdp"><span class="dz-pin__t"><span data-pinn>${esc(nm(pp))}</span><b data-pinp>${money(pp.price)}</b></span><span class="dz-btn" data-addpdp><span class="dz-btn__l">${ICO.bag}${esc(d.btn)}</span></span></span>
      <span class="dz-pin__cart"><span class="dz-pin__t"><span>${esc(t('total'))}</span><b data-pint>${money(3490)}</b></span><span class="dz-btn" data-order><span class="dz-btn__l">${esc(t('order'))}</span></span></span>
    </div>`;

  return `${header}
  <div class="pv-scroll dz-scroll">
    ${hero}
    ${cats}
    ${hits}
    ${band}
    ${promise}
    ${catalog}
    ${pdp}
    ${cartSec}
    ${footer}
  </div>
  ${overlay}`;
}

/* =====================================================================================================
   the interactions, the entrances, the 3D vase
   ===================================================================================================== */
const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const LIQUID = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function enhance(site, ctx = {}) {
  const still = !!ctx.reducedMotion;
  const lang = ctx.lang === 'ru' ? 'ru' : 'uk';
  const t = (k) => TX[k][lang];
  const vp = ctx.viewport || site.parentElement;
  const $ = (q, r = site) => r.querySelector(q);
  const $$ = (q, r = site) => [...r.querySelectorAll(q)];
  const play = (el, k, o) => (still || !el?.animate ? null : el.animate(k, o));
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (site.isConnected) fn(); }, ms); timers.add(id); return id; };
  const offs = [];
  const on = (el, ev, fn, o) => { el?.addEventListener(ev, fn, o); offs.push(() => el?.removeEventListener(ev, fn, o)); };
  if (still) site.classList.add('dz-still');
  const phoneMQ = matchMedia('(max-width: 700px)');

  /* ---------- the photos: the first screen's are in the markup; the rest load in page order once it has settled ---------- */
  const queue = $$('img[data-src]');
  const loadAll = () => queue.forEach((im) => { if (!im.getAttribute('src')) { im.fetchPriority = 'low'; im.src = im.dataset.src; } });
  const heroImg = $(phoneMQ.matches ? '.dz-hero__m' : '.dz-hero__d');
  if (heroImg && !heroImg.complete) on(heroImg, 'load', () => later(loadAll, 120), { once: true });
  else later(loadAll, 60);
  later(loadAll, 1500); // (a slow first image never holds the rest back for long)

  /* ---------- live: the frame on screen and the tab visible (the scenes and the 3D wait for it) ---------- */
  const live = { frame: false };
  const isLive = () => live.frame && document.visibilityState === 'visible';
  const pageIO = new IntersectionObserver((es) => { live.frame = es[es.length - 1].isIntersecting; tick(); }, { threshold: 0.12 });
  pageIO.observe(vp);
  on(document, 'visibilitychange', () => tick());

  /* ---------- the scenes: each part plays its entrance once, on entering the frame's view ---------- */
  const seen = new Map(); // element → ratio in the frame
  const done = new Set();
  const NEED = { hero: 0.2, cats: 0.3, hits: 0.45, band: 0.3, perks: 0.5, catalog: 0.32, pdp: 0.25, cart: 0.25, ftr: 0.35 };
  const sceneIO = new IntersectionObserver((es) => { for (const x of es) seen.set(x.target, x.intersectionRatio); tick(); }, { root: vp, threshold: [0, 0.1, 0.2, 0.3, 0.45, 0.6] });
  $$('[data-sc]').forEach((el) => sceneIO.observe(el));
  function tick() {
    if (!site.isConnected) return;
    if (isLive()) for (const [el, r] of seen) {
      const k = el.dataset.sc;
      if (done.has(k) || r < (NEED[k] ?? 0.3)) continue;
      done.add(k);
      SCENES[k]?.(el);
    }
    three?.sync();
  }

  /* the glint (GlareHover): a band of light crosses the photo once */
  const glint = (box, delay = 0) => play($('.dz-glint', box), [{ transform: 'translateX(-130%) skewX(-18deg)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.7 }, { transform: 'translateX(230%) skewX(-18deg)', opacity: 0 }], { duration: 1100, delay, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' });
  // a product's name rises from behind its shelf line
  const rise = (el, delay = 0) => play(el, [{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 760, delay, easing: OUT, fill: 'backwards' });
  const fadeUp = (el, delay = 0, dist = '2cqw') => play(el, [{ opacity: 0, transform: `translateY(${dist})` }, { opacity: 1, transform: 'none' }], { duration: 760, delay, easing: OUT, fill: 'backwards' });
  const cardsIn = (list, base = 0) => list.forEach((cd, i) => {
    fadeUp(cd, base + i * 70, '1.6cqw');
    glint($('.dz-card__img', cd), base + 380 + i * 110);
    rise($('.dz-card__n > span', cd), base + 260 + i * 70);
  });

  // a heading's words rise from behind its shelf line, one after another (SplitText)
  const headIn = (h, base = 0) => { if (h) $$('.dz-w > span', h).forEach((w, i) => play(w, [{ transform: 'translateY(108%)' }, { transform: 'none' }], { duration: 820, delay: base + i * 70, easing: OUT, fill: 'backwards' })); };

  /* the scripted demos (a quick add, a filter) play only for a visitor who watches; once they take the sample in
     their own hands (ctx.onUser), the demos stop and a filter the demo set is put back */
  const demo = { off: !!ctx.user, col: false };
  ctx.onUser?.(() => {
    demo.off = true;
    if (demo.col && state.col === 'burshtyn' && state.type === 'all') { state.col = null; applyFilter(); }
    demo.col = false;
  });

  const SCENES = {
    hero(el) {
      // EchoText: two ghost copies drift into the headline and dissolve; the reflection arrives 100 ms after
      const echoes = $$('.dz-h1__echo', el);
      const tx = $('.dz-h1__t', el);
      play(tx, [{ opacity: 0, transform: 'translateY(0.12em)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 200, easing: LIQUID, fill: 'backwards' });
      echoes.forEach((g, i) => play(g, [{ opacity: 0.42 - i * 0.16, transform: `translate(${(i ? -1 : 1) * 0.16}em, ${-0.1 - i * 0.08}em)` }, { opacity: 0, transform: 'none' }], { duration: 1300 + i * 200, delay: 120, easing: LIQUID, fill: 'both' }));
      play($('.dz-h1--refl', el), [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 300, easing: 'ease-out', fill: 'backwards' });
      fadeUp($('.dz-eyebrow', el), 80, '1cqw');
      fadeUp($('.dz-sub', el), 420, '1cqw');
      fadeUp($('.dz-hero__row', el), 520, '1cqw');
      sheen($('.dz-hero__row .dz-btn', el), 1300); sheen($('.dz-chip__go', el), 1450);
      play($('.dz-hero__line', el), [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 1200, delay: 60, easing: OUT, fill: 'backwards' });
    },
    cats(el) {
      headIn($('.dz-h2', el));
      $$('.dz-cat', el).forEach((cd, i) => {
        fadeUp($('.dz-cat__img', cd), i * 80, '2cqw');
        play($('.dz-cat__refl', cd), [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 100 + i * 80, easing: 'ease-out', fill: 'backwards' });
        rise($('.dz-cat__t', cd), 260 + i * 80);
      });
    },
    hits(el) {
      headIn($('.dz-h2', el));
      cardsIn($$('.dz-card', el));
      // the tour's one interaction here: a quick add on Ваза «Бурштин», once (not once the visitor has the sample)
      if (!still && !demo.off) later(() => { if (demo.off) return; const b = $('.dz-card[data-p="burshtyn"] [data-add]', el); if (b && isLive()) add(b, { toast: true, auto: true }); }, 1500);
    },
    band(el) {
      const fr = $('.dz-band__frame', el);
      // ScrollExpand: the rounded frame grows to full bleed once (its photo stays put inside)
      play(fr, [{ clipPath: 'inset(0 4cqw round 1.2cqw)' }, { clipPath: 'inset(0 0 round 0)' }], { duration: 1200, easing: 'cubic-bezier(0.65, 0, 0.25, 1)', fill: 'backwards' });
      play($('img.dz-band__d', el), [{ transform: 'scale(1.06)' }, { transform: 'none' }], { duration: 1600, easing: OUT, fill: 'backwards' });
      fadeUp($('.dz-band__t', el), 500, '1.4cqw');
      headIn($('.dz-h2', el), 600);
    },
    perks(el) { $$('.dz-perk', el).forEach((p, i) => fadeUp(p, i * 90, '1.2cqw')); },
    catalog(el) {
      headIn($('.dz-h1s', el));
      fadeUp($('.dz-filters', el), 0, '1cqw');
      cardsIn($$('.dz-grid > .dz-card', el).slice(0, 8), 120);
      play($('[data-seenbar]', el), [{ transform: 'scaleX(0)' }, { transform: `scaleX(${state.seen / 30})` }], { duration: 1200, delay: 500, easing: OUT, fill: 'backwards' });
      // the tour's one interaction here: «Бурштин», then «Усі» again (the grid keeps its height)
      if (!still && !demo.off) {
        later(() => { if (demo.off || !isLive()) return; const s = $('.dz-filters .dz-sw[data-col="burshtyn"]', el); press(s); setColour('burshtyn'); demo.col = true; }, 1900);
        later(() => { if (demo.off || !demo.col) return; demo.col = false; if (state.col === 'burshtyn' && state.type === 'all') { press($('.dz-fchip[data-type="all"]', el)); setColour(null); } }, 5200);
      }
    },
    pdp(el) {
      fadeUp($('.dz-stage', el), 0, '1.2cqw');
      $$('.dz-thumb', el).forEach((x, i) => fadeUp(x, 120 + i * 60, '0.8cqw'));
      glint($('.dz-stage', el), 500);
      fadeUp($('.dz-buy', el), 160, '1.2cqw');
      play($('.dz-spec__sheen', el), [{ transform: 'translateX(-120%) skewX(-16deg)' }, { transform: 'translateX(330%) skewX(-16deg)' }], { duration: 1500, delay: 900, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' });
      headIn($('.dz-with .dz-h2', el), 200);
      rubberAll();
    },
    cart(el) {
      headIn($('.dz-h1s', el));
      $$('.dz-line', el).forEach((x, i) => fadeUp(x, i * 90, '1cqw'));
      fadeUp($('.dz-sum', el), 200, '1.2cqw');
      sheen($('.dz-sum .dz-order', el), 900);
    },
    ftr(el) {
      $$('.dz-ftr__g', el).forEach((g, i) => { fadeUp($('.dz-ftr__ball', g), 100 + i * 80, '1.6cqw'); play($('.dz-ftr__ballr', g), [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 260 + i * 80, easing: 'ease-out', fill: 'backwards' }); });
      play($('.dz-ftr__w:not(.dz-ftr__w--refl)', el), [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 1100, easing: OUT, fill: 'backwards' });
      play($('.dz-ftr__w--refl', el), [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 400, easing: 'ease-out', fill: 'backwards' });
    },
  };
  const press = (el) => play(el, [{ transform: 'scale(1)' }, { transform: 'scale(0.9)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' });

  /* ---------- the cart: one model for the badge, the drawer, the Кошик part and the pinned bar ---------- */
  const state = { lines: CART0.map((x) => ({ ...x })), extra: 0, type: 'all', col: null, sort: 0, pc: 'zhar', size: 'M', qty: 1, ordered: false, shut: 0, toastT: 0, seen: phoneMQ.matches ? 4 : 8, step: 0 };
  const badge = $('[data-badge]');
  const qtyAll = () => state.lines.reduce((s, x) => s + x.qty, 0) + state.extra;
  const sumOf = () => state.lines.reduce((s, x) => s + P[PI[x.id]].price * x.qty, 0) + (state.extraSum || 0);
  const roll = (el, text, animate = true) => { if (!el) return; if (still || !animate) { el.textContent = text; el._cells = null; return; } rollNumber(el, text, { roll: true }); };
  const nameOf = (id) => P[PI[id]].n[lang];
  function lineHTML(x) {
    const p = P[PI[x.id]];
    return `<div class="dz-line" data-line="${x.id}${x.size}"><span class="dz-line__img" data-open="${x.id}"><img src="${IMG}${p.img}.jpg" alt="" decoding="async" draggable="false"></span>
      <span class="dz-line__t"><b data-open="${x.id}">${H_esc(nameOf(x.id))}</b><span>${x.size ? `${t('sizeOf')} ${x.size} · ` : ''}${money(p.price)}</span></span>
      <span class="dz-step dz-step--s"><span data-lq="-1">${MINUS}</span><b data-lqty>${x.qty}</b><span data-lq="1">${PLUS}</span></span>
      <b class="dz-line__p" data-lsum>${money(p.price * x.qty)}</b></div>`;
  }
  const linesBox = $('[data-lines]');
  function drawLines() {
    if (!linesBox) return;
    linesBox.innerHTML = state.lines.map(lineHTML).join('') + `<span class="dz-lines__more${state.extra ? ' is-on' : ''}">${H_esc(TX.moreN[lang](plural(state.extra || 1, lang)))}</span><span class="dz-lines__empty"${state.lines.length || state.extra ? ' hidden' : ''}>${H_esc(t('emptyCart'))}<span class="dz-link" data-go="catalog" data-fclear>${H_esc(t('toCat'))}${H_ICO_RIGHT}</span></span>`;
  }
  drawLines();
  function totals(animate = true) {
    const n = qtyAll();
    const sum = sumOf();
    roll(badge, String(n), animate);
    const mb = $('[data-mbadge]'); if (mb) mb.textContent = String(n);
    const sn = $('[data-sumn]'); if (sn) sn.textContent = `(${n})`;
    const sg = $('[data-sumg]'); if (sg) sg.textContent = money(sum);
    roll($('[data-sumt]'), money(sum), animate);
    roll($('[data-pint]'), money(sum), false);
    const dt = $('[data-dtot]'); if (dt) roll(dt, money(sum), animate);
    const dn = $('[data-dn]'); if (dn) dn.textContent = String(n);
    const em = $('.dz-lines__empty'); if (em) em.hidden = n > 0;
  }
  function addToModel(id, size = '', qty = 1) {
    const ln = state.lines.find((x) => x.id === id && x.size === size);
    if (ln) {
      ln.qty += qty;
      const row = linesBox?.querySelector(`[data-line="${id}${size}"]`);
      if (row) { row.querySelector('[data-lqty]').textContent = String(ln.qty); roll(row.querySelector('[data-lsum]'), money(P[PI[id]].price * ln.qty)); }
    } else if (state.lines.length < (phoneMQ.matches ? 2 : 3)) { // (the phone keeps two lines: its page never grows)
      state.lines.push({ id, size, qty });
      linesBox?.querySelector('.dz-lines__more')?.insertAdjacentHTML('beforebegin', lineHTML(state.lines[state.lines.length - 1]));
      const row = linesBox?.querySelector(`[data-line="${id}${size}"]`);
      play(row, [{ opacity: 0, transform: 'translateY(0.8cqw)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: OUT });
    } else {
      state.extra += qty;
      state.extraSum = (state.extraSum || 0) + P[PI[id]].price * qty;
      const more = linesBox?.querySelector('.dz-lines__more');
      if (more) { more.classList.add('is-on'); more.textContent = TX.moreN[lang](plural(state.extra, lang)); play(more, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease-out' }); }
    }
    totals();
  }

  /* the fly to the cart (Interactive Checkout): a copy of the photo arcs into the header's bag, the badge rolls */
  const cartBtn = $('[data-cartbtn]');
  const sk = () => site.getBoundingClientRect().width / (site.offsetWidth || 1) || 1; // (the frame may be scaled)
  function fly(fromImg, done) {
    if (still || !fromImg || !cartBtn || !fromImg.offsetWidth) { done(); return; }
    const sr = site.getBoundingClientRect(), a = fromImg.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    const k = sk();
    const el = document.createElement('i');
    el.className = 'dz-fly';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = `left:${(a.left - sr.left) / k}px;top:${(a.top - sr.top) / k}px;width:${a.width / k}px;height:${a.height / k}px;background-image:url("${fromImg.currentSrc || fromImg.src}")`;
    site.append(el);
    const dx = (b.left + b.width / 2 - (a.left + a.width / 2)) / k, dy = (b.top + b.height / 2 - (a.top + a.height / 2)) / k;
    const s = Math.max(0.06, (b.width * 0.9) / a.width);
    const lift = Math.min(a.height * 0.4, Math.abs(dy) * 0.3 + 24);
    el.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1, borderRadius: '6%' },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(${(1 + s) * 0.45})`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.2, borderRadius: '50%' },
    ], { duration: 820, easing: 'cubic-bezier(0.55, 0, 0.25, 1)' }).onfinish = () => { el.remove(); done(); };
  }
  function bumpCart() {
    play(cartBtn, [{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)', offset: 0.3 }, { transform: 'rotate(7deg)', offset: 0.65 }, { transform: 'rotate(0)' }], { duration: 600, easing: 'ease-out' });
    play(badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.45)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
  }
  // SwipeToast: the toast burns a thin fuse for the time it has left
  function toast() {
    const el = $('.dz-toast');
    if (!el) return;
    site.classList.add('dz-toast-on');
    spring($('.dz-tick', el), 120);
    play($('.dz-toast__fuse', el), [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 2400, easing: 'linear', fill: 'both' });
    clearTimeout(state.toastT);
    state.toastT = later(() => site.classList.remove('dz-toast-on'), 2400);
  }
  // SpringCheck: the tick draws with a small overshoot
  function spring(svg, delay = 0) {
    if (!svg) return;
    play(svg, [{ transform: 'scale(0.4)' }, { transform: 'scale(1.18)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 560, delay, easing: 'ease-out', fill: 'backwards' });
    play($('path', svg), [{ strokeDasharray: '30 30', strokeDashoffset: 30 }, { strokeDasharray: '30 30', strokeDashoffset: 0 }], { duration: 420, delay: delay + 80, easing: 'ease-out', fill: 'backwards' });
  }
  // the mini-cart lists the whole cart; the line just added carries «Додано»; the lines come in one by one, a band of
  // light runs down the drawer's mirror edge, the total rolls
  function openDrawer(item) {
    const dr = $('.dz-drawer');
    if (!dr) return;
    const box = $('[data-dlines]', dr);
    if (box) {
      const key = item ? item.id + (item.size || '') : '';
      box.innerHTML = state.lines.map((x) => {
        const p = P[PI[x.id]];
        const isNew = x.id + x.size === key;
        return `<div class="dz-drawer__line${isNew ? ' is-new' : ''}"><span class="dz-drawer__img"><img src="${IMG}${p.img}.jpg" alt="" decoding="async" draggable="false"></span><span class="dz-drawer__t">${isNew ? `<span class="dz-okchip">${CHECK}${H_esc(t('added'))}</span>` : ''}<b>${H_esc(p.n[lang])}</b><span>${x.size ? `${t('sizeOf')} ${x.size} · ` : ''}${x.qty} × ${money(p.price)}</span></span><b class="dz-drawer__p">${money(p.price * x.qty)}</b></div>`;
      }).join('') + (state.extra ? `<span class="dz-lines__more">${H_esc(TX.moreN[lang](plural(state.extra, lang)))}</span>` : '');
    }
    site.classList.add('dz-drawer-on');
    dr.setAttribute('aria-hidden', 'false');
    $$('.dz-drawer__line, .dz-drawer__tot, .dz-drawer > .dz-btn', dr).forEach((x, i) => play(x, [{ opacity: 0, transform: 'translateX(2.4cqw)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: 180 + i * 60, easing: OUT, fill: 'backwards' }));
    play($('.dz-drawer__edge', dr), [{ transform: 'translateY(-100%)' }, { transform: 'translateY(100%)' }], { duration: 1100, delay: 120, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' });
    spring($('.dz-okchip .dz-tick', dr), 420);
    clearTimeout(state.shut);
    state.shut = later(closeDrawer, 5200);
  }
  function closeDrawer() {
    clearTimeout(state.shut);
    site.classList.remove('dz-drawer-on');
    $('.dz-drawer')?.setAttribute('aria-hidden', 'true');
  }
  $('.dz-drawer')?.insertAdjacentHTML('afterbegin', '<i class="dz-drawer__edge" aria-hidden="true"></i>');

  /* ClickSpark: shards of light burst from the press, in the colour of the glass being added */
  function sparks(ev, col) {
    if (still || !ev || ev.clientX == null || (!ev.clientX && !ev.clientY)) return;
    const sr = site.getBoundingClientRect(), k = sk();
    const x = (ev.clientX - sr.left) / k, y = (ev.clientY - sr.top) / k;
    const c = COL[col] || { a: '#fff6e8', b: '#d07a1e' };
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360 + (i % 2 ? 12 : 0);
      const el = document.createElement('i');
      el.className = 'dz-spark';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = `left:${x}px;top:${y}px;--c:${i % 3 ? c.a : c.b}`;
      site.append(el);
      el.animate([
        { transform: `rotate(${a}deg) translateX(0.4cqw) scaleX(0.2)`, opacity: 1 },
        { transform: `rotate(${a}deg) translateX(2.2cqw) scaleX(1)`, opacity: 1, offset: 0.45 },
        { transform: `rotate(${a}deg) translateX(3.6cqw) scaleX(0.1)`, opacity: 0 },
      ], { duration: 520, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }).onfinish = () => el.remove();
    }
  }
  function add(el, { toast: withToast = true, auto = false, ev = null } = {}) {
    const holder = el.closest('[data-p]');
    const id = holder?.dataset.p;
    if (!id) return;
    press(el.closest('[data-add], .dz-chip__go') || el);
    sparks(ev, P[PI[id]]?.col);
    const im = holder.querySelector('.dz-card__a, .dz-chip__img');
    fly(im, () => { addToModel(id); bumpCart(); if (withToast) toast(); });
    if (auto) site.classList.add('dz-auto');
  }
  // «У кошик» on the product page (Add to Cart Button): the bar sinks, a band of light fills it, then «Додано»
  function addPdp(btn, ev) {
    const id = state.pc, size = state.size, qty = state.qty;
    const spec = $('.dz-spec');
    sparks(ev, P[PI[id]]?.col);
    if (spec && !btn.closest('.dz-pin')) {
      spec.classList.add('is-done');
      spring($('.dz-spec__b .dz-tick', spec), 260);
      play($('.dz-spec__face', spec), [{ transform: 'translateY(0)' }, { transform: 'translateY(0.18cqw) scale(0.98)', offset: 0.3 }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
      play($('.dz-spec__fill', spec), [{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1, offset: 0.7 }, { transform: 'scaleX(1)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)' });
      later(() => spec.classList.remove('is-done'), 2200);
    } else press(btn);
    const im = $('.dz-view.is-on img');
    fly(im, () => { addToModel(id, size, qty); bumpCart(); openDrawer({ id, size, qty }); });
  }
  $('.dz-spec')?.insertAdjacentHTML('afterbegin', '<i class="dz-spec__fill" aria-hidden="true"></i>');

  /* ---------- the catalogue: type chips (a rubber thumb), glass swatches, sorting (GlideSelect), FLIP ---------- */
  const grid = $('[data-grid]');
  const countEl = $('[data-count]');
  function countFor(matches) {
    if (state.type !== 'all' && state.col) return matches;
    if (state.col) return COL[state.col].n;
    return TYPES.find(([k]) => k === state.type)?.[2] ?? 30;
  }
  const sortKey = (x) => { const p = P[PI[x.dataset.p]]; return state.sort === 1 ? p.price * 10 + Number(x.dataset.i) : state.sort === 2 ? -p.price * 10 + Number(x.dataset.i) : Number(x.dataset.i); };
  function applyFilter({ quiet = false } = {}) {
    if (!grid) return;
    const cards = $$(':scope > .dz-card', grid);
    const k = sk();
    const before = new Map(cards.map((x) => [x, x.getBoundingClientRect()]));
    const fits = (x) => (state.type === 'all' || x.dataset.type === state.type) && (!state.col || x.dataset.col === state.col);
    const yes = cards.filter(fits).sort((a, b) => sortKey(a) - sortKey(b));
    const no = cards.filter((x) => !fits(x)).sort((a, b) => sortKey(a) - sortKey(b));
    [...yes, ...no].forEach((x) => grid.append(x)); // the matches first, the rest after them
    no.forEach((x) => x.classList.add('is-out'));
    yes.forEach((x) => x.classList.remove('is-out'));
    $$('.dz-fchip').forEach((x) => x.classList.toggle('is-on', x.dataset.type === state.type));
    $$('.dz-filters .dz-sw, .dz-sheet .dz-sheet__o').forEach((x) => x.classList.toggle('is-on', x.dataset.col === state.col));
    const fnum = $('[data-fnum]'); if (fnum) fnum.textContent = state.col ? '1' : '';
    const reset = $('[data-reset]'); if (reset) reset.hidden = state.type === 'all' && !state.col;
    if (countEl) roll(countEl, plural(countFor(yes.length), lang), !quiet);
    rubber($('.dz-chips'));
    cards.forEach((x) => {
      const a = before.get(x), b = x.getBoundingClientRect();
      const dx = (a.left - b.left) / k, dy = (a.top - b.top) / k;
      if (dx || dy) play(x, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 680, easing: OUT });
    });
    if (!quiet) yes.forEach((x, i) => glint($('.dz-card__img', x), 200 + i * 90));
  }
  function setType(k) { state.type = k; applyFilter(); }
  function setColour(k) { state.col = state.col === k ? null : k; applyFilter(); }
  function filterTo({ type = 'all', col = null } = {}) { state.type = type; state.col = col; applyFilter(); }

  /* RubberSegment: the ink thumb stretches across to the chosen chip, then squashes into place (a clip on one layer,
     so its rounded ends never distort) */
  function rubber(box, instant = false) {
    const th = box && $('.dz-thumbp', box);
    const onEl = box && $(':scope > .is-on', box);
    if (!th || !onEl || !onEl.offsetWidth) return;
    const W = box.scrollWidth, H = box.clientHeight;
    th.style.width = `${W}px`;
    const rad = getComputedStyle(onEl).borderTopLeftRadius || '99px';
    const l = onEl.offsetLeft, r = W - (onEl.offsetLeft + onEl.offsetWidth), tp = onEl.offsetTop, bt = H - (onEl.offsetTop + onEl.offsetHeight);
    const clip = (a, b) => `inset(${tp}px ${a}px ${bt}px ${b}px round ${rad})`;
    const to = clip(r, l);
    const from = th._lr;
    th._lr = [r, l];
    th.style.clipPath = to;
    if (instant || !from || (from[0] === r && from[1] === l)) return;
    const [pr, pl] = from;
    const mid = clip(Math.min(pr, r), Math.min(pl, l)); // the stretch over both
    const over = l > pl ? clip(r - 3, l + 2) : clip(r + 2, l - 3); // a small squash past the place
    play(th, [{ clipPath: clip(pr, pl) }, { clipPath: mid, offset: 0.45 }, { clipPath: over, offset: 0.8 }, { clipPath: to }], { duration: 560, easing: 'cubic-bezier(0.3, 0.7, 0.3, 1)' });
  }
  const rubberAll = () => $$('[data-rubber]').forEach((b) => rubber(b, true));
  rubberAll();
  document.fonts?.ready.then(() => site.isConnected && rubberAll());

  /* GlideSelect: the sort chip's menu pops from its corner, a highlight glides between its rows; the choice re-sorts */
  const sortW = $('.dz-sortw');
  const hl = $('.dz-sortm__hl');
  const glideTo = (o) => { if (!hl || !o) return; hl.style.transform = `translateY(${o.offsetTop}px)`; hl.style.height = `${o.offsetHeight}px`; };
  function sortMenu(open) {
    if (!sortW) return;
    const was = sortW.classList.contains('is-open');
    open = open ?? !was;
    sortW.classList.toggle('is-open', open);
    if (open) {
      glideTo($('.dz-sortm__o.is-on', sortW));
      play($('.dz-sortm', sortW), [{ opacity: 0, transform: 'scale(0.86)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: OUT });
    }
  }
  function setSort(i) {
    state.sort = i;
    $$('.dz-sortm__o').forEach((x) => x.classList.toggle('is-on', Number(x.dataset.sort) === i));
    $$('[data-sortl]').forEach((x) => { x.textContent = t('sortOpts')[i]; play(x, [{ opacity: 0, transform: 'translateY(40%)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: OUT }); });
    applyFilter();
  }
  if (sortW) on(sortW, 'pointerover', (ev) => { const o = ev.target instanceof Element && ev.target.closest('.dz-sortm__o'); if (o) glideTo(o); });

  /* «Показати ще»: how much of the catalogue was seen (a progress line); the phone shows its next four, then the end */
  function seenTo(n) {
    state.seen = n;
    const tx = $('[data-seen]'); if (tx) tx.textContent = TX.seen[lang](n);
    const bar = $('[data-seenbar]');
    if (bar) { const from = getComputedStyle(bar).transform; bar.style.transform = `scaleX(${n / 30})`; play(bar, [{ transform: from === 'none' ? 'scaleX(0)' : from }, { transform: `scaleX(${n / 30})` }], { duration: 900, easing: OUT }); }
  }
  seenTo(state.seen);
  function more(btn) {
    if (btn.classList.contains('is-busy') || btn.classList.contains('is-end')) return;
    btn.classList.add('is-busy');
    later(() => {
      btn.classList.remove('is-busy');
      if (phoneMQ.matches && !site.classList.contains('dz-more')) {
        site.classList.add('dz-more');
        $$('.dz-grid > .dz-card:nth-child(n + 5)').forEach((x, i) => { fadeUp(x, i * 70, '2cqw'); glint($('.dz-card__img', x), 300 + i * 100); });
        seenTo(8);
      } else {
        btn.classList.add('is-end');
        const l = $('[data-morel]', btn); if (l) l.textContent = t('allSeen');
      }
    }, still ? 0 : 700);
  }

  /* ---------- the product page: any product opens here; colour, views (a light sweep), size, quantity, tabs ---------- */
  const pdp = $('.dz-pdp');
  const viewsOf = (id) => (PDP.includes(id) ? [`v-${id}`, `r-${id}`, `b-${id}`, 'v-trio'] : [P[PI[id]].img, P[PI[id]].alt]);
  // the gallery's light: the new photo is uncovered by a band of light that crosses it; a colour swap tints the light
  function sweep(col) {
    const st = $('.dz-stage', pdp);
    if (!st || still) return;
    play($('.dz-view.is-on', st), [{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 760, easing: 'cubic-bezier(0.6, 0, 0.2, 1)' });
    play($('.dz-sweep', st), [{ transform: 'translateX(-30%) skewX(-12deg)', opacity: 1 }, { transform: 'translateX(330%) skewX(-12deg)', opacity: 1, offset: 0.9 }, { transform: 'translateX(360%) skewX(-12deg)', opacity: 0 }], { duration: 760, easing: 'cubic-bezier(0.6, 0, 0.2, 1)' });
    if (col && COL[col]) {
      const f = $('.dz-tintflash', st);
      f.style.setProperty('--c', COL[col].b);
      play(f, [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 0.55, transform: 'scale(1)', offset: 0.35 }, { opacity: 0, transform: 'scale(1.15)' }], { duration: 900, easing: 'ease-out' });
    }
  }
  function setPrice(p, animate) {
    const pr = $('[data-pp]', pdp);
    if (!pr) return;
    const b = $('b', pr), s = $('s', pr);
    roll(b, money(p.price), animate);
    b.classList.toggle('is-sale', !!p.old);
    s.hidden = !p.old;
    if (p.old && animate && !still) { s.textContent = money(p.old); s.classList.add('is-draw'); void s.offsetWidth; s.classList.remove('is-draw'); } // the strike draws itself
  }
  function showProduct(id, { from = 'swatch' } = {}) {
    if (!pdp || !P[PI[id]]) return;
    const p = P[PI[id]];
    const fam = PDP.includes(id);
    const same = id === state.pc;
    state.pc = id;
    const nmEl = $('[data-pn]', pdp); if (nmEl) nmEl.textContent = p.n[lang];
    const pm = $('[data-pm]', pdp); if (pm) pm.textContent = p.h ? `${t('height')} ${p.h}${NB}${t('cm')}` : p.d ? `${t('diam')} ${p.d}${NB}${t('cm')}` : t('pcs');
    const cn = $('[data-pcn]', pdp); if (cn) cn.textContent = COL[p.col][lang];
    const crumb = $('.dz-crumbs .is-on', pdp); if (crumb) crumb.textContent = p.n[lang];
    const tc = $('[data-pt]', pdp); if (tc) { const ty = TYPES.find(([k]) => k === p.type); tc.textContent = ty[1][lang]; tc.dataset.ftype = p.type; }
    setPrice(p, !same);
    // the colour row: the vase's three glasses, or this piece's own colour
    const cols = $('[data-pcols]', pdp);
    if (cols) {
      const list = fam ? PDP : [p.col];
      cols.innerHTML = list.map((k) => `<span class="dz-sw${k === (fam ? id : p.col) ? ' is-on' : ''}" ${fam ? `data-pcol="${k}"` : 'data-x'} style="--a:${COL[k].a};--b:${COL[k].b}" title="${H_esc(COL[k][lang])}"><i></i></span>`).join('');
    }
    const ab = $('[data-about]', pdp); if (ab) ab.textContent = p.type === 'vases' ? t('about') : t('aboutAny');
    const sl = $('[data-specl]', pdp), sv = $('[data-specv]', pdp);
    if (sl && sv) { sl.textContent = p.h ? t('height') : p.d ? t('diam') : t('set'); sv.textContent = p.h ? `${p.h}${NB}${t('cm')}` : p.d ? `${p.d}${NB}${t('cm')}` : t('pcs'); }
    const pin = $('[data-pinn]'); if (pin) pin.textContent = p.n[lang];
    const pinp = $('[data-pinp]'); if (pinp) pinp.textContent = money(p.price);
    // the views: four for the vase family, two (the piece and a close look) for the others
    const names = viewsOf(id);
    $$('.dz-view', pdp).forEach((v, i) => { v.classList.toggle('is-gone', i >= names.length); const im = $('img', v); if (i < names.length) im.src = `${IMG}${names[i]}.jpg`; });
    $$('.dz-thumb', pdp).forEach((v, i) => { v.classList.toggle('is-gone', i >= names.length); const im = $('img', v); if (i < names.length) im.src = `${IMG}${names[i]}.jpg`; });
    $$('.dz-dots i', pdp).forEach((x, i) => x.classList.toggle('is-gone', i >= names.length));
    view(0, { quiet: true });
    if (!same) {
      sweep(p.col);
      play(nmEl, [{ opacity: 0, transform: 'translateY(30%)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: OUT });
    }
    if (fam) three?.tint(id);
  }
  const pdpColour = (k) => showProduct(k, { from: 'swatch' });
  function openProduct(id) {
    showProduct(id, { from: 'card' });
    goTo('pdp');
  }
  function view(i, { quiet = false } = {}) {
    if (!pdp) return;
    $$('.dz-thumb', pdp).forEach((x) => x.classList.toggle('is-on', Number(x.dataset.view) === i));
    $$('.dz-view', pdp).forEach((x) => x.classList.toggle('is-on', Number(x.dataset.v) === i));
    $$('.dz-dots i', pdp).forEach((x, k) => x.classList.toggle('is-on', k === i));
    if (!quiet) sweep(null);
    const tr = $('.dz-stage__track', pdp);
    if (tr && phoneMQ.matches && tr.scrollWidth > tr.clientWidth) tr.scrollTo({ left: i * tr.clientWidth, behavior: still || quiet ? 'auto' : 'smooth' });
  }
  function tab(i) {
    $$('.dz-tab').forEach((x, k) => x.classList.toggle('is-on', k === i));
    $$('.dz-panel').forEach((x, k) => x.classList.toggle('is-on', k === i));
    const bar = $('.dz-tabs__bar');
    const tb = $(`.dz-tab[data-tab="${i}"]`);
    if (bar && tb) { bar.style.transform = `translateX(${tb.offsetLeft}px)`; bar.style.width = `${tb.offsetWidth}px`; }
    play($(`.dz-panel[data-panel="${i}"]`), [{ opacity: 0, transform: 'translateY(0.6em)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: OUT });
    $$(`.dz-panel[data-panel="${i}"] .dz-ship > span`).forEach((x, k) => fadeUp(x, 80 + k * 70, '0.8cqw'));
  }
  // the tab bar under the first tab (its size comes from layout: read once the fonts are in)
  const placeBar = () => { const tb = $('.dz-tab.is-on'), bar = $('.dz-tabs__bar'); if (tb && bar) { bar.style.transform = `translateX(${tb.offsetLeft}px)`; bar.style.width = `${tb.offsetWidth}px`; } };
  placeBar();
  document.fonts?.ready.then(() => site.isConnected && placeBar());

  // the zoom lens (desktop): a circle that shows the photo at 2.2× under the pointer
  const stage = $('[data-stage]');
  const lens = $('.dz-lens');
  const hover = matchMedia('(hover: hover)').matches;
  if (stage && lens && hover) {
    on(stage, 'pointerenter', () => { const im = $('.dz-view.is-on img', stage); if (!im?.currentSrc) return; lens.style.backgroundImage = `url("${im.currentSrc}")`; stage.classList.add('is-zoom'); });
    on(stage, 'pointerleave', () => stage.classList.remove('is-zoom'));
    on(stage, 'pointermove', (ev) => {
      const r = stage.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      const k = r.width / (stage.offsetWidth || 1) || 1;
      const im = $('.dz-view.is-on img', stage);
      if (im?.currentSrc && !lens.style.backgroundImage.includes(im.currentSrc)) lens.style.backgroundImage = `url("${im.currentSrc}")`;
      lens.style.transform = `translate(${(ev.clientX - r.left) / k}px, ${(ev.clientY - r.top) / k}px) translate(-50%, -50%)`;
      lens.style.backgroundPosition = `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`;
    });
  }
  // the phone's swipe: the dots follow the strip
  const track = $('.dz-stage__track');
  if (track) on(track, 'scroll', () => {
    if (!phoneMQ.matches) return;
    const i = Math.round(track.scrollLeft / (track.clientWidth || 1));
    $$('.dz-dots i').forEach((x, k) => x.classList.toggle('is-on', k === i));
    $$('.dz-thumb').forEach((x) => x.classList.toggle('is-on', Number(x.dataset.view) === i));
  }, { passive: true });

  /* ---------- SpecularButton: every button is the same glass; its rim follows the pointer, a sheen crosses it ---------- */
  const SB = '.dz-btn, .dz-chip__go, .dz-add, .dz-spec';
  const sbInit = (root = site) => $$(SB, root).forEach((b) => {
    if (b.classList.contains('dz-sb')) return;
    b.classList.add('dz-sb');
    if (b.classList.contains('dz-btn--ghost')) b.classList.add('dz-sb--ghost');
    if (b.classList.contains('dz-add')) b.classList.add('dz-sb--light');
    if (!$('.dz-sb__sheen, .dz-spec__sheen', b)) b.insertAdjacentHTML('afterbegin', '<i class="dz-sb__sheen" aria-hidden="true"></i>');
  });
  sbInit();
  const sheen = (b, delay = 0) => play(b && $(':scope > .dz-sb__sheen, :scope > .dz-spec__sheen', b), [{ transform: 'translateX(-130%) skewX(-16deg)' }, { transform: 'translateX(340%) skewX(-16deg)' }], { duration: 900, delay, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' });
  if (matchMedia('(hover: hover)').matches) {
    on(site, 'pointermove', (ev) => {
      const b = ev.target instanceof Element ? ev.target.closest('.dz-sb') : null;
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', `${(((ev.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      b.style.setProperty('--my', `${(((ev.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    });
    on(site, 'pointerover', (ev) => {
      const b = ev.target instanceof Element ? ev.target.closest('.dz-sb') : null;
      if (b && !b.contains(ev.relatedTarget)) sheen(b);
    });
  }

  /* ---------- the header: the catalogue's mega panel (a pointer over «Каталог»), the cart's preview (over the bag) ---------- */
  const hdr = $('.dz-hdr');
  const megaEl = $('.dz-mega');
  let megaT = 0;
  function megaOpen(open) {
    if (!megaEl || site.classList.contains('dz-mega-on') === open) return;
    site.classList.toggle('dz-mega-on', open);
    megaEl.setAttribute('aria-hidden', String(!open));
    if (open) $$('.dz-mega__h, .dz-mega__t, .dz-mega__c, .dz-mega__feat', megaEl).forEach((x, i) => play(x, [{ opacity: 0, transform: 'translateY(0.8cqw)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 40 + i * 28, easing: OUT, fill: 'backwards' }));
  }
  const pv = $('.dz-cartpv');
  function cartPreview() {
    if (!pv) return;
    const n = qtyAll();
    pv.innerHTML = `<span class="dz-cartpv__h"><b>${H_esc(t('cart'))}</b><span>${n}</span></span>${state.lines.slice(0, 3).map((x) => { const p = P[PI[x.id]]; return `<span class="dz-cartpv__l" data-open="${x.id}"><span class="dz-cartpv__img"><img src="${IMG}${p.img}.jpg" alt="" decoding="async" draggable="false"></span><span class="dz-cartpv__t"><b>${H_esc(p.n[lang])}</b><small>${x.qty} × ${money(p.price)}</small></span></span>`; }).join('') || `<span class="dz-cartpv__e">${H_esc(t('emptyCart'))}</span>`}<span class="dz-cartpv__tot"><span>${H_esc(t('total'))}</span><b>${money(sumOf())}</b></span><span class="dz-btn dz-btn--full" data-go="cart"><span class="dz-btn__l">${H_esc(t('order'))}${H_ICO_RIGHT}</span></span>`;
    sbInit(pv);
  }
  if (matchMedia('(hover: hover)').matches) {
    const catItem = $('[data-mega]');
    if (catItem && megaEl) {
      on(catItem, 'pointerenter', () => { clearTimeout(megaT); megaOpen(true); });
      on(megaEl, 'pointerenter', () => clearTimeout(megaT));
      on(hdr, 'pointerleave', () => { clearTimeout(megaT); megaT = setTimeout(() => megaOpen(false), 160); });
      $$('.dz-nav > span:not([data-mega]), .dz-logo, .dz-search, .dz-hdr__r', hdr).forEach((x) => on(x, 'pointerenter', () => { clearTimeout(megaT); megaOpen(false); }));
    }
    const cw = $('.dz-cartw');
    let pvT = 0;
    if (cw && pv) {
      on(cw, 'pointerenter', () => { clearTimeout(pvT); cartPreview(); site.classList.add('dz-cartpv-on'); play(pv, [{ opacity: 0, transform: 'translateY(-0.6cqw) scale(0.97)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: OUT }); });
      on(cw, 'pointerleave', () => { pvT = setTimeout(() => site.classList.remove('dz-cartpv-on'), 180); });
    }
    offs.push(() => clearTimeout(megaT));
  }

  /* ---------- the pointer's light (desktop; listeners only, nothing at rest) ---------- */
  if (hover && !still) {
    // GlareHover + TiltedCard: a product photo tilts toward the pointer, lifts off its shelf, a light follows the pointer
    on(site, 'pointerover', (ev) => {
      const box = ev.target instanceof Element ? ev.target.closest('.dz-card__img') : null;
      if (!box || box.contains(ev.relatedTarget) || box.closest('.is-out')) return;
      glint(box);
    });
    on(site, 'pointermove', (ev) => {
      const box = ev.target instanceof Element ? ev.target.closest('.dz-card__img') : null;
      if (!box || box.closest('.is-out')) return;
      const r = box.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
      box.classList.add('is-tilt');
      box.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
      box.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
      box.style.setProperty('--lx', `${((x + 0.5) * 100).toFixed(1)}%`);
      box.style.setProperty('--ly', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    on(site, 'pointerout', (ev) => {
      const box = ev.target instanceof Element ? ev.target.closest('.dz-card__img') : null;
      if (!box || box.contains(ev.relatedTarget)) return;
      box.classList.remove('is-tilt');
      box.style.setProperty('--ry', '0deg'); box.style.setProperty('--rx', '0deg');
    });
    // SpotlightCard: the cart's summary is lit by a soft light that follows the pointer
    const sumC = $('.dz-sum');
    if (sumC) on(sumC, 'pointermove', (ev) => {
      const r = sumC.getBoundingClientRect();
      const k = r.width / (sumC.offsetWidth || 1) || 1;
      sumC.style.setProperty('--sx', `${((ev.clientX - r.left) / k).toFixed(0)}px`);
      sumC.style.setProperty('--sy', `${((ev.clientY - r.top) / k).toFixed(0)}px`);
    });
  }

  /* PulseHeart: the heart contracts to a dot, turns ruby and pulses back with a ring of light */
  function heart(el) {
    const onNow = !el.classList.contains('is-on');
    el.classList.toggle('is-on', onNow);
    if (still) return;
    play($('svg', el), [{ transform: 'scale(1)' }, { transform: 'scale(0.25)', offset: 0.3 }, { transform: 'scale(1.3)', offset: 0.65 }, { transform: 'scale(1)' }], { duration: 560, easing: 'ease-out' });
    if (onNow) {
      const ring = document.createElement('i');
      ring.className = 'dz-heart__ring';
      el.append(ring);
      ring.animate([{ transform: 'scale(0.3)', opacity: 0.9 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 620, delay: 160, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'backwards' }).onfinish = () => ring.remove();
    }
  }

  /* ---------- the Кошик part: steppers recount (a line at 1 goes), steps, fields, «Оформити замовлення» ---------- */
  function lineStep(row, dir) {
    const key = row.dataset.line;
    const ln = state.lines.find((x) => x.id + x.size === key);
    if (!ln) return;
    if (dir < 0 && ln.qty === 1) {
      // the last one goes: the line folds away
      state.lines = state.lines.filter((x) => x !== ln);
      const done = () => { row.remove(); totals(); };
      const a = play(row, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-3cqw)' }], { duration: 360, easing: 'ease-in' });
      if (a) a.onfinish = done; else done();
      return;
    }
    ln.qty = Math.max(1, Math.min(9, ln.qty + dir));
    row.querySelector('[data-lqty]').textContent = String(ln.qty);
    play(row.querySelector('[data-lqty]'), [{ transform: `translateY(${dir > 0 ? 40 : -40}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: OUT });
    roll(row.querySelector('[data-lsum]'), money(P[PI[ln.id]].price * ln.qty));
    totals();
  }
  // Stepper: the steps light up as the form is filled; the line between two steps fills as the next one comes
  function stepTo(i) {
    if (i <= state.step && !state.ordered) { $$('.dz-stp').forEach((s, k) => s.classList.toggle('is-cur', k === i)); return; }
    const from = state.step;
    state.step = Math.max(state.step, i);
    $$('.dz-stp').forEach((s, k) => { s.classList.toggle('is-on', k <= state.step); s.classList.toggle('is-cur', k === i); });
    $$('.dz-steps > b > i').forEach((x, k) => {
      const fill = k < state.step;
      if (fill && k >= from) play(x, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 520, delay: (k - from) * 160, easing: OUT, fill: 'backwards' });
      x.classList.toggle('is-on', fill);
    });
    play($(`.dz-stp[data-stepgo="${i}"] i`), [{ transform: 'scale(0.6)' }, { transform: 'scale(1.15)', offset: 0.6 }, { transform: 'none' }], { duration: 480, easing: 'ease-out' });
  }
  // StatusMark: the order button's label gives way to a ring that draws its arc, then the tick and «Замовлення прийнято»
  function order() {
    if (state.ordered || state.ordering) return;
    if (!qtyAll()) { goTo('catalog'); return; }
    state.ordering = true;
    $$('[data-order]').forEach((b) => b.classList.add('is-busy'));
    const finish = () => {
      state.ordering = false;
      state.ordered = true;
      $$('[data-order]').forEach((b) => b.classList.remove('is-busy'));
      site.classList.add('dz-ordered');
      $$('[data-order]').forEach((b) => spring($('.dz-order__b .dz-tick', b), 80));
      stepTo(2);
      $$('.dz-stp').forEach((s, i) => later(() => { s.classList.add('is-on', 'is-done'); spring($('i', s), 0); }, still ? 0 : 140 * i));
    };
    if (still) { finish(); return; }
    $$('.dz-order__ring circle').forEach((c) => play(c, [{ strokeDashoffset: 57 }, { strokeDashoffset: 0 }], { duration: 900, easing: 'cubic-bezier(0.6, 0, 0.3, 1)', fill: 'both' }));
    later(finish, 950);
  }

  /* ---------- the visitor's way around the sample: a link scrolls to its part (ctx.scrollTo, the visitor's mode) ---------- */
  const PARTS = { top: '.dz-hero', catalog: '.dz-catalog', hits: '.dz-hits', ship: '.dz-tabs', ftr: '.dz-ftr', cart: '.dz-cart', pdp: '.dz-pdp' };
  function goTo(key) {
    const el = $(PARTS[key] || PARTS.top);
    if (!el) return;
    if (key === 'ship') tab(2);
    closeDrawer(); menu(false); sortMenu(false); site.classList.remove('dz-sheet-on', 'dz-cartpv-on'); megaOpen?.(false);
    ctx.scrollTo?.(key === 'ship' ? $('.dz-pdp__grid') || el : el);
  }
  // the phone's menu: a sheet under the header, its items rise one by one
  function menu(open) {
    const was = site.classList.contains('dz-menu-on');
    open = open ?? !was;
    if (open === was) return;
    site.classList.toggle('dz-menu-on', open);
    $('.dz-menu')?.setAttribute('aria-hidden', String(!open));
    if (open) $$('.dz-menu__i').forEach((x, i) => play(x, [{ opacity: 0, transform: 'translateY(2.4cqw)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 60 + i * 55, easing: OUT, fill: 'backwards' }));
  }

  /* ---------- one listener for every tap in the sample ---------- */
  on(site, 'click', (ev) => {
    const el = ev.target instanceof Element ? ev.target : null;
    if (!el) return;
    const hit = (q) => el.closest(q);
    if (!hit('.dz-sortw')) sortMenu(false);
    if (hit('[data-menu]')) { press(hit('[data-menu]')); menu(); return; }
    if (hit('.dz-drawer [data-close], .dz-scrim')) {
      closeDrawer(); site.classList.remove('dz-sheet-on');
      const g = hit('[data-go]'); if (g) goTo(g.dataset.go);
      return;
    }
    if (hit('.dz-sheet [data-close]')) { site.classList.remove('dz-sheet-on'); return; }
    if (hit('.dz-drawer')) return;
    const a = hit('[data-add]');
    if (a) { add(a, { ev }); return; }
    const ap = hit('[data-addpdp]');
    if (ap) { addPdp(ap, ev); return; }
    const sq = hit('[data-q]');
    if (sq) { state.qty = Math.max(1, Math.min(9, state.qty + Number(sq.dataset.q))); const q = $('[data-qty]'); if (q) { q.textContent = String(state.qty); play(q, [{ transform: `translateY(${Number(sq.dataset.q) > 0 ? 40 : -40}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: OUT }); } return; }
    const lq = hit('[data-lq]');
    if (lq) { lineStep(lq.closest('.dz-line'), Number(lq.dataset.lq)); return; }
    const pc = hit('[data-pcol]');
    if (pc) { press(pc); pdpColour(pc.dataset.pcol); return; }
    const sz = hit('[data-size]');
    if (sz) { state.size = sz.dataset.size; $$('[data-size]').forEach((x) => x.classList.toggle('is-on', x === sz)); rubber(sz.parentElement); return; }
    const th = hit('.dz-thumb');
    if (th) { view(Number(th.dataset.view)); return; }
    const tb = hit('.dz-tab');
    if (tb) { tab(Number(tb.dataset.tab)); return; }
    const ch = hit('.dz-fchip');
    if (ch) { setType(ch.dataset.type); return; }
    const so = hit('.dz-sheet__o');
    if (so) { setColour(so.dataset.col); later(() => site.classList.remove('dz-sheet-on'), still ? 0 : 260); return; }
    const sw = hit('.dz-filters .dz-sw');
    if (sw) { press(sw); setColour(sw.dataset.col); return; }
    const sb = hit('[data-sortbtn]');
    if (sb) { sortMenu(); return; }
    const sopt = hit('.dz-sortm__o');
    if (sopt) { setSort(Number(sopt.dataset.sort)); sortMenu(false); return; }
    if (hit('[data-sortcycle]')) { setSort((state.sort + 1) % 3); return; }
    if (hit('[data-reset]')) { filterTo(); return; }
    if (hit('.dz-card.is-out')) return;
    if (hit('[data-sheet]')) { site.classList.add('dz-sheet-on'); return; }
    if (hit('[data-more]')) { more(hit('[data-more]')); return; }
    if (hit('[data-order]')) { order(); return; }
    const sg = hit('[data-stepgo]');
    if (sg) { const i = Number(sg.dataset.stepgo); stepTo(i); const b = i ? $(`[data-block="${i}"]`) : $('.dz-cart'); if (b) ctx.scrollTo?.(b); return; }
    const rd = hit('.dz-radio');
    if (rd) { rd.parentElement.querySelectorAll('.dz-radio').forEach((x) => x.classList.toggle('is-on', x === rd)); press(rd); stepTo(rd.closest('[data-radio="pay"]') ? 2 : 1); return; }
    const fd = hit('[data-field]');
    if (fd) { $$('[data-field]').forEach((x) => x.classList.toggle('is-focus', x === fd)); stepTo(1); return; }
    const fav = hit('[data-fav]');
    if (fav) { heart(fav); return; }
    const cat = hit('.dz-cat');
    if (cat) { press($('.dz-cat__img', cat)); filterTo({ col: cat.dataset.col }); goTo('catalog'); return; }
    const op = hit('[data-open]');
    if (op) { openProduct(op.dataset.open); return; }
    const cd = hit('.dz-card');
    if (cd) { openProduct(cd.dataset.p); return; }
    const g = hit('[data-go]');
    if (g) {
      press(g.matches('.dz-cartbtn, .dz-ico') ? g : null);
      if (g.hasAttribute('data-fclear')) filterTo();
      if (g.dataset.fcol) filterTo({ col: g.dataset.fcol });
      if (g.dataset.ftype) filterTo({ type: g.dataset.ftype });
      if (g.matches('.dz-nav > span')) $$('.dz-nav > span').forEach((x) => x.classList.toggle('is-on', x === g));
      site.classList.remove('dz-toast-on');
      goTo(g.dataset.go);
      return;
    }
    const btn = hit('.dz-btn, .dz-link, .dz-ico, .dz-sort');
    if (btn) press(btn);
  });

  /* ---------- the phone: the product page's price + «У кошик», then the cart's total, pinned to the screen's foot ---------- */
  const buyBtn = $('.dz-pdp .dz-opt--buy');
  const pdpSec = $('.dz-pdp__grid');
  const sum = $('[data-sum]');
  const cartL = $('.dz-cart__l');
  const pinSeen = { buyAbove: false, pdp: false, cartL: false, sum: false };
  const pinIO = new IntersectionObserver((es) => {
    if (!site.isConnected) return;
    for (const x of es) {
      if (x.target === buyBtn) pinSeen.buyAbove = !x.isIntersecting && x.boundingClientRect.top < (x.rootBounds?.top ?? 0);
      else if (x.target === pdpSec) pinSeen.pdp = x.isIntersecting;
      else if (x.target === cartL) pinSeen.cartL = x.isIntersecting;
      else if (x.target === sum) pinSeen.sum = x.isIntersecting;
    }
    const ph = phoneMQ.matches;
    site.classList.toggle('dz-pin-pdp', ph && pinSeen.pdp && pinSeen.buyAbove);
    site.classList.toggle('dz-pin-cart', ph && pinSeen.cartL && !pinSeen.sum);
  }, { root: vp, threshold: 0, rootMargin: `-${$('.dz-hdr')?.offsetHeight || 0}px 0px 0px 0px` }); // (under the header counts as gone)
  [buyBtn, pdpSec, cartL, sum].forEach((x) => x && pinIO.observe(x));

  /* ---------- the 3D vase (option «3D-обʼєкт»): only with ctx.three ---------- */
  let three = null;
  const holder = ctx.three ? $('.dz-obj') : null;
  if (holder) three = vase(holder, { still, vp, isLive, onDispose: (fn) => offs.push(fn) });

  ctx.onDispose?.(() => {
    timers.forEach(clearTimeout); timers.clear();
    pageIO.disconnect(); sceneIO.disconnect(); pinIO.disconnect();
    offs.splice(0).forEach((fn) => { try { fn(); } catch (err) { /* already gone */ } });
  });
}
const H_ICO_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12h15M13.5 6l6 6-6 6"/></svg>';
const H_esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/* =====================================================================================================
   the ruby vase: three.js r186 core, one WebGL context, rendered only while it moves and is visible.
   Coloured glass over a page cannot be drawn with plain alpha (the page must be tinted, not covered), so each frame
   is drawn twice and copied into two 2D canvases: the TINT layer (white everywhere, the glass's transmittance where
   it stands: both walls multiply, deeper at grazing angles), shown with mix-blend-mode: multiply, so the plaster
   shows through the ruby; and the LIGHT layer (black everywhere, the glass's reflections of a softbox room), shown
   with mix-blend-mode: screen. Its reflection in the mirror is the same mesh scaled −1 in y, faded by a CSS mask.
   ===================================================================================================== */
const TINTS = { zhar: ['#ffe4e5', '#d6323c', '#5a040b'], burshtyn: ['#fff0dc', '#e08a2c', '#6a3306'], dym: ['#f3ebe0', '#927a58', '#33281a'] };
function vase(holder, { still, vp, isLive, onDispose }) {
  const tintC = holder.querySelector('.dz-obj__gl');
  const lightC = document.createElement('canvas');
  lightC.className = 'dz-obj__gl dz-obj__gl--light';
  lightC.setAttribute('aria-hidden', 'true');
  tintC.after(lightC);
  const st = { ready: false, dead: false, seen: false, played: false, raf: 0, rot: -0.35, t0: 0, drag: null, tint: 'zhar', needs: true, w: 0, h: 0 };
  let T = null, renderer = null, camera = null, tintScene = null, lightScene = null, tintMat = null, lightMat = null, geo = null, pmrem = null, env = null, ro = null;
  const meshes = [];
  const io = new IntersectionObserver((es) => { st.seen = es[es.length - 1].isIntersecting; api.sync(); }, { root: vp, threshold: 0.2 });
  io.observe(holder);

  import('three').then((THREE) => {
    if (st.dead) return;
    T = THREE;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'low-power' });
    } catch (err) { holder.classList.add('is-nogl'); return; }
    renderer.setPixelRatio(1); // the 2D layers carry the device ratio (≤ 1.5) in their own size
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    camera = new THREE.PerspectiveCamera(19, 1, 0.1, 50);

    // the vase: a lathe profile (outer wall up, the rim, the inner wall down), fluted by modulating the radius
    const pts = [[0.0, 0.0], [0.15, 0.0], [0.198, 0.012], [0.232, 0.06], [0.258, 0.17], [0.27, 0.3], [0.258, 0.44], [0.222, 0.58], [0.172, 0.7], [0.138, 0.8], [0.128, 0.88], [0.138, 0.95], [0.158, 0.995], [0.162, 1.0],
      [0.146, 1.0], [0.14, 0.99], [0.122, 0.94], [0.112, 0.88], [0.122, 0.8], [0.155, 0.7], [0.205, 0.58], [0.24, 0.44], [0.252, 0.3], [0.24, 0.17], [0.215, 0.085], [0.0, 0.07]].map(([r, y]) => new THREE.Vector2(r, y));
    geo = new THREE.LatheGeometry(pts, 128);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i);
      const k = 1 + 0.045 * Math.cos(16 * Math.atan2(z, x)) * Math.sin(Math.min(1, y / 0.9) * Math.PI * 0.95);
      pos.setX(i, x * k); pos.setZ(i, z * k);
    }
    geo.computeVertexNormals();

    // the TINT pass: every wall the light crosses multiplies its transmittance (pale facing the eye, deep at the rim)
    tintMat = new THREE.ShaderMaterial({
      uniforms: { uPale: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uDeep: { value: new THREE.Color() } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vY = position.y; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uPale; uniform vec3 uMid; uniform vec3 uDeep; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); vec3 c = mix(uPale, uMid, smoothstep(0.05, 0.7, f)); c = mix(c, uDeep, smoothstep(0.72, 1.0, f)); c *= mix(0.82, 1.0, smoothstep(0.0, 0.25, abs(vY))); gl_FragColor = vec4(c, 1.0); }',
      side: THREE.DoubleSide, transparent: true, depthTest: false, depthWrite: false, blending: THREE.MultiplyBlending, premultipliedAlpha: true,
    });
    // the LIGHT pass: only the reflections (black glass with a clear coat in a softbox room)
    lightMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, ior: 1.5, envMapIntensity: 2.4 });
    tintScene = new THREE.Scene();
    tintScene.background = new THREE.Color(0xffffff);
    lightScene = new THREE.Scene();
    lightScene.background = new THREE.Color(0x000000);
    for (const [scene, mat] of [[tintScene, tintMat], [lightScene, lightMat]]) {
      const a = new THREE.Mesh(geo, mat), b = new THREE.Mesh(geo, mat);
      b.scale.y = -1; // its reflection in the mirror
      scene.add(a, b);
      meshes.push(a, b);
    }
    // the room the glass reflects: plaster, a large top-left softbox (the photo's light), a strip on the right
    pmrem = new THREE.PMREMGenerator(renderer);
    const room = new THREE.Scene();
    room.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.05, 0.05, 0.05), side: THREE.BackSide })));
    const panel = (w, h, c, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c, c, c), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0.5, 0); room.add(m); };
    panel(3.2, 4.2, 6, -4.2, 4.4, 3.2);  // the key softbox, top left
    panel(0.5, 5, 3.5, 5.2, 1.6, 2.2);   // a strip on the right
    panel(6, 0.6, 1.2, 0, 6.5, 0);       // the ceiling's line
    env = pmrem.fromScene(room, 0.02).texture;
    lightScene.environment = env;
    lightScene.environmentIntensity = 1;

    const ctxT = tintC.getContext('2d'), ctxL = lightC.getContext('2d');
    st.ctx = [ctxT, ctxL];
    const place = () => {
      const w = holder.clientWidth, h = holder.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      st.w = Math.round(w * dpr); st.h = Math.round(h * dpr);
      for (const c of [tintC, lightC]) { c.width = st.w; c.height = st.h; }
      renderer.setSize(st.w, st.h, false);
      camera.aspect = w / h;
      // the vase (1.0 tall) with air above it and its reflection under the line, at 64 % of the canvas from its top
      const V = 1.8, LINE = 0.64, d = V / (2 * Math.tan((camera.fov * Math.PI) / 360));
      const cy = (LINE - 0.5) * V;
      camera.position.set(0, cy + 0.22, d);
      camera.lookAt(0, cy, 0);
      camera.updateProjectionMatrix();
      st.needs = true;
      if (st.played) draw(); else api.sync();
    };
    ro = new ResizeObserver(place);
    ro.observe(holder);
    st.ready = true;
    api.tint(st.tint, true);
    place();
  }).catch(() => holder.classList.add('is-nogl'));

  // drag to turn (horizontal; the page's vertical scroll is left alone)
  const down = (ev) => { if (!st.ready) return; st.drag = { x: ev.clientX, r: st.rot }; lightC.setPointerCapture?.(ev.pointerId); };
  const move = (ev) => { if (!st.drag) return; st.rot = st.drag.r + (ev.clientX - st.drag.x) * 0.012; st.needs = true; frame(); };
  const up = () => { st.drag = null; };
  lightC.addEventListener('pointerdown', down);
  lightC.addEventListener('pointermove', move);
  lightC.addEventListener('pointerup', up);
  lightC.addEventListener('pointercancel', up);

  const ease = (x) => 1 - Math.pow(1 - x, 3);
  function draw() {
    if (!st.w) return;
    meshes.forEach((m) => { m.rotation.y = st.rot; });
    const [ctxT, ctxL] = st.ctx;
    renderer.render(tintScene, camera);
    ctxT.drawImage(renderer.domElement, 0, 0);
    renderer.render(lightScene, camera);
    ctxL.drawImage(renderer.domElement, 0, 0);
    st.needs = false;
  }
  function frame() {
    if (!st.ready || st.raf) return;
    st.raf = requestAnimationFrame((now) => {
      st.raf = 0;
      if (st.dead || !st.ready) return;
      if (st.t0) {
        // the entrance: a 20° turn into rest, once (then nothing runs)
        const k = Math.min(1, (now - st.t0) / 1900);
        st.rot = -0.35 + 0.35 * ease(k);
        draw();
        if (k < 1 && api.visible()) frame(); else { st.t0 = 0; st.played = true; }
        return;
      }
      draw();
    });
  }
  const api = {
    visible: () => st.seen && isLive(),
    sync() {
      if (!st.ready || st.dead || !api.visible()) return;
      if (!st.played && !st.t0) {
        holder.classList.add('is-on');
        if (still) { st.rot = 0; st.played = true; draw(); return; }
        st.t0 = performance.now();
        frame();
        return;
      }
      if (st.needs) frame();
    },
    tint(k, force = false) {
      st.tint = TINTS[k] ? k : 'zhar';
      holder.dataset.tint = st.tint;
      if (!tintMat) return;
      const [pale, mid, deep] = TINTS[st.tint];
      tintMat.uniforms.uPale.value.set(pale);
      tintMat.uniforms.uMid.value.set(mid);
      tintMat.uniforms.uDeep.value.set(deep);
      st.needs = true;
      if (!force) api.sync();
    },
  };
  onDispose(() => {
    st.dead = true;
    cancelAnimationFrame(st.raf);
    io.disconnect(); ro?.disconnect();
    lightC.removeEventListener('pointerdown', down); lightC.removeEventListener('pointermove', move);
    lightC.removeEventListener('pointerup', up); lightC.removeEventListener('pointercancel', up);
    geo?.dispose(); tintMat?.dispose(); lightMat?.dispose(); env?.dispose(); pmrem?.dispose();
    if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
  });
  return api;
}
