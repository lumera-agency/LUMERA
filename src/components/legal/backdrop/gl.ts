/*
 * The grounds' shared part: one triangle over the whole screen drawn by a fragment shader, the noise the shaders draw
 * with, and the form's «sent» signal (lead-form.js shows the form's sent state) for the grounds that answer it.
 */

export const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/** hash, gradient noise (smooth to the second derivative, so a surface lit by its slope shows no grid) and its fbm */
export const NOISE = `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 g2(vec2 i) { float a = hash(i) * 6.2831853; return vec2(cos(a), sin(a)); }
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(g2(i), f);
  float b = dot(g2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(g2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(g2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * gnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    a *= 0.5;
  }
  return v;
}
/** film grain, new every frame */
float grain(vec2 at, float now) { return hash(at + fract(now * 0.0137) * 97.0) - 0.5; }
`;

/** the shader on the canvas; null where WebGL2 is missing or the shader does not build */
export function screenShader(canvas: HTMLCanvasElement, fragment: string) {
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("backdrop:", gl.getShaderInfoLog(shader));
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.clearColor(0, 0, 0, 0);
  return { gl, at: (name: string) => gl.getUniformLocation(program, name) };
}

/** calls back with the form's box (CSS px on the screen) when a request has been sent; returns the unwatch */
export function watchSent(sent: (box: DOMRect) => void) {
  const done = document.querySelector<HTMLElement>("[data-form-done]");
  if (!done) return () => {};
  const watch = new MutationObserver(() => {
    if (!done.hidden) sent((done.closest("form") ?? done).getBoundingClientRect());
  });
  watch.observe(done, { attributes: true, attributeFilter: ["hidden"] });
  return () => watch.disconnect();
}
