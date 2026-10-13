/*
 * The AI page's first screen: the main page's stone, live in 3D, far behind the title (owner, 2026-10-12: «как 3D-объект,
 * как на главной, только он сзади»). A trimmed copy of the main page's js/stone.js (the shape) and js/scene.js (the
 * obsidian and chrome materials, the studio light, the slow sway and the pointer tilt): no orbit ribbon, no shards, no
 * page journey. The main page's files are never imported or changed; three.js is the site's own copy in /vendor/three/.
 *
 * It runs only while it can be seen: the loop stops when the first screen is covered (block 2 slides over it), off
 * screen and in a hidden tab, and it never starts with reduced motion (the still picture stays, img/ai/lock-stone.webp).
 * Until the first frame is drawn the still holds its place, then the two cross-fade.
 */
import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeVertices, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const FOV = 28;
const CAMERA_Z = 11;
const VIS_H = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const STONE_EXTENT = 3.1; // world height of the stone at scale 1
const REST_TILT = 0.62; // the main page's diagonal pose
const SEAM_FACING = Math.atan2(0.45, 1); // the chrome seam runs down the face
const SWAY = 0.6; // rad, slow product-shot sway around that pose
const STONE_SHARE = 0.68; // the stone's height as a share of the canvas (room left for the sway and tilt)
const COARSE = window.matchMedia('(pointer: coarse)').matches;

const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));

/* ---------- the shape (js/stone.js, the hero stone only) ---------- */

function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomDirection(random) {
  const z = random() * 2 - 1;
  const a = random() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), z);
}

// a chipped stone: the intersection of random half-spaces (large flat facets, crisp edges)
function createHull(random, count, minDist, maxDist) {
  const CAP = 1.15;
  const planes = Array.from({ length: count }, () => ({ n: randomDirection(random), d: minDist + random() * (maxDist - minDist) }));
  return {
    radius(u) {
      let r = CAP;
      for (const p of planes) {
        const c = u.dot(p.n);
        if (c > 1e-4) r = Math.min(r, p.d / c);
      }
      return r;
    },
    softRadius(u, k) {
      let sum = Math.exp(-CAP / k);
      for (const p of planes) {
        const c = u.dot(p.n);
        if (c > 1e-4) sum += Math.exp(-p.d / c / k);
      }
      return -k * Math.log(sum);
    },
  };
}

// 0..1 profile of the silver seam (1 = the groove's centre); `spread` widens it for the spattered dust
function createVein(noise) {
  const main = new THREE.Vector3(1, 0.1, 0.45).normalize();
  const branch = new THREE.Vector3(0.25, 0.62, -0.74).normalize();
  const trough = (s, w) => {
    const t = Math.abs(s) / w;
    return t >= 1 ? 0 : 1 - t * t * t * t;
  };
  return (u, spread = 1) => {
    const warp = noise.noise3d(u.x * 1.7 + 3.1, u.y * 1.7, u.z * 1.7) * 0.17;
    const width = 0.2 + 0.07 * noise.noise3d(u.x * 2.3, u.y * 2.3 + 7.7, u.z * 2.3) + 0.03 * noise.noise3d(u.x * 9, u.y * 9 - 4.2, u.z * 9);
    const seam = trough(u.dot(main) + warp, width * spread);
    const gate = THREE.MathUtils.smoothstep(u.y, 0.05, 0.4);
    const tributary = trough(u.dot(branch) + warp * 0.7, 0.07 * spread) * gate * 0.9;
    return Math.max(seam, tributary);
  };
}

// coal breaks into blocks; the borders between them become cracks
function createBlocks(random, count) {
  const seeds = Array.from({ length: count }, () => ({ n: randomDirection(random), offset: -0.07 + random() * 0.09 }));
  return (u) => {
    let d1 = -2;
    let d2 = -2;
    let nearest = seeds[0];
    for (const seed of seeds) {
      const d = u.dot(seed.n);
      if (d > d1) {
        d2 = d1;
        d1 = d;
        nearest = seed;
      } else if (d > d2) {
        d2 = d;
      }
    }
    return { offset: nearest.offset, crack: 1 - THREE.MathUtils.smoothstep(d1 - d2, 0, 0.035) };
  };
}

function createStoneGeometries({ seed = 11, detail = 36, coreDetail = 28, planes = 22, stretch = [0.84, 1.6, 0.88] } = {}) {
  const random = mulberry32(seed);
  const noise = new SimplexNoise({ random });
  const hull = createHull(random, planes, 0.7, 1.0);
  const blocks = createBlocks(random, 20);
  const vein = createVein(noise);
  const layer = new THREE.Vector3(0.3, 1, 0.2).normalize();
  const [sx, sy, sz] = stretch;
  const u = new THREE.Vector3();

  const rock = new THREE.IcosahedronGeometry(1, detail);
  rock.deleteAttribute('uv');
  const rp = rock.attributes.position;
  const ao = new Float32Array(rp.count * 3);
  const dust = new Float32Array(rp.count);
  for (let i = 0; i < rp.count; i++) {
    u.fromBufferAttribute(rp, i).normalize();
    const { offset, crack } = blocks(u);
    const k = vein(u);
    const step = (u.dot(layer) * 5 + noise.noise3d(u.x * 2, u.y * 2, u.z * 2) * 0.35) % 1;
    const ledge = THREE.MathUtils.smoothstep((step + 1) % 1, 0.8, 1) * 0.012;
    const warp = 1 + noise.noise3d(u.x * 2.2, u.y * 2.2, u.z * 2.2) * 0.014;
    const r = hull.radius(u) * (1 + offset) * (1 - 0.045 * crack) * (1 - ledge) * warp * (1 - 0.26 * k);
    rp.setXYZ(i, u.x * r * sx, u.y * r * sy, u.z * r * sz);
    const occlusion = Math.max(0.18, (1 - 0.55 * crack) * (1 - 0.8 * k) * (1 - ledge * 10));
    ao[i * 3] = ao[i * 3 + 1] = ao[i * 3 + 2] = occlusion;
    dust[i] = vein(u, 1.9);
  }
  rock.setAttribute('color', new THREE.BufferAttribute(ao, 3));
  rock.setAttribute('aDust', new THREE.BufferAttribute(dust, 1));
  const shell = toCreasedNormals(rock, THREE.MathUtils.degToRad(32));

  let core = new THREE.IcosahedronGeometry(1, coreDetail);
  core.deleteAttribute('normal');
  core.deleteAttribute('uv');
  core = mergeVertices(core);
  const cp = core.attributes.position;
  const veinAttr = new Float32Array(cp.count);
  for (let i = 0; i < cp.count; i++) {
    u.fromBufferAttribute(cp, i).normalize();
    const k = vein(u);
    const bulge = 1 + k * noise.noise3d(u.x * 3.2 + 9, u.y * 1.4, u.z * 3.2) * 0.04;
    const r = hull.softRadius(u, 0.05) * (0.84 + 0.18 * k) * bulge;
    veinAttr[i] = k;
    cp.setXYZ(i, u.x * r * sx, u.y * r * sy, u.z * r * sz);
  }
  core.setAttribute('aVein', new THREE.BufferAttribute(veinAttr, 1));
  core.computeVertexNormals();
  return { rock: shell, core };
}

/* ---------- the light and the materials (js/scene.js) ---------- */

function studio(renderer, panels, background) {
  const env = new THREE.Scene();
  if (background != null) env.background = new THREE.Color(background);
  const geo = new THREE.PlaneGeometry(1, 1);
  for (const [w, h, [x, y, z], intensity, tint = 0xffffff] of panels) {
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    mesh.scale.set(w, h, 1);
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, background != null ? 0.02 : 0.035).texture;
  pmrem.dispose();
  geo.dispose();
  env.traverse((o) => o.material?.dispose());
  return texture;
}

// a dark studio: a few soft boxes on black → crisp, travelling highlights
const STUDIO = [
  [7, 2.2, [-1, 6, 2], 3.2],
  [1.2, 7, [-6, 1, 3], 4.0, 0xfff6ec],
  [0.8, 6, [6, 0, -2], 3.0, 0xdfe6ff],
  [3, 1, [2, -5, 4], 0.8],
];
// a brighter one for the chrome, so the seam reads as liquid metal
const CHROME = [
  [12, 6, [0, 7, 1], 2.4, 0xfff8ef],
  [4, 10, [-7, 0, 2], 1.6, 0xfff3e6],
  [1.2, 9, [7, 0, 0], 4.0, 0xe8eeff],
  [10, 3, [0, -1, -7], 0.5],
  [6, 2, [1, -6, 4], 0.18],
];

const ROCK_GLSL = /* glsl */ `
  float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  vec3 hash33(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), u.x), mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
      mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), u.x), mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
      u.z);
  }
  float fbm3(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.07 + 13.7; a *= 0.5; } return v; }
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

// coal / obsidian: gritty relief, occluded cavities, polished specks and silver dust that flashes as the stone turns
function createObsidianMaterial() {
  const uniforms = { uGrain: { value: 1 }, uBump: { value: 4.5 }, uRot: { value: new THREE.Matrix3() } };
  const material = new THREE.MeshPhysicalMaterial({ color: 0x101012, metalness: 0.5, roughness: 0.4, vertexColors: true });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aDust;\nvarying vec3 vObjPos;\nvarying float vDust;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;\nvDust = aDust;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vObjPos;\nvarying float vDust;\nuniform float uGrain;\nuniform float uBump;\nuniform mat3 uRot;\n${ROCK_GLSL}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        vec3 rockP = vObjPos * uGrain;
        float relief = fbm3(rockP * 9.0) * 0.45 + fbm3(rockP * 30.0 + 5.0) * 0.35 + vnoise(rockP * 95.0) * 0.2;
        float tone = fbm3(rockP * 2.2 + 11.0);
        diffuseColor.rgb *= (0.72 + 0.56 * relief) * mix(vec3(0.92, 0.9, 0.88), vec3(1.06, 1.03, 1.0), tone);
        float glint = smoothstep(0.78, 0.9, vnoise(rockP * 70.0 + 3.0)) * smoothstep(0.3, 0.6, tone);
        vec3 dustP = vObjPos * 62.0;
        vec3 dustCell = floor(dustP);
        vec3 dustRnd = hash33(dustCell);
        float dustD = length(fract(dustP) - (0.25 + 0.5 * dustRnd));
        float dustR = mix(0.17, 0.3, hash13(dustCell + 4.1));
        float dustAA = fwidth(dustD);
        float fleck = (1.0 - smoothstep(dustR - dustAA, dustR + dustAA, dustD)) * step(1.0 - mix(0.02, 0.55, vDust), dustRnd.z);
        vec3 flakeP = vObjPos * 23.0 + 13.0;
        vec3 flakeCell = floor(flakeP);
        vec3 flakeRnd = hash33(flakeCell);
        float flakeD = length(fract(flakeP) - (0.3 + 0.4 * flakeRnd));
        float flakeAA = fwidth(flakeD);
        float flake = (1.0 - smoothstep(0.15 - flakeAA, 0.15 + flakeAA, flakeD)) * step(1.0 - vDust * 0.45, flakeRnd.z);
        float silverDust = max(fleck, flake);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.85, 0.82), silverDust);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor + (relief - 0.5) * 0.35, 0.1, glint);
        roughnessFactor = mix(roughnessFactor, 0.28, silverDust);`,
      )
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 1.0, silverDust);')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        normal = perturbRock(-vViewPosition, normal, vec2(dFdx(relief), dFdy(relief)) * uBump, faceDirection);
        vec3 dustTilt = mix(hash33(dustCell + 9.3), hash33(flakeCell + 2.7), flake) * 2.0 - 1.0;
        normal = normalize(normal + mat3(viewMatrix) * (uRot * dustTilt) * 0.3 * step(0.5, silverDust));`,
      );
  };
  return { material, uniforms };
}

// the chrome seam: it slowly breathes, so reflections flow like liquid metal
function createSilverMaterial() {
  const uniforms = { uTime: { value: 0 } };
  const material = new THREE.MeshPhysicalMaterial({ color: 0xe9e5dd, metalness: 1, roughness: 0.06 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aVein;\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float flow = sin(dot(position, vec3(3.1, 4.3, 2.7)) + uTime * 1.3) * 0.5 + sin(dot(position, vec3(-5.2, 2.1, 4.4)) - uTime * 0.9) * 0.5;
        transformed += normal * flow * aVein * 0.018;`,
      );
  };
  return { material, uniforms };
}

/* ---------- the stone on the page ---------- */

/**
 * @param {{ host: HTMLElement, still: HTMLImageElement | null, cover: Element | null }} options
 *   host: the box the stone stands in (its canvas goes there); still: the picture shown until the first frame;
 *   cover: the block that slides over the first screen (the loop stops once it covers the stone)
 * @returns {boolean} false when WebGL is not there (the still stays)
 */
export function initStone({ host, still, cover }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'ai-hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 2));
  renderer.debug.checkShaderErrors = false;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.append(canvas);

  const scene = new THREE.Scene();
  scene.environment = studio(renderer, STUDIO);
  scene.environmentIntensity = 0;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);
  const key = new THREE.DirectionalLight(0xfff2e2, 0);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0xd6defa, 0);
  rim.position.set(4, 1.5, -3);
  const top = new THREE.DirectionalLight(0xffffff, 0);
  top.position.set(1, 6, 1);
  scene.add(key, rim, top);

  const { rock, core } = createStoneGeometries({ detail: COARSE ? 26 : 36, coreDetail: COARSE ? 20 : 28 });
  const obsidian = createObsidianMaterial();
  const silver = createSilverMaterial();
  silver.material.envMap = studio(renderer, CHROME, 0x0b0b0b);
  const stage = new THREE.Group(); // place, scale, float
  const tilt = new THREE.Group(); // the resting diagonal + the pointer's tilt
  const spin = new THREE.Group(); // the slow sway
  const rockMesh = new THREE.Mesh(rock, obsidian.material);
  const coreMesh = new THREE.Mesh(core, silver.material);
  spin.add(rockMesh, coreMesh);
  tilt.add(spin);
  stage.add(tilt);
  scene.add(stage);
  const rotMatrix = new THREE.Matrix4();

  let size = 0;
  const layout = () => {
    const next = Math.round(canvas.clientWidth);
    if (!next || next === size) return;
    size = next;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    stage.scale.setScalar((STONE_SHARE * VIS_H) / STONE_EXTENT);
  };

  // the pointer turns the stone a little (fine pointers only), as on the main page
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!COARSE) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    }, { passive: true });
  }

  let time = 0;
  let envClock = 0;
  let reveal = 0; // the light comes up on the stone once, as it turns into its pose
  const scale = (STONE_SHARE * VIS_H) / STONE_EXTENT;
  function update(dt) {
    reveal = Math.min(1, reveal + dt / 1.6);
    const intro = 1 - (1 - reveal) ** 3;
    pointer.x = damp(pointer.x, pointer.tx, 2.6, dt);
    pointer.y = damp(pointer.y, pointer.ty, 2.6, dt);
    spin.rotation.y = SEAM_FACING + Math.sin(time * 0.19) * SWAY - (1 - intro) * 1.6;
    spin.rotation.x = Math.sin(time * 0.23) * 0.08;
    tilt.rotation.set(pointer.y * 0.16, pointer.x * 0.26, REST_TILT - pointer.x * 0.04);
    stage.position.set(pointer.x * 0.1, -pointer.y * 0.07 + Math.sin(time * 0.7) * 0.05 - (1 - intro) * 0.3, 0);
    stage.scale.setScalar(scale * (0.9 + 0.1 * intro));
    envClock += dt;
    scene.environmentIntensity = intro;
    scene.environmentRotation.y = envClock * 0.05 + pointer.x * 0.35;
    silver.material.envMapIntensity = 0.85 * intro;
    silver.material.envMapRotation.copy(scene.environmentRotation);
    key.intensity = 3.0 * intro;
    rim.intensity = 2.6 * intro;
    top.intensity = 1.6 * intro;
    key.position.set(-3 + pointer.x * 2.5, 4 - pointer.y * 1.5, 5);
    silver.uniforms.uTime.value = time;
    rockMesh.updateWorldMatrix(true, false);
    obsidian.uniforms.uRot.value.setFromMatrix4(rotMatrix.extractRotation(rockMesh.matrixWorld));
  }

  // the loop: only while the stone can be seen
  let inView = true;
  let covered = false;
  let raf = 0;
  let last = 0;
  let shown = false;
  const running = () => inView && !covered && !document.hidden;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    time += dt;
    layout();
    update(dt);
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      // the live stone takes over from the still
      canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease-out', fill: 'backwards' });
      still?.animate([{ opacity: getComputedStyle(still).opacity }, { opacity: 0 }], { duration: 900, easing: 'ease-out', fill: 'forwards' });
      host.classList.add('is-live');
    }
    if (running()) raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (raf || !running()) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  new IntersectionObserver((entries) => {
    inView = entries[entries.length - 1].isIntersecting;
    wake();
  }).observe(host);
  // block 2 slides over the first screen: once its top is within the screen's top tenth (or it has passed), the stone
  // under it is hidden
  if (cover) {
    new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      covered = entry.isIntersecting || entry.boundingClientRect.bottom < 0;
      wake();
    }, { rootMargin: '0px 0px -90% 0px' }).observe(cover);
  }
  document.addEventListener('visibilitychange', wake);
  new ResizeObserver(() => { layout(); wake(); }).observe(canvas);

  // the shaders compile in the background first, so the first frame doesn't stall the page
  const start = () => wake();
  if (typeof renderer.compileAsync === 'function') renderer.compileAsync(scene, camera).then(start, start);
  else start();
  return true;
}
