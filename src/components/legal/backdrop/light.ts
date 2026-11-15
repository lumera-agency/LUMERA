/*
 * «Світло»: soft studio light on black with film grain (after 21st.dev's Grainy Light Leak and Shadow Blending, 15 Nov
 * 2026; the main page's light from above over its arch). A large out-of-focus pool of silver light high on the right
 * falls on a dark, slowly shifting ridge; further down the page, by the request form, a warmer pool (ember, the person
 * who writes). The haze drifts, the grain lives, the light leans towards the pointer.
 * The ground rides with the page's scroll. A phone gets the same light, a little dimmer.
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
uniform float uNarrow;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 SILVER = vec3(0.86, 0.86, 0.84);
const vec3 EMBER = vec3(0.886, 0.396, 0.165);

float pool(vec2 q, vec2 c, float s) { vec2 d = q - c; return exp(-dot(d, d) / (s * s)); }

void main() {
  float H = uRes.y;
  float aspect = uRes.x / H;
  // the ground in screen heights, y down the page
  vec2 q = vec2(gl_FragCoord.x, H - gl_FragCoord.y + uScroll) / H;
  float t = uTime * 0.001;
  vec2 pq = vec2(uPointer.x, uPointer.y + uScroll) / H;
  // the key light high on the right (a phone: high in the middle), drifting, leaning to the pointer
  vec2 c1 = vec2(aspect * mix(0.72, 0.6, uNarrow) + 0.05 * sin(t * 0.05), 0.02 + 0.04 * cos(t * 0.043));
  c1 += (pq - c1) * 0.06 * uPointer.z;
  float s1 = mix(0.62, 0.5, uNarrow);
  float key = pool(q, c1, s1);
  // the beam it throws down
  float dx = q.x - c1.x - (q.y - c1.y) * 0.18;
  key += 0.35 * exp(-dx * dx / 0.05) * exp(-max(q.y - c1.y, 0.0) / 0.9) * step(c1.y, q.y);
  // the dark ridge it falls on
  float ridge = c1.y + 0.66 + 0.09 * sin(q.x * 1.7 + t * 0.06) + 0.14 * fbm(vec2(q.x * 1.1 + 3.0, t * 0.035));
  key *= 1.0 - 0.85 * smoothstep(ridge - 0.12, ridge + 0.24, q.y);
  // the warm pool down the page, by the form
  vec2 c2 = vec2(aspect * mix(0.2, 0.3, uNarrow) + 0.04 * cos(t * 0.04), 1.55 + 0.05 * sin(t * 0.05));
  float warm = pool(q, c2, 0.55);
  // the haze drifting through the light
  float haze = 0.78 + 0.4 * fbm(q * 1.5 + vec2(t * 0.02, -t * 0.015));
  vec3 colour = SILVER * key * 0.38 * haze + mix(SILVER, EMBER, 0.6) * warm * 0.2 * haze;
  // a faint torch where the pointer is
  colour += SILVER * 0.035 * uPointer.z * pool(q, pq, 0.18);
  colour *= uDim;
  colour += grain(gl_FragCoord.xy, uTime) * 0.042;
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
  const uNarrow = at("uNarrow");
  let dpr = 1;
  let lift = 0;

  return {
    resize(w, h, ratio) {
      dpr = ratio;
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      const narrow = w / h < 0.8;
      gl.uniform1f(uNarrow, narrow ? 1 : 0);
      gl.uniform1f(uDim, narrow ? 0.85 : 1);
    },
    draw(now, dt, scroll) {
      lift += ((pointer.on ? 1 : 0) - lift) * Math.min(1, dt / 500);
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
