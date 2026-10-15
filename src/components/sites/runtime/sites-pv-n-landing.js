/* «Дизайн і сайти» (Next): copied from the static page's js/sites-pv-n-landing.js (the working folder); unchanged. */
/* «Дизайн і сайти» (/dyzain-i-saity): round 6, the new Базовий design for Лендінг (the photo studio, 6 blocks), the art
 * director's world «Фуксія» (S/redesign/ad.md §1; blocks and copy from the product director, pd.md §1).
 *
 * A colour-paper studio. The site is the backdrop rack: magenta and marigold seamless paper hung against a charcoal wall.
 * Every block is a sheet of paper that rolls down from its roll when it comes into the frame, then its type folds in.
 * Huge condensed capitals (Sofia Sans Extra Condensed 800) stand on the paper; Geologica for the text; no serif, no mono.
 * Under the menu hangs the rack of the studio's six backdrop rolls (as in the hero photo): a tap on a roll re-rolls the
 * hero's paper in that colour («Оберіть фон»).
 *
 * The six blocks (pd.md §1): Перший екран · Зали й ціни · Чому нам вірять · Як забронювати · Питання · Заявка й контакти
 * (the footer with the wordmark closes the last one).
 *
 * Components, ported to vanilla DOM + WAAPI in our own code:
 *   React Bits (reactbits.dev, David Haz, MIT + Commons Clause, notice below): PillNav (components/pill-nav: the pill
 *   that slides between the anchors and takes the current block's paper, the hover circle), FoldText
 *   (text-animations/fold-text: lines unfold from a top hinge with a crease shade, once; split by line, no loop or hover
 *   mode), Counter (components/counter, via js/sites-rb.js rollNumber), AccordionGallery (components/accordion-gallery:
 *   fixed columns, the active one un-clips its photo, the others at 55 %), AnimatedList (its spring, via js/sites-rb.js
 *   SPRING), Stack (components/stack: the reviews as a pile of paper cards, drag or flick sends the front card under),
 *   JellyRadio (micro/jelly-radio: the chosen hall swells), Noise (animations/noise: one static grain frame, not animated).
 *   21st.dev (behaviour rebuilt from the public demos only, no code taken): How It Works Timeline
 *   (21st.dev/@olewandowski1/components/how-it-works-2, Oliver, MIT): the four steps as paper tabs on one line;
 *   Booking Slot Calendar (21st.dev/@bidyut10/components/booking-slot-calendar, bidyut10, MIT): hall, week strip, time
 *   slots (mock availability); Animated Wordmark Footer with Shutter Letter (21st.dev/@kedhareswer/components/
 *   shutter-glyph-footer, Kedhareswer Naidu, MIT): the wordmark edge to edge with a three-blade iris between the words.
 * Round 7 (15 Oct, the owner: more premium effects; the visitor can take the sample in hand):
 *   React Bits (MIT + Commons Clause): ClickSpark (since round 10 only when the request is sent: strokes in the rack's
 *   colours from the send button), GlareHover (a glossy streak over the chosen hall's print and the front review card; once when a hall is chosen),
 *   Stepper (a glider runs on the steps' line to the chosen step, the line fills behind it; on entry it walks the four
 *   stops once), TiltedCard (a hanging step tab turns toward the pointer on its top hinge), SplitFlapText (the form's
 *   board: the chosen day, time and hall clack through to their new letters), StaggeredMenu (the phone's menu: a
 *   marigold and a fuchsia sheet roll down before the charcoal one).
 *   21st.dev (rebuilt from the public demos, no code taken): Lens Card (21st.dev/@rmahammad/components/lens-card, Mehi,
 *   MIT: a loupe over the hero photo), Shutter Text (21st.dev/@dev.shejanmahamud/components/shutter-text, Md Shejan
 *   Mahamud, MIT: the chosen hall's name assembles from three slices per letter), Folded Card
 *   (21st.dev/@cult-ui/components/folded-card, cult/ui, MIT: the review cards' folded corner), Scroll Timeline
 *   (21st.dev/@ibrandify/components/scroll-timeline, Waqar H. Syed, MIT: on a phone the step under the frame's middle
 *   is the current one), Add to Cart Button (21st.dev/@bidyut10/components/add-to-cart-button, bidyut10, MIT: the send
 *   button sinks, works, then sends), Underline Animation (21st.dev/@danielpetho/components/underline-animation,
 *   danielpetho, MIT: «Подивитися зали»'s line runs out and back).
 *   Round 10 (the owner: no magnetic buttons): every button is one component, FlowButton (21st.dev/@xubohuah/components/
 *   flow-button, Kain Xu, MIT; rebuilt from the public demo, no code taken): on hover the right arrow slides out, a left
 *   arrow rolls in, the label shifts and the fill comes in; on press it sinks. Fitted to «Фуксія»: the fill is a sheet
 *   of paper that rolls down from the top like the blocks' sheets (instead of the demo's circle), the label is Sofia Sans
 *   Extra Condensed caps, the pill stays a pill (the demo's corner change dropped). Primary: the header «Забронювати»,
 *   «Забронювати зал», «Забронювати цей зал», «Надіслати заявку», the phone menu's button; secondary (outlined):
 *   «Подивитися зали». A touch screen rolls the sheet in on press.
 *   The header and the footer redone (round 10): the header's logo is a lockup (the iris on a fuchsia disc, the name,
 *   «Фотостудія · з 2016»), the PillNav is numbered, the rack names the current paper; past the first screen the header
 *   tightens (21st.dev/@maxim.bort.devel/components/truncating-navbar, Maxim Bortnikov, MIT, the idea only): the rack
 *   rolls up and a hairline in the current block's paper runs under the bar. The footer takes footer.design's large-type
 *   footers as an idea only: the three halls as hanging paper tags (to the halls), the columns (the lockup and the claim,
 *   the anchors, the address, the contacts, the socials), the rack again, the wordmark, and room for the frame's pill.
 *   Every link works in the visitor's hands (ctx.scrollTo): the menu, the logo, «Забронювати…» (to the form, with the
 *   hall chosen), «Подивитися зали» and the hero photo (to the halls), the wordmark (to the top); ctx.onUser stops the
 *   halls' walk-through and the steps' walk.
 * 3D (with «3D-обʼєкт»): a chrome beauty dish hanging from the hero's top edge (three.js r186 core, our own geometry and
 *   environment; the chrome reflects the site's own paper colours), a CSS light pool on the headline.
 *
 * Photos: KOBU Agency's production studio (Unsplash, Unsplash License), img/sites/photos/landing/CREDITS.md:
 *   hero.jpg uekNxBHpUU8 · hall-south.jpg uKKNmPBsaiI · hall-graphite.jpg O8AtzoQcnY4 · hall-attic.jpg 8lqd7vpkxzE ·
 *   leaf.jpg MqwaHPimeBI (https://unsplash.com/photos/<id>).
 *
 * build(H, c, data, e, opts) → the inner HTML of .pv-site (css/sites-pv-n-landing.css, all under .pv-site--n.pv-n-landing)
 * enhance(site, ctx): the sheets and the folds (once per block as it enters the frame), the pill, the rack, the halls
 * (the tour steps through them once), the counters, the stack, the questions, the booking, the iris; with ctx.three the
 * dish. Event listeners and one-off animations; the observers only switch classes. Nothing runs at rest.
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
import { SPRING, rollNumber } from './sites-rb.js';

export const meta = { theme: 'light', cube: 'light', bg: '#E0186C' };
export const object3d = true;

// (lead, 15 Oct) phones get the 640-px copies in m/: a phone frame never shows a photo wider than that, and the
// full-size ones decoded together outgrow a phone browser's memory
const IMG = typeof matchMedia === 'function' && matchMedia('(max-width: 700px)').matches ? '/img/sites/photos/landing/m/' : '/img/sites/photos/landing/';
// the rack, top to bottom, as in the hero photo: the studio's six backdrop colours. `sheet` is the paper as it hangs in
// the hero (teal and grass a shade deeper, so white text keeps ≥ 4.5:1); `ink` the text on it
const ROLLS = [
  { k: 'grass', c: '#5E9B3C', sheet: '#4A7F2E' },
  { k: 'fx', c: '#E0186C', sheet: '#E0186C' },
  { k: 'teal', c: '#1E8C8C', sheet: '#177A7A' },
  { k: 'mg', c: '#F4A61D', sheet: '#F4A61D' },
  { k: 'pw', c: '#F6F3EE', sheet: '#F6F3EE' },
  { k: 'ch', c: '#1F1D21', sheet: '#2A272D' },
];
// the halls' papers (Південь, Графіт, Мансарда) and their photos
const HALL = [
  { p: 'fx', img: 'hall-south.jpg' },
  { p: 'ch', img: 'hall-graphite.jpg' },
  { p: 'mg', img: 'hall-attic.jpg' },
];
// the steps' paper tabs
const TABS = ['fx', 'mg', 'pw', 'ch'];

// the words this sample adds (the facts are the studio's own copy)
const T = {
  nav: { uk: ['Зали', 'Відгуки', 'Питання', 'Контакти'], ru: ['Залы', 'Отзывы', 'Вопросы', 'Контакты'], en: ['Studios', 'Reviews', 'FAQ', 'Contact'] },
  pick: { uk: 'Оберіть фон', ru: 'Выберите фон' },
  rolls: { uk: ['Зелений', 'Фуксія', 'Бірюзовий', 'Жовтий', 'Білий', 'Чорний'], ru: ['Зелёный', 'Фуксия', 'Бирюзовый', 'Жёлтый', 'Белый', 'Чёрный'] },
  // the first screen (pd.md B1), its lines as they fold: [text, key word]
  h1: {
    uk: [[['Три зали', 0]], [['з ', 0], ['денним', 1]], [['світлом', 1]]],
    ru: [[['Три зала', 0]], [['с ', 0], ['дневным', 1]], [['светом', 1]]],
    en: [[['Three', 0]], [['daylight', 1]], [['studios', 0]]],
  },
  sub: { uk: 'Фони, світло й гримерка вже в ціні. Від 600 ₴ за годину.', ru: 'Фоны, свет и гримёрка уже в цене. От 600 ₴ в час.', en: 'Backdrops, lights and a make-up room included. From ₴600 an hour.' },
  since: { uk: 'з 2016 · на Подолі', ru: 'с 2016 · на Подоле' },
  bookHall: { uk: 'Забронювати цей зал', ru: 'Забронировать этот зал' },
  // «Чому нам вірять» (pd.md B3)
  trust: { uk: 'Працюємо на Подолі з 2016 року', ru: 'Работаем на Подоле с 2016 года' },
  trustK: { uk: 'Чому нам вірять', ru: 'Почему нам верят' },
  year: { uk: ['з 2016', 'на Подолі'], ru: ['с 2016', 'на Подоле'] },
  cond: { uk: 'Дані умовні', ru: 'Данные условные' },
  revs: { uk: 'Відгуки клієнтів', ru: 'Отзывы клиентов' },
  rev: { uk: 'Тут буде відгук вашого клієнта', ru: 'Здесь будет отзыв вашего клиента' },
  client: { uk: 'Ваш клієнт', ru: 'Ваш клиент' },
  mono: { uk: 'ВК', ru: 'ВК' },
  // «Питання» (pd.md B5)
  qs: {
    uk: [['Скільки коштує година оренди?', 'Від 600 до 900 ₴. Ціна залежить від залу.'],
      ['Що входить у ціну оренди?', 'Фони 6 кольорів, імпульсне світло, гримерка, відпарювач і парковка.'],
      ['Чи потрібна передоплата?', 'Так, 30%. Решту платите в день зйомки.'],
      ['Як забронювати зал?', 'Залиште заявку. Відповімо за 15 хвилин і підберемо зал і час.']],
    ru: [['Сколько стоит час аренды?', 'От 600 до 900 ₴. Цена зависит от зала.'],
      ['Что входит в цену аренды?', 'Фоны 6 цветов, импульсный свет, гримёрка, отпариватель и парковка.'],
      ['Нужна ли предоплата?', 'Да, 30%. Остальное в день съёмки.'],
      ['Как забронировать зал?', 'Оставьте заявку. Ответим за 15 минут и подберём зал и время.']],
  },
  // the booking (pd.md B6 + the slot calendar)
  hall: { uk: 'Зал', ru: 'Зал' },
  date: { uk: 'Дата', ru: 'Дата' },
  time: { uk: 'Час', ru: 'Время' },
  sent: { uk: 'Заявку надіслано', ru: 'Заявка отправлена' },
  days: { uk: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] },
  mail: 'hello@vash-sait.ua',
};
const SLOTS = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
// the mock availability: busy slots per day of the strip (nothing is promised)
const BUSY = [[1, 4], [0, 3], [2], [1, 5], [0, 2, 4], [3], [1]];

const pad = (n) => String(n).padStart(2, '0');
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
// the three-blade iris (the logo's mark and the footer's glyph): three blades turned 120° round the centre
const IRIS = (cls = '') => `<svg class="${cls}" viewBox="-50 -50 100 100" aria-hidden="true"><g class="fx-iris__b">`
  + [0, 120, 240].map((r) => `<path transform="rotate(${r})" d="M0-46A46 46 0 0 1 39.8 23L14 8.1C17-4 10.5-15.2 0-16.2z"/>`).join('')
  + '</g><circle class="fx-iris__h" r="13"/></svg>';

export function build(H, c, data, e, opts = {}) {
  const s = data;
  if (!s || !s.halls?.length || !s.services?.length || !s.steps?.length || !s.stats?.length || !s.fields?.length) return '';
  const { esc, ICO, lx, words, STAR: STARFX } = H;
  const L = opts.lang === 'ru' ? 'ru' : 'uk';
  const t = (k) => T[k][L];
  const f = s.footer || {};
  // a line with its EN twin in the same cell (ready HTML on both sides)
  const twin = (a, b) => (b == null ? a : `<span class="pv-lx"><span class="pv-lx__a">${a}</span><span class="pv-lx__b" lang="en">${b}</span></span>`);
  // words of a heading as inline blocks: the fold groups them into lines at run time
  const fw = (text) => String(text).split(/\s+/).filter(Boolean).map((w) => `<span class="fx-w">${esc(w)}</span>`).join(' ');
  // «900 ₴/год» → «900» and «₴/год»
  const price = (p) => { const m = /^([\d\s]+)\s*(.*)$/.exec(String(p)); return m ? [m[1].trim(), m[2]] : [String(p), '']; };

  // FlowButton (21st.dev, Kain Xu, MIT; rebuilt): the paper sheet that rolls in, the arrow in, the label, the arrow out
  const fb = (label, cls = '', attrs = '', pre = '') => `<span class="fx-fb ${cls}"${attrs ? ` ${attrs}` : ''}>${pre}<i class="fx-fb__sheet" aria-hidden="true"></i><i class="fx-fb__a fx-fb__a--in" aria-hidden="true">${ARROW}</i><span class="fx-fb__t">${label}</span><i class="fx-fb__a fx-fb__a--out" aria-hidden="true">${ARROW}</i></span>`;
  // Shutter Text: each letter carries three slices of itself (they slide together when the hall is chosen)
  const shutter = (w) => [...String(w)].map((ch) => (ch === ' ' ? ' ' : `<span class="fx-sh">${esc(ch)}<i>${esc(ch)}</i><i>${esc(ch)}</i><i>${esc(ch)}</i></span>`)).join('');

  /* ---------- the header (round 10): the logo as a lockup (the iris on its fuchsia disc, the name, the studio's line),
     the numbered PillNav, the CTA; the rack of the six rolls with the current paper's name. Once the first screen has
     left the frame the header tightens (21st.dev Truncating Navbar's idea, Maxim Bortnikov, MIT): the rack rolls up and
     a hairline in the current block's paper runs along the bar ---------- */
  const navE = e ? T.nav.en : null;
  const nav = T.nav[L].map((x, i) => `<span class="fx-nav__i${i ? '' : ' is-on'}" data-go="${i}"><i class="fx-nav__hc" aria-hidden="true"></i><span class="fx-nav__t"><small class="fx-nav__no">${pad(i + 1)}</small>${lx(x, navE?.[i])}</span></span>`).join('');
  const rack = ROLLS.map((r, i) => `<i class="fx-roll${r.k === 'fx' ? ' is-on' : ''}" data-roll="${r.k}" style="--c:${r.c}" title="${esc(T.rolls[L][i])}"></i>`).join('');
  const lockup = `<i class="fx-logo__disc">${IRIS('fx-iris fx-logo__m')}</i><span class="fx-logo__w"><b>${esc(c.brand)}</b><small>${esc(s.studioLabel || '')} · ${esc(s.meta?.[1] || '')}</small></span>`;
  const header = `<header class="pv-hdr fx-hdr" data-hdr data-paper="fx">
      <span class="fx-logo" data-to="0">${lockup}</span>
      <nav class="fx-nav" data-nav><i class="fx-nav__pill" aria-hidden="true"></i>${nav}</nav>
      <div class="fx-hdr__r"><span class="pv-lang" aria-hidden="true"><b class="pv-lang__a">UA</b><b class="pv-lang__b">EN</b></span>
        ${fb(lx(s.cta, e?.cta), 'fx-cta', 'data-to="5"')}
        <i class="fx-burger" data-burger aria-hidden="true"><i></i><i></i></i></div>
      <div class="fx-rack" data-rack><span class="fx-rack__l" data-next><i class="fx-rack__sw" aria-hidden="true"></i>${esc(t('pick'))}<b class="fx-rack__n" data-rollname>${esc(T.rolls[L][1])}</b></span><span class="fx-rack__rolls" data-rolls>${rack}</span></div>
      <i class="fx-hdr__edge" aria-hidden="true"></i>
    </header>`;
  // the phone's full-screen menu: a charcoal sheet rolls down with the anchors
  const menu = `<div class="fx-menu" data-menu aria-hidden="true"><i class="fx-menu__pre" data-c="mg"></i><i class="fx-menu__pre" data-c="fx"></i><i class="fx-menu__sheet"></i>
      <div class="fx-menu__in">${T.nav[L].map((x, i) => `<span class="fx-menu__i" data-go="${i}"><small>${pad(i + 1)}</small>${lx(x, navE?.[i])}</span>`).join('')}
        ${fb(esc(s.btn), 'fx-menu__cta', 'data-to="5"')}</div></div>`;

  /* ---------- 01 · the first screen ---------- */
  const lineHTML = (ln) => ln.map(([w, em]) => (em ? `<span class="fx-tape">${esc(w)}</span>` : esc(w))).join('');
  const linesU = T.h1[L], linesE = e ? T.h1.en : null;
  const h1 = linesU.map((ln, i) => `<span class="fx-ln"><span class="fx-ln__i">${twin(lineHTML(ln), linesE ? lineHTML(linesE[i]) : null)}<i class="fx-crease" aria-hidden="true"></i></span></span>`).join('');
  const sub = twin(esc(t('sub')), e ? esc(T.sub.en) : null);
  const rest = [s.stat?.join(' ') || '', t('since')];
  const pocket = opts.three
    ? `<div class="fx-pocket" data-obj><img class="fx-poster" src="${IMG}dish-poster.png" alt="" decoding="async"><canvas class="fx-gl" aria-hidden="true"></canvas></div><i class="fx-pool" aria-hidden="true"></i>`
    : '<div class="fx-pocket" aria-hidden="true"></div>';
  const hero = `<section class="fx-blk fx-hero" data-hero data-blk="0" data-roll="fx">
      <i class="fx-sheet" aria-hidden="true"></i><i class="fx-sheet fx-sheet--next" aria-hidden="true"></i>
      ${pocket}
      <div class="fx-hero__copy">
        <span class="fx-eyebrow" data-shine>${words({ html: lx(s.eyebrow, e?.eyebrow) }, rest, true)}</span>
        <h1 class="fx-h1">${h1}</h1>
        <p class="fx-sub">${sub}</p>
        <div class="fx-ctas">${fb(lx(s.btn, e?.btn), 'fx-btn', 'data-cta data-to="5"', STARFX)}${fb(lx(s.btn2, e?.btn2), 'fx-btn2', 'data-to="1"')}</div>
      </div>
      <figure class="fx-hang"><i class="fx-hang__roll" aria-hidden="true"></i><div class="fx-hang__ph" data-to="1" data-loupe><img src="${IMG}hero.jpg" alt="" decoding="async"></div><i class="fx-loupe" aria-hidden="true"><img src="${IMG}hero.jpg" alt="" decoding="async"></i></figure>
    </section>`;

  /* ---------- 02 · the halls and prices: AccordionGallery ---------- */
  const inPrice = String(s.sub || '').replace(/^[^.]*\.\s+/, '');
  const halls = `<section class="fx-blk fx-halls" data-blk="1" data-paper="pw" data-nav="0">
      <i class="fx-sheet" aria-hidden="true"></i>
      <div class="fx-head"><span class="fx-kick">${esc(s.servicesKicker)}</span><h2 class="fx-h2" data-fold>${fw(s.servicesTitle)}</h2><p class="fx-aside">${esc(inPrice)}</p></div>
      <div class="fx-acc" data-acc>${s.halls.slice(0, 3).map(([name, area, p], i) => {
        const [n, unit] = price(p);
        const d = H.noArea ? H.noArea(s.services[i]?.[1] || '') : (s.services[i]?.[1] || '');
        return `<article class="fx-hall${i ? '' : ' is-on'}" data-hall="${i}" data-p="${HALL[i].p}">
          <span class="fx-hall__tab"><i class="fx-hall__roll" aria-hidden="true"></i><span class="fx-hall__n">${pad(i + 1)}</span><b class="fx-hall__name" aria-label="${esc(name)}">${shutter(name)}</b><span class="fx-hall__area">${esc(area)}</span></span>
          <span class="fx-hall__stage"><b class="fx-hall__big" aria-hidden="true">${pad(i + 1)}</b><span class="fx-hall__ph"><img src="${IMG}${HALL[i].img}" alt="" loading="lazy" decoding="async"><i class="fx-glare" aria-hidden="true"></i></span></span>
          <span class="fx-hall__info"><span class="fx-hall__d">${esc(d)}</span>
            <span class="fx-hall__f"><span class="fx-hall__p"><b data-cnt="${esc(n)}">${esc(n)}</b><small>${esc(unit)}</small></span>${fb(esc(t('bookHall')), 'fx-hall__go', `data-to="5" data-hall-pick="${i}"`)}</span></span>
        </article>`;
      }).join('')}</div>
    </section>`;

  /* ---------- 03 · why people trust us: the numbers (Counter) and the reviews (Stack) ---------- */
  const st = s.stats;
  // [before the number, the number, its unit, the label]; the year from the studio's own «з 2016»
  const [pre = '', year = '2016'] = String(s.meta?.[1] || '').split(/\s+/);
  const facts = [['', st[0][0], st[0][1], st[0][2]], ['', st[1][0], st[1][1], st[1][2]], ['', st[3][0], st[3][1], st[3][2]], [pre, year, '', t('year')[1]]];
  const cards = s.halls.slice(0, 3).map(([name], i) => `<figure class="fx-card" data-card="${i}" data-p="${['pw', 'fx', 'ch'][i]}"><i class="fx-card__fold" aria-hidden="true"></i><i class="fx-glare" aria-hidden="true"></i>
        <span class="fx-card__top"><span class="fx-stars">${STAR.repeat(5)}</span><span class="fx-card__no">${pad(i + 1)} / 03</span></span>
        <blockquote class="fx-card__q">${esc(t('rev'))}</blockquote>
        <figcaption><i class="fx-card__m">${esc(t('mono'))}</i><span><b>${esc(t('client'))}</b><small>${esc(s.services[i]?.[0] || name)}</small></span></figcaption>
      </figure>`).reverse().join('');
  const trust = `<section class="fx-blk fx-trust" data-blk="2" data-paper="mg" data-nav="1">
      <i class="fx-sheet" aria-hidden="true"></i>
      <div class="fx-trust__t"><span class="fx-kick">${esc(t('trustK'))}</span><h2 class="fx-h2" data-fold>${fw(t('trust'))}</h2></div>
      <div class="fx-nums">${facts.map(([p0, n, u, l]) => `<div class="fx-num" data-recount><b>${p0 ? `<small class="fx-num__pre">${esc(p0)}</small>` : ''}<span class="fx-num__v" data-cnt="${esc(n)}">${esc(n)}</span>${u ? `<small>${esc(u)}</small>` : ''}</b><span>${esc(l)}</span></div>`).join('')}
        <span class="fx-cond">${esc(t('cond'))}</span></div>
      <div class="fx-revs"><span class="fx-revs__l"><span class="fx-stars">${STAR.repeat(5)}</span>${esc(t('revs'))}</span>
        <div class="fx-stack" data-stack>${cards}</div></div>
      <figure class="fx-leaf"><img src="${IMG}leaf.jpg" alt="" loading="lazy" decoding="async"></figure>
    </section>`;

  /* ---------- 04 · how to book: the timeline of four paper tabs ---------- */
  const steps = `<section class="fx-blk fx-steps" data-blk="3" data-paper="oak">
      <i class="fx-sheet" aria-hidden="true"></i>
      <div class="fx-head"><span class="fx-kick">${esc(s.stepsKicker)}</span><h2 class="fx-h2" data-fold>${fw(s.stepsTitle)}</h2></div>
      <ol class="fx-line" data-line><i class="fx-line__rule" aria-hidden="true"></i><i class="fx-line__fill" aria-hidden="true"></i><i class="fx-line__dot" aria-hidden="true"></i>${s.steps.slice(0, 4).map(([a, b], i) => `<li class="fx-step${i ? '' : ' is-on'}" data-p="${TABS[i]}" data-step="${i}"><i class="fx-step__stop" aria-hidden="true"></i>
        <span class="fx-step__tab"><b class="fx-step__n">${i + 1}</b><span class="fx-step__t">${esc(a)}</span><span class="fx-step__d">${esc(b)}</span></span></li>`).join('')}</ol>
    </section>`;

  /* ---------- 05 · questions: an accordion that moves by transform only ---------- */
  const qs = T.qs[L];
  const faq = `<section class="fx-blk fx-faq" data-blk="4" data-paper="fx" data-nav="2">
      <i class="fx-sheet" aria-hidden="true"></i>
      <div class="fx-faq__t"><span class="fx-kick">${esc(s.plus?.faqKicker || qs[0][0])}</span><h2 class="fx-h2" data-fold>${fw(s.plus?.faqTitle || '')}</h2></div>
      <ol class="fx-qs" data-qs>${qs.map(([q, a], i) => `<li class="fx-q${i ? '' : ' is-on'}" data-q="${i}"><span class="fx-q__n">${pad(i + 1)}</span><b class="fx-q__t">${esc(q)}</b><i class="fx-q__x" aria-hidden="true"></i>
        <p class="fx-q__a">${esc(a)}</p></li>`).join('')}</ol>
    </section>`;

  /* ---------- 06 · the booking and the contacts, then the footer ---------- */
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, k) => { const d = new Date(today); d.setDate(today.getDate() + k + 1); return d; });
  const field = ([k, v], i) => `<span class="fx-field${i ? '' : ' is-focus'}" data-field><span>${esc(k)}</span><b>${esc(v)}</b></span>`;
  // the split-flap board: the chosen day, time and hall, in fixed cells (blank flaps pad the shorter names)
  const hallW = Math.max(...s.halls.slice(0, 3).map(([n]) => [...n].length));
  const flaps = (txt, w) => [...String(txt).toUpperCase().padEnd(w, ' ')].map((ch) => `<i class="fx-fl${ch === ' ' ? ' is-blank' : ''}">${ch === ' ' ? '' : esc(ch)}</i>`).join('');
  const d1 = days[1];
  const board = `<div class="fx-board" data-board aria-hidden="true"><span class="fx-board__g" data-g="day">${flaps(`${t('days')[d1.getDay()]} ${String(d1.getDate()).padStart(2, ' ')}`, 5)}</span>`
    + `<span class="fx-board__g" data-g="time">${flaps(SLOTS[2], 5)}</span><span class="fx-board__g" data-g="hall" data-w="${hallW}">${flaps(s.halls[0][0], hallW)}</span></div>`;
  const contacts = [[s.plus?.addr, f.addr, ICO.pin], [s.plus?.phone, f.phone, ICO.phone], [s.plus?.mail, T.mail, ICO.mail]];
  const heads = s.cover?.heads || [s.plus?.addr || '', s.plus?.phone || '', ''];
  const book = `<section class="fx-blk fx-book" data-blk="5" data-paper="ch" data-nav="3">
      <i class="fx-sheet" aria-hidden="true"></i>
      <div class="fx-book__t">
        <h2 class="fx-h2" data-fold>${fw(s.formTitle)}</h2>
        <p class="fx-book__sub">${esc(s.formSub)}</p>
        <ul class="fx-ci">${contacts.map(([k, v, ic]) => `<li><i>${ic}</i><span>${esc(k || '')}</span><b>${esc(v || '')}</b></li>`).join('')}</ul>
      </div>
      <div class="fx-form" data-form><i class="fx-form__roll" aria-hidden="true"></i>
        <div class="fx-form__in">
          <span class="fx-form__k">${esc(t('hall'))}</span>
          <div class="fx-jelly">${s.halls.slice(0, 3).map(([n, , p], i) => `<span class="fx-jelly__o${i ? '' : ' is-on'}" data-pick="${i}" data-p="${HALL[i].p}"><i class="fx-jelly__d" aria-hidden="true"></i><b>${esc(n)}</b><small>${esc(p)}</small></span>`).join('')}</div>
          <span class="fx-form__k">${esc(t('date'))}</span>
          <div class="fx-days">${days.map((d, k) => `<span class="fx-day${k === 1 ? ' is-on' : ''}" data-day="${k}"><small>${esc(t('days')[d.getDay()])}</small><b>${d.getDate()}</b></span>`).join('')}</div>
          <span class="fx-form__k">${esc(t('time'))}</span>
          <div class="fx-slots">${SLOTS.map((x, k) => `<span class="fx-slot${BUSY[1].includes(k) ? ' is-busy' : ''}${k === 2 ? ' is-on' : ''}" data-slot="${k}">${x}</span>`).join('')}</div>
          <div class="fx-fields">${s.fields.slice(0, 2).map(field).join('')}</div>
          ${board}
          <span class="fx-send fx-fb" data-send><i class="fx-fb__sheet" aria-hidden="true"></i><i class="fx-fb__a fx-fb__a--in" aria-hidden="true">${ARROW}</i><span class="fx-send__t fx-fb__t"><span class="fx-send__a">${esc(s.send)}</span><span class="fx-send__c" aria-hidden="true"><i></i><i></i><i></i></span><span class="fx-send__b">${TICK}${esc(t('sent'))}</span></span><i class="fx-fb__a fx-fb__a--out" aria-hidden="true">${ARROW}</i></span>
          <span class="fx-note">${ICO.clock}${esc(s.formNote)}</span>
        </div>
      </div>
      <footer class="fx-ftr">
        <div class="fx-ftr__halls">${s.halls.slice(0, 3).map(([n, a, p], i) => `<span class="fx-ftr__hall" data-p="${HALL[i].p}" data-to="1" data-hall-show="${i}"><i class="fx-ftr__roll" aria-hidden="true"></i><b>${esc(n)}</b><small>${esc(a)}</small><em>${esc(p)}</em><i class="fx-ftr__go" aria-hidden="true">${ARROW}</i></span>`).join('')}</div>
        <div class="fx-ftr__cols">
          <div class="fx-ftr__brand"><span class="fx-logo" data-to="0">${lockup}</span><p>${T.h1[L].map((ln) => ln.map(([w]) => esc(w)).join('')).join(' ')}</p></div>
          <nav class="fx-ftr__nav">${T.nav[L].map((x, i) => `<span data-go="${i}"><small>${pad(i + 1)}</small>${esc(x)}</span>`).join('')}</nav>
          <div class="fx-ftr__c"><span class="fx-ftr__k">${esc(heads[0])}</span><b>${esc(f.addr || '')}</b><small>${esc(s.meta?.[0] || '')}</small></div>
          <div class="fx-ftr__c"><span class="fx-ftr__k">${esc(heads[1])}</span><b>${esc(f.phone || '')}</b><b>${esc(T.mail)}</b></div>
          <div class="fx-ftr__c"><span class="fx-ftr__k">${esc(heads[2])}</span>${(f.links || []).map((l) => `<b>${esc(l)}</b>`).join('')}</div>
        </div>
        <i class="fx-ftr__rack" aria-hidden="true">${ROLLS.map((r) => `<i style="--c:${r.c}"></i>`).join('')}</i>
        <div class="fx-word" data-word data-to="0" aria-label="${esc(c.brand)}"><span>${esc(c.brand.split(/\s+/)[0] || c.brand)}</span>${IRIS('fx-iris fx-word__iris')}<span>${esc(c.brand.split(/\s+/).slice(1).join(' '))}</span></div>
        <div class="fx-ftr__line"><span>${esc(f.copy || '')}</span><span>${esc(c.url)}</span></div>
      </footer>
    </section>`;

  return `${header}${menu}
  <div class="pv-scroll fx-scroll">
    ${hero}
    ${halls}
    ${trust}
    ${steps}
    ${faq}
    ${book}
  </div>`;
}

/* ==========================================================================
   enhance: the sample's life (once per render)
   ========================================================================== */
const ROLL = 'cubic-bezier(.2,.9,.1,1)'; // the paper sheet's drop (ad.md §1)
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const PAPER = { fx: '#E0186C', mg: '#F4A61D', pw: '#F6F3EE', oak: '#D8CBB8', ch: '#1F1D21', teal: '#177A7A', grass: '#4A7F2E' };

export function enhance(site, ctx = {}) {
  const still = !!ctx.reducedMotion;
  const vp = ctx.viewport || site.closest('.pv-vp');
  const pvw = site.closest('.pvw');
  const disposers = [];
  const onDispose = (fn) => { disposers.push(fn); };
  ctx.onDispose?.(() => disposers.splice(0).forEach((fn) => { try { fn(); } catch (err) { /* gone */ } }));
  site.classList.toggle('fx-still', still);
  let dishPaper = null; // set once the 3D dish is in (ctx.three)
  let toured = false; // the halls' one walk-through (the tour, or the visitor's own pick, ends it)
  const tourT = [];
  onDispose(() => tourT.forEach(clearTimeout));
  // the display face: fetched now, so the fold never starts in a stand-in face
  const faces = Promise.race([
    document.fonts?.load ? Promise.all(['800 1em "Sofia Sans Extra Condensed"', '700 1em "Sofia Sans Extra Condensed"'].map((x) => document.fonts.load(x, 'ЖW9'))).catch(() => {}) : Promise.resolve(),
    new Promise((r) => setTimeout(r, 700)),
  ]);

  const blocks = [...site.querySelectorAll('[data-blk]')];
  const hero = site.querySelector('.fx-hero');
  const anims = [];
  const play = (el, kf, o) => { if (!el || still) return null; const a = el.animate(kf, { fill: 'backwards', easing: EASE, ...o }); anims.push(a); return a; };
  onDispose(() => anims.forEach((a) => a.cancel()));

  /* ---------- FoldText: group a heading's words into lines; each line unfolds from its top hinge ---------- */
  function foldWords(h, at = 0) {
    const ws = [...h.querySelectorAll('.fx-w')];
    if (!ws.length) return at;
    let top = null, line = -1;
    ws.forEach((w) => {
      if (w.offsetTop !== top) { top = w.offsetTop; line++; }
      play(w, [{ transform: 'rotateX(-92deg)', opacity: 0, offset: 0 }, { opacity: 1, offset: 0.25 }, { transform: 'rotateX(0deg)', opacity: 1 }], { duration: 760, delay: at + line * 110, easing: ROLL });
    });
    return at + line * 110 + 500;
  }
  function foldLines(h1, at = 0) {
    [...h1.querySelectorAll('.fx-ln__i')].forEach((ln, i) => {
      play(ln, [{ transform: 'rotateX(-92deg)' }, { transform: 'rotateX(0deg)' }], { duration: 820, delay: at + i * 120, easing: ROLL });
      play(ln.querySelector('.fx-crease'), [{ opacity: 0.9 }, { opacity: 0 }], { duration: 820, delay: at + i * 120, easing: 'cubic-bezier(.4,0,.2,1)' });
    });
  }
  const come = (els, at, step = 70, from = '0 1.6cqw') => els.filter(Boolean).forEach((el, i) => play(el, [{ opacity: 0, translate: from }, { opacity: 1, translate: '0 0' }], { duration: 640, delay: at + i * step }));
  const sheet = (b, at = 0) => play(b.querySelector(':scope > .fx-sheet:not(.fx-sheet--next)'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 420, delay: at, easing: ROLL });

  /* ---------- Counter: digits roll from zero once their block is in the frame ---------- */
  const cnt = [...site.querySelectorAll('[data-cnt]')];
  const zero = (v) => String(v).replace(/\d/g, '0');
  const countIn = (b, at) => [...b.querySelectorAll('[data-cnt]')].filter((el) => !el.closest('.fx-hall:not(.is-on)')).forEach((el, k) => setTimeout(() => {
    if (!el.isConnected) return;
    if (el.closest('.fx-hall')) rollNumber(el, zero(el.dataset.cnt));
    rollNumber(el, el.dataset.cnt, { roll: true, ease: SPRING });
  }, at + k * 120));

  /* ---------- each block once, as it comes into the frame ---------- */
  const PLAN = {
    0: (b) => {
      {
        sheet(b, 0);
        foldLines(b.querySelector('.fx-h1'), 240);
        come([b.querySelector('.fx-eyebrow')], 200, 0, '-1.2cqw 0');
        come([b.querySelector('.fx-sub'), b.querySelector('.fx-ctas')], 720, 90);
        play(b.querySelector('.fx-hang__ph'), [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 900, delay: 420, easing: ROLL });
        play(b.querySelector('.fx-hang__roll'), [{ transform: 'scaleX(0.2)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1 }], { duration: 520, delay: 260, easing: SPRING });
      }
    },
    1: (b) => {
      sheet(b);
      const end = foldWords(b.querySelector('.fx-h2'), 260);
      come([b.querySelector('.fx-kick'), b.querySelector('.fx-aside')], 240, 80);
      [...b.querySelectorAll('.fx-hall')].forEach((h, i) => {
        play(h.querySelector('.fx-hall__roll'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 420, delay: 300 + i * 90, easing: ROLL });
        play(h, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 520, delay: 380 + i * 90, easing: ROLL });
      });
      countIn(b, Math.max(800, end));
      tourT.push(setTimeout(() => tourHalls(), 1500));
    },
    2: (b) => {
      sheet(b);
      foldWords(b.querySelector('.fx-h2'), 240);
      come([b.querySelector('.fx-kick')], 220);
      [...b.querySelectorAll('.fx-num')].forEach((n, i) => play(n, [{ opacity: 0, translate: '0 2.4cqw', scale: '0.98' }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: 620, delay: 420 + i * 50, easing: SPRING }));
      countIn(b, 520);
      come([b.querySelector('.fx-cond'), b.querySelector('.fx-revs__l')], 700, 80);
      play(b.querySelector('.fx-leaf'), [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 900, delay: 300, easing: ROLL });
      [...b.querySelectorAll('.fx-card')].reverse().forEach((cEl, i) => play(cEl, [{ opacity: 0, translate: '0 -6cqw' }, { opacity: 1, translate: '0 0' }], { duration: 640, delay: 560 + i * 90, easing: SPRING }));
    },
    3: (b) => {
      sheet(b);
      foldWords(b.querySelector('.fx-h2'), 240);
      come([b.querySelector('.fx-kick')], 220);
      const ax = matchMedia('(max-width: 700px)').matches ? 'scaleY' : 'scaleX'; // (a phone draws the line downward)
      play(b.querySelector('.fx-line__rule'), [{ transform: `${ax}(0)` }, { transform: `${ax}(1)` }], { duration: 760, delay: 420, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
      [...b.querySelectorAll('.fx-step')].forEach((st, i) => {
        const at = 520 + i * 180;
        play(st.querySelector('.fx-step__stop'), [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 480, delay: at, easing: SPRING });
        play(st.querySelector('.fx-step__tab'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 620, delay: at + 50, easing: SPRING });
        play(st.querySelector('.fx-step__n'), [{ opacity: 0, translate: '0 -1.4cqw' }, { opacity: 1, translate: '0 0' }], { duration: 520, delay: at + 240 });
      });
      // the Stepper's glider walks the four stops once (a desktop; a phone's steps follow the scroll)
      if (!vertical && !ctx.user) [1, 2, 3].forEach((k, n) => tourT.push(setTimeout(() => stepTo(k), 1500 + n * 520)));
    },
    4: (b) => {
      sheet(b);
      foldWords(b.querySelector('.fx-h2'), 240);
      come([b.querySelector('.fx-kick')], 220);
      come([...b.querySelectorAll('.fx-q')], 420, 70, '0 1.2cqw');
    },
    5: (b) => {
      sheet(b);
      foldWords(b.querySelector('.fx-h2'), 220);
      come([b.querySelector('.fx-book__sub'), ...b.querySelectorAll('.fx-ci li')], 520, 70);
      play(b.querySelector('.fx-form__roll'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 420, delay: 300, easing: ROLL });
      play(b.querySelector('.fx-form__in'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 560, delay: 420, easing: ROLL });
    },
  };
  const word = site.querySelector('[data-word]');
  const iris = word?.querySelector('.fx-iris__b');
  const wordIn = () => {
    if (!word) return;
    come([...word.children], 0, 90, '0 4cqw');
    play(iris, [{ transform: 'rotate(-240deg) scale(0.4)' }, { transform: 'rotate(0deg) scale(1)' }], { duration: 1300, delay: 180, easing: EASE });
  };

  // the observers: a block plays when its top passes 88 % of the frame (the tour moves the page by transform, and
  // the observer sees it); the pill follows the block under the frame's 40 % line
  const done = new Set();
  const arm = !still && 'IntersectionObserver' in window && vp;
  if (arm) {
    site.classList.add('fx-armed');
    cnt.forEach((el) => { if (!el.closest('.fx-hall')) rollNumber(el, zero(el.dataset.cnt)); });
  }
  // a rebuild of this same sample (3D or the second language switched): its first screen stays as it was, no entrance
  const rebuilt = !!site.parentElement?.querySelector(':scope > .pv-site--old.pv-n-landing');
  const enter = (b) => {
    const k = b.dataset.blk;
    if (done.has(k)) return;
    done.add(k);
    // the first screen waits for its display face (at most 0.7 s), so the fold never starts in a stand-in face
    const go = () => { if (!site.isConnected) return; b.classList.add('is-in'); PLAN[k]?.(b); };
    if (k === '0' && rebuilt) b.classList.add('is-in');
    else if (k === '0') faces.then(go); else go();
  };
  let ioIn = null, ioSpy = null, ioWord = null;
  if (arm) {
    ioIn = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { enter(x.target); ioIn.unobserve(x.target); } }), { root: vp, rootMargin: '0px 0px -12% 0px', threshold: 0 });
    blocks.forEach((b) => ioIn.observe(b));
    ioWord = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { wordIn(); ioWord.disconnect(); } }, { root: vp, rootMargin: '0px 0px -8% 0px', threshold: 0 });
    if (word) ioWord.observe(word);
  } else blocks.forEach((b) => b.classList.add('is-in'));
  if (vp && 'IntersectionObserver' in window) {
    ioSpy = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) spy(x.target); }), { root: vp, rootMargin: '-40% 0px -59% 0px', threshold: 0 });
    blocks.forEach((b) => ioSpy.observe(b));
  }
  // the header tightens once the first screen has (nearly) left the frame: the rack rolls up, the paper's hairline runs
  let ioHdr = null;
  if (vp && hero && 'IntersectionObserver' in window) {
    ioHdr = new IntersectionObserver((es) => { const x = es[es.length - 1]; site.querySelector('[data-hdr]')?.classList.toggle('is-compact', x.intersectionRatio < 0.2); }, { root: vp, threshold: [0, 0.2, 0.4] });
    ioHdr.observe(hero);
  }
  onDispose(() => { ioIn?.disconnect(); ioSpy?.disconnect(); ioWord?.disconnect(); ioHdr?.disconnect(); });

  /* ---------- PillNav: the pill slides to the current anchor and takes its block's paper ---------- */
  const navEl = site.querySelector('[data-nav]');
  const hdr = site.querySelector('[data-hdr]');
  const pill = navEl?.querySelector('.fx-nav__pill');
  const items = navEl ? [...navEl.querySelectorAll('.fx-nav__i')] : [];
  let navOn = 0;
  function pillTo(i, paper) {
    if (!navEl || !items[i]) return;
    navOn = i;
    items.forEach((x, k) => x.classList.toggle('is-on', k === i));
    const W = navEl.clientWidth, it = items[i];
    const l = it.offsetLeft, r = W - (it.offsetLeft + it.offsetWidth);
    navEl.style.setProperty('--pl', `${l}px`);
    navEl.style.setProperty('--pr', `${r}px`);
    if (paper && hdr) hdr.dataset.paper = paper;
  }
  function spy(b) {
    const paper = b === hero ? hero.dataset.roll : b.dataset.paper === 'ch' ? 'fx' : b.dataset.paper;
    const i = b.dataset.nav != null ? +b.dataset.nav : b === hero ? 0 : navOn;
    pillTo(i, paper);
  }
  // the first frame: the pill under «Зали», in the hero's paper (no transition on the first placement)
  if (navEl) {
    navEl.classList.add('is-static');
    requestAnimationFrame(() => { pillTo(0, hero?.dataset.roll || 'fx'); requestAnimationFrame(() => navEl.classList.remove('is-static')); });
  }
  // a link inside the sample: the engine scrolls the sample (and the visitor has it from then on)
  const scrollTo = (el) => { if (el && ctx.scrollTo) ctx.scrollTo(el); };
  const goTo = (i) => {
    const b = blocks.find((x) => x.dataset.nav === String(i));
    pillTo(i, b ? (b.dataset.paper === 'ch' ? 'fx' : b.dataset.paper) : undefined);
    scrollTo(b);
  };
  navEl?.addEventListener('click', (ev) => { const it = ev.target.closest('[data-go]'); if (it) goTo(+it.dataset.go); });

  /* ---------- the phone's menu ---------- */
  const menu = site.querySelector('[data-menu]');
  const burger = site.querySelector('[data-burger]');
  function menuOpen(on) {
    if (!menu) return;
    site.classList.toggle('fx-menu-on', on);
    if (!on || still) return;
    [...menu.querySelectorAll('.fx-menu__pre')].forEach((x, i) => play(x, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 380, delay: i * 70, easing: ROLL }));
    play(menu.querySelector('.fx-menu__sheet'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 420, delay: 150, easing: ROLL });
    [...menu.querySelectorAll('.fx-menu__i, .fx-menu__cta')].forEach((x, i) => play(x, [{ transform: 'rotateX(-92deg)', opacity: 0 }, { transform: 'rotateX(0deg)', opacity: 1 }], { duration: 620, delay: 330 + i * 70, easing: ROLL }));
  }
  burger?.addEventListener('click', () => menuOpen(!site.classList.contains('fx-menu-on')));
  menu?.addEventListener('click', (ev) => { const it = ev.target.closest('[data-go]'); menuOpen(false); if (it) goTo(+it.dataset.go); });

  /* ---------- the rack: a roll re-rolls the hero's paper ---------- */
  const rack = site.querySelector('[data-rack]');
  const rolls = rack ? [...rack.querySelectorAll('[data-roll]')] : [];
  const next = hero?.querySelector('.fx-sheet--next');
  let rollT = 0;
  function reroll(k) {
    if (!hero || hero.dataset.roll === k) return;
    const R = ROLLS.find((r) => r.k === k);
    if (!R) return;
    rolls.forEach((r) => r.classList.toggle('is-on', r.dataset.roll === k));
    rack.style.setProperty('--cur', R.c);
    const nm = rack.querySelector('[data-rollname]');
    if (nm) {
      nm.textContent = T.rolls[ctx.lang === 'ru' ? 'ru' : 'uk'][ROLLS.indexOf(R)];
      if (!still) nm.animate([{ transform: 'rotateX(-90deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: ROLL });
    }
    clearTimeout(rollT);
    if (still || !next) { hero.dataset.roll = k; dishPaper?.(R.sheet); if (navOn === 0) pillTo(0, k); return; }
    next.style.background = R.sheet;
    next.getAnimations().forEach((a) => a.cancel());
    const a = next.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 420, easing: ROLL, fill: 'forwards' });
    // the ink turns as the sheet passes; then the new paper is the hero's own
    rollT = setTimeout(() => { hero.dataset.roll = k; if (navOn === 0) pillTo(0, k); dishPaper?.(R.sheet); }, 200);
    a.onfinish = () => { a.cancel(); next.style.background = ''; };
  }
  rack?.addEventListener('click', (ev) => {
    // the rolls are hairlines: the one nearest to the pointer's height is the one picked
    const box = ev.target.closest('[data-rolls]');
    if (box) {
      const b = box.getBoundingClientRect();
      const i = Math.max(0, Math.min(ROLLS.length - 1, Math.floor(((ev.clientY - b.top) / (b.height || 1)) * ROLLS.length)));
      reroll(ROLLS[i].k);
      return;
    }
    if (ev.target.closest('[data-next]')) {
      const i = ROLLS.findIndex((x) => x.k === hero?.dataset.roll);
      reroll(ROLLS[(i + 1) % ROLLS.length].k);
    }
  });

  /* ---------- the halls: AccordionGallery (the tour steps through them once) ---------- */
  const acc = site.querySelector('[data-acc]');
  const hallEls = acc ? [...acc.querySelectorAll('.fx-hall')] : [];
  function hallOn(i, user = false) {
    const h = hallEls[i];
    if (!h || h.classList.contains('is-on')) return;
    if (user) { toured = true; tourT.splice(0).forEach(clearTimeout); }
    hallEls.forEach((x) => x.classList.toggle('is-on', x === h));
    if (still) return;
    const n = h.querySelector('[data-cnt]');
    if (n) { rollNumber(n, zero(n.dataset.cnt)); rollNumber(n, n.dataset.cnt, { roll: true, ease: SPRING }); }
    play(h.querySelector('.fx-hall__go'), [{ opacity: 0, translate: '0 0.8cqw' }, { opacity: 1, translate: '0 0' }], { duration: 420, delay: 160 });
    shutterIn(h.querySelector('.fx-hall__name'));
    play(h.querySelector('.fx-hall__ph .fx-glare'), [{ transform: 'translateX(-130%) skewX(-14deg)' }, { transform: 'translateX(330%) skewX(-14deg)' }], { duration: 900, delay: 380, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'none' });
  }
  // Shutter Text (21st.dev, Md Shejan Mahamud, MIT; rebuilt): each letter's three slices slide in from alternate sides
  function shutterIn(name) {
    if (!name || still) return;
    const letters = [...name.querySelectorAll('.fx-sh')];
    name.classList.add('is-sh');
    let end = 0;
    letters.forEach((l, k) => [...l.children].forEach((sl, j) => {
      const at = k * 34 + j * 55;
      end = Math.max(end, at + 460);
      sl.animate([{ opacity: 0, transform: `translateX(${j % 2 ? 0.5 : -0.5}em)` }, { opacity: 1, transform: 'none' }], { duration: 460, delay: at, easing: EASE, fill: 'both' });
    }));
    clearTimeout(name._t);
    name._t = setTimeout(() => { name.classList.remove('is-sh'); name.querySelectorAll('.fx-sh > i').forEach((sl) => sl.getAnimations().forEach((a) => a.cancel())); }, end + 40);
  }
  acc?.addEventListener('click', (ev) => { const h = ev.target.closest('.fx-hall'); if (h) hallOn(+h.dataset.hall, true); });
  if (!ctx.phone) acc?.addEventListener('pointerover', (ev) => { const h = ev.target.closest('.fx-hall'); if (h && ev.pointerType !== 'touch') hallOn(+h.dataset.hall, true); });
  function tourHalls() {
    if (toured || still || !hallEls.length) return;
    toured = true;
    [1, 2, 0].forEach((k, n) => tourT.push(setTimeout(() => { if (site.isConnected && !pvw?.hasAttribute('data-paused')) hallOn(k); }, n * 1700)));
  }

  /* ---------- the reviews: Stack (drag or flick the front card under; a tap does the same) ---------- */
  const stack = site.querySelector('[data-stack]');
  if (stack) {
    const order = () => [...stack.querySelectorAll('.fx-card')]; // the last child is the front card
    const lay = () => order().forEach((cEl, k, all) => { cEl.style.setProperty('--d', String(all.length - 1 - k)); });
    lay();
    let drag = null;
    const under = (cEl, dx = 0, dy = 0) => {
      if (still) { stack.prepend(cEl); lay(); return; }
      const out = cEl.animate([{ translate: `${dx}px ${dy}px` }, { translate: `${dx >= 0 ? 120 : -120}% ${dy * 0.4}px`, rotate: `${dx >= 0 ? 14 : -14}deg`, opacity: 0.2 }], { duration: 280, easing: 'cubic-bezier(.5,0,.75,0)' });
      out.onfinish = () => {
        stack.prepend(cEl); lay();
        cEl.animate([{ opacity: 0, scale: '0.94' }, { opacity: 1, scale: '1' }], { duration: 520, easing: SPRING, fill: 'backwards' });
      };
    };
    stack.addEventListener('pointerdown', (ev) => {
      const cEl = ev.target.closest('.fx-card');
      if (!cEl || cEl !== stack.lastElementChild) return;
      drag = { el: cEl, x: ev.clientX, y: ev.clientY, dx: 0, dy: 0, t: performance.now(), id: ev.pointerId };
      cEl.setPointerCapture?.(ev.pointerId);
      cEl.classList.add('is-drag');
    });
    stack.addEventListener('pointermove', (ev) => {
      if (!drag || ev.pointerId !== drag.id) return;
      drag.dx = ev.clientX - drag.x; drag.dy = ev.clientY - drag.y;
      drag.el.style.translate = `${drag.dx}px ${drag.dy}px`;
      drag.el.style.rotate = `${Math.max(-12, Math.min(12, drag.dx * 0.08))}deg`;
    });
    const release = (ev) => {
      if (!drag || (ev && ev.pointerId !== drag.id)) return;
      const { el, dx, dy, t: t0 } = drag;
      drag = null;
      el.classList.remove('is-drag');
      el.style.translate = ''; el.style.rotate = '';
      const w = el.offsetWidth || 1;
      const fast = Math.abs(dx) / Math.max(1, performance.now() - t0) > 0.5;
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) under(el);
      else if (Math.abs(dx) > w * 0.28 || fast) under(el, dx, dy);
      else if (!still) el.animate([{ translate: `${dx}px ${dy}px`, rotate: `${dx * 0.08}deg` }, { translate: '0 0', rotate: '0deg' }], { duration: 520, easing: SPRING });
    };
    stack.addEventListener('pointerup', release);
    stack.addEventListener('pointercancel', release);
  }

  /* ---------- the questions: one open; the rows below it move by transform ---------- */
  const qsEl = site.querySelector('[data-qs]');
  if (qsEl) {
    const qEls = [...qsEl.querySelectorAll('.fx-q')];
    const set = (i) => { qsEl.style.setProperty('--open', String(i)); qEls.forEach((q, k) => { q.classList.toggle('is-on', k === i); q.classList.toggle('is-below', k > i); }); };
    set(0);
    qsEl.addEventListener('click', (ev) => {
      const q = ev.target.closest('.fx-q');
      if (!q || q.classList.contains('is-on')) return;
      set(+q.dataset.q);
      if (!still) play(q.querySelector('.fx-q__a'), [{ opacity: 0, transform: 'scaleY(0.4)' }, { opacity: 1, transform: 'scaleY(1)' }], { duration: 460, delay: 80, easing: ROLL });
    });
  }

  /* ---------- the booking: JellyRadio halls, the week strip, the slots, «Заявку надіслано» ---------- */
  const form = site.querySelector('[data-form]');
  if (form) {
    const days = [...form.querySelectorAll('.fx-day')], slots = [...form.querySelectorAll('.fx-slot')];
    form.addEventListener('click', (ev) => {
      const o = ev.target.closest('[data-pick]');
      if (o) { pickHall(o); return; }
      const d =ev.target.closest('[data-day]');
      if (d) {
        const k = +d.dataset.day;
        days.forEach((x) => x.classList.toggle('is-on', x === d));
        slots.forEach((x, j) => { x.classList.toggle('is-busy', BUSY[k].includes(j)); x.classList.remove('is-on'); });
        const free = slots.find((x) => !x.classList.contains('is-busy'));
        free?.classList.add('is-on');
        if (!still) slots.forEach((x, j) => x.animate([{ opacity: 0.2, transform: 'translateY(0.6cqw)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: j * 30, easing: EASE, fill: 'backwards' }));
        flap('day', `${d.querySelector('small')?.textContent || ''} ${(d.querySelector('b')?.textContent || '').padStart(2, ' ')}`);
        flap('time', free?.textContent || '');
        return;
      }
      const sl = ev.target.closest('[data-slot]');
      if (sl && !sl.classList.contains('is-busy')) {
        slots.forEach((x) => x.classList.toggle('is-on', x === sl));
        if (!still) sl.animate([{ transform: 'scale(0.92)' }, { transform: 'scale(1)' }], { duration: 420, easing: SPRING });
        flap('time', sl.textContent);
        return;
      }
      const fd = ev.target.closest('[data-field]');
      if (fd) { form.querySelectorAll('[data-field]').forEach((x) => x.classList.toggle('is-focus', x === fd)); return; }
      // the tactile button (21st.dev Add to Cart Button, bidyut10, MIT; rebuilt): it sinks, works for a moment, then
      // says «Заявку надіслано» with a tick and the sparks; back to itself after 3 s
      const send = ev.target.closest('[data-send]');
      if (!send || send.classList.contains('is-busy') || send.classList.contains('is-sent')) return;
      clearTimeout(send._t);
      const done = () => {
        send.classList.remove('is-busy');
        send.classList.add('is-sent');
        if (!still) {
          send.querySelector('.fx-send__b path')?.animate([{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 520, delay: 80, easing: EASE, fill: 'backwards' });
          const r = send.getBoundingClientRect();
          spark(r.right - r.height / 2, r.top + r.height / 2, 12);
        }
        send._t = setTimeout(() => send.classList.remove('is-sent'), 3000);
      };
      if (still) { done(); return; }
      send.classList.add('is-busy');
      send._t = setTimeout(done, 750);
    });
  }
  // a hall chosen in the form (by its chip, or by «Забронювати цей зал»): JellyRadio's swell, the board flips
  function pickHall(o) {
    if (!form || !o) return;
    form.querySelectorAll('[data-pick]').forEach((x) => x.classList.toggle('is-on', x === o));
    flap('hall', o.querySelector('b')?.textContent || '');
    if (still) return;
    o.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08, 0.94)', offset: 0.3 }, { transform: 'scale(0.97, 1.04)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 560, easing: 'ease-out' });
    o.querySelector('.fx-jelly__d')?.animate([{ transform: 'scale(0.4)' }, { transform: 'scale(1.35, 0.8)', offset: 0.45 }, { transform: 'scale(0.9, 1.1)', offset: 0.75 }, { transform: 'scale(1)' }], { duration: 620, easing: 'ease-out' });
  }
  /* SplitFlapText (React Bits): the board clacks through a few letters to the new ones, cell by cell; timers only while
     it flips. Blank flaps pad the shorter values, so the board never changes width */
  const GLYPHS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦШЯ0123456789';
  function flap(g, text) {
    const grp = form?.querySelector(`[data-g="${g}"]`);
    if (!grp) return;
    const cells = [...grp.children];
    const want = [...String(text).toUpperCase().padEnd(cells.length, ' ')].slice(0, cells.length);
    cells.forEach((cell, i) => {
      const to = want[i] === ' ' ? '' : want[i];
      clearTimeout(cell._t);
      if (cell.textContent === to) return;
      const set = (v) => { cell.textContent = v; cell.classList.toggle('is-blank', !v); };
      if (still) { set(to); return; }
      let n = 2 + ((i * 7) % 3);
      const tick = () => {
        cell.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-88deg)', offset: 0.5 }, { transform: 'rotateX(0deg)' }], { duration: 120, easing: 'linear' });
        cell._t = setTimeout(() => {
          set(n > 0 ? GLYPHS[(i * 5 + n * 3) % GLYPHS.length] : to);
          if (n-- > 0) cell._t = setTimeout(tick, 70);
        }, 60);
      };
      cell._t = setTimeout(tick, i * 28);
    });
  }

  /* ---------- the footer's iris: it turns toward the pointer while the pointer is over the wordmark ---------- */
  if (word && iris && !still) {
    let raf = 0, last = null;
    word.addEventListener('pointermove', (ev) => {
      if (ev.pointerType === 'touch') return;
      last = ev;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = word.querySelector('.fx-word__iris').getBoundingClientRect();
        const a = Math.atan2(last.clientY - (r.top + r.height / 2), last.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
        iris.style.transform = `rotate(${(a + 90).toFixed(1)}deg)`;
      });
    });
    word.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); raf = 0; iris.style.transform = ''; });
  }

  /* ---------- in the visitor's hands: every link goes somewhere, scripted demos stop ---------- */
  ctx.onUser?.(() => { toured = true; tourT.splice(0).forEach(clearTimeout); });
  if (ctx.user) toured = true;
  site.addEventListener('click', (ev) => {
    const go = ev.target.closest('.fx-ftr [data-go]');
    if (go) { goTo(+go.dataset.go); return; }
    const to = ev.target.closest('[data-to]');
    if (!to || !site.contains(to)) return;
    if (to.dataset.hallShow != null) hallOn(+to.dataset.hallShow, true);
    const k = to.dataset.to;
    // «Забронювати…» → the form itself (with this hall chosen, from a hall's own button)
    const el = k === '5' ? site.querySelector('[data-form]') : blocks.find((b) => b.dataset.blk === k);
    if (to.dataset.hallPick != null) pickHall(site.querySelector(`[data-pick="${to.dataset.hallPick}"]`));
    if (k === '0' && to.closest('[data-word]') && iris && !still) iris.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 900, easing: EASE, composite: 'add' });
    scrollTo(el);
  });
  // a number counts again on a click (Counter)
  site.addEventListener('click', (ev) => {
    const n = ev.target.closest('[data-recount]')?.querySelector('[data-cnt]');
    if (!n || still) return;
    rollNumber(n, zero(n.dataset.cnt)); rollNumber(n, n.dataset.cnt, { roll: true, ease: SPRING });
  });

  const fine = !ctx.phone && matchMedia('(hover: hover) and (pointer: fine)').matches;
  // (a touch screen: the button's sheet rolls in while it is pressed)
  site.addEventListener('pointerdown', (ev) => { const b = ev.target.closest('.fx-fb'); if (b && ev.pointerType !== 'mouse') { b.classList.add('is-press'); setTimeout(() => b.classList.remove('is-press'), 380); } });
  /* ClickSpark (React Bits): the request sent, the button throws short strokes in the rack's colours */
  const sparkLayer = document.createElement('i');
  sparkLayer.className = 'fx-sparks';
  sparkLayer.setAttribute('aria-hidden', 'true');
  site.append(sparkLayer);
  const SPARK_C = ['#E0186C', '#F4A61D', '#1E8C8C', '#5E9B3C', '#F6F3EE', '#E0186C', '#F4A61D', '#1E8C8C'];
  function spark(x, y, n = 8) {
    if (still) return;
    const r = site.getBoundingClientRect();
    const u = r.width / 100; // 1cqw
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 360 + 8;
      const sp = document.createElement('i');
      sp.style.left = `${x - r.left}px`;
      sp.style.top = `${y - r.top}px`;
      sp.style.background = SPARK_C[k % SPARK_C.length];
      sparkLayer.append(sp);
      const an = sp.animate([{ transform: `rotate(${a}deg) translateX(${0.9 * u}px) scaleX(1)` }, { transform: `rotate(${a}deg) translateX(${3.4 * u}px) scaleX(0)` }], { duration: 420, easing: 'cubic-bezier(.2,.8,.3,1)' });
      an.onfinish = () => sp.remove();
    }
  }
  onDispose(() => sparkLayer.remove());

  /* the loupe over the hero photo (21st.dev Lens Card, Mehi, MIT; rebuilt): a round magnifier follows the pointer */
  const ph = site.querySelector('[data-loupe]');
  const loupe = site.querySelector('.fx-loupe');
  if (fine && ph && loupe && !still) {
    const img = loupe.querySelector('img');
    const Z = 2.3;
    let raf = 0, last = null;
    const move = () => {
      raf = 0;
      if (!last) return;
      const r = ph.getBoundingClientRect(), L = loupe.offsetWidth;
      const x = last.clientX - r.left, y = last.clientY - r.top;
      img.style.width = `${r.width * Z}px`;
      loupe.style.transform = `translate(${(x - L / 2).toFixed(1)}px, ${(y - L / 2).toFixed(1)}px)`;
      img.style.transform = `translate(${(L / 2 - x * Z).toFixed(1)}px, ${(L / 2 - y * Z).toFixed(1)}px)`;
    };
    ph.addEventListener('pointerenter', (ev) => { if (ev.pointerType === 'mouse') loupe.classList.add('is-on'); });
    ph.addEventListener('pointermove', (ev) => { if (ev.pointerType !== 'mouse') return; last = ev; if (!raf) raf = requestAnimationFrame(move); });
    ph.addEventListener('pointerleave', () => { loupe.classList.remove('is-on'); last = null; });
  }

  /* the steps: Stepper (React Bits) — a glider runs on the line to the chosen step and the line fills behind it; on a
     phone the steps are a Scroll Timeline (21st.dev, Waqar H. Syed, MIT; rebuilt): the step under the frame's middle
     is the current one (an observer on the frame, so the tour and the visitor's own scroll both drive it) */
  const line = site.querySelector('[data-line]');
  const stepEls = line ? [...line.querySelectorAll('.fx-step')] : [];
  const vertical = matchMedia('(max-width: 700px)').matches;
  function stepTo(i) {
    const st = stepEls[i];
    if (!line || !st) return;
    stepEls.forEach((x, k) => { x.classList.toggle('is-on', k === i); x.classList.toggle('is-done', k < i); });
    const stop = st.querySelector('.fx-step__stop');
    const lr = line.getBoundingClientRect(), sr = stop.getBoundingClientRect();
    if (vertical) {
      const y = sr.top + sr.height / 2 - lr.top;
      line.style.setProperty('--gy', `${y.toFixed(1)}px`);
      line.style.setProperty('--gp', (y / (lr.height || 1)).toFixed(4));
    } else {
      const x = sr.left + sr.width / 2 - lr.left;
      line.style.setProperty('--gx', `${x.toFixed(1)}px`);
      line.style.setProperty('--gp', (x / (lr.width || 1)).toFixed(4));
    }
  }
  if (line) {
    line.addEventListener('click', (ev) => { const st = ev.target.closest('[data-step]'); if (st) stepTo(+st.dataset.step); });
    requestAnimationFrame(() => stepTo(0));
    if (vertical && vp && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) stepTo(+x.target.dataset.step); }), { root: vp, rootMargin: '-48% 0px -48% 0px', threshold: 0 });
      stepEls.forEach((x) => io.observe(x));
      onDispose(() => io.disconnect());
    }
  }
  /* TiltedCard (React Bits): a hanging tab turns toward the pointer on its top hinge */
  if (fine && !still) {
    for (const tab of site.querySelectorAll('.fx-step__tab')) {
      tab.addEventListener('pointermove', (ev) => {
        if (ev.pointerType !== 'mouse') return;
        const r = tab.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5, py = (ev.clientY - r.top) / r.height - 0.5;
        tab.style.transform = `perspective(${(r.width * 4).toFixed(0)}px) rotateX(${(-py * 12).toFixed(2)}deg) rotateY(${(px * 14).toFixed(2)}deg) scale(1.03)`;
      });
      tab.addEventListener('pointerleave', () => { tab.style.transform = ''; });
    }
  }

  /* ---------- the hero: its own entrance at once (it is the first screen) ---------- */
  if (!arm && hero) hero.classList.add('is-in');

  /* ---------- 3D: the chrome beauty dish ---------- */
  if (ctx.three) {
    const holder = site.querySelector('.fx-pocket[data-obj]');
    if (holder) {
      const api = { paper: null };
      dishPaper = (col) => api.paper?.(col);
      mountDish(site, holder, ctx, onDispose, api).catch((err) => console.warn('[fuchsia] 3d', err));
    }
  }
}

/* ==========================================================================
   The beauty dish (three.js r186 core). A parabolic lathe bowl with a centre deflector on three rods, the speed ring
   and the strobe head behind it, a cable straight up off the canvas' top edge: it hangs. Chrome (metalness 1,
   roughness .12) in an environment made of the site's own papers (PMREMGenerator.fromScene: the hero's paper all
   round, a marigold sheet, two white softbox strips, the charcoal wall). Transparent canvas, DPR ≤ 1.5; it renders
   only while it moves (the arrival's damped swing, 1.4 s; the pointer's tilt ±6°) and only while it is in view.
   ========================================================================== */
async function mountDish(site, holder, ctx, onDispose, api) {
  const canvas = holder.querySelector('canvas.fx-gl');
  const still = !!ctx.reducedMotion;
  if (!canvas || typeof WebGLRenderingContext === 'undefined') return;
  const THREE = await import('three');
  if (!site.isConnected) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (err) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
  camera.position.set(0, 0.2, 9);
  camera.lookAt(0, 0.2, 0);

  /* the environment: the site's papers round the dish */
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null;
  const envScene = new THREE.Scene();
  const plane = (w, h, col, x, y, z, ry = 0, rx = 0, k = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0);
    envScene.add(m);
    return m;
  };
  envScene.background = new THREE.Color('#1F1D21');          // the charcoal walls
  const back = plane(16, 9, '#E0186C', 0, 1.2, -8);           // the hero's paper hanging behind the dish
  const left = plane(11, 8, '#E0186C', -8, 0.8, -1, Math.PI / 2, 0, 0.9); // and toward the headline
  plane(30, 30, '#D8CBB8', 0, -5, 0, 0, -Math.PI / 2, 0.85);  // the oak floor
  plane(4, 3, '#ffffff', -5, -3, 3, 1.0, -0.9, 3);             // a white bounce card on the floor
  plane(7, 12, '#F4A61D', 9, 0, -1, -Math.PI / 2);            // a marigold sheet on the right
  plane(3.2, 3.2, '#ffffff', -4, 4, 5, 0.65, -0.45, 6);       // the octabox up front left
  plane(1.2, 8, '#ffffff', 5, 3, 6, -0.6, 0, 4);              // a strip box on the right
  plane(10, 1.4, '#FFF4EA', 0, 7, 1, 0, Math.PI / 2, 2.2);    // the ceiling's soft light
  function buildEnv(col) {
    [back, left].forEach((m, i) => m.material.color.set(col).multiplyScalar([1, 0.9][i]));
    const rt = pmrem.fromScene(envScene, 0.035);
    envRT?.dispose();
    envRT = rt;
    scene.environment = rt.texture;
  }
  buildEnv(PAPER[site.querySelector('.fx-hero')?.dataset.roll] || '#E0186C');

  /* the dish */
  const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12, side: THREE.DoubleSide });
  const satin = new THREE.MeshStandardMaterial({ color: 0x1f1d21, metalness: 0.35, roughness: 0.45 });
  const prof = [[0.15, 0], [0.3, 0.035], [0.46, 0.095], [0.62, 0.18], [0.76, 0.28], [0.88, 0.39], [0.97, 0.5], [1.04, 0.545], [1.03, 0.565],
    [0.95, 0.525], [0.8, 0.375], [0.6, 0.218], [0.36, 0.1], [0.15, 0.045]].map(([x, y]) => new THREE.Vector2(x, y));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), chrome);
  const dish = new THREE.Group();
  dish.add(bowl);
  const defl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 64), chrome);
  defl.position.y = 0.4;
  dish.add(defl);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.42, 8), chrome);
    rod.position.set(Math.cos(a) * 0.2, 0.2, Math.sin(a) * 0.2);
    rod.rotation.set(Math.sin(a) * -0.5, 0, Math.cos(a) * 0.5);
    dish.add(rod);
  }
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.12, 48), satin);
  ring.position.y = -0.05;
  dish.add(ring);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.5, 48), satin);
  head.position.y = -0.36;
  dish.add(head);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.06, 48), satin);
  cap.position.y = -0.64;
  dish.add(cap);
  // the dish faces the headline: its opening turned left, down and a little toward us
  const aim = new THREE.Vector3(-0.86, -0.4, 0.3).normalize();
  dish.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), aim);
  // it hangs from the head's back: a pivot there, the cable straight up from it
  const hang = new THREE.Vector3(0, -0.64, 0).applyQuaternion(dish.quaternion);
  const pivot = new THREE.Group();
  pivot.position.copy(hang);
  dish.position.copy(hang.clone().negate());
  pivot.add(dish);
  const rig = new THREE.Group();
  rig.add(pivot);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 12, 8), satin);
  cable.position.set(hang.x, hang.y + 6, hang.z);
  rig.add(cable);
  scene.add(rig);
  // framing: the bowl a little right of the pocket's centre, the cable running off the top
  let restY = 0.3;
  rig.position.set(0.15, restY, 0);

  let swingT0 = -1, raf = 0, visible = true, pageVis = true;
  function size() {
    const w = holder.clientWidth, h = holder.clientHeight;
    if (!w || !h) return false;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // the dish's size follows the pocket's height (3 units of the scene from top to bottom); a narrow pocket keeps
    // 3 units across instead
    const V = w / h < 1 ? 2.3 / (w / h) : 2.4;
    // (a wide pocket on a desktop: the dish hangs in its left part, nearer the headline)
    rig.position.x = w / h < 1 ? 0.12 : -0.55;
    restY = w / h < 1 ? 0.24 : 0.36;
    if (swingT0 < 0) rig.position.y = restY;
    camera.fov = 2 * Math.atan(V / 2 / 9) * 180 / Math.PI;
    camera.updateProjectionMatrix();
    return true;
  }
  size();

  /* motion: the arrival's swing, the pointer's tilt; frames only while something moves */
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const draw = () => renderer.render(scene, camera);
  function frame(now) {
    raf = 0;
    let moving = false;
    if (swingT0 >= 0) {
      const t = (now - swingT0) / 1000;
      if (t < 1.4) {
        const a = Math.exp(-t * 2.6) * Math.sin(t * 9.4);
        pivot.rotation.z = a * 0.16;
        pivot.rotation.x = a * 0.05;
        rig.position.y = restY + Math.max(0, 1 - t / 0.5) ** 3 * 1.6;
        moving = true;
      } else { pivot.rotation.set(0, 0, 0); rig.position.y = restY; swingT0 = -1; }
    }
    tilt.x += (tilt.tx - tilt.x) * 0.14;
    tilt.y += (tilt.ty - tilt.y) * 0.14;
    if (Math.abs(tilt.tx - tilt.x) > 1e-4 || Math.abs(tilt.ty - tilt.y) > 1e-4) moving = true;
    rig.rotation.set(tilt.x, tilt.y, 0);
    draw();
    if (moving) kick();
  }
  const kick = () => { if (!raf && visible && pageVis && !document.hidden) raf = requestAnimationFrame(frame); };

  const hero = site.querySelector('.fx-hero');
  // the first frame: the canvas takes over from the poster
  draw();
  holder.classList.add('is-live');
  hero?.classList.add('fx-lit');
  if (!still) { swingT0 = performance.now(); kick(); }

  api.paper = (col) => { buildEnv(col); draw(); };

  // the pointer's tilt over the hero (±6°), desktop only
  const onMove = (ev) => {
    if (still || ev.pointerType === 'touch') return;
    const r = hero.getBoundingClientRect();
    tilt.ty = (((ev.clientX - r.left) / r.width) * 2 - 1) * 0.105;
    tilt.tx = (((ev.clientY - r.top) / r.height) * 2 - 1) * 0.06;
    kick();
  };
  const onLeave = () => { tilt.tx = 0; tilt.ty = 0; kick(); };
  hero?.addEventListener('pointermove', onMove);
  hero?.addEventListener('pointerleave', onLeave);

  // only while in view: the frame's viewport and the page's
  const ios = [];
  if ('IntersectionObserver' in window) {
    let inVp = true, inPage = true;
    const upd = () => { visible = inVp && inPage; if (visible) kick(); else { cancelAnimationFrame(raf); raf = 0; } };
    ios.push(new IntersectionObserver((es) => { inVp = es[es.length - 1].isIntersecting; upd(); }, { root: ctx.viewport || null }));
    ios.push(new IntersectionObserver((es) => { inPage = es[es.length - 1].isIntersecting; upd(); }));
    ios.forEach((io) => io.observe(holder));
  }
  const onVis = () => { pageVis = document.visibilityState === 'visible'; if (pageVis) kick(); };
  document.addEventListener('visibilitychange', onVis);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { if (size()) draw(); }) : null;
  ro?.observe(holder);
  // (QA: a still of the dish for the poster)
  holder.__dish = { snap: () => { draw(); return canvas.toDataURL('image/png'); } };

  onDispose(() => {
    cancelAnimationFrame(raf);
    hero?.removeEventListener('pointermove', onMove);
    hero?.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVis);
    ios.forEach((io) => io.disconnect());
    ro?.disconnect();
    scene.traverse((o) => { o.geometry?.dispose(); });
    envScene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
    chrome.dispose(); satin.dispose();
    envRT?.dispose(); pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  });
}
