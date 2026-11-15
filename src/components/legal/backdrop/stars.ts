/*
 * «Зорі»: deep space (after 21st.dev's Gravity Stars and motionsites' Cosmic, 15 Nov 2026). Three depths of stars that
 * ride with the page's scroll at their own speeds (the near ones faster, so the scroll moves through space), a faint
 * silver haze of a nebula across the screen, now and then a lime shooting star. The stars near the pointer lean
 * towards it.
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
/** the shooting star: where it starts (screen heights), its heading (rad), its age (s, below 0: none) */
uniform vec4 uShoot;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 SILVER = vec3(0.86, 0.88, 0.93);
const vec3 WARM = vec3(0.886, 0.5, 0.3);
const vec3 LIME = vec3(0.855, 1.0, 0.008);
const vec3 PALE = vec3(0.96, 1.0, 0.82);

void main() {
  float H = uRes.y;
  float aspect = uRes.x / H;
  float px = 1.0 / H;
  vec2 p = vec2(gl_FragCoord.x, H - gl_FragCoord.y) / H;
  float t = uTime * 0.001;
  float ride = uScroll / H;
  vec2 pp = uPointer.xy / H;
  vec2 pd = pp - p;
  vec2 pull = pd * uPointer.z * exp(-dot(pd, pd) / 0.05);
  // three depths: far (slow, small), middle, near (fast)
  vec3 colour = vec3(0.0);
  colour += 0.55 * stars(p + pull * 0.02 + vec2(t * 0.002, ride * 0.45), 0.022, 0.55, px * 0.8, uTime);
  colour += 0.8 * stars(p + pull * 0.05 + vec2(3.7 + t * 0.003, ride * 1.0), 0.036, 0.45, px, uTime);
  colour += stars(p + pull * 0.1 + vec2(7.1 + t * 0.004, ride * 1.9), 0.06, 0.32, px * 1.3, uTime);
  // the nebula: a faint band of haze across the screen, cool silver with a warm edge
  vec2 n = vec2(p.x, p.y + ride * 0.6);
  float band = exp(-pow((n.y - 0.55 + 0.3 * (n.x / aspect - 0.5) + 0.08 * sin(n.x * 2.0)), 2.0) / 0.06);
  float cloud = fbm(n * 2.2 + vec2(t * 0.006, -t * 0.004)) + 0.5 * fbm(n * 5.0 - vec2(t * 0.005, 0.0));
  float haze = band * smoothstep(-0.15, 0.55, cloud);
  colour += mix(SILVER, WARM, smoothstep(0.1, 0.6, cloud) * 0.35) * haze * 0.085;
  // the shooting star
  if (uShoot.w >= 0.0) {
    vec2 dir = vec2(cos(uShoot.z), sin(uShoot.z));
    float travel = uShoot.w * 0.95;
    vec2 head = uShoot.xy + dir * travel;
    vec2 s = p - head;
    float back = -dot(s, dir);
    float side = dot(s, vec2(-dir.y, dir.x));
    float life = smoothstep(0.0, 0.15, uShoot.w) * (1.0 - smoothstep(0.7, 1.15, uShoot.w));
    float tail = exp(-side * side / (px * px * 0.9)) * step(0.0, back) * exp(-back / 0.09) * step(back, travel);
    float spark = exp(-dot(s, s) / (px * px * 4.0));
    colour += mix(LIME, PALE, 0.35) * (tail * 0.85 + spark * 1.2) * life;
  }
  colour = 1.0 - exp(-colour * 1.3);
  colour *= uDim;
  colour += grain(gl_FragCoord.xy, uTime) * 0.022;
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
  const uShoot = at("uShoot");
  let dpr = 1;
  let lift = 0;
  let aspect = 1.6;
  /** the shooting star: where, which way, when it started; the next one's time */
  let shoot = { x: 0, y: 0, a: 0, t0: -1 };
  let next = -1;

  return {
    resize(w, h, ratio) {
      dpr = ratio;
      aspect = w / h;
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDim, aspect < 0.8 ? 0.85 : 1);
    },
    draw(now, dt, scroll) {
      if (next < 0) next = now + 2200;
      if (now >= next) {
        // from the upper part of the screen, down and across
        const left = Math.random() < 0.5;
        shoot = { x: aspect * (left ? 0.15 + Math.random() * 0.35 : 0.5 + Math.random() * 0.35), y: 0.05 + Math.random() * 0.3, a: left ? 0.35 + Math.random() * 0.25 : Math.PI - 0.35 - Math.random() * 0.25, t0: now };
        next = now + 5500 + Math.random() * 4000;
      }
      const age = shoot.t0 < 0 ? -1 : (now - shoot.t0) / 1000;
      lift += ((pointer.on ? 1 : 0) - lift) * Math.min(1, dt / 400);
      gl.uniform4f(uShoot, shoot.x, shoot.y, shoot.a, age > 1.3 ? -1 : age);
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
