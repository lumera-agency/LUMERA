/*
 * Mini product demos (block 03 · Послуги): small UI scenes that show how each
 * part of the work is done and what the client gets. All four share one shape
 * (the product designer's storyboards): the start frame is the input, three
 * named steps show the work (the step track under the window), and the rest
 * frame is the output with one ember element — so the rest frame alone
 * explains the service. The site is «Ваш бренд» (vash-sait.ua, the trade a
 * token pill), and one client, Олена, runs through all four: the first screen,
 * her request, the search that brought it, the automations around it.
 *
 * Each is a GSAP timeline that plays once, when its row is being read, and
 * rests at its own label (clip 1 at 15.5 s, clip 2 at 10.6, clip 3 at 15.9,
 * clip 4 at 8.0). Only one thing moves at a time. Rows arrive on their start
 * frame and replay when they come back into view (or from the «Ще раз» pill);
 * with reduced motion each shows exactly its rest frame; without GSAP the CSS
 * default is that same finished composition.
 *
 * Two signal colours: lime for the system at work (layout, steps, clicks, data,
 * AI) and ember for the person (the button, the request, the alert).
 */

import { gsap as GSAP } from '@/lib/gsap';

const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Layout box of `el` inside `box`. Offsets ignore transforms, so a tween in progress doesn't skew it. */
export function boxIn(box, el) {
  let x = 0;
  let y = 0;
  for (let node = el; node && node !== box; node = node.offsetParent) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** Play while at least `threshold` of the element is visible, pause otherwise.
 *  `once`: stop for good at the timeline's 'rest' label (its finished frame).
 *  `gate`: also wait for the stone (see `gates`); `active`: a service row only
 *  plays once its top has passed 45% of the viewport (it is the row being read),
 *  or at once when its chip was picked on a phone (`chosen`, see openDemos). */
const demoState = new WeakMap(); // demo root → { tl, visible, held, active, chosen, done, sync }
const gates = { split: true }; // closed while the stone still has to get there
const gated = new Set();
const regate = () => gated.forEach((state) => state.sync());
document.addEventListener('journey:ready', (e) => {
  // closed only if the stone's route has that moment and hasn't reached it yet
  for (const name of Object.keys(gates)) gates[name] = !e.detail.cues?.includes(name) || e.detail.passed.includes(name);
  regate();
});
for (const name of Object.keys(gates)) {
  document.addEventListener(`journey:${name}`, () => {
    gates[name] = true;
    regate();
  });
}
function autoplay(el, tl, threshold = 0.35, { once = false, gate = null, rowActive = false } = {}) {
  const gsap = GSAP;
  const row = el.closest('.service');
  const state = { tl, visible: false, held: false, active: !rowActive, chosen: false, done: false, played: false };
  // back to the start frame, paused (`fresh`: its measures are taken again, from the layout it has now)
  state.reset = (fresh = false) => {
    state.played = false;
    state.done = false;
    el.classList.remove('is-rest');
    if (pill) gsap.set(pill, { autoAlpha: 0 });
    if (fresh) tl.invalidate();
    tl.restart();
    tl.pause();
  };
  // seen and then left behind (scrolled out, or covered by the next row): back to the start
  // frame, so coming back to it plays it again from the beginning
  state.rewind = () => {
    if (state.played) state.reset();
  };
  state.sync = () => {
    const live = state.visible && !state.held && state.active && !state.done && (!gate || gates[gate]);
    if (live) {
      state.played = true;
      tl.play();
    } else tl.pause();
    row?.classList.toggle('is-live', live);
  };
  // 2.5 s after the rest a quiet «↻ Ще раз» shows in the step-track row; it (or a click on the window,
  // also during those 2.5 s) plays the clip again
  const pill = row?.querySelector('[data-replay]');
  const icon = pill?.querySelector('.demo-replay__icon');
  const showPill = (on) => {
    el.classList.toggle('is-rest', on);
    if (!pill) return;
    gsap.killTweensOf([pill, icon]);
    if (on) {
      gsap.fromTo(pill, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'expo.out', delay: 2.5 });
      gsap.fromTo(icon, { rotate: -90 }, { rotate: 0, duration: 0.4, ease: 'expo.out', delay: 2.5 });
    } else {
      gsap.to(pill, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
    }
  };
  state.replay = () => {
    if (icon) gsap.fromTo(icon, { rotate: 0 }, { rotate: -360, duration: 0.5, ease: 'power2.inOut' });
    showPill(false);
    state.done = false;
    state.played = true;
    tl.restart();
    state.sync();
  };
  pill?.addEventListener('click', state.replay);
  el.addEventListener('click', () => { if (state.done) state.replay(); });
  if (once && tl.labels.rest !== undefined) {
    tl.addPause('rest', () => {
      state.done = true;
      showPill(true);
      state.sync();
      el.dispatchEvent(new CustomEvent('demo:rest', { bubbles: true })); // 3 · Послуги's switcher moves on (sections.js)
    });
  }
  demoState.set(el, state);
  el._demo = state; // look-dev from the console: document.querySelector('[data-demo]')._demo.tl
  if (gate) gated.add(state);
  if (rowActive && row) {
    let queued = 0;
    const check = () => {
      queued = 0;
      const on = state.chosen || row.getBoundingClientRect().top <= window.innerHeight * 0.45;
      if (on !== state.active) {
        state.active = on;
        state.sync();
      }
    };
    window.addEventListener('scroll', () => { if (!queued) queued = requestAnimationFrame(check); }, { passive: true });
    state.check = check;
    check();
  }
  // the newest entry: a jump can deliver a stale one with the current one in the same callback
  const io = new IntersectionObserver((entries) => {
    state.visible = entries[entries.length - 1].isIntersecting;
    state.sync();
  }, { threshold });
  io.observe(el);
  // fully out of the view: rewind (it plays again when it comes back)
  new IntersectionObserver((entries) => {
    if (!entries[entries.length - 1].isIntersecting) state.rewind();
  }, { threshold: 0 }).observe(el);
}

/** Hold (or release) the demos inside `container` — e.g. while a stacked row is covered. */
export function holdDemos(container, held) {
  for (const root of container.querySelectorAll('[data-demo]')) {
    const state = demoState.get(root);
    if (!state || state.held === held) continue;
    state.held = held;
    if (held) state.rewind(); // covered by the next row: it starts over when uncovered
    state.sync();
  }
}

/** 3 · Послуги on phones, a switcher with one service open at a time (sections.js initServiceTabs):
 *  only its clip may play. Closed (`open` false): held on its start frame — paused, nothing of it
 *  ticks. Opened: back to its start frame, measured afresh (from the layout it has now) and on again;
 *  `chosen` (its chip was picked) plays it as soon as it is in view, wherever it sits on the screen.
 *  Without motion the clips keep their rest frames and this does nothing. */
export function openDemos(container, open, { chosen = false } = {}) {
  for (const root of container.querySelectorAll('[data-demo]')) {
    const state = demoState.get(root);
    if (!state) continue;
    state.held = !open;
    state.chosen = open && chosen;
    state.reset(open);
    state.check?.();
    state.sync();
  }
}

/** A clip's timeline (3 · Послуги's switcher draws its progress on the chosen chip). */
export const demoTimeline = (root) => demoState.get(root)?.tl ?? null;

/** Function-based tween values are measured once; re-measure after layout changes.
 *  Only a new width counts: a phone's address bar sliding away mid-scroll changes the
 *  height alone, and re-measuring a clip while it plays would make it jump. */
function invalidateOnResize(timelines) {
  let timer = 0;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(() => timelines.forEach((tl) => tl.invalidate()), 200);
  });
}

/* ---------- the shared kit (the motion designer's language) ---------- */
export const E = { arrive: 'expo.out', travel: 'power3.inOut', camera: 'power2.inOut', leave: 'power2.in', tick: 'none', result: 'back.out(1.6)' };
const css = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

/** The camera: puts `el` (or the rect a function returns) at 50% across and 46% down the
 *  window at scale `s`, never showing an edge; with `keep`, never cropping that element's left edge. */
function aimAt(stage, el, s, keep) {
  const f = () => {
    const W = stage.offsetWidth;
    const H = stage.offsetHeight;
    const r = typeof el === 'function' ? el() : boxIn(stage, el);
    let x = Math.min(0, Math.max(W - W * s, W * 0.5 - (r.x + r.w / 2) * s));
    if (keep) { const k = boxIn(stage, keep); x = Math.min(0, Math.max(x, 8 - k.x * s)); } // `keep`'s left edge stays in view
    const y = Math.min(0, Math.max(H - H * s, H * 0.46 - (r.y + r.h / 2) * s));
    return { x, y };
  };
  return { x: () => f().x, y: () => f().y, scale: s };
}

/** The step track: the stub fills during the open, each connector fills over the last
 *  0.5 s of the step before, the active numeral sits on a lime disc; at the result
 *  the lime turns to ink and the track rests complete. */
function track(tl, root, beats, result) {
  const lines = $$('.demo-steps__line b', root);
  const steps = $$('.demo-steps__step', root);
  const discs = steps.map((s) => s.querySelector('.demo-steps__num i'));
  const nums = steps.map((s) => s.querySelector('.demo-steps__num em'));
  const labels = steps.map((s) => s.querySelector('.demo-steps__num + span'));
  const C = { lime: css(root, '--lime') || '#daff02', ink: css(root, '--ink') || '#f6f6f3', soft: css(root, '--ink-soft') || '#bdb7ad', mute: css(root, '--ink-mute') || '#8a857d', dark: css(root, '--on-accent') || '#0f0e0d' };
  tl.set(lines, { scaleX: 0, backgroundColor: C.lime }, 0)
    .set(discs, { scale: 0 }, 0)
    .set([...nums, ...labels], { color: C.mute }, 0)
    .to(lines[0], { scaleX: 1, duration: 0.4, ease: E.tick }, 0);
  beats.forEach((t, i) => {
    if (i > 0) {
      tl.to(lines[i], { scaleX: 1, duration: 0.5, ease: E.tick }, t - 0.5)
        .to(discs[i - 1], { scale: 0, duration: 0.2, ease: E.leave }, t)
        .to([nums[i - 1], labels[i - 1]], { color: C.soft, duration: 0.2 }, t);
    }
    tl.to(discs[i], { scale: 1, duration: 0.2, ease: E.arrive }, t)
      .to(nums[i], { color: C.dark, duration: 0.2 }, t)
      .to(labels[i], { color: C.ink, duration: 0.2 }, t);
  });
  const last = beats.length - 1;
  tl.to(lines, { backgroundColor: C.soft, duration: 0.4 }, result)
    .to(discs[last], { scale: 0, duration: 0.3, ease: E.leave }, result)
    .to([nums[last], labels[last]], { color: C.soft, duration: 0.3 }, result);
}

const REST_AT = 8.0; // clip 4 (SaaS) comes to rest here; the others name their own

/* ---------- round 8 kit: no rolling text, captions, full-window scenes ---------- */
/** Labels stacked in one cell (a host, a clock, a caption, a counter): the old one fades out,
 *  then the new one fades in. Never both at once, never a roll. */
function swap(tl, els, from, to, at, { out = 0.12, inAt = null, inn = 0.2, y = 0 } = {}) {
  const prev = els[from];
  const next = els[to];
  if (prev) tl.to(prev, { autoAlpha: 0, y: -y, duration: out, ease: E.leave }, at);
  if (next) tl.fromTo(next, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: inn, ease: E.arrive, immediateRender: false }, inAt ?? at + (prev ? out : 0));
}
/** The caption at the window's foot: out (0.15 s, up 4 px), then the next one in (0.3 s, from 4 px below). */
const caption = (tl, caps, from, to, at, inAt) => swap(tl, caps, from, to, at, { out: 0.15, inn: 0.3, y: 4, inAt });
/** A full-window scene slides out to the left as the next one comes in from the right. */
function slide(tl, from, to, at) {
  tl.to(from, { xPercent: -100, duration: 0.6, ease: E.travel }, at)
    .fromTo(to, { xPercent: 100 }, { xPercent: 0, duration: 0.6, ease: E.travel, immediateRender: false }, at);
}
/** A wipe from two transforms: the clip box moves in from the left while its content moves the
 *  other way, so the content stands still and is revealed left to right. */
function wipe(tl, box, inner, at, duration) {
  tl.set(box, { x: () => -box.offsetWidth }, 0)
    .set(inner, { x: () => box.offsetWidth }, 0)
    .to(box, { x: 0, duration, ease: E.travel }, at)
    .to(inner, { x: 0, duration, ease: E.travel }, at);
}
/** System streaming: the text of `el` as word spans (built once), for a word-by-word arrival. */
function splitWords(el) {
  if (!el.querySelector('.w')) {
    const text = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    text.forEach((t, i) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.textContent = t;
      el.append(w, i < text.length - 1 ? ' ' : '');
    });
  }
  return [...el.querySelectorAll('.w')];
}
/** The window is a phone's (the CSS container queries switch at the same width). */
const isNarrow = (root) => root.offsetWidth < 520;

/** Four corner marks around a box (what a note points at). */
function bracketsD({ x, y, w, h }) {
  const k = Math.min(10, w / 4, h / 4);
  const x0 = x - 6;
  const y0 = y - 6;
  const x1 = x + w + 6;
  const y1 = y + h + 6;
  return `M${x0} ${y0 + k}V${y0}H${x0 + k} M${x1 - k} ${y0}H${x1}V${y0 + k} M${x1} ${y1 - k}V${y1}H${x1 - k} M${x0 + k} ${y1}H${x0}V${y1 - k}`;
}

/* ---------- 1 · Дизайн і розробка: why our design and development, in three full-window scenes and a summary.
   The first screen of the «Ваш бренд» sample fills in over its wireframe, and three numbered notes say what it
   answers: what you offer, why to trust you, what to do now. Then PageSpeed Insights: the gauge counts up to the
   owner's 90+ and three checks tick in (phone and computer, Google search, the test request). Then the first screen
   comes back alive: its blocks arrive one after another, the 3D object turns to the cursor, the button reacts to
   it — the details a template hasn't got; three tags name them. The rest frame is a three-line poster, as in
   «Автоматизація». ---------- */
function design(gsap, root) {
  const q = gsap.utils.selector(root);
  const hosts = q('.d-host > b'); // vash-sait.ua · PageSpeed Insights
  const cap = q('.d-cap')[0];
  const caps = q('.d-cap__set > b');
  const [site, speed, sum] = q('.d-scene');
  // 1 · the first screen
  const hero = q('.dn-hero')[0];
  const blocks = q('[data-blk]');
  const title = q('.dn-title')[0];
  const titleText = q('.dn-title .rise > span')[0];
  const textIn = q('.dn-text > span')[0];
  const cta = q('.dn-cta')[0];
  const ctaArrow = cta.querySelector('svg');
  const proof = q('.dn-proof')[0];
  const object = q('.dn-object')[0];
  const stone = q('.dn-stone')[0];
  const unlit = q('.dn-stone img')[0];
  const glint = q('.dn-glint b')[0];
  const wires = q('.dn-wire');
  const [wTitle, wText, wCta, wObj] = ['title', 'text', 'cta', 'obj'].map((k) => q(`.dn-wire--${k}`)[0]);
  const notes = q('.d-note:not(.d-note--fx)');
  const fx = q('.d-note--fx');
  const marks = q('.marks')[0];
  const brackets = q('.marks__brackets')[0];
  const leads = q('.marks__lead');
  const cursor = q('.cursor')[0];
  const ring = q('.ripple')[0];
  // 2 · PageSpeed
  const psUrl = q('.ps__url')[0];
  const psTabs = q('.ps__tabs')[0];
  const gauge = q('.ps__gauge')[0];
  const arc = q('.ps__arc')[0];
  const num = q('.ps__num')[0];
  const score = Number(num.dataset.to) || 0;
  const counter = { n: 0 };
  const checks = q('.ps__checks li');
  const ticks = checks.map((li) => li.querySelector('i'));
  const lime = css(root, '--lime') || '#daff02';
  const ink = css(root, '--ink') || '#f6f6f3';
  // the summary
  const rows = q('.dn-sum__list li');
  const mid = (el, ax = 0.5, ay = 0.5) => { const r = boxIn(hero, el); return { x: r.x + r.w * ax, y: r.y + r.h * ay }; };
  // where the headline's last line ends, inside the hero (the scene's slide is in both rects, so it cancels out;
  // the headline's own rise, a yPercent on the span, is taken off)
  const lineEnd = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = range.getClientRects();
    const last = rects[rects.length - 1] || el.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    const dy = ((Number(gsap.getProperty(el, 'yPercent')) || 0) / 100) * el.offsetHeight;
    return { x: last.right - h.left, y: last.top - h.top - dy, h: last.height };
  };

  // the notes and their leader lines sit beside what they mark, never on it; the detail tags take the same spots
  const place = (el, x, y) => gsap.set(el, { left: Math.round(x), top: Math.round(y) });
  const layout = () => {
    const W = hero.offsetWidth;
    const H = hero.offsetHeight;
    marks.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const t = boxIn(hero, title);
    const c = boxIn(hero, cta);
    const p = boxIn(hero, proof);
    const o = boxIn(hero, object);
    // ① above the headline; in a phone's window, where the nav sits close over it, after its last line instead
    const h1 = notes[0].offsetHeight;
    if (isNarrow(root)) {
      const end = lineEnd(titleText);
      place(notes[0], end.x + 10, end.y + (end.h - h1) / 2);
      leads[0].setAttribute('d', `M${Math.round(end.x + 3)} ${Math.round(end.y + end.h / 2) + 0.5}H${Math.round(end.x + 10)}`);
    } else {
      place(notes[0], t.x, t.y - h1 - 8);
      leads[0].setAttribute('d', `M${Math.round(t.x + h1 / 2) + 0.5} ${Math.round(t.y - 8)}V${Math.round(t.y - 3)}`);
    }
    // ② right of the proof
    place(notes[1], p.x + p.w + 14, p.y + (p.h - notes[1].offsetHeight) / 2);
    leads[1].setAttribute('d', `M${Math.round(p.x + p.w + 3)} ${Math.round(p.y + p.h / 2) + 0.5}H${Math.round(p.x + p.w + 14)}`);
    // ③ right of the button
    place(notes[2], c.x + c.w + 14, c.y + (c.h - notes[2].offsetHeight) / 2);
    leads[2].setAttribute('d', `M${Math.round(c.x + c.w + 3)} ${Math.round(c.y + c.h / 2) + 0.5}H${Math.round(c.x + c.w + 14)}`);
    // the detail tags (scene 3): over the headline, right of the button, over the object's foot
    place(fx[0], t.x, t.y - fx[0].offsetHeight - 8);
    place(fx[1], c.x + c.w + 14, c.y + (c.h - fx[1].offsetHeight) / 2);
    place(fx[2], o.x + (o.w - fx[2].offsetWidth) / 2, o.y + o.h * 0.86 - fx[2].offsetHeight / 2);
  };
  const frame = (el) => () => brackets.setAttribute('d', bracketsD(boxIn(hero, el)));

  const tl = gsap.timeline({ paused: true, defaults: { ease: E.arrive } });
  layout();
  new ResizeObserver(() => layout()).observe(hero);
  // the start frame (a row arrives paused here): the first screen as a wireframe — the nav is there, grey blocks
  // stand where the headline, the text, the button and the object will be
  tl.call(layout, null, 0)
    .set(cap, { autoAlpha: 1 }, 0)
    .set(caps, { autoAlpha: 0, y: 0 }, 0)
    .set(caps[0], { autoAlpha: 1 }, 0)
    .set(hosts, { autoAlpha: 0 }, 0)
    .set(hosts[0], { autoAlpha: 1 }, 0)
    .set([site, speed], { visibility: 'visible', opacity: 1 }, 0)
    .set(site, { xPercent: 0 }, 0)
    .set(speed, { xPercent: 100 }, 0)
    .set(sum, { autoAlpha: 0 }, 0)
    .set(rows, { autoAlpha: 0, y: 8 }, 0)
    .set(blocks, { autoAlpha: 1, y: 0 }, 0)
    .set(titleText, { yPercent: 105 }, 0)
    .set(textIn, { autoAlpha: 0, y: 4 }, 0)
    .set(wires, { autoAlpha: 1 }, 0)
    .set(cta, { scale: 1 }, 0)
    .set(ctaArrow, { x: 0 }, 0)
    .set(proof, { autoAlpha: 0, y: 4 }, 0)
    .set(stone, { rotation: -9, scale: 0.95, x: 0 }, 0)
    .set(unlit, { opacity: 0.35 }, 0)
    .set(glint, { xPercent: -110 }, 0)
    .set([...notes, ...fx], { autoAlpha: 0, x: -4 }, 0)
    .set([...leads, brackets, cursor, ring], { autoAlpha: 0 }, 0)
    .set(cursor, { scale: 1 }, 0)
    .set([psUrl, psTabs, gauge], { autoAlpha: 0, y: 6 }, 0)
    .set(arc, { strokeDashoffset: 1 }, 0)
    .set(num, { color: ink }, 0)
    .set(counter, { n: 0, onComplete: () => { num.textContent = '0'; } }, 0)
    .set(checks, { autoAlpha: 0, x: -6 }, 0)
    .set(ticks, { scale: 0 }, 0);
  track(tl, root, [0.2, 4.7, 9.4], 14.5);

  // 1 · the first screen fills in over its wireframe: the headline, the text, the button, the object, the proof…
  tl.to(titleText, { yPercent: 0, duration: 0.6 }, 0.2)
    .to(wTitle, { autoAlpha: 0, duration: 0.25, ease: E.leave }, 0.3)
    .to(textIn, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.6)
    .to(wText, { autoAlpha: 0, duration: 0.2, ease: E.leave }, 0.6)
    .to(wCta, { autoAlpha: 0, duration: 0.35, ease: E.camera }, 0.9)
    .fromTo(cta, { scale: 0.94 }, { scale: 1, duration: 0.45, ease: E.result, immediateRender: false }, 0.95)
    .to(wObj, { autoAlpha: 0, duration: 0.5, ease: E.camera }, 1.1)
    .to(unlit, { opacity: 1, duration: 0.9, ease: E.camera }, 1.1)
    .to(stone, { rotation: 0, scale: 1, duration: 1.2, ease: E.camera }, 1.1)
    .fromTo(glint, { xPercent: -110 }, { xPercent: 330, duration: 1.3, ease: 'power2.inOut', immediateRender: false }, 1.3)
    .to(proof, { autoAlpha: 1, y: 0, duration: 0.45 }, 1.5);
  // …and three notes say what it answers: ① what you offer, ② why to trust you, ③ what to do now
  tl.call(frame(title), null, 1.0)
    .to(brackets, { autoAlpha: 1, duration: 0.3 }, 1.0)
    .to(notes[0], { autoAlpha: 1, x: 0, duration: 0.3 }, 1.1)
    .to(leads[0], { autoAlpha: 1, duration: 0.3 }, 1.1)
    .to(brackets, { autoAlpha: 0, duration: 0.2, ease: E.leave }, 2.3)
    .call(frame(proof), null, 2.5)
    .to(brackets, { autoAlpha: 1, duration: 0.3 }, 2.5)
    .to(notes[1], { autoAlpha: 1, x: 0, duration: 0.3 }, 2.6)
    .to(leads[1], { autoAlpha: 1, duration: 0.3 }, 2.6)
    .to(brackets, { autoAlpha: 0, duration: 0.2, ease: E.leave }, 3.5)
    .call(frame(cta), null, 3.7)
    .to(brackets, { autoAlpha: 1, duration: 0.3 }, 3.7)
    .to(notes[2], { autoAlpha: 1, x: 0, duration: 0.3 }, 3.8)
    .to(leads[2], { autoAlpha: 1, duration: 0.3 }, 3.8)
    .to(brackets, { autoAlpha: 0, duration: 0.25, ease: E.leave }, 4.45);

  // 2 · PageSpeed Insights: the site's address, the «Телефон» tab, the gauge counts up to 90+, three checks tick in
  caption(tl, caps, 0, 1, 4.7, 5.15);
  slide(tl, site, speed, 4.7);
  swap(tl, hosts, 0, 1, 4.8);
  tl.to(psUrl, { autoAlpha: 1, y: 0, duration: 0.3 }, 5.3)
    .to(psTabs, { autoAlpha: 1, y: 0, duration: 0.3 }, 5.5)
    .to(gauge, { autoAlpha: 1, y: 0, duration: 0.4 }, 5.7)
    .to(arc, { strokeDashoffset: 1 - score / 100, duration: 1.6, ease: 'power2.out' }, 6.0)
    .to(counter, { n: score, duration: 1.6, ease: 'power2.out', onUpdate: () => { num.textContent = String(Math.round(counter.n)); } }, 6.0)
    .to(num, { color: lime, duration: 0.3 }, 7.5);
  [6.9, 7.35, 7.8].forEach((t, k) => {
    tl.to(checks[k], { autoAlpha: 1, x: 0, duration: 0.3 }, t)
      .to(ticks[k], { scale: 1, duration: 0.3, ease: E.result }, t + 0.15);
  });

  // 3 · back to the first screen, alive: the blocks arrive one after another; the cursor comes in to the object,
  //     which turns to it as the light runs over; then to the button, which rises to it and takes a press
  caption(tl, caps, 1, 2, 9.4, 9.85);
  tl.set(site, { xPercent: 100 }, 9.4)
    .set([...notes, ...leads, brackets], { autoAlpha: 0 }, 9.4)
    .set(blocks, { autoAlpha: 0, y: 10 }, 9.4)
    .to(speed, { xPercent: -100, duration: 0.6, ease: E.travel }, 9.4)
    .to(site, { xPercent: 0, duration: 0.6, ease: E.travel }, 9.4);
  swap(tl, hosts, 1, 0, 9.5);
  blocks.forEach((b, i) => tl.to(b, { autoAlpha: 1, y: 0, duration: 0.45 }, 10.0 + i * 0.13));
  tl.to(fx[0], { autoAlpha: 1, x: 0, duration: 0.3 }, 10.9)
    .set(cursor, { x: () => hero.offsetWidth + 12, y: () => mid(stone, 0.5, 0.5).y, autoAlpha: 1 }, 11.5)
    .to(cursor, { x: () => mid(stone, 0.6, 0.5).x, duration: 0.5, ease: E.travel }, 11.5)
    .to(cursor, { y: () => mid(stone, 0.6, 0.5).y, duration: 0.5, ease: E.camera }, 11.5)
    .to(stone, { rotation: 7, scale: 1.06, x: () => hero.offsetWidth * 0.012, duration: 0.7, ease: E.camera }, 12.0)
    .fromTo(glint, { xPercent: -110 }, { xPercent: 330, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, 12.05)
    .to(fx[2], { autoAlpha: 1, x: 0, duration: 0.3 }, 12.3)
    .to(cursor, { x: () => mid(cta, 0.5, 0.55).x, duration: 0.5, ease: E.travel }, 12.9)
    .to(cursor, { y: () => mid(cta, 0.5, 0.55).y, duration: 0.5, ease: E.camera }, 12.9)
    .to(stone, { rotation: 0, scale: 1, x: 0, duration: 0.8, ease: E.camera }, 12.9)
    .to(cta, { scale: 1.06, duration: 0.3, ease: E.result }, 13.4)
    .to(ctaArrow, { x: 3, duration: 0.3, ease: E.result }, 13.4)
    .to(cursor, { scale: 0.9, duration: 0.08, ease: E.leave }, 13.7)
    .to(cursor, { scale: 1, duration: 0.16 }, 13.78)
    .set(ring, { x: () => mid(cta, 0.5, 0.55).x, y: () => mid(cta, 0.5, 0.55).y, scale: 0.25, autoAlpha: 1 }, 13.72)
    .to(ring, { scale: 1.6, autoAlpha: 0, duration: 0.55, ease: 'power2.out' }, 13.72)
    .to(fx[1], { autoAlpha: 1, x: 0, duration: 0.3 }, 13.9)
    .to(cursor, { autoAlpha: 0, duration: 0.25, ease: E.leave }, 14.3);

  // the result: three lines, what the site gives, numbered like the track
  tl.to(cap, { autoAlpha: 0, duration: 0.2, ease: E.leave }, 14.5)
    .to(site, { autoAlpha: 0, duration: 0.3, ease: E.leave }, 14.5)
    .set(sum, { autoAlpha: 1 }, 14.5);
  rows.forEach((r, i) => tl.to(r, { autoAlpha: 1, y: 0, duration: 0.35 }, 14.7 + i * 0.25));
  tl.addLabel('rest', 15.5);
  return tl;
}

/* ---------- 2 · Реклама в Google: the ad is shown to people who search for your service, and you
   see which search brought the request and what it cost. Three full-window scenes: the searches to
   show it for (and the ones left out) → the ad in Google, clicked → the report, where her request
   lands on the search that brought it. The caption stays on the rest frame: it explains the report. ---------- */
function ads(gsap, root) {
  const q = gsap.utils.selector(root);
  const narrow = () => isNarrow(root);
  const stage = q('.d-stage')[0];
  const gs = q('.gs')[0];
  const hosts = q('.d-host > b'); // ads.google.com · google.com
  const cap = q('.d-cap')[0];
  const caps = q('.d-cap__set > b');
  const [plan, serp, report] = q('.d-scene');
  // 1
  const fieldTok = q('.gs__field .gs__tok')[0];
  const heads = q('.gs-head');
  const kws = q('.gs__kw');
  const buys = kws.filter((r) => !r.classList.contains('gs__kw--neg'));
  const negs = kws.filter((r) => r.classList.contains('gs__kw--neg'));
  // 2
  const searchTok = q('.gs__search .gs__tok')[0];
  const typed = q('.gs__typed')[0];
  const promo = q('.gs__promo')[0];
  const [site, title, desc] = [...promo.children];
  const under = q('.gs-u')[0];
  const result = q('.gs__result')[0];
  const fly = q('.gs__fly')[0];
  const cursor = q('.cursor')[0];
  const ring = q('.ripple')[0];
  // 3: the table (wide) and the query card (a phone) carry the same values; both are animated
  const event = q('.gs__event')[0];
  const eventDot = event.querySelector('i');
  const table = q('.gs-table')[0];
  const card = q('.gs-card')[0];
  const vals = (k) => q(`.gs-v[data-v="${k}"]`);
  const olds = (k) => vals(k).map((v) => v.querySelectorAll('b')[0]);
  const news = (k) => vals(k).map((v) => v.querySelectorAll('b')[1]);
  const flashes = (k) => vals(k).map((v) => v.querySelector('.gs-flash'));
  const flags = q('.gs__flag');
  const pulse = q('.gs__pulse')[0];
  const at = (el) => boxIn(gs, el);
  const mid = (el, ax = 0.5, ay = 0.5) => () => { const r = at(el); return { x: r.x + r.w * ax, y: r.y + r.h * ay }; };
  const leadsCell = () => (narrow() ? vals('leads')[1] : vals('leads')[0]);
  // the search is typed letter by letter (each letter a span: seeking lands on exact frames)
  if (!typed.querySelector('i')) {
    const word = typed.textContent.trim();
    typed.textContent = '';
    for (const ch of word) typed.append(Object.assign(document.createElement('i'), { textContent: ch }));
  }
  const letters = [...typed.querySelectorAll('i')];
  const parts = (r) => [...r.children].filter((c) => !c.classList.contains('gs-rule'));

  const tl = gsap.timeline({ paused: true, defaults: { ease: E.arrive } });
  // the start frame: the search field with the viewer's service, and the caption
  tl.set(stage, { x: 0, y: 0, scale: 1 }, 0)
    .set(cap, { autoAlpha: 1 }, 0)
    .set(caps, { autoAlpha: 0, y: 0 }, 0)
    .set(caps[0], { autoAlpha: 1 }, 0)
    .set(hosts, { autoAlpha: 0 }, 0)
    .set(hosts[0], { autoAlpha: 1 }, 0)
    .set([plan, serp], { visibility: 'visible' }, 0)
    .set(plan, { xPercent: 0 }, 0)
    .set([serp, report], { xPercent: 100 }, 0)
    .set(heads, { autoAlpha: 0, y: 6 }, 0)
    .set(q('.gs-rule'), { scaleX: 0 }, 0)
    .set(kws.map(parts).flat(), { autoAlpha: 0, y: 6 }, 0)
    .set(q('.gs__strike'), { scaleX: 0 }, 0)
    .set(negs.map((r) => r.querySelector('.gs__q span')), { opacity: 1 }, 0)
    .set([fly, searchTok, cursor, ring, pulse], { autoAlpha: 0 }, 0)
    .set(fieldTok, { autoAlpha: 1 }, 0)
    .set(letters, { autoAlpha: 0 }, 0)
    .set([promo, desc, result], { autoAlpha: 0, y: 8 }, 0)
    .set(under, { scaleX: 0 }, 0)
    .set(cursor, { scale: 1 }, 0)
    .set([event, table, card], { autoAlpha: 0, y: 8 }, 0)
    .set([...olds('leads'), ...olds('cpl')], { autoAlpha: 1 }, 0)
    .set([...news('leads'), ...news('cpl')], { autoAlpha: 0 }, 0)
    .set([...flashes('leads'), ...flashes('cpl')], { autoAlpha: 0 }, 0)
    .set(flags, { yPercent: 120 }, 0);
  track(tl, root, [0.3, 3.9, 7.7], 9.8);

  // 1 · the searches to show it for land one by one (a hairline, the text, a lime ✓)…
  tl.to(heads[0], { autoAlpha: 1, y: 0, duration: 0.3 }, 0.3);
  buys.forEach((r, i) => {
    const t = 0.3 + i * 0.3;
    const [mark, query, vol] = parts(r);
    tl.to(r.querySelector('.gs-rule'), { scaleX: 1, duration: 0.3, ease: E.travel }, t)
      .to([query, vol].filter(Boolean), { autoAlpha: 1, y: 0, duration: 0.35 }, t + 0.1)
      .to(mark, { autoAlpha: 1, y: 0, duration: 0.25 }, t + 0.3);
  });
  // …and two that bring the wrong people are left out: struck through, dimmed
  tl.to(heads[1], { autoAlpha: 1, y: 0, duration: 0.3 }, 1.5);
  negs.forEach((r, i) => {
    const t = 1.5 + i * 0.3;
    const [mark, query] = parts(r);
    tl.to(r.querySelector('.gs-rule'), { scaleX: 1, duration: 0.3, ease: E.travel }, t)
      .to([mark, query], { autoAlpha: 1, y: 0, duration: 0.3 }, t)
      .to(query.querySelector('.gs__strike'), { scaleX: 1, duration: 0.25, ease: E.travel }, t + 0.25)
      .to(query.querySelector('span'), { opacity: 0.55, duration: 0.25 }, t + 0.25);
  });

  // 2 · over to Google: the service flies into the search box, the city is typed, the ad appears
  caption(tl, caps, 0, 1, 3.6, 4.05);
  slide(tl, plan, serp, 3.6);
  swap(tl, hosts, 0, 1, 3.7);
  tl.set(fly, { x: () => at(fieldTok).x, y: () => at(fieldTok).y, autoAlpha: 1 }, 3.6)
    .set(fieldTok, { autoAlpha: 0 }, 3.6)
    .to(fly, { x: () => at(searchTok).x, y: () => at(searchTok).y, duration: 0.6, ease: E.travel }, 3.6)
    .set(searchTok, { autoAlpha: 1 }, 4.2)
    .set(fly, { autoAlpha: 0 }, 4.2)
    .to(letters, { autoAlpha: 1, duration: 0.01, stagger: 0.06, ease: E.tick }, 4.3)
    .to(promo, { autoAlpha: 1, y: 0, duration: 0.5 }, 4.8)
    .to([desc, result], { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.1 }, 5.45)
    // she clicks it: the cursor comes in from the right to the title's right half (never over the text below)
    .set(cursor, { x: () => gs.offsetWidth + 12, y: () => mid(title, 0.7, 0.5)().y + 30, autoAlpha: 1 }, 5.9)
    .to(cursor, { x: () => mid(title, 0.72, 0.4)().x, duration: 0.5, ease: E.travel }, 5.9)
    .to(cursor, { y: () => mid(title, 0.72, 0.4)().y, duration: 0.5, ease: E.camera }, 5.9)
    .to(under, { scaleX: 1, duration: 0.3, ease: E.travel }, 6.4)
    .to(cursor, { scale: 0.9, duration: 0.08, ease: E.leave }, 6.45)
    .to(cursor, { scale: 1, duration: 0.16 }, 6.53)
    .set(ring, { x: () => mid(title, 0.72, 0.4)().x, y: () => mid(title, 0.72, 0.4)().y, scale: 0.25, autoAlpha: 1 }, 6.5)
    .to(ring, { scale: 1.7, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 6.5)
    .to(cursor, { autoAlpha: 0, duration: 0.2, ease: E.leave }, 6.9);

  // 3 · the report: her request arrives and lands on the search that brought it
  caption(tl, caps, 1, 2, 7.4, 7.85);
  slide(tl, serp, report, 7.4);
  swap(tl, hosts, 1, 0, 7.5);
  tl.to([table, card], { autoAlpha: 1, y: 0, duration: 0.4 }, 8.1)
    .to(event, { autoAlpha: 1, y: 0, duration: 0.35 }, 8.3)
    .set(pulse, { x: () => mid(eventDot)().x, y: () => mid(eventDot)().y, autoAlpha: () => (narrow() ? 0 : 1) }, 8.8)
    .to(pulse, { x: () => mid(leadsCell())().x, y: () => mid(leadsCell())().y, duration: 0.3, ease: E.travel }, 8.8)
    .to(pulse, { autoAlpha: 0, duration: 0.12, ease: E.leave }, 9.1);
  // the two numbers change in turn: the old one out, the new one in, a lime flash behind it
  [['leads', 9.15], ['cpl', 9.45]].forEach(([k, t]) => {
    tl.to(olds(k), { autoAlpha: 0, duration: 0.12, ease: E.leave }, t)
      .to(news(k), { autoAlpha: 1, duration: 0.2 }, t + 0.12)
      .to(flashes(k), { autoAlpha: 1, duration: 0.12, ease: E.tick }, t)
      .to(flashes(k), { autoAlpha: 0, duration: 0.45, ease: E.leave }, t + 0.2);
  });
  // the result: her request, counted (it rises out of the row rather than popping)
  tl.to(flags, { yPercent: 0, duration: 0.45 }, 9.8);
  // a wide window: the camera moves in a little on the table, so the report fills the frame
  const cam = aimAt(stage, () => boxIn(stage, table.parentElement), 1.08);
  tl.to(stage, { x: () => (narrow() ? 0 : cam.x()), y: () => (narrow() ? 0 : cam.y()), scale: () => (narrow() ? 1 : 1.08), duration: 0.6, ease: E.camera }, 9.95)
    .addLabel('rest', 10.6);
  return tl;
}

/* ---------- 3 · Автоматизація: one client, three things that happen around her request, as three
   full-window scenes in turn — the request reaches the manager at once and isn't lost; the data in
   her email moves into the table by itself; the AI assistant answers on the site and in Telegram and
   hands what it doesn't know to a manager — then a three-line poster (the rest frame). The window's
   host and clock name each scene's app and moment; a caption under it says what the scene shows. ---------- */
function leads(gsap, root) {
  const q = gsap.utils.selector(root);
  const narrow = () => isNarrow(root);
  const hosts = q('.d-host > b'); // 0 «Ваш бренд» (rest), 1–3 the scenes
  const clocks = q('.clock b'); // 14:02 · 14:17 · 16:30 · 22:40
  const cap = q('.d-cap')[0];
  const caps = q('.d-cap__set > b');
  const [s1, s2, s3, sum] = q('.d-scene');
  // 1 · the request
  const card = q('.au-card')[0];
  const [hot, cold] = q('.au-new > b');
  const line = q('.au-line')[0];
  const lineIn = q('.au-line__in')[0];
  const late = q('.au-late')[0];
  const ok = q('.au-req .au-ok')[0];
  // 2 · the routine
  const col2 = q('.au-mails .au-col')[0];
  const mail = q('.au-mail')[0];
  const marks = q('.au-mail mark');
  const tab = q('.au-tab')[0];
  const cells = q('.au-td');
  const bar = q('.au-bar')[0];
  const stamp = q('.au-stamp')[0];
  // each marked fact: a lime chip over it (lit) and a lime copy that flies into its cell (built once,
  // from the marks' own text, so it follows the language)
  const ownText = (m) => [...m.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const flies = marks.map((m, k) => s2.querySelector(`.au-fly[data-k="${k}"]`)
    || s2.appendChild(Object.assign(document.createElement('span'), { className: 'au-fly', textContent: ownText(m) })));
  flies.forEach((f, k) => { f.dataset.k = k; f.dataset.dup = ''; });
  const lit = marks.map((m) => m.querySelector('.au-mk') || m.appendChild(Object.assign(document.createElement('i'), { className: 'au-mk', textContent: ownText(m) })));
  lit.forEach((l) => { l.dataset.dup = ''; });
  const centreIn = (el) => { const r = boxIn(s2, el); return { x: r.x, y: r.y + r.h / 2 }; };
  const flyFrom = (k) => { const c = centreIn(marks[k]); return { x: c.x - 3, y: c.y - flies[k].offsetHeight / 2 }; };
  const flyTo = (k) => { const c = centreIn(cells[k]); return { x: c.x - 3, y: c.y - flies[k].offsetHeight / 2 }; };
  // on a phone the email leaves once its facts are filed, and the table moves up to the middle
  // (by half the email plus the stamp hanging under the table, so table + stamp end up centred)
  const gap2 = () => parseFloat(getComputedStyle(col2).rowGap) || 0;
  const lift = () => (narrow() ? mail.offsetHeight + gap2() : 0);
  const centre = () => (narrow() ? (mail.offsetHeight + 2 * gap2() + stamp.offsetHeight) / 2 : 0);
  // 3 · the assistant
  const thread = q('.au-thread')[0];
  const [q1, q2] = q('.au-q');
  const [aw1, aw2] = q('.au-aw');
  const [t1, t2] = q('.au-typing');
  const [a1, a2] = q('.au-a');
  const hand = q('.au-hand')[0];
  const w1 = splitWords(a1);
  const w2 = splitWords(a2);
  const edges = [a1, a2].map((a) => a.querySelector('.au-edge') || a.appendChild(Object.assign(document.createElement('i'), { className: 'au-edge' })));
  const rows = q('.au-sum__list li');

  const tl = gsap.timeline({ paused: true, defaults: { ease: E.arrive } });
  // the start frame (a row arrives paused here): scene 1, its caption, the card waiting at 35 %
  tl.set(cap, { autoAlpha: 1 }, 0)
    .set(caps, { autoAlpha: 0, y: 0 }, 0)
    .set(caps[0], { autoAlpha: 1 }, 0)
    .set(hosts, { autoAlpha: 0 }, 0)
    .set(hosts[1], { autoAlpha: 1 }, 0)
    .set(clocks, { autoAlpha: 0 }, 0)
    .set(clocks[0], { autoAlpha: 1 }, 0)
    .set([s1, s2, s3], { visibility: 'visible', opacity: 1 }, 0)
    .set(s1, { xPercent: 0 }, 0)
    .set([s2, s3], { xPercent: 100 }, 0)
    .set(sum, { autoAlpha: 0 }, 0)
    .set(rows, { autoAlpha: 0, y: 8 }, 0)
    .set(card, { autoAlpha: 0.35, y: -6 }, 0)
    .set(hot, { autoAlpha: 0, scale: 0.86 }, 0)
    .set(cold, { autoAlpha: 0 }, 0)
    .set(line, { autoAlpha: 1 }, 0)
    .set([late, ok, stamp], { autoAlpha: 0, y: 6 }, 0)
    .set(mail, { autoAlpha: 0, y: 6 }, 0)
    .set(tab, { y: 0 }, 0)
    .set([...lit, ...flies, ...cells], { autoAlpha: 0 }, 0)
    .set(bar, { scaleY: 0 }, 0)
    .set(thread, { y: 0 }, 0)
    .set([q1, q2, hand], { autoAlpha: 0, y: 6, scale: 0.96 }, 0)
    .set([aw1, aw2], { autoAlpha: 1 }, 0)
    .set([t1, t2, a1, a2, ...w1, ...w2, ...edges], { autoAlpha: 0 }, 0);
  track(tl, root, [0.2, 4.8, 9.7], 15.2);

  // 1 · the request lands and the manager is told; 15 minutes later, no answer: he is reminded
  tl.to(card, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.2)
    .to(hot, { autoAlpha: 1, scale: 1, duration: 0.3, ease: E.result }, 0.55);
  wipe(tl, line, lineIn, 1.05, 0.4);
  swap(tl, clocks, 0, 1, 2.25);
  tl.to(line, { autoAlpha: () => (narrow() ? 0 : 1), duration: 0.15, ease: E.leave }, 2.45) // a phone: the alarm takes its place
    .to(late, { autoAlpha: 1, y: 0, duration: 0.35 }, 2.6)
    .to(hot, { autoAlpha: 0, duration: 0.25, ease: E.leave }, 2.6) // one ember at a time: «Нова» goes neutral
    .to(cold, { autoAlpha: 1, duration: 0.25 }, 2.6)
    .to(ok, { autoAlpha: 1, y: 0, duration: 0.3 }, 3.25);

  // 2 · the routine: the email's three facts move into the table, one by one
  caption(tl, caps, 0, 1, 4.5, 4.95);
  slide(tl, s1, s2, 4.5);
  swap(tl, hosts, 1, 2, 4.6);
  swap(tl, clocks, 1, 2, 4.75);
  tl.to(mail, { autoAlpha: 1, y: 0, duration: 0.3 }, 5.15);
  [5.7, 6.35, 7.0].forEach((t, k) => {
    tl.to(lit[k], { autoAlpha: 1, duration: 0.15, ease: E.tick }, t)
      .set(flies[k], { x: () => flyFrom(k).x, y: () => flyFrom(k).y, autoAlpha: 1 }, t + 0.15)
      .to(flies[k], { x: () => flyTo(k).x, y: () => flyTo(k).y, duration: 0.4, ease: E.travel }, t + 0.15)
      .to(cells[k], { autoAlpha: 1, duration: 0.15 }, t + 0.5)
      .to(flies[k], { autoAlpha: 0, duration: 0.15, ease: E.leave }, t + 0.55);
    if (k === 0) tl.to(bar, { scaleY: 1, duration: 0.3, ease: E.travel }, t + 0.5);
  });
  tl.to(mail, { autoAlpha: () => (narrow() ? 0 : 0.45), y: () => -lift() * 0.8, duration: 0.35, ease: E.travel }, 7.7)
    .to(tab, { y: () => -centre(), duration: 0.35, ease: E.travel }, 7.7)
    .to(stamp, { autoAlpha: 1, y: 0, duration: 0.3 }, 8.0);

  // 3 · the assistant: it answers what it knows, word by word, and hands the rest to a manager
  caption(tl, caps, 1, 2, 9.4, 9.85);
  slide(tl, s2, s3, 9.4);
  swap(tl, hosts, 2, 3, 9.5);
  swap(tl, clocks, 2, 3, 9.65);
  const ask = (el, at) => tl.to(el, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3 }, at);
  const answer = (typing, a, words, at) => {
    const edge = a.querySelector('.au-edge');
    tl.to(edge, { autoAlpha: 1, duration: 0.25 }, at + 0.3 + words.length * 0.08)
      .to(typing, { autoAlpha: 1, duration: 0.12 }, at)
      .fromTo(typing.children, { opacity: 0.25 }, { opacity: 1, duration: 0.14, stagger: 0.06, repeat: 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, at)
      .to(typing, { autoAlpha: 0, duration: 0.1, ease: E.leave }, at + 0.3)
      .set(a, { autoAlpha: 1 }, at + 0.3)
      .to(words, { autoAlpha: 1, duration: 0.16, stagger: 0.08, ease: E.tick }, at + 0.3);
  };
  // a phone shows two bubbles at a time: the thread scrolls up like a chat, what leaves fades
  const scrollTo = (el) => () => (narrow() ? -(el.offsetTop - q1.offsetTop) : 0);
  const leave = () => (narrow() ? 0 : 1);
  ask(q1, 10.1);
  answer(t1, a1, w1, 10.55);
  tl.to(thread, { y: scrollTo(q2), duration: 0.3, ease: E.travel }, 11.95)
    .to([q1, aw1], { autoAlpha: leave, duration: 0.25, ease: E.leave }, 11.95);
  ask(q2, 12.2);
  answer(t2, a2, w2, 12.55);
  tl.to(thread, { y: scrollTo(aw2), duration: 0.3, ease: E.travel }, 13.35)
    .to(q2, { autoAlpha: leave, duration: 0.25, ease: E.leave }, 13.35)
    // a wide window keeps the whole chat; the first exchange steps back so the hand-off reads first
    .to([q1, aw1], { autoAlpha: () => (narrow() ? 0 : 0.28), duration: 0.3, ease: E.camera }, 13.35)
    .to(hand, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: E.result }, 13.5);

  // the result: the three outcomes, one line each, numbered like the track
  tl.to(cap, { autoAlpha: 0, duration: 0.2, ease: E.leave }, 15.0)
    .to(s3, { autoAlpha: 0, duration: 0.3, ease: E.leave }, 15.0)
    .set(sum, { autoAlpha: 1 }, 15.0);
  swap(tl, hosts, 3, 0, 15.05);
  rows.forEach((r, i) => tl.to(r, { autoAlpha: 1, y: 0, duration: 0.35 }, 15.2 + i * 0.25));
  tl.addLabel('rest', 15.9);
  return tl;
}

/* ---------- 4 · SaaS (v2): a product's main screen builds itself — first the wireframe (lime dashes
   mark where each block goes), then the interface (the blocks fill in, the chart draws, the numbers
   count up), then the release (an ember «Реліз v1.0» on the chart). The rest frame is the finished
   dashboard with the release badge; the CSS default is that same frame. ---------- */
function saas(gsap, root) {
  const q = gsap.utils.selector(root);
  const cap = q('.d-cap')[0];
  const caps = q('.d-cap__set > b');
  const boxes = q('.sa-box');
  const line = q('.sa-line')[0];
  const area = q('.sa-area')[0];
  const badge = q('.sa-badge')[0];
  const live = q('.sa-rows i');
  const nums = q('.sa-num').map((el) => ({ el, to: Number(el.dataset.to) || 0, v: { n: 0 } }));
  const fmt = (n) => Math.round(n).toLocaleString('uk-UA').replace(/ /g, ' ');
  const tl = gsap.timeline({ paused: true, defaults: { ease: E.arrive } });
  tl.set(boxes, { '--fill': 0, '--wf': 0 }, 0)
    .set(line, { strokeDashoffset: 1 }, 0)
    .set(area, { opacity: 0 }, 0)
    .set(badge, { autoAlpha: 0, scale: 0.6, y: 6 }, 0)
    .set(live, { scale: 0 }, 0)
    .set(cap, { autoAlpha: 1 }, 0)
    .set(caps, { autoAlpha: 0, y: 0 }, 0);
  nums.forEach(({ el, v }) => tl.set(v, { n: 0, onComplete: () => { el.textContent = fmt(0); } }, 0));
  track(tl, root, [0.4, 2.6, 5.4], 7.2);
  // 1 · the prototype: where each block goes, drawn one after another
  tl.to(boxes, { '--wf': 1, duration: 0.35, stagger: 0.14, ease: 'power2.out' }, 0.5);
  caption(tl, caps, -1, 0, 0.6);
  // 2 · the interface: the blocks fill in, the chart draws, the numbers count
  tl.to(boxes, { '--fill': 1, duration: 0.45, stagger: 0.12 }, 2.7)
    .to(boxes, { '--wf': 0, duration: 0.5, stagger: 0.12, ease: E.leave }, 3.0)
    .to(line, { strokeDashoffset: 0, duration: 1.4, ease: E.camera }, 3.3)
    .to(area, { opacity: 1, duration: 0.8, ease: E.camera }, 3.8);
  nums.forEach(({ el, to, v }) => tl.to(v, { n: to, duration: 1.3, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(v.n); } }, 3.2));
  caption(tl, caps, 0, 1, 2.8);
  // 3 · the release: the badge, and the clients' rows go live
  tl.to(badge, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: E.result }, 5.6)
    .to(live, { scale: 1, duration: 0.3, stagger: 0.12, ease: E.result }, 5.9);
  caption(tl, caps, 1, 2, 5.6);
  tl.to(cap, { autoAlpha: 0, duration: 0.3, ease: E.leave }, 7.2)
    .addLabel('rest', REST_AT);
  return tl;
}


const BUILDERS = { design, ads, leads, saas };

export function initDemos({ motion, reducedMotion = false }) {
  const roots = $$('[data-demo]');
  const gsap = GSAP;
  if (!motion) {
    if (!gsap || !reducedMotion) {
      return; // no motion: the CSS defaults are each clip's rest frame
    }
    // reduced motion: each demo shows exactly its rest frame
    for (const root of roots) {
      const build = BUILDERS[root.dataset.demo];
      if (!build) continue;
      root.dataset.still = '1';
      build(gsap, root).seek('rest', false).pause();
    }
    return;
  }
  const timelines = [];
  for (const root of roots) {
    const build = BUILDERS[root.dataset.demo];
    if (!build) continue;
    const tl = build(gsap, root);
    timelines.push(tl);
    tl.pause(0.01); // the row arrives on its start frame, not on a spoiler of the result
    autoplay(root, tl, 0.35, { once: true, gate: 'split', rowActive: true });
  }
  invalidateOnResize(timelines);
}
