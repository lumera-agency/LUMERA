/*
 * «Портал»: a ring of light (after 21st.dev's Portal Field, 15 Nov 2026; the main page's arch in «Чому ECLO», a chrome
 * frame lit from above). A huge ring stands round the contacts, partly past the screen's edge: three fine lines of
 * silver light that breathe and turn, a lime glow round the outer two (the system), an ember one round the inner (the
 * person who writes), light running along them in slow spans, the dark inside it a shade deeper with a lit rim. The
 * pointer brightens the stretch of ring near it. The page's scroll turns the ring and lifts it a little.
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
/** the ring: its centre (screen heights from the top left) and its radius */
uniform vec3 uRing;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 SILVER = vec3(0.93, 0.94, 0.95);
const vec3 LIME = vec3(0.855, 1.0, 0.008);
const vec3 EMBER = vec3(0.886, 0.396, 0.165);

void main() {
  float H = uRes.y;
  vec2 p = vec2(gl_FragCoord.x, H - gl_FragCoord.y) / H;
  float t = uTime * 0.001;
  float ride = uScroll / H;
  vec2 c = vec2(uRing.x, uRing.y - ride * 0.3);
  vec2 d = p - c;
  float r = length(d);
  float spin = t * 0.035 + ride * 0.7;
  vec2 dir = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * (d / max(r, 1e-4));
  float ang = atan(dir.y, dir.x);
  vec2 pd = p - uPointer.xy / H;
  float near = uPointer.z * exp(-dot(pd, pd) / 0.025);
  float px = 1.0 / H;
  vec3 colour = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float R = uRing.z * (1.0 - 0.07 * fi);
    float wob = R * (0.04 * gnoise(dir * 1.5 + vec2(fi * 3.1, t * 0.11)) + 0.016 * gnoise(dir * 4.0 + vec2(t * 0.17, fi * 1.7)));
    float dist = abs(r - R - wob);
    float cw = px * (1.1 + 0.5 * fi);
    float core = exp(-dist * dist / (cw * cw));
    float hw = 0.022 + 0.01 * fi;
    float halo = hw * hw / (dist * dist + hw * hw);
    float run = 0.5 + 0.5 * sin(ang * (1.0 + fi) + t * (0.16 + 0.06 * fi) + fi * 2.1);
    float along = (0.16 + 0.84 * run * run) * (1.0 + 1.8 * near);
    vec3 tint = i == 2 ? EMBER : LIME;
    float w = i == 0 ? 1.0 : (i == 1 ? 0.5 : 0.42);
    colour += (SILVER * core * 0.95 + tint * core * 0.3 + tint * halo * (i == 2 ? 0.12 : 0.17)) * along * w;
  }
  // the dark inside is a shade deeper; a faint light lines its edge (a lit rim on a dark sphere)
  float inside = 1.0 - smoothstep(uRing.z * 0.97, uRing.z * 1.01, r);
  colour += SILVER * 0.045 * smoothstep(uRing.z * 0.6, uRing.z, r) * inside;
  colour *= uDim;
  vec3 ground = BG * (1.0 - 0.35 * inside);
  colour += grain(gl_FragCoord.xy, uTime) * 0.024;
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
  const uRing = at("uRing");
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
      // a computer: round the contacts board on the right; a phone: over the top of the screen
      if (narrow) gl.uniform3f(uRing, aspect * 0.5, 0.2, 0.36);
      else gl.uniform3f(uRing, aspect * 0.76, 0.52, 0.6);
      gl.uniform1f(uDim, narrow ? 0.75 : 1);
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
