/*
 * «Потік»: every channel leads to one point (after 21st.dev's Gateway Flow, 15 Nov 2026). Fine hairlines fan in from
 * both edges of the screen and meet at one bright point between the words and the contacts board; small lime signals
 * run along some of them towards it and the point breathes in lime. The lines near the pointer light up. The point
 * rides up with the page's scroll, the lines keep fanning across the screen below it. A phone: the point high in the
 * middle, fewer lines.
 */
import { NOISE, screenShader } from "./gl";
import { PARALLAX, type Create } from "./types";

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec3 uPointer;
uniform float uDim;
/** the meeting point (screen heights from the top left), the lines' spread at the edges, lines a side of it */
uniform vec2 uGate;
uniform float uSpread;
uniform float uLines;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 INK = vec3(0.965, 0.965, 0.953);
const vec3 LIME = vec3(0.855, 1.0, 0.008);
const vec3 PALE = vec3(0.949, 1.0, 0.816);

void main() {
  float H = uRes.y;
  float aspect = uRes.x / H;
  float px = 1.0 / H;
  vec2 p = vec2(gl_FragCoord.x, H - gl_FragCoord.y) / H;
  float t = uTime * 0.001;
  vec2 gate = vec2(uGate.x, uGate.y - uScroll / H);
  float side = p.x < gate.x ? -1.0 : 1.0;
  float span = side < 0.0 ? gate.x + 0.06 : aspect - gate.x + 0.06;
  float u = abs(p.x - gate.x) / span;
  float fan = uSpread * pow(u, 1.45);
  // the line this pixel is nearest: lines sit at whole steps of s
  float s = (p.y - gate.y) / max(fan, 1e-5) * uLines;
  float k = floor(s + 0.5);
  float gap = fan / uLines;
  float slope = abs(k / uLines) * uSpread * 1.45 * pow(max(u, 1e-4), 0.45) / span;
  float dist = abs(s - k) * gap / sqrt(1.0 + slope * slope);
  float line = 1.0 - smoothstep(0.35 * px, 1.25 * px, dist);
  // where the lines crowd near the point they melt into its glow
  float clear = smoothstep(2.5 * px, 9.0 * px, gap);
  float id = hash(vec2(k, side));
  vec2 pd = p - uPointer.xy / H;
  float near = uPointer.z * exp(-dot(pd, pd) / 0.02);
  float lit = (0.07 + 0.1 * id + 0.16 * (1.0 - u)) * (1.0 + 2.2 * near);
  vec3 colour = INK * line * lit * clear;
  // the signals: some lines carry one, running in towards the point
  if (id > 0.5) {
    float speed = 0.05 + 0.07 * hash(vec2(k * 1.7, side + 3.0));
    float at = 1.0 - fract(id * 7.31 + t * speed);
    float along = (u - at) * span;
    float head = exp(-(along * along + dist * dist) / (2.2 * px * 2.2 * px));
    float tail = exp(-dist * dist / (px * px)) * step(0.0, along) * exp(-along / 0.07) * 0.5;
    float fade = smoothstep(0.0, 0.08, at) * smoothstep(1.0, 0.85, at);
    colour += mix(LIME, PALE, 0.25) * (head * 1.1 + tail) * fade * clear;
  }
  // the point, breathing
  vec2 g = p - gate;
  float gg = dot(g, g);
  float breathe = 0.85 + 0.15 * sin(t * 1.1);
  colour += PALE * exp(-gg / 0.00008) * 0.9 + LIME * exp(-gg / 0.004) * 0.22 * breathe + LIME * exp(-gg / 0.05) * 0.05 * breathe;
  colour *= uDim;
  colour += grain(gl_FragCoord.xy, uTime) * 0.02;
  outColour = vec4(BG + colour, 1.0);
}`;

export const create: Create = (canvas, pointer) => {
  const made = screenShader(canvas, FRAGMENT);
  if (!made) return null;
  const { gl, at } = made;
  const uRes = at("uRes");
  const uTime = at("uTime");
  const uScroll = at("uScroll");
  const uPointer = at("uPointer");
  const uDim = at("uDim");
  const uGate = at("uGate");
  const uSpread = at("uSpread");
  const uLines = at("uLines");
  let dpr = 1;
  let lift = 0;

  return {
    resize(w, h, ratio) {
      dpr = ratio;
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      const aspect = w / h;
      const narrow = aspect < 0.8;
      // a computer: between the words and the contacts board; a phone: high in the middle
      if (narrow) gl.uniform2f(uGate, aspect * 0.5, 0.3);
      else gl.uniform2f(uGate, aspect * 0.47, 0.52);
      gl.uniform1f(uSpread, narrow ? 1.1 : 0.95);
      gl.uniform1f(uLines, narrow ? 12 : 18);
      gl.uniform1f(uDim, narrow ? 0.85 : 1);
    },
    draw(now, dt, scroll) {
      lift += ((pointer.on ? 1 : 0) - lift) * Math.min(1, dt / 400);
      gl.uniform1f(uTime, now);
      gl.uniform1f(uScroll, scroll * PARALLAX * dpr);
      gl.uniform3f(uPointer, pointer.x * dpr, pointer.y * dpr, lift);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
};
