/**
 * The way of a request, played in the configurator's frame (the owner, 9 Nov 2026): the «Реклама й аналітика» page's
 * first-screen scene (ads/runtime/ads-runtime.js, playHero and its loop), on its own for the AdsScheme markup. Four
 * times (Google, Instagram, Facebook, Google; phones three) a light leaves a network, runs down its line into «Ваш
 * сайт», which answers, and on into the list, where the request lands on top with its source and that network's count
 * goes up. Then a pause, the requests fade, a new round. Only while it is on the screen and the tab is shown; hidden
 * (the frame shows the sample or the console), it stops on its start frame. Reduced motion: the final frame, still.
 *
 *   mountAdsFlow(el, { reducedMotion }) → { destroy }
 */
const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const MOVE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const EXIT = 'cubic-bezier(0.4, 0, 1, 1)';
const SPRING = CSS.supports?.('transition-timing-function', 'linear(0, 1)')
  ? 'linear(0, 0.0603, 0.2033, 0.3821, 0.5633, 0.7258, 0.8584, 0.9574, 1.0242, 1.0634, 1.0809, 1.0828, 1.0747, 1.0613, 1.046, 1.0313, 1.0186, 1.0085, 1.0012, 0.9965, 0.994, 0.9931, 0.9933, 0.9941, 0.9953, 0.9966, 0.9978, 0.9988, 1)'
  : 'cubic-bezier(0.34, 1.4, 0.64, 1)';
const STEP = 820; // one request after another
const HOLD = 2600; // the rest on the last frame before the next round

export function mountAdsFlow(el, { reducedMotion = false } = {}) {
  const fl = el.querySelector('.rk-fl');
  if (!fl || reducedMotion || typeof fl.animate !== 'function') return { destroy() {} };
  const $ = (s, scope = fl) => scope.querySelector(s);
  const $$ = (s, scope = fl) => [...scope.querySelectorAll(s)];
  let anims = [];
  let token = 0;
  let timer = 0;
  let visible = false;
  fl.classList.add('is-pre');

  const anim = (node, keyframes, options) => {
    if (!node) return null;
    const a = node.animate(keyframes, { fill: 'backwards', easing: OUT, ...options });
    anims.push(a);
    return a;
  };
  const show = (node, delay, from, duration = 420) => anim(node, [{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], { duration, delay });
  const pop = (node, delay, duration = 560) => {
    anim(node, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay });
    return anim(node, [{ transform: 'translateY(0.75rem) scale(0.94)' }, { transform: 'none' }], { duration, delay, easing: SPRING });
  };

  function play() {
    // newest first, as at rest; only the rows shown (phones hide the oldest)
    const rows = $$('.rk-inbox__row').filter((row) => row.getClientRects().length);
    const n = rows.length;
    const base = 300;
    const runs = $$('.rk-fl__bus .rk-fl__run');
    const link = $('.rk-fl__link .rk-fl__run');
    const hub = $('.rk-fl__hub');
    const COL = { google: 0, insta: 1, fb: 2 };
    const SHIFT_X = ['33.333%', '0%', '-33.333%'];
    const BUS = 640;
    const LINK = 300;
    const glow = [{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.88 }, { opacity: 0 }];
    const times = [];
    const at = {};
    rows.slice().reverse().forEach((row, k) => {
      const t0 = base + k * STEP;
      const i = COL[row.dataset.src];
      const run = runs[i];
      anim(run, [{ translate: '0 0' }, { translate: '0 50%', offset: 0.35 }, { translate: `${SHIFT_X[i]} 50%`, offset: 0.65 }, { translate: `${SHIFT_X[i]} 100%` }], { duration: BUS, delay: t0, easing: 'linear', fill: 'none' });
      anim(run && $('b', run), glow, { duration: BUS, delay: t0, easing: 'linear', fill: 'none' });
      anim(hub, [{ transform: 'none' }, { transform: 'scale(1.06)', offset: 0.4 }, { transform: 'none' }], { duration: 380, delay: t0 + BUS - 80, easing: MOVE, fill: 'none' });
      anim(link, [{ translate: '0 0' }, { translate: '0 100%' }], { duration: LINK, delay: t0 + BUS + 120, easing: 'linear', fill: 'none' });
      anim(link && $('b', link), glow, { duration: LINK, delay: t0 + BUS + 120, easing: 'linear', fill: 'none' });
      const land = t0 + BUS + 120 + LINK - 40;
      times.push(land);
      (at[row.dataset.src] ||= []).push(land);
    });
    const slot = rows.map((row) => row.offsetTop);
    const SHIFT = 400;
    rows.forEach((row, i) => {
      const turn = n - 1 - i; // the bottom row came first
      const t = times[turn];
      pop(row, t);
      show($('.rk-inbox__src', row), t + 160, 'translateX(-0.375rem)');
      anim($('.rk-inbox__tick', row), [{ transform: 'scale(0.3)' }, { transform: 'none' }], { duration: 420, delay: t + 180, easing: SPRING });
      if (!i) return;
      // it comes in at the top and steps down one place as each later one arrives
      const y = (arrived) => `0 ${slot[i - (n - arrived)] - slot[i]}px`;
      const end = times[n - 1] + SHIFT;
      const frames = [{ offset: 0, translate: y(turn + 1) }];
      for (let k = turn + 1; k < n; k++) {
        frames.push({ offset: times[k] / end, translate: y(k), easing: MOVE });
        frames.push({ offset: (times[k] + SHIFT) / end, translate: y(k + 1) });
      }
      anim(row, frames, { duration: end, delay: 0, easing: 'linear' });
    });
    // each network's count stands at zero from the start and goes up as its requests land
    const COUNT = 420;
    for (const li of $$('.rk-fl__src > li')) {
      const strip = $('.rk-part__strip', li);
      const ts = (at[li.dataset.src] || []).sort((p, q) => p - q);
      const k = ts.length;
      if (!strip || !k) continue;
      const end = ts[k - 1] + COUNT;
      const digits = strip.children.length;
      const yy = (j) => `translateY(${((-j * 100) / digits).toFixed(3)}%)`;
      const frames = [{ offset: 0, transform: yy(0) }];
      ts.forEach((tt, j) => {
        frames.push({ offset: tt / end, transform: yy(j), easing: OUT });
        frames.push({ offset: j === k - 1 ? 1 : (tt + COUNT) / end, transform: yy(j + 1) });
      });
      anim(strip, frames, { duration: end, delay: 0, easing: 'linear' });
      ts.forEach((tt) => anim($('.rk-fl__n', li), [{ transform: 'none' }, { transform: 'scale(1.2)', offset: 0.35 }, { transform: 'none' }], { duration: 420, delay: tt - 60, easing: MOVE, fill: 'none' }));
    }
  }

  async function round() {
    const my = ++token;
    anims = [];
    play();
    fl.classList.remove('is-pre'); // (the start frame comes from the animations themselves: fill backwards)
    try { await Promise.all(anims.map((a) => a.finished)); } catch { /* stopped */ }
    if (my !== token) return;
    anims = [];
    timer = setTimeout(async () => {
      if (my !== token || !visible || document.hidden) return;
      const fades = $$('.rk-inbox__row, .rk-fl__n').map((node) => node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: EXIT, fill: 'forwards' }));
      try { await Promise.all(fades.map((a) => a.finished)); } catch { /* cancelled */ }
      if (my !== token || !visible || document.hidden) { fades.forEach((a) => a.cancel()); return; }
      fl.classList.add('is-pre');
      fades.forEach((a) => a.cancel());
      round();
    }, HOLD);
  }
  function stop() {
    token++;
    clearTimeout(timer);
    anims.forEach((a) => a.cancel());
    anims = [];
    fl.classList.add('is-pre');
  }
  // it plays while it is on the screen (its layer shown) and the tab is visible
  let seen = false;
  const sync = () => {
    const v = seen && !document.hidden;
    if (v === visible) return;
    visible = v;
    if (v) round(); else stop();
  };
  const io = new IntersectionObserver(([entry]) => { seen = entry.isIntersecting; sync(); }, { threshold: 0.3 });
  io.observe(fl);
  const onVisibility = () => sync();
  document.addEventListener('visibilitychange', onVisibility);
  return {
    destroy() {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
      fl.classList.remove('is-pre');
    },
  };
}
