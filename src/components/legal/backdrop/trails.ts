/*
 * «Зоряні сліди»: the night sky as a long exposure draws it (after 21st.dev's Star Trails, 15 Nov 2026). Fine arcs of
 * starlight turn round a pole just above the screen's top right corner: mostly silver, a few lime (the system), a few
 * warm (ember). The sky turns slowly by itself, and the page's scroll turns it further; the arcs near the pointer
 * brighten.
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
/** the pole the sky turns round (screen heights from the top left) */
uniform vec2 uPole;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 SILVER = vec3(0.9, 0.92, 0.96);
const vec3 LIME = vec3(0.855, 1.0, 0.2);
const vec3 WARM = vec3(1.0, 0.68, 0.45);
const float TAU = 6.2831853;

void main() {
  float H = uRes.y;
  float px = 1.0 / H;
  vec2 p = vec2(gl_FragCoord.x, H - gl_FragCoord.y) / H;
  float t = uTime * 0.001;
  float ride = uScroll / H;
  vec2 d = p - uPole;
  float r = length(d);
  float th = atan(d.y, d.x);
  float turn = t * 0.02 + ride * 0.9;
  vec2 pd = p - uPointer.xy / H;
  float near = uPointer.z * exp(-dot(pd, pd) / 0.03);
  vec3 colour = vec3(0.0);
  for (int layer = 0; layer < 2; layer++) {
    float fl = float(layer);
    float bw = px * mix(3.4, 5.2, fl);
    float shift = 0.47 * fl;
    float b = floor(r / bw + shift);
    float centre = (b + 0.5 - shift) * bw;
    float h = hash(vec2(b, 11.0 + fl * 17.0));
    if (h < 0.42) continue;
    float len = 0.18 + 0.9 * hash(vec2(b, 4.0 + fl * 5.0));
    float head = hash(vec2(b, 9.0 + fl * 3.0)) * TAU + turn;
    float u = mod(head - th, TAU);
    float on = smoothstep(0.0, 0.03, u) * (1.0 - smoothstep(len * 0.8, len, u));
    float w = (r - centre) / (px * 0.75);
    float light = exp(-w * w) * on * (0.12 + 0.88 * pow(hash(vec2(b, 2.0 + fl)), 3.0)) * (0.55 + 0.45 * (1.0 - u / len));
    float tint = hash(vec2(b, 7.0 + fl * 2.0));
    vec3 c = tint < 0.07 ? LIME : (tint < 0.12 ? WARM : SILVER);
    colour += c * light;
  }
  colour *= (0.75 + 1.6 * near);
  // a faint glow round the pole
  colour += SILVER * 0.05 * exp(-r / 0.35);
  colour = 1.0 - exp(-colour * 1.2);
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
  const uPole = at("uPole");
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
      if (narrow) gl.uniform2f(uPole, aspect * 0.85, -0.04);
      else gl.uniform2f(uPole, aspect * 0.86, -0.1);
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
