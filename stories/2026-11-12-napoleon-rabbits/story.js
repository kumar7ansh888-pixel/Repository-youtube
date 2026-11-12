// Shot plan for "Napoleon vs the Bunnies" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// July 1807: Berthier's rabbit hunt for Napoleon; the tame farm rabbits charge the Emperor instead of running away.
// Hook-first, a cut every ~1.7 s, loop ending (the last shot is shot 1's proud Napoleon again).
import { NAP } from "./world.js";
import { INK, mix } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1300;
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
const q8 = (v, n = 8) => Math.round(v * n) / n;
const two = Math.PI * 2;

// ---------------- text ----------------
const txt = (g, s, x, y, size, font, fill, stroke = INK, lw = 0, maxW = 0) => {
  g.font = `${size}px ${font}`; if (maxW) { let k = size; while (g.measureText(s).width > maxW && k > 8) { k *= 0.94; g.font = `${k}px ${font}`; } }
  g.textAlign = "center"; g.textBaseline = "middle"; if (lw) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = lw; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y);
};
const E = (g, x, y, rx, ry, rot, fill, lw = 8, stroke = INK) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, two); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };

// ---------------- the bunnies ----------------
const FUR = [
  { fur: "#f7f3ea", sh: "#ddd3c4", ear: "#f4b8b8" },  // white
  { fur: "#b98a62", sh: "#93673f", ear: "#e8a8a0" },  // brown
  { fur: "#9a9aa2", sh: "#76767e", ear: "#e8b0b4" },  // grey
  { fur: "#e8cfa4", sh: "#c8aa7c", ear: "#f0b0a8" },  // fawn
  { fur: "#4a3e42", sh: "#2e262a", ear: "#c88a8e" },  // black
  { fur: "#f7f3ea", sh: "#ddd3c4", ear: "#f4b8b8", patch: "#a8784e" }, // white with a brown patch
];
/** 512 x 512, feet on y 498. o = { view: side|front|back, ph (-1 sitting, 0..1 hop), c (fur index), mood, ear (0 up .. 1 flopped back), tongue } */
function drawBunny(g, o = {}) {
  const { view = "side", ph = -1, c = 0, mood = "cute", ear = 0, tongue = false } = o, C = FUR[c % FUR.length];
  if (!o.keep) g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; g.lineCap = "round";
  const hop = ph >= 0, u = hop ? Math.sin(ph * Math.PI) : 0, lift = u * 70;
  if (view === "side") {
    g.save(); g.translate(0, -lift); if (hop) { g.translate(250, 400); g.rotate(-0.22 * u + 0.08 * (1 - u)); g.translate(-250, -400); }
    E(g, 92 - u * 10, 372, 38, 38, 0, "#ffffff", 8); // tail
    if (hop) { g.save(); g.translate(160, 440); g.rotate(0.75 * u); E(g, -40, 30, 86, 20, 0.0, C.sh, 9); g.restore(); }
    else E(g, 214, 482, 92, 20, 0, C.sh, 9);
    E(g, 182, 398, 98, 92, 0, C.fur, 9); // haunch
    E(g, 252, 372, 142 + u * 16, 100 - u * 8, -0.16, C.fur, 10); // body
    if (C.patch) E(g, 210, 340, 56, 40, -0.3, C.patch, 0);
    E(g, 252, 372, 142 + u * 16, 100 - u * 8, -0.16, null, 10);
    g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(182, 398, 84, 3.6, 5.6); g.stroke();
    if (hop) { E(g, 372 + u * 40, 452 - u * 20, 32, 15, -0.5 * u, C.fur, 8); E(g, 352 + u * 30, 462 - u * 16, 30, 14, -0.4 * u, C.sh, 8); }
    else { E(g, 340, 484, 30, 16, 0, C.fur, 8); E(g, 312, 488, 28, 14, 0, C.sh, 8); }
    const ea = -0.32 - ear * 0.9 - u * 0.25;
    for (const [dx, k] of [[-14, 1], [10, 0]]) { g.save(); g.translate(346 + dx, 230); g.rotate(ea - k * 0.18); E(g, 0, -86, 30, 96, 0, k ? C.sh : C.fur, 9); E(g, 2, -84, 13, 70, 0, C.ear, 0); g.restore(); }
    E(g, 362, 272, 84, 74, 0.1, C.fur, 10); // head
    E(g, 410, 300, 40, 30, 0.1, mix(C.fur, "#ffffff", 0.35), 0); // muzzle
    E(g, 444, 288, 12, 9, 0, "#f08a9a", 5); // nose
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(440, 300); g.quadraticCurveTo(436, 318, 420, 320); g.stroke();
    g.fillStyle = "#ffffff"; g.fillRect(426, 316, 14, 16); g.strokeRect(426, 316, 14, 16);
    if (tongue) E(g, 440, 330, 12, 9, 0.3, "#f07a8a", 4);
    g.lineWidth = 3; g.strokeStyle = "rgba(36,23,38,0.7)"; for (const dy of [-8, 4, 16]) { g.beginPath(); g.moveTo(432, 298 + dy * 0.3); g.lineTo(492, 290 + dy); g.stroke(); }
    const ex = 392, ey = 254;
    if (mood === "charge") { E(g, ex, ey, 16, 18, 0, "#ffffff", 5); E(g, ex + 6, ey + 2, 9, 11, 0, INK, 0); g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(ex - 24, ey - 30); g.lineTo(ex + 22, ey - 16); g.stroke(); }
    else if (mood === "happy") { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(ex, ey + 8, 13, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else { E(g, ex, ey, 17, 20, 0, INK, 0); E(g, ex + 5, ey - 7, 6, 7, 0, "#ffffff", 0); E(g, ex - 5, ey + 7, 3, 3, 0, "#ffffff", 0); }
    E(g, ex - 10, ey + 34, 16, 9, 0, "rgba(255,140,150,0.45)", 0);
    g.restore();
    return;
  }
  // front / back: sitting upright, bobbing up on a hop
  g.save(); g.translate(256, 498 - lift); const sq = hop ? 1 + 0.12 * u : 1; g.scale(1 / Math.sqrt(sq), sq); g.translate(-256, -498);
  const back = view === "back";
  if (!back) { E(g, 196, 486, 46, 18, 0.15, C.sh, 8); E(g, 316, 486, 46, 18, -0.15, C.sh, 8); }
  for (const s of [-1, 1]) { g.save(); g.translate(256 + s * 44, 196); g.rotate(s * (0.16 + ear * 0.9) + (hop ? s * 0.15 * u : 0)); E(g, 0, -92, 32, 98, 0, C.fur, 9); if (!back) E(g, 0, -88, 15, 72, 0, C.ear, 0); g.restore(); }
  E(g, 256, 398, 128, 104, 0, C.fur, 10); // body
  if (C.patch) { E(g, 300, 380, 50, 40, 0.3, C.patch, 0); E(g, 256, 398, 128, 104, 0, null, 10); }
  E(g, 256, 246, 108, 92, 0, C.fur, 10); // head
  if (back) { E(g, 256, 452, 40, 36, 0, "#ffffff", 8); g.restore(); return; }
  E(g, 256, 430, 70, 52, 0, mix(C.fur, "#ffffff", 0.4), 0); // belly
  E(g, 222, 420, 26, 22, 0, C.fur, 7); E(g, 290, 420, 26, 22, 0, C.fur, 7); // paws
  E(g, 256, 290, 52, 34, 0, mix(C.fur, "#ffffff", 0.4), 0); // muzzle
  E(g, 182, 284, 22, 12, 0, "rgba(255,140,150,0.5)", 0); E(g, 330, 284, 22, 12, 0, "rgba(255,140,150,0.5)", 0);
  for (const s of [-1, 1]) { const ex = 256 + s * 40, ey = 236;
    if (mood === "charge") { E(g, ex, ey, 18, 20, 0, "#ffffff", 5); E(g, ex - s * 4, ey + 3, 10, 12, 0, INK, 0); g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(ex - s * 26, ey - 34); g.lineTo(ex + s * 22, ey - 20); g.stroke(); }
    else if (mood === "happy") { g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(ex, ey + 8, 15, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (mood === "dream") { g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(ex, ey - 6, 15, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); }
    else { E(g, ex, ey, 22, 26, 0, INK, 0); E(g, ex + 7, ey - 9, 8, 9, 0, "#ffffff", 0); E(g, ex - 6, ey + 9, 4, 4, 0, "#ffffff", 0); } }
  g.fillStyle = "#f08a9a"; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(244, 274); g.lineTo(268, 274); g.lineTo(256, 288); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(256, 288); g.lineTo(256, 298); g.moveTo(256, 298); g.quadraticCurveTo(244, 310, 232, 300); g.moveTo(256, 298); g.quadraticCurveTo(268, 310, 280, 300); g.stroke();
  if (tongue) E(g, 256, 322, 14, 12, 0, "#f07a8a", 5);
  g.fillStyle = "#ffffff"; g.fillRect(246, 300, 20, 18); g.strokeRect(246, 300, 20, 18); g.beginPath(); g.moveTo(256, 300); g.lineTo(256, 318); g.stroke();
  g.lineWidth = 3; g.strokeStyle = "rgba(36,23,38,0.7)"; for (const s of [-1, 1]) for (const dy of [-6, 6]) { g.beginPath(); g.moveTo(256 + s * 30, 292 + dy * 0.4); g.lineTo(256 + s * 96, 284 + dy * 2); g.stroke(); }
  g.restore();
}
const BN_H = 0.46;
/** a bunny card standing on ground height gy; dir -1 faces left (side view) */
const bunny = (out, o, x, gy, z, dir = 1, ex = {}) => {
  const h = ex.h ?? BN_H, sq = ex.sq ?? 1;
  const oo = { view: o.view ?? "side", ph: o.ph >= 0 ? (Math.round(o.ph * 10) % 10) / 10 : -1, c: o.c ?? 0, mood: o.mood ?? "cute", ear: q8(o.ear ?? 0, 4), tongue: !!o.tongue };
  const key = "bn" + JSON.stringify(oo).replace(/[^a-z0-9.\-]/gi, "") + (oo.view === "side" ? dir : "");
  fxCard(out, key, (p) => { if (dir < 0 && oo.view === "side") { p.g.translate(512, 0); p.g.scale(-1, 1); } drawBunny(p.g, oo); }, x, gy + h * sq * 0.4727, z, h / Math.sqrt(sq), h * sq, { cw: 512, ch: 512, kind: ex.kind ?? "lit", rot: ex.rot ?? 0 });
  if (ex.shadow !== false && !(oo.ph > 0)) shadowAt(out, x, gy, z, h * 0.8);
};
/** a crowd of bunnies hopping from (x0,z0) towards (x1,z1) over time; n bunnies spread across a band */
const horde = (out, t, n, from, to, t0, speed, spread, view = "side", mood = "charge", seed = 0, gy = 0.05, dirOverride) => {
  const dx = to[0] - from[0], dz = to[1] - from[1], L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, side = [-uz, ux];
  for (let i = 0; i < n; i++) {
    const delay = hh(i, 11 + seed) * 0.8, run = Math.max(0, t - t0 - delay) * speed * (0.8 + hh(i, 12 + seed) * 0.4);
    const d = Math.min(L - 0.4 * hh(i, 13 + seed) - 0.3, run - hh(i, 14 + seed) * 2.5), off = (hh(i, 15 + seed) - 0.5) * 2 * spread;
    const x = from[0] + ux * Math.max(0, d) + side[0] * off, z = from[1] + uz * Math.max(0, d) + side[1] * off, moving = run > 0 && d < L - 0.75;
    const ph = moving ? ((t * 2.6 + hh(i, 16 + seed)) % 1) : -1;
    const dir = dirOverride ?? (ux >= 0 ? 1 : -1);
    bunny(out, { view, ph, c: i % 6, mood: moving ? mood : "cute" }, x, gy, z, dir, { h: BN_H * (0.85 + hh(i, 17 + seed) * 0.3) });
  }
};

// ---------------- horses ----------------
/** 512 x 512 side view facing right, hooves on y 498; ph gallop phase */
function drawHorse(g, ph = 0, col = "#5a3a26") {
  g.clearRect(0, 0, 512, 512); g.lineJoin = g.lineCap = "round";
  const b = Math.sin(ph * two) * 8, dk = mix(col, INK, 0.35);
  const leg = (hx, hy, a, k, c) => { const kx = hx + Math.sin(a) * 50, ky = hy + 60, fx = kx + Math.sin(a + k) * 60, fy = Math.min(494, ky + 66); for (const [w, cc] of [[30, INK], [18, c]]) { g.strokeStyle = cc; g.lineWidth = w; g.beginPath(); g.moveTo(hx, hy); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke(); } E(g, fx + 4, fy, 14, 8, 0, "#2a2226", 5); };
  leg(170, 300 + b, Math.sin(ph * two + 2.4) * 0.6, 0.3, dk); leg(340, 300 + b, Math.sin(ph * two + 0.8) * 0.6, -0.3, dk);
  g.strokeStyle = INK; g.lineWidth = 34; g.beginPath(); g.moveTo(110, 250 + b); g.quadraticCurveTo(50, 280, 60, 360 + Math.sin(ph * two) * 20); g.stroke(); g.strokeStyle = "#2a2226"; g.lineWidth = 22; g.stroke(); // tail
  E(g, 250, 262 + b, 150, 64, 0, col, 9);
  g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(340, 230 + b); g.lineTo(400, 120 + b); g.lineTo(450, 130 + b); g.lineTo(400, 270 + b); g.closePath(); g.fill(); g.stroke();
  g.save(); g.translate(452, 150 + b); g.rotate(0.9); E(g, 0, 0, 62, 28, 0, col, 9); g.restore();
  g.strokeStyle = "#2a2226"; g.lineWidth = 16; g.beginPath(); g.moveTo(398, 112 + b); g.quadraticCurveTo(360, 150, 344, 236 + b); g.stroke();
  E(g, 432, 128 + b, 7, 7, 0, INK, 0); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(412, 104 + b); g.lineTo(420, 74 + b); g.lineTo(432, 106 + b); g.fill(); g.stroke();
  leg(150, 300 + b, Math.sin(ph * two) * 0.6, 0.3, col); leg(320, 300 + b, Math.sin(ph * two + 3.4) * 0.6, -0.3, col);
  g.strokeStyle = "#c8a050"; g.lineWidth = 8; g.beginPath(); g.moveTo(380, 200 + b); g.lineTo(470, 175 + b); g.stroke(); // harness
}
const horse = (out, x, gy, z, ph, dir, col = 0) => { const k = Math.round((((ph % 1) + 1) % 1) * 8) % 8, cc = ["#5a3a26", "#2e2a2e", "#d8d0c4"][col]; fxCard(out, "hs" + k + col + dir, (p) => { if (dir < 0) { p.g.translate(512, 0); p.g.scale(-1, 1); } drawHorse(p.g, k / 8, cc); }, x, gy + 1.0, z, 2.1, 2.1, { cw: 512, ch: 512, kind: "lit" }); shadowAt(out, x, gy, z, 1.6); };

// ---------------- 2D drawings ----------------
const DR = {
  dateSign: (p) => { const g = p.g; g.fillStyle = "#8a6440"; g.fillRect(0, 0, 1024, 512); for (let y = 0; y < 512; y += 128) { g.fillStyle = y % 256 ? "#94704a" : "#7e5a38"; g.fillRect(0, y, 1024, 124); g.fillStyle = "rgba(40,20,10,0.5)"; g.fillRect(0, y + 124, 1024, 4); } g.strokeStyle = INK; g.lineWidth = 18; g.strokeRect(9, 9, 1006, 494);
    txt(g, "JULY 1807", 512, 200, 190, "Rye", "#f4e6c4", "#2a1a10", 16, 940); txt(g, "NEAR PARIS", 512, 386, 104, "Rye", "#f2c45a", "#2a1a10", 12, 900); },
  nameTag: (p) => { const g = p.g; g.clearRect(0, 0, 1024, 256); g.fillStyle = "#c0353a"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 40); g.lineTo(984, 40); g.lineTo(940, 128); g.lineTo(984, 216); g.lineTo(40, 216); g.lineTo(84, 128); g.closePath(); g.fill(); g.stroke();
    txt(g, "BERTHIER", 512, 108, 104, "AlfaSlab", "#ffffff", INK, 10, 800); txt(g, "CHIEF OF STAFF", 512, 186, 46, "AlfaSlab", "#ffe08a", INK, 6, 700); },
  huntSign: (p) => { const g = p.g; g.clearRect(0, 0, 1024, 320); g.fillStyle = "#f4ecd8"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(20, 20, 984, 280, 30); g.fill(); g.stroke(); g.strokeStyle = "#2f4f9a"; g.lineWidth = 10; g.beginPath(); g.roundRect(44, 44, 936, 232, 20); g.stroke();
    txt(g, "THE GRAND", 512, 100, 64, "Rye", "#2f4f9a", INK, 0, 800); txt(g, "RABBIT HUNT", 512, 200, 130, "Rye", "#c0353a", INK, 8, 900); },
  peace: (p) => { const g = p.g; g.clearRect(0, 0, 512, 512); g.fillStyle = "#f6ecd2"; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.roundRect(70, 60, 372, 400, 16); g.fill(); g.stroke(); for (const y of [60, 460]) E(g, 256, y, 196, 24, 0, "#e6d6b0", 9);
    txt(g, "PEACE", 256, 150, 92, "Rye", "#2a1a10", INK, 0, 330); g.fillStyle = "rgba(42,26,16,0.55)"; for (let i = 0; i < 6; i++) g.fillRect(110, 210 + i * 30, 292 - (i % 2) * 60, 8); E(g, 330, 400, 40, 40, 0, "#c0353a", 7); txt(g, "N", 330, 402, 44, "AlfaSlab", "#ffe08a"); },
  flag: (p, k) => { const g = p.g; g.clearRect(0, 0, 512, 512); g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(40, 20); g.lineTo(40, 512); g.stroke(); g.strokeStyle = "#c8a050"; g.lineWidth = 8; g.stroke();
    const wv = (x, y) => y + Math.sin(x / 70 + k * 0.785) * 18 * (x / 460); const cols = ["#2a4fa8", "#fbf7ee", "#d8333a"];
    for (let i = 0; i < 3; i++) { const x0 = 48 + i * 140, x1 = x0 + 140; g.fillStyle = cols[i]; g.beginPath(); g.moveTo(x0, wv(x0, 40)); for (let x = x0; x <= x1; x += 10) g.lineTo(x, wv(x, 40)); for (let x = x1; x >= x0; x -= 10) g.lineTo(x, wv(x, 300)); g.closePath(); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(48, wv(48, 40)); for (let x = 48; x <= 468; x += 10) g.lineTo(x, wv(x, 40)); for (let x = 468; x >= 48; x -= 10) g.lineTo(x, wv(x, 300)); g.closePath(); g.stroke(); },
  burst: (p) => { const g = p.g; g.clearRect(0, 0, 512, 512); for (let i = 0; i < 20; i++) { const a0 = (i / 20) * two, a1 = ((i + 1) / 20) * two; g.fillStyle = i % 2 ? "#ffd23a" : "#ff9a2a"; g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 360, a0, a1); g.closePath(); g.fill(); } const gr = g.createRadialGradient(256, 256, 30, 256, 256, 256); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(0.35, "rgba(255,240,200,0.4)"); gr.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); },
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, s.length > 2 ? 110 : 200, "Bangers", col, INK, 14, 240); },
  word: (p, s, col, u) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); const k = 0.7 + 0.3 * Math.min(1, u * 3); g.scale(k, k); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two, r = i % 2 ? 80 : 118; g.lineTo(Math.cos(a) * r * 2, Math.sin(a) * r * 0.9); } g.closePath(); g.fill(); g.stroke(); txt(g, s, 0, 6, 92, "Bangers", col, INK, 10, 400); g.restore(); },
  coin: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); const sx = Math.abs(Math.cos(k * 0.7)) * 0.9 + 0.1; g.save(); g.translate(128, 128); g.scale(sx, 1); g.fillStyle = "#f2c84a"; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.fill(); g.stroke(); g.strokeStyle = "#c89a2a"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 80, 0, 7); g.stroke(); if (sx > 0.5) txt(g, "F", 0, 6, 90, "AlfaSlab", "#a87a1a", INK, 0); g.restore(); },
  shadow: (p) => { const g = p.g, gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "rgba(30,20,30,0.5)"); gr.addColorStop(1, "rgba(30,20,30,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); },
  puff: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); const v = k / 6; g.globalAlpha = 1 - v * 0.8; for (let i = 0; i < 6; i++) { const a = i * 1.05; E(g, 128 + Math.cos(a) * (30 + v * 60), 150 + Math.sin(a) * (16 + v * 30) - v * 20, 34 + v * 20, 28 + v * 16, 0, "#efe4cc", 6, "rgba(36,23,38,0.6)"); } g.globalAlpha = 1; },
  confetti: (p, k) => { const g = p.g; g.clearRect(0, 0, 64, 64); g.fillStyle = ["#2a4fa8", "#fbf7ee", "#d8333a", "#ffd23a", "#3fb85a", "#ff7ad0"][k % 6]; g.fillRect(8, 20, 48, 24); },
  heart: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); g.fillStyle = "#ff5a7a"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 210); g.bezierCurveTo(20, 140, 30, 40, 128, 84); g.bezierCurveTo(226, 40, 236, 140, 128, 210); g.fill(); g.stroke(); E(g, 92, 96, 16, 10, -0.6, "rgba(255,255,255,0.7)", 0); },
  /** the barred door of a hutch, 512 x 384 */
  door: (p) => { const g = p.g; g.clearRect(0, 0, 512, 384); g.lineCap = "round"; g.strokeStyle = INK; g.lineWidth = 22; g.strokeRect(14, 14, 484, 356); g.strokeStyle = "#8a6440"; g.lineWidth = 12; g.strokeRect(14, 14, 484, 356);
    for (let x = 70; x < 480; x += 52) { g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(x, 20); g.lineTo(x, 364); g.stroke(); g.strokeStyle = "#7a7a82"; g.lineWidth = 6; g.stroke(); }
    g.fillStyle = "#3a3a40"; g.fillRect(470, 170, 30, 44); },
  /** carrot + lettuce dream bubble */
  dream: (p) => { const g = p.g; g.clearRect(0, 0, 512, 512); E(g, 256, 210, 214, 168, 0, "#ffffff", 10); for (const [x, y, r] of [[150, 420, 28], [118, 476, 16]]) E(g, x, y, r, r, 0, "#ffffff", 10);
    for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.32; E(g, 300 + Math.cos(a) * 54, 210 + Math.sin(a) * 40, 60, 46, a, i % 2 ? "#7ac04a" : "#5aa83a", 7); } E(g, 300, 222, 54, 44, 0, "#9ad85a", 7);
    g.save(); g.translate(180, 230); g.rotate(-0.7); g.fillStyle = "#f08a2a"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-26, -70); g.quadraticCurveTo(0, -84, 26, -70); g.lineTo(4, 110); g.lineTo(-4, 110); g.closePath(); g.fill(); g.stroke(); g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-18 + i * 3, -40 + i * 34); g.lineTo(0, -36 + i * 34); g.stroke(); } for (const a of [-0.5, 0, 0.5]) { g.save(); g.translate(0, -76); g.rotate(a); E(g, 0, -30, 12, 34, 0, "#5aa83a", 6); g.restore(); } g.restore(); },
  /** insert: a WILD rabbit poster, crossed out */
  wild: (p, u) => { const g = p.g; g.fillStyle = "#e9dcbc"; g.fillRect(0, 0, 576, 1024); g.fillStyle = "rgba(120,90,50,0.12)"; for (let i = 0; i < 60; i++) g.fillRect(hh(i, 1) * 576, hh(i, 2) * 1024, 40 + hh(i, 3) * 80, 3);
    g.strokeStyle = "#5a3e26"; g.lineWidth = 14; g.strokeRect(30, 150, 516, 724);
    txt(g, "WILD", 288, 250, 150, "Rye", "#5a3e26", INK, 0, 500); txt(g, "RABBITS", 288, 360, 90, "Rye", "#5a3e26", INK, 0, 500);
    g.save(); g.translate(288, 640); g.scale(0.82, 0.82); g.translate(-256, -256); drawBunny(g, { view: "side", c: 1, mood: "charge", ear: 0, keep: true }); g.restore();
    if (u > 0) { const k = clamp01(u * 2.5); g.strokeStyle = "#d8333a"; g.lineWidth = 46; g.lineCap = "round"; g.beginPath(); g.moveTo(80, 440); g.lineTo(80 + 416 * Math.min(1, k * 2), 440 + 380 * Math.min(1, k * 2)); if (k > 0.5) { g.moveTo(496, 440); g.lineTo(496 - 416 * (k - 0.5) * 2, 440 + 380 * (k - 0.5) * 2); } g.stroke(); }
    if (u > 0.5) txt(g, "NOPE!", 288, 940, 110 * smooth((u - 0.5) * 4), "Bangers", "#d8333a", INK, 10); },
  crate: (p) => { const g = p.g; g.fillStyle = "#9a7a54"; g.fillRect(0, 0, 512, 384); g.strokeStyle = INK; g.lineWidth = 16; g.strokeRect(8, 8, 496, 368); for (let x = 60; x < 480; x += 70) { g.lineWidth = 10; g.beginPath(); g.moveTo(x, 10); g.lineTo(x, 374); g.stroke(); } },
  post: (p) => { p.g.fillStyle = INK; p.g.fillRect(0, 0, 64, 512); p.g.fillStyle = "#7a5a3a"; p.g.fillRect(10, 0, 44, 512); },
  spark: (p) => { p.poly([[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], "#fffbe8", 8); },
};

// ---------------- props drawn on people's cards (p.hands is set by bodyFront) ----------------
const gunAt = (p, x0, y0, ang, len = 420) => { const g = p.g, c = Math.cos(ang), s = Math.sin(ang); g.lineCap = "round";
  const bx = x0 - c * 90, by = y0 - s * 90, mx = x0 + c * 120, my = y0 + s * 120, ex = x0 + c * len, ey = y0 + s * len;
  g.strokeStyle = INK; g.lineWidth = 34; g.beginPath(); g.moveTo(bx, by); g.lineTo(mx, my); g.stroke(); g.strokeStyle = "#8a5a34"; g.lineWidth = 22; g.stroke();
  g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(mx, my); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = "#6a6e78"; g.lineWidth = 8; g.stroke(); };
const stickAt = (p, x0, y0, ang, len = 300, col = "#6a4a2a") => { const g = p.g, ex = x0 + Math.cos(ang) * len, ey = y0 + Math.sin(ang) * len; g.lineCap = "round"; g.strokeStyle = INK; g.lineWidth = 20; g.beginPath(); g.moveTo(x0, y0); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = col; g.lineWidth = 10; g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(x0, y0, 14, 0, 7); g.fill(); };
const XL = {
  gunShoulder: () => (p) => { const H = p.hands; if (!H || !H.r) return; gunAt(p, H.r[0], H.r[1], -Math.PI / 2 - 0.25, 400); },
  gunAim: () => (p) => { const H = p.hands; if (!H || !H.l || !H.r) return; const a = Math.atan2(H.l[1] - H.r[1], H.l[0] - H.r[0]); gunAt(p, H.r[0], H.r[1], a, 440); },
  gunLow: () => (p) => { const H = p.hands; if (!H || !H.r) return; gunAt(p, H.r[0], H.r[1], -Math.PI / 2 + 0.35, 380); },
  stick: (ang, col) => (p) => { const H = p.hands; if (!H || !H.r) return; stickAt(p, H.r[0], H.r[1], ang, 300, col); },
  scroll: () => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1] - 30); g.rotate(0.2); g.fillStyle = "#f6ecd2"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-30, -60, 60, 120, 8); g.fill(); g.stroke(); g.fillStyle = "rgba(42,26,16,0.5)"; for (let i = 0; i < 4; i++) g.fillRect(-18, -38 + i * 20, 36, 5); g.restore(); },
  quill: () => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(-0.6); g.fillStyle = "#fbf7ee"; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 10); g.quadraticCurveTo(30, -60, 6, -130); g.quadraticCurveTo(-24, -60, 0, 10); g.fill(); g.stroke(); g.restore(); },
};
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });

// ---------------- cast ----------------
const NAPO = { jacket: "#2c3f86", pants: "#f1efe6", boots: INK, hat: "bicorne", buttons: "#e8c45a", skin: "#f2d2b6", build: "stout" };
const BERT = { jacket: "#33508f", pants: "#f1efe6", boots: INK, hat: "bicorne", plume: true, buttons: "#e8c45a", sash: "#c0353a", moustache: "#4a3020", skin: "#e8c3a0" };
const RUSS = { jacket: "#2f5a3a", pants: "#f1efe6", boots: INK, hat: "shako_tall", buttons: "#e8c45a", sash: "#e8c45a", skin: "#f0d0b4", moustache: "#c09a5a" };
const MEN = [
  { jacket: "#3a4f8a", pants: "#f1efe6", boots: INK, hat: "bicorne", buttons: "#e8c45a", skin: "#e8c3a0", moustache: "#3a2a20" },
  { jacket: "#357650", pants: "#e8e0cc", boots: INK, hat: "shako", buttons: "#d9dde0", belt: "#f1efe6", skin: "#d9a77c" },
  { jacket: "#8a2a32", pants: "#f1efe6", boots: INK, hat: "bicorne", buttons: "#e8c45a", skin: "#f2d2b6", moustache: "#6a4a2a", build: "stout" },
];
const FARMER = { jacket: "#e8dcc0", pants: "#6a5a44", bib: "#8a6a44", boots: "#3a2a1a", skin: "#e0b48a", hat: "cap", cap: "#c8a050", moustache: "#5a4030" };

// ---------------- card helpers ----------------
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });
const screenCard = (out, c, key, draw, d = 0.6, cw = 1024, ch = 512, kind = "soft") => {
  const fx = c.look[0] - c.pos[0], fy = c.look[1] - c.pos[1], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fy, fz);
  const h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.03, w = h * (9 / 16) * 1.03;
  out.fx.push({ key, cw, ch, draw, x: c.pos[0] + (fx / n) * d, y: c.pos[1] + (fy / n) * d, z: c.pos[2] + (fz / n) * d, w, h, kind });
};
const shadowAt = (out, x, gy, z, w) => fxCard(out, "shadowEll", DR.shadow, x, gy + 0.012, z, w, w * 0.45, { cw: 256, ch: 256, kind: "soft", flat: true });
const mark = (out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); fxCard(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256 }); };
const bubble = (out, key, draw, x, y, z, u, s = 1) => { if (u <= 0) return; const k = smooth(Math.min(1, u)); fxCard(out, key, draw, x, y, z, s * k, s * k, { cw: 512, ch: 512 }); };
const sign = (out, key, draw, cw, ch, x, y, z, w, h, normal = [0, 0, 1], kind = "lit") => fxCard(out, key, draw, x, y, z, w, h, { cw, ch, normal, kind });
const word = (out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.4) return; const k = Math.round(Math.min(1, u) * 6); fxCard(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
const confetti = (out, t, cx, cy, cz, rx, rz, n = 40, h = 4) => { for (let i = 0; i < n; i++) { const v = ((t * 0.32) + hh(i, 3)) % 1, k = i % 6; fxCard(out, "conf" + k, (p) => DR.confetti(p, k), cx + (hh(i, 4) - 0.5) * 2 * rx + Math.sin(t * 2 + i) * 0.3, cy + h * (1 - v), cz + (hh(i, 5) - 0.5) * 2 * rz, 0.06, 0.06, { cw: 64, ch: 64, kind: "basic", rot: t * (2 + hh(i, 6) * 4) + i }); } };
const puff = (out, t, x, y, z, s = 0.6, seed = 0) => { const k = Math.floor((t * 10 + seed) % 7); fxCard(out, "puff" + k, (p) => DR.puff(p, k), x, y, z, s, s, { cw: 256, ch: 256, kind: "basic" }); };

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[1];
function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const [nx, , nz] = NAP, n_ = (x, y, z) => [nx + x, y, nz + z];
  const day = { light: "day", sunAz: 200, sunEl: 48, fogFar: 3000 };
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const G = 0.05; // meadow height

  // the hero spot (shot 1 and the loop): Napoleon on the meadow, tricolour flag, low camera against the sky
  const HZ = 22;
  const hero = (t, out, t0, withBunny) => {
    const fk = Math.floor(t * 8) % 8; fxCard(out, "flag" + fk, (p) => DR.flag(p, fk), nx + 0.95, 1.85, nz + HZ - 0.4, 1.7, 1.7, { cw: 512, ch: 512, kind: "lit" });
    out.places.push(pl(1, NAPO, nx, G, nz + HZ, { expr: "proud", arms: { l: ["hips", 1], r: ["point", 1] }, headTilt: -4 }));
    if (withBunny) { const u = t - t0; if (u > 0) { const x = Math.min(-0.3, -1.2 + u * 1.4), sit = x >= -0.3; bunny(out, { view: sit ? "front" : "side", ph: sit ? -1 : (u * 2.6) % 1, c: 0, mood: sit ? "cute" : "happy" }, nx + x, G, nz + HZ + 0.75, 1, { h: 0.44 }); } }
  };
  const heroCam = push(n_(0.3, 0.5, HZ + 3.5), n_(0.0, 1.3, HZ), n_(0.28, 0.48, HZ + 3.2), n_(0.0, 1.28, HZ), 46, 3.0);
  // 1 Napoleon conquered half of Europe... : the hero; a bunny hops in and sits at his boots
  shot({ a: 0, ...day, cam: heroCam, cInf: 2, focus: n_(0, 1.2, HZ), shadowR: 8,
    stage(t, out) { hero(t, out, 1.3, true); } });
  // 2 then bunnies beat him.: swarmed in the meadow, arms up, a ring of bunnies hopping round his boots
  const NZ = 9;
  shot({ at: S("then"), ...day, cam: push(n_(0.25, 1.05, NZ + 3.4), n_(0, 0.75, NZ), n_(0.2, 1.0, NZ + 3.0), n_(0, 0.75, NZ), 46, 1.4), cInf: 3, focus: n_(0, 0.8, NZ), shadowR: 8,
    stage(t, out) { const tb = T("beat"); out.places.push(pl(1, NAPO, nx, G + (t > tb ? Math.abs(Math.sin(t * 10)) * 0.04 : 0), nz + NZ, { expr: t > tb ? "shock" : "worried", arms: { l: ["up", 1], r: ["up", 0.8 + 0.2 * Math.sin(t * 9)] } }));
      for (let i = 0; i < 16; i++) { const a = i / 16 * two + t * (i % 2 ? 1.6 : -1.3), r = 0.55 + (i % 3) * 0.32; const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.7; bunny(out, { view: "side", ph: (t * 2.8 + i * 0.37) % 1, c: i % 6, mood: "charge" }, nx + x, G, nz + NZ + z, (Math.sin(a) * (i % 2 ? 1 : -1)) > 0 ? -1 : 1, { h: 0.42 }); }
      mark(out, "!!", nx + 0.55, 2.15, nz + NZ, (t - tb) * 1.6, 0.42); } });
  kick1(T("beat") + 0.02);
  // 3 July 1807.: crane down over the estate: château, lunch tent, the hutches; the date on a painted board
  shot({ at: S("July"), ...day, cam: push(n_(5.5, 8, 30), n_(0, 2, -40), n_(3.6, 1.8, 19.6), n_(2.0, 1.4, 6), 46, 1.8), cInf: 0.8, focus: n_(2.9, 1.3, 15.5), shadowR: 40,
    stage(t, out) { sign(out, "dateSign", DR.dateSign, 1024, 512, nx + 3.3, 1.95, nz + 15.4, 1.8, 0.9, [0.3, 0, 1]); for (const x of [2.55, 4.05]) fxCard(out, "post", DR.post, nx + x, 0.7, nz + 15.38, 0.09, 1.4, { cw: 64, ch: 512, kind: "lit", normal: [0.25, 0, 1] });
      for (let k = 0; k < 4; k++) bunny(out, { view: "front", ph: -1, c: k }, nx - 5 + k * 2 + 0.1, 0.12, nz - 0.4, 1, { h: 0.36, shadow: false }); } });
  // 4 He just made peace with Russia.: a handshake, the treaty pops up
  shot({ at: S("He just"), ...day, cam: push(n_(0.05, 1.45, 19.0 + 3.9), n_(0, 1.3, 19), n_(0.05, 1.45, 19 + 3.5), n_(0, 1.32, 19), 46, 2.0), cInf: 3, focus: n_(0, 1.2, 19), shadowR: 8,
    stage(t, out) { const sh = Math.sin(t * 9) * 0.04; out.places.push(pl(1, NAPO, nx - 0.55, G, nz + 19, { expr: Math.floor(t * 4) % 3 ? "smile" : "proud", arms: { r: ["out", 0.85 + sh] } }));
      out.places.push(pl(2, RUSS, nx + 0.55, G, nz + 19, { expr: Math.floor(t * 4 + 1) % 3 ? "grin" : "smile_closed", arms: { l: ["out", 0.85 - sh], r: ["hold", 1] }, extra: XL.scroll() }));
      const tp = T("peace"), k = smooth((t - tp + 0.1) / 0.25); if (k > 0) sign(out, "peace", DR.peace, 512, 512, nx, 2.25 + 0.04 * Math.sin(t * 3), nz + 19.1, 0.7 * k, 0.7 * k, [0, 0, 1], "basic");
      for (let i = 0; i < 5; i++) { const v = ((t * 0.9) + i / 5) % 1; fxCard(out, "spark", DR.spark, nx + Math.cos(i * 1.3 + t) * 0.25, 1.3 + Math.sin(i * 1.3 + t) * 0.2, nz + 19.15, 0.08 * Math.sin(v * Math.PI), 0.08 * Math.sin(v * Math.PI), { cw: 256, ch: 256, kind: "basic" }); } } });
  // 5 So his chief of staff, Berthier,: hero intro on a sunburst with his name ribbon
  const BX = 4, BZ = 16;
  shot({ at: S("So his"), ...day, cam: push(n_(BX + 0.05, 1.25, BZ + 2.35), n_(BX, 1.25, BZ), n_(BX + 0.05, 1.28, BZ + 2.0), n_(BX, 1.3, BZ), 44, 2.0), cInf: 2, focus: n_(BX, 1.3, BZ), shadowR: 8,
    stage(t, out) { const tb = T("Berthier"), u = smooth((t - tb + 0.1) / 0.3); fxCard(out, "burst", DR.burst, nx + BX, 1.3, nz + BZ - 0.7, 5.2 * (0.7 + 0.3 * u), 5.2 * (0.7 + 0.3 * u), { cw: 512, ch: 512, kind: "basic", rot: t * 0.5 });
      out.places.push(pl(3, BERT, nx + BX, G, nz + BZ, { expr: u > 0.5 ? "proud" : "smile", arms: { l: ["hips", 1], r: ["up", 0.35 + 0.2 * u] }, extra: XL.quill() }));
      if (u > 0) sign(out, "nameTag", DR.nameTag, 1024, 256, nx + BX, 0.62, nz + BZ + 0.25, 1.35 * u, 0.34 * u, [0, 0, 1], "basic"); } });
  kick1(T("Berthier") + 0.02);
  // 6 plans a party.: at the lunch tent, presenting the table; confetti
  const TX = 7, TZ = -7;
  shot({ at: S("plans"), ...day, cam: push(n_(TX - 0.3, 1.5, TZ + 4.6), n_(TX - 0.6, 1.05, TZ), n_(TX - 0.3, 1.48, TZ + 4.2), n_(TX - 0.6, 1.05, TZ), 46, 1.5), cInf: 2, focus: n_(TX - 0.6, 1.1, TZ + 1.2), shadowR: 10,
    stage(t, out) { out.places.push(pl(3, BERT, nx + TX - 0.6, G, nz + TZ + 1.25, { expr: Math.floor(t * 5) % 3 ? "grin" : "talk_o", arms: { l: ["out", 1], r: ["up", 0.6 + 0.2 * Math.sin(t * 6)] } }));
      confetti(out, t, nx + TX - 0.6, 0, nz + TZ + 1.4, 1.2, 0.5, 46, 3); } });
  // 7 A rabbit hunt.: the hunters, muskets on shoulders, grinning; the sign above
  const HL = 9; // hunters' line z
  const hunters = (out, t, o = {}) => { const xs = [-0.78, 0, 0.78], who = [MEN[0], NAPO, MEN[2]]; xs.forEach((x, k) => out.places.push(pl(10 + k, who[k], nx + x, G, nz + HL + (k === 1 ? 0.2 : 0), { expr: o.expr ? o.expr(k) : ["grin", "proud", "smile"][k], arms: o.arms ? o.arms(k) : { r: ["shoulder", 1] }, extra: o.extra ? o.extra(k) : XL.gunShoulder(), backView: !!o.back }))); };
  shot({ at: S("A rabbit"), ...day, cam: push(n_(0.1, 1.35, HL + 3.6), n_(0, 1.3, HL), n_(0.1, 1.35, HL + 3.25), n_(0, 1.32, HL), 46, 1.4), cInf: 2, focus: n_(0, 1.2, HL), shadowR: 8,
    stage(t, out) { hunters(out, t); const u = smooth((t - T("hunt") + 0.15) / 0.25); if (u > 0) sign(out, "huntSign", DR.huntSign, 1024, 320, nx, 2.3, nz + HL + 0.6, 1.5 * u, 0.47 * u, [0, 0, 1], "lit"); } });
  kick1(T("hunt") + 0.05);
  // 8 Hundreds of rabbits wait in cages.: dolly along the hutches, bunnies behind bars, ears twitching
  const door = (out, k, ang = 0) => { const x0 = nx - 5 + k * 2 - 0.6, w = 1.2, cx = x0 + Math.cos(ang) * w / 2, cz = nz + 0.02 + Math.sin(ang) * w / 2; fxCard(out, "door", DR.door, cx, 0.47, cz, w, 0.7, { cw: 512, ch: 384, kind: "lit", normal: [-Math.sin(ang), 0, Math.cos(ang)] }); };
  const inCage = (out, t, k, mood = "cute") => { for (let j = 0; j < 4; j++) { const x = nx - 5 + k * 2 - 0.42 + j * 0.28, tw = Math.floor(t * 3 + j + k) % 5 === 0; bunny(out, { view: j % 2 ? "front" : "side", ph: -1, c: (k * 4 + j) % 6, mood, ear: tw ? 0.5 : 0 }, x, 0.12, nz - 0.45 + (j % 2) * 0.12, j % 3 ? 1 : -1, { h: 0.36, shadow: false }); } };
  shot({ at: S("Hundreds"), ...day, cam: (l) => { const x = -4.6 + l * 1.05; return { pos: n_(x, 0.72, 2.3), look: n_(x - 0.25, 0.45, 0), fov: 44, roll: 0 }; }, cInf: 3, focus: n_(-3, 0.45, 0), shadowR: 8,
    stage(t, out) { for (let k = 0; k < 6; k++) { inCage(out, t, k); door(out, k); } } });
  // 9 But there's one problem.: close on one hutch: the cutest face behind the bars, a "?"
  shot({ at: S("But"), ...day, cam: push(n_(1.05, 0.44, 1.05), n_(1.0, 0.36, -0.3), n_(1.03, 0.43, 0.85), n_(1.0, 0.36, -0.3), 40, 1.6), cInf: 5, focus: n_(1.0, 0.35, -0.2), shadowR: 6,
    stage(t, out) { door(out, 3); bunny(out, { view: "front", ph: -1, c: 0, mood: Math.floor(t * 2) % 4 === 3 ? "happy" : "cute", ear: 0.25 * Math.abs(Math.sin(t * 3)) }, nx + 1.0, 0.12, nz - 0.18, 1, { h: 0.42, shadow: false });
      for (const [dx, c] of [[-0.35, 3], [0.36, 1]]) bunny(out, { view: "front", ph: -1, c, mood: "cute" }, nx + 1.0 + dx, 0.12, nz - 0.5, 1, { h: 0.34, shadow: false });
      mark(out, "?", nx + 1.28, 0.72, nz - 0.1, (t - T("problem") + 0.1) * 1.5, 0.22); } });
  // 10 Berthier didn't catch wild rabbits.: insert, a wild rabbit poster gets crossed out
  shot({ at: S("Berthier didn't"), ...day, cam: () => ({ pos: n_(0, 40, 60), look: n_(0, 40, 0), fov: 40, roll: 0 }), cInf: 0, focus: n_(0, 40, 0), shadowR: 6,
    stage(t, out, c) { const u = clamp01((t - T("wild") + 0.05) / 0.9); screenCard(out, c, "wild" + Math.round(u * 20), (p) => DR.wild(p, Math.round(u * 20) / 20), 0.6, 576, 1024, "basic"); } });
  kick1(T("wild") + 0.2);
  // 11 He bought tame ones... from local farmers.: a farmer holds a fluffy white bunny; a coin flips over
  const FX = -4, FZ = 14;
  shot({ at: S("He bought"), ...day, cam: push(n_(FX + 0.5, 1.35, FZ + 3.9), n_(FX + 0.5, 1.05, FZ), n_(FX + 0.5, 1.35, FZ + 3.5), n_(FX + 0.5, 1.07, FZ), 46, 2.4), cInf: 3, focus: n_(FX + 0.4, 1.1, FZ), shadowR: 8,
    stage(t, out) { const tf = T("farmers"); out.places.push(pl(20, FARMER, nx + FX, G, nz + FZ, { expr: Math.floor(t * 5) % 3 ? "grin" : "talk_e", arms: { l: ["hold", 1], r: ["hold", 1] } }));
      bunny(out, { view: "front", ph: -1, c: 0, mood: Math.floor(t * 1.5) % 3 === 2 ? "happy" : "cute" }, nx + FX + 0.02, 0.68, nz + FZ + 0.12, 1, { h: 0.4, shadow: false });
      out.places.push(pl(3, BERT, nx + FX + 1.05, G, nz + FZ - 0.1, { expr: "smile", arms: { l: ["out", 0.9] } }));
      for (let k = 0; k < 3; k++) { fxCard(out, "crate", DR.crate, nx + FX - 0.7 + k * 0.62, 0.28 + (k === 1 ? 0.5 : 0), nz + FZ - 0.9, 0.6, 0.45, { cw: 512, ch: 384, kind: "lit", normal: [0, 0, 1] });
        bunny(out, { view: "front", ph: -1, c: k + 2, ear: Math.floor(t * 2 + k) % 4 === 0 ? 0.5 : 0 }, nx + FX - 0.7 + k * 0.62, 0.05 + (k === 1 ? 0.5 : 0) + 0.3, nz + FZ - 0.95, 1, { h: 0.3, shadow: false }); }
      const v = clamp01((t - T("tame") + 0.1) / 0.7); if (v > 0 && v < 1) { const ck = Math.floor(t * 20) % 9; fxCard(out, "coin" + ck, (p) => DR.coin(p, ck), nx + FX + 0.75 - v * 0.6, 1.3 + Math.sin(v * Math.PI) * 0.5, nz + FZ + 0.2, 0.14, 0.14, { cw: 256, ch: 256, kind: "lit" }); }
      word(out, "TAME!", "#3fb85a", nx + FX + 0.5, 2.15, nz + FZ + 0.1, (t - T("tame") + 0.05) * 1.5, 0.9);
      if (t > tf - 0.2) for (let i = 0; i < 3; i++) { const v2 = ((t * 0.8) + i / 3) % 1; fxCard(out, "heart", DR.heart, nx + FX + 0.05 + (i - 1) * 0.12, 1.05 + v2 * 0.5, nz + FZ + 0.15, 0.12 * Math.sin(v2 * Math.PI), 0.12 * Math.sin(v2 * Math.PI), { cw: 256, ch: 256, kind: "basic" }); } } });
  // 12 The cages open.: the barred doors swing open; bunnies peek out
  shot({ at: S("The cages"), ...day, cam: push(n_(0.2, 1.05, 4.6), n_(0, 0.42, 0), n_(0.15, 0.95, 4.0), n_(0, 0.4, 0), 44, 2.0), cInf: 2, focus: n_(0, 0.45, 0), shadowR: 10,
    stage(t, out) { const to = T("open"); for (let k = 0; k < 6; k++) { const u = smooth((t - to + 0.1 - k * 0.06) / 0.3); door(out, k, u * 1.75); const pk = smooth((t - to - 0.4 - k * 0.1) / 0.5);
      for (let j = 0; j < 3; j++) bunny(out, { view: j === 1 ? "front" : "side", ph: -1, c: (k * 3 + j) % 6, ear: pk > 0 ? 0 : 0.4 }, nx - 5 + k * 2 - 0.3 + j * 0.3, 0.12, nz - 0.45 + pk * (0.3 + j * 0.12), j === 2 ? -1 : 1, { h: 0.36, shadow: false }); }
      for (let k = 0; k < 6; k++) mark(out, "!", nx - 5 + k * 2, 1.15, nz + 0.05, (t - to - 0.25 - k * 0.05) * 2, 0.18); } });
  kick1(T("open") + 0.1);
  // 13 The hunters raise their guns.: reverse from by the hutches: the line brings its muskets up to aim
  shot({ at: S("The hunters"), ...day, cam: push(n_(0.3, 1.25, HL - 3.6), n_(0, 1.3, HL), n_(0.25, 1.25, HL - 3.2), n_(0, 1.32, HL), 46, 2.0), cInf: 2.5, focus: n_(0, 1.2, HL), shadowR: 8,
    stage(t, out) { const ur = smooth((t - T("raise") + 0.1) / 0.45), aim = ur > 0.5;
      hunters(out, t, { expr: (k) => aim ? ["sly", "stern", "sly"][k] : "smile", arms: (k) => aim ? { l: ["point", 1], r: ["hold", 1] } : { r: ["shoulder", 1 - ur] }, extra: (k) => aim ? XL.gunAim() : XL.gunLow() });
      for (let i = 0; i < 5; i++) bunny(out, { view: "back", ph: -1, c: i }, nx - 1.0 + i * 0.5, G, nz + HL - 1.9 - (i % 2) * 0.3, 1, { h: 0.4 }); } });
  // 14 And the rabbits... charge.: ground level in front of the hutches: a wave of bunnies hops straight at the lens
  shot({ at: S("And the"), ...day, cam: push(n_(0.1, 0.32, 5.4), n_(0, 0.38, 0), n_(0.1, 0.3, 5.1), n_(0, 0.36, 0), 46, 1.3), cInf: 2, focus: n_(0, 0.35, 2.4), shadowR: 10,
    stage(t, out) { const tc = T("charge"); for (let k = 0; k < 6; k++) door(out, k, 1.75);
      const u = t - T("rabbits", T("And the")) + 0.1; for (let i = 0; i < 26; i++) { const d = Math.max(0, u) * (5.0 + hh(i, 1) * 2.5) - hh(i, 2) * 0.8, x = (hh(i, 3) - 0.5) * 3.6 * (1 - Math.min(0.5, Math.max(0, d) / 10)), z = 0.25 + Math.max(0, d); if (z > 4.9) continue;
        bunny(out, { view: "front", ph: u > 0 ? (t * 2.8 + hh(i, 4)) % 1 : -1, c: i % 6, mood: u > 0 ? "charge" : "cute", ear: u > 0 ? 0.5 : 0 }, nx + x, G, nz + z, 1, { h: 0.4 }); }
      word(out, "CHARGE!", "#d8333a", nx, 1.05, nz + 2.4, (t - tc - 0.05) * 1.6, 1.0); } });
  kick1(T("charge") + 0.03);
  // 15 Straight at Napoleon.: over the bunnies' backs: the whole meadow hopping at a startled Emperor
  const tN2 = T("Napoleon", T("Straight") - 0.01);
  shot({ at: S("Straight"), ...day, cam: push(n_(0.3, 0.55, HL - 4.4), n_(0, 1.0, HL), n_(0.2, 0.5, HL - 3.4), n_(0, 1.05, HL), 44, 1.6), cInf: 2.5, focus: n_(0, 1.0, HL), shadowR: 10,
    stage(t, out) { out.places.push(pl(1, NAPO, nx, G, nz + HL, { expr: t > tN2 ? "shock" : "worried", arms: t > tN2 ? { l: ["up", 0.7], r: ["head", 1] } : { r: ["hold", 1] }, extra: t > tN2 ? undefined : XL.gunLow() }));
      for (let i = 0; i < 18; i++) { const v = ((t - T("Straight")) * 0.9 + hh(i, 5)) % 1, z = HL - 4.0 + v * 3.6, x = (hh(i, 6) - 0.5) * 2.2 * (1 - v * 0.6); bunny(out, { view: "back", ph: (t * 2.6 + hh(i, 7)) % 1, c: i % 6 }, nx + x, G, nz + z, 1, { h: 0.42 }); }
      mark(out, "!", nx + 0.4, 2.05, nz + HL, (t - tN2) * 1.6, 0.4); } });
  kick1(tN2 + 0.05);
  // 16 They think he brought dinner.: one bunny looks up, licks its lips, dreams of lettuce and carrots
  shot({ at: S("They think"), ...day, cam: push(n_(0.08, 0.42, HL - 1.15), n_(0.05, 0.6, HL - 2.4), n_(0.08, 0.42, HL - 1.3), n_(0.05, 0.62, HL - 2.4), 42, 1.6), cInf: 4, focus: n_(0.05, 0.4, HL - 2.4), shadowR: 6,
    stage(t, out) { const td = T("dinner"); bunny(out, { view: "front", ph: -1, c: 3, mood: t > td - 0.1 ? "dream" : "cute", tongue: t > td && Math.floor(t * 6) % 2 === 0 }, nx + 0.05, G, nz + HL - 2.4, 1, { h: 0.46 });
      bubble(out, "dream", DR.dream, nx + 0.3, 0.98, nz + HL - 2.45, (t - T("think") - 0.05) / 0.25, 0.55); } });
  // 17 They swarm his boots.: boot level: bunnies nibbling and nuzzling the Emperor's boots
  shot({ at: S("They swarm"), ...day, cam: push(n_(0.25, 0.55, HL + 2.4), n_(0, 0.45, HL), n_(0.2, 0.52, HL + 2.1), n_(0, 0.47, HL), 46, 1.4), cInf: 3, focus: n_(0, 0.4, HL), shadowR: 6,
    stage(t, out) { out.places.push(pl(1, NAPO, nx, G + Math.abs(Math.sin(t * 12)) * 0.02, nz + HL, { expr: "shock" }));
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI + 0.1, r = 0.32 + (i % 3) * 0.2; const x = Math.cos(a) * r * 1.3, z = Math.sin(a) * r * 0.8 + 0.08; const nib = Math.floor(t * 6 + i) % 3 === 0;
        bunny(out, { view: i % 3 === 1 ? "front" : "side", ph: Math.floor(t * 3 + i) % 4 === 0 ? 0.5 : -1, c: i % 6, mood: nib ? "happy" : "charge", tongue: nib }, nx + x, G, nz + HL + z, x > 0 ? -1 : 1, { h: 0.42 }); }
      for (let i = 0; i < 3; i++) mark(out, ["NOM", "NOM", "NIBBLE"][i], nx + (i - 1) * 0.35, 0.85 + (i % 2) * 0.15, nz + HL + 0.5, (t - T("swarm") - 0.15 * i) * 2, 0.22); } });
  // 18 Climb his legs.: bunnies scramble up his legs and coat; he flails
  shot({ at: S("Climb"), ...day, cam: push(n_(0.1, 1.05, HL + 2.35), n_(0, 0.95, HL), n_(0.1, 1.05, HL + 2.0), n_(0, 0.97, HL), 46, 1.3), cInf: 3, focus: n_(0, 0.95, HL), shadowR: 6,
    stage(t, out) { out.places.push(pl(1, NAPO, nx, G, nz + HL, { expr: Math.floor(t * 6) % 2 ? "shock" : "pained", arms: { l: ["up", 0.6 + 0.4 * Math.abs(Math.sin(t * 8))], r: ["out", 0.6 + 0.4 * Math.abs(Math.cos(t * 7))] }, tilt: 3 * Math.sin(t * 9) }));
      const u = t - T("Climb"); const climbers = [[-0.14, 0.15, 1.35], [0.15, 0.25, 1.8], [-0.1, 0.6, 1.5], [0.22, 0.85, 1.6], [-0.3, 1.05, 1.3]];
      climbers.forEach(([x, y0, r], i) => { const y = Math.min(y0 + 0.5, y0 + Math.max(0, u - i * 0.08) * 0.35); bunny(out, { view: "side", ph: Math.floor(t * 6 + i) % 2 ? 0.3 : -1, c: i % 6, mood: "charge" }, nx + x, y, nz + HL + 0.12 + i * 0.01, x > 0 ? -1 : 1, { h: 0.36, rot: (x > 0 ? -1 : 1) * r, shadow: false }); });
      for (let i = 0; i < 8; i++) bunny(out, { view: "side", ph: (t * 2.6 + i * 0.3) % 1, c: (i + 2) % 6, mood: "charge" }, nx + (hh(i, 8) - 0.5) * 1.6, G, nz + HL + 0.25 + hh(i, 9) * 0.4, hh(i, 10) > 0.5 ? 1 : -1, { h: 0.4 }); } });
  kick1(T("legs") + 0.02);
  // 19 His men swing riding crops and sticks.: two officers flail; the bunnies dodge and keep hopping
  shot({ at: S("His men"), ...day, cam: push(n_(0.1, 1.4, HL + 4.6), n_(0, 0.95, HL), n_(0.1, 1.35, HL + 4.2), n_(0, 0.97, HL), 46, 2.6), cInf: 2, focus: n_(0, 0.95, HL), shadowR: 8,
    stage(t, out) { [[MEN[0], -0.55, 0.0], [MEN[2], 0.58, 0.6]].forEach(([o, x, ph], k) => { const sw = Math.sin((t * 3.2 + ph) * two) > 0;
        out.places.push(pl(10 + k * 2, o, nx + x, G, nz + HL + 0.1 * k, { expr: sw ? "angry" : "annoyed", arms: sw ? { r: ["chop", 1] } : { r: ["overhead", 1] }, extra: XL.stick(sw ? Math.PI / 2 + (k ? 0.5 : -0.5) : -Math.PI / 2 + (k ? 0.4 : -0.4), k ? "#3a2a20" : "#6a4a2a") })); if (sw) puff(out, t, nx + x + (k ? 0.45 : -0.45), 0.25, nz + HL + 0.35, 0.45, k * 3); });
      for (let i = 0; i < 14; i++) { const a = i / 14 * two + t * 1.4, r = 0.6 + (i % 3) * 0.35; bunny(out, { view: "side", ph: (t * 2.8 + i * 0.29) % 1, c: i % 6, mood: "charge" }, nx + Math.cos(a) * r * 1.2, G, nz + HL + 0.4 + Math.sin(a) * r * 0.5, Math.sin(a) > 0 ? 1 : -1, { h: 0.4 }); }
      word(out, "WHACK!", "#ffe85a", nx - 0.9, 1.9, nz + HL + 0.3, (t - T("swing") + 0.05) * 2, 0.8); word(out, "MISS!", "#ffffff", nx + 0.85, 1.95, nz + HL + 0.3, (t - T("sticks") + 0.05) * 2, 0.75); } });
  // 20 The bunnies keep coming.: high and wide: wave after wave across the meadow towards the little group
  shot({ at: S("The bunnies"), ...day, cam: push(n_(5, 6.5, 20), n_(0, 0, 5), n_(4.4, 5.8, 18.5), n_(0, 0, 5.5), 44, 1.6), cInf: 0.6, focus: n_(0, 0, 7), shadowR: 25,
    stage(t, out) { [[-0.6, MEN[0]], [0, NAPO], [0.7, MEN[2]]].forEach(([x, o], k) => out.places.push(pl(10 + k, o, nx + x, G, nz + HL, { expr: "shock", arms: { l: ["up", 1], r: ["up", 1] } })));
      for (let w = 0; w < 3; w++) horde(out, t, 22, [nx - 4 + w * 3, nz + 0.6], [nx + (w - 1) * 0.5, nz + HL - 0.2], T("The bunnies") - 1.2 + w * 0.25, 4.2, 1.6, "side", "charge", w * 7); } });
  // 21 So the emperor runs... to his carriage.: side tracking: Napoleon sprints left, the horde behind him, the coach ahead
  const CX = -12, tRun = T("So the"), run = (t) => -3.0 - (t - tRun) * 4.2;
  const coach = (out, z, ph, bob = 0) => { out.veh.push({ type: "coach", x: nx + CX, y: bob, z: nz + z, yaw: 0, mat: "coach" }); horse(out, nx + CX - 0.5, 0, nz + z + 3.5, ph, 1, 0); horse(out, nx + CX + 0.55, 0, nz + z + 3.4, ph + 0.5, 1, 1); };
  shot({ at: S("So the"), ...day, cam: (l) => { const r = run(tRun - 0.1 + l), x = Math.max(CX + 3.0, r + 0.5); return { pos: n_(x, 1.2, HL + 3.4), look: n_(Math.max(CX + 0.8, r + 0.1), 0.95, HL), fov: 58, roll: 0 }; }, cInf: 1.5, focus: n_(-6, 1, HL), shadowR: 12,
    stage(t, out) { const x = Math.max(CX + 1.15, run(t)), inside = run(t) < CX + 0.6; if (!inside) out.places.push(pl(1, NAPO, nx + x, G, nz + HL + 0.3, { dir: [-1, 0], view: "side", mode: "march", stride: 1.3, phase: (t * 2.4) % 1, expr: "shock" }));
      coach(out, HL - 0.3, 0);
      for (let i = 0; i < 16; i++) { const bx = Math.max(CX + 1.2, run(t)) + 0.5 + hh(i, 1) * 1.8 + Math.sin(t * 3 + i) * 0.1; bunny(out, { view: "side", ph: (t * 2.8 + hh(i, 2)) % 1, c: i % 6, mood: "charge" }, nx + bx, G, nz + HL + 0.3 + (hh(i, 3) - 0.2) * 1.2, -1, { h: 0.42 }); }
      if (!inside) puff(out, t, nx + x + 0.45, 0.2, nz + HL + 0.4, 0.5); } });
  // 22 And drives away.: the coach pulls off down the drive, bunnies bounding after it
  const DZ = HL - 0.3, tDr = T("And drives"), drv = (t) => Math.max(0, t - tDr + 0.05) ** 1.4 * 5.0;
  shot({ at: S("And drives"), ...day, cam: push(n_(CX + 2.6, 1.6, DZ - 3.5), n_(CX, 1.1, DZ + 3.0), n_(CX + 2.4, 1.5, DZ - 2.8), n_(CX, 1.1, DZ + 8.0), 46, 1.4), cInf: 1, focus: n_(CX, 1.3, DZ + 5), shadowR: 20,
    stage(t, out) { const z = DZ + drv(t); coach(out, z, t * 2.2, Math.abs(Math.sin(t * 11)) * 0.03);
      for (let i = 0; i < 4; i++) puff(out, t + i * 0.2, nx + CX + (i - 1.5) * 0.5, 0.3, nz + z - 1.6 - i * 0.3, 0.9, i);
      for (let i = 0; i < 14; i++) { const bz = z - 2.2 - hh(i, 4) * 3.5 + Math.max(0, t - tDr) * 1.5; bunny(out, { view: "side", ph: (t * 2.8 + hh(i, 5)) % 1, c: i % 6, mood: "charge" }, nx + CX + (hh(i, 6) - 0.5) * 2.2, G, nz + Math.min(bz, z - 1.6), 1, { h: 0.42 }); } } });
  // 23 Defeated.: the bunnies hold the field; the champion sits on Napoleon's spot, sunburst behind
  shot({ at: S("Defeated"), ...day, cam: push(n_(0.1, 0.42, HL + 1.6), n_(0, 0.42, HL), n_(0.1, 0.42, HL + 1.35), n_(0, 0.44, HL), 40, 1.0), cInf: 3, focus: n_(0, 0.4, HL), shadowR: 6,
    stage(t, out) { fxCard(out, "burst", DR.burst, nx, 0.5, nz + HL - 1.2, 2.6, 2.6, { cw: 512, ch: 512, kind: "basic", rot: t * 0.5 }); bunny(out, { view: "front", ph: Math.floor(t * 4) % 3 === 0 ? 0.5 : -1, c: 0, mood: "happy" }, nx, G, nz + HL, 1, { h: 0.52 });
      for (let i = 0; i < 6; i++) bunny(out, { view: "front", ph: (t * 2.5 + i * 0.3) % 1, c: (i + 1) % 6, mood: "happy" }, nx + (i - 2.5) * 0.3, G, nz + HL - 0.4 - (i % 2) * 0.2, 1, { h: 0.38 });
      confetti(out, t, nx, 0, nz + HL - 0.2, 0.9, 0.3, 30, 1.6); } });
  // 24 So remember...: back on the hero (matches shot 1's opening frame, so it loops)
  shot({ at: S("So remember"), ...day, cam: heroCam, cInf: 2, focus: n_(0, 1.2, HZ), shadowR: 8, loop: true,
    stage(t, out) { hero(t, out, 99, false); } });

  SHOTS = D.map((s, i) => ({ ...s, a: s.a ?? s.at, b: i + 1 < D.length ? (D[i + 1].a ?? D[i + 1].at) : END + 0.01 }));
  // a little handheld drift on every shot; the loop shot plays the hero camera from its start, like shot 1
  SHOTS.forEach((s, i) => { const base = s.cam, ph = (s.loop ? 0 : (s.at ?? s.a ?? 0)) * 1.7, w = 0.008, dur = s.b - s.a; s.cam = (l0, ...r) => { const l = s.loop ? Math.max(0, dur - l0 - 1 / FPS) : l0, c = base(l, ...r);
    return { ...c, pos: [c.pos[0] + w * Math.sin(l * 1.1 + ph), c.pos[1] + w * 0.7 * Math.sin(l * 1.6 + ph * 2), c.pos[2] + w * Math.sin(l * 0.9 + ph * 3)] }; }; });
  SHOTS.forEach((s, i) => { s.id = i + 1; const c = s.cam(0.3); const fx2 = c.look[0] - c.pos[0], fz2 = c.look[2] - c.pos[2], n = Math.hypot(fx2, fz2) || 1; s.fwd = [fx2 / n, fz2 / n]; });
}

export const shotAt = (t) => SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];
export function frameState(f) {
  const thumb = f < 0; if (thumb && !THUMB) THUMB = thumbShot();
  const t = thumb ? 3.4 : f / FPS, s = thumb ? THUMB : shotAt(t), local = t - s.a, c = s.cam(local);
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
