/*
 * «Хром»: black liquid metal (after 21st.dev's Liquid Metal Shader and Bw Liquid, 15 Nov 2026; the material of the main
 * page's stone, coal with chrome running through it). A slow surface of folds, black where it turns away, a studio's
 * soft box mirrored in silver where it turns up, a lime lamp caught low on the right. The pointer presses the metal and
 * the light runs round the dent; a click or a tap sends ripples across it, a sent request a strong one from the form.
 * The ground rides with the page's scroll. A phone gets a slower, dimmer surface.
 */
import { NOISE, screenShader, watchSent } from "./gl";
import { PARALLAX, type Create } from "./types";

/** ripples at once */
const MAX = 4;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec3 uPointer;
uniform float uDim;
uniform float uCalm;
/** the ripples: where they started (the ground's px), their age (s), their power */
uniform vec4 uDrop[${MAX}];
uniform int uDrops;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 SILVER = vec3(0.87, 0.88, 0.89);
const vec3 LIME = vec3(0.855, 1.0, 0.008);

float surface(vec2 p, float t) {
  vec2 w = vec2(fbm(p * 0.8 + vec2(0.0, t * 0.05)), fbm(p * 0.8 + vec2(5.2, 1.3) - vec2(t * 0.04, 0.0)));
  return fbm(p * 1.1 + 1.7 * w + vec2(t * 0.025, -t * 0.015));
}

void main() {
  float H = uRes.y;
  // the ground in screen heights, y down the page (it rides with the scroll)
  vec2 px = vec2(gl_FragCoord.x, H - gl_FragCoord.y + uScroll);
  vec2 p = px / H;
  float t = uTime * 0.001 * mix(1.0, 0.7, uCalm);
  float h = surface(p * 0.62, t);
  // the pointer presses the metal
  vec2 dp = p - vec2(uPointer.x, uPointer.y + uScroll) / H;
  h -= uPointer.z * 0.2 * exp(-dot(dp, dp) / 0.01);
  // ripples
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= uDrops) break;
    vec4 q = uDrop[i];
    float k = length(px - q.xy) / H - q.z * 0.34;
    h += q.w * 0.03 * sin(k * 70.0) * exp(-k * k / 0.003) * exp(-q.z * 0.8) * smoothstep(0.0, 0.15, q.z);
  }
  // the slope from the neighbouring pixels, the metal's normal, the studio mirrored in it
  vec2 g = vec2(dFdx(h), dFdy(h)) * H;
  vec3 n = normalize(vec3(-g * 0.42, 1.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  float box = smoothstep(0.42, 0.5, r.y) * (1.0 - smoothstep(0.66, 0.88, r.y));
  float rim = smoothstep(0.16, 0.2, r.y) * (1.0 - smoothstep(0.22, 0.28, r.y)) * 0.22;
  float under = smoothstep(-0.62, -0.55, r.y) * (1.0 - smoothstep(-0.5, -0.42, r.y)) * 0.1;
  float lamp = pow(max(dot(r, normalize(vec3(0.75, -0.55, 0.36))), 0.0), 24.0);
  float sheen = pow(max(dot(n, normalize(vec3(-0.3, 0.5, 0.8))), 0.0), 8.0) * 0.06;
  vec3 colour = SILVER * (box * 0.75 + rim + under + sheen) + LIME * lamp * 0.6;
  // the deep folds stay black
  colour *= 0.15 + 0.85 * smoothstep(-0.2, 0.3, h);
  colour *= uDim;
  colour += grain(gl_FragCoord.xy, uTime) * 0.028;
  outColour = vec4(BG + colour, 1.0);
}`;

type Drop = { x: number; y: number; t0: number; power: number };

export const create: Create = (canvas, pointer) => {
  const made = screenShader(canvas, FRAGMENT);
  if (!made) return null;
  const { gl, at } = made;
  const uRes = at("uRes");
  const uTime = at("uTime");
  const uScroll = at("uScroll");
  const uPointer = at("uPointer");
  const uDim = at("uDim");
  const uCalm = at("uCalm");
  const uDrop = at("uDrop");
  const uDrops = at("uDrops");
  /** the surface is soft: drawn at most one pixel to a CSS pixel */
  let scale = 1;
  let lift = 0;
  let scrolled = 0;
  let clock = -1;
  const drops: Drop[] = [];
  const data = new Float32Array(MAX * 4);
  const drop = (x: number, y: number, power: number) => {
    if (clock < 0) return;
    drops.push({ x, y: y + scrolled * PARALLAX, t0: clock, power });
    while (drops.length > MAX) drops.shift();
  };
  const onDown = (event: PointerEvent) => drop(event.clientX, event.clientY, 1);
  window.addEventListener("pointerdown", onDown, { passive: true });
  const unwatch = watchSent((box) => drop(box.left + box.width / 2, box.top + Math.min(box.height / 2, window.innerHeight / 2), 1.8));

  return {
    resize(w, h, ratio) {
      scale = Math.min(ratio, 1);
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      const narrow = w / h < 0.8;
      gl.uniform1f(uCalm, narrow ? 1 : 0);
      gl.uniform1f(uDim, narrow ? 0.6 : 0.72);
    },
    draw(now, dt, scroll) {
      clock = now;
      scrolled = scroll;
      for (let i = drops.length - 1; i >= 0; i--) if (now - drops[i].t0 > 6000) drops.splice(i, 1);
      drops.forEach((d, i) => {
        data[i * 4] = d.x * scale;
        data[i * 4 + 1] = d.y * scale;
        data[i * 4 + 2] = (now - d.t0) / 1000;
        data[i * 4 + 3] = d.power;
      });
      lift += ((pointer.on ? 1 : 0) - lift) * Math.min(1, dt / 400);
      gl.uniform4fv(uDrop, data);
      gl.uniform1i(uDrops, drops.length);
      gl.uniform1f(uTime, now);
      gl.uniform1f(uScroll, scroll * PARALLAX * scale);
      gl.uniform3f(uPointer, pointer.x * scale, pointer.y * scale, lift);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      window.removeEventListener("pointerdown", onDown);
      unwatch();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
};
