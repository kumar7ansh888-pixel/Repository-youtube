// "The Man Who Sold the Eiffel Tower": the Eiffel Tower on the Champ de Mars (TOWER, origin) with the Seine behind it,
// a Paris street looking down to the tower (STREET), Alpine railway (TRAIN), the Atlantic and New York (OCEAN),
// and indoor sets floating above the world (ROOM.*): hotel suite, office, police station, gangster office, prison cell.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ctex, grassHD, cloudHD, facadeHD, roofHD, planksHD, stoneHD, waterNear, waterFar } from "../lib/paint.js";
import { LIGHTS, LOOK } from "../lib/lights.js";
import { GRADES } from "../lib/grade.js";
import { TONE, CHAR, LFB, untone } from "../lib/shade.js";
import { NOINK } from "../lib/ink.js";
import { V, lam, tile, boxGeo, beam, quadUp, Batch } from "./geom.js";
import { WATER_DECL, WATER_COL } from "./water.js";
import { dustTex, awningTex } from "./tex.js";
import { marbleTex } from "./tajtex.js";
import * as GT from "./gatex.js";
import * as PT from "./ptex.js";
import { Cast } from "./cast.js";

export const TOWER = [0, 0, 0];
export const STREET = [-150, 0, -430];   // street runs along z (x = -150), opens onto the Champ de Mars at z = -250
export const SEINE = [230, 330];          // river between these z values
export const TRAIN = [3000, 0, 0];
export const FARM = [5000, 0, -2600];         // the Olsen farm, Fruita, Colorado (Mike)
export const DESERT = [3900, 0, -2600];      // Arizona highway + the Phoenix motel
export const MOTEL = [3940, 0, -2622];
export const TOUR = [6100, 0, -2600];        // 1946 fairground sideshow
export const FEST = [5000, 0, -3500];        // Fruita today: Mike the Headless Chicken Festival         // the Crouch farm in Kentucky (meat shower)        // railway along x at z = 0 near TRAIN
export const NAP = [-3500, 0, 3000];        // 1807: Berthier's estate outside Paris, the rabbit hunt (Napoleon vs the bunnies)
export const OCEAN = [8000, 0, 0];        // sea starts at x = 8000; New York skyline at x = 12500
const RY = 2000;
export const ROOM = { office: [0, RY, 0], bank: [200, RY, 0], living: [400, RY, 0], interro: [600, RY, 0], showroom: [800, RY, 0], oval: [1000, RY, 0], motel: [1200, RY, 0] };

// ---------------- night preset (moonlight) ----------------
LIGHTS.night = {
  az: 60, el: 40, lit: [0.5, 0.6, 0.95], shade: [0.08, 0.09, 0.19], lift: [0.03, 0.04, 0.09], lambert: 0.35, sideK: 0.8, term: 0.2,
  charTint: [0.66, 0.74, 1.0], charShade: 0.85, charGrad: 0.08, bodyGrad: 0.2, sideTint: [0.85, 0.85, 0.95], blob: [0.6, 0.6, 0.7], actorShadow: false,
  top: "#0a1330", hor: "#2b3b6b", skyCurve: [0, 0.5, 0.6], fog: "#1d2849", fogNear: 60, fogFar: 600, sunDisc: "#dfe8ff",
  sunCol: "#aac4ff", sunI: 1.2, sky: "#30406a", ground: "#20243a", hemiI: 0.4, bias: -0.00025, normalBias: 0.015,
};
LOOK.night = {
  sky: { c: ["#33467a", "#273a6a", "#1b2a52", "#121d3e", "#0a1330"], e: [0, 4, 10, 20, 40] },
  water: {}, cloud: { lit: "#6a7699", mid: "#4a5577", shade: "#2f3856" }, bounce: [0, 0, 0], sat: 0.95,
};
GRADES.night = { ky: [0, 0.09, 0.26, 0.55, 0.8, 0.93, 1], sat: [1.0, 1.05, 1.0], tintS: [0.02, 0.0], tintM: [0.01, 0.0], tintH: [0, 0], vig: [0.3, 0.4] };
// grey overcast-ish March morning: the day preset with a cooler grade
GRADES.cool = { ...GRADES.day, sat: [0.85, 0.85, 0.85] };

const hh = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const quad = (a, b, c, d) => {
  const g = new THREE.BufferGeometry(), n = b.clone().sub(a).cross(d.clone().sub(a)).normalize();
  g.setAttribute("position", new THREE.Float32BufferAttribute([a, b, c, a, c, d].flatMap((v) => [v.x, v.y, v.z]), 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 2, 3, 4, 5].flatMap(() => [n.x, n.y, n.z]), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  return g;
};
const cyl = (r0, r1, h, seg, x, y, z, rx = 0, rz = 0) => { const g = new THREE.CylinderGeometry(r0, r1, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); return g; };
/** side profile [z, y][] extruded across x from -w/2 to w/2 (plus offset ox) */
const prism = (pts, w, ox = 0) => {
  const s = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
  g.rotateY(-Math.PI / 2); g.translate(ox + w / 2, 0, 0);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 3, uv.getY(i) / 3);
  return g;
};
const merge = (gs) => mergeGeometries(gs.map((g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!["position", "normal", "uv"].includes(k)) n.deleteAttribute(k); return n; }), false);
const VEH = {
  tank() {
    const body = [], dark = [];
    body.push(prism([[-2.9, 0.75], [2.6, 0.75], [2.95, 1.25], [1.7, 2.05], [-2.5, 2.05], [-2.9, 1.6]], 2.3));
    for (const s of [-1, 1]) {
      dark.push(prism([[-3.0, 0.35], [-2.7, 0.02], [2.7, 0.02], [3.05, 0.4], [2.8, 0.95], [-2.8, 0.95]], 0.55, s * 1.43));
      for (let z = -2.1; z <= 2.2; z += 0.85) dark.push(cyl(0.34, 0.34, 0.12, 12, s * 1.74, 0.42, z, 0, Math.PI / 2));
    }
    body.push(boxGeo(-1.72, 0.95, -2.8, 1.72, 1.06, 2.75, 3));
    body.push(cyl(0.95, 1.1, 0.85, 14, 0, 2.47, -0.4));
    body.push(boxGeo(-0.7, 2.1, -1.65, 0.7, 2.75, -0.9, 3));
    body.push(boxGeo(-0.45, 2.15, 0.45, 0.45, 2.8, 0.85, 3));
    body.push(cyl(0.09, 0.1, 2.5, 8, 0, 2.47, 2.05, Math.PI / 2));
    body.push(cyl(0.3, 0.3, 0.14, 10, 0.32, 2.96, -0.55));
    return { body, dark };
  },
  truck() {
    const body = [], dark = [], tilt = [];
    body.push(boxGeo(-1.1, 1.0, -3.3, 1.1, 1.5, 0.3, 3));
    for (const s of [-1, 1]) body.push(boxGeo(s * 1.1 - 0.05, 1.5, -3.3, s * 1.1 + 0.05, 2.0, 0.3, 3));
    const t = new THREE.CylinderGeometry(1.12, 1.12, 3.6, 14, 1, false, -Math.PI / 2, Math.PI); t.rotateX(Math.PI / 2); t.rotateZ(0); t.scale(1, 0.8, 1); t.translate(0, 1.95, -1.5); tilt.push(t);
    body.push(boxGeo(-1.05, 1.0, 0.45, 1.05, 2.45, 1.85, 3));
    body.push(boxGeo(-0.75, 1.0, 1.85, 0.75, 1.85, 3.3, 3));
    for (const s of [-1, 1]) body.push(boxGeo(s * 1.05 - 0.25, 1.0, 1.9, s * 1.05 + 0.1, 1.15, 3.2, 3));
    dark.push(boxGeo(-0.95, 1.75, 1.84, 0.95, 2.3, 1.9, 1));
    for (const s of [-1, 1]) for (const z of [2.55, -1.0, -2.35]) dark.push(cyl(0.5, 0.5, 0.32, 14, s * 0.98, 0.5, z, 0, Math.PI / 2));
    return { body, dark, tilt };
  },
  ute() {
    const body = [], dark = [];
    body.push(boxGeo(-1.0, 0.9, -3.0, 1.0, 1.3, 0.3, 3));
    for (const s of [-1, 1]) body.push(boxGeo(s * 1.0 - 0.05, 1.3, -3.0, s * 1.0 + 0.05, 1.7, 0.3, 3));
    body.push(boxGeo(-1.0, 1.3, -3.05, 1.0, 1.7, -2.95, 1));
    body.push(boxGeo(-0.95, 0.9, 0.4, 0.95, 2.3, 1.7, 3));
    body.push(boxGeo(-0.7, 0.9, 1.7, 0.7, 1.6, 3.0, 3));
    for (const s of [-1, 1]) body.push(boxGeo(s * 0.95 - 0.2, 0.9, 1.75, s * 0.95 + 0.1, 1.05, 2.9, 3));
    dark.push(boxGeo(-0.85, 1.65, 1.69, 0.85, 2.15, 1.75, 1));
    for (const s of [-1, 1]) for (const z of [2.3, -2.1]) dark.push(cyl(0.48, 0.48, 0.3, 14, s * 0.92, 0.48, z, 0, Math.PI / 2));
    return { body, dark };
  },
  jeep() {
    const body = [], dark = [];
    body.push(boxGeo(-0.78, 0.45, -1.6, 0.78, 1.0, 1.0, 2));
    body.push(prism([[1.0, 0.45], [1.75, 0.45], [1.75, 0.9], [1.0, 1.0]], 1.3));
    for (const s of [-1, 1]) { body.push(beam(V(s * 0.7, 1.0, 1.0), V(s * 0.7, 1.55, 0.9), 0.06, 0.06)); }
    body.push(beam(V(-0.7, 1.55, 0.9), V(0.7, 1.55, 0.9), 0.06, 0.06));
    dark.push(boxGeo(-0.6, 0.7, -1.2, 0.6, 1.15, -0.95, 1)); dark.push(boxGeo(-0.6, 0.7, -0.2, 0.6, 1.1, 0.05, 1));
    for (const s of [-1, 1]) for (const z of [1.2, -1.1]) dark.push(cyl(0.38, 0.38, 0.25, 12, s * 0.78, 0.38, z, 0, Math.PI / 2));
    return { body, dark };
  },
  gun() {
    const body = [], dark = [];
    body.push(boxGeo(-1.1, 0.5, 0.0, 1.1, 1.7, 0.08, 2));
    body.push(cyl(0.12, 0.14, 3.2, 8, 0, 1.15, 1.2, Math.PI / 2 - 0.12));
    body.push(boxGeo(-0.3, 0.8, -0.6, 0.3, 1.3, 0.3, 2));
    for (const s of [-1, 1]) { body.push(beam(V(0, 0.8, -0.3), V(s * 1.2, 0.05, -3.2), 0.14, 0.14)); dark.push(cyl(0.6, 0.6, 0.22, 14, s * 1.0, 0.6, -0.2, 0, Math.PI / 2)); }
    return { body, dark };
  },
  halftrack() {
    const body = [], dark = [], horn = [];
    body.push(boxGeo(-1.1, 0.9, -3.2, 1.1, 1.9, 0.6, 3));
    body.push(boxGeo(-1.0, 0.9, 0.6, 1.0, 2.0, 1.6, 3));
    body.push(boxGeo(-0.75, 0.9, 1.6, 0.75, 1.7, 3.0, 3));
    dark.push(boxGeo(-0.9, 1.5, 1.58, 0.9, 1.95, 1.62, 1));
    for (const s of [-1, 1]) { dark.push(prism([[-3.1, 0.3], [-2.85, 0.02], [-0.2, 0.02], [0.05, 0.35], [-0.2, 0.85], [-2.9, 0.85]], 0.42, s * 0.92)); dark.push(cyl(0.48, 0.48, 0.3, 14, s * 0.95, 0.48, 2.4, 0, Math.PI / 2)); }
    // speaker tower: three big square horns facing back (-z) and up
    body.push(boxGeo(-0.15, 1.9, -1.6, 0.15, 3.4, -1.3, 1));
    for (const [x, y] of [[-0.75, 3.6], [0.75, 3.6], [0, 4.6]]) {
      const h = new THREE.CylinderGeometry(0.75, 0.16, 1.7, 4, 1, true); h.rotateY(Math.PI / 4); h.rotateX(-Math.PI / 2); h.translate(x, y, -2.3); horn.push(h);
      body.push(boxGeo(x - 0.22, y - 0.22, -1.6, x + 0.22, y + 0.22, -1.2, 1));
    }
    return { body, dark, horn };
  },
  antenna() {
    const t = VEH.truck();
    t.dark.push(cyl(0.03, 0.05, 9, 5, 0.8, 6.5, -2.9));
    t.dark.push(cyl(0.03, 0.05, 7, 5, -0.8, 5.5, -2.9));
    return t;
  },
  bicycle() {
    const body = [], dark = [];
    for (const z of [-0.55, 0.55]) { const w = new THREE.TorusGeometry(0.34, 0.03, 6, 22); w.rotateY(Math.PI / 2); w.translate(0, 0.36, z); dark.push(w); }
    const P = (x, y, z) => V(x, y, z);
    for (const [a, b] of [[P(0, 0.36, -0.55), P(0, 0.62, -0.1)], [P(0, 0.62, -0.1), P(0, 0.85, -0.2)], [P(0, 0.62, -0.1), P(0, 0.78, 0.4)], [P(0, 0.36, -0.55), P(0, 0.78, -0.15)], [P(0, 0.78, 0.4), P(0, 0.36, 0.55)], [P(0, 0.78, 0.4), P(0, 1.0, 0.42)], [P(-0.28, 1.0, 0.42), P(0.28, 1.0, 0.42)]]) body.push(beam(a, b, 0.035, 0.035));
    dark.push(boxGeo(-0.08, 0.84, -0.32, 0.08, 0.9, -0.1, 1));
    return { body, dark };
  },
  boat() {
    const body = [], dark = [];
    body.push(boxGeo(-0.85, 0.0, -2.6, 0.85, 0.12, 2.4, 2));
    for (const s of [-1, 1]) body.push(boxGeo(s * 0.85 - 0.06, 0.0, -2.6, s * 0.85 + 0.06, 0.7, 2.4, 2));
    body.push(prism([[2.4, 0.0], [3.1, 0.55], [3.1, 0.7], [2.4, 0.7]], 1.82));
    body.push(boxGeo(-0.85, 0.0, -2.66, 0.85, 0.7, -2.54, 2));
    for (const z of [-1.5, 0, 1.5]) dark.push(boxGeo(-0.8, 0.35, z - 0.1, 0.8, 0.45, z + 0.1, 1));
    return { body, dark };
  },
  lct() {
    const body = [], dark = [];
    body.push(boxGeo(-4.5, -1.2, -15, 4.5, 0.2, 13, 4));
    for (const s of [-1, 1]) body.push(boxGeo(s * 4.5 - 0.3, 0.2, -15, s * 4.5 + 0.3, 2.4, 13, 4));
    body.push(boxGeo(-4.5, 0.2, -15, 4.5, 6.5, -11, 4));
    dark.push(boxGeo(-3.5, 4.6, -11.05, 3.5, 5.4, -10.95, 1));
    return { body, dark };
  },
  ramp() { return { body: [boxGeo(-4.2, 0, 0, 4.2, 0.25, 6, 3)], dark: [] }; },
  ship() {
    const body = [], dark = [], deck = [];
    body.push(prism([[-70, -6], [62, -6], [80, 6], [80, 9], [-72, 9], [-74, 2]], 20));
    deck.push(boxGeo(-9.9, 8.9, -71, 9.9, 9.1, 79, 6));
    body.push(boxGeo(-8, 9, -30, 8, 21, 10, 4));
    body.push(boxGeo(-6, 21, -20, 6, 26, 2, 4));
    dark.push(cyl(2.6, 2.8, 10, 14, 0, 30, -12));
    for (const z of [-55, 40]) dark.push(cyl(0.4, 0.5, 22, 6, 0, 20, z));
    return { body, dark, deck };
  },
  plane() {
    const body = [], dark = [];
    const f = new THREE.CylinderGeometry(0.55, 0.18, 8.5, 10); f.rotateX(Math.PI / 2); f.translate(0, 1.9, -1.2); body.push(f);
    body.push(cyl(0.6, 0.55, 1.6, 10, 0, 1.9, 3.6, Math.PI / 2));
    body.push(boxGeo(-7.2, 2.75, 1.0, 7.2, 2.9, 3.1, 4));
    body.push(boxGeo(-2.3, 1.95, -5.4, 2.3, 2.02, -4.4, 2));
    body.push(boxGeo(-0.04, 1.95, -5.5, 0.04, 3.4, -4.5, 2));
    for (const s of [-1, 1]) { body.push(beam(V(s * 0.5, 1.4, 2.4), V(s * 3.2, 2.75, 2.0), 0.07, 0.07)); body.push(beam(V(s * 0.4, 1.4, 2.6), V(s * 1.1, 0.4, 2.8), 0.07, 0.07)); dark.push(cyl(0.32, 0.32, 0.15, 12, s * 1.15, 0.32, 2.8, 0, Math.PI / 2)); }
    dark.push(boxGeo(-0.5, 2.0, 1.2, 0.5, 2.72, 3.0, 1));
    dark.push(boxGeo(-0.08, 1.2, 4.42, 0.08, 2.6, 4.48, 1));
    return { body, dark };
  },
  camera() {
    const body = [], dark = [];
    dark.push(boxGeo(-0.25, 1.35, -0.35, 0.25, 1.75, 0.35, 1));
    dark.push(cyl(0.22, 0.22, 0.1, 16, 0, 2.0, -0.15, 0, Math.PI / 2)); dark.push(cyl(0.22, 0.22, 0.1, 16, 0, 2.0, 0.25, 0, Math.PI / 2));
    body.push(cyl(0.1, 0.12, 0.3, 10, 0, 1.55, 0.5, Math.PI / 2));
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; body.push(beam(V(0, 1.35, 0), V(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6), 0.04, 0.04)); }
    return { body, dark };
  },
  loco() {
    const body = [], dark = [];
    const b = new THREE.CylinderGeometry(1.1, 1.1, 6.5, 16); b.rotateX(Math.PI / 2); b.translate(0, 2.3, 1.2); body.push(b);
    body.push(boxGeo(-1.4, 1.0, -3.6, 1.4, 4.0, -1.4, 2));
    dark.push(boxGeo(-1.5, 3.95, -3.8, 1.5, 4.25, -1.2, 1));
    dark.push(cyl(0.35, 0.5, 1.6, 10, 0, 3.9, 3.6)); dark.push(cyl(0.45, 0.45, 0.6, 10, 0, 3.5, 1.2));
    dark.push(boxGeo(-1.3, 0.6, -3.8, 1.3, 1.0, 4.6, 2));
    for (const s of [-1, 1]) for (const z of [-2.4, 0, 1.7, 3.4]) dark.push(cyl(z < 1 && z > -1 ? 0.9 : 0.6, z < 1 && z > -1 ? 0.9 : 0.6, 0.18, 14, s * 1.25, z < 1 && z > -1 ? 0.9 : 0.6, z, 0, Math.PI / 2));
    dark.push(boxGeo(-1.05, 2.6, -1.42, 1.05, 3.5, -1.38, 1));
    return { body, dark };
  },
  carriage() {
    const body = [], dark = [], tilt = [];
    body.push(boxGeo(-1.4, 0.9, -8, 1.4, 3.6, 8, 3));
    const t = new THREE.CylinderGeometry(1.5, 1.5, 16.2, 16, 1, false, -Math.PI / 2, Math.PI); t.rotateX(Math.PI / 2); t.scale(1, 0.35, 1); t.translate(0, 3.6, 0); dark.push(t);
    for (let k = 0; k < 6; k++) for (const s of [-1, 1]) dark.push(boxGeo(s * 1.41 - 0.01, 2.0, -6.6 + k * 2.6, s * 1.41 + 0.01, 3.1, -5.0 + k * 2.6, 1));
    for (const s of [-1, 1]) for (const z of [-6, -4.6, 4.6, 6]) dark.push(cyl(0.5, 0.5, 0.16, 12, s * 1.2, 0.5, z, 0, Math.PI / 2));
    body.push(boxGeo(-1.35, 0.82, -9.4, 1.35, 0.95, -8, 2));
    for (const s of [-1, 1]) { dark.push(beam(V(s * 1.3, 0.95, -9.35), V(s * 1.3, 1.9, -9.35), 0.06, 0.06)); dark.push(beam(V(s * 1.3, 1.9, -9.35), V(s * 1.3, 1.9, -8.0), 0.06, 0.06)); }
    dark.push(beam(V(-1.3, 1.9, -9.35), V(1.3, 1.9, -9.35), 0.06, 0.06)); dark.push(beam(V(-1.3, 1.4, -9.35), V(1.3, 1.4, -9.35), 0.05, 0.05));
    return { body, dark, tilt };
  },
  coach() { // Napoleon's travelling coach (forward +z): dark green body, gold trim, big rear wheels, driver's box in front
    const body = [], dark = [], tilt = [];
    body.push(boxGeo(-0.85, 0.85, -1.2, 0.85, 2.25, 1.0, 2));
    body.push(boxGeo(-0.9, 2.25, -1.3, 0.9, 2.4, 1.1, 1));
    body.push(boxGeo(-0.7, 0.8, 1.0, 0.7, 1.45, 2.0, 1));
    tilt.push(boxGeo(-0.88, 1.5, -1.0, -0.84, 2.05, 0.8, 1)); tilt.push(boxGeo(0.84, 1.5, -1.0, 0.88, 2.05, 0.8, 1));
    dark.push(boxGeo(-0.9, 0.7, -1.4, 0.9, 0.85, 2.6, 1));
    for (const s of [-1, 1]) { dark.push(cyl(0.75, 0.75, 0.12, 18, s * 0.95, 0.75, -0.8, 0, Math.PI / 2)); dark.push(cyl(0.5, 0.5, 0.12, 16, s * 0.95, 0.5, 1.9, 0, Math.PI / 2)); }
    dark.push(beam(V(0, 0.75, 2.4), V(0, 0.9, 4.6), 0.06, 0.06));
    return { body, dark, tilt };
  },
  policecar() {
    const c = VEH.car(); c.dark.push(boxGeo(-0.5, 2.0, -0.6, 0.5, 2.18, -0.3, 1)); return c;
  },
  car() {
    const body = [], dark = [];
    body.push(boxGeo(-0.85, 0.5, -2.0, 0.85, 1.25, 1.0, 2));
    body.push(boxGeo(-0.7, 0.55, 1.0, 0.7, 1.15, 2.4, 2));
    dark.push(boxGeo(-0.82, 1.25, -1.8, 0.82, 2.0, 0.2, 1));
    for (const s of [-1, 1]) { body.push(boxGeo(s * 0.9 - 0.12, 0.4, -2.2, s * 0.9 + 0.12, 0.55, 2.3, 1)); for (const z of [1.7, -1.5]) dark.push(cyl(0.45, 0.45, 0.22, 14, s * 0.85, 0.45, z, 0, Math.PI / 2)); }
    dark.push(cyl(0.18, 0.18, 0.1, 10, -0.5, 1.0, 2.42, Math.PI / 2)); dark.push(cyl(0.18, 0.18, 0.1, 10, 0.5, 1.0, 2.42, Math.PI / 2));
    return { body, dark };
  },
};
const VMAT = () => ({
  rubber: lam("rubber", () => ({ map: GT.rubberTex() })), steel: lam("odSteel", () => ({ map: GT.odSteelTex() })),
  dark: lam("vdark", () => ({ color: "#2f302b" })), tilt: lam("tilt", () => ({ map: GT.canvasTex("tilt", "#7b7a52") })),
  horn: lam("horn", () => ({ color: "#3d4228", side: THREE.DoubleSide })), grey: lam("planeGrey", () => ({ color: "#8a9096" })),
  hull: lam("hull", () => ({ map: GT.hullTex() })), liner: lam("liner", () => ({ color: "#2a2a30" })), deck: lam("deck", () => ({ map: planksHD() })), bike: lam("bike", () => ({ color: "#2a3a5a" })),
  boat: lam("boatOD", () => ({ color: "#5b6440" })), lctc: lam("lct", () => ({ color: "#7c8590" })),
  loco: lam("locoBlack", () => ({ color: "#2a2c30" })), train: lam("trainGreen", () => ({ color: "#2f5a46" })), carRed: lam("carRed", () => ({ color: "#8a2a2a" })), carBlack: lam("carBlack", () => ({ color: "#26262c" })), cop: lam("copCar", () => ({ color: "#f2f2f4" })), coach: lam("coachGreen", () => ({ color: "#2f6a4f" })), gold: lam("coachGold", () => ({ color: "#d9b450" })), uteGreen: lam("uteGreen", () => ({ color: "#4a5a3a" })),
});

export class World {
  constructor() {
    this.root = new THREE.Group();
    const R = this.root;
    this.fog = new THREE.Fog("#b8d0ec", 25, 420);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    const disc = ctex("sunDisc", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 56, 64, 64, 64); gr.addColorStop(0, "#fff"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    this.halo = ctex("sunHalo", 256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(0.3, "rgba(255,255,255,0.2)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc, color: new THREE.Color(5, 3.8, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.halo, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    R.add(new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 0.5), this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.night.cloud)) };
    this.clouds = [];
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.layers.set(NOINK); m.userData.a = (i / 14) * Math.PI * 2 + 0.3; m.userData.d = 1700 + (i % 3) * 150; m.userData.y = 260 + (i % 4) * 80; m.userData.w = 300 + (i % 4) * 80;
      this.clouds.push(m); R.add(m);
    }
    this.VM = VMAT();
    this.buildStatic();
    this.buildWater();
    this.buildRooms();
    this.pools = {};
    this.cast = new Cast(R);
    this.ready = Promise.resolve();
  }

  // ---------------- static sets ----------------
  buildStatic() {
    const R = this.root, b = new Batch(), M = {};
    M.grass = lam("grassHD", () => ({ map: grassHD() }));
    M.gravel = lam("gravel", () => ({ map: PT.gravelTex() }));
    M.cobble = lam("cobble", () => ({ map: PT.cobbleTex() }));
    M.leaf = [lam("leaf0", () => ({ color: "#4a8a3e" })), lam("leaf1", () => ({ color: "#5c9a48" })), lam("leaf2", () => ({ color: "#3d7a3a" }))];
    M.trunk = lam("trunk", () => ({ color: "#6a4a32" }));
    M.stone = lam("parisStone", () => ({ map: GT.plasterTex("brick", "#9a5a46") }));
    M.slate = lam("slate", () => ({ map: roofHD("#5f6470", true) }));
    M.iron = lam("iron", () => ({ map: PT.ironTex() }));
    M.awning = lam("awning", () => ({ map: awningTex() }));
    M.metal = lam("metalTable", () => ({ color: "#3a3d42" }));
    M.green = lam("parisGreen", () => ({ color: "#2f5a46" }));
    M.bank = lam("bank", () => ({ map: stoneHD("bankP", ["#c9bfa8", "#bdb39c", "#d3c9b2", "#b5ab94"], "#8a826e") }));
    M.rock = lam("rock", () => ({ color: "#8a8a92" }));
    M.snow = lam("snow", () => ({ color: "#f4f6fa" }));
    M.pine = lam("pine", () => ({ color: "#2f5a3a" }));
    M.rail = lam("rail", () => ({ color: "#55565c" }));
    M.ballast = lam("ballast", () => ({ map: PT.gravelTex() }));
    M.lamp = lam("lampGlow", () => ({ color: "#ffe6a0", emissive: "#ffcf70", emissiveIntensity: 1.5 }));
    this.M = M;
    // ground: grass, with a gap for the Seine, stopping at the ocean
    b.add(quadUp(-8000, OCEAN[0], -8000, SEINE[0] - 10, 0, 14), M.grass);
    b.add(quadUp(-8000, OCEAN[0], SEINE[1] + 10, 8000, 0, 14), M.grass);
    b.add(boxGeo(-6000, -3, SEINE[0] - 10, 6000, 0.05, SEINE[0], 30), M.bank);
    b.add(boxGeo(-6000, -3, SEINE[1], 6000, 0.05, SEINE[1] + 10, 30), M.bank);
    // the Champ de Mars: gravel walks, two lawns, rows of clipped trees
    b.add(quadUp(-160, 160, -250, 215, 0.03, 10), M.gravel);
    for (const s of [-1, 1]) b.add(quadUp(s > 0 ? 45 : -125, s > 0 ? 125 : -45, -240, -85, 0.06, 6), M.grass);
    const tree = (x, z, s = 1, k = 0) => {
      const h = 4 * s; b.add(cyl(0.25 * s, 0.35 * s, h, 6, x, h / 2, z), M.trunk);
      const c = new THREE.IcosahedronGeometry(3.2 * s, 1); c.scale(1, 1.15, 1); c.translate(x, h + 2.4 * s, z); b.add(c, M.leaf[k % 3]);
    };
    for (const s of [-1, 1]) for (let z = -240; z < 200; z += 12) tree(s * 150, z, 1, Math.abs(z));
    // Paris blocks framing the Champ de Mars and across the river (simple boxes with painted fronts)
    const block = (x0, z0, x1, z1, h, face, k) => {
      b.add(boxGeo(x0, 0, z0, x1, h, z1, 6), M.stone);
      b.add(boxGeo(x0 + 0.8, h, z0 + 0.8, x1 - 0.8, h + 4, z1 - 0.8, 4), M.slate);
      const pal = [["#a65a43", "#3a3a3a"], ["#8f4a3a", "#2f3a4a"], ["#c9b89a", "#4a3a2a"]][k % 3];
      const fm = lam("hm" + (k % 6), () => ({ map: facadeHD("haus" + (k % 6), 14, h, { wall: pal[0], shutter: pal[1], door: true }) }));
      const e = 0.03;
      if (face === "+x") b.add(quad(V(x1 + e, 0, z1), V(x1 + e, 0, z0), V(x1 + e, h, z0), V(x1 + e, h, z1)), fm);
      if (face === "-x") b.add(quad(V(x0 - e, 0, z0), V(x0 - e, 0, z1), V(x0 - e, h, z1), V(x0 - e, h, z0)), fm);
      if (face === "-z") b.add(quad(V(x1, 0, z0 - e), V(x0, 0, z0 - e), V(x0, h, z0 - e), V(x1, h, z0 - e)), fm);
      if (face === "+z") b.add(quad(V(x0, 0, z1 + e), V(x1, 0, z1 + e), V(x1, h, z1 + e), V(x0, h, z1 + e)), fm);
    };
    let k = 0;
    for (let z = -240; z < 200; z += 16) { block(-232, z, -178, z + 15.9, 20 + (k % 3) * 2, "+x", k); block(178, z, 232, z + 15.9, 20 + ((k + 1) % 3) * 2, "-x", k + 1); k++; }
    for (let x = -600; x < 600; x += 16) { block(x, SEINE[1] + 16, x + 15.9, SEINE[1] + 60, 20 + (k % 3) * 2, "-z", k); k++; }
    // the street (x = STREET[0]): cobbles, houses on both sides, lamps, a Morris column, a café
    const sx = STREET[0];
    b.add(quadUp(sx - 12, sx + 12, -660, -250, 0.04, 30), M.cobble);
    for (let z = -660; z < -262; z += 16) { if (z + 15.9 < -425 || z > -389) block(sx - 60, z, sx - 12, z + 15.9, 21 + (k % 3) * 2, "+x", k); block(sx + 12, z, sx + 60, z + 15.9, 21 + ((k + 2) % 3) * 2, "-x", k + 2); k++; }
    for (let z = -640; z < -262; z += 22) for (const s of [-1, 1]) { b.add(cyl(0.09, 0.12, 4.2, 6, sx + s * 10, 2.1, z), M.green); b.add(cyl(0.25, 0.18, 0.5, 6, sx + s * 10, 4.4, z), M.lamp); }
    b.add(cyl(0.9, 0.9, 3.6, 16, sx - 9, 1.8, -300), M.green); b.add(cyl(1.05, 0.9, 0.5, 16, sx - 9, 3.85, -300), M.green); b.add(cyl(0.1, 0.6, 0.6, 16, sx - 9, 4.4, -300), M.green);
    // the bank: a pale stone front with columns and steps, west side
    b.add(boxGeo(sx - 30, 0, -424, sx - 12.2, 15, -390, 4), lam("bankStone", () => ({ map: GT.plasterTex("bankS", "#e2dccb") })));
    b.add(boxGeo(sx - 12.2, 0, -416, sx - 9.5, 0.6, -398, 2), lam("bankStone", () => ({ map: GT.plasterTex("bankS", "#e2dccb") })));
    for (let k = 0; k < 6; k++) b.add(cyl(0.55, 0.62, 10.5, 12, sx - 10.6, 0.6 + 5.25, -414.5 + k * 3), lam("column", () => ({ color: "#efeadf" })));
    b.add(boxGeo(sx - 12.2, 11.1, -417, sx - 9.8, 12.4, -397, 2), lam("bankStone", () => ({ map: GT.plasterTex("bankS", "#e2dccb") })));
    b.add(boxGeo(sx - 12.25, 0.6, -409, sx - 12.15, 4.2, -403, 1), lam("bankDoor", () => ({ color: "#3a2a1c" })));
    // café on the east side: awning, tables
    b.add(quad(V(sx + 11.98, 3.5, -336), V(sx + 11.98, 3.5, -322), V(sx + 9.0, 2.7, -322), V(sx + 9.0, 2.7, -336)), M.awning);
    b.add(quad(V(sx + 9.0, 2.7, -336), V(sx + 9.0, 2.7, -322), V(sx + 11.98, 3.5, -322), V(sx + 11.98, 3.5, -336)), M.awning);
    for (const z of [-333, -329, -325]) { b.add(cyl(0.45, 0.45, 0.05, 14, sx + 8.6, 0.75, z), M.metal); b.add(cyl(0.04, 0.04, 0.75, 6, sx + 8.6, 0.38, z), M.metal); }
    // the Alpine railway near TRAIN: ballast, two rails, mountains with snow, pines
    const [tx, , tz] = TRAIN;
    b.add(quadUp(tx - 1500, tx + 3000, tz - 2.5, tz + 2.5, 0.05, 900), M.ballast);
    for (const s of [-0.72, 0.72]) b.add(boxGeo(tx - 1500, 0.05, tz + s - 0.05, tx + 3000, 0.25, tz + s + 0.05, 1), M.rail);
    for (let i = 0; i < 9; i++) {
      const mx = tx - 900 + i * 520 + (i % 2) * 140, mz = tz + 700 + (i % 3) * 420, r = 380 + (i % 3) * 140, h = 520 + (i % 4) * 160;
      const m = new THREE.ConeGeometry(r, h, 9); m.translate(mx, h / 2 - 5, mz); b.add(m, M.rock);
      const c = new THREE.ConeGeometry(r * 0.32, h * 0.32, 9); c.translate(mx, h - h * 0.16 - 5 + 2, mz); b.add(c, M.snow);
    }
    for (let i = 0; i < 60; i++) { const x = tx - 400 + i * 45 + (i % 3) * 7, z = tz + (i % 2 ? 18 : -18) + (i % 5) * 4; const p = new THREE.ConeGeometry(2.2, 8, 7); p.translate(x, 4.6, z); b.add(p, M.pine); b.add(cyl(0.3, 0.3, 1.2, 5, x, 0.6, z), M.trunk); }
    // ---- the Olsen farm, Fruita, Colorado, 1945 (FARM): irrigated pasture, farmhouse, red barn, coop, chopping block;
    //      red-rock mesas of the Colorado National Monument behind (-z), grey Book Cliffs far in front (+z)
    {
      const [fx, , fz] = FARM, L = (k, c) => lam(k, () => ({ color: c }));
      b.add(quadUp(fx - 1500, fx + 2400, fz - 1500, fz + 1500, 0.035, 60), lam("coGrass", () => ({ map: GT.fieldTex("coGrass", "#8fac52") })));
      const yardM = lam("yardDirt", () => ({ map: GT.fieldTex("yard", "#b08d62") })); yardM.polygonOffset = true; yardM.polygonOffsetFactor = -2; yardM.polygonOffsetUnits = -6;
      b.add(quadUp(fx - 9, fx + 9, fz - 8, fz + 7, 0.08, 3), yardM);
      b.add(quadUp(fx + 0.4, fx + 2.4, fz - 8, fz - 40, 0.08, 3), yardM);
      const wood = L("kyWood", "#7a5a3a"), dark = L("kyDark", "#2a2a30"), white = lam("clapboard", () => ({ map: GT.plasterTex("clap", "#f0ece0") }));
      const hx = fx + 2.5, hz = fz - 14;
      b.add(boxGeo(hx - 5, 0, hz - 4, hx + 5, 5.6, hz + 4, 2), white);
      b.add(prism([[-4.6, 5.6], [4.6, 5.6], [0, 8.0]], 10.8, hx).translate(0, 0, hz), L("shingle", "#4a4a54"));
      b.add(boxGeo(hx + 5, 0, hz - 0.8, hx + 6.2, 9.0, hz + 0.8, 2), L("chimney", "#8a6a5a"));
      b.add(boxGeo(hx - 5.2, 2.9, hz + 4, hx + 5.2, 3.05, hz + 6.4, 1), L("shingle", "#4a4a54"));
      b.add(boxGeo(hx - 5.2, 0, hz + 4, hx + 5.2, 0.45, hz + 6.4, 1), wood);
      for (let k = 0; k < 5; k++) b.add(boxGeo(hx - 4.9 + k * 2.45 - 0.09, 0.45, hz + 6.1, hx - 4.9 + k * 2.45 + 0.09, 2.9, hz + 6.28, 1), L("porchPost", "#ece6d6"));
      b.add(boxGeo(hx - 0.6, 0.45, hz + 3.98, hx + 0.6, 2.6, hz + 4.05, 1), L("kyDoor", "#5a3a2a"));
      for (const wx of [-3.2, 3.2]) for (const wy of [1.2, 3.8]) { b.add(boxGeo(hx + wx - 0.6, wy, hz + 3.98, hx + wx + 0.6, wy + 1.3, hz + 4.05, 1), L("kyWin", "#2f3e52")); for (const sx of [-1, 1]) b.add(boxGeo(hx + wx + sx * 0.85 - 0.22, wy, hz + 3.98, hx + wx + sx * 0.85 + 0.22, wy + 1.3, hz + 4.07, 1), L("shutterCo", "#8a3a32")); }
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6 - r; c++) b.add(cyl(0.16, 0.16, 1.2, 8, hx - 7.5 + c * 0.33 + r * 0.16, 0.16 + r * 0.29, hz + 2, Math.PI / 2), L("logEnd", "#9a7a52"));
      const bx = fx - 24, bz = fz - 22;
      b.add(boxGeo(bx - 6, 0, bz - 5, bx + 6, 5, bz + 5, 2), L("barnRed", "#a83a2e"));
      b.add(prism([[-5.6, 5], [5.6, 5], [0, 8.4]], 12.8, bx).translate(0, 0, bz), L("barnRoof", "#3a3a40"));
      b.add(boxGeo(bx - 2, 0, bz + 4.98, bx + 2, 3.8, bz + 5.05, 1), L("barnDoor", "#7a2a22"));
      b.add(beam(V(bx - 2, 0.1, bz + 5.08), V(bx + 2, 3.7, bz + 5.08), 0.08, 0.04), L("barnTrim", "#f0ece0"));
      b.add(beam(V(bx + 2, 0.1, bz + 5.08), V(bx - 2, 3.7, bz + 5.08), 0.08, 0.04), L("barnTrim", "#f0ece0"));
      // the chopping block: a sawn cottonwood stump in the middle of the yard (FARM origin), chips around it
      b.add(cyl(0.34, 0.4, 0.5, 16, fx, 0.25, fz), L("stumpBark", "#6a4a32"));
      b.add(cyl(0.335, 0.335, 0.02, 16, fx, 0.505, fz), L("stumpTop", "#d2ae7a"));
      for (let k = 0; k < 9; k++) b.add(boxGeo(fx + Math.cos(k * 2.3) * (0.6 + hh(k, 1) * 0.5) - 0.05, 0.08, fz + Math.sin(k * 2.3) * (0.5 + hh(k, 2) * 0.4) - 0.03, fx + Math.cos(k * 2.3) * (0.6 + hh(k, 1) * 0.5) + 0.05, 0.1, fz + Math.sin(k * 2.3) * (0.5 + hh(k, 2) * 0.4) + 0.03, 1), L("chip", "#d8b888"));
      // chicken coop with a ramp
      const cx = fx + 5, cz = fz - 3;
      b.add(boxGeo(cx - 1.1, 0.3, cz - 0.8, cx + 1.1, 1.6, cz + 0.8, 1), L("coopWood", "#9a7a54"));
      b.add(prism([[-1.0, 1.6], [1.0, 1.6], [1.0, 1.75], [-1.0, 2.25]], 2.5, cx).translate(0, 0, cz), L("coopRoof", "#5a4a40"));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(boxGeo(cx + sx * 1.0 - 0.06, 0, cz + sz * 0.7 - 0.06, cx + sx * 1.0 + 0.06, 0.3, cz + sz * 0.7 + 0.06, 1), wood);
      b.add(boxGeo(cx - 0.25, 0.32, cz + 0.79, cx + 0.25, 0.85, cz + 0.83, 1), dark);
      b.add(beam(V(cx, 0.08, cz + 1.9), V(cx, 0.36, cz + 0.85), 0.42, 0.04), wood);
      // feeding table by the house
      const tx = fx - 3.0, tz = fz - 1.6;
      b.add(boxGeo(tx - 0.8, 0.74, tz - 0.45, tx + 0.8, 0.8, tz + 0.45, 1), L("tableTop", "#a8845a"));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(boxGeo(tx + sx * 0.7 - 0.04, 0, tz + sz * 0.36 - 0.04, tx + sx * 0.7 + 0.04, 0.74, tz + sz * 0.36 + 0.04, 1), wood);
      b.add(cyl(0.09, 0.07, 0.16, 12, tx + 0.5, 0.88, tz - 0.15), L("milkJar", "#f2f0ea"));
      b.add(cyl(0.12, 0.1, 0.06, 12, tx - 0.45, 0.83, tz + 0.1), L("bowl", "#5a7fb5"));
      // post-and-wire fences
      const post = L("fencePost", "#7a6048"), wire = L("wire", "#6a6a70");
      const fence = (x0, z0, x1, z1) => { const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 2.6); for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n; b.add(boxGeo(x - 0.06, 0, z - 0.06, x + 0.06, 1.2, z + 0.06, 1), post); } for (const y of [0.45, 0.8, 1.1]) b.add(beam(V(x0, y, z0), V(x1, y, z1), 0.015, 0.015), wire); };
      fence(fx - 30, fz + 9, fx - 1.5, fz + 9); fence(fx + 1.5, fz + 9, fx + 30, fz + 9); fence(fx + 14, fz - 30, fx + 14, fz + 9); fence(fx - 30, fz - 34, fx + 30, fz - 34);
      for (const s2 of [-1, 1]) b.add(boxGeo(fx + s2 * 1.5 - 0.1, 0, fz + 9 - 0.1, fx + s2 * 1.5 + 0.1, 2.2, fz + 9 + 0.1, 1), post);
      // cottonwoods
      const tree = (x, z, s) => { b.add(cyl(0.25 * s, 0.4 * s, 5 * s, 7, x, 2.5 * s, z), L("oakBark", "#5a4232")); for (let k = 0; k < 4; k++) { const c = new THREE.IcosahedronGeometry(2.2 * s, 1); c.translate(x + Math.cos(k * 1.7) * 1.4 * s, (5.6 + (k % 2) * 1.0) * s, z + Math.sin(k * 1.7) * 1.4 * s); b.add(c, L("oakLeaf" + (k % 2), k % 2 ? "#6a9a3a" : "#86b04a")); } };
      tree(fx + 10, fz - 8, 1.2); tree(fx - 10, fz - 12, 1.0); tree(fx + 22, fz - 26, 1.3); tree(fx - 34, fz - 10, 1.2);
      for (let k = 0; k < 18; k++) tree(fx - 140 + k * 17 + (k % 3) * 5, fz - 60 - (k % 3) * 14, 1 + (k % 3) * 0.2);
      for (let k = 0; k < 14; k++) tree(fx - 120 + k * 19, fz + 46 + (k % 2) * 12, 1.1);
      // red-rock mesas: talus slope, sheer red cliff, dark cap rock; plus a few monoliths
      const talus = L("mesaTalus", "#c08a60"), red = L("mesaRed", "#b4603a"), capR = L("mesaCap", "#8a4a30");
      const mesa = (x, z, r, h, k) => { const sx = 1 + hh(k, 1) * 0.9, sz = 0.55 + hh(k, 2) * 0.5, seg = 7 + (k % 3);
        const t = new THREE.CylinderGeometry(r * 1.02, r * 1.65, h * 0.36, seg); t.scale(sx, 1, sz); t.translate(x, h * 0.18 - 2, z); b.add(t, talus);
        const c = new THREE.CylinderGeometry(r * 0.9, r * 1.0, h * 0.62, seg); c.scale(sx, 1, sz); c.translate(x, h * 0.67 - 2, z); b.add(c, red);
        const p = new THREE.CylinderGeometry(r * 0.93, r * 0.91, h * 0.07, seg); p.scale(sx, 1, sz); p.translate(x, h * 1.0 - 2, z); b.add(p, capR); };
      for (let i = 0; i < 18; i++) mesa(fx - 3000 + i * 350 + hh(i, 3) * 120, fz - 2500 - (i % 3) * 260 - hh(i, 4) * 200, 170 + hh(i, 5) * 150, 190 + hh(i, 6) * 170, i);
      for (const [mx, mz, h] of [[fx - 520, fz - 1900, 230], [fx + 700, fz - 2000, 190], [fx + 260, fz - 2150, 270]]) { b.add(cyl(26, 38, h, 7, mx, h / 2 - 2, mz), red); b.add(cyl(30, 28, 10, 7, mx, h + 2, mz), capR); b.add(cyl(40, 90, 50, 7, mx, 23, mz), talus); }
      // grey Book Cliffs far to the north (+z)
      for (let i = 0; i < 10; i++) { const m = new THREE.CylinderGeometry(260, 420, 140 + (i % 3) * 30, 6); m.scale(1.6, 1, 0.5); m.translate(fx - 2500 + i * 560, 68, fz + 2300 + (i % 2) * 200); b.add(m, L("bookCliff", "#a99c8c")); }
    }
    // ---- Arizona: desert highway (along x at z = DESERT[2]), saguaros, mountains; the motel by the road (MOTEL)
    {
      const [dx, , dz] = DESERT, L = (k, c) => lam(k, () => ({ color: c }));
      const sandM = lam("azSand", () => ({ map: GT.fieldTex("azSand", "#d6b48a") })); sandM.polygonOffset = true; sandM.polygonOffsetFactor = -1; sandM.polygonOffsetUnits = -3;
      b.add(quadUp(dx - 460, dx + 460, dz - 460, dz + 460, 0.06, 40), sandM);
      const asph = L("asphalt", "#55555c"); asph.polygonOffset = true; asph.polygonOffsetFactor = -3; asph.polygonOffsetUnits = -8;
      b.add(quadUp(dx - 460, dx + 460, dz - 3.2, dz + 3.2, 0.09, 20), asph);
      const lineY = L("lineY", "#e8c84a"); lineY.polygonOffset = true; lineY.polygonOffsetFactor = -4; lineY.polygonOffsetUnits = -10;
      for (let x = dx - 450; x < dx + 450; x += 6) b.add(quadUp(x, x + 3, dz - 0.08, dz + 0.08, 0.1, 1), lineY);
      const sag = L("saguaro", "#4f7a46");
      const saguaro = (x, z, s) => { b.add(cyl(0.3 * s, 0.34 * s, 5 * s, 9, x, 2.5 * s, z), sag); const t = new THREE.SphereGeometry(0.3 * s, 9, 5); t.translate(x, 5 * s, z); b.add(t, sag);
        for (const sd of [-1, 1]) { const ah = (1.6 + hh(x, sd) * 1.2) * s; b.add(cyl(0.2 * s, 0.2 * s, 0.7 * s, 7, x + sd * 0.5 * s, ah, z, 0, Math.PI / 2), sag); b.add(cyl(0.2 * s, 0.2 * s, 1.5 * s, 7, x + sd * 0.85 * s, ah + 0.72 * s, z), sag); const q = new THREE.SphereGeometry(0.2 * s, 7, 4); q.translate(x + sd * 0.85 * s, ah + 1.47 * s, z); b.add(q, sag); } };
      for (let i = 0; i < 46; i++) { const x = dx - 430 + hh(i, 1) * 860, z = dz + (hh(i, 2) < 0.5 ? -1 : 1) * (9 + hh(i, 3) * 260); if (Math.abs(x - MOTEL[0]) < 30 && z < dz && z > dz - 40) continue; if (z > dz && z < dz + 16 && x > dx - 60 && x < dx + 20) continue; saguaro(x, z, 0.8 + hh(i, 4) * 0.6); }
      for (let i = 0; i < 40; i++) { const x = dx - 420 + hh(i, 7) * 840, z = dz + (hh(i, 8) < 0.5 ? -1 : 1) * (6 + hh(i, 9) * 120); if (z > dz && z < dz + 16 && x > dx - 60 && x < dx + 20) continue; const g = new THREE.IcosahedronGeometry(0.5 + hh(i, 5) * 0.4, 0); g.scale(1, 0.6, 1); g.translate(x, 0.25, z); b.add(g, L("brush", "#8a8a52")); }
      for (let i = 0; i < 9; i++) { const h = 180 + (i % 4) * 70, m = new THREE.ConeGeometry(420 + (i % 3) * 120, h, 7); m.scale(1.4, 1, 0.6); m.translate(dx - 2600 + i * 300, h / 2 - 4, dz - 1000 - (i % 3) * 200); b.add(m, L("azMtn" + (i % 2), i % 2 ? "#a0725a" : "#8a6a62")); }
      for (let i = 0; i < 9; i++) { const h = 120 + (i % 3) * 60, m = new THREE.ConeGeometry(380, h, 7); m.scale(1.5, 1, 0.6); m.translate(dx - 2400 + i * 330, h / 2 - 4, dz + 1000 + (i % 2) * 200); b.add(m, L("azMtn2", "#9a7a6a")); }
      // the motel: one long stucco block facing the highway (+z), covered walkway, doors and windows
      const [mx, , mz] = MOTEL, stucco = lam("stucco", () => ({ map: GT.plasterTex("stucco", "#ead8b4") }));
      b.add(boxGeo(mx - 18, 0, mz - 5, mx + 18, 3.2, mz + 5, 3), stucco);
      b.add(boxGeo(mx - 18.6, 3.0, mz - 5.4, mx + 18.6, 3.35, mz + 7.6, 2), L("motelRoof", "#b8483a"));
      for (let k = 0; k < 8; k++) b.add(boxGeo(mx - 17 + k * 4.85 - 0.08, 0, mz + 7.2, mx - 17 + k * 4.85 + 0.08, 3.0, mz + 7.36, 1), L("motelPost", "#f2ece0"));
      b.add(boxGeo(mx - 18, 0, mz + 5, mx + 18, 0.18, mz + 7.6, 1), L("walkway", "#b8b0a0"));
      for (let k = 0; k < 7; k++) { const x0 = mx - 15.5 + k * 4.85; b.add(boxGeo(x0 - 0.5, 0.18, mz + 4.98, x0 + 0.5, 2.3, mz + 5.05, 1), L("motelDoor", "#2f7f7a"));
        b.add(boxGeo(x0 + 1.0, 1.0, mz + 4.98, x0 + 2.4, 2.1, mz + 5.05, 1), k === 3 ? lam("winLit", () => ({ color: "#ffe2a0", emissive: "#ffb850", emissiveIntensity: 1.6 })) : L("winDark", "#2a3348")); }
      b.add(cyl(0.18, 0.22, 7.5, 10, mx + 22, 3.75, mz + 9.5), L("signPole", "#d8d8dc"));
      b.add(quadUp(mx - 22, mx + 26, mz + 7.6, dz - 3.2, 0.085, 6), L("gravelLot", "#b8a688"));
    }
    // ---- 1946 fairground (TOUR): dirt midway, the sideshow stage with its striped awning, big top tents, a Ferris wheel
    {
      const [tx, , tz] = TOUR, L = (k, c) => lam(k, () => ({ color: c }));
      const dirt = lam("midway", () => ({ map: GT.fieldTex("midway", "#b8946a") })); dirt.polygonOffset = true; dirt.polygonOffsetFactor = -2; dirt.polygonOffsetUnits = -6;
      b.add(quadUp(tx - 70, tx + 70, tz - 70, tz + 40, 0.08, 6), dirt);
      const wood = L("stageWood", "#8a6440"), plank = lam("stagePlank", () => ({ map: planksHD() }));
      b.add(boxGeo(tx - 2.6, 0, tz - 1.6, tx + 2.6, 0.9, tz + 0.6, 2), plank);
      for (let k = 0; k < 3; k++) b.add(boxGeo(tx - 0.6, 0, tz + 0.6 + k * 0.3, tx + 0.6, 0.9 - (k + 1) * 0.3 + 0.3 - 0.3 * 0 - 0.0, tz + 0.9 + k * 0.3, 1), wood);
      b.add(boxGeo(tx - 2.7, 0.9, tz - 1.7, tx + 2.7, 3.8, tz - 1.55, 1), L("boardBack", "#2a2440"));
      for (const sx of [-1, 1]) b.add(boxGeo(tx + sx * 2.6 - 0.09, 0.9, tz + 0.45, tx + sx * 2.6 + 0.09, 3.6, tz + 0.6, 1), L("stagePost", "#c9a24a"));
      const stripe = (key, a, c) => lam(key, () => ({ map: ctex(key, 512, 64, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a : c; g.fillRect(i * 32, 0, 32, 64); } }), side: THREE.DoubleSide }));
      const aw = stripe("awnRW", "#c4302a", "#f4ecd8");
      b.add(quad(V(tx - 2.9, 3.95, tz - 1.6), V(tx + 2.9, 3.95, tz - 1.6), V(tx + 2.9, 3.5, tz + 0.9), V(tx - 2.9, 3.5, tz + 0.9)), aw);
      b.add(quad(V(tx - 2.9, 3.5, tz + 0.9), V(tx + 2.9, 3.5, tz + 0.9), V(tx + 2.9, 3.95, tz - 1.6), V(tx - 2.9, 3.95, tz - 1.6)), aw);
      const tent = (x, z, r, h, key, a, c) => { const m = stripe(key, a, c); const w = new THREE.CylinderGeometry(r, r, h, 20, 1, true); w.translate(x, h / 2, z); b.add(w, m); const roof = new THREE.ConeGeometry(r * 1.1, h * 0.9, 20, 1, true); roof.translate(x, h + h * 0.45, z); b.add(roof, m); b.add(cyl(0.08, 0.08, 1.4, 6, x, h * 1.9 + 0.5, z), L("tentPole", "#e8c84a")); };
      tent(tx - 11, tz - 13, 6, 3.4, "tentA", "#c4302a", "#f4ecd8"); tent(tx + 12, tz - 18, 5, 3.0, "tentB", "#2f5f9a", "#f2d27a"); tent(tx - 26, tz - 30, 7, 3.8, "tentC", "#3f8a5a", "#f4ecd8");
      // Ferris wheel
      const fwx = tx + 26, fwz = tz - 42, fr = 10, fy = 12, steel = L("fwSteel", "#e8e2d2");
      for (const zz of [-0.8, 0.8]) { const ring = new THREE.TorusGeometry(fr, 0.15, 6, 40); ring.translate(fwx, fy, fwz + zz); b.add(ring, steel); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; b.add(beam(V(fwx, fy, fwz + zz), V(fwx + Math.cos(a) * fr, fy + Math.sin(a) * fr, fwz + zz), 0.08, 0.08), steel); } }
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; b.add(boxGeo(fwx + Math.cos(a) * fr - 0.5, fy + Math.sin(a) * fr - 1.2, fwz - 0.6, fwx + Math.cos(a) * fr + 0.5, fy + Math.sin(a) * fr - 0.2, fwz + 0.6, 1), L("gondola" + (k % 3), ["#c4302a", "#e8c84a", "#2f5f9a"][k % 3])); }
      for (const sx of [-1, 1]) for (const zz of [-0.9, 0.9]) b.add(beam(V(fwx + sx * 6, 0, fwz + zz), V(fwx, fy, fwz + zz), 0.25, 0.25), steel);
      // string lights on poles along the midway
      const bulb = lam("bulb", () => ({ color: "#fff2c0", emissive: "#ffd070", emissiveIntensity: 1.4 }));
      for (const [x0, z0, x1, z1] of [[tx - 9, tz + 3, tx + 9, tz + 3], [tx - 9, tz + 3, tx - 9, tz - 8], [tx + 9, tz + 3, tx + 9, tz - 8]]) { for (const [px, pz] of [[x0, z0], [x1, z1]]) b.add(cyl(0.07, 0.09, 4.4, 6, px, 2.2, pz), L("lightPole", "#5a4a3a")); for (let k = 0; k <= 16; k++) { const u = k / 16, sag2 = Math.sin(u * Math.PI) * 0.6; const g = new THREE.SphereGeometry(0.07, 6, 4); g.translate(x0 + (x1 - x0) * u, 4.3 - sag2, z0 + (z1 - z0) * u); b.add(g, bulb); } }
      // ticket stand
      b.add(boxGeo(tx + 3.6, 0, tz + 0.6, tx + 4.8, 1.1, tz + 1.6, 1), L("ticketBox", "#c4302a")); b.add(boxGeo(tx + 3.5, 1.1, tz + 0.5, tx + 4.9, 1.16, tz + 1.7, 1), L("ticketTop", "#e8c84a"));
    }
    // ---- Fruita today (FEST): a green park below the mesas, pop-up booths, a stage, bunting, Mike's statue on a plinth
    {
      const [ex, , ez] = FEST, L = (k, c) => lam(k, () => ({ color: c }));
      const lawn = lam("festLawn", () => ({ map: GT.fieldTex("festLawn", "#7fb04a") })); lawn.polygonOffset = true; lawn.polygonOffsetFactor = -2; lawn.polygonOffsetUnits = -6;
      b.add(quadUp(ex - 60, ex + 60, ez - 40, ez + 40, 0.08, 8), lawn);
      const path = L("festPath", "#d8ccb4"); path.polygonOffset = true; path.polygonOffsetFactor = -3; path.polygonOffsetUnits = -9;
      b.add(quadUp(ex - 2, ex + 2, ez - 40, ez + 40, 0.09, 4), path);
      const booth = (x, z, col, k) => { const leg = L("boothLeg", "#d8d8dc"); for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(cyl(0.035, 0.035, 2.3, 5, x + sx * 1.4, 1.15, z + sz * 1.4), leg); const r = new THREE.ConeGeometry(2.1, 0.8, 4, 1, true); r.rotateY(Math.PI / 4); r.translate(x, 2.7, z); b.add(r, lam("boothTop" + k, () => ({ color: col, side: THREE.DoubleSide }))); b.add(boxGeo(x - 1.3, 0.75, z + 1.0, x + 1.3, 0.8, z + 1.5, 1), L("boothTable", "#f2f0ea")); b.add(boxGeo(x - 1.3, 0, z + 1.0, x + 1.3, 0.75, z + 1.5, 1), L("boothCloth" + (k % 3), ["#c4302a", "#2f5f9a", "#e8c84a"][k % 3])); };
      [["#f4f4f0", -7, -2], ["#c4302a", -7, -7], ["#2f5f9a", 7, -2], ["#e8c84a", 7, -7], ["#f4f4f0", -7, 4], ["#3f8a5a", 7, 4], ["#f4f4f0", -12, -12], ["#c4302a", 12, -12]].forEach(([c, x, z], k) => booth(ex + x, ez + z, c, k));
      b.add(boxGeo(ex - 4, 0, ez - 16, ex + 4, 0.9, ez - 12.5, 2), lam("festStage", () => ({ map: planksHD() })));
      b.add(boxGeo(ex - 4.2, 0.9, ez - 16.2, ex + 4.2, 4.4, ez - 16, 1), L("festBack", "#1f3a6a"));
      for (const sx of [-1, 1]) b.add(cyl(0.12, 0.12, 5.2, 8, ex + sx * 4.1, 2.6, ez - 12.6), L("truss", "#3a3a40"));
      b.add(boxGeo(ex - 4.2, 5.0, ez - 12.75, ex + 4.2, 5.25, ez - 12.45, 1), L("truss", "#3a3a40"));
      // Mike's statue plinth (the statue itself is a lit card), right by the path
      b.add(boxGeo(ex - 3.2, 0, ez + 8.4, ex - 1.8, 1.1, ez + 9.8, 1), lam("plinth", () => ({ map: GT.plasterTex("plinth", "#b8b0a4") })));
      b.add(boxGeo(ex - 3.35, 1.1, ez + 8.25, ex - 1.65, 1.2, ez + 9.95, 1), L("plinthCap", "#8a8478"));
      // bunting between poles
      const tri = (a, b2, c) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([a, b2, c, a, c, b2].flatMap((v) => [v.x, v.y, v.z]), 3)); g.computeVertexNormals(); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1, 0, 0, 0.5, 1, 1, 0], 2)); return g; };
      const FL = ["#c4302a", "#e8c84a", "#2f5f9a", "#3f8a5a", "#f4f4f0", "#e86a2a"].map((c, k) => lam("flag" + k, () => ({ color: c, side: THREE.DoubleSide })));
      const bunt = (x0, z0, x1, z1, y = 4.2) => { for (const [px, pz] of [[x0, z0], [x1, z1]]) b.add(cyl(0.06, 0.08, y + 0.3, 6, px, (y + 0.3) / 2, pz), L("buntPole", "#f2f0ea")); const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.45); for (let k = 0; k < n; k++) { const u0 = k / n, u1 = (k + 0.8) / n, sg = (u) => Math.sin(u * Math.PI) * 0.5; const A = V(x0 + (x1 - x0) * u0, y - sg(u0), z0 + (z1 - z0) * u0), B2 = V(x0 + (x1 - x0) * u1, y - sg(u1), z0 + (z1 - z0) * u1), C = V((A.x + B2.x) / 2, (A.y + B2.y) / 2 - 0.42, (A.z + B2.z) / 2); FL.forEach(() => 0); b.add(tri(A, B2, C), FL[k % FL.length]); } };
      bunt(ex - 9, ez + 7, ex + 9, ez + 7); bunt(ex - 9, ez - 1, ex + 9, ez - 1, 4.0); bunt(ex - 9, ez - 9, ex + 9, ez - 9, 4.4);
      const tree = (x, z, s) => { b.add(cyl(0.25 * s, 0.4 * s, 5 * s, 7, x, 2.5 * s, z), L("oakBark", "#5a4232")); for (let k = 0; k < 4; k++) { const c = new THREE.IcosahedronGeometry(2.2 * s, 1); c.translate(x + Math.cos(k * 1.7) * 1.4 * s, (5.6 + (k % 2) * 1.0) * s, z + Math.sin(k * 1.7) * 1.4 * s); b.add(c, L("oakLeaf" + (k % 2), k % 2 ? "#6a9a3a" : "#86b04a")); } };
      for (let k = 0; k < 10; k++) { tree(ex - 22 + (k % 2) * 3, ez - 30 + k * 7, 1.1 + (k % 3) * 0.15); tree(ex + 22 - (k % 2) * 3, ez - 28 + k * 7, 1.1 + (k % 2) * 0.2); }
    }
    // ---- 1807, Berthier's estate (NAP): a summer meadow, the château far behind (-z), a lunch tent, a row of rabbit cages,
    //      the hunters' line, poplars and oaks all round; Napoleon's coach waits by the gravel drive (x -12)
    {
      const [nx, , nz] = NAP, L = (k, c) => lam(k, () => ({ color: c }));
      const mead = lam("meadow", () => ({ map: GT.fieldTex("meadow", "#9cc45a") })); mead.polygonOffset = true; mead.polygonOffsetFactor = -2; mead.polygonOffsetUnits = -6;
      b.add(quadUp(nx - 400, nx + 400, nz - 400, nz + 300, 0.05, 30), mead);
      const drive = L("napDrive", "#d8c8a4"); drive.polygonOffset = true; drive.polygonOffsetFactor = -3; drive.polygonOffsetUnits = -9;
      b.add(quadUp(nx - 14, nx - 10, nz - 70, nz + 60, 0.07, 6), drive);
      b.add(quadUp(nx - 60, nx - 10, nz + 2, nz + 6, 0.07, 6), drive);
      // château: a long pale stone block, slate mansard roof, a taller centre pavilion
      const chM = lam("chFacade", () => ({ map: facadeHD("chateau", 40, 14, { wall: "#e6dcc4", shutter: "#5a6a7a", door: true }) }));
      const chS = lam("chStone", () => ({ map: GT.plasterTex("chS", "#e6dcc4") }));
      const ch = (x0, x1, z0, z1, h) => { b.add(boxGeo(x0, 0, z0, x1, h, z1, 4), chS); b.add(quad(V(x0, 0, z1 + 0.03), V(x1, 0, z1 + 0.03), V(x1, h, z1 + 0.03), V(x0, h, z1 + 0.03)), chM); b.add(boxGeo(x0 + 0.8, h, z0 + 0.8, x1 - 0.8, h + 5, z1 - 0.8, 3), M.slate); };
      ch(nx - 40, nx + 40, nz - 104, nz - 90, 14); ch(nx - 10, nx + 10, nz - 106, nz - 88, 18);
      // lunch tent: blue and white stripes over a long table with a white cloth
      const tx = nx + 7, tz = nz - 7;
      const stripe = lam("napTent", () => ({ map: ctex("napTent", 512, 64, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#2f4f9a" : "#f4efe2"; g.fillRect(i * 32, 0, 32, 64); } }), side: THREE.DoubleSide }));
      b.add(quad(V(tx - 3.2, 3.1, tz - 2.2), V(tx + 3.2, 3.1, tz - 2.2), V(tx + 3.2, 2.5, tz + 2.2), V(tx - 3.2, 2.5, tz + 2.2)), stripe);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(cyl(0.05, 0.05, sz < 0 ? 3.1 : 2.5, 6, tx + sx * 3.1, (sz < 0 ? 3.1 : 2.5) / 2, tz + sz * 2.1), L("tentPoleN", "#e8e2d2"));
      b.add(boxGeo(tx - 2.2, 0.72, tz - 0.55, tx + 2.2, 0.78, tz + 0.55, 1), L("napCloth", "#fbf8f0"));
      b.add(boxGeo(tx - 2.2, 0.3, tz + 0.53, tx + 2.2, 0.78, tz + 0.56, 1), L("napCloth", "#fbf8f0"));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(boxGeo(tx + sx * 2.0 - 0.04, 0, tz + sz * 0.45 - 0.04, tx + sx * 2.0 + 0.04, 0.72, tz + sz * 0.45 + 0.04, 1), L("napLeg", "#8a6440"));
      for (let k = 0; k < 6; k++) { b.add(cyl(0.035, 0.035, 0.22, 8, tx - 1.6 + k * 0.64, 0.89, tz - 0.15), L("wine", "#4a1a2a")); b.add(cyl(0.12, 0.12, 0.02, 12, tx - 1.4 + k * 0.6, 0.79, tz + 0.2), L("plate", "#f2f4f6")); }
      b.add(cyl(0.28, 0.32, 0.18, 14, tx, 0.87, tz), L("pie", "#d8a050"));
      // the rabbit cages: six wooden hutches in a row along x, open fronts at z = nz (the barred doors are cards in story.js)
      const cw = lam("cageWood", () => ({ map: planksHD() })), cd = L("cageDark", "#5a3e26");
      for (let k = 0; k < 6; k++) { const x = nx - 5 + k * 2;
        b.add(boxGeo(x - 0.6, 0, nz - 0.85, x + 0.6, 0.12, nz, 1), cw); b.add(boxGeo(x - 0.66, 0.82, nz - 0.9, x + 0.66, 0.9, nz + 0.05, 1), cw);
        b.add(boxGeo(x - 0.6, 0.12, nz - 0.85, x + 0.6, 0.82, nz - 0.8, 1), cd);
        for (const sx of [-1, 1]) b.add(boxGeo(x + sx * 0.6 - 0.03, 0.12, nz - 0.85, x + sx * 0.6 + 0.03, 0.82, nz, 1), cw); }
      // trees: poplars along the drive, round oaks round the meadow
      const oak = (x, z, s) => { b.add(cyl(0.3 * s, 0.45 * s, 4.5 * s, 7, x, 2.25 * s, z), M.trunk); for (let k = 0; k < 4; k++) { const c = new THREE.IcosahedronGeometry(2.4 * s, 1); c.translate(x + Math.cos(k * 1.7) * 1.5 * s, (5.4 + (k % 2) * 1.1) * s, z + Math.sin(k * 1.7) * 1.5 * s); b.add(c, M.leaf[k % 3]); } };
      const poplar = (x, z, s) => { b.add(cyl(0.18 * s, 0.25 * s, 3 * s, 6, x, 1.5 * s, z), M.trunk); const c = new THREE.IcosahedronGeometry(1.6 * s, 1); c.scale(0.75, 3.2, 0.75); c.translate(x, 7 * s, z); b.add(c, M.leaf[(Math.round(x + z) % 3 + 3) % 3]); };
      for (let z = -80; z < 60; z += 9) { poplar(nx - 16.5, nz + z, 1.0); poplar(nx - 7.5, nz + z + 4, 1.0); }
      for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2, r = 46 + hh(k, 1) * 18; const x = nx + Math.cos(a) * r * 1.2, z = nz - 20 + Math.sin(a) * r; if (Math.abs(x - nx + 12) < 8) continue; oak(x, z, 1 + hh(k, 2) * 0.4); }
      for (const [x, z, s] of [[nx + 16, nz - 16, 1.2], [nx - 26, nz - 30, 1.1], [nx + 24, nz + 8, 1.0]]) oak(x, z, s);
      // low hills far off
      for (let i = 0; i < 8; i++) { const h = 40 + (i % 3) * 18, m = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2); m.scale(260 + (i % 2) * 120, h, 120); m.translate(nx - 1300 + i * 380, -2, nz - 700 - (i % 2) * 150); b.add(m, L("napHill" + (i % 2), i % 2 ? "#8fae62" : "#7d9c58")); }
    }
    b.build(R, true, true);
    // New York skyline far across the ocean (flat painted card)
    const sk = new THREE.Mesh(new THREE.PlaneGeometry(3200, 800), new THREE.MeshBasicMaterial({ map: PT.skylineTex(), transparent: true, fog: true, depthWrite: false }));
    sk.position.set(OCEAN[0] + 4500, 380, OCEAN[2]); sk.rotation.y = -Math.PI / 2; sk.layers.set(NOINK); R.add(sk);
  }

  buildTower(b, M) {
    const ky = [0, 20, 40, 57, 85, 115, 160, 200, 240, 276], kc = [52, 44, 37, 33, 24, 16, 10, 6.5, 3.5, 1.6], kh = [11, 10, 9, 8, 7, 6, 5, 4.4, 3.4, 2.4];
    const at = (arr, y) => { let i = 0; while (i < ky.length - 2 && y > ky[i + 1]) i++; const u = (y - ky[i]) / (ky[i + 1] - ky[i]); return arr[i] + (arr[i + 1] - arr[i]) * u; };
    const ys = []; for (let y = 0; y < 276; y += y < 115 ? 6 : 8) ys.push(y); ys.push(276);
    const I = M.iron, C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const P = (y, cx, cz) => V(sx * at(kc, y) + cx * at(kh, y), y, sz * at(kc, y) + cz * at(kh, y));
      for (let i = 0; i < ys.length - 1; i++) {
        const y0 = ys[i], y1 = ys[i + 1], w = 1.0 * (1 - y0 / 420);
        for (const [cx, cz] of C) b.add(beam(P(y0, cx, cz), P(y1, cx, cz), w, w), I);
        for (let f = 0; f < 4; f++) { const [ax, az] = C[f], [bx, bz] = C[(f + 1) % 4]; b.add(beam(P(y0, ax, az), P(y1, bx, bz), 0.32, 0.32), I); b.add(beam(P(y0, bx, bz), P(y1, ax, az), 0.32, 0.32), I); }
        if (i % 2 === 0) for (let f = 0; f < 4; f++) { const [ax, az] = C[f], [bx, bz] = C[(f + 1) % 4]; b.add(beam(P(y1, ax, az), P(y1, bx, bz), 0.45, 0.45), I); }
      }
      b.add(boxGeo(sx * 52 - 14, 0, sz * 52 - 14, sx * 52 + 14, 2.4, sz * 52 + 14, 4), M.stone);
    }
    const ring = (y, o, i, h) => { b.add(boxGeo(-o, y, -o, o, y + h, -i, 6), I); b.add(boxGeo(-o, y, i, o, y + h, o, 6), I); b.add(boxGeo(-o, y, -i, -i, y + h, i, 6), I); b.add(boxGeo(i, y, -i, o, y + h, i, 6), I); };
    ring(57, 45, 25, 6); ring(63, 45.5, 44.5, 1.6);
    ring(115, 24, 12, 4); ring(119, 24.4, 23.6, 1.2);
    // the four great arches, one per face
    for (let f = 0; f < 4; f++) {
      const rot = (f * Math.PI) / 2, cs = Math.cos(rot), sn = Math.sin(rot), T = (x, y, z) => V(x * cs - z * sn, y, x * sn + z * cs);
      for (const dz of [-44, -42]) for (const dy of [0, 2.2]) {
        let prev = null;
        for (let k = 0; k <= 24; k++) { const th = Math.PI - (k / 24) * Math.PI, p = T(36 * Math.cos(th), 14 + 30 * Math.sin(th) + dy, dz); if (prev) b.add(beam(prev, p, 0.9, 0.9), I); prev = p; }
      }
    }
    b.add(boxGeo(-4.5, 276, -4.5, 4.5, 283, 4.5, 2), I);
    b.add(cyl(2.4, 2.8, 6, 12, 0, 286, 0), I);
    b.add(cyl(0.35, 0.6, 30, 8, 0, 304, 0), I);
  }

  buildWater() {
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 2; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;").replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", WATER_DECL).replace("#include <map_fragment>", WATER_COL).replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    m.customProgramCacheKey = () => "river1";
    const river = new THREE.PlaneGeometry(12000, SEINE[1] - SEINE[0] + 20); river.rotateX(-Math.PI / 2); river.translate(0, -2, (SEINE[0] + SEINE[1]) / 2);
    const sea = new THREE.PlaneGeometry(8000, 8000); sea.rotateX(-Math.PI / 2); sea.translate(OCEAN[0] + 3500, -0.5, OCEAN[2]);
    for (const g of [river, sea]) { const w = new THREE.Mesh(g, m); w.receiveShadow = true; this.root.add(w); }
  }

  // ---------------- indoor sets (no ceilings; walls never cast shadows so the sun lights the floor) ----------------
  buildRooms() {
    const R = this.root, M = this.M;
    this.rooms = {};
    const room = (key, w, d, h, wallM, floorM, extra, noFront = false) => {
      const [x, y, z] = ROOM[key], g = new THREE.Group();
      const fl = new THREE.Mesh(quadUp(x - w / 2, x + w / 2, z - d / 2, z + d / 2, y, 3), floorM); fl.receiveShadow = true; g.add(fl);
      const walls = [boxGeo(x - w / 2 - 0.3, y, z - d / 2 - 0.3, x + w / 2 + 0.3, y + h, z - d / 2, 3),
        boxGeo(x - w / 2 - 0.3, y, z - d / 2, x - w / 2, y + h, z + d / 2, 3), boxGeo(x + w / 2, y, z - d / 2, x + w / 2 + 0.3, y + h, z + d / 2, 3)];
      if (!noFront) walls.push(boxGeo(x - w / 2 - 0.3, y, z + d / 2, x + w / 2 + 0.3, y + h, z + d / 2 + 0.3, 3));
      for (const wg of walls) { const m = new THREE.Mesh(wg, wallM); m.receiveShadow = true; m.castShadow = false; g.add(m); }
      const b = new Batch(); extra(b, x, y, z); b.build(g, true, true);
      g.visible = false; R.add(g); this.rooms[key] = g; return g;
    };
    const planks = lam("planksHD", () => ({ map: planksHD() }));
    const wood = lam("wood", () => ({ color: "#8a6440" })), dark = lam("darkwood", () => ({ color: "#4a2e1c" })), white = lam("paper", () => ({ color: "#f4f0e4" }));
    const table = (b, x, y, z, w, d, h = 0.78, top = wood) => { b.add(boxGeo(x - w / 2, y + h - 0.06, z - d / 2, x + w / 2, y + h, z + d / 2, 1), top); for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(boxGeo(x + sx * (w / 2 - 0.08) - 0.05, y, z + sz * (d / 2 - 0.08) - 0.05, x + sx * (w / 2 - 0.08) + 0.05, y + h, z + sz * (d / 2 - 0.08) + 0.05, 1), dark); };
    const windowWall = (b, x, y, z, w, n) => { for (let i = 0; i < n; i++) { const x0 = x + i * (w / n) + 0.4; b.add(quad(V(x0, y + 1.0, z), V(x0 + w / n - 0.8, y + 1.0, z), V(x0 + w / n - 0.8, y + 3.0, z), V(x0, y + 3.0, z)), lam("winday", () => ({ color: "#d8e8f4", emissive: "#6a8090" }))); } };
    const steel = M.metal, grey = lam("camGrey", () => ({ color: "#d9dade" }));
    const secCam = (b, x, y, z, ry) => { const c = Math.cos(ry), s = Math.sin(ry); b.add(boxGeo(x - 0.06, y - 0.05, z - 0.06, x + 0.06, y + 0.25, z + 0.06, 1), steel); const bx = x + s * 0.25, bz = z + c * 0.25; b.add(beam(V(x, y, z), V(bx, y - 0.1, bz), 0.22, 0.2), grey); b.add(cyl(0.06, 0.06, 0.04, 10, bx + s * 0.14, y - 0.15, bz + c * 0.14, Math.PI / 2 - 0.3), lam("lens", () => ({ color: "#1a1c22" }))); };
    // a Victorian laboratory: panelled walls, shelves of jars, a long table with microscopes and flasks
    room("office", 9, 7, 3.8, lam("woodPanel", () => ({ map: PT.panelTex() })), planks, (b, x, y, z) => {
      const brass = lam("brassLab", () => ({ color: "#c9a24a" })), glass = lam("labGlass", () => ({ color: "#a8d0d8", emissive: "#2a4a50" }));
      b.add(boxGeo(x - 2.2, y, z - 1.4, x + 2.2, y + 0.85, z - 0.4, 2), wood); b.add(boxGeo(x - 2.3, y + 0.85, z - 1.5, x + 2.3, y + 0.92, z - 0.3, 1), lam("labTop", () => ({ color: "#3a3028" })));
      for (const mx of [-1.1, 0.9]) { b.add(boxGeo(x + mx - 0.14, y + 0.92, z - 1.05, x + mx + 0.14, y + 0.97, z - 0.8, 1), brass); b.add(beam(V(x + mx, y + 0.97, z - 1.0), V(x + mx + 0.05, y + 1.35, z - 0.98), 0.03, 0.03), brass); b.add(cyl(0.035, 0.03, 0.26, 8, x + mx + 0.06, y + 1.3, z - 0.9, 0.35, 0), brass); b.add(cyl(0.08, 0.08, 0.02, 12, x + mx, y + 1.08, z - 0.92), lam("stage", () => ({ color: "#2a2a2e" }))); }
      for (let k = 0; k < 6; k++) { const fx2 = x - 0.4 + k * 0.22; b.add(cyl(0.05 + (k % 2) * 0.03, 0.07, 0.18 + (k % 3) * 0.06, 10, fx2, y + 1.0 + (k % 3) * 0.03, z - 0.7 - (k % 2) * 0.3), glass); }
      for (const yy of [1.0, 1.7, 2.4]) { b.add(boxGeo(x - 4.4, y + yy, z - 3.5, x + 4.4, y + yy + 0.05, z - 3.1, 1), wood); for (let k = 0; k < 16; k++) b.add(cyl(0.08, 0.08, 0.26 + (k % 3) * 0.05, 8, x - 4.1 + k * 0.55, y + yy + 0.18, z - 3.3), lam("jar" + (k % 4), () => ({ color: ["#b8c890", "#c8a070", "#a8c8c8", "#d0b0a0"][k % 4] }))); }
      b.add(quad(V(x + 4.49, y + 1.0, z + 1.5), V(x + 4.49, y + 1.0, z - 1.0), V(x + 4.49, y + 3.0, z - 1.0), V(x + 4.49, y + 3.0, z + 1.5)), lam("labWin", () => ({ color: "#c8d8e8", emissive: "#5a6a7a" })));
      b.add(boxGeo(x - 3.6, y, z + 0.6, x - 2.8, y + 1.1, z + 1.4, 1), dark);
    });
    // the Opel showroom: big windows, polished floor (the car itself is a pooled vehicle)
    room("showroom", 14, 10, 4.5, lam("showWall", () => ({ map: GT.plasterTex("showW", "#e8e2d2") })), lam("showFloor", () => ({ map: GT.plasterTex("showF", "#b8b2a6") })), (b, x, y, z) => {
      windowWall(b, x - 6, y, z - 4.99, 12, 3);
      for (const sx of [-1, 1]) b.add(cyl(0.3, 0.35, 4.5, 14, x + sx * 4.5, y + 2.25, z - 2.5), lam("column", () => ({ color: "#e9e4d8" })));
      b.add(boxGeo(x + 4, y, z + 1.5, x + 5.4, y + 0.8, z + 2.2, 1), wood);
      for (let k = 0; k < 5; k++) b.add(cyl(0.025, 0.025, 1.4, 6, x - 4 + k * 2, y + 3.8, z - 1), lam("pennant" + (k % 2), () => ({ color: k % 2 ? "#e8c45a" : "#c4302a" })));
    });
    room("bank", 14, 10, 4.5, lam("bankWall", () => ({ map: GT.plasterTex("bankW", "#d9cfb8") })), lam("marble", () => ({ map: GT.plasterTex("marbleF", "#c9c3b4") })), (b, x, y, z) => {
      b.add(boxGeo(x - 5, y, z - 3.6, x + 5, y + 1.15, z - 2.9, 2), dark);
      b.add(boxGeo(x - 5, y + 1.15, z - 3.3, x + 5, y + 1.2, z - 3.1, 1), lam("brass", () => ({ color: "#c9a24a" })));
      for (let k = 0; k <= 30; k++) b.add(cyl(0.012, 0.012, 1.0, 4, x - 5 + k * (10 / 30), y + 1.7, z - 3.2), lam("brass", () => ({ color: "#c9a24a" })));
      for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) b.add(cyl(0.35, 0.4, 4.5, 14, x + sx * (3 + k * 3), y + 2.25, z + 1.5), lam("column", () => ({ color: "#e9e4d8" })));
      for (let k = 0; k < 4; k++) b.add(cyl(0.03, 0.05, 0.95, 6, x - 3 + k * 2, y + 0.48, z - 1.2), lam("brass", () => ({ color: "#c9a24a" })));
      windowWall(b, x - 6, y, z + 4.99, 12, 3);
    });
    // a living room at night: sofa, lamp, TV
    room("living", 8, 7, 3, lam("wallpaper", () => ({ map: GT.wallpaperTex() })), lam("carpetL", () => ({ color: "#7a5a4a" })), (b, x, y, z) => {
      b.add(boxGeo(x - 1.5, y, z + 0.8, x + 1.5, y + 0.45, z + 1.7, 1), lam("sofa", () => ({ color: "#3f6a5a" })));
      b.add(boxGeo(x - 1.5, y + 0.45, z + 1.45, x + 1.5, y + 1.0, z + 1.75, 1), lam("sofa", () => ({ color: "#3f6a5a" })));
      for (const sx of [-1, 1]) b.add(boxGeo(x + sx * 1.5 - 0.15, y + 0.45, z + 0.8, x + sx * 1.5 + 0.15, y + 0.7, z + 1.75, 1), lam("sofa", () => ({ color: "#3f6a5a" })));
      b.add(boxGeo(x - 0.7, y, z - 3.2, x + 0.7, y + 0.6, z - 2.7, 1), dark);
      b.add(boxGeo(x - 0.55, y + 0.6, z - 3.2, x + 0.55, y + 1.4, z - 2.75, 1), lam("tvBody", () => ({ color: "#3a3430" })));
      b.add(cyl(0.18, 0.12, 0.4, 10, x + 2.2, y + 1.2, z + 1.4), lam("lampShadeL", () => ({ color: "#ffd88a", emissive: "#ffb040", emissiveIntensity: 1.2 })));
      b.add(cyl(0.02, 0.02, 1.0, 6, x + 2.2, y + 0.5, z + 1.4), steel);
      table(b, x - 2.6, y, z - 1.4, 1.2, 0.7); b.add(boxGeo(x - 3.0, y, z - 0.9, x - 2.6, y + 0.45, z - 0.5, 1), dark);
      b.add(cyl(0.12, 0.08, 0.2, 10, x - 2.2, y + 1.05, z - 1.55), lam("lampShadeL", () => ({ color: "#ffd88a", emissive: "#ffb040", emissiveIntensity: 1.2 }))); b.add(cyl(0.015, 0.015, 0.25, 6, x - 2.2, y + 0.9, z - 1.55), steel);
    });
    // the interrogation room: grey walls, a table, a TV on a cart
    room("interro", 7, 6, 3.2, lam("interroWall", () => ({ map: GT.plasterTex("int", "#9aa0a4") })), lam("interroFloor", () => ({ map: GT.plasterTex("intF", "#6a6e72") })), (b, x, y, z) => {
      table(b, x, y, z, 1.8, 0.9, 0.76, steel);
      b.add(quad(V(x - 3.49, y + 1.0, z + 1.5), V(x - 3.49, y + 1.0, z - 1.5), V(x - 3.49, y + 2.4, z - 1.5), V(x - 3.49, y + 2.4, z + 1.5)), lam("mirror", () => ({ color: "#2a3038", emissive: "#151a22" })));
      b.add(cyl(0.3, 0.05, 0.25, 12, x, y + 2.7, z), lam("lampShadeI", () => ({ color: "#5a5e62", emissive: "#3a3a30" })));
    });
    // the prison cell
    // the Oval Office: cream walls, deep blue carpet, the Resolute-style desk, tall windows, flags
    room("oval", 9, 7, 3.6, lam("ovalWall", () => ({ map: GT.plasterTex("ovalW", "#efe6cc") })), lam("ovalCarpet", () => ({ color: "#2a3a6a" })), (b, x, y, z) => {
      for (const wx of [-2.2, 0, 2.2]) { b.add(quad(V(x + wx - 0.7, y + 0.9, z - 3.45), V(x + wx + 0.7, y + 0.9, z - 3.45), V(x + wx + 0.7, y + 3.0, z - 3.45), V(x + wx - 0.7, y + 3.0, z - 3.45)), lam("ovalWin", () => ({ color: "#d8e8f4", emissive: "#8aa0b4" }))); for (const sx of [-0.85, 0.85]) b.add(boxGeo(x + wx + sx - 0.12, y + 0.6, z - 3.45, x + wx + sx + 0.12, y + 3.3, z - 3.3, 1), lam("ovalDrape", () => ({ color: "#c9a24a" }))); }
      b.add(boxGeo(x - 1.3, y, z - 1.6, x + 1.3, y + 0.8, z - 0.8, 2), wood); b.add(boxGeo(x - 1.4, y + 0.8, z - 1.7, x + 1.4, y + 0.88, z - 0.7, 1), wood);
      b.add(boxGeo(x - 0.35, y, z - 2.6, x + 0.35, y + 0.48, z - 2.1, 1), lam("ovalChair", () => ({ color: "#3a2a20" }))); b.add(boxGeo(x - 0.35, y + 0.48, z - 2.65, x + 0.35, y + 1.4, z - 2.5, 1), lam("ovalChair", () => ({ color: "#3a2a20" })));
      const g = new THREE.CircleGeometry(1.6, 32); g.rotateX(-Math.PI / 2); g.translate(x, y + 0.01, z + 0.4); b.add(g, lam("seal", () => ({ color: "#c9b27a" })));
      for (const fx of [-3.6, 3.6]) b.add(cyl(0.025, 0.025, 2.6, 6, x + fx, y + 1.3, z - 3.1), lam("brass", () => ({ color: "#c9a24a" })));
    });
    // a 1940s Phoenix motel room at night: knotty-pine walls, bed along the left wall, nightstand lamp, window with the neon outside, Mike's box
    room("motel", 7, 6, 3, lam("pineWall", () => ({ map: PT.panelTex(2) })), lam("motelCarpet", () => ({ color: "#6a4a3a" })), (b, x, y, z) => {
      const bedW = lam("bedWood", () => ({ color: "#5a3a26" })), sheet = lam("sheet", () => ({ color: "#efe8da" })), quilt = lam("quilt", () => ({ map: GT.canvasTex("quilt", "#3f7f7a") }));
      b.add(boxGeo(x - 2.6, y, z - 1.9, x - 0.6, y + 0.42, z - 0.5, 1), bedW);
      b.add(boxGeo(x - 2.55, y + 0.42, z - 1.85, x - 0.65, y + 0.6, z - 0.55, 1), sheet);
      b.add(boxGeo(x - 2.05, y + 0.6, z - 1.88, x - 0.62, y + 0.68, z - 0.52, 1), quilt);
      b.add(boxGeo(x - 2.5, y + 0.6, z - 1.7, x - 2.12, y + 0.76, z - 0.7, 1), sheet);
      b.add(boxGeo(x - 2.72, y, z - 1.95, x - 2.6, y + 1.05, z - 0.45, 1), bedW);
      b.add(boxGeo(x - 0.62, y, z - 1.95, x - 0.5, y + 0.7, z - 0.45, 1), bedW);
      b.add(boxGeo(x - 3.3, y, z - 2.0, x - 2.8, y + 0.55, z - 1.5, 1), bedW);
      b.add(cyl(0.06, 0.08, 0.3, 10, x - 3.05, y + 0.7, z - 1.75), lam("lampBase", () => ({ color: "#c9a24a" })));
      b.add(cyl(0.12, 0.2, 0.26, 12, x - 3.05, y + 0.98, z - 1.75), lam("lampShadeM", () => ({ color: "#ffe2a8", emissive: "#ffb850", emissiveIntensity: 1.3 })));
      b.add(quad(V(x - 0.4, y + 1.0, z - 2.99), V(x + 1.4, y + 1.0, z - 2.99), V(x + 1.4, y + 2.3, z - 2.99), V(x - 0.4, y + 2.3, z - 2.99)), lam("nightWin", () => ({ color: "#1d2a52", emissive: "#2a3a7a", emissiveIntensity: 0.9 })));
      for (let k = 0; k < 7; k++) b.add(boxGeo(x - 0.45, y + 1.0 + k * 0.2, z - 2.98, x + 1.45, y + 1.03 + k * 0.2, z - 2.95, 1), lam("blind", () => ({ color: "#d8d0bc" })));
      for (const sx of [-0.62, 1.62]) b.add(boxGeo(x + sx - 0.18, y + 0.8, z - 2.97, x + sx + 0.18, y + 2.6, z - 2.9, 1), lam("drape", () => ({ color: "#b8483a" })));
      b.add(boxGeo(x + 2.4, y, z - 2.9, x + 3.4, y + 0.9, z - 2.3, 1), bedW);
      // Mike's open crate on the floor, between the bed and the window
      const crate = lam("crate", () => ({ color: "#b88a5a" })), bx = x - 0.05, bz = z - 1.4;
      b.add(boxGeo(bx - 0.32, y, bz - 0.24, bx + 0.32, y + 0.04, bz + 0.24, 1), crate);
      for (const sx of [-1, 1]) b.add(boxGeo(bx + sx * 0.32 - 0.02, y, bz - 0.24, bx + sx * 0.32 + 0.02, y + 0.3, bz + 0.24, 1), crate);
      b.add(boxGeo(bx - 0.32, y, bz - 0.26, bx + 0.32, y + 0.3, bz - 0.22, 1), crate);
      b.add(boxGeo(bx - 0.32, y, bz + 0.22, bx + 0.32, y + 0.18, bz + 0.26, 1), crate);
      b.add(boxGeo(bx - 0.28, y + 0.04, bz - 0.2, bx + 0.28, y + 0.09, bz + 0.2, 1), lam("straw", () => ({ color: "#e2c46a" })));
      b.add(boxGeo(x + 1.6, y, z + 0.9, x + 2.3, y + 0.45, z + 1.15, 1), lam("suitcase", () => ({ color: "#7a4a2a" })));
    });
  }

  // ---------------- pooled vehicles ----------------
  vehicle(type, i) {
    const P = this.pools[type] || (this.pools[type] = []);
    while (P.length <= i) {
      const parts = VEH[type](), g = new THREE.Group(), VM = this.VM;
      const meshes = {};
      for (const [k, gs] of Object.entries(parts)) {
        if (!gs.length) continue;
        const m = k === "body" ? VM.rubber : k === "dark" ? VM.dark : k === "tilt" ? VM.tilt : k === "horn" ? VM.horn : k === "deck" ? VM.deck : VM.dark;
        const mesh = new THREE.Mesh(merge(gs), m); mesh.castShadow = mesh.receiveShadow = true; g.add(mesh); meshes[k] = mesh;
      }
      g.userData.meshes = meshes; g.visible = false; this.root.add(g); P.push(g);
    }
    return P[i];
  }
  poseVehicles(list) {
    const used = {};
    for (const v of list) {
      const i = used[v.type] = (used[v.type] ?? -1) + 1, g = this.vehicle(v.type, i), VM = this.VM, me = g.userData.meshes;
      const mat = v.mat ?? ({ ute: "uteGreen", plane: "grey", ship: "hull", bicycle: "bike", boat: "boat", camera: "dark", loco: "loco", carriage: "train", car: "carBlack", policecar: "cop" }[v.type] ?? "steel");
      if (me.body) me.body.material = VM[mat]; if (me.tilt) me.tilt.material = VM.tilt;
      const k = v.k ?? 1, y = inflateY(k), w = 1 + 0.08 * (1 - k);
      g.visible = true; g.position.set(v.x, v.y ?? 0, v.z);
      g.rotation.set(v.pitch ?? 0, v.yaw ?? 0, v.roll ?? 0, "YXZ");
      g.scale.set(w * (v.s ?? 1), Math.max(0.03, y) * (v.s ?? 1), w * (v.s ?? 1));
    }
    for (const [type, P] of Object.entries(this.pools)) for (let i = (used[type] ?? -1) + 1; i < P.length; i++) P[i].visible = false;
  }

  shotSun(st) {
    const L = LIGHTS[st.light], az = THREE.MathUtils.degToRad(st.sunAz ?? L.az), el = THREE.MathUtils.degToRad(st.sunEl ?? L.el);
    const fx = st.fwd[0], fz = st.fwd[1];
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    return new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
  }

  update(st, cam, scene) {
    const L = LIGHTS[st.light], K = LOOK[st.light], t = st.t;
    cam.position.set(...st.cam.pos); cam.up.set(0, 1, 0); cam.lookAt(...st.cam.look); cam.rotateZ(st.cam.roll || 0);
    cam.fov = st.cam.fov; cam.near = st.near ?? 0.2; cam.far = 6000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...st.cam.look), dist = cam.position.distanceTo(focus);
    const sunDir = this.shotSun(st);
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI * (st.sunK ?? 1);
    const Rr = THREE.MathUtils.clamp(st.shadowR ?? dist * 1.15 + 7, 6, 500);
    const want = Rr < 40 ? 1024 : 2048;
    if (this.sun.shadow.mapSize.x !== want) { this.sun.shadow.mapSize.set(want, want); if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; } }
    const sc0 = st.shadowAt ? V(...st.shadowAt) : focus;
    this.sun.position.copy(sc0).addScaledVector(sunDir, 900); this.sun.target.position.copy(sc0);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 100; sc.far = 2000; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias * 2; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = st.fogNear ?? L.fogNear * 2; this.fog.far = st.fogFar ?? L.fogFar * 2.6;
    scene.fog = this.fog; scene.background = null;
    const showSun = (st.light === "golden" || st.light === "night") && st.showSun !== false;
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 2600);
      this.sunDisc.scale.setScalar(2 * 2600 * Math.tan(THREE.MathUtils.degToRad(st.light === "night" ? 1.3 : 1.7)));
      this.sunDisc.material.color.set(st.light === "night" ? new THREE.Color(1.6, 1.7, 2.0) : new THREE.Color(5, 3.8, 2.4));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 2600 * Math.tan(THREE.MathUtils.degToRad(st.light === "night" ? 8 : 24)));
      this.sunHalo.material.color.set(L.sunDisc).multiplyScalar(st.light === "night" ? 0.35 : 1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], u = m.userData;
      m.position.set(cam.position.x + Math.cos(u.a) * u.d, u.y, cam.position.z + Math.sin(u.a) * u.d); m.scale.set(u.w, u.w / 2, 1);
      m.lookAt(cam.position.x, m.position.y, cam.position.z); m.material.map = this.cloudMaps[st.light][i % 4]; m.visible = cam.position.y < 900;
    }
    const wc = st.light === "golden" ? { near: "#1f5fb0", mid: "#3a78c0", far: "#d8a98a", crest: "#e8c0a0", trough: "#174a8a", glint: "#ffe2b0", shade: [0.5, 0.52, 0.72] }
      : st.light === "night" ? { near: "#123a7a", mid: "#1a4a8f", far: "#3a5f9e", crest: "#6a8ac8", trough: "#0c2a5a", glint: "#d8e4ff", shade: [0.65, 0.65, 0.8] }
      : { near: "#1f78d6", mid: "#2f8ae6", far: "#8fc4f2", crest: "#c4e4ff", trough: "#1559ad", glint: "#ffffff", shade: [0.6, 0.66, 0.8] };
    const W = this.WU;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;
    // indoor sets, theatre, Rhine army, vehicles
    const show = st.props || {};
    for (const [k, g] of Object.entries(this.rooms)) g.visible = !!show[k];
    this.poseVehicles(st.veh || []);
    st.sunDir = sunDir;
    this.cast.update(st, cam);
    return focus;
  }
}
/** inflation 0 (a flat sheet) .. 1 (full, with a little overshoot wobble near the end) */
export const inflateY = (k) => { const x = Math.max(0, Math.min(1, k)); if (x >= 1) return 1; const e = 1 - Math.pow(1 - x, 2.2); return 0.04 + 0.96 * e + 0.06 * Math.sin(x * Math.PI * 3) * x * (1 - x) * 4; };
