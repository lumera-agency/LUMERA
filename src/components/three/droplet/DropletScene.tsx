"use client";
/*
 * The droplet of liquid metal (VarianteMain, shape.ts) in a square canvas: the body flows on its loop, leans a few
 * degrees after the pointer and sways a little at rest; the pointer over it draws the metal (`interactive`, a mouse).
 * World units are the reference's viewBox units: a narrow-FOV camera sits far enough back for the visible height at
 * z = 0 to be exactly 715, so the front view is the reference's projection while a small turn still shows the depth.
 * `onReady` fires once the body is built and drawn with its photo (the still under the canvas can go then); until
 * `awake` it rests exactly in the photo's pose (the still's), then it comes to life over a couple of seconds.
 */
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Resume } from "@/components/three/lib/Resume";
import { createDropletMaterial, createDropletUniforms, type DropletUniforms } from "./material";
import { BODY_CENTER, DROPLET, VIEW_H } from "./shape";
import { useDropletGeometry } from "./use-droplet-geometry";

const PHOTO = ["/img/droplet/form-photo.webp", "/img/droplet/form-photo-smooth.webp", "/img/droplet/form-photo-zone.png"];
const FOV = 18;
const CAMERA_Z = VIEW_H / 2 / Math.tan((FOV / 2) * (Math.PI / 180));
const MAX_TILT_X = 0.11;
const MAX_TILT_Y = 0.16;
/** s: from rest to the full flow once awake */
const WAKE = 2.4;

type Props = {
  /** false: the frame loop stops (out of view, covered, a hidden tab) */
  active: boolean;
  /** the pointer leans it and draws the metal (a mouse; off on touch) */
  interactive: boolean;
  /** false: it rests in the photo's pose; true: it comes to life (WAKE) */
  awake: boolean;
  /** radians: the body turned in the picture plane (counter-clockwise), to sit in a composition */
  roll?: number;
  onReady?: () => void;
};

export default function DropletScene({ active, interactive, awake, roll = 0, onReady }: Props) {
  const tilt = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const uniforms = useMemo(() => createDropletUniforms(), []);
  const geometry = useDropletGeometry(); // built while the photo loads
  return (
    <Canvas
      // MSAA anti-aliases the outline (the surface is opaque); full DPR up to 2: the look lives on the photo's sharpness
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: CAMERA_Z - 600, far: CAMERA_Z + 600 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      {/* turns around its own centre, which sits at the canvas' centre */}
      <group ref={tilt}>
        <group rotation={[0, 0, roll]}>
          <group ref={body} position={[-BODY_CENTER[0], -BODY_CENTER[1], 0]}>
            <Suspense fallback={null}>
              {geometry && <Body geometry={geometry} uniforms={uniforms} onReady={onReady} />}
            </Suspense>
          </group>
        </group>
      </group>
      <Clock uniforms={uniforms} awake={awake} />
      <Lean group={tilt} enabled={interactive} uniforms={uniforms} />
      <Pointer uniforms={uniforms} body={body} enabled={interactive} />
      <Resume running={active} />
    </Canvas>
  );
}

/** The body: the worker's geometry with the photo on it; tells once it has been drawn (its second frame). */
function Body({ geometry, uniforms, onReady }: { geometry: THREE.BufferGeometry; uniforms: DropletUniforms; onReady?: () => void }) {
  const [photo, photoSmooth, smoothZone] = useLoader(THREE.TextureLoader, PHOTO);
  const material = useMemo(() => createDropletMaterial(uniforms), [uniforms]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    for (const texture of [photo, photoSmooth]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
    }
    smoothZone.colorSpace = THREE.NoColorSpace; // a weight map, read as linear data
    smoothZone.needsUpdate = true;
    uniforms.uPhoto.value = photo;
    uniforms.uPhotoSmooth.value = photoSmooth;
    uniforms.uSmoothZone.value = smoothZone;
  }, [photo, photoSmooth, smoothZone, uniforms]);
  const frames = useRef(0);
  useFrame(() => {
    if (++frames.current === 2) onReady?.();
  });
  return <mesh geometry={geometry} material={material} />;
}

/** The loop's clock, and the wake: the flow eases in from 0 (smoothstep) once awake. */
function Clock({ uniforms, awake }: { uniforms: DropletUniforms; awake: boolean }) {
  const wokeAt = useRef<number | null>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;
    if (awake) wokeAt.current ??= t;
    const k = wokeAt.current == null ? 0 : Math.min(1, (t - wokeAt.current) / WAKE);
    uniforms.uFlow.value = k * k * (3 - 2 * k);
  });
  return null;
}

/** The pointer leans the whole body a few degrees (critically damped), plus an idle sway on the loop's clock (with the
 *  flow: none while it rests in the photo's pose). */
function Lean({ group, enabled, uniforms }: { group: React.RefObject<THREE.Group | null>; enabled: boolean; uniforms: DropletUniforms }) {
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);
  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g || !enabled) return;
    const ph = (Math.PI * 2 * clock.elapsedTime) / DROPLET.period;
    const flow = uniforms.uFlow.value;
    const ty = (target.current.x * MAX_TILT_Y * DROPLET.tilt + Math.sin(ph) * 0.05 * DROPLET.sway) * flow;
    const tx = (-target.current.y * MAX_TILT_X * DROPLET.tilt + Math.cos(ph * 2) * 0.035 * DROPLET.sway) * flow;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 3, dt);
  });
  return null;
}

/**
 * The pointer over the body: tracked on the window, tested against the canvas and projected onto the body's plane
 * (z = 0) through the camera, no raycast against the mesh. Its eased position and presence drive the vertex stage; the
 * presence drops as soon as it leaves the canvas, the document or the window (a reload under a parked cursor never
 * leaves it stuck).
 */
function Pointer({ uniforms, body, enabled }: { uniforms: DropletUniforms; body: React.RefObject<THREE.Group | null>; enabled: boolean }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const target = useRef(new THREE.Vector2());
  const over = useRef(false);
  const started = useRef(false);
  const tools = useMemo(() => ({ ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(), ndc: new THREE.Vector2() }), []);
  useEffect(() => {
    if (!enabled) {
      over.current = false;
      return;
    }
    const el = gl.domElement;
    const off = () => void (over.current = false);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return off();
      tools.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      tools.ray.setFromCamera(tools.ndc, camera);
      if (!tools.ray.ray.intersectPlane(tools.plane, tools.hit)) return;
      body.current?.worldToLocal(tools.hit);
      target.current.set(tools.hit.x, tools.hit.y);
      if (!started.current) {
        uniforms.uPointer.value.copy(target.current);
        started.current = true;
      }
      over.current = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", off);
    window.addEventListener("blur", off);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", off);
      window.removeEventListener("blur", off);
    };
  }, [enabled, gl, camera, body, uniforms, tools]);
  useFrame((_, dt) => {
    const want = enabled && over.current ? 1 : 0;
    uniforms.uPointerStrength.value = THREE.MathUtils.damp(uniforms.uPointerStrength.value, want, want ? 10 : 4, dt);
    if (started.current) uniforms.uPointer.value.lerp(target.current, 1 - Math.exp(-DROPLET.pointerFollow * dt));
  });
  return null;
}
