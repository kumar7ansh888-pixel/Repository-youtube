// Canvas drawings for "A Dog Won an Election Against Two Humans" (Bosco Ramos, honorary mayor of Sunol, California, 1981-1994).
import { INK } from "../lib/toon.js";
const two = Math.PI * 2;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
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
export const heart = (g, x, y, s, col = "#ff4a6a") => { g.save(); g.translate(x, y); g.scale(s / 100, s / 100); g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-60, -10, -50, -70, 0, -40); g.bezierCurveTo(50, -70, 60, -10, 0, 30); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.restore(); };

// ---------------- Bosco: black Lab x Rottweiler, side view facing right, 768 x 512, feet on y 490 ----------------
// o: pose (stand | sit | lie | belly), face (happy, proud, shock, sleep, bored, cool, love, sly, sad, look_up), k (walk frame 0..7, -1 still),
//    wag (tail angle -1..1), sash (MAYOR sash), bronze (statue palette), flip (face left), tongue (bool, default by face)
export function drawDog(g, o = {}) {
  if (!o.keep) g.clearRect(0, 0, 768, 512); g.save(); g.lineJoin = "round"; g.lineCap = "round";
  if (o.flip) { g.translate(768, 0); g.scale(-1, 1); }
  const B = !!o.bronze, C = B ? "#9a6a34" : "#24222a", CD = B ? "#6a4420" : "#16141a", TAN = B ? "#c8985a" : "#b8743a", HL = B ? "rgba(255,230,170,0.5)" : "rgba(150,160,200,0.35)";
  const pose = o.pose ?? "stand", k = o.k ?? -1, face = o.face ?? "happy", wag = o.wag ?? 0;
  let hx = 585, hy = 165, bx = 360, by = 270, brx = 200, bry = 88, bodyRot = 0, tailBase = [175, 240];
  if (pose === "sit") { hx = 500; hy = 140; bx = 400; by = 335; brx = 140; bry = 135; bodyRot = -0.35; tailBase = [290, 460]; }
  if (pose === "lie") { hx = 600; hy = 330; bx = 370; by = 410; brx = 215; bry = 72; tailBase = [165, 420]; }
  if (pose === "belly") { hx = 610; hy = 380; bx = 370; by = 380; brx = 205; bry = 85; tailBase = [170, 400]; }
  // tail
  const ta = -0.9 + wag * 0.6, tl = 150, tx = tailBase[0] + Math.cos(Math.PI + ta) * tl, ty = tailBase[1] + Math.sin(Math.PI + ta) * tl;
  const tailPath = () => { g.beginPath(); g.moveTo(...tailBase); g.quadraticCurveTo(tailBase[0] - 70, tailBase[1] - 10, tx, ty); };
  tailPath(); g.strokeStyle = INK; g.lineWidth = 38; g.stroke(); tailPath(); g.strokeStyle = C; g.lineWidth = 24; g.stroke();
  // legs
  const leg = (x, y, rot, near, len = 150) => { g.save(); g.translate(x, y); g.rotate(rot); R(g, -26, 0, 52, len, 24, near ? C : CD, 8); E(g, 6, len - 6, 34, 17, 0, TAN, 7); g.restore(); };
  if (pose === "stand") { [[255, 0], [300, Math.PI], [445, Math.PI], [495, 0]].forEach(([x, ph], i) => { const s = k >= 0 ? Math.sin((k / 8) * two + ph) : 0; leg(x, 300, s * 0.38, i % 2 === 1, 190); }); }
  else if (pose === "sit") { leg(450, 360, 0, false, 130); leg(505, 360, 0, true, 130); E(g, 330, 450, 90, 48, 0, C, 8); E(g, 400, 480, 50, 16, 0, TAN, 7); }
  else if (pose === "lie") { E(g, 640, 470, 62, 20, 0, TAN, 7); E(g, 560, 476, 62, 20, 0, TAN, 7); E(g, 230, 470, 70, 26, 0, CD, 7); }
  else if (pose === "belly") { const s = Math.sin((o.kk ?? 0) * 1.3) * 0.15; leg(300, 330, Math.PI + 0.25 + s, false, 140); leg(250, 340, Math.PI - 0.2 - s, true, 140); leg(470, 330, Math.PI + 0.3 - s, false, 130); leg(520, 340, Math.PI - 0.25 + s, true, 130); }
  // body
  E(g, bx, by, brx, bry, bodyRot, C, 11);
  g.save(); g.beginPath(); g.ellipse(bx, by, brx - 6, bry - 6, bodyRot, 0, two); g.clip();
  if (pose === "belly") { E(g, bx, by - bry * 0.35, brx * 0.75, bry * 0.5, 0, TAN, 0); } else { E(g, bx + brx * 0.7, by + bry * 0.3, brx * 0.35, bry * 0.55, 0, TAN, 0); }
  E(g, bx - brx * 0.1, by - bry * 0.55, brx * 0.7, bry * 0.22, bodyRot, HL, 0);
  g.restore();
  // sash: red / white / blue band across the body with MAYOR
  if (o.sash && pose !== "belly") { g.save(); g.beginPath(); g.ellipse(bx, by, brx - 4, bry - 4, bodyRot, 0, two); g.clip(); g.translate(bx + (pose === "sit" ? 10 : 40), by); g.rotate(pose === "sit" ? -0.9 : -1.15);
    R(g, -500, -42, 1000, 84, 0, "#c8202e", 6); g.fillStyle = "#ffffff"; g.fillRect(-500, -16, 1000, 32); g.fillStyle = "#1c3a8a"; g.fillRect(-500, -8, 1000, 16);
    g.restore(); g.save(); g.translate(bx + (pose === "sit" ? 10 : 40), by); g.rotate(pose === "sit" ? -0.9 : -1.15); R(g, -88, -36, 176, 72, 14, "#fff4c0", 6); txt(g, "MAYOR", 0, 3, 50, "Bangers", "#c8202e", INK, 0, 160); g.restore(); }
  // head
  g.save(); if (pose === "belly") { g.translate(hx, hy); g.rotate(0.5); g.translate(-hx, -hy); }
  if (o.chinUp) { g.translate(hx, hy); g.rotate(-0.18); g.translate(-hx, -hy); }
  // far ear
  g.beginPath(); g.moveTo(hx - 10, hy - 70); g.quadraticCurveTo(hx + 40, hy - 90, hx + 30, hy - 30); g.lineTo(hx + 10, hy - 50); g.closePath(); g.fillStyle = CD; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  E(g, hx, hy, 98, 84, 0, C, 11);
  // muzzle
  g.beginPath(); g.ellipse(hx + 92, hy + 30, 70, 46, 0.05, 0, two); g.fillStyle = TAN; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  E(g, hx + 150, hy + 10, 22, 17, 0, "#0c0a10", 6); E(g, hx + 145, hy + 4, 7, 4, 0, "rgba(255,255,255,0.6)", 0);
  // tan eyebrow dots
  E(g, hx + 18, hy - 50, 15, 9, 0.2, TAN, 0); E(g, hx + 68, hy - 48, 13, 8, -0.2, TAN, 0);
  const ex1 = hx + 18, ex2 = hx + 66, ey = hy - 22;
  if (face === "happy" || face === "proud") { for (const x of [ex1, ex2]) line(g, [[x - 15, ey + 5], [x, ey - 9], [x + 15, ey + 5]], INK, 8); }
  else if (face === "sleep") { for (const x of [ex1, ex2]) line(g, [[x - 15, ey], [x, ey + 7], [x + 15, ey]], INK, 7); }
  else if (face === "shock") { for (const x of [ex1, ex2]) { E(g, x, ey - 4, 22, 27, 0, "#ffffff", 6); E(g, x + 4, ey - 2, 6, 6, 0, INK, 0); } }
  else if (face === "love") { for (const x of [ex1, ex2]) heart(g, x, ey, 34); }
  else { for (const x of [ex1, ex2]) { E(g, x, ey, 18, 21, 0, "#ffffff", 6); const lx = face === "look_up" ? 2 : face === "sly" ? 6 : 5, ly = face === "look_up" ? -8 : 2; E(g, x + lx, ey + ly, 9, 12, 0, "#3a2414", 0); E(g, x + lx + 3, ey + ly - 4, 4, 4, 0, "#ffffff", 0); }
    if (face === "bored" || face === "sly" || face === "cool") { g.fillStyle = C; for (const x of [ex1, ex2]) { g.fillRect(x - 23, ey - 26, 46, face === "bored" ? 26 : 20); line(g, [[x - 21, ey - (face === "bored" ? 0 : 6)], [x + 21, ey - (face === "bored" ? 0 : 6)]], INK, 7); } }
    if (face === "sad") { line(g, [[ex1 - 18, ey - 26], [ex1 + 14, ey - 34]], INK, 7); line(g, [[ex2 + 18, ey - 26], [ex2 - 14, ey - 34]], INK, 7); } }
  if (o.shades) { R(g, ex1 - 28, ey - 20, 56, 38, 12, "#111118", 0); R(g, ex2 - 28, ey - 20, 56, 38, 12, "#111118", 0); line(g, [[ex1 + 28, ey - 6], [ex2 - 28, ey - 6]], "#111118", 7); line(g, [[ex1 - 28, ey - 6], [hx - 70, ey - 12]], "#111118", 6);
    g.globalAlpha = 0.5; line(g, [[ex1 - 16, ey - 10], [ex1 - 2, ey - 14]], "#ffffff", 5); line(g, [[ex2 - 16, ey - 10], [ex2 - 2, ey - 14]], "#ffffff", 5); g.globalAlpha = 1; }
  // mouth
  const tongue = o.tongue ?? (face === "happy" || face === "love");
  if (face === "shock") E(g, hx + 100, hy + 62, 18, 20, 0, "#5a1a2a", 6);
  else if (face === "sleep" || face === "bored" || face === "cool") line(g, [[hx + 70, hy + 56], [hx + 130, hy + 50]], INK, 6);
  else if (face === "sad") { g.beginPath(); g.arc(hx + 100, hy + 70, 20, 1.15 * Math.PI, 1.85 * Math.PI); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); }
  else { g.beginPath(); g.moveTo(hx + 60, hy + 46); g.quadraticCurveTo(hx + 100, hy + 78, hx + 140, hy + 40); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
    if (tongue) { g.beginPath(); g.moveTo(hx + 80, hy + 60); g.quadraticCurveTo(hx + 78, hy + 120, hx + 102, hy + 118); g.quadraticCurveTo(hx + 124, hy + 116, hx + 116, hy + 62); g.closePath(); g.fillStyle = B ? "#b8844a" : "#f47a90"; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); line(g, [[hx + 99, hy + 70], [hx + 100, hy + 100]], B ? "#8a5a2a" : "#c84a60", 4); } }
  // near ear (floppy)
  const ef = o.earFlap ?? 0;
  g.beginPath(); g.moveTo(hx - 50, hy - 62); g.quadraticCurveTo(hx - 110 - ef * 30, hy - 20 - ef * 40, hx - 82 - ef * 40, hy + 52 - ef * 70); g.quadraticCurveTo(hx - 50, hy + 50 - ef * 40, hx - 20, hy - 40); g.closePath(); g.fillStyle = CD; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  g.restore();
  g.restore();
}

// ---------------- walls (1024 x 1024 = 14 x 14 m card, eye level = rows ~880-940; keep details in the bottom ~15 %) ----------------
const storefront = (g, x, w, col, sign, sc = "#ffffff") => { R(g, x, 700, w, 330, 0, col, 6); R(g, x + 12, 820, w - 24, 46, 6, "#3a2a1a", 5); txt(g, sign, x + w / 2, 844, 30, "AlfaSlab", sc, INK, 0, w - 40);
  R(g, x + 20, 890, (w - 60) / 2, 134, 4, "#9ad0ea", 6); R(g, x + 40 + (w - 60) / 2, 900, (w - 60) / 2, 124, 4, "#6a4a2a", 6); for (let i = 0; i < 6; i++) poly(g, [[x + 12 + i * (w - 24) / 6, 866], [x + 12 + (i + 1) * (w - 24) / 6, 866], [x + 12 + (i + 0.5) * (w - 24) / 6, 884]], i % 2 ? "#ffffff" : col, 3); };
export function drawWall(g, kind, k = 0) {
  g.clearRect(0, 0, 1024, 1024); g.lineJoin = "round";
  if (kind === "street" || kind === "bar" || kind === "plaza" || kind === "dusk") {
    const dusk = kind === "dusk"; sky(g, dusk ? "#3a2a6a" : "#5aa8e8", dusk ? "#ff9a5a" : "#d8f0ff", 1024);
    for (let i = 0; i < 6; i++) { const x = ((i * 200 + k * 20) % 1180) - 80, y = 560 + (i % 3) * 50; E(g, x, y, 70, 22, 0, dusk ? "rgba(255,190,160,0.6)" : "rgba(255,255,255,0.85)", 0); E(g, x + 40, y - 14, 44, 22, 0, dusk ? "rgba(255,190,160,0.6)" : "rgba(255,255,255,0.85)", 0); }
    poly(g, [[0, 760], [180, 640], [360, 720], [560, 620], [800, 700], [1024, 640], [1024, 800], [0, 800]], dusk ? "#5a4a7a" : "#9ac07a", 0);
    if (kind === "street") { storefront(g, 20, 300, "#e8c87a", "GENERAL STORE"); storefront(g, 350, 320, "#c8705a", "SUNOL CAFE"); storefront(g, 700, 300, "#7aa8c8", "POST OFFICE"); }
    else if (kind === "bar") { R(g, 120, 690, 784, 340, 0, "#8a5a32", 8); for (let x = 140; x < 900; x += 40) line(g, [[x, 700], [x, 1024]], "rgba(0,0,0,0.12)", 4); R(g, 300, 700, 424, 90, 12, "#2a1a10", 8); txt(g, "BAR", 512, 748, 80, "Rye", "#ffd25a", INK, 0, 400);
      R(g, 160, 860, 200, 140, 4, "#ffd890", 6); R(g, 664, 860, 200, 140, 4, "#ffd890", 6); R(g, 420, 840, 184, 184, 4, "#4a2a14", 6); line(g, [[512, 840], [512, 1024]], INK, 6); }
    else if (kind === "plaza") { storefront(g, 60, 420, "#7aa8c8", "POST OFFICE"); storefront(g, 540, 420, "#e8c87a", "SUNOL"); }
    else if (kind === "dusk") { storefront(g, 20, 300, "#8a6a5a", "GENERAL STORE"); storefront(g, 350, 320, "#7a4a4a", "SUNOL CAFE"); storefront(g, 700, 300, "#4a5a7a", "POST OFFICE"); g.fillStyle = "rgba(40,20,60,0.35)"; g.fillRect(0, 690, 1024, 334);
      for (let i = 0; i < 12; i++) { const ph = (k * 0.7 + hh(i, 3)) % 1; E(g, hh(i, 1) * 1024, 80 + hh(i, 2) * 500, 4, 4, 0, `rgba(255,255,240,${0.4 + 0.6 * Math.abs(Math.sin(ph * 6.3))})`, 0); } } }
  else if (kind === "hall") { g.fillStyle = "#7a2a3a"; g.fillRect(0, 0, 1024, 1024); for (let x = 0; x < 1024; x += 64) R(g, x, 0, 30, 1024, 0, "rgba(0,0,0,0.12)", 0);
    for (let i = 0; i < 12; i++) poly(g, [[i * 86, 690], [(i + 1) * 86, 690], [(i + 0.5) * 86, 760]], ["#c8202e", "#ffffff", "#1c3a8a"][i % 3], 4); line(g, [[0, 690], [1024, 690]], INK, 6);
    R(g, 300, 770, 424, 90, 14, "#fff4c0", 8); txt(g, "ELECTION DAY", 512, 816, 62, "AlfaSlab", "#1c3a8a", INK, 0, 400);
    g.fillStyle = "#4a1a24"; g.fillRect(0, 960, 1024, 64); }
  else if (kind === "news") { g.fillStyle = "#d8d4c8"; g.fillRect(0, 0, 1024, 1024); for (let y = 0; y < 1024; y += 48) line(g, [[0, y], [1024, y]], "rgba(0,0,0,0.05)", 3);
    for (let i = 0; i < 5; i++) { const x = 40 + i * 200; R(g, x, 760, 160, 210, 6, "#f8f6ee", 6); R(g, x + 14, 776, 132, 26, 2, "#2a2a30", 0); for (let j = 0; j < 7; j++) line(g, [[x + 16, 820 + j * 20], [x + 144 - hh(i * 9 + j, 2) * 40, 820 + j * 20]], "#8a8a90", 5); }
    g.fillStyle = "#6a6a72"; g.fillRect(0, 985, 1024, 39); }
  else if (kind === "press") { g.fillStyle = "#3a3e48"; g.fillRect(0, 0, 1024, 1024); for (let i = 0; i < 4; i++) { const x = 60 + i * 250, a = k * 6 + i; E(g, x + 60, 880, 70, 70, 0, "#6a707a", 10); line(g, [[x + 60, 880], [x + 60 + Math.cos(a) * 60, 880 + Math.sin(a) * 60]], INK, 10); line(g, [[x + 60, 880], [x + 60 - Math.cos(a) * 60, 880 - Math.sin(a) * 60]], INK, 10); E(g, x + 60, 880, 16, 16, 0, "#c8a040", 5); }
    g.fillStyle = "#2a2e36"; g.fillRect(0, 960, 1024, 64); }
  else if (kind === "drama") { g.fillStyle = "#1a0c14"; g.fillRect(0, 0, 1024, 1024); const pulse = 0.5 + 0.5 * Math.sin(k * 6);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * two + k * 0.4; g.fillStyle = i % 2 ? `rgba(200,30,40,${0.35 + 0.2 * pulse})` : "rgba(60,10,20,0.6)"; g.beginPath(); g.moveTo(512, 860); g.arc(512, 860, 1400, a, a + two / 14); g.closePath(); g.fill(); }
    const gr = g.createRadialGradient(512, 860, 20, 512, 860, 400); gr.addColorStop(0, "rgba(255,120,90,0.6)"); gr.addColorStop(1, "rgba(255,60,40,0)"); g.fillStyle = gr; g.fillRect(0, 400, 1024, 624); }
  else if (kind === "park") { sky(g, "#5aa8e8", "#d8f0ff", 1024); poly(g, [[0, 800], [300, 700], [600, 780], [1024, 690], [1024, 1024], [0, 1024]], "#7ab05a", 0); for (let i = 0; i < 5; i++) { const x = 100 + i * 210; R(g, x - 14, 860, 28, 120, 6, "#6a4a2a", 5); E(g, x, 830, 70, 60, 0, "#4a8a3a", 6); } }
}
export const FLOOR = { street: "#b8a890", bar: "#a89070", plaza: "#c8c0b0", dusk: "#6a5a6a", hall: "#6a4a32", news: "#9a9a9a", press: "#4a4e56", drama: "#2a1018", park: "#6aa04a" };
export function drawFloor(g, col, kind) { g.clearRect(0, 0, 512, 512); g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  if (kind === "street" || kind === "bar" || kind === "plaza" || kind === "dusk") for (let y = 0; y < 512; y += 64) for (let x = (y / 64) % 2 ? 0 : 32; x < 512; x += 64) R(g, x, y, 60, 60, 4, null, 3, "rgba(0,0,0,0.12)");
  if (kind === "hall") for (let y = 0; y < 512; y += 40) line(g, [[0, y], [512, y]], "rgba(0,0,0,0.16)", 3);
  if (kind === "park") for (let i = 0; i < 80; i++) line(g, [[hh(i, 1) * 512, hh(i, 2) * 512], [hh(i, 1) * 512 + 4, hh(i, 2) * 512 - 12]], "rgba(30,80,20,0.4)", 3); }

// ---------------- props ----------------
export function drawPodium(g, s = "VOTE!") { g.clearRect(0, 0, 512, 640); poly(g, [[60, 60], [452, 60], [410, 630], [102, 630]], "#6a4a32", 10); R(g, 30, 30, 452, 60, 10, "#7a5638", 10);
  R(g, 110, 200, 292, 150, 14, "#fff4c0", 8); txt(g, s, 256, 278, 96, "Bangers", "#c8202e", INK, 0, 260); line(g, [[256, 30], [300, -40]], INK, 10); }
export function drawPoster(g, a = "VOTE", b = "BOSCO", col = "#c8202e") { g.clearRect(0, 0, 512, 768); R(g, 14, 14, 484, 740, 20, "#fff4c0", 12); for (let i = 0; i < 3; i++) { g.fillStyle = ["#c8202e", "#ffffff", "#1c3a8a"][i]; g.fillRect(30, 30 + i * 20, 452, 20); }
  txt(g, a, 256, 170, 120, "Bangers", "#1c3a8a", INK, 0, 420); drawDogHead(g, 256, 400, 1.1); txt(g, b, 256, 650, 150, "Bangers", col, INK, 10, 440); }
export function drawDogHead(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); E(g, -80, -10, 40, 80, 0.3, "#16141a", 8); E(g, 80, -10, 40, 80, -0.3, "#16141a", 8); E(g, 0, 0, 100, 95, 0, "#24222a", 10); E(g, 0, 50, 56, 40, 0, "#b8743a", 8); E(g, 0, 26, 22, 16, 0, "#0c0a10", 0);
  E(g, -36, -20, 14, 16, 0, "#ffffff", 5); E(g, 36, -20, 14, 16, 0, "#ffffff", 5); E(g, -34, -18, 7, 9, 0, "#3a2414", 0); E(g, 38, -18, 7, 9, 0, "#3a2414", 0); E(g, -36, -48, 12, 7, 0, "#b8743a", 0); E(g, 36, -48, 12, 7, 0, "#b8743a", 0);
  g.beginPath(); g.moveTo(-30, 60); g.quadraticCurveTo(0, 82, 30, 60); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.restore(); }
export function drawBone(g, rot = 0) { g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); g.rotate(rot); R(g, -150, -30, 300, 60, 26, "#fbf3dc", 9); for (const sx of [-1, 1]) for (const sy of [-1, 1]) E(g, sx * 160, sy * 34, 46, 46, 0, "#fbf3dc", 9); R(g, -140, -22, 280, 44, 20, "#fbf3dc", 0); g.restore(); }
export function drawDish(g, full = true) { g.clearRect(0, 0, 512, 384); if (full) { g.save(); g.translate(256, 170); g.rotate(-0.15); R(g, -150, -26, 300, 52, 24, "#fbf3dc", 9); for (const sx of [-1, 1]) for (const sy of [-1, 1]) E(g, sx * 158, sy * 30, 40, 40, 0, "#fbf3dc", 9); R(g, -140, -20, 280, 40, 18, "#fbf3dc", 0); g.restore(); }
  poly(g, [[40, 210], [472, 210], [420, 340], [92, 340]], "#c8202e", 10); E(g, 256, 210, 216, 30, 0, "#e8404a", 10); txt(g, "BOSCO", 256, 285, 60, "Bangers", "#ffffff", INK, 6, 260); }
export function drawTree(g, catFace = "shock", k = 0) { g.clearRect(0, 0, 768, 1024); R(g, 330, 560, 110, 460, 20, "#7a5232", 10); line(g, [[385, 640], [560, 500]], "#7a5232", 40); line(g, [[385, 640], [560, 500]], INK, 0);
  for (const [x, y, r] of [[384, 330, 260], [200, 420, 160], [570, 420, 170], [384, 160, 170]]) E(g, x, y, r, r * 0.8, 0, "#4a9a3a", 10); for (let i = 0; i < 14; i++) E(g, 150 + hh(i, 1) * 470, 150 + hh(i, 2) * 380, 30, 22, 0, "#5ab04a", 0);
  // the cat on the branch
  const cx = 540, cy = 470 + Math.sin(k * 8) * 4; E(g, cx, cy, 80, 46, 0, "#e8903a", 8); for (let i = 0; i < 3; i++) line(g, [[cx - 40 + i * 30, cy - 40], [cx - 50 + i * 30, cy - 10]], "#b8602a", 10);
  g.beginPath(); g.moveTo(cx - 70, cy); g.quadraticCurveTo(cx - 140, cy + 40, cx - 120, cy + 120 + Math.sin(k * 10) * 10); g.strokeStyle = INK; g.lineWidth = 26; g.stroke(); g.strokeStyle = "#e8903a"; g.lineWidth = 14; g.stroke();
  const hx = cx + 70, hy = cy - 50; poly(g, [[hx - 50, hy - 20], [hx - 44, hy - 90], [hx - 4, hy - 46]], "#e8903a", 8); poly(g, [[hx + 6, hy - 48], [hx + 44, hy - 92], [hx + 52, hy - 20]], "#e8903a", 8); E(g, hx, hy, 60, 52, 0, "#e8903a", 9);
  if (catFace === "shock") { for (const x of [hx - 20, hx + 22]) { E(g, x, hy - 6, 15, 19, 0, "#ffffff", 5); E(g, x, hy - 4, 4, 4, 0, INK, 0); } E(g, hx, hy + 26, 9, 12, 0, "#7a2a3a", 5); line(g, [[hx - 50, hy - 76], [hx - 70, hy - 100]], INK, 5); line(g, [[hx + 50, hy - 76], [hx + 70, hy - 100]], INK, 5); }
  else { for (const x of [hx - 20, hx + 22]) line(g, [[x - 12, hy - 2], [x + 12, hy - 8]], INK, 6); line(g, [[hx - 12, hy + 28], [hx + 12, hy + 28]], INK, 5); }
  E(g, hx, hy + 12, 7, 5, 0, "#f4a0b0", 0); }
export function drawHydrant(g, shine = 0) { g.clearRect(0, 0, 384, 512); R(g, 92, 150, 200, 320, 30, "#e8303a", 10); R(g, 60, 440, 264, 56, 12, "#c8202e", 10); E(g, 192, 150, 110, 50, 0, "#e8303a", 10); poly(g, [[160, 70], [224, 70], [240, 110], [144, 110]], "#c8202e", 9); E(g, 192, 66, 30, 14, 0, "#c8202e", 8);
  R(g, 30, 240, 70, 70, 14, "#c8202e", 9); R(g, 284, 240, 70, 70, 14, "#c8202e", 9); E(g, 192, 300, 50, 50, 0, "#c8202e", 9); E(g, 192, 300, 18, 18, 0, "#ffd23a", 6);
  g.globalAlpha = 0.5 + shine * 0.5; line(g, [[130, 180], [130, 420]], "#ffffff", 14); g.globalAlpha = 1; }
export function drawTally(g, n = 1) { g.clearRect(0, 0, 1024, 768); R(g, 14, 14, 996, 740, 30, "#fbf3dc", 14); txt(g, "VOTES", 512, 80, 80, "Bangers", "#1c3a8a", INK, 0, 600); line(g, [[90, 660], [940, 660]], INK, 8);
  const H = [0.92, 0.22, 0.16]; const L = ["BOSCO", "HUMAN 1", "HUMAN 2"]; const C = ["#7ad04a", "#9aa0b0", "#9aa0b0"];
  for (let i = 0; i < 3; i++) { const x = 140 + i * 280, h = 480 * H[i] * clamp01(n); R(g, x, 660 - h, 200, h, 10, C[i], 8); txt(g, L[i], x + 100, 710, 52, "Bangers", "#2a2a36", INK, 0, 240); }
  if (n >= 1) drawDogHead(g, 240, 660 - 480 * 0.92 - 70, 0.6); }
export function drawNews(g, o = {}) { g.clearRect(0, 0, 768, 1024); R(g, 14, 14, 740, 996, 8, "#f4f0e2", 10); txt(g, "OFFICIAL NEWSPAPER", 384, 80, 64, "AlfaSlab", "#2a2a30", INK, 0, 700); line(g, [[40, 130], [728, 130]], INK, 6); line(g, [[40, 146], [728, 146]], INK, 3);
  txt(g, o.h1 ?? "EDITORIAL", 384, 210, 92, "AlfaSlab", "#c8202e", INK, 0, 690); if (o.h2) txt(g, o.h2, 384, 310, 80, "AlfaSlab", "#2a2a30", INK, 0, 690);
  R(g, 60, 380, 340, 330, 4, "#d8d4c8", 6); drawDogHead(g, 230, 545, 1.15); txt(g, "MAYOR?!", 230, 680, 44, "Bangers", "#c8202e", INK, 0, 300);
  for (let j = 0; j < 14; j++) line(g, [[430, 400 + j * 22], [710 - hh(j, 3) * 60, 400 + j * 22]], "#8a8a90", 6); for (let j = 0; j < 10; j++) line(g, [[60, 760 + j * 24], [710 - hh(j, 5) * 80, 760 + j * 24]], "#8a8a90", 6); }
export function drawTypewriter(g, k = 0, lines = 4) { g.clearRect(0, 0, 768, 768); const sh = (k % 4) * 6;
  R(g, 200 + sh, 40, 360, 380, 4, "#ffffff", 7); txt(g, "EDITORIAL", 380 + sh, 100, 48, "AlfaSlab", "#2a2a30", INK, 0, 300); for (let j = 0; j < lines; j++) line(g, [[230 + sh, 160 + j * 36], [520 + sh - (j === lines - 1 ? 160 - (k % 8) * 18 : hh(j, 2) * 40), 160 + j * 36]], "#2a2a30", 7);
  R(g, 160 + sh, 380, 440, 60, 20, "#3a3a44", 8); R(g, 90, 430, 588, 230, 40, "#2a5a4a", 10); for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) { const down = (k + r * 3 + c) % 7 === 0; E(g, 160 + c * 56 + r * 14, 500 + r * 50 + (down ? 6 : 0), 20, 16, 0, down ? "#c8c4b0" : "#f4f0e2", 5); }
  R(g, 140, 650, 488, 60, 16, "#1a3a30", 8); }
export function drawCal(g, n = 1981) { g.clearRect(0, 0, 512, 640); R(g, 20, 40, 472, 580, 24, "#ffffff", 12); R(g, 20, 40, 472, 150, 24, "#c8202e", 12); for (const x of [140, 372]) R(g, x - 16, 14, 32, 70, 14, "#4a4a56", 7);
  txt(g, "YEAR", 256, 118, 70, "Bangers", "#ffffff", INK, 0, 400); txt(g, String(n), 256, 400, 170, "AlfaSlab", "#2a2a36", INK, 0, 430); }
export function drawPlinth(g, s = "BOSCO") { g.clearRect(0, 0, 512, 512); R(g, 40, 30, 432, 60, 8, "#b8b4ac", 9); R(g, 70, 90, 372, 380, 4, "#d8d4cc", 9); R(g, 30, 460, 452, 50, 8, "#b8b4ac", 9); R(g, 120, 200, 272, 120, 10, "#9a6a34", 7); txt(g, s, 256, 262, 80, "AlfaSlab", "#ffe0a0", INK, 0, 250); }
export function drawSign(g, a, b = "", col = "#c8202e", bg = "#fff4c0") { g.clearRect(0, 0, 768, 512); line(g, [[384, 380], [384, 512]], "#6a4a2a", 30); R(g, 20, 30, 728, 360, 30, bg, 12); txt(g, a, 384, b ? 140 : 210, 130, "Bangers", col, INK, 8, 680); if (b) txt(g, b, 384, 290, 110, "Bangers", "#1c3a8a", INK, 0, 680); }
export function drawCushion(g) { g.clearRect(0, 0, 768, 384); E(g, 384, 260, 340, 100, 0, "#8a2a4a", 10); E(g, 384, 230, 300, 70, 0, "#aa3a5a", 0); for (const x of [60, 708]) E(g, x, 260, 24, 24, 0, "#ffd23a", 6); }
export function drawCoin(g) { g.clearRect(0, 0, 256, 256); E(g, 128, 128, 110, 110, 0, "#ffd23a", 10); E(g, 128, 128, 80, 80, 0, null, 6, "#c89a1a"); txt(g, "$", 128, 134, 120, "AlfaSlab", "#c89a1a", INK, 0); }
// a shocked orange cat clinging to an oak branch (512 x 384), k animates the tail
export function drawCatOnly(g, k = 0) { g.clearRect(0, 0, 512, 384); g.lineJoin = "round"; g.lineCap = "round";
  line(g, [[0, 250], [512, 220]], INK, 44); line(g, [[0, 250], [512, 220]], "#6a4a2e", 30);
  const cx = 250, cy = 205 + Math.sin(k * 8) * 4; g.beginPath(); g.moveTo(cx - 70, cy + 10); g.quadraticCurveTo(cx - 150, cy + 60, cx - 130, cy + 150 + Math.sin(k * 12) * 14); g.strokeStyle = INK; g.lineWidth = 28; g.stroke(); g.strokeStyle = "#e8903a"; g.lineWidth = 16; g.stroke();
  E(g, cx, cy, 95, 52, 0, "#e8903a", 9); for (let i = 0; i < 3; i++) line(g, [[cx - 40 + i * 30, cy - 46], [cx - 50 + i * 30, cy - 12]], "#b8602a", 10);
  for (const lx of [cx - 50, cx + 40]) { R(g, lx - 14, cy + 20, 28, 50, 12, "#e8903a", 7); }
  const hx = cx + 90, hy = cy - 60; poly(g, [[hx - 55, hy - 20], [hx - 48, hy - 100], [hx - 4, hy - 50]], "#e8903a", 8); poly(g, [[hx + 6, hy - 52], [hx + 48, hy - 102], [hx + 56, hy - 20]], "#e8903a", 8); E(g, hx, hy, 66, 56, 0, "#e8903a", 9);
  for (const x of [hx - 22, hx + 24]) { E(g, x, hy - 6, 17, 21, 0, "#ffffff", 5); E(g, x, hy - 4, 5, 5, 0, INK, 0); } E(g, hx, hy + 28, 10, 13, 0, "#7a2a3a", 5); E(g, hx, hy + 12, 7, 5, 0, "#f4a0b0", 0);
  for (const s of [-1, 1]) { line(g, [[hx + s * 54, hy - 90], [hx + s * 76, hy - 116]], INK, 6); } }
