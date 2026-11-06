/*
 * TEMPORARY · whole-page variant A's own scenes (?p=a), started after the page's shared runtime (about-runtime.js).
 * Motion rules as the page's: transform and opacity only, once each, nothing at rest, reduced motion = the final frame.
 *
 * The first screen («Барабан», the credits) is CSS from the first paint (pa.css), no script. Here, what waits for the
 * screen: block 2's «Оглавление-строка» (the contents line read by the ember pass, the columns landing) and block 3's
 * «Правка редактора» (the strike, the caret and the retelling, then the sentence arriving whole). Each part's CSS
 * default is its final frame; `.is-pre` holds the start (set only on what is still below the screen, so nothing seen
 * ever blinks) and `.is-play` runs the CSS animations from there. Already on the screen at load: left as it is.
 */
const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
/** how long each row of block 3 plays (pa.css: «Зазвичай» ends with the «?» and the ✕, «В ECLO» with the ✓), and the
 *  pause before the next one on phones, in ms */
const ROW_USUAL = 1720;
const ROW_US = 1400;
const ROW_GAP = 200;

/** Holds `parts` at their start while `trigger` is below the screen, plays them once as enough of it comes into view. */
function once(trigger, parts, { threshold, rootMargin = '0px' }) {
  if (!trigger || trigger.getBoundingClientRect().top < window.innerHeight) return;
  parts.forEach((el) => el.classList.add('is-pre'));
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    io.disconnect();
    parts.forEach((el) => {
      el.classList.remove('is-pre');
      el.classList.add('is-play');
    });
  }, { threshold, rootMargin });
  io.observe(trigger);
  // a keyboard focus inside a waiting part shows it at once
  const reveal = (e) => {
    if (!parts.some((el) => el.contains(e.target))) return;
    io.disconnect();
    parts.forEach((el) => el.classList.remove('is-pre'));
    document.removeEventListener('focusin', reveal);
  };
  document.addEventListener('focusin', reveal);
}

/** Block 3's per-word lines run on over the space after each word; the last word of a line keeps to itself (.is-eol),
 *  so no strike or underline sticks out past the line's end. Again whenever a sentence re-wraps. Not motion: it is
 *  the final frame's too. */
function lineEnds(page) {
  const sentences = $$('.pa-sent', page);
  const mark = () => sentences.forEach((sentence) => {
    $$('.pa-sw', sentence).forEach((word) => {
      const next = word.nextElementSibling;
      word.classList.toggle('is-eol', !next?.classList.contains('pa-sw') || next.offsetTop > word.offsetTop + 1);
    });
  });
  mark();
  const ro = new ResizeObserver(mark);
  sentences.forEach((sentence) => ro.observe(sentence));
}

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function start() {
  if (started) return;
  started = true;
  const page = $('main.about[data-about-p="a"]');
  if (!page) return;
  lineEnds(page);
  if (!motion) return;

  // 2 · the contents line: once 35% of it is in view (and above the screen's lowest fifth, so its columns are seen)
  const work = $('[data-pa-work]', page);
  once(work && $('[data-pa-index]', work), work ? [work] : [], { threshold: 0.35, rootMargin: '0px 0px -20% 0px' });

  // 3 · the correction: wide screens, both rows as one scene from the first; phones, each row as it comes into view,
  // one scene at a time
  const rows = $$('[data-pa-row]', page);
  if (window.matchMedia('(max-width: 860px)').matches) oneByOne(rows);
  else if (rows.length) once(rows[0], rows, { threshold: 0.4 });
}

/** Phones: each row of block 3 plays once as 40% of it comes into view, one at a time. The two rows often come into
 *  view in the same frame, so one observer takes them in the page's order; a row that arrives while the other one is
 *  still playing waits for it (its --r: pa.css counts every delay from it and holds the start frame meanwhile).
 *  Already on the screen at load: left as it is. (Nothing in the rows takes a keyboard focus.) */
function oneByOne(rows) {
  const waiting = rows.filter((row) => row.getBoundingClientRect().top >= window.innerHeight);
  if (!waiting.length) return;
  waiting.forEach((row) => row.classList.add('is-pre'));
  let free = 0;
  const io = new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target)
      .sort((a, b) => rows.indexOf(a) - rows.indexOf(b))
      .forEach((row) => {
        io.unobserve(row);
        const now = performance.now();
        const wait = Math.max(0, free - now);
        row.style.setProperty('--r', `${Math.round(wait)}ms`);
        free = now + wait + (row.classList.contains('pa-row--us') ? ROW_US : ROW_USUAL) + ROW_GAP;
        row.classList.remove('is-pre');
        row.classList.add('is-play');
      });
  }, { threshold: 0.4 });
  waiting.forEach((row) => io.observe(row));
}
