/*
 * «Про нас»'s behaviour, an island as on the sibling pages (React owns the markup, this module the motion): the parts
 * coming in as they reach the screen, the labels' shuffle, and where the visitor lands.
 * The section titles and the [data-sr] blocks are the main page's own reveals (PageShell → ScrollReveals).
 *
 * Ported ideas, rebuilt here on CSS and WAAPI (React Bits, reactbits.dev, MIT + Commons Clause; 21st.dev): Animated
 * Content and Animated List (a part or a row rises in once), Text Generate Effect (a text's words come up one after
 * another), Shuffle (a label's letters shuffle and settle). In about.css only: Bounce Cards (the first screen's fan on
 * wide screens), Vertical Cut Reveal (the title's words), Glare Hover (the team cards).
 *
 * Motion rules (the owner's): transform and opacity only, once each, nothing runs at rest; with reduced motion the page
 * shows every part's final frame. The CSS default of each part IS its final frame: `.is-pre` holds its start until it
 * plays (set only on what is still below the screen, so nothing visible ever blinks).
 */
import { restorePlace, restoreScroll } from '@/lib/boot';

const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function startAbout() {
  if (started) return;
  started = true;
  initIn();
  initShuffle();
  arrive();
}

/* ---------- [data-in] (a part), [data-gen] (a text, word by word) and [data-draw] (a line drawing itself in): what is
   still below the screen waits (.is-pre: its start frame, about.css) and comes in once as it reaches the screen; the
   parts arriving together one after another (--d). What is on the screen or passed stays as it is; a keyboard focus
   inside a waiting part shows it at once ---------- */
function initIn() {
  if (!motion) return;
  const waiting = $$('main.about :is([data-in], [data-gen], [data-draw])').filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
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
    const el = e.target.closest?.(':is([data-in], [data-gen], [data-draw]).is-pre');
    if (!el) return;
    io.unobserve(el);
    el.classList.remove('is-pre');
  });
}

/* ---------- the blocks' mono labels (КОМАНДА, ЯК МИ ПРАЦЮЄМО …): their letters shuffle once and settle as the label
   reaches the screen (React Bits' Shuffle). Each letter stands on a short strip of random letters with its own on top;
   the strip slides down to it (transform only; the mono face keeps every width, so nothing moves). Screen readers keep
   the label's text; once the strips have played, the plain text comes back ---------- */
const ABC = { uk: 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ', ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' };
const STEPS = 6;
function initShuffle() {
  if (!motion) return;
  const abc = ABC[document.documentElement.lang] ?? ABC.uk;
  const play = (label) => {
    const text = label.textContent;
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = text;
    const shown = document.createElement('span');
    shown.setAttribute('aria-hidden', 'true');
    const runs = [];
    [...text].forEach((ch, i) => {
      if (/\s/.test(ch)) {
        shown.append(ch);
        return;
      }
      const cell = document.createElement('span');
      cell.className = 'about-sh';
      const strip = document.createElement('span');
      strip.className = 'about-sh__s';
      for (let k = 0; k < STEPS; k++) {
        const letter = document.createElement('span');
        letter.textContent = k ? abc[Math.floor(Math.random() * abc.length)] : ch;
        strip.append(letter);
      }
      cell.append(strip);
      shown.append(cell);
      runs.push(strip.animate(
        [{ transform: `translateY(${(-100 * (STEPS - 1)) / STEPS}%)` }, { transform: 'translateY(0)' }],
        { duration: 560, delay: i * 28, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
      ));
    });
    label.replaceChildren(sr, shown);
    const done = () => { label.textContent = text; };
    Promise.all(runs.map((run) => run.finished)).then(done, done);
  };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      play(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  $$('main.about .s-head__meta > span:last-child').forEach((label) => io.observe(label));
}

/* ---------- where the visitor lands: back where they were after a language switch or a reload, else at the #block ---------- */
function arrive() {
  if (restoreScroll() || restorePlace()) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && document.getElementById(id);
  if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
}
