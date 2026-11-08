/*
 * TEMPORARY · variant F (?p=f), the first screen's background: slow folds of ember light on the dark ground, a fine
 * grain over them; the chat's cards float in front. The idea is 21st.dev's «Glass Fold» shader (GradFlow) and its
 * «Shader Lines» neighbours (https://21st.dev/community/components/s/shader), rebuilt here as one full-screen triangle
 * and one small fragment shader on raw WebGL2 (no package). It is not the sites page's FluxLines (thin bright contour
 * lines in a noise field, flowing down): here a few wide translucent sheets lie one over another, each lit along its
 * curved edge and fading into its own body, swaying sideways about once a minute and a half.
 *
 * Costs (the owner's rules for this one moving part): drawn only while the first screen is on the screen and the tab
 * is shown (IntersectionObserver, visibilitychange), at most 30 frames a second (24 on phones), at the screen's CSS
 * pixels × 0.75 with the device pixel ratio capped at 1.5 (phones: × 0.6, capped at 1: about a third of a phone's
 * own pixels; the folds are soft, the canvas scaled up reads the same). With reduced motion one still frame. No
 * WebGL2, a shader that will not build, or a lost context: the canvas goes and the CSS poster under it stays.
 * Colours: the page's tokens (--bg, --ember-deep, --ember, --ember-hi, --ink), read from the CSS.
 * Under the words (`text`, the first screen's head) the light keeps low, so they read at AA.
 */

const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uText;
uniform vec3 uBg;
uniform vec3 uDeep;
uniform vec3 uEmber;
uniform vec3 uHot;
uniform vec3 uChrome;
uniform float uTall;
out vec4 outColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// one sheet: its edge a slow wave across x; .x its lit rim, .y the light on its body, .z how much it hides behind it
vec3 fold(vec2 p, float off, float amp, float freq, float speed, float phase, float soft) {
  float t = uTime * speed;
  float a = p.x * freq + t + phase;
  float b = p.x * freq * 0.57 - t * 0.63 + phase * 1.9;
  float wave = sin(a) * amp + sin(b) * amp * 0.55;
  float slope = cos(a) * amp * freq + cos(b) * amp * 0.31 * freq;
  float d = p.y - off - wave;
  float rim = exp(-abs(d) * 64.0) + 0.35 * exp(-abs(d) * 14.0);
  float body = d < 0.0 ? exp(d / soft) : 0.0;
  float sheen = 0.4 + 0.6 * smoothstep(0.0, 0.8, abs(slope));
  float cover = smoothstep(0.006, -0.03, d);
  return vec3(rim * sheen, body * (0.55 + 0.45 * sheen), cover);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - vec2(0.62, 0.5)) * vec2(aspect, 1.0);
  // phones (a tall screen): the same folds, seen across a narrower, taller window
  p *= mix(1.0, 0.62, uTall);
  float ang = mix(0.46, 0.9, uTall);
  float c = cos(ang);
  float s = sin(ang);
  p = mat2(c, s, -s, c) * p;

  vec3 col = vec3(0.0);
  vec3 f = fold(p, 0.46, 0.09, 2.2, 0.07, 0.0, 0.24);
  col = col * (1.0 - f.z * 0.5) + uDeep * f.y * 0.42 + uEmber * f.x * 0.42;
  f = fold(p, 0.17, 0.12, 1.6, 0.085, 2.1, 0.2);
  col = col * (1.0 - f.z * 0.55) + uDeep * f.y * 0.5 + uEmber * f.x * 0.55;
  f = fold(p, -0.1, 0.1, 2.5, 0.06, 4.0, 0.16);
  col = col * (1.0 - f.z * 0.55) + mix(uDeep, uEmber, 0.45) * f.y * 0.55 + uHot * f.x * 0.7 + uChrome * pow(f.x, 6.0) * 0.18;
  f = fold(p, -0.38, 0.13, 1.25, 0.075, 5.3, 0.22);
  col = col * (1.0 - f.z * 0.6) + uDeep * f.y * 0.45 + uEmber * f.x * 0.5;

  // the words' place: the light keeps low there
  vec2 q = (uv - uText.xy) / max(uText.zw, vec2(0.01));
  float keep = 1.0 - 0.8 * exp(-dot(q, q) * 1.4);
  // out towards the next block and under the topbar
  float fade = smoothstep(0.0, 0.32, uv.y) * (1.0 - 0.35 * smoothstep(0.86, 1.0, uv.y));
  col *= keep * fade;

  // a fine grain (static: the light moves, the grain stays, as a print's would); it also keeps the gradients unbanded
  float g = hash(gl_FragCoord.xy) - 0.5;
  col += g * (0.012 + 0.09 * max(col.r, 0.0));
  outColor = vec4(uBg + max(col, vec3(0.0)), 1.0);
}`;

/** a token's colour as linear 0–1 RGB (the browser parses it: hex, rgb(), color-mix()) */
function tokenRGB(host, name, fallback) {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  probe.style.display = 'none';
  host.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  const m = value.match(/[\d.]+/g);
  return m && m.length >= 3 ? m.slice(0, 3).map((n) => Number(n) / 255) : fallback;
}

function build(gl) {
  const shader = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  };
  const vs = shader(gl.VERTEX_SHADER, VERTEX);
  const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  const u = {};
  for (const name of ['uRes', 'uTime', 'uText', 'uBg', 'uDeep', 'uEmber', 'uHot', 'uChrome', 'uTall']) u[name] = gl.getUniformLocation(prog, name);
  return { prog, u };
}

/** where the folds stand at the first frame (and the still one): a composition chosen by eye */
const T0 = 18;

/**
 * Mounts the light in `host` (an aria-hidden box with the CSS poster). `still`: one frame, no motion (reduced motion).
 * `text`: the element the words are in (the light keeps low under it). Returns a stop function, or null when it can't.
 */
export function mountFold(host, { still = false, text = null } = {}) {
  const phone = matchMedia('(max-width: 860px), (hover: none) and (pointer: coarse)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'pf-bg__gl';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const program = build(gl);
  if (!program) return null;
  const { prog, u } = program;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const colours = {
    uBg: tokenRGB(host, '--bg', [0.04, 0.04, 0.04]),
    uDeep: tokenRGB(host, '--ember-deep', [0.69, 0.27, 0.1]),
    uEmber: tokenRGB(host, '--ember', [0.82, 0.34, 0.11]),
    uHot: tokenRGB(host, '--ember-hi', [0.89, 0.4, 0.16]),
    uChrome: tokenRGB(host, '--ink', [0.96, 0.96, 0.95]),
  };
  const scale = phone ? Math.min(devicePixelRatio || 1, 1) * 0.6 : Math.min(devicePixelRatio || 1, 1.5) * 0.75;
  const fps = phone ? 24 : 30;
  const textBox = [0.2, 0.6, 0.25, 0.25];

  let width = 0;
  let height = 0;
  let time = T0;
  let raf = 0;
  let last = 0;
  let seen = true;
  let alive = true;
  let shown = false;

  const measure = () => {
    const box = host.getBoundingClientRect();
    width = Math.max(1, Math.round(box.width * scale));
    height = Math.max(1, Math.round(box.height * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    if (text) {
      const r = text.getBoundingClientRect();
      textBox[0] = (r.left + r.width / 2 - box.left) / box.width;
      textBox[1] = 1 - (r.top + r.height / 2 - box.top) / box.height;
      textBox[2] = (r.width / box.width) * 0.62;
      textBox[3] = (r.height / box.height) * 0.62;
    }
  };

  const draw = () => {
    gl.viewport(0, 0, width, height);
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.uniform2f(u.uRes, width, height);
    gl.uniform1f(u.uTime, time);
    gl.uniform4f(u.uText, textBox[0], textBox[1], textBox[2], textBox[3]);
    for (const [name, rgb] of Object.entries(colours)) gl.uniform3f(u[name], rgb[0], rgb[1], rgb[2]);
    gl.uniform1f(u.uTall, height > width * 1.1 ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!shown) {
      shown = true;
      // the poster under it looks the same: the canvas fades in over it (opacity only)
      requestAnimationFrame(() => canvas.classList.add('is-on'));
    }
  };

  const frame = (now) => {
    raf = 0;
    if (!alive || !seen || document.hidden) return;
    if (last && now - last < 1000 / fps - 2) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    time += dt;
    draw();
    raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (still || raf || !alive || !seen || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  };

  host.appendChild(canvas);
  measure();
  draw();

  const ro = new ResizeObserver(() => {
    measure();
    if (still || !raf) draw();
  });
  ro.observe(host);
  const io = new IntersectionObserver(([entry]) => {
    seen = entry.isIntersecting;
    if (seen) wake();
  });
  io.observe(host);
  const onVisible = () => {
    if (!document.hidden) wake();
  };
  document.addEventListener('visibilitychange', onVisible);

  const stop = () => {
    alive = false;
    cancelAnimationFrame(raf);
    raf = 0;
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisible);
    canvas.remove();
  };
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
  });
  wake();
  return stop;
}
