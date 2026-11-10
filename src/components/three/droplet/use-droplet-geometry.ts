"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { dropletBody } from "./droplet-prefetch";

/** The droplet's body, built once in a Web Worker (droplet-prefetch: the page's slot starts it before this chunk is
 *  even in), with the baked deformation fields as attributes; null until it lands. */
export function useDropletGeometry(): THREE.BufferGeometry | null {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    let gone = false;
    let built: THREE.BufferGeometry | null = null;
    void dropletBody().then(({ mesh, fields, width, outer }) => {
      if (gone) return;
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
    });
    return () => {
      gone = true;
      built?.dispose();
    };
  }, []);
  return geometry;
}
