/*
 * «Про нас»'s own scenes («Робочий стіл», sections/about-page/pb/), started after the page's shared runtime
 * (about-runtime.js).
 * Motion rules as the page's: transform and opacity only, once each, nothing at rest, reduced motion = the final frame.
 *
 * The scenes, each on the page's chain pattern (pb.css: the CSS default is the final frame, .is-pre holds the start,
 * .is-play runs the CSS animations, each part at its own moment; what is on the screen at load is left as it is):
 * · «crew» (block 1, phones and small tablets ≤860, where the passes hang one under another from the standing rail):
 *   a pass still below the screen at load waits, then its strap runs out and it slides in, at 40% in view. Wider, the
 *   passes are all on the first screen and drop from the first paint (CSS only).
 * · «desk» (block 2): the five objects land, the markers sweep the plan's two findings, the same findings drop as pins
 *   on the layout and the ad, the test request arrives, the key tags swing, the stamp presses; the objects' key tabs
 *   shuffle as they land (React Bits' Shuffle, as the page's labels). Wide screens: one timeline at 30% in view.
 *   Phones (≤600): each object plays its own part at 40% in view.
 * · «word» (block 3): the selection comes on round the quote, the marker runs behind its key phrases one after
 *   another, the signature's roles come up; at 50% in view.
 * On phones and wherever the parts play one by one, they share one queue: one scene at a time.
 * A touched key tag swings on its own (a mouse only), never while a swing is playing.
 */
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const ROOT = 'main.about[data-ai-page="about"]';
const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function start() {
  if (started || !document.querySelector(ROOT)) return;
  started = true;
  initLineEnds();
  if (!motion) return;
  const queue = makeQueue();
  initCrew(queue);
  initDesk(queue);
  initWord(queue);
  initTagHover();
}

/* ---------- one scene at a time: a scene waits for the one before it to end (all its animations, the pseudo parts' and
   the shuffles' included), with a ceiling so a stalled one never holds the rest ---------- */
function makeQueue() {
  const waiting = [];
  let busy = false;
  let soon = 0;
  const run = () => {
    if (busy || !waiting.length) return;
    busy = true;
    const { el, play } = waiting.shift();
    play(el);
    let done = false;
    const next = () => {
      if (done) return;
      done = true;
      busy = false;
      run();
    };
    Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)).then(next, next);
    setTimeout(next, 3500);
  };
  // the parts seen together (a jump down the page, a fast flick) play in reading order: they gather for a frame, the
  // waiting ones sorted by their place on the page
  return (el, play) => {
    waiting.push({ el, play });
    waiting.sort((x, y) => (x.el.compareDocumentPosition(y.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (!soon) soon = requestAnimationFrame(() => {
      soon = 0;
      run();
    });
  };
}

/** a part still below the screen waits at its start; it plays once as `threshold` of it is in view, or (a part taller
 *  than the screen can show at that share: the desk on a short landscape screen) as it fills that share of the screen.
 *  On the screen (or passed) at load: left as it is (false). */
const STEPS_IO = Array.from({ length: 21 }, (_, k) => k / 20);
function whenSeen(el, threshold, onSeen) {
  if (el.getBoundingClientRect().top < window.innerHeight * 0.75) return false;
  el.classList.add('is-pre');
  const io = new IntersectionObserver((entries) => {
    const seen = entries.some((entry) => entry.isIntersecting
      && (entry.intersectionRatio >= threshold || entry.intersectionRect.height >= window.innerHeight * threshold));
    if (!seen) return;
    io.disconnect();
    onSeen(el);
  }, { threshold: STEPS_IO });
  io.observe(el);
  return true;
}

const play = (el) => {
  el.classList.remove('is-pre');
  el.classList.add('is-play');
};

/* ---------- 1 · the passes on phones and small tablets (one under another): each one still below the screen at load
   plays as it comes into view ---------- */
function initCrew(queue) {
  if (!window.matchMedia('(max-width: 860px)').matches) return;
  $$(`${ROOT} .pb-pass`).forEach((pass) => whenSeen(pass, 0.4, () => queue(pass, play)));
}

/* ---------- 2 · the desk ---------- */
function initDesk(queue) {
  const desk = document.querySelector(`${ROOT} [data-pb-desk]`);
  if (!desk) return;
  if (window.matchMedia('(max-width: 600px)').matches) {
    $$('.pb-obj', desk).forEach((obj) => {
      whenSeen(obj, 0.4, () => queue(obj, (el) => {
        play(el);
        $$('.pb-tab', el).forEach((tab) => shuffle(tab, 0));
      }));
    });
    return;
  }
  // wider screens: one timeline for the whole desk, as soon as it is seen (the queue is the phones' and the stacked
  // notes'; on a wide screen a block in view never waits there for another to end)
  whenSeen(desk, 0.3, (el) => {
    play(el);
    // each tab as its object lands (pb.css: the objects 110 ms apart)
    $$('.pb-obj', el).forEach((obj, i) => {
      const tab = obj.querySelector('.pb-tab');
      if (tab) shuffle(tab, i * 110);
    });
  });
}

/* ---------- 3 · the quote's marker reaches over the space after each word of a key phrase (pb.css), except where a
   word ends its line: those words are marked, again whenever the quote's width changes (layout only, so with reduced
   motion too) ---------- */
function initLineEnds() {
  const quote = document.querySelector(`${ROOT} .pb-q`);
  if (!quote) return;
  const words = $$('.pb-q__w', quote);
  const mark = () => {
    words.forEach((word, i) => {
      const next = words[i + 1];
      word.classList.toggle('is-eol', Boolean(next) && next.offsetTop > word.offsetTop + word.offsetHeight / 2);
    });
  };
  let width = 0;
  new ResizeObserver(([entry]) => {
    const w = Math.round(entry.contentRect.width);
    if (w === width) return;
    width = w;
    mark();
  }).observe(quote);
  document.fonts?.ready.then(mark);
}

/* ---------- 3 · the word ---------- */
function initWord(queue) {
  const mat = document.querySelector(`${ROOT} [data-pb-word]`);
  if (!mat) return;
  whenSeen(mat, 0.5, () => queue(mat, play));
}

/* ---------- (React Bits' Shuffle, as the page's labels in about-runtime.js) a key tab's letters shuffle once and settle:
   each letter on a short strip of random letters with its own on top, the strip sliding down to it (transform only; the
   mono face keeps every width). Screen readers keep the text; once the strips have played, the plain text comes back */
const ABC = { uk: 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ', ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' };
const STEPS = 6;
function shuffle(label, delay) {
  const abc = ABC[document.documentElement.lang] ?? ABC.uk;
  const text = label.textContent;
  if (!text) return;
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
      { duration: 560, delay: delay + i * 28, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
    ));
  });
  label.replaceChildren(sr, shown);
  const done = () => { label.textContent = text; };
  Promise.all(runs.map((run) => run.finished)).then(done, done);
}

/* ---------- a touched key tag swings on its own (a mouse only), once per touch, never over a swing still playing ---------- */
function initTagHover() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$(`${ROOT} .pb-tag`).forEach((tag) => {
    const sway = tag.querySelector('.pb-tag__sw');
    const paper = tag.querySelector('.pb-tag__in');
    if (!sway || !paper) return;
    tag.addEventListener('pointerenter', () => {
      if (paper.classList.contains('is-swing') || sway.getAnimations().length) return;
      paper.classList.add('is-swing');
    });
    paper.addEventListener('animationend', () => paper.classList.remove('is-swing'));
  });
}
