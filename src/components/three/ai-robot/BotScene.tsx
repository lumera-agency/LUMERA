"use client";
/*
 * The robot at work (the owner, 4 Nov 2026): a wide rounded head (its look and antennas to choose from: variants.ts),
 * a bezel round a black glass screen with its face drawn on it (face.ts), round ears with lime rings; two hands floating
 * beside it, three fingers and a thumb each (hand.ts). The page's table is on its left.
 *
 * Its work, three requests a round: a small solid card (the request's words on its face) drops from above beside the
 * robot, turning in the air, and the robot watches it fall; its left hand catches it between thumb and index and holds
 * it up beside its head, its face turned toward the robot's eyes (it is reading it) yet open enough to us that we read
 * it too; it answers (the page shows the answer by its mouth); the hand carries the card to the table, where it
 * vanishes and the row appears (the page fills it). The hands stay beside the head, never in front of it. The scene
 * keeps the time and tells the page through botStage.
 *
 * It looks at its work; the pointer turns it only a little, and hardly to its right: its work is on its left (the
 * owner: turning far toward the pointer looked unnatural). The canvas lies over the whole first screen (the page under
 * it, untouched: it takes no pointer), seen through a long lens so the page's pixels map almost flat onto the scene:
 * the head sits on its slot in the layout, sized to it; a card goes to the row the page names.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CHROME_LIGHTS, createChromeEnvironment, createMirrorEnvironment, createStudioEnvironment } from "../lib/materials";
import { FACE, paintFace } from "./face";
import { FACING, cardOnHand, makeHand, poseHand, type HandPose } from "./hand";
import { makeCardStyle } from "./card-style";
import { makeAntennas, makeChinLogo, makeHandLogo, makeHandLook, makeLook, makeNeck } from "./look";
import { LIME, botStage, damp, easeInOut, paintedTexture, phase, robotPointer, type BotWords, type FaceMood } from "./shared";

const FOV = 14;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const HEAD = { width: 2.7, height: 1.85, depth: 1.55, radius: 0.45 };
const SCREEN = { width: 2.04, height: 1.2, radius: 0.42 };
const FRONT = HEAD.depth / 2;
/** where the chin's word sits: on the head's rounded lower front edge (its curve's centre HEAD.radius in from the
 *  front and the bottom), this far round from the front, just off the surface */
const CHIN = (() => {
  const tilt = 0.6;
  const reach = HEAD.radius + 0.008;
  return {
    tilt,
    position: [0, -HEAD.height / 2 + HEAD.radius - Math.sin(tilt) * reach, HEAD.depth / 2 - HEAD.radius + Math.cos(tilt) * reach] as [number, number, number],
  };
})();
/** the head's half width with its ears: the hands keep outside it */
const HEAD_SIDE = HEAD.width / 2 + 0.28;
/** the world width the head's slot stands for: the head, its ears and a little air */
const SLOT_SPAN = 3.4;
const HAND_Z = 1.2;
// thin, a pane of glass (the owner: not a thick block)
const CARD = { width: 1.5, height: 0.86, depth: 0.02 };
/** one request's turn and the round's pause after the last (seconds); the moments of a turn */
const TURN = 5.6;
const PAUSE = 2.4;
const AT = { reach: 0.45, catch: 1.05, raise: 1.7, talk: 2.8, carry: 4, fade: 4.55, land: 4.85, thumbs: 5.5 };

function roundedRect(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const left = -width / 2;
  const bottom = -height / 2;
  shape.moveTo(left + radius, bottom);
  shape.lineTo(left + width - radius, bottom);
  shape.quadraticCurveTo(left + width, bottom, left + width, bottom + radius);
  shape.lineTo(left + width, bottom + height - radius);
  shape.quadraticCurveTo(left + width, bottom + height, left + width - radius, bottom + height);
  shape.lineTo(left + radius, bottom + height);
  shape.quadraticCurveTo(left, bottom + height, left, bottom + height - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  return shape;
}

/** a flat rounded rectangle, its uv running 0…1 across it (ShapeGeometry's own uv are its coordinates) */
function panelGeometry(width: number, height: number, radius: number) {
  const geometry = new THREE.ShapeGeometry(roundedRect(width, height, radius), 16);
  const positions = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let index = 0; index < positions.count; index++) uv.setXY(index, positions.getX(index) / width + 0.5, positions.getY(index) / height + 0.5);
  return geometry;
}

/** a rounded slab: the card's body (its face is a panel laid on it) */
function slabGeometry(width: number, height: number, radius: number, depth: number) {
  const geometry = new THREE.ExtrudeGeometry(roundedRect(width, height, radius), { depth, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.006, bevelSegments: 2, curveSegments: 12 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/** the bezel: a tube round the screen's edge */
function bezelGeometry() {
  const points = roundedRect(SCREEN.width + 0.02, SCREEN.height + 0.02, SCREEN.radius + 0.01)
    .getSpacedPoints(160)
    .map((point) => new THREE.Vector3(point.x, point.y, 0));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 240, 0.045, 14, true);
}

export function BotScene({ slot, words, still }: { slot: HTMLElement; words: BotWords; still: boolean }) {
  const { gl, scene, camera } = useThree();
  const studio = useMemo(() => createStudioEnvironment(gl), [gl]);
  const chrome = useMemo(() => createChromeEnvironment(gl, CHROME_LIGHTS.signal), [gl]);
  const mirror = useMemo(() => createMirrorEnvironment(gl), [gl]);
  const look = useMemo(() => makeLook({ chrome, mirror }), [chrome, mirror]);
  const antennas = useMemo(() => makeAntennas(HEAD.height / 2, look.trim, mirror), [look, mirror]);
  const handLook = useMemo(() => makeHandLook(look), [look]);
  const handLogo = useMemo(() => makeHandLogo(), []);
  const chinLogo = useMemo(() => makeChinLogo(), []);
  const lime = useMemo(() => new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false }), []);
  const neck = useMemo(() => makeNeck(look.shell), [look]);
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.22, envMapIntensity: 1, depthWrite: false }),
    [],
  );
  // the cards' glass (card-style.ts)
  const cardStyle = useMemo(() => makeCardStyle(mirror), [mirror]);
  const cardBody = cardStyle.body;
  const face = useMemo(() => {
    const painted = paintedTexture(FACE.width, FACE.height);
    return { ...painted, material: new THREE.MeshBasicMaterial({ map: painted.texture, toneMapped: false }) };
  }, []);
  const cards = useMemo(
    () =>
      words.leads.map((lead) => {
        const painted = paintedTexture(900, 516);
        cardStyle.paint(painted.context, lead, words.tag);
        return { lead, ...painted, material: new THREE.MeshBasicMaterial({ map: painted.texture, transparent: true, depthWrite: false, toneMapped: false }) };
      }),
    [words, cardStyle],
  );
  const shapes = useMemo(
    () => ({
      shell: new RoundedBoxGeometry(HEAD.width, HEAD.height, HEAD.depth, 10, HEAD.radius),
      screen: panelGeometry(SCREEN.width, SCREEN.height, SCREEN.radius),
      bezel: bezelGeometry(),
      ear: new THREE.CylinderGeometry(0.3, 0.3, 0.18, 56),
      earDome: new THREE.SphereGeometry(0.22, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      earRing: new THREE.TorusGeometry(0.24, 0.026, 16, 72),
      cardBody: slabGeometry(CARD.width, CARD.height, 0.09, CARD.depth),
      cardFace: panelGeometry(CARD.width - 0.02, CARD.height - 0.02, 0.085),
    }),
    [],
  );
  const hands = useMemo(() => {
    const made = {
      left: makeHand(-1, handLook.palm, handLook.fingers, look.shell, handLogo),
      right: makeHand(1, handLook.palm, handLook.fingers, look.shell, handLogo),
    };
    // a little larger than built, so their fingers read beside the head
    made.left.group.scale.setScalar(1.1);
    made.right.group.scale.setScalar(1.1);
    return made;
  }, [handLook, handLogo, look]);

  const head = useRef<THREE.Group>(null);
  const cardGroups = useRef<(THREE.Group | null)[]>([]);
  const state = useRef({
    ready: false,
    time: 0,
    yaw: 0,
    pitch: 0,
    lookX: 0,
    lookY: 0,
    blinkAt: 2,
    blinked: -9,
    painted: 0,
    sway: 0,
    swaySpeed: 0,
    lastYaw: 0,
    distance: 0,
    placed: false,
    told: "",
    started: false,
    flash: -10,
  });
  const scratch = useMemo(
    () => ({
      goal: new THREE.Vector3(),
      right: new THREE.Vector3(),
      held: new THREE.Vector3(),
      turn: new THREE.Quaternion(),
      spin: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      other: new THREE.Vector3(),
      headAt: new THREE.Vector3(),
      look: new THREE.Vector3(),
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
      read: new THREE.Vector3(),
      catchAt: new THREE.Vector3(),
      rowAt: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    scene.environment = studio;
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = FOV;
    perspective.updateProjectionMatrix();
  }, [scene, camera, studio]);

  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => {
        if (alive) state.current.ready = true;
      });
    // the cards' words and the chin's again once the site's fonts are in
    document.fonts?.ready.then(() => {
      if (!alive) return;
      chinLogo.paint();
      cards.forEach((card) => {
        cardStyle.paint(card.context, card.lead, words.tag);
        card.texture.needsUpdate = true;
      });
    });
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, cards, words.tag, chinLogo, cardStyle]);

  useEffect(
    () => () => {
      for (const geometry of [...Object.values(shapes), ...hands.left.geometries, ...hands.right.geometries]) geometry.dispose();
      for (const disposable of [studio, chrome, mirror, look.shell, look.trim, look.grain, glass, lime, cardBody, face.texture, face.material]) disposable.dispose();
      antennas.dispose();
      neck.dispose();
      handLogo.dispose();
      chinLogo.dispose();
      for (const card of cards) {
        card.texture.dispose();
        card.material.dispose();
      }
    },
    [shapes, hands, studio, chrome, mirror, look, handLook, handLogo, chinLogo, antennas, neck, glass, lime, cardBody, face, cards],
  );

  useFrame((_, delta) => {
    const memory = state.current;
    if (!memory.ready || !head.current) return;
    const dt = Math.min(delta, 1 / 20);
    if (!still) memory.time += dt;
    const now = performance.now();

    // the page's pixels onto the scene: the slot's width is the head's world width, the camera far enough that the
    // canvas's height in pixels is the same scale
    const canvas = gl.domElement.getBoundingClientRect();
    const place = slot.getBoundingClientRect();
    if (canvas.height < 1 || place.width < 1) return;
    const perPixel = SLOT_SPAN / place.width;
    const distance = (canvas.height * perPixel) / (2 * TAN);
    if (Math.abs(distance - memory.distance) > 0.001) {
      memory.distance = distance;
      camera.position.set(0, 0, distance);
      camera.lookAt(0, 0, 0);
      (camera as THREE.PerspectiveCamera).far = distance * 3;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    const toWorld = (x: number, y: number, z: number, out: THREE.Vector3) =>
      out.set((x - canvas.left - canvas.width / 2) * perPixel, (canvas.top + canvas.height / 2 - y) * perPixel, z);
    const headAt = toWorld(place.left + place.width / 2, place.top + place.height / 2, 0, scratch.headAt);
    const top = (canvas.height / 2) * perPixel;
    const edge = (canvas.width / 2) * perPixel;

    // the round: three turns, then a pause; still (reduced motion): the round's end, every card recorded
    const round = TURN * cards.length + PAUSE;
    const clock = still ? round - 0.01 : memory.time % round;
    const turn = Math.min(cards.length - 1, Math.floor(clock / TURN));
    const at = clock - turn * TURN;
    const working = clock < TURN * cards.length;
    const tell = (key: string, run: () => void) => {
      if (memory.told.includes(`|${key}|`)) return;
      memory.told += `|${key}|`;
      run();
    };
    // the round's start empties the table into its slots (the first frame starts the first round)
    if (!still && ((clock < 0.1 && memory.told !== "") || !memory.started)) {
      memory.told = "";
      memory.started = true;
      botStage.reset();
    }

    // the card's size: as large as the room beside the head allows; where that is too little for it (a phone, the head
    // in the middle) the card is held lower, under the head's left
    const besideHead = headAt.x - HEAD_SIDE - 0.25 - (-edge + 0.12);
    const narrow = besideHead < (CARD.width + 0.15) * 0.6;
    const cardScale = narrow ? 0.78 : THREE.MathUtils.clamp(besideHead / (CARD.width + 0.15), 0.6, 1);
    const cardWidth = CARD.width * cardScale;
    // where the hand holds it: by its left edge (the grip), the card to the hand's right, between it and the head and
    // clear of the head, all on the screen; high beside the head on a computer (the table below), under it on a phone
    const reach = (cardWidth / 2 - 0.06) * Math.cos(FACING);
    const cardX = THREE.MathUtils.clamp(headAt.x - HEAD_SIDE - 0.12 - (cardWidth / 2) * Math.cos(FACING), -edge + 0.85 + reach, headAt.x);
    const cardY = narrow ? headAt.y - 1 : headAt.y + 0.4;
    scratch.catchAt.set(cardX - reach, cardY + 0.18, HAND_Z);
    scratch.read.set(cardX - reach, cardY, HAND_Z);
    const row = botStage.rowFor(turn)?.getBoundingClientRect();
    if (row && row.width > 0) toWorld(row.left + row.width * 0.55, row.top + row.height / 2, HAND_Z, scratch.rowAt);
    else scratch.rowAt.set(headAt.x - HEAD_SIDE - 2.2, headAt.y - 0.6, HAND_Z);

    let mood: FaceMood = "idle";
    let leftPose: HandPose = "rest";
    let rightPose: HandPose = "rest";
    let rightGoal: THREE.Vector3 | null = null;
    let lookTarget: THREE.Vector3 | null = null;
    // the left hand's grip: beside the head at rest; under the falling card; up to read; down into the row (the grip a
    // little under the row's middle, so the card's middle lands on it)
    const restLeft = scratch.goal.set(headAt.x - HEAD_SIDE - 0.4, headAt.y - 0.7, HAND_Z);
    let gripping = false;
    if (working) {
      if (at >= AT.reach && at < AT.catch) {
        scratch.goal.copy(scratch.catchAt);
        leftPose = "reach";
        gripping = true;
      } else if (at >= AT.catch && at < AT.raise) {
        scratch.goal.lerpVectors(scratch.catchAt, scratch.read, easeInOut(phase(at, AT.catch, AT.raise)));
        leftPose = "hold";
        gripping = true;
      } else if (at >= AT.raise && at < AT.carry) {
        scratch.goal.copy(scratch.read);
        scratch.goal.y += Math.sin((at - AT.raise) * 2.2) * 0.025;
        leftPose = "hold";
        gripping = true;
      } else if (at >= AT.carry && at < AT.land) {
        scratch.to.set(scratch.rowAt.x - (cardWidth / 2 - 0.06), scratch.rowAt.y, HAND_Z);
        scratch.goal.lerpVectors(scratch.read, scratch.to, easeInOut(phase(at, AT.carry, AT.fade)));
        leftPose = "place";
        gripping = true;
      } else restLeft.set(headAt.x - HEAD_SIDE - 0.4, headAt.y - 0.7, HAND_Z);

      if (at >= AT.raise && at < AT.talk) mood = "read";
      else if (at >= AT.talk && at < AT.carry + 0.2) mood = "talk";
      else if (at >= AT.land && at < AT.thumbs) mood = "happy";
      if (at >= AT.talk) tell(`say${turn}`, () => botStage.say(turn, narrow));
      if (at >= AT.carry + 0.3) tell(`hush${turn}`, () => botStage.say(null));
      if (at >= AT.land) {
        tell(`row${turn}`, () => {
          botStage.insert(turn);
          memory.flash = now;
        });
        // a thumbs up at the head's right, outside it
        if (at < AT.thumbs) {
          rightPose = "thumb";
          rightGoal = scratch.right.set(Math.min(headAt.x + HEAD_SIDE + 0.4, edge - 0.75), headAt.y - 0.15, HAND_Z);
        }
        lookTarget = scratch.look.copy(scratch.rowAt);
      }
      if (at >= AT.talk && at < AT.carry) lookTarget = scratch.look.set(headAt.x - 1.5, headAt.y - 0.4, 3);
    } else mood = clock > round - PAUSE + 0.2 && clock < round - PAUSE + 1.2 ? "happy" : "idle";

    // the left hand: turned into its pose, then moved so that its grip (not its middle) is where the grip should be
    const left = hands.left;
    poseHand(left, leftPose, dt, !memory.placed);
    left.group.updateMatrixWorld(true);
    if (gripping) {
      left.grip.getWorldPosition(scratch.other);
      scratch.goal.sub(scratch.other.sub(left.group.position));
    }
    const speed = gripping && at >= AT.catch ? 14 : 8;
    if (!memory.placed) left.group.position.copy(scratch.goal);
    left.group.position.x = damp(left.group.position.x, scratch.goal.x, speed, dt);
    left.group.position.y = damp(left.group.position.y, scratch.goal.y, speed, dt);
    left.group.position.z = damp(left.group.position.z, scratch.goal.z, speed, dt);
    left.group.updateMatrixWorld(true);

    // the card of this turn (the others hidden): it drops from above, turning in the air, and settles into the hand the
    // way the hand holds it; then it is one piece with the hand; at the row it shrinks away into it
    const card = cardGroups.current[turn];
    cardGroups.current.forEach((group, index) => {
      if (group) group.visible = working && index === turn && at < AT.land;
    });
    const cardMaterial = cards[turn]?.material;
    if (card && cardMaterial && working && at < AT.land) {
      cardOnHand(left, cardWidth / 2, scratch.held, scratch.turn);
      if (at < AT.catch) {
        const fall = phase(at, 0, AT.catch);
        const air = 1 - fall;
        scratch.from.set(scratch.held.x - 0.5, top + 1.2, HAND_Z - 0.6);
        scratch.to.lerpVectors(scratch.from, scratch.held, fall * fall);
        scratch.to.x += Math.sin(fall * Math.PI * 1.5) * 0.2 * air;
        scratch.spin.setFromEuler(scratch.euler.set(-0.1 + air * 1.3 + Math.sin(at * 7) * 0.12 * air, 0.3 + air * 1.2, air * -0.6 + Math.sin(at * 5) * 0.1 * air));
        // the last part of the fall: into the hand's hold
        const settle = easeInOut(phase(at, AT.catch - 0.32, AT.catch));
        card.position.lerpVectors(scratch.to, scratch.held, settle);
        card.quaternion.slerpQuaternions(scratch.spin, scratch.turn, settle);
        card.scale.setScalar(cardScale);
        cardMaterial.opacity = 1;
        cardBody.opacity = cardStyle.bodyOpacity;
      } else {
        const vanish = easeInOut(phase(at, AT.fade, AT.land));
        card.position.copy(scratch.held);
        card.quaternion.copy(scratch.turn);
        card.scale.setScalar(cardScale * (1 - 0.6 * vanish));
        cardMaterial.opacity = 1 - vanish;
        cardBody.opacity = cardStyle.bodyOpacity * (1 - vanish);
      }
      if (at < AT.talk || at >= AT.carry) lookTarget = card.position;
    }

    // the right hand: beside the head, a thumbs up as a card is recorded
    const right = hands.right;
    poseHand(right, rightPose, dt, !memory.placed);
    const rightAt =
      rightGoal ?? scratch.right.set(Math.min(headAt.x + HEAD_SIDE + 0.18, edge - 0.65), headAt.y - 0.7 + Math.sin(memory.time * 1.5 + 2) * 0.05, HAND_Z);
    if (!memory.placed) right.group.position.copy(rightAt);
    right.group.position.x = damp(right.group.position.x, rightAt.x, 7, dt);
    right.group.position.y = damp(right.group.position.y, rightAt.y, 7, dt);
    right.group.position.z = damp(right.group.position.z, rightAt.z, 7, dt);
    memory.placed = true;

    // where the head looks: its work; the pointer only a little and hardly to its right; else round by itself
    if (!lookTarget) lookTarget = scratch.look.set(headAt.x - 1 + Math.sin(memory.time * 0.4) * 0.8, headAt.y + Math.sin(memory.time * 0.27) * 0.4, 2);
    let offsetX = lookTarget.x - headAt.x;
    let offsetY = lookTarget.y - headAt.y;
    if (now - robotPointer.movedAt < 1600) {
      toWorld(robotPointer.x, robotPointer.y, 2, scratch.other);
      offsetX = THREE.MathUtils.lerp(offsetX, scratch.other.x - headAt.x, 0.35);
      offsetY = THREE.MathUtils.lerp(offsetY, scratch.other.y - headAt.y, 0.35);
    }
    const depth = lookTarget.z + 5;
    const yaw = THREE.MathUtils.clamp(Math.atan2(offsetX, depth), -0.5, 0.12);
    const pitch = THREE.MathUtils.clamp(-Math.atan2(offsetY, Math.hypot(offsetX, depth)), -0.3, 0.28);
    memory.yaw = damp(memory.yaw, yaw, 4.5, dt);
    memory.pitch = damp(memory.pitch, pitch, 4.5, dt);
    head.current.position.set(headAt.x, headAt.y + Math.sin(memory.time * 1.1) * 0.035, 0);
    head.current.rotation.set(memory.pitch, memory.yaw, Math.sin(memory.time * 0.6) * 0.02);
    // the eyes go further than the head (the pointer's right too, by the eyes alone)
    memory.lookX = damp(memory.lookX, THREE.MathUtils.clamp(offsetX / 3, -1, 1), 9, dt);
    memory.lookY = damp(memory.lookY, THREE.MathUtils.clamp(-offsetY / 2.2, -1, 1), 9, dt);

    // the antennas lag behind the head's turn and spring back
    const swing = (memory.yaw - memory.lastYaw) / Math.max(dt, 1e-3);
    memory.lastYaw = memory.yaw;
    memory.swaySpeed += (-swing * 0.06 - memory.sway * 60 - memory.swaySpeed * 7) * dt;
    memory.sway += memory.swaySpeed * dt;
    antennas.sways.forEach((pivot, index) => {
      pivot.rotation.z = (pivot.userData.lean as number) + memory.sway + Math.sin(memory.time * 1.7 + index) * 0.025;
    });

    if (!still && memory.time > memory.blinkAt) {
      memory.blinked = memory.time;
      memory.blinkAt = memory.time + 2.5 + Math.random() * 2.5;
    }
    const sinceBlink = memory.time - memory.blinked;
    const blink = mood === "idle" || mood === "read" ? (sinceBlink < 0.16 ? 1 - Math.abs((sinceBlink / 0.16) * 2 - 1) : 0) : 0;
    // the face at 30 frames a second is enough for a screen, and spares phones a texture upload each frame
    if (still || memory.time - memory.painted > 1 / 30) {
      memory.painted = memory.time;
      paintFace(face.context, { mood, time: memory.time, lookX: memory.lookX, lookY: memory.lookY, blink });
      face.texture.needsUpdate = true;
    }

    // the antennas' lime flashes as a card is recorded, and breathes otherwise
    const flash = Math.max(0, 1 - (now - memory.flash) / 900);
    antennas.lime.emissiveIntensity = 0.16 + 0.08 * Math.sin(memory.time * 2) + flash * 1.2;
    lime.color.copy(LIME).multiplyScalar(0.8 + flash * 0.5);
    // the hands' marks breathe like a sleeping laptop's, and flash with the antennas
    handLogo.material.color.setScalar(0.85 + 0.15 * Math.sin(memory.time * 1.6) + flash * 0.6);
    chinLogo.material.color.copy(handLogo.material.color);
    scene.environmentRotation.y = Math.sin(memory.time * 0.12) * 0.3 + memory.yaw * 0.5;
  });

  return (
    <>
      <directionalLight color={0xfff2e2} intensity={2.6} position={[-3, 4, 5]} />
      <directionalLight color={0xd6defa} intensity={1.8} position={[4, 1.5, -3]} />
      <directionalLight color={0xffffff} intensity={1.2} position={[1, 6, 2]} />
      <group ref={head}>
        <mesh geometry={shapes.shell} material={look.shell} />
        {/* the neck under the head, set back a little (look.ts) */}
        <primitive object={neck.mesh} position={[0, -HEAD.height / 2, -0.06]} />
        <mesh geometry={shapes.screen} material={face.material} position={[0, 0, FRONT + 0.012]} />
        <mesh geometry={shapes.screen} material={glass} position={[0, 0, FRONT + 0.02]} renderOrder={2} />
        <mesh geometry={shapes.bezel} material={look.trim} position={[0, 0, FRONT + 0.012]} />
        {/* «ECLO» on the chin: on the head's rounded lower edge under the screen, tilted with it, lit like the hands' marks */}
        <mesh geometry={chinLogo.geometry} material={chinLogo.material} position={CHIN.position} rotation={[CHIN.tilt, 0, 0]} renderOrder={3} />
        {/* the ears: round caps with a dome and a lime ring */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * (HEAD.width / 2 + 0.05), -0.02, -0.05]} rotation={[0, 0, (-side * Math.PI) / 2]}>
            <mesh geometry={shapes.ear} material={look.trim} />
            <mesh geometry={shapes.earDome} material={look.shell} position={[0, 0.09, 0]} scale={[1, 0.45, 1]} />
            <mesh geometry={shapes.earRing} material={lime} position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]} />
          </group>
        ))}
        <primitive object={antennas.group} />
      </group>
      <primitive object={hands.left.group} />
      <primitive object={hands.right.group} />
      {cards.map((card, index) => (
        <group
          key={index}
          ref={(group) => {
            cardGroups.current[index] = group;
          }}
          visible={false}
        >
          <mesh geometry={shapes.cardBody} material={cardBody} scale={[1, 1, cardStyle.depth]} />
          <mesh geometry={shapes.cardFace} material={card.material} position={[0, 0, (CARD.depth * cardStyle.depth) / 2 + 0.008]} renderOrder={4} />
        </group>
      ))}
    </>
  );
}
