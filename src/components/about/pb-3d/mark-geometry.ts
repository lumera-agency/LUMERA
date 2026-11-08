/*
 * The studio's mark (public/img/logo-mark.svg, 329 × 329) as one solid: the two soft capsules that meet in the corner
 * (their union, one outline) and the circle, extruded with a rounded bevel. The caps keep their flat normals; the bevel
 * and the sides get smooth ones (merged), so the chrome runs round the edges without facets.
 * World units: the mark is 2 wide, centred on the origin, y up, its depth centred on z = 0.
 */
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

const VIEW = 329;
/** the mark's own units → world (2 wide) */
const S = 2 / VIEW;

/** the union of the two capsules, in the SVG's coordinates (y down): the bottom-left round, up the vertical capsule and
 *  down its inner side to where the horizontal one leaves the corner's circle (the two necks cross there, almost
 *  tangent), along the horizontal capsule and back. Every segment a cubic, as in the file. */
const L: [number, number, number, number, number, number][] = [
  [26.6391, 329, 0, 302.361, 0, 269.5],
  [0, 253.546, 6.27877, 239.059, 16.5, 228.375],
  [26.7212, 217.691, 53, 193.038, 53, 164.5],
  [53, 135.962, 26.7212, 111.309, 16.5, 100.625],
  [6.27877, 89.9406, 0, 75.4536, 0, 59.5],
  [0, 26.6391, 26.6391, 0, 59.5, 0],
  [92.3609, 0, 119, 26.6391, 119, 59.5],
  [119, 75.4536, 112.721, 89.9406, 102.5, 100.625],
  [92.2788, 111.309, 66, 135.962, 66, 164.5],
  [66, 193.038, 92.2788, 217.691, 100.625, 226.5],
  [111.309, 236.721, 135.962, 263, 164.5, 263],
  [193.038, 263, 217.691, 236.721, 228.375, 226.5],
  [239.059, 216.279, 253.546, 210, 269.5, 210],
  [302.361, 210, 329, 236.639, 329, 269.5],
  [329, 302.361, 302.361, 329, 269.5, 329],
  [253.546, 329, 239.059, 322.721, 228.375, 312.5],
  [217.691, 302.279, 193.038, 276, 164.5, 276],
  [135.962, 276, 111.309, 302.279, 100.625, 312.5],
  [89.9406, 322.721, 75.4536, 329, 59.5, 329],
];
const L_START: [number, number] = [59.5, 329];
const DOT = { x: 270, y: 59, r: 59 };

/** SVG point → shape point (y up, centred) */
const px = (x: number) => (x - VIEW / 2) * S;
const py = (y: number) => (VIEW / 2 - y) * S;

function lShape() {
  const s = new THREE.Shape();
  s.moveTo(px(L_START[0]), py(L_START[1]));
  for (const [x1, y1, x2, y2, x, y] of L) s.bezierCurveTo(px(x1), py(y1), px(x2), py(y2), px(x), py(y));
  return s;
}
function dotShape() {
  const s = new THREE.Shape();
  s.absarc(px(DOT.x), py(DOT.y), DOT.r * S, 0, Math.PI * 2, false);
  return s;
}

export type MarkDepth = {
  /** the straight side, world units */
  depth: number;
  /** the rounded bevel: how far it grows the outline and how deep it runs */
  size: number;
  thickness: number;
  /** pulls the flat face in (negative), so the silhouette grows less than the bevel */
  offset: number;
  /** rings across the bevel, points along each curve */
  segments: number;
  curve: number;
};

export const DEPTH: MarkDepth = { depth: 0.13, size: 0.055, thickness: 0.1, offset: -0.03, segments: 10, curve: 26 };

/** a shape extruded, its caps (flat) and its sides (smoothed) as one geometry with position and normal */
function solid(shape: THREE.Shape, d: MarkDepth) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: d.depth,
    bevelEnabled: true,
    bevelSize: d.size,
    bevelThickness: d.thickness,
    bevelOffset: d.offset,
    bevelSegments: d.segments,
    curveSegments: d.curve,
  });
  g.deleteAttribute("uv");
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const nor = g.getAttribute("normal") as THREE.BufferAttribute;
  const part = (start: number, count: number, withNormals: boolean) => {
    const p = new THREE.BufferGeometry();
    p.setAttribute("position", new THREE.BufferAttribute((pos.array as Float32Array).slice(start * 3, (start + count) * 3), 3));
    if (withNormals) p.setAttribute("normal", new THREE.BufferAttribute((nor.array as Float32Array).slice(start * 3, (start + count) * 3), 3));
    return p;
  };
  const [caps, sides] = g.groups;
  const capGeo = part(caps.start, caps.count, true);
  const sideGeo = mergeVertices(part(sides.start, sides.count, false), 1e-5);
  sideGeo.computeVertexNormals();
  const sideFlat = sideGeo.toNonIndexed();
  const out = mergeGeometries([capGeo, sideFlat]);
  sideFlat.dispose();
  [g, capGeo, sideGeo].forEach((x) => x.dispose());
  return out;
}

export function createMarkGeometry(d: MarkDepth = DEPTH) {
  const parts = [solid(lShape(), d), solid(dotShape(), d)];
  const g = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  g.translate(0, 0, -d.depth / 2);
  g.computeBoundingSphere();
  return g;
}
