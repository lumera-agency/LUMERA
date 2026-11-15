/** Where the pointer is over the backdrop (CSS pixels from the screen's top left corner); `on` while it is over it. */
export type Pointer = { x: number; y: number; on: boolean };

/**
 * One backdrop: sized by the screen, drawn a frame at a time (`now` in ms, `dt` the time since the last frame,
 * `scroll` how far the page is scrolled, in CSS px: the backdrop rides along with it, slower, as one long ground).
 */
export type Effect = {
  resize: (width: number, height: number, dpr: number) => void;
  draw: (now: number, dt: number, scroll: number) => void;
  dispose: () => void;
};

export type Create = (canvas: HTMLCanvasElement, pointer: Pointer) => Effect | null;

/** how fast the backdrop rides with the page's scroll (1: with the words) */
export const PARALLAX = 0.42;
