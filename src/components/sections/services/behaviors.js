/*
 * 3 · Послуги, the block's own behaviour (ported 1:1 from website-v2/js/sections.js, framework-free):
 *   initServiceMore  «Детальніше» opens the service's dialog (backdrop, × and the preset link close it)
 *   initStack        861–1023 px wide: the rows stick under the topbar and the next one slides over
 *   initServiceTabs  ≤ 600 px: the services as a switcher (chips over one window), auto-advancing once
 * Services.tsx's client part calls initServices() once the block is in the page, and its destroy() when
 * the block goes (a language switch renders it anew).
 */
import { gsap as GSAP, ScrollTrigger as ST } from '@/lib/gsap';
import { holdDemos, openDemos, demoTimeline } from './demos/timelines.js';
import { topbarHeight } from '@/lib/css';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const START_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

function initServiceMore(signal) {
  for (const btn of $$('[data-more]')) {
    const dialog = document.getElementById(btn.dataset.more);
    if (!dialog?.showModal) continue;
    btn.addEventListener('click', () => dialog.showModal(), { signal });
    // the backdrop, the × and the link to the configurator close it (the link then goes on to #pricing)
    dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target.closest('[data-more-close]')) dialog.close(); }, { signal });
  }
}

function initStack(motion, signal) {
  const list = $('.services');
  if (!list) return;
  const cards = $$('.service', list);
  if (cards.length < 2) return;
  const gsap = GSAP;
  const ScrollTrigger = ST;
  const wide = window.matchMedia('(min-width: 861px)');

  cards.forEach((card, i) => {
    card.style.setProperty('--i', i);
    const shade = document.createElement('span');
    shade.className = 'service__shade';
    shade.setAttribute('aria-hidden', 'true');
    card.append(shade);
  });
  const stickyTop = (card) => parseFloat(getComputedStyle(card).top) || 0;

  let tweens = [];
  const clear = () => {
    tweens.forEach((t) => t.scrollTrigger?.kill() || t.kill());
    tweens = [];
  };
  const setup = () => {
    clear();
    if (gsap) gsap.set(cards, { scale: 1 });
    $$('.service__shade', list).forEach((s) => { s.style.opacity = '0'; });

    list.classList.add('is-stacked');
    const lastTop = stickyTop(cards[cards.length - 1]);
    const fits = cards.every((c) => c.offsetHeight + lastTop + 24 <= window.innerHeight);
    // without the fade (reduced motion, no GSAP) sticky rows would only cut each other
    if (!wide.matches || !fits || !motion || !gsap || !ScrollTrigger || list.closest('.ride.is-on')) {
      list.classList.remove('is-stacked');
      return;
    }

    // the row being read is never dimmed: the covered row fades only once the next row's
    // top has come up past the bottom of its demo
    const demoBottom = (card) => {
      const demo = $('.service__demo', card);
      return stickyTop(card) + (demo ? demo.offsetTop + demo.offsetHeight : card.offsetHeight * 0.6);
    };
    cards.slice(0, -1).forEach((card, i) => {
      const next = cards[i + 1];
      const tween = gsap.timeline({
        scrollTrigger: {
          trigger: next,
          start: () => `top ${Math.max(demoBottom(card), stickyTop(next) + 40)}px`,
          end: () => `top ${stickyTop(next)}px`,
          scrub: true,
          invalidateOnRefresh: true,
          // a covered row's demo stops looping — less motion noise under the stack
          onUpdate: (self) => holdDemos(card, self.progress > 0.85),
        },
      });
      // the covered row fades into the page faster than it is covered, so no
      // sliced half of its demo is left above the incoming row's edge
      tween
        .to(card, { scale: 0.94, ease: 'none' }, 0)
        .to($('.service__shade', card), { opacity: 1, ease: 'power1.out' }, 0);
      tweens.push(tween);
    });
  };

  setup();
  let timer = 0;
  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      setup();
      ScrollTrigger?.refresh();
    }, 200);
  };
  wide.addEventListener('change', reset, { signal });
  // a phone fires `resize` whenever its address bar slides in or out while scrolling:
  // only a new width rebuilds the stack (a rebuild mid-scroll would jolt the page)
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    reset();
  }, { signal });

  return () => {
    clearTimeout(timer);
    clear();
    list.classList.remove('is-stacked');
    cards.forEach((card) => card.style.removeProperty('--i'));
    $$('.service__shade', list).forEach((s) => s.remove());
  };
}

const svcPhone = window.matchMedia('(max-width: 600px)');

/** Phones: if the open service's window and title end under the screen's edge, the page comes up just
 *  enough to show them, never past `top` (the chips) under the bar. Returns the frame's id. */
function showOpened(panel, top, reducedMotion) {
  return requestAnimationFrame(() => {
    const end = $('.service__title', panel) || $('.service__demo', panel);
    if (!end) return;
    const under = end.getBoundingClientRect().bottom + 16 - window.innerHeight;
    const room = top.getBoundingClientRect().top - topbarHeight() - 8;
    const by = Math.min(under, room);
    if (by > 0) window.scrollBy({ top: by, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
}

/* The switcher: the four services as tabs (2 × 2 chips) over one window; the services are its panels,
   stacked in one cell, so the block keeps the height of the longest and nothing below moves on a switch.
   A pick: the old one goes (opacity, 120 ms), the new one comes (opacity + 6 px, 240 ms) and its clip
   starts. ← → move one chip, ↑ ↓ a row, Home End; the pick follows the focus. data-auto: the next
   service comes up by itself 2.4 s after a clip rests (before its «↻»), once through, while the window is
   in view; the chosen chip fills as its clip plays. Any click in the block hands it to the visitor. */
const SVC_HOLD = 2400;
function initServiceTabs(reducedMotion, signal) {
  const tablist = $('.service-tabs');
  const list = $('.services');
  if (!tablist || !list) return;
  const tabs = $$('[role="tab"]', tablist);
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  if (!tabs.length || panels.some((p) => !p)) return;
  const motion = !reducedMotion;
  const n = tabs.length;
  let current = 0;
  let auto = motion && tablist.hasAttribute('data-auto');
  let leaving = null; // the old panel fading out: { panel, anims }
  const parts = (panel) => $$(':scope > .service__demo > *, :scope > .service__body', panel);

  const markTabs = () => tabs.forEach((t, k) => {
    t.setAttribute('aria-selected', String(k === current));
    t.tabIndex = k === current ? 0 : -1;
  });
  let on = false;
  let bars = false;
  const set = () => {
    const was = on;
    on = svcPhone.matches;
    tablist.classList.toggle('is-on', on);
    list.classList.toggle('is-tabs', on);
    panels.forEach((p, k) => {
      p.classList.toggle('is-open', on && k === current);
      if (on) {
        p.setAttribute('role', 'tabpanel');
        p.setAttribute('aria-labelledby', tabs[k].id);
      } else {
        p.removeAttribute('role');
        p.removeAttribute('aria-labelledby');
      }
    });
    markTabs();
    if (on && auto && !bars) {
      // the chosen chip fills as its clip plays to its rest frame (a tween in the clip's own timeline,
      // so it pauses, rewinds and replays with it)
      bars = true;
      panels.forEach((p, k) => {
        const bar = $('.service-tab__bar', tabs[k]);
        const tl = demoTimeline($('[data-demo]', p));
        if (bar && tl && tl.labels.rest !== undefined) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: tl.labels.rest, ease: 'none', immediateRender: false }, 0);
      });
    }
    // the clips change only when the switcher does (a wide screen from the start: untouched)
    if (on !== was) panels.forEach((p, k) => openDemos(p, !on || k === current));
  };

  const settle = () => {
    if (!leaving) return;
    const { panel, anims } = leaving;
    leaving = null;
    anims.forEach((a) => a.cancel());
    panel.classList.remove('is-open');
    openDemos(panel, false);
  };
  const show = (k, chosen) => {
    panels.forEach((p, j) => p.classList.toggle('is-open', j === k));
    openDemos(panels[k], true, { chosen });
    if (!motion) return;
    for (const el of parts(panels[k])) {
      el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: START_EASE, fill: 'backwards' });
    }
  };
  const select = (k, { chosen = true } = {}) => {
    if (k === current) return;
    const prev = panels[current];
    current = k;
    markTabs();
    settle(); // a pick while the last one is still fading: that one is dropped
    if (!motion || !prev.classList.contains('is-open')) {
      prev.classList.remove('is-open');
      openDemos(prev, false);
      show(k, chosen);
      return;
    }
    const anims = parts(prev).map((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-in', fill: 'forwards' }));
    leaving = { panel: prev, anims };
    anims[0]?.finished.then(() => {
      if (leaving?.anims !== anims) return;
      settle();
      show(current, chosen);
    }, () => {});
  };

  const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 2, ArrowUp: -2 };
  let opened = 0;
  tabs.forEach((tab, k) => {
    tab.addEventListener('click', () => {
      select(k);
      opened = showOpened(panels[k], tablist, reducedMotion);
    }, { signal });
    tab.addEventListener('keydown', (e) => {
      let to = null;
      if (e.key in step) to = (k + step[e.key] + n) % n;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to === null) return;
      e.preventDefault();
      select(to);
      tabs[to].focus();
    }, { signal });
  });

  let timer = 0;
  let io = null;
  if (auto) {
    let waiting = false;
    let inView = false;
    const stop = () => {
      auto = false;
      clearTimeout(timer);
      tablist.classList.add('is-manual');
    };
    const next = () => {
      if (!auto) return;
      if (!inView) { waiting = true; return; }
      select(current + 1);
    };
    list.addEventListener('demo:rest', (e) => {
      if (!auto || !svcPhone.matches || !panels[current].contains(e.target)) return;
      if (current === n - 1) stop(); // once through: the last one stays
      else timer = setTimeout(next, SVC_HOLD);
    }, { signal });
    io = new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      if (inView && waiting) {
        waiting = false;
        timer = setTimeout(next, 600);
      }
    }, { threshold: 0.5 });
    io.observe(list);
    tablist.addEventListener('click', stop, { signal });
    list.addEventListener('click', stop, { signal });
    tablist.addEventListener('keydown', stop, { signal });
  } else {
    tablist.classList.add('is-manual');
  }
  set();
  svcPhone.addEventListener('change', set, { signal });

  return () => {
    clearTimeout(timer);
    cancelAnimationFrame(opened);
    io?.disconnect();
    leaving?.anims.forEach((a) => a.cancel());
    leaving = null;
    tablist.classList.remove('is-on', 'is-manual');
    list.classList.remove('is-tabs');
    panels.forEach((p) => {
      p.classList.remove('is-open');
      p.removeAttribute('role');
      p.removeAttribute('aria-labelledby');
    });
  };
}

/** Dialogs, the stack (it stands down where the ride is on), the phone switcher, on the block in the
 *  page now; destroy() takes them off again. */
export function initServices({ motion, reducedMotion }) {
  const off = new AbortController();
  initServiceMore(off.signal);
  const stopTabs = initServiceTabs(reducedMotion, off.signal);
  const stopStack = initStack(motion, off.signal);
  return {
    destroy() {
      off.abort();
      stopStack?.();
      stopTabs?.();
    },
  };
}
