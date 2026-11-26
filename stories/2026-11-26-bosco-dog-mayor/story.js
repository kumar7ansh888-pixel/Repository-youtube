// Shot plan for "A Dog Won an Election Against Two Humans" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts: in 1981 Bosco, a black Labrador x Rottweiler mix, was elected honorary mayor of Sunol, California, beating two human candidates
// (Wikipedia, Local News Matters 2020, Atlas Obscura); he was nominated as a joke; platform "a bone in every dish, a cat in every tree, and a
// fire hydrant on every corner" (Local News Matters; Deseret News 1990 "fireplug"); he hung around Main Street and in front of the local bar
// (Local News Matters, Deseret News); in 1990 China's People's Daily used his election as an example of the failings of American democracy
// ("going to the dogs", Deseret News 1990; Wikipedia); he was unfazed (Deseret); he served until his death in 1994 (13 years) and a bronze statue
// was put up outside the post office in 2008 (Wikipedia, LNM, Atlas Obscura). Hook-first, cut every ~1.5-2 s, loop ending.
import * as K from "./draw_bosco.js";
import { SUNOL } from "./world.js";
import { INK } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1800;
export const setWords = (w) => { WORDS = w; TOTAL = Math.ceil((w[w.length - 1].end + 0.3) * FPS); buildShots(); };
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
const P = (phrase, after = -1, end = false) => {
  const ws = phrase.split(/\s+/).map(norm);
  for (let i = 0; i <= WORDS.length - ws.length; i++) {
    if (WORDS[i].start <= after) continue;
    if (ws.every((w, k) => norm(WORDS[i + k].word) === w)) return end ? WORDS[i + ws.length - 1].end : WORDS[i].start;
  }
  throw new Error("phrase not found: " + phrase);
};
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const glide = (u) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const smooth = (u) => { const x = clamp01(u); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const keys = (ks, creep = 0.002) => (s) => {
  let i = 0; while (i < ks.length - 1 && s > ks[i + 1].t) i++;
  const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)], u = b === a ? 0 : glide((s - a.t) / Math.max(0.001, b.t - a.t));
  return { pos: L3(a.pos, b.pos, u), look: L3(a.look, b.look, u), fov: lerp(a.fov ?? 40, b.fov ?? 40, u) * (1 - creep * s * FPS * 0.06), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) };
};
const push = (p0, l0, p1, l1, fov = 40, dur = 5, fov1 = fov) => keys([{ t: 0, pos: p0, look: l0, fov }, { t: dur, pos: p1, look: l1, fov: fov1 }]);
const kick = (t, at, amp = 0.012) => { let o = 0; for (const a of at) { const k = Math.round((t - a) * FPS); if (k >= 0 && k < 7) o += amp * (k % 2 ? -1 : 1) * (1 - k / 7); } return o; };
const two = Math.PI * 2;
const { txt, poly, hh, R, E } = K;

const DR = {
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, s.length > 2 ? 110 : 200, "Bangers", col, INK, 14, 240); },
  word: (p, s, col, u) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); const k = 0.7 + 0.3 * Math.min(1, u * 3); g.scale(k, k); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two, r = i % 2 ? 80 : 118; g.lineTo(Math.cos(a) * r * 2, Math.sin(a) * r * 0.9); } g.closePath(); g.fill(); g.stroke(); txt(g, s, 0, 6, 92, "Bangers", col, INK, 10, 400); g.restore(); },
  numBoard: (p, n, label, col) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(30, 30, 964, 452, 40); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.roundRect(56, 56, 912, 400, 28); g.stroke();
    txt(g, n, 512, 210, 230, "Bangers", col, INK, 16, 900); txt(g, label, 512, 380, 110, "Bangers", "#2a2a36", INK, 0, 880); },
  spark: (p, col = "#fffbe8") => { const g = p.g; g.clearRect(0, 0, 256, 256); poly(g, [[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], col, 8); },
  sweat: (p) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.beginPath(); g.moveTo(64, 10); g.quadraticCurveTo(110, 80, 64, 118); g.quadraticCurveTo(18, 80, 64, 10); g.fillStyle = "#8fd0ff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); },
  confetti: (p, k) => { const g = p.g, W = g.canvas.width, Hh = g.canvas.height; g.clearRect(0, 0, W, Hh); const C = ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a", "#ffffff", "#c8202e"]; for (let i = 0; i < 46; i++) { const x = hh(i, 1) * W, y = ((hh(i, 2) * Hh + k * 30 * (0.6 + hh(i, 3))) % (Hh + 48)) - 24; g.save(); g.translate(x, y); g.rotate(k * 0.7 + i); g.fillStyle = C[i % 6]; g.fillRect(-9, -5, 18, 10); g.restore(); } },
  zzz: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); for (let i = 0; i < 3; i++) { const ph = (k / 12 + i / 3) % 1; g.globalAlpha = Math.min(1, (1 - ph) * 3); txt(g, "Z", 70 + ph * 120 + i * 6, 220 - ph * 180, 40 + ph * 50, "Bangers", "#ffffff", INK, 8); } g.globalAlpha = 1; },
  heart: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); K.heart(g, 128, 140, 180); },
  box: (p, s) => { const g = p.g; g.clearRect(0, 0, 768, 384); R(g, 20, 30, 728, 340, 16, "#c8202e", 12); g.fillStyle = "#ffffff"; g.fillRect(32, 150, 704, 40); g.fillStyle = "#1c3a8a"; g.fillRect(32, 190, 704, 40); txt(g, s, 384, 96, 100, "Bangers", "#ffffff", INK, 8, 640); },
  label: (p, s, col) => { const g = p.g; g.clearRect(0, 0, 768, 256); R(g, 20, 30, 728, 196, 30, col, 10); txt(g, s, 384, 130, 120, "Bangers", "#ffffff", INK, 8, 680); },
  shop: (p, s, col) => { const g = p.g; g.clearRect(0, 0, 1024, 160); R(g, 8, 8, 1008, 144, 14, "#f4ecd8", 8); txt(g, s, 512, 84, 104, "Rye", col, INK, 0, 960); },
  banner: (p, s) => { const g = p.g; g.clearRect(0, 0, 1024, 192); R(g, 8, 8, 1008, 176, 20, "#fff4c0", 10); for (let i = 0; i < 3; i++) { g.fillStyle = ["#c8202e", "#ffffff", "#1c3a8a"][i]; g.fillRect(20, 150 + i * 8, 984, 8); } txt(g, s, 512, 84, 110, "AlfaSlab", "#1c3a8a", INK, 0, 940); },
  bunting: (p, k) => { const g = p.g; g.clearRect(0, 0, 1024, 128); g.beginPath(); g.moveTo(0, 14); g.quadraticCurveTo(512, 60, 1024, 14); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
    for (let i = 0; i < 16; i++) { const x = 32 + i * 62, y = 14 + 46 * (1 - Math.pow((x - 512) / 512, 2)) * 0.92, sw = Math.sin(k * 1.6 + i) * 6; poly(g, [[x - 24, y], [x + 24, y], [x + sw, y + 58]], ["#c8202e", "#ffffff", "#1c3a8a"][i % 3], 4); } },
  hand: (p) => { const g = p.g; g.clearRect(0, 0, 384, 256); R(g, 0, 90, 200, 80, 30, "#2a3a6a", 8); E(g, 240, 130, 70, 50, 0, "#f2d2b6", 8); for (let i = 0; i < 4; i++) R(g, 260, 84 + i * 24, 100, 24, 12, "#f2d2b6", 6); },
};
const drawBubble = (g, s, col = "#2a2a36") => { g.clearRect(0, 0, 768, 384); g.lineJoin = "round"; g.beginPath(); g.ellipse(384, 170, 350, 140, 0, 0, two); g.moveTo(240, 290); g.lineTo(150, 370); g.lineTo(330, 300); g.fillStyle = "#ffffff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  g.beginPath(); g.ellipse(384, 170, 344, 134, 0, 0, two); g.fill(); txt(g, s, 384, 176, 100, "Bangers", col, INK, 0, 600); };

const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });
const screenCard = (out, c, key, draw, d = 0.6, cw = 1024, ch = 512, kind = "soft") => {
  const fx = c.look[0] - c.pos[0], fy = c.look[1] - c.pos[1], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fy, fz);
  const h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.03, w = h * (9 / 16) * 1.03;
  out.fx.push({ key, cw, ch, draw, x: c.pos[0] + (fx / n) * d, y: c.pos[1] + (fy / n) * d, z: c.pos[2] + (fz / n) * d, w, h, kind });
};

export let SHOTS = [];
let CAM = null;
let THUMB = null;
const thumbShot = () => SHOTS[0];

const CAND = (v) => v ? { jacket: "#6a6a74", pants: "#3a3a44", boots: INK, hat: "hair", hair: "#3a2a1a", moustache: "#3a2a1a", skin: "#e8b894", build: "stout" }
  : { jacket: "#2a4a8a", pants: "#26262c", boots: INK, hat: "hair", hair: "#c89a4a", skin: "#f2d2b6", build: "adult" };
const FOLK = (v) => ({ jacket: ["#c8503a", "#6a9a4a", "#e8b83a", "#8a5ab0", "#3a7ac8", "#d0708a"][v % 6], pants: ["#3a3a48", "#5a4a3a", "#2a4a6a"][v % 3], boots: INK, hat: "hair", hair: ["#c89a4a", "#2a201a", "#8a5a32", "#3a2a1a", "#e8d08a", "#6a3a1a"][v % 6], skin: ["#f2d2b6", "#e8b894", "#ecd0b6", "#c99067", "#f4d6bc", "#a8704a"][v % 6], build: "adult" });

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const SETS = ["hall", "street", "bar", "plaza", "dusk", "news", "press", "drama", "park", "town"];
  const base = (k) => k === "town" ? SUNOL : [3200 + SETS.indexOf(k) * 200, 2000, 0];
  const at = (k) => { const B = base(k), Af = (x, y, z) => [B[0] + x, B[1] + y, B[2] + z];
    return { k, p: Af,
      fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); if (o.bb && CAM) { const dx = CAM.pos[0] - X, dz = CAM.pos[2] - Z, n = Math.hypot(dx, dz) || 1; o = { ...o, normal: [dx / n, 0, dz / n] }; } fxCard(out, key, draw, X, Y, Z, w, h, o); },
      ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); } }; };
  const H = Object.fromEntries(SETS.map((k) => [k, at(k)]));
  const lights = { day: { light: "day", sunAz: 200, sunEl: 50, fogFar: 4000 }, night: { light: "night", sunAz: 20, sunEl: 30, fogFar: 4000 }, golden: { light: "golden", sunAz: 160, sunEl: 35, fogFar: 4000 } };
  const LT = { town: "golden", hall: "golden", street: "day", bar: "golden", plaza: "day", dusk: "night", news: "day", press: "night", drama: "night", park: "day" };
  const room = (h, out, t, wallZ = -5) => { const anim = ["street", "bar", "plaza", "dusk", "press", "drama"].includes(h.k) ? Math.floor(t * 10) % 40 : 0;
    h.fx(out, "wall_" + h.k + anim, (p) => K.drawWall(p.g, h.k, anim / 10), 0, 7, wallZ, 14, 14, { cw: 1024, ch: 1024, kind: "basic", normal: [0, 0, 1] });
    h.fx(out, "floor_" + h.k, (p) => K.drawFloor(p.g, K.FLOOR[h.k], h.k), 0, 0, wallZ + 9, 30, 18, { cw: 512, ch: 512, kind: "basic", flat: true }); };
  const S1 = (o) => ({ ...lights[LT[o.set]], ...o });
  const mk = (h, out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); h.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic", bb: true }); };
  const wd = (h, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); h.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic", bb: true }); };
  const bd = (h, out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; h.fx(out, key + k, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic", bb: true }); };
  const lab = (h, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; h.fx(out, "lab" + s + k, (p) => DR.label(p, s, col), x, y, z, w * k, w / 3 * k, { cw: 768, ch: 256, kind: "basic", bb: true }); };
  const bub = (h, out, key, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; h.fx(out, key + s + k, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic", bb: true }); };
  const sparkle = (h, out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) h.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2, bb: true }); } };
  const sweat = (h, out, t, x, y, z, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1; h.fx(out, "sweat", (p) => DR.sweat(p), x + (i - 1) * 0.16 + ph * 0.05 * (i - 1), y - ph * 0.25, z, 0.08, 0.08, { cw: 128, ch: 128, kind: "basic" }); } };
  const hearts = (h, out, t, x, y, z, n = 4, s = 0.22) => { for (let i = 0; i < n; i++) { const ph = (t * 0.9 + i / n) % 1; h.fx(out, "heart", (p) => DR.heart(p), x + (hh(i, 3) - 0.5) * 0.9 + Math.sin(ph * 6 + i) * 0.08, y + ph * 0.8, z, s * Math.sin(ph * Math.PI) + 0.03, s * Math.sin(ph * Math.PI) + 0.03, { cw: 256, ch: 256, kind: "basic", bb: true }); } };
  const zzz = (h, out, t, x, y, z, s = 0.4) => { const k = Math.floor(t * 10) % 12; h.fx(out, "zzz" + k, (p) => DR.zzz(p, k), x, y, z, s, s, { cw: 256, ch: 256, kind: "basic", bb: true }); };
  const flashes = (h, out, t, pts, rate = 3) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; h.fx(out, "flash", (p) => K.drawFlash(p.g), x, y, z, 0.7 * k, 0.7 * k, { cw: 256, ch: 256, kind: "basic", bb: true }); } }); };
  const confetti = (out, c, t) => { const k = Math.floor(t * 12) % 24; screenCard(out, c, "conf" + k, (p) => DR.confetti(p, k), 0.5, 576, 1024, "basic"); };
  const cam = (h, p0, l0, p1, l1, fov = 46, dur = 1.8) => push(h.p(...p0), h.p(...l0), h.p(...p1), h.p(...l1), fov, dur);
  const who = (h, out, id, o, x, z, opt = {}, y = 0) => h.ppl(out, id, { ...o, xk: opt.xk || "" }, x, z, { keep: true, expr: opt.expr ?? "neutral", arms: opt.arms ?? { l: ["hips", 1], r: ["hips", 1] }, headTilt: opt.headTilt ?? 0, extra: opt.extra, view: opt.view, dir: opt.dir, mode: opt.mode ?? "stand", phase: opt.phase, scale: opt.s ?? 1 }, y);
  // Bosco card (768 x 512, feet at row 490): w wide, feet on yG
  const dog = (h, out, t, x, yG, z, w = 1.5, o = {}) => { const k = o.walk ? Math.floor(t * (o.rate ?? 10)) % 8 : -1;
    const st = { pose: o.pose ?? "stand", face: o.face ?? "happy", k, wag: o.wag === false ? 0 : Math.round(Math.sin(t * (o.wagRate ?? 14)) * 4) / 4, sash: !!o.sash, bronze: !!o.bronze, flip: !!o.flip, shades: !!o.shades, chinUp: !!o.chinUp, earFlap: o.earFlap ?? 0, kk: o.pose === "belly" ? Math.floor(t * 8) % 5 : 0 };
    const key = "dog" + Object.values(st).map((v) => (v === true ? 1 : v === false ? 0 : v)).join("_"), hgt = w * 2 / 3;
    h.fx(out, key, (p) => K.drawDog(p.g, st), x, yG + hgt * 0.457, z, w, hgt, { cw: 768, ch: 512, kind: "lit", rot: o.rot ?? 0, bb: o.bb ?? true }); };
  const box = (h, out, s, x, y, z, w = 1.4) => h.fx(out, "box" + s, (p) => DR.box(p, s), x, y, z, w, w / 2, { cw: 768, ch: 384, kind: "lit" });
  const podium = (h, out, s, x, z, w = 0.9, y0 = 0) => h.fx(out, "pod" + s, (p) => K.drawPodium(p.g, s), x, y0 + w * 1.25 / 2, z, w, w * 1.25, { cw: 512, ch: 640, kind: "lit" });
  const poster = (h, out, x, y, z, w = 0.9, a = "VOTE", b = "BOSCO") => h.fx(out, "poster" + a + b, (p) => K.drawPoster(p.g, a, b), x, y, z, w, w * 1.5, { cw: 512, ch: 768, kind: "lit" });
  const sign = (h, out, a, b, x, y, z, w = 1.4, col) => h.fx(out, "sign" + a + b + (col || ""), (p) => K.drawSign(p.g, a, b, col), x, y, z, w, w * 2 / 3, { cw: 768, ch: 512, kind: "lit" });
  const { news: NW, press: PR, drama: DM } = H;
  const crowd = (h, out, t, mood, pts, base0 = 10) => pts.forEach(([x, z], i) => { const o = FOLK(i + base0);
    const opt = mood === "laugh" ? { expr: "laugh", arms: { l: ["hips", 1], r: ["face", 1] }, headTilt: Math.sin(t * 12 + i) * 7 } : mood === "cheer" ? { expr: "grin", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 10 + i) * 6 }
      : mood === "bored" ? { expr: i % 2 ? "sleep" : "bored", arms: { l: ["hips", 1], r: ["face", 0.8] }, headTilt: 10 } : mood === "wave" ? { expr: "smile", arms: { l: ["hips", 1], r: ["up", 0.7 + 0.3 * Math.sin(t * 9 + i)] } } : { expr: "look_up", arms: { l: ["hips", 1], r: ["hips", 1] } };
    who(h, out, base0 + i, o, x, z, opt, mood === "cheer" ? Math.abs(Math.sin(t * 8 + i)) * 0.08 : 0); });

  // ================= SUNOL town (3D set in world.js) =================
  const TW = H.town;
  const day = (o = {}) => ({ light: "day", sunAz: 200, sunEl: 50, fogFar: 2500, ...o });
  const nite = (o = {}) => ({ light: "night", sunAz: 20, sunEl: 30, fogFar: 2500, ...o });
  const tc = (p0, l0, p1, l1, fov = 50, dur = 2.0, ks) => ks ? keys(ks.map((k) => ({ ...k, pos: TW.p(...k.pos), look: TW.p(...k.look) }))) : push(TW.p(...p0), TW.p(...l0), TW.p(...p1), TW.p(...l1), fov, dur);
  const SY = 0.95, BW = 0.17;   // stage top, boardwalk top
  const signs = (out) => { for (const [x, s, col] of [[-26.5, "GENERAL STORE", "#2a4a8a"], [-14, "BAR", "#c8202e"], [13, "POST OFFICE", "#1c3a8a"], [25.5, "SUNOL CAFE", "#2f7a48"]]) TW.fx(out, "shop" + s, (p) => DR.shop(p, s, col), x, 5.9, 3.08, Math.min(8, 1.1 * s.length + 1.6), 1.1, { cw: 1024, ch: 160, kind: "lit", normal: [0, 0, 1] }); };
  const stageDeco = (out, t) => { TW.fx(out, "banner", (p) => DR.banner(p, "ELECTION DAY"), 0, 3.4, -7.25, 6.4, 1.2, { cw: 1024, ch: 192, kind: "lit", normal: [0, 0, 1] });
    TW.fx(out, "bunt" + (Math.floor(t * 6) % 4), (p) => DR.bunting(p, Math.floor(t * 6) % 4), 0, 4.2, -1.9, 8.8, 0.9, { cw: 1024, ch: 128, kind: "lit", normal: [0, 0, 1] }); };
  const town = (out, t) => { signs(out); stageDeco(out, t); };
  const crowdT = (out, t, mood, pts, base0 = 20, y = 0.13) => pts.forEach(([x, z], i) => { const o = FOLK(i + base0);
    const opt = mood === "laugh" ? { expr: "laugh", arms: { l: ["hips", 1], r: ["face", 1] }, headTilt: Math.sin(t * 12 + i) * 7 } : mood === "cheer" ? { expr: "grin", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 10 + i) * 6 }
      : mood === "bored" ? { expr: i % 2 ? "sleep" : "bored", arms: { l: ["hips", 1], r: ["face", 0.8] }, headTilt: 10 } : mood === "wave" ? { expr: "smile", arms: { l: ["hips", 1], r: ["up", 0.7 + 0.3 * Math.sin(t * 9 + i)] } }
      : mood === "shock" ? { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] } } : { expr: "look_up", arms: { l: ["hips", 1], r: ["hips", 1] } };
    who(TW, out, base0 + i, o, x, z, { ...opt, dir: [0, -1] }, y + (mood === "cheer" ? Math.abs(Math.sin(t * 8 + i)) * 0.08 : 0)); });
  const crowdFront = (out, t, mood = "cheer") => crowdT(out, t, mood, [[-2.9, -0.6], [3.0, -0.4], [-3.6, 0.4], [3.7, 0.6]]);

  // ---- hero (shot 1 + loop): Main Street election stage, Bosco in his MAYOR sash, the two human candidates grab their heads, crowd cheers, confetti
  const heroCam = tc([1.6, 1.75, 2.2], [0, 1.75, -3.6], [-0.5, 1.6, 1.3], [0, 1.8, -3.6], 52, 2.4);
  const heroStage = (t, out, c) => { town(out, t);
    who(TW, out, 1, CAND(0), -1.1, -4.7, { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] }, headTilt: Math.sin(t * 7) * 5 }, SY);
    who(TW, out, 2, CAND(1), 1.1, -4.7, { expr: "gasp", arms: { l: ["head", 1], r: ["face", 1] }, headTilt: Math.sin(t * 6 + 1) * 5 }, SY);
    dog(TW, out, t, 0, SY, -3.0, 1.7, { face: "proud", sash: true, chinUp: true }); crowdFront(out, t, "cheer");
    if (c) confetti(out, c, t); sparkle(TW, out, t, 0.4, 2.0, -2.8, 0.25, 3); };
  // 1 A dog won an election…
  shot({ a: 0, ...day(), cam: heroCam, cInf: 0.8, focus: TW.p(0, 1.5, -3.0), shadowR: 15, stage(t, out, c) { heroStage(t, out, c); } });
  kick1(0.2); kick1(T("election"));
  // 2 …against two humans.: over the crowd's heads, push in on the two sweating candidates, "2 HUMANS"
  const t2 = S("against");
  shot({ at: t2, ...day(), cam: tc([0.3, 2.0, 2.6], [0, 2.4, -4.6], [0.1, 2.0, 0.6], [0, 2.45, -4.6], 46, 1.4), cInf: 1.0, focus: TW.p(0, 2.4, -4.6), shadowR: 12,
    stage(t, out) { town(out, t); who(TW, out, 1, CAND(0), -0.7, -4.6, { expr: "nervous", arms: { l: ["hips", 1], r: ["face", 1] } }, SY); who(TW, out, 2, CAND(1), 0.7, -4.6, { expr: "worried", arms: { l: ["face", 1], r: ["hips", 1] } }, SY);
      bd(TW, out, "b2h", "2", "HUMANS", "#1c3a8a", 0, 3.35, -4.3, (t - T("two")) * 3, 1.0); sweat(TW, out, t, -0.7, 2.85, -4.3); sweat(TW, out, t, 0.7, 2.85, -4.3); } });
  kick1(T("humans"));
  // 3 His name?: drone drops from above the street down to Bosco on the boardwalk
  const t3 = S("His name");
  shot({ at: t3, ...day(), cam: tc([-7, 8, 15], [-3, 0.4, 4.5], [-2.0, 0.8, 6.6], [-3, 0.55, 4.5], 50, 0.95), cInf: 0.9, focus: TW.p(-3, 0.5, 4.5), shadowR: 25,
    stage(t, out) { town(out, t); dog(TW, out, t, -3, BW, 4.5, 1.5, { face: "look_up" }); mk(TW, out, "?", -2.4, 1.3, 4.6, (t - t3 - 0.4) * 4, 0.45, "#ffd23a"); } });
  // 4 Bosco.: ground-level close-up, name plate pops, tail goes crazy
  const t4 = S("Bosco");
  shot({ at: t4, ...day(), cam: tc([-2.1, 0.45, 6.6], [-2.7, 0.75, 4.5], [-2.3, 0.5, 6.2], [-2.7, 0.75, 4.5], 48, 1.0), cInf: 1.3, focus: TW.p(-2.7, 0.6, 4.5), shadowR: 8,
    stage(t, out) { town(out, t); dog(TW, out, t, -3, BW, 4.5, 1.5, { face: "happy", wagRate: 22 }); lab(TW, out, "BOSCO", "#c8202e", -2.9, 1.45, 4.7, (t - T("Bosco")) * 3, 1.0); sparkle(TW, out, t, -2.8, 1.45, 4.8, 0.2, 3); } });
  kick1(T("Bosco"));
  // 5 Half Labrador,: side tracking shot, Bosco trots along the boardwalk, LABRADOR tag
  const t5 = S("Half Labrador");
  shot({ at: t5, ...day(), cam: (l) => ({ pos: TW.p(-6 + l * 1.6, 0.8, 8.0), look: TW.p(-6 + l * 1.6, 0.7, 4.5), fov: 48, roll: 0 }), cInf: 1.0, focus: TW.p(-6, 0.6, 4.5), shadowR: 10,
    stage(t, out) { town(out, t); const x = -6 + (t - t5) * 1.6; dog(TW, out, t, x, BW, 4.5, 1.5, { face: "happy", walk: true, rate: 12 }); lab(TW, out, "LABRADOR", "#2a8a4a", x - 0.4, 1.4, 4.6, (t - T("Labrador")) * 4, 1.0); } });
  // 6 half Rottweiler…: whip to the other side, shades on, ROTTWEILER tag
  const t6 = S("half Rottweiler");
  shot({ at: t6, ...day(), cam: (l) => ({ pos: TW.p(-3.5 + l * 1.6 + 1.2, 0.55, 7.6), look: TW.p(-3.5 + l * 1.6 + 0.4, 0.75, 4.5), fov: 46, roll: 0.03 }), cInf: 1.1, focus: TW.p(-3, 0.6, 4.5), shadowR: 10,
    stage(t, out) { town(out, t); const x = -4.6 + (t - t5) * 1.6; dog(TW, out, t, x, BW, 4.5, 1.5, { face: "cool", shades: true, walk: true, rate: 12, wag: false }); lab(TW, out, "ROTTWEILER", "#2a2a36", x + 0.3, 1.45, 4.6, (t - T("Rottweiler")) * 4, 1.1); } });
  kick1(T("Rottweiler"));
  // 7 …full politician.: low hero angle, a voter shakes his paw, flashbulbs
  const t7 = S("full politician");
  shot({ at: t7, ...day(), cam: tc([-0.4, 0.3, 7.6], [-0.9, 1.0, 4.5], [-0.1, 0.35, 7.0], [-0.9, 1.05, 4.5], 50, 1.2), cInf: 1.0, focus: TW.p(-1, 0.8, 4.5), shadowR: 10,
    stage(t, out) { town(out, t); dog(TW, out, t, -1.3, BW, 4.6, 1.5, { face: "proud", sash: true, chinUp: true }); who(TW, out, 10, FOLK(0), -0.1, 4.3, { expr: "grin", arms: { l: ["hips", 1], r: ["out", 0.6 + 0.2 * Math.sin(t * 12)] }, dir: [-1, 0] }, BW);
      flashes(TW, out, t, [[-2.4, 1.4, 5.2], [0.6, 1.9, 5.0], [-1.8, 0.6, 5.6]], 2.5); wd(TW, out, "POLITICIAN!", "#1c3a8a", -0.9, 2.15, 5.0, (t - T("politician")) * 3, 1.3); } });
  kick1(T("politician"));
  // 8 His town wanted an honorary mayor.: drone glides down Main Street, townsfolk gather at a MAYOR WANTED poster
  const t8 = S("His town");
  shot({ at: t8, ...day(), cam: tc([-30, 12, 26], [-8, 1.5, 3], [-12, 4.2, 15], [-9.5, 1.8, 3], 50, 2.4), cInf: 0.6, focus: TW.p(-9.5, 1.5, 3), shadowR: 30,
    stage(t, out) { town(out, t); TW.fx(out, "mw", (p) => K.drawSign(p.g, "MAYOR WANTED!", "HONORARY", "#c8202e"), -9.5, 2.1, 3.1, 2.1, 1.4, { cw: 768, ch: 512, kind: "lit", normal: [0, 0, 1] });
      crowdT(out, t, "look", [[-11, 4.4], [-10, 5.3], [-8.8, 4.6], [-7.8, 5.4], [-12.2, 5.2]], 10, BW); } });
  kick1(T("honorary"));
  // 9 Someone nominated Bosco…: over the shoulder of a townsman who points down at Bosco
  const t9 = S("Someone nominated");
  shot({ at: t9, ...day(), cam: tc([-12.8, 1.9, 8.0], [-9.4, 0.8, 4.4], [-12.4, 1.8, 7.5], [-9.4, 0.8, 4.4], 50, 1.6), cInf: 0.9, focus: TW.p(-9.2, 0.6, 4.4), shadowR: 10,
    stage(t, out) { town(out, t); TW.fx(out, "mw", (p) => K.drawSign(p.g, "MAYOR WANTED!", "HONORARY", "#c8202e"), -9.5, 2.1, 3.1, 2.1, 1.4, { cw: 768, ch: 512, kind: "lit", normal: [0, 0, 1] });
      who(TW, out, 11, FOLK(1), -10.9, 5.2, { expr: t > T("Bosco", t9) ? "grin" : "sly", arms: { l: ["hips", 1], r: ["point", 1] }, dir: [1, -0.5] }, BW); dog(TW, out, t, -9.0, BW, 4.4, 1.4, { face: t > T("Bosco", t9) ? "shock" : "look_up", flip: true });
      mk(TW, out, "!", -8.9, 1.5, 4.6, (t - T("Bosco", t9)) * 4, 0.5, "#ffd23a"); } });
  kick1(T("Bosco", t9));
  // 10 …as a joke.: orbit around the laughing townsfolk, HA HA!
  const t10 = S("as a joke");
  shot({ at: t10, ...day(), cam: (l) => { const a = 0.5 - l * 0.45; return { pos: TW.p(-9.8 + Math.sin(a) * 4.2, 1.55, 5.0 + Math.cos(a) * 4.2), look: TW.p(-9.8, 1.5, 5.0), fov: 48, roll: 0 }; }, cInf: 0.9, focus: TW.p(-9.8, 1.5, 5), shadowR: 12,
    stage(t, out) { town(out, t); crowdT(out, t, "laugh", [[-11, 4.6], [-9.8, 5.4], [-8.6, 4.6]], 11, BW); wd(TW, out, "HA HA!", "#c8202e", -9.8, 2.65, 5.0, (t - T("joke")) * 3, 1.2); } });
  kick1(T("joke"));
  // 11 Big mistake.: drama stinger, Bosco in shades
  const t11 = S("Big mistake");
  shot({ at: t11, ...S1({ set: "drama" }), cam: cam(DM, [0.4, 0.62, 2.3], [0.4, 0.6, 0], [0.4, 0.62, 1.6], [0.4, 0.6, 0], 44, 1.0), cInf: 1.2, focus: DM.p(0.4, 0.6, 0), shadowR: 6,
    stage(t, out) { room(DM, out, t); dog(DM, out, t, 0, 0, 0, 1.5, { face: "sly", shades: true, wag: false }); } });
  kick1(T("mistake"));
  // 12 For the humans.: low angle from the foot of the stage, the candidates sweat, tilt up
  const t12 = S("For the");
  shot({ at: t12, ...day(), cam: tc([0, 0.6, -0.4], [0, 1.9, -4.6], [0, 0.8, -0.8], [0, 2.4, -4.6], 52, 1.0), cInf: 1.1, focus: TW.p(0, 2.3, -4.6), shadowR: 10,
    stage(t, out) { town(out, t); who(TW, out, 1, CAND(0), -0.65, -4.6, { expr: "worried", arms: { l: ["hips", 1], r: ["hips", 1] }, headTilt: Math.sin(t * 20) * 3 }, SY); who(TW, out, 2, CAND(1), 0.65, -4.6, { expr: "nervous", arms: { l: ["face", 1], r: ["hips", 1] } }, SY);
      sweat(TW, out, t, -0.65, 2.85, -4.3); sweat(TW, out, t, 0.65, 2.85, -4.3); } });
  // 13 His campaign promise?: crane up from the crowd to Bosco at the podium on stage
  const t13 = S("His campaign");
  shot({ at: t13, ...day(), cam: tc([0.6, 1.1, 2.6], [0, 1.9, -3.4], [0.2, 2.2, 0.2], [0, 2.2, -3.4], 50, 1.6), cInf: 0.9, focus: TW.p(0, 1.6, -3.4), shadowR: 12,
    stage(t, out) { town(out, t); crowdFront(out, t, "look"); dog(TW, out, t, 0.05, SY + 0.8, -3.75, 1.8, { pose: "sit", face: "happy", sash: true }); podium(TW, out, "BOSCO", 0, -3.3, 0.9, SY);
      mk(TW, out, "?", 0.75, 2.95, -3.2, (t - T("promise")) * 4, 0.45, "#ffd23a"); } });
  kick1(T("promise"));
  // 14 A bone in every dish…: ground-level macro, a bone drops into his dish
  const t14 = S("A bone");
  shot({ at: t14, ...day(), cam: tc([1.6, 0.3, 6.6], [1.2, 0.35, 4.6], [1.45, 0.32, 6.2], [1.2, 0.35, 4.6], 46, 1.3), cInf: 1.4, focus: TW.p(1.2, 0.4, 4.6), shadowR: 6,
    stage(t, out) { town(out, t); dog(TW, out, t, 0.6, BW, 4.4, 1.4, { face: "love" }); const u = (t - T("bone")) * 3; TW.fx(out, "dish" + (u > 1), (p) => K.drawDish(p.g, u > 1), 1.55, BW + 0.2, 4.8, 0.55, 0.41, { cw: 512, ch: 384, kind: "lit", bb: true });
      if (u > 0 && u <= 1) TW.fx(out, "bonefly", (p) => K.drawBone(p.g, 0), 1.55, BW + 0.9 - u * 0.6, 4.85, 0.36, 0.18, { cw: 512, ch: 256, kind: "lit", rot: t * 9, bb: true }); mk(TW, out, "YUM", 1.85, 0.9, 4.9, u - 1, 0.32, "#7ad04a"); } });
  // 15 a cat in every tree…: under the big oak, tilt up from Bosco to the cat on the branch
  const t15 = S("a cat");
  shot({ at: t15, ...day(), cam: tc([-70.0, 0.6, 5.6], [-71.2, 0.8, 0.4], [-70.2, 1.3, 5.8], [-71.2, 2.6, 0.2], 50, 1.4), cInf: 0.8, focus: TW.p(-72, 2.5, -1.2), shadowR: 15,
    stage(t, out) { town(out, t); dog(TW, out, t, -71.4, 0.1, 0.8, 1.4, { face: "look_up", wagRate: 18 }); TW.fx(out, "cat" + (Math.floor(t * 8) % 8), (p) => K.drawCatOnly(p.g, (Math.floor(t * 8) % 8) / 8), -71.0, 2.9, 0.5, 1.2, 0.9, { cw: 512, ch: 384, kind: "lit", bb: true });
      mk(TW, out, "!", -70.4, 3.6, 0.6, (t - T("cat")) * 4, 0.5, "#ffd23a"); } });
  // 16 and a fire hydrant on every corner.: slow dolly round the 3D hydrant, Bosco in love
  const t16 = S("and a fire");
  shot({ at: t16, ...day(), cam: (l) => { const a = -0.55 + l * 0.3; return { pos: TW.p(9 + Math.sin(a) * 2.6, 0.7, 5.4 + Math.cos(a) * 2.6), look: TW.p(8.7, 0.65, 5.2), fov: 48, roll: 0 }; }, cInf: 1.1, focus: TW.p(9, 0.6, 5.4), shadowR: 8,
    stage(t, out) { town(out, t); sparkle(TW, out, t, 9, 1.05, 5.6, 0.22, 4); dog(TW, out, t, 7.9, BW, 4.9, 1.3, { face: "love", wagRate: 22 }); hearts(TW, out, t, 8.2, 1.0, 5.1, 4, 0.2); } });
  kick1(T("hydrant"));
  // 17 The humans had speeches.: behind the bored crowd, the candidate drones at the podium
  const t17 = S("The humans had");
  shot({ at: t17, ...day(), cam: tc([1.2, 1.7, 4.2], [0, 2.1, -4.0], [0.5, 1.7, 3.0], [0, 2.1, -4.0], 50, 2.2), cInf: 0.8, focus: TW.p(0, 2.1, -4), shadowR: 12,
    stage(t, out) { town(out, t); who(TW, out, 1, CAND(0), 0, -4.2, { expr: ["talk_o", "talk_e", "talk_m"][Math.floor(t * 8) % 3], arms: { l: ["hips", 1], r: ["point", 0.8] } }, SY); podium(TW, out, "VOTE ME", 0, -3.4, 0.85, SY);
      crowdT(out, t, "bored", [[-1.2, 0.6], [1.1, 0.8], [-0.1, 1.6]], 12); zzz(TW, out, t, -0.9, 2.3, 0.9, 0.45); zzz(TW, out, t + 0.5, 1.4, 2.3, 1.1, 0.45); bub(TW, out, "bsp", "BLAH BLAH", "#2a2a36", 1.0, 3.4, -4.0, (t - T("speeches")) * 3, 1.1); } });
  // 18 Bosco had a tail.: low behind Bosco on stage, his tail wagging like crazy, the crowd wakes and cheers
  const t18 = S("Bosco had");
  shot({ at: t18, ...day(), cam: tc([-1.2, 1.25, -0.6], [0.2, 1.4, -3.2], [-0.9, 1.2, -1.0], [0.2, 1.4, -3.2], 50, 1.4), cInf: 1.0, focus: TW.p(0, 1.3, -3), shadowR: 10,
    stage(t, out) { town(out, t); dog(TW, out, t, 0.1, SY, -3.2, 1.6, { face: "happy", wagRate: 30 }); hearts(TW, out, t, -0.3, 1.9, -3.0, 5, 0.24); crowdT(out, t, "cheer", [[-2.5, -5.6], [2.4, -5.6]], 12, SY);
      wd(TW, out, "WAG WAG!", "#c8202e", -0.7, 2.2, -2.8, (t - T("tail")) * 3, 0.9); } });
  kick1(T("tail"));
  // 19 Bosco wins.: the tally board shoots up on stage, push in
  const t19 = S("Bosco wins");
  shot({ at: t19, ...day(), cam: tc([0, 2.2, 0.8], [0, 2.3, -4.2], [0, 2.25, -0.6], [0, 2.3, -4.2], 48, 1.3), cInf: 1.0, focus: TW.p(0, 2.3, -4.2), shadowR: 10,
    stage(t, out) { town(out, t); const n = Math.round(smooth((t - t19) / 0.8) * 10) / 10; TW.fx(out, "tally" + n, (p) => K.drawTally(p.g, n), 0, 2.4, -4.4, 2.0, 1.5, { cw: 1024, ch: 768, kind: "lit", normal: [0, 0, 1] });
      wd(TW, out, "WINNER!", "#2f7a48", 0.5, 3.35, -4.0, (t - T("wins")) * 3, 1.1); } });
  kick1(T("wins"));
  // 20 The humans lose… to a dog.: the candidates slump, then Bosco pops up in front of the lens
  const t20 = S("The humans lose");
  shot({ at: t20, ...day(), cam: tc([0, 2.1, -0.4], [0, 2.1, -4.6], [0, 2.0, -1.2], [0, 2.05, -4.6], 48, 1.8), cInf: 1.0, focus: TW.p(0, 2.1, -4.6), shadowR: 10,
    stage(t, out) { town(out, t); who(TW, out, 1, CAND(0), -0.65, -4.6, { expr: "sad", arms: { l: ["low", 1], r: ["low", 1] }, headTilt: 12 }, SY); who(TW, out, 2, CAND(1), 0.65, -4.6, { expr: t > T("dog", t20) ? "shock" : "sad", arms: { l: ["head", 1], r: ["head", 1] } }, SY);
      mk(TW, out, "LOSE", 0, 3.45, -4.3, (t - T("lose")) * 4, 0.6, "#c8202e"); if (t > T("dog", t20)) dog(TW, out, t, 0.25, SY, -3.2, 1.3, { face: "happy", sash: true }); } });
  kick1(T("dog", t20));
  // 21 Mayor Bosco gets straight to work.: he hops down the stage steps toward the camera
  const t21 = S("Mayor Bosco");
  shot({ at: t21, ...day(), cam: tc([1.4, 0.5, 2.4], [0, 0.8, -1.6], [1.0, 0.45, 2.9], [0, 0.6, 0.2], 50, 1.8), cInf: 1.0, focus: TW.p(0, 0.6, -0.5), shadowR: 10,
    stage(t, out) { town(out, t); const u = clamp01((t - t21) / 1.8); dog(TW, out, t, 0, lerp(SY, 0.13, smooth(u * 1.6)), lerp(-2.4, 0.6, u), 1.5, { face: "proud", sash: true, walk: true, rate: 12 }); wd(TW, out, "TO WORK!", "#1c3a8a", 0.4, 1.6, 0.6, (t - T("work")) * 3, 0.9); } });
  kick1(T("work"));
  // 22 Patrolling Main Street.: high drone tracking shot following him down the boardwalk
  const t22 = S("Patrolling");
  shot({ at: t22, ...day(), cam: (l) => ({ pos: TW.p(-18.5 + l * 2.4, 3.4 - l * 1.0, 9.6), look: TW.p(-11 + l * 2.4, 0.6, 4.6), fov: 48, roll: 0 }), cInf: 0.8, focus: TW.p(-13, 0.5, 4.5), shadowR: 20,
    stage(t, out) { town(out, t); dog(TW, out, t, -13 + (t - t22) * 2.4, BW, 4.5, 1.5, { face: "proud", sash: true, walk: true, rate: 13, chinUp: true }); } });
  // 23 Greeting voters.: tracking alongside, shopkeepers wave from their doors
  const t23 = S("Greeting");
  shot({ at: t23, ...day(), cam: (l) => ({ pos: TW.p(-6.6 + l * 2.0, 1.1, 8.0), look: TW.p(-10.4 + l * 2.0, 0.95, 4.2), fov: 50, roll: 0 }), cInf: 0.9, focus: TW.p(-10, 0.9, 4.3), shadowR: 12,
    stage(t, out) { town(out, t); dog(TW, out, t, -10.6 + (t - t23) * 2.0, BW, 4.6, 1.4, { face: "happy", sash: true, walk: true, rate: 12 }); crowdT(out, t, "wave", [[-9.2, 3.7], [-7.6, 3.6], [-11.8, 3.6]], 14, BW); hearts(TW, out, t, -8.4, 2.0, 3.9, 3, 0.22); } });
  // 24 Hanging out in front of the bar.: low slide past the BAR, Bosco sprawled in the shade in shades
  const t24 = S("Hanging out");
  shot({ at: t24, ...day(), cam: tc([-10.0, 0.6, 7.6], [-14.2, 0.7, 4.0], [-10.8, 0.6, 7.0], [-14.2, 0.75, 4.0], 50, 1.6), cInf: 0.9, focus: TW.p(-14, 0.5, 4.4), shadowR: 10,
    stage(t, out) { town(out, t); dog(TW, out, t, -14, BW, 4.3, 1.5, { pose: "lie", face: "cool", shades: true, sash: true, wagRate: 6 }); mk(TW, out, "CHILL", -13.2, 1.35, 4.6, (t - T("bar")) * 4, 0.6, "#ffd23a"); } });
  kick1(T("bar"));
  // 25 Bribes?: a sneaky guy crouches with a gold coin
  const t25 = S("Bribes");
  shot({ at: t25, ...day(), cam: tc([-11.2, 1.2, 7.0], [-13.7, 1.0, 4.3], [-11.4, 1.15, 6.7], [-13.7, 1.0, 4.3], 48, 0.6), cInf: 1.0, focus: TW.p(-13.6, 1.0, 4.3), shadowR: 8,
    stage(t, out) { town(out, t); who(TW, out, 15, FOLK(5), -12.9, 4.3, { expr: "sly", arms: { l: ["hips", 1], r: ["out", 1] }, dir: [-1, 0] }, BW); TW.fx(out, "coin", (p) => K.drawCoin(p.g), -13.45, 1.35, 4.5, 0.26, 0.26, { cw: 256, ch: 256, kind: "lit", rot: Math.sin(t * 10) * 0.3, bb: true });
      dog(TW, out, t, -14.3, BW, 4.3, 1.3, { pose: "sit", face: "bored", sash: true, wag: false }); mk(TW, out, "?", -14.0, 1.45, 4.5, (t - t25) * 4, 0.35, "#ffd23a"); } });
  // 26 Only belly rubs.: straight down from above, Bosco on his back on the boardwalk, a hand rubs his belly
  const t26 = S("Only belly");
  shot({ at: t26, ...day(), cam: tc([-14, 3.0, 5.4], [-14, 0.17, 4.5], [-14, 2.4, 5.2], [-14, 0.17, 4.5], 46, 1.4), cInf: 1.0, focus: TW.p(-14, 0.2, 4.5), shadowR: 8,
    stage(t, out) { town(out, t); TW.fx(out, "dogflat" + (Math.floor(t * 20) % 4), (p) => K.drawDog(p.g, { pose: "belly", face: "love", wag: [-1, 0, 1, 0][Math.floor(t * 20) % 4], kk: Math.floor(t * 8) % 5 }), -14, BW + 0.02, 4.5, 1.5, 1.0, { cw: 768, ch: 512, kind: "lit", flat: true, rot: 0 });
      TW.fx(out, "handflat", (p) => DR.hand(p), -14.05 + Math.sin(t * 12) * 0.14, BW + 0.05, 4.45, 0.6, 0.4, { cw: 384, ch: 256, kind: "lit", flat: true, rot: -0.4 });
      hearts(TW, out, t, -13.6, 0.4, 4.7, 5, 0.18); wd(TW, out, "RUB RUB", "#d0408a", -14, 0.6, 4.1, (t - T("rubs")) * 3, 0.8); } });
  // 27 Wait, it gets weirder.: drama, Bosco's ears fly up
  const t27 = S("Wait it");
  shot({ at: t27, ...S1({ set: "drama" }), cam: cam(DM, [0.4, 0.62, 2.6], [0.4, 0.6, 0], [0.4, 0.62, 1.6], [0.4, 0.6, 0], 46, 1.3), cInf: 1.2, focus: DM.p(0.4, 0.6, 0), shadowR: 6,
    stage(t, out) { room(DM, out, t); dog(DM, out, t, 0, 0, 0, 1.5, { face: "shock", earFlap: t > T("weirder") ? 1 : 0, wag: false }); mk(DM, out, "!?", 0.85, 1.1, 0.2, (t - T("weirder")) * 4, 0.45, "#ffd23a"); } });
  kick1(T("weirder"));
  // 28 China's official newspaper finds out…: the presses roll, papers fly past the lens
  const t28 = S("China's official");
  shot({ at: t28, ...S1({ set: "press" }), cam: cam(PR, [0.8, 1.6, 3.6], [0, 1.3, 0], [-0.2, 1.35, 2.5], [0, 1.3, 0], 50, 1.8), cInf: 0.9, focus: PR.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(PR, out, t); for (let i = 0; i < 6; i++) { const ph = (t * 0.9 + i / 6) % 1; PR.fx(out, "newsA", (p) => K.drawNews(p.g, { h1: "NEWS" }), -1.2 + (i % 3) * 1.2 + Math.sin(ph * 6 + i) * 0.2, 0.2 + ph * 2.8, -0.6 + (i % 2) * 1.2, 0.6, 0.8, { cw: 768, ch: 1024, kind: "lit", rot: Math.sin(t * 3 + i) * 0.6 }); }
      PR.fx(out, "newsE", (p) => K.drawNews(p.g, {}), 0, 1.35, 0.3, 1.1, 1.47, { cw: 768, ch: 1024, kind: "lit", rot: Math.sin(t * 2) * 0.05 }); mk(PR, out, "!", 0.65, 2.15, 0.4, (t - T("finds")) * 4, 0.4, "#ffd23a"); } });
  kick1(T("finds"));
  // 29 and writes an editorial about him.: macro slide across the clattering typewriter
  const t29 = S("and writes");
  shot({ at: t29, ...S1({ set: "news" }), cam: cam(NW, [-0.5, 1.15, 1.6], [0, 1.0, 0], [0.4, 1.25, 1.7], [0, 1.0, 0], 46, 2.6), cInf: 1.1, focus: NW.p(0, 1.0, 0), shadowR: 6,
    stage(t, out) { room(NW, out, t); const k = Math.floor(t * 14) % 16, nl = 1 + (Math.floor((t - t29) * 2) % 6); NW.fx(out, "tw" + k + "_" + nl, (p) => K.drawTypewriter(p.g, k, nl), 0, 1.0, 0, 1.2, 1.2, { cw: 768, ch: 768, kind: "lit" });
      mk(NW, out, "CLACK", -0.5, 1.6, 0.2, (t - T("writes")) * 4, 0.4, "#ffd23a"); } });
  // 30 Proof, it says,: the newspaper spins into frame
  const t30 = S("Proof");
  shot({ at: t30, ...S1({ set: "news" }), cam: cam(NW, [0, 1.3, 2.6], [0, 1.3, 0], [0, 1.3, 2.2], [0, 1.3, 0], 46, 2.4), cInf: 1.1, focus: NW.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(NW, out, t); const u = Math.round(smooth((t - t30) / 0.6) * 12) / 12; NW.fx(out, "newsD", (p) => K.drawNews(p.g, { h1: "U.S. DEMOCRACY", h2: "GONE TO THE DOGS?" }), 0, 1.3, 0.2, 1.0 * (0.2 + 0.8 * u), 1.33 * (0.2 + 0.8 * u), { cw: 768, ch: 1024, kind: "lit", rot: (1 - u) * 6 }); } });
  kick1(t30 + 0.5);
  // 31 …gone to the dogs.: close on the headline + WOOF!
  const t31 = S("gone to");
  shot({ at: t31, ...S1({ set: "news" }), cam: cam(NW, [0, 1.5, 2.0], [0, 1.5, 0], [0, 1.5, 1.7], [0, 1.5, 0], 44, 1.0), cInf: 1.2, focus: NW.p(0, 1.6, 0.2), shadowR: 6,
    stage(t, out) { room(NW, out, t); NW.fx(out, "newsD", (p) => K.drawNews(p.g, { h1: "U.S. DEMOCRACY", h2: "GONE TO THE DOGS?" }), 0, 1.3, 0.2, 1.0, 1.33, { cw: 768, ch: 1024, kind: "lit" }); wd(NW, out, "WOOF!", "#c8202e", 0.25, 1.45, 0.4, (t - T("dogs")) * 3, 0.6); } });
  kick1(T("dogs"));
  // 32 Bosco?: back on Main Street, the paper lands next to him
  const t32 = S("Bosco Totally");
  shot({ at: t32, ...day(), cam: tc([-11.6, 0.75, 6.6], [-14.0, 0.7, 4.3], [-11.9, 0.7, 6.3], [-14.0, 0.7, 4.3], 48, 1.0), cInf: 1.0, focus: TW.p(-14, 0.6, 4.3), shadowR: 8,
    stage(t, out) { town(out, t); dog(TW, out, t, -14.4, BW, 4.3, 1.4, { pose: "sit", face: "neutral", sash: true, wag: false }); const u = smooth((t - t32) / 0.4);
      TW.fx(out, "newsD", (p) => K.drawNews(p.g, { h1: "U.S. DEMOCRACY", h2: "GONE TO THE DOGS?" }), -13.4, lerp(1.6, 0.55, u), 4.5, 0.6, 0.8, { cw: 768, ch: 1024, kind: "lit", rot: -0.2 - (1 - u) * 2, bb: true }); mk(TW, out, "?", -14.1, 1.4, 4.5, (t - t32 - 0.3) * 4, 0.35, "#ffd23a"); } });
  // 33 Totally unfazed.: he flops down for a nap, camera drifts low along the boardwalk
  const t33 = S("Totally");
  shot({ at: t33, ...day(), cam: tc([-11.0, 0.45, 6.0], [-14, 0.4, 4.3], [-11.6, 0.42, 6.4], [-14, 0.4, 4.3], 48, 1.4), cInf: 1.0, focus: TW.p(-14, 0.4, 4.3), shadowR: 8,
    stage(t, out) { town(out, t); dog(TW, out, t, -14, BW, 4.3, 1.5, { pose: "lie", face: "sleep", sash: true, wagRate: 4 }); zzz(TW, out, t, -13.2, 0.95, 4.5, 0.45); mk(TW, out, "MEH", -14.6, 1.0, 4.5, (t - T("unfazed")) * 4, 0.45, "#ffd23a"); } });
  // 34 He stays mayor for thirteen years…: time-lapse orbit, the calendar races 1981 -> 1994
  const t34 = S("He stays");
  shot({ at: t34, ...day({ sunAz: 150 }), cam: (l) => { const a = 0.7 - l * 0.35; return { pos: TW.p(-14 + Math.sin(a) * 4.0, 1.3, 4.6 + Math.cos(a) * 4.0), look: TW.p(-14, 1.0, 4.5), fov: 50, roll: 0 }; }, cInf: 0.9, focus: TW.p(-14, 1, 4.5), shadowR: 12,
    stage(t, out) { town(out, t); const yr = 1981 + Math.round(13 * smooth((t - t34) / 1.5)); TW.fx(out, "cal" + yr, (p) => K.drawCal(p.g, yr), -13.1, 1.6, 4.4, 0.8, 1.0, { cw: 512, ch: 640, kind: "lit", bb: true });
      dog(TW, out, t, -14.5, BW, 4.7, 1.4, { face: "proud", sash: true, chinUp: true }); bd(TW, out, "b13", "13", "YEARS", "#c8202e", -14.7, 1.6, 4.9, (t - T("thirteen")) * 3, 0.8); } });
  kick1(T("thirteen"));
  // 35 …until the day he dies.: Main Street at night, his sash on an empty cushion, crane up to the stars (no death shown)
  const t35 = S("until the");
  shot({ at: t35, ...nite(), cam: tc([-11.8, 0.7, 6.8], [-14, 0.4, 4.4], [-12.4, 1.3, 6.8], [-14, 0.6, 4.0], 50, 2.0), cInf: 0.9, focus: TW.p(-14, 0.4, 4.4), shadowR: 10,
    stage(t, out) { town(out, t); TW.fx(out, "cush", (p) => K.drawCushion(p.g), -14, BW + 0.25, 4.4, 1.2, 0.6, { cw: 768, ch: 384, kind: "lit", bb: true }); lab(TW, out, "MAYOR", "#c8202e", -14, BW + 0.45, 4.45, 1, 0.6); sparkle(TW, out, t, -14, 1.2, 4.5, 0.18, 3); } });
  // 36 Today, he has his own bronze statue.: orbit the bronze Bosco on his plinth outside the post office, photos
  const t36 = S("Today he");
  shot({ at: t36, ...day(), cam: (l) => { const a = 0.6 - l * 0.32; return { pos: TW.p(13 + Math.sin(a) * 3.4, 1.4, 4.6 + Math.cos(a) * 3.4), look: TW.p(13, 1.45, 4.6), fov: 50, roll: 0 }; }, cInf: 0.8, focus: TW.p(13, 1.4, 4.6), shadowR: 12,
    stage(t, out) { town(out, t); dog(TW, out, t, 13, 1.05, 4.6, 1.3, { face: "proud", bronze: true, chinUp: true, wag: false }); TW.fx(out, "plq", (p) => DR.label(p, "BOSCO", "#9a6a34"), 13, 0.6, 5.32, 0.9, 0.3, { cw: 768, ch: 256, kind: "lit", normal: [0, 0, 1] });
      sparkle(TW, out, t, 13.2, 2.0, 4.7, 0.25, 4); crowdT(out, t, "wave", [[11.0, 6.8], [15.0, 6.9]], 16, 0.14); flashes(TW, out, t, [[11.4, 1.6, 6.4], [14.6, 1.6, 6.5]], 2); } });
  kick1(T("bronze"));
  // 37 Because once upon a time…: loop: shot 1's view, played backwards into frame 0
  const tL = S("Because once");
  shot({ at: tL, ...day(), cam: heroCam, cInf: 0.8, focus: TW.p(0, 1.5, -3.0), shadowR: 15, loop: true, stage(t, out, c) { heroStage(t, out, c); } });
  SHOTS = D.map((s, i) => ({ ...s, a: s.a ?? s.at, b: i + 1 < D.length ? (D[i + 1].a ?? D[i + 1].at) : END + 0.01 }));
  SHOTS.forEach((s, i) => { const base = s.cam, ph = (s.loop ? 0 : (s.at ?? s.a ?? 0)) * 1.7, w = 0.004, dur = s.b - s.a; s.cam = (l0, ...r) => { const l = s.loop ? Math.max(0, dur - l0 - 1 / FPS) : l0, c = base(l, ...r);
    return { ...c, pos: [c.pos[0] + w * Math.sin(l * 1.1 + ph), c.pos[1] + w * 0.7 * Math.sin(l * 1.6 + ph * 2), c.pos[2] + w * Math.sin(l * 0.9 + ph * 3)] }; }; });
  SHOTS.forEach((s, i) => { s.id = i + 1; const c = s.cam(0.3); const fx2 = c.look[0] - c.pos[0], fz2 = c.look[2] - c.pos[2], n = Math.hypot(fx2, fz2) || 1; s.fwd = [fx2 / n, fz2 / n]; });
}

export const shotAt = (t) => SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];
export function frameState(f) {
  const thumb = f < 0; if (thumb && !THUMB) THUMB = thumbShot();
  const t = thumb ? 2.9 : f / FPS, s = thumb ? THUMB : shotAt(t), local = t - s.a, c = s.cam(local);
  const k = s.kicks && s.kicks.length ? kick(t, s.kicks) : 0;
  if (k) { c.look = [c.look[0] + k * 8, c.look[1] - k * 6, c.look[2]]; c.roll = (c.roll ?? 0) + k; }
  const out = { places: [], fx: [], veh: [], props: { ...(s.props || {}) } };
  CAM = c; if (s.stage) s.stage(t, out, c);
  out.places = out.places.filter((pl) => Math.hypot(pl.x - c.pos[0], pl.z - c.pos[2]) > 0.6 || pl.keep);
  return {
    f, t, shot: s.id, light: s.light, grade: s.grade, cam: c, focus: s.focus, cInf: s.cInf ?? 0, props: out.props, veh: out.veh,
    sunK: s.sunK, sunAz: s.sunAz, sunEl: s.sunEl, fwd: s.fwd, fogNear: s.fogNear, fogFar: s.fogFar, shadowR: s.shadowR, near: s.near,
    places: out.places, fx: out.fx, flash: s.flash ? s.flash(t) : 0, fade: 0,
  };
}
