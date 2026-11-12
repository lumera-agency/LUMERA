/*
 * 5 · Підхід, the block's behaviour (ported 1:1 from website-v2/js/sections.js, framework-free):
 *   initStages  ≥ 1101 px with motion: a deck pinned while the page runs on — each next stage slides
 *               up over the last, the ones below step back to thin edges; otherwise a list whose line
 *               fills with the scroll and each node lights as the line passes it
 *   initChecks  the «before launch» checks tick one by one as the stage comes up
 *   deckProgress() where the deck is, in stages (0 … 5, scrubbed): the stone beside it takes its pose from it
 * The deck turns one stage per wheel gesture (fx/scroll-paging).
 * initApproach(section) works on that section's DOM and returns a stop() that undoes it all: the
 * page's language switch swaps the whole tree, and the new block starts again on its own.
 */
import { gsap as GSAP, ScrollTrigger as ST } from '@/lib/gsap';
import { dpx, topbarHeight } from '@/lib/css';
import { initPaging } from '@/components/fx/scroll-paging/paging.js';
import { switching } from '@/lib/place';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let progressOf = () => 0;
export const deckProgress = () => progressOf();

export const DECK_IN = [0.1, 0.55]; // where in its step a card slides in (fractions of the step)
export const DECK_REST = 0.85;      // where in its step the deck rests: the card down, the stone turned
const DECK_RUN = 2.2;        // how long the block holds while the cards flip, in screen heights
const AFTER_RISE = 24;       // px, after launch comes up from this far below its place
const deckWide = window.matchMedia('(min-width: 1101px)');
const deckOn = () => deckWide.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** A change made at once, the transitions of `held` off for that moment: after a language switch what the visitor
 *  saw before it (ticked points, lit nodes, a picture at rest) is simply there again (lib/place). */
export function atOnce(change, held) {
  held.forEach((el) => el.style.setProperty('transition', 'none'));
  change();
  void document.documentElement.offsetWidth; // the new state is computed while the transitions are off
  held.forEach((el) => el.style.removeProperty('transition'));
}

function markDeck(root) {
  root?.classList.toggle('is-deck', deckOn());
}

function initStages(root, gsap = GSAP, ScrollTrigger = ST) {
  if (!root) return null;
  const triggers = [];
  // the list's guide line and nodes appear when the stone steps onto it (journey:lane);
  // without the journey (it attaches a moment after this runs, or never), when the block arrives
  const draw = (on) => root.classList.toggle('is-drawn', on);
  const staged = () => document.documentElement.classList.contains('has-stage');
  const journey = {
    'journey:ready': (e) => draw(e.detail.passed.includes('lane')),
    'journey:lane': () => draw(true),
    'journey:lane:back': () => draw(false),
  };
  for (const [type, fn] of Object.entries(journey)) document.addEventListener(type, fn);
  triggers.push(ScrollTrigger.create({
    trigger: root,
    start: 'top 75%',
    onEnter: () => { if (!staged()) draw(true); },
    onLeaveBack: () => { if (!staged()) draw(false); },
  }));

  const lane = $('.process__lane', root);
  const track = $('.process__track', root);
  const pin = $('.process__pin', root);
  const cards = $$('.stage', root);
  const after = $('.after', root);
  cards.forEach((c, i) => c.style.setProperty('--i', i + 1));

  /* the deck */
  let deck = null;
  let paging = null;
  const content = (card) => [...card.children].filter((el) => !el.classList.contains('stage__node'));
  const titleOffset = () => {
    const t = $('.stage__title', cards[0]);
    return t ? t.offsetTop + t.offsetHeight / 2 : 40;
  };
  // the pin's kill takes its spacer out and puts the section back in its place
  const unbuild = () => {
    paging?.destroy();
    paging = null;
    deck?.scrollTrigger?.kill();
    deck?.kill();
    deck = null;
    gsap.set(cards, { clearProps: 'transform,opacity,visibility,top' });
    if (after) gsap.set(after, { clearProps: 'transform,opacity,visibility' });
    gsap.set(cards.flatMap(content), { clearProps: 'opacity,visibility' });
  };
  const build = () => {
    unbuild();
    markDeck(root);
    if (!root.classList.contains('is-deck') || !track || !pin) return;
    measure();
    // the whole block (heading, cards, stone) holds still under the topbar while the cards
    // flip; the page runs on after DECK_RUN screen heights of scroll
    const section = root.closest('section') || root;
    const bar = () => topbarHeight();
    // the label's distance from the section's top: its padding (a rect would carry the reveal's offset)
    const lead = () => parseFloat(getComputedStyle(section).paddingTop) || 0;
    deck = gsap.timeline({
      defaults: { ease: 'power2.out', duration: DECK_IN[1] - DECK_IN[0] },
      scrollTrigger: {
        trigger: section,
        // the block stops with its label («5 · Підхід») just under the topbar: the section's empty top
        // padding goes up out of view, so the whole deck and the line down to the stone fit on screen
        start: () => `top ${bar() - lead() + dpx(36)}px`,
        end: () => `+=${Math.round(window.innerHeight * DECK_RUN)}`,
        pin: section,
        pinSpacing: true,
        refreshPriority: 1, // the pin's spacer goes in before the triggers below are measured
        scrub: 0.3, // the cards keep close to the scroll: a turned stage is there at once
        invalidateOnRefresh: true,
      },
    });
    // each next card waits just under the one on top, unseen; it appears there and, opaque
    // before it reaches it, slides up over it
    const below = (i) => cards[i - 1].offsetHeight + dpx(20);
    gsap.set(cards.slice(1), { autoAlpha: 0, y: (n) => below(n + 1) });
    deck.set(cards.slice(1), { autoAlpha: 0, y: (n) => below(n + 1) }, 0);
    deck.set(cards.flatMap(content), { autoAlpha: 1 }, 0);
    for (let i = 1; i < cards.length; i++) {
      const at = i + DECK_IN[0];
      deck.to(cards[i], { y: 0, ease: 'power1.inOut' }, at);
      deck.to(cards[i], { autoAlpha: 1, ease: 'none', duration: (DECK_IN[1] - DECK_IN[0]) * 0.25 }, at);
      for (let j = 0; j < i; j++) {
        const depth = i - j;
        // a covered card stays opaque (nothing below shows through it) and only its text
        // goes; it steps back to a thin edge, never far enough to bare its title
        deck.to(cards[j], { y: -8 * Math.min(depth, 3), scale: 1 - 0.02 * Math.min(depth, 3) }, at);
        if (depth === 1) deck.to(content(cards[j]), { autoAlpha: 0, ease: 'power1.in' }, at);
      }
    }
    // after launch comes up only once the last card has slid in
    if (after) {
      gsap.set(after, { autoAlpha: 0, y: AFTER_RISE });
      deck.set(after, { autoAlpha: 0, y: AFTER_RISE }, 0);
      deck.to(after, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.4 }, cards.length - 0.45);
    }
    deck.set({}, {}, cards.length); // five steps, the whole run
    // one wheel gesture, one stage: it rests where a card is down and the stone has turned, the
    // last stop where the run ends (after launch up too)
    paging = initPaging({
      stops: () => {
        const st = deck?.scrollTrigger;
        if (!st) return [];
        const at = (t) => st.start + ((st.end - st.start) * t) / cards.length;
        const list = [0, ...cards.slice(1, -1).map((_, k) => k + 1 + DECK_REST), cards.length].map(at);
        // and one more past the run: the next block's title («Зберіть свій проєкт») a little under the topbar,
        // so the scroll out of the deck stops right at it instead of flying past (the owner, 4 Nov). The same
        // 24 px in PricingClient, which sizes that block's sample to fit under the title
        const next = (section.closest('.pin-spacer') || section).nextElementSibling;
        const head = next?.matches('section') ? next.querySelector('.s-head') : null;
        const title = head?.querySelector('.s-head__title');
        if (title && head.parentElement) {
          // where the title stands unstuck (that block keeps its head pinned as its options scroll): the head is its
          // container's first child
          const titleIn = title.getBoundingClientRect().top - head.getBoundingClientRect().top;
          const at = head.parentElement.getBoundingClientRect().top + (parseFloat(getComputedStyle(head).marginTop) || 0) + titleIn;
          const y = at + window.scrollY - bar() - dpx(24);
          if (y > list[list.length - 1] + 2) list.push(Math.round(y));
        }
        return list;
      },
      duration: 0.75,
    });
  };
  // the stone beside the deck (three/stage-stone, mounted by Approach) takes its pose from here
  const progress = () => (deck ? deck.time() : 0);
  progressOf = progress;
  const onWide = () => {
    build();
    ScrollTrigger.refresh();
  };
  deckWide.addEventListener('change', onWide);

  /* the list (and the deck's measures) */
  let marks = [];
  const measure = () => {
    // the line runs from the first node to the last
    const nodes = cards.map((s) => $('.stage__node', s)).filter(Boolean);
    if (lane && lane.offsetParent && nodes.length > 1 && !root.classList.contains('is-deck')) {
      const from = lane.getBoundingClientRect().top;
      const mid = (n) => {
        const r = n.getBoundingClientRect();
        return r.top + r.height / 2 - from;
      };
      root.style.setProperty('--line-top', `${mid(nodes[0]).toFixed(1)}px`);
      root.style.setProperty('--line-h', `${(mid(nodes[nodes.length - 1]) - mid(nodes[0])).toFixed(1)}px`);
    }
    if (root.classList.contains('is-deck') && pin) {
      // a big screen: the cards' content grows (--deck-k, a zoom) into the room the pinned block
      // leaves under itself, so the deck and the stone fill the screen; a laptop keeps k = 1
      root.style.setProperty('--deck-k', '1');
      const natural = Math.max(...cards.map((c) => c.offsetHeight));
      root.style.setProperty('--deck-h', `${natural}px`);
      const section = root.closest('section') || root;
      const sectionCss = getComputedStyle(section);
      const pinnedTop = topbarHeight() - (parseFloat(sectionCss.paddingTop) || 0) + dpx(36);
      // counted from where after launch waits to come up, whatever the deck shows now (a measure with the page
      // scrolled past the deck would see it risen and give the cards 24 px more)
      const low = after ? AFTER_RISE - (Number(gsap.getProperty(after, 'y')) || 0) : 0;
      const bottom = (after || root).getBoundingClientRect().bottom + low - section.getBoundingClientRect().top;
      const room = window.innerHeight - pinnedTop - bottom - Math.max(dpx(124), window.innerHeight * 0.12);
      const cardCss = getComputedStyle(cards[0]);
      const body = natural - (parseFloat(cardCss.paddingTop) || 0) - (parseFloat(cardCss.paddingBottom) || 0);
      const k = Math.min(1.6, Math.max(1, 1 + room / Math.max(1, body)));
      root.style.setProperty('--deck-k', k.toFixed(3));
      const heights = cards.map((card) => card.offsetHeight);
      const deckH = Math.max(...heights);
      root.style.setProperty('--deck-h', `${deckH}px`);
      // the current stage's title rides at 47% of the view, the stone beside it. Read before the cards are placed, and
      // the cards placed by the heights read above: each card's height read right after the one before was moved laid
      // the page out again card by card (12 Nov 2026: 25 to 47 ms of forced layout in this measure at CPU 4x)
      const bar = topbarHeight();
      const top = Math.max(bar + dpx(24), Math.min(window.innerHeight * 0.47 - titleOffset(), window.innerHeight - pin.offsetHeight - dpx(32)));
      // each card sits centred in the frame, so whichever is on top faces the stone
      cards.forEach((card, index) => { card.style.top = `${Math.round((deckH - heights[index]) / 2)}px`; });
      root.style.setProperty('--pin-top', `${Math.round(top)}px`);
    }
    const top = root.getBoundingClientRect().top;
    // a node the layout hides (the phone stack) has no box, its rect would follow the scroll: it lights nothing
    marks = cards.map((s) => {
      const node = $('.stage__node', s);
      if (node && !node.offsetParent) return Infinity;
      return (node?.getBoundingClientRect().top ?? s.getBoundingClientRect().top) - top + 6;
    });
  };
  measure();
  build();
  ScrollTrigger.addEventListener('refreshInit', measure);
  triggers.push(ScrollTrigger.create({
    trigger: root,
    start: 'top 45%',
    end: 'bottom 45%',
    onUpdate: ({ progress }) => {
      if (root.classList.contains('is-deck')) return;
      const y = progress * (root.clientHeight || 1);
      root.style.setProperty('--p', progress.toFixed(4));
      const light = () => cards.forEach((s, i) => s.classList.toggle('is-on', y >= marks[i]));
      const changes = cards.some((s, i) => s.classList.contains('is-on') !== y >= marks[i]);
      if (changes && switching()) atOnce(light, cards.map((s) => $('.stage__node', s)).filter(Boolean));
      else light();
    },
  }));
  // after launch: its node lights as the row arrives
  if (after) {
    const lightAfter = (on) => {
      const change = () => after.classList.toggle('is-on', on);
      if (switching()) atOnce(change, $$('.stage__node', after));
      else change();
    };
    triggers.push(ScrollTrigger.create({
      trigger: after,
      start: 'top 60%',
      onEnter: () => lightAfter(true),
      onLeaveBack: () => lightAfter(false),
    }));
  }

  return () => {
    for (const [type, fn] of Object.entries(journey)) document.removeEventListener(type, fn);
    deckWide.removeEventListener('change', onWide);
    ScrollTrigger.removeEventListener('refreshInit', measure);
    unbuild();
    triggers.forEach((t) => t.kill());
    if (progressOf === progress) progressOf = () => 0;
  };
}

function initChecks(section, stages, reducedMotion) {
  const lists = $$('[data-checks]', section);
  if (!lists.length) return null;
  const done = new Set();
  const timers = [];
  const tick = (list) => {
    if (done.has(list)) return;
    done.add(list);
    const items = $$('li', list);
    // a language switch: the points the visitor saw ticked are done at once, not ticked again
    if (switching()) atOnce(() => items.forEach((li) => li.classList.add('is-done')), $$('.check, .check svg', list));
    else items.forEach((li, i) => timers.push(setTimeout(() => li.classList.add('is-done'), 150 + i * 260)));
  };
  if (reducedMotion) {
    lists.forEach((list) => $$('li', list).forEach((li) => li.classList.add('is-done')));
    return null;
  }
  const ScrollTrigger = ST;
  const stop = () => timers.forEach(clearTimeout);
  // the deck: a card's points tick as it slides on top (half-way in, by the deck's progress)
  if (stages?.classList.contains('is-deck')) {
    const cards = $$('.stage', stages);
    const sync = () => {
      const p = progressOf();
      let n = 0;
      for (let i = 1; i < cards.length; i++) if (p >= i + (DECK_IN[0] + DECK_IN[1]) / 2) n = i;
      cards.forEach((card, i) => { if (i <= n) $$('[data-checks]', card).forEach(tick); });
    };
    // while the block is on screen (it is pinned for the deck's whole run), each frame asks the deck
    let on = false;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === on) return;
      on = entry.isIntersecting;
      if (on) GSAP.ticker.add(sync);
      else GSAP.ticker.remove(sync);
    }, { rootMargin: '-45% 0px 0px 0px' });
    io.observe(stages.closest('section') || stages);
    return () => {
      io.disconnect();
      GSAP.ticker.remove(sync);
      stop();
    };
  }
  // the list: each card's points tick as the card comes up
  const triggers = lists.map((list) =>
    ScrollTrigger.create({ trigger: list.closest('.stage') || list, start: 'top 45%', once: true, onEnter: () => tick(list) }));
  return () => {
    triggers.forEach((t) => t.kill());
    stop();
  };
}

/** Starts the block on `section` (#approach); returns stop(), which undoes everything it attached. */
export function initApproach(section, { motion, reducedMotion }) {
  const stages = $('[data-stages]', section);
  const stops = [];
  if (motion) {
    markDeck(stages);
    stops.push(initStages(stages)); // first: the deck's turns tell the checks when a card is on top
  }
  stops.push(initChecks(section, stages, reducedMotion));
  return () => stops.forEach((stop) => stop?.());
}
export { deckOn };
