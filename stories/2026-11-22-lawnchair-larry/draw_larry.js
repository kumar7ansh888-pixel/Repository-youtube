// Canvas drawings for "This Man Flew a Lawn Chair to 16,000 Feet" (Lawnchair Larry, 1982).
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
const tube = (g, pts, lw = 20) => { line(g, pts, INK, lw + 10); line(g, pts, "#c9ced6", lw); line(g, pts, "rgba(255,255,255,0.7)", lw * 0.3); };

// ---- the aluminium lawn chair, front 3/4 view (768 x 768). Seat top at y 470. o: jugs (0..8 water jugs on the armrests), rope (0..1 tied rope going down, 2 = snapped end), strings (balloon strings up to the top centre), tilt
export function drawChair(g, o = {}) {
  if (!o.keep) g.clearRect(0, 0, 768, 768); g.lineJoin = "round"; g.lineCap = "round";
  const web = ["#3a9a5a", "#f4f0e4"];
  if (o.strings !== false) for (const [x, y, tx] of [[214, 130, 40], [554, 130, 728], [150, 400, 40], [618, 400, 728]]) line(g, [[x, y], [tx, 0]], "rgba(40,40,50,0.85)", 4);
  // back legs
  tube(g, [[226, 470], [190, 740]], 16); tube(g, [[542, 470], [578, 740]], 16);
  // backrest frame + webbing
  R(g, 214, 120, 340, 360, 30, null, 0);
  for (let i = 0; i < 7; i++) R(g, 222, 140 + i * 47, 324, 36, 6, web[i % 2], 5);
  for (let i = 0; i < 5; i++) R(g, 236 + i * 64, 132, 36, 340, 6, i % 2 ? "rgba(58,154,90,0.55)" : "rgba(244,240,228,0.55)", 0);
  tube(g, [[214, 480], [214, 130], [554, 130], [554, 480]], 22);
  // seat
  poly(g, [[196, 470], [572, 470], [612, 540], [156, 540]], web[1], 8);
  for (let i = 0; i < 4; i++) line(g, [[180 + i * 4, 486 + i * 16], [588 - i * 4, 486 + i * 16]], i % 2 ? "#3a9a5a" : "#2f7a48", 9);
  tube(g, [[196, 470], [572, 470]], 18); tube(g, [[156, 540], [612, 540]], 20);
  // front legs + armrests
  tube(g, [[156, 540], [130, 750]], 18); tube(g, [[612, 540], [638, 750]], 18);
  tube(g, [[214, 400], [140, 404], [140, 540]], 18); tube(g, [[554, 400], [628, 404], [628, 540]], 18);
  R(g, 112, 388, 90, 26, 12, "#f4f0e4", 6); R(g, 566, 388, 90, 26, 12, "#f4f0e4", 6);
  // water jugs (ballast) hanging from the armrests
  const nj = o.jugs ?? 0;
  for (let i = 0; i < nj; i++) { const side = i % 2 ? 1 : -1, j = Math.floor(i / 2), x = 384 + side * (250 + j * 34), y = 600 + j * 20;
    line(g, [[384 + side * 240, 410], [x, y - 50]], INK, 4); R(g, x - 26, y - 46, 52, 78, 14, "rgba(240,246,255,0.92)", 6); R(g, x - 10, y - 60, 20, 18, 4, "#4a8ad8", 4); E(g, x, y + 4, 18, 22, 0, "rgba(120,190,255,0.5)", 0); }
  // the tether rope
  if (o.rope) { if (o.rope >= 2) { line(g, [[384, 540], [372, 640], [396, 700]], INK, 22); line(g, [[384, 540], [372, 640], [396, 700]], "#c8a060", 14); for (let i = 0; i < 6; i++) line(g, [[396, 700], [370 + i * 10, 740 - hh(i, 3) * 20]], "#c8a060", 6); }
    else { line(g, [[384, 540], [384, 768]], INK, 22); line(g, [[384, 540], [384, 768]], "#c8a060", 14); for (let y = 560; y < 768; y += 26) line(g, [[376, y], [392, y + 14]], "#8a6a30", 4); } }
}

// ---- the balloon cluster (1024 x 1024). Strings meet at the bottom centre. o: n (balloons shown, of 42 positions), popped (set of indices), k (bob), squash
const BAL = (() => { const a = []; let i = 0; for (let r = 0; r < 7; r++) { const nRow = [3, 6, 7, 8, 7, 6, 5][r]; for (let c = 0; c < nRow; c++) { const y = 120 + r * 92 + (hh(i, 1) - 0.5) * 30, w = nRow * 130, x = 512 - w / 2 + 65 + c * 130 + (hh(i, 2) - 0.5) * 40; a.push([x, y, 66 + hh(i, 3) * 14, i]); i++; } } return a.sort((p, q) => p[1] - q[1]); })();
const BCOL = ["#f2ede0", "#f6d36a", "#f08a4a", "#e8e2d2", "#ff6a6a", "#7ac0ff", "#f4f0e8", "#ffd23a"];
export function drawBalloons(g, o = {}) {
  g.clearRect(0, 0, 1024, 1024); g.lineJoin = "round"; const k = o.k ?? 0, n = o.n ?? 42, popped = o.popped || [];
  const list = BAL.filter((b) => b[3] < n && !popped.includes(b[3]));
  for (const [x, y, r, i] of list) { const bx = x + Math.sin(k * 1.3 + i) * 6, by = y + Math.cos(k * 1.1 + i * 2) * 5; line(g, [[bx, by + r * 1.05], [bx < 512 ? 330 : 694, 1020]], "rgba(40,40,50,0.6)", 3); }
  for (let j = list.length - 1; j >= 0; j--) { const [x, y, r, i] = list[j], bx = x + Math.sin(k * 1.3 + i) * 6, by = y + Math.cos(k * 1.1 + i * 2) * 5;
    E(g, bx, by, r, r * 1.12, 0, BCOL[i % BCOL.length], 7); E(g, bx - r * 0.35, by - r * 0.4, r * 0.22, r * 0.32, -0.5, "rgba(255,255,255,0.75)", 0); poly(g, [[bx - 10, by + r * 1.12 + 10], [bx + 10, by + r * 1.12 + 10], [bx, by + r * 1.12 - 4]], BCOL[i % BCOL.length], 5); }
  for (const i of o.bursting || []) { const b = BAL.find((q) => q[3] === i); if (!b) continue; const [x, y, r] = b; for (let a = 0; a < 10; a++) { const an = (a / 10) * two; line(g, [[x + Math.cos(an) * r * 0.5, y + Math.sin(an) * r * 0.5], [x + Math.cos(an) * r * 1.3, y + Math.sin(an) * r * 1.3]], "#ffe85a", 12); }
    E(g, x, y, r * 0.5, r * 0.5, 0, "#ffffff", 0); }
}
export const BALLOON_IDS = BAL.map((b) => b[3]);
export const balloonXY = (i) => { const b = BAL.find((q) => q[3] === i); return b ? [b[0], b[1]] : [512, 512]; };

// ---- sky backdrop (576 x 1024). o.high: deep blue with clouds far below; o.dusk
export function drawSky(g, k = 0, o = {}) {
  g.clearRect(0, 0, 576, 1024); const gr = g.createLinearGradient(0, 0, 0, 1024);
  if (o.high) { gr.addColorStop(0, "#1f5ab8"); gr.addColorStop(0.6, "#4a8ae0"); gr.addColorStop(1, "#9ccaf2"); } else { gr.addColorStop(0, "#5aa0e8"); gr.addColorStop(0.7, "#a8d4f4"); gr.addColorStop(1, "#d8ecf8"); }
  g.fillStyle = gr; g.fillRect(0, 0, 576, 1024);
  const vy = o.vy ?? 0;   // vertical cloud speed (rising: clouds go down)
  for (let i = 0; i < 10; i++) { const x = ((hh(i, 1) * 900 - k * (30 + i * 5)) % 900 + 900) % 900 - 160, y0 = o.high ? 640 + hh(i, 2) * 420 : 60 + hh(i, 2) * 900, y = (((y0 + k * vy * (0.7 + hh(i, 4))) % 1200) + 1200) % 1200 - 90, w = 100 + hh(i, 3) * 140;
    for (const [dx, dy, r] of [[0, 0, 1], [w * 0.5, -w * 0.15, 0.8], [-w * 0.5, w * 0.05, 0.7]]) E(g, x + dx, y + dy, w * 0.5 * r, w * 0.32 * r, 0, "rgba(255,255,255,0.92)", 0); }
  if (o.high) { g.fillStyle = "rgba(255,255,255,0.85)"; for (let i = 0; i < 14; i++) E(g, i * 48 - 20 + Math.sin(i * 3) * 10, 1000 + Math.sin(i * 2.1) * 20, 70, 50, 0, "rgba(255,255,255,0.95)", 0); }
}

// ---- airliner, side view flying left (1024 x 512). o: face (pilot in the cockpit window: calm / shock), k
export function drawPlane(g, o = {}) {
  g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; const k = o.k ?? 0;
  poly(g, [[560, 250], [700, 120], [770, 120], [690, 260]], "#d8dce4", 9);                 // far wing
  poly(g, [[860, 220], [940, 60], [1000, 60], [960, 232]], "#d8202e", 10);                 // tail fin
  g.beginPath(); g.moveTo(120, 300); g.quadraticCurveTo(60, 236, 170, 212); g.lineTo(930, 210); g.quadraticCurveTo(1000, 226, 990, 262); g.lineTo(920, 300); g.lineTo(200, 320); g.closePath(); g.fillStyle = "#f6f6f2"; g.fill(); g.strokeStyle = INK; g.lineWidth = 11; g.stroke();
  line(g, [[150, 290], [930, 280]], "#2a5ad8", 16);
  for (let i = 0; i < 14; i++) E(g, 300 + i * 44, 244, 11, 14, 0, "#4a6a8a", 4);
  // cockpit window + pilot
  poly(g, [[118, 232], [176, 214], [214, 214], [212, 248], [130, 252]], "#a8d8f4", 6);
  const face = o.face ?? "calm", px = 188, py = 236;
  E(g, px, py, 17, 17, 0, "#f2d2b6", 4); R(g, px - 18, py - 22, 36, 10, 4, "#1f2a4a", 3);
  if (face === "shock") { E(g, px - 9, py - 2, 6, 7, 0, "#ffffff", 3); E(g, px + 6, py - 2, 6, 7, 0, "#ffffff", 3); E(g, px - 1, py + 10, 5, 6, 0, INK, 0); }
  else { E(g, px - 7, py - 2, 2.5, 2.5, 0, INK, 0); E(g, px + 6, py - 2, 2.5, 2.5, 0, INK, 0); line(g, [[px - 6, py + 8], [px + 6, py + 8]], INK, 3); }
  poly(g, [[380, 290], [540, 300], [430, 450], [360, 450]], "#c8ccd6", 10);              // near wing
  R(g, 420, 330, 120, 50, 22, "#9aa0ac", 9); E(g, 418, 355, 10, 22, 0, "#3a3a44", 4);    // engine
  poly(g, [[840, 280], [960, 270], [930, 310], [850, 312]], "#c8ccd6", 8);
  if (k % 2 === 0) E(g, 600, 446, 10, 10, 0, "#ff3a3a", 0);
}

// ---- prop drawings
export const drawGun = (g) => { g.clearRect(0, 0, 512, 128); g.lineJoin = "round"; R(g, 40, 44, 300, 30, 10, "#3a3a44", 7); R(g, 320, 40, 150, 40, 12, "#8a5a32", 7); poly(g, [[340, 74], [400, 74], [380, 124], [350, 124]], "#8a5a32", 7); R(g, 20, 48, 30, 22, 6, "#2a2a30", 5); line(g, [[300, 80], [320, 100]], INK, 6); };
export const drawSandwich = (g) => { g.clearRect(0, 0, 256, 128); g.lineJoin = "round"; poly(g, [[20, 90], [236, 90], [128, 20]], "#e8c47a", 7); line(g, [[30, 84], [226, 84]], "#6ab04a", 12); line(g, [[40, 76], [216, 76]], "#e85a4a", 9); poly(g, [[20, 98], [236, 98], [236, 112], [20, 112]], "#e8c47a", 6); };
export const drawBeer = (g) => { g.clearRect(0, 0, 128, 256); R(g, 24, 30, 80, 200, 16, "#d8b030", 7); R(g, 24, 30, 80, 24, 10, "#c9ced6", 6); R(g, 30, 100, 68, 70, 8, "#ffffff", 5); txt(g, "BEER", 64, 136, 30, "Bangers", "#c8202e", INK, 0, 64); E(g, 46, 70, 6, 20, 0, "rgba(255,255,255,0.5)", 0); };
export const drawEye = (g, o = {}) => { g.clearRect(0, 0, 576, 768); R(g, 20, 20, 536, 728, 18, "#fbf8f0", 10); const rows = ["E", "F P", "T O Z", "L P E D", "P E C F D", "E D F C Z P"];
  g.save(); if (o.blur) g.filter = `blur(${o.blur}px)`; rows.forEach((s, i) => txt(g, s, 288, 110 + i * 100 + i * i * 4, 150 - i * 22, "AlfaSlab", "#1a1a22")); g.restore(); txt(g, "EYE TEST", 288, 712, 46, "Bangers", "#c8202e", INK, 0, 400); };
export const drawNo = (g) => { g.clearRect(0, 0, 512, 512); E(g, 256, 256, 210, 210, 0, null, 34, "#d8202e"); line(g, [[110, 110], [402, 402]], "#d8202e", 34); txt(g, "NO", 256, 262, 170, "Bangers", "#ffffff", "#d8202e", 22); };
export const drawBoxes = (g) => { g.clearRect(0, 0, 768, 512); g.lineJoin = "round"; const B = [[40, 250, 330, 240], [380, 250, 340, 240], [200, 30, 360, 230]];
  for (const [x, y, w, h] of B) { R(g, x, y, w, h, 8, "#c89a5a", 9); line(g, [[x, y + 50], [x + w, y + 50]], "#8a6a30", 6); R(g, x + 30, y + 80, w - 60, h - 120, 6, "#f4ead0", 5); txt(g, "WEATHER", x + w / 2, y + 120, 54, "Bangers", "#2a4a8a", INK, 0, w - 80); txt(g, "BALLOONS", x + w / 2, y + 172, 54, "Bangers", "#2a4a8a", INK, 0, w - 80); } };
export const drawTank = (g) => { g.clearRect(0, 0, 256, 768); R(g, 40, 120, 176, 630, 70, "#8a9aa8", 9); R(g, 96, 40, 64, 90, 10, "#3a3a44", 7); R(g, 70, 20, 116, 30, 8, "#5a5a66", 6); R(g, 62, 300, 132, 200, 10, "#ffffff", 6); txt(g, "HELIUM", 128, 400, 46, "Bangers", "#2a5ad8", INK, 0, 120); E(g, 80, 220, 12, 60, 0, "rgba(255,255,255,0.4)", 0); };
export const drawPlan = (g, k = 0) => { g.clearRect(0, 0, 768, 576); R(g, 16, 16, 736, 544, 16, "#2a5aa8", 10); g.strokeStyle = "rgba(255,255,255,0.15)"; g.lineWidth = 2; for (let x = 40; x < 740; x += 40) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x, 556); g.stroke(); } for (let y = 40; y < 556; y += 40) { g.beginPath(); g.moveTo(20, y); g.lineTo(748, y); g.stroke(); }
  const W = "#f4f8ff"; poly(g, [[110, 470], [110, 380], [190, 320], [270, 380], [270, 470]], null, 6, W); poly(g, [[480, 470], [480, 380], [560, 320], [640, 380], [640, 470]], null, 6, W); line(g, [[40, 470], [728, 470]], W, 6);
  const cx = 200 + Math.min(1, k) * 190, cy = 260 + Math.sin(k * 3) * 6; for (let i = 0; i < 6; i++) E(g, cx - 40 + (i % 3) * 40, cy - 130 - Math.floor(i / 3) * 40, 22, 24, 0, null, 4, W); line(g, [[cx, cy - 100], [cx, cy - 30]], W, 3);
  R(g, cx - 30, cy - 30, 60, 50, 6, null, 5, W); g.setLineDash([14, 12]); line(g, [[120, 270], [cx - 50, cy]], "#ffe85a", 5); g.setLineDash([]); txt(g, "THE PLAN", 384, 70, 64, "Bangers", "#ffe85a", INK, 0, 600); txt(g, "FLOAT GENTLY", 384, 520, 44, "Bangers", W, INK, 0, 600); };
export const drawRope = (g, snap = 0) => { g.clearRect(0, 0, 512, 768); g.lineJoin = "round"; const gap = snap * 160;
  const seg = (y0, y1, fr) => { line(g, [[256, y0], [256, y1]], INK, 50); line(g, [[256, y0], [256, y1]], "#c8a060", 38); for (let y = y0 + 10; y < y1 - 10; y += 30) line(g, [[240, y], [272, y + 18]], "#8a6a30", 6); if (fr) for (let i = 0; i < 7; i++) line(g, [[256, fr], [228 + i * 9, fr + (fr > 384 ? -1 : 1) * (20 + hh(i, 2) * 30)]], "#c8a060", 8); };
  if (snap <= 0) seg(0, 768, 0); else { seg(0, 384 - gap / 2, 384 - gap / 2); seg(384 + gap / 2, 768, 384 + gap / 2); for (let a = 0; a < 8; a++) { const an = (a / 8) * two + 0.3; line(g, [[256 + Math.cos(an) * 60, 384 + Math.sin(an) * 60], [256 + Math.cos(an) * (110 + snap * 60), 384 + Math.sin(an) * (110 + snap * 60)]], "#ffe85a", 12); } } };
export const drawPoles = (g, o = {}) => { g.clearRect(0, 0, 1024, 1024); g.lineJoin = "round"; const k = o.k ?? 0, sp = o.spark ?? 0;
  for (const x of [170, 860]) { R(g, x - 22, 120, 44, 904, 10, "#7a5a3a", 8); R(g, x - 150, 180, 300, 30, 8, "#6a4a2e", 7); for (const dx of [-120, 0, 120]) R(g, x + dx - 10, 160, 20, 24, 6, "#9ad0e8", 4); }
  for (const [y, sag] of [[172, 70], [240, 80], [300, 60]]) for (const dx of [-120, 0, 120]) { if (dx === 0 && y !== 172) continue; g.beginPath(); g.moveTo(170 + dx, y); g.quadraticCurveTo(512 + dx, y + sag * 2 + (o.tangle ? 40 : 0), 860 + dx, y); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); }
  if (sp > 0) for (let i = 0; i < 5; i++) { if ((k + i) % 3 === 0) continue; const x = 420 + hh(i + k, 5) * 200, y = 250 + hh(i + k, 6) * 80; for (let a = 0; a < 8; a++) { const an = (a / 8) * two + k; line(g, [[x, y], [x + Math.cos(an) * 60 * sp, y + Math.sin(an) * 60 * sp]], a % 2 ? "#ffffff" : "#ffe85a", 9); } } };
export const drawHouses = (g, on = 1) => { g.clearRect(0, 0, 1024, 576); g.lineJoin = "round"; const H = [[30, "#e8c8a0", "#a84a3a"], [360, "#a8c8e0", "#4a5a7a"], [690, "#e8e0a8", "#7a4a3a"]];
  for (const [x, wall, roof] of H) { R(g, x, 250, 300, 300, 6, wall, 9); poly(g, [[x - 20, 260], [x + 150, 120], [x + 320, 260]], roof, 9); R(g, x + 120, 410, 60, 140, 4, "#7a4a2a", 6);
    for (const wx of [x + 30, x + 200]) { R(g, wx, 300, 70, 70, 4, on ? "#ffe890" : "#2a2e44", 6); line(g, [[wx + 35, 300], [wx + 35, 370]], INK, 4); line(g, [[wx, 335], [wx + 70, 335]], INK, 4); if (on) E(g, wx + 35, 335, 60, 50, 0, "rgba(255,232,140,0.25)", 0); } }
  if (!on) { g.fillStyle = "rgba(20,24,50,0.45)"; g.fillRect(0, 0, 1024, 576); } };
export const drawTicket = (g, u = 1) => { g.clearRect(0, 0, 512, 768); R(g, 30, 20, 452, 728, 12, "#fffbe8", 9); R(g, 30, 20, 452, 100, 12, "#d8202e", 9); txt(g, "FINE", 256, 72, 70, "Bangers", "#ffffff", INK, 6);
  for (let i = 0; i < 5; i++) line(g, [[70, 170 + i * 50], [440, 170 + i * 50]], "#b8b8c0", 5); txt(g, "FLYING A", 256, 470, 50, "Bangers", "#2a2a36", INK, 0, 400); txt(g, "LAWN CHAIR", 256, 525, 50, "Bangers", "#2a2a36", INK, 0, 400);
  if (u > 0) { g.globalAlpha = Math.min(1, u); txt(g, "$1,500", 256, 640, 110, "Bangers", "#d8202e", INK, 8, 420); g.globalAlpha = 1; } };
export const drawThought = (g) => { g.clearRect(0, 0, 768, 512); g.lineJoin = "round"; for (const [x, y, r] of [[384, 220, 200], [230, 240, 130], [540, 240, 130], [384, 120, 140], [300, 320, 110], [470, 320, 110]]) E(g, x, y, r, r * 0.7, 0, "#ffffff", 10);
  for (const [x, y, r] of [[384, 220, 194], [230, 240, 124], [540, 240, 124], [384, 120, 134], [300, 320, 104], [470, 320, 104]]) E(g, x, y, r, r * 0.7, 0, "#ffffff", 0); E(g, 150, 440, 30, 24, 0, "#ffffff", 8); E(g, 100, 490, 16, 13, 0, "#ffffff", 6);
  g.save(); g.translate(384, 220); g.rotate(-0.15); g.scale(0.55, 0.55); g.translate(-512, -256); drawPlane(g, { face: "calm" }); g.restore(); };
export const drawMuseum = (g, glow = 1) => { g.clearRect(0, 0, 576, 1024); const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "#2a2438"); gr.addColorStop(1, "#4a3e5a"); g.fillStyle = gr; g.fillRect(0, 0, 576, 1024);
  R(g, 0, 820, 576, 204, 0, "#6a5a4a", 0); g.fillStyle = `rgba(255,240,200,${0.18 * glow})`; poly(g, [[250, 0], [326, 0], [520, 860], [56, 860]], `rgba(255,240,200,${0.16 * glow})`, 0);
  for (const x of [60, 516]) R(g, x - 20, 120, 40, 700, 6, "#5a4e6a", 0); R(g, 40, 70, 496, 60, 8, "#3a3248", 0); txt(g, "SMITHSONIAN", 288, 100, 46, "AlfaSlab", "#e8d8a8", INK, 0, 460); };
export const drawPlaque = (g) => { g.clearRect(0, 0, 512, 256); R(g, 16, 16, 480, 224, 14, "#c8a048", 9); R(g, 36, 36, 440, 184, 8, "#e8c868", 5); txt(g, "THE FLYING", 256, 96, 56, "AlfaSlab", "#3a2a10", INK, 0, 420); txt(g, "LAWN CHAIR", 256, 164, 56, "AlfaSlab", "#3a2a10", INK, 0, 420); };
export const drawMic = (g) => { g.clearRect(0, 0, 128, 256); R(g, 54, 90, 20, 160, 8, "#2a2a30", 5); E(g, 64, 70, 34, 40, 0, "#5a5e68", 6); for (let i = 0; i < 4; i++) line(g, [[40, 54 + i * 12], [88, 54 + i * 12]], "#3a3a44", 3); };
export const drawFlash = (g) => { g.clearRect(0, 0, 256, 256); const gr = g.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,240,0.8)"); gr.addColorStop(1, "rgba(255,255,240,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); };
export const drawHook = (g) => { g.clearRect(0, 0, 512, 512); };
