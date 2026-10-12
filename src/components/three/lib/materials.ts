/*
 * Materials and studio lighting for the stone (pure three.js, no React): the obsidian coal with its
 * silver dust, the black liquid-metal seam, and the two baked environments they reflect.
 */
import * as THREE from "three";

/** What the chrome seam reflects: its hard strip and back fill in the brand lime (the site's look),
 *  in ember (an alternative), or the original cool studio light. */
export const CHROME_LIGHTS = {
  studio: { strip: 0xe8eeff, back: 0xffffff, backIntensity: 0.5 },
  signal: { strip: 0xdaff02, back: 0xdaff02, backIntensity: 1.8 },
  ember: { strip: 0xd2561c, back: 0xd2561c, backIntensity: 1.8 },
} as const;
export type ChromeLight = (typeof CHROME_LIGHTS)[keyof typeof CHROME_LIGHTS];

/** Dark studio: a few soft boxes on black → crisp, travelling highlights. */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  const geo = new THREE.PlaneGeometry(1, 1);
  const panel = (w: number, h: number, position: THREE.Vector3, intensity: number, tint: THREE.ColorRepresentation = 0xffffff) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(tint).multiplyScalar(intensity),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, material);
    mesh.scale.set(w, h, 1);
    mesh.position.copy(position);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(7, 2.2, new THREE.Vector3(-1, 6, 2), 3.2);                 // overhead strip
  panel(1.2, 7, new THREE.Vector3(-6, 1, 3), 4.0, 0xfff6ec);       // key strip, barely warm
  panel(0.8, 6, new THREE.Vector3(6, 0, -2), 3.0, 0xdfe6ff);       // cool rim
  panel(3, 1, new THREE.Vector3(2, -5, 4), 0.8);                   // floor bounce

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  geo.dispose();
  env.traverse((o) => ((o as THREE.Mesh).material as THREE.Material | undefined)?.dispose());
  return texture;
}

export const ROCK_GLSL = /* glsl */ `
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), u.x),
          mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
      mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), u.x),
          mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
      u.z);
  }
  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = p * 2.07 + 13.7;
      a *= 0.5;
    }
    return v;
  }
  // Screen-space bump (same maths as three's perturbNormalArb).
  vec3 perturbRock(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDir) {
    vec3 sigmaX = normalize(dFdx(surfPos));
    vec3 sigmaY = normalize(dFdy(surfPos));
    vec3 r1 = cross(sigmaY, surfNorm);
    vec3 r2 = cross(surfNorm, sigmaX);
    float det = dot(sigmaX, r1) * faceDir;
    vec3 grad = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
    return normalize(abs(det) * surfNorm - grad);
  }
`;

/**
 * Coal / obsidian: fractured planes with a gritty micro-relief (continuous bump),
 * occluded cavities (vertex colours), sparse polished specks, and silver dust —
 * tiny metal flecks (dense where chrome spattered near the seam, `aDust`, rare
 * elsewhere), each tilted its own way so they flash one by one as the stone turns.
 * `smooth`: clean satin facets — no bump, mottling or polished specks — with only
 * a light silver dust (`dust` = share of fleck cells), so the small background
 * shards keep a faint shimmer without the strong ripple.
 */
export function createObsidianMaterial({ grain = 1, vertexColors = false, smooth = false, dust = 0 } = {}) {
  const uniforms = {
    uGrain: { value: grain },
    uBump: { value: 4.5 },
    uDust: { value: dust },
    uRot: { value: new THREE.Matrix3() }, // object → world rotation, keeps fleck glints glued to the stone
  };
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x101012,
    metalness: 0.5,
    roughness: 0.4,
    vertexColors,
  });
  if (smooth) material.defines = { ...material.defines, SMOOTH: "" };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aDust;\nvarying vec3 vObjPos;\nvarying float vDust;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;\nvDust = aDust;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vObjPos;
        varying float vDust;
        uniform float uGrain;
        uniform float uBump;
        uniform float uDust;
        uniform mat3 uRot;
        ${ROCK_GLSL}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        vec3 rockP = vObjPos * uGrain;
        #ifdef SMOOTH
          float relief = 0.5; // even surface: no mottling to swim as the shard turns
        #else
          float relief = fbm3(rockP * 9.0) * 0.45 + fbm3(rockP * 30.0 + 5.0) * 0.35 + vnoise(rockP * 95.0) * 0.2;
        #endif
        float tone = fbm3(rockP * 2.2 + 11.0);
        // mottled, faintly warm coal
        diffuseColor.rgb *= (0.72 + 0.56 * relief) * mix(vec3(0.92, 0.9, 0.88), vec3(1.06, 1.03, 1.0), tone);
        #ifdef SMOOTH
          float glint = 0.0;
          float dustShare = uDust;                    // the shards: a light dust only
        #else
          // sparse, soft-edged polished specks (no hard cells → no square artefacts)
          float glint = smoothstep(0.86, 0.95, vnoise(rockP * 70.0 + 3.0)) * smoothstep(0.3, 0.6, tone);
          float dustShare = mix(0.005, 0.14, vDust);  // a light dust: rare on bare rock, denser by the seam
        #endif

        // silver dust: round flecks (anti-aliased), one per occupied 3D cell
        vec3 dustP = vObjPos * 62.0;
        vec3 dustCell = floor(dustP);
        vec3 dustRnd = hash33(dustCell);
        float dustD = length(fract(dustP) - (0.25 + 0.5 * dustRnd));
        float dustR = mix(0.17, 0.3, hash13(dustCell + 4.1));
        float dustAA = fwidth(dustD);
        float fleck = (1.0 - smoothstep(dustR - dustAA, dustR + dustAA, dustD))
                    * step(1.0 - dustShare, dustRnd.z);
        #ifdef SMOOTH
          float flake = 0.0;
          vec3 flakeCell = vec3(0.0);
        #else
        // a few larger flakes, only in the spatter zone around the seam
        vec3 flakeP = vObjPos * 23.0 + 13.0;
        vec3 flakeCell = floor(flakeP);
        vec3 flakeRnd = hash33(flakeCell);
        float flakeD = length(fract(flakeP) - (0.3 + 0.4 * flakeRnd));
        float flakeAA = fwidth(flakeD);
        float flake = (1.0 - smoothstep(0.15 - flakeAA, 0.15 + flakeAA, flakeD))
                    * step(1.0 - vDust * 0.12, flakeRnd.z);
        #endif
        float silverDust = max(fleck, flake);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.85, 0.82), silverDust);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor + (relief - 0.5) * 0.35, 0.1, glint);
        roughnessFactor = mix(roughnessFactor, 0.28, silverDust);   // satin metal: reads silver, not black mirror
        #ifdef SMOOTH
        roughnessFactor = mix(0.6, 0.28, silverDust); // soft, broad highlights: the facets don't flicker as the shard turns
        #endif`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor, 1.0, silverDust);`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        #ifndef SMOOTH
        normal = perturbRock(-vViewPosition, normal, vec2(dFdx(relief), dFdy(relief)) * uBump, faceDirection);
        #endif
        // every fleck sits at its own small angle → they flash one by one. The
        // tilt is all-or-nothing per fleck so its anti-aliased rim doesn't ring.
        vec3 dustTilt = mix(hash33(dustCell + 9.3), hash33(flakeCell + 2.7), flake) * 2.0 - 1.0;
        normal = normalize(normal + mat3(viewMatrix) * (uRot * dustTilt) * 0.3 * step(0.5, silverDust));`,
      );
  };
  return { material, uniforms };
}

/** Studio for the chrome: softboxes that fall off toward their edges, on near-black — so the
    liquid metal reflects soft graded light, not flat white patches. */
export function createChromeEnvironment(renderer: THREE.WebGLRenderer, tints: ChromeLight) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x070707);
  const geo = new THREE.PlaneGeometry(1, 1);
  const falloff = (kind: "radial" | "strip") => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = kind === 'radial'
      ? ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      : ctx.createLinearGradient(0, 0, 128, 0);
    if (kind === 'radial') {
      g.addColorStop(0, '#fff'); g.addColorStop(0.45, '#9a9a9a'); g.addColorStop(1, '#000');
    } else {
      g.addColorStop(0, '#000'); g.addColorStop(0.3, '#8a8a8a'); g.addColorStop(0.5, '#fff'); g.addColorStop(0.7, '#8a8a8a'); g.addColorStop(1, '#000');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const maps = { radial: falloff('radial'), strip: falloff('strip') };
  const panel = (w: number, h: number, position: THREE.Vector3, intensity: number, tint: THREE.ColorRepresentation = 0xffffff, map: THREE.Texture | null = null) => {
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), map, side: THREE.DoubleSide }),
    );
    mesh.scale.set(w, h, 1);
    mesh.position.copy(position);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(8, 4, new THREE.Vector3(0, 7, 1), 2.0, 0xfff8ef, maps.radial);         // overhead softbox
  panel(3, 9, new THREE.Vector3(-7, 0, 2), 1.2, 0xfff3e6, maps.strip);          // warm left strip
  panel(1.2, 9, new THREE.Vector3(7, 0, 0), 4.0, tints.strip, maps.strip);      // hard strip (cool, or lime)
  panel(10, 3, new THREE.Vector3(0, -1, -7), tints.backIntensity, tints.back); // back fill: edges the seam
  panel(6, 2, new THREE.Vector3(1, -6, 4), 0.18);                               // dim floor bounce

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  geo.dispose();
  Object.values(maps).forEach((m) => m.dispose());
  env.traverse((o) => ((o as THREE.Mesh).material as THREE.Material | undefined)?.dispose());
  return texture;
}

export function createSilverMaterial() {
  const uniforms = { uTime: { value: 0 } };
  // Black liquid metal: a dark, slightly soft metal under a clear wet coat — the coat carries
  // the crisp highlights, the metal below gives them a soft dark body (no flat white patches)
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x6f6d6a,
    metalness: 1,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
  // The seam slowly breathes, so reflections flow like liquid metal.
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aVein;\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float flow = sin(dot(position, vec3(3.1, 4.3, 2.7)) + uTime * 1.3) * 0.5
                   + sin(dot(position, vec3(-5.2, 2.1, 4.4)) - uTime * 0.9) * 0.5;
        transformed += normal * flow * aVein * 0.018;`,
      );
  };
  return { material, uniforms };
}
