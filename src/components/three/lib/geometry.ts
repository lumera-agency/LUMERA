/*
 * The stone's geometry (pure functions, no React): a knapped, fractured coal shell with a groove
 * along a seam, and a smooth inner core that fills the groove as liquid chrome; plus small shards.
 * Deterministic: the same seed always gives the same stone.
 */
import * as THREE from "three";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

export function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Random = () => number;

function randomDirection(random: Random) {
  const z = random() * 2 - 1;
  const a = random() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), z);
}

/** A chipped stone is the intersection of random half-spaces: a ray from the centre along `u`
 *  leaves the hull at min(d / (u·n)) — large flat facets with crisp edges, like knapped flint. */
function createHull(random: Random, count: number, minDist: number, maxDist: number) {
  const CAP = 1.15;
  const planes = Array.from({ length: count }, () => ({ n: randomDirection(random), d: minDist + random() * (maxDist - minDist) }));
  return {
    radius(u: THREE.Vector3) {
      let r = CAP;
      for (const p of planes) {
        const c = u.dot(p.n);
        if (c > 1e-4) r = Math.min(r, p.d / c);
      }
      return r;
    },
    /** smooth minimum of the same planes — a rounded hull for the liquid core */
    softRadius(u: THREE.Vector3, k: number) {
      let sum = Math.exp(-CAP / k);
      for (const p of planes) {
        const c = u.dot(p.n);
        if (c > 1e-4) sum += Math.exp(-p.d / c / k);
      }
      return -k * Math.log(sum);
    },
  };
}

/** 0..1 profile of the silver seam (1 = centre of the groove); `spread` widens it (the spatter halo). */
function createVein(noise: SimplexNoise) {
  const main = new THREE.Vector3(1, 0.1, 0.45).normalize();
  const branch = new THREE.Vector3(0.25, 0.62, -0.74).normalize();
  const trough = (s: number, w: number) => {
    const t = Math.abs(s) / w;
    return t >= 1 ? 0 : 1 - t * t * t * t;
  };
  return (u: THREE.Vector3, spread = 1) => {
    const warp = noise.noise3d(u.x * 1.7 + 3.1, u.y * 1.7, u.z * 1.7) * 0.17;
    // broad width changes + a fine jagged term → broken, chipped seam edges
    const width = 0.2 + 0.07 * noise.noise3d(u.x * 2.3, u.y * 2.3 + 7.7, u.z * 2.3) + 0.03 * noise.noise3d(u.x * 9, u.y * 9 - 4.2, u.z * 9);
    const seam = trough(u.dot(main) + warp, width * spread);
    // a thin tributary that only runs across the upper half
    const gate = THREE.MathUtils.smoothstep(u.y, 0.05, 0.4);
    const tributary = trough(u.dot(branch) + warp * 0.7, 0.07 * spread) * gate * 0.9;
    return Math.max(seam, tributary);
  };
}

/** Coal breaks into blocks: the nearest of a few seed directions decides how far a block sits in
 *  or out, and the borders between blocks become cracks. */
function createBlocks(random: Random, count: number) {
  const seeds = Array.from({ length: count }, () => ({ n: randomDirection(random), offset: -0.07 + random() * 0.09 }));
  return (u: THREE.Vector3) => {
    let d1 = -2;
    let d2 = -2;
    let nearest = seeds[0];
    for (const seed of seeds) {
      const d = u.dot(seed.n);
      if (d > d1) {
        d2 = d1;
        d1 = d;
        nearest = seed;
      } else if (d > d2) d2 = d;
    }
    return { offset: nearest.offset, crack: 1 - THREE.MathUtils.smoothstep(d1 - d2, 0, 0.035) };
  };
}

/**
 * Each vertex's point among the distinct points of a geometry (the very same bits of x, y and z), numbered in the order
 * they first come: an unindexed icosphere carries every point about six times over (once per triangle round it), and
 * the stone's shape is a function of the point alone, so it is worked out once a point. Bits, not a tolerance: the
 * same point always comes out with the same bits here (checked: the shell's 82140 vertices are 13692 points, as many
 * as the sphere has), and the result is the same to the last bit as working out every vertex.
 */
function distinctPoints(position: THREE.BufferAttribute) {
  const words = new Uint32Array(position.array.buffer, position.array.byteOffset, position.count * 3);
  let size = 1024;
  while (size < position.count * 2) size *= 2;
  const slots = new Int32Array(size).fill(-1);
  const firstVertex = new Int32Array(position.count);
  const pointOf = new Int32Array(position.count);
  let points = 0;
  for (let vertex = 0; vertex < position.count; vertex++) {
    const x = words[vertex * 3];
    const y = words[vertex * 3 + 1];
    const z = words[vertex * 3 + 2];
    let slot = (Math.imul(x, 0x9e3779b1) ^ Math.imul(y, 0x85ebca77) ^ Math.imul(z, 0xc2b2ae3d)) & (size - 1);
    for (;;) {
      const point = slots[slot];
      if (point < 0) {
        slots[slot] = points;
        firstVertex[points] = vertex;
        pointOf[vertex] = points++;
        break;
      }
      const other = firstVertex[point] * 3;
      if (words[other] === x && words[other + 1] === y && words[other + 2] === z) {
        pointOf[vertex] = point;
        break;
      }
      slot = (slot + 1) & (size - 1);
    }
  }
  return { pointOf, firstVertex: firstVertex.subarray(0, points), points };
}

/** mergeVertices for a geometry with positions only, by the very same bits: the same points in the same order and the
 *  same index as three's (its rounded text keys cost most of the core's build) */
function mergeSamePoints(geometry: THREE.BufferGeometry) {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const { pointOf, firstVertex, points } = distinctPoints(position);
  const merged = new Float32Array(points * 3);
  for (let point = 0; point < points; point++) merged.set(position.array.subarray(firstVertex[point] * 3, firstVertex[point] * 3 + 3), point * 3);
  const result = new THREE.BufferGeometry();
  result.setAttribute("position", new THREE.BufferAttribute(merged, 3));
  result.setIndex(Array.from(pointOf));
  return result;
}

/** The hero stone: shell (blocks, cracks, cleavage ledges, groove) + liquid chrome core.
 *  Cavities are baked into vertex colours as occlusion; `aDust` = silver spatter density. */
/**
 * The stone's shape as it was last built (the first screen's, as a rule). The «Подход» stone is the same stone (seed
 * 11): it takes this shape rather than building it again, which held the page for 260 ms in one block as the visitor
 * scrolled towards block 5 (CPU 4x, 12 Nov 2026). A shape is kept as long as the page lives: a geometry let go of by
 * one renderer (dispose) stays whole on the processor and is sent to a graphics card again when drawn.
 */
let lastStone: { rock: THREE.BufferGeometry; core: THREE.BufferGeometry } | null = null;
export const builtStoneGeometries = () => lastStone;

export function createStoneGeometries({ seed = 11, detail = 36, coreDetail = 28, planes = 22, stretch = [0.84, 1.6, 0.88] } = {}) {
  const random = mulberry32(seed);
  const noise = new SimplexNoise({ random });
  const hull = createHull(random, planes, 0.7, 1.0);
  const blocks = createBlocks(random, 20);
  const vein = createVein(noise);
  const layer = new THREE.Vector3(0.3, 1, 0.2).normalize();
  const [sx, sy, sz] = stretch;
  const u = new THREE.Vector3();

  // non-indexed icosphere → one normal per facet before the creasing below
  const rock = new THREE.IcosahedronGeometry(1, detail);
  rock.deleteAttribute("uv");
  const rp = rock.attributes.position as THREE.BufferAttribute;
  const ao = new Float32Array(rp.count * 3);
  const dust = new Float32Array(rp.count);
  const { pointOf, firstVertex } = distinctPoints(rp);
  const shape = rp.array as Float32Array;
  for (let i = 0; i < rp.count; i++) {
    // a point already worked out: its copy (the first copy holds the result by now)
    const first = firstVertex[pointOf[i]];
    if (first !== i) {
      shape.copyWithin(i * 3, first * 3, first * 3 + 3);
      ao.copyWithin(i * 3, first * 3, first * 3 + 3);
      dust[i] = dust[first];
      continue;
    }
    u.fromBufferAttribute(rp, i).normalize();
    const { offset, crack } = blocks(u);
    const k = vein(u);
    // cleavage: shallow ledges stepping across the length of the stone
    const step = (u.dot(layer) * 5 + noise.noise3d(u.x * 2, u.y * 2, u.z * 2) * 0.35) % 1;
    const ledge = THREE.MathUtils.smoothstep((step + 1) % 1, 0.8, 1) * 0.012;
    const warp = 1 + noise.noise3d(u.x * 2.2, u.y * 2.2, u.z * 2.2) * 0.014;
    const r = hull.radius(u) * (1 + offset) * (1 - 0.045 * crack) * (1 - ledge) * warp * (1 - 0.26 * k);
    rp.setXYZ(i, u.x * r * sx, u.y * r * sy, u.z * r * sz);
    const occlusion = Math.max(0.18, (1 - 0.55 * crack) * (1 - 0.8 * k) * (1 - ledge * 10));
    ao[i * 3] = ao[i * 3 + 1] = ao[i * 3 + 2] = occlusion;
    dust[i] = vein(u, 1.9);
  }
  rock.setAttribute("color", new THREE.BufferAttribute(ao, 3));
  rock.setAttribute("aDust", new THREE.BufferAttribute(dust, 1));
  // smooth inside each fracture plane, crisp across block edges and cracks
  const shell = toCreasedNormals(rock, THREE.MathUtils.degToRad(32));

  let core: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, coreDetail);
  core.deleteAttribute("normal");
  core.deleteAttribute("uv");
  core = mergeSamePoints(core);
  const cp = core.attributes.position;
  const veinAttr = new Float32Array(cp.count);
  for (let i = 0; i < cp.count; i++) {
    u.fromBufferAttribute(cp, i).normalize();
    const k = vein(u);
    // hidden under the shell except in the groove, where it swells slightly proud of the rim
    const bulge = 1 + k * noise.noise3d(u.x * 3.2 + 9, u.y * 1.4, u.z * 3.2) * 0.04;
    const r = hull.softRadius(u, 0.05) * (0.84 + 0.18 * k) * bulge;
    veinAttr[i] = k;
    cp.setXYZ(i, u.x * r * sx, u.y * r * sy, u.z * r * sz);
  }
  core.setAttribute("aVein", new THREE.BufferAttribute(veinAttr, 1));
  core.computeVertexNormals();
  lastStone = { rock: shell, core };
  return lastStone;
}
