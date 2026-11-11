// Extra painted textures for Kolkata / the Howrah Bridge, in the skill's paint.ts manner (Canvas2D, cached via ctex).
import * as THREE from "three";
import { ctex, jit } from "../lib/paint.js";

const U = (r, a, b) => a + (b - a) * r();
const blotch = (g, x, y, rad, rgb, a) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
};

/** riveted aluminium-painted steel: plate seams, rivet rows, soft mottling. 1 tile = 4 m along the member */
export const steelTex = (key = "steel", base = "#a7adb1") => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 110), r() > 0.5 ? "255,255,255" : "70,75,85", U(r, 0.04, 0.09));
  // plate seams (vertical texture axis = along the member)
  for (const y of [0, 256]) { g.fillStyle = "rgba(40,44,52,0.55)"; g.fillRect(0, y, 512, 3); g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(0, y + 3, 512, 2); }
  for (const x of [0, 256]) { g.fillStyle = "rgba(40,44,52,0.35)"; g.fillRect(x, 0, 3, 512); }
  // rivet rows along both edges and beside each seam
  const rivet = (x, y) => {
    g.fillStyle = "rgba(45,48,56,0.85)"; g.beginPath(); g.arc(x + 1, y + 1, 5.2, 0, 7); g.fill();
    g.fillStyle = jit(r, base, 0.06, 2, 0.1); g.beginPath(); g.arc(x, y, 4.2, 0, 7); g.fill();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.arc(x - 1.4, y - 1.4, 1.6, 0, 7); g.fill();
  };
  for (const x of [22, 490, 234, 278]) for (let y = 12; y < 512; y += 22) rivet(x, y);
  for (const y of [18, 238, 274, 494]) for (let x = 44; x < 470; x += 24) rivet(x, y);
});

/** pillar hood: clean / stained (paan red splats + rust) / rusted / fibreglass skirt */
export const hoodTex = (state) => ctex("hood_" + state, 512, 512, (g, r) => {
  if (state === "fibre") {
    g.fillStyle = "#e4e6d8"; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "rgba(150,165,140,0.25)"; g.lineWidth = 1;
    for (let i = 0; i < 512; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
    for (let i = 0; i < 14; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 40, 120), "255,255,255", 0.25);
    g.fillStyle = "rgba(60,70,60,0.5)"; g.fillRect(0, 0, 512, 6); g.fillRect(0, 506, 512, 6);
    for (let x = 30; x < 512; x += 60) { g.fillStyle = "rgba(70,80,70,0.7)"; g.beginPath(); g.arc(x, 20, 5, 0, 7); g.fill(); }
    return;
  }
  const base = "#a3a9ad";
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 100), r() > 0.5 ? "255,255,255" : "70,75,85", 0.07);
  g.fillStyle = "rgba(40,44,52,0.5)"; g.fillRect(0, 0, 512, 4);
  for (let x = 16; x < 512; x += 24) {
    g.fillStyle = "rgba(45,48,56,0.85)"; g.beginPath(); g.arc(x + 1, 21, 5, 0, 7); g.fill();
    g.fillStyle = base; g.beginPath(); g.arc(x, 20, 4, 0, 7); g.fill();
  }
  if (state === "clean") return;
  const heavy = state === "rust" ? 1.8 : 1;
  // rust bloom from the bottom
  for (let i = 0; i < 40 * heavy; i++) blotch(g, U(r, 0, 512), U(r, 300, 540), U(r, 30, 90), "150,82,40", U(r, 0.18, 0.4) * Math.min(1, heavy));
  // paan splats: dark red core, lighter rim, runs downward
  const n = Math.round(26 * heavy);
  for (let i = 0; i < n; i++) {
    const x = U(r, 10, 500), y = U(r, 220, 470), s = U(r, 10, 34);
    g.fillStyle = `rgba(158,44,30,${U(r, 0.55, 0.85).toFixed(2)})`;
    g.beginPath();
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, rr = s * (0.6 + 0.6 * r()); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8); }
    g.closePath(); g.fill();
    for (let k = 0; k < 3; k++) { g.fillStyle = "rgba(128,36,24,0.7)"; g.fillRect(x + U(r, -s, s), y, U(r, 2, 5), U(r, 20, 70)); }
    for (let k = 0; k < 6; k++) { g.fillStyle = "rgba(165,50,32,0.7)"; g.beginPath(); g.arc(x + U(r, -2, 2) * s, y + U(r, -1.5, 1.5) * s, U(r, 2, 5), 0, 7); g.fill(); }
  }
  if (state === "rust") for (let i = 0; i < 20; i++) blotch(g, U(r, 0, 512), U(r, 380, 512), U(r, 20, 60), "90,45,20", 0.5);
});

export const asphaltTex = () => ctex("asphalt", 512, 512, (g, r) => {
  g.fillStyle = "#6a6a6c"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2, 2); }
  for (let i = 0; i < 20; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 90), "40,40,45", 0.12);
});

export const pavingTex = (key = "paving", base = "#bdb3a2") => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 128) {
    g.fillStyle = jit(r, base, 0.06, 4, 0.2); g.fillRect(x + 2, y + 2, 124, 60);
  }
  for (let i = 0; i < 18; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 20, 80), "90,80,70", 0.1);
});

export const dustTex = () => ctex("dust", 512, 512, (g, r) => {
  g.fillStyle = "#b9a888"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) blotch(g, U(r, 0, 512), U(r, 0, 512), U(r, 20, 120), r() > 0.5 ? "120,100,70" : "230,215,190", 0.12);
  for (let i = 0; i < 1500; i++) { g.fillStyle = "rgba(80,65,50,0.15)"; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2, 2); }
});

/** stone basin with a groove worn by the drip (wear 0..1) */
export const basinTex = (wear) => ctex("basin_" + wear.toFixed(2), 256, 256, (g, r) => {
  g.fillStyle = "#b8b0a2"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30; i++) blotch(g, U(r, 0, 256), U(r, 0, 256), U(r, 10, 50), r() > 0.5 ? "255,255,255" : "80,70,60", 0.1);
  if (wear > 0) {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 20 + 70 * wear);
    gr.addColorStop(0, `rgba(60,55,50,${0.75 * wear})`); gr.addColorStop(0.6, `rgba(90,82,72,${0.5 * wear})`); gr.addColorStop(1, "rgba(90,82,72,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = `rgba(30,26,24,${0.8 * wear})`; g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 14 + 40 * wear, 0, 7); g.stroke();
  }
});

/** 1940s Calcutta tram side: cream upper, green lower, windows */
export const tramTex = () => ctex("tram", 1024, 320, (g) => {
  g.fillStyle = "#efe3bf"; g.fillRect(0, 0, 1024, 320);
  g.fillStyle = "#2f6a48"; g.fillRect(0, 190, 1024, 130);
  g.fillStyle = "#b8862c"; g.fillRect(0, 182, 1024, 10);
  for (let x = 40; x < 1000; x += 96) {
    g.fillStyle = "#3a3f4c"; g.fillRect(x, 50, 70, 100);
    g.fillStyle = "rgba(170,200,230,0.5)"; g.fillRect(x + 6, 56, 58, 40);
    g.strokeStyle = "#5a4630"; g.lineWidth = 6; g.strokeRect(x, 50, 70, 100);
  }
  g.fillStyle = "#c9b48a"; g.fillRect(0, 0, 1024, 20);
});

export const hullTex = () => ctex("hull", 512, 256, (g, r) => {
  g.fillStyle = "#7c2e2a"; g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#26282e"; g.fillRect(0, 0, 512, 90);
  g.fillStyle = "#e9e4d6"; g.fillRect(0, 86, 512, 8);
  for (let i = 0; i < 40; i++) blotch(g, U(r, 0, 512), U(r, 90, 256), U(r, 10, 40), "150,90,50", 0.25);
  for (let x = 20; x < 512; x += 40) { g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x, 0, 2, 256); }
});

export const cabinTex = () => ctex("cabin", 512, 256, (g) => {
  g.fillStyle = "#ece8de"; g.fillRect(0, 0, 512, 256);
  for (let x = 24; x < 500; x += 54) { g.fillStyle = "#2c3a4c"; g.fillRect(x, 60, 34, 40); g.fillRect(x, 150, 34, 40); }
});

/** generic country boat planks */
export const boatTex = () => ctex("boat", 256, 128, (g, r) => {
  g.fillStyle = "#7a5134"; g.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 16) { g.fillStyle = jit(r, "#7a5134", 0.1, 4, 0.1); g.fillRect(0, y + 1, 256, 14); }
  g.fillStyle = "#d8c36a"; g.fillRect(0, 0, 256, 10);
});

/** brick for Howrah station: deep Indian red */
export const redBrick = () => ctex("redbrick", 512, 512, (g, r) => {
  g.fillStyle = "#e3c9a8"; g.fillRect(0, 0, 512, 512);
  const bw = 32, bh = 12;
  for (let y = 0, row = 0; y < 512; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < 512; x += bw) {
    g.fillStyle = jit(r, "#b2422e", 0.12, 5, 0.15); g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
  }
});

/** station facade: arched windows in cream trim on red brick, per 6 m x 6 m tile */
export const stationFacade = () => ctex("stationFac", 512, 512, (g, r) => {
  g.drawImage(redBrick().image, 0, 0);
  g.fillStyle = "#efe2c4"; g.fillRect(0, 0, 512, 26); g.fillRect(0, 250, 512, 18);
  for (const y0 of [60, 300]) for (const x0 of [70, 300]) {
    g.fillStyle = "#efe2c4"; g.beginPath(); g.moveTo(x0 - 12, y0 + 170); g.lineTo(x0 - 12, y0 + 50); g.arc(x0 + 60, y0 + 50, 72, Math.PI, 0); g.lineTo(x0 + 132, y0 + 170); g.closePath(); g.fill();
    g.fillStyle = "#3b3a44"; g.beginPath(); g.moveTo(x0, y0 + 160); g.lineTo(x0, y0 + 50); g.arc(x0 + 60, y0 + 50, 60, Math.PI, 0); g.lineTo(x0 + 120, y0 + 160); g.closePath(); g.fill();
    g.fillStyle = "#2d5e46"; g.fillRect(x0 + 4, y0 + 70, 112, 86);
    g.strokeStyle = "#1f3d2e"; g.lineWidth = 4; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x0 + 4 + k * 28, y0 + 70); g.lineTo(x0 + 4 + k * 28, y0 + 156); g.stroke(); }
  }
});

export const awningTex = () => ctex("awning", 256, 128, (g) => {
  for (let x = 0; x < 256; x += 32) { g.fillStyle = (x / 32) % 2 ? "#f2efe6" : "#2f7d5a"; g.fillRect(x, 0, 32, 128); }
});

/** generic water tank (the black rooftop tanks of Kolkata) */
export const tankTex = () => ctex("tank", 256, 128, (g) => {
  g.fillStyle = "#2e3036"; g.fillRect(0, 0, 256, 128);
  for (let y = 16; y < 128; y += 22) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(0, y, 256, 4); }
});

export { THREE };
