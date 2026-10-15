/* «Дизайн і сайти» (Next): copied from the static page's js/sites-rb.js (the working folder); unchanged. */
/*
 * «Дизайн і сайти» · two pieces of React Bits motion, ported to plain DOM + WAAPI for this page (14 Oct 2026). Sources:
 *   AnimatedList  https://github.com/DavidHDev/react-bits/blob/main/src/content/Components/AnimatedList/AnimatedList.jsx
 *   Counter       https://github.com/DavidHDev/react-bits/blob/main/src/content/Components/Counter/Counter.jsx
 * What changed in the port: no React and no motion/react. AnimatedList gives its spring (a CSS linear() curve with an
 * 8 % overshoot) and its «slide» entrance (28 px up, 98 % scale, opacity on a shorter ease); the page plays it once per
 * scene from js/sites-page.js. Counter keeps its idea (each digit a one-line window over a column 0–9, moved by
 * transform), drawn only after the visitor changes something; the first draw and reduced motion are plain text.
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
 */

const SPRING_LINEAR = 'linear(0, 0.0603, 0.2033, 0.3821, 0.5633, 0.7258, 0.8584, 0.9574, 1.0242, 1.0634, 1.0809, 1.0828, 1.0747, 1.0613, 1.046, 1.0313, 1.0186, 1.0085, 1.0012, 0.9965, 0.994, 0.9931, 0.9933, 0.9941, 0.9953, 0.9966, 0.9978, 0.9988, 1)';

/** AnimatedList's spring, or the nearest cubic-bezier where linear() is not supported. */
export const SPRING = typeof CSS !== 'undefined' && CSS.supports?.('animation-timing-function', 'linear(0, 1)')
  ? SPRING_LINEAR
  : 'cubic-bezier(0.34, 1.4, 0.64, 1)';

/** AnimatedList «slide»: the start frame of an item and its two timings. */
export const SLIDE = {
  from: { transform: 'translate3d(0, 28px, 0) scale(0.98)' },
  move: 620,
  fade: 300,
  fadeEase: 'cubic-bezier(0.22, 1, 0.36, 1)',
  stagger: 50,
};

/**
 * One item in, AnimatedList's way: transform on the spring, opacity on a shorter ease. Returns both animations
 * (fill: backwards, so the CSS frame stays the final one).
 */
export function slideIn(el, delay = 0, { distance = 28 } = {}) {
  const from = `translate3d(0, ${distance}px, 0) scale(0.98)`;
  return [
    el.animate([{ transform: from }, { transform: 'none' }], { duration: SLIDE.move, delay, easing: SPRING, fill: 'backwards' }),
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: SLIDE.fade, delay, easing: SLIDE.fadeEase, fill: 'backwards' }),
  ];
}

/**
 * Counter: write `text` (e.g. «$1 200») into `el`. Digits roll to their new value (right to left, 40 ms apart) when
 * `roll` is true and the number has as many characters as before; otherwise the cells are drawn at once.
 * The digits are decoration (aria-hidden); a visually hidden copy carries the text.
 */
export function rollNumber(el, text, { roll = false, ease = 'cubic-bezier(0.16, 1, 0.3, 1)' } = {}) {
  const chars = [...text];
  const old = el._cells;
  const same = old && old.length === chars.length && old.every((c, i) => c.digit === /\d/.test(chars[i]));
  if (!roll || !same) {
    const cells = chars.map((ch) => {
      if (!/\d/.test(ch)) {
        const span = document.createElement('span');
        span.textContent = ch;
        return { digit: false, el: span };
      }
      const cell = document.createElement('span');
      cell.className = 'st-d';
      const col = document.createElement('span');
      for (let d = 0; d < 10; d++) col.append(Object.assign(document.createElement('i'), { textContent: String(d) }));
      col.style.transform = `translateY(${-Number(ch)}em)`;
      cell.append(col);
      return { digit: true, el: cell, col, v: Number(ch) };
    });
    const visible = document.createElement('span');
    visible.setAttribute('aria-hidden', 'true');
    visible.style.display = 'inline-flex';
    visible.append(...cells.map((c) => c.el));
    const spoken = Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: text });
    el.replaceChildren(visible, spoken);
    el._cells = cells;
    el._spoken = spoken;
    return [];
  }
  el._spoken.textContent = text;
  const anims = [];
  chars.forEach((ch, i) => {
    const cell = old[i];
    if (!cell.digit) {
      cell.el.textContent = ch;
      return;
    }
    const v = Number(ch);
    if (v === cell.v) return;
    const from = cell.v;
    cell.v = v;
    cell.col.style.transform = `translateY(${-v}em)`;
    anims.push(cell.col.animate([{ transform: `translateY(${-from}em)` }, { transform: `translateY(${-v}em)` }], {
      duration: 650, delay: (chars.length - 1 - i) * 40, easing: ease, fill: 'backwards',
    }));
  });
  return anims;
}
