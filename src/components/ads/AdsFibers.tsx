"use client";
/*
 * The ads page's first screen background (the owner's spec of 5 Nov 2026, after a reference still): a stream of glowing
 * fibres on near black, hot at its origin just above the top edge, arcing right under the «Звідки заявки» window,
 * bending at a knee and leaving at the bottom left, a third of the screen wide there. About seventy lines in five
 * strands, each strand a loose cluster round its own lane (gaussian, never even), twisting slowly so strands converge
 * and part; six cyan lines together inside the core strand; a few stray lines cutting the knee. Every line its own width,
 * brightness and colour, a soft core and a halo; light moves through them like the northern lights (2D noise over
 * along, across and time); the spine drifts like an aurora curtain; on a computer the lines part round the pointer.
 * Dust drifts down the stream, a few large blurred circles round it. The haze, the glow at the origin and the dark
 * behind the words are CSS (ads.css).
 *
 * Plain WebGL2, like the site's other backgrounds (FluxLines, TitleFx): no library on this page. Every line is one
 * instanced ribbon (a triangle strip, two vertices a spine sample) whose points the GPU works out from the spine (a small
 * float texture written here each frame: point, normal, half-width, curvature, the straight chord). In a bend a line
 * never goes further towards the bend's centre than its radius (it would fold into a sharp corner). The glow is layered
 * in the shader (a soft core and a wide faint halo, added up). It rests while the first screen is off screen, covered by
 * block 2 or the tab hidden; with reduced motion one still frame; without WebGL2 nothing (the haze stays). Every number
 * is in CONFIG.
 */
import { useEffect, useRef } from "react";
import { watchCover } from "@/components/sites/hero-fx/hero-cover";

const CONFIG = {
  /** the spine, as fractions of the hero's width and height (a centripetal Catmull-Rom curve through them). Keep its
   *  tightest bend at least about 1.5 times the stream's half-width there (now about 1.8): a tighter bend folds the lines
   *  on its inside into creases */
  spine: [
    [0.32, -0.06], // the origin, just above the top edge
    [0.68, 0.1],
    [0.82, 0.42], // the bulge to the right, deep under the «Звідки заявки» window (the owner, 5 Nov: a wider arc)
    [0.62, 0.78], // the knee
    [-0.08, 1.12], // the end, past the bottom left corner (the stream runs out of the screen there, it does not fade)
  ],
  samples: 160,
  /** the stream's half-width at t, as a fraction of the hero's width: lerp(top, bottom, t ** power) */
  width: { top: 0.014, bottom: 0.19, power: 1.4 },
  /** strands: their lane (−1…1 across the stream), the spread of their lines round it, how many; cyan: lines in it */
  strands: [
    { centre: -0.75, spread: 0.12, lines: 14, cyan: 0 },
    { centre: -0.4, spread: 0.1, lines: 20, cyan: 0 },
    { centre: -0.05, spread: 0.07, lines: 22, cyan: 8 },
    { centre: 0.3, spread: 0.1, lines: 20, cyan: 0 },
    { centre: 0.7, spread: 0.12, lines: 14, cyan: 0 },
  ],
  strays: { lines: 8, lane: [1.05, 1.35], alpha: [0.08, 0.2], wobblePx: [6, 12], fadeEnd: [0.6, 0.8], straighten: 0.3 },
  /** the twist: each strand's lane swings by `amount` over `turns` waves down the stream */
  twist: { amount: 0.1, turns: 1.3 },
  /** where the lines fan out on the inside of the bend */
  knee: { from: 0.55, to: 0.75, fan: 1.25 },
  line: { widthPx: [0.35, 1.6], alpha: [0.15, 0.9], wobblePx: [2, 6], halo: 0.14, haloCore: 0.26 },
  colours: {
    lime: ["#C6F03C", "#A8D82A", "#E4FF8A"],
    cyan: ["#5BB8FF", "#8FD4FF"],
    pale: "#F2FFD0",
    aurora: "#5AF2D9",
    violet: "#7B5CFF",
    origin: "#F6FFE4",
  },
  /** of the lines outside the cyan ones: pale yellow-white */
  paleShare: 0.2,
  /** the northern lights: waves along the stream and across it */
  aurora: { along: 3, speed: 0.12, across: 1.3, drift: 0.06, from: 0.35, to: 0.85, floor: 0.3, tint: 0.3, violet: 0.08, violetShare: 0.4 },
  /** the spine's points drift (a fraction of the hero's width / height, one cycle in `period` s) */
  drift: { amount: 0.015, period: 12 },
  /** the cone of light down the first part of the stream from the origin */
  cone: { length: 0.15, alpha: 0.32 },
  dust: { count: 250, nearCyan: 0.4, sizePx: [1, 2.5], speed: [0.01, 0.03] },
  bokeh: { count: 15, sizePx: [8, 40], alpha: [0.05, 0.15], free: 5 },
  intro: 1.8,
  /** a computer: the lines part round the pointer (along their normals, so they never cross) and light up a little;
   *  follow / fade: how fast it catches up and comes and goes (per second) */
  pointer: { radiusPx: 140, pushPx: 20, brighten: 0.3, follow: 5, fade: 2.5 },
  maxDpr: 2,
  /** a phone draws this share of the lines and the dust */
  phoneShare: 0.5,
  /** and its stream this much wider (the owner, 5 Nov 2026: at a computer's share of the width it was hardly seen) */
  phoneWidth: 2.25,
};

type Rgb = [number, number, number];
type Point = [number, number];
const rgb = (hex: string): Rgb => [parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255];
const between = ([low, high]: number[], weight = Math.random()) => low + (high - low) * weight;
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
/** a gaussian (Box–Muller), mean 0, deviation 1 */
const gaussian = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

// 2D simplex noise and a three-octave fbm (Ian McEwan, Stefan Gustavson, Ashima Arts: webgl-noise, MIT)
const NOISE = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 position) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 3; octave++) { sum += amplitude * snoise(position); position *= 2.0; amplitude *= 0.5; }
  return sum / 0.875;
}
`;

// the spine texture: row 0 (x, y, normal x, normal y), row 1 (half-width, curvature, chord x, chord y), device px.
// The curvature is signed (1/px, positive: the spine turns towards its normal) and smoothed along the spine
// (highp: a vertex shader's samplers are lowp by default, too coarse for pixels)
const SPINE = `
precision highp sampler2D;
uniform sampler2D uSpine;
uniform float uSamples;
vec4 spineAt(float t, int row) {
  float place = clamp(t, 0.0, 1.0) * (uSamples - 1.0);
  int first = int(floor(place));
  int second = min(first + 1, int(uSamples) - 1);
  return mix(texelFetch(uSpine, ivec2(first, row), 0), texelFetch(uSpine, ivec2(second, row), 0), fract(place));
}
vec4 clipAt(vec2 position, vec2 resolution) { vec2 clip = position / resolution * 2.0 - 1.0; return vec4(clip.x, -clip.y, 0.0, 1.0); }
// an offset across a bend: towards the bend's centre it eases off before the radius (a line offset further than the
// radius folds into a sharp corner); away from it, and where the spine runs straight, it is left as it is
float easeOffset(float offset, float curvature) {
  if (offset * curvature <= 0.0) return offset;
  float room = 0.85 / max(abs(curvature), 1e-6);
  return sign(offset) * room * tanh(abs(offset) / room);
}
uniform vec3 uPointer;     // x, y (device px), strength 0…1
uniform vec3 uPointerLook; // radius, push (device px), brighten
// the pointer parts the lines along their normals (the side eases through zero under it, so nothing jumps)
vec2 pointerPush(vec2 position, vec2 normal, out float near) {
  vec2 away = position - uPointer.xy;
  near = exp(-dot(away, away) / (uPointerLook.x * uPointerLook.x)) * uPointer.z;
  float side = clamp(dot(away, normal) / (uPointerLook.x * 0.35), -1.0, 1.0);
  return normal * side * near * uPointerLook.y;
}
`;

// a line: aVert = (spine sample, side −1/1); aLane = (lane u, strand phase, seed, kind: 0 line, 1 stray, 2 the cone);
// aLook = (core width px, alpha, softness, halo strength); aColour = (rgb, violet share); aMove = (wobble px, its speed,
// its phase, where it has faded out)
const LINE_VS = `#version 300 es
precision highp float;
in vec2 aVert;
in vec4 aLane;
in vec4 aLook;
in vec4 aColour;
in vec4 aMove;
uniform vec2 uRes;
uniform float uTime, uDpr;
uniform vec4 uTwist;      // amount, turns, knee from, knee to
uniform vec4 uAurora;     // along, speed, across, drift
uniform vec4 uAuroraLook; // from, to, floor, tint
uniform float uKneeFan, uStraighten, uConeLength;
uniform vec3 uAuroraColour, uViolet;
${NOISE}
${SPINE}
out vec3 vColour;
out float vAlpha;
out float vAcross;
out float vCore;
out float vHalo;
out float vHaloStrength;
out float vSoft;
out float vT;
flat out float vKind;
void main() {
  float t = aVert.x / (uSamples - 1.0);
  vec4 frame = texelFetch(uSpine, ivec2(int(aVert.x), 0), 0);
  vec4 extra = texelFetch(uSpine, ivec2(int(aVert.x), 1), 0);
  vec2 normal = frame.zw;
  float halfWidth = extra.x;
  float kind = aLane.w;
  // the lane: the strand's slow twist, then the knee's fan on the inside of the bend, then the line's own wobble
  float lane = aLane.x + uTwist.x * sin(6.2832 * uTwist.y * t + aLane.y);
  float offset = lane * halfWidth;
  float knee = smoothstep(uTwist.z - 0.05, uTwist.z + 0.05, t) * (1.0 - smoothstep(uTwist.w - 0.05, uTwist.w + 0.05, t));
  float inner = clamp(sign(offset) * extra.y * 140.0 * uDpr, 0.0, 1.0);
  offset = easeOffset(offset * (1.0 + (uKneeFan - 1.0) * knee * inner), extra.y);
  offset += (sin(t * 9.0 + uTime * aMove.y + aMove.z) * 0.6 + sin(t * 17.0 - uTime * aMove.y * 0.7 + aMove.z * 2.3) * 0.4) * aMove.x * uDpr;
  vec2 position = frame.xy + normal * offset;
  // a stray cuts the knee: part of the way to the straight chord
  if (kind > 0.5 && kind < 1.5) position = mix(position, extra.zw + normal * offset, uStraighten);
  float near = 0.0;
  if (kind < 1.5) position += pointerPush(position, normal, near);
  float core = aLook.x * uDpr;
  float halo = (4.0 + aLook.w * 30.0) * uDpr;
  float ribbon = core * 0.5 + halo;
  if (kind > 1.5) {
    position = frame.xy;
    ribbon = mix(8.0 * uDpr, halfWidth * 1.4 + 10.0 * uDpr, clamp(t / uConeLength, 0.0, 1.0));
  }
  gl_Position = clipAt(position + normal * aVert.y * ribbon, uRes);
  // the northern lights: waves of light down the stream, a shimmer across it from strand to strand
  float along = t * uAurora.x - uTime * uAurora.y + aLane.y;
  float across = aLane.x * uAurora.z + uTime * uAurora.w;
  float glow = smoothstep(uAuroraLook.x, uAuroraLook.y, fbm(vec2(along, across)) * 0.5 + 0.5);
  vec3 colour = mix(aColour.rgb, uAuroraColour, glow * uAuroraLook.w);
  vColour = mix(colour, uViolet, aColour.a);
  float lengthFade = smoothstep(0.0, 0.04, t) * (1.0 - smoothstep(aMove.w - 0.14, aMove.w, t)) * mix(1.0, 0.72, t);
  vAlpha = aLook.y * lengthFade * mix(uAuroraLook.z, 1.0, glow) * (1.0 + near * uPointerLook.z);
  if (kind > 1.5) {
    vColour = aColour.rgb;
    vAlpha = aLook.y * (1.0 - smoothstep(0.0, uConeLength, t));
  }
  vAcross = aVert.y * ribbon;
  vCore = core;
  vHalo = kind > 1.5 ? ribbon : halo;
  vHaloStrength = aLook.w;
  vSoft = aLook.z;
  vT = t;
  vKind = kind;
}`;

const LINE_FS = `#version 300 es
precision highp float;
in vec3 vColour;
in float vAlpha;
in float vAcross;
in float vCore;
in float vHalo;
in float vHaloStrength;
in float vSoft;
in float vT;
flat in float vKind;
uniform float uReveal, uGlowIn, uDpr;
out vec4 outColor;
void main() {
  // drawn in from the top: a soft head at uReveal
  float shown = 1.0 - smoothstep(uReveal - 0.05, uReveal, vT);
  if (shown <= 0.0) discard;
  float fromMiddle = abs(vAcross);
  float alpha;
  if (vKind > 1.5) {
    float across = fromMiddle / max(vHalo, 1.0);
    alpha = exp(-across * across * 2.5) * uGlowIn;
  } else {
    // a soft core (thin, dim lines softer and fainter: depth) and a wide faint halo, added up
    float sigma = max(vCore * 0.5, 0.6 * uDpr) * vSoft;
    float core = exp(-(fromMiddle * fromMiddle) / (2.0 * sigma * sigma)) * clamp(vCore / (sigma * 2.0), 0.3, 1.0);
    float halo = exp(-pow(fromMiddle / vHalo, 2.0) * 2.5) * vHaloStrength * uGlowIn;
    alpha = core + halo;
  }
  alpha *= vAlpha * shown;
  outColor = vec4(vColour * alpha, alpha);
}`;

// dust and bokeh: aWhere = (t, lane u, speed, seed); aLook = (kind: 0 dust, 1 bokeh on the stream, 2 bokeh on its own,
// size px, alpha, cyan 0/1); aPhase = the strand's twist phase. Bokeh on its own: aWhere.xy are screen fractions
const SPARK_VS = `#version 300 es
precision highp float;
in vec4 aWhere;
in vec4 aLook;
in float aPhase;
uniform vec2 uRes;
uniform float uTime, uDpr, uReveal, uMaxPoint;
uniform vec4 uTwist;
${SPINE}
out float vAlpha;
out float vCyan;
flat out float vKind;
void main() {
  float kind = aLook.x;
  float seed = aWhere.w;
  float t = fract(aWhere.x + uTime * aWhere.z);
  vec4 frame = spineAt(t, 0);
  vec4 extra = spineAt(t, 1);
  float lane = aWhere.y + uTwist.x * sin(6.2832 * uTwist.y * t + aPhase);
  vec2 normal = normalize(frame.zw);
  vec2 position = frame.xy + normal * easeOffset(lane * extra.x, extra.y);
  float near = 0.0;
  if (kind < 1.5) position += pointerPush(position, normal, near);
  float drift = 10.0 * uDpr;
  if (kind > 0.5) position += vec2(sin(uTime * 0.1 + seed * 6.0), cos(uTime * 0.08 + seed * 4.0)) * drift;
  if (kind > 1.5) {
    t = 0.5;
    position = aWhere.xy * uRes + vec2(sin(uTime * 0.07 + seed * 5.0), cos(uTime * 0.06 + seed * 3.0)) * drift * 2.0;
  }
  gl_Position = clipAt(position, uRes);
  gl_PointSize = min(aLook.y * uDpr, uMaxPoint);
  float lengthFade = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.96, 1.0, t)) * mix(1.0, 0.72, t);
  float twinkle = kind > 0.5 ? 1.0 : 0.55 + 0.45 * sin(uTime * (0.8 + fract(seed * 3.0) * 1.6) + seed * 40.0);
  vAlpha = aLook.z * twinkle * lengthFade * step(t, uReveal);
  vCyan = aLook.w;
  vKind = kind;
}`;

const SPARK_FS = `#version 300 es
precision highp float;
in float vAlpha;
in float vCyan;
flat in float vKind;
uniform vec3 uLime, uCyan;
out vec4 outColor;
void main() {
  float fromMiddle = length(gl_PointCoord - 0.5) * 2.0;
  // dust: a small soft dot; bokeh: heavily blurred
  float shape = vKind > 0.5 ? exp(-fromMiddle * fromMiddle * 3.5) : exp(-fromMiddle * fromMiddle * 5.0);
  float alpha = shape * vAlpha;
  vec3 colour = mix(uLime, uCyan, vCyan);
  if (vKind < 0.5) colour = mix(colour, vec3(1.0), 0.5);
  outColor = vec4(colour * alpha, alpha);
}`;

function compile(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

/** A centripetal Catmull-Rom curve through the points, resampled to `count` points evenly along its length. */
function catmullRom(points: Point[], count: number): Point[] {
  const padded: Point[] = [
    [2 * points[0][0] - points[1][0], 2 * points[0][1] - points[1][1]],
    ...points,
    [2 * points.at(-1)![0] - points.at(-2)![0], 2 * points.at(-1)![1] - points.at(-2)![1]],
  ];
  // centripetal: knots spaced by the square root of the distance between the points
  const knot = (from: Point, to: Point, previous: number) => previous + Math.sqrt(Math.hypot(to[0] - from[0], to[1] - from[1])) + 1e-6;
  const dense: Point[] = [];
  for (let segment = 0; segment < points.length - 1; segment++) {
    const [p0, p1, p2, p3] = padded.slice(segment, segment + 4);
    const k0 = 0;
    const k1 = knot(p0, p1, k0);
    const k2 = knot(p1, p2, k1);
    const k3 = knot(p2, p3, k2);
    for (let step = 0; step < 64; step++) {
      const at = k1 + ((k2 - k1) * step) / 64;
      const blend = (from: Point, to: Point, start: number, stop: number): Point => [
        ((stop - at) / (stop - start)) * from[0] + ((at - start) / (stop - start)) * to[0],
        ((stop - at) / (stop - start)) * from[1] + ((at - start) / (stop - start)) * to[1],
      ];
      const a1 = blend(p0, p1, k0, k1);
      const a2 = blend(p1, p2, k1, k2);
      const a3 = blend(p2, p3, k2, k3);
      dense.push(blend(blend(a1, a2, k0, k2), blend(a2, a3, k1, k3), k1, k2));
    }
  }
  dense.push(points.at(-1)!);
  const lengths = [0];
  for (let index = 1; index < dense.length; index++) lengths.push(lengths[index - 1] + Math.hypot(dense[index][0] - dense[index - 1][0], dense[index][1] - dense[index - 1][1]));
  const total = lengths.at(-1)!;
  const even: Point[] = [];
  let walk = 0;
  for (let sample = 0; sample < count; sample++) {
    const want = (total * sample) / (count - 1);
    while (walk < lengths.length - 2 && lengths[walk + 1] < want) walk++;
    const share = (want - lengths[walk]) / (lengths[walk + 1] - lengths[walk] || 1);
    even.push([dense[walk][0] + (dense[walk + 1][0] - dense[walk][0]) * share, dense[walk][1] + (dense[walk + 1][1] - dense[walk][1]) * share]);
  }
  return even;
}

/** `under`: the block that slides over the pinned first screen; the lines rest while it covers it. */
export function AdsFibers({ under = "#case" }: { under?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const originRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const origin = originRef.current;
    const box = canvas?.parentElement;
    const gl = canvas?.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!canvas || !origin || !box || !gl) return;
    const lineProgram = compile(gl, LINE_VS, LINE_FS);
    const sparkProgram = compile(gl, SPARK_VS, SPARK_FS);
    if (!lineProgram || !sparkProgram) return;

    const phone = matchMedia("(max-width: 760px)").matches;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const share = phone ? CONFIG.phoneShare : 1;
    const widthScale = phone ? CONFIG.phoneWidth : 1;
    const samples = CONFIG.samples;
    const colours = {
      lime: CONFIG.colours.lime.map(rgb),
      cyan: CONFIG.colours.cyan.map(rgb),
      pale: rgb(CONFIG.colours.pale),
      origin: rgb(CONFIG.colours.origin),
    };

    // the lines: per strand, lanes from a gaussian round its centre (dense clusters, gaps); the core strand's cyan
    // ones next to each other in it
    type Line = { lane: number; phase: number; kind: number; width: number; alpha: number; colour: Rgb; violet: number; wobble: number; fadeEnd: number; halo: number };
    const lines: Line[] = [];
    let cyanPhase = 0;
    let cyanLane = 0;
    for (const strand of CONFIG.strands) {
      const phase = Math.random() * Math.PI * 2;
      const count = Math.max(1, Math.round(strand.lines * share));
      const cyan = Math.round(strand.cyan * share);
      const lanes = Array.from({ length: count }, () => strand.centre + gaussian() * strand.spread).sort((left, right) => left - right);
      const cyanFrom = Math.floor((count - cyan) / 2);
      if (cyan) {
        cyanPhase = phase;
        cyanLane = lanes[cyanFrom + Math.floor(cyan / 2)];
      }
      lanes.forEach((lane, index) => {
        const isCyan = index >= cyanFrom && index < cyanFrom + cyan;
        // most thin, a few thick and bright
        const weight = Math.random() ** 3;
        const pale = !isCyan && Math.random() < CONFIG.paleShare;
        lines.push({
          lane,
          phase,
          kind: 0,
          width: between(CONFIG.line.widthPx, weight),
          alpha: between(CONFIG.line.alpha, Math.min(1, weight * 0.7 + Math.random() * 0.45)) * (pale ? 0.45 : 1),
          colour: isCyan ? pick(colours.cyan) : pale ? colours.pale : pick(colours.lime),
          violet: Math.abs(lane) > 0.9 && Math.random() < CONFIG.aurora.violetShare ? CONFIG.aurora.violet : 0,
          wobble: between(CONFIG.line.wobblePx),
          // (past the end: the line runs out of the screen at full strength)
          fadeEnd: 1.12,
          halo: (strand.cyan ? CONFIG.line.haloCore : CONFIG.line.halo) * (0.6 + weight * 0.8),
        });
      });
    }
    for (let stray = 0; stray < Math.round(CONFIG.strays.lines * share); stray++) {
      lines.push({
        lane: between(CONFIG.strays.lane) * (Math.random() < 0.5 ? -1 : 1),
        phase: Math.random() * Math.PI * 2,
        kind: 1,
        width: between(CONFIG.line.widthPx, Math.random() * 0.3),
        alpha: between(CONFIG.strays.alpha),
        colour: pick(colours.lime),
        violet: 0,
        wobble: between(CONFIG.strays.wobblePx),
        fadeEnd: between(CONFIG.strays.fadeEnd),
        halo: CONFIG.line.halo * 0.5,
      });
    }
    // the cone of light down from the origin
    lines.push({ lane: 0, phase: 0, kind: 2, width: 0, alpha: CONFIG.cone.alpha, colour: colours.origin, violet: 0, wobble: 0, fadeEnd: 1, halo: 0 });

    const lineData = new Float32Array(lines.length * 16);
    lines.forEach((line, index) => {
      lineData.set(
        [
          line.lane, line.phase, Math.random(), line.kind,
          line.width, line.alpha, 1 + (1 - line.alpha) * 0.9, line.halo,
          ...line.colour, line.violet,
          line.wobble, 0.2 + Math.random() * 0.4, Math.random() * Math.PI * 2, line.fadeEnd,
        ],
        index * 16,
      );
    });

    // dust (40 % of it round the cyan strand) and bokeh (most on the stream, a few on their own on the right)
    const dust = Math.round(CONFIG.dust.count * share);
    const bokeh = Math.round(CONFIG.bokeh.count * (phone ? 0.6 : 1));
    const sparkData = new Float32Array((dust + bokeh) * 9);
    for (let speck = 0; speck < dust; speck++) {
      const nearCyan = Math.random() < CONFIG.dust.nearCyan;
      sparkData.set(
        [
          Math.random(), nearCyan ? cyanLane + gaussian() * 0.05 : Math.random() * 2 - 1, between(CONFIG.dust.speed), Math.random(),
          0, between(CONFIG.dust.sizePx), 0.35 + Math.random() * 0.65, nearCyan ? 0.6 : 0,
          nearCyan ? cyanPhase : Math.random() * Math.PI * 2,
        ],
        speck * 9,
      );
    }
    for (let circle = 0; circle < bokeh; circle++) {
      const alone = circle < CONFIG.bokeh.free;
      sparkData.set(
        [
          alone ? 0.62 + Math.random() * 0.34 : Math.random(), alone ? 0.1 + Math.random() * 0.8 : (Math.random() * 2 - 1) * 1.7, 0.0008, Math.random(),
          alone ? 2 : 1, between(CONFIG.bokeh.sizePx), between(CONFIG.bokeh.alpha), Math.random() < 0.35 ? 1 : 0,
          Math.random() * Math.PI * 2,
        ],
        (dust + circle) * 9,
      );
    }

    // the ribbon shared by every line: (sample, side) pairs
    const strip = new Float32Array(samples * 4);
    for (let sample = 0; sample < samples; sample++) strip.set([sample, -1, sample, 1], sample * 4);
    const buffer = (data: Float32Array) => {
      const made = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, made);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return made;
    };
    const attribute = (program: WebGLProgram, name: string, size: number, stride: number, offset: number, perInstance: boolean) => {
      const location = gl.getAttribLocation(program, name);
      if (location < 0) return;
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride * 4, offset * 4);
      if (perInstance) gl.vertexAttribDivisor(location, 1);
    };
    const lineVao = gl.createVertexArray();
    gl.bindVertexArray(lineVao);
    buffer(strip);
    attribute(lineProgram, "aVert", 2, 2, 0, false);
    buffer(lineData);
    attribute(lineProgram, "aLane", 4, 16, 0, true);
    attribute(lineProgram, "aLook", 4, 16, 4, true);
    attribute(lineProgram, "aColour", 4, 16, 8, true);
    attribute(lineProgram, "aMove", 4, 16, 12, true);
    const sparkVao = gl.createVertexArray();
    gl.bindVertexArray(sparkVao);
    buffer(sparkData);
    attribute(sparkProgram, "aWhere", 4, 9, 0, false);
    attribute(sparkProgram, "aLook", 4, 9, 4, false);
    attribute(sparkProgram, "aPhase", 1, 9, 8, false);
    gl.bindVertexArray(null);

    // the spine texture, written every frame
    const spineData = new Float32Array(samples * 2 * 4);
    const spineTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, spineTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, samples, 2, 0, gl.RGBA, gl.FLOAT, spineData);

    const uniforms = (program: WebGLProgram, names: string[]) => Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)]));
    const lineAt = uniforms(lineProgram, ["uRes", "uTime", "uDpr", "uTwist", "uAurora", "uAuroraLook", "uKneeFan", "uStraighten", "uConeLength", "uAuroraColour", "uViolet", "uSpine", "uSamples", "uReveal", "uGlowIn", "uPointer", "uPointerLook"]);
    const sparkAt = uniforms(sparkProgram, ["uRes", "uTime", "uDpr", "uReveal", "uMaxPoint", "uTwist", "uSpine", "uSamples", "uLime", "uCyan", "uPointer", "uPointerLook"]);
    const maxPoint = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array)[1] || 64;
    const twist = [CONFIG.twist.amount, CONFIG.twist.turns, CONFIG.knee.from, CONFIG.knee.to] as const;

    let dpr = 1;
    const measure = () => {
      dpr = Math.min(devicePixelRatio || 1, CONFIG.maxDpr);
      const rect = box.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };

    // the spine this frame, from CONFIG at the canvas' size: its points drifting, sampled, with normals, half-widths,
    // the inner side of the bend and the straight chord
    const writeSpine = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const cycle = (time / CONFIG.drift.period) * Math.PI * 2;
      const drifted = CONFIG.spine.map(([across, down], index): Point => [
        (across + CONFIG.drift.amount * (Math.sin(cycle + index * 1.7) * 0.7 + Math.sin(cycle * 1.63 + index * 2.9) * 0.3)) * width,
        (down + CONFIG.drift.amount * (Math.cos(cycle * 0.9 + index * 2.1) * 0.7 + Math.sin(cycle * 1.37 + index * 1.3) * 0.3)) * height,
      ]);
      const points = catmullRom(drifted, samples);
      const tangents = points.map((_point, index) => {
        const before = points[Math.max(0, index - 1)];
        const after = points[Math.min(samples - 1, index + 1)];
        const length = Math.hypot(after[0] - before[0], after[1] - before[1]) || 1;
        return [(after[0] - before[0]) / length, (after[1] - before[1]) / length];
      });
      const first = points[0];
      const last = points[samples - 1];
      const normals = tangents.map(([tangentX, tangentY]) => [-tangentY, tangentX]);
      // the curvature (1/px, signed), over a few samples and averaged (one sample's alone flickers and kinks the lines)
      const bends = normals.map((normal, index) => {
        const from = Math.max(0, index - 3);
        const to = Math.min(samples - 1, index + 3);
        const turn = normal[0] * (tangents[to][0] - tangents[from][0]) + normal[1] * (tangents[to][1] - tangents[from][1]);
        return turn / (Math.hypot(points[to][0] - points[from][0], points[to][1] - points[from][1]) || 1);
      });
      points.forEach((point, index) => {
        const t = index / (samples - 1);
        const normal = normals[index];
        const near = bends.slice(Math.max(0, index - 4), index + 5);
        const curvature = near.reduce((sum, bend) => sum + bend, 0) / near.length;
        const halfWidth = (CONFIG.width.top + (CONFIG.width.bottom - CONFIG.width.top) * t ** CONFIG.width.power) * width * widthScale;
        spineData.set([point[0], point[1], normal[0], normal[1]], index * 4);
        spineData.set([halfWidth, curvature, first[0] + (last[0] - first[0]) * t, first[1] + (last[1] - first[1]) * t], (samples + index) * 4);
      });
      gl.bindTexture(gl.TEXTURE_2D, spineTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, samples, 2, gl.RGBA, gl.FLOAT, spineData);
      // the glow at the origin follows it (CSS px)
      origin.style.transform = `translate3d(${(first[0] / dpr).toFixed(1)}px, ${(first[1] / dpr).toFixed(1)}px, 0)`;
    };

    let clock = 0;
    let intro = still ? 1 : 0;
    const render = () => {
      const reveal = still ? 1 : 1 - (1 - Math.min(1, intro)) ** 3;
      writeSpine(clock);
      origin.style.opacity = String(reveal);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, spineTexture);

      gl.useProgram(lineProgram);
      gl.uniform2f(lineAt.uRes, canvas.width, canvas.height);
      gl.uniform1f(lineAt.uTime, clock);
      gl.uniform1f(lineAt.uDpr, dpr);
      gl.uniform4f(lineAt.uTwist, ...twist);
      gl.uniform4f(lineAt.uAurora, CONFIG.aurora.along, CONFIG.aurora.speed, CONFIG.aurora.across, CONFIG.aurora.drift);
      gl.uniform4f(lineAt.uAuroraLook, CONFIG.aurora.from, CONFIG.aurora.to, CONFIG.aurora.floor, CONFIG.aurora.tint);
      gl.uniform1f(lineAt.uKneeFan, CONFIG.knee.fan);
      gl.uniform1f(lineAt.uStraighten, CONFIG.strays.straighten);
      gl.uniform1f(lineAt.uConeLength, CONFIG.cone.length);
      gl.uniform3fv(lineAt.uAuroraColour, rgb(CONFIG.colours.aurora));
      gl.uniform3fv(lineAt.uViolet, rgb(CONFIG.colours.violet));
      gl.uniform1i(lineAt.uSpine, 0);
      gl.uniform1f(lineAt.uSamples, samples);
      gl.uniform1f(lineAt.uReveal, reveal * 1.06);
      gl.uniform1f(lineAt.uGlowIn, reveal);
      gl.uniform3f(lineAt.uPointer, pointer.x, pointer.y, pointer.strength);
      gl.uniform3f(lineAt.uPointerLook, CONFIG.pointer.radiusPx * dpr, CONFIG.pointer.pushPx * dpr, CONFIG.pointer.brighten);
      gl.bindVertexArray(lineVao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, samples * 2, lines.length);

      gl.useProgram(sparkProgram);
      gl.uniform2f(sparkAt.uRes, canvas.width, canvas.height);
      gl.uniform1f(sparkAt.uTime, clock);
      gl.uniform1f(sparkAt.uDpr, dpr);
      gl.uniform1f(sparkAt.uReveal, reveal * 1.06);
      gl.uniform1f(sparkAt.uMaxPoint, maxPoint);
      gl.uniform4f(sparkAt.uTwist, ...twist);
      gl.uniform1i(sparkAt.uSpine, 0);
      gl.uniform1f(sparkAt.uSamples, samples);
      gl.uniform3f(sparkAt.uPointer, pointer.x, pointer.y, pointer.strength);
      gl.uniform3f(sparkAt.uPointerLook, CONFIG.pointer.radiusPx * dpr, CONFIG.pointer.pushPx * dpr, CONFIG.pointer.brighten);
      gl.uniform3fv(sparkAt.uLime, colours.lime[0]);
      gl.uniform3fv(sparkAt.uCyan, colours.cyan[0]);
      gl.bindVertexArray(sparkVao);
      gl.drawArrays(gl.POINTS, 0, dust + bokeh);
      gl.bindVertexArray(null);
    };

    // the pointer (a computer only): where it is and how strongly it acts, both eased each frame
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, target: 0 };
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = (event.clientX - rect.left) * dpr;
      pointer.targetY = (event.clientY - rect.top) * dpr;
      if (pointer.strength < 0.01) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };
    const fine = !still && matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine) {
      addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
    }

    let raf = 0;
    let last = 0;
    let onScreen = true;
    let covered = false;
    const running = () => !still && onScreen && !covered && !document.hidden;
    const frame = (now: number) => {
      raf = 0;
      if (!running()) return;
      const step = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      clock += step;
      pointer.x += (pointer.targetX - pointer.x) * Math.min(1, step * CONFIG.pointer.follow);
      pointer.y += (pointer.targetY - pointer.y) * Math.min(1, step * CONFIG.pointer.follow);
      pointer.strength += (pointer.target - pointer.strength) * Math.min(1, step * CONFIG.pointer.fade);
      intro += step / CONFIG.intro;
      render();
      raf = requestAnimationFrame(frame);
    };
    const run = () => {
      if (!running()) {
        last = 0;
        return;
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };

    measure();
    render();
    // a new size: the canvas again, the spine is worked out from CONFIG at it on every frame
    const resize = new ResizeObserver(() => {
      measure();
      render();
    });
    resize.observe(box);
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      run();
    });
    seen.observe(box);
    const stopCover = watchCover((now) => {
      covered = now;
      run();
    }, under);
    document.addEventListener("visibilitychange", run);
    run();

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      seen.disconnect();
      stopCover();
      document.removeEventListener("visibilitychange", run);
      removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [under]);

  return (
    <div className="rk-fib" aria-hidden="true">
      <canvas ref={ref} className="rk-fib__gl" />
      <i ref={originRef} className="rk-fib__origin" />
    </div>
  );
}
