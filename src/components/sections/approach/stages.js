/*
 * 5 · Підхід, the block's behaviour (ported 1:1 from website-v2/js/sections.js, framework-free):
 *   initStages  ≥ 1101 px with motion: a deck pinned while the page runs on — each next stage slides
 *               up over the last, the ones below step back to thin edges; otherwise a list whose line
 *               fills with the scroll and each node lights as the line passes it
 *   initChecks  the «before launch» checks tick one by one as the stage comes up
 *   deckTurns() how many cards have slid in (the stone beside the deck turns a quarter per card)
 */
import { gsap as GSAP, ScrollTrigger as ST } from '@/lib/gsap';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let turnsOf = () => 0;
export const deckTurns = () => turnsOf();

const DECK_IN = [0.1, 0.55]; // where in its step a card slides in (fractions of the step)
const DECK_RUN = 2.2;        // how long the block holds while the cards flip, in screen heights
const deckWide = window.matchMedia('(min-width: 1101px)');
const deckOn = () => deckWide.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function markDeck() {
  $('[data-stages]')?.classList.toggle('is-deck', deckOn());
}

function initStages(gsap = GSAP, ScrollTrigger = ST) {
  const root = $('[data-stages]');
  if (!root) return;
  // the list's guide line and nodes appear when the stone steps onto it (journey:lane);
  // without the journey (it attaches a moment after this runs, or never), when the block arrives
  const draw = (on) => root.classList.toggle('is-drawn', on);
  const staged = () => document.documentElement.classList.contains('has-stage');
  document.addEventListener('journey:ready', (e) => draw(e.detail.passed.includes('lane')));
  document.addEventListener('journey:lane', () => draw(true));
  document.addEventListener('journey:lane:back', () => draw(false));
  ScrollTrigger.create({
    trigger: root,
    start: 'top 75%',
    onEnter: () => { if (!staged()) draw(true); },
    onLeaveBack: () => { if (!staged()) draw(false); },
  });

  const lane = $('.process__lane', root);
  const track = $('.process__track', root);
  const pin = $('.process__pin', root);
  const cards = $$('.stage', root);
  const after = $('.after', root);
  cards.forEach((c, i) => c.style.setProperty('--i', i + 1));

  /* the deck */
  let deck = null;
  const content = (card) => [...card.children].filter((el) => !el.classList.contains('stage__node'));
  const titleOffset = () => {
    const t = $('.stage__title', cards[0]);
    return t ? t.offsetTop + t.offsetHeight / 2 : 40;
  };
  const build = () => {
    deck?.scrollTrigger?.kill();
    deck?.kill();
    deck = null;
    gsap.set(cards, { clearProps: 'transform,opacity,visibility,top' });
    if (after) gsap.set(after, { clearProps: 'transform,opacity,visibility' });
    gsap.set(cards.flatMap(content), { clearProps: 'opacity,visibility' });
    markDeck();
    if (!root.classList.contains('is-deck') || !track || !pin) return;
    measure();
    // the whole block (heading, cards, stone) holds still under the topbar while the cards
    // flip; the page runs on after DECK_RUN screen heights of scroll
    const section = root.closest('section') || root;
    const bar = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 64;
    deck = gsap.timeline({
      defaults: { ease: 'power2.out', duration: DECK_IN[1] - DECK_IN[0] },
      scrollTrigger: {
        trigger: section,
        start: () => `top ${bar()}px`,
        end: () => `+=${Math.round(window.innerHeight * DECK_RUN)}`,
        pin: section,
        pinSpacing: true,
        refreshPriority: 1, // the pin's spacer goes in before the triggers below are measured
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
    // each next card waits just under the one on top, unseen; it appears there and, opaque
    // before it reaches it, slides up over it
    const below = (i) => cards[i - 1].offsetHeight + 20;
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
      gsap.set(after, { autoAlpha: 0, y: 24 });
      deck.set(after, { autoAlpha: 0, y: 24 }, 0);
      deck.to(after, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.4 }, cards.length - 0.45);
    }
    deck.set({}, {}, cards.length); // five steps, the whole run
  };
  // the stone beside the deck (three/stage-stone, mounted by Approach): a quarter turn per card slid in
  turnsOf = () => {
    const t = deck ? deck.time() : 0;
    let n = 0;
    for (let i = 1; i < cards.length; i++) if (t >= i + (DECK_IN[0] + DECK_IN[1]) / 2) n = i;
    return n;
  };
  deckWide.addEventListener('change', () => {
    build();
    ScrollTrigger.refresh();
  });

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
      const deckH = Math.max(...cards.map((c) => c.offsetHeight));
      root.style.setProperty('--deck-h', `${deckH}px`);
      // each card sits centred in the frame, so whichever is on top faces the stone
      cards.forEach((c) => { c.style.top = `${Math.round((deckH - c.offsetHeight) / 2)}px`; });
      // the current stage's title rides at 47% of the view, the stone beside it
      const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 64;
      const top = Math.max(bar + 24, Math.min(window.innerHeight * 0.47 - titleOffset(), window.innerHeight - pin.offsetHeight - 32));
      root.style.setProperty('--pin-top', `${Math.round(top)}px`);
    }
    const top = root.getBoundingClientRect().top;
    marks = cards.map((s) => ($('.stage__node', s)?.getBoundingClientRect().top ?? s.getBoundingClientRect().top) - top + 6);
  };
  measure();
  build();
  ScrollTrigger.addEventListener('refreshInit', measure);
  ScrollTrigger.create({
    trigger: root,
    start: 'top 45%',
    end: 'bottom 45%',
    onUpdate: ({ progress }) => {
      if (root.classList.contains('is-deck')) return;
      const y = progress * (root.clientHeight || 1);
      root.style.setProperty('--p', progress.toFixed(4));
      cards.forEach((s, i) => s.classList.toggle('is-on', y >= marks[i]));
    },
  });
  // after launch: its node lights as the row arrives
  if (after) {
    ScrollTrigger.create({
      trigger: after,
      start: 'top 60%',
      onEnter: () => after.classList.add('is-on'),
      onLeaveBack: () => after.classList.remove('is-on'),
    });
  }
}

function initChecks(reducedMotion) {
  const lists = $$('[data-checks]');
  if (!lists.length) return;
  const done = new Set();
  const tick = (list) => {
    if (done.has(list)) return;
    done.add(list);
    $$('li', list).forEach((li, i) => setTimeout(() => li.classList.add('is-done'), 150 + i * 260));
  };
  if (reducedMotion) {
    lists.forEach((list) => $$('li', list).forEach((li) => li.classList.add('is-done')));
    return;
  }
  const ScrollTrigger = ST;
  const stages = $('[data-stages]');
  // the deck: a card's points tick as it slides on top (deckTurns: how many have slid in)
  if (stages?.classList.contains('is-deck')) {
    const cards = $$('.stage', stages);
    const sync = () => {
      const n = turnsOf();
      cards.forEach((card, i) => { if (i <= n) $$('[data-checks]', card).forEach(tick); });
    };
    // while the block is on screen (it is pinned for the deck's whole run), each frame asks the deck
    let on = false;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === on) return;
      on = entry.isIntersecting;
      if (on) GSAP.ticker.add(sync);
      else GSAP.ticker.remove(sync);
    }, { rootMargin: '-45% 0px 0px 0px' }).observe(stages.closest('section') || stages);
    return;
  }
  // the list: each card's points tick as the card comes up
  for (const list of lists) {
    ScrollTrigger.create({ trigger: list.closest('.stage') || list, start: 'top 45%', once: true, onEnter: () => tick(list) });
  }
}

let started = false;
export function initApproach({ motion, reducedMotion }) {
  if (started) return;
  started = true;
  if (motion) {
    markDeck();
    initStages(); // first: the deck's turns tell the checks when a card is on top
  }
  initChecks(reducedMotion);
}
export { deckOn };
