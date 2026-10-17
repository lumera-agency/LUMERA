/* eslint-disable react-hooks/immutability -- React Three Fiber: the scene and the drag state are mutated per frame by design (as src/components/three/**) */
/*
 * The shop's 3D object (spec §6, «3D-обʼєкт»): the first screen's Ваза «Грань» as a glass configurator. The visitor drags
 * to turn it and the swatches recolour the glass (Кобальт #1E57D6 / Малина #C21E62), so the 3D does a shop's job.
 * React Three Fiber, one canvas, its frame loop on demand: it draws while the vase arrives, while a colour changes, while
 * a drag and its inertia last; then nothing renders. The canvas is opaque: its background is a radial studio vignette
 * (#F7F7F5 → #EAEAE8, the photos' light; its corner matches the well). The light is made of Lightformers (no HDR file).
 *   Geometry: a lathe profile (outer wall, lip, inner wall .045 inside down to a floor at .16) smoothed by a Catmull-Rom
 *   curve, 64 samples per wall, 160 segments; twenty ribs (the radius × 1 + .022·cos 20θ, faded at the foot and the neck).
 *   Material: two passes over the same lathe, as glass is seen on a pale studio. A filter pass multiplies what is behind
 *   by the glass's colour (Кобальт #1E57D6 / Малина #C21E62), thin where the wall faces the camera and deep where it is
 *   seen edge-on (a Fresnel term), so the middle stays clear, the contour and the lip are saturated and the inner wall
 *   shows through the outer one. A reflection pass adds only what the walls mirror (MeshStandardMaterial, black body,
 *   roughness .04): the studio's softboxes as the bright vertical streaks on the ribs. No transmission render target, so
 *   it costs the same on any device.
 *   Floor: ContactShadows rendered once (when the vase stands on the floor, fading in), and a radial tint in the glass's
 *   colour in front and to the right (the coloured shadow).
 *   Entry, once the well is ≥ 40 % in the frame: the canvas fades in, the vase turns −.9 → 0 rad and rises −.12 → 0
 *   (1.6 s, expo.out), then the photo under it goes. A swatch: the colour tweens over .6 s while the vase turns +.35 rad.
 *   A drag: .008 rad/px, then inertia × .92 a frame. Reduced motion: one frame. R3F's unmount disposes the renderer and
 *   forces the context loss.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei/core/Environment";
import { Lightformer } from "@react-three/drei/core/Lightformer";
import { ContactShadows } from "@react-three/drei/core/ContactShadows";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { gsap } from "gsap";
import { useEnv } from "./env";
import type { Col } from "./products";

const GLASS: Partial<Record<Col, string>> = { kobalt: "#1E57D6", malyna: "#C21E62" };
const glassOf = (c: Col) => GLASS[c] || "#1E57D6";
/** the colour as the framebuffer holds it (sRGB): the filter multiplies the pixels already drawn */
const srgbOf = (hex: string) => {
  const c = new THREE.Color(hex);
  const o = { r: 0, g: 0, b: 0 };
  c.getRGB(o, THREE.SRGBColorSpace);
  return new THREE.Vector3(o.r, o.g, o.b);
};

/** the filter pass: white (lets everything through) where the wall faces the camera, the glass's colour where it turns
 *  away; every wall the ray crosses multiplies again, so the middle reads as two thin walls and the contour as one deep */
const FILTER_VS = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FILTER_FS = /* glsl */ `
uniform vec3 uCol;
uniform float uMin;
uniform float uMax;
varying vec3 vN;
varying vec3 vV;
void main() {
  float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  float k = mix(uMin, uMax, pow(f, 1.4));
  gl_FragColor = vec4(mix(vec3(1.0), uCol, k), 1.0);
}`;

/** the lathe: the outer wall up, the lip, the inner wall down to the floor */
function vaseGeometry() {
  const OUTER: [number, number][] = [
    [0.4, 0],
    [0.44, 0.06],
    [0.62, 0.36],
    [0.74, 0.7],
    [0.78, 0.92],
    [0.75, 1.2],
    [0.64, 1.62],
    [0.5, 2.02],
    [0.4, 2.3],
    [0.39, 2.4],
  ];
  const curve = new THREE.CatmullRomCurve3(OUTER.map(([r, y]) => new THREE.Vector3(r, y, 0)), false, "centripetal");
  const outer = curve.getPoints(63).map((p) => new THREE.Vector2(p.x, p.y));
  const inner = [...outer]
    .reverse()
    .filter((p) => p.y >= 0.16)
    .map((p) => new THREE.Vector2(p.x - 0.045, p.y));
  const pts = [new THREE.Vector2(0, 0), ...outer, new THREE.Vector2(0.355, 2.4), ...inner, new THREE.Vector2(inner[inner.length - 1].x, 0.16), new THREE.Vector2(0, 0.16)];
  const P = pts.length;
  const SEG = 160;
  let g: THREE.BufferGeometry = new THREE.LatheGeometry(pts, SEG);
  // the ribs on the outer wall (profile points 1 … 64), faded at the foot and under the neck
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const ss = (a: number, b: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  for (let i = 0; i < pos.count; i++) {
    const j = i % P;
    if (j < 1 || j > outer.length) continue;
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const th = Math.atan2(x, z);
    const w = ss(0.08, 0.3, y) * (1 - ss(2.05, 2.3, y));
    const f = 1 + 0.022 * Math.cos(20 * th) * w;
    pos.setXYZ(i, x * f, y, z * f);
  }
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  g = mergeVertices(g, 1e-5);
  g.computeVertexNormals();
  return g;
}

/** a radial on a 256² canvas: the studio's vignette (the background) or the coloured shadow (white → clear) */
function radial(stops: [number, string][], cy = 0.45, r = 190) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  if (x) {
    const g = x.createRadialGradient(128, 256 * cy, 0, 128, 256 * cy, r);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type Motion = { spin: number; vel: number; dragging: boolean };

/** the contact shadow, drawn once the vase stands on the floor (while it rises from under the floor the shadow camera
 *  would sit inside it), fading in over .6 s */
function Shadow({ still }: { still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const plane = ref.current?.children.find((x): x is THREE.Mesh => (x as THREE.Mesh).isMesh);
    const m = plane?.material as THREE.MeshBasicMaterial | undefined;
    if (!m) return;
    if (still) {
      invalidate();
      return;
    }
    const st = { o: 0 };
    m.opacity = 0;
    const tw = gsap.to(st, {
      o: 0.35,
      duration: 0.6,
      ease: "power1.out",
      onUpdate: () => {
        m.opacity = st.o;
        invalidate();
      },
    });
    return () => {
      tw.kill();
    };
  }, [still, invalidate]);
  return <ContactShadows ref={ref} position={[0, 0.002, 0]} opacity={0.35} blur={2.4} scale={3.4} far={1.4} resolution={256} frames={1} color="#2a2a2a" />;
}

function Studio() {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const t = radial(
      [
        [0, "#F7F7F5"],
        [1, "#EAEAE8"],
      ],
      0.42,
    );
    scene.background = t;
    invalidate();
    return () => {
      scene.background = null;
      t.dispose();
    };
  }, [scene, invalidate]);
  return null;
}

function Vase({ col, go, still, motion, onSettled }: { col: Col; go: boolean; still: boolean; motion: RefObject<Motion>; onSettled: () => void }) {
  const geo = useMemo(() => vaseGeometry(), []);
  const tintTex = useMemo(
    () =>
      radial(
        [
          [0, "rgba(255,255,255,1)"],
          [0.5, "rgba(255,255,255,.45)"],
          [1, "rgba(255,255,255,0)"],
        ],
        0.5,
        124,
      ),
    [],
  );
  // the filter pass's material (its colour is tweened through the uniform, never set by a prop)
  const filter = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uCol: { value: srgbOf(glassOf(col)) }, uMin: { value: 0.13 }, uMax: { value: 0.97 } },
        vertexShader: FILTER_VS,
        fragmentShader: FILTER_FS,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.MultiplyBlending,
        premultipliedAlpha: true,
      }),
    // (built once; the swatch effect below takes it from there)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const group = useRef<THREE.Group>(null);
  const tint = useRef<THREE.MeshBasicMaterial>(null);
  const pose = useRef({ r: still ? 0 : -0.9, y: still ? 0 : -0.12, turn: 0 });
  const shown = useRef(glassOf(col));
  const invalidate = useThree((s) => s.invalidate);
  const done = useRef(onSettled);
  useEffect(() => {
    done.current = onSettled;
  });

  useEffect(
    () => () => {
      geo.dispose();
      tintTex.dispose();
      filter.dispose();
    },
    [geo, tintTex, filter],
  );

  // the entry: −.9 → 0 rad and −.12 → 0, 1.6 s expo.out (once)
  useEffect(() => {
    if (!go) return;
    if (still) {
      invalidate();
      done.current();
      return;
    }
    const tw = gsap.to(pose.current, { r: 0, y: 0, duration: 1.6, ease: "expo.out", onUpdate: invalidate, onComplete: () => done.current() });
    return () => {
      tw.kill();
    };
  }, [go, still, invalidate]);

  // a swatch: the glass and its shadow take the colour over .6 s while the vase turns a little further
  useEffect(() => {
    const to = glassOf(col);
    if (to === shown.current) return;
    const a = srgbOf(shown.current);
    const b = srgbOf(to);
    const ca = new THREE.Color(shown.current);
    const cb = new THREE.Color(to);
    const c = new THREE.Color();
    const u = filter.uniforms.uCol.value as THREE.Vector3;
    shown.current = to;
    const st = { t: 0 };
    const p = pose.current;
    const apply = () => {
      u.copy(a).lerp(b, st.t);
      c.copy(ca).lerp(cb, st.t);
      tint.current?.color.copy(c);
      invalidate();
    };
    if (still) {
      st.t = 1;
      apply();
      return;
    }
    const tw = gsap.to(st, { t: 1, duration: 0.6, ease: "power2.inOut", onUpdate: apply });
    const tr = gsap.to(p, { turn: p.turn + 0.35, duration: 0.6, ease: "power2.inOut" });
    return () => {
      tw.kill();
      tr.kill();
    };
  }, [col, still, filter, invalidate]);

  useFrame(() => {
    const g = group.current;
    const m = motion.current;
    if (!g || !m) return;
    if (!m.dragging && Math.abs(m.vel) > 1e-4) {
      m.spin += m.vel;
      m.vel *= 0.92;
      invalidate();
    }
    const p = pose.current;
    g.rotation.y = p.r + p.turn + m.spin;
    g.position.y = p.y;
  });

  // (the colour the coloured shadow starts with; later changes are tweened above)
  const [color] = useState(() => glassOf(col));
  return (
    <>
      <group ref={group}>
        {/* the filter first (it multiplies the studio behind), then the reflections on top of it */}
        <mesh geometry={geo} material={filter} renderOrder={1} />
        <mesh geometry={geo} renderOrder={2}>
          <meshStandardMaterial color="#000000" roughness={0.04} metalness={0} envMapIntensity={1.6} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0.55, 0.001, 0.5]} scale={[2.4, 1.5, 1]}>
        <planeGeometry />
        <meshBasicMaterial ref={tint} map={tintTex} color={color} transparent opacity={0.3} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

export default function Vase3D({ col, onLive, onDrag }: { col: Col; onLive: () => void; onDrag: () => void }) {
  const { vp, rm } = useEnv();
  const box = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  const [settled, setSettled] = useState(false);
  const motion = useRef<Motion>({ spin: 0, vel: 0, dragging: false });
  const kick = useRef<() => void>(() => {});
  const cb = useRef({ onLive, onDrag });
  useEffect(() => {
    cb.current = { onLive, onDrag };
  });

  // the entry waits for the well to be ≥ 40 % in the frame and the frame on the page's screen
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let inFrame = false;
    let onPage = false;
    const sync = () => {
      if (inFrame && onPage && document.visibilityState === "visible") setGo(true);
    };
    const io = new IntersectionObserver(
      (es) => {
        inFrame = es[es.length - 1].intersectionRatio >= 0.4;
        sync();
      },
      { root: vp, threshold: [0, 0.4] },
    );
    const po = new IntersectionObserver(
      (es) => {
        onPage = es[es.length - 1].intersectionRatio >= 0.15;
        sync();
      },
      { threshold: [0, 0.15] },
    );
    io.observe(el);
    po.observe(vp);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      po.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [vp]);

  // a drag turns it (.008 rad/px); let go, it coasts (× .92 a frame) until it settles
  useEffect(() => {
    const well = box.current?.parentElement;
    if (!well) return;
    let last = 0;
    let id = -1;
    let k = 1;
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest(".sh-sw")) return;
      id = e.pointerId;
      last = e.clientX;
      k = well.getBoundingClientRect().width / (well.offsetWidth || 1) || 1;
      motion.current.dragging = true;
      motion.current.vel = 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const dx = (e.clientX - last) / k;
      last = e.clientX;
      if (!dx) return;
      const d = dx * 0.008;
      motion.current.spin += d;
      motion.current.vel = d;
      cb.current.onDrag();
      kick.current();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      motion.current.dragging = false;
      kick.current();
    };
    well.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      well.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div className={`sh-gl${go ? " is-on" : ""}`} ref={box} aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.NeutralToneMapping, powerPreference: "high-performance" }}
        camera={{ fov: 24, position: [0, 1.35, 7.4] }}
        onCreated={({ camera, invalidate, gl }) => {
          camera.lookAt(0, 1.1, 0);
          // (an opaque canvas clears to alpha 1, which the contact shadow's render target would keep as a black floor)
          gl.setClearColor("#eaeae8", 0);
          kick.current = () => invalidate();
        }}
      >
        <Studio />
        <Environment frames={1} resolution={256}>
          <Lightformer form="rect" intensity={3} position={[0, 4, -3]} scale={[8, 2, 1]} target={[0, 1.1, 0]} />
          <Lightformer form="rect" intensity={4} position={[-3.2, 1.2, 1]} scale={[0.5, 5, 1]} target={[0, 1.1, 0]} />
          <Lightformer form="rect" intensity={2.5} position={[3.4, 1.4, 0.5]} scale={[0.8, 5, 1]} target={[0, 1.1, 0]} />
        </Environment>
        <Vase
          col={col}
          go={go}
          still={rm}
          motion={motion}
          onSettled={() => {
            setSettled(true);
            cb.current.onLive();
          }}
        />
        {settled ? <Shadow still={rm} /> : null}
      </Canvas>
    </div>
  );
}
