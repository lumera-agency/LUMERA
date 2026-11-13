/*
 * «Рельєф»: contour lines of a slowly shifting terrain (after 21st.dev's «Topography», drawn our own way, as one small
 * shader): graphite lines on black, every fifth one stronger, the highest summits in lime. The pointer raises a soft
 * hill under it, and the lines part round it.
 */
import type { Create } from "./types";

const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uPointer;
out vec4 outColour;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = r * p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  float t = uTime * 0.001;
  vec2 p = uv * 1.85 + vec2(t * 0.016, t * 0.009);
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.025)), fbm(p + vec2(5.2, 1.3) - t * 0.018));
  float n = fbm(p + 0.9 * q);
  vec2 m = uPointer.xy / uRes.y;
  float d = distance(uv, m);
  n += uPointer.z * 0.12 * exp(-d * d * 24.0);
  float v = n * 17.0;
  float w = fwidth(v);
  float f = abs(fract(v - 0.5) - 0.5);
  float line = 1.0 - smoothstep(w * 0.5, w * 1.5, f);
  float level = floor(v + 0.5);
  float major = 1.0 - step(0.5, mod(level, 5.0));
  float alpha = line * mix(0.11, 0.27, major);
  vec3 colour = vec3(0.95, 0.95, 0.93);
  float top = smoothstep(0.66, 0.73, n);
  colour = mix(colour, vec3(0.855, 1.0, 0.008), top);
  alpha = mix(alpha, line * 0.8, top);
  outColour = vec4(colour * alpha, alpha);
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
  // one triangle over the whole canvas
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(program, "uRes");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uPointer = gl.getUniformLocation(program, "uPointer");
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
    },
    draw(now, dt) {
      // the hill under the pointer rises and settles softly
      lift += ((pointer.on ? 1 : 0) - lift) * Math.min(1, dt / 400);
      gl.uniform1f(uTime, now);
      gl.uniform3f(uPointer, pointer.x * dpr, canvas.height - pointer.y * dpr, lift);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
};
