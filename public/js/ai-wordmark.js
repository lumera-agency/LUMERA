/*
 * The AI pages' copy of the main page's js/wordmark.js: LUMERA at the very end of the page in liquid chrome
 * (plain WebGL, no three.js). Same shader, same look: a domain-warped noise field flows through the letters
 * and is shaded as polished metal, with a rounded edge from a blurred copy of the mask and warm gold in the
 * swirls; under the cursor (or a finger) an ivory lens shows the letters in black, its rim rippling.
 * Kept separate so neither page depends on the other's scripts. Left out here: the stone's drop (journey.js
 * has no stone on these pages; the shader's uDrop stays at 0) and the wait for the main page's intro.
 * Renders only while the footer is on screen; with reduced motion the metal stands still (the lens still
 * follows); without WebGL the CSS text with a static chrome gradient stays.
 */
const TEXT = 'LUMERA';
const font = (size) => `800 ${size}px Archivo, "Arial Black", sans-serif`;
const MAX_DPR = 1.75;

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D uMask;   // the letters, sharp
uniform sampler2D uBevel;  // the letters, blurred: a rounded edge
uniform vec2 uRes;         // canvas size, device px
uniform float uTime;
uniform vec3 uLens;        // centre x, y and radius, device px (origin bottom-left)
uniform float uSlope;      // turns the blurred edge into a slope
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
  float rad = uLens.z * (1.0 + 0.022 * sin(ang * 5.0 + uTime * 1.6) + 0.016 * sin(ang * 3.0 - uTime * 2.1));
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

  vec2 texel = 1.0 / uRes;
  float bl = texture2D(uBevel, vUv - vec2(texel.x, 0.0)).a;
  float br = texture2D(uBevel, vUv + vec2(texel.x, 0.0)).a;
  float bd = texture2D(uBevel, vUv - vec2(0.0, texel.y)).a;
  float bu = texture2D(uBevel, vUv + vec2(0.0, texel.y)).a;
  vec2 slope = vec2(br - bl, bu - bd) * uSlope;
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

export function initWordmark({ reducedMotion }) {
  const root = document.querySelector('[data-wordmark]');
  if (!root || !window.WebGLRenderingContext) return;
  // built ahead, in a pause in the scrolling a few seconds after the page has opened (its first scene has
  // played by then); reaching the footer sooner than that builds it there. The shader compiles in the
  // background where the browser can (see start())
  let started = null;
  const go = () => {
    if (started) return;
    io.disconnect();
    started = start(root, reducedMotion).catch((error) => {
      root.classList.remove('is-live');
      console.warn('[wordmark] static fallback.', error);
    });
  };
  const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) go(); }, { rootMargin: '150% 0px' });
  io.observe(root);
  let lastScroll = 0;
  const onScroll = () => { lastScroll = performance.now(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  const still = () => {
    if (started) return window.removeEventListener('scroll', onScroll);
    const quiet = performance.now() - lastScroll;
    if (quiet < 250) return setTimeout(still, 270 - quiet);
    window.removeEventListener('scroll', onScroll);
    return whenIdle(go, 0);
  };
  setTimeout(still, 4000);
}

/** Runs `fn` once the page has been quiet for a while after `delay` ms. */
function whenIdle(fn, delay) {
  setTimeout(() => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2500 }) : fn()), delay);
}

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

async function start(root, reducedMotion) {
  const canvas = root.querySelector('canvas');
  // the letters are drawn from the web font, so it has to be there first
  await Promise.race([document.fonts?.load(font(100)), new Promise((resolve) => setTimeout(resolve, 3000))]).catch(() => {});

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;
  const program = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  // where the driver compiles in the background, wait for it a frame at a time instead of stalling the page
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  if (parallel) {
    await new Promise((resolve) => {
      const poll = () => (gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR) ? resolve() : requestAnimationFrame(poll));
      poll();
    });
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
  const uLens = u('uLens');
  const uSlope = u('uSlope');
  gl.uniform1i(u('uMask'), 0);
  gl.uniform1i(u('uBevel'), 1);
  gl.uniform4f(u('uDrop'), 0, 0, 99, 0); // no stone here: no drop
  const maskTex = makeTexture(gl, 0);
  const bevelTex = makeTexture(gl, 1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const paint = document.createElement('canvas').getContext('2d');
  let dpr = 1;
  let lensRadius = 0; // css px

  // fit the word to the container, size the canvas, draw both masks
  const layout = () => {
    const width = root.clientWidth;
    if (!width) return;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    paint.font = font(200);
    const probe = paint.measureText(TEXT);
    const inkWidth = probe.actualBoundingBoxLeft + probe.actualBoundingBoxRight;
    const scale = width / inkWidth;
    const capHeight = (probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent) * scale;
    lensRadius = capHeight * 0.62;
    const padY = Math.ceil(Math.max(14, lensRadius - capHeight / 2 + 14));
    const height = Math.ceil(capHeight + padY * 2);
    root.style.height = `${height}px`;

    const w = Math.round(width * dpr);
    const h = Math.round(height * dpr);
    canvas.width = w;
    canvas.height = h;
    const size = 200 * scale * dpr;
    const x = probe.actualBoundingBoxLeft * scale * dpr;
    const y = (padY + probe.actualBoundingBoxAscent * scale) * dpr;

    paint.canvas.width = w;
    paint.canvas.height = h;
    paint.clearRect(0, 0, w, h);
    paint.font = font(size);
    paint.fillStyle = '#fff';
    paint.fillText(TEXT, x, y);
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
    paint.fillText(TEXT, x - w * 2, y);
    paint.shadowBlur = 0;
    paint.shadowOffsetX = 0;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bevelTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, paint.canvas);

    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uSlope, blur * 0.9);
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
      inside = true;
    }
    wake();
  };
  const away = () => {
    target.r = 0;
    inside = false;
    wake();
  };
  root.addEventListener('pointermove', aim);
  root.addEventListener('pointerdown', aim);
  root.addEventListener('pointerleave', away);
  root.addEventListener('pointercancel', away);
  root.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') away(); });

  let time = 0;
  let last = 0;
  let raf = 0;
  let visible = false;
  const draw = () => {
    gl.uniform1f(uTime, time);
    gl.uniform3f(uLens, lens.x, lens.y, lens.r);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (!reducedMotion) time += dt;
    const follow = 1 - Math.exp(-dt * 14);
    lens.x += (target.x - lens.x) * follow;
    lens.y += (target.y - lens.y) * follow;
    lens.r += (target.r - lens.r) * (1 - Math.exp(-dt * 9));
    if (lens.r < 0.5 && target.r === 0) lens.r = 0;
    draw();
    const settling = Math.abs(lens.r - target.r) > 0.5 || Math.hypot(target.x - lens.x, target.y - lens.y) > 0.5;
    raf = visible && !document.hidden && (!reducedMotion || settling) ? requestAnimationFrame(frame) : 0;
  };
  function wake() {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  layout();
  draw();
  new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting; // the newest entry (one target)
    if (visible) wake();
  }, { rootMargin: '80px 0px' }).observe(root);
  document.addEventListener('visibilitychange', wake);

  let width = root.clientWidth;
  let timer = 0;
  new ResizeObserver(() => {
    if (root.clientWidth === width) return;
    width = root.clientWidth;
    clearTimeout(timer);
    timer = setTimeout(() => {
      layout();
      draw();
    }, 150);
  }).observe(root);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
    root.classList.remove('is-live');
    root.style.height = '';
  });
}
