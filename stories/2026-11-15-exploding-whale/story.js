// Shot plan for "They Blew Up a Whale… With Dynamite" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Florence, Oregon, 12 Nov 1970: the Highway Division blows up a dead sperm whale with half a ton of dynamite; blubber rains on
// the crowd, the seagulls flee, most of the whale stays put, and a chunk flattens the brand-new car of the man who warned them
// (bought at a "whale of a deal" sale). Hook-first (the blast already flying on frame 0), a cut every ~1.6 s, loop ending
// (the last shot is the same view counting up to the blast, handing over to shot 1).
import { BEACH } from "./world.js";
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

// ---------------- the whale: sperm whale side view, head to the LEFT, 1024 x 512, belly on y 490 ----------------
// o.blown: scorched, chunks bitten out of the back, smoke-free (smoke is separate cards); o.dead: X eye
function drawWhale(g, o = {}) {
  g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; g.lineCap = "round";
  const B = "#66708a", D = "#4e5670", LT = "#8a94aa";
  // tail flukes (right), drooping on the sand
  g.fillStyle = D; g.strokeStyle = INK; g.lineWidth = 12;
  g.beginPath(); g.moveTo(860, 380); g.quadraticCurveTo(930, 330, 1010, 300); g.quadraticCurveTo(990, 380, 1000, 470); g.quadraticCurveTo(940, 450, 870, 450); g.closePath(); g.fill(); g.stroke();
  // body: huge boxy head at the left tapering to the tail
  g.fillStyle = B; g.beginPath(); g.moveTo(40, 470); g.quadraticCurveTo(20, 300, 70, 200); g.quadraticCurveTo(120, 140, 300, 140); g.quadraticCurveTo(520, 140, 640, 210);
  g.quadraticCurveTo(780, 290, 880, 360); g.quadraticCurveTo(900, 420, 870, 455); g.quadraticCurveTo(600, 500, 300, 495); g.quadraticCurveTo(90, 495, 40, 470); g.closePath(); g.fill(); g.stroke();
  // lighter belly + wrinkles
  g.fillStyle = LT; g.beginPath(); g.moveTo(80, 470); g.quadraticCurveTo(300, 440, 600, 455); g.quadraticCurveTo(760, 450, 860, 440); g.quadraticCurveTo(600, 492, 300, 490); g.quadraticCurveTo(120, 490, 80, 470); g.closePath(); g.fill();
  g.strokeStyle = "rgba(36,23,38,0.45)"; g.lineWidth = 6; for (let i = 0; i < 9; i++) { const x = 340 + i * 50; g.beginPath(); g.moveTo(x, 190 + i * 12); g.quadraticCurveTo(x + 20, 260 + i * 10, x + 6, 330 + i * 8); g.stroke(); }
  // jaw line + small eye
  g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(60, 420); g.quadraticCurveTo(200, 440, 330, 420); g.stroke();
  if (o.dead !== false) { g.lineWidth = 10; g.beginPath(); g.moveTo(330, 330); g.lineTo(362, 362); g.moveTo(362, 330); g.lineTo(330, 362); g.stroke(); }
  // flipper
  g.fillStyle = D; g.lineWidth = 10; g.beginPath(); g.moveTo(420, 420); g.quadraticCurveTo(470, 470, 540, 480); g.quadraticCurveTo(500, 420, 470, 400); g.closePath(); g.fill(); g.stroke();
  if (o.blown) {
    // scorched patches + ragged chunks missing from the back
    g.fillStyle = "rgba(40,30,30,0.55)"; for (const [x, y, rx, ry] of [[420, 210, 120, 50], [600, 250, 90, 40], [250, 190, 80, 34]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.1, 0, two); g.fill(); }
    g.fillStyle = "#f2c8b8"; g.strokeStyle = INK; g.lineWidth = 8;
    for (const [x, y, r] of [[450, 168, 50], [560, 196, 38], [330, 150, 34]]) { g.beginPath(); g.moveTo(x - r, y - 10); for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI; g.lineTo(x + Math.cos(a) * r * (i % 2 ? 0.7 : 1), y + 8 - Math.sin(a) * r * 0.9 * (i % 2 ? 0.8 : 1)); } g.closePath(); g.fill(); g.stroke(); E(g, x, y + 4, r * 0.4, r * 0.25, 0, "#d88a8a", 0); }
  } else { g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.ellipse(200, 190, 110, 28, -0.15, 0, two); g.fill(); }
}

// ---------------- dynamite crates stacked in a pile, 1024 x 512, ground y 500; n = how many crates (0..20) ----------------
function drawCrates(g, n = 20) {
  g.clearRect(0, 0, 1024, 512); g.lineJoin = "round";
  let k = 0; const rows = [7, 6, 4, 3];
  for (let r = 0; r < rows.length; r++) for (let i = 0; i < rows[r]; i++) { if (k++ >= n) return;
    const w = 128, h = 100, x = 512 - (rows[r] * w) / 2 + i * w + (r % 2) * 6, y = 500 - (r + 1) * h;
    g.fillStyle = "#c08a50"; g.strokeStyle = INK; g.lineWidth = 8; g.fillRect(x + 2, y + 2, w - 4, h - 4); g.strokeRect(x + 2, y + 2, w - 4, h - 4);
    g.strokeStyle = "rgba(36,23,38,0.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 6, y + h / 2); g.lineTo(x + w - 6, y + h / 2); g.stroke();
    g.fillStyle = "#c8302e"; g.fillRect(x + 14, y + 28, w - 28, 40); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x + 14, y + 28, w - 28, 40);
    txt(g, "TNT", x + w / 2, y + 50, 34, "Bangers", "#fff4b0", INK, 0, w - 34); }
}
// one red dynamite bundle (for hands / close-ups), 256 x 256
const drawStick = (g) => { g.clearRect(0, 0, 256, 256); g.lineJoin = "round"; for (let i = 0; i < 3; i++) { g.fillStyle = "#d8333a"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(60 + i * 46, 70, 44, 150, 10); g.fill(); g.stroke(); }
  g.fillStyle = "#3a3a44"; g.fillRect(56, 130, 144, 22); g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(128, 70); g.quadraticCurveTo(140, 30, 180, 24); g.stroke(); };
// the plunger detonator, 256 x 512 (handle up by u 0..1 = up)
const drawPlunger = (g, u) => { g.clearRect(0, 0, 256, 512); g.lineJoin = "round"; const hy = 200 - u * 110;
  g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(128, hy); g.lineTo(128, 340); g.stroke(); g.strokeStyle = "#c9cdd4"; g.lineWidth = 8; g.stroke();
  g.fillStyle = "#3a3a44"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.roundRect(30, hy - 26, 196, 40, 14); g.fill(); g.stroke();
  g.fillStyle = "#e8742a"; g.beginPath(); g.roundRect(36, 330, 184, 170, 14); g.fill(); g.stroke(); txt(g, "DANGER", 128, 420, 44, "Bangers", "#ffffff", INK, 6, 170);
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(220, 470); g.quadraticCurveTo(250, 490, 256, 505); g.stroke(); };

// ---------------- seagull, 256 x 256, k = wing frame 0..3; mood: calm | scared ----------------
function drawGull(g, k = 0, mood = "calm") {
  g.clearRect(0, 0, 256, 256); g.lineJoin = "round"; g.lineCap = "round";
  const up = [-0.7, -0.2, 0.3, -0.2][k % 4];
  for (const s of [-1, 1]) { g.save(); g.translate(128 + s * 18, 120); g.scale(s, 1); g.rotate(up); g.fillStyle = "#f4f4f0"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(50, -30, 108, -6); g.lineTo(70, 10); g.quadraticCurveTo(40, 14, 0, 16); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4a4e5a"; g.beginPath(); g.moveTo(92, -10); g.lineTo(108, -6); g.lineTo(84, 6); g.closePath(); g.fill(); g.restore(); }
  E(g, 128, 140, 34, 26, 0, "#ffffff", 7); E(g, 128, 106, 26, 24, 0, "#ffffff", 7);
  g.fillStyle = "#f2b030"; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(120, 112); g.lineTo(150, 118); g.lineTo(120, 124); g.closePath(); g.fill(); g.stroke();
  if (mood === "scared") { for (const s of [-1, 1]) { E(g, 128 + s * 10, 98, 9, 11, 0, "#ffffff", 4); E(g, 128 + s * 10, 98, 3, 4, 0, INK, 0); } for (let i = 0; i < 3; i++) { g.strokeStyle = "#8fd0ff"; g.lineWidth = 5; g.beginPath(); g.moveTo(96 - i * 8, 86 + i * 10); g.lineTo(80 - i * 8, 80 + i * 10); g.stroke(); } }
  else for (const s of [-1, 1]) E(g, 128 + s * 10, 100, 3.5, 4.5, 0, INK, 0);
}
// a lump of blubber, 128 x 128 (v = variant 0..3)
function drawBlob(g, v = 0) {
  g.clearRect(0, 0, 128, 128); g.lineJoin = "round"; const C = ["#e8b0a0", "#d89a8a", "#c8b8a0", "#efc4b0"][v % 4];
  g.fillStyle = C; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); for (let i = 0; i < 9; i++) { const a = (i / 9) * two, r = 40 + hh(i, v) * 18; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r * 0.85); } g.closePath(); g.fill(); g.stroke();
  E(g, 52, 54, 12, 8, 0.4, "rgba(255,255,255,0.5)", 0); E(g, 76, 76, 14, 9, 0, "rgba(120,60,60,0.35)", 0); E(g, 64, 64 - 10, 22, 6, 0, "#5a6070", 0);
}
// a splat on the sand / car, 256 x 128
const drawSplat = (g) => { g.clearRect(0, 0, 256, 128); g.fillStyle = "#e0a898"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); for (let i = 0; i < 14; i++) { const a = (i / 14) * two, r = i % 2 ? 52 : 100; g.lineTo(128 + Math.cos(a) * r, 64 + Math.sin(a) * r * 0.45); } g.closePath(); g.fill(); g.stroke(); };
// explosion puffs: k frame 0..6, kind fire | smoke | sand
const PUFFC = { fire: ["#ffd23a", "#ff8a2a"], smoke: ["#7a7470", "#5a5450"], sand: ["#e8d4a4", "#d8c08a"] };
const drawPuff = (g, k, kind) => { g.clearRect(0, 0, 256, 256); const v = k / 6, [c0, c1] = PUFFC[kind]; for (let i = 0; i < 7; i++) { const a = i * 0.9; E(g, 128 + Math.cos(a) * (34 + v * 40), 128 + Math.sin(a) * (28 + v * 30), 40 + v * 12, 34 + v * 10, 0, i % 2 ? c0 : c1, 6, "rgba(36,23,38,0.55)"); } };

// ---------------- 1970 sedan, side view, bow to the LEFT, 1024 x 512, ground y 500; o.crushed, o.col ----------------
function drawCar70(g, o = {}) {
  g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; g.lineCap = "round"; const C = o.col || "#2f8a8a";
  const wheel = (cx) => { E(g, cx, 430, 70, 70, 0, "#24222a", 12); E(g, cx, 430, 38, 38, 0, "#d8dce2", 7); E(g, cx, 430, 12, 12, 0, "#9aa0a8", 5); };
  const cr = o.crushed ? 1 : 0;
  // lower body
  g.fillStyle = C; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(40, 300); g.lineTo(980, 300 + cr * 20); g.quadraticCurveTo(1000, 330, 990, 420); g.lineTo(40, 420); g.quadraticCurveTo(24, 360, 40, 300); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#d8dce2"; g.fillRect(40, 380, 950, 18); g.strokeRect(40, 380, 950, 18);
  g.fillStyle = "#fff6c0"; E(g, 50, 330, 14, 20, 0, "#fff6c0", 6); g.fillStyle = "#d8333a"; g.fillRect(968, 318, 20, 30);
  // cabin: normal or caved in
  g.fillStyle = C; g.lineWidth = 12; g.beginPath();
  if (!cr) { g.moveTo(280, 300); g.lineTo(360, 190); g.lineTo(700, 190); g.lineTo(800, 300); }
  else { g.moveTo(280, 300); g.lineTo(330, 260); g.quadraticCurveTo(520, 330, 720, 250); g.lineTo(800, 312); }
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = cr ? "#9ab8c8" : "#bfe4ff"; g.lineWidth = 8; g.beginPath();
  if (!cr) { g.moveTo(310, 292); g.lineTo(372, 204); g.lineTo(520, 204); g.lineTo(520, 292); g.closePath(); g.moveTo(540, 292); g.lineTo(540, 204); g.lineTo(690, 204); g.lineTo(770, 292); g.closePath(); }
  else { g.moveTo(320, 296); g.lineTo(350, 274); g.lineTo(700, 268); g.lineTo(760, 300); g.closePath(); }
  g.fill(); g.stroke();
  if (cr) { g.strokeStyle = INK; g.lineWidth = 5; for (const [x, y] of [[420, 282], [600, 280]]) for (let i = 0; i < 5; i++) { const a = i * 1.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 40, y + Math.sin(a) * 14); g.stroke(); } }
  wheel(220); wheel(820);
  if (o.tag) { g.save(); g.translate(600, 160); g.rotate(-0.08); g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-110, -36, 220, 72, 10); g.fill(); g.stroke(); txt(g, "BRAND NEW!", 0, 2, 44, "Bangers", "#c8302e", INK, 0, 200); g.restore(); }
}

// ---------------- signs ----------------
const DR3 = {
  park: (p) => { const g = p.g; g.clearRect(0, 0, 1024, 640); g.lineJoin = "round";
    for (const x of [200, 824]) { g.fillStyle = "#7a5a3a"; g.strokeStyle = INK; g.lineWidth = 12; g.fillRect(x - 22, 380, 44, 260); g.strokeRect(x - 22, 380, 44, 260); }
    g.fillStyle = "#3f6a4a"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(40, 30, 944, 400, 30); g.fill(); g.stroke();
    g.strokeStyle = "#f4efe2"; g.lineWidth = 8; g.beginPath(); g.roundRect(64, 54, 896, 352, 20); g.stroke();
    txt(g, "EXPLODING WHALE", 512, 150, 120, "Rye", "#f4efe2", INK, 0, 860); txt(g, "MEMORIAL PARK", 512, 290, 120, "Rye", "#ffd23a", INK, 0, 860);
    g.save(); g.translate(512, 370); g.scale(0.16, 0.12); g.translate(-512, -300); const oc = document.createElement("canvas"); oc.width = 1024; oc.height = 512; drawWhale(oc.getContext("2d"), { dead: false }); g.drawImage(oc, 0, 0); g.restore(); },
  deal: (p, k) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.lineJoin = "round";
    for (let i = 0; i < 14; i++) { const x = 20 + i * 72; g.fillStyle = ["#d8333a", "#ffd23a", "#2f6ad8"][i % 3]; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, 20); g.lineTo(x + 64, 20); g.lineTo(x + 32, 70 + (i + k) % 2 * 8); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(40, 90, 944, 400, 30); g.fill(); g.stroke();
    txt(g, "A WHALE", 640, 210, 130, "Bangers", "#d8333a", INK, 12, 600); txt(g, "OF A DEAL!", 640, 360, 130, "Bangers", "#2f6ad8", INK, 12, 600);
    g.save(); g.translate(60, 170 + (k % 2) * 6); g.scale(0.27, 0.42); const oc = document.createElement("canvas"); oc.width = 1024; oc.height = 512; drawWhale(oc.getContext("2d"), { dead: false }); g.drawImage(oc, 0, 0); g.restore();
    E(g, 140, 300, 30, 30, 0, "#ffffff", 6); E(g, 146, 300, 12, 12, 0, INK, 0); },
  bulb: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); for (let i = 0; i < 10; i++) { const a = (i / 10) * two; g.strokeStyle = "#ffd23a"; g.lineWidth = 10; g.beginPath(); g.moveTo(128 + Math.cos(a) * 84, 110 + Math.sin(a) * 84); g.lineTo(128 + Math.cos(a) * 118, 110 + Math.sin(a) * 118); g.stroke(); }
    E(g, 128, 110, 62, 64, 0, "#fff27a", 9); g.fillStyle = "#9aa0a8"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(98, 170, 60, 44, 8); g.fill(); g.stroke(); },
  boom: (p, c0, c1) => { const g = p.g; g.clearRect(0, 0, 512, 512); g.save(); const m = g.createRadialGradient(256, 256, 40, 256, 256, 256); for (let i = 0; i < 22; i++) { const a0 = (i / 22) * two, a1 = ((i + 1) / 22) * two; g.fillStyle = i % 2 ? c0 : c1; g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 256, a0, a1); g.closePath(); g.fill(); }
    g.globalCompositeOperation = "destination-in"; m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(0.6, "rgba(0,0,0,0.9)"); m.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = m; g.fillRect(0, 0, 512, 512); g.globalCompositeOperation = "source-over";
    const gr = g.createRadialGradient(256, 256, 20, 256, 256, 200); gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(1, "rgba(255,250,220,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); g.restore(); },
  later: (p) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.fillStyle = "#24356e"; g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.roundRect(30, 60, 964, 392, 40); g.fill(); g.stroke(); txt(g, "YEARS LATER...", 512, 256, 150, "Bangers", "#ffd23a", INK, 12, 900); },
};

// ---------------- props drawn on people's cards ----------------
const XL = {
  /** shoulder TV camera at the right hand */
  tvcam: () => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0] - 20, H.chin - 10); g.lineJoin = "round";
    g.fillStyle = "#3a3a44"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-150, -70, 210, 110, 14); g.fill(); g.stroke(); g.fillStyle = "#24222a"; g.beginPath(); g.roundRect(-210, -50, 70, 70, 10); g.fill(); g.stroke(); E(g, -212, -15, 18, 32, 0, "#8fb8d8", 6);
    g.fillStyle = "#c8302e"; g.beginPath(); g.arc(30, -50, 9, 0, two); g.fill(); txt(g, "TV", -50, -16, 44, "Bangers", "#ffffff", INK, 0, 80); g.restore(); },
  keys: () => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, [x, y] = H.r; g.strokeStyle = INK; g.lineWidth = 6; E(g, x, y - 18, 14, 14, 0, null, 6); g.fillStyle = "#e8c45a"; g.beginPath(); g.roundRect(x - 6, y - 4, 12, 50, 4); g.fill(); g.stroke(); g.fillRect(x + 4, y + 30, 14, 8); },
  stick: () => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, oc = document.createElement("canvas"); oc.width = 256; oc.height = 256; drawStick(oc.getContext("2d")); g.drawImage(oc, H.r[0] - 70, H.r[1] - 110, 140, 140); },
  crate: () => (p) => { const H = p.hands; if (!H || !H.l || !H.r) return; const g = p.g, x = (H.l[0] + H.r[0]) / 2, y = (H.l[1] + H.r[1]) / 2; g.fillStyle = "#c08a50"; g.strokeStyle = INK; g.lineWidth = 8; g.fillRect(x - 90, y - 70, 180, 120); g.strokeRect(x - 90, y - 70, 180, 120);
    g.fillStyle = "#c8302e"; g.fillRect(x - 70, y - 40, 140, 50); g.lineWidth = 4; g.strokeRect(x - 70, y - 40, 140, 50); txt(g, "TNT", x, y - 14, 42, "Bangers", "#fff4b0", INK, 0, 120); },
  /** blubber splats on the face and shirt; n = how many have landed */
  splat: (n) => (p) => { const H = p.hands; if (!H) return; const g = p.g; const spots = [[-0.4, -0.2, 0.32], [0.45, 0.1, 0.26], [0.05, -0.75, 0.38], [-0.2, 1.1, 0.4], [0.5, 1.6, 0.3], [-0.6, 0.5, 0.22]];
    for (let i = 0; i < Math.min(n, spots.length); i++) { const [dx, dy, r] = spots[i], x = 300 + dx * H.Ha, y = H.hc + dy * H.Ha, R = r * H.Ha; g.fillStyle = "#e0a898"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); for (let k = 0; k < 10; k++) { const a = (k / 10) * two, rr = k % 2 ? R * 0.6 : R; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#e0a898"; g.beginPath(); g.ellipse(x + R * 0.2, y + R * 1.1, R * 0.18, R * 0.4, 0, 0, two); g.fill(); g.stroke(); } },
};
const both = (...fs) => (p) => { for (const f of fs) if (f) f(p); };
const xo = (o, k) => ({ ...o, xk: k });

// ---------------- cast (1970) ----------------
const ENG = { jacket: "#e8742a", pants: "#3a3f52", boots: "#4a3426", hat: "cap", cap: "#f2c230", skin: "#f0d0b4", moustache: "#6a4a2a" };
const WRK = (v) => ({ jacket: ["#e8742a", "#f2c230", "#e8742a"][v % 3], pants: ["#3a3f52", "#5a4a3a", "#2e3a4a"][v % 3], boots: "#4a3426", hat: "cap", cap: ["#f2c230", "#ffffff", "#f2c230"][v % 3], skin: ["#f2d2b6", "#d9a77c", "#e8c3a0"][v % 3] });
const WALT = { jacket: "#6a5a44", pants: "#4a4a52", boots: INK, hat: "fedora", cap: "#4a3e30", build: "stout", skin: "#f0d0b4", moustache: "#9a9aa0" };
const CAMM = { jacket: "#8c3b4a", pants: "#2e3a4a", boots: INK, hat: "hair", hair: "#3a2a1a", skin: "#e8c3a0", moustache: "#3a2a1a" };
const FOLK = (v) => { const c = ["#3f6fb5", "#c25a7a", "#5d7a3a", "#d9a441", "#2f5f6a", "#7b5ac9", "#e8742a"][v % 7], sk = ["#f2d2b6", "#f5c9a0", "#d9a77c", "#c99067", "#ecd0b6"][v % 5];
  return v % 2 ? { jacket: c, pants: "#3b3f52", boots: "#4a3426", skin: sk, hat: "hair", hair: ["#c89a4a", "#3a2a1a", "#8a5a30"][v % 3], dress: ["#d9a441", "#c25a7a", "#5a8fc2", "#7ad08a"][v % 4] }
    : { jacket: c, pants: ["#3b3f52", "#5a4a3a", "#2e3a4a"][v % 3], boots: "#4a3426", skin: sk, hat: v % 4 === 0 ? "cap" : "hair", cap: "#c8302e", hair: ["#4a3020", "#2a201a", "#c89a4a"][v % 3], ...(v % 3 === 2 ? { moustache: "#4a3020" } : {}) }; };

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[0];
function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const [bx, , bz] = BEACH, b_ = (x, y, z) => [bx + x, y, bz + z];
  const day = { light: "day", sunAz: 200, sunEl: 48, fogFar: 2200 };
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const G = 0.10, GL = 0.13;             // sand / parking lot
  const crest = (z) => 2.6 + 0.15 * Math.max(0, 1 - Math.abs(z - 23) / 3);
  const ppl = (out, i, o, x, y, z, opt = {}) => out.places.push(pl(i, o, bx + x, y, bz + z, opt));
  const fx = (out, key, draw, x, y, z, w, h, o = {}) => fxCard(out, key, draw, bx + x, y, bz + z, w, h, o);
  const mk = (out, s, x, y, z, u, size, col) => mark(out, s, bx + x, y, bz + z, u, size, col);
  const wd = (out, s, col, x, y, z, u, w) => word(out, s, col, bx + x, y, bz + z, u, w);
  const tag = (out, key, a, b, col, x, y, z, u, w = 1.1, nrm = [0, 0, 1]) => { if (u > 0) sign(out, key, (p) => DR.nameTag(p, a, b, col), 1024, 256, bx + x, y, bz + z, w * u, w * 0.25 * u, nrm, "basic"); };
  const burst = (out, key, c0, c1, x, y, z, s, t) => fx(out, key, (p) => DR.burst(p, c0, c1), x, y, z, s, s, { cw: 512, ch: 512, kind: "basic", rot: t * 0.5 });
  const confetti = (out, c, t) => { const k = Math.floor(t * 12) % 24; screenCard(out, c, "conf" + k, (p) => DR2.confetti(p, k), 0.5, 576, 1024, "basic"); };
  const shadowL = (out, x, gy, z, w) => shadowAt(out, bx + x, gy, bz + z, w);
  // big set pieces
  const whale = (out, blown = false, x = 0, z = 0, w = 14) => { fx(out, blown ? "whaleB" : "whale", (p) => drawWhale(p.g, { blown }), x, G + w * 0.25 - w * 0.5 * (22 / 512), z, w, w / 2, { cw: 1024, ch: 512, kind: "lit", normal: [0, 0, 1] }); shadowL(out, x, G, z + 0.5, w * 0.95); };
  const crates = (out, n = 20, x = 1.2, z = 1.4, w = 5) => { if (n > 0) fx(out, "crates" + n, (p) => drawCrates(p.g, n), x, G + w * 0.25 - w * 0.5 * (12 / 512), z, w, w / 2, { cw: 1024, ch: 512, kind: "lit", normal: [0, 0, 1] }); };
  const plunger = (out, u, x, z, h = 0.9) => fx(out, "plg" + Math.round(u * 8), (p) => drawPlunger(p.g, Math.round(u * 8) / 8), x, G + h / 2 - 0.01, z, h / 2, h, { cw: 256, ch: 512, kind: "lit" });
  const gull = (out, k, mood, x, y, z, s = 0.7, rot = 0) => fx(out, "gull" + (k % 4) + mood, (p) => drawGull(p.g, k % 4, mood), x, y, z, s, s, { cw: 256, ch: 256, kind: "lit", rot });
  const blob = (out, v, x, y, z, s, rot) => fx(out, "blob" + (v % 4), (p) => drawBlob(p.g, v % 4), x, y, z, s, s, { cw: 128, ch: 128, kind: "lit", rot });
  const splat = (out, x, z, s, gy = G) => fx(out, "splat", (p) => drawSplat(p.g), x, gy + 0.015, z, s, s / 2, { cw: 256, ch: 128, kind: "lit", flat: true });
  const pf = (out, kind, k, x, y, z, s) => { const kk = Math.max(0, Math.min(6, Math.floor(k))); fx(out, "pf" + kind + kk, (p) => drawPuff(p.g, kk, kind), x, y, z, s, s, { cw: 256, ch: 256, kind: "basic" }); };
  const car70 = (out, x, z, o = {}, w = 5.2, gy = GL) => { fx(out, "car70" + (o.crushed ? "c" : "") + (o.col || "") + (o.tag ? "t" : ""), (p) => drawCar70(p.g, o), x, gy + w / 4 - w * 0.5 * (12 / 512), z, w, w / 2, { cw: 1024, ch: 512, kind: "lit", normal: [0, 0, 1] }); shadowL(out, x, gy, z, w * 0.95); };
  const crowdDune = (out, e, t, n = 16, x0 = -12, x1 = 12) => { for (let k = 0; k < n; k++) { const row = k % 2, x = x0 + (k / (n - 1)) * (x1 - x0) + row * 0.7, z = 22.4 + row * 1.4 - (k % 3) * 0.3;
    const hit = e > 0.25, up = Math.sin(t * 7 + k) > 0;
    ppl(out, 200 + k, FOLK(k), x, crest(z), z, hit ? { expr: k % 2 ? "shock" : "gasp", arms: { l: ["head", 1], r: ["head", 1] }, headTilt: Math.sin(t * 9 + k) * 4 }
      : { expr: k % 3 ? "grin" : "laugh", arms: k % 2 ? { l: [up ? "up" : "overhead", 1], r: [up ? "overhead" : "up", 1] } : { r: ["point", 1] } }); } };
  // the blast: e = seconds since the dynamite went off (nothing when e < 0)
  const CH = []; for (let i = 0; i < 30; i++) { const a = hh(i, 1) * two, sp = 4 + hh(i, 2) * 9; CH.push({ x: (hh(i, 3) - 0.5) * 9, y: 3 + hh(i, 4) * 2, vx: Math.cos(a) * sp * 0.8, vz: Math.abs(Math.sin(a)) * sp * 0.9 + 1.5, vy: 9 + hh(i, 5) * 10, s: 0.35 + hh(i, 6) * 0.8, spin: (hh(i, 7) - 0.5) * 9 }); }
  const blast = (out, e, o = {}) => { if (e < 0) return; const gz = 0.6;
    if (e < 0.5) fx(out, "boomB", (p) => DR3.boom(p, "#fff27a", "#ff8a2a"), 0, 4, 1.8, (5 + e * 14) * (1 - e * 0.8), (5 + e * 14) * (1 - e * 0.8), { cw: 512, ch: 512, kind: "basic", rot: e * 3 });
    // fireball turning to smoke, and the sand column
    for (let i = 0; i < 10; i++) { const a = i * 0.63, r = 1.0 + e * 2.0, y = 4 + Math.min(e, 3) * (2.6 + i * 0.9); pf(out, e < 0.6 + i * 0.04 ? "fire" : "smoke", e * 6 + i * 0.3, Math.cos(a) * r, y, gz + Math.sin(a) * 1.2, 1.8 + Math.min(e, 3) * 1.6); }
    for (let i = 0; i < 12; i++) { const a = i * 0.9, h = Math.min(1, e / 1.4) * (6 + i * 1.9); pf(out, "sand", e * 4 + i * 0.5, Math.cos(a) * (2 + i * 0.25) + (i % 3 - 1) * 2, 2 + h, gz - 0.5 + Math.sin(a) * 1.2, 2.2 + i * 0.25 + Math.min(e, 3) * 1.0); }
    if (o.chunks !== false) for (let i = 0; i < CH.length; i++) { const c = CH[i], y = c.y + c.vy * e - 0.5 * 7.5 * e * e; if (y < 0.2) continue; blob(out, i, c.x + c.vx * e, y, gz + c.vz * e, c.s, c.spin * e); } };
  const landed = (out, e, zmin = 1, zmax = 30) => { for (let i = 0; i < CH.length; i++) { const c = CH[i], tl = (c.vy + Math.sqrt(c.vy * c.vy + 2 * 7.5 * (c.y - 0.2))) / 7.5; if (e < tl) continue; const z = 0.6 + c.vz * tl; if (z < zmin || z > zmax) continue; splat(out, c.x + c.vx * tl, z, c.s * 1.6, z > 20 && z < 26 ? crest(z) : G); } };

  // ---- the hero (shot 1 and the loop): the whale going up, two spectators on the sand in the foreground in total shock
  const E0 = 0.45, HE = (t) => (t < 5 ? t + E0 : t - END + E0);
  const hero = (t, out) => { const e = HE(t), hit = e > 0.08;
    whale(out, e > 0.05); crates(out, e > 0 ? 0 : 20); blast(out, e);
    ppl(out, 1, FOLK(1), 1.9, G, 9.0, hit ? { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] }, headTilt: Math.sin(e * 9) * 5 } : { expr: "grin", arms: { r: ["point", 1] } });
    ppl(out, 2, CAMM, 3.6, G, 9.3, hit ? { expr: "gasp", arms: { l: ["up", 1], r: ["up", 1] }, tilt: -4 } : { expr: "smile", extra: XL.tvcam() });
    mk(out, "!!", 2.75, 2.2, 9.2, (e - 0.1) * 3, 0.4); };
  const heroCam = push(b_(3.2, 2.2, 13.2), b_(1.6, 3.2, 0), b_(3.0, 2.15, 12.4), b_(1.6, 3.3, 0), 54, 2.0);
  // 1 They blew up a dead whale…: the blast, already flying on frame 0
  shot({ a: 0, ...day, cam: heroCam, cInf: 1.2, focus: b_(2.6, 1.5, 9.0), shadowR: 18, stage(t, out) { hero(t, out); } });
  kick1(0.05);
  // 2 with dynamite.: close on the engineer, sly grin, waving a bundle of red sticks; the crates behind him
  const EX = 6, EZ = 4.5;
  shot({ at: S("with dynamite"), ...day, cam: push(b_(EX + 0.4, 1.55, EZ + 2.6), b_(EX, 1.5, EZ), b_(EX + 0.3, 1.55, EZ + 2.2), b_(EX, 1.52, EZ), 46, 1.4), cInf: 2, focus: b_(EX, 1.5, EZ), shadowR: 10,
    stage(t, out) { whale(out); crates(out, 20, 2.5, 2.2); ppl(out, 3, ENG, EX, G, EZ, { expr: "sly", arms: { r: ["shoulder", 1], l: ["hips", 1] }, extra: XL.stick(), headTilt: Math.sin(t * 6) * 3 });
      wd(out, "DYNAMITE!", "#d8333a", EX + 0.1, 2.35, EZ + 0.2, (t - T("dynamite") + 0.05) * 2.5, 1.1); } });
  // 3 A giant whale washed up on the beach…: sliding along the whale on the sand, a wave washing in
  shot({ at: S("A giant"), ...day, cam: (l) => ({ pos: b_(8 - l * 2.2, 1.6, 10.5), look: b_(2 - l * 1.6, 2.4, 0), fov: 58, roll: 0 }), cInf: 0.8, focus: b_(0, 2, 0), shadowR: 20,
    stage(t, out) { whale(out); const u = smooth((t - T("washed")) / 0.35);
      tag(out, "tagWhale", "SPERM WHALE", "WASHED UP!", "#2f4f9a", 1.2, 0.8 + 0.3 * u, 4.5, u, 2.6);
      wd(out, "SPLOOSH", "#2f6ad8", -3.5, 5.6, 0.5, (t - T("beach") + 0.05) * 2.5, 2.2); } });
  // 4 and it stank.: a beachgoer pinching his nose, flies and green stink lines everywhere
  const NX = -3, NZ = 5.0;
  shot({ at: S("and it stank"), ...day, cam: push(b_(NX + 0.3, 1.5, NZ + 2.7), b_(NX - 0.2, 1.6, NZ - 2), b_(NX + 0.25, 1.5, NZ + 2.3), b_(NX - 0.2, 1.62, NZ - 2), 48, 1.4), cInf: 1.6, focus: b_(NX, 1.5, NZ), shadowR: 10,
    stage(t, out) { whale(out); const ts = T("stank");
      ppl(out, 4, FOLK(2), NX, G, NZ, { expr: t > ts ? "pained" : "worried", arms: { r: ["face", 1], l: ["low", 1] }, tilt: t > ts ? -6 : 0, headTilt: Math.sin(t * 12) * 3 });
      for (let i = 0; i < 4; i++) { const a = t * 5 + i * 1.6, k = Math.floor(t * 20 + i) % 2; fx(out, "fly" + k, (p) => DR2.fly(p, k), NX + 0.2 + Math.cos(a) * 0.5, 1.8 + Math.sin(a * 1.3) * 0.3, NZ + 0.2 + Math.sin(a) * 0.15, 0.13, 0.13, { cw: 128, ch: 128, kind: "basic" }); }
      for (let i = 0; i < 3; i++) { const k2 = (Math.floor(t * 8) + i) % 4; fx(out, "stink" + k2, (p) => DR2.stink(p, k2), NX - 1.4 + i * 0.9, 1.4 + i * 0.2, NZ - 2.5, 1.1, 1.1, { cw: 256, ch: 256, kind: "basic" }); }
      wd(out, "PEE-YOO!", "#7a9a3a", NX + 0.5, 2.3, NZ + 0.2, (t - ts) * 2.5, 1.0); } });
  kick1(T("stank") + 0.03);
  // 5 So the highway guys…: two hard-hat workers stare at the whale, scratching their heads; HIGHWAY DIVISION tag
  shot({ at: S("So the"), ...day, cam: push(b_(5.2, 1.3, 9.0), b_(3.4, 1.6, 3.5), b_(4.8, 1.3, 8.2), b_(3.4, 1.62, 3.5), 50, 1.6), cInf: 1.4, focus: b_(3.6, 1.4, 5.5), shadowR: 12,
    stage(t, out) { whale(out);
      ppl(out, 3, ENG, 3.0, G, 5.4, { expr: "worried", arms: { r: ["head", 1] }, headTilt: Math.sin(t * 4) * 5 });
      ppl(out, 5, WRK(1), 4.3, G, 5.6, { expr: "nervous", arms: { l: ["head", 1], r: ["hips", 1] }, headTilt: -Math.sin(t * 4) * 5 });
      tag(out, "tagHwy", "THE HIGHWAY GUYS", "OREGON HIGHWAY DIVISION", "#e8742a", 4.0, 0.55, 6.6, smooth((t - T("highway") + 0.1) / 0.3), 1.3); } });
  // 6 had a brilliant plan.: close on the engineer: a light bulb pops on over his head, a big grin
  shot({ at: S("had a brilliant"), ...day, cam: push(b_(3.15, 1.62, 7.3), b_(3.0, 1.62, 5.4), b_(3.12, 1.62, 7.0), b_(3.0, 1.64, 5.4), 44, 1.2), cInf: 2.5, focus: b_(3.0, 1.6, 5.4), shadowR: 8,
    stage(t, out) { whale(out); const tb = T("brilliant"), u = smooth((t - tb + 0.1) / 0.2);
      ppl(out, 3, ENG, 3.0, G, 5.4, { expr: t > tb ? "grin" : "worried", arms: t > tb ? { r: ["point", 1] } : { r: ["head", 1] } });
      if (u > 0) fx(out, "bulb", DR3.bulb, 3.0, 2.25 + 0.04 * Math.sin(t * 9), 5.45, 0.5 * u, 0.5 * u, { cw: 256, ch: 256, kind: "basic" });
      mk(out, "DING!", 3.45, 2.25, 5.5, (t - tb) * 2.5, 0.32, "#ffd23a"); } });
  // 7 Blow it to bits…: the engineer throws his arms up, a little cartoon KABOOM over the whale
  shot({ at: S("Blow it"), ...day, cam: push(b_(5.5, 1.4, 10.5), b_(1.5, 2.6, 0), b_(5.2, 1.4, 9.8), b_(1.5, 2.6, 0), 52, 1.3), cInf: 1, focus: b_(3, 1.4, 5.4), shadowR: 14,
    stage(t, out) { whale(out); crates(out, 20, 2.5, 2.2);
      ppl(out, 3, ENG, 3.0, G, 5.4, { expr: "laugh", arms: { l: ["overhead", 1], r: ["overhead", 1] }, sq: 1 + 0.03 * Math.sin(t * 14) });
      wd(out, "KABOOM?", "#ff8a2a", 0.5, 5.2, 1.5, (t - T("bits") + 0.05) * 2.5, 3.0); } });
  // 8 and let the seagulls eat the rest.: seagulls circling over the whale, one landing with a bib-hungry grin; YUM?
  shot({ at: S("and let"), ...day, cam: push(b_(-4, 1.8, 11), b_(-1, 4.2, 0), b_(-3.6, 1.9, 10.2), b_(-1, 4.4, 0), 54, 2.0), cInf: 0.8, focus: b_(-1, 4, 0), shadowR: 16,
    stage(t, out) { whale(out);
      for (let i = 0; i < 6; i++) { const a = t * (1.2 + i * 0.1) + i * 1.05, k = Math.floor(t * 8 + i); gull(out, k, "calm", -2.5 + Math.cos(a) * (1.6 + i * 0.25), 4.6 + Math.sin(a * 1.4) * 0.4 + i * 0.2, 5 + Math.sin(a) * 1.2, 1.1, Math.sin(a) * 0.2); }
      wd(out, "YUM?", "#2f6ad8", -2.2, 6.4, 5.5, (t - T("eat") + 0.05) * 2.5, 2.2); } });
  // 9 One man with army demolition training: Walt strides in, hands on hips; the tag slams in
  const WX = -1.6, WZ = 6.0;
  shot({ at: S("One man"), ...day, cam: (l) => ({ pos: b_(WX + 0.4 - l * 0.4, 1.35, WZ + 3.3), look: b_(WX - l * 0.4, 1.35, WZ), fov: 46, roll: 0 }), cInf: 2, focus: b_(WX, 1.3, WZ), shadowR: 10,
    stage(t, out) { const l = t - S("One man"), x = WX + 1.2 - Math.min(l, 0.9) * 1.6; whale(out);
      ppl(out, 6, WALT, x, G, WZ, l < 0.9 ? { dir: [-1, 0], mode: "march", phase: (t * 2) % 1, expr: "stern" } : { expr: "suspicious", arms: { l: ["hips", 1], r: ["hips", 1] } });
      tag(out, "tagWalt", "ARMY DEMOLITION VET", "HE KNOWS EXPLOSIVES", "#5a7a3a", WX - 0.4, 0.55, WZ + 0.4, smooth((t - T("army") + 0.1) / 0.3), 1.2); } });
  // 10 warned them. Bad idea.: Walt wags his finger at the engineer, who just shrugs; BAD IDEA!
  shot({ at: S("warned them"), ...day, cam: push(b_(0.4, 1.45, WZ + 5.2), b_(0.4, 1.35, WZ), b_(0.4, 1.45, WZ + 4.6), b_(0.4, 1.37, WZ), 46, 1.6), cInf: 1.8, focus: b_(0.4, 1.4, WZ), shadowR: 10,
    stage(t, out) { whale(out); const tb = T("Bad");
      ppl(out, 6, WALT, -0.4, G, WZ, { expr: t > tb - 0.2 ? "angry" : "stern", arms: { r: ["point", 1], l: ["hips", 1] }, headTilt: Math.sin(t * 10) * 3 });
      ppl(out, 3, ENG, 1.2, G, WZ - 0.1, { expr: t > tb ? "bored" : "smile", arms: t > tb ? { l: ["shrug", 1], r: ["shrug", 1] } : { l: ["hips", 1] } });
      wd(out, "BAD IDEA!", "#d8333a", -0.5, 2.35, WZ + 0.3, (t - tb + 0.05) * 2.5, 1.2); } });
  kick1(T("Bad") + 0.03);
  // 11 They used half a ton anyway.: workers trot in with crates, the pile grows against the whale; HALF A TON!
  shot({ at: S("They used"), ...day, cam: push(b_(6.5, 1.5, 9.5), b_(1.5, 1.8, 1.4), b_(6.0, 1.5, 8.8), b_(1.5, 1.85, 1.4), 52, 1.8), cInf: 1.2, focus: b_(2.5, 1.4, 3), shadowR: 14,
    stage(t, out) { whale(out); const l = t - S("They used"), n = Math.min(20, 8 + Math.floor(l * 9)); crates(out, n, 1.2, 1.4);
      for (let k = 0; k < 3; k++) { const v = (l * 0.8 + k / 3) % 1; ppl(out, 7 + k, WRK(k), 6 - v * 3.2, G, 3.4 + k * 0.6, { dir: [-1, 0], view: "side", mode: "march", stride: 0.6, phase: (t * 2.2 + k * 0.3) % 1, expr: ["grin", "nervous", "laugh"][k], arms: { l: ["hold", 1], r: ["hold", 1] }, extra: XL.crate() }); }
      board(out, "bHalf", "HALF A TON!", "OF DYNAMITE", "#d8333a", bx + 2.5, 4.9, bz + 2.0, (t - T("half") + 0.1) * 1.5, 3.2); } });
  kick1(T("ton") + 0.03);
  // 12 Oregon, 1970.: a painted banner on the dune, the crowd arriving behind it
  shot({ at: S("Oregon"), ...day, cam: push(b_(1.5, 4.0, 7.5), b_(0.5, 3.6, 23), b_(1.3, 4.0, 8.4), b_(0.5, 3.6, 23), 54, 2.0), cInf: 0.8, focus: b_(0.5, 3.4, 20), shadowR: 18,
    stage(t, out) { const u = smooth((t - T("Oregon") + 0.1) / 0.35); crowdDune(out, -1, t, 12, -7, 7);
      if (u > 0) sign(out, "bnOre", (p) => DR2.banner(p, "OREGON, 1970", "#c8302e"), 1024, 256, bx + 0.5, 3.2 + (1 - u) * 1.0 + 0.05 * Math.sin(t * 3), bz + 17.6, 4.6, 1.15, [0, 0, -1], "lit"); } });
  // 13 Crowds lined the dunes to watch.: the crowd on the dune crest cheering, a TV cameraman filming
  shot({ at: S("Crowds"), ...day, cam: push(b_(3, 4.2, 9.5), b_(1.0, 3.8, 23), b_(2.2, 4.2, 10.4), b_(0.2, 3.8, 23), 54, 2.2), cInf: 0.8, focus: b_(1, 3.6, 22), shadowR: 18,
    stage(t, out) { crowdDune(out, -1, t, 16, -10, 10); ppl(out, 2, CAMM, 3.6, crest(21.2), 21.2, { expr: "smile", extra: XL.tvcam() });
      wd(out, "WOOO!", "#ff5a7a", -2, 5.6, 21.5, (t - T("lined") + 0.05) * 2.5, 1.8); } });
  // 14 Then…: close on the plunger: the engineer grips the handle, the crowd counting behind him
  const PX = 9, PZ = 11;
  shot({ at: S("Then"), ...day, cam: push(b_(PX + 0.5, 1.0, PZ + 2.2), b_(PX, 0.9, PZ), b_(PX + 0.45, 0.95, PZ + 1.9), b_(PX, 0.85, PZ), 48, 0.9), cInf: 2.5, focus: b_(PX, 0.8, PZ), shadowR: 8,
    stage(t, out) { const tb = T("BOOM"), u = t < tb - 0.05 ? 1 : clamp01(1 - (t - tb + 0.05) / 0.12);
      plunger(out, u, PX, PZ + 0.3); ppl(out, 3, ENG, PX + 0.35, G, PZ, { expr: t > tb ? "laugh" : "sly", arms: { l: ["low", 1], r: ["low", 1] }, sq: t > tb ? 0.96 : 1 }); } });
  // 15 BOOM.: the wide blast from the beach: fireball, sand, flying blubber
  shot({ at: T("BOOM") + 0.04, ...day, cam: push(b_(11, 1.4, 16), b_(0.5, 5, 0), b_(11.6, 1.4, 17.0), b_(0.5, 6, 0), 58, 0.7), cInf: 0.5, focus: b_(0, 4, 0), shadowR: 22,
    stage(t, out) { const e = t - T("BOOM"); whale(out, e > 0.06); crates(out, e > 0.02 ? 0 : 20); blast(out, e);
      wd(out, "BOOM!", "#ff6a1a", 0.5, 9.2, 3, e * 3, 5.0); } });
  kick1(T("BOOM") + 0.05); last().kicks.push(T("BOOM") + 0.3);
  // 16 The sand flew sky high…: looking up the rising column of sand and smoke
  shot({ at: S("The sand"), ...day, cam: push(b_(4, 1.0, 14), b_(0.5, 6, 0), b_(3.6, 1.0, 13.2), b_(0.5, 13, 0), 62, 2.0), cInf: 0.4, focus: b_(0, 8, 0), shadowR: 22,
    stage(t, out) { const e = t - T("BOOM"); whale(out, true); blast(out, e); wd(out, "WHOOSH!", "#c9a24a", 2, 13, 2, (t - T("sky") + 0.05) * 2.5, 4.0); } });
  // 17 and then it rained whale.: on the dune: blubber pelts the crowd, everybody covers their heads
  shot({ at: S("and then"), ...day, cam: push(b_(2.5, 3.7, 29.5), b_(0.5, 3.6, 22), b_(2.4, 3.8, 28.6), b_(0.5, 3.4, 22), 56, 1.6), cInf: 1, focus: b_(0.5, 3.5, 23), shadowR: 16,
    stage(t, out) { const e = t - T("BOOM"); crowdDune(out, 1, t, 14, -7, 7);
      for (let i = 0; i < 16; i++) { const v = ((t - S("and then")) * 1.1 + hh(i, 3)) % 1, x = -7 + hh(i, 1) * 14, z = 21 + hh(i, 2) * 3; blob(out, i, x, 9 - v * 7, z, 0.4 + hh(i, 4) * 0.4, t * 3 + i); }
      wd(out, "SPLAT!", "#c8302e", 1, 6.4, 22, (t - T("rained") + 0.05) * 2.5, 2.2); } });
  kick1(T("whale", T("rained")) + 0.02);
  // 18 Rotten blubber splattered everyone.: close: a spectator gets hit, splat after splat
  const SX = -1.5, SZ = 22.6;
  shot({ at: S("Rotten"), ...day, cam: push(b_(SX + 0.2, crest(SZ) + 1.6, SZ + 2.6), b_(SX, crest(SZ) + 1.55, SZ), b_(SX + 0.2, crest(SZ) + 1.6, SZ + 2.2), b_(SX, crest(SZ) + 1.57, SZ), 46, 1.4), cInf: 2.2, focus: b_(SX, crest(SZ) + 1.5, SZ), shadowR: 8,
    stage(t, out) { const l = t - S("Rotten"), n = Math.floor(l * 4.2);
      ppl(out, 10, xo(FOLK(4), "sp" + Math.min(6, n)), SX, crest(SZ), SZ, { expr: n > 0 ? (n % 2 ? "pained" : "spit") : "shock", arms: { l: ["shrug", 1], r: ["shrug", 1] }, headTilt: Math.sin(t * 20) * (n > 0 ? 4 : 0), extra: XL.splat(n) });
      wd(out, n > 2 ? "EWWW!" : "SPLAT!", "#c8302e", SX + 0.45, crest(SZ) + 2.25, SZ + 0.3, ((l * 4.2) % 1) * 3, 0.9); } });
  // 19 People ran screaming.: the crowd stampedes over the dune towards the camera, blubber still falling
  shot({ at: S("People"), ...day, cam: (l) => ({ pos: b_(0.5, 2.0, 33 + l * 1.5), look: b_(0.2, 2.6, 22 + l * 1.5), fov: 54, roll: Math.sin(l * 9) * 0.01 }), cInf: 1, focus: b_(0, 2.5, 27), shadowR: 14,
    stage(t, out) { const l = t - S("People");
      for (let k = 0; k < 9; k++) { const z = 22 + hh(k, 5) * 2 + l * (3.0 + hh(k, 6)), x = -4 + k * 1.0 + (hh(k, 7) - 0.5); const y = z < 26 ? crest(z) : Math.max(G, 2.6 - (z - 26) * 0.43);
        ppl(out, 20 + k, FOLK(k + 3), x, y, z, { dir: [0, 1], mode: "march", phase: (t * 2.8 + hh(k, 8)) % 1, lift: 100, expr: k % 2 ? "shock" : "gasp", arms: k % 3 ? { l: ["up", 1], r: ["up", 1] } : { l: ["head", 1], r: ["head", 1] } }); }
      for (let i = 0; i < 8; i++) { const v = (l * 1.3 + hh(i, 3)) % 1; blob(out, i, -4 + hh(i, 1) * 8, 7 - v * 6, 22 + hh(i, 2) * 6 + l * 2, 0.4 + hh(i, 4) * 0.3, t * 3 + i); }
      wd(out, "AAAAH!", "#d8333a", 0.3, 4.6, 26 + l * 2.2, (t - T("ran") + 0.05) * 2.5, 1.8); } });
  // 20 And the seagulls?: the sky over the beach: one gull hovers, looking around; ?
  shot({ at: S("And the seagulls"), ...day, cam: push(b_(2, 3.2, 12), b_(0, 7.5, 2), b_(2, 3.3, 11.4), b_(0, 7.7, 2), 50, 1.0), cInf: 0.6, focus: b_(0, 7.5, 2), shadowR: 16,
    stage(t, out) { const k = Math.floor(t * 8); gull(out, k, "calm", 0.3 + Math.sin(t * 2) * 0.3, 7.5 + Math.sin(t * 3) * 0.15, 5.5, 2.4); pf(out, "smoke", 4 + t % 2, -2.5, 6, -1, 4); pf(out, "smoke", 5, 3, 5, -2, 5);
      mk(out, "?", 1.5, 8.5, 5.6, (t - T("seagulls", 31)) * 2.5, 0.9); } });
  // 21 Scared away by the boom.: the gulls bolt, screaming, wings flapping like mad; NOPE!
  shot({ at: S("Scared"), ...day, cam: push(b_(2, 3.2, 11.4), b_(0, 7.6, 2), b_(2, 3.3, 10.6), b_(-1, 8.6, 2), 50, 1.8), cInf: 0.6, focus: b_(0, 7.5, 2), shadowR: 16,
    stage(t, out) { const l = t - S("Scared");
      for (let i = 0; i < 7; i++) { const k = Math.floor(t * 18 + i), d = l * (4 + i * 0.7); gull(out, k, "scared", 0.3 + (i - 3) * 0.7 - d * (i % 2 ? 1 : -0.6), 7.4 + (i % 3) * 0.5 + d * 0.5, 5.5 - i * 0.3, i ? 1.4 : 2.2, Math.sin(t * 20 + i) * 0.2); }
      wd(out, "NOPE!", "#d8333a", 0.3, 9.0, 5.0, (t - T("away") + 0.05) * 2.5, 2.4); } });
  // 22 Most of the whale… was still lying there.: the smoke clears: the whale, mostly still there; workers stare
  shot({ at: S("Most of"), ...day, cam: push(b_(6, 1.5, 11), b_(0.5, 2.6, 0), b_(5.4, 1.5, 10.0), b_(0.5, 2.6, 0), 54, 2.2), cInf: 1, focus: b_(2.5, 1.5, 5.8), shadowR: 18,
    stage(t, out) { whale(out, true); landed(out, 9, 1, 14);
      for (let i = 0; i < 5; i++) { const v = (t * 0.4 + i / 5) % 1; pf(out, "smoke", 3 + v * 3, -3 + i * 1.6, 3 + v * 4, 0.5, 2 + v * 2); }
      ppl(out, 3, ENG, 2.0, G, 5.8, { expr: "nervous", arms: { r: ["head", 1] } }); ppl(out, 5, WRK(1), 3.3, G, 6.0, { expr: "shock" }); ppl(out, 7, WRK(2), 4.4, G, 5.6, { expr: "worried", arms: { l: ["shrug", 1], r: ["shrug", 1] } });
      wd(out, "...OOPS", "#6a6e78", 2.5, 2.5, 6.3, (t - T("still")) * 2.0, 1.4); } });
  // 23 But wait, it gets worse.: close on the engineer, a red warning burst behind him
  shot({ at: S("But wait"), ...day, cam: push(b_(2.05, 1.6, 7.6), b_(2.0, 1.6, 5.8), b_(2.05, 1.6, 7.3), b_(2.0, 1.62, 5.8), 44, 1.4), cInf: 2.5, focus: b_(2.0, 1.6, 5.8), shadowR: 8,
    stage(t, out) { burst(out, "burstW", "#ff5a4a", "#ffb02a", 2.0, 1.6, 4.9, 5.0, t); ppl(out, 3, ENG, 2.0, G, 5.8, { expr: "gasp", arms: { l: ["face", 1], r: ["face", 1] }, headTilt: Math.sin(t * 25) * 2 });
      mk(out, "UH-OH", 2.55, 2.2, 5.9, (t - T("worse")) * 2.5, 0.5, "#ffffff"); } });
  // 24 One huge chunk flew over the dunes…: from the parking lot: a giant lump of blubber sails over the dune crest at us
  const CX = 4, CZ = 44;
  const chunkPos = (u) => [lerp(-3, CX, u), lerp(9, 3.0, u) + Math.sin(u * Math.PI) * 4, lerp(18, CZ, u)];
  shot({ at: S("One huge"), ...day, cam: push(b_(7, 1.4, 51), b_(1, 4.2, 30), b_(6.6, 1.4, 50.2), b_(2, 4.0, 30), 56, 1.9), cInf: 0.8, focus: b_(2, 3, 36), shadowR: 22,
    stage(t, out) { const l = t - S("One huge"), u = clamp01(l / 1.7) * 0.9, [x, y, z] = chunkPos(u);
      car70(out, CX, CZ, { tag: true }); car70(out, -4, CZ, { col: "#c8a03a" }); car70(out, 12, CZ + 10, { col: "#a83a3a" });
      blob(out, 1, x, y, z, 2.0, l * 4); for (let i = 0; i < 3; i++) blob(out, i + 5, x + 0.8 * Math.cos(i * 2), y + 0.6 * Math.sin(i * 2), z - 0.5, 0.35, l * 6);
      mk(out, "!!", x + 1.2, y + 1.2, z, (t - T("chunk")) * 2.5, 0.9); } });
  // 25 and flattened a brand-new car.: CRUNCH! the chunk drops on the new car, the roof caves in
  shot({ at: S("and flattened"), ...day, cam: push(b_(CX + 1.5, 1.4, CZ + 6.5), b_(CX, 1.3, CZ), b_(CX + 1.3, 1.35, CZ + 5.8), b_(CX, 1.3, CZ), 50, 1.4), cInf: 1.4, focus: b_(CX, 1.2, CZ), shadowR: 12,
    stage(t, out) { const th = T("flattened") + 0.05, hit = t > th, u = clamp01((t - th + 0.25) / 0.25), sh = hit ? Math.sin(t * 60) * 0.03 * Math.max(0, 1 - (t - th) * 3) : 0;
      car70(out, CX + sh, CZ, { crushed: hit, tag: !hit }); car70(out, CX - 8, CZ, { col: "#c8a03a" });
      blob(out, 1, CX + 0.2, hit ? GL + 1.75 : lerp(7, 2.0, u), CZ + 0.2, 1.6, hit ? 0.2 : t * 4);
      if (hit) { for (let i = 0; i < 5; i++) blob(out, i + 4, CX - 1.5 + i * 0.8, GL + 0.6 + ((t - th) * 3 + i * 0.2) % 1.2, CZ + 0.6, 0.3, t * 5 + i); wd(out, "CRUNCH!", "#d8333a", CX, 3.6, CZ + 0.5, (t - th) * 3, 2.2); } } });
  kick1(T("flattened") + 0.07); last().kicks.push(T("flattened") + 0.22);
  // 26 Whose car?: close on the flattened car, blubber on the roof; ?
  shot({ at: S("Whose"), ...day, cam: push(b_(CX - 1.2, 1.9, CZ + 3.4), b_(CX, 1.3, CZ), b_(CX - 1.0, 1.85, CZ + 3.0), b_(CX, 1.32, CZ), 48, 1.0), cInf: 2, focus: b_(CX, 1.3, CZ), shadowR: 10,
    stage(t, out) { car70(out, CX, CZ, { crushed: true }); blob(out, 1, CX + 0.2, GL + 1.75, CZ + 0.2, 1.6, 0.2);
      for (let i = 0; i < 3; i++) { const v = (t * 0.6 + i / 3) % 1; pf(out, "smoke", 2 + v * 4, CX - 1 + i, 2 + v * 1.5, CZ + 0.3, 0.8 + v); }
      mk(out, "?", CX + 1.4, 2.8, CZ + 0.5, (t - T("Whose")) * 2.5, 0.8); } });
  // 27 The guy who warned them.: Walt in front of his flattened car, jaw on the floor
  shot({ at: S("The guy"), ...day, cam: push(b_(CX + 0.2, 1.5, CZ + 4.6), b_(CX + 0.3, 1.45, CZ + 1.6), b_(CX + 0.2, 1.5, CZ + 4.1), b_(CX + 0.3, 1.47, CZ + 1.6), 46, 1.8), cInf: 1.5, focus: b_(CX + 0.3, 1.4, CZ + 1.6), shadowR: 10,
    stage(t, out) { car70(out, CX, CZ, { crushed: true }); blob(out, 1, CX + 0.2, GL + 1.75, CZ + 0.2, 1.6, 0.2);
      ppl(out, 6, WALT, CX + 0.3, GL, CZ + 1.6, { expr: t > T("warned", T("guy")) ? "shock" : "gasp", arms: { l: ["head", 1], r: ["head", 1] }, sq: 1 + 0.02 * Math.sin(t * 20) });
      tag(out, "tagWalt2", "THE GUY WHO WARNED THEM", "HIS BRAND-NEW CAR", "#5a7a3a", CX + 0.3, 0.55, CZ + 2.0, smooth((t - T("guy") + 0.1) / 0.3), 1.3); } });
  kick1(T("warned", T("guy")) + 0.03);
  // 28 He had just bought it…: days earlier, all smiles: Walt jingles the keys by the shiny new car under bunting
  const DX = -10, DZ = 48;
  shot({ at: S("He had"), ...day, cam: push(b_(DX + 0.8, 1.45, DZ + 4.8), b_(DX + 0.4, 1.5, DZ), b_(DX + 0.7, 1.45, DZ + 4.2), b_(DX + 0.4, 1.52, DZ), 48, 1.3), cInf: 1.5, focus: b_(DX + 0.6, 1.4, DZ + 1.4), shadowR: 10,
    stage(t, out) { car70(out, DX, DZ, { tag: true }); ppl(out, 6, WALT, DX + 0.7, GL, DZ + 1.4, { expr: "proud", arms: { r: ["up", 1], l: ["hips", 1] }, extra: XL.keys() });
      for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.57; fx(out, "spark", DR.spark, DX - 1.5 + i * 1.1, 1.6 + Math.sin(a) * 0.3, DZ + 0.5, 0.25, 0.25, { cw: 256, ch: 256, kind: "basic" }); }
      mk(out, "SHINY!", DX - 1.2, 2.6, DZ + 0.6, (t - T("bought")) * 2.5, 0.7, "#ffffff"); } });
  // 29 at a sale called… a whale of a deal.: the dealership banner swings down: A WHALE OF A DEAL!
  shot({ at: S("at a sale"), ...day, cam: push(b_(DX + 0.3, 2.2, DZ + 7.6), b_(DX + 0.3, 3.0, DZ - 1), b_(DX + 0.3, 2.2, DZ + 7.0), b_(DX + 0.3, 3.05, DZ - 1), 54, 1.6), cInf: 1, focus: b_(DX, 3, DZ - 1), shadowR: 12,
    stage(t, out) { const u = smooth((t - T("whale of") + 0.25) / 0.3), k = Math.floor(t * 6) % 2; car70(out, DX, DZ, { tag: true });
      sign(out, "deal" + k, (p) => DR3.deal(p, k), 1024, 512, bx + DX, 3.6 + (1 - u) * 3 + 0.05 * Math.sin(t * 4), bz + DZ - 0.6, 5.0, 2.5, [0, 0, 1], "lit");
      ppl(out, 6, WALT, DX + 1.6, GL, DZ + 1.4, { expr: u > 0.5 ? "laugh" : "proud", arms: { r: ["point", 1] }, extra: XL.keys() }); } });
  kick1(T("deal") + 0.03);
  // 30 Years later,: a YEARS LATER card spins in over the quiet beach
  shot({ at: S("Years"), ...day, cam: push(b_(-6, 1.8, 10), b_(-6, 2.6, 0), b_(-6, 1.9, 9.2), b_(-6, 2.7, 0), 52, 1.5), cInf: 0.5, focus: b_(-6, 2.5, 3), shadowR: 18,
    stage(t, out) { const u = smooth((t - T("Years") + 0.1) / 0.35); if (u > 0) fx(out, "later", DR3.later, -6, 2.6, 4.0, 3.4 * u, 1.7 * u, { cw: 1024, ch: 512, kind: "basic", rot: (1 - u) * 1.2 });
      for (let i = 0; i < 3; i++) { const k = Math.floor(t * 6 + i); gull(out, k, "calm", -8 + i * 2 + t * 0.4 % 2, 5 + i * 0.4, 1 - i, 0.6); } } });
  // 31 the town named a park after it…: townsfolk pull the cloth off the new park sign
  const KX = 14, KZ = 8;
  shot({ at: S("the town"), ...day, cam: push(b_(KX + 1.2, 1.5, KZ + 6.5), b_(KX, 1.8, KZ), b_(KX + 1.0, 1.5, KZ + 5.8), b_(KX, 1.85, KZ), 52, 2.6), cInf: 1, focus: b_(KX, 1.6, KZ + 1), shadowR: 12,
    stage(t, out) { const tp = T("park", T("town")), u = smooth((t - tp + 0.1) / 0.4);
      sign(out, "park", DR3.park, 1024, 640, bx + KX, G + 1.25, bz + KZ, 3.2, 2.0, [0, 0, 1], "lit");
      if (u < 1) fx(out, "cloth", (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); g.fillStyle = "#c8302e"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(10, 20); g.quadraticCurveTo(128, 0, 246, 20); g.lineTo(236, 250); g.quadraticCurveTo(128, 236, 20, 250); g.closePath(); g.fill(); g.stroke(); }, KX + u * 2.5, G + 1.5 - u * 0.6, KZ + 0.15, 3.5, 2.6 * (1 - u * 0.7), { cw: 256, ch: 256, kind: "lit", rot: -u * 0.6 });
      for (let k = 0; k < 4; k++) ppl(out, 30 + k, FOLK(k + 1), KX + (k < 2 ? -2.6 + k * 0.8 : 1.8 + (k - 2) * 0.8), G, KZ + 1.2 + (k % 2) * 0.4, { expr: u > 0.5 ? "laugh" : "grin", arms: u > 0.5 ? { l: ["up", 1], r: ["up", 1] } : { r: ["point", 1] } });
    } });

  // 32 Exploding Whale Memorial Park.: close on the sign, confetti raining
  shot({ at: S("Exploding"), ...day, cam: push(b_(KX - 0.6, 1.5, KZ + 4.6), b_(KX, 1.6, KZ), b_(KX - 0.4, 1.5, KZ + 4.0), b_(KX, 1.62, KZ), 48, 2.4), cInf: 2, focus: b_(KX, 1.5, KZ), shadowR: 10,
    stage(t, out, c) { sign(out, "park", DR3.park, 1024, 640, bx + KX, G + 1.25, bz + KZ, 3.2, 2.0, [0, 0, 1], "lit"); confetti(out, c, t);
      const k = Math.floor(t * 8); gull(out, k, "calm", KX + 1.0, G + 2.6 + Math.sin(t * 3) * 0.1, KZ + 0.3, 0.6); } });
  // 33 Because nobody will ever forget the day…: back on the beach, the same view as shot 1, counting up to the blast (loops)
  shot({ at: S("Because"), ...day, cam: heroCam, cInf: 1.2, focus: b_(2.6, 1.5, 9.0), shadowR: 18, loop: true, stage(t, out) { hero(t, out); } });
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
