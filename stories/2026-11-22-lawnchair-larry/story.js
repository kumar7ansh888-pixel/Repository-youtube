// Shot plan for "This Man Flew a Lawn Chair to 16,000 Feet" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts: Larry Walters, 2 July 1982, San Pedro / Long Beach: an aluminium lawn chair tied to about 42 helium weather balloons, sandwiches, beer, a pellet gun
// to pop balloons, water jugs as ballast; the tether snapped, he rose to about 16,000 ft, airline pilots reported him, he shot balloons, dropped the gun,
// came down into power lines (Long Beach blackout), fined $1,500; "A man can't just sit around."; the chair is at the Smithsonian (Wikipedia, Guinness
// World Records 2025, Smithsonian Air & Space, Mental Floss). Hook-first (rising on frame 0), a cut every ~1.5-2 s, loop ending (last shot = shot 1 view).
import { PARK } from "./world.js";
import * as K from "./draw_larry.js";
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
const hh = K.hh;

// people
const LARRY = { jacket: "#3a7ac8", pants: "#b89a6a", boots: "#5a3a22", hat: "hair", hair: "#5a3a22", skin: "#f2d2b6", build: "adult" };
const COP = (v) => ({ jacket: "#1f2a4a", pants: "#1f2a4a", boots: INK, hat: "cap", cap: "#1f2a4a", hair: "#2a201a", skin: ["#ecd0b6", "#c99067"][v % 2], build: v % 2 ? "stout" : "adult" });
const PAL = (v) => ({ jacket: ["#c8503a", "#6a9a4a", "#e8b83a", "#8a5ab0"][v % 4], pants: ["#3a3a48", "#5a4a3a"][v % 2], boots: INK, hat: "hair", hair: ["#c89a4a", "#2a201a", "#8a5a32", "#3a2a1a"][v % 4], skin: ["#f2d2b6", "#c99067", "#ecd0b6", "#e8b894"][v % 4], build: "adult" });
const PRESS = (v) => ({ jacket: ["#5a5e68", "#6a5a44", "#2a2e38"][v % 3], pants: "#2a2e38", boots: INK, hat: v % 2 ? "fedora" : "hair", cap: "#4a4a52", hair: ["#2a201a", "#8a8a90", "#c89a4a"][v % 3], skin: ["#f2d2b6", "#e8b894", "#c99067"][v % 3], build: "adult" });
const IMG = {};
const img = (key, w, h, f) => IMG[key] || (IMG[key] = oc(w, h, f));
const XL = {
  glasses: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + 0.02 * H.HH; E(g, 300 - 34, y, 26, 22, 0, "rgba(220,240,255,0.25)", 6); E(g, 300 + 34, y, 26, 22, 0, "rgba(220,240,255,0.25)", 6); line(g, [[292, y], [308, y]], INK, 5); },
  thick: (p) => { const H = p.hands; if (!H) return; const g = p.g, y = H.hc + 0.02 * H.HH; E(g, 300 - 36, y, 32, 28, 0, "rgba(220,240,255,0.55)", 12); E(g, 300 + 36, y, 32, 28, 0, "rgba(220,240,255,0.55)", 12); line(g, [[290, y], [310, y]], INK, 8); },
  gun: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(-1.15); g.drawImage(img("gun", 512, 128, K.drawGun), -150, -40, 260, 65); g.restore(); },
  gunL: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(-0.2); g.drawImage(img("gun", 512, 128, K.drawGun), -150, -40, 260, 65); g.restore(); },
  sandwich: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(img("sw", 256, 128, K.drawSandwich), H.r[0] - 90, H.r[1] - 80, 180, 90); },
  beer: (p) => { const H = p.hands; if (!H || !H.l) return; p.g.drawImage(img("beer", 128, 256, K.drawBeer), H.l[0] - 35, H.l[1] - 120, 70, 140); },
  beerR: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(img("beer", 128, 256, K.drawBeer), H.r[0] - 35, H.r[1] - 120, 70, 140); },
  mic: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(img("mic", 128, 256, K.drawMic), H.r[0] - 30, H.r[1] - 100, 60, 120); },
  ticket: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(img("tk", 512, 768, (g) => K.drawTicket(g, 0)), H.r[0] - 50, H.r[1] - 150, 100, 150); },
};
const withG = (f, thick = false) => (p) => { (thick ? XL.thick : XL.glasses)(p); if (f) f(p); };

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const mkA = (base) => (x, y, z) => [base[0] + x, base[1] + y, base[2] + z];
  const p_ = mkA(PARK), k_ = mkA([2400, 2000, 0]), m_ = mkA([2800, 2000, 0]);
  const day = { light: "day", sunAz: 210, sunEl: 55, fogFar: 2500 };
  const PK = { ...day }, SKY = { ...day, fogFar: 4000 };
  const at = (Af) => ({
    fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
    ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); },
  });
  const A = at(p_), Kk = at(k_), M = at(m_);
  const GY = 0.10;
  const q = (v, n = 10) => Math.round((v ?? 0) * n);
  const mk = (H, out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); H.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic" }); };
  const wd = (H, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); H.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const bd = (H, out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; H.fx(out, key + k, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const bub = (H, out, key, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; H.fx(out, key + k, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic" }); };
  const sparkle = (H, out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) H.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  const flashes = (H, out, t, pts, rate = 3) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; H.fx(out, "flash", (p) => K.drawFlash(p.g), x, y, z, 0.7 * k, 0.7 * k, { cw: 256, ch: 256, kind: "basic" }); } }); };
  const sky = (out, c, t, d = 12, o = {}) => { const k = Math.floor(t * 15) % 900; screenCard(out, c, "sky" + k + (o.high ? "h" : "") + (o.vy ?? 0), (p) => K.drawSky(p.g, k / 15, o), d, 576, 1024, "basic"); };
  const POP7 = [2, 9, 17, 25, 31, 36, 40];
  // Larry in his lawn chair under the balloon cluster; (x, y, z) = bottom of the chair legs. o: expr, arms, extra, n, popped, bursting, jugs, rope, s, noBalloons, headTilt
  const larry = (H, out, t, x, y, z, o = {}) => { const s = o.s ?? 1, k = Math.floor(t * 8) % 48;
    const ck = "ch" + [o.jugs ?? 6, o.rope ?? 0, o.strings === false ? 0 : 1].join("_");
    H.fx(out, ck, (p) => K.drawChair(p.g, { jugs: o.jugs ?? 6, rope: o.rope ?? 0, strings: o.strings }), x, y + 0.55 * s, z - 0.05, 1.1 * s, 1.1 * s, { cw: 768, ch: 768, kind: "lit" });
    if (!o.noBalloons) { const pk = (o.popped || []).join(","), bk = (o.bursting || []).join(","), bs = o.bs ?? 1;
      H.fx(out, "bl" + [k, o.n ?? 42, pk, bk].join("_"), (p) => K.drawBalloons(p.g, { k: k / 8, n: o.n ?? 42, popped: o.popped, bursting: o.bursting }), x, y + (1.1 + 1.5 * bs) * s, z - 0.1, 3.0 * s * bs, 3.0 * s * bs, { cw: 1024, ch: 1024, kind: "lit" }); }
    if (!o.noMan) H.ppl(out, 1, { ...LARRY, xk: o.xk || "" }, x, z, { mode: "sit", keep: true, blob: false, scale: s, expr: o.expr ?? "grin", arms: o.arms ?? { l: ["low", 1], r: ["low", 1] }, headTilt: o.headTilt ?? Math.sin(t * 3) * 4, extra: withG(o.extra) }, y + 0.43 * s); };
  const larryG = (H, out, t, x, z, o = {}, y = GY) => H.ppl(out, 1, { ...LARRY, hat: o.hat ?? "hair", cap: "#6b4a2e", xk: o.xk || "" }, x, z, { keep: true, expr: o.expr ?? "grin", arms: o.arms ?? { l: ["hips", 1], r: ["hips", 1] }, headTilt: o.headTilt ?? 0, extra: withG(o.extra, o.thick), view: o.view, dir: o.dir }, y);
  const pals = (out, t, mood, pts, base = 10) => pts.forEach(([x, z], i) => A.ppl(out, base + i, PAL(i), x, z, mood === "shock" ? { expr: i % 2 ? "shock" : "gasp", arms: { l: ["head", 1], r: [i % 2 ? "point" : "head", 1] } } : mood === "up" ? { expr: "look_up", arms: { l: ["hips", 1], r: ["point", 1] } } : { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 12 + i) * 6 }, GY));
  const plane = (H, out, t, x, y, z, w, o = {}) => { const k = Math.floor(t * 4) % 2; H.fx(out, "pl" + k + (o.face || ""), (p) => K.drawPlane(p.g, { k, face: o.face }), x, y, z, w, w / 2, { cw: 1024, ch: 512, kind: "lit", rot: o.rot ?? 0 }); };

  // ---- hero (shot 1 + loop): Larry rising through the sky in his lawn chair, grinning, beer up; an airliner far behind
  const heroCam = push(k_(0.35, 1.5, 6.4), k_(0, 1.55, 0), k_(0.2, 1.6, 5.7), k_(0, 1.6, 0), 52, 2.2);
  const heroStage = (t, out, c, u) => { sky(out, c, t, 14, { vy: 90 }); const uu = clamp01(u); plane(Kk, out, t, lerp(2.6, 0.2, uu), 3.6, -4, 2.6, { face: "shock" });
    larry(Kk, out, t, 0, lerp(-0.9, 0.0, uu), 0, { expr: "laugh", arms: { l: ["up", 1], r: ["out", 0.8] }, extra: XL.beer }); };
  // 1 A man flew a lawn chair…
  shot({ a: 0, ...SKY, cam: heroCam, cInf: 0.6, focus: k_(0, 1.0, 0), shadowR: 6, stage(t, out, c) { heroStage(t, out, c, 0.4 + t * 0.3); } });
  kick1(0.35);
  // 2 …into the sky.: from below: the chair and the giant cluster against the sky, legs dangling
  shot({ at: S("into"), ...SKY, cam: push(k_(0.4, -1.6, 3.2), k_(0, 1.6, 0), k_(0.3, -1.4, 2.9), k_(0, 1.8, 0), 54, 1.5), cInf: 0.8, focus: k_(0, 1.2, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 10, { vy: 120 }); larry(Kk, out, t, 0, (t - T("into")) * 0.4, 0, { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] } }); } });
  // 3 Not a plane.: an airliner glides past; NOPE!
  shot({ at: S("Not"), ...SKY, cam: push(k_(0, 0.1, 4.0), k_(0, 0.1, 0), k_(0, 0.1, 3.6), k_(0, 0.1, 0), 46, 1.2), cInf: 1.0, focus: k_(0, 0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 9); const l = t - S("Not"); plane(Kk, out, t, lerp(1.6, -0.6, l / 1.2), 0.1, 0, 3.0, { face: "calm" }); Kk.fx(out, "no", (p) => K.drawNo(p.g), 0, 0.1, 0.3, 1.4 * smooth((t - T("plane")) * 5), 1.4 * smooth((t - T("plane")) * 5), { cw: 512, ch: 512, kind: "basic" }); } });
  kick1(T("plane"));
  // 4 A lawn chair.: close on the chair under him, LAWN CHAIR!
  const tLc = T("lawn", T("plane"));
  shot({ at: S("A lawn", T("plane")), ...SKY, cam: push(k_(0.2, 0.9, 2.6), k_(0, 0.75, 0), k_(0.15, 0.85, 2.25), k_(0, 0.75, 0), 46, 1.2), cInf: 1.4, focus: k_(0, 0.7, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 9, { vy: 100 }); larry(Kk, out, t, 0, 0, 0, { expr: "proud", arms: { l: ["hips", 1], r: ["point", 1] } }); wd(Kk, out, "LAWN CHAIR!", "#2f7a48", 0, 0.2, 0.4, (t - tLc) * 3, 1.0); } });
  kick1(tLc);
  // 5 He dreamed of being a pilot.: his yard: Larry in a leather pilot cap, dreaming up at a thought bubble with a plane
  const YX = 22, YZ = -6;
  shot({ at: S("He dreamed"), ...PK, cam: push(p_(YX + 0.3, 1.25, YZ + 3.4), p_(YX, 1.25, YZ), p_(YX + 0.2, 1.25, YZ + 2.9), p_(YX, 1.3, YZ), 48, 1.8), cInf: 1.2, focus: p_(YX, 1.1, YZ), shadowR: 8,
    stage(t, out) { larryG(A, out, t, YX - 0.2, YZ, { hat: "pilot", xk: "pc", expr: "smile_closed", arms: { l: ["hips", 1], r: ["up", 0.9] }, headTilt: 8 }); A.fx(out, "thought", (p) => K.drawThought(p.g), YX + 0.3, 1.85 + 0.03 * Math.sin(t * 3), YZ, 1.1 * smooth((t - T("dreamed")) * 3), 0.73 * smooth((t - T("dreamed")) * 3), { cw: 768, ch: 512, kind: "basic" }); } });
  // 6 Bad eyesight said no.: the eye chart, Larry squinting in thick glasses; a red NO
  const tNo = T("no", T("eyesight"));
  shot({ at: S("Bad"), ...PK, cam: push(p_(YX + 0.1, 1.3, YZ + 2.6), p_(YX + 0.1, 1.25, YZ - 0.3), p_(YX + 0.1, 1.3, YZ + 2.2), p_(YX + 0.1, 1.25, YZ - 0.3), 48, 1.8), cInf: 1.4, focus: p_(YX, 1.2, YZ), shadowR: 8,
    stage(t, out) { A.fx(out, "eye" + (t > T("eyesight") + 0.3 ? 1 : 0), (p) => K.drawEye(p.g, { blur: t > T("eyesight") + 0.3 ? 6 : 0 }), YX + 0.55, 1.35, YZ - 0.6, 0.75, 1.0, { cw: 576, ch: 768, kind: "lit" });
      larryG(A, out, t, YX - 0.35, YZ, { thick: true, xk: "th", expr: t > tNo ? "sad" : "suspicious", arms: { l: ["hips", 1], r: ["face", 1] } });
      const u = (t - tNo) * 4; if (u > 0) A.fx(out, "nostamp", (p) => K.drawNo(p.g), YX + 0.55, 1.4, YZ - 0.5, 0.9 * Math.min(1, smooth(u)) + 0.25 * Math.max(0, 1 - u), 0.9 * Math.min(1, smooth(u)) + 0.25 * Math.max(0, 1 - u), { cw: 512, ch: 512, kind: "basic" }); } });
  kick1(tNo);
  // 7 So he bought a pile of giant weather balloons…: crates of WEATHER BALLOONS, Larry grinning on top of the world
  shot({ at: S("So he bought"), ...PK, cam: push(p_(YX + 0.6, 1.2, YZ + 3.8), p_(YX, 0.9, YZ), p_(YX + 0.4, 1.2, YZ + 3.3), p_(YX, 0.95, YZ), 48, 2.4), cInf: 1.2, focus: p_(YX, 0.9, YZ), shadowR: 8,
    stage(t, out) { const l = t - S("So he bought"); A.fx(out, "boxes", (p) => K.drawBoxes(p.g), YX + 0.25, GY + 0.55 - (1 - smooth(l * 3)) * 0.3, YZ - 0.4, 1.6, 1.07, { cw: 768, ch: 512, kind: "lit" });
      larryG(A, out, t, YX - 0.6, YZ, { expr: t > T("giant") ? "laugh" : "grin", arms: { l: ["hips", 1], r: ["point", 1] }, headTilt: Math.sin(t * 10) * 5 }); sparkle(A, out, t, YX + 0.25, 1.2, YZ - 0.3, 0.2, 3); } });
  // 8 …and filled them with helium.: helium tank, the cluster swelling up over the yard
  const tFi = T("filled");
  shot({ at: S("and filled"), ...PK, cam: push(p_(YX + 0.2, 1.6, YZ + 6.0), p_(YX, 2.0, YZ), p_(YX + 0.1, 1.6, YZ + 5.2), p_(YX, 2.2, YZ), 50, 1.7), cInf: 0.9, focus: p_(YX, 1.6, YZ), shadowR: 10,
    stage(t, out) { const g = smooth((t - tFi) / 1.4); A.fx(out, "tank", (p) => K.drawTank(p.g), YX + 1.2, GY + 0.6, YZ - 0.2, 0.4, 1.2, { cw: 256, ch: 768, kind: "lit" });
      larry(A, out, t, YX, GY, YZ - 0.5, { noMan: true, n: Math.round(6 + g * 36), bs: 0.5 + 0.5 * g, rope: 1, jugs: 0 }); larryG(A, out, t, YX - 0.9, YZ + 0.3, { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] } }); } });
  // 9 He packed sandwiches. And beer.: close: sandwich, then the beer comes up too
  const tBe = T("beer");
  shot({ at: S("He packed"), ...PK, cam: push(p_(YX, 1.3, YZ + 1.9), p_(YX, 1.2, YZ), p_(YX, 1.3, YZ + 1.6), p_(YX, 1.2, YZ), 46, 1.9), cInf: 1.6, focus: p_(YX, 1.2, YZ), shadowR: 8,
    stage(t, out) { const b = t > tBe - 0.05; larryG(A, out, t, YX, YZ, { xk: b ? "sb" : "s", expr: b ? "laugh" : "grin", arms: { l: [b ? "up" : "hips", 1], r: ["up", 0.55] }, extra: b ? (p) => { XL.sandwich(p); XL.beer(p); } : XL.sandwich, headTilt: Math.sin(t * 8) * 4 });
      mk(A, out, "!", YX + 0.45, 1.85, YZ + 0.1, (t - tBe) * 4, 0.35, "#ffe85a"); } });
  kick1(tBe);
  // 10 And the brakes?: tethered on the lawn, sitting in the chair, BRAKES?
  shot({ at: S("And the brakes"), ...PK, cam: push(p_(YX + 0.4, 1.3, YZ + 4.6), p_(YX, 1.6, YZ - 0.5), p_(YX + 0.3, 1.3, YZ + 4.0), p_(YX, 1.6, YZ - 0.5), 50, 1.0), cInf: 1.0, focus: p_(YX, 1.0, YZ), shadowR: 8,
    stage(t, out) { larry(A, out, t, YX, GY, YZ - 0.5, { rope: 1, expr: "worried", arms: { l: ["shrug", 1], r: ["shrug", 1] } }); bub(A, out, "brk", "BRAKES?", "#c8202e", YX + 0.6, 2.0, YZ - 0.3, (t - T("brakes")) * 3, 1.0); } });
  // 11 A pellet gun…: close, Larry cocks the pellet gun, sly
  shot({ at: S("A pellet"), ...PK, cam: push(p_(YX + 0.15, 1.15, YZ + 1.5), p_(YX, 1.1, YZ - 0.5), p_(YX + 0.12, 1.15, YZ + 1.25), p_(YX, 1.1, YZ - 0.5), 44, 0.9), cInf: 2.0, focus: p_(YX, 1.0, YZ - 0.5), shadowR: 6,
    stage(t, out) { larry(A, out, t, YX, GY, YZ - 0.5, { rope: 1, xk: "g", expr: "sly", arms: { l: ["low", 1], r: ["up", 1] }, extra: XL.gun }); sparkle(A, out, t, YX + 0.35, 1.75, YZ - 0.3, 0.15, 2); } });
  kick1(T("gun"));
  // 12 …to pop the balloons.: up into the cluster: one balloon POPS
  const tPo = T("pop");
  shot({ at: S("to pop"), ...PK, cam: push(p_(YX + 0.2, 2.0, YZ + 2.6), p_(YX, 3.0, YZ - 0.5), p_(YX + 0.15, 2.05, YZ + 2.3), p_(YX, 3.0, YZ - 0.5), 48, 1.6), cInf: 1.0, focus: p_(YX, 2.8, YZ - 0.6), shadowR: 8,
    stage(t, out) { const u = t - tPo; larry(A, out, t, YX, GY, YZ - 0.5, { rope: 1, noMan: false, xk: "g", expr: "grin", arms: { l: ["low", 1], r: ["up", 1] }, extra: XL.gun, popped: u > 0.15 ? [17] : [], bursting: u > 0 && u <= 0.15 ? [17] : [] });
      const [bx, by] = K.balloonXY(17); wd(A, out, "POP!", "#d8202e", YX + (bx - 512) / 1024 * 3, GY + 1.1 + 3.0 - by / 1024 * 3, YZ - 0.3, u * 3, 0.9); } });
  kick1(tPo);
  // 13 The plan: float gently…: the blueprint
  shot({ at: S("The plan"), ...PK, cam: push(p_(YX + 0.05, 1.3, YZ + 1.5), p_(YX, 1.3, YZ - 0.5), p_(YX + 0.05, 1.3, YZ + 1.25), p_(YX, 1.3, YZ - 0.5), 46, 1.5), cInf: 1.6, focus: p_(YX, 1.3, YZ - 0.5), shadowR: 6,
    stage(t, out) { const l = t - S("The plan"); A.fx(out, "plan" + Math.round(Math.min(1, l / 1.4) * 24), (p) => K.drawPlan(p.g, Math.min(1, l / 1.4)), YX, 1.3, YZ - 0.5, 1.2, 0.9, { cw: 768, ch: 576, kind: "lit" }); } });
  // 14 …over the neighborhood.: Larry hovering on the tether a little above the yard, sipping beer
  shot({ at: S("over the"), ...PK, cam: push(p_(YX + 1.2, 1.2, YZ + 6.5), p_(YX, 2.2, YZ - 0.5), p_(YX + 0.9, 1.25, YZ + 5.8), p_(YX, 2.3, YZ - 0.5), 50, 1.5), cInf: 0.8, focus: p_(YX, 1.6, YZ), shadowR: 10,
    stage(t, out) { larry(A, out, t, YX, GY + 0.8 + 0.06 * Math.sin(t * 2), YZ - 0.5, { rope: 1, xk: "b", expr: "smile_closed", arms: { l: ["up", 0.7], r: ["low", 1] }, extra: XL.beer }); pals(out, t, "laugh", [[YX - 1.4, YZ + 0.6], [YX + 1.5, YZ + 0.4]]); } });
  // 15 Then the rope snapped.: the rope, SNAP!
  const tSn = T("snapped");
  shot({ at: S("Then the rope"), ...PK, cam: push(p_(YX, 0.9, YZ + 1.2), p_(YX, 0.9, YZ - 0.5), p_(YX, 0.9, YZ + 1.0), p_(YX, 0.9, YZ - 0.5), 44, 1.0), cInf: 2.0, focus: p_(YX, 0.9, YZ - 0.5), shadowR: 6,
    stage(t, out) { const u = clamp01((t - tSn) * 5); A.fx(out, "rope" + Math.round(u * 8), (p) => K.drawRope(p.g, u), YX, 0.9, YZ - 0.5, 0.6, 0.9, { cw: 512, ch: 768, kind: "lit" }); wd(A, out, "SNAP!", "#d8202e", YX + 0.05, 1.25, YZ - 0.3, (t - tSn) * 3, 0.7); } });
  kick1(tSn);
  // 16 He shot up like a cork…: the chair rockets out of the yard, his friends gasp and point up
  const t16 = S("He shot");
  shot({ at: t16, ...PK, cam: push(p_(YX + 0.6, 1.1, YZ + 6.5), p_(YX, 2.4, YZ - 0.5), p_(YX + 0.5, 1.0, YZ + 6.0), p_(YX, 3.6, YZ - 0.5), 54, 1.5), cInf: 0.7, focus: p_(YX, 2.0, YZ), shadowR: 10,
    stage(t, out) { const l = Math.max(0, t - t16 - 0.25); larry(A, out, t, YX, GY + 0.3 + l * l * 4 + l * 1.5, YZ - 0.5, { rope: 2, expr: "shock", arms: { l: ["up", 1], r: ["up", 1] } }); pals(out, t, "shock", [[YX - 1.3, YZ + 0.8], [YX + 1.4, YZ + 0.6], [YX - 0.4, YZ + 1.6]]);
      wd(A, out, "WHOOSH!", "#2a5ad8", YX + 0.7, 1.5, YZ + 0.5, (t - T("shot")) * 3, 1.0); } });
  kick1(T("cork"));
  // 17 …sixteen thousand feet.: way up: clouds far below, the altitude board
  const tSx = T("sixteen");
  shot({ at: S("sixteen"), ...SKY, cam: push(k_(0.2, 1.0, 5.2), k_(0, 1.3, 0), k_(0.1, 1.05, 4.6), k_(0, 1.35, 0), 50, 1.7), cInf: 0.7, focus: k_(0, 1, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 12, { high: true, vy: 60 }); larry(Kk, out, t, -0.2, 0, 0, { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] } }); bd(Kk, out, "alt", "16,000 FT", "UP HIGH", "#d8202e", 0.1, -0.2, 0.8, (t - tSx) * 2, 1.4); } });
  kick1(T("feet"));
  // 18 Two airliners spotted him.: an airliner cruises past, the pilot does a double take
  shot({ at: S("Two"), ...SKY, cam: push(k_(-0.2, 0.25, 3.6), k_(0, 0.2, 0), k_(-0.15, 0.25, 3.2), k_(0, 0.2, 0), 46, 1.7), cInf: 1.0, focus: k_(0, 0.2, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 10, { high: true }); const l = t - S("Two"); plane(Kk, out, t, lerp(0.9, -0.3, l / 1.7), 0.2, 0, 3.2, { face: t > T("spotted") ? "shock" : "calm" }); mk(Kk, out, "?!", -0.45, 0.75, 0.3, (t - T("spotted")) * 4, 0.45, "#ffe85a"); } });
  // 19 A guy… in a lawn chair.: Larry waves at them with his beer
  shot({ at: S("A guy"), ...SKY, cam: push(k_(0.1, 1.2, 2.5), k_(0, 1.1, 0), k_(0.08, 1.2, 2.15), k_(0, 1.1, 0), 46, 2.0), cInf: 1.4, focus: k_(0, 1.0, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 9, { high: true, vy: 40 }); larry(Kk, out, t, 0, 0, 0, { xk: "b", expr: "laugh", arms: { l: ["up", 1], r: ["up", 0.6 + 0.4 * Math.sin(t * 14)] }, extra: XL.beer }); bub(Kk, out, "hi", "HI!", "#2a5ad8", -0.55, 1.75, 0.3, (t - T("guy")) * 3, 0.7); } });
  // 20 So he started shooting balloons.: aiming the pellet gun straight up
  shot({ at: S("So he started"), ...SKY, cam: push(k_(0.5, 0.7, 3.4), k_(0, 1.35, 0), k_(0.4, 0.75, 3.0), k_(0, 1.45, 0), 52, 1.8), cInf: 1.2, focus: k_(0, 1.4, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 10, { high: true }); larry(Kk, out, t, 0, 0, 0, { xk: "g", expr: "angry", arms: { l: ["low", 1], r: ["up", 1] }, extra: XL.gun }); } });
  // 21 Pop. Pop. Pop.: three balloons burst, one per word
  const p1 = T("Pop", 32), p2 = T("Pop", p1), pops = [p1, p2, T("Pop", p2)];
  shot({ at: p1 - 0.1, ...SKY, cam: push(k_(0, 1.9, 4.2), k_(0, 2.1, 0), k_(0, 1.9, 3.9), k_(0, 2.1, 0), 52, 1.0), cInf: 1.0, focus: k_(0, 2.5, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 10, { high: true }); const ids = [9, 25, 36], popped = [2], burst = [];
      ids.forEach((id, i) => { const u = t - pops[i]; if (u > 0.12) popped.push(id); else if (u > 0) burst.push(id); });
      larry(Kk, out, t, 0, 0, 0, { xk: "g", expr: "grin", arms: { l: ["low", 1], r: ["up", 1] }, extra: XL.gun, popped, bursting: burst });
      ids.forEach((id, i) => { const [bx, by] = K.balloonXY(id); wd(Kk, out, "POP!", ["#d8202e", "#e8742a", "#2a5ad8"][i], (bx - 512) / 1024 * 1.8, 1.1 + 3.0 - by / 1024 * 3, 0.3, (t - pops[i]) * 4, 0.7); }); } });
  // 22 He was finally coming down!: sinking gently, clouds rise past, relief
  shot({ at: S("He was"), ...SKY, cam: push(k_(0.3, 1.4, 5.0), k_(0, 1.5, 0), k_(0.2, 1.3, 4.5), k_(0, 1.3, 0), 50, 2.4), cInf: 0.8, focus: k_(0, 1, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 12, { vy: -110 }); larry(Kk, out, t, 0, -(t - S("He was")) * 0.12, 0, { xk: "g", expr: t > T("down", T("coming") - 0.1) ? "relief_open" : "relief", arms: { l: ["up", 0.6], r: ["up", 1] }, extra: XL.gun, popped: POP7, headTilt: 6 }); } });
  // 23 Then… oops.: close: the gun slips out of his hand
  const tOo = T("oops");
  shot({ at: S("Then oops"), ...SKY, cam: push(k_(0.2, 1.25, 1.9), k_(0.1, 1.15, 0), k_(0.18, 1.2, 1.7), k_(0.1, 1.1, 0), 44, 0.8), cInf: 1.8, focus: k_(0.1, 1.1, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 8, { vy: -110 }); const held = t < tOo + 0.1; larry(Kk, out, t, 0, 0, 0, { xk: held ? "g" : "", expr: held ? "relief" : "gasp", arms: { l: ["low", 1], r: [held ? "up" : "out", 1] }, extra: held ? XL.gun : undefined, popped: POP7 });
      if (!held) { const l = t - tOo - 0.1; Kk.fx(out, "gunfx", (p) => K.drawGun(p.g), 0.45, 1.0 - l * l * 5 - l, 0.2, 0.55, 0.14, { cw: 512, ch: 128, kind: "lit", rot: 1 + l * 9 }); }
      wd(Kk, out, "OOPS!", "#e8742a", -0.4, 1.7, 0.3, (t - tOo) * 3, 0.8); } });
  kick1(tOo + 0.1);
  // 24 He dropped the gun.: looking straight down: the gun tumbles away toward the clouds
  const t24 = S("He dropped");
  shot({ at: t24, ...SKY, cam: push(k_(0, 1.0, 0.9), k_(0, -4, -0.2), k_(0, 0.9, 0.9), k_(0, -4, -0.2), 54, 1.3), cInf: 0.6, focus: k_(0, -2, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 9, { high: true }); const l = t - t24; Kk.fx(out, "gunfall", (p) => K.drawGun(p.g), 0.1 + l * 0.1, -0.8 - l * 1.6, 0.0, 0.5 * (1 - l * 0.25), 0.125 * (1 - l * 0.25), { cw: 512, ch: 128, kind: "basic", rot: l * 7 });
      wd(Kk, out, "NOOO!", "#d8202e", 0, -1.4, -0.1, (t - T("gun", t24)) * 3, 0.9); } });
  // 25 Wait, it gets worse.: snap push-in on his face
  shot({ at: S("Wait"), ...SKY, cam: (l) => ({ pos: k_(0, 1.2, 2.2 - glide(l / 0.8) * 0.9), look: k_(0, 1.15, 0), fov: 44, roll: 0.03 * Math.sin(l * 4) }), cInf: 2.0, focus: k_(0, 1.15, 0), shadowR: 6,
    stage(t, out, c) { sky(out, c, t, 8, { vy: -140 }); larry(Kk, out, t, 0, 0, 0, { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] }, popped: POP7 }); } });
  kick1(T("worse"));
  // 26 He drifted down…: over the street: power poles and wires below him
  const t26 = S("He drifted"), PX = 30, PZ = 7.0;
  const poles = (out, t, spark = 0, tangle = false) => A.fx(out, "poles" + (spark ? Math.floor(t * 12) % 6 : "") + (tangle ? "t" : ""), (p) => K.drawPoles(p.g, { k: Math.floor(t * 12) % 6, spark, tangle }), PX, 4.5, PZ, 7, 7, { cw: 1024, ch: 1024, kind: "lit" });
  shot({ at: t26, ...PK, cam: push(p_(PX + 0.5, 1.6, PZ + 9.5), p_(PX, 6.6, PZ), p_(PX + 0.4, 1.6, PZ + 8.6), p_(PX, 6.2, PZ), 54, 1.8), cInf: 0.6, focus: p_(PX, 6, PZ), shadowR: 12,
    stage(t, out) { poles(out, t); const l = t - t26; larry(A, out, t, PX - 0.3, lerp(8.2, 6.4, clamp01(l / 1.9)), PZ + 0.3, { expr: "worried", arms: { l: ["shrug", 1], r: ["shrug", 1] }, popped: POP7 }); } });
  // 27 …straight into power lines.: tangled in the wires, sparks, ZAP!
  const tPw = T("power");
  shot({ at: S("straight"), ...PK, cam: push(p_(PX + 0.3, 4.6, PZ + 3.6), p_(PX, 6.1, PZ), p_(PX + 0.25, 4.7, PZ + 3.2), p_(PX, 6.2, PZ), 52, 1.4), cInf: 0.8, focus: p_(PX, 6.0, PZ), shadowR: 12,
    stage(t, out) { const z = t > tPw; poles(out, t, z ? 1 : 0, z); larry(A, out, t, PX - 0.3, z ? 5.55 : 5.9, PZ + 0.3, { expr: z ? "dazed" : "worried", arms: { l: ["up", 1], r: ["up", 1] }, popped: POP7, headTilt: z ? Math.sin(t * 30) * 10 : 0 });
      wd(A, out, "ZAP!", "#ffe85a", PX + 0.8, 6.9, PZ + 0.5, (t - tPw) * 3, 1.0); } });
  kick1(tPw);
  // 28 A whole neighborhood blacked out.: houses: the lights go out, BLACKOUT!
  const tBl = T("blacked");
  shot({ at: S("A whole"), ...PK, cam: push(p_(PX, 1.9, PZ + 6.2), p_(PX, 2.0, PZ - 4), p_(PX, 1.9, PZ + 5.6), p_(PX, 2.0, PZ - 4), 50, 1.6), cInf: 0.9, focus: p_(PX, 2, PZ - 3), shadowR: 10,
    stage(t, out) { const on = t < tBl ? 1 : 0; A.fx(out, "houses" + on, (p) => K.drawHouses(p.g, on), PX, 1.75, PZ + 2.2, 3.0, 1.69, { cw: 1024, ch: 576, kind: "lit" }); wd(A, out, "BLACKOUT!", "#2a2a36", PX, 2.75, PZ + 2.5, (t - tBl) * 3, 1.3); } });
  kick1(tBl);
  // 29 Police were waiting.: two cops on the sidewalk, hands on hips, looking up
  shot({ at: S("Police"), ...PK, cam: push(p_(PX + 0.4, 1.2, PZ + 4.2), p_(PX, 1.4, PZ), p_(PX + 0.3, 1.2, PZ + 3.7), p_(PX, 1.4, PZ), 48, 1.5), cInf: 1.1, focus: p_(PX, 1.3, PZ), shadowR: 8,
    stage(t, out) { [[-0.55, 0], [0.55, 1]].forEach(([x, i]) => A.ppl(out, 20 + i, COP(i), PX + x, PZ, { expr: i ? "annoyed" : "stern", arms: { l: ["hips", 1], r: [i ? "point" : "hips", 1] } }, 0.17)); } });
  // 30 The fine?: close: a cop hands over the ticket
  const tFf = T("Fifteen");
  shot({ at: S("The fine"), ...PK, cam: push(p_(PX + 0.1, 1.3, PZ + 1.6), p_(PX, 1.25, PZ), p_(PX + 0.1, 1.3, PZ + 1.35), p_(PX, 1.25, PZ), 44, 1.6), cInf: 1.8, focus: p_(PX, 1.25, PZ), shadowR: 6,
    stage(t, out) { A.ppl(out, 20, { ...COP(0), xk: "tk" }, PX - 0.35, PZ - 0.3, { expr: "stern", arms: { l: ["hips", 1], r: ["out", 1] }, extra: XL.ticket }, 0.17);
      const u = clamp01((t - tFf) * 3); A.fx(out, "tk" + Math.round(u * 6), (p) => K.drawTicket(p.g, u), PX + 0.3, 1.3, PZ + 0.15, 0.5, 0.75, { cw: 512, ch: 768, kind: "lit", rot: -0.08 }); } });
  // 31 Fifteen hundred dollars.: Larry sad, the big money board
  shot({ at: S("hundred"), ...PK, cam: push(p_(PX - 0.1, 1.35, PZ + 2.4), p_(PX, 1.3, PZ), p_(PX - 0.1, 1.35, PZ + 2.05), p_(PX, 1.3, PZ), 46, 1.5), cInf: 1.4, focus: p_(PX, 1.2, PZ), shadowR: 8,
    stage(t, out) { larryG(A, out, t, PX - 0.3, PZ, { expr: "sad", arms: { l: ["face", 1], r: ["low", 1] } }, 0.17); bd(A, out, "fine", "$1,500", "FINE", "#d8202e", PX + 0.05, 1.85, PZ + 0.3, (t - T("hundred")) * 2.5, 0.9); } });
  kick1(T("dollars"));
  // 32 Why do it?: reporters with microphones and flash bulbs crowd him
  shot({ at: S("Why"), ...PK, cam: push(p_(PX + 0.2, 1.4, PZ + 3.3), p_(PX, 1.3, PZ), p_(PX + 0.15, 1.4, PZ + 2.9), p_(PX, 1.3, PZ), 48, 1.0), cInf: 1.2, focus: p_(PX, 1.3, PZ), shadowR: 8,
    stage(t, out) { larryG(A, out, t, PX, PZ - 0.3, { expr: "nervous", arms: { l: ["low", 1], r: ["low", 1] } }, 0.17); [[-0.75, 0.3], [0.75, 0.3], [-0.3, 0.9]].forEach(([x, z], i) => A.ppl(out, 40 + i, { ...PRESS(i), xk: "mic" }, PX + x, PZ + z, { expr: "talk_o", arms: { l: ["low", 1], r: ["out", 1] }, extra: XL.mic }, 0.17));
      flashes(A, out, t, [[PX - 0.9, 1.9, PZ + 0.5], [PX + 0.8, 2.0, PZ + 0.5]], 2.5); } });
  // 33 He said a man can't just sit around.: big grin, speech bubble
  shot({ at: S("He said"), ...PK, cam: push(p_(PX, 1.35, PZ + 1.7), p_(PX, 1.3, PZ - 0.3), p_(PX, 1.35, PZ + 1.45), p_(PX, 1.3, PZ - 0.3), 44, 2.0), cInf: 1.8, focus: p_(PX, 1.3, PZ - 0.3), shadowR: 6,
    stage(t, out) { larryG(A, out, t, PX, PZ - 0.3, { expr: Math.floor(t * 6) % 2 ? "talk_o" : "grin", arms: { l: ["hips", 1], r: ["point", 1] }, headTilt: Math.sin(t * 6) * 5 }, 0.17); bub(A, out, "sit", "CAN'T SIT AROUND!", "#2a5ad8", PX - 0.02, 1.82, PZ - 0.1, (t - T("can't")) * 3, 0.75); } });
  // 34 Today that chair is in the Smithsonian.: the museum, the chair on a pedestal under a spotlight
  const t34 = S("Today");
  const museum = (out, c, t) => { screenCard(out, c, "museum", (p) => K.drawMuseum(p.g), 6, 576, 1024, "basic"); M.fx(out, "pedestal", (p) => { p.g.clearRect(0, 0, 512, 256); R(p.g, 40, 20, 432, 216, 10, "#e8e0d0", 10); }, 0, 0.3, 0, 1.4, 0.7, { cw: 512, ch: 256, kind: "lit" });
    M.fx(out, "mchair", (p) => K.drawChair(p.g, { jugs: 0, strings: false }), 0, 1.15, 0.05, 1.1, 1.1, { cw: 768, ch: 768, kind: "lit" }); M.fx(out, "plaque", (p) => K.drawPlaque(p.g), 0, 0.32, 0.12, 0.8, 0.4, { cw: 512, ch: 256, kind: "lit" }); };
  shot({ at: t34, ...SKY, cam: push(m_(0, 1.2, 4.2), m_(0, 1.0, 0), m_(0, 1.15, 3.5), m_(0, 1.0, 0), 50, 1.4), cInf: 0.8, focus: m_(0, 0.9, 0), shadowR: 6,
    stage(t, out, c) { museum(out, c, t); sparkle(M, out, t, 0, 1.3, 0.2, 0.3, 4); } });
  shot({ at: S("Smithsonian"), ...SKY, cam: push(m_(0.15, 0.7, 2.0), m_(0, 0.6, 0), m_(0.12, 0.68, 1.7), m_(0, 0.6, 0), 46, 1.6), cInf: 1.4, focus: m_(0, 0.5, 0), shadowR: 6,
    stage(t, out, c) { museum(out, c, t); sparkle(M, out, t, 0, 0.7, 0.2, 0.2, 3); } });
  // 36 And that's how a man…: loop: shot 1's view, Larry rising back into place
  const tL = S("And that's");
  shot({ at: tL, ...SKY, cam: heroCam, cInf: 0.6, focus: k_(0, 1.0, 0), shadowR: 6, loop: true, stage(t, out, c) { const k = clamp01((t - tL) / Math.max(0.3, END - tL - 0.05)); heroStage(t, out, c, lerp(0.0, 0.4, k)); } });
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
