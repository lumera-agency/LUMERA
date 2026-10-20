/**
 * Web Worker: builds the droplet's body (Poisson solve + marching squares) and bakes the orbit fields, off the main
 * thread (~100 ms of CPU that would otherwise stall the page). Any message starts the build; the answer carries the
 * buffers (transferred).
 */
import { computeDeformFields, computeLocalWidth, computeOuterDistance, type DeformFields } from "./deform-fields";
import { FORM_CONTOUR } from "./form-contour";
import { inflateContour, type InflatedMesh } from "./inflate-geometry";
import { BODY_CENTER, DROPLET, EXTENT, SHELL } from "./shape";

export type InflateResponse = {
  mesh: Pick<InflatedMesh, "positions" | "normals" | "dist" | "indices">;
  fields: DeformFields;
  /** per vertex: the body's local half-width, world units */
  width: Float32Array;
  /** per vertex: the distance to the outer silhouette, world units */
  outer: Float32Array;
};

const scope = self as unknown as { onmessage: (() => void) | null; postMessage: (m: InflateResponse, t: Transferable[]) => void };

scope.onmessage = () => {
  const m = inflateContour(FORM_CONTOUR, SHELL);
  const fields = computeDeformFields(m.positions, BODY_CENTER, DROPLET.cell * EXTENT);
  const width = computeLocalWidth(m.positions, SHELL.scale, SHELL.zMax);
  const outer = computeOuterDistance(m.positions, FORM_CONTOUR.outer, SHELL.origin);
  scope.postMessage({ mesh: { positions: m.positions, normals: m.normals, dist: m.dist, indices: m.indices }, fields, width, outer }, [
    m.positions.buffer,
    m.normals.buffer,
    m.dist.buffer,
    m.indices.buffer,
    fields.fieldA.buffer,
    fields.fieldN.buffer,
    fields.gradA.buffer,
    fields.gradB.buffer,
    fields.gradN.buffer,
    width.buffer,
    outer.buffer,
  ]);
};
