/*
 * The clinic's 3D object (spec §6): a porcelain shade guide, the colour guide used for whitening and veneers. Seven
 * incisor-crown tabs (#F5F3EC → #E3D5BA) on steel stems, fanned on a porcelain rivet. React Three Fiber, one canvas, its
 * frame loop on demand: it draws only while the fan opens (a GSAP timeline that invalidates on each update) and while it
 * settles toward a mouse pointer; then nothing renders. The environment is made of Lightformers (no HDR is downloaded).
 * The canvas fades in once the pocket is in the frame; the tabs start stacked at 0°, the group turned −40° at .92, and
 * open over 1.4 s. On unmount R3F disposes the renderer and forces the context loss.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei/core/Environment";
import { Lightformer } from "@react-three/drei/core/Lightformer";
import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { gsap } from "gsap";

const N = 7;
const DEG = Math.PI / 180;
const FAN = [-33, -22, -11, 0, 11, 22, 33];
const STEM = 1.25;

/** the incisor-crown tab: extruded, tessellated so it can bend, bent round R .9 and thinned toward its edge */
function tabGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.26, 0);
  s.bezierCurveTo(-0.3, 0.25, -0.37, 0.55, -0.36, 0.86);
  s.quadraticCurveTo(-0.355, 0.98, -0.26, 1);
  s.bezierCurveTo(-0.08, 1.03, 0.12, 1.03, 0.24, 0.99);
  s.quadraticCurveTo(0.36, 0.95, 0.35, 0.8);
  s.bezierCurveTo(0.36, 0.52, 0.3, 0.24, 0.25, 0);
  s.quadraticCurveTo(0, -0.07, -0.26, 0);
  let g: THREE.BufferGeometry = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 6, curveSegments: 32 });
  g.translate(0, 0, -0.05);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = new TessellateModifier(0.06, 6).modify(g);
  g = mergeVertices(g, 1e-4);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const uv = new Float32Array(p.count * 2);
  const R = 0.9;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i) * (1 - 0.35 * y);
    p.setXYZ(i, R * Math.sin(x / R), y, z + R * (1 - Math.cos(x / R)));
    uv[2 * i] = (x + 0.4) / 0.8;
    uv[2 * i + 1] = y;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/** light through the tip: white at the neck down to 30 % grey at the edge (4 × 128 canvas) */
function thicknessMap() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const x = c.getContext("2d");
  if (x) {
    const gr = x.createLinearGradient(0, 128, 0, 0); // canvas bottom = uv.y 0 (the neck)
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(1, "#4d4d4d");
    x.fillStyle = gr;
    x.fillRect(0, 0, 4, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

function makeKit() {
  const geo = tabGeometry();
  const tmap = thicknessMap();
  const a = new THREE.Color("#F5F3EC");
  const b = new THREE.Color("#E3D5BA");
  const mats = Array.from({ length: N }, (_, i) =>
    new THREE.MeshPhysicalMaterial({
      color: a.clone().lerp(b, i / (N - 1)),
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      transmission: 0.22,
      thickness: 0.35,
      thicknessMap: tmap,
      ior: 1.5,
      attenuationColor: new THREE.Color("#E8D7B5"),
      attenuationDistance: 0.9,
      sheen: 0.25,
      sheenColor: new THREE.Color("#ffffff"),
    }),
  );
  const steel = new THREE.MeshPhysicalMaterial({ color: "#C9CED0", metalness: 1, roughness: 0.32 });
  const porcelain = new THREE.MeshPhysicalMaterial({ color: "#F3F1EA", roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
  const stem = new THREE.CylinderGeometry(0.035, 0.035, STEM, 16);
  stem.translate(0, STEM / 2, 0);
  const collar = new THREE.CylinderGeometry(0.06, 0.05, 0.09, 20);
  collar.translate(0, STEM - 0.02, 0);
  const rivet = new THREE.CylinderGeometry(0.11, 0.11, 0.06 + N * 0.012 + 0.04, 32);
  rivet.rotateX(Math.PI / 2);
  const dispose = () => {
    [geo, stem, collar, rivet].forEach((x) => x.dispose());
    [...mats, steel, porcelain].forEach((m) => m.dispose());
    tmap.dispose();
  };
  return { geo, mats, steel, porcelain, stem, collar, rivet, dispose };
}

type Pose = { k: number[]; ry: number; s: number };

function Fan({ go, box }: { go: boolean; box: RefObject<HTMLDivElement | null> }) {
  const kit = useMemo(() => makeKit(), []);
  const group = useRef<THREE.Group>(null);
  const tabs = useRef<(THREE.Group | null)[]>([]);
  const pose = useRef<Pose>({ k: Array(N).fill(0), ry: -40, s: 0.92 });
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const vw = useThree((s) => s.viewport.width);
  const vh = useThree((s) => s.viewport.height);

  useEffect(() => () => kit.dispose(), [kit]);

  // the opening: stacked → fanned (back.out(1.2), 50 ms apart), the group from −40° to −16° (expo.out)
  useEffect(() => {
    if (!go) return;
    const p = pose.current;
    const ks = p.k.map(() => ({ v: 0 }));
    const tl = gsap.timeline({
      onUpdate: () => {
        ks.forEach((x, i) => {
          p.k[i] = x.v;
        });
        invalidate();
      },
    });
    tl.to(ks, { v: 1, duration: 1.4, ease: "back.out(1.2)", stagger: 0.05 }, 0);
    tl.to(p, { ry: -16, s: 1, duration: 1.4, ease: "expo.out" }, 0);
    return () => {
      tl.kill();
    };
  }, [go, invalidate]);

  // a mouse: the fan leans toward the pointer (±6° / ±4°), drawing only until it settles
  useEffect(() => {
    const host = box.current?.closest<HTMLElement>(".cl-hero");
    if (!host || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const t = tilt.current;
      t.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      t.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      invalidate();
    };
    const leave = () => {
      tilt.current.tx = 0;
      tilt.current.ty = 0;
      invalidate();
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [box, invalidate]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = pose.current;
    const t = tilt.current;
    t.x += (t.tx - t.x) * 0.12;
    t.y += (t.ty - t.y) * 0.12;
    if (Math.abs(t.tx - t.x) > 0.002 || Math.abs(t.ty - t.y) > 0.002) invalidate();
    // fit: the open fan (about 2.95 × 2.4 units) fills ~92 % of the canvas width, its rivet near the bottom
    const fit = Math.min((0.92 * vw) / 2.95, (0.84 * vh) / 2.4);
    g.scale.setScalar(fit * p.s);
    g.position.set(0, -vh / 2 + 0.11 * vh, 0);
    g.rotation.set((-8 + t.y * 4) * DEG, (p.ry + t.x * 6) * DEG, 0);
    tabs.current.forEach((tab, i) => {
      if (!tab) return;
      tab.rotation.set(0, (i - 3) * 2 * DEG * p.k[i], FAN[i] * DEG * p.k[i]);
    });
  });

  return (
    <group ref={group}>
      {kit.mats.map((m, i) => (
        <group
          key={i}
          ref={(el) => {
            tabs.current[i] = el;
          }}
          position={[0, 0, (i - 3) * 0.012]}
        >
          <mesh geometry={kit.stem} material={kit.steel} />
          <mesh geometry={kit.collar} material={kit.steel} />
          <mesh geometry={kit.geo} material={m} position={[0, STEM, 0]} />
        </group>
      ))}
      <mesh geometry={kit.rivet} material={kit.porcelain} />
    </group>
  );
}

export default function ShadeGuide({ vp }: { vp: HTMLElement }) {
  const box = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);

  // the opening starts when the pocket is in the frame (the frame's viewport) and the frame is on the page's screen
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let inFrame = false;
    let onPage = false;
    const sync = () => {
      if (inFrame && onPage && document.visibilityState === "visible") setGo(true);
    };
    const io = new IntersectionObserver((es) => {
      inFrame = es[es.length - 1].intersectionRatio >= 0.5;
      sync();
    }, { root: vp, threshold: [0, 0.5] });
    const po = new IntersectionObserver((es) => {
      onPage = es[es.length - 1].intersectionRatio >= 0.15;
      sync();
    }, { threshold: [0, 0.15] });
    io.observe(el);
    po.observe(vp);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      po.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [vp]);

  return (
    <div className={`cl-gl${go ? " is-on" : ""}`} ref={box}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power", toneMapping: THREE.NeutralToneMapping }}
        camera={{ fov: 28, position: [0, 0.6, 7.2] }}
        style={{ pointerEvents: "none" }}
      >
        <directionalLight color="#FFF6EA" intensity={1.2} position={[-3, 4, 4]} />
        <Environment frames={1} resolution={256} environmentIntensity={1.35}>
          <Lightformer form="rect" color="#FFF6EA" intensity={2.4} position={[-3, 4, 4]} scale={[5, 4, 1]} />
          <Lightformer form="rect" color="#A9CBC6" intensity={1.6} position={[4, 1, -3]} scale={[3, 6, 1]} />
          <Lightformer form="ring" color="#ffffff" intensity={0.8} position={[0, 0, 6]} scale={5} />
        </Environment>
        <Fan go={go} box={box} />
      </Canvas>
    </div>
  );
}
