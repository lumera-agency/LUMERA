/*
 * The AI pages: «AI-автоматизація» (/ai-avtomatyzatsiia/), its case (/keisy/poshuk-zamovlen/) and the assistant
 * example (/keisy/ai-asystent/). One light module for all three (each part starts only where its markup is): no
 * three.js, no intro, no GSAP, nothing from the main page's scripts (their own copies live in js/ai-i18n.js,
 * js/ai-lead.js).
 *
 * Motion rules (the owner's): every scene plays once as it comes into view, with WAAPI on transform and
 * opacity only; on phones only one scene plays at a time (the next waits its turn, a scene that leaves
 * the screen jumps to its end); at rest nothing runs (no rAF, no endless loops); with reduced motion the
 * page shows every scene's final frame. The CSS default of each scene IS its final frame: `.is-pre`
 * holds a scene's start frame until it plays, and the animations use fill: 'backwards', so nothing is
 * left applied once they end. «↻ Ще раз» plays a scene again.
 */
import { initI18n, restoreScroll, t } from './ai-i18n.js';
import { typesetText, sendLead, contactOk } from './ai-lead.js';
import { initWordmark } from './ai-wordmark.js';

const root = document.documentElement;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const OG = new URLSearchParams(location.search).has('og');
if (OG) root.classList.add('og-render');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = !reducedMotion && !OG && typeof Element.prototype.animate === 'function';
const phoneMQ = window.matchMedia('(max-width: 600px)');
const noteMQ = window.matchMedia('(max-width: 720px)'); // 5 · the notes beside the Telegram message go
const pathMQ = window.matchMedia('(max-width: 860px)'); // the AI page's letter path stands up (2 · Як це працює)
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IO = 'cubic-bezier(0.65, 0, 0.35, 1)';

// the main page's prices and launch times for the ready-made parts: read from its calculator when it is there,
// so the pages never disagree; the values written in the HTML and the dictionary otherwise (the page never
// depends on those files)
const pricesReady = import('/js/configurator/engine.js').catch(() => null);
const stringsReady = import('/js/configurator/strings.js').then((m) => m.STRINGS ?? null).catch(() => null);

boot();

async function boot() {
  await initI18n();
  await fillFacts();
  typesetText($('.topbar'));
  typesetText($('[data-page]'));
  typesetText($('.footer'));
  initRollLinks();
  initMenu();
  initForm();
  initPicks();
  initFaq();
  initSticky();
  initCover();
  initStone();
  initFilm();
  initScenes();
  initCards();
  initDialogs();
  await initCalc();
  if (!OG) initWordmark({ reducedMotion });
  arrive();
}

/* ---------- the ready-made parts' prices and launch times (AI page · 3 and 5; the salon page's FAQ) ----------
   [data-price] = lead | crm | site (the landing); [data-weeks] = lead | crm (the calculator's time for an existing site);
   [data-price-line] = text with {lead} / {crm} tokens */
async function fillFacts() {
  const prices = $$('[data-price]');
  const weeks = $$('[data-weeks]');
  const lines = $$('[data-price-line]');
  if (!prices.length && !weeks.length && !lines.length) return;
  const sums = { lead: '$100', crm: '$500', site: '$500' };
  const engine = await pricesReady;
  if (typeof engine?.money === 'function') {
    const read = (fn) => { try { const n = fn(); return Number.isFinite(n) ? engine.money(n) : null; } catch { return null; } };
    sums.lead = read(() => engine.PRICING.automation.lead.price) ?? sums.lead;
    sums.crm = read(() => engine.PRICING.automation.crmAi.price) ?? sums.crm;
    sums.site = read(() => engine.PRICING.formats.landing.price) ?? sums.site;
  }
  for (const el of prices) el.textContent = sums[el.dataset.price] ?? el.textContent;
  for (const el of lines) el.textContent = el.textContent.replace(/\{(\w+)\}/g, (token, key) => sums[key] ?? token);
  if (!weeks.length || typeof engine?.calculateTimeline !== 'function') return;
  const strings = (await stringsReady)?.[root.lang];
  if (typeof strings?.weeks !== 'function') return;
  for (const el of weeks) {
    try {
      const t = engine.calculateTimeline({ ...engine.DEFAULT_CONFIG, format: 'existing', automation: el.dataset.weeks === 'crm' ? 'crmAi' : 'lead' });
      if (t) el.textContent = strings.weeks(t.min, t.max).replace(/ /g, '\u00a0');
    } catch { /* the dictionary's text stays */ }
  }
}

/* ---------- AI page · 6 · quick picks: a tap adds its phrase to «Що робите вручну?», a second tap takes it out ---------- */
function initPicks() {
  const field = $('#f-note');
  const picks = $$('.ai-pick');
  if (!field || !picks.length) return;
  const phrase = (pick) => pick.textContent.trim();
  for (const pick of picks) {
    pick.addEventListener('click', () => {
      const on = pick.getAttribute('aria-pressed') !== 'true';
      pick.setAttribute('aria-pressed', String(on));
      const text = phrase(pick);
      const value = field.value.replace(/[\s,]+$/, '');
      if (on) {
        field.value = value ? `${value}, ${text.charAt(0).toLocaleLowerCase(root.lang)}${text.slice(1)}` : text;
      } else {
        // taken out only if it is still there word for word (an edited phrase stays)
        const parts = value.split(/,\s*/);
        const i = parts.findIndex((part) => part.toLocaleLowerCase(root.lang) === text.toLocaleLowerCase(root.lang));
        if (i >= 0) {
          parts.splice(i, 1);
          const rest = parts.join(', ');
          field.value = rest ? rest.charAt(0).toLocaleUpperCase(root.lang) + rest.slice(1) : '';
        }
      }
      field.dispatchEvent(new Event('input'));
    });
  }
}

/* ---------- where the visitor lands: back where they were after a language switch, else at the #block ---------- */
function arrive() {
  if (restoreScroll()) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  // the other language's text is in now: the browser's own jump to the hash was made before it
  if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
}

/* ---------- the topbar's links: each letter rolls on hover (the main page's .roll, same CSS) ---------- */
function initRollLinks() {
  for (const link of $$('.nav__link')) {
    const label = link.querySelector('[data-i18n]') || link;
    const textNode = [...label.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (!textNode || link.querySelector('.roll')) continue;
    const text = textNode.textContent.trim();
    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');
    [...text].forEach((char, i) => {
      const column = document.createElement('span');
      column.className = 'roll__c';
      column.style.setProperty('--i', i);
      for (let k = 0; k < 2; k++) column.append(Object.assign(document.createElement('span'), { textContent: char }));
      roll.append(column);
    });
    textNode.replaceWith(Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: text }), roll);
  }
}

/* ---------- phones and tablets: the page's links and UA · RU behind the menu button ---------- */
function initMenu() {
  const bar = $('[data-topbar]');
  const menu = $('[data-topbar-menu]', bar);
  const sheet = $('[data-topbar-sheet]', bar);
  if (!menu || !sheet) return;
  const setMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    sheet.hidden = !open;
    bar.classList.toggle('is-menu', open);
  };
  menu.addEventListener('click', () => setMenu(sheet.hidden));
  sheet.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || sheet.hidden) return;
    setMenu(false);
    menu.focus();
  });
  document.addEventListener('pointerdown', (e) => { if (!sheet.hidden && !bar.contains(e.target)) setMenu(false); });
  bar.addEventListener('focusout', (e) => { if (!sheet.hidden && !bar.contains(e.relatedTarget)) setMenu(false); });
}

/* ---------- 9 · the request: name and contact required, the task is fixed («Автоматизація») ---------- */
function initForm() {
  const form = $('[data-lead-form]');
  if (!form) return;
  const langInput = $('[data-form-lang]', form);
  if (langInput) langInput.value = root.lang;
  const errors = $('[data-form-errors]', form);
  const errorList = $('ul', errors);
  const done = $('[data-form-done]', form);
  const submit = $('[data-form-submit]', form);
  const fail = $('[data-form-fail]', form);
  const failServer = $('[data-form-fail-server]', form);
  const rules = {
    name: { field: form.elements.name, ok: () => form.elements.name.value.trim().length >= 2, error: 'f-name-err' },
    contact: { field: form.elements.contact, ok: () => contactOk(form.elements.contact.value), error: 'f-contact-err' },
  };
  const touched = new Set();
  const showError = (key, show) => {
    document.getElementById(rules[key].error).hidden = !show;
    if (show) rules[key].field.setAttribute('aria-invalid', 'true');
    else rules[key].field.removeAttribute('aria-invalid');
    if (!show) {
      errorList.querySelector(`li[data-key="${key}"]`)?.remove();
      if (!errors.hidden && !errorList.children.length) errors.hidden = true;
    }
  };
  for (const key of Object.keys(rules)) {
    const { field } = rules[key];
    field.addEventListener('blur', () => {
      if (field.value.trim()) touched.add(key);
      if (touched.has(key)) showError(key, !rules[key].ok());
    });
    field.addEventListener('input', () => { if (touched.has(key) && rules[key].ok()) showError(key, false); });
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = Object.keys(rules).filter((key) => !rules[key].ok());
    for (const key of Object.keys(rules)) {
      touched.add(key);
      showError(key, invalid.includes(key));
    }
    if (invalid.length) {
      errorList.replaceChildren(...invalid.map((key) => {
        const li = document.createElement('li');
        li.dataset.key = key;
        const a = document.createElement('a');
        a.href = `#${rules[key].field.id}`;
        a.textContent = document.getElementById(rules[key].error).textContent;
        a.addEventListener('click', (ev) => { ev.preventDefault(); rules[key].field.focus(); });
        li.append(a);
        return li;
      }));
      errors.hidden = false;
      errors.focus();
      return;
    }
    if (submit.disabled) return; // on its way already: a second tap doesn't send it twice
    errors.hidden = true;
    fail.hidden = true;
    failServer.hidden = true;
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    try {
      await sendLead(form, reducedMotion);
      form.classList.add('is-sent');
      done.hidden = false;
      done.focus();
    } catch (error) {
      console.warn('[form] the lead was not sent.', error);
      const message = error?.server ? failServer : fail;
      message.hidden = false;
      message.focus?.();
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });
}

/* ---------- 8 · questions: native <details>; an opened answer fades in (opacity and a few px only) ---------- */
function initFaq() {
  if (!motion) return;
  for (const item of $$('[data-faq] .faq__item')) {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      $('.faq__body', item).animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EASE });
    });
  }
}

/* ---------- case · hero · the film: muted, it loads after the page has, plays only while on screen (pauses
   off it, and once block 2 has slid over the pinned first screen), loops; without motion (reduced motion, ?og) its
   poster stays. The language's file and poster come from the dictionary (data-src, poster) ---------- */
function initFilm() {
  const video = $('[data-film] video');
  if (!video || !motion) return;
  let loaded = false;
  let inView = false;
  let covered = false;
  const update = () => {
    if (inView && !covered) {
      if (!loaded) {
        loaded = true;
        video.src = video.dataset.src;
      }
      video.play().catch(() => { /* autoplay refused: the poster stays */ });
    } else if (loaded) {
      video.pause();
    }
  };
  const io = new IntersectionObserver((entries) => {
    inView = entries[entries.length - 1].isIntersecting;
    update();
  }, { threshold: 0.2 });
  // the sheet over the first screen: once its top is in the screen's top third (or it has passed), the film is hidden
  const sheet = video.closest('.ai-hero')?.nextElementSibling;
  const cover = sheet && new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    covered = entry.isIntersecting || entry.boundingClientRect.bottom < 0;
    update();
  }, { rootMargin: '0px 0px -66% 0px' });
  const go = () => setTimeout(() => {
    io.observe(video);
    cover?.observe(sheet);
  }, 300);
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

/* ---------- phones: «Хочу такого робота» stays at hand once the first screen has passed, not at the form (nor in
   the AI page's calculator, which has its own button) ---------- */
function initSticky() {
  const bar = $('[data-sticky]');
  const hero = $('#top');
  if (!bar || !hero) return;
  const link = $('a', bar);
  const ends = [$('#calc'), $('#lead'), $('.footer')].filter(Boolean);
  // the first screen is gone once the block after it is well up the screen (on the AI page the first screen stays
  // pinned under that block, so the block is the one to watch)
  const after = hero.nextElementSibling || hero;
  let heroGone = false;
  const atEnd = new Set();
  const update = () => {
    const on = heroGone && !atEnd.size && phoneMQ.matches && !OG;
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    link.tabIndex = on ? 0 : -1;
  };
  new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    heroGone = after === hero ? !entry.isIntersecting : entry.isIntersecting || entry.boundingClientRect.top < 0;
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

/* ---------- AI page and case · 1 → 2 · the second block slides over the first (CSS: html.ai-stick, a first screen
   marked data-cover): it pins once its bottom reaches the screen's bottom, so its height goes to CSS (--hero-h), kept
   fresh on resize ---------- */
function initCover() {
  const hero = $('.ai-hero[data-cover]');
  if (!hero || OG || typeof ResizeObserver !== 'function') return;
  const set = () => root.style.setProperty('--hero-h', `${hero.offsetHeight}px`);
  set();
  new ResizeObserver(set).observe(hero);
  root.classList.add('ai-stick');
}

/* ---------- AI page · 1 · the main page's stone, live in 3D behind the title (js/ai-stone.js, three.js): loaded once
   the page has, so the first screen never waits for it; never with reduced motion, on a data saver or a slow line,
   or in ?og (the picture stays) ---------- */
function initStone() {
  const host = $('.ai-hero__rock');
  if (!host || !motion) return;
  // nor on a data saver or a slow line: three.js is ~200 KB to fetch and a heavy start on a weak phone
  const net = navigator.connection;
  if (net && (net.saveData || /(^|-)[23]g$/.test(net.effectiveType || ''))) return;
  const go = () => {
    import('/js/ai-stone.js')
      .then(({ initStone: start }) => start({ host, still: $('.ai-hero__stone', host), cover: host.closest('.ai-hero')?.nextElementSibling }))
      .catch((error) => console.warn('[stone] the live stone is not available; the picture stays.', error));
  };
  const later = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 200));
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
}

/* ==========================================================================
   Scenes
   ========================================================================== */

const scenes = [];
let current = null;
const queue = [];

function initScenes() {
  const defs = {
    todo: playTodo,
    path: playPath,
    time: playTime,
    'how-src': playHowSrc,
    'how-map': playHowMap,
    'how-check': playHowCheck,
    'how-send': playHowSend,
    decide: playDecide,
    tg: playTg,
    chat: playChat,
    sched: playSched,
    strip: playStrip,
    'svc-tg': playSvcTg,
    'svc-crm': playSvcCrm,
    'svc-mail': playSvcMail,
    'svc-flow': playSvcFlow,
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
      // passed already (a link, a restored scroll): its final frame
      scene.played = true;
      showReplay(scene);
    } else if (r.top > vh * 0.82) {
      // below: holds its start frame until it plays
      setPre(scene, true);
    } else {
      // on the screen now: it plays at once (its start frame comes in the same frame as the page)
      scene.inView = true;
      request(scene);
    }
  }
  root.classList.add('ai-go');
  // each scene starts once enough of it is in view: 12 %, or its own data-scene-start (a share, e.g. 0.4)
  for (const scene of scenes) {
    const start = Number(scene.el.dataset.sceneStart) || 0.12;
    new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      scene.inView = entry.isIntersecting;
      if (scene.inView) {
        if (entry.intersectionRatio >= start - 0.001 && !scene.played && !scene.playing) request(scene);
      } else {
        // off the screen: a scene still playing jumps to its end (frees the phone's one slot),
        // one waiting in line leaves it (it asks again when it comes back)
        if (scene.playing) finish(scene);
        const i = queue.indexOf(scene);
        if (i >= 0) queue.splice(i, 1);
      }
    }, { rootMargin: '0px 0px -18% 0px', threshold: [0, start] }).observe(scene.el);
  }
}

function setPre(scene, on) {
  scene.el.classList.toggle('is-pre', on);
  if (on) scene.el.classList.add('is-warm'); // its layers get ready while it waits (CSS); gone once it has played
}

function showReplay(scene) {
  scene.replay?.classList.add('is-on');
}

let lastStart = -1e9;
function request(scene, replay = false) {
  if (scene.playing) return;
  if (current && phoneMQ.matches) {
    if (!queue.includes(scene)) queue.push(scene);
    return;
  }
  // two scenes that come into view together (wide screens) don't start in the same frame
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
  // the start frame comes from the animations themselves now (fill: backwards): the hold can go
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
  // the next in line, if it is still on the screen — a few frames later, so a scene that has just jumped
  // to its end (it left the screen) and the next one's start never land in the same frame
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
    try { a.finish(); } catch { /* an animation that can't finish (infinite) is cancelled */ a.cancel?.(); }
  }
}

/** one animation, registered with its scene so it can be finished early */
function anim(scene, el, keyframes, options) {
  const a = el.animate(keyframes, { fill: 'backwards', easing: EASE, ...options });
  scene.anims.push(a);
  return a;
}

/* ---------- AI page · 1 · today's to-do list: three tasks get done by the program or the assistant, one at a
   time, each with who did it; then a pause, and the fourth is left to you ---------- */
const TODO = [450, 1200, 1950]; // rows 1–3

function playTodo(scene) {
  const rows = $$('.ai-todo__row', scene.el);
  rows.slice(0, 3).forEach((row, i) => {
    const t = TODO[i];
    anim(scene, $('.ai-todo__fill', row), [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: t });
    anim(scene, $('.ai-todo__who', row), [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 340, delay: t + 120 });
    anim(scene, $('.ai-todo__t', row), [{ opacity: 1 }, { opacity: 0.7 }], { duration: 420, delay: t + 140 });
  });
  const you = rows[3];
  if (!you) return;
  anim(scene, $('.ai-todo__fill', you), [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 2900 });
  anim(scene, $('.ai-todo__hl', you), [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 2960 });
  anim(scene, $('.ai-todo__who', you), [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 340, delay: 3060 });
}

/* ---------- AI page · 2 · one letter's way: each step lights up with its actor and its picture; the line runs on to
   the next step just before it ---------- */
const PATH = [200, 1250, 2450, 3550]; // each step's moment, ms

function playPath(scene) {
  const steps = $$('.ai-path__step', scene.el);
  const stand = pathMQ.matches;
  steps.forEach((step, i) => {
    const t = PATH[i];
    anim(scene, $('.ai-path__fill', step), [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: t });
    anim(scene, $('.ai-path__cap', step), [{ opacity: 0.35 }, { opacity: 1 }], { duration: 420, delay: t });
    const art = $('.ai-art', step);
    const from = art.classList.contains('ai-art--tg') ? -12 : 10;
    anim(scene, art, [{ opacity: 0, transform: `translateY(${from}px)` }, { opacity: 1, transform: 'none' }], { duration: 520, delay: t + 150 });
    const seg = $('.ai-path__seg b', step);
    if (seg && PATH[i + 1]) anim(scene, seg, [{ transform: stand ? 'scaleY(0)' : 'scaleX(0)' }, { transform: 'none' }], { duration: 420, delay: PATH[i + 1] - 330, easing: EASE_IO });
  });
  // 2 · the fields come out of the letter, the AI's marks run under them
  $$('.ai-art--found .ai-art__f', scene.el).forEach((f, k) => {
    anim(scene, f, [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: PATH[1] + 300 + k * 160 });
    anim(scene, $('.ai-art__mk', f), [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 360, delay: PATH[1] + 380 + k * 160 });
  });
  // 3 · the new row lands in the table
  const row = $('.ai-art__row--new', scene.el);
  if (row) {
    anim(scene, row, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: PATH[2] + 420 });
    anim(scene, $('.ai-art__bar', row), [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 300, delay: PATH[2] + 520 });
  }
}

/* ---------- 2 · the hour fills in, then the morning's 15 minutes shrink out of it ---------- */
function playTime(scene) {
  const [before, after] = $$('.ai-time__bar i', scene.el);
  const free = $('.ai-time__free', scene.el);
  anim(scene, before, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1000, delay: 150, easing: EASE_IO });
  anim(scene, after, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 1100 });
  anim(scene, after, [{ transform: 'scaleX(4)' }, { transform: 'scaleX(4)', offset: 0.2 }, { transform: 'scaleX(1)' }], { duration: 1500, delay: 1100, easing: EASE_IO });
  anim(scene, free, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 2450 });
}

/* ---------- case · 3 · the robot's four steps light up one after another (the film shows them; here they are words) ---------- */
/* ---------- case · 4 · the bento: each step's card plays its own short scene as it comes into view ---------- */
// 1 · the sources light up, the morning's ads land in a stack, the count comes in
function playHowSrc(scene) {
  const el = scene.el;
  $$('.ai-src__s', el).forEach((src, i) => anim(scene, src, [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 120 + i * 130 }));
  $$('.ai-src__ad', el).forEach((ad, i) => anim(scene, ad, [{ opacity: 0, transform: 'translateX(-36px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 520 + i * 260 }));
  anim(scene, $('.ai-src__count', el), [{ opacity: 0, transform: 'scale(0.8)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 1450 });
}

// 2 · the 100 km circle opens around Dresden: the pins inside stay, the far ones are crossed out, a repeat is struck through
function playHowMap(scene) {
  const el = scene.el;
  anim(scene, $('.ai-map__ring', el), [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay: 120 });
  anim(scene, $('.ai-map__km', el), [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 520 });
  $$('.ai-map__pin--in', el).forEach((pin, i) => anim(scene, pin, [{ opacity: 0, transform: 'scale(0.2)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 700 + i * 140 }));
  $$('.ai-map__pin--out', el).forEach((pin, i) => anim(scene, pin, [{ opacity: 0, transform: 'scale(0.5)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 1180 + i * 160 }));
  anim(scene, $('.ai-dup b', el), [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 1500 });
  anim(scene, $('.ai-dup__line', el), [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 420, delay: 1620, easing: EASE_IO });
}

// 3 · the foreman's questions get ticked one by one, then the sum and the score
function playHowCheck(scene) {
  const el = scene.el;
  $$('.ai-check__box b', el).forEach((tick, i) => anim(scene, tick, [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 300 + i * 430, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }));
  anim(scene, $('.ai-check__sum', el), [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 1650 });
  anim(scene, $('.ai-check__score', el), [{ opacity: 0, transform: 'scale(0.8)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 1850 });
}

// 4 · the message drops into Telegram, then its row lands in the table
function playHowSend(scene) {
  const el = scene.el;
  anim(scene, $('.ai-send__push', el), [{ opacity: 0, transform: 'translateY(-16px) scale(0.97)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 200 });
  anim(scene, $('.ai-send__row', el), [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 950 });
  anim(scene, $('.ai-send__bar', el), [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 320, delay: 1060 });
}

/* ---------- 4 · the verdicts: a stamp on each ad in turn; the one that passes opens the foreman's notes ---------- */
function stamp(scene, card, delay) {
  const yes = card.dataset.verdict === 'yes';
  const verdict = $('.ai-ad__verdict > span:last-child', card);
  anim(scene, $('.ai-stamp', card), [{ opacity: 0, transform: 'scale(1.9) rotate(-12deg)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay, easing: 'cubic-bezier(0.34, 1.5, 0.64, 1)' });
  anim(scene, verdict, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: delay + 120 });
  if (yes) anim(scene, $('.ai-ad__lit', card), [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: delay + 80 });
  else anim(scene, $('.ai-ad__t', card), [{ opacity: 1 }, { opacity: 0.55 }], { duration: 500, delay: delay + 150 });
}

function printPad(scene, delay) {
  $$('.ai-pad__lines li', scene.el).forEach((li, i) => {
    anim(scene, li, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: delay + i * 420 });
  });
}

function playDecide(scene) {
  $$('.ai-ad', scene.el).forEach((card, i) => stamp(scene, card, 250 + i * 900));
  printPad(scene, 250 + 3 * 900 + 600);
}

/* ---------- 5 · the message: the notification drops in, the message opens, the notes come one by one ---------- */
function playTg(scene) {
  const el = scene.el;
  anim(scene, $('.ai-phone__push', el), [
    { opacity: 0, transform: 'translateY(-24px)' },
    { opacity: 1, transform: 'none', offset: 0.22 },
    { opacity: 1, transform: 'none', offset: 0.78 },
    { opacity: 0, transform: 'translateY(-10px)' },
  ], { duration: 1700, delay: 200, fill: 'none' });
  anim(scene, $('.ai-msg', el), [{ opacity: 0, transform: 'translateY(14px) scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 1250 });
  anim(scene, $('.ai-msg__kb', el), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 1500 });
  // the numbered notes beside the message: wide screens only (up to 720 px the message reads by itself)
  if (noteMQ.matches) return;
  $$('.ai-row[data-note]', el).forEach((row, i) => {
    const t = 1900 + i * 300;
    anim(scene, $('.ai-row__n', row), [{ opacity: 0, transform: 'translateY(2px) scale(0.3)' }, { opacity: 1, transform: 'translateY(2px)' }], { duration: 360, delay: t, easing: 'cubic-bezier(0.34, 1.5, 0.64, 1)' });
    anim(scene, $('.ai-row__note', row), [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: t + 60 });
  });
}

/* ---------- assistant · 1 · the chat: the client writes, the assistant «types» and answers, one message at a time ---------- */
const TYPE = 760; // the assistant «types»
const READ_IN = 650; // a client's message is read
const READ_BOT = 900; // an answer is read

function playChat(scene) {
  let t = 250;
  for (const say of $$('.ai-say', scene.el)) {
    const typing = $('.ai-typing', say);
    if (typing) {
      anim(scene, typing, [
        { opacity: 0, transform: 'scale(0.9)' },
        { opacity: 1, transform: 'none', offset: 0.18 },
        { opacity: 1, transform: 'none', offset: 0.86 },
        { opacity: 0 },
      ], { duration: TYPE, delay: t, fill: 'none' });
      $$('i', typing).forEach((dot, k) => anim(scene, dot, [{ transform: 'none' }, { transform: 'translateY(-3px)', offset: 0.5 }, { transform: 'none' }], { duration: 420, delay: t + 100 + k * 110, fill: 'none', easing: 'ease-in-out' }));
      t += TYPE - 60;
    }
    anim(scene, $('.ai-bub', say), [{ opacity: 0, transform: 'translateY(8px) scale(0.94)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: t });
    t += typing ? READ_BOT : READ_IN;
  }
}

/* ---------- assistant · 2 · how the time is found: each step lights up with its moment in the schedule ----------
   1 · the client asks · 2 · the two free windows glow · 3 · she picks 14:30 (an ember frame) · 4 · the booking takes its place */
const FIND = [200, 1300, 2800, 3900]; // each step's moment, ms

function playSched(scene) {
  const el = scene.el;
  $$('.ai-howto__step', el).forEach((step, i) => {
    anim(scene, step, [{ opacity: 0.35 }, { opacity: 1 }], { duration: 420, delay: FIND[i] });
    anim(scene, $('.ai-howto__n', step), [{ transform: 'scale(0.6)' }, { transform: 'scale(1.15)', offset: 0.6 }, { transform: 'none' }], { duration: 420, delay: FIND[i], easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' });
  });
  $$('.ai-slot__glow', el).forEach((glow) => anim(scene, glow, [
    { opacity: 0 },
    { opacity: 1, offset: 0.15 },
    { opacity: 0.5, offset: 0.4 },
    { opacity: 1, offset: 0.6 },
    { opacity: 1, offset: 0.9 },
    { opacity: 0 },
  ], { duration: FIND[2] - FIND[1] + 300, delay: FIND[1], fill: 'none' }));
  anim(scene, $('.ai-slot__pick', el), [
    { opacity: 0, transform: 'scale(1.04)' },
    { opacity: 1, transform: 'none', offset: 0.3 },
    { opacity: 1, offset: 0.85 },
    { opacity: 0 },
  ], { duration: FIND[3] - FIND[2] + 500, delay: FIND[2], fill: 'none' });
  const slot = $('.ai-slot--new', el);
  anim(scene, $('.ai-slot--was', el), [{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: FIND[3] + 250 });
  anim(scene, slot, [{ opacity: 0, transform: 'translateY(-10px) scale(0.97)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: FIND[3] + 100, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)' });
  anim(scene, $('.ai-slot__ring', slot), [{ opacity: 0.9, transform: 'none' }, { opacity: 0, transform: 'scale(1.04, 1.15)' }], { duration: 900, delay: FIND[3] + 500, fill: 'none', easing: 'ease-out' });
}

/* ---------- assistant · 3 · the question handed over: one step after another; the 15 minutes run out, the reminder comes ---------- */
function playStrip(scene) {
  let t = 200;
  for (const step of $$('.ai-strip__step', scene.el)) {
    anim(scene, $('.ai-strip__when', step), [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: t });
    const card = $('.ai-strip__card', step);
    const timer = $('.ai-strip__timer i', step);
    if (timer) {
      // the card is there at once, its bar fills, then the reminder drops in
      anim(scene, card, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: t + 100 });
      anim(scene, timer, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 1100, delay: t + 300, easing: 'linear' });
      anim(scene, $('.ai-push', step), [{ opacity: 0, transform: 'translateY(-10px) scale(0.97)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: t + 1450 });
    } else {
      anim(scene, card, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: t + 100 });
    }
    t += 820;
  }
}

/* ---------- AI page · 3 · the service cards' scenes: short, one each, as the card comes into view ---------- */
function playSvcTg(scene) {
  const el = scene.el;
  anim(scene, $('.ai-mf__btn', el), [{ transform: 'none' }, { transform: 'scale(0.84)' }, { transform: 'none' }], { duration: 440, delay: 260, easing: EASE_IO });
  anim(scene, $('.ai-mp', el), [{ opacity: 0, transform: 'translateY(-16px) scale(0.96)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 640 });
  anim(scene, $('.ai-mp__dot', el), [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 1100 });
}

function playSvcCrm(scene) {
  const el = scene.el;
  anim(scene, $('.ai-mb--in', el), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 200 });
  anim(scene, $('.ai-mb--bot', el), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 900 });
  anim(scene, $('.ai-mc', el), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 440, delay: 1550 });
  anim(scene, $('.ai-mc i', el), [{ transform: 'scale(0.2)' }, { transform: 'none' }], { duration: 360, delay: 1650 });
}

function playSvcMail(scene) {
  const el = scene.el;
  anim(scene, $('.ai-mm', el), [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 180 });
  anim(scene, $('.ai-mt__row', el), [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 850 });
  anim(scene, $('.ai-mt__bar', el), [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 320, delay: 960 });
}

function playSvcFlow(scene) {
  const el = scene.el;
  $$('.ai-mfl__s:first-child .ai-mfl__n i', el).forEach((bar, k) => {
    anim(scene, bar, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 340, delay: 150 + k * 90 });
  });
  const steps = $$('.ai-mfl__s', el).slice(1);
  steps.forEach((step, i) => {
    const t0 = 560 + i * 650;
    anim(scene, $('.ai-mfl__seg b', step), [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 420, delay: t0, easing: EASE_IO });
    anim(scene, $('.ai-mfl__n', step), [{ opacity: 0.25, transform: 'scale(0.8)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: t0 + 330 });
    anim(scene, $('.ai-mfl__c', step), [{ opacity: 0.35 }, { opacity: 1 }], { duration: 420, delay: t0 + 330 });
  });
}

/* ---------- AI page · 3 · a card whose scene has played plays it again when the pointer comes in ---------- */
function initCards() {
  const cards = $$('[data-svc]');
  if (!motion || !cards.length || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  for (const card of cards) {
    const scene = scenes.find((sc) => card.contains(sc.el));
    card.addEventListener('pointerenter', () => {
      if (scene?.played && !scene.playing) request(scene, true);
    });
  }
}

/* ---------- AI page · 3 · «Детальніше»: the service's panel (a native modal <dialog>: focus stays inside, Esc and a
   tap outside close it). It rises in the middle on wide screens and slides up as a sheet on phones ---------- */
let setCalcPack = null;

function initDialogs() {
  const dialogs = $$('.ai-dlg');
  if (!dialogs.length || typeof HTMLDialogElement !== 'function') return;
  const sheet = () => phoneMQ.matches;
  const fx = new WeakMap();
  const openers = new WeakMap(); // focus goes back to the button that opened the panel (Safari never focuses it on a click)
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
    ].filter(Boolean));
  };
  const close = async (dlg, after) => {
    if (!dlg.open || dlg.dataset.closing) return;
    if (motion) {
      dlg.dataset.closing = '1'; // a second Esc or click while it slides out does nothing
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
  const go = (target, focus) => {
    target?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' });
    focus?.focus({ preventScroll: true });
  };

  for (const button of $$('[data-open]')) {
    const dlg = document.getElementById(button.dataset.open);
    if (dlg) button.addEventListener('click', () => open(dlg, button));
  }
  for (const dlg of dialogs) {
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(dlg); });
    // a tap on the backdrop: the click lands on the <dialog> itself, outside its panel
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(dlg); });
    for (const x of $$('[data-close]', dlg)) x.addEventListener('click', () => close(dlg));
    for (const link of $$('[data-close-go]', dlg)) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        close(dlg, () => go(document.querySelector(link.getAttribute('href'))));
      });
    }
    // «Обговорити»: to the form, with the service's quick pick on
    for (const talk of $$('[data-talk]', dlg)) {
      talk.addEventListener('click', (e) => {
        e.preventDefault();
        close(dlg, () => {
          const pick = $$('.ai-pick')[Number(talk.dataset.talk)];
          if (talk.dataset.talk !== '' && pick && pick.getAttribute('aria-pressed') !== 'true') pick.click();
          go($('#lead'), $('#f-name'));
        });
      });
    }
    // «Порахувати»: to the calculator, with this service chosen
    for (const count of $$('[data-calc-pick]', dlg)) {
      count.addEventListener('click', () => close(dlg, () => {
        setCalcPack?.(count.dataset.calcPick);
        go($('#calc'));
      }));
    }
  }
}

/* ---------- AI page · 5 · the calculator: the AI part of the main page's (one of its two request packages, or a task
   under your business, priced on request), more work priced on request, and the site (yours, or a landing). Prices and weeks come from the main page's
   /js/configurator/engine.js and strings.js (the same numbers as there), with the HTML's values as a fallback.
   «Надіслати розрахунок» puts the result into the form (fields package and details, as the main page's calculator
   does) and shows it there ---------- */
const WEEKS_FALLBACK = {
  uk: (a, b) => `≈ ${a === b ? a : `${a}–${b}`} ${b === 1 ? 'тиждень' : b < 5 ? 'тижні' : 'тижнів'}`,
  ru: (a, b) => `≈ ${a === b ? a : `${a}–${b}`} ${b === 1 ? 'неделя' : b < 5 ? 'недели' : 'недель'}`,
};

async function initCalc() {
  const form = $('[data-calc]');
  if (!form) return;
  form.addEventListener('submit', (e) => e.preventDefault());
  const [engine, allStrings] = await Promise.all([pricesReady, stringsReady]);
  const lang = root.lang === 'ru' ? 'ru' : 'uk';
  const strings = allStrings?.[lang];
  const price = { lead: 100, crmAi: 500, landing: 500 };
  try {
    price.lead = engine.PRICING.automation.lead.price;
    price.crmAi = engine.PRICING.automation.crmAi.price;
    price.landing = engine.PRICING.formats.landing.price;
  } catch { /* the fallback prices stay */ }
  const money = (n) => (typeof engine?.money === 'function' ? engine.money(n) : `$${n}`);
  const weeksText = (a, b) => (typeof strings?.weeks === 'function' ? strings.weeks(a, b) : WEEKS_FALLBACK[lang](a, b)).replace(/ /g, '\u00a0');
  const timeline = (pack, site) => {
    const format = site === 'landing' ? 'landing' : 'existing';
    try {
      if (typeof engine?.calculateTimeline === 'function') return engine.calculateTimeline({ ...engine.DEFAULT_CONFIG, format, automation: pack });
    } catch { /* below */ }
    if (format === 'existing') return { min: 1, max: pack === 'crmAi' ? 2 : 1 };
    return pack === 'crmAi' ? { min: 2, max: 3 } : { min: 1, max: 2 };
  };
  // the words: from the page itself where they are on it (already in the page's language), else the dictionary
  const text = (key, fallback) => document.querySelector(`[data-i18n="${key}"]`)?.textContent.trim() || t(key, fallback);
  const lower = (str) => str.charAt(0).toLocaleLowerCase(lang) + str.slice(1);
  const INC = { lead: ['ai.inc.lead', 4], crmAi: ['ai.inc.crm', 5], landing: ['ai.inc.site', 5] };
  const SITE_INC = ['Структура й тексти під вашу послугу', 'Дизайн для комп’ютера й телефона', 'Форма заявки та кнопки зв’язку', 'Підготовка до пошуку Google і статистика відвідувань', 'Запуск на вашому домені'];
  const items = (what) => {
    const [prefix, n] = INC[what];
    return Array.from({ length: n }, (_, i) => text(`${prefix}.${i + 1}`, what === 'landing' ? SITE_INC[i] : ''));
  };

  const out = {
    weeks: $('[data-calc-weeks]', form),
    name: $('[data-calc-name]', form),
    price: $('[data-calc-price]', form),
    once: $('[data-calc-once]', form),
    extra: $('[data-calc-extra]', form),
    inc: $('[data-calc-inc]', form),
    incBox: $('.ai-calc__inc', form),
    note: $('[data-calc-note]', form),
    live: $('[data-calc-live]', form),
    send: $('[data-calc-send]', form),
  };
  const lead = {
    pack: $('[data-calc-package]'),
    details: $('[data-calc-details]'),
    att: $('[data-calc-att]'),
    attText: $('[data-calc-att-text]'),
    attX: $('[data-calc-att-x]'),
  };

  const read = () => ({
    pack: form.elements['calc-pack'].value || 'lead',
    site: form.elements['calc-site'].value || 'existing',
    extras: $$('input[name="calc-x"]:checked', form).map((input) => input.nextElementSibling.textContent.trim()),
  });

  const compute = ({ pack, site, extras }) => {
    const custom = pack === 'custom';
    const packName = text({ lead: 'ai.do.1.t', crmAi: 'ai.do.2.t', custom: 'ai.calc.custom.t' }[pack] || 'ai.do.1.t', '');
    const siteName = t('ai.calc.site.name', 'Лендінг');
    const talk = t('ai.calc.talk', 'під запит');
    let sum = 0;
    const lines = [];
    if (custom) {
      lines.push(`${packName} — ${talk}`);
    } else {
      sum += price[pack];
      lines.push(`${packName} — ${money(price[pack])}`);
    }
    if (site === 'landing') {
      sum += price.landing;
      lines.push(`${siteName} — ${money(price.landing)}`);
    } else {
      lines.push(text('ai.calc.site.has', 'Сайт уже є'));
    }
    if (extras.length) lines.push(`${t('ai.calc.extra', '+ під запит:')} ${extras.join(', ')}`);
    const name = site === 'landing' ? `${packName} + ${lower(siteName)}` : packName;
    // what is priced on request: the task itself (when chosen) and the extras
    const onRequest = [...(custom ? [packName] : []), ...extras];
    const tl = sum > 0 ? timeline(custom ? 'none' : pack, site) : null;
    return { pack, site, extras, onRequest, sum, name, empty: !name, weeks: tl ? weeksText(tl.min, tl.max) : '', lines };
  };

  let last = '';
  const render = () => {
    const r = compute(read());
    for (const label of $$('.ai-opt, .ai-chk', form)) label.classList.toggle('is-on', $('input', label).checked);
    const priceText = r.empty ? '—' : r.sum > 0 ? money(r.sum) : t('ai.calc.talk', 'під запит');
    out.name.textContent = r.empty ? t('ai.calc.empty', 'Оберіть хоча б один пункт') : r.name;
    out.price.textContent = priceText;
    out.price.classList.toggle('is-talk', !r.empty && r.sum === 0);
    out.once.hidden = !(r.sum > 0);
    out.weeks.textContent = r.weeks;
    // with a price: «+ під запит: …» lists what is priced on request; without one (the task alone) the extras, if any
    const listed = r.sum > 0 ? r.onRequest : r.extras;
    out.extra.hidden = !listed.length;
    const list = listed.map(lower).join(', ');
    out.extra.textContent = r.sum > 0 ? `${t('ai.calc.extra', '+ під запит:')} ${list}` : `+ ${list}`;
    // what the price includes: the package's list and the landing's (the main page's lists)
    const groups = [];
    if (r.pack !== 'custom') groups.push([r.pack === 'lead' ? text('ai.do.1.t', '') : text('ai.do.2.t', ''), items(r.pack)]);
    if (r.site === 'landing') groups.push([t('ai.calc.site.name', 'Лендінг'), items('landing')]);
    out.inc.replaceChildren(...groups.map(([title, list]) => {
      const box = document.createElement('div');
      const h = document.createElement('p');
      h.className = 'ai-calc__inc-h';
      h.textContent = title;
      const ul = document.createElement('ul');
      ul.append(...list.map((line) => Object.assign(document.createElement('li'), { textContent: line })));
      box.append(h, ul);
      return box;
    }));
    out.incBox.hidden = !groups.length;
    const notes = [];
    if (r.pack === 'crmAi') notes.push(text('ai.inc.crm.note', ''));
    if (r.site === 'existing' && r.pack !== 'custom') notes.push(t('ai.calc.note.existing', ''));
    out.note.textContent = notes.filter(Boolean).join(' ');
    out.note.hidden = !out.note.textContent;
    out.send.disabled = r.empty;
    const key = `${r.name}|${priceText}|${r.weeks}`;
    if (key !== last) {
      if (last && motion) out.price.animate([{ opacity: 0.25, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EASE });
      out.live.textContent = last ? `${out.name.textContent}: ${priceText}${r.weeks ? `, ${r.weeks}` : ''}` : '';
      last = key;
    }
    return r;
  };

  form.addEventListener('change', render);
  // keyboard focus on a hidden input shows on its card
  for (const input of $$('input', form)) {
    const label = input.closest('label');
    input.addEventListener('focus', () => label.classList.toggle('is-focus', input.matches(':focus-visible')));
    input.addEventListener('blur', () => label.classList.remove('is-focus'));
  }
  setCalcPack = (pack) => {
    const input = $(`input[name="calc-pack"][value="${pack}"]`, form);
    if (input) input.checked = true;
    render();
  };
  render();

  out.send.addEventListener('click', () => {
    const r = render();
    if (r.empty) return;
    const summary = [r.name, r.sum > 0 ? `${money(r.sum)} ${t('ai.svc.once', 'разово')}` : t('ai.calc.talk', 'під запит'), r.weeks].filter(Boolean).join(' · ');
    if (lead.pack) lead.pack.value = summary;
    if (lead.details) lead.details.value = r.lines.join('\n');
    if (lead.att) {
      lead.attText.textContent = summary;
      lead.att.hidden = false;
    }
    $('#lead')?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' });
    $('#f-name')?.focus({ preventScroll: true });
  });
  lead.attX?.addEventListener('click', () => {
    lead.pack.value = '';
    lead.details.value = '';
    lead.att.hidden = true;
    $('#f-name')?.focus();
  });
}
