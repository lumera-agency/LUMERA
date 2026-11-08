/*
 * TEMPORARY · whole-page variant F (?p=f), «Розмова»: its scenes, started after the page's shared runtime
 * (about-runtime.js). Motion rules as the page's: transform and opacity only, once each, nothing at rest, reduced
 * motion = the final frame (nothing here runs then).
 *
 * The scenes (pf.css: the CSS default is the final frame, .is-pre holds the start, .is-play runs it; what is on the
 * screen at load is left as it is):
 * · «thread» (block 2): each message once as it reaches the screen, always one at a time (a chat delivers them in
 *   turn): the role types, the bubble rises in; with more waiting behind it (a fast scroll), no typing (.is-fast). The
 *   side panel's tick for that thing comes as its bubble does.
 * · «direct» (block 3): from 861 one timeline at 40% in view (the usual pane, then ours); narrower, each pane as it
 *   comes in.
 * · «next» (block 4): the three system messages, once at half in view.
 * On phones everything shares the one queue: one scene at a time. (The first screen's member list plays in CSS from
 * the first paint, pf.css.)
 */
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const ROOT = 'main.about[data-about-p="f"]';
const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let started = false;
/** Once per page load (React's dev double effects run it twice). */
export function start() {
  if (started || !document.querySelector(ROOT)) return;
  started = true;
  if (!motion) return;
  const queue = makeQueue();
  initThread(queue);
  initDirect(queue);
  initNext(queue);
}

/* ---------- one scene at a time: a scene waits for the one before it to end (all its animations), with a ceiling so a
   stalled one never holds the rest. play(el, behind): `behind` is how many still wait after it ---------- */
function makeQueue() {
  const waiting = [];
  let busy = false;
  let soon = 0;
  const run = () => {
    if (busy || !waiting.length) return;
    busy = true;
    const { el, play } = waiting.shift();
    play(el, waiting.length);
    let done = false;
    const next = () => {
      if (done) return;
      done = true;
      busy = false;
      run();
    };
    Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)).then(next, next);
    setTimeout(next, 4000);
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
 *  than the screen can show at that share) as it fills that share of the screen. On the screen (or passed) at load:
 *  left as it is (false), so nothing in view ever blinks out. */
const STEPS_IO = Array.from({ length: 21 }, (_, k) => k / 20);
function whenSeen(el, threshold, onSeen) {
  if (el.getBoundingClientRect().top < window.innerHeight * 0.96) return false;
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

/* ---------- 2 · the thread ---------- */
function initThread(queue) {
  const thread = document.querySelector(`${ROOT} [data-pf-thread]`);
  if (!thread) return;
  const files = new Map($$(`${ROOT} .pf-files__list li[data-got]`).map((li) => [li.dataset.got, li]));
  $$('[data-pf-msg]', thread).forEach((msg) => {
    const file = msg.dataset.got ? files.get(msg.dataset.got) : null;
    const waits = whenSeen(msg, 0.55, () => queue(msg, (el, behind) => {
      if (behind) el.classList.add('is-fast');
      play(el);
      if (file) {
        // ticked as the bubble is in (pf.css: the bubble at 0.82 s, or at once when hurried)
        file.style.setProperty('--d', behind ? '0.3s' : '1.05s');
        play(file);
      }
    }));
    if (waits && file) file.classList.add('is-pre');
  });
}

/* ---------- 3 · the chat moment ---------- */
function initDirect(queue) {
  const dm = document.querySelector(`${ROOT} [data-pf-dm]`);
  if (!dm) return;
  if (window.matchMedia('(max-width: 860px)').matches) {
    $$('[data-pf-pane]', dm).forEach((pane) => whenSeen(pane, 0.5, () => queue(pane, play)));
    return;
  }
  // wide: one timeline as soon as it is seen (a wide screen's block in view never waits for the thread's queue)
  whenSeen(dm, 0.4, play);
}

/* ---------- 4 · what happens next ---------- */
function initNext(queue) {
  const next = document.querySelector(`${ROOT} [data-pf-next]`);
  if (!next) return;
  whenSeen(next, 0.5, () => queue(next, play));
}
