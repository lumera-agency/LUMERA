/*
 * The robot's look (the owner, 4 Nov 2026, of five: «пескоструй», sandblasted dark metal, ?mat=5; of five antennas:
 * the feelers, ?ant=2): the shell (the head) a dark metal with a fine grain in its roughness and its relief (the hands:
 * makeHandLook: the palm the same, the fingers the trim); the trim (bezel, ears, antenna rods) a satin silver; two thin feelers curving outward, a small glossy lime ball at each
 * end (the balls flash as a card is recorded).
 */
import * as THREE from "three";
import { brandName } from "@/config/site";
import { MARK_DOT, MARK_PATHS, MARK_SIZE } from "@/components/ui/logo/mark";
import { LIME, LIME_CSS } from "./shared";

export type Look = { shell: THREE.MeshPhysicalMaterial; trim: THREE.MeshPhysicalMaterial; grain: THREE.Texture };

/** a fine grain as a canvas: the shell's roughness and relief */
function grain() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(size, size);
  for (let pixel = 0; pixel < size * size; pixel++) {
    const value = 150 + Math.random() * 90;
    image.data.set([value, value, value, 255], pixel * 4);
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

export function makeLook(environments: { chrome: THREE.Texture; mirror: THREE.Texture }): Look {
  const texture = grain();
  return {
    shell: new THREE.MeshPhysicalMaterial({ color: 0x232427, metalness: 0.85, roughness: 0.62, roughnessMap: texture, bumpMap: texture, bumpScale: 0.35, envMap: environments.chrome, envMapIntensity: 0.7 }),
    trim: new THREE.MeshPhysicalMaterial({ color: 0xcfcdc8, metalness: 1, roughness: 0.34, envMap: environments.mirror, envMapIntensity: 1 }),
    grain: texture,
  };
}

export type Antennas = { group: THREE.Group; sways: THREE.Group[]; lime: THREE.MeshPhysicalMaterial; dispose: () => void };

/** the feelers on the head's top (its top at y = `top`): thin rods curving outward, a small ball at each end */
export function makeAntennas(top: number, trim: THREE.Material, mirror: THREE.Texture): Antennas {
  const group = new THREE.Group();
  const sways: THREE.Group[] = [];
  // the balls: a glossy lime that shows its roundness (lit, a highlight, a little glow from within)
  const lime = new THREE.MeshPhysicalMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 0.18, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMap: mirror, envMapIntensity: 1.2 });
  const socket = new THREE.SphereGeometry(0.11, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const ball = new THREE.SphereGeometry(0.065, 28, 18);
  const geometries: THREE.BufferGeometry[] = [socket, ball];
  for (const side of [-1, 1]) {
    const root = new THREE.Group();
    root.position.set(side * 0.7, top - 0.03, -0.12);
    const base = new THREE.Mesh(socket, trim);
    base.scale.y = 0.6;
    const pivot = new THREE.Group();
    pivot.userData.lean = 0;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.04, 0.22, 0),
      new THREE.Vector3(side * 0.16, 0.42, 0.02),
      new THREE.Vector3(side * 0.34, 0.52, 0.04),
    ]);
    const rod = new THREE.TubeGeometry(curve, 40, 0.024, 10, false);
    geometries.push(rod);
    const tip = new THREE.Mesh(ball, lime);
    tip.position.copy(curve.getPoint(1));
    pivot.add(new THREE.Mesh(rod, trim), tip);
    root.add(base, pivot);
    group.add(root);
    sways.push(pivot);
  }
  return {
    group,
    sways,
    lime,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      lime.dispose();
    },
  };
}

/** The hands' surfaces (the owner, 4 Nov 2026: «как кожаные перчатки, как голова, а пальцы металл, как ободок»): the
 *  palm in the head's sandblasted metal, the fingers in the bezel's satin silver. */
export type HandLook = { palm: THREE.Material; fingers: THREE.Material };

export function makeHandLook(look: Look): HandLook {
  return { palm: look.shell, fingers: look.trim };
}

/** The neck (the owner, 4 Nov 2026, after bidapp's robot: narrower than a block, longer at the top where it meets the
 *  head, smaller at the bottom, its edges rounded): a short tapering piece under the head, round in plan and flattened
 *  front to back, its bottom edge rounded off; in the head's own metal. Its top (y 0) sits just inside the head's
 *  underside. */
export function makeNeck(material: THREE.Material) {
  // (the owner's picture: at the head over half its width, short, the bottom a good deal narrower)
  const top = 0.84;
  const bottom = 0.64;
  const height = 0.11;
  const corner = 0.07;
  // the side's outward normal, so the rounded corner meets the side without a kink
  const sideAngle = Math.atan2(-(top - bottom), height - corner);
  const points = [new THREE.Vector2(0.0001, -height)];
  for (let step = 0; step <= 10; step++) {
    const angle = -Math.PI / 2 + (step / 10) * (sideAngle + Math.PI / 2);
    points.push(new THREE.Vector2(bottom - corner + Math.cos(angle) * corner, -height + corner + Math.sin(angle) * corner));
  }
  points.push(new THREE.Vector2(top, 0.06), new THREE.Vector2(0.0001, 0.06));
  // turned from the back, so the lathe's seam (where it closes, its normals split) is out of sight, not a line down
  // the front
  const geometry = new THREE.LatheGeometry(points, 72, Math.PI);
  geometry.scale(1, 1, 0.6);
  const mesh = new THREE.Mesh(geometry, material);
  return { mesh, dispose: () => geometry.dispose() };
}

/** The ECLO mark on the back of each hand, lit from within in lime like the apple on the old laptops' lids (the owner,
 *  4 Nov 2026): the mark and its halo painted once on a canvas, laid on a square the hand carries. */
export function makeHandLogo() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d")!;
  const mark = size * 0.5;
  context.translate((size - mark) / 2, (size - mark) / 2);
  context.scale(mark / MARK_SIZE, mark / MARK_SIZE);
  context.fillStyle = LIME_CSS;
  context.shadowColor = LIME_CSS;
  // the halo: the mark drawn twice through a blur, then once sharp
  // (the blur is in the canvas's pixels, whatever the scale)
  for (const blur of [26, 12, 0]) {
    context.shadowBlur = blur;
    for (const path of MARK_PATHS) context.fill(new Path2D(path));
    context.beginPath();
    context.arc(MARK_DOT.cx, MARK_DOT.cy, MARK_DOT.r, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  // the plane faces away from the palm (the hand's back is its -z), upright toward the fingers (its +y)
  const geometry = new THREE.PlaneGeometry(0.33, 0.33);
  geometry.rotateY(Math.PI);
  return {
    material,
    geometry,
    dispose: () => {
      texture.dispose();
      material.dispose();
      geometry.dispose();
    },
  };
}

/** «ECLO» on the robot's chin, under its screen, lit in lime like the marks on its hands (the owner, 4 Nov 2026): the
 *  word and its halo on a canvas (painted again once the site's font is in), on a strip the head carries. */
export function makeChinLogo() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const paint = () => {
    const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "system-ui, sans-serif";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = `500 64px ${sans}`;
    context.letterSpacing = "18px";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = LIME_CSS;
    context.shadowColor = LIME_CSS;
    // the halo: the word drawn twice through a blur, then once sharp (the spacing's trailing gap evened out)
    for (const blur of [22, 10, 0]) {
      context.shadowBlur = blur;
      context.fillText(brandName.toUpperCase(), canvas.width / 2 + 9, canvas.height / 2 + 2);
    }
    texture.needsUpdate = true;
  };
  paint();
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  const geometry = new THREE.PlaneGeometry(0.56, 0.14);
  return {
    material,
    geometry,
    paint,
    dispose: () => {
      texture.dispose();
      material.dispose();
      geometry.dispose();
    },
  };
}
