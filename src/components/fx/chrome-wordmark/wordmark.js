/*
 * The very end of the page: the word in liquid chrome (plain WebGL, no three.js).
 * The word is the mark's own live text (the canvas covers it), so any word does:
 * its size, the canvas and the masks are all measured off it.
 * The letters are a mask. A domain-warped noise field flows through them on
 * its own and is shaded as polished metal: sharp-edged studio reflections, a
 * rounded edge taken from a blurred copy of the mask, warm gold in the swirls.
 * Under the cursor (or a finger) an ivory lens shows the letters in black, its
 * rim rippling like liquid. When the page's stone falls onto the first letter
 * (journey.js fires `journey:splash` at contact), a ring runs out through the
 * metal from there.
 * Renders only while the footer is on screen; without WebGL the CSS text with a
 * static chrome gradient stays.
 *
 *   initWordmark({ reducedMotion, root, calm, step }) → { prepare(), setCalm(on), destroy() }
 * step (default 1, the footer's): how many device px apart the edge's slope is read; letters larger than the footer's word
 * pass their size over the word's, so the frost on the edge keeps the word's density (the 404, ChromeNumber).
 * look (default 'chrome', the footer's): 'lux' is the premium shader (FRAG_LUX), the 404's.
 * maxDpr (default 1.75, the footer's): the device-pixel ratio the metal is drawn at, at most; the 404 draws at 2 (crisper).
 * calm (LITE: the owner, 12 Nov 2026, «хватит картинки, но с линзой»): the metal stands as a picture, drawn once;
 * frames come only while the lens is out, its rim rippling on its own clock. setCalm(true) brings a running mark to
 * rest where it is (a page that goes LITE), without building it anew.
 * destroy() stops it all (frames, listeners, observers) and lets its WebGL context go;
 * started again on a new mark (a language switch renders the page anew) it is live
 * before that page is painted when the mark is on screen or near it.
 */
const font = (size) => `800 ${size}px Archivo, "Arial Black", sans-serif`;
const MAX_DPR = 1.75;
/* The footer's pointer lens (InvertCursor in the layout, 110 px across) hands over to this one at the mark's top edge,
   at once and at its size, and this one grows from there towards the word (the owner, 12 Nov 2026: the lens broke off
   at the edge, one shrinking away, the other growing from nothing). The canvas reaches BLEED css px above the mark so a
   lens that size is whole there: its rim ripples out by up to 3.8% and is softened over 2 px */
const HANDOFF_RADIUS = 55;
const BLEED = Math.ceil((HANDOFF_RADIUS + 2) * 1.04) + 1;

export const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const FRAG = `
precision highp float;
uniform sampler2D uMask;   // the letters, sharp
uniform sampler2D uBevel;  // the letters, blurred: a rounded edge
uniform vec2 uRes;         // canvas size, device px
uniform float uTime;
uniform float uRim;        // the lens's rim's clock: the metal's own, plus what ran while the metal stood (calm)
uniform vec3 uLens;        // centre x, y and radius, device px (origin bottom-left)
uniform float uSlope;      // turns the blurred edge into a slope
uniform float uStep;       // how far apart (device px) the slope is read: 1 for the footer's word (its edge's fine frost);
                           // larger letters read it as many times wider as they are larger, for the same frost (the 404)
uniform vec4 uDrop;        // a drop fell in: x, y (device px, origin bottom-left), age (s), strength
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}
// polished chrome: hard-edged bands of a studio reflection
vec3 chrome(float x) {
  float s = fract(x);
  vec3 c = mix(vec3(0.035, 0.037, 0.042), vec3(0.36, 0.37, 0.40), smoothstep(0.02, 0.20, s));
  c = mix(c, vec3(0.97, 0.96, 0.93), smoothstep(0.30, 0.34, s));
  c = mix(c, vec3(0.62, 0.63, 0.66), smoothstep(0.42, 0.56, s));
  c = mix(c, vec3(0.10, 0.10, 0.11), smoothstep(0.66, 0.92, s));
  return c;
}

void main() {
  vec2 px = vUv * uRes;
  float m = texture2D(uMask, vUv).a;

  vec2 d = px - uLens.xy;
  float ang = atan(d.y, d.x);
  float rad = uLens.z * (1.0 + 0.022 * sin(ang * 5.0 + uRim * 1.6) + 0.016 * sin(ang * 3.0 - uRim * 2.1));
  float lens = uLens.z > 0.5 ? 1.0 - smoothstep(rad - 1.5, rad + 1.5, length(d)) : 0.0;
  if (m < 0.004 && lens < 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // a drop: one ring runs out from where it fell and dies away
  vec2 dd = px - uDrop.xy;
  float dist = length(dd);
  float ring = 0.0;
  if (uDrop.w > 0.0) {
    float front = uDrop.z * uRes.y * 1.6;
    ring = exp(-pow((dist - front) / (uRes.y * 0.09), 2.0)) * exp(-uDrop.z * 1.2) * uDrop.w;
  }

  // the liquid: a slow, self-moving warp of the noise field
  vec2 p = px / uRes.y * 1.6 + normalize(dd + 1e-4) * ring * 0.12;
  float t = uTime * 0.09;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  float flow = fbm(p + 2.1 * q + vec2(0.7 * t, -0.45 * t)) + ring * 0.4;

  vec2 texel = uStep / uRes;
  float bl = texture2D(uBevel, vUv - vec2(texel.x, 0.0)).a;
  float br = texture2D(uBevel, vUv + vec2(texel.x, 0.0)).a;
  float bd = texture2D(uBevel, vUv - vec2(0.0, texel.y)).a;
  float bu = texture2D(uBevel, vUv + vec2(0.0, texel.y)).a;
  vec2 slope = vec2(br - bl, bu - bd) * uSlope / uStep;
  float edge = clamp(length(slope), 0.0, 1.0);

  float x = flow * 3.4 + dot(slope, vec2(0.55, 1.1)) * 1.4 + vUv.y * 0.35;
  vec3 col = chrome(x);
  float warm = smoothstep(0.52, 0.78, fbm(p * 0.8 + q * 1.4 - vec2(t * 0.8, 0.0)));
  col = mix(col, col * vec3(1.28, 0.86, 0.52) + vec3(0.10, 0.035, 0.0), warm * 0.65);
  col += vec3(1.0, 0.97, 0.9) * smoothstep(0.55, 0.95, edge) * 0.18 * (0.5 + 0.5 * sin(x * 6.2832));
  col += vec3(1.0, 0.97, 0.9) * ring * 0.2; // the ring only: no flash, no colour

  // the lens: ivory disc, letters in black, rippling a little
  vec2 wob = (q - 0.5) * 10.0 / uRes;
  float ml = texture2D(uMask, vUv + wob).a;
  vec3 lensCol = mix(vec3(0.945, 0.925, 0.89), vec3(0.03), ml);

  gl_FragColor = vec4(mix(col * m, lensCol, lens), mix(m, 1.0, lens));
}`;

/* The premium look (the 404's number; the owner, 13 Nov 2026: «ещё премиальнее»): the same inputs, the frost kept on a
   smooth body (the slope read broad, plus what the fine read adds), a studio to reflect (deep cool black, a soft-box
   with a hot line on its edge, a steel band), a key light's crisp highlight and broad sheen, a rim that catches the room
   (fresnel), champagne in the swirls, rare glints in the frost, a
   lively flow (as the footer's, larger swirls) and highlights that roll off instead of flattening. */
export const FRAG_LUX = `
precision highp float;
uniform sampler2D uMask;   // the letters, sharp
uniform sampler2D uBevel;  // the letters, blurred: a rounded edge
uniform vec2 uRes;         // canvas size, device px
uniform float uTime;
uniform float uRim;        // the lens's rim's clock: the metal's own, plus what ran while the metal stood (calm)
uniform vec3 uLens;        // centre x, y and radius, device px (origin bottom-left)
uniform float uSlope;      // turns the blurred edge into a slope
uniform float uStep;       // how far apart (device px) the slope is read: 1 for the footer's word (its edge's fine frost);
                           // larger letters read it as many times wider as they are larger, for the same frost (the 404)
uniform vec4 uDrop;        // a drop fell in: x, y (device px, origin bottom-left), age (s), strength
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}
// the studio the metal reflects
vec3 studio(float x) {
  float s = fract(x);
  vec3 c = mix(vec3(0.018, 0.02, 0.026), vec3(0.34, 0.36, 0.40), smoothstep(0.02, 0.20, s));
  c = mix(c, vec3(0.985, 0.975, 0.95), smoothstep(0.306, 0.326, s));
  c += vec3(0.5) * exp(-pow((s - 0.318) / 0.0055, 2.0));
  c = mix(c, vec3(0.64, 0.66, 0.70), smoothstep(0.45, 0.53, s));
  c = mix(c, vec3(0.06, 0.062, 0.07), smoothstep(0.70, 0.86, s));
  return c;
}

void main() {
  vec2 px = vUv * uRes;
  float m = texture2D(uMask, vUv).a;

  vec2 d = px - uLens.xy;
  float ang = atan(d.y, d.x);
  float rad = uLens.z * (1.0 + 0.022 * sin(ang * 5.0 + uRim * 1.6) + 0.016 * sin(ang * 3.0 - uRim * 2.1));
  float lens = uLens.z > 0.5 ? 1.0 - smoothstep(rad - 1.5, rad + 1.5, length(d)) : 0.0;
  if (m < 0.004 && lens < 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 dd = px - uDrop.xy;
  float dist = length(dd);
  float ring = 0.0;
  if (uDrop.w > 0.0) {
    float front = uDrop.z * uRes.y * 1.6;
    ring = exp(-pow((dist - front) / (uRes.y * 0.09), 2.0)) * exp(-uDrop.z * 1.2) * uDrop.w;
  }

  // the liquid: as lively as the footer's, its swirls large and deep
  vec2 p = px / uRes.y * 1.6 + normalize(dd + 1e-4) * ring * 0.12;
  float t = uTime * 0.085;
  vec2 pc = p * 0.85;
  vec2 q = vec2(fbm(pc + vec2(0.0, t)), fbm(pc + vec2(5.2, 1.3) - t));
  float flow = fbm(pc + 2.35 * q + vec2(0.75 * t, -0.5 * t)) + ring * 0.4;

  // the body's slope read broad (smooth), the frost from the fine read on top of it
  vec2 tx = uStep / uRes;
  vec2 fine = vec2(texture2D(uBevel, vUv + vec2(tx.x, 0.0)).a - texture2D(uBevel, vUv - vec2(tx.x, 0.0)).a,
                   texture2D(uBevel, vUv + vec2(0.0, tx.y)).a - texture2D(uBevel, vUv - vec2(0.0, tx.y)).a) * uSlope / uStep;
  vec2 tw = tx * 4.0;
  vec2 broad = vec2(texture2D(uBevel, vUv + vec2(tw.x, 0.0)).a - texture2D(uBevel, vUv - vec2(tw.x, 0.0)).a,
                    texture2D(uBevel, vUv + vec2(0.0, tw.y)).a - texture2D(uBevel, vUv - vec2(0.0, tw.y)).a) * uSlope / (uStep * 4.0);
  vec2 slope = broad + (fine - broad) * 0.85;
  float edge = clamp(length(slope), 0.0, 1.0);

  // the footer's bands, mapped as there
  float x = flow * 3.9 + dot(slope, vec2(0.55, 1.1)) * 1.4 + vUv.y * 0.35;
  vec3 col = studio(x);
  // champagne, not orange, in the swirls
  float warm = smoothstep(0.55, 0.8, fbm(p * 0.8 + q * 1.4 - vec2(t * 0.8, 0.0)));
  col = mix(col, col * vec3(1.15, 0.97, 0.8) + vec3(0.035, 0.02, 0.0), warm * 0.6);
  // a volume lit from above: the smooth body's normal
  vec3 nb = normalize(vec3(-broad * 0.9, 1.0));
  col *= mix(0.84, 1.06, smoothstep(-0.45, 0.45, nb.y));
  // the key light's crisp highlight on the edges that face it, and a rim that catches the room
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), nb);
  float rl = max(dot(r, normalize(vec3(-0.5, 0.65, 0.6))), 0.0);
  col += vec3(1.0, 0.98, 0.94) * pow(rl, 220.0) * 0.95;
  col += vec3(0.9, 0.92, 0.95) * pow(clamp(1.0 - nb.z, 0.0, 1.0), 2.5) * 0.18 * smoothstep(-0.2, 0.5, nb.y);
  // the frost catching light (as the footer's), and rare glints in it
  col += vec3(1.0, 0.97, 0.9) * smoothstep(0.55, 0.95, edge) * 0.18 * (0.5 + 0.5 * sin(x * 6.2832));
  float h = hash(floor(px / 3.0));
  float glint = pow(max(0.0, sin(uTime * 1.3 + h * 40.0)), 24.0);
  col += vec3(1.0) * step(0.992, h) * glint * smoothstep(0.25, 0.8, edge) * 0.9;
  col += vec3(1.0, 0.97, 0.9) * ring * 0.2;
  col = col / (1.0 + max(col - 0.85, 0.0) * 0.8);

  vec2 wob = (q - 0.5) * 10.0 / uRes;
  float ml = texture2D(uMask, vUv + wob).a;
  vec3 lensCol = mix(vec3(0.945, 0.925, 0.89), vec3(0.03), ml);

  gl_FragColor = vec4(mix(col * m, lensCol, lens), mix(m, 1.0, lens));
}`;

export function initWordmark({ reducedMotion, root = document.querySelector('[data-wordmark]'), calm = false, step = 1, look = 'chrome', maxDpr = MAX_DPR }) {
  const text = root?.textContent.trim();
  if (!text) return { prepare: () => null, setCalm() {}, destroy() {} };
  // what has to be undone (added to as it starts); stopped: no more starting; calm: the metal stands (read each frame);
  // wake: starts the frames again once the mark is built
  const run = { stopped: false, stops: [], calm, wake: () => {} };
  const setCalm = (on) => {
    run.calm = on;
    run.wake();
  };
  const destroy = () => {
    if (run.stopped) return;
    run.stopped = true;
    run.stops.splice(0).forEach((stop) => stop());
  };
  fitText(root, text, run);
  if (!window.WebGLRenderingContext) return { prepare: () => null, setCalm, destroy };
  // set up as the visitor comes near the footer (the owner, 12 Nov 2026: it was set up a moment after the hero's intro,
  // a WebGL context and the shader's compile for a block most visits never reach): within three screens of it, in a
  // pause of the scrolling with the browser idle; within one screen, at once. The shader compiles in the background
  // where the browser can (see start())
  let started = null;
  const go = (atOnce = false) => {
    if (started || run.stopped) return started;
    near.disconnect();
    close.disconnect();
    window.removeEventListener('scroll', onScroll);
    started = start(root, text, reducedMotion, run, atOnce, step, look, maxDpr).catch((error) => {
      root.classList.remove('is-live');
      console.warn('[wordmark] static fallback.', error);
    });
    return started;
  };
  let lastScroll = 0;
  const onScroll = () => { lastScroll = performance.now(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  let timer = 0;
  let waiting = false;
  let cancelIdle = () => {};
  const whenQuiet = () => {
    const quiet = performance.now() - lastScroll;
    if (!started && quiet < 250) {
      timer = setTimeout(whenQuiet, 270 - quiet);
      return;
    }
    if (!started) cancelIdle = whenIdle(() => go(), 0);
  };
  const near = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || waiting) return;
    waiting = true;
    whenQuiet();
  }, { rootMargin: '300% 0px' });
  const close = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) go(); }, { rootMargin: '100% 0px' });
  near.observe(root);
  close.observe(root);
  run.stops.push(() => {
    near.disconnect();
    close.disconnect();
    window.removeEventListener('scroll', onScroll);
    clearTimeout(timer);
    cancelIdle();
  });
  // on screen already, or about to be (a language switch from the footer's own UA · RU): built now, so the page
  // in the other language is never painted with the plain text in its place
  const box = root.getBoundingClientRect();
  if (box.bottom > -innerHeight * 1.5 && box.top < innerHeight * 2.5) go(true);
  return { prepare: () => go(), setCalm, destroy };
}

const fontReady = () => !document.fonts || document.fonts.check(font(100));

/* The live text's size off its own width (--mark-fit in footer.css: font size per width of the mark), once the
   web font is in: before the canvas, and without WebGL, the text spans the mark whatever the word */
function fitText(root, text, run) {
  const fit = () => {
    if (run.stopped) return;
    const g = document.createElement('canvas').getContext('2d');
    g.font = font(200);
    root.style.setProperty('--mark-fit', String(200 / g.measureText(text).width));
  };
  run.stops.push(() => root.style.removeProperty('--mark-fit'));
  if (fontReady()) fit(); // (in already: measured at once, before the next paint)
  else document.fonts.load(font(100)).then(fit).catch(() => {});
}

/** Runs `fn` once the page has been quiet for a while after `delay` ms; returns what cancels it. */
function whenIdle(fn, delay) {
  let idle = 0;
  const timer = setTimeout(() => {
    if (window.requestIdleCallback) idle = requestIdleCallback(fn, { timeout: 2500 });
    else fn();
  }, delay);
  return () => {
    clearTimeout(timer);
    if (idle) cancelIdleCallback(idle);
  };
}

// canvases whose context a stopped run let go of: lost for good, so a new run draws on a fresh one
const released = new WeakSet();

/* Compiled without asking for the result: the status is read once the program has linked,
   so a driver that compiles in parallel (KHR_parallel_shader_compile) isn't made to block */
function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function makeTexture(gl, unit) {
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

/** Centre of a letter's stem, from its left ink edge, at font(200) — read off the glyph itself: the narrowest
 *  first run of ink across its height (an arm, a bar or a foot runs wider), so it holds for an E as for an L. */
function stemOf(letter) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d', { willReadFrequently: true });
  g.font = font(200);
  const m = g.measureText(letter);
  c.width = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + 40;
  c.height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + 40;
  g.font = font(200); // sizing the canvas reset it
  g.fillStyle = '#fff';
  g.fillText(letter, m.actualBoundingBoxLeft + 20, m.actualBoundingBoxAscent + 20);
  const px = g.getImageData(0, 0, c.width, c.height).data;
  let stem = null;
  for (let f = 0.15; f < 0.86; f += 0.05) {
    const y = Math.round(20 + m.actualBoundingBoxAscent * f);
    let x0 = -1;
    let x1 = -1;
    for (let x = 0; x < c.width; x++) {
      if (px[(y * c.width + x) * 4 + 3] > 128) {
        if (x0 < 0) x0 = x;
        x1 = x;
      } else if (x0 >= 0) break;
    }
    if (x0 >= 0 && (!stem || x1 - x0 < stem[1] - stem[0])) stem = [x0, x1];
  }
  return stem ? (stem[0] + stem[1]) / 2 - 20 : null;
}

/* atOnce: wanted on screen now, so no step waits for a later frame (the shader is compiled where it stands) */
async function start(root, text, reducedMotion, run, atOnce, step = 1, look = 'chrome', maxDpr = MAX_DPR) {
  let canvas = root.querySelector('canvas');
  if (released.has(canvas)) {
    const fresh = canvas.cloneNode(false);
    canvas.replaceWith(fresh);
    canvas = fresh;
  }
  // the letters are drawn from the web font, so it has to be there first
  if (!fontReady()) {
    await Promise.race([document.fonts.load(font(100)), new Promise((resolve) => setTimeout(resolve, 3000))]).catch(() => {});
    if (run.stopped) return;
  }

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;
  // stopped, the context goes at once (a page that switches languages back and forth would pile them up)
  const lose = gl.getExtension('WEBGL_lose_context');
  run.stops.push(() => {
    released.add(canvas);
    lose?.loseContext();
  });
  const program = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, look === 'lux' ? FRAG_LUX : FRAG);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  // where the driver compiles in the background, wait for it a frame at a time instead of stalling the page
  const parallel = atOnce ? null : gl.getExtension('KHR_parallel_shader_compile');
  if (parallel) {
    await new Promise((resolve) => {
      const poll = () => (run.stopped || gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR) ? resolve() : requestAnimationFrame(poll));
      poll();
    });
    if (run.stopped) return;
  }
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getShaderInfoLog(vs) || gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const u = (name) => gl.getUniformLocation(program, name);
  const uRes = u('uRes');
  const uTime = u('uTime');
  const uRim = u('uRim');
  const uLens = u('uLens');
  const uSlope = u('uSlope');
  gl.uniform1f(u('uStep'), step);
  const uDrop = u('uDrop');
  gl.uniform1i(u('uMask'), 0);
  gl.uniform1i(u('uBevel'), 1);
  const maskTex = makeTexture(gl, 0);
  const bevelTex = makeTexture(gl, 1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const paint = document.createElement('canvas').getContext('2d');
  let dpr = 1;
  let lensRadius = 0; // css px
  let stem = { x: 0, y: 0 }; // css px, from the top-left of the mark
  const dropSlot = root.querySelector('[data-slot="drop"]');
  // a drop that fell in: where (device px), how long ago (s)
  const drop = { x: 0, y: 0, age: 99, power: 0 };
  const DROP_LIFE = 2.6;

  // fit the word to the container, size the canvas, draw both masks
  const layout = () => {
    const width = root.clientWidth;
    if (!width) return;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    paint.font = font(200);
    const probe = paint.measureText(text);
    const inkWidth = probe.actualBoundingBoxLeft + probe.actualBoundingBoxRight;
    const scale = width / inkWidth;
    const capHeight = (probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent) * scale;
    lensRadius = capHeight * 0.62;
    const padY = Math.ceil(Math.max(14, lensRadius - capHeight / 2 + 14));
    const height = Math.ceil(capHeight + padY * 2);
    root.style.height = `${height}px`;
    // (the canvas reaches BLEED above the mark, out of the pointer's way: footer.css)
    canvas.style.top = `${-BLEED}px`;
    canvas.style.height = `${height + BLEED}px`;

    const w = Math.round(width * dpr);
    const h = Math.round((height + BLEED) * dpr);
    canvas.width = w;
    canvas.height = h;
    const size = 200 * scale * dpr;
    const x = probe.actualBoundingBoxLeft * scale * dpr;
    const y = (BLEED + padY + probe.actualBoundingBoxAscent * scale) * dpr;

    paint.canvas.width = w;
    paint.canvas.height = h;
    paint.clearRect(0, 0, w, h);
    paint.font = font(size);
    paint.fillStyle = '#fff';
    paint.fillText(text, x, y);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, paint.canvas);

    // blurred copy through the shadow trick (works where ctx.filter does not)
    const blur = capHeight * dpr * 0.08;
    paint.clearRect(0, 0, w, h);
    paint.font = font(size);
    paint.shadowColor = '#fff';
    paint.shadowBlur = blur;
    paint.shadowOffsetX = w * 2;
    paint.fillText(text, x - w * 2, y);
    paint.shadowBlur = 0;
    paint.shadowOffsetX = 0;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bevelTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, paint.canvas);

    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uSlope, blur * 0.9);
    // where a falling drop lands: the top of the first letter's stem (the stone docks there, journey.js)
    const stemX = (stemOf(text[0]) ?? 0.1 * inkWidth) * scale;
    stem = { x: stemX, y: padY };
    if (dropSlot) {
      dropSlot.style.left = `${stemX}px`;
      dropSlot.style.top = `${padY}px`;
      dropSlot.style.width = dropSlot.style.height = `${capHeight * 0.34}px`;
    }
    root.classList.add('is-live');
  };

  // lens: follows the pointer with a little lag, grows in and out
  const target = { x: 0, y: 0, r: 0 };
  const lens = { x: 0, y: 0, r: 0 };
  let inside = false;
  const aim = (e) => {
    const rect = canvas.getBoundingClientRect();
    target.x = (e.clientX - rect.left) * dpr;
    target.y = (rect.bottom - e.clientY) * dpr;
    target.r = lensRadius * dpr;
    if (!inside) {
      lens.x = target.x;
      lens.y = target.y;
      // a mouse coming in takes over from the footer's pointer lens: at once, at the size there is room for here (at the
      // top edge the pointer lens's own), not grown from nothing
      if (e.pointerType === 'mouse') lens.r = Math.min(target.r, roomFor(target.x, target.y));
      inside = true;
    }
    wake();
  };
  // a mouse going out hands back to the footer's pointer lens at once (a finger's lens shrinks away)
  const away = (e) => {
    target.r = 0;
    if (e?.pointerType === 'mouse') lens.r = 0;
    inside = false;
    wake();
  };
  const off = new AbortController();
  const signal = off.signal;
  // a finger: the lens comes once it rests on the word (a thumb that starts a scroll there is cancelled before, so the
  // lens no longer flashes under it: the owner, 6 Nov 2026), then follows it until it lifts
  let rest = 0;
  const settle = () => clearTimeout(rest);
  signal.addEventListener('abort', settle);
  root.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || inside) aim(e); }, { signal });
  root.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return aim(e);
    settle();
    rest = setTimeout(() => aim(e), 160);
  }, { signal });
  root.addEventListener('pointerleave', away, { signal });
  root.addEventListener('pointercancel', () => { settle(); away(); }, { signal });
  root.addEventListener('pointerup', (e) => { settle(); if (e.pointerType !== 'mouse') away(); }, { signal });

  let time = 0;
  // what the lens's rim ran while the metal stood (calm)
  let rim = 0;
  let last = 0;
  let raf = 0;
  let visible = false;
  // the lens stays whole inside the canvas: near an edge it is smaller, growing to its size towards the word's middle (the
  // owner, 12 Nov 2026: near the top it was cut off by a straight line, the canvas's edge). Its rim ripples out by up to
  // 3.8% and is softened over 1.5 px, so that much room is kept
  const roomFor = (x, y) => Math.max(0, Math.min(x, canvas.width - x, y, canvas.height - y) / 1.04 - 2);
  const draw = () => {
    gl.uniform1f(uTime, time);
    gl.uniform1f(uRim, time + rim);
    gl.uniform3f(uLens, lens.x, lens.y, Math.min(lens.r, roomFor(lens.x, lens.y)));
    gl.uniform4f(uDrop, drop.x, drop.y, drop.age, drop.age < DROP_LIFE ? drop.power : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  // the page's stone lands on the first letter (journey.js); the ring runs out from there
  document.addEventListener('journey:splash', () => {
    if (reducedMotion || !canvas.height) return;
    drop.x = stem.x * dpr;
    drop.y = canvas.height - (BLEED + stem.y) * dpr;
    drop.age = 0;
    drop.power = 0.8;
    wake();
  }, { signal });
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    // after a drop the metal runs a little faster (×1.4), settling back over 1.2 s
    const stir = drop.age < 1.2 ? 0.4 * (1 - (drop.age / 1.2) ** 2 * (3 - 2 * (drop.age / 1.2))) : 0;
    if (!reducedMotion) {
      if (run.calm) rim += dt;
      else time += dt * (1 + stir);
    }
    if (drop.age < DROP_LIFE) drop.age += dt;
    const follow = 1 - Math.exp(-dt * 14);
    lens.x += (target.x - lens.x) * follow;
    lens.y += (target.y - lens.y) * follow;
    lens.r += (target.r - lens.r) * (1 - Math.exp(-dt * 9));
    if (lens.r < 0.5 && target.r === 0) lens.r = 0;
    draw();
    const settling = Math.abs(lens.r - target.r) > 0.5 || Math.hypot(target.x - lens.x, target.y - lens.y) > 0.5 || drop.age < DROP_LIFE;
    // calm: nothing moves but the lens, so no frame is drawn once it is gone
    const moving = !reducedMotion && (!run.calm || lens.r > 0);
    raf = visible && !document.hidden && (moving || settling) ? requestAnimationFrame(frame) : 0;
  };
  run.wake = () => wake();
  function wake() {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  layout();
  draw();
  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting; // the newest entry (one target)
    if (visible) wake();
  }, { rootMargin: '80px 0px' });
  io.observe(root);
  document.addEventListener('visibilitychange', wake, { signal });

  let width = root.clientWidth;
  let timer = 0;
  const ro = new ResizeObserver(() => {
    if (root.clientWidth === width) return;
    width = root.clientWidth;
    clearTimeout(timer);
    timer = setTimeout(() => {
      layout();
      draw();
    }, 150);
  });
  ro.observe(root);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
    root.classList.remove('is-live');
    root.style.height = '';
  }, { signal });

  run.stops.push(() => {
    off.abort();
    io.disconnect();
    ro.disconnect();
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
    root.classList.remove('is-live');
    root.style.height = '';
    if (dropSlot) dropSlot.style.left = dropSlot.style.top = dropSlot.style.width = dropSlot.style.height = '';
  });
}
