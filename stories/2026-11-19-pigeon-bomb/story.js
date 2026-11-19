// Shot plan for "Pigeons Flew This Bomb" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Project Pigeon (B. F. Skinner, 1943-44; Navy Project Orcon 1948-53; Ig Nobel Peace Prize 2024): pigeons in the nose of a glide bomb pecked
// at the target image on a screen to steer it; three birds so the majority wins; trained with grain.
// Hook-first (the bomb already diving on frame 0), a cut every ~1.5 s, loop ending (the last shot = shot 1 view).
import { ROOM } from "./world.js";
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
const star = (g, x, y, r, fill) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * two, rr = i % 2 ? r * 0.45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } poly(g, pts, fill, 0); };

const DR = {
  nameTag: (p, a, b, col = "#c0353a") => { const g = p.g; g.clearRect(0, 0, 1024, 256); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 40); g.lineTo(984, 40); g.lineTo(940, 128); g.lineTo(984, 216); g.lineTo(40, 216); g.lineTo(84, 128); g.closePath(); g.fill(); g.stroke();
    txt(g, a, 512, 108, 100, "AlfaSlab", "#ffffff", INK, 10, 820); txt(g, b, 512, 186, 46, "AlfaSlab", "#ffe08a", INK, 6, 760); },
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, s.length > 2 ? 110 : 200, "Bangers", col, INK, 14, 240); },
  word: (p, s, col, u) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); const k = 0.7 + 0.3 * Math.min(1, u * 3); g.scale(k, k); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two, r = i % 2 ? 80 : 118; g.lineTo(Math.cos(a) * r * 2, Math.sin(a) * r * 0.9); } g.closePath(); g.fill(); g.stroke(); txt(g, s, 0, 6, 92, "Bangers", col, INK, 10, 400); g.restore(); },
  numBoard: (p, n, label, col) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(30, 30, 964, 452, 40); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.roundRect(56, 56, 912, 400, 28); g.stroke();
    txt(g, n, 512, 210, 230, "Bangers", col, INK, 16, 900); txt(g, label, 512, 380, 110, "Bangers", "#2a2a36", INK, 0, 880); },
  money: (p, s, col) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.fillStyle = "#cfe3b8"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.roundRect(14, 30, 484, 196, 18); g.fill(); g.stroke(); g.strokeStyle = "#5a8a4a"; g.lineWidth = 6; g.beginPath(); g.roundRect(34, 50, 444, 156, 12); g.stroke(); txt(g, s, 256, 134, 130, "AlfaSlab", col, INK, 8, 440); },
  spark: (p, col = "#fffbe8") => { const g = p.g; g.clearRect(0, 0, 256, 256); poly(g, [[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], col, 8); },
  flash: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); const gr = g.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,240,0.8)"); gr.addColorStop(1, "rgba(255,255,240,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); poly(g, [[128, 0], [138, 118], [256, 128], [138, 138], [128, 256], [118, 138], [0, 128], [118, 118]], "#ffffff", 0); },
  confetti: (p, k) => { const g = p.g, W = g.canvas.width, Hh = g.canvas.height; g.clearRect(0, 0, W, Hh); const C = ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a", "#ffffff", "#c8202e"]; for (let i = 0; i < 46; i++) { const x = hh(i, 1) * W, y = ((hh(i, 2) * Hh + k * 30 * (0.6 + hh(i, 3))) % (Hh + 48)) - 24; g.save(); g.translate(x, y); g.rotate(k * 0.7 + i); g.fillStyle = C[i % 6]; g.fillRect(-9, -5, 18, 10); g.restore(); } },
  rain: (p, k) => { const g = p.g; g.clearRect(0, 0, 512, 512); for (let i = 0; i < 14; i++) { const x = 70 + i * 28, y = 230 + ((k * 40 + i * 37) % 220); line(g, [[x, y], [x - 8, y + 34]], "#7ab0ff", 7); }
    for (const [x, y, r] of [[150, 150, 90], [260, 120, 110], [370, 160, 90], [260, 190, 100]]) E(g, x, y, r, r * 0.7, 0, "#6a7488", 8); for (const [x, y, r] of [[150, 150, 90], [260, 120, 110], [370, 160, 90], [260, 190, 100]]) E(g, x, y, r - 5, r * 0.7 - 5, 0, "#6a7488", 0); },
  sweat: (p) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.beginPath(); g.moveTo(64, 10); g.quadraticCurveTo(110, 80, 64, 118); g.quadraticCurveTo(18, 80, 64, 10); g.fillStyle = "#8fd0ff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); },
};

// ---------------- pigeons ----------------
// side view, facing right. (cx, cy) = body centre, s = scale (1: body ~240 px long). o: face, pk (peck 0..1), k, goggles, cap, fat, olive, sign, wing (0..1 raised), flip
function drawPigeon(g, cx, cy, s, o = {}) {
  g.save(); if (o.flip) { g.translate(cx * 2, 0); g.scale(-1, 1); }
  g.lineJoin = "round"; g.lineCap = "round";
  const k = o.k ?? 0, pk = o.pk ?? 0, fat = o.fat ? 1.22 : 1, face = o.face ?? "happy";
  const bodyC = "#9aa4b8", dark = "#6a7488", headC = "#8a94aa";
  // legs + feet
  for (const dx of [-18, 16]) { line(g, [[cx + dx * s, cy + 60 * s * fat], [cx + dx * s, cy + 120 * s]], INK, 16 * s); line(g, [[cx + dx * s, cy + 60 * s * fat], [cx + dx * s, cy + 120 * s]], "#e86a7a", 9 * s);
    for (const fx of [-16, 0, 18]) { line(g, [[cx + dx * s, cy + 120 * s], [cx + (dx + fx) * s, cy + 132 * s]], INK, 12 * s); line(g, [[cx + dx * s, cy + 120 * s], [cx + (dx + fx) * s, cy + 132 * s]], "#e86a7a", 6 * s); } }
  // tail
  poly(g, [[cx - 90 * s, cy - 10 * s], [cx - 190 * s, cy + 20 * s], [cx - 185 * s, cy + 55 * s], [cx - 80 * s, cy + 40 * s]], dark, 8 * s);
  line(g, [[cx - 178 * s, cy + 24 * s], [cx - 176 * s, cy + 50 * s]], "#2a2e3a", 10 * s);
  // body
  E(g, cx, cy + 10 * s, 118 * s * fat, 78 * s * fat, -0.12, bodyC, 9 * s);
  E(g, cx + 40 * s, cy + 30 * s, 60 * s * fat, 44 * s * fat, -0.2, "#b4bccc", 0);
  // wing (raised = holding a sign / waving)
  const wu = o.wing ?? 0;
  g.save(); g.translate(cx - 10 * s, cy - 6 * s); g.rotate(-wu * 1.3 + Math.sin(k * 2) * 0.03 * wu);
  g.beginPath(); g.moveTo(-10 * s, -20 * s); g.quadraticCurveTo(-120 * s, -10 * s, -110 * s, 40 * s); g.quadraticCurveTo(-30 * s, 50 * s, 40 * s, 10 * s); g.closePath(); g.fillStyle = dark; g.fill(); g.strokeStyle = INK; g.lineWidth = 8 * s; g.stroke();
  line(g, [[-80 * s, 0], [-30 * s, 8 * s]], "#2a2e3a", 9 * s); line(g, [[-90 * s, 22 * s], [-40 * s, 28 * s]], "#2a2e3a", 9 * s);
  if (o.sign) { g.save(); g.translate(-120 * s, 20 * s); g.rotate(wu * 1.3); line(g, [[0, 0], [0, -120 * s]], INK, 12 * s); line(g, [[0, 0], [0, -120 * s]], "#c89a5a", 6 * s); R(g, -70 * s, -230 * s, 140 * s, 110 * s, 12 * s, o.signCol ?? "#fbf3dc", 7 * s); txt(g, o.sign, 0, -175 * s, 54 * s, "Bangers", o.signTxt ?? "#c8202e", INK, 0, 130 * s); g.restore(); }
  if (o.olive) { line(g, [[-110 * s, 40 * s], [-170 * s, -40 * s]], "#5a4a2a", 7 * s); for (let i = 0; i < 5; i++) E(g, (-120 - i * 12) * s, (20 - i * 16) * s, 16 * s, 7 * s, -0.9 + (i % 2) * 1.6, "#6a9a3a", 3 * s); }
  g.restore();
  // neck + head (peck drives the head forward and down)
  const hx = cx + (92 + 46 * pk) * s, hy = cy + (-92 + 82 * pk) * s;
  line(g, [[cx + 55 * s, cy - 20 * s], [hx - 6 * s, hy + 14 * s]], INK, 66 * s); line(g, [[cx + 55 * s, cy - 20 * s], [hx - 6 * s, hy + 14 * s]], "#5aa080", 52 * s);
  line(g, [[cx + 62 * s, cy - 10 * s], [hx + 2 * s, hy + 26 * s]], "#8a5ab0", 20 * s);
  E(g, hx, hy, 52 * s, 48 * s, 0, headC, 9 * s);
  // beak + cere
  const bx = hx + 46 * s, by = hy + 8 * s;
  poly(g, [[bx - 6 * s, by - 10 * s], [bx + 40 * s, by + 4 * s], [bx - 6 * s, by + 12 * s]], "#3a3036", 6 * s);
  E(g, bx - 2 * s, by - 10 * s, 12 * s, 7 * s, 0, "#f0f0ea", 4 * s);
  // eye
  const ex = hx + 12 * s, ey = hy - 10 * s;
  if (face === "happy") { line(g, [[ex - 16 * s, ey + 2 * s], [ex, ey - 12 * s], [ex + 16 * s, ey + 2 * s]], INK, 8 * s); E(g, ex + 6 * s, ey + 26 * s, 13 * s, 7 * s, 0, "rgba(255,110,130,0.6)", 0); }
  else {
    const big = face === "shock" ? 1.35 : face === "stare" ? 1.15 : 1;
    E(g, ex, ey, 24 * s * big, 24 * s * big, 0, "#ffffff", 6 * s); E(g, ex + 3 * s, ey, 15 * s * big, 15 * s * big, 0, "#ff8a2a", 0);
    E(g, ex + 4 * s, ey, (face === "shock" ? 5 : 8) * s, (face === "shock" ? 5 : 8) * s, 0, INK, 0); E(g, ex + 8 * s, ey - 6 * s, 4 * s, 4 * s, 0, "#ffffff", 0);
    if (face === "stare" || face === "sad") { g.fillStyle = headC; g.beginPath(); g.ellipse(ex, ey - (face === "stare" ? 10 : 12) * s, 30 * s, 20 * s, 0, Math.PI, two); g.fill(); line(g, [[ex - 26 * s, ey - 10 * s], [ex + 26 * s, ey - 10 * s]], INK, 6 * s); }
    if (face === "angry" || face === "greedy") line(g, [[ex - 26 * s, ey - 34 * s], [ex + 22 * s, ey - 18 * s]], INK, 9 * s);
    if (face === "sad") line(g, [[ex - 20 * s, ey - 30 * s], [ex + 22 * s, ey - 40 * s]], INK, 8 * s);
    E(g, ex + 26 * s, ey + 26 * s, 0, 0, 0, null, 0);
  }
  if (face === "greedy") E(g, bx + 12 * s, by + 22 * s, 7 * s, 7 * s, 0, "#e8c45a", 3 * s);
  // pilot cap + goggles
  if (o.cap) { g.beginPath(); g.ellipse(hx - 4 * s, hy - 14 * s, 56 * s, 46 * s, 0, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fillStyle = "#7a4a2a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 7 * s; g.stroke();
    line(g, [[hx - 44 * s, hy - 10 * s], [hx - 54 * s, hy + 30 * s]], "#7a4a2a", 14 * s); }
  if (o.goggles) { line(g, [[hx - 50 * s, hy - 16 * s], [ex - 20 * s, ey - 4 * s]], "#5a3a22", 12 * s); E(g, ex + 2 * s, ey, 32 * s, 30 * s, 0, "rgba(160,220,255,0.35)", 9 * s, "#5a3a22"); E(g, ex - 8 * s, ey - 10 * s, 7 * s, 5 * s, -0.5, "rgba(255,255,255,0.8)", 0); }
  g.restore();
  return { hx, hy, bx, by };
}
// front view (stare shot). o.lid 0..1, k
function drawPigeonFront(g, cx, cy, s, o = {}) {
  g.lineJoin = "round"; const lid = o.lid ?? 0;
  E(g, cx, cy + 190 * s, 150 * s, 130 * s, 0, "#9aa4b8", 10 * s); E(g, cx, cy + 210 * s, 90 * s, 90 * s, 0, "#b4bccc", 0);
  E(g, cx, cy + 70 * s, 70 * s, 70 * s, 0, "#5aa080", 0); E(g, cx, cy + 92 * s, 60 * s, 40 * s, 0, "#8a5ab0", 0);
  E(g, cx, cy, 110 * s, 100 * s, 0, "#8a94aa", 10 * s);
  for (const sx of [-1, 1]) { const ex = cx + sx * 62 * s, ey = cy - 10 * s;
    E(g, ex, ey, 34 * s, 34 * s, 0, "#ffffff", 7 * s); E(g, ex, ey, 22 * s, 22 * s, 0, "#ff8a2a", 0); E(g, ex, ey + 2 * s, 11 * s, 11 * s, 0, INK, 0); E(g, ex + 6 * s, ey - 7 * s, 5 * s, 5 * s, 0, "#ffffff", 0);
    if (lid > 0) { g.fillStyle = "#8a94aa"; g.fillRect(ex - 38 * s, ey - 38 * s, 76 * s, 76 * s * lid * 0.62); line(g, [[ex - 34 * s, ey - 38 * s + 76 * s * lid * 0.62], [ex + 34 * s, ey - 38 * s + 76 * s * lid * 0.62]], INK, 7 * s); }
    if (o.goggles) E(g, ex, ey, 44 * s, 42 * s, 0, "rgba(160,220,255,0.3)", 10 * s, "#5a3a22"); }
  if (o.goggles) line(g, [[cx - 18 * s, cy - 14 * s], [cx + 18 * s, cy - 14 * s]], "#5a3a22", 10 * s);
  poly(g, [[cx - 16 * s, cy + 22 * s], [cx + 16 * s, cy + 22 * s], [cx, cy + 62 * s]], "#3a3036", 6 * s); E(g, cx, cy + 20 * s, 18 * s, 8 * s, 0, "#f0f0ea", 4 * s);
  if (o.cap) { g.beginPath(); g.ellipse(cx, cy - 30 * s, 112 * s, 80 * s, 0, Math.PI, two); g.closePath(); g.fillStyle = "#7a4a2a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 8 * s; g.stroke(); }
}
// a little warship seen from above (the target image), centred at (x, y), length L
const ship = (g, x, y, L, col = "#2a3a2a", rot = -0.35) => { g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.moveTo(-L / 2, -L * 0.08); g.lineTo(L * 0.35, -L * 0.09); g.quadraticCurveTo(L * 0.55, 0, L * 0.35, L * 0.09); g.lineTo(-L / 2, L * 0.08); g.closePath(); g.fillStyle = col; g.fill();
  g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(-L * 0.15, -L * 0.04, L * 0.22, L * 0.08); E(g, L * 0.2, 0, L * 0.04, L * 0.04, 0, "rgba(255,255,255,0.3)", 0); E(g, -L * 0.3, 0, L * 0.035, L * 0.035, 0, "rgba(255,255,255,0.3)", 0); g.restore(); };
// the target screen (512 x 512): o.off (ship offset -1..1), o.hit (0..1 peck flash), o.k
const drawScreen = (g, o = {}) => { g.clearRect(0, 0, 512, 512); R(g, 16, 16, 480, 480, 40, "#3a3f46", 14);
  const gr = g.createRadialGradient(256, 256, 20, 256, 256, 230); gr.addColorStop(0, "#c8f0b0"); gr.addColorStop(1, "#5a9a5a"); R(g, 56, 56, 400, 400, 26, gr, 8);
  for (let i = 0; i < 6; i++) line(g, [[56, 90 + i * 66], [456, 90 + i * 66]], "rgba(40,90,40,0.18)", 4);
  const sx = 256 + (o.off ?? 0) * 110, sy = 256 + (o.off ?? 0) * 40; ship(g, sx, sy, 230, "#1e3a22");
  line(g, [[256, 90], [256, 422]], "rgba(200,30,30,0.7)", 5); line(g, [[90, 256], [422, 256]], "rgba(200,30,30,0.7)", 5); E(g, 256, 256, 60, 60, 0, null, 5, "rgba(200,30,30,0.7)");
  if (o.hit) { E(g, sx, sy, 50 * o.hit + 10, 50 * o.hit + 10, 0, `rgba(255,255,255,${0.8 * (1 - o.hit)})`, 8 * (1 - o.hit), "#ffffff"); }
  txt(g, "TARGET", 256, 470, 34, "Bangers", "#ffe85a", INK, 0, 200); };
// the photo of the target the scientist holds up (512 x 384)
const drawPhoto = (g) => { g.clearRect(0, 0, 512, 384); R(g, 12, 12, 488, 360, 8, "#fbf8f0", 8); const gr = g.createLinearGradient(0, 30, 0, 330); gr.addColorStop(0, "#7a9ab8"); gr.addColorStop(1, "#3a5a7a"); R(g, 34, 34, 444, 270, 4, gr, 4);
  for (let i = 0; i < 8; i++) line(g, [[40, 60 + i * 32], [470, 70 + i * 32]], "rgba(255,255,255,0.18)", 3); ship(g, 256, 170, 300, "#2a3036"); txt(g, "TARGET", 256, 338, 44, "Bangers", "#c8202e", INK, 0, 400); };
// the glide bomb, side view facing right (1024 x 512). o: pk, face, k, medal, bow, open (cut-open nose), label
const drawBomb = (g, o = {}) => { g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; const k = o.k ?? 0;
  // far wing + tail fin
  poly(g, [[470, 250], [360, 150], [300, 150], [380, 250]], "#56663a", 8);
  // fuselage
  g.beginPath(); g.moveTo(130, 220); g.lineTo(760, 196); g.quadraticCurveTo(880, 200, 900, 256); g.quadraticCurveTo(880, 312, 760, 316); g.lineTo(130, 292); g.quadraticCurveTo(100, 256, 130, 220); g.closePath(); g.fillStyle = "#6a7a4a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 11; g.stroke();
  g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(150, 214, 600, 18);
  for (const x of [300, 460, 620]) line(g, [[x, 206], [x, 306]], "rgba(36,23,38,0.45)", 4);
  txt(g, o.label ?? "PROJECT PIGEON", 460, 268, 40, "AlfaSlab", "#f4f0dc", INK, 0, 380);
  // tail fins
  poly(g, [[150, 224], [80, 120], [130, 118], [230, 222]], "#5a6a3a", 9); poly(g, [[150, 290], [70, 360], [120, 364], [230, 290]], "#5a6a3a", 9);
  // near wing
  poly(g, [[420, 280], [300, 420], [380, 426], [560, 284]], "#7a8a5a", 10);
  // glass nose with the pigeon pilot
  g.save(); g.beginPath(); g.ellipse(840, 256, 92, 80, 0, 0, two); g.clip();
  g.fillStyle = "#cfeeff"; g.fillRect(740, 170, 200, 180);
  drawPigeon(g, 768, 345, 0.78, { face: o.face ?? "angry", pk: o.pk ?? 0, k, goggles: true, cap: true });
  g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.ellipse(870, 220, 30, 50, -0.5, 0, two); g.fill(); g.restore();
  E(g, 840, 256, 92, 80, 0, null, 11);
  if (o.medal) { line(g, [[520, 200], [600, 330]], "#3a6ad8", 26); line(g, [[680, 200], [600, 330]], "#d8202e", 26); E(g, 600, 350, 46, 46, 0, "#ffd23a", 9); star(g, 600, 350, 26, "#c8901a"); }
  if (o.bow) { poly(g, [[700, 200], [650, 150], [650, 240]], "#ff7ab0", 7); poly(g, [[700, 200], [760, 150], [760, 240]], "#ff7ab0", 7); E(g, 702, 198, 16, 16, 0, "#ff4a90", 6); }
  // speed lines
  if (o.speed) for (let i = 0; i < 6; i++) { const y = 150 + i * 44, x0 = 40 + ((k * 90 + i * 70) % 160); line(g, [[x0, y], [x0 - 120, y]], "rgba(255,255,255,0.85)", 7); } };
// the cut-open nose cone: three cockpits stacked (768 x 1024). o: k, pk[3], face[3], sign[3], wing[3], screens (show), olive, salute
const drawCockpits = (g, o = {}) => { g.clearRect(0, 0, 768, 1024); g.lineJoin = "round"; const k = o.k ?? 0;
  R(g, 20, 20, 728, 984, 60, "#59653e", 14);
  for (let i = 0; i < 30; i++) { const x = i < 15 ? 44 : 724, y = 60 + (i % 15) * 64; E(g, x, y, 6, 6, 0, "#3a4428", 0); }
  for (let i = 0; i < 3; i++) { const y0 = 52 + i * 318, Y = y0 + 150;
    R(g, 64, y0, 640, 296, 30, "#2a2e2a", 9);
    const bg = g.createLinearGradient(0, y0, 0, y0 + 296); bg.addColorStop(0, "#4a5040"); bg.addColorStop(1, "#30342c"); R(g, 76, y0 + 12, 616, 272, 24, bg, 0);
    R(g, 100, Y + 40, 120, 90, 14, "#8a4a2a", 7); R(g, 100, Y - 50, 30, 120, 10, "#8a4a2a", 7);
    // screen
    if (o.screens !== false) { R(g, 520, Y - 110, 160, 160, 18, "#3a3f46", 8); const gr = g.createRadialGradient(600, Y - 30, 4, 600, Y - 30, 80); gr.addColorStop(0, "#c8f0b0"); gr.addColorStop(1, "#5a9a5a"); R(g, 534, Y - 96, 132, 132, 10, gr, 4); ship(g, 600, Y - 30, 90, "#1e3a22");
      line(g, [[600, Y - 92], [600, Y + 32]], "rgba(200,30,30,0.6)", 3); line(g, [[538, Y - 30], [662, Y - 30]], "rgba(200,30,30,0.6)", 3); }
    const pk = (o.pk && o.pk[i]) || 0;
    drawPigeon(g, 290, Y + 30, 0.8, { face: (o.face && o.face[i]) || "angry", pk, k: k + i, goggles: true, cap: true, sign: o.sign && o.sign[i], signCol: o.signCol && o.signCol[i], wing: (o.wing && o.wing[i]) || 0, olive: o.olive });
    txt(g, "" + (i + 1), 668, y0 + 262, 40, "Bangers", "#ffe85a", INK, 6, 60);
    if (pk > 0.8) poly(g, [[505, Y - 20], [540, Y - 34], [516, Y - 6]], "#ffffff", 4);
  } };
const drawGrain = (g, n = 1, k = 0) => { g.clearRect(0, 0, 512, 256); const N = Math.round(40 + n * 160);
  for (let i = 0; i < N; i++) { const r = Math.sqrt(hh(i, 1)), a = hh(i, 2) * Math.PI, x = 256 + Math.cos(a) * r * 220 * (0.5 + n * 0.5), y = 240 - Math.sin(a) * r * 150 * (0.3 + n * 0.7); E(g, x, y, 11, 7, hh(i, 3) * 3, ["#e8c45a", "#d8a83a", "#f2d88a", "#c8903a"][i % 4], 2.5); } };
const drawStamp = (g, s = "CANCELLED") => { g.clearRect(0, 0, 1024, 384); R(g, 40, 60, 944, 264, 30, "rgba(255,255,255,0.0)", 22, "#d8202e"); R(g, 70, 90, 884, 204, 20, null, 8, "#d8202e"); txt(g, s, 512, 200, 170, "Bangers", "#d8202e", INK, 0, 860); };
const drawBulb = (g, on = 1) => { g.clearRect(0, 0, 256, 384); if (on) for (let i = 0; i < 8; i++) { const a = (i / 8) * two; line(g, [[128 + Math.cos(a) * 100, 140 + Math.sin(a) * 100], [128 + Math.cos(a) * 124, 140 + Math.sin(a) * 124]], "#ffe85a", 12); }
  E(g, 128, 140, 80, 84, 0, on ? "#fff2a0" : "#e8e8e0", 9); R(g, 92, 216, 72, 60, 10, "#a8a8b0", 8); line(g, [[100, 236], [156, 236]], INK, 5); line(g, [[100, 256], [156, 256]], INK, 5); line(g, [[110, 150], [128, 120], [146, 150]], "#c8901a", 6); };
const drawMedal = (g) => { g.clearRect(0, 0, 384, 512); poly(g, [[110, 20], [190, 250], [250, 230], [170, 20]], "#3a6ad8", 8); poly(g, [[274, 20], [194, 250], [134, 230], [214, 20]], "#d8202e", 8);
  E(g, 192, 340, 130, 130, 0, "#ffd23a", 12); E(g, 192, 340, 100, 100, 0, "#ffe68a", 6, "#c8901a"); txt(g, "PEACE", 192, 344, 58, "AlfaSlab", "#a8701a", INK, 0, 180); };
const drawEnvelope = (g) => { g.clearRect(0, 0, 512, 384); R(g, 30, 70, 452, 280, 12, "#e8d8b0", 9); poly(g, [[30, 76], [256, 230], [482, 76]], "#d8c498", 8); txt(g, "PAY", 256, 300, 80, "Bangers", "#7a4a1a", INK, 0, 300);
  for (let i = 0; i < 14; i++) E(g, 200 + hh(i, 4) * 120, 70 - hh(i, 5) * 50, 10, 6, hh(i, 6) * 3, "#e8c45a", 2.5); };
const drawSky = (g, k = 0) => { g.clearRect(0, 0, 576, 1024); const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "#5aa0e8"); gr.addColorStop(0.7, "#a8d4f4"); gr.addColorStop(1, "#d8ecf8"); g.fillStyle = gr; g.fillRect(0, 0, 576, 1024);
  for (let i = 0; i < 9; i++) { const x = ((hh(i, 1) * 900 - k * (40 + i * 6)) % 900 + 900) % 900 - 160, y = 80 + hh(i, 2) * 860, w = 90 + hh(i, 3) * 120; for (const [dx, dy, r] of [[0, 0, 1], [w * 0.5, -w * 0.15, 0.8], [-w * 0.5, w * 0.05, 0.7]]) E(g, x + dx, y + dy, w * 0.5 * r, w * 0.32 * r, 0, "rgba(255,255,255,0.9)", 0); } };
const drawSea = (g, k = 0, shipOff = 0) => { g.clearRect(0, 0, 1024, 1024); const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "#8fc4f2"); gr.addColorStop(0.18, "#3a8ad8"); gr.addColorStop(1, "#1f5aa8"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) { const x = hh(i, 1) * 1024, y = 200 + hh(i, 2) * 820; line(g, [[x, y], [x + 30 + y * 0.04, y]], "rgba(255,255,255,0.35)", 4); }
  ship(g, 512 + shipOff * 200, 640, 330, "#4a5058", -0.2); line(g, [[350 + shipOff * 200, 690], [180 + shipOff * 200, 740]], "rgba(255,255,255,0.6)", 10); };

// ---------------- props drawn on people's cards ----------------
const oc = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")); return c; };
const PHOTO = { c: null }; const photoC = () => PHOTO.c || (PHOTO.c = oc(512, 384, drawPhoto));
const XL = {
  photo: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(photoC(), H.r[0] - 150, H.r[1] - 200, 260, 195); },
  pigeon: (p) => { const H = p.hands; if (!H || !H.r || !H.l) return; const c = oc(512, 512, (q) => drawPigeon(q, 250, 280, 0.8, { face: "shock", goggles: true, cap: true })); p.g.drawImage(c, (H.l[0] + H.r[0]) / 2 - 150, Math.min(H.l[1], H.r[1]) - 230, 300, 300); },
  money: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, x = H.r[0], y = H.r[1]; R(g, x - 70, y - 120, 150, 110, 12, "#5a7a3a", 8); for (let i = 0; i < 3; i++) R(g, x - 60 + i * 6, y - 110 + i * 8, 130, 60, 6, "#a8d090", 4); txt(g, "$$$", x + 6, y - 60, 46, "Bangers", "#2a5a1a", INK, 0, 120); },
  pointer: (p) => { const H = p.hands; if (!H || !H.r) return; line(p.g, [[H.r[0], H.r[1]], [H.r[0] + 150, H.r[1] - 120]], INK, 12); line(p.g, [[H.r[0], H.r[1]], [H.r[0] + 150, H.r[1] - 120]], "#c89a5a", 6); },
  glasses: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + 0.02 * H.HH; E(g, 300 - 34, y, 26, 22, 0, "rgba(220,240,255,0.25)", 6); E(g, 300 + 34, y, 26, 22, 0, "rgba(220,240,255,0.25)", 6); line(g, [[292, y], [308, y]], INK, 5); },
};
const SKIN = { jacket: "#f4f4f0", pants: "#4a4a52", boots: INK, hat: "hair", hair: "#4a3a2a", skin: "#f2d2b6" };
const ARMY = (v) => ({ jacket: "#6a6a40", pants: "#5a5a38", boots: "#3a2a1a", hat: "cap", cap: "#5a5a38", hair: "#3a2a1a", skin: ["#f2d2b6", "#e8b894", "#ecd0b6"][v % 3], ...(v % 2 ? { moustache: "#5a4030" } : {}), build: v % 3 === 1 ? "stout" : "adult" });
const NAVY = (v) => ({ jacket: "#1f2a4a", pants: "#1f2a4a", boots: INK, hat: "cap", cap: "#f4f4f0", hair: "#2a201a", skin: ["#ecd0b6", "#d9a77c"][v % 2], build: "adult" });
const HOST = (v) => ({ jacket: ["#2a2a36", "#5a2a3a", "#2f5f6a"][v % 3], pants: "#2a2a36", boots: INK, hat: "hair", hair: ["#c89a4a", "#2a201a", "#8a8a90"][v % 3], skin: ["#f2d2b6", "#c99067", "#ecd0b6"][v % 3] });
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });

const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });
const screenCard = (out, c, key, draw, d = 0.6, cw = 1024, ch = 512, kind = "soft") => {
  const fx = c.look[0] - c.pos[0], fy = c.look[1] - c.pos[1], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fy, fz);
  const h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.03, w = h * (9 / 16) * 1.03;
  out.fx.push({ key, cw, ch, draw, x: c.pos[0] + (fx / n) * d, y: c.pos[1] + (fy / n) * d, z: c.pos[2] + (fz / n) * d, w, h, kind });
};

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
  const mkA = (base) => (x, y, z) => [base[0] + x, base[1] + y, base[2] + z];
  const l_ = mkA(ROOM.office), w_ = mkA(ROOM.war), s_ = mkA(ROOM.stage), k_ = mkA([2400, 2000, 0]);
  const day = { light: "day", sunAz: 200, sunEl: 62, fogFar: 4000 };
  const LAB = { ...day, props: { office: true } }, WAR = { ...day, props: { war: true } }, STG = { ...day, props: { stage: true } }, SKY = { ...day };
  const at = (Af) => ({
    fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
    ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); },
  });
  const L = at(l_), W = at(w_), G = at(s_), K = at(k_);
  const mk = (H, out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); H.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic" }); };
  const wd = (H, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); H.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const tag = (H, out, key, a, b, col, x, y, z, u, w = 1.1) => { if (u > 0) H.fx(out, key, (p) => DR.nameTag(p, a, b, col), x, y, z, w * u, w * 0.25 * u, { cw: 1024, ch: 256, kind: "basic" }); };
  const bd = (H, out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; H.fx(out, key, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const confetti = (out, c, t) => { const k = Math.floor(t * 12) % 24; screenCard(out, c, "conf" + k, (p) => DR.confetti(p, k), 0.5, 576, 1024, "basic"); };
  const sparkle = (H, out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) H.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  const flashes = (H, out, t, pts, rate = 3) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; H.fx(out, "flash", (p) => DR.flash(p), x, y, z, 0.6 * k, 0.6 * k, { cw: 256, ch: 256, kind: "basic" }); } }); };
  const q = (v, n = 10) => Math.round((v ?? 0) * n);
  // a pecking cycle: 0..1 head down, n pecks per second
  const peckAt = (t, rate = 3) => { const ph = (t * rate) % 1; return ph < 0.35 ? smooth(ph / 0.35) : 1 - smooth((ph - 0.35) / 0.4); };
  const PK = (v) => Math.round(v * 6) / 6;
  // a pigeon card (512 x 512), its feet at (x, yFeet, z), card width w
  const pig = (H, out, t, x, yF, z, w, o = {}) => { const k = Math.floor(t * 8) % 16, pk = PK(o.pk ?? 0);
    const key = "pg" + [k, pk, o.face || "", o.goggles ? 1 : 0, o.cap ? 1 : 0, o.fat ? 1 : 0, o.flip ? 1 : 0, o.olive ? 1 : 0, o.sign || "", q(o.wing, 4)].join("_");
    H.fx(out, key, (p) => { p.g.clearRect(0, 0, 512, 512); drawPigeon(p.g, 250, 330, 0.95, { ...o, pk, k }); }, x, yF + w * 0.39, z, w, w, { cw: 512, ch: 512, kind: "lit", rot: o.rot ?? 0 }); };
  const cockpits = (H, out, t, x, y, z, h, o = {}) => { const k = Math.floor(t * 8) % 16, P3 = (o.pk || [0, 0, 0]).map(PK);
    const key = "ck" + [k, P3.join(","), (o.face || []).join(","), (o.sign || []).join(","), (o.wing || []).map((v) => q(v, 4)).join(","), o.olive ? 1 : 0, o.screens === false ? 0 : 1].join("_");
    H.fx(out, key, (p) => drawCockpits(p.g, { ...o, pk: P3, k }), x, y, z, h * 0.75, h, { cw: 768, ch: 1024, kind: "lit" }); };
  const bomb = (H, out, t, x, y, z, w, o = {}) => { const k = Math.floor(t * 10) % 20, pk = PK(o.pk ?? 0);
    const key = "bm" + [k, pk, o.face || "", o.medal ? 1 : 0, o.bow ? 1 : 0, o.speed ? 1 : 0].join("_");
    H.fx(out, key, (p) => drawBomb(p.g, { ...o, pk, k }), x, y, z, w, w / 2, { cw: 1024, ch: 512, kind: "lit", rot: o.rot ?? 0 }); };
  // sky backdrop for the flying shots (screen-filling card far behind the bomb)
  const sky = (out, c, t, d = 9) => { const k = Math.floor(t * 15) % 600; screenCard(out, c, "sky" + k, (p) => drawSky(p.g, k / 15), d, 576, 1024, "basic"); };
  // the bench in the lab: top y 0.92, front edge z -0.3; birds stand at z -0.55
  const BY = 0.92, BZ = -0.55;
  const grain = (H, out, x, y, z, n, w = 0.5) => H.fx(out, "grain" + q(n, 8), (p) => drawGrain(p.g, n), x, y + w * 0.25 - 0.02, z, w, w / 2, { cw: 512, ch: 256, kind: "lit" });
  const seedsFall = (H, out, t, t0, x, y0, z, n = 6) => { const l = t - t0; if (l < 0) return; for (let i = 0; i < n; i++) { const u = l * 2.2 - i * 0.12; if (u < 0 || u > 1) continue; H.fx(out, "seed", (p) => { p.g.clearRect(0, 0, 64, 64); E(p.g, 32, 32, 20, 13, 0.4, "#e8c45a", 4); }, x + (hh(i, 3) - 0.5) * 0.12, y0 - u * u * 0.35, z + 0.02, 0.035, 0.035, { cw: 64, ch: 64, kind: "basic" }); } };
  const skinner = (out, x, z, opt = {}, H = L) => H.ppl(out, 1, { ...SKIN, xk: opt.xk || "" }, x, z, { ...opt, extra: opt.extra ? (p) => { XL.glasses(p); opt.extra(p); } : XL.glasses });
  const officers = (out, t, mood, n = 3, navy = false) => { const P3 = [[-0.9, -0.85], [0.1, -0.9], [1.1, -0.85]]; for (let i = 0; i < n; i++) { const [x, z] = P3[i], o = navy ? NAVY(i) : ARMY(i);
    W.ppl(out, 10 + i, o, x, z, mood === "laugh" ? { expr: i % 2 ? "laugh" : "grin", arms: { l: ["hips", 1], r: [i === 1 ? "point" : "face", 1] }, headTilt: Math.sin(t * 14 + i) * 6 }
      : mood === "shock" ? { expr: "gasp", arms: { l: ["head", 1], r: ["head", 1] } } : mood === "bored" ? { expr: i % 2 ? "bored" : "suspicious", arms: { l: ["hips", 1], r: ["hips", 1] } }
      : mood === "pay" ? { expr: i === 1 ? "grin" : "smile", arms: i === 1 ? { r: ["out", 1], l: ["hips", 1] } : { l: ["hips", 1], r: ["hips", 1] }, extra: i === 1 ? XL.money : undefined }
      : { expr: "stern", arms: { l: ["hips", 1], r: ["hips", 1] } }); } };

  // ---- hero (shot 1 + loop): the glide bomb diving across the sky, a goggled pigeon pecking furiously in the glass nose
  const heroCam = push(k_(0.15, 0.3, 3.2), k_(0.15, 0.0, 0), k_(0.05, 0.25, 2.6), k_(0.05, 0.0, 0), 50, 2.0);
  const heroStage = (t, out, c, u = 1) => { sky(out, c, t); const uu = clamp01(u);
    bomb(K, out, t, lerp(-0.25, 0.1, uu), lerp(0.55, -0.15, uu), 0, 2.3, { pk: peckAt(t, 4), face: "angry", speed: true, rot: -0.95 + 0.06 * Math.sin(t * 5) }); };
  // 1 This bomb was steered…: diving on frame 0
  shot({ a: 0, ...SKY, cam: heroCam, cInf: 0.5, focus: k_(0, 0, 0), shadowR: 6, stage(t, out, c) { heroStage(t, out, c, clamp01(0.55 + t * 0.35)); } });
  kick1(0.4);
  // 2 …by a pigeon.: smash into the glass nose: the goggled pigeon pecking, PECK!
  shot({ at: S("pigeon"), ...SKY, cam: push(k_(0.74, 0.03, 1.2), k_(0.74, 0.0, 0), k_(0.74, 0.02, 1.0), k_(0.74, 0.0, 0), 46, 0.9), cInf: 1.5, focus: k_(1, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); bomb(K, out, t, 0, 0, 0, 2.3, { pk: peckAt(t, 4.5), face: "angry", speed: true }); wd(K, out, "PECK!", "#d8202e", 0.66, 0.16, 0.2, (t - T("pigeon") - 0.15) * 3, 0.42); } });
  kick1(T("pigeon") + 0.1);
  // 3 Three pigeons, in the nose.: the cut-open nose: three cockpits, three goggled pigeons wave
  shot({ at: S("Three pigeons"), ...SKY, cam: push(k_(0, 0.08, 3.0), k_(0, 0.02, 0), k_(0, 0.06, 2.7), k_(0, 0.02, 0), 46, 1.8), cInf: 1.2, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); const l = t - S("Three pigeons"); cockpits(K, out, t, 0, 0, 0, 1.6, { face: ["happy", "happy", "happy"], wing: [0, 1, 2].map((i) => clamp01((l - i * 0.18) * 4) * (0.6 + 0.3 * Math.sin(t * 10 + i))), screens: true });
      mk(K, out, "3", 0.4, 0.98, 0.1, (t - T("Three") - 0.05) * 3, 0.32, "#ffe85a"); wd(K, out, "NOSE!", "#e8742a", -0.3, 0.98, 0.1, (t - T("nose") - 0.05) * 3, 0.5); } });
  // 4 A scientist thought:: the lab; the scientist, a light bulb pops on
  const tSci = T("scientist");
  shot({ at: S("A scientist"), ...LAB, cam: push(l_(-0.3, 1.6, 2.7), l_(-0.6, 1.45, -0.2), l_(-0.35, 1.6, 2.35), l_(-0.6, 1.47, -0.2), 46, 1.4), cInf: 1.4, focus: l_(-0.7, 1.5, -0.1), shadowR: 8,
    stage(t, out) { skinner(out, -0.75, -0.05, { expr: t > T("thought") ? "look_up" : "talk_o", arms: { l: ["hips", 1], r: ["head", 1] } }); pig(L, out, t, 0.45, BY, BZ, 0.36, { face: "happy" });
      const u = smooth((t - T("thought") + 0.05) / 0.25); if (u > 0) L.fx(out, "bulb", (p) => drawBulb(p.g, 1), -0.5, 2.0 + 0.05 * u, 0.0, 0.3 * u, 0.45 * u, { cw: 256, ch: 384, kind: "basic" });
      tag(L, out, "tagSk", "B.F. SKINNER", "SCIENTIST", "#2f5f6a", -0.75, 0.9, 0.35, smooth((t - tSci - 0.1) / 0.3), 0.85); } });
  // 5 pigeons have amazing eyes…: close on the pigeon: huge sparkling eyes
  shot({ at: S("pigeons have"), ...LAB, cam: push(l_(0.55, 1.12, 0.62), l_(0.55, 1.1, BZ), l_(0.56, 1.12, 0.48), l_(0.56, 1.1, BZ), 42, 1.4), cInf: 2.6, focus: l_(0.55, 1.1, BZ), shadowR: 6,
    stage(t, out) { pig(L, out, t, 0.45, BY, BZ, 0.4, { face: t > T("eyes") - 0.1 ? "shock" : "happy" }); sparkle(L, out, t, 0.6, 1.24, BZ + 0.05, 0.05, 4); wd(L, out, "SUPER EYES!", "#3a9ad8", 0.5, 1.4, BZ + 0.1, (t - T("eyes") + 0.05) * 3, 0.36); } });
  // 6 …so make them pilots!: the cap and goggles drop onto the pigeon: salute
  const tPil = T("pilots");
  shot({ at: S("so make"), ...LAB, cam: push(l_(0.4, 1.2, 0.95), l_(0.48, 1.12, BZ), l_(0.42, 1.2, 0.8), l_(0.48, 1.13, BZ), 44, 1.4), cInf: 2.2, focus: l_(0.48, 1.1, BZ), shadowR: 6,
    stage(t, out) { const on = t > tPil - 0.1; pig(L, out, t, 0.45, BY, BZ, 0.4, { face: on ? "angry" : "happy", cap: on, goggles: on, wing: on ? 0.9 : 0 }); wd(L, out, "PILOTS!", "#e8742a", 0.55, 1.42, BZ + 0.1, (t - tPil) * 3, 0.4); if (on) sparkle(L, out, t, 0.52, 1.2, BZ + 0.05, 0.06, 3); } });
  kick1(tPil + 0.02);
  // 7 He showed them a picture of the target.: the scientist holds up the target photo to the bird
  shot({ at: S("He showed"), ...LAB, cam: push(l_(-0.15, 1.45, 2.5), l_(-0.15, 1.3, -0.3), l_(-0.15, 1.45, 2.25), l_(-0.15, 1.32, -0.3), 50, 1.6), cInf: 1.6, focus: l_(-0.1, 1.3, -0.3), shadowR: 8,
    stage(t, out) { skinner(out, -0.6, -0.05, { expr: "talk_e", arms: { r: ["out", 1], l: ["hips", 1] }, extra: XL.photo, xk: "photo" }); pig(L, out, t, 0.35, BY, BZ, 0.38, { face: "stare", flip: false });
      mk(L, out, "?", 0.42, 1.45, BZ + 0.1, (t - T("picture") - 0.1) * 3, 0.16); } });
  // 8 Peck the picture, get a snack.: the pigeon pecks the photo on the bench; seeds drop: SNACK!
  const tSn = T("snack");
  shot({ at: S("Peck the"), ...LAB, cam: push(l_(0.18, 1.12, 0.5), l_(0.18, 1.02, BZ), l_(0.18, 1.11, 0.38), l_(0.18, 1.03, BZ), 44, 1.4), cInf: 2.2, focus: l_(0.25, 1.0, BZ), shadowR: 6,
    stage(t, out) { L.fx(out, "photoB", (p) => drawPhoto(p.g), 0.36, BY + 0.11, BZ + 0.05, 0.3, 0.225, { cw: 512, ch: 384, kind: "lit" }); pig(L, out, t, 0.04, BY, BZ - 0.03, 0.36, { face: "angry", pk: t < tSn ? peckAt(t, 2.2) : 0.1 });
      seedsFall(L, out, t, tSn - 0.25, 0.2, 1.35, BZ + 0.05, 7); if (t > tSn - 0.05) grain(L, out, 0.2, BY, BZ + 0.08, 0.15, 0.16); wd(L, out, "SNACK!", "#e8a83a", 0.3, 1.36, BZ + 0.1, (t - tSn) * 3, 0.38); } });
  // 9 Peck faster… more snacks.: frantic pecking blur, seeds pouring
  shot({ at: S("Peck faster"), ...LAB, cam: push(l_(0.2, 1.12, 0.45), l_(0.2, 1.04, BZ), l_(0.2, 1.11, 0.32), l_(0.2, 1.04, BZ), 44, 1.4), cInf: 2.2, focus: l_(0.2, 1.0, BZ), shadowR: 6, cam2: 1,
    stage(t, out) { L.fx(out, "photoB", (p) => drawPhoto(p.g), 0.38, BY + 0.11, BZ + 0.05, 0.3, 0.225, { cw: 512, ch: 384, kind: "lit" }); pig(L, out, t, 0.06, BY, BZ - 0.03, 0.36, { face: "greedy", pk: peckAt(t, 6) });
      seedsFall(L, out, t, (t - 0.0) % 0.5 + 0 > 0 ? t - ((t * 2) % 1) / 2 : t, 0.18, 1.35, BZ + 0.05, 5); grain(L, out, 0.15, BY, BZ + 0.08, 0.3 + 0.2 * clamp01(t - S("Peck faster")), 0.2); wd(L, out, "FASTER!", "#d8202e", 0.15, 1.38, BZ + 0.1, (t - T("faster") - 0.05) * 3, 0.36); } });
  // 10 One greedy bird pecked ten thousand times…: a fat pigeon hammering away, the counter board
  const tTen = T("ten");
  shot({ at: S("One greedy"), ...LAB, cam: push(l_(0.1, 1.35, 1.25), l_(0.1, 1.25, -0.4), l_(0.1, 1.34, 1.05), l_(0.1, 1.26, -0.4), 46, 1.6), cInf: 1.6, focus: l_(0.1, 1.1, BZ), shadowR: 6,
    stage(t, out) { L.fx(out, "photoB", (p) => drawPhoto(p.g), -0.1, BY + 0.11, BZ + 0.05, 0.3, 0.225, { cw: 512, ch: 384, kind: "lit" }); pig(L, out, t, 0.25, BY, BZ - 0.03, 0.44, { flip: true, fat: true, face: "greedy", pk: peckAt(t, 6.5) });
      grain(L, out, 0.0, BY, BZ + 0.08, 0.5, 0.26); bd(L, out, "b10k", "10,000", "PECKS!", "#d8202e", 0.1, 1.52, -0.3, (t - tTen + 0.1) * 2.2, 0.9); } });
  kick1(tTen + 0.05);
  // 11 …in one sitting.: the scientist's jaw drops; the bird is still going
  shot({ at: S("in one"), ...LAB, cam: push(l_(-0.28, 1.45, 2.7), l_(-0.28, 1.3, -0.3), l_(-0.28, 1.45, 2.45), l_(-0.28, 1.32, -0.3), 50, 1.2), cInf: 1.4, focus: l_(-0.4, 1.4, -0.2), shadowR: 8,
    stage(t, out) { skinner(out, -0.8, -0.05, { expr: "gasp", arms: { l: ["head", 1], r: ["head", 1] }, headTilt: Math.sin(t * 9) * 3 }); pig(L, out, t, 0.25, BY, BZ - 0.03, 0.42, { flip: true, fat: true, face: "greedy", pk: peckAt(t, 6.5) });
      grain(L, out, 0.0, BY, BZ + 0.08, 0.7, 0.3); wd(L, out, "NONSTOP!", "#d8202e", 0.1, 1.55, -0.2, (t - T("sitting") + 0.05) * 3, 0.5); } });
  // 12 Then he strapped them inside a bomb.: the scientist lowers a goggled pigeon into the open nose cone
  shot({ at: S("Then he"), ...LAB, cam: push(l_(0.05, 1.55, 3.0), l_(0.05, 1.3, -0.4), l_(0.05, 1.55, 2.75), l_(0.05, 1.32, -0.4), 50, 1.6), cInf: 1.3, focus: l_(0.1, 1.3, -0.3), shadowR: 8,
    stage(t, out) { skinner(out, -0.55, -0.05, { expr: "grin", arms: { l: ["hold", 1], r: ["hold", 1] }, extra: XL.pigeon, xk: "carryP" }); L.fx(out, "noseOpen", (p) => drawBomb(p.g, { face: "shock", k: 0 }), 0.5, BY + 0.3, BZ, 0.9, 0.45, { cw: 1024, ch: 512, kind: "lit", rot: 0.0 });
      wd(L, out, "STRAP IN!", "#e8742a", 0.35, 1.85, -0.3, (t - T("strapped") - 0.05) * 3, 0.55); } });
  // 13 Each got a tiny cockpit.: close: a pigeon settles into its tiny seat
  shot({ at: S("Each got"), ...SKY, cam: push(k_(0.0, 0.5, 1.1), k_(0.0, 0.48, 0), k_(0.0, 0.49, 0.92), k_(0.0, 0.48, 0), 44, 1.6), cInf: 2, focus: k_(0, 0.48, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); cockpits(K, out, t, 0, 0, 0, 1.6, { face: ["happy", "angry", "angry"], wing: [0.5 + 0.4 * Math.sin(t * 9), 0, 0] }); wd(K, out, "TINY!", "#e8742a", 0.15, 0.7, 0.1, (t - T("tiny") + 0.05) * 3, 0.32); } });
  // 14 A screen shows the target.: the target screen glows on, ship drifting
  shot({ at: S("A screen"), ...SKY, cam: push(k_(0, 0.0, 1.3), k_(0, 0, 0), k_(0, 0, 1.1), k_(0, 0, 0), 44, 1.6), cInf: 2, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); const l = t - S("A screen"), off = Math.round(lerp(-0.7, -0.4, clamp01(l / 1.6)) * 20) / 20; K.fx(out, "scr" + off, (p) => drawScreen(p.g, { off }), 0, 0, 0, 0.9, 0.9, { cw: 512, ch: 512, kind: "basic" }); } });
  // 15 The pigeon pecks…: the pigeon pecks the ship on the screen, flash
  const tPk = T("pecks");
  shot({ at: S("The pigeon", T("screen")), ...SKY, cam: push(k_(0.05, 0.5, 1.4), k_(0.05, 0.48, 0), k_(0.07, 0.49, 1.2), k_(0.07, 0.48, 0), 44, 1.0), cInf: 2, focus: k_(0.1, 0.48, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); cockpits(K, out, t, 0, 0, 0, 1.6, { face: ["angry", "angry", "angry"], pk: [peckAt(t, 4), peckAt(t + 0.2, 4), peckAt(t + 0.1, 4)] }); wd(K, out, "TAP TAP!", "#d8202e", 0.15, 0.78, 0.1, (t - tPk) * 3, 0.36); } });
  // 16 …and the bomb turns.: the bomb banks hard over the sea, the ship below
  const tTu = T("turns");
  shot({ at: S("and the bomb"), ...SKY, cam: push(k_(-0.4, 0.6, 3.2), k_(0.2, -0.2, 0), k_(-0.2, 0.5, 2.8), k_(0.2, -0.25, 0), 52, 1.0), cInf: 0.6, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 9); const u = smooth((t - tTu + 0.25) / 0.5); bomb(K, out, t, 0.1, -0.1, 0, 2.2, { pk: 0, face: "angry", speed: true, rot: lerp(-0.55, -1.15, u) }); wd(K, out, "WHOOSH!", "#3a9ad8", -0.2, 0.8, 0.4, (t - tTu) * 3, 0.7); } });
  kick1(tTu);
  // 17 Why three birds?: the three cockpits, a big ?
  shot({ at: S("Why"), ...SKY, cam: push(k_(0, 0.05, 3.0), k_(0, 0.02, 0), k_(0, 0.05, 2.75), k_(0, 0.02, 0), 46, 1.0), cInf: 1.2, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); cockpits(K, out, t, 0, 0, 0, 1.6, { face: ["stare", "stare", "stare"] }); mk(K, out, "?", 0.42, 0.95, 0.1, (t - T("Why") - 0.05) * 3, 0.36, "#ffe85a"); } });
  // 18 So they could vote.: each pigeon raises a voting sign
  const tVo = T("vote");
  shot({ at: S("So they"), ...SKY, cam: push(k_(0, 0.08, 3.0), k_(0, 0.05, 0), k_(0, 0.07, 2.7), k_(0, 0.05, 0), 46, 1.4), cInf: 1.2, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); const l = t - (tVo - 0.4); cockpits(K, out, t, 0, 0, 0, 1.6, { face: ["happy", "happy", "happy"], sign: ["LEFT", "LEFT", "RIGHT"], wing: [0, 1, 2].map((i) => clamp01((l - i * 0.12) * 4)) }); wd(K, out, "VOTE!", "#2a8a3a", 0.3, 1.0, 0.15, (t - tVo + 0.05) * 3, 0.5); } });
  // 19 Two against one…: two LEFT signs vs one RIGHT, the two glare at the third
  shot({ at: S("Two against"), ...SKY, cam: push(k_(0.1, -0.15, 1.9), k_(0.05, -0.1, 0), k_(0.1, -0.12, 1.65), k_(0.05, -0.1, 0), 46, 1.0), cInf: 1.5, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); cockpits(K, out, t, 0, 0, 0, 1.6, { face: ["angry", "angry", "shock"], sign: ["LEFT", "LEFT", "RIGHT"], wing: [1, 1, 1] }); mk(K, out, "2 VS 1", 0.3, 0.75, 0.2, (t - T("Two") - 0.05) * 3, 0.4, "#ffe85a"); } });
  // 20 …the loser got outvoted.: the third pigeon droops its sign, sad, under a rain cloud
  shot({ at: S("the loser"), ...SKY, cam: push(k_(0.0, -0.45, 1.15), k_(0.0, -0.48, 0), k_(0.0, -0.46, 0.98), k_(0.0, -0.48, 0), 44, 1.2), cInf: 2, focus: k_(0, -0.5, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); cockpits(K, out, t, 0, 0, 0, 1.6, { face: ["happy", "happy", "sad"], sign: ["LEFT", "LEFT", "RIGHT"], wing: [1, 1, 0.25] }); const k = Math.floor(t * 12) % 6; K.fx(out, "rain" + k, (p) => DR.rain(p, k), -0.12, -0.22, 0.1, 0.3, 0.3, { cw: 512, ch: 512, kind: "basic" });
      wd(K, out, "OUTVOTED!", "#24356e", 0.0, -0.25, 0.15, (t - T("outvoted") + 0.05) * 3, 0.36); } });
  // 21 And the military paid for this!: the war office: an officer slaps down a wad of cash, the scientist grins
  shot({ at: S("And the military"), ...WAR, cam: push(w_(0.2, 1.6, 3.1), w_(0, 1.3, -0.6), w_(0.15, 1.6, 2.75), w_(0, 1.32, -0.6), 52, 1.6), cInf: 1.1, focus: w_(0, 1.3, -0.6), shadowR: 10,
    stage(t, out) { officers(out, t, "pay"); pig(W, out, t, -0.3, 0.78, 0.1, 0.32, { face: "happy", goggles: true, cap: true });
      wd(W, out, "$$$!", "#2a8a3a", 0.1, 1.75, -0.4, (t - T("paid") + 0.05) * 3, 0.7); } });
  // 22 In the demo… the birds nailed it.: a demo box on the table: the screen, the bird pecks dead centre, BULLSEYE
  const tNa = T("nailed");
  shot({ at: S("In the demo"), ...WAR, cam: push(w_(0.1, 1.25, 1.75), w_(0.1, 1.05, 0), w_(0.1, 1.24, 1.55), w_(0.1, 1.06, 0), 46, 1.6), cInf: 2, focus: w_(0, 1.0, 0), shadowR: 6,
    stage(t, out) { officers(out, t, "bored"); W.fx(out, "scrD" + (t > tNa ? 1 : 0), (p) => drawScreen(p.g, { off: 0, hit: t > tNa ? 0.3 : 0 }), 0.32, 1.0, 0.05, 0.42, 0.42, { cw: 512, ch: 512, kind: "lit" });
      pig(W, out, t, -0.1, 0.78, 0.1, 0.38, { face: "angry", goggles: true, cap: true, pk: t > tNa - 0.3 ? (t < tNa ? smooth((t - tNa + 0.3) / 0.3) : 1 - smooth((t - tNa) / 0.4)) : peckAt(t, 2) * 0.4 });
      wd(W, out, "BULLSEYE!", "#d8202e", 0.2, 1.42, 0.15, (t - tNa - 0.05) * 3, 0.55); } });
  kick1(tNa + 0.05);
  // 23 But nobody would take him seriously.: the officers burst out laughing; the scientist droops
  shot({ at: S("But nobody"), ...WAR, cam: push(w_(-0.3, 1.6, 3.2), w_(0, 1.4, -0.7), w_(-0.25, 1.6, 2.85), w_(0, 1.42, -0.7), 52, 1.6), cInf: 1.1, focus: w_(0, 1.4, -0.7), shadowR: 10,
    stage(t, out) { officers(out, t, "laugh"); skinner(out, -0.55, 0.85, { expr: "sad", arms: { l: ["low", 1], r: ["low", 1] }, headTilt: 8 }, W); pig(W, out, t, 0.35, 0.78, 0.1, 0.32, { face: "sad", goggles: true, cap: true });
      wd(W, out, "HA HA HA!", "#e8742a", 0.2, 1.95, -0.5, (t - T("nobody")) * 3, 0.75); } });
  // 24 Cancelled!: the stamp slams on, the pigeon shocked
  const tCa = T("Cancelled");
  shot({ at: S("Cancelled"), ...WAR, cam: push(w_(-0.3, 1.2, 1.4), w_(-0.3, 1.05, 0.1), w_(-0.3, 1.2, 1.2), w_(-0.3, 1.06, 0.1), 46, 0.9), cInf: 2, focus: w_(-0.3, 1.0, 0.1), shadowR: 6,
    stage(t, out) { pig(W, out, t, -0.3, 0.78, 0.1, 0.38, { face: "shock", goggles: true, cap: true }); const u = smooth((t - tCa) / 0.12); if (u > 0) W.fx(out, "stamp", (p) => drawStamp(p.g), -0.3, 1.3, 0.35, 0.9 * (1.5 - 0.5 * u), 0.34 * (1.5 - 0.5 * u), { cw: 1024, ch: 384, kind: "basic", rot: -0.18 }); } });
  kick1(tCa + 0.1);
  // 25 Then the Navy brought it back.: Navy officers march in, one hugging the pigeon; IT'S BACK!
  const tNv = T("Navy");
  shot({ at: S("Then the Navy"), ...WAR, cam: push(w_(0.3, 1.6, 3.0), w_(0, 1.35, -0.4), w_(0.25, 1.6, 2.65), w_(0, 1.37, -0.4), 52, 1.4), cInf: 1.1, focus: w_(0, 1.3, -0.4), shadowR: 10,
    stage(t, out) { const l = t - S("Then the Navy"); W.ppl(out, 20, { ...NAVY(0), xk: "carryP" }, lerp(1.9, 0.5, glide(l / 0.9)), 0.7, { expr: "grin", arms: { l: ["hold", 1], r: ["hold", 1] }, extra: XL.pigeon });
      W.ppl(out, 21, NAVY(1), lerp(2.6, 1.3, glide(l / 0.9)), 0.2, { expr: "smile", arms: { l: ["hips", 1], r: ["point", 1] } }); tag(W, out, "tagNavy", "THE NAVY", "1948", "#1f2a4a", 0.3, 1.95, 0.4, smooth((t - tNv - 0.05) / 0.3), 0.8);
      wd(W, out, "IT'S BACK!", "#2a8a3a", -0.6, 1.9, 0.2, (t - T("back", tNv) + 0.05) * 3, 0.65); } });
  // 26 Wait, it gets worse.: snap zoom onto the goggled pigeon: UH-OH
  shot({ at: S("Wait"), ...LAB, cam: (l) => ({ pos: l_(0.55, 1.12, 1.4 - glide(l / 0.35) * 0.75), look: l_(0.55, 1.12, BZ), fov: 44, roll: 0.03 * Math.sin(l * 4) }), cInf: 2.5, focus: l_(0.55, 1.1, BZ), shadowR: 6,
    stage(t, out) { pig(L, out, t, 0.45, BY, BZ, 0.4, { face: "shock", goggles: true, cap: true }); wd(L, out, "UH-OH", "#d8202e", 0.55, 1.42, BZ + 0.1, (t - T("worse") + 0.05) * 3, 0.32); } });
  kick1(T("Wait") + 0.03);
  // 27 Decades later…: the theatre stage, spotlights sweep, DECADES LATER board
  shot({ at: S("Decades"), ...STG, cam: push(s_(0.0, 1.9, 5.0), s_(0, 1.8, -2), s_(0.0, 1.9, 4.4), s_(0, 1.85, -2), 54, 1.4), cInf: 0.8, focus: s_(0, 1.5, -1.5), shadowR: 12,
    stage(t, out) { bd(G, out, "bDec", "DECADES", "LATER…", "#7b5ac9", 0, 2.3, -2.5, (t - T("Decades") + 0.15) * 2.2, 2.6); sparkle(G, out, t, 0, 2.6, -2.4, 0.3, 4); flashes(G, out, t, [[-2.5, 3.6, -2], [2.5, 3.6, -2]], 1.6); } });
  // 28 …it won a prize.: on the stage, a gold medal rises, the pigeon on the lectern beams
  const tPr = T("prize");
  shot({ at: S("it won"), ...STG, cam: push(s_(1.25, 1.85, 1.5), s_(1.25, 1.75, -1.0), s_(1.25, 1.85, 1.25), s_(1.25, 1.77, -1.0), 50, 1.0), cInf: 1.2, focus: s_(1.25, 1.7, -1), shadowR: 8,
    stage(t, out) { pig(G, out, t, 1.6, 1.6, -1.0, 0.42, { face: "happy", goggles: true, cap: true, flip: true }); const u = smooth((t - tPr + 0.15) / 0.35); if (u > 0) G.fx(out, "medal", (p) => drawMedal(p.g), 1.05, 1.75 + 0.2 * u, -0.9, 0.42 * u, 0.56 * u, { cw: 384, ch: 512, kind: "lit" });
      sparkle(G, out, t, 1.05, 2.0, -0.8, 0.12, 4); wd(G, out, "PRIZE!", "#ffb000", 1.3, 2.35, -0.8, (t - tPr) * 3, 0.6); } });
  kick1(tPr + 0.05);
  // 29 The Ig Nobel… Peace Prize.: the banner drops over the stage, presenters applaud
  const tIg = T("Ig"), tPe = T("Peace");
  shot({ at: S("The Ig"), ...STG, cam: push(s_(0.2, 1.8, 4.6), s_(0, 2.0, -2), s_(0.15, 1.8, 4.1), s_(0, 2.05, -2), 54, 1.6), cInf: 0.9, focus: s_(0, 1.8, -2), shadowR: 12,
    stage(t, out, c) { const u = smooth((t - tIg + 0.1) / 0.35); G.fx(out, "banner", (p) => { const g = p.g; g.clearRect(0, 0, 1024, 384); R(g, 14, 20, 996, 344, 26, "#fbf3dc", 12); g.strokeStyle = "#c8302e"; g.lineWidth = 8; g.strokeRect(40, 46, 944, 292);
        txt(g, "THE IG NOBEL", 512, 130, 120, "Rye", "#c8302e", INK, 0, 900); txt(g, "PEACE PRIZE", 512, 262, 120, "Bangers", "#24356e", INK, 0, 900); }, 0, 3.9 - 0.9 * u, -3.0, 3.4, 1.27, { cw: 1024, ch: 384, kind: "lit" });
      [[-2.2, -1.6], [-1.2, -2.0], [2.4, -1.7]].forEach(([x, z], i) => G.ppl(out, 30 + i, HOST(i), x, z, { expr: i % 2 ? "laugh" : "grin", arms: { l: [Math.sin(t * 16 + i) > 0 ? "up" : "out", 1], r: ["up", 1] } }, 0.5));
      pig(G, out, t, 1.6, 1.6, -1.0, 0.42, { face: "happy", goggles: true, cap: true, flip: true }); if (t > tPe) confetti(out, c, t); } });
  // 30 Peace.: the pigeon holds an olive branch like a dove: PEACE?!
  shot({ at: S("Peace", tPe + 0.3), ...STG, cam: push(s_(1.45, 1.85, 0.4), s_(1.6, 1.8, -1.0), s_(1.47, 1.84, 0.25), s_(1.6, 1.8, -1.0), 44, 0.8), cInf: 2.2, focus: s_(1.6, 1.8, -1), shadowR: 6,
    stage(t, out) { pig(G, out, t, 1.6, 1.6, -1.0, 0.42, { face: "happy", goggles: true, cap: true, flip: true, olive: true, wing: 0.6 }); sparkle(G, out, t, 1.6, 1.95, -0.95, 0.08, 3); wd(G, out, "PEACE?!", "#2a8a3a", 1.62, 2.18, -0.9, (t - T("Peace", tPe + 0.3) + 0.05) * 3, 0.4); } });
  // 31 For a bomb.: the bomb with a big gold medal and a bow
  const tFb = T("For a");
  shot({ at: tFb - 0.1, ...SKY, cam: push(k_(0.0, -0.05, 3.1), k_(0.0, -0.05, 0), k_(0.0, -0.05, 2.85), k_(0.0, -0.05, 0), 50, 0.8), cInf: 0.8, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t); bomb(K, out, t, 0.05, -0.3, 0, 2.3, { face: "happy", medal: true, bow: true, rot: 1.05 + Math.sin(t * 3) * 0.05 }); wd(K, out, "A BOMB?!", "#d8202e", -0.15, 0.55, 0.3, (t - T("bomb", tFb) + 0.05) * 3, 0.7); } });
  // 32 Flown by pigeons.: the three cockpits salute
  shot({ at: S("Flown"), ...SKY, cam: push(k_(0, 0.08, 3.0), k_(0, 0.03, 0), k_(0, 0.07, 2.7), k_(0, 0.03, 0), 46, 1.2), cInf: 1.2, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 6); cockpits(K, out, t, 0, 0, 0, 1.6, { face: ["angry", "angry", "angry"], wing: [0.9, 0.9, 0.9].map((v, i) => v + 0.1 * Math.sin(t * 8 + i)) }); } });
  // 33 And the pilots?: the pigeon pilot on the bench, waiting with an open wing
  shot({ at: S("And the pilots"), ...LAB, cam: push(l_(0.3, 1.2, 1.15), l_(0.4, 1.1, BZ), l_(0.32, 1.19, 0.98), l_(0.4, 1.1, BZ), 44, 1.4), cInf: 2.2, focus: l_(0.4, 1.1, BZ), shadowR: 6,
    stage(t, out) { pig(L, out, t, 0.45, BY, BZ, 0.4, { face: "stare", goggles: true, cap: true, wing: 0.7 }); mk(L, out, "?", 0.62, 1.42, BZ + 0.1, (t - T("pilots", T("And the pilots") - 0.05) - 0.05) * 3, 0.16); } });
  // 34 Paid in grain.: the pay envelope drops, grain pours over the pigeon: PAYDAY
  const tGr = T("grain");
  shot({ at: S("Paid in"), ...LAB, cam: push(l_(0.25, 1.3, 1.4), l_(0.35, 1.1, BZ), l_(0.27, 1.29, 1.2), l_(0.35, 1.1, BZ), 46, 1.4), cInf: 2, focus: l_(0.35, 1.1, BZ), shadowR: 6,
    stage(t, out) { const l = t - S("Paid in"); pig(L, out, t, 0.5, BY, BZ, 0.4, { face: "happy", goggles: true, cap: true, flip: true }); const yE = lerp(1.6, BY + 0.1, glide(l / 0.4)); L.fx(out, "env", (p) => drawEnvelope(p.g), 0.12, yE, BZ + 0.05, 0.28, 0.21, { cw: 512, ch: 384, kind: "lit", rot: 0.1 });
      seedsFall(L, out, t, tGr - 0.3, 0.45, 1.5, BZ + 0.08, 8); grain(L, out, 0.3, BY, BZ + 0.1, clamp01((t - tGr + 0.1) * 1.5), 0.32); wd(L, out, "PAYDAY!", "#2a8a3a", 0.32, 1.44, BZ + 0.12, (t - tGr) * 3, 0.38); } });
  // 35 So next time a pigeon stares at you…: a front-on pigeon slowly narrows its eyes at the camera
  const tSt = T("stares");
  shot({ at: S("So next"), ...LAB, cam: push(l_(0.0, 1.16, 0.55), l_(0.0, 1.14, BZ), l_(0.0, 1.15, 0.38), l_(0.0, 1.14, BZ), 42, 1.8), cInf: 2.6, focus: l_(0, 1.1, BZ), shadowR: 6,
    stage(t, out) { const lid = Math.round(smooth((t - tSt) / 0.6) * 6) / 6; L.fx(out, "front" + lid, (p) => { p.g.clearRect(0, 0, 512, 512); drawPigeonFront(p.g, 256, 170, 0.95, { lid, goggles: false }); }, 0.0, BY + 0.2, BZ, 0.4, 0.4, { cw: 512, ch: 512, kind: "lit" }); } });
  // 36 …remember:: loop: shot 1's view, the bomb diving back toward its starting pose
  const tL = S("remember");
  shot({ at: tL, ...SKY, cam: heroCam, cInf: 0.5, focus: k_(0, 0, 0), shadowR: 6, loop: true, stage(t, out, c) { const k = clamp01((t - tL) / Math.max(0.3, END - tL - 0.05)); heroStage(t, out, c, 0.55 * k); } });
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
