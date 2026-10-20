"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";
import type { InflateResponse } from "./inflate.worker";

/** The droplet's body, built once in a Web Worker, with the baked deformation fields as attributes; null until it lands
 *  (the still under the canvas covers the wait). */
export function useDropletGeometry(): THREE.BufferGeometry | null {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    const worker = new Worker(new URL("./inflate.worker.ts", import.meta.url));
    let built: THREE.BufferGeometry | null = null;
    worker.onmessage = (e: MessageEvent<InflateResponse>) => {
      const { mesh, fields, width, outer } = e.data;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(mesh.positions, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(mesh.normals, 3));
      geo.setAttribute("dist", new THREE.BufferAttribute(mesh.dist, 1));
      geo.setAttribute("aFieldA", new THREE.BufferAttribute(fields.fieldA, 4));
      geo.setAttribute("aFieldN", new THREE.BufferAttribute(fields.fieldN, 2));
      geo.setAttribute("aGradA", new THREE.BufferAttribute(fields.gradA, 4));
      geo.setAttribute("aGradB", new THREE.BufferAttribute(fields.gradB, 4));
      geo.setAttribute("aGradN", new THREE.BufferAttribute(fields.gradN, 4));
      geo.setAttribute("aWidth", new THREE.BufferAttribute(width, 1));
      geo.setAttribute("aOuter", new THREE.BufferAttribute(outer, 1));
      geo.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
      geo.computeBoundingSphere();
      built = geo;
      setGeometry(geo);
      worker.terminate();
    };
    worker.postMessage(null);
    return () => {
      worker.terminate();
      built?.dispose();
    };
  }, []);
  return geometry;
}
