// Shot plan for "The Octopus That Predicted the World Cup" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Paul the Octopus (Sea Life Oberhausen): two clear boxes, each with a mussel and a team flag; the box he opened first = his pick.
// 2010 World Cup: 8 of 8 (Germany's seven games incl. Serbia beating Germany and Spain in the semifinal, plus the final). German fans
// suggested frying him / feeding him to sharks; Spain's PM said he was worried and thought of sending him protection; Spanish
// businessmen offered EUR 30,000 to bring him to an octopus festival; the aquarium said no.
// Hook-first (Paul already swinging onto a box on frame 0), a cut every ~1.6 s, loop ending (the last shot = shot 1's view).
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

// ---------------- flags ----------------
const FLAGS = { GER: ["#1a1a1a", "#d8202e", "#f2c230"], SRB: ["#c8202e", "#1f3a8a", "#ffffff"], ESP: ["#c8202e", "#f2c230", "#f2c230", "#c8202e"], NED: ["#c8202e", "#ffffff", "#1f4a9a"], AUS: ["#1f2f7a", "#1f2f7a", "#1f2f7a"] };
const NAMES = { GER: "GERMANY", SRB: "SERBIA", ESP: "SPAIN", NED: "NETHERLANDS", AUS: "AUSTRALIA" };
const ausMarks = (g, x, y, w, h) => { const cw = w * 0.5, ch = h * 0.5; g.save(); g.beginPath(); g.rect(x, y, cw, ch); g.clip(); line(g, [[x, y], [x + cw, y + ch]], "#ffffff", ch * 0.22); line(g, [[x + cw, y], [x, y + ch]], "#ffffff", ch * 0.22); line(g, [[x, y], [x + cw, y + ch]], "#c8202e", ch * 0.08); line(g, [[x + cw, y], [x, y + ch]], "#c8202e", ch * 0.08);
  line(g, [[x + cw / 2, y], [x + cw / 2, y + ch]], "#ffffff", ch * 0.3); line(g, [[x, y + ch / 2], [x + cw, y + ch / 2]], "#ffffff", ch * 0.3); line(g, [[x + cw / 2, y], [x + cw / 2, y + ch]], "#c8202e", ch * 0.16); line(g, [[x, y + ch / 2], [x + cw, y + ch / 2]], "#c8202e", ch * 0.16); g.restore();
  star(g, x + w * 0.25, y + h * 0.76, h * 0.12, "#ffffff"); for (const [u, v, r] of [[0.75, 0.2, 0.07], [0.62, 0.48, 0.07], [0.87, 0.42, 0.07], [0.75, 0.82, 0.07], [0.8, 0.58, 0.04]]) star(g, x + w * u, y + h * v, h * r, "#ffffff"); };
const flatFlag = (g, who, x, y, w, h, lw = 6) => { const c = FLAGS[who]; const n = who === "ESP" ? 4 : 3; for (let i = 0; i < n; i++) { g.fillStyle = c[i]; g.fillRect(x, y + (i * h) / n, w, h / n + 0.5); } if (who === "AUS") ausMarks(g, x, y, w, h); g.strokeStyle = INK; g.lineWidth = lw; g.strokeRect(x, y, w, h); };
// waving flag on a pole, 512 x 512
const drawFlag = (g, who, k) => { g.clearRect(0, 0, 512, 512); line(g, [[60, 40], [60, 500]], INK, 18); line(g, [[60, 40], [60, 500]], "#c9a24a", 9); E(g, 60, 36, 16, 16, 0, "#e8c45a", 6);
  const c = FLAGS[who], n = who === "ESP" ? 4 : 3, W = 400, Hh = 260, sl = 40;
  for (let s = 0; s < sl; s++) { const u0 = s / sl, x0 = 66 + u0 * W, dy = Math.sin(u0 * 5 - k * 0.8) * 18 * u0, sh = 0.85 + 0.15 * Math.cos(u0 * 5 - k * 0.8);
    for (let i = 0; i < n; i++) { g.fillStyle = c[i]; g.fillRect(x0, 50 + dy + (i * Hh) / n, W / sl + 1, Hh / n + 1); g.fillStyle = `rgba(0,0,0,${(1 - sh) * 0.9})`; g.fillRect(x0, 50 + dy + (i * Hh) / n, W / sl + 1, Hh / n + 1); } }
  g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); for (let s = 0; s <= sl; s++) { const u0 = s / sl; g.lineTo(66 + u0 * W, 50 + Math.sin(u0 * 5 - k * 0.8) * 18 * u0); } for (let s = sl; s >= 0; s--) { const u0 = s / sl; g.lineTo(66 + u0 * W, 50 + Hh + Math.sin(u0 * 5 - k * 0.8) * 18 * u0); } g.closePath(); g.stroke(); };

// ---------------- Paul ----------------
// Paul with his head centre at (cx, cy), s = scale (1: mantle ~190 px wide). o.face, o.k (wiggle), o.look (-1..1), o.grip (tentacles hug a box below), gripY
function drawPaul(g, cx, cy, s, o = {}) {
  const k = o.k ?? 0, face = o.face ?? "happy", body = o.col ?? "#ec7a3c", dark = "#c8552a", sk = "#ffd0a8";
  g.lineJoin = "round"; g.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1, j = i < 4 ? 3 - i : i - 4;
    let x = cx + side * (14 + j * 20) * s, y = cy + 70 * s;
    let a = Math.PI / 2 + side * (0.25 + j * 0.32);
    if (o.grip) a = Math.PI / 2 + side * (0.55 + j * 0.2);
    const pts = [[x, y]];
    for (let q = 1; q <= 12; q++) { const t = q / 12; const curl = o.grip ? 0 : side * (t * t * 1.4); a += curl * 0.35 + Math.sin(k * 0.9 + i * 1.7 + t * 4) * 0.1;
      if (o.grip && y > cy + (70 + (o.gripY ?? 200) * 0.25) * s) a = lerp(a, Math.PI / 2 + side * 0.08, 0.5);
      const st = (o.grip ? 19 + j * 3 : 15) * s; x += Math.cos(a) * st; y += Math.sin(a) * st; pts.push([x, y]); }
    for (let q = 0; q < pts.length - 1; q++) { const w = (30 - q * 2.1) * s; line(g, [pts[q], pts[q + 1]], INK, w + 9 * s); }
    for (let q = 0; q < pts.length - 1; q++) { const w = (30 - q * 2.1) * s; line(g, [pts[q], pts[q + 1]], body, w); }
    for (let q = 1; q < pts.length - 2; q += 2) E(g, pts[q][0] - side * 5 * s, pts[q][1] + 3 * s, (7 - q * 0.4) * s, (6 - q * 0.35) * s, 0, sk, 2.5 * s);
  }
  const bob = Math.sin(k * 0.7) * 4 * s;
  g.beginPath(); g.moveTo(cx - 92 * s, cy + 70 * s); g.bezierCurveTo(cx - 120 * s, cy - 60 * s + bob, cx - 70 * s, cy - 170 * s + bob, cx, cy - 172 * s + bob); g.bezierCurveTo(cx + 70 * s, cy - 170 * s + bob, cx + 120 * s, cy - 60 * s + bob, cx + 92 * s, cy + 70 * s); g.quadraticCurveTo(cx, cy + 100 * s, cx - 92 * s, cy + 70 * s);
  g.fillStyle = body; g.fill(); g.strokeStyle = INK; g.lineWidth = 10 * s; g.stroke();
  for (const [dx, dy, r] of [[-40, -110, 14], [30, -130, 10], [55, -70, 12], [-62, -40, 9], [10, -150, 7]]) E(g, cx + dx * s, cy + dy * s + bob, r * s, r * 0.8 * s, 0, dark, 0);
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(cx - 40 * s, cy - 120 * s + bob, 22 * s, 36 * s, -0.5, 0, two); g.fill();
  const lk = (o.look ?? 0) * 9 * s, ey = cy + 4 * s;
  for (const sx of [-1, 1]) {
    const ex = cx + sx * 42 * s;
    if (face === "wink" && sx === 1) { line(g, [[ex - 20 * s, ey], [ex, ey - 12 * s], [ex + 20 * s, ey]], INK, 7 * s); continue; }
    if (face === "shock") { E(g, cx + sx * 44 * s, ey - 4 * s, 34 * s, 38 * s, 0, "#ffffff", 7 * s); E(g, cx + sx * 44 * s + lk, ey - 4 * s, 7 * s, 7 * s, 0, INK, 0); continue; }
    if (face === "sly" || face === "chew") { E(g, ex, ey, 28 * s, 24 * s, 0, "#ffffff", 7 * s); E(g, ex + lk, ey + 4 * s, 12 * s, 12 * s, 0, INK, 0); g.fillStyle = body; g.fillRect(ex - 34 * s, ey - 30 * s, 68 * s, 26 * s); line(g, [[ex - 28 * s, ey - 4 * s], [ex + 28 * s, ey - 4 * s]], INK, 7 * s); continue; }
    E(g, ex, ey, 28 * s, 30 * s, 0, "#ffffff", 7 * s); E(g, ex + lk, ey + (face === "sad" ? 6 : 2) * s, 13 * s, 15 * s, 0, INK, 0); E(g, ex + lk + 5 * s, ey - 5 * s, 5 * s, 5 * s, 0, "#ffffff", 0);
    if (face === "sad") line(g, [[cx + sx * 20 * s, ey - 40 * s], [cx + sx * 64 * s, ey - 28 * s]], INK, 7 * s);
  }
  const my = cy + 52 * s;
  if (face === "shock") E(g, cx, my, 16 * s, 20 * s, 0, "#5a1a2a", 6 * s);
  else if (face === "sad") { g.beginPath(); g.arc(cx, my + 14 * s, 18 * s, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = INK; g.lineWidth = 7 * s; g.stroke(); }
  else if (face === "chew") E(g, cx, my, 20 * s, (9 + 7 * Math.abs(Math.sin(k * 1.6))) * s, 0, "#5a1a2a", 6 * s);
  else { g.beginPath(); g.arc(cx, my - 10 * s, 20 * s, Math.PI * 0.15, Math.PI * 0.85); g.strokeStyle = INK; g.lineWidth = 7 * s; g.stroke(); }
  if (face === "happy" || face === "proud" || face === "wink") for (const sx of [-1, 1]) E(g, cx + sx * 66 * s, cy + 40 * s, 14 * s, 8 * s, 0, "rgba(255,90,110,0.55)", 0);
  if (o.crown) { poly(g, [[cx - 52 * s, cy - 160 * s + bob], [cx - 60 * s, cy - 230 * s + bob], [cx - 26 * s, cy - 195 * s + bob], [cx, cy - 245 * s + bob], [cx + 26 * s, cy - 195 * s + bob], [cx + 60 * s, cy - 230 * s + bob], [cx + 52 * s, cy - 160 * s + bob]], "#ffd23a", 7 * s); E(g, cx, cy - 190 * s + bob, 8 * s, 8 * s, 0, "#d8202e", 3 * s); }
  if (o.glasses) { for (const sx of [-1, 1]) R(g, cx + sx * 42 * s - 34 * s, ey - 22 * s, 68 * s, 40 * s, 12 * s, "#111118", 5 * s); line(g, [[cx - 10 * s, ey - 8 * s], [cx + 10 * s, ey - 8 * s]], "#111118", 8 * s); g.fillStyle = "rgba(255,255,255,0.5)"; g.fillRect(cx - 66 * s, ey - 16 * s, 14 * s, 8 * s); }
  if (o.mussel) { g.save(); g.translate(cx + 30 * s, my + 8 * s); g.rotate(-0.4); E(g, 0, 0, 36 * s, 17 * s, 0, "#2a2e4a", 6 * s); line(g, [[-32 * s, 0], [32 * s, 0]], "#6a7aa8", 3 * s); g.restore(); }
}
// a clear plastic box: (cx, bottom y), half-width hw; mussel inside, flag sticker on the front; o.open, o.empty
function drawBox(g, cx, by, hw, who, o = {}) {
  const top = by - hw * 1.9;
  g.fillStyle = "rgba(235,248,255,0.35)"; g.fillRect(cx - hw, top, hw * 2, by - top);
  if (!o.empty) { E(g, cx + hw * 0.25, by - 22, 44, 20, -0.15, "#2a2e4a", 6); line(g, [[cx + hw * 0.25 - 40, by - 22], [cx + hw * 0.25 + 40, by - 26]], "#6a7aa8", 4); }
  g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(cx - hw, top, hw * 2, by - top);
  line(g, [[cx - hw + 14, top + 18], [cx - hw + 14, by - 40]], "rgba(255,255,255,0.75)", 6);
  const op = o.open ?? 0; g.save(); g.translate(cx - hw, top); g.rotate(-op * 1.9); R(g, -6, -18, hw * 2 + 12, 22, 6, "rgba(220,240,255,0.9)", 7); g.restore();
  flatFlag(g, who, cx - hw * 0.62, top + hw * 0.35, hw * 1.24, hw * 0.78, 6);
}
// the tank, 768 x 1024 (portrait). o: flags [L, R] (null = no box), pos (-1 left box .. 0 middle .. 1 right box), face, k, open (-1/1), drop (0 down .. 1 up), eat, crown, glasses, cy, s
function drawTank(g, o = {}) {
  g.clearRect(0, 0, 768, 1024); g.lineJoin = "round";
  const k = o.k ?? 0;
  const gr = g.createLinearGradient(0, 80, 0, 1000); gr.addColorStop(0, "#9fe0f2"); gr.addColorStop(0.5, "#4ab0d8"); gr.addColorStop(1, "#2a7ab8"); R(g, 30, 60, 708, 944, 26, gr, 0);
  for (let i = 0; i < 4; i++) { const x = 120 + i * 170 + Math.sin(k * 0.3 + i) * 20; poly(g, [[x, 110], [x + 60, 110], [x + 140, 980], [x + 30, 980]], "rgba(255,255,255,0.10)", 0); }
  for (let i = 0; i < 70; i++) { const x = 50 + hh(i, 1) * 670, y = 930 + hh(i, 2) * 60; E(g, x, y, 18 + hh(i, 3) * 10, 12, 0, ["#d8c8a0", "#b8a07a", "#e8dcc0", "#9a8a6a"][i % 4], 3, "rgba(36,23,38,0.5)"); }
  for (const [px, n, col] of [[80, 5, "#3a9a4a"], [690, 4, "#4aa85a"], [130, 3, "#2f8a3a"]]) for (let j = 0; j < n; j++) { const pts = []; for (let q = 0; q <= 10; q++) pts.push([px + (j - n / 2) * 14 + Math.sin(k * 0.5 + q * 0.6 + j) * q * 3, 960 - q * (32 + j * 5)]); line(g, pts, INK, 22); line(g, pts, col, 13); }
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.moveTo(30, 110); for (let x = 30; x <= 738; x += 12) g.lineTo(x, 110 + Math.sin(x / 40 + k * 0.6) * 6); g.lineTo(738, 60); g.lineTo(30, 60); g.closePath(); g.fill();
  line(g, Array.from({ length: 60 }, (_, i) => [30 + i * 12, 110 + Math.sin((30 + i * 12) / 40 + k * 0.6) * 6]), "#e8faff", 6);
  for (let i = 0; i < 9; i++) { const x = 90 + hh(i, 5) * 590, y = 960 - ((k * 22 + hh(i, 6) * 900) % 850); E(g, x + Math.sin(y / 30) * 6, y, 9 + (i % 3) * 4, 9 + (i % 3) * 4, 0, "rgba(255,255,255,0.4)", 3, "rgba(255,255,255,0.9)"); }
  const fl = o.flags ?? ["GER", "ESP"], dr = (o.drop ?? 0) * 820, by = 910 - dr, hw = 118;
  if (o.dropStr) for (const x of [230, 538]) line(g, [[x, 0], [x, by - hw * 1.9 - 10]], "#f4f4f0", 5);
  if (fl[0]) drawBox(g, 230, by, hw, fl[0], { open: o.open === -1 ? 1 : 0, empty: o.open === -1 && o.eat });
  if (fl[1]) drawBox(g, 538, by, hw, fl[1], { open: o.open === 1 ? 1 : 0, empty: o.open === 1 && o.eat });
  if (!o.noPaul) { const pos = o.pos ?? 0, ax = Math.abs(pos), cx = 384 + pos * 154, cy = lerp(o.cy ?? 420, by - hw * 1.9 - 70, smooth(ax));
    drawPaul(g, cx, cy, o.s ?? 0.95, { face: o.face, k, look: o.look ?? -pos * 0.3, grip: ax > 0.7, gripY: hw * 1.9, crown: o.crown, glasses: o.glasses, mussel: o.eat }); }
  g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 26; g.beginPath(); g.moveTo(90, 160); g.lineTo(90, 520); g.stroke(); g.lineWidth = 12; g.beginPath(); g.moveTo(130, 160); g.lineTo(130, 330); g.stroke();
  R(g, 30, 60, 708, 944, 26, null, 14); R(g, 18, 40, 732, 34, 10, "#2a3a5a", 9);
}
// shark, side view facing left, 1024 x 512, k = tail frame, jaw 0..1
const drawShark = (g, k = 0, jaw = 0.5) => { g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; const tw = Math.sin(k * 0.9) * 40;
  poly(g, [[820, 250], [990, 120 + tw], [940, 260], [990, 400 + tw], [820, 280]], "#7a8aa0", 10);
  poly(g, [[480, 160], [560, 30], [640, 170]], "#7a8aa0", 10); poly(g, [[520, 330], [600, 450], [640, 330]], "#6a7a90", 9);
  g.beginPath(); g.moveTo(90, 250 - jaw * 30); g.bezierCurveTo(200, 120, 600, 120, 840, 250); g.bezierCurveTo(600, 380, 200, 380, 90, 260 + jaw * 30); g.closePath(); g.fillStyle = "#8a9ab0"; g.fill(); g.strokeStyle = INK; g.lineWidth = 11; g.stroke();
  g.beginPath(); g.moveTo(110, 268 + jaw * 26); g.bezierCurveTo(260, 360, 600, 360, 800, 268); g.lineTo(600, 300); g.bezierCurveTo(400, 320, 220, 300, 110, 268 + jaw * 26); g.fillStyle = "#eef2f6"; g.fill();
  poly(g, [[100, 245 - jaw * 28], [330, 250], [100, 265 + jaw * 28]], "#5a1a2a", 8); for (let i = 0; i < 6; i++) { poly(g, [[118 + i * 34, 244 - jaw * 20 + i * 2], [134 + i * 34, 262], [150 + i * 34, 246 - jaw * 18 + i * 2]], "#ffffff", 4); poly(g, [[118 + i * 34, 270 + jaw * 20 - i * 2], [134 + i * 34, 254], [150 + i * 34, 268 + jaw * 18 - i * 2]], "#ffffff", 4); }
  E(g, 300, 205, 22, 24, 0, "#ffffff", 7); E(g, 296, 208, 10, 12, 0, INK, 0); line(g, [[262, 170], [330, 188]], INK, 9); for (let i = 0; i < 3; i++) line(g, [[420 + i * 30, 230], [410 + i * 30, 290]], INK, 6); };
// frying pan with flames under it (512 space)
const drawPan = (g, k = 0) => { for (let i = 0; i < 5; i++) { const x = 140 + i * 60, f = 1 + 0.25 * Math.sin(k * 2 + i * 1.3); poly(g, [[x - 26, 470], [x, 470 - 70 * f], [x + 26, 470]], "#ff8a2a", 5); poly(g, [[x - 12, 470], [x, 470 - 36 * f], [x + 12, 470]], "#ffe85a", 0); }
  R(g, 370, 380, 150, 28, 12, "#3a3236", 7); E(g, 220, 395, 170, 46, 0, "#3a3a44", 10); };
const bubble = (g) => { g.clearRect(0, 0, 512, 512); for (const [x, y, r] of [[60, 480, 16], [100, 430, 28]]) E(g, x, y, r, r, 0, "#ffffff", 7); g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); for (let i = 0; i < 12; i++) { const a = (i / 12) * two; g.moveTo(290 + Math.cos(a) * 160 + 64, 230 + Math.sin(a) * 130); g.arc(290 + Math.cos(a) * 160, 230 + Math.sin(a) * 130, 64, 0, two); } g.fill(); g.stroke(); E(g, 290, 230, 210, 170, 0, "#ffffff", 0); };
// generic gold cup (not the real trophy), 256 x 384
const drawCup = (g) => { g.clearRect(0, 0, 256, 384); g.lineJoin = "round"; const gr = g.createLinearGradient(40, 0, 220, 0); gr.addColorStop(0, "#b07a20"); gr.addColorStop(0.4, "#ffe08a"); gr.addColorStop(1, "#c8901a");
  E(g, 40, 110, 34, 50, 0, null, 14); E(g, 216, 110, 34, 50, 0, null, 14); E(g, 40, 110, 34, 50, 0, null, 7, "#e8b440"); E(g, 216, 110, 34, 50, 0, null, 7, "#e8b440");
  g.beginPath(); g.moveTo(40, 40); g.lineTo(216, 40); g.quadraticCurveTo(216, 210, 128, 230); g.quadraticCurveTo(40, 210, 40, 40); g.fillStyle = gr; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  R(g, 112, 226, 32, 70, 6, gr, 7); R(g, 66, 292, 124, 34, 8, gr, 7); R(g, 52, 324, 152, 40, 8, "#5a3a20", 7); txt(g, "1st", 128, 120, 60, "Bangers", "#7a4a10", INK, 0, 120); };
// briefcase full of euro notes, 512 x 384
const drawCase = (g) => { g.clearRect(0, 0, 512, 384); g.lineJoin = "round"; R(g, 40, 30, 432, 120, 16, "#6a4a2a", 9); R(g, 40, 160, 432, 200, 16, "#7a5432", 9);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { R(g, 60 + i * 66, 52 + r * 46, 60, 40, 4, "#a8d090", 4); txt(g, "€", 90 + i * 66, 72 + r * 46, 30, "AlfaSlab", "#3a6a2a", INK, 0, 50); }
  for (let i = 0; i < 6; i++) { R(g, 60 + i * 66, 190, 60, 150, 4, "#b8dca0", 4); txt(g, "€", 90 + i * 66, 264, 40, "AlfaSlab", "#3a6a2a", INK, 0, 50); } };
// plate of sliced octopus on a wooden plate, 512 x 256
const drawPulpo = (g) => { g.clearRect(0, 0, 512, 256); E(g, 256, 170, 230, 72, 0, "#c89a5a", 9); E(g, 256, 166, 190, 52, 0, "#d8aa6a", 4);
  for (let i = 0; i < 16; i++) { const x = 130 + hh(i, 1) * 250, y = 140 + hh(i, 2) * 50; E(g, x, y, 22, 16, 0, "#f0d8c8", 5); E(g, x, y - 6, 18, 8, 0, "#c84a3a", 0); E(g, x + 4, y + 2, 5, 4, 0, "#fff0e0", 0); } for (let i = 0; i < 40; i++) E(g, 140 + hh(i, 7) * 230, 136 + hh(i, 8) * 56, 3, 3, 0, "#c8302e", 0); };
const drawBanner = (g, a, b) => { g.clearRect(0, 0, 1024, 256); R(g, 14, 20, 996, 216, 20, "#fbf3dc", 12); g.strokeStyle = "#c8302e"; g.lineWidth = 8; g.strokeRect(36, 40, 952, 176); txt(g, a, 512, 102, 96, "Rye", "#c8302e", INK, 0, 900); txt(g, b, 512, 180, 64, "Bangers", "#24356e", INK, 0, 900); };
const drawVS = (g, a, b, label) => { g.clearRect(0, 0, 1024, 512); R(g, 20, 20, 984, 472, 40, "#24356e", 14); flatFlag(g, a, 80, 150, 300, 190, 10); flatFlag(g, b, 644, 150, 300, 190, 10); txt(g, "VS", 512, 250, 170, "Bangers", "#ffe85a", INK, 16, 300); txt(g, label, 512, 420, 84, "Bangers", "#ffffff", INK, 10, 900); txt(g, NAMES[a], 230, 105, 56, "Bangers", "#ffffff", INK, 8, 300); txt(g, NAMES[b], 794, 105, 56, "Bangers", "#ffffff", INK, 8, 300); };
const drawNo = (g) => { g.clearRect(0, 0, 512, 512); E(g, 256, 256, 220, 220, 0, "rgba(255,255,255,0.6)", 30, "#d8202e"); txt(g, "NO!", 256, 270, 210, "Bangers", "#d8202e", INK, 0, 380); };
const drawPoster = (g, top, bot) => { g.clearRect(0, 0, 512, 640); R(g, 16, 16, 480, 608, 14, "#fbf3dc", 10); txt(g, top, 256, 86, 84, "Rye", "#c8302e", INK, 0, 440); drawPaul(g, 256, 330, 0.8, { face: "happy", k: 2 }); txt(g, bot, 256, 570, 70, "Bangers", "#24356e", INK, 0, 440); };

// ---------------- props drawn on people's cards (adult rig: card 600 x 1000 px, ~463 px per metre, body centre x 300) ----------------
const oc = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")); return c; };
const XL = {
  tvcam: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, x = H.r[0], y = H.r[1] - 70; R(g, x - 130, y - 50, 190, 100, 14, "#2a2a30", 8); E(g, x - 150, y, 34, 40, 0, "#3a3a44", 8); E(g, x - 152, y, 18, 22, 0, "#6a8ac8", 5); R(g, x - 60, y - 84, 60, 36, 6, "#3a3a44", 6); txt(g, "TV", x - 30, y + 8, 44, "Bangers", "#ffe85a", INK, 0, 80); E(g, x + 40, y - 30, 7, 7, 0, "#ff3a3a", 0); },
  mic: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; line(g, [[H.r[0], H.r[1]], [H.r[0] - 20, H.r[1] - 110]], INK, 14); E(g, H.r[0] - 22, H.r[1] - 126, 22, 26, 0, "#3a3a44", 7); R(g, H.r[0] - 50, H.r[1] - 80, 56, 40, 6, "#d8202e", 5); },
  flag: (who) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g, x = H.r[0], y = H.r[1]; line(g, [[x, y + 30], [x, y - 260]], INK, 12); flatFlag(g, who, x, y - 260, 180, 115, 7); },
  scarf: (who) => (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.chin + 14; for (let i = 0; i < 3; i++) { g.fillStyle = FLAGS[who][i]; g.fillRect(232, y + i * 12, 136, 13); } g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(232, y, 136, 38); for (let i = 0; i < 3; i++) { g.fillStyle = FLAGS[who][i]; g.fillRect(320, y + 38 + i * 30, 34, 30); } g.strokeRect(320, y + 38, 34, 90); },
  pan: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; line(g, [[H.r[0], H.r[1]], [H.r[0] + 20, H.r[1] - 120]], INK, 22); line(g, [[H.r[0], H.r[1]], [H.r[0] + 20, H.r[1] - 120]], "#3a3236", 12); E(g, H.r[0] + 34, H.r[1] - 210, 80, 92, 0.15, "#3a3a44", 10); E(g, H.r[0] + 34, H.r[1] - 210, 62, 72, 0.15, "#5a5a66", 4); },
  shades: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + 0.02 * H.HH; R(g, 300 - 74, y - 16, 66, 34, 10, "#111118", 5); R(g, 300 + 8, y - 16, 66, 34, 10, "#111118", 5); line(g, [[290, y - 6], [310, y - 6]], "#111118", 6); },
  briefcase: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(oc(512, 384, drawCase), H.r[0] - 130, H.r[1] - 120, 260, 195); },
  fork: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(-0.3); R(g, -7, -10, 14, 110, 6, "#c9cdd4", 6); R(g, -22, -50, 44, 16, 6, "#c9cdd4", 6); for (let i = 0; i < 3; i++) R(g, -22 + 17 * i, -100, 10, 56, 4, "#c9cdd4", 5); E(g, 0, -112, 24, 18, 0, "#f0d8c8", 5); E(g, 0, -118, 20, 8, 0, "#c84a3a", 0); g.restore(); },
  carry: (who) => (p) => { const H = p.hands; if (H && H.r && H.l) p.g.drawImage(oc(512, 512, (q) => drawBox(q, 256, 470, 118, who)), (H.l[0] + H.r[0]) / 2 - 120, Math.min(H.l[1], H.r[1]) - 200, 240, 240); },
};
const KEEP = (v) => ({ jacket: ["#2f8a7a", "#3a9a8a"][v % 2], pants: "#c8b48a", boots: INK, hat: v % 2 ? "cap" : "hair", cap: "#2f8a7a", hair: ["#6a4a2a", "#c89a4a"][v % 2], skin: ["#f2d2b6", "#e8b894"][v % 2], ...(v % 2 ? {} : { moustache: "#6a4a2a" }) });
const FAN = (v) => ({ jacket: ["#f4f4f0", "#1a1a1a", "#f4f4f0", "#d8202e", "#1a1a1a", "#f4f4f0"][v % 6], pants: ["#1a1a1a", "#3b3f52", "#2e3a4a"][v % 3], boots: "#4a3426", skin: ["#f2d2b6", "#f5c9a0", "#e8b894", "#c99067"][v % 4], hat: v % 3 === 0 ? "cap" : "hair", cap: "#1a1a1a", hair: ["#4a3020", "#c89a4a", "#2a201a"][v % 3], ...(v % 4 === 2 ? { moustache: "#4a3020" } : {}) });
const CREW = (v) => ({ jacket: ["#3a4a5a", "#5a3a2a", "#2a3a2a"][v % 3], pants: "#2e3442", boots: INK, hat: v % 2 ? "cap" : "hair", cap: "#c8302e", hair: ["#2a201a", "#7a5a3a"][v % 2], skin: ["#f2d2b6", "#c99067", "#ecd0b6"][v % 3] });
const PM = { jacket: "#2a2f3a", pants: "#2a2f3a", boots: INK, hat: "hair", hair: "#3a3030", skin: "#eccaa8" };
const BIZ = (v) => ({ jacket: ["#5a5a62", "#4a3a2a"][v % 2], pants: ["#4a4a52", "#3a2a1a"][v % 2], boots: INK, hat: "hair", hair: ["#1a1a1a", "#8a8a90"][v % 2], skin: ["#e8c0a0", "#d9a77c"][v % 2], moustache: ["#1a1a1a", "#8a8a90"][v % 2], build: v % 2 ? "stout" : "adult" });
const GUARD = { jacket: "#16161c", pants: "#16161c", boots: INK, hat: "hair", hair: "#1a1a1a", skin: "#e0b898", build: "stout" };
const FOLK = (v) => { const c = ["#3f6fb5", "#c25a7a", "#5d7a3a", "#d9a441", "#2f5f6a", "#7b5ac9", "#e8742a"][v % 7], sk = ["#f2d2b6", "#f5c9a0", "#d9a77c", "#c99067", "#ecd0b6"][v % 5];
  return { jacket: c, pants: ["#3b3f52", "#5a4a3a", "#2e3a4a"][v % 3], boots: "#4a3426", skin: sk, hat: "hair", hair: ["#4a3020", "#2a201a", "#c89a4a"][v % 3], ...(v % 3 === 2 ? { moustache: "#4a3020" } : {}) }; };
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
  const mkA = (key) => { const [rx, ry, rz] = ROOM[key]; return (x, y, z) => [rx + x, ry + y, rz + z]; };
  const r_ = mkA("aqua"), p_ = mkA("press"), f_ = mkA("fiesta");
  const day = { light: "day", sunAz: 200, sunEl: 62, fogFar: 4000 };
  const AQ = { ...day, props: { aqua: true } }, PR = { ...day, props: { press: true } }, FI = { ...day, props: { fiesta: true } };
  const at = (Af) => ({
    fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
    ppl: (out, i, o, x, z, opt = {}) => { const [X, Y, Z] = Af(x, 0, z); out.places.push(pl(i, o, X, Y, Z, opt)); },
  });
  const A = at(r_), B = at(p_), F = at(f_);
  const mk = (H, out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); H.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256 }); };
  const wd = (H, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); H.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const tag = (H, out, key, a, b, col, x, y, z, u, w = 1.1) => { if (u > 0) H.fx(out, key, (p) => DR.nameTag(p, a, b, col), x, y, z, w * u, w * 0.25 * u, { cw: 1024, ch: 256, kind: "basic" }); };
  const bd = (H, out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; H.fx(out, key, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const confetti = (out, c, t) => { const k = Math.floor(t * 12) % 24; screenCard(out, c, "conf" + k, (p) => DR.confetti(p, k), 0.5, 576, 1024, "basic"); };
  const sparkle = (H, out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) H.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  const flashes = (H, out, t, pts, rate = 3) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; H.fx(out, "flash", (p) => DR.flash(p), x, y, z, 0.6 * k, 0.6 * k, { cw: 256, ch: 256, kind: "basic" }); } }); };
  const flagW = (H, out, who, t, x, y, z, s = 0.9) => { const k = Math.floor(t * 8) % 8; H.fx(out, "flag" + who + k, (p) => drawFlag(p.g, who, k), x, y, z, s, s, { cw: 512, ch: 512, kind: "lit" }); };
  // the tank on its pedestal (aqua origin): card 0.96 x 1.28, bottom on the pedestal top (y 1.0)
  const TW = 0.96, TH = 1.28, TY = 1.0 + TH / 2;
  const tank = (out, t, o = {}) => { const k = Math.floor(t * 12) % 48, q = (v, n = 20) => Math.round((v ?? 0) * n);
    const key = "tank" + [k, (o.flags || ["GER", "ESP"]).map((f) => f || "-").join(""), q(o.pos), o.face || "", o.open || 0, q(o.drop, 40), o.eat ? 1 : 0, o.crown ? 1 : 0, o.glasses ? 1 : 0, o.dropStr ? 1 : 0, q(o.s), q(o.cy, 1), q(o.look, 2)].join("_");
    A.fx(out, key, (p) => drawTank(p.g, { ...o, k }), 0, TY, 0.0, TW, TH, { cw: 768, ch: 1024, kind: "lit" }); };
  const pick = (t, t0, side, dur = 0.4) => { const u = smooth((t - t0) / dur); return { pos: side * u, open: u >= 1 && t > t0 + dur + 0.15 ? side : 0 }; };
  const keepers = (out, t, mood = "smile") => { const P2 = [[-0.95, -0.35], [0.95, -0.35]]; for (let i = 0; i < 2; i++) { const [x, z] = P2[i];
    A.ppl(out, 10 + i, KEEP(i), x, z, mood === "cheer" ? { expr: i ? "laugh" : "grin", arms: { l: ["up", 1], r: ["up", 1] } } : mood === "shock" ? { expr: "gasp", arms: { l: ["head", 1], r: ["head", 1] }, headTilt: Math.sin(t * 9 + i) * 4 } : mood === "worried" ? { expr: "worried", arms: { l: ["face", 1], r: ["hips", 1] } } : mood === "no" ? { expr: "stern", arms: { l: ["out", 1], r: ["out", 1] } } : { expr: mood, arms: { l: ["hips", 1], r: ["point", 1] } }); } };
  const fans = (out, t, mood, n = 4, who = "GER") => { const P2 = [[-2.3, -1.6], [2.3, -1.7], [-3.3, -2.3], [3.3, -2.4], [-1.8, -2.9], [1.8, -3.0]]; for (let i = 0; i < n; i++) { const [x, z] = P2[i];
    const extra = i % 2 ? XL.flag(who) : XL.scarf(who);
    A.ppl(out, 20 + i, { ...FAN(i), xk: mood + who + (i % 2) }, x, z, mood === "cheer" ? { expr: i % 2 ? "laugh" : "grin", arms: { l: ["up", 1], r: [Math.sin(t * 14 + i) > 0 ? "overhead" : "up", 1] }, extra }
      : mood === "sad" ? { expr: i % 2 ? "sad" : "pained", arms: { l: ["face", 1], r: ["low", 1] }, extra: XL.scarf(who), headTilt: 8 }
      : mood === "angry" ? { expr: "angry", arms: { l: ["hips", 1], r: [Math.sin(t * 16 + i) > 0 ? "up" : "shoulder", 1] }, extra: XL.scarf(who), headTilt: Math.sin(t * 12 + i) * 5 }
      : { expr: "gasp", arms: { l: ["head", 1], r: ["head", 1] }, extra: XL.scarf(who) }); } };
  const crews = (out, t) => { const P2 = [[-0.95, 0.75], [1.0, 0.8], [-0.35, 1.3]]; for (let i = 0; i < 3; i++) { const [x, z] = P2[i]; A.ppl(out, 30 + i, CREW(i), x, z, { expr: i === 2 ? "talk_o" : "grin", arms: i === 2 ? { r: ["shoulder", 1], l: ["point", 1] } : { r: ["shoulder", 1], l: ["shoulder", 1] }, extra: i === 2 ? XL.mic : XL.tvcam }); }
    flashes(A, out, t, [[-1.0, 1.9, 1.0], [1.0, 1.8, 1.1], [0.4, 2.2, 1.4]], 2.6); };

  // ---- hero (shot 1 + loop): Paul swinging onto the SPAIN box, keepers gasping, cameras flashing
  const heroCam = push(r_(0.12, 1.72, 1.95), r_(0.05, 1.7, 0), r_(0.1, 1.7, 1.65), r_(0.05, 1.68, 0), 50, 2.2);
  const heroStage = (t, out, loopK = 1) => { const u = smooth(loopK); tank(out, t, { flags: ["GER", "ESP"], pos: u, face: u > 0.85 ? "happy" : "sly", look: u > 0.5 ? 1 : 0, open: u > 0.98 ? 1 : 0, eat: u > 0.98 });
    keepers(out, t, "shock"); flashes(A, out, t, [[-0.75, 2.0, 0.6], [0.8, 2.3, 0.6], [-0.4, 1.0, 0.7]], 3.2); if (u > 0.98) A.fx(out, "spl", (p) => DR.spark(p, "#ffffff"), 0.35, 1.58, 0.05, 0.16, 0.16, { cw: 256, ch: 256, kind: "basic", rot: t * 3 }); };
  // 1 An octopus predicted the World Cup…: already swinging onto the box on frame 0
  shot({ a: 0, ...AQ, cam: heroCam, cInf: 1.2, focus: r_(0, 1.6, 0), shadowR: 8, stage(t, out) { heroStage(t, out, clamp01(0.82 + t * 0.5)); } });
  kick1(0.38);
  // 2 …perfectly.: close on Paul, mussel in his beak, a wink and sparkles
  shot({ at: S("perfectly"), ...AQ, cam: push(r_(0.35, 1.55, 1.25), r_(0.35, 1.55, 0), r_(0.33, 1.56, 1.05), r_(0.35, 1.56, 0), 44, 0.8), cInf: 2.5, focus: r_(0.3, 1.5, 0), shadowR: 6,
    stage(t, out) { tank(out, t, { pos: 1, open: 1, eat: true, face: "wink" }); sparkle(A, out, t, 0.33, 1.7, 0.05, 0.1, 4); wd(A, out, "PERFECT!", "#d8202e", 0.25, 1.98, 0.1, (t - T("perfectly") - 0.15) * 2.5, 0.5); } });
  // 3 His name was Paul.: Paul waves, name tag
  shot({ at: S("His name"), ...AQ, cam: push(r_(0, 1.75, 1.9), r_(0, 1.72, 0), r_(0, 1.75, 1.7), r_(0, 1.74, 0), 46, 1.0), cInf: 2, focus: r_(0, 1.7, 0), shadowR: 6,
    stage(t, out) { tank(out, t, { pos: 0, face: "happy", cy: 360, s: 1.15, flags: [null, null] }); tag(A, out, "tagPaul", "PAUL", "THE OCTOPUS", "#e8742a", 0, 1.42, 0.45, smooth((t - T("Paul") + 0.05) / 0.3), 0.8); } });
  // 4 He lived in a tank.: wide, the aquarium hall
  shot({ at: S("He lived"), ...AQ, cam: push(r_(1.6, 1.9, 4.6), r_(0, 1.6, -0.5), r_(1.1, 1.8, 3.9), r_(0, 1.6, -0.5), 54, 1.8), cInf: 0.8, focus: r_(0, 1.5, 0), shadowR: 10,
    stage(t, out) { tank(out, t, { pos: 0, face: "happy", cy: 560, s: 1.25, flags: [null, null] }); keepers(out, t, "smile"); wd(A, out, "HOME!", "#3a9ad8", 0.7, 2.55, 0.2, (t - T("tank") + 0.05) * 2.5, 0.6); } });
  // 5 Each game, his keepers…: two keepers walk in, each carrying a box
  shot({ at: S("Each game"), ...AQ, cam: push(r_(-0.6, 1.5, 3.4), r_(0, 1.4, -0.4), r_(-0.4, 1.5, 3.0), r_(0, 1.42, -0.4), 52, 1.6), cInf: 1.1, focus: r_(0, 1.3, -0.3), shadowR: 8,
    stage(t, out) { const l = t - S("Each game"); tank(out, t, { pos: 0, face: "happy", flags: [null, null], cy: 520 });
      A.ppl(out, 10, KEEP(0), -1.7 + glide(l / 1.2) * 0.75, -0.35, { expr: "grin", arms: { l: ["hold", 1], r: ["hold", 1] }, extra: XL.carry("GER") });
      A.ppl(out, 11, KEEP(1), 1.7 - glide(l / 1.2) * 0.75, -0.35, { expr: "smile", arms: { l: ["hold", 1], r: ["hold", 1] }, extra: XL.carry("AUS") }); } });
  // 6 …lowered two boxes.: the boxes sink in on strings; Paul looks down
  shot({ at: S("lowered"), ...AQ, cam: push(r_(0, 1.9, 2.0), r_(0, 1.7, 0), r_(0, 1.85, 1.75), r_(0, 1.65, 0), 48, 1.4), cInf: 2, focus: r_(0, 1.6, 0), shadowR: 6,
    stage(t, out) { const l = t - S("lowered"); tank(out, t, { pos: 0, face: "happy", look: 0, cy: 330, flags: ["GER", "AUS"], drop: 1 - glide(l / 1.2), dropStr: true }); wd(A, out, "SPLASH!", "#3a9ad8", 0.3, 2.2, 0.1, (l - 1.0) * 2.5, 0.55); } });
  // 7 Each box had a mussel…: close on the box: a mussel inside
  shot({ at: S("Each box"), ...AQ, cam: push(r_(-0.18, 1.3, 0.95), r_(-0.15, 1.25, 0), r_(-0.17, 1.3, 0.8), r_(-0.15, 1.25, 0), 42, 1.4), cInf: 3, focus: r_(-0.15, 1.25, 0), shadowR: 6,
    stage(t, out) { tank(out, t, { pos: 0, face: "happy", flags: ["GER", "AUS"] }); wd(A, out, "SNACK!", "#e8742a", -0.08, 1.55, 0.08, (t - T("mussel") - 0.05) * 2.5, 0.32); } });
  // 8 …and a team's flag.: big flags pop up behind the tank
  shot({ at: S("and a team's"), ...AQ, cam: push(r_(0, 1.5, 2.2), r_(0, 1.45, 0), r_(0, 1.5, 1.95), r_(0, 1.47, 0), 48, 1.4), cInf: 2, focus: r_(0, 1.4, 0), shadowR: 6,
    stage(t, out) { tank(out, t, { pos: 0, face: "happy", flags: ["GER", "AUS"], cy: 360 }); const u = smooth((t - T("flag") + 0.15) / 0.3); if (u > 0) { flagW(A, out, "GER", t, -0.7, 1.7 + 0.25 * u, -0.3, 0.7 * u); flagW(A, out, "AUS", t + 0.3, 0.75, 1.7 + 0.25 * u, -0.3, 0.7 * u); } } });
  // 9 Whichever box he opened first…: Paul sways between them, eyes darting
  shot({ at: S("Whichever"), ...AQ, cam: push(r_(0, 1.6, 1.6), r_(0, 1.55, 0), r_(0, 1.6, 1.4), r_(0, 1.56, 0), 46, 1.4), cInf: 2.2, focus: r_(0, 1.5, 0), shadowR: 6,
    stage(t, out) { const sway = Math.sin((t - S("Whichever")) * 4.5) * 0.35; tank(out, t, { pos: sway, face: "sly", look: Math.sign(sway), flags: ["GER", "AUS"] }); mk(A, out, "?", 0.0, 2.2, 0.1, (t - T("opened")) * 2.5, 0.25); } });
  // 10 …would win.: he slams onto the left box, the lid flips: WINNER!
  shot({ at: S("would win"), ...AQ, cam: push(r_(-0.15, 1.55, 1.5), r_(-0.15, 1.5, 0), r_(-0.15, 1.55, 1.3), r_(-0.15, 1.52, 0), 46, 1.0), cInf: 2.2, focus: r_(-0.15, 1.5, 0), shadowR: 6,
    stage(t, out) { const p = pick(t, S("would win") + 0.05, -1, 0.3); tank(out, t, { ...p, face: "happy", flags: ["GER", "AUS"], eat: p.open !== 0 }); wd(A, out, "WINNER!", "#ffb000", -0.15, 2.05, 0.1, (t - T("win") + 0.05) * 2.5, 0.55); } });
  kick1(T("win") + 0.05);
  // 11 Paul picked Germany.: back to the middle, then onto the German box, keepers point
  const tG1 = T("Germany", T("Paul picked"));
  shot({ at: S("Paul picked"), ...AQ, cam: push(r_(0.5, 1.65, 2.6), r_(0, 1.55, 0), r_(0.4, 1.62, 2.3), r_(0, 1.56, 0), 52, 1.2), cInf: 1.4, focus: r_(0, 1.5, 0), shadowR: 8,
    stage(t, out) { const p = pick(t, tG1 - 0.25, -1, 0.35); tank(out, t, { ...p, face: "happy", flags: ["GER", "AUS"] }); keepers(out, t, "smile"); wd(A, out, "GERMANY!", "#1a1a1a", -0.1, 2.3, 0.15, (t - tG1 - 0.1) * 2.5, 0.65); } });
  // 12 Germany won.: German fans in the hall go wild, confetti
  shot({ at: S("won"), ...AQ, cam: push(r_(0, 1.7, 3.8), r_(0, 1.7, -1.5), r_(0, 1.7, 3.4), r_(0, 1.75, -1.5), 56, 1.4), cInf: 1.0, focus: r_(0, 1.6, -1), shadowR: 10,
    stage(t, out, c) { tank(out, t, { pos: -1, open: -1, eat: true, face: "proud", flags: ["GER", "AUS"] }); fans(out, t, "cheer", 6); confetti(out, c, t); } });
  kick1(T("won") + 0.05);
  // 13 Then he picked Serbia…: Paul goes for the SERBIA box, keepers freeze
  const tSer = T("Serbia");
  shot({ at: S("Then he"), ...AQ, cam: push(r_(0.3, 1.6, 2.2), r_(0.15, 1.55, 0), r_(0.3, 1.6, 1.95), r_(0.15, 1.56, 0), 48, 1.4), cInf: 1.8, focus: r_(0.1, 1.5, 0), shadowR: 8,
    stage(t, out) { const p = pick(t, tSer - 0.25, 1, 0.45); tank(out, t, { ...p, face: "sly", flags: ["GER", "SRB"] }); keepers(out, t, t > tSer + 0.1 ? "shock" : "smile"); wd(A, out, "SERBIA?!", "#1f3a8a", 0.4, 2.2, 0.12, (t - tSer - 0.1) * 2.5, 0.6); } });
  // 14 …Germany lost!: German fans devastated under a rain cloud
  shot({ at: S("Germany lost"), ...AQ, cam: push(r_(-2.0, 1.6, 1.6), r_(-2.6, 1.6, -1.9), r_(-1.95, 1.55, 1.35), r_(-2.6, 1.55, -1.9), 50, 1.2), cInf: 1.4, focus: r_(-2.6, 1.5, -1.9), shadowR: 8,
    stage(t, out) { fans(out, t, "sad", 6); const k = Math.floor(t * 12) % 6; A.fx(out, "rain" + k, (p) => DR.rain(p, k), -2.7, 2.7, -1.7, 1.6, 1.6, { cw: 512, ch: 512, kind: "basic" }); wd(A, out, "LOST?!", "#d8202e", -2.1, 2.15, -1.0, (t - T("lost") + 0.05) * 2.5, 0.6); } });
  // 15 TV crews came…: TV cameras crowd around the tank, flashes
  shot({ at: S("TV crews"), ...AQ, cam: push(r_(0.3, 2.0, 4.6), r_(0, 1.4, 0.3), r_(0.2, 1.95, 4.1), r_(0, 1.45, 0.3), 56, 1.6), cInf: 0.8, focus: r_(0, 1.4, 0.6), shadowR: 12,
    stage(t, out) { tank(out, t, { pos: 0, face: "proud", flags: ["GER", "SRB"] }); crews(out, t); } });
  // 16 …to watch an octopus eat lunch.: Paul slurping a mussel, flashes
  shot({ at: S("to watch"), ...AQ, cam: push(r_(0.25, 1.5, 1.35), r_(0.3, 1.5, 0), r_(0.22, 1.5, 1.15), r_(0.3, 1.51, 0), 44, 1.4), cInf: 2.4, focus: r_(0.3, 1.5, 0), shadowR: 6,
    stage(t, out) { tank(out, t, { pos: 1, open: 1, eat: true, face: "chew", flags: ["GER", "SRB"] }); flashes(A, out, t, [[-0.2, 1.9, 0.4], [0.75, 1.3, 0.4]], 3.4); wd(A, out, "SLURP!", "#e8742a", 0.05, 1.98, 0.1, (t - T("lunch") + 0.05) * 2.5, 0.45); } });
  // 17 Then the semifinal.: the VS board
  const tSemi = T("semifinal");
  shot({ at: S("Then the"), ...AQ, cam: push(r_(0, 2.0, 2.6), r_(0, 2.15, -0.2), r_(0, 2.05, 2.25), r_(0, 2.2, -0.2), 50, 1.6), cInf: 1.2, focus: r_(0, 2.2, -0.2), shadowR: 8,
    stage(t, out) { tank(out, t, { pos: 0, face: "sly", flags: ["GER", "ESP"], cy: 400 }); const u = smooth((t - tSemi + 0.1) / 0.35); A.fx(out, "vsGE", (p) => drawVS(p.g, "GER", "ESP", "SEMIFINAL"), 0, 2.65, 0.25, 1.2 * (0.5 + 0.5 * u), 0.6 * (0.5 + 0.5 * u), { cw: 1024, ch: 512, kind: "basic" }); } });
  // 18 Germany against Spain.: the two boxes, keepers sweating, fans holding their breath
  shot({ at: S("Germany against"), ...AQ, cam: push(r_(-0.3, 1.6, 3.2), r_(0, 1.5, -0.6), r_(-0.2, 1.6, 2.8), r_(0, 1.52, -0.6), 54, 1.6), cInf: 1.2, focus: r_(0, 1.4, -0.3), shadowR: 10,
    stage(t, out) { const sway = Math.sin((t - S("Germany against")) * 3.5) * 0.3; tank(out, t, { pos: sway, face: "sly", look: Math.sign(sway), flags: ["GER", "ESP"] }); keepers(out, t, "worried"); fans(out, t, "shock", 4); } });
  // 19 Paul… picked Spain.: SLAM onto the Spain box
  const tP3 = T("Paul", T("against")), tPS = T("Spain", tP3);
  shot({ at: tP3 - 0.1, ...AQ, cam: push(r_(0.2, 1.55, 1.7), r_(0.15, 1.5, 0), r_(0.2, 1.55, 1.45), r_(0.15, 1.5, 0), 46, 1.0), cInf: 2.2, focus: r_(0.15, 1.5, 0), shadowR: 6,
    stage(t, out) { const p = pick(t, tPS - 0.3, 1, 0.3); tank(out, t, { ...p, face: t > tPS ? "happy" : "sly", flags: ["GER", "ESP"] }); wd(A, out, "SPAIN!", "#d8202e", 0.35, 2.2, 0.1, (t - tPS) * 2.5, 0.55); } });
  kick1(tPS + 0.02);
  // 20 Spain won.: the result board slams in over the tank
  const tSW = T("won", tPS);
  shot({ at: S("Spain won", tPS), ...AQ, cam: push(r_(0, 1.9, 2.8), r_(0, 2.0, -0.3), r_(0, 1.9, 2.5), r_(0, 2.02, -0.3), 52, 1.0), cInf: 1.2, focus: r_(0, 2.0, -0.3), shadowR: 8,
    stage(t, out) { tank(out, t, { pos: 1, open: 1, eat: true, face: "proud", flags: ["GER", "ESP"] }); bd(A, out, "bSW", "SPAIN", "WINS!", "#d8202e", 0, 2.5, 0.25, (t - tSW + 0.2) * 2.2, 1.2); } });
  // 21 And German fans turned on him.: angry fans at the tank, Paul shocked
  shot({ at: S("And German"), ...AQ, cam: push(r_(0.9, 1.35, 1.9), r_(-0.6, 1.6, -1.2), r_(0.8, 1.35, 1.6), r_(-0.6, 1.62, -1.2), 54, 1.6), cInf: 1.3, focus: r_(-0.5, 1.5, -1), shadowR: 10,
    stage(t, out) { tank(out, t, { pos: 0, face: "shock", flags: [null, null], cy: 620 }); fans(out, t, "angry", 6); wd(A, out, "BOOO!", "#1a1a1a", -1.3, 2.4, -0.8, (t - T("turned") + 0.05) * 2.5, 0.8); } });
  // 22 People suggested frying him…: a fan with a frying pan; thought bubble: Paul in a pan
  shot({ at: S("People suggested"), ...AQ, cam: push(r_(-1.6, 1.6, 1.3), r_(-2.0, 1.75, -1.6), r_(-1.55, 1.6, 1.05), r_(-2.0, 1.78, -1.6), 52, 1.4), cInf: 1.4, focus: r_(-2.2, 1.6, -1.6), shadowR: 8,
    stage(t, out) { const k = Math.floor(t * 10) % 6; A.ppl(out, 20, { ...FAN(0), xk: "pan" }, -2.4, -1.6, { expr: "sly", arms: { r: ["up", 1], l: ["hips", 1] }, extra: (p) => { XL.scarf("GER")(p); XL.pan(p); } });
      const u = smooth((t - T("frying") + 0.15) / 0.3); if (u > 0) A.fx(out, "bubPan" + k, (p) => { bubble(p.g); p.g.save(); p.g.translate(290, 240); p.g.scale(0.62, 0.62); p.g.translate(-256, -330); drawPan(p.g, k); drawPaul(p.g, 220, 300, 0.75, { face: "shock", k }); p.g.restore(); }, -1.5, 2.3, -1.4, 1.0 * u, 1.0 * u, { cw: 512, ch: 512, kind: "basic" });
      wd(A, out, "SIZZLE!", "#ff8a2a", -2.0, 1.25, -1.0, (t - T("frying") - 0.2) * 2.5, 0.6); } });
  // 23 …or feeding him to sharks.: a shark glides up to the tank, grinning; Paul shocked
  const tSh = T("sharks");
  shot({ at: S("or feeding"), ...AQ, cam: push(r_(0.0, 1.65, 2.4), r_(0, 1.65, 0), r_(0.0, 1.65, 2.1), r_(0, 1.66, 0), 50, 1.4), cInf: 1.6, focus: r_(0, 1.6, 0), shadowR: 6,
    stage(t, out) { const l = t - S("or feeding"), k = Math.floor(t * 12) % 8; tank(out, t, { pos: 0, face: "shock", flags: [null, null], cy: 330 }); A.fx(out, "shark" + k + (l > 0.8 ? "o" : "c"), (p) => drawShark(p.g, k, l > 0.8 ? 0.9 : 0.3), 1.6 - glide(l / 1.0) * 1.25, 1.45, 0.25, 1.3, 0.65, { cw: 1024, ch: 512, kind: "lit" });
      wd(A, out, "CHOMP?!", "#d8202e", -0.15, 2.3, 0.3, (t - tSh) * 2.5, 0.55); } });
  // 24 Wait, it gets worse.: snap zoom onto Paul: UH-OH
  shot({ at: S("Wait"), ...AQ, cam: (l) => ({ pos: r_(0, 1.75, 2.4 - glide(l / 0.35) * 1.3), look: r_(0, 1.74, 0), fov: 44, roll: 0.03 * Math.sin(l * 4) }), cInf: 2.5, focus: r_(0, 1.7, 0), shadowR: 6,
    stage(t, out) { tank(out, t, { pos: 0, face: "shock", flags: [null, null], cy: 330, s: 1.15 }); wd(A, out, "UH-OH", "#d8202e", 0.0, 2.12, 0.1, (t - T("worse") + 0.05) * 2.5, 0.42); } });
  kick1(T("Wait") + 0.03);
  // 25 Spain's Prime Minister got involved.: the press room, the PM at the podium, name tag
  shot({ at: S("Spain's"), ...PR, cam: push(p_(0.3, 1.6, 3.4), p_(0, 1.6, -0.5), p_(0.25, 1.6, 3.0), p_(0, 1.62, -0.5), 46, 1.8), cInf: 1.2, focus: p_(0, 1.6, -0.4), shadowR: 8,
    stage(t, out) { B.ppl(out, 40, PM, 0, -0.55, { expr: Math.floor(t * 7) % 2 ? "talk_o" : "talk_e", arms: { l: ["point", 1], r: ["hips", 1] } });
      tag(B, out, "tagPM", "SPAIN'S", "PRIME MINISTER", "#c8202e", 0, 0.95, 0.6, smooth((t - T("Minister") + 0.05) / 0.3), 0.9); flashes(B, out, t, [[-1.2, 1.7, 0.6], [1.3, 1.5, 0.7]], 2.4); } });
  // 26 He said he was worried…: close, sweating, hands on face
  shot({ at: S("He said"), ...PR, cam: push(p_(0, 1.65, 1.6), p_(0, 1.65, -0.55), p_(0, 1.65, 1.4), p_(0, 1.66, -0.55), 42, 1.2), cInf: 2.4, focus: p_(0, 1.65, -0.55), shadowR: 6,
    stage(t, out) { B.ppl(out, 40, PM, 0, -0.55, { expr: "worried", arms: { l: ["face", 1], r: ["face", 1] }, headTilt: Math.sin(t * 6) * 4 });
      for (let i = 0; i < 2; i++) B.fx(out, "sweat", (p) => DR.sweat(p), i ? 0.22 : -0.22, 1.95 - ((t * 0.6 + i * 0.4) % 0.3), -0.3, 0.07, 0.07, { cw: 128, ch: 128, kind: "basic" });
      wd(B, out, "WORRIED!", "#24356e", 0.0, 2.2, -0.3, (t - T("worried") + 0.05) * 2.5, 0.55); } });
  // 27 …and thought about sending him protection.: bodyguards in sunglasses around the tank; Paul in shades too
  shot({ at: S("and thought"), ...AQ, cam: push(r_(0, 1.55, 3.6), r_(0, 1.6, -0.3), r_(0, 1.55, 3.2), r_(0, 1.62, -0.3), 52, 1.8), cInf: 1.1, focus: r_(0, 1.5, -0.2), shadowR: 8,
    stage(t, out) { tank(out, t, { pos: 0, face: "proud", flags: [null, null], cy: 380, glasses: true }); const l = t - S("and thought");
      [[-0.85, -0.35], [0.85, -0.35], [-1.6, 0.4], [1.6, 0.4]].forEach(([x, z], i) => { if (l > 0.2 + i * 0.18) A.ppl(out, 50 + i, GUARD, x, z, { expr: "stern", arms: { l: ["hold", 1], r: ["hold", 1] }, extra: XL.shades }); });
      wd(A, out, "PROTECTION!", "#1a1a1a", 0, 2.55, 0.1, (t - T("protection") + 0.05) * 2.5, 0.85); } });
  // 28 Then Paul picked Spain to win the final.: NETHERLANDS vs SPAIN, Paul goes right
  const tF0 = T("Then Paul"), tFin = T("Spain", tF0);
  shot({ at: tF0 - 0.1, ...AQ, cam: push(r_(-0.2, 1.6, 2.0), r_(0, 1.55, 0), r_(-0.2, 1.6, 1.75), r_(0, 1.56, 0), 48, 1.6), cInf: 1.8, focus: r_(0, 1.5, 0), shadowR: 6,
    stage(t, out) { const p = pick(t, tFin - 0.25, 1, 0.35); tank(out, t, { ...p, face: "happy", flags: ["NED", "ESP"] }); wd(A, out, "FINAL!", "#ffb000", 0, 2.25, 0.1, (t - T("final") + 0.05) * 2.5, 0.55); } });
  kick1(tFin + 0.05);
  // 29 Spain won.: confetti, Paul wears a crown, a gold cup rises
  const tSW2 = T("won", tFin);
  shot({ at: S("Spain won", tFin), ...AQ, cam: push(r_(0, 1.75, 2.5), r_(0, 1.8, 0), r_(0, 1.75, 2.2), r_(0, 1.82, 0), 50, 1.6), cInf: 1.5, focus: r_(0, 1.7, 0), shadowR: 6,
    stage(t, out, c) { tank(out, t, { pos: 0, face: "proud", flags: [null, null], cy: 430, crown: true, s: 1.1 }); const u = smooth((t - tSW2 + 0.2) / 0.4); if (u > 0) A.fx(out, "cup", (p) => drawCup(p.g), 0.3, 1.2 + 0.1 * u, 0.3, 0.42 * u, 0.63 * u, { cw: 256, ch: 384, kind: "lit" }); confetti(out, c, t); } });
  // 30 Eight out of eight.: the 8/8 board, keepers cheer
  shot({ at: S("Eight"), ...AQ, cam: push(r_(0.4, 1.8, 3.6), r_(0, 2.0, -0.4), r_(0.35, 1.8, 3.2), r_(0, 2.05, -0.4), 54, 1.2), cInf: 1.0, focus: r_(0, 1.9, -0.3), shadowR: 8,
    stage(t, out) { tank(out, t, { pos: 0, face: "proud", flags: [null, null], cy: 430, crown: true, s: 1.1 }); keepers(out, t, "cheer"); bd(A, out, "b88", "8 / 8", "PERFECT", "#2a8a3a", 0, 2.8, 0.2, (t - T("Eight") + 0.15) * 2.2, 1.3); } });
  // 31 Spanish businessmen offered…: two businessmen with a briefcase of euros
  shot({ at: S("Spanish"), ...AQ, cam: push(r_(0.4, 1.55, 3.6), r_(0, 1.5, 0), r_(0.3, 1.55, 3.2), r_(0, 1.52, 0), 56, 1.6), cInf: 1.2, focus: r_(0, 1.4, -0.2), shadowR: 8,
    stage(t, out) { tank(out, t, { pos: 0, face: "happy", flags: [null, null], cy: 420 }); A.ppl(out, 60, { ...BIZ(0), xk: "case" }, -0.8, 0.6, { expr: "barker_o", arms: { r: ["hold", 1], l: ["out", 1] }, extra: XL.briefcase });
      A.ppl(out, 61, BIZ(1), 0.8, 0.6, { expr: "grin", arms: { r: ["point", 1], l: ["hips", 1] } }); sparkle(A, out, t, -0.8, 1.15, 0.9, 0.1, 3); } });
  // 32 …thirty thousand euros for him.: the money board
  shot({ at: S("thirty"), ...AQ, cam: push(r_(-0.55, 1.6, 2.4), r_(-0.55, 1.75, 0), r_(-0.5, 1.6, 2.1), r_(-0.55, 1.78, 0), 48, 1.2), cInf: 1.6, focus: r_(-0.8, 1.6, 0.1), shadowR: 8,
    stage(t, out) { A.ppl(out, 60, { ...BIZ(0), xk: "case" }, -0.8, 0.6, { expr: "barker_e", arms: { r: ["hold", 1], l: ["up", 1] }, extra: XL.briefcase }); tank(out, t, { pos: 0, face: "shock", flags: [null, null], cy: 420 });
      const u = smooth((t - T("thirty") + 0.1) / 0.3); if (u > 0) A.fx(out, "money", (p) => DR.money(p, "€30,000", "#2a6a2a"), -0.55, 2.3, 0.4, 0.9 * u, 0.45 * u, { cw: 512, ch: 256, kind: "basic", rot: Math.sin(t * 6) * 0.04 }); } });
  // 33 To star at their octopus festival.: the fair: banner, string flags, a poster of Paul
  shot({ at: S("To star"), ...FI, cam: push(f_(0.6, 1.7, 3.6), f_(0, 1.9, -2.0), f_(0.5, 1.7, 3.2), f_(0, 1.95, -2.0), 56, 1.6), cInf: 1.0, focus: f_(0, 1.9, -2), shadowR: 12,
    stage(t, out) { F.fx(out, "banner", (p) => drawBanner(p.g, "OCTOPUS FESTIVAL", "STAR GUEST: PAUL?"), 0.2, 3.0, -4.3, 3.2, 0.8, { cw: 1024, ch: 256, kind: "lit" }); F.fx(out, "poster", (p) => drawPoster(p.g, "STAR GUEST", "PAUL!"), 1.6, 1.75, -4.35, 0.8, 1.0, { cw: 512, ch: 640, kind: "lit" });
      [[-1.2, -1.6], [0.6, -2.2], [2.4, -1.8], [-0.4, -0.6]].forEach(([x, z], i) => F.ppl(out, 70 + i, FOLK(i + 2), x, z, { expr: i % 2 ? "laugh" : "grin", arms: { l: [Math.sin(t * 14 + i) > 0 ? "up" : "out", 1], r: ["up", 1] } })); sparkle(F, out, t, 1.6, 2.2, -4.2, 0.15, 3); } });
  // 34 Where people eat octopus.: people tucking into plates of octopus
  shot({ at: S("Where"), ...FI, cam: push(f_(1.2, 1.5, 1.6), f_(1.2, 1.15, -1.4), f_(1.15, 1.47, 1.35), f_(1.2, 1.15, -1.4), 52, 1.2), cInf: 1.6, focus: f_(1.2, 1.1, -1.4), shadowR: 8,
    stage(t, out) { for (const x of [0.3, 1.2, 2.1]) F.fx(out, "pulpo", (p) => drawPulpo(p.g), x, 0.86, -0.95, 0.7, 0.35, { cw: 512, ch: 256, kind: "lit" });
      [[0.3, -1.85], [1.2, -1.85], [2.1, -1.85]].forEach(([x, z], i) => F.ppl(out, 75 + i, FOLK(i + 4), x, z, { expr: Math.floor(t * 6 + i) % 2 ? "chew" : "lick", arms: { r: ["face", 1], l: ["hold", 1] }, extra: XL.fork }));
      wd(F, out, "YUM!", "#e8742a", 1.9, 1.95, -1.2, (t - T("eat", T("Where")) + 0.05) * 2.5, 0.5); } });
  // 35 …octopus.: Paul hears it: horrified close-up
  const tO = T("octopus", T("eat", T("Where")));
  shot({ at: tO - 0.05, ...AQ, cam: push(r_(0, 1.75, 1.6), r_(0, 1.75, 0), r_(0, 1.75, 1.3), r_(0, 1.76, 0), 44, 0.9), cInf: 2.5, focus: r_(0, 1.7, 0), shadowR: 6,
    stage(t, out) { tank(out, t, { pos: 0, face: "shock", flags: [null, null], cy: 360, s: 1.2 }); wd(A, out, "WHAT?!", "#d8202e", 0.0, 2.15, 0.1, (t - tO - 0.2) * 2.5, 0.45); } });
  kick1(tO + 0.15);
  // 36 Germany said no.: the keepers block the tank, the big NO stamp slams on
  const tNo = T("no", T("said", tO));
  shot({ at: S("Germany said"), ...AQ, cam: push(r_(0.3, 1.6, 2.9), r_(0, 1.6, -0.2), r_(0.25, 1.6, 2.6), r_(0, 1.62, -0.2), 52, 1.3), cInf: 1.3, focus: r_(0, 1.5, -0.2), shadowR: 8,
    stage(t, out) { tank(out, t, { pos: 0, face: "happy", flags: [null, null], cy: 400 }); keepers(out, t, "no"); const u = smooth((t - tNo + 0.05) / 0.15); if (u > 0) A.fx(out, "no", (p) => drawNo(p.g), 0.0, 2.45, 0.3, 0.9 * (1.6 - 0.6 * u), 0.9 * (1.6 - 0.6 * u), { cw: 512, ch: 512, kind: "basic", rot: -0.15 }); } });
  kick1(tNo + 0.05);
  // 37 The smartest football expert on Earth… was: loop: shot 1's view, Paul in the middle with tiny glasses, ready to swing onto the Spain box
  const tL = S("The smartest");
  shot({ at: tL, ...AQ, cam: heroCam, cInf: 1.2, focus: r_(0, 1.6, 0), shadowR: 8, loop: true, stage(t, out) { const k = clamp01((t - tL) / Math.max(0.3, END - tL - 0.05)); heroStage(t, out, 0.82 * k); } });
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
