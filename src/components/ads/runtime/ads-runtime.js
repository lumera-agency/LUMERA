/*
 * «Реклама й аналітика»: the page's behaviour, as an island (React owns the markup, this module the choreography), built
 * on the AI pages' runtime (ai/runtime/ai-runtime.js: the same scene engine, reveals, sticky bar and cover). The main
 * page's own parts do the rest: the topbar, the menu, UA · RU, the FAQ, the form (sections/contact/lead-form.js) and the
 * footer's chrome wordmark.
 *
 * Motion rules (the owner's): every scene plays once as it comes into view, with WAAPI on transform and opacity only; on
 * phones one scene at a time (the next waits its turn), and a scene that leaves the screen jumps to its end; at rest
 * nothing runs (no rAF, no endless loops); with reduced motion the page shows every scene's final frame. The CSS default
 * of each scene IS its final frame: `.is-pre` holds a scene's start frame until it plays, and the animations use
 * fill: 'backwards', so nothing is left applied once they end. «↻ Ще раз» plays a scene again.
 *
 * Ported ideas (React Bits, reactbits.dev, MIT + Commons Clause; 21st.dev / Magic UI patterns), rebuilt here on WAAPI:
 * AnimatedList's spring pop (the first screen's requests), TextType (the Google query), Counter (the first screen's live
 * count, the report's rolling digits), Animated Beam (the request's way to the report).
 */
import { leadForm, goToForm as glideToForm } from '@/components/sections/contact/lead-form.js';
import { restorePlace, restoreScroll } from '@/lib/boot';

const root = document.documentElement;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = !reducedMotion && typeof Element.prototype.animate === 'function';
const phoneMQ = window.matchMedia('(max-width: 600px)');
const fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
/* The page's motion language (the motion designer's review, 20 Oct): four curves and five lengths (120 / 240 / 420 / 560 /
   700 ms). OUT brings things in, MOVE carries beams, lines, bars and shifts, EXIT takes things away, SPRING is kept for
   what has just arrived (a request, the ad, a chip, the people, «+1»); numbers never overshoot. */
const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const MOVE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const EXIT = 'cubic-bezier(0.4, 0, 1, 1)';
/** the reveals' curve: a long, soft landing (the owner asked for smoother motion, 20 Oct) */
const SOFT = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** React Bits AnimatedList's spring, as a linear() curve (a little overshoot, then rest); a plain curve where unsupported */
const SPRING = CSS.supports?.('transition-timing-function', 'linear(0, 1)')
  ? 'linear(0, 0.0603, 0.2033, 0.3821, 0.5633, 0.7258, 0.8584, 0.9574, 1.0242, 1.0634, 1.0809, 1.0828, 1.0747, 1.0613, 1.046, 1.0313, 1.0186, 1.0085, 1.0012, 0.9965, 0.994, 0.9931, 0.9933, 0.9941, 0.9953, 0.9966, 0.9978, 0.9988, 1)'
  : 'cubic-bezier(0.34, 1.4, 0.64, 1)';

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function startAds() {
  if (started) return;
  started = true;
  initPicks();
  initPlans();
  initFolds();
  initMore();
  initFaqMore();
  initCaseTabs();
  initCaseStack();
  initSticky();
  initCover();
  initScenes();
  initBlurText();
  initReveals();
  arrive();
}

/* ---------- every block's parts come in as they reach the screen: each rises a little and fades in on a long, soft
   curve, the ones arriving together one after another (the AI pages' reveal, kept quieter than the scenes so those read
   as the events). In a card the parts follow their frame in, one after another. A part already on the screen or passed
   stays as it is ---------- */
/** frames that hold a scene: they only fade in, so a mock never slides while its own story starts (the review, 20 Oct) */
const STILL = '.ad-card, .ad-kase, .ad-track';
const REVEAL = [
  'main.ad .ai-sec .s-head__meta', 'main.ad .ai-sec .s-head__intro',
  '.ad-card', '.ad-live__how', '.ad-live__foot', '.ad-path__foot', '.ad-first', '.ad-pc', '.ad-addons__h', '.ad-addon',
  '.ad-bundles', '.ad-price__note', '.ad-track', '.ad-kase', 'main.ad .faq', '.ad-next', '.ad-get',
  '.ad-terms__list',
  'main.ad .lead-form',
].join(', ');
/** a card's parts that follow it in (its scene, if it has one, keeps its own timing) */
const PARTS = [
  ['.ad-card', '.ad-card__body > *'],
  ['.ad-pc', ':scope > *'],
  ['.ad-get', ':scope > *'],
  ['.ad-terms__list', ':scope > li'],
];

function initReveals() {
  if (!motion) return;
  const items = $$(REVEAL).filter((el) => !el.closest('.ai-hero, dialog'));
  const waiting = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
  waiting.forEach((el) => el.classList.add('ai-rv'));
  let batch = [];
  let queued = 0;
  const flush = () => {
    queued = 0;
    const phone = phoneMQ.matches;
    batch.sort((x, y) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    batch.forEach((el, i) => {
      const delay = Math.min(i, 3) * 90;
      el.animate(
        el.matches(STILL) ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: `0 ${phone ? 16 : 24}px` }, { opacity: 1, translate: '0 0' }],
        { duration: phone ? 820 : 1000, delay, easing: SOFT, fill: 'backwards' },
      );
      const parts = PARTS.find(([host]) => el.matches(host));
      if (parts) {
        $$(parts[1], el).forEach((part, j) => part.animate(
          [{ opacity: 0, translate: `0 ${phone ? 10 : 14}px` }, { opacity: 1, translate: '0 0' }],
          { duration: phone ? 760 : 880, delay: delay + 140 + Math.min(j, 6) * 70, easing: SOFT, fill: 'backwards' },
        ));
      }
      el.classList.remove('ai-rv');
    });
    batch = [];
  };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      batch.push(entry.target);
    }
    if (batch.length && !queued) queued = requestAnimationFrame(flush);
  }, { rootMargin: '0px 0px -8% 0px' });
  waiting.forEach((el) => io.observe(el));
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest?.('.ai-rv');
    if (!el) return;
    io.unobserve(el);
    el.classList.remove('ai-rv');
  });
}

/* ---------- the pause's sentence comes in out of a blur, from a little above (React Bits' BlurText, effect «blur», by
   words), once, as soon as it comes up the screen. Smoothed on the owner's word (21 Oct: word by word it jerked): the words
   50 ms apart, so the sentence clears almost as one, on a long soft curve (1.1 s), 8 px of blur, a short drop. The
   words are wrapped here, so the heading stays one plain sentence for search and screen readers; without motion it simply
   stands. Done with the browser's own animations: the page adds no package for it ---------- */
const BLUR_STEP = 50;
function initBlurText() {
  if (!motion) return;
  for (const el of $$('.ad-pause__text')) {
    if (el.getBoundingClientRect().bottom < 0) continue;
    const words = [];
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === Node.ELEMENT_NODE) { walk(child); continue; }
        if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) continue;
        // a stop or a comma right after a word (the word may sit in the key-word mark) goes into that word's box, so the
        // line never breaks before it (the owner's iPhone, 21 Oct: «. Потім» opened a line); it keeps the sentence's colour
        const lead = child.textContent.match(/^[.,:;!?…»)]+/);
        const prev = words[words.length - 1];
        if (lead && prev) {
          const p = document.createElement('span');
          p.className = 'ad-bw-p';
          p.textContent = lead[0];
          prev.append(p);
          child.textContent = child.textContent.slice(lead[0].length);
        }
        const frag = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const w = document.createElement('span');
          w.className = 'ad-bw';
          w.textContent = part;
          frag.append(w);
          words.push(w);
        }
        child.replaceWith(frag);
      }
    };
    walk(el);
    el.classList.add('is-pre');
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      words.forEach((w, i) => w.animate([
        { opacity: 0, filter: 'blur(8px)', transform: 'translateY(-0.35em)' },
        { opacity: 1, filter: 'blur(0)', transform: 'none' },
      ], { duration: 1100, delay: i * BLUR_STEP, easing: SOFT, fill: 'backwards' }));
      el.classList.remove('is-pre');
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
  }
}

/* ---------- where the visitor lands: back where they were after a language switch or a reload, else at the #block ---------- */
function arrive() {
  if (restoreScroll() || restorePlace()) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
}

/* ---------- 8 · quick picks: a tap adds its words to «Що потрібно?», a second tap takes them out ---------- */
function initPicks() {
  const field = $('#f-note');
  const picks = $$('.ai-pick');
  if (!field || !picks.length) return;
  for (const pick of picks) {
    pick.addEventListener('click', () => {
      const on = pick.getAttribute('aria-pressed') !== 'true';
      pick.setAttribute('aria-pressed', String(on));
      const text = pick.textContent.trim();
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

/* ---------- 4 · a price card's «Обговорити»: the choice goes into the form's plan box (name · price, the items under
   it, sent with the request), then the page glides to the form ---------- */
function initPlans() {
  for (const link of $$('a[data-plan]')) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const details = link.dataset.details ? link.dataset.details.split('\n') : [];
      leadForm().setPlan(link.dataset.plan, details);
      goToForm(e.detail === 0);
    });
  }
}
/* ---------- 4 · phones: the setups' lists fold under «Що входить» (the recommended one stays open), so the three cards
   read as three prices; wider screens show every list (their «Що входить» line is hidden there, CSS) ---------- */
function initFolds() {
  const folds = $$('details[data-fold]');
  if (!folds.length) return;
  // phones fold them (one marked data-fold-open stays open: the first of the terms); wider screens open them all
  const set = () => folds.forEach((d) => { d.open = !phoneMQ.matches || d.hasAttribute('data-fold-open'); });
  set();
  phoneMQ.addEventListener('change', set);
  // a term opened on a phone: its sentence comes in softly (opacity and a few pixels, no height animation)
  for (const d of $$('.ad-terms__fold')) {
    d.addEventListener('toggle', () => {
      if (!d.open || !motion || !phoneMQ.matches) return;
      $('.ad-terms__p', d)?.animate([{ opacity: 0, translate: '0 -0.375rem' }, { opacity: 1, translate: '0 0' }], { duration: 380, easing: SOFT });
    });
  }
}

/* ---------- 4 · wider screens: the longest setup shows four items and «ще 2», so the three cards end level (the art
   director's review, 20 Oct); a tap shows the rest. Phones list them all (CSS) ---------- */
function initMore() {
  for (const btn of $$('[data-more]')) {
    const list = btn.previousElementSibling;
    if (!list) continue;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      list.classList.toggle('is-open', open);
      if (open) cascadeIn($$('.ad-pc__extra', list), 8);
    });
  }
}

/* ---------- 7 · phones: five questions, then «Ще 5 питань» shows the rest and the focus goes to the sixth ---------- */
function initFaqMore() {
  const btn = $('[data-faq-more]');
  const faq = $('#faq');
  if (!btn || !faq) return;
  btn.addEventListener('click', () => {
    faq.classList.add('is-all');
    btn.setAttribute('aria-expanded', 'true');
    cascadeIn($$('.faq__item--more', faq), 12);
    $('.faq__item--more summary', faq)?.focus({ preventScroll: true });
  });
}

/* ---------- 4 · the cases: a switcher between the clients' cases, and in each case its screenshots as tabs (arrow keys
   move between them); a screenshot opened by a tap on a phone rises and gets its rings ---------- */
function initCaseTabs() {
  const tablist = (tabs, choose) => tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => choose(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      choose(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
    });
  });
  for (const card of $$('.ad-kase')) {
    const tabs = $$('[data-case-tab]', card);
    tablist(tabs, (tab, focus = false) => {
      for (const t of tabs) {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const pic = $(`[data-case-pic="${t.dataset.caseTab}"]`, card);
        if (pic) pic.hidden = !on;
        if (pic && on && motion) pic.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: SOFT });
      }
      if (focus) tab.focus();
    });
    const shot = $('.ad-kase__shot', card);
    shot?.addEventListener('toggle', () => { if (shot.open && motion) caseShot(shot, 0, (el, k, o) => el.animate(k, { fill: 'backwards', easing: OUT, ...o })); });
  }
  const picks = $$('[data-case-pick]');
  const choosePick = (pick, focus = false) => {
    for (const p of picks) {
      const on = p === pick;
      p.setAttribute('aria-selected', String(on));
      p.tabIndex = on ? 0 : -1;
      const panel = $(`[data-case-panel="${p.dataset.casePick}"]`);
      if (panel) panel.hidden = !on;
      if (panel && on && motion) panel.animate([{ opacity: 0, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], { duration: 520, easing: SOFT });
    }
    // phones: the chosen tab comes to the middle of its row
    const row = pick.parentElement;
    if (row.scrollWidth > row.clientWidth) {
      const x = pick.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft - (row.clientWidth - pick.offsetWidth) / 2;
      row.scrollTo({ left: x, behavior: motion ? 'smooth' : 'instant' });
    }
    if (focus) pick.focus({ preventScroll: true });
  };
  tablist(picks, choosePick);
  pickCase = (id) => { const pick = picks.find((p) => p.dataset.casePick === id); if (pick) choosePick(pick); };
}

/** shows the details of the case the phones' stack has on top (set by initCaseTabs) */
let pickCase = () => {};

/* ---------- 4 · phones: the cases as a stack of short cards (React Bits «Stack»): a swipe or the arrows send the top
   card away (to the left, it tucks under the pile) or bring the bottom one back on top; the new top card's numbers roll
   up and the details below follow it ---------- */
function initCaseStack() {
  const stack = $('.ad-kstack');
  if (!stack) return;
  const order = $$('.ad-kstack__card', stack);
  const dots = $$('[data-case-dot]', stack);
  let busy = false;
  const place = () => order.forEach((card, i) => { card.dataset.pos = String(i); card.setAttribute('aria-hidden', String(i > 0)); });
  const sync = () => {
    const id = order[0].dataset.caseCard;
    dots.forEach((d) => d.classList.toggle('is-on', d.dataset.caseDot === id));
    pickCase(id);
  };
  const roll = (card) => {
    if (!motion) return;
    $$('.ad-count__strip', card).forEach((strip, j) => {
      const d = Number(strip.parentElement.style.getPropertyValue('--d')) || 0;
      strip.animate([{ transform: 'translateY(0%)' }, { transform: `translateY(${-d * 10}%)` }], { duration: 900 + j * 60, delay: 140, easing: SOFT, fill: 'backwards' });
    });
  };
  const go = (dir, from = '') => {
    if (busy) return;
    if (dir > 0) {
      // the top card flies off to the left, then slips in under the pile
      const top = order.shift();
      order.push(top);
      order.slice(0, -1).forEach((card, i) => { card.dataset.pos = String(i); });
      if (!motion) { top.style.transform = ''; place(); sync(); return; }
      busy = true;
      top.classList.add('is-thrown');
      const fly = top.animate([{ transform: from || 'none', opacity: 1 }, { transform: 'translateX(-115%) rotate(-9deg)', opacity: 0 }], { duration: 320, easing: EXIT, fill: 'forwards' });
      roll(order[0]);
      sync();
      fly.onfinish = () => {
        top.classList.remove('is-thrown');
        top.style.transform = '';
        place();
        fly.cancel();
        top.animate([{ offset: 0, transform: 'translateY(2.5rem) scale(0.85)', opacity: 0 }], { duration: 420, easing: SOFT });
        busy = false;
      };
    } else {
      // the bottom card comes back on top from the left
      const back = order.pop();
      order.unshift(back);
      order.forEach((card) => { card.style.transform = ''; });
      place();
      if (motion) {
        back.animate([{ offset: 0, transform: 'translateX(-115%) rotate(-9deg)', opacity: 0 }], { duration: 460, easing: SOFT });
        roll(back);
      }
      sync();
    }
  };
  $$('[data-kstack-go]', stack).forEach((btn) => btn.addEventListener('click', () => go(Number(btn.dataset.kstackGo))));
  // a swipe on the top card (the page keeps its vertical scroll: touch-action pan-y)
  let drag = null;
  stack.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.ad-kstack__card');
    if (!card || card !== order[0] || busy) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, card, on: false };
  });
  stack.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dx) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      drag.on = true;
      drag.card.classList.add('is-drag');
      try { drag.card.setPointerCapture(e.pointerId); } catch { /* a pointer the browser no longer tracks */ }
    }
    drag.dx = dx;
    drag.card.style.transform = `translateX(${dx}px) rotate(${(dx / 24).toFixed(2)}deg)`;
  });
  const end = () => {
    if (!drag) return;
    const { card, dx, on } = drag;
    drag = null;
    card.classList.remove('is-drag');
    if (!on) return;
    if (Math.abs(dx) > 70) { go(dx < 0 ? 1 : -1, card.style.transform); return; }
    const was = card.style.transform;
    card.style.transform = '';
    if (motion) card.animate([{ transform: was }, { transform: 'none' }], { duration: 380, easing: SOFT });
  };
  stack.addEventListener('pointerup', end);
  stack.addEventListener('pointercancel', end);
}

/** parts a tap has just shown: they rise into place one after another */
function cascadeIn(els, rise) {
  if (!motion) return;
  els.forEach((el, i) => el.animate([{ opacity: 0, translate: `0 ${rise}px` }, { opacity: 1, translate: '0 0' }], { duration: 640, delay: Math.min(i, 5) * 60, easing: SOFT, fill: 'backwards' }));
}

// the main page's glide to the form; from the keyboard (a click with no pointer: detail 0) the name field takes the
// focus on any screen, so the next key types the name; a tap on a phone never opens its keyboard
function goToForm(kb = false) {
  glideToForm(!motion);
  if (!kb || fineMQ.matches) return;
  const field = $('#f-name');
  let tries = 0;
  const focus = () => {
    field?.focus({ preventScroll: true });
    if (field && document.activeElement !== field && ++tries < 30) setTimeout(focus, 150);
  };
  setTimeout(focus, motion ? 400 : 0);
}

/* ---------- phones: the request button stays at hand once the first screen has passed, not at the form ---------- */
function initSticky() {
  const bar = $('[data-sticky]');
  const hero = $('#top');
  if (!bar || !hero) return;
  const link = $('a', bar);
  const ends = [$('#contact'), $('.footer')].filter(Boolean);
  // the first screen stays pinned under block 2, so block 2 is the one to watch
  const after = hero.nextElementSibling || hero;
  let heroGone = false;
  const atEnd = new Set();
  let was = null;
  const update = () => {
    const on = heroGone && !atEnd.size && phoneMQ.matches;
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    link.tabIndex = on ? 0 : -1;
    // the button back up (fx/back-to-top) steps aside over this bar; it checks on scroll, so tell it the bar has moved
    if (was !== null && was !== on) {
      const tell = () => window.dispatchEvent(new Event('scroll'));
      requestAnimationFrame(tell);
      setTimeout(tell, 600);
    }
    was = on;
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

/* ---------- 1 → 2 · block 2 slides over the first screen (ai.css: html.ai-stick, a first screen marked data-cover): it
   pins once its bottom reaches the screen's bottom, so its height goes to CSS (--hero-h), kept fresh on resize ---------- */
/** the first screen pins and block 2 slides over it on wider screens only; phones scroll it away as an ordinary block
 *  (the owner, 21 Oct: «на моб версії ефект наїзду не потрібен») */
function initCover() {
  const hero = $('.ai-hero[data-cover]');
  if (!hero || typeof ResizeObserver !== 'function') return;
  const set = () => root.style.setProperty('--hero-h', `${hero.offsetHeight}px`);
  set();
  new ResizeObserver(set).observe(hero);
  const apply = () => root.classList.toggle('ai-stick', !phoneMQ.matches);
  apply();
  phoneMQ.addEventListener('change', apply);
}

/* ---------- 5 · the steps' line: each dot lights as it reaches the middle of the screen and the line runs on to the
   next one (CSS transitions on transform and opacity, once each). Steps already passed are lit at once ---------- */
/* ==========================================================================
   Scenes
   ========================================================================== */

const scenes = [];
let current = null;
const queue = [];
/** the demos that play again each time they come back into view (their «↻ Ще раз» went in the owner's brief of 21 Oct):
 *  off the screen they go back to their first frame, so the start is never seen jumping */
const AGAIN = new Set(['hero', 'google', 'meta', 'live', 'path']);
/** the first screen goes round while it is in sight (the owner, 21 Oct: once played, it stood still): a pause, the
 *  requests fade, a new round comes in. Covered by the page, off the screen or in a hidden tab, it waits */
const LOOP = new Set(['hero']);
const LOOP_HOLD = 2600;

function initScenes() {
  const defs = { hero: playHero, google: playGoogle, meta: playMeta, live: playLive, path: playPath, case: playCase, kstack: playStack, how: playHow };
  for (const el of $$('[data-scene]')) {
    const play = defs[el.dataset.scene];
    if (!play) continue;
    const scene = { el, play, anims: [], playing: false, played: false, inView: false, ratio: 0, token: 0, again: AGAIN.has(el.dataset.scene), rerun: false, loop: LOOP.has(el.dataset.scene), covered: false, loopT: 0 };
    // phones: the part where the scene ends (data-gate) must be above the sticky bar before the scene starts
    scene.gate = el.dataset.gate ? $(el.dataset.gate, el) : null;
    scene.gateOk = !scene.gate;
    scenes.push(scene);
    scene.replay = $(`[data-replay~="${el.dataset.scene}"]`);
    scene.replay?.addEventListener('click', () => request(scene, true));
  }
  if (!motion) {
    root.classList.add('ad-go');
    scenes.forEach((s) => { s.played = true; });
    return;
  }
  const vh = window.innerHeight;
  for (const scene of scenes) {
    const r = scene.el.getBoundingClientRect();
    if (!scene.el.getClientRects().length) {
      // not shown at this width (block 3 has a scene for wide screens and one for phones): it waits, and plays if it shows
      setPre(scene, true);
    } else if (r.bottom < 0) {
      scene.played = true;
      showReplay(scene);
      rewind(scene);
    } else if (r.top > vh * 0.82) {
      setPre(scene, true);
    } else {
      scene.inView = true;
      setPre(scene, true);
      if (ready(scene)) request(scene);
    }
  }
  root.classList.add('ad-go');
  initLoops();
  // the layers for a scene's moving parts (.is-warm: will-change) come one screen ahead of it and leave once it has played
  const warm = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const scene = scenes.find((s) => s.el === entry.target);
      if (!scene || scene.playing) continue;
      scene.el.classList.toggle('is-warm', entry.isIntersecting && !scene.played);
    }
  }, { rootMargin: '100% 0px 100% 0px' });
  for (const scene of scenes) {
    warm.observe(scene.el);
    if (scene.gate) {
      new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        scene.gateOk = entry.isIntersecting || entry.boundingClientRect.top < 0;
        if (scene.inView && ready(scene) && !scene.played && !scene.playing) request(scene);
      }, { rootMargin: '0px 0px -28% 0px' }).observe(scene.gate);
    }
    const start = Number(scene.el.dataset.sceneStart) || 0.12;
    new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      scene.inView = entry.isIntersecting;
      scene.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
      maybeYield();
      if (scene.inView) {
        if (entry.intersectionRatio >= start - 0.001 && ready(scene) && !scene.played && !scene.playing) request(scene);
      } else {
        // off the screen: a scene still playing jumps to its end (frees the phone's one slot); one waiting leaves the line
        if (scene.playing) finish(scene);
        const i = queue.indexOf(scene);
        if (i >= 0) queue.splice(i, 1);
        rewind(scene);
      }
    }, { rootMargin: '0px 0px -18% 0px', threshold: [0, start, 0.3, 0.5] }).observe(scene.el);
  }
}

/** a scene may start: wider screens at once, phones once its last beat stands above the sticky bar (the review, 20 Oct:
 *  the way's report and the «+1» used to land under it) */
function ready(scene) {
  return scene.gateOk || !phoneMQ.matches;
}

/** phones (one scene at a time): when the scene waiting its turn is half on screen and the playing one is mostly off it,
 *  the playing one jumps to its end, so the reader never looks at a scene frozen on its start frame (the review, 20 Oct) */
function maybeYield() {
  if (!phoneMQ.matches || !current || !queue.length) return;
  if (current.ratio < 0.3 && queue.some((q) => q.ratio >= 0.5 && !q.played)) finish(current);
}

/** the looping scenes: the first block of the page covering the first screen (it pins on wide screens, so it never
 *  leaves the screen) counts as out of sight; a tab shown again picks the round up */
function initLoops() {
  const loops = scenes.filter((s) => s.loop);
  if (!loops.length) return;
  const cover = $('main.ad .ai-hero ~ *');
  if (cover) {
    new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1];
      const covered = e.isIntersecting || e.boundingClientRect.top < 0;
      loops.forEach((s) => { s.covered = covered; if (!covered) loopAgain(s, 600); });
    }, { rootMargin: '0px 0px -45% 0px' }).observe(cover);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loops.forEach((s) => loopAgain(s, 600)); });
}

/** one more round after a pause: the landed requests and the counts fade, the scene goes back to its first frame and
 *  plays again (only while it is in sight and done; otherwise the next chance picks it up) */
function loopAgain(scene, hold = LOOP_HOLD) {
  clearTimeout(scene.loopT);
  scene.loopT = setTimeout(async () => {
    if (!scene.inView || scene.covered || scene.playing || !scene.played || document.hidden) return;
    const parts = $$('.ad-inbox__row, .ad-fl__n', scene.el);
    const fades = parts.map((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: EXIT, fill: 'forwards' }));
    try { await Promise.all(fades.map((a) => a.finished)); } catch { /* cancelled */ }
    if (!scene.inView || scene.covered || scene.playing || document.hidden) { fades.forEach((a) => a.cancel()); return; }
    scene.played = false;
    scene.rerun = true;
    setPre(scene, true);
    fades.forEach((a) => a.cancel());
    request(scene);
  }, hold);
}

/** a scene that plays again, off the screen and done: back to its first frame, to play once more when it returns */
function rewind(scene) {
  if (!scene.again || scene.playing || !scene.played || scene.inView) return;
  scene.played = false;
  scene.rerun = true;
  setPre(scene, true);
}

function setPre(scene, on) {
  scene.el.classList.toggle('is-pre', on);
}

function showReplay(scene) {
  scene.replay?.classList.add('is-on');
}

let lastStart = -1e9;
function request(scene, replay = false) {
  if (scene.playing) return;
  // phones: one scene at a time, the next waits its turn (a replay asked for by a tap goes first)
  if (phoneMQ.matches && current && current !== scene) {
    if (replay) finish(current);
    else {
      if (!queue.includes(scene)) queue.push(scene);
      return;
    }
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
  scene.play(scene, replay || scene.rerun);
  scene.rerun = false;
  // the start frame comes from the animations themselves now (fill: backwards): the hold can go
  setPre(scene, false);
  try {
    await Promise.all(scene.anims.map((a) => a.finished));
  } catch { /* cancelled */ }
  if (token !== scene.token) return;
  scene.playing = false;
  scene.played = true;
  scene.el.classList.remove('is-warm');
  scene.anims = [];
  showReplay(scene);
  rewind(scene);
  if (scene.loop) loopAgain(scene);
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
  for (const a of scene.anims) {
    try { a.finish(); } catch { a.cancel?.(); }
  }
}

/** one animation, registered with its scene so it can be finished early */
function anim(scene, el, keyframes, options) {
  if (!el) return null;
  const a = el.animate(keyframes, { fill: 'backwards', easing: OUT, ...options });
  scene.anims.push(a);
  return a;
}
const show = (scene, el, delay, from = 'translateY(0.5rem)', duration = 420) =>
  anim(scene, el, [{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], { duration, delay });
/** something that has just arrived: it settles on the spring, its opacity comes on its own short curve (so it never
 *  flickers on the overshoot; the sites page's slideIn does the same) */
const pop = (scene, el, delay, duration = 560) => {
  anim(scene, el, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay });
  return anim(scene, el, [{ transform: 'translateY(0.75rem) scale(0.94)' }, { transform: 'none' }], { duration, delay, easing: SPRING });
};
/** a tap: a ring that grows and fades where the finger lands */
const tap = (scene, el, delay) =>
  anim(scene, el, [{ opacity: 0.9, transform: 'scale(0.3)' }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 560, delay, fill: 'none' });

/* ---------- 1 · the way of a request (the owner's redesign, 20 Oct; Magic UI's / 21st.dev's Animated Beam): four times
   (Google, Instagram, Facebook, Google) a light leaves the network, runs down its line, across, into «Ваш сайт», which
   answers, and on down into the list, where the request lands on top with its source (React Bits' AnimatedList: the
   earlier ones step down), and that network's count goes up. About 4 s ---------- */
const HERO_STEP = 820;
function playHero(scene, replay) {
  const rows = $$('.ad-inbox__row', scene.el); // newest first, as at rest
  const n = rows.length;
  // the first light leaves once the window has risen into place (its own CSS rise ends at about 1.1 s)
  const base = replay ? 200 : Math.max(250, 1000 - performance.now());
  const runs = $$('.ad-fl__bus .ad-fl__run', scene.el);
  const link = $('.ad-fl__link .ad-fl__run', scene.el);
  const hub = $('.ad-fl__hub', scene.el);
  const COL = { google: 0, insta: 1, fb: 2 };
  const SHIFT_X = ['33.333%', '0%', '-33.333%'];
  const BUS = 640;
  const LINK = 300;
  const glow = [{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.88 }, { opacity: 0 }];
  /** when the k-th request lands (the oldest first), and when each network's land */
  const times = [];
  const at = {};
  rows.slice().reverse().forEach((row, k) => {
    const t0 = base + k * HERO_STEP;
    const i = COL[row.dataset.src];
    const run = runs[i];
    anim(scene, run, [{ translate: '0 0' }, { translate: '0 50%', offset: 0.35 }, { translate: `${SHIFT_X[i]} 50%`, offset: 0.65 }, { translate: `${SHIFT_X[i]} 100%` }], { duration: BUS, delay: t0, easing: 'linear', fill: 'none' });
    anim(scene, $('b', run), glow, { duration: BUS, delay: t0, easing: 'linear', fill: 'none' });
    anim(scene, hub, [{ transform: 'none' }, { transform: 'scale(1.06)', offset: 0.4 }, { transform: 'none' }], { duration: 380, delay: t0 + BUS - 80, easing: MOVE, fill: 'none' });
    anim(scene, link, [{ translate: '0 0' }, { translate: '0 100%' }], { duration: LINK, delay: t0 + BUS + 120, easing: 'linear', fill: 'none' });
    anim(scene, $('b', link), glow, { duration: LINK, delay: t0 + BUS + 120, easing: 'linear', fill: 'none' });
    const land = t0 + BUS + 120 + LINK - 40;
    times.push(land);
    (at[row.dataset.src] ||= []).push(land);
  });
  const slot = rows.map((row) => row.offsetTop);
  const SHIFT = 400;
  rows.forEach((row, i) => {
    const turn = n - 1 - i; // the bottom row came first
    const t = times[turn];
    pop(scene, row, t);
    show(scene, $('.ad-inbox__src', row), t + 160, 'translateX(-0.375rem)', 420);
    anim(scene, $('.ad-inbox__tick', row), [{ transform: 'scale(0.3)' }, { transform: 'none' }], { duration: 420, delay: t + 180, easing: SPRING });
    if (!i) return;
    // it comes in at the top and steps down one place as each later one arrives (translate, apart from the pop's transform)
    const y = (arrived) => `0 ${slot[i - (n - arrived)] - slot[i]}px`;
    const end = times[n - 1] + SHIFT;
    const frames = [{ offset: 0, translate: y(turn + 1) }];
    for (let k = turn + 1; k < n; k++) {
      frames.push({ offset: times[k] / end, translate: y(k), easing: MOVE });
      frames.push({ offset: (times[k] + SHIFT) / end, translate: y(k + 1) });
    }
    anim(scene, row, frames, { duration: end, delay: 0, easing: 'linear' });
  });
  // each network's count stands at zero from the start and goes up as its requests land; its badge answers each time
  const STEP = 420;
  for (const li of $$('.ad-fl__src > li', scene.el)) {
    const strip = $('.ad-part__strip', li);
    const ts = (at[li.dataset.src] || []).sort((p, q) => p - q);
    const k = ts.length;
    if (!strip || !k) continue;
    const end = ts[k - 1] + STEP;
    const yy = (j) => `translateY(${((-j * 100) / (k + 1)).toFixed(3)}%)`;
    const frames = [{ offset: 0, transform: yy(0) }];
    ts.forEach((tt, j) => {
      frames.push({ offset: tt / end, transform: yy(j), easing: OUT });
      frames.push({ offset: j === k - 1 ? 1 : (tt + STEP) / end, transform: yy(j + 1) });
    });
    anim(scene, strip, frames, { duration: end, delay: 0, easing: 'linear' });
    ts.forEach((tt) => anim(scene, $('.ad-fl__n', li), [{ transform: 'none' }, { transform: 'scale(1.2)', offset: 0.35 }, { transform: 'none' }], { duration: 420, delay: tt - 60, easing: MOVE, fill: 'none' }));
  }
}

/* ---------- 2 · Google: the query types itself in letter by letter (React Bits TextType: an uneven pace, a caret that
   glides along, blinks once and goes as the results come), two ordinary results come up, our ad comes in on top of them
   and pushes them down, a tap on it, «+1 заявка». About 3.3 s ---------- */
function playGoogle(scene) {
  googleAt = performance.now();
  const chars = $$('.ad-type > i', scene.el);
  const caret = $('.ad-type__caret', scene.el);
  // the pace: 40–60 ms a letter, a little longer after a space (deterministic, so a replay types the same way)
  let t = 250;
  const times = chars.map((ch, i) => {
    t += ch.textContent === ' ' ? 90 : 40 + ((i * 37) % 21);
    return t;
  });
  chars.forEach((ch, i) => anim(scene, ch, [{ opacity: 0 }, { opacity: 1 }], { duration: 40, delay: times[i], easing: 'linear' }));
  const typed = times[times.length - 1] ?? 0;
  // the results come as the caret leaves the field
  const res = typed + 300;
  if (caret && chars.length) {
    // the caret stands after the last letter (CSS); while typing it sits after the one just shown
    const endX = caret.offsetLeft;
    const xs = [chars[0].offsetLeft, ...chars.map((ch) => ch.offsetLeft + ch.offsetWidth)];
    const frames = xs.map((x, i) => ({
      offset: i === 0 ? 0 : Math.min(1, times[i - 1] / res),
      transform: `translateX(${(x - endX).toFixed(1)}px)`,
      easing: 'steps(1, end)',
    }));
    frames.push({ offset: 1, transform: 'none' });
    anim(scene, caret, frames, { duration: res, delay: 0, easing: 'linear', fill: 'none' });
    // shown while typing, one blink after, then gone (at rest the field is left: no caret)
    anim(scene, caret, [
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: (typed + 100) / res },
      { opacity: 0, offset: (typed + 160) / res },
      { opacity: 1, offset: (typed + 230) / res },
      { opacity: 0, offset: 1 },
    ], { duration: res, easing: 'linear', fill: 'none' });
  }
  const ad = $('.ad-serp__ad', scene.el);
  const list = $('.ad-serp__res', scene.el);
  // the ordinary results first stand where the ad will be, then slide down by its height as it comes in
  const shift = ad && list ? ad.offsetHeight + (parseFloat(getComputedStyle(list).rowGap) || 0) : 0;
  const adAt = res + 450;
  $$('.ad-serp__org', scene.el).forEach((org, i) => {
    anim(scene, org, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: res + i * 80 });
    anim(scene, org, [{ transform: `translateY(${-shift}px)` }, { transform: 'none' }], { duration: 480, delay: adAt + i * 40, easing: MOVE });
  });
  anim(scene, ad, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: adAt + 60 });
  anim(scene, ad, [{ transform: 'translateY(-0.5rem) scale(0.97)' }, { transform: 'none' }], { duration: 560, delay: adAt + 60, easing: SPRING });
  const press = adAt + 760;
  finger(scene, $('.ad-serp__ad .ad-tap', scene.el), press);
  tap(scene, $('.ad-serp__ad .ad-tap', scene.el), press);
  pop(scene, $('.ad-toast', scene.el), press + 250);
}

/** where an element's middle stands inside the scene, from the layout (not from the transforms the scene is about to play) */
function spot(el, root) {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  for (let n = el; n && n !== root; n = n.offsetParent) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y };
}
/** the person's finger (ember): it glides in from below to `target`, presses at `at`, lifts and goes (transient) */
function finger(scene, target, at) {
  const f = $('.ad-finger', scene.el);
  if (!f || !target) return;
  const to = spot(target, scene.el);
  const from = { x: scene.el.offsetWidth * 0.82, y: scene.el.offsetHeight + 16 };
  const p = (q, s = 1) => `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) scale(${s})`;
  const GLIDE = 420, D = GLIDE + 120 + 120 + 240;
  anim(scene, f, [
    { offset: 0, opacity: 0, transform: p(from), easing: MOVE },
    { offset: 0.15, opacity: 1 },
    { offset: GLIDE / D, transform: p(to) },
    { offset: (GLIDE + 120) / D, transform: p(to, 0.85) },
    { offset: (GLIDE + 240) / D, opacity: 1, transform: p(to), easing: EXIT },
    { offset: 1, opacity: 0, transform: p(to) },
  ], { duration: D, delay: at - GLIDE, easing: 'linear', fill: 'none' });
}

/** wide screens: the two ad cards play as a pair, Google first and Facebook / Instagram 1.6 s after it, so their «+1»
 *  never land together (the review, 20 Oct: they did, 0.2 s apart, when the second scene happened to start first) */
const PAIR = 1600;
let googleAt = -1e9;
const onScreen = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };

/* ---------- 2 · Facebook / Instagram: the people of a city; each audience chip that lands leaves some of them out (the
   city, then the age) in a wave that starts at the chip, the third lights the three who fit and the ad reaches them
   (beams after Magic UI's Animated Beam, the same motif as the way of a request), the ad comes in from their side, the
   finger taps it, «+1 заявка». About 3.4 s ---------- */
function playMeta(scene, replay) {
  let lag = 0;
  if (!replay && !phoneMQ.matches) {
    const google = scenes.find((s) => s.el.dataset.scene === 'google');
    if (google && !google.played && !google.playing && onScreen(google.el)) start(google, false);
    if (google?.playing) lag = Math.max(0, googleAt + PAIR - performance.now());
  }
  const d = (ms) => ms + lag;
  const dots = $$('.ad-crowd__dot', scene.el);
  const chips = $$('.ad-aud__chips li', scene.el);
  show(scene, $('.ad-aud__k', scene.el), d(100), 'translateY(0.25rem)', 420);
  const CHIP = 450;
  chips.forEach((chip, i) => pop(scene, chip, d(250 + i * CHIP)));
  // chip 1 (the city) and chip 2 (the age): those outside dim and shrink in a wave that starts at the chip
  const WAVE = 320;
  [1, 2].forEach((k, i) => {
    const from = spot(chips[i] || scene.el, scene.el);
    const left = dots.filter((dot) => dot.dataset.k === String(k));
    const far = left.map((dot) => { const q = spot(dot, scene.el); return Math.hypot(q.x - from.x, q.y - from.y); });
    const max = Math.max(1, ...far);
    left.forEach((dot, j) =>
      anim(scene, dot, [{ opacity: 0.55, transform: 'none' }, { opacity: 0.14, transform: 'scale(0.7)' }], { duration: 420, delay: d(400 + i * CHIP) + (far[j] / max) * WAVE }));
  });
  // chip 3 (the interests): the three who fit light up, and the ad reaches them: a beam from each passes and fades
  const lit = d(400 + 2 * CHIP);
  const fit = dots.filter((dot) => dot.classList.contains('is-fit'));
  fit.forEach((dot, j) => {
    anim(scene, dot, [{ opacity: 0.55 }, { opacity: 1 }], { duration: 240, delay: lit + j * 110, easing: 'linear' });
    anim(scene, $('b', dot), [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1.35)', offset: 0.45 }, { opacity: 1, transform: 'none' }], { duration: 560, delay: lit + j * 110 });
  });
  const postEl = $('.ad-post', scene.el);
  const post = lit + 520;
  if (postEl) {
    const edge = spot(postEl, scene.el);
    edge.x -= postEl.offsetWidth / 2;
    $$('.ad-beam', scene.el).forEach((beam, j) => {
      const dot = fit[j];
      if (!dot) return;
      const q = spot(dot, scene.el);
      const len = Math.hypot(edge.x - q.x, edge.y - q.y);
      const turn = Math.atan2(edge.y - q.y, edge.x - q.x);
      const at = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) rotate(${turn.toFixed(4)}rad)`;
      anim(scene, beam, [
        { opacity: 0, transform: `${at} scaleX(0)`, easing: MOVE },
        { opacity: 1, transform: `${at} scaleX(${len.toFixed(1)})`, offset: 0.45 },
        { opacity: 0, transform: `${at} scaleX(${len.toFixed(1)})` },
      ], { duration: 800, delay: lit + 260 + j * 90, easing: 'linear', fill: 'none' });
    });
  }
  // the ad comes in from the people's side
  anim(scene, postEl, [{ opacity: 0, transform: 'translateX(-1.5rem)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: post });
  const press = post + 680;
  finger(scene, $('.ad-post__cta .ad-tap', scene.el), press);
  tap(scene, $('.ad-post__cta .ad-tap', scene.el), press);
  pop(scene, $('.ad-toast', scene.el), press + 250);
}

/* ---------- 3 · wide screens, the live report (Magic UI's / React Bits' Animated List, React Bits' Counter): the sheet
   rises; five requests come in, the oldest first, each at the top of the list while the earlier ones slide down; with
   each, its source's total ticks up by one and an ember «+1» passes (Google 12 → 15, Facebook 3 → 4, Instagram 5 → 6).
   About 3.4 s ---------- */
function playLive(scene, replay) {
  anim(scene, scene.el, [{ opacity: 0, transform: 'translateY(1.25rem)' }, { opacity: 1, transform: 'none' }], { duration: 700 });
  const rows = $$('.ad-live__row', scene.el);
  const n = rows.length;
  if (!n) return;
  const h = rows[0].offsetHeight;
  const T0 = replay ? 450 : 650, GAP = 560, IN = 420;
  const D = T0 + GAP * (n - 1) + IN + 40;
  const at = (t) => Math.min(1, Math.max(0, t / D));
  const y = (v) => `translateY(${(v * h).toFixed(1)}px)`;
  rows.forEach((row, i) => {
    const k = n - 1 - i; // the bottom row came first
    const T = T0 + k * GAP;
    const frames = [
      { offset: 0, opacity: 0, transform: `${y(-i)} scale(0.94)` },
      { offset: at(T), opacity: 0, transform: `${y(-i)} scale(0.94)`, easing: SPRING },
      { offset: at(T + IN), opacity: 1, transform: y(-i) },
    ];
    for (let j = 1; j <= i; j++) {
      const Tj = T0 + (k + j) * GAP;
      frames.push({ offset: at(Tj), opacity: 1, transform: y(-(i - j + 1)), easing: OUT });
      frames.push({ offset: at(Tj + IN), opacity: 1, transform: y(-(i - j)) });
    }
    if (frames[frames.length - 1].offset < 1) frames.push({ offset: 1, opacity: 1, transform: 'none' });
    anim(scene, row, frames, { duration: D, easing: 'linear' });
  });
  // the totals: which source each arrival adds to
  const came = [...rows].reverse().map((row) => $('.ad-live__src', row)?.dataset.src);
  for (const tot of $$('.ad-live__t', scene.el)) {
    const from = Number(tot.dataset.from);
    const last = Number($('.visually-hidden', tot)?.textContent) || from;
    const times = [];
    came.forEach((src, k) => { if (src === tot.dataset.src) times.push(T0 + k * GAP + 120); });
    if (!times.length) continue;
    const count = (m) => from + m;
    const digit = (m) => `translateY(${-(count(m) % 10) * 10}%)`;
    const share = (m) => `scaleX(${(count(m) / last).toFixed(4)})`;
    const dk = [{ offset: 0, transform: digit(0) }];
    const bk = [{ offset: 0, transform: share(0) }];
    times.forEach((t, m) => {
      dk.push({ offset: at(t), transform: digit(m), easing: OUT });
      dk.push({ offset: at(t + 460), transform: digit(m + 1) });
      bk.push({ offset: at(t), transform: share(m), easing: OUT });
      bk.push({ offset: at(t + 460), transform: share(m + 1) });
      anim(scene, $('.ad-live__plus', tot), [
        { opacity: 0, transform: 'translateY(0.375rem)' },
        { opacity: 1, transform: 'none', offset: 0.2 },
        { opacity: 1, transform: 'none', offset: 0.7 },
        { opacity: 0, transform: 'translateY(-0.375rem)' },
      ], { duration: 900, delay: t, fill: 'none' });
    });
    if (dk[dk.length - 1].offset < 1) {
      dk.push({ offset: 1, transform: dk[dk.length - 1].transform });
      bk.push({ offset: 1, transform: 'none' });
    }
    anim(scene, $('.ad-count__d[data-last] .ad-count__strip', tot), dk, { duration: D, easing: 'linear' });
    anim(scene, $('.ad-live__tb i', tot), bk, { duration: D, easing: 'linear' });
  }
}

/* ---------- 3 · phones and narrow tablets, one request's way on a rail (Aceternity's Tracing Beam, Magic UI's Animated
   Beam): the stills come in; the label drops onto the ad and rides the link (the rail lights) to the site's address; the
   form is filled and sent (an ember tap); «Записано»; «+1 заявка» runs on to the report; Google 14 → 15, its bar
   reaches the end; the formula line. About 4.4 s ---------- */
function playPath(scene) {
  const flow = $('.ad-path__flow', scene.el);
  if (!flow) return;
  /** an element's box inside the way, from the layout (not from the transforms about to play) */
  const box = (el) => {
    let x = 0;
    let y = 0;
    for (let n = el; n && n !== flow; n = n.offsetParent) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };
  const tr = (p, extra = '') => `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)${extra}`;
  const up = [{ opacity: 0, transform: 'translateY(1rem)' }, { opacity: 1, transform: 'none' }];
  $$('.ad-path__frame', scene.el).forEach((f, i) => {
    anim(scene, $('.ad-path__shot', f), up, { duration: 640, delay: i * 90 });
    anim(scene, $('.ad-path__cap', f), [{ opacity: 0 }, { opacity: 1 }], { duration: 520, delay: 160 + i * 90 });
  });
  // 1 · the label drops onto the ad
  const tag1 = $('.ad-path__tag[data-slot="1"]', scene.el);
  const tag2 = $('.ad-path__tag[data-slot="2"]', scene.el);
  anim(scene, tag1, [{ opacity: 0, transform: 'translateY(-0.875rem) rotate(-9deg)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 480, easing: SPRING });
  // 2 · it rides the link to the site
  const T1 = 1080, D1 = 760;
  const rails = $$('.ad-path__seg i', scene.el);
  if (tag1 && tag2) {
    const a = box(tag1), b = box(tag2);
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    anim(scene, $('.ad-path__run--tag', scene.el), [
      { offset: 0, opacity: 0, transform: tr(a) },
      { offset: 0.08, opacity: 1, transform: tr(a, ' scale(1.06)') },
      { offset: 0.5, opacity: 1, transform: tr(mid, ' scale(1.06)') },
      { offset: 0.94, opacity: 1, transform: tr(b) },
      { offset: 1, opacity: 0, transform: tr(b) },
    ], { duration: D1, delay: T1, easing: MOVE, fill: 'none' });
  }
  anim(scene, rails[0], [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: D1 * 0.9, delay: T1 + 40, easing: MOVE });
  anim(scene, tag2, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: T1 + D1 - 60, easing: 'linear' });
  // 3 · the form is filled and sent
  const T2 = T1 + D1 + 80;
  anim(scene, $('.ad-path__fv', scene.el), [{ opacity: 0, transform: 'translateX(-0.375rem)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: T2 });
  tap(scene, $('.ad-path__tap', scene.el), T2 + 460);
  anim(scene, $('.ad-path__send', scene.el), [{ transform: 'none' }, { transform: 'scale(0.94)', offset: 0.4 }, { transform: 'none' }], { duration: 300, delay: T2 + 460, fill: 'none' });
  const rec = $('.ad-path__rec', scene.el);
  anim(scene, rec, [{ opacity: 0, transform: 'translateY(0.5rem)' }, { opacity: 1, transform: 'none' }], { duration: 460, delay: T2 + 700 });
  anim(scene, $('.ad-path__tick', scene.el), [{ transform: 'scale(0.3)' }, { transform: 'none' }], { duration: 480, delay: T2 + 800, easing: SPRING });
  // 4 · «+1 заявка» runs on to the report
  const T3 = T2 + 1150, D3 = 760;
  const hit = $('.ad-path__run--hit', scene.el);
  const row = $('.ad-path__row[data-src="google"]', scene.el);
  if (rec && hit && row) {
    const r = box(rec), g = box(row);
    const from = { x: r.x + 8, y: r.y + r.h / 2 - hit.offsetHeight / 2 };
    const to = { x: g.x + g.w * 0.42 - hit.offsetWidth / 2, y: g.y + g.h / 2 - hit.offsetHeight / 2 };
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    anim(scene, hit, [
      { offset: 0, opacity: 0, transform: tr(from, ' scale(0.7)') },
      { offset: 0.12, opacity: 1, transform: tr(from) },
      { offset: 0.55, opacity: 1, transform: tr(mid) },
      { offset: 0.88, opacity: 1, transform: tr(to) },
      { offset: 1, opacity: 0, transform: tr(to, ' scale(0.6)') },
    ], { duration: D3, delay: T3, easing: MOVE, fill: 'none' });
  }
  anim(scene, rails[1], [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: D3 * 0.8, delay: T3 + 60, easing: MOVE });
  // 5 · Google 14 → 15
  const T4 = T3 + D3 - 80;
  anim(scene, $('.ad-path__flash', scene.el), [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 1100, delay: T4, easing: 'linear', fill: 'none' });
  anim(scene, $('.ad-path__row[data-src="google"] .ad-count__d[data-last] .ad-count__strip', scene.el), [{ transform: 'translateY(-40%)' }, { transform: 'translateY(-50%)' }], { duration: 520, delay: T4 + 60 });
  anim(scene, $('.ad-path__row[data-src="google"] .ad-path__bar i', scene.el), [{ transform: 'scaleX(0.9333)' }, { transform: 'none' }], { duration: 520, delay: T4 + 60 });
  anim(scene, $('.ad-path__cpl', scene.el), [{ opacity: 0 }, { opacity: 1 }], { duration: 480, delay: T4 + 380 });
}

/* ---------- 4 · the case: the four tiles rise one after another and their digits roll up from 0 (React Bits Counter),
   the one segment of four fills; where the screenshot stands open beside them, it rises and gets its two rings. The
   numbers land on the account's own. About 1.8 s ---------- */
function playCase(scene) {
  const tiles = $$('.ad-kase__m', scene.el);
  tiles.forEach((tile, i) => {
    show(scene, tile, 80 + i * 110, 'translateY(0.75rem)', 560);
    $$('.ad-count__strip', tile).forEach((strip, j) => {
      const d = Number(strip.parentElement.style.getPropertyValue('--d')) || 0;
      anim(scene, strip, [{ transform: 'translateY(0%)' }, { transform: `translateY(${-d * 10}%)` }], { duration: 1100 + j * 80, delay: 220 + i * 110, easing: SOFT });
    });
  });
  anim(scene, $('.ad-kase__seg i', scene.el), [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 700, delay: 900, easing: MOVE });
  const shot = $('.ad-kase__shot', scene.el);
  if (shot?.open) caseShot(shot, 300, (el, k, o) => anim(scene, el, k, o));
}
/** the account's window rises, then its two key cells get their rings */
function caseShot(shot, at, run) {
  run($('.ad-case__win', shot), [{ opacity: 0, transform: 'translateY(1rem)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: at });
  $$('.ad-case__ring', shot).forEach((ring, i) => {
    run(ring, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: at + 600 + i * 160 });
    run(ring, [{ transform: 'scale(1.12)' }, { transform: 'none' }], { duration: 560, delay: at + 600 + i * 160, easing: SPRING });
  });
}

/* ---------- 4 · phones: the stack deals itself in (the cards land on the pile one by one), the top card's numbers roll
   up, then it leans to the left once and back, so the next case shows its edge. About 2.4 s ---------- */
function playStack(scene) {
  const cards = $$('.ad-kstack__card', scene.el).sort((a, b) => Number(a.dataset.pos) - Number(b.dataset.pos));
  cards.slice().reverse().forEach((card, i) =>
    anim(scene, card, [{ offset: 0, opacity: 0, transform: 'translateY(2.5rem) scale(0.9) rotate(-4deg)' }], { duration: 640, delay: 80 + i * 140, easing: SOFT }));
  const top = cards[0];
  $$('.ad-count__strip', top).forEach((strip, j) => {
    const d = Number(strip.parentElement.style.getPropertyValue('--d')) || 0;
    anim(scene, strip, [{ transform: 'translateY(0%)' }, { transform: `translateY(${-d * 10}%)` }], { duration: 1000 + j * 60, delay: 560, easing: SOFT });
  });
  anim(scene, $('.ad-kstack__nav', scene.el), [{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: 640 });
  anim(scene, top, [{ transform: 'none' }, { transform: 'translateX(-1.75rem) rotate(-2deg)', offset: 0.45 }, { transform: 'none' }], { duration: 900, delay: 1500, easing: MOVE, fill: 'none' });
}

/* ---------- 6 · how we work, picture by picture: the voices of the call rise and settle, the queries come in (the useless
   one in ember), the form fills and the test request gets its tick, the ad's switch flips on, the report's bars grow.
   About 2.8 s ---------- */
function playHow(scene) {
  const [call, kw, rec, live, rep] = $$('.ad-track__step', scene.el);
  const at = (i) => 120 + i * 480;
  $$('.ad-sp__wave b', call).forEach((b, j) =>
    anim(scene, b, [{ transform: 'scaleY(0.2)' }, { transform: 'scaleY(1.3)', offset: 0.55 }, { transform: 'none' }], { duration: 720, delay: at(0) + j * 70, easing: MOVE }));
  $$('.ad-sp__chips b', kw).forEach((b, j) => {
    anim(scene, b, [{ opacity: 0 }, { opacity: 1 }], { duration: 220, delay: at(1) + j * 140 });
    anim(scene, b, [{ transform: 'scale(0.5)' }, { transform: 'none' }], { duration: 520, delay: at(1) + j * 140, easing: SPRING });
  });
  $$('.ad-sp__form b', rec).forEach((b, j) => anim(scene, b, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 380, delay: at(2) + j * 120 }));
  anim(scene, $('.ad-sp__ok', rec), [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: at(2) + 360, easing: SPRING });
  anim(scene, $('.ad-sp__knob', live), [{ transform: 'translateX(0)' }, { transform: 'translateX(1.1em)' }], { duration: 600, delay: at(3) + 80, easing: SPRING });
  anim(scene, $('.ad-sp__off', live), [{ opacity: 1 }, { opacity: 0 }], { duration: 360, delay: at(3) + 160 });
  $$('.ad-sp--rep b', rep).forEach((b, j) => anim(scene, b, [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 720, delay: at(4) + j * 110, easing: SPRING }));
}
