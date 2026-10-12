/*
 * Silver dust hanging in the light round the stone: a sparse shell of motes that drift slowly and
 * twinkle (mostly dim, now and then a flash). Depth-tested, so the stone hides the ones behind it.
 */
import * as THREE from "three";
import { mulberry32 } from "../lib/geometry";

export function createDust(count: number) {
  const random = mulberry32(77);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // phase, drift speed, size (px), twinkle rate
  for (let i = 0; i < count; i++) {
    const z = random() * 2 - 1;
    const a = random() * Math.PI * 2;
    const ring = Math.sqrt(1 - z * z);
    const r = 1.15 + random() ** 2 * 1.7; // denser close to the stone
    positions.set([Math.cos(a) * ring * r, z * r * 1.3, Math.sin(a) * ring * r * 0.8], i * 3);
    seeds.set([random() * Math.PI * 2, 0.4 + random() * 0.8, 1.0 + random() ** 3 * 2.8, 0.6 + random() * 1.8], i * 4);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Vector3(0.93, 0.92, 0.89) },
    },
    vertexShader: /* glsl */ `
      attribute vec4 aSeed;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float t = uTime * 0.25 * aSeed.y + aSeed.x;
        p += vec3(sin(t * 1.3), sin(t) * 1.4, cos(t * 0.9)) * 0.12;   // slow lazy drift
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSeed.z * uPixelRatio * (11.0 / -mv.z);
        float flash = pow(0.5 + 0.5 * sin(uTime * aSeed.w + aSeed.x * 7.0), 8.0);
        vAlpha = 0.35 + 0.65 * flash;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a * a * vAlpha * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return { geometry, material };
}
