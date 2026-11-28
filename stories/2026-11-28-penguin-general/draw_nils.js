// Canvas drawings for "This Penguin Is a General in the Army" (Sir Nils Olav, the King's Guard of Norway's penguin at Edinburgh Zoo).
import { INK } from "../lib/toon.js";
import { txt, E, R, poly, line, hh, heart, drawFlash } from "./draw_bosco.js";
export { txt, E, R, poly, line, hh, heart, drawFlash };
const two = Math.PI * 2;
const GOLD = "#f2c232", GOLD_D = "#b8861a";

const PAL = (o) => o.bronze
  ? { head: "#6a4a2a", back: "#7a5632", belly: "#b88a50", breast: "#d0a050", patch: "#e0b060", beak: "#5a3a20", stripe: "#d8a858", feet: "#5a3a20", eye: "#e8c890", ink: "#3a2410" }
  : o.ghost
    ? { head: "#8a90a8", back: "#9aa0b8", belly: "#f4f6ff", breast: "#f0e4c0", patch: "#f0d0a0", beak: "#8a90a8", stripe: "#f0c8a0", feet: "#8a90a8", eye: "#ffffff", ink: "#5a6078" }
    : { head: "#17181e", back: "#2a2e3a", belly: "#ffffff", breast: "#ffd046", patch: "#ff9a1a", beak: "#1c1c22", stripe: "#ff8a2a", feet: "#2a2a30", eye: "#ffffff", ink: INK };

const star = (g, x, y, r, fill = GOLD, lw = 5) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } poly(g, p, fill, lw); };
export { star };

// flipper from pivot (px, py), angle a from straight down (positive = outward for side s), length l; optional armband with chevrons
function flipper(g, C, px, py, s, a, l, o) {
  g.save(); g.translate(px, py); g.rotate(-s * a);
  g.beginPath(); g.moveTo(-18, 0); g.quadraticCurveTo(-30 * s * 0 - 26, l * 0.55, 0, l); g.quadraticCurveTo(28, l * 0.5, 18, 0); g.closePath();
  g.fillStyle = C.back; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 8; g.stroke();
  if (o && (o.chev || o.crown)) { const y0 = l * 0.32; R(g, -27, y0 - 4, 54, 70, 8, "#c8202e", 5, C.ink);
    for (let i = 0; i < (o.chev || 0); i++) line(g, [[-18, y0 + 18 + i * 16], [0, y0 + 6 + i * 16], [18, y0 + 18 + i * 16]], GOLD, 7);
    if (o.crown) { poly(g, [[-16, y0 + 58], [-16, y0 + 40], [-8, y0 + 48], [0, y0 + 36], [8, y0 + 48], [16, y0 + 40], [16, y0 + 58]], GOLD, 3); } }
  g.restore();
}

// front view king penguin, 512 x 768, feet at y ~735. o: pose (stand | flap | salute | proud | bow), k (waddle phase 0..1, lean), face
// (neutral | proud | shock | happy | stern | wink | love | sad), chev (0-3), crown, stars (0-2 epaulette stars), medal, sash, bronze, ghost, keep
export function drawPenguin(g, o = {}) {
  if (!o.keep) g.clearRect(0, 0, 512, 768);
  const C = PAL(o), pose = o.pose || "stand", lean = o.waddle ? Math.sin((o.k || 0) * two) * 0.11 : 0, bow = pose === "bow" ? 0.18 : 0;
  g.save(); g.translate(256, 735); g.rotate(lean); g.translate(-256, -735); g.lineJoin = "round"; g.lineCap = "round";
  // feet
  const lift = o.waddle ? Math.sin((o.k || 0) * two) : 0;
  E(g, 200, 728 - Math.max(0, -lift) * 14, 50, 20, -0.1, C.feet, 7, C.ink); E(g, 312, 728 - Math.max(0, lift) * 14, 50, 20, 0.1, C.feet, 7, C.ink);
  // flippers behind the body for stand / bow
  const fl = pose === "flap" ? [2.3 + Math.sin((o.k || 0) * two * 2) * 0.35, 2.3 - Math.sin((o.k || 0) * two * 2) * 0.35] : pose === "salute" ? [0.3, -2.55] : pose === "proud" ? [0.55, 0.55] : [0.28, 0.28];
  // body
  g.beginPath(); g.ellipse(256, 480, 150, 255, 0, 0, two); g.fillStyle = C.back; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 10; g.stroke();
  const bg = g.createLinearGradient(0, 250, 0, 420); bg.addColorStop(0, C.breast); bg.addColorStop(1, C.belly);
  g.beginPath(); g.ellipse(256, 500, 112, 222, 0, 0, two); g.fillStyle = bg; g.fill();
  if (o.sash) { g.save(); g.beginPath(); g.ellipse(256, 480, 146, 250, 0, 0, two); g.clip(); line(g, [[130, 300], [390, 600]], "#1c3a8a", 46); line(g, [[130, 300], [390, 600]], "#2a5ac8", 30); g.restore(); }
  if (o.medal) { line(g, [[236, 330], [256, 400], [276, 330]], "#c8202e", 14); E(g, 256, 420, 34, 34, 0, GOLD, 7, C.ink); star(g, 256, 420, 20, "#fff4b0", 3); }
  if (o.medals) for (let i = 0; i < o.medals; i++) { const x = 200 + i * 36; R(g, x - 14, 340, 28, 22, 3, ["#c8202e", "#1c3a8a", "#2a8a4a", "#ffd23a"][i % 4], 4, C.ink); E(g, x, 380, 14, 14, 0, GOLD, 4, C.ink); }
  // flippers
  flipper(g, C, 256 - 132, 330 + bow * 60, -1, fl[0], 200, null);
  flipper(g, C, 256 + 132, 330 + bow * 60, 1, fl[1], 200, { chev: o.chev, crown: o.crown });
  // epaulette stars
  if (o.stars) for (const s of [-1, 1]) { R(g, 256 + s * 120 - 36, 300, 72, 30, 10, GOLD, 5, C.ink); for (let i = 0; i < o.stars; i++) star(g, 256 + s * 120 + (i - (o.stars - 1) / 2) * 30, 315, 14, "#ffffff", 3); }
  // head
  g.save(); g.translate(256, 290); g.rotate(bow ? 0 : 0); g.translate(0, bow * 120); g.translate(-256, -290);
  const hy = pose === "proud" ? 190 : 200;
  E(g, 256, hy, 98, 92, 0, C.head, 10, C.ink);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(256 + s * 80, hy + 55, 22, 44, s * 0.35, 0, two); g.fillStyle = C.patch; g.fill(); }
  const f = o.face || "neutral", ey = hy - 12;
  for (const s of [-1, 1]) { const ex = 256 + s * 36;
    if (f === "happy" || f === "proud" || (f === "wink" && s > 0)) { g.beginPath(); g.arc(ex, ey + 8, 18, Math.PI * 1.1, Math.PI * 1.9); g.strokeStyle = C.eye; g.lineWidth = 8; g.stroke(); }
    else if (f === "love") heart(g, ex, ey, 34, "#ff4a6a");
    else { const big = f === "shock" ? 1.35 : 1; E(g, ex, ey, 20 * big, 23 * big, 0, C.eye, 5, C.ink); E(g, ex + s * 2 - (f === "sad" ? 0 : 0), ey + 4, 9 * big, 10 * big, 0, C.ink, 0); E(g, ex - 3, ey - 2, 3.5, 3.5, 0, "#ffffff", 0); }
    if (f === "stern" || f === "proud") line(g, [[ex - s * 22, ey - 30 + (f === "stern" ? -6 : 4)], [ex + s * 22, ey - 30 + (f === "stern" ? 8 : -4)]], C.eye, 7);
    if (f === "sad") line(g, [[ex - s * 20, ey - 26], [ex + s * 20, ey - 34]], C.eye, 6); }
  // beak (long, slightly open when shocked); proud tilts it up
  const by = hy + 14, open = f === "shock" ? 22 : 0, up = pose === "proud" ? -26 : 0;
  poly(g, [[236, by], [276, by], [262, by + 92 + up], [250, by + 92 + up]], C.beak, 7, C.ink);
  line(g, [[244, by + 52 + up * 0.5], [256, by + 86 + up]], C.stripe, 8);
  if (open) { E(g, 256, by + 60, 20, open, 0, "#c8304a", 6, C.ink); }
  g.restore();
  if (o.hat === "beret") { g.save(); g.translate(256, hy - 82); E(g, 0, 0, 92, 34, -0.12, "#c8202e", 8, C.ink); E(g, -40, 8, 16, 10, 0, GOLD, 4, C.ink); g.restore(); }
  g.restore();
}

// side view, 512 x 768, facing +x (o.left flips), walking phase k (0..1), face, chev, stars, medal, bronze
export function drawPenguinSide(g, o = {}) {
  g.clearRect(0, 0, 512, 768); g.save(); if (o.left) { g.translate(512, 0); g.scale(-1, 1); }
  const C = PAL(o), k = o.k || 0, sw = Math.sin(k * two), bob = Math.abs(Math.cos(k * two)) * 8;
  g.translate(256, 735); g.rotate(sw * 0.1); g.translate(-256, -735 + bob); g.lineJoin = "round"; g.lineCap = "round";
  E(g, 230 + sw * 30, 726 - Math.max(0, sw) * 16, 56, 18, 0, C.feet, 7, C.ink); E(g, 270 - sw * 30, 726 - Math.max(0, -sw) * 16, 56, 18, 0, C.feet, 7, C.ink);
  g.beginPath(); g.ellipse(250, 480, 118, 255, 0.04, 0, two); g.fillStyle = C.back; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 10; g.stroke();
  const bg = g.createLinearGradient(0, 250, 0, 420); bg.addColorStop(0, C.breast); bg.addColorStop(1, C.belly);
  g.save(); g.beginPath(); g.ellipse(250, 480, 113, 250, 0.04, 0, two); g.clip(); g.beginPath(); g.ellipse(330, 510, 80, 230, 0.02, 0, two); g.fillStyle = bg; g.fill(); g.restore();
  if (o.medal) { E(g, 330, 420, 28, 28, 0, GOLD, 6, C.ink); star(g, 330, 420, 16, "#fff4b0", 3); }
  if (o.stars) { R(g, 190, 300, 90, 28, 10, GOLD, 5, C.ink); for (let i = 0; i < o.stars; i++) star(g, 215 + i * 34, 314, 13, "#ffffff", 3); }
  flipper(g, C, 230, 330, 1, 0.25 + sw * 0.22 + (o.flap ? 1.6 : 0), 205, { chev: o.chev, crown: o.crown });
  // head
  E(g, 268, 205, 92, 88, 0, C.head, 10, C.ink);
  g.beginPath(); g.ellipse(250, 262, 26, 46, -0.3, 0, two); g.fillStyle = C.patch; g.fill();
  const f = o.face || "neutral";
  if (f === "happy" || f === "proud") { g.beginPath(); g.arc(300, 196, 17, Math.PI * 1.1, Math.PI * 1.9); g.strokeStyle = C.eye; g.lineWidth = 8; g.stroke(); }
  else { const big = f === "shock" ? 1.35 : 1; E(g, 300, 190, 18 * big, 21 * big, 0, C.eye, 5, C.ink); E(g, 306, 194, 8 * big, 9 * big, 0, C.ink, 0); }
  if (f === "stern" || f === "proud") line(g, [[280, 160], [322, 168]], C.eye, 7);
  poly(g, [[330, 196], [346, 222], [470, 252], [338, 238]], C.beak, 7, C.ink); line(g, [[360, 236], [440, 248]], C.stripe, 7);
  g.restore();
}

export function drawFlagNO(g, k = 0) { g.clearRect(0, 0, 768, 384); const W = 768, H = 384;
  for (let x = 0; x < W; x += 8) { const y = Math.sin(x / 90 - k * two) * 16 * (x / W), sh = 1 - 0.18 * Math.cos(x / 90 - k * two) * (x / W);
    const col = (yy) => { const cx = x > 210 && x < 330, cy = yy > 150 && yy < 234, wx = x > 180 && x < 360, wy = yy > 120 && yy < 264; return cx || cy ? "#1c3a8a" : wx || wy ? "#ffffff" : "#c8202e"; };
    for (let yy = 20; yy < H - 20; yy += 8) { g.fillStyle = col(yy); g.globalAlpha = 1; g.fillRect(x, yy + y, 8.5, 8.5); }
    g.fillStyle = `rgba(0,0,0,${(1 - sh) * 1.2})`; g.fillRect(x, 20 + y, 8.5, H - 40); }
  g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(2, 18, 4, H - 36); }

export function drawFlagSC(g, k = 0) { g.clearRect(0, 0, 768, 384); const W = 768, H = 384;
  for (let x = 0; x < W; x += 8) { const y = Math.sin(x / 90 - k * two) * 16 * (x / W);
    for (let yy = 20; yy < H - 20; yy += 8) { const u = x / W, v = (yy - 20) / (H - 40), d1 = Math.abs(v - u), d2 = Math.abs(v - (1 - u)); g.fillStyle = d1 < 0.09 || d2 < 0.09 ? "#ffffff" : "#1a5ab8"; g.fillRect(x, yy + y, 8.5, 8.5); } } }

export function drawSword(g, glint = 0) { g.clearRect(0, 0, 768, 128);
  poly(g, [[200, 50], [720, 56], [750, 64], [720, 72], [200, 78]], "#dfe4ec", 6); line(g, [[210, 64], [720, 64]], "#a8b0bc", 4);
  R(g, 170, 14, 34, 100, 10, GOLD, 6); R(g, 40, 48, 134, 32, 14, "#7a3a1a", 6); E(g, 34, 64, 26, 26, 0, GOLD, 6);
  if (glint) { const x = 220 + glint * 500; g.save(); g.globalAlpha = 0.9; poly(g, [[x, 20], [x + 8, 56], [x + 44, 64], [x + 8, 72], [x, 108], [x - 8, 72], [x - 44, 64], [x - 8, 56]], "#ffffff", 0); g.restore(); } }

// royal citation scroll, 512 x 768; u = unrolled fraction
export function drawScroll(g, u = 1, text = true) { g.clearRect(0, 0, 512, 768); const h = 90 + u * 560;
  R(g, 70, 60, 372, h, 6, "#f8ecc8", 8); for (let i = 0; i < 3; i++) line(g, [[90, 90 + i * 4], [422, 90 + i * 4]], "#e8d8a8", 2);
  if (text && u > 0.5) { txt(g, "ROYAL", 256, 150, 54, "Rye", "#8a1a1a", INK, 0, 320); txt(g, "CITATION", 256, 206, 50, "Rye", "#8a1a1a", INK, 0, 320);
    txt(g, "“IN EVERY", 256, 300, 52, "AlfaSlab", "#2a2a36", INK, 0, 330); txt(g, "WAY", 256, 360, 52, "AlfaSlab", "#2a2a36", INK, 0, 330); txt(g, "QUALIFIED”", 256, 420, 52, "AlfaSlab", "#c8202e", INK, 0, 330);
    if (u > 0.9) { E(g, 256, 560, 50, 50, 0, "#c8202e", 6); txt(g, "H", 256, 566, 50, "Rye", "#ffd0d0", INK, 0, 80); } }
  R(g, 50, 30, 412, 44, 22, "#d8c08a", 8); R(g, 50, 40 + h, 412, 44, 22, "#d8c08a", 8); }

// royal letter (top-down on the desk), 768 x 768; st = stamp progress 0..1
export function drawLetter(g, st = 0) { g.clearRect(0, 0, 768, 768); R(g, 90, 40, 588, 688, 10, "#fbf6e8", 10);
  poly(g, [[384, 80], [330, 118], [344, 170], [424, 170], [438, 118]], GOLD, 6); for (const x of [330, 384, 438]) E(g, x, 112, 10, 10, 0, "#c8202e", 4);
  txt(g, "KINGDOM OF NORWAY", 384, 220, 46, "Rye", "#1c3a8a", INK, 0, 520); txt(g, "KNIGHTHOOD FOR:", 384, 300, 44, "AlfaSlab", "#2a2a36", INK, 0, 520);
  txt(g, "NILS OLAV", 384, 380, 80, "AlfaSlab", "#c8202e", INK, 0, 520); txt(g, "(A PENGUIN)", 384, 450, 46, "AlfaSlab", "#5a5a66", INK, 0, 520);
  for (let i = 0; i < 3; i++) line(g, [[170, 520 + i * 36], [600, 520 + i * 36]], "#c8c0b0", 5);
  if (st > 0) { const k = Math.min(1, st * 1.6), s = 1.6 - 0.6 * k; g.save(); g.translate(400, 600); g.rotate(-0.2); g.scale(s, s); g.globalAlpha = Math.min(1, st * 2.5);
    R(g, -200, -56, 400, 112, 14, null, 14, "#2a8a3a"); txt(g, "APPROVED", 0, 8, 90, "Bangers", "#2a8a3a", INK, 0, 380); g.restore(); } }

// adoption certificate (top-down), 768 x 768; n = flipper prints 0..1
export function drawAdopt(g, n = 0) { g.clearRect(0, 0, 768, 768); R(g, 70, 70, 628, 628, 14, "#fff8e4", 10); R(g, 96, 96, 576, 576, 8, null, 6, GOLD_D);
  txt(g, "ADOPTED", 384, 190, 96, "Rye", "#1c3a8a", INK, 0, 520); txt(g, "BY THE KING'S GUARD", 384, 270, 40, "AlfaSlab", "#2a2a36", INK, 0, 520);
  txt(g, "1 PENGUIN", 384, 360, 60, "AlfaSlab", "#c8202e", INK, 0, 520);
  if (n > 0) { g.save(); g.translate(470, 520); g.rotate(0.3); g.globalAlpha = Math.min(1, n * 2); g.fillStyle = "#2a2a36"; g.beginPath(); g.ellipse(0, 0, 40, 90, 0, 0, two); g.fill(); g.restore();
    g.save(); g.translate(290, 540); g.globalAlpha = Math.min(1, n * 2); for (const [x, y, r] of [[0, 0, 30], [-34, -40, 12], [0, -50, 12], [34, -40, 12]]) { g.beginPath(); g.ellipse(x, y, r, r * 1.3, 0, 0, two); g.fillStyle = "#2a2a36"; g.fill(); } g.restore(); } }

// framed portrait of Nils the First with a black ribbon, 512 x 640
export function drawPortrait(g) { g.clearRect(0, 0, 512, 640); R(g, 20, 20, 472, 600, 16, "#b8861a", 12); R(g, 56, 56, 400, 480, 6, "#cfe0ea", 8);
  const c = document.createElement("canvas"); c.width = 512; c.height = 768; drawPenguin(c.getContext("2d"), { face: "proud", pose: "proud", chev: 3 }); g.drawImage(c, 76, 66, 360, 540 * 0.86);
  R(g, 120, 548, 272, 54, 8, "#fff4d8", 6); txt(g, "NILS I", 256, 580, 44, "Rye", "#2a2a36", INK, 0, 240);
  poly(g, [[392, 20], [492, 20], [492, 120]], "#16161c", 6); }

// egg, 256 x 320: k wobble, crack 0..1, chev (tiny rank sticker)
export function drawEgg(g, o = {}) { g.clearRect(0, 0, 256, 320); g.save(); g.translate(128, 300); g.rotate(Math.sin((o.k || 0) * two) * 0.12); g.translate(-128, -300);
  g.beginPath(); g.moveTo(128, 30); g.bezierCurveTo(230, 40, 240, 290, 128, 292); g.bezierCurveTo(16, 290, 26, 40, 128, 30); g.fillStyle = "#f6f0e0"; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  E(g, 92, 110, 18, 34, 0.3, "#ffffff", 0);
  if (o.crack) line(g, [[70, 150], [100, 170], [116, 140], [140, 172], [160, 146], [190, 168]].slice(0, 2 + Math.round(o.crack * 4)), INK, 6);
  if (o.chev) { R(g, 100, 200, 56, 50, 8, "#c8202e", 5); line(g, [[110, 236], [128, 220], [146, 236]], GOLD, 6); }
  g.restore(); }

// promotion paperwork stack (top-down), 768 x 768; n sheets visible, stamp k
export function drawPapers(g, n = 1, st = 0) { g.clearRect(0, 0, 768, 768);
  for (let i = 0; i < Math.min(n, 9); i++) { g.save(); g.translate(384 + (hh(i, 3) - 0.5) * 60, 384 + (hh(i, 4) - 0.5) * 50); g.rotate((hh(i, 5) - 0.5) * 0.5); R(g, -230, -290, 460, 580, 8, "#ffffff", 8);
    txt(g, "PROMOTION", 0, -200, 64, "AlfaSlab", "#1c3a8a", INK, 0, 400); txt(g, "FORM", 0, -130, 54, "AlfaSlab", "#1c3a8a", INK, 0, 400);
    txt(g, "NAME: BABY NILS", 0, -40, 40, "AlfaSlab", "#2a2a36", INK, 0, 420); txt(g, "SPECIES: PENGUIN", 0, 20, 40, "AlfaSlab", "#2a2a36", INK, 0, 420);
    for (let j = 0; j < 3; j++) line(g, [[-170, 90 + j * 44], [170, 90 + j * 44]], "#c8ccd4", 5); g.restore(); }
  if (st > 0) { g.save(); g.translate(400, 560); g.rotate(-0.25); g.globalAlpha = Math.min(1, st * 2.5); const s = 1.6 - 0.6 * Math.min(1, st * 1.6); g.scale(s, s); R(g, -190, -54, 380, 108, 14, null, 14, "#c8202e"); txt(g, "URGENT", 0, 8, 90, "Bangers", "#c8202e", INK, 0, 360); g.restore(); } }

// photo of the old Nils held up for comparison, 384 x 320
export function drawPhoto(g) { g.clearRect(0, 0, 384, 320); R(g, 14, 14, 356, 292, 6, "#ffffff", 8); R(g, 34, 34, 316, 220, 2, "#cfe0ea", 4);
  const c = document.createElement("canvas"); c.width = 512; c.height = 768; drawPenguin(c.getContext("2d"), { face: "neutral" }); g.drawImage(c, 122, 40, 140, 210);
  txt(g, "NILS (OLD)", 192, 282, 34, "Bangers", "#2a2a36", INK, 0, 320); }

// stone plaque, 1024 x 256
export function drawPlaque(g, a, b = "") { g.clearRect(0, 0, 1024, 256); R(g, 10, 10, 1004, 236, 18, "#3a3a40", 10); R(g, 34, 34, 956, 188, 10, null, 5, GOLD_D);
  txt(g, a, 512, b ? 104 : 132, 96, "Rye", GOLD, INK, 0, 900); if (b) txt(g, b, 512, 190, 56, "Rye", "#e8d8a8", INK, 0, 900); }

// rank board "chevrons" (stand-alone, for the promotion beats), 512 x 512: n chevrons, crown, stars
export function drawRank(g, o = {}) { g.clearRect(0, 0, 512, 512); R(g, 96, 40, 320, 432, 40, "#c8202e", 12);
  for (let i = 0; i < (o.n || 0); i++) line(g, [[150, 170 + i * 70], [256, 100 + i * 70], [362, 170 + i * 70]], GOLD, 30);
  if (o.crown) poly(g, [[170, 420], [170, 330], [212, 372], [256, 300], [300, 372], [342, 330], [342, 420]], GOLD, 8);
  if (o.stars) for (let i = 0; i < o.stars; i++) star(g, 256, o.stars === 1 ? 256 : 170 + i * 172, 80, GOLD, 9); }
