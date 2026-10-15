/* «Дизайн і сайти» (Next): copied from the static page's js/sites-fx-page.js (the working folder); unchanged. */
/*
 * «Дизайн і сайти» · the page's card and motion layer (15 Oct 2026): small pieces that js/sites-page.js calls. Styles in
 * css/sites-fx-page.css. Every piece is transform / opacity only, plays once on entering view or on hover / press, and
 * stops: nothing runs at rest. Hover pieces work with a mouse only (touch screens keep the plain page); with reduced
 * motion none of them start and the page shows its final frame.
 *
 * Where each idea comes from:
 *   - the section titles rising out of their masks, the list's rows stepping back, the ink line under a row, the circle
 *     arrow that turns: the main page's block 2 «Що ми робимо» (src/components/sections/what/, the owner's own code),
 *     ported to plain DOM / CSS;
 *   - SpotlightCard, ClickSpark, TiltedCard (React Bits, https://github.com/DavidHDev/react-bits,
 *     src/content/Components/* and src/content/Animations/*): ported to plain DOM, no React, no motion/react; the notice
 *     below applies to these ports;
 *   - BorderBeam (Magic UI, https://magicui.design/docs/components/border-beam, MIT, © 2023 Dillion Verma; listed on
 *     21st.dev): rebuilt from its public demo as one lap of light around a card's edge (a conic light turned by
 *     transform inside a ring mask), played on demand instead of in a loop;
 *   - the price delta chip after NumberFlow's idea (https://number-flow.barvian.me, MIT, © Maxwell Barvian): rebuilt,
 *     no code taken.
 *
 * ---------------------------------------------------------------------------------------------------------
 * MIT + Commons Clause License Condition v1.0 (React Bits)
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

const fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const el = (tag, className) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.setAttribute('aria-hidden', 'true');
  return node;
};
const isMouse = (e) => e.pointerType === 'mouse' || e.pointerType === '';

/* ---------- the section titles (blocks 2–6): the words rise out of their mask, the meta's hairline draws from the left,
   the intro follows (the main page's block 2 header). Titles already on screen at load are left as they are ---------- */
export function initHeads({ motion }) {
  const heads = [...document.querySelectorAll('.section .s-head')];
  for (const head of heads) {
    const title = head.querySelector('.s-head__title');
    if (!title || title.querySelector(':scope > .fx-rise')) continue;
    // a block wrapper inside the title: the same lines (the title's width, its text-wrap), something to move
    const rise = document.createElement('span');
    rise.className = 'fx-rise';
    rise.append(...title.childNodes);
    title.append(rise);
  }
  if (!motion || typeof IntersectionObserver !== 'function') return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const head = entry.target;
      if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) continue;
      // scrolled past already (a language switch or a #link brought the page down): straight to the final frame
      if (!entry.isIntersecting) head.classList.add('fx-now');
      head.classList.remove('fx-pre');
      io.unobserve(head);
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  const vh = window.innerHeight;
  for (const head of heads) {
    if (head.getBoundingClientRect().top < vh * 0.88) continue;
    head.classList.add('fx-pre');
    io.observe(head);
  }
}

/* ---------- SpotlightCard (React Bits): a soft light under the mouse, inside the card. The light is one blurred disc
   moved by transform (not a repainted background) ---------- */
export function spotlight(host) {
  if (!fineMQ.matches || !host || host.querySelector(':scope > .fx-spot')) return;
  const spot = el('i', 'fx-spot');
  host.prepend(spot);
  const move = (e) => {
    if (!isMouse(e)) return;
    const r = host.getBoundingClientRect();
    spot.style.transform = `translate3d(${(e.clientX - r.left).toFixed(1)}px, ${(e.clientY - r.top).toFixed(1)}px, 0)`;
  };
  host.addEventListener('pointerenter', (e) => {
    if (!isMouse(e)) return;
    move(e);
    spot.classList.add('is-on');
  });
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerleave', () => spot.classList.remove('is-on'));
}


/* ---------- TiltedCard (React Bits): the first screen's sample site («Ваш бренд» on a computer and a phone) turns a few
   degrees toward the mouse, the phone floats a little ahead of the computer. It eases
   to the mouse and stops once it is there (no frame runs while the mouse is still) ---------- */
export function initTilt({ motion }) {
  const hero = document.querySelector('.st-hero');
  const show = hero?.querySelector('.st-show');
  if (!show || !motion || !fineMQ.matches) return;
  const phone = show.querySelector('.st-show__phone');
  // (15 Oct, the owner: the light that followed the cursor over the mock-up is gone; the tilt stays)
  const cur = { x: 0, y: 0, o: 0 };
  const to = { x: 0, y: 0, o: 0 };
  let frame = 0;
  const tick = () => {
    cur.x += (to.x - cur.x) * 0.085;
    cur.y += (to.y - cur.y) * 0.085;
    cur.o += (to.o - cur.o) * 0.1;
    const done = Math.abs(to.x - cur.x) < 0.002 && Math.abs(to.y - cur.y) < 0.002 && Math.abs(to.o - cur.o) < 0.01;
    if (done) Object.assign(cur, to);
    const rest = done && !to.x && !to.y && !to.o;
    show.style.transform = rest ? '' : `perspective(1800px) rotateX(${(-cur.y * 3.2).toFixed(3)}deg) rotateY(${(cur.x * 4.4).toFixed(3)}deg)`;
    if (phone) phone.style.translate = rest ? '' : `${(cur.x * -12).toFixed(2)}px ${(cur.y * -9).toFixed(2)}px`;
    frame = done ? 0 : requestAnimationFrame(tick);
  };
  const run = () => { if (!frame) frame = requestAnimationFrame(tick); };
  hero.addEventListener('pointermove', (e) => {
    if (!isMouse(e)) return;
    const r = show.getBoundingClientRect();
    to.x = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    to.y = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
    to.o = 1;
    run();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    Object.assign(to, { x: 0, y: 0, o: 0 });
    run();
  });
}

/* ---------- block 2's rail: one ivory slab, the chosen format's black card glides to the tab, carrying the
   ember dash; its line runs while the sample scrolls (js/sites-page.js runDev). Returns { place(tab, snap), line } ---------- */
export function mountGlide(rail) {
  if (!rail) return null;
  const glide = el('i', 'st-rail__glide');
  const line = document.createElement('b');
  glide.append(line);
  rail.prepend(glide);
  rail.classList.add('has-glide');
  let current = null;
  const place = (tab, snap = false) => {
    if (!tab) return;
    current = tab;
    if (snap) glide.classList.add('is-snap');
    glide.style.width = `${tab.offsetWidth}px`;
    glide.style.height = `${tab.offsetHeight}px`;
    glide.style.transform = `translate3d(${tab.offsetLeft}px, ${tab.offsetTop}px, 0)`;
    if (snap) {
      void glide.offsetWidth;
      glide.classList.remove('is-snap');
    }
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => place(current, true)).observe(rail);
  return { place, line };
}

/* ---------- ClickSpark (React Bits): eight short rays from the point of the press, once ---------- */
export function spark(x, y, { count = 10, reach = 38 } = {}) {
  const box = el('span', 'fx-spark');
  box.style.left = `${x}px`;
  box.style.top = `${y}px`;
  const anims = [];
  for (let i = 0; i < count; i++) {
    const ray = document.createElement('i');
    ray.style.rotate = `${(360 / count) * i}deg`;
    box.append(ray);
    anims.push(ray.animate([
      { transform: 'translateY(-10px) scaleY(1)', opacity: 1 },
      { transform: `translateY(-${reach}px) scaleY(0.1)`, opacity: 0 },
    ], { duration: 560, easing: EXPO, fill: 'forwards' }));
  }
  document.body.append(box);
  Promise.all(anims.map((a) => a.finished)).catch(() => {}).finally(() => box.remove());
}

/* ---------- BorderBeam (Magic UI via 21st.dev): one lap of ember light around a card's edge ---------- */
export function beam(host, { duration = 1700 } = {}) {
  if (!host) return null;
  let ring = host.querySelector(':scope > .fx-beam');
  if (!ring) {
    ring = el('span', 'fx-beam');
    ring.append(document.createElement('i'));
    host.append(ring);
  }
  const light = ring.firstElementChild;
  light.getAnimations().forEach((a) => a.cancel());
  return light.animate([
    { transform: 'rotate(0deg)', opacity: 0 },
    { opacity: 1, offset: 0.12 },
    { opacity: 1, offset: 0.78 },
    { transform: 'rotate(360deg)', opacity: 0 },
  ], { duration, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' });
}
/** the lap once, when the card first comes into view */
export function beamOnView(host, { motion }) {
  if (!host || !motion || typeof IntersectionObserver !== 'function') return;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    setTimeout(() => beam(host, { duration: 2200 }), 250);
  }, { threshold: 0.6 });
  io.observe(host);
}

/* ---------- the sum's change as a chip («+$400», «−$200») that rises beside the number and goes (NumberFlow's idea) ---------- */
export function deltaChip(host, text, { up = true } = {}) {
  if (!host) return;
  host.querySelector(':scope > .fx-delta')?.remove();
  const chip = el('span', `fx-delta${up ? '' : ' is-down'}`);
  chip.textContent = text;
  host.append(chip);
  // (the timing lives in the keyframes: an eased iteration would squeeze the time the chip is readable)
  chip.animate([
    { opacity: 0, transform: 'translate3d(0, 12px, 0) scale(0.92)', easing: EXPO },
    { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', offset: 0.2 },
    { opacity: 1, transform: 'translate3d(0, -4px, 0)', offset: 0.75, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    { opacity: 0, transform: 'translate3d(0, -16px, 0)' },
  ], { duration: 1700, easing: 'linear', fill: 'forwards' }).finished.catch(() => {}).finally(() => chip.remove());
}

/* ---------- block 2 · the corporate site's fan of pages: a page is SHOWN on demand. Over a card (mouse), a tap (touch) or
   Enter / Space (keyboard): the four cards fold into a column of thumbnails and the page opens beside them, large, with
   its name in the window bar and what the page is for under it; another thumbnail switches the page (a crossfade); the
   mouse leaving the fan, a second tap on the open page, Esc or the focus leaving puts the fan back. The page grows out
   of the card it came from (a FLIP, transform / opacity only); with reduced motion everything swaps at once.
   `label(card)` gives the button's name («Сторінка: Послуги»), `note(card)` the line under the page ---------- */
export function mountFan(art, { motion, label, note }) {
  const fan = art?.querySelector('.st-fan');
  if (!fan) return null;
  const cards = [...fan.querySelectorAll('.st-fan__p:not(.st-fan__p--more)')];
  if (!cards.length) return null;

  // the window the page opens in (decoration: the cards are the buttons)
  const view = el('div', 'st-fan__view');
  const bar = document.createElement('div');
  bar.className = 'st-dev__bar';
  bar.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
  const title = document.createElement('b');
  title.className = 'st-fan__vt';
  bar.append(title);
  const vp = document.createElement('div');
  vp.className = 'st-fan__vp';
  const layers = [document.createElement('img'), document.createElement('img')];
  for (const img of layers) {
    img.alt = '';
    img.decoding = 'async';
    img.width = 600;
    img.height = 600;
    vp.append(img);
  }
  const cap = document.createElement('p');
  cap.className = 'st-fan__vd';
  view.append(bar, vp, cap);
  fan.append(view);

  for (const card of cards) {
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', label(card));
  }

  let open = null; // the shown card
  let front = 0; // the image layer on top
  let lock = 0; // while the cards fold, the cards sliding under a still mouse switch nothing
  let byHover = false;
  let intent = 0;
  const fx = [];
  const stopFx = () => { fx.splice(0).forEach((a) => a.cancel()); };

  /** where everything goes: the thumbnails' column and the window */
  const geometry = () => {
    const W = fan.clientWidth;
    const H = fan.clientHeight;
    const cw = cards[0].offsetWidth;
    const ch = cards[0].offsetHeight;
    const gap = W < 420 ? 8 : 10;
    const s = Math.min((H - gap * (cards.length - 1)) / cards.length / ch, (W * 0.2) / cw);
    const tw = cw * s;
    const x = Math.round(tw + (W < 420 ? 12 : 22));
    // the window is never taller than the page's still (a square) plus its bar: no side of the page is ever cut
    const barH = matchMedia('(max-width: 600px)').matches ? 26 : 32;
    return { W, H, cw, ch, gap, s, tw, view: { x, y: 0, w: W - x, h: Math.min(H, Math.round(W - x + barH)) } };
  };
  const fold = (g) => {
    cards.forEach((card, i) => {
      const tx = -card.offsetLeft;
      const ty = i * (g.ch * g.s + g.gap) - card.offsetTop - (g.ch / 2) * (1 - g.s);
      card.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${g.s.toFixed(4)})`;
    });
  };
  const place = (g) => {
    Object.assign(view.style, { left: `${g.view.x}px`, top: `${g.view.y}px`, width: `${g.view.w}px`, height: `${g.view.h}px` });
  };
  const fill = (card, crossfade) => {
    const src = card.querySelector('img')?.currentSrc || card.querySelector('img')?.src;
    const next = crossfade ? 1 - front : front;
    const img = layers[next];
    const old = layers[1 - next];
    if (src && img.getAttribute('src') !== src) img.src = src;
    img.style.transform = '';
    title.textContent = card.querySelector('.st-dev__bar span')?.textContent.trim() || '';
    cap.textContent = note(card);
    if (crossfade && motion) {
      // the new page fades in over the old one, which stays until it is covered
      old.classList.remove('is-top');
      old.classList.add('is-under');
      img.classList.remove('is-under');
      img.classList.add('is-top');
      const a = img.animate([{ opacity: 0, transform: 'translate3d(0, 14px, 0) scale(1.02)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: EXPO });
      const done = () => { if (!old.classList.contains('is-top')) old.classList.remove('is-under'); };
      a.finished.then(done, done);
      fx.push(a);
      fx.push(title.animate([{ opacity: 0, transform: 'translate3d(0, 6px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: EXPO }));
      fx.push(cap.animate([{ opacity: 0, transform: 'translate3d(0, 8px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 60, easing: EXPO, fill: 'backwards' }));
    } else {
      old.classList.remove('is-top', 'is-under');
      img.classList.add('is-top');
    }
    front = next;
  };
  const press = (card) => cards.forEach((c) => c.setAttribute('aria-pressed', String(c === card)));

  const show = (card, { hover = false } = {}) => {
    if (open === card) return;
    clearTimeout(intent);
    if (open) {
      // another page: the window stays, the picture changes
      open = card;
      press(card);
      fill(card, true);
      return;
    }
    open = card;
    byHover = hover;
    press(card);
    stopFx();
    const g = geometry();
    // the card's place now, for the window to grow out of it
    const from = card.getBoundingClientRect();
    const box = fan.getBoundingClientRect();
    place(g);
    fill(card, false);
    fan.classList.add('is-open');
    fold(g);
    lock = performance.now() + 520;
    if (!motion) return;
    const dx = from.left - box.left - g.view.x;
    const dy = from.top - box.top - g.view.y;
    const k = from.width / g.view.w;
    fx.push(view.animate([
      { transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${k.toFixed(4)})`, opacity: 0.4 },
      { transform: 'none', opacity: 1 },
    ], { duration: 640, easing: EXPO }));
    fx.push(cap.animate([{ opacity: 0, transform: 'translate3d(0, 10px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 460, delay: 320, easing: EXPO, fill: 'backwards' }));
  };
  const hide = ({ focus = false } = {}) => {
    clearTimeout(intent);
    if (!open) return;
    const was = open;
    open = null;
    press(null);
    stopFx();
    for (const card of cards) card.style.transform = '';
    if (motion) {
      fx.push(view.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate3d(-12px, 6px, 0) scale(0.96)' }], { duration: 300, easing: 'cubic-bezier(0.4, 0, 1, 1)' }));
    }
    fan.classList.remove('is-open');
    if (focus) was.focus({ preventScroll: true });
  };

  // the mouse: a card under it opens (a short intent, so passing over the fan opens nothing); leaving the fan closes
  fan.addEventListener('pointerover', (e) => {
    if (!isMouse(e)) return;
    const card = e.target.closest('.st-fan__p');
    if (!card || !cards.includes(card)) return;
    if (open) {
      if (performance.now() > lock) show(card, { hover: true });
      return;
    }
    clearTimeout(intent);
    intent = setTimeout(() => show(card, { hover: true }), 110);
  });
  fan.addEventListener('pointerleave', (e) => {
    clearTimeout(intent);
    if (isMouse(e) && open && byHover) hide();
  });
  // a press: touch toggles (a second tap on the open page or on the window closes); a mouse click only opens
  fan.addEventListener('click', (e) => {
    const card = e.target.closest('.st-fan__p');
    const mouse = e.pointerType === 'mouse';
    if (card && cards.includes(card)) {
      if (open === card && !mouse) hide();
      else show(card);
    } else if (open && e.target.closest('.st-fan__view') && !mouse) {
      hide();
    }
  });
  // the keyboard: Enter / Space toggle, Esc closes, Tab to another card switches, Tab out closes
  fan.addEventListener('keydown', (e) => {
    const card = e.target.closest('.st-fan__p');
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      hide({ focus: true });
    } else if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (open === card) hide();
      else show(card);
    }
  });
  fan.addEventListener('focusin', (e) => {
    // (keyboard focus only: a tap focuses the card too, and its click decides)
    const card = e.target.closest('.st-fan__p');
    if (open && card && cards.includes(card) && card.matches(':focus-visible')) show(card);
  });
  fan.addEventListener('focusout', (e) => {
    if (open && !fan.contains(e.relatedTarget) && e.relatedTarget) hide();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open && byHover) hide(); });
  // a tap anywhere else puts the fan back
  document.addEventListener('pointerdown', (e) => { if (open && !isMouse(e) && !fan.contains(e.target)) hide(); }, { passive: true });
  // the mouse moves the long page under the window a little (its lower part comes into view)
  vp.addEventListener('pointermove', (e) => {
    if (!isMouse(e) || !open) return;
    const r = vp.getBoundingClientRect();
    const img = layers[front];
    const over = Math.max(0, img.offsetHeight - r.height);
    img.style.transform = `translate3d(0, ${(-over * clamp((e.clientY - r.top) / r.height, 0, 1)).toFixed(1)}px, 0)`;
  }, { passive: true });
  vp.addEventListener('pointerleave', () => { layers[front].style.transform = ''; });
  if (typeof ResizeObserver === 'function') {
    let w = fan.clientWidth;
    new ResizeObserver(() => {
      if (fan.clientWidth === w) return;
      w = fan.clientWidth;
      if (!open) return;
      const g = geometry();
      place(g);
      fold(g);
    }).observe(fan);
  }
  return { close: () => hide() };
}
