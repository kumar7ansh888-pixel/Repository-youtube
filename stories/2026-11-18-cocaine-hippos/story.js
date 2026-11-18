// Shot plan for "A Drug Lord's Hippos Won't Stop Multiplying" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts: Escobar kept 4 hippos (1 male, 3 females) at Hacienda Napoles; after his death (1993) the other animals were moved but the hippos
// were too hard to move and were left; they spread into the rivers of the Magdalena basin; ~200 today (NPR 2026); birth control and
// castration attempts (2011-2019) barely slowed them; male hippo testes can retract (inguinal canal); one 2013 team tracked a male for
// three months, used an elephant tranquilliser, and had trouble locating the parts; one vet can do about one castration a year (Daily
// Maverick); Anant Ambani's Vantara (India) offered to take up to 80, flown out by plane (NPR 2026, under review).
// Hook-first (a hippo surfacing with a yawn on frame 0), a cut every ~1.6 s, loop ending (the last shot = shot 1's view).
import { HIPPO } from "./world.js";
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

// ---------------- the hippo (side view, facing right; o.flip faces left) ----------------
// (cx, cy) = body centre, s = scale (1: body 660 px long). o: face (happy, grumpy, sleep, shock, wink, sad, smug), mouth 0..1, k (anim), walk,
// spin (tail spray 0..1), glasses, ear (wiggle), col
function drawHippo(g, cx, cy, s, o = {}) {
  const k = o.k ?? 0, col = o.col ?? "#9c8aac", dark = "#7c6a8e", belly = "#c8a0c0", pink = "#f0a0b0", face = o.face ?? "happy";
  g.save(); g.translate(cx, cy); if (o.flip) g.scale(-1, 1); g.scale(s, s); g.lineJoin = "round"; g.lineCap = "round";
  const br = Math.sin(k * 0.5) * 4, w = o.walk ?? 0;
  // tail + spray
  if (o.spin) { const n = 22; for (let i = 0; i < n; i++) { const ph = (k * 0.09 + i / n) % 1, a = Math.PI + (hh(i, 3) - 0.5) * 1.6, d = 40 + ph * 520 * o.spin; const x = -330 + Math.cos(a) * d, y = -40 + Math.sin(a) * d * 0.7 + ph * ph * 160; g.globalAlpha = 1 - ph * 0.6; E(g, x, y, 12 + hh(i, 4) * 12, 10 + hh(i, 5) * 10, 0, ["#6a4a2a", "#7a5a32", "#5a3e22"][i % 3], 3); } g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) { const a = k * 1.9 + (i * two) / 4; line(g, [[-325, -40], [-325 + Math.cos(a) * 70, -40 + Math.sin(a) * 70]], i ? "rgba(36,23,38,0.35)" : INK, i ? 10 : 14); }
    g.beginPath(); g.arc(-325, -40, 80, 0, two); g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 6; g.setLineDash([22, 18]); g.stroke(); g.setLineDash([]); }
  else { const a = Math.PI + 0.5 + Math.sin(k * 0.8) * 0.3; line(g, [[-320, -50], [-320 + Math.cos(a) * 70, -50 + Math.sin(a) * 70]], INK, 16); line(g, [[-320, -50], [-320 + Math.cos(a) * 70, -50 + Math.sin(a) * 70]], dark, 8); }
  // legs (back pair darker)
  const leg = (x, ph, c) => { const dx = Math.sin(k * 0.6 * w + ph) * 26 * w, dy = Math.max(0, Math.cos(k * 0.6 * w + ph)) * -16 * w; R(g, x - 52 + dx, 90 + dy, 104, 175, 40, c, 9); for (let i = 0; i < 3; i++) E(g, x - 30 + i * 30 + dx, 258 + dy, 13, 8, 0, "#e8dcd0", 3); };
  leg(-170, 0, dark); leg(150, Math.PI, dark); leg(-230, Math.PI, col); leg(90, 0, col);
  // body
  E(g, 0, 0 + br, 335, 195, 0, col, 11);
  E(g, 10, 105 + br, 250, 62, 0, belly, 0);
  g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.ellipse(-60, -120 + br, 170, 42, -0.08, 0, two); g.fill();
  for (const [x, y, r] of [[-180, -60, 16], [-120, 20, 11], [40, -100, 13], [-240, 30, 9]]) E(g, x, y + br, r, r * 0.7, 0, "rgba(124,106,142,0.6)", 0);
  // head: skull + muzzle with a hinged lower jaw
  const m = clamp01(o.mouth ?? 0), hx = 300, hy = -55;
  E(g, hx, hy - 10, 150, 128, 0, col, 11);
  // ears
  const ew = o.ear ? Math.sin(k * 2.2) * 0.4 : 0;
  for (const [ex, er] of [[230, -0.5], [285, -0.2]]) { g.save(); g.translate(ex, -170); g.rotate(er + ew); E(g, 0, -18, 20, 30, 0, col, 8); E(g, 0, -16, 10, 18, 0, pink, 0); g.restore(); }
  if (m > 0.02) { // mouth interior (open)
    const a = m * 0.95; const lx = 350 + Math.cos(a) * 220, ly = 10 + Math.sin(a) * 220;
    poly(g, [[350, 10], [570, -10], [lx, ly]], "#c8406a", 9); E(g, 470 + m * 10, 20 + m * 70, 60 * m + 10, 26 * m + 6, a * 0.5, "#ff8aa8", 0);
    g.save(); g.translate(350, 10); g.rotate(a); R(g, -30, 0, 250, 92, [8, 8, 60, 60], col, 11); for (const tx of [150, 205]) poly(g, [[tx - 14, 2], [tx + 14, 2], [tx, -50]], "#fffbe8", 6); g.restore();
    for (const tx of [470, 525]) poly(g, [[tx - 14, -10], [tx + 14, -12], [tx + 2, 45]], "#fffbe8", 6);
  } else { R(g, 320, -10, 240, 100, [8, 8, 60, 60], col, 11); }
  // upper muzzle
  R(g, 300, -150, 290, 160, 80, col, 11);
  E(g, 450, -40, 150, 70, 0, "rgba(255,255,255,0.12)", 0);
  for (const nx of [520, 560]) E(g, nx, -128, 14, 9, -0.3, "#4a3a5a", 0);
  if (m <= 0.02) { // smile line
    if (face === "grumpy" || face === "sad") line(g, [[370, 50], [430, 36], [560, 52]], INK, 8); else if (face === "shock") E(g, 520, 40, 26, 22, 0, "#5a1a2a", 6); else line(g, [[370, 30], [460, 62], [570, 30]], INK, 8);
  }
  if (face === "happy" || face === "smug" || face === "wink") E(g, 360, -10, 34, 18, 0, "rgba(255,110,140,0.55)", 0);
  // eyes on top of the head
  const ey = -175;
  for (const [ex, back] of [[255, true], [320, false]]) {
    if (back) { E(g, ex, ey + 6, 30, 30, 0, col, 8); continue; }
    if (face === "sleep") { E(g, ex, ey, 40, 38, 0, col, 9); line(g, [[ex - 26, ey + 4], [ex, ey + 16], [ex + 26, ey + 4]], INK, 8); continue; }
    if (face === "wink") { E(g, ex, ey, 40, 38, 0, col, 9); line(g, [[ex - 24, ey + 6], [ex, ey - 8], [ex + 24, ey + 6]], INK, 8); continue; }
    const big = face === "shock" ? 1.35 : 1; E(g, ex, ey, 40 * big, 40 * big, 0, "#ffffff", 9);
    const lk = (o.look ?? 0.4) * 10, py = face === "sad" ? 8 : 4; E(g, ex + 6 + lk, ey + py, (face === "shock" ? 9 : 16), (face === "shock" ? 9 : 18), 0, INK, 0); if (face !== "shock") E(g, ex + 12 + lk, ey - 4, 5, 5, 0, "#ffffff", 0);
    if (face === "grumpy") { g.save(); g.beginPath(); g.ellipse(ex, ey, 36, 36, 0, 0, two); g.clip(); g.fillStyle = col; g.beginPath(); g.moveTo(ex - 46, ey - 46); g.lineTo(ex - 46, ey - 30); g.lineTo(ex + 46, ey - 2); g.lineTo(ex + 46, ey - 46); g.closePath(); g.fill(); g.restore(); line(g, [[ex - 40, ey - 30], [ex + 40, ey - 4]], INK, 10); }
    if (face === "smug") { g.save(); g.beginPath(); g.ellipse(ex, ey, 36, 36, 0, 0, two); g.clip(); g.fillStyle = col; g.fillRect(ex - 46, ey - 46, 92, 40); g.restore(); line(g, [[ex - 36, ey - 6], [ex + 36, ey - 6]], INK, 8); }
    if (face === "sad") line(g, [[ex - 40, ey - 30], [ex + 34, ey - 50]], INK, 9);
  }
  if (o.glasses) { R(g, 270, ey - 26, 110, 52, 14, "#111118", 6); g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(286, ey - 16, 20, 8); }
  g.restore();
}
// adult hippo card: 1024 x 640, body centre (470, 330), scale 0.82. Wide card for the spray: 1536 x 640, body centre (900, 330)
const hipCard = (o) => (p) => { p.g.clearRect(0, 0, p.g.canvas.width, p.g.canvas.height); const wide = p.g.canvas.width > 1100; drawHippo(p.g, wide ? 900 : 470, 330, 0.82, o); };

// ---------------- other drawings ----------------
const drawGiraffe = (g, k) => { g.clearRect(0, 0, 512, 768); g.lineJoin = "round"; const c = "#f2c25a", sp = "#b8742a", w = Math.sin(k) * 14;
  for (const [x, ph] of [[170, 0], [210, 1], [330, 1], [370, 0]]) R(g, x - 16 + Math.sin(k + ph * 3) * 8 * (ph ? 1 : -1), 520, 32, 220, 12, c, 7);
  E(g, 270, 500, 150, 80, 0, c, 9); g.save(); g.translate(360, 460); g.rotate(-0.35); R(g, -32, -330, 64, 360, 30, c, 9); g.restore();
  E(g, 400 + w * 0.2, 130, 70, 44, 0.3, c, 9); for (const [x, y] of [[380, 82], [410, 78]]) { line(g, [[x, y], [x - 4, y - 40]], INK, 9); E(g, x - 4, y - 44, 10, 10, 0, sp, 5); } E(g, 420, 120, 10, 12, 0, INK, 0);
  for (let i = 0; i < 14; i++) E(g, 170 + hh(i, 1) * 200, 460 + hh(i, 2) * 80, 18, 14, 0.4, sp, 0); for (let i = 0; i < 7; i++) E(g, 330 + i * 9, 420 - i * 46, 12, 10, 0, sp, 0); };
const drawZebra = (g, k) => { g.clearRect(0, 0, 768, 512); g.lineJoin = "round";
  for (const [x, ph] of [[230, 0], [280, 1], [470, 1], [520, 0]]) { R(g, x - 18 + Math.sin(k + ph * 3) * 10 * (ph ? 1 : -1), 300, 36, 190, 12, "#ffffff", 7); g.fillStyle = INK; for (let j = 0; j < 4; j++) g.fillRect(x - 16 + Math.sin(k + ph * 3) * 10 * (ph ? 1 : -1), 320 + j * 40, 32, 14); }
  E(g, 380, 280, 200, 90, 0, "#ffffff", 9); g.save(); g.beginPath(); g.ellipse(380, 280, 196, 86, 0, 0, two); g.clip(); g.fillStyle = INK; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(200 + i * 34, 180); g.lineTo(220 + i * 34, 180); g.lineTo(206 + i * 34, 380); g.lineTo(190 + i * 34, 380); g.fill(); } g.restore();
  g.save(); g.translate(560, 220); g.rotate(-0.6); R(g, -40, -150, 90, 190, 30, "#ffffff", 9); g.restore(); E(g, 650, 110, 70, 44, 0.5, "#ffffff", 9); E(g, 690, 135, 30, 22, 0.5, "#3a3a44", 0); E(g, 640, 96, 9, 10, 0, INK, 0); poly(g, [[600, 70], [612, 30], [626, 72]], "#ffffff", 6); };
// plane with hippos in the windows, 1024 x 512, facing right
const drawPlane = (g, k) => { g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; const wh = "#f4f6f8", bl = "#2a5ab0";
  poly(g, [[120, 230], [60, 90], [140, 90], [260, 230]], bl, 9); poly(g, [[430, 300], [330, 470], [430, 470], [600, 300]], "#d8dce2", 9);
  g.beginPath(); g.moveTo(90, 300); g.bezierCurveTo(110, 200, 250, 200, 360, 200); g.lineTo(820, 200); g.bezierCurveTo(960, 200, 1000, 260, 1000, 290); g.bezierCurveTo(1000, 330, 940, 360, 820, 360); g.lineTo(200, 360); g.bezierCurveTo(130, 360, 90, 330, 90, 300); g.fillStyle = wh; g.fill(); g.strokeStyle = INK; g.lineWidth = 11; g.stroke();
  g.fillStyle = bl; g.fillRect(150, 318, 800, 18); poly(g, [[880, 218], [950, 240], [968, 268], [890, 262]], "#5a7a9a", 6);
  for (let i = 0; i < 6; i++) { const x = 300 + i * 95; R(g, x - 34, 226, 68, 76, 30, "#bfe0f8", 6); g.save(); g.beginPath(); g.roundRect(x - 31, 229, 62, 70, 28); g.clip(); drawHippo(g, x - 70, 300 + Math.sin(k * 0.8 + i) * 4, 0.16, { face: i % 3 === 0 ? "happy" : i % 3 === 1 ? "shock" : "wink", k: k + i }); g.restore(); }
  for (let i = 0; i < 3; i++) line(g, [[60 - i * 30, 260 + i * 30], [-40 - i * 30, 260 + i * 30]], "rgba(255,255,255,0.8)", 8); };
// suitcase with a hippo squeezed into it, 768 x 640
const drawCase = (g, k) => { g.clearRect(0, 0, 768, 640); g.lineJoin = "round"; R(g, 330, 210, 108, 60, 20, null, 16, "#5a3a20");
  drawHippo(g, 360, 330 + Math.sin(k * 0.6) * 6, 0.62, { face: "wink", k });
  R(g, 90, 360, 588, 250, 26, "#b8743a", 11); line(g, [[90, 420], [678, 420]], "#8a5428", 8); for (const x of [200, 568]) R(g, x - 20, 344, 40, 40, 8, "#d8b04a", 6);
  for (let i = 0; i < 5; i++) { const x = 140 + i * 100; R(g, x, 456, 70, 46, 10, ["#ff6a5a", "#4ab0ff", "#ffd23a", "#7ad04a", "#c87ad8"][i], 5); } txt(g, "COLOMBIA → ?", 384, 560, 46, "Bangers", "#fbf3dc", INK, 6, 500); };
const drawBottle = (g) => { g.clearRect(0, 0, 512, 768); g.lineJoin = "round"; R(g, 200, 60, 112, 90, 18, "#c8302e", 9); R(g, 120, 140, 272, 560, 50, "#cfe8f0", 10); R(g, 140, 300, 232, 330, 16, "#fbf3dc", 7);
  txt(g, "ELEPHANT", 256, 350, 54, "Bangers", "#24356e", INK, 0, 210); txt(g, "TRANQUILIZER", 256, 410, 40, "Bangers", "#c8302e", INK, 0, 214);
  E(g, 256, 520, 70, 54, 0, "#a8a8b8", 6); E(g, 214, 470, 34, 44, 0, "#a8a8b8", 6); E(g, 298, 470, 34, 44, 0, "#a8a8b8", 6); line(g, [[256, 560], [250, 610], [270, 612]], "#a8a8b8", 22); E(g, 238, 512, 6, 6, 0, INK, 0); E(g, 274, 512, 6, 6, 0, INK, 0);
  g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(150, 170, 26, 110); };
const drawPills = (g) => { g.clearRect(0, 0, 512, 640); g.lineJoin = "round"; R(g, 150, 40, 212, 90, 16, "#ffffff", 9); R(g, 110, 120, 292, 480, 40, "#ff9a3a", 10); R(g, 130, 230, 252, 250, 14, "#fbf3dc", 7);
  txt(g, "BIRTH", 256, 300, 70, "Bangers", "#24356e", INK, 0, 230); txt(g, "CONTROL", 256, 380, 62, "Bangers", "#c8302e", INK, 0, 230); txt(g, "for HIPPOS", 256, 440, 36, "AlfaSlab", "#2a2a36", INK, 0, 230); };
const drawCalendar = (g, page) => { g.clearRect(0, 0, 512, 576); g.lineJoin = "round"; R(g, 40, 60, 432, 480, 22, "#ffffff", 11); R(g, 40, 60, 432, 120, [22, 22, 0, 0], "#c8302e", 11);
  for (const x of [140, 372]) R(g, x - 14, 30, 28, 70, 10, "#8a8a92", 6); const M = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"]; txt(g, M[page % 6], 256, 122, 84, "Bangers", "#ffffff", INK, 8, 400);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = 90 + c * 66, y = 230 + r * 72; E(g, x, y, 12, 12, 0, "#d8d0c0", 0); if ((r * 6 + c) % 5 === page % 5) { line(g, [[x - 20, y - 20], [x + 20, y + 20]], "#c8302e", 10); line(g, [[x + 20, y - 20], [x - 20, y + 20]], "#c8302e", 10); } } };
const drawIndia = (g) => { g.clearRect(0, 0, 1024, 640); R(g, 20, 20, 984, 600, 40, "#24356e", 14);
  const x = 262, y = 100, w = 500, h = 330; g.fillStyle = "#ff9933"; g.fillRect(x, y, w, h / 3); g.fillStyle = "#ffffff"; g.fillRect(x, y + h / 3, w, h / 3); g.fillStyle = "#138808"; g.fillRect(x, y + (2 * h) / 3, w, h / 3);
  g.strokeStyle = "#000080"; g.lineWidth = 5; g.beginPath(); g.arc(x + w / 2, y + h / 2, 46, 0, two); g.stroke(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two; line(g, [[x + w / 2, y + h / 2], [x + w / 2 + Math.cos(a) * 46, y + h / 2 + Math.sin(a) * 46]], "#000080", 2); }
  g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(x, y, w, h); txt(g, "INDIA?!", 512, 530, 130, "Bangers", "#ffe85a", INK, 14, 900); };
const drawOffer = (g) => { g.clearRect(0, 0, 640, 512); g.lineJoin = "round"; R(g, 40, 40, 560, 420, 20, "#fbf3dc", 11); g.strokeStyle = "#d8a42a"; g.lineWidth = 10; g.strokeRect(70, 70, 500, 360);
  txt(g, "OFFER", 320, 150, 110, "Rye", "#b8861a", INK, 0, 480); txt(g, "WE'LL TAKE", 320, 250, 58, "Bangers", "#24356e", INK, 0, 460); txt(g, "SOME HIPPOS!", 320, 320, 58, "Bangers", "#c8302e", INK, 0, 460); E(g, 470, 390, 40, 40, 0, "#d8302e", 7); line(g, [[450, 392], [466, 408], [494, 374]], "#ffffff", 10); };
const drawTitle = (g, a, b) => { g.clearRect(0, 0, 1024, 384); R(g, 16, 16, 992, 352, 40, "#1a1426", 14); g.strokeStyle = "#ff4ac8"; g.lineWidth = 12; g.beginPath(); g.roundRect(44, 44, 936, 296, 28); g.stroke();
  txt(g, a, 512, 150, 150, "Bangers", "#ffffff", "#ff4ac8", 18, 900); txt(g, b, 512, 280, 120, "Bangers", "#7af0ff", "#1f6aa8", 14, 900); };
const drawSnail = (g, k) => { g.clearRect(0, 0, 512, 320); g.lineJoin = "round"; const x = 60 + (k % 20) * 3; E(g, x + 120, 262, 160, 30, 0, "#c8e0a0", 8); E(g, x + 90, 180, 96, 86, 0, "#d89a5a", 10); g.beginPath(); for (let i = 0; i < 60; i++) { const a = i * 0.25, r = 76 - i * 1.2; g.lineTo(x + 90 + Math.cos(a) * r, 180 + Math.sin(a) * r * 0.9); } g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  line(g, [[x + 240, 240], [x + 260, 160]], INK, 8); line(g, [[x + 255, 240], [x + 300, 170]], INK, 8); E(g, x + 260, 156, 12, 12, 0, "#ffffff", 5); E(g, x + 302, 166, 12, 12, 0, "#ffffff", 5); E(g, x + 262, 158, 5, 5, 0, INK, 0); E(g, x + 304, 168, 5, 5, 0, INK, 0); };
const drawChair = (g) => { g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; R(g, 120, 120, 272, 230, 24, "#f4efe2", 9); R(g, 100, 300, 312, 70, 18, "#e8e0d0", 9); for (const x of [130, 370]) R(g, x - 12, 360, 24, 130, 8, "#8a6a48", 6); E(g, 256, 300, 130, 26, 0, "#d8c070", 8); E(g, 256, 282, 70, 40, 0, "#d8c070", 8); };
const drawUmb = (g) => { g.clearRect(0, 0, 512, 384); g.beginPath(); g.moveTo(40, 300); g.quadraticCurveTo(256, -40, 472, 300); g.closePath(); g.fillStyle = "#3a8ad8"; g.fill(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke(); for (let i = 0; i < 9; i++) E(g, 120 + hh(i, 9) * 280, 150 + hh(i, 8) * 120, 16, 12, 0, "#6a4a2a", 3); line(g, [[256, 300], [256, 380]], INK, 12); };
const drawDart = (g) => { g.clearRect(0, 0, 256, 64); R(g, 20, 22, 170, 20, 8, "#d8dce2", 4); poly(g, [[190, 18], [240, 32], [190, 46]], "#8a8a92", 4); poly(g, [[20, 32], [0, 10], [40, 22]], "#ff8a2a", 3); poly(g, [[20, 32], [0, 54], [40, 42]], "#ff8a2a", 3); };
const drawPuff = (g) => { g.clearRect(0, 0, 256, 256); for (const [x, y, r] of [[90, 150, 50], [150, 120, 60], [170, 170, 44]]) E(g, x, y, r, r, 0, "#ffffff", 6); };

// ---------------- props drawn on people's cards (adult rig: card 600 x 1000 px, ~463 px per metre, body centre x 300) ----------------
const oc = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")); return c; };
const XL = {
  chain: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.chin + 40; g.beginPath(); g.arc(300, y - 30, 70, 0.2 * Math.PI, 0.8 * Math.PI); g.strokeStyle = "#e8c040"; g.lineWidth = 10; g.stroke(); E(g, 300, y + 40, 16, 16, 0, "#ffd23a", 5); },
  binoc: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + 0.04 * H.HH; for (const sx of [-1, 1]) { R(g, 300 + sx * 40 - 30, y - 34, 60, 76, 16, "#2a2a30", 6); E(g, 300 + sx * 40, y + 40, 26, 10, 0, "#6a8ac8", 4); } R(g, 290, y - 20, 20, 40, 4, "#2a2a30", 4); },
  dart: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(-0.25); R(g, -40, -16, 330, 30, 10, "#3a3a44", 6); R(g, -90, -12, 70, 60, 14, "#7a4a2a", 6); R(g, 280, -10, 40, 18, 4, "#ff8a2a", 4); g.restore(); },
  magnify: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; line(g, [[H.r[0], H.r[1]], [H.r[0] + 40, H.r[1] - 110]], INK, 20); line(g, [[H.r[0], H.r[1]], [H.r[0] + 40, H.r[1] - 110]], "#7a4a2a", 11); E(g, H.r[0] + 62, H.r[1] - 178, 70, 70, 0, "rgba(190,230,255,0.55)", 12, "#d8b04a"); },
  torch: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.fillStyle = "rgba(255,240,150,0.55)"; g.beginPath(); g.moveTo(H.r[0] + 40, H.r[1] - 10); g.lineTo(H.r[0] + 300, H.r[1] - 120); g.lineTo(H.r[0] + 300, H.r[1] + 100); g.closePath(); g.fill(); R(g, H.r[0] - 40, H.r[1] - 22, 90, 40, 10, "#3a5ad8", 6); },
  scissors: (ph) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, a = 0.35 + 0.25 * Math.sin(ph); g.save(); g.translate(H.r[0], H.r[1] - 40); for (const s of [-1, 1]) { g.save(); g.rotate(s * a - Math.PI / 2); poly(g, [[0, -14], [230, -4], [230, 4], [0, 14]], "#d8dce2", 6); E(g, -50, 0, 38, 26, 0, null, 14, "#d8302e"); g.restore(); } E(g, 0, 0, 10, 10, 0, "#8a8a92", 4); g.restore(); },
  pills: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(oc(512, 640, drawPills), H.r[0] - 90, H.r[1] - 230, 180, 225); },
  clip: (p) => { const H = p.hands; if (!H || !H.l) return; const g = p.g; R(g, H.l[0] - 60, H.l[1] - 120, 120, 160, 10, "#c89a5a", 6); R(g, H.l[0] - 46, H.l[1] - 100, 92, 126, 4, "#ffffff", 3); for (let i = 0; i < 4; i++) line(g, [[H.l[0] - 34, H.l[1] - 76 + i * 26], [H.l[0] + 34, H.l[1] - 76 + i * 26]], "#8a8a92", 5); },
};
const BOSS = { jacket: "#f4efe2", pants: "#3a3a44", boots: INK, hat: "hair", hair: "#1a1410", moustache: "#1a1410", skin: "#d9a77c", build: "stout" };
const CREW = (v) => ({ jacket: ["#c8742a", "#3a6a9a", "#5a7a3a"][v % 3], pants: "#2e3442", boots: INK, hat: v % 2 ? "cap" : "hair", cap: "#e8c23a", hair: ["#2a201a", "#4a3020"][v % 2], skin: ["#d9a77c", "#c99067", "#ecd0b6"][v % 3], ...(v % 3 === 1 ? { moustache: "#2a201a" } : {}) });
const SCI = (v) => ({ jacket: "#f4f6f8", pants: ["#3a4a6a", "#5a4a3a", "#2e3a4a"][v % 3], boots: "#4a3426", hat: v === 1 ? "cap" : "hair", cap: "#2f8a5a", hair: ["#2a201a", "#7a5a3a", "#1a1410"][v % 3], skin: ["#d9a77c", "#f2d2b6", "#c99067"][v % 3], ...(v === 2 ? { moustache: "#1a1410" } : {}) });
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[0];
function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const H_ = (x, y, z) => [HIPPO[0] + x, HIPPO[1] + y, HIPPO[2] + z];
  const day = { light: "day", sunAz: 210, sunEl: 58, fogFar: 3000 };
  const A = {
    fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = H_(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
    ppl: (out, i, o, x, z, opt = {}) => { const [X, , Z] = H_(x, 0, z); out.places.push(pl(i, o, X, 0.1, Z, opt)); },
  };
  const mk = (out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); A.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic" }); };
  const wd = (out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); A.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const tag = (out, key, a, b, col, x, y, z, u, w = 1.1) => { if (u > 0) A.fx(out, key, (p) => DR.nameTag(p, a, b, col), x, y, z, w * u, w * 0.25 * u, { cw: 1024, ch: 256, kind: "basic" }); };
  const bd = (out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; A.fx(out, key, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const sparkle = (out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) A.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  // a hippo card. vis = fraction of the card above the water (land = standing on the ground y 0.10); w = card width (m)
  const hippo = (out, t, x, z, o = {}) => { const w = o.w ?? 4.4, h = w * (o.wide ? 640 / 1536 : 640 / 1024), vis = o.vis ?? 1, y = o.land || vis >= 1 ? 0.04 + h / 2 + (o.lift ?? 0) : 0.08 - h / 2 + h * vis;
    const k = Math.floor(t * 12 + (o.ph ?? 0) * 7) % 48, q = (v, n = 20) => Math.round((v ?? 0) * n);
    const st = { face: o.face, mouth: q(o.mouth, 10) / 10, k, flip: o.flip, spin: q(o.spin, 4) / 4, glasses: o.glasses, walk: o.walk ? 1 : 0, ear: o.ear, look: o.look, col: o.col };
    const key = "hip" + [o.wide ? "W" : "", st.face || "", st.mouth, k, st.flip ? 1 : 0, st.spin, st.glasses ? 1 : 0, st.walk, st.ear ? 1 : 0, q(st.look, 2), st.col || ""].join("_");
    A.fx(out, key, hipCard(st), x, y, z, w, h, { cw: o.wide ? 1536 : 1024, ch: 640, kind: "lit", rot: o.rot ?? 0 }); };
  const baby = (out, t, x, z, o = {}) => hippo(out, t, x, z, { w: 1.5, ...o });
  const splash = (out, t, t0, x, z, w = 1.8) => { const k = Math.floor((t - t0) * 12); if (k >= 0 && k < 10) A.fx(out, "spl" + k, (p) => DR.splash(p, k), x, 0.08 + w * 0.25, z + 0.3, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const pop = (out, t, t0, x, z, o = {}) => { const u = (t - t0) / 0.35; if (u < 0) return; const v = lerp(0.05, o.vis ?? 0.62, glide(u)); baby(out, t, x, z, { face: "happy", ...o, vis: v }); splash(out, t, t0, x, z, 1.2); if (u < 2.5 && o.plus !== false) mk(out, "+1", x + 0.3, 0.85 + Math.min(1, u) * 0.25, z + 0.2, u, 0.45, "#7af07a"); };

  // ---- hero (shot 1 + loop): a big hippo surfacing in the river with a huge yawn, two babies bobbing beside it
  const heroCam = push(H_(0.95, 0.85, -7.9), H_(0.85, 1.0, -13), H_(0.9, 0.88, -8.5), H_(0.85, 1.02, -13), 50, 2.2);
  const heroStage = (t, out, u) => { const v = smooth(u); hippo(out, t, -0.3, -13, { vis: lerp(0.32, 0.6, v), mouth: smooth((u - 0.35) / 0.5), face: "happy", ear: true });
    baby(out, t, 0.3, -10.6, { vis: lerp(0.2, 0.6, smooth((u - 0.15) / 0.5)), flip: false, face: "happy", ph: 2 }); baby(out, t, 1.6, -10.4, { vis: lerp(0.2, 0.62, smooth((u - 0.3) / 0.5)), face: "wink", flip: true, ph: 4 });
    const k = Math.floor(t * 12) % 10; if (u < 0.95) A.fx(out, "spl" + k, (p) => DR.splash(p, k), 0.6, 0.6, -12.4, 2.6, 1.3, { cw: 512, ch: 256, kind: "basic" }); };
  // 1 A drug lord's pet hippos…: a hippo bursting up out of the river on frame 0
  shot({ a: 0, ...day, cam: heroCam, cInf: 1.0, focus: H_(0, 1, -13), shadowR: 10, stage(t, out) { heroStage(t, out, clamp01(0.25 + t * 0.45)); } });
  kick1(0.4);
  // 2 …won't stop multiplying.: babies pop up one after another: +1 +1 +1
  const tMul = T("multiplying");
  shot({ at: S("won't stop"), ...day, cam: push(H_(0.4, 0.85, -7.6), H_(0.3, 0.85, -12.5), H_(0.4, 0.88, -8.1), H_(0.3, 0.88, -12.5), 52, 1.6), cInf: 1.2, focus: H_(0, 0.7, -12), shadowR: 10,
    stage(t, out) { hippo(out, t, 0.2, -13.5, { vis: 0.55, face: "smug" }); pop(out, t, tMul - 0.15, -0.6, -11.3, { flip: true }); pop(out, t, tMul + 0.2, 1.3, -11.1, {}); pop(out, t, tMul + 0.55, 0.3, -10.4, { face: "wink" }); pop(out, t, tMul + 0.85, 1.6, -12.2, { flip: true }); } });
  // 3 He had giraffes, zebras…: the drug lord at his ranch, arms wide, a giraffe and a zebra parade past
  const tGir = T("giraffes"), tZeb = T("zebras");
  shot({ at: S("He had"), ...day, cam: push(H_(0.6, 1.5, 8.6), H_(0.2, 1.75, 2.5), H_(0.5, 1.5, 8.0), H_(0.2, 1.77, 2.5), 52, 1.8), cInf: 1.0, focus: H_(0.3, 1.5, 3.5), shadowR: 10,
    stage(t, out) { A.ppl(out, 1, { ...BOSS, xk: "boss" }, 0.0, 4.4, { expr: "barker_e", arms: { l: ["out", 1], r: ["out", 1] }, extra: XL.chain });
      const kk = Math.floor(t * 8) % 8, l = t - tGir; if (l > -0.3) A.fx(out, "gir" + kk, (p) => drawGiraffe(p.g, kk), 2.1 - l * 0.7, 2.15, 2.0, 2.6, 3.9, { cw: 512, ch: 768, kind: "lit" });
      const l2 = t - tZeb; if (l2 > -0.3) A.fx(out, "zeb" + kk, (p) => drawZebra(p.g, kk), -2.2 + l2 * 0.9, 0.95, 3.0, 2.4, 1.6, { cw: 768, ch: 512, kind: "lit" });
      wd(out, "MY ZOO!", "#c8302e", 0.0, 2.75, 4.2, (t - S("He had") - 0.2) * 2.5, 0.8); } });
  // 4 …and four hippos.: four hippos pop up in the pond in a row, a 4 board
  const tFour = T("four");
  shot({ at: S("and four"), ...day, cam: push(H_(0, 1.3, -4.4), H_(0, 0.8, -13), H_(0, 1.3, -4.9), H_(0, 0.82, -13), 52, 1.4), cInf: 1.0, focus: H_(0, 0.8, -12), shadowR: 10,
    stage(t, out) { [-3.3, -1.1, 1.1, 3.3].forEach((x, i) => { const u = smooth((t - tFour - i * 0.14) / 0.3); if (u > 0) { hippo(out, t, x, -12.5 - (i % 2) * 0.6, { vis: lerp(0.1, 0.5, u), w: 3.2, face: i === 2 ? "wink" : "happy", flip: i < 2, ph: i }); splash(out, t, tFour + i * 0.14, x, -12.5, 1.6); } });
      bd(out, "b4", "4", "HIPPOS", "#7c6a8e", 0, 2.6, -11, (t - tFour - 0.2) * 2.2, 1.6); } });
  // 5 His name? Pablo Escobar.: close on the boss, name tag
  shot({ at: S("His name"), ...day, cam: push(H_(0.3, 1.6, 7.9), H_(0.3, 1.55, 4.2), H_(0.3, 1.6, 7.5), H_(0.3, 1.56, 4.2), 46, 1.6), cInf: 2.0, focus: H_(0.3, 1.7, 4.2), shadowR: 8,
    stage(t, out) { A.ppl(out, 1, { ...BOSS, xk: "boss" }, 0.3, 4.2, { expr: Math.floor(t * 6) % 2 ? "sly" : "smile", arms: { l: ["hips", 1], r: ["hips", 1] }, extra: XL.chain });
      tag(out, "tagPE", "PABLO ESCOBAR", "DRUG LORD", "#2a2a36", 0.3, 2.55, 4.5, smooth((t - T("Pablo") + 0.05) / 0.3), 1.05); } });
  // 6 Then he died.: his empty chair with his hat on the bank, a sad hippo in the river behind
  shot({ at: S("Then he"), ...day, cam: push(H_(-0.2, 1.15, 1.6), H_(0.1, 0.95, -5), H_(-0.15, 1.15, 1.2), H_(0.1, 0.97, -5), 48, 1.2), cInf: 1.2, focus: H_(0.4, 0.8, -4), shadowR: 8,
    stage(t, out) { A.fx(out, "chair", (p) => drawChair(p.g), 0.05, 0.62, -1.6, 1.1, 1.1, { cw: 512, ch: 512, kind: "lit" });
      hippo(out, t, 0.6, -9.5, { vis: 0.5, face: "sad", w: 3.4, flip: true }); wd(out, "GONE.", "#2a2a36", 0.05, 1.75, -1.6, (t - T("died") + 0.05) * 2.5, 0.7); } });
  // 7 The other animals were taken away.: workers lead the giraffe and the zebra out through the gate: BYE!
  shot({ at: S("The other"), ...day, cam: push(H_(16, 1.8, 6), H_(18, 1.8, 16), H_(16.3, 1.8, 6.6), H_(18, 1.8, 16), 54, 1.8), cInf: 0.9, focus: H_(18, 1.6, 14), shadowR: 12,
    stage(t, out) { const l = t - S("The other"), kk = Math.floor(t * 8) % 8; A.fx(out, "gir" + kk, (p) => drawGiraffe(p.g, kk), 17 + l * 0.2, 2.15, 13.0 + l * 1.6, 2.6, 3.9, { cw: 512, ch: 768, kind: "lit" });
      A.fx(out, "zeb" + kk, (p) => drawZebra(p.g, kk), 19.3 + l * 0.2, 0.95, 12.2 + l * 1.6, 2.4, 1.6, { cw: 768, ch: 512, kind: "lit" });
      A.ppl(out, 2, CREW(0), 16.0 + l * 0.2, 12.8 + l * 1.6, { expr: "grin", arms: { l: ["hold", 1], r: ["point", 1] } }); A.ppl(out, 3, CREW(1), 20.4 + l * 0.2, 12.4 + l * 1.6, { expr: "talk_o", arms: { l: ["up", 1], r: ["hold", 1] } });
      wd(out, "BYE!", "#3a8ad8", 18, 3.6, 13 + l * 1.6, (t - S("The other") - 0.5) * 2.5, 1.0); } });
  // 8 But the hippos? Too heavy to move.: three workers push a hippo on the bank: it does not budge
  shot({ at: S("But the"), ...day, cam: push(H_(0.9, 1.3, 2.2), H_(0.6, 1.1, -3.5), H_(0.85, 1.3, 1.8), H_(0.6, 1.12, -3.5), 52, 1.8), cInf: 1.3, focus: H_(0, 1, -3.5), shadowR: 8,
    stage(t, out) { const j = Math.sin(t * 30) * 0.02; hippo(out, t, 0.2, -4.2, { land: true, face: "smug", flip: true, w: 4.0 });
      [[1.8, -3.1], [2.2, -2.6], [1.3, -2.4]].forEach(([x, z], i) => A.ppl(out, 4 + i, CREW(i), x + j, z, { expr: i === 1 ? "pained" : "worried", arms: { l: ["out", 1], r: ["out", 1] }, headTilt: Math.sin(t * 14 + i) * 4 }));
      for (let i = 0; i < 2; i++) A.fx(out, "sweat", (p) => DR.sweat(p), 1.6 + i * 0.4, 2.1 - ((t * 0.7 + i * 0.4) % 0.35), -2.4, 0.12, 0.12, { cw: 128, ch: 128, kind: "basic" });
      wd(out, "HEAVY!", "#c8302e", 0.5, 2.8, -3.4, (t - T("heavy") + 0.05) * 2.5, 1.0); } });
  // 9 So they just… left them there.: the workers shrug and walk off; the hippo blinks: ?
  shot({ at: S("So they just"), ...day, cam: push(H_(0.5, 1.4, 2.8), H_(0.5, 1.1, -3.5), H_(0.55, 1.4, 2.4), H_(0.5, 1.12, -3.5), 52, 1.6), cInf: 1.1, focus: H_(0.2, 1, -3.5), shadowR: 8,
    stage(t, out) { const l = t - S("So they just"); hippo(out, t, 0.2, -4.2, { land: true, face: "happy", flip: true, w: 4.0, look: 1 });
      [[1.2, -2.3], [1.8, -1.8]].forEach(([x, z], i) => A.ppl(out, 4 + i, CREW(i), x + l * 0.8, z + l * 0.5, { expr: "smile", arms: { l: ["shrug", 1], r: ["shrug", 1] } }));
      mk(out, "?", -0.6, 2.7, -3.5, (t - T("left") + 0.1) * 2.5, 0.5); } });
  // 10 Big mistake.: snap zoom onto the hippo's sly face
  shot({ at: S("Big mistake"), ...day, cam: (l) => ({ pos: H_(-0.7, 1.75, 2.2 - glide(l / 0.35) * 2.4), look: H_(-0.7, 1.75, -4.2), fov: 44, roll: 0.03 * Math.sin(l * 4) }), cInf: 2.2, focus: H_(-0.7, 1.7, -4.2), shadowR: 6,
    stage(t, out) { hippo(out, t, 0.2, -4.2, { land: true, face: "smug", flip: true, w: 4.0, look: 1 }); wd(out, "UH-OH", "#c8302e", -0.6, 2.75, -3.9, (t - T("mistake") + 0.05) * 2.5, 0.7); } });
  kick1(T("Big") + 0.03);
  // 11 The hippos wandered out…: a line of hippos waddles along the bank toward the river
  shot({ at: S("The hippos wandered"), ...day, cam: push(H_(-5.5, 1.2, 0.8), H_(-1.5, 1.0, -2.6), H_(-5.2, 1.2, 0.4), H_(-1.5, 1.02, -2.6), 54, 1.8), cInf: 1.0, focus: H_(-2, 1, -3), shadowR: 10,
    stage(t, out) { const l = t - S("The hippos wandered"); [0, 1, 2, 3].forEach((i) => hippo(out, t, 1.5 - i * 2.8 - l * 1.2, -1.8 - i * 0.7, { land: true, walk: true, w: 3.4 - (i % 2) * 0.4, face: "happy", flip: true, ph: i })); } });
  // 12 …found a river…: belly-flop into the water: SPLASH!
  const tRiv = T("river");
  shot({ at: S("found a"), ...day, cam: push(H_(0.8, 0.9, -2.6), H_(-0.3, 0.7, -11), H_(0.7, 0.9, -3.0), H_(-0.3, 0.72, -11), 52, 1.0), cInf: 1.0, focus: H_(0, 0.7, -10), shadowR: 8,
    stage(t, out) { const u = (t - tRiv + 0.15) / 0.4; if (u < 1) hippo(out, t, -0.3, lerp(-7.8, -10.5, clamp01(u)), { land: true, lift: Math.sin(clamp01(u) * Math.PI) * 1.4 - clamp01(u) * 0.6, face: "happy", flip: true, rot: -0.25 * clamp01(u), w: 3.6 });
      else hippo(out, t, -0.3, -10.5, { vis: 0.5, face: "happy", w: 3.6, flip: true, ear: true }); splash(out, t, tRiv + 0.2, -0.3, -10.5, 4.0); wd(out, "SPLASH!", "#3a8ad8", 0.3, 2.3, -9.5, (t - tRiv - 0.25) * 2.5, 1.0); } });
  kick1(tRiv + 0.25);
  // 13 …and got busy.: two hippos snuggle in the water, hearts float up; the camera politely tilts away to the sky
  shot({ at: S("and got"), ...day, cam: push(H_(0, 0.8, -5.5), H_(0, 0.8, -12), H_(0, 1.0, -6.0), H_(0, 2.6, -12), 50, 1.1), cInf: 1.0, focus: H_(0, 0.8, -12), shadowR: 8,
    stage(t, out) { hippo(out, t, -1.15, -12, { vis: 0.55, face: "happy", w: 3.4 }); hippo(out, t, 1.15, -12.1, { vis: 0.55, face: "wink", w: 3.2, flip: true, ph: 3 });
      const k = Math.floor(t * 12) % 16; A.fx(out, "hearts" + k, (p) => DR.hearts(p, k), 0, 2.0, -11.6, 2.2, 2.2, { cw: 512, ch: 512, kind: "basic" }); } });
  // 14 Today, there are around two hundred.: wide river full of hippos, the ~200 board
  const tTwo = T("two hundred");
  shot({ at: S("Today"), ...day, cam: push(H_(1.5, 2.6, -4.0), H_(-1, 0.9, -20), H_(1.2, 2.8, -4.6), H_(-1, 0.9, -20), 54, 2.6), cInf: 0.6, focus: H_(-3, 0.6, -20), shadowR: 16,
    stage(t, out) { for (let i = 0; i < 26; i++) { const z = -10.5 - hh(i, 42) * 26, x = 1.5 - 2.5 * (-4 - z) / 16 + (hh(i, 41) - 0.5) * (-z - 3) * 0.45; hippo(out, t, x, z, { vis: 0.4 + hh(i, 43) * 0.15, w: i % 4 === 0 ? 1.6 : 3.4, face: ["happy", "wink", "smug", "grumpy"][i % 4], flip: i % 2 === 0, ph: i }); }
      bd(out, "b200", "~200", "HIPPOS TODAY", "#7c6a8e", 0.6, 3.1, -9.5, (t - tTwo + 0.1) * 2.2, 2.3); } });
  // 15 Cocaine hippos.: a neon title card, a hippo in sunglasses rising in front
  const tCoc = T("Cocaine");
  shot({ at: S("Cocaine"), ...day, cam: push(H_(0.5, 1.3, -6.8), H_(0.5, 1.6, -11.5), H_(0.5, 1.3, -7.2), H_(0.5, 1.62, -11.5), 52, 1.4), cInf: 1.2, focus: H_(0, 1.4, -11), shadowR: 8,
    stage(t, out) { hippo(out, t, 0, -11.5, { vis: lerp(0.3, 0.55, smooth((t - tCoc) / 0.5)), face: "smug", glasses: true, w: 3.8 });
      const u = smooth((t - tCoc + 0.05) / 0.3); if (u > 0) A.fx(out, "title", (p) => drawTitle(p.g, "COCAINE", "HIPPOS"), 0.6, 2.9, -10.8, 1.9 * (0.6 + 0.4 * u), 0.71 * (0.6 + 0.4 * u), { cw: 1024, ch: 384, kind: "basic", rot: Math.sin(t * 5) * 0.03 }); } });
  kick1(tCoc + 0.05);
  // 16 They're huge…: a scientist next to a hippo on land, tiny in comparison: HUGE!
  shot({ at: S("They're huge"), ...day, cam: push(H_(0.3, 1.2, 3.6), H_(0.1, 1.3, -3.5), H_(0.25, 1.25, 3.2), H_(0.1, 1.32, -3.5), 52, 0.9), cInf: 1.2, focus: H_(0, 1.1, -3.5), shadowR: 8,
    stage(t, out) { hippo(out, t, -0.6, -4.2, { land: true, w: 5.0, face: "happy" }); A.ppl(out, 8, SCI(0), 1.15, -2.5, { expr: "gasp", arms: { l: ["head", 1], r: ["head", 1] }, extra: XL.clip }); wd(out, "HUGE!", "#7c6a8e", 0.2, 3.3, -3.6, (t - T("huge") + 0.05) * 2.5, 0.9); } });
  // 17 …grumpy…: angry close-up, steam
  shot({ at: S("grumpy") - 0.05, ...day, cam: push(H_(-0.9, 1.9, 1.0), H_(-0.9, 1.9, -4.2), H_(-0.9, 1.9, 0.6), H_(-0.9, 1.91, -4.2), 46, 0.6), cInf: 2.0, focus: H_(-0.9, 1.8, -4.2), shadowR: 6,
    stage(t, out) { hippo(out, t, -0.2, -4.2, { land: true, w: 4.0, face: "grumpy", flip: true }); for (let i = 0; i < 2; i++) { const ph = (t * 3 + i * 0.5) % 1; A.fx(out, "puff", (p) => drawPuff(p.g), -1.9 - ph * 0.6 + i * 0.1, 2.4 + ph * 0.6, -4.0, 0.4 + ph * 0.3, 0.4 + ph * 0.3, { cw: 256, ch: 256, kind: "basic" }); }
      wd(out, "GRR!", "#c8302e", -0.1, 2.75, -4.0, (t - T("grumpy") - 0.05) * 2.5, 0.6); } });
  // 18 …and they spray poop with their tails.: tail spinning like a fan, brown spray, a scientist ducking behind an umbrella: SPLAT!
  const tPoop = T("poop");
  shot({ at: S("and they spray"), ...day, cam: push(H_(0.6, 1.3, 3.0), H_(0.6, 1.2, -3.5), H_(0.6, 1.3, 2.6), H_(0.6, 1.22, -3.5), 54, 2.2), cInf: 1.2, focus: H_(0, 1, -3.5), shadowR: 8,
    stage(t, out) { const s = smooth((t - T("spray") + 0.1) / 0.3); hippo(out, t, 1.6, -4.2, { land: true, wide: true, w: 6.6, face: "smug", spin: s });
      A.ppl(out, 9, SCI(1), -0.6, -2.2, { expr: s > 0.5 ? "pained" : "neutral", arms: { l: ["head", 1], r: ["face", 1] }, headTilt: s > 0.5 ? Math.sin(t * 12) * 5 : 0 });
      if (s > 0.5) A.fx(out, "umb", (p) => drawUmb(p.g), -0.45, 2.15, -1.95, 1.2, 0.9, { cw: 512, ch: 384, kind: "lit" });
      wd(out, "SPLAT!", "#7a5a32", 0.4, 2.9, -3.4, (t - tPoop + 0.05) * 2.5, 1.0); } });
  kick1(tPoop + 0.05);
  // 19 Birth control?: a scientist holds up a giant pill bottle to a hippo
  shot({ at: S("Birth control"), ...day, cam: push(H_(0.2, 1.5, 3.0), H_(-0.2, 1.4, -3), H_(0.15, 1.5, 2.6), H_(-0.2, 1.42, -3), 50, 1.0), cInf: 1.3, focus: H_(0, 1.3, -3), shadowR: 8,
    stage(t, out) { hippo(out, t, -1.6, -4.4, { land: true, w: 4.0, face: "happy", look: 1 }); A.ppl(out, 8, { ...SCI(0), xk: "pills" }, 0.8, -2.4, { expr: "barker_o", arms: { l: ["hips", 1], r: ["up", 1] }, extra: XL.pills }); } });
  // 20 Didn't work.: babies pop up in the river; the scientist facepalms
  const tDid = T("Didn't");
  shot({ at: S("Didn't"), ...day, cam: push(H_(0.5, 1.0, -3.0), H_(0, 0.7, -11), H_(0.4, 1.05, -3.5), H_(0, 0.72, -11), 52, 1.0), cInf: 1.1, focus: H_(0, 0.7, -10), shadowR: 8,
    stage(t, out) { hippo(out, t, 0, -12.5, { vis: 0.55, face: "smug", w: 3.6 }); pop(out, t, tDid, -2.0, -10.5, { flip: true }); pop(out, t, tDid + 0.25, 1.9, -10.6, {}); pop(out, t, tDid + 0.45, -0.3, -9.8, { face: "wink" });
      A.ppl(out, 8, SCI(0), 1.0, -7.6, { expr: "sad", arms: { l: ["face", 1], r: ["low", 1] } }); } });
  // 21 So they tried castration.: a scientist with giant scissors, snip-snip; the hippo's eyes go wide: SNIP?!
  const tCas = T("castration");
  shot({ at: S("So they tried"), ...day, cam: push(H_(0.2, 1.5, 3.0), H_(-0.2, 1.4, -3.4), H_(0.15, 1.5, 2.6), H_(-0.2, 1.42, -3.4), 50, 1.6), cInf: 1.3, focus: H_(0, 1.3, -3.4), shadowR: 8,
    stage(t, out) { const sp = Math.floor(t * 8) % 4; hippo(out, t, -1.5, -4.4, { land: true, w: 4.0, face: t > tCas ? "shock" : "happy", look: 1 }); A.ppl(out, 9, { ...SCI(2), xk: "sc" + sp }, 0.8, -2.4, { expr: "sly", arms: { l: ["hips", 1], r: ["up", 1] }, extra: XL.scissors(sp * 1.6) });
      wd(out, "SNIP?!", "#c8302e", -0.6, 2.9, -3.3, (t - tCas - 0.1) * 2.5, 0.9); } });
  kick1(tCas + 0.1);
  // 22 Wait, it gets worse.: snap zoom onto the scientist's worried face
  shot({ at: S("Wait"), ...day, cam: (l) => ({ pos: H_(1.5, 1.7, -0.5 - glide(l / 0.35) * 1.3), look: H_(1.5, 1.68, -2.9), fov: 44, roll: 0.03 * Math.sin(l * 4) }), cInf: 2.4, focus: H_(1.5, 1.6, -2.9), shadowR: 6,
    stage(t, out) { A.ppl(out, 9, SCI(2), 1.5, -2.9, { expr: "worried", arms: { l: ["face", 1], r: ["face", 1] }, headTilt: Math.sin(t * 7) * 4 }); hippo(out, t, -1.0, -5.0, { land: true, w: 4.0, face: "shock" });
      wd(out, "UH-OH", "#c8302e", 1.5, 2.25, -2.6, (t - T("worse") + 0.05) * 2.5, 0.55); } });
  kick1(T("Wait") + 0.03);
  // 23 A male hippo's testicles…: the hippo gives a smug look, a big "?" pops up
  shot({ at: S("A male"), ...day, cam: push(H_(0.2, 1.4, 3.6), H_(0, 1.3, -4), H_(0.2, 1.4, 3.2), H_(0, 1.32, -4), 52, 1.6), cInf: 1.2, focus: H_(0, 1.3, -4), shadowR: 8,
    stage(t, out) { hippo(out, t, 0, -4.4, { land: true, w: 4.4, face: "smug" }); mk(out, "?", -0.4, 1.0, -3.9, (t - T("testicles") + 0.1) * 2.5, 0.7, "#ff5a8a"); } });
  // 24 …can hide inside his body.: the hippo winks: HIDDEN!
  shot({ at: S("hide inside") - 0.1, ...day, cam: push(H_(-0.9, 1.9, 1.4), H_(-0.9, 1.85, -4.4), H_(-0.9, 1.9, 1.0), H_(-0.9, 1.86, -4.4), 46, 1.2), cInf: 2.0, focus: H_(-0.9, 1.8, -4.4), shadowR: 6,
    stage(t, out) { hippo(out, t, 0.1, -4.4, { land: true, w: 4.4, face: "wink", flip: true }); sparkle(out, t, -1.2, 2.3, -4.2, 0.2, 3); wd(out, "HIDDEN!", "#7c6a8e", -0.4, 2.95, -4.0, (t - T("hide") - 0.1) * 2.5, 0.85); } });
  // 25 Scientists tracked one male…: scientists with binoculars creep along after a hippo
  shot({ at: S("Scientists tracked"), ...day, cam: push(H_(-5.0, 1.4, 3.5), H_(-0.5, 1.3, -2), H_(-4.6, 1.4, 3.0), H_(-0.5, 1.32, -2), 52, 1.4), cInf: 1.0, focus: H_(-1, 1.2, -2), shadowR: 10,
    stage(t, out) { const l = t - S("Scientists tracked"); hippo(out, t, 3.0 + l * 0.8, -4.6, { land: true, walk: true, w: 3.8, face: "happy" });
      [[-2.2, -1.6], [-1.0, -1.1], [-3.2, -0.9]].forEach(([x, z], i) => A.ppl(out, 10 + i, { ...SCI(i), xk: "bin" }, x + l * 0.8, z, { expr: i === 1 ? "suspicious" : "sly", arms: { l: ["face", 1], r: ["face", 1] }, extra: XL.binoc })); } });
  // 26 …for months.: calendar pages flip, a bored scientist
  shot({ at: S("for months"), ...day, cam: push(H_(0, 1.6, 2.2), H_(0, 1.7, -2), H_(0, 1.6, 1.9), H_(0, 1.71, -2), 48, 1.0), cInf: 1.4, focus: H_(0, 1.7, -2), shadowR: 8,
    stage(t, out) { const pg = Math.max(0, Math.floor((t - S("for months")) * 6)); A.fx(out, "cal" + (pg % 6), (p) => drawCalendar(p.g, pg % 6), -0.2, 1.75, -2, 1.3, 1.46, { cw: 512, ch: 576, kind: "basic", rot: Math.sin(t * 9) * 0.04 });
      A.ppl(out, 10, SCI(1), 1.3, -3.2, { expr: "bored", arms: { l: ["hips", 1], r: ["face", 1] } }); } });
  // 27 They knocked him out…: a dart flies, lands in the hippo's rump: THWIP!
  const tKn = T("knocked");
  shot({ at: S("They knocked"), ...day, cam: push(H_(0.4, 1.3, 2.8), H_(0.5, 1.2, -3.8), H_(0.4, 1.3, 2.4), H_(0.5, 1.22, -3.8), 52, 1.2), cInf: 1.1, focus: H_(0.5, 1.1, -4), shadowR: 8,
    stage(t, out) { hippo(out, t, 0.6, -4.4, { land: true, w: 4.0, face: t > tKn + 0.35 ? "shock" : "happy", flip: true }); A.ppl(out, 11, { ...SCI(2), xk: "dart" }, -0.9, -2.2, { expr: "sly", arms: { l: ["hold", 1], r: ["hold", 1] }, extra: XL.dart });
      const u = clamp01((t - tKn) / 0.35); A.fx(out, "dartfly", (p) => drawDart(p.g), lerp(-0.5, 1.8, u), lerp(1.45, 1.35, u), lerp(-2.4, -4.1, u), 0.5, 0.125, { cw: 256, ch: 64, kind: "basic" });
      wd(out, "THWIP!", "#ff8a2a", 1.3, 2.6, -3.6, (t - tKn - 0.35) * 2.5, 0.9); } });
  kick1(tKn + 0.35);
  // 28 …with an elephant tranquilizer…: the giant bottle with an elephant on the label
  shot({ at: S("with an"), ...day, cam: push(H_(0.2, 1.6, 1.8), H_(0, 1.6, -2), H_(0.2, 1.6, 1.5), H_(0, 1.61, -2), 48, 1.4), cInf: 1.4, focus: H_(0, 1.6, -2), shadowR: 8,
    stage(t, out) { const u = smooth((t - T("elephant") + 0.2) / 0.3); A.fx(out, "bottle", (p) => drawBottle(p.g), -0.25, 1.65, -2, 1.1 * (0.6 + 0.4 * u), 1.65 * (0.6 + 0.4 * u), { cw: 512, ch: 768, kind: "lit", rot: Math.sin(t * 4) * 0.05 });
      A.ppl(out, 11, SCI(2), 0.8, -2.9, { expr: "barker_o", arms: { l: ["point", 1], r: ["hips", 1] } }); } });
  // 29 And then…: the hippo flops over asleep: Zzz
  shot({ at: S("And then") - 0.1, ...day, cam: push(H_(0.6, 1.2, 3.0), H_(0, 1.0, -4), H_(0.5, 1.2, 2.6), H_(0, 1.02, -4), 50, 1.0), cInf: 1.2, focus: H_(0, 1, -4), shadowR: 8,
    stage(t, out) { const u = smooth((t - S("And then") + 0.1) / 0.4); hippo(out, t, 0, -4.4, { land: true, w: 4.4, face: "sleep", rot: 0.12 * u, lift: -0.15 * u }); const k = Math.floor(t * 12) % 12; A.fx(out, "zzz" + k, (p) => DR.zzz(p, k), 1.2, 2.2, -4.0, 0.9, 0.9, { cw: 256, ch: 256, kind: "basic" }); } });
  kick1(T("And then") + 0.2);
  // 30 …had to go looking for them.: scientists search around the sleeping hippo with a magnifier and a torch: HELLO?!
  shot({ at: S("had to"), ...day, cam: push(H_(0, 1.25, 3.8), H_(0, 1.1, -4), H_(0, 1.25, 3.4), H_(0, 1.12, -4), 52, 1.6), cInf: 1.2, focus: H_(0, 1, -4), shadowR: 8,
    stage(t, out) { hippo(out, t, 0, -4.6, { land: true, w: 4.4, face: "sleep", rot: 0.12, lift: -0.15 }); const k = Math.floor(t * 12) % 12; A.fx(out, "zzz" + k, (p) => DR.zzz(p, k), 1.4, 2.2, -4.2, 0.8, 0.8, { cw: 256, ch: 256, kind: "basic" });
      A.ppl(out, 10, { ...SCI(0), xk: "mag" }, -1.3, -2.6, { expr: "suspicious", arms: { l: ["hips", 1], r: ["point", 1] }, extra: XL.magnify }); A.ppl(out, 11, { ...SCI(2), xk: "torch" }, 1.3, -2.5, { expr: "gasp", arms: { l: ["head", 1], r: ["point", 1] }, extra: XL.torch });
      wd(out, "HELLO?!", "#ffb000", -0.2, 2.75, -3.8, (t - T("looking") + 0.05) * 2.5, 0.85); mk(out, "?", -1.4, 2.4, -3.3, (t - T("looking") - 0.2) * 2.5, 0.4); mk(out, "?", 1.5, 2.5, -3.2, (t - T("looking") - 0.4) * 2.5, 0.35); } });
  // 31 One expert can castrate…: a lone expert with a clipboard, one hippo at a time
  shot({ at: S("One expert"), ...day, cam: push(H_(0.6, 1.6, 3.0), H_(0.2, 1.5, -3), H_(0.5, 1.6, 2.6), H_(0.2, 1.52, -3), 50, 1.4), cInf: 1.2, focus: H_(0.2, 1.5, -3), shadowR: 8,
    stage(t, out) { A.ppl(out, 12, { ...SCI(1), xk: "clip" }, 0.6, -2.4, { expr: "proud", arms: { l: ["hold", 1], r: ["shoulder", 1] }, extra: XL.clip }); hippo(out, t, -1.8, -5.0, { land: true, w: 3.6, face: "sad" });
      tag(out, "tagEx", "THE EXPERT", "ONE MAN, ONE JOB", "#2f8a5a", 0.6, 0.9, -1.9, smooth((t - T("expert") + 0.05) / 0.3), 0.95); } });
  // 32 …about one hippo a year.: the 1 HIPPO PER YEAR board, a snail crawls past
  shot({ at: S("about one"), ...day, cam: push(H_(0, 1.9, 2.2), H_(0, 2.0, -2.5), H_(0, 1.9, 1.9), H_(0, 2.02, -2.5), 50, 1.2), cInf: 1.3, focus: H_(0, 2, -2.5), shadowR: 8,
    stage(t, out) { bd(out, "b1y", "1 HIPPO", "PER YEAR", "#2f8a5a", 0, 2.35, -2.5, (t - T("about one") + 0.1) * 2.2, 1.7); const k = Math.floor(t * 10) % 20; A.fx(out, "snail" + k, (p) => drawSnail(p.g, k), -0.2, 1.3, -2.3, 1.1, 0.69, { cw: 512, ch: 320, kind: "basic" }); } });
  // 33 The hippos? Making babies way faster.: babies pop up everywhere, hearts
  const tBab = T("babies");
  shot({ at: S("The hippos Making"), ...day, cam: push(H_(1.5, 1.6, -2.0), H_(-0.5, 0.6, -13), H_(1.2, 1.7, -2.6), H_(-0.5, 0.62, -13), 54, 2.2), cInf: 0.9, focus: H_(0, 0.6, -12), shadowR: 10,
    stage(t, out) { hippo(out, t, -1.0, -14, { vis: 0.5, face: "happy", w: 3.4 }); hippo(out, t, 1.6, -14.4, { vis: 0.5, face: "wink", w: 3.2, flip: true, ph: 2 });
      [[-3, -11], [-1.5, -10.4], [0.3, -11.2], [2.1, -10.6], [3.6, -11.5], [-4.2, -12.4], [1.2, -9.8], [4.6, -12.6]].forEach(([x, z], i) => pop(out, t, tBab - 0.4 + i * 0.2, x, z, { flip: i % 2 === 0, face: i % 3 ? "happy" : "wink", ph: i }));
      const k = Math.floor(t * 12) % 16; A.fx(out, "hearts" + k, (p) => DR.hearts(p, k), 0.3, 2.4, -13.6, 2.4, 2.4, { cw: 512, ch: 512, kind: "basic" }); } });
  // 34 Now a billionaire…: a golden OFFER letter descends over the river, sparkles
  shot({ at: S("Now a"), ...day, cam: push(H_(0, 1.3, -4.0), H_(0, 1.9, -12), H_(0, 1.35, -4.5), H_(0, 1.92, -12), 52, 1.2), cInf: 1.1, focus: H_(0, 1.9, -11), shadowR: 8,
    stage(t, out) { const u = smooth((t - S("Now a")) / 0.5); A.fx(out, "offer", (p) => drawOffer(p.g), 0, lerp(3.6, 2.35, u), -11, 1.9, 1.52, { cw: 640, ch: 512, kind: "basic", rot: Math.sin(t * 4) * 0.05 }); sparkle(out, t, 0, 2.4, -10.9, 0.3, 4);
      hippo(out, t, 0, -12.5, { vis: 0.5, face: "shock", w: 3.4 }); } });
  // 35 …in India offered to take some.: the India board, hippos cheering
  shot({ at: S("in India"), ...day, cam: push(H_(0.4, 1.6, -4.5), H_(0, 1.9, -12), H_(0.35, 1.6, -5.0), H_(0, 1.92, -12), 52, 1.4), cInf: 1.1, focus: H_(0, 1.9, -11), shadowR: 8,
    stage(t, out) { const u = smooth((t - T("India") + 0.1) / 0.3); if (u > 0) A.fx(out, "india", (p) => drawIndia(p.g), 0, 2.55, -11, 2.4 * (0.6 + 0.4 * u), 1.5 * (0.6 + 0.4 * u), { cw: 1024, ch: 640, kind: "basic" });
      hippo(out, t, -1.4, -12.6, { vis: 0.5, face: "happy", w: 3.0, flip: true, ear: true }); hippo(out, t, 1.5, -12.8, { vis: 0.5, face: "wink", w: 3.0, ear: true, ph: 3 }); } });
  kick1(T("India") + 0.05);
  // 36 By plane.: an airliner flies across the sky, hippo faces in every window
  shot({ at: S("By plane"), ...day, cam: push(H_(0, 1.4, 0), H_(0, 4.4, -12), H_(0, 1.4, -0.4), H_(0.4, 4.6, -12), 50, 1.2), cInf: 0.6, focus: H_(0, 6, -20), shadowR: 10,
    stage(t, out) { const l = t - S("By plane"), k = Math.floor(t * 10) % 16; A.fx(out, "plane" + k, (p) => drawPlane(p.g, k), -2.2 + l * 2.6, 4.6 + l * 0.4, -12, 5.2, 2.6, { cw: 1024, ch: 512, kind: "lit", rot: 0.05 });
      wd(out, "BYE BYE!", "#3a8ad8", 0.3, 2.9, -9, (t - T("plane") - 0.1) * 2.5, 1.6); } });
  // 37 Turns out the hardest thing to smuggle…: a hippo squeezed into a suitcase on the riverbank, winking
  shot({ at: S("Turns out"), ...day, cam: push(H_(0.15, 1.05, 0.7), H_(0, 1.0, -3.2), H_(0.12, 1.05, 0.35), H_(0, 1.01, -3.2), 50, 2.0), cInf: 1.4, focus: H_(0, 0.9, -3.2), shadowR: 8,
    stage(t, out) { const k = Math.floor(t * 10) % 24; A.fx(out, "case" + k, (p) => drawCase(p.g, k), 0, 1.0, -3.2, 2.2, 1.83, { cw: 768, ch: 640, kind: "lit", rot: Math.sin(t * 7) * 0.03 }); for (let i = 0; i < 2; i++) A.fx(out, "sweat", (p) => DR.sweat(p), 0.95 + i * 0.25, 1.75 - ((t * 0.6 + i * 0.4) % 0.3), -3.0, 0.12, 0.12, { cw: 128, ch: 128, kind: "basic" }); } });
  // 38 …out of Colombia… is: loop: shot 1's view, the hippo sinking back to where shot 1 starts
  const tL = S("of Colombia");
  shot({ at: tL, ...day, cam: heroCam, cInf: 1.0, focus: H_(0, 1, -13), shadowR: 10, loop: true, stage(t, out) { const k = clamp01((t - tL) / Math.max(0.3, END - tL - 0.05)); heroStage(t, out, lerp(0.9, 0.25, k)); } });
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
