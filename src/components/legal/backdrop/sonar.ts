/*
 * «Сонар»: the contacts page's ground (the owner, 15 Nov 2026: a premium ground picked on 21st.dev, in the main page's
 * language), after 21st.dev's Sonar Grid. A fine grid of dots runs down the whole page and signals cross it as rings:
 * a ring lights the dots it passes in the site's lime (the system's colour), a pale echo follows it, a faint haze marks
 * its front. One ring is already on its way at the first paint, quiet pings keep the grid alive, a click or a tap
 * anywhere sends one from there, and a sent request sends a strong one from the form. The pointer lifts the dots near it.
 *
 * One small WebGL2 shader over the screen (the page is drawn on a fixed canvas: backdrop/Backdrop.tsx).
 */
import { PARALLAX, type Create } from "./types";

/** rings at once */
const MAX = 8;

const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uScroll;
/** the pointer (device px from the screen's top left) and how far it is on (0…1) */
uniform vec3 uPointer;
/** the grid's step and a dot's radius (device px), a ring's speed (device px a second), the ground's light */
uniform float uGap;
uniform float uDot;
uniform float uSpeed;
uniform float uDim;
/** the rings: where they started (the grid's px), their age (s), their power */
uniform vec4 uPing[${MAX}];
uniform int uCount;
out vec4 outColour;

const vec3 INK = vec3(0.965, 0.965, 0.953);
const vec3 LIME = vec3(0.855, 1.0, 0.008);
const vec3 PALE = vec3(0.949, 1.0, 0.816);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  // the grid's own coordinates: x across, y down the page (the grid rides with the scroll), device px
  vec2 g = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y + uScroll);
  vec2 cell = floor(g / uGap);
  vec2 centre = (cell + 0.5) * uGap;
  float d = length(g - centre);
  float front = 0.0;
  float echo = 0.0;
  float haze = 0.0;
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= uCount) break;
    vec4 q = uPing[i];
    float r = q.z * uSpeed;
    float life = q.w * exp(-q.z * 0.36) * smoothstep(0.0, 0.25, q.z);
    // the dots on the ring's front light up whole (measured from their centres), the echo follows at 0.62 of it
    float dc = length(centre - q.xy);
    float b = (dc - r) / (uGap * 1.35);
    front += exp(-b * b) * life;
    float e = (dc - r * 0.62) / (uGap * 1.1);
    echo += exp(-e * e) * life * 0.38;
    float h = (length(g - q.xy) - r) / (uGap * 1.8);
    haze += exp(-h * h) * life;
  }
  // the pointer lifts the dots near it
  float pd = length(centre - vec2(uPointer.x, uPointer.y + uScroll)) / (uGap * 5.0);
  float lens = uPointer.z * exp(-pd * pd);
  float wave = clamp(front, 0.0, 1.4);
  float base = 0.12 * (0.75 + 0.5 * hash(cell));
  float radius = uDot * (1.0 + 1.1 * wave + 0.35 * echo + 0.6 * lens);
  float shape = 1.0 - smoothstep(radius - 0.8, radius + 0.8, d);
  float alpha = clamp(base + 0.95 * wave + 0.28 * echo + 0.3 * lens, 0.0, 1.0) * shape;
  vec3 colour = mix(INK, LIME, clamp(wave * 1.3 + lens * 0.35, 0.0, 1.0));
  colour = mix(colour, PALE, clamp(echo * 0.8, 0.0, 0.6) * (1.0 - clamp(wave, 0.0, 1.0)));
  float glow = clamp(haze, 0.0, 1.2) * 0.085;
  outColour = vec4((colour * alpha + LIME * glow) * uDim, clamp(alpha + glow, 0.0, 1.0) * uDim);
}`;

type Ping = { x: number; y: number; t0: number; power: number };

export const create: Create = (canvas, pointer) => {
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const at = (name: string) => gl.getUniformLocation(program, name);
  const uRes = at("uRes");
  const uScroll = at("uScroll");
  const uPointer = at("uPointer");
  const uGap = at("uGap");
  const uDot = at("uDot");
  const uSpeed = at("uSpeed");
  const uDim = at("uDim");
  const uPing = at("uPing");
  const uCount = at("uCount");
  gl.clearColor(0, 0, 0, 0);

  let dpr = 1;
  let width = 0;
  let height = 0;
  let narrow = false;
  let lift = 0;
  let scrolled = 0;
  /** the last frame's time (ms), -1 before the first */
  let clock = -1;
  let nextQuiet = 0;
  const pings: Ping[] = [];
  const data = new Float32Array(MAX * 4);
  /** a ring from a point of the screen (CSS px), placed on the grid (it rides with the page from there) */
  const send = (x: number, y: number, power: number, t0 = clock) => {
    pings.push({ x, y: y + scrolled * PARALLAX, t0, power });
    while (pings.length > MAX) pings.shift();
  };
  const quiet = (now: number) => {
    send(width * (0.08 + Math.random() * 0.84), height * (0.12 + Math.random() * 0.76), 0.6 + Math.random() * 0.25, now);
    nextQuiet = now + (narrow ? 4200 : 3000) + Math.random() * 2200;
  };

  // a click or a tap anywhere sends a ring from there
  const onDown = (event: PointerEvent) => {
    if (clock >= 0) send(event.clientX, event.clientY, 0.9);
  };
  window.addEventListener("pointerdown", onDown, { passive: true });
  // a sent request: a strong ring from the form (lead-form.js shows its «sent» state)
  const sent = document.querySelector<HTMLElement>("[data-form-done]");
  const watch = new MutationObserver(() => {
    if (!sent || sent.hidden || clock < 0) return;
    const box = (sent.closest("form") ?? sent).getBoundingClientRect();
    send(box.left + box.width / 2, box.top + Math.min(box.height / 2, window.innerHeight / 2), 1.6);
  });
  if (sent) watch.observe(sent, { attributes: true, attributeFilter: ["hidden"] });

  return {
    resize(w, h, ratio) {
      dpr = ratio;
      width = w;
      height = h;
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      // a phone (a tall narrow screen): a finer grid, slower rings, a little less light
      narrow = w / h < 0.8;
      gl.uniform1f(uGap, (narrow ? 22 : 26) * ratio);
      gl.uniform1f(uDot, (narrow ? 1 : 1.1) * ratio);
      gl.uniform1f(uSpeed, (narrow ? 210 : 280) * ratio);
      gl.uniform1f(uDim, narrow ? 0.85 : 1);
    },
    draw(now, dt, scroll) {
      scrolled = scroll;
      if (clock < 0) {
        // the first ring is already on its way at the first paint, from beside the contacts
        clock = now;
        send(width * (narrow ? 0.5 : 0.72), height * (narrow ? 0.62 : 0.45), 1, now - 1100);
        nextQuiet = now + 1800;
      }
      clock = now;
      if (now >= nextQuiet) quiet(now);
      for (let i = pings.length - 1; i >= 0; i--) if (now - pings[i].t0 > 9000) pings.splice(i, 1);
      lift += ((pointer.on ? 1 : 0) - lift) * Math.min(1, dt / 300);
      pings.forEach((p, i) => {
        data[i * 4] = p.x * dpr;
        data[i * 4 + 1] = p.y * dpr;
        data[i * 4 + 2] = Math.max(0, (now - p.t0) / 1000);
        data[i * 4 + 3] = p.power;
      });
      gl.uniform4fv(uPing, data);
      gl.uniform1i(uCount, pings.length);
      gl.uniform1f(uScroll, scroll * PARALLAX * dpr);
      gl.uniform3f(uPointer, pointer.x * dpr, pointer.y * dpr, lift);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      window.removeEventListener("pointerdown", onDown);
      watch.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
};
