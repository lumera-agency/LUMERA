/*
 * «Орбіта»: the edge of a planet seen from orbit (after 21st.dev's Parallax Cosmic and motionsites' Planet Orbit, 15 Nov
 * 2026). Stars over a huge dark planet whose rim rises at the bottom of the first screen: a hair of silver light along
 * its edge, a thin atmosphere glowing over it, and on its left the sun about to rise, white with a lime glow (the
 * system's colour), a long flare along the horizon. The planet rides up with the page's scroll, so the request form ends up over its
 * night side. The sunrise leans towards the pointer.
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
/** the planet: its centre (screen heights from the top left, at the first paint) and its radius */
uniform vec3 uPlanet;
out vec4 outColour;
${NOISE}
const vec3 BG = vec3(0.039);
const vec3 SILVER = vec3(0.86, 0.9, 0.95);
const vec3 LIME = vec3(0.855, 1.0, 0.008);
const vec3 PALE = vec3(0.96, 1.0, 0.82);

void main() {
  float H = uRes.y;
  float aspect = uRes.x / H;
  float px = 1.0 / H;
  vec2 p = vec2(gl_FragCoord.x, H - gl_FragCoord.y) / H;
  float t = uTime * 0.001;
  float ride = uScroll / H;
  vec2 c = vec2(uPlanet.x, uPlanet.y - ride);
  float R = uPlanet.z;
  vec2 d = p - c;
  float r = length(d);
  float above = r - R;
  // where the sun rises: left of the planet's top, clear of the form, leaning to the pointer
  float lean = uPointer.z * clamp((uPointer.x / H - c.x) / R, -0.2, 0.2) * 0.35;
  float phi = -0.21 + 0.015 * sin(t * 0.07) + lean;
  vec2 sun = c + R * vec2(sin(phi), -cos(phi));
  float ang = acos(clamp(dot(d / max(r, 1e-5), vec2(sin(phi), -cos(phi))), -1.0, 1.0));
  float dawn = exp(-ang * ang / 0.03);
  float rim = 0.22 + 0.78 * dawn;
  vec3 colour = vec3(0.0);
  vec3 ground = BG;
  if (above > 0.0) {
    // the sky: stars, fading out in the glow over the horizon
    vec3 sky = stars(p + vec2(0.0, ride * 0.35), 0.032, 0.5, px, uTime) + 0.5 * stars(p * 1.6 + vec2(2.3, ride * 0.2), 0.028, 0.4, px, uTime);
    colour += sky * smoothstep(0.0, 0.18, above);
    // the atmosphere: a thin bright layer and a wide soft one, lime where the sun comes up
    vec3 air = mix(SILVER, mix(LIME, PALE, 0.6), dawn);
    colour += air * (exp(-above / 0.012) * 0.42 + exp(-above / 0.07) * 0.11) * rim;
  } else {
    // the night side: almost black, a faint weather of clouds, the lit limb along the edge
    float depth = -above;
    float cloud = fbm(d / R * 9.0 + vec2(t * 0.004, 0.0));
    ground = vec3(0.012, 0.013, 0.015) + vec3(0.02) * smoothstep(-0.1, 0.5, cloud) * exp(-depth / 0.35);
    colour += mix(SILVER, PALE, dawn) * exp(-depth / 0.03) * 0.16 * rim;
  }
  // the hair of light along the rim
  float edge = above / (px * 1.2);
  colour += mix(SILVER, PALE, dawn) * exp(-edge * edge) * (0.35 + 0.65 * rim);
  // the sun about to rise: a white core, a lime glow, a long flare along the horizon
  vec2 s = p - sun;
  float breathe = 0.9 + 0.1 * sin(t * 0.8);
  colour += PALE * exp(-dot(s, s) / 0.00004) * 1.4;
  colour += mix(LIME, PALE, 0.25) * exp(-dot(s, s) / 0.0025) * 0.38 * breathe;
  colour += LIME * exp(-dot(s, s) / 0.02) * 0.06 * breathe;
  vec2 along = mat2(cos(phi), sin(phi), -sin(phi), cos(phi)) * s;
  colour += mix(LIME, PALE, 0.55) * exp(-along.y * along.y / (0.0016 * 0.0016)) * exp(-abs(along.x) / 0.4) * 0.38 * breathe;
  colour = 1.0 - exp(-colour * 1.3);
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
  const uPlanet = at("uPlanet");
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
      // the rim's top at the bottom of the first screen
      if (narrow) gl.uniform3f(uPlanet, aspect * 0.5, 0.97 + 0.9, 0.9);
      else gl.uniform3f(uPlanet, aspect * 0.5, 0.83 + 1.9, 1.9);
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
