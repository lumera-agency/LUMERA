/*
 * TEMPORARY · whole-page variant E (?p=e), «Орбіта» (sections/about-page/pe/): its behaviour, started after the page's
 * shared runtime (about-runtime.js). Motion rules as the page's: transform and opacity only, once each, nothing at rest,
 * reduced motion = the final frame (the switch and the stops then change at once).
 *
 * · The first screen's switch (В ECLO / Зазвичай): two toggle buttons (aria-pressed) for the map above them; pe.css
 *   shows the mode from the orbit's data-mode (the spokes, or the manager and his lines). The route is said for screen
 *   readers in a polite live line.
 * · The dial (block 2): five tabs on the ring (a click, or the arrow keys, Home and End); the hand turns to the chosen
 *   stop the short way round (WAAPI on `rotate`), its card shows inside the ring.
 * · Scene «orbit» (block 2, on the page's chain pattern: pe.css's CSS default is the final frame, .is-pre holds the
 *   start, set only when the dial is still below the screen at load): once, as 40 % of the dial is in view, the hand
 *   comes in on «Розбір», runs the ring stop by stop, each stop lights as the hand reaches it and shows its card, and
 *   the run ends on «Ключі» → «Усе на вас», its lime tick coming in. A touch of the tabs during the run ends it there.
 *   Scenes share one queue (one at a time, as on phones; the variant has the one).
 */
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const ROOT = 'main.about[data-about-p="e"]';
const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** the run's rhythm: how long the hand rests on a stop, how long it takes to the next */
const HOLD = 650;
const TURN = 600;

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function start() {
  if (started || !document.querySelector(ROOT)) return;
  started = true;
  initSwitch();
  const dial = initDial();
  if (!motion || !dial) return;
  initOrbit(dial, makeQueue());
}

/* ---------- 1 · the switch: «В ECLO» (the spokes) or «Зазвичай» (the manager in between) ---------- */
function initSwitch() {
  const orbit = document.querySelector(`${ROOT} [data-pe-orbit]`);
  const side = orbit?.parentElement;
  if (!side) return;
  const buttons = $$('[data-pe-mode]', side);
  const route = side.querySelector('[data-pe-route]');
  buttons.forEach((button) => button.addEventListener('click', () => {
    const mode = button.dataset.peMode;
    if (orbit.dataset.mode === mode) return;
    orbit.dataset.mode = mode;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    if (route) route.textContent = mode === 'usual' ? route.dataset.usual : route.dataset.us;
  }));
}

/* ---------- 2 · the dial: the tabs, the hand, the cards ---------- */
function initDial() {
  const dial = document.querySelector(`${ROOT} [data-pe-dial]`);
  if (!dial) return null;
  const tabs = $$('[role="tab"]', dial);
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const arm = dial.querySelector('.pe-dial__arm');
  if (!tabs.length || !arm) return null;
  const angle = (i) => Number(tabs[i].dataset.a);
  let at = angle(Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')));
  let turning = null;
  const api = {
    dial,
    tabs,
    panels,
    /** the stop's tab selected and its card shown */
    show(i) {
      tabs.forEach((tab, k) => {
        tab.setAttribute('aria-selected', String(k === i));
        tab.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach((panel, k) => panel?.toggleAttribute('data-on', k === i));
    },
    /** the hand to the stop, the short way round; at once with reduced motion (or `ms` 0) */
    turn(i, ms = TURN) {
      const now = parseFloat(getComputedStyle(arm).rotate);
      const from = Number.isFinite(now) ? now : at;
      const to = at + ((((angle(i) - at) % 360) + 540) % 360) - 180;
      at = to;
      arm.style.setProperty('--arm', `${to}deg`);
      turning?.cancel();
      turning = null;
      if (!motion || !ms || Math.abs(to - from) < 0.5) return Promise.resolve();
      turning = arm.animate([{ rotate: `${from}deg` }, { rotate: `${to}deg` }], { duration: ms, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
      return turning.finished.catch(() => {});
    },
    /** what a visitor's pick does first (the scene ends itself here, if it is running) */
    onPick: () => {},
  };
  const pick = (i) => {
    api.onPick();
    api.show(i);
    void api.turn(i, 520);
  };
  tabs.forEach((tab, i) => tab.addEventListener('click', () => pick(i)));
  dial.querySelector('[role="tablist"]')?.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const last = tabs.length - 1;
    const j = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: last }[e.key];
    if (j === undefined) return;
    e.preventDefault();
    const k = (j + tabs.length) % tabs.length;
    pick(k);
    tabs[k].focus();
  });
  return api;
}

/* ---------- scene «orbit»: the hand runs the ring once, a stop at a time ---------- */
function initOrbit(api, queue) {
  const { dial, tabs, panels } = api;
  const waits = whenSeen(dial, 0.4, (el) => queue(el, run));
  if (!waits) return;
  // the start: on «Розбір», nothing lit, no card (the CSS default, the run's end, comes back when it ends)
  api.show(0);
  void api.turn(0, 0);
  panels.forEach((panel) => panel?.removeAttribute('data-on'));

  let timers = [];
  let running = false;
  let over = false;
  const end = () => {
    timers.forEach(clearTimeout);
    timers = [];
    running = false;
    over = true;
    api.onPick = () => {};
    dial.classList.remove('is-pre', 'is-run');
  };
  // a visitor's pick before or during the run ends it where it is
  api.onPick = end;

  function run() {
    if (over) return Promise.resolve();
    running = true;
    return new Promise((resolve) => {
      const done = () => {
        end();
        resolve();
      };
      api.onPick = done;
      const arrive = (i) => {
        if (!running) return;
        tabs[i].classList.add('is-lit');
        api.show(i);
        if (i === tabs.length - 1) {
          timers.push(setTimeout(done, 120));
          return;
        }
        timers.push(setTimeout(() => {
          if (!running) return;
          void api.turn(i + 1).then(() => arrive(i + 1));
        }, HOLD));
      };
      dial.classList.add('is-run');
      timers.push(setTimeout(() => arrive(0), 250));
    });
  }
}

/* ---------- one scene at a time (pb.js's queue): a scene waits for the one before it to end (its promise, else all its
   animations), with a ceiling so a stalled one never holds the rest ---------- */
function makeQueue() {
  const waiting = [];
  let busy = false;
  let soon = 0;
  const next = () => {
    if (busy || !waiting.length) return;
    busy = true;
    const { el, play } = waiting.shift();
    const played = play(el);
    let done = false;
    const free = () => {
      if (done) return;
      done = true;
      busy = false;
      next();
    };
    const finished = played instanceof Promise ? played : Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished));
    finished.then(free, free);
    setTimeout(free, 8000);
  };
  return (el, play) => {
    waiting.push({ el, play });
    waiting.sort((x, y) => (x.el.compareDocumentPosition(y.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (!soon) soon = requestAnimationFrame(() => {
      soon = 0;
      next();
    });
  };
}

/** a part still below the screen waits at its start; it plays once as `threshold` of it is in view, or (a part taller
 *  than the screen can show at that share) as it fills that share of the screen. On the screen (or passed) at load:
 *  left as it is (false). */
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
