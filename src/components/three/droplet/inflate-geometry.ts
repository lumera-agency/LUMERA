/**
 * Inflate a 2D silhouette (outer ring + holes) into a closed, soft, organically rounded 3D
 * body whose front projection is *exactly* the silhouette.
 *
 * Why not ExtrudeGeometry: a bevel either grows the outline (bevelSize) or, with a negative
 * bevelOffset, offsets the polygon per vertex — which self-intersects wherever the band is
 * narrower than the bevel, and gives every part of the shape the same rounding regardless of
 * its width. Why not height = f(distance to edge): the distance field has a crease along the
 * medial axis of every band, so a chrome surface shows a ridge line down each arm.
 *
 * Instead the body is inflated the way Teddy / Monster Mash inflate sketches: solve the
 * Poisson problem Δu = −1 inside the contour with u = 0 on it, then z = scale·√u. The solution
 * is smooth everywhere (no medial ridges), meets the rim with a vertical tangent (a true round
 * edge), gives strips a circular-ish section (height ∝ width) and lobes a soft cushion.
 *
 * Pipeline (world units = viewBox units, y up):
 *   1. signed distance field + gradient on a regular grid (exact point–segment distance,
 *      even-odd inside test);
 *   2. Poisson solve (SOR) on the interior nodes with Shortley–Weller boundary distances,
 *      so the rim sits on the true contour, not on the grid staircase;
 *   3. marching squares over the field: interior nodes → vertices with z = scale·√u and
 *      normals from the discrete gradient; iso-crossings → rim vertices snapped onto the
 *      polygon (z = 0, horizontal normal), shared by the mirrored back surface.
 *
 * Pure TypeScript, no three.js import — the result plugs into a BufferGeometry.
 */

import type { Contour2D } from "./form-contour";

export type InflateOptions = {
  /** Grid cell size in contour units. Cost ∝ 1/cell². 2–3 is plenty for a ~500-unit shape. */
  cell: number;
  /** Height scale: z = scale·√u. √2 gives strips a circular section; ~1.25 slightly flatter. */
  scale: number;
  /** Optional soft cap on the half-depth (C∞, tanh). */
  zMax?: number;
  /** Build only the region at least `inset` units inside the contour. Default 0. */
  inset?: number;
  /** Contour point (viewBox units, y down) that maps to the world origin. */
  origin: readonly [number, number];
};

export type InflatedMesh = {
  positions: Float32Array;
  normals: Float32Array;
  /** Per-vertex distance from the body's own rim (0 on the rim), contour units. */
  dist: Float32Array;
  indices: Uint32Array;
  vertexCount: number;
  triangleCount: number;
  bounds: { min: [number, number, number]; max: [number, number, number] };
  /** Poisson solver diagnostics. */
  solve: { iterations: number; residual: number };
};

type Segments = {
  ax: Float64Array;
  ay: Float64Array;
  bx: Float64Array;
  by: Float64Array;
  dx: Float64Array;
  dy: Float64Array;
  invLen2: Float64Array;
  count: number;
};

/** Contour rings → flat segment arrays in world space (x right, y up, origin at `origin`). */
function toSegments(contour: Contour2D, origin: readonly [number, number]): Segments {
  const rings = [contour.outer, ...contour.holes];
  const count = rings.reduce((n, r) => n + r.length, 0);
  const s: Segments = {
    ax: new Float64Array(count),
    ay: new Float64Array(count),
    bx: new Float64Array(count),
    by: new Float64Array(count),
    dx: new Float64Array(count),
    dy: new Float64Array(count),
    invLen2: new Float64Array(count),
    count,
  };
  let k = 0;
  for (const ring of rings) {
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % n];
      s.ax[k] = a[0] - origin[0];
      s.ay[k] = origin[1] - a[1];
      s.bx[k] = b[0] - origin[0];
      s.by[k] = origin[1] - b[1];
      s.dx[k] = s.bx[k] - s.ax[k];
      s.dy[k] = s.by[k] - s.ay[k];
      const len2 = s.dx[k] * s.dx[k] + s.dy[k] * s.dy[k];
      s.invLen2[k] = len2 > 0 ? 1 / len2 : 0;
      k++;
    }
  }
  return s;
}

/** Closest point on the contour to (px, py). Writes [qx, qy] into `out`, returns the distance. */
function closestPoint(s: Segments, px: number, py: number, out: Float64Array): number {
  let best = Infinity;
  for (let k = 0; k < s.count; k++) {
    let t = ((px - s.ax[k]) * s.dx[k] + (py - s.ay[k]) * s.dy[k]) * s.invLen2[k];
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = s.ax[k] + t * s.dx[k];
    const qy = s.ay[k] + t * s.dy[k];
    const ex = px - qx;
    const ey = py - qy;
    const d2 = ex * ex + ey * ey;
    if (d2 < best) {
      best = d2;
      out[0] = qx;
      out[1] = qy;
    }
  }
  return Math.sqrt(best);
}

/** Even-odd ray cast (+x) — true when (px, py) is inside the outer ring and outside the holes. */
function isInside(s: Segments, px: number, py: number): boolean {
  let inside = false;
  for (let k = 0; k < s.count; k++) {
    const ay = s.ay[k];
    const by = s.by[k];
    if (ay > py !== by > py) {
      const x = s.ax[k] + ((py - ay) * s.dx[k]) / (by - ay);
      if (px < x) inside = !inside;
    }
  }
  return inside;
}

/** Boundary fraction along a grid edge from inside node a (F > 0) to outside node b (F ≤ 0). */
function theta(fa: number, fb: number): number {
  const t = fa / (fa - fb);
  return t < 0.05 ? 0.05 : t;
}

/**
 * Poisson inflation on the interior nodes: −Δu = 1, u = 0 on the contour. Successive
 * over-relaxation with Shortley–Weller stencils (neighbour distance = θ·cell where the edge
 * crosses the contour). Returns u (0 outside) and the solver diagnostics.
 */
function solvePoisson(F: Float64Array, nx: number, ny: number, cell: number) {
  const nodeCount = nx * ny;
  const u = new Float64Array(nodeCount);
  // compact interior list
  const interior: number[] = [];
  for (let n = 0; n < nodeCount; n++) if (F[n] > 0) interior.push(n);
  const m = interior.length;
  const nb = new Int32Array(m * 4); // interior neighbour node ids (or -1 = Dirichlet 0)
  const cw = new Float64Array(m * 4); // stencil weights
  const inv0 = new Float64Array(m); // 1 / centre coefficient
  const off = [-1, 1, -nx, nx];
  for (let q = 0; q < m; q++) {
    const n = interior[q];
    const h = [cell, cell, cell, cell];
    for (let k = 0; k < 4; k++) {
      const j = n + off[k];
      const i = n % nx;
      const edge = (k === 0 && i === 0) || (k === 1 && i === nx - 1) || j < 0 || j >= nodeCount;
      if (edge || F[j] <= 0) {
        nb[q * 4 + k] = -1;
        h[k] = edge ? cell : cell * theta(F[n], F[j]);
      } else {
        nb[q * 4 + k] = j;
      }
    }
    const ax = 2 / (h[0] + h[1]);
    const ay = 2 / (h[2] + h[3]);
    cw[q * 4] = ax / h[0];
    cw[q * 4 + 1] = ax / h[1];
    cw[q * 4 + 2] = ay / h[2];
    cw[q * 4 + 3] = ay / h[3];
    inv0[q] = 1 / (cw[q * 4] + cw[q * 4 + 1] + cw[q * 4 + 2] + cw[q * 4 + 3]);
    // initial guess: strip solution for a ~25-unit half-width
    const d = F[n];
    u[n] = d < 25 ? (d * (50 - d)) / 2 : 25 * d;
  }
  const omega = 1.9;
  const maxIter = 1500;
  let iterations = 0;
  let residual = Infinity;
  for (; iterations < maxIter; iterations++) {
    let maxDelta = 0;
    let maxU = 0;
    for (let q = 0; q < m; q++) {
      const n = interior[q];
      let sum = 1; // source term
      for (let k = 0; k < 4; k++) {
        const j = nb[q * 4 + k];
        if (j >= 0) sum += cw[q * 4 + k] * u[j];
      }
      const next = sum * inv0[q];
      const delta = next - u[n];
      const val = u[n] + omega * delta;
      u[n] = val;
      const ad = Math.abs(delta);
      if (ad > maxDelta) maxDelta = ad;
      if (val > maxU) maxU = val;
    }
    residual = maxDelta / (maxU || 1);
    if (residual < 1e-6) {
      iterations++;
      break;
    }
  }
  return { u, iterations, residual };
}

export function inflateContour(contour: Contour2D, opts: InflateOptions): InflatedMesh {
  const { cell, scale, zMax, origin } = opts;
  const inset = opts.inset ?? 0;
  const seg = toSegments(contour, origin);

  // ---- grid over the contour's bounds (padded by one cell so the iso-line always closes)
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let k = 0; k < seg.count; k++) {
    if (seg.ax[k] < minX) minX = seg.ax[k];
    if (seg.ax[k] > maxX) maxX = seg.ax[k];
    if (seg.ay[k] < minY) minY = seg.ay[k];
    if (seg.ay[k] > maxY) maxY = seg.ay[k];
  }
  minX -= cell;
  minY -= cell;
  const nx = Math.ceil((maxX + cell - minX) / cell) + 1;
  const ny = Math.ceil((maxY + cell - minY) / cell) + 1;
  const nodeCount = nx * ny;

  // ---- 1. signed distance (minus inset) + gradient of the signed distance (points inward)
  const F = new Float64Array(nodeCount);
  const gx = new Float64Array(nodeCount);
  const gy = new Float64Array(nodeCount);
  const q = new Float64Array(2);
  for (let j = 0; j < ny; j++) {
    const py = minY + j * cell;
    for (let i = 0; i < nx; i++) {
      const px = minX + i * cell;
      const n = j * nx + i;
      const d = closestPoint(seg, px, py, q);
      const inside = isInside(seg, px, py);
      const inv = d > 1e-9 ? 1 / d : 0;
      const sgn = inside ? 1 : -1;
      F[n] = sgn * d - inset;
      gx[n] = sgn * (px - q[0]) * inv;
      gy[n] = sgn * (py - q[1]) * inv;
    }
  }

  // ---- 2. inflation
  const { u, iterations, residual } = solvePoisson(F, nx, ny, cell);
  const height = (n: number): number => {
    const z = scale * Math.sqrt(Math.max(u[n], 0));
    return zMax ? zMax * Math.tanh(z / zMax) : z;
  };
  /** dz/dx, dz/dy at an interior node from the discrete gradient of u (Dirichlet 0 across the rim). */
  const slope = (n: number, out: Float64Array) => {
    const i = n % nx;
    const j = (n - i) / nx;
    const side = (nbr: number, ok: boolean): [number, number] => {
      if (!ok || F[nbr] <= 0) return [0, cell * theta(F[n], ok ? F[nbr] : -F[n])];
      return [u[nbr], cell];
    };
    const [uW, hW] = side(n - 1, i > 0);
    const [uE, hE] = side(n + 1, i < nx - 1);
    const [uS, hS] = side(n - nx, j > 0);
    const [uN, hN] = side(n + nx, j < ny - 1);
    const ux = (uE - uW) / (hE + hW);
    const uy = (uN - uS) / (hN + hS);
    const un = Math.max(u[n], 1e-9);
    let dz = scale / (2 * Math.sqrt(un)); // d(scale·√u)/du
    if (zMax) {
      const t = Math.tanh((scale * Math.sqrt(un)) / zMax);
      dz *= 1 - t * t;
    }
    out[0] = dz * ux;
    out[1] = dz * uy;
  };

  // ---- 3. marching squares → vertices (front/back node pairs, shared rim) + triangles
  const positions: number[] = [];
  const normals: number[] = [];
  const dist: number[] = [];
  const indices: number[] = [];
  const nodeVertex = new Int32Array(nodeCount).fill(-1); // front index; back = front + 1
  const hEdgeVertex = new Int32Array(nodeCount).fill(-1); // crossing on edge (i,j)-(i+1,j)
  const vEdgeVertex = new Int32Array(nodeCount).fill(-1); // crossing on edge (i,j)-(i,j+1)
  const bmin: [number, number, number] = [Infinity, Infinity, Infinity];
  const bmax: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  const sl = new Float64Array(2);

  const pushVertex = (x: number, y: number, z: number, nxv: number, nyv: number, nzv: number, d: number) => {
    const idx = positions.length / 3;
    positions.push(x, y, z);
    normals.push(nxv, nyv, nzv);
    dist.push(d);
    if (x < bmin[0]) bmin[0] = x;
    if (y < bmin[1]) bmin[1] = y;
    if (z < bmin[2]) bmin[2] = z;
    if (x > bmax[0]) bmax[0] = x;
    if (y > bmax[1]) bmax[1] = y;
    if (z > bmax[2]) bmax[2] = z;
    return idx;
  };

  const getNodeVertex = (n: number): number => {
    if (nodeVertex[n] >= 0) return nodeVertex[n];
    const i = n % nx;
    const j = (n - i) / nx;
    const x = minX + i * cell;
    const y = minY + j * cell;
    const z = height(n);
    slope(n, sl);
    let nxv = -sl[0];
    let nyv = -sl[1];
    let nzv = 1;
    const inv = 1 / Math.sqrt(nxv * nxv + nyv * nyv + nzv * nzv);
    nxv *= inv;
    nyv *= inv;
    nzv *= inv;
    const front = pushVertex(x, y, z, nxv, nyv, nzv, F[n]);
    pushVertex(x, y, -z, nxv, nyv, -nzv, F[n]);
    nodeVertex[n] = front;
    return front;
  };

  const getEdgeVertex = (store: Int32Array, key: number, a: number, b: number): number => {
    if (store[key] >= 0) return store[key];
    const fa = F[a];
    const fb = F[b];
    const t = fa / (fa - fb);
    const ia = a % nx;
    const ja = (a - ia) / nx;
    const ib = b % nx;
    const jb = (b - ib) / nx;
    let x = minX + (ia + (ib - ia) * t) * cell;
    let y = minY + (ja + (jb - ja) * t) * cell;
    if (inset === 0) {
      // snap onto the polygon so the rim *is* the contour (not its linear interpolation)
      closestPoint(seg, x, y, q);
      x = q[0];
      y = q[1];
    }
    // rim normal: horizontal, pointing outward (= -∇d, interpolated between the two nodes)
    let nxv = -(gx[a] + (gx[b] - gx[a]) * t);
    let nyv = -(gy[a] + (gy[b] - gy[a]) * t);
    const len = Math.hypot(nxv, nyv) || 1;
    nxv /= len;
    nyv /= len;
    const idx = pushVertex(x, y, 0, nxv, nyv, 0, 0);
    store[key] = idx;
    return idx;
  };

  // polygon of one cell, CCW in world space; `front`/`back` collect the index lists
  const front: number[] = [];
  const back: number[] = [];
  const emitFan = () => {
    for (let k = 1; k + 1 < front.length; k++) {
      indices.push(front[0], front[k], front[k + 1]);
      indices.push(back[0], back[k + 1], back[k]);
    }
  };
  const addNode = (n: number) => {
    const v = getNodeVertex(n);
    front.push(v);
    back.push(v + 1);
  };
  const addRim = (v: number) => {
    front.push(v);
    back.push(v);
  };

  for (let j = 0; j + 1 < ny; j++) {
    for (let i = 0; i + 1 < nx; i++) {
      // corners CCW (y up): c0 = (i,j) bottom-left, c1 = (i+1,j), c2 = (i+1,j+1), c3 = (i,j+1)
      const c0 = j * nx + i;
      const c1 = c0 + 1;
      const c2 = c0 + nx + 1;
      const c3 = c0 + nx;
      const in0 = F[c0] > 0;
      const in1 = F[c1] > 0;
      const in2 = F[c2] > 0;
      const in3 = F[c3] > 0;
      const count = (in0 ? 1 : 0) + (in1 ? 1 : 0) + (in2 ? 1 : 0) + (in3 ? 1 : 0);
      if (count === 0) continue;

      // edge crossings (lazily created, shared with the neighbouring cell)
      const x01 = () => getEdgeVertex(hEdgeVertex, c0, in0 ? c0 : c1, in0 ? c1 : c0);
      const x12 = () => getEdgeVertex(vEdgeVertex, c1, in1 ? c1 : c2, in1 ? c2 : c1);
      const x23 = () => getEdgeVertex(hEdgeVertex, c3, in3 ? c3 : c2, in3 ? c2 : c3);
      const x30 = () => getEdgeVertex(vEdgeVertex, c0, in0 ? c0 : c3, in0 ? c3 : c0);

      front.length = 0;
      back.length = 0;

      if (count === 4) {
        addNode(c0);
        addNode(c1);
        addNode(c2);
        addNode(c3);
        emitFan();
        continue;
      }

      const saddle = count === 2 && in0 === in2;
      if (saddle && (F[c0] + F[c1] + F[c2] + F[c3]) * 0.25 <= 0) {
        // two disconnected corner triangles: (corner, next-edge crossing, previous-edge crossing)
        if (in0) {
          addNode(c0);
          addRim(x01());
          addRim(x30());
          emitFan();
          front.length = back.length = 0;
          addNode(c2);
          addRim(x23());
          addRim(x12());
          emitFan();
        } else {
          addNode(c1);
          addRim(x12());
          addRim(x01());
          emitFan();
          front.length = back.length = 0;
          addNode(c3);
          addRim(x30());
          addRim(x23());
          emitFan();
        }
        continue;
      }

      // generic walk around the cell: inside corners + crossings on sign-changing edges
      if (in0) addNode(c0);
      if (in0 !== in1) addRim(x01());
      if (in1) addNode(c1);
      if (in1 !== in2) addRim(x12());
      if (in2) addNode(c2);
      if (in2 !== in3) addRim(x23());
      if (in3) addNode(c3);
      if (in3 !== in0) addRim(x30());
      emitFan();
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    dist: new Float32Array(dist),
    indices: new Uint32Array(indices),
    vertexCount: positions.length / 3,
    triangleCount: indices.length / 3,
    bounds: { min: bmin, max: bmax },
    solve: { iterations, residual },
  };
}
