/*
 * The shader grounds' shared part: one triangle over the whole screen drawn by a fragment shader, and the noise, grain
 * and stars the shaders draw with.
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
/** a sky of stars on a grid (q and cell in screen heights, px one CSS pixel in them): one star in some cells, a crisp
 *  point with a faint halo, the brightest with a fine cross of light (only where the cells are large enough for it);
 *  its size, light, twinkle and tint from the cell's hash: mostly silver, a few lime (the system), a few warm (ember) */
vec3 stars(vec2 q, float cell, float density, float px, float now) {
  vec2 c = floor(q / cell);
  float h = hash(c);
  if (h > density) return vec3(0.0);
  vec2 at = vec2(hash(c + 7.1), hash(c + 3.7)) * 0.7 + 0.15;
  vec2 d = (q / cell - c - at) * cell;
  float big = pow(hash(c + 1.3), 5.0);
  float size = px * (0.5 + 0.8 * big);
  float twinkle = 0.8 + 0.2 * sin(now * 0.001 * (0.5 + 2.2 * hash(c + 9.2)) + h * 40.0);
  float bright = (0.4 + 0.6 * pow(hash(c + 5.5), 1.5)) * twinkle;
  float dd = dot(d, d);
  float light = exp(-dd / (size * size)) + 0.1 * exp(-dd / (size * size * 10.0));
  float g = step(0.05, cell) * smoothstep(0.3, 0.6, big);
  light += g * 0.45 * (exp(-d.x * d.x / (px * px * 0.16)) * exp(-abs(d.y) / (px * 2.6)) + exp(-d.y * d.y / (px * px * 0.16)) * exp(-abs(d.x) / (px * 2.6)));
  float tint = hash(c + 2.9);
  vec3 colour = tint < 0.06 ? vec3(0.855, 1.0, 0.25) : (tint < 0.11 ? vec3(1.0, 0.72, 0.5) : vec3(0.95, 0.96, 0.99));
  return colour * light * bright;
}
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
