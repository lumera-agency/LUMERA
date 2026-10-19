/* «Дизайн і сайти» (Next): copied from the static page's js/sites-fx-how.js (the working folder); unchanged. */
/*
 * «Дизайн і сайти» · block 4 «Як працюємо» (round 11, 15 Oct 2026): the board «Креслення» and its stages.
 * Styles: css/sites-fx-how.css (the layout ideas and their sources are listed there). The time row, the call to action
 * and the entrance scene live in js/sites-page.js (they need the engine's numbers and the scene queue).
 *
 * The board shows the «Ваш бренд» landing in five states, one per stage:
 *   1 the plan (the call's bubbles, the plan sheet) · 2 the grey scheme, the client's stamp lands · 3 the design wipes
 *   in over the scheme, the phone rises · 4 the test address: a cursor clicks, the pin «Ваші правки» · 5 live: the test
 *   request arrives, «Доступи у вас».
 * Which state: the stage whose row has crossed the reading line (45 % down the screen; on phones just under the sticky
 * board), or the row under the mouse. A row that crosses the line fills its ticks, once; they stay. The ribbon's segments
 * fill up to the state shown, and scroll to their row.
 * Motion: WAAPI on transform / opacity, a state swap at a time (a fast scroll finishes the old one); a scroll listener
 * only while the block is near the screen; nothing at rest; without motion every swap is instant.
 * Phones (round 12, ≤ 600 px): the board is not pinned. It goes through the five states once by itself while it is on
 * screen (paused when it leaves, a tap on the ribbon takes over; without motion it shows the last state), the reading
 * line only fills the rows, and each row's list folds under a button.
 */
const SETTLE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const POP = 'cubic-bezier(0.34, 1.4, 0.64, 1)';
const OUT = 'cubic-bezier(0.4, 0, 1, 1)';
const ON = { 1: ['paper', '1'], 2: ['paper', '2'], 3: ['d', 'p'], 4: ['d', '4'], 5: ['d', '5'] };

export function mountHow({ motion }) {
  const root = document.querySelector('[data-how]');
  const board = root?.querySelector('[data-board]');
  const list = root?.querySelector('[data-how-list]');
  if (!root || !board || !list) return null;
  const vp = board.querySelector('.st-bd__vp');
  const layers = new Map([...vp.querySelectorAll('[data-l]')].map((el) => [el.dataset.l, el]));
  const urls = [...board.querySelectorAll('.st-bd__u')];
  const segs = [...board.querySelectorAll('.st-bd__seg')];
  const rows = [...list.querySelectorAll('.st-hw')];
  const narrow = matchMedia('(max-width: 860px)');
  const phone = matchMedia('(max-width: 600px)');
  // (QA 19 Oct, S-01) the board is not pinned on a phone, held upright or on its side (a low screen up to 860 px wide):
  // there it plays its five states by itself and the ribbon shows a state (sites.css, the same query)
  const solo = matchMedia('(max-width: 600px), (max-width: 860px) and (max-height: 600px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const q = (sel) => vp.querySelector(sel);

  // phones take the 600-px copy of the design; both pictures load once the block is near
  const imgs = [...vp.querySelectorAll('img')];
  if (matchMedia('(max-width: 600px)').matches) {
    const d = q('.st-bd__img');
    if (d) d.src = d.getAttribute('src').replace(/(-s)?\.jpg$/, '-s.jpg');
  }
  const near = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    near.disconnect();
    imgs.forEach((img) => { img.loading = 'eager'; });
  }, { rootMargin: '900px 0px' });
  near.observe(root);

  let shown = 1;
  let active = 0;
  let hover = 0;
  let fx = [];
  const add = (a) => { if (a) fx.push(a); return a; };

  const paintRibbon = (n) => {
    segs.forEach((seg, i) => {
      seg.classList.toggle('is-fill', i < n);
      if (i + 1 === n) seg.setAttribute('aria-current', 'step');
      else seg.removeAttribute('aria-current');
    });
  };

  /* ---------- a layer comes in / goes ---------- */
  const enter = (key, el, prev) => {
    if (key === 'd') {
      if (prev > 2) return;
      // the design wipes in from the left over the scheme: the frame moves in, the picture holds still inside it
      add(q('.st-bd__wipe').animate([{ transform: 'translate3d(-100%, 0, 0)' }, { transform: 'none' }], { duration: 900, easing: SETTLE }));
      add(q('.st-bd__wipe-in').animate([{ transform: 'translate3d(100%, 0, 0)' }, { transform: 'none' }], { duration: 900, easing: SETTLE }));
      add(q('.st-bd__tag--d').animate([{ opacity: 0, transform: 'translate3d(0, 6px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 700, easing: SETTLE, fill: 'backwards' }));
      return;
    }
    if (key === 'p') {
      add(el.animate([{ opacity: 0, transform: 'translate3d(0, 30%, 0)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: prev <= 2 ? 300 : 120, easing: SETTLE, fill: 'backwards' }));
      return;
    }
    if (key === 'paper') {
      add(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: SETTLE }));
      return;
    }
    add(el.animate([{ opacity: 0, transform: 'translate3d(0, 12px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 120, easing: SETTLE, fill: 'backwards' }));
  };
  const leave = (key, el, next) => {
    // under the wipe the scheme (and its paper) stays until the design has covered it
    if ((key === '2' || key === 'paper' || key === '1') && next === 3) {
      add(el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.78 }, { opacity: 0 }], { duration: 1100, easing: 'linear' }));
      return;
    }
    add(el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate3d(0, -8px, 0)' }], { duration: 260, easing: OUT }));
  };
  /* ---------- each state's own small event ---------- */
  const extras = (n) => {
    if (n === 2) {
      add(q('.st-bd__stamp').animate([{ opacity: 0, transform: 'rotate(-10deg) scale(1.25)' }, { opacity: 1, transform: 'rotate(-6deg) scale(1)' }], { duration: 420, delay: 480, easing: POP, fill: 'backwards' }));
      vp.querySelectorAll('.st-bd__lead').forEach((lead, i) => add(lead.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: 220 + i * 90, easing: SETTLE, fill: 'backwards' })));
    } else if (n === 4) {
      const cur = q('.st-bd__cur');
      add(cur.animate([{ opacity: 0, transform: 'translate3d(-520%, 360%, 0)' }, { opacity: 1, offset: 0.2 }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 200, easing: SETTLE, fill: 'backwards' }));
      add(cur.animate([{ transform: 'none' }, { transform: 'scale(0.8)' }, { transform: 'none' }], { duration: 160, delay: 920 }));
      add(q('.st-bd__pin').animate([{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 1040, easing: POP, fill: 'backwards' }));
      add(q('.st-bd__note').animate([{ opacity: 0, transform: 'translate3d(0, 8px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 1160, easing: SETTLE, fill: 'backwards' }));
    } else if (n === 5) {
      add(q('.st-bd__toast').animate([{ opacity: 0, transform: 'translate3d(0, 16px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 260, easing: SETTLE, fill: 'backwards' }));
      add(q('.st-bd__ok').animate([{ transform: 'scale(0.4)' }, { transform: 'none' }], { duration: 420, delay: 560, easing: POP, fill: 'backwards' }));
      add(q('.st-bd__acc').animate([{ opacity: 0, transform: 'translate3d(0, 6px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 480, easing: SETTLE, fill: 'backwards' }));
    }
  };

  const setStage = (n) => {
    if (n === shown) return;
    const prev = shown;
    shown = n;
    // a fast scroll: the last swap jumps to its end before the next one starts
    fx.forEach((a) => { try { a.finish(); } catch { a.cancel(); } });
    fx = [];
    const want = new Set(ON[n]);
    const had = new Set(ON[prev]);
    for (const [key, el] of layers) {
      const on = want.has(key);
      if (on === had.has(key)) continue;
      el.classList.toggle('is-on', on);
      if (!motion) continue;
      if (on) enter(key, el, prev);
      else leave(key, el, n);
    }
    for (const u of urls) {
      const on = u.dataset.u === String(n);
      u.classList.toggle('is-on', on);
      if (on && motion) add(u.animate([{ opacity: 0, transform: 'translate3d(0, 4px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 80, easing: SETTLE, fill: 'backwards' }));
    }
    paintRibbon(n);
    if (motion) extras(n);
  };

  /* ---------- the reading line ---------- */
  const lineY = () => (narrow.matches && !solo.matches ? board.getBoundingClientRect().bottom + 24 : window.innerHeight * 0.45);
  const done = (row) => {
    if (row.classList.contains('is-done')) return;
    row.classList.add('is-done');
    if (!motion) return;
    const r = row.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    row.querySelectorAll('.st-hw__tick').forEach((tick, i) => {
      tick.animate([{ transform: 'scale(0.4)' }, { transform: 'none' }], { duration: 420, delay: i * 70, easing: POP, fill: 'backwards' });
    });
  };
  let frame = 0;
  const update = () => {
    frame = 0;
    const y = lineY();
    let a = 0;
    rows.forEach((row, i) => { if (row.getBoundingClientRect().top <= y) a = i + 1; });
    for (let i = 0; i < a; i++) done(rows[i]);
    if (a !== active) {
      active = a;
      rows.forEach((row, i) => row.classList.toggle('is-active', i + 1 === a));
    }
    if (!hover && !solo.matches) setStage(Math.max(1, active));
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
  // the scroll is listened to only while the block is near the screen
  let listening = false;
  new IntersectionObserver((es) => {
    const on = es[es.length - 1].isIntersecting;
    if (on && !listening) { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); listening = true; onScroll(); }
    if (!on && listening) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); listening = false; onScroll(); }
  }, { rootMargin: '50% 0px' }).observe(root);
  update();

  /* ---------- the mouse drives the board too; the ribbon scrolls to a stage ---------- */
  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !fine.matches) return;
      hover = i + 1;
      setStage(hover);
    });
  });
  list.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse' || !hover) return;
    hover = 0;
    setStage(Math.max(1, active));
  });
  segs.forEach((seg, i) => {
    seg.addEventListener('click', () => {
      // phones: the ribbon shows that state on the board itself (the board is not pinned over the rows there)
      if (solo.matches) {
        stopTour();
        setStage(i + 1);
        return;
      }
      const row = rows[i];
      if (!row) return;
      const top = row.getBoundingClientRect().top + window.scrollY - lineY() + 12;
      window.scrollTo({ top, behavior: motion ? 'smooth' : 'auto' });
    });
  });
  /* ---------- phones: the board's five states once by itself, while it is on screen ---------- */
  let tour = 0;
  let toured = false;
  const STEP = 2400;
  const stopTour = () => {
    clearTimeout(tour);
    tour = 0;
    toured = true;
  };
  const step = () => {
    tour = 0;
    if (toured) return;
    if (shown >= 5) { toured = true; return; }
    setStage(shown + 1);
    tour = setTimeout(step, STEP);
  };
  if (solo.matches) {
    if (!motion) {
      toured = true;
      setStage(5);
    } else if (typeof IntersectionObserver === 'function') {
      let first = true;
      new IntersectionObserver((es) => {
        const on = es[es.length - 1].isIntersecting;
        if (toured) return;
        clearTimeout(tour);
        tour = 0;
        // the entrance plays first; after a pause the tour goes on from the state it reached
        if (on) tour = setTimeout(step, first ? 1600 : 900);
        if (on) first = false;
      }, { threshold: 0.6 }).observe(board);
    }
  }

  /* ---------- phones: each row's list folds under a button with its own heading ---------- */
  if (phone.matches) {
    list.setAttribute('data-fold', '');
    for (const row of rows) {
      const more = row.querySelector('.st-hw__more');
      const dl = row.querySelector('.st-hw__dl');
      if (!more || !dl) continue;
      more.addEventListener('click', () => {
        const open = !row.classList.contains('is-open');
        row.classList.toggle('is-open', open);
        more.setAttribute('aria-expanded', String(open));
        if (!open || !motion) return;
        dl.querySelectorAll('li').forEach((li, i) => {
          li.animate([{ opacity: 0, transform: 'translate3d(0, 8px, 0)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: i * 50, easing: SETTLE, fill: 'backwards' });
        });
      });
    }
  }

  paintRibbon(shown);
  return { setStage, update };
}
