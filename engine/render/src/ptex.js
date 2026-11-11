// Painted textures for "The Man Who Sold the Eiffel Tower". No readable text anywhere.
import { ctex } from "../lib/paint.js";

const U = (r, a, b) => a + (b - a) * r();
const blotch = (g, x, y, rad, rgb, a) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
};
/** puddled wrought iron, reddish brown with rust streaks */
export const ironTex = () => ctex("iron", 256, 256, (g, r) => {
  g.fillStyle = "#8a5a3e"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) blotch(g, U(r, 0, 256), U(r, 0, 256), U(r, 10, 50), r() > 0.5 ? "190,120,70" : "60,35,25", 0.18);
  for (let i = 0; i < 20; i++) { g.fillStyle = "rgba(150,80,40,0.25)"; g.fillRect(U(r, 0, 256), U(r, 0, 256), 3, U(r, 20, 80)); }
});
export const gravelTex = () => ctex("gravel", 512, 512, (g, r) => {
  g.fillStyle = "#d9c8a4"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 50; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 120), r() > 0.5 ? "240,228,200" : "170,150,115", 0.14);
  for (let i = 0; i < 3000; i++) { g.fillStyle = r() > 0.5 ? "rgba(120,100,70,0.22)" : "rgba(255,250,235,0.3)"; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2, 2); }
});
export const cobbleTex = () => ctex("cobble", 512, 512, (g, r) => {
  g.fillStyle = "#8f8a82"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 24) for (let x = (y / 24) % 2 ? -14 : 0; x < 512; x += 28) {
    const v = Math.floor(U(r, 120, 170)); g.fillStyle = `rgb(${v},${v - 6},${v - 14})`;
    g.beginPath(); g.roundRect(x + 2, y + 2, 24, 20, 6); g.fill();
  }
});
export const wallpaperRed = () => ctex("wallRed", 256, 256, (g) => {
  g.fillStyle = "#7a1f2a"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(230,190,110,0.55)"; g.lineWidth = 3;
  for (let x = 0; x < 256; x += 64) for (let y = 0; y < 256; y += 64) { g.beginPath(); g.ellipse(x + 32, y + 32, 14, 22, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x + 32, y + 4); g.lineTo(x + 32, y + 60); g.stroke(); }
});
export const panelTex = () => ctex("woodPanel", 256, 256, (g, r) => {
  g.fillStyle = "#5a3a24"; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) { g.fillStyle = `rgba(30,15,5,${(0.05 + 0.08 * Math.abs(Math.sin(y * 0.07))).toFixed(3)})`; g.fillRect(0, y, 256, 2); }
  g.strokeStyle = "rgba(20,10,5,0.6)"; g.lineWidth = 4; g.strokeRect(16, 16, 224, 100); g.strokeRect(16, 140, 224, 100);
});
export const stoneTex = () => ctex("cellStone", 512, 512, (g, r) => {
  g.fillStyle = "#8c8a86"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 48) for (let x = (y / 48) % 2 ? -40 : 0; x < 512; x += 80) {
    const v = Math.floor(U(r, 120, 160)); g.fillStyle = `rgb(${v},${v - 2},${v - 6})`; g.fillRect(x + 3, y + 3, 74, 42);
  }
});
export const policeWall = () => ctex("policeWall", 256, 256, (g, r) => {
  g.fillStyle = "#9db0c4"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 12; i++) blotch(g, U(r, 0, 256), U(r, 0, 256), U(r, 30, 90), "255,255,255", 0.08);
  g.fillStyle = "#5a6a7e"; g.fillRect(0, 200, 256, 56);
});
export const greenCloth = () => ctex("greenCloth", 128, 128, (g, r) => {
  g.fillStyle = "#2f6a45"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 300; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"; g.fillRect(U(r, 0, 128), U(r, 0, 128), 2, 2); }
});
/** a stack of banknotes (green, banded) */
export const moneyTex = () => ctex("money", 256, 128, (g) => {
  g.fillStyle = "#7fa36a"; g.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 6) { g.fillStyle = y % 12 ? "#9ac084" : "#6a8f58"; g.fillRect(0, y, 256, 3); }
  g.fillStyle = "#e8d8a8"; g.fillRect(110, 0, 36, 128);
});
/** a city skyline far away (flat card) */
export const skylineTex = () => ctex("skyline", 1024, 256, (g, r) => {
  g.clearRect(0, 0, 1024, 256);
  for (let x = 0; x < 1024; ) { const w = U(r, 30, 70), h = U(r, 60, 230); g.fillStyle = r() > 0.5 ? "#7d8aa0" : "#6c7890"; g.fillRect(x, 256 - h, w, h); g.fillStyle = "rgba(255,230,160,0.5)"; for (let yy = 256 - h + 8; yy < 250; yy += 14) for (let xx = x + 5; xx < x + w - 6; xx += 10) if (r() > 0.6) g.fillRect(xx, yy, 4, 6); x += w + U(r, 0, 6); }
  g.fillStyle = "#6c7890"; g.fillRect(700, 30, 20, 200); g.fillRect(704, 0, 12, 40);
});
