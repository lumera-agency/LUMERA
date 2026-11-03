/*
 * «Дизайн і сайти» (/dyzain-i-saity), Next: the page's behaviour, ported from the static page's js/sites-page.js as an
 * island, as the AI pages' runtime was (React owns the markup and its life, this module the choreography). The main
 * page's own parts do the rest: the topbar, the phone menu, UA · RU, the FAQ, the form (sections/contact/lead-form.js),
 * the footer with its chrome wordmark and the live stone behind the first screen (AiStoneSlot). Started by SitesRuntime.
 *
 * Prices and weeks: the main page's configurator engine (bundled), Лендінг+ as LANDING_PLUS below (approved by the owner
 * on 14 Oct 2026: $700) until the engine has it. The weeks follow engine.js's own formula (calculateTimeline).
 *
 * Motion rules (the owner's): every scene plays once as it comes into view, with WAAPI on transform and opacity only;
 * on phones one scene at a time; at rest nothing runs; with reduced motion every scene shows its final frame. The CSS
 * default of each scene IS its final frame: `.is-pre` holds the start frame until it plays.
 */
import * as ENGINE from '@/components/sections/pricing/configurator/engine.js';
import { STRINGS } from '@/components/sections/pricing/configurator/strings.js';
import { leadForm, goToForm as glideToForm } from '@/components/sections/contact/lead-form.js';
import { restorePlace, restoreScroll } from '@/lib/boot';
import { getLenis } from '@/lib/scroll';
import { SPRING, slideIn, rollNumber } from './sites-rb.js';
import { spotlight, initTilt, mountGlide, beam, beamOnView, deltaChip } from './fx-page.js';
import { mountHow } from './fx-how.js';

/** The words the page writes (the page's language, from the server: SitesRuntime's `strings`, the static page's keys). */
let words = {};
const t = (key, fallback = '') => words[key] ?? fallback;

const root = document.documentElement;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const OG = new URLSearchParams(location.search).has('og');
if (OG) root.classList.add('og-render');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = !reducedMotion && !OG && typeof Element.prototype.animate === 'function';
const phoneMQ = window.matchMedia('(max-width: 600px)');
const narrowMQ = window.matchMedia('(max-width: 860px)');
const fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IO = 'cubic-bezier(0.65, 0, 0.35, 1)';
const NBSP = ' ';

const pricesReady = Promise.resolve(ENGINE);
const stringsReady = Promise.resolve(STRINGS);

/* ---------- the numbers ---------- */
const FORMATS = ['landing', 'landingPlus', 'corporate', 'ecommerce'];
// Лендінг+: the owner's OK, 14 Oct 2026 ($700). In engine.js since 17 Oct (the main page's configurator has it);
// this stays the fallback, like FALLBACK below
const LANDING_PLUS = { price: 700, weeks: [2, 3], design: [300, 1], motion: [200, 0.5], lang: [100, 0] };
// engine.js as of 14 Oct 2026, used only if it can't be read: [price, weeks]
const FALLBACK = {
  landing: { price: 500, weeks: [1, 2], design: [200, 1], motion: [150, 0.5], lang: [100, 0] },
  corporate: { price: 900, weeks: [3, 4], design: [400, 1.5], motion: [250, 1], lang: [150, 0.5] },
  ecommerce: { price: 1500, weeks: [4, 6], design: [600, 2], motion: [300, 1], lang: [200, 0.5] },
  three: [400, 1],
};
const TABLE = { ...FALLBACK, landingPlus: LANDING_PLUS };
let engine = null;
let strings = null;

function readEngine(e) {
  const P = e?.PRICING;
  if (!P) return;
  const per = (v, f) => (typeof v === 'object' && v !== null ? v[f] ?? v.landing : v);
  for (const f of ['landing', 'landingPlus', 'corporate', 'ecommerce']) {
    try {
      const n = (v) => { if (!Number.isFinite(v)) throw new Error('not a number'); return v; };
      TABLE[f] = {
        price: n(P.formats[f].price),
        weeks: [n(P.formats[f].weeks[0]), n(P.formats[f].weeks[1])],
        design: [n(per(P.design.custom.price, f)), n(per(P.design.custom.weeks, f))],
        motion: [n(per(P.advancedMotion.price, f)), n(per(P.advancedMotion.weeks, f))],
        lang: [n(per(P.secondLanguage.price, f)), n(per(P.secondLanguage.weeks, f))],
      };
    } catch { /* this format keeps its fallback */ }
  }
  if (Number.isFinite(P.threeDHero?.price) && Number.isFinite(P.threeDHero?.weeks)) TABLE.three = [P.threeDHero.price, P.threeDHero.weeks];
}

const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
const money = (n) => (typeof engine?.money === 'function' ? engine.money(n) : `$${group(n)}`);
const WEEKS_FALLBACK = {
  uk: (a, b) => `≈ ${a === b ? a : `${a}–${b}`} ${b === 1 ? 'тиждень' : b < 5 ? 'тижні' : 'тижнів'}`,
  ru: (a, b) => `≈ ${a === b ? a : `${a}–${b}`} ${b === 1 ? 'неделя' : b < 5 ? 'недели' : 'недель'}`,
};
const lang = () => (root.lang === 'ru' ? 'ru' : 'uk');
const weeksText = (a, b) => (typeof strings?.weeks === 'function' ? strings.weeks(a, b) : WEEKS_FALLBACK[lang()](a, b)).replace(/ /g, NBSP);

/** A project's sum and weeks: engine.js's own formula (calculateTimeline), for all four formats. */
function estimate({ format, design, motion: anim, three, second }) {
  const row = TABLE[format];
  let sum = row.price;
  if (design === 'custom') sum += row.design[0];
  if (anim) sum += row.motion[0];
  if (three) sum += TABLE.three[0];
  if (second) sum += row.lang[0];
  // design-side work overlaps: the longest counts in full, the rest at half; the translation comes after
  const overlapping = [design === 'custom' ? row.design[1] : 0, anim ? row.motion[1] : 0, three ? TABLE.three[1] : 0]
    .filter(Boolean).sort((a, b) => b - a);
  let extra = overlapping.length ? overlapping[0] + overlapping.slice(1).reduce((s, w) => s + w, 0) * 0.5 : 0;
  if (second) extra += row.lang[1];
  return { sum, min: row.weeks[0] + Math.floor(extra), max: row.weeks[1] + Math.max(0, Math.ceil(extra - 0.25)) };
}

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function startSites({ strings = {} } = {}) {
  if (started) return;
  started = true;
  words = strings;
  boot();
}

async function boot() {
  const [e, s, pv] = await Promise.all([pricesReady, stringsReady, import('./sites-pv.js').catch((error) => { console.warn('[samples]', error); return null; })]);
  pvModule = pv;
  engine = e;
  readEngine(e);
  strings = s?.[lang()] ?? null;
  fillFacts();
  initPicks();
  initFaq();
  initSticky();
  initToTop();
  initCover();
  initScenes();
  initDialogs();
  initCalc();
  initHow();
  initTabs();
  initSumbar();
  initCards();
  arrive();
}

/* ---------- prices and weeks on the page: [data-fprice] / [data-fweeks] = a format; [data-price-line] = text with
   {landing} {landingPlus} {corporate} {ecommerce} and {wLanding}… tokens ---------- */
function fillFacts() {
  const tokens = {};
  for (const f of FORMATS) {
    const base = estimate({ format: f, design: 'essential' });
    const key = f.charAt(0).toUpperCase() + f.slice(1);
    tokens[f] = money(base.sum);
    tokens[`w${key}`] = weeksText(base.min, base.max);
  }
  for (const el of $$('[data-fprice]')) el.textContent = tokens[el.dataset.fprice] ?? el.textContent;
  for (const el of $$('[data-fweeks]')) {
    const key = el.dataset.fweeks;
    el.textContent = tokens[`w${key.charAt(0).toUpperCase()}${key.slice(1)}`] ?? el.textContent;
  }
  // the sums become <b> (text nodes only: no HTML from the dictionary)
  for (const el of $$('[data-price-line]')) {
    if (!/\{\w+\}/.test(el.textContent)) continue;
    el.replaceChildren(...el.textContent.split(/(\{\w+\})/).map((part) => {
      const key = part.match(/^\{(\w+)\}$/)?.[1];
      return key && tokens[key] ? Object.assign(document.createElement('b'), { textContent: tokens[key] }) : part;
    }));
  }
}

/* ---------- where the visitor lands: back where they were after a language switch or a reload, else at the #block ---------- */
function arrive() {
  if (restoreScroll() || restorePlace()) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (!target) return;
  // a link to one format (the site menu: …#fmt-tab-landingPlus): that format is chosen, the page opens at block 2
  if (target.matches('.st-rail__t')) {
    setFormat(target.dataset.tab);
    $('#formats')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    return;
  }
  target.scrollIntoView({ block: 'start', behavior: 'instant' });
}

/* ---------- the cards' touches (js/sites-fx-page.js): the light under the mouse on the rail and the extras, the first
   screen's sample leaning to the mouse, a lap of light round the sum on first sight (no magnetic buttons: the owner,
   15 Oct; the buttons are the main page's, css/sites-btn.css) ---------- */
function initCards() {
  if (OG) return;
  for (const card of $$('.st-rail__t, .st-add')) spotlight(card);
  initTilt({ motion });
  beamOnView($('.st-sum'), { motion });
}

const lead = {};
const formatName = (f) => text(`sites.f.${{ landing: 'landing', landingPlus: 'plus', corporate: 'corp', ecommerce: 'shop' }[f]}.t`, f);
function text(key, fallback = '') {
  return document.querySelector(`[data-i18n="${key}"]`)?.textContent.trim() || t(key, fallback);
}
function formatLine(f) {
  const base = estimate({ format: f, design: 'essential' });
  return [formatName(f), `${text('sites.from', 'від')} ${money(base.sum)}`, weeksText(base.min, base.max)].join(' · ');
}
// the main page's form shows what was chosen in its plan box (leadForm().setPlan), the lines go with the request
function setAttached(summary, details = '') {
  leadForm().setPlan(summary || null, details ? details.split('\n') : []);
}
function pressPick(pick) {
  for (const p of lead.picks) p.setAttribute('aria-pressed', String(p === pick));
  lead.site.hidden = pick?.dataset.pick !== 'update' && !lead.siteInput.value.trim();
}

function initPicks() {
  Object.assign(lead, {
    pack: $('[data-form-plan-input]'),
    clear: $('[data-form-plan-clear]'),
    picks: $$('.ai-pick'),
    site: $('[data-site-field]'),
    siteInput: $('#f-site'),
  });
  if (!lead.pack) return;
  for (const pick of lead.picks) {
    pick.addEventListener('click', () => {
      const on = pick.getAttribute('aria-pressed') !== 'true';
      if (!on) {
        pressPick(null);
        setAttached('');
        return;
      }
      pressPick(pick);
      const what = pick.dataset.pick;
      if (FORMATS.includes(what)) setAttached(formatLine(what));
      else if (what === 'update') {
        setAttached('');
        lead.pack.value = pick.textContent.trim();
        lead.siteInput.focus();
      } else {
        setAttached('');
        lead.pack.value = t('sites.form.pkg.unsure', pick.textContent.trim());
      }
    });
  }
  // the plan box's «×» (the main page's form clears the box itself and focuses the name): the pick goes too
  lead.clear?.addEventListener('click', () => pressPick(null));
  // «Обговорити» on a card or in a panel, and «Опишіть задачу в заявці»: to the form with that choice on
  for (const link of $$('[data-pick-format]')) {
    if (link.closest('dialog')) continue; // the panels handle theirs (they close first)
    link.addEventListener('click', (e) => {
      e.preventDefault();
      pickFormat(link.dataset.pickFormat);
      goToForm(byKeys(e));
    });
  }
  // «Сайт уже є? Можемо оновити його»: the answer opens
  for (const link of $$('a[href="#faq-has"]')) link.addEventListener('click', () => { $('#faq-has').open = true; });
}
function pickFormat(what) {
  const pick = lead.picks.find((p) => p.dataset.pick === what);
  if (!pick) return;
  if (pick.getAttribute('aria-pressed') !== 'true') pick.click();
  else if (FORMATS.includes(what)) setAttached(formatLine(what));
}
// the main page's glide to the form (lead-form.js): the page's smooth scroll, the name field focused with a mouse.
// (QA 19 Oct, S-23) From the keyboard (a click with no pointer behind it: detail 0) the name takes the focus on any
// screen too, so the next key types the name instead of staying in block 2; a tap on a phone never opens its keyboard
function goToForm(kb = false) {
  glideToForm(!motion);
  if (!kb || fineMQ.matches) return; // (with a mouse and a keyboard lead-form.js focuses it itself)
  const field = $('#f-name');
  let tries = 0;
  const focus = () => {
    field?.focus({ preventScroll: true });
    if (field && document.activeElement !== field && ++tries < 30) setTimeout(focus, 150);
  };
  setTimeout(focus, motion ? 400 : 0);
}
const byKeys = (e) => e?.detail === 0;

/* ---------- 5 · questions: the main page's FAQ (FaqList animates the answers) ---------- */
function initFaq() {
  // (the phone audit, 15 Oct) on a phone the open question is «Ви гарантуєте заявки?»: the prices are on screen four
  // times before it, the honest answer about guarantees is what is missing
  if (phoneMQ.matches) {
    const items = $$('[data-faq] .faq__item');
    const trust = items[5]; // the sixth question
    if (trust) {
      items.forEach((item) => { item.open = false; });
      trust.open = true;
    }
  }
}

// the main page's button back up (BackToTop) steps aside from the bars in its corner, checking on scroll: a bar that
// comes or goes between two scroll events tells it
const nudgeToTop = () => window.dispatchEvent(new Event('scroll'));

/* ---------- (QA 19 Oct, S-02) the button back up steps aside over the page's controls in its corner (SitesShell's quiet
   list: the questions, the form, block 2's tabs and buttons, the price card…). On narrow screens and phones on their
   side block 3's controls run from edge to edge, so all of block 3 is marked (data-quiet). The button checks itself
   only on a scroll, so a change of the page without one (an answer opens, «Що входить у ціну» opens and moves the
   price's button, another format) asks it again ---------- */
function initToTop() {
  const narrow = window.matchMedia('(max-width: 860px), (max-width: 932px) and (max-height: 500px)');
  const block3 = $('#design');
  const mark = () => block3?.toggleAttribute('data-quiet', narrow.matches);
  mark();
  narrow.addEventListener('change', () => { mark(); nudgeToTop(); });
  let queued = 0;
  const later = () => {
    if (!queued) queued = requestAnimationFrame(() => { queued = 0; nudgeToTop(); });
  };
  document.addEventListener('toggle', later, true); // <details> do not bubble it: caught on the way down
  if (typeof ResizeObserver === 'function') new ResizeObserver(later).observe($('#main') || document.body);
}

/* ---------- phones: «Обговорити проєкт» stays at hand once the first screen has passed, not in block 3 (its sum bar
   takes the place) and not at the form ---------- */
function initSticky() {
  const bar = $('[data-sticky]');
  const hero = $('#top');
  if (!bar || !hero) return;
  const link = $('a', bar);
  // (the phone audit, 15 Oct) also while a block's own «Обговорити» is on screen: block 2's card (the open format's)
  // and the end of block 4, so two ember buttons never stand one over the other
  const ends = [$('#design'), $('#contact'), $('.footer'), ...$$('.st-stage__acts .btn--primary'), $('.st-hw-end__acts .btn')].filter(Boolean);
  const after = hero.nextElementSibling || hero;
  let heroGone = false;
  const atEnd = new Set();
  const update = () => {
    const on = heroGone && !atEnd.size && phoneMQ.matches && !OG;
    if (bar.classList.contains('is-on') !== on) requestAnimationFrame(nudgeToTop);
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    link.tabIndex = on ? 0 : -1;
  };
  new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    heroGone = entry.isIntersecting || entry.boundingClientRect.top < 0;
    update();
  }, { rootMargin: '0px 0px -35% 0px' }).observe(after);
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) atEnd.add(entry.target);
      else atEnd.delete(entry.target);
    }
    update();
  });
  ends.forEach((el) => io.observe(el));
  phoneMQ.addEventListener('change', update);
}

/* ---------- 1 → 2 · the formats slide over the first screen (CSS: html.ai-stick, a first screen marked data-cover) ---------- */
function initCover() {
  const hero = $('.ai-hero[data-cover]');
  if (!hero || OG || typeof ResizeObserver !== 'function') return;
  const set = () => root.style.setProperty('--hero-h', `${hero.offsetHeight}px`);
  set();
  new ResizeObserver(set).observe(hero);
  root.classList.add('ai-stick');
}

/* ==========================================================================
   Scenes (the AI pages' queue)
   ========================================================================== */
const scenes = [];
let current = null;
let glide = null; // block 2's rail: the chosen tab's black card and its line (js/sites-fx-page.js mountGlide)
const queue = [];

function initScenes() {
  const defs = {
    build: playBuild,
    'stage-landing': playDev,
    'stage-plus': playDev,
    'stage-corp': playDev, // (16 Oct: the fan of cards is gone; the site scrolls through its pages)
    'stage-shop': playDev,
    how: playHow,
  };
  for (const el of $$('[data-scene]')) {
    const play = defs[el.dataset.scene];
    if (!play) continue;
    const scene = { el, play, anims: [], playing: false, played: false, inView: false, skip: null, token: 0 };
    scenes.push(scene);
    scene.replay = $(`[data-replay~="${el.dataset.scene}"]`);
    scene.replay?.addEventListener('click', () => request(scene, true));
  }
  if (!motion) {
    root.classList.add('ai-go');
    scenes.forEach((s) => { s.played = true; });
    return;
  }
  const vh = window.innerHeight;
  for (const scene of scenes) {
    const r = scene.el.getBoundingClientRect();
    if (r.bottom < 0) {
      scene.played = true;
      showReplay(scene);
    } else if (r.top > vh * 0.82 || !scene.el.offsetParent) {
      setPre(scene, true);
    } else {
      scene.inView = true;
      request(scene);
    }
  }
  root.classList.add('ai-go');
  for (const scene of scenes) {
    const start = Number(scene.el.dataset.sceneStart) || 0.12;
    new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      scene.inView = entry.isIntersecting;
      if (scene.inView) {
        if (entry.intersectionRatio >= start - 0.001 && !scene.played && !scene.playing) request(scene);
      } else {
        if (scene.playing) finish(scene);
        const i = queue.indexOf(scene);
        if (i >= 0) queue.splice(i, 1);
      }
    }, { rootMargin: '0px 0px -18% 0px', threshold: [0, start] }).observe(scene.el);
  }
}

function setPre(scene, on) {
  scene.el.classList.toggle('is-pre', on);
  if (on) scene.el.classList.add('is-warm');
}
function showReplay(scene) {
  scene.replay?.classList.add('is-on');
}

let lastStart = -1e9;
function request(scene, replay = false) {
  if (scene.playing || !motion) return;
  if (current && phoneMQ.matches) {
    if (!queue.includes(scene)) queue.push(scene);
    return;
  }
  const since = performance.now() - lastStart;
  if (since < 140) {
    setTimeout(() => { if (!scene.playing && (replay || (!scene.played && scene.inView))) request(scene, replay); }, 160 - since);
    return;
  }
  start(scene, replay);
}

async function start(scene, replay) {
  lastStart = performance.now();
  scene.el.classList.add('is-warm');
  const token = ++scene.token;
  scene.playing = true;
  current = scene;
  scene.anims = [];
  const anims = scene.play(scene, replay) || [];
  setPre(scene, false);
  try {
    await Promise.all([...anims, ...scene.anims].map((a) => (a.finished ? a.finished : a)));
  } catch { /* cancelled */ }
  if (token !== scene.token) return;
  scene.playing = false;
  scene.played = true;
  scene.el.classList.remove('is-warm');
  scene.anims = [];
  scene.skip = null;
  showReplay(scene);
  if (current === scene) current = null;
  if (queue.length) setTimeout(next, 120);
}

function next() {
  if (current) return;
  while (queue.length) {
    const scene = queue.shift();
    if (scene.inView && !scene.played) {
      start(scene, false);
      break;
    }
  }
}

function finish(scene) {
  scene.skip?.();
  for (const a of scene.anims) {
    try { a.finish(); } catch { a.cancel?.(); }
  }
}

/** one animation, registered with its scene so it can be finished early */
function anim(scene, el, keyframes, options) {
  const a = el.animate(keyframes, { fill: 'backwards', easing: EASE, ...options });
  scene.anims.push(a);
  return a;
}
function slide(scene, el, delay, opts) {
  const pair = slideIn(el, delay, opts);
  scene.anims.push(...pair);
  return pair;
}

/* ---------- 1 · «build»: the page as six labelled blocks, then the real first screen in their place, then the phone ---------- */
function playBuild(scene) {
  const desk = $('.st-show__desk', scene.el);
  const build = $('.st-build', desk);
  const bands = $$('.st-build__b', build);
  const parts = $$('.ms [data-b]', desk);
  const phone = $('.st-show__phone', scene.el);
  const T = 2350; // the bands' time on the screen
  anim(scene, build, [{ opacity: 1 }, { opacity: 1, offset: 0.82 }, { opacity: 0 }], { duration: T, easing: 'linear' });
  bands.forEach((band, i) => {
    const d = 120 + i * 70;
    anim(scene, band, [
      { opacity: 0, transform: 'translate3d(0, 22px, 0) scale(0.98)' },
      { opacity: 1, transform: 'none', offset: 0.24 },
      { opacity: 1, transform: 'none', offset: 0.7 },
      { opacity: 0, transform: 'translate3d(0, 14px, 0)' },
    ], { duration: T - d, delay: d, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  });
  parts.forEach((part, i) => slide(scene, part, 1500 + i * 75, { distance: 18 }));
  anim(scene, phone, [{ opacity: 0, transform: 'translate3d(0, 36px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 2050 });
  return [];
}

/* ---------- 2 · the showroom's stages: the phone comes in, the sample page scrolls down once on the computer and the
   phone and comes back (a longer page takes longer: the volume shows), the ruler lights the blocks as they pass (the
   corporate site: its pages, Головна in full, then the first screen of the others) ---------- */
/** a page-long still as a column of slices (one background image, each slice showing its part) */
function sliceStill(img) {
  const W = Number(img.getAttribute('width')), Hs = Number(img.getAttribute('height'));
  if (!W || !Hs || img.nextElementSibling?.classList.contains('st-dev__col')) return;
  const n = Math.max(1, Math.ceil(Hs / (W * 1.1)));
  const col = document.createElement('div');
  col.className = 'st-dev__col';
  col.setAttribute('aria-hidden', 'true');
  col.style.setProperty('--src', `url("${img.src}")`);
  col.style.setProperty('--n', String(n));
  for (let k = 0; k < n; k++) {
    const slice = document.createElement('i');
    slice.style.aspectRatio = `${W} / ${Hs / n}`;
    slice.style.backgroundPosition = `0 ${n > 1 ? (k / (n - 1)) * 100 : 0}%`;
    col.append(slice);
  }
  img.classList.add('is-src');
  img.after(col);
}

function playDev(scene) {
  const art = scene.el;
  const deskImg = $('.st-dev__desk .st-dev__img', art);
  const desk = $('.st-dev__desk .st-dev__col', art) || deskImg;
  const deskVp = $('.st-dev__desk .st-dev__vp', art);
  const phone = $('.st-dev__phone', art);
  const phoneSrc = $('.st-dev__phone .st-dev__img', art);
  const phoneImg = $('.st-dev__phone .st-dev__col', art) || phoneSrc;
  const phoneVp = $('.st-dev__phone .st-dev__vp', art);
  const ruler = $$('.st-ruler li', art);
  if (phone) anim(scene, phone, [{ opacity: 0, transform: 'translate3d(0, 30px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 150 });
  // (15 Oct) the stills are page-long: the scroll starts once they are decoded (the blurred top stands in meanwhile),
  // at most 6 s later; a finish/replay before that cancels it
  const imgs = [deskImg, phoneSrc].filter(Boolean);
  const ready = Promise.race([
    Promise.all(imgs.map((img) => (img.decode ? img.decode().catch(() => {}) : null))),
    new Promise((r) => setTimeout(r, 6000)),
  ]);
  const token = scene.token;
  let skipped = false;
  scene.skip = () => { skipped = true; };
  return [ready.then(() => (skipped || token !== scene.token ? null : runDev(scene, desk, deskVp, phoneImg, phoneVp, ruler)))];
}
function runDev(scene, desk, deskVp, phoneImg, phoneVp, ruler) {
  const range = desk && deskVp ? Math.max(0, desk.getBoundingClientRect().height - deskVp.clientHeight) : 0;
  if (!range) return null;
  const down = Math.min(9000, (range / 150) * 1000); // about 150 px a second on the computer
  const hold = 900, rest = 800, back = 1100;
  const T = hold + down + rest + back;
  const frames = (r) => [
    { transform: 'none' },
    { transform: 'none', offset: hold / T, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    { transform: `translateY(${-r}px)`, offset: (hold + down) / T },
    { transform: `translateY(${-r}px)`, offset: (hold + down + rest) / T, easing: EASE_IO },
    { transform: 'none' },
  ];
  anim(scene, desk, frames(range), { duration: T, easing: 'linear' });
  // block 2's rail: the chosen tab's line follows the sample down the page and back
  if (glide?.line) {
    anim(scene, glide.line, [
      { transform: 'scaleX(0)' },
      { transform: 'scaleX(0)', offset: hold / T, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
      { transform: 'scaleX(1)', offset: (hold + down) / T },
      { transform: 'scaleX(1)', offset: (hold + down + rest) / T, easing: EASE_IO },
      { transform: 'scaleX(0)' },
    ], { duration: T, easing: 'linear' });
  }
  const pRange = phoneImg && phoneVp ? Math.max(0, phoneImg.getBoundingClientRect().height - phoneVp.clientHeight) : 0;
  if (pRange) anim(scene, phoneImg, frames(pRange), { duration: T, easing: 'linear' });
  // the ruler: each block lights while the page passes it
  if (ruler.length) {
    const timers = [];
    const step = down / ruler.length;
    // (a ruler with data-stops: where each item starts, as parts of the scroll; else evenly)
    const stops = (ruler[0].parentElement.dataset.stops || '').split(',').map(Number).filter((n) => Number.isFinite(n));
    ruler.forEach((li, i) => {
      const at = stops.length === ruler.length ? stops[i] * down : i * step;
      timers.push(setTimeout(() => { ruler.forEach((x) => x.classList.remove('is-on')); li.classList.add('is-on'); }, hold + at));
    });
    timers.push(setTimeout(() => ruler.forEach((x) => x.classList.remove('is-on')), hold + down + rest));
    scene.skip = () => { timers.forEach(clearTimeout); ruler.forEach((x) => x.classList.remove('is-on')); };
  }
  return Promise.all(scene.anims.map((a) => a.finished)).catch(() => {});
}

/* ---------- 4 · «Як працюємо»: the board comes up, the call's bubbles appear, the plan's boxes tick one by one (the
   rest of the block answers the reading line: js/sites-fx-how.js) ---------- */
function playHow(scene) {
  const board = $('.st-bd', scene.el);
  if (board) anim(scene, board, [{ opacity: 0, transform: 'translate3d(0, 24px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 800 });
  $$('.st-bd__bub', scene.el).forEach((bub, i) => anim(scene, bub, [{ opacity: 0, transform: 'translate3d(0, 10px, 0) scale(0.96)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 260 + i * 110 }));
  $$('.st-bd__box b', scene.el).forEach((box, i) => anim(scene, box, [{ transform: 'scale(0)' }, { transform: 'none' }], { duration: 420, delay: 560 + i * 150, easing: SPRING }));
  return [];
}

/* ---------- 2 · «Детальніше»: the format's panel (a native modal <dialog>: focus stays inside, Esc and a tap outside close
   it). In the middle on wide screens, a sheet from below on phones ---------- */
function initDialogs() {
  const dialogs = $$('.ai-dlg');
  if (!dialogs.length || typeof HTMLDialogElement !== 'function') return;
  const sheet = () => phoneMQ.matches;
  const fx = new WeakMap();
  const openers = new WeakMap();
  const stopFx = (dlg) => { (fx.get(dlg) || []).forEach((a) => a.cancel()); fx.delete(dlg); };
  const backdrop = (dlg, frames, options) => {
    try { return dlg.animate(frames, { ...options, pseudoElement: '::backdrop' }); } catch { return null; }
  };
  const open = (dlg, opener) => {
    if (dlg.open) return;
    openers.set(dlg, opener);
    stopFx(dlg);
    dlg.showModal();
    root.classList.add('ai-modal');
    if (!motion) return;
    const panel = $('.ai-dlg__panel', dlg);
    const up = sheet();
    fx.set(dlg, [
      panel.animate([{ opacity: up ? 1 : 0, transform: up ? 'translateY(100%)' : 'translateY(20px) scale(0.97)' }, { opacity: 1, transform: 'none' }], { duration: up ? 480 : 440, easing: EASE }),
      backdrop(dlg, [{ opacity: 0 }, { opacity: 1 }], { duration: 320 }),
      // the lists come in one by one (AnimatedList), after the panel
      ...$$('.st-blocks li, .ai-dlg__inc li', dlg).flatMap((li, i) => slideIn(li, (up ? 220 : 160) + i * 34, { distance: 14 })),
    ].filter(Boolean));
  };
  const close = async (dlg, after) => {
    if (!dlg.open || dlg.dataset.closing) return;
    if (motion) {
      dlg.dataset.closing = '1';
      stopFx(dlg);
      const panel = $('.ai-dlg__panel', dlg);
      const up = sheet();
      const out = panel.animate([{ opacity: 1, transform: 'none' }, { opacity: up ? 1 : 0, transform: up ? 'translateY(100%)' : 'translateY(12px) scale(0.98)' }], { duration: up ? 300 : 240, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
      fx.set(dlg, [out, backdrop(dlg, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' })].filter(Boolean));
      await out.finished.catch(() => {});
      delete dlg.dataset.closing;
    }
    dlg.close();
    stopFx(dlg);
    root.classList.remove('ai-modal');
    if (after) after();
    else openers.get(dlg)?.focus({ preventScroll: true });
  };

  for (const button of $$('[data-open]')) {
    const dlg = document.getElementById(button.dataset.open);
    if (dlg) button.addEventListener('click', () => open(dlg, button));
  }
  for (const dlg of dialogs) {
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(dlg); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(dlg); });
    for (const x of $$('[data-close]', dlg)) x.addEventListener('click', () => close(dlg));
    // «Обговорити»: to the form, with this format chosen
    for (const talk of $$('[data-pick-format]', dlg)) {
      talk.addEventListener('click', (e) => {
        e.preventDefault();
        const kb = byKeys(e);
        close(dlg, () => { pickFormat(talk.dataset.pickFormat); goToForm(kb); });
      });
    }
    // «Порахувати з дизайном»: to block 3, with this format chosen
    for (const count of $$('[data-calc-format]', dlg)) {
      count.addEventListener('click', () => close(dlg, () => {
        setFormat(count.dataset.calcFormat);
        $('#design')?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' });
        $(`input[name="calc-format"][value="${count.dataset.calcFormat}"]`)?.focus({ preventScroll: true });
      }));
    }
  }
}

/* ==========================================================================
   3 · the price: format × design × extras; the sum rolls, the weeks fade in; «Надіслати розрахунок» → the form
   ========================================================================== */
const state = { format: 'landing', design: 'essential', variant: 1, motion: false, three: false, second: false };
let renderCalc = () => {};
let syncTabs = () => {};
let syncHow = () => {};

function setFormat(f) {
  if (!FORMATS.includes(f)) return;
  const input = $(`input[name="calc-format"][value="${f}"]`);
  if (input) input.checked = true;
  state.format = f;
  renderCalc(true);
  syncTabs();
}

function initCalc() {
  const form = $('[data-calc]');
  if (!form) return;
  form.addEventListener('submit', (e) => e.preventDefault());
  const seg = $('[data-seg]', form);
  const preview = mountSamples();
  const out = {
    weeks: $('[data-calc-weeks]', form),
    name: $('[data-calc-name]', form),
    extra: $('[data-calc-extra]', form),
    price: $('[data-calc-price]', form),
    inc: $('[data-calc-inc]', form),
    live: $('[data-calc-live]', form),
    send: $('[data-calc-send]', form),
    here: $('[data-here]', form),
    bar: { price: $('[data-sumbar-price]'), weeks: $('[data-sumbar-weeks]') },
  };
  const item = (key) => strings?.items?.[key];
  const list = (key, dictPrefix, n) => item(key)?.[1] ?? Array.from({ length: n }, (_, i) => t(`${dictPrefix}.${i + 1}`, '')).filter(Boolean);
  const name = (key, dictKey) => item(key)?.[0] ?? t(dictKey, '');
  const mark = (key, dictKey) => strings?.preview?.marks?.[key] ?? t(dictKey, '');

  const compute = () => {
    const est = estimate(state);
    const row = TABLE[state.format];
    const fName = formatName(state.format);
    // (owner, 15 Oct: one design level only; the samples are the design the price buys)
    const extras = [];
    const lines = [`${fName} — ${money(row.price)}`];
    const groups = [[`${fName} · ${money(row.price)}`, $$(`[data-inc="${state.format}"] li`).map((li) => li.textContent.trim())]];
    if (state.motion) {
      extras.push(mark('motion', 'sites.mark.motion'));
      const n = name('advancedMotion', 'sites.o.motion');
      lines.push(`${n} — +${money(row.motion[0])}`);
      groups.push([`${n} · +${money(row.motion[0])}`, list('advancedMotion', 'sites.inc.motion', 3)]);
    }
    if (state.three) {
      extras.push(mark('threeD', 'sites.mark.3d'));
      const n = name('threeDHero', 'sites.o.3d');
      lines.push(`${n} — +${money(TABLE.three[0])}`);
      groups.push([`${n} · +${money(TABLE.three[0])}`, list('threeDHero', 'sites.inc.3d', 3)]);
    }
    if (state.second) {
      extras.push(mark('lang2', 'sites.mark.lang'));
      const n = name('secondLanguage', 'sites.o.lang');
      lines.push(`${n} — +${money(row.lang[0])}`);
      groups.push([`${n} · +${money(row.lang[0])}`, list('secondLanguage', 'sites.inc.lang', 3)]);
    }
    const weeks = weeksText(est.min, est.max);
    lines.push(`${t('sites.calc.total', 'Разом')} — ${money(est.sum)} ${text('sites.once', 'разово')}, ${weeks}`);
    return { ...est, title: fName, extras, lines, groups, weeks, priceText: money(est.sum) };
  };

  let last = '';
  let lastSum = null;
  renderCalc = (roll = false) => {
    const r = compute();
    // the change itself, beside the number («+$400»), and a lap of light round the card
    if (roll && motion && lastSum !== null && r.sum !== lastSum) {
      const d = r.sum - lastSum;
      deltaChip(out.price.parentElement, `${d > 0 ? '+' : '−'}${money(Math.abs(d))}`, { up: d > 0 });
      beam($('.st-sum'), { duration: 1300 });
    }
    lastSum = r.sum;
    // the choices' own state
    const fi = FORMATS.indexOf(state.format);
    seg.style.setProperty('--i', String(fi));
    for (const label of $$('.st-seg__o, .st-add', form)) label.classList.toggle('is-on', $('input', label).checked);
    // the prices that depend on the format
    const row = TABLE[state.format];
    const optPrice = { design: row.design[0], motion: row.motion[0], three: TABLE.three[0], lang: row.lang[0] };
    for (const el of $$('[data-oprice]', form)) el.textContent = `+${money(optPrice[el.dataset.oprice])}`;
    // the sample site of this format and design, with the extras on it
    preview?.update({
      // (owner, 14 Oct: animation is in every format's price: every sample moves)
      format: state.format, design: state.design, variant: state.variant, advancedMotion: true, threeDHero: state.three,
      secondLanguage: state.second, growth: 'none', adsManagement: false, automation: 'none',
    });
    renderMap();
    // the sum
    out.name.textContent = r.title;
    out.extra.hidden = !r.extras.length;
    out.extra.textContent = r.extras.join(', ');
    const anims = rollNumber(out.price, r.priceText, { roll: roll && motion });
    if (out.bar.price) rollNumber(out.bar.price, r.priceText, { roll: roll && motion });
    void anims;
    if (out.weeks.textContent !== r.weeks) {
      out.weeks.textContent = r.weeks;
      if (out.bar.weeks) out.bar.weeks.textContent = r.weeks;
      if (roll && motion) out.weeks.animate([{ opacity: 0.25, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EASE });
    }
    out.inc.replaceChildren(...r.groups.map(([title, items]) => {
      const box2 = document.createElement('div');
      const h = Object.assign(document.createElement('p'), { className: 'ai-calc__inc-h', textContent: title });
      const ul = document.createElement('ul');
      ul.append(...items.map((line) => Object.assign(document.createElement('li'), { textContent: line })));
      box2.append(h, ul);
      return box2;
    }));
    if (out.here) out.here.hidden = !(motion && state.three);
    const key = `${r.title}|${r.extras.join()}|${r.priceText}|${r.weeks}`;
    if (key !== last) {
      out.live.textContent = last ? `${r.title}${r.extras.length ? `, ${r.extras.join(', ')}` : ''}: ${r.priceText}, ${r.weeks}` : '';
      last = key;
    }
    syncHow(roll);
    return r;
  };

  form.addEventListener('change', (e) => {
    const input = e.target;
    if (input.name === 'calc-format') {
      state.format = input.value;
      syncTabs();
    } else if (input.dataset.opt === 'motion') {
      state.motion = input.checked;
    } else if (input.dataset.opt === 'three') {
      state.three = input.checked;
    } else if (input.dataset.opt === 'lang') {
      state.second = input.checked;
    }
    renderCalc(true);
  });
  // keyboard focus on a hidden input shows on its card
  for (const input of $$('input', form)) {
    const label = input.closest('label');
    if (!label) continue;
    input.addEventListener('focus', () => label.classList.toggle('is-focus', input.matches(':focus-visible')));
    input.addEventListener('blur', () => label.classList.remove('is-focus'));
  }

  renderCalc(false);

  out.send.addEventListener('click', (e) => {
    const r = renderCalc(false);
    const summary = [r.title, r.extras.join(', '), `${r.priceText} ${text('sites.once', 'разово')}`, r.weeks].filter(Boolean).join(' · ');
    const pick = lead.picks?.find((p) => p.dataset.pick === state.format);
    pressPick(pick || null);
    setAttached(summary, r.lines.join('\n'));
    goToForm(byKeys(e));
  });
}

/* ---------- 3 · under the sample: what it has, block by block (Лендінг+'s extra blocks marked +) ---------- */
function renderMap() {
  const list = $('[data-pv-list]');
  const count = $('[data-pv-count]');
  if (!list) return;
  // the round-6 designs (n): one per format
  const d = 'n';
  const key = { landing: `l.${d}`, landingPlus: `l.${d}`, corporate: 'c', ecommerce: 'e' }[state.format];
  const words = (k) => t(k, '').split('·').map((w) => w.trim()).filter(Boolean);
  let items;
  if (state.format === 'landingPlus' && t(`sites.pv.lp.${d}.all`, '')) {
    // a Лендінг+ with its own design: its ten blocks in order, the extras at the indexes in sites.pv.lp.<d>.add
    const add = t(`sites.pv.lp.${d}.add`, '').split(',').map(Number);
    items = words(`sites.pv.lp.${d}.all`).map((w, i) => [w, add.includes(i)]);
  } else {
    const base = words(`sites.pv.${key}`);
    const extra = state.format === 'landingPlus' ? words(`sites.pv.lp.${d}`) : [];
    // the extra blocks sit where the sample has them: after the base block named in sites.pv.lp.<d>.at (indexes)
    const at = t(`sites.pv.lp.${d}.at`, '').split(',').map(Number);
    items = base.map((w) => [w, false]);
    extra.forEach((w, i) => items.splice((at[i] ?? items.length) + i, 0, [w, true]));
  }
  list.replaceChildren(...items.map(([w, add]) => {
    const li = Object.assign(document.createElement('li'), { textContent: w });
    if (add) li.className = 'is-add';
    return li;
  }));
  count.textContent = t(`sites.pv.n.${state.format === 'landingPlus' ? `lp.${d}` : key}`, '');
}

/* ---------- 3 · the sample sites: the main page's configurator samples (js/sites-pv.js and its modules, copied):
   one business per format, Базовий and Авторський each its own site, the extras visible on it. The cube's stills come
   from the main page's /img/cfg/ ---------- */
const PV_ASSETS = {
  cube: {
    light: ['/img/cfg/cube-light-320.webp', '/img/cfg/cube-light-640.webp'],
    dark: ['/img/cfg/cube-dark-320.webp', '/img/cfg/cube-dark-640.webp'],
  },
  cubesLight: '/img/cfg/cubes-light.webp',
  cubesDark: '/img/cfg/cubes-dark.webp',
};
let pvModule = null;
function mountSamples() {
  const host = $('[data-pv]');
  if (!host || !pvModule || !strings) return null;
  try {
    return pvModule.mountPreview(host, { t: strings, lang: lang(), assets: PV_ASSETS, reducedMotion: !motion, phone: phoneMQ.matches, labels: { take: t('sites.pv.take', 'Гортайте й натискайте самі'), auto: t('sites.pv.auto', 'Автопрокрутка'), full: t('sites.pv.full', 'На весь екран'), close: t('sites.pv.close', 'Закрити') }, full: true, onFull: (on) => { const l = getLenis(); if (on) l?.stop(); else l?.start(); } });
  } catch (error) {
    console.warn('[samples] the sample sites are not available.', error);
    host.closest('[data-pv-box]')?.setAttribute('hidden', '');
    return null;
  }
}

/* ==========================================================================
   2 · the showroom: four tabs (all four prices at once) and one stage. The chosen format is the page's one choice: the
   same as block 3's segment. A tab shown again plays its stage again (the person asked for it)
   ========================================================================== */
function initTabs() {
  const room = $('[data-room]');
  if (!room) return;
  const buttons = $$('.st-rail__t', room);
  const stageOf = (f) => $(`.st-stage[data-fmt="${f}"]`, room);
  // (15 Oct) phones take the 600-px copies of the page-long stills (…-s.jpg). The stills carry their address in
  // data-src (the dictionary's, per language) and get it here, so a phone never starts the big copy first (the phone
  // audit: the first still came twice, 0.5 MB more, 1.3 MB in Russian). (QA 19 Oct, S-20) So do narrow tablets and
  // phones on their side, up to 860 px: the same copies, the open format's first, another's as its tab is pressed
  const phone = narrowMQ.matches;
  for (const img of $$('.st-dev__img[data-src]', room)) {
    const desk = img.closest('.st-dev__desk');
    img.src = phone && desk ? img.dataset.src.replace(/\.jpg$/, '-s.jpg') : img.dataset.src;
  }
  // on a computer every still starts loading once block 2 is within a screen, so a tab never opens on an empty window;
  // on a phone only the open format's (the phone audit: all ten, 2.2 MB, came at the page's load), and another
  // format's as its tab is pressed (the blurred stand-in covers the moment)
  const stills = $$('.st-stage img', room);
  const eager = (imgs) => { for (const img of imgs) img.loading = 'eager'; };
  const stageImgs = (f) => $$(`.st-stage[data-fmt="${f}"] img`, room);
  let near2 = false;
  const near = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    near.disconnect();
    near2 = true;
    eager(phone ? stageImgs(state.format) : stills);
  }, { rootMargin: '900px 0px' });
  near.observe(room);
  if (phone) {
    for (const b of buttons) b.addEventListener('pointerdown', () => { if (near2) eager(stageImgs(b.dataset.tab)); }, { passive: true });
  }
  // (15 Oct) Safari paints a page-long image inside a moving layer tile by tile and falls behind the scroll: the window
  // showed black, then the blurred stand-in. Each still is shown as a column of slices instead, each slice its own
  // small layer (under 2 000 device px), painted before the scroll starts; the <img> stays for decode() only
  for (const img of $$('.st-dev__img', room)) sliceStill(img);
  // the rulers: the pictured sample's blocks in order (the round-6 Базовий designs), Лендінг+'s extra ones marked
  for (const ol of $$('[data-ruler]', room)) {
    const plus = ol.dataset.ruler === 'landingPlus';
    const words = (k) => t(k, '').split('·').map((w) => w.trim()).filter(Boolean);
    const add = t('sites.pv.lp.n.add', '').split(',').map(Number);
    const corp = ol.dataset.ruler === 'corporate';
    const items = plus ? words('sites.pv.lp.n.all').map((w, i) => [w, add.includes(i)]) : words(corp ? 'sites.pv.c' : 'sites.pv.l.n').map((w) => [w, false]);
    ol.replaceChildren(...items.map(([w, add]) => Object.assign(document.createElement('li'), { textContent: w, className: add ? 'is-add' : '' })));
  }
  evenStages(room);
  let shown = state.format;
  glide = OG ? null : mountGlide($('.st-rail', room));
  let placed = false;
  syncTabs = (replay = false) => {
    for (const b of buttons) {
      const on = b.dataset.tab === state.format;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      const stage = stageOf(b.dataset.tab);
      if (stage) stage.hidden = !on;
    }
    // (a phone: the chosen format's stills, if block 2 is near)
    if (phone && near2) eager(stageImgs(state.format));
    // the black card glides to the chosen tab (placed at once the first time and without motion)
    glide?.place(buttons.find((b) => b.dataset.tab === state.format), !placed || !motion);
    placed = true;
    if (shown !== state.format || replay) {
      const from = shown;
      shown = state.format;
      if (from !== shown) stageIn(stageOf(shown), from);
      const scene = scenes.find((sc) => stageOf(state.format)?.contains(sc.el));
      if (scene) { scene.inView = true; request(scene, true); }
    }
  };
  for (const b of buttons) {
    b.addEventListener('click', () => setFormat(b.dataset.tab));
    b.addEventListener('keydown', (e) => {
      const i = buttons.indexOf(b);
      const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: buttons.length - 1 }[e.key];
      if (to == null) return;
      e.preventDefault();
      const target = buttons[(to + buttons.length) % buttons.length];
      setFormat(target.dataset.tab);
      target.focus();
    });
  }
  // «Порахувати з дизайном»: to block 3 with this format
  for (const count of $$('[data-calc-format]', room)) {
    count.addEventListener('click', () => {
      setFormat(count.dataset.calcFormat);
      $('#design')?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' });
    });
  }
  syncTabs();
}

/* ---------- 2 · (QA 19 Oct, S-16) the four format cards one height: the tallest one's at this width, so another format
   never moves what is under the card. Measured with each card shown in turn, in one go (nothing paints between, no
   picture starts loading); again when the width changes and once the fonts are in ---------- */
function evenStages(room) {
  const stages = $$('.st-stage', room);
  if (stages.length < 2) return;
  const even = () => {
    let tallest = 0;
    // (while a hidden card is shown for the measure its pictures must not start: the stills are CSS backgrounds,
    // which a shown element fetches at once; .st-measure turns them off for that moment, sites.css)
    room.classList.add('st-measure');
    for (const stage of stages) {
      const hidden = stage.hidden;
      stage.style.minHeight = '';
      stage.hidden = false;
      tallest = Math.max(tallest, stage.getBoundingClientRect().height); // (fractional: equal to the tallest to the subpixel)
      stage.hidden = hidden;
    }
    room.classList.remove('st-measure');
    for (const stage of stages) stage.style.minHeight = `${tallest}px`;
  };
  even();
  let width = window.innerWidth;
  let timer = 0;
  window.addEventListener('resize', () => {
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(even, 150);
  });
  document.fonts?.ready.then(even);
}

/* ---------- 2 · a format chosen: its stage's words come in (the title out of its mask, the ticks one by one as
   AnimatedList, the price's digits rolling from the last format's as Counter), its picture rises. Only when the stage
   is on screen (block 3's segment changes it off screen too) ---------- */
let stageFx = [];
function stageIn(stage, from) {
  stageFx.forEach((a) => a.cancel());
  stageFx = [];
  if (!motion || !stage) return;
  const r = stage.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) return;
  const add = (...a) => stageFx.push(...a);
  const rise = (el, delay, dist = 14) => {
    if (el) add(el.animate([{ opacity: 0, transform: `translate3d(0, ${dist}px, 0)` }, { opacity: 1, transform: 'none' }], { duration: 640, delay, easing: EASE, fill: 'backwards' }));
  };
  rise($('.st-stage__k', stage), 0, 10);
  const title = $('.st-stage__tin', stage);
  if (title) add(title.animate([{ transform: 'translate3d(0, 112%, 0)' }, { transform: 'none' }], { duration: 950, delay: 40, easing: EASE, fill: 'backwards' }));
  rise($('.st-stage__m', stage), 120);
  rise($('.st-stage__p', stage), 170);
  $$('.st-stage__inc li', stage).forEach((li, i) => add(...slideIn(li, 210 + i * 45, { distance: 16 })));
  const price = $('.st-stage__price [data-fprice]', stage);
  if (price) {
    const to = money(estimate({ format: stage.dataset.fmt, design: 'essential' }).sum);
    const was = FORMATS.includes(from) ? money(estimate({ format: from, design: 'essential' }).sum) : '';
    const lined = was && [...was].length === [...to].length && [...was].every((c, i) => /\d/.test(c) === /\d/.test(to[i]));
    if (lined) {
      rollNumber(price, was);
      add(...rollNumber(price, to, { roll: true }));
    } else {
      rollNumber(price, to);
      rise(price, 240, 12);
    }
  }
  rise($('.st-stage__wk', stage), 330, 8);
  rise($('.st-stage__acts', stage), 380, 12);
  for (const art of $$('.st-dev__desk', stage)) {
    add(art.animate([{ opacity: 0, transform: 'translate3d(0, 22px, 0) scale(0.985)' }, { opacity: 1, transform: 'none' }], { duration: 760, delay: 60, easing: EASE, fill: 'backwards' }));
  }
}

/* ---------- 4 · «Як працюємо»: the board (js/sites-fx-how.js); the time from the first call to the launch for a format:
   the engine's weeks, the same estimate as block 3 (with its 3D and second language when that format is block 3's);
   a 4-option switch that starts on block 3's format, follows it until the visitor uses it, and never changes block 3.
   «Обговорити проєкт» goes to the form; if this switch was used and the form has nothing attached yet, it attaches
   that format (a block-3 calculation is never overwritten) ---------- */
function initHow() {
  mountHow({ motion: motion && !OG });
  const seg = $('[data-how-seg]');
  const out = $('[data-how-weeks]');
  if (!seg || !out) return;
  const add = $('[data-how-add]');
  const calcNote = $('[data-how-calc]');
  // (the phone audit, 15 Oct) phones hide this switch (the format is block 3's) and name the format after the label
  const fname = Object.assign(document.createElement('span'), { className: 'st-hw-time__f' });
  $('#how-time-k')?.append(fname);
  let fmt = state.format;
  let touched = false;
  let shownText = '';
  const paint = (roll) => {
    for (const o of $$('.st-hseg__o', seg)) {
      const input = $('input', o);
      input.checked = input.value === fmt;
      o.classList.toggle('is-on', input.checked);
    }
    seg.style.setProperty('--i', String(Math.max(0, FORMATS.indexOf(fmt))));
    const asCalc = fmt === state.format && (state.three || state.second);
    const est = asCalc ? estimate(state) : estimate({ format: fmt, design: 'essential' });
    const text = weeksText(est.min, est.max);
    if (text !== shownText) {
      rollNumber(out, text, { roll: roll && motion });
      if (roll && motion) out.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 380, easing: EASE });
      shownText = text;
    }
    if (add) add.hidden = asCalc;
    if (calcNote) calcNote.hidden = !asCalc;
    fname.textContent = ` · ${formatName(fmt)}`;
  };
  seg.addEventListener('change', (e) => {
    if (e.target.name !== 'how-format') return;
    fmt = e.target.value;
    touched = true;
    paint(true);
  });
  for (const input of $$('input', seg)) {
    const label = input.closest('label');
    input.addEventListener('focus', () => label.classList.toggle('is-focus', input.matches(':focus-visible')));
    input.addEventListener('blur', () => label.classList.remove('is-focus'));
  }
  syncHow = (roll = false) => {
    if (!touched) fmt = state.format;
    paint(roll);
  };
  paint(false);
  $('[data-how-cta]')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (touched && lead.pack && !lead.pack.value) pickFormat(fmt);
    goToForm(byKeys(e));
  });
}

/* ---------- ≤860: while block 3 is on screen and its sum card is not, the sum stays at hand ---------- */
function initSumbar() {
  const bar = $('[data-sumbar]');
  const block = $('#design');
  const card = $('.st-sum');
  if (!bar || !block || !card) return;
  let inBlock = false;
  let cardSeen = false;
  const update = () => {
    const on = inBlock && !cardSeen && narrowMQ.matches && !OG;
    if (bar.classList.contains('is-on') !== on) requestAnimationFrame(nudgeToTop);
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    bar.tabIndex = on ? 0 : -1;
  };
  // (the top band under the header does not count: block 3's last pixels there are not «in block 3»)
  new IntersectionObserver((entries) => { inBlock = entries[entries.length - 1].isIntersecting; update(); }, { rootMargin: '-15% 0px -35% 0px' }).observe(block);
  new IntersectionObserver((entries) => { cardSeen = entries[entries.length - 1].isIntersecting; update(); }, { threshold: 0.15 }).observe(card);
  narrowMQ.addEventListener('change', update);
}
