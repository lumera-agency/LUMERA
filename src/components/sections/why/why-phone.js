/*
 * 4 · Чому ECLO on phones (≤ 600 px): the four links as an accordion, the owner's pick of 15 Oct 2026
 * (instead of the strip the page's scroll moved sideways). Desktop and tablets keep the table and its
 * relay (why-orbit.js) exactly as they are.
 * A row: the link's glyph and name; open, «Тільки сторінка» against «Система ECLO». The first is open to
 * begin with; each row opens and shuts on its own (opening one doesn't shut another, so nothing above the
 * tapped row moves under the finger). An opened row's glyph tells its story (why-orbit.js STORIES); the
 * first one's, once the list comes into view. The height eases in CSS; a shut row's text is inert. The
 * blocks pinned further down re-measure once the list has settled at its new height.
 * Reduced motion: no stories, an open row's glyph simply lit.
 */
import { STORIES, playStory } from './why-orbit.js';
import { ScrollTrigger } from '@/lib/gsap';

/** Clone the table's glyph into every empty [data-glyph] slot under `scope`; the slot takes its link
 *  from the nearest [data-link]. One source for every glyph. */
function fillGlyphs(why, scope) {
  const src = new Map([...why.querySelectorAll('.w5-row')].map((r) => [r.dataset.link, r.querySelector('.w5-glyph svg')]));
  for (const slot of scope.querySelectorAll('[data-glyph]')) {
    const svg = src.get(slot.dataset.glyph || slot.closest('[data-link]')?.dataset.link);
    if (svg && !slot.firstElementChild) slot.append(svg.cloneNode(true));
  }
}

export function mountAccordion(why, { reducedMotion = false } = {}) {
  const root = why?.querySelector('[data-why-acc]');
  if (!root) return null;
  fillGlyphs(why, root);
  const items = [...root.querySelectorAll('.w5-acc__item')];
  const isOpen = (item) => item.classList.contains('is-open');

  const tell = (item) => {
    item.classList.remove('is-accent');
    if (reducedMotion) return item.classList.add('is-accent');
    playStory(item.querySelector('.w5-glyph svg'), STORIES[item.dataset.link], { onAccent: () => isOpen(item) && item.classList.add('is-accent') });
  };
  const set = (item, open) => {
    item.classList.toggle('is-open', open);
    if (!open) item.classList.remove('is-accent');
    item.querySelector('.w5-acc__btn').setAttribute('aria-expanded', String(open));
    item.querySelector('.w5-acc__panel').inert = !open;
  };
  items.forEach((item) => set(item, isOpen(item)));

  const offs = items.map((item) => {
    const button = item.querySelector('.w5-acc__btn');
    const toggle = () => {
      set(item, !isOpen(item));
      if (isOpen(item)) tell(item);
    };
    button.addEventListener('click', toggle);
    return () => button.removeEventListener('click', toggle);
  });

  // the list's height eases for half a second: the blocks below re-measure once it has held still
  let height = root.offsetHeight;
  let settle = 0;
  const ro = new ResizeObserver(() => {
    if (root.offsetHeight === height) return;
    height = root.offsetHeight;
    clearTimeout(settle);
    settle = setTimeout(() => ScrollTrigger.refresh(), 150);
  });
  ro.observe(root);

  const seen = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    seen.disconnect();
    items.filter(isOpen).forEach(tell);
  }, { threshold: 0.5 });
  seen.observe(root);

  return {
    destroy() {
      offs.forEach((off) => off());
      ro.disconnect();
      seen.disconnect();
      clearTimeout(settle);
    },
  };
}
