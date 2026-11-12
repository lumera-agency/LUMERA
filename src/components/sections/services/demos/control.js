/*
 * The service clips' state, apart from the clips themselves (timelines.js). The switcher and the stack (behaviors.js)
 * start with the block and hold, open or draw on a clip whether it is built or not: the clips' code comes only as the
 * visitor nears the block (ServicesClient). What was asked of a clip before it was built is kept and handed to it when
 * it is.
 */

/** demo root → { tl, visible, held, active, chosen, done, sync, … } (timelines.js, autoplay) */
export const demoState = new WeakMap();
/** demo root → what the switcher or the stack asked of it before it was built: { held, chosen, opened } */
const asked = new WeakMap();
/** demo root → who waits for its timeline */
const waiting = new WeakMap();

export const gates = { split: true }; // closed while the stone still has to get there
export const gated = new Set();
const regate = () => gated.forEach((state) => state.sync());
document.addEventListener('journey:ready', (e) => {
  // closed only if the stone's route has that moment and hasn't reached it yet
  for (const name of Object.keys(gates)) gates[name] = !e.detail.cues?.includes(name) || e.detail.passed.includes(name);
  regate();
});
for (const name of Object.keys(gates)) {
  document.addEventListener(`journey:${name}`, () => {
    gates[name] = true;
    regate();
  });
}

/** A clip just built (timelines.js): whoever waited gets its timeline, then it takes what was asked of it so far. */
export function registerDemo(root, state) {
  const wish = asked.get(root);
  asked.delete(root);
  demoState.set(root, state);
  const callbacks = waiting.get(root) ?? [];
  waiting.delete(root);
  callbacks.forEach((callback) => callback(state.tl));
  if (!wish) return;
  state.held = wish.held;
  state.chosen = wish.chosen;
  // (opened or closed by the switcher before it was built: back to its start frame as openDemos does, the chip's bar
  // drawn on its timeline with it)
  if (wish.opened !== undefined) state.reset(wish.opened);
  state.sync();
}

/** Hold (or release) the demos inside `container` — e.g. while a stacked row is covered. */
export function holdDemos(container, held) {
  for (const root of container.querySelectorAll('[data-demo]')) {
    const state = demoState.get(root);
    if (!state) {
      asked.set(root, { held: false, chosen: false, ...asked.get(root), held });
      continue;
    }
    if (state.held === held) continue;
    state.held = held;
    if (held) state.rewind(); // covered by the next row: it starts over when uncovered
    state.sync();
  }
}

/** 3 · Послуги on phones, a switcher with one service open at a time (sections.js initServiceTabs):
 *  only its clip may play. Closed (`open` false): held on its start frame — paused, nothing of it
 *  ticks. Opened: back to its start frame, measured afresh (from the layout it has now) and on again;
 *  `chosen` (its chip was picked) plays it as soon as it is in view, wherever it sits on the screen.
 *  Without motion the clips keep their rest frames and this does nothing. */
export function openDemos(container, open, { chosen = false } = {}) {
  for (const root of container.querySelectorAll('[data-demo]')) {
    const state = demoState.get(root);
    if (!state) {
      // (not built yet: done as it is built)
      asked.set(root, { held: !open, chosen: open && chosen, opened: open });
      continue;
    }
    state.held = !open;
    state.chosen = open && chosen;
    state.reset(open);
    state.check?.();
    state.sync();
  }
}

/** A clip's timeline (3 · Послуги's switcher draws its progress on the chosen chip). */
export const demoTimeline = (root) => demoState.get(root)?.tl ?? null;

/** Calls back with a clip's timeline: now if it is built, or once it is. */
export function whenDemo(root, callback) {
  if (!root) return;
  const state = demoState.get(root);
  if (state) callback(state.tl);
  else waiting.set(root, [...(waiting.get(root) ?? []), callback]);
}
