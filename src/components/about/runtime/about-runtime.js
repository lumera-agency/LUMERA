/*
 * «Про нас»'s behaviour, an island as on the sibling pages (React owns the markup, this module the motion): the parts
 * coming in as they reach the screen, variant A's tilt, the phones' sticky request bar, and where the visitor lands.
 * The section heads and the [data-sr] blocks are the main page's own reveals (PageShell → ScrollReveals).
 *
 * Ported ideas (React Bits, reactbits.dev, MIT + Commons Clause), rebuilt here on CSS transitions: Animated Content (a
 * part rises in once), Tilted Card (the card leans toward the pointer), Bounce Cards (variant C: the fan, CSS only).
 *
 * Motion rules (the owner's): transform and opacity only, once each, nothing runs at rest; with reduced motion the page
 * shows every part's final frame. The CSS default of each part IS its final frame: `.is-pre` holds its start until it
 * plays (set only on what is still below the screen, so nothing visible ever blinks).
 */
import { restorePlace, restoreScroll } from '@/lib/boot';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const phoneMQ = window.matchMedia('(max-width: 600px)');
const fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function startAbout() {
  if (started) return;
  started = true;
  initIn();
  initTilt();
  initSticky();
  arrive();
}

/* ---------- [data-in]: a part still below the screen waits (.is-pre: each variant's own start frame in about.css) and
   comes in once as it reaches the screen; the ones arriving together one after another (--d). A part on the screen or
   passed stays as it is; a keyboard focus inside a waiting part shows it at once ---------- */
function initIn() {
  if (!motion) return;
  const waiting = $$('main.about [data-in]').filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
  waiting.forEach((el) => el.classList.add('is-pre'));
  let batch = [];
  let queued = 0;
  const flush = () => {
    queued = 0;
    batch.sort((x, y) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    batch.forEach((el, i) => {
      el.style.setProperty('--d', `${Math.min(i, 4) * 110}ms`);
      el.classList.remove('is-pre');
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
  }, { rootMargin: '0px 0px -10% 0px' });
  waiting.forEach((el) => io.observe(el));
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest?.('[data-in].is-pre');
    if (!el) return;
    io.unobserve(el);
    el.classList.remove('is-pre');
  });
}

/* ---------- variant A: each card leans a little toward the pointer (at most 3°), and straightens when it leaves; only
   with a mouse, only while it moves (no loop) ---------- */
function initTilt() {
  if (!motion || !fineMQ.matches) return;
  const MAX = 3;
  for (const card of $$('[data-tilt]')) {
    let frame = 0;
    let x = 0.5;
    let y = 0.5;
    const draw = () => {
      frame = 0;
      card.style.setProperty('--rx', `${((0.5 - y) * MAX * 2).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((x - 0.5) * MAX * 2).toFixed(2)}deg`);
    };
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width;
      y = (e.clientY - r.top) / r.height;
      if (!frame) frame = requestAnimationFrame(draw);
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
    });
  }
}

/* ---------- phones: the request button once the first screen has passed, hidden again at the contacts and the footer
   (the ads page's, on this page's blocks) ---------- */
function initSticky() {
  const bar = $('[data-sticky]');
  const hero = $('#team');
  if (!bar || !hero) return;
  const link = $('a', bar);
  const ends = [$('#contacts'), $('.footer')].filter(Boolean);
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
    heroGone = !entries[entries.length - 1].isIntersecting;
    update();
  }, { rootMargin: '0px 0px -35% 0px' }).observe(hero);
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

/* ---------- where the visitor lands: back where they were after a language switch or a reload, else at the #block ---------- */
function arrive() {
  if (restoreScroll() || restorePlace()) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
}
