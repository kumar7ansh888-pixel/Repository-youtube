// Shared geometry helpers (from the bridge short's world.js): two-tone materials, boxes with metric UVs, members
// between two points, flat quads, and a merge-by-material batch.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { twoTone } from "../lib/shade.js";
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------------- geometry helpers ----------------
const mats = new Map();
export const lam = (key, make, liftK = 1) => {
  let m = mats.get(key);
  if (!m) { m = twoTone(new THREE.MeshLambertMaterial(make()), liftK); mats.set(key, m); }
  return m;
};
export const tile = (g, su, sv) => { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return g; };
/** box from min to max corner, uv in metres / tm */
export const boxGeo = (x0, y0, z0, x1, y1, z1, tm = 4) => {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  // per-face uv scaled by the face size
  const uv = g.attributes.uv, n = g.attributes.normal, sx = (x1 - x0) / tm, sy = (y1 - y0) / tm, sz = (z1 - z0) / tm;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    const [a, b] = nx > 0.5 ? [sz, sy] : ny > 0.5 ? [sx, sz] : [sx, sy];
    uv.setXY(i, uv.getX(i) * a, uv.getY(i) * b);
  }
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return g;
};
/** square-section member from a to b (w across, h second axis), texture tiled every 4 m along it */
export const beam = (a, b, w, h = w, up = V(0, 0, 1)) => {
  const len = a.distanceTo(b), g = new THREE.BoxGeometry(w, len, h);
  tile(g, 1, len / 4);
  const dir = b.clone().sub(a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
  // keep the member's h axis close to `up` (planar trusses stay flat-faced)
  const x0 = V(0, 0, 1).applyQuaternion(q), want = up.clone().sub(dir.clone().multiplyScalar(up.dot(dir))).normalize();
  if (want.lengthSq() > 0.01) {
    const ang = Math.atan2(x0.clone().cross(want).dot(dir), x0.dot(want));
    q.premultiply(new THREE.Quaternion().setFromAxisAngle(dir, ang));
  }
  g.applyQuaternion(q);
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
export const quadUp = (x0, x1, z0, z1, y, tu = 4) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  g.rotateX(-Math.PI / 2);
  tile(g, (x1 - x0) / tu, (z1 - z0) / tu);
  g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  return g;
};
export class Batch {
  constructor() { this.parts = new Map(); }
  add(g, m) { const gg = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(gg.attributes)) if (!["position", "normal", "uv"].includes(k)) gg.deleteAttribute(k); let l = this.parts.get(m); if (!l) this.parts.set(m, (l = [])); l.push(gg); }
  build(parent, cast = true, recv = true) {
    const out = [];
    for (const [m, gs] of this.parts) {
      const mesh = new THREE.Mesh(mergeGeometries(gs, false), m);
      mesh.castShadow = cast; mesh.receiveShadow = recv; mesh.matrixAutoUpdate = false;
      parent.add(mesh); out.push(mesh);
    }
    return out;
  }
}

