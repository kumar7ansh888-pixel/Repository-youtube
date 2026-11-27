// Canvas drawings for "A Gang Stole $18 Million of Maple Syrup" (the great Canadian maple syrup heist, Quebec 2011-2012).
import { INK } from "../lib/toon.js";
import { txt, E, R, poly, line, hh, heart, drawFlash, drawSign } from "./draw_bosco.js";
export { txt, E, R, poly, line, hh, heart, drawFlash, drawSign };
const two = Math.PI * 2;
const AMBER = "#d8841a", AMBER_L = "#f4b440", AMBER_D = "#9a4a10";

// maple leaf polygon centred on x, y, size s (tip to tip ~ 2s)
export const leaf = (g, x, y, s, col = "#d8202e", lw = 0) => {
  const P = [[0, -1], [0.14, -0.66], [0.32, -0.74], [0.27, -0.36], [0.62, -0.5], [0.54, -0.3], [0.9, -0.2], [0.74, -0.05], [0.8, 0.12], [0.46, 0.08], [0.48, 0.24], [0.06, 0.2], [0.06, 0.62], [-0.06, 0.62], [-0.06, 0.2], [-0.48, 0.24], [-0.46, 0.08], [-0.8, 0.12], [-0.74, -0.05], [-0.9, -0.2], [-0.54, -0.3], [-0.62, -0.5], [-0.27, -0.36], [-0.32, -0.74], [-0.14, -0.66]];
  poly(g, P.map(([a, b]) => [x + a * s, y + b * s]), col, lw);
};

// white steel drum, upright, 384 x 512. o: open (lid off), fill ("syrup" | "water" | "empty"), rust, stamp (text), glow, face
export function drawBarrel(g, o = {}) {
  g.clearRect(0, 0, 384, 512);
  if (o.glow) { const gr = g.createRadialGradient(192, 260, 20, 192, 260, 200); gr.addColorStop(0, "rgba(255,210,90,0.75)"); gr.addColorStop(1, "rgba(255,210,90,0)"); g.fillStyle = gr; g.fillRect(0, 0, 384, 512); }
  const x0 = 62, x1 = 322, yT = 92, yB = 470;
  const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "#c4c8ce"); gr.addColorStop(0.3, "#ffffff"); gr.addColorStop(0.7, "#e8eaee"); gr.addColorStop(1, "#a8acb4");
  g.beginPath(); g.moveTo(x0, yT); g.lineTo(x0, yB); g.ellipse(192, yB, 130, 30, 0, Math.PI, 0, true); g.lineTo(x1, yT); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  for (const y of [210, 350]) { g.beginPath(); g.ellipse(192, y, 131, 26, 0, 0, Math.PI); g.strokeStyle = "#8a8e96"; g.lineWidth = 10; g.stroke(); }
  if (o.rust) for (let i = 0; i < 7; i++) E(g, 90 + hh(i, 4) * 200, 150 + hh(i, 5) * 290, 14 + hh(i, 6) * 22, 9 + hh(i, 7) * 12, 0, i % 2 ? "#a8582a" : "#8a4a22", 0);
  if (o.face) { const f = o.face; E(g, 150, 270, 16, f === "shock" ? 22 : 14, 0, "#ffffff", 5); E(g, 234, 270, 16, f === "shock" ? 22 : 14, 0, "#ffffff", 5); E(g, 152, 272, 7, 8, 0, INK, 0); E(g, 236, 272, 7, 8, 0, INK, 0);
    if (f === "shock") E(g, 192, 330, 22, 28, 0, "#4a1a1a", 6); else { g.beginPath(); g.arc(192, 314, 30, 0.15 * Math.PI, 0.85 * Math.PI); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); } }
  // top
  E(g, 192, yT, 130, 32, 0, o.open ? "#5a5e66" : "#dcdfe4", 9);
  if (o.open) { const c = o.fill === "syrup" ? AMBER : o.fill === "water" ? "#5ab0e8" : "#2a2c32"; E(g, 192, yT + 4, 112, 24, 0, c, 0); if (o.fill === "syrup") E(g, 160, yT, 40, 8, 0, AMBER_L, 0); if (o.fill === "water") E(g, 170, yT + 2, 50, 7, 0, "#bfe6ff", 0); }
  else { E(g, 192, yT, 112, 24, 0, null, 5); E(g, 250, yT - 2, 18, 6, 0, "#b8bcc2", 4); }
  if (o.stamp) { g.save(); g.translate(192, 280); g.rotate(-0.22); R(g, -125, -46, 250, 92, 12, "rgba(255,255,255,0.0)", 10, "#d8202e"); txt(g, o.stamp, 0, 4, 84, "Bangers", "#d8202e", INK, 0, 230); g.restore(); }
}

// drum lying on its side, rolling (512 x 384): k = roll phase 0..1 (moves the ribs/sticker), syrup slosh drops
export function drawBarrelSide(g, o = {}) {
  g.clearRect(0, 0, 512, 384);
  const y0 = 70, y1 = 330, x0 = 90, x1 = 440, k = o.k ?? 0;
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#eef0f2"); gr.addColorStop(1, "#a4a8b0");
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.ellipse(x1, 200, 36, 130, 0, -Math.PI / 2, Math.PI / 2); g.lineTo(x0, y1); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  for (const x of [205, 325]) { g.beginPath(); g.ellipse(x, 200, 26, 130, 0, -Math.PI / 2, Math.PI / 2); g.strokeStyle = "#8a8e96"; g.lineWidth = 10; g.stroke(); }
  // a sticker that travels round with the roll
  const a = (k % 1) * two, sy = 200 - Math.cos(a) * 110; if (Math.sin(a) > -0.2) { const sq = Math.max(0.15, Math.abs(Math.sin(a + Math.PI / 2))); g.save(); g.translate(265, sy); g.scale(1, sq); leaf(g, 0, 0, 40, "#d8202e", 5); g.restore(); }
  E(g, x0, 200, 40, 130, 0, "#dcdfe4", 9); E(g, x0, 200, 30, 108, 0, null, 5); const b = a * 1.0; E(g, x0 + Math.sin(b) * 4, 200 - Math.cos(b) * 70, 8, 16, 0, "#b8bcc2", 4);
}

// top-down into an open drum (512 x 512): fill "syrup" | "water" | "empty"; k = animation
export function drawBarrelTop(g, o = {}) {
  g.clearRect(0, 0, 512, 512); const k = o.k ?? 0;
  E(g, 256, 256, 240, 240, 0, "#dfe2e6", 12); E(g, 256, 256, 214, 214, 0, "#b4b8be", 8);
  if (o.fill === "syrup") { const gr = g.createRadialGradient(220, 210, 20, 256, 256, 210); gr.addColorStop(0, AMBER_L); gr.addColorStop(1, AMBER_D); E(g, 256, 256, 200, 200, 0, gr, 0); for (let i = 0; i < 3; i++) { const r = ((k * 60 + i * 60) % 180) + 10; E(g, 256, 256, r, r, 0, null, 4, "rgba(255,230,160,0.5)"); } E(g, 200, 190, 50, 22, -0.5, "rgba(255,255,255,0.55)", 0); }
  else if (o.fill === "water") { E(g, 256, 256, 200, 200, 0, "#4aa0e0", 0); for (let i = 0; i < 4; i++) { const r = ((k * 80 + i * 45) % 180) + 10; E(g, 256, 256, r, r, 0, null, 5, "rgba(220,245,255,0.7)"); } }
  else { const gr = g.createRadialGradient(256, 256, 10, 256, 256, 200); gr.addColorStop(0, "#08080a"); gr.addColorStop(0.7, "#2a2c30"); gr.addColorStop(1, "#5a5e64"); E(g, 256, 256, 200, 200, 0, gr, 0);
    for (let i = 0; i < 6; i++) E(g, 256 + Math.cos(i * 1.3) * 160, 256 + Math.sin(i * 1.3) * 160, 22, 12, i, "#9a5a2a", 0);
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 3; for (let r = 30; r < 130; r += 25) { g.beginPath(); for (let i = 0; i <= 8; i++) { const a = (i / 8) * two; g.lineTo(380 + Math.cos(a) * r * 0.8, 150 + Math.sin(a) * r * 0.8); } g.stroke(); }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * two; line(g, [[380, 150], [380 + Math.cos(a) * 110, 150 + Math.sin(a) * 110]], "rgba(255,255,255,0.75)", 3); }
    E(g, 380 + Math.sin(k * 3) * 8, 150 + 40 + Math.cos(k * 2) * 6, 10, 12, 0, "#1a1a1a", 3, "#555"); }
}

// golden syrup splash crown (512 x 512), k 0..1
export function drawSplash(g, k = 0.5, col = AMBER, hi = AMBER_L) {
  g.clearRect(0, 0, 512, 512); const s = 0.5 + 0.5 * Math.min(1, k * 2);
  E(g, 256, 420, 200 * s, 50 * s, 0, col, 8);
  for (let i = 0; i < 9; i++) { const a = -Math.PI + (i + 0.5) * (Math.PI / 9), h = (120 + hh(i, 2) * 160) * s, x = 256 + Math.cos(a) * 170 * s;
    g.beginPath(); g.moveTo(x - 22, 420); g.quadraticCurveTo(x + Math.cos(a) * 30, 420 - h * 0.6, x + Math.cos(a) * 40, 420 - h); g.quadraticCurveTo(x + 22, 420 - h * 0.5, x + 22, 420); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
    E(g, x + Math.cos(a) * 46, 420 - h - 24 - k * 40, 16, 20, 0, col, 6); }
  E(g, 200, 405, 60, 12, 0, hi, 0);
}

// box truck, side view facing right (1024 x 512). o.k wheel phase, o.open (rear door open, barrels visible), o.label, o.dust
export function drawTruck(g, o = {}) {
  g.clearRect(0, 0, 1024, 512); const k = o.k ?? 0;
  if (o.dust) for (let i = 0; i < 5; i++) E(g, 40 + i * 30 - (k * 40 % 30), 420 - i * 12, 40 + i * 10, 26 + i * 6, 0, "rgba(200,190,170,0.55)", 0);
  R(g, 60, 90, 640, 300, 14, "#f2f0ea", 10); R(g, 60, 360, 900, 40, 8, "#3a3a40", 8);
  if (o.open) { R(g, 66, 100, 120, 280, 8, "#3a3228", 0); for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) { R(g, 74 + i * 56, 120 + j * 86, 50, 78, 10, "#eceef0", 5); } }
  txt(g, o.label ?? "TOTALLY NORMAL TRUCK", 400, 230, 64, "Bangers", "#2a4a8a", INK, 0, 520);
  poly(g, [[700, 390], [700, 150], [850, 150], [940, 260], [960, 270], [960, 390]], "#c8302a", 10); poly(g, [[730, 170], [835, 170], [905, 255], [730, 255]], "#9ad0ea", 7);
  R(g, 948, 300, 22, 40, 6, "#ffe890", 5);
  for (const x of [190, 300, 820]) { E(g, x, 400, 58, 58, 0, "#222226", 9); E(g, x, 400, 26, 26, 0, "#b8bcc2", 6); const a = k * two; line(g, [[x + Math.cos(a) * 24, 400 + Math.sin(a) * 24], [x - Math.cos(a) * 24, 400 - Math.sin(a) * 24]], INK, 6); }
}

// police car, side view facing right (1024 x 448), k: siren phase
export function drawPolice(g, k = 0) {
  g.clearRect(0, 0, 1024, 448);
  poly(g, [[70, 330], [80, 230], [250, 210], [360, 120], [680, 120], [800, 210], [950, 230], [960, 330]], "#f4f4f0", 10);
  R(g, 80, 250, 870, 50, 6, "#1c3a8a", 0); txt(g, "POLICE", 520, 278, 50, "Bangers", "#ffffff", INK, 0, 400);
  poly(g, [[385, 140], [520, 140], [520, 205], [300, 205]], "#9ad0ea", 7); poly(g, [[540, 140], [670, 140], [760, 205], [540, 205]], "#9ad0ea", 7);
  const on = Math.floor(k * 6) % 2; R(g, 440, 88, 70, 34, 8, on ? "#ff2a2a" : "#7a1a1a", 6); R(g, 520, 88, 70, 34, 8, on ? "#2a4aff" : "#ff2a2a" === 0 ? "" : "#1a2a7a", 6);
  if (on) { const gr = g.createRadialGradient(475, 100, 4, 475, 100, 120); gr.addColorStop(0, "rgba(255,60,60,0.8)"); gr.addColorStop(1, "rgba(255,60,60,0)"); g.fillStyle = gr; g.fillRect(340, 0, 280, 230); }
  else { const gr = g.createRadialGradient(555, 100, 4, 555, 100, 120); gr.addColorStop(0, "rgba(60,90,255,0.8)"); gr.addColorStop(1, "rgba(60,90,255,0)"); g.fillStyle = gr; g.fillRect(420, 0, 280, 230); }
  for (const x of [230, 800]) { E(g, x, 340, 62, 62, 0, "#222226", 9); E(g, x, 340, 28, 28, 0, "#b8bcc2", 6); }
}

// the plan, a blueprint sheet (768 x 768). n: steps shown 0..4
export function drawPlan(g, n = 4) {
  g.clearRect(0, 0, 768, 768); R(g, 20, 20, 728, 728, 20, "#1f4a8a", 12);
  g.strokeStyle = "rgba(255,255,255,0.15)"; g.lineWidth = 2; for (let i = 60; i < 740; i += 40) { line(g, [[i, 30], [i, 738]], "rgba(255,255,255,0.12)", 2); line(g, [[30, i], [738, i]], "rgba(255,255,255,0.12)", 2); }
  txt(g, "THE PLAN", 384, 90, 92, "Bangers", "#ffffff", INK, 0, 600);
  const box = (x, y, s) => { R(g, x - 80, y - 60, 160, 120, 10, null, 6, "#ffffff"); txt(g, s, x, y, 40, "Bangers", "#ffffff", INK, 0, 150); };
  box(170, 250, "SYRUP"); if (n >= 1) { box(600, 250, "TRUCK"); line(g, [[260, 250], [500, 250]], "#ffd23a", 8); poly(g, [[500, 230], [530, 250], [500, 270]], "#ffd23a", 0); }
  if (n >= 2) { box(600, 520, "SLURP"); line(g, [[600, 320], [600, 440]], "#ffd23a", 8); poly(g, [[580, 440], [600, 470], [620, 440]], "#ffd23a", 0); }
  if (n >= 3) { box(170, 520, "H2O!"); line(g, [[510, 520], [270, 520]], "#ffd23a", 8); poly(g, [[270, 500], [240, 520], [270, 540]], "#ffd23a", 0); }
  if (n >= 4) { line(g, [[170, 450], [170, 330]], "#ffd23a", 8); poly(g, [[150, 330], [170, 300], [190, 330]], "#ffd23a", 0); txt(g, "$$$", 384, 670, 90, "Bangers", "#7ad04a", INK, 10, 400); }
}

// pancake stack with syrup (512 x 512): k drip phase, tag (price tag text)
export function drawPancakes(g, o = {}) {
  g.clearRect(0, 0, 512, 512); const k = o.k ?? 0;
  E(g, 256, 440, 220, 46, 0, "#ffffff", 9); E(g, 256, 436, 180, 34, 0, "#eef0f4", 0);
  for (let i = 0; i < 6; i++) { const y = 410 - i * 40; E(g, 256, y, 160, 34, 0, "#e8a050", 8); E(g, 256, y - 6, 150, 26, 0, "#f4c070", 0); }
  E(g, 256, 196, 150, 30, 0, AMBER, 7);
  for (let i = 0; i < 6; i++) { const x = 130 + i * 50, L0 = 40 + ((k * 60 + i * 37) % 120); g.beginPath(); g.moveTo(x - 12, 200); g.lineTo(x - 10, 200 + L0); g.arc(x, 200 + L0, 11, Math.PI, 0, true); g.lineTo(x + 12, 200); g.closePath(); g.fillStyle = AMBER; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  R(g, 220, 160, 72, 40, 8, "#fff2a0", 6); E(g, 200, 190, 40, 8, 0, "rgba(255,240,200,0.7)", 0);
  if (o.tag) { g.save(); g.translate(400, 120); g.rotate(0.25); line(g, [[-70, 20], [-110, 70]], INK, 4); R(g, -80, -40, 190, 84, 14, "#ffe85a", 7); E(g, -62, 0, 9, 9, 0, "#ffffff", 4); txt(g, o.tag, 18, 4, 58, "Bangers", "#1a7a3a", INK, 0, 160); g.restore(); }
}

// waving Canadian flag (768 x 384), k phase
export function drawFlagCA(g, k = 0) {
  g.clearRect(0, 0, 768, 384); const N = 24, wv = (x) => Math.sin(x * 0.012 + k * 6) * 18 * (x / 768);
  const band = (xa, xb, col) => { g.beginPath(); for (let i = 0; i <= N; i++) { const x = xa + (xb - xa) * i / N; g.lineTo(x, 40 + wv(x)); } for (let i = N; i >= 0; i--) { const x = xa + (xb - xa) * i / N; g.lineTo(x, 344 + wv(x)); } g.closePath(); g.fillStyle = col; g.fill(); };
  band(20, 212, "#d8202e"); band(212, 556, "#ffffff"); band(556, 748, "#d8202e");
  leaf(g, 384, 196 + wv(384), 120, "#d8202e", 0);
  g.beginPath(); for (let i = 0; i <= N; i++) { const x = 20 + 728 * i / N; g.lineTo(x, 40 + wv(x)); } for (let i = N; i >= 0; i--) { const x = 20 + 728 * i / N; g.lineTo(x, 344 + wv(x)); } g.closePath(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
}

// syrup jug (256 x 320)
export function drawJug(g) { g.clearRect(0, 0, 256, 320); R(g, 40, 90, 176, 210, 30, "#f2e6c8", 8); R(g, 52, 170, 152, 120, 20, AMBER, 0); R(g, 100, 40, 56, 56, 10, "#f2e6c8", 8); R(g, 94, 24, 68, 28, 8, "#d8202e", 6); g.beginPath(); g.ellipse(196, 130, 30, 40, 0, -1.4, 1.4); g.strokeStyle = INK; g.lineWidth = 14; g.stroke(); leaf(g, 128, 220, 40, "#d8202e", 4); }

// cash stack (256 x 160)
export function drawCash(g) { g.clearRect(0, 0, 256, 160); for (let i = 0; i < 3; i++) { R(g, 20 + i * 6, 40 + i * 20 - 10, 200, 80, 8, "#7ac05a", 6); } E(g, 126, 90, 26, 26, 0, "#5aa040", 5); txt(g, "$", 126, 92, 40, "Bangers", "#ffffff", INK, 0); R(g, 112, 40, 30, 92, 4, "#f4e8b0", 4); }

// jail bars (1024 x 1024, transparent between bars)
export function drawBars(g) { g.clearRect(0, 0, 1024, 1024); for (let i = 0; i < 8; i++) { const x = 60 + i * 130; R(g, x - 18, 0, 36, 1024, 14, "#5a5e66", 7); R(g, x - 8, 0, 8, 1024, 4, "#9aa0a8", 0); } R(g, 0, 120, 1024, 40, 10, "#4a4e56", 7); R(g, 0, 860, 1024, 40, 10, "#4a4e56", 7); }

// the fine: a long bill (512 x 1024), u = how far unrolled 0..1
export function drawFine(g, u = 1) {
  g.clearRect(0, 0, 512, 1024); const h = 160 + 840 * Math.max(0, Math.min(1, u));
  R(g, 40, 20, 432, h, 14, "#fbf8ee", 9); txt(g, "FINE", 256, 100, 110, "AlfaSlab", "#d8202e", INK, 0, 380);
  for (let i = 0; i < 12; i++) { const y = 190 + i * 52; if (y > h - 120) break; line(g, [[80, y], [300, y]], "#9a9aa4", 8); txt(g, "$$$", 390, y, 40, "Bangers", "#2a2a36", INK, 0); }
  if (u > 0.85) { txt(g, "MILLIONS", 256, h - 60, 96, "Bangers", "#d8202e", INK, 8, 400); }
}

// month calendar page (512 x 640)
export function drawMonth(g, m) { g.clearRect(0, 0, 512, 640); R(g, 20, 40, 472, 580, 24, "#ffffff", 12); R(g, 20, 40, 472, 150, 24, "#c8202e", 12); for (const x of [140, 372]) R(g, x - 16, 14, 32, 70, 12, "#9aa0a8", 6);
  txt(g, m, 256, 118, 96, "Bangers", "#ffffff", INK, 8, 420); for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) { const x = 66 + j * 63, y = 240 + i * 74; txt(g, String(i * 7 + j + 1), x, y, 34, "Poppins", "#3a3a48", INK, 0); if ((i * 7 + j) % 3 === 0) line(g, [[x - 22, y - 20], [x + 22, y + 20]], "#d8202e", 6); } }

// clipboard (256 x 320)
export function drawClip(g) { g.clearRect(0, 0, 256, 320); R(g, 30, 30, 196, 270, 14, "#a07a4a", 8); R(g, 50, 60, 156, 220, 6, "#ffffff", 5); R(g, 96, 16, 64, 34, 8, "#b8bcc2", 6); for (let i = 0; i < 5; i++) { line(g, [[70, 100 + i * 36], [100, 100 + i * 36]], "#2a8a4a", 6); line(g, [[110, 100 + i * 36], [186, 100 + i * 36]], "#8a8a92", 5); } }

// a wall sign plate with two lines (1024 x 320)
export function drawPlate(g, a, b, col = "#1c3a8a") { g.clearRect(0, 0, 1024, 320); R(g, 12, 12, 1000, 296, 24, "#f8f6ee", 10); R(g, 34, 34, 956, 252, 16, null, 6, col); leaf(g, 120, 160, 70, "#d8202e", 5); leaf(g, 904, 160, 70, "#d8202e", 5);
  txt(g, a, 512, 116, 92, "AlfaSlab", col, INK, 0, 680); txt(g, b, 512, 222, 80, "AlfaSlab", "#d8202e", INK, 0, 680); }

// road sign on a post (512 x 640): a / b lines
export function drawRoadSign(g, a, b, col = "#1c5a2a") { g.clearRect(0, 0, 512, 640); R(g, 236, 300, 40, 340, 6, "#8a8e96", 6); R(g, 30, 30, 452, 300, 24, col, 10); R(g, 46, 46, 420, 268, 16, null, 5, "#ffffff"); txt(g, a, 256, 128, 92, "Bangers", "#ffffff", INK, 0, 400); txt(g, b, 256, 236, 72, "Bangers", "#ffe85a", INK, 0, 400); }
