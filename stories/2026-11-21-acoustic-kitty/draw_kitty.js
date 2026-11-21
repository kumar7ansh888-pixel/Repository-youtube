// Canvas drawings for "The CIA Turned a Cat Into a Spy" (Acoustic Kitty). Imported by story.js.
import { INK } from "../lib/toon.js";
const two = Math.PI * 2;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, u) => a + (b - a) * u;
export const hh = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
export const txt = (g, s, x, y, size, font, fill, stroke = INK, lw = 0, maxW = 0) => {
  g.font = `${size}px ${font}`; if (maxW) { let k = size; while (g.measureText(s).width > maxW && k > 8) { k *= 0.94; g.font = `${k}px ${font}`; } }
  g.textAlign = "center"; g.textBaseline = "middle"; if (lw) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = lw; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y);
};
export const E = (g, x, y, rx, ry, rot, fill, lw = 8, stroke = INK) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, two); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
export const R = (g, x, y, w, h, r, fill, lw = 8, stroke = INK) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
export const poly = (g, pts, fill, lw = 8, stroke = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
export const line = (g, pts, col = INK, lw = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); };

// ---------------- the spy cat: side view facing right, 768 x 512, feet on y 490 ----------------
// o: pose (stand | sit | lie | flip), face (happy, shock, sleep, bored, smug, innocent, sly, hungry, annoyed, proud), shades, mic, tx (radio box),
//    wire (0..1 antenna drawn along the back to the tail), glow (tip blink), k (walk frame 0..7, -1 = still), bandage, flip (face left), listen (sound waves)
const C = "#a3a9b6", CD = "#6a7080", CL = "#e2e5ec", PINK = "#f4a0b0", GLOW = "#7af0ff";
export function drawCat(g, o = {}) {
  if (!o.keep) g.clearRect(0, 0, 768, 512); g.save(); g.lineJoin = "round"; g.lineCap = "round";
  if (o.flip) { g.translate(768, 0); g.scale(-1, 1); }
  const pose = o.pose ?? "stand", k = o.k ?? -1, face = o.face ?? "happy";
  if (pose === "flip") { g.translate(384, 300); g.rotate(Math.PI); g.translate(-384, -285); }
  let hx = 560, hy = 230, bx = 360, by = 320, brx = 190, bry = 85, tail = [[175, 300], [80, 280], [70, 120]];
  if (pose === "sit") { hx = 470; hy = 160; bx = 400; by = 340; brx = 130; bry = 140; tail = [[300, 470], [180, 490], [130, 420]]; }
  if (pose === "lie") { hx = 590; hy = 330; bx = 370; by = 410; brx = 220; bry = 75; tail = [[160, 440], [70, 470], [40, 400]]; }
  // tail (+ antenna)
  const tailPath = () => { g.beginPath(); g.moveTo(...tail[0]); g.quadraticCurveTo(...tail[1], ...tail[2]); };
  tailPath(); g.strokeStyle = INK; g.lineWidth = 46; g.stroke(); tailPath(); g.strokeStyle = C; g.lineWidth = 32; g.stroke();
  for (let i = 1; i < 4; i++) { const u = i / 4.2, x = (1 - u) * (1 - u) * tail[0][0] + 2 * u * (1 - u) * tail[1][0] + u * u * tail[2][0], y = (1 - u) * (1 - u) * tail[0][1] + 2 * u * (1 - u) * tail[1][1] + u * u * tail[2][1]; E(g, x, y, 12, 12, 0, CD, 0); }
  // legs
  if (pose === "stand" || pose === "flip") {
    const legs = [[250, 0], [300, Math.PI], [440, Math.PI], [490, 0]];
    legs.forEach(([x, ph], i) => { const s = k >= 0 ? Math.sin((k / 8) * two + ph) : 0, near = i % 2 === 1; g.save(); g.translate(x, 370); g.rotate(s * 0.35); R(g, -24, 0, 48, 130, 22, near ? C : CD, 8); E(g, 4, 124, 32, 16, 0, near ? CL : "#c8ccd4", 7); g.restore(); });
  } else if (pose === "sit") { R(g, 420, 380, 50, 110, 22, C, 8); R(g, 480, 380, 50, 110, 22, C, 8); E(g, 450, 486, 36, 16, 0, CL, 7); E(g, 510, 486, 36, 16, 0, CL, 7); E(g, 320, 450, 80, 45, 0, C, 8); }
  else if (pose === "lie") { E(g, 600, 470, 60, 20, 0, CL, 7); E(g, 520, 474, 60, 20, 0, CL, 7); }
  // body
  E(g, bx, by, brx, bry, pose === "sit" ? -0.25 : 0, C, 11);
  g.save(); g.beginPath(); g.ellipse(bx, by, brx - 6, bry - 6, pose === "sit" ? -0.25 : 0, 0, two); g.clip();
  for (let i = 0; i < 5; i++) { const x = bx - brx * 0.6 + i * brx * 0.3; line(g, [[x, by - bry], [x - 14, by - bry * 0.35]], CD, 14); }
  E(g, bx + brx * 0.25, by + bry * 0.65, brx * 0.6, bry * 0.4, 0, CL, 0); g.restore();
  if (o.bandage) { R(g, bx - 50, by - bry + 4, 100, bry * 2 - 8, 16, "#ffffff", 7); line(g, [[bx - 18, by], [bx + 18, by]], "#e8303a", 10); line(g, [[bx, by - 18], [bx, by + 18]], "#e8303a", 10); }
  // the antenna wire along the back to the tail tip
  if (o.wire) { const w = clamp01(o.wire), pts = [[hx - 70, hy + 30], [bx + brx * 0.3, by - bry - 4], [bx - brx * 0.4, by - bry + 6], tail[0], tail[1], tail[2]];
    const seg = pts.length - 1, n = w * seg; g.beginPath(); g.moveTo(...pts[0]); let last = pts[0];
    for (let i = 0; i < seg; i++) { const u = clamp01(n - i); if (u <= 0) break; last = [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; g.lineTo(...last); }
    g.strokeStyle = "rgba(122,240,255,0.35)"; g.lineWidth = 22; g.stroke(); g.strokeStyle = GLOW; g.lineWidth = 6; g.stroke();
    if (w >= 1 && o.glow) { E(g, tail[2][0], tail[2][1], 26, 26, 0, "rgba(122,240,255,0.5)", 0); E(g, tail[2][0], tail[2][1], 12, 12, 0, "#ffffff", 4, GLOW); } }
  // head
  poly(g, [[hx - 80, hy - 40], [hx - 70, hy - 140], [hx - 10, hy - 80]], C, 10); poly(g, [[hx - 64, hy - 60], [hx - 62, hy - 112], [hx - 30, hy - 80]], PINK, 0);
  poly(g, [[hx + 10, hy - 85], [hx + 60, hy - 145], [hx + 75, hy - 50]], C, 10); poly(g, [[hx + 26, hy - 84], [hx + 56, hy - 118], [hx + 62, hy - 70]], PINK, 0);
  E(g, hx, hy, 100, 88, 0, C, 11);
  line(g, [[hx - 30, hy - 84], [hx - 24, hy - 50]], CD, 10); line(g, [[hx, hy - 88], [hx, hy - 52]], CD, 10); line(g, [[hx + 30, hy - 84], [hx + 24, hy - 50]], CD, 10);
  E(g, hx + 50, hy + 40, 50, 34, 0, CL, 0);
  // the mic in the ear
  if (o.mic) { E(g, hx + 46, hy - 90, 14, 14, 0, "#2a2a30", 5); E(g, hx + 46, hy - 90, 6, 6, 0, GLOW, 0);
    if (o.listen) for (let i = 0; i < 3; i++) { const ph = ((o.lk ?? 0) / 6 + i / 3) % 1; g.globalAlpha = 1 - ph; g.beginPath(); g.arc(hx + 46, hy - 90, 30 + ph * 70, -1.2, 0.2); g.strokeStyle = GLOW; g.lineWidth = 7; g.stroke(); } g.globalAlpha = 1; }
  // radio box at the base of the skull
  if (o.tx) { R(g, hx - 110, hy + 10, 44, 34, 8, "#3a3e48", 6); E(g, hx - 88, hy + 27, 7, 7, 0, (o.lk ?? 0) % 6 < 3 ? "#ff3a3a" : "#7a2a2a", 0); }
  // face
  const ex1 = hx + 22, ex2 = hx + 72, ey = hy - 12;
  const openEye = (x, s = 1, pup = 1) => { E(g, x, ey, 20 * s, 24 * s, 0, "#e8f080", 6); E(g, x + 4, ey + 2, 6 * pup, 18 * s * Math.min(1, pup), 0, INK, 0); E(g, x + 9, ey - 8, 5, 5, 0, "#ffffff", 0); };
  if (face === "happy" || face === "proud") { for (const x of [ex1, ex2]) line(g, [[x - 16, ey + 4], [x, ey - 10], [x + 16, ey + 4]], INK, 8); }
  else if (face === "sleep") { for (const x of [ex1, ex2]) line(g, [[x - 16, ey], [x, ey + 8], [x + 16, ey]], INK, 7); }
  else if (face === "shock") { for (const x of [ex1, ex2]) { E(g, x, ey, 25, 30, 0, "#ffffff", 6); E(g, x + 3, ey + 2, 6, 6, 0, INK, 0); } }
  else if (face === "innocent") { for (const x of [ex1, ex2]) { E(g, x, ey, 24, 28, 0, "#e8f080", 6); E(g, x + 3, ey + 2, 17, 22, 0, INK, 0); E(g, x + 9, ey - 8, 7, 7, 0, "#ffffff", 0); E(g, x - 5, ey + 9, 3, 3, 0, "#ffffff", 0); } }
  else { const pup = face === "hungry" ? 1.6 : 1; for (const x of [ex1, ex2]) openEye(x, 1, pup);
    if (face === "bored" || face === "smug" || face === "sly" || face === "annoyed") { g.fillStyle = C; for (const x of [ex1, ex2]) { g.fillRect(x - 24, ey - 30, 48, face === "bored" ? 30 : 24); line(g, [[x - 22, ey - (face === "bored" ? 0 : 6)], [x + 22, ey - (face === "bored" ? 0 : 6)]], INK, 7); } }
    if (face === "annoyed") { line(g, [[ex1 - 20, ey - 36], [ex1 + 18, ey - 26]], INK, 7); line(g, [[ex2 + 20, ey - 36], [ex2 - 18, ey - 26]], INK, 7); } }
  if (o.shades) { R(g, ex1 - 30, ey - 22, 60, 40, 12, "#111118", 0); R(g, ex2 - 30, ey - 22, 60, 40, 12, "#111118", 0); line(g, [[ex1 + 30, ey - 8], [ex2 - 30, ey - 8]], "#111118", 7); line(g, [[ex1 - 30, ey - 8], [hx - 60, ey - 14]], "#111118", 6); g.globalAlpha = 0.5; line(g, [[ex1 - 18, ey - 12], [ex1 - 4, ey - 16]], "#ffffff", 5); line(g, [[ex2 - 18, ey - 12], [ex2 - 4, ey - 16]], "#ffffff", 5); g.globalAlpha = 1; }
  // nose, mouth, whiskers
  poly(g, [[hx + 80, hy + 22], [hx + 100, hy + 22], [hx + 90, hy + 34]], PINK, 5);
  if (face === "shock") E(g, hx + 86, hy + 58, 14, 18, 0, "#7a2a3a", 6);
  else if (face === "hungry") { g.beginPath(); g.arc(hx + 86, hy + 48, 16, 0.1 * Math.PI, 0.9 * Math.PI); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); E(g, hx + 88, hy + 66, 10, 12, 0, PINK, 5); E(g, hx + 72, hy + 80, 6, 12, 0, "#bfe8ff", 4); }
  else if (face === "sleep" || face === "bored" || face === "annoyed") line(g, [[hx + 74, hy + 52], [hx + 98, hy + 50]], INK, 6);
  else { line(g, [[hx + 90, hy + 34], [hx + 90, hy + 44]], INK, 5); g.beginPath(); g.arc(hx + 80, hy + 44, 10, 0.1 * Math.PI, 0.9 * Math.PI); g.arc(hx + 100, hy + 44, 10, 0.1 * Math.PI, 0.9 * Math.PI); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  for (const [dy, a] of [[34, -0.15], [46, 0.05], [58, 0.25]]) { line(g, [[hx + 110, hy + dy], [hx + 175, hy + dy + a * 60]], INK, 3); line(g, [[hx + 60, hy + dy], [hx - 2, hy + dy + a * 60]], INK, 3); }
  g.restore();
}

// ---------------- x-ray lightbox (576 x 768): a sitting cat's skeleton; stage 1 mic, 2 radio, 3 antenna (u = wire progress) ----------------
export function drawXray(g, stage, k = 0, u = 1) {
  g.clearRect(0, 0, 576, 768); g.lineJoin = "round"; g.lineCap = "round";
  R(g, 14, 14, 548, 740, 26, "#2a2e36", 14); const gr = g.createLinearGradient(0, 40, 0, 740); gr.addColorStop(0, "#1a3a5a"); gr.addColorStop(1, "#0e2238"); R(g, 40, 40, 496, 688, 10, gr, 0);
  const W = "rgba(220,240,255,0.9)", Wd = "rgba(170,210,240,0.45)";
  // body ghost
  g.beginPath(); g.ellipse(300, 470, 150, 200, -0.1, 0, two); g.fillStyle = "rgba(160,200,240,0.16)"; g.fill();
  E(g, 300, 210, 120, 105, 0, "rgba(160,200,240,0.18)", 0);
  poly(g, [[205, 160], [215, 60], [270, 120]], "rgba(160,200,240,0.18)", 0); poly(g, [[330, 115], [390, 55], [395, 160]], "rgba(160,200,240,0.18)", 0);
  // skull
  E(g, 300, 205, 92, 80, 0, null, 10, W); E(g, 265, 200, 22, 20, 0, "#0e2238", 6, W); E(g, 335, 200, 22, 20, 0, "#0e2238", 6, W); line(g, [[280, 255], [320, 255]], W, 7);
  // spine + ribs + pelvis + legs + tail
  const sp = [[290, 290], [285, 340], [282, 390], [285, 440], [292, 490], [300, 540], [305, 590]]; sp.forEach(([x, y]) => R(g, x - 16, y - 14, 32, 28, 8, Wd, 5, W));
  for (let i = 0; i < 5; i++) { const y = 360 + i * 32; g.beginPath(); g.ellipse(285, y, 110 - i * 8, 26, 0, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = W; g.lineWidth = 6; g.stroke(); g.beginPath(); g.ellipse(285, y, 110 - i * 8, 26, 0, 0.05 * Math.PI, 0.95 * Math.PI); g.strokeStyle = Wd; g.stroke(); }
  E(g, 300, 620, 70, 30, 0, null, 7, W); line(g, [[250, 640], [240, 700]], W, 9); line(g, [[350, 640], [370, 700]], W, 9); line(g, [[330, 320], [380, 470], [370, 690]], W, 8);
  const tl = [[330, 640], [430, 690], [470, 560], [440, 470]]; g.beginPath(); g.moveTo(...tl[0]); g.bezierCurveTo(...tl[1], ...tl[2], ...tl[3]); g.strokeStyle = W; g.lineWidth = 9; g.setLineDash([16, 8]); g.stroke(); g.setLineDash([]);
  const blink = k % 8 < 4;
  // 1: the mic in the ear canal
  if (stage >= 1) { E(g, 385, 150, 34, 34, 0, "rgba(255,226,90,0.35)", 0); E(g, 385, 150, 16, 16, 0, "#ffe25a", 6, "#fff6c0"); R(g, 395, 74, 130, 50, 12, "#ffe25a", 6); txt(g, "MIC", 460, 100, 40, "Bangers", INK, INK, 0, 120); line(g, [[400, 124], [388, 140]], "#ffe25a", 6); }
  // 2: the radio at the base of the skull
  if (stage >= 2) { R(g, 222, 268, 56, 40, 8, blink ? "#ff5a5a" : "#c83a3a", 6, "#ffd0d0"); E(g, 250, 288, 40, 34, 0, null, 4, "rgba(255,120,120,0.5)"); R(g, 56, 250, 150, 50, 12, "#ff5a5a", 6); txt(g, "RADIO", 131, 276, 40, "Bangers", "#ffffff", INK, 0, 140); }
  // 3: the antenna wire down the back to the tail
  if (stage >= 3) { const pts = [[250, 300], [330, 320], [380, 470], [390, 600], [430, 690], [470, 560], [440, 470]]; const n = clamp01(u) * (pts.length - 1);
    g.beginPath(); g.moveTo(...pts[0]); for (let i = 0; i < pts.length - 1; i++) { const v = clamp01(n - i); if (v <= 0) break; g.lineTo(lerp(pts[i][0], pts[i + 1][0], v), lerp(pts[i][1], pts[i + 1][1], v)); }
    g.strokeStyle = "rgba(122,240,255,0.4)"; g.lineWidth = 18; g.stroke(); g.strokeStyle = GLOW; g.lineWidth = 6; g.stroke(); }
  txt(g, "TOP SECRET", 288, 712, 40, "Bangers", "rgba(255,90,90,0.8)", INK, 0, 300);
}

// ---------------- paper memo (576 x 768). o.stamp: null | TOP SECRET | DECLASSIFIED | NOT PRACTICAL, o.su (stamp anim 0..1), o.subj ----------------
export function drawMemo(g, o = {}) {
  g.clearRect(0, 0, 576, 768); g.lineJoin = "round";
  R(g, 20, 20, 536, 728, 14, "#f8f2e0", 12);
  txt(g, "CENTRAL INTELLIGENCE AGENCY", 288, 80, 34, "AlfaSlab", "#2a2a36", INK, 0, 480); line(g, [[60, 110], [516, 110]], "#2a2a36", 5);
  txt(g, "MEMORANDUM", 288, 150, 44, "AlfaSlab", "#2a2a36", INK, 0, 420);
  txt(g, o.subj ?? "SUBJECT: TRAINED CATS", 288, 210, 30, "AlfaSlab", "#5a3a2a", INK, 0, 470);
  for (let i = 0; i < 12; i++) { const y = 260 + i * 34, w = 380 + hh(i, 3) * 80; if (i % 3 === 1) R(g, 60, y - 10, w * 0.8, 22, 4, "#111", 0); else line(g, [[60, y], [60 + w, y]], "#8a8a92", 6); }
  if (o.cat) { g.save(); g.translate(400, 640); g.scale(0.22, 0.22); g.translate(-384, -256); drawCat(g, { pose: "sit", face: o.catFace ?? "smug", shades: true, keep: true }); g.restore(); }
  if (o.stamp) { const su = clamp01(o.su ?? 1), sc = lerp(2.2, 1, su * su), col = o.stamp === "DECLASSIFIED" ? "#2a8a4a" : "#d8202e";
    g.save(); g.translate(288, o.stamp === "NOT PRACTICAL" ? 560 : 470); g.rotate(-0.22); g.scale(sc, sc); g.globalAlpha = su < 0.05 ? 0 : 0.92;
    R(g, -250, -60, 500, 120, 14, null, 12, col); txt(g, o.stamp, 0, 6, 74, "Bangers", col, col, 0, 470); g.restore(); g.globalAlpha = 1; }
}
// chalk plan on the briefing board (768 x 512)
export function drawPlan(g, u = 1) {
  g.clearRect(0, 0, 768, 512); g.lineJoin = "round"; g.lineCap = "round"; const CH = "#f4f4ec";
  txt(g, "OPERATION: KITTY", 384, 50, 52, "Bangers", "#ffe85a", INK, 0, 600);
  g.save(); g.translate(150, 300); g.scale(0.36, 0.36); g.translate(-384, -256); g.globalAlpha = 0.95; drawCat(g, { face: "sly", mic: true, tx: true, wire: 1, keep: true }); g.restore(); g.globalAlpha = 1;
  for (const x of [560, 680]) { E(g, x, 210, 30, 30, 0, null, 6, CH); line(g, [[x, 240], [x, 360]], CH, 6); line(g, [[x - 40, 290], [x + 40, 290]], CH, 6); line(g, [[x, 360], [x - 30, 430]], CH, 6); line(g, [[x, 360], [x + 30, 430]], CH, 6); }
  txt(g, "ENEMY", 620, 470, 40, "Bangers", "#ff8a8a", INK, 0, 200);
  const v = clamp01(u); if (v > 0) { const x1 = lerp(280, 500, v); line(g, [[280, 300], [x1, 300]], CH, 8); if (v > 0.9) poly(g, [[500, 280], [530, 300], [500, 320]], CH, 0); }
  txt(g, "LISTEN!", 400, 250, 44, "Bangers", CH, INK, 0, 240);
}
// the 1960s surveillance van, side view facing left (1024 x 512): o.door 0..1 (sliding door open), o.k wheels
export function drawVan(g, o = {}) {
  g.clearRect(0, 0, 1024, 512); g.lineJoin = "round"; const k = o.k ?? 0, d = clamp01(o.door ?? 0);
  g.beginPath(); g.moveTo(90, 400); g.lineTo(90, 230); g.quadraticCurveTo(100, 120, 220, 110); g.lineTo(930, 110); g.quadraticCurveTo(960, 112, 960, 150); g.lineTo(960, 400); g.closePath(); g.fillStyle = "#e8e2cc"; g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  R(g, 90, 300, 870, 40, 0, "#5a9ab0", 0); line(g, [[90, 300], [960, 300]], INK, 6); line(g, [[90, 340], [960, 340]], INK, 6);
  poly(g, [[110, 230], [130, 140], [230, 136], [230, 230]], "#a8d4f0", 9);
  // the sliding door opening
  R(g, 420, 150, 220, 240, 6, "#1a1a22", 8);
  R(g, 420 + d * 230, 150, 220, 240, 6, "#e8e2cc", 9); line(g, [[440 + d * 230, 270], [470 + d * 230, 270]], INK, 8);
  txt(g, "TOTALLY NORMAL VAN", 790, 220, 44, "Bangers", "#3a6a8a", INK, 0, 280);
  R(g, 600, 70, 30, 40, 4, "#8a8a92", 6); line(g, [[615, 70], [640, 20]], INK, 6); E(g, 642, 18, 10, 10, 0, "#ff3a3a", 4);
  E(g, 104, 330, 16, 22, 0, "#fff6c0", 6);
  for (const x of [250, 820]) { E(g, x, 400, 68, 68, 0, "#2a2a30", 10); E(g, x, 400, 30, 30, 0, "#c8ccd4", 6); line(g, [[x + Math.cos(k) * 28, 400 + Math.sin(k) * 28], [x - Math.cos(k) * 28, 400 - Math.sin(k) * 28]], INK, 6); }
}
// inside the van (576 x 1024 backdrop): rack of dials, reels, blinking lights; o.nosig shows a static screen
export function drawVanIn(g, k = 0, o = {}) {
  g.clearRect(0, 0, 576, 1024); g.fillStyle = "#4a4e58"; g.fillRect(0, 0, 576, 1024);
  for (let x = 0; x < 576; x += 96) line(g, [[x, 0], [x, 1024]], "#3a3e48", 6);
  R(g, 30, 120, 516, 520, 16, "#2a2e36", 10);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const x = 120 + j * 168, y = 200 + i * 110; E(g, x, y, 46, 46, 0, "#f4f0dc", 7); const a = -2.4 + 1.8 * (0.5 + 0.5 * Math.sin(k * 0.7 + i * 2 + j * 3)); line(g, [[x, y], [x + Math.cos(a) * 36, y + Math.sin(a) * 36]], "#d8202e", 6); E(g, x, y, 6, 6, 0, INK, 0); }
  for (let i = 0; i < 10; i++) E(g, 70 + i * 48, 540, 10, 10, 0, (k + i) % 4 === 0 ? "#ff5a5a" : (k + i) % 4 === 2 ? "#7af07a" : "#5a5e68", 4);
  for (const x of [170, 400]) { E(g, x, 760, 80, 80, 0, "#8a8a92", 8); E(g, x, 760, 22, 22, 0, "#2a2a30", 0); for (let s = 0; s < 3; s++) { const a = k * 0.4 + s * 2.1; line(g, [[x, 760], [x + Math.cos(a) * 60, 760 + Math.sin(a) * 60]], "#2a2a30", 8); } }
  line(g, [[170, 840], [400, 840]], "#3a2a1a", 8);
  if (o.nosig) { R(g, 140, 590 - 470, 300, 0, 0, null, 0); R(g, 110, 130, 356, 240, 10, "#9a9aa2", 8); for (let i = 0; i < 260; i++) { const x = 120 + hh(i + k * 7, 3) * 336, y = 140 + hh(i + k * 5, 4) * 220; g.fillStyle = hh(i, k) > 0.5 ? "#ffffff" : "#2a2a30"; g.fillRect(x, y, 10, 6); }
    R(g, 130, 220, 316, 70, 10, "#111", 0); txt(g, "NO SIGNAL", 288, 256, 56, "Bangers", "#ff5a5a", INK, 0, 300); }
}
// binocular mask (576 x 1024)
export function drawBino(g) { g.clearRect(0, 0, 576, 1024); g.fillStyle = "#08080c"; g.fillRect(0, 0, 576, 1024); g.globalCompositeOperation = "destination-out"; E(g, 170, 512, 190, 230, 0, "#000", 0); E(g, 406, 512, 190, 230, 0, "#000", 0); g.globalCompositeOperation = "source-over"; }
// calendar (512 x 576): label on the page
export function drawCal(g, label) { g.clearRect(0, 0, 512, 576); g.lineJoin = "round"; R(g, 40, 60, 432, 480, 22, "#ffffff", 11); R(g, 40, 60, 432, 110, [22, 22, 0, 0], "#2a5aa8", 11);
  txt(g, "TRAINING", 256, 118, 64, "Bangers", "#ffffff", INK, 6, 380); for (const x of [120, 392]) R(g, x - 14, 36, 28, 60, 10, "#8a8a92", 6);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) { const x = 80 + j * 60, y = 200 + i * 52; line(g, [[x, y], [x + 34, y + 30]], "#c8202e", 6); line(g, [[x + 34, y], [x, y + 30]], "#c8202e", 6); }
  txt(g, label, 256, 495, 70, "Bangers", "#2a5aa8", INK, 6, 400); }
// a long receipt (256 x 1024), u = unrolled 0..1
export function drawReceipt(g, u = 1) { g.clearRect(0, 0, 256, 1024); const h = 120 + u * 880; R(g, 20, 10, 216, h, 4, "#fbfbf4", 6);
  for (let y = 60; y < h - 40; y += 34) { line(g, [[40, y], [130 + hh(y, 2) * 50, y]], "#8a8a92", 5); txt(g, "$" + Math.round(hh(y, 4) * 900 + 100), 200, y, 22, "AlfaSlab", "#5a5a62", INK, 0, 70); }
  if (u > 0.9) txt(g, "TOTAL ???", 128, h - 22, 34, "Bangers", "#d8202e", INK, 0, 200); }
// a pile of cash (768 x 384)
export function drawPile(g) { g.clearRect(0, 0, 768, 384); for (let i = 0; i < 40; i++) { const r = Math.sqrt(i / 40), a = hh(i, 2) * Math.PI, x = 384 + Math.cos(a) * r * 330 * (hh(i, 5) > 0.5 ? 1 : -1), y = 360 - (1 - r) * 230 - hh(i, 3) * 30;
  g.save(); g.translate(x, y); g.rotate((hh(i, 4) - 0.5) * 0.8); R(g, -70, -28, 140, 56, 8, i % 2 ? "#9ad07a" : "#86c06a", 6); E(g, 0, 0, 16, 16, 0, "#cfe8b8", 4); g.restore(); } }
// a fish on a paper (sandwich) 256 x 128
export function drawFish(g) { g.clearRect(0, 0, 256, 128); E(g, 120, 64, 80, 36, 0, "#f0a85a", 7); poly(g, [[195, 64], [245, 30], [245, 98]], "#f0a85a", 7); E(g, 80, 56, 8, 8, 0, INK, 0); line(g, [[110, 40], [110, 88]], "#c87a3a", 4); line(g, [[140, 42], [140, 86]], "#c87a3a", 4); }
// butterfly (256 x 256), k
export function drawFly(g, k) { g.clearRect(0, 0, 256, 256); const f = 0.35 + 0.65 * Math.abs(Math.sin(k * 0.9)); for (const s of [-1, 1]) { E(g, 128 + s * 50 * f, 100, 50 * f, 44, 0, "#ffb03a", 7); E(g, 128 + s * 40 * f, 165, 36 * f, 30, 0, "#ff7a3a", 7); } R(g, 120, 80, 16, 110, 8, INK, 0); line(g, [[128, 82], [108, 40]], INK, 4); line(g, [[128, 82], [148, 40]], INK, 4); }
// sign with a word and an optional cross-out (768 x 384)
export function drawSign(g, s, cross = 0, col = "#2a2a36") { g.clearRect(0, 0, 768, 384); R(g, 30, 30, 708, 324, 24, "#fbf3dc", 12); txt(g, s, 384, 200, 170, "Bangers", col, INK, 0, 640);
  if (cross > 0) { const u = clamp01(cross); line(g, [[80, 300], [lerp(80, 690, u), lerp(300, 90, u)]], "#d8202e", 30); } }
// START / FINISH flag on a little stick (256 x 384)
export function drawFlagS(g, s, col) { g.clearRect(0, 0, 256, 384); R(g, 30, 20, 16, 360, 6, "#8a8a92", 5); poly(g, [[46, 30], [240, 70], [46, 150]], col, 7); txt(g, s, 120, 92, 40, "Bangers", "#ffffff", INK, 5, 150); }
// trophy (384 x 512)
export function drawTrophy(g) { g.clearRect(0, 0, 384, 512); g.lineJoin = "round"; g.beginPath(); g.moveTo(80, 60); g.lineTo(304, 60); g.quadraticCurveTo(300, 260, 192, 290); g.quadraticCurveTo(84, 260, 80, 60); g.fillStyle = "#f2c23a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  for (const s of [-1, 1]) { g.beginPath(); g.arc(192 + s * 120, 130, 50, s < 0 ? 0.5 * Math.PI : -0.5 * Math.PI, s < 0 ? 1.5 * Math.PI : 0.5 * Math.PI); g.strokeStyle = INK; g.lineWidth = 26; g.stroke(); g.strokeStyle = "#f2c23a"; g.lineWidth = 14; g.stroke(); }
  R(g, 160, 290, 64, 80, 6, "#e0b030", 10); R(g, 100, 370, 184, 70, 10, "#5a3a2a", 10); txt(g, "SCIENCE!", 192, 405, 40, "Bangers", "#ffe85a", INK, 0, 170); E(g, 150, 120, 20, 40, -0.3, "rgba(255,255,255,0.6)", 0); }
