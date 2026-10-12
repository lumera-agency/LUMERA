/**
 * The configurator's «3D-обʼєкт»: a live crystal cube, ray-traced analytically in one WebGL2 fragment
 * shader (a real-time port of the art director's tracer, scratchpad/art/configurator/tools/crystal.html).
 * No dependencies. Loaded with import() by preview.js only after an intent toward the 3D row.
 *
 * The cube is a convex polyhedron (6 faces + 12 chamfers + 8 corner facets; the 26 planes are computed
 * here once and passed as uniforms). A ray enters at the max of the entering planes and leaves at the min
 * of the exiting ones; exact dielectric Fresnel, refraction and total internal reflection inside.
 *   high tier: 4 bounces, three IORs (dispersion), backing × min(DPR, 1.5), up to 60 fps;
 *   medium tier (touch devices, or after a slow self-check): 3 bounces, one IOR, × min(DPR, 1.25), 30 fps.
 * The canvas is transparent: missed pixels are alpha 0, the silhouette is anti-aliased from the ray's
 * path length through the hull, and the body is composited so that wherever the glass just shows the
 * room, the page shows through (no box on any skin).
 *
 * createCube(host, { theme, bg, poster, reducedMotion, saveData, pointerArea, visibilityRoot, tier, onState })
 *   → { ready, arrive(from), leave(), start(), stop(), set({ theme, bg, poster }), move(host), release(), destroy(),
 *       state, tier, canvas, debug }
 * Never throws: anything that fails leaves the poster.
 */
const TAU = Math.PI * 2;
const FOV = 25 * Math.PI / 180, TH = Math.tan(FOV / 2);
const R = Math.sqrt(3); // the hull's bounding sphere (a corner of the unit cube)
// the camera distance at which the key pose is 0.60 of the square tall; then the silhouette over the whole
// turn, the sway and a ±12° tilt stays inside a circle of 0.92 of the square (measured: debug.silhouette)
const DIST = 11.64;
const PHASE = 0.625 * TAU / 4; // the poster's angle in the turn (0.98 rad)
const TURN = TAU / 22; // one turn in 22 s
// the approved bevel is 0.011 at 560 px; at the preview's 180–510 px the chamfer (the edge line) would be
// under a pixel and break up while turning, so it is fixed at 0.02 (≥ 1.5 px at the smallest square), the
// same for the posters, so the still and the live cube match line for line
const IOR = 1.52, BEVEL = 0.02, CORNER = -0.02;
const ATTRS = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false };

/* ---------- rotations (column-major 3×3) ---------- */
// the approved key pose (the tracer's KEYS.R): the near corner's three edges read off the reference
const KEY = (() => {
  const n = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const sub = (u, v, k) => u.map((x, i) => x - k * v[i]);
  const a = n([-0.46, 0.497, -0.736]);
  let b = [0.848, -0.0245, -0.5295], c = [-0.204, -0.883, -0.4227];
  b = n(sub(b, a, dot(b, a)));
  c = n(sub(sub(c, a, dot(c, a)), b, dot(c, b)));
  return [...a, ...b, ...c];
})();
// the pose, written into one reused array (the frame loop allocates nothing)
const T1 = new Float32Array(9), T2 = new Float32Array(9), POSE = new Float32Array(9);
function mulInto(o, A, B) {
  for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = A[r] * B[c * 3] + A[3 + r] * B[c * 3 + 1] + A[6 + r] * B[c * 3 + 2];
  return o;
}
function pose(a, sway, yaw, pitch, out = POSE) {
  const x = sway + pitch, cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(yaw), sy = Math.sin(yaw), ca = Math.cos(a), sa = Math.sin(a);
  // Rx(x)·Ry(yaw), then ·KEY, then ·Rz(a)
  T1[0] = cy; T1[1] = sx * sy; T1[2] = -cx * sy; T1[3] = 0; T1[4] = cx; T1[5] = sx; T1[6] = sy; T1[7] = -sx * cy; T1[8] = cx * cy;
  mulInto(T2, T1, KEY);
  for (let r = 0; r < 3; r++) {
    const c0 = T2[r], c1 = T2[3 + r];
    out[r] = c0 * ca + c1 * sa;
    out[3 + r] = -c0 * sa + c1 * ca;
    out[6 + r] = T2[6 + r];
  }
  return out;
}

/* the 26 planes (normal, distance) for a chamfer of `bevel` × the edge length */
function planes(bevel) {
  const c = 2 - (bevel * 2) / Math.SQRT2, k = (3 * c) / 2 - CORNER;
  const P = [];
  for (let i = 0; i < 3; i++) for (const s of [1, -1]) { const v = [0, 0, 0]; v[i] = s; P.push(...v, 1); }
  for (const a of [1, -1]) for (const b of [1, -1]) {
    const h = Math.SQRT1_2;
    P.push(a * h, b * h, 0, c * h, a * h, 0, b * h, c * h, 0, a * h, b * h, c * h);
  }
  const q = 1 / Math.sqrt(3);
  for (const a of [1, -1]) for (const b of [1, -1]) for (const d of [1, -1]) P.push(a * q, b * q, d * q, k * q);
  return new Float32Array(P);
}

const PLANES = planes(BEVEL), NOJIT = [0, 0];
const VS = '#version 300 es\nvoid main(){vec2 p=vec2(gl_VertexID==1?3.:-1.,gl_VertexID==2?3.:-1.);gl_Position=vec4(p,0.,1.);}';
const FS = (high) => `#version 300 es
precision highp float;
#define BOUNCES ${high ? 4 : 3}
${high ? '#define DISP 0.01' : ''}
uniform vec4 uP[26];
uniform mat3 uM;
uniform vec2 uRes, uJit;
uniform float uDist, uK, uA, uR2;
uniform int uEnv;
uniform vec3 uBg, uBgS;
out vec4 o;
const float TH = ${TH.toFixed(6)}, IOR = ${IOR.toFixed(3)}, ABS = 0.08;
float box(vec3 d, vec3 c, vec3 up, vec2 hs, float w) {
  float z = dot(d, c);
  if (z <= 0.) return 0.;
  vec3 r = normalize(cross(c, up)), u = cross(r, c);
  vec2 e = hs - abs(vec2(dot(d, r), dot(d, u)) / z);
  return smoothstep(-w, w, min(e.x, e.y));
}
float band(float g, vec3 r) {
  float m = (g - 0.5 * (r.y + r.z)) / (0.5 * (r.z - r.y));
  return r.x * smoothstep(r.y - 0.7, r.y + 0.7, g) * (1. - smoothstep(r.z - 0.7, r.z + 0.7, g)) * (0.45 + 0.55 * (1. - m * m));
}
// dark skin: the approved loop's studio (rings behind the cube, a dim floor, a soft room gradient)
vec3 rings(vec3 d) {
  vec3 col = uBg + 0.02 * smoothstep(0.05, -0.7, d.y) * vec3(1., .97, .94);
  col += 0.045 * (0.6 * smoothstep(-0.3, 1., d.y) + 0.4 * smoothstep(0.2, -1., d.x)) * smoothstep(-0.9, 0.3, d.z) * vec3(1., .98, .95);
  float g = degrees(acos(clamp(-d.z, -1., 1.)));
  if (g > 39.) return col;
  float f = atan(-d.y, d.x);
  float s = 0.55 + 0.3 * cos(2. * f + 0.7) + 0.15 * cos(5. * f + 1.9);
  return col + s * (band(g, vec3(2.2, 20., 30.)) * vec3(1., .97, .92) + band(g, vec3(0.7, 30., 38.)) * vec3(1., .97, .93));
}
// light skin: the same studio inverted, in the page's own colour: the chamfers find a dark ring at every
// angle of the turn (thin dark edges), the faces look through to the room (clear glass); a darker floor
// and a soft top light give the panels their different greys
vec3 room(vec3 d) {
  vec3 col = uBg * (0.9 + 0.12 * smoothstep(-0.3, 1., d.y) + 0.06 * smoothstep(0.2, -1., d.x));
  col *= 1. - 0.42 * smoothstep(0.0, -0.75, d.y);
  float g = degrees(acos(clamp(-d.z, -1., 1.)));
  if (g < 39.) {
    float f = atan(-d.y, d.x);
    float s = 0.55 + 0.3 * cos(2. * f + 0.7) + 0.15 * cos(5. * f + 1.9);
    col *= 1. - clamp(s * (band(g, vec3(1.25, 20., 30.)) + band(g, vec3(0.5, 30., 38.))), 0., 0.92);
  }
  col *= 1. - 0.7 * box(d, normalize(vec3(-1., .15, .25)), vec3(0, 1, 0), vec2(.3, 1.4), .03);
  col += 1.6 * box(d, normalize(vec3(0., 1., .25)), vec3(0, 0, -1), vec2(.45, .25), .03);
  col += 1.4 * box(d, normalize(vec3(1., .15, .1)), vec3(0, 1, 0), vec2(.04, .9), .012);
  return col;
}
vec3 env(vec3 d) { return uEnv == 1 ? room(d) : rings(d); }
float fres(float ci, float ei, float et) {
  float st = ei / et * sqrt(max(0., 1. - ci * ci));
  if (st >= 1.) return 1.;
  float ct = sqrt(max(0., 1. - st * st));
  float rs = (et * ci - ei * ct) / (et * ci + ei * ct), rp = (ei * ci - et * ct) / (ei * ci + et * ct);
  return 0.5 * (rs * rs + rp * rp);
}
float leave(vec3 ro, vec3 rd, out int idx, out float gap) {
  float t1 = 1e9, t2 = 1e9; idx = 0;
  for (int i = 0; i < 26; i++) {
    float dn = dot(uP[i].xyz, rd);
    if (dn <= 1e-6) continue;
    float t = (uP[i].w - dot(uP[i].xyz, ro)) / dn;
    if (t < t1) { t2 = t1; t1 = t; idx = i; } else t2 = min(t2, t);
  }
  gap = t2 - t1;
  return t1;
}
vec3 trace(vec3 p, vec3 rd, vec3 n, float ior, inout float gap) {
  float F = fres(-dot(rd, n), 1., ior);
  vec3 col = F * env(uM * reflect(rd, n));
  vec3 d = refract(rd, n, 1. / ior);
  float thr = 1. - F;
  for (int b = 0; b < BOUNCES; b++) {
    int k; float gp;
    float t = leave(p + d * 1e-4, d, k, gp);
    if (b == 0) gap = gp; // the back edge this pixel looks at through the glass
    p += d * (t + 1e-4);
    thr *= exp(-ABS * t);
    vec3 m = uP[k].xyz;
    float Fi = fres(dot(d, m), ior, 1.);
    if (Fi < 1.) col += thr * (1. - Fi) * env(uM * refract(d, -m, ior));
    thr *= Fi;
    d = reflect(d, -m);
    if (thr < 0.002) break;
  }
  return col;
}
vec3 srgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - 0.055, step(0.0031308, c)); }
vec4 shade(vec2 fc, out float edge) {
  edge = 1e9;
  vec2 uv = fc / uRes * 2. - 1.;
  vec3 rdW = normalize(vec3(uv * TH, -1.)), roW = vec3(0., 0., uDist);
  float b = dot(roW, rdW);
  if (b * b - (uDist * uDist - uR2) < 0.) return vec4(0.);
  mat3 Mi = transpose(uM);
  vec3 ro = Mi * roW, rd = Mi * rdW;
  float t0 = -1e9, tb = -1e9, t1 = 1e9; int idx = 0;
  for (int i = 0; i < 26; i++) {
    float dn = dot(uP[i].xyz, rd), t = (uP[i].w - dot(uP[i].xyz, ro)) / dn;
    if (dn < 0.) { if (t > t0) { tb = t0; t0 = t; idx = i; } else tb = max(tb, t); } else t1 = min(t1, t);
  }
  if (t0 > t1 || t1 < 0.) return vec4(0.);
  float px = t0 * 2. * TH / uRes.y;
  edge = (t0 - tb) / px; // how close (≈ px) the entry is to the next facet: the edges that need more samples
  // coverage from the chord through the hull: the silhouette fades over ~uK pixels, no stair steps
  float cov = clamp((t1 - t0) / (uK * px), 0., 1.);
  vec3 p = ro + rd * t0, n = uP[idx].xyz;
#ifdef DISP
  float gin = 1e9, gx = 0.;
  vec3 c = vec3(trace(p, rd, n, IOR - DISP, gx).r, trace(p, rd, n, IOR, gin).g, trace(p, rd, n, IOR + DISP, gx).b);
  edge = min(edge, gin / px);
  c = mix(vec3(dot(c, vec3(.2126, .7152, .0722))), c, 0.55);
#else
  float gin = 1e9;
  vec3 c = trace(p, rd, n, IOR, gin);
  edge = min(edge, gin / px);
#endif
  c = uEnv == 1 ? mix(c, 0.9 + 0.1 * (1. - exp(-(c - 0.9) * 10.)), step(0.9, c)) : 1. - exp(-c);
  vec3 s = clamp(srgb(max(c, 0.)), 0., 1.), g = uBgS;
  // where the glass just shows the room, the page itself shows through: the least alpha that reaches the
  // traced colour over a page of colour g (premultiplied, so the poster stores it exactly too)
  vec3 need = max(1. - s / max(g, 1e-3), (s - g) / max(1. - g, 1e-3));
  float a = clamp(max(uA, max(need.r, max(need.g, need.b))), 0., 1.);
  return vec4(max(s - (1. - a) * g, 0.), a) * cov;
}
void main() {
  vec2 f = gl_FragCoord.xy + uJit;
  float e, e2;
  o = shade(f, e);
  // the facet edges, seen directly or through the glass: more samples there only (a few % of the pixels)
  if (e < 3.) o = 0.25 * (shade(f + vec2(-.125, -.375), e2) + shade(f + vec2(.375, -.125), e2) + shade(f + vec2(.125, .375), e2) + shade(f + vec2(-.375, .125), e2));
}`;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const now = () => performance.now();
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 300 }) : setTimeout(fn, 16));

export function createCube(host, o = {}) {
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const auto = !o.tier || o.tier === 'auto';
  const still = o.reducedMotion || o.saveData || o.tier === 'poster';
  const st = {
    theme: o.theme || 'light', bg: o.bg || '#ebe8e1', poster: o.poster || {}, state: 'poster',
    tier: auto ? (touch ? 'medium' : 'high') : o.tier,
    run: false, shown: false, visible: true, near: true, live: false,
  };
  const ring = new Float32Array(120);
  const dbg = { rafCalls: 0, frames: 0, compileMs: null, selfCheck: [], tierLog: [], gl: null };
  let gl = null, prog = null, U = null, raf = 0, ro = null, io = null, farIO = null, relT = 0, floatT = 0;
  let canvas = host.querySelector('canvas.pv-obj__gl');
  let resolveReady;
  const ready = new Promise((r) => { resolveReady = r; });
  const posterEl = () => host.querySelector('.pv-obj__poster');
  const setState = (s) => {
    if (st.state === s) return;
    st.state = s;
    host.dataset.cube = s;
    try { o.onState?.(s); } catch (e) { /* the page's callback never breaks the cube */ }
  };
  const fail = (s = 'fallback') => {
    stop();
    setState(s);
    resolveReady('fallback');
    host.classList.add('is-float');
  };

  /* motion state */
  const m = { a: PHASE, T: 0, k: 0, kFrom: 0, kAt: 0, kDur: 1200, yaw: 0, pitch: 0, ty: 0, tp: 0, out: true, vel: 0, drag: null, lastTouch: -1e9, scrollAt: -1e9, last: 0, lastDraw: 0, n: 0, sum: 0, presented: 0 };

  /* ---------- GL ---------- */
  function newCanvas() {
    const c = document.createElement('canvas');
    c.className = 'pv-obj__gl';
    c.setAttribute('aria-hidden', 'true');
    if (canvas) canvas.replaceWith(c); else host.append(c);
    canvas = c;
    bindInput();
    return c;
  }
  function size() {
    if (!gl) return;
    const css = host.getBoundingClientRect().width || 1;
    const cap = st.tier === 'high' ? 1.5 : 1.25;
    const px = Math.max(16, Math.min(512, Math.round(css * Math.min(devicePixelRatio || 1, cap))));
    if (canvas.width !== px) { canvas.width = canvas.height = px; if (!raf) draw(); }
  }
  function setTheme() {
    if (!prog) return;
    const s = hex(st.bg);
    gl.useProgram(prog);
    gl.uniform1i(U.uEnv, st.theme === 'light' ? 1 : 0);
    gl.uniform3fv(U.uBgS, s);
    gl.uniform3fv(U.uBg, s.map(lin));
    gl.uniform1f(U.uA, st.theme === 'light' ? 0.32 : 0.3);
  }
  function compile(high) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS(high)]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    return p;
  }
  function useProgram(p) {
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('cube-gl: shader failed', gl.getProgramInfoLog(p));
      return false;
    }
    if (prog && prog !== p) gl.deleteProgram(prog);
    prog = p;
    U = {};
    for (const n of ['uP', 'uM', 'uRes', 'uJit', 'uDist', 'uK', 'uA', 'uR2', 'uEnv', 'uBg', 'uBgS']) U[n] = gl.getUniformLocation(p, n);
    gl.useProgram(p);
    gl.uniform1f(U.uDist, DIST);
    gl.uniform1f(U.uR2, R * R * 1.0001);
    gl.uniform1f(U.uK, 1.5);
    gl.uniform2f(U.uJit, 0, 0);
    gl.uniform4fv(U.uP, PLANES);
    setTheme();
    return true;
  }
  // build the program for the current tier without blocking: KHR_parallel_shader_compile is polled once a frame
  function build(done) {
    const t0 = now();
    const ext = gl.getExtension('KHR_parallel_shader_compile');
    const p = compile(st.tier === 'high');
    const check = () => {
      if (!gl || gl.isContextLost()) return;
      if (ext && !gl.getProgramParameter(p, ext.COMPLETION_STATUS_KHR)) {
        if (now() - t0 > 2000) { fail(); return; }
        requestAnimationFrame(check);
        return;
      }
      const ok = useProgram(p);
      dbg.compileMs = Math.round(now() - t0);
      dbg.tierLog.push([st.tier, dbg.compileMs]);
      if (!ok || dbg.compileMs > 2000) { fail(); return; }
      done();
    };
    ext ? requestAnimationFrame(check) : check();
  }
  function init() {
    if (gl || !st.shown || !st.near || st.state === 'fallback' || st.state === 'lost' || still) return;
    try {
      if (!canvas || canvas.dataset.used) newCanvas();
      canvas.dataset.used = '1';
      gl = canvas.getContext('webgl2', ATTRS);
      if (!gl) { fail(); return; }
      dbg.gl = gl;
      canvas.addEventListener('webglcontextlost', onLost);
      gl.clearColor(0, 0, 0, 0);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      build(() => {
        size();
        m.presented = 0;
        draw();
        // the first frame is on screen two frames after the first draw: then the canvas can take over
        requestAnimationFrame(() => requestAnimationFrame(() => { m.presented = 1; reveal(); }));
      });
    } catch (e) {
      console.warn('cube-gl:', e);
      fail();
    }
  }
  function onLost(e) {
    e.preventDefault();
    // our own release (loseContext) also arrives here, a moment later: nothing to do
    if (e.target.dataset.released) return;
    gl = null; prog = null;
    console.warn('cube-gl: context lost, showing the still');
    stop();
    showPoster();
    setState('lost');
    resolveReady('fallback');
  }

  /* ---------- drawing ---------- */
  function mat() {
    return pose(m.a, (4 * Math.PI / 180) * Math.sin((TAU * m.T) / 7) * m.k, m.yaw, m.pitch);
  }
  function draw(M = mat(), jit = NOJIT) {
    if (!gl || !prog || gl.isContextLost()) return false;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uJit, jit[0], jit[1]);
    gl.uniformMatrix3fv(U.uM, false, M);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }
  function step(t) {
    const dt = Math.min(0.1, (t - m.last) / 1000);
    m.last = t;
    if (!st.live) return;
    // the idle turn: eases in (from the poster's pose, or after a drag) and never snaps
    const kk = ease((t - m.kAt) / m.kDur);
    m.k = m.kFrom + (1 - m.kFrom) * kk;
    if (m.drag) m.k = 0;
    else if (Math.abs(m.vel) > 1e-4) { m.a += m.vel * dt; m.vel *= Math.exp(-dt / 0.3); }
    m.a += TURN * m.k * dt;
    m.T += dt * m.k;
    // the pointer tilt (hover devices): exponential, τ 120 ms toward the pointer, 500 ms back to rest
    const tau = m.out ? 0.5 : 0.12, f = 1 - Math.exp(-dt / tau);
    m.yaw += (m.ty - m.yaw) * f;
    m.pitch += (m.tp - m.pitch) * f;
  }
  function frame(t) {
    raf = 0;
    dbg.rafCalls++;
    if (!running()) return;
    raf = requestAnimationFrame(frame);
    const delta = t - (m.prev || t);
    m.prev = t;
    // the self-check: the mean rAF interval over frames 4–33 while live
    if (auto && st.live && m.n < 34) {
      m.n++;
      if (m.n >= 4) m.sum += delta;
      if (m.n === 33) selfCheck(m.sum / 30);
    }
    const scrolling = touch && t - m.scrollAt < 150;
    const minGap = scrolling ? 1000 / 15 : st.tier === 'high' && !touch ? 0 : 1000 / 30;
    if (t - m.lastDraw < minGap - 4) return;
    step(t);
    m.lastDraw = t;
    const t0 = now();
    if (draw()) ring[dbg.frames++ % 120] = now() - t0; // the CPU cost of a frame (ms)
  }
  function selfCheck(ms) {
    dbg.selfCheck.push([st.tier, Math.round(ms * 10) / 10]);
    if (st.tier === 'high' && ms > 24) {
      st.tier = 'medium';
      build(() => { size(); m.n = 0; m.sum = 0; });
    } else if (st.tier === 'medium' && ms > 40) {
      showPoster();
      fail();
      release();
    }
  }
  // the loop runs only while all of these hold; otherwise no rAF at all (the canvas keeps its last frame)
  const running = () => st.run && st.shown && st.live && st.visible && st.near && !document.hidden && !!gl && !!prog;
  function loop() {
    const go = running();
    if (go && !raf) { m.prev = 0; m.last = now(); raf = requestAnimationFrame(frame); }
    if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  /* ---------- the poster and the canvas taking over ---------- */
  function showPoster() {
    const p = posterEl();
    if (p) p.style.visibility = '';
    canvas?.getAnimations().forEach((a) => a.cancel());
    if (canvas) canvas.style.opacity = '0';
    st.live = false;
  }
  function reveal() {
    if (!st.shown || st.live || !m.presented || !gl || st.state === 'fallback') return;
    const p = posterEl();
    // the arrival (a script animation on the still; not its CSS float) at ≥ 80 %
    const a = p?.getAnimations().find((x) => x.playState === 'running' && !(window.CSSAnimation && x instanceof CSSAnimation));
    const prog_ = a ? a.effect.getComputedTiming().progress : 1;
    if (prog_ != null && prog_ < 0.8) { setTimeout(reveal, (0.8 - prog_) * 600 + 16); return; }
    clearTimeout(floatT);
    host.classList.remove('is-float');
    st.live = true;
    m.kAt = now(); m.kFrom = 0; m.kDur = 1200; m.n = 0; m.sum = 0;
    canvas.style.opacity = '1';
    canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'linear' }).onfinish = () => { if (st.live && p) p.style.visibility = 'hidden'; };
    setState('live');
    resolveReady('live');
    loop();
  }

  /* ---------- input: tilt (hover) and drag (touch) ---------- */
  const area = o.pointerArea;
  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
    const b = area.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((e.clientX - b.left) / b.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((e.clientY - b.top) / b.height) * 2 - 1));
    m.ty = (x * 12 * Math.PI) / 180;
    m.tp = (y * 12 * Math.PI) / 180;
    m.out = false;
  };
  const onLeave = () => { m.ty = 0; m.tp = 0; m.out = true; };
  if (area && !touch) {
    area.addEventListener('pointermove', onMove, { passive: true });
    area.addEventListener('pointerleave', onLeave, { passive: true });
  }
  const onScroll = () => { m.scrollAt = now(); };
  if (touch) addEventListener('scroll', onScroll, { passive: true, capture: true });
  let swallow = 0;
  function bindInput() {
    if (!touch || !canvas) return;
    canvas.addEventListener('pointerdown', (e) => {
      if (!st.live) return;
      m.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false, lx: e.clientX, lt: now() };
      m.lastTouch = now();
    }, { passive: true });
    canvas.addEventListener('pointermove', (e) => {
      const d = m.drag;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.on) {
        if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
        d.on = true;
        try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* the pointer may be gone */ }
      }
      const w = (area || host).getBoundingClientRect().width || 300;
      const t = now(), da = ((e.clientX - d.lx) * Math.PI) / w;
      m.a += da;
      m.vel = (da / Math.max(8, t - d.lt)) * 1000;
      d.lx = e.clientX; d.lt = t;
      m.lastTouch = t;
    }, { passive: true });
    const end = (e) => {
      const d = m.drag;
      if (!d || d.id !== e.pointerId) return;
      if (d.on) swallow = now();
      m.drag = null;
      m.lastTouch = now();
      m.kFrom = 0; m.kAt = now() + 1500; m.kDur = 800;
    };
    canvas.addEventListener('pointerup', end, { passive: true });
    canvas.addEventListener('pointercancel', (e) => { if (m.drag?.id === e.pointerId) { m.drag = null; m.kFrom = 0; m.kAt = now() + 1500; m.kDur = 800; } }, { passive: true });
    // a drag swallows the click that follows it (the 5–7-page sample doesn't switch pages under it)
    canvas.addEventListener('click', (e) => { if (now() - swallow < 400) { e.stopPropagation(); e.preventDefault(); } }, true);
  }
  bindInput();

  /* ---------- visibility: the slot ≥ 20 % inside the frame; #pricing within a viewport ---------- */
  function observe() {
    io?.disconnect();
    const root = o.visibilityRoot && o.visibilityRoot.contains(host) ? o.visibilityRoot : null;
    io = new IntersectionObserver((es) => { st.visible = es[es.length - 1].intersectionRatio >= 0.2; loop(); }, { root, threshold: [0, 0.2] });
    io.observe(host);
  }
  observe();
  const pricing = host.closest('#pricing') || host.closest('section');
  if (pricing) {
    farIO = new IntersectionObserver((es) => {
      st.near = es[es.length - 1].isIntersecting;
      if (!st.near) release();
      else if (st.shown && st.state !== 'fallback' && st.state !== 'lost') idle(init);
      loop();
    }, { rootMargin: '100% 0px' });
    farIO.observe(pricing);
  }
  const onVis = () => loop();
  document.addEventListener('visibilitychange', onVis);
  ro = new ResizeObserver(() => size());
  ro.observe(host);

  /* ---------- the API ---------- */
  function setPoster() {
    const p = posterEl(), u = st.poster[st.theme];
    if (p && u && p.getAttribute('src') !== u) p.src = u;
  }
  function arrive(from) {
    st.shown = true;
    clearTimeout(relT);
    const p = posterEl();
    setPoster();
    if (from && p) {
      p.style.visibility = '';
      p.style.transformOrigin = `50% ${(from.originY ?? 0.8) * 100}%`;
      p.animate([{ transform: `scale(${from.scale ?? 0.9})`, opacity: from.opacity ?? 0 }, { opacity: 1, offset: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    if (st.state === 'fallback' || st.state === 'lost' || still) {
      if (!o.reducedMotion) host.classList.add('is-float');
      resolveReady('fallback');
      return;
    }
    // the poster floats if the canvas is not up in 2.5 s; the canvas still takes over when it is
    clearTimeout(floatT);
    floatT = setTimeout(() => { if (!st.live) host.classList.add('is-float'); }, 2500);
    if (gl) { m.presented ? reveal() : 0; loop(); } else idle(init);
  }
  function stop() { st.run = false; loop(); }
  function start() {
    st.run = true;
    if (st.shown && !gl && st.near && st.state !== 'fallback' && st.state !== 'lost') idle(init);
    loop();
  }
  function leave() {
    st.shown = false;
    clearTimeout(floatT);
    host.classList.remove('is-float');
    loop();
    clearTimeout(relT);
    relT = setTimeout(release, 3000); // a quick toggle back costs nothing
    return new Promise((r) => setTimeout(() => {
      if (!st.shown) { showPoster(); if (st.state === 'live') setState('poster'); }
      r();
    }, 260));
  }
  function release() {
    clearTimeout(relT);
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (gl) {
      canvas.dataset.released = '1';
      try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (_) { /* already gone */ }
      gl = null; prog = null;
    }
    m.presented = 0;
    showPoster();
    if (st.state === 'live') setState('poster');
  }
  return {
    ready,
    arrive,
    leave,
    start,
    stop,
    set(s = {}) {
      if (s.theme) st.theme = s.theme;
      if (s.bg) st.bg = s.bg;
      if (s.poster) st.poster = s.poster;
      setPoster();
      setTheme();
      if (gl && prog && !raf) draw();
    },
    move(h) {
      if (!h || h === host) return;
      host = h;
      for (const el of [posterEl(), canvas]) if (el && el.parentNode !== h) h.append(el);
      observe();
      ro.disconnect(); ro.observe(h);
    },
    release,
    destroy() {
      release();
      io?.disconnect(); farIO?.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      removeEventListener('scroll', onScroll, true);
      area?.removeEventListener('pointermove', onMove);
      area?.removeEventListener('pointerleave', onLeave);
      canvas?.remove();
    },
    get state() { return st.state; },
    get tier() { return st.tier; },
    get canvas() { return canvas; },
    get running() { return !!raf; },
    debug: Object.defineProperties(dbg, Object.getOwnPropertyDescriptors({
      get running() { return !!raf; },
      /** the CPU ms of the last ≤ 120 frames */
      get frameMs() { const n = Math.min(dbg.frames, 120); return Array.from({ length: n }, (_, i) => Math.round(ring[(dbg.frames - n + i) % 120] * 1000) / 1000); },
      get flags() { return { run: st.run, shown: st.shown, visible: st.visible, near: st.near, live: st.live, presented: m.presented, hidden: document.hidden }; },
      get pose() { return { a: m.a, yaw: m.yaw, pitch: m.pitch, k: m.k }; },
      /** the silhouette's box from alpha, in CSS px (viewport), for a pose: { a, yaw, pitch } (radians) */
      silhouette(q = {}) {
        if (!gl || !prog) return null;
        draw(q.a == null ? mat() : pose(q.a, 0, q.yaw || 0, q.pitch || 0));
        const W = canvas.width, px = new Uint8Array(W * W * 4);
        gl.readPixels(0, 0, W, W, gl.RGBA, gl.UNSIGNED_BYTE, px);
        let x0 = W, x1 = -1, y0 = W, y1 = -1, corner = 0;
        for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
          const al = px[(y * W + x) * 4 + 3];
          if (al > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        for (const [x, y] of [[0, 0], [W - 1, 0], [0, W - 1], [W - 1, W - 1]]) corner = Math.max(corner, px[(y * W + x) * 4 + 3]);
        draw();
        if (x1 < 0) return { x: 0, y: 0, w: 0, h: 0, corner };
        const b = canvas.getBoundingClientRect(), k = b.width / W;
        return { x: b.left + x0 * k, y: b.top + (W - 1 - y1) * k, w: (x1 - x0 + 1) * k, h: (y1 - y0 + 1) * k, corner };
      },
      /** GPU time per frame (ms), drawing n frames with a finish each (QA) */
      bench(n = 30) {
        if (!gl) return null;
        const px = new Uint8Array(4), sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        draw(); sync();
        let t = now();
        for (let i = 0; i < n; i++) sync();
        const base = (now() - t) / n;
        t = now();
        for (let i = 0; i < n; i++) { draw(mat()); sync(); }
        const ms = (now() - t) / n - base;
        draw();
        return Math.round(ms * 100) / 100;
      },
      /** the canvas for a pose, as a PNG data URL (QA) */
      shot(q = {}) { draw(pose(q.a ?? PHASE, 0, q.yaw || 0, q.pitch || 0)); const u = canvas.toDataURL(); draw(); return u; },
      /** a still of the key pose at `px` with 16 stratified samples, as a WebP data URL (the posters) */
      poster(px = 320, q = 0.9) {
        if (!gl || !prog) return null;
        const keep = [canvas.width, canvas.height];
        canvas.width = canvas.height = px;
        const acc = new Float32Array(px * px * 4), buf = new Uint8Array(px * px * 4), M = pose(PHASE, 0, 0, 0);
        for (let i = 0; i < 16; i++) {
          draw(M, [((i % 4) + 0.5) / 4 - 0.5, (Math.floor(i / 4) + 0.5) / 4 - 0.5]);
          gl.readPixels(0, 0, px, px, gl.RGBA, gl.UNSIGNED_BYTE, buf);
          for (let j = 0; j < buf.length; j++) acc[j] += buf[j];
        }
        const c2 = document.createElement('canvas');
        c2.width = c2.height = px;
        const x = c2.getContext('2d'), img = x.createImageData(px, px);
        for (let y = 0; y < px; y++) for (let xx = 0; xx < px; xx++) {
          const s = ((px - 1 - y) * px + xx) * 4, d = (y * px + xx) * 4, a = acc[s + 3] / 16;
          for (let ch = 0; ch < 3; ch++) img.data[d + ch] = a > 0 ? Math.min(255, Math.round(((acc[s + ch] / 16) / a) * 255)) : 0;
          img.data[d + 3] = Math.round(a);
        }
        x.putImageData(img, 0, 0);
        [canvas.width, canvas.height] = keep;
        draw();
        return c2.toDataURL('image/webp', q);
      },
    })),
  };
}
