/*
 * «Анімація» · the sample hero's animated background: React Bits «Silk», ported to vanilla JS + raw
 * WebGL1 for the Lumera configurator preview (9 Oct 2026). Source:
 * https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/Silk/Silk.jsx
 *
 * The fragment shader is the original (the silk pattern, its grain and its light mode). What changed in
 * the port: no React, no three.js / react-three-fiber (a full-screen triangle and uniforms; vUv from the
 * triangle), the bottom of the hero fades into the page (one alpha term), DPR ≤ 1.5, ≤ 30 fps on touch
 * screens, start/stop driven by the preview's «live» rule, one still frame for reduced motion or
 * Save-Data, and the GL context released on destroy.
 *
 * ---------------------------------------------------------------------------------------------------------
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * ## Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**
 *
 * ## No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------------------------------------
 *
 * createSilk(host, { theme }) → { canvas, start(), stop(), frame(t), set({ theme }), move(host), destroy() }
 *   host: the hero the silk lies under (the canvas goes in as its first child, absolutely positioned);
 *   theme 'dark'  — ember-charcoal silk on the «Авторський» skin;
 *   theme 'light' — the component's light mode, warm sand, on the «Базовий» skin;
 *   theme 'day'   — the light mode in paper tones, on the studio's «Денне світло» Базовий.
 */

const hexToNormalizedRGB = (hex) => {
  hex = hex.replace('#', '');
  return [parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255];
};

/* the look per skin: the component's props (speed, scale, color, noiseIntensity, rotation, lightMode) */
const THEMES = {
  dark: { speed: 6.5, scale: 1.05, color: '#5c2912', noiseIntensity: 1.2, rotation: 0.42, lightMode: false },
  light: { speed: 5.5, scale: 1.0, color: '#e8dac4', noiseIntensity: 0.9, rotation: 0.42, lightMode: true },
  // the studio's «Денне світло»: paper silk, slower and quieter (shown at 0.55 over the daylight patches)
  day: { speed: 4.5, scale: 1.1, color: '#efe3d0', noiseIntensity: 0.7, rotation: 0.42, lightMode: true },
};

const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vPosition = vec3(position, 0.0);
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// (the original fragment shader; one line added at the end: the bottom of the hero fades into the page)
const fragmentShader = `
precision highp float;
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
uniform float uLightMode;
uniform float uFade;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  float grain = rnd / 15.0 * uNoiseIntensity;
  vec3 result = uColor * pattern - vec3(grain);
if (uLightMode > 0.5) {
  float fold = smoothstep(0.28, 0.9, pattern);
  float specular = smoothstep(0.72, 0.98, pattern);
  vec3 shadowColor = uColor * 0.72;
  vec3 bodyColor = min(uColor * 1.18, vec3(1.0));
  vec3 lightBase = mix(shadowColor, bodyColor, fold);
  lightBase = mix(lightBase, vec3(1.0), specular * 0.92);
  float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));
  float grainSignal = (rnd + fineNoise - 1.0);
  float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);
  result = lightBase + grainSignal * grainStrength;
}
  gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0) * smoothstep(0.0, uFade, vUv.y);
}
`;

export function createSilk(host, { theme = 'dark' } = {}) {
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'pv-silk';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  // premultiplied output (the fade multiplies colour and alpha): composited over the page as is
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return null; }
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fragmentShader));
  gl.bindAttribLocation(prog, 0, 'position');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return null; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // the full-screen triangle
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = {};
  for (const n of ['uTime', 'uColor', 'uSpeed', 'uScale', 'uRotation', 'uNoiseIntensity', 'uLightMode', 'uFade']) u[n] = gl.getUniformLocation(prog, n);

  const st = { theme, raf: 0, last: 0, t0: performance.now(), w: 0, h: 0, paused: 0, host };
  function props() {
    const p = THEMES[st.theme] || THEMES.dark;
    canvas.dataset.theme = st.theme;
    gl.uniform3fv(u.uColor, hexToNormalizedRGB(p.color));
    gl.uniform1f(u.uSpeed, p.speed);
    gl.uniform1f(u.uScale, p.scale);
    gl.uniform1f(u.uRotation, p.rotation);
    gl.uniform1f(u.uNoiseIntensity, p.noiseIntensity);
    gl.uniform1f(u.uLightMode, p.lightMode ? 1 : 0);
    gl.uniform1f(u.uFade, 0.3);
  }
  // sized by the ResizeObserver only (it runs after layout, so the silk never forces one); DPR ≤ 1.5
  function placement() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(st.host.clientWidth * dpr)), h = Math.max(1, Math.round(st.host.clientHeight * dpr));
    if (w === st.w && h === st.h) return false;
    canvas.width = st.w = w; canvas.height = st.h = h; gl.viewport(0, 0, w, h);
    return true;
  }
  // the original advances uTime by 0.1 per second (useFrame: uTime += 0.1 * delta)
  function draw(seconds) {
    gl.uniform1f(u.uTime, 0.1 * seconds);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) {
    st.raf = requestAnimationFrame(loop);
    if (touch && now - st.last < 32) return; // ≤ 30 fps on touch screens
    st.last = now;
    draw((now - st.t0) / 1000);
  }
  // a resize clears the buffer: draw again at once (running or not), so no blank frame shows
  const ro = new ResizeObserver(() => { if (placement()) draw(st.raf ? (performance.now() - st.t0) / 1000 : st.paused || 6); });
  ro.observe(host);
  props();

  return {
    canvas,
    start() { if (!st.raf) st.raf = requestAnimationFrame(loop); },
    stop() { if (st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; st.paused = (performance.now() - st.t0) / 1000; } },
    /** one still frame (reduced motion, Save-Data, filmstrips) */
    frame(seconds = 6) { this.stop(); st.paused = seconds; draw(seconds); },
    set({ theme: th = st.theme } = {}) { st.theme = th; props(); if (!st.raf) draw(st.paused || 6); },
    /** a new page was rendered: the silk goes under its hero */
    move(newHost) {
      if (!newHost || newHost === st.host) return;
      ro.unobserve(st.host);
      st.host = newHost;
      newHost.prepend(canvas);
      ro.observe(newHost); // (its first callback sizes the canvas to the new hero)
      if (!st.raf) draw(st.paused || 6);
    },
    destroy() {
      this.stop();
      ro.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    },
  };
}
