// Canvas drawings for "They Let the Internet Name a Ship" (Boaty McBoatface, 2016; Trainy McTrainface, 2017).
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

export function drawFlash(g) { g.clearRect(0, 0, 256, 256); const gr = g.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,230,0.8)"); gr.addColorStop(1, "rgba(255,255,220,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
const sky = (g, a, b, h = 1024, y0 = 0) => { const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, y0, 1024, h); };

// ---- walls (1024 x 1024 = 14 x 14 m card, centre 7 m up; eye level = rows ~880-940, a normal shot sees rows ~700-1024)
export function drawWall(g, kind, k = 0) {
  g.clearRect(0, 0, 1024, 1024); g.lineJoin = "round";
  if (kind === "dock") { sky(g, "#3a8ad8", "#cfeeff", 940); E(g, 840, 700, 60, 60, 0, "#fff6b0", 0);
    for (let i = 0; i < 5; i++) { const x = 60 + i * 230 + hh(i, 2) * 60; poly(g, [[x - 120, 930], [x - 30, 860 - hh(i, 4) * 50], [x + 40, 880], [x + 130, 930]], "#f4fbff", 5, "#7aa0c0"); poly(g, [[x - 30, 862 - hh(i, 4) * 50], [x + 10, 930], [x + 40, 880]], "#cfe4f4", 0); }
    for (let i = 0; i < 6; i++) { const x = ((i * 190 + k * 30) % 1150) - 60, y = 720 + (i % 3) * 50; E(g, x, y, 70, 22, 0, "rgba(255,255,255,0.85)", 0); E(g, x + 40, y - 14, 44, 22, 0, "rgba(255,255,255,0.85)", 0); }
    g.fillStyle = "#2a6ab0"; g.fillRect(0, 930, 1024, 94); for (let i = 0; i < 30; i++) line(g, [[hh(i, 1) * 1024, 950 + hh(i, 2) * 70], [hh(i, 1) * 1024 + 40, 950 + hh(i, 2) * 70]], "rgba(255,255,255,0.5)", 4); }
  else if (kind === "lab") { g.fillStyle = "#dfeef4"; g.fillRect(0, 0, 1024, 1024); for (let x = 0; x < 1024; x += 128) R(g, x, 0, 64, 1024, 0, "rgba(255,255,255,0.35)", 0); g.fillStyle = "#8aa8b8"; g.fillRect(0, 980, 1024, 44);
    R(g, 330, 760, 360, 200, 10, "#c8dce6", 8); for (let i = 0; i < 4; i++) R(g, 350 + i * 85, 790, 60, 140, 8, ["#7ad0ff", "#ff9ad0", "#a0f08a", "#ffe07a"][i], 4);
    R(g, 40, 640, 220, 300, 8, "#4a5a6a", 8); for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const x = 70 + i * 48, y = 680 + r * 90; R(g, x, y, 26, 60, 10, ["#7ad0ff", "#ff9ad0", "#a0f08a", "#ffe07a"][(i + r) % 4], 4); }
    R(g, 760, 620, 220, 160, 8, "#1a3050", 8); for (let i = 0; i < 6; i++) line(g, [[780, 740 - i * 14 - hh(i, 3) * 30], [960, 740 - i * 10]], i % 2 ? "#7ad0ff" : "#ffd23a", 3); txt(g, "OCEAN DATA", 870, 650, 26, "Poppins", "#ffffff", INK, 0, 190); }
  else if (kind === "studio") { g.fillStyle = "#2a2440"; g.fillRect(0, 0, 1024, 1024); for (let y = 0; y < 1024; y += 64) for (let x = (y / 64) % 2 ? 0 : 32; x < 1024; x += 64) poly(g, [[x, y], [x + 32, y + 32], [x, y + 64], [x - 32, y + 32]], (x + y) % 128 ? "#342c52" : "#2e2848", 0);
    for (const x of [130, 894]) { R(g, x - 70, 780, 140, 220, 16, "#1a1a26", 8); E(g, x, 850, 44, 44, 0, "#3a3a4a", 8); E(g, x, 850, 18, 18, 0, "#6a6a7a", 0); E(g, x, 950, 30, 30, 0, "#3a3a4a", 6); } }
  else if (kind === "net") { g.fillStyle = "#1a1030"; g.fillRect(0, 0, 1024, 1024);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) { const x = 20 + c * 168, y = 560 + r * 78, i = r * 6 + c, ph = (k * 3 + hh(i, 5)) % 1; R(g, x, y, 150, 66, 8, ["#ff4a8a", "#4ab0ff", "#ffd23a", "#7ad04a", "#b06aff"][i % 5], 5, "#0a0614");
      if (ph < 0.5) { E(g, x + 40, y + 33, 20, 20, 0, "#ffd23a", 4); E(g, x + 33, y + 28, 3, 4, 0, INK, 0); E(g, x + 47, y + 28, 3, 4, 0, INK, 0); g.beginPath(); g.arc(x + 40, y + 36, 10, 0.1, Math.PI - 0.1); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
      txt(g, ["LOL", "VOTE!", "BOATY", "WOW", "+1"][((i + Math.floor(k * 2)) % 5) === 3 ? 0 : (i + Math.floor(k * 2)) % 5], x + 105, y + 34, 30, "Bangers", "#ffffff", INK, 5, 80); } }
  else if (kind === "gov") { g.fillStyle = "#1c2c5a"; g.fillRect(0, 0, 1024, 1024); for (let r = 0; r < 8; r++) for (let c = 0; c < 5; c++) { const x = 100 + c * 210 + (r % 2) * 105, y = 520 + r * 66; E(g, x, y, 22, 8, 0, null, 4, "#5a7ad8"); E(g, x, y, 22, 8, 1.05, null, 4, "#5a7ad8"); E(g, x, y, 22, 8, -1.05, null, 4, "#5a7ad8"); E(g, x, y, 5, 5, 0, "#8ab0ff", 0); txt(g, "SCIENCE", x + 70, y, 24, "AlfaSlab", "#3a5ab0", INK, 0, 110); } }
  else if (kind === "deep") { sky(g, "#2a9ad8", "#04142e", 1024); for (let i = 0; i < 7; i++) { const x = 80 + i * 150 + Math.sin(k + i) * 20; g.fillStyle = "rgba(200,240,255,0.08)"; g.beginPath(); g.moveTo(x - 30, 0); g.lineTo(x + 30, 0); g.lineTo(x + 140, 1024); g.lineTo(x + 20, 1024); g.closePath(); g.fill(); }
    g.beginPath(); g.moveTo(0, 0); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, 540 + hh(x, 7) * 80); g.lineTo(1024, 0); g.closePath(); g.fillStyle = "#e8f6ff"; g.fill(); g.strokeStyle = "#8ac0e0"; g.lineWidth = 8; g.stroke();
    for (let i = 0; i < 9; i++) { const x = ((i * 137 + k * 40 * (1 + (i % 3))) % 1150) - 60, y = 720 + (i % 5) * 50; poly(g, [[x, y], [x + 34, y - 14], [x + 34, y + 14]], "rgba(120,200,240,0.5)", 0); E(g, x + 50, y, 22, 12, 0, "rgba(120,200,240,0.5)", 0); }
    for (let i = 0; i < 6; i++) { const x = 60 + i * 180; poly(g, [[x - 90, 1024], [x - 20, 900 - hh(i, 9) * 60], [x + 60, 950], [x + 100, 1024]], "#0a2448", 0); } }
  else if (kind === "station") { g.fillStyle = "#e8e4dc"; g.fillRect(0, 0, 1024, 1024); for (let x = 0; x < 1024; x += 256) R(g, x + 100, 0, 56, 1024, 0, "#c8c4bc", 0);
    R(g, 120, 640, 300, 120, 10, "#1a3a8a", 8); txt(g, "PLATFORM 1", 270, 700, 54, "AlfaSlab", "#ffffff", INK, 0, 270);
    R(g, 560, 610, 210, 130, 4, "#2a6ad0", 6); g.fillStyle = "#ffd23a"; g.fillRect(620, 610, 30, 130); g.fillRect(560, 662, 210, 26);
    E(g, 880, 680, 70, 70, 0, "#ffffff", 10); const a = k * 0.5; line(g, [[880, 680], [880 + Math.sin(a) * 36, 680 - Math.cos(a) * 36]], INK, 7); line(g, [[880, 680], [880 + Math.sin(a * 12) * 52, 680 - Math.cos(a * 12) * 52]], INK, 4);
    g.fillStyle = "#6a6a72"; g.fillRect(0, 880, 1024, 144); for (let x = 0; x < 1024; x += 60) R(g, x, 990, 40, 16, 2, "#4a3a2a", 0); line(g, [[0, 970], [1024, 970]], "#b8bcc8", 8); line(g, [[0, 1010], [1024, 1010]], "#b8bcc8", 8); }
  else if (kind === "drama") { g.fillStyle = "#1a0c14"; g.fillRect(0, 0, 1024, 1024); const pulse = 0.5 + 0.5 * Math.sin(k * 6);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * two + k * 0.4; g.fillStyle = i % 2 ? `rgba(200,30,40,${0.35 + 0.2 * pulse})` : "rgba(60,10,20,0.6)"; g.beginPath(); g.moveTo(512, 820); g.arc(512, 820, 1400, a, a + two / 14); g.closePath(); g.fill(); }
    const gr = g.createRadialGradient(512, 820, 20, 512, 820, 400); gr.addColorStop(0, "rgba(255,120,90,0.6)"); gr.addColorStop(1, "rgba(255,60,40,0)"); g.fillStyle = gr; g.fillRect(0, 400, 1024, 624); }
}
export const FLOOR = { dock: "#9a9aa2", lab: "#c8d4dc", studio: "#3a3448", net: "#241a3a", gov: "#3a2a2a", deep: "#0a2040", station: "#a8a4a0", drama: "#2a1018" };
export function drawFloor(g, col, kind) { g.clearRect(0, 0, 512, 512); g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  if (kind === "dock") { for (let y = 0; y < 512; y += 64) line(g, [[0, y], [512, y]], "rgba(0,0,0,0.12)", 3); for (let x = 0; x < 512; x += 128) line(g, [[x, 0], [x, 512]], "rgba(0,0,0,0.08)", 3); }
  if (kind === "lab" || kind === "station") for (let y = 0; y < 512; y += 64) for (let x = (y / 64) % 2 ? 0 : 64; x < 512; x += 128) { g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(x, y, 64, 64); }
  if (kind === "gov") for (let y = 0; y < 512; y += 40) line(g, [[0, y], [512, y]], "rgba(0,0,0,0.14)", 3);
  if (kind === "deep") for (let i = 0; i < 60; i++) E(g, hh(i, 1) * 512, hh(i, 2) * 512, 10, 5, 0, "rgba(120,160,200,0.15)", 0); }
export function drawWater(g, k = 0) { g.clearRect(0, 0, 512, 512); g.fillStyle = "#2a6ab0"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 40; i++) { const x = (hh(i, 1) * 512 + k * 20 * (i % 3 + 1)) % 560 - 24, y = hh(i, 2) * 512; line(g, [[x, y], [x + 30, y]], "rgba(255,255,255,0.45)", 4); } }

// ---- props
const NAMEF = (g, s, x, y, size, maxW, col = "#ffffff") => txt(g, s, x, y, size, "AlfaSlab", col, INK, 0, maxW);
// polar research ship, side view facing right, 1024 x 512 (card 2:1); hull red, white superstructure, name on the hull
export function drawShip(g, name = "", o = {}) { g.clearRect(0, 0, 1024, 512); g.lineJoin = "round";
  // superstructure
  R(g, 330, 120, 330, 170, 10, "#ffffff", 9); R(g, 380, 60, 220, 80, 10, "#ffffff", 9); for (let i = 0; i < 6; i++) R(g, 350 + i * 50, 160, 34, 30, 4, "#2a4a6a", 4); for (let i = 0; i < 4; i++) R(g, 400 + i * 48, 82, 34, 26, 4, "#2a4a6a", 4);
  R(g, 470, 10, 16, 60, 4, "#e8e8ee", 5); line(g, [[440, 30], [520, 30]], INK, 5); R(g, 690, 170, 30, 120, 4, "#e8c040", 6); line(g, [[705, 170], [820, 60]], "#e8c040", 12); line(g, [[705, 170], [820, 60]], INK, 3);
  R(g, 170, 200, 110, 90, 6, "#ffffff", 8); R(g, 200, 150, 40, 60, 6, "#c8202a", 7);
  // hull
  g.beginPath(); g.moveTo(40, 280); g.lineTo(1000, 260); g.quadraticCurveTo(960, 420, 860, 500); g.lineTo(110, 500); g.quadraticCurveTo(60, 420, 40, 280); g.closePath(); g.fillStyle = "#d42a2a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke();
  g.fillStyle = "#ffffff"; g.fillRect(52, 284, 940, 14); line(g, [[60, 470], [900, 470]], "rgba(0,0,0,0.25)", 10);
  for (let i = 0; i < 9; i++) E(g, 150 + i * 80, 312, 9, 9, 0, "#ffe8a0", 4);
  if (name) { const L = name.split("|"); if (L.length > 1) { NAMEF(g, L[0], 500, 352, o.size ?? 70, 600, o.col ?? "#ffffff"); NAMEF(g, L[1], 500, 428, o.size ?? 70, 600, o.col ?? "#ffffff"); } else NAMEF(g, name, 510, 402, o.size ?? 74, 700, o.col ?? "#ffffff"); }
  if (o.face) { E(g, 940, 330, 26, 30, 0, "#ffffff", 6); E(g, 944, 334, 11, 13, 0, INK, 0); line(g, [[900, 300], [960, 290]], INK, 7); }
  if (o.ice) for (let i = 0; i < 14; i++) E(g, 80 + hh(i, 3) * 860, 260 + hh(i, 4) * 30, 20, 9, 0, "#f4fbff", 4, "#8ab0d0");
}
// name board hanging from two crane ropes (rope tops at the card's top), 1024 x 512; board in the lower half
export function drawBoard(g, s, col = "#c8202a", bg = "#ffffff") { g.clearRect(0, 0, 1024, 512); line(g, [[512, 0], [200, 300]], INK, 8); line(g, [[512, 0], [824, 300]], INK, 8); E(g, 512, 10, 18, 18, 0, "#e8c040", 6);
  R(g, 40, 290, 944, 200, 22, bg, 12); R(g, 64, 312, 896, 156, 14, null, 6, col); txt(g, s, 512, 392, 120, "Bangers", col, INK, 8, 860); }
export function drawSub(g, o = {}) { g.clearRect(0, 0, 1024, 384); g.lineJoin = "round";
  // tail fins + propeller (left)
  poly(g, [[150, 190], [60, 80], [110, 80], [220, 170]], "#f0b020", 8); poly(g, [[150, 194], [60, 304], [110, 304], [220, 214]], "#f0b020", 8);
  const p = o.prop ?? 0; for (let i = 0; i < 3; i++) { const a = p + (i / 3) * two; E(g, 70 + Math.cos(a) * 6, 192 + Math.sin(a) * 40, 14, 44, 0, "#8a8a92", 6); }
  g.beginPath(); g.moveTo(120, 192); g.bezierCurveTo(180, 90, 300, 70, 520, 70); g.lineTo(820, 70); g.bezierCurveTo(1000, 70, 1010, 314, 820, 314); g.lineTo(520, 314); g.bezierCurveTo(300, 314, 180, 294, 120, 192); g.closePath(); g.fillStyle = "#ffd21a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke();
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(620, 110, 300, 20, 0, 0, two); g.fill(); line(g, [[300, 240], [880, 240]], "rgba(0,0,0,0.15)", 14);
  R(g, 560, 30, 120, 50, 10, "#f0b020", 7); line(g, [[620, 30], [620, 0]], INK, 6); E(g, 620, 4, 8, 8, 0, o.blink ? "#ff3a3a" : "#7a2a2a", 3);
  txt(g, o.name ?? "BOATY", 520, 200, 92, "Bangers", "#1a2a6a", INK, 0, 380);
  if (o.eyes) { for (const x of [860, 935]) { E(g, x, 160, 30, 34, 0, "#ffffff", 6); E(g, x + 8 + (o.look ?? 0) * 6, 164, 13, 15, 0, INK, 0); E(g, x + 12, 156, 4, 4, 0, "#ffffff", 0); } g.beginPath(); g.arc(900, 220, 34, 0.25, Math.PI - 0.25); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); }
  else { E(g, 920, 190, 36, 36, 0, "#bfe8ff", 8); }
  if (o.light) { const gr = g.createRadialGradient(1000, 190, 4, 1000, 190, 90); gr.addColorStop(0, "rgba(255,255,220,0.95)"); gr.addColorStop(1, "rgba(255,255,200,0)"); g.fillStyle = gr; g.fillRect(900, 90, 124, 200); } }
export function drawBars(g, k = 1) { g.clearRect(0, 0, 768, 768); R(g, 10, 10, 748, 748, 30, "#ffffff", 12); txt(g, "VOTES", 384, 70, 64, "Bangers", "#2a2a36", INK, 0, 600); line(g, [[70, 640], [700, 640]], INK, 8);
  const h1 = 480 * Math.min(1, k), h2 = 133 * Math.min(1, k); R(g, 110, 640 - h1, 220, h1, 10, "#ffd21a", 8); R(g, 440, 640 - h2, 220, h2, 10, "#9aa0b0", 8);
  txt(g, String(Math.round(124109 * Math.min(1, k)).toLocaleString("en-US")), 220, 620 - h1, 52, "Bangers", "#c8202a", INK, 6, 220); txt(g, k > 0.98 ? "34,371" : "", 550, 610 - h2, 46, "Bangers", "#3a3a48", INK, 0, 220);
  txt(g, "BOATY", 220, 690, 54, "Bangers", "#1a2a6a", INK, 0, 220); txt(g, "2ND", 550, 690, 54, "Bangers", "#5a5a6a", INK, 0, 220); }
export function drawCounter(g, n) { g.clearRect(0, 0, 1024, 512); R(g, 20, 40, 984, 432, 40, "#1a1030", 14); R(g, 50, 70, 924, 372, 28, "#2a1a50", 0); txt(g, "BOATY McBOATFACE", 512, 140, 74, "Bangers", "#ffd21a", INK, 0, 860);
  txt(g, Math.round(n).toLocaleString("en-US"), 512, 290, 190, "Bangers", "#ffffff", "#ff2a6a", 14, 880); txt(g, "VOTES", 512, 405, 60, "Bangers", "#7ad0ff", INK, 0, 400); }
export function drawList(g, hi = -1) { g.clearRect(0, 0, 768, 1024); R(g, 14, 14, 740, 996, 30, "#2a2a36", 12); R(g, 44, 70, 680, 880, 14, "#ffffff", 0); txt(g, "OTHER ENTRIES", 384, 44, 40, "Poppins", "#ffffff", INK, 0, 600);
  const L = ["Usain Boat", "It's Bloody Cold Here", "What Iceberg?", "I Like Big Boats & I Cannot Lie"]; L.forEach((s, i) => { const y = 170 + i * 200; R(g, 70, y - 70, 628, 150, 14, i === hi ? "#ffd21a" : "#eef2f8", 6); txt(g, "RRS " + s, 384, y + 4, 56, "AlfaSlab", "#2a2a48", INK, 0, 580); }); }
export function drawDesk(g) { g.clearRect(0, 0, 1024, 512); R(g, 10, 200, 1004, 70, 10, "#5a4a7a", 10); R(g, 40, 270, 944, 230, 8, "#3a3050", 10);
  line(g, [[512, 200], [512, 120]], "#8a8a92", 16); line(g, [[512, 200], [512, 120]], INK, 4); R(g, 470, 10, 84, 130, 40, "#4a4a56", 9); for (let i = 0; i < 5; i++) line(g, [[482, 40 + i * 20], [542, 40 + i * 20]], "#8a8a9a", 4);
  R(g, 140, 140, 220, 66, 8, "#2a2a36", 8); for (let i = 0; i < 5; i++) R(g, 160 + i * 38, 160, 22, 30, 4, ["#ff4a4a", "#ffd21a", "#7ad04a", "#4ab0ff", "#ffffff"][i], 3); R(g, 680, 110, 200, 96, 8, "#c8ccd4", 8); R(g, 694, 122, 172, 70, 4, "#4ab0ff", 0); }
export function drawPodium(g, s = "SCIENCE") { g.clearRect(0, 0, 512, 640); poly(g, [[60, 60], [452, 60], [410, 630], [102, 630]], "#6a4a32", 10); R(g, 30, 30, 452, 60, 10, "#7a5638", 10); E(g, 256, 260, 90, 90, 0, "#c8a040", 8); E(g, 256, 260, 64, 64, 0, "#1c2c5a", 6);
  for (const a of [0, 1.05, -1.05]) E(g, 256, 260, 50, 16, a, null, 6, "#ffd23a"); txt(g, s, 256, 430, 60, "AlfaSlab", "#ffd23a", INK, 0, 360); line(g, [[200, 30], [170, -10]], INK, 6); }
export function drawTrain(g, name = "", o = {}) { g.clearRect(0, 0, 1024, 384); g.lineJoin = "round";
  g.beginPath(); g.moveTo(20, 60); g.lineTo(760, 60); g.bezierCurveTo(940, 60, 1010, 200, 1010, 300); g.lineTo(20, 300); g.closePath(); g.fillStyle = "#f4f4f6"; g.fill(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke();
  g.fillStyle = "#2a3a8a"; g.fillRect(24, 240, 980, 30); g.fillStyle = "#ffd21a"; g.fillRect(24, 270, 980, 12); for (let i = 0; i < 8; i++) R(g, 50 + i * 88, 90, 64, 56, 8, "#2a4a6a", 5);
  poly(g, [[820, 80], [930, 140], [960, 200], [840, 200]], "#2a4a6a", 6); for (const x of [120, 300, 640, 820]) { E(g, x, 312, 34, 34, 0, "#3a3a44", 8); E(g, x, 312, 10, 10, 0, "#b8bcc8", 0); }
  if (name) { R(g, 60, 158, 700, 74, 10, "#ffffff", 0); txt(g, name, 410, 198, 66, "Bangers", o.col ?? "#c8202a", INK, 0, 680); }
  if (o.face) { E(g, 900, 170, 20, 24, 0, "#ffffff", 5); E(g, 904, 174, 9, 11, 0, INK, 0); g.beginPath(); g.arc(940, 230, 26, 0.2, Math.PI - 0.6); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); } }
export function drawPhone(g, k = 0) { g.clearRect(0, 0, 256, 384); R(g, 40, 20, 176, 344, 26, "#2a2a36", 9); R(g, 56, 50, 144, 280, 10, "#ffffff", 0); txt(g, "VOTE", 128, 100, 40, "Bangers", "#2a5ad8", INK, 0, 130);
  R(g, 70, 140, 116, 70, 12, k % 1 < 0.5 ? "#ffd21a" : "#7ad04a", 5); txt(g, "BOATY!", 128, 176, 38, "Bangers", "#1a2a6a", INK, 0, 110); for (let i = 0; i < 3; i++) R(g, 70, 230 + i * 30, 116, 18, 6, "#e0e4ee", 0); }
export function drawLaptop(g, s = "BOATY!", k = 0) { g.clearRect(0, 0, 512, 384); R(g, 70, 20, 372, 250, 16, "#2a2a36", 9); R(g, 90, 40, 332, 210, 6, k % 1 < 0.5 ? "#4ab0ff" : "#ff4a8a", 0); txt(g, s, 256, 145, 80, "Bangers", "#ffffff", INK, 8, 300);
  poly(g, [[30, 290], [482, 290], [450, 360], [62, 360]], "#c8ccd4", 9); }
export function drawSnow(g, k = 0) { g.clearRect(0, 0, 512, 512); for (let i = 0; i < 40; i++) { const x = (hh(i, 1) * 512 + Math.sin(k * 3 + i) * 12), y = (hh(i, 2) * 512 + k * 120 * (0.6 + hh(i, 3))) % 520 - 4; E(g, x, y, 6 + hh(i, 4) * 6, 6 + hh(i, 4) * 6, 0, "#ffffff", 0); } }
export function drawBubbles(g, k = 0) { g.clearRect(0, 0, 256, 512); for (let i = 0; i < 12; i++) { const ph = (k * (0.6 + hh(i, 1) * 0.6) + hh(i, 2)) % 1, x = 40 + hh(i, 3) * 176 + Math.sin(ph * 12 + i) * 14, y = 500 - ph * 500, r = 6 + hh(i, 4) * 14; E(g, x, y, r, r, 0, "rgba(220,245,255,0.25)", 3, "rgba(240,252,255,0.9)"); } }
export function drawSplash(g, k = 0) { g.clearRect(0, 0, 512, 256); for (let i = 0; i < 14; i++) { const a = Math.PI * (0.1 + 0.8 * hh(i, 1)), r = 60 + k * 200 * (0.5 + hh(i, 2)), x = 256 + Math.cos(a) * r, y = 240 - Math.sin(a) * r * 0.9 + k * k * 120; E(g, x, y, 12 * (1 - k * 0.5), 16 * (1 - k * 0.5), 0, "#e8f6ff", 4, "#4a8ac8"); } E(g, 256, 236, 180 + k * 60, 22, 0, "rgba(240,250,255,0.8)", 0); }
export function drawPenguin(g, k = 0) { g.clearRect(0, 0, 256, 384); E(g, 128, 220, 80, 130, 0, "#1a1a26", 8); E(g, 128, 240, 54, 100, 0, "#ffffff", 0); E(g, 128, 110, 62, 58, 0, "#1a1a26", 8);
  for (const x of [104, 152]) { E(g, x, 104, 14, 16, 0, "#ffffff", 0); E(g, x + 2, 108, 7, 8, 0, INK, 0); } poly(g, [[112, 130], [144, 130], [128, 160]], "#ffa020", 5); const w = Math.sin(k * 10) * 0.5; for (const s of [-1, 1]) { g.save(); g.translate(128 + s * 72, 190); g.rotate(s * (0.3 + w)); E(g, s * 10, 50, 18, 60, 0, "#1a1a26", 6); g.restore(); } for (const x of [100, 156]) E(g, x, 352, 26, 12, 0, "#ffa020", 5); }
export function drawCash(g) { g.clearRect(0, 0, 256, 128); R(g, 8, 12, 240, 104, 10, "#8ad08a", 8); E(g, 128, 64, 34, 34, 0, "#c8ecc0", 5); txt(g, "£", 128, 66, 54, "AlfaSlab", "#1a5a2a", INK, 0); }
export function drawBulb(g) { g.clearRect(0, 0, 256, 320); const gr = g.createRadialGradient(128, 120, 10, 128, 120, 128); gr.addColorStop(0, "rgba(255,250,180,0.95)"); gr.addColorStop(1, "rgba(255,240,120,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  E(g, 128, 120, 70, 76, 0, "#fff6a0", 8); R(g, 96, 190, 64, 60, 8, "#b8bcc8", 7); line(g, [[106, 130], [128, 100], [150, 130]], "#e8a020", 6); }
// eye-level cards that stand in front of the walls
export function drawPoster(g) { g.clearRect(0, 0, 768, 512); R(g, 14, 14, 740, 484, 20, "#ffffff", 12); txt(g, "NAME OUR", 384, 120, 110, "Bangers", "#c8202a", INK, 0, 640); txt(g, "SHIP!", 384, 260, 170, "Bangers", "#2a5ad8", INK, 10, 640);
  txt(g, "VOTE ONLINE", 384, 400, 64, "Poppins", "#3a3a48", INK, 0, 600); poly(g, [[600, 330], [700, 300], [690, 420]], "#ffd21a", 6); }
export function drawOnAir(g, on = true) { g.clearRect(0, 0, 512, 256); if (on) { const gr = g.createRadialGradient(256, 128, 10, 256, 128, 250); gr.addColorStop(0, "rgba(255,60,60,0.55)"); gr.addColorStop(1, "rgba(255,40,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); }
  R(g, 60, 50, 392, 156, 22, on ? "#ff2a3a" : "#7a1a22", 10); txt(g, "ON AIR", 256, 132, 110, "Bangers", on ? "#ffffff" : "#d88a90", INK, 0, 340); }
export function drawScreens(g, k = 0) { g.clearRect(0, 0, 1024, 512); g.fillStyle = "#0a0614"; g.fillRect(0, 0, 1024, 512);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = 12 + c * 168, y = 12 + r * 124, i = r * 6 + c, ph = (k * 3 + hh(i, 5)) % 1; R(g, x, y, 156, 112, 10, ["#ff4a8a", "#4ab0ff", "#ffd23a", "#7ad04a", "#b06aff"][(i + Math.floor(k * 4)) % 5], 5, "#000");
    if (ph < 0.5) { E(g, x + 42, y + 56, 26, 26, 0, "#ffd23a", 4); E(g, x + 33, y + 49, 4, 5, 0, INK, 0); E(g, x + 51, y + 49, 4, 5, 0, INK, 0); g.beginPath(); g.arc(x + 42, y + 58, 14, 0.1, Math.PI - 0.1); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
    txt(g, ["LOL", "VOTE!", "BOATY", "+1", "WOW"][(i + Math.floor(k * 2)) % 5], x + 110, y + 56, 34, "Bangers", "#ffffff", INK, 6, 80); } }
