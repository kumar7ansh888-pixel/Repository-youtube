// Shot plan for "The Pig War" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// June 1859, San Juan Island: farmer Lyman Cutlar shoots a British pig in his potatoes; both nations send troops and
// warships; Admiral Baynes refuses to fight "over a pig"; joint occupation for 12 years; the Kaiser rules for the US.
// Hook-first, a cut every ~1.8 s, loop ending (the last shot is shot 1's pig between the two armies again).
import { PIG } from "./world.js";
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

// ---------------- flags ----------------
function unionJack(g, x, y, w, h) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = "#1f3a8a"; g.fillRect(x, y, w, h);
  const d = (lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke(); };
  d(h * 0.2, "#ffffff"); d(h * 0.07, "#d8333a");
  g.fillStyle = "#ffffff"; g.fillRect(x + w / 2 - h * 0.17, y, h * 0.34, h); g.fillRect(x, y + h / 2 - h * 0.17, w, h * 0.34);
  g.fillStyle = "#d8333a"; g.fillRect(x + w / 2 - h * 0.1, y, h * 0.2, h); g.fillRect(x, y + h / 2 - h * 0.1, w, h * 0.2);
  g.restore();
}
function usFlag(g, x, y, w, h) {
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#c8302e"; g.fillRect(x, y + (i * h) / 13, w, h / 13 + 0.5); }
  const cw = w * 0.42, ch = (h * 7) / 13; g.fillStyle = "#24356e"; g.fillRect(x, y, cw, ch);
  g.fillStyle = "#ffffff"; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { g.beginPath(); g.arc(x + (cw * (c + 0.5 + (r % 2) * 0.25)) / 6.3, y + (ch * (r + 0.6)) / 5.4, Math.max(1.5, ch * 0.05), 0, two); g.fill(); }
}
/** a waving flag on a pole, 512 x 512; who = "us" | "uk"; k = wave phase 0..7 */
function drawFlag(g, who, k) {
  g.clearRect(0, 0, 512, 512); g.lineCap = "round";
  g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(40, 20); g.lineTo(40, 512); g.stroke(); g.strokeStyle = "#e8e2d2"; g.lineWidth = 8; g.stroke();
  const fw = 420, fh = 260, oc = document.createElement("canvas"); oc.width = fw; oc.height = fh; const o = oc.getContext("2d");
  if (who === "us") usFlag(o, 0, 0, fw, fh); else unionJack(o, 0, 0, fw, fh);
  const wv = (x) => Math.sin(x / 70 + k * 0.785) * 18 * (x / fw);
  for (let x = 0; x < fw; x += 6) g.drawImage(oc, x, 0, 6, fh, 48 + x, 40 + wv(x), 6.6, fh);
  g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); for (let x = 0; x <= fw; x += 10) g.lineTo(48 + x, 40 + wv(x)); for (let x = fw; x >= 0; x -= 10) g.lineTo(48 + x, 40 + fh + wv(x)); g.closePath(); g.stroke();
}

// ---------------- the pig ----------------
/** 512 x 512, feet on y 498. o = { view: side|front, mood: cute|chew|shock|happy|angel, walk (0..1 or -1), halo, wings, flag } */
function drawPig(g, o = {}) {
  const { view = "side", mood = "cute", walk = -1, halo = false, wings = false } = o;
  g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; g.lineCap = "round";
  const PK = mood === "angel" ? "#fbd6e2" : "#f7b2c0", SH = mood === "angel" ? "#efbccc" : "#e48ea2", SN = "#f490a6";
  const eyes = (pts, sz) => { for (const [ex, ey] of pts) {
    if (mood === "shock") { E(g, ex, ey, sz * 1.3, sz * 1.5, 0, "#ffffff", 5); E(g, ex, ey + 2, sz * 0.55, sz * 0.65, 0, INK, 0); }
    else if (mood === "happy" || mood === "angel") { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(ex, ey + 6, sz, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (mood === "chew") { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(ex, ey - 4, sz, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); }
    else { E(g, ex, ey, sz, sz * 1.15, 0, INK, 0); E(g, ex + sz * 0.3, ey - sz * 0.4, sz * 0.35, sz * 0.4, 0, "#ffffff", 0); } } };
  const wingPair = (cx, cy, sp) => { for (const s of [-1, 1]) { g.save(); g.translate(cx + s * sp, cy); g.scale(s, 1); g.rotate(-0.3); g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(70, -90, 130, -60); g.quadraticCurveTo(110, -30, 120, -10); g.quadraticCurveTo(90, 0, 100, 20); g.quadraticCurveTo(50, 30, 0, 0); g.fill(); g.stroke(); g.restore(); } };
  const haloAt = (x, y, rx) => { g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.ellipse(x, y, rx, rx * 0.27, 0, 0, two); g.stroke(); g.strokeStyle = "#ffd84a"; g.lineWidth = 9; g.stroke(); };
  if (view === "side") {
    const u = walk >= 0 ? Math.sin(walk * two) : 0;
    if (wings) wingPair(250, 250, 10);
    const leg = (x, a, c) => { g.save(); g.translate(x, 400); g.rotate(a); g.fillStyle = c; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-20, -10, 40, 96, 14); g.fill(); g.stroke(); g.fillStyle = "#6a4a4e"; g.fillRect(-18, 70, 36, 14); g.restore(); };
    leg(170, -0.25 * u, SH); leg(330, 0.25 * u, SH);
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(92, 300); g.bezierCurveTo(40, 280, 50, 230, 80, 240); g.bezierCurveTo(105, 250, 90, 280, 62, 268); g.stroke(); g.strokeStyle = PK; g.lineWidth = 8; g.stroke();
    E(g, 248, 330, 168, 112, 0, PK, 10);
    E(g, 220, 380, 110, 40, 0, "rgba(255,255,255,0.18)", 0);
    leg(140, 0.25 * u, PK); leg(300, -0.25 * u, PK);
    E(g, 392, 290, 92, 84, 0, PK, 10);
    for (const [dx, k] of [[-30, 1], [16, 0]]) { g.save(); g.translate(372 + dx, 222); g.rotate(-0.5 + k * 0.3); g.fillStyle = k ? SH : PK; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-26, 10); g.quadraticCurveTo(-6, -70, 30, -50); g.quadraticCurveTo(30, -10, 26, 14); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    E(g, 470, 306, 34, 40, 0, SN, 9); E(g, 478, 296, 6, 10, 0, INK, 0); E(g, 478, 318, 6, 10, 0, INK, 0);
    eyes([[418, 262]], 14);
    E(g, 400, 318, 20, 11, 0, "rgba(255,110,140,0.5)", 0);
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath();
    if (mood === "shock") E(g, 440, 350, 14, 18, 0, "#7a2a3a", 5);
    else if (mood === "chew") { g.moveTo(420, 346); g.quadraticCurveTo(440, 360, 456, 344); g.stroke(); }
    else { g.moveTo(418, 344); g.quadraticCurveTo(436, 358, 454, 340); g.stroke(); }
    if (halo) haloAt(392, 168, 70);
    return;
  }
  if (wings) wingPair(256, 300, 110);
  for (const s of [-1, 1]) for (const [dx, c] of [[60, SH], [110, PK]]) { g.fillStyle = c; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(256 + s * dx - 22, 390, 44, 102, 14); g.fill(); g.stroke(); g.fillStyle = "#6a4a4e"; g.fillRect(256 + s * dx - 20, 470, 40, 14); }
  E(g, 256, 360, 170, 110, 0, PK, 10);
  for (const s of [-1, 1]) { g.save(); g.translate(256 + s * 78, 176); g.rotate(s * 0.55); g.fillStyle = PK; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-30, 30); g.quadraticCurveTo(-10, -60, 26, -44); g.quadraticCurveTo(36, 0, 30, 36); g.closePath(); g.fill(); g.stroke(); E(g, 2, -6, 12, 26, 0, SH, 0); g.restore(); }
  E(g, 256, 262, 128, 108, 0, PK, 10);
  eyes([[206, 236], [306, 236]], 16);
  E(g, 176, 290, 24, 13, 0, "rgba(255,110,140,0.5)", 0); E(g, 336, 290, 24, 13, 0, "rgba(255,110,140,0.5)", 0);
  E(g, 256, 296, 56, 40, 0, SN, 9); E(g, 236, 296, 9, 14, 0, INK, 0); E(g, 276, 296, 9, 14, 0, INK, 0);
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath();
  if (mood === "shock") E(g, 256, 352, 16, 20, 0, "#7a2a3a", 5); else { g.moveTo(222, 344); g.quadraticCurveTo(256, 366, 290, 344); g.stroke(); }
  if (halo) haloAt(256, 128, 86);
  if (o.flag) { g.save(); g.translate(372, 340); g.rotate(-0.2); g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 70); g.lineTo(0, -100); g.stroke(); unionJack(g, 0, -100, 110, 66); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(0, -100, 110, 66); g.restore(); }
}
const PG_H = 0.78;
const pig = (out, o, x, gy, z, dir = 1, ex = {}) => {
  const h = ex.h ?? PG_H;
  const oo = { view: o.view ?? "side", mood: o.mood ?? "cute", walk: o.walk >= 0 ? (Math.round(o.walk * 8) % 8) / 8 : -1, halo: !!o.halo, wings: !!o.wings, flag: !!o.flag };
  const key = "pg" + JSON.stringify(oo).replace(/[^a-z0-9.\-]/gi, "") + (oo.view === "side" ? dir : "");
  fxCard(out, key, (p) => { if (dir < 0 && oo.view === "side") { p.g.translate(512, 0); p.g.scale(-1, 1); } drawPig(p.g, oo); }, x, gy + h * 0.4727, z, h, h, { cw: 512, ch: 512, kind: ex.kind ?? "lit", rot: ex.rot ?? 0 });
  if (ex.shadow !== false) shadowAt(out, x, gy, z, h);
};

// ---------------- 1859 man-of-war (side view, bow to the right), 1024 x 512, waterline at y 436 ----------------
function drawShip(g, k = 0) {
  g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; g.lineCap = "round";
  const bob = Math.sin(k * 0.785) * 4;
  g.save(); g.translate(0, bob);
  for (const [mx, top] of [[300, 40], [520, 20], [730, 50]]) {
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(mx, 340); g.lineTo(mx, top); g.stroke(); g.strokeStyle = "#7a5a3a"; g.lineWidth = 8; g.stroke();
    for (const [y0, y1, w] of [[top + 30, top + 100, 80], [top + 115, top + 200, 110], [top + 215, top + 300, 130]]) {
      g.fillStyle = "#f6f0e0"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(mx - w, y0); g.lineTo(mx + w, y0); g.quadraticCurveTo(mx + w + 14, (y0 + y1) / 2, mx + w - 6, y1); g.lineTo(mx - w + 6, y1); g.quadraticCurveTo(mx - w - 14, (y0 + y1) / 2, mx - w, y0); g.fill(); g.stroke();
      g.lineWidth = 6; g.beginPath(); g.moveTo(mx - w - 10, y0); g.lineTo(mx + w + 10, y0); g.stroke(); }
  }
  g.strokeStyle = "rgba(36,23,38,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(1000, 310); g.lineTo(730, 50); g.lineTo(520, 20); g.lineTo(300, 40); g.lineTo(90, 330); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(880, 340); g.lineTo(1010, 300); g.stroke(); g.strokeStyle = "#7a5a3a"; g.lineWidth = 7; g.stroke();
  g.fillStyle = "#24222a"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(70, 330); g.lineTo(900, 330); g.quadraticCurveTo(930, 360, 890, 440); g.lineTo(150, 440); g.quadraticCurveTo(80, 420, 70, 330); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#f2ece0"; g.fillRect(90, 362, 790, 26); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(90, 362, 790, 26);
  g.fillStyle = "#1a1820"; for (let x = 130; x < 860; x += 58) g.fillRect(x, 366, 24, 18);
  g.fillStyle = "#c9a24a"; g.fillRect(70, 330, 830, 8);
  g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(90, 330); g.lineTo(64, 196); g.stroke();
  const fw = 120, fh = 70, wv = (x) => Math.sin(x / 30 + k * 0.785) * 6;
  g.save(); g.translate(64, 196); g.fillStyle = "#c8302e"; g.beginPath(); g.moveTo(0, 0); for (let x = 0; x <= fw; x += 8) g.lineTo(-x, wv(x)); for (let x = fw; x >= 0; x -= 8) g.lineTo(-x, fh + wv(x)); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); unionJack(g, -58, 3, 54, 34); g.restore();
  g.restore();
  for (let i = 0; i < 6; i++) E(g, 860 + i * 18 - Math.sin(k + i) * 6, 438 + (i % 2) * 6, 22, 9, 0, "rgba(255,255,255,0.85)", 0);
}
/** a warship card floating on the strait (waterline on the water plane) */
const ship = (out, x, z, k, w = 34, dir = 1) => { const kk = ((Math.floor(k) % 8) + 8) % 8, h = w / 2; fxCard(out, "ship" + kk + dir, (p) => { if (dir < 0) { p.g.translate(1024, 0); p.g.scale(-1, 1); } drawShip(p.g, kk); }, x, 0.07 + h * (436 / 512 - 0.5), z, w, h, { cw: 1024, ch: 512, kind: "lit" }); };

// ---------------- 2D drawings ----------------
const DR = {
  dateSign: (p) => { const g = p.g; g.fillStyle = "#8a6440"; g.fillRect(0, 0, 1024, 512); for (let y = 0; y < 512; y += 128) { g.fillStyle = y % 256 ? "#94704a" : "#7e5a38"; g.fillRect(0, y, 1024, 124); g.fillStyle = "rgba(40,20,10,0.5)"; g.fillRect(0, y + 124, 1024, 4); } g.strokeStyle = INK; g.lineWidth = 18; g.strokeRect(9, 9, 1006, 494);
    txt(g, "JUNE 1859", 512, 200, 190, "Rye", "#f4e6c4", "#2a1a10", 16, 940); txt(g, "SAN JUAN ISLAND", 512, 386, 96, "Rye", "#f2c45a", "#2a1a10", 12, 920); },
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
  cal: (p, y) => { const g = p.g; g.clearRect(0, 0, 512, 512); g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(56, 60, 400, 420, 24); g.fill(); g.stroke(); g.fillStyle = "#c8302e"; g.beginPath(); g.roundRect(56, 60, 400, 120, [24, 24, 0, 0]); g.fill(); g.stroke(); for (const x of [150, 362]) E(g, x, 60, 16, 30, 0, "#d8d8dc", 8);
    txt(g, String(y), 256, 330, 170, "Bangers", "#24356e", INK, 0, 380); txt(g, "YEAR", 256, 122, 70, "Bangers", "#ffffff", INK, 6); },
  /** map insert 576 x 1024: Vancouver Island (British) west, the US mainland east, San Juan Island between.
   *  mode "claim": both flags planted, MINE! MINE!; mode "usa": the border line runs down Haro Strait, US flag only */
  map: (p, mode, u) => { const g = p.g; g.fillStyle = "#7fb4d8"; g.fillRect(0, 0, 576, 1024); g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 4; for (let y = 60; y < 1024; y += 70) { g.beginPath(); for (let x = 0; x <= 576; x += 20) g.lineTo(x, y + Math.sin(x / 40 + y) * 6); g.stroke(); }
    const land = (pts, col) => { g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.stroke(); };
    land([[-20, 120], [120, 160], [170, 260], [150, 420], [190, 560], [140, 700], [60, 820], [-20, 860]], "#c9d89a");
    land([[600, 80], [470, 140], [430, 300], [470, 460], [420, 620], [460, 780], [600, 900]], "#e2cf9a");
    land([[250, 470], [320, 440], [370, 480], [360, 560], [300, 600], [250, 570], [232, 520]], "#a8c86a");
    txt(g, "BRITAIN", 72, 470, 46, "Bangers", "#c8302e", INK, 6, 130); txt(g, "USA", 522, 390, 52, "Bangers", "#24356e", INK, 6, 120);
    txt(g, "SAN JUAN", 300, 652, 44, "Bangers", "#ffffff", INK, 8, 300); txt(g, "ISLAND", 300, 696, 44, "Bangers", "#ffffff", INK, 8, 300);
    const flg = (x, y, who, s = 1) => { if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -110); g.stroke(); if (who === "us") usFlag(g, 0, -110, 80, 50); else unionJack(g, 0, -110, 80, 50); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(0, -110, 80, 50); g.restore(); };
    if (mode === "claim") { flg(262, 530, "uk", smooth(u * 4)); flg(322, 525, "us", smooth(u * 4 - 0.4));
      if (u > 0.3) { const w = Math.sin(u * 30) * 8; g.strokeStyle = "#c8302e"; g.lineWidth = 18; g.beginPath(); g.moveTo(230 - w, 780); g.lineTo(120 - w, 780); g.stroke(); g.fillStyle = "#c8302e"; g.beginPath(); g.moveTo(90 - w, 780); g.lineTo(130 - w, 750); g.lineTo(130 - w, 810); g.fill();
        g.strokeStyle = "#24356e"; g.beginPath(); g.moveTo(350 + w, 780); g.lineTo(460 + w, 780); g.stroke(); g.fillStyle = "#24356e"; g.beginPath(); g.moveTo(490 + w, 780); g.lineTo(450 + w, 750); g.lineTo(450 + w, 810); g.fill();
        txt(g, "MINE!", 160, 860, 60, "Bangers", "#c8302e", INK, 8); txt(g, "MINE!", 430, 860, 60, "Bangers", "#24356e", INK, 8); } }
    else { const k = clamp01(u * 2.2); g.setLineDash([26, 18]); g.strokeStyle = "#ffe85a"; g.lineWidth = 12; g.beginPath(); g.moveTo(210, 100); g.lineTo(210, 100 + 820 * k); g.stroke(); g.setLineDash([]); flg(300, 530, "us", smooth((u - 0.3) * 3)); if (u > 0.5) txt(g, "USA!", 300, 860, 110 * smooth((u - 0.5) * 4) + 1, "Bangers", "#24356e", INK, 10); } },
};

// ---------------- props drawn on people's cards (p.hands is set by bodyFront) ----------------
const gunAt = (p, x0, y0, ang, len = 420) => { const g = p.g, c = Math.cos(ang), s = Math.sin(ang); g.lineCap = "round";
  const bx = x0 - c * 90, by = y0 - s * 90, mx = x0 + c * 120, my = y0 + s * 120, ex = x0 + c * len, ey = y0 + s * len;
  g.strokeStyle = INK; g.lineWidth = 34; g.beginPath(); g.moveTo(bx, by); g.lineTo(mx, my); g.stroke(); g.strokeStyle = "#8a5a34"; g.lineWidth = 22; g.stroke();
  g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(mx, my); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = "#6a6e78"; g.lineWidth = 8; g.stroke(); };
const XL = {
  gunAim: () => (p) => { const H = p.hands; if (!H || !H.l || !H.r) return; const a = Math.atan2(H.l[1] - H.r[1], H.l[0] - H.r[0]); gunAt(p, H.r[0], H.r[1], a, 440); },
  bill: (s) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1] - 20); g.rotate(-0.15); g.fillStyle = "#cfe3b8"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-70, -36, 140, 72, 8); g.fill(); g.stroke(); txt(g, s, 0, 2, 50, "AlfaSlab", "#3a6a2a", INK, 0, 120); g.restore(); },
  scope: () => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(-0.5); g.fillStyle = "#c9a24a"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-10, -150, 30, 160, 6); g.fill(); g.stroke(); g.fillStyle = "#3a3a40"; g.fillRect(-14, -160, 38, 22); g.strokeRect(-14, -160, 38, 22); g.restore(); },
  gavel: (up) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(up ? -2.2 : -0.9); g.strokeStyle = INK; g.lineWidth = 18; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -150); g.stroke(); g.strokeStyle = "#8a5a34"; g.lineWidth = 10; g.stroke(); g.fillStyle = "#6a3e22"; g.lineWidth = 7; g.beginPath(); g.roundRect(-55, -190, 110, 54, 12); g.fill(); g.strokeStyle = INK; g.stroke(); g.restore(); },
  scroll: () => (p) => { const H = p.hands; if (!H || !H.l) return; const g = p.g; g.save(); g.translate(H.l[0], H.l[1] - 30); g.rotate(-0.2); g.fillStyle = "#f6ecd2"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-34, -64, 68, 128, 8); g.fill(); g.stroke(); g.fillStyle = "rgba(42,26,16,0.5)"; for (let i = 0; i < 4; i++) g.fillRect(-20, -40 + i * 20, 40, 5); g.restore(); },
};
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });

// ---------------- cast ----------------
const US = (v = 0, gun = true) => ({ jacket: "#2a3866", pants: "#7f95bd", boots: INK, hat: "cap", cap: "#26305c", belt: "#f1efe6", buttons: "#e8c45a", skin: ["#f2d2b6", "#e8c3a0", "#d9a77c", "#f5c9a0"][v % 4], ...(v % 3 === 1 ? { moustache: "#4a3426" } : {}), rifle: gun });
const UK = (v = 0, gun = true) => ({ jacket: "#c8302e", pants: "#2a2c3a", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#e8c45a", skin: ["#f2d2b6", "#f0d0b4", "#e8c3a0", "#f5c9a0"][v % 4], ...(v % 3 === 2 ? { moustache: "#6a4a2a" } : {}), rifle: gun });
const CUT = { jacket: "#e8dcc0", pants: "#5a4a3a", bib: "#4a6a8a", boots: "#3a2a1a", skin: "#e0b48a", hat: "fedora", cap: "#8a6a44", moustache: "#6a4a2a" };
const GRIF = { jacket: "#3a3a46", pants: "#6a6470", boots: INK, hat: "tophat", buttons: "#d9dde0", skin: "#f0d0b4", moustache: "#8a5a30", build: "stout" };
const ADM = { jacket: "#1d2a52", pants: "#1d2a52", boots: INK, hat: "bicorne", trim: "#e8c45a", cockade: "#1d1b24", buttons: "#e8c45a", sash: "#e8c45a", skin: "#f0d0b4", moustache: "#a8a8b0", build: "stout" };
const KAI = { jacket: "#1f2a4a", pants: "#2a2c3a", boots: INK, hat: "helmet", cap: "#2a2a30", spike: "#d9b450", buttons: "#e8c45a", sash: "#e8c45a", skin: "#f0d0b4", moustache: "#f4f4f4", build: "stout" };

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

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[0];
function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const [px, , pz] = PIG, p_ = (x, y, z) => [px + x, y, pz + z];
  const day = { light: "day", sunAz: 200, sunEl: 46, fogFar: 2600 };
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const G = 0.05;

  // the hero spot (shot 1 and the loop): the pig in the open field, redcoats to the left, bluecoats to the right, flags, sea behind
  const HZ = 20;
  const hero = (t, out, tHalo) => {
    for (let k = 0; k < 3; k++) {
      // camera looks -z (towards the firs), so +x is screen-right: redcoats left, bluecoats right
      out.places.push(pl(30 + k, UK(k), px - 0.62 - k * 0.55, G, pz + HZ - 2.6 - k * 0.35, { expr: k === 1 ? "stern" : "suspicious" }));
      out.places.push(pl(40 + k, US(k), px + 0.62 + k * 0.55, G, pz + HZ - 2.6 - k * 0.35, { expr: k === 1 ? "suspicious" : "stern" }));
    }
    flag(out, "uk", t, px - 1.75, 1.75, pz + HZ - 4.8, 1.0); flag(out, "us", t + 0.3, px + 1.75, 1.75, pz + HZ - 4.8, 1.0);
    const hu = tHalo !== undefined ? t - tHalo : -1, up = hu > 0 ? smooth(hu / 0.6) * 0.18 : 0;
    pig(out, { view: "front", mood: hu > 0 ? "angel" : "cute", halo: hu > 0, wings: hu > 0.15 }, px, G + up + (hu > 0 ? 0.03 * Math.sin(t * 6) : 0), pz + HZ, 1, { h: 0.8 });
  };
  const heroCam = push(p_(0.0, 0.62, HZ + 3.1), p_(0.0, 1.05, HZ - 2), p_(0.0, 0.6, HZ + 2.8), p_(0.0, 1.03, HZ - 2), 46, 3.2);
  // 1 The only casualty of this war... was a pig.: the pig between the two armies; on "pig" it gets a halo and wings
  shot({ a: 0, ...day, cam: heroCam, cInf: 1.5, focus: p_(0, 0.6, HZ), shadowR: 8,
    stage(t, out) { const tp = T("pig"); hero(t, out, tp); if (t > tp) for (let i = 0; i < 5; i++) { const v = ((t * 0.9) + i / 5) % 1; fxCard(out, "spark", DR.spark, px + Math.cos(i * 1.3 + t) * 0.45, 0.9 + Math.sin(i * 1.3 + t) * 0.3, pz + HZ + 0.1, 0.1 * Math.sin(v * Math.PI), 0.1 * Math.sin(v * Math.PI), { cw: 256, ch: 256, kind: "basic" }); } } });
  kick1(T("pig") + 0.03);
  // 2 June 1859.: crane down over the island: cabin, potato patch, camps, the strait; painted date board
  shot({ at: S("June"), ...day, cam: push(p_(6, 22, -40), p_(0, 0, 20), p_(4.5, 3.2, -14), p_(2, 1.5, 0), 46, 1.9), cInf: 0.6, focus: p_(2.5, 1.5, -6), shadowR: 40,
    stage(t, out) { sign(out, "dateSign", DR.dateSign, 1024, 512, px + 2.6, 2.3, pz - 6, 3.2, 1.6, [-0.2, 0, -1]); fxCard(out, "post", DR.post, px + 2.6, 0.75, pz - 5.98, 0.12, 1.5, { cw: 64, ch: 512, kind: "lit", normal: [-0.2, 0, -1] }); } });
  // 3 A tiny island America and Britain both claim.: map insert, both flags, MINE! MINE!
  shot({ at: S("A tiny"), ...day, cam: () => ({ pos: p_(0, 60, -100), look: p_(0, 60, -160), fov: 40, roll: 0 }), cInf: 0, focus: p_(0, 60, -160), shadowR: 6,
    stage(t, out, c) { const u = clamp01((t - T("A tiny") + 0.1) / 2.6), q = Math.round(u * 40) / 40; screenCard(out, c, "map" + q, (p) => DR.map(p, "claim", q), 0.6, 576, 1024, "basic"); } });
  kick1(T("claim") + 0.05);
  // 4 Farmer Lyman Cutlar: hero intro on a sunburst with his name ribbon
  const CX = -2.4, CZ = 1.5;
  shot({ at: S("Farmer"), ...day, cam: push(p_(CX + 0.05, 1.25, CZ + 2.4), p_(CX, 1.25, CZ), p_(CX + 0.05, 1.28, CZ + 2.05), p_(CX, 1.3, CZ), 44, 1.5), cInf: 2, focus: p_(CX, 1.3, CZ), shadowR: 8,
    stage(t, out) { const tb = T("Lyman"), u = smooth((t - tb + 0.1) / 0.3); fxCard(out, "burst", DR.burst, px + CX, 1.3, pz + CZ - 0.7, 5.2 * (0.7 + 0.3 * u), 5.2 * (0.7 + 0.3 * u), { cw: 512, ch: 512, kind: "basic", rot: t * 0.5 });
      out.places.push(pl(1, CUT, px + CX, G, pz + CZ, { expr: u > 0.5 ? "proud" : "smile", arms: { l: ["hips", 1], r: ["hips", 1] } }));
      if (u > 0) sign(out, "tagCut", (p) => DR.nameTag(p, "LYMAN CUTLAR", "AMERICAN FARMER", "#2f4f9a"), 1024, 256, px + CX, 0.62, pz + CZ + 0.25, 1.05 * u, 0.26 * u, [0, 0, 1], "basic"); } });
  kick1(T("Lyman") + 0.02);
  // 5 finds a pig eating his potatoes.: the pig in the patch, munching; Cutlar behind the fence, outraged
  shot({ at: S("finds"), ...day, cam: push(p_(3.6, 2.0, 5.2), p_(2.9, 0.6, 0.2), p_(3.5, 1.9, 4.7), p_(2.9, 0.6, 0.2), 44, 2.3), cInf: 2.5, focus: p_(3.0, 0.5, 1.6), shadowR: 8,
    stage(t, out) { const te = T("eating"), chew = Math.floor(t * 6) % 2 === 0;
      pig(out, { view: "side", mood: t > te ? "chew" : "cute" }, px + 3.0, G, pz + 1.85, 1, { h: 0.8 });
      if (t > te) { fxCard(out, "potato", DR.potato, px + 3.42, 0.32 + (chew ? 0.02 : 0), pz + 1.9, 0.16, 0.16, { cw: 256, ch: 256, kind: "lit" }); mark(out, "NOM", px + 3.5, 1.15, pz + 1.95, (t - te) * 2, 0.32); }
      const tp = T("potatoes"); out.places.push(pl(1, CUT, px + 2.0, G, pz - 2.55, { expr: t > tp - 0.1 ? "angry" : "suspicious", arms: t > tp - 0.1 ? { l: ["hips", 1], r: ["point", 1] } : { l: ["hips", 1] } }));
      mark(out, "!", px + 2.4, 2.25, pz - 2.45, (t - tp) * 2, 0.35); } });
  // 6 He shoots it.: Cutlar aims across the fence; BANG and a smoke puff (cut before anything else)
  shot({ at: S("He shoots"), ...day, cam: push(p_(1.0, 1.45, -1.2), p_(2.2, 1.3, -3.6), p_(1.1, 1.42, -1.5), p_(2.2, 1.3, -3.6), 46, 1.0), cInf: 2, focus: p_(2.2, 1.3, -3.6), shadowR: 8,
    stage(t, out) { const ts = T("shoots"); out.places.push(pl(1, CUT, px + 2.2, G, pz - 3.6, { expr: t > ts ? "pained" : "angry", arms: { l: ["point", 1], r: ["hold", 1] }, extra: XL.gunAim() }));
      if (t > ts + 0.08) { puff(out, t - ts, px + 1.7, 1.3, pz - 3.1, 0.7); word(out, "BANG!", "#d8333a", px + 1.75, 1.75, pz - 2.9, (t - ts - 0.08) * 2.5, 0.9); } } });
  kick1(T("shoots") + 0.08);
  // 7 Problem... the pig is British.: the pig as a little angel, halo and wings, waving a Union Jack; BRITISH!
  shot({ at: S("Problem"), ...day, cam: push(p_(3.0, 1.15, 4.6), p_(3.0, 1.15, 1.6), p_(3.0, 1.18, 4.2), p_(3.0, 1.2, 1.6), 44, 2.1), cInf: 2.5, focus: p_(3.0, 1.1, 1.6), shadowR: 6,
    stage(t, out) { const tb = T("British"), f = Math.sin(t * 5) * 0.04; fxCard(out, "burstB", (p) => DR.burst(p, "#9ad0ff", "#d8ecff"), px + 3.0, 1.15, pz + 1.0, 3.6, 3.6, { cw: 512, ch: 512, kind: "basic", rot: t * 0.4 });
      pig(out, { view: "front", mood: "angel", halo: true, wings: true, flag: t > tb - 0.15 }, px + 3.0, 0.62 + f, pz + 1.6, 1, { h: 0.8, shadow: false });
      word(out, "BRITISH!", "#c8302e", px + 3.0, 1.82, pz + 1.7, (t - tb + 0.05) * 1.8, 1.0); } });
  kick1(T("British") + 0.03);
  // 8 Cutlar offers ten dollars.: two-shot by the fence: Cutlar holds out a $10 bill to the Hudson's Bay man
  const OX = 0.5, OZ = -1.0;
  shot({ at: S("Cutlar offers"), ...day, cam: push(p_(OX, 1.4, OZ + 3.9), p_(OX, 1.25, OZ), p_(OX, 1.4, OZ + 3.5), p_(OX, 1.27, OZ), 46, 2.2), cInf: 2.5, focus: p_(OX, 1.2, OZ), shadowR: 8,
    stage(t, out) { const tt = T("ten");
      out.places.push(pl(1, CUT, px + OX - 0.6, G, pz + OZ, { expr: Math.floor(t * 5) % 3 ? "nervous" : "smile", arms: { r: ["out", 1] }, extra: t > tt - 0.2 ? XL.bill("$10") : undefined }));
      out.places.push(pl(2, GRIF, px + OX + 0.6, G, pz + OZ - 0.05, { expr: "suspicious", arms: { l: ["hips", 1], r: ["hips", 1] } }));
      if (t > tt - 0.05) { const k = smooth((t - tt + 0.05) * 4); sign(out, "m10", (p) => DR.money(p, "$10", "#2a5a1a"), 512, 256, px + OX - 0.3, 2.3 + 0.03 * Math.sin(t * 4), pz + OZ + 0.1, 0.9 * k, 0.45 * k, [0, 0, 1], "basic"); } } });
  // 9 The owner wants a hundred.: close on the owner, furious, finger up; $100! slams in
  shot({ at: S("The owner"), ...day, cam: push(p_(OX + 0.5, 1.5, OZ + 2.8), p_(OX + 0.6, 1.5, OZ), p_(OX + 0.5, 1.5, OZ + 2.45), p_(OX + 0.6, 1.52, OZ), 44, 1.8), cInf: 3, focus: p_(OX + 0.6, 1.4, OZ), shadowR: 6,
    stage(t, out) { const th = T("hundred"); out.places.push(pl(2, GRIF, px + OX + 0.6, G, pz + OZ - 0.05, { expr: t > th - 0.1 ? "angry" : "sly", arms: t > th - 0.1 ? { l: ["hips", 1], r: ["overhead", 1] } : { l: ["hips", 1], r: ["point", 0.6] } }));
      word(out, "$100!", "#2a7a2a", px + OX + 0.55, 2.22, pz + OZ + 0.5, (t - th + 0.05) * 2.2, 0.72); } });
  kick1(T("hundred") + 0.03);
  // 10 Then America sends four hundred sixty-one soldiers...: bluecoats march in across the field; 461 board
  const MZ = 10;
  shot({ at: S("Then America"), ...day, cam: push(p_(-2.4, 1.0, MZ + 6.4), p_(0.6, 1.1, MZ), p_(-2.0, 0.95, MZ + 5.8), p_(1.0, 1.1, MZ), 50, 3.1), cInf: 1.5, focus: p_(0, 1.0, MZ), shadowR: 12,
    stage(t, out) { const t0 = T("Then America"), tn = T("four"), m = (t - t0) * 1.2;
      for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) { const x = -7 + k * 0.9 + m - r * 0.35, z = MZ - r * 0.9; if (x > 6) continue; out.places.push(pl(50 + r * 7 + k, US(k + r), px + x, G, pz + z, { dir: [1, 0], view: "side", mode: "march", stride: 1.0, phase: (t * 1.6 + (k % 2) * 0.5) % 1, expr: "stern" })); }
      flag(out, "us", t, px - 7 + 6 * 0.9 + m + 0.6, 2.6, pz + MZ - 0.45, 1.5);
      board(out, "b461", "461", "SOLDIERS", "#24356e", px + 0.2 + (t - t0) * 0.4, 2.55, pz + MZ + 1.8, (t - tn + 0.1) * 1.5, 1.9); } });
  kick1(T("sixty-one") + 0.02);
  // 11 and fourteen cannons.: along the redoubt, the guns pointing out to sea; 14 CANNONS
  const AX = 30, AZ = 6;
  shot({ at: S("and fourteen"), ...day, cam: push(p_(AX - 11, 1.9, AZ + 5.0), p_(AX - 3, 1.7, AZ - 0.2), p_(AX - 10.2, 1.85, AZ + 4.4), p_(AX - 3, 1.7, AZ - 0.2), 46, 2.2), cInf: 1.2, focus: p_(AX - 3, 1.6, AZ), shadowR: 14,
    stage(t, out) { const tc = T("cannons");
      for (let k = 0; k < 6; k++) out.places.push(pl(70 + k, US(k), px + AX - 9 + k * 3 + 0.9, 1.26, pz + AZ - 1.0, { expr: "stern" }));
      flag(out, "us", t, px + AX + 13.6, 8.2, pz + AZ - 3, 2.4);
      board(out, "b14", "14", "CANNONS", "#24356e", px + AX - 6.4, 2.85, pz + AZ + 2.0, (t - tc + 0.25) * 1.6, 1.25); } });
  kick1(T("cannons") + 0.02);
  // 12 Britain sends five warships...: five men-of-war glide into the strait; 5 WARSHIPS
  shot({ at: S("Britain sends"), ...day, cam: push(p_(2, 1.6, 30), p_(0, 6, 140), p_(2, 1.6, 31.5), p_(0, 6.5, 140), 40, 1.6), cInf: 0.3, focus: p_(0, 5, 120), shadowR: 30,
    stage(t, out) { const t0 = T("Britain sends"), tw = T("warships");
      for (let i = 0; i < 5; i++) { const x = -34 + i * 17 - (t - t0) * 3 + (i % 2) * 4, z = 95 + (i % 2) * 40 + (i === 2 ? -12 : 0) + i * 6; ship(out, px + x, pz + z, t * 2 + i * 2, 26, -1); }
      board(out, "b5", "5", "WARSHIPS", "#c8302e", px + 1.7, 2.75, pz + 35.5, (t - tw + 0.35) * 1.6, 1.4); } });
  kick1(T("warships") + 0.02);
  // 13 and over two thousand troops.: redcoats march along the beach, ships behind; 2,000+ TROOPS
  const BZ = 30;
  shot({ at: S("and over"), ...day, cam: push(p_(5.5, 1.1, BZ - 6.4), p_(1.0, 1.2, BZ), p_(5.0, 1.05, BZ - 5.8), p_(0.6, 1.2, BZ), 50, 2.3), cInf: 1.2, focus: p_(1, 1.1, BZ), shadowR: 12,
    stage(t, out) { const t0 = T("and over"), tt = T("thousand"), m = (t - t0) * 1.2;
      for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) { const x = 7.5 - k * 0.9 - m + r * 0.35, z = BZ + r * 0.9; if (x < -7) continue; out.places.push(pl(80 + r * 8 + k, UK(k + r), px + x, G, pz + z, { dir: [-1, 0], view: "side", mode: "march", stride: 1.0, phase: (t * 1.6 + (k % 2) * 0.5) % 1, expr: "stern" })); }
      flag(out, "uk", t, px + 7.5 - m - 0.6, 2.6, pz + BZ + 0.45, 1.5);
      for (let i = 0; i < 3; i++) ship(out, px - 60 + i * 50, pz + 120 + (i % 2) * 30, t * 2 + i * 2, 34, -1);
      board(out, "b2000", "2,000+", "TROOPS", "#c8302e", px + 1.2, 2.6, pz + BZ - 1.6, (t - tt + 0.1) * 1.5, 1.9); } });
  kick1(T("troops") + 0.02);
  // 14 But the British admiral: on the beach, telescope up; ADMIRAL BAYNES ribbon; his flagship behind
  const DX = -6, DZ = 34.5;
  shot({ at: S("But the"), ...day, cam: push(p_(DX + 0.1, 1.15, DZ - 2.5), p_(DX, 1.35, DZ), p_(DX + 0.1, 1.15, DZ - 2.15), p_(DX, 1.37, DZ), 44, 1.4), cInf: 1.5, focus: p_(DX, 1.3, DZ), shadowR: 8,
    stage(t, out) { const ta = T("admiral"), u = smooth((t - ta + 0.15) / 0.3); ship(out, px + DX + 6, pz + 90, t * 2, 40, -1);
      out.places.push(pl(5, ADM, px + DX, G, pz + DZ, { expr: "stern", arms: u > 0.5 ? { l: ["hips", 1], r: ["hips", 1] } : { r: ["face", 1] }, extra: u > 0.5 ? undefined : XL.scope() }));
      if (u > 0) sign(out, "tagAdm", (p) => DR.nameTag(p, "ADMIRAL BAYNES", "ROYAL NAVY", "#c0353a"), 1024, 256, px + DX, 0.88, pz + DZ - 0.45, 1.1 * u, 0.275 * u, [0, 0, -1], "basic"); } });
  kick1(T("admiral") + 0.02);
  // 15 won't start a war... over a pig.: shaking his head; the angel pig floats up beside him; NO!
  shot({ at: S("won't"), ...day, cam: push(p_(DX + 0.3, 1.3, DZ - 3.7), p_(DX + 0.25, 1.35, DZ), p_(DX + 0.3, 1.3, DZ - 3.3), p_(DX + 0.25, 1.37, DZ), 46, 2.0), cInf: 1.5, focus: p_(DX, 1.3, DZ), shadowR: 8,
    stage(t, out) { const tp = T("pig", T("won't")), sh = Math.sin(t * 9) * 3;
      out.places.push(pl(5, ADM, px + DX, G, pz + DZ, { expr: t > tp - 0.1 ? "annoyed" : "stern", arms: { l: ["hips", 1], r: ["shrug", 1] }, headTilt: sh }));
      word(out, "NO!", "#c8302e", px + DX - 0.45, 2.2, pz + DZ - 0.2, (t - T("won't") + 0.05) * 2, 0.75);
      if (t > tp - 0.35) pig(out, { view: "front", mood: "angel", halo: true, wings: true }, px + DX + 0.62, 0.95 + 0.05 * Math.sin(t * 5), pz + DZ - 0.1, 1, { h: 0.6, shadow: false });
      mark(out, "?!", px + DX + 0.62, 1.8, pz + DZ - 0.15, (t - tp) * 2, 0.3); } });
  // 16 So both armies camp there...: high wide across the island: the American tents, the British tents, the redoubt, the sea
  shot({ at: S("So both"), ...day, cam: push(p_(0, 46, 52), p_(-2, 0, -12), p_(0, 40, 46), p_(-2, 0, -12), 60, 1.9), cInf: 0, focus: p_(-2, 0, -12), shadowR: 70,
    stage(t, out) { flag(out, "us", t, px + 18.5, 6.9, pz - 9, 5.0); flag(out, "uk", t, px - 12.9, 6.9, pz - 6, 5.0);
      for (let k = 0; k < 6; k++) { const s = Math.sin(t * 1.3 + k); out.places.push(pl(90 + k, US(k), px + 10 + k * 2.2 + s * 0.6, G, pz - 6 - (k % 2) * 3, { dir: [Math.cos(t * 1.3 + k) > 0 ? 1 : -1, 0], view: "side", mode: "march", phase: (t * 1.4 + k * 0.3) % 1 })); out.places.push(pl(100 + k, UK(k), px - 28 + k * 2.4 - s * 0.6, G, pz - 4 - (k % 2) * 3, { dir: [Math.cos(t * 1.3 + k) > 0 ? -1 : 1, 0], view: "side", mode: "march", phase: (t * 1.4 + k * 0.4) % 1 })); }
      pig(out, { view: "side", mood: "cute", walk: (t * 1.5) % 1 }, px + 3 + (t - S("So both")) * 0.6, G, pz + 1.5, 1, { h: 0.8 }); } });
  // 17 for twelve years.: a bluecoat and a redcoat doze side by side; the calendar flips 1860 -> 1872
  const FZ = 12;
  shot({ at: S("for twelve"), ...day, cam: push(p_(0.05, 1.2, FZ + 4.2), p_(0, 1.15, FZ), p_(0.05, 1.2, FZ + 3.8), p_(0, 1.17, FZ), 46, 1.4), cInf: 2, focus: p_(0, 1.0, FZ), shadowR: 8,
    stage(t, out) { const t0 = T("twelve"), yr = 1860 + Math.min(12, Math.max(0, Math.floor((t - t0 + 0.2) * 12)));
      out.places.push(pl(41, US(1, false), px - 0.55, G, pz + FZ, { mode: "sit", expr: "sleep" })); out.places.push(pl(31, UK(1, false), px + 0.55, G, pz + FZ, { mode: "sit", expr: "sleep" }));
      sign(out, "cal" + yr, (p) => DR.cal(p, yr), 512, 512, px, 1.95, pz + FZ - 0.4, 0.85, 0.85, [0, 0, 1], "basic");
      for (let i = 0; i < 3; i++) mark(out, "Z", px + (i % 2 ? 0.75 : -0.35) + i * 0.1, 1.45 + i * 0.18, pz + FZ + 0.1, (t - S("for twelve") - i * 0.2) * 2, 0.16 + i * 0.03, "#ffffff"); } });
  // 18 Until Germany's Kaiser settles it.: the Kaiser, scroll in hand, bangs the gavel; SETTLED!
  const KX = 14, KZ = 14;
  shot({ at: S("Until"), ...day, cam: push(p_(KX + 0.05, 1.35, KZ + 2.9), p_(KX, 1.3, KZ), p_(KX + 0.05, 1.35, KZ + 2.5), p_(KX, 1.32, KZ), 46, 2.5), cInf: 2, focus: p_(KX, 1.2, KZ), shadowR: 8,
    stage(t, out) { const tk = T("Kaiser"), ts = T("settles"), up = t < ts - 0.05 && t > tk - 0.3, u = smooth((t - tk + 0.15) / 0.3);
      fxCard(out, "burstK", (p) => DR.burst(p, "#ffd23a", "#f2f2f2"), px + KX, 1.4, pz + KZ - 0.8, 5.2, 5.2, { cw: 512, ch: 512, kind: "basic", rot: t * 0.4 });
      out.places.push(pl(6, KAI, px + KX, G, pz + KZ, { expr: t > ts ? "stern" : "proud", arms: { l: ["hold", 1], r: [up ? "overhead" : "chop", 1] }, extra: (p) => { XL.scroll()(p); XL.gavel(up)(p); } }));
      if (u > 0 && t < ts) sign(out, "tagKai", (p) => DR.nameTag(p, "KAISER WILHELM I", "GERMANY", "#3a3a40"), 1024, 256, px + KX, 0.62, pz + KZ + 0.25, 1.1 * u, 0.275 * u, [0, 0, 1], "basic");
      word(out, "SETTLED!", "#24356e", px + KX, 1.98, pz + KZ + 0.6, (t - ts - 0.05) * 1.8, 1.05); } });
  kick1(T("settles") + 0.05);
  // 19 America gets the island.: the map again; the border line runs down Haro Strait; the US flag goes up
  shot({ at: S("America gets"), ...day, cam: () => ({ pos: p_(0, 60, -100), look: p_(0, 60, -160), fov: 40, roll: 0 }), cInf: 0, focus: p_(0, 60, -160), shadowR: 6,
    stage(t, out, c) { const u = clamp01((t - T("America gets") + 0.1) / 1.8), q = Math.round(u * 40) / 40; screenCard(out, c, "mapU" + q, (p) => DR.map(p, "usa", q), 0.6, 576, 1024, "basic"); } });
  kick1(T("island", T("America gets")) + 0.05);
  // 20 Nobody fires a shot.: a daisy pops out of a cannon's mouth; behind it a bluecoat and a redcoat shake hands
  shot({ at: S("Nobody"), ...day, cam: push(p_(AX - 6.7, 2.2, AZ + 3.9), p_(AX - 6.0, 1.9, AZ - 1.2), p_(AX - 6.65, 2.15, AZ + 3.5), p_(AX - 6.0, 1.9, AZ - 1.2), 46, 1.9), cInf: 2.5, focus: p_(AX - 6, 1.75, AZ + 1.4), shadowR: 8,
    stage(t, out) { const tf = T("fires"), k = smooth((t - tf) / 0.3), sh = Math.sin(t * 9) * 0.05;
      if (k > 0) fxCard(out, "daisy", DR.daisy, px + AX - 6, 1.62 + 0.18 * k, pz + AZ + 1.42, 0.32 * k, 0.32 * k, { cw: 256, ch: 256, kind: "lit" });
      out.places.push(pl(42, US(2, false), px + AX - 6.55, 1.26, pz + AZ - 1.1, { expr: "grin", arms: { r: ["out", 0.85 + sh] } })); out.places.push(pl(32, UK(2, false), px + AX - 5.35, 1.26, pz + AZ - 1.1, { expr: "smile_closed", arms: { l: ["out", 0.85 - sh] } }));
      for (let i = 0; i < 3; i++) { const v = ((t * 0.8) + i / 3) % 1; fxCard(out, "heart", DR.heart, px + AX - 5.95 + (i - 1) * 0.15, 2.4 + v * 0.4, pz + AZ - 1.0, 0.12 * Math.sin(v * Math.PI), 0.12 * Math.sin(v * Math.PI), { cw: 256, ch: 256, kind: "basic" }); } } });
  // 21 So when the war finally ends...: back on the hero (matches shot 1's opening frame, so it loops)
  shot({ at: S("So when"), ...day, cam: heroCam, cInf: 1.5, focus: p_(0, 0.6, HZ), shadowR: 8, loop: true,
    stage(t, out) { hero(t, out, undefined); } });

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
