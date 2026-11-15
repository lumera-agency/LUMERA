/*
 * «Зорі»: the contacts page's ground, deep space (the owner's pick, 15 Nov 2026, after 21st.dev's Gravity Stars and
 * motionsites' Cosmic; then «чуть четче звезды и метеориты»). Three depths of stars that ride with the page's scroll at
 * their own speeds (the near ones faster, so the scroll moves through space), crisp points, the brightest with a fine
 * cross of light; a faint silver haze of a nebula across the screen; now and then a meteor, a white head with a thin
 * lime tail that narrows and fades. The stars near the pointer lean towards it.
 *
 * Drawn at the screen's own pixels (up to two to a CSS pixel), so a star stays a sharp point on a Retina screen and a
 * phone; the shader is light enough for it (three grid look-ups and the nebula's noise a pixel).
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
/** the canvas's pixels to a CSS pixel */
uniform float uScale;
/** the meteor: where it starts (screen heights), its heading (rad), its age (s, below 0: none) */
uniform vec4 uShoot;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 SILVER = vec3(0.86, 0.88, 0.93);
const vec3 WARM = vec3(0.886, 0.5, 0.3);
const vec3 LIME = vec3(0.855, 1.0, 0.008);
const vec3 PALE = vec3(0.97, 1.0, 0.88);

void main() {
  float H = uRes.y;
  float aspect = uRes.x / H;
  /** one CSS pixel, in screen heights */
  float px = uScale / H;
  vec2 p = vec2(gl_FragCoord.x, H - gl_FragCoord.y) / H;
  float t = uTime * 0.001;
  float ride = uScroll / H;
  vec2 pp = uPointer.xy / H;
  vec2 pd = pp - p;
  vec2 pull = pd * uPointer.z * exp(-dot(pd, pd) / 0.05);
  // three depths: far (slow, small), middle, near (fast)
  vec3 colour = vec3(0.0);
  colour += 0.6 * stars(p + pull * 0.02 + vec2(t * 0.002, ride * 0.45), 0.022, 0.55, px * 0.85, uTime);
  colour += 0.85 * stars(p + pull * 0.05 + vec2(3.7 + t * 0.003, ride * 1.0), 0.036, 0.45, px, uTime);
  colour += stars(p + pull * 0.1 + vec2(7.1 + t * 0.004, ride * 1.9), 0.06, 0.32, px * 1.15, uTime);
  // the nebula: a faint band of haze across the screen, cool silver with a warm edge
  vec2 n = vec2(p.x, p.y + ride * 0.6);
  float band = exp(-pow((n.y - 0.55 + 0.3 * (n.x / aspect - 0.5) + 0.08 * sin(n.x * 2.0)), 2.0) / 0.06);
  float cloud = fbm(n * 2.2 + vec2(t * 0.006, -t * 0.004)) + 0.5 * fbm(n * 5.0 - vec2(t * 0.005, 0.0));
  float haze = band * smoothstep(-0.15, 0.55, cloud);
  colour += mix(SILVER, WARM, smoothstep(0.1, 0.6, cloud) * 0.35) * haze * 0.085;
  // the meteor: a white head, a thin tail that turns lime, narrows and fades behind it
  if (uShoot.w >= 0.0) {
    vec2 dir = vec2(cos(uShoot.z), sin(uShoot.z));
    float travel = uShoot.w * 1.2;
    vec2 head = uShoot.xy + dir * travel;
    vec2 s = p - head;
    float back = -dot(s, dir);
    float side = dot(s, vec2(-dir.y, dir.x));
    float life = smoothstep(0.0, 0.08, uShoot.w) * (1.0 - smoothstep(0.6, 0.95, uShoot.w));
    float len = min(travel, 0.22);
    float k = clamp(back / max(len, 1e-4), 0.0, 1.0);
    float w = px * mix(0.75, 0.3, k);
    float tail = exp(-side * side / (w * w)) * step(0.0, back) * pow(1.0 - k, 1.4);
    float glowTail = exp(-side * side / (w * w * 16.0)) * step(0.0, back) * pow(1.0 - k, 3.0) * 0.12;
    float headCore = exp(-dot(s, s) / (px * px * 1.3));
    float headGlow = exp(-dot(s, s) / (px * px * 40.0)) * 0.22;
    colour += mix(PALE, LIME, smoothstep(0.05, 0.55, k)) * (tail * 1.5 + glowTail) * life;
    colour += PALE * (headCore * 2.2 + headGlow) * life;
  }
  colour = 1.0 - exp(-colour * 1.35);
  colour *= uDim;
  colour += grain(gl_FragCoord.xy / uScale, uTime) * 0.018;
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
  const uScale = at("uScale");
  const uShoot = at("uShoot");
  let scale = 1;
  let lift = 0;
  let aspect = 1.6;
  /** the meteor: where, which way, when it started; the next one's time */
  let shoot = { x: 0, y: 0, a: 0, t0: -1 };
  let next = -1;

  return {
    resize(w, h, ratio) {
      // the screen's own pixels, up to two to a CSS pixel (sharp stars on a Retina screen and a phone)
      scale = Math.max(ratio, Math.min(window.devicePixelRatio || 1, 2));
      aspect = w / h;
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uScale, scale);
      gl.uniform1f(uDim, aspect < 0.8 ? 0.9 : 1);
    },
    draw(now, dt, scroll) {
      if (next < 0) next = now + 2200;
      if (now >= next) {
        // from the upper part of the screen, down and across
        const left = Math.random() < 0.5;
        shoot = { x: aspect * (left ? 0.12 + Math.random() * 0.35 : 0.53 + Math.random() * 0.35), y: 0.05 + Math.random() * 0.3, a: left ? 0.3 + Math.random() * 0.25 : Math.PI - 0.3 - Math.random() * 0.25, t0: now };
        next = now + 5500 + Math.random() * 4000;
      }
      const age = shoot.t0 < 0 ? -1 : (now - shoot.t0) / 1000;
      lift += ((pointer.on ? 1 : 0) - lift) * Math.min(1, dt / 400);
      gl.uniform4f(uShoot, shoot.x, shoot.y, shoot.a, age > 1 ? -1 : age);
      gl.uniform1f(uTime, now);
      gl.uniform1f(uScroll, scroll * PARALLAX * scale);
      gl.uniform3f(uPointer, pointer.x * scale, pointer.y * scale, lift);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
};
