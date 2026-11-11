// Shot plan for "Mike the Headless Chicken" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Hook-first, a cut every ~1.7 s, loop ending (the statue in the last shot hands over to Mike strutting in shot 1).
import { FARM, DESERT, MOTEL, TOUR, FEST, ROOM } from "./world.js";
import { INK, mix, fxBurst } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1308;
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
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const q8 = (v, n = 8) => Math.round(v * n) / n;

// ---------------- text ----------------
const txt = (g, s, x, y, size, font, fill, stroke = INK, lw = 0, maxW = 0) => {
  g.font = `${size}px ${font}`; if (maxW) { let k = size; while (g.measureText(s).width > maxW && k > 8) { k *= 0.94; g.font = `${k}px ${font}`; } }
  g.textAlign = "center"; g.textBaseline = "middle"; if (lw) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = lw; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y);
};

// ---------------- Mike (and the hens) ----------------
const MIKE_C = { body: "#f8f2e6", shade: "#ddcfb6", tail: "#2a3a3e", tail2: "#3f5f52", leg: "#f0b43a", comb: "#e0332f", stump: "#f4b0aa", stumpIn: "#e88a86", wing: "#efe4cc", ink: INK };
const METAL_C = { body: "#9a7458", shade: "#6e5040", tail: "#5a4434", tail2: "#7a5a44", leg: "#6e5040", comb: "#9a7458", stump: "#8a6650", stumpIn: "#6e5040", wing: "#8a6650", ink: "#2a1c16" };
const HEN_C = { body: "#c47c3e", shade: "#9a5a2a", tail: "#7a4520", tail2: "#a0602e", leg: "#e8b040", comb: "#e0332f", stump: "#f4b0aa", stumpIn: "#e88a86", wing: "#ad6a32", ink: INK };
/** side view, facing right, 512 x 512 canvas, feet on y 498.
 *  o = { head, ph (walk phase 0..1, -1 standing), neck (-1 peck .. 0 .. 1 crow), puff 0..1, wing 0..1 (raised), mood, metal, hen, lie } */
function drawMike(g, o = {}) {
  const { head = false, ph = -1, neck = 0, puff = 0, wing = 0, mood = "normal", metal = false, hen = false } = o;
  const C = metal ? METAL_C : hen ? HEN_C : MIKE_C, two = Math.PI * 2, walk = ph >= 0;
  g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; g.lineCap = "round";
  g.save(); if (hen) { g.translate(256, 498); g.scale(0.82, 0.82); g.translate(-256, -498); }
  const bob = walk ? Math.abs(Math.sin(ph * two)) * 9 : 0, bx = 232, by = 316 - bob - puff * 8;
  // tail plumes (behind)
  const tx = bx - 92, ty = by - 26;
  const plumes = hen ? [[-62, -78, 30], [-78, -40, 26]] : [[-22, -166, 36], [-64, -138, 32], [-96, -86, 28], [-108, -30, 24]];
  plumes.forEach(([dx, dy, w], i) => { g.fillStyle = i % 2 ? C.tail2 : C.tail; g.strokeStyle = C.ink; g.lineWidth = 8; g.beginPath(); g.moveTo(tx + 26, ty + 34); g.quadraticCurveTo(tx + dx * 0.25, ty + dy * 1.05, tx + dx, ty + dy); g.quadraticCurveTo(tx + dx * 0.5 + w, ty + dy * 0.45 + w, tx + 42, ty + 30); g.closePath(); g.fill(); g.stroke(); });
  // far wing when raised
  const wingShape = (col, k, far) => { g.save(); g.translate(bx + 34, by - 34); g.rotate(-1.35 * k + (far ? 0.25 : 0)); g.fillStyle = col; g.strokeStyle = C.ink; g.lineWidth = 9; g.beginPath(); g.moveTo(10, -6); g.quadraticCurveTo(-60, -52, -150, -24); for (let f = 0; f < 4; f++) { const xx = -150 + f * 26, yy = -24 + f * 20; g.quadraticCurveTo(xx - 12, yy + 22, xx + 18, yy + 22); } g.quadraticCurveTo(-30, 52, 14, 30); g.closePath(); g.fill(); g.stroke(); g.restore(); };
  if (wing > 0.05) wingShape(mix(C.wing, C.ink, 0.25), wing, true);
  // legs
  for (const [k, off] of [[1, 0.5], [0, 0]]) {
    const a = walk ? Math.sin((ph + off) * two) : 0, lift = walk ? Math.max(0, -Math.cos((ph + off) * two)) * 28 : 0;
    const hip = [bx + 22 - k * 26, by + 66], foot = [bx + 18 - k * 26 + a * 44, 494 - lift], knee = [(hip[0] + foot[0]) / 2 - 16, (hip[1] + foot[1]) / 2 + 2];
    for (const [w, c] of [[22, C.ink], [12, k ? mix(C.leg, C.ink, 0.25) : C.leg]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(...hip); g.quadraticCurveTo(...knee, ...foot); g.stroke(); g.beginPath(); for (const [dx, dy] of [[38, 2], [26, -12], [-20, -3]]) { g.moveTo(...foot); g.lineTo(foot[0] + dx, foot[1] + dy); } g.stroke(); }
  }
  // body
  const rx = 122 + puff * 14, ry = 88 + puff * 12;
  g.fillStyle = C.body; g.strokeStyle = C.ink; g.lineWidth = 10; g.beginPath(); g.ellipse(bx, by, rx, ry, -0.12, 0, two); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.ellipse(bx, by, rx - 5, ry - 5, -0.12, 0, two); g.clip(); g.fillStyle = C.shade; g.beginPath(); g.ellipse(bx + 6, by + 74, 130, 44, -0.1, 0, two); g.fill();
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(bx + 40, by - 50, 60, 22, -0.3, 0, two); g.fill(); g.restore();
  if (metal) { g.fillStyle = C.ink; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(bx - 80 + i * 20, by + 30 + Math.sin(i) * 20, 4, 0, two); g.fill(); } g.strokeStyle = "rgba(255,210,160,0.4)"; g.lineWidth = 6; g.beginPath(); g.arc(bx + 20, by - 10, 70, 3.6, 4.6); g.stroke(); }
  // neck: base on the front of the body, top N; peck reaches down-forward, crow stretches up
  const B0 = [bx + 76, by - 46], N0 = [bx + 126, by - 166], Np = [bx + 214, by + 46], Nc = [bx + 136, by - 232];
  const N = neck < 0 ? [lerp(N0[0], Np[0], -neck), lerp(N0[1], Np[1], -neck)] : [lerp(N0[0], Nc[0], neck), lerp(N0[1], Nc[1], neck)];
  const Cq = [B0[0] + (N[0] - B0[0]) * 0.5 + 18 * (neck < 0 ? -1 : 1), B0[1] + (N[1] - B0[1]) * 0.5 - (neck < 0 ? 30 : 0)];
  g.lineCap = "butt";
  for (const [w, c] of [[78, C.ink], [64, C.body]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(...B0); g.quadraticCurveTo(...Cq, ...N); g.stroke(); }
  g.lineCap = "round";
  // hackle feathers round the base of the neck
  g.fillStyle = C.body; g.strokeStyle = C.ink; g.lineWidth = 6;
  for (let i = 0; i < 5; i++) { const x = B0[0] - 40 + i * 18, y = B0[1] + 8 + Math.abs(i - 2) * 6; g.beginPath(); g.moveTo(x - 14, y - 16); g.lineTo(x + 4, y + 30); g.lineTo(x + 16, y - 14); g.fill(); g.stroke(); }
  const dx = N[0] - Cq[0], dy = N[1] - Cq[1], dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl, ang = Math.atan2(uy, ux);
  if (head) {
    g.save(); g.translate(N[0] + ux * 16, N[1] + uy * 16); g.rotate(ang + Math.PI / 2);
    const s = hen ? 0.85 : 1; g.scale(s, s);
    g.fillStyle = C.comb; g.strokeStyle = C.ink; g.lineWidth = 7; for (const [cx, cy, r] of hen ? [[-4, -38, 12], [12, -36, 11]] : [[-18, -36, 15], [0, -44, 17], [18, -38, 15]]) { g.beginPath(); g.arc(cx, cy, r, 0, two); g.fill(); g.stroke(); }
    g.fillStyle = C.body; g.beginPath(); g.arc(0, 0, 38, 0, two); g.fill(); g.stroke();
    g.fillStyle = "#f2b83a"; g.beginPath(); g.moveTo(30, -12); g.lineTo(64, 0); g.lineTo(30, 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = C.comb; g.beginPath(); g.moveTo(26, 14); g.quadraticCurveTo(42, 50, 24, 56); g.quadraticCurveTo(10, 46, 20, 16); g.fill(); g.stroke();
    const ex = 10, ey = -8;
    if (mood === "shock") { g.fillStyle = "#fff"; g.beginPath(); g.arc(ex, ey, 15, 0, two); g.fill(); g.stroke(); g.fillStyle = C.ink; g.beginPath(); g.arc(ex + 4, ey, 5, 0, two); g.fill(); g.lineWidth = 5; g.beginPath(); g.moveTo(ex - 14, ey - 24); g.lineTo(ex + 12, ey - 28); g.stroke(); }
    else if (mood === "happy") { g.lineWidth = 6; g.beginPath(); g.arc(ex, ey + 5, 9, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (mood === "worried") { g.fillStyle = C.ink; g.beginPath(); g.arc(ex + 2, ey, 7, 0, two); g.fill(); g.lineWidth = 5; g.beginPath(); g.moveTo(ex - 12, ey - 14); g.lineTo(ex + 10, ey - 20); g.stroke(); }
    else { g.fillStyle = C.ink; g.beginPath(); g.arc(ex + 2, ey, 7, 0, two); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(ex + 4, ey - 3, 2.4, 0, two); g.fill(); }
    g.restore();
  } else {
    // the stump: a neat rounded top with a ruff of feathers, no blood
    g.save(); g.translate(N[0], N[1]); g.rotate(ang + Math.PI / 2);
    g.fillStyle = C.body; g.strokeStyle = C.ink; g.lineWidth = 6;
    for (let i = 0; i < 7; i++) { const x = -34 + i * 11.3; g.beginPath(); g.moveTo(x - 7, 6); g.lineTo(x, -14 - (i % 2) * 6); g.lineTo(x + 7, 6); g.fill(); g.stroke(); }
    g.fillStyle = C.stump; g.lineWidth = 7; g.beginPath(); g.ellipse(0, 0, 31, 11, 0, 0, two); g.fill(); g.stroke();
    g.fillStyle = C.stumpIn; g.beginPath(); g.ellipse(-2, 1, 13, 4.5, 0, 0, two); g.fill();
    g.restore();
  }
  if (wing <= 0.05) { // folded near wing
    g.fillStyle = C.wing; g.strokeStyle = C.ink; g.lineWidth = 9; g.beginPath(); g.ellipse(bx - 8, by - 4, 80, 50, -0.22, 0, two); g.fill(); g.stroke();
    g.lineWidth = 6; for (let f = 0; f < 3; f++) { g.beginPath(); g.arc(bx - 70 + f * 26, by + 26 - f * 6, 18, 0.2, 2.4); g.stroke(); }
  } else wingShape(C.wing, wing, false);
  g.restore();
}

// ---------------- 2D drawings ----------------
const DR = {
  farmSign: (p) => { const g = p.g; g.fillStyle = "#8a6440"; g.fillRect(0, 0, 1024, 384); for (let y = 0; y < 384; y += 96) { g.fillStyle = y % 192 ? "#94704a" : "#7e5a38"; g.fillRect(0, y, 1024, 92); g.fillStyle = "rgba(40,20,10,0.5)"; g.fillRect(0, y + 92, 1024, 4); } g.strokeStyle = INK; g.lineWidth = 16; g.strokeRect(8, 8, 1008, 368); g.fillStyle = "#3a2a1a"; for (const [x, y] of [[40, 40], [984, 40], [40, 344], [984, 344]]) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); } txt(g, "OLSEN FARM", 512, 150, 150, "Rye", "#f4e6c4", "#2a1a10", 14, 940); txt(g, "FRUITA, COLO.", 512, 292, 86, "Rye", "#f2c45a", "#2a1a10", 10, 900); },
  sideshow: (p) => { const g = p.g; g.fillStyle = "#1f1a3a"; g.fillRect(0, 0, 1024, 512); g.strokeStyle = "#e8b83a"; g.lineWidth = 22; g.strokeRect(14, 14, 996, 484); for (let i = 0; i < 26; i++) for (const y of [14, 498]) { g.fillStyle = i % 2 ? "#fff2b0" : "#ffd060"; g.beginPath(); g.arc(30 + i * 37.5, y, 9, 0, 7); g.fill(); }
    txt(g, "SEE IT ALIVE!", 512, 78, 58, "Rye", "#f4ecd8", INK, 8, 700); txt(g, "MIRACLE MIKE", 452, 190, 132, "Rye", "#e8402e", "#ffe08a", 14, 800); txt(g, "THE HEADLESS CHICKEN", 452, 304, 74, "AlfaSlab", "#ffffff", INK, 10, 800);
    g.save(); g.translate(150, 420); g.scale(0.36, 0.36); g.translate(-256, -256); drawMike(g, { puff: 0.5 }); g.restore();
    const cx = 880, cy = 400; g.fillStyle = "#ffd23a"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 78 : 104; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); txt(g, "25¢", cx, cy + 4, 84, "AlfaSlab", "#c4302a", INK, 6); txt(g, "ONE LOOK", 470, 420, 50, "Rye", "#ffd060", INK, 6); },
  truckBanner: (p) => { const g = p.g; g.fillStyle = "#f4ecd8"; g.fillRect(0, 0, 1024, 256); g.strokeStyle = "#c4302a"; g.lineWidth = 18; g.strokeRect(9, 9, 1006, 238); txt(g, "MIRACLE MIKE", 512, 98, 120, "Rye", "#c4302a", INK, 10, 960); txt(g, "THE HEADLESS WONDER", 512, 196, 62, "AlfaSlab", "#1f2a5a", INK, 0, 900); },
  neon: (p, on) => { const g = p.g; g.clearRect(0, 0, 384, 768); g.fillStyle = "#1a2244"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(40, 20, 304, 600, 30); g.fill(); g.stroke(); g.fillStyle = "#1a2244"; g.beginPath(); g.moveTo(80, 620); g.lineTo(304, 620); g.lineTo(192, 740); g.closePath(); g.fill(); g.stroke();
    g.shadowColor = "#ff4a5a"; g.shadowBlur = on ? 34 : 0; g.strokeStyle = on ? "#ff6a72" : "#6a2a3a"; g.lineWidth = 10; g.beginPath(); g.roundRect(62, 42, 260, 556, 22); g.stroke();
    "MOTEL".split("").forEach((c, i) => txt(g, c, 192, 116 + i * 104, 104, "AlfaSlab", on ? "#ffe0e4" : "#7a3a44", on ? "#ff3a4a" : "#3a1a22", on ? 10 : 4));
    g.shadowColor = "#5aff9a"; txt(g, "VACANCY", 192, 664, 40, "AlfaSlab", on ? "#d8ffe4" : "#3a5a44", on ? "#2ad86a" : INK, 5); g.shadowBlur = 0; },
  festBanner: (p) => { const g = p.g; const gr = g.createLinearGradient(0, 0, 1024, 0); gr.addColorStop(0, "#e8402e"); gr.addColorStop(0.5, "#f2a62a"); gr.addColorStop(1, "#e8402e"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 320); g.strokeStyle = "#fff6d8"; g.lineWidth = 14; g.strokeRect(10, 10, 1004, 300);
    txt(g, "MIKE THE HEADLESS CHICKEN", 560, 108, 104, "Bangers", "#ffffff", INK, 12, 760); txt(g, "FESTIVAL", 560, 218, 116, "Bangers", "#ffe85a", INK, 12, 700); txt(g, "FRUITA, COLORADO", 560, 286, 40, "AlfaSlab", "#fff6d8", INK, 0, 600);
    g.save(); g.translate(130, 170); g.scale(0.5, 0.5); g.translate(-256, -256); drawMike(g, { puff: 0.6, wing: 0.5 }); g.restore(); },
  runBanner: (p) => { const g = p.g; g.fillStyle = "#1f5aa8"; g.fillRect(0, 0, 1024, 192); g.strokeStyle = "#fff"; g.lineWidth = 10; g.strokeRect(6, 6, 1012, 180); txt(g, "RUN LIKE A HEADLESS CHICKEN 5K", 512, 100, 92, "Bangers", "#ffffff", INK, 10, 980); },
  mag: (p, k) => { const g = p.g; g.fillStyle = "#f4f0e6"; g.fillRect(0, 0, 512, 704); g.fillStyle = k ? "#1f3a8a" : "#c4302a"; g.fillRect(0, 0, 512, 120); txt(g, k ? "PICTURE NEWS" : "THE WEEKLY", 256, 64, 78, "AlfaSlab", "#ffffff", INK, 0, 470);
    g.fillStyle = k ? "#e8d8b0" : "#b8c8d8"; g.fillRect(36, 150, 440, 400); g.save(); g.beginPath(); g.rect(36, 150, 440, 400); g.clip(); g.translate(250, 330); g.scale(0.82, 0.82); g.translate(-256, -256); drawMike(g, { puff: 0.7, wing: k ? 0.6 : 0, neck: k ? 0.6 : 0 }); g.restore(); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(36, 150, 440, 400);
    txt(g, k ? "MIRACLE MIKE" : "NO HEAD?", 256, 598, 64, "AlfaSlab", INK, INK, 0, 470); txt(g, k ? "THE CHICKEN THAT WON'T QUIT" : "NO PROBLEM!", 256, 660, 38, "AlfaSlab", k ? "#1f3a8a" : "#c4302a", INK, 0, 470); },
  burst: (p) => { const g = p.g; g.clearRect(0, 0, 512, 512); for (let i = 0; i < 20; i++) { const a0 = (i / 20) * Math.PI * 2, a1 = ((i + 1) / 20) * Math.PI * 2; g.fillStyle = i % 2 ? "#ffd23a" : "#ff9a2a"; g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 360, a0, a1); g.closePath(); g.fill(); } const gr = g.createRadialGradient(256, 256, 30, 256, 256, 256); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(0.35, "rgba(255,240,200,0.4)"); gr.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); },
  chop: (p, u) => { const g = p.g; g.clearRect(0, 0, 512, 512); const s = 0.7 + 0.3 * Math.min(1, u * 3); g.save(); g.translate(256, 256); g.scale(s, s); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, r = i % 2 ? 140 : 230 + (i % 4) * 14; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); txt(g, "CHOP!", 0, 6, 132, "Bangers", "#e8402e", INK, 12); g.restore(); },
  thoughtRoast: (p) => { const g = p.g; g.clearRect(0, 0, 512, 512); g.fillStyle = "#fff"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.ellipse(256, 210, 214, 168, 0, 0, 7); g.fill(); g.stroke(); for (const [x, y, r] of [[130, 420, 28], [92, 474, 16]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = "#e8ecf0"; g.lineWidth = 8; g.beginPath(); g.ellipse(256, 270, 170, 52, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#c8742a"; g.beginPath(); g.ellipse(256, 220, 110, 72, 0, 0, 7); g.fill(); g.stroke(); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(256 + s * 112, 190, 34, 22, s * 0.6, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#fff"; g.beginPath(); g.arc(256 + s * 140, 172, 12, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#c8742a"; }
    g.fillStyle = "rgba(255,240,200,0.6)"; g.beginPath(); g.ellipse(226, 196, 40, 16, -0.3, 0, 7); g.fill(); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 6; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(200 + i * 50, 130); g.quadraticCurveTo(190 + i * 50, 100, 210 + i * 50, 70); g.stroke(); } },
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, 200, "Bangers", col, INK, 14); },
  zzz: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); for (let i = 0; i < 3; i++) { const v = (k / 6 + i / 3) % 1; g.globalAlpha = Math.min(1, (1 - v) * 2); txt(g, "Z", 60 + v * 130, 210 - v * 160, 50 + v * 50, "Bangers", "#f4f0ff", INK, 8); } g.globalAlpha = 1; },
  coin: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); const sx = Math.abs(Math.cos(k * 0.7)) * 0.9 + 0.1; g.save(); g.translate(128, 128); g.scale(sx, 1); g.fillStyle = "#d8dce2"; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.fill(); g.stroke(); g.strokeStyle = "#a8aeb6"; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 80, 0, 7); g.stroke(); if (sx > 0.5) txt(g, "25¢", 0, 6, 74, "AlfaSlab", "#6a707a", INK, 0); g.restore(); },
  feather: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 128); g.rotate(-0.5); g.fillStyle = "#fbf8f0"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -100); g.quadraticCurveTo(46, -30, 18, 70); g.lineTo(0, 92); g.lineTo(-18, 70); g.quadraticCurveTo(-46, -30, 0, -100); g.fill(); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(0, -90); g.lineTo(0, 110); g.stroke(); for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, -60 + i * 22); g.lineTo(i % 2 ? 22 : -22, -50 + i * 22); g.stroke(); } g.restore(); },
  flash: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,240,0.9)"); gr.addColorStop(1, "rgba(255,250,220,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(255,255,255,0.9)"; for (let i = 0; i < 8; i++) { g.save(); g.translate(128, 128); g.rotate(i * Math.PI / 4); g.beginPath(); g.moveTo(-5, 0); g.lineTo(0, -126); g.lineTo(5, 0); g.fill(); g.restore(); } },
  glow: (p, col = "255,190,110", a = 0.75) => { const g = p.g, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); },
  shadow: (p) => { const g = p.g, gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "rgba(30,20,30,0.5)"); gr.addColorStop(1, "rgba(30,20,30,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); },
  confetti: (p, k) => { const g = p.g; g.clearRect(0, 0, 64, 64); g.fillStyle = ["#e8402e", "#ffd23a", "#2f7fd8", "#3fb85a", "#ff7ad0", "#ffffff"][k % 6]; g.fillRect(8, 20, 48, 24); },
  stars: (p) => { const g = p.g; g.clearRect(0, 0, 1024, 1024); for (let i = 0; i < 260; i++) { const x = hh(i, 1) * 1024, y = hh(i, 2) * 1024, r = 1 + hh(i, 3) * 2.6; g.fillStyle = `rgba(240,244,255,${(0.35 + hh(i, 4) * 0.65).toFixed(2)})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } },
  cage: (p, o) => { const g = p.g; drawMike(g, o); g.strokeStyle = "#3a3a40"; g.lineWidth = 10; for (let x = 30; x <= 482; x += 50) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, 500); g.stroke(); } g.lineWidth = 16; g.strokeStyle = "#5a4630"; g.strokeRect(24, 24, 464, 480); },
  gurgle: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); g.strokeStyle = "#fff6c8"; g.lineWidth = 9; for (let i = 0; i < 3; i++) { const v = ((k / 8) + i / 3) % 1; g.globalAlpha = 1 - v; g.beginPath(); for (let x = 0; x <= 8; x++) { const xx = 40 + x * 22, yy = 200 - v * 160 + Math.sin(x * 1.6 + k) * 10; x ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); } g.globalAlpha = 1; },
  /** the anatomy diagram: blueprint, Mike's neck in white line, the missing head dashed; phase flags by time */
  xray: (p, s) => { const g = p.g, { axe = -1, miss = 0, stem = 0, alive = 0, beat = 0, drop = 0, clot = 0, stop = 0, zoom = 0 } = s;
    g.fillStyle = "#16346a"; g.fillRect(0, 0, 576, 1024); g.strokeStyle = "rgba(160,200,255,0.18)"; g.lineWidth = 2; for (let x = 0; x <= 576; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1024); g.stroke(); } for (let y = 0; y <= 1024; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(576, y); g.stroke(); }
    g.save(); const Z = 1 + zoom * 1.1; g.translate(288, 470); g.scale(Z, Z); g.translate(-288, -470 + zoom * 20);
    g.lineJoin = g.lineCap = "round";
    // body + neck outline
    g.strokeStyle = "#e8f2ff"; g.lineWidth = 9; g.beginPath(); g.ellipse(250, 760, 200, 140, -0.12, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(300, 640); g.quadraticCurveTo(310, 520, 270, 440); g.moveTo(410, 650); g.quadraticCurveTo(420, 540, 370, 440); g.stroke();
    // missing head, dashed
    g.setLineDash([18, 16]); g.strokeStyle = "rgba(232,242,255,0.6)"; g.lineWidth = 7; g.beginPath(); g.arc(325, 350, 70, 0, 7); g.stroke(); g.beginPath(); g.moveTo(390, 345); g.lineTo(450, 362); g.lineTo(392, 380); g.stroke(); g.setLineDash([]);
    txt(g, "?", 325, 352, 70, "Bangers", "rgba(232,242,255,0.6)");
    // the cut line
    if (axe >= 0) { const u = clamp01(axe); g.setLineDash([22, 14]); g.strokeStyle = "#ff5a4a"; g.lineWidth = 8; g.beginPath(); g.moveTo(150, 432); g.lineTo(150 + 330 * u, 432); g.stroke(); g.setLineDash([]);
      g.save(); g.translate(130 + 360 * u, 400); g.rotate(-0.4 + u * 0.8); g.fillStyle = "#8a5a34"; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(-8, -10, 16, 120); g.strokeRect(-8, -10, 16, 120); g.fillStyle = "#c8ccd4"; g.beginPath(); g.moveTo(-8, -10); g.lineTo(-62, -30); g.quadraticCurveTo(-74, 10, -62, 40); g.lineTo(-8, 22); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    if (miss > 0) txt(g, "MISSED!", 420, 300, 64 * smooth(miss * 3), "Bangers", "#ffe85a", INK, 8);
    // the brain stem: a glowing knot just below the cut
    if (stem > 0) { const r = 26 + 4 * Math.sin(beat * 6); const gr = g.createRadialGradient(322, 478, 0, 322, 478, 90); gr.addColorStop(0, `rgba(255,230,120,${0.9 * stem})`); gr.addColorStop(1, "rgba(255,230,120,0)"); g.fillStyle = gr; g.beginPath(); g.arc(322, 478, 90, 0, 7); g.fill(); g.fillStyle = "#ffd23a"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.ellipse(322, 480, r, r * 0.75, 0, 0, 7); g.fill(); g.stroke(); g.strokeStyle = "#ffd23a"; g.lineWidth = 8; g.beginPath(); g.moveTo(322, 500); g.lineTo(330, 640); g.stroke();
      g.globalAlpha = smooth(stem * 2) * (1 - clamp01(zoom * 3)); g.strokeStyle = "#ffe85a"; g.lineWidth = 5; g.beginPath(); g.moveTo(352, 494); g.lineTo(392, 560); g.stroke(); txt(g, "BRAIN STEM", 400, 592, 44, "AlfaSlab", "#ffe85a", INK, 6, 300); g.globalAlpha = 1; }
    if (alive > 0) { g.strokeStyle = "#5aff8a"; g.lineWidth = 7; g.beginPath(); const n = Math.floor(alive * 40); for (let i = 0; i <= n; i++) { const x = 60 + i * 11.5, ph = (i % 10), y = 940 - (ph === 4 ? 60 : ph === 5 ? -40 : ph === 6 ? 20 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); txt(g, "STILL ALIVE ✓", 288, 860, 56 * smooth(alive * 2.5), "Bangers", "#5aff8a", INK, 8); }
    // blood clot: one drop wobbles at the cut, then a plug pops in and stops it
    if (drop > 0) { const d = clamp01(drop) * (1 - clamp01(clot * 2)); g.fillStyle = "#e8403a"; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.ellipse(322, 436 + d * 30, 12, 16, 0, 0, 7); g.fill(); g.stroke(); }
    if (clot > 0) { const c = smooth(clot * 2), y = 380 + 52 * c; g.fillStyle = "#c42a34"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(286, y - 34, 72, 60, 18); g.fill(); g.stroke(); g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(306, y - 20, 14, 7, -0.4, 0, 7); g.fill(); if (c >= 1) txt(g, "PLUG!", 300, 352, 50, "Bangers", "#ff8a8a", INK, 7); }
    if (stop > 0) { const s2 = smooth(stop * 3); g.save(); g.translate(372, 520); g.scale(s2 * 0.7, s2 * 0.7); g.fillStyle = "#3fb85a"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 54, 0, 7); g.fill(); g.stroke(); g.strokeStyle = "#fff"; g.lineWidth = 14; g.beginPath(); g.moveTo(-24, 2); g.lineTo(-6, 22); g.lineTo(28, -20); g.stroke(); g.restore(); }
    g.restore(); },
};

// ---------------- props drawn on people's cards (after the body; p.hands is set by bodyFront) ----------------
const axeAt = (p, hx, hy, ang, len = 300) => { const g = p.g, ex = hx + Math.cos(ang) * len, ey = hy + Math.sin(ang) * len, bx = hx - Math.cos(ang) * 40, by = hy - Math.sin(ang) * 40;
  g.lineCap = "round"; g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(bx, by); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = "#a8763e"; g.lineWidth = 12; g.stroke();
  g.save(); g.translate(ex, ey); g.rotate(ang); g.fillStyle = "#c8ccd4"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(-26, -14); g.lineTo(8, -16); g.lineTo(20, -70); g.quadraticCurveTo(52, -40, 36, 18); g.lineTo(8, 14); g.lineTo(-26, 14); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.moveTo(22, -56); g.quadraticCurveTo(40, -36, 32, 6); g.lineTo(26, 4); g.quadraticCurveTo(32, -30, 18, -50); g.fill(); g.restore();
  for (const h of [[hx, hy]]) { g.fillStyle = INK; g.beginPath(); g.arc(h[0], h[1], 13, 0, 7); g.fill(); } };
const XL = {
  axeShoulder: (o) => (p) => { const H = p.hands; if (!H || !H.r) return; axeAt(p, H.l[0], H.l[1], -Math.PI / 2 + 0.55, 300); },
  axeChop: (o) => (p) => { const H = p.hands; if (!H) return; axeAt(p, (H.l[0] + H.r[0]) / 2, (H.l[1] + H.r[1]) / 2, Math.PI / 2 - 0.15, 250); },
  axeDown: (o) => (p) => { const H = p.hands; if (!H || !H.r) return; axeAt(p, H.r[0], H.r[1], Math.PI / 2 - 0.25, 230); },
  axeDownL: (o) => (p) => { const H = p.hands; if (!H || !H.l) return; axeAt(p, H.l[0], H.l[1], Math.PI / 2 + 0.25, 230); },
  dropper: (o, squeeze = 0) => (p) => { const H = p.hands; if (!H || !H.r) return; const [hx, hy] = H.r, g = p.g; g.fillStyle = "rgba(200,230,255,0.8)"; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.roundRect(hx - 7, hy - 4, 14, 58, 6); g.fill(); g.stroke(); g.fillStyle = "#f4f0e0"; g.fillRect(hx - 4, hy + 30, 8, 22); g.fillStyle = "#c4302a"; g.beginPath(); g.ellipse(hx, hy - 16, 15 - squeeze * 4, 20 + squeeze * 2, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = o.skin; g.beginPath(); g.arc(hx + 2, hy - 2, 14, 0, 7); g.fill(); g.stroke(); },
  flashCam: (o, on = 0) => (p) => { const H = p.hands; if (!H) return; const g = p.g, hc = H.hc, cy = hc + 46; g.fillStyle = "#2a2a30"; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(232, cy - 36, 136, 92, 10); g.fill(); g.stroke(); g.fillStyle = "#5a5a62"; g.beginPath(); g.arc(300, cy + 10, 34, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#14141a"; g.beginPath(); g.arc(300, cy + 10, 20, 0, 7); g.fill(); g.fillStyle = "rgba(200,220,255,0.5)"; g.beginPath(); g.arc(292, cy + 2, 7, 0, 7); g.fill();
    g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(232, cy - 10); g.lineTo(196, cy - 30); g.stroke(); g.fillStyle = on ? "#ffffff" : "#d8dce2"; g.lineWidth = 7; g.beginPath(); g.ellipse(176, cy - 54, 46, 46, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = on ? "#fffbe0" : "#f4f0e0"; g.beginPath(); g.arc(176, cy - 54, 14, 0, 7); g.fill();
    if (on) { g.fillStyle = "rgba(255,255,230,0.9)"; for (let i = 0; i < 10; i++) { g.save(); g.translate(176, cy - 54); g.rotate(i * 0.63); g.beginPath(); g.moveTo(-8, 0); g.lineTo(0, -110); g.lineTo(8, 0); g.fill(); g.restore(); } } },
  press: (o) => (p) => { const H = p.hands; if (!H) return; const g = p.g; g.fillStyle = "#f4f0e6"; g.strokeStyle = INK; g.lineWidth = 4; g.save(); g.translate(340, H.hc - H.Ha * 0.92); g.rotate(0.12); g.fillRect(-30, -14, 60, 26); g.strokeRect(-30, -14, 60, 26); txt(g, "PRESS", 0, 0, 18, "AlfaSlab", INK); g.restore(); },
  chickHat: (o) => (p) => { const H = p.hands; if (!H) return; const g = p.g; g.save(); g.translate(300, H.hc - H.Ha * 1.25); g.scale(0.36, 0.36); g.translate(-256, -420); drawMike(g, { head: true, hen: false, mood: "happy", puff: 0.4 }); g.restore(); },
  suit: (o, flap = 0) => (p) => { const H = p.hands; if (!H) return; const g = p.g, top = H.chin + 10, bot = H.chin + 300; g.fillStyle = "#fbf6ea"; g.strokeStyle = INK; g.lineWidth = 8;
    for (const s of [-1, 1]) { g.save(); g.translate(300 + s * 70, top + 50); g.rotate(s * (0.5 + flap * 0.9)); g.beginPath(); g.ellipse(s * 40, 60, 46, 110, s * 0.2, 0, 7); g.fill(); g.stroke(); g.restore(); }
    g.beginPath(); g.ellipse(300, (top + bot) / 2, 120, (bot - top) / 2, 0, 0, 7); g.fill(); g.stroke(); g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(250 + i * 33, top + 150 + (i % 2) * 20, 18, 0.2, 2.9); g.stroke(); }
    g.fillStyle = "#e0332f"; g.lineWidth = 7; for (const [dx, r] of [[-26, 22], [0, 28], [26, 22]]) { g.beginPath(); g.arc(300 + dx, H.hc - H.Ha * 1.02, r, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = "#f2b83a"; g.beginPath(); g.moveTo(262, H.hc - H.Ha * 0.62); g.lineTo(338, H.hc - H.Ha * 0.62); g.lineTo(300, H.hc - H.Ha * 0.3); g.closePath(); g.fill(); g.stroke(); },
  scarf: (o, col = "#c4302a") => (p) => { const H = p.hands; if (!H) return; p.g.fillStyle = col; p.g.strokeStyle = INK; p.g.lineWidth = 6; p.g.beginPath(); p.g.roundRect(240, H.chin - 6, 120, 30, 12); p.g.fill(); p.g.stroke(); },
};
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });
const all = (...fs) => (p) => { for (const f of fs) if (f) f(p); };

// ---------------- cast ----------------
const SK = ["#f2d2b6", "#e8c3a0", "#d9a77c", "#c68c5f", "#a86d45"];
const LLOYD = (x = {}) => ({ jacket: "#b84a3a", pants: "#3f5f8a", bib: "#4f6f9e", boots: "#3a2a1a", skin: "#f0c49c", hat: "fedora", cap: "#cdb27a", ...x });
const MAN40 = (i, x = {}) => ({ jacket: ["#5a5a68", "#7a5a44", "#3a4a5a", "#6a6a52"][i % 4], pants: ["#3b3f52", "#4a4038", "#2a2a30"][i % 3], boots: "#2a2220", skin: SK[i % 4], hat: "fedora", cap: ["#4a4038", "#2a2a30", "#6a5a44", "#8a7a5a"][i % 4], moustache: i % 3 === 1 ? "#3a2a20" : undefined, ...x });
const WOM40 = (i, x = {}) => ({ jacket: ["#b8573a", "#3f6f9a", "#7a5aa0", "#2f7f6a"][i % 4], pants: "#4b4f5c", boots: "#5a3b2a", dress: ["#c86a4a", "#4f7fae", "#8a6ab5", "#3f8f7a"][i % 4], skin: SK[(i + 1) % 4], hat: "hair", hair: ["#3a2a20", "#7a4a2a", "#211a1e", "#c09a5a"][i % 4], ...x });
const KID40 = (i, x = {}) => ({ jacket: ["#3f6f9a", "#c4573a", "#5a7a3a"][i % 3], pants: "#3b3f52", boots: "#3a2a20", skin: SK[i % 3], hat: "cap", cap: ["#2a2a30", "#5a3a2a"][i % 2], build: "kid", ...x });
const PRESS = (i, x = {}) => MAN40(i + 2, { jacket: ["#4a4a52", "#5a4a3a"][i % 2], hat: "fedora", cap: ["#3a3a40", "#5a4a3a"][i % 2], ...x });
const TEE = ["#e8402e", "#2f7fd8", "#ffd23a", "#3fb85a", "#ff7ad0", "#f2f2f2", "#7a4ac8", "#ff8a2a"];
const MOD = (i, x = {}) => ({ jacket: TEE[i % 8], pants: ["#3f5a8a", "#2a3a5a", "#b8a27a", "#3a3a40"][i % 4], boots: ["#f2f2f2", "#2a2a30", "#e8402e"][i % 3], skin: SK[(i * 3) % 5], hat: i % 3 === 0 ? "cap" : "hair", cap: TEE[(i + 3) % 8], hair: ["#3a2a20", "#7a4a2a", "#211a1e", "#c09a5a", "#a8743a"][i % 5], build: i % 7 === 3 ? "kid" : i % 5 === 2 ? "stout" : "adult", dress: i % 4 === 1 ? TEE[(i + 1) % 8] : undefined, ...x });

// ---------------- card helpers ----------------
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });
const screenCard = (out, c, key, draw, d = 0.6, cw = 1024, ch = 512, kind = "soft") => {
  const fx = c.look[0] - c.pos[0], fy = c.look[1] - c.pos[1], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fy, fz);
  const h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.03, w = h * (9 / 16) * 1.03;
  out.fx.push({ key, cw, ch, draw, x: c.pos[0] + (fx / n) * d, y: c.pos[1] + (fy / n) * d, z: c.pos[2] + (fz / n) * d, w, h, kind });
};
const shadowAt = (out, x, gy, z, w) => fxCard(out, "shadowEll", DR.shadow, x, gy + 0.012, z, w, w * 0.45, { cw: 256, ch: 256, kind: "soft", flat: true });
/** Mike (or a hen) as a lit card standing on ground height gy; h = card height in metres; dir -1 faces left */
const MIKE_H = 0.62;
const mike = (out, o, x, gy, z, dir = 1, ex = {}) => {
  const h = ex.h ?? MIKE_H, sq = ex.sq ?? 1;
  const oo = { head: !!o.head, ph: o.ph >= 0 ? (Math.round(o.ph * 12) % 12) / 12 : -1, neck: q8(o.neck ?? 0), puff: Math.round((o.puff ?? 0) * 6) / 6, wing: q8(o.wing ?? 0), mood: o.mood ?? "normal", metal: !!o.metal, hen: !!o.hen };
  const key = "mk" + JSON.stringify(oo).replace(/[^a-z0-9.\-]/gi, "") + dir;
  fxCard(out, key, (p) => { if (dir < 0) { p.g.translate(512, 0); p.g.scale(-1, 1); } drawMike(p.g, oo); }, x, gy + h * sq * 0.4727, z, h / Math.sqrt(sq), h * sq, { cw: 512, ch: 512, kind: ex.kind ?? "lit", rot: ex.rot ?? 0 });
  if (ex.shadow !== false) shadowAt(out, x, gy, z, h * 0.8);
};
const hen = (out, t, i, x, gy, z, dir = 1, mood = "normal", peck = true) => { const k = Math.floor(t * 2.2 + i * 1.3) % 5, pk = peck && k === 2; mike(out, { head: true, hen: true, neck: pk ? -0.9 : 0, mood, ph: -1 }, x, gy, z, dir, { h: 0.5 }); };
const grain = (out, x, gy, z, n = 14) => { for (let i = 0; i < n; i++) fxCard(out, "grain", (p) => { p.g.fillStyle = "#e8c45a"; p.g.beginPath(); p.g.ellipse(32, 32, 26, 16, 0, 0, 7); p.g.fill(); }, x + (hh(i, 1) - 0.5) * 1.2, gy + 0.01, z + (hh(i, 2) - 0.5) * 0.8, 0.035, 0.035, { cw: 64, ch: 64, kind: "lit", flat: true }); };
const rings = (out, t, x, y, z, s = 0.5) => { const u = (t * 1.4) % 1; out.fx.push({ key: "ring" + Math.round(u * 16), cw: 512, ch: 512, draw: (p) => { const g = p.g; for (let k = 0; k < 3; k++) { const v = u - k * 0.25; if (v <= 0 || v >= 1) continue; g.beginPath(); g.arc(256, 256, 40 + 200 * v, -1.0, 1.0); g.strokeStyle = `rgba(255,248,220,${(1 - v).toFixed(3)})`; g.lineWidth = 14 * (1 - v) + 4; g.stroke(); } }, x, y, z, w: s, h: s, kind: "soft", rot: Math.PI / 2 }); };
const confetti = (out, t, cx, cy, cz, rx, rz, n = 50, h = 5) => { for (let i = 0; i < n; i++) { const v = ((t * 0.32) + hh(i, 3)) % 1, k = i % 6; fxCard(out, "conf" + k, (p) => DR.confetti(p, k), cx + (hh(i, 4) - 0.5) * 2 * rx + Math.sin(t * 2 + i) * 0.3, cy + h * (1 - v), cz + (hh(i, 5) - 0.5) * 2 * rz, 0.07, 0.07, { cw: 64, ch: 64, kind: "basic", rot: t * (2 + hh(i, 6) * 4) + i }); } };
const mark = (out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); fxCard(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256 }); };
const bubble = (out, key, draw, x, y, z, u, s = 1) => { if (u <= 0) return; const k = smooth(Math.min(1, u)); fxCard(out, key, draw, x, y, z, s * k, s * k, { cw: 512, ch: 512 }); };
const sign = (out, key, draw, cw, ch, x, y, z, w, h, normal = [0, 0, 1], kind = "lit") => fxCard(out, key, draw, x, y, z, w, h, { cw, ch, normal, kind });

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[1];
function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const [fx, , fz] = FARM, f_ = (x, y, z) => [fx + x, y, fz + z];
  const day = { light: "day", sunAz: 200, sunEl: 50, fogFar: 6000 };
  const lloyd = LLOYD();
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  // farm sign on the gate
  const farmSign = (out) => sign(out, "farmSign", DR.farmSign, 1024, 384, fx, 1.78, fz + 9.12, 2.7, 1.0);

  // 1 A chicken that lived eighteen months... : low tracking shot, Mike struts across the yard; the hook title sits on top
  const walkX = (t) => -6.2 + 0.62 * t, MX2 = walkX(P("without") - 0.1);
  shot({ a: 0, ...day, cam: (l) => ({ pos: f_(walkX(l) + 0.1, 0.34, 2.4 + 1.7), look: f_(walkX(l) + 0.02, 0.27, 2.4), fov: 44, roll: 0 }), cInf: 3, focus: f_(walkX(0.8) + 0.4, 0.4, 2.4), shadowR: 8,
    stage(t, out) { mike(out, { ph: (t * 1.9) % 1, puff: 0.35 }, fx + walkX(t), 0.08, fz + 2.4, 1); hen(out, t, 1, fx - 5.3, 0.08, fz - 1.2, 1); hen(out, t, 2, fx - 3.6, 0.08, fz - 2.4, -1); } });
  // 2 without a head.: punch in low on the stump against the sky; Mike stops and puffs up, wings out
  shot({ at: S("without"), ...day, cam: push(f_(MX2 + 0.08, 0.2, 3.65), f_(MX2 + 0.1, 0.5, 2.4), f_(MX2 + 0.07, 0.22, 3.4), f_(MX2 + 0.1, 0.52, 2.4), 42, 1.3), cInf: 5, focus: f_(MX2, 0.5, 2.4), shadowR: 6, kicks: [],
    stage(t, out) { const u = t - T("without"); mike(out, { ph: -1, puff: 0.4 + 0.4 * smooth((t - T("head") + 0.1) / 0.2), wing: 0.55 * smooth((t - T("head") + 0.15) / 0.18) }, fx + MX2, 0.08, fz + 2.4, 1, { sq: 1 + 0.06 * Math.sin(Math.max(0, t - T("head")) * 22) * Math.exp(-Math.max(0, t - T("head")) * 5) }); } });
  kick1(T("head") + 0.02);
  // 3 Colorado, 1945.: crane down over the farm, red mesas behind, the gate sign
  shot({ at: S("Colorado"), ...day, cam: push(f_(-3, 11, 34), f_(-3, 5, -40), f_(-0.6, 2.0, 15.5), f_(-0.4, 1.7, 0), 48, 2.6), cInf: 1, focus: f_(0, 1.5, 9), shadowR: 40,
    stage(t, out) { farmSign(out); for (let i = 0; i < 4; i++) hen(out, t, i, fx - 2 + i * 1.3, 0.08, fz + 1 + (i % 2) * 1.2, i % 2 ? 1 : -1); out.places.push(pl(1, lloyd, fx + 0.8, 0.05, fz - 2.5, { expr: "smile", dir: [1, 0.2], view: "side", mode: "march", stride: 0.8, phase: (t * 1.4) % 1 })); } });
  // 4 Farmer Lloyd Olsen swings his axe: behind the chopping block, Mike (with his head) on it, very worried; the axe goes up
  const blockShot = { ...day, cInf: 4, focus: f_(0, 1.0, -0.2), shadowR: 8 };
  shot({ at: S("Farmer"), ...blockShot, cam: push(f_(0.25, 1.2, 3.3), f_(0.0, 1.05, 0), f_(0.2, 1.15, 2.85), f_(0.0, 1.05, 0), 46, 1.8),
    stage(t, out) { const up = smooth((t - T("swings") + 0.35) / 0.45), sw = t > T("axe") + 0.02; const arms = sw ? { l: ["chop", 1], r: ["chop", 1] } : { l: ["shoulder", up], r: ["shoulder", up] };
      out.places.push(pl(1, lloyd, fx, 0.05, fz - 0.62, { expr: sw ? "angry" : up > 0.5 ? "sly" : "talk_m", arms, extra: up > 0.4 && !sw ? XL.axeShoulder(lloyd) : sw ? XL.axeChop(lloyd) : XL.axeDown(lloyd) }));
      mike(out, { head: true, mood: t > T("swings") ? "shock" : "worried", puff: 0.2 }, fx + 0.02, 0.51, fz + 0.05, 1, { shadow: false, sq: t > T("swings") ? 0.94 : 1 });
      if (sw) { const u = (t - T("axe")) / 0.4; fxCard(out, "chop" + Math.round(Math.min(1, u) * 6), (p) => DR.chop(p, u), fx + 0.05, 0.8, fz + 0.45, 1.25, 1.25, { cw: 512, ch: 512, kind: "basic" }); } } });
  kick1(T("axe") + 0.03);
  // 5 for dinner.: Lloyd, pleased with himself, dreams of a roast chicken
  shot({ at: S("for"), ...blockShot, cam: push(f_(0.0, 1.62, 1.75), f_(0.02, 1.6, -0.6), f_(0.0, 1.62, 1.6), f_(0.02, 1.62, -0.6), 44, 1.3), cInf: 6, focus: f_(0, 1.6, -0.6),
    stage(t, out) { out.places.push(pl(1, lloyd, fx, 0.05, fz - 0.62, { expr: Math.floor(t * 6) % 2 ? "proud" : "smile_closed", arms: { r: ["hips", 1] }, extra: XL.axeDownL(lloyd) })); bubble(out, "roast", DR.thoughtRoast, fx + 0.27, 2.0, fz - 0.5, (t - T("dinner") + 0.25) / 0.2, 0.62); } });
  // 6 But the chicken gets up... and walks away.: headless Mike sits up on the block, hops down and struts off; Lloyd's jaw drops
  shot({ at: S("But"), ...blockShot, cam: push(f_(0.5, 1.05, 3.4), f_(0.35, 0.85, 0), f_(0.55, 1.0, 3.1), f_(0.45, 0.82, 0), 46, 3.0),
    stage(t, out) { const tu = T("gets") + 0.15, tw = T("walks") - 0.1, shock = t > tu + 0.1;
      out.places.push(pl(1, lloyd, fx - 0.05, 0.05, fz - 0.62, { expr: shock ? (t > tw + 0.2 ? "gasp" : "shock") : "proud", arms: shock && t > tw + 0.25 ? { l: ["head", 1], r: ["head", 1] } : { r: ["hips", shock ? 0 : 1] }, extra: shock && t > tw + 0.25 ? undefined : XL.axeDown(lloyd) }));
      if (shock && t > tw + 0.25) fxCard(out, "axeGround", (p) => axeAt(p, 140, 320, -0.15, 300), fx - 0.35, 0.12, fz + 0.45, 0.9, 0.9, { cw: 512, ch: 512, kind: "lit", normal: [0, 1, 0.25] });
      if (t < tu) { mike(out, { ph: -1 }, fx + 0.0, 0.51 + 0.0, fz + 0.05, 1, { rot: Math.PI / 2 * 0.92, shadow: false, h: 0.62 }); }
      else if (t < tw) { const k = t - tu; mike(out, { ph: -1, puff: 0.3, wing: k < 0.4 ? 0.5 * Math.abs(Math.sin(k * 20)) : 0 }, fx, 0.51 + Math.max(0, Math.sin(k * 9)) * 0.08 * Math.exp(-k * 3), fz + 0.05, 1, { shadow: false, sq: 1 + 0.12 * Math.sin(k * 18) * Math.exp(-k * 4) }); }
      else { const k = t - tw, hop = clamp01(k / 0.32), x = fx + hop * 0.55 + Math.max(0, k - 0.32) * 0.75, y = k < 0.32 ? 0.51 + (0.08 - 0.51) * hop + Math.sin(hop * Math.PI) * 0.22 : 0.08; mike(out, { ph: k < 0.32 ? -1 : ((k - 0.32) * 2.2) % 1, puff: 0.35, wing: k < 0.32 ? 0.6 : 0 }, x, y, fz + 0.3, 1, { shadow: k > 0.3 }); }
      mark(out, "!", fx + 0.3, 2.05, fz - 0.6, (t - tu - 0.1) * 1.5, 0.4, "#ffe85a"); } });
  kick1(T("gets") + 0.2);
  // 7 His name was Mike.: the hero shot: sunburst, a little chest puff, wings out on "Mike"
  shot({ at: S("His name"), ...day, cam: push(f_(1.55, 0.3, 1.95), f_(1.5, 0.5, 0.3), f_(1.53, 0.3, 1.6), f_(1.5, 0.52, 0.3), 40, 1.9), cInf: 2, focus: f_(1.5, 0.4, 0.3), shadowR: 6,
    stage(t, out) { const tm = T("Mike", T("His name")), u = smooth((t - tm + 0.15) / 0.25); fxCard(out, "sunburst", DR.burst, fx + 1.5, 0.55, fz - 0.6, 3.4 * (0.6 + 0.4 * u), 3.4 * (0.6 + 0.4 * u), { cw: 512, ch: 512, kind: "basic", rot: t * 0.6 });
      mike(out, { ph: -1, puff: 0.3 + 0.7 * u, wing: 0.75 * u }, fx + 1.5, 0.08, fz + 0.3, 1, { sq: 1 + 0.08 * Math.sin(Math.max(0, t - tm) * 20) * Math.exp(-Math.max(0, t - tm) * 5) });
      for (let i = 0; i < 6; i++) { const v = ((t * 0.8) + i / 6) % 1; if (t > tm - 0.1) fxCard(out, "spark", (p) => { p.poly([[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], "#fffbe8", 8); }, fx + 1.5 + Math.cos(i * 1.05 + t) * 0.45, 0.45 + Math.sin(i * 1.05 + t) * 0.32, fz + 0.4, 0.09 * Math.sin(v * Math.PI), 0.09 * Math.sin(v * Math.PI), { cw: 256, ch: 256, kind: "basic" }); } } });
  kick1(T("Mike", T("His name")) + 0.02);
  // 8 The axe missed the part of his brain that keeps a chicken alive.: the blueprint diagram
  shot({ at: S("The axe"), ...day, cam: () => ({ pos: f_(0, 40, 60), look: f_(0, 40, 0), fov: 40, roll: 0 }), cInf: 0, focus: f_(0, 40, 0), shadowR: 6,
    stage(t, out, c) { const ta = T("axe", T("The axe")), st = { axe: (t - ta + 0.05) / 0.5, miss: clamp01((t - T("missed") - 0.05) / 0.6), stem: clamp01((t - T("brain") + 0.1) / 0.4), beat: t, alive: clamp01((t - T("alive") + 0.15) / 0.8), zoom: 0 };
      const key = "xray" + [st.axe, st.miss, st.stem, st.alive].map((v) => Math.round(clamp01(v) * 16)).join("_") + "_" + Math.round(t * 10) % 8;
      screenCard(out, c, key, (p) => DR.xray(p, { ...st, axe: Math.min(1, st.axe), beat: Math.round(t * 10) % 8 / 8 }), 0.6, 576, 1024, "basic"); } });
  // 9 A blood clot stopped the bleeding.: zoom to the cut; one drop wobbles, a plug pops in, green tick
  shot({ at: S("A blood"), ...day, cam: () => ({ pos: f_(0, 40, 60), look: f_(0, 40, 0), fov: 40, roll: 0 }), cInf: 0, focus: f_(0, 40, 0), shadowR: 6, kicks: [],
    stage(t, out, c) { const t0 = T("A blood"), st = { axe: 1, stem: 1, zoom: smooth((t - t0 + 0.1) / 0.45), drop: clamp01((t - T("blood") + 0.05) / 0.3), clot: clamp01((t - T("clot")) / 0.5), stop: clamp01((t - T("stopped") - 0.1) / 0.5), beat: 0 };
      const key = "xrayB" + [st.zoom, st.drop, st.clot, st.stop].map((v) => Math.round(v * 16)).join("_");
      screenCard(out, c, key, (p) => DR.xray(p, st), 0.6, 576, 1024, "basic"); } });
  kick1(T("clot") + 0.28);
  // 10 So Lloyd fed him with an eyedropper...: the kitchen table by the house, Mike on the table, Lloyd with the dropper
  const tX = -3.0, tZ = -1.6, lx = fx + tX - 0.55;
  const feedShot = { ...day, cInf: 4, focus: f_(tX, 1.2, tZ), shadowR: 8 };
  shot({ at: S("So"), ...feedShot, cam: push(f_(tX - 0.25, 1.36, tZ + 2.9), f_(tX - 0.25, 1.15, tZ), f_(tX - 0.25, 1.35, tZ + 2.45), f_(tX - 0.25, 1.15, tZ), 46, 2.4),
    stage(t, out) { const sq = Math.floor(t * 3) % 3 === 0 ? 1 : 0, feed = smooth((t - T("fed") + 0.2) / 0.4);
      out.places.push(pl(1, lloyd, lx, 0.05, fz + tZ - 0.1, { expr: Math.floor(t * 5) % 3 === 0 ? "talk_m" : "smile_closed", headTilt: 6, arms: { r: ["feed", feed] }, extra: XL.dropper(lloyd, sq) }));
      mike(out, { ph: -1, puff: 0.3 + 0.2 * Math.sin(t * 3) }, fx + tX + 0.09, 0.8, fz + tZ - 0.08, -1, { shadow: false }); } });
  // 11 straight down the neck.: close-up, drops fall into the neck, Mike wiggles happily
  shot({ at: S("straight"), ...feedShot, cam: push(f_(tX + 0.02, 1.36, tZ + 1.05), f_(tX - 0.02, 1.24, tZ - 0.08), f_(tX + 0.0, 1.35, tZ + 0.9), f_(tX - 0.02, 1.24, tZ - 0.08), 40, 1.4), cInf: 7, focus: f_(tX - 0.03, 1.24, tZ - 0.08),
    stage(t, out) { out.places.push(pl(1, lloyd, lx, 0.05, fz + tZ - 0.1, { expr: "smile_closed", arms: { r: ["feed", 1] }, extra: XL.dropper(lloyd, Math.floor(t * 4) % 2) }));
      mike(out, { ph: -1, puff: 0.5 + 0.3 * Math.abs(Math.sin(t * 7)), wing: 0.2 * Math.abs(Math.sin(t * 7)) }, fx + tX + 0.09, 0.8, fz + tZ - 0.08, -1, { shadow: false, sq: 1 + 0.04 * Math.sin(t * 14) });
      for (let i = 0; i < 3; i++) { const v = ((t * 1.6) + i / 3) % 1; fxCard(out, "drop", (p) => { const g = p.g; g.fillStyle = "#f6f2ea"; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(32, 4); g.quadraticCurveTo(58, 40, 32, 60); g.quadraticCurveTo(6, 40, 32, 4); g.fill(); g.stroke(); }, fx + tX - 0.033, 1.235 - v * 0.03, fz + tZ - 0.07, 0.025, 0.03, { cw: 64, ch: 64, kind: "basic" }); }
      rings(out, t, fx + tX - 0.033, 1.25, fz + tZ - 0.07, 0.18); } });
  // 12 Mike still tried to peck.: in the yard with the hens, Mike pecks the dirt with his neck
  shot({ at: S("Mike still"), ...day, cam: push(f_(0.9, 0.42, 4.0), f_(0.6, 0.32, 1.8), f_(0.85, 0.4, 3.7), f_(0.6, 0.32, 1.8), 42, 1.8), cInf: 5, focus: f_(0.6, 0.3, 1.8), shadowR: 6,
    stage(t, out) { grain(out, fx + 0.6, 0.08, fz + 1.9, 24); const k = (t * 2.4) % 1, pk = Math.sin(k * Math.PI * 2); mike(out, { ph: -1, neck: -Math.max(0, pk) * 1.0 }, fx + 0.45, 0.08, fz + 1.8, 1); hen(out, t, 3, fx + 1.15, 0.08, fz + 1.65, -1); hen(out, t + 0.3, 4, fx - 0.25, 0.08, fz + 1.5, 1); } });
  // 13 Tried to crow.: sunrise, up on the coop roof, chest out, neck stretched, a gurgle instead of a cock-a-doodle
  shot({ at: S("Tried to crow"), light: "golden", sunAz: 150, sunEl: 9, fogFar: 6000, cam: push(f_(1.05, 1.25, 6.7), f_(1.5, 2.6, 9.0), f_(1.1, 1.3, 7.0), f_(1.5, 2.62, 9.0), 46, 1.3), cInf: 2, focus: f_(1.5, 2.5, 9.0), shadowR: 10,
    stage(t, out) { const u = smooth((t - T("crow") + 0.2) / 0.3); mike(out, { ph: -1, neck: u, puff: 0.3 + 0.7 * u, wing: 0.9 * u * Math.abs(Math.sin(t * 9)) }, fx + 1.5, 2.2, fz + 9.0, 1, { shadow: false }); if (u > 0.5) fxCard(out, "gurgle" + Math.floor(t * 8) % 8, (p) => DR.gurgle(p, Math.floor(t * 8) % 8), fx + 1.64, 2.95, fz + 9.0, 0.5, 0.5, { cw: 256, ch: 256 }); } });
  // 14 With no head.: the hens look at each other
  shot({ at: S("With no"), light: "golden", sunAz: 150, sunEl: 9, fogFar: 6000, cam: push(f_(1.5, 0.42, 6.85), f_(1.5, 0.4, 8.5), f_(1.5, 0.42, 7.0), f_(1.5, 0.41, 8.5), 44, 1.0), cInf: 5, focus: f_(1.5, 0.3, 8.4), shadowR: 6, kicks: [],
    stage(t, out) { const k = t > T("head", T("With no")) - 0.1; mike(out, { head: true, hen: true, mood: k ? "shock" : "normal" }, fx + 1.27, 0.08, fz + 8.3, 1, { h: 0.5 }); mike(out, { head: true, hen: true, mood: k ? "shock" : "normal" }, fx + 1.73, 0.08, fz + 8.35, -1, { h: 0.5 }); mark(out, "?!", fx + 1.5, 0.78, fz + 8.3, (t - T("no", T("With no")) + 0.05) * 1.2, 0.32, "#ffe85a"); } });
  kick1(T("head", T("With no")) + 0.02);
  // 15 Soon Lloyd took him on tour.: red pickup on an Arizona highway, Mike in a cage under a banner
  const [dx, , dz] = DESERT, truckX = (t) => dx - 30 + (t - T("Soon")) * 9;
  shot({ at: S("Soon"), light: "day", sunAz: 160, sunEl: 45, fogFar: 2400, cam: (l) => { const x = truckX(T("Soon") - 0.1 + l); return { pos: [x - 0.9, 1.75, dz + 10.5], look: [x - 1.1, 1.5, dz], fov: 46, roll: 0 }; }, cInf: 1.5, focus: [dx, 1.4, dz], shadowR: 10,
    stage(t, out) { const x = truckX(t), by2 = Math.sin(t * 17) * 0.012; out.veh.push({ type: "ute", x, y: by2, z: dz, yaw: Math.PI / 2, mat: "carRed" });
      fxCard(out, "cage" + (Math.floor(t * 3) % 2), (p) => DR.cage(p, { ph: -1, puff: 0.5, wing: Math.floor(t * 3) % 2 ? 0.3 : 0 }), x - 1.6, 2.02 + by2, dz + 0.1, 0.95, 0.95, { cw: 512, ch: 512, kind: "lit" });
      sign(out, "truckBanner", DR.truckBanner, 1024, 256, x - 1.35, 1.32 + by2, dz + 1.08, 2.85, 0.72);
    } });
  // 16 Twenty-five cents a look.: the sideshow; Lloyd barks (mouth going), crowd queues, a quarter flips at the camera
  const [tx, , tz] = TOUR;
  const fair = { light: "day", sunAz: 220, sunEl: 40, fogFar: 2400 };
  const crowd40 = (out, t, n, z0, keep = false) => { for (let k = 0; k < n; k++) { const o = [MAN40(k), WOM40(k), KID40(k), MAN40(k + 2), WOM40(k + 1)][k % 5]; out.places.push(pl(20 + k, o, tx - 2.4 + (k % 5) * 1.15 + (Math.floor(k / 5) % 2) * 0.55, 0.05, z0 + Math.floor(k / 5) * 1.0 + hh(k, 2) * 0.3, { expr: ["talk_o", "grin", "gasp", "smile", "shock"][(k + Math.floor(t * 2)) % 5], backView: !keep, keep, headTilt: (k % 3 - 1) * 5 })); } };
  const stageMike = (out, t, o = {}) => mike(out, { ph: -1, puff: 0.6, ...o }, tx + 0.6, 0.9, tz - 0.4, -1);
  const banner = (out) => sign(out, "sideshow", DR.sideshow, 1024, 512, tx, 2.35, tz - 1.53, 5.2, 2.6);
  shot({ at: S("Twenty-five"), ...fair, cam: push([tx + 0.4, 1.9, tz + 7.2], [tx - 0.1, 1.8, tz - 0.8], [tx + 0.35, 1.85, tz + 6.4], [tx - 0.1, 1.8, tz - 0.8], 50, 1.5), cInf: 2, focus: [tx, 1.6, tz - 0.5], shadowR: 12,
    stage(t, out) { banner(out); stageMike(out, t); const talk = ["barker_o", "barker_e", "talk_o", "barker_e"][Math.floor(t * 9) % 4];
      out.places.push(pl(1, lloyd, tx - 1.0, 0.9, tz - 0.3, { expr: talk, arms: { r: ["out", 1], l: ["up", 0.4 + 0.3 * Math.sin(t * 6)] } })); crowd40(out, t, 9, tz + 2.2);
      const tc = T("cents"), v = clamp01((t - tc + 0.25) / 0.6); if (v > 0 && v < 1) fxCard(out, "coin" + Math.floor(t * 20) % 9, (p) => DR.coin(p, Math.floor(t * 20) % 9), tx + 0.3 - v * 0.2, 1.4 + Math.sin(v * Math.PI) * 1.4, tz + 3.0 + v * 3.2, 0.22, 0.22, { cw: 256, ch: 256, kind: "lit" }); } });
  // 17 Time and Life magazines came for photos.: reverse shot from the stage over Mike's back: press photographers, flashes popping
  const flashes = [T("Time") + 0.12, T("magazines") + 0.2, T("came") + 0.05, T("photos") - 0.12];
  const fl = (t) => { let m = 0; for (const a of flashes) { const k = t - a; if (k >= 0 && k < 0.22) m = Math.max(m, (1 - k / 0.22) * 0.55); } return m; };
  shot({ at: S("Time"), ...fair, sunAz: 30, cam: push([tx + 0.85, 1.55, tz - 1.25], [tx - 0.1, 1.15, tz + 3.4], [tx + 0.8, 1.5, tz - 1.05], [tx - 0.1, 1.15, tz + 3.4], 48, 2.0), cInf: 2, focus: [tx, 1.2, tz + 2.5], shadowR: 12, flash: fl,
    stage(t, out) { mike(out, { ph: -1, puff: 0.8, wing: Math.floor(t * 2) % 2 ? 0.6 : 0.2, neck: 0.3 }, tx + 0.5, 0.9, tz - 0.4, 1);
      const ph = [[PRESS(0), tx - 0.75, tz + 2.25, 0], [PRESS(1), tx + 0.55, tz + 2.5, 1], [PRESS(2, { cap: "#6a5a44" }), tx - 0.05, tz + 3.1, 2]];
      for (const [o, x, z, k] of ph) { const on = flashes.some((a, j) => j % 3 === k % 3 && t - a >= 0 && t - a < 0.12); out.places.push(pl(40 + k, o, x, 0.05, z, { expr: on ? "smile_closed" : "talk_o", arms: { l: ["face", 1], r: ["face", 1] }, extra: all(XL.press(o), XL.flashCam(o, on)) })); if (on) fxCard(out, "flashS", DR.flash, x - 0.27, 1.62, z + 0.2, 1.0, 1.0, { cw: 256, ch: 256, kind: "soft" }); }
      crowd40(out, t, 6, tz + 4.4, true); } });
  // 18 (insert) photos: the covers land on a table, fanned
  shot({ at: T("photos") + 0.1, light: "day", sunAz: 150, sunEl: 60, cam: () => ({ pos: f_(0, 42.2, 60.0), look: f_(0, 40, 60.0 - 0.01), fov: 40, roll: 0 }), cInf: 0, focus: f_(0, 40, 60), shadowR: 4, kicks: [],
    stage(t, out) { const u = t - T("photos") - 0.1; fxCard(out, "tableWood", (p) => { const g = p.g; g.fillStyle = "#8a6440"; g.fillRect(0, 0, 512, 512); for (let y = 0; y < 512; y += 64) { g.fillStyle = "rgba(40,20,10,0.25)"; g.fillRect(0, y, 512, 4); } }, fx, 40, fz + 60, 3, 3, { cw: 512, ch: 512, kind: "basic", flat: true });
      for (let k = 0; k < 2; k++) { const v = smooth((u - k * 0.18) / 0.22); if (v <= 0) continue; fxCard(out, "mag" + k, (p) => DR.mag(p, k), fx - 0.32 + k * 0.62 + (1 - v) * (k ? 1.2 : -1.2), 40.01 + k * 0.01, fz + 60 + (k ? 0.08 : -0.06), 0.62, 0.86, { cw: 512, ch: 704, kind: "basic", flat: true, rot: (k ? -0.12 : 0.1) + (1 - v) * 0.6 }); } } });
  kick1(T("photos") + 0.3);
  // 19 Then one night,: the Phoenix motel by the highway, neon buzzing, stars, the red pickup parked
  const [mx, , mz] = MOTEL, night = { light: "night", sunAz: 12, sunEl: 15, fogFar: 1600 };
  shot({ at: S("Then"), ...night, cam: push([mx + 34, 1.7, dz + 7], [mx + 14, 3.6, mz + 2], [mx + 31, 1.6, dz + 5.6], [mx + 14, 3.6, mz + 2], 50, 1.4), cInf: 1, focus: [mx + 20, 4, mz + 8], shadowR: 30,
    stage(t, out, c) { const on = Math.floor(t * 9) % 13 !== 0; sign(out, "neon" + on, (p) => DR.neon(p, on), 384, 768, mx + 22, 6.4, mz + 9.75, 2.2, 4.4, [0.5, 0, 1], "basic"); if (on) fxCard(out, "neonGlow", (p) => DR.glow(p, "255,80,100", 0.5), mx + 22, 6.4, mz + 10.0, 7, 7, { cw: 256, ch: 256, kind: "soft" });
      for (const x of [mx - 0.2]) fxCard(out, "winGlow", (p) => DR.glow(p, "255,190,110", 0.45), x + 1.7, 1.6, mz + 5.4, 3.2, 2.4, { cw: 256, ch: 256, kind: "soft" });
      out.veh.push({ type: "ute", x: mx + 4, y: 0, z: mz + 11.5, yaw: Math.PI / 2 + 0.25, mat: "carRed" });
      fxCard(out, "stars", DR.stars, c.pos[0] - 120, 160, c.pos[2] - 360, 700, 700, { cw: 1024, ch: 1024, kind: "basic" }); } });
  // 20 in a Phoenix motel...: inside, Lloyd asleep sitting up, Mike's crate on the floor, moonlight through the blinds
  const R = ROOM.motel, r_ = (x, y, z) => [R[0] + x, R[1] + y, R[2] + z];
  const room = { props: { motel: 1 }, fogFar: 300, shadowR: 6 };
  const bedLloyd = (out, t, o) => out.places.push(pl(1, lloyd, R[0] - 1.75, R[1] + 0.48, R[2] - 1.2, { mode: "sit", keep: true, blob: false, ...o }));
  shot({ at: S("in a"), ...night, ...room, sunAz: -40, sunEl: 30, sunK: 1.8, cam: push(r_(0.45, 1.4, 1.75), r_(-0.95, 0.8, -1.3), r_(0.3, 1.35, 1.55), r_(-0.95, 0.82, -1.3), 58, 1.7), cInf: 3, focus: r_(-1.0, 0.8, -1.3),
    stage(t, out) { bedLloyd(out, t, { expr: "sleep", noBlink: true, headTilt: 18, tilt: 4 }); bubble(out, "zzz" + Math.floor(t * 6) % 6, (p) => DR.zzz(p, Math.floor(t * 6) % 6), R[0] - 1.3, R[1] + 2.0, R[2] - 1.15, 1, 0.75);
      mike(out, { ph: -1, puff: 0.2 }, R[0] - 0.05, R[1] + 0.09, R[2] - 1.42, 1, { h: 0.5, shadow: false });
      fxCard(out, "moonbeam", (p) => DR.glow(p, "150,180,255", 0.35), R[0] + 0.4, R[1] + 0.6, R[2] - 2.2, 2.6, 2.0, { cw: 256, ch: 256, kind: "soft" }); } });
  // 21 Mike choked.: Lloyd jolts awake, the lamp clicks on, "!"
  shot({ at: S("Mike choked"), ...room, light: "golden", sunAz: 60, sunEl: 20, cam: push(r_(0.3, 1.38, 1.6), r_(-1.1, 0.85, -1.3), r_(0.22, 1.36, 1.45), r_(-1.1, 0.86, -1.3), 56, 1.0), cInf: 3, focus: r_(-1.0, 0.9, -1.3), kicks: [],
    stage(t, out) { const k = t > T("choked") - 0.05; bedLloyd(out, t, { expr: k ? "gasp" : "sleep", noBlink: !k, headTilt: k ? 0 : 18, arms: k ? { l: ["up", 0.6], r: ["up", 0.6] } : undefined });
      fxCard(out, "lampGlow", (p) => DR.glow(p, "255,190,110", 0.55), R[0] - 2.2, R[1] + 1.2, R[2] - 1.7, 3.4, 3.4, { cw: 256, ch: 256, kind: "soft" });
      mark(out, "!", R[0] - 1.65, R[1] + 2.05, R[2] - 1.15, (t - T("choked") + 0.05) * 1.6, 0.5, "#ffe85a"); mark(out, "!", R[0] - 0.05, R[1] + 0.75, R[2] - 1.35, (t - T("choked") - 0.05) * 1.6, 0.3, "#ff8a6a");
      mike(out, { ph: -1, puff: 0.1, wing: k ? 0.6 * Math.abs(Math.sin(t * 16)) : 0 }, R[0] - 0.05, R[1] + 0.09, R[2] - 1.42, 1, { h: 0.5, shadow: false }); } });
  kick1(T("choked") + 0.02);
  // 22 And it was over.: the empty crate in moonlight, one feather drifting down
  shot({ at: S("And it"), ...night, ...room, sunAz: -30, sunEl: 35, sunK: 1.8, cam: push(r_(0.35, 0.62, -0.25), r_(-0.05, 0.25, -1.4), r_(0.28, 0.58, -0.45), r_(-0.05, 0.22, -1.4), 44, 1.2), cInf: 5, focus: r_(-0.05, 0.3, -1.4),
    stage(t, out) { const u = t - T("And it") + 0.1; fxCard(out, "feather", DR.feather, R[0] - 0.05 + Math.sin(u * 3) * 0.08, R[1] + Math.max(0.12, 0.75 - u * 0.48), R[2] - 1.35, 0.12, 0.12, { cw: 256, ch: 256, kind: "lit", rot: Math.sin(u * 3) * 0.6 });
      fxCard(out, "moonbeam2", (p) => DR.glow(p, "170,200,255", 0.5), R[0] - 0.05, R[1] + 0.5, R[2] - 1.5, 1.4, 1.6, { cw: 256, ch: 256, kind: "soft" }); } });
  // 23 But today,: Fruita, the festival: banner, bunting, crowd, confetti; whip in
  const [ex, , ez] = FEST, fest = { light: "day", sunAz: 200, sunEl: 55, fogFar: 6000 };
  const festCrowd = (out, t, n, z0, spread = 1.0, cheer = 0) => { for (let k = 0; k < n; k++) { const o = MOD(k), x = ex - 3.2 + (k % 6) * 1.25 * spread + (Math.floor(k / 6) % 2) * 0.6, z = z0 + Math.floor(k / 6) * 1.1 + hh(k, 3) * 0.35; const up = cheer && (k + Math.floor(t * 3)) % 3 !== 0;
    out.places.push(pl(60 + k, o, x, 0.08, z, { expr: up ? (k % 2 ? "laugh" : "barker_e") : ["grin", "smile_closed", "talk_e"][k % 3], arms: up ? { l: ["up", 0.7 + 0.3 * Math.sin(t * 8 + k)], r: ["up", 0.7 + 0.3 * Math.cos(t * 8 + k)] } : undefined, extra: k % 4 === 1 ? XL.chickHat(o) : k % 5 === 3 ? XL.scarf(o) : undefined, y: 0.08 + (up ? Math.abs(Math.sin(t * 6 + k)) * 0.06 : 0) })); } };
  shot({ at: S("But today"), ...fest, whip: 1, cam: push([ex + 0.3, 2.1, ez + 3.5], [ex, 2.75, ez - 15], [ex + 0.25, 2.2, ez + 2.6], [ex, 2.8, ez - 15], 48, 1.0), cInf: 1.5, focus: [ex, 2.5, ez - 8], shadowR: 20,
    stage(t, out) { sign(out, "festBanner", DR.festBanner, 1024, 320, ex, 2.65, ez - 15.95, 8.0, 2.5); festCrowd(out, t, 12, ez - 9.5, 1.1, 1); confetti(out, t, ex, 0, ez - 4, 5, 3, 60, 6); } });
  // 24 his town still throws a festival: the crowd cheering, chicken hats, someone in a full chicken suit flapping
  shot({ at: S("his town"), ...fest, cam: push([ex + 0.2, 1.62, ez + 1.6], [ex + 0.1, 1.5, ez - 3.5], [ex + 0.15, 1.6, ez + 1.15], [ex + 0.1, 1.52, ez - 3.5], 46, 1.7), cInf: 4, focus: [ex, 1.5, ez - 3.0], shadowR: 10,
    stage(t, out) { festCrowd(out, t, 11, ez - 4.6, 1.0, 1); const o = MOD(9, { jacket: "#fbf6ea", pants: "#f2b83a", boots: "#f2b83a", hat: "hair", hair: "#fbf6ea" }); out.places.push(pl(80, o, ex + 0.15, 0.08 + Math.abs(Math.sin(t * 7)) * 0.1, ez - 2.9, { expr: "laugh", extra: XL.suit(o, Math.abs(Math.sin(t * 7))) })); confetti(out, t, ex, 0, ez - 3, 3, 2, 50, 4); } });
  // 25 every year.: the "Run Like a Headless Chicken" 5K: runners (chicken hats) charging past under the banner
  shot({ at: S("every"), ...fest, cam: push([ex + 0.0, 1.2, ez + 8.6], [ex - 0.2, 1.6, ez + 1], [ex - 0.2, 1.2, ez + 8.0], [ex - 0.2, 1.6, ez + 1], 46, 1.3), cInf: 3, focus: [ex, 1.2, ez + 1.4], shadowR: 12,
    stage(t, out) { sign(out, "runBanner", DR.runBanner, 1024, 192, ex - 0.2, 3.0, ez - 0.95, 4.4, 0.83); const u = t - T("every");
      for (let k = 0; k < 7; k++) { const o = MOD(k + 3), x = ex + 5.5 - u * (3.6 + (k % 3) * 0.5) - k * 1.1 + (k % 2) * 0.4; out.places.push(pl(90 + k, o, x, 0.08, ez + 1.2 + (k % 3) * 0.5, { dir: [-1, 0], view: "side", mode: "march", stride: 1.2, phase: (u * 2.6 + k * 0.3) % 1, expr: k % 2 ? "laugh" : "grin", extraSide: k % 2 === 0 ? (p) => { const g = p.g; g.save(); g.translate(300, 150); g.scale(0.34, 0.34); g.translate(-256, -420); drawMike(g, { head: true, mood: "happy" }); g.restore(); } : undefined, sideKey: k % 2 === 0 ? "hat" : "" })); } } });
  // 26 All for...: push in on Mike's statue above the crowd (loops back to the real Mike in shot 1)
  const sx2 = ex - 2.5, sz2 = ez + 9.1;
  shot({ at: S("All"), ...fest, cam: push([sx2 + 0.3, 0.75, sz2 + 4.6], [sx2 + 0.12, 2.0, sz2], [sx2 + 0.26, 0.8, sz2 + 3.7], [sx2 + 0.12, 2.05, sz2], 46, 1.0), cInf: 2, focus: [sx2, 1.9, sz2], shadowR: 10,
    stage(t, out) { mike(out, { ph: 0.25, puff: 0.35, metal: true }, sx2 + 0.05, 1.2, sz2, 1, { h: 1.55, shadow: false });
      for (let k = 0; k < 6; k++) { const o = MOD(k + 1); out.places.push(pl(100 + k, o, sx2 + [-1.55, -1.0, -0.6, 0.85, 1.3, 1.75][k], 0.08, sz2 + 0.9 + (k % 2) * 0.3, { expr: k % 2 ? "grin" : "talk_o", arms: k === 2 ? { r: ["point", 1] } : k === 4 ? { l: ["up", 1], r: ["up", 1] } : undefined, extra: k % 3 === 0 ? XL.chickHat(o) : undefined })); } } });

  SHOTS = D.map((s, i) => ({ ...s, a: s.a ?? s.at, b: i + 1 < D.length ? (D[i + 1].a ?? D[i + 1].at) : END + 0.01 }));
  // a little handheld drift on every shot; whip-in on shots that ask for it
  SHOTS.forEach((s) => { const base = s.cam, ph = (s.at ?? s.a ?? 0) * 1.7, w = 0.01; s.cam = (l, ...r) => { const c = base(l, ...r); let look = c.look;
    if (s.whip) { const k = 1 - glide(l / 0.2), fxv = c.look[0] - c.pos[0], fzv = c.look[2] - c.pos[2], n = Math.hypot(fxv, fzv) || 1; look = [c.look[0] + (-fzv / n) * k * n * 0.9 * s.whip, c.look[1], c.look[2] + (fxv / n) * k * n * 0.9 * s.whip]; }
    return { ...c, look, pos: [c.pos[0] + w * Math.sin(l * 1.1 + ph), c.pos[1] + w * 0.7 * Math.sin(l * 1.6 + ph * 2), c.pos[2] + w * Math.sin(l * 0.9 + ph * 3)] }; }; });
  SHOTS.forEach((s, i) => { s.id = i + 1; const c = s.cam(0.3); const fx2 = c.look[0] - c.pos[0], fz2 = c.look[2] - c.pos[2], n = Math.hypot(fx2, fz2) || 1; s.fwd = [fx2 / n, fz2 / n]; });
}

export const shotAt = (t) => SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];
export function frameState(f) {
  const thumb = f < 0; if (thumb && !THUMB) THUMB = thumbShot();
  const t = thumb ? 2.2 : f / FPS, s = thumb ? THUMB : shotAt(t), local = t - s.a, c = s.cam(local);
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
