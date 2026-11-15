/*
 * The droplet's slow parts, asked for as early as the page can: its body (built in a Web Worker, a few hundred ms of
 * CPU) and the photo on it. They used to wait for the 3D chunk and its canvas, and the photo even for the body, one
 * after the other, so the droplet came last of the first screen (the owner, 10 Nov 2026: «одновременно с другими
 * анимациями»). Light on purpose, no three.js here: the page's slot starts it on mount, the scene takes the results.
 */
import type { InflateResponse } from "./inflate.worker";

/** The photo on the body (DropletScene loads these with THREE.TextureLoader). */
export const DROPLET_PHOTOS = ["/img/droplet/form-photo.webp", "/img/droplet/form-photo-smooth.webp", "/img/droplet/form-photo-zone.png"];

let body: Promise<InflateResponse> | null = null;
const warmed: HTMLImageElement[] = [];

/** The body's build, started once: every caller gets the same answer. */
export function dropletBody(): Promise<InflateResponse> {
  body ??= new Promise((resolve) => {
    const worker = new Worker(new URL("./inflate.worker.ts", import.meta.url));
    worker.onmessage = (event: MessageEvent<InflateResponse>) => {
      resolve(event.data);
      worker.terminate();
    };
    worker.postMessage(null);
  });
  return body;
}

/** Starts the body and the photo. The photo in the loader's own CORS mode (anonymous), so the loader's later request
 *  is answered from the browser's memory at once; the images are kept until then. */
export function prefetchDroplet() {
  void dropletBody();
  if (warmed.length) return;
  for (const src of DROPLET_PHOTOS) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.src = src;
    warmed.push(image);
  }
}
