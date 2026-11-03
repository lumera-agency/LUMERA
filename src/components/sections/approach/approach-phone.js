/*
 * 4 Підхід on phones (≤ 600 px): «Стопка етапів», the owner's pick of 10 Oct 2026 (research scratchpad r45).
 * The stages are cards that stack as you scroll, by CSS sticky alone (css/sections.css, «4 Підхід on
 * phones: the stack»). Here each card's picture plays its short story once the card has come fully up,
 * and again after it has left the screen and come back.
 * The pictures are inline SVG in index.html (.stage__pic, .t-m: never shown above 600 px, where nothing
 * here plays), drawn in the glyph language of 5 · Чому ECLO. Only transform and opacity animate (WAAPI
 * on the SVG parts). The CSS default is the finished picture, so without JS nothing is hidden.
 * Reduced motion: no stories, every picture at rest with its accent lit.
 */
import { playStory } from '../why/why-orbit.js';
import { ScrollTrigger as ST } from '@/lib/gsap';

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const SETTLE = 'cubic-bezier(0.34, 1.36, 0.64, 1)';
const SWAY = 'cubic-bezier(0.45, 0, 0.55, 1)';
const rise = (y) => [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }];
const grow = [{ transform: 'scaleX(0)' }, { transform: 'none' }];

/* the five stories, in the shape of why-orbit.js STORIES: `parts` dim first, then the steps build them;
   `accent` (ms) is when the picture's signal accent lights */
export const STAGE_STORIES = {
  1: { // Задача: what was said becomes a plan, its first line ticked
    accent: 760,
    parts: '.g-bub, .g-row, .g-tick',
    steps: [
      ['.g-bub', [{ opacity: 0, transform: 'scale(0.82)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: SETTLE }],
      ['.g-say', grow, { delay: 160, duration: 360, easing: EASE_OUT, stagger: 90 }],
      ['.g-row', rise(3), { delay: 320, duration: 360, easing: EASE_OUT, stagger: 90 }],
      ['.g-tick', [{ opacity: 0, transform: 'scale(0.2)' }, { opacity: 1, transform: 'none' }], { delay: 720, duration: 320, easing: SETTLE }],
    ],
  },
  2: { // Структура: the page's scheme drops in, block by block; its headline is written
    accent: 520,
    parts: '.g-w1, .g-w2, .g-w3, .g-w4, .g-w5, .g-w6',
    steps: [
      ['.g-w1', rise(-3), { duration: 360, easing: SETTLE }],
      ['.g-w2', rise(-3), { delay: 90, duration: 420, easing: SETTLE }],
      ['.g-w3', grow, { delay: 260, duration: 380, easing: EASE_OUT }],
      ['.g-w4', grow, { delay: 340, duration: 380, easing: EASE_OUT }],
      ['.g-w5', grow, { delay: 400, duration: 380, easing: EASE_OUT }],
      ['.g-w6', rise(-3), { delay: 460, duration: 420, easing: SETTLE }],
    ],
  },
  3: { // Дизайн: the screen fills, then the phone version slides up beside it
    accent: 640,
    parts: '.g-k1, .g-k2, .g-k3, .g-k4, .g-ph',
    steps: [
      ['.g-k1', rise(-3), { duration: 380, easing: SETTLE }],
      ['.g-k2', rise(-3), { delay: 70, duration: 380, easing: SETTLE }],
      ['.g-k3', rise(-3), { delay: 140, duration: 380, easing: SETTLE }],
      ['.g-k4', [{ opacity: 0, transform: 'scale(0.86)' }, { opacity: 1, transform: 'none' }], { delay: 100, duration: 440, easing: SETTLE }],
      ['.g-ph', [{ opacity: 0, transform: 'translateY(9px)' }, { opacity: 1, transform: 'none' }], { delay: 300, duration: 560, easing: EASE_OUT }],
      ['.g-k3', [{ transform: 'none' }, { transform: 'scale(1.14)' }, { transform: 'none' }], { delay: 700, duration: 420, easing: SWAY, fill: 'none' }],
    ],
  },
  4: { // Розробка: the test page loads, then you click through it
    accent: 1060,
    parts: '.g-load, .g-p, .g-cur',
    steps: [
      ['.g-load', [{ transform: 'scaleX(0)' }, { transform: 'scaleX(0.7)', offset: 0.6 }, { transform: 'none' }], { duration: 560, easing: 'ease-out' }],
      ['.g-p', rise(-3), { delay: 200, duration: 380, easing: SETTLE, stagger: 60 }],
      ['.g-load', [{ opacity: 1 }, { opacity: 0 }], { delay: 600, duration: 240, fill: 'none' }],
      ['.g-cur', [{ opacity: 0, transform: 'translate(30px, -8px)' }, { opacity: 1, transform: 'translate(24px, -6px)', offset: 0.2 }, { opacity: 1, transform: 'none' }], { delay: 480, duration: 560, easing: EASE_OUT }],
      ['.g-cur', [{ transform: 'none' }, { transform: 'scale(0.86)' }, { transform: 'none' }], { delay: 1040, duration: 200, easing: SWAY, fill: 'none' }],
      ['.g-ping', [{ opacity: 0, transform: 'scale(1)' }, { opacity: 0.9, transform: 'scale(1)', offset: 0.02 }, { opacity: 0, transform: 'scale(2.6)' }], { delay: 1060, duration: 620, easing: EASE_OUT }],
    ],
  },
  5: { // Запуск: your address is typed and locked; the key is handed over
    accent: 900,
    parts: '.g-url, .g-lock, .g-key',
    steps: [
      ['.g-url', [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 420, easing: 'steps(8, end)' }],
      ['.g-lock', [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'none' }], { delay: 400, duration: 320, easing: SETTLE }],
      ['.g-key', [{ opacity: 0, transform: 'translateX(12px) rotate(-24deg)' }, { opacity: 1, transform: 'none' }], { delay: 560, duration: 620, easing: SETTLE }],
    ],
  },
};

const picOf = (stage) => stage.querySelector('.stage__pic');
function story(stage) {
  const pic = picOf(stage);
  if (!pic?.offsetParent) return; // above 600 px the pictures are not shown
  playStory(pic.querySelector('svg'), STAGE_STORIES[pic.dataset.pic], { onAccent: () => pic.classList.add('is-accent') });
}

/** The stack's pictures: a card that has come fully up plays its story (again after it has left the
 *  screen). sections.js mounts it on a phone only (≤ 600 px, now or after a turn). Returns { destroy() }. */
export function mountApproach(approach, { reducedMotion = false } = {}) {
  const stages = approach ? [...approach.querySelectorAll('.stage')].filter(picOf) : [];
  if (!stages.length) return null;
  if (reducedMotion) {
    stages.forEach((s) => picOf(s).classList.add('is-accent'));
    return { destroy() {} };
  }
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.intersectionRatio >= 0.9 && !seen.has(e.target)) { seen.add(e.target); story(e.target); }
      else if (!e.isIntersecting) seen.delete(e.target);
    }
  }, { threshold: [0, 0.9] });
  stages.forEach((s) => io.observe(s));
  return { destroy() { io.disconnect(); } };
}
