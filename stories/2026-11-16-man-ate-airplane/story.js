// Shot plan for "He Ate a Whole Airplane" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Michel Lotito, "Monsieur Mangetout": the performer who (per Guinness) ate a Cessna 150 over about two years, sawing it into
// bite-sized chunks, mineral oil + water; also bicycles, shopping carts, TV sets, skis, a chandelier, a coffin (handles included);
// pica; Guinness gave him a brass plaque for the strangest diet and he ate that too; bananas and hard-boiled eggs made him sick.
// Hook-first (already chomping the plane on frame 0), a cut every ~1.6 s, loop ending (the last shot = shot 1's view, the fork going up).
import { AIR } from "./world.js";
import { INK } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1320;
export const setWords = (w) => { WORDS = w; TOTAL = Math.ceil((w[w.length - 1].end + 0.24) * FPS); buildShots(); };
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
const hh = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const keys = (ks, creep = 0.002) => (s) => {
  let i = 0; while (i < ks.length - 1 && s > ks[i + 1].t) i++;
  const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)], u = b === a ? 0 : glide((s - a.t) / Math.max(0.001, b.t - a.t));
  return { pos: L3(a.pos, b.pos, u), look: L3(a.look, b.look, u), fov: lerp(a.fov ?? 40, b.fov ?? 40, u) * (1 - creep * s * FPS * 0.06), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) };
};
const push = (p0, l0, p1, l1, fov = 40, dur = 5, fov1 = fov) => keys([{ t: 0, pos: p0, look: l0, fov }, { t: dur, pos: p1, look: l1, fov: fov1 }]);
const kick = (t, at, amp = 0.012) => { let o = 0; for (const a of at) { const k = Math.round((t - a) * FPS); if (k >= 0 && k < 7) o += amp * (k % 2 ? -1 : 1) * (1 - k / 7); } return o; };
const two = Math.PI * 2;

// ---------------- text ----------------
const txt = (g, s, x, y, size, font, fill, stroke = INK, lw = 0, maxW = 0) => {
  g.font = `${size}px ${font}`; if (maxW) { let k = size; while (g.measureText(s).width > maxW && k > 8) { k *= 0.94; g.font = `${k}px ${font}`; } }
  g.textAlign = "center"; g.textBaseline = "middle"; if (lw) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = lw; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y);
};
const E = (g, x, y, rx, ry, rot, fill, lw = 8, stroke = INK) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, two); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };

// ---------------- 2D drawings ----------------
const DR = {
  nameTag: (p, a, b, col = "#c0353a") => { const g = p.g; g.clearRect(0, 0, 1024, 256); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 40); g.lineTo(984, 40); g.lineTo(940, 128); g.lineTo(984, 216); g.lineTo(40, 216); g.lineTo(84, 128); g.closePath(); g.fill(); g.stroke();
    txt(g, a, 512, 108, 100, "AlfaSlab", "#ffffff", INK, 10, 820); txt(g, b, 512, 186, 46, "AlfaSlab", "#ffe08a", INK, 6, 760); },
  burst: (p, c0 = "#ffd23a", c1 = "#ff9a2a") => { const g = p.g; g.clearRect(0, 0, 512, 512); for (let i = 0; i < 20; i++) { const a0 = (i / 20) * two, a1 = ((i + 1) / 20) * two; g.fillStyle = i % 2 ? c0 : c1; g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 360, a0, a1); g.closePath(); g.fill(); } const gr = g.createRadialGradient(256, 256, 30, 256, 256, 256); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(0.35, "rgba(255,240,200,0.4)"); gr.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); },
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, s.length > 2 ? 110 : 200, "Bangers", col, INK, 14, 240); },
  word: (p, s, col, u) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); const k = 0.7 + 0.3 * Math.min(1, u * 3); g.scale(k, k); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two, r = i % 2 ? 80 : 118; g.lineTo(Math.cos(a) * r * 2, Math.sin(a) * r * 0.9); } g.closePath(); g.fill(); g.stroke(); txt(g, s, 0, 6, 92, "Bangers", col, INK, 10, 400); g.restore(); },
  numBoard: (p, n, label, col) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(30, 30, 964, 452, 40); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.roundRect(56, 56, 912, 400, 28); g.stroke();
    txt(g, n, 512, 210, 230, "Bangers", col, INK, 16, 900); txt(g, label, 512, 380, 110, "Bangers", "#2a2a36", INK, 0, 880); },
  money: (p, s, col) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.fillStyle = "#cfe3b8"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.roundRect(14, 30, 484, 196, 18); g.fill(); g.stroke(); g.strokeStyle = "#5a8a4a"; g.lineWidth = 6; g.beginPath(); g.roundRect(34, 50, 444, 156, 12); g.stroke(); E(g, 256, 128, 60, 60, 0, "#a8c890", 5, "#5a8a4a"); txt(g, s, 256, 134, 130, "AlfaSlab", col, INK, 8, 440); },
  shadow: (p) => { const g = p.g, gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "rgba(30,20,30,0.5)"); gr.addColorStop(1, "rgba(30,20,30,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); },
  puff: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); const v = k / 6; g.globalAlpha = 1 - v * 0.8; for (let i = 0; i < 6; i++) { const a = i * 1.05; E(g, 128 + Math.cos(a) * (30 + v * 60), 150 + Math.sin(a) * (16 + v * 30) - v * 20, 34 + v * 20, 28 + v * 16, 0, "#efe4cc", 6, "rgba(36,23,38,0.6)"); } g.globalAlpha = 1; },
  spark: (p) => { p.poly([[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], "#fffbe8", 8); },
  heart: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); g.fillStyle = "#ff5a7a"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 210); g.bezierCurveTo(20, 140, 30, 40, 128, 84); g.bezierCurveTo(226, 40, 236, 140, 128, 210); g.fill(); g.stroke(); },
  potato: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); E(g, 128, 132, 100, 70, 0.3, "#c8a064", 10); for (const [x, y] of [[90, 110], [150, 150], [170, 100]]) E(g, x, y, 7, 5, 0, "#8a6a3a", 0); },
  daisy: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(128, 250); g.quadraticCurveTo(118, 190, 128, 140); g.stroke(); g.strokeStyle = "#4f8a3a"; g.lineWidth = 6; g.stroke(); for (let i = 0; i < 12; i++) { const a = (i / 12) * two; E(g, 128 + Math.cos(a) * 44, 100 + Math.sin(a) * 44, 26, 12, a, "#ffffff", 5); } E(g, 128, 100, 28, 28, 0, "#ffd23a", 6); },
  post: (p) => { p.g.fillStyle = INK; p.g.fillRect(0, 0, 64, 512); p.g.fillStyle = "#7a5a3a"; p.g.fillRect(10, 0, 44, 512); },
};
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });

// ---------------- card helpers ----------------
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });
const screenCard = (out, c, key, draw, d = 0.6, cw = 1024, ch = 512, kind = "soft") => {
  const fx = c.look[0] - c.pos[0], fy = c.look[1] - c.pos[1], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fy, fz);
  const h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.03, w = h * (9 / 16) * 1.03;
  out.fx.push({ key, cw, ch, draw, x: c.pos[0] + (fx / n) * d, y: c.pos[1] + (fy / n) * d, z: c.pos[2] + (fz / n) * d, w, h, kind });
};
const shadowAt = (out, x, gy, z, w) => fxCard(out, "shadowEll", DR.shadow, x, gy + 0.012, z, w, w * 0.45, { cw: 256, ch: 256, kind: "soft", flat: true });
const mark = (out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); fxCard(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256 }); };
const sign = (out, key, draw, cw, ch, x, y, z, w, h, normal = [0, 0, 1], kind = "lit") => fxCard(out, key, draw, x, y, z, w, h, { cw, ch, normal, kind });
const word = (out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); fxCard(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
const board = (out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; fxCard(out, key, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
const flag = (out, who, t, x, y, z, s = 1.6) => { const k = Math.floor(t * 8) % 8; fxCard(out, "flag" + who + k, (p) => drawFlag(p.g, who, k), x, y, z, s, s, { cw: 512, ch: 512, kind: "lit" }); };
const puff = (out, t, x, y, z, s = 0.6, seed = 0) => { const k = Math.floor((t * 10 + seed) % 7); fxCard(out, "puff" + k, (p) => DR.puff(p, k), x, y, z, s, s, { cw: 256, ch: 256, kind: "basic" }); };

// ---------------- reused 2D drawings ----------------
const DR2 = {
  banner: (p, s, col = "#24356e") => { const g = p.g; g.clearRect(0, 0, 1024, 256); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(14, 24, 996, 208, 18); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 8; g.strokeRect(36, 44, 952, 168); txt(g, s, 512, 134, 130, "Rye", col, "#fbf3dc", 0, 900); },
  fly: (p, k) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.globalAlpha = 0.85; E(g, 50, 44, 24, 14, k % 2 ? -0.5 : -0.9, "#e6f2ff", 4); E(g, 78, 44, 24, 14, k % 2 ? 0.5 : 0.9, "#e6f2ff", 4); g.globalAlpha = 1; E(g, 64, 70, 18, 24, 0, "#2a2a30", 5); E(g, 64, 50, 12, 12, 0, "#c8302e", 3); },
  stink: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); g.strokeStyle = "#7a9a3a"; g.lineWidth = 12; g.lineCap = "round"; for (let i = 0; i < 3; i++) { g.beginPath(); for (let y = 230; y > 30; y -= 10) g.lineTo(60 + i * 68 + Math.sin(y / 26 + k + i) * 16, y); g.stroke(); } },
  confetti: (p, k) => { const g = p.g, W = g.canvas.width, Hh = g.canvas.height; g.clearRect(0, 0, W, Hh); const C = ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a", "#ffffff", "#b07aff"]; for (let i = 0; i < 46; i++) { const x = hh(i, 1) * W, y = ((hh(i, 2) * Hh + k * 30 * (0.6 + hh(i, 3))) % (Hh + 48)) - 24; g.save(); g.translate(x, y); g.rotate(k * 0.7 + i); g.fillStyle = C[i % 6]; g.fillRect(-9, -5, 18, 10); g.restore(); } },
};

// ---------------- extra 2D drawings for this story ----------------
const R = (g, x, y, w, h, r, fill, lw = 8, stroke = INK) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
const poly = (g, pts, fill, lw = 8, stroke = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
const line = (g, pts, col = INK, lw = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); };
// scalloped "bite" carved out of whatever is drawn: a column of circles along x = xc, everything right of it removed (from = "right") or a single bite
const biteCut = (g, xc, W, Hh, r = 34) => { g.save(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.moveTo(W, 0); g.lineTo(xc, 0); for (let y = 0; y < Hh; y += r * 2) g.arc(xc, y + r, r, -Math.PI / 2, Math.PI / 2, true); g.lineTo(W, Hh); g.closePath(); g.fill(); g.restore(); };
const biteAt = (g, x, y, r) => { g.save(); g.globalCompositeOperation = "destination-out"; for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(x + i * r * 0.55, y + Math.abs(i) * r * 0.18, r * 0.42, 0, two); g.fill(); } g.beginPath(); g.arc(x, y - r * 0.25, r * 0.85, 0, two); g.fill(); g.restore(); };

// the plane: a little high-wing two-seater, side view, nose to the LEFT, 1024 x 512, wheels on y 500.
// o.eat 0..1 removes it from the tail forward; o.bite bites the wing tip; o.k = propeller frame; o.toy = yellow toy colours
function drawPlane(g, o = {}) {
  if (!o.noclear) g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; g.lineCap = "round";
  const body = o.toy ? "#ffd23a" : "#f4f4f0", stripe = o.toy ? "#2f6ad8" : "#c8302e", wing = o.toy ? "#d8333a" : "#e8e8e4";
  // gear
  line(g, [[330, 350], [300, 462]], INK, 14); line(g, [[560, 340], [620, 462]], INK, 14); line(g, [[150, 350], [170, 470]], INK, 12);
  for (const [x, y, r] of [[300, 466, 34], [620, 466, 34], [170, 478, 24]]) { E(g, x, y, r, r, 0, "#2a2a30", 8); E(g, x, y, r * 0.4, r * 0.4, 0, "#c9cdd4", 5); }
  // tailplane behind the body
  poly(g, [[840, 262], [1004, 250], [1008, 270], [850, 284]], wing, 8);
  // fuselage
  poly(g, [[110, 300], [130, 240], [200, 228], [300, 214], [360, 164], [560, 160], [622, 214], [880, 250], [940, 120], [1000, 118], [996, 300], [880, 302], [560, 350], [300, 372], [170, 362], [112, 336]], body, 11);
  poly(g, [[130, 318], [560, 322], [992, 272], [992, 292], [560, 342], [150, 340]], stripe, 0);
  poly(g, [[940, 120], [1000, 118], [998, 160], [930, 162]], stripe, 6);
  // windows
  poly(g, [[372, 178], [548, 175], [598, 212], [332, 214]], "#8fc4e8", 8); line(g, [[458, 176], [458, 213]], INK, 7);
  g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.moveTo(390, 182); g.lineTo(430, 182); g.lineTo(410, 208); g.lineTo(370, 208); g.fill();
  // door line, cowling
  line(g, [[340, 220], [340, 340], [430, 345], [440, 220]], "rgba(36,23,38,0.5)", 5); E(g, 425, 280, 6, 4, 0, INK, 0);
  poly(g, [[110, 300], [130, 240], [200, 228], [214, 340], [112, 336]], o.toy ? "#2f6ad8" : "#d8dade", 9);
  // high wing (edge-on) + strut
  R(g, 288, 136, 400, 28, 14, wing, 9); line(g, [[470, 162], [420, 330]], INK, 9); line(g, [[470, 162], [420, 330]], "#c9cdd4", 4);
  // propeller: spinner + spinning blade
  const k = o.k ?? 0, c = Math.cos(k * 1.3);
  E(g, 96, 300, 12, 150, 0, "rgba(220,224,232,0.45)", 0); R(g, 86, 300 - 140 * Math.abs(c), 20, 280 * Math.abs(c) + 4, 10, "#3a3a44", 6);
  E(g, 100, 300, 26, 30, 0, stripe, 8);
  if (o.eat > 0) biteCut(g, 1024 - o.eat * 940, 1024, 512, 30);
  if (o.bite) { biteAt(g, 680, 150, 70); biteAt(g, 990, 200, 60); }
  if (o.chewed) { // crumbs + tooth marks on the bitten edge
    g.fillStyle = "#c9cdd4"; for (let i = 0; i < 9; i++) { const x = 660 + hh(i, 4) * 60, y = 200 + hh(i, 5) * 80; g.fillRect(x, y, 10, 8); } }
}
// a chunk of plane on a fork (white metal with a red stripe edge), 256 x 256
const drawChunk = (g, v = 0) => { g.clearRect(0, 0, 256, 256); g.lineJoin = "round"; poly(g, [[60, 90 + v * 6], [180, 70], [200, 150], [150, 190], [70, 170]], "#f4f4f0", 9); poly(g, [[66, 150], [196, 128], [200, 150], [150, 190], [70, 170]], "#c8302e", 6); for (let i = 0; i < 3; i++) E(g, 90 + i * 34, 104 - i * 4, 6, 6, 0, "#9a9ea6", 4); };
// metal bites on a plate, 512 x 256
const drawPlate = (g, what = "chunks") => { g.clearRect(0, 0, 512, 256); E(g, 256, 170, 230, 70, 0, "#ffffff", 9); E(g, 256, 166, 170, 46, 0, null, 5, "#6aa0d8");
  if (what === "chunks") for (let i = 0; i < 11; i++) { const x = 140 + hh(i, 1) * 230, y = 130 + hh(i, 2) * 50, s = 18 + hh(i, 3) * 18; poly(g, [[x - s, y], [x, y - s * 0.8], [x + s, y - s * 0.2], [x + s * 0.4, y + s * 0.6]], ["#e8e8e4", "#c8302e", "#9a9ea6", "#8fc4e8"][i % 4], 6); }
  if (what === "egg") { E(g, 220, 140, 66, 50, -0.1, "#ffffff", 8); E(g, 225, 140, 30, 26, 0, "#ffc83a", 6); E(g, 320, 146, 60, 46, 0.2, "#ffffff", 8); E(g, 316, 146, 28, 24, 0, "#ffc83a", 6); } };
// electric saw (circular blade), 256 x 256, k = spin frame
const drawSaw = (g, k = 0) => { g.clearRect(0, 0, 256, 256); g.lineJoin = "round"; E(g, 90, 150, 70, 70, 0, "#c9cdd4", 7); g.save(); g.translate(90, 150); g.rotate(k * 0.7); for (let i = 0; i < 16; i++) { g.rotate(two / 16); poly(g, [[66, -6], [80, 0], [66, 6]], "#9a9ea6", 3); } line(g, [[-50, 0], [50, 0]], "rgba(36,23,38,0.4)", 5); line(g, [[0, -50], [0, 50]], "rgba(36,23,38,0.4)", 5); g.restore(); E(g, 90, 150, 14, 14, 0, "#3a3a44", 5);
  R(g, 100, 90, 130, 80, 22, "#e8742a", 8); R(g, 190, 60, 50, 40, 12, "#3a3a44", 7); };
// bottle of mineral oil, 256 x 512
const drawOil = (g) => { g.clearRect(0, 0, 256, 512); g.lineJoin = "round"; poly(g, [[100, 40], [156, 40], [156, 120], [200, 180], [200, 470], [56, 470], [56, 180], [100, 120]], "rgba(232,196,90,0.9)", 9); R(g, 92, 20, 72, 34, 8, "#c8302e", 8); R(g, 56, 250, 144, 130, 6, "#fbf3dc", 7); txt(g, "MINERAL", 128, 290, 40, "Bangers", "#24356e", INK, 0, 130); txt(g, "OIL", 128, 340, 56, "Bangers", "#c8302e", INK, 0, 130); g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(70, 190, 14, 50); };
// bicycle, 512 x 512 (ground y 480)
const drawBike = (g, col = "#d8333a") => { g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; g.lineCap = "round";
  for (const x of [120, 392]) { E(g, x, 380, 96, 96, 0, null, 14); E(g, x, 380, 96, 96, 0, null, 6, "#3a3a44"); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; line(g, [[x + Math.cos(a) * 88, 380 + Math.sin(a) * 88], [x - Math.cos(a) * 88, 380 - Math.sin(a) * 88]], "#9a9ea6", 3); } E(g, x, 380, 10, 10, 0, "#3a3a44", 4); }
  const fr = [[120, 380], [230, 380], [196, 250], [120, 380]]; line(g, fr, INK, 18); line(g, fr, col, 10); const f2 = [[230, 380], [360, 250], [196, 250]]; line(g, f2, INK, 18); line(g, f2, col, 10); line(g, [[360, 250], [392, 380]], INK, 16); line(g, [[360, 250], [392, 380]], col, 8);
  line(g, [[360, 250], [350, 200], [400, 190]], INK, 12); R(g, 160, 222, 80, 24, 12, "#3a3a44", 6); E(g, 230, 380, 22, 22, 0, "#c9cdd4", 6); };
// shopping cart, 512 x 512 (wheels on y 490)
const drawCart = (g) => { g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; g.lineCap = "round";
  poly(g, [[70, 120], [460, 120], [420, 340], [130, 340]], "rgba(200,206,214,0.35)", 12); for (let i = 1; i < 8; i++) { const u = i / 8; line(g, [[70 + u * 390, 120], [130 + u * 290, 340]], "#9a9ea6", 5); } for (let j = 1; j < 4; j++) { const v = j / 4; line(g, [[70 + v * 60, 120 + v * 220], [460 - v * 40, 120 + v * 220]], "#9a9ea6", 5); }
  line(g, [[70, 120], [20, 70]], INK, 14); R(g, 0, 50, 70, 30, 12, "#c8302e", 7); line(g, [[150, 340], [140, 450], [400, 450], [410, 340]], INK, 10);
  for (const x of [150, 390]) { E(g, x, 470, 22, 22, 0, "#2a2a30", 7); } };
// CRT TV, 512 x 512; k = static frame; o.cake = on a cake stand with cream + cherry; o.bite
const drawTV = (g, k = 0, o = {}) => { g.clearRect(0, 0, 512, 512); g.lineJoin = "round";
  if (o.cake) { R(g, 140, 440, 232, 22, 8, "#ffffff", 7); line(g, [[256, 462], [256, 500]], INK, 14); R(g, 196, 494, 120, 16, 6, "#ffffff", 6); }
  line(g, [[256, 140], [180, 40]], INK, 8); line(g, [[256, 140], [340, 50]], INK, 8); E(g, 256, 140, 22, 14, 0, "#3a3a44", 6);
  R(g, 80, 140, 352, 300, 30, "#a0703a", 10); R(g, 108, 170, 236, 236, 40, "#2a2e36", 8);
  for (let i = 0; i < 260; i++) { const x = 120 + hh(i, k) * 212, y = 182 + hh(i, k + 7) * 212, c = Math.floor(hh(i, k + 3) * 200 + 55); g.fillStyle = `rgb(${c},${c},${c})`; g.fillRect(x, y, 8, 5); }
  E(g, 390, 230, 20, 20, 0, "#e8c45a", 6); E(g, 390, 300, 20, 20, 0, "#e8c45a", 6); for (let i = 0; i < 4; i++) line(g, [[372, 350 + i * 16], [410, 350 + i * 16]], INK, 4);
  if (o.cake) { g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(84, 150); for (let x = 84; x <= 428; x += 43) g.quadraticCurveTo(x + 21, 220, x + 43, 150); g.lineTo(428, 120); g.lineTo(84, 120); g.closePath(); g.fill(); g.stroke(); E(g, 256, 102, 24, 24, 0, "#d8202e", 7); line(g, [[256, 80], [276, 50]], "#4f8a3a", 6); }
  if (o.bite) biteAt(g, 430, 170, 110); };
// pair of skis, 512 x 512
const drawSkis = (g) => { g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; for (const [x, c] of [[200, "#d8333a"], [300, "#2f6ad8"]]) { g.beginPath(); g.moveTo(x - 22, 500); g.lineTo(x - 22, 90); g.quadraticCurveTo(x - 22, 20, x + 10, 14); g.quadraticCurveTo(x + 22, 40, x + 22, 90); g.lineTo(x + 22, 500); g.closePath(); g.fillStyle = c; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke(); R(g, x - 30, 290, 60, 50, 10, "#3a3a44", 6); } };
// chandelier, 512 x 512, k flicker
const drawChand = (g, k = 0) => { g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; line(g, [[256, 0], [256, 170]], INK, 8); for (let i = 0; i < 6; i++) E(g, 256, 20 + i * 26, 7, 12, 0, null, 5, "#c89a3a");
  E(g, 256, 300, 190, 46, 0, null, 14); E(g, 256, 300, 190, 46, 0, null, 7, "#e8c45a"); line(g, [[256, 170], [256, 360]], INK, 14); E(g, 256, 380, 30, 34, 0, "#e8c45a", 8);
  for (let i = 0; i < 7; i++) { const x = 86 + i * 57, y = 300 + Math.sin((i / 6) * Math.PI) * 40 - 30; R(g, x - 10, y - 60, 20, 60, 4, "#fbf3dc", 5); const f = 1 + 0.25 * Math.sin(k * 2 + i); g.fillStyle = "#ffb43a"; g.beginPath(); g.ellipse(x, y - 76, 9 * f, 18 * f, 0, 0, two); g.fill(); g.fillStyle = "#fff4b0"; g.beginPath(); g.ellipse(x, y - 72, 4, 9, 0, 0, two); g.fill(); }
  for (let i = 0; i < 9; i++) { const x = 90 + i * 41; line(g, [[x, 330], [x, 372]], "#bfe6ff", 4); E(g, x, 380, 8, 12, 0, "#dff4ff", 4); } };
// coffin seen from the front-top, lying on the table, 1024 x 512; o.handles = how many of the 3 handles are still on; o.bite
const drawCoffin = (g, o = {}) => { g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; const n = o.handles ?? 3;
  poly(g, [[60, 300], [260, 160], [940, 180], [990, 300], [940, 420], [260, 440]], "#7a4a2a", 11); poly(g, [[140, 300], [290, 200], [900, 214], [940, 300], [900, 386], [290, 400]], "#9a6438", 7);
  line(g, [[140, 300], [940, 300]], "rgba(36,23,38,0.35)", 6); R(g, 470, 270, 90, 60, 10, "#e8c45a", 6);
  for (let i = 0; i < 3; i++) { const x = 330 + i * 230; if (i < n) { R(g, x - 50, 430, 100, 26, 12, "#e8c45a", 7); line(g, [[x - 40, 440], [x - 40, 416]], INK, 7); line(g, [[x + 40, 440], [x + 40, 416]], INK, 7); } else { E(g, x - 40, 424, 6, 6, 0, INK, 0); E(g, x + 40, 424, 6, 6, 0, INK, 0); } }
  if (o.bite) biteAt(g, 990, 260, 120); };
// a single brass handle (in a hand), 256 x 128
const drawHandle = (g) => { g.clearRect(0, 0, 256, 128); R(g, 28, 60, 200, 40, 18, "#e8c45a", 8); line(g, [[48, 70], [48, 20]], INK, 9); line(g, [[208, 70], [208, 20]], INK, 9); };
// the record plaque: brass plate on a wooden shield, 512 x 512; o.bite
const drawPlaque = (g, o = {}) => { g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; R(g, 40, 50, 432, 412, 40, "#7a4a2a", 10); const gr = g.createLinearGradient(80, 90, 430, 420); gr.addColorStop(0, "#fff0a0"); gr.addColorStop(0.45, "#e0b040"); gr.addColorStop(1, "#b07a20"); R(g, 80, 90, 352, 332, 20, gr, 8);
  txt(g, "WORLD RECORD", 256, 170, 54, "Bangers", "#5a3a10", INK, 0, 320); line(g, [[120, 212], [392, 212]], "#5a3a10", 5); txt(g, "STRANGEST", 256, 270, 66, "Bangers", "#5a3a10", INK, 0, 320); txt(g, "DIET", 256, 340, 76, "Bangers", "#5a3a10", INK, 0, 320);
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.moveTo(110, 110); g.lineTo(170, 110); g.lineTo(110, 200); g.fill(); if (o.bite) biteAt(g, 470, 90, 150); };
const drawBanana = (g) => { g.clearRect(0, 0, 256, 256); g.lineJoin = "round"; g.beginPath(); g.moveTo(40, 80); g.quadraticCurveTo(60, 220, 220, 190); g.quadraticCurveTo(110, 180, 70, 70); g.closePath(); g.fillStyle = "#ffd23a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke(); R(g, 30, 50, 34, 30, 8, "#6a4a2a", 6); E(g, 222, 190, 8, 8, 0, "#3a2a1a", 0); };
// menu card, 512 x 768; hi = highlighted line
const drawMenu = (g, items, hi = -1) => { g.clearRect(0, 0, 512, 768); R(g, 16, 16, 480, 736, 24, "#fbf3dc", 10); g.strokeStyle = "#c8302e"; g.lineWidth = 6; g.strokeRect(46, 46, 420, 676); txt(g, "MENU", 256, 120, 96, "Rye", "#c8302e", INK, 0, 380);
  items.forEach(([a, b], i) => { const y = 250 + i * 150; if (i === hi) { g.fillStyle = "rgba(255,226,60,0.75)"; g.fillRect(64, y - 54, 384, 128); } txt(g, a, 256, y - 18, 42, "AlfaSlab", "#5a3a20", INK, 0, 380); txt(g, b, 256, y + 36, 58, "Bangers", "#24356e", INK, 0, 380); }); };
// cartoon x-ray of a belly full of metal, 512 x 512
const drawXray = (g) => { g.clearRect(0, 0, 512, 512); R(g, 20, 20, 472, 472, 24, "#16243a", 10); g.strokeStyle = "#cfe6ff"; g.lineWidth = 8; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(256, 120 + i * 34, 170 - i * 6, 26, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke(); } line(g, [[256, 60], [256, 470]], "#cfe6ff", 12);
  g.strokeStyle = "rgba(207,230,255,0.7)"; g.lineWidth = 6; g.beginPath(); g.ellipse(270, 360, 120, 90, 0.2, 0, two); g.stroke(); E(g, 230, 360, 34, 34, 0, null, 6, "#ffffff"); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI; line(g, [[230 + Math.cos(a) * 30, 360 + Math.sin(a) * 30], [230 - Math.cos(a) * 30, 360 - Math.sin(a) * 30]], "#ffffff", 3); }
  for (const [x, y, r] of [[310, 330, 0.5], [320, 400, -0.6], [190, 410, 1.2]]) { g.save(); g.translate(x, y); g.rotate(r); R(g, -8, -30, 16, 60, 4, "#ffffff", 0); R(g, -16, -38, 32, 14, 3, "#ffffff", 0); g.restore(); } txt(g, "???", 360, 450, 60, "Bangers", "#ffe85a", INK, 6, 200); };
// red warning sign, 1024 x 512
const drawWarn = (g) => { g.clearRect(0, 0, 1024, 512); R(g, 20, 20, 984, 472, 40, "#d8333a", 14); R(g, 50, 50, 924, 412, 26, null, 8, "#ffffff"); poly(g, [[170, 120], [270, 300], [70, 300]], "#ffd23a", 10); txt(g, "!", 170, 240, 120, "Bangers", INK, INK, 0, 80);
  txt(g, "DO NOT TRY THIS", 600, 180, 120, "Bangers", "#ffffff", INK, 12, 700); txt(g, "AT HOME!", 600, 330, 150, "Bangers", "#ffe85a", INK, 12, 700); };
// theatre marquee, 1024 x 512, k = bulb chase frame
const drawMarquee = (g, k = 0) => { g.clearRect(0, 0, 1024, 512); R(g, 20, 30, 984, 452, 30, "#8a1e2a", 12);
  for (let i = 0; i < 40; i++) { const t = i / 40, per = 2 * (944 + 412); let d = t * per, x, y; if (d < 944) { x = 40 + d; y = 50; } else if (d < 944 + 412) { x = 984; y = 50 + d - 944; } else if (d < 1888 + 412) { x = 984 - (d - 944 - 412); y = 462; } else { x = 40; y = 462 - (d - 1888 - 412); } E(g, x, y, 12, 12, 0, (i + k) % 3 ? "#fff4b0" : "#ff9a2a", 4); }
  txt(g, "MONSIEUR", 512, 150, 120, "Rye", "#ffe08a", INK, 10, 860); txt(g, "MANGETOUT", 512, 280, 150, "Rye", "#ffe08a", INK, 12, 880); R(g, 200, 340, 624, 90, 20, "#fbf3dc", 7); txt(g, "= MISTER EAT ALL", 512, 388, 70, "Bangers", "#c8302e", INK, 0, 580); };
// calendar sheet, 256 x 256
const drawCal = (g, s) => { g.clearRect(0, 0, 256, 256); R(g, 20, 20, 216, 216, 16, "#ffffff", 8); g.fillStyle = "#d8333a"; g.fillRect(24, 24, 208, 58); line(g, [[20, 82], [236, 82]], INK, 6); for (const x of [70, 186]) E(g, x, 24, 10, 14, 0, "#c9cdd4", 5); txt(g, s, 128, 160, 80, "Bangers", INK, INK, 0, 190); };
// thought bubble full of non-food, 512 x 512
const drawThought = (g) => { g.clearRect(0, 0, 512, 512); for (const [x, y, r] of [[70, 470, 18], [110, 420, 30]]) E(g, x, y, r, r, 0, "#ffffff", 7); g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); for (let i = 0; i < 12; i++) { const a = (i / 12) * two; g.arc(290 + Math.cos(a) * 160, 220 + Math.sin(a) * 120, 60, 0, two); } g.fill(); g.stroke(); E(g, 290, 220, 200, 150, 0, "#ffffff", 0);
  // bolt, nail, wrench, light bulb
  g.save(); g.translate(200, 200); g.rotate(-0.5); R(g, -12, -10, 24, 110, 4, "#9a9ea6", 6); poly(g, [[-34, -30], [34, -30], [40, 0], [-40, 0]], "#9a9ea6", 6); g.restore();
  g.save(); g.translate(330, 150); g.rotate(0.6); R(g, -6, -60, 12, 120, 3, "#c9cdd4", 5); R(g, -20, -70, 40, 14, 4, "#c9cdd4", 5); g.restore();
  g.save(); g.translate(360, 280); g.rotate(-0.3); R(g, -70, -12, 140, 24, 10, "#c9cdd4", 6); E(g, -80, 0, 26, 26, 0, "#c9cdd4", 6); g.restore(); E(g, 260, 300, 30, 30, 0, "#ffe85a", 6); };
// drool / sweat drop, 128 x 128
const drawDrop = (g, col = "#8fd0ff") => { g.clearRect(0, 0, 128, 128); g.beginPath(); g.moveTo(64, 10); g.quadraticCurveTo(110, 80, 64, 118); g.quadraticCurveTo(18, 80, 64, 10); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); };
// crumbs / metal shards, 128 x 128, v = variant
const drawShard = (g, v) => { g.clearRect(0, 0, 128, 128); poly(g, [[20, 60], [70, 18], [110, 50], [80, 108]], ["#e8e8e4", "#c8302e", "#9a9ea6", "#e8c45a"][v % 4], 7); };
// Guinness-free open record book, 1024 x 512
const drawBook = (g) => { g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; R(g, 30, 40, 964, 440, 30, "#24356e", 12); poly(g, [[60, 70], [500, 90], [500, 460], [60, 440]], "#fbf3dc", 8); poly(g, [[964, 70], [524, 90], [524, 460], [964, 440]], "#fbf3dc", 8);
  txt(g, "WORLD", 280, 170, 80, "AlfaSlab", "#24356e", INK, 0, 380); txt(g, "RECORDS", 280, 260, 80, "AlfaSlab", "#24356e", INK, 0, 380); for (let i = 0; i < 4; i++) line(g, [[110, 330 + i * 28], [450, 334 + i * 28]], "rgba(36,23,38,0.3)", 6);
  txt(g, "ATE A WHOLE", 744, 170, 66, "Bangers", "#c8302e", INK, 0, 380); txt(g, "AIRPLANE", 744, 250, 80, "Bangers", "#c8302e", INK, 0, 380); g.save(); g.translate(600, 300); g.scale(0.28, 0.28); drawPlane(g, { k: 0, noclear: true }); g.restore(); line(g, [[860, 390], [890, 420], [950, 350]], "#3a9a3a", 16); };
const drawToy = (g) => { g.clearRect(0, 0, 512, 256); g.save(); g.scale(0.5, 0.5); drawPlane(g, { toy: true, noclear: true, k: 2 }); g.restore(); };

// ---------------- props drawn on people's cards (adult rig: card 600 x 1000 px, sole y 975, ~463 px per metre, body centre x 300) ----------------
const oc = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")); return c; };
const napkin = (g, H) => { const y = H.chin + 6, cx = 300; poly(g, [[cx - 66, y], [cx + 66, y], [cx + 8, y + 150], [cx - 8, y + 150]], "#ffffff", 7); E(g, cx, y + 4, 22, 12, 0, "#ffffff", 6); };
const fork = (g, x, y, ang = -0.4) => { g.save(); g.translate(x, y); g.rotate(ang); R(g, -7, -10, 14, 120, 6, "#c9cdd4", 6); R(g, -22, -54, 44, 18, 6, "#c9cdd4", 6); for (let i = -1; i <= 1; i++) R(g, -22 + 17 * (i + 1), -110, 10, 60, 4, "#c9cdd4", 5); g.restore(); };
const XL = {
  /** the eater: napkin always; what = fork | chunk | saw | oil | bike | skis | handle | banana | plaque | cutlery */
  mich: (what, v = 0) => (p) => { const H = p.hands; if (!H) return; const g = p.g; napkin(g, H);
    const r = H.r, l = H.l;
    if (what === "fork" && r) fork(g, r[0], r[1], -0.3);
    if (what === "chunk" && r) { fork(g, r[0], r[1], -0.3); g.drawImage(oc(256, 256, (q) => drawChunk(q, v)), r[0] - 110, r[1] - 200, 170, 170); }
    if (what === "cutlery") { if (r) fork(g, r[0], r[1], -0.25); if (l) { g.save(); g.translate(l[0], l[1]); g.rotate(0.25); R(g, -7, -110, 14, 220, 6, "#c9cdd4", 6); g.restore(); } }
    if (what === "saw" && r) g.drawImage(oc(256, 256, (q) => drawSaw(q, v)), r[0] - 150, r[1] - 150, 230, 230);
    if (what === "oil" && r) { g.save(); g.translate(r[0], r[1]); g.rotate(2.6); g.drawImage(oc(256, 512, drawOil), -50, -150, 100, 200); g.restore(); }
    if (what === "bike" && r) g.drawImage(oc(512, 512, (q) => drawBike(q)), r[0] - 160, r[1] - 250, 300, 300);
    if (what === "handle" && r) g.drawImage(oc(256, 128, drawHandle), r[0] - 80, r[1] - 50, 160, 80);
    if (what === "banana" && r) g.drawImage(oc(256, 256, drawBanana), r[0] - 90, r[1] - 120, 180, 180);
    if (what === "skis" && l && r) { g.drawImage(oc(512, 512, drawSkis), (l[0] + r[0]) / 2 - 220, Math.min(l[1], r[1]) - 420, 440, 440); }
  },
  /** stethoscope on a doctor + a clipboard in the left hand */
  doc: (clip = true) => (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.chin + 20; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(256, y); g.quadraticCurveTo(300, y + 160, 344, y); g.stroke(); E(g, 300, y + 140, 16, 16, 0, "#c9cdd4", 6);
    if (clip && H.l) { R(g, H.l[0] - 46, H.l[1] - 70, 92, 120, 8, "#a0703a", 6); R(g, H.l[0] - 36, H.l[1] - 56, 72, 96, 4, "#ffffff", 4); for (let i = 0; i < 4; i++) line(g, [[H.l[0] - 26, H.l[1] - 40 + i * 20], [H.l[0] + 26, H.l[1] - 40 + i * 20]], "rgba(36,23,38,0.4)", 4); } },
  plaque: (bite) => (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(oc(512, 512, (q) => drawPlaque(q, { bite })), H.r[0] - 90, H.r[1] - 160, 180, 180); },
};
const MICH = { jacket: "#2f4f9a", pants: "#2e3442", boots: INK, hat: "hair", hair: "#2a201a", skin: "#f0d0b4", moustache: "#2a201a" };
const DOC = (v) => ({ jacket: "#f4f4f0", pants: ["#5a6a7a", "#3a3f52"][v % 2], boots: INK, hat: "hair", hair: ["#9a9aa0", "#5a3a20"][v % 2], skin: ["#f0d0b4", "#c99067"][v % 2], ...(v % 2 ? {} : { moustache: "#9a9aa0" }), build: v % 2 ? "adult" : "stout" });
const HOST = { jacket: "#24356e", pants: "#24356e", boots: INK, hat: "hair", hair: "#c89a4a", skin: "#f2d2b6" };
const FOLK = (v) => { const c = ["#3f6fb5", "#c25a7a", "#5d7a3a", "#d9a441", "#2f5f6a", "#7b5ac9", "#e8742a"][v % 7], sk = ["#f2d2b6", "#f5c9a0", "#d9a77c", "#c99067", "#ecd0b6"][v % 5];
  return { jacket: c, pants: ["#3b3f52", "#5a4a3a", "#2e3a4a"][v % 3], boots: "#4a3426", skin: sk, hat: v % 4 === 0 ? "cap" : "hair", cap: "#c8302e", hair: ["#4a3020", "#2a201a", "#c89a4a"][v % 3], ...(v % 3 === 2 ? { moustache: "#4a3020" } : {}) }; };

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[0];
function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const [ax, , az] = AIR, a_ = (x, y, z) => [ax + x, y, az + z];
  const day = { light: "day", sunAz: 210, sunEl: 50, fogFar: 2200 };
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const TY = 0.75, MZ = -0.9, PZ = -9.5, RW = 0.10;
  const ppl = (out, i, o, x, y, z, opt = {}) => out.places.push(pl(i, o, ax + x, y, az + z, opt));
  const fx = (out, key, draw, x, y, z, w, h, o = {}) => fxCard(out, key, draw, ax + x, y, az + z, w, h, o);
  const mk = (out, s, x, y, z, u, size, col) => mark(out, s, ax + x, y, az + z, u, size, col);
  const wd = (out, s, col, x, y, z, u, w) => word(out, s, col, ax + x, y, az + z, u, w);
  const tag = (out, key, a, b, col, x, y, z, u, w = 1.1, nrm = [0, 0, 1]) => { if (u > 0) sign(out, key, (p) => DR.nameTag(p, a, b, col), 1024, 256, ax + x, y, az + z, w * u, w * 0.25 * u, nrm, "basic"); };
  const bd = (out, key, n, label, col, x, y, z, u, w) => board(out, key, n, label, col, ax + x, y, az + z, u, w);
  const confetti = (out, c, t) => { const k = Math.floor(t * 12) % 24; screenCard(out, c, "conf" + k, (p) => DR2.confetti(p, k), 0.5, 576, 1024, "basic"); };
  const sparkle = (out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) fx(out, "spark", DR.spark, x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  // big set pieces
  const plane = (out, o = {}, x = 0, z = PZ, w = 8.4) => { const k = o.k ?? 0, key = "plane" + Math.round((o.eat ?? 0) * 40) + (o.bite ? "b" : "") + (k % 4);
    fx(out, key, (p) => drawPlane(p.g, { ...o, k: k % 4 }), x, RW + w * 0.25 - w * 0.5 * (12 / 512), z, w, w / 2, { cw: 1024, ch: 512, kind: "lit", normal: [0, 0, 1] }); shadowAt(out, ax + x - w * 0.05, RW, az + z + 0.4, w * 0.8); };
  const onTable = (out, key, draw, cw, ch, x, w, h, z = -0.1, o = {}) => fx(out, key, draw, x, TY + h / 2 - (o.sink ?? 0.02) * h, z, w, h, { cw, ch, kind: "lit", ...o });
  const plateOn = (out, what, x = 0, z = 0.05, w = 0.9) => onTable(out, "plate" + what, (p) => drawPlate(p.g, what), 512, 256, x, w, w / 2, z, { sink: 0.22 });
  const shards = (out, t, t0, x, y, z, n = 8, sp = 1.4) => { const e = t - t0; if (e < 0 || e > 1.2) return; for (let i = 0; i < n; i++) { const a = hh(i, 1) * two, v = sp * (0.6 + hh(i, 2) * 0.8); const yy = y + (1.6 + hh(i, 3)) * e - 4.5 * e * e; if (yy < 0) continue;
    fx(out, "shard" + (i % 4), (p) => drawShard(p.g, i % 4), x + Math.cos(a) * v * e, yy, z + 0.2 + Math.abs(Math.sin(a)) * 0.3 * e, 0.09, 0.09, { cw: 128, ch: 128, kind: "basic", rot: e * 9 + i }); } };
  const mich = (out, what, v, x, z, opt = {}) => ppl(out, 1, { ...MICH, xk: what + v }, x, 0, z, { extra: XL.mich(what, v), ...opt });
  const chewE = (t) => (Math.floor(t * 7) % 2 ? "chew" : "laugh");
  const crowd = (out, t, mood, n = 2) => { const P2 = [[-2.4, -2.2], [2.5, -2.4], [-3.4, -2.9], [3.5, -3.0]]; for (let k = 0; k < n; k++) { const [x, z] = P2[k];
    ppl(out, 20 + k, FOLK(k + 1), x, 0, z, mood === "shock" ? { expr: k % 2 ? "gasp" : "shock", arms: { l: ["head", 1], r: ["head", 1] }, headTilt: Math.sin(t * 9 + k) * 4 } : mood === "clap" ? { expr: k % 2 ? "laugh" : "grin", arms: { l: [Math.sin(t * 16 + k) > 0 ? "out" : "hold", 1], r: [Math.sin(t * 16 + k) > 0 ? "out" : "hold", 1] } } : { expr: "nervous", arms: { r: ["face", 1] } }); } };

  // ---- the hero (shot 1 and the loop): Michel behind the banquet table, a chunk of plane on his fork, chomping; the bitten plane behind him
  const heroStage = (t, out, loopK = 1) => { plane(out, { bite: true, chewed: true, k: Math.floor(t * 30) });
    const up = loopK; mich(out, "chunk", 0, 0, MZ, { expr: loopK < 0.98 ? "sly" : chewE(t), arms: { r: ["face", up], l: ["hips", 1] }, headTilt: Math.sin(t * 8) * 3 });
    plateOn(out, "chunks", 0.55, 0.05, 0.7); crowd(out, t, "shock");
    if (loopK >= 0.98) { shards(out, t, Math.floor(t / 0.6) * 0.6, 0.05, 1.55, MZ + 0.1, 6, 1.0); wd(out, "CRUNCH!", "#ff8a2a", 0.75, 1.5, MZ + 0.5, 1, 0.8); } };
  const heroCam = push(a_(0.45, 1.3, 2.3), a_(-0.1, 1.75, -6), a_(0.4, 1.3, 1.9), a_(-0.1, 1.8, -6), 52, 2.0);
  // 1 A whole airplane… : already chomping on frame 0
  shot({ a: 0, ...day, cam: heroCam, cInf: 1.0, focus: a_(0, 1.3, MZ), shadowR: 14, stage(t, out) { heroStage(t, out, 1); } });
  kick1(0.05);
  // 2 this man ate it.: close on Michel chewing, name tag slides in
  shot({ at: S("this man"), ...day, cam: push(a_(0.25, 1.45, 1.9), a_(0, 1.45, MZ), a_(0.2, 1.45, 1.6), a_(0, 1.46, MZ), 42, 1.4), cInf: 2.2, focus: a_(0, 1.4, MZ), shadowR: 8,
    stage(t, out) { plane(out, { bite: true, k: Math.floor(t * 30) }); mich(out, "chunk", 1, 0, MZ, { expr: chewE(t), arms: { r: ["face", 1], l: ["hips", 1] } });
      tag(out, "tagMich", "MICHEL LOTITO", "THE MAN WHO EATS METAL", "#c0353a", 0, 1.0, MZ + 1.1, smooth((t - T("man") + 0.05) / 0.3), 0.52); } });
  // 3 Not a toy.: a toy plane on the table, Michel waves a finger: NOPE
  shot({ at: S("Not a"), ...day, cam: push(a_(-0.6, 1.25, 2.2), a_(0, 1.1, MZ), a_(-0.5, 1.25, 1.9), a_(0, 1.12, MZ), 46, 1.1), cInf: 1.8, focus: a_(0, 1.0, -0.2), shadowR: 8,
    stage(t, out) { plane(out, { bite: true }); onTable(out, "toy", (p) => drawToy(p.g), 512, 256, -0.2, 0.8, 0.4, 0.0, { rot: Math.sin(t * 5) * 0.08 });
      mich(out, "fork", 0, 0.1, MZ, { expr: "annoyed", arms: { r: ["point", 1], l: ["hips", 1] }, headTilt: Math.sin(t * 14) * 5 });
      wd(out, "NOT A TOY!", "#d8333a", -0.3, 1.75, 0.0, (t - T("toy") + 0.1) * 2.5, 1.0); } });
  // 4 A real plane.: wide, the whole plane on the runway, propeller spinning
  shot({ at: S("A real"), ...day, cam: push(a_(1.6, 1.95, 2.3), a_(0, 1.9, PZ), a_(1.3, 1.95, 1.8), a_(0, 2.0, PZ), 62, 1.4), cInf: 0.8, focus: a_(0, 2, PZ), shadowR: 18,
    stage(t, out) { plane(out, { k: Math.floor(t * 30) }); wd(out, "A REAL PLANE!", "#2f6ad8", 1.2, 3.3, PZ + 3, (t - T("plane") + 0.1) * 2.5, 2.6); } });
  // 5 Guinness says so.: the record book pops open, sparkles: OFFICIAL!
  shot({ at: S("Guinness says"), ...day, cam: push(a_(0, 1.4, 3.1), a_(0, 1.2, -0.1), a_(0, 1.38, 2.8), a_(0, 1.2, -0.1), 46, 1.4), cInf: 2, focus: a_(0, 1.1, -0.1), shadowR: 8,
    stage(t, out) { const u = smooth((t - S("Guinness says")) / 0.4); onTable(out, "book", (p) => drawBook(p.g), 1024, 512, 0, 1.3 * (0.5 + 0.5 * u), 0.65 * (0.5 + 0.5 * u), -0.1, { sink: 0 });
      mich(out, "fork", 0, 0.75, MZ, { expr: "proud", arms: { l: ["point", 1], r: ["hips", 1] } }); sparkle(out, t, 0, 1.2, -0.05, 0.12, 4);
      wd(out, "OFFICIAL!", "#c8302e", -0.3, 1.6, 0.0, (t - T("so") + 0.05) * 2.5, 0.8); } });
  // 6 He sawed it up…: at the plane's tail with an electric saw, sparks and shards fly
  shot({ at: S("He sawed"), ...day, cam: push(a_(5.6, 1.4, -4.2), a_(3.4, 1.6, PZ), a_(5.2, 1.4, -4.6), a_(3.4, 1.6, PZ), 48, 0.9), cInf: 1.6, focus: a_(3.5, 1.4, PZ + 1), shadowR: 10,
    stage(t, out) { plane(out, { eat: 0.12 }); mich(out, "saw", Math.floor(t * 20) % 8, 3.2, PZ + 1.1, { expr: "grin", arms: { r: ["out", 1], l: ["hold", 1] }, headTilt: Math.sin(t * 20) * 2 });
      shards(out, t, Math.floor(t / 0.35) * 0.35, 2.5, 1.2, PZ + 1.0, 6, 1.6); wd(out, "BZZZT!", "#ff8a2a", 4.2, 2.3, PZ + 1.2, (t - T("sawed") + 0.05) * 2.5, 1.2); } });
  kick1(T("sawed") + 0.03);
  // 7 …into bite-sized chunks…: the plate of plane bits
  shot({ at: S("into bite-sized"), ...day, cam: push(a_(0.1, 1.15, 1.5), a_(0, 0.95, 0), a_(0.1, 1.12, 1.3), a_(0, 0.95, 0), 46, 1.0), cInf: 3, focus: a_(0, 0.8, 0.05), shadowR: 6,
    stage(t, out) { plateOn(out, "chunks", 0, 0.05, 0.9); mich(out, "cutlery", 0, 0, MZ, { expr: "lick", arms: { r: ["shoulder", 1], l: ["shoulder", 1] } }); sparkle(out, t, 0, 0.85, 0.1, 0.1, 3);
      wd(out, "BITE-SIZED!", "#2f6ad8", 0, 1.05, 0.1, (t - T("bite-sized") + 0.05) * 2.5, 0.45); } });
  // 8 drank mineral oil…: chugging the bottle
  shot({ at: S("drank"), ...day, cam: push(a_(-0.3, 1.45, 1.4), a_(0, 1.45, MZ), a_(-0.25, 1.45, 1.15), a_(0, 1.47, MZ), 44, 0.9), cInf: 2.5, focus: a_(0, 1.4, MZ), shadowR: 8,
    stage(t, out) { plane(out, { eat: 0.15 }); mich(out, "oil", 0, 0, MZ, { expr: "chew", arms: { r: ["face", 1], l: ["hips", 1] }, headTilt: -8 });
      wd(out, "GLUG GLUG", "#e8a42a", 0.5, 1.85, MZ + 0.3, (t - T("drank") + 0.05) * 2.5, 0.8); } });
  // 9 …and swallowed every piece whole.: chunk to mouth: GULP!
  shot({ at: S("and swallowed"), ...day, cam: push(a_(0.3, 1.5, 1.2), a_(0, 1.5, MZ), a_(0.25, 1.5, 0.95), a_(0, 1.52, MZ), 40, 1.2), cInf: 2.5, focus: a_(0, 1.5, MZ), shadowR: 8,
    stage(t, out) { const tg = T("whole"); plane(out, { eat: 0.2 }); mich(out, t < tg ? "chunk" : "fork", 2, 0, MZ, { expr: t < tg ? "gasp" : "relief_open", arms: { r: ["face", 1], l: ["hips", 1] }, sq: t > tg && t < tg + 0.2 ? 1.06 : 1 });
      wd(out, "GULP!", "#2f6ad8", -0.45, 1.85, MZ + 0.4, (t - tg + 0.05) * 2.5, 0.6); } });
  kick1(T("whole") + 0.03);
  // 10 It took him about two years.: the plane gets eaten away as calendar sheets flip 1978 → 1980
  shot({ at: S("It took"), ...day, cam: push(a_(1.2, 1.55, 4.6), a_(0, 1.7, PZ), a_(1.0, 1.6, 4.0), a_(0, 1.8, PZ), 58, 1.8), cInf: 0.9, focus: a_(0, 1.6, PZ), shadowR: 18,
    stage(t, out) { const l = t - S("It took"), e = Math.min(0.85, 0.2 + l * 0.42); plane(out, { eat: e }); mich(out, "fork", 0, 0, MZ, { expr: chewE(t), arms: { r: ["face", 1], l: ["hips", 1] } }); plateOn(out, "chunks", 0.4, 0.05, 0.7);
      const yr = l < 0.5 ? "1978" : l < 1.0 ? "1979" : "1980"; fx(out, "cal" + yr, (p) => drawCal(p.g, yr), -1.0, 1.35, 0.0, 0.5, 0.5, { cw: 256, ch: 256, kind: "basic", rot: Math.sin(t * 8) * 0.1 });
      bd(out, "b2y", "2 YEARS", "OF AIRPLANE", "#c8302e", 0.9, 2.75, -2.5, (t - T("years") + 0.15) * 1.6, 1.6); } });
  // 11 His stage name meant… Mister… Eat… All.: the marquee lights chase; Michel takes a bow
  shot({ at: S("His stage"), ...day, cam: push(a_(0, 1.6, 3.4), a_(0, 2.2, -3), a_(0, 1.6, 3.0), a_(0, 2.25, -3), 50, 2.0), cInf: 1.2, focus: a_(0, 2, -2), shadowR: 12,
    stage(t, out) { plane(out, { eat: 0.85 }); fx(out, "marq" + (Math.floor(t * 8) % 3), (p) => drawMarquee(p.g, Math.floor(t * 8) % 3), 0, 2.75, -2.6, 2.6, 1.3, { cw: 1024, ch: 512, kind: "basic" });
      const tm = T("Mister"); mich(out, "fork", 0, 0, MZ, { expr: t > tm ? "proud" : "grin", arms: { l: ["out", 1], r: ["out", 1] }, headTilt: t > tm ? -6 : 0 }); crowd(out, t, "clap", 2); } });
  // 12 And he meant it.: Michel licks his lips, looking straight at us
  shot({ at: S("And he meant"), ...day, cam: push(a_(0, 1.5, 0.9), a_(0, 1.52, MZ), a_(0, 1.5, 0.7), a_(0, 1.53, MZ), 38, 1.0), cInf: 3, focus: a_(0, 1.5, MZ), shadowR: 8,
    stage(t, out) { plane(out, { eat: 0.85 }); mich(out, "fork", 0, 0, MZ, { expr: Math.floor(t * 3) % 2 ? "lick" : "sly", arms: { r: ["shoulder", 1], l: ["hips", 1] } }); mk(out, "!", 0.32, 1.85, MZ + 0.2, (t - T("meant", T("All"))) * 2, 0.22, "#ff5a7a"); } });
  // 13 For starters? Bicycles.: the menu card, STARTER: BICYCLES, a bike on the table
  const MENU = [["STARTER", "BICYCLES"], ["MAIN", "SHOPPING CARTS"], ["DESSERT", "TV SETS"]];
  const menu = (out, hi, x, y, z, s = 0.8) => fx(out, "menu" + hi, (p) => drawMenu(p.g, MENU, hi), x, y, z, s, s * 1.5, { cw: 512, ch: 768, kind: "lit" });
  shot({ at: S("For starters"), ...day, cam: push(a_(0.2, 1.4, 2.9), a_(0, 1.3, -0.4), a_(0.2, 1.4, 2.6), a_(0, 1.3, -0.4), 48, 1.2), cInf: 1.6, focus: a_(0, 1.2, -0.3), shadowR: 8,
    stage(t, out) { menu(out, t > T("Bicycles") - 0.1 ? 0 : -1, -0.5, 1.45, -0.3, 0.8); mich(out, "fork", 0, 0.35, MZ, { expr: "grin", arms: { r: ["shoulder", 1], l: ["point", 1] } });
      if (t > T("Bicycles") - 0.15) onTable(out, "bike", (p) => drawBike(p.g), 512, 512, 0.45, 0.9, 0.9, 0.0, { sink: 0.05 }); } });
  // 14 Lots of bicycles.: a tower of bikes, one in his hand: MORE!
  shot({ at: S("Lots of"), ...day, cam: push(a_(-0.8, 1.3, 2.6), a_(0, 1.5, -0.5), a_(-0.7, 1.35, 2.2), a_(0, 1.55, -0.5), 50, 1.3), cInf: 1.2, focus: a_(0, 1.3, -0.4), shadowR: 10,
    stage(t, out) { const l = t - S("Lots of"); for (let i = 0; i < 5; i++) { if (l < i * 0.15) continue; fx(out, "bikeT" + (i % 3), (p) => drawBike(p.g, ["#d8333a", "#2f6ad8", "#3a9a3a"][i % 3]), -0.9 + (i % 2) * 0.25, TY + 0.4 + i * 0.32, -0.25 - i * 0.02, 0.85, 0.85, { cw: 512, ch: 512, kind: "lit", rot: (i % 2 ? 0.12 : -0.1) }); }
      mich(out, "bike", 0, 0.45, MZ, { expr: chewE(t), arms: { r: ["face", 1], l: ["hips", 1] } }); shards(out, t, Math.floor(t / 0.5) * 0.5, 0.45, 1.5, MZ + 0.1, 5, 0.9); wd(out, "MORE!", "#3a9a3a", 0.85, 2.0, MZ + 0.3, (t - T("Lots")) * 2.5, 0.7); } });
  // 15 Main course? Shopping carts.: the menu again, a cart rolls in along the table
  shot({ at: S("Main course"), ...day, cam: push(a_(0.2, 1.35, 3.0), a_(0, 1.2, -0.3), a_(0.2, 1.35, 2.7), a_(0, 1.2, -0.3), 50, 1.3), cInf: 1.4, focus: a_(0, 1.1, -0.2), shadowR: 8,
    stage(t, out) { menu(out, 1, -0.5, 1.45, -0.35, 0.8); const l = t - S("Shopping"); if (l > -0.2) onTable(out, "cart", (p) => drawCart(p.g), 512, 512, 2.2 - Math.min(1, glide(l / 0.6)) * 1.7, 0.75, 0.75, 0.0, { sink: 0.03 });
      mich(out, "cutlery", 0, 0.2, MZ, { expr: l > 0.2 ? "laugh" : "grin", arms: { r: ["shoulder", 1], l: ["shoulder", 1] } }); wd(out, "CLANK!", "#9a9ea6", 0.8, 1.6, 0.1, (l - 0.5) * 2.5, 0.7); } });
  // 16 Dessert?: menu: DESSERT: TV SETS, Michel rubs his hands
  shot({ at: S("Dessert"), ...day, cam: push(a_(-0.3, 1.45, 1.8), a_(-0.4, 1.4, -0.3), a_(-0.25, 1.45, 1.6), a_(-0.4, 1.42, -0.3), 46, 1.4), cInf: 2, focus: a_(-0.4, 1.4, -0.3), shadowR: 8,
    stage(t, out) { menu(out, 2, -0.55, 1.45, -0.3); mich(out, "fork", 0, 0.45, MZ, { expr: "sly", arms: { r: ["hold", 1], l: ["hold", 1] }, headTilt: Math.sin(t * 6) * 4 }); mk(out, "?", 0.75, 1.95, MZ + 0.2, (t - T("Dessert")) * 2, 0.3); } });
  // 17 A few TV sets.: a TV on a cake stand, cream and a cherry on top, static on the screen
  shot({ at: S("A few"), ...day, cam: push(a_(0.0, 1.3, 2.9), a_(0, 1.15, -0.1), a_(0.0, 1.3, 2.6), a_(0, 1.15, -0.1), 46, 1.4), cInf: 2, focus: a_(0, 1.1, -0.1), shadowR: 8,
    stage(t, out) { const k = Math.floor(t * 12) % 6; onTable(out, "tvc" + k, (p) => drawTV(p.g, k, { cake: true }), 512, 512, -0.35, 0.55, 0.55, 0.0, { sink: 0.0 }); onTable(out, "tv" + k, (p) => drawTV(p.g, k), 512, 512, -1.0, 0.45, 0.45, -0.15, { sink: 0.0 });
      mich(out, "cutlery", 0, 0.4, MZ, { expr: "lick", arms: { r: ["shoulder", 1], l: ["shoulder", 1] } }); sparkle(out, t, 0, 1.6, 0.05, 0.1, 3); } });
  // 18 Yum… crunchy.: CRUNCH: a bite out of the TV, he chews happily
  shot({ at: S("Yum"), ...day, cam: push(a_(0.0, 1.35, 2.3), a_(0, 1.25, -0.4), a_(0.0, 1.35, 2.05), a_(0, 1.27, -0.4), 46, 1.2), cInf: 2.2, focus: a_(0, 1.3, -0.4), shadowR: 8,
    stage(t, out) { const k = Math.floor(t * 12) % 6; onTable(out, "tvcB" + k, (p) => drawTV(p.g, k, { cake: true, bite: true }), 512, 512, -0.35, 0.55, 0.55, 0.0, { sink: 0.0 });
      mich(out, "fork", 0, 0.35, MZ, { expr: chewE(t), arms: { r: ["shoulder", 1], l: ["hips", 1] } }); shards(out, t, T("crunchy") - 0.1, 0.1, 1.45, MZ + 0.2, 8, 1.0); wd(out, "CRUNCH!", "#ff8a2a", 0.55, 1.85, 0.1, (t - T("crunchy") + 0.05) * 2.5, 0.75); } });
  kick1(T("crunchy") + 0.03);
  // 19 Plus a pair of skis…: holding up a pair of skis
  shot({ at: S("Plus a"), ...day, cam: push(a_(0.5, 1.45, 2.5), a_(0, 1.6, MZ), a_(0.45, 1.45, 2.2), a_(0, 1.62, MZ), 50, 1.0), cInf: 1.5, focus: a_(0, 1.5, MZ), shadowR: 8,
    stage(t, out) { mich(out, "skis", 0, 0, MZ, { expr: "grin", arms: { r: ["up", 1], l: ["up", 1] } }); wd(out, "SKIS?!", "#2f6ad8", 0.8, 2.2, MZ + 0.3, (t - T("skis") + 0.05) * 2.5, 0.8); } });
  // 20 …a chandelier…: the chandelier sways above the table; he looks up, drooling
  shot({ at: S("a chandelier"), ...day, cam: push(a_(0.5, 1.3, 2.5), a_(0, 1.85, -0.4), a_(0.45, 1.3, 2.2), a_(0, 1.9, -0.4), 56, 1.0), cInf: 1.2, focus: a_(0, 2.0, -0.4), shadowR: 8,
    stage(t, out) { fx(out, "chand" + (Math.floor(t * 10) % 6), (p) => drawChand(p.g, Math.floor(t * 10) % 6), 0 + Math.sin(t * 3) * 0.05, 2.55, -0.4, 1.2, 1.2, { cw: 512, ch: 512, kind: "basic", rot: Math.sin(t * 3) * 0.06 });
      mich(out, "fork", 0, 0.1, MZ, { expr: "look_up", arms: { r: ["shoulder", 1], l: ["hips", 1] } }); fx(out, "drop", (p) => drawDrop(p.g), 0.18, 1.35 - ((t * 0.8) % 0.25), MZ + 0.25, 0.07, 0.07, { cw: 128, ch: 128, kind: "basic" }); } });
  // 21 …and a coffin.: a coffin on the table; the onlookers gasp, Michel sly
  shot({ at: S("and a coffin"), ...day, cam: push(a_(0.15, 1.5, 4.0), a_(0.15, 1.15, -0.2), a_(0.15, 1.5, 3.6), a_(0.15, 1.15, -0.2), 50, 1.2), cInf: 1.2, focus: a_(0, 1.0, -0.2), shadowR: 10,
    stage(t, out) { onTable(out, "coffin3", (p) => drawCoffin(p.g, { handles: 3 }), 1024, 512, -0.25, 1.5, 0.75, 0.0, { sink: 0.3 }); mich(out, "cutlery", 0, 0.6, MZ - 0.1, { expr: "sly", arms: { r: ["shoulder", 1], l: ["shoulder", 1] } }); crowd(out, t, "shock", 2);
      wd(out, "A COFFIN?!", "#7a4a2a", -0.3, 1.75, 0.0, (t - T("coffin") + 0.05) * 2.5, 0.95); } });
  // 22 Handles included.: the handles vanish one by one; he crunches a brass handle
  shot({ at: S("Handles"), ...day, cam: push(a_(0.15, 1.45, 3.1), a_(0.15, 1.15, -0.2), a_(0.15, 1.45, 2.8), a_(0.15, 1.15, -0.2), 48, 1.1), cInf: 2, focus: a_(0.1, 1.0, -0.2), shadowR: 8,
    stage(t, out) { const l = t - S("Handles"), n = Math.max(0, 3 - Math.floor(l / 0.35)); onTable(out, "coffin" + n, (p) => drawCoffin(p.g, { handles: n }), 1024, 512, -0.3, 1.5, 0.75, 0.0, { sink: 0.3 });
      mich(out, "handle", 0, 0.55, MZ - 0.1, { expr: chewE(t), arms: { r: ["face", 1], l: ["hips", 1] } }); wd(out, "SNAP!", "#e8c45a", -0.6, 1.5, 0.1, ((l % 0.35) / 0.35) * 1.2, 0.6); } });
  // 23 Doctors checked him out…: two doctors, stethoscope to his chest
  shot({ at: S("Doctors"), ...day, cam: push(a_(0.2, 1.4, 3.0), a_(0, 1.4, MZ), a_(0.2, 1.4, 2.6), a_(0, 1.42, MZ), 50, 1.1), cInf: 1.5, focus: a_(0, 1.4, MZ), shadowR: 10,
    stage(t, out) { mich(out, "fork", 0, 0, MZ, { expr: "proud", arms: { l: ["hips", 1], r: ["hips", 1] } });
      ppl(out, 30, DOC(0), -0.85, 0, MZ - 0.05, { expr: "suspicious", arms: { r: ["point", 1] }, extra: XL.doc(true), headTilt: Math.sin(t * 5) * 4 }); ppl(out, 31, DOC(1), 0.85, 0, MZ - 0.05, { expr: "worried", arms: { l: ["point", 1] }, extra: XL.doc(false) });
      tag(out, "tagDoc", "DOCTORS", "CHECKED EVERYTHING", "#2f6ad8", 0, 0.95, 0.65, smooth((t - T("Doctors") + 0.05) / 0.3), 0.9); } });
  // 24 …totally confused.: the x-ray full of metal, doctors scratching their heads
  shot({ at: S("totally"), ...day, cam: push(a_(0, 1.5, 2.6), a_(0, 1.6, MZ), a_(0, 1.5, 2.3), a_(0, 1.62, MZ), 48, 1.0), cInf: 1.5, focus: a_(0, 1.5, MZ), shadowR: 10,
    stage(t, out) { fx(out, "xray", (p) => drawXray(p.g), 0, 2.15, MZ - 0.4, 0.9, 0.9, { cw: 512, ch: 512, kind: "basic" }); mich(out, "fork", 0, 0, MZ, { expr: "smile", arms: { l: ["hips", 1], r: ["hips", 1] } });
      ppl(out, 30, DOC(0), -0.85, 0, MZ - 0.05, { expr: "dazed", arms: { r: ["head", 1] }, extra: XL.doc(true), headTilt: Math.sin(t * 6) * 6 }); ppl(out, 31, DOC(1), 0.85, 0, MZ - 0.05, { expr: "dazed", arms: { l: ["head", 1], r: ["shrug", 1] }, extra: XL.doc(false), headTilt: -Math.sin(t * 6) * 6 });
      mk(out, "?", -0.85, 2.0, MZ + 0.1, (t - T("confused")) * 3, 0.3); mk(out, "?", 0.85, 2.0, MZ + 0.1, (t - T("confused") - 0.15) * 3, 0.3); } });
  // 25 He had a real condition called pica.: the board
  shot({ at: S("He had"), ...day, cam: push(a_(0.4, 1.5, 3.4), a_(0, 1.9, -0.6), a_(0.35, 1.5, 3.0), a_(0, 1.92, -0.6), 50, 2.0), cInf: 1.2, focus: a_(0, 1.9, -0.5), shadowR: 10,
    stage(t, out) { mich(out, "fork", 0, 0, MZ, { expr: "smile_closed", arms: { l: ["hips", 1], r: ["shrug", 1] } }); bd(out, "bPica", "PICA", "A REAL CONDITION", "#7b5ac9", 0, 2.25, -0.3, (t - T("called") + 0.2) * 1.6, 1.6); } });
  // 26 A craving for things that are not food.: thought bubble of bolts and wrenches, drooling
  shot({ at: S("A craving"), ...day, cam: push(a_(-0.4, 1.6, 2.1), a_(0.2, 1.9, MZ), a_(-0.35, 1.6, 1.8), a_(0.2, 1.95, MZ), 48, 1.6), cInf: 2, focus: a_(0, 1.6, MZ), shadowR: 8,
    stage(t, out) { const u = smooth((t - S("A craving")) / 0.3); fx(out, "thought", (p) => drawThought(p.g), 0.45, 2.1 + 0.03 * Math.sin(t * 4), MZ - 0.05, 1.0 * u, 1.0 * u, { cw: 512, ch: 512, kind: "basic" });
      mich(out, "fork", 0, -0.15, MZ, { expr: "look_up", arms: { r: ["shoulder", 1], l: ["hips", 1] }, headTilt: 6 }); fx(out, "drop", (p) => drawDrop(p.g), -0.05, 1.32 - ((t * 0.8) % 0.25), MZ + 0.25, 0.07, 0.07, { cw: 128, ch: 128, kind: "basic" });
      wd(out, "NOT FOOD!", "#d8333a", -0.6, 1.25, MZ + 0.5, (t - T("food") + 0.05) * 2.5, 0.75); } });
  // 27 But wait, it gets worse.: snap zoom on Michel, eyebrows up: UH-OH
  shot({ at: S("But wait"), ...day, cam: (l) => ({ pos: a_(0, 1.5, 2.6 - glide(l / 0.35) * 1.5), look: a_(0, 1.5, MZ), fov: 44, roll: 0.03 * Math.sin(l * 4) }), cInf: 2.5, focus: a_(0, 1.5, MZ), shadowR: 8,
    stage(t, out) { plane(out, { eat: 0.85 }); mich(out, "fork", 0, 0, MZ, { expr: "sly", arms: { r: ["shoulder", 1], l: ["hips", 1] } }); wd(out, "UH-OH", "#d8333a", 0.4, 1.9, MZ + 0.5, (t - T("worse") + 0.05) * 2.5, 0.6); } });
  kick1(T("wait") + 0.03);
  // 28 Guinness gave him a record for the strangest diet…: the host hands over the plaque, the crowd claps, confetti
  shot({ at: S("Guinness gave"), ...day, cam: push(a_(0.9, 1.45, 3.4), a_(0.2, 1.5, MZ), a_(0.8, 1.45, 3.0), a_(0.2, 1.52, MZ), 52, 2.4), cInf: 1.2, focus: a_(0.2, 1.4, MZ), shadowR: 12,
    stage(t, out, c) { mich(out, "fork", 0, -0.3, MZ, { expr: "proud", arms: { r: ["out", 1], l: ["hips", 1] } }); ppl(out, 40, { ...HOST, xk: "pl" }, 0.75, 0, MZ - 0.05, { expr: "grin", arms: { r: ["out", 1], l: ["hips", 1] }, extra: XL.plaque(false) });
      crowd(out, t, "clap", 4); tag(out, "tagRec", "WORLD RECORD", "STRANGEST DIET", "#e8a42a", 0.2, 2.25, MZ + 0.4, smooth((t - T("strangest") + 0.1) / 0.3), 1.1); if (t > T("record")) confetti(out, c, t); } });
  // 29 …and a shiny brass plaque.: close on the plaque, gleaming
  shot({ at: S("and a shiny"), ...day, cam: push(a_(0.0, 1.3, 1.1), a_(0.0, 1.3, -0.3), a_(0.0, 1.3, 0.95), a_(0.0, 1.31, -0.3), 40, 1.6), cInf: 3, focus: a_(0.15, 1.3, -0.3), shadowR: 8,
    stage(t, out) { fx(out, "plaqueBig", (p) => drawPlaque(p.g, {}), 0.0, 1.3, -0.3, 0.62, 0.62, { cw: 512, ch: 512, kind: "lit", rot: Math.sin(t * 3) * 0.03 }); sparkle(out, t, 0.0, 1.35, -0.25, 0.1, 4); mich(out, "fork", 0, 0.45, MZ, { expr: "lick", arms: { r: ["shoulder", 1], l: ["hips", 1] } }); } });
  // 30 So… he ate the plaque too.: CHOMP: the plaque comes back with a bite out of it; the host is horrified
  const tSo = P("So", T("brass")) - 0.1;
  shot({ at: tSo, ...day, cam: push(a_(0.5, 1.45, 2.3), a_(0.3, 1.5, MZ), a_(0.45, 1.45, 2.0), a_(0.3, 1.52, MZ), 48, 1.6), cInf: 1.8, focus: a_(0.3, 1.45, MZ), shadowR: 10,
    stage(t, out) { const tb = T("plaque", T("ate")) ; ppl(out, 1, { ...MICH, xk: "plq" + (t > tb) }, -0.1, 0, MZ, { expr: t > tb ? chewE(t) : "sly", arms: { r: ["face", 1], l: ["hips", 1] }, extra: (p) => { XL.mich("none")(p); XL.plaque(t > tb)(p); } });
      ppl(out, 40, HOST, 0.85, 0, MZ - 0.05, { expr: t > tb ? "shock" : "smile", arms: t > tb ? { l: ["head", 1], r: ["head", 1] } : { l: ["hips", 1] } });
      shards(out, t, tb, -0.05, 1.5, MZ + 0.2, 6, 0.9); wd(out, "CHOMP!", "#e8a42a", -0.55, 1.95, MZ + 0.4, (t - tb + 0.05) * 2.5, 0.7); } });
  kick1(T("plaque", T("ate")) + 0.03);
  // 31 Please… do not try this at home.: the big warning sign; Michel wags his finger at us
  shot({ at: S("Please"), ...day, cam: push(a_(0, 1.6, 3.6), a_(0, 1.8, -1), a_(0, 1.6, 3.2), a_(0, 1.82, -1), 52, 1.8), cInf: 1.2, focus: a_(0, 1.6, MZ), shadowR: 10,
    stage(t, out) { const u = smooth((t - S("Please")) / 0.3); fx(out, "warn", (p) => drawWarn(p.g), 0, 2.45, -1.6, 2.2 * (0.6 + 0.4 * u), 1.1 * (0.6 + 0.4 * u), { cw: 1024, ch: 512, kind: "basic", rot: Math.sin(t * 7) * 0.02 });
      mich(out, "fork", 0, 0, MZ, { expr: "stern", arms: { r: ["point", 1], l: ["hips", 1] }, headTilt: Math.sin(t * 12) * 4 }); } });
  // 32 Seriously.: close, dead serious
  shot({ at: S("Seriously"), ...day, cam: push(a_(0, 1.5, 0.8), a_(0, 1.5, MZ), a_(0, 1.5, 0.6), a_(0, 1.5, MZ), 38, 1.0), cInf: 3, focus: a_(0, 1.5, MZ), shadowR: 8,
    stage(t, out) { mich(out, "fork", 0, 0, MZ, { expr: "angry", arms: { r: ["point", 1], l: ["hips", 1] } }); mk(out, "!", 0.3, 1.85, MZ + 0.3, (t - T("Seriously")) * 3, 0.22, "#d8333a"); } });
  // 33 Now the craziest part.: slow push in, drumroll
  shot({ at: S("Now the"), ...day, cam: push(a_(-0.6, 1.3, 2.8), a_(0, 1.45, MZ), a_(-0.3, 1.35, 1.6), a_(0, 1.5, MZ), 48, 1.3), cInf: 1.8, focus: a_(0, 1.4, MZ), shadowR: 8,
    stage(t, out) { plane(out, { eat: 0.85 }); mich(out, "cutlery", 0, 0, MZ, { expr: "sly", arms: { r: ["shoulder", 1], l: ["shoulder", 1] }, headTilt: Math.sin(t * 5) * 4 }); mk(out, "?!", 0.4, 1.95, MZ + 0.3, (t - T("craziest")) * 3, 0.3, "#ffd23a"); } });
  // 34 Bananas made him sick.: one banana, his face drops: BLEH!
  shot({ at: S("Bananas"), ...day, cam: push(a_(0.3, 1.45, 1.6), a_(0, 1.45, MZ), a_(0.25, 1.45, 1.35), a_(0, 1.47, MZ), 44, 1.4), cInf: 2.2, focus: a_(0, 1.45, MZ), shadowR: 8,
    stage(t, out) { const ts = T("sick"); mich(out, "banana", 0, 0, MZ, { expr: t > ts - 0.3 ? "pained" : "worried", arms: { r: ["shoulder", 1], l: ["face", 1] }, tilt: t > ts ? -5 : 0, headTilt: Math.sin(t * 10) * 3 });
      wd(out, "BLEH!", "#7ab04a", -0.5, 1.85, MZ + 0.4, (t - ts + 0.1) * 2.5, 0.6); } });
  // 35 Hard-boiled eggs?: a plate of eggs slides toward him; he leans away
  shot({ at: S("Hard-boiled"), ...day, cam: push(a_(-0.2, 1.3, 2.2), a_(0, 1.15, -0.3), a_(-0.2, 1.3, 1.95), a_(0, 1.17, -0.3), 48, 1.2), cInf: 2, focus: a_(0, 1.1, -0.3), shadowR: 8,
    stage(t, out) { const l = t - S("Hard-boiled"); plateOn(out, "egg", -0.6 + Math.min(1, glide(l / 0.5)) * 0.6, 0.05, 0.75); mich(out, "fork", 0, 0.1, MZ, { expr: "nervous", arms: { l: ["out", 1], r: ["out", 1] }, tilt: 6 });
      wd(out, "EWW!", "#7ab04a", 0.6, 1.75, MZ + 0.4, (t - T("eggs") + 0.05) * 2.5, 0.55); } });
  // 36 Also sick.: green, dizzy, sweating
  shot({ at: S("Also sick"), ...day, cam: (l) => ({ pos: a_(0, 1.5, 1.1), look: a_(0, 1.5, MZ), fov: 42, roll: 0.05 * Math.sin(l * 6) }), cInf: 2.5, focus: a_(0, 1.5, MZ), shadowR: 8,
    stage(t, out) { plateOn(out, "egg", 0, 0.05, 0.75); mich(out, "fork", 0, 0, MZ, { expr: "dazed", arms: { l: ["face", 1], r: ["hips", 1] }, tilt: Math.sin(t * 6) * 5 });
      for (let i = 0; i < 2; i++) fx(out, "sweat", (p) => drawDrop(p.g), (i ? 0.3 : -0.3), 1.75 - ((t * 0.6 + i * 0.4) % 0.3), MZ + 0.3, 0.07, 0.07, { cw: 128, ch: 128, kind: "basic" }); wd(out, "SICK!", "#7ab04a", 0.5, 1.95, MZ + 0.4, (t - T("sick", T("Also"))) * 2.5, 0.55); } });
  // 37 But you know what didn't?: loop: the hero view counting back to frame 0, he turns sly and lifts the chunk to his mouth
  shot({ at: S("But you"), ...day, cam: heroCam, cInf: 1.0, focus: a_(0, 1.3, MZ), shadowR: 14, loop: true, stage(t, out) { const k = clamp01((t - S("But you")) / Math.max(0.3, END - S("But you") - 0.25)); heroStage(t, out, 0.35 + 0.65 * k); } });
  SHOTS = D.map((s, i) => ({ ...s, a: s.a ?? s.at, b: i + 1 < D.length ? (D[i + 1].a ?? D[i + 1].at) : END + 0.01 }));
  // a little handheld drift on every shot; the loop shot plays the hero camera backwards to its start, like shot 1's first frame
  SHOTS.forEach((s, i) => { const base = s.cam, ph = (s.loop ? 0 : (s.at ?? s.a ?? 0)) * 1.7, w = 0.008, dur = s.b - s.a; s.cam = (l0, ...r) => { const l = s.loop ? Math.max(0, dur - l0 - 1 / FPS) : l0, c = base(l, ...r);
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
  if (s.stage) s.stage(t, out, c);
  out.places = out.places.filter((pl) => Math.hypot(pl.x - c.pos[0], pl.z - c.pos[2]) > 0.6 || pl.keep);
  return {
    f, t, shot: s.id, light: s.light, grade: s.grade, cam: c, focus: s.focus, cInf: s.cInf ?? 0, props: out.props, veh: out.veh,
    sunK: s.sunK, sunAz: s.sunAz, sunEl: s.sunEl, fwd: s.fwd, fogNear: s.fogNear, fogFar: s.fogFar, shadowR: s.shadowR, near: s.near,
    places: out.places, fx: out.fx, flash: s.flash ? s.flash(t) : 0, fade: 0,
  };
}
