/*
 * «Потоки»: fine streaks carried by a slow wind across the first screen (after 21st.dev's «Wind Map», drawn our own
 * way): graphite on black, one streak in twenty lime (the system at work). Under the pointer the flow turns into a
 * slow eddy. A 2D canvas: each frame the old trails fade a little and every streak adds its next short step.
 */
import { noise3 } from "./noise";
import type { Create } from "./types";

const INK = "rgba(232, 234, 228, 0.2)";
const LIME = "rgba(218, 255, 2, 0.62)";
/** the field's scale (smaller: wider swirls) and how fast it changes */
const SCALE = 0.0017;
const DRIFT = 0.000045;
/** the eddy round the pointer (px) */
const EDDY = 180;

export const create: Create = (canvas, pointer) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let width = 0;
  let height = 0;
  let count = 0;
  let x = new Float32Array(0);
  let y = new Float32Array(0);
  let life = new Float32Array(0);
  let lime = new Uint8Array(0);

  const spawn = (i: number) => {
    x[i] = Math.random() * width;
    y[i] = Math.random() * height;
    life[i] = 90 + Math.random() * 240;
  };

  return {
    resize(w, h, dpr) {
      width = w;
      height = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = Math.max(900, Math.min(3400, Math.round((w * h) / 380)));
      x = new Float32Array(count);
      y = new Float32Array(count);
      life = new Float32Array(count);
      lime = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        spawn(i);
        lime[i] = Math.random() < 0.06 ? 1 : 0;
      }
    },
    draw(now, dt) {
      const k = Math.min(2.5, dt / 16.7);
      // the old trails fade
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.2, 0.05 * k)})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      const z = now * DRIFT;
      const ink = new Path2D();
      const signal = new Path2D();
      const eddy = pointer.on ? EDDY : 0;
      for (let i = 0; i < count; i++) {
        const px = x[i];
        const py = y[i];
        const angle = noise3(px * SCALE, py * SCALE, z) * 3.4;
        let vx = Math.cos(angle) * 1.15 + 0.32;
        let vy = Math.sin(angle) * 0.9;
        if (eddy) {
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          if (d < eddy) {
            const f = 1 - d / eddy;
            const swirl = f * f * 3.4;
            vx += (-dy / d) * swirl - (dx / d) * f * 0.5;
            vy += (dx / d) * swirl - (dy / d) * f * 0.5;
          }
        }
        const nx = px + vx * k;
        const ny = py + vy * k;
        const path = lime[i] ? signal : ink;
        path.moveTo(px, py);
        path.lineTo(nx, ny);
        x[i] = nx;
        y[i] = ny;
        life[i] -= k;
        if (life[i] < 0 || nx < -20 || nx > width + 20 || ny < -20 || ny > height + 20) spawn(i);
      }
      ctx.lineWidth = 0.9;
      ctx.lineCap = "round";
      ctx.strokeStyle = INK;
      ctx.stroke(ink);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = LIME;
      ctx.stroke(signal);
    },
    dispose() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
};
