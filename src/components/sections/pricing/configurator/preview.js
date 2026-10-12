/**
 * The live preview: for every configuration, a finished-looking sample site of «Ваш бренд» inside a fixed
 * browser frame (the frame never changes size). One business per format, whatever the design level or the
 * add-ons (product spec pd7, 9 Oct 2026):
 *   - Лендінг: a daylight photo studio on Podil, a full one-pager that scrolls slowly inside the frame and
 *     rests on the hero after every change;
 *   - Сайт 5–7 сторінок: a law firm for business, four complete pages behind the browser tabs (Головна /
 *     Послуги / Про нас / Контакти), switched by the tour and by a click (a tap on touch screens);
 *   - Магазин: glass decor: a hero product, categories, a product grid, a product card with «У кошик» and a
 *     cart badge that counts;
 *   - «У мене вже є сайт»: an auto service's dated site and a story told one step at a time, the caption in
 *     the browser bar: their site stays as it is → the ad in a search → the visit → (the AI-асистент
 *     answers on their site) → the request in Telegram / in the CRM → the report, or (analytics alone, 10 Oct)
 *     where the requests come from (only what was chosen).
 *   - Базовий reads premium through restraint: a lighter, larger headline, a full-bleed hero image, one
 *     button and a text link, a facts strip instead of fake logos, flat calm components, each business's
 *     own palette and logo mark (never Lumera's ember or lime), no placeholder portraits. The studio's
 *     Базовий is «Денне світло» (PD21): paper in daylight, centred type, a fan of prints of its three halls.
 *   - Авторський: the dark, editorial art direction (serif display, mono labels, ember) with a concept
 *     first screen and one signature per sample: the law firm's «§», the store's giant word. The studio's
 *     Авторський is its own: «Синя година» (concept B, 10 Oct), a magazine's cover at night in navy, cream
 *     and peach (Playfair Display + Sofia Sans Extra Condensed), five blocks, each with its own magazine
 *     device; its «Анімація» is a one-time entrance per block (rb-anim.js mountCover), no Silk, no loops
 *     but the sticker's slow turn.
 *   - add-ons change the site visibly: Анімація (fx.js: React Bits «Silk» under the hero, the headline
 *     blurring in word by word, a rotating word, counting numbers, a light round the call to action, the
 *     facts strip as a marquee, icons drawing themselves; the markup they need is rendered here at all
 *     times, so switching it on or off reflows nothing), 3D (a live crystal cube, cube-gl.js, standing where
 *     the sample's own still cube stood: no box, an idle turn, a tilt toward the pointer, a drag on touch),
 *     Друга мова (a UA↔EN switch in the header that flips the hero and the menu);
 *   - the lead add-ons live in their own place, never over the site's text: a tray along the frame's bottom
 *     edge on a desktop (the ad, the Telegram push, the CRM window, the monthly report, or with analytics
 *     alone its «звідки заявки» card; one at a time), one
 *     notification at a time over the browser bar on a phone; the AI-асистент is the one add-on that sits
 *     on the site itself (a chat over the hero image), because that is where it works. The site's first
 *     screen always leaves the tray's room (css H2), so nothing in it moves when an add-on is switched;
 *   - a site option just switched on is named in the browser bar («+ анімація»), not over the site.
 * The frame is as wide as the summary card; a short screen makes it shorter, never narrower (css H1).
 * Imagery is our own: the crystal cube's renders (tinted glass sprites, the live cube and its stills) set in CSS/SVG
 * scenes (the studio's daylight hall, the lawyer's desk), drawn icons. No photographs, no portraits.
 * Everything that moves runs in fx.js, only while the frame is live.
 *
 * mountPreview(el, { t, lang, assets, reducedMotion, phone }) → { update(cfg), pause(v), fx }
 */
import { SITE } from './site-copy.js';
import { createFx } from './fx.js';
import { hasAds } from './engine.js';

const I = (d, w = 1.5) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d.replace(/<(path|rect|circle|ellipse|line|polyline)\b/g, '<$1 pathLength="1"')}</svg>`;
const ICO = {
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>'),
  pin: I('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  mail: I('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>'),
  clock: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  arrow: I('<path d="M7 17 17 7M8.5 7H17v8.5"/>', 1.6),
  right: I('<path d="M4.5 12h15M13.5 6l6 6-6 6"/>', 1.6),
  bag: I('<path d="M5 8h14l-1 12.5H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
  search: I('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>'),
  heart: I('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>', 2),
  truck: I('<path d="M3.5 6.5h10v10h-10zM13.5 10h4l3 3v3.5h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
  hand: I('<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v7.5a6.5 6.5 0 0 1-6.5 6.5A6.5 6.5 0 0 1 5 15.5l-1.4-3a1.5 1.5 0 0 1 2.6-1.4L8 13"/>'),
  card: I('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  cube: I('<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>'),
  candle: I('<path d="M10 9h4v11h-4zM12 9V7"/><path d="M12 3.5c1.2 1.2 1.2 2.4 0 3.5-1.2-1.1-1.2-2.3 0-3.5z"/><path d="M7 20h10"/>'),
  vase: I('<path d="M9 3.5h6M9.5 3.5c0 3-3.5 4.5-3.5 9A6 6 0 0 0 12 20.5 6 6 0 0 0 18 12.5c0-4.5-3.5-6-3.5-9"/>'),
  gift: I('<rect x="4" y="9" width="16" height="11.5" rx="1"/><path d="M3 9h18M12 9v11.5M12 9c-1.5-3.5-5-4-5-1.5S12 9 12 9zm0 0c1.5-3.5 5-4 5-1.5S12 9 12 9z"/>'),
  plane: I('<path d="M21 3.5 2.5 10.8l6.3 2.4L17.5 7l-6.8 7.3v6l3.5-4.3 4.4 2.9z"/>', 1.4),
  grid: I('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>', 1.4),
  chart: I('<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>', 1.4),
  ig: I('<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>'),
  tg: I('<path d="M20.5 4.5 3.5 11.2l5.6 2 2 5.8 3-3.6 4.6 3.4z"/>'),
  fb: I('<path d="M14 21v-8h3l.5-3.5H14V7.8c0-1 .3-1.8 1.8-1.8h1.8V3a24 24 0 0 0-2.6-.1c-2.6 0-4.4 1.6-4.4 4.5v2.1h-3V13h3v8"/>'),
  // the photo studio
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'),
  contrast: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M12 7h5.4M12 10.5h8.1M12 14h8.1M12 17.5h5.4"/>'),
  skylight: I('<path d="M3 20.5h18M5 20.5V10l7-6 7 6v10.5"/><path d="M9.5 10h5v5h-5zM12 10v5M9.5 12.5h5"/>'),
  calendar: I('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M8 17.5h2"/>'),
  camera: I('<path d="M4 7.5h3.5L9 5h6l1.5 2.5H20a.5.5 0 0 1 .5.5v10.5a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5z"/><circle cx="12" cy="13" r="3.6"/>'),
  // the law firm
  doc: I('<path d="M6 3.5h8.5l4 4v13H6z"/><path d="M14.5 3.5v4h4M9 11h6.5M9 14h6.5M9 17h4"/>'),
  columns: I('<path d="M12 3.5 4 7.5v1.5h16V7.5zM4 20.5h16M5 18h14"/><path d="M7 9.5V18M12 9.5V18M17 9.5V18"/>'),
  scales: I('<path d="M12 4v16M7.5 20h9M5 7h14"/><path d="M5 7 2.5 13a2.6 2.6 0 0 0 5 0zM19 7l-2.5 6a2.6 2.6 0 0 0 5 0z"/>'),
  pen: I('<path d="m15.5 4.5 4 4L9 19l-5 1 1-5z"/><path d="m13.5 6.5 4 4"/>'),
  chat: I('<path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4z"/><path d="M8 9.5h8M8 12.5h5"/>'),
  check: I('<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.7 2.7 5.6-5.6"/>'),
  // the auto service
  gauge: I('<path d="M3.5 16.5a8.5 8.5 0 1 1 17 0"/><path d="m12 16.5 4.2-5"/><circle cx="12" cy="16.5" r="1.2"/>'),
  drop: I('<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/>'),
  tire: I('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v5.3M12 15.2v5.3M3.5 12h5.3M15.2 12h5.3"/>'),
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('');
const stars = (n = 5) => `<span class="pv-stars">${ICO.star.repeat(n)}</span>`;

/* the cube as a line drawing (Авторський without 3D): the six spokes of a glass cube seen corner-on */
const CUBELINE = '<svg class="pv-cubeline" viewBox="0 0 100 100" aria-hidden="true">'
  + '<path class="pv-cubeline__face" d="M50 18 79.4 35 50 52 20.6 35z"/>'
  + '<path class="pv-cubeline__glow" d="M50 18 79.4 35v34L50 86 20.6 69V35zM50 52v34M50 52 20.6 35M50 52 79.4 35"/>'
  + '<path class="pv-cubeline__back" d="M50 52V18M50 52 20.6 69M50 52 79.4 69"/>'
  + '<path class="pv-cubeline__front" d="M50 18 79.4 35v34L50 86 20.6 69V35zM50 52v34M50 52 20.6 35M50 52 79.4 35"/></svg>';

/* the tinted glass cubes: one sprite per skin (light: on white, multiplied; dark: on black, lightened) */
const TINT = { clear: 0, amber: 1, ember: 2, smoke: 3, sage: 4 };
// (the hero's still cube carries data-slot-default: the live 3D cube takes its place)
const cubeImg = (tint, cls = '', slot = false) => `<i class="pv-cube ${cls}" style="--t:${TINT[tint]}" aria-hidden="true"${slot ? ' data-slot-default' : ''}></i>`;

/* ---------- the Базовий hero images: our own scenes, one light from the right ---------- */
// the photo studio («Денне світло», PD21): its three halls as our own CSS/SVG rooms, drawn in % of their box
// (one markup serves the fan of prints in the hero and the halls' cards): Південь (white walls, sun patches
// from three south windows; the clear cube; the 3D cube stands on its line), Графіт (dark walls, a softbox,
// the smoke cube from the dark sprite), Мансарда (a sloped ceiling, two skylights, the sage cube)
const ROOM = {
  south: (slot = false) => '<div class="pv-room pv-room--south" aria-hidden="true"><i class="pv-room__sun"></i><i class="pv-room__sun"></i><i class="pv-room__sun"></i><i class="pv-room__floor"></i><i class="pv-room__pool"></i>'
    + `<i class="pv-cast"${slot ? ' data-slot-default' : ''}></i>${cubeImg('clear', 'pv-cube--room', slot)}</div>`,
  graphite: () => '<div class="pv-room pv-room--graphite" aria-hidden="true"><i class="pv-room__floor"></i><i class="pv-room__beam"></i>'
    + '<svg class="pv-room__box" viewBox="0 0 64 120"><path d="M6 8h30l18 14v28L36 64H6z"/><path d="M36 8v56M27 64v44M27 108l-14 9M27 108l14 9"/></svg>'
    + `<i class="pv-cast"></i>${cubeImg('smoke', 'pv-cube--room pv-cube--dk')}</div>`,
  attic: () => '<div class="pv-room pv-room--attic" aria-hidden="true"><i class="pv-room__roof"></i><i class="pv-room__sky"></i><i class="pv-room__sky"></i><i class="pv-room__ray"></i><i class="pv-room__ray"></i><i class="pv-room__floor"></i>'
    + `<i class="pv-cast"></i>${cubeImg('sage', 'pv-cube--room')}</div>`,
};
const ROOMS = [ROOM.south, ROOM.graphite, ROOM.attic];
// the law firm: a stone desk in window light, a signed sheet of paper, a pen, the smoke cube as a paperweight
const DESK = '<div class="pv-desk" aria-hidden="true"><i class="pv-desk__light"></i><i class="pv-desk__stone"></i>'
  + '<div class="pv-desk__paper"><i></i><i></i><i></i><i></i><i></i><svg class="pv-desk__sign" viewBox="0 0 60 16"><path d="M2 12c6-1 8-9 11-9s-1 10 3 10 5-8 8-8-1 6 2 6 5-4 9-5 8 2 12 1"/></svg></div>'
  + `<svg class="pv-desk__pen" viewBox="0 0 100 12"><path d="M4 6h78l10-3v6l-10-3"/><path d="M4 4.5h76v3H4z"/></svg><i class="pv-desk__cast" data-slot-default></i>${cubeImg('smoke', 'pv-cube--desk', true)}</div>`;

/* ---------- bits shared by the skins ---------- */
// a line with its EN twin stacked in the same cell: «Друга мова» flips them, nothing moves
const lx = (a, b) => (b == null ? esc(a) : `<span class="pv-lx"><span class="pv-lx__a">${esc(a)}</span><span class="pv-lx__b" lang="en">${esc(b)}</span></span>`);
// a heading: the whole UA heading and the whole EN heading share one cell (no gap opens inside it)
const wds = (t) => String(t).split(/\s+/).filter(Boolean).map((w) => `<span class="rb-w">${esc(w)}</span>`).join(' ');
const chars = (w) => [...w].map((ch) => `<span class="rb-ch">${esc(ch)}</span>`).join('');
// a cell as wide as its widest word: «Анімація» swaps the word inside it, nothing around it moves
const rotCell = (list) => `<span class="rb-rot">${list.map((w, i) => `<span class="rb-rot__v${i ? '' : ' is-on'}">${chars(w)}</span>`).join('')}</span>`;
const emRot = (em, rot) => {
  if (!rot) return wds(em);
  const head = String(em).replace(/\s*\S+$/, '');
  return `${head ? wds(head) + ' ' : ''}<span class="rb-w rb-w--rot">${rotCell(rot)}</span>`;
};
const lxh = (h1, em, e, rot) => (e == null
  ? `${wds(h1)} <em>${emRot(em, rot)}</em>`
  : `<span class="pv-lx pv-lx--blk"><span class="pv-lx__a">${wds(h1)} <em>${emRot(em, rot)}</em></span><span class="pv-lx__b" lang="en">${wds(e.h1)} <em>${wds(e.em)}</em></span></span>`);
// numbers count up under «Анімація» (CountUp) in a cell as wide as the final number
const nums = (t) => esc(t).replace(/\d+(?:[.,]\d+)?/g, (n) => {
  const sep = n.includes(',') ? ',' : '';
  const dec = (n.split(/[.,]/)[1] || '').length;
  return `<span class="rb-num" data-to="${n.replace(',', '.')}" data-dec="${dec}"${sep ? ` data-sep="${sep}"` : ''}><span class="rb-num__f">${n}</span><span class="rb-num__l" aria-hidden="true"></span></span>`;
});
// the main call to action carries StarBorder's light (hidden until «Анімація»)
const STAR = '<i class="rb-star__fx" aria-hidden="true"><i></i><i></i></i>';
// ShinyText on the eyebrow: each line carries a lighter copy of itself in a window that slides across
// (hidden until «Анімація»); the copy slides back by as much, so only the letters light up
const shine = (t) => `<span class="rb-shine__win" aria-hidden="true"><span class="rb-shine__txt">${t}</span></span>`;
// the eyebrow's line and the lines that take turns with it under «Анімація» (one cell: the widest sets the width)
// (a line may come as ready HTML, { html }: the studio's pill carries its EN twin)
const words = (first, rest, sh = false) => `<span class="pv-words">${[first, ...rest].map((w, i) => { const h = typeof w === 'object' ? w.html : esc(w); return `<span${i ? '' : ' class="is-on"'}>${h}${sh ? shine(h) : ''}</span>`; }).join('')}</span>`;
// the Авторський first screen: its concept lines (`a`) over the shared ones
const concept = (s) => (s?.a ? { ...s, ...s.a } : s);

// the logo: «Ваш бренд» with each business's own mark on Базовий (aperture / columns / facet), the round
// ember mark on Авторський
// day: the studio's «Денне світло» header (the menu as a pill, its first item lit, the button with an arrow)
function header(c, e, { cart = false, nav, cta, design, mark = '', day = false }) {
  const logo = `<span class="pv-logo"><i class="pv-logo__m${design === 'b' && mark ? ` pv-logo__m--${mark}` : ''}"></i>${esc(c.brand)}</span>`;
  const links = nav.map((x, i) => `<span${day && !i ? ' class="is-on"' : ''}>${lx(x, e?.nav?.[i])}</span>`).join('');
  const lang = '<span class="pv-lang" aria-hidden="true"><b class="pv-lang__a">UA</b><b class="pv-lang__b">EN</b></span>';
  const right = cart
    ? `<span class="pv-ico" data-ico>${ICO.search}</span>${lang}<span class="pv-cartbtn" data-ico>${ICO.bag}<b class="pv-cartbtn__n" data-cart>2</b></span>`
    : day ? `${lang}<span class="pv-btn pv-btn--sm pv-btn--arrow">${lx(cta, e?.cta)}<b class="pv-btn__ar">${ICO.arrow}</b></span>`
      : `${lang}<span class="pv-btn pv-btn--sm">${lx(cta, e?.cta)}</span>`;
  return `<header class="pv-hdr pv-hdr--${design}${day ? ' pv-hdr--day' : ''}">${logo}<nav class="pv-nav${day ? ' pv-nav--pill' : ''}">${links}</nav><div class="pv-hdr__r">${right}</div></header>`;
}
function footer(f, brand, design, word = design === 'a') {
  return `<footer class="pv-ftr pv-ftr--${design}">
    <div class="pv-ftr__brand"><span class="pv-logo">${esc(brand)}</span>${word ? `<span class="pv-ftr__word" aria-hidden="true">${esc(brand)}</span>` : ''}</div>
    <div class="pv-ftr__col"><span>${ICO.pin}${esc(f.addr)}</span><span>${ICO.phone}${esc(f.phone)}</span><span>${ICO.mail}${esc(f.mail)}</span></div>
    <div class="pv-ftr__soc"><i data-ico>${ICO.ig}</i><i data-ico>${ICO.tg}</i><i data-ico>${ICO.fb}</i></div>
    <span class="pv-ftr__copy">${esc(f.copy)}</span>
  </footer>`;
}
const form = (s, dark) => `<div class="pv-form${dark ? ' pv-form--dark' : ''}">
    ${s.fields.map(([k, v]) => `<span class="pv-field"><span>${esc(k)}</span><b>${esc(v)}</b></span>`).join('')}
    <span class="pv-btn pv-btn--full">${esc(s.send)}${ICO.arrow}</span><span class="pv-form__note">${ICO.clock}${esc(s.formNote)}</span>
  </div>`;
const objSlot = '<div class="pv-objslot" data-obj></div>';
// three flat cards: a line icon (no tile), the name, a line, the price
const cards3 = (list, icons) => `<div class="pv-cards3">${list.map(([t, d, p], i) => `<div class="pv-card"><span class="pv-icobox" data-ico>${icons[i]}</span><b>${esc(t)}</b><span>${esc(d)}</span><span class="pv-card__p">${esc(p)}${ICO.arrow}</span></div>`).join('')}</div>`;
// the steps: a line icon (Базовий) or a mono number (Авторський), no circle
const steps4 = (list, icons, A) => `<div class="pv-steps">${list.map(([t, d], i) => `<div class="pv-step"><span class="pv-step__n" data-ico>${A ? '0' + (i + 1) : icons[i]}</span><b>${A ? '' : `${i + 1}. `}${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div>`;
// the AI-асистент: the one lead add-on on the site itself, a chat over the hero image (css H9; fx loops it)
const chat = (C, fmt) => {
  const [q, a, short] = C.chat[fmt];
  return `<div class="pv-chat" aria-hidden="true" data-chat="answer"><div class="pv-chat__panel"><span class="pv-chat__head"><i class="pv-chat__dot"></i><b>${esc(C.chat.name)}</b><span>· ${esc(C.chat.status)}</span></span>`
    + `<span class="pv-chat__q"><span>${esc(q)}</span><time>${esc(C.chat.time)}</time></span><span class="pv-chat__r"><span class="pv-chat__typing"><i></i><i></i><i></i></span><span class="pv-chat__a">${esc(a)}</span></span></div>`
    + `<span class="pv-chat__short">${esc(short)}</span><span class="pv-chat__launch">${ICO.chat}</span></div>`;
};

/* ==========================================================================
   Лендінг · the photo studio
   ========================================================================== */
// «Денне світло» (PD21): paper in daylight, two soft patches of sky and sun, a window frame's shadow across the
// hero; centred text in Geologica only (500 / 300, no coloured word); under the buttons a fan of three
// prints of the halls with their prices. No entrance without «Анімація»: the fan stands open
const print = (k, i, s, e, slot = false) => {
  const [n, , p] = s.halls[i], en = e?.halls?.[i];
  return `<div class="pv-print pv-print--${k}" data-fan="${k}">${ROOMS[i](slot)}<span class="pv-print__chip"><b>${lx(n, en?.[0])}</b><span class="pv-print__p"> · ${lx(p, en?.[2])}</span></span></div>`;
};
// a heading set in two cuts: the last word (or n) soft and light after the sharp ones (one material with the H1)
const soft = (t, n = 1) => { const w = String(t).split(/\s+/); return `${esc(w.slice(0, -n).join(' '))} <span class="pv-soft">${esc(w.slice(-n).join(' '))}</span>`; };
// «80 м², білі стіни…» → «Білі стіни…»: the area has its own chip under it
const noArea = (d) => { const t = String(d).replace(/^[^,]*\d[^,]*,\s*/, ''); return t.charAt(0).toUpperCase() + t.slice(1); };
function landingB(c, s, e, opts) {
  return `${header(c, e, { nav: s.nav, cta: s.cta, design: 'b', mark: 'studio', day: true })}
  <div class="pv-scroll">
    <section class="pv-hero pv-hero--day" data-hero>
      <i class="pv-day__light" aria-hidden="true"></i><i class="pv-day__win" aria-hidden="true"><i></i></i><i class="pv-day__grain" aria-hidden="true"></i>
      <span class="pv-pill" data-in data-shine><i class="pv-pill__dot" aria-hidden="true"></i>${words({ html: lx(s.eyebrow, e?.eyebrow) }, opts.rest, true)}</span>
      <h1 class="pv-h1" data-in>${lxh(s.h1, s.em, e, s.rot)}</h1>
      <p class="pv-sub" data-in>${lx(s.sub, e?.sub)}</p>
      <div class="pv-row" data-in><span class="pv-btn pv-btn--arrow" data-cta>${STAR}${lx(s.btn, e?.btn)}<b class="pv-btn__ar">${ICO.arrow}</b></span><span class="pv-tlink pv-tlink--day">${lx(s.btn2, e?.btn2)}<i class="pv-tlink__ar" aria-hidden="true"></i></span></div>
      <div class="pv-fan">${print('l', 1, s, e)}${print('r', 2, s, e)}${print('c', 0, s, e, true)}${objSlot}</div>
    </section>
    <section class="pv-stats">${s.stats.map(([n, u, l], i) => `<div><b>${nums(n)}${u ? `<small>${esc(u)}</small>` : ''}${i === 2 ? `<i class="pv-stats__star">${ICO.star}</i>` : ''}</b><span>${esc(l)}</span></div>`).join('')}</section>
    <section class="pv-sec pv-sec--halls">
      <span class="pv-kicker">${esc(s.servicesKicker)}</span><h2 class="pv-h2">${soft(s.servicesTitle)}</h2>
      <div class="pv-halls">${s.services.map(([t, d, p], i) => `<div class="pv-hallcard"><div class="pv-hallcard__img">${ROOMS[i]()}<span class="pv-hallcard__price">${esc(p)}</span></div><b>${esc(t)}</b><span>${esc(noArea(d))}</span><span class="pv-hallcard__f"><i>${esc(s.halls[i][1])}</i><span class="pv-hallcard__go" data-ico>${ICO.arrow}</span></span></div>`).join('')}</div>
      <div class="pv-incl"><span class="pv-incl__l">${esc(s.logosLabel)}</span><div class="pv-incl__row rb-loop"><div class="rb-loop__track"><div class="rb-loop__set">${s.logos.map((l) => `<span class="pv-incl__chip">${esc(l)}</span>`).join('')}</div></div></div></div>
    </section>
    <section class="pv-sec pv-sec--soft pv-sec--route">
      <span class="pv-kicker">${esc(s.stepsKicker)}</span><h2 class="pv-h2">${soft(s.stepsTitle)}</h2>
      <div class="pv-steps pv-steps--line">${s.steps.map(([t, d], i) => `<div class="pv-step"><span class="pv-step__n" data-ico>${[ICO.phone, ICO.calendar, ICO.card, ICO.camera][i]}</span><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div>
    </section>
    <section class="pv-sec pv-sec--revs">
      <span class="pv-kicker">${esc(s.reviewsKicker)}</span><h2 class="pv-h2">${soft(s.reviewsTitle)}</h2>
      <div class="pv-revs"><figure class="pv-rev pv-rev--lead"><span class="pv-rev__q" aria-hidden="true">«</span><p>${esc(s.reviews[0][1])}»</p><figcaption><i class="pv-rev__mono">${esc(initials(s.reviews[0][0]))}</i><span>${esc(s.reviews[0][0])}</span>${stars()}</figcaption></figure>
        <div class="pv-revs__more"><span class="pv-revs__score"><b>${nums(s.stats[2][0])}</b>${ICO.star}<span>${esc(s.stats[2][2])}</span></span>${s.reviews.slice(1).map(([n, q]) => `<figure class="pv-rev"><p>«${esc(q)}»</p><figcaption><i class="pv-rev__mono">${esc(initials(n))}</i>${esc(n)}</figcaption></figure>`).join('')}</div></div>
    </section>
    <section class="pv-band pv-band--day"><i class="pv-band__win" aria-hidden="true"></i><div><h2 class="pv-h2">${soft(s.formTitle)}</h2><p>${esc(s.formSub)}</p></div>${form(s, true)}</section>
    ${footer(s.footer, c.brand, 'b', true)}
  </div>`;
}

/* ==========================================================================
   Лендінг · Авторський: «Синя година» (concept B, the owner's choice, 10 Oct 2026). A magazine at night: a
   whole issue of nine pages (round 2, the owner: «add all the new pages», «the tour turns the pages»), each
   with its own magazine device in one system (navy darkening toward the back cover, cream, peach, a cold blue
   light; Playfair Display 900 / italic 400, Sofia Sans Extra Condensed 500–800, IBM Plex Mono for the small
   print):
   01 the cover: the masthead across the page, a facts line between rules, the announcement, the numbers, a
      round sticker with its text on a circle, a barcode; with «3D-обʼєкт» the live cube stands in front of
      the masthead (no object at all without it);
   02 «Зміст»: the halls as a contents page with dotted leaders to the prices and a footnote; the open row's
      print of its hall slid out beside it;
   03 «У ціні оренди»: what the hour includes as crop-marked tiles (the backdrops' «6» on its paper sweep);
   04 the steps as a rubric: four columns, big numerals threaded on a dotted rail;
   05 «Кадри наших гостей»: three prints fanned on the table, the list of the shoots beside them;
   06 «Інтервʼю номера»: a vertical rubric, one big quote with a hanging mark, «01 / 03», two short ones;
   07 «Питання номера»: five questions, the open one's answer in a crop-marked card (all the answers share
      one cell: switching never changes a height); every answer is the studio's own facts;
   08 two tapes crossing the page, then the booking coupon on cream paper with a stub;
   09 the back cover: the sign-off, the imprint, the masthead again cut by the page's foot.
   Every inside page carries a running head (the issue, the rubric, «стор. 0N») and a jump line at its foot;
   a reading line under the header follows the tour. Each page is a [data-page]: fx.js turns them like pages
   (tour 'flip'). The markup «Анімація» moves is rendered at all times (rb-anim.js: mountCover); without it
   nothing moves but the tour.
   ========================================================================== */
// a word that rises out of a cut under «Анімація» (the outer span clips at its foot, the inner one moves)
const cutW = (t) => String(t).split(/\s+/).filter(Boolean).map((w) => `<span class="pv-cut"><span class="pv-cut__i">${esc(w)}</span></span>`).join(' ');
// the masthead: each letter rises on its own, the letters of a word in one box
const cutL = (w) => `<span class="pv-cut">${[...w].map((ch) => `<span class="pv-cut__i">${esc(ch)}</span>`).join('')}</span>`;
// the quote opens word by word
const qWords = (t) => String(t).split(/\s+/).filter(Boolean).map((w) => `<span class="pv-qw">${esc(w)}</span>`).join(' ');
// a heading whose last n words are set in the italic (Playfair 400 after 900)
const tail = (t, n = 1) => { const w = String(t).split(/\s+/); return `${esc(w.slice(0, -n).join(' '))} <em>${esc(w.slice(-n).join(' '))}</em>`; };
const lc1 = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const two = (n) => String(n).padStart(2, '0');
// the barcode: two bar patterns of different steps over each other read as one irregular code; the scan
// line crosses it once under «Анімація»
const barcode = (url) => `<span class="pv-bar" aria-hidden="true"><i class="pv-bar__code"></i><i class="pv-bar__scan"></i><span class="pv-bar__t">${esc(url)}</span></span>`;
// the round sticker: «від 600 ₴ за годину», the call to action twice round its edge (fitted to the circle
// by textLength, so UA, RU and EN all close the ring); under «Анімація» the ring turns slowly
let ringN = 0;
function sticker(s, e) {
  const id = `pvRing${++ringN}`;
  const [from, price, per] = s.cover.sticker, E = e?.cover?.sticker;
  // (twice round; a short line, EN «Book a studio», three times, so its letters stay as close as the others')
  const ring = (t, cls = '') => `<text class="pv-stk__t${cls}"><textPath href="#${id}" textLength="236" lengthAdjust="spacing">${esc(`${t} • `.repeat(t.length < 14 ? 3 : 2).toUpperCase())}</textPath></text>`;
  return `<div class="pv-stk" aria-hidden="true"><i class="pv-stk__disc"></i>`
    + `<svg class="pv-stk__ring" viewBox="0 0 100 100"><defs><path id="${id}" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs>${ring(s.btn)}${e ? ring(e.btn, ' pv-stk__t--en') : ''}</svg>`
    + `<span class="pv-stk__mid"><small>${lx(from, E?.[0])}</small><b>${lx(price, E?.[1])}</b><small>${lx(per, E?.[2])}</small></span></div>`;
}
// the steps' own line icons (24 grid, drawn by pathLength under «Анімація»): a reply within the quarter
// hour, a day ringed on the calendar, a receipt for the advance, the camera's flash
const STEP_ICO = [
  I('<path d="M4.5 5h15A1.5 1.5 0 0 1 21 6.5v9a1.5 1.5 0 0 1-1.5 1.5H11l-4.5 3.5V17h-2A1.5 1.5 0 0 1 3 15.5v-9A1.5 1.5 0 0 1 4.5 5z"/><circle cx="12" cy="11" r="3.4"/><path d="M12 9.2V11l1.3.9"/>', 1.25),
  I('<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4M7 13.5h2M7 17h2M11 13.5h1"/><circle cx="15" cy="15.4" r="2.6"/>', 1.25),
  I('<path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="m9.5 14.5 5-5"/><circle cx="9.9" cy="9.9" r="1.1"/><circle cx="14.1" cy="14.1" r="1.1"/>', 1.25),
  I('<path d="M3.5 8.5h3.8l1.6-2.6h6.2l1.6 2.6h3.8v10.5h-17z"/><circle cx="12" cy="13.6" r="3.5"/><path d="M19 2.8v2.4M17.8 4h2.4"/>', 1.25),
];
// «У ціні оренди»'s drawings (our own, one stroke weight; peach and sky accents): the backdrops on their stand
// (a paper sweep in the cove, six roll ends on the bar), the strobe with its flash, the make-up mirror with its
// bulbs, the steamer; the parking is a letter «P»
const RENT_ICO = {
  sweep: '<svg class="pv-cell__sweep" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid meet" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path class="pv-cell__paper" d="M42 18h116v94l16 38H26l16-38z" stroke="none"/><path pathLength="1" d="M42 18v94l-16 38M158 18v94l16 38M42 112h116" opacity=".45"/>'
    + '<path pathLength="1" d="M14 14h172"/><path pathLength="1" d="M22 14v136M178 14v136"/><path class="pk" pathLength="1" d="M50 9v10M70 9v10M90 9v10M110 9v10M130 9v10M150 9v10"/></svg>',
  icons: [
    I('<path d="M5 4.5h8l3 3v6l-3 3H5z"/><path class="sk" d="M7.5 7.5h4v6h-4z"/><path d="M16 10.5h2.5M12 16.5v4.5M9.5 21h5"/><path class="pk" d="M20.5 6.5l1.5-1.5M21 10.5h1.8M20.5 14.5l1.5 1.5"/>', 0.45),
    I('<path d="M6 3.5h12v12H6z"/><path d="M3.5 18.5h17M5.5 18.5v3M18.5 18.5v3"/><path class="pk" d="M4.4 4.8v1.4M4.4 8.8v1.4M4.4 12.8v1.4M19.6 4.8v1.4M19.6 8.8v1.4M19.6 12.8v1.4"/><path class="sk" d="M9 6.5l2-2M9 9.5l5-5"/>', 0.45),
    I('<path d="M7 15.5h6v4.5H7z"/><circle cx="8" cy="21.5" r=".9"/><circle cx="12" cy="21.5" r=".9"/><path d="M10 15.5V5.5"/><path d="M13 17c4 0 5-3 5-6.5V8"/><path d="M16 5.5h4v2.5h-4z"/><path class="sk" d="M17 3.2c.6-.8-.6-1.2 0-2M19.4 3.2c.6-.8-.6-1.2 0-2"/><path class="pk" d="M8.5 5.5h3"/>', 0.45),
  ],
};
// a list with dotted leaders: [name, small note, value]
const leaders = (rows) => `<dl class="pv-ld">${rows.map(([t, u, v]) => `<div><dt>${esc(t)}${u ? `<i>${esc(u)}</i>` : ''}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
// «900 ₴/год» → «900 ₴» and a small «/год»
const priceTag = (p) => { const [v, per] = String(p).split('/'); return `${esc(v)}${per ? `<small>/${esc(per)}</small>` : ''}`; };
// the hall «Південь» for «Кадри наших гостей»: the same room, three glass pieces of the collection on its floor
const southTrio = () => '<div class="pv-room pv-room--south pv-room--trio" aria-hidden="true"><i class="pv-room__sun"></i><i class="pv-room__sun"></i><i class="pv-room__sun"></i><i class="pv-room__floor"></i><i class="pv-room__pool"></i>'
  + `<i class="pv-cast"></i>${cubeImg('amber', 'pv-cube--room pv-cube--t1')}${cubeImg('ember', 'pv-cube--room pv-cube--t3')}${cubeImg('clear', 'pv-cube--room pv-cube--t2')}</div>`;
// the header: the menu (its first item underlined), the studio's place and year, a cream pill; the reading
// line along its foot (it follows the tour, fx.js)
function coverHeader(s, e) {
  const links = s.nav.map((x, i) => `<span${i ? '' : ' class="is-on"'}>${lx(x, e?.nav?.[i])}</span>`).join('');
  return `<header class="pv-hdr pv-hdr--cover"><nav class="pv-nav">${links}</nav><div class="pv-hdr__r"><span class="pv-hdr__date">${esc(s.meta[0])} · ${esc(s.meta[1])}</span>`
    + `<span class="pv-lang" aria-hidden="true"><b class="pv-lang__a">UA</b><b class="pv-lang__b">EN</b></span><span class="pv-btn pv-btn--sm pv-btn--pill">${lx(s.cta, e?.cta)}</span></div><i class="pv-hdr__read" aria-hidden="true"></i></header>`;
}
function landingCover(c, s, e) {
  const A = s.a, EA = e?.a, K = s.cover, f = s.footer;
  const facts = [s.studioLabel, s.meta[0], s.meta[1], `${s.meta[2]} · ${s.stat[0]}`];
  const [halls, rate] = [s.stats[1], s.stats[2]];
  const [unit, ...label] = halls[2].split(' ');
  // «Фони, освітлення й гримерка вже в ціні.» (the sub's second sentence): the price lists' footnote
  const inPrice = s.sub.replace(/^[^.]*\.\s+/, '');
  // the running head and the jump line: the rubrics of the pages 01–09
  const RUB = [s.studioLabel, s.servicesKicker, s.logosLabel, s.stepsKicker, s.worksKicker, K.interview, K.faq, s.formTitle, K.imprint];
  const pg = (n) => `${esc(K.page)} ${two(n)}`;
  const rh = (n) => `<div class="pv-rh" aria-hidden="true"><span class="pv-rh__iss">${esc(c.brand)} · ${esc(K.issue)}</span><i></i><b>${esc(RUB[n - 1])}</b><i></i><span class="pv-rh__pg">${pg(n)}</span></div>`;
  const jump = (n) => `<div class="pv-jump" aria-hidden="true"><span>${esc(K.next)} — ${esc(RUB[n])}</span><i></i><b>${pg(n + 1)} →</b></div>`;
  // the headline: the caps lines and the italic line; with «Друга мова» its EN twin in the same cell
  const ua = `${cutW(A.h1)} <em>${cutW(A.em)}</em>`;
  const h1 = EA ? `<span class="pv-lx pv-lx--blk"><span class="pv-lx__a">${ua}</span><span class="pv-lx__b" lang="en">${esc(EA.h1)} <em>${esc(EA.em)}</em></span></span>` : ua;
  const stat = (n, u, l) => `<div class="pv-cover__stat"><i class="pv-rule"></i><b>${nums(n)}${u ? `<small>${esc(u)}</small>` : ''}</b><span>${esc(l)}</span></div>`;
  const mono = (n) => `<i class="pv-iv__mono">${esc(initials(n))}</i>`;
  // «Фони 6 кольорів» → «Фони», «6», «кольорів»: the big tile
  const [, bdName = s.logos[0], bdN = '', bdUnit = ''] = /^(\S+)\s+(\d+)\s+(.+)$/.exec(s.logos[0]) || [];
  // the answers, from the facts above only: the prices by hall, what the hour includes, how to book, the
  // advance, the areas
  const dash = (t) => `<p><b>—</b> ${t}</p>`;
  const answers = [
    `${dash(esc(K.byHall))}${leaders(s.halls.map(([n, a, p]) => [n, a, priceTag(p)]))}<p class="pv-fn"><b>*</b> ${esc(inPrice)}</p>`,
    dash(esc(s.logos.map((l, i) => (i ? lc1(l) : l)).join(', ') + '.')),
    `${dash(esc(s.formSub))}<p class="pv-faq__nt">${ICO.clock}${esc(s.formNote)}</p>`,
    dash(esc(`${K.yes}, ${s.steps[2][1]}.`)),
    `${dash(esc(`${halls[0]} ${halls[2]}:`))}${leaders(s.halls.map(([n, a]) => [n, '', esc(a)]))}<p class="pv-fn">${esc(s.stat.join(' '))}</p>`,
  ];
  const tapeA = [s.meta[0], s.meta[1], s.meta[2], s.stat.join(' ')];
  const tapeB = [s.btn, K.sticker.join(' ')];
  const tape = (list, n) => Array.from({ length: n }, () => list.map((x) => `<span>${esc(x)}</span>`).join('')).join('');
  return `${coverHeader(s, e)}
  <div class="pv-scroll">
    <section class="pv-hero pv-cover" data-hero data-page data-choreo="cover">
      <div class="pv-mast">${c.brand.split(/\s+/).map(cutL).join(' ')}</div>
      <div class="pv-dl"><i class="pv-rule"></i>${facts.map((x) => `<span>${esc(x)}</span>`).join('')}<i class="pv-rule"></i></div>
      ${objSlot}
      <div class="pv-cover__z">
        <div class="pv-cover__cl">
          <span class="pv-cover__k">${lx(A.eyebrow, e?.eyebrow)}</span>
          <h1 class="pv-h1 pv-cover__h1">${h1}</h1>
          <p class="pv-cover__sub">${lx(s.sub, e?.sub)}</p>
        </div>
        <div class="pv-cover__ctas"><span class="pv-btn pv-btn--cover" data-cta>${lx(s.btn, e?.btn)}<b class="pv-btn__sq">${ICO.right}</b></span><span class="pv-cover__tl">${lx(s.btn2, e?.btn2)}</span></div>
        <div class="pv-cover__side">${stat(halls[0], unit, label.join(' '))}${stat(rate[0], '', rate[2])}</div>
        ${sticker(s, e)}
      </div>
      ${barcode(c.url)}
    </section>
    <section class="pv-toc" data-page data-c="toc">
      ${rh(2)}
      <div class="pv-toc__head"><h2 class="pv-h2"><span class="pv-cut"><span class="pv-cut__i">${esc(K.toc)}</span></span> <em>${esc(lc1(s.servicesKicker))}</em></h2><span class="pv-toc__aside">${esc(s.servicesTitle)}</span><i class="pv-rule"></i></div>
      ${s.halls.map(([n, a, p], i) => `<div class="pv-toc__row${i ? '' : ' is-on'}">${i ? '' : '<i class="pv-toc__band"></i>'}<span class="pv-toc__n"><span class="pv-fold">${[...two(i + 1)].map((d) => `<i>${d}</i>`).join('')}</span></span>`
        + `<b class="pv-toc__name"><span>${esc(n)}</span><i class="pv-toc__ld"></i></b><span class="pv-toc__d"><i>${esc(a)}</i> · ${esc(noArea(s.services[i][1]))}</span><span class="pv-toc__p">${esc(p)}</span><span class="pv-toc__ar" data-ico>${ICO.right}</span>`
        + `${i ? '' : `<figure class="pv-toc__print">${ROOM.south()}<figcaption>${esc(s.services[0][0])}</figcaption></figure>`}</div>`).join('')}
      <p class="pv-fn pv-toc__fn"><b>*</b> ${esc(inPrice)}</p>
      ${jump(2)}
    </section>
    <section class="pv-rent" data-page data-c="rent">
      ${rh(3)}
      <div class="pv-rent__head"><h2 class="pv-h2">${tail(s.logosLabel)}</h2><span class="pv-rent__aside">${esc(inPrice)}</span><i class="pv-rule"></i></div>
      <div class="pv-rent__grid">
        <div class="pv-cell pv-cell--a"><i class="pv-crop"></i><span class="pv-cell__n">01 / ${two(s.logos.length)}</span>${RENT_ICO.sweep}<span class="pv-cell__six"><b>${nums(bdN)}</b><em>${esc(bdUnit)}</em></span><span class="pv-cell__t">${esc(bdName)}</span></div>
        ${s.logos.slice(1).map((l, i) => `<div class="pv-cell pv-cell--${'bcde'[i]}">${i ? '' : '<i class="pv-cell__flash"></i>'}<i class="pv-crop"></i><span class="pv-cell__n">${two(i + 2)}</span>`
          + `${RENT_ICO.icons[i] ? `<span class="pv-cell__ico" data-ico>${RENT_ICO.icons[i]}</span>` : '<span class="pv-cell__p" aria-hidden="true">P</span>'}<span class="pv-cell__t">${esc(l)}</span></div>`).join('')}
      </div>
      ${jump(3)}
    </section>
    <section class="pv-rub" data-page data-c="steps">
      ${rh(4)}
      <div class="pv-rub__head"><span class="pv-tag">${esc(s.stepsKicker)}</span><h2 class="pv-h2">${tail(s.stepsTitle, 2)}</h2></div>
      <div class="pv-rub__cols"><i class="pv-rub__rail"></i>${s.steps.map(([t, d], i) => {
        // the rail's stations: a node after each numeral; «15 хв» at the request, «30%» at the advance (facts)
        const mk = i === 0 ? `${s.stats[3][0]} ${s.stats[3][1]}` : i === 2 ? s.steps[2][1].split(',')[0] : '';
        return `<div class="pv-rub__col"><i class="pv-rule"></i><span class="pv-rub__n"><span class="pv-cut"><span class="pv-cut__i">${i + 1}</span></span><i class="pv-rub__node"></i>${mk ? `<small class="pv-rub__mk">${esc(mk)}</small>` : ''}</span>`
          + `<span class="pv-rub__ico" data-ico>${STEP_ICO[i]}</span><b>${esc(t)}</b><span>${esc(d)}</span></div>`;
      }).join('')}</div>
      ${jump(4)}
    </section>
    <section class="pv-gal" data-page data-c="gal">
      ${rh(5)}
      <div class="pv-gal__grid">
        <div class="pv-gal__text">
          <h2 class="pv-h2">${tail(s.worksTitle, 2)}</h2>
          <ol class="pv-gal__list">${s.works.map(([t, m], i) => `<li class="pv-gal__w${i ? '' : ' is-on'}">${i ? '' : '<i class="pv-gal__mk"></i>'}<span class="pv-gal__n">${two(i + 1)}</span><span><b>${esc(t)}</b><i>${esc(m)}</i></span></li>`).join('')}</ol>
          <span class="pv-gal__exif">${I('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5 15 9M20.5 12h-6.6M15.8 19.6l-3.3-5.7M6 18l3.3-5.7M3.5 12h6.6M8.4 4.4l3.3 5.7"/>', 1.2)}${esc(A.exif)}</span>
        </div>
        <div class="pv-gal__stage">
          <span class="pv-gal__idx"><b>01</b> / ${two(s.works.length)}</span>
          <figure class="pv-gpr pv-gpr--2">${ROOM.graphite()}<figcaption>${esc(s.works[1][0])}</figcaption></figure>
          <figure class="pv-gpr pv-gpr--3">${ROOM.attic()}<figcaption>${esc(s.works[2][0])}</figcaption></figure>
          <figure class="pv-gpr pv-gpr--1"><span class="pv-gpr__tag">${esc(K.fig)} 1</span>${southTrio()}<figcaption>${esc(s.works[0][0])}</figcaption></figure>
        </div>
      </div>
      ${jump(5)}
    </section>
    <section class="pv-iv" data-page data-c="iv">
      <span class="pv-iv__vr" aria-hidden="true">${esc(K.interview)}</span>
      ${rh(6)}
      <div class="pv-iv__body">
        <div class="pv-iv__side"><i class="pv-rule"></i><b class="pv-iv__score">${nums(rate[0])}</b>${stars()}<span class="pv-iv__cnt">${esc(rate[2])}</span>
          <span class="pv-iv__of"><b>01</b> / ${two(s.reviews.length)}</span><span class="pv-iv__bars">${s.reviews.map((r, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</span></div>
        <figure class="pv-iv__lead"><span class="pv-iv__q" aria-hidden="true">“</span><p>${qWords(s.reviews[0][1])}</p><figcaption>${mono(s.reviews[0][0])}<span>${esc(s.reviews[0][0])}</span></figcaption></figure>
        <div class="pv-iv__more"><i class="pv-rule"></i>${s.reviews.slice(1).map(([n, q]) => `<figure class="pv-iv__rev"><p>«${esc(q)}»</p><figcaption>${mono(n)}<span>${esc(n)}</span></figcaption></figure>`).join('')}</div>
      </div>
      ${jump(6)}
    </section>
    <section class="pv-faq" data-page data-c="faq">
      ${rh(7)}
      <div class="pv-faq__grid">
        <div class="pv-faq__side">
          <span class="pv-faq__ghost" aria-hidden="true">?</span>
          <h2 class="pv-h2">${tail(K.faq)}</h2>
          <div class="pv-faq__card"><i class="pv-crop"></i>${answers.map((a, i) => `<div class="pv-faq__a${i ? '' : ' is-on'}"><small>${two(i + 1)} / ${two(answers.length)}</small>${a}</div>`).join('')}</div>
        </div>
        <ol class="pv-faq__list">${K.qs.map((q, i) => `<li class="pv-faq__q${i ? '' : ' is-on'}"><span class="pv-faq__n">${two(i + 1)}</span><span class="pv-faq__t">${esc(q)}</span><i class="pv-faq__x"></i><i class="pv-faq__ul"></i></li>`).join('')}</ol>
      </div>
      ${jump(7)}
    </section>
    <section class="pv-end" data-page>
      ${rh(8)}
      <div class="pv-rib" data-c="rib" aria-hidden="true"><div class="pv-tape pv-tape--a"><div class="pv-tape__run">${tape(tapeA, 4)}</div></div><div class="pv-tape pv-tape--b"><div class="pv-tape__run">${tape(tapeB, 6)}</div></div></div>
      <div class="pv-cutl" data-c="form">
        <svg class="pv-cutl__sc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 7.6 20 16.5M8.6 16.4 20 7.5"/></svg>
        <div class="pv-cp">
          <div class="pv-cp__main">
            <div class="pv-cp__k"><span>${esc(c.url)}</span><span>${esc(s.meta[0])} · ${esc(s.meta[1])}</span></div>
            <div class="pv-cp__t"><h2 class="pv-h2">${tail(s.formTitle)}</h2><p>${esc(s.formSub)}</p></div>
            <div class="pv-cp__f">${s.fields.map(([k, v]) => `<span class="pv-cf"><span>${esc(k)}</span><b>${esc(v)}</b><i class="pv-rule"></i></span>`).join('')}
              <span class="pv-btn pv-btn--ink">${esc(s.send)}<b class="pv-btn__sq">${ICO.right}</b></span><span class="pv-form__note">${ICO.clock}${esc(s.formNote)}</span></div>
          </div>
          <div class="pv-cp__stub"><div><small>${esc(K.sticker[0])}</small><b>${esc(K.sticker[1])}</b><small>${esc(K.sticker[2])}</small></div>${barcode(c.url)}<span class="pv-cp__no">${esc(K.issue)}</span></div>
        </div>
      </div>
      ${jump(8)}
    </section>
    <footer class="pv-ftr pv-back" data-page data-c="colo">
      <div class="pv-back__sign"><p>${esc(A.h1)} <em>${esc(A.em)}</em></p><span>${esc(K.issue)}</span><i class="pv-rule"></i></div>
      <div class="pv-back__grid">
        <div><span>${esc(K.imprint)}</span><b>${esc(s.studioLabel)}</b><b>${esc(s.meta[0])} · ${esc(s.meta[1])}</b></div>
        <div><span>${esc(K.heads[0])}</span><b>${esc(f.addr)}</b></div>
        <div><span>${esc(K.heads[1])}</span><b>${esc(f.phone)}</b><b>${esc(f.mail)}</b></div>
        <div><span>${esc(K.heads[2])}</span><b>${f.links.map(esc).join(' · ')}</b></div>
      </div>
      <div class="pv-back__foot"><span>${esc(f.copy)}</span><span>${pg(9)}</span></div>
      <div class="pv-back__mast" aria-hidden="true"><div>${c.brand.split(/\s+/).map(cutL).join(' ')}</div></div>
    </footer>
  </div>`;
}

/* ==========================================================================
   Сайт 5–7 сторінок · the law firm: four pages behind the tabs
   ========================================================================== */
function corpPage(c, k, e, d, page, opts) {
  const A = d === 'a';
  const H = A ? concept(k) : k, E = A ? concept(e) : e;
  const head = header(c, e, { nav: c.tabs.corporate, cta: k.cta, design: d, mark: 'law' });
  const ph = (title, intro) => `<section class="pv-phead pv-phead--${d}" data-hero><span class="pv-kicker" data-in>${esc(c.brand)} / ${esc(title)}</span><h1 class="pv-h1" data-in>${wds(title)}</h1>${intro ? `<p class="pv-sub" data-in>${esc(intro)}</p>` : ''}</section>`;
  const numsRow = `<section class="pv-nums${A ? ' pv-nums--serif' : ''}">${k.nums.map(([n, l]) => `<div><b>${nums(n)}</b><span>${esc(l)}</span></div>`).join('')}</section>`;
  // the practices: three flat cards (Базовий) or the «§» list (Авторський, its signature)
  const practices = A
    ? `<section class="pv-sec pv-sec--list"><div class="pv-sec__head"><span class="pv-kicker">(02) ${esc(k.servicesKicker)}</span><h2 class="pv-h2">${esc(k.servicesTitle)}</h2></div>
        ${k.cards.map(([t, dd, p], i) => `<div class="pv-li pv-li--par"><span class="pv-li__n">§ ${i + 1}</span><b>${esc(t)}</b><span>${esc(dd)}</span><span class="pv-li__p">${esc(p)}</span><span class="pv-li__i" data-ico>${ICO.arrow}</span></div>`).join('')}</section>`
    : `<section class="pv-sec"><span class="pv-kicker">${esc(k.servicesKicker)}</span><h2 class="pv-h2">${esc(k.servicesTitle)}</h2>${cards3(k.cards, [ICO.doc, ICO.columns, ICO.scales])}</section>`;
  let body = '';
  if (page === 0) {
    const hero = A
      ? `<section class="pv-hero pv-hero--a" data-hero>
          <div class="pv-meta" data-in><span>(01) ${esc(k.studioLabel)}</span><span>${k.meta.map(esc).join(' — ')}</span></div>
          <span class="pv-eyebrow-a" data-in data-shine>${words(H.eyebrow, opts.rest, true)}</span>
          <h1 class="pv-h1" data-in>${lxh(H.h1, H.em, E, H.rot)}</h1>
          <div class="pv-hero__foot" data-in><p class="pv-sub">${lx(H.sub, E?.sub)}</p><span class="pv-btn" data-cta>${STAR}${lx(H.btn, E?.btn)}${ICO.arrow}</span></div>
          <div class="pv-visual" data-in data-slot-default>${CUBELINE}</div>${objSlot}
        </section>`
      : `<section class="pv-hero pv-hero--b" data-hero>
          <div class="pv-hero__t">
            <span class="pv-eyebrow" data-in data-shine>${words(k.eyebrow, opts.rest, true)}</span>
            <h1 class="pv-h1" data-in>${lxh(k.h1, k.em, e, k.rot)}</h1>
            <p class="pv-sub" data-in>${lx(k.sub, e?.sub)}</p>
            <div class="pv-row" data-in><span class="pv-btn" data-cta>${STAR}${lx(k.btn, e?.btn)}</span><span class="pv-tlink">${lx(k.btn2, e?.btn2)} →</span></div>
          </div>
          <div class="pv-visual pv-visual--bleed" data-in>${DESK}</div>${objSlot}
        </section>`;
    body = `${hero}${numsRow}${practices}
      <section class="pv-band${A ? ' pv-band--a' : ''}"><div><h2 class="pv-h2">${esc(k.formTitle)}</h2><p>${esc(k.formSub)}</p></div>${form(k, true)}</section>`;
  } else if (page === 1) {
    const v = k.services;
    body = `${ph(v.title, v.intro)}
      <section class="pv-sec"><div class="pv-table"><div class="pv-tr pv-tr--h">${v.head.map((x) => `<span>${esc(x)}</span>`).join('')}</div>${v.rows.map(([a, b, cc], i) => `<div class="pv-tr"><span><i data-ico>${[ICO.doc, ICO.columns, ICO.pen, ICO.scales][i]}</i>${esc(a)}</span><span>${esc(b)}</span><span>${esc(cc)}</span></div>`).join('')}</div></section>
      <section class="pv-sec pv-sec--soft"><span class="pv-kicker">${esc(k.stepsKicker)}</span><h2 class="pv-h2">${esc(k.stepsTitle)}</h2>${steps4(k.steps, [ICO.phone, ICO.chat, ICO.pen, ICO.check], A)}</section>`;
  } else if (page === 2) {
    const v = k.about;
    // the partners: a typographic list (Базовий: a monogram disc in the accent tint; Авторський: big serif names)
    body = `${ph(v.title, v.text)}${numsRow}
      <section class="pv-sec"><span class="pv-kicker">${esc(v.teamTitle)}</span>
        <div class="pv-team">${v.team.map(([n, r, f]) => `<div class="pv-person">${A ? '' : `<span class="pv-person__mono">${esc(initials(n))}</span>`}<b>${esc(n)}</b><span>${esc(r)}</span><span class="pv-person__f">${esc(f)}</span></div>`).join('')}</div></section>
      <section class="pv-quote${A ? '' : ' pv-quote--b'}"><span class="pv-quote__m">“</span><p>${esc(k.quote[1])}</p><span class="pv-by">${esc(k.quote[0])}</span></section>`;
  } else {
    const v = k.contacts;
    body = `${ph(v.title, '')}
      <section class="pv-sec pv-contacts"><div class="pv-contacts__l">${v.items.map(([a, b], i) => `<div class="pv-ci"><i data-ico>${[ICO.pin, ICO.phone, ICO.clock][i]}</i><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join('')}${form(k, A)}</div>
        <div class="pv-map"><svg viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 22 100 12M0 48 100 40M18 0 30 70M62 0 56 70M80 0 92 70M0 62 40 70"/><path class="pv-map__river" d="M0 34C20 30 34 44 52 38S82 26 100 30"/></svg><span class="pv-map__pin" data-ico>${ICO.pin}</span><span class="pv-map__l">${esc(v.map)}</span></div></section>`;
  }
  return `${head}<div class="pv-scroll">${body}${footer(k.footer, c.brand, d)}</div>`;
}

/* ==========================================================================
   Магазин · glass decor
   ========================================================================== */
function shopB(c, h, e, opts) {
  const tints = ['clear', 'amber', 'ember', 'smoke', 'sage', 'amber'];
  return `${header(c, e, { nav: h.nav, cart: true, design: 'b', mark: 'glass' })}
  <div class="pv-scroll">
    <section class="pv-hero pv-hero--b pv-hero--shop" data-hero>
      <div class="pv-hero__t">
        <span class="pv-eyebrow" data-in data-shine>${words(h.eyebrow, opts.rest, true)}</span>
        <h1 class="pv-h1" data-in>${lxh(h.h1, h.em, e, h.rot)}</h1>
        <p class="pv-sub" data-in>${lx(h.sub, e?.sub)}</p>
        <div class="pv-price" data-in><b>${esc(h.price)}</b></div>
        <div class="pv-row" data-in><span class="pv-btn" data-addcart data-cta>${STAR}${ICO.bag}${lx(h.btn, e?.btn)}</span><span class="pv-iconbtn" data-ico>${ICO.heart}</span></div>
      </div>
      <div class="pv-visual pv-visual--shop pv-visual--bleed" data-in><div class="pv-pedestal"></div>${cubeImg('amber', 'pv-cube--hero', true)}<span class="pv-badge">${esc(h.heroName)}</span></div>
      ${objSlot}
    </section>
    <section class="pv-sec"><h2 class="pv-h2">${esc(h.catsTitle)}</h2>
      <div class="pv-cats">${h.cats.map(([n, k], i) => `<div class="pv-cat"><span class="pv-icobox" data-ico>${[ICO.cube, ICO.candle, ICO.vase, ICO.gift][i]}</span><b>${esc(n)}</b><span>${esc(k)}</span></div>`).join('')}</div></section>
    <section class="pv-sec"><div class="pv-sec__row"><h2 class="pv-h2">${esc(h.gridTitle)}</h2><span class="pv-link">${esc(h.gridLink)}</span></div>
      <div class="pv-grid">${h.products.map(([n, p], i) => `<div class="pv-prod"><div class="pv-prod__img">${cubeImg(tints[i])}</div><span class="pv-prod__n">${esc(n)}</span><div class="pv-prod__r"><b>${esc(p)}</b><span class="pv-plus" data-ico>${ICO.plus}</span></div></div>`).join('')}</div></section>
    <section class="pv-sec pv-sec--soft pv-pcard">
      <div class="pv-pcard__img">${cubeImg('ember', 'pv-cube--card')}<div class="pv-thumbs">${['ember', 'amber', 'smoke'].map((t) => `<i>${cubeImg(t)}</i>`).join('')}</div></div>
      <div class="pv-pcard__t"><span class="pv-kicker">${esc(h.mono)}</span><h2 class="pv-h2">${esc(h.card.name)}</h2><span class="pv-rating">${stars()}${esc(h.card.rating)}</span><b class="pv-pcard__price">${esc(h.card.price)}</b>
        <div class="pv-sizes">${h.card.sizes.map((x, i) => `<i${i === 1 ? ' class="is-on"' : ''}>${x}</i>`).join('')}</div>
        <span class="pv-btn pv-btn--full" data-addcart>${ICO.bag}${esc(h.btn)}</span>
        <div class="pv-perks2">${h.card.perks.map((p, i) => `<span>${[ICO.truck, ICO.hand][i]}${esc(p)}</span>`).join('')}</div></div>
    </section>
    <section class="pv-perks">${h.perks.map(([t, d], i) => `<div><span class="pv-icobox" data-ico>${[ICO.hand, ICO.truck, ICO.card][i]}</span><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</section>
    ${footer(h.footer, c.brand, 'b')}
  </div>`;
}

function shopA(c, h, e, opts) {
  const tints = ['smoke', 'ember', 'amber', 'clear', 'sage', 'ember'];
  return `${header(c, e, { nav: h.nav, cart: true, design: 'a' })}
  <div class="pv-scroll">
    <section class="pv-hero pv-hero--a pv-hero--shopa" data-hero>
      <div class="pv-bigname" data-in data-rot>${h.bigRot ? rotCell(h.bigRot) : esc(h.big)}</div>
      <div class="pv-hero__t" data-in>
        <span class="pv-eyebrow-a" data-shine>${words(h.mono, opts.rest, true)}</span>
        <h1 class="pv-h1">${wds(h.card.name)}</h1>
        <p class="pv-sub">${lx(h.sub, e?.sub)}</p>
      </div>
      <div class="pv-visual pv-visual--shopa" data-in><div class="pv-floor"></div>${cubeImg('ember', 'pv-cube--hero', true)}</div>
      ${objSlot}
      <span class="pv-call pv-call--1" data-in>${esc(h.calls[0])}</span><span class="pv-call pv-call--2" data-in>${esc(h.calls[1])}</span>
      <div class="pv-spec" data-in>${h.spec.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="pv-buy" data-in><span class="pv-btn" data-addcart data-cta>${STAR}${ICO.bag}${lx(h.btn, e?.btn)} · ${esc(h.card.price)}</span></div>
      <div class="pv-thumbs pv-thumbs--a" data-in>${['ember', 'amber', 'smoke'].map((t) => `<i>${cubeImg(t)}</i>`).join('')}</div>
    </section>
    <section class="pv-sec"><div class="pv-sec__row"><h2 class="pv-h2">${esc(h.gridTitle)}</h2><span class="pv-link">${esc(h.gridLink)}</span></div>
      <div class="pv-grid">${h.products.map(([n, p], i) => `<div class="pv-prod"><div class="pv-prod__img">${cubeImg(tints[i])}</div><span class="pv-prod__n">${esc(n)}</span><div class="pv-prod__r"><b>${esc(p)}</b><span class="pv-plus" data-ico>${ICO.plus}</span></div></div>`).join('')}</div></section>
    <section class="pv-perks pv-perks--a">${h.perks.map(([t, d], i) => `<div><span class="pv-li__n">0${i + 1}</span><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</section>
    ${footer(h.footer, c.brand, 'a')}
  </div>`;
}

/* ==========================================================================
   «Ваш нинішній сайт»: an auto service on someone else's template, a few years old (teal, centred, a slider)
   ========================================================================== */
function theirs(c, x) {
  return `<div class="pv-x-top"><span>${ICO.phone}${esc(x.phone)}</span><span class="pv-x-call">${esc(x.call)}</span></div>
  <header class="pv-hdr pv-hdr--x"><span class="pv-logo pv-logo--x"><i class="pv-logo__m"></i>${esc(c.brand)}</span><nav class="pv-nav">${x.nav.map((n) => `<span>${esc(n)}</span>`).join('')}</nav></header>
  <div class="pv-scroll pv-scroll--x">
    <section class="pv-x-banner" data-hero><div class="pv-x-banner__art"><i></i><i></i><i></i></div><h1>${esc(x.h1)}</h1><p>${esc(x.sub)}</p><span class="pv-x-btn">${esc(x.btn)}<i class="pv-tap"></i></span><span class="pv-x-dots"><i class="is-on"></i><i></i><i></i></span></section>
    <section class="pv-x-sec"><h2>${esc(x.aboutTitle)}</h2><p>${esc(x.about)}</p>
      <div class="pv-x-cols">${x.services.map(([t, d], i) => `<div><span class="pv-x-ic">${[ICO.gauge, ICO.drop, ICO.tire][i]}</span><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div></section>
    <footer class="pv-x-ftr"><span>${esc(c.studio.footer.copy)}</span><span>${esc(x.phone)}</span></footer>
  </div>`;
}

/* ==========================================================================
   Our additions, outside the site: the tray (desktop) / the notifications (phone), and the story
   ========================================================================== */
const bars = (hs, down = false) => `<i class="pv-bars${down ? ' pv-bars--down' : ''}">${hs.map((h, i) => `<b style="--h:${h};--i:${i}"></b>`).join('')}</i>`;
const UP = [0.38, 0.5, 0.46, 0.64, 0.72, 0.9];
const DOWN = [0.9, 0.8, 0.74, 0.6, 0.56, 0.48];
const SRC = [0.42, 0.56, 0.5, 0.62, 0.58, 0.7]; // analytics: requests from the ads, week by week
// the request's card in «Нові»: the reminder chip says «15 хв без відповіді», then «Нагадування надіслано»
// (both rendered, one shown: the chip never changes size), then the card moves on to «В роботі» (fx.js)
const lead = (C, text, cls = '') => `<i class="pv-lead${cls}"><b data-crm-lead>${esc(text)}</b><em class="pv-remind"><span>${esc(C.crm.remind[0])}</span><span>${esc(C.crm.remind[1])}</span></em></i>`;

// the tray: one card per add-on (data-k), in the order the visitor's lead travels: the ad → the request
// (a Telegram push, or the CRM window) → the monthly report; analytics alone: where the requests came from
// (two small charts, like the report's: no numbers promised)
function tray(C) {
  return `<div class="pv-sys" aria-hidden="true"><div class="pv-tray"><span class="pv-tray__dots"><i></i><i></i><i></i></span>
    <div class="pv-note pv-ad" data-k="ads"><span class="pv-note__top"><b>${esc(C.ad.label)}</b> · ${esc(C.url)}</span><span class="pv-ad__t" data-ad-t></span><span class="pv-ad__s" data-ad-s></span><i class="pv-tap"></i></div>
    <div class="pv-note pv-tg" data-k="lead"><span class="pv-tg__i">${ICO.plane}</span><span class="pv-tg__b"><span class="pv-note__top"><b>${esc(C.req.app)}</b> · ${esc(C.req.now)}<span class="pv-note__src" data-src></span></span><b class="pv-note__t" data-tg-t>${esc(C.req.title)}</b><span class="pv-tg__who">${esc(C.req.who)}</span></span></div>
    <div class="pv-note pv-crm" data-k="crm"><span class="pv-win"><i></i><i></i><i></i><span>${esc(C.crm.app)} · ${esc(C.crm.title)}</span></span>
      <span class="pv-lanes">${C.crm.cols.map((col) => `<span class="pv-lane"><span>${esc(col)}</span></span>`).join('')}${lead(C, C.crm.lead.landing)}<em class="pv-remind pv-remind--static"><span>${esc(C.crm.remind[0])}</span><span>${esc(C.crm.remind[1])}</span></em></span></div>
    <div class="pv-note pv-chatnote" data-k="chat"><span class="pv-chatnote__i">${ICO.chat}</span><span class="pv-chatnote__b"><span class="pv-note__top"><b>${esc(C.chat.name)}</b> · ${esc(C.chat.time)}</span><span class="pv-note__t" data-chat-short></span></span></div>
    <div class="pv-note pv-rep" data-k="mgmt"><span class="pv-note__top"><span class="pv-note__i">${ICO.chart}</span>${esc(C.report.title)}</span>
      <span class="pv-rep__row"><span>${esc(C.report.leads)}</span>${bars(UP)}</span>
      <span class="pv-rep__row"><span>${esc(C.report.cost)}</span>${bars(DOWN, true)}</span></div>
    <div class="pv-note pv-rep pv-src" data-k="stats"><span class="pv-note__top"><span class="pv-note__i">${ICO.chart}</span>${esc(C.sources.title)}</span>
      <span class="pv-rep__row"><span>${esc(C.sources.rows[0])}</span>${bars(UP)}</span>
      <span class="pv-rep__row"><span>${esc(C.sources.rows[1])}</span>${bars(SRC, true)}</span></div>
  </div></div>`;
}

// «У мене вже є сайт»: the scenes over their site (each fills the frame; the browser bar carries the caption)
function scenes(C) {
  const S = C.story;
  const ghost = '<i class="pv-ghost"></i>';
  const col = (name, i) => `<div class="pv-col"><span class="pv-col__h">${esc(name)}</span><span class="pv-slot">${i === 0 ? lead(C, C.crm.lead.existing, ' pv-lead--big') : i === 2 ? ghost : ''}</span>${ghost}${i ? ghost : ''}</div>`;
  const [adT, adS] = C.ad.existing;
  return `<div class="pv-scenes">
    <div class="pv-scene pv-scene--serp"><div class="pv-serp">
      <div class="pv-serp__bar">${ICO.search}<span>${esc(S.query)}</span></div>
      <div class="pv-serp__ad"><span class="pv-serp__lbl"><b>${esc(C.ad.label)}</b> · ${esc(C.url)}</span><span class="pv-serp__t">${esc(adT)}</span><span class="pv-serp__s">${esc(adS)}</span><i class="pv-tap"></i></div>
      <div class="pv-serp__res"><i></i><i></i><i></i></div><div class="pv-serp__res"><i></i><i></i><i></i></div><div class="pv-serp__res"><i></i><i></i><i></i></div>
    </div></div>
    <div class="pv-scene pv-scene--ai">${chat(C, 'existing')}</div>
    <div class="pv-scene pv-scene--tg"><div class="pv-tgcard pv-tg"><span class="pv-tg__i">${ICO.plane}</span><span class="pv-tg__b"><span class="pv-note__top"><b>${esc(C.req.app)}</b> · ${esc(C.req.now)}</span><b class="pv-note__t">${esc(C.req.title)}</b><span class="pv-tg__who">${esc(C.req.who)}</span><span class="pv-note__src" data-src></span></span></div></div>
    <div class="pv-scene pv-scene--crm"><div class="pv-board"><span class="pv-win pv-win--board"><i></i><i></i><i></i><span>${esc(C.crm.app)} · ${esc(C.crm.title)}</span></span>
      <div class="pv-board__cols">${C.crm.cols.map(col).join('')}</div></div></div>
    <div class="pv-scene pv-scene--rep"><div class="pv-repcard"><span class="pv-repcard__t"><span class="pv-note__i">${ICO.chart}</span>${esc(C.report.title)}</span>
      <div class="pv-repcard__row"><span>${esc(C.report.leads)}</span>${bars(UP)}</div>
      <div class="pv-repcard__row"><span>${esc(C.report.cost)}</span>${bars(DOWN, true)}</div>
      <span class="pv-repcard__n">✓ ${esc(C.report.note)}</span></div></div>
    <div class="pv-scene pv-scene--stats"><div class="pv-repcard"><span class="pv-repcard__t"><span class="pv-note__i">${ICO.chart}</span>${esc(C.sources.title)}</span>
      <div class="pv-repcard__row"><span>${esc(C.sources.rows[0])}</span>${bars(UP)}</div>
      <div class="pv-repcard__row"><span>${esc(C.sources.rows[1])}</span>${bars(SRC, true)}</div>
      <span class="pv-repcard__n">✓ ${esc(C.sources.note)}</span></div></div>
  </div>`;
}

// the story's steps for this configuration: [key, caption]; only what the visitor chose
function storySteps(C, cfg) {
  const S = C.story;
  const ads = hasAds(cfg);
  let n = 0;
  const num = (text) => `${++n} · ${text}`;
  const list = [['site', S.site]];
  if (ads) list.push(['serp', num(S.ads)], ['visit', num(S.visit)]);
  if (cfg.automation === 'lead') list.push(['tg', num(ads ? S.lead : S.leadSite)]);
  if (cfg.automation === 'crmAi') list.push(['ai', num(ads ? S.ai : S.aiSite)], ['crm', num(ads ? S.crm : S.crmSite)]);
  if (ads && cfg.adsManagement) list.push(['rep', S.report]);
  if (cfg.growth === 'analytics') list.push(['stats', num(S.stats)]); // analytics alone: where the request came from
  return list;
}

/* ---------- mount ---------- */
export function mountPreview(el, { t, lang = 'uk', assets = {}, reducedMotion = false, phone = false }) {
  const P = t.preview;
  const C = SITE[lang] || SITE.uk;
  const EN = SITE.en;
  el.innerHTML = `
    <div class="pvw__chrome"><span class="pvw__dots" aria-hidden="true"><i></i><i></i><i></i></span><div class="pvw__tabs" aria-hidden="true"></div><span class="pvw__url" aria-hidden="true">${esc(C.url)}</span><span class="pvw__caps" aria-hidden="true"></span><span class="pvw__mark" aria-hidden="true"></span></div>
    <div class="pv-vp" aria-hidden="true">
      <div class="pv-page"></div>
      ${scenes(C)}
    </div>
    ${tray(C)}`;
  const host = el.querySelector('.pv-page');
  const tabs = el.querySelector('.pvw__tabs');
  const caps = el.querySelector('.pvw__caps');
  const markEl = el.querySelector('.pvw__mark');
  // the 3D object: persistent; after every render it moves into the new page's hero slot. A square of the
  // cube's size: its contact shadow, the still (no src until an intent toward 3D), the live canvas, the
  // touch hint and the store's «360°»
  const obj = document.createElement('div');
  obj.className = 'pv-obj';
  obj.innerHTML = `<i class="pv-obj__shadow"></i><img class="pv-obj__poster" alt="" decoding="async"><canvas class="pv-obj__gl" aria-hidden="true"></canvas><span class="pv-obj__hint">${esc(P.hint3d || (lang === 'ru' ? 'Покрутите пальцем' : 'Покрутіть пальцем'))}</span><span class="pv-obj__chip">360°</span>`;
  if (assets.cubesLight) el.style.setProperty('--sprite-l', `url("${assets.cubesLight}")`);
  if (assets.cubesDark) el.style.setProperty('--sprite-d', `url("${assets.cubesDark}")`);

  let prev = null;
  let page = 0;
  let markT = 0;
  const fx = createFx(el, { reducedMotion, onLive: () => syncCube(), onPage: (i) => showPage(i) });

  /* ---------- the Авторський landing's faces (Playfair Display 900 / italic 400, Sofia Sans Extra Condensed
     500–800; css/configurator.css R11): never on the page's own load path. They are fetched in idle time
     once the preview comes within a screen of the viewport, at once on an intent toward «Авторський»; a
     sample that needs them before they are in waits for them up to 300 ms (render, below). ---------- */
  const FACES = ['900 1em "Playfair Display"', 'italic 400 1em "Playfair Display"', '800 1em "Sofia Sans Extra Condensed"'];
  let facesP = null, facesIn = false;
  const needsFaces = (cfg) => cfg.format === 'landing' && cfg.design === 'custom';
  function faces() {
    // one Cyrillic and one Latin letter (digits, punctuation, EN) per face: both subsets of each
    if (!facesP) facesP = Promise.all(FACES.map((f) => document.fonts.load(f, 'Ж9'))).catch(() => {}).then(() => { facesIn = true; });
    return facesP;
  }
  const idle = window.requestIdleCallback ? (fn) => requestIdleCallback(fn, { timeout: 2000 }) : (fn) => setTimeout(fn, 400);
  const nearIO = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { nearIO.disconnect(); idle(faces); } }, { rootMargin: '100% 0px' });
  nearIO.observe(el);
  const customCard = el.closest('.cfg')?.querySelector('[data-group="design"][data-value="custom"]');
  for (const ev of ['pointerenter', 'touchstart', 'focusin']) customCard?.addEventListener(ev, faces, { once: true, passive: true });

  function siteHTML(cfg, pg) {
    const d = cfg.design === 'custom' ? 'a' : 'b';
    const en = (k) => (cfg.secondLanguage ? EN[k] : null);
    if (cfg.format === 'existing') return theirs(C, C.theirs);
    if (cfg.format === 'landing') {
      const rest = [C.studio.stat.join(' '), C.studio.rating];
      return d === 'a' ? landingCover(C, C.studio, en('studio')) : landingB(C, C.studio, en('studio'), { rest });
    }
    if (cfg.format === 'corporate') return corpPage(C, C.corp, pg === 0 ? en('corp') : null, d, pg, { rest: [C.corp.nums[0].join(' '), C.corp.nums[1].join(' ')] });
    const rest = [C.shop.card.perks[0], C.shop.card.perks[1]];
    return d === 'a' ? shopA(C, C.shop, en('shop'), { rest }) : shopB(C, C.shop, en('shop'), { rest });
  }

  function render(cfg, pg = 0, animate = false) {
    const site = document.createElement('div');
    const d = cfg.format === 'existing' ? 'x' : cfg.design === 'custom' ? 'a' : 'b';
    site.className = `pv-site pv-site--${d} pv-site--${cfg.format}`;
    site.innerHTML = siteHTML(cfg, pg);
    // the AI-асистент lives on the site itself (shown with «CRM і AI-асистент», css H9)
    // (the AI-асистент no longer sits over the sample site: it is its card in the tray, like the others; the owner, 9 Oct)
    // crossfade: the old page stays on top and fades out (one old page at most)
    host.querySelectorAll('.pv-site--old').forEach((n) => n.remove());
    const old = host.querySelector('.pv-site');
    // the Авторський landing asked for before its faces are in (they are fetched ahead, faces() below): it
    // waits for them at most 300 ms, under the old page or hidden, so it never shows in a stand-in face
    const wait = needsFaces(cfg) && !facesIn ? Promise.race([faces(), new Promise((r) => setTimeout(r, 300))]) : null;
    if (old && animate && !reducedMotion) {
      old.classList.add('pv-site--old');
      host.prepend(site);
      const fade = () => { old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'linear' }).onfinish = () => old.remove(); };
      if (wait) wait.then(fade); else fade();
    } else {
      old?.remove();
      host.append(site);
      if (wait) {
        site.style.opacity = '0';
        wait.then(() => { site.style.opacity = ''; if (!reducedMotion) site.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'linear' }); });
      }
    }
    // the 3D object into the new hero (the same element: the live cube keeps its context)
    site.querySelector('[data-obj]')?.append(obj);
    // the browser tabs: corporate has four pages (a click switches; the tour switches too)
    const list = C.tabs[cfg.format];
    const on = cfg.format === 'corporate' ? pg : 0;
    tabs.innerHTML = list.map((x, i) => `<span class="pvw__tab${i === on ? ' is-on' : ''}${i ? ' is-more' : ''}" data-page="${i}">${esc(x)}</span>`).join('')
      + (list.length > 1 ? `<span class="pvw__count">${esc(C.more(list.length - 1))}</span>` : '');
    return site;
  }

  function showPage(i) {
    if (!prev || prev.format !== 'corporate') return;
    page = ((i % 4) + 4) % 4;
    render(prev, page, true);
    fx.page(page);
  }
  // corporate: a click on a tab (a mouse), or a tap anywhere on the frame (touch) shows the next page
  el.addEventListener('click', (e) => {
    if (prev?.format !== 'corporate') return;
    const tab = e.target.closest('.pvw__tab');
    if (tab) showPage(+tab.dataset.page);
    else if (e.target.closest('.pv-vp') && matchMedia('(hover: none)').matches) showPage(page + 1);
  });

  /* ---------- 3D: the live cube (cube-gl.js), loaded on an intent toward the 3D row, never before ---------- */
  const vp = el.querySelector('.pv-vp');
  const posterImg = obj.querySelector('.pv-obj__poster');
  const saveData = navigator.connection?.saveData === true;
  // the still only (no module at all): reduced motion, Save-Data, little memory, no WebGL2
  const stillOnly = reducedMotion || saveData || (navigator.deviceMemory != null && navigator.deviceMemory <= 2) || typeof WebGL2RenderingContext === 'undefined';
  const touch = matchMedia('(hover: none)').matches;
  let cube = null, cubeP = null, on3d = false, arrived = false, waitIO = null, waitT = 0, hintT = 0;
  const theme = () => (prev?.design === 'custom' ? 'dark' : 'light');
  // the page's colour behind the cube (the light skin's room is tinted with it); the dark skin's page
  const BG = { landing: '#efe9df', corporate: phone ? '#c8c7c3' : '#e2e1dd', ecommerce: '#f1eae1' };
  const NAVY = '#22337a';
  // (the studio's Авторський: the cover's navy where the cube stands, in front of the masthead)
  const bg = () => (theme() === 'dark' ? (prev?.format === 'landing' ? NAVY : '#0b0a09') : BG[prev?.format] || '#ebe8e1');
  // the still for this square: 320 px up to 360 device px, else 640
  const posterURL = (th) => {
    const [small, big] = assets.cube?.[th] || [];
    return (obj.offsetWidth || 200) * Math.min(devicePixelRatio || 1, 2) <= 360 ? small : big || small;
  };
  const posters = () => ({ light: posterURL('light'), dark: posterURL('dark') });
  const decoded = {};
  const preload = (th) => {
    const u = posterURL(th);
    if (!u) return Promise.resolve();
    if (!decoded[u]) { const i = new Image(); i.src = u; decoded[u] = i.decode().catch(() => {}); }
    return decoded[u];
  };
  function intent() {
    preload(theme());
    if (stillOnly || cubeP) return;
    cubeP = import('./cube-gl.js').then(({ createCube }) => {
      cube = createCube(obj, { theme: theme(), bg: bg(), poster: posters(), reducedMotion, saveData, pointerArea: vp, visibilityRoot: vp, tier: 'auto', onState });
      obj.cube = cube; // (QA: document.querySelector('.pv-obj').cube.debug)
      if (arrived) cube.arrive();
      syncCube();
    }).catch(() => {});
  }
  const row = el.closest('.cfg')?.querySelector('[data-group="threeDHero"]');
  for (const ev of ['pointerenter', 'focusin', 'touchstart']) row?.addEventListener(ev, intent, { passive: true, once: true });
  // the first live arrival on a touch screen: «Покрутіть пальцем» for 2 s (once per session)
  function onState(s) {
    if (s !== 'live' || !touch || reducedMotion) return;
    try { if (sessionStorage.getItem('pvHint3d')) return; sessionStorage.setItem('pvHint3d', '1'); } catch (e) { /* private mode: show it */ }
    clearTimeout(hintT);
    hintT = setTimeout(() => { obj.classList.add('is-hint'); hintT = setTimeout(() => obj.classList.remove('is-hint'), 2300); }, 300);
  }
  // the arrival: Базовий, the still cube comes to life (the still scales up from the sprite's size, standing
  // on its line); Авторський, the drawing fades and the still grows in; then the canvas takes over
  function arrive() {
    const go = () => {
      clearTimeout(waitT); waitIO?.disconnect(); waitIO = null;
      // the still is decoded (or 300 ms have passed: it fades in when it is)
      Promise.race([preload(theme()), new Promise((r) => setTimeout(r, 300))]).then(() => {
        if (!on3d || arrived) return;
        arrived = true;
        if (!posterImg.getAttribute('src')) posterImg.src = posterURL(theme());
        const sprite = obj.closest('[data-hero]')?.querySelector('.pv-cube[data-slot-default]');
        const b = theme() === 'light' && sprite;
        const from = b ? { scale: Math.max(0.3, Math.min(1, (0.76 * sprite.offsetHeight) / (0.6 * (obj.offsetHeight || 1)))), originY: 0.819, opacity: 0.6 } : { scale: 0.9, originY: 0.5, opacity: 0 };
        el.dataset.obj3d = 'on';
        obj.classList.add('is-on');
        if (!reducedMotion) {
          posterImg.style.transformOrigin = `50% ${from.originY * 100}%`;
          posterImg.animate([{ transform: `scale(${from.scale})`, opacity: from.opacity }, { opacity: 1, offset: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
          obj.querySelector('.pv-obj__shadow').animate([{ transform: `scaleX(${from.scale})`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
        }
        cube?.arrive();
        syncCube();
      });
    };
    // a phone scrolls the sample to the slot first: the arrival waits until the square is ≥ 60 % in the frame
    if (!phone || reducedMotion) { go(); return; }
    waitIO = new IntersectionObserver((es) => { if (es[es.length - 1].intersectionRatio >= 0.6) go(); }, { root: vp, threshold: [0, 0.6] });
    waitIO.observe(obj);
    waitT = setTimeout(go, 2500);
  }
  function leave() {
    clearTimeout(waitT); waitIO?.disconnect(); waitIO = null;
    clearTimeout(hintT);
    arrived = false;
    obj.classList.remove('is-on', 'is-hint');
    delete el.dataset.obj3d;
    cube?.leave();
  }
  function syncCube() {
    const want = !!prev?.threeDHero && prev.format !== 'existing';
    obj.dataset.theme = theme();
    if (want) intent();
    // the still always matches the skin and the square's size (the live cube draws over it)
    const u = posterURL(theme());
    if (obj.classList.contains('is-on') && u && posterImg.getAttribute('src') !== u) posterImg.src = u;
    if (want !== on3d) { on3d = want; want ? arrive() : leave(); }
    if (!cube) return;
    cube.set({ theme: theme(), bg: bg(), poster: posters() });
    if (want && arrived && fx.live) cube.start(); else cube.stop();
  }

  /* ---------- the mark: what was just switched on, named in the browser bar for a moment ---------- */
  function mark(key) {
    markEl.textContent = P.marks[key];
    markEl.classList.add('is-on');
    clearTimeout(markT);
    markT = setTimeout(() => markEl.classList.remove('is-on'), 2600);
  }

  function update(cfg) {
    const before = prev;
    const firstRun = !before;
    const site = cfg.format !== 'existing';
    const reshape = firstRun || before.format !== cfg.format || before.design !== cfg.design || before.secondLanguage !== cfg.secondLanguage;
    if (reshape) {
      if (firstRun || before.format !== cfg.format) page = 0;
      render(cfg, cfg.format === 'corporate' ? page : 0, !firstRun);
    }
    const ads = hasAds(cfg);
    const stats = cfg.growth === 'analytics'; // analytics alone (with ads it is part of the ads setup)
    const mgmt = cfg.adsManagement && ads;
    const d = el.dataset;
    d.format = cfg.format;
    d.design = site ? cfg.design : 'essential';
    d.theirs = site ? 'off' : 'on';
    d.motion = cfg.advancedMotion && site ? 'on' : 'off';
    d.threeD = cfg.threeDHero && site ? 'on' : 'off';
    d.lang2 = cfg.secondLanguage && site ? 'on' : 'off';
    d.ads = ads ? cfg.growth : 'none';
    d.stats = stats ? 'on' : 'off';
    d.mgmt = mgmt ? 'on' : 'off';
    d.leads = cfg.automation;
    // the add-ons' cards for this configuration, in the lead's order (the tray; the phone's notifications)
    const notes = site ? [ads && 'ads', cfg.automation === 'lead' && 'lead', cfg.automation === 'crmAi' && 'chat', cfg.automation === 'crmAi' && 'crm', mgmt && 'mgmt', stats && 'stats'].filter(Boolean) : [];
    d.tray = notes.length ? 'on' : 'off';
    d.notes = notes.length;
    const shop = cfg.format === 'ecommerce';
    // the cards speak about this format's business: its ad, «Нове замовлення» in a store, its request in the CRM
    const [adT, adS] = C.ad[cfg.format];
    el.querySelector('.pv-tray [data-ad-t]').textContent = adT;
    el.querySelector('.pv-tray [data-ad-s]').textContent = adS;
    el.querySelector('.pv-tray [data-tg-t]').textContent = shop ? C.req.titleShop : C.req.title;
    el.querySelector('.pv-tray [data-crm-lead]').textContent = C.crm.lead[cfg.format];
    if (site) el.querySelector('[data-chat-short]').textContent = C.chat[cfg.format][2];
    el.querySelectorAll('[data-src]').forEach((s) => { s.textContent = ads ? C.req.fromAds : C.req.fromSite; });
    // «У мене вже є сайт»: the story's captions, one per step, in the browser bar
    const steps = site ? [] : storySteps(C, cfg);
    caps.innerHTML = steps.map(([k, text]) => `<span class="pvw__cap" data-cap="${k}">${esc(text)}</span>`).join('');
    // 3D replaces the drawing: an entrance still running on the drawing stops with it
    if (cfg.threeDHero && site) host.querySelectorAll('[data-slot-default]').forEach((n) => n.getAnimations().forEach((a) => a.cancel()));

    const motionOn = cfg.advancedMotion && site;
    fx.set({
      motion: motionOn,
      replay: motionOn && !firstRun && (reshape || !before.advancedMotion),
      theme: site && cfg.design === 'custom' ? 'dark' : cfg.format === 'landing' ? 'day' : 'light', // (the silk's skin; the studio's Базовий is paper in daylight)
      quiet: needsFaces(cfg), // «Синя година»: no Silk and no loops; its blocks enter once each (rb-anim.js mountCover)
      origin: shop && cfg.design === 'custom' ? 'top-center' : 'top-right', // the light falls on the visual
      // their site rests: the story moves; the studio's Авторський (a magazine) turns its pages ([data-page])
      tour: cfg.format === 'corporate' ? 'pages' : needsFaces(cfg) ? 'flip' : site ? 'scroll' : 'none',
      restart: !firstRun, // every change: back to the hero, a pause, then the tour again
      lang2: cfg.secondLanguage && site,
      cart: shop,
      story: notes.length > 0,
      chat: false, // the AI-асистент is a tray card now, not a chat on the sample site
      notes,
      steps: steps.map(([k]) => k),
      page,
      // «3D-об'єкт» just went on, or the sample was rebuilt around it: bring the object into view first
      // (a phone layout has it under the text)
      focus: !firstRun && site && cfg.threeDHero && (!before.threeDHero || reshape) ? '[data-obj]' : null,
    });

    // the mark: only what was just turned on (nothing on format/design changes, nothing for their site)
    if (!firstRun && site) {
      const b = before;
      const turned = [
        [motionOn && !(b.advancedMotion && b.format !== 'existing'), 'motion'],
        [cfg.threeDHero && !(b.threeDHero && b.format !== 'existing'), 'threeD'],
        [cfg.secondLanguage && !(b.secondLanguage && b.format !== 'existing'), 'lang2'],
        // the AI-асистент is on the site itself: it is named like the site's own options
        [cfg.automation === 'crmAi' && !(b.automation === 'crmAi' && b.format !== 'existing'), 'chat'],
      ].filter(([on]) => on); // (the tray's cards appearing are their own sign)
      if (turned.length && !(reshape && b.format !== cfg.format)) mark(turned[turned.length - 1][1]);
    }
    if (!site || !prev) { clearTimeout(markT); markEl.classList.remove('is-on'); }
    prev = { ...cfg };
    syncCube();
  }

  // the breakdown face covers the preview (desktop): its loops wait
  const pause = (v) => fx.pause(v);
  return { update, pause, fx };
}
