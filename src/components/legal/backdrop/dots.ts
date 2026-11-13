/*
 * «Точки»: a field of dots running out to the horizon like a calm sea (after 21st.dev's «Wave Mesh», drawn our own
 * way). The dots are graphite; the crests of the swell and the dots under the pointer light lime, as the list's dots
 * do under the pointer. A 2D canvas, the dots sorted into a few shades so each shade is one fill.
 */
import type { Create } from "./types";

const COLS = 140;
const ROWS = 58;
/** the nearest and the farthest row (the plane's depth) */
const NEAR = 1.05;
const FAR = 8;
const SHADES = 8;
const LIGHT = 150;

export const create: Create = (canvas, pointer) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let width = 0;
  let height = 0;
  // per shade and colour: x, y, size triples
  const ink: number[][] = Array.from({ length: SHADES }, () => []);
  const lime: number[][] = Array.from({ length: SHADES }, () => []);

  return {
    resize(w, h, dpr) {
      width = w;
      height = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    draw(now) {
      ctx.clearRect(0, 0, width, height);
      for (let s = 0; s < SHADES; s++) {
        ink[s].length = 0;
        lime[s].length = 0;
      }
      const t = now * 0.001;
      const horizon = height * 0.38;
      const focal = Math.max(width, height * 1.4) * 0.6;
      const scale = Math.min(1.4, Math.max(0.7, width / 1440));
      for (let r = 0; r < ROWS; r++) {
        const z = NEAR * Math.pow(FAR / NEAR, r / (ROWS - 1));
        const spread = 2.1 + z * 0.62;
        for (let c = 0; c < COLS; c++) {
          const wx = (c / (COLS - 1) - 0.5) * 2 * spread;
          const wy =
            0.15 * Math.sin(wx * 1.5 + t * 0.55 + z * 0.55) + 0.11 * Math.cos(z * 1.1 - t * 0.42) + 0.05 * Math.sin((wx * 0.8 + z) * 2.4 + t * 0.9);
          const sx = width / 2 + (wx / z) * focal;
          const sy = horizon + ((1.05 - wy) / z) * focal * 0.55;
          if (sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue;
          const near = 1 / z;
          let alpha = Math.min(0.9, 0.1 + near * 0.95);
          let size = Math.max(1, 3.3 * near * scale);
          // the crest of the swell, and the pointer's light
          let glow = Math.max(0, Math.min(1, (wy - 0.13) / 0.1));
          if (pointer.on) {
            const dx = sx - pointer.x;
            const dy = sy - pointer.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < LIGHT) {
              const f = 1 - d / LIGHT;
              glow = Math.max(glow, f * f * 1.2);
              size *= 1 + f * 0.7;
              alpha = Math.min(1, alpha + f * 0.4);
            }
          }
          const shade = Math.min(SHADES - 1, Math.floor(alpha * SHADES));
          (glow > 0.45 ? lime : ink)[shade].push(sx, sy, size);
        }
      }
      for (let s = 0; s < SHADES; s++) {
        const a = (s + 0.5) / SHADES;
        for (const [list, colour] of [
          [ink[s], `rgba(226, 228, 222, ${(a * 0.82).toFixed(3)})`],
          [lime[s], `rgba(218, 255, 2, ${Math.min(1, a * 1.05).toFixed(3)})`],
        ] as const) {
          if (!list.length) continue;
          ctx.fillStyle = colour;
          for (let i = 0; i < list.length; i += 3) {
            const size = list[i + 2];
            ctx.fillRect(list[i] - size / 2, list[i + 1] - size / 2, size, size);
          }
        }
      }
    },
    dispose() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
};
