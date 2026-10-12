/*
 * The orbit: a ribbon round the stone with the running list of services, set in Geologica with the
 * headline's sharp corners and its stone texture. It draws itself in, then the text keeps running;
 * the far side shows its inner face (mirrored, quieter); where the letters cross the stone on
 * screen they turn plain white (the stone's silhouette comes from stoneMask.ts).
 * Pure three.js: the R3F component is Orbit.tsx.
 */
import * as THREE from "three";
import { ROCK_GLSL } from "../lib/materials";

export const ORBIT_RADIUS = 2.15;
export const BAND_SPEED = 0.2; // how fast the text runs, world units per second
const BAND = {
  font: '"Lumera Orbit", Geologica, system-ui, sans-serif',
  weight: 500,
  height: 0.3, // ribbon height, world units at scale 1
  texH: 128, // texture height, px
  size: 0.34, // font size, fraction of the ribbon height
  gap: 0.85, // space on each side of the separator dot, em
};
export const BAND_H = BAND.height;

/**
 * One cycle of the service list on a transparent strip (only its alpha is used), word by word so it
 * keeps its kerning, a dot between items. The type is scaled so whole cycles fill the ring (no seam).
 */
function createBandTexture(label: string, maxWidth: number, ringLen: number) {
  const items = label.split("·").map((s) => s.trim()).filter(Boolean);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  const info = { width: 1, height: 1, carve: [0.3, 0.7] as [number, number] };
  const font = (size: number) => `${BAND.weight} ${size}px ${BAND.font}`;

  function layout(h: number, scale = 1) {
    const size = h * BAND.size * scale;
    ctx.font = font(size);
    const gap = size * BAND.gap;
    const runs = items.map((text) => ({ text, w: ctx.measureText(text).width }));
    return { size, gap, runs, width: runs.reduce((sum, r) => sum + r.w + gap * 2, 0) };
  }

  function draw() {
    let h = BAND.texH;
    let L = layout(h);
    const cycles = Math.max(1, Math.round((ringLen * h) / L.width));
    const cycle = ringLen / cycles; // tile length in ribbon heights
    const scale = (cycle * h) / L.width;
    L = layout(h, scale);
    if (L.width > maxWidth) {
      h = Math.max(32, Math.floor((h * maxWidth) / L.width));
      L = layout(h, scale);
    }
    const width = Math.round(cycle * h);
    // what rounding left over goes into the gaps, so the cycle closes exactly
    L.gap += (width - L.width) / (L.runs.length * 2);
    canvas.width = width;
    canvas.height = h;
    ctx.font = font(L.size); // resizing the canvas resets the context
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "alphabetic";
    const cap = ctx.measureText("НЙ").actualBoundingBoxAscent || L.size * 0.7;
    const xHeight = ctx.measureText("хи").actualBoundingBoxAscent || L.size * 0.52;
    const descent = ctx.measureText("ду").actualBoundingBoxDescent || L.size * 0.22;
    const baseline = h / 2 + cap / 2;
    const dotY = baseline - xHeight / 2; // the separator sits mid x-height
    info.carve = [1 - (baseline + descent) / h, 1 - (baseline - cap) / h];
    const dotR = L.size * 0.08;
    let x = 0;
    for (const run of L.runs) {
      ctx.fillText(run.text, x, baseline);
      x += run.w + L.gap;
      ctx.beginPath();
      ctx.arc(x, dotY, dotR, 0, Math.PI * 2);
      ctx.fill();
      x += L.gap;
    }
    info.width = canvas.width;
    info.height = h;
    texture.needsUpdate = true;
  }

  draw();
  return { texture, info, draw };
}

/** Geologica with the headline's sharp corners: canvas text can't take font-variation-settings,
 *  so the axis goes into a face of its own («Lumera Orbit»). */
export function loadOrbitFont(text: string) {
  if (!document.fonts) return Promise.resolve();
  if (typeof FontFace === "function" && !document.fonts.check(`500 48px "Lumera Orbit"`, "Л")) {
    const ranges: Record<string, string> = {
      "cyrillic-ext": "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
      cyrillic: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
      "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
      latin: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    };
    for (const [subset, unicodeRange] of Object.entries(ranges)) {
      document.fonts.add(
        new FontFace("Lumera Orbit", `url("/fonts/geologica-${subset}.woff2") format("woff2")`, {
          weight: "300 600",
          unicodeRange,
          // not in the TS lib yet; supported by Chromium and Safari
          ...({ variationSettings: '"SHRP" 64' } as object),
        }),
      );
    }
  }
  return document.fonts.load(`${BAND.weight} 48px ${BAND.font}`, text).then(() => undefined);
}

/** A closed ribbon round the orbit's axis; uv.x runs around (0 → 1), uv.y across. */
function createBandGeometry(radius: number, height: number, segments: number) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const a = u * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    positions.push(x, y, -height / 2, x, y, height / 2);
    uvs.push(u, 0, u, 1);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); // front face points outwards
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  return geometry;
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying float vFront;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 centre = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 offset = world.xyz - centre;
    vFront = 0.5 + 0.5 * offset.z / max(length(offset), 1e-4);
    vNormalW = normalize(mat3(modelMatrix) * vec3(position.xy, 0.0)); // the ribbon faces outwards
    vViewW = cameraPosition - world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uRepeat;
  uniform float uShift;
  uniform float uProgress;
  uniform float uOpacity;
  uniform float uAspect;   // texture cycle width / height: text space in ribbon heights
  uniform vec2 uCarve;     // v of the descender line and of the cap line
  uniform vec3 uKey;       // towards the key light (world)
  uniform vec3 uRim;       // towards the cool rim light (world)
  uniform sampler2D uMask; // the stone's silhouette on screen, blurred
  uniform vec2 uViewport;  // drawing-buffer size, px
  uniform float uReveal;   // the stone's light-up: no change before it's there
  varying vec2 vUv;
  varying float vFront;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  ${ROCK_GLSL}
  // straight-alpha "over"
  vec4 over(vec4 top, vec4 bottom) {
    float a = top.a + bottom.a * (1.0 - top.a);
    return vec4((top.rgb * top.a + bottom.rgb * bottom.a * (1.0 - top.a)) / max(a, 1e-4), a);
  }
  void main() {
    float head = uProgress * 1.02;
    float drawn = 1.0 - smoothstep(head - 0.015, head, vUv.x);
    vec2 tuv = vec2(vUv.x * uRepeat + uShift, vUv.y);
    float glyph = texture2D(uMap, tuv).a;
    float side = gl_FrontFacing ? 1.0 : 0.4;   // inner face = far side, mirrored text
    float fade = uOpacity * mix(0.22, 1.0, vFront) * side * drawn;

    // text space in ribbon heights: the texture travels with the letters
    vec2 p = vec2(fract(tuv.x) * uAspect, tuv.y);
    vec2 dp = fwidth(vec2(tuv.x * uAspect, tuv.y));
    float pixel = max(dp.x, dp.y);
    // stone, as in the headline: fine grit × weathered mottling; the grit fades out below a pixel
    float grit = mix(0.5, vnoise(vec3(p * 44.0, 0.5)), 1.0 - smoothstep(0.5, 0.9, pixel * 44.0));
    float mottle = fbm3(vec3(p * 1.6, 2.0));
    float stoneTex = clamp(0.56 + 0.88 * grit, 0.0, 1.0) * clamp(0.5 + 1.15 * mottle, 0.0, 1.0);
    // carve: each letter darkens toward its base, like letters cut into stone
    float carveT = clamp((tuv.y - uCarve.x) / max(uCarve.y - uCarve.x, 1e-3), 0.0, 1.0);
    vec3 carve = mix(vec3(0.706, 0.678, 0.635), vec3(1.0), smoothstep(0.05, 0.62, carveT));
    // light: the key from the upper left; a cool gleam where the ribbon turns to the rim
    vec3 N = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);
    vec3 V = normalize(vViewW);
    float diffuse = max(dot(N, uKey), 0.0);
    float gleam = pow(max(dot(reflect(-V, N), uRim), 0.0), 10.0);
    vec3 tone = mix(vec3(0.824, 0.8, 0.761), vec3(1.0), 0.4 + 0.6 * diffuse);
    vec3 letter = tone * carve * stoneTex + gleam * vec3(0.32, 0.34, 0.38);
    vec3 colIn = letter;
    // a soft dark shadow round the letters: keeps them legible where they cross the bright chrome
    float halo = texture2D(uMap, tuv, 2.5).a;
    vec4 layer = vec4(vec3(0.015), clamp(halo * 1.8, 0.0, 1.0) * 0.72);
    // where the letters cross the stone on screen they turn plain white (the mask is soft)
    float xray = smoothstep(0.1, 0.85, texture2D(uMask, gl_FragCoord.xy / uViewport).r) * uReveal;
    colIn = mix(colIn, vec3(1.0), xray);
    layer = over(vec4(colIn, glyph), layer);
    float a = layer.a * fade;
    if (a < 0.002) discard;
    gl_FragColor = vec4(layer.rgb, a);
  }
`;

/** The ribbon: geometry, material and the text that runs on it. */
export function createOrbit(gl: THREE.WebGLRenderer, label: string) {
  const maxWidth = Math.min(gl.capabilities.maxTextureSize || 4096, 4096);
  const circumference = Math.PI * 2 * ORBIT_RADIUS;
  const band = createBandTexture(label, maxWidth, circumference / BAND_H);
  band.texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const tileLength = () => (BAND_H * band.info.width) / band.info.height;
  const repeats = () => Math.max(1, Math.round(circumference / tileLength()));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: band.texture },
      uRepeat: { value: repeats() },
      uShift: { value: 0 },
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uAspect: { value: band.info.width / band.info.height },
      uCarve: { value: new THREE.Vector2(...band.info.carve) },
      uKey: { value: new THREE.Vector3(-3, 4, 5).normalize() },
      uRim: { value: new THREE.Vector3(4, 1.5, -3).normalize() },
      uMask: { value: null },
      uViewport: { value: new THREE.Vector2(1, 1) },
      uReveal: { value: 1 },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const geometry = createBandGeometry(ORBIT_RADIUS, BAND_H, 512);

  return {
    geometry,
    material,
    texture: band.texture,
    /** shift of the text along the ribbon (in texture cycles, wrapped) for a given time */
    shiftAt: (time: number) => ((time * BAND_SPEED) / tileLength()) % 1,
    /** redraw once the orbit's font is in (the first paint may use the fallback face) */
    redraw() {
      band.draw();
      material.uniforms.uRepeat.value = repeats();
      material.uniforms.uAspect.value = band.info.width / band.info.height;
      material.uniforms.uCarve.value.set(...band.info.carve);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      band.texture.dispose();
    },
  };
}
