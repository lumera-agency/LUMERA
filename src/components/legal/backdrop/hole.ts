/*
 * «Горизонт подій»: a black hole in the gap between the words and the contacts (after 21st.dev's Black Hole Hero and
 * Etched Accretion, 15 Nov 2026). A black shadow ringed by a thin photon ring, a tilted disc of hot matter in the site's
 * ember running round it (white-hot at its inner edge, brighter on the side that comes towards you), the far side of
 * the disc bent up over the top of the shadow, the stars behind pushed outwards round it. The disc turns, faster near
 * the hole; the sky leans to the pointer. The hole rides up with the page's scroll, slower than the words.
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
/** the hole: its centre (screen heights from the top left) and its shadow's radius */
uniform vec3 uHole;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 WHITE_HOT = vec3(1.0, 0.93, 0.82);
const vec3 EMBER = vec3(0.886, 0.396, 0.165);
const vec3 EMBER_DEEP = vec3(0.32, 0.1, 0.03);

vec3 heat(float k) { return k > 0.5 ? mix(EMBER, WHITE_HOT, (k - 0.5) * 2.0) : mix(EMBER_DEEP, EMBER, k * 2.0); }

void main() {
  float H = uRes.y;
  float px = 1.0 / H;
  vec2 p = vec2(gl_FragCoord.x, H - gl_FragCoord.y) / H;
  float t = uTime * 0.001;
  float ride = uScroll / H;
  vec2 c = vec2(uHole.x, uHole.y - ride * 0.55);
  float Rs = uHole.z;
  vec2 d = p - c;
  float r = length(d);
  // the sky behind, bent outwards round the hole (a point lens), leaning to the pointer
  float E = Rs * 1.35;
  vec2 sky = c + d * (1.0 - E * E / max(r * r, 1e-5));
  vec2 pd = uPointer.xy / H - p;
  sky += pd * 0.04 * uPointer.z * exp(-dot(pd, pd) / 0.04);
  vec3 colour = stars(sky + vec2(0.0, ride * 0.5), 0.034, 0.5, px, uTime) + 0.6 * stars(sky * 1.7 + vec2(3.1, ride * 0.3), 0.03, 0.4, px, uTime);
  colour *= smoothstep(Rs * 1.02, Rs * 1.6, r);
  // the disc, tilted, seen nearly edge on
  float tilt = -0.16;
  vec2 q = mat2(cos(tilt), sin(tilt), -sin(tilt), cos(tilt)) * d;
  vec2 e = vec2(q.x, q.y / 0.2);
  float rd = length(e);
  vec2 dir = e / max(rd, 1e-5);
  float inner = Rs * 1.5;
  float outer = Rs * 3.9;
  float band = smoothstep(inner, inner * 1.1, rd) * (1.0 - smoothstep(outer * 0.55, outer, rd));
  float spin = t * 0.5 * pow(Rs / max(rd, Rs), 1.5);
  vec2 turn = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * dir;
  float streak = 0.55 + 0.75 * fbm(turn * 2.4 + vec2(rd / Rs * 2.6, rd / Rs * 1.3));
  float k = 1.0 - smoothstep(inner, outer, rd);
  float toward = 0.6 + 0.4 * -dir.x;
  // the near half passes in front of the shadow, the far half is hidden behind it
  float seen = r > Rs ? 1.0 : step(0.0, q.y);
  colour += heat(k * 0.9) * band * streak * toward * (0.3 + 1.3 * k * k) * seen;
  // the far side of the disc, bent up over the shadow (and a fainter arc under it)
  vec2 rdir = d / max(r, 1e-5);
  float arc = (r - Rs * 1.28) / (Rs * 0.2);
  float over = exp(-arc * arc) * smoothstep(0.55, -0.6, rdir.y);
  float under = exp(-pow((r - Rs * 1.12) / (Rs * 0.07), 2.0)) * smoothstep(0.35, 0.95, rdir.y) * 0.45;
  vec2 around = mat2(cos(t * 0.3), -sin(t * 0.3), sin(t * 0.3), cos(t * 0.3)) * rdir;
  float arcStreak = 0.55 + 0.7 * fbm(around * 3.0 + vec2(r / Rs * 4.0, 0.0));
  float arcHeat = 1.0 - smoothstep(Rs * 1.05, Rs * 1.6, r);
  colour += heat(0.45 + 0.4 * arcHeat) * (over * 1.25 + under) * arcStreak * (0.6 + 0.4 * -rdir.x);
  // the photon ring, a hair of white light round the shadow
  float ring = (r - Rs * 1.03) / (px * 1.0);
  float side = 0.35 + 0.65 * (0.5 - 0.5 * rdir.x);
  colour += mix(EMBER, WHITE_HOT, 0.7) * (exp(-ring * ring) * 0.6 + exp(-abs(r - Rs * 1.03) / (Rs * 0.06)) * 0.1) * side;
  // the shadow itself is darker than the page
  vec3 ground = BG * smoothstep(Rs * 0.98, Rs * 1.04, r);
  colour = 1.0 - exp(-colour * 1.4);
  colour *= uDim;
  colour += grain(gl_FragCoord.xy, uTime) * 0.02;
  outColour = vec4(ground + colour, 1.0);
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
  const uHole = at("uHole");
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
      // a computer: in the gap under the words, left of the board; a phone: right of the title
      if (narrow) gl.uniform3f(uHole, aspect * 0.8, 0.19, 0.045);
      else gl.uniform3f(uHole, aspect * 0.47, 0.71, 0.075);
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
