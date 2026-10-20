/**
 * Time-independent noise fields of the orbit morph, baked per vertex.
 *
 * The orbit morph moves every point on an ellipse D = A(p)·cosθ + B(p)·sinθ. A and B are
 * smooth random fields that never change, so evaluating them in the vertex shader every frame
 * (≈ 30 simplex calls per vertex, three times for the tangent frame) is wasted work. This
 * module evaluates them once on the CPU — same Ashima simplex as the GLSL, so the look is
 * identical — together with their gradients, which let the shader reconstruct the field at
 * the tangent neighbours by linearisation: A(p + δ) ≈ A(p) + ∇A·δ.
 */

// ---- Ashima / Stefan Gustavson 3D simplex noise, ported 1:1 from the GLSL (MIT)

function mod289(x: number): number {
  return x - Math.floor(x * (1 / 289)) * 289;
}
function permute(x: number): number {
  return mod289((x * 34 + 1) * x);
}
function taylorInvSqrt(r: number): number {
  return 1.79284291400159 - 0.85373472095314 * r;
}

function snoise(vx: number, vy: number, vz: number): number {
  const C0 = 1 / 6;
  const C1 = 1 / 3;
  // first corner
  const s = (vx + vy + vz) * C1;
  let ix = Math.floor(vx + s);
  let iy = Math.floor(vy + s);
  let iz = Math.floor(vz + s);
  const t0 = (ix + iy + iz) * C0;
  const x0x = vx - ix + t0;
  const x0y = vy - iy + t0;
  const x0z = vz - iz + t0;
  // other corners
  const gx = x0y <= x0x ? 1 : 0; // step(x0.y, x0.x)
  const gy = x0z <= x0y ? 1 : 0; // step(x0.z, x0.y)
  const gz = x0x <= x0z ? 1 : 0; // step(x0.x, x0.z)
  const lx = 1 - gx;
  const ly = 1 - gy;
  const lz = 1 - gz;
  // i1 = min(g.xyz, l.zxy); i2 = max(g.xyz, l.zxy)
  const i1x = Math.min(gx, lz);
  const i1y = Math.min(gy, lx);
  const i1z = Math.min(gz, ly);
  const i2x = Math.max(gx, lz);
  const i2y = Math.max(gy, lx);
  const i2z = Math.max(gz, ly);
  const x1x = x0x - i1x + C0;
  const x1y = x0y - i1y + C0;
  const x1z = x0z - i1z + C0;
  const x2x = x0x - i2x + C1;
  const x2y = x0y - i2y + C1;
  const x2z = x0z - i2z + C1;
  const x3x = x0x - 0.5;
  const x3y = x0y - 0.5;
  const x3z = x0z - 0.5;
  // permutations
  ix = mod289(ix);
  iy = mod289(iy);
  iz = mod289(iz);
  const pz0 = permute(iz);
  const pz1 = permute(iz + i1z);
  const pz2 = permute(iz + i2z);
  const pz3 = permute(iz + 1);
  const py0 = permute(pz0 + iy);
  const py1 = permute(pz1 + iy + i1y);
  const py2 = permute(pz2 + iy + i2y);
  const py3 = permute(pz3 + iy + 1);
  const p0 = permute(py0 + ix);
  const p1 = permute(py1 + ix + i1x);
  const p2 = permute(py2 + ix + i2x);
  const p3 = permute(py3 + ix + 1);
  // gradients: 7x7 points over a square, mapped onto an octahedron
  // GLSL: ns = n_ * D.wyz - D.xzx with D = (0, 0.5, 1, 2) → (2/7, 0.5/7 - 1, 1/7)
  const n_ = 1 / 7;
  const ns = [2 * n_, 0.5 * n_ - 1, n_];
  const grad = (p: number): [number, number, number] => {
    const j = p - 49 * Math.floor(p * ns[2] * ns[2]);
    const x_ = Math.floor(j * ns[2]);
    const y_ = Math.floor(j - 7 * x_);
    const x = x_ * ns[0] + ns[1];
    const y = y_ * ns[0] + ns[1];
    const h = 1 - Math.abs(x) - Math.abs(y);
    return [x, y, h];
  };
  const g0 = grad(p0);
  const g1 = grad(p1);
  const g2 = grad(p2);
  const g3 = grad(p3);
  // b0 = vec4(x.xy, y.xy), b1 = vec4(x.zw, y.zw); s0 = floor(b0)*2+1; sh = -step(h, 0)
  // a0 = b0.xzyw + s0.xzyw*sh.xxyy → per corner k: (x_k + s(x_k)*sh_k, y_k + s(y_k)*sh_k)
  const corner = (g: [number, number, number]): [number, number, number] => {
    const [x, y, h] = g;
    const sh = h <= 0 ? -1 : 0;
    const sx = Math.floor(x) * 2 + 1;
    const sy = Math.floor(y) * 2 + 1;
    return [x + sx * sh, y + sy * sh, h];
  };
  const c0 = corner(g0);
  const c1 = corner(g1);
  const c2 = corner(g2);
  const c3 = corner(g3);
  const norm0 = taylorInvSqrt(c0[0] * c0[0] + c0[1] * c0[1] + c0[2] * c0[2]);
  const norm1 = taylorInvSqrt(c1[0] * c1[0] + c1[1] * c1[1] + c1[2] * c1[2]);
  const norm2 = taylorInvSqrt(c2[0] * c2[0] + c2[1] * c2[1] + c2[2] * c2[2]);
  const norm3 = taylorInvSqrt(c3[0] * c3[0] + c3[1] * c3[1] + c3[2] * c3[2]);
  let m0 = Math.max(0.6 - (x0x * x0x + x0y * x0y + x0z * x0z), 0);
  let m1 = Math.max(0.6 - (x1x * x1x + x1y * x1y + x1z * x1z), 0);
  let m2 = Math.max(0.6 - (x2x * x2x + x2y * x2y + x2z * x2z), 0);
  let m3 = Math.max(0.6 - (x3x * x3x + x3y * x3y + x3z * x3z), 0);
  m0 *= m0;
  m1 *= m1;
  m2 *= m2;
  m3 *= m3;
  const d0 = (c0[0] * x0x + c0[1] * x0y + c0[2] * x0z) * norm0;
  const d1 = (c1[0] * x1x + c1[1] * x1y + c1[2] * x1z) * norm1;
  const d2 = (c2[0] * x2x + c2[1] * x2y + c2[2] * x2z) * norm2;
  const d3 = (c3[0] * x3x + c3[1] * x3y + c3[2] * x3z) * norm3;
  return 42 * (m0 * m0 * d0 + m1 * m1 * d1 + m2 * m2 * d2 + m3 * m3 * d3);
}

export type DeformFields = {
  /** per vertex: A.x, A.y, B.x, B.y (in-plane ellipse axes) */
  fieldA: Float32Array;
  /** per vertex: An, Bn (normal ellipse axes) */
  fieldN: Float32Array;
  /** per vertex: dA.x/dx, dA.x/dy, dA.y/dx, dA.y/dy — object units */
  gradA: Float32Array;
  /** per vertex: dB.x/dx, dB.x/dy, dB.y/dx, dB.y/dy */
  gradB: Float32Array;
  /** per vertex: dAn/dx, dAn/dy, dBn/dx, dBn/dy */
  gradN: Float32Array;
};

/** The six field samples at one noise-space point q (same seeds as the former GLSL). */
function sample(qx: number, qy: number): [number, number, number, number, number, number] {
  return [
    snoise(qx, qy, 1.3), // A.x
    snoise(qx + 5.1, qy + 5.1, 2.7), // A.y
    snoise(qx + 2.2, qy + 2.2, 7.9), // B.x
    snoise(qx + 8.4, qy + 8.4, 4.1), // B.y
    snoise(qx + 4.4, qy + 4.4, 6.3), // An
    snoise(qx + 7.7, qy + 7.7, 1.9), // Bn
  ];
}

/**
 * Evaluate the orbit fields for every vertex. `scale` = cell·extent (object units per noise
 * unit), `center` the body centre in object units.
 */
export function computeDeformFields(
  positions: Float32Array,
  center: readonly [number, number],
  scale: number
): DeformFields {
  const n = positions.length / 3;
  const fieldA = new Float32Array(n * 4);
  const fieldN = new Float32Array(n * 2);
  const gradA = new Float32Array(n * 4);
  const gradB = new Float32Array(n * 4);
  const gradN = new Float32Array(n * 4);
  const h = 0.6; // finite-difference step in object units (fields vary over hundreds of units)
  const inv = 1 / scale;
  for (let i = 0; i < n; i++) {
    const px = positions[3 * i] - center[0];
    const py = positions[3 * i + 1] - center[1];
    const f = sample(px * inv, py * inv);
    const fxp = sample((px + h) * inv, py * inv);
    const fxm = sample((px - h) * inv, py * inv);
    const fyp = sample(px * inv, (py + h) * inv);
    const fym = sample(px * inv, (py - h) * inv);
    const dx = (k: number) => (fxp[k] - fxm[k]) / (2 * h);
    const dy = (k: number) => (fyp[k] - fym[k]) / (2 * h);
    fieldA[4 * i] = f[0];
    fieldA[4 * i + 1] = f[1];
    fieldA[4 * i + 2] = f[2];
    fieldA[4 * i + 3] = f[3];
    fieldN[2 * i] = f[4];
    fieldN[2 * i + 1] = f[5];
    gradA[4 * i] = dx(0);
    gradA[4 * i + 1] = dy(0);
    gradA[4 * i + 2] = dx(1);
    gradA[4 * i + 3] = dy(1);
    gradB[4 * i] = dx(2);
    gradB[4 * i + 1] = dy(2);
    gradB[4 * i + 2] = dx(3);
    gradB[4 * i + 3] = dy(3);
    gradN[4 * i] = dx(4);
    gradN[4 * i + 1] = dy(4);
    gradN[4 * i + 2] = dx(5);
    gradN[4 * i + 3] = dy(5);
  }
  return { fieldA, fieldN, gradA, gradB, gradN };
}

/**
 * Local half-width of the body around every vertex, world units. The Poisson height encodes
 * it: for a strip of half-width w the solution is u = (w² − y²)/2, so √(2u) at the medial axis
 * equals w. Each vertex takes the maximum of √(2u) in a 26-unit neighbourhood (grid hash), so
 * thin arms read ≈ 20–25 while the big lobe reads ≈ 90. `scale`/`zMax` invert z = zMax·tanh(scale·√u / zMax).
 */
export function computeLocalWidth(positions: Float32Array, scale: number, zMax?: number): Float32Array {
  const n = positions.length / 3;
  const hw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const z = Math.abs(positions[3 * i + 2]);
    let su = z; // scale·√u
    if (zMax) {
      const t = Math.min(z / zMax, 0.999);
      su = zMax * Math.atanh(t);
    }
    hw[i] = Math.SQRT2 * (su / scale);
  }
  // grid hash, cell = radius (just over an arm's half-width, so arm rims see their own axis)
  const R = 26;
  let minX = Infinity,
    minY = Infinity;
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, positions[3 * i]);
    minY = Math.min(minY, positions[3 * i + 1]);
  }
  const key = (i: number) => {
    const cx = Math.floor((positions[3 * i] - minX) / R);
    const cy = Math.floor((positions[3 * i + 1] - minY) / R);
    return cx * 100003 + cy;
  };
  const bins = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const k = key(i);
    const b = bins.get(k);
    if (b) b.push(i);
    else bins.set(k, [i]);
  }
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const cx = Math.floor((positions[3 * i] - minX) / R);
    const cy = Math.floor((positions[3 * i + 1] - minY) / R);
    let best = hw[i];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const b = bins.get((cx + dx) * 100003 + (cy + dy));
        if (!b) continue;
        for (const j of b) {
          const ex = positions[3 * j] - positions[3 * i];
          const ey = positions[3 * j + 1] - positions[3 * i + 1];
          if (ex * ex + ey * ey <= R * R && hw[j] > best) best = hw[j];
        }
      }
    }
    out[i] = best;
  }
  return out;
}

/**
 * Distance of every vertex (xy) to the OUTER ring of the contour only, world units — lets the
 * shader tell the silhouette's edge (keep it crisp) from the rims of the holes (where the
 * photo's fine ripples sit and smoothing is wanted).
 */
export function computeOuterDistance(
  positions: Float32Array,
  outer: ReadonlyArray<readonly [number, number]>,
  origin: readonly [number, number]
): Float32Array {
  const m = outer.length;
  const ax = new Float64Array(m), ay = new Float64Array(m), dx = new Float64Array(m), dy = new Float64Array(m), il = new Float64Array(m);
  for (let i = 0; i < m; i++) {
    const a = outer[i];
    const b = outer[(i + 1) % m];
    ax[i] = a[0] - origin[0];
    ay[i] = origin[1] - a[1];
    dx[i] = b[0] - a[0];
    dy[i] = -(b[1] - a[1]);
    const l2 = dx[i] * dx[i] + dy[i] * dy[i];
    il[i] = l2 > 0 ? 1 / l2 : 0;
  }
  const n = positions.length / 3;
  const out = new Float32Array(n);
  for (let v = 0; v < n; v++) {
    const px = positions[3 * v];
    const py = positions[3 * v + 1];
    let best = Infinity;
    for (let i = 0; i < m; i++) {
      let t = ((px - ax[i]) * dx[i] + (py - ay[i]) * dy[i]) * il[i];
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = px - (ax[i] + t * dx[i]);
      const ey = py - (ay[i] + t * dy[i]);
      const d2 = ex * ex + ey * ey;
      if (d2 < best) best = d2;
    }
    out[v] = Math.sqrt(best);
  }
  return out;
}
