// Shot plan for "This Giant Goat Gets Burned EVERY Year" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts: the Gävle goat (Gävlebocken), a 13 m straw Yule goat built in the castle square of Gävle, Sweden, every December since 1966; burned
// the very first year; destroyed or damaged in most years since; guards, fences, flame retardant; 1976 a Volvo rammed its legs; 2001 an American
// visitor burned it, said he thought it was a legal tradition, 18 days in jail; 2005 vandals dressed as Santa and the gingerbread man shot a
// flaming arrow; 2010 a guard was offered money to let it be stolen by helicopter; 2016 burned hours after the inauguration; now double fences,
// CCTV and a public webcam; 2023 jackdaws pecked it to pieces; 2025 a storm blew it over.
// Hook-first (the goat already ablaze on frame 0), a cut every ~1.5 s, loop ending (the last shot = shot 1's view, flames rising back).
import { GOAT } from "./world.js";
import { INK } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1780;
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
const hh = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const keys = (ks, creep = 0.002) => (s) => {
  let i = 0; while (i < ks.length - 1 && s > ks[i + 1].t) i++;
  const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)], u = b === a ? 0 : glide((s - a.t) / Math.max(0.001, b.t - a.t));
  return { pos: L3(a.pos, b.pos, u), look: L3(a.look, b.look, u), fov: lerp(a.fov ?? 40, b.fov ?? 40, u) * (1 - creep * s * FPS * 0.06), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) };
};
const push = (p0, l0, p1, l1, fov = 40, dur = 5, fov1 = fov) => keys([{ t: 0, pos: p0, look: l0, fov }, { t: dur, pos: p1, look: l1, fov: fov1 }]);
const kick = (t, at, amp = 0.012) => { let o = 0; for (const a of at) { const k = Math.round((t - a) * FPS); if (k >= 0 && k < 7) o += amp * (k % 2 ? -1 : 1) * (1 - k / 7); } return o; };
const two = Math.PI * 2;

// ---------------- text + shapes ----------------
const txt = (g, s, x, y, size, font, fill, stroke = INK, lw = 0, maxW = 0) => {
  g.font = `${size}px ${font}`; if (maxW) { let k = size; while (g.measureText(s).width > maxW && k > 8) { k *= 0.94; g.font = `${k}px ${font}`; } }
  g.textAlign = "center"; g.textBaseline = "middle"; if (lw) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = lw; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y);
};
const E = (g, x, y, rx, ry, rot, fill, lw = 8, stroke = INK) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, two); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
const R = (g, x, y, w, h, r, fill, lw = 8, stroke = INK) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
const poly = (g, pts, fill, lw = 8, stroke = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
const line = (g, pts, col = INK, lw = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); };
const heart = (g, x, y, r, fill) => { g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5); g.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = r * 0.16; g.stroke(); };
const DR = {
  nameTag: (p, a, b, col = "#c0353a") => { const g = p.g; g.clearRect(0, 0, 1024, 256); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 40); g.lineTo(984, 40); g.lineTo(940, 128); g.lineTo(984, 216); g.lineTo(40, 216); g.lineTo(84, 128); g.closePath(); g.fill(); g.stroke();
    txt(g, a, 512, 108, 100, "AlfaSlab", "#ffffff", INK, 10, 820); txt(g, b, 512, 186, 46, "AlfaSlab", "#ffe08a", INK, 6, 760); },
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, s.length > 2 ? 110 : 200, "Bangers", col, INK, 14, 240); },
  word: (p, s, col, u) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); const k = 0.7 + 0.3 * Math.min(1, u * 3); g.scale(k, k); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two, r = i % 2 ? 80 : 118; g.lineTo(Math.cos(a) * r * 2, Math.sin(a) * r * 0.9); } g.closePath(); g.fill(); g.stroke(); txt(g, s, 0, 6, 92, "Bangers", col, INK, 10, 400); g.restore(); },
  numBoard: (p, n, label, col) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(30, 30, 964, 452, 40); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.roundRect(56, 56, 912, 400, 28); g.stroke();
    txt(g, n, 512, 210, 230, "Bangers", col, INK, 16, 900); txt(g, label, 512, 380, 110, "Bangers", "#2a2a36", INK, 0, 880); },
  spark: (p, col = "#fffbe8") => { const g = p.g; g.clearRect(0, 0, 256, 256); poly(g, [[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], col, 8); },
  sweat: (p) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.beginPath(); g.moveTo(64, 10); g.quadraticCurveTo(110, 80, 64, 118); g.quadraticCurveTo(18, 80, 64, 10); g.fillStyle = "#8fd0ff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); },
  hearts: (p, k) => { const g = p.g; g.clearRect(0, 0, 512, 512); for (let i = 0; i < 6; i++) { const ph = (k / 16 + i / 6) % 1, x = 120 + hh(i, 4) * 280 + Math.sin(ph * 9 + i) * 20, y = 470 - ph * 420, r = 26 + hh(i, 5) * 22; g.globalAlpha = Math.min(1, (1 - ph) * 2.5); heart(g, x, y, r, i % 2 ? "#ff5a8a" : "#ff2a5a"); } g.globalAlpha = 1; },
  zzz: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); for (let i = 0; i < 3; i++) { const ph = (k / 12 + i / 3) % 1; g.globalAlpha = Math.min(1, (1 - ph) * 3); txt(g, "Z", 70 + ph * 120 + i * 6, 220 - ph * 180, 40 + ph * 50, "Bangers", "#ffffff", INK, 8); } g.globalAlpha = 1; },
  splash: (p, k) => { const g = p.g; g.clearRect(0, 0, 512, 256); for (let i = 0; i < 16; i++) { const a = Math.PI * (0.08 + 0.84 * hh(i, 7)), sp = 0.6 + hh(i, 8) * 0.6, tt = k / 10, x = 256 + Math.cos(a) * 260 * tt * sp, y = 240 - Math.sin(a) * 300 * tt * sp + 240 * tt * tt; if (tt < 1) E(g, x, y, 14 - tt * 6, 18 - tt * 8, 0, "#e8f8ff", 4, "#3a7ab0"); } },
};

const oc = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")); return c; };
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[0];

// ---------------- the straw goat (side view, facing right), 1024 x 1024 card ----------------
// o: face (happy, shock, smug, sad, nervous, proud, sleep), burnt (0..1), bones (only the wooden frame), fold (rear legs folding 0..1),
//    holes (0..1 pecked away), k (anim), blink
const STRAW = "#e8c25a", STRAW_D = "#c89a3a", STRAW_L = "#f6dc8a", RIB = "#d8282e";
const mix = (a, b, u) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, "0")).join(""); };
function goatShape(g, o) {
  // returns path callbacks so the body / legs can be filled or stroked
  const f = o.fold ?? 0;
  const legs = [[300, 640, -f * 0.9], [380, 640, -f * 0.9], [640, 640, 0], [720, 640, 0]];
  return { legs };
}
function drawGoat(g, o = {}) {
  g.clearRect(0, 0, 1024, 1024); g.lineJoin = "round"; g.lineCap = "round";
  const bu = o.burnt ?? 0, col = mix(STRAW, "#3a2a22", bu), dk = mix(STRAW_D, "#1e1612", bu), lt = mix(STRAW_L, "#5a463a", bu), k = o.k ?? 0, f = o.fold ?? 0;
  if (o.bones) { // the wooden skeleton only
    const W = "#8a5a32"; const bm = (pts) => { line(g, pts, INK, 26); line(g, pts, W, 14); };
    bm([[240, 470], [800, 470], [800, 640], [240, 640], [240, 470]]); bm([[240, 470], [800, 640]]); bm([[240, 640], [800, 470]]);
    for (const x of [280, 360, 660, 740]) bm([[x, 640], [x, 970]]);
    bm([[760, 470], [830, 250]]); bm([[800, 520], [880, 280]]); bm([[790, 250], [930, 250], [930, 360], [790, 360], [790, 250]]);
    bm([[820, 250], [770, 90], [700, 60]]); bm([[900, 250], [920, 100], [990, 70]]); bm([[240, 480], [170, 420]]);
    // a few leftover straws
    for (let i = 0; i < 18; i++) { const x = 250 + hh(i, 3) * 560, y = 470 + hh(i, 4) * 170; line(g, [[x, y], [x + 30 * (hh(i, 5) - 0.5), y + 40]], STRAW, 6); }
    // face on the frame head: sad / shocked
    const fx = 880, fy = 300; E(g, fx, fy, 22, 26, 0, "#ffffff", 6); E(g, fx + 4, fy + 2, 10, 12, 0, INK, 0);
    if (o.face === "sad") line(g, [[fx - 24, fy - 34], [fx + 20, fy - 44]], INK, 8); line(g, [[880, 345], [910, 340]], INK, 6);
    return;
  }
  // legs (rear pair can fold) — red ribbon bands near the hooves
  const leg = (x, a) => { g.save(); g.translate(x, 630); g.rotate(a); R(g, -34, 0, 68, 340, 26, col, 10); for (let i = 0; i < 6; i++) line(g, [[-20 + i * 8, 20], [-24 + i * 8, 320]], dk, 3); R(g, -36, 250, 72, 34, 8, RIB, 7); g.restore(); };
  leg(290, f * 1.0); leg(375, f * 0.7); leg(650, 0); leg(735, 0);
  // tail
  poly(g, [[230, 480], [150, 400], [170, 500]], col, 10);
  // body: a rounded block of bound straw with red bands
  g.save(); g.translate(0, f * 60); g.rotate(f * 0.12);
  R(g, 200, 440, 640, 230, 90, col, 12);
  for (let i = 0; i < 26; i++) { const x = 230 + i * 23; line(g, [[x, 460 + (i % 3) * 6], [x - 8, 650 - (i % 2) * 8]], dk, 4); }
  g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.ellipse(470, 480, 220, 26, 0, 0, two); g.fill();
  for (const x of [330, 520, 710]) { R(g, x - 18, 442, 36, 226, 6, RIB, 7); }
  // pecked holes (jackdaws)
  if (o.holes) { g.save(); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < Math.round(o.holes * 22); i++) { E(g, 230 + hh(i, 7) * 580, 470 + hh(i, 8) * 180, 30 + hh(i, 9) * 40, 26 + hh(i, 1) * 30, 0, "#000", 0); } g.restore(); }
  // neck + head
  poly(g, [[720, 470], [780, 250], [880, 250], [830, 520]], col, 12);
  for (let i = 0; i < 6; i++) line(g, [[760 + i * 14, 300], [740 + i * 16, 480]], dk, 4);
  R(g, 770, 220, 190, 150, 60, col, 12);
  R(g, 900, 270, 90, 90, 36, lt, 10); E(g, 960, 300, 8, 6, 0, INK, 0);
  R(g, 790, 380, 40, 90, 10, RIB, 7);
  // horns: big curling straw horns
  g.lineWidth = 34; for (const [a, b] of [[[800, 230], [730, 110, 640, 120]], [[860, 222], [850, 90, 940, 60]]]) { g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(b[0], b[1], b[2], b[3]); g.strokeStyle = INK; g.lineWidth = 46; g.stroke(); g.strokeStyle = lt; g.lineWidth = 30; g.stroke(); }
  // ear
  poly(g, [[790, 260], [700, 300], [790, 300]], dk, 9);
  // eye + face
  const face = o.face ?? "happy", ex = 870, ey = 280, bl = o.blink && Math.floor(k / 7) % 9 === 0;
  if (face === "happy" || face === "proud" || bl) line(g, [[ex - 24, ey + 4], [ex, ey - 16], [ex + 24, ey + 4]], INK, 10);
  else if (face === "sleep") line(g, [[ex - 24, ey], [ex + 24, ey]], INK, 9);
  else { const big = face === "shock" ? 1.4 : 1; E(g, ex, ey, 30 * big, 32 * big, 0, "#ffffff", 7); E(g, ex + 6, ey + 2, (face === "shock" ? 8 : 14), (face === "shock" ? 8 : 15), 0, INK, 0); E(g, ex + 12, ey - 8, 5, 5, 0, "#ffffff", 0);
    if (face === "smug") { g.fillStyle = col; g.fillRect(ex - 34, ey - 40, 70, 34); line(g, [[ex - 32, ey - 6], [ex + 32, ey - 8]], INK, 8); }
    if (face === "sad" || face === "nervous") line(g, [[ex - 30, ey - 44], [ex + 26, ey - 56]], INK, 9);
    if (face === "angry") line(g, [[ex - 30, ey - 56], [ex + 26, ey - 36]], INK, 10); }
  // mouth
  if (face === "shock") E(g, 950, 340, 22, 26, 0, "#5a1a22", 7);
  else if (face === "sad" || face === "nervous") { g.beginPath(); g.arc(950, 352, 20, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); }
  else { g.beginPath(); g.arc(946, 326, 22, Math.PI * 0.15, Math.PI * 0.85); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); }
  if (face === "nervous") { g.beginPath(); g.moveTo(820, 200); g.quadraticCurveTo(840, 240, 820, 250); g.quadraticCurveTo(800, 240, 820, 200); g.fillStyle = "#8fd0ff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  // soot smudges when burnt
  if (bu > 0.3) for (let i = 0; i < 10; i++) E(g, 240 + hh(i, 11) * 560, 460 + hh(i, 12) * 200, 40, 20, 0.3, "rgba(30,20,16,0.5)", 0);
  g.restore();
}
// fire: a cluster of flame tongues, 512 x 768 (soft). lvl 0..1, k anim frame
function drawFire(g, k, lvl) {
  g.clearRect(0, 0, 512, 768); const n = 7;
  const glow = g.createRadialGradient(256, 600, 20, 256, 560, 300); glow.addColorStop(0, `rgba(255,190,80,${0.5 * lvl})`); glow.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = glow; g.fillRect(0, 0, 512, 768);
  for (const [c, sc] of [["#e8401a", 1], ["#ff8a1a", 0.78], ["#ffd23a", 0.55], ["#fff6c0", 0.3]]) {
    for (let i = 0; i < n; i++) { const x = 70 + (i / (n - 1)) * 372, ph = k * 0.9 + i * 1.7, hgt = (300 + 300 * hh(i, 2) + 80 * Math.sin(ph)) * lvl * sc, w = 70 * sc + 20, sway = Math.sin(ph * 1.3) * 40 * sc;
      g.beginPath(); g.moveTo(x - w, 740); g.quadraticCurveTo(x - w * 0.9, 740 - hgt * 0.5, x + sway, 740 - hgt); g.quadraticCurveTo(x + w * 0.9, 740 - hgt * 0.5, x + w, 740); g.closePath(); g.fillStyle = c; g.fill(); }
    g.fillStyle = c; g.beginPath(); g.ellipse(256, 740, 230 * sc + 30, 60 * sc + 20, 0, 0, two); g.fill(); }
  for (let i = 0; i < 8; i++) { const ph = (k / 12 + i / 8) % 1, x = 100 + hh(i, 5) * 312 + Math.sin(ph * 8 + i) * 20, y = 700 - ph * 680 * lvl; g.globalAlpha = (1 - ph) * lvl; E(g, x, y, 7, 7, 0, "#ffe080", 0); } g.globalAlpha = 1;
}
function drawSmoke(g, k) { g.clearRect(0, 0, 512, 512); for (let i = 0; i < 9; i++) { const ph = (k / 24 + i / 9) % 1, x = 256 + (hh(i, 3) - 0.5) * 200 + ph * 60, y = 470 - ph * 400, r = 50 + ph * 110; g.globalAlpha = 0.55 * Math.sin(ph * Math.PI); E(g, x, y, r, r * 0.85, 0, i % 2 ? "#4a4a52" : "#6a6a72", 0); } g.globalAlpha = 1; }
// calendar page with a burned goat doodle (512 x 576)
const drawCal = (g, page) => { g.clearRect(0, 0, 512, 576); g.lineJoin = "round"; R(g, 40, 60, 432, 480, 22, "#ffffff", 11); R(g, 40, 60, 432, 110, [22, 22, 0, 0], "#c8202e", 11); txt(g, "DECEMBER", 256, 118, 64, "Bangers", "#ffffff", INK, 6, 380);
  for (const x of [120, 392]) { R(g, x - 14, 36, 28, 60, 10, "#8a8a92", 6); }
  g.save(); g.translate(256, 360); g.scale(0.26, 0.26); g.translate(-560, -560); drawGoat(g, { face: page % 2 ? "shock" : "sad", burnt: 0.8 }); g.restore();
  g.save(); g.translate(256, 380); for (let i = 0; i < 5; i++) { const x = -120 + i * 60, h = 70 + (i % 2) * 40; poly(g, [[x - 26, 120], [x, 120 - h], [x + 26, 120]], i % 2 ? "#ff8a1a" : "#e8401a", 5); } g.restore();
  txt(g, "BURNED", 256, 500, 70, "Bangers", "#c8202e", INK, 6, 400); };
// a 1960s rounded sedan, side view facing left (1024 x 512). o.crash (0..1) crumples the nose, o.k wheels
const drawCar = (g, o = {}) => { g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; const c = o.crash ?? 0, k = o.k ?? 0, body = "#d84a3a";
  const nx = 90 + c * 90;
  g.beginPath(); g.moveTo(nx, 330); g.quadraticCurveTo(nx - 10, 250, nx + 90, 240); g.lineTo(300, 230); g.quadraticCurveTo(360, 130, 480, 125); g.lineTo(660, 125); g.quadraticCurveTo(780, 130, 820, 230); g.lineTo(930, 245); g.quadraticCurveTo(980, 260, 975, 330); g.lineTo(975, 370); g.lineTo(nx, 370); g.closePath(); g.fillStyle = body; g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  poly(g, [[330, 228], [395, 150], [540, 146], [540, 228]], "#a8d4f0", 9); poly(g, [[565, 228], [565, 146], [660, 146], [770, 228]], "#a8d4f0", 9);
  line(g, [[nx + 20, 300], [960, 300]], "#f4f4f0", 8); E(g, nx + 20, 280, 20, 16, 0, "#fff6c0", 6);
  if (c > 0.2) for (let i = 0; i < 4; i++) line(g, [[nx + 10 + i * 18, 250 + i * 25], [nx + 40 + i * 18, 270 + i * 25]], INK, 6);
  for (const x of [260, 790]) { E(g, x, 370, 70, 70, 0, "#2a2a30", 10); E(g, x, 370, 32, 32, 0, "#c8ccd4", 6); line(g, [[x + Math.cos(k) * 30, 370 + Math.sin(k) * 30], [x - Math.cos(k) * 30, 370 - Math.sin(k) * 30]], INK, 6); }
  if (c > 0.3) { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45; line(g, [[nx - 20, 280], [nx - 20 + Math.cos(a) * 90 * c, 280 + Math.sin(a) * 90 * c]], "#ffe85a", 10); } } };
// gingerbread man (512 x 768), o.k, o.bow (holding a bow), o.face
const drawGinger = (g, o = {}) => { g.clearRect(0, 0, 512, 768); g.lineJoin = "round"; const C = "#b8723a", k = o.k ?? 0, wv = Math.sin(k * 0.8) * 0.15;
  const limb = (x0, y0, a, L) => { g.save(); g.translate(x0, y0); g.rotate(a); R(g, -48, 0, 96, L, 46, C, 10); line(g, [[-30, L - 40], [30, L - 40]], "#ffffff", 9); line(g, [[-24, L - 30], [-12, L - 50], [0, L - 30], [12, L - 50], [24, L - 30]], "#ffffff", 5); g.restore(); };
  limb(200, 560, 0.3, 200); limb(312, 560, -0.3, 200); limb(170, 330, 1.2 + wv, 170); limb(342, 330, -1.2 - wv, 170);
  E(g, 256, 440, 120, 170, 0, C, 11); E(g, 256, 200, 110, 105, 0, C, 11);
  for (const y of [380, 450, 520]) E(g, 256, y, 16, 16, 0, ["#ff4a6a", "#4ab0ff", "#7ad04a"][(y / 70) % 3 | 0], 5);
  E(g, 220, 190, 16, 18, 0, "#ffffff", 0); E(g, 292, 190, 16, 18, 0, "#ffffff", 0); E(g, 224, 194, 8, 9, 0, INK, 0); E(g, 296, 194, 8, 9, 0, INK, 0);
  if (o.face === "sly") { line(g, [[200, 160], [240, 172]], "#ffffff", 8); line(g, [[312, 160], [272, 172]], "#ffffff", 8); }
  g.beginPath(); g.arc(256, 228, 40, 0.2 * Math.PI, 0.8 * Math.PI); g.strokeStyle = "#ffffff"; g.lineWidth = 9; g.stroke();
  line(g, [[150, 120], [170, 100], [190, 120], [210, 100]], "#ffffff", 6); };
// bow + flaming arrow (512 x 512): o.draw 0..1 (string pulled), o.arrow (show the nocked arrow), o.k
const drawBow = (g, o = {}) => { g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; const d = o.draw ?? 0, k = o.k ?? 0;
  g.beginPath(); g.moveTo(300, 60); g.quadraticCurveTo(470, 256, 300, 452); g.strokeStyle = INK; g.lineWidth = 26; g.stroke(); g.strokeStyle = "#8a5a32"; g.lineWidth = 14; g.stroke();
  const sx = 300 - d * 160; line(g, [[300, 60], [sx, 256], [300, 452]], "#f4f0e0", 5);
  if (o.arrow) { line(g, [[sx, 256], [sx + 260, 256]], INK, 14); line(g, [[sx, 256], [sx + 260, 256]], "#c8a06a", 7); poly(g, [[sx + 250, 240], [sx + 290, 256], [sx + 250, 272]], "#8a8a92", 5);
    for (let i = 0; i < 4; i++) { const ph = k * 0.9 + i; poly(g, [[sx + 236, 250], [sx + 276 + Math.sin(ph) * 10, 200 - i * 12], [sx + 300, 250]], ["#e8401a", "#ff8a1a", "#ffd23a", "#fff6c0"][i], 0); } } };
const drawArrow = (g, k) => { g.clearRect(0, 0, 512, 128); line(g, [[40, 64], [400, 64]], INK, 14); line(g, [[40, 64], [400, 64]], "#c8a06a", 7); poly(g, [[390, 46], [450, 64], [390, 82]], "#8a8a92", 5); poly(g, [[40, 64], [10, 40], [70, 64], [10, 88]], "#e8e0d0", 4);
  for (let i = 0; i < 4; i++) { const ph = k * 0.9 + i; poly(g, [[440, 64], [370 - i * 20, 40 + Math.sin(ph) * 10], [300 - i * 30, 64], [370 - i * 20, 88 - Math.sin(ph) * 8]], ["#e8401a", "#ff8a1a", "#ffd23a", "#fff6c0"][i], 0); } };
// helicopter, side view facing right (1024 x 512), o.k rotor
const drawHeli = (g, k) => { g.clearRect(0, 0, 1024, 512); g.lineJoin = "round";
  R(g, 80, 200, 420, 34, 16, "#2a3a5a", 9); poly(g, [[60, 150], [110, 150], [120, 230], [70, 230]], "#2a3a5a", 9);
  E(g, 600, 260, 230, 130, 0, "#3a5a8a", 12); poly(g, [[640, 160], [790, 210], [800, 290], [650, 290]], "#a8d4f0", 9);
  line(g, [[480, 400], [800, 400]], INK, 12); line(g, [[540, 380], [520, 400]], INK, 10); line(g, [[740, 380], [760, 400]], INK, 10);
  R(g, 580, 100, 40, 40, 6, "#2a2a30", 7); const w = 380 * Math.abs(Math.cos(k * 1.7)); line(g, [[600 - w, 100], [600 + w, 100]], "#2a2a30", 14); line(g, [[600 - 380, 92], [600 + 380, 92]], "rgba(40,40,48,0.25)", 6);
  E(g, 85, 150, 10, 60 * Math.abs(Math.sin(k * 2.1)) + 6, 0, "#2a2a30", 0); line(g, [[600, 390], [600, 512]], "#5a4a3a", 8); };
// security camera on a bracket (256 x 256), o.a (pan)
const drawCam = (g, a) => { g.clearRect(0, 0, 256, 256); g.lineJoin = "round"; R(g, 20, 40, 30, 180, 8, "#5a5a62", 6); g.save(); g.translate(60, 90); g.rotate(a); R(g, -10, -30, 170, 64, 18, "#e8eaee", 8); R(g, 150, -24, 40, 52, 10, "#2a2a30", 7); E(g, 172, 2, 14, 14, 0, "#4ab0ff", 4); E(g, 20, -10, 8, 8, 0, "#ff3a3a", 0); g.restore(); };
// metal fence panel (1024 x 384)
const drawFence = (g, col = "#9aa2ae") => { g.clearRect(0, 0, 1024, 384); g.lineJoin = "round"; for (const x of [20, 512, 1004]) R(g, x - 14, 20, 28, 360, 8, "#6a7280", 6);
  line(g, [[20, 40], [1004, 40]], col, 10); line(g, [[20, 360], [1004, 360]], col, 10); for (let x = 40; x < 1004; x += 36) { line(g, [[x, 40], [x + 120, 360]], "rgba(140,150,164,0.9)", 4); line(g, [[x + 120, 40], [x, 360]], "rgba(140,150,164,0.9)", 4); } };
// webcam stream on a laptop (768 x 576): o.k
const drawLaptop = (g, k) => { g.clearRect(0, 0, 768, 576); g.lineJoin = "round"; R(g, 80, 30, 608, 400, 24, "#2a2a30", 12); const gr = g.createLinearGradient(0, 60, 0, 400); gr.addColorStop(0, "#1a2a4a"); gr.addColorStop(1, "#3a4a6a"); R(g, 110, 60, 548, 340, 8, gr, 0);
  for (let i = 0; i < 20; i++) E(g, 120 + hh(i, 3) * 530, 70 + ((hh(i, 4) * 320 + k * 6) % 320), 4, 4, 0, "#ffffff", 0);
  g.save(); g.beginPath(); g.rect(110, 60, 548, 340); g.clip(); g.translate(384, 250); g.scale(0.28, 0.28); g.translate(-560, -560); drawGoat(g, { face: "nervous" }); g.restore();
  R(g, 130, 78, 120, 44, 10, "#d8202e", 0); txt(g, "● LIVE", 190, 102, 34, "Bangers", "#ffffff", INK, 0, 110); poly(g, [[20, 430], [748, 430], [700, 520], [68, 520]], "#c8ccd4", 10); };
// a jackdaw (256 x 256), side view facing right: o.pk (peck), o.wing, o.shades
const drawDaw = (g, o = {}) => { g.clearRect(0, 0, 256, 256); g.lineJoin = "round"; const pk = o.pk ?? 0, wg = o.wing ?? 0;
  line(g, [[110, 180], [100, 230]], INK, 8); line(g, [[140, 180], [150, 230]], INK, 8);
  poly(g, [[60, 150], [10, 170], [20, 190], [80, 175]], "#1e1e26", 6);
  E(g, 120, 150, 70, 46, -0.1, "#2a2a34", 8);
  g.save(); g.translate(110, 140); g.rotate(-wg * 1.1); poly(g, [[0, 0], [-80, -10], [-60, 30], [20, 20]], "#1e1e26", 6); g.restore();
  const hx = 180 + pk * 20, hy = 100 + pk * 40; E(g, hx, hy, 40, 38, 0, "#4a4a58", 8); E(g, hx - 18, hy + 6, 22, 26, 0, "#8a8a96", 0);
  poly(g, [[hx + 30, hy - 6], [hx + 72, hy + 6], [hx + 30, hy + 14]], "#1a1a1a", 5);
  if (o.shades) { R(g, hx - 6, hy - 18, 42, 20, 8, "#111", 0); line(g, [[hx - 34, hy - 10], [hx, hy - 10]], "#111", 5); }
  else { E(g, hx + 10, hy - 6, 11, 11, 0, "#e8eef8", 4); E(g, hx + 12, hy - 6, 4, 4, 0, INK, 0); line(g, [[hx - 4, hy - 22], [hx + 22, hy - 14]], INK, 6); }
  if (o.straw) line(g, [[hx + 50, hy + 4], [hx + 110, hy + 30]], STRAW, 9); };
// storm cloud + wind (1024 x 512), k
const drawStorm = (g, k) => { g.clearRect(0, 0, 1024, 512); for (const [x, y, r] of [[250, 160, 150], [460, 120, 180], [700, 160, 160], [480, 230, 170], [820, 230, 120], [170, 240, 110]]) E(g, x, y, r, r * 0.6, 0, "#4a5262", 10);
  for (const [x, y, r] of [[250, 160, 150], [460, 120, 180], [700, 160, 160], [480, 230, 170], [820, 230, 120], [170, 240, 110]]) E(g, x, y, r - 8, r * 0.6 - 8, 0, "#5a6272", 0);
  for (let i = 0; i < 7; i++) { const x = ((k * 50 + i * 160) % 1200) - 100, y = 330 + (i % 3) * 50; g.beginPath(); g.moveTo(x - 200, y); g.quadraticCurveTo(x, y - 30, x + 100, y + 10); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 9; g.lineCap = "round"; g.stroke(); }
  E(g, 380, 200, 16, 18, 0, "#ffffff", 5); E(g, 560, 200, 16, 18, 0, "#ffffff", 5); line(g, [[350, 168], [400, 182]], INK, 10); line(g, [[590, 168], [540, 182]], INK, 10); E(g, 470, 260, 40, 22, 0, "#2a2a34", 6); };
// cash bundle (256 x 160)
const drawCash = (g) => { g.clearRect(0, 0, 256, 160); for (let i = 0; i < 3; i++) R(g, 20 + i * 6, 30 + i * 10, 210, 100, 10, "#9ad07a", 7); R(g, 110, 40, 36, 110, 4, "#f4f0dc", 5); txt(g, "$", 70, 100, 70, "AlfaSlab", "#3a7a3a", INK, 0); };
// jail bars (512 x 768)
const drawBars = (g) => { g.clearRect(0, 0, 512, 768); for (let x = 40; x < 512; x += 78) { R(g, x - 13, 0, 26, 768, 8, "#5a5e68", 6); } R(g, 0, 120, 512, 30, 6, "#5a5e68", 6); R(g, 0, 640, 512, 30, 6, "#5a5e68", 6); };
// speech bubble (768 x 384)
const drawBubble = (g, s, col = "#2a2a36") => { g.clearRect(0, 0, 768, 384); g.lineJoin = "round"; g.beginPath(); g.ellipse(384, 170, 350, 140, 0, 0, two); g.moveTo(240, 290); g.lineTo(150, 370); g.lineTo(330, 300); g.fillStyle = "#ffffff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  g.beginPath(); g.ellipse(384, 170, 344, 134, 0, 0, two); g.fill(); txt(g, s, 384, 176, 110, "Bangers", col, INK, 0, 600); };
// Swedish flag on a pole (512 x 768)
const drawSwe = (g, k) => { g.clearRect(0, 0, 512, 768); R(g, 30, 20, 22, 740, 8, "#d8dce2", 6); g.save(); g.translate(52, 60);
  g.beginPath(); for (let i = 0; i <= 20; i++) { const x = i * 21, y = Math.sin(k * 0.6 + i * 0.5) * 12 * (i / 20); i ? g.lineTo(x, y) : g.moveTo(x, y); } for (let i = 20; i >= 0; i--) { const x = i * 21, y = 270 + Math.sin(k * 0.6 + i * 0.5) * 12 * (i / 20); g.lineTo(x, y); } g.closePath(); g.fillStyle = "#1a5aa8"; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  g.fillStyle = "#ffd23a"; g.fillRect(120, 6, 50, 262); g.fillRect(0, 110, 420, 50); g.restore(); };
// red ribbon across (1024 x 128), o.cut
const drawRibbon = (g, cut) => { g.clearRect(0, 0, 1024, 128); if (!cut) { R(g, 0, 44, 1024, 40, 6, "#d8202e", 6); E(g, 512, 64, 60, 44, 0, "#ff4a5a", 7); } else { g.save(); g.translate(400, 64); g.rotate(0.5); R(g, -400, -20, 400, 40, 6, "#d8202e", 6); g.restore(); g.save(); g.translate(624, 64); g.rotate(-0.5); R(g, 0, -20, 400, 40, 6, "#d8202e", 6); g.restore(); } };
// clock (384 x 384), a = hand turns
const drawClock = (g, a) => { g.clearRect(0, 0, 384, 384); E(g, 192, 192, 170, 170, 0, "#fbf3dc", 14); for (let i = 0; i < 12; i++) { const q = (i / 12) * two; line(g, [[192 + Math.cos(q) * 140, 192 + Math.sin(q) * 140], [192 + Math.cos(q) * 158, 192 + Math.sin(q) * 158]], INK, 8); }
  line(g, [[192, 192], [192 + Math.cos(a - Math.PI / 2) * 110, 192 + Math.sin(a - Math.PI / 2) * 110]], INK, 14); line(g, [[192, 192], [192 + Math.cos(a * 12 - Math.PI / 2) * 140, 192 + Math.sin(a * 12 - Math.PI / 2) * 140]], "#c8202e", 8); E(g, 192, 192, 14, 14, 0, INK, 0); };
// water spray (512 x 256) from the left
const drawSpray = (g, k) => { g.clearRect(0, 0, 512, 256); for (let i = 0; i < 26; i++) { const ph = (k / 8 + i / 26) % 1, x = 10 + ph * 480, y = 200 - Math.sin(ph * Math.PI * 0.8) * 150 + (hh(i, 3) - 0.5) * 30 * ph; E(g, x, y, 12 + ph * 14, 10 + ph * 10, 0, i % 2 ? "#8fd0ff" : "#c8ecff", 4, "#3a7ab0"); } };

const XL = {
  lighter: (k) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, x = H.r[0], y = H.r[1]; R(g, x - 22, y - 70, 44, 80, 8, "#d8202e", 6); R(g, x - 18, y - 86, 36, 20, 4, "#c8ccd4", 5);
    for (const [c, s] of [["#ff8a1a", 1], ["#ffd23a", 0.65], ["#fff6c0", 0.35]]) { g.beginPath(); g.moveTo(x - 18 * s, y - 90); g.quadraticCurveTo(x - 20 * s, y - 130 * s - 20, x + Math.sin(k) * 6, y - 170 * s - 20); g.quadraticCurveTo(x + 20 * s, y - 130 * s - 20, x + 18 * s, y - 90); g.fillStyle = c; g.fill(); } },
  beard: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.chin; g.beginPath(); g.moveTo(300 - 95, y - 70); g.quadraticCurveTo(300 - 110, y + 60, 300, y + 120); g.quadraticCurveTo(300 + 110, y + 60, 300 + 95, y - 70); g.quadraticCurveTo(300, y - 10, 300 - 95, y - 70); g.fillStyle = "#ffffff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
    E(g, 300, y - 260, 26, 26, 0, "#ffffff", 6); },
  bow: (d, k) => (p) => { const H = p.hands; if (!H || !H.r) return; const c = document.createElement("canvas"); c.width = 512; c.height = 512; drawBow(c.getContext("2d"), { draw: d, arrow: true, k }); p.g.drawImage(c, H.l[0] - 300, H.l[1] - 256, 300, 300); },
  pad: (p) => { const H = p.hands; if (!H || !H.l) return; const g = p.g; R(g, H.l[0] - 50, H.l[1] - 110, 100, 130, 8, "#fbf8f0", 6); for (let i = 0; i < 4; i++) line(g, [[H.l[0] - 34, H.l[1] - 80 + i * 24], [H.l[0] + 34, H.l[1] - 80 + i * 24]], "#8a8a92", 5); },
  cash: (p) => { const H = p.hands; if (!H || !H.r) return; const c = document.createElement("canvas"); c.width = 256; c.height = 160; drawCash(c.getContext("2d")); p.g.drawImage(c, H.r[0] - 70, H.r[1] - 80, 150, 94); },
  hose: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; line(g, [[H.r[0] - 120, H.r[1] + 200], [H.r[0], H.r[1]], [H.r[0] + 90, H.r[1] - 30]], INK, 30); line(g, [[H.r[0] - 120, H.r[1] + 200], [H.r[0], H.r[1]], [H.r[0] + 90, H.r[1] - 30]], "#c8202e", 18); R(g, H.r[0] + 80, H.r[1] - 48, 50, 36, 8, "#c8a03a", 6); },
  scissors: (ph) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, a = 0.35 + 0.25 * Math.sin(ph); g.save(); g.translate(H.r[0], H.r[1] - 40); for (const s of [-1, 1]) { g.save(); g.rotate(s * a - Math.PI / 2); poly(g, [[0, -14], [230, -4], [230, 4], [0, 14]], "#d8dce2", 6); E(g, -50, 0, 38, 26, 0, null, 14, "#d8302e"); g.restore(); } E(g, 0, 0, 10, 10, 0, "#8a8a92", 4); g.restore(); },
  hammer: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; line(g, [[H.r[0], H.r[1] + 30], [H.r[0], H.r[1] - 130]], INK, 22); line(g, [[H.r[0], H.r[1] + 30], [H.r[0], H.r[1] - 130]], "#c89a5a", 12); R(g, H.r[0] - 50, H.r[1] - 170, 100, 44, 8, "#6a6e78", 6); },
  straw: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; for (let i = 0; i < 9; i++) line(g, [[H.r[0] - 60 + i * 14, H.r[1] - 60], [H.r[0] - 50 + i * 12, H.r[1] + 30]], STRAW_D, 9); },
};
const TOWN = (v) => ({ jacket: ["#c8463a", "#3a6a9a", "#2f7a5a", "#7a4a8a", "#d8a02a", "#4a4a5a"][v % 6], pants: ["#2e3442", "#3a2e2a", "#2a2a36"][v % 3], boots: INK, hat: "cap", cap: ["#e8e0cc", "#c8202e", "#2a5aa8", "#e8b84a"][v % 4], hair: ["#e8c890", "#7a5a3a", "#2a201a"][v % 3], skin: ["#f2d2b6", "#ecd0b6", "#e8b894"][v % 3] });
const GUARD = (v) => ({ jacket: "#2a3040", pants: "#2a3040", boots: INK, hat: "cap", cap: "#1a1e28", hair: "#5a4030", skin: ["#f2d2b6", "#e8b894"][v % 2], build: "adult" });
const POLICE = { jacket: "#1f2a4a", pants: "#1f2a4a", boots: INK, hat: "cap", cap: "#f4f4f0", hair: "#c8a060", skin: "#f2d2b6", build: "adult" };
const TOURIST = { jacket: "#1aa8a0", pants: "#c8b08a", boots: "#8a5a3a", hat: "cap", cap: "#d8202e", hair: "#8a6a4a", moustache: "#8a6a4a", skin: "#f0c8a8", build: "stout" };
const SANTA = { jacket: "#c8202e", pants: "#c8202e", boots: INK, hat: "cap", cap: "#c8202e", hair: "#f4f4f4", moustache: "#ffffff", skin: "#f2d2b6", build: "stout" };
const SHADY = { jacket: "#3a3a40", pants: "#2a2a30", boots: INK, hat: "fedora", hair: "#2a201a", moustache: "#2a201a", skin: "#e8c8a8", build: "adult" };
const FIRE = { jacket: "#c8a03a", pants: "#2a2a30", boots: INK, hat: "cap", cap: "#c8202e", hair: "#3a2a1a", skin: "#e8b894", build: "adult" };
const WORK = (v) => ({ jacket: "#ff8a2a", pants: "#2e3a5a", boots: INK, hat: "cap", cap: ["#ffd23a", "#2a5aa8", "#e8e0cc"][v % 3], hair: "#5a4030", skin: ["#f2d2b6", "#e8b894", "#ecd0b6"][v % 3], build: "adult" });

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const G_ = (x, y, z) => [GOAT[0] + x, GOAT[1] + y, GOAT[2] + z];
  const gold = { light: "golden", fogFar: 2500 };
  const nite = { light: "night", fogFar: 2500 };
  const A = {
    fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = G_(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
    ppl: (out, i, o, x, z, opt = {}) => { const [X, , Z] = G_(x, 0, z); out.places.push(pl(i, o, X, 0.1, Z, opt)); },
  };
  const mk = (out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); A.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic" }); };
  const wd = (out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); A.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const bd = (out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; A.fx(out, key, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const sparkle = (out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) A.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  const bub = (out, key, s, col, x, y, z, u, w = 1.4) => { if (u <= 0) return; const k = smooth(u * 4); A.fx(out, key, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic" }); };
  // the goat card: 12 x 12 m, standing on the ground at (x, z). o: face, burnt, bones, fold, holes, rot, w, sq
  const goat = (out, t, o = {}) => { const w = o.w ?? 12, x = o.x ?? 0, z = o.z ?? 0, kk = Math.floor(t * 12) % 64, q = (v, n = 10) => Math.round((v ?? 0) * n) / n;
    const st = { face: o.face ?? "happy", burnt: q(o.burnt), bones: !!o.bones, fold: q(o.fold), holes: q(o.holes), k: o.blink ? kk : 0, blink: !!o.blink };
    const key = "goat" + [st.face, st.burnt, st.bones ? 1 : 0, st.fold, st.holes, st.k].join("_");
    A.fx(out, key, (p) => drawGoat(p.g, st), x, (o.y ?? 0) + 0.1 + w * 0.5 - 0.02 * w, z, w, w, { cw: 1024, ch: 1024, kind: "lit", rot: o.rot ?? 0, normal: [0, 0, 1] }); };
  // fire on the goat: flame tongues along the body + a big plume, lvl 0..1
  const fire = (out, t, lvl, o = {}) => { if (lvl <= 0.02) return; const x0 = o.x ?? 0, z0 = (o.z ?? 0) + 0.25, s = o.s ?? 1, L = Math.round(lvl * 8) / 8;
    [[-3.6, 0, 4.4, 7], [-0.8, 0.4, 5, 8.5], [2.4, 0.4, 4.6, 8], [4.6, 3.4, 3.4, 6.5], [-1.2, 3.6, 7, 10]].forEach(([x, y, w, h], i) => { const k = (Math.floor(t * 12) + i * 3) % 12;
      A.fx(out, "fire" + k + "_" + L, (p) => drawFire(p.g, k, L), x0 + x * s, y * s + h * s * 0.5 * L + 0.1, z0 + 0.02 * i, w * s, h * s * L, { cw: 512, ch: 768, kind: "soft" }); });
    if (lvl > 0.4) { const k = Math.floor(t * 12) % 24; A.fx(out, "smoke" + k, (p) => drawSmoke(p.g, k), x0 + 0.5 * s, 14 * s, z0 - 0.5, 12 * s, 12 * s, { cw: 512, ch: 512, kind: "soft" }); } };
  const fence = (out, x, z, w = 6, h = 2.2, col) => A.fx(out, "fence" + (col || ""), (p) => drawFence(p.g, col), x, 0.1 + h / 2, z, w, h * 0.98, { cw: 1024, ch: 384, kind: "lit", normal: [0, 0, 1] });
  const crowd = (out, t, base, pts, expr = "gasp", arms) => pts.forEach(([x, z], i) => A.ppl(out, base + i, TOWN(i + base), x, z, { expr: typeof expr === "function" ? expr(i) : expr, arms: arms ? arms(i) : { l: ["face", 1], r: ["face", 1] }, headTilt: Math.sin(t * 5 + i) * 3 }));
  const daw = (out, t, i, x, y, z, o = {}) => { const k = Math.floor(t * 10 + i * 3) % 6, pk = o.peck ? (k % 2) : 0, wg = o.fly ? (k % 3) / 2 : 0, key = "daw" + pk + wg + (o.shades ? "s" : "") + (o.straw ? "t" : "");
    A.fx(out, key, (p) => drawDaw(p.g, { pk, wing: wg, shades: o.shades, straw: o.straw }), x, y, z, o.w ?? 0.9, o.w ?? 0.9, { cw: 256, ch: 256, kind: "lit", rot: o.flip ? 0 : 0 }); };

  // camera presets on the goat (goat card at the origin facing +z, 12 m wide, top of the horns ≈ 11.7 m)
  const wide = (d = 24, y = 2.0, ly = 6.2, x = 0.4) => [G_(x, y, d), G_(0.3, ly, 0)];
  const heroCam = push(G_(-1.6, 1.4, 22.5), G_(0.4, 6.6, 0), G_(-1.2, 1.5, 20.5), G_(0.4, 6.9, 0), 52, 2.4);
  const heroStage = (t, out, lvl) => { goat(out, t, { face: lvl > 0.5 ? "shock" : "nervous", burnt: lvl > 0.6 ? 0.3 : 0 }); fire(out, t, lvl);
    crowd(out, t, 1, [[-3.2, 15.8], [-4.6, 16.8], [3.6, 16.2], [4.9, 17.2]], "gasp"); };
  // 1 This giant goat gets burned…: the straw goat already ablaze on frame 0, the crowd gasping
  shot({ a: 0, ...gold, cam: heroCam, cInf: 0.6, focus: G_(0, 5, 0), shadowR: 30, stage(t, out) { heroStage(t, out, clamp01(0.75 + t * 0.2)); } });
  kick1(T("burned"));
  // 2 …almost every year.: calendar pages flipping, each one a burned goat
  const tEv = T("every");
  shot({ at: S("almost"), ...gold, cam: push(G_(0, 2.2, 9.6), G_(0, 2.2, 6), G_(0, 2.2, 9.1), G_(0, 2.2, 6), 46, 1.6), cInf: 2, focus: G_(0, 2.2, 6), shadowR: 12,
    stage(t, out) { const pg = Math.floor(Math.max(0, t - tEv + 0.4) * 5); A.fx(out, "cal" + (pg % 4), (p) => drawCal(p.g, pg), 0, 2.2, 6, 2.0, 2.25, { cw: 512, ch: 576, kind: "basic", rot: Math.sin(t * 9) * 0.03 });
      goat(out, t, { face: "sad", burnt: 0.7 }); fire(out, t, 0.6); } });
  // 3 It's made of straw.: close on the goat's straw neck and face, a worker tugs a straw out
  shot({ at: S("It's made"), ...gold, cam: push(G_(3.0, 7.4, 9.5), G_(3.0, 7.6, 0), G_(3.0, 7.5, 8.6), G_(3.0, 7.7, 0), 48, 1.6), cInf: 1.6, focus: G_(3.6, 8, 0), shadowR: 12,
    stage(t, out) { goat(out, t, { face: "happy", blink: true }); sparkle(out, t, 3.8, 8.2, 0.3, 0.5, 3); wd(out, "STRAW!", "#c89a3a", 1.4, 10.4, 0.5, (t - T("straw") + 0.05) * 2.5, 2.2); } });
  // 4 Thirteen meters tall.: a tiny man at the goat's hoof, the camera tilts up the whole height
  shot({ at: S("Thirteen"), ...gold, cam: keys([{ t: 0, pos: G_(-1.8, 1.2, 9.5), look: G_(-2.4, 1.5, 0), fov: 54 }, { t: 1.4, pos: G_(-1.4, 1.6, 15.5), look: G_(0.4, 7.0, 0), fov: 58 }]), cInf: 0.9, focus: G_(0, 5, 0), shadowR: 20,
    stage(t, out) { goat(out, t, { face: "proud" }); A.ppl(out, 1, TOWN(1), -3.0, 1.6, { expr: "shock", arms: { l: ["up", 1], r: ["point", 1] } });
      bd(out, "b13", "13 m", "TALL", "#c8202e", -1.2, 12.2, 1.2, (t - T("meters") + 0.1) * 2.5, 3.4); } });
  // 5 A Swedish town…: the snowy square, the Swedish flag waving, townsfolk
  shot({ at: S("A Swedish"), ...gold, cam: push(G_(-7, 3.0, 26), G_(1, 4.5, -4), G_(-6, 3.0, 24), G_(1, 4.6, -4), 54, 1.3), cInf: 0.6, focus: G_(0, 4, 0), shadowR: 30,
    stage(t, out) { goat(out, t, { face: "happy" }); const k = Math.floor(t * 10) % 20; A.fx(out, "swe" + k, (p) => drawSwe(p.g, k), -6.8, 3.2, 8, 3.0, 4.5, { cw: 512, ch: 768, kind: "lit" });
      crowd(out, t, 1, [[-3, 12], [-1.5, 13], [1.5, 12.5], [3, 13.5]], (i) => ["smile", "grin", "laugh", "smile"][i], (i) => ({ l: ["out", 1], r: [i % 2 ? "up" : "out", 1] })); } });
  // 6 …builds it every Christmas.: workers on ladders stuffing straw, the tree lit
  shot({ at: S("builds it every"), ...gold, cam: push(G_(4, 2.2, 13), G_(0.5, 3.6, 0), G_(3.4, 2.3, 12), G_(0.5, 3.7, 0), 54, 1.6), cInf: 1.1, focus: G_(0, 3, 0), shadowR: 20,
    stage(t, out) { goat(out, t, { face: "proud", holes: 0.4 });
      [[-2.6, 1.2], [1.0, 1.4], [3.6, 1.2]].forEach(([x, z], i) => A.ppl(out, 1 + i, WORK(i), x, z, { expr: i === 1 ? "grin" : "proud", arms: { l: ["up", 1], r: [i === 1 ? "hammer" in XL ? "up" : "up" : "shoulder", 1] }, extra: i === 1 ? XL.hammer : XL.straw, headTilt: Math.sin(t * 8 + i) * 4 }));
      wd(out, "XMAS!", "#2a8a4a", -2.6, 4.6, 2, (t - T("Christmas") + 0.05) * 2.5, 2.2); } });
  // 7 And the very first year…: brand-new goat, happy crowd, a ribbon
  shot({ at: S("And the very"), ...gold, cam: wideCam(23, 2.0, 5.5, -1), cInf: 0.6, focus: G_(0, 5, 0), shadowR: 30,
    stage(t, out) { goat(out, t, { face: "happy", blink: true }); sparkle(out, t, 0, 9, 0.5, 1.0, 4); crowd(out, t, 1, [[-3, 14], [-1.4, 15], [1.4, 14.5], [3, 15.5]], "laugh", () => ({ l: ["up", 1], r: ["up", 1] })); } });
  // 8 …somebody burned it.: WHOOSH, the goat goes up, its face drops
  const tB1 = T("burned", T("somebody"));
  shot({ at: S("somebody"), ...gold, cam: push(G_(1.2, 3, 19), G_(0.6, 6, 0), G_(1.0, 3, 17.5), G_(0.6, 6.2, 0), 52, 1.4), cInf: 0.7, focus: G_(0, 5, 0), shadowR: 30, flash: (t) => Math.max(0, 0.3 - Math.abs(t - tB1) * 3),
    stage(t, out) { const lv = smooth((t - tB1 + 0.15) / 0.5); goat(out, t, { face: lv > 0.1 ? "shock" : "happy" }); fire(out, t, lv); wd(out, "WHOOSH!", "#e8401a", -3, 3, 4, (t - tB1) * 2.5, 3.6); } });
  kick1(tB1);
  // 9 Guards? Burned.: two guards stand proud in front… flames behind them
  const tG = T("Guards"), tB2 = T("Burned", tG);
  shot({ at: S("Guards"), ...gold, cam: push(G_(0.2, 1.7, 8.2), G_(0.2, 2.6, 0), G_(0.2, 1.7, 7.6), G_(0.2, 2.7, 0), 54, 0.8), cInf: 1.2, focus: G_(0, 1.6, 4), shadowR: 15, flash: (t) => Math.max(0, 0.35 - Math.abs(t - tB2) * 2),
    stage(t, out) { const lv = smooth((t - tB2 + 0.1) / 0.3); goat(out, t, { face: lv > 0 ? "shock" : "happy" }); fire(out, t, lv);
      [[-0.8, 3.8], [0.9, 3.8]].forEach(([x, z], i) => A.ppl(out, 1 + i, GUARD(i), x, z, { expr: lv > 0.1 ? "shock" : "proud", arms: lv > 0.1 ? { l: ["head", 1], r: ["head", 1] } : { l: ["hips", 1], r: ["hips", 1] } })); } });
  kick1(tB2);
  // 10 Fences? Burned.: a shiny fence in front of the goat… flames
  const tF = T("Fences"), tB3 = T("Burned", tF);
  shot({ at: S("Fences"), ...gold, cam: push(G_(-1.4, 2.0, 13), G_(-0.4, 3.6, 0), G_(-1.3, 2.0, 12), G_(-0.4, 3.7, 0), 54, 1.2), cInf: 0.9, focus: G_(0, 2, 3), shadowR: 15, flash: (t) => Math.max(0, 0.35 - Math.abs(t - tB3) * 2),
    stage(t, out) { const lv = smooth((t - tB3 + 0.1) / 0.3); goat(out, t, { face: lv > 0 ? "shock" : "smug" }); fire(out, t, lv); for (const x of [-6, 0, 6]) fence(out, x, 4, 6, 2.2); wd(out, "BURNED!", "#e8401a", 0, 5.4, 4.5, (t - tB3) * 2.5, 3.0); } });
  kick1(tB3);
  // 11 Soaked in fire retardant?: a firefighter hoses the goat down, the goat grinning
  shot({ at: S("Soaked"), ...gold, cam: push(G_(5, 2.0, 14), G_(0.8, 3.6, 0), G_(4.6, 2.0, 13), G_(0.8, 3.7, 0), 54, 2.2), cInf: 0.9, focus: G_(1, 3, 2), shadowR: 20,
    stage(t, out) { goat(out, t, { face: "proud" }); A.ppl(out, 1, FIRE, 3.4, 5.5, { expr: "proud", arms: { l: ["hold", 1], r: ["point", 1] }, extra: XL.hose, dir: -1 });
      const k = Math.floor(t * 12) % 8; A.fx(out, "spray" + k, (p) => drawSpray(p.g, k), 0.9, 3.4, 5.0, 4.6, 2.3, { cw: 512, ch: 256, kind: "basic", rot: 0, flipX: true });
      wd(out, "FIREPROOF!", "#3a8ad8", -2.4, 6.0, 4, (t - T("retardant") + 0.1) * 2.5, 3.6); } });
  // 12 Burned anyway.: on fire again, the firefighter shrugs
  const tB4 = T("Burned", T("retardant"));
  shot({ at: tB4 - 0.1, ...gold, cam: push(G_(-0.6, 2.0, 16), G_(0.2, 4.8, 0), G_(-0.5, 2.0, 15), G_(0.2, 4.9, 0), 54, 1.4), cInf: 0.8, focus: G_(0, 4, 0), shadowR: 25,
    stage(t, out) { goat(out, t, { face: "sad", burnt: 0.4 }); fire(out, t, 0.85); A.ppl(out, 1, FIRE, -2.6, 7.5, { expr: "annoyed", arms: { l: ["shrug", 1], r: ["shrug", 1] } }); mk(out, "?", -2.6, 3.3, 7.6, (t - tB4 - 0.3) * 2, 0.8); } });
  kick1(tB4);
  // 13 One guy rammed it…: a red 1960s car speeds at the goat's legs
  const tVo = P("Volvo", -1, true);
  shot({ at: S("One guy"), ...gold, cam: push(G_(-9, 1.2, 10), G_(-2.5, 2.0, 0), G_(-8.4, 1.25, 9.4), G_(-2.5, 2.0, 0), 50, 1.6), cInf: 1, focus: G_(-3, 1.5, 1.2), shadowR: 20,
    stage(t, out) { const l = clamp01((t - S("One guy")) / (tVo - S("One guy") + 0.05)), c = clamp01((t - tVo) / 0.2); goat(out, t, { face: c > 0 ? "shock" : "nervous", fold: c * 0.6 });
      const k = Math.floor(t * 14) % 12; A.fx(out, "car" + k + "_" + (c > 0 ? 1 : 0), (p) => drawCar(p.g, { k, crash: c > 0 ? 1 : 0 }), lerp(5.5, -2.0, glide(l)), 0.95, 1.6, 3.6, 1.8, { cw: 1024, ch: 512, kind: "lit", normal: [0, 0, 1] });
      wd(out, "CRASH!", "#e8401a", -3.4, 3.4, 2.4, (t - tVo) * 2.5, 2.8); } });
  kick1(tVo);
  // 14 An American tourist torched it…: a cheerful tourist with a lighter, the goat nervous behind
  shot({ at: S("An American"), ...gold, cam: push(G_(0.6, 1.7, 7.6), G_(0.2, 2.2, 0), G_(0.55, 1.7, 7.0), G_(0.2, 2.3, 0), 50, 1.6), cInf: 1.3, focus: G_(0, 1.6, 4.4), shadowR: 15,
    stage(t, out) { const lv = smooth((t - T("torched") - 0.2) / 0.5); goat(out, t, { face: lv > 0 ? "shock" : "nervous" }); fire(out, t, lv * 0.7);
      A.ppl(out, 1, TOURIST, 0.2, 4.4, { expr: "grin", arms: { l: ["out", 1], r: ["up", 1] }, extra: XL.lighter(Math.floor(t * 12)) });
      wd(out, "OOPS?", "#e8401a", 1.4, 3.0, 4.6, (t - T("torched") - 0.35) * 2.5, 1.4); } });
  // 15 …and told police…: a police officer with a notepad, the tourist talking
  shot({ at: S("and told"), ...nite, cam: push(G_(-0.2, 1.65, 8.4), G_(-0.2, 1.6, 4), G_(-0.2, 1.65, 7.9), G_(-0.2, 1.62, 4), 46, 1.4), cInf: 1.6, focus: G_(0, 1.6, 4), shadowR: 12,
    stage(t, out) { goat(out, t, { face: "sad", burnt: 0.9 }); fire(out, t, 0.25);
      A.ppl(out, 1, POLICE, -0.85, 4.2, { expr: "suspicious", arms: { l: ["hold", 1], r: ["low", 1] }, extra: XL.pad }); A.ppl(out, 2, TOURIST, 0.7, 4.0, { expr: Math.floor(t * 7) % 2 ? "talk_o" : "talk_e", arms: { l: ["shrug", 1], r: ["out", 1] } }); } });
  // 16 …a legal tradition.: close on the tourist's innocent grin, speech bubble
  shot({ at: S("a legal"), ...nite, cam: push(G_(0.7, 1.55, 6.0), G_(0.7, 1.55, 4), G_(0.7, 1.55, 5.7), G_(0.7, 1.56, 4), 44, 1.2), cInf: 2, focus: G_(0.7, 1.6, 4), shadowR: 10,
    stage(t, out) { goat(out, t, { face: "sad", burnt: 0.9 }); A.ppl(out, 2, TOURIST, 0.7, 4.0, { expr: "grin", arms: { l: ["shrug", 1], r: ["shrug", 1] } });
      bub(out, "bubT", "TRADITION!", "#c8202e", 0.25, 2.45, 4.1, (t - T("tradition") + 0.2) * 3, 1.3); } });
  // 17 It was not.: the officer shakes his head: NOPE
  shot({ at: S("It was", T("tradition")), ...nite, cam: push(G_(-0.85, 1.6, 6.0), G_(-0.85, 1.6, 4), G_(-0.85, 1.6, 5.7), G_(-0.85, 1.6, 4), 44, 1.0), cInf: 2, focus: G_(-0.85, 1.6, 4), shadowR: 10,
    stage(t, out) { goat(out, t, { face: "sad", burnt: 0.9 }); A.ppl(out, 1, POLICE, -0.85, 4.2, { expr: "stern", arms: { l: ["hips", 1], r: ["point", 1] }, headTilt: Math.sin(t * 16) * 8 });
      wd(out, "NOPE.", "#2a2a36", -0.4, 2.3, 4.4, (t - T("not", T("tradition")) + 0.05) * 2.5, 0.9); } });
  // 18 He got eighteen days in jail.: the tourist behind bars, 18 DAYS board
  shot({ at: S("He got"), ...nite, cam: push(G_(0.0, 1.6, 7.6), G_(0, 1.7, 4), G_(0.0, 1.6, 7.1), G_(0, 1.72, 4), 46, 1.6), cInf: 2, focus: G_(0, 1.6, 4), shadowR: 10,
    stage(t, out) { A.ppl(out, 2, TOURIST, 0, 4.0, { expr: "sad", arms: { l: ["low", 1], r: ["low", 1] } }); A.fx(out, "bars", (p) => drawBars(p.g), 0, 1.25, 4.6, 1.7, 2.55, { cw: 512, ch: 768, kind: "lit", normal: [0, 0, 1] });
      bd(out, "b18", "18", "DAYS", "#2a2a36", 0, 2.95, 4.7, (t - T("eighteen") + 0.1) * 2.5, 1.2); } });
  // 19 Two guys came dressed as Santa…: Santa sneaking up in the snow at night
  shot({ at: S("Two guys"), ...nite, cam: push(G_(-3.6, 1.6, 8.8), G_(-2.4, 1.8, 4), G_(-3.4, 1.6, 8.2), G_(-2.4, 1.85, 4), 48, 1.8), cInf: 1.6, focus: G_(-2.4, 1.6, 4.5), shadowR: 12,
    stage(t, out) { goat(out, t, { face: "sleep" }); const l = t - S("Two guys"); A.ppl(out, 1, SANTA, -3.2 + l * 0.35, 4.6, { expr: "sly", arms: { l: ["chop", 1], r: ["point", 1] }, extra: XL.beard, dir: 1 });
      wd(out, "SANTA?!", "#c8202e", -1.6, 2.8, 4.4, (t - T("Santa") + 0.05) * 2.5, 1.5); } });
  // 20 …and a gingerbread man.: a giant gingerbread man pops in beside him
  shot({ at: S("and a gingerbread"), ...nite, cam: push(G_(-1.8, 1.6, 9.0), G_(-1.6, 1.8, 4), G_(-1.75, 1.6, 8.4), G_(-1.6, 1.85, 4), 50, 1.4), cInf: 1.6, focus: G_(-1.6, 1.6, 4.5), shadowR: 12,
    stage(t, out) { goat(out, t, { face: "sleep" }); A.ppl(out, 1, SANTA, -2.4, 4.6, { expr: "sly", arms: { l: ["hips", 1], r: ["point", 1] }, extra: XL.beard });
      const u = glide((t - T("gingerbread") + 0.2) / 0.3), k = Math.floor(t * 8) % 16; A.fx(out, "gin" + k, (p) => drawGinger(p.g, { k, face: "sly" }), -0.7, 0.1 + 1.0 * u, 4.5, 1.35, 2.0 * u + 0.01, { cw: 512, ch: 768, kind: "lit" });
      wd(out, "COOKIE?!", "#b8723a", -0.5, 2.6, 4.7, (t - T("man", T("gingerbread")) + 0.05) * 2.5, 1.4); } });
  // 21 And shot it…: Santa draws a bow with a burning arrow
  shot({ at: S("And shot"), ...nite, cam: push(G_(-1.6, 1.7, 6.6), G_(-2.6, 1.9, 4.4), G_(-1.75, 1.7, 6.2), G_(-2.6, 1.9, 4.4), 46, 1.0), cInf: 1.8, focus: G_(-2.6, 1.8, 4.6), shadowR: 10,
    stage(t, out) { const d = smooth((t - S("And shot")) / 0.8), k = Math.floor(t * 12) % 12; A.ppl(out, 1, SANTA, -2.6, 4.6, { expr: "angry", arms: { l: ["point", 1], r: ["shoulder", 1] }, extra: XL.beard }); A.fx(out, "bow" + Math.round(d * 6) + "_" + k, (p) => drawBow(p.g, { draw: Math.round(d * 6) / 6, arrow: true, k }), -2.2, 1.45, 4.95, 0.75, 0.75, { cw: 512, ch: 512, kind: "lit" });
      A.fx(out, "gin" + 0, (p) => drawGinger(p.g, { k: 0, face: "sly" }), -1.3, 1.1, 4.2, 1.35, 2.0, { cw: 512, ch: 768, kind: "lit" }); } });
  // 22 …with a flaming arrow.: the flaming arrow streaks into the goat, the goat wakes up on fire
  const tAr = T("arrow");
  shot({ at: S("with a flaming"), ...nite, cam: push(G_(-3.5, 2.5, 18), G_(0, 5.5, 0), G_(-3.2, 2.6, 17), G_(0, 5.6, 0), 54, 1.0), cInf: 0.7, focus: G_(0, 5, 0), shadowR: 25, flash: (t) => Math.max(0, 0.25 - Math.abs(t - tAr - 0.15) * 4),
    stage(t, out) { const u = clamp01((t - S("with a flaming")) / (tAr + 0.15 - S("with a flaming"))), lv = smooth((t - tAr - 0.15) / 0.4), k = Math.floor(t * 12) % 12;
      goat(out, t, { face: lv > 0 ? "shock" : "sleep" }); fire(out, t, lv); if (u < 1) A.fx(out, "arrow" + k, (p) => drawArrow(p.g, k), lerp(-7, -1, u), lerp(1.6, 5, u), 2, 2.2, 0.55, { cw: 512, ch: 128, kind: "basic", rot: 0.5 });
      wd(out, "BULLSEYE!", "#e8401a", 3, 9.5, 1, (t - tAr - 0.2) * 2.5, 4.0); } });
  kick1(tAr + 0.15);
  // 23 Someone offered a guard money…: a shady man in a fedora flashes cash at a guard
  shot({ at: S("Someone"), ...nite, cam: push(G_(0.05, 1.6, 9.4), G_(0.05, 1.6, 4), G_(0.05, 1.6, 8.8), G_(0.05, 1.62, 4), 48, 1.8), cInf: 1.8, focus: G_(0, 1.6, 4), shadowR: 10,
    stage(t, out) { goat(out, t, { face: "nervous" }); A.ppl(out, 1, SHADY, -0.6, 4.0, { expr: "sly", arms: { l: ["low", 1], r: ["out", 1] }, extra: XL.cash }); A.ppl(out, 2, GUARD(0), 0.65, 4.2, { expr: t > T("money") ? "shock" : "suspicious", arms: { l: ["hips", 1], r: ["face", 1] } });
      if (t > T("money")) for (let i = 0; i < 3; i++) mk(out, "$", 0.2 + i * 0.35, 2.4 + Math.sin(t * 6 + i) * 0.1, 4.4, (t - T("money") - i * 0.12) * 3, 0.45, "#7ad04a"); } });
  // 24 …to steal the goat by helicopter.: a helicopter lifts the goat into the sky, the goat dangling, terrified
  const tHe = T("helicopter");
  shot({ at: S("to steal"), ...nite, cam: push(G_(0.5, 4, 24), G_(0.5, 11, 0), G_(0.5, 4.4, 22.5), G_(0.5, 12, 0), 58, 2.0), cInf: 0.5, focus: G_(0, 9, 0), shadowR: 30,
    stage(t, out) { const l = Math.max(0, t - S("to steal")), up = l * 2.2; goat(out, t, { face: "shock", y: up, rot: Math.sin(t * 3) * 0.05 }); const k = Math.floor(t * 14) % 8;
      A.fx(out, "heli" + k, (p) => drawHeli(p.g, k), 0.6, 15.6 + up, 0.5, 10, 5, { cw: 1024, ch: 512, kind: "lit", normal: [0, 0, 1] });
      A.fx(out, "rope", (p) => { p.g.clearRect(0, 0, 64, 512); line(p.g, [[32, 0], [32, 512]], "#8a6a48", 14); }, 0.9, 13.4 + up, 0.4, 0.25, 3.5, { cw: 64, ch: 512, kind: "lit", normal: [0, 0, 1] });
      wd(out, "HEIST!", "#e8b84a", -3.5, 5 + up * 0.5, 2, (t - tHe) * 2.5, 4.0); } });
  // 25 One year it burned…: grand opening, the mayor cuts the ribbon, crowd cheers
  const tOp = T("opened"), tB5 = T("burned", S("One year"));
  shot({ at: S("One year"), ...gold, cam: push(G_(0.3, 1.9, 9.6), G_(0.3, 2.6, 0), G_(0.3, 1.9, 9.0), G_(0.3, 2.7, 0), 52, 1.2), cInf: 1.2, focus: G_(0, 1.8, 5), shadowR: 15,
    stage(t, out) { goat(out, t, { face: "proud", blink: true }); const cut = t > tB5 - 0.3; A.fx(out, "rib" + (cut ? 1 : 0), (p) => drawRibbon(p.g, cut), 0, 1.15, 5.4, 4.2, 0.52, { cw: 1024, ch: 128, kind: "lit", normal: [0, 0, 1] });
      A.ppl(out, 1, TOWN(3), 0.3, 5.0, { expr: "grin", arms: { l: ["out", 1], r: ["hold", 1] }, extra: XL.scissors(t * 12) }); crowd(out, t, 2, [[-1.8, 5.8], [2.2, 5.9]], "laugh", () => ({ l: ["up", 1], r: ["up", 1] }));
      sparkle(out, t, 0, 3, 5.5, 0.5, 4); } });
  // 26 …hours after it opened.: the clock spins a few hours… the goat in flames
  shot({ at: S("hours"), ...nite, cam: push(G_(1, 2.5, 19), G_(0.4, 5.5, 0), G_(0.9, 2.6, 17.5), G_(0.4, 5.6, 0), 54, 1.6), cInf: 0.7, focus: G_(0, 5, 0), shadowR: 25,
    stage(t, out) { const l = t - S("hours"); goat(out, t, { face: l > 0.6 ? "shock" : "proud" }); fire(out, t, smooth((l - 0.6) / 0.4));
      A.fx(out, "clk" + Math.floor(l * 8), (p) => drawClock(p.g, l * 2.4), -3.6, 9.6, 2, 3.2, 3.2, { cw: 384, ch: 384, kind: "basic" }); wd(out, "SAME DAY!", "#e8401a", 3.3, 10.5, 2, (t - tOp) * 2.5, 3.8); } });
  kick1(tOp - 0.4);
  // 27 So now it has cameras…: security cameras swivel on poles
  shot({ at: S("So now"), ...gold, cam: push(G_(4, 3.4, 9), G_(2, 3.8, 3), G_(3.7, 3.4, 8.4), G_(2, 3.85, 3), 50, 1.8), cInf: 1.4, focus: G_(2.5, 3.6, 3), shadowR: 15,
    stage(t, out) { goat(out, t, { face: "nervous" }); [[1.2, 4.0, 3], [3.6, 3.4, 3.4]].forEach(([x, y, z], i) => A.fx(out, "cam" + i + Math.floor(t * 6) % 10, (p) => drawCam(p.g, Math.sin(Math.floor(t * 6) * 0.6 + i) * 0.35), x, y, z, 1.4, 1.4, { cw: 256, ch: 256, kind: "lit", normal: [0, 0, 1] }));
      mk(out, "!", 2.4, 5.0, 3.3, (t - T("cameras") - 0.2) * 3, 0.8, "#ff3a3a"); } });
  // 28 …double fences…: two rows of fences around the goat
  shot({ at: S("double"), ...gold, cam: push(G_(-2, 2.6, 17), G_(0, 3.6, 0), G_(-1.8, 2.6, 16), G_(0, 3.7, 0), 54, 1.0), cInf: 0.9, focus: G_(0, 3, 3), shadowR: 25,
    stage(t, out) { goat(out, t, { face: "smug" }); const u = smooth((t - T("double")) / 0.25), v = smooth((t - T("double") - 0.35) / 0.25);
      for (const x of [-6, 0, 6]) { if (u > 0) fence(out, x, 3.5, 6, 2.2 * u + 0.01); if (v > 0) fence(out, x, 6, 6, 2.4 * v + 0.01, "#b8c0cc"); } bd(out, "bx2", "x2", "FENCES", "#3a6ad8", 4.6, 6.4, 6.2, (t - T("fences", T("double")) ) * 2.5, 2.4); } });
  // 29 …and a live webcam.: a laptop streaming the goat LIVE
  shot({ at: S("and a live"), ...gold, cam: push(G_(0, 1.4, 7.5), G_(0, 1.3, 5), G_(0, 1.4, 7.1), G_(0, 1.31, 5), 44, 1.6), cInf: 1.8, focus: G_(0, 1.3, 5), shadowR: 10,
    stage(t, out) { goat(out, t, { face: "nervous" }); const k = Math.floor(t * 8) % 40; A.fx(out, "lap" + k, (p) => drawLaptop(p.g, k), 0, 1.3, 5.2, 1.6, 1.2, { cw: 768, ch: 576, kind: "basic" }); } });
  // 30 Wait, it gets worse.: dramatic push into the goat's nervous eye
  shot({ at: S("Wait"), ...nite, cam: (l) => ({ pos: G_(4.1, 8.5, 8 - glide(l / 0.9) * 4.2), look: G_(4.1, 8.5, 0), fov: 46, roll: 0.03 * Math.sin(l * 4) }), cInf: 2, focus: G_(4.1, 8.5, 0), shadowR: 12,
    stage(t, out) { goat(out, t, { face: "nervous" }); } });
  // 31 One year… nobody burned it.: the goat alone at night, untouched, smug; crickets
  const tNb = T("nobody");
  shot({ at: S("One year", T("Wait")), ...nite, cam: push(G_(-1, 1.6, 21), G_(0.3, 5.6, 0), G_(-0.9, 1.7, 19.5), G_(0.3, 5.7, 0), 54, 1.8), cInf: 0.6, focus: G_(0, 5, 0), shadowR: 25,
    stage(t, out) { goat(out, t, { face: "smug", blink: true }); sparkle(out, t, 0.5, 9.5, 0.5, 1.0, 3); wd(out, "PHEW!", "#3a8ad8", -3.2, 9.5, 1, (t - tNb - 0.4) * 2.5, 3.6); } });
  // 32 …birds ate it.: a swarm of jackdaws swoops in
  shot({ at: S("birds"), ...nite, cam: push(G_(2, 6.5, 12), G_(1.6, 7.2, 0), G_(1.9, 6.5, 11), G_(1.6, 7.3, 0), 52, 1.0), cInf: 1, focus: G_(2, 7, 0), shadowR: 20,
    stage(t, out) { goat(out, t, { face: "shock" }); const l = t - S("birds"); for (let i = 0; i < 9; i++) { const u = clamp01(l * 1.4 - i * 0.05); daw(out, t, i, lerp(-6 - i, -3 + (i % 3) * 2.5, u), lerp(11, 4.5 + (i % 4) * 1.2, u) + Math.sin(t * 6 + i) * 0.2, 1.2 + (i % 3) * 0.3, { fly: true, w: 1.2 }); } } });
  // 33 A gang of jackdaws pecked it…: jackdaws with tiny shades pecking the straw
  shot({ at: S("A gang"), ...nite, cam: push(G_(-0.4, 5.6, 6.5), G_(-0.4, 5.3, 0), G_(-0.4, 5.6, 6.0), G_(-0.4, 5.32, 0), 50, 1.6), cInf: 1.6, focus: G_(-0.4, 5.3, 0.4), shadowR: 12,
    stage(t, out) { goat(out, t, { face: "sad", holes: clamp01((t - T("pecked")) / 1.2) * 0.6 + 0.2 });
      [[-2.4, 6.6], [-1.2, 4.6], [0.4, 6.4], [1.4, 4.8], [-0.4, 5.6]].forEach(([x, y], i) => daw(out, t, i, x, y, 0.5, { peck: true, shades: i % 2 === 0, straw: i === 3, w: 0.9 }));
      wd(out, "PECK PECK", "#2a2a36", -0.4, 7.6, 0.8, (t - T("pecked")) * 2.5, 2.2); } });
  // 34 …down to the bones.: only the wooden frame is left, embarrassed
  shot({ at: S("down to"), ...nite, cam: push(G_(0.6, 2.0, 21), G_(0.4, 5.6, 0), G_(0.6, 2.0, 19.8), G_(0.4, 5.7, 0), 54, 1.0), cInf: 0.6, focus: G_(0, 5, 0), shadowR: 25,
    stage(t, out) { goat(out, t, { bones: true, face: "sad" }); for (let i = 0; i < 4; i++) daw(out, t, i, -3 + i * 2, 9.5 + (i % 2), 0.6, { shades: true, straw: true, w: 1.2 }); } });
  // 35 Then a storm knocked it over.: storm cloud blows, the goat topples
  const tKo = T("knocked");
  shot({ at: S("Then a storm"), ...nite, cam: push(G_(-1, 2.2, 23), G_(0.5, 5.6, 0), G_(-0.9, 2.3, 21.5), G_(0.5, 5.7, 0), 54, 1.8), cInf: 0.6, focus: G_(0, 5, 0), shadowR: 25,
    stage(t, out) { const u = glide((t - tKo) / 0.6), k = Math.floor(t * 10) % 24; goat(out, t, { face: u > 0 ? "shock" : "nervous", rot: -u * 1.45, x: u * 4.0, y: -u * 2.9 });
      A.fx(out, "storm" + k, (p) => drawStorm(p.g, k), -4, 12, 1, 8, 4, { cw: 1024, ch: 512, kind: "basic" }); wd(out, "TIMBER!", "#3a8ad8", 3.5, 4.5, 3, (t - tKo - 0.4) * 2.5, 3.2); } });
  kick1(tKo + 0.5);
  // 36 And the town still builds it.: workers raise a fresh goat, thumbs up
  shot({ at: S("And the town"), ...gold, cam: push(G_(-3, 2.0, 15), G_(0, 4, 0), G_(-2.7, 2.0, 14), G_(0, 4.1, 0), 54, 1.6), cInf: 0.9, focus: G_(0, 3, 3), shadowR: 20,
    stage(t, out) { const u = glide((t - S("And the town")) / 1.2); goat(out, t, { face: "proud", holes: (1 - u) * 0.5 });
      [[-2.6, 3.5], [0, 4.0], [2.6, 3.4]].forEach(([x, z], i) => A.ppl(out, 1 + i, WORK(i), x, z, { expr: "proud", arms: { l: ["up", 1], r: ["hips", 1] }, extra: i === 1 ? XL.hammer : XL.straw, headTilt: Math.sin(t * 8 + i) * 4 })); } });
  // 37 Every year.: shiny new goat, crowd cheering, confetti-like sparkles
  shot({ at: S("Every", T("still")), ...gold, cam: push(G_(1.4, 2.2, 19), G_(0.4, 5.4, 0), G_(1.3, 2.2, 18), G_(0.4, 5.5, 0), 54, 1.2), cInf: 0.7, focus: G_(0, 5, 0), shadowR: 25,
    stage(t, out) { goat(out, t, { face: "proud", blink: true }); sparkle(out, t, 0, 8, 0.5, 1.6, 5); crowd(out, t, 1, [[-3, 10], [-1.4, 11], [1.4, 10.5], [3, 11.5]], "laugh", () => ({ l: ["up", 1], r: ["up", 1] })); } });
  // 38 Because somehow…: loop: shot 1's view, a flame starts at the hoof and climbs back to shot 1
  const tL = S("Because");
  shot({ at: tL, ...gold, cam: heroCam, cInf: 0.6, focus: G_(0, 5, 0), shadowR: 30, loop: true, stage(t, out) { const k = clamp01((t - tL) / Math.max(0.3, END - tL - 0.05)); heroStage(t, out, lerp(0.2, 0.75, k)); } });
  function wideCam(d, y, ly, x) { return push(G_(x, y, d), G_(0.3, ly, 0), G_(x * 0.9, y, d - 1.5), G_(0.3, ly + 0.1, 0), 54, 1.6); }
  SHOTS = D.map((s, i) => ({ ...s, a: s.a ?? s.at, b: i + 1 < D.length ? (D[i + 1].a ?? D[i + 1].at) : END + 0.01 }));
  SHOTS.forEach((s, i) => { const base = s.cam, ph = (s.loop ? 0 : (s.at ?? s.a ?? 0)) * 1.7, w = 0.006, dur = s.b - s.a; s.cam = (l0, ...r) => { const l = s.loop ? Math.max(0, dur - l0 - 1 / FPS) : l0, c = base(l, ...r);
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
