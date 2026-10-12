/*
 * 5 Чому Lumera on phones (≤ 600 px): «Плавна стрічка», the owner's pick of 10 Oct 2026 (prototype ?b5=h3).
 * Desktop and tablets keep the table and its relay (why-orbit.js) exactly as they are.
 *
 * The four links are cards on one horizontal strip. The panel is CSS sticky (no pin: nothing is spaced
 * by script); while it is held, the page's own vertical scroll moves the strip sideways, one card after
 * another; after the last card the page goes on to 6 · Ціни. One ScrollTrigger spans exactly the time
 * the panel is held and turns that scroll into the strip's place. The scroll stays the browser's own:
 * no snap, no scrollTo while the finger moves.
 * The strip follows the scroll softly, through two smoothing stages in a row (a critically damped
 * spring: it starts from standstill, speeds up, slows down, no overshoot), in rAF only while there is a
 * way to cover: at rest nothing runs. When the scroll stops, the strip lands on the nearest whole card
 * (the page itself is never moved) and holds it until the scroll goes past it. A card in its place plays
 * its glyph's story (why-orbit.js STORIES) once per arrival; «1 / 4» and four dashes under the strip.
 * The cards are the list a screen reader reads here (the table is display: none ≤ 600 px); a card that
 * takes the keyboard focus is brought into its place. Only transform and opacity animate.
 * Reduced motion: the four cards one under another, nothing held, nothing moves.
 */
import { STORIES, playStory } from './why-orbit.js';
import { ScrollTrigger as ST } from '@/lib/gsap';

/** Clone the table's glyph into every empty [data-glyph] slot under `scope`; the slot takes its link
 *  from the nearest [data-link]. One source for every glyph. */
function fillGlyphs(why, scope) {
  const src = new Map([...why.querySelectorAll('.w5-row')].map((r) => [r.dataset.link, r.querySelector('.w5-glyph svg')]));
  for (const slot of scope.querySelectorAll('[data-glyph]')) {
    const svg = src.get(slot.dataset.glyph || slot.closest('[data-link]')?.dataset.link);
    if (svg && !slot.firstElementChild) slot.append(svg.cloneNode(true));
  }
}

/* The strip's settings (the prototype's defaults the owner chose). Each card's share of the scroll (STEP,
   about one flick) and the rests at the strip's two ends are in css/why-orbit.css (--step 100 svh, --rest
   12 svh). 110 svh a card with 12 svh rests would hold the block 3.54 screens, so the step stays 100 svh. */
const SCRUB = 0.68;  // s: the strip covers 95 % of its way to the scroll's place
const SETTLE = 0.5;  // s: the same, for the landing on a whole card once the scroll stops
const SOFT = 0.85;   // the first smoothing stage's time against the second's (0: a single catch-up)
const STILL = 140;   // ms without scroll that count as «the scroll has stopped»
const REST = 0.1;    // the part of each card's step where the strip holds still on that card
const ease = (t) => t * t * (3 - 2 * t);
// time constants: one stage covers 95 % in 3 τ, two equal stages in 4.74 τ (between: about linear)
const tauFor = (t95) => t95 / (3 + 1.74 * SOFT);

export function mountHScroll(why, { reducedMotion = false } = {}) {
  const root = why?.querySelector('[data-why-hs]');
  if (!root) return null;
  fillGlyphs(why, root);
  const stick = root.querySelector('.w5-hs__stick');
  const track = root.querySelector('.w5-hs__track');
  const cards = [...root.querySelectorAll('.w5-hcard')];
  const bars = [...root.querySelectorAll('.w5-hs__dashes b')];
  const count = root.querySelector('.w5-hs__count b');
  const n = cards.length;
  const tau = tauFor(SCRUB);
  const tauSettle = tauFor(SETTLE);
  const ScrollTrigger = ST;
  if (reducedMotion || !ScrollTrigger || n < 2) {
    root.classList.add('is-still');
    cards.forEach((c) => c.classList.add('is-on'));
    return { destroy() {} };
  }

  let step = 0;     // px from one card's place to the next
  let restPx = 0;   // the runway's rest at each end, px
  let x = -1;       // where the strip is: 0 … n − 1 (cards)
  let on = -1;      // the card that is in place
  let played = -1;  // the card whose story has played since it came
  const measure = () => {
    step = cards[1].offsetLeft - cards[0].offsetLeft;
    restPx = parseFloat(getComputedStyle(root).getPropertyValue('--rest')) / 100 * (window.visualViewport?.height || innerHeight);
  };
  /** the strip's position for the progress p (0 … 1) of the held time */
  function at(p, span) {
    const d = span > 0 ? Math.min(0.3, restPx / span) : 0;
    const u = Math.min(1, Math.max(0, (p - d) / (1 - 2 * d))) * (n - 1);
    const k = Math.min(n - 2, Math.floor(u));
    const f = u - k;
    const h = REST / 2;
    return k + (f <= h ? 0 : f >= 1 - h ? 1 : ease((f - h) / (1 - REST)));
  }
  /** the scroll position where card k rests in its place */
  function placeOf(k, t) {
    const span = t.end - t.start;
    const d = span > 0 ? Math.min(0.3, restPx / span) : 0;
    return Math.round(t.start + (d + (k / (n - 1)) * (1 - 2 * d)) * span);
  }
  function draw(pos) {
    if (pos === x) return;
    x = pos;
    track.style.transform = `translate3d(${(-x * step).toFixed(1)}px, 0, 0)`;
    bars.forEach((b, k) => { if (k) b.style.transform = `scaleX(${Math.min(1, Math.max(0, x - k + 1)).toFixed(3)})`; });
    const near = Math.round(x);
    if (near !== on) {
      on = near;
      cards.forEach((c, k) => c.classList.toggle('is-on', k === on));
      count.textContent = String(on + 1);
    }
    // the card is in its place: its glyph tells its story (once per arrival)
    if (Math.abs(x - on) < 0.001 && played !== on) {
      played = on;
      cards.forEach((c) => c.classList.remove('is-accent'));
      const c = cards[on];
      playStory(c.querySelector('svg'), STORIES[c.dataset.link], { onAccent: () => c.classList.add('is-accent') });
    } else if (Math.abs(x - on) > 0.25 && played === on) played = -1;
  }
  // where the panel has room, the block's head is held in it too (the title and the card together);
  // where it hasn't (a short screen, Safari's bars shown), the head scrolls away and the strip is held alone
  const head = why.querySelector('.s-head');
  const home = head?.parentElement;
  const view = root.querySelector('.w5-hs__view');
  const ctrl = root.querySelector('.w5-hs__ctrl');
  const placeHead = () => {
    if (!head) return false;
    const was = head.parentElement === stick;
    const gap = parseFloat(getComputedStyle(stick).rowGap) || 0;
    const headH = head.offsetHeight + (parseFloat(getComputedStyle(head).marginBottom) || 0);
    const fits = headH + view.offsetHeight + ctrl.offsetHeight + gap * 2 + 24 <= stick.clientHeight;
    if (fits && !was) stick.prepend(head);
    if (!fits && was) home.prepend(head);
    root.classList.toggle('has-head', head.parentElement === stick);
    return was !== (head.parentElement === stick);
  };
  placeHead();
  let lastH = stick.clientHeight;
  const ro = new ResizeObserver(() => {
    if (stick.clientHeight === lastH) return;
    lastH = stick.clientHeight;
    if (placeHead()) ScrollTrigger.refresh();
  });
  ro.observe(stick);

  /* the strip catches up with the scroll (cur → target) through two stages (mid, then cur), in rAF only
     while there is a way to go */
  let cur = 0;
  let mid = 0;
  let target = 0;
  let raf = 0;
  let last = 0;
  let idle = 0;
  let latch = null; // the whole card the strip settled on; held until the scroll goes past it
  let tc = tau;     // the time constant now: following the scroll, or landing (quicker)
  const loop = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    mid += (target - mid) * (1 - Math.exp(-dt / (tc * SOFT)));
    cur += (mid - cur) * (1 - Math.exp(-dt / tc));
    if (Math.abs(target - cur) < 0.002 && Math.abs(target - mid) < 0.002) cur = mid = target;
    draw(cur);
    raf = cur === target ? 0 : requestAnimationFrame(loop);
  };
  const go = (to, landing = false) => {
    target = to;
    tc = landing ? tauSettle : tau;
    if (!raf && target !== cur) { last = performance.now(); raf = requestAnimationFrame(loop); }
  };
  function follow(pos, dir) {
    if (latch !== null) {
      // after a landing the strip stays on its card until the scroll goes past it, in either way
      if ((dir > 0 && pos < latch) || (dir < 0 && pos > latch)) pos = latch;
      else latch = null;
    }
    go(pos);
    clearTimeout(idle);
    // the scroll has stopped: glide on to the nearest whole card (the page doesn't move)
    idle = setTimeout(() => { latch = Math.round(pos); go(latch, true); }, STILL);
  }
  measure();
  const st = ScrollTrigger.create({
    trigger: root,
    start: () => `top top+=${stick.offsetTop + parseFloat(getComputedStyle(stick).top)}`,
    end: () => `bottom top+=${parseFloat(getComputedStyle(stick).top) + stick.offsetHeight}`,
    onRefresh: (self) => {
      measure();
      x = -1;
      cur = mid = target = at(self.progress, self.end - self.start);
      latch = null;
      draw(cur);
    },
    onUpdate: (self) => follow(at(self.progress, self.end - self.start), self.direction),
  });
  // keyboard: a card that takes the focus is brought into its place (the page scrolls to it)
  cards.forEach((c, k) => c.addEventListener('focus', () => window.scrollTo({ top: placeOf(k, st), behavior: 'instant' })));
  cur = mid = target = at(st.progress, st.end - st.start);
  draw(cur);
  return {
    st,
    get running() { return Boolean(raf); },
    /** QA: where the strip is (0 … n − 1) and the scroll position of card k's place */
    get x() { return x; },
    placeOf: (k) => placeOf(k, st),
    destroy() { st.kill(); ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(idle); },
  };
}
