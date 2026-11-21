// Shot plan for "The CIA Turned a Cat Into a Spy" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts: Operation Acoustic Kitty (CIA, mid-1960s): microphone in the ear canal, a 3/4-inch transmitter at the base of the skull, a wire antenna woven
// through the fur to the tail (Smithsonian, History.com, TIME); it wandered off when bored or hungry, another operation for the hunger (Smithsonian);
// about five years; the first test: agents in a van with dials, two men on a park bench, the cat never reached the target (all three); total cost
// estimated at $20 million (Smithsonian); 1967 memo "Views on Trained Cats": not practical; cats can be trained to move short distances = "a remarkable
// scientific achievement" (Smithsonian / History.com). The disputed taxi ending is not shown.
// Hook-first (the spy cat strolling on frame 0), a cut every ~1.5-2 s, loop ending (last shot = shot 1's view).
import { PARK, ROOM } from "./world.js";
import * as K from "./draw_kitty.js";
import { INK } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1780;
export const setWords = (w) => { WORDS = w; TOTAL = Math.ceil((w[w.length - 1].end + 0.3) * FPS); buildShots(); };
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
const P = (phrase, after = -1, end = false) => {
  const ws = phrase.split(/\s+/).map(norm);
  for (let i = 0; i <= WORDS.length - ws.length; i++) {
    if (WORDS[i].start <= after) continue;
    if (ws.every((w, k) => norm(WORDS[i + k].word) === w)) return end ? WORDS[i + ws.length - 1].end : WORDS[i].start;
  }
  throw new Error("phrase not found: " + phrase);
};
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const glide = (u) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const smooth = (u) => { const x = clamp01(u); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const hh = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const keys = (ks, creep = 0.002) => (s) => {
  let i = 0; while (i < ks.length - 1 && s > ks[i + 1].t) i++;
  const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)], u = b === a ? 0 : glide((s - a.t) / Math.max(0.001, b.t - a.t));
  return { pos: L3(a.pos, b.pos, u), look: L3(a.look, b.look, u), fov: lerp(a.fov ?? 40, b.fov ?? 40, u) * (1 - creep * s * FPS * 0.06), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) };
};
const push = (p0, l0, p1, l1, fov = 40, dur = 5, fov1 = fov) => keys([{ t: 0, pos: p0, look: l0, fov }, { t: dur, pos: p1, look: l1, fov: fov1 }]);
const kick = (t, at, amp = 0.012) => { let o = 0; for (const a of at) { const k = Math.round((t - a) * FPS); if (k >= 0 && k < 7) o += amp * (k % 2 ? -1 : 1) * (1 - k / 7); } return o; };
const two = Math.PI * 2;

// ---------------- text + shapes ----------------
const txt = (g, s, x, y, size, font, fill, stroke = INK, lw = 0, maxW = 0) => {
  g.font = `${size}px ${font}`; if (maxW) { let k = size; while (g.measureText(s).width > maxW && k > 8) { k *= 0.94; g.font = `${k}px ${font}`; } }
  g.textAlign = "center"; g.textBaseline = "middle"; if (lw) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = lw; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y);
};
const E = (g, x, y, rx, ry, rot, fill, lw = 8, stroke = INK) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, two); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
const R = (g, x, y, w, h, r, fill, lw = 8, stroke = INK) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
const poly = (g, pts, fill, lw = 8, stroke = INK) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
const line = (g, pts, col = INK, lw = 8) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); };
const heart = (g, x, y, r, fill) => { g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5); g.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = r * 0.16; g.stroke(); };
const DR = {
  nameTag: (p, a, b, col = "#c0353a") => { const g = p.g; g.clearRect(0, 0, 1024, 256); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 40); g.lineTo(984, 40); g.lineTo(940, 128); g.lineTo(984, 216); g.lineTo(40, 216); g.lineTo(84, 128); g.closePath(); g.fill(); g.stroke();
    txt(g, a, 512, 108, 100, "AlfaSlab", "#ffffff", INK, 10, 820); txt(g, b, 512, 186, 46, "AlfaSlab", "#ffe08a", INK, 6, 760); },
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, s.length > 2 ? 110 : 200, "Bangers", col, INK, 14, 240); },
  word: (p, s, col, u) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); const k = 0.7 + 0.3 * Math.min(1, u * 3); g.scale(k, k); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two, r = i % 2 ? 80 : 118; g.lineTo(Math.cos(a) * r * 2, Math.sin(a) * r * 0.9); } g.closePath(); g.fill(); g.stroke(); txt(g, s, 0, 6, 92, "Bangers", col, INK, 10, 400); g.restore(); },
  numBoard: (p, n, label, col) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(30, 30, 964, 452, 40); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.roundRect(56, 56, 912, 400, 28); g.stroke();
    txt(g, n, 512, 210, 230, "Bangers", col, INK, 16, 900); txt(g, label, 512, 380, 110, "Bangers", "#2a2a36", INK, 0, 880); },
  spark: (p, col = "#fffbe8") => { const g = p.g; g.clearRect(0, 0, 256, 256); poly(g, [[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], col, 8); },
  sweat: (p) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.beginPath(); g.moveTo(64, 10); g.quadraticCurveTo(110, 80, 64, 118); g.quadraticCurveTo(18, 80, 64, 10); g.fillStyle = "#8fd0ff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); },
  hearts: (p, k) => { const g = p.g; g.clearRect(0, 0, 512, 512); for (let i = 0; i < 6; i++) { const ph = (k / 16 + i / 6) % 1, x = 120 + hh(i, 4) * 280 + Math.sin(ph * 9 + i) * 20, y = 470 - ph * 420, r = 26 + hh(i, 5) * 22; g.globalAlpha = Math.min(1, (1 - ph) * 2.5); heart(g, x, y, r, i % 2 ? "#ff5a8a" : "#ff2a5a"); } g.globalAlpha = 1; },
  zzz: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); for (let i = 0; i < 3; i++) { const ph = (k / 12 + i / 3) % 1; g.globalAlpha = Math.min(1, (1 - ph) * 3); txt(g, "Z", 70 + ph * 120 + i * 6, 220 - ph * 180, 40 + ph * 50, "Bangers", "#ffffff", INK, 8); } g.globalAlpha = 1; },
  confetti: (p, k) => { const g = p.g, W = g.canvas.width, Hh = g.canvas.height; g.clearRect(0, 0, W, Hh); const C = ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a", "#ffffff", "#c8202e"]; for (let i = 0; i < 46; i++) { const x = hh(i, 1) * W, y = ((hh(i, 2) * Hh + k * 30 * (0.6 + hh(i, 3))) % (Hh + 48)) - 24; g.save(); g.translate(x, y); g.rotate(k * 0.7 + i); g.fillStyle = C[i % 6]; g.fillRect(-9, -5, 18, 10); g.restore(); } },
  splash: (p, k) => { const g = p.g; g.clearRect(0, 0, 512, 256); for (let i = 0; i < 16; i++) { const a = Math.PI * (0.08 + 0.84 * hh(i, 7)), sp = 0.6 + hh(i, 8) * 0.6, tt = k / 10, x = 256 + Math.cos(a) * 260 * tt * sp, y = 240 - Math.sin(a) * 300 * tt * sp + 240 * tt * tt; if (tt < 1) E(g, x, y, 14 - tt * 6, 18 - tt * 8, 0, "#e8f8ff", 4, "#3a7ab0"); } },
};


const drawBubble = (g, s, col = "#2a2a36") => { g.clearRect(0, 0, 768, 384); g.lineJoin = "round"; g.beginPath(); g.ellipse(384, 170, 350, 140, 0, 0, two); g.moveTo(240, 290); g.lineTo(150, 370); g.lineTo(330, 300); g.fillStyle = "#ffffff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  g.beginPath(); g.ellipse(384, 170, 344, 134, 0, 0, two); g.fill(); txt(g, s, 384, 176, 110, "Bangers", col, INK, 0, 600); };

const oc = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")); return c; };
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });
const screenCard = (out, c, key, draw, d = 0.6, cw = 1024, ch = 512, kind = "soft") => {
  const fx = c.look[0] - c.pos[0], fy = c.look[1] - c.pos[1], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fy, fz);
  const h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.03, w = h * (9 / 16) * 1.03;
  out.fx.push({ key, cw, ch, draw, x: c.pos[0] + (fx / n) * d, y: c.pos[1] + (fy / n) * d, z: c.pos[2] + (fz / n) * d, w, h, kind });
};

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[0];

// people
const AGENT = (v) => ({ jacket: "#2a2e38", pants: "#2a2e38", boots: INK, hat: "fedora", cap: ["#2a2a30", "#3a3640"][v % 2], hair: "#2a201a", skin: ["#f2d2b6", "#e8b894", "#c99067"][v % 3], build: "adult" });
const TECH = (v) => ({ jacket: ["#3a4a5a", "#2a2e38"][v % 2], pants: "#2a2e38", boots: INK, hat: "hair", hair: ["#2a201a", "#8a5a32"][v % 2], skin: ["#f2d2b6", "#c99067"][v % 2], build: "adult" });
const RED = (v) => ({ jacket: ["#6a5a44", "#4a4a52"][v % 2], pants: "#3a3430", boots: INK, hat: "fedora", cap: ["#5a4a3a", "#2a2a30"][v % 2], hair: "#3a2a1a", moustache: v % 2 ? "#3a2a1a" : undefined, skin: ["#f2d2b6", "#ecd0b6"][v % 2], build: v % 2 ? "stout" : "adult" });
const SCI = { jacket: "#f4f4f0", pants: "#3a3a48", boots: INK, hat: "hair", hair: "#8a8a90", skin: "#f2d2b6", build: "adult" };
const BOSS = { jacket: "#5a5e68", pants: "#5a5e68", boots: INK, hat: "hair", hair: "#d8d8dc", moustache: "#d8d8dc", skin: "#ecc8a8", build: "stout" };
const XL = {
  shades: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + 0.02 * H.HH; R(g, 300 - 62, y - 18, 56, 36, 10, "#111118", 0); R(g, 300 + 6, y - 18, 56, 36, 10, "#111118", 0); line(g, [[294, y - 6], [306, y - 6]], "#111118", 6); },
  glasses: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + 0.02 * H.HH; E(g, 300 - 34, y, 26, 22, 0, "rgba(220,240,255,0.25)", 6); E(g, 300 + 34, y, 26, 22, 0, "rgba(220,240,255,0.25)", 6); line(g, [[292, y], [308, y]], INK, 5); },
  phones: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + 0.05 * H.HH, r = 0.5 * H.HH; g.beginPath(); g.arc(300, y, r, Math.PI * 1.08, Math.PI * 1.92); g.strokeStyle = INK; g.lineWidth = 22; g.stroke(); g.strokeStyle = "#5a5e68"; g.lineWidth = 12; g.stroke();
    for (const s of [-1, 1]) R(g, 300 + s * r - 26, y - 30, 52, 70, 18, "#2a2a30", 7); },
  clip: (p) => { const H = p.hands; if (!H || !H.l) return; const g = p.g; R(g, H.l[0] - 60, H.l[1] - 140, 120, 160, 8, "#c89a5a", 6); R(g, H.l[0] - 48, H.l[1] - 124, 96, 130, 4, "#ffffff", 4); for (let i = 0; i < 4; i++) line(g, [[H.l[0] - 34, H.l[1] - 100 + i * 26], [H.l[0] + 34, H.l[1] - 100 + i * 26]], "#8a8a92", 5); },
  whistle: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; R(g, H.r[0] - 30, H.r[1] - 30, 60, 34, 12, "#e8b83a", 6); },
  sandwich: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(oc(256, 128, K.drawFish), H.r[0] - 110, H.r[1] - 70, 200, 100); },
  receipt: (u) => (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(oc(256, 1024, (g) => K.drawReceipt(g, u)), H.r[0] - 60, H.r[1] - 30, 130, 520); },
  memo: (p) => { const H = p.hands; if (!H || !H.r || !H.l) return; p.g.drawImage(oc(576, 768, (g) => K.drawMemo(g, {})), (H.l[0] + H.r[0]) / 2 - 90, Math.min(H.l[1], H.r[1]) - 200, 180, 240); },
  trophy: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(oc(384, 512, K.drawTrophy), H.r[0] - 80, H.r[1] - 230, 170, 226); },
};

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const mkA = (base) => (x, y, z) => [base[0] + x, base[1] + y, base[2] + z];
  const p_ = mkA(PARK), l_ = mkA(ROOM.office), w_ = mkA(ROOM.war), v_ = mkA([2600, 2000, 0]);
  const day = { light: "day", sunAz: 210, sunEl: 55, fogFar: 2500 };
  const PK = { ...day }, LAB = { ...day, props: { office: true } }, WAR = { ...day, props: { war: true } }, VAN = { ...day };
  const at = (Af) => ({
    fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
    ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); },
  });
  const A = at(p_), L = at(l_), W = at(w_), V = at(v_);
  const G = 0.105, BY = 0.92;
  const q = (v, n = 10) => Math.round((v ?? 0) * n);
  const mk = (H, out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); H.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic" }); };
  const wd = (H, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); H.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const bd = (H, out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; H.fx(out, key, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const bub = (H, out, key, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = smooth(u * 4); H.fx(out, key, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic" }); };
  const sparkle = (H, out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) H.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  const confetti = (out, c, t) => { const k = Math.floor(t * 12) % 24; screenCard(out, c, "conf" + k, (p) => DR.confetti(p, k), 0.5, 576, 1024, "basic"); };
  const zzz = (H, out, t, x, y, z, s = 0.4) => { const k = Math.floor(t * 10) % 12; H.fx(out, "zzz" + k, (p) => DR.zzz(p, k), x, y, z, s, s, { cw: 256, ch: 256, kind: "basic" }); };
  // the cat card (768 x 512, feet at y 490): w wide, feet on yG
  const cat = (H, out, t, x, yG, z, w, o = {}) => { const k = o.walk ? Math.floor(t * (o.rate ?? 10)) % 8 : -1, lk = Math.floor(t * 8) % 6;
    const st = { pose: o.pose ?? "stand", face: o.face ?? "happy", shades: !!o.shades, mic: !!o.mic, tx: !!o.tx, wire: q(o.wire, 12) / 12, glow: !!o.glow && lk % 3 !== 0, k, bandage: !!o.bandage, flip: !!o.flip, listen: !!o.listen, lk: o.listen || o.tx ? lk : 0 };
    const key = "cat" + Object.values(st).map((v) => (v === true ? 1 : v === false ? 0 : v)).join("_"), h = w * 2 / 3;
    H.fx(out, key, (p) => K.drawCat(p.g, st), x, yG + h * 0.457, z, w, h, { cw: 768, ch: 512, kind: "lit", rot: o.rot ?? 0 }); };
  const spy = (o = {}) => ({ mic: true, tx: true, wire: 1, glow: true, ...o });
  const agents = (H, out, t, mood, pts, base = 10, y = 0, kind = AGENT) => pts.forEach(([x, z], i) => { const o = kind(i);
    const opt = mood === "shock" ? { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] } } : mood === "nervous" ? { expr: "nervous", arms: { l: ["face", 1], r: ["face", 1] } }
      : mood === "listen" ? { expr: i % 2 ? "suspicious" : "look_up", arms: { l: ["head", 1], r: ["hips", 1] } } : mood === "clap" ? { expr: i % 2 ? "laugh" : "grin", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 12 + i) * 6 }
      : mood === "face" ? { expr: "annoyed", arms: { l: ["face", 1], r: ["hips", 1] } } : { expr: "stern", arms: { l: ["hips", 1], r: ["hips", 1] } };
    const ex = kind === TECH ? (p) => { XL.phones(p); } : XL.shades;
    H.ppl(out, base + i, { ...o, xk: kind === TECH ? "ph" : "sh" }, x, z, { ...opt, extra: ex }, y); });
  const reds = (out, t, talk = true, o = {}) => [[-0.48, 0], [0.5, 1]].forEach(([x, i]) => A.ppl(out, 30 + i, { ...RED(i), xk: o.fish && i === 1 ? "f" : "" }, x, -2.62, { mode: "sit", keep: true, expr: talk ? (Math.floor(t * 6 + i * 3) % 2 ? "talk_o" : "talk_e") : (o.expr ?? "smile"), arms: o.fish && i === 1 ? { l: ["low", 1], r: ["hold", 1] } : { l: ["out", 0.6], r: ["low", 1] }, extra: o.fish && i === 1 ? XL.sandwich : undefined, headTilt: Math.sin(t * 4 + i) * 4 }, 0.55));
  const van = (out, t, x, door = 0, moving = false) => { const k = moving ? Math.floor(t * 14) % 12 : 0, d = Math.round(door * 8) / 8; A.fx(out, "van" + k + "_" + d, (p) => K.drawVan(p.g, { k, door: d }), x, 0.11 + 1.25, 10.2, 5.0, 2.5, { cw: 1024, ch: 512, kind: "lit", normal: [0, 0, -1] }); };
  const vanBack = (out, c, t, nosig = false) => { const k = Math.floor(t * 8) % 24; screenCard(out, c, "vin" + k + (nosig ? "n" : ""), (p) => K.drawVanIn(p.g, k, { nosig }), 3.2, 576, 1024, "basic"); };
  const memo = (H, out, x, y, z, w, o = {}) => { const su = q(o.su ?? 1, 8) / 8, key = "memo" + [o.stamp || "", su, o.subj || "", o.cat ? 1 : 0].join("_"); H.fx(out, key, (p) => K.drawMemo(p.g, { ...o, su }), x, y, z, w, w * 4 / 3, { cw: 576, ch: 768, kind: "lit", rot: o.rot ?? 0 }); };
  const xray = (out, t, stage, u = 1) => { const k = Math.floor(t * 8) % 8, uu = q(u, 12) / 12; L.fx(out, "xr" + stage + "_" + k + "_" + uu, (p) => K.drawXray(p.g, stage, k, uu), 0, BY + 0.56, -0.5, 0.72, 0.96, { cw: 576, ch: 768, kind: "basic" }); };
  const sci = (out, t, x, z, opt = {}) => L.ppl(out, 20, { ...SCI, xk: opt.xk || "" }, x, z, { expr: "proud", arms: { l: ["hips", 1], r: ["hips", 1] }, ...opt, extra: opt.extra ? (p) => { XL.glasses(p); opt.extra(p); } : XL.glasses });
  const boss = (H, out, t, x, z, opt = {}) => H.ppl(out, 21, { ...BOSS, xk: opt.xk || "" }, x, z, { expr: "stern", arms: { l: ["hips", 1], r: ["hips", 1] }, ...opt });

  // ---- hero (shot 1 + loop): the spy cat strolling along the park path, glowing antenna tail, earpiece; two men on the bench behind
  const heroCam = push(p_(0.1, 0.5, 2.2), p_(0.05, 0.55, -1.0), p_(0.05, 0.48, 1.85), p_(0.05, 0.55, -1.0), 50, 2.0);
  const heroStage = (t, out, u = 0) => { cat(A, out, t, lerp(-0.35, 0.2, clamp01(u)), G, 0, 1.0, spy({ face: "sly", walk: true, listen: true })); reds(out, t, true); };
  // 1 The CIA turned a cat…
  shot({ a: 0, ...PK, cam: heroCam, cInf: 1.0, focus: p_(0, 0.45, 0), shadowR: 8, stage(t, out) { heroStage(t, out, 0.35 + t * 0.35); } });
  // 2 …into a spy.: close on the cat's face, sunglasses drop on, SPY!
  const tSpy = T("spy");
  shot({ at: S("into"), ...PK, cam: push(p_(0.25, 0.47, 1.0), p_(0.25, 0.47, 0), p_(0.25, 0.47, 0.85), p_(0.25, 0.47, 0), 40, 1.3), cInf: 2.0, focus: p_(0.25, 0.45, 0), shadowR: 6,
    stage(t, out) { const on = t > tSpy - 0.12; cat(A, out, t, 0, G, 0, 1.0, spy({ face: on ? "smug" : "sly", shades: on })); sparkle(A, out, t, 0.3, 0.52, 0.05, 0.06, on ? 3 : 0); wd(A, out, "SPY!", "#d8202e", 0.05, 0.72, 0.1, (t - tSpy) * 3, 0.42); } });
  kick1(tSpy);
  // 3 This is real. Declassified.: a TOP SECRET memo on the briefing table, DECLASSIFIED slams on
  const tDe = T("Declassified");
  shot({ at: S("This is"), ...WAR, cam: push(w_(0, 1.25, 1.25), w_(0, 1.2, 0), w_(0, 1.22, 1.05), w_(0, 1.2, 0), 46, 1.9), cInf: 1.6, focus: w_(0, 1.2, 0), shadowR: 8,
    stage(t, out) { const sl = t > tDe - 0.1; memo(W, out, 0, 0.78 + 0.42, 0, 0.62, { stamp: sl ? "DECLASSIFIED" : "TOP SECRET", su: sl ? smooth((t - tDe + 0.1) / 0.15) : 1, cat: true, rot: 0.03 }); agents(W, out, t, sl ? "shock" : "stern", [[0.62, -0.9]], 10); } });
  kick1(tDe + 0.05);
  // 4 Step one: surgery.: the lab; the cat asleep on the bench, a scientist with a tiny microphone
  shot({ at: S("Step"), ...LAB, cam: push(l_(0.15, 1.5, 1.7), l_(-0.1, 1.15, -0.9), l_(0.1, 1.45, 1.45), l_(-0.1, 1.15, -0.9), 46, 1.6), cInf: 1.3, focus: l_(0, 1.1, -0.7), shadowR: 8,
    stage(t, out) { cat(L, out, t, 0.25, BY, -0.38, 0.85, { pose: "lie", face: "sleep" }); zzz(L, out, t, 0.6, BY + 0.55, -0.35, 0.3); sci(out, t, -0.65, -1.85, { expr: t > T("surgery") ? "grin" : "proud", arms: { l: ["up", 1], r: ["point", 1] } });
      wd(L, out, "SURGERY?!", "#d8202e", -0.1, BY + 1.05, -0.5, (t - T("surgery")) * 3, 0.9); } });
  // 5 A microphone… inside its ear.: x-ray on the lightbox: the mic lights up in the ear
  shot({ at: S("A microphone"), ...LAB, cam: push(l_(0.06, BY + 0.72, 1.15), l_(0.06, BY + 0.76, -0.5), l_(0.07, BY + 0.78, 0.95), l_(0.07, BY + 0.8, -0.5), 46, 1.8), cInf: 2.0, focus: l_(0, BY + 0.6, -0.9), shadowR: 6,
    stage(t, out) { xray(out, t, t > T("ear") - 0.2 ? 1 : 0); sci(out, t, -0.75, -1.6, { expr: "look_up", arms: { l: ["hips", 1], r: ["point", 1] } }); } });
  kick1(T("ear") - 0.1);
  // 6 A radio transmitter… at the base of its skull.: the radio box blinks at the back of the skull
  shot({ at: S("A radio"), ...LAB, cam: push(l_(-0.04, BY + 0.66, 1.0), l_(-0.04, BY + 0.66, -0.5), l_(-0.04, BY + 0.68, 0.82), l_(-0.04, BY + 0.68, -0.5), 46, 2.6), cInf: 2.4, focus: l_(-0.08, BY + 0.6, -0.9), shadowR: 6,
    stage(t, out) { xray(out, t, t > T("base") - 0.2 ? 2 : 1); } });
  kick1(T("base") - 0.1);
  // 7 The antenna? Woven through its fur…: the cat on the bench, a glowing wire runs along its back
  const tWo = T("Woven"), tTl = T("tail");
  shot({ at: S("The antenna"), ...LAB, cam: push(l_(0.0, 1.3, 1.0), l_(0, 1.18, -0.6), l_(0.0, 1.28, 0.85), l_(0, 1.18, -0.6), 46, 2.0), cInf: 1.6, focus: l_(0, 1.15, -0.6), shadowR: 6,
    stage(t, out) { const u = clamp01((t - tWo + 0.2) / (tTl - tWo)); cat(L, out, t, 0, BY, -0.4, 0.9, { mic: true, tx: true, wire: u, face: u > 0 ? "shock" : "annoyed" }); wd(L, out, "ANTENNA?", "#3a8ad8", -0.15, 1.72, -0.5, (t - T("antenna")) * 3, 0.7); } });
  // 8 …down to the tail.: close on the tail tip: it lights up, BEEP!
  shot({ at: S("down to"), ...LAB, cam: push(l_(-0.3, 1.36, 0.35), l_(-0.3, 1.33, -0.4), l_(-0.3, 1.36, 0.22), l_(-0.3, 1.33, -0.4), 44, 1.3), cInf: 2.5, focus: l_(-0.3, 1.33, -0.6), shadowR: 5,
    stage(t, out) { cat(L, out, t, 0, BY, -0.4, 0.9, { mic: true, tx: true, wire: 1, glow: t > tTl - 0.1, face: "shock" }); wd(L, out, "BEEP!", "#3ad8e8", -0.15, 1.46, -0.35, (t - tTl) * 3, 0.32); } });
  kick1(tTl);
  // 9 The mission:: the briefing room; the boss points at the chalk plan
  shot({ at: S("The mission"), ...WAR, cam: push(w_(1.6, 1.7, 0.6), w_(1.6, 1.75, -4.4), w_(1.6, 1.72, 0.3), w_(1.6, 1.77, -4.4), 54, 1.6), cInf: 1.0, focus: w_(1.2, 1.8, -4.2), shadowR: 10,
    stage(t, out) { const u = clamp01((t - T("stroll")) / 1.4); W.fx(out, "plan" + q(u, 8), (p) => K.drawPlan(p.g, q(u, 8) / 8), 1.8, 1.9, -4.36, 2.6, 1.73, { cw: 768, ch: 512, kind: "lit", normal: [0, 0, 1] });
      boss(W, out, t, 0.6, -3.5, { expr: "sly", arms: { l: ["hips", 1], r: ["point", 1] } }); } });
  // 10 …stroll up to enemy agents… and listen.: the park: the cat strolls toward the two men on the bench, sound waves
  const tLi = T("listen");
  shot({ at: S("stroll"), ...PK, cam: push(p_(-0.6, 1.05, 2.4), p_(-0.1, 0.65, -1.8), p_(-0.45, 1.0, 2.1), p_(-0.1, 0.65, -1.8), 50, 2.4), cInf: 1.0, focus: p_(0, 0.6, -1.4), shadowR: 8,
    stage(t, out) { const l = clamp01((t - S("stroll")) / 2.2); cat(A, out, t, lerp(-1.1, -0.4, l), G, -1.25, 0.8, spy({ face: "sly", walk: l < 1, listen: t > tLi - 0.2 })); reds(out, t, true);
      wd(A, out, "SHHH...", "#3a8ad8", -0.6, 0.95, -1.1, (t - tLi) * 3, 0.7); } });
  // 11 Who suspects a cat?: the men smile down at the cat sitting innocently in front of them; MEOW?
  shot({ at: S("Who"), ...PK, cam: push(p_(0.05, 0.95, 0.45), p_(0, 0.75, -2.5), p_(0.05, 0.92, 0.25), p_(0, 0.75, -2.5), 48, 1.3), cInf: 1.6, focus: p_(0, 0.6, -2.2), shadowR: 6,
    stage(t, out) { cat(A, out, t, 0, G, -1.9, 0.7, spy({ pose: "sit", face: "innocent", wire: 0 })); reds(out, t, false, { expr: "grin" }); bub(A, out, "bubM", "MEOW?", "#c87a3a", 0.32, 0.85, -1.85, (t - T("suspects")) * 3, 0.55); } });
  // 12 One problem. It's a cat.: the cat flops on its back on the path, paws up
  shot({ at: S("One problem"), ...PK, cam: push(p_(0.05, 0.5, 2.1), p_(0, 0.35, 0), p_(0.04, 0.48, 1.85), p_(0, 0.35, 0), 46, 1.8), cInf: 1.6, focus: p_(0, 0.3, 0), shadowR: 6,
    stage(t, out) { const fl = t > T("It's") - 0.15; cat(A, out, t, 0, G + (fl ? 0.02 : 0), 0, 0.85, spy({ pose: fl ? "flip" : "stand", face: fl ? "happy" : "bored", wire: 1, glow: false })); mk(A, out, "?", -0.35, 0.7, 0.05, (t - T("problem")) * 3, 0.25, "#ffe85a");
      wd(A, out, "IT'S A CAT.", "#2a2a36", 0.05, 0.86, 0.1, (t - T("cat", T("It's"))) * 3, 0.7); } });
  kick1(T("It's"));
  // 13 It got bored.: the cat yawns and dozes on the path; ZZZ
  shot({ at: S("It got bored"), ...PK, cam: push(p_(-0.1, 0.48, 1.95), p_(0.05, 0.32, 0), p_(-0.08, 0.46, 1.75), p_(0.05, 0.32, 0), 46, 1.0), cInf: 1.6, focus: p_(0, 0.3, 0), shadowR: 6,
    stage(t, out) { const sl = t > T("bored") + 0.15; cat(A, out, t, 0, G, 0, 0.85, spy({ pose: "lie", face: sl ? "sleep" : "bored", glow: false })); if (sl) zzz(A, out, t, 0.32, 0.5, 0.05, 0.3); } });
  // 14 It got hungry.: the cat stares at the man's fish sandwich, drooling; GRRR
  shot({ at: S("It got hungry"), ...PK, cam: push(p_(0.3, 0.7, -0.3), p_(0.3, 0.62, -2.6), p_(0.3, 0.69, -0.55), p_(0.3, 0.62, -2.6), 48, 1.8), cInf: 1.8, focus: p_(0.4, 0.7, -2.3), shadowR: 6,
    stage(t, out) { cat(A, out, t, 0.1, G, -1.95, 0.6, spy({ pose: "sit", face: "hungry", wire: 0 })); reds(out, t, false, { fish: true, expr: "nervous" }); wd(A, out, "GRRR!", "#d87a2a", 0.05, 0.75, -1.9, (t - T("hungry")) * 3, 0.45); } });
  kick1(T("hungry") + 0.1);
  // 15 It wandered off.: the cat trots away after a butterfly, the path empty
  shot({ at: S("It wandered"), ...PK, cam: push(p_(0.2, 0.55, 2.0), p_(-0.6, 0.45, 0), p_(0.05, 0.52, 1.9), p_(-0.9, 0.45, 0), 50, 1.2), cInf: 1.2, focus: p_(-0.6, 0.4, 0), shadowR: 6,
    stage(t, out) { const l = t - S("It wandered"); cat(A, out, t, lerp(0.1, -1.4, clamp01(l / 1.2)), G, 0, 0.85, spy({ flip: true, walk: true, rate: 14, face: "happy", glow: false })); const k = Math.floor(t * 10) % 8;
      A.fx(out, "fly" + k, (p) => K.drawFly(p.g, k), lerp(-0.6, -1.9, clamp01(l / 1.2)), 0.75 + Math.sin(t * 9) * 0.06, 0.05, 0.22, 0.22, { cw: 256, ch: 256, kind: "basic" }); wd(A, out, "BYE!", "#3a8ad8", 0.3, 0.9, 0.1, (t - T("off") + 0.1) * 3, 0.5); } });
  // 16 So they operated again…: back in the lab: bandaged cat, annoyed; the scientist with a clipboard
  shot({ at: S("So they"), ...LAB, cam: push(l_(-0.15, 1.4, 1.7), l_(-0.15, 1.2, -0.8), l_(-0.14, 1.38, 1.5), l_(-0.15, 1.2, -0.8), 48, 1.4), cInf: 1.4, focus: l_(0, 1.1, -0.6), shadowR: 8,
    stage(t, out) { cat(L, out, t, 0.02, BY, -0.4, 0.7, spy({ pose: "sit", face: "annoyed", bandage: true, wire: 0 })); sci(out, t, -0.6, -1.7, { expr: "grin", arms: { l: ["hold", 1], r: ["point", 1] }, extra: XL.clip, xk: "c" });
      wd(L, out, "AGAIN?!", "#d8202e", 0.3, 1.75, -0.5, (t - T("again")) * 3, 0.6); } });
  // 17 …to fix the hunger.: a HUNGER sign gets crossed out; the cat ignores a fish
  shot({ at: S("to fix"), ...LAB, cam: push(l_(0.1, 1.4, 0.9), l_(0.1, 1.3, -0.9), l_(0.1, 1.38, 0.75), l_(0.1, 1.3, -0.9), 46, 1.3), cInf: 1.8, focus: l_(0.1, 1.3, -0.8), shadowR: 6,
    stage(t, out) { const u = clamp01((t - T("hunger") + 0.05) / 0.3); L.fx(out, "sign" + q(u, 6), (p) => K.drawSign(p.g, "HUNGER", q(u, 6) / 6), 0.1, BY + 0.62, -1.2, 0.8, 0.4, { cw: 768, ch: 384, kind: "lit", normal: [0, 0, 1] });
      cat(L, out, t, -0.06, BY, -0.4, 0.6, spy({ pose: "sit", face: u > 0.5 ? "smug" : "hungry", bandage: true, wire: 0 })); L.fx(out, "fish", (p) => K.drawFish(p.g), 0.28, BY + 0.06, -0.38, 0.22, 0.11, { cw: 256, ch: 128, kind: "lit" }); } });
  kick1(T("hunger") + 0.15);
  // 18 Then training.: an agent blows a whistle, the cat sits there, unimpressed
  shot({ at: S("Then"), ...PK, cam: push(p_(0.4, 0.9, 2.6), p_(0.1, 0.8, -0.2), p_(0.35, 0.88, 2.35), p_(0.1, 0.8, -0.2), 50, 1.2), cInf: 1.0, focus: p_(0, 0.7, 0), shadowR: 8,
    stage(t, out) { cat(A, out, t, 0.45, G, 0.2, 0.7, spy({ pose: "sit", face: "bored", glow: false })); A.ppl(out, 10, { ...AGENT(0), xk: "w" }, -0.45, -0.2, { expr: "angry", arms: { l: ["hips", 1], r: ["face", 1] }, extra: (p) => { XL.shades(p); XL.whistle(p); } }, G);
      wd(A, out, "TWEET!", "#e8b83a", -0.15, 1.75, -0.1, (t - T("training")) * 3, 0.6); } });
  // 19 Five years of it.: calendar pages flip, 5 YEARS
  shot({ at: S("Five"), ...WAR, cam: push(w_(0, 1.32, 1.45), w_(0, 1.3, 0), w_(0, 1.3, 1.3), w_(0, 1.3, 0), 46, 1.2), cInf: 1.8, focus: w_(0, 1.2, 0), shadowR: 6,
    stage(t, out) { const pg = Math.min(5, 1 + Math.floor(Math.max(0, t - T("Five")) * 5)); W.fx(out, "cal" + pg, (p) => K.drawCal(p.g, "YEAR " + pg), 0, 1.15, 0, 0.62, 0.7, { cw: 512, ch: 576, kind: "lit", rot: Math.sin(t * 9) * 0.03 });
      bd(W, out, "b5", "5", "YEARS", "#2a5aa8", 0.12, 1.58, 0.12, (t - T("years") + 0.05) * 3, 0.6); } });
  // 20 Finally, the big test.: the van rolls up the street and stops across from the park
  shot({ at: S("Finally"), ...PK, cam: push(p_(-0.5, 1.4, 1.4), p_(0, 1.5, 10), p_(-0.4, 1.4, 1.7), p_(0, 1.5, 10), 54, 1.8), cInf: 0.7, focus: p_(0, 1.3, 10), shadowR: 15,
    stage(t, out) { const l = clamp01((t - S("Finally")) / 1.1); van(out, t, lerp(-12, 0, glide(l)), 0, l < 1); wd(A, out, "TEST DAY!", "#d8202e", 0, 3.1, 8.0, (t - T("test")) * 3, 2.2); } });
  // 21 Agents park a van full of dials…: inside the van: headphones, dials twitching
  shot({ at: S("Agents park"), ...VAN, cam: push(v_(0, 1.55, 2.1), v_(0, 1.5, 0), v_(0, 1.55, 1.85), v_(0, 1.5, 0), 50, 2.0), cInf: 1.0, focus: v_(0, 1.5, 0), shadowR: 6,
    stage(t, out, c) { vanBack(out, c, t); agents(V, out, t, "listen", [[-0.5, 0], [0.5, 0.1]], 10, 0, TECH); mk(V, out, "BEEP", 0, 2.1, 0.3, (t - T("dials")) * 3, 0.25, "#7af07a"); } });
  // 22 …near men on a park bench.: through binoculars: the two men talking on the bench
  shot({ at: S("near"), ...PK, cam: push(p_(0.2, 1.3, 5.8), p_(0, 0.95, -2.6), p_(0.15, 1.28, 5.5), p_(0, 0.95, -2.6), 30, 1.7), cInf: 0.8, focus: p_(0, 0.9, -2.6), shadowR: 8,
    stage(t, out, c) { reds(out, t, true); screenCard(out, c, "bino", (p) => K.drawBino(p.g), 0.3, 576, 1024, "basic"); } });
  // 23 They open the door. The cat hops out…: the van's sliding door opens, the cat leaps out onto the sidewalk
  const tHop = T("hops");
  shot({ at: S("They open"), ...PK, cam: push(p_(-1.0, 1.0, 4.4), p_(0.4, 1.0, 10), p_(-0.85, 1.0, 4.7), p_(0.4, 1.0, 10), 50, 2.2), cInf: 0.9, focus: p_(0.4, 1.0, 9.6), shadowR: 10,
    stage(t, out) { const d = smooth((t - T("open") + 0.05) / 0.4); van(out, t, 0, d); const l = clamp01((t - tHop + 0.1) / 0.5);
      if (t > T("The cat") - 0.1) cat(A, out, t, lerp(0.2, 0.2, l), lerp(0.55, 0.13, l) + Math.sin(l * Math.PI) * 0.5, lerp(9.8, 7.6, l), 0.75, spy({ flip: true, face: "smug", shades: true, rot: (1 - l) * 0.25 }));
      wd(A, out, "GO!", "#2a8a4a", 0.2, 2.1, 9.4, (t - T("door")) * 3, 0.7); } });
  kick1(tHop);
  // 24 Wait, it gets worse.: push into the agents' nervous faces inside the van
  shot({ at: S("Wait"), ...VAN, cam: (l) => ({ pos: v_(0, 1.55, 2.0 - glide(l / 1.2) * 0.9), look: v_(0, 1.55, 0), fov: 46, roll: 0.03 * Math.sin(l * 4) }), cInf: 2.0, focus: v_(0, 1.55, 0), shadowR: 6,
    stage(t, out, c) { vanBack(out, c, t); agents(V, out, t, "nervous", [[-0.42, 0], [0.42, 0.05]], 10, 0, TECH); } });
  // 25 It never even reached the bench.: the bench: the men chat on, the path empty; a big ? where the cat should be
  shot({ at: S("It never"), ...PK, cam: push(p_(0.3, 0.8, 2.6), p_(0, 0.7, -2.4), p_(0.25, 0.78, 2.3), p_(0, 0.7, -2.4), 48, 1.8), cInf: 1.0, focus: p_(0, 0.6, -1.8), shadowR: 8,
    stage(t, out) { reds(out, t, true); mk(A, out, "?", 0, 0.5, -1.2, (t - T("reached")) * 3, 0.55, "#ffe85a"); wd(A, out, "NO CAT.", "#2a2a36", 0, 1.5, -1.0, (t - T("bench", T("reached"))) * 3, 0.9); } });
  // 26 The total bill?: the boss unrolls a never-ending receipt
  shot({ at: S("The total"), ...WAR, cam: push(w_(0.3, 1.4, 1.7), w_(0.2, 1.25, -1.2), w_(0.3, 1.38, 1.5), w_(0.2, 1.25, -1.2), 50, 1.2), cInf: 1.0, focus: w_(0.2, 1.3, -1.2), shadowR: 8,
    stage(t, out) { const u = clamp01((t - S("The total")) / 0.9); boss(W, out, t, 0, -1.4, { expr: u > 0.6 ? "shock" : "suspicious", arms: { l: ["hips", 1], r: ["up", 1] }, extra: XL.receipt(Math.round(u * 8) / 8), xk: "r" + Math.round(u * 8) }); } });
  // 27 Reportedly twenty million dollars.: the big number + money raining
  const tDo = T("dollars");
  shot({ at: S("Reportedly"), ...WAR, cam: push(w_(0, 1.55, 1.7), w_(0, 1.6, -1.0), w_(0, 1.55, 1.45), w_(0, 1.6, -1.0), 50, 1.6), cInf: 1.0, focus: w_(0, 1.5, -1.0), shadowR: 8,
    stage(t, out) { boss(W, out, t, 0, -1.4, { expr: t > T("million") ? "dazed" : "shock", arms: { l: ["head", 1], r: ["head", 1] } }); bd(W, out, "b20", "$20,000,000", "REPORTEDLY", "#2a8a4a", 0, 2.05, -0.3, (t - T("twenty") + 0.1) * 3, 1.1);
      for (let i = 0; i < 8; i++) { const ph = (t * 0.9 + i / 8) % 1; mk(W, out, "$", -0.9 + i * 0.26, 2.8 - ph * 2.2, -0.75 + (i % 3) * 0.1, (t - T("million")) * 3, 0.22, "#7ad04a"); } } });
  kick1(T("twenty"));
  // 28 The final memo said…: the memo, "Views on Trained Cats"
  shot({ at: S("The final"), ...WAR, cam: push(w_(-0.1, 1.3, 1.25), w_(0, 1.2, 0), w_(-0.08, 1.25, 1.0), w_(0, 1.2, 0), 46, 1.9), cInf: 1.6, focus: w_(0, 1.2, 0), shadowR: 8,
    stage(t, out) { memo(W, out, 0, 0.78 + 0.42, 0, 0.62, { subj: "VIEWS ON TRAINED CATS", cat: true, rot: -0.02 }); boss(W, out, t, 0.62, -0.95, { expr: "suspicious", arms: { l: ["hips", 1], r: ["face", 1] } }); } });
  // 29 …spy cats were not practical.: NOT PRACTICAL stamped across it
  const tNp = T("not", T("final"));
  shot({ at: S("spy cats"), ...WAR, cam: push(w_(0, 1.2, 1.15), w_(0, 1.12, 0), w_(0, 1.18, 1.0), w_(0, 1.12, 0), 44, 1.8), cInf: 2.0, focus: w_(0, 1.1, 0), shadowR: 6,
    stage(t, out) { const sl = t > tNp - 0.1; memo(W, out, 0, 0.78 + 0.42, 0, 0.62, { subj: "VIEWS ON TRAINED CATS", cat: true, catFace: sl ? "sleep" : "smug", stamp: sl ? "NOT PRACTICAL" : null, su: smooth((t - tNp + 0.1) / 0.15), rot: -0.02 }); } });
  kick1(tNp + 0.05);
  // 30 But their big discovery?: the scientist and an agent lean in, sparkles
  shot({ at: S("But"), ...LAB, cam: push(l_(0, 1.55, 1.1), l_(0, 1.5, -1.2), l_(0, 1.55, 0.9), l_(0, 1.5, -1.2), 48, 1.4), cInf: 1.4, focus: l_(0, 1.5, -1.2), shadowR: 6,
    stage(t, out) { sci(out, t, -0.42, -1.3, { expr: "look_up", arms: { l: ["face", 1], r: ["face", 1] } }); agents(L, out, t, "listen", [[0.45, -1.35]], 10); sparkle(L, out, t, 0, 1.9, -1.0, 0.15, 4); wd(L, out, "DRUMROLL...", "#c8a03a", 0, 2.15, -0.9, (t - T("discovery")) * 3, 0.9); } });
  // 31 Cats can be trained…: the cat on the bench between a START and a FINISH flag
  shot({ at: S("Cats can"), ...LAB, cam: push(l_(0.0, 1.3, 1.0), l_(0, 1.15, -0.6), l_(0.0, 1.28, 0.85), l_(0, 1.15, -0.6), 46, 1.4), cInf: 1.6, focus: l_(0, 1.15, -0.6), shadowR: 6,
    stage(t, out) { cat(L, out, t, -0.18, BY, -0.4, 0.6, spy({ face: "proud", glow: false })); for (const [x, s, col] of [[-0.34, "START", "#2a8a4a"], [0.32, "FINISH", "#d8202e"]]) L.fx(out, "flag" + s, (p) => K.drawFlagS(p.g, s, col), x, BY + 0.2, -0.5, 0.27, 0.4, { cw: 256, ch: 384, kind: "lit" });
      sci(out, t, -0.75, -1.6, { expr: "grin", arms: { l: ["hips", 1], r: ["point", 1] } }); } });
  // 32 …to walk short distances.: the cat walks the whole 40 cm; the crowd goes wild
  shot({ at: S("to walk"), ...LAB, cam: push(l_(0.05, 1.22, 0.75), l_(0, 1.12, -0.6), l_(0.03, 1.2, 0.65), l_(0, 1.12, -0.6), 44, 1.8), cInf: 1.8, focus: l_(0, 1.1, -0.6), shadowR: 6,
    stage(t, out) { const l = clamp01((t - T("walk")) / 1.3); cat(L, out, t, lerp(-0.2, 0.15, l), BY, -0.4, 0.6, spy({ face: l >= 1 ? "proud" : "smug", walk: l < 1, rate: 8, glow: false }));
      for (const [x, s, col] of [[-0.34, "START", "#2a8a4a"], [0.32, "FINISH", "#d8202e"]]) L.fx(out, "flag" + s, (p) => K.drawFlagS(p.g, s, col), x, BY + 0.2, -0.5, 0.27, 0.4, { cw: 256, ch: 384, kind: "lit" });
      wd(L, out, "WOW.", "#2a2a36", 0, 1.55, -0.55, (t - T("distances") + 0.1) * 3, 0.4); } });
  // 33 A remarkable scientific achievement.: the scientist raises a trophy, agents clap, confetti
  shot({ at: S("A remarkable"), ...LAB, cam: push(l_(0, 1.5, 1.9), l_(0, 1.35, -1.2), l_(0, 1.48, 1.65), l_(0, 1.35, -1.2), 50, 2.2), cInf: 1.2, focus: l_(0, 1.3, -1.0), shadowR: 8,
    stage(t, out, c) { sci(out, t, 0, -1.35, { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] }, extra: XL.trophy, xk: "t" }); agents(L, out, t, "clap", [[-0.85, -1.3], [0.85, -1.25]], 10); cat(L, out, t, 0.42, BY, -0.38, 0.5, spy({ pose: "sit", face: "smug", shades: true, glow: false }));
      if (t > T("achievement") - 0.2) confetti(out, c, t); } });
  // 34 All that money…: the cat asleep on a heap of cash
  shot({ at: S("All that"), ...WAR, cam: push(w_(0, 1.3, 1.3), w_(0, 1.0, 0), w_(0, 1.28, 1.15), w_(0, 1.0, 0), 46, 1.2), cInf: 1.6, focus: w_(0, 1.0, 0), shadowR: 6,
    stage(t, out) { W.fx(out, "pile", (p) => K.drawPile(p.g), 0, 0.78 + 0.2, 0.05, 1.2, 0.6, { cw: 768, ch: 384, kind: "lit" }); cat(W, out, t, 0, 1.02, 0.12, 0.62, spy({ pose: "lie", face: "sleep", glow: false })); zzz(W, out, t, 0.3, 1.4, 0.15, 0.25); } });
  // 35 …all because: loop: shot 1's view, the cat strolling back into place
  const tL = S("all because");
  shot({ at: tL, ...PK, cam: heroCam, cInf: 1.0, focus: p_(0, 0.45, 0), shadowR: 8, loop: true, stage(t, out) { const k = clamp01((t - tL) / Math.max(0.3, END - tL - 0.05)); heroStage(t, out, lerp(0.0, 0.35, k)); } });
  SHOTS = D.map((s, i) => ({ ...s, a: s.a ?? s.at, b: i + 1 < D.length ? (D[i + 1].a ?? D[i + 1].at) : END + 0.01 }));
  SHOTS.forEach((s, i) => { const base = s.cam, ph = (s.loop ? 0 : (s.at ?? s.a ?? 0)) * 1.7, w = 0.004, dur = s.b - s.a; s.cam = (l0, ...r) => { const l = s.loop ? Math.max(0, dur - l0 - 1 / FPS) : l0, c = base(l, ...r);
    return { ...c, pos: [c.pos[0] + w * Math.sin(l * 1.1 + ph), c.pos[1] + w * 0.7 * Math.sin(l * 1.6 + ph * 2), c.pos[2] + w * Math.sin(l * 0.9 + ph * 3)] }; }; });
  SHOTS.forEach((s, i) => { s.id = i + 1; const c = s.cam(0.3); const fx2 = c.look[0] - c.pos[0], fz2 = c.look[2] - c.pos[2], n = Math.hypot(fx2, fz2) || 1; s.fwd = [fx2 / n, fz2 / n]; });
}

export const shotAt = (t) => SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];
export function frameState(f) {
  const thumb = f < 0; if (thumb && !THUMB) THUMB = thumbShot();
  const t = thumb ? 2.9 : f / FPS, s = thumb ? THUMB : shotAt(t), local = t - s.a, c = s.cam(local);
  const k = s.kicks && s.kicks.length ? kick(t, s.kicks) : 0;
  if (k) { c.look = [c.look[0] + k * 8, c.look[1] - k * 6, c.look[2]]; c.roll = (c.roll ?? 0) + k; }
  const out = { places: [], fx: [], veh: [], props: { ...(s.props || {}) } };
  if (s.stage) s.stage(t, out, c);
  out.places = out.places.filter((pl) => Math.hypot(pl.x - c.pos[0], pl.z - c.pos[2]) > 0.6 || pl.keep);
  return {
    f, t, shot: s.id, light: s.light, grade: s.grade, cam: c, focus: s.focus, cInf: s.cInf ?? 0, props: out.props, veh: out.veh,
    sunK: s.sunK, sunAz: s.sunAz, sunEl: s.sunEl, fwd: s.fwd, fogNear: s.fogNear, fogFar: s.fogFar, shadowR: s.shadowR, near: s.near,
    places: out.places, fx: out.fx, flash: s.flash ? s.flash(t) : 0, fade: 0,
  };
}
