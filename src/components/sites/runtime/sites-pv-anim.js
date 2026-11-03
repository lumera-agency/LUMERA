/* «Дизайн і сайти» (Next): copied from the static page's js/sites-pv-anim.js (the working folder); unchanged. */
/* «Дизайн і сайти» (/dyzain-i-saity): a copy of the main page's configurator module
 * src/components/sections/pricing/configurator/rb-anim.js (14 Oct 2026), so this page shows the same sample sites.
 * Changes here: none (its React Bits notice is kept below). The original stays the main page's; edit the two together. */
/*
 * «Анімація» · text and UI motion in the sample site: React Bits components, ported to plain DOM + WAAPI
 * for the studio's configurator preview (9 Oct 2026). Sources:
 *   BlurText     https://github.com/DavidHDev/react-bits/blob/main/src/content/TextAnimations/BlurText/BlurText.jsx
 *   RotatingText https://github.com/DavidHDev/react-bits/blob/main/src/content/TextAnimations/RotatingText/RotatingText.jsx
 *   CountUp      https://github.com/DavidHDev/react-bits/blob/main/src/content/TextAnimations/CountUp/CountUp.jsx
 *   ShinyText    https://github.com/DavidHDev/react-bits/blob/main/src/content/TextAnimations/ShinyText/ShinyText.jsx
 *   StarBorder   https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/StarBorder/StarBorder.jsx
 *   LogoLoop     https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/LogoLoop/LogoLoop.jsx
 * What changed in the port: no React and no motion/react. BlurText keeps its keyframes (blur 10 → 5 → 0,
 * opacity 0 → .5 → 1, y −→ + → 0) in WAAPI; RotatingText keeps its in/out per character with a spring-
 * like curve, inside a cell as wide as its widest word (nothing reflows); CountUp keeps its spring
 * (damping 20 + 40/d, stiffness 100/d) and writes into a cell as wide as the final number; StarBorder and
 * LogoLoop keep their CSS geometry (css/configurator.css) and move by transform; ShinyText becomes a lighter
 * copy of the eyebrow's line seen through a window that slides across it (both by transform, so only the
 * letters light up). All of it runs only while the preview is live (fx.js).
 *
 * ---------------------------------------------------------------------------------------------------------
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * ## Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**
 *
 * ## No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------------------------------------
 *
 * The markup these ports animate is rendered by preview.js at all times (so switching «Анімація» on or
 * off never reflows anything): the headline's words as .rb-w, the last word of its accent as a .rb-rot
 * cell, numbers as .rb-num cells, icons' strokes with pathLength="1", the logos row as .rb-loop, the
 * eyebrow's lines with their shine copies, the call to action's StarBorder layer.
 *
 * mountRb(site) → { start(), stop(), replay(), pause(), play(), rotate(), draw(), destroy() }
 * (the studio's Авторський, «Синя година»: mountCover below, the same interface)
 */

/* ---------- BlurText: the headline comes in word by word ---------- */
// (the original's default keyframes, its 0.35 s per step and its per-word delay)
const BLUR_FROM = { filter: 'blur(10px)', opacity: 0, translate: '0 -0.55em' };
const BLUR_TO = [{ filter: 'blur(5px)', opacity: 0.5, translate: '0 0.06em' }, { filter: 'blur(0px)', opacity: 1, translate: '0 0' }];
// blur: false keeps the timing and the drift without the filter (the studio's Базовий: transform/opacity only)
const strip = ({ filter, ...k }) => k;
function blurText(root, { delay = 120, stepDuration = 0.35, blur = true } = {}) {
  const words = [...root.querySelectorAll('.rb-w')];
  const kf = blur ? [BLUR_FROM, ...BLUR_TO] : [BLUR_FROM, ...BLUR_TO].map(strip);
  return words.map((w, i) => w.animate(kf, { duration: stepDuration * BLUR_TO.length * 1000, delay: i * delay, easing: 'linear', fill: 'backwards' }));
}

/* ---------- RotatingText: one word swaps on a loop ---------- */
const SPRING = 'cubic-bezier(0.34, 1.45, 0.55, 1)'; // the original's spring (damping 25, stiffness 300), as a curve
function rotateText(cell, { stagger = 28 } = {}) {
  const vs = [...cell.querySelectorAll('.rb-rot__v')];
  if (vs.length < 2) return;
  const i = Math.max(0, vs.findIndex((v) => v.classList.contains('is-on')));
  const cur = vs[i], next = vs[(i + 1) % vs.length];
  const out = [...cur.querySelectorAll('.rb-ch')], inn = [...next.querySelectorAll('.rb-ch')];
  // exit (animatePresenceMode 'wait'): the current word's letters leave upwards, the last one first
  out.forEach((c, k) => c.animate([{ translate: '0 0', opacity: 1 }, { translate: '0 -120%', opacity: 0 }], { duration: 300, delay: (out.length - 1 - k) * stagger, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }));
  const wait = 300 + (out.length - 1) * stagger * 0.6;
  cur.classList.remove('is-on');
  next.classList.add('is-on');
  inn.forEach((c, k) => {
    c.getAnimations().forEach((a) => a.cancel());
    c.animate([{ translate: '0 100%', opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 560, delay: wait + (inn.length - 1 - k) * stagger, easing: SPRING, fill: 'backwards' });
  });
  setTimeout(() => out.forEach((c) => c.getAnimations().forEach((a) => a.cancel())), wait + 40);
}
function resetRotate(cell) {
  const vs = [...cell.querySelectorAll('.rb-rot__v')];
  vs.forEach((v, k) => { v.classList.toggle('is-on', k === 0); v.querySelectorAll('.rb-ch').forEach((c) => c.getAnimations().forEach((a) => a.cancel())); });
}

/* ---------- CountUp: numbers count up with the original's spring ---------- */
function countUp(cell, { duration = 1.6, delay = 0 } = {}) {
  const to = parseFloat(cell.dataset.to), dec = +(cell.dataset.dec || 0), sep = cell.dataset.sep || '';
  const live = cell.querySelector('.rb-num__l');
  if (!live || Number.isNaN(to)) return () => {};
  const damping = 20 + 40 * (1 / duration), stiffness = 100 * (1 / duration);
  const fmt = (v) => { let s = v.toFixed(dec); if (sep) s = s.replace('.', sep); return s; };
  let x = 0, vel = 0, last = 0, raf = 0, stopped = false;
  live.textContent = fmt(0);
  cell.classList.add('is-counting');
  const tick = (now) => {
    if (stopped) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    const a = -stiffness * (x - to) - damping * vel; // mass 1
    vel += a * dt;
    x += vel * dt;
    live.textContent = fmt(Math.max(0, x));
    if (Math.abs(x - to) < Math.pow(10, -dec) / 2 && Math.abs(vel) < 0.01) { cell.classList.remove('is-counting'); return; }
    raf = requestAnimationFrame(tick);
  };
  const t = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay * 1000);
  return () => { stopped = true; clearTimeout(t); cancelAnimationFrame(raf); cell.classList.remove('is-counting'); };
}

/* ---------- LogoLoop: the logos become a continuous marquee ---------- */
function logoLoop(box, { secondsPerSet = 9 } = {}) {
  const track = box.querySelector('.rb-loop__track');
  if (!track) return null;
  const set = track.querySelector('.rb-loop__set');
  const copy = set.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.classList.add('rb-loop__copy');
  track.append(copy);
  box.classList.add('is-loop');
  // two identical sets, each with its trailing gap: moving by half the track tiles them seamlessly
  const anim = track.animate([{ translate: '0 0' }, { translate: '-50% 0' }], { duration: secondsPerSet * 1000, iterations: Infinity, easing: 'linear' });
  return {
    pause: () => anim.pause(),
    play: () => anim.play(),
    stop() { anim.cancel(); copy.remove(); box.classList.remove('is-loop'); },
  };
}

/* ---------- icons draw themselves and bounce (more than the old pop) ---------- */
function drawIcon(box) {
  const parts = [...box.querySelectorAll('[pathLength]')];
  parts.forEach((p, k) => p.animate([{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 720, delay: k * 70, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' }));
  box.animate([
    { translate: '0 0', scale: '1' },
    { translate: '0 -0.55em', scale: '1.2', offset: 0.32 },
    { translate: '0 0.08em', scale: '0.94', offset: 0.62 },
    { translate: '0 0', scale: '1' },
  ], { duration: 860, easing: 'ease-out' });
}

/* ==========================================================================
   «Синя година» · the studio's Авторський (concept B, 10 Oct 2026): a magazine cover that enters once,
   block by block. Plain DOM + WAAPI, written from scratch; ideas and timings after:
     Vertical Cut Reveal — fancy, Daniel Petho (MIT): pieces of text rise out of a clip at their foot, the
       letters of a word in one word box (the masthead, the headline, the steps' numerals, «Зміст»);
     Spinning Text — motion-primitives, Julien Thibeaut (MIT): text set on a circle that turns (the sticker);
     Fold Text — React Bits, David Haz (MIT + Commons Clause, notice above): panels unfold from a top hinge,
       0.65 s each, 0.045 s apart (the contents' numbers 01 / 02 / 03 turn in like pages);
     Index List Carousel — Kedhareswer Naidu (no licence stated: the idea only, no code): a numbered index
       whose open row shows its picture (the hall's print slides out of the open row).
   For the two MIT sources: Copyright (c) Daniel Petho; Copyright (c) Julien Thibeaut. Permission is hereby
   granted, free of charge, to any person obtaining a copy of this software and associated documentation files
   (the "Software"), to deal in the Software without restriction, including without limitation the rights to
   use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
   persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright
   notice and this permission notice shall be included in all copies or substantial portions of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
   TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
   CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
   DEALINGS IN THE SOFTWARE.
   How it runs: every block's animations are made at once and held on their first frame (paused); the cover
   plays at once, each block below plays when the tour brings it into the frame (a rect check every 160 ms,
   nothing per frame), once. Transform, opacity and clip-path only (the icons' strokes by stroke-dashoffset,
   the numbers by CountUp above); the one loop is the sticker's ring turning slowly after it lands (CSS,
   paused with the frame). Without «Анімація» none of this runs and the page stands as rendered.
   ========================================================================== */
const OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'; // a power-out, for everything that arrives
const LAND = 'cubic-bezier(0.34, 1.32, 0.64, 1)'; // a light overshoot: the sticker lands
function mountCover(site) {
  const vp = site.closest('.pv-vp');
  const hero = site.querySelector('[data-hero]');
  const st = { on: false, blocks: [], counts: [], loops: [], poll: 0, live: true };
  const $ = (root, q) => (root ? [...root.querySelectorAll(q)] : []);
  const one = (root, q) => root?.querySelector(q);
  // the helpers push into a block's list: fill backwards holds the first frame until each one's delay
  const add = (L, el, kf, o) => { if (el) L.push(el.animate(kf, { fill: 'backwards', easing: OUT, ...o })); };
  const rise = (L, els, at, step, d = 820) => els.forEach((el, i) => add(L, el, [{ translate: '0 1.18em' }, { translate: '0 0' }], { duration: d, delay: at + i * step }));
  const come = (L, els, at, step, from = '0 0.7em', d = 640) => els.forEach((el, i) => add(L, el, [{ opacity: 0, translate: from }, { opacity: 1, translate: '0 0' }], { duration: d, delay: at + i * step }));
  const rule = (L, els, at, step = 0, d = 900) => els.forEach((el, i) => add(L, el, [{ scale: '0 1' }, { scale: '1 1' }], { duration: d, delay: at + i * step }));
  const draw = (L, box, at) => $(box, '[pathLength]').forEach((p, k) => add(L, p, [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 900, delay: at + k * 90, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }));
  const scan = (L, bar, at) => add(L, one(bar, '.pv-bar__scan'), [{ opacity: 0, translate: '0 0' }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.85 }, { opacity: 0, translate: '0 3cqw' }], { duration: 1100, delay: at, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'none' });
  const count = (cells, at) => cells.forEach((n, k) => st.counts.push(countUp(n, { duration: 1.4, delay: at + k * 0.15 })));

  /* the cover: the masthead's letters rise out of the cut, the facts line opens from its centre, the
     announcement comes line by line (the italic line last), the numbers count, the sticker lands turning */
  function cover(L) {
    const h = hero;
    rise(L, $(h, '.pv-mast .pv-cut__i'), 100, 55, 900);
    rule(L, $(h, '.pv-dl > .pv-rule'), 380);
    come(L, $(h, '.pv-dl > span'), 520, 70, '0 0.6em');
    const h1 = one(h, '.pv-cover__h1');
    const ua = one(h1, '.pv-lx__a') || h1;
    const caps = $(ua, '.pv-cut__i').filter((w) => !w.closest('em'));
    come(L, [one(h, '.pv-cover__k')], 560, 0, '-1.2em 0');
    rise(L, caps, 680, 120);
    const em = 680 + caps.length * 120 + 120;
    rise(L, $(ua, 'em .pv-cut__i'), em, 90, 1000);
    come(L, [one(h, '.pv-cover__sub')], em + 160, 0, '0 0.6em');
    come(L, $(h, '.pv-cover__ctas > *'), em + 260, 90, '0 0.8em');
    const side = $(h, '.pv-cover__stat');
    rule(L, side.map((x) => one(x, '.pv-rule')), 820, 150);
    come(L, side.flatMap((x) => [one(x, 'b'), one(x, ':scope > span')]), 900, 75, '0 0.5em');
    count($(h, '.pv-cover__side .rb-num'), 0.95);
    const stk = one(h, '.pv-stk');
    add(L, stk, [{ opacity: 0, scale: '0.45', rotate: '-200deg' }, { opacity: 1, offset: 0.35 }, { opacity: 1, scale: '1', rotate: getComputedStyle(stk).rotate }], { duration: 1300, delay: 1150, easing: LAND });
    const landed = L[L.length - 1];
    if (stk && landed?.effect.target === stk) landed.finished.then(() => { if (st.on) stk.classList.add('is-spin'); }).catch(() => {});
    const bar = one(h, ':scope > .pv-bar');
    come(L, [bar], 1450, 0, '0 0.6em', 600);
    scan(L, bar, 1800);
  }
  /* «Зміст»: the title out of its cut, the rows in from the left one by one, their numbers turning in like
     pages, their leaders running to the prices, the open row's band unrolling, then its print sliding out */
  function toc(L, b) {
    come(L, [one(b, '.pv-rh')], 0, 0, '0 0.5em', 600);
    rise(L, $(b, '.pv-toc__head .pv-cut__i'), 60, 0, 900);
    come(L, [one(b, '.pv-toc__head em')], 300, 0, '-0.6em 0', 800);
    come(L, [one(b, '.pv-toc__aside')], 400, 0, '0 0.6em');
    rule(L, [one(b, '.pv-toc__head > .pv-rule')], 120, 0, 1100);
    $(b, '.pv-toc__row').forEach((row, i) => {
      const at = 300 + i * 150;
      add(L, row, [{ opacity: 0, translate: '-6cqw 0' }, { opacity: 1, translate: '0 0' }], { duration: 780, delay: at });
      $(row, '.pv-fold > i').forEach((d, k) => add(L, d, [{ opacity: 0, transform: 'rotateX(-100deg)' }, { opacity: 1, offset: 0.4 }, { opacity: 1, transform: 'rotateX(0deg)' }], { duration: 650, delay: at + 160 + k * 45 }));
      rule(L, [one(row, '.pv-toc__ld')], at + 380, 0, 700);
    });
    rule(L, [one(b, '.pv-toc__band')], 360, 0, 1000);
    add(L, one(b, '.pv-toc__print'), [{ opacity: 0, translate: '-5cqw 2.4cqw', rotate: '-9deg', offset: 0 }], { duration: 1100, delay: 860 });
    come(L, [one(b, '.pv-toc__fn'), one(b, '.pv-jump')], 980, 90, '0 0.5em', 600);
  }
  /* «У ціні оренди»: the tiles come up one by one, their crop marks close in from the corners, the drawings
     draw themselves, the «6» counts, the strobe's tile flashes once */
  function rent(L, b) {
    come(L, [one(b, '.pv-rh')], 0, 0, '0 0.5em', 600);
    come(L, [one(b, '.pv-rent__head .pv-h2'), one(b, '.pv-rent__aside')], 80, 120, '0 0.6em', 800);
    rule(L, [one(b, '.pv-rent__head > .pv-rule')], 120, 0, 1100);
    $(b, '.pv-cell').forEach((cell, i) => {
      const at = 260 + i * 110;
      add(L, cell, [{ opacity: 0, translate: '0 1.6cqw' }, { opacity: 1, translate: '0 0' }], { duration: 700, delay: at });
      add(L, one(cell, '.pv-crop'), [{ opacity: 0, scale: '1.12' }, { opacity: 1, scale: '1' }], { duration: 800, delay: at + 200 });
      draw(L, cell, at + 260);
      add(L, one(cell, '.pv-cell__p'), [{ opacity: 0, scale: '0.6' }, { opacity: 1, scale: '1' }], { duration: 700, delay: at + 260, easing: LAND });
    });
    add(L, one(b, '.pv-cell__flash'), [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0.25, offset: 0.45 }, { opacity: 1 }], { duration: 1200, delay: 900, easing: 'ease-out' });
    come(L, [one(b, '.pv-jump')], 1000, 0, '0 0.5em', 600);
  }
  /* the steps: the column rules drop, the numerals rise out of their cut, the rail runs through them and
     its stations light up one by one, the icons draw themselves */
  function steps(L, b) {
    come(L, [one(b, '.pv-rh')], 0, 0, '0 0.5em', 600);
    come(L, [one(b, '.pv-tag')], 60, 0, '-0.8em 0');
    come(L, [one(b, '.pv-h2')], 160, 0, '0 0.5em', 800);
    rule(L, [one(b, '.pv-rub__rail')], 300, 0, 1400);
    $(b, '.pv-rub__col').forEach((col, i) => {
      const at = 220 + i * 160;
      rule(L, [one(col, '.pv-rule')], at, 0, 800);
      rise(L, $(col, '.pv-cut__i'), at + 80, 0, 900);
      add(L, one(col, '.pv-rub__node'), [{ opacity: 0, scale: '0' }, { opacity: 1, scale: '1' }], { duration: 500, delay: 420 + i * 300, easing: LAND });
      come(L, [one(col, '.pv-rub__mk')], 520 + i * 300, 0, '0 0.5em', 500);
      draw(L, one(col, '.pv-rub__ico'), at + 240);
      come(L, [one(col, 'b'), one(col, ':scope > span:last-child')], at + 320, 70, '0 0.6em');
    });
    come(L, [one(b, '.pv-jump')], 1100, 0, '0 0.5em', 600);
  }
  /* «Кадри наших гостей»: the prints are dealt from one stack in the middle of the table to their places in
     the fan, the front one last; the shoots' list comes in, its marker runs under the first */
  function gallery(L, b) {
    come(L, [one(b, '.pv-rh')], 0, 0, '0 0.5em', 600);
    come(L, [one(b, '.pv-h2')], 80, 0, '0 0.6em', 800);
    const stage = one(b, '.pv-gal__stage');
    const sr = stage.getBoundingClientRect();
    const order = ['.pv-gpr--2', '.pv-gpr--3', '.pv-gpr--1'];
    order.forEach((q, k) => {
      const pr = one(stage, q);
      if (!pr) return;
      const r = pr.getBoundingClientRect();
      // from the stack: the stage's centre, upright (one keyframe at offset 0: the end is the pose in CSS)
      const dx = sr.left + sr.width / 2 - (r.left + r.width / 2), dy = sr.top + sr.height * 0.55 - (r.top + r.height / 2);
      add(L, pr, [{ opacity: 0, translate: `${Math.round(dx)}px ${Math.round(dy + 12)}px`, rotate: '0deg', offset: 0 }, { opacity: 1, offset: 0.25 }], { duration: 1000, delay: 260 + k * 200 });
    });
    come(L, [one(b, '.pv-gpr__tag')], 1150, 0, '0 -0.6em', 500);
    come(L, $(b, '.pv-gal__w'), 300, 120, '-2cqw 0', 700);
    rule(L, [one(b, '.pv-gal__w.is-on .pv-gal__mk')], 760, 0, 800);
    come(L, [one(b, '.pv-gal__idx'), one(b, '.pv-gal__exif'), one(b, '.pv-jump')], 900, 100, '0 0.5em', 600);
  }
  /* the interview: the rubric rises up the edge, the mark hangs in, the quote opens word by word (phones
     too), the score counts, the first of three lines fills */
  function interview(L, b) {
    add(L, one(b, '.pv-iv__vr'), [{ opacity: 0, translate: '0 3cqw', offset: 0 }], { duration: 900, delay: 0 });
    come(L, [one(b, '.pv-rh')], 0, 0, '0 0.5em', 600);
    rule(L, [one(b, '.pv-iv__side > .pv-rule')], 60, 0, 900);
    come(L, $(b, '.pv-iv__side .pv-stars > svg'), 340, 45, '0 0.4em', 420);
    come(L, [one(b, '.pv-iv__cnt'), one(b, '.pv-iv__of')], 460, 80, '0 0.5em');
    rule(L, [one(b, '.pv-iv__bars > .is-on')], 640, 0, 1400);
    add(L, one(b, '.pv-iv__q'), [{ opacity: 0, scale: '0.55', rotate: '-14deg', offset: 0 }], { duration: 900, delay: 160 });
    const words = $(b, '.pv-qw');
    come(L, words, 300, 42, '0 0.45em', 560);
    come(L, [one(b, '.pv-iv__lead figcaption')], 300 + words.length * 42 + 180, 0, '0 0.5em');
    rule(L, [one(b, '.pv-iv__more > .pv-rule')], 560, 0, 900);
    come(L, [...$(b, '.pv-iv__rev'), one(b, '.pv-jump')], 660, 130, '0 0.8em', 700);
  }
  /* «Питання номера»: the title and the card come in, the questions one by one; then (each time the page
     comes into the frame) they open in turn: the card's answers share one cell, so only opacity changes */
  function faq(L, b) {
    come(L, [one(b, '.pv-rh')], 0, 0, '0 0.5em', 600);
    come(L, [one(b, '.pv-faq__ghost')], 0, 0, '0 2cqw', 1200);
    come(L, [one(b, '.pv-faq__side .pv-h2')], 80, 0, '0 0.6em', 800);
    add(L, one(b, '.pv-faq__card'), [{ opacity: 0, translate: '0 1.6cqw' }, { opacity: 1, translate: '0 0' }], { duration: 800, delay: 260 });
    add(L, one(b, '.pv-faq__card > .pv-crop'), [{ opacity: 0, scale: '1.08' }, { opacity: 1, scale: '1' }], { duration: 800, delay: 420 });
    come(L, $(b, '.pv-faq__q'), 200, 90, '2cqw 0', 640);
    come(L, [one(b, '.pv-jump')], 900, 0, '0 0.5em', 600);
  }
  function faqTurns(b) {
    const qs = $(b, '.pv-faq__q'), as = $(b, '.pv-faq__a');
    const open = (k) => { qs.forEach((q, i) => q.classList.toggle('is-on', i === k)); as.forEach((a, i) => a.classList.toggle('is-on', i === k)); };
    let tm = [];
    return {
      enter() { tm.forEach(clearTimeout); tm = qs.slice(1).map((q, k) => setTimeout(() => open(k + 1), 600 + k * 750)); },
      leave() { tm.forEach(clearTimeout); tm = []; open(0); },
    };
  }
  /* the tapes slide in across the page; under «Анімація» their words run, the two the opposite ways, only
     while the tapes are in the frame */
  function ribbon(L, b) {
    add(L, one(b, '.pv-tape--a'), [{ translate: '-8cqw 0', opacity: 0, offset: 0 }], { duration: 900, delay: 0 });
    add(L, one(b, '.pv-tape--b'), [{ translate: '8cqw 0', opacity: 0, offset: 0 }], { duration: 900, delay: 120 });
  }
  function ribbonRuns(b) {
    const runs = $(b, '.pv-tape__run').map((r, k) => {
      const a = r.animate(k ? [{ translate: '-50% 0' }, { translate: '0 0' }] : [{ translate: '0 0' }, { translate: '-50% 0' }], { duration: k ? 26000 : 30000, iterations: Infinity, easing: 'linear' });
      a.pause();
      return a;
    });
    st.loops.push(...runs);
    return { enter() { runs.forEach((a) => a.play()); }, leave() { runs.forEach((a) => a.pause()); } };
  }
  /* the coupon: the cut line's scissors travel to their place, the paper comes up, the fields slide in and
     their lines run, then the button; the stub's barcode is scanned */
  function coupon(L, b) {
    add(L, one(b, '.pv-cutl__sc'), [{ opacity: 0, translate: '40cqw 0', offset: 0 }, { opacity: 1, offset: 0.15 }], { duration: 1200, delay: 0, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
    add(L, one(b, '.pv-cp'), [{ opacity: 0, translate: '0 2.4cqw' }, { opacity: 1, translate: '0 0' }], { duration: 800, delay: 120 });
    come(L, [one(b, '.pv-cp__k'), one(b, '.pv-cp__t .pv-h2'), one(b, '.pv-cp__t p')], 260, 90, '0 0.6em', 700);
    $(b, '.pv-cf').forEach((fld, i) => {
      add(L, fld, [{ opacity: 0, translate: '-3cqw 0' }, { opacity: 1, translate: '0 0' }], { duration: 700, delay: 420 + i * 130 });
      rule(L, [one(fld, '.pv-rule')], 500 + i * 130, 0, 800);
    });
    come(L, [one(b, '.pv-cp__f .pv-btn'), one(b, '.pv-form__note')], 740, 90, '0 0.7em');
    come(L, [one(b, '.pv-cp__stub > div')], 600, 0, '0 0.6em', 700);
    scan(L, one(b, '.pv-cp__stub .pv-bar'), 900);
  }
  /* the back cover: the sign-off's rule runs, the columns come up, the masthead's letters rise out of the
     page's foot again */
  function back(L, b) {
    rule(L, [one(b, '.pv-back__sign > .pv-rule')], 0, 0, 1100);
    come(L, [one(b, '.pv-back__sign p'), one(b, '.pv-back__sign > span')], 120, 120, '0 0.5em', 700);
    come(L, [...$(b, '.pv-back__grid > div'), one(b, '.pv-back__foot')], 260, 80, '0 0.8em', 640);
    rise(L, $(b, '.pv-back__mast .pv-cut__i'), 420, 55, 900);
  }
  const PLAN = { toc, rent, steps, gal: gallery, iv: interview, faq, rib: ribbon, form: coupon, colo: back };
  // what happens each time a block comes into the frame and leaves it (not just once)
  const TURNS = { faq: faqTurns, rib: ribbonRuns };

  function check() {
    if (!st.on || !st.live) return;
    const v = vp.getBoundingClientRect();
    const line = v.bottom - v.height * 0.14;
    for (const b of st.blocks) {
      const r = b.el.getBoundingClientRect();
      if (!b.played && r.top <= line) {
        b.played = true;
        b.L.forEach((a) => a.play());
        b.go?.();
      }
      if (b.turns) {
        const inView = r.top <= line && r.bottom >= v.top + v.height * 0.12;
        if (inView !== b.inView) { b.inView = inView; inView ? b.turns.enter() : b.turns.leave(); }
      }
    }
    if (st.blocks.every((b) => b.played && !b.turns)) poll(false);
  }
  function poll(on) {
    if (on && !st.poll && st.blocks.some((b) => !b.played || b.turns)) st.poll = setInterval(check, 160);
    if (!on && st.poll) { clearInterval(st.poll); st.poll = 0; }
  }
  function arm() {
    const L = [];
    cover(L);
    st.blocks = $(site, '[data-c]').map((el) => {
      const B = { el, L: [], played: false, inView: false };
      PLAN[el.dataset.c]?.(B.L, el);
      if (TURNS[el.dataset.c]) B.turns = TURNS[el.dataset.c](el);
      // the numbers count only once their block is in the frame (until then their cells show the final value)
      if (el.dataset.c === 'iv') B.go = () => count($(el, '.pv-iv__score .rb-num'), 0.25);
      if (el.dataset.c === 'rent') B.go = () => count($(el, '.pv-cell__six .rb-num'), 0.5);
      B.L.forEach((a) => a.pause());
      return B;
    });
    st.hero = L;
  }
  function disarm() {
    poll(false);
    st.hero?.forEach((a) => a.cancel());
    st.blocks.forEach((b) => { b.L.forEach((a) => a.cancel()); if (b.inView) b.turns?.leave(); });
    st.blocks = [];
    st.loops.forEach((a) => a.cancel());
    st.loops = [];
    st.counts.forEach((stop) => stop());
    st.counts = [];
    hero?.querySelector('.pv-stk')?.classList.remove('is-spin');
  }
  return {
    start() {
      if (st.on) return;
      st.on = true;
      site.classList.add('rb-on');
      arm();
      check();
      poll(true);
    },
    replay() { if (!st.on) return; disarm(); arm(); check(); poll(true); },
    rotate() {},
    draw() {},
    // out of view (or a hidden tab): no checks, and the tapes stop where they are
    pause() { st.live = false; poll(false); st.loops.forEach((a) => a.pause()); },
    play() { st.live = true; if (st.on) { st.blocks.forEach((b) => { if (b.inView && b.turns) { b.inView = false; } }); check(); poll(true); } },
    stop() {
      if (!st.on) return;
      st.on = false;
      disarm();
      site.classList.remove('rb-on');
    },
    destroy() { this.stop(); },
  };
}

/* ---------- the sample site: start, stop, replay ---------- */
export function mountRb(site) {
  // the studio's Авторський («Синя година») has its own choreography (above)
  if (site.querySelector('[data-choreo="cover"]')) return mountCover(site);
  const hero = site.querySelector('[data-hero]');
  const h1 = hero?.querySelector('.pv-h1, .pv-bigname[data-rot]');
  const cta = hero?.querySelector('[data-cta]');
  const shine = hero?.querySelector('[data-shine]');
  const rot = site.querySelector('.rb-rot');
  const logos = site.querySelector('.rb-loop');
  const nums = [...site.querySelectorAll('.rb-num')];
  const st = { loop: null, counts: [], blur: [], icon: 0, on: false };
  const blur = !site.matches('.pv-site--b.pv-site--landing'); // «Денне світло»: no filter in the sample

  function counts() {
    st.counts.forEach((stop) => stop());
    st.counts = nums.map((n, k) => countUp(n, { duration: 1.6, delay: 0.15 + k * 0.08 }));
  }
  return {
    start() {
      if (st.on) return;
      st.on = true;
      site.classList.add('rb-on');
      cta?.classList.add('rb-star');
      shine?.classList.add('rb-shine');
      if (logos) st.loop = logoLoop(logos);
      this.replay();
    },
    /** the hero comes in again: words blur in, numbers count up */
    replay() {
      if (!st.on) return;
      st.blur.forEach((a) => a.cancel());
      st.blur = h1 ? blurText(h1, { blur }) : [];
      counts();
    },
    rotate() { if (st.on && rot) rotateText(rot); },
    /** the next icon in view draws itself and bounces */
    draw(inView) {
      if (!st.on) return;
      const list = [...site.querySelectorAll('[data-ico]')].filter(inView);
      if (list.length) drawIcon(list[st.icon++ % list.length]);
    },
    pause() { st.loop?.pause(); },
    play() { st.loop?.play(); },
    stop() {
      if (!st.on) return;
      st.on = false;
      site.classList.remove('rb-on');
      cta?.classList.remove('rb-star');
      shine?.classList.remove('rb-shine');
      st.loop?.stop();
      st.loop = null;
      st.blur.forEach((a) => a.cancel());
      st.counts.forEach((stop) => stop());
      if (rot) resetRotate(rot);
    },
    destroy() { this.stop(); },
  };
}
