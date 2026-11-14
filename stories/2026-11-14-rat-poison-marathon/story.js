// Shot plan for "He Won Olympic Gold on Rat Poison" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// 1904 St. Louis Olympic marathon: Fred Lorz rides a car for miles, waves at runners, is crowned by Alice Roosevelt, gets caught;
// Andarín Carvajal (Cuban mailman) eats rotten apples and naps; winner Thomas Hicks is fed brandy, egg and strychnine, held up by
// his coaches. Hook-first (Hicks glugging the skull bottle, medal swinging), a cut every ~1.2 s, loop ending (last shot = shot 1).
import { RACE } from "./world.js";
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

// ---------------- 1904 open motor car, side view, bow to the LEFT, 1024 x 512, ground at y 500 ----------------
// k = wheel phase 0..7; o = { broke: tilt + steam, driver: true }
function drawCar(g, k = 0, o = {}) {
  g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; g.lineCap = "round";
  const wheel = (cx, cy, r) => {
    E(g, cx, cy, r, r, 0, "#2a2630", 14); E(g, cx, cy, r * 0.8, r * 0.8, 0, "#e8c45a", 8);
    g.strokeStyle = INK; g.lineWidth = 9; for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI + (k / 8) * (Math.PI / 3); g.beginPath(); g.moveTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78); g.lineTo(cx - Math.cos(a) * r * 0.78, cy - Math.sin(a) * r * 0.78); g.stroke(); }
    E(g, cx, cy, r * 0.18, r * 0.18, 0, "#c9a24a", 7);
  };
  g.save(); if (o.broke) { g.translate(512, 500); g.rotate(-0.06); g.translate(-512, -500); }
  // driver (behind the tub): cap + goggles
  if (o.driver !== false) {
    g.fillStyle = "#5a4636"; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.roundRect(352, 150, 120, 170, 40); g.fill(); g.stroke();
    E(g, 410, 120, 62, 66, 0, "#f0d0b4", 9);
    g.fillStyle = "#3a3a44"; g.beginPath(); g.moveTo(346, 104); g.quadraticCurveTo(410, 30, 474, 100); g.closePath(); g.fill(); g.stroke(); g.fillRect(330, 96, 70, 14);
    E(g, 384, 120, 22, 18, 0, "#bfe4ff", 7); E(g, 432, 120, 22, 18, 0, "#bfe4ff", 7);
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(388, 160); g.quadraticCurveTo(404, 172, 420, 160); g.stroke();
    // steering column + wheel
    g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(300, 330); g.lineTo(350, 200); g.stroke(); g.strokeStyle = "#3a3a44"; g.lineWidth = 7; g.stroke();
    g.save(); g.translate(352, 196); g.rotate(-0.4); E(g, 0, 0, 46, 14, 0, null, 10); g.restore();
  }
  // rear seat back (tall black leather) - drawn on its own card behind the passenger unless o.seat
  if (o.seat) g.fillStyle = "#24222a"; g.strokeStyle = INK; g.lineWidth = 10; if (o.seat) { g.beginPath(); g.roundRect(640, 180, 220, 170, [50, 50, 10, 10]); g.fill(); g.stroke(); }
  // body tub (red), brass trim, bonnet + radiator at the front (left)
  g.fillStyle = "#c8302e"; g.beginPath(); g.moveTo(120, 300); g.lineTo(300, 290); g.quadraticCurveTo(320, 270, 360, 268); g.lineTo(900, 262); g.quadraticCurveTo(960, 270, 950, 400); g.lineTo(150, 410); g.quadraticCurveTo(110, 360, 120, 300); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#e85048"; g.fillRect(380, 280, 500, 26);
  g.fillStyle = "#c9a24a"; g.fillRect(140, 388, 800, 12);
  g.fillStyle = "#c9a24a"; g.beginPath(); g.roundRect(90, 270, 50, 130, 10); g.fill(); g.stroke();
  g.strokeStyle = "rgba(36,23,38,0.6)"; g.lineWidth = 4; for (let y = 284; y < 392; y += 14) { g.beginPath(); g.moveTo(98, y); g.lineTo(132, y); g.stroke(); }
  // brass head lamp
  g.fillStyle = "#e8c45a"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(60, 230, 56, 50, 12); g.fill(); g.stroke(); E(g, 62, 255, 12, 20, 0, "#fff6c0", 6);
  // horn bulb
  E(g, 300, 250, 18, 18, 0, "#2a2630", 6); g.strokeStyle = "#c9a24a"; g.lineWidth = 8; g.beginPath(); g.moveTo(300, 250); g.quadraticCurveTo(260, 230, 230, 250); g.stroke();
  // mudguards
  g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.arc(250, 420, 108, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.beginPath(); g.arc(790, 410, 120, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  wheel(250, 418, 82); wheel(790, 408, 92);
  g.restore();
}
/** car card on the road: x = centre, gy = ground y, z = depth, w = length in m (height w/2) */
const seatBack = (g, broke) => { g.clearRect(0, 0, 1024, 512); g.save(); if (broke) { g.translate(512, 500); g.rotate(-0.06); g.translate(-512, -500); } g.fillStyle = "#24222a"; g.strokeStyle = INK; g.lineWidth = 10; g.lineJoin = "round"; g.beginPath(); g.roundRect(640, 180, 220, 170, [50, 50, 10, 10]); g.fill(); g.stroke(); g.restore(); };
const car = (out, x, gy, z, k, o = {}, w = 3.2) => { const kk = ((Math.floor(k) % 8) + 8) % 8, key = "car" + kk + (o.broke ? "b" : "") + (o.driver === false ? "n" : "");
  fxCard(out, "seat" + (o.broke ? "b" : ""), (p) => seatBack(p.g, o.broke), x, gy + w / 4 - 0.012 * w, z - 0.16, w, w / 2, { cw: 1024, ch: 512, kind: "lit" });
  fxCard(out, key, (p) => drawCar(p.g, kk, o), x, gy + w / 4 - 0.012 * w, z, w, w / 2, { cw: 1024, ch: 512, kind: "lit" }); shadowAt(out, x, gy, z, w * 0.9); };

// ---------------- bottles, 256 x 512 ----------------
function drawBottle(g, label, col, skull, flip = false) {
  g.clearRect(0, 0, 256, 512); g.lineJoin = "round";
  g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(100, 40); g.lineTo(156, 40); g.lineTo(156, 150); g.quadraticCurveTo(220, 180, 220, 260); g.lineTo(220, 470); g.quadraticCurveTo(220, 496, 194, 496); g.lineTo(62, 496); g.quadraticCurveTo(36, 496, 36, 470); g.lineTo(36, 260); g.quadraticCurveTo(36, 180, 100, 150); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#8a5a34"; g.fillRect(98, 14, 60, 40); g.strokeRect(98, 14, 60, 40);
  g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(56, 230, 18, 220);
  g.fillStyle = "#f6ecd2"; g.beginPath(); g.roundRect(46, 270, 164, 170, 12); g.fill(); g.stroke();
  g.save(); if (flip) { g.translate(128, 355); g.rotate(Math.PI); g.translate(-128, -355); }
  if (skull) {
    E(g, 128, 330, 40, 36, 0, "#ffffff", 7); E(g, 113, 330, 10, 11, 0, INK, 0); E(g, 143, 330, 10, 11, 0, INK, 0); g.fillStyle = "#ffffff"; g.fillRect(112, 358, 32, 16); g.strokeRect(112, 358, 32, 16);
    g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(84, 300); g.lineTo(172, 385); g.moveTo(172, 300); g.lineTo(84, 385); g.stroke();
    txt(g, label, 128, 414, 34, "Bangers", "#c8302e", INK, 0, 150);
  } else txt(g, label, 128, 355, 52, "Bangers", "#7a3a1a", INK, 0, 150);
  g.restore();
}
const BOT = { poison: ["RAT POISON", "#7fc24a", true], brandy: ["BRANDY", "#a8642a", false], strych: ["STRYCHNINE", "#7fc24a", true] };
const bottleCard = (out, kind, x, y, z, h = 0.5, rot = 0) => { const [l, c, s] = BOT[kind]; fxCard(out, "bot" + kind, (p) => drawBottle(p.g, l, c, s), x, y, z, h / 2, h, { cw: 256, ch: 512, kind: "lit", rot }); };
/** a bottle drawn on a person's card at a hand (base canvas units; 1 unit = 2.16 mm) */
const bottleAt = (p, H, kind, ang, sz = 130) => { if (!H) return; const g = p.g, [l, c, s] = BOT[kind], oc = document.createElement("canvas"); oc.width = 256; oc.height = 512; drawBottle(oc.getContext("2d"), l, c, s);
  g.save(); g.translate(H[0], H[1]); g.rotate(ang); g.drawImage(oc, -sz / 2, -sz * 1.2, sz, sz * 2); g.restore(); };

// ---------------- the rat, 512 x 512, front view, feet on y 500. mood: shock | faint | nope ----------------
function drawRat(g, mood = "shock") {
  g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; g.lineCap = "round";
  const F = "#9a96a8", D = "#7a768a", PK = "#f2a8b8";
  g.strokeStyle = INK; g.lineWidth = 18; g.beginPath(); g.moveTo(330, 470); g.bezierCurveTo(470, 470, 480, 360, 430, 330); g.stroke(); g.strokeStyle = PK; g.lineWidth = 9; g.stroke();
  E(g, 256, 390, 110, 110, 0, F, 10); E(g, 256, 410, 66, 70, 0, "#c8c4d4", 0);
  for (const s of [-1, 1]) { E(g, 256 + s * 60, 492, 40, 16, 0, PK, 8); }
  for (const s of [-1, 1]) { E(g, 256 + s * 112, 130, 70, 70, 0, F, 10); E(g, 256 + s * 112, 134, 44, 44, 0, PK, 0); }
  E(g, 256, 210, 118, 104, 0, F, 10);
  E(g, 256, 268, 26, 20, 0, "#3a2a34", 6);
  g.strokeStyle = INK; g.lineWidth = 4; for (const s of [-1, 1]) for (const dy of [-10, 6]) { g.beginPath(); g.moveTo(256 + s * 40, 266 + dy); g.lineTo(256 + s * 120, 254 + dy * 2); g.stroke(); }
  if (mood === "faint") { for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(256 + s * 30, 195); g.lineTo(256 + s * 66, 225); g.moveTo(256 + s * 66, 195); g.lineTo(256 + s * 30, 225); g.stroke(); } g.fillStyle = PK; g.beginPath(); g.ellipse(270, 316, 16, 22, 0.2, 0, two); g.fill(); g.stroke(); }
  else { for (const s of [-1, 1]) { E(g, 256 + s * 46, 200, 32, 38, 0, "#ffffff", 7); E(g, 256 + s * 46, 206, 12, 14, 0, INK, 0); } E(g, 256, 312, 22, 26, 0, "#5a1e28", 7); g.fillStyle = "#ffffff"; g.fillRect(244, 290, 24, 14); }
  if (mood === "nope") { g.save(); g.translate(400, 330); g.rotate(0.15); g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 160); g.lineTo(0, -40); g.stroke(); g.fillStyle = "#fff4b0"; g.beginPath(); g.roundRect(-90, -130, 180, 100, 14); g.fill(); g.stroke(); txt(g, "NOPE!", 0, -78, 64, "Bangers", "#c8302e", INK, 0, 160); g.restore(); }
  for (const s of [-1, 1]) { E(g, 256 + s * 92, 360, 24, 30, s * 0.4, F, 8); }
}
const rat = (out, mood, x, gy, z, h = 0.45, rot = 0) => { fxCard(out, "rat" + mood, (p) => drawRat(p.g, mood), x, gy + h * 0.488, z, h, h, { cw: 512, ch: 512, kind: "lit", rot }); shadowAt(out, x, gy, z, h * 0.7); };

// ---------------- more 2D drawings ----------------
const DR2 = {
  sun: (p, k) => { const g = p.g; g.clearRect(0, 0, 512, 512); for (let i = 0; i < 16; i++) { const a = (i / 16) * two + k * 0.05; g.fillStyle = i % 2 ? "#ffb02a" : "#ff7a1a"; g.beginPath(); g.moveTo(256 + Math.cos(a - 0.12) * 150, 256 + Math.sin(a - 0.12) * 150); g.lineTo(256 + Math.cos(a) * (240 + (k % 2) * 10), 256 + Math.sin(a) * (240 + (k % 2) * 10)); g.lineTo(256 + Math.cos(a + 0.12) * 150, 256 + Math.sin(a + 0.12) * 150); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); }
    E(g, 256, 256, 160, 160, 0, "#ffd23a", 12); g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(170, 200); g.lineTo(230, 222); g.moveTo(342, 200); g.lineTo(282, 222); g.stroke();
    E(g, 205, 245, 16, 18, 0, INK, 0); E(g, 307, 245, 16, 18, 0, INK, 0); g.beginPath(); g.arc(256, 330, 50, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); E(g, 160, 300, 24, 14, 0, "rgba(255,90,40,0.6)", 0); E(g, 352, 300, 24, 14, 0, "rgba(255,90,40,0.6)", 0); },
  drop: (p) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.fillStyle = "#8fd0ff"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(64, 8); g.quadraticCurveTo(110, 70, 96, 96); g.quadraticCurveTo(64, 126, 32, 96); g.quadraticCurveTo(18, 70, 64, 8); g.fill(); g.stroke(); E(g, 52, 80, 8, 12, 0, "#ffffff", 0); },
  banner: (p, s, col = "#24356e") => { const g = p.g; g.clearRect(0, 0, 1024, 256); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(14, 24, 996, 208, 18); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 8; g.strokeRect(36, 44, 952, 168); txt(g, s, 512, 134, 130, "Rye", col, "#fbf3dc", 0, 900); },
  wreath: (p) => { const g = p.g; g.clearRect(0, 0, 256, 128); for (let i = 0; i < 18; i++) { const a = Math.PI * (0.05 + (i / 17) * 0.9), x = 128 - Math.cos(a) * 100, y = 70 + Math.sin(a) * 30; g.save(); g.translate(x, y); g.rotate(a + (i % 2 ? 0.6 : -0.6)); E(g, 0, 0, 22, 9, 0, i % 2 ? "#5a9a3a" : "#7ab84a", 4); g.restore(); } },
  apple: (p, rotten) => { const g = p.g; g.clearRect(0, 0, 256, 256); E(g, 128, 140, 90, 84, 0, rotten ? "#a8a43a" : "#d23a2a", 10); if (rotten) { E(g, 96, 120, 26, 20, 0.4, "#6a5a2a", 0); E(g, 160, 170, 30, 22, -0.3, "#5a4a24", 0); E(g, 150, 108, 14, 10, 0, "#6a5a2a", 0); }
    g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 64); g.quadraticCurveTo(134, 40, 146, 28); g.stroke(); g.fillStyle = "#5a9a3a"; g.beginPath(); g.ellipse(166, 48, 26, 12, -0.5, 0, two); g.fill(); g.lineWidth = 6; g.stroke(); },
  fly: (p, k) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.globalAlpha = 0.85; E(g, 50, 44, 24, 14, k % 2 ? -0.5 : -0.9, "#e6f2ff", 4); E(g, 78, 44, 24, 14, k % 2 ? 0.5 : 0.9, "#e6f2ff", 4); g.globalAlpha = 1; E(g, 64, 70, 18, 24, 0, "#2a2a30", 5); E(g, 64, 50, 12, 12, 0, "#c8302e", 3); },
  stink: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); g.strokeStyle = "#7a9a3a"; g.lineWidth = 12; g.lineCap = "round"; for (let i = 0; i < 3; i++) { g.beginPath(); for (let y = 230; y > 30; y -= 10) g.lineTo(60 + i * 68 + Math.sin(y / 26 + k + i) * 16, y); g.stroke(); } },
  confetti: (p, k) => { const g = p.g, W = g.canvas.width, Hh = g.canvas.height; g.clearRect(0, 0, W, Hh); const C = ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a", "#ffffff", "#b07aff"]; for (let i = 0; i < 46; i++) { const x = hh(i, 1) * W, y = ((hh(i, 2) * Hh + k * 30 * (0.6 + hh(i, 3))) % (Hh + 48)) - 24; g.save(); g.translate(x, y); g.rotate(k * 0.7 + i); g.fillStyle = C[i % 6]; g.fillRect(-9, -5, 18, 10); g.restore(); } },
  medal: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); E(g, 128, 128, 104, 104, 0, "#ffd23a", 12); E(g, 128, 128, 76, 76, 0, "#ffe680", 6, "#c9a24a"); txt(g, "1", 128, 136, 110, "Bangers", "#c9a24a", INK, 6); },
  egg: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); E(g, 128, 140, 70, 92, 0, "#fbf3e4", 10); },
  /** the recipe insert, 576 x 1024: a tin cup; brandy pours (u 0..), an egg drops in (ue), the skull bottle drips (us) and it bubbles green */
  recipe: (p, u, ue, us) => { const g = p.g; const bg = g.createLinearGradient(0, 0, 0, 1024); bg.addColorStop(0, "#ffe6a8"); bg.addColorStop(1, "#ffb86a"); g.fillStyle = bg; g.fillRect(0, 0, 576, 1024);
    for (let i = 0; i < 24; i++) { const a0 = (i / 24) * two, a1 = ((i + 1) / 24) * two; g.fillStyle = i % 2 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0)"; g.beginPath(); g.moveTo(288, 700); g.arc(288, 700, 900, a0, a1); g.closePath(); g.fill(); }
    // the cup
    const lv = 0.25 + 0.35 * clamp01(u * 2) + 0.15 * (ue > 0 ? 1 : 0), green = clamp01(us * 2.5);
    const liquid = green > 0 ? `rgb(${Math.round(168 - 60 * green)},${Math.round(100 + 110 * green)},${Math.round(42 + 20 * green)})` : "#a8642a";
    g.save(); g.beginPath(); g.moveTo(150, 600); g.lineTo(426, 600); g.lineTo(400, 900); g.lineTo(176, 900); g.closePath(); g.clip(); g.fillStyle = "#d8dce2"; g.fillRect(0, 0, 576, 1024); g.fillStyle = liquid; g.fillRect(0, 900 - 300 * lv, 576, 400); g.restore();
    g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(150, 600); g.lineTo(426, 600); g.lineTo(400, 900); g.lineTo(176, 900); g.closePath(); g.stroke(); g.beginPath(); g.ellipse(288, 600, 138, 26, 0, 0, two); g.stroke(); g.beginPath(); g.arc(440, 720, 64, -1.2, 1.2); g.stroke();
    txt(g, "SECRET RECIPE", 288, 990, 60, "Bangers", "#ffffff", INK, 10, 520);
    // brandy pour
    if (us <= 0 && u < 0.7) { const oc = document.createElement("canvas"); oc.width = 256; oc.height = 512; drawBottle(oc.getContext("2d"), "BRANDY", "#a8642a", false); g.save(); g.translate(200, 360); g.rotate(2.0); g.drawImage(oc, -80, -190, 160, 320); g.restore(); g.strokeStyle = "#a8642a"; g.lineWidth = 22; g.beginPath(); g.moveTo(300, 440); g.quadraticCurveTo(300, 520, 290, 640); g.stroke(); }
    if (ue > 0) { const y = Math.min(640, 220 + ue * 1400); if (y < 630) { E(g, 288, y, 46, 60, 0, "#fbf3e4", 9); } else { E(g, 288, 610, 62, 18, 0, "#fff8ec", 7); E(g, 288, 608, 26, 12, 0, "#ffc83a", 5); } }
    if (us > 0) { const oc = document.createElement("canvas"); oc.width = 256; oc.height = 512; drawBottle(oc.getContext("2d"), "STRYCHNINE", "#7fc24a", true); g.save(); g.translate(340, 300); g.rotate(2.6 - 0.2 * Math.sin(us * 20)); g.drawImage(oc, -90, -210, 180, 360); g.restore();
      for (let i = 0; i < 3; i++) { const v = ((us * 3 + i / 3) % 1); E(g, 300 + i * 6, 420 + v * 190, 12, 16, 0, "#7fe04a", 5); }
      if (green > 0.3) for (let i = 0; i < 7; i++) { const v = (us * 2 + i / 7) % 1, x = 200 + hh(i, 4) * 176; E(g, x, 590 - v * 140, 14 + 10 * v, 14 + 10 * v, 0, "rgba(140,230,90,0.85)", 5); }
      if (green > 0.6) { g.save(); g.globalAlpha = clamp01((green - 0.6) * 3); E(g, 288, 470, 56, 50, 0, "#e8ffd8", 8); E(g, 268, 466, 12, 14, 0, INK, 0); E(g, 308, 466, 12, 14, 0, INK, 0); g.fillStyle = INK; g.fillRect(272, 494, 32, 8); g.restore(); } } },
};

// ---------------- props drawn on people's cards ----------------
const XL2 = {
  medal: (sw) => (p) => { const H = p.hands; if (!H) return; const g = p.g, cx = 300, top = H.chin + 6, y = H.chin + 0.5 * H.HH, x = cx + Math.sin(sw) * 40;
    g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(cx - 60, top); g.lineTo(x, y - 30); g.lineTo(cx + 60, top); g.stroke(); g.strokeStyle = "#2f6ad8"; g.lineWidth = 12; g.stroke();
    E(g, x, y + 14, 46, 46, 0, "#ffd23a", 9); E(g, x, y + 14, 30, 30, 0, "#ffe680", 4, "#c9a24a"); g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.ellipse(x - 14, y, 9, 14, 0.5, 0, two); g.fill(); },
  wreath: (dy = 0) => (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc - H.Ha * 0.62 + dy; for (let i = 0; i < 16; i++) { const a = Math.PI * (1.05 + (i / 15) * 0.9), x = 300 + Math.cos(a) * H.Ha * 1.02, yy = y + 18 + Math.sin(a) * H.Ha * 0.28; g.save(); g.translate(x, yy); g.rotate(a + Math.PI / 2 + (i % 2 ? 0.7 : -0.7)); E(g, 0, 0, 30, 12, 0, i % 2 ? "#5a9a3a" : "#7ab84a", 5); g.restore(); } },
  sweat: (k) => (p) => { const H = p.hands; if (!H) return; const g = p.g; for (let i = 0; i < 4; i++) { const v = ((k * 0.35 + i / 4) % 1), s = i % 2 ? 1 : -1, x = 300 + s * (H.Ha * 1.05 + v * 90), y = H.hc - H.Ha * 0.4 + v * 120 - Math.sin(v * Math.PI) * 70; g.fillStyle = "#8fd0ff"; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y - 26); g.quadraticCurveTo(x + 18, y, x, y + 12); g.quadraticCurveTo(x - 18, y, x, y - 26); g.fill(); g.stroke(); } },
  bag: () => (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.chin + 1.05 * H.HH; g.strokeStyle = INK; g.lineWidth = 20; g.beginPath(); g.moveTo(240, H.chin + 20); g.lineTo(390, y - 30); g.stroke(); g.strokeStyle = "#8a5a34"; g.lineWidth = 11; g.stroke();
    g.fillStyle = "#a8743e"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(340, y - 40, 120, 100, 14); g.fill(); g.stroke(); g.fillStyle = "#8a5a2e"; g.beginPath(); g.roundRect(340, y - 40, 120, 44, [14, 14, 0, 0]); g.fill(); g.stroke(); g.fillStyle = "#fbf3dc"; g.save(); g.translate(372, y - 46); g.rotate(-0.3); g.fillRect(-26, -18, 52, 34); g.strokeRect(-26, -18, 52, 34); g.restore(); },
  apple: (rotten, bite) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, x = H.r[0] - 6, y = H.r[1] - 26; E(g, x, y, 44, 40, 0, rotten ? "#a8a43a" : "#d23a2a", 7); if (rotten) { E(g, x - 14, y - 8, 12, 9, 0.4, "#6a5a2a", 0); E(g, x + 16, y + 14, 14, 10, 0, "#5a4a24", 0); } if (bite) { g.fillStyle = "#fbf3dc"; g.beginPath(); g.arc(x - 40, y - 10, 22, 0, two); g.fill(); } g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y - 40); g.lineTo(x + 6, y - 58); g.stroke(); },
  bottle: (kind, side = "r", ang = -0.5, sz = 120) => (p) => { const H = p.hands; if (!H) return; bottleAt(p, H[side], kind, ang, sz); },
  pistol: () => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(-1.4); g.fillStyle = "#3a3a44"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-14, -20, 110, 30, 6); g.fill(); g.stroke(); g.fillStyle = "#8a5a34"; g.beginPath(); g.roundRect(-20, -6, 36, 70, 10); g.fill(); g.stroke(); g.restore(); },
};

// ---------------- cast ----------------
const RUNC = ["#7fb2e0", "#e8c45a", "#7ad08a", "#e88a6a", "#b48ae0", "#f4f1ea"];
const RUN = (v = 0) => ({ jacket: RUNC[v % 6], pants: "#f1eee6", boots: "#3a2a20", hat: "hair", hair: ["#4a3020", "#c89a4a", "#2a201a", "#8a5a30"][v % 4], skin: ["#f2d2b6", "#e8c3a0", "#d9a77c", "#f5c9a0"][v % 4], ...(v % 3 === 1 ? { moustache: "#4a3426" } : {}) });
const LORZ = { jacket: "#7fb2e0", pants: "#f1eee6", boots: "#3a2a20", hat: "hair", hair: "#c89a4a", skin: "#f2d2b6" };
const HICKS = { jacket: "#f4f1ea", pants: "#f4f1ea", boots: "#3a2a20", hat: "hair", hair: "#4a3020", moustache: "#4a3020", sash: "#c8302e", skin: "#f0d0b4" };
const CARV = { jacket: "#f4f1ea", pants: "#3a3a4a", boots: INK, hat: "hair", hair: "#1e1a1a", moustache: "#1e1a1a", skin: "#d9a77c" };
const COACH1 = { jacket: "#5a4636", pants: "#6a6470", boots: INK, hat: "fedora", cap: "#3a2e24", moustache: "#6a4a2a", build: "stout", skin: "#f0d0b4" };
const COACH2 = { jacket: "#2e3a4a", pants: "#4a4a52", boots: INK, hat: "tophat", skin: "#e8c3a0", build: "stout" };
const ALICE = { jacket: "#f4f0e6", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#f4f0e6", skin: "#f2d2b6" };
const SNITCH = { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", moustache: "#3a2a1a", skin: "#f0d0b4" };
const STARTER = { jacket: "#3a3a46", pants: "#6a6470", boots: INK, hat: "fedora", cap: "#2a2a30", moustache: "#a8a8b0", build: "stout", skin: "#f0d0b4" };
const FOLK = (v) => { const c = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"][v % 6], sk = ["#f2d2b6", "#f5c9a0", "#ecd0b6", "#c99067"][v % 4];
  return v % 2 ? { jacket: c, pants: "#3b3f52", boots: "#4a3426", skin: sk, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { jacket: c, pants: "#3b3f52", boots: "#4a3426", skin: sk, hat: v % 4 === 0 ? "tophat" : "fedora", cap: "#3a2e24" }; };
const xo = (o, k) => ({ ...o, xk: k });   // a variant key so cached cards with changing props redraw

/** neck of the bottle at the mouth, body up and away (base canvas units) */
const drink = (kind, sz = 120, ang = -2.36) => (p) => { const H = p.hands; if (!H) return; const g = p.g, [l, c, s] = BOT[kind], oc = document.createElement("canvas"); oc.width = 256; oc.height = 512; drawBottle(oc.getContext("2d"), l, c, s, true);
  g.save(); g.translate(300 + H.Ha * 0.12, H.hc + H.HH * 0.24); g.rotate(ang); g.drawImage(oc, -sz / 2, -sz * 0.08, sz, sz * 2); g.restore(); };
const both = (...fs) => (p) => { for (const f of fs) if (f) f(p); };

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[0];
function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const [rx, , rz] = RACE, r_ = (x, y, z) => [rx + x, y, rz + z];
  const day = { light: "day", sunAz: 210, sunEl: 52, fogFar: 2600 };
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const G = 0.07;
  const carR = (out, x, gy, z, k, o, w) => car(out, rx + x, gy, rz + z, k, o, w);
  const ppl = (out, i, o, x, y, z, opt = {}) => out.places.push(pl(i, o, rx + x, y, rz + z, opt));
  const fx = (out, key, draw, x, y, z, w, h, o = {}) => fxCard(out, key, draw, rx + x, y, rz + z, w, h, o);
  const mk = (out, s, x, y, z, u, size, col) => mark(out, s, rx + x, y, rz + z, u, size, col);
  const wd = (out, s, col, x, y, z, u, w) => word(out, s, col, rx + x, y, rz + z, u, w);
  const pf = (out, t, x, y, z, s, seed) => puff(out, t, rx + x, y, rz + z, s, seed);
  const tag = (out, key, a, b, col, x, y, z, u, w = 1.1, nrm = [0, 0, 1]) => { if (u > 0) sign(out, key, (p) => DR.nameTag(p, a, b, col), 1024, 256, rx + x, y, rz + z, w * u, w * 0.25 * u, nrm, "basic"); };
  const burst = (out, key, c0, c1, x, y, z, s, t) => fx(out, key, (p) => DR.burst(p, c0, c1), x, y, z, s, s, { cw: 512, ch: 512, kind: "basic", rot: t * 0.5 });
  const confetti = (out, c, t) => { const k = Math.floor(t * 12) % 24; screenCard(out, c, "conf" + k, (p) => DR2.confetti(p, k), 0.5, 576, 1024, "basic"); };
  // the grandstand crowd at the finish (x -40): twelve spectators on the steps, cheering
  const crowd = (out, t, cheer = 1) => { for (let k = 0; k < 12; k++) { const row = k % 3, x = -46 + Math.floor(k / 3) * 3.2 + row * 0.9, y = 0.45 + row * 0.9 + 0.45, z = -6.6 - row * 1.8, up = Math.sin(t * 8 + k) > 0;
    ppl(out, 200 + k, FOLK(k), x, y, z, { expr: cheer ? (k % 3 ? "grin" : "laugh") : "neutral", arms: cheer ? { l: [up ? "up" : "overhead", 1], r: [up ? "overhead" : "up", 1] } : undefined }); } };

  // ---- the hero (shot 1 and the loop): Thomas Hicks at the finish, glugging the skull bottle, gold medal swinging,
  //      his two coaches holding him up, the crowd cheering behind
  const HX = -38;
  const hero = (t, out) => { const sw = Math.sin(t * 7) * 0.6, k = Math.round(sw * 4);
    ppl(out, 1, xo(HICKS, "h" + k), HX, G, 0, { expr: "dazed", headTilt: Math.sin(t * 5) * 6, tilt: Math.sin(t * 3.3) * 4, arms: { l: ["shrug", 0.6], r: ["face", 1] }, extra: both(XL2.medal(k / 4 * 0.6), drink("poison", 118)) });
    ppl(out, 2, COACH1, HX - 0.72, G, -0.14, { expr: "worried", arms: { r: ["out", 0.9] } });
    ppl(out, 3, COACH2, HX + 0.72, G, -0.14, { expr: "nervous", arms: { l: ["out", 0.9] } });
    crowd(out, t, 1);
    for (let i = 0; i < 5; i++) { const a = t * 3 + i * 1.256; fx(out, "spark", DR.spark, HX + Math.cos(a) * 0.42, 1.95 + Math.sin(a) * 0.08, 0.05 + Math.sin(a) * 0.1, 0.11, 0.11, { cw: 256, ch: 256, kind: "basic" }); } };
  const heroCam = push(r_(HX, 1.05, 3.0), r_(HX, 1.3, 0), r_(HX, 1.08, 2.45), r_(HX, 1.32, 0), 46, 2.0);
  // 1 He won Olympic gold...: hero, already moving on frame 0
  shot({ a: 0, ...day, cam: heroCam, cInf: 1.6, focus: r_(HX, 1.2, 0), shadowR: 10, stage(t, out) { hero(t, out); } });
  kick1(T("gold") + 0.03);
  // 2 on rat poison.: close on his face and the skull bottle; a rat pops up in the corner and faints
  shot({ at: S("on"), ...day, cam: push(r_(HX + 0.05, 1.62, 1.75), r_(HX + 0.02, 1.62, 0), r_(HX + 0.05, 1.62, 1.5), r_(HX + 0.02, 1.64, 0), 44, 1.5), cInf: 2.5, focus: r_(HX, 1.45, 0), shadowR: 8,
    stage(t, out) { const tp = T("poison"); hero(t, out);
      if (t > tp - 0.2) { const u = smooth((t - tp + 0.2) / 0.25); rat(out, t > tp + 0.45 ? "faint" : "shock", rx + HX - 0.24, 1.22 + 0.1 * u, rz + 0.12, 0.3, t > tp + 0.45 ? -0.5 : 0); }
      mk(out, "?!", HX - 0.3, 1.66, 0.14, (t - tp) * 2.5, 0.16); } });
  kick1(T("poison") + 0.05);
  // 3 The worst marathon ever.: the start line seen down the road; the pistol goes BANG and the field charges at the camera
  const SX = 120;
  shot({ at: S("The worst"), ...day, cam: push(r_(SX - 9.5, 1.25, 0.6), r_(SX, 1.4, 0), r_(SX - 8.6, 1.2, 0.5), r_(SX, 1.4, 0), 50, 1.6), cInf: 1.2, focus: r_(SX - 2, 1.0, 0), shadowR: 14,
    stage(t, out) { const tb = T("worst"), go = Math.max(0, t - tb), m = go * 3.2;
      sign(out, "bnStart", (p) => DR2.banner(p, "OLYMPIC MARATHON", "#24356e"), 1024, 256, rx + SX + 1, 3.3, rz, 4.4, 1.1, [-1, 0, 0], "lit");
      for (const z of [-2.3, 2.3]) fx(out, "post", DR.post, SX + 1.05, 1.4, z, 0.14, 2.8, { cw: 64, ch: 512, kind: "lit", normal: [-1, 0, 0] });
      for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) { const z = -1.8 + k * 0.9 + r * 0.45, x = SX - 0.2 + r * 0.9 - m * (1 + hh(k, r) * 0.25);
        ppl(out, 10 + r * 5 + k, RUN(k + r * 2), x, G, z, { dir: [-1, 0], mode: go > 0 ? "march" : "stand", phase: (t * 2.6 + hh(k, r)) % 1, lift: 90, expr: go > 0 ? ["angry", "stern", "grin", "nervous"][(k + r) % 4] : "stern" });
        if (go > 0.1 && (k + r) % 2 === 0) pf(out, t, x + 0.4, 0.25, z, 0.6, k); }
      ppl(out, 20, STARTER, SX - 5.2, G, -1.15, { expr: t > tb ? "grin" : "stern", arms: { r: ["overhead", 1], l: ["hips", 1] }, extra: XL2.pistol() });
      if (t > tb) { pf(out, t - tb, SX - 5.2, 2.6, -0.85, 0.45, 0); wd(out, "BANG!", "#d8333a", SX - 5.3, 2.75, -0.6, (t - tb) * 3, 1.0); }
      wd(out, "WORST EVER!", "#c8302e", SX - 4.5, 2.2, 0.4, (t - T("ever") + 0.1) * 2.5, 1.5); } });
  kick1(T("worst") + 0.02);
  // 4 Boiling heat.: Lorz pounds towards the camera, drenched; an angry sun glares over him
  const HTX = 90;
  shot({ at: S("Boiling"), ...day, cam: (l) => { const x = HTX - 3.2 - l * 2.6; return { pos: r_(x, 0.85, 0.3), look: r_(x + 4, 1.75, 0), fov: 52, roll: Math.sin(l * 5) * 0.01 }; }, cInf: 1.5, focus: r_(HTX - 1, 1.4, 0), shadowR: 12,
    stage(t, out) { const l = t - S("Boiling"), x = HTX - 0.2 - l * 2.6, k = Math.floor(t * 6) % 8;
      ppl(out, 4, xo(LORZ, "sw" + k), x, G, 0, { dir: [-1, 0], mode: "march", phase: (t * 2.4) % 1, lift: 90, expr: "pained", tilt: Math.sin(t * 9) * 3, extra: XL2.sweat(k) });
      fx(out, "sun" + (k % 2), (p) => DR2.sun(p, k % 2), x + 14, 6.2, 0.6, 3.4, 3.4, { cw: 512, ch: 512, kind: "basic", normal: [-1, 0, 0] });
      wd(out, "SIZZLE!", "#ff6a1a", x + 2.6, 2.7, -0.9, (t - T("heat") + 0.1) * 2.5, 1.0); } });
  kick1(T("heat") + 0.03);
  // 5 Choking dust.: side view: an officials' car roars past, a wall of dust swallows the runners; COUGH!
  const DX = 70;
  shot({ at: S("Choking"), ...day, cam: push(r_(DX + 0.6, 1.2, 6.6), r_(DX, 0.95, 0), r_(DX + 0.2, 1.2, 6.2), r_(DX - 0.4, 0.95, 0), 46, 1.2), cInf: 1, focus: r_(DX, 1, 0), shadowR: 12,
    stage(t, out) { const l = t - S("Choking"), cx = DX + 5 - l * 8.4;
      for (let k = 0; k < 3; k++) { const x = DX - 1.4 + k * 1.3 - l * 2.2; ppl(out, 30 + k, RUN(k + 1), x, G, -1.2 - k * 0.5, { dir: [-1, 0], view: "side", mode: "march", stride: 1.1, phase: (t * 2.4 + k * 0.3) % 1, expr: l > 0.5 ? "pained" : "stern" }); }
      carR(out, cx, G, 1.6, t * 30, {}, 3.2);
      for (let i = 0; i < 9; i++) { const tx = l - i * 0.1; if (tx < 0) continue; const x = DX + 5 - tx * 8.4 + 1.6; if (x > DX + 6) continue; const age = l - tx; pf(out, age * 0.6, x + age * 0.3, 0.45 + age * 1.0, 0.9 - age * 0.9, 1.2 + age * 3.0, i); }
      wd(out, "COUGH!", "#8a6a3a", DX - 1.0, 2.25, -0.4, (t - T("dust") - 0.05) * 2.5, 1.0); } });
  // 6 A runner gets cramps...: Lorz pulls up, clutching his leg; OW!
  const CX = 60;
  shot({ at: S("A runner"), ...day, cam: push(r_(CX + 0.1, 1.15, 2.9), r_(CX, 1.0, 0), r_(CX + 0.1, 1.12, 2.45), r_(CX, 1.0, 0), 46, 1.2), cInf: 2, focus: r_(CX, 1.0, 0), shadowR: 8,
    stage(t, out) { const tc = T("cramps"), hurt = t > tc - 0.15, j = hurt ? Math.sin(t * 40) * 0.015 : 0;
      ppl(out, 4, LORZ, CX + j, G + (hurt ? Math.abs(Math.sin(t * 14)) * 0.06 : 0), 0, { expr: hurt ? "pained" : "stern", arms: hurt ? { l: ["low", 1], r: ["low", 1] } : undefined, mode: hurt ? "stand" : "march", phase: (t * 2.4) % 1, tilt: hurt ? 8 : 0 });
      if (hurt) { for (let i = 0; i < 3; i++) fx(out, "spark", DR.spark, CX + 0.2 + i * 0.08, 0.5 + i * 0.12, 0.25, 0.14 + 0.05 * Math.sin(t * 20 + i), 0.14, { cw: 256, ch: 256, kind: "basic" }); wd(out, "OW!", "#d8333a", CX + 0.55, 1.95, 0.3, (t - tc + 0.1) * 2.5, 0.8); } } });
  kick1(T("cramps") + 0.02);
  // 7 so he hops in a car.: a car idles by the road; Lorz leaps into the back seat; it pulls away
  const KX = 55;
  shot({ at: S("so he hops"), ...day, cam: push(r_(KX + 1.0, 1.3, 6.4), r_(KX + 0.9, 1.0, 0.5), r_(KX + 0.6, 1.25, 5.8), r_(KX + 0.4, 1.0, 0.5), 50, 1.6), cInf: 1.5, focus: r_(KX, 1, 0.8), shadowR: 10,
    stage(t, out) { const th = T("hops"), tcar = T("car", th), go = Math.max(0, t - tcar - 0.1), cx = KX - go * go * 2.4, seat = cx + 0.74;
      const u = clamp01((t - th) / 0.38), inCar = u >= 1, ax = lerp(KX + 1.75, seat, smooth(u)), ay = G + Math.sin(u * Math.PI) * 0.4 + (inCar ? 0.33 : 0.33 * smooth(u));
      carR(out, cx, G, 1.0, go * 40, {}, 3.2);
      ppl(out, 4, LORZ, inCar ? seat : ax, ay, 0.93, { expr: u > 0 ? "grin" : "sly", mode: inCar ? "sit" : "stand", arms: u > 0 && !inCar ? { l: ["up", 1], r: ["up", 1] } : undefined, keep: true });
      wd(out, "HOP!", "#2f6ad8", KX + 0.9, 2.2, 1.2, (t - th) * 2.5, 0.85);
      if (go > 0) pf(out, go, cx + 1.9, 0.3, 1.1, 0.7, 2); } });
  // 8 He waves at runners: tracking alongside: Lorz lounges in the back seat, waving; the runners slide away behind
  const WX = 30;
  shot({ at: S("He waves"), ...day, cam: (l) => { const x = WX - l * 6; return { pos: r_(x - 0.3, 1.3, 6.0), look: r_(x - 0.4, 1.05, 0.5), fov: 46, roll: 0 }; }, cInf: 1.2, focus: r_(WX, 1, 0.8), shadowR: 12,
    stage(t, out) { const l = t - S("He waves"), cx = WX - l * 6, seat = cx + 0.74;
      carR(out, cx, G, 1.0, t * 30, {}, 3.2);
      ppl(out, 4, LORZ, seat, G + 0.33 + Math.sin(t * 20) * 0.01, 0.93, { expr: "grin", mode: "sit", wave: Math.sin(t * 12), keep: true });
      for (let k = 0; k < 4; k++) { const x = WX - 2.5 + k * 1.6 - l * 2.4; ppl(out, 30 + k, RUN(k), x, G, -1.6 - (k % 2) * 0.6, { dir: [-1, 0], view: "side", mode: "march", stride: 1.0, phase: (t * 2.3 + k * 0.27) % 1, expr: l > 0.4 ? "shock" : "pained" }); }
      for (let i = 0; i < 4; i++) pf(out, (t + i * 0.25) % 1, cx + 1.9 + i * 0.5, 0.3 + i * 0.1, 1.2, 0.7 + i * 0.25, i);
      mk(out, "HI!", seat - 0.5, 2.05, 1.0, (t - T("waves")) * 2.5, 0.32, "#ffffff"); } });
  // 9 as he drives past: a runner's face as the car whooshes by in front of him; HEY!
  const PX = 12;
  shot({ at: S("as he"), ...day, cam: push(r_(PX, 1.4, 3.4), r_(PX, 1.35, 0), r_(PX, 1.4, 3.05), r_(PX, 1.37, 0), 44, 1.5), cInf: 2.5, focus: r_(PX, 1.35, 0), shadowR: 8,
    stage(t, out) { const l = t - S("as he"), td = T("drives"), cx = PX + 6 - (t - td + 0.25) * 16;
      ppl(out, 35, RUN(2), PX, G, -0.2, { expr: t > td + 0.1 ? "shock" : "pained", mode: "march", phase: (t * 2.2) % 1, arms: t > T("past") - 0.05 ? { l: ["up", 1], r: ["point", 1] } : undefined });
      if (cx > PX - 7) { carR(out, cx, G, 1.4, t * 30, {}, 3.2); ppl(out, 4, LORZ, cx + 0.74, G + 0.33, 1.33, { expr: "grin", mode: "sit", wave: Math.sin(t * 12), keep: true }); }
      for (let i = 0; i < 6; i++) { const ta = (t - td + 0.25) - i * 0.07; if (ta < 0) continue; const x = PX + 6 - ta * 16 + 1.8, age = i * 0.07 + Math.max(0, t - td) * 0.3; if (x > PX + 4) continue; pf(out, age * 3, x, 0.4 + age * 0.6, 1.2, 0.8 + age * 1.6, i); }
      wd(out, "HEY!!", "#d8333a", PX - 0.55, 2.2, 0.3, (t - T("past") + 0.05) * 2.5, 0.8); } });
  kick1(T("past") + 0.02);
  // 10 The car breaks down,: CLUNK! steam pours out of the bonnet; Lorz shrugs
  const BX = 4;
  shot({ at: S("The car breaks"), ...day, cam: push(r_(BX - 0.1, 1.2, 7.2), r_(BX, 1.0, 0.8), r_(BX, 1.2, 6.6), r_(BX, 1.0, 0.8), 50, 1.2), cInf: 1.5, focus: r_(BX, 1, 0.8), shadowR: 10,
    stage(t, out) { const tb = T("breaks"), br = t > tb - 0.05, sh = br ? Math.sin(t * 50) * 0.02 * Math.max(0, 1 - (t - tb) * 2) : 0, cx = br ? BX + sh : BX + 1.8 - (t - S("The car breaks")) * 6;
      carR(out, cx, G, 1.0, br ? 0 : t * 30, { broke: br }, 3.2);
      ppl(out, 4, LORZ, cx + 0.74, G + 0.33, 0.93, { expr: t > T("down") ? "annoyed" : "grin", mode: "sit", arms: t > T("down") ? { l: ["shrug", 1], r: ["shrug", 1] } : undefined, keep: true });
      if (br) { for (let i = 0; i < 4; i++) pf(out, (t - tb) * 1.5 + i * 0.4, cx - 1.3 + i * 0.12, 0.9 + ((t - tb) * 0.8 + i * 0.25) % 1.2, 1.2, 0.6 + i * 0.12, i); wd(out, "CLUNK!", "#6a6e78", cx - 1.0, 2.15, 1.3, (t - tb) * 2.5, 0.95); } } });
  kick1(T("breaks") + 0.02);
  // 11 so he jogs in.: Lorz trots off down the road, fresh as a daisy, whistling
  const JX = -20;
  shot({ at: S("so he jogs"), ...day, cam: (l) => { const x = JX - l * 1.9; return { pos: r_(x - 0.3, 1.15, 3.6), look: r_(x - 0.3, 1.15, 0), fov: 46, roll: 0 }; }, cInf: 2, focus: r_(JX, 1.1, 0), shadowR: 10,
    stage(t, out) { const l = t - S("so he jogs"), x = JX - l * 1.9;
      ppl(out, 4, LORZ, x, G, 0, { dir: [-1, 0], view: "side", mode: "march", stride: 0.8, phase: (t * 1.9) % 1, expr: "whistle" });
      for (let i = 0; i < 3; i++) { const v = (t * 1.2 + i / 3) % 1; fx(out, "spark", DR.spark, x - 0.3 + i * 0.25, 1.85 + v * 0.5, 0.1, 0.13 * Math.sin(v * Math.PI), 0.13 * Math.sin(v * Math.PI), { cw: 256, ch: 256, kind: "basic" }); }
      mk(out, "LA LA", x - 0.6, 2.2, 0.15, (t - T("jogs")) * 2.5, 0.42, "#ffffff"); } });
  // 12 The President's daughter crowns him.: the finish: she lowers the laurel wreath onto Lorz; the crowd goes wild
  const FX = -38;
  shot({ at: S("The President's"), ...day, cam: push(r_(FX + 0.4, 1.3, 3.4), r_(FX + 0.4, 1.4, 0), r_(FX + 0.4, 1.3, 2.9), r_(FX + 0.4, 1.42, 0), 46, 2.0), cInf: 1.5, focus: r_(FX + 0.4, 1.3, 0), shadowR: 10,
    stage(t, out, c) { const tc = T("crowns"), u = smooth((t - tc + 0.25) / 0.45), dy = lerp(-120, 0, u);
      ppl(out, 4, xo(LORZ, "wr" + Math.round(dy / 10)), FX, G, 0, { expr: u >= 1 ? "proud" : "grin", arms: u >= 1 ? { l: ["up", 1], r: ["up", 1] } : { l: ["hips", 1], r: ["hips", 1] }, extra: t > tc - 0.3 ? XL2.wreath(dy) : undefined });
      ppl(out, 5, ALICE, FX + 0.85, G, -0.1, { expr: "smile_closed", arms: { l: [t > tc - 0.3 && u < 1 ? "point" : "out", 1] } });
      crowd(out, t, 1);
      tag(out, "tagAlice", "PRESIDENT'S DAUGHTER", "ALICE ROOSEVELT", "#2f4f9a", FX + 0.45, 0.55, 0.35, smooth((t - T("daughter") + 0.1) / 0.3), 1.2);
      if (u >= 1) confetti(out, c, t); } });
  kick1(T("crowns") + 0.05);
  // 13 Then somebody snitches.: a spectator in the foreground points and yells; Lorz freezes, the wreath slips; BUSTED!
  shot({ at: S("Then"), ...day, cam: push(r_(FX - 1.4, 1.45, 4.2), r_(FX - 0.2, 1.35, 0), r_(FX - 1.3, 1.45, 3.7), r_(FX - 0.2, 1.37, 0), 46, 1.8), cInf: 1.2, focus: r_(FX - 0.6, 1.3, 1), shadowR: 10,
    stage(t, out) { const ts = T("snitches"), w = t > ts ? Math.min(120, (t - ts) * 260) : 0;
      ppl(out, 4, xo(LORZ, "wb" + Math.round(w / 10)), FX, G, 0, { expr: t > ts - 0.2 ? "shock" : "proud", arms: t > ts - 0.2 ? { l: ["head", 1], r: ["head", 1] } : { l: ["up", 1], r: ["up", 1] }, extra: XL2.wreath(w) });
      ppl(out, 5, ALICE, FX + 0.85, G, -0.1, { expr: t > ts ? "shock" : "smile_closed" });
      ppl(out, 6, SNITCH, FX - 1.25, G, 1.9, { expr: "angry", arms: { r: ["point", 1], l: ["hips", 1] }, headTilt: Math.sin(t * 10) * 3 });
      crowd(out, t, t < ts ? 1 : 0);
      wd(out, "HE TOOK A CAR!", "#c8302e", FX - 0.2, 2.05, 1.1, (t - T("somebody") + 0.05) * 2.2, 1.2);
      wd(out, "BUSTED!", "#d8333a", FX + 0.2, 1.05, 0.5, (t - ts - 0.1) * 2.5, 1.0); } });
  kick1(T("snitches") + 0.05);
  // 14 Meanwhile, a Cuban mailman: Carvajal pounds down the road in cut-off trousers, mailbag bouncing
  const MX = 46;
  shot({ at: S("Meanwhile"), ...day, cam: (l) => { const x = MX - 3.4 - l * 2.4; return { pos: r_(x, 1.1, -0.4), look: r_(x + 4, 1.35, 0), fov: 48, roll: 0 }; }, cInf: 1.5, focus: r_(MX - 1, 1.2, 0), shadowR: 12,
    stage(t, out) { const l = t - S("Meanwhile"), x = MX - 0.4 - l * 2.4, b = Math.round(Math.sin(t * 15) * 2);
      ppl(out, 7, xo(CARV, "bg" + b), x, G + Math.abs(Math.sin(t * 7.5)) * 0.04, 0, { dir: [-1, 0], mode: "march", phase: (t * 2.4) % 1, lift: 80, expr: "grin", extra: XL2.bag() });
      tag(out, "tagCarv", "CUBAN MAILMAN", "ANDARÍN CARVAJAL", "#c0353a", x - 0.55, 0.3, 0, smooth((t - T("mailman") + 0.1) / 0.3), 1.1, [-1, 0, 0]); } });
  // 15 eats rotten apples...: under an apple tree: munching a mouldy apple, flies circling, stink lines; ROTTEN!
  const AX = 43, AZ = -7.6;
  shot({ at: S("eats"), ...day, cam: push(r_(AX + 0.1, 1.45, AZ + 2.7), r_(AX, 1.45, AZ), r_(AX + 0.1, 1.47, AZ + 2.3), r_(AX, 1.47, AZ), 44, 1.6), cInf: 2, focus: r_(AX, 1.4, AZ), shadowR: 8,
    stage(t, out) { const chew = Math.floor(t * 7) % 2, ta = T("apples");
      ppl(out, 7, xo(CARV, "ap" + chew), AX, G, AZ, { expr: chew ? "chew" : "lick", arms: { r: ["face", 1] }, extra: XL2.apple(true, t > T("rotten")) });
      for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1, k = Math.floor(t * 20 + i) % 2; fx(out, "fly" + k, (p) => DR2.fly(p, k), AX + 0.3 + Math.cos(a) * 0.3, 1.55 + Math.sin(a * 1.3) * 0.18, AZ + 0.3 + Math.sin(a) * 0.1, 0.12, 0.12, { cw: 128, ch: 128, kind: "basic" }); }
      const k2 = Math.floor(t * 8) % 4; fx(out, "stink" + k2, (p) => DR2.stink(p, k2), AX + 0.32, 1.75, AZ + 0.25, 0.35, 0.35, { cw: 256, ch: 256, kind: "basic" });
      wd(out, "ROTTEN!", "#7a9a3a", AX - 0.5, 2.2, AZ + 0.4, (t - ta) * 2.5, 0.85); } });
  // 16 and takes a nap.: slumped against the tree trunk, snoring; Z Z Z
  shot({ at: S("and takes"), ...day, cam: push(r_(AX + 0.9, 1.05, AZ + 1.8), r_(AX - 0.6, 0.8, AZ - 1.3), r_(AX + 0.7, 1.0, AZ + 1.4), r_(AX - 0.6, 0.8, AZ - 1.3), 46, 2.0), cInf: 1.8, focus: r_(AX - 0.6, 0.8, AZ - 1.3), shadowR: 8,
    stage(t, out) { const tn = T("nap");
      ppl(out, 7, CARV, AX - 0.6, G, AZ - 1.85, { expr: t > tn - 0.3 ? "sleep" : "chew", mode: "sit", headTilt: 10 + Math.sin(t * 2.5) * 4, sq: 1 + Math.sin(t * 2.5) * 0.015 });
      fx(out, "appleR", (p) => DR2.apple(p, true), AX - 0.15, 0.15, AZ - 1.5, 0.18, 0.18, { cw: 256, ch: 256, kind: "lit" });
      for (let i = 0; i < 3; i++) mk(out, "Z", AX - 0.35 + i * 0.16, 1.45 + i * 0.2 + ((t * 0.5) % 0.2), AZ - 1.6, (t - tn + 0.3 - i * 0.25) * 2, 0.17 + i * 0.04, "#ffffff");
      wd(out, "SNORE!", "#2f6ad8", AX + 0.4, 1.85, AZ - 1.3, (t - tn - 0.4) * 2.5, 0.8); } });
  // 17 But the real winner?: Thomas Hicks on a spinning burst, the name ribbon slams in
  const WX2 = -10;
  shot({ at: S("But the"), ...day, cam: push(r_(WX2 + 0.05, 1.25, 2.7), r_(WX2, 1.3, 0), r_(WX2 + 0.05, 1.28, 2.25), r_(WX2, 1.32, 0), 44, 1.4), cInf: 2, focus: r_(WX2, 1.3, 0), shadowR: 8,
    stage(t, out) { const tw = T("winner"), u = smooth((t - tw + 0.1) / 0.3);
      burst(out, "burstH", "#ffd23a", "#ff9a2a", WX2, 1.3, -0.8, 5.2 * (0.8 + 0.2 * u), t);
      ppl(out, 1, HICKS, WX2, G, 0, { expr: u > 0.5 ? "nervous" : "stern", mode: "march", phase: (t * 2) % 1, arms: { l: ["hips", 1], r: ["hips", 1] } });
      tag(out, "tagHicks", "THOMAS HICKS", "USA", "#24356e", WX2, 0.6, 0.25, u, 1.05);
      mk(out, "?", WX2 + 0.6, 2.05, 0.2, (t - tw) * 2, 0.4); } });
  kick1(T("winner") + 0.02);
  // 18 His coaches kept feeding him brandy,: staggering on, a coach jogs alongside tipping a BRANDY bottle into his mouth
  const BRX = -2;
  shot({ at: S("His coaches"), ...day, cam: (l) => { const x = BRX - l * 0.6; return { pos: r_(x + 0.35, 1.4, 3.1), look: r_(x + 0.35, 1.35, 0), fov: 46, roll: Math.sin(l * 3) * 0.012 }; }, cInf: 2, focus: r_(BRX, 1.3, 0), shadowR: 8,
    stage(t, out) { const l = t - S("His coaches"), x = BRX - l * 0.6, k = Math.floor(t * 6) % 2;
      ppl(out, 1, xo(HICKS, "br" + k), x, G, 0, { expr: k ? "lick" : "dazed", mode: "march", phase: (t * 1.6) % 1, tilt: Math.sin(t * 3) * 5, extra: drink("brandy", 112) });
      ppl(out, 2, COACH1, x + 0.78, G, -0.12, { expr: "smile", mode: "march", phase: (t * 1.6 + 0.5) % 1, arms: { l: ["feed", 1] } });
      for (let i = 0; i < 3; i++) { const v = (t * 2 + i / 3) % 1; fx(out, "drop", DR2.drop, x + 0.08 + v * 0.05, 1.5 - v * 0.4, 0.12, 0.06, 0.06, { cw: 128, ch: 128, kind: "basic" }); }
      wd(out, "GLUG!", "#a8642a", x + 0.9, 2.2, 0.3, (t - T("brandy") + 0.1) * 2.5, 0.8); } });
  // 19 egg... and strychnine.: the "secret recipe" insert: brandy in the cup, an egg plops in, the skull bottle drips, it bubbles green
  shot({ at: S("egg"), ...day, cam: () => ({ pos: r_(0, 60, -100), look: r_(0, 60, -160), fov: 40, roll: 0 }), cInf: 0, focus: r_(0, 60, -160), shadowR: 6,
    stage(t, out, c) { const t0 = S("egg"), u = clamp01((t - t0) / 1.3), ue = clamp01((t - T("egg") + 0.05) / 0.4), us = clamp01((t - T("strychnine") + 0.1) / 0.8);
      const q = (v) => Math.round(v * 24) / 24; screenCard(out, c, "rec" + q(u) + "_" + q(ue) + "_" + q(us), (p) => DR2.recipe(p, q(u), q(ue), q(us)), 0.6, 576, 1024, "basic"); } });
  kick1(T("strychnine") + 0.05);
  // 20 Rat poison.: on the road, a rat reads the label, holds up a NOPE! sign, then faints
  const RTX = -6;
  shot({ at: S("Rat poison", 25), ...day, cam: push(r_(RTX + 0.05, 0.42, 1.45), r_(RTX, 0.4, 0), r_(RTX + 0.05, 0.42, 1.2), r_(RTX, 0.41, 0), 46, 1.2), cInf: 3, focus: r_(RTX, 0.35, 0), shadowR: 6,
    stage(t, out) { const tp = T("poison", 25), m = t > tp + 0.35 ? "faint" : "nope";
      bottleCard(out, "strych", rx + RTX - 0.2, G + 0.22, rz + 0.05, 0.44, 0);
      rat(out, m, rx + RTX + 0.1, G, rz + 0.1, 0.5, m === "faint" ? -0.6 * smooth((t - tp - 0.35) / 0.2) : Math.sin(t * 12) * 0.05);
      wd(out, "RAT POISON!", "#c8302e", RTX, 0.98, 0.15, (t - T("Rat", 25) + 0.1) * 2.5, 0.85); } });
  kick1(T("poison", 25) + 0.05);
  // 21 Hallucinating,: spiral eyes, the world wobbles, little rats and bottles orbit his head
  shot({ at: S("Hallucinating"), ...day, cam: (l) => ({ pos: r_(-14 + Math.sin(l * 4) * 0.08, 1.55, 2.0), look: r_(-14, 1.52, 0), fov: 44, roll: Math.sin(l * 4.5) * 0.06 }), cInf: 2.5, focus: r_(-14, 1.5, 0), shadowR: 8,
    stage(t, out) { burst(out, "burstHal", "#b07aff", "#7ad08a", -14, 1.5, -0.8, 5.2, t * 1.6);
      ppl(out, 1, HICKS, -14, G, 0, { expr: "dazed", headTilt: Math.sin(t * 6) * 10, tilt: Math.sin(t * 3) * 6, mode: "march", phase: (t * 1.2) % 1 });
      for (let i = 0; i < 4; i++) { const a = t * 2.6 + i * (Math.PI / 2), x = -14 + Math.cos(a) * 0.55, y = 1.95 + Math.sin(a) * 0.12, z = 0.1 + Math.sin(a) * 0.25;
        if (i % 2) rat(out, "shock", rx + x, y - 0.11, rz + z, 0.24, Math.sin(t * 5 + i) * 0.4); else bottleCard(out, "poison", rx + x, y, rz + z, 0.26, Math.sin(t * 4 + i) * 0.6); }
      for (let i = 0; i < 4; i++) { const a = -t * 3 + i * 1.57; fx(out, "spark", DR.spark, -14 + Math.cos(a) * 0.32, 1.98 + Math.sin(a) * 0.05, 0.12, 0.09, 0.09, { cw: 256, ch: 256, kind: "basic" }); } } });
  // 22 held up by his coaches...: both coaches hoist him under the arms, his feet paddling in the air
  const HUX = -28;
  shot({ at: S("held up"), ...day, cam: (l) => { const x = HUX - l * 0.9; return { pos: r_(x, 1.2, 3.6), look: r_(x, 1.25, 0), fov: 48, roll: 0 }; }, cInf: 1.8, focus: r_(HUX, 1.2, 0), shadowR: 10,
    stage(t, out) { const l = t - S("held up"), x = HUX - l * 0.9, lift = smooth((t - T("held up")) / 0.3) * 0.16;
      ppl(out, 1, HICKS, x, G + lift + Math.abs(Math.sin(t * 6)) * 0.02, 0, { expr: "dazed", mode: "march", phase: (t * 3.2) % 1, lift: 110, arms: { l: ["shrug", 1], r: ["shrug", 1] }, headTilt: Math.sin(t * 4) * 8 });
      ppl(out, 2, COACH1, x - 0.72, G, -0.14, { expr: "pained", mode: "march", phase: (t * 1.6) % 1, arms: { r: ["out", 1] } });
      ppl(out, 3, COACH2, x + 0.72, G, -0.14, { expr: "worried", mode: "march", phase: (t * 1.6 + 0.5) % 1, arms: { l: ["out", 1] } });
      mk(out, "HUP!", x - 0.9, 2.2, 0.2, (t - T("coaches", T("held up"))) * 2.5, 0.35, "#ffffff"); } });
  // 23 he wins.: through the finish tape, confetti, GOLD!
  shot({ at: S("he wins"), ...day, cam: push(r_(HX + 0.1, 1.2, 3.3), r_(HX, 1.3, 0), r_(HX + 0.1, 1.2, 2.9), r_(HX, 1.32, 0), 46, 0.8), cInf: 1.5, focus: r_(HX, 1.2, 0), shadowR: 10,
    stage(t, out, c) { const tw = T("wins"), br = t > tw, k = clamp01((t - tw) / 0.3);
      ppl(out, 1, HICKS, HX, G + 0.1, 0.0, { expr: br ? "relief_open" : "dazed", mode: "march", phase: (t * 3) % 1, arms: { l: ["up", 1], r: ["up", 1] } });
      ppl(out, 2, COACH1, HX - 0.75, G, -0.14, { expr: "laugh", arms: { r: ["up", 1], l: ["up", 1] } }); ppl(out, 3, COACH2, HX + 0.75, G, -0.14, { expr: "grin", arms: { l: ["up", 1] , r: ["up", 1] } });
      crowd(out, t, 1);
      for (const s of [-1, 1]) fx(out, "tape", (p) => { p.g.fillStyle = "#ffffff"; p.g.fillRect(0, 0, 256, 32); p.g.fillStyle = "#c8302e"; p.g.fillRect(0, 12, 256, 8); }, s * (0.55 + k * 0.7), 1.05 - k * 0.5, 0.35, 1.1, 0.06, { cw: 256, ch: 32, kind: "basic", rot: s * k * 1.1 });
      if (br) { confetti(out, c, t); fx(out, "medalBig", DR2.medal, HX, 2.25 + 0.05 * Math.sin(t * 8), 0.4, 0.42 * smooth(k * 1.5), 0.42 * smooth(k * 1.5), { cw: 256, ch: 256, kind: "basic", rot: Math.sin(t * 6) * 0.2 }); wd(out, "GOLD!", "#c9a24a", HX + 0.38, 1.95, 0.5, (t - tw) * 2.5, 0.8); } } });
  kick1(T("wins") + 0.02);
  // 24 So yes...: back on the hero (matches shot 1's first frame, so it loops)
  shot({ at: S("So yes"), ...day, cam: heroCam, cInf: 1.6, focus: r_(HX, 1.2, 0), shadowR: 10, loop: true, stage(t, out) { hero(t, out); } });

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
