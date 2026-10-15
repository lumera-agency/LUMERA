/* «Дизайн і сайти» (Next): copied from the static page's js/sites-pv-fx.js (the working folder); one change: while the
   visitor has the sample, the main page's smooth scroll (Lenis) leaves the wheel over it alone (data-lenis-prevent). */
/* «Дизайн і сайти» (/dyzain-i-saity): a copy of the main page's configurator module
 * src/components/sections/pricing/configurator/fx.js (14 Oct 2026), so this page shows the same sample sites.
 * Changes here: module paths; the visitor's own hands (15 Oct: take the sample, scroll it, «Автопрокрутка»); and from
 * the phone audit (15 Oct): a finger takes the sample only on a tap (a swipe scrolls the page), on a phone (≤ 600 px)
 * the tour goes round once and the sample then rests (settle), and the silk and the text effects start the first time
 * the frame is on screen. The original stays the main page's (out of scope here). */
/**
 * Everything that moves in the preview (9 Oct 2026), and only while the frame is «live»: ≥15 % of it on
 * screen, the tab visible, the breakdown face closed. While not live, data-paused on .pvw pauses every
 * CSS loop, the timers stop, the tour, the silk and the marquee pause, and onLive(false) lets the preview
 * pause the 3D video. Reduced motion or Save-Data: nothing moves (the silk draws one still frame).
 *
 * Always (it is how the visitor sees the whole sample site):
 *   - the tour: the page rests on its hero, scrolls slowly to the footer, rests, glides back up; on the
 *     5–7-page site it walks the pages instead (Головна → Послуги → Про нас → Контакти); the studio's
 *     Авторський (a magazine) turns its pages: 2.4 s on each page's head, a glide to the next, a reading
 *     line under its header following along ('flip'). Every change brings it back to the hero first;
 *   - the store: the «У кошик» button pulses and the cart badge counts;
 *   - «Друга мова»: the header's UA/EN switch flips the hero and the menu every few seconds;
 *   - our additions, in their own place (never over the site's text), one card at a time (data-note): the
 *     ad is tapped (a ripple), the Telegram push's icon nods, the CRM window's request shows «15 хв без
 *     відповіді», then «Нагадування надіслано», then moves from «Нові» to «В роботі»; the report's bars
 *     grow;
 *   - the AI-асистент on the sample site (with «CRM і AI-асистент»): the visitor's question, typing dots,
 *     the answer, a hold, again (data-chat); reduced motion shows the answer;
 *   - «У мене вже є сайт»: the story, one step at a time (data-step; the caption is in the browser bar):
 *     their site → the ad in a search → the visit → (the AI-асистент answers) → Telegram / the CRM → the
 *     report, on a loop.
 * With «Анімація» (what the visitor pays for: within 2 s of switching it on the sample site clearly moves,
 * phone too; with it off the site itself is still). React Bits components, MIT + Commons Clause, notices
 * in the files, both modules imported on first use:
 *   - bg-silk.js: «Silk» flowing under the hero (ember-charcoal on Авторський, warm sand on Базовий, paper
 *     on the studio's «Денне світло»);
 *     the GL context is released when the option goes off;
 *   - rb-anim.js: «BlurText» (the headline comes in word by word), «RotatingText» (one word in it swaps
 *     on a loop), «CountUp» (the rating and the stats), «StarBorder» (a light runs round the main call to
 *     action), «LogoLoop» (the materials' logos become a marquee), «ShinyText» (a band of light crosses
 *     the eyebrow's letters), and the icons draw their strokes and bounce, one after another;
 *   - the blocks' entrance and the eyebrow's lines (drift out, the next drifts in), as before.
 * Transform, opacity and filter (the headline's blur; none on the studio's Базовий); the icons' strokes draw
 * by stroke-dashoffset. The studio's Базовий: its side prints open out of the centre one.
 * A quiet sample (state.quiet: the studio's Авторський, «Синя година»): no Silk and none of the loops above;
 * rb-anim.js gives it its own choreography instead (each block enters once, transform/opacity/clip-path only,
 * the sticker's ring the one slow turn).
 *
 * createFx(pvw, { reducedMotion, onLive, onPage }) →
 *   { set(state), page(i), pause(v), step, live, running, silk, rb, destroy() }
 *   state = { motion, quiet, replay, theme, origin, tour: 'scroll'|'pages'|'flip'|'none', restart, lang2, cart, story, chat,
 *             notes: ['ads'|'lead'|'chat'|'crm'|'mgmt'|'stats'], steps: ['site'|'serp'|'visit'|'ai'|'tg'|'crm'|'rep'|'stats'] }
 */
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const GLIDE = 'cubic-bezier(0.45, 0, 0.25, 1)';

export function createFx(pvw, { reducedMotion = false, onLive, onPage, labels = {} } = {}) {
  const vp = pvw.querySelector('.pv-vp');
  const site = () => vp.querySelector('.pv-site:not(.pv-site--old)');
  const still = reducedMotion || navigator.connection?.saveData === true;
  const st = {
    motion: false, quiet: false, theme: 'light', origin: 'top-right', tour: 'scroll', lang2: false, cart: false, story: false,
    visible: false, faced: false, live: null, page: 0,
    timers: {}, anim: null, read: null, silk: null, rb: null, rbSite: null, loading: null, cartN: 2, icon: 0,
    notes: [], note: 0, steps: [], step: 0, stepT: 0, stepOn: false, chat: false, chatT: [],
    user: false, y: 0, ty: 0, raf: 0,
    rest: false, round: false, animDue: false,
  };
  // (this page, 15 Oct, the phone audit) on a phone the tour goes round once and then the sample rests: nothing in it
  // runs (the CSS loops, the timers, the silk, the 3D) until the visitor takes it, changes it or asks for the tour again
  const restMQ = matchMedia('(max-width: 600px)');

  /* ---------- the entrance ---------- */
  function entrance() {
    if (still) return;
    // with «Анімація» the headline comes in word by word (BlurText); until its module is in, it waits hidden
    // (a quiet sample, the studio's «Синя година»: its whole cover waits, then enters by its own choreography)
    const h1 = st.motion ? site()?.querySelector(st.quiet ? '[data-hero]' : '[data-hero] .pv-h1') : null;
    if (h1 && !st.rb) { h1.classList.add('rb-wait'); setTimeout(() => h1.classList.remove('rb-wait'), 700); }
    const threeD = pvw.dataset.threeD === 'on'; // the drawing stays out: the 3D object replaces it
    [...(site()?.querySelectorAll('[data-hero] [data-in]') || [])].filter((el) => el !== h1 && !(threeD && el.matches('[data-slot-default]'))).forEach((el, i) => {
      el.animate([{ opacity: 0, translate: '0 2.2cqw' }, { opacity: 1, translate: '0 0' }], { duration: 640, delay: 80 + i * 60, easing: EASE, fill: 'backwards' });
    });
    // the studio's fan of prints («Денне світло»): the side prints slide out from behind the centre one (one
    // keyframe at offset 0: the end is the pose in CSS); the centre print and the 3D slot stay put
    site()?.querySelectorAll('[data-hero] [data-fan="l"], [data-hero] [data-fan="r"]').forEach((el, k) => {
      el.animate([{ translate: '0 -0.4cqw', rotate: '0deg', opacity: 0, offset: 0 }], { duration: 700, delay: 120 + k * 60, easing: EASE, fill: 'backwards' });
    });
  }

  /* ---------- the visitor's own hands (this page, 15 Oct): a click or a tap on the sample stops the tour where it
     is; from then on the wheel (over the frame) and a finger drag scroll the sample and every control in it works.
     The page keeps its own scroll: before the click the wheel passes through, and at either end of the sample it
     passes on to the page. «Автопрокрутка» (the frame's pill) gives the tour back; so does a new sample. The sample
     still moves by the same translate as the tour (its header stays put); nothing runs at rest. ---------- */
  const scroller = () => site()?.querySelector('.pv-scroll');
  const maxY = () => { const s = scroller(); return s ? Math.max(0, s.offsetHeight - vp.clientHeight) : 0; };
  const clampY = (y) => Math.max(0, Math.min(maxY(), y));
  const nowY = (s) => { const t = getComputedStyle(s).translate; const m = t && t !== 'none' ? t.split(' ') : []; return m.length > 1 ? -parseFloat(m[1]) || 0 : 0; };
  const put = () => { const s = scroller(); if (s) s.style.translate = `0 ${-Math.round(st.y * 10) / 10}px`; };
  function glide() {
    st.raf = 0;
    const d = st.ty - st.y;
    if (Math.abs(d) < 0.5) { st.y = st.ty; put(); return; }
    st.y += d * 0.2;
    put();
    st.raf = requestAnimationFrame(glide);
  }
  function scrollTo(y, instant = false) {
    st.ty = clampY(y);
    if (instant || still) { cancelAnimationFrame(st.raf); st.raf = 0; st.y = st.ty; put(); return; }
    if (!st.raf) st.raf = requestAnimationFrame(glide);
  }
  function takeover() {
    if (st.user) return;
    const s = scroller();
    if (!s) return;
    const y = nowY(s);
    stopTour();
    s.classList.remove('is-touring');
    st.user = true;
    st.y = st.ty = clampY(y);
    put();
    pvw.dataset.user = 'on';
    // (Next) the main page's smooth scroll (Lenis) leaves the wheel over the sample to it while the visitor has it
    vp.setAttribute('data-lenis-prevent', '');
    pill();
    pvw.dispatchEvent(new CustomEvent('pv:user'));
    if (st.rest) { st.rest = false; sync(); }
  }
  function release(start = true) {
    if (!st.user) return;
    st.user = false;
    cancelAnimationFrame(st.raf); st.raf = 0;
    delete pvw.dataset.user;
    vp.removeAttribute('data-lenis-prevent');
    const s = scroller();
    if (s) s.style.translate = '';
    pill();
    if (start) { if (st.live) tour(); else st.tourDue = true; }
  }
  // a section of the sample to the top, under its header (a link inside the sample): the visitor's mode
  function scrollToEl(el) {
    const s = scroller();
    if (!s || !el) return;
    takeover();
    const top = el.getBoundingClientRect().top - s.getBoundingClientRect().top;
    scrollTo(top - (parseFloat(getComputedStyle(s).paddingTop) || 0));
  }
  // the pill: before the click, what the visitor can do; then the way back to the tour
  const you = document.createElement('button');
  you.type = 'button';
  you.className = 'pvw__you';
  pvw.append(you);
  function pill() {
    const user = st.user;
    you.textContent = user ? (labels.auto || 'Автопрокрутка') : (labels.take || 'Гортайте й натискайте самі');
    you.classList.toggle('is-user', user);
  }
  pill();
  you.addEventListener('click', () => (st.user ? release() : takeover()));
  // (15 Oct, the phone audit: a finger landing on the sample took it at once, so the next 12–13 swipes scrolled the
  // sample instead of the page) a mouse takes the sample on a press; a finger or a pen only on a tap (no movement), so
  // a swipe over the sample always scrolls the page
  let tap = null;
  vp.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || e.button !== 0) return;
    if (e.pointerType === 'mouse') { takeover(); return; }
    tap = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  }, { passive: true });
  vp.addEventListener('pointerup', (e) => {
    if (!tap || !e.isPrimary) return;
    const steady = Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 10 && e.timeStamp - tap.t < 600;
    tap = null;
    if (steady) takeover();
  }, { passive: true });
  vp.addEventListener('pointercancel', () => { tap = null; }, { passive: true });
  vp.addEventListener('wheel', (e) => {
    if (!st.user) return; // the page's own scroll until the visitor has taken the sample
    const dy = e.deltaMode === 1 ? e.deltaY * 18 : e.deltaMode === 2 ? e.deltaY * vp.clientHeight : e.deltaY;
    const next = clampY(st.ty + dy);
    if (next === st.ty) return; // an end of the sample: the page takes the wheel
    e.preventDefault();
    scrollTo(next, Math.abs(dy) < 40); // a trackpad's fine steps 1:1, a mouse wheel's notches glide
  }, { passive: false });
  // a finger: the first move decides whether this gesture scrolls the sample or (at its end) the page
  let t0 = null;
  vp.addEventListener('touchstart', (e) => {
    if (!st.user || e.touches.length !== 1) { t0 = null; return; }
    const y = e.touches[0].clientY;
    t0 = { y, from: st.y, last: y, at: e.timeStamp, v: 0, mine: null };
    cancelAnimationFrame(st.raf); st.raf = 0; st.ty = st.y;
  }, { passive: true });
  vp.addEventListener('touchmove', (e) => {
    if (!t0 || !st.user) return;
    const y = e.touches[0].clientY;
    if (t0.mine === null) {
      const dy = t0.y - y;
      if (Math.abs(dy) < 4) return;
      t0.mine = clampY(st.y + dy) !== st.y; // the sample can still move that way
    }
    if (!t0.mine) return;
    e.preventDefault();
    st.y = st.ty = clampY(t0.from + (t0.y - y));
    put();
    const dt = e.timeStamp - t0.at;
    if (dt > 0) t0.v = (t0.last - y) / dt;
    t0.last = y; t0.at = e.timeStamp;
  }, { passive: false });
  vp.addEventListener('touchend', () => {
    if (t0?.mine && Math.abs(t0.v) > 0.15) scrollTo(st.y + t0.v * 280);
    t0 = null;
  }, { passive: true });

  /* ---------- the tour ---------- */
  // (the tour's tracks: the page itself, and on the studio's Авторський the reading line under its header)
  function stopTour() { st.anim?.cancel(); st.anim = null; st.read?.cancel(); st.read = null; }
  // a phone: the round is over; the sample stays on its hero, paused (sync treats it as not live)
  function settle() {
    stopTour();
    site()?.querySelector('.pv-scroll')?.classList.remove('is-touring');
    st.rest = true;
    st.round = false;
    sync();
  }
  function focus(sel) {
    const s = site()?.querySelector('.pv-scroll');
    const el = s?.querySelector(sel);
    if (!el || still) return false;
    const top = el.getBoundingClientRect().top - s.getBoundingClientRect().top; // where it sits in the page
    const pad = s.querySelector('.pv-hdr') ? 0 : parseFloat(getComputedStyle(s).paddingTop);
    const y = Math.max(0, Math.min(s.offsetHeight - vp.clientHeight, top - pad - vp.clientHeight * 0.12));
    if (y < vp.clientHeight * 0.3) return false; // already in the first screen
    stopTour();
    st.anim = s.animate([{ translate: '0 0' }, { translate: `0 ${-y}px`, offset: 0.2, easing: GLIDE }, { translate: `0 ${-y}px`, offset: 0.8 }, { translate: '0 0' }], { duration: 5200, easing: GLIDE });
    st.anim.onfinish = () => tour();
    if (!st.live) st.anim.pause();
    return true;
  }
  function tour() {
    stopTour();
    const s = site()?.querySelector('.pv-scroll');
    if (!s || still || st.tour === 'none') return;
    // the tray covers the frame's bottom edge (desktop): the page scrolls on until its footer clears it
    const tray = pvw.dataset.tray === 'on' ? parseFloat(getComputedStyle(pvw).getPropertyValue('--tray')) || 0 : 0;
    const range = Math.max(0, s.offsetHeight - vp.clientHeight + tray); // a layout read per change, nothing per frame
    const speed = vp.clientWidth * (vp.clientWidth < 500 ? 0.16 : 0.1); // px per second
    const hold = 2.8, scroll = range / speed, rest = 1.6, back = Math.min(2.4, 0.8 + scroll * 0.1);
    s.classList.add('is-touring');
    if (st.tour === 'pages') {
      // one page: rest on its head, read it down, rest, then the next page
      const T = hold + scroll + rest;
      const k = range > 0
        ? [{ translate: '0 0' }, { translate: '0 0', offset: hold / T, easing: GLIDE }, { translate: `0 ${-range}px`, offset: (hold + scroll) / T }, { translate: `0 ${-range}px` }]
        : [{ translate: '0 0' }, { translate: '0 0' }];
      st.anim = s.animate(k, { duration: T * 1000, fill: 'forwards' });
      st.anim.onfinish = () => onPage?.(st.page + 1);
    } else if (st.tour === 'flip') {
      // a magazine (the studio's Авторський): rest on each page's head ([data-page]) for 2.4 s, glide to the
      // next, and after the back cover glide home to the cover; about 30 s for the issue on a desktop. The
      // page tops are read once per change, nothing per frame
      const pad = parseFloat(getComputedStyle(s).paddingTop) || 0;
      const stops = [...new Set([...s.querySelectorAll(':scope > [data-page]')].map((p) => Math.round(Math.min(range, Math.max(0, p.offsetTop - pad)))))];
      if (stops.length < 2) return;
      const HOLD = 2.4, glide = (d) => Math.min(1.4, Math.max(0.75, d / (speed * 6)));
      const marks = []; // [time (s), y (px), page]
      let t = 0;
      stops.forEach((y, i) => {
        marks.push([t, y, i]);
        t += HOLD;
        marks.push([t, y, i]);
        if (i < stops.length - 1) t += glide(stops[i + 1] - y);
      });
      t += Math.min(2.4, 1 + stops[stops.length - 1] / (speed * 12));
      marks.push([t, 0, 0]);
      st.anim = s.animate(marks.map(([m, y]) => ({ translate: `0 ${-y}px`, offset: m / t, easing: GLIDE })), { duration: t * 1000, iterations: Infinity });
      // the reading line: how far into the issue, page by page (the same times: one compositor track more)
      const line = site()?.querySelector('.pv-hdr__read');
      if (line) st.read = line.animate(marks.map(([m, , k]) => ({ scale: `${(k + 1) / stops.length} 1`, offset: m / t, easing: GLIDE })), { duration: t * 1000, iterations: Infinity });
    } else {
      if (range <= 0) return;
      const T = hold + scroll + rest + back;
      st.anim = s.animate([
        { translate: '0 0' },
        { translate: '0 0', offset: hold / T, easing: GLIDE },
        { translate: `0 ${-range}px`, offset: (hold + scroll) / T },
        { translate: `0 ${-range}px`, offset: (hold + scroll + rest) / T, easing: GLIDE },
        { translate: '0 0' },
      ], { duration: T * 1000, iterations: restMQ.matches ? 1 : Infinity });
      if (restMQ.matches) st.anim.onfinish = settle;
    }
    if (!st.live) { st.anim?.pause(); st.read?.pause(); }
  }

  /* ---------- «Анімація»: Silk under the hero + the text/UI ports, on the current page (lazy) ---------- */
  let mods = null;
  function anim(replay = true) {
    const s = site();
    const hero = s?.querySelector('[data-hero]');
    if (!s || !hero) return;
    if (mods) {
      // a quiet sample has no Silk (no canvas, no frame loop): transform/opacity/clip-path only
      if (st.quiet) { st.silk?.destroy(); st.silk = null; }
      else if (st.silk) st.silk.move(hero);
      else if ((st.silk = mods.silk.createSilk(hero, { theme: st.theme }))) requestAnimationFrame(() => st.silk?.canvas.classList.add('is-on'));
      if (st.rbSite !== s) { st.rb?.stop(); st.rb = mods.rb.mountRb(s); st.rbSite = s; if (!still) st.rb.start(); }
      else if (replay && !still) st.rb.replay();
      s.querySelectorAll('.rb-wait').forEach((n) => n.classList.remove('rb-wait'));
      sync();
      return;
    }
    if (st.loading) return;
    st.loading = Promise.all([import('./sites-pv-silk.js'), import('./sites-pv-anim.js')]).then(([silk, rb]) => {
      st.loading = null;
      mods = { silk, rb };
      if (st.motion) anim(true); // (switched off while it loaded: nothing to do)
    }).catch(() => { st.loading = null; });
  }
  function animOff() {
    st.silk?.destroy();
    st.silk = null;
    st.rb?.stop();
    st.rb = null;
    st.rbSite = null;
  }

  /* ---------- the small loops ---------- */
  const inView = (el) => { const r = el.getBoundingClientRect(), v = vp.getBoundingClientRect(); return r.bottom > v.top + 4 && r.top < v.bottom - 4 && r.width > 0; };
  function iconStep() { st.rb?.draw(inView); }
  function rotStep() { st.rb?.rotate(); }
  function wordStep() {
    const box = site()?.querySelector('.pv-words');
    if (!box) return;
    const items = [...box.children];
    const i = Math.max(0, items.findIndex((x) => x.classList.contains('is-on')));
    const cur = items[i], next = items[(i + 1) % items.length];
    cur.classList.remove('is-on');
    next.classList.add('is-on');
    cur.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -0.9em' }], { duration: 420, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
    next.animate([{ opacity: 0, translate: '0 0.9em' }, { opacity: 1, translate: '0 0' }], { duration: 560, delay: 260, easing: EASE, fill: 'both' });
  }
  function wordsReset() {
    for (const box of vp.querySelectorAll('.pv-words')) [...box.children].forEach((x, k) => { x.getAnimations().forEach((a) => a.cancel()); x.classList.toggle('is-on', k === 0); });
  }
  function cartStep() {
    const s = site();
    const n = s?.querySelector('[data-cart]');
    if (!n) return;
    const btn = [...s.querySelectorAll('[data-addcart]')].find(inView);
    btn?.animate([{ scale: '1' }, { scale: '0.94', offset: 0.3 }, { scale: '1.04', offset: 0.65 }, { scale: '1' }], { duration: 520, easing: 'ease-out' });
    setTimeout(() => {
      st.cartN = st.cartN >= 9 ? 1 : st.cartN + 1;
      n.textContent = String(st.cartN);
      n.animate([{ scale: '1' }, { scale: '1.45', offset: 0.4 }, { scale: '1' }], { duration: 420, easing: 'ease-out' });
    }, 260);
  }
  function langStep() { pvw.dataset.lang = pvw.dataset.lang === 'en' ? 'uk' : 'en'; }
  /* ---------- our additions: the tray (desktop), the notifications (phone) ---------- */
  // one card at a time: the next chosen card takes its turn (a lone card replays its own little story)
  const ripple = (el, delay = 0) => el?.animate([{ opacity: 0, scale: '0.4' }, { opacity: 1, scale: '1', offset: 0.35 }, { opacity: 0, scale: '1.5' }], { duration: 900, delay, easing: 'ease-out' });
  const phoneMQ = matchMedia('(max-width: 700px)');
  const turns = () => st.notes; // the AI-асистент's card takes its turn on every screen
  function noteStep() {
    const list = turns();
    if (!list.length) { delete pvw.dataset.note; delete pvw.dataset.noteI; return; }
    st.note = (list.indexOf(pvw.dataset.note) + 1) % list.length;
    noteShow(list[st.note]);
  }
  function noteShow(key, delay = 650) {
    if (!key) return;
    pvw.dataset.note = key;
    pvw.dataset.noteI = turns().indexOf(key);
    const card = pvw.querySelector(`.pv-note[data-k="${key}"]`);
    if (!card || still) return;
    // the ad is tapped; the request's icon nods as it arrives; the CRM card moves on to «В роботі» (the lane
    // is the card's own width plus the 4 px gap: no layout read); the report's bars grow
    if (key === 'ads') ripple(card.querySelector('.pv-tap'), delay + 300);
    if (key === 'lead') card.querySelector('.pv-tg__i').animate([{ scale: '1' }, { scale: '1.35', offset: 0.4 }, { scale: '1' }], { duration: 600, delay, easing: 'ease-out' });
    if (key === 'crm') {
      // «15 хв без відповіді» → «Нагадування надіслано» → the request moves on to «В роботі»
      const lead = card.querySelector('.pv-lead');
      remind(lead, 900);
      lead.animate([{ translate: '0 0' }, { translate: '0 0', offset: 0.44 }, { translate: 'calc(100% + 4px) 0', offset: 0.64, easing: EASE }, { translate: 'calc(100% + 4px) 0' }], { duration: 3400, fill: 'forwards' });
    }
    if (key === 'mgmt' || key === 'stats') card.querySelectorAll('.pv-bars b').forEach((b, i) => b.animate([{ transform: 'scaleY(0.08)' }, { transform: `scaleY(${b.style.getPropertyValue('--h')})` }], { duration: 600, delay: delay + i * 50, easing: EASE, fill: 'backwards' }));
  }
  const storyStep = noteStep; // (the old name, for the ?debug API)
  // the reminder chip: «15 хв без відповіді» now, «Нагадування надіслано» a moment later (both are rendered,
  // one is shown: the chip never changes size)
  function remind(lead, after) {
    // (the phone's one-line CRM shows the same chip after the columns: both switch together)
    const chips = [lead?.querySelector('.pv-remind'), lead?.closest('.pv-lanes')?.querySelector('.pv-remind--static')].filter(Boolean);
    for (const chip of chips) {
      chip.classList.remove('is-sent');
      clearTimeout(chip._t);
      chip._t = setTimeout(() => chip.classList.add('is-sent'), still ? 0 : after);
    }
  }

  /* ---------- the AI-асистент on the sample site: a question, typing, the answer, a hold, again ---------- */
  function chatStep() {
    const box = site()?.querySelector('.pv-chat');
    if (!box) return;
    st.chatT.forEach(clearTimeout);
    box.dataset.chat = 'q';
    st.chatT = [setTimeout(() => { box.dataset.chat = 'typing'; }, 600), setTimeout(() => { box.dataset.chat = 'answer'; }, 1800)];
  }
  function chatStill() {
    st.chatT.forEach(clearTimeout);
    st.chatT = [];
    const box = site()?.querySelector('.pv-chat');
    if (box) box.dataset.chat = 'answer';
  }

  /* ---------- «У мене вже є сайт»: the story, one step at a time ---------- */
  const STEP_MS = { site: 3200, serp: 3800, visit: 3000, ai: 3800, tg: 3600, crm: 4600, rep: 3800, stats: 3800 };
  function stepShow(i) {
    st.step = i;
    const key = st.steps[i];
    pvw.dataset.step = key;
    if (still) return;
    if (key === 'serp') ripple(pvw.querySelector('.pv-scene--serp .pv-tap'), 2100);
    if (key === 'visit') ripple(site()?.querySelector('.pv-x-btn .pv-tap'), 1300);
    // the AI-асистент answers on their site: typing dots for 0.8 s, then the answer
    const ai = pvw.querySelector('.pv-scene--ai .pv-chat');
    if (ai) { clearTimeout(ai._t); ai.dataset.chat = key === 'ai' ? 'typing' : 'q'; if (key === 'ai') ai._t = setTimeout(() => { ai.dataset.chat = 'answer'; }, 800); }
    const lead = pvw.querySelector('.pv-scene--crm .pv-lead');
    lead?.getAnimations().forEach((a) => { if (!(a instanceof CSSAnimation)) a.cancel(); }); // (its CSS drop-in stays)
    // the new request lands in «Нові», then moves on to «В роботі»: a column (the card + its 2 × 1.4cqw
    // padding) and the 2cqw gap, so no layout read
    if (key === 'crm') {
      remind(lead, 1500); // the reminder first (about 30 % in), then the move
      lead.animate([{ translate: '0 0' }, { translate: '0 0', offset: 0.46 }, { translate: 'calc(100% + 4.8cqw) 0', offset: 0.62, easing: EASE }, { translate: 'calc(100% + 4.8cqw) 0' }], { duration: STEP_MS.crm, fill: 'forwards' });
    }
  }
  function stepNext() {
    clearTimeout(st.stepT);
    if (!st.stepOn || st.steps.length < 2) return;
    st.stepT = setTimeout(() => { stepShow((st.step + 1) % st.steps.length); stepNext(); }, STEP_MS[st.steps[st.step]] || 3400);
  }
  function stepsRun(on) {
    if (on === st.stepOn) return;
    st.stepOn = on;
    if (on) stepNext(); else clearTimeout(st.stepT);
  }
  const timer = (key, on, fn, ms) => {
    if (on && !st.timers[key]) st.timers[key] = setInterval(fn, ms);
    if (!on && st.timers[key]) { clearInterval(st.timers[key]); st.timers[key] = 0; }
  };
  function sync() {
    const live = st.visible && !st.faced && !document.hidden && !st.rest;
    pvw.toggleAttribute('data-paused', !live);
    const go = live && !still;
    // (a quiet sample: none of these loops; its blocks enter once each, rb-anim.js mountCover)
    const loops = go && st.motion && !st.quiet;
    timer('icons', loops, iconStep, 850);
    timer('rotate', loops, rotStep, 2400);
    timer('words', loops, wordStep, 2600);
    timer('cart', go && st.cart, cartStep, 3600);
    timer('lang', go && st.lang2, langStep, 4200);
    // the tray's story (desktop) and the cards taking turns (phone, narrow tray): CSS shows what fits
    timer('note', go && turns().length > 0, noteStep, 3600);
    timer('chat', go && st.chat, chatStep, 5600);
    // their site's story: one step at a time, only while live
    stepsRun(go && st.steps.length > 1);
    for (const a of [st.anim, st.read]) if (a) go ? a.play() : a.pause();
    if (!st.motion && (st.silk || st.rb)) animOff();
    if (st.silk) {
      if (still) st.silk.frame(6);
      else if (live) st.silk.start();
      else st.silk.stop();
    }
    if (st.rb) go ? st.rb.play() : st.rb.pause();
    if (live !== st.live) { st.live = live; onLive?.(live); }
    // the tour asked for while the frame was out of view starts as it comes into view
    if (go && st.tourDue) { st.tourDue = false; tour(); }
    // (15 Oct) the silk and the text effects start the first time the frame is on screen, not at the page's load
    if (go && st.animDue && st.motion) { st.animDue = false; anim(true); }
  }

  const io = new IntersectionObserver((es) => {
    st.visible = es[es.length - 1].intersectionRatio >= 0.15;
    if (!st.visible && st.user) release();
    sync();
  }, { threshold: [0, 0.15] });
  io.observe(vp);
  document.addEventListener('visibilitychange', sync);

  return {
    set(s) {
      const was = st.motion;
      Object.assign(st, { motion: s.motion, quiet: !!s.quiet, tour: s.tour, lang2: s.lang2, cart: s.cart, story: s.story, chat: !!s.chat });
      // the chat starts on its question (and is on its answer at once with reduced motion)
      if (st.chat) (still ? chatStill : chatStep)();
      // the add-ons' cards: a change shows the card just added first (the phone's notification, a narrow tray)
      const notes = s.notes || [];
      const added = notes.find((k) => !st.notes.includes(k));
      st.notes = notes;
      const list = turns();
      const first = added && list.includes(added) ? added : list[Math.min(Math.max(0, list.indexOf(pvw.dataset.note)), list.length - 1)];
      if (list.length) noteShow(first, 450); else { delete pvw.dataset.note; delete pvw.dataset.noteI; }
      // their site's story: a new list starts on the step just added (or on their site); reduced motion
      // keeps one step, the search with the ad if there is one
      const steps = s.steps || [];
      const fresh = steps.join() !== st.steps.join();
      const newStep = steps.find((k) => !st.steps.includes(k));
      st.steps = steps;
      if (!steps.length) { stepsRun(false); delete pvw.dataset.step; }
      else if (fresh) {
        clearTimeout(st.stepT);
        st.stepOn = false;
        stepShow(still ? Math.max(0, steps.indexOf('serp'), steps.length > 1 ? 1 : 0) : Math.max(0, steps.indexOf(newStep)));
      }
      if (s.page != null) st.page = s.page;
      if (s.theme !== st.theme || s.origin !== st.origin) { st.theme = s.theme; st.origin = s.origin; st.silk?.set({ theme: s.theme }); }
      if (st.motion) { if (st.visible) anim(!!s.replay); else st.animDue = true; }
      if (!st.motion && was) wordsReset();
      if (!st.lang2) delete pvw.dataset.lang;
      if (s.restart || !st.anim) {
        // a change wakes a resting sample: the tour goes round once more
        st.round = false;
        if (st.rest) { st.rest = false; sync(); }
        release(false);
        pvw.dataset.lang = 'uk';
        // out of view (the mount, far down the page) the tour waits: it reads the sample site's layout
        if (!st.live) { stopTour(); st.tourDue = true; }
        else if (!(s.focus && focus(s.focus))) tour();
      }
      if (s.replay) entrance();
      sync();
    },
    /** the 5–7-page site showed page i (the tour or a click): read it from its head */
    page(i) {
      st.page = i;
      if (st.motion) anim(true);
      if (st.user) { cancelAnimationFrame(st.raf); st.raf = 0; st.y = st.ty = 0; put(); }
      // a phone: back on the first page after a round of pages, the sample rests
      else if (restMQ.matches && i === 0 && st.round) { settle(); entrance(); return; }
      else { if (i > 0) st.round = true; tour(); }
      entrance(); sync();
    },
    pause(v) { st.faced = v; sync(); },
    step: cartStep, iconStep, wordStep, storyStep, noteStep, langStep, stepShow, chatStep,
    get running() { return !pvw.hasAttribute('data-paused'); },
    get live() { return !!st.live; },
    get silk() { return st.silk; },
    get rb() { return st.rb; },
    get tourAnim() { return st.anim; },
    get user() { return st.user; },
    takeover, release,
    scrollTo: scrollToEl,
    destroy() {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      Object.values(st.timers).forEach(clearInterval);
      clearTimeout(st.stepT);
      st.chatT.forEach(clearTimeout);
      stopTour();
      animOff();
    },
  };
}
