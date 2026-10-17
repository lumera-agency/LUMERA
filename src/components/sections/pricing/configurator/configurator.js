/**
 * Lumera · Project Configurator — the block's UI (pd6's structure, art direction of 9 Oct 2026).
 *
 *   mountConfigurator(el, { lang, reducedMotion, assets, onDiscuss, tuneOpen })
 *     → { getConfig, setConfig, bundle, tune, editor, face, sheet, project, fx, destroy }
 *
 * One state object (`cfg`, always normalize()d). Every change runs update(): flags, numbers, lists,
 * the preview. Bundles first, the controls under «Налаштувати», the price always on screen (≥701: the
 * sticky summary at the top of the right column; ≤700: the bottom bar). The breakdown is one renderer
 * with two hosts: the face over the preview (≥701) and a bottom-sheet <dialog> (≤700).
 * ≤700 the controls and the preview don't sit in the page: «Зібрати свій варіант» opens them in a
 * full-screen <dialog> (the editor: the preview on top, the groups' chips, the controls, the price and
 * «Готово»), so nothing is held over the page while it scrolls. The phone's «back» shuts it too (it
 * opens with a history entry of its own); shut, the card says what was put together.
 * Both calls to action are the site's own button (.btn.btn--primary: ember, dark text, the arrow).
 * Nothing here changes the height of anything above or beside what was tapped: rows show a reason
 * tag instead of swapping their sub-line; the two bundle notes share one cell (the taller one sets it).
 * Event: 'lumera:configurator-change' as before.
 */
import { BUNDLES, PRICING, DEFAULT_CONFIG, normalize, isAvailable, applyBundle, optionPrice, calculateProject, money, addonTag, hasAds } from './engine.js';
import { STRINGS } from './strings.js';
// the preview: the «Дизайн і сайти» page's sample sites (owner, 17 Oct 2026: the same four examples here; one design level)
import { mountPreview } from '@/components/sites/runtime/sites-pv.js';
import '@/components/sites/sites-pv.css';
import '@/components/sites/clinic/clinic.css';

const escU = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CHEV = '<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 1.5L5.5 4 3 6.5"/></svg>';
// the site's own arrow (index.html .btn__icon): two copies, the second slides in on hover
const ARROW = '<span class="btn__icon" aria-hidden="true"><svg class="arrow arrow--a" viewBox="0 0 24 24"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg><svg class="arrow arrow--b" viewBox="0 0 24 24"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg></span>';
const PLUSI = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path class="v" d="M7 2v10"/><path d="M2 7h10"/></svg>';
const GO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CLOSE = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg>';
const BOOL = ['advancedMotion', 'threeDHero', 'secondLanguage', 'adsManagement'];
const CHIPS = ['format', 'look', 'growth', 'leads']; // the editor's groups (their heads: #cfg-l-…)
const phoneMQ = window.matchMedia('(max-width: 700px)');
// pd8 4.4: up to 1100 px «Що входить у ціну» opens the bottom sheet (≥1101: the card flips to the face)
const sheetMQ = window.matchMedia('(max-width: 1100px)');

export function mountConfigurator(el, { lang = 'uk', assets = {}, reducedMotion = false, onDiscuss, tuneOpen } = {}) {
  const t = STRINGS[lang];
  const state = { cfg: normalize(DEFAULT_CONFIG), lastBundle: null, face: 'preview', tune: tuneOpen ?? !phoneMQ.matches };
  el.classList.add('cfg');
  el.innerHTML = template(t);
  const ref = (n) => el.querySelector(`[data-ref="${n}"]`);
  const all = (sel) => [...el.querySelectorAll(sel)];
  const preview = mountPreview(ref('preview'), { t, lang, assets, reducedMotion, phone: phoneMQ.matches, labels: { take: t.preview.take, auto: t.preview.auto } });
  const sheet = ref('sheet');
  const bar = ref('bar');
  const editor = ref('editor');
  const edScroll = ref('ed-scroll');
  const chips = [...editor.querySelectorAll('[data-chip]')];
  const root = document.documentElement;

  /* ---------- input ---------- */
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bundle]');
    if (b) {
      state.lastBundle = b.dataset.bundle;
      commit(applyBundle(b.dataset.bundle, state.cfg), b);
      return;
    }
    const opt = e.target.closest('[data-group]');
    if (opt) {
      if (opt.getAttribute('aria-disabled') === 'true') return;
      const g = opt.dataset.group;
      const next = { ...state.cfg, [g]: BOOL.includes(g) ? !state.cfg[g] : opt.dataset.value };
      // «Вже є сайт» from the format cards lands where its bundle does (ads on), so both ways cost the same
      if (g === 'format' && next.format === 'existing' && state.cfg.format !== 'existing' && next.growth === 'none' && next.automation === 'none') next.growth = 'googleAds';
      commit(next, opt);
      return;
    }
    const chip = e.target.closest('[data-chip]');
    if (chip) { toGroup(chip.dataset.chip); return; }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'tune') setTune(!state.tune);
    if (act === 'editor') openEditor();
    if (act === 'editor-close') closeEditor();
    if (act === 'break') sheetMQ.matches ? openSheet(e.target.closest('[data-act]')) : setFace(state.face === 'break' ? 'preview' : 'break');
    if (act === 'sheet-close') closeSheet();
    if (act === 'open-form') discuss();
  });
  // arrow keys inside a radio group move the choice, like native radios (skips disabled ones)
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.face === 'break') { setFace('preview'); ref('break-btn').focus(); return; }
    const opt = e.target.closest('[role="radio"]');
    if (!opt || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    const list = [...opt.closest('[role="radiogroup"]').querySelectorAll('[role="radio"]')].filter((x) => x.getAttribute('aria-disabled') !== 'true');
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const next = list[(list.indexOf(opt) + step + list.length) % list.length];
    e.preventDefault();
    next.focus();
    next.click();
  });
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); }); // the backdrop
  sheet.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(); }); // Esc
  editor.addEventListener('cancel', (e) => { e.preventDefault(); closeEditor(); });
  // pd8 4.4: across 1100 px neither the sheet nor the face stays open on the wrong side; the button says what it opens
  function syncSheetMQ() {
    const btn = ref('break-btn');
    if (sheetMQ.matches) {
      if (state.face === 'break') setFace('preview');
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.removeAttribute('aria-expanded');
    } else {
      if (sheet.open) closeSheet();
      btn.removeAttribute('aria-haspopup');
      btn.setAttribute('aria-expanded', String(state.face === 'break'));
    }
  }
  sheetMQ.addEventListener('change', syncSheetMQ);

  /* ---------- state ---------- */
  function commit(next, source) {
    const before = calculateProject(state.cfg);
    state.cfg = normalize(next);
    update();
    const after = calculateProject(state.cfg);
    if (before.once !== after.once || before.monthly !== after.monthly) bump();
    if (phoneMQ.matches && source && !editor.contains(source)) clearBar(source);
  }

  function setTune(open) {
    state.tune = open;
    const body = ref('tune-body');
    ref('tune-btn').setAttribute('aria-expanded', String(open));
    body.hidden = !open;
    el.classList.toggle('is-tuned', open);
    // instant reveal, no height animation: the groups only fade/rise in (transform + opacity)
    if (open && !reducedMotion) body.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  function setFace(face) {
    state.face = face;
    const view = ref('view');
    view.dataset.face = face;
    const on = face === 'break';
    ref('break-btn').setAttribute('aria-expanded', String(on));
    ref('break-btn').querySelector('span').textContent = on ? t.summary.breakdownClose : t.summary.breakdownOpen;
    ref('break').toggleAttribute('inert', !on);
    ref('preview').toggleAttribute('inert', on);
    syncPause();
    if (on) ref('break').querySelector('h3').focus({ preventScroll: true });
  }

  function openSheet(opener) {
    state.opener = opener;
    const p = calculateProject(state.cfg);
    ref('sheet-name').textContent = t.name(p.nameParts);
    ref('sheet-price').textContent = money(p.once) + ' ' + t.once + (p.monthly ? ' · +' + money(p.monthly) + t.perMonth : '');
    sheet.showModal();
    syncPause();
    bar.classList.add('is-hidden');
    requestAnimationFrame(() => sheet.classList.add('is-open'));
    sheet.querySelector('.cfg-sheet__close').focus({ preventScroll: true });
  }
  function closeSheet() {
    if (!sheet.open) return;
    sheet.classList.remove('is-open');
    const done = () => { sheet.close(); syncPause(); syncBar(); state.opener?.focus({ preventScroll: true }); };
    reducedMotion ? done() : setTimeout(done, 280);
  }

  /** the cube and the silk rest while nothing shows them: the face over them, the sheet over all, or (≤700) the editor shut */
  function syncPause() {
    preview.pause(state.face === 'break' || sheet.open || (phoneMQ.matches && !editor.open));
  }

  /* ---------- ≤700: the editor ---------- */
  function openEditor() {
    if (editor.open) return;
    state.editorOpener = document.activeElement;
    editor.showModal();
    root.classList.add('cfg-editing'); // the page under it holds still (base.css)
    history.pushState({ ...history.state, cfgEditor: true }, '');
    edScroll.scrollTop = 0;
    markChip();
    syncPause();
    syncBar();
    requestAnimationFrame(() => editor.classList.add('is-open'));
    editor.querySelector('.cfg-editor__close').focus({ preventScroll: true });
  }
  function closeEditor({ fromHistory = false, instant = false } = {}) {
    if (!editor.open || editor.classList.contains('is-closing')) return;
    editor.classList.remove('is-open');
    editor.classList.add('is-closing');
    const done = () => {
      editor.classList.remove('is-closing');
      editor.close();
      root.classList.remove('cfg-editing');
      syncPause();
      syncBar();
      state.editorOpener?.focus?.({ preventScroll: true });
    };
    reducedMotion || instant ? done() : setTimeout(done, 320);
    // shut by its own buttons: its history entry goes too, so «back» then leaves nothing behind
    if (!fromHistory && history.state?.cfgEditor) history.back();
  }
  const onHistory = () => closeEditor({ fromHistory: true });
  window.addEventListener('popstate', onHistory);
  // a reload with the editor open: the entry stays, the flag goes
  if (history.state?.cfgEditor) history.replaceState({ ...history.state, cfgEditor: false }, '');

  // the chips: a tap brings its group to the top; the one being read is marked
  const groupOf = (id) => el.querySelector('#cfg-l-' + id)?.closest('.cfg__group');
  const topIn = (node) => node.getBoundingClientRect().top - edScroll.getBoundingClientRect().top + edScroll.scrollTop;
  function toGroup(id) {
    const group = groupOf(id);
    if (!group) return;
    edScroll.scrollTo({ top: topIn(group) - 12, behavior: reducedMotion ? 'auto' : 'smooth' });
  }
  function markChip() {
    const atEnd = edScroll.scrollTop + edScroll.clientHeight >= edScroll.scrollHeight - 2;
    let current = CHIPS[0];
    for (const id of CHIPS) {
      const group = groupOf(id);
      if (group && (topIn(group) - edScroll.scrollTop <= 48 || atEnd)) current = id;
    }
    chips.forEach((c) => c.setAttribute('aria-current', String(c.dataset.chip === current)));
  }
  let chipFrame = 0;
  edScroll.addEventListener('scroll', () => { if (!chipFrame) chipFrame = requestAnimationFrame(() => { chipFrame = 0; markChip(); }); }, { passive: true });

  // ≤700 the preview and the controls live in the editor; wider, in the page, as they always were
  function placeControls() {
    const body = ref('tune-body');
    if (phoneMQ.matches) {
      ref('ed-view').append(ref('view'));
      edScroll.append(ref('pnote'), body);
      body.hidden = false;
    } else if (editor.contains(body)) {
      closeEditor({ instant: true });
      el.querySelector('.cfg__side').append(ref('view'), ref('pnote'));
      el.querySelector('.cfg-tune').append(body);
      setTune(state.tune);
    }
    el.querySelector('.cfg-notes__site').textContent = phoneMQ.matches ? t.bundleNotePhone : t.bundleNote;
    syncPause();
  }
  phoneMQ.addEventListener('change', placeControls);

  function discuss() {
    const p = calculateProject(state.cfg);
    const name = t.name(p.nameParts);
    // what sections.js puts into the contact form's plan box (each part unbreakable)
    const parts = [name, money(p.once) + ' ' + t.once];
    if (p.monthly) parts.push('+' + money(p.monthly) + t.perMonth);
    if (p.estimatedWeeksMin != null) parts.push(t.weeks(p.estimatedWeeksMin, p.estimatedWeeksMax));
    // and what the sum is made of, item by item, so whoever answers the request sees the whole project
    const details = p.lines.map((l) => t.items[l.id][0] + ' — ' + (l.price === 0 ? t.included : money(l.price) + (l.period === 'month' ? t.perMonth : '')));
    onDiscuss?.(parts.join(' · '), { config: { ...state.cfg }, estimate: p, name, details });
  }

  /* ---------- the price moved: one pulse on the number (transform) and the bar's ring (opacity) ---------- */
  function bump() {
    if (reducedMotion) return;
    const pulse = [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }];
    for (const n of ['once', 'bar-price', 'ed-price']) ref(n).animate(pulse, { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
    ref('bar-flash').animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 640, easing: 'ease-out' });
  }

  /* ---------- the bar never covers what was just tapped ---------- */
  function clearBar(node) {
    const r = node.getBoundingClientRect();
    const limit = innerHeight - bar.offsetHeight - 24;
    if (r.bottom > limit) window.scrollBy({ top: r.bottom - limit, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  /* ---------- the phone bar: on once the bundles are in view, off over the summary or the sheet ---------- */
  // «reached» = the controls' column is on screen or already above it. (Observing the bundles
  // alone misses a jump that carries them from below the screen to above it in one go.)
  const seen = { bundles: false, sum: false };
  const syncBar = () => {
    const off = !seen.bundles || seen.sum || sheet.open || editor.open;
    bar.classList.toggle('is-hidden', off);
    bar.toggleAttribute('inert', off);
  };
  // the controls count as reached once their top passes 75% of the screen (the bar never covers
  // the first bundle on arrival); the summary hides the bar once a quarter of it is visible
  const main = el.querySelector('.cfg__main');
  const ioMain = new IntersectionObserver((es) => { const e = es[es.length - 1]; seen.bundles = e.isIntersecting || e.boundingClientRect.top < 0; syncBar(); }, { rootMargin: '0px 0px -25% 0px' });
  const ioSum = new IntersectionObserver((es) => { seen.sum = es[es.length - 1].intersectionRatio >= 0.25; syncBar(); }, { threshold: [0, 0.25] });
  ioMain.observe(main);
  ioSum.observe(ref('sum'));

  /* ---------- render ---------- */
  let liveTimer = 0;
  function update() {
    const cfg = state.cfg;
    const p = calculateProject(cfg);
    const name = t.name(p.nameParts);
    el.dataset.format = cfg.format;

    // bundles: the matching one is checked; after a change, the last tapped one says «змінено»
    for (const b of all('[data-bundle]')) {
      const on = p.bundle === b.dataset.bundle;
      b.setAttribute('aria-checked', String(on));
      b.classList.toggle('is-changed', !p.bundle && state.lastBundle === b.dataset.bundle);
    }
    const focusable = all('[data-bundle][aria-checked="true"]')[0] || all('[data-bundle]')[0];
    all('[data-bundle]').forEach((b) => { b.tabIndex = b === focusable ? 0 : -1; });

    // controls
    for (const o of all('[data-group]')) {
      const g = o.dataset.group;
      o.setAttribute('aria-checked', String(BOOL.includes(g) ? !!cfg[g] : cfg[g] === o.dataset.value));
      const ok = isAvailable(g, o.dataset.value, cfg);
      o.setAttribute('aria-disabled', String(!ok));
    }
    // one Tab stop per group of options, like native radios: the chosen one (the arrows move the choice)
    for (const g of all('[role="radiogroup"]')) {
      if (g.closest('[data-ref="bundles"]')) continue; // the bundles keep their own stop (above)
      const radios = [...g.querySelectorAll('[role="radio"]')].filter((r) => r.getAttribute('aria-disabled') !== 'true');
      const stop = radios.find((r) => r.getAttribute('aria-checked') === 'true') || radios[0];
      g.querySelectorAll('[role="radio"]').forEach((r) => { r.tabIndex = r === stop ? 0 : -1; });
    }
    // the add-ons that grow with the site show their price for the chosen format
    ref('price-secondLanguage').textContent = addonTag(optionPrice('secondLanguage', null, cfg));
    ref('price-advancedMotion').textContent = addonTag(optionPrice('advancedMotion', null, cfg));
    for (const g of all('[data-new-only]')) g.classList.toggle('is-off', cfg.format === 'existing');
    // the existing-site path: its two notes (the bundles' note cell, the leads group's fine print)
    ref('notes').dataset.state = cfg.format === 'existing' ? 'existing' : 'site';
    ref('leads-note').hidden = cfg.format !== 'existing';

    // summary, bar
    const once = money(p.once);
    ref('name').textContent = name;
    ref('name').title = name;
    ref('weeks').textContent = p.estimatedWeeksMin == null ? '' : t.weeks(p.estimatedWeeksMin, p.estimatedWeeksMax);
    ref('once').textContent = once;
    const month = ref('month');
    // the monthly management comes with ads only (analytics alone: none)
    month.dataset.state = !hasAds(cfg) ? 'none' : cfg.adsManagement ? 'on' : 'offer';
    // switched off, the monthly sum is an offer («+$150/міс», set small); on, it is the sum
    ref('mnum').textContent = !hasAds(cfg) ? '—' : (cfg.adsManagement ? '' : '+') + money(optionPrice('adsManagement')) + t.perMonth;
    ref('bar-name').textContent = name;
    ref('bar-price').textContent = once;
    ref('bar-month').textContent = p.monthly ? '+' + money(p.monthly) + t.perMonth : '';
    ref('ed-name').textContent = name;
    ref('ed-price').textContent = once;
    ref('ed-month').textContent = ref('bar-month').textContent;
    // the editor's card: an invitation, or (no bundle matches any more) the project put together
    const mine = !p.bundle;
    ref('build').classList.toggle('is-mine', mine);
    ref('build-name').textContent = mine ? t.buildMine + ' · ' + once : t.build[0];
    ref('build-sub').textContent = mine ? name : t.build[1];
    ref('pnote').textContent = t.previewNote[cfg.format !== 'existing' ? 'site' : cfg.growth === 'analytics' ? 'existingStats' : 'existing'];

    // breakdown: the same list in both hosts (face ≥701, sheet ≤700)
    const html = breakdown(t, p);
    for (const host of all('[data-break-list]')) {
      const open = new Set([...host.querySelectorAll('.cfg-line[open]')].map((d) => d.dataset.id));
      host.innerHTML = html;
      host.querySelectorAll('.cfg-line').forEach((d) => { if (open.has(d.dataset.id)) d.open = true; });
    }

    // preview
    preview.update(cfg);
    ref('preview').setAttribute('aria-label', t.preview.aria([
      cfg.format === 'existing' ? t.preview.theirs : t.options.format[cfg.format][0],
      cfg.format !== 'existing' && cfg.advancedMotion && t.options.advancedMotion[0],
      cfg.format !== 'existing' && cfg.threeDHero && t.options.threeDHero[0],
      cfg.format !== 'existing' && cfg.secondLanguage && t.options.secondLanguage[0],
      cfg.growth !== 'none' && t.options.growth[cfg.growth][0],
      cfg.automation !== 'none' && t.options.automation[cfg.automation][0],
    ].filter(Boolean).join(', ')));

    // one calm announcement after the taps settle (the big numbers are not live regions)
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { ref('live').textContent = t.live(name, once, p.monthly ? money(p.monthly) : ''); }, 600);

    el.dispatchEvent(new CustomEvent('lumera:configurator-change', { bubbles: true, detail: { config: { ...cfg }, estimate: p } }));
  }

  setTune(state.tune);
  update();
  syncSheetMQ();
  placeControls();
  return {
    getConfig: () => ({ ...state.cfg }),
    setConfig: (patch) => commit({ ...state.cfg, ...patch }),
    bundle: (id) => { state.lastBundle = id; commit(applyBundle(id, state.cfg)); },
    tune: (open) => (phoneMQ.matches ? (open ? openEditor() : closeEditor()) : setTune(open)),
    editor: (open) => (open ? openEditor() : closeEditor()),
    face: setFace,
    sheet: (on) => (on ? openSheet(ref('bar-open')) : closeSheet()),
    project: () => calculateProject(state.cfg),
    fx: () => preview.fx, // checks and filmstrips (?debug)
    destroy() {
      ioMain.disconnect();
      ioSum.disconnect();
      sheetMQ.removeEventListener('change', syncSheetMQ);
      phoneMQ.removeEventListener('change', placeControls);
      window.removeEventListener('popstate', onHistory);
      root.classList.remove('cfg-editing');
      preview.fx?.destroy();
      el.innerHTML = '';
      el.classList.remove('cfg');
    },
  };
}

/* ---------------------------------------------------------------------------
   Breakdown rows (shared by the face and the sheet)
   --------------------------------------------------------------------------- */
function breakdown(t, p) {
  const row = (l) => {
    const [name, includes, note] = t.items[l.id];
    const price = l.price === 0 ? t.included : money(l.price) + (l.period === 'month' ? t.perMonth : '');
    return '<li><details class="cfg-line" data-id="' + l.id + '"><summary><span class="cfg-line__chev">' + CHEV + '</span><span class="cfg-line__name">' + escU(name) + '</span><span class="cfg-line__price">' + price + '</span></summary>'
      + '<ul class="cfg-line__inc">' + includes.map((x) => '<li>' + escU(x) + '</li>').join('') + '</ul>' + (note ? '<p class="cfg-line__note">' + escU(note) + '</p>' : '') + '</details></li>';
  };
  const once = p.lines.filter((l) => l.period === 'once');
  const month = p.lines.filter((l) => l.period === 'month');
  return '<ul class="cfg-break__list">' + once.map(row).join('') + '</ul>'
    + '<div class="cfg-total"><span>' + escU(t.breakdown.once) + '</span><span class="cfg-total__price">' + money(p.once) + '</span></div>'
    + (month.length ? '<ul class="cfg-break__list">' + month.map(row).join('') + '</ul><div class="cfg-total"><span>' + escU(t.breakdown.monthly) + '</span><span class="cfg-total__price">' + money(p.monthly) + t.perMonth + '</span></div>' : '')
    + '<div class="cfg-extras"><span class="cfg-mono">' + escU(t.breakdown.extras) + '</span><ul>' + t.breakdown.extrasList.map(([a, b]) => '<li>' + escU(a) + '<span>' + escU(b) + '</span></li>').join('') + '</ul></div>'
    + '<p class="cfg-small cfg-break__note">' + escU(t.priceNote) + '</p>';
}

/* ---------------------------------------------------------------------------
   Markup. Built once; update() only flips attributes and refills lists.
   --------------------------------------------------------------------------- */
function template(t) {
  const o = t.options;
  const bundle = (b) => {
    const p = calculateProject(applyBundle(b.id));
    const [name, sub] = t.bundles[b.id];
    return '<button type="button" class="cfg-bundle' + (b.alt ? ' cfg-bundle--alt' : '') + '" role="radio" aria-checked="false" data-bundle="' + b.id + '">'
      + '<span class="cfg-bundle__t"><span class="cfg-bundle__name">' + escU(name) + '<span class="cfg-bundle__changed">' + escU(t.changed) + '</span></span><span class="cfg-bundle__sub">' + escU(sub) + '</span></span>'
      + '<span class="cfg-bundle__p"><span class="cfg-bundle__price">' + money(p.once) + '</span><span class="cfg-mono">' + escU(t.once) + '</span></span></button>';
  };
  const card = (group, value, [name, sub], tag) =>
    '<button type="button" class="cfg-card" role="radio" aria-checked="false" data-group="' + group + '" data-value="' + value + '">'
    + '<span class="cfg-card__t"><span class="cfg-card__name">' + escU(name) + '</span><span class="cfg-card__sub">' + escU(sub) + '</span></span>'
    + '<span class="cfg-card__b"><span class="cfg-price">' + escU(tag) + '</span><span class="cfg-radio" aria-hidden="true"></span></span></button>';
  const row = (kind, group, value, [name, sub], tag, reason = '') =>
    '<button type="button" class="cfg-row" role="' + kind + '" aria-checked="false" data-group="' + group + '"' + (value ? ' data-value="' + value + '"' : '') + '>'
    + '<span class="' + (kind === 'switch' ? 'cfg-switch' : 'cfg-radio') + '" aria-hidden="true"></span>'
    + '<span class="cfg-row__t"><span class="cfg-row__name">' + escU(name) + (reason ? '<span class="cfg-tag cfg-row__why">' + escU(reason) + '</span>' : '') + '</span><span class="cfg-row__sub">' + escU(sub) + '</span></span>'
    + '<span class="cfg-price"' + (['secondLanguage', 'advancedMotion'].includes(group) ? ' data-ref="price-' + group + '"' : '') + '>' + escU(tag) + '</span></button>';
  const head = (id, label, newOnly) => '<p class="cfg-label" id="' + id + '"><span>' + escU(label) + '</span>' + (newOnly ? '<span class="cfg-tag">' + escU(t.newSiteOnly) + '</span>' : '') + '</p>';
  const breakPanel = (id, titleTag) => '<' + titleTag + ' class="cfg-mono cfg-break__t" id="' + id + '" tabindex="-1">' + escU(t.breakdown.title) + '</' + titleTag + '><div data-break-list></div>';

  return `
<div class="cfg__body">
  <div class="cfg__main">
    <div class="cfg-bundles" data-ref="bundles">
      <p class="cfg-label" id="cfg-l-bundles"><span>${escU(t.bundlesLabel)}</span></p>
      <div class="cfg-bundles__list" role="radiogroup" aria-labelledby="cfg-l-bundles">
        ${BUNDLES.filter((b) => !b.alt).map(bundle).join('')}
        <span class="cfg-or" aria-hidden="true">${escU(t.bundleOr)}</span>
        ${BUNDLES.filter((b) => b.alt).map(bundle).join('')}
      </div>
      <div class="cfg-notes" data-ref="notes" data-state="site">
        <p class="cfg__fine cfg-notes__site">${escU(t.bundleNote)}</p>
        <p class="cfg__fine cfg-notes__existing"><span class="cfg-notes__lead">${escU(t.existingNote[0])}</span> ${escU(t.existingNote[1])}</p>
        <p class="cfg__fine cfg-notes__ads">${escU((t.bundleAdsNote || '').replace('{mgmt}', money(optionPrice('adsManagement'))))}</p>
      </div>
    </div>

    <div class="cfg-tune">
      <button type="button" class="cfg-build" data-act="editor" data-ref="build" aria-haspopup="dialog">
        <span class="cfg-build__t"><span class="cfg-build__name" data-ref="build-name">${escU(t.build[0])}</span><span class="cfg-build__sub" data-ref="build-sub">${escU(t.build[1])}</span></span>
        <span class="cfg-build__go" aria-hidden="true">${GO}</span>
        <span class="cfg-build__edit" aria-hidden="true">${escU(t.buildEdit)}</span>
      </button>
      <button type="button" class="cfg-tune__btn" data-act="tune" data-ref="tune-btn" aria-expanded="false" aria-controls="cfg-tune">
        <span class="cfg-tune__t"><span class="cfg-tune__name">${escU(t.tune[0])}</span><span class="cfg-tune__sub">${escU(t.tune[1])}</span></span>
        <span class="cfg-tune__i">${PLUSI}</span>
      </button>
      <div class="cfg-tune__body" id="cfg-tune" data-ref="tune-body" hidden>
        <div class="cfg__group">
          ${head('cfg-l-format', t.groups.format)}
          <div class="cfg__cards cfg__cards--5" role="radiogroup" aria-labelledby="cfg-l-format">
            ${['landing', 'landingPlus', 'corporate', 'ecommerce'].map((v) => card('format', v, o.format[v], money(optionPrice('format', v)))).join('')}
            ${card('format', 'existing', o.format.existing, t.noBuild)}
          </div>
        </div>
        <div class="cfg__group cfg__group--list" data-new-only role="group" aria-labelledby="cfg-l-look">
          ${head('cfg-l-look', t.groups.look, true)}
          ${row('switch', 'advancedMotion', '', o.advancedMotion, addonTag(optionPrice('advancedMotion')))}
          ${row('switch', 'threeDHero', '', o.threeDHero, addonTag(optionPrice('threeDHero')))}
          ${row('switch', 'secondLanguage', '', o.secondLanguage, '')}
        </div>
        <div class="cfg__group cfg__group--list">
          ${head('cfg-l-growth', t.groups.growth)}
          <div role="radiogroup" aria-labelledby="cfg-l-growth">
            ${Object.keys(PRICING.growth).map((v) => row('radio', 'growth', v, o.growth[v], v === 'none' ? '' : addonTag(optionPrice('growth', v)))).join('')}
          </div>
          ${row('switch', 'adsManagement', '', o.adsManagement, '+' + '\u00a0' + money(optionPrice('adsManagement')) + t.perMonth, o.adsManagementOff)}
        </div>
        <div class="cfg__group cfg__group--list">
          ${head('cfg-l-leads', t.groups.leads)}
          <div role="radiogroup" aria-labelledby="cfg-l-leads">
            ${['none', 'lead', 'crmAi'].map((v) => row('radio', 'automation', v, o.automation[v], v === 'none' ? t.included : addonTag(optionPrice('automation', v)), v === 'none' ? o.mailOff : '')).join('')}
          </div>
          <p class="cfg__fine">${escU(t.leadsFine)}</p>
          <p class="cfg__fine" data-ref="leads-note" hidden>${escU(t.leadsOnlyNote)}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="cfg__side">
    <div class="cfg-sum" data-ref="sum">
      <div class="cfg-sum__top"><span class="cfg-mono">${escU(t.summary.kicker)}</span><span class="cfg-mono cfg-sum__weeks" data-ref="weeks"></span></div>
      <p class="cfg-sum__name" data-ref="name"></p>
      <div class="cfg-sum__price">
        <div class="cfg-sum__once"><span class="cfg-sum__num" data-ref="once"></span><span class="cfg-mono">${escU(t.once)}</span></div>
        <div class="cfg-sum__month" data-ref="month" data-state="none">
          <span class="cfg-sum__mnum" data-ref="mnum"></span>
          <span class="cfg-sum__mlabel cfg-mono">${escU(t.monthly)}</span>
          <button type="button" class="cfg-sum__mgmt" role="switch" aria-checked="false" data-group="adsManagement"><span class="cfg-switch cfg-switch--s" aria-hidden="true"></span><span>${escU(t.mgmtShort)}</span></button>
        </div>
      </div>
      <div class="cfg-sum__cta">
        <button type="button" class="btn btn--primary btn--sm cfg-cta" data-act="open-form"><span class="btn__label">${escU(t.summary.cta)}</span>${ARROW}</button>
        <button type="button" class="cfg-link" data-act="break" data-ref="break-btn" aria-expanded="false" aria-controls="cfg-break"><span>${escU(t.summary.breakdownOpen)}</span></button>
      </div>
      <p class="cfg-small">${escU(t.summary.ctaNote)}</p>
      <p class="cfg-small cfg-sum__pnote">${escU(t.priceNote)}</p>
    </div>
    <div class="cfg-view" data-ref="view" data-face="preview">
      <div class="pvw" role="img" data-ref="preview"></div>
      <section class="cfg-break" id="cfg-break" data-ref="break" aria-labelledby="cfg-break-t" inert>
        <div class="cfg-break__head">${breakPanel('cfg-break-t', 'h3')}</div>
      </section>
    </div>
    <p class="cfg__note" data-ref="pnote"></p>
  </div>
</div>

<div class="cfg-bar is-hidden" data-ref="bar" inert>
  <span class="cfg-bar__flash" data-ref="bar-flash" aria-hidden="true"></span>
  <button type="button" class="cfg-bar__t" data-act="break" data-ref="bar-open" aria-haspopup="dialog">
    <span class="cfg-bar__name" data-ref="bar-name"></span>
    <span class="cfg-bar__row"><span class="cfg-bar__price" data-ref="bar-price"></span><span class="cfg-bar__once">${escU(t.once)}</span><span class="cfg-bar__month" data-ref="bar-month"></span><span class="cfg-bar__more" aria-hidden="true">${CHEV}</span></span>
    <span class="visually-hidden">${escU(t.bar.open)}</span>
  </button>
  <button type="button" class="btn btn--primary cfg-bar__cta" data-act="open-form"><span class="btn__label">${escU(t.bar.cta)}</span>${ARROW}</button>
</div>

<dialog class="cfg-sheet" data-ref="sheet" aria-labelledby="cfg-sheet-t">
  <div class="cfg-sheet__in">
    <div class="cfg-sheet__top"><span class="cfg-sheet__grip" aria-hidden="true"></span><button type="button" class="cfg-sheet__close" data-act="sheet-close" aria-label="${escU(t.summary.close)}">${CLOSE}</button></div>
    <div class="cfg-sheet__head"><span class="cfg-sheet__name" data-ref="sheet-name"></span><span class="cfg-sheet__price" data-ref="sheet-price"></span></div>
    ${breakPanel('cfg-sheet-t', 'h3')}
  </div>
</dialog>

<dialog class="cfg-editor" data-ref="editor" aria-labelledby="cfg-editor-t">
  <div class="cfg-editor__top">
    <h3 class="cfg-editor__t" id="cfg-editor-t">${escU(t.editor.title)}</h3>
    <button type="button" class="cfg-editor__close" data-act="editor-close" aria-label="${escU(t.summary.close)}">${CLOSE}</button>
  </div>
  <div class="cfg-editor__view" data-ref="ed-view"></div>
  <nav class="cfg-editor__chips" aria-label="${escU(t.tune[0])}">
    ${CHIPS.map((g) => '<button type="button" class="cfg-chip" data-chip="' + g + '" aria-current="false">' + escU(t.editor.chips[g]) + '</button>').join('')}
  </nav>
  <div class="cfg-editor__scroll" data-ref="ed-scroll" data-lenis-prevent></div>
  <div class="cfg-editor__foot">
    <div class="cfg-editor__bar">
      <span class="cfg-editor__sum">
        <span class="cfg-editor__name" data-ref="ed-name"></span>
        <span class="cfg-editor__row"><span class="cfg-editor__price" data-ref="ed-price"></span><span class="cfg-editor__once">${escU(t.once)}</span><span class="cfg-editor__month" data-ref="ed-month"></span></span>
      </span>
      <button type="button" class="cfg-editor__done" data-act="editor-close">${escU(t.editor.done)}</button>
    </div>
  </div>
</dialog>
<span class="visually-hidden" role="status" data-ref="live"></span>`;
}
