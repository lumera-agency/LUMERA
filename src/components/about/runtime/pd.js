/*
 * TEMPORARY · «Про нас», whole-page variant D (?p=d), «Конвеєр»: its own behaviour, started after the page's shared
 * runtime (about-runtime.js), only on this variant.
 * Motion rules as the page's: transform and opacity only, once each, nothing at rest, reduced motion = the final frame
 * (the scenes do not run; the tabs and the switch still work, at once).
 *
 * · the pipeline's tabs (block 2, from 601): the five cubes are a tablist (the arrow keys, Home, End; the chosen tab is
 *   the one in the tab order); the log panel shows the chosen stage. The five panels share one cell (pd.css), so the
 *   box never changes its height.
 * · scene «pipeline» (block 2): from 601, one timeline as the run is 35% in view: the pulse runs the line, each stage
 *   passes in turn (pd.css: --pd-t0, then one every --pd-step) and the log follows the stage passing, resting on the
 *   last one; a visitor's own pick ends the following. Phones (≤600): each stage of the standing pipeline plays its
 *   pass as it is 40% in view.
 * · scene «runs» (block 3): from 601 both runs on one timeline as the block is 40% in view; phones: the switch shows
 *   «Зазвичай» while it plays, then «В ECLO» once, as that run starts. The switch's buttons show either run at once.
 * On phones the parts that play one by one share a queue: one scene at a time.
 * The CSS default of every part is its final frame; .is-pre holds the start (only on what is below the screen at load),
 * .is-play runs it.
 */
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const ROOT = 'main.about[data-about-p="d"]';
const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => window.matchMedia('(max-width: 600px)').matches;

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function start() {
  if (started || !document.querySelector(ROOT)) return;
  started = true;
  const queue = makeQueue();
  const tabs = initTabs();
  const show = initSwitch();
  if (!motion) return;
  initPipeline(queue, tabs);
  initRuns(queue, show);
}

/* ---------- one scene at a time: a scene waits for the one before it to end (its animations, or the promise its play
   returns), with a ceiling so a stalled one never holds the rest (pb.js's queue) ---------- */
function makeQueue() {
  const waiting = [];
  let busy = false;
  let soon = 0;
  const run = () => {
    if (busy || !waiting.length) return;
    busy = true;
    const { el, play } = waiting.shift();
    const own = play(el);
    let done = false;
    const next = () => {
      if (done) return;
      done = true;
      busy = false;
      run();
    };
    Promise.all([own, ...el.getAnimations({ subtree: true }).map((a) => a.finished)]).then(next, next);
    setTimeout(next, 4200);
  };
  // the parts seen together (a jump down the page, a fast flick) play in reading order
  return (el, play) => {
    waiting.push({ el, play });
    waiting.sort((x, y) => (x.el.compareDocumentPosition(y.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (!soon) soon = requestAnimationFrame(() => {
      soon = 0;
      run();
    });
  };
}

/** a part still below the screen waits at its start; it plays once as `threshold` of it is in view (or, taller than
 *  the screen can show at that share, as it fills that share of the screen). On the screen (or passed) at load: left
 *  as it is (false). A keyboard focus inside a waiting part shows its final frame at once. */
const STEPS_IO = Array.from({ length: 21 }, (_, k) => k / 20);
function whenSeen(el, threshold, onSeen, onSkip) {
  if (el.getBoundingClientRect().top < window.innerHeight * 0.75) return false;
  el.classList.add('is-pre');
  const io = new IntersectionObserver((entries) => {
    const seen = entries.some((entry) => entry.isIntersecting
      && (entry.intersectionRatio >= threshold || entry.intersectionRect.height >= window.innerHeight * threshold));
    if (!seen) return;
    io.disconnect();
    el.removeEventListener('focusin', skip);
    onSeen(el);
  }, { threshold: STEPS_IO });
  const skip = () => {
    io.disconnect();
    el.removeEventListener('focusin', skip);
    el.classList.remove('is-pre');
    onSkip?.(el);
  };
  el.addEventListener('focusin', skip);
  io.observe(el);
  return true;
}

const play = (el) => {
  el.classList.remove('is-pre');
  el.classList.add('is-play');
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/** a CSS time on an element (pd.css's --pd-t0, --pd-step) in ms */
const ms = (el, name, fallback) => {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(v);
  if (Number.isNaN(n)) return fallback;
  return v.endsWith('ms') ? n : n * 1000;
};

/* ---------- 2 · the pipeline's tabs ---------- */
function initTabs() {
  const pipe = document.querySelector(`${ROOT} [data-pd-run]`);
  const list = pipe?.querySelector('[role="tablist"]');
  if (!pipe || !list) return null;
  const tabs = $$('[role="tab"]', list);
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  let following = false;
  /** shows stage `k` (0–4); `byVisitor`: a click or a key, which also ends the run's following */
  const select = (k, byVisitor = false) => {
    if (byVisitor) following = false;
    pipe.classList.add('is-live');
    tabs.forEach((tab, i) => {
      const on = i === k;
      if ((tab.getAttribute('aria-selected') === 'true') !== on) tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i]?.toggleAttribute('data-on', on);
    });
  };
  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i, true)));
  list.addEventListener('keydown', (e) => {
    const at = tabs.indexOf(document.activeElement);
    if (at < 0) return;
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const k = (to + tabs.length) % tabs.length;
    select(k, true);
    tabs[k].focus();
  });
  return {
    pipe,
    /** the run's following: each stage as it passes, unless the visitor has picked one meanwhile */
    follow(k) {
      if (k === 0) following = true;
      if (following) select(k);
    },
  };
}

/* ---------- 2 · scene «pipeline» ---------- */
function initPipeline(queue, tabs) {
  const pipe = document.querySelector(`${ROOT} [data-pd-run]`);
  if (!pipe) return;
  if (phone()) {
    $$('.pd-col__item', pipe).forEach((item) => whenSeen(item, 0.4, () => queue(item, play)));
    return;
  }
  // wider screens: one timeline as the run is seen (the queue is the phones'; on a wide screen a block in view never
  // waits there for another)
  whenSeen(pipe, 0.35, (el) => {
    const t0 = ms(el, '--pd-t0', 250);
    const step = ms(el, '--pd-step', 700);
    tabs?.follow(0);
    play(el);
    for (let k = 1; k < 5; k++) setTimeout(() => tabs?.follow(k), t0 + k * step);
  });
}

/* ---------- 3 · the runs' switch (phones) ---------- */
function initSwitch() {
  const cmp = document.querySelector(`${ROOT} [data-pd-cmp]`);
  if (!cmp) return null;
  const buttons = $$('[data-run]', cmp);
  let auto = true;
  /** shows run `which` ('usual' | 'us'); `byVisitor` ends the scene's own switch */
  const show = (which, byVisitor = false) => {
    if (byVisitor) auto = false;
    cmp.dataset.show = which;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.run === which)));
  };
  buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.run, true)));
  return {
    cmp,
    show,
    /** the scene's switch: only while the visitor has not used the buttons */
    autoShow(which) {
      if (auto) show(which);
    },
  };
}

/* ---------- 3 · scene «runs» ---------- */
function initRuns(queue, sw) {
  const cmp = sw?.cmp;
  if (!cmp) return;
  if (phone()) {
    const pending = whenSeen(cmp, 0.4, () => queue(cmp, async (el) => {
      sw.autoShow('usual');
      play(el);
      await wait(2400);
      sw.autoShow('us');
      await wait(1500);
    }), () => sw.autoShow('us'));
    // below the screen: it waits on «Зазвичай», the run it will start with
    if (pending) sw.autoShow('usual');
    return;
  }
  whenSeen(cmp, 0.4, play);
}
