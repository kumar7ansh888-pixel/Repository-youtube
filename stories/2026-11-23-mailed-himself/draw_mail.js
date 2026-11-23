// Canvas drawings for "This Man Mailed Himself Across the World" (Reg Spiers, 1964).
import { INK } from "../lib/toon.js";
const two = Math.PI * 2;
export const hh = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
export const txt = (g, s, x, y, size, font, fill, stroke = INK, lw = 0, maxW = 0) => {
  g.font = `${size}px ${font}`; if (maxW) { let k = size; while (g.measureText(s).width > maxW && k > 8) { k *= 0.94; g.font = `${k}px ${font}`; } }
  g.textAlign = "center"; g.textBaseline = "middle"; if (lw) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = lw; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y);
};
export const E = (g, x, y, rx, ry, rot, fill, lw = 8, stroke = INK) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, two); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
export const R = (g, x, y, w, h, r, fill, lw = 8, stroke = INK) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
export const poly = (g, pts, fill, lw = 8, stroke = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
export const line = (g, pts, col = INK, lw = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); };
const WOOD = ["#c8935a", "#b9824a", "#d29e64", "#c08850"];

// ---- the crate, front view (768 x 512). o: eyes (0..1 peeking eyes in the slat gap), label (stencils), arrow (THIS SIDE UP)
export function drawCrate(g, o = {}) {
  g.clearRect(0, 0, 768, 512); g.lineJoin = "round";
  for (let i = 0; i < 5; i++) { R(g, 20, 20 + i * 96, 728, 88, 6, WOOD[i % 4], 7); for (let k = 0; k < 3; k++) line(g, [[60 + hh(i, k) * 600, 40 + i * 96 + k * 22], [140 + hh(i, k) * 600, 42 + i * 96 + k * 22]], "rgba(90,50,20,0.35)", 4); }
  if (o.eyes) { R(g, 250, 204, 270, 28, 4, "#1a0e08", 0); const k = o.eyes; E(g, 340, 218, 26, 13 * k, 0, "#ffffff", 4); E(g, 430, 218, 26, 13 * k, 0, "#ffffff", 4); E(g, 345 + (o.look ?? 0) * 10, 219, 9, 9 * k, 0, INK, 0); E(g, 435 + (o.look ?? 0) * 10, 219, 9, 9 * k, 0, INK, 0); }
  for (const x of [20, 690]) R(g, x, 14, 58, 484, 6, "#a8743e", 8);
  line(g, [[78, 470], [690, 40]], "#a8743e", 40); line(g, [[78, 470], [690, 40]], INK, 4);
  for (const [x, y] of [[48, 40], [48, 470], [720, 40], [720, 470], [384, 255]]) E(g, x, y, 7, 7, 0, "#5a5a64", 3);
  if (o.label !== false) { g.save(); g.globalAlpha = 0.85; txt(g, "AIR CARGO", 384, 120, 84, "AlfaSlab", "#1a1a28", "#1a1a28", 0, 520); txt(g, "FRAGILE", 560, 400, 60, "AlfaSlab", "#c0202a", "#c0202a", 0, 300); g.restore();
    g.save(); g.translate(170, 380); g.globalAlpha = 0.85; poly(g, [[0, -70], [44, -20], [16, -20], [16, 60], [-16, 60], [-16, -20], [-44, -20]], "#1a1a28", 0); g.restore(); txt(g, "THIS SIDE UP", 170, 470, 30, "AlfaSlab", "#1a1a28", INK, 0, 220); }
  if (o.stamp) { g.save(); g.translate(560, 260); g.rotate(-0.2); R(g, -150, -50, 300, 100, 12, null, 10, "#c0202a"); txt(g, o.stamp, 0, 4, 70, "AlfaSlab", "#c0202a", INK, 0, 270); g.restore(); }
}
// the inside of the crate (back wall, 768 x 512), dim
export function drawCrateBack(g) { g.clearRect(0, 0, 768, 512); R(g, 10, 10, 748, 492, 10, "#5a3a1e", 10); for (let i = 0; i < 5; i++) R(g, 30, 30 + i * 92, 708, 84, 4, i % 2 ? "#6e4826" : "#644020", 4, "#3a2210");
  const gr = g.createRadialGradient(384, 220, 40, 384, 256, 420); gr.addColorStop(0, "rgba(255,220,150,0.18)"); gr.addColorStop(1, "rgba(0,0,0,0.45)"); g.fillStyle = gr; g.fillRect(20, 20, 728, 472); }
// front frame of the cut-away crate (transparent middle)
export function drawCrateFrame(g) { g.clearRect(0, 0, 768, 512); R(g, 6, 6, 756, 60, 6, WOOD[0], 8); R(g, 6, 446, 756, 60, 6, WOOD[1], 8); R(g, 6, 6, 62, 500, 6, "#a8743e", 8); R(g, 700, 6, 62, 500, 6, "#a8743e", 8);
  for (const [x, y] of [[36, 36], [36, 476], [732, 36], [732, 476]]) E(g, x, y, 8, 8, 0, "#5a5a64", 3); }
export function drawLid(g) { g.clearRect(0, 0, 768, 128); R(g, 8, 20, 752, 88, 8, WOOD[2], 8); line(g, [[60, 50], [300, 52]], "rgba(90,50,20,0.35)", 4); line(g, [[420, 76], [700, 74]], "rgba(90,50,20,0.35)", 4); for (const x of [40, 728]) E(g, x, 64, 7, 7, 0, "#5a5a64", 3); }

// ---- backdrops (1024 x 1024 wall cards; bottom edge = floor line)
const sky = (g, a, b, h = 1024) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, 1024, h); };
export function drawWall(g, kind, k = 0) {
  g.clearRect(0, 0, 1024, 1024); g.lineJoin = "round";
  if (kind === "hold") { g.fillStyle = "#3a4250"; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 7; i++) { const x = 40 + i * 160; R(g, x, 0, 34, 1024, 6, "#525c6c", 6); }
    for (let y = 300; y < 1000; y += 70) line(g, [[0, y], [1024, y + 20]], "rgba(200,170,90,0.6)", 6);
    for (let x = 0; x < 1024; x += 70) line(g, [[x, 300], [x + 30, 1000]], "rgba(200,170,90,0.6)", 6);
    E(g, 512, 120, 60, 26, 0, k ? "#ff5040" : "#a03028", 6); if (k) { const gr = g.createRadialGradient(512, 120, 10, 512, 120, 220); gr.addColorStop(0, "rgba(255,80,60,0.4)"); gr.addColorStop(1, "rgba(255,80,60,0)"); g.fillStyle = gr; g.fillRect(200, 0, 624, 400); }
    for (const [x, w, h] of [[70, 220, 220], [760, 200, 300], [300, 160, 140]]) { R(g, x, 1024 - h, w, h, 8, "#8a6a42", 8); line(g, [[x + 10, 1024 - h + 10], [x + w - 10, 1014]], "#6a4a2a", 14); } }
  else if (kind === "london") { sky(g, "#8e98a6", "#c4cad2", 700);
    g.fillStyle = "#5a6270"; g.fillRect(620, 160, 120, 560); poly(g, [[610, 160], [680, 40], [750, 160]], "#4a525e", 6); E(g, 680, 260, 46, 46, 0, "#f0e8c8", 8); line(g, [[680, 260], [680, 228]], INK, 6); line(g, [[680, 260], [702, 270]], INK, 6);
    for (let i = 0; i < 6; i++) { const x = i * 180 - 20, h = 260 + hh(i, 2) * 140; R(g, x, 720 - h, 170, h + 304, 0, ["#8a4a3a", "#7a5040", "#94604a"][i % 3], 6); for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) R(g, x + 30 + c * 70, 760 - h + r * 70, 40, 46, 4, "#e8d89a", 4); }
    g.fillStyle = "#6a6a72"; g.fillRect(0, 880, 1024, 144); R(g, 80, 640, 110, 260, 10, "#c8202a", 8); for (let r = 0; r < 4; r++) R(g, 100, 680 + r * 50, 70, 36, 3, "#f0e8c8", 4);
    g.strokeStyle = "rgba(220,230,240,0.55)"; g.lineWidth = 3; for (let i = 0; i < 90; i++) { const x = hh(i, 1) * 1024, y = (hh(i, 2) * 1024 + k * 90) % 1024; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 40); g.stroke(); } }
  else if (kind === "field") { sky(g, "#9aa8b8", "#d0d6dc", 600); for (let r = 0; r < 4; r++) { g.fillStyle = ["#6a6e78", "#7a7e88", "#5e626c", "#727680"][r]; g.fillRect(0, 340 + r * 70, 1024, 70); for (let i = 0; i < 40; i++) E(g, 14 + i * 26 + (r % 2) * 12, 370 + r * 70, 9, 11, 0, ["#c85a4a", "#4a7ac8", "#e8c84a", "#f0f0f0"][(i + r) % 4], 0); }
    g.fillStyle = "#c8553a"; g.fillRect(0, 620, 1024, 120); for (let i = 0; i < 4; i++) line(g, [[0, 640 + i * 28], [1024, 640 + i * 28]], "#f4f0e8", 4); g.fillStyle = "#5a9a4a"; g.fillRect(0, 740, 1024, 284); }
  else if (kind === "agent") { g.fillStyle = "#e8dcc0"; g.fillRect(0, 0, 1024, 1024); g.fillStyle = "#b89a6a"; g.fillRect(0, 760, 1024, 264);
    R(g, 80, 120, 360, 500, 10, "#4a9ac8", 10); E(g, 260, 260, 80, 80, 0, "#ffd23a", 0); poly(g, [[110, 600], [200, 420], [300, 520], [410, 380], [410, 600]], "#d8783a", 0); txt(g, "FLY TO", 260, 470, 60, "AlfaSlab", "#ffffff", INK, 8); txt(g, "AUSTRALIA", 260, 540, 64, "AlfaSlab", "#ffd23a", INK, 8, 320);
    R(g, 560, 160, 380, 420, 10, "#2a2a36", 10); txt(g, "FLIGHTS", 750, 220, 56, "AlfaSlab", "#ffd23a", INK, 0); for (let i = 0; i < 4; i++) { txt(g, ["PARIS", "ROME", "BOMBAY", "PERTH"][i], 680, 300 + i * 70, 40, "AlfaSlab", "#f0f0f0", INK, 0); txt(g, ["££", "££", "£££", "££££"][i], 860, 300 + i * 70, 40, "AlfaSlab", "#ff6a5a", INK, 0); } }
  else if (kind === "home") { g.fillStyle = "#f4d9a8"; g.fillRect(0, 0, 1024, 1024); for (let x = 0; x < 1024; x += 64) R(g, x, 0, 32, 1024, 0, "rgba(255,255,255,0.25)", 0); g.fillStyle = "#9a6a42"; g.fillRect(0, 780, 1024, 244);
    for (let i = 0; i < 9; i++) { const x = 80 + i * 108, y = 130 + Math.sin(i) * 18; poly(g, [[x - 40, y], [x + 40, y], [x, y + 70]], ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a"][i % 4], 5); } line(g, [[30, 120], [1000, 120]], INK, 5);
    txt(g, "HAPPY BIRTHDAY!", 512, 290, 84, "Bangers", "#ff4a6a", INK, 10, 900);
    for (const [x, c] of [[110, "#ff5a7a"], [190, "#4ab0ff"], [880, "#ffd23a"], [950, "#7ad04a"]]) { E(g, x, 470 + Math.sin(k + x) * 10, 50, 62, 0, c, 6); line(g, [[x, 532], [x + 10, 780]], INK, 3); } }
  else if (kind === "shop") { g.fillStyle = "#8a6a4a"; g.fillRect(0, 0, 1024, 1024); for (let x = 0; x < 1024; x += 128) R(g, x, 0, 124, 1024, 0, x % 256 ? "#94744e" : "#866646", 4, "#5a4028");
    R(g, 300, 180, 420, 300, 8, "#c8b490", 8); for (const [x, y, w, h, r] of [[350, 230, 30, 160, 0], [430, 220, 120, 26, 0.3], [600, 230, 30, 200, -0.1], [460, 330, 150, 22, 0]]) { g.save(); g.translate(x, y); g.rotate(r); R(g, 0, 0, w, h, 6, "#5a5a64", 5); g.restore(); }
    for (let i = 0; i < 5; i++) { g.save(); g.translate(80 + i * 24, 560); g.rotate(-0.08); R(g, 0, 0, 20, 440, 3, WOOD[i % 4], 4); g.restore(); } }
  else if (kind === "fog") { sky(g, "#b8bec4", "#d8dcdf"); g.save(); g.globalAlpha = 0.35; R(g, 300, 520, 520, 90, 40, "#6a7078", 0); poly(g, [[420, 540], [560, 400], [620, 400], [560, 540]], "#6a7078", 0); poly(g, [[760, 540], [820, 430], [850, 430], [840, 540]], "#6a7078", 0); g.restore();
    g.fillStyle = "#9aa0a6"; g.fillRect(0, 700, 1024, 324); for (let i = 0; i < 6; i++) { const y = 200 + i * 130 + Math.sin(k + i) * 20; g.fillStyle = "rgba(240,242,244,0.55)"; g.beginPath(); g.ellipse(512 + Math.sin(k * 0.7 + i * 2) * 120, y, 700, 90, 0, 0, two); g.fill(); } }
  else if (kind === "bombay") { sky(g, "#ffb43a", "#ffe9a8", 720); const gr = g.createRadialGradient(700, 220, 60, 700, 220, 420); gr.addColorStop(0, "rgba(255,255,220,0.95)"); gr.addColorStop(1, "rgba(255,200,80,0)"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 720);
    for (const x of [90, 220, 880]) { line(g, [[x, 720], [x + 20, 420]], "#6a4a2a", 22); for (let f = 0; f < 6; f++) { const a = -Math.PI / 2 + (f - 2.5) * 0.55; g.beginPath(); g.moveTo(x + 20, 420); g.quadraticCurveTo(x + 20 + Math.cos(a) * 90, 420 + Math.sin(a) * 90 - 20, x + 20 + Math.cos(a) * 160, 420 + Math.sin(a) * 160 + 40); g.strokeStyle = "#2f7a3a"; g.lineWidth = 26; g.stroke(); } }
    R(g, 380, 560, 300, 160, 6, "#e8e0d0", 6); poly(g, [[360, 560], [530, 480], [700, 560]], "#c84a3a", 6); g.fillStyle = "#c8b08a"; g.fillRect(0, 720, 1024, 304);
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 6; for (let i = 0; i < 8; i++) { g.beginPath(); for (let x = 0; x < 1024; x += 16) g.lineTo(x, 760 + i * 30 + Math.sin(x / 40 + k * 3 + i) * 6); g.stroke(); } }
  else if (kind === "shed") { g.fillStyle = "#2a3448"; g.fillRect(0, 0, 1024, 1024); for (let x = 0; x < 1024; x += 48) line(g, [[x, 0], [x, 1024]], "#344058", 14);
    R(g, 620, 160, 260, 180, 6, "#0e1830", 10); E(g, 720, 220, 40, 40, 0, "#f4f0d0", 0); for (let i = 0; i < 4; i++) E(g, 640 + hh(i, 5) * 220, 180 + hh(i, 6) * 140, 3, 3, 0, "#ffffff", 0); line(g, [[750, 160], [750, 340]], INK, 10); line(g, [[620, 250], [880, 250]], INK, 10);
    for (const [x, w, h] of [[40, 240, 260], [300, 180, 180], [760, 220, 340]]) { R(g, x, 1024 - h, w, h, 6, "#6a5030", 8); txt(g, "CARGO", x + w / 2, 1024 - h / 2, 40, "AlfaSlab", "rgba(20,20,30,0.6)", INK, 0, w - 30); }
    R(g, 320, 300, 240, 620, 4, "#3a4660", 10); R(g, 440, 300, 0, 620, 0, null, 8); line(g, [[440, 520], [440, 640]], "#c8c8d0", 12); }
  else if (kind === "outback") { sky(g, "#4aa8e8", "#bfe6ff", 640); E(g, 820, 160, 70, 70, 0, "#fff4a0", 0); for (const [x, y] of [[200, 180], [520, 120]]) { E(g, x, y, 90, 34, 0, "#ffffff", 0); E(g, x + 50, y - 20, 60, 36, 0, "#ffffff", 0); }
    g.fillStyle = "#c8643a"; g.fillRect(0, 640, 1024, 384); poly(g, [[0, 640], [180, 560], [340, 640]], "#a8502e", 0); poly(g, [[640, 640], [820, 590], [1024, 640]], "#a8502e", 0);
    poly(g, [[470, 640], [554, 640], [900, 1024], [124, 1024]], "#4a4a52", 0); for (let i = 0; i < 6; i++) { const u = (i + (k % 1)) / 6, y = 640 + u * u * 384, w = 4 + u * 20; R(g, 512 - w / 2, y, w, 10 + u * 50, 2, "#f0e8c0", 0); }
    for (let i = 0; i < 12; i++) E(g, hh(i, 3) * 1024, 680 + hh(i, 4) * 300, 26, 14, 0, "#6a8a3a", 4); }
  else if (kind === "crowd") { sky(g, "#6ab8f0", "#d0ecff", 600); for (let i = 0; i < 5; i++) { const x = i * 220 - 30, h = 420 + hh(i, 7) * 200; R(g, x, 760 - h, 210, h, 0, ["#e8d8b0", "#c8a07a", "#d8c0a0"][i % 3], 6); for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) R(g, x + 24 + c * 62, 790 - h + r * 80, 36, 48, 3, "#6a9ac8", 4); }
    for (let i = 0; i < 12; i++) { const x = i * 90, y = 300 + Math.sin(i * 0.9) * 30; poly(g, [[x, y], [x + 70, y], [x + 35, y + 60]], ["#c8202a", "#ffffff", "#2a4ac8", "#ffd23a"][i % 4], 4); } line(g, [[0, 300], [1024, 300]], INK, 4);
    g.fillStyle = "#8a8a90"; g.fillRect(0, 760, 1024, 264); }
}
export const FLOOR = { hold: "#4a5260", london: "#6a6a72", field: "#5a9a4a", agent: "#b89a6a", home: "#9a6a42", shop: "#7a5a3a", fog: "#a4a8ac", bombay: "#c8b08a", shed: "#2e3a50", outback: "#c8643a", crowd: "#8a8a90" };
export function drawFloor(g, col, kind) { g.clearRect(0, 0, 512, 512); g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  if (kind === "home" || kind === "shop" || kind === "agent") for (let y = 0; y < 512; y += 40) line(g, [[0, y], [512, y]], "rgba(0,0,0,0.12)", 3);
  if (kind === "fog" || kind === "bombay" || kind === "hold" || kind === "shed") for (let y = 0; y < 512; y += 128) { line(g, [[0, y], [512, y]], "rgba(255,255,255,0.12)", 4); } }

// ---- props
export function drawTicket(g) { g.clearRect(0, 0, 512, 256); R(g, 10, 30, 492, 196, 16, "#f4ecd0", 8); line(g, [[360, 40], [360, 216]], "rgba(0,0,0,0.4)", 4); txt(g, "AIR TICKET", 190, 90, 52, "AlfaSlab", "#2a4ac8", INK, 0); txt(g, "LONDON → PERTH", 190, 160, 34, "AlfaSlab", "#2a2a36", INK, 0, 300); E(g, 432, 128, 40, 40, 0, "#c8202a", 6); }
export function drawSeat(g) { g.clearRect(0, 0, 512, 512); R(g, 120, 40, 270, 300, 50, "#3a6ac8", 10); R(g, 150, 70, 210, 60, 20, "#e8e8f0", 6); R(g, 90, 320, 330, 110, 30, "#3460b8", 10); R(g, 70, 260, 50, 150, 16, "#5a5a64", 8); R(g, 390, 260, 50, 150, 16, "#5a5a64", 8); line(g, [[180, 430], [160, 500]], INK, 16); line(g, [[330, 430], [350, 500]], INK, 16); }
export function drawNo(g) { g.clearRect(0, 0, 512, 512); line(g, [[70, 70], [442, 442]], "#ffffff", 90); line(g, [[442, 70], [70, 442]], "#ffffff", 90); line(g, [[70, 70], [442, 442]], "#e8202a", 64); line(g, [[442, 70], [70, 442]], "#e8202a", 64); }
export function drawJav(g) { g.clearRect(0, 0, 1024, 64); line(g, [[40, 32], [960, 32]], INK, 18); line(g, [[40, 32], [960, 32]], "#e8e8f0", 10); poly(g, [[960, 20], [1016, 32], [960, 44]], "#9aa0aa", 4); R(g, 440, 22, 140, 20, 6, "#c8202a", 4); }
export function drawPockets(g, k) { g.clearRect(0, 0, 512, 256); for (const x of [120, 392]) { poly(g, [[x - 70, 40], [x + 70, 40], [x + 50, 200], [x - 50, 200]], "#f4f0e4", 8); }
  const m = k % 1; g.save(); g.translate(256 + Math.sin(m * 12) * 30, 160 - m * 140); g.globalAlpha = 1 - m * 0.6; E(g, -18, 0, 26, 16, -0.4, "#c8b8a0", 5); E(g, 18, 0, 26, 16, 0.4, "#c8b8a0", 5); E(g, 0, 4, 6, 18, 0, "#6a5a4a", 0); g.restore(); }
export function drawPrice(g) { g.clearRect(0, 0, 512, 512); g.save(); g.translate(256, 256); g.rotate(-0.15); poly(g, [[-200, -120], [140, -120], [220, 0], [140, 120], [-200, 120]], "#ffd23a", 12); E(g, 150, 0, 22, 22, 0, "#ffffff", 8); txt(g, "£££££", -40, 6, 120, "Bangers", "#c8202a", INK, 10, 300); g.restore(); }
export function drawCake(g) { g.clearRect(0, 0, 512, 512); R(g, 96, 260, 320, 180, 24, "#ffb0c8", 10); R(g, 96, 260, 320, 60, 24, "#ffffff", 8); for (let i = 0; i < 6; i++) E(g, 120 + i * 54, 330, 10, 14, 0, ["#ff4a6a", "#4ab0ff", "#ffd23a"][i % 3], 0);
  for (let i = 0; i < 3; i++) { const x = 196 + i * 60; R(g, x - 10, 170, 20, 92, 6, ["#4ab0ff", "#ffd23a", "#7ad04a"][i], 5); E(g, x, 150, 12, 22, 0, "#ffb43a", 4); E(g, x, 156, 5, 10, 0, "#fff4a0", 0); } R(g, 60, 430, 392, 30, 12, "#f0f0f4", 6); }
export function drawHammer(g) { g.clearRect(0, 0, 256, 256); line(g, [[128, 240], [128, 70]], INK, 26); line(g, [[128, 240], [128, 70]], "#c8935a", 16); R(g, 60, 30, 150, 60, 10, "#6a6e78", 8); }
export function drawTape(g, u) { g.clearRect(0, 0, 1024, 192); const w = 40 + u * 900; R(g, 30, 50, w, 90, 6, "#ffd23a", 7); for (let x = 50; x < 30 + w; x += 36) line(g, [[x, 52], [x, 52 + ((x / 36) % 4 ? 26 : 50)]], INK, 4); R(g, 0, 20, 110, 150, 24, "#c8202a", 9); E(g, 55, 95, 22, 22, 0, "#2a2a36", 6); }
export function drawCan(g) { g.clearRect(0, 0, 256, 256); R(g, 58, 40, 140, 190, 18, "#c8ccd4", 8); R(g, 58, 90, 140, 90, 0, "#e86a2a", 6); txt(g, "FOOD", 128, 136, 40, "AlfaSlab", "#ffffff", INK, 5); E(g, 128, 44, 70, 14, 0, "#e0e4ea", 6); }
export function drawBottle(g, full) { g.clearRect(0, 0, 128, 256); R(g, 44, 10, 40, 40, 6, full ? "#2a6ad8" : "#8a8a90", 5); poly(g, [[44, 50], [84, 50], [104, 100], [104, 236], [24, 236], [24, 100]], "rgba(220,240,255,0.55)", 6);
  if (full) { g.save(); g.beginPath(); g.rect(26, 120, 76, 114); g.clip(); g.fillStyle = "rgba(80,170,255,0.75)"; g.fillRect(24, 120, 80, 120); g.restore(); } E(g, 46, 150, 8, 40, 0, "rgba(255,255,255,0.6)", 0); }
export function drawClock(g, a) { g.clearRect(0, 0, 256, 256); E(g, 128, 128, 112, 112, 0, "#f4f0e4", 12); for (let i = 0; i < 12; i++) { const t = i / 12 * two; line(g, [[128 + Math.cos(t) * 88, 128 + Math.sin(t) * 88], [128 + Math.cos(t) * 100, 128 + Math.sin(t) * 100]], INK, 6); }
  line(g, [[128, 128], [128 + Math.cos(a / 12 - 1.57) * 56, 128 + Math.sin(a / 12 - 1.57) * 56]], INK, 12); line(g, [[128, 128], [128 + Math.cos(a - 1.57) * 84, 128 + Math.sin(a - 1.57) * 84]], "#c8202a", 7); E(g, 128, 128, 10, 10, 0, INK, 0); }
export function drawCal(g, s) { g.clearRect(0, 0, 384, 448); R(g, 20, 40, 344, 390, 18, "#ffffff", 10); R(g, 20, 40, 344, 110, 18, "#c8202a", 10); for (const x of [110, 274]) R(g, x - 12, 14, 24, 60, 8, "#5a5a64", 6); txt(g, "DAY", 192, 98, 70, "AlfaSlab", "#ffffff", INK, 0); txt(g, s, 192, 290, 220, "Bangers", "#2a2a36", INK, 0); }
// 1960s airliner side view (1024 x 384), nose right. o: lights, wheels, k
export function drawPlane(g, o = {}) { g.clearRect(0, 0, 1024, 384); g.lineJoin = "round";
  poly(g, [[120, 150], [60, 40], [130, 40], [230, 150]], "#c8ccd4", 8); poly(g, [[380, 210], [560, 330], [640, 330], [560, 210]], "#a8acb4", 8);
  g.beginPath(); g.moveTo(90, 160); g.lineTo(860, 150); g.quadraticCurveTo(1000, 160, 1010, 200); g.quadraticCurveTo(990, 236, 860, 240); g.lineTo(120, 240); g.quadraticCurveTo(70, 220, 90, 160); g.closePath(); g.fillStyle = "#f0f2f6"; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  g.fillStyle = "#2a5ad8"; g.fillRect(100, 196, 880, 16); for (let i = 0; i < 16; i++) E(g, 220 + i * 40, 178, 9, 11, 0, "#7ab8f0", 3); poly(g, [[930, 170], [985, 178], [990, 196], [935, 192]], "#3a4a6a", 4);
  for (const x of [470, 560]) { R(g, x, 250, 90, 34, 14, "#c8ccd4", 6); } if (o.wheels !== false) for (const x of [300, 880]) { line(g, [[x, 240], [x, 300]], INK, 10); E(g, x, 310, 22, 22, 0, "#2a2a36", 6); }
  if (o.lights) { E(g, 1000, 205, 10, 10, 0, (o.k ?? 0) % 2 ? "#ff3a3a" : "#ffffff", 3); } }
// route map (576 x 1024 screen card). u = progress along route 0..1 (London -> Paris -> Bombay -> Perth)
export const STOPS = [[250, 230], [262, 262], [390, 470], [500, 800]];
export function drawMap(g, u, o = {}) { g.clearRect(0, 0, 576, 1024); g.fillStyle = "#3a8ad0"; g.fillRect(0, 0, 576, 1024); for (let i = 0; i < 30; i++) line(g, [[hh(i, 1) * 576, hh(i, 2) * 1024], [hh(i, 1) * 576 + 40, hh(i, 2) * 1024]], "rgba(255,255,255,0.18)", 4);
  const land = "#8ac86a"; poly(g, [[180, 150], [320, 120], [360, 230], [300, 300], [200, 300], [190, 240]], land, 7); poly(g, [[200, 320], [330, 310], [370, 420], [330, 600], [260, 620], [220, 460]], land, 7);
  poly(g, [[340, 250], [520, 220], [570, 330], [470, 380], [430, 480], [390, 500], [360, 390]], land, 7); poly(g, [[420, 720], [540, 690], [576, 760], [576, 900], [470, 900], [420, 820]], land, 7); poly(g, [[200, 210], [230, 190], [240, 240], [215, 245]], land, 5);
  const segs = [], L = [0]; for (let i = 0; i < 3; i++) { const d = Math.hypot(STOPS[i + 1][0] - STOPS[i][0], STOPS[i + 1][1] - STOPS[i][1]); L.push(L[i] + d); } const tot = L[3], d = clamp(u) * tot;
  g.setLineDash([18, 16]); g.beginPath(); g.moveTo(...STOPS[0]); let px = STOPS[0][0], py = STOPS[0][1], ang = 0;
  for (let i = 0; i < 3; i++) { if (d <= L[i]) break; const f = Math.min(1, (d - L[i]) / (L[i + 1] - L[i])); px = STOPS[i][0] + (STOPS[i + 1][0] - STOPS[i][0]) * f; py = STOPS[i][1] + (STOPS[i + 1][1] - STOPS[i][1]) * f; ang = Math.atan2(STOPS[i + 1][1] - STOPS[i][1], STOPS[i + 1][0] - STOPS[i][0]); g.lineTo(px, py); }
  g.strokeStyle = "#ffffff"; g.lineWidth = 10; g.stroke(); g.setLineDash([]);
  const names = ["LONDON", "PARIS", "BOMBAY", "PERTH"], off = [[-100, -40], [-80, 40], [-110, 20], [-20, 70]];
  STOPS.forEach(([x, y], i) => { if (d + 1 >= L[i]) { E(g, x, y, 16, 16, 0, i === 3 ? "#ffd23a" : "#e8202a", 6); txt(g, names[i], x + off[i][0] + 50, y + off[i][1], 44, "Bangers", "#ffffff", INK, 9); } });
  g.save(); g.translate(px, py); g.rotate(ang); poly(g, [[34, 0], [-24, -12], [-14, 0], [-24, 12]], "#ffffff", 5); poly(g, [[6, 0], [-10, -34], [-18, -34], [-6, 0], [-18, 34], [-10, 34]], "#ffffff", 5); g.restore(); }
const clamp = (x) => Math.max(0, Math.min(1, x));
export function drawSun(g, k) { g.clearRect(0, 0, 512, 512); for (let i = 0; i < 14; i++) { const a = i / 14 * two + k * 0.3; poly(g, [[256 + Math.cos(a - 0.12) * 150, 256 + Math.sin(a - 0.12) * 150], [256 + Math.cos(a) * 240, 256 + Math.sin(a) * 240], [256 + Math.cos(a + 0.12) * 150, 256 + Math.sin(a + 0.12) * 150]], "#ff8a2a", 6); }
  E(g, 256, 256, 150, 150, 0, "#ffd23a", 10); line(g, [[190, 210], [240, 230]], INK, 12); line(g, [[322, 210], [272, 230]], INK, 12); E(g, 215, 250, 13, 13, 0, INK, 0); E(g, 297, 250, 13, 13, 0, INK, 0); g.beginPath(); g.arc(256, 330, 50, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); }
export function drawHeat(g, k) { g.clearRect(0, 0, 512, 512); g.strokeStyle = "rgba(255,240,200,0.55)"; g.lineWidth = 10; g.lineCap = "round"; for (let i = 0; i < 5; i++) { g.beginPath(); for (let y = 480; y > 40; y -= 12) g.lineTo(60 + i * 96 + Math.sin(y / 30 + k * 6 + i) * 16, y); g.stroke(); } }
export function drawPaper(g, u) { g.clearRect(0, 0, 768, 1024); R(g, 20, 20, 728, 984, 6, "#f4f0e4", 10); txt(g, "THE DAILY NEWS", 384, 100, 80, "AlfaSlab", "#1a1a24", INK, 0, 680); line(g, [[50, 160], [718, 160]], INK, 6); line(g, [[50, 172], [718, 172]], INK, 3);
  txt(g, "MAN POSTS", 384, 270, 120, "AlfaSlab", "#1a1a24", INK, 0, 680); txt(g, "HIMSELF HOME!", 384, 390, 110, "AlfaSlab", "#c8202a", INK, 0, 680);
  R(g, 60, 460, 330, 300, 4, "#d8d0bc", 6); g.save(); g.translate(225, 640); R(g, -120, -90, 240, 150, 6, "#b9824a", 6); E(g, 0, -100, 46, 50, 0, "#e8c8a8", 6); E(g, -16, -106, 6, 8, 0, INK, 0); E(g, 16, -106, 6, 8, 0, INK, 0); g.restore();
  for (let i = 0; i < 12; i++) R(g, 420, 470 + i * 26, 280 - (i % 3) * 30, 10, 3, "rgba(30,30,40,0.35)", 0); for (let i = 0; i < 7; i++) R(g, 60, 790 + i * 28, 640 - (i % 2) * 80, 10, 3, "rgba(30,30,40,0.35)", 0); }
export function drawRoo(g, o = {}) { g.clearRect(0, 0, 512, 512); g.lineJoin = "round"; const c = "#b8743e";
  g.beginPath(); g.moveTo(170, 430); g.quadraticCurveTo(40, 470, 20, 500); g.lineWidth = 34; g.strokeStyle = INK; g.stroke(); g.lineWidth = 22; g.strokeStyle = c; g.stroke();
  E(g, 230, 330, 100, 130, -0.3, c, 9); E(g, 300, 410, 80, 60, 0, c, 9); R(g, 290, 440, 150, 36, 18, c, 8); E(g, 290, 170, 60, 52, 0.3, c, 9); poly(g, [[320, 150], [400, 175], [330, 205]], c, 8); E(g, 400, 176, 10, 10, 0, INK, 0);
  poly(g, [[262, 130], [250, 40], [292, 118]], c, 8); poly(g, [[300, 128], [310, 44], [326, 132]], c, 8); E(g, 305, 160, 12, 14, 0, "#ffffff", 4); E(g, 309, 162, 6, 7, 0, INK, 0);
  line(g, [[280, 270], [340, 300], [360, 280]], INK, 16); line(g, [[280, 270], [340, 300], [360, 280]], c, 9); E(g, 240, 360, 40, 46, 0, "#d89860", 5); if (o.shock) txt(g, "?!", 420, 70, 90, "Bangers", "#ffe85a", INK, 10); }
export function drawSign(g, s, col = "#2f7a48") { g.clearRect(0, 0, 512, 512); line(g, [[256, 280], [256, 510]], INK, 26); line(g, [[256, 280], [256, 510]], "#9aa0aa", 16); poly(g, [[30, 90], [420, 90], [490, 190], [420, 290], [30, 290]], col, 10); txt(g, s, 230, 192, 110, "AlfaSlab", "#ffffff", INK, 0, 360); }
export function drawFlash(g) { g.clearRect(0, 0, 256, 256); const gr = g.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,230,0.8)"); gr.addColorStop(1, "rgba(255,255,220,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
export function drawPhoneCam(g) { g.clearRect(0, 0, 256, 256); R(g, 40, 90, 170, 110, 14, "#2a2a36", 8); E(g, 130, 146, 38, 38, 0, "#6a8ac8", 8); R(g, 70, 40, 70, 54, 6, "#c8ccd4", 6); E(g, 105, 66, 28, 22, 0, "#ffffff", 4); }
export function drawBoard(g) { g.clearRect(0, 0, 768, 576); R(g, 10, 10, 748, 556, 16, "#2a2a36", 12); txt(g, "FLIGHTS", 384, 80, 76, "AlfaSlab", "#ffd23a", INK, 0);
  ["PARIS", "ROME", "BOMBAY", "PERTH"].forEach((s, i) => { txt(g, s, 250, 180 + i * 100, 60, "AlfaSlab", "#f0f0f0", INK, 0); txt(g, ["££", "££", "£££", "££££"][i], 580, 180 + i * 100, 60, "AlfaSlab", "#ff6a5a", INK, 0); }); }
