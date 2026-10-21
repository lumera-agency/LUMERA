"use client";
/*
 * The soap bubble over the first screen (the owner, 21 Oct 2026: Framer's free «Bubblicious», set for this page, in the
 * look of a soap bubble's photo; «почему не поверх нашего 3д?»: a layer of its own over the whole first screen, the
 * droplet, the words and the corners under it). On a computer it follows the pointer; on a phone it floats by itself
 * on two slow curves over the first screen (a finger never moves like a mouse: «на мобилке шарик просто летает сам»).
 * A short chain of drops melted into one (a smooth union of their circles), so it stretches as it moves and rounds up
 * at rest, its rim breathing a little. A soap film (soap-film.ts) over a faint veil: what lies under it shows as it is.
 * Toned to the page: the film's bands in black and white, its greenish ones in «САЙТОВ.»'s colour (ember). Drawn only
 * round the bubble, only while the first screen shows; not with reduced motion.
 */
import { useEffect, useRef } from "react";
import { watchCover } from "./hero-cover";
import { SOAP_FILM } from "./soap-film";

const DROPS = 5;
/** The bubble's radius at rest (css px); a phone's at most a tenth of the screen's width. */
const RADIUS = 42;
/** How fast the head catches its aim, and each next drop the one before it (per second). */
const FOLLOW = 14;
const CHAIN = 28;
/** A phone: seconds after it mounts until the bubble forms (the words' entrance first). */
const FLY_AFTER = 1.6;

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// gl_FragCoord: device px, y up
const FRAG = `#version 300 es
precision highp float;
uniform float uTime, uMelt, uAa;
uniform vec3 uDrops[${DROPS}];
uniform vec3 uAccent;
out vec4 outColor;
${SOAP_FILM}
float smin(float a, float b, float k) { float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
// the outline: the head breathes (two slow waves round its rim), the rest of the chain melts into it
float blob(vec2 p) {
  vec2 q = p - uDrops[0].xy;
  float a = atan(q.y, q.x);
  float d = length(q) - uDrops[0].z * (1.0 + 0.016 * sin(2.0 * a + uTime * 1.3) + 0.011 * sin(3.0 * a - uTime * 1.7));
  for (int i = 1; i < ${DROPS}; i++) d = smin(d, length(p - uDrops[i].xy) - uDrops[i].z, uMelt);
  return d;
}
float dome(vec2 p, float r) { float t = clamp(-blob(p), 0.0, r); return sqrt(t * (2.0 * r - t)); }
void main() {
  vec2 p = gl_FragCoord.xy;
  float r = uDrops[0].z;
  float cover = r > 0.5 ? 1.0 - smoothstep(-uAa, uAa, blob(p)) : 0.0;
  if (cover <= 0.0) { outColor = vec4(0.0); return; }
  float e = uAa;
  vec2 g = vec2(dome(p + vec2(e, 0.0), r) - dome(p - vec2(e, 0.0), r), dome(p + vec2(0.0, e), r) - dome(p - vec2(0.0, e), r)) / (2.0 * e);
  vec3 n = normalize(vec3(-g, 1.0));
  // the film's swirls drift and turn
  vec2 q = n.xy * 1.7;
  q += 0.4 * vec2(sin(q.y * 1.7 + uTime * 0.37), cos(q.x * 1.5 - uTime * 0.31));
  vec4 skin = soapFilm(n, fbm(q + vec2(0.0, uTime * 0.09)), uAccent);
  // over a faint dark veil, so it reads over the black (premultiplied)
  outColor = vec4(skin.rgb, skin.a + 0.14 * (1.0 - skin.a)) * cover;
}`;

export function SitesBubble() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) return;
    const program = gl.createProgram()!;
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return;
      gl.attachShader(program, shader);
    }
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = {
      time: gl.getUniformLocation(program, "uTime"),
      melt: gl.getUniformLocation(program, "uMelt"),
      aa: gl.getUniformLocation(program, "uAa"),
      drops: gl.getUniformLocation(program, "uDrops"),
      accent: gl.getUniformLocation(program, "uAccent"),
    };

    // a computer follows the pointer; a phone floats
    const hovers = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let dpr = 1;
    let radius = RADIUS;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      radius = hovers ? RADIUS : Math.min(RADIUS, canvas.clientWidth * 0.1);
    };
    size();
    // the accent: «САЙТОВ.»'s colour on the page (sites-hero.css)
    const tone = canvas.parentElement?.querySelector(".st-h1__s > .tone");
    const rgb = tone ? getComputedStyle(tone).color.match(/[\d.]+/g)?.map(Number) : null;
    const accent = rgb && rgb.length >= 3 ? rgb.slice(0, 3).map((c) => c / 255) : [0.824, 0.337, 0.11];

    // the chain (css px, the canvas' own), where it aims, whether it shows
    const drops = Array.from({ length: DROPS }, () => ({ x: 0, y: 0 }));
    const data = new Float32Array(DROPS * 3);
    const target = { x: 0, y: 0 };
    let presence = 0;
    let want = 0;
    let onScreen = true;
    let covered = false;
    let focused = document.hasFocus();
    let clock = 0;
    let raf = 0;
    let last = 0;

    // a phone's way: two slow curves over the first screen, about 60 px a second
    const fly = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const hx = Math.max(0, w / 2 - radius * 1.4);
      const hy = Math.max(0, h / 2 - radius * 1.4);
      const s = t * 0.7 * Math.max(1, 300 / (hx || 300));
      target.x = w / 2 + hx * (0.62 * Math.sin(s * 0.21 + 1.3) + 0.38 * Math.sin(s * 0.43 + 4.1));
      target.y = h / 2 + hy * (0.6 * Math.sin(s * 0.26 + 0.4) + 0.4 * Math.sin(s * 0.57 + 2.2));
    };

    const clear = () => {
      gl.disable(gl.SCISSOR_TEST);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
    const render = () => {
      clear();
      const h = canvas.height / dpr;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      drops.forEach((d, i) => {
        const x = d.x * dpr;
        const y = (h - d.y) * dpr;
        data.set([x, y, radius * dpr * presence * (1 - (0.45 * i) / (DROPS - 1))], i * 3);
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      });
      const pad = (radius * 1.2 + 8) * dpr;
      const sx = Math.max(0, Math.floor(x0 - pad));
      const sy = Math.max(0, Math.floor(y0 - pad));
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(sx, sy, Math.max(0, Math.ceil(x1 + pad) - sx), Math.max(0, Math.ceil(y1 + pad) - sy));
      gl.uniform1f(U.time, clock);
      gl.uniform3fv(U.drops, data);
      gl.uniform1f(U.melt, radius * 0.9 * dpr);
      gl.uniform1f(U.aa, dpr);
      gl.uniform3f(U.accent, accent[0], accent[1], accent[2]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      clock += dt;
      if (!hovers) {
        fly(clock);
        want = clock > FLY_AFTER ? 1 : 0;
        // (it forms where its way is)
        if (presence < 0.02) for (const d of drops) { d.x = target.x; d.y = target.y; }
      }
      const follow = 1 - Math.exp(-dt * FOLLOW);
      drops[0].x += (target.x - drops[0].x) * follow;
      drops[0].y += (target.y - drops[0].y) * follow;
      const chain = 1 - Math.exp(-dt * CHAIN);
      for (let i = 1; i < DROPS; i++) {
        drops[i].x += (drops[i - 1].x - drops[i].x) * chain;
        drops[i].y += (drops[i - 1].y - drops[i].y) * chain;
      }
      presence += (want - presence) * (1 - Math.exp(-dt * 9));
      if (hovers && !want && presence < 0.004) {
        presence = 0;
        clear();
        raf = 0;
        last = 0;
        return;
      }
      render();
      raf = requestAnimationFrame(frame);
    };
    // frames while the first screen shows; on a computer only while the bubble does
    const run = () => {
      const go = onScreen && !covered && !document.hidden && (!hovers || want > 0 || presence > 0);
      if (go && !raf) raf = requestAnimationFrame(frame);
      if (!go && raf) { cancelAnimationFrame(raf); raf = 0; last = 0; }
    };

    // a computer: the pointer, while it is over the first screen, nothing covers it and the window has focus
    const client = { x: -1, y: -1 };
    const aim = () => {
      if (!hovers) return run();
      const r = canvas.getBoundingClientRect();
      const x = client.x - r.left;
      const y = client.y - r.top;
      const show = focused && onScreen && !covered && client.x >= 0 && x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (show) {
        // (it forms at the pointer)
        if (presence < 0.02) for (const d of drops) { d.x = x; d.y = y; }
        target.x = x;
        target.y = y;
      }
      want = show ? 1 : 0;
      run();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      client.x = e.clientX;
      client.y = e.clientY;
      aim();
    };
    const onLeave = () => { client.x = -1; aim(); };
    const onFocus = () => { focused = document.hasFocus(); aim(); };
    if (hovers) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("scroll", aim, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
      addEventListener("blur", onFocus);
      addEventListener("focus", onFocus);
    }
    const stopCover = watchCover((c) => { covered = c; aim(); });
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; aim(); });
    io.observe(canvas);
    document.addEventListener("visibilitychange", run);
    const ro = new ResizeObserver(() => { size(); if (presence > 0) render(); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      stopCover();
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", aim);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      removeEventListener("blur", onFocus);
      removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", run);
    };
  }, []);
  return <canvas ref={ref} className="st-bubble" aria-hidden="true" />;
}
