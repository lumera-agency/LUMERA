/*
 * «Про нас», B «Робочий стіл», the first screen's object: the studio's mark (mark-geometry.ts) as heavy polished chrome
 * with an ember rim, after motionsites' glossy 3D heroes (Facet Glass, Halo Prism, Arctis) and the footer's chrome
 * wordmark (fx/chrome-wordmark): hard-edged studio strips on black, warm light swirling in the bevels.
 * Plain three.js, no React: mountMark(host, …) puts a transparent canvas in `host` and returns its destroy().
 *
 * Costs: one mesh (about 25k triangles), one physical material, a studio environment baked once (PMREM, nothing loaded
 * from the network). The pixel ratio at most `maxDpr` (1.5). It draws only while it is on the screen and the tab is
 * visible (IntersectionObserver, visibilitychange); off the screen no frame is asked for at all. It turns slowly on
 * its own, a sway about its upright and a little nod, from the poster's pose (t = 0, so the canvas takes over the
 * still without a jump); a mouse leans it a little toward the pointer (`lean`).
 */
import * as THREE from "three";
import { createMarkGeometry } from "./mark-geometry";

/** the pose at t = 0: the poster (public/img/about/pb-mark.webp) is this frame */
export const POSE = { yaw: -0.36, pitch: -0.12, roll: -0.04 };
/** the sway: amplitude (rad) and period (s) */
const SWAY = { yaw: 0.4, yawT: 16, pitch: 0.06, pitchT: 11 };
/** the pointer's lean at most (rad), and how quickly it follows (1/s) */
const LEAN = { yaw: 0.22, pitch: 0.14, follow: 3.5 };
const FOV = 24;
const DIST = 6.4;

const EMBER = 0xd2561c;

/** what the chrome reflects, painted on a sphere and baked once (PMREM): a dark studio with a faint warm sky over a
 *  black floor (the horizon runs through the bevels), a big soft box high on the left (the face swings through it as it
 *  turns), two crisp strips, a cool rim, two ember strips behind and an ember bounce from the floor: the rim light */
const ENV_FRAG = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uEmber;
  const float PI = 3.14159265;
  float box(vec3 d, vec3 c, float r, float soft) {
    float a = acos(clamp(dot(d, normalize(c)), -1.0, 1.0));
    return 1.0 - smoothstep(r - soft, r + soft, a);
  }
  float strip(vec3 d, float az, float w, float soft, float y0, float y1) {
    float a = atan(d.x, d.z);
    float da = abs(mod(a - az + PI, 2.0 * PI) - PI);
    float h = smoothstep(y0 - 0.06, y0, d.y) * (1.0 - smoothstep(y1, y1 + 0.06, d.y));
    return (1.0 - smoothstep(w - soft, w + soft, da)) * h;
  }
  void main() {
    vec3 d = normalize(vDir);
    vec3 c = vec3(0.01);
    c += vec3(0.1, 0.095, 0.09) * smoothstep(-0.03, 0.6, d.y);
    float louver = 1.0 - 0.9 * (1.0 - smoothstep(0.006, 0.012, abs(d.y - 0.2))) - 0.9 * (1.0 - smoothstep(0.006, 0.012, abs(d.y - 0.36)));
    vec3 bc = normalize(vec3(-0.86, 0.28, 0.42));
    float ba = acos(clamp(dot(d, bc), -1.0, 1.0));
    c += vec3(1.9, 1.84, 1.74) * box(d, bc, 0.34, 0.035) * (0.18 + 0.82 * pow(1.0 - clamp(ba / 0.34, 0.0, 1.0), 0.7)) * (0.45 + 0.55 * smoothstep(0.0, 0.5, d.y)) * louver;
    c += vec3(1.4, 1.3, 1.2) * exp(-pow((d.y - 0.04) / 0.016, 2.0)) * smoothstep(-0.4, 0.3, d.z);
    c += vec3(1.3) * box(d, vec3(0.0, 1.0, 0.25), 0.3, 0.08);
    c += vec3(3.0, 3.0, 3.1) * strip(d, -0.22, 0.035, 0.008, -0.35, 0.75);
    c += vec3(2.4, 2.55, 2.8) * strip(d, 0.72, 0.05, 0.01, -0.5, 0.8);
    c += vec3(1.2, 1.3, 1.5) * strip(d, 1.6, 0.08, 0.03, -0.3, 0.6);
    c += uEmber * 4.5 * strip(d, -2.35, 0.16, 0.06, -0.7, 0.75);
    c += uEmber * 3.5 * strip(d, 2.3, 0.13, 0.06, -0.6, 0.65);
    c += uEmber * 0.7 * smoothstep(-0.15, -0.75, d.y);
    gl_FragColor = vec4(c, 1.0);
  }
`;
function studio(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 96, 48);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uEmber: { value: new THREE.Color(EMBER) } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: ENV_FRAG,
  });
  env.add(new THREE.Mesh(geo, mat));
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.01).texture;
  pmrem.dispose();
  geo.dispose();
  mat.dispose();
  return texture;
}

type Options = {
  /** the pixel ratio at most */
  maxDpr: number;
  /** a mouse leans it toward the pointer */
  lean: boolean;
  /** the first frame is on the canvas (the still under it can go) */
  onReady?: () => void;
};

type Debug = { frames: number; running: boolean; yaw: number; snap: (size: number, at?: number) => string };
declare global {
  interface Window {
    /** development only: the frame counter and a still of the poster's pose, for the page's checks */
    __pbMark?: Debug;
  }
}

export function mountMark(host: HTMLElement, { maxDpr, lean, onReady }: Options) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = "pb-mark__gl";
  canvas.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const envMap = studio(renderer);
  scene.environment = envMap;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, DIST);

  const geometry = createMarkGeometry();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xf4f1ec,
    metalness: 1,
    roughness: 0.12,
    envMapIntensity: 1.15,
    clearcoat: 0.4,
    clearcoatRoughness: 0.06,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const turn = new THREE.Group();
  turn.add(mesh);
  scene.add(turn);

  let w = 0;
  let h = 0;
  const size = () => {
    // the layout size (not the bounding box: the box comes in scaled)
    w = Math.max(1, host.clientWidth);
    h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  size();
  host.append(canvas);

  /* the pose: the sway from the poster's pose, plus the lean */
  let t = 0;
  const lean0 = { yaw: 0, pitch: 0 };
  const leanTo = { yaw: 0, pitch: 0 };
  const pose = (time: number, l = lean0) => {
    const k = 2 * Math.PI;
    turn.rotation.set(
      POSE.pitch + SWAY.pitch * Math.sin((k * time) / SWAY.pitchT) + l.pitch,
      POSE.yaw + SWAY.yaw * Math.sin((k * time) / SWAY.yawT) + l.yaw,
      POSE.roll,
      "YXZ",
    );
  };

  let frames = 0;
  let raf = 0;
  let last = 0;
  let inView = false;
  let ready = false;
  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    t += dt;
    const f = 1 - Math.exp(-dt * LEAN.follow);
    lean0.yaw += (leanTo.yaw - lean0.yaw) * f;
    lean0.pitch += (leanTo.pitch - lean0.pitch) * f;
    pose(t);
    renderer.render(scene, camera);
    frames++;
    if (!ready) {
      ready = true;
      requestAnimationFrame(() => onReady?.());
    }
    if (running()) raf = requestAnimationFrame(frame);
  };
  const running = () => inView && !document.hidden;
  const sync = () => {
    if (running() && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!running() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    sync();
  });
  io.observe(host);
  document.addEventListener("visibilitychange", sync);
  const ro = new ResizeObserver(() => {
    size();
    if (!raf) {
      pose(t);
      renderer.render(scene, camera);
    }
  });
  ro.observe(host);

  /* a mouse: the pointer's place against the object's centre, a screen away = the full lean */
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = host.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.5)));
    leanTo.yaw = nx * LEAN.yaw;
    leanTo.pitch = ny * LEAN.pitch;
  };
  const onLeave = () => {
    leanTo.yaw = 0;
    leanTo.pitch = 0;
  };
  if (lean) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }

  if (process.env.NODE_ENV !== "production") {
    window.__pbMark = {
      get frames() {
        return frames;
      },
      get running() {
        return Boolean(raf);
      },
      get yaw() {
        return turn.rotation.y;
      },
      /** the poster's pose at size × size, as WebP (transparent) */
      snap(px: number, at = 0) {
        renderer.setPixelRatio(1);
        renderer.setSize(px, px, false);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
        pose(at, { yaw: 0, pitch: 0 });
        renderer.render(scene, camera);
        const url = canvas.toDataURL("image/webp", 0.9);
        size();
        return url;
      },
    } as Debug;
  }

  return () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    geometry.dispose();
    material.dispose();
    envMap.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    if (process.env.NODE_ENV !== "production") delete window.__pbMark;
  };
}
