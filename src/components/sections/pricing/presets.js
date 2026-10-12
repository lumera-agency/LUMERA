/*
 * 6 · Ціни, the presets (ported 1:1 from website-v2/js/sections.js, framework-free): any link with
 * data-cfg-preset anywhere on the page selects that preset in the configurator and scrolls to the
 * list of presets (under the topbar), with one ring round the chosen one. A click before the
 * configurator is mounted is kept and applied right after the mount (presetReady).
 */
import { topbarHeight } from '@/lib/css';

const $ = (selector, root = document) => root.querySelector(selector);

const preset = { api: null, pending: null, reducedMotion: false };
const topbarH = topbarHeight;

const presetPhone = () => window.matchMedia('(max-width: 700px)').matches;
/** How far below the top of the screen the list of presets should land: just under the topbar. (Phones
 *  used to add the pinned preview and its 32 px fade, which sat above the list until the audit of 10 Oct.) */
function presetOffset() {
  return topbarH() + 16;
}
// phones: the price bar (60 px, 12 px off the bottom) shows once the presets are reached
const presetFloor = () => (presetPhone() ? 84 : 24);

/** The list's top under the topbar (and the phone's preview); further down only as far as it takes for
 *  the chosen preset to be whole above the phone's price bar, never so far that it goes under the top. */
function scrollToPresets(chosen) {
  const list = $('#pricing [data-ref="bundles"]');
  if (!list) return;
  const off = presetOffset();
  let top = list.getBoundingClientRect().top + window.scrollY - off;
  if (chosen) {
    const r = chosen.getBoundingClientRect();
    top = Math.min(Math.max(top, r.bottom + window.scrollY - (window.innerHeight - presetFloor())), r.top + window.scrollY - off);
  }
  window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: preset.reducedMotion ? 'instant' : 'smooth' });
}

/** One ring round the chosen preset (.is-pinged, 650 ms) once it is (almost) whole on screen. */
function pingWhenInView(el) {
  el.classList.remove('is-pinged');
  let timer = 0;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.9)) return;
    io.disconnect();
    clearTimeout(timer);
    el.classList.add('is-pinged');
    setTimeout(() => el.classList.remove('is-pinged'), 700);
  }, { threshold: [0.9, 1], rootMargin: `-${Math.max(0, Math.round(presetOffset() - 24))}px 0px -${presetFloor() - 12}px 0px` });
  io.observe(el);
  timer = setTimeout(() => io.disconnect(), 5000);
}

function goPreset(id, { tune = false, scroll = true } = {}) {
  if (!preset.api) { preset.pending = { id, tune }; return; } // applied right after the mount
  const chosen = $(`#pricing [data-bundle="${CSS.escape(id)}"]`);
  if (!chosen) return;
  preset.api.bundle(id);
  if (tune) preset.api.tune(true);
  if (!scroll) return;
  scrollToPresets(chosen);
  chosen.focus({ preventScroll: true }); // keyboard and screen readers: the live line reads the price
  if (!preset.reducedMotion) pingWhenInView(chosen);
}

function initPresetLinks(reducedMotion) {
  preset.reducedMotion = reducedMotion;
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[data-cfg-preset]');
    if (!a || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    delete document.documentElement.dataset.cfgPending; // main.js may have stashed this same click
    a.closest('dialog')?.close();
    const opts = { tune: a.hasAttribute('data-cfg-tune') };
    requestAnimationFrame(() => goPreset(a.dataset.cfgPreset, opts));
  });
}

/** The configurator is mounted: a preset asked for before (here, or stashed by main.js) is applied now —
 *  chosen at once, then gone to once the page is shown and main.js has made its own jump to #pricing. */
function presetReady(api) {
  if (!api) return;
  preset.api = api;
  const root = document.documentElement;
  const early = root.dataset.cfgPending;
  delete root.dataset.cfgPending;
  const p = preset.pending || (early ? { id: early, tune: false } : null);
  preset.pending = null;
  if (!p) return;
  goPreset(p.id, { tune: p.tune, scroll: false });
  const go = () => {
    let n = 4; // main.js's arrive(): a jump now and one after ScrollTrigger's first refresh (the next frame)
    const frame = () => (n-- ? requestAnimationFrame(frame) : goPreset(p.id));
    frame();
  };
  go(); // the page is in place (the blocks are server-rendered)
}

const keepWhole = (plan) => plan.split(' · ').map((part) => part.replace(/ /g, '\u00a0').replace(/–/g, '–\u2060')).join(' · ');

let started = false;
export function initPresets(reducedMotion) {
  if (started) return;
  started = true;
  initPresetLinks(reducedMotion);
}
export { presetReady, keepWhole };
