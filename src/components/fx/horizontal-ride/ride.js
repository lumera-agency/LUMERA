/*
 * 3 · Послуги as a ride (v2). On a wide, tall-enough screen the services stand side by side on one
 * track: the stage pins under the topbar and the vertical scroll drives the track sideways
 * (ScrollTrigger pin + scrub; the panels' own effects ride on it through containerAnimation).
 * The panel in the middle is lit and its neighbours step back; behind each panel its big outlined
 * numeral drifts faster than the panel (depth); the HUD counts the panels, fills a lime line and
 * names them (a name scrolls the ride to its panel). One panel fills the stage; a wheel gesture turns
 * one panel (sideways swipes too), arrows on the sides step back or on, and «skip» leaves the ride.
 * Elsewhere (phones, short windows, reduced motion) the block stays the list it always was.
 *
 * `services:go` (2 · Що ми робимо): while the ride is on, the page scrolls to that panel.
 *
 * Library use: initRide({ motion, root, track, panel, name, media, body, tabs }) — the selectors
 * default to the site's markup; the HUD and the buttons are optional, inside root:
 * [data-ride-now|of|bar|names], [data-ride-prev], [data-ride-next], [data-ride-skip].
 */
import { gsap as GSAP, ScrollTrigger as ST } from '@/lib/gsap';
import { getLenis, scrollToY } from '@/lib/scroll';
import { topbarHeight } from '@/lib/css';

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
  // the way from the first panel to the last (not the track's scrollWidth: the last numeral sticks out)
  const travel = () => Math.max(0, panels[panels.length - 1].offsetLeft - panels[0].offsetLeft);
  const scrollFor = (i) => {
    if (!trigger) return null;
    const max = travel();
    const x = panels[i].offsetLeft - panels[0].offsetLeft;
    return trigger.start + (trigger.end - trigger.start) * (max ? Math.min(1, Math.max(0, x / max)) : 0);
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
  // skip: out of the ride without running through the panels, and without losing the place: a soft
  // dip to black onto the last slide, then the page glides on until the next block comes up under it
  // (the slides stay in sight above, so it is clear where we are)
  let skipping = false;
  skip?.addEventListener('click', () => {
    if (!trigger || skipping) return;
    skipping = true;
    const veil = document.createElement('div');
    veil.className = 'ride__veil';
    // self-contained (the effect may live without the site's CSS): the page's black, under a topbar (z 60)
    veil.style.cssText = 'position:fixed;inset:0;z-index:45;background:var(--bg,#0a0a0a);opacity:0;pointer-events:none';
    document.body.append(veil);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fade = (from, to, duration, easing) => veil.animate([{ opacity: from }, { opacity: to }], { duration: reduced ? 1 : duration, easing, fill: 'forwards' }).finished;
    const frames = (n) => new Promise((r) => { const step = () => (n-- ? requestAnimationFrame(step) : r()); step(); });
    fade(0, 1, 300, 'cubic-bezier(0.65, 0, 0.35, 1)')
      .then(() => {
        scrollToY(trigger.end, { immediate: true }); // the last slide, the ride about to let go
        return frames(2);
      })
      .then(() => fade(1, 0, 450, 'cubic-bezier(0.16, 1, 0.3, 1)'))
      .then(() => {
        veil.remove();
        // on, so the next block shows while the slides are still in sight above
        scrollToY(trigger.end + Math.round(window.innerHeight * 0.45), { duration: 1.2 });
        return new Promise((r) => setTimeout(r, reduced ? 0 : 1250));
      })
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

  const mm = gsap.matchMedia();
  mm.add(mq, () => {
    on = true;
    ride.classList.add('is-on');
    list.classList.remove('is-stacked');
    // the panels are not revealed one by one (the ride lights them), and the stack effect is off
    const sr = panels.filter((p) => p.hasAttribute('data-sr'));
    sr.forEach((p) => { p.removeAttribute('data-sr'); gsap.set(p, { clearProps: 'opacity,visibility,transform' }); });
    bigs.forEach((b) => { b.hidden = false; });

    // one slide per screen: every panel as wide as the stage (CSS reads --panel-w), set before each measure
    const sizePanels = () => ride.style.setProperty('--panel-w', `${ride.clientWidth}px`);
    sizePanels();
    ScrollTrigger.addEventListener('refreshInit', sizePanels);
    const bar_ = topbarHeight;
    const track = gsap.to(list, {
      x: () => -travel(),
      ease: 'none',
      scrollTrigger: {
        trigger: ride,
        start: () => `top ${bar_()}px`,
        end: () => `+=${Math.round(travel() * PX_PER_SCREEN)}`,
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

    // paging: inside the ride one wheel gesture turns one slide (a glide; the rest of that gesture,
    // the trackpad's momentum included, is swallowed). Coming from above or below, the scroll lands
    // softly on the first or the last slide; one more gesture past them and the page goes on as
    // usual. A sideways swipe turns the slides too. Wheel events are caught before Lenis sees them.
    let paging = false;
    let armed = true; // the next gesture may turn a slide
    let lastWheel = 0;
    let lastAbs = 0;
    const EDGE = 2;
    const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const swallow = (e) => {
      if (e.cancelable) e.preventDefault();
      e.lenisStopPropagation = true; // Lenis skips an event marked so
    };
    const turnTo = (i) => {
      const lenis = getLenis();
      const y = scrollFor(i);
      if (y == null) return;
      paging = true;
      armed = false;
      const done = () => { paging = false; };
      if (lenis) lenis.scrollTo(y, { duration: 1, easing: inOut, lock: true, force: true, onComplete: done });
      else {
        window.scrollTo({ top: y, behavior: 'smooth' });
        setTimeout(done, 900);
      }
    };
    const onWheel = (e) => {
      if (!trigger || e.ctrlKey) return;
      const lenis = getLenis();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = (sideways ? e.deltaX : e.deltaY) * unit;
      const abs = Math.abs(delta);
      const now = e.timeStamp || performance.now(); // when the input happened, not when it got through
      // a new gesture: after a pause, or a push clearly stronger than the fading one before it
      const fresh = now - lastWheel > 180 || (abs > lastAbs * 1.6 && abs > 6);
      lastWheel = now;
      lastAbs = abs;
      if (!delta) return;
      const { start, end } = trigger;
      const y = lenis ? lenis.animatedScroll : window.scrollY;
      const inside = y >= start - EDGE && y <= end + EDGE;
      if (skipping || paging) {
        if (inside || skipping) swallow(e);
        return;
      }
      const dir = Math.sign(delta);
      if (inside) {
        if (fresh) armed = true;
        const f = ((y - start) / (end - start || 1)) * (panels.length - 1);
        const near = Math.abs(f - Math.round(f)) < 0.02;
        const to = dir > 0 ? (near ? Math.round(f) + 1 : Math.ceil(f)) : (near ? Math.round(f) - 1 : Math.floor(f));
        // past the first or the last slide: a fresh gesture leaves the ride, a tail stays put
        if (to < 0 || to > panels.length - 1) {
          if (!armed) swallow(e);
          return;
        }
        swallow(e);
        if (armed) turnTo(to);
        return;
      }
      if (sideways) return; // outside the ride a sideways swipe is the browser's (back / forward)
      // on the way in: the scroll may not run past the ride's edge, it settles on it
      const target = (lenis ? lenis.targetScroll : y) + delta;
      const edge = dir > 0 && y < start && target > start ? start : dir < 0 && y > end && target < end ? end : null;
      if (edge == null) return;
      swallow(e);
      armed = false;
      if (lenis) lenis.scrollTo(edge, { programmatic: false, lerp: lenis.options.lerp });
      else window.scrollTo({ top: edge, behavior: 'smooth' });
    };
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });

    // the keyboard and the scrollbar scroll freely: once the scroll rests inside the ride it settles
    // on the nearest slide
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let snapTimer = 0;
    const onScroll = () => {
      clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        if (!trigger || skipping || paging || reducedMotion || performance.now() - lastWheel < 600) return;
        const { start, end } = trigger;
        const at = window.scrollY;
        if (at <= start + EDGE || at >= end - EDGE) return;
        const i = Math.round(((at - start) / (end - start)) * (panels.length - 1));
        const y2 = scrollFor(i);
        if (y2 != null && Math.abs(y2 - at) > EDGE) scrollToY(y2, { duration: 0.8 });
      }, 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('scroll', onScroll);
      clearTimeout(snapTimer);
      ScrollTrigger.removeEventListener('refreshInit', sizePanels);
      ride.style.removeProperty('--panel-w');
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
