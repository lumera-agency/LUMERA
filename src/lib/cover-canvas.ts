/*
 * A still picture laid on a canvas the way `background: center / cover` lays it on a box. For a WebGL effect that finds
 * no graphics card in FULL (lib/perf/mode allowWebGL: a phone is not looked at by the early script and stays FULL,
 * PageSpeed's phone among them): LITE's own picture is a CSS background there, but the same background coming in
 * after the scripts would be the first screen's LCP, seconds in. A canvas is not counted (16 Nov 2026: without it the
 * ads page's fibres and the sites page's lines were plain black there).
 */

/** Draws the picture `pick` names (asked again as the box changes, so a phone's and a computer's picture can differ);
 *  returns the stop. */
export function drawCover(canvas: HTMLCanvasElement, pick: () => string) {
  const pen = canvas.getContext("2d");
  if (!pen) return () => {};
  let picture: HTMLImageElement | null = null;
  let alive = true;
  const draw = () => {
    if (!alive || !picture?.naturalWidth) return;
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(box.width * ratio));
    const height = Math.max(1, Math.round(box.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const scale = Math.max(width / picture.naturalWidth, height / picture.naturalHeight);
    const drawWidth = picture.naturalWidth * scale;
    const drawHeight = picture.naturalHeight * scale;
    pen.clearRect(0, 0, width, height);
    pen.drawImage(picture, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  };
  const load = () => {
    const src = pick();
    if (picture?.getAttribute("src") === src) return draw();
    const next = new Image();
    next.decoding = "async";
    next.onload = () => {
      picture = next;
      draw();
    };
    next.src = src;
  };
  // (it reports the box once at the start too: the first drawing)
  const watch = new ResizeObserver(load);
  watch.observe(canvas);
  return () => {
    alive = false;
    watch.disconnect();
  };
}
