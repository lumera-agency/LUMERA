/*
 * The tasks' demos (block 3) play by beats: beat 0 is an empty start, the last beat fades it all, the one before it
 * is the held last frame. A part says when it shows: `in` (it is there), `scan` (it is being worked on), `done` (it is
 * decided), `step` (one of the three steps over the window: lit inside its span, ticked after it). A span is a beat
 * («from it on») or [from, until). The server writes each part's state at the held beat into its classes, so the
 * markup is the last frame; DemoRun (client) plays the beats from the same data attributes.
 */
export type Span = number | readonly [number, number];
export type Spec = { in?: Span; scan?: Span; done?: Span; step?: readonly [number, number] };
/** a window's flag: lit through a span, or through any of several */
export type Flag = Span | readonly (readonly [number, number])[];

export const within = (span: Span | undefined, beat: number) =>
  span === undefined ? false : typeof span === "number" ? beat >= span : beat >= span[0] && beat < span[1];

export const lit = (flag: Flag, beat: number) =>
  Array.isArray(flag) && Array.isArray(flag[0]) ? (flag as readonly (readonly [number, number])[]).some((span) => within(span, beat)) : within(flag as Span, beat);

const write = (span: Span) => (typeof span === "number" ? String(span) : `${span[0]}-${span[1]}`);

export const read = (value: string | undefined): Span | undefined => {
  if (!value) return undefined;
  const [from, until] = value.split("-").map(Number);
  return until === undefined ? from : [from, until];
};

/** a part's className (its state at `beat`) and its data attributes */
export function part(base: string, spec: Spec, beat: number) {
  const names = [base];
  const data: Record<string, string> = {};
  if (spec.in !== undefined) {
    data["data-in"] = write(spec.in);
    if (within(spec.in, beat)) names.push("is-in");
  }
  if (spec.scan !== undefined) {
    data["data-scan"] = write(spec.scan);
    if (within(spec.scan, beat)) names.push("is-scan");
  }
  if (spec.done !== undefined) {
    data["data-done"] = write(spec.done);
    if (within(spec.done, beat)) names.push("is-done");
  }
  if (spec.step) {
    data["data-step"] = write(spec.step);
    if (within(spec.step, beat)) names.push("is-on");
    else if (beat >= spec.step[1]) names.push("is-done");
  }
  return { className: names.join(" "), ...data };
}

/** the order of a flight: at a beat, a lit copy of `from`'s words goes over to `to` (`wide`: only while the panes stand side by side) */
export type Flight = { at: number; from: string; to: string; wide?: boolean };
