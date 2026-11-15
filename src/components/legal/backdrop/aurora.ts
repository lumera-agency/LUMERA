/*
 * «Сяйво»: streams of glowing fibres weaving down the whole page (the owner, 13 Nov 2026: a reel of a dark site whose
 * green light runs on under its glass blocks, «только адаптировано под ЕКЛО»). The ads page's language (its first
 * screen's fibres): lime lines with a soft core and a faint halo, a few pale and a few cyan, an aurora haze round each
 * stream, light running along the lines; here three streams that swing across the screen as the page goes down, so the
 * ground is one long field and the scroll moves through it. The pointer parts the lines near it. A phone gets a calm
 * ground of the same kind (uCalm): one slow stream of five lines in a softer haze, running through the page as well.
 *
 * One small WebGL2 shader over the screen (the page is drawn on a fixed canvas: backdrop/Backdrop.tsx).
 */
import { PARALLAX, type Create } from "./types";

const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec3 uPointer;
/** a phone (a tall narrow screen) gets its own calm ground (the owner, 14 Nov 2026: «на мобильной версии фон более
 *  спокойный, но так же … проходил через весь сайт»): one slow stream of a few lines standing apart in a wider haze,
 *  less light. uCalm 1 there, uStreams and uLines how many, uDim its light */
uniform float uDim;
uniform float uStreams;
uniform float uLines;
uniform float uCalm;
out vec4 outColour;

const vec3 LIME = vec3(0.776, 0.941, 0.235);
const vec3 LIME_DEEP = vec3(0.659, 0.847, 0.165);
const vec3 PALE = vec3(0.949, 1.0, 0.816);
const vec3 CYAN = vec3(0.357, 0.722, 1.0);
const vec3 AURORA = vec3(0.353, 0.949, 0.851);

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  float H = uRes.y;
  float aspect = uRes.x / H;
  // x across the screen and y down the page, both in screen heights; the page's scroll moves y
  float x = gl_FragCoord.x / H;
  float screenY = (H - gl_FragCoord.y) / H;
  float y = screenY + uScroll / H;
  float t = uTime * 0.001;
  vec2 pointer = vec2(uPointer.x / H, (H - uPointer.y) / H);
  vec3 colour = vec3(0.0);
  for (int s = 0; s < 3; s++) {
    if (float(s) >= uStreams) break;
    float fs = float(s);
    float seed = fs * 17.13 + 3.1;
    // a phone: one slow swing over about three screens, starting at the first screen's right edge
    float f1 = mix(1.7 + fs * 0.41, 0.95, uCalm);
    float a1 = mix(0.36 - fs * 0.05, 0.31, uCalm);
    float ph = mix(seed, 1.24, uCalm) + t * mix(0.05, 0.03, uCalm);
    float wig = mix(0.1, 0.035, uCalm);
    // the stream's centre swings across the screen as the page goes down; its slope keeps the lines' width true
    float centre = aspect * (0.5 + a1 * sin(y * f1 + ph) + wig * sin(y * 4.1 + seed * 2.0 - t * 0.07));
    float slope = aspect * (a1 * f1 * cos(y * f1 + ph) + wig * 4.1 * cos(y * 4.1 + seed * 2.0 - t * 0.07));
    float stretch = inversesqrt(1.0 + slope * slope);
    float breathe = 0.5 + 0.5 * sin(y * 2.6 + seed + t * 0.1);
    float width = mix(0.055 + 0.045 * breathe, 0.1 + 0.03 * breathe, uCalm);
    // brighter in places down the page, faint in others; the first screen gets its full light
    float glowAt = 0.3 + 0.7 * smoothstep(0.1, 0.9, 0.5 + 0.5 * sin(y * 1.25 + seed * 1.7 + t * 0.03));
    glowAt *= 1.0 + 0.5 * (1.0 - smoothstep(0.0, 1.3, y));
    float dc = (x - centre) * stretch;
    // the aurora round the stream (a phone's wider and softer, the lines in it fewer)
    colour += AURORA * mix(0.045, 0.06, uCalm) * glowAt * exp(-dc * dc / (width * width * mix(10.0, 14.0, uCalm))) * (0.55 + 0.45 * sin(y * 5.5 - t * 0.55 + seed));
    colour += LIME_DEEP * mix(0.055, 0.035, uCalm) * glowAt * exp(-dc * dc / (width * width * 3.0));
    for (int j = 0; j < 9; j++) {
      if (float(j) >= uLines) break;
      float fj = float(j);
      float r = hash(seed + fj * 3.7);
      float across = (fj / max(1.0, uLines - 1.0) - 0.5) * 2.0;
      float lineX = centre + across * width + (r - 0.5) * width * mix(0.6, 0.35, uCalm) + mix(0.011, 0.006, uCalm) * sin(y * (9.0 + r * 6.0) + t * (0.35 + r * 0.45) + fj);
      // the pointer parts the lines near it
      float px = lineX - pointer.x;
      float py = screenY - pointer.y;
      lineX += uPointer.z * 0.045 * exp(-(px * px + py * py) / 0.01) * sign(px);
      float d = (x - lineX) * stretch;
      float core = mix(0.0014 + 0.002 * r, 0.0009 + 0.0009 * r, uCalm);
      float halo = core * 4.0;
      float light = exp(-d * d / (core * core)) + mix(0.2, 0.1, uCalm) * halo * halo / (d * d + halo * halo);
      float run = 0.5 + 0.5 * sin(y * (4.5 + r * 4.0) - t * (0.7 + r * 0.6) * mix(1.0, 0.5, uCalm) + fj * 1.7);
      vec3 tint = r < 0.17 ? CYAN : (r > 0.82 ? PALE : mix(LIME, LIME_DEEP, r));
      colour += tint * light * (0.35 + 0.65 * run) * glowAt * (0.3 + 0.55 * r);
    }
  }
  colour = 1.0 - exp(-colour * 1.5 * uDim);
  float alpha = clamp(max(colour.r, max(colour.g, colour.b)), 0.0, 1.0);
  outColour = vec4(colour, alpha);
}`;

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
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(program, "uRes");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uScroll = gl.getUniformLocation(program, "uScroll");
  const uPointer = gl.getUniformLocation(program, "uPointer");
  const uDim = gl.getUniformLocation(program, "uDim");
  const uStreams = gl.getUniformLocation(program, "uStreams");
  const uLines = gl.getUniformLocation(program, "uLines");
  const uCalm = gl.getUniformLocation(program, "uCalm");
  let dpr = 1;
  let lift = 0;
  gl.clearColor(0, 0, 0, 0);

  return {
    resize(w, h, ratio) {
      dpr = ratio;
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      // a phone (a tall narrow screen): the calm ground, one stream of five lines, less light
      const narrow = w / h < 0.8;
      gl.uniform1f(uCalm, narrow ? 1 : 0);
      gl.uniform1f(uStreams, narrow ? 1 : 3);
      gl.uniform1f(uLines, narrow ? 5 : 9);
      gl.uniform1f(uDim, narrow ? 0.75 : 1);
    },
    draw(now, dt, scroll) {
      lift += ((pointer.on ? 1 : 0) - lift) * Math.min(1, dt / 350);
      gl.uniform1f(uTime, now);
      gl.uniform1f(uScroll, scroll * PARALLAX * dpr);
      gl.uniform3f(uPointer, pointer.x * dpr, canvas.height - pointer.y * dpr, lift);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
};
