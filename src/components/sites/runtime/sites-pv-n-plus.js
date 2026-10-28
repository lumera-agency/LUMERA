/* «Дизайн і сайти» (Next): copied from the static page's js/sites-pv-n-plus.js (the working folder); unchanged. */
/* «Дизайн і сайти» (/dyzain-i-saity): round 6, the new Базовий sample of Лендінг+ (the photo studio, 10 blocks), «План».
 *
 * The world (art director, ad.md §2): the same studio as the plain Лендінг, presented as an architect's drawing set.
 * Plaster, concrete, cyc white and graphite, one sage accent (the green of the studio's table); Unbounded 300 for the
 * display and Unbounded 500 for the numbers, IBM Plex Mono for every plan label and dimension, Geologica 300 for the
 * text. A 16-column plan grid in hairlines under the whole page, radius 0, dimension lines with 45° ticks, no shadows.
 * Motion is drawn, never bouncy: lines draw by stroke-dashoffset, then the fills arrive; crossfades take 500 ms.
 * Real photographs of one rental studio (Neon Wang, Unsplash License; see img/sites/photos/plus/CREDITS.md) sit beside
 * thin-line drawings: the first screen is an axonometric plan of the three halls, the 3D option lays a glass lens on it.
 *
 * The blocks (product director, pd.md §2; the four extras carry data-plus): 01 the first screen · 02 the halls and
 * prices · 03 + what the rent includes · 04 why people trust us (the numbers) · 05 + the guests' shots · 06 how to
 * book · 07 + the reviews · 08 + who meets you · 09 the questions · 10 the booking and contacts; then the footer.
 * Every fact is the studio's own copy (c.studio); new lines are { uk, ru } pairs in T below. No faces, no names:
 * the reviews are placeholders signed «Ваш клієнт», number groups carry «Дані умовні».
 *
 * Components (behaviour rebuilt in vanilla JS + WAAPI; no code copied from 21st.dev, which we never downloaded):
 *   ReactBits (reactbits.dev, David Haz, MIT + Commons Clause, notice below; ideas and mechanics ported):
 *     LineSidebar (the left rail of ten sheets with its proximity shift), StaggeredMenu (the phone's full-sheet menu:
 *     two coloured layers, then the items rising one after another), StrokeText (the headline draws its outline, then
 *     floods with graphite), Counter (each digit a window over a column 0–9).
 *   21st.dev (rebuilt from the public demos only; author · licence):
 *     Filmstrip Scrub (@rmahammad/filmstrip-scrub · Mehi · MIT) → the halls: hover a room on the plan, a row, or scrub
 *       the strip of ticks; the large photo crossfades and the Plex caption follows (no idle auto-scrub);
 *     Feature Tab Switcher (@mohammadshehadeh/feature-11 · Mohammad Shehadeh · MIT) → what the rent includes: a vertical
 *       tab list with a photo or drawing panel, arrow keys once the list has been clicked;
 *     Vertical How It Works (@ln-dev7/how-it-works-02 · LN · MIT) → four steps on a dashed rail (the plan's hidden line);
 *     Horizontal Depth Fade (@unlumen/horizontal-depth-fade · unlumen · MIT) → the guests' shots: a scroll-snap strip,
 *       the centre frame sharp, the others at .45 opacity and .94 scale, no blur;
 *     Single Voice Spotlight Testimonial (@olewandowski1/testimonials-2 · Oliver · MIT-0) → one large quote, a 01/02/03
 *       switch, no metrics, initials instead of a portrait;
 *     Two-Column FAQ (@ln-dev7/faqs-02 · LN · MIT) → the intro and a contact card on the left, the accordion on the right;
 *     Appointment Booking Split (@olewandowski1/booking-2 · Oliver · MIT-0) → the booking: the site plan on the left, the
 *       hall, the day, the name and the phone on the right;
 *     Kiln Wordmark Footer (@kedhareswer/kiln-wordmark-footer · Kedhareswer Naidu · MIT) → a huge lowercase «ваш бренд»
 *       cut by the bottom edge, the disc-and-slab backdrop replaced by the plan grid;
 *     Lens Card (@rmahammad/lens-card · Mehi · MIT), Prism Hero (@bevelui/prism-hero · BEVEL UI · MIT) and ReactBits
 *       FluidGlass: technique references for the 3D lens only.
 *   Our own: the axonometric plan, the drawings, the dimension lines, the site plan, the lens's ray tracer.
 *
 * Round 7 (15 Oct 2026): more premium motion, each in the drawing's language, once per action, nothing at rest, the
 * final frame under reduced motion. ReactBits (MIT + Commons Clause, notice below; mechanics ported to WAAPI):
 *     ClickSpark (a click throws eight
 *     drafting ticks) · TargetCursor (as a CAD selection: four corner brackets glide to the card under the pointer) ·
 *     Crosshair (hairlines follow the pointer over the plan, a hall's tag prints, a click opens it) · PixelTransition
 *     (the plan grid's cells cover and uncover the hall photos) · Counter (the rate rolls 900 → 700 → 600) ·
 *     DecryptedText (mono captions print themselves: the hall, the tab, the swatch, the rail's sheet) · SplitText
 *     (each heading's words rise out of their masks) · VariableProximity (the footer's «ваш бренд» swells 300 → 700).
 *   Our own: the booking's approval stamp (the form's sent state), the tab panels pulled in under a hairline, the
 *   phone menu sliding back out.
 * Round 10 (15 Oct 2026, the owner: no magnetic buttons): one drawn button for the primary, the secondary and the
 *   header ones (pbtn): ReactBits StarBorder (reactbits.dev/animations/star-border, David Haz, MIT + Commons Clause,
 *   notice below) ported as its idea only: the light that travels the exact outline becomes a sage nib that runs once
 *   round the button on hover while a graphite hairline frame draws itself behind it (CSS offset-path + SVG
 *   stroke-dashoffset; no loop, no stardust); with it, our own fill that wipes in from the arrow's side and the arrow
 *   that rolls through its box. The text links redraw their underline. A finger's press plays the same once.
 *   The visitor's hands (engine of 15 Oct): every link scrolls the sample to its sheet (ctx.scrollTo): the rail, the
 *   menu, the logo, «Забронювати» → the form, «Забронювати цей зал» → the form with that hall chosen, the plan's
 *   halls → the halls; the rail and the menu follow by IntersectionObserver on ctx.viewport; the scripted swatches
 *   stop once the visitor takes the sample (ctx.onUser); a sideways finger on the strip or the scrub stays theirs.
 *
 * 3D (opts.three / ctx.three): a thick biconvex glass lens with an inked edge lying on the hero's plan. three.js (r186
 * core) only as the WebGL frame: one full-canvas quad whose fragment shader traces each pixel through the lens
 * analytically (two spheres and a cylinder, exact Fresnel, three refractive indices for the colour fringe) down to the
 * sheet, which is the plan itself drawn once into a texture from the same geometry: inside the lens the plan's lines
 * bend and magnify for real, outside it the canvas is transparent and the HTML plan shows through. The contact shadow
 * and the caustic are CSS layers. It slides 4cqw onto «ЗАЛ A» once, can be dragged with a mouse, and renders only
 * while it moves; a phone and reduced motion get one still frame.
 *
 * build(H, c, data, e, opts) → the inner HTML of .pv-site (css/sites-pv-n-plus.css, all under .pv-site--n.pv-n-plus).
 * enhance(site, ctx): the interactions above, each block's one-time entrance (on entering the frame), the lens.
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
export const meta = { theme: 'light', cube: 'light', bg: '#eae4da' };
export const object3d = true;

// (lead, 15 Oct) phones get the 640-px copies in m/: a phone frame never shows a photo wider than that, and the
// full-size ones decoded together outgrow a phone browser's memory
const PH = typeof matchMedia === 'function' && matchMedia('(max-width: 700px)').matches ? '/img/sites/photos/plus/m/' : '/img/sites/photos/plus/';
const MAIL = 'hello@vash-sait.ua';
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DRAW = 'cubic-bezier(0.16, 1, 0.3, 1)';
const INK = '#1e1e1c', SAGE = '#7e8b6a', SAGE_INK = '#56633f', CYC = '#f7f5f1';
const pad = (n) => String(n).padStart(2, '0');
const r1 = (n) => Math.round(n * 10) / 10;

/* ---------- the interface's own words (the rest is the studio's copy) ---------- */
const T = {
  railEn: ['Studio', 'Studios', 'Included', 'Numbers', 'Shots', 'Booking', 'Reviews', 'Team', 'Questions', 'Request'],
  rail: { uk: ['Студія', 'Зали', 'У ціні', 'Цифри', 'Кадри', 'Бронь', 'Відгуки', 'Команда', 'Питання', 'Заявка'],
    ru: ['Студия', 'Залы', 'В цене', 'Цифры', 'Кадры', 'Бронь', 'Отзывы', 'Команда', 'Вопросы', 'Заявка'] },
  sheet: { uk: 'Арк.', ru: 'Лист' },
  h1: { uk: ['Оберіть *фон.*', 'Усе інше вже в студії.'], ru: ['Выберите *фон.*', 'Всё остальное уже в студии.'] },
  h1en: ['Pick a *backdrop.*', 'Everything else is here.'],
  sub: { uk: 'Три зали з денним світлом на Подолі. Від 600 ₴ за годину.', ru: 'Три зала с дневным светом на Подоле. От 600 ₴ в час.' },
  suben: 'Three daylight studios on Podil. From ₴600 an hour.',
  bg: { uk: 'Фон', ru: 'Фон' },
  sw: { uk: ['Білий', 'Бетон', 'Чорний', 'Шавлія', 'Пісок', 'Глина'], ru: ['Белый', 'Бетон', 'Чёрный', 'Шалфей', 'Песок', 'Глина'] },
  plan: { uk: 'План залів', ru: 'План залов' },
  halls3: { uk: '3 зали', ru: '3 зала' },
  photo: { uk: 'Студія · загальний вигляд', ru: 'Студия · общий вид' },
  hallBtn: { uk: 'Забронювати цей зал', ru: 'Забронировать этот зал' },
  hall: { uk: 'Зал', ru: 'Зал' },
  incl: { uk: 'У ціні', ru: 'В цене' },
  assist: { uk: 'Асистент зі світлом', ru: 'Ассистент со светом' },
  lightPlan: { uk: ['Світло', 'Відбивач', 'Камера'], ru: ['Свет', 'Отражатель', 'Камера'] },
  trustK: { uk: 'Чому нам вірять', ru: 'Почему нам верят' },
  trustT: { uk: 'Працюємо на Подолі з 2016 року', ru: 'Работаем на Подоле с 2016 года' },
  since: { uk: ['з', 'на Подолі'], ru: ['с', 'на Подоле'] },
  cond: { uk: 'Дані умовні', ru: 'Данные условные' },
  revs: { uk: 'Відгуки клієнтів', ru: 'Отзывы клиентов' },
  all: { uk: 'Усі', ru: 'Все' },
  sets: { uk: ['дзеркало й крісло режисера', 'крісло й низький стіл', 'три стільці на хутрі', 'прозорий стілець і дзеркальний куб', 'полиці з керамікою', 'лаунж на антресолі'],
    ru: ['зеркало и кресло режиссёра', 'кресло и низкий стол', 'три стула на меху', 'прозрачный стул и зеркальный куб', 'полки с керамикой', 'лаунж на антресоли'] },
  quote: { uk: 'Тут буде відгук вашого клієнта', ru: 'Здесь будет отзыв вашего клиента' },
  client: { uk: 'Ваш клієнт', ru: 'Ваш клиент' },
  ini: { uk: 'ВК', ru: 'ВК' },
  meetK: { uk: 'У студії', ru: 'В студии' },
  meetT: { uk: 'Хто вас зустріне в студії', ru: 'Кто встретит вас в студии' },
  meetP: { uk: 'Адміністратор покаже зали й гримерку. Асистент допоможе виставити світло, навіть якщо ви прийшли вперше.',
    ru: 'Администратор покажет залы и гримёрку. Ассистент поможет выставить свет, даже если вы пришли впервые.' },
  roles: { uk: [['Адміністратор', 'Покаже зали й гримерку'], ['Асистент зі світлом', 'Допоможе виставити світло']],
    ru: [['Администратор', 'Покажет залы и гримёрку'], ['Ассистент со светом', 'Поможет выставить свет']] },
  faq: { uk: [['Скільки коштує година оренди?', 'Від 600 до 900 ₴. Ціна залежить від залу.'],
    ['Чи потрібна передоплата?', 'Так, 30%. Решту платите в день зйомки.'],
    ['Як забронювати зал?', 'Залиште заявку. Відповімо за 15 хвилин і підберемо зал і час.'],
    ['Яка площа залів?', 'Південь 80 м², Графіт 60 м², Мансарда 40 м².'],
    ['Чи можна знімати відео?', 'Так. Зал «Графіт» з темними стінами підходить для відео.']],
  ru: [['Сколько стоит час аренды?', 'От 600 до 900 ₴. Цена зависит от зала.'],
    ['Нужна ли предоплата?', 'Да, 30%. Остальное в день съёмки.'],
    ['Как забронировать зал?', 'Оставьте заявку. Ответим за 15 минут и подберём зал и время.'],
    ['Какая площадь залов?', 'Юг 80 м², Графит 60 м², Мансарда 40 м².'],
    ['Можно ли снимать видео?', 'Да. Зал «Графит» с тёмными стенами подходит для видео.']] },
  ask: { uk: 'Не знайшли відповідь?', ru: 'Не нашли ответ?' },
  bookK: { uk: 'Заявка', ru: 'Заявка' },
  date: { uk: 'Дата', ru: 'Дата' },
  days: { uk: ['Сьогодні', 'Завтра', 'Інша дата'], ru: ['Сегодня', 'Завтра', 'Другая дата'] },
  sent: { uk: 'Заявку надіслано', ru: 'Заявка отправлена' },
  street: { uk: 'вул. Межигірська', ru: 'ул. Межигорская' },
  park: { uk: 'Парковка', ru: 'Парковка' },
  nav: { uk: 'Навігація', ru: 'Навигация' },
  menu: { uk: 'Меню', ru: 'Меню' },
  sheets: { uk: 'Перелік аркушів', ru: 'Перечень листов' },
  back: { uk: 'Аркуш 01', ru: 'Лист 01' },
  perHour: { uk: 'Ціна за годину', ru: 'Цена за час' },
  scr: 'АБВГДЕЄЖЗИІКЛМНОПРСТУФХЦЧШЮЯ0123456789·+/×−',
};

/* ---------- little marks ---------- */
const svg = (vb, body, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="${vb}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
// the logo: a plan's door symbol (a leaf and its swing) inside a square room
const MARK = svg('0 0 24 24', '<rect x="3" y="3" width="18" height="18" stroke-width="1.6"/><path d="M8 21V12" stroke-width="1.6"/><path d="M8 12a9 9 0 0 1 9 9" stroke-width="1.1"/>');
const ARROW = svg('0 0 24 24', '<path d="M4.5 12h15M13.5 6l6 6-6 6" stroke-width="1.6"/>');
const TICK = svg('0 0 24 24', '<path pathLength="1" d="m5 12.5 4.5 4.5L19 7.5" stroke-width="1.8"/>');
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
const ICO = {
  phone: svg('0 0 24 24', '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" stroke-width="1.4"/>'),
  pin: svg('0 0 24 24', '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" stroke-width="1.4"/><circle cx="12" cy="10" r="2.3" stroke-width="1.4"/>'),
  mail: svg('0 0 24 24', '<rect x="3.5" y="5.5" width="17" height="13" stroke-width="1.4"/><path d="m4 7 8 6 8-6" stroke-width="1.4"/>'),
  clock: svg('0 0 24 24', '<circle cx="12" cy="12" r="8.5" stroke-width="1.4"/><path d="M12 7.5V12l3 2" stroke-width="1.4"/>'),
  ig: svg('0 0 24 24', '<rect x="4" y="4" width="16" height="16" rx="4.5" stroke-width="1.4"/><circle cx="12" cy="12" r="3.6" stroke-width="1.4"/>'),
  tg: svg('0 0 24 24', '<path d="M20.5 4.5 3.5 11.2l5.6 2 2 5.8 3-3.6 4.6 3.4z" stroke-width="1.4"/>'),
  fb: svg('0 0 24 24', '<path d="M14 21v-8h3l.5-3.5H14V7.8c0-1 .3-1.8 1.8-1.8h1.8V3a24 24 0 0 0-2.6-.1c-2.6 0-4.4 1.6-4.4 4.5v2.1h-3V13h3v8" stroke-width="1.4"/>'),
  prev: svg('0 0 24 24', '<path d="M19.5 12h-15M10.5 6l-6 6 6 6" stroke-width="1.5"/>'),
  next: svg('0 0 24 24', '<path d="M4.5 12h15M13.5 6l6 6-6 6" stroke-width="1.5"/>'),
};
// the six backdrop papers («Фони 6 кольорів»): the studio's fact, the colours ours
const SWATCH = ['#f4f2ee', '#b8b3aa', '#2a2a28', '#7e8b6a', '#d8c6a6', '#b07f68'];

/* ==========================================================================
   The plan: the three halls in a plan oblique (45°), 440 × 460 units. One geometry feeds the HTML drawing (classes:
   the lines draw, the fills arrive) and the lens's texture (the same drawing with its colours written in).
   ========================================================================== */
const VB = [440, 460];
// the halls' tags on the floor (u, v): A in front of the backdrop, B by the door, C beside the roof's edge
const TAGS = [[3.2, 4.4], [10.6, 3.4], [16.2, 5]];
// C's label stands outside its wall, on a leader (the room is narrow on the drawing)
const TAG_LX = [0, 0, 346];
const KX = 10.96, KZ = 12.6, OX = 64, OY = 188;
const P = (u, v, z = 0) => [OX + (u + v) * KX, OY + (u - v) * KX - z * KZ];
const M = (...p) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('');
const Z = (...p) => `${M(...p)}Z`;
const Q = (c, e) => `Q${r1(c[0])} ${r1(c[1])} ${r1(e[0])} ${r1(e[1])}`;
const C3 = (a, b, e) => `C${r1(a[0])} ${r1(a[1])} ${r1(b[0])} ${r1(b[1])} ${r1(e[0])} ${r1(e[1])}`;
// the plan's labels (Plex), the same in the SVG and in the texture: [x, y, text, size, anchor, weight, rotate]
function planModel(L, hallNames) {
  const H = 3, Hc = 1.6;
  const shapes = []; // { k: kind, d, g: draw group }
  const add = (k, d, g = 0) => shapes.push({ k, d, g });
  // the sheet: its frame and the grid crosses
  add('frame', 'M8 8H432V452H8Z');
  let cross = '';
  for (let x = 30; x < 430; x += 44) for (let y = 30; y < 450; y += 44) cross += `M${x - 2.5} ${y}h5M${x} ${y - 2.5}v5`;
  add('grid', cross);
  // the floors (fills) and the far walls' faces
  add('floorA', Z(P(0, 0), P(8, 0), P(8, 10), P(0, 10)));
  add('floorB', Z(P(8, 0), P(14, 0), P(14, 10), P(8, 10)));
  add('floorC', Z(P(14, 0), P(18, 0), P(18, 10), P(14, 10)));
  add('wall', Z(P(0, 0), P(0, 10), P(0, 10, H), P(0, 0, H)));
  add('wall', Z(P(0, 10), P(8, 10), P(8, 10, H), P(0, 10, H)));
  add('wallB', Z(P(8, 10), P(14, 10), P(14, 10, H), P(8, 10, H)));
  add('wall', Z(P(14, 10), P(18, 10), P(18, 10, H), P(14, 10, H)));
  // the sun through the three south windows (on the floor of A)
  for (const [a, b] of [[1.2, 3.1], [4.05, 5.95], [6.9, 8.8]]) add('sun', Z(P(0.15, a), P(0.15, b), P(3.4, b - 1.2), P(3.4, a - 1.2)));
  // the backdrop: a paper sweep hung on the back wall of A, its cove and its run on the floor (the swatch colour)
  add('paper', `${M(P(2.4, 10, 2.7), P(6, 10, 2.7), P(6, 10, 0.55))}${Q(P(6, 10, 0), P(6, 9.45, 0))}${M(P(6, 9.45, 0), P(6, 7.3, 0), P(2.4, 7.3, 0), P(2.4, 9.45, 0)).replace(/^M/, 'L')}${Q(P(2.4, 10, 0), P(2.4, 10, 0.55))}Z`, 2);
  // the walls: the floor outline, the far walls full height, the near walls cut low, the partitions half height
  add('line', M(P(0, 0), P(18, 0), P(18, 10), P(0, 10), P(0, 0)), 0);
  add('line', M(P(0, 0, H), P(0, 10, H), P(18, 10, H)), 0);
  add('line', M(P(0, 0), P(0, 0, H)) + M(P(0, 10), P(0, 10, H)) + M(P(18, 10), P(18, 10, H)), 0);
  add('thin', M(P(8, 10), P(8, 10, H)) + M(P(14, 10), P(14, 10, H)), 1);
  add('line', M(P(0, 0, 0.32), P(10, 0, 0.32)) + M(P(11.6, 0, 0.32), P(18, 0, 0.32), P(18, 10, 0.32)) + M(P(18, 0), P(18, 0, 0.32)), 1);
  for (const u of [8, 14]) add('line', M(P(u, 0), P(u, 0, Hc), P(u, 3.4, Hc), P(u, 3.4)) + M(P(u, 5.2), P(u, 5.2, Hc), P(u, 10, Hc)), 1);
  // the three windows of A (south), each with its mullion
  for (const [a, b] of [[1.2, 3.1], [4.05, 5.95], [6.9, 8.8]]) add('thin', Z(P(0, a, 0.8), P(0, b, 0.8), P(0, b, 2.6), P(0, a, 2.6)) + M(P(0, (a + b) / 2, 0.8), P(0, (a + b) / 2, 2.6)), 2);
  // the backdrop's outline and its roll
  add('thin', `${M(P(2.4, 10, 2.7), P(2.4, 10, 0.55))}${Q(P(2.4, 10, 0), P(2.4, 9.45, 0))}${M(P(2.4, 9.45, 0), P(2.4, 7.3, 0), P(6, 7.3, 0), P(6, 9.45, 0)).replace(/^M/, 'L')}${Q(P(6, 10, 0), P(6, 10, 0.55))}`, 2);
  add('roll', M(P(2.1, 10, 2.86), P(6.3, 10, 2.86)), 2);
  // B: the softbox on its stand (a pyramid facing the set) and the tripod
  const sb = [10.2, 7.6];
  add('thin', M(P(sb[0], sb[1], 0.5), P(sb[0], sb[1], 2.05)) + M(P(sb[0], sb[1], 0.5), P(sb[0] - 0.6, sb[1] - 0.5)) + M(P(sb[0], sb[1], 0.5), P(sb[0] + 0.6, sb[1] - 0.1)) + M(P(sb[0], sb[1], 0.5), P(sb[0] - 0.1, sb[1] + 0.7)), 2);
  const face = [P(sb[0] - 0.1, sb[1] - 1, 1.55), P(sb[0] - 0.1, sb[1] + 1, 1.55), P(sb[0] - 0.1, sb[1] + 1, 2.75), P(sb[0] - 0.1, sb[1] - 1, 2.75)];
  const back = P(sb[0] + 0.9, sb[1], 2.15);
  add('box', Z(...face), 2);
  add('thin', Z(...face) + face.map((p) => M(p, back)).join(''), 2);
  // C: the sloping roof and its two skylights (overhead: dashed)
  const zr = (v) => 1.5 + ((v - 3) * (H - 1.5)) / 7;
  add('hidden', M(P(14, 10, H), P(14, 3, 1.5), P(18, 3, 1.5), P(18, 10, H)), 3);
  for (const [u0, u1] of [[14.6, 15.8], [16.3, 17.5]]) add('hidden', Z(P(u0, 5.2, zr(5.2)), P(u1, 5.2, zr(5.2)), P(u1, 7.6, zr(7.6)), P(u0, 7.6, zr(7.6))), 3);
  // the entrance: a gap in B's near wall and the door's swing
  const d0 = P(10, 0), k = 0.5523 * 1.6;
  add('thin', `${M(P(11.6, 0), d0, P(10, 1.6))}`, 2);
  add('swing', `M${r1(P(11.6, 0)[0])} ${r1(P(11.6, 0)[1])}${C3(P(11.6, k), P(10 + k, 1.6), P(10, 1.6))}`, 2);
  // the dimension lines along the near side: the halls, then the whole studio
  const dim = (v, us) => {
    let d = M(P(us[0], v), P(us[us.length - 1], v));
    for (const u of us) { const [x, y] = P(u, v); d += `M${r1(x - 4.2)} ${r1(y)}h8.4`; }
    return d;
  };
  add('dim', dim(-1.5, [0, 8, 14, 18]), 3);
  add('dim', dim(-3.1, [0, 18]), 3);
  let ext = '';
  for (const u of [0, 8, 14, 18]) ext += M(P(u, -0.45), P(u, u % 18 ? -2 : -3.6));
  add('ext', ext, 3);
  // the north arrow (north lies along +u: the windows face south)
  add('thin', 'M44 46m-13 0a13 13 0 1 0 26 0a13 13 0 1 0-26 0', 3);
  add('north', 'M44 46l9.2 9.2-12.6-3.4z', 3);
  // the title block
  add('thin', 'M286 404H432M286 404V452M372 404V452M286 428H372', 3);
  add('tags', TAGS.map(([u, v]) => { const [x, y] = P(u, v); return `M${r1(x - 8.5)} ${r1(y)}a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0`; }).join(''), 3);
  { const [x, y] = P(...TAGS[2]); add('thin', `M${r1(x + 8.5)} ${r1(y)}H${TAG_LX[2] - 5}`, 3); }
  // the labels
  const up = (t) => String(t).toUpperCase();
  const labels = [];
  ['A', 'B', 'C'].forEach((ch, i) => {
    const [x, y] = P(...TAGS[i]);
    labels.push([x, y + 3.6, ch, 10, 'middle', 500, 0, 'tag']);
    const lx = TAG_LX[i] || x + 12.5;
    labels.push([lx, y - 0.6, up(hallNames[i]), 8.6, 'start', 400, 0]);
    labels.push([lx, y + 9.6, `${[80, 60, 40][i]} М²`, 8.6, 'start', 400, 0, 'mute']);
  });
  const along = (u, v, t, off = 3.4) => { const [x, y] = P(u, v); return [x + off * 0.7071, y - off * 0.7071, t, 8, 'middle', 400, 45]; };
  labels.push(along(4, -1.5, '80 М²'), along(11, -1.5, '60 М²'), along(16, -1.5, '40 М²'), along(9, -3.1, '180 М²'));
  labels.push([44, 75, 'N', 8.6, 'middle', 500, 0]);
  labels.push([292, 420, up(T.plan[L]), 8, 'start', 500, 0]);
  labels.push([292, 444, `180 М² · ${up(T.halls3[L])}`, 7.4, 'start', 400, 0, 'mute']);
  labels.push([402, 439, '01', 19, 'middle', 300, 0, 'disp']);
  return { shapes, labels };
}
// the kinds: [class, texture style]
const KIND = {
  frame: ['pp-frame', { stroke: INK, 'stroke-opacity': 0.4, 'stroke-width': 0.7 }],
  grid: ['pp-grid', { stroke: INK, 'stroke-opacity': 0.22, 'stroke-width': 0.6 }],
  floorA: ['pp-fill pp-floor', { fill: '#efe9df' }],
  floorB: ['pp-fill pp-floor pp-floor--b', { fill: '#e2ddd3' }],
  floorC: ['pp-fill pp-floor pp-floor--c', { fill: '#ece7dd' }],
  wall: ['pp-fill pp-wall', { fill: '#ede8df' }],
  wallB: ['pp-fill pp-wall pp-wall--b', { fill: '#a9a49b' }],
  sun: ['pp-fill pp-sun', { fill: '#fbf9f4', 'fill-opacity': 0.85 }],
  paper: ['pp-fill pp-paper', { fill: 'var(--sw)' }],
  line: ['pp-line', { stroke: INK, 'stroke-width': 1.15 }],
  thin: ['pp-line pp-thin', { stroke: INK, 'stroke-width': 0.7 }],
  roll: ['pp-line pp-roll', { stroke: INK, 'stroke-width': 2.6 }],
  box: ['pp-fill pp-box', { fill: CYC }],
  hidden: ['pp-hidden', { stroke: INK, 'stroke-width': 0.7, 'stroke-dasharray': '4 3' }],
  swing: ['pp-line pp-thin pp-swing', { stroke: INK, 'stroke-width': 0.6, 'stroke-opacity': 0.6 }],
  dim: ['pp-line pp-dim', { stroke: INK, 'stroke-width': 0.6 }],
  ext: ['pp-line pp-ext', { stroke: INK, 'stroke-width': 0.45, 'stroke-opacity': 0.55 }],
  north: ['pp-fill pp-north', { fill: SAGE }],
  tags: ['pp-line pp-tag', { stroke: INK, 'stroke-width': 0.8, fill: CYC }],
};
const LBL = { tag: [INK, 'Plex'], mute: ['rgba(30,30,28,0.62)', 'Plex'], disp: [INK, 'Unbounded'] };
function planSVG(model, { tex = false, sw = SWATCH[0] } = {}) {
  const attrs = (o) => Object.entries(o).map(([k, v]) => `${k}="${k === 'fill' && v === 'var(--sw)' ? sw : v}"`).join(' ');
  const shapes = model.shapes.map(({ k, d, g }) => {
    const [cls, st] = KIND[k];
    if (tex) return `<path d="${d}" ${attrs({ fill: 'none', ...st })}/>`;
    const draw = /pp-line/.test(cls) && !/pp-tag/.test(cls);
    return `<path class="${cls}" data-g="${g}" d="${d}"${draw ? ' pathLength="1"' : ''}/>`;
  }).join('');
  if (tex) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB[0]} ${VB[1]}" width="${VB[0]}" height="${VB[1]}"><rect width="${VB[0]}" height="${VB[1]}" fill="${CYC}"/>${shapes}</svg>`;
  const text = model.labels.map(([x, y, t, s, a, w, rot, kind]) => `<text class="pp-t${kind ? ` pp-t--${kind}` : ''}" x="${r1(x)}" y="${r1(y)}" font-size="${s}" text-anchor="${a}"${rot ? ` transform="rotate(${rot} ${r1(x)} ${r1(y)})"` : ''}>${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`).join('');
  return `<svg class="pp" viewBox="0 0 ${VB[0]} ${VB[1]}" aria-hidden="true">${shapes}${text}</svg>`;
}

/* ---------- the small drawings (what the rent includes; 400 × 300, graphite on cyc white) ---------- */
const sheetGrid = () => { let d = ''; for (let x = 20; x < 400; x += 40) for (let y = 20; y < 300; y += 40) d += `M${x - 2} ${y}h4M${x} ${y - 2}v4`; return `<path class="pd-grid" d="${d}"/>`; };
const dl = (d, cls = '') => `<path class="pd-l${cls}" pathLength="1" d="${d}"/>`;
const DRAWINGS = {
  // the make-up table: a mirror framed with bulbs, a counter, a stool
  makeup: (L) => `${sheetGrid()}${dl('M120 56H280V176H120Z')}${dl('M132 68H268V164H132Z', ' pd-l--t')}${Array.from({ length: 6 }, (_, i) => `<circle class="pd-b" cx="${126 + i * 29.6}" cy="50" r="5"/><circle class="pd-b" cx="${126 + i * 29.6}" cy="182" r="5"/>`).join('')}${dl('M86 192H314M96 192V262M304 192V262M96 214H304', '')}${dl('M178 262v-34h44v34M172 228h56', ' pd-l--t')}<path class="pd-sage" d="M150 150c18-30 46-40 70-22"/>`,
  // the steamer: the tank, the pole, the hanger and the head; a rail with three hangers
  steam: () => `${sheetGrid()}${dl('M110 250h60v-30h-60zM140 220V86M118 86h44')}${dl('M140 86c0-10 6-16 14-18M154 68c10 0 18 8 18 18v8')}${dl('M172 94c0 12-8 18-16 22M150 210c-16-8-26-22-24-40', ' pd-l--t')}${dl('M210 70H330M222 70v186M318 70v186M214 256h16M310 256h16')}${[240, 270, 300].map((x) => dl(`M${x} 70v8M${x - 14} 92l14-14 14 14M${x - 14} 92h28`, ' pd-l--t')).join('')}<path class="pd-sage" d="M128 64c-6-8 6-12 0-20M140 58c-6-8 6-12 0-20"/>`,
  // the parking: bays on a site plan, the P sign and the way to the door
  park: (L) => `${sheetGrid()}${dl('M40 70H360M40 230H360')}${[70, 120, 170, 220].map((x) => dl(`M${x} 70V140`, ' pd-l--t')).join('')}${dl('M70 140H270', ' pd-l--t')}${[95, 145, 195, 245].map((x) => dl(`M${x - 18} 84l36 42`, ' pd-l--h')).join('')}<rect class="pd-sage-f" x="282" y="80" width="56" height="56"/><text class="pd-p" x="310" y="122" text-anchor="middle">P</text>${dl('M150 178H318V210', ' pd-l--d')}<rect class="pd-door" x="300" y="210" width="36" height="20"/><text class="pd-t" x="60" y="200">${T.park[L].toUpperCase()}</text>`,
  // the light plan: the subject, the key light at 45° with its beam, the reflector, the camera
  light: (L) => {
    const [l1, l2, l3] = T.lightPlan[L].map((x) => x.toUpperCase());
    return `${sheetGrid()}<circle class="pd-sage-f" cx="200" cy="150" r="20"/>${dl('M200 150m-20 0a20 20 0 1 0 40 0a20 20 0 1 0-40 0')}${dl('M86 62l44-22 22 44-44 22z')}${dl('M130 84 182 136M120 104 184 146', ' pd-l--d')}${dl('M288 96c26 22 30 72 6 104', '')}${dl('M178 262h44v-28h-44zM190 234v-12h20v12', '')}${dl('M200 222V176', ' pd-l--d')}<text class="pd-t" x="60" y="136">${l1}</text><text class="pd-t" x="306" y="152">${l2}</text><text class="pd-t" x="234" y="262">${l3}</text>`;
  },
};

// «900 ₴/год» → ['900', '₴/год']
const price = (p) => { const m = /^([\d\s]+?)\s*(\D.*)$/.exec(String(p)); return m ? [m[1].replace(/\s/g, ''), m[2]] : [String(p), '']; };
// PixelTransition's grid over the halls' photo (columns × rows)
const PXC = 12, PXR = 8;

/* ---------- the numbers: Counter's digit windows (the final digits sit in place without JS) ---------- */
const digits = (t) => [...String(t)].map((ch) => (/\d/.test(ch)
  ? `<span class="pn-dg" style="--v:${ch}"><span class="pn-dg__f">${ch}</span><span class="pn-dg__c">${'0123456789'.split('').map((d) => `<i>${d}</i>`).join('')}</span></span>`
  : `<span class="pn-dg__s">${ch === ' ' ? '&nbsp;' : ch}</span>`)).join('');

export function build(H, c, data, e, opts = {}) {
  const s = data;
  if (!s || !s.halls?.length || !s.services?.length || !s.steps?.length || !s.stats?.length) return '';
  const { esc, lx } = H;
  const L = opts.lang === 'ru' ? 'ru' : 'uk';
  const t = (k) => T[k][L];
  const P2 = s.plus || {}, f = s.footer || {};
  const three = !!opts.three;
  const up = (x) => esc(String(x).toUpperCase());
  const names = s.halls.map(([n]) => n);
  // a heading whose last n words are the key (sage)
  // (SplitText: each word in its own mask, risen once on entry)
  const wm = (x) => String(x).split(/\s+/).filter(Boolean).map((w) => `<span class="pn-wm"><span>${esc(w)}</span></span>`).join(' ');
  const key = (text, n = 1) => { const w = String(text).split(/\s+/); return `${wm(w.slice(0, -n).join(' '))} <em class="pn-key">${wm(w.slice(-n).join(' '))}</em>`; };
  // the drawn button (StarBorder's outline trace, as a hairline frame that draws itself once on hover with a sage nib
  // running ahead of it; the fill wipes in from the arrow's side; the arrow rolls through its box). One markup for
  // the primary (graphite), the secondary (--line) and the small header one (--sm)
  const pbtn = (label, mod = '', attrs = '') => `<span class="pn-btn${mod}"${attrs}><i class="pn-btn__fill" aria-hidden="true"></i>`
    + `<span class="pn-btn__frm" aria-hidden="true"><svg><rect pathLength="1" width="100%" height="100%"/></svg><i class="pn-btn__nib"></i></span>`
    + `<span class="pn-btn__t">${label}</span><b class="pn-btn__ar" aria-hidden="true"><span class="pn-roll">${ARROW}${ARROW}</span></b></span>`;
  // where the menu's links lead: Зали, Ціни → the halls; Роботи → the shots; Контакти → the booking
  const NAVGO = [2, 2, 5, 10];
  // each block opens like a sheet of the set: its number, its label, a rule, «Арк. 03 / 10»
  const head = (n, kick) => `<div class="pn-head" data-in><span class="pn-head__n">${pad(n)}</span><span class="pn-head__k">${esc(kick)}</span><i class="pn-head__r"></i><span class="pn-head__s">${esc(t('sheet'))} ${pad(n)} / 10</span></div>`;
  const dimLine = (label, cls = '') => `<span class="pn-dim${cls}" aria-hidden="true"><i class="pn-dim__l"></i>${label ? `<b>${label}</b>` : ''}</span>`;

  /* ---------- the header, the rail, the phone's menu ---------- */
  const logo = `<span class="pn-logo" data-go="1"><i class="pn-logo__m">${MARK}</i><b>${esc(c.brand)}</b></span>`;
  // the header as a drawing's title strip: the lockup | the menu with its sheet references | the language and the
  // button; along its foot the scale bar of the ten sheets (read so far in graphite, the current one in sage)
  const header = `<header class="pv-hdr pn-hdr">
      <span class="pn-logo pn-logo--hdr" data-go="1"><i class="pn-logo__m">${MARK}</i><span class="pn-logo__t"><b>${esc(c.brand)}</b><small>${esc(s.studioLabel)} · ${esc(s.meta[0])}</small></span></span>
      <nav class="pn-nav">${s.nav.map((x, i) => `<span class="pn-nav__i" data-go="${NAVGO[i]}" data-nav="${i}"><span class="pn-nav__l">${lx(x, e?.nav?.[i])}</span><sup class="pn-nav__r">${pad(NAVGO[i])}</sup></span>`).join('')}</nav>
      <div class="pn-hdr__r">${e ? '<span class="pv-lang" aria-hidden="true"><b class="pv-lang__a">UA</b><b class="pv-lang__b">EN</b></span>' : ''}${pbtn(lx(s.cta, e?.cta), ' pn-btn--sm pn-cta', ' data-go="10"')}
        <span class="pn-cta-i" data-go="10" aria-hidden="true"><span class="pn-roll">${ARROW}${ARROW}</span></span><span class="pn-burger" data-burger aria-hidden="true"><i></i><i></i></span></div>
      <span class="pn-scale" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i data-go="${i + 1}" data-sc="${i + 1}"${i ? '' : ' class="is-on"'}></i>`).join('')}</span>
    </header>`;
  const rail = `<nav class="pn-rail" aria-hidden="true" data-rail><ol>${t('rail').map((x, i) => `<li class="pn-rail__i${i ? '' : ' is-on'}" data-r="${i + 1}" data-go="${i + 1}"><i class="pn-rail__t"></i><span class="pn-rail__n">${pad(i + 1)}</span></li>`).join('')}</ol>`
    + `<span class="pn-rail__cur">${t('rail').map((x, i) => `<span${i ? '' : ' class="is-on"'} data-r="${i + 1}">${pad(i + 1)} · ${esc(x)}</span>`).join('')}</span></nav>`;
  const menu = `<div class="pn-menu" data-menu aria-hidden="true"><i class="pn-menu__l pn-menu__l--1"></i><i class="pn-menu__l pn-menu__l--2"></i>
      <div class="pn-menu__p"><ol>${t('rail').map((x, i) => `<li data-go="${i + 1}"><span class="pn-menu__n">${pad(i + 1)}</span><span class="pn-menu__t"><span>${lx(x, e ? T.railEn[i] : null)}</span></span></li>`).join('')}</ol>
        <div class="pn-menu__f"><span>${esc(f.phone || '')}</span>${pbtn(lx(s.cta, e?.cta), ' pn-btn--sm pn-btn--full', ' data-go="10"')}</div></div></div>`;

  /* ---------- 01 · the first screen: the headline draws itself, the plan of the halls beside it ---------- */
  const h1Lines = (lines) => lines.map((ln) => `<span class="pn-h1__s">${ln.split(/\s+/).map((w) => (/^\*.*\*$/.test(w) ? `<span class="pn-w pn-w--key">${esc(w.slice(1, -1))}<i class="pn-w__bar" aria-hidden="true"></i></span>` : `<span class="pn-w">${esc(w)}</span>`)).join(' ')}</span>`).join('');
  const h1 = e ? `<span class="pv-lx pv-lx--blk"><span class="pv-lx__a">${h1Lines(t('h1'))}</span><span class="pv-lx__b" lang="en">${h1Lines(T.h1en)}</span></span>` : h1Lines(t('h1'));
  const model = planModel(L, names);
  const lens = three ? `<div class="pn-lens" data-obj data-lens><i class="pn-lens__shadow"></i><i class="pn-lens__caustic"></i><i class="pn-lens__poster"></i><canvas class="pn-lens__gl" aria-hidden="true"></canvas></div>` : '';
  const hero = `<section class="pn-hero" data-blk="1" style="--sw:${SWATCH[0]}">
      <div class="pn-hero__txt">
        <div class="pn-hero__top" data-in><span>${lx(s.eyebrow, e?.eyebrow)}</span></div>
        <h1 class="pn-h1" data-h1>${h1}</h1>
        <p class="pn-sub" data-in>${lx(t('sub'), e ? T.suben : null)}</p>
        <div class="pn-ctas" data-in>${pbtn(lx(s.btn, e?.btn), '', ' data-btn data-go="10"')}<span class="pn-link" data-go="2">${lx(s.btn2, e?.btn2)}</span></div>
        <div class="pn-sw" data-in data-sw><span class="pn-sw__k">${esc(t('bg'))}</span><span class="pn-sw__row">${SWATCH.map((col, i) => `<i class="pn-sw__i${i ? '' : ' is-on'}" data-s="${i}" style="--c:${col}"></i>`).join('')}</span><span class="pn-sw__n">${t('sw').map((n, i) => `<span${i ? '' : ' class="is-on"'}>${esc(n)}</span>`).join('')}</span></div>
        <figure class="pn-hero__ph" data-in>${dimLine(`180 м²`)}<div class="pn-ph"><picture><source media="(max-width: 700px)" srcset="${PH}hero-m.jpg"><img src="${PH}hero.jpg" alt="" decoding="async"></picture></div><figcaption>${up(t('photo'))}</figcaption></figure>
      </div>
      <div class="pn-plan" data-plan>${planSVG(model)}${lens}<i class="pn-xh pn-xh--h" aria-hidden="true"></i><i class="pn-xh pn-xh--v" aria-hidden="true"></i><span class="pn-xh__t" aria-hidden="true"></span></div>
    </section>`;

  /* ---------- 02 · the halls: the plan, the rows and the strip of ticks drive one large photo ---------- */
  const hallImg = ['hall-south', 'hall-graphite', 'hall-attic'];
  const LET = ['A', 'B', 'C'];
  const mini = `<svg class="pn-mini" viewBox="0 0 184 104" aria-hidden="true">${[[2, 80], [82, 60], [142, 40]].map(([x, w], i) => `<g class="pn-mini__r${i ? '' : ' is-on'}" data-h="${i}"><rect x="${x}" y="2" width="${w}" height="100"/><text x="${x + w / 2}" y="58" text-anchor="middle">${LET[i]}</text></g>`).join('')}<path class="pn-mini__w" d="M2 18v14M2 45v14M2 72v14"/><path class="pn-mini__d" d="M104 102h18"/></svg>`;
  const ticks = Array.from({ length: 48 }, (_, k) => `<i style="--k:${k}"></i>`).join('');
  const halls = `<section class="pn-sec pn-halls" data-blk="2" data-halls>
      ${head(2, s.servicesKicker)}
      <h2 class="pn-h2">${key(s.servicesTitle)}</h2>
      <div class="pn-halls__grid">
        <div class="pn-halls__side" data-in>
          ${mini}
          <ol class="pn-halls__list">${s.services.slice(0, 3).map(([n, , p], i) => `<li class="pn-hrow${i ? '' : ' is-on'}" data-h="${i}"><span class="pn-hrow__l">${LET[i]}</span><b>${esc(names[i])}</b><span class="pn-hrow__a">${esc(s.halls[i][1])}</span><span class="pn-hrow__p">${esc(p)}</span></li>`).join('')}</ol>
          <div class="pn-rate"><span class="pn-rate__k" data-rate-k>${up(`${t('hall')} ${LET[0]} · ${t('perHour')}`)}</span><b class="pn-rate__v"><span class="pn-num" data-rate-n>${digits(price(s.services[0][2])[0])}</span><small>${esc(price(s.services[0][2])[1])}</small></b></div>
          ${pbtn(esc(t('hallBtn')), ' pn-btn--line', ' data-book-hall')}
        </div>
        <figure class="pn-halls__view" data-in>
          <div class="pn-halls__ph">${hallImg.map((im, i) => `<img class="${i ? '' : 'is-on'}" data-h="${i}" src="${PH}${im}.jpg" alt="" decoding="async">`).join('')}<div class="pn-px" aria-hidden="true">${'<i></i>'.repeat(PXC * PXR)}</div></div>
          <figcaption class="pn-halls__cap">${s.services.slice(0, 3).map(([n, d, p], i) => `<span class="pn-cap${i ? '' : ' is-on'}" data-h="${i}"><b>${up(`${t('hall')} ${LET[i]} · ${names[i]} · ${s.halls[i][1]} · ${p}`)}</b><span>${esc(H.noArea ? H.noArea(d) : d)}</span></span>`).join('')}</figcaption>
          <div class="pn-scrub" data-scrub style="--at:0"><div class="pn-scrub__t">${ticks}</div><i class="pn-scrub__head"></i><div class="pn-scrub__k">${names.map((n, i) => `<span data-h="${i}"${i ? '' : ' class="is-on"'}>${LET[i]} · ${esc(n)}</span>`).join('')}</div></div>
        </figure>
      </div>
    </section>`;

  /* ---------- 03 + what the rent includes: a vertical tab list, a photo or a drawing ---------- */
  const items = [...s.logos, t('assist')];
  const panels = [
    `<img src="${PH}kit-backdrops.jpg" alt="" decoding="async"><span class="pn-tab__sw">${SWATCH.map((col) => `<i style="--c:${col}"></i>`).join('')}</span>`,
    `<img src="${PH}kit-light.jpg" alt="" decoding="async">`,
    svg('0 0 400 300', DRAWINGS.makeup(L), 'pd'),
    svg('0 0 400 300', DRAWINGS.steam(L), 'pd'),
    svg('0 0 400 300', DRAWINGS.park(L), 'pd'),
    svg('0 0 400 300', DRAWINGS.light(L), 'pd'),
  ];
  const incl = `<section class="pn-sec pn-incl" data-blk="3" data-plus data-tabs>
      ${head(3, s.logosLabel)}
      <h2 class="pn-h2">${key(P2.inclTitle || s.logosLabel, 2)}</h2>
      <div class="pn-incl__grid">
        <ol class="pn-tabs" tabindex="-1" data-tablist>${items.map((x, i) => `<li class="pn-tab${i ? '' : ' is-on'}" data-t="${i}"><span class="pn-tab__n">${pad(i + 1)}</span><b>${esc(x)}</b><span class="pn-tab__ok">${TICK}</span></li>`).join('')}</ol>
        <div class="pn-incl__view" data-in>
          <div class="pn-panels">${panels.map((p, i) => `<div class="pn-panel${i ? '' : ' is-on'}${i > 1 ? ' pn-panel--draw' : ''}" data-p="${i}">${p}</div>`).join('')}</div>
          <div class="pn-incl__cap">${items.map((x, i) => `<span class="${i ? '' : 'is-on'}" data-p="${i}">${pad(i + 1)} · ${up(x)} · ${up(t('incl'))}</span>`).join('')}</div>
        </div>
      </div>
    </section>`;

  /* ---------- 04 · why people trust us: four numbers, each on its dimension line ---------- */
  const st = s.stats;
  const facts = [[st[0][0], st[0][1], st[0][2]], [st[1][0], '', st[1][2]], [st[3][0], st[3][1], st[3][2]], ['2016', '', t('since')[1], t('since')[0]]];
  const trust = `<section class="pn-sec pn-trust" data-blk="4" data-trust>
      ${head(4, t('trustK'))}
      <div class="pn-trust__grid">
        <div class="pn-trust__l" data-in>
          <h2 class="pn-h2">${key(t('trustT'), 2)}</h2>
          <span class="pn-stars pn-stars--go" data-go="7">${STAR.repeat(5)}<b>${esc(t('revs'))}</b></span>
          <span class="pn-cond">${esc(t('cond'))}</span>
        </div>
        <div class="pn-trust__n">${facts.map(([n, u, l, pre]) => `<div class="pn-fact">${dimLine('')}<b class="pn-fact__v">${pre ? `<small class="pn-fact__pre">${esc(pre)}</small>` : ''}<span class="pn-num">${digits(n)}</span>${u ? `<small>${esc(u)}</small>` : ''}</b><span class="pn-fact__l">${esc(l)}</span></div>`).join('')}</div>
      </div>
    </section>`;

  /* ---------- 05 + the guests' shots: a strip with depth, filtered by hall ---------- */
  const setHall = [0, 0, 1, 1, 2, 2];
  const works = `<section class="pn-sec pn-works" data-blk="5" data-plus data-works>
      ${head(5, s.worksKicker)}
      <div class="pn-works__top"><h2 class="pn-h2">${key(s.worksTitle)}</h2>
        <div class="pn-chips" data-in>${[t('all'), ...names].map((x, k) => `<span class="pn-chip${k ? '' : ' is-on'}" data-f="${k - 1}">${esc(x)}</span>`).join('')}</div></div>
      <div class="pn-strip" data-strip><div class="pn-strip__row">${t('sets').map((x, i) => `<figure class="pn-shot" data-h="${setHall[i]}"><div class="pn-shot__ph"><img src="${PH}set-${i + 1}.jpg" alt="" decoding="async" draggable="false"></div><figcaption><b>${up(`${names[setHall[i]]} · ${pad(i + 1)}`)}</b><span>${esc(x)}</span></figcaption></figure>`).join('')}</div></div>
    </section>`;

  /* ---------- 06 · how to book: four steps on the dashed rail ---------- */
  const steps = `<section class="pn-sec pn-steps" data-blk="6" data-steps>
      ${head(6, s.stepsKicker)}
      <div class="pn-steps__grid">
        <div class="pn-steps__l" data-in><h2 class="pn-h2">${key(s.stepsTitle)}</h2><span class="pn-note">${ICO.clock}${esc(s.formNote)}</span></div>
        <ol class="pn-route"><i class="pn-route__rail" aria-hidden="true"></i>${s.steps.map(([a, b], i) => `<li class="pn-stop${i ? '' : ' is-pick'}"><span class="pn-stop__n">${pad(i + 1)}</span><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ol>
      </div>
    </section>`;

  /* ---------- 07 + reviews: one voice at a time (placeholders: the client's review goes here) ---------- */
  const revs = `<section class="pn-sec pn-revs" data-blk="7" data-plus data-revs>
      ${head(7, s.reviewsKicker)}
      <div class="pn-revs__grid">
        <div class="pn-revs__l" data-in>
          <h2 class="pn-h2">${key(s.reviewsTitle)}</h2>
          <span class="pn-stars">${STAR.repeat(5)}<b>${esc(t('revs'))}</b></span>
          <div class="pn-revs__sw"><span class="pn-arr" data-d="-1">${ICO.prev}</span>${[0, 1, 2].map((i) => `<span class="pn-revs__n${i ? '' : ' is-on'}" data-q="${i}">${pad(i + 1)}</span>`).join('')}<span class="pn-arr" data-d="1">${ICO.next}</span></div>
        </div>
        <div class="pn-quote" data-in><i class="pn-crop" aria-hidden="true"></i><span class="pn-quote__m" aria-hidden="true">“</span>
          <div class="pn-quote__c">${[0, 1, 2].map((i) => `<figure class="pn-q${i ? '' : ' is-on'}" data-q="${i}"><p>${esc(t('quote'))}</p><figcaption><i class="pn-ini">${esc(t('ini'))}</i><span><b>${esc(t('client'))}</b> · ${esc(s.services[i][0])}</span></figcaption></figure>`).join('')}</div>
        </div>
      </div>
    </section>`;

  /* ---------- 08 + who meets you ---------- */
  const meet = `<section class="pn-sec pn-meet" data-blk="8" data-plus data-meet>
      ${head(8, t('meetK'))}
      <div class="pn-meet__grid">
        <figure class="pn-meet__ph" data-in><div class="pn-ph"><img src="${PH}meet.jpg" alt="" decoding="async"></div></figure>
        <div class="pn-meet__t">
          <h2 class="pn-h2">${key(t('meetT'), 2)}</h2>
          <p class="pn-p" data-in>${esc(t('meetP'))}</p>
          <div class="pn-roles">${t('roles').map(([r, d], i) => `<div class="pn-role" data-in><span class="pn-role__n">${pad(i + 1)}</span><b>${esc(r)}</b><span>${esc(d)}</span></div>`).join('')}</div>
          <span class="pn-meta" data-in>${s.meta.map(esc).join('<i></i>')}</span>
        </div>
      </div>
    </section>`;

  /* ---------- 09 · questions: the intro and a contact card, the accordion ---------- */
  const faq = `<section class="pn-sec pn-faq" data-blk="9" data-faq>
      ${head(9, P2.faqKicker || s.reviewsKicker)}
      <div class="pn-faq__grid">
        <div class="pn-faq__l" data-in>
          <h2 class="pn-h2">${key(P2.faqTitle || '')}</h2>
          <div class="pn-ask" data-go="10"><span class="pn-ask__k">${esc(t('ask'))}</span><b>${esc(f.phone || '')}</b><span class="pn-note">${ICO.clock}${esc(s.formNote)}</span></div>
        </div>
        <ol class="pn-qa">${t('faq').map(([q, a], i) => `<li class="pn-qa__i${i ? '' : ' is-on'}" data-qa data-in><span class="pn-qa__q"><span class="pn-qa__n">${pad(i + 1)}</span><b>${esc(q)}</b><i class="pn-qa__x" aria-hidden="true"></i></span><span class="pn-qa__a"><span>${esc(a)}</span></span></li>`).join('')}</ol>
      </div>
    </section>`;

  /* ---------- 10 · the booking: the site plan and the contacts, the form ---------- */
  const site = `<svg class="pn-site" viewBox="0 0 320 200" aria-hidden="true">
      <path class="pn-site__st" pathLength="1" d="M-10 52 330 34M-10 150 330 138M70 -10 92 210M214 -10 236 210"/>
      <path class="pn-site__st pn-site__st--s" pathLength="1" d="M-10 98 330 84M142 -10 160 210M276 -10 292 210"/>
      <rect class="pn-site__blk" x="160" y="96" width="50" height="36" transform="rotate(-2.4 185 114)"/>
      <rect class="pn-site__park" x="104" y="102" width="44" height="30" transform="rotate(-2.4 126 117)"/>
      <path class="pn-site__way" pathLength="1" d="M150 140 186 138V133"/>
      <text class="pn-site__t" x="22" y="30" transform="rotate(-3 22 30)">${up(t('street'))}</text>
      <text class="pn-site__p" x="126" y="122" text-anchor="middle">P</text>
      <text class="pn-site__t pn-site__t--b" x="185" y="160" text-anchor="middle">${esc(c.brand.toUpperCase())}</text>
    </svg>`;
  const book = `<section class="pn-sec pn-book" data-blk="10" data-book>
      ${head(10, t('bookK'))}
      <div class="pn-book__grid">
        <div class="pn-book__l" data-in>
          <h2 class="pn-h2">${key(s.formTitle)}</h2>
          <p class="pn-p">${esc(s.formSub)}</p>
          <div class="pn-map"><span class="pn-map__k">${up(P2.mapTitle || '')}</span>${site}</div>
          <div class="pn-ci">${[[ICO.pin, f.addr], [ICO.phone, f.phone], [ICO.mail, MAIL]].map(([ic, v]) => `<span>${ic}${esc(v || '')}</span>`).join('')}</div>
        </div>
        <div class="pn-form" data-in>
          <span class="pn-form__k">${esc(t('hall'))}</span>
          <div class="pn-pick" data-group>${s.halls.map(([n, , p], i) => `<span class="pn-pick__o${i ? '' : ' is-on'}"><b>${LET[i]} · ${esc(n)}</b><small>${esc(p)}</small></span>`).join('')}</div>
          <span class="pn-form__k">${esc(t('date'))}</span>
          <div class="pn-pick pn-pick--d" data-group>${t('days').map((d, i) => `<span class="pn-pick__o${i === 1 ? ' is-on' : ''}"><b>${esc(d)}</b></span>`).join('')}</div>
          ${s.fields.map(([k, v]) => `<span class="pn-field"><span>${esc(k)}</span><b>${esc(v)}</b></span>`).join('')}
          ${pbtn(`<span class="pn-send__t"><span class="pn-send__a">${esc(s.send)}</span><span class="pn-send__b">${TICK}${esc(t('sent'))}</span></span>`, ' pn-send', ' data-send')}
          <span class="pn-note">${ICO.clock}${esc(s.formNote)}</span>
          <div class="pn-stamp" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="1" y="1" width="98" height="98" pathLength="1" vector-effect="non-scaling-stroke"/></svg>
            <span class="pn-stamp__i">${TICK}</span><b class="pn-stamp__t">${esc(t('sent'))}</b><span class="pn-stamp__s" data-stamp-s></span><span class="pn-stamp__n">${esc(s.formNote)}</span></div>
        </div>
      </div>
    </section>`;

  /* ---------- the footer as the set's last title block: the lockup and the way back, the table (address, contacts,
     menu, the title block with its north arrow and scale bar), the list of the ten sheets, the giant wordmark ---------- */
  const heads = s.cover?.heads || [P2.addr || '', P2.phone || '', ''];
  const NBAR = '<svg class="pn-tb__nb" viewBox="0 0 124 26" aria-hidden="true"><circle cx="13" cy="13" r="10"/><path class="pn-tb__nf" d="M13 4.5 18 18 13 15 8 18z"/><path d="M34 9h88v8H34z"/><path class="pn-tb__nf" d="M34 9h22v8H34zM78 9h22v8H78z"/><path d="M34 21v3M56 21v3M78 21v3M100 21v3M122 21v3"/></svg>';
  const footer = `<footer class="pn-ftr" data-ftr>
      <div class="pn-ftr__top">
        <div class="pn-ftr__lock">${logo}<span class="pn-ftr__m">${[s.studioLabel, ...s.meta].map(esc).join(' · ')}</span></div>
        <div class="pn-ftr__acts"><span class="pn-ftr__soc">${[ICO.ig, ICO.tg, ICO.fb].map((ic, i) => `<i title="${esc(f.links?.[i] || '')}">${ic}</i>`).join('')}</span>
          <span class="pn-ftr__up" data-go="1"><b>${esc(t('back'))}</b><i>${ARROW}</i></span></div>
      </div>
      <div class="pn-ftr__grid">
        <div><span class="pn-ftr__k">${esc(heads[0])}</span><b>${esc(f.addr || '')}</b></div>
        <div><span class="pn-ftr__k">${esc(heads[1])}</span><b>${esc(f.phone || '')}</b><b>${MAIL}</b></div>
        <div><span class="pn-ftr__k">${esc(t('nav'))}</span>${s.nav.map((x, i) => `<b class="pn-ftr__a" data-go="${NAVGO[i]}">${esc(x)}<sup>${pad(NAVGO[i])}</sup></b>`).join('')}</div>
        <div class="pn-ftr__tb">
          <span class="pn-tb__w">${esc(c.brand)} · ${esc(s.studioLabel)}</span>
          <span>${esc(c.url)}</span><span>${esc(t('sheet'))} 10 / 10</span>
          <span class="pn-tb__w pn-tb__n">${NBAR}</span>
          <span class="pn-tb__w pn-tb__c">${esc(f.copy || '')}</span>
        </div>
      </div>
      <div class="pn-ftr__list"><span class="pn-ftr__k">${esc(t('sheets'))}</span><ol>${t('rail').map((x, i) => `<li data-go="${i + 1}"${i === 9 ? ' class="is-on"' : ''}><span>${pad(i + 1)}</span><b>${esc(x)}</b></li>`).join('')}</ol></div>
      <div class="pn-word" aria-hidden="true">${[...String(c.brand).toLowerCase()].map((ch) => `<span>${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('')}</div>
    </footer>`;

  return `${header}${rail}${menu}
  <div class="pv-scroll pn-scroll">
    <div class="pn-sel" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    ${hero}${halls}${incl}${trust}${works}${steps}${revs}${meet}${faq}${book}${footer}
  </div>`;
}

/* ==========================================================================
   enhance: the interactions, the entrances, the lens
   ========================================================================== */
export function enhance(site, ctx = {}) {
  const still = !!ctx.reducedMotion;
  const L = ctx.lang === 'ru' ? 'ru' : 'uk';
  const vp = ctx.viewport || site.parentElement;
  const phoneMQ = matchMedia('(max-width: 700px)');
  const off = [];
  const dispose = (fn) => off.push(fn);
  ctx.onDispose?.(() => { for (const fn of off) { try { fn(); } catch (err) { /* gone with the node */ } } });
  site.classList.toggle('pn-still', still);
  const $ = (sel, root = site) => root.querySelector(sel);
  const $$ = (sel, root = site) => [...root.querySelectorAll(sel)];
  const anim = (el, kf, o) => (still || !el ? null : el.animate(kf, { easing: EASE, fill: 'backwards', ...o }));
  const drawIn = (el, duration = 1200, delay = 0) => anim(el, [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration, delay, easing: DRAW });
  const rise = (el, delay = 0, dist = '1.6cqw') => anim(el, [{ opacity: 0, translate: `0 ${dist}` }, { opacity: 1, translate: '0 0' }], { duration: 700, delay });

  /* ---------- «seen»: once, when the element is in the frame and the frame is on the screen ---------- */
  let pageOn = false;
  const waiting = new Map();
  const fire = () => {
    if (!pageOn || document.hidden) return;
    for (const [el, w] of waiting) if (w.in) { waiting.delete(el); vpIO.unobserve(el); for (const fn of w.fns) { try { fn(); } catch (err) { console.warn('[n-plus]', err); } } }
  };
  const pageIO = new IntersectionObserver((es) => { pageOn = es[es.length - 1].isIntersecting; fire(); }, { threshold: 0.15 });
  pageIO.observe(vp);
  const vpIO = new IntersectionObserver((es) => { for (const x of es) { const w = waiting.get(x.target); if (w) w.in = x.isIntersecting; } fire(); }, { root: vp, rootMargin: '0px 0px -16% 0px', threshold: 0 });
  const onVis = () => fire();
  document.addEventListener('visibilitychange', onVis);
  dispose(() => { pageIO.disconnect(); vpIO.disconnect(); document.removeEventListener('visibilitychange', onVis); });
  const seen = (el, fn) => { if (!el || still) return; const w = waiting.get(el); if (w) w.fns.push(fn); else { waiting.set(el, { fns: [fn], in: false }); vpIO.observe(el); } };

  /* ---------- the visitor's own hands: a link inside the sample scrolls it to its sheet (ctx.scrollTo) ---------- */
  const go = (n) => { const el = $(`[data-blk="${n}"]`); if (el && ctx.scrollTo) ctx.scrollTo(el); };
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  dispose(() => timers.forEach(clearTimeout));

  /* ---------- DecryptedText (ReactBits): a mono label prints itself, the letters settling left to right ---------- */
  const decrypt = (el, text = el?.textContent, dur = 520) => {
    if (!el) return;
    clearInterval(el._dx);
    if (still) { el.textContent = text; return; }
    const chars = [...text], n = chars.length, t0 = performance.now();
    const pick = () => T.scr[Math.floor(Math.random() * T.scr.length)];
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / dur);
      const done = Math.floor(k * n);
      el.textContent = chars.map((ch, i) => (i < done || ch === ' ' || ch === '·' ? ch : pick())).join('');
      if (k >= 1) { clearInterval(el._dx); el.textContent = text; }
    };
    el._dx = setInterval(tick, 34);
    tick();
    if (!el._dxOff) { el._dxOff = true; off.push(() => clearInterval(el._dx)); }
  };

  /* ---------- ClickSpark (ReactBits): a click throws eight drafting ticks out of its point ---------- */
  const SPARK = '.pn-ftr__soc i, .pn-btn, .pn-cta, .pn-cta-i, .pn-chip, .pn-tab, .pn-pick__o, .pn-send, .pn-sw__i, .pn-hrow, .pn-revs__n, .pn-arr, .pn-link, .pn-stop, .pn-role, .pn-qa__q, .pn-shot, [data-go]';
  const spark = (ev) => {
    if (still) return;
    const r = site.getBoundingClientRect();
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    g.setAttribute('viewBox', '-30 -30 60 60');
    g.setAttribute('class', 'pn-spark');
    const dark = !!ev.target.closest('.pn-book') && !ev.target.closest('.pn-form');
    if (dark) g.classList.add('pn-spark--d');
    g.style.left = `${ev.clientX - r.left}px`;
    g.style.top = `${ev.clientY - r.top}px`;
    let d = '';
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, r0 = 7, r1 = k % 2 ? 16 : 24;
      d += `<path pathLength="1" d="M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)}L${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}"/>`;
    }
    g.innerHTML = d;
    site.append(g);
    for (const path of g.children) path.animate([{ strokeDasharray: '1 1', strokeDashoffset: 1, opacity: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0, opacity: 1, offset: 0.45 }, { strokeDasharray: '1 1', strokeDashoffset: 0, opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)' });
    g.animate([{ scale: '0.7' }, { scale: '1.25' }], { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => g.remove();
  };
  site.addEventListener('click', (ev) => {
    if (ev.target.closest(SPARK)) spark(ev);
    const to = ev.target.closest('[data-go]');
    if (to) { menuClose?.(); go(Number(to.dataset.go)); }
  });
  let menuClose = null;
  const api = {};

  // a pointer handler that writes at most once a frame, only while the pointer moves (mouse only)
  const onMove = (el, fn) => {
    let raf = 0, last = null;
    el.addEventListener('pointermove', (ev) => { if (ev.pointerType === 'touch') return; last = ev; if (!raf) raf = requestAnimationFrame(() => { raf = 0; fn(last); }); });
    el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); raf = 0; fn(null); });
  };

  /* ---------- the rail: the current sheet (the band at 38% of the frame) and the proximity shift ---------- */
  const rail = $('[data-rail]');
  const blocks = $$('[data-blk]');
  if (rail && blocks.length) {
    const items = $$('[data-r]', rail);
    const railIO = new IntersectionObserver((es) => {
      for (const x of es) if (x.isIntersecting) {
        const n = x.target.dataset.blk;
        items.forEach((it) => it.classList.toggle('is-on', it.dataset.r === n));
        const cur = $(`.pn-rail__cur > [data-r="${n}"]`, rail);
        if (cur && cur._n !== n) { cur._n = n; decrypt(cur, cur.textContent, 380); }
        // the header's menu follows: the halls, the shots, the contacts
        const k = Number(n);
        const on = k >= 2 && k <= 4 ? 0 : k >= 5 && k <= 8 ? 2 : k >= 9 ? 3 : -1;
        $$('.pn-nav > [data-nav]').forEach((a) => a.classList.toggle('is-on', Number(a.dataset.nav) === on));
        $$('.pn-scale > i').forEach((g) => { const m = Number(g.dataset.sc); g.classList.toggle('is-on', m === k); g.classList.toggle('is-done', m < k); });
      }
    }, { root: vp, rootMargin: '-38% 0px -61% 0px', threshold: 0 });
    blocks.forEach((b) => railIO.observe(b));
    dispose(() => railIO.disconnect());
    const ticks = $$('li[data-r]', rail);
    onMove(rail, (ev) => {
      if (!ev) { ticks.forEach((it) => it.style.removeProperty('--p')); return; }
      for (const it of ticks) {
        const r = it.getBoundingClientRect();
        const d = Math.abs(ev.clientY - (r.top + r.height / 2)) / (r.height * 2.4);
        it.style.setProperty('--p', Math.max(0, 1 - d).toFixed(2));
      }
    });
  }

  /* ---------- the phone's menu (StaggeredMenu: two layers, then the items one after another) ---------- */
  const menu = $('[data-menu]');
  const burger = $('[data-burger]');
  if (menu && burger) {
    const toggle = (open) => {
      menu.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      if (still) return;
      const layers = $$('.pn-menu__l, .pn-menu__p', menu);
      const lines = $$('.pn-menu__t > span, .pn-menu__n, .pn-menu__f', menu);
      if (open) {
        layers.forEach((l, i) => l.animate([{ translate: '100% 0' }, { translate: '0 0' }], { duration: 520, delay: i * 70, easing: EASE, fill: 'backwards' }));
        lines.forEach((l, i) => l.animate([{ translate: '0 110%', opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 560, delay: 220 + (i % 10) * 45, easing: EASE, fill: 'backwards' }));
      } else {
        // closing: the sheet and its layers slide back out, the last first (it stays visible until they have)
        menu.classList.add('is-closing');
        const outs = layers.slice().reverse().map((l, i) => l.animate([{ translate: '0 0' }, { translate: '100% 0' }], { duration: 420, delay: i * 60, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' }));
        Promise.all(outs.map((a) => a.finished)).catch(() => {}).then(() => { menu.classList.remove('is-closing'); outs.forEach((a) => a.cancel()); });
      }
    };
    burger.addEventListener('click', () => toggle(!menu.classList.contains('is-open')));
    menu.addEventListener('click', (ev) => { if (ev.target === menu) toggle(false); });
    menuClose = () => { if (menu.classList.contains('is-open')) toggle(false); };
  }

  /* ---------- 01 · the first screen: StrokeText, the plan draws on, the swatches ---------- */
  const plan = $('[data-plan]');
  const sw = $('[data-sw]');
  const hero = $('.pn-hero');
  let swatch = 0;
  let lensApi = null;
  const setSwatch = (i, ease = true) => {
    swatch = i;
    hero?.style.setProperty('--sw', SWATCH[i]);
    $$('[data-s]', sw).forEach((x) => x.classList.toggle('is-on', Number(x.dataset.s) === i));
    $$('.pn-sw__n > span', sw).forEach((x, k) => { x.classList.toggle('is-on', k === i); if (k === i && ease) decrypt(x, x.textContent, 360); });
    if (ease && !still) $(`[data-s="${i}"]`, sw)?.animate([{ scale: '0.7' }, { scale: '1' }], { duration: 420, easing: EASE });
    lensApi?.retexture();
  };
  sw?.addEventListener('click', (ev) => { const x = ev.target.closest('[data-s]'); if (x) { clearTimeout(cycleT); setSwatch(Number(x.dataset.s)); } });
  let cycleT = 0;
  dispose(() => clearTimeout(cycleT));
  seen(hero, () => {
    // the headline: each word's outline is drawn left to right, then the ink floods it (StrokeText)
    const words = $$('[data-h1] .pn-w');
    const n = $$('[data-h1] .pv-lx__a .pn-w').length || words.length;
    words.forEach((w, i) => {
      const k = i % n;
      const ink = getComputedStyle(w).color;
      w.animate([
        { clipPath: 'inset(-25% 100% -25% -4%)', color: 'rgba(0,0,0,0)' },
        { clipPath: 'inset(-25% -4% -25% -4%)', color: 'rgba(0,0,0,0)', offset: 0.55 },
        { clipPath: 'inset(-25% -4% -25% -4%)', color: ink },
      ], { duration: 1500, delay: 120 + k * 90, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'backwards' });
    });
    $$('[data-h1] .pn-w__bar').forEach((b) => anim(b, [{ scale: '0 1' }, { scale: '1 1' }], { duration: 700, delay: 1300 }));
    $$('.pn-hero__txt [data-in]').forEach((el, i) => rise(el, 500 + i * 90));
    // the plan: the lines draw in groups, then the fills and the labels arrive
    $$('path[pathLength]', plan).forEach((p) => drawIn(p, 1200, 200 + Number(p.dataset.g || 0) * 220));
    $$('.pp-fill, .pp-hidden', plan).forEach((p) => anim(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1300 + Number(p.dataset.g || 0) * 120, easing: 'linear' }));
    $$('.pp-t, .pp-tag, .pp-grid, .pp-frame', plan).forEach((p, i) => anim(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1500 + (i % 12) * 40, easing: 'linear' }));
    anim($('.pn-hero__ph .pn-ph'), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, delay: 700, easing: DRAW });
    // the lens (3D) waits for the drawing, then comes in
    anim($('[data-lens]', hero), [{ opacity: 0 }, { opacity: 0, offset: 0.78 }, { opacity: 1 }], { duration: 2500, easing: 'linear' });
    // the tour's one named interaction: three backdrops, once (Пісок → Глина → Шавлія)
    const seq = [4, 5, 3];
    const step = (k) => { if (k >= seq.length || ctx.user) return; setSwatch(seq[k]); cycleT = setTimeout(() => step(k + 1), 1000); };
    if (!ctx.user) cycleT = setTimeout(() => step(0), 2700);
  });
  ctx.onUser?.(() => clearTimeout(cycleT));

  /* ---------- 02 · the halls (Filmstrip Scrub) ---------- */
  const hallsEl = $('[data-halls]');
  if (hallsEl) {
    const scrub = $('[data-scrub]', hallsEl);
    const imgs = $$('.pn-halls__ph img', hallsEl);
    const cells = $$('.pn-px i', hallsEl);
    const rateN = $('[data-rate-n]', hallsEl), rateK = $('[data-rate-k]', hallsEl);
    let cur = 0, tok = 0, runs = [];
    const swap = () => imgs.forEach((im) => im.classList.toggle('is-on', Number(im.dataset.h) === cur));
    // PixelTransition (ReactBits): the plan's grid cells cover the old photo in a random order, the new one is put
    // under them, then they lift in another random order (≈ 0.7 s, once per change)
    const pixel = () => {
      const my = ++tok;
      runs.forEach((a) => a.cancel());
      runs = cells.map((c) => c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: Math.random() * 240, fill: 'forwards' }));
      later(() => {
        if (my !== tok) return;
        swap();
        runs.push(...cells.map((c) => c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, delay: Math.random() * 260, fill: 'forwards' })));
        later(() => { if (my === tok) { runs.forEach((a) => a.cancel()); runs = []; } }, 460);
      }, 380);
    };
    // Counter (ReactBits): the rate's digits roll from the old price to the new one
    const rollTo = (str) => {
      const cs = $$('.pn-dg', rateN);
      if (cs.length !== str.length) { rateN.innerHTML = digits(str); return; }
      [...str].forEach((ch, k) => {
        const c = cs[k], old = Number(c.style.getPropertyValue('--v')), v = Number(ch);
        if (old === v) return;
        c.style.setProperty('--v', v);
        anim($('.pn-dg__c', c), [{ translate: `-50% ${-old * 1.1}em` }, { translate: `-50% ${-v * 1.1}em` }], { duration: 700, delay: (str.length - 1 - k) * 50, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    };
    const show = (i) => {
      if (i === cur || i < 0 || i > 2) return;
      cur = i;
      $$('[data-h]', hallsEl).forEach((x) => { if (x.tagName !== 'IMG') x.classList.toggle('is-on', Number(x.dataset.h) === i); });
      scrub.style.setProperty('--at', i);
      if (still) swap(); else pixel();
      const p = $(`.pn-hrow[data-h="${i}"] .pn-hrow__p`, hallsEl)?.textContent || '';
      rollTo(price(p)[0]);
      decrypt(rateK, `${T.hall[L]} ${'ABC'[i]} · ${T.perHour[L]}`.toUpperCase(), 420);
      const cap = $(`.pn-cap[data-h="${i}"] b`, hallsEl);
      decrypt(cap, cap?.textContent, 520);
    };
    api.hall = (i) => show(i);
    api.cur = () => cur;
    hallsEl.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-book-hall]')) { api.formHall?.(cur); go(10); return; }
      const x = ev.target.closest('[data-h]');
      if (x) show(Number(x.dataset.h));
    });
    for (const el of [...$$('.pn-hrow', hallsEl), ...$$('.pn-mini__r', hallsEl)]) el.addEventListener('pointerenter', (ev) => { if (ev.pointerType !== 'touch') show(Number(el.dataset.h)); });
    const fromX = (ev) => { const r = scrub.getBoundingClientRect(); show(Math.max(0, Math.min(2, Math.floor(((ev.clientX - r.left) / r.width) * 3)))); };
    onMove(scrub, (ev) => { if (ev) fromX(ev); });
    scrub.addEventListener('pointerdown', (ev) => { fromX(ev); scrub.setPointerCapture?.(ev.pointerId); });
    scrub.addEventListener('pointermove', (ev) => { if (ev.pointerType === 'touch' && ev.buttons) fromX(ev); });
    seen(hallsEl, () => {
      $$('[data-in]', hallsEl).forEach((el, i) => rise(el, i * 90));
      $$('.pn-scrub__t i', hallsEl).forEach((x, k) => anim(x, [{ scale: '1 0' }, { scale: '1 1' }], { duration: 500, delay: 500 + k * 14 }));
      $$('.pn-mini rect', hallsEl).forEach((x, k) => anim(x, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 300 + k * 120, easing: 'linear' }));
    });
  }

  /* ---------- 03 + what the rent includes (Feature Tab Switcher) ---------- */
  const tabsEl = $('[data-tabs]');
  if (tabsEl) {
    const list = $('[data-tablist]', tabsEl);
    const tabs = $$('[data-t]', tabsEl);
    let cur = 0;
    const show = (i, focus = false) => {
      i = (i + tabs.length) % tabs.length;
      if (i === cur) return;
      cur = i;
      tabs.forEach((x) => x.classList.toggle('is-on', Number(x.dataset.t) === i));
      $$('[data-p]', tabsEl).forEach((x) => x.classList.toggle('is-on', Number(x.dataset.p) === i));
      decrypt($(`.pn-incl__cap [data-p="${i}"]`, tabsEl), undefined, 480);
      const panel = $(`.pn-panel[data-p="${i}"]`, tabsEl);
      // the new panel slides in from the tab's side under a hairline (a sheet pulled into the frame)
      anim(panel, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 620, easing: DRAW });
      $$('.pd-l', panel).forEach((p, k) => drawIn(p, 900, 80 + k * 70));
      anim($('img', panel), [{ scale: '1.04' }, { scale: '1' }], { duration: 900 });
      if (focus) list.focus({ preventScroll: true });
    };
    list.addEventListener('click', (ev) => { const x = ev.target.closest('[data-t]'); if (x) show(Number(x.dataset.t), true); });
    list.addEventListener('keydown', (ev) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[ev.key];
      if (d) { ev.preventDefault(); show(cur + d); }
    });
    seen(tabsEl, () => {
      $$(':scope > [data-in], .pn-incl__grid [data-in]', tabsEl).forEach((el, i) => rise(el, i * 90));
      tabs.forEach((x, i) => anim(x, [{ opacity: 0, translate: '-1.4cqw 0' }, { opacity: 1, translate: '0 0' }], { duration: 600, delay: 200 + i * 60 }));
      $$('.pn-tab__ok path', tabsEl).forEach((p, i) => drawIn(p, 500, 600 + i * 70));
      anim($('.pn-panel.is-on .pn-tab__sw', tabsEl), [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 900 });
    });
  }

  /* ---------- 04 · the numbers: the dimension lines draw, then the digits roll (Counter) ---------- */
  const trustEl = $('[data-trust]');
  seen(trustEl, () => {
    $$('[data-in]', trustEl).forEach((el, i) => rise(el, i * 90));
    $$('.pn-fact', trustEl).forEach((fact, i) => {
      anim($('.pn-dim__l', fact), [{ scale: '0 1' }, { scale: '1 1' }], { duration: 1000, delay: 150 + i * 120, easing: DRAW });
      $$('.pn-dg__c', fact).forEach((col, k) => anim(col, [{ translate: '-50% 0' }, { translate: '-50% calc(var(--v) * -1.1em)' }], { duration: 1100, delay: 800 + i * 120 + k * 60, easing: 'cubic-bezier(.22,1,.36,1)' }));
      anim($('.pn-fact__l', fact), [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1000 + i * 120, easing: 'linear' });
    });
  });

  /* ---------- 05 + the guests' shots (Horizontal Depth Fade): centre sharp, the rest .45 / .94 ---------- */
  const worksEl = $('[data-works]');
  if (worksEl) {
    const strip = $('[data-strip]', worksEl);
    const shots = $$('.pn-shot', worksEl);
    let raf = 0;
    const depth = () => {
      raf = 0;
      // all the boxes first, then the styles: a box read after a style written lays the strip out again
      const r = strip.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      const seen = shots.filter((sh) => !sh.hidden).map((sh) => [sh, sh.getBoundingClientRect()]);
      for (const [sh, b] of seen) {
        const k = Math.min(1, Math.abs(b.left + b.width / 2 - mid) / (b.width * 1.05));
        sh.style.opacity = (1 - 0.55 * k).toFixed(3);
        sh.style.scale = (1 - 0.06 * k).toFixed(4);
      }
    };
    const later = () => { if (!raf) raf = requestAnimationFrame(depth); };
    strip.addEventListener('scroll', later, { passive: true });
    dispose(() => cancelAnimationFrame(raf));
    const centre = (sh, smooth = true) => {
      if (!sh) return;
      const left = sh.offsetLeft - (strip.clientWidth - sh.offsetWidth) / 2;
      strip.scrollTo({ left, behavior: smooth && !still ? 'smooth' : 'auto' });
    };
    // drag with a mouse; then snap to the nearest frame
    let drag = null;
    strip.addEventListener('pointerdown', (ev) => { if (ev.pointerType !== 'mouse') return; drag = { x: ev.clientX, l: strip.scrollLeft, moved: false }; strip.setPointerCapture(ev.pointerId); strip.classList.add('is-drag'); });
    strip.addEventListener('pointermove', (ev) => { if (!drag) return; const dx = ev.clientX - drag.x; if (Math.abs(dx) > 3) drag.moved = true; strip.scrollLeft = drag.l - dx; });
    const end = () => {
      if (!drag) return;
      strip.classList.remove('is-drag');
      const r = strip.getBoundingClientRect(), mid = r.left + r.width / 2;
      const near = shots.filter((x) => !x.hidden).sort((a, b) => Math.abs(a.getBoundingClientRect().left + a.offsetWidth / 2 - mid) - Math.abs(b.getBoundingClientRect().left + b.offsetWidth / 2 - mid))[0];
      const moved = drag.moved;
      drag = null;
      if (moved) centre(near);
    };
    strip.addEventListener('pointerup', end);
    strip.addEventListener('pointercancel', end);
    strip.addEventListener('click', (ev) => { const sh = ev.target.closest('.pn-shot'); if (sh) centre(sh); });
    worksEl.addEventListener('click', (ev) => {
      const chip = ev.target.closest('[data-f]');
      if (!chip) return;
      const k = Number(chip.dataset.f);
      $$('[data-f]', worksEl).forEach((x) => x.classList.toggle('is-on', x === chip));
      shots.forEach((sh) => { sh.hidden = k >= 0 && Number(sh.dataset.h) !== k; });
      const first = shots.find((x) => !x.hidden);
      centre(first, false);
      depth();
      shots.filter((x) => !x.hidden).forEach((sh, i) => anim(sh, [{ opacity: 0, translate: '2cqw 0' }, { translate: '0 0' }], { duration: 600, delay: i * 70, fill: 'none', composite: 'add' }));
    });
    // start on the second frame, so the depth shows on both sides
    requestAnimationFrame(() => { centre(shots[1], false); depth(); });
    seen(worksEl, () => {
      $$('[data-in]', worksEl).forEach((el, i) => rise(el, i * 90));
      shots.forEach((sh, i) => anim($('.pn-shot__ph', sh), [{ opacity: 0, translate: '4cqw 0' }, { opacity: 1, translate: '0 0' }], { duration: 800, delay: 200 + i * 80 }));
    });
  }

  /* ---------- 06 · the steps: the dashed rail draws, the stops light in turn ---------- */
  const stepsEl = $('[data-steps]');
  seen(stepsEl, () => {
    $$('[data-in]', stepsEl).forEach((el, i) => rise(el, i * 90));
    anim($('.pn-route__rail', stepsEl), [{ scale: '1 0' }, { scale: '1 1' }], { duration: 1400, delay: 200, easing: DRAW });
    $$('.pn-stop', stepsEl).forEach((x, i) => {
      anim($('.pn-stop__n', x), [{ opacity: 0, scale: '0.6' }, { opacity: 1, scale: '1' }], { duration: 500, delay: 350 + i * 300 });
      anim(x, [{ opacity: 0, translate: '1.2cqw 0' }, { opacity: 1, translate: '0 0' }], { duration: 700, delay: 420 + i * 300 });
    });
  });

  /* ---------- 07 + the reviews: one voice, a 01/02/03 switch ---------- */
  const revsEl = $('[data-revs]');
  if (revsEl) {
    let cur = 0;
    const show = (i) => {
      i = (i + 3) % 3;
      if (i === cur) return;
      cur = i;
      $$('[data-q]', revsEl).forEach((x) => x.classList.toggle('is-on', Number(x.dataset.q) === i));
      anim($(`.pn-q[data-q="${i}"] p`, revsEl), [{ opacity: 0, translate: '0 1cqw' }, { opacity: 1, translate: '0 0' }], { duration: 600 });
    };
    revsEl.addEventListener('click', (ev) => {
      const n = ev.target.closest('.pn-revs__n');
      const a = ev.target.closest('[data-d]');
      if (n) show(Number(n.dataset.q)); else if (a) show(cur + Number(a.dataset.d));
    });
    seen(revsEl, () => {
      $$('[data-in]', revsEl).forEach((el, i) => rise(el, i * 100));
      anim($('.pn-quote__m', revsEl), [{ opacity: 0, translate: '0 -2cqw' }, { opacity: 1, translate: '0 0' }], { duration: 900, delay: 250 });
    });
  }

  /* ---------- 08 + who meets you: the photo drifts once (≤ 8 %), the role tags come in ---------- */
  const meetEl = $('[data-meet]');
  seen(meetEl, () => {
    $$('[data-in]', meetEl).forEach((el, i) => rise(el, i * 90));
    anim($('.pn-meet__ph img', meetEl), [{ translate: '0 6%', scale: '1.08' }, { translate: '0 0', scale: '1.08' }], { duration: 1800, easing: 'cubic-bezier(.22,1,.36,1)' });
  });

  /* ---------- 09 · the questions: one open at a time ---------- */
  const faqEl = $('[data-faq]');
  if (faqEl) {
    faqEl.addEventListener('click', (ev) => {
      const q = ev.target.closest('[data-qa]');
      if (!q) return;
      const open = !q.classList.contains('is-on');
      $$('[data-qa]', faqEl).forEach((x) => x.classList.toggle('is-on', open && x === q));
      if (open) anim($('.pn-qa__a > span', q), [{ opacity: 0, translate: '0 0.8cqw' }, { opacity: 1, translate: '0 0' }], { duration: 500, delay: 120 });
    });
    seen(faqEl, () => $$('[data-in]', faqEl).forEach((el, i) => rise(el, i * 70)));
  }

  /* ---------- 10 · the booking: the hall and the day, «Надіслати заявку» → «Заявку надіслано» ---------- */
  const bookEl = $('[data-book]');
  if (bookEl) {
    bookEl.addEventListener('click', (ev) => {
      const o = ev.target.closest('.pn-pick__o');
      if (o) {
        $$('.pn-pick__o', o.parentElement).forEach((x) => x.classList.toggle('is-on', x === o));
        anim(o, [{ scale: '0.96' }, { scale: '1' }], { duration: 360, fill: 'none' });
        return;
      }
      const send = ev.target.closest('[data-send]');
      if (send && !send.classList.contains('is-sent')) {
        // the form's states: «Надіслати» → the button turns sage, the fields step back and an approval stamp is
        // drawn over them with what was asked for (hall · day); 3 s later it lifts and the form is back
        const form = send.closest('.pn-form');
        const stamp = $('.pn-stamp', form);
        const picks = $$('.pn-pick', form).map((g) => $('.pn-pick__o.is-on b', g)?.textContent || '');
        $('[data-stamp-s]', stamp).textContent = picks.filter(Boolean).join(' · ');
        send.classList.add('is-sent');
        form.classList.add('is-stamped');
        drawIn($('.pn-send__b path', send), 520, 120);
        drawIn($('rect', stamp), 700, 80);
        drawIn($('.pn-stamp__i path', stamp), 480, 520);
        anim(stamp, [{ opacity: 0, scale: '1.06', rotate: '-2deg' }, { opacity: 1, scale: '1', rotate: '-2deg' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
        clearTimeout(send._t);
        send._t = later(() => { send.classList.remove('is-sent'); form.classList.remove('is-stamped'); }, 3000);
        return;
      }
      // the address, the phone, the mail: the studio on the site plan answers
      if (ev.target.closest('.pn-ci span')) anim($('.pn-site__blk', bookEl), [{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }], { duration: 900, fill: 'none', easing: 'linear' });
    });
    api.formHall = (i) => { const g = $('.pn-pick', bookEl); const o = $$('.pn-pick__o', g)[i]; if (!o) return; $$('.pn-pick__o', g).forEach((x) => x.classList.toggle('is-on', x === o)); later(() => anim(o, [{ scale: '0.9' }, { scale: '1.04', offset: 0.6 }, { scale: '1' }], { duration: 560, fill: 'none' }), 700); };
    seen(bookEl, () => {
      $$('[data-in]', bookEl).forEach((el, i) => rise(el, i * 100));
      $$('.pn-site [pathLength]', bookEl).forEach((p, i) => drawIn(p, 1200, 200 + i * 80));
      anim($('.pn-site__blk', bookEl), [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1100, easing: 'linear' });
    });
  }

  /* ---------- the footer's wordmark: the letters rise out of the edge, once ---------- */
  const ftr = $('[data-ftr]');
  seen(ftr, () => $$('.pn-word > span', ftr).forEach((ch, i) => anim(ch, [{ translate: '0 45%' }, { translate: '0 0' }], { duration: 1000, delay: i * 50 })));

  /* ---------- the H2s: SplitText's words rise out of their masks, one after another, as each sheet arrives ---------- */
  for (const b of blocks) seen(b, () => $$('.pn-h2 .pn-wm > span', b).forEach((w, i) => anim(w, [{ translate: '0 108%' }, { translate: '0 0' }], { duration: 900, delay: 120 + i * 55, easing: 'cubic-bezier(.2,.9,.25,1)' })));

  /* ---------- the steps and the roles: a click marks one (the sage moves to it) ---------- */
  for (const [sel, root] of [['.pn-stop', stepsEl], ['.pn-role', meetEl]]) {
    root?.addEventListener('click', (ev) => {
      const x = ev.target.closest(sel);
      if (!x) return;
      $$(sel, root).forEach((y) => y.classList.toggle('is-pick', y === x));
      anim($(sel === '.pn-stop' ? '.pn-stop__n' : '.pn-role__n', x), [{ scale: '0.7' }, { scale: '1' }], { duration: 520, fill: 'none', easing: 'cubic-bezier(.3,1.5,.5,1)' });
    });
  }

  /* ---------- a finger sideways on the strip or the scrub belongs to them, not to the page's own scroll ---------- */
  for (const el of $$('[data-strip], [data-scrub]')) {
    let x0 = 0, y0 = 0;
    el.addEventListener('touchstart', (ev) => { x0 = ev.touches[0].clientX; y0 = ev.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchmove', (ev) => { const t = ev.touches[0]; if (Math.abs(t.clientX - x0) > Math.abs(t.clientY - y0)) ev.stopPropagation(); }, { passive: true });
  }

  /* ---------- the drawn buttons on a touch screen: a press plays their hover once (fill, frame, roll) ---------- */
  site.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType === 'mouse' || still) return;
    const b = ev.target.closest('.pn-btn, .pn-cta-i');
    if (!b) return;
    b.classList.add('is-press');
    clearTimeout(b._pt);
    b._pt = later(() => b.classList.remove('is-press'), 650);
  });

  /* ---------- pointer-only effects (a mouse; a finger has its taps) ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    /* TargetCursor (ReactBits), as a drawing program's selection: four corner brackets glide to the card under the
       pointer (they ride with the page: they live inside it) */
    const SEL = '.pn-hrow, .pn-tab, .pn-fact, .pn-shot, .pn-stop, .pn-quote, .pn-role, .pn-qa__q, .pn-ask, .pn-pick__o, .pn-ftr__tb, .pn-ftr__list li, .pn-panels, .pn-halls__ph, .pn-meet__ph .pn-ph, .pn-hero__ph .pn-ph, .pn-map';
    const sel = $('.pn-sel');
    const scroll = $('.pn-scroll');
    let selOn = null, selT = 0;
    const place = (el) => {
      const r = el.getBoundingClientRect(), b = scroll.getBoundingClientRect();
      const g = Math.max(4, vp.clientWidth * 0.006);
      const [x0, y0, x1, y1] = [r.left - b.left - g, r.top - b.top - g, r.right - b.left + g, r.bottom - b.top + g];
      const cs = sel.children;
      cs[0].style.translate = `${x0}px ${y0}px`; cs[1].style.translate = `${x1}px ${y0}px`;
      cs[2].style.translate = `${x0}px ${y1}px`; cs[3].style.translate = `${x1}px ${y1}px`;
      sel.classList.toggle('is-dark', !!el.closest('.pn-book') && !el.closest('.pn-form'));
    };
    site.addEventListener('pointerover', (ev) => {
      if (ev.pointerType !== 'mouse') return;
      const el = ev.target.closest(SEL);
      if (!el || el === selOn) return;
      clearTimeout(selT);
      const first = !sel.classList.contains('is-on');
      if (first) sel.classList.add('is-jump');
      place(el);
      if (first) { sel.getBoundingClientRect(); sel.classList.remove('is-jump'); }
      sel.classList.add('is-on');
      selOn = el;
    });
    site.addEventListener('pointerout', (ev) => {
      if (!selOn || (ev.relatedTarget && selOn.contains(ev.relatedTarget))) return;
      clearTimeout(selT);
      selT = later(() => { if (!selOn) return; selOn = null; sel.classList.remove('is-on'); }, 140);
      selOn = null;
    });

    /* Crosshair (ReactBits) on the plan: two hairlines follow the pointer across the sheet; over a hall they print
       its tag (DecryptedText) and its floor lights up; a click opens that hall below */
    if (plan) {
      const hh = $('.pn-xh--h', plan), vv = $('.pn-xh--v', plan), tag = $('.pn-xh__t', plan);
      const floors = $$('.pp-floor', plan);
      const svgEl = $('.pp', plan);
      let hot = -1;
      const hallAt = (ev) => {
        const r = svgEl.getBoundingClientRect();
        const vx = ((ev.clientX - r.left) / r.width) * VB[0] - OX, vy = ((ev.clientY - r.top) / r.height) * VB[1] - OY;
        const u = (vx + vy) / (2 * KX), v = (vx - vy) / (2 * KX);
        return v < 0 || v > 10 || u < 0 || u > 18 ? -1 : u < 8 ? 0 : u < 14 ? 1 : 2;
      };
      onMove(plan, (ev) => {
        if (!ev || plan.querySelector('.pn-lens.is-drag')) { plan.classList.remove('is-xh', 'is-hot'); floors.forEach((f) => f.classList.remove('is-hot')); hot = -1; return; }
        const r = plan.getBoundingClientRect();
        const x = ev.clientX - r.left, y = ev.clientY - r.top;
        plan.classList.add('is-xh');
        hh.style.translate = `0 ${y}px`; vv.style.translate = `${x}px 0`;
        tag.style.translate = `${Math.min(x + 10, r.width - tag.offsetWidth - 6)}px ${Math.max(6, y - 24)}px`;
        const h = hallAt(ev);
        if (h !== hot) {
          hot = h;
          floors.forEach((f, k) => f.classList.toggle('is-hot', k === h));
          plan.classList.toggle('is-hot', h >= 0);
          if (h >= 0) decrypt(tag, `${'ABC'[h]} · ${$$('.pp-t', plan).filter((t) => !t.classList.contains('pp-t--tag') && !t.classList.contains('pp-t--mute'))[h]?.textContent || ''} · ${[80, 60, 40][h]} М² →`, 300);
        }
      });
      plan.addEventListener('click', (ev) => {
        const lensEl = plan.querySelector('[data-lens]');
        if (lensEl && performance.now() - Number(lensEl.dataset.dragEnd || 0) < 400) return; // the end of a drag
        const h = hallAt(ev);
        if (h >= 0) { api.hall?.(h); go(2); }
      });
    }

    /* VariableProximity (ReactBits) on the footer's wordmark: Unbounded's weight swells under the pointer (300 → 700),
       written only while the pointer moves over the footer */
    const word = $('.pn-word');
    if (word) {
      const letters = $$('span', word);
      onMove(ftr, (ev) => {
        if (!ev) { letters.forEach((l) => l.style.removeProperty('font-variation-settings')); return; }
        const R = vp.clientWidth * 0.2;
        for (const l of letters) {
          const r = l.getBoundingClientRect();
          const d = Math.hypot(ev.clientX - (r.left + r.width / 2), ev.clientY - (r.top + r.height * 0.6));
          const k = Math.max(0, 1 - d / R);
          l.style.fontVariationSettings = `'wght' ${Math.round(300 + 400 * k * k)}`;
        }
      });
    }
  }

  /* ---------- 3D: the lens on the plan ---------- */
  if (ctx.three) lensApi = mountLens(site, ctx, { L, plan, still, phone: phoneMQ.matches || !!ctx.phone, vp, dispose, seen: (el, fn) => { if (still) fn(); else seen(el, fn); }, swatch: () => swatch });
}

/* ==========================================================================
   The lens: three.js as the WebGL frame, an analytic tracer in the fragment shader
   ========================================================================== */
const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uBox, uRes, uC;
uniform float uA, uT, uE, uSb, uRb, uRt, uTh;
uniform vec3 uPaper;
float cth, sth;
vec3 Cb, Ct; vec2 cp;
vec2 sph(vec3 o, vec3 d, vec3 c, float r) {
  vec3 oc = o - c; float b = dot(oc, d); float q = dot(oc, oc) - r * r; float h = b * b - q;
  if (h < 0.0) return vec2(1e9, -1e9);
  h = sqrt(h); return vec2(-b - h, -b + h);
}
vec2 cyl(vec3 o, vec3 d, vec2 c, float r) {
  vec2 oc = o.xy - c; float a = dot(d.xy, d.xy); float b = dot(oc, d.xy); float q = dot(oc, oc) - r * r;
  if (a < 1e-7) return q < 0.0 ? vec2(-1e9, 1e9) : vec2(1e9, -1e9);
  float h = b * b - a * q; if (h < 0.0) return vec2(1e9, -1e9);
  h = sqrt(h); return vec2((-b - h) / a, (-b + h) / a);
}
void body(vec3 o, vec3 d, out float tin, out float tout, out int pin, out int pout) {
  vec2 a = sph(o, d, Cb, uRb), b = sph(o, d, Ct, uRt), c = cyl(o, d, cp, uA);
  tin = a.x; pin = 0; if (b.x > tin) { tin = b.x; pin = 1; } if (c.x > tin) { tin = c.x; pin = 2; }
  tout = a.y; pout = 0; if (b.y < tout) { tout = b.y; pout = 1; } if (c.y < tout) { tout = c.y; pout = 2; }
}
vec3 nrm(int p, vec3 x) {
  if (p == 0) return normalize(x - Cb);
  if (p == 1) return normalize(x - Ct);
  return normalize(vec3(x.xy - cp, 0.0));
}
// the room: plaster walls, the sheet below, the lantern above and to the left, a strip softbox to the right
vec3 env(vec3 r) {
  vec3 col = mix(vec3(0.78, 0.76, 0.72), vec3(0.97, 0.96, 0.94), smoothstep(-0.1, 0.95, r.z));
  if (r.z < 0.0) col = uPaper * 0.9;
  vec3 L1 = normalize(vec3(-0.45, 0.52, 0.72));
  col += vec3(1.0, 0.98, 0.95) * smoothstep(0.972, 0.993, dot(r, L1)) * 1.7;
  vec3 L2 = normalize(vec3(0.66, -0.12, 0.74));
  vec3 U2 = normalize(cross(L2, vec3(0.25, 1.0, 0.0)));
  vec3 V2 = cross(L2, U2);
  float k = dot(r, L2);
  float sx = dot(r, U2), sy = dot(r, V2);
  col += vec3(1.0) * step(0.0, k) * (1.0 - smoothstep(0.035, 0.06, abs(sx))) * (1.0 - smoothstep(0.3, 0.42, abs(sy))) * 1.25;
  return col;
}
vec3 sheet(vec3 q, vec3 e) {
  float s = -q.z / e.z; vec3 h = q + e * s;
  vec2 uv = vec2(h.x / uBox.x, h.y * cth / uBox.y);
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return uPaper;
  return texture2D(uTex, uv).rgb;
}
vec3 through(vec3 x, vec3 d, vec3 n, float ior) {
  vec3 t = refract(d, n, 1.0 / ior);
  vec3 p = x + t * 0.02;
  for (int k = 0; k < 3; k++) {
    float tin, tout; int pin, pout;
    body(p, t, tin, tout, pin, pout);
    vec3 q = p + t * tout;
    vec3 no = nrm(pout, q);
    if (pout == 2) return vec3(0.2, 0.2, 0.19) + 0.08 * env(reflect(t, no));
    vec3 e = refract(t, -no, ior);
    if (dot(e, e) < 1e-5) { t = reflect(t, -no); p = q + t * 0.02; continue; }
    float g = exp(-0.004 * tout);
    vec3 tint = mix(vec3(0.9, 0.95, 0.91), vec3(1.0), g);
    if (e.z < -1e-3) return sheet(q, e) * tint;
    return env(e) * tint;
  }
  return vec3(0.25, 0.26, 0.25);
}
vec4 shade(vec2 s) {
  vec3 up = vec3(0.0, cth, sth), d = vec3(0.0, sth, -cth);
  vec3 o = vec3(s.x, 0.0, 0.0) + up * s.y - d * 600.0;
  float tin, tout; int pin, pout;
  body(o, d, tin, tout, pin, pout);
  if (tin >= tout) return vec4(0.0);
  vec3 x = o + d * tin; vec3 n = nrm(pin, x);
  if (pin == 2) {
    float sheen = pow(1.0 - abs(dot(d, n)), 3.0);
    return vec4(vec3(0.14, 0.14, 0.135) + 0.18 * env(reflect(d, n)) * (0.3 + sheen), 1.0);
  }
  float ci = clamp(-dot(d, n), 0.0, 1.0);
  float F = 0.04 + 0.96 * pow(1.0 - ci, 5.0);
  vec3 R = env(reflect(d, n));
  vec3 tr = vec3(through(x, d, n, 1.508).r, through(x, d, n, 1.519).g, through(x, d, n, 1.534).b);
  return vec4(mix(tr, R, F), 1.0);
}
void main() {
  cth = cos(uTh); sth = sin(uTh);
  cp = vec2(uC.x, uC.y / cth);
  Cb = vec3(cp, uRb);
  Ct = vec3(cp, uT - uRt);
  vec2 px = gl_FragCoord.xy / uRes * uBox;
  if (abs(px.x - uC.x) > uA + 2.0 || px.y < uC.y - uA * cth - 3.0 || px.y > uC.y + uA * cth + uT * sth + 3.0) discard;
  vec2 k = uBox / uRes;
  vec4 acc = shade(px + k * vec2(-0.125, -0.375)) + shade(px + k * vec2(0.375, -0.125)) + shade(px + k * vec2(0.125, 0.375)) + shade(px + k * vec2(-0.375, 0.125));
  acc *= 0.25;
  if (acc.a < 0.002) discard;
  gl_FragColor = acc;
}`;

function mountLens(site, ctx, { L, plan, still, phone, vp, dispose, seen, swatch }) {
  const holder = site.querySelector('[data-lens]');
  const canvas = holder?.querySelector('canvas');
  if (!holder || !canvas || !plan) return null;
  const TH = 0.42; // the view's tilt (rad): the lens's near edge shows
  let THREE = null, renderer = null, scene = null, cam = null, mat = null, tex = null, texCanvas = null;
  let W = 0, Hh = 0, a = 0;
  // the lens's contact point on the sheet, in % of the plan (y down): over the tag of «ЗАЛ A»
  const home = (() => { const [x, y] = P(4.1, 5.1); return [x / VB[0], y / VB[1]]; })();
  const pos = { x: home[0], y: home[1] };
  let raf = 0, dirty = false, alive = true, ready = false, visible = true;

  const setCss = () => {
    holder.style.setProperty('--lx', `${(pos.x * 100).toFixed(3)}%`);
    holder.style.setProperty('--ly', `${(pos.y * 100).toFixed(3)}%`);
  };
  setCss();
  holder.style.setProperty('--tilt', Math.cos(TH).toFixed(4));

  // the plan's texture: the same drawing (its colours written in), then its labels with the page's own faces
  async function paintTexture() {
    const k = Math.min(2048 / W, Math.min(devicePixelRatio || 1, 1.5) * 1.8);
    const tw = Math.round(W * k), th = Math.round(Hh * k);
    texCanvas = texCanvas || document.createElement('canvas');
    texCanvas.width = tw; texCanvas.height = th;
    const g = texCanvas.getContext('2d');
    const names = [...plan.querySelectorAll('.pp-t')];
    const svgText = planSVG({ shapes: planModel(L, ['', '', '']).shapes, labels: [] }, { tex: true, sw: SWATCH[swatch()] });
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
    try { img.src = url; await img.decode(); } finally { URL.revokeObjectURL(url); }
    g.clearRect(0, 0, tw, th);
    // the SVG sits in its box with «meet»: the same fit here
    const sc = Math.min(tw / VB[0], th / VB[1]);
    const ox = (tw - VB[0] * sc) / 2, oy = (th - VB[1] * sc) / 2;
    g.fillStyle = CYC; g.fillRect(0, 0, tw, th);
    g.drawImage(img, ox, oy, VB[0] * sc, VB[1] * sc);
    try { await Promise.all([document.fonts.load('400 10px "IBM Plex Mono"', 'АZ'), document.fonts.load('500 10px "IBM Plex Mono"', 'АZ'), document.fonts.load('300 10px Unbounded', '01')]); } catch (err) { /* the fallback face */ }
    for (const el of names) {
      const x = +el.getAttribute('x'), y = +el.getAttribute('y'), s = +el.getAttribute('font-size');
      const cs = getComputedStyle(el);
      g.save();
      g.translate(ox + x * sc, oy + y * sc);
      const rot = /rotate\(([-\d.]+)/.exec(el.getAttribute('transform') || '');
      if (rot) g.rotate((Number(rot[1]) * Math.PI) / 180);
      g.font = `${cs.fontWeight} ${s * sc}px ${cs.fontFamily}`;
      if ('letterSpacing' in g) g.letterSpacing = `${(parseFloat(cs.letterSpacing) || 0) * (s * sc) / (parseFloat(cs.fontSize) || s)}px`;
      g.textAlign = { middle: 'center', end: 'right' }[el.getAttribute('text-anchor')] || 'left';
      g.fillStyle = cs.fill && cs.fill !== 'none' ? cs.fill : INK;
      g.globalAlpha = Number(cs.fillOpacity || 1) * Number(cs.opacity || 1);
      g.fillText(el.textContent, 0, 0);
      g.restore();
    }
    if (tex) tex.needsUpdate = true;
  }

  function size() {
    const r = plan.getBoundingClientRect();
    W = plan.clientWidth; Hh = plan.clientHeight;
    if (!W || !Hh) return false;
    a = 0.155 * W;
    holder.style.setProperty('--la', `${a.toFixed(2)}px`);
    if (renderer) {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      renderer.setSize(W, Hh, false);
    }
    return !!r;
  }

  function uniforms() {
    const u = mat.uniforms;
    const T = 0.74 * a, E = 0.07 * a, sb = 0.1 * a, st = T - E - sb;
    u.uBox.value.set(W, Hh);
    const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
    u.uRes.value.copy(buf);
    u.uC.value.set(pos.x * W, Hh - pos.y * Hh);
    u.uA.value = a; u.uT.value = T; u.uE.value = E; u.uSb.value = sb;
    u.uRb.value = (a * a + sb * sb) / (2 * sb);
    u.uRt.value = (a * a + st * st) / (2 * st);
  }
  function render() {
    raf = 0;
    if (!renderer || !alive) return;
    uniforms();
    renderer.render(scene, cam);
    setCss();
    if (!ready) { ready = true; holder.classList.add('is-gl'); }
  }
  const frame = () => { if (!raf && alive) raf = requestAnimationFrame(render); };

  // the entrance: 4cqw across the plan, settling over «ЗАЛ A»; then nothing runs
  function arrive() {
    if (still || phone) { pos.x = home[0]; pos.y = home[1]; frame(); return; }
    const from = home[0] - (0.04 * vp.clientWidth) / W;
    const t0 = performance.now(), dur = 1500;
    const ease = (t) => 1 - Math.pow(1 - t, 3.2);
    const step = (now) => {
      if (!alive) return;
      const k = Math.min(1, (now - t0) / dur);
      pos.x = from + (home[0] - from) * ease(k);
      render();
      if (k < 1 && visible) requestAnimationFrame(step);
      else { pos.x = home[0]; render(); }
    };
    requestAnimationFrame(step);
  }

  // dragging along the plan (a mouse; a phone keeps its still)
  const hit = (ev) => {
    const r = plan.getBoundingClientRect();
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    const cx = pos.x * W, cy = pos.y * Hh - 0.37 * a * Math.sin(TH);
    return { x, y, inside: ((x - cx) / a) ** 2 + ((y - cy) / (a * Math.cos(TH) + 0.3 * a)) ** 2 < 1 };
  };
  let grab = null;
  if (!phone && !still) {
    canvas.addEventListener('pointermove', (ev) => {
      if (ev.pointerType === 'touch') return;
      const h = hit(ev);
      if (grab) {
        pos.x = Math.max(a / W, Math.min(1 - a / W, (h.x - grab.dx) / W));
        pos.y = Math.max((a * 0.95) / Hh, Math.min(1 - (a * 0.75) / Hh, (h.y - grab.dy) / Hh));
        frame();
      } else canvas.style.cursor = h.inside ? 'grab' : '';
    });
    canvas.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType === 'touch' || !ready) return;
      const h = hit(ev);
      if (!h.inside) return;
      grab = { dx: h.x - pos.x * W, dy: h.y - pos.y * Hh };
      canvas.setPointerCapture(ev.pointerId);
      canvas.style.cursor = 'grabbing';
      holder.classList.add('is-drag');
    });
    const up = () => { if (grab) holder.dataset.dragEnd = String(performance.now()); grab = null; canvas.style.cursor = ''; holder.classList.remove('is-drag'); };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
  }

  // only while the hero is in the frame and the frame on the screen
  const io = new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible && dirty) { dirty = false; frame(); } }, { root: vp, threshold: 0 });
  io.observe(plan);
  const ro = new ResizeObserver(() => { if (!renderer) return; if (size()) paintTexture().then(frame).catch(() => {}); });
  ro.observe(plan);
  dispose(() => {
    alive = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
    try { tex?.dispose(); mat?.dispose(); scene?.children.forEach((m) => m.geometry?.dispose()); renderer?.dispose(); renderer?.forceContextLoss(); } catch (err) { /* already lost */ }
  });

  // three.js and the first frame, once the hero has been seen (the poster until then)
  seen(plan, async () => {
    const seenAt = performance.now();
    try {
      THREE = await import('three');
      if (!alive) return;
      if (!size()) return;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      renderer.setSize(W, Hh, false);
      scene = new THREE.Scene();
      cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      texCanvas = document.createElement('canvas');
      await paintTexture();
      if (!alive) return;
      tex = new THREE.CanvasTexture(texCanvas);
      tex.colorSpace = THREE.NoColorSpace;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      mat = new THREE.ShaderMaterial({
        uniforms: {
          uTex: { value: tex }, uBox: { value: new THREE.Vector2() }, uRes: { value: new THREE.Vector2() }, uC: { value: new THREE.Vector2() },
          uA: { value: 1 }, uT: { value: 1 }, uE: { value: 0.1 }, uSb: { value: 0.1 }, uRb: { value: 1 }, uRt: { value: 1 }, uTh: { value: TH },
          uPaper: { value: new THREE.Vector3(...[CYC.slice(1, 3), CYC.slice(3, 5), CYC.slice(5, 7)].map((h) => parseInt(h, 16) / 255)) },
        },
        vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: FRAG,
        transparent: true, depthTest: false, depthWrite: false,
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
      // the plan draws itself first (about 2 s): the lens arrives on the finished drawing
      if (!still) await new Promise((res) => setTimeout(res, Math.max(0, 1950 - (performance.now() - seenAt))));
      if (alive) arrive();
    } catch (err) {
      console.warn('[n-plus] lens', err);
    }
  });

  return {
    retexture() { if (!renderer || !alive) return; paintTexture().then(() => { if (visible) frame(); else dirty = true; }).catch(() => {}); },
  };
}
