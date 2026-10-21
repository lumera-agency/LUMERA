"use client";
/*
 * The soap bubble over the first screen (the owner, 21 Oct 2026: Framer's free «Bubblicious», set for this page, in the
 * look of a soap bubble's photo; «почему не поверх нашего 3д?»: a layer of its own over the whole first screen, the
 * droplet, the words and the corners under it).
 * On a computer it is the pointer: it follows it closely and the cursor hides while it shows over the first screen
 * («убери курсор»); over a link or a button it swells a little (where a cursor would turn to a hand). On a phone it
 * floats by itself on two slow curves (a finger never moves like a mouse), a little smaller, and a tap on it pops it
 * («по нажатию он лопает»), as a soap film does in slow motion: a hole opens where it was touched and grows at a
 * steady pace (the rim retracts at the Taylor–Culick speed; slowed from a millisecond to about a seventh of a second
 * to be seen), the film gathers into a bright ragged rim (it breaks into fingers), and the fingers fling fine droplets
 * that fly on, fall and fade: clear water, faint glints, never white dots («капли слишком белые»). Once popped it is
 * gone till the page loads again («один раз разбил он не должен появляться»).
 * A short chain of drops melted into one (a smooth union of their circles), so it stretches as it moves and rounds up
 * at rest, its rim breathing a little. A soap film (soap-film.ts) over a faint veil: what lies under it shows as it is.
 * Toned to the page: the film's bands in black and white, its greenish ones in «САЙТОВ.»'s colour (ember). Drawn only
 * round the bubble, only while the first screen shows; not with reduced motion.
 */
import { useEffect, useRef } from "react";
import { watchCover } from "./hero-cover";
import { SOAP_FILM } from "./soap-film";

const DROPS = 5;
/** The bubble's radius at rest (css px); a phone's at most this share of the screen's width. */
const RADIUS = 42;
const PHONE_SHARE = 0.075;
/** How fast the head catches its aim (a computer: the pointer, closely; a phone: its way), and each next drop the one before it (per second). */
const FOLLOW = { pointer: 26, way: 14 };
const CHAIN = 28;
/** Over a link or a button the bubble swells by this much. */
const HOT = 1.25;
/** A phone: seconds after it mounts until the bubble forms (the words' entrance first). */
const FLY_AFTER = 1.6;
/** The pop: seconds the hole takes to cross the bubble, how long the droplets fly, how many; a tap this far from the bubble's centre (radii) still pops it. */
const TEAR = 0.14;
const SPRAY = 0.8;
const DROPLETS = 30;
const REACH = 1.6;

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// gl_FragCoord: device px, y up
const FRAG = `#version 300 es
precision highp float;
uniform float uTime, uMelt, uAa;
uniform vec3 uDrops[${DROPS}];
uniform vec3 uAccent;
uniform vec2 uPopAt;
uniform float uPopT, uRimSpeed, uFall;
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
float rnd(float n) { return fract(sin(n * 12.9898 + 4.1) * 43758.5453); }

void main() {
  vec2 p = gl_FragCoord.xy;
  float r = uDrops[0].z;
  float t = uPopT;
  vec4 outc = vec4(0.0);
  float cover = r > 0.5 ? 1.0 - smoothstep(-uAa, uAa, blob(p)) : 0.0;
  if (cover > 0.0) {
    float e = uAa;
    vec2 g = vec2(dome(p + vec2(e, 0.0), r) - dome(p - vec2(e, 0.0), r), dome(p + vec2(0.0, e), r) - dome(p - vec2(0.0, e), r)) / (2.0 * e);
    vec3 n = normalize(vec3(-g, 1.0));
    // the film's swirls drift and turn
    vec2 q = n.xy * 1.7;
    q += 0.4 * vec2(sin(q.y * 1.7 + uTime * 0.37), cos(q.x * 1.5 - uTime * 0.31));
    vec4 skin = soapFilm(n, fbm(q + vec2(0.0, uTime * 0.09)), uAccent);
    // over a faint dark veil, so it reads over the black (premultiplied)
    outc = vec4(skin.rgb, skin.a + 0.14 * (1.0 - skin.a)) * cover;
    if (t >= 0.0) {
      // the pop: the film only beyond the hole's ragged rim; the rim a bright thread (the film gathered into it)
      vec2 rel = p - uPopAt;
      float dp = length(rel);
      float ang = atan(rel.y, rel.x);
      float edge = t * uRimSpeed + (noise(vec2(ang * 5.0, 3.1)) - 0.5) * 0.2 * r + pow(noise(vec2(ang * 14.0, 7.7)), 3.0) * 0.1 * r;
      float keep = smoothstep(edge - uAa, edge + uAa, dp);
      float rim = exp(-pow((dp - edge - 0.025 * r) / (0.03 * r), 2.0)) * cover;
      outc = outc * keep + vec4(vec3(0.92), 0.92) * rim * (1.0 - smoothstep(0.6, 1.0, t / ${TEAR.toFixed(2)})) * (1.0 - outc.a * keep);
    }
  }
  if (t >= 0.0) {
    // the droplets the rim's fingers fling: each leaves where the rim passes it, flies on along its way, falls, fades
    vec2 pc = uPopAt - uDrops[0].xy;
    for (int i = 0; i < ${DROPLETS}; i++) {
      float fi = float(i);
      float a = 6.2832 * (fi + rnd(fi)) / ${DROPLETS.toFixed(1)};
      vec2 dir = vec2(cos(a), sin(a));
      float b = dot(pc, dir);
      float reach = -b + sqrt(max(b * b - (dot(pc, pc) - r * r), 0.0));
      float d = reach * (0.3 + 0.7 * rnd(fi * 1.7 + 0.3));
      float age = t - d / uRimSpeed;
      if (age < 0.0 || age > ${SPRAY.toFixed(2)}) continue;
      vec2 v = (dir * (0.25 + 0.45 * rnd(fi * 2.3)) + vec2(-dir.y, dir.x) * (rnd(fi * 3.7) - 0.5) * 0.3) * uRimSpeed * 0.55;
      vec2 pos = uPopAt + dir * d + v * age * (1.0 - 0.6 * age) - vec2(0.0, 0.5 * uFall * age * age);
      float size = (0.6 + 0.9 * rnd(fi * 5.1)) * uAa;
      float dot0 = (1.0 - smoothstep(size * 0.4, size, length(p - pos))) * (1.0 - smoothstep(0.3, ${SPRAY.toFixed(2)}, age));
      // clear water: a faint grey glint, now and then a touch of the accent, a few a little brighter
      float glint = 0.22 + 0.2 * rnd(fi * 7.3) + 0.25 * step(0.88, rnd(fi * 9.1));
      vec3 tint = mix(vec3(1.0), uAccent, 0.35 * step(0.7, rnd(fi * 11.3)));
      outc += vec4(tint * glint, glint) * dot0 * (1.0 - outc.a);
    }
  }
  outColor = outc;
}`;

export function SitesBubble() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const section = canvas?.parentElement;
    if (!canvas || !section || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    const u = (name: string) => gl.getUniformLocation(program, name);
    const U = { time: u("uTime"), melt: u("uMelt"), aa: u("uAa"), drops: u("uDrops"), accent: u("uAccent"), popAt: u("uPopAt"), popT: u("uPopT"), rimSpeed: u("uRimSpeed"), fall: u("uFall") };

    // a computer: the bubble is the pointer; a phone: it floats, a tap pops it
    const hovers = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let dpr = 1;
    let radius = RADIUS;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      radius = hovers ? RADIUS : Math.min(RADIUS, canvas.clientWidth * PHONE_SHARE);
    };
    size();
    // the accent: «САЙТОВ.»'s colour on the page (sites-hero.css)
    const tone = section.querySelector(".st-h1__s > .tone");
    const rgb = tone ? getComputedStyle(tone).color.match(/[\d.]+/g)?.map(Number) : null;
    const accent = rgb && rgb.length >= 3 ? rgb.slice(0, 3).map((c) => c / 255) : [0.824, 0.337, 0.11];

    // the chain (css px, the canvas' own), where it aims, whether it shows, how much it swells
    const drops = Array.from({ length: DROPS }, () => ({ x: 0, y: 0 }));
    const data = new Float32Array(DROPS * 3);
    const target = { x: 0, y: 0 };
    let presence = 0;
    let want = 0;
    let hot = 0;
    let swell = 1;
    let onScreen = true;
    let covered = false;
    let focused = document.hasFocus();
    let clock = 0;
    let raf = 0;
    let last = 0;
    // the pop: since when (the clock), where (css px); once over, the bubble is gone for good
    let popAt = -1;
    const pop = { x: 0, y: 0 };
    let popped = false;

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
      const r = radius * swell;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      drops.forEach((d, i) => {
        const x = d.x * dpr;
        const y = (h - d.y) * dpr;
        data.set([x, y, r * dpr * presence * (1 - (0.45 * i) / (DROPS - 1))], i * 3);
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      });
      // (a pop's droplets fly and fall well past the bubble)
      const pad = (popAt >= 0 ? r * 2.4 + 200 : r * 1.2 + 8) * dpr;
      const sx = Math.max(0, Math.floor(x0 - pad));
      const sy = Math.max(0, Math.floor(y0 - pad));
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(sx, sy, Math.max(0, Math.ceil(x1 + pad) - sx), Math.max(0, Math.ceil(y1 + pad) - sy));
      gl.uniform1f(U.time, clock);
      gl.uniform3fv(U.drops, data);
      gl.uniform1f(U.melt, r * 0.9 * dpr);
      gl.uniform1f(U.aa, dpr);
      gl.uniform3f(U.accent, accent[0], accent[1], accent[2]);
      gl.uniform2f(U.popAt, pop.x * dpr, (h - pop.y) * dpr);
      gl.uniform1f(U.popT, popAt >= 0 ? clock - popAt : -1);
      // the hole crosses the bubble (about two radii) in TEAR seconds; the droplets fall at 500 px/s²
      gl.uniform1f(U.rimSpeed, (2.4 * r * dpr) / TEAR);
      gl.uniform1f(U.fall, 500 * dpr);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      clock += dt;
      if (!hovers) {
        fly(clock);
        if (popAt >= 0 && clock - popAt > SPRAY) {
          // the pop is over: nothing more to draw, ever
          popped = true;
          clear();
          raf = 0;
          last = 0;
          return;
        }
        want = popAt < 0 && clock > FLY_AFTER ? 1 : 0;
        if (presence < 0.02 && popAt < 0) for (const d of drops) { d.x = target.x; d.y = target.y; }
      }
      // (a popping bubble stays where it burst)
      if (popAt < 0) {
        const follow = 1 - Math.exp(-dt * (hovers ? FOLLOW.pointer : FOLLOW.way));
        drops[0].x += (target.x - drops[0].x) * follow;
        drops[0].y += (target.y - drops[0].y) * follow;
        const chain = 1 - Math.exp(-dt * CHAIN);
        for (let i = 1; i < DROPS; i++) {
          drops[i].x += (drops[i - 1].x - drops[i].x) * chain;
          drops[i].y += (drops[i - 1].y - drops[i].y) * chain;
        }
        presence += (want - presence) * (1 - Math.exp(-dt * 9));
      }
      swell += ((hot ? HOT : 1) - swell) * (1 - Math.exp(-dt * 12));
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
      const go = !popped && onScreen && !covered && !document.hidden && (!hovers || want > 0 || presence > 0);
      if (go && !raf) raf = requestAnimationFrame(frame);
      if (!go && raf) { cancelAnimationFrame(raf); raf = 0; last = 0; }
    };

    // a computer: the pointer, while it is over the first screen itself (not the topbar or a menu over it), nothing
    // covers it and the window has focus; the cursor hides meanwhile
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
      section.classList.toggle("is-bubble", show);
      run();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const over = e.target instanceof Element && section.contains(e.target) ? e.target : null;
      client.x = over ? e.clientX : -1;
      client.y = e.clientY;
      hot = over?.closest("a, button") ? 1 : 0;
      aim();
    };
    const onLeave = () => { client.x = -1; aim(); };
    const onFocus = () => { focused = document.hasFocus(); aim(); };
    // a phone: a tap on the bubble (or close to it) pops it where it was touched
    const onTap = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || popped || popAt >= 0 || presence < 0.6 || covered || !onScreen) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const dx = x - drops[0].x;
      const dy = y - drops[0].y;
      const dist = Math.hypot(dx, dy);
      if (dist > radius * REACH) return;
      // (a tap just off it bursts it at its edge, on that side)
      const k = dist > radius * 0.9 ? (radius * 0.9) / dist : 1;
      pop.x = drops[0].x + dx * k;
      pop.y = drops[0].y + dy * k;
      for (let i = 1; i < DROPS; i++) { drops[i].x = drops[0].x; drops[i].y = drops[0].y; }
      popAt = clock;
      run();
    };
    if (hovers) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("scroll", aim, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
      addEventListener("blur", onFocus);
      addEventListener("focus", onFocus);
    } else {
      addEventListener("pointerdown", onTap, { passive: true });
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
      removeEventListener("pointerdown", onTap);
      document.removeEventListener("visibilitychange", run);
      section.classList.remove("is-bubble");
    };
  }, []);
  return <canvas ref={ref} className="st-bubble" aria-hidden="true" />;
}
