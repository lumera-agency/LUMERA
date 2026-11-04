/*
 * 4 · Почему ECLO — the four links' glyphs (glyphs.tsx: inline SVG, aria-hidden) and their short stories:
 *   Поиск          the query types itself, our ad comes up first and is highlighted
 *   Сайт           the page's blocks drop into place, the button pulses, the picture settles
 *   Заявка         the Telegram notification slides in and nudges, its dot pops with one ring
 *   Откуда заявка  the bars grow from the baseline and bounce, the source tag lights
 *
 * A link's story plays once as the chain lights that link (WhyChainClient). Only transform and opacity
 * animate (WAAPI on the SVG parts). The CSS default is the resting, complete glyph, so without JS nothing
 * is hidden.
 *
 * playStory(svg, link | story, { onAccent }) plays one glyph's story on its own; the phone picture of
 * block 5 (approach-phone.js, its own stories) uses it too.
 */
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';   // --ease-out (expo.out): arrivals
const SETTLE = 'cubic-bezier(0.34, 1.36, 0.64, 1)'; // a small overshoot: things settling into place
const SWAY = 'cubic-bezier(0.45, 0, 0.55, 1)';      // in-out: a nudge out and back
const rise = (y) => [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }];

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
