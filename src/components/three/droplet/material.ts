/**
 * The droplet's surface: the reference render itself (form-photo.webp) projected onto the body along the view axis from
 * the *undeformed* position, so at rest the front view is the photo pixel for pixel and every wave carries the pixels
 * with the material like a liquid.
 *
 * The flow: everything is a function of uTime and loops seamlessly with uPeriod. Every point rides its own small
 * ellipse, D(p, θ) = A(p)·cos θ + B(p)·sin θ, with smooth body-sized fields A, B baked per vertex (deform-fields.ts);
 * uSwirl blends that with a straight travelling wave; a stream travels to the left on top (it carries the highlights);
 * the big hole breathes once per loop; a faint ripple. Thin parts are kept from being pinched. Normals come from the
 * deformed tangents (finite differences). The pointer draws the metal toward it, parts it in the core and dents it.
 *
 * The look while it moves: highlights slide as the surface tilts (swim), a light wave runs with the stream, faces
 * turning to the viewer brighten (gloss), the rim lookup is pulled inside, and the photo's fine-stripe zones
 * (form-photo-zone.png) blend toward a blurred copy (form-photo-smooth.webp) where the surface stretches. Opaque: the
 * outline is anti-aliased by MSAA. No tone mapping: the photo is already display-referred. uFlow scales all of the motion:
 * at 0 the body is the photo itself, at rest.
 */
import * as THREE from "three";
import { BIG_HOLE, DROPLET, EXTENT, ORIGIN, VIEW_H, VIEW_W } from "./shape";

const VERTEX = /* glsl */ `
attribute float dist;
// the orbit fields baked per vertex: ellipse axes and their gradients
attribute vec4 aFieldA;
attribute vec2 aFieldN;
attribute vec4 aGradA;
attribute vec4 aGradB;
attribute vec4 aGradN;
attribute float aWidth;
attribute float aOuter;
uniform float uTime;
uniform float uPeriod;
uniform vec2 uHole;
uniform float uExtent;
uniform float uSwell;
uniform float uOrbit;
uniform float uBreathe;
uniform float uRipple;
uniform vec2 uWaveDir;
uniform float uWaveLen;
uniform float uHarm;
uniform float uSwirl;
uniform float uSpin;
uniform float uStream;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uPointerRadius;
uniform float uPointerPull;
uniform float uPointerRise;
uniform float uPointerRepel;
uniform float uThinGuard;
uniform float uSmooth;
uniform float uFlow;
uniform vec2 uOrigin;
uniform vec2 uSize;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vN0;
varying float vStreamPhase;
varying vec2 vOutward;
varying float vBack;
varying float vOuter;
const float TAU = 6.2831853;

// the faint ripple: two crossing waves and a short one along the stream (whole cycles per period: seamless), weaker at the rim
float ripple(vec3 p, float t, float s, float d) {
  float w = TAU * t / uPeriod;
  float a = 0.5 * sin(dot(p.xy, vec2(0.83, 0.56)) * (TAU / 210.0) + 2.0 * w)
          + 0.5 * sin(dot(p.xy, vec2(-0.4, 0.92)) * (TAU / 170.0) - 3.0 * w);
  float c = sin(s * (TAU / 300.0) + 3.0 * w);
  return (a * 0.7 + c * 0.3) * uRipple * mix(0.25, 1.0, smoothstep(0.0, 30.0, d));
}

// the hole breathing: slot to oval and back
vec2 breath(vec3 p, float phase) {
  vec2 rel = p.xy - uHole;
  float r = length(rel);
  vec2 dir = r > 1e-3 ? rel / r : vec2(0.0);
  return dir * uBreathe * sin(phase) * exp(-pow(r / (0.6 * uExtent), 2.0));
}

// the straight travelling wave: swell, orbit and breathing on one phase
void waveModes(float phi, vec3 p, out float swell, out vec2 inPlane) {
  float phi2 = 2.0 * phi + 1.3;
  swell = (sin(phi) + sin(phi2) * uHarm) * uSwell;
  vec2 orbit = (vec2(cos(phi), sin(phi)) + vec2(cos(phi2), sin(phi2)) * uHarm) * uOrbit;
  inPlane = orbit + breath(p, phi - 0.6);
}

// the orbit morph: the baked fields, resolved at the tangent neighbours (dp) through their gradients
void orbitModes(float th, vec3 p, vec2 dp, out float swell, out vec2 inPlane) {
  float c = cos(th);
  float sn = sin(th);
  vec2 A = aFieldA.xy + vec2(dot(aGradA.xy, dp), dot(aGradA.zw, dp));
  vec2 B = aFieldA.zw + vec2(dot(aGradB.xy, dp), dot(aGradB.zw, dp));
  float An = aFieldN.x + dot(aGradN.xy, dp);
  float Bn = aFieldN.y + dot(aGradN.zw, dp);
  swell = (An * c + Bn * sn) * 1.35 * uSwell;
  inPlane = (A * c + B * sn) * 1.35 * uOrbit + breath(p, th - 0.9);
}

vec3 deform(vec3 p, vec3 nrm, float d, float t, vec2 dp) {
  float w = TAU * t / uPeriod;
  float s = dot(p.xy, uWaveDir);
  float phiLin = w + s * (TAU / (uWaveLen * uExtent));

  float sw1, sw2;
  vec2 ip1, ip2;
  waveModes(phiLin, p, sw1, ip1);
  orbitModes(w * uSpin, p, dp, sw2, ip2);
  // the displacements are blended, never the phases
  float swell = mix(sw1, sw2, uSwirl);
  vec2 inPlane = mix(ip1, ip2, uSwirl);

  // the stream to the left: its crest carries the material and, through the normals, the highlights
  float phi2 = 2.0 * phiLin + 0.7;
  swell += (sin(phiLin) + 0.3 * sin(phi2)) * uStream;
  inPlane += (vec2(cos(phiLin), sin(phiLin)) + 0.3 * vec2(cos(phi2), sin(phi2))) * uStream * 0.7;

  // the pointer: the metal is drawn toward it (zero at the centre, strongest near 0.7 R), parted away from it in the core
  // (x·exp(−x²): zero on the pointer itself, so the push never flips across it and tears the mesh), and dented
  if (uPointerStrength > 0.001) {
    vec2 rel = p.xy - uPointer;
    float r = length(rel);
    vec2 dir = r > 1e-3 ? rel / r : vec2(0.0);
    float g = exp(-(r * r) / (uPointerRadius * uPointerRadius));
    inPlane -= dir * uPointerPull * g * min(r / (0.7 * uPointerRadius), 1.0) * uPointerStrength;
    float x = r / (0.55 * uPointerRadius);
    inPlane += dir * uPointerRepel * (x * exp(-x * x) / 0.4289) * uPointerStrength;
    swell += uPointerRise * g * uPointerStrength;
  }

  // thin parts (arms, bridges) never get pinched: at their rims any inward in-plane push is removed and a negative swell
  // clamped, both through a smooth min/max (a hard clamp's kink would streak the reflections)
  float thin = 1.0 - smoothstep(22.0, 48.0, aWidth);
  vec2 nOut = vec2(nrm.x, nrm.y);
  float guard = thin * smoothstep(0.35, 0.8, length(nOut)) * uThinGuard;
  if (guard > 0.001) {
    vec2 nDir = normalize(nOut);
    float k = 0.001 + 3.0 * uSmooth;
    float dn = dot(inPlane, nDir);
    inPlane -= nDir * (0.5 * (dn - sqrt(dn * dn + k * k)) + 0.5 * k) * guard;
    float sw = swell + 2.0;
    swell = mix(swell, 0.5 * (sw + sqrt(sw * sw + k * k)) - 0.5 * k - 2.0, guard);
  }

  // uFlow 0…1: at 0 the body rests exactly in the photo's pose (it wakes from the still)
  return p + (vec3(inPlane, 0.0) + nrm * (swell + ripple(p, t, s, d))) * uFlow;
}

void main() {
  // the vertex and two tangent neighbours, deformed: the new normal is their cross product
  vec3 nrm = normalize(normal);
  vec3 up = abs(nrm.z) < 0.9 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(up, nrm));
  vec3 t2 = cross(nrm, t1);
  float e = 2.0;
  vec3 P0 = deform(position, nrm, dist, uTime, vec2(0.0));
  vec3 P1 = deform(position + t1 * e, nrm, dist, uTime, (t1 * e).xy);
  vec3 P2 = deform(position + t2 * e, nrm, dist, uTime, (t2 * e).xy);
  vec3 nDef = normalize(cross(P1 - P0, P2 - P0));
  vOuter = aOuter;
  // the base normal's outward direction in the picture plane (off the body at the rim)
  vOutward = vec2(nrm.x, nrm.y) * (1.0 - clamp(abs(nrm.z), 0.0, 1.0));
  // the photo from the undeformed position: it travels with the material. The back half is folded around the rim (it
  // would get the front's rim pixels: a hard bright band when the body tilts)
  vec2 src = position.xy;
  vBack = nrm.z < 0.0 ? uSmooth : 0.0;
  if (vBack > 0.0) {
    vec2 nd = length(nrm.xy) > 1e-4 ? normalize(nrm.xy) : vec2(0.0);
    src -= nd * abs(position.z) * 1.4 * uSmooth;
  }
  vUv = vec2((src.x + uOrigin.x) / uSize.x, (uOrigin.y + src.y) / uSize.y);
  vStreamPhase = TAU * uTime / uPeriod + dot(position.xy, uWaveDir) * (TAU / (uWaveLen * uExtent));
  vN = normalize(normalMatrix * nDef);
  vN0 = normalize(normalMatrix * nrm);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D uPhoto;
uniform sampler2D uPhotoSmooth;
uniform sampler2D uSmoothZone;
uniform float uSmooth;
uniform float uSwim;
uniform float uGloss;
uniform float uStreamUv;
uniform float uRimInset;
uniform float uFlow;
uniform vec2 uWaveDir;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vN0;
varying float vStreamPhase;
varying vec2 vOutward;
varying float vBack;
varying float vOuter;
void main() {
  vec2 uv = vUv + (vN.xy - vN0.xy) * uSwim - uWaveDir * (uStreamUv * uFlow * sin(vStreamPhase)) - vOutward * uRimInset;
  vec3 sharp = texture2D(uPhoto, uv).rgb;
  // inside the photo's fine-stripe zones only (never along the outline), more where the surface stretches
  float s = uSmooth * smoothstep(3.0, 14.0, vOuter) * texture2D(uSmoothZone, uv).r;
  float stretch = clamp(length(vN.xy - vN0.xy) * 3.0, 0.0, 1.0);
  vec3 col = mix(sharp, texture2D(uPhotoSmooth, uv, 1.6 * stretch).rgb, s);
  col *= 1.0 - 0.15 * vBack; // the underside a touch darker
  col *= 1.0 + clamp((vN.z - vN0.z) * 2.5, -1.0, 1.0) * uGloss;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export type DropletUniforms = ReturnType<typeof createDropletUniforms>;

export function createDropletUniforms() {
  const a = (DROPLET.travelDeg * Math.PI) / 180;
  return {
    uTime: { value: 0 },
    uPeriod: { value: DROPLET.period },
    uHole: { value: new THREE.Vector2(...BIG_HOLE) },
    uExtent: { value: EXTENT },
    uSwell: { value: DROPLET.swell },
    uOrbit: { value: DROPLET.orbit },
    uBreathe: { value: DROPLET.breathe },
    uRipple: { value: DROPLET.ripple },
    uWaveDir: { value: new THREE.Vector2(-Math.cos(a), -Math.sin(a)) },
    uWaveLen: { value: DROPLET.waveLength * 2 }, // body widths → half-sizes
    uHarm: { value: DROPLET.harmonic },
    uSwirl: { value: DROPLET.swirl },
    uSpin: { value: DROPLET.spin },
    uStream: { value: DROPLET.stream },
    uPointer: { value: new THREE.Vector2(1e6, 1e6) },
    uPointerStrength: { value: 0 },
    uPointerRadius: { value: DROPLET.pointerRadius },
    uPointerPull: { value: DROPLET.pointerPull },
    uPointerRise: { value: DROPLET.pointerRise },
    uPointerRepel: { value: DROPLET.pointerRepel },
    uThinGuard: { value: DROPLET.thinGuard },
    uSmooth: { value: DROPLET.smooth },
    /** 0…1: how much it flows (0 = the photo's pose; DropletScene wakes it) */
    uFlow: { value: 0 },
    uOrigin: { value: new THREE.Vector2(...ORIGIN) },
    uSize: { value: new THREE.Vector2(VIEW_W, VIEW_H) },
    uSwim: { value: DROPLET.swim },
    uGloss: { value: DROPLET.gloss },
    uStreamUv: { value: DROPLET.streamUv },
    uRimInset: { value: DROPLET.rimInset },
    uPhoto: { value: null as THREE.Texture | null },
    uPhotoSmooth: { value: null as THREE.Texture | null },
    uSmoothZone: { value: null as THREE.Texture | null },
  };
}

export function createDropletMaterial(uniforms: DropletUniforms) {
  // opaque, both sides (the tilted body shows its underside at the rim); MSAA anti-aliases the outline
  return new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, side: THREE.DoubleSide });
}
