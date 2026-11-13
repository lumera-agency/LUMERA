/** Where the pointer is over the backdrop (CSS pixels from its top left corner); `on` while it is over it. */
export type Pointer = { x: number; y: number; on: boolean };

/** One backdrop: sized by its box, drawn a frame at a time (`now` in ms, `dt` the time since the last frame). */
export type Effect = {
  resize: (width: number, height: number, dpr: number) => void;
  draw: (now: number, dt: number) => void;
  dispose: () => void;
};

export type Create = (canvas: HTMLCanvasElement, pointer: Pointer) => Effect | null;
