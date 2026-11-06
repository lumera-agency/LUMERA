/*
 * TEMPORARY · whole-page variant C's own scenes (?p=c), started after the page's shared runtime (about-runtime.js).
 * Motion rules as the page's: transform and opacity only, once each, nothing at rest, reduced motion = the final frame.
 * The CSS default of every part is its final frame (pc.css); `.is-pre` holds a scene's start, set only on what is still
 * below the screen, and `.is-play` runs its CSS timeline from there.
 *
 * · «Естафета» (the rail's cast): one ember marker on the role at work on the step being read. The hero, the five scenes
 *   and the ivory block cross the screen's middle line (IntersectionObserver); the marker moves to that row (FLIP:
 *   each row holds its own marker, only the active one shows, and it slides in from where the last one was, so it reads
 *   as one and needs no measuring on resize). The active tag settles once (Shuffle). Wide screens only; phones keep it
 *   on «Ви».
 * · The scenes (block 2): each plays once when its window has been half in view for 150 ms (a jump from the menu runs
 *   past them), or at 40 % on phones, one at a time in a queue. As a scene ends, while its window is still in view, its
 *   document's chip flies to its slot in the rail's folder (a clone, translate only); otherwise the slot just fills.
 * · The handover (block 3): once its folder is in full view, the landed chips fly from the rail into the ivory folder
 *   (the light text giving way to the dark), the rail's slots go empty; then the fifth document, the sweep behind «на
 *   вас», the team's signature (CSS). Arriving there directly (a reload, the menu) shows its final frame.
 */
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const WIDE = '(min-width: 861px)';
/** the rail is sticky (pc.css) only where it fits under the topbar: flights only there */
const RAIL = '(min-width: 861px) and (min-height: 700px)';
/** each scene's timeline (pc.css), wide screens and phones, in ms */
const SCENES = { 1: [2000, 2000], 2: [950, 700], 3: [1550, 1100], 4: [2700, 2100], 5: [2150, 700] };
const FLY = 560;
const HAND = 600;
/** how long a slot's title takes to come in (pc.css: .pc-slot's transition) */
const FADE = 180;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const below = (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

let started = false;
export function start() {
  if (started) return;
  const main = $('main.about[data-about-p="c"]');
  if (!main) return;
  started = true;
  // after the shared runtime has put the visitor back where they were (a reload, a language switch) and the faces are in
  const go = () => requestAnimationFrame(() => requestAnimationFrame(() => run(main)));
  (document.fonts?.ready ?? Promise.resolve()).then(go, go);
}

function run(main) {
  const ctx = {
    main,
    motion: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    wide: window.matchMedia(WIDE).matches,
    rail: $('.pc-rail', main),
    handed: false,
    setActive: () => {},
    queue: phoneQueue(),
  };
  ctx.setActive = initCast(ctx);
  initKeys(ctx);
  initScenes(ctx);
  initMarker(ctx);
}

/* ---------- one scene at a time on phones: the next waits until the one playing has ended ---------- */
function phoneQueue() {
  const waiting = [];
  let busy = false;
  const pump = () => {
    if (busy || !waiting.length) return;
    busy = true;
    waiting.shift()(() => {
      busy = false;
      pump();
    });
  };
  return (fn) => {
    waiting.push(fn);
    pump();
  };
}

/* ---------- (React Bits' Shuffle, as the page's labels) a mono label's letters shuffle once and settle: each letter on
   a short strip of random ones with its own on top, the strip sliding down to it (transform only; the mono face keeps
   every width). Screen readers keep the text; the plain text comes back once the strips have played ---------- */
const ABC = { uk: 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ', ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' };
const STEPS = 6;
function shuffle(label, delay = 0) {
  if (!label || label.querySelector('.about-sh')) return;
  const abc = ABC[document.documentElement.lang] ?? ABC.uk;
  const text = label.textContent;
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = text;
  const shown = document.createElement('span');
  shown.setAttribute('aria-hidden', 'true');
  const runs = [];
  [...text].forEach((ch, i) => {
    if (!/\p{L}/u.test(ch)) {
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
      { duration: 560, delay: delay + i * 28, easing: EASE_OUT, fill: 'backwards' },
    ));
  });
  label.replaceChildren(sr, shown);
  const done = () => { label.textContent = text; };
  Promise.all(runs.map((r) => r.finished)).then(done, done);
}

/* ---------- the cast: the marker's row, and the tags settling once ---------- */
function initCast({ rail, motion }) {
  if (!rail) return () => {};
  const rows = $$('.pc-cast__row', rail);
  const byRole = new Map(rows.map((row) => [row.dataset.role, row]));
  let current = rows.find((row) => row.classList.contains('is-on')) ?? byRole.get('you');
  const settled = new Set([current]);
  // on load the rows come in one after another from the first paint (pc.css) and their tags settle with them
  if (motion && rail.getBoundingClientRect().top < window.innerHeight) {
    rows.forEach((row, i) => shuffle($('.pc-cast__tag', row), 450 + i * 80));
  }
  return (role) => {
    const next = byRole.get(role);
    if (!next || next === current) return;
    const from = $('.pc-marker', current).getBoundingClientRect().top;
    current.classList.remove('is-on');
    next.classList.add('is-on');
    current = next;
    if (!motion) return;
    const marker = $('.pc-marker', next);
    const dy = from - marker.getBoundingClientRect().top;
    if (Math.abs(dy) > 0.5) marker.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration: 520, easing: EASE_OUT });
    if (!settled.has(next)) {
      settled.add(next);
      shuffle($('.pc-cast__tag', next));
    }
  };
}

/* ---------- who works on the step being read: the block or scene on the screen's middle line ---------- */
function initMarker({ main, setActive }) {
  const wide = window.matchMedia(WIDE);
  const roles = new Map();
  const hero = $('#team', main);
  const keys = $('#keys', main);
  const scenes = $$('[data-pc-scene]', main);
  if (hero) roles.set(hero, 'you');
  scenes.forEach((scene) => roles.set(scene, scene.dataset.role));
  if (keys) roles.set(keys, 'you');
  const io = new IntersectionObserver((entries) => {
    if (!wide.matches) return;
    const on = entries.find((entry) => entry.isIntersecting);
    if (on) setActive(roles.get(on.target));
    // above the first step (the first screen is shorter than half a screen, block 2's head): «Ви»; between two steps
    // the last one stays
    else if (scenes[0] && scenes[0].getBoundingClientRect().top > window.innerHeight / 2) setActive('you');
  }, { rootMargin: '-50% 0px -50% 0px' });
  roles.forEach((_, el) => io.observe(el));
  // phones keep the card's marker on «Ви» (the first screen)
  wide.addEventListener('change', () => { if (!wide.matches) setActive('you'); });
}

/* ---------- a chip's flight: a fixed clone (in main, so the page's styles hold) from one rect to the other, translate
   only, the same size; `dark`: the landing chip's own look, crossfaded in on the way (the dark rail → the ivory).
   `track`: one end stays on the screen (the sticky rail) while the other scrolls with the page (the ivory folder), and a
   flight that starts mid-scroll (Lenis glides on after the wheel) would land where the cell was; so each frame the clone
   goes its share of the way between where both ends are now (a translate per frame, for the flight only) ---------- */
const easeOut = (p) => 1 - (1 - p) ** 4;
function flyChip(main, from, to, { duration, delay = 0, dark = false, track = false }) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const fly = document.createElement('span');
  fly.className = 'pc-fly';
  fly.setAttribute('aria-hidden', 'true');
  const light = from.cloneNode(true);
  fly.append(light);
  const landing = dark ? to.cloneNode(true) : null;
  if (landing) fly.append(landing);
  fly.style.left = `${a.left}px`;
  fly.style.top = `${a.top}px`;
  main.append(fly);
  const timing = { duration, delay, fill: 'both' };
  // the clone gives way to the real chip over the flight's last 160 ms, so a scroll meanwhile never shows a jump
  fly.animate([{ opacity: 1 }, { opacity: 1, offset: (duration - 160) / duration }, { opacity: 0 }], timing);
  if (landing) {
    light.animate([{ opacity: 1 }, { opacity: 0 }], timing);
    landing.animate([{ opacity: 0 }, { opacity: 1 }], timing);
  }
  const gone = () => fly.remove();
  if (!track) {
    const move = fly.animate([{ translate: '0 0' }, { translate: `${b.left - a.left}px ${b.top - a.top}px` }], { ...timing, easing: EASE_OUT });
    move.finished.then(gone, gone);
    return;
  }
  const t0 = performance.now() + delay;
  const step = (now) => {
    const p = Math.min(1, Math.max(0, (now - t0) / duration));
    const k = easeOut(p);
    const s = from.getBoundingClientRect();
    const e = to.getBoundingClientRect();
    fly.style.translate = `${s.left - a.left + (e.left - s.left) * k}px ${s.top - a.top + (e.top - s.top) * k}px`;
    if (p < 1) requestAnimationFrame(step);
    else gone();
  };
  requestAnimationFrame(step);
}

/* ---------- a rail slot's title: in (now, or with its short fade), or out at once ---------- */
const slotOf = (ctx, n) => ctx.rail && $(`.pc-slot[data-slot="${n}"]`, ctx.rail);
function fill(ctx, n, fade) {
  const slot = slotOf(ctx, n);
  if (!slot || slot.classList.contains('is-full')) return;
  if (!fade || !ctx.motion) {
    slot.classList.add('is-now');
    requestAnimationFrame(() => requestAnimationFrame(() => slot.classList.remove('is-now')));
  }
  slot.classList.add('is-full');
}
function empty(slot) {
  slot.classList.add('is-now');
  slot.classList.remove('is-full');
  requestAnimationFrame(() => requestAnimationFrame(() => slot.classList.remove('is-now')));
}

/* ---------- block 2's scenes ---------- */
function initScenes(ctx) {
  const { main, motion, wide } = ctx;
  $$('[data-pc-scene]', main).forEach((scene) => {
    const n = Number(scene.dataset.pcScene);
    const slot = Number(scene.dataset.slot) || 0;
    // what this width shows of the scene: its window, or on phones S2's and S5's picture
    const view = $$('[data-pc-view]', scene).find((el) => el.getClientRects().length) ?? scene;
    // on the screen or passed at load: the final frame, its document already in the folder (unless handed over)
    if (!below(view)) {
      if (slot && !ctx.handed) fill(ctx, slot, false);
      return;
    }
    if (!motion) {
      // reduced motion: no scene, the slot's title comes in, with no transition, as the scene reaches the screen
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (slot && !ctx.handed) fill(ctx, slot, false);
      });
      io.observe(view);
      return;
    }
    scene.classList.add('is-pre');
    let seen = false;
    let played = false;
    let dwell = 0;
    const finish = () => {
      io.disconnect();
      if (!slot || ctx.handed) return;
      const from = $('.pc-win__tab .pc-chip', scene);
      const target = slotOf(ctx, slot);
      if (wide && seen && from && target && window.matchMedia(RAIL).matches) {
        flyChip(main, from, $('.pc-chip', target), { duration: FLY });
        setTimeout(() => fill(ctx, slot, true), FLY - FADE);
      } else fill(ctx, slot, true);
    };
    const play = (done) => {
      // (a phone's queue: the scene was passed while it waited) its final frame
      if (view.getBoundingClientRect().bottom < 0) {
        scene.classList.remove('is-pre');
        finish();
        done?.();
        return;
      }
      scene.classList.remove('is-pre');
      scene.classList.add('is-play');
      shuffle($('.pc-key__w', scene));
      if (n === 3 && wide) flyWords(scene);
      setTimeout(() => {
        finish();
        done?.();
      }, SCENES[n][wide ? 0 : 1]);
    };
    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (wide) {
        seen = entry.intersectionRatio >= 0.5;
        clearTimeout(dwell);
        if (seen && !played) {
          dwell = window.setTimeout(() => {
            played = true;
            play();
          }, 150);
        }
      } else if (!played && entry.intersectionRatio >= 0.4) {
        played = true;
        io.disconnect();
        ctx.queue(play);
      }
    }, { threshold: [0, 0.4, 0.5] });
    io.observe(view);
  });
}

/* ---------- S3, wide screens: the client's word flies from the note into the two layouts' buttons (clones inside the
   window, translate only: the same 14 px in both places); the buttons' own words show as they land (pc.css) ---------- */
function flyWords(scene) {
  const body = $('.pc-win__body', scene);
  const word = $('.pc-s3__word', scene);
  const targets = $$('.pc-btn__w', scene).filter((el) => el.getClientRects().length);
  if (!body || !word || !targets.length) return;
  setTimeout(() => {
    const box = body.getBoundingClientRect();
    const a = word.getBoundingClientRect();
    targets.forEach((target, i) => {
      const b = target.getBoundingClientRect();
      const clone = document.createElement('span');
      clone.className = 'pc-s3__fly';
      clone.setAttribute('aria-hidden', 'true');
      clone.textContent = word.textContent;
      clone.style.left = `${a.left - box.left}px`;
      clone.style.top = `${a.top - box.top}px`;
      body.append(clone);
      const run = clone.animate(
        [{ translate: '0 0' }, { translate: `${b.left - a.left}px ${b.top - a.top}px` }],
        { duration: 650 - i * 60, delay: i * 60, easing: EASE_OUT, fill: 'both' },
      );
      const gone = () => clone.remove();
      run.finished.then(gone, gone);
    });
  }, 400);
}

/* ---------- block 3, the handover ---------- */
function initKeys(ctx) {
  const { main, motion, wide } = ctx;
  const keys = $('#keys', main);
  const row = keys && $('.pc-cells', keys);
  if (!row) return;
  // arrived at it or past it: its final frame, the rail's folder already given over (reduced motion keeps the slots)
  if (!below(row)) {
    ctx.handed = motion;
    return;
  }
  if (!motion) return;
  keys.classList.add('is-pre');
  const io = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (!entry.isIntersecting) return;
    const whole = entry.intersectionRatio >= 0.99 || entry.boundingClientRect.bottom < window.innerHeight * 0.92;
    if (wide ? !whole : entry.intersectionRatio < 0.4) return;
    io.disconnect();
    if (wide) handOver(ctx, keys);
    else {
      ctx.handed = true;
      ctx.queue((done) => {
        keys.classList.remove('is-pre');
        keys.classList.add('is-play');
        setTimeout(done, 1600);
      });
    }
  }, { threshold: [0, 0.4, 0.99, 1] });
  io.observe(row);
}

function handOver(ctx, keys) {
  ctx.handed = true;
  ctx.setActive('you');
  const fly = Boolean(ctx.rail) && window.matchMedia(RAIL).matches;
  if (fly) keys.classList.add('is-fly');
  $$('.pc-cell:not(.pc-cell--keys)', keys).forEach((cell, i) => {
    const slot = slotOf(ctx, cell.dataset.cell);
    if (!fly) {
      if (slot) empty(slot);
      return;
    }
    const delay = i * 70;
    const chip = $('.pc-chip', cell);
    if (slot && slot.classList.contains('is-full') && chip) {
      flyChip(ctx.main, $('.pc-chip', slot), chip, { duration: HAND, delay, dark: true, track: true });
      empty(slot);
      cell.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: delay + HAND - 160, fill: 'backwards' });
    } else {
      // its chip never landed (a jump past its scene): it comes in in place
      cell.animate([{ opacity: 0, translate: '0 -8px' }, { opacity: 1, translate: '0 0' }], { duration: 400, delay, easing: EASE_OUT, fill: 'backwards' });
    }
  });
  keys.classList.remove('is-pre');
  keys.classList.add('is-play');
}
