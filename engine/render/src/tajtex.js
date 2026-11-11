// Painted textures for the Taj Mahal short (Canvas2D, cached via the skill's ctex): marble, the Taj facades with their
// pointed arches and calligraphy bands, red sandstone with white inlay, bamboo, the green cloth, runway, windows.
import { ctex, jit } from "../lib/paint.js";

const U = (r, a, b) => a + (b - a) * r();
const blotch = (g, x, y, rad, rgb, a) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
};
const MARBLE = "#f3efe6", INLAY = "#6e6a72", RECESS0 = "#d9d2c6", RECESS1 = "#b8b0a4";

const marbleBase = (g, W, H, r) => {
  g.fillStyle = MARBLE; g.fillRect(0, 0, W, H);
  for (let i = 0; i < (W * H) / 9000; i++) blotch(g, U(r, 0, W), U(r, 0, H), U(r, 20, 90), r() > 0.5 ? "255,255,255" : "170,160,150", U(r, 0.05, 0.1));
  g.strokeStyle = "rgba(150,140,135,0.22)"; g.lineWidth = 1.2;
  for (let i = 0; i < (W * H) / 40000; i++) { let x = U(r, 0, W), y = U(r, 0, H); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += U(r, -25, 25); y += U(r, 5, 30); g.lineTo(x, y); } g.stroke(); }
};
/** pointed (Mughal) arch outline from the springing line: w wide, rise h above the springing, legs down to base */
const archPath = (g, cx, base, w, springY, h) => {
  const x0 = cx - w / 2, x1 = cx + w / 2, top = springY - h;
  g.beginPath(); g.moveTo(x0, base); g.lineTo(x0, springY);
  g.bezierCurveTo(x0, springY - h * 0.55, cx - w * 0.12, top + h * 0.12, cx, top);
  g.bezierCurveTo(cx + w * 0.12, top + h * 0.12, x1, springY - h * 0.55, x1, springY);
  g.lineTo(x1, base); g.closePath();
};
const niche = (g, cx, base, w, springY, h, px) => {
  // frame, recess (darker toward the top), inlay outline, little flower dots
  g.save(); archPath(g, cx, base, w + px * 0.5, springY, h + px * 0.3); g.fillStyle = "#ebe5da"; g.fill(); g.restore();
  archPath(g, cx, base, w, springY, h);
  const gr = g.createLinearGradient(0, springY - h, 0, base); gr.addColorStop(0, RECESS1); gr.addColorStop(1, RECESS0);
  g.fillStyle = gr; g.fill(); g.lineWidth = Math.max(2, px * 0.09); g.strokeStyle = INLAY; g.stroke();
  // inner half-dome ribs
  g.strokeStyle = "rgba(110,100,95,0.35)"; g.lineWidth = Math.max(1, px * 0.04);
  for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx, springY - h * 0.9); g.lineTo(cx + k * w * 0.2, springY); g.stroke(); }
  // rectangular frame (alfiz) with inlay
  g.strokeStyle = INLAY; g.lineWidth = Math.max(2, px * 0.07);
  g.strokeRect(cx - w / 2 - px * 0.6, springY - h - px * 0.6, w + px * 1.2, base - (springY - h) + px * 0.6);
  for (const sx of [-1, 1]) { g.fillStyle = "#b8564a"; g.beginPath(); g.arc(cx + sx * w * 0.36, springY - h * 0.72, px * 0.18, 0, 7); g.fill(); g.fillStyle = "#4f8a5a"; g.beginPath(); g.arc(cx + sx * w * 0.36 + px * 0.22, springY - h * 0.72 + px * 0.1, px * 0.12, 0, 7); g.fill(); }
};
const calligraphy = (g, x0, y0, x1, y1, px, r) => {
  // a band of dark, flowing (illegible, decorative) strokes along a frame
  g.strokeStyle = "#2f2a33"; g.lineWidth = Math.max(1.5, px * 0.06); g.lineCap = "round";
  const seg = (ax, ay, bx, by) => {
    const L = Math.hypot(bx - ax, by - ay), n = Math.floor(L / (px * 0.45));
    for (let i = 0; i < n; i++) {
      const t = i / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + U(r, -1, 1) * px * 0.25, y + U(r, -1, 1) * px * 0.25, x + (bx - ax) / n * 0.8, y + (by - ay) / n * 0.8); g.stroke();
      if (r() < 0.4) { g.beginPath(); g.arc(x, y - px * 0.12, px * 0.04, 0, 7); g.fillStyle = "#2f2a33"; g.fill(); }
    }
  };
  seg(x0, y1, x0, y0); seg(x0, y0, x1, y0); seg(x1, y0, x1, y1);
};

/** the big central portal (pishtaq): 22 m x 33 m at 32 px/m */
export const pishtaqTex = () => ctex("tajPishtaq", 704, 1056, (g, r) => {
  const px = 32, W = 704, H = 1056;
  marbleBase(g, W, H, r);
  g.strokeStyle = INLAY; g.lineWidth = 6; g.strokeRect(px * 0.8, px * 0.8, W - px * 1.6, H - px * 0.8);
  calligraphy(g, px * 1.6, px * 1.6, W - px * 1.6, H - px * 0.5, px, r);
  niche(g, W / 2, H, px * 14, H - px * 15, px * 12, px);
  // the door arch inside, with jali lattice
  archPath(g, W / 2, H, px * 5, H - px * 5, px * 3.5); g.fillStyle = "#4a3f3a"; g.fill(); g.strokeStyle = INLAY; g.lineWidth = 4; g.stroke();
  g.save(); archPath(g, W / 2, H, px * 5, H - px * 5, px * 3.5); g.clip(); g.strokeStyle = "rgba(220,200,170,0.5)"; g.lineWidth = 2;
  for (let k = -12; k < 12; k++) { g.beginPath(); g.moveTo(W / 2 + k * 14, H); g.lineTo(W / 2 + k * 14 + 200, H - 200); g.stroke(); g.beginPath(); g.moveTo(W / 2 + k * 14, H); g.lineTo(W / 2 + k * 14 - 200, H - 200); g.stroke(); } g.restore();
  // upper windows above the door
  for (const sx of [-1, 1]) { archPath(g, W / 2 + sx * px * 3.4, H - px * 9.5, px * 2.2, H - px * 11.5, px * 1.6); g.fillStyle = "#5a504a"; g.fill(); }
  // parapet crest
  for (let x = px; x < W - px; x += px * 1.4) { g.fillStyle = "#e9e3d8"; g.beginPath(); g.moveTo(x, px * 0.8); g.lineTo(x + px * 0.7, 0); g.lineTo(x + px * 1.4, px * 0.8); g.fill(); }
});
/** main faces beside the portal: two storeys of arched niches (36 m x 30 m at 24 px/m) */
export const tajFaceTex = () => ctex("tajFace", 864, 720, (g, r) => {
  const px = 24, W = 864, H = 720;
  marbleBase(g, W, H, r);
  for (const cx of [px * 3.6, W - px * 3.6]) { niche(g, cx, H, px * 5, H - px * 10, px * 3.4, px); niche(g, cx, H - px * 14.5, px * 5, H - px * 24, px * 3.4, px); }
  g.fillStyle = "rgba(110,100,95,0.25)"; g.fillRect(0, H - px * 14.4, W, px * 0.3);
  for (let x = 0; x < W; x += px * 1.4) { g.fillStyle = "#e9e3d8"; g.beginPath(); g.moveTo(x, px * 0.8); g.lineTo(x + px * 0.7, 0); g.lineTo(x + px * 1.4, px * 0.8); g.fill(); }
  g.strokeStyle = INLAY; g.lineWidth = 3; g.strokeRect(2, px * 0.9, W - 4, H - px * 0.9);
});
/** chamfered corner faces: two stacked niches (14 m x 30 m) */
export const tajChamferTex = () => ctex("tajChamfer", 336, 720, (g, r) => {
  const px = 24, W = 336, H = 720;
  marbleBase(g, W, H, r);
  niche(g, W / 2, H, px * 6.5, H - px * 10, px * 3.8, px); niche(g, W / 2, H - px * 14.5, px * 6.5, H - px * 24, px * 3.8, px);
  for (let x = 0; x < W; x += px * 1.4) { g.fillStyle = "#e9e3d8"; g.beginPath(); g.moveTo(x, px * 0.8); g.lineTo(x + px * 0.7, 0); g.lineTo(x + px * 1.4, px * 0.8); g.fill(); }
});
export const marbleTex = (key = "marble") => ctex(key, 512, 512, (g, r) => { marbleBase(g, 512, 512, r); });
/** plinth sides: a blind arcade of small niches, 12 m per tile, 7 m tall */
export const plinthTex = () => ctex("plinth", 768, 448, (g, r) => {
  const px = 64; marbleBase(g, 768, 448, r);
  for (let k = 0; k < 4; k++) niche(g, px * 1.5 + k * px * 3, 448, px * 2, 448 - px * 3, px * 1.4, px * 0.6);
  g.strokeStyle = INLAY; g.lineWidth = 4; g.beginPath(); g.moveTo(0, px * 0.6); g.lineTo(768, px * 0.6); g.stroke();
});
export const domeTex = () => ctex("dome", 512, 512, (g, r) => {
  marbleBase(g, 512, 512, r);
  g.strokeStyle = "rgba(150,140,135,0.18)"; g.lineWidth = 2; for (let x = 0; x < 512; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
});
/** red sandstone with white marble inlay panels (mosque, gate, walls); tile 8 m */
export const sandstoneTex = (key = "sandstone", base = "#b2513a") => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 20, 90), r() > 0.5 ? "230,150,120" : "110,40,30", 0.12);
  g.strokeStyle = "#f2ebdf"; g.lineWidth = 5;
  for (let y = 16; y < 512; y += 128) for (let x = 16; x < 512; x += 128) g.strokeRect(x, y, 96, 96);
  for (let y = 64; y < 512; y += 128) for (let x = 64; x < 512; x += 128) { g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x, y - 20); g.lineTo(x + 20, y); g.lineTo(x, y + 20); g.closePath(); g.stroke(); }
});
/** gateway / mosque front: big white-framed arch on red stone (40 m x 24 m) */
export const gateTex = (key = "gate") => ctex(key, 960, 576, (g, r) => {
  const px = 24, W = 960, H = 576;
  g.drawImage(sandstoneTex().image, 0, 0, 512, 512, 0, 0, W, H * 1.1);
  const n = (cx, base, w, sp, h, white) => { archPath(g, cx, base, w + 10, sp, h + 6); g.fillStyle = "#f2ebdf"; g.fill(); archPath(g, cx, base, w, sp, h); const gr = g.createLinearGradient(0, sp - h, 0, base); gr.addColorStop(0, "#5a2a20"); gr.addColorStop(1, "#8a3a2a"); g.fillStyle = gr; g.fill(); };
  n(W / 2, H, px * 11, H - px * 12, px * 7, true);
  g.strokeStyle = "#f2ebdf"; g.lineWidth = 8; g.strokeRect(W / 2 - px * 8, px * 2, px * 16, H - px * 2);
  calligraphy(g, W / 2 - px * 7.4, px * 2.6, W / 2 + px * 7.4, H, px, r);
  for (const sx of [-1, 1]) for (const yy of [H, H - px * 11]) n(W / 2 + sx * px * 14, yy, px * 4, yy - px * 6, px * 3, true);
});
export const bambooTex = () => ctex("bamboo", 128, 512, (g, r) => {
  g.fillStyle = "#c9a55a"; g.fillRect(0, 0, 128, 512);
  for (let y = 0; y < 512; y += 64) { g.fillStyle = "#8a6a32"; g.fillRect(0, y, 128, 8); g.fillStyle = "rgba(255,240,200,0.35)"; g.fillRect(0, y + 8, 128, 4); }
  for (let i = 0; i < 20; i++) blotch(g, U(r, 0, 128), U(r, 0, 512), U(r, 10, 40), "120,90,40", 0.2);
});
export const clothTex = () => ctex("greencloth", 512, 512, (g, r) => {
  g.fillStyle = "#3a6a45"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 3) { g.fillStyle = `rgba(0,0,0,${(0.04 + 0.05 * Math.abs(Math.sin(x * 0.07))).toFixed(3)})`; g.fillRect(x, 0, 1, 512); }
  for (let i = 0; i < 14; i++) { const x = U(r, 0, 512); const gr = g.createLinearGradient(x - 30, 0, x + 30, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(10,30,15,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - 30, 0, 60, 512); }
  g.fillStyle = "rgba(20,40,25,0.5)"; for (let y = 0; y < 512; y += 128) g.fillRect(0, y, 512, 3);
});
export const runwayTex = () => ctex("runway", 512, 512, (g, r) => {
  g.fillStyle = "#5f6064"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2000; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2, 2); }
  g.fillStyle = "#e8e6df"; g.fillRect(248, 40, 16, 180); g.fillRect(248, 296, 16, 180);
  g.fillRect(10, 0, 8, 512); g.fillRect(494, 0, 8, 512);
});
export const windowsTex = (on) => ctex("windows" + (on ? 1 : 0), 256, 256, (g) => {
  g.fillStyle = "#e3cfa3"; g.fillRect(0, 0, 256, 256);
  for (const [x, y] of [[40, 50], [150, 50], [40, 150], [150, 150]]) { g.fillStyle = on ? "#ffd66b" : "#22283a"; g.fillRect(x, y, 66, 66); g.strokeStyle = "#5a4630"; g.lineWidth = 6; g.strokeRect(x, y, 66, 66); g.beginPath(); g.moveTo(x + 33, y); g.lineTo(x + 33, y + 66); g.stroke(); }
});
export const corrugatedTex = () => ctex("corrugated", 256, 256, (g) => {
  for (let x = 0; x < 256; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, "#8a9096"); gr.addColorStop(0.5, "#c3c8cc"); gr.addColorStop(1, "#7a8086"); g.fillStyle = gr; g.fillRect(x, 0, 16, 256); }
});
