/*
 * 5 · Чому ECLO — the request's chain, link by link: «Тільки сторінка» against «Система ECLO».
 * The table and its four glyphs are in the markup (index.html; the glyphs are inline SVG,
 * aria-hidden). This module gives each glyph its short story:
 *   Пошук          the query types itself, our ad comes up first and is highlighted
 *   Сайт           the page's blocks drop into place, the button pulses, the picture settles
 *   Заявка         the Telegram notification slides in and nudges, its dot pops with one ring
 *   Звідки заявка  the bars grow from the baseline and bounce, the source tag lights
 *
 * The stories run as a relay along the chain, on every screen: one glyph at a time, Пошук →
 * Сайт → Заявка → Звідки заявка and round again, for as long as the block is in view (a request
 * travelling the chain). The glyph whose turn it is lights its one accent (.w5-row.is-on).
 * - desktop pointer: hovering a row holds the relay and plays that row's story, its accent lit
 *   while the pointer stays; the relay goes on from the next row when the pointer leaves;
 * - out of view or in a hidden tab, nothing runs; reduced motion: no stories (hover still lights
 *   the accent on desktop).
 * Only transform and opacity animate (WAAPI on the SVG parts, one small glyph at a time). The
 * CSS default is the resting, complete glyph, so without JS nothing is hidden.
 *
 * mountWhy(root, { reducedMotion, idle }) → { play(i), replay(), seek(i, t), sync(), destroy() }
 * idle() true: the table is not the picture right now (≤ 600 px the strip of cards is, js/why-phone.js)
 * and its relay waits; sync() after idle() changes.
 *
 * playStory(svg, link | story, { onAccent }) plays one glyph's story on its own: the phone pictures of
 * blocks 4 (js/approach-phone.js, its own stories) and 5 (js/why-phone.js, these STORIES) use it.
 */
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';   // --ease-out (expo.out): arrivals
const SETTLE = 'cubic-bezier(0.34, 1.36, 0.64, 1)'; // a small overshoot: things settling into place
const SWAY = 'cubic-bezier(0.45, 0, 0.55, 1)';      // in-out: a nudge out and back
const rise = (y) => [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }];
const RELAY = 1500; // ms between one glyph's start and the next one's (a full round: 6 s)
const LIT = 1150;   // ms a glyph's accent stays lit in its turn

/* each story: [selector, keyframes, timing (+ stagger for several parts; fill 'none' for a second
   move on a part that already has one)]; accent = when (ms) the lime accent comes up. The parts
   start hidden or collapsed, so a story begins with a short fade of the finished glyph (OUT). */
const OUT = 200;
export const STORIES = {
  search: {
    accent: 430,
    parts: '.g-q, .g-r1, .g-r2, .g-r3',
    steps: [
      ['.g-q', [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 380, easing: 'steps(8, end)' }],
      ['.g-caret', [{ transform: 'translateX(-27px)' }, { transform: 'none' }], { duration: 380, easing: 'steps(8, end)' }],
      ['.g-caret', [{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0, offset: 0.65 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 760, fill: 'none' }],
      ['.g-r1', rise(3), { delay: 300, duration: 340, easing: EASE_OUT }],
      ['.g-r2', rise(3), { delay: 360, duration: 340, easing: EASE_OUT }],
      ['.g-r3', rise(3), { delay: 420, duration: 340, easing: EASE_OUT }],
      ['.g-hl', [{ opacity: 0, transform: 'scaleX(0.4)' }, { opacity: 1, transform: 'none' }], { delay: 430, duration: 380, easing: EASE_OUT, fill: 'none' }],
    ],
  },
  site: {
    accent: 470,
    parts: '.g-b1, .g-b2, .g-b3, .g-b4',
    steps: [
      ['.g-b1', rise(-4), { duration: 420, easing: SETTLE }],
      ['.g-b2', rise(-4), { delay: 70, duration: 420, easing: SETTLE }],
      ['.g-b3', rise(-4), { delay: 140, duration: 420, easing: SETTLE }],
      ['.g-b4', [{ opacity: 0, transform: 'scale(0.86)' }, { opacity: 1, transform: 'none' }], { delay: 90, duration: 460, easing: SETTLE }],
      ['.g-b3', [{ transform: 'none' }, { transform: 'scale(1.14)' }, { transform: 'none' }], { delay: 560, duration: 440, easing: SWAY, fill: 'none' }],
      ['.g-b4', [{ transform: 'none' }, { transform: 'translateY(-2px)' }, { transform: 'none' }], { delay: 600, duration: 620, easing: SWAY, fill: 'none' }],
    ],
  },
  lead: {
    accent: 340,
    parts: '.g-card, .g-dot',
    steps: [
      ['.g-card', [{ opacity: 0, transform: 'translateX(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE_OUT }],
      ['.g-card', [{ transform: 'none' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { delay: 440, duration: 300, easing: SWAY, fill: 'none' }],
      ['.g-dot', [{ transform: 'scale(0)' }, { transform: 'none' }], { delay: 320, duration: 260, easing: SETTLE }],
      ['.g-ping', [{ opacity: 0, transform: 'scale(1)' }, { opacity: 0.9, transform: 'scale(1)', offset: 0.02 }, { opacity: 0, transform: 'scale(2.6)' }], { delay: 360, duration: 620, easing: EASE_OUT }],
    ],
  },
  source: {
    accent: 420,
    parts: '.g-bar, .g-tag',
    steps: [
      ['.g-bar', [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 480, easing: SETTLE, stagger: 70 }],
      ['.g-tag', [{ opacity: 0.3, transform: 'translateX(-4px)' }, { opacity: 1, transform: 'none' }], { delay: 300, duration: 340, easing: EASE_OUT }],
    ],
  },
};

/** Play a glyph's story on its own — a link of STORIES, or a story object of the same shape
 *  ({ accent, parts, steps }): the finished glyph dims (OUT), then builds itself again. onAccent fires at
 *  the story's accent moment. A new story on the same glyph cancels the old one; a finished story hands
 *  the glyph back to its CSS (the same resting frame). */
export function playStory(svg, link, { onAccent } = {}) {
  const story = typeof link === 'string' ? STORIES[link] : link;
  if (!svg || !story) return null;
  svg.__story?.cancel();
  let anims = [];
  const timers = [];
  const cancel = () => {
    timers.forEach(clearTimeout);
    anims.forEach((a) => a.cancel());
    anims = [];
  };
  const out = [...svg.querySelectorAll(story.parts)].map((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0.15 }], { duration: OUT, easing: 'ease-in', fill: 'forwards' }));
  anims.push(...out);
  timers.push(setTimeout(() => {
    out.forEach((a) => a.cancel());
    anims = [];
    for (const [sel, frames, { stagger = 0, delay = 0, fill = 'both', ...timing }] of story.steps) {
      svg.querySelectorAll(sel).forEach((el, k) => anims.push(el.animate(frames, { ...timing, delay: delay + k * stagger, fill })));
    }
    if (onAccent) timers.push(setTimeout(onAccent, story.accent));
    const mine = anims;
    Promise.all(mine.map((a) => a.finished)).then(() => { if (anims === mine) cancel(); }).catch(() => {});
  }, OUT));
  svg.__story = { cancel };
  return svg.__story;
}

export function mountWhy(root, { reducedMotion = false, idle = () => false } = {}) {
  const rows = [...(root?.querySelectorAll('.w5-row') || [])].filter((row) => row.querySelector('.w5-glyph svg'));
  if (!rows.length) return null;
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const parts = rows.map((row) => ({ row, svg: row.querySelector('.w5-glyph svg'), story: STORIES[row.dataset.link], anims: [], timers: [] }));

  /** Build a glyph's story as WAAPI animations (paused); a step's fill defaults to 'both' (a delayed
   *  part holds its first frame until its turn). */
  function build(p) {
    clear(p);
    for (const [sel, frames, { stagger = 0, delay = 0, fill = 'both', ...timing }] of p.story.steps) {
      p.svg.querySelectorAll(sel).forEach((el, k) => {
        p.anims.push(el.animate(frames, { ...timing, delay: delay + k * stagger, fill }));
      });
    }
    for (const a of p.anims) a.pause();
  }
  function clear(p) {
    for (const a of p.anims) a.cancel();
    p.anims = [];
    for (const t of p.timers) clearTimeout(t);
    p.timers = [];
    clearTimeout(p.unlit);
  }
  const running = (p) => p.anims.some((a) => a.playState === 'running');

  /** Play glyph i's story: the finished glyph fades a little ('out'), then the story builds it
   *  again ('story'); its accent is lit from the story's moment, for `lit` ms, or while p.hold. */
  function play(i, { lit = LIT, hold = false } = {}) {
    const p = parts[i];
    if (!p || !p.story) return;
    clear(p);
    p.hold = hold;
    p.phase = 'out';
    const out = [...p.svg.querySelectorAll(p.story.parts)].map((el) =>
      el.animate([{ opacity: 1 }, { opacity: 0.15 }], { duration: OUT, easing: 'ease-in', fill: 'forwards' }));
    p.anims.push(...out);
    p.timers.push(setTimeout(() => {
      for (const a of out) a.cancel();
      build(p);
      p.phase = 'story';
      p.startedAt = performance.now();
      for (const a of p.anims) a.play();
      p.timers.push(setTimeout(() => {
        p.row.classList.add('is-on');
        if (!p.hold) p.unlit = setTimeout(() => p.row.classList.remove('is-on'), lit);
      }, p.story.accent));
      // a finished story hands the glyph back to its CSS (the same resting frame)
      Promise.all(p.anims.map((a) => a.finished)).then(() => {
        if (!running(p)) { for (const a of p.anims) a.cancel(); p.anims = []; p.phase = null; }
      }).catch(() => {});
    }, OUT));
  }

  /* ---------- the relay: one glyph at a time, round the chain, while the block is in view ---------- */
  const relay = { next: 0, timer: 0, visible: false, held: -1 };
  const canRun = () => !reducedMotion && relay.visible && !document.hidden && relay.held < 0 && !idle();
  function tick() {
    relay.timer = 0;
    if (!canRun()) return;
    play(relay.next);
    relay.next = (relay.next + 1) % parts.length;
    relay.timer = setTimeout(tick, RELAY);
  }
  function syncRelay(delay = 0) {
    if (canRun()) {
      if (!relay.timer) relay.timer = setTimeout(tick, delay);
    } else {
      clearTimeout(relay.timer);
      relay.timer = 0;
    }
  }
  const io = new IntersectionObserver((entries) => {
    relay.visible = entries[entries.length - 1].isIntersecting; // the newest entry (one target)
    // starts once the rows have come up (their reveal); stops off screen
    syncRelay(relay.visible ? 500 : 0);
  }, { threshold: 0.2 });
  const table = root.querySelector('[data-why-ledger]') || rows[0].closest('table') || root;
  io.observe(table);
  const onVis = () => syncRelay(400);
  document.addEventListener('visibilitychange', onVis);

  /* ---------- desktop pointer: a row's story on hover, the relay waits ---------- */
  const enter = (e) => {
    const i = parts.findIndex((x) => x.row === e.currentTarget);
    if (i < 0 || e.pointerType === 'touch') return;
    relay.held = i;
    syncRelay();
    for (const p of parts) if (p !== parts[i]) p.row.classList.remove('is-on');
    if (reducedMotion) { parts[i].row.classList.add('is-on'); return; }
    // never restart a story under way (its fade or its build): it plays on, its accent held
    const p = parts[i];
    if (p.phase) {
      p.hold = true;
      if (p.phase === 'story') { p.row.classList.add('is-on'); clearTimeout(p.unlit); }
      return;
    }
    play(i, { hold: true });
  };
  const leave = (e) => {
    const i = parts.findIndex((x) => x.row === e.currentTarget);
    if (i < 0) return;
    parts[i].hold = false; // an accent still to come goes out on its own
    parts[i].row.classList.remove('is-on');
    if (relay.held === i) {
      relay.held = -1;
      relay.next = (i + 1) % parts.length;
      syncRelay(700);
    }
  };
  if (hover) {
    for (const p of parts) {
      p.row.addEventListener('pointerenter', enter);
      p.row.addEventListener('pointerleave', leave);
    }
  }

  return {
    play: (i) => play(i),
    sync: () => syncRelay(400),
    /** ?debug: every glyph's story again, in turn */
    replay() { parts.forEach((p, i) => setTimeout(() => play(i), i * 300)); },
    /** prototype/QA: glyph i frozen at t ms into its story, its accent as in its turn */
    seek(i, t) {
      const p = parts[i];
      build(p);
      for (const a of p.anims) a.currentTime = t;
      p.row.classList.toggle('is-on', t >= p.story.accent && t < p.story.accent + LIT);
    },
    destroy() {
      clearTimeout(relay.timer);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      for (const p of parts) {
        clear(p);
        p.row.classList.remove('is-on');
        p.row.removeEventListener('pointerenter', enter);
        p.row.removeEventListener('pointerleave', leave);
      }
    },
  };
}
