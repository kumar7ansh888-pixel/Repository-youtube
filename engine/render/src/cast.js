// The cast as lit flat cards in the 3D world (port of the skill's cast.ts Pool / Actor / Fx), plus our effects.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxContact, fxShadow, fxBurst, INK, mix, shade } from "../lib/toon.js";
import { LIGHTS } from "../lib/lights.js";
import { NOINK } from "../lib/ink.js";
import { cardShade, blobMaterial, CARD_K } from "../lib/cardshade.js";

// ---------------- canvas pool (verbatim logic from cast.ts) ----------------
const makeEntry = (w, h) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 1;
  return { cv, tex, w, h };
};
export class Pool {
  constructor() { this.live = new Map(); this.free = []; this.reqs = []; this.frame = 0; this.bytes = 0; this.budget = 420e6; }
  req(key, w, h, k, draw) { const r = { key: `${w}x${h}|${key}`, w, h, k, draw }; this.reqs.push(r); return r; }
  flush() {
    this.frame++;
    for (const r of this.reqs) {
      let e = this.live.get(r.key);
      if (!e) {
        const i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        if (i < 0) this.bytes += r.w * r.h * 4;
        const g = e.cv.getContext("2d");
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(r.key, e);
      }
      e.last = this.frame; r.tex = e.tex;
    }
    this.reqs = [];
    if (this.bytes > this.budget) {
      const old = [...this.live.entries()].filter(([, e]) => e.last < this.frame).sort((a, b) => a[1].last - b[1].last);
      for (const [k, e] of old) {
        if (this.bytes <= this.budget * 0.8) break;
        this.live.delete(k);
        if (this.free.length < 24) this.free.push(e); else { e.tex.dispose(); this.bytes -= e.w * e.h * 4; }
      }
    }
  }
}

const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);

class Actor {
  constructor(parent) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(BODY, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? Math.min(rt.width, rt.height) : Math.min(r.domElement.width, r.domElement.height)) / 1080; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh); this.r = null;
  }
  bind() { const t = this.r && this.r.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
class Fx {
  constructor(parent) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.lit = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat); this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh); this.r = null; this.kind = "cut";
  }
  bind() {
    const t = this.r && this.r.tex; if (!t) return;
    if (this.kind === "blob") { if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; } this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5; }
    else { const m = this.kind === "soft" ? this.soft : this.kind === "lit" ? this.lit : this.mat; m.map = t; this.mesh.material = m; this.mesh.renderOrder = this.kind === "soft" ? 2 : 0; }
  }
}

// ---------------- outfits ----------------
const SKINS = ["#c68c5f", "#b5794f", "#d9a77c", "#a86d45", "#e0b48a", "#bf8456"];
const HAIR = "#211a1e";
const SHIRTS = ["#f1ede2", "#8fb6d9", "#e8913a", "#8c3b4a", "#7c8a4a", "#d8d0bc", "#5a7fb5", "#c45a4a"];
const SARIS = [["#d6336c", "#f2c14e"], ["#e0a020", "#b8322f"], ["#2f8f6f", "#f0d27a"], ["#7a3fb0", "#f2b3c8"], ["#e05a2a", "#2f5f9a"]];
const LUNGI = ["#3f6fb5", "#6a5ab0", "#2f7f6a"];
const hh = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
/** commuter i: men in shirt + trousers or kurta + lungi, women in saris; some caps, a few moustaches */
export const commuter = (i) => {
  const skin = SKINS[i % SKINS.length], r = hh(i, 3);
  if (i % 3 === 1) { const [d, p] = SARIS[i % SARIS.length]; return { jacket: shade(d, 0.9), pants: "#4b4f5c", boots: "#5a3b2a", dress: d, pallu: p, skin, hat: "hair", hair: HAIR }; }
  const o = { jacket: SHIRTS[(i * 3) % SHIRTS.length], pants: r < 0.3 ? "#5b5148" : "#4b4f5c", boots: "#4a3426", skin, hat: "hair", hair: HAIR };
  if (r > 0.75) { o.dress = LUNGI[i % 3]; }
  if (hh(i, 5) < 0.4) o.moustache = "#2a201a";
  if (hh(i, 6) < 0.15) { o.hat = "cap"; o.cap = "#f2efe6"; }
  return o;
};
export const OUT = {
  spitter: { jacket: "#e8913a", pants: "#4b4f5c", boots: "#4a3426", skin: "#b5794f", hat: "hair", hair: HAIR, moustache: "#2a201a" },
  engineer: { jacket: "#3f6f9a", pants: "#3b3f52", boots: "#2a2a2e", skin: "#c68c5f", hat: "helmet", cap: "#f3f1ea", moustache: "#2a201a", build: "stout" },
  worker: (i) => ({ jacket: ["#e86a2a", "#3f7f5a", "#2f5f9a"][i % 3], pants: "#3b3f52", boots: "#2a2a2e", skin: SKINS[(i + 2) % 6], hat: "helmet", cap: "#f2b43a" }),
  official: { jacket: "#f1ede2", pants: "#f1ede2", boots: "#4a3426", skin: "#d9a77c", hat: "tophat", moustache: "#3a2a20", build: "stout" },
  officer: { jacket: "#c9b48a", pants: "#c9b48a", boots: "#3a2a20", skin: "#e0b48a", hat: "cap", cap: "#7a6a4a", moustache: "#4a3020" },
  riveter: { jacket: "#6a5a48", pants: "#4b4f5c", boots: "#3a2a20", skin: "#a86d45", hat: "cap", cap: "#d8d0bc" },
  paanwala: { jacket: "#f1ede2", pants: "#f1ede2", boots: "#4a3426", skin: "#a86d45", hat: "hair", hair: HAIR, moustache: "#1e1a1d", dress: "#2f7f6a" },
  crew: (i) => ({ jacket: ["#f1ede2", "#3f6fb5"][i % 2], pants: "#3b3f52", boots: "#2a2a2e", skin: SKINS[(i + 1) % 6], hat: "cap", cap: "#2f3a4c" }),
};

// ---------------- effects drawings ----------------
const PAAN = "#a8301f", PAAN_D = "#6e1a12";
export const DRAW = {
  /** spit droplet stream: an arc of droplets on a 512 x 256 canvas, k = 0..1 how far it has flown */
  splat: (p, seed = 1) => {
    const c = 256, pts = [];
    for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, r = 90 + 60 * hh(seed, i) + (i % 3 === 0 ? 50 : 0); pts.push([c + Math.cos(a) * r, c + Math.sin(a) * r * 0.85]); }
    p.poly(pts, PAAN, 10);
    p.ell(c - 20, c - 18, 40, 30, mix(PAAN, "#ffffff", 0.2), 0);
    for (let i = 0; i < 7; i++) { const a = hh(seed, i + 20) * 6.28, d = 170 + 60 * hh(seed, i + 30); p.ell(c + Math.cos(a) * d, c + Math.sin(a) * d * 0.85, 16, 14, PAAN, 6); }
  },
  drop: (p, col = PAAN) => { p.poly([[128, 20], [178, 140], [168, 200], [128, 230], [88, 200], [78, 140]], col, 12); p.ell(110, 150, 14, 22, mix(col, "#ffffff", 0.45), 0); },
  water: (p) => DRAW.drop(p, "#9fd4ff"),
  dropping: (p, seed = 1) => {
    const c = 128, pts = [];
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = 50 + 30 * hh(seed, i); pts.push([c + Math.cos(a) * r, c + Math.sin(a) * r]); }
    p.poly(pts, "#f4f1e6", 8); p.ell(c + 8, c + 6, 18, 14, "#8a8f8a", 0);
  },
  pigeon: (p, pose = 0, flap = 0) => {
    // side-view pigeon facing right on a 512 x 400 canvas
    const body = [[120, 250], [190, 190], [300, 180], [370, 210], [400, 250], [330, 300], [200, 300]];
    p.poly([[110, 245], [40, 230], [60, 270], [130, 270]], "#7d8494", 10); // tail
    p.poly(body, "#9aa2b2", 12);
    p.poly([[370, 210], [410, 150], [450, 160], [460, 200], [430, 240]], "#9aa2b2", 12); // neck + head
    p.ell(436, 178, 9, 9, INK, 0);
    p.poly([[458, 186], [490, 196], [458, 204]], "#e2a050", 6);
    p.poly([[385, 225], [415, 215], [425, 240]], "#5e9a8a", 0); // neck sheen
    const wy = flap ? -120 : 0;
    p.poly([[200, 220], [300, 210 + wy], [360, 230 + wy * 0.6], [300, 260]], "#858d9e", 10); // wing
    for (const x of [250, 290]) p.stroke([[x, 300], [x - 6, 345], [x + 14, 350]], 8, "#d26a5a");
  },
  plane: (p) => {
    // generic WWII twin-engine silhouette from below, dark, no markings (512 x 512)
    const c = "#2c2e3c";
    p.poly([[256, 60], [276, 90], [282, 380], [256, 470], [230, 380], [236, 90]], c, 0);
    p.poly([[40, 230], [472, 230], [472, 262], [40, 262]], c, 0);
    p.poly([[170, 410], [342, 410], [342, 432], [170, 432]], c, 0);
    for (const x of [170, 342]) p.ell(x, 220, 18, 48, c, 0);
  },
  burst: (p, t) => fxBurst(p, t, "#fff3b0", 10, 40, 230),
  rust: (p, seed = 1) => { for (let i = 0; i < 9; i++) { const a = hh(seed, i) * 6.28, d = 80 * hh(seed, i + 9); p.ell(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, 30 + 20 * hh(seed, i + 3), 24, i % 2 ? "#9c5a2c" : "#7a3e1c", 0); } },
  flake: (p) => p.poly([[40, 60], [200, 30], [230, 120], [120, 200], [30, 150]], "#8c9296", 10),
  shine: (p) => { for (let i = 0; i < 5; i++) p.ell(60 + i * 35, 128 + 30 * Math.sin(i * 2), 14, 8, "rgba(255,255,255,0.9)", 0); },
  zz: (p) => { p.stroke([[80, 100], [180, 100], [80, 180], [180, 180]], 18, INK); },
  scissors: (p) => { p.ell(80, 180, 40, 30, null, 14); p.ell(80, 90, 40, 30, null, 14); p.band([[110, 160], [260, 110]], "#d9dde2", 18, 5); p.band([[110, 110], [260, 150]], "#d9dde2", 18, 5); },
  /** cartoon vernier caliper gripping a plate cross-section; k = 1 thick clean steel .. 0 half as thick and rusty */
  calipers: (p, k = 1) => {
    const t = 70 + 70 * k, x0 = 256 - t / 2, rustC = mix("#9aa0a6", "#8a4a26", 1 - k);
    p.poly([[x0, 120], [x0 + t, 120], [x0 + t, 470], [x0, 470]], rustC, 9);
    if (k < 0.9) for (let i = 0; i < 6; i++) p.ell(x0 + (i % 2 ? t : 0), 170 + i * 55, 12 * (1 - k) + 4, 16, "#7a3e1c", 0);
    p.poly([[60, 40], [470, 40], [470, 92], [60, 92]], "#e3e6ea", 9); // beam
    for (let x = 80; x < 460; x += 18) p.stroke([[x, 44], [x, x % 54 === 8 ? 70 : 60]], 4, INK);
    p.poly([[x0 - 70, 40], [x0, 40], [x0, 250], [x0 - 18, 280], [x0 - 70, 92]], "#d4d8dd", 9); // fixed jaw
    p.poly([[x0 + t, 40], [x0 + t + 70, 40], [x0 + t + 70, 92], [x0 + t + 18, 280], [x0 + t, 250]], "#d4d8dd", 9); // sliding jaw
    p.poly([[x0 + t + 40, 20], [x0 + t + 130, 20], [x0 + t + 130, 112], [x0 + t + 40, 112]], "#c9ced4", 8);
  },
};

// ---------------- light ----------------
const tmp = new THREE.Vector3();
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps */
const light2D = (sun, right, mirror) => {
  const sx = sun.dot(right) * (mirror ? -1 : 1), sy = -sun.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
const q = (v, n = 60) => Math.round(v * n) / n;
const qp = (v) => (Math.round(v * 12) % 12) / 12; // walk phase: 12 drawings per cycle, shared and cached
const fkey = (o) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

/** eyelid 0 open .. 1 shut: 4-frame blinks every 0.5-2.3 s per character */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (f, i) => {
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 600; n++) { const k = f - s; if (k >= 0 && k < 4) return LID[k]; s += Math.round(15 + 54 * hh(i * 31 + n, 13)); }
  return 0;
};
const toSrgb = (v) => { const c = Math.max(0, Math.min(1, v)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c, k) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const CONTACT = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], night: [0.3, 0.32, 0.45] };
const TAIL = [0.42, 0.44, 0.62];

export class Cast {
  constructor(root) { this.root = root; this.pool = new Pool(); this.actors = []; this.fxs = []; this.frustum = new THREE.Frustum(); this.m4 = new THREE.Matrix4(); this.sph = new THREE.Sphere(); }
  actor(i) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  fx(i) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(st, cam) {
    const sun = st.sunDir, right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const Hpx = st.H || 1920, f = st.f;
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const fx = [], used = [];
    let ai = 0;
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    for (const pl of st.places) {
      const sc = pl.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(tmp.set(pl.x, pl.y + 1.1 * sc, pl.z), 2.5 * sc))) continue;
      // projected card height in px -> canvas tier
      const d = Math.max(0.3, cam.position.distanceTo(tmp.set(pl.x, pl.y + 1.0 * sc, pl.z)));
      const px = (2.16 * sc * Hpx) / (2 * d * tanH);
      const [w, h, k] = px > 1100 ? [1200, 2000, 2.0] : px > 560 ? [720, 1200, 1.2] : px > 280 ? [360, 600, 0.6] : px > 120 ? [180, 300, 0.3] : [90, 150, 0.15];
      // view: front unless walking across the camera (then side, mirrored by direction)
      let side = false, mirror = false;
      if (pl.dir) {
        const tx = cam.position.x - pl.x, tz = cam.position.z - pl.z, tl = Math.hypot(tx, tz) || 1, dl = Math.hypot(pl.dir[0], pl.dir[1]) || 1;
        const c = (tx * pl.dir[0] + tz * pl.dir[1]) / (tl * dl);
        side = pl.view ? pl.view === "side" : Math.abs(c) < 0.55;
        mirror = pl.dir[0] * right.x + pl.dir[1] * right.z < 0;
      }
      if (pl.mirror !== undefined) mirror = pl.mirror;
      const light = light2D(sun, right, side && mirror);
      const o = pl.o, seed = pl.seed ?? ((pl.i * 5 + 3) % 7) + 1;
      const lid = pl.noBlink ? 0 : lidAt(f, pl.i ?? 0);
      let key, draw;
      if (side) {
        const so = { phase: qp(pl.phase ?? 0), expr: pl.expr ?? "neutral", mode: pl.mode === "stand" ? "stand" : "march", blink: lid, stomp: 1, stride: pl.stride ?? 0.8, light, seed };
        key = `S|${fkey(o)}|${fkey(so)}|${pl.sideKey ?? ""}`; draw = (p) => { bodySide(p, o, so); if (pl.extraSide) pl.extraSide(p); };
      } else {
        const fo = { phase: qp(pl.phase ?? 0), expr: pl.expr ?? "neutral", mode: pl.mode ?? "stroll", look: pl.look ?? 0, blink: lid, lift: pl.lift ?? 60, prop: pl.prop ?? null, tilt: pl.tilt ?? 0,
          headTilt: pl.headTilt ?? 0, wave: pl.wave, arms: pl.arms, light, facing: pl.facing ?? 0, seed, back: !!pl.backView };
        key = `F|${fkey(o)}|${fkey(fo)}`;
        draw = (p) => { bodyFront(p, o, fo); if (pl.extra) pl.extra(p); };
      }
      const a = this.actor(ai++);
      a.r = this.pool.req(key, w, h, k, draw);
      a.mesh.visible = true;
      a.mesh.position.set(pl.x, pl.y, pl.z);
      a.mesh.rotation.set(0, pl.yaw ?? Math.atan2(cam.position.x - pl.x, cam.position.z - pl.z), pl.roll ?? 0);
      const sq = pl.sq ?? 1, sqx = 1 / Math.sqrt(sq); a.mesh.scale.set((mirror && side ? -sc : sc) * sqx, sc * sq, sc);
      a.mesh.castShadow = LIGHTS[st.light].actorShadow;
      used.push(a);
      if (pl.blob !== false) this.blob(fx, st, pl.x, pl.y, pl.z, sc);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused = [];
    for (const p of [...st.fx, ...fx]) {
      if (!this.frustum.intersectsSphere(this.sph.set(tmp.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw ?? 256, p.ch ?? 256, p.k ?? 1, p.draw);
      e.kind = p.kind ?? (p.key.startsWith("blob|") ? "blob" : "cut");
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else if (p.normal) { e.mesh.lookAt(p.x + p.normal[0], p.y + p.normal[1], p.z + p.normal[2]); e.mesh.rotateZ(p.rot ?? 0); }
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      e.mesh.castShadow = false;
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
  }

  /** contact pool under the feet + (day) a soft tail away from the sun (skill's cast.ts blob()) */
  blob(out, st, x, y, z, sc) {
    const S = st.sunDir, hl = Math.hypot(S.x, S.z) || 1, ox = -S.x / hl, oz = -S.z / hl, rot = Math.atan2(-ox, -oz);
    if (st.light === "day") {
      const el = Math.asin(Math.min(0.99, Math.max(0.1, S.y)));
      const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
      const tc = hexOf(TAIL, 1);
      out.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72 * sc, h, flat: true, rot, kind: "blob" });
    }
    const cc = hexOf(CONTACT[st.light], 1);
    out.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x, y: y + 0.022, z, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot, kind: "blob" });
  }
}
