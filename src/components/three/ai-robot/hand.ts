/*
 * The robot's hands (the owner, 4 Nov 2026: floating beside the head, not joined to it, no wrist; of fifteen kinds the
 * faceted one): a firm palm in the head's sandblasted metal with the ECLO mark lit on its back, three fingers a little
 * apart and a thumb in the bezel's silver, each finger two eight-sided pieces turning about a dark ball knuckle. Built
 * as plain three.js objects; the scene (BotScene) moves them and turns them into the story's poses each frame. A pose
 * is a bend of the fingers and an orientation of the hand, given as where the fingers point and where the palm faces.
 *
 * A card is held from behind (the owner: «запястье за карточкой, брал пальцами и сгибал»): the hand behind the card at
 * its left edge, the fingers curled round that edge onto its face. It moves with the hand as one piece (cardOnHand),
 * so when the hand turns to put it into the table, the card turns the way a card does in a hand.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { damp } from "./shared";

/** rest (beside the head), reach (open, behind the falling card), hold (reading it), place (turning it into the
 *  table), thumb (thumbs up) */
export type HandPose = "rest" | "reach" | "hold" | "place" | "thumb";

type Finger = { base: THREE.Group; tip: THREE.Group; root: number; end: number; splay: number };
type Thumb = { base: THREE.Group; bend: number; lean: number };
export type Hand = {
  group: THREE.Group;
  /** the part that turns into a pose (the group itself only moves) */
  wrist: THREE.Group;
  /** where a held card's left edge sits: at the fingers' roots, just in front of the palm */
  grip: THREE.Object3D;
  /** index, middle, ring */
  fingers: Finger[];
  thumb: Thumb;
  /** -1 the screen's left hand, 1 its right (the robot faces us: they are its right and its left) */
  out: number;
  geometries: THREE.BufferGeometry[];
};

/** a finger's piece with flat facets: an eight-sided capsule tapering from `bottom` to `top`, from its joint's centre
 *  (y 0) to the next (y `span`), its normals per face so the facets catch the light */
function faceted(span: number, bottom: number, top: number) {
  const points: THREE.Vector2[] = [];
  for (let step = 0; step <= 3; step++) {
    const angle = -Math.PI / 2 + (step / 3) * (Math.PI / 2);
    points.push(new THREE.Vector2(Math.max(0.0001, Math.cos(angle) * bottom), Math.sin(angle) * bottom));
  }
  for (let step = 0; step <= 3; step++) {
    const angle = (step / 3) * (Math.PI / 2);
    points.push(new THREE.Vector2(Math.max(0.0001, Math.cos(angle) * top), span + Math.sin(angle) * top));
  }
  const geometry = new THREE.LatheGeometry(points, 8, Math.PI / 8).toNonIndexed();
  geometry.computeVertexNormals();
  return geometry;
}

const RADIUS = 0.088;
const SPAN = { base: 0.17, tip: 0.11, thumb: 0.17 };

export function makeHand(
  out: number,
  palmMaterial: THREE.Material,
  fingerMaterial: THREE.Material,
  jointMaterial: THREE.Material,
  logo?: { geometry: THREE.BufferGeometry; material: THREE.Material },
): Hand {
  const group = new THREE.Group();
  const wrist = new THREE.Group();
  group.add(wrist);
  // a firm palm: a rounded block with small corners (not a soft cushion)
  const palm = new RoundedBoxGeometry(0.58, 0.5, 0.26, 4, 0.07);
  wrist.add(new THREE.Mesh(palm, palmMaterial));
  if (logo) {
    // on the back of the hand, just off its surface, upright toward the fingers
    palm.computeBoundingBox();
    const back = new THREE.Mesh(logo.geometry, logo.material);
    back.position.set(0, 0.02, (palm.boundingBox?.min.z ?? -0.13) - 0.004);
    back.renderOrder = 3;
    wrist.add(back);
  }
  const knuckle = new THREE.SphereGeometry(RADIUS * 0.98, 20, 14);
  const geometries: THREE.BufferGeometry[] = [palm, knuckle];
  const keep = (geometry: THREE.BufferGeometry) => {
    geometries.push(geometry);
    return geometry;
  };
  // the thumb on the hand's inner side, as on a hand whose palm faces us; the index nearest it
  const fingers = [-0.19, 0, 0.19].map((root, index) => {
    const shorter = 1 - index * 0.07;
    const base = new THREE.Group();
    base.position.set(out * root, 0.2, 0);
    base.add(new THREE.Mesh(keep(faceted(SPAN.base * shorter, RADIUS, RADIUS * 0.93)), fingerMaterial), new THREE.Mesh(knuckle, jointMaterial));
    const tip = new THREE.Group();
    tip.position.y = SPAN.base * shorter;
    tip.add(new THREE.Mesh(keep(faceted(SPAN.tip * shorter, RADIUS * 0.89, RADIUS * 0.77)), fingerMaterial), new THREE.Mesh(knuckle, jointMaterial));
    base.add(tip);
    wrist.add(base);
    // spread a little, the outer fingers outward
    return { base, tip, root: 0, end: 0, splay: out * root * 0.63 };
  });
  const thumbBase = new THREE.Group();
  thumbBase.position.set(-out * 0.26, -0.06, 0.05);
  thumbBase.add(new THREE.Mesh(keep(faceted(SPAN.thumb, RADIUS * 1.0, RADIUS * 0.86)), fingerMaterial), new THREE.Mesh(knuckle, jointMaterial));
  wrist.add(thumbBase);
  const grip = new THREE.Object3D();
  grip.position.set(0, 0.2, 0.17);
  wrist.add(grip);
  return { group, wrist, grip, fingers, thumb: { base: thumbBase, bend: 0, lean: 0.6 }, out, geometries };
}

/** how far the fingers bend at the root and at the joint, the thumb's bend and lean out, for each pose */
const BENDS: Record<HandPose, { root: number; end: number; thumb: number; lean: number }> = {
  rest: { root: 0.25, end: 0.35, thumb: 0.25, lean: 0.55 },
  reach: { root: 0.1, end: 0.1, thumb: 0.15, lean: 0.4 },
  // round the card's edge: forward at the root, then down onto its face; the thumb flat behind it
  hold: { root: 0.9, end: 1.6, thumb: 0.12, lean: 0.25 },
  place: { root: 0.9, end: 1.6, thumb: 0.12, lean: 0.25 },
  thumb: { root: 1.4, end: 1.5, thumb: 0, lean: Math.PI / 2 },
};

/** a held card's face turned toward the robot (radians about the upright): it reads it, we still can */
export const FACING = 0.58;

/** where the fingers point and where the palm faces, for the screen's left hand (the right one mirrors it) */
const AIMS: Record<HandPose, { fingers: [number, number, number]; palm: [number, number, number] }> = {
  // beside the head, raised: the fingers up, the palm turned in toward the robot and away, the back of the hand (its
  // lit mark) toward us
  rest: { fingers: [0.1, 0.95, 0.3], palm: [0.6, 0, -0.8] },
  // behind the card's left edge, the way it will hold it: the fingers toward that edge (out of the card), the palm
  // (and the card's face) turned toward the robot and us
  reach: { fingers: [-Math.cos(FACING), 0.06, Math.sin(FACING)], palm: [Math.sin(FACING), 0, Math.cos(FACING)] },
  hold: { fingers: [-Math.cos(FACING), 0.04, Math.sin(FACING)], palm: [Math.sin(FACING), 0, Math.cos(FACING)] },
  // putting it into the table: the wrist turns, the card's face squares to us and leans back into the row
  place: { fingers: [-0.97, 0.12, -0.05], palm: [0, 0.3, 0.95] },
  // the fist across, the thumb up
  thumb: { fingers: [1, 0, 0.2], palm: [0, 0, -1] },
};

const axes = { x: new THREE.Vector3(), y: new THREE.Vector3(), z: new THREE.Vector3(), basis: new THREE.Matrix4(), turn: new THREE.Quaternion() };

/** bend the fingers and turn the hand toward a pose (`snap`: at once, for the first frame) */
export function poseHand(hand: Hand, pose: HandPose, dt: number, snap = false) {
  const bends = BENDS[pose];
  const ease = (from: number, to: number) => (snap ? to : damp(from, to, 12, dt));
  hand.fingers.forEach((finger) => {
    finger.root = ease(finger.root, bends.root);
    finger.end = ease(finger.end, bends.end);
    finger.base.rotation.set(finger.root, 0, finger.splay);
    finger.tip.rotation.set(finger.end, 0, 0);
  });
  hand.thumb.bend = ease(hand.thumb.bend, bends.thumb);
  hand.thumb.lean = ease(hand.thumb.lean, bends.lean);
  hand.thumb.base.rotation.set(hand.thumb.bend, 0, hand.out * hand.thumb.lean);
  // the orientation: the fingers' way is the hand's y, the palm's facing its z (made square to y), mirrored for the right
  const aim = AIMS[pose];
  const mirror = hand.out > 0 ? -1 : 1;
  axes.y.set(aim.fingers[0] * mirror, aim.fingers[1], aim.fingers[2]).normalize();
  axes.z.set(aim.palm[0] * mirror, aim.palm[1], aim.palm[2]);
  axes.z.addScaledVector(axes.y, -axes.z.dot(axes.y)).normalize();
  axes.x.crossVectors(axes.y, axes.z);
  axes.turn.setFromRotationMatrix(axes.basis.makeBasis(axes.x, axes.y, axes.z));
  hand.wrist.quaternion.slerp(axes.turn, snap ? 1 : 1 - Math.exp(-9 * dt));
}

const held = { along: new THREE.Vector3(), turn: new THREE.Quaternion(), side: new THREE.Quaternion(), facing: new THREE.Vector3(0, 0, 1) };

/** a held card's place and turn (world): its left edge at the grip, the card running back from the fingers over the
 *  palm (the hand behind it), its face the palm's way (toward us, the fingers curled onto it), upright */
export function cardOnHand(hand: Hand, halfWidth: number, position: THREE.Vector3, turn: THREE.Quaternion) {
  hand.grip.getWorldPosition(position);
  hand.wrist.getWorldQuaternion(held.turn);
  held.along.set(0, 1, 0).applyQuaternion(held.turn);
  position.addScaledVector(held.along, -halfWidth);
  held.side.setFromAxisAngle(held.facing, (hand.out * Math.PI) / 2);
  turn.copy(held.turn).multiply(held.side);
}
