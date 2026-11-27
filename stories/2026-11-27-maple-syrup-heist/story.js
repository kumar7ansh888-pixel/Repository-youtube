// Shot plan for "A Gang Stole $18 Million of Maple Syrup" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts (SCRIPT.md sources): the Federation of Quebec Maple Syrup Producers (a legal cartel, ~3/4 of world supply) keeps a strategic reserve in a
// warehouse of white steel drums; in 2011-12 a gang trucked drums to a sugar shack, siphoned the syrup, refilled them with water and returned them,
// selling the syrup bit by bit (New Brunswick, Vermont); at the July 2012 inventory an inspector climbed the stack, a drum nearly tipped, it was empty;
// ~2,700-3,000 tonnes worth ~$18 million gone; the ringleader got 8 years + a $9.4M fine (Wikipedia, Mental Floss, Canadian Encyclopedia, TIME).
// Every main location is a real 3D set (SYRUP in world.js), moving camera in every shot. Hook-first, cut every ~1.6 s, loop ending.
import * as K from "./draw_syrup.js";
import { SYRUP } from "./world.js";
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

const THIEF = (v) => ({ jacket: ["#2a2a32", "#3a2e2a", "#24303a"][v % 3], pants: "#1e1e24", boots: INK, hat: "cap", cap: ["#1a1a1e", "#2a1a1a", "#1a2230"][v % 3], hair: "#3a2a1a", moustache: v === 0 ? "#3a2a1a" : undefined, skin: ["#f2d2b6", "#e8b894", "#ecd0b6"][v % 3], build: v === 0 ? "stout" : "adult" });
const SUIT = (v) => ({ jacket: "#3a4a6a", pants: "#2a3448", boots: INK, hat: "hair", hair: ["#d8d8dc", "#3a2a1a", "#8a5a32"][v % 3], moustache: v === 1 ? "#3a2a1a" : undefined, skin: ["#f2d2b6", "#e8b894", "#f4d6bc"][v % 3], build: v === 0 ? "stout" : "adult" });
const INSP = { jacket: "#ff8a2a", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#ffd23a", hair: "#5a4030", moustache: "#5a4030", skin: "#f2d2b6", build: "adult" };
const COP = { jacket: "#1f2a4a", pants: "#1f2a4a", boots: INK, hat: "cap", cap: "#1f2a4a", hair: "#c8a060", skin: "#f2d2b6", build: "adult" };
const CON = { jacket: "#ff7a1a", pants: "#ff7a1a", boots: INK, hat: "cap", cap: "#1a1a1e", hair: "#3a2a1a", moustache: "#3a2a1a", skin: "#f2d2b6", build: "stout" };
const FOLK = (v) => ({ jacket: ["#c8503a", "#6a9a4a", "#e8b83a", "#8a5ab0", "#3a7ac8", "#d0708a"][v % 6], pants: ["#3a3a48", "#5a4a3a", "#2a4a6a"][v % 3], boots: INK, hat: "hair", hair: ["#c89a4a", "#2a201a", "#8a5a32", "#3a2a1a", "#e8d08a", "#6a3a1a"][v % 6], skin: ["#f2d2b6", "#e8b894", "#ecd0b6", "#c99067", "#f4d6bc", "#a8704a"][v % 6], build: "adult" });
const LUMBER = { jacket: "#c8202e", pants: "#3a4a6a", boots: INK, hat: "cap", cap: "#c8202e", hair: "#8a5a32", moustache: "#8a5a32", skin: "#f2d2b6", build: "stout" };

// rig extras (rig canvas: head centre x 300, y = hands.hc)
const XL = {
  mask: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + H.Ha * 0.06, w = H.Ha * 1.05; g.beginPath(); g.roundRect(300 - w, y - H.Ha * 0.2, 2 * w, H.Ha * 0.4, H.Ha * 0.18); g.fillStyle = "#121216"; g.fill();
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(300 + s * w * 0.42, y, H.Ha * 0.16, H.Ha * 0.12, 0, 0, Math.PI * 2); g.fillStyle = "#ffffff"; g.fill(); g.beginPath(); g.arc(300 + s * w * 0.42, y, H.Ha * 0.06, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); } },
  shades: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + H.Ha * 0.06, w = H.Ha * 0.95; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(300 + s * w * 0.45 - H.Ha * 0.36, y - H.Ha * 0.17, H.Ha * 0.72, H.Ha * 0.36, H.Ha * 0.12); g.fillStyle = "#0c0c10"; g.fill(); }
    g.fillRect(300 - w * 0.2, y - H.Ha * 0.08, w * 0.4, H.Ha * 0.08); },
  hold: (draw, cw, ch, side = "r", s = 1, dx = 0, dy = 0) => (p) => { const H = p.hands; if (!H || !H[side]) return; const c = document.createElement("canvas"); c.width = cw; c.height = ch; draw(c.getContext("2d")); const w = 150 * s, h = w * ch / cw; p.g.drawImage(c, H[side][0] - w / 2 + dx, H[side][1] - h / 2 + dy, w, h); },
  drip: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, [x, y] = H.r; g.beginPath(); g.ellipse(x, y - 20, 20, 26, 0, 0, Math.PI * 2); g.fillStyle = "#d8841a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); },
  hose: (k) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, [x, y] = H.r; const pts = [[x + 10, y - 20], [x + 140, y - 120], [x + 210, y + 40], [x + 260, y + 420]]; g.lineCap = "round";
    g.beginPath(); g.moveTo(...pts[0]); g.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]); g.strokeStyle = INK; g.lineWidth = 34; g.stroke(); g.strokeStyle = "#3a9a4a"; g.lineWidth = 22; g.stroke();
    for (let i = 0; i < 9; i++) { const u = ((i / 9 + k) % 1); g.beginPath(); g.arc(x + 10 - u * 6 + Math.sin(u * 3) * 4, y - 20 + u * 260, 9 + u * 6, 0, Math.PI * 2); g.fillStyle = "#7ac8ff"; g.fill(); } },
  fork: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, [x, y] = H.r; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y + 20); g.lineTo(x, y - 90); g.strokeStyle = INK; g.lineWidth = 16; g.stroke(); g.strokeStyle = "#c8ccd4"; g.lineWidth = 9; g.stroke();
    for (const dx of [-12, 0, 12]) { g.beginPath(); g.moveTo(x + dx, y - 90); g.lineTo(x + dx, y - 130); g.strokeStyle = "#c8ccd4"; g.lineWidth = 6; g.stroke(); } g.beginPath(); g.ellipse(x, y - 140, 34, 14, 0, 0, Math.PI * 2); g.fillStyle = "#f4c070"; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); },
};

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const at = (B) => { const Af = (x, y, z) => [B[0] + x, B[1] + y, B[2] + z];
    return { p: Af,
      fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); if (o.bb && CAM) { const dx = CAM.pos[0] - X, dz = CAM.pos[2] - Z, n = Math.hypot(dx, dz) || 1; o = { ...o, normal: [dx / n, 0, dz / n] }; } fxCard(out, key, draw, X, Y, Z, w, h, o); },
      ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); } }; };
  const A = at(SYRUP);
  const G = 0.14, TOP = 0.14 + 3 * 0.98;   // yard / warehouse floor, top of the barrel blocks
  const SH = [-70, 0, -14], TB = [-70, 0.76, -6.1], CELL = [60, 0, -14];
  const day = (o = {}) => ({ light: "day", sunAz: 200, sunEl: 50, fogFar: 2500, ...o });
  const gold = (o = {}) => ({ light: "golden", sunAz: 160, sunEl: 30, fogFar: 2500, ...o });
  const nite = (o = {}) => ({ light: "night", sunAz: 20, sunEl: 30, fogFar: 2500, ...o });
  const tc = (p0, l0, p1, l1, fov = 50, dur = 2.0) => push(A.p(...p0), A.p(...l0), A.p(...p1), A.p(...l1), fov, dur);
  const lin = (p0, v, l0, fov = 50, vl = v) => (l) => ({ pos: A.p(p0[0] + v[0] * l, p0[1] + v[1] * l, p0[2] + v[2] * l), look: A.p(l0[0] + vl[0] * l, l0[1] + vl[1] * l, l0[2] + vl[2] * l), fov, roll: 0 });
  const orbit = (c, r, y, a0, da, ly, fov = 50) => (l) => { const a = a0 + da * l; return { pos: A.p(c[0] + Math.sin(a) * r, y, c[2] + Math.cos(a) * r), look: A.p(c[0], ly, c[2]), fov, roll: 0 }; };
  const mk = (out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); A.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic", bb: true }); };
  const wd = (out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); A.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic", bb: true }); };
  const bd = (out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; A.fx(out, key + k, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic", bb: true }); };
  const lab = (out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; A.fx(out, "lab" + s + k, (p) => DR.label(p, s, col), x, y, z, w * k, w / 3 * k, { cw: 768, ch: 256, kind: "basic", bb: true }); };
  const bub = (out, key, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; A.fx(out, key + s + k, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic", bb: true }); };
  const sparkle = (out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) A.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2, bb: true }); } };
  const sweat = (out, t, x, y, z, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1; A.fx(out, "sweat", (p) => DR.sweat(p), x + (i - 1) * 0.16 + ph * 0.05 * (i - 1), y - ph * 0.25, z, 0.08, 0.08, { cw: 128, ch: 128, kind: "basic", bb: true }); } };
  const zzz = (out, t, x, y, z, s = 0.4) => { const k = Math.floor(t * 10) % 12; A.fx(out, "zzz" + k, (p) => DR.zzz(p, k), x, y, z, s, s, { cw: 256, ch: 256, kind: "basic", bb: true }); };
  const flashes = (out, t, pts, rate = 3, col) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; A.fx(out, "flash", (p) => K.drawFlash(p.g), x, y, z, 0.7 * k, 0.7 * k, { cw: 256, ch: 256, kind: "basic", bb: true }); } }); };
  const money = (out, t, x, y, z, n = 5, s = 0.3) => { for (let i = 0; i < n; i++) { const ph = (t * 0.8 + i / n) % 1; A.fx(out, "mark$#7ad04a", (p) => DR.mark(p, "$", "#7ad04a"), x + (hh(i, 3) - 0.5) * 1.2 + Math.sin(ph * 5 + i) * 0.1, y + ph * 1.1, z + (hh(i, 4) - 0.5) * 0.4, s * Math.sin(ph * Math.PI) + 0.02, s * Math.sin(ph * Math.PI) + 0.02, { cw: 256, ch: 256, kind: "basic", bb: true }); } };
  const who = (out, id, o, x, z, opt = {}, y = G) => A.ppl(out, id, { ...o, xk: opt.xk || "" }, x, z, { keep: true, expr: opt.expr ?? "neutral", arms: opt.arms ?? { l: ["hips", 1], r: ["hips", 1] }, headTilt: opt.headTilt ?? 0, tilt: opt.tilt ?? 0, extra: opt.extra, extraSide: opt.extraSide, view: opt.view, dir: opt.dir, mode: opt.mode ?? "stand", phase: opt.phase, stride: opt.stride, backView: opt.back, scale: opt.s ?? 1 }, y);
  const walker = (out, id, o, x, z, t, dir, opt = {}, y = G) => who(out, id, o, x, z, { mode: "march", stride: 1.0, phase: (t * 1.8 + id * 0.37) % 1, dir, ...opt }, y);
  // drums: upright card (w 0.86 -> a 0.58 m drum) and rolling side card (w 1.14)
  const drum = (out, x, yG, z, o = {}, w = 0.86) => { const st = { open: !!o.open, fill: o.fill || "", rust: !!o.rust, stamp: o.stamp || "", glow: !!o.glow, face: o.face || "" }, key = "drum" + Object.values(st).join("_");
    A.fx(out, key, (p) => K.drawBarrel(p.g, st), x, yG + 0.54 * w / 0.86, z, w, w * 4 / 3, { cw: 384, ch: 512, kind: "lit", rot: o.rot ?? 0, bb: o.bb ?? true, ...(o.normal ? { normal: o.normal } : {}) }); };
  const roll = (out, x, yG, z, dist, w = 1.14) => { const k = Math.round(((dist / (Math.PI * 0.58)) % 1 + 1) % 1 * 16) / 16; A.fx(out, "roll" + k, (p) => K.drawBarrelSide(p.g, { k }), x, yG + 0.31 * w / 1.14, z, w, w * 0.75, { cw: 512, ch: 384, kind: "lit", bb: true }); };
  const truck = (out, t, x, z, o = {}, w = 6.4) => { const k = Math.round(((o.k ?? 0) % 1) * 8) / 8, st = { k, open: !!o.open, dust: !!o.dust }; A.fx(out, "truck" + Object.values(st).join("_"), (p) => K.drawTruck(p.g, st), x, G + w * 0.25, z, w, w / 2, { cw: 1024, ch: 512, kind: "lit", bb: true }); };
  const flag = (out, t) => { const k = Math.floor(t * 8) % 8; A.fx(out, "flag" + k, (p) => K.drawFlagCA(p.g, k / 8), -26 + 1.55, 8.2, 6, 3.0, 1.5, { cw: 768, ch: 384, kind: "lit", bb: true }); };
  const plate = (out) => A.fx(out, "plate", (p) => K.drawPlate(p.g, "STRATEGIC", "SYRUP RESERVE"), 0, 6.6, 0.12, 9.0, 2.8, { cw: 1024, ch: 320, kind: "lit", normal: [0, 0, 1] });
  const yard = (out, t) => { flag(out, t); plate(out); };
  const rows = (n, z0, dz) => Array.from({ length: n }, (_, i) => z0 + i * dz);
  // ---------------- hero (shot 1 + loop): two masked thieves roll a drum across the yard in front of the warehouse door ----------------
  const HV = 1.3, heroX = (l) => -1.8 + HV * l;
  const heroCam = (l) => ({ pos: A.p(heroX(l) + 0.55, 0.8, 6.9), look: A.p(heroX(l) - 0.05, 1.15, 3.2), fov: 52, roll: 0 });
  const heroStage = (l, t, out) => { yard(out, t); const x = heroX(l);
    roll(out, x + 0.75, G, 3.6, x); who(out, 1, THIEF(0), x - 0.15, 3.25, { expr: "sly", mode: "stroll", phase: (t * 1.8) % 1, arms: { l: ["out", 1], r: ["out", 1] }, extra: XL.mask }); who(out, 2, THIEF(1), x - 0.9, 2.95, { expr: "grin", mode: "stroll", phase: (t * 1.8 + 0.5) % 1, arms: { l: ["out", 1], r: ["up", 1] }, extra: XL.mask }); money(out, t, x + 0.4, 1.4, 3.5, 4, 0.3);
    sparkle(out, t, x + 0.8, 0.9, 3.8, 0.22, 3); for (let i = 0; i < 6; i++) A.fx(out, "dropG", (p) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.beginPath(); g.ellipse(64, 64, 56, 30, 0, 0, Math.PI * 2); g.fillStyle = "#d8841a"; g.fill(); }, x + 0.3 - i * 0.55, G + 0.012, 3.65 + Math.sin(i * 2.3) * 0.06, 0.18, 0.12, { cw: 128, ch: 128, kind: "basic", flat: true }); };
  // 1 A gang stole eighteen million dollars…
  shot({ a: 0, ...day(), cam: heroCam, cInf: 0.8, focus: A.p(-1, 0.9, 3.4), shadowR: 15, stage(t, out) { heroStage(t, t, out); mk(out, "$", heroX(t) + 1.2, 1.5, 3.9, (t - T("stole")) * 3, 0.45, "#7ad04a"); } });
  kick1(0.15); kick1(T("stole"));
  // 2 million dollars: the truck's back door, the thieves heave drums in, $18,000,000 board pops, money flies
  const t2 = S("million");
  shot({ at: t2, ...day(), cam: tc([9.4, 1.3, 10.6], [9.4, 1.8, 4.2], [8.4, 1.6, 9.8], [9.6, 1.9, 4.2], 50, 1.1), cInf: 0.9, focus: A.p(10, 1.5, 4), shadowR: 15,
    stage(t, out) { yard(out, t); truck(out, t, 12.6, 4.0, { open: true }); who(out, 1, THIEF(0), 8.6, 4.6, { expr: "grin", arms: { l: ["up", 1], r: ["up", 1] }, extra: XL.mask }); drum(out, 8.6, 1.95 + Math.sin(t * 9) * 0.05, 4.6, {}, 0.7);
      walker(out, 2, THIEF(1), 7.4 + (t - t2) * 0.6, 5.0, t, [1, 0], {}); money(out, t, 9.6, 2.4, 4.8, 6, 0.32); bd(out, "b18", "$18,000,000", "OF SYRUP", "#1a7a3a", 10.4, 4.1, 4.6, (t - T("dollars")) * 3, 2.4); } });
  kick1(T("dollars"));
  // 3 …of maple syrup.: ground-level macro, a drum lid pops off and syrup erupts, SYRUP?!
  const t3 = S("of maple");
  shot({ at: t3, ...day(), cam: tc([1.8, 0.55, 6.6], [0.6, 1.1, 3.6], [1.5, 0.6, 6.0], [0.6, 1.2, 3.6], 50, 1.4), cInf: 1.3, focus: A.p(0.6, 0.8, 3.6), shadowR: 8,
    stage(t, out) { yard(out, t); const u = (t - T("syrup", t3)); drum(out, 0.6, G, 3.6, { open: u > 0, fill: "syrup", glow: u > 0 });
      if (u > 0) { const k = Math.min(1, u * 1.6); A.fx(out, "splash" + Math.round(k * 10), (p) => K.drawSplash(p.g, k), 0.6, 1.05 + 0.25 * k, 3.65, 1.1, 1.1, { cw: 512, ch: 512, kind: "lit", bb: true }); }
      if (u < 0) A.fx(out, "lid", (p) => { const g = p.g; g.clearRect(0, 0, 256, 128); K.E(g, 128, 64, 120, 34, 0, "#dcdfe4", 8); }, 0.6, 1.05 + Math.abs(Math.sin(t * 22)) * 0.04, 3.62, 0.62, 0.3, { cw: 256, ch: 128, kind: "lit", bb: true });
      else A.fx(out, "lid", (p) => { const g = p.g; g.clearRect(0, 0, 256, 128); K.E(g, 128, 64, 120, 34, 0, "#dcdfe4", 8); }, 0.6 - u * 0.8, 1.2 + u * 2.4 - u * u * 3, 3.6, 0.62, 0.3, { cw: 256, ch: 128, kind: "lit", rot: u * 9, bb: true });
      wd(out, "SYRUP?!", "#d8841a", 0.3, 1.95, 3.8, (u - 0.1) * 3, 1.1); } });
  kick1(T("syrup", t3));
  // 4 Yes. Syrup.: low hero angle on the masked thief licking his sticky finger, warehouse door behind
  const t4 = S("Yes");
  shot({ at: t4, ...day(), cam: tc([0.9, 0.7, 6.0], [0.2, 1.65, 3.4], [0.5, 0.8, 5.4], [0.2, 1.7, 3.4], 46, 1.2), cInf: 1.1, focus: A.p(0.2, 1.6, 3.4), shadowR: 8,
    stage(t, out) { yard(out, t); const lick = t > T("Syrup", t4); who(out, 1, THIEF(0), 0.2, 3.4, { expr: lick ? "lick" : "sly", arms: { l: ["hips", 1], r: ["face", lick ? 1 : 0.6] }, extra: (p) => { XL.mask(p); XL.drip(p); } });
      mk(out, lick ? "YUM" : "!", 0.9, 2.15, 3.6, (t - t4 - 0.15) * 4, 0.45, "#ffd23a"); } });
  kick1(T("Syrup", t4));
  // 5 Canada keeps a strategic syrup reserve.: drone descends over the autumn forest to the warehouse, flag waving, truck on the road
  const t5 = S("Canada keeps");
  shot({ at: t5, ...day(), cam: tc([-46, 34, 70], [0, 3, -12], [-20, 12, 34], [0, 4, -12], 50, 2.8), cInf: 0.5, focus: A.p(0, 4, -12), shadowR: 60,
    stage(t, out) { yard(out, t); truck(out, t, -30 + (t - t5) * 6, 33, { k: t * 2 }, 6.4); lab(out, "CANADA", "#d8202e", -20, 10.5, 6, (t - T("Canada")) * 3, 5);
      wd(out, "RESERVE!", "#1c3a8a", 7, 10.4, 2, (t - T("reserve")) * 3, 6.5); } });
  kick1(T("reserve"));
  // 6 Like gold… but sticky.: inside, a glowing drum in the aisle, GOLD tag, then it oozes STICKY
  const t6 = S("Like gold");
  shot({ at: t6, ...day(), cam: tc([0.9, 1.0, -2.2], [0, 0.85, -8], [0.5, 0.9, -4.6], [0, 0.85, -8], 48, 1.8), cInf: 1.1, focus: A.p(0, 0.8, -8), shadowR: 12,
    stage(t, out) { drum(out, 0, G, -8, { glow: true, open: t > T("sticky"), fill: "syrup" }); sparkle(out, t, 0, 1.0, -7.9, 0.3, 4);
      lab(out, "GOLD", "#c8a020", 0, 1.85, -7.9, (t - T("gold")) * 3, 0.9); if (t > T("sticky")) { const u = t - T("sticky"); for (let i = 0; i < 3; i++) A.fx(out, "ooze" + i, (p) => K.drawSplash(p.g, 0.3, "#d8841a", "#f4b440"), -0.2 + i * 0.2, 1.0 - Math.min(0.5, u * (0.4 + i * 0.2)), -7.75, 0.3, 0.3, { cw: 512, ch: 512, kind: "lit", bb: true }); wd(out, "STICKY!", "#d8841a", 0.25, 1.7, -7.7, u * 3, 0.9); } } });
  kick1(T("sticky"));
  // 7 Thousands of barrels, stacked: crane up the aisle over the barrel blocks
  const t7 = S("Thousands of");
  shot({ at: t7, ...day(), cam: tc([1.4, 0.7, -3.2], [0.4, 1.6, -26], [0.9, 5.6, -2.4], [0, 1.0, -24], 50, 1.7), cInf: 0.6, focus: A.p(0, 1.5, -18), shadowR: 25,
    stage(t, out) { walker(out, 2, THIEF(1), 0.6, -12 - (t - t7) * 0.8, t, [0, -1], {}); bd(out, "bk", "1000s", "OF BARRELS", "#1c3a8a", 0, 4.4, -14, (t - T("barrels")) * 3, 2.4); } });
  kick1(T("stacked"));
  // 8 in one giant warehouse.: pull back out through the doorway, the building grows huge
  const t8 = S("in one");
  shot({ at: t8, ...day(), cam: tc([0, 2.6, -5], [0, 2.2, -24], [6, 5.2, 22], [0, 3.6, -14], 52, 1.8), cInf: 0.5, focus: A.p(0, 3, -10), shadowR: 40,
    stage(t, out) { yard(out, t); walker(out, 2, THIEF(1), -2 + (t - t8) * 1.1, 3.4, t, [1, 0], {}); roll(out, -1 + (t - t8) * 1.1, G, 3.7, (t - t8) * 1.1); wd(out, "GIANT!", "#c8202e", 9, 9.8, 0.6, (t - T("giant")) * 3, 4.5); } });
  kick1(T("warehouse"));
  // 9 Run by an actual syrup cartel.: low orbit round three suits in shades in front of the door
  const t9 = S("Run by");
  const cartel = (out, t, shadesOn = true) => { for (let i = 0; i < 3; i++) who(out, 20 + i, SUIT(i), -1.3 + i * 1.3, 2.6 + (i === 1 ? 0.4 : 0), { expr: i === 1 ? "sly" : "stern", arms: { l: ["hips", 1], r: ["hips", 1] }, extra: shadesOn || i !== 1 ? XL.shades : undefined }); };
  shot({ at: t9, ...day(), cam: orbit([0, 0, 3.0], 4.2, 0.55, 0.55, -0.3, 1.6, 50), cInf: 0.9, focus: A.p(0, 1.6, 3), shadowR: 12,
    stage(t, out) { yard(out, t); cartel(out, t); lab(out, "SYRUP CARTEL", "#2a2a36", 0, 2.75, 3.2, (t - T("cartel")) * 3, 2.2); flashes(out, t, [[-2.4, 1.5, 4.5], [2.6, 1.8, 4.2]], 2.5); } });
  kick1(T("cartel"));
  // 10 Really.: tight push on the boss, he lowers his shades
  const t10 = S("Really");
  shot({ at: t10, ...day(), cam: tc([0.3, 1.75, 5.2], [0, 1.75, 3.0], [0.15, 1.75, 4.5], [0, 1.75, 3.0], 44, 0.9), cInf: 1.2, focus: A.p(0, 1.75, 3), shadowR: 8,
    stage(t, out) { yard(out, t); cartel(out, t, t < T("Really") + 0.25); lab(out, "REALLY.", "#c8202e", 0.55, 2.3, 3.3, (t - T("Really") - 0.2) * 3, 0.7); } });
  // 11 The plan?: top-down on the blueprint on the picnic table by the sugar shack, slow twist
  const t11 = S("The plan");
  shot({ at: t11, ...day(), cam: (l) => ({ pos: A.p(TB[0], TB[1] + 1.9 - l * 0.4, TB[2] + 0.45), look: A.p(TB[0], TB[1], TB[2]), fov: 50, roll: 0.3 - l * 0.4 }), cInf: 1.2, focus: A.p(TB[0], TB[1], TB[2]), shadowR: 6, near: 0.05,
    stage(t, out) { const n = Math.min(4, Math.floor((t - t11) * 5)); A.fx(out, "plan" + n, (p) => K.drawPlan(p.g, n), TB[0], TB[1] + 0.01, TB[2], 1.1, 1.1, { cw: 768, ch: 768, kind: "lit", flat: true });
      A.fx(out, "jugT", (p) => K.drawJug(p.g), TB[0] + 0.75, TB[1] + 0.02, TB[2] - 0.3, 0.3, 0.37, { cw: 256, ch: 320, kind: "lit", flat: true, rot: 0.4 }); mk(out, "?", TB[0] - 0.4, TB[1] + 0.3, TB[2] + 0.3, (t - T("plan")) * 4, 0.3, "#ffd23a"); } });
  kick1(T("plan"));
  // 12 Truck the barrels out.: tracking alongside the truck on the road, the warehouse slides past behind
  const t12 = S("Truck the");
  shot({ at: t12, ...day(), cam: lin([-6, 1.5, 41], [7, 0, 0], [-4, 1.8, 33]), cInf: 0.8, focus: A.p(-4, 1.6, 33), shadowR: 20,
    stage(t, out) { yard(out, t); const l = t - t12; truck(out, t, -4 + l * 7, 33, { k: l * 2.2, dust: true }); A.fx(out, "thiefWin", (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); K.E(g, 128, 140, 70, 80, 0, "#f2d2b6", 7); g.fillStyle = "#121216"; g.fillRect(58, 110, 140, 40); K.E(g, 128, 76, 74, 36, 0, "#1a1a1e", 6); }, -4 + l * 7 + 2.2, G + 2.4, 33.1, 0.6, 0.6, { cw: 256, ch: 256, kind: "lit", bb: true });
      wd(out, "VROOM!", "#c8202e", -4 + l * 7 - 2.5, 3.6, 33.2, (t - T("out", t12)) * 3, 1.8); } });
  // 13 Suck out the syrup.: at the sugar shack a thief sucks the syrup through a hose like a straw, SLURP
  const t13 = S("Suck out");
  shot({ at: t13, ...day(), cam: orbit([SH[0], 0, SH[2] + 5.2], 3.0, 1.1, 0.35, -0.25, 1.1, 48), cInf: 1.0, focus: A.p(SH[0], 1.1, SH[2] + 5.2), shadowR: 10,
    stage(t, out) { const x = SH[0], z = SH[2] + 5.2; drum(out, x - 0.6, 0.12, z, { open: true, fill: "syrup" }); drum(out, x + 0.8, 0.12, z - 0.1, { open: true, fill: "syrup" });
      who(out, 1, THIEF(0), x + 0.05, z + 0.35, { expr: "chew", arms: { l: ["face", 1], r: ["hips", 1] }, extra: XL.mask }, 0.12);
      A.fx(out, "hoseS" + (Math.floor(t * 10) % 5), (p) => { const g = p.g, k = (Math.floor(t * 10) % 5) / 5; g.clearRect(0, 0, 512, 512); g.lineCap = "round"; g.beginPath(); g.moveTo(40, 420); g.bezierCurveTo(60, 120, 300, 40, 400, 120); g.strokeStyle = INK; g.lineWidth = 34; g.stroke(); g.strokeStyle = "#c8ccd4"; g.lineWidth = 22; g.stroke();
        g.setLineDash([24, 26]); g.lineDashOffset = -k * 50; g.strokeStyle = "#d8841a"; g.lineWidth = 14; g.beginPath(); g.moveTo(40, 420); g.bezierCurveTo(60, 120, 300, 40, 400, 120); g.stroke(); g.setLineDash([]); }, x - 0.32, 1.3, z + 0.3, 0.75, 0.75, { cw: 512, ch: 512, kind: "lit", bb: true });
      wd(out, "SLURP!", "#d8841a", x + 0.4, 2.3, z + 0.4, (t - T("Suck")) * 3, 1.0); } });
  kick1(T("syrup", t13));
  // 14 Fill them back up… with water.: crane down on a thief topping a drum up with a garden hose
  const t14 = S("Fill them");
  shot({ at: t14, ...day(), cam: tc([SH[0] + 2.0, 2.4, SH[2] + 8.4], [SH[0], 0.9, SH[2] + 5.0], [SH[0] + 1.4, 1.3, SH[2] + 7.6], [SH[0], 0.95, SH[2] + 5.0], 48, 1.7), cInf: 1.0, focus: A.p(SH[0], 0.9, SH[2] + 5), shadowR: 10,
    stage(t, out) { const x = SH[0], z = SH[2] + 5.0, w = t > T("water", t14); drum(out, x - 0.25, 0.12, z, { open: true, fill: "water" }); who(out, 2, THIEF(1), x + 0.55, z - 0.15, { expr: w ? "laugh" : "whistle", arms: { l: ["hips", 1], r: ["shoulder", 1] }, extra: (p) => { XL.mask(p); XL.hose(t * 1.5)(p); } }, 0.12);
      if (w) { const k = Math.min(1, (t - T("water", t14)) * 2); A.fx(out, "wsplash" + Math.round(k * 8), (p) => K.drawSplash(p.g, k, "#5ab0e8", "#bfe6ff"), x - 0.25, 1.15, z + 0.05, 0.8, 0.8, { cw: 512, ch: 512, kind: "lit", bb: true }); mk(out, "H2O!", x - 0.9, 1.75, z + 0.2, (t - T("water", t14)) * 3, 0.5, "#4ab0ff"); } } });
  kick1(T("water", t14));
  // 15 Roll them back in.: low, the thief rolls the drum back through the warehouse door, camera follows
  const t15 = S("Roll them");
  shot({ at: t15, ...day(), cam: lin([5.2, 0.6, 7.0], [-1.6, 0, -0.8], [2.6, 0.9, 1.6], 50, [-1.6, 0, -0.4]), cInf: 0.9, focus: A.p(1.5, 0.8, 1.5), shadowR: 12,
    stage(t, out) { yard(out, t); const l = t - t15, x = 3.0 - l * 1.6; roll(out, x, G, 1.6, -x); walker(out, 1, THIEF(0), x + 1.0, 1.9, t, [-1, 0], { expr: "sly" }); mk(out, "SHH!", x + 1.0, 2.35, 2.0, (t - T("Roll")) * 3, 0.5, "#ffd23a"); } });
  // 16 Who checks a barrel, right?: inside, the guard snoozes on a drum, the thief leans on the stack and winks at us
  const t16 = S("Who checks");
  shot({ at: t16, ...day(), cam: orbit([0.3, 0, -6.5], 3.6, 1.35, -0.2, 0.18, 1.2, 50), cInf: 1.0, focus: A.p(0.6, 1.2, -6.4), shadowR: 10,
    stage(t, out) { who(out, 1, THIEF(0), 1.05, -6.7, { expr: "sly", arms: { l: ["hips", 1], r: ["point", 0.7] }, extra: XL.mask, headTilt: 8 });
      drum(out, -0.45, G, -6.4, {}); who(out, 5, COP, -0.45, -6.35, { mode: "sit", expr: "sleep", arms: { l: ["low", 1], r: ["low", 1] }, s: 0.95 }, G + 0.84); zzz(out, t, -0.15, 2.0, -6.2, 0.5);
      bub(out, "bwho", "RIGHT?", "#2a2a36", 1.0, 2.55, -6.5, (t - T("right")) * 3, 1.0); } });
  // 17 They do this for months.: time-lapse orbit of the yard, the calendar flips OCT -> AUG, the truck shuttles
  const t17 = S("They do");
  const MONTHS = ["OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"];
  shot({ at: t17, ...day({ sunAz: 170 }), cam: orbit([0, 0, 10], 26, 9, 0.9, -0.3, 1.5, 50), cInf: 0.5, focus: A.p(0, 1.5, 10), shadowR: 40,
    stage(t, out) { yard(out, t); const l = t - t17, m = Math.min(10, Math.floor(l * 8)); truck(out, t, 8 + Math.sin(l * 9) * 10, 12, { k: l * 5 }); A.fx(out, "mon" + m, (p) => K.drawMonth(p.g, MONTHS[m]), 0, 9.5, 10, 4, 5, { cw: 512, ch: 640, kind: "basic", bb: true }); } });
  kick1(T("months"));
  // 18 Barrel after barrel after barrel.: ground level, drums roll past the lens one after another
  const t18 = S("Barrel after");
  shot({ at: t18, ...day(), cam: tc([0.3, 0.32, 7.4], [0, 0.45, 3.4], [-0.3, 0.35, 7.0], [0, 0.45, 3.4], 50, 2.3), cInf: 1.0, focus: A.p(0, 0.5, 4), shadowR: 10,
    stage(t, out) { yard(out, t); for (const [i, w] of [[0, "Barrel"], [1, "barrel"], [2, "barrel"]]) { const t0 = (i === 0 ? T("Barrel after") : i === 1 ? T("barrel", T("Barrel after") + 0.1) : T("barrel", T("after", T("Barrel after") + 0.6) + 0.1)) - 0.5, x = -3 + (t - t0) * 4.2;
      if (t > t0 && x < 4) { roll(out, x, G, 4.0 - i * 0.25, x); mk(out, String(i + 1), x, 1.25, 4.1, (t - t0 - 0.35) * 3, 0.35, "#ffd23a"); } } walker(out, 2, THIEF(1), 0.8, 1.6, t, [1, 0], { expr: "grin" }); } });
  // 19 Then they sell the syrup, bit by bit…: by the truck on the road, jugs go out, cash comes in
  const t19 = S("Then they");
  shot({ at: t19, ...day(), cam: tc([62, 1.4, 41.0], [64, 1.4, 35.4], [64, 1.5, 41.4], [64.6, 1.4, 35.4], 50, 1.8), cInf: 0.9, focus: A.p(64, 1.4, 35.6), shadowR: 15,
    stage(t, out) { truck(out, t, 61, 33, { open: true }); who(out, 1, THIEF(0), 63.4, 35.4, { expr: "sly", arms: { l: ["hips", 1], r: ["out", 0.8 + 0.2 * Math.sin(t * 6)] }, extra: (p) => { XL.mask(p); XL.hold(K.drawJug, 256, 320, "r", 0.8)(p); } });
      who(out, 30, FOLK(0), 65.0, 35.8, { expr: "grin", arms: { l: ["out", 0.8], r: ["hips", 1] }, extra: XL.hold(K.drawCash, 256, 160, "l", 0.9) }); who(out, 31, FOLK(3), 66.2, 36.2, { expr: "smile", arms: { l: ["hips", 1], r: ["out", 0.7] }, extra: XL.hold(K.drawJug, 256, 320, "r", 0.7) });
      money(out, t, 64.4, 2.2, 35.8, 5, 0.3); mk(out, "BIT BY BIT", 64, 2.9, 35.9, (t - T("bit")) * 3, 0.9, "#ffd23a"); } });
  // 20 across the border.: drone chases the truck down the road past the border sign
  const t20 = S("across the");
  shot({ at: t20, ...day(), cam: lin([170, 6, 40.5], [12, -1.5, 0], [188, 1.5, 34], 50, [12, 0, 0]), cInf: 0.6, focus: A.p(190, 1.5, 34), shadowR: 30,
    stage(t, out) { const l = t - t20; truck(out, t, 184 + l * 12, 33, { k: l * 3, dust: true }); A.fx(out, "usa", (p) => K.drawRoadSign(p.g, "U.S.A.", "BORDER"), 192, 2.2, 37.4, 2.0, 2.5, { cw: 512, ch: 640, kind: "lit", bb: true });
      A.fx(out, "boom", (p) => { const g = p.g; g.clearRect(0, 0, 1024, 64); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#d8202e"; g.fillRect(i * 128, 8, 128, 48); } }, 197.6, 1.05, 34.5, 5.0, 0.3, { cw: 1024, ch: 64, kind: "lit", rot: l > 0.2 ? -1.3 : 0, bb: true }); } });
  kick1(T("border"));
  // 21 But wait… it gets stickier.: inside at night, push in on one drum that looks back at us
  const t21 = S("But wait");
  shot({ at: t21, ...nite(), cam: tc([0, 1.2, -2.0], [0, 0.85, -8], [0, 0.95, -5.4], [0, 0.85, -8], 46, 1.8), cInf: 1.2, focus: A.p(0, 0.8, -8), shadowR: 10,
    stage(t, out) { drum(out, 0, G, -8, { face: t > T("stickier") ? "shock" : "" }); wd(out, "STICKIER!", "#d8841a", 0, 1.75, -7.7, (t - T("stickier")) * 3, 1.0); sparkle(out, t, 0, 1.4, -7.8, 0.15, 2); } });
  kick1(T("stickier"));
  // 22 One day, an inspector climbs the stack…: crane up beside the inspector climbing the drum wall
  const t22 = S("One day");
  const climbY = (t) => G + (TOP - G) * smooth((t - T("climbs")) / 1.0);
  shot({ at: t22, ...day(), cam: tc([-0.8, 1.0, -9.6], [2.9, 1.4, -12.4], [-1.0, 3.4, -9.6], [2.9, 3.2, -12.4], 52, 2.0), cInf: 0.9, focus: A.p(2.8, 2, -12.4), shadowR: 12,
    stage(t, out) { const y = climbY(t), up = t > T("climbs"); who(out, 3, INSP, 2.7, -12.4, { back: up && y < TOP - 0.05, expr: "proud", arms: up && y < TOP - 0.05 ? { l: ["up", 1], r: ["overhead", 1] } : { l: ["hips", 1], r: ["hips", 1] }, extra: up ? undefined : XL.hold(K.drawClip, 256, 320, "r", 0.9) }, y);
      lab(out, "INSPECTOR", "#ff7a1a", 1.2, 3.3, -11.0, (t - T("inspector")) * 3, 1.3); } });
  // 23 and a barrel wobbles.: low in the aisle looking up, the drum under his boots rocks
  const t23 = S("and a barrel");
  const wob = (t) => Math.sin(t * 18) * 0.12 * clamp01((t - T("wobbles")) * 3 + 0.5);
  shot({ at: t23, ...day(), cam: tc([0.4, 1.3, -10.2], [3.0, 3.2, -12.3], [0.8, 1.6, -10.8], [3.0, 3.3, -12.3], 48, 1.6), cInf: 1.0, focus: A.p(3, 3.2, -12.3), shadowR: 10,
    stage(t, out) { const w = wob(t); drum(out, 2.92, TOP - 0.98 + 0.12, -12.3, { rot: w }); who(out, 3, INSP, 3.0 + w * 0.6, -12.3, { expr: "worried", arms: { l: ["out", 1], r: ["out", 1] }, tilt: w * 60 }, TOP + 0.02);
      wd(out, "WOBBLE", "#c8202e", 2.4, 2.4, -11.6, (t - T("wobbles")) * 3, 1.0); } });
  kick1(T("wobbles"));
  // 24 It's empty.: his view straight down into the open drum: empty, rusty, a spider
  const t24 = S("It's empty");
  shot({ at: t24, ...day(), cam: (l) => ({ pos: A.p(3.0, TOP + 1.3 - l * 0.35, -12.0), look: A.p(3.0, TOP, -12.3), fov: 46, roll: l * 0.3 }), cInf: 1.2, focus: A.p(3, TOP, -12.3), shadowR: 6, near: 0.05,
    stage(t, out) { const k = Math.floor(t * 8) % 8; A.fx(out, "btop" + k, (p) => K.drawBarrelTop(p.g, { fill: "empty", k: k / 8 }), 3.0, TOP + 0.03, -12.3, 0.62, 0.62, { cw: 512, ch: 512, kind: "lit", flat: true }); mk(out, "EMPTY?!", 3.0, TOP + 0.4, -12.2, (t - T("empty")) * 3, 0.36, "#ffffff"); } });
  kick1(T("empty"));
  // 25 He nearly falls off.: whip low, the inspector windmills on the edge
  const t25 = S("He nearly");
  shot({ at: t25, ...day(), cam: tc([1.6, 2.4, -10.2], [3.0, 3.7, -12.0], [1.2, 2.2, -10.6], [3.0, 3.8, -12.0], 52, 1.4), cInf: 1.0, focus: A.p(3, 3.5, -12), shadowR: 10,
    stage(t, out) { const sw = Math.sin(t * 14); who(out, 3, INSP, 2.9 + sw * 0.08, -12.0, { expr: "shock", arms: { l: ["up", 0.6 + 0.4 * sw], r: ["up", 0.6 - 0.4 * sw] }, tilt: sw * 14 + 10, headTilt: -sw * 10 }, TOP + 0.02);
      A.fx(out, "clipF", (p) => K.drawClip(p.g), 2.4, TOP - (t - t25) * 2.2, -11.6, 0.34, 0.42, { cw: 256, ch: 320, kind: "lit", rot: t * 6, bb: true }); wd(out, "WHOA!", "#c8202e", 2.4, 4.75, -11.5, (t - T("falls")) * 3, 1.1); sweat(out, t, 2.95, 5.0, -11.9); } });
  kick1(T("falls"));
  // 26 Then another one. And another.: tracking along the drum wall, EMPTY stamps pop one after another next to the inspector
  const t26 = S("Then another");
  const zI = (l) => -11.4 - l * 1.4;
  shot({ at: t26, ...day(), cam: (l) => ({ pos: A.p(-1.4, 2.9, zI(l) + 1.6), look: A.p(3.0, 3.3, zI(l) - 0.6), fov: 50, roll: 0 }), cInf: 0.9, focus: A.p(3, 2.4, -12.5), shadowR: 14,
    stage(t, out) { const l = t - t26; walker(out, 3, INSP, 3.5, zI(l), t, [0, -1], { expr: "shock" }, TOP + 0.02);
      const a1 = T("another"), a2 = T("another", a1 + 0.1), st = [a1, a2, a2 + 0.3, a2 + 0.55];
      st.forEach((s0, i) => { if (t > s0) drum(out, 2.92, G + 0.12 + (i % 2) * 0.98, zI(s0 - t26) - 0.4, { stamp: "EMPTY", rust: i % 2 === 1 }, 0.86); }); } });
  kick1(T("another")); kick1(T("another", T("another") + 0.1));
  // 27 Thousands of tonnes… gone.: from up under the roof, the whole hall of drums: EMPTY everywhere, GONE
  const t27 = S("Thousands of", 40);
  shot({ at: t27, ...day(), cam: tc([0, 7.3, -1.5], [0, 0, -18], [0, 6.6, -5], [0, 0, -20], 52, 1.9), cInf: 0.5, focus: A.p(0, 2, -15), shadowR: 30,
    stage(t, out) { const l = t - t27; for (let i = 0; i < 24; i++) { if (l < i * 0.05) continue; const bx = [-13, -5.5, 5.5, 13][i % 4] + (hh(i, 2) - 0.5) * 4, bz = (i % 8 < 4 ? -30 : -12.5) + (hh(i, 3) - 0.5) * 9;
        A.fx(out, "stampF", (p) => { const g = p.g; g.clearRect(0, 0, 512, 192); g.strokeStyle = "#d8202e"; g.lineWidth = 16; g.strokeRect(14, 14, 484, 164); K.txt(g, "EMPTY", 256, 100, 130, "Bangers", "#d8202e", INK, 0, 440); }, bx, TOP + 0.03, bz, 2.4, 0.9, { cw: 512, ch: 192, kind: "basic", flat: true, rot: hh(i, 5) - 0.5 }); }
      who(out, 3, INSP, 0, -14, { expr: "sad", arms: { l: ["head", 1], r: ["head", 1] } }); bd(out, "bgone", "GONE", "THOUSANDS OF TONNES", "#c8202e", 0, 4.2, -9, (t - T("gone")) * 3, 3.0); } });
  kick1(T("gone"));
  // 28 The police arrest the gang.: orbit at the sugar shack, sirens, hands up
  const t28 = S("The police");
  shot({ at: t28, ...day(), cam: orbit([SH[0], 0, SH[2] + 6.4], 5.6, 1.5, 0.45, -0.3, 1.3, 52), cInf: 0.8, focus: A.p(SH[0], 1.2, SH[2] + 7), shadowR: 15,
    stage(t, out) { const x = SH[0], z = SH[2] + 7; A.fx(out, "cop" + (Math.floor(t * 6) % 2), (p) => K.drawPolice(p.g, (Math.floor(t * 6) % 2) / 6), x + 0.4, 0.12 + 1.0, z - 2.2, 4.6, 2.0, { cw: 1024, ch: 448, kind: "lit", bb: true });
      for (let i = 0; i < 3; i++) who(out, 1 + i, THIEF(i), x - 1.2 + i * 1.0, z - 0.4 + (i % 2) * 0.3, { expr: i === 0 ? "shock" : "worried", arms: { l: ["up", 1], r: ["up", 1] }, extra: XL.mask }, 0.12);
      who(out, 6, COP, x + 1.6, z + 0.4, { expr: "stern", arms: { l: ["hips", 1], r: ["point", 1] } }, 0.12); flashes(out, t, [[x - 0.2, 2.3, z - 2.0], [x + 0.9, 2.3, z - 2.0]], 3); wd(out, "BUSTED!", "#1c3a8a", x - 0.2, 2.9, z, (t - T("arrest")) * 3, 1.6); } });
  kick1(T("arrest"));
  // 29 The ringleader gets eight years in prison…: push through the bars on the ringleader in orange
  const t29 = S("The ringleader");
  shot({ at: t29, ...day(), cam: tc([CELL[0] + 0.3, 1.75, CELL[2] + 7.4], [CELL[0], 1.55, CELL[2] + 1.4], [CELL[0], 1.65, CELL[2] + 5.4], [CELL[0], 1.6, CELL[2] + 1.4], 48, 2.0), cInf: 1.0, focus: A.p(CELL[0], 1.5, CELL[2] - 1), shadowR: 10,
    stage(t, out) { who(out, 1, CON, CELL[0] - 0.05, CELL[2] + 2.2, { expr: "sad", arms: { l: ["low", 1], r: ["low", 1] }, headTilt: 10 }, 0.12);
      A.fx(out, "bars", (p) => K.drawBars(p.g), CELL[0], 1.7, CELL[2] + 3.05, 3.2, 3.2, { cw: 1024, ch: 1024, kind: "lit", normal: [0, 0, 1] });
      bd(out, "b8", "8 YEARS", "IN PRISON", "#c8202e", CELL[0], 2.3, CELL[2] + 3.3, (t - T("eight")) * 3, 1.1); } });
  kick1(T("eight")); kick1(T("prison"));
  // 30 …and a fine of millions.: the bill unrolls from his hands down to the floor, tilt down with it
  const t30 = S("and a fine");
  shot({ at: t30, ...day(), cam: tc([CELL[0] + 0.3, 1.9, CELL[2] + 1.6], [CELL[0], 1.6, CELL[2] - 1.2], [CELL[0] + 0.4, 1.3, CELL[2] + 1.9], [CELL[0], 0.8, CELL[2] - 1.0], 48, 1.4), cInf: 1.1, focus: A.p(CELL[0], 1.2, CELL[2] - 1), shadowR: 8,
    stage(t, out) { const u = Math.round(clamp01((t - T("fine")) / 1.0) * 10) / 10; who(out, 1, CON, CELL[0], CELL[2] - 1.2, { expr: u > 0.7 ? "shock" : "worried", arms: { l: ["hold", 1], r: ["hold", 1] } }, 0.12);
      A.fx(out, "fine" + u, (p) => K.drawFine(p.g, u), CELL[0], 0.64, CELL[2] - 0.85, 0.55, 1.1, { cw: 512, ch: 1024, kind: "lit", bb: true }); mk(out, "$$$", CELL[0] + 0.7, 2.2, CELL[2] - 0.8, (t - T("millions")) * 3, 0.5, "#7ad04a"); } });
  kick1(T("millions"));
  // 31 Still, somewhere out there…: golden-hour drone over the red maples toward a cabin with smoke
  const t31 = S("Still somewhere");
  shot({ at: t31, ...gold(), cam: tc([-150, 40, 60], [-72, 2, -12], [-96, 14, 18], [-70, 2, -8], 50, 2.4), cInf: 0.5, focus: A.p(-70, 2, -10), shadowR: 60,
    stage(t, out) { for (let i = 0; i < 4; i++) { const ph = (t * 0.4 + i / 4) % 1; A.fx(out, "smoke", (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); const gr = g.createRadialGradient(128, 128, 10, 128, 128, 120); gr.addColorStop(0, "rgba(240,240,240,0.85)"); gr.addColorStop(1, "rgba(240,240,240,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }, SH[0] + 1.9 + ph * 2, 6 + ph * 7, SH[2] - 0.4, 2 + ph * 3, 2 + ph * 3, { cw: 256, ch: 256, kind: "basic", bb: true }); }
      mk(out, "?", SH[0], 9, SH[2], (t - T("there")) * 3, 2.6, "#ffd23a"); } });
  // 32 someone ate some very expensive pancakes.: at the picnic table, a lumberjack shovels in syrup-soaked pancakes
  const t32 = S("someone ate");
  const pancakes = (out, t, tag, w = 0.5) => { const k = Math.floor(t * 6) % 6; A.fx(out, "pc" + k + tag, (p) => K.drawPancakes(p.g, { k: k / 6, tag }), TB[0] + 0.1, TB[1] + w * 0.4, TB[2] + 0.25, w, w, { cw: 512, ch: 512, kind: "lit", bb: true }); };
  shot({ at: t32, ...gold(), cam: tc([TB[0] + 1.6, 1.25, TB[2] + 3.2], [TB[0], 1.2, TB[2] - 0.2], [TB[0] + 0.9, 1.2, TB[2] + 2.5], [TB[0], 1.25, TB[2] - 0.2], 48, 1.4), cInf: 1.0, focus: A.p(TB[0], 1.2, TB[2]), shadowR: 8,
    stage(t, out) { who(out, 40, LUMBER, TB[0] - 0.1, TB[2] - 0.9, { expr: ["chew", "smile_closed"][Math.floor(t * 5) % 2], arms: { l: ["hips", 1], r: ["feed", 0.6 + 0.4 * Math.abs(Math.sin(t * 7))] }, extra: XL.fork }, 0.12); pancakes(out, t, "");
      mk(out, "NOM", TB[0] - 0.7, 2.15, TB[2] - 0.6, (t - T("ate")) * 3, 0.5, "#ffd23a"); } });
  // 33 …very expensive pancakes.: macro push on the dripping stack, a $$$$ tag flips up, gold sparkles
  const t33 = S("very expensive");
  shot({ at: t33, ...gold(), cam: tc([TB[0] + 0.5, 1.05, TB[2] + 1.35], [TB[0] + 0.1, 0.95, TB[2] + 0.25], [TB[0] + 0.3, 1.0, TB[2] + 1.0], [TB[0] + 0.1, 0.97, TB[2] + 0.25], 46, 2.0), cInf: 1.3, focus: A.p(TB[0] + 0.1, 0.95, TB[2] + 0.25), shadowR: 5,
    stage(t, out) { pancakes(out, t, t > T("expensive") + 0.2 ? "$$$$" : ""); sparkle(out, t, TB[0] + 0.1, 1.15, TB[2] + 0.3, 0.12, 4); } });
  kick1(T("expensive") + 0.2);
  // 34 Because one day…: loop: the thieves and their drum roll into shot 1's first frame
  const tL = S("Because one");
  shot({ at: tL, ...day(), cam: (l) => heroCam(l - (END - tL)), cInf: 0.8, focus: A.p(-1, 0.9, 3.4), shadowR: 15, stage(t, out) { heroStage(t - END, t, out); } });
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
