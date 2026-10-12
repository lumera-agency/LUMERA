/*
 * 3 · Послуги as a ride (v2). On a wide, tall-enough screen the services stand side by side on one
 * track: the stage pins under the topbar and the vertical scroll drives the track sideways
 * (ScrollTrigger pin + scrub; the panels' own effects ride on it through containerAnimation).
 * The panel in the middle is lit and its neighbours step back; behind each panel its big outlined
 * numeral drifts faster than the panel (depth); the HUD counts the panels, fills a lime line and
 * names them (a name scrolls the ride to its panel). Arrows on the sides step one panel back or on,
 * and «skip» leaves the ride for what comes after it. A sideways trackpad swipe drives it too.
 * Elsewhere (phones, short windows, reduced motion) the block stays the list it always was.
 *
 * `services:go` (2 · Що ми робимо): while the ride is on, the page scrolls to that panel.
 *
 * Library use: initRide({ motion, root, track, panel, name, media, body, tabs }) — the selectors
 * default to the site's markup; the HUD and the buttons are optional, inside root:
 * [data-ride-now|of|bar|names], [data-ride-prev], [data-ride-next], [data-ride-skip].
 */
import { gsap as GSAP, ScrollTrigger as ST } from '@/lib/gsap';
import { scrollToY } from '@/lib/scroll';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const RIDE_MQ = '(min-width: 1024px) and (min-height: 620px) and (hover: hover) and (pointer: fine)';
const PX_PER_SCREEN = 1.0; // vertical scroll per px of sideways travel

export function initRide({
  motion = true,
  root = '[data-ride]',
  track = '.services',
  panel = '.service',
  name = '.service__meta span:last-child',
  media = '.service__demo',
  body = '.service__meta, .service__title, .service__text, .service__foot',
  tabs = '.service-tabs.is-on',
  goEvent = 'services:go',
  mq = RIDE_MQ,
} = {}) {
  const ride = $(root);
  const list = ride && $(track, ride);
  if (!ride || !list) return { isOn: () => false };
  const panels = $$(panel, list);
  const gsap = GSAP;
  const ScrollTrigger = ST;
  const now = $('[data-ride-now]', ride);
  const of = $('[data-ride-of]', ride);
  const bar = $('[data-ride-bar]', ride);
  const names = $('[data-ride-names]', ride);
  const pad = (n) => String(n).padStart(2, '0');
  if (of) of.textContent = pad(panels.length);

  let on = false;
  let trigger = null;
  let current = -1;
  let buttons = [];

  const setCurrent = (i) => {
    if (i === current) return;
    current = i;
    panels.forEach((p, k) => p.classList.toggle('is-current', k === i));
    buttons.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    if (now) now.textContent = pad(i + 1);
    syncArrows();
  };

  /** The scroll position that brings panel `i` to the middle of the stage. */
  const scrollFor = (i) => {
    if (!trigger) return null;
    const max = list.scrollWidth - window.innerWidth;
    const first = panels[0].offsetLeft;
    const x = panels[i].offsetLeft - first;
    return trigger.start + (trigger.end - trigger.start) * Math.min(1, Math.max(0, x / max));
  };
  const goTo = (i) => {
    const y = scrollFor(Math.max(0, Math.min(panels.length - 1, i)));
    if (y == null) return;
    scrollToY(y);
  };
  // the buttons: one panel back / on, and out of the ride
  const prev = $('[data-ride-prev]', ride);
  const next = $('[data-ride-next]', ride);
  const skip = $('[data-ride-skip]', ride);
  const syncArrows = () => {
    prev?.toggleAttribute('disabled', current <= 0);
    next?.toggleAttribute('disabled', current >= panels.length - 1);
  };
  prev?.addEventListener('click', () => goTo(current - 1));
  next?.addEventListener('click', () => goTo(current + 1));
  // skip: out of the ride without running through the panels — the screen dips to black, the page
  // jumps to what follows the ride, and it comes up again there (a cut, not a scroll)
  let skipping = false;
  skip?.addEventListener('click', () => {
    if (!trigger || skipping) return;
    skipping = true;
    const box = ride.parentElement?.classList.contains('pin-spacer') ? ride.parentElement : ride; // GSAP wraps a pinned element
    const after = box.nextElementSibling;
    const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 64;
    const target = () => Math.max(after ? after.getBoundingClientRect().top + window.scrollY - bar - 32 : trigger.end, trigger.end + 1);
    const veil = document.createElement('div');
    veil.className = 'ride__veil';
    // self-contained (the effect may live without the site's CSS): the page's black, under a topbar (z 60)
    veil.style.cssText = 'position:fixed;inset:0;z-index:45;background:var(--bg,#0a0a0a);opacity:0;pointer-events:none';
    document.body.append(veil);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fade = (from, to, duration, easing) => veil.animate([{ opacity: from }, { opacity: to }], { duration: reduced ? 1 : duration, easing, fill: 'forwards' }).finished;
    fade(0, 1, 260, 'cubic-bezier(0.7, 0, 0.84, 0)')
      .then(() => {
        scrollToY(target(), { immediate: true });
        return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); // the new place is painted
      })
      .then(() => fade(1, 0, 620, 'cubic-bezier(0.16, 1, 0.3, 1)'))
      .finally(() => {
        veil.remove();
        skipping = false;
      });
  });

  document.addEventListener(goEvent, (e) => {
    if (!on) {
      // the phone switcher: its tab opens, and the anchor scrolls to the window as usual
      const tab = document.getElementById(`${e.detail?.id}-tab`);
      if (tab?.closest(tabs)) tab.click();
      return;
    }
    const i = panels.findIndex((p) => p.id === e.detail?.id);
    if (i < 0) return;
    e.preventDefault();
    history.replaceState(history.state, '', `#${e.detail.id}`);
    goTo(i);
  });

  if (!motion || !gsap || !ScrollTrigger || !gsap.matchMedia) return { isOn: () => false };

  // the names in the HUD (the services' own short names, translated with them)
  if (names) {
    names.textContent = '';
    buttons = panels.map((p, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = $(name, p)?.textContent.trim() || pad(i + 1);
      b.setAttribute('aria-current', 'false');
      b.addEventListener('click', () => goTo(i));
      li.append(b);
      names.append(li);
      return b;
    });
  }

  // the big numerals behind the panels
  const bigs = panels.map((p, i) => {
    const big = document.createElement('span');
    big.className = 'ride__big';
    big.setAttribute('aria-hidden', 'true');
    big.textContent = pad(i + 1);
    big.hidden = true;
    p.append(big);
    return big;
  });

  // the keyboard: a focused control in a panel off to the side brings that panel to the middle
  list.addEventListener('focusin', (e) => {
    if (!on) return;
    const i = panels.findIndex((p) => p.contains(e.target));
    if (i >= 0 && i !== current) goTo(i);
  });

  // a sideways trackpad swipe over the stage drives the ride like the wheel does
  ride.addEventListener('wheel', (e) => {
    if (!on || !trigger?.isActive || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    window.scrollBy({ top: e.deltaX, behavior: 'instant' });
  }, { passive: false });

  const mm = gsap.matchMedia();
  mm.add(mq, () => {
    on = true;
    ride.classList.add('is-on');
    list.classList.remove('is-stacked');
    // the panels are not revealed one by one (the ride lights them), and the stack effect is off
    const sr = panels.filter((p) => p.hasAttribute('data-sr'));
    sr.forEach((p) => { p.removeAttribute('data-sr'); gsap.set(p, { clearProps: 'opacity,visibility,transform' }); });
    bigs.forEach((b) => { b.hidden = false; });

    const distance = () => Math.max(0, list.scrollWidth - window.innerWidth);
    const bar_ = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 64;
    const track = gsap.to(list, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: ride,
        start: () => `top ${bar_()}px`,
        end: () => `+=${Math.round(distance() * PX_PER_SCREEN)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 2, // above 5 · Підхід's deck: its spacer goes in first
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress.toFixed(4)})`;
          setCurrent(Math.round(self.progress * (panels.length - 1)));
        },
      },
    });
    trigger = track.scrollTrigger;
    setCurrent(0);

    // each panel: lit in the middle, stepped back at the sides; its numeral drifts faster
    panels.forEach((p, i) => {
      const demo = $(media, p);
      const copy = $$(body, p);
      gsap.timeline({
        scrollTrigger: {
          trigger: p,
          containerAnimation: track,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      })
        .fromTo(demo, { scale: 0.86, autoAlpha: 0.35 }, { scale: 1, autoAlpha: 1, ease: 'power2.out', duration: 1 })
        .fromTo(copy, { x: 80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power2.out', duration: 1, stagger: 0.04 }, 0)
        .to(demo, { scale: 0.86, autoAlpha: 0.35, ease: 'power2.in', duration: 1 }, 1)
        .to(copy, { x: -60, autoAlpha: 0, ease: 'power2.in', duration: 1 }, 1);
      gsap.fromTo(bigs[i], { xPercent: 40 }, {
        xPercent: -40,
        ease: 'none',
        scrollTrigger: { trigger: p, containerAnimation: track, start: 'left right', end: 'right left', scrub: true },
      });
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      on = false;
      trigger = null;
      current = -1;
      ride.classList.remove('is-on');
      panels.forEach((p) => p.classList.remove('is-current'));
      sr.forEach((p) => p.setAttribute('data-sr', ''));
      bigs.forEach((b) => { b.hidden = true; });
      if (bar) bar.style.transform = '';
    };
  });

  return { isOn: () => on };
}
