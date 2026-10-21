"use client";
/*
 * The first screen's words as a liquid (the owner, 21 Oct 2026, of four trials after a Kling video: the liquid one,
 * «буквы были изначально такие чуть волнистые, верни также», and «сделай так чтоб только текст искажался когда мышку
 * водишь»). At rest two slow waves run through them, with a satin shade from their slope; where the pointer (a finger on
 * a phone) moves over them they flow along with it and settle back within a second and a half. They are drawn once into
 * a texture at the places the page set them (each word's box, face, size and spacing); a coarse field of displacement
 * follows the pointer (pushed along its moves, carried by itself, spread to its neighbours, fading), and the words are
 * drawn through it; «САЙТОВ.» in its colour on the page. Drawn while the first screen shows (every other frame while only
 * the slow waves move). The page's words stay in the DOM (the screen reader reads the H1's hidden sentence anyway); they
 * hide in the frame the canvas first shows the same letters, after their entrance. Without WebGL 2 or with reduced
 * motion nothing mounts. (The soap bubble over them is a layer of its own: SitesBubble.)
 */
import { useEffect, useRef } from "react";
import { watchCover } from "./hero-cover";

/** The field's reach either way (css px): it is kept in 8 bits a channel, 0.5 the rest. */
const RANGE = 48;
/** One field texel (css px). */
const CELL = 5;
/** Seconds after the last move until the field counts as settled. */
const SETTLE = 1.6;
/** What a move of 1 css px adds to the field under the pointer (css px), and at most a frame. */
const GAIN = 0.36;
const MAX_PUSH = 11;
/** The canvas' pixels at most (device px): a large Retina screen draws a little below its own density. */
const MAX_PIXELS = 9e6;

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// the field, a frame on: carried along by itself (a liquid swirls), spread a little, faded, pushed along the pointer's move
const FIELD = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uSize, uA, uB, uPush;
uniform float uRadius, uKeep;
out vec4 outColor;
const float RANGE = ${RANGE.toFixed(1)};
vec2 dec(vec2 uv) { return (texture(uField, uv).rg - 0.5) * 2.0 * RANGE; }
void main() {
  vec2 f = gl_FragCoord.xy;
  vec2 e = 1.0 / uSize;
  vec2 uv = f * e;
  vec2 back = uv - dec(uv) * (0.22 / ${CELL.toFixed(1)}) * e;
  vec2 d = dec(back) * 0.6 + 0.1 * (dec(back + vec2(e.x, 0.0)) + dec(back - vec2(e.x, 0.0)) + dec(back + vec2(0.0, e.y)) + dec(back - vec2(0.0, e.y)));
  vec2 ab = uB - uA;
  float t = clamp(dot(f - uA, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  float dist = length(f - uA - ab * t);
  d = d * uKeep + uPush * exp(-dist * dist / (uRadius * uRadius));
  outColor = vec4(clamp(d / (2.0 * RANGE) + 0.5, 0.0, 1.0), 0.0, 1.0);
}`;

// the words through the field (each pixel shows the letter from where the flow brought it; a liquid's sheen, brighter
// where the flow gathers, a little darker where it thins). p: canvas px from the top left.
// Red in the mask: the white words; green: «САЙТОВ.», in the accent
const DRAW = `#version 300 es
precision highp float;
uniform sampler2D uMask, uField;
uniform vec2 uRes, uSize;
uniform float uDpr, uOn, uTime;
uniform vec3 uAccent;
out vec4 outColor;
const float RANGE = ${RANGE.toFixed(1)};

vec2 dec(vec2 uv) { return (texture(uField, uv).rg - 0.5) * 2.0 * RANGE; }
vec4 words(vec2 p) {
  vec2 m = texture(uMask, p / uRes).rg;
  float a = clamp(m.r + m.g, 0.0, 1.0);
  return vec4(mix(vec3(1.0), uAccent, m.g / max(a, 0.001)) * a, a);
}
// the words as a liquid at rest: two slow waves through them, a satin shade from their slope
vec4 liquid(vec2 p) {
  vec2 v = p / uDpr;
  vec2 slope = vec2(sin(v.y * 0.045 + uTime * 1.3) + 0.6 * sin(v.y * 0.11 - v.x * 0.02 + uTime * 2.1),
                    sin(v.x * 0.032 - uTime * 1.05) + 0.6 * sin(v.x * 0.09 + v.y * 0.03 - uTime * 1.7));
  vec4 c = words(p + slope * 1.1 * uDpr);
  c.rgb *= 0.9 + 0.08 * dot(slope, vec2(-0.6, -0.8));
  return c;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 d = vec2(0.0);
  float shade = 1.0;
  if (uOn > 0.5) {
    d = dec(uv);
    d *= smoothstep(0.25, 0.75, length(d)); // (the field's last 8-bit steps: no blur at rest)
    vec2 e = 1.0 / uSize;
    float div = (dec(uv + vec2(e.x, 0.0)).x - dec(uv - vec2(e.x, 0.0)).x + dec(uv + vec2(0.0, e.y)).y - dec(uv - vec2(0.0, e.y)).y) / (2.0 * ${CELL.toFixed(1)});
    shade = 1.0 + clamp(-div * 0.35, -0.14, 0.18);
  }
  vec4 outc = liquid(p - vec2(d.x, -d.y) * uDpr);
  outc.rgb *= shade;

  outColor = outc;
}`;

function program(gl: WebGL2RenderingContext, frag: string) {
  const prog = gl.createProgram()!;
  for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, frag]] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
    gl.attachShader(prog, shader);
  }
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "program");
  const uniform = (name: string) => gl.getUniformLocation(prog, name);
  return { prog, uniform };
}

export function TitleFx() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) return;
    let field: ReturnType<typeof program>;
    let paint: ReturnType<typeof program>;
    try {
      field = program(gl, FIELD);
      paint = program(gl, DRAW);
    } catch {
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const texture = () => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    };
    const mask = texture();
    // the field: two textures, one read while the other is written
    const fields = [0, 1].map(() => ({ tex: texture(), fb: gl.createFramebuffer()! }));
    let front = 0;

    const paper = document.createElement("canvas");
    const ctx = paper.getContext("2d")!;
    let dpr = 1;
    // the accent: «САЙТОВ.»'s colour on the page (sites-hero.css)
    let accent = [0.824, 0.337, 0.11];
    let fw = 1;
    let fh = 1;
    let radius = 60;

    const clearField = () => {
      for (const f of fields) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, f.fb);
        gl.viewport(0, 0, fw, fh);
        gl.clearColor(0.5, 0.5, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    // the words into the texture, each at its box: red the white words, green «САЙТОВ.». The canvas takes the screen's
    // width and the words' height (and a margin for the flow)
    const draw = () => {
      const hr = host.getBoundingClientRect();
      const words = [...host.querySelectorAll<HTMLElement>(".st-h1__m > .tone")];
      if (!words.length) return;
      const boxes = words.map((el) => el.getBoundingClientRect());
      const pad = Math.ceil(parseFloat(getComputedStyle(words[0]).fontSize) * 0.5);
      const screen = (host.closest("section") ?? host).getBoundingClientRect();
      const left = Math.floor(screen.left);
      const right = Math.ceil(screen.right);
      const top = Math.floor(Math.max(screen.top, Math.min(...boxes.map((b) => b.top - pad))));
      const bottom = Math.ceil(Math.max(...boxes.map((b) => b.bottom + pad)));
      const width = right - left;
      const height = bottom - top;
      dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / (width * height)));
      Object.assign(canvas.style, { left: `${left - hr.left}px`, top: `${top - hr.top}px`, width: `${width}px`, height: `${height}px` });
      canvas.width = paper.width = Math.round(width * dpr);
      canvas.height = paper.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.textBaseline = "alphabetic";
      for (const el of words) {
        const cs = getComputedStyle(el);
        let text = (el.textContent ?? "").trim();
        if (cs.textTransform === "uppercase") text = text.toUpperCase();
        const after = getComputedStyle(el, "::after").content;
        if (after && after !== "none" && after !== "normal") text += after.replace(/^"|"$/g, "");
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
        // where the page set the first letter: an empty box on the word's baseline at its start
        const probe = document.createElement("i");
        probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        el.prepend(probe);
        const at = probe.getBoundingClientRect();
        probe.remove();
        ctx.fillStyle = el.closest(".st-h1__s") ? "rgb(0,255,0)" : "rgb(255,0,0)";
        ctx.fillText(text, at.left - left, at.top - top);
      }
      const tone = getComputedStyle(host.querySelector(".st-h1__s > .tone") ?? host).color.match(/[\d.]+/g)?.map(Number);
      if (tone && tone.length >= 3) accent = tone.slice(0, 3).map((c) => c / 255);
      // the pointer's reach in the words: about two thirds of the capitals of «ДИЗАЙН»
      radius = Math.min(140, Math.max(40, parseFloat(getComputedStyle(words[0]).fontSize) * 0.72 * 0.7));
      gl.bindTexture(gl.TEXTURE_2D, mask);
      // (premultiplied: a letter's soft edge is its coverage in red or green, not a full red with a low alpha)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8, gl.RG, gl.UNSIGNED_BYTE, paper);
      fw = Math.max(1, Math.round(width / CELL));
      fh = Math.max(1, Math.round(height / CELL));
      for (const f of fields) {
        gl.bindTexture(gl.TEXTURE_2D, f.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, f.fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, f.tex, 0);
      }
      clearField();
    };

    const render = (flow: boolean) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(paint.prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, mask);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, fields[front].tex);
      gl.uniform1i(paint.uniform("uMask"), 0);
      gl.uniform1i(paint.uniform("uField"), 1);
      gl.uniform2f(paint.uniform("uRes"), canvas.width, canvas.height);
      gl.uniform2f(paint.uniform("uSize"), fw, fh);
      gl.uniform1f(paint.uniform("uDpr"), dpr);
      gl.uniform1f(paint.uniform("uOn"), flow ? 1 : 0);
      gl.uniform1f(paint.uniform("uTime"), clock);
      gl.uniform3f(paint.uniform("uAccent"), accent[0], accent[1], accent[2]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // the pointer's moves since the last frame (css px, the canvas' own): where it went and how far
    const pointer = { x: 0, y: 0, on: false };
    const move = { ax: 0, ay: 0, bx: 0, by: 0, dx: 0, dy: 0, any: false };
    let live = false;
    let onScreen = true;
    let covered = false;
    let clock = 0;
    let lastInput = -1e9;
    let raf = 0;
    let last = 0;
    let stirred = false;
    let odd = false;

    const step = (dt: number) => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const tx = (x: number) => (x / w) * fw;
      const ty = (y: number) => (1 - y / h) * fh;
      let push = [0, 0];
      if (move.any) {
        push = [move.dx * GAIN, -move.dy * GAIN];
        const len = Math.hypot(push[0], push[1]);
        if (len > MAX_PUSH) push = [(push[0] / len) * MAX_PUSH, (push[1] / len) * MAX_PUSH];
      }
      const back = 1 - front;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fields[back].fb);
      gl.viewport(0, 0, fw, fh);
      gl.useProgram(field.prog);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, fields[front].tex);
      gl.uniform1i(field.uniform("uField"), 1);
      gl.uniform2f(field.uniform("uSize"), fw, fh);
      gl.uniform2f(field.uniform("uA"), tx(move.ax), ty(move.ay));
      gl.uniform2f(field.uniform("uB"), tx(move.bx), ty(move.by));
      gl.uniform2f(field.uniform("uPush"), push[0], push[1]);
      gl.uniform1f(field.uniform("uRadius"), radius / CELL);
      gl.uniform1f(field.uniform("uKeep"), Math.exp(-dt * 4));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      front = back;
      move.any = false;
      move.dx = move.dy = 0;
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      clock += dt;
      const flowing = clock - lastInput < SETTLE;
      if (flowing) {
        step(dt);
        stirred = true;
      } else if (stirred) {
        // settled: the field cleared (its last 8-bit steps never quite fade)
        clearField();
        stirred = false;
      }
      // (only the slow waves moving: every other frame shows them the same)
      odd = !odd;
      if (flowing || odd) render(flowing);
      raf = requestAnimationFrame(frame);
    };
    // drawn while the first screen shows: on screen, not covered by block 2, the tab open
    const run = () => {
      const go = live && onScreen && !covered && !document.hidden;
      if (go && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
    };

    // the words' flow under the pointer
    const at = (clientX: number, clientY: number) => {
      if (!live || !onScreen || covered) return;
      const r = canvas.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      const inside = x > -radius && y > -radius && x < r.width + radius && y < r.height + radius;
      if (inside && pointer.on && (x !== pointer.x || y !== pointer.y)) {
        if (!move.any) { move.ax = pointer.x; move.ay = pointer.y; }
        move.bx = x;
        move.by = y;
        move.dx += x - pointer.x;
        move.dy += y - pointer.y;
        move.any = true;
        lastInput = clock;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.on = inside;
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "touch") at(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (e.type === "touchstart") pointer.on = false;
      at(t.clientX, t.clientY);
    };
    const onLeave = () => { pointer.on = false; };
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("touchstart", onTouch, { passive: true });
    addEventListener("touchmove", onTouch, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    // the pointer counts only while the first screen shows: on screen, not covered by block 2 (it slides over the
    // pinned first screen)
    const stopCover = watchCover((c) => { covered = c; run(); });
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; run(); });
    document.addEventListener("visibilitychange", run);
    io.observe(host);
    let redraw = 0;
    const ro = new ResizeObserver(() => {
      if (!live || redraw) return;
      redraw = requestAnimationFrame(() => { redraw = 0; draw(); render(false); });
    });
    ro.observe(host);

    // after the words' entrance («САЙТОВ.» ends it), with the faces in: the plain letters, then the page's hide
    const lastWord = host.querySelector(".st-h1__s > .tone");
    const entranceLeft = lastWord?.getAnimations().reduce((left, a) => Math.max(left, Number(a.effect?.getComputedTiming().endTime ?? 0) - Number(a.currentTime ?? 0)), 0) ?? 0;
    let timer = 0;
    let gone = false;
    document.fonts.ready.then(() => {
      if (gone) return;
      timer = window.setTimeout(() => {
        draw();
        render(false);
        requestAnimationFrame(() => {
          if (gone) return;
          live = true;
          canvas.classList.add("is-live");
          host.classList.add("is-fx");
          run();
        });
      }, Math.max(0, entranceLeft) + 150);
    });

    return () => {
      gone = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(redraw);
      clearTimeout(timer);
      stopCover();
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", onPointer);
      removeEventListener("touchstart", onTouch);
      removeEventListener("touchmove", onTouch);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", run);
      host.classList.remove("is-fx");
    };
  }, []);
  return <canvas ref={ref} className="st-h1fx" aria-hidden="true" />;
}
