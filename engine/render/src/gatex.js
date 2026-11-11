// Painted textures for "The Ghost Army" (Canvas2D, cached via the skill's ctex). No readable text anywhere:
// posters, maps, stamps, diaries and photos are shapes and squiggles only.
import { ctex, jit } from "../lib/paint.js";

const U = (r, a, b) => a + (b - a) * r();
const blotch = (g, x, y, rad, rgb, a) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
};
const squiggle = (g, x0, y, x1, r, col = "#3a3550", lw = 2, amp = 4) => {
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y);
  for (let x = x0; x < x1; x += 6) g.lineTo(x, y + Math.sin(x * 0.7 + r() * 6) * amp * r());
  g.stroke();
};

/** inflatable rubber, olive drab, with glued seams and a soft sheen */
export const rubberTex = () => ctex("rubber", 512, 512, (g, r) => {
  g.fillStyle = "#64703f"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 120), r() > 0.5 ? "190,200,140" : "40,48,25", U(r, 0.05, 0.1));
  for (const y of [128, 384]) { g.fillStyle = "rgba(30,36,18,0.45)"; g.fillRect(0, y, 512, 4); g.fillStyle = "rgba(220,230,170,0.18)"; g.fillRect(0, y + 4, 512, 3); }
  for (const x of [170, 340]) { g.fillStyle = "rgba(30,36,18,0.35)"; g.fillRect(x, 0, 3, 512); }
});
/** the real thing: painted steel, olive drab with weathering */
export const odSteelTex = () => ctex("odSteel", 512, 512, (g, r) => {
  g.fillStyle = "#4e5634"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 10, 70), r() > 0.6 ? "150,130,90" : "25,28,18", U(r, 0.08, 0.16));
  for (let i = 0; i < 30; i++) { g.fillStyle = "rgba(30,30,25,0.6)"; g.beginPath(); g.arc(U(r, 0, 512), U(r, 0, 512), 3, 0, 7); g.fill(); }
});
export const trackTex = () => ctex("track", 256, 128, (g) => {
  g.fillStyle = "#34342f"; g.fillRect(0, 0, 256, 128);
  for (let x = 0; x < 256; x += 16) { g.fillStyle = "#4a4a42"; g.fillRect(x, 0, 9, 128); }
});
/** tent canvas / truck tilt */
export const canvasTex = (key, base) => ctex("canvas" + key, 256, 256, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 3) { g.fillStyle = `rgba(0,0,0,${(0.03 + 0.04 * Math.abs(Math.sin(x * 0.11))).toFixed(3)})`; g.fillRect(x, 0, 1, 256); }
  for (let i = 0; i < 16; i++) blotch(g, U(r, 0, 256), U(r, 0, 256), U(r, 20, 70), r() > 0.5 ? "255,250,230" : "40,35,20", 0.08);
});
export const sandTex = () => ctex("beachsand", 512, 512, (g, r) => {
  g.fillStyle = "#d9c49a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 50; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 20, 120), r() > 0.5 ? "245,232,200" : "170,145,105", 0.14);
  for (let i = 0; i < 2000; i++) { g.fillStyle = "rgba(120,100,70,0.18)"; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2, 2); }
});
export const fieldTex = (key, base) => ctex("field" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 140), r() > 0.5 ? "230,230,170" : "40,70,30", U(r, 0.05, 0.12));
  for (let i = 0; i < 2500; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,210,0.12)" : "rgba(20,50,20,0.14)"; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2, 3); }
});
export const plasterTex = (key, base) => ctex("plaster" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 40, 150), r() > 0.5 ? "255,255,255" : "90,80,70", 0.06);
});
export const wallpaperTex = () => ctex("wallpaper", 256, 256, (g, r) => {
  g.fillStyle = "#e6d3a8"; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 64) { g.fillStyle = "#d8bf8e"; g.fillRect(x + 28, 0, 8, 256); }
  for (let y = 16; y < 256; y += 64) for (let x = 0; x < 256; x += 64) { g.fillStyle = "#c27a5a"; g.beginPath(); g.arc(x + 12, y, 5, 0, 7); g.fill(); g.fillStyle = "#6f8a5a"; g.beginPath(); g.ellipse(x + 20, y + 4, 6, 3, 0.6, 0, 7); g.fill(); }
});
/** a military map: fields, woods, a river, roads, a few shapes. No lettering */
export const mapTex = () => ctex("map", 1024, 768, (g, r) => {
  g.fillStyle = "#e9e1c4"; g.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? "rgba(140,170,110,0.35)" : "rgba(200,190,140,0.35)"; g.fillRect(U(r, 0, 1024), U(r, 0, 768), U(r, 60, 200), U(r, 40, 150)); }
  for (let i = 0; i < 12; i++) blotch(g, U(r, 0, 1024), U(r, 0, 768), U(r, 40, 90), "70,120,60", 0.45);
  g.strokeStyle = "#5a8fc0"; g.lineWidth = 26; g.beginPath(); g.moveTo(-20, 300); g.bezierCurveTo(300, 200, 500, 480, 1050, 380); g.stroke();
  g.strokeStyle = "#b0503a"; g.lineWidth = 5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(U(r, 0, 1024), 0); g.lineTo(U(r, 0, 1024), 768); g.stroke(); }
  g.strokeStyle = "rgba(60,60,60,0.25)"; g.lineWidth = 1.5; for (let x = 0; x < 1024; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 768); g.stroke(); } for (let y = 0; y < 768; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  g.strokeStyle = "#c0352e"; g.lineWidth = 6; g.beginPath(); g.arc(700, 520, 70, 0, 7); g.stroke();
  g.strokeStyle = "#1f3a7a"; g.lineWidth = 6; g.beginPath(); g.moveTo(200, 560); g.lineTo(330, 470); g.lineTo(310, 500); g.moveTo(330, 470); g.lineTo(300, 465); g.stroke();
});
/** aerial reconnaissance photo of a field full of tanks: black-and-white print with a white border */
export const photoTex = (k = 0) => ctex("photo" + k, 384, 288, (g, r) => {
  g.fillStyle = "#f3f1ea"; g.fillRect(0, 0, 384, 288);
  g.fillStyle = "#7d7f78"; g.fillRect(14, 14, 356, 260);
  for (let i = 0; i < 20; i++) blotch(g, U(r, 14, 370), U(r, 14, 274), U(r, 20, 70), r() > 0.5 ? "170,172,165" : "60,62,58", 0.3);
  g.fillStyle = "#4a4c47"; g.fillRect(14, 180 + k * 10, 356, 10);
  for (let i = 0; i < 14; i++) { const x = 40 + (i % 7) * 46 + U(r, -6, 6), y = 50 + Math.floor(i / 7) * 60 + U(r, -6, 6); g.fillStyle = "#2c2e2a"; g.fillRect(x, y, 26, 14); g.fillRect(x + 8, y + 4, 12, 6); g.fillRect(x + 20, y + 6, 14, 2); g.fillStyle = "rgba(20,20,20,0.35)"; g.fillRect(x + 4, y + 14, 26, 5); }
});
/** a diary page: tiny handwriting (illegible squiggles) */
export const diaryTex = () => ctex("diary", 512, 384, (g, r) => {
  g.fillStyle = "#6a4a2e"; g.fillRect(0, 0, 512, 384);
  g.fillStyle = "#f2ead4"; g.fillRect(16, 12, 236, 360); g.fillRect(260, 12, 236, 360);
  g.fillStyle = "rgba(0,0,0,0.15)"; g.fillRect(250, 12, 12, 360);
  for (const x0 of [30, 274]) for (let y = 34; y < 360; y += 16) squiggle(g, x0, y, x0 + U(r, 150, 205), r, "#3a3a5a", 1.6, 3);
});
/** recruiting notice: a star, a paintbrush and a tank silhouette, no words */
export const posterTex = () => ctex("poster", 384, 512, (g, r) => {
  g.fillStyle = "#efe6cc"; g.fillRect(0, 0, 384, 512);
  g.fillStyle = "#1f3a6a"; g.fillRect(0, 0, 384, 120); g.fillStyle = "#b8322f"; for (let y = 440; y < 512; y += 24) g.fillRect(0, y, 384, 12);
  const star = (cx, cy, R, col) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? R * 0.42 : R; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.fill(); };
  star(192, 62, 46, "#f3efe2");
  g.fillStyle = "#4e5634"; g.fillRect(70, 300, 240, 60); g.fillRect(130, 260, 120, 46); g.fillRect(240, 276, 110, 12);
  g.fillStyle = "#2a2a28"; g.fillRect(60, 356, 260, 26);
  g.save(); g.translate(150, 210); g.rotate(-0.6); g.fillStyle = "#8a5a34"; g.fillRect(-6, -90, 12, 120); g.fillStyle = "#d8b45a"; g.fillRect(-9, -110, 18, 24); g.fillStyle = "#b8322f"; g.beginPath(); g.ellipse(0, -118, 10, 16, 0, 0, 7); g.fill(); g.restore();
  squiggle(g, 60, 410, 320, r, "#1f3a6a", 5, 3);
});
/** abstract studio paintings */
export const paintingTex = (k) => ctex("painting" + k, 256, 320, (g, r) => {
  const P = [["#e8c35a", "#3f6fb5", "#c4473a", "#f2efe6"], ["#7aa35a", "#e8913a", "#2f4f6f", "#f6e7c8"], ["#c25a8a", "#5ab5b0", "#f2d14e", "#2a2a36"]][k % 3];
  g.fillStyle = P[3]; g.fillRect(0, 0, 256, 320);
  for (let i = 0; i < 9; i++) { g.fillStyle = P[i % 3]; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(U(r, 20, 236), U(r, 20, 300), U(r, 20, 70), U(r, 15, 60), U(r, 0, 3), 0, 7); g.fill(); }
  g.globalAlpha = 1; g.strokeStyle = "#5a3a22"; g.lineWidth = 14; g.strokeRect(0, 0, 256, 320);
});
/** hard-edged colour panels (a generic modern painter's canvas) */
export const panelTex = (k) => ctex("panel" + k, 256, 256, (g) => {
  const P = [["#d8322f", "#f3efe6"], ["#1f4fa8", "#f2d14e"], ["#2f8f4f", "#f3efe6"], ["#f2a23a", "#1d1d22"]][k % 4];
  g.fillStyle = P[1]; g.fillRect(0, 0, 256, 256); g.fillStyle = P[0];
  if (k % 4 === 0) { g.beginPath(); g.moveTo(30, 230); g.lineTo(130, 20); g.lineTo(230, 230); g.fill(); }
  else if (k % 4 === 1) g.fillRect(0, 0, 256, 256 * 0.55);
  else if (k % 4 === 2) { g.beginPath(); g.ellipse(128, 128, 100, 70, 0.4, 0, 7); g.fill(); }
  else g.fillRect(40, 40, 176, 176);
});
/** radio set face: dials, meter, switches */
export const radioTex = () => ctex("radioface", 512, 256, (g, r) => {
  g.fillStyle = "#4b5236"; g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#2c3020"; g.fillRect(10, 10, 492, 236);
  g.fillStyle = "#e9e2c6"; g.fillRect(30, 30, 170, 90); g.strokeStyle = "#2a2a28"; g.lineWidth = 3; for (let x = 40; x < 190; x += 12) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, x % 36 === 4 ? 70 : 58); g.stroke(); }
  g.strokeStyle = "#b8322f"; g.lineWidth = 4; g.beginPath(); g.moveTo(115, 115); g.lineTo(150, 50); g.stroke();
  for (const [x, y, rr] of [[270, 75, 40], [380, 75, 30], [270, 180, 26], [360, 185, 26], [450, 185, 26]]) { g.fillStyle = "#1a1c14"; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); g.fillStyle = "#6a6a62"; g.beginPath(); g.arc(x, y, rr * 0.7, 0, 7); g.fill(); g.strokeStyle = "#e9e2c6"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr * 0.6, y - rr * 0.4); g.stroke(); }
  for (let i = 0; i < 4; i++) { g.fillStyle = i === 1 ? "#f2c14e" : "#8a8a80"; g.fillRect(40 + i * 40, 160, 22, 50); }
});
/** a manila folder with a big red stamp (frame + squiggle only) */
export const folderTex = () => ctex("folder", 512, 384, (g, r) => {
  g.fillStyle = "#d9b877"; g.fillRect(0, 0, 512, 384);
  for (let i = 0; i < 20; i++) blotch(g, U(r, 0, 512), U(r, 0, 384), U(r, 30, 90), "120,90,40", 0.08);
  g.save(); g.translate(256, 190); g.rotate(-0.18); g.strokeStyle = "rgba(196,40,36,0.92)"; g.lineWidth = 12; g.strokeRect(-170, -55, 340, 110); g.lineWidth = 4; g.strokeRect(-155, -42, 310, 84);
  g.fillStyle = "rgba(196,40,36,0.9)"; for (let k = 0; k < 7; k++) g.fillRect(-130 + k * 38, -22, 26, 44); g.restore();
  g.fillStyle = "rgba(60,40,20,0.5)"; g.fillRect(40, 320, 200, 6);
});
export const cabinetTex = () => ctex("cabinet", 256, 512, (g, r) => {
  g.fillStyle = "#6c7468"; g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 4; k++) { const y = 12 + k * 125; g.fillStyle = "#7e877a"; g.fillRect(12, y, 232, 113); g.fillStyle = "#3a3e38"; g.fillRect(98, y + 40, 60, 14); g.fillStyle = "#e9e2c6"; g.fillRect(104, y + 18, 48, 16); }
});
/** 48-star flag */
export const flagTex = () => ctex("flag48", 380, 200, (g) => {
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#f3efe6" : "#b8322f"; g.fillRect(0, (i * 200) / 13, 380, 200 / 13 + 1); }
  g.fillStyle = "#1f3a6a"; g.fillRect(0, 0, 160, 108);
  g.fillStyle = "#f3efe6"; for (let y = 0; y < 6; y++) for (let x = 0; x < 8; x++) { g.beginPath(); g.arc(12 + x * 19.4, 10 + y * 17.6, 3.2, 0, 7); g.fill(); }
});
/** white neoclassical wall with rows of tall windows */
export const capitolTex = () => ctex("capitolwall", 512, 256, (g, r) => {
  g.fillStyle = "#f1ede2"; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 14; i++) blotch(g, U(r, 0, 512), U(r, 0, 256), U(r, 30, 90), "160,150,130", 0.06);
  for (let x = 16; x < 512; x += 64) { g.fillStyle = "#3a4250"; g.fillRect(x + 14, 40, 22, 60); g.fillRect(x + 14, 150, 22, 60); g.fillStyle = "#d9d3c4"; g.fillRect(x + 8, 32, 34, 8); g.fillRect(x + 8, 142, 34, 8); }
  g.fillStyle = "#d9d3c4"; g.fillRect(0, 120, 512, 10);
});
export const curtainTex = () => ctex("curtain", 256, 512, (g) => {
  for (let x = 0; x < 256; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, "#6e1218"); gr.addColorStop(0.5, "#b8262e"); gr.addColorStop(1, "#6e1218"); g.fillStyle = gr; g.fillRect(x, 0, 32, 512); }
  g.fillStyle = "#e8c45a"; g.fillRect(0, 480, 256, 18);
});
export const tableclothTex = () => ctex("tablecloth", 256, 256, (g) => {
  g.fillStyle = "#f3efe6"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(184,50,47,0.55)"; for (let x = 0; x < 256; x += 64) { g.fillRect(x, 0, 24, 256); g.fillRect(0, x, 256, 24); }
});
export const plywoodTex = () => ctex("plywood", 512, 512, (g, r) => {
  g.fillStyle = "#c9a676"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 3) { g.fillStyle = `rgba(120,80,40,${(0.05 + 0.08 * Math.abs(Math.sin(y * 0.05 + Math.sin(y * 0.013) * 3))).toFixed(3)})`; g.fillRect(0, y, 512, 2); }
  g.fillStyle = "rgba(60,40,20,0.5)"; g.fillRect(0, 254, 512, 4); g.fillRect(254, 0, 4, 512);
  for (let i = 0; i < 12; i++) { g.fillStyle = "#4a3a2a"; g.beginPath(); g.arc(U(r, 10, 500), U(r, 10, 500), 3, 0, 7); g.fill(); }
});
export const hullTex = () => ctex("shiphull", 512, 256, (g, r) => {
  g.fillStyle = "#6f7680"; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 30; i++) blotch(g, U(r, 0, 512), U(r, 0, 256), U(r, 20, 80), r() > 0.5 ? "190,195,200" : "50,55,60", 0.1);
  g.fillStyle = "#8a3a30"; g.fillRect(0, 210, 512, 46);
  for (let x = 30; x < 512; x += 48) { g.fillStyle = "#2a2e34"; g.beginPath(); g.arc(x, 60, 7, 0, 7); g.fill(); }
});
