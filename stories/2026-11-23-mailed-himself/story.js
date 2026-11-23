// Shot plan for "This Man Mailed Himself Across the World" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts: Reg Spiers, Australian javelin thrower, broke in London in 1964, wanted to be home for his daughter's birthday; friend John McSorley built a
// crate (5 x 3 x 2.5 ft, the biggest allowed), canned food, water and empty bottles to pee in; a 24-hour fog delay in London; Paris, Bombay (left
// upside down in the hot sun for hours); 63 hours to Perth; got out of the cargo shed and hitchhiked home; became a hero after McSorley told the press
// (Wikipedia, Jo Usmar / BBC, Michael W Travels / USA Today, Vice). Hook-first (popping out of the crate on frame 0), cut every ~1.5-2 s, loop ending.
import * as K from "./draw_mail.js";
import { INK } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1740;
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
const { txt, poly, hh } = K;

const DR = {
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, s.length > 2 ? 110 : 200, "Bangers", col, INK, 14, 240); },
  word: (p, s, col, u) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); const k = 0.7 + 0.3 * Math.min(1, u * 3); g.scale(k, k); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two, r = i % 2 ? 80 : 118; g.lineTo(Math.cos(a) * r * 2, Math.sin(a) * r * 0.9); } g.closePath(); g.fill(); g.stroke(); txt(g, s, 0, 6, 92, "Bangers", col, INK, 10, 400); g.restore(); },
  numBoard: (p, n, label, col) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(30, 30, 964, 452, 40); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.roundRect(56, 56, 912, 400, 28); g.stroke();
    txt(g, n, 512, 210, 230, "Bangers", col, INK, 16, 900); txt(g, label, 512, 380, 110, "Bangers", "#2a2a36", INK, 0, 880); },
  spark: (p, col = "#fffbe8") => { const g = p.g; g.clearRect(0, 0, 256, 256); poly(g, [[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], col, 8); },
  sweat: (p) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.beginPath(); g.moveTo(64, 10); g.quadraticCurveTo(110, 80, 64, 118); g.quadraticCurveTo(18, 80, 64, 10); g.fillStyle = "#8fd0ff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); },
  zzz: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); for (let i = 0; i < 3; i++) { const ph = (k / 12 + i / 3) % 1; g.globalAlpha = Math.min(1, (1 - ph) * 3); txt(g, "Z", 70 + ph * 120 + i * 6, 220 - ph * 180, 40 + ph * 50, "Bangers", "#ffffff", INK, 8); } g.globalAlpha = 1; },
  confetti: (p, k) => { const g = p.g, W = g.canvas.width, Hh = g.canvas.height; g.clearRect(0, 0, W, Hh); const C = ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a", "#ffffff", "#c8202e"]; for (let i = 0; i < 46; i++) { const x = hh(i, 1) * W, y = ((hh(i, 2) * Hh + k * 30 * (0.6 + hh(i, 3))) % (Hh + 48)) - 24; g.save(); g.translate(x, y); g.rotate(k * 0.7 + i); g.fillStyle = C[i % 6]; g.fillRect(-9, -5, 18, 10); g.restore(); } },
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
const REG = { jacket: "#2f7a48", pants: "#3a3a48", boots: "#5a3a22", hat: "hair", hair: "#3a2a1a", skin: "#f2d2b6", build: "adult" };
const REG_SUIT = { ...REG, jacket: "#4a5268", pants: "#3a3e4a" };
const JOHN = { jacket: "#c8783a", pants: "#4a4a58", boots: INK, hat: "hair", hair: "#b8502a", skin: "#f4d6bc", build: "adult" };
const KIDO = { jacket: "#ff7aa0", pants: "#ff7aa0", boots: "#f4f1ea", hat: "hair", hair: "#8a5a32", skin: "#f2d2b6", build: "kid", dress: "#ff7aa0" };
const WORKER = (v) => ({ jacket: ["#c8a46a", "#d8b878"][v % 2], pants: "#6a5a42", boots: INK, hat: v % 2 ? "cap" : "hair", cap: "#e8e0d0", hair: "#1a1410", skin: ["#b07850", "#9a6a44"][v % 2], build: v % 2 ? "stout" : "adult", ...(v ? { moustache: "#1a1410" } : {}) });
const FAN = (v) => ({ jacket: ["#c8503a", "#6a9a4a", "#e8b83a", "#8a5ab0", "#3a7ac8"][v % 5], pants: ["#3a3a48", "#5a4a3a"][v % 2], boots: INK, hat: v % 3 === 2 ? "fedora" : "hair", cap: "#4a4a52", hair: ["#c89a4a", "#2a201a", "#8a5a32", "#3a2a1a"][v % 4], skin: ["#f2d2b6", "#e8b894", "#ecd0b6", "#c99067"][v % 4], build: "adult" });
const IMG = {};
const img = (key, w, h, f) => IMG[key] || (IMG[key] = oc(w, h, f));
const XL = {
  hammer: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(0.3); g.drawImage(img("ham", 256, 256, K.drawHammer), -60, -150, 120, 170); g.restore(); },
  jav: (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(-0.35); g.drawImage(img("jav", 1024, 64, K.drawJav), -260, -14, 520, 32); g.restore(); },
  bottle: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(img("bot0", 128, 256, (g) => K.drawBottle(g, false)), H.r[0] - 34, H.r[1] - 120, 68, 136); },
  cake: (p) => { const H = p.hands; if (!H || !H.r || !H.l) return; const x = (H.r[0] + H.l[0]) / 2, y = (H.r[1] + H.l[1]) / 2; p.g.drawImage(img("cake", 512, 512, K.drawCake), x - 110, y - 170, 220, 220); },
  cam: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(img("pcam", 256, 256, K.drawPhoneCam), H.r[0] - 60, H.r[1] - 90, 120, 120); },
};

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const SETS = ["hold", "london", "field", "agent", "home", "shop", "fog", "bombay", "shed", "outback", "crowd", "map"];
  const base = (k) => [3200 + SETS.indexOf(k) * 200, 2000, 0];
  const at = (k) => { const B = base(k), Af = (x, y, z) => [B[0] + x, B[1] + y, B[2] + z];
    return { k, p: Af,
      fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
      ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); } }; };
  const H = Object.fromEntries(SETS.map((k) => [k, at(k)]));
  const lights = { day: { light: "day", sunAz: 200, sunEl: 50, fogFar: 4000 }, night: { light: "night", sunAz: 20, sunEl: 30, fogFar: 4000 }, golden: { light: "golden", sunAz: 160, sunEl: 35, fogFar: 4000 } };
  const LT = { hold: "golden", london: "day", field: "day", agent: "day", home: "golden", shop: "golden", fog: "day", bombay: "golden", shed: "night", outback: "day", crowd: "day", map: "day" };
  // the set: a painted wall 5 m behind the origin and a floor
  const room = (h, out, t, wallZ = -5) => { const anim = ["london", "fog", "bombay", "outback", "home", "hold"].includes(h.k) ? Math.floor(t * 10) % 40 : 0;
    h.fx(out, "wall_" + h.k + anim, (p) => K.drawWall(p.g, h.k, h.k === "hold" ? (anim % 10 < 5 ? 1 : 0) : anim / 10), 0, 7, wallZ, 14, 14, { cw: 1024, ch: 1024, kind: "basic", normal: [0, 0, 1] });
    h.fx(out, "floor_" + h.k, (p) => K.drawFloor(p.g, K.FLOOR[h.k], h.k), 0, 0, wallZ + 9, 30, 18, { cw: 512, ch: 512, kind: "basic", flat: true }); };
  const S1 = (o) => ({ ...lights[LT[o.set]], ...o });
  const mk = (h, out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); h.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic" }); };
  const wd = (h, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); h.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const bd = (h, out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; h.fx(out, key + k, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const bub = (h, out, key, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; h.fx(out, key + k, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic" }); };
  const sparkle = (h, out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) h.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  const sweat = (h, out, t, x, y, z, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1; h.fx(out, "sweat", (p) => DR.sweat(p), x + (i - 1) * 0.16 + ph * 0.05 * (i - 1), y - ph * 0.25, z, 0.08, 0.08, { cw: 128, ch: 128, kind: "basic" }); } };
  const flashes = (h, out, t, pts, rate = 3) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; h.fx(out, "flash", (p) => K.drawFlash(p.g), x, y, z, 0.7 * k, 0.7 * k, { cw: 256, ch: 256, kind: "basic" }); } }); };
  // closed crate (front 1.5 x 1.0 m), origin = bottom centre of its front face
  const crate = (h, out, x, y, z, o = {}) => { const ek = o.eyes ? Math.round(o.eyes * 4) : 0, s = o.s ?? 1; h.fx(out, "cr" + ek + (o.look ?? 0) + (o.stamp || "") + (o.label === false ? "n" : ""), (p) => K.drawCrate(p.g, { eyes: ek / 4, look: o.look, stamp: o.stamp, label: o.label }), x, y + 0.5 * s, z, 1.5 * s, 1.0 * s, { cw: 768, ch: 512, kind: "lit", rot: o.rot ?? 0 }); };
  // cut-away crate with Reg inside. o: expr, arms, flip (upside down), items, extra, headTilt
  const inside = (h, out, t, x, y, z, o = {}) => { const f = o.flip ? Math.PI : 0, cy = y + 0.5;
    h.fx(out, "crb", (p) => K.drawCrateBack(p.g), x, cy, z - 0.45, 1.5, 1.0, { cw: 768, ch: 512, kind: "lit", rot: f });
    const sc = 0.6, sy = o.flip ? y + 1.0 - 0.06 : y + 0.06;
    h.ppl(out, 1, { ...REG, xk: o.xk || "" }, x - 0.12, z - 0.2, { mode: "sit", keep: true, blob: false, scale: sc, roll: f, expr: o.expr ?? "nervous", arms: o.arms ?? { l: ["low", 1], r: ["low", 1] }, headTilt: o.headTilt ?? 0, extra: o.extra }, sy);
    (o.items || []).forEach(([kind, ix, u]) => { if (u <= 0) return; const k = smooth(u * 3), iy = o.flip ? y + 0.82 : y + 0.18;
      if (kind === "can") h.fx(out, "can", (p) => K.drawCan(p.g), x + ix, iy + (1 - k) * 0.3, z - 0.1, 0.22, 0.22, { cw: 256, ch: 256, kind: "lit", rot: f });
      else h.fx(out, "bot" + (kind === "water" ? 1 : 0), (p) => K.drawBottle(p.g, kind === "water"), x + ix, iy + 0.05 + (1 - k) * 0.3, z - 0.1, 0.13, 0.26, { cw: 128, ch: 256, kind: "lit", rot: f }); });
    h.fx(out, "crf", (p) => K.drawCrateFrame(p.g), x, cy, z + 0.3, 1.5, 1.0, { cw: 768, ch: 512, kind: "lit", rot: f }); };
  const reg = (h, out, t, x, z, o = {}, y = 0) => h.ppl(out, 1, { ...(o.suit ? REG_SUIT : REG), xk: o.xk || "" }, x, z, { keep: true, expr: o.expr ?? "grin", arms: o.arms ?? { l: ["hips", 1], r: ["hips", 1] }, headTilt: o.headTilt ?? 0, extra: o.extra, view: o.view, dir: o.dir, mode: o.mode ?? "stand", phase: o.phase, scale: o.s ?? 1, roll: o.roll }, y);
  const john = (h, out, t, x, z, o = {}, y = 0) => h.ppl(out, 2, { ...JOHN, xk: o.xk || "" }, x, z, { keep: true, expr: o.expr ?? "grin", arms: o.arms ?? { l: ["hips", 1], r: ["hips", 1] }, headTilt: o.headTilt ?? 0, extra: o.extra }, y);
  const plane = (h, out, x, y, z, w, o = {}) => h.fx(out, "pl" + (o.lights ? (o.k ?? 0) % 2 : "") + (o.wheels === false ? "w" : ""), (p) => K.drawPlane(p.g, o), x, y, z, w, w * 0.375, { cw: 1024, ch: 384, kind: "lit", rot: o.rot ?? 0 });
  const cam = (h, p0, l0, p1, l1, fov = 46, dur = 1.8) => push(h.p(...p0), h.p(...l0), h.p(...p1), h.p(...l1), fov, dur);

  const { hold: HO, london: LO, field: FI, agent: AG, home: HM, shop: SH, fog: FG, bombay: BO, shed: SD, outback: OB, crowd: CR, map: MP } = H;
  // ---- hero (shot 1 + loop): in the plane's cargo hold, Reg pops out of the crate, lid flying, red light flashing
  const heroCam = cam(HO, [0.2, 1.1, 3.6], [0, 0.95, 0], [0.12, 1.1, 3.1], [0, 1.0, 0], 50, 2.6);
  const heroStage = (t, out, u) => { room(HO, out, t); const up = smooth(u);
    reg(HO, out, t, 0, -0.15, { xk: "h", expr: up > 0.7 ? "laugh" : "shock", arms: { l: ["up", up], r: ["up", up] }, headTilt: Math.sin(t * 9) * 5, s: 0.95 }, lerp(-0.9, 0.0, up));
    crate(HO, out, 0, 0, 0.2, { stamp: "AIR MAIL" });
    const lu = clamp01(u * 1.2); HO.fx(out, "lid", (p) => K.drawLid(p.g), lerp(0, 0.9, lu), 1.05 + Math.sin(lu * Math.PI) * 0.5, 0.25, 1.5, 0.25, { cw: 768, ch: 128, kind: "lit", rot: lerp(0, -0.9, lu) });
    crate(HO, out, -1.25, 0, -1.3, { label: false, s: 0.8 }); crate(HO, out, 1.3, 0, -1.4, { label: false, s: 0.9 }); };
  // 1 This man mailed himself across the world.
  shot({ a: 0, ...S1({ set: "hold" }), cam: heroCam, cInf: 0.8, focus: HO.p(0, 1.0, 0), shadowR: 6, stage(t, out) { heroStage(t, out, 0.45 + t * 0.4); } });
  kick1(0.3); kick1(T("mailed"));
  // 2 No ticket. No seat.: the travel-agency wall; a ticket gets a red X, then a plane seat
  const tTk = T("ticket"), tSe = T("seat");
  shot({ at: S("No ticket"), ...S1({ set: "agent" }), cam: cam(AG, [0, 1.3, 2.6], [0, 1.3, 0], [0, 1.3, 2.2], [0, 1.3, 0], 46, 1.6), cInf: 1.2, focus: AG.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(AG, out, t); const sb = t > tSe - 0.05;
      if (!sb) AG.fx(out, "tkt", (p) => K.drawTicket(p.g), 0.12, 1.35, 0.2, 0.8, 0.4, { cw: 512, ch: 256, kind: "lit", rot: -0.08 + Math.sin(t * 3) * 0.03 });
      else AG.fx(out, "seat", (p) => K.drawSeat(p.g), 0, 1.25, 0.2, 0.9, 0.9, { cw: 512, ch: 512, kind: "lit" });
      const u = (t - (sb ? tSe : tTk)) * 4; if (u > 0) { const k = Math.min(1, smooth(u)) + 0.25 * Math.max(0, 1 - u); AG.fx(out, "no" + (sb ? 1 : 0), (p) => K.drawNo(p.g), 0, 1.3, 0.4, 0.7 * k, 0.7 * k, { cw: 512, ch: 512, kind: "basic" }); } } });
  kick1(tTk); kick1(tSe);
  // 3 Just a wooden box.: the closed crate in the hold, two eyes peeking through a gap
  const tBx = T("box");
  shot({ at: S("Just a wooden"), ...S1({ set: "hold" }), cam: keys([{ t: 0, pos: HO.p(1.4, 1.0, 2.6), look: HO.p(0, 0.55, 0.2), fov: 46 }, { t: 1.6, pos: HO.p(0.5, 0.8, 2.0), look: HO.p(0, 0.55, 0.2), fov: 44 }]), cInf: 1.2, focus: HO.p(0, 0.55, 0.2), shadowR: 6,
    stage(t, out) { room(HO, out, t); crate(HO, out, 0, 0, 0.2, { eyes: clamp01((t - tBx + 0.2) * 4), look: Math.round(Math.sin(t * 4)) }); crate(HO, out, -1.4, 0, -1.2, { label: false, s: 0.8 }); mk(HO, out, "?", 0.6, 1.25, 0.4, (t - tBx) * 4, 0.35); } });
  kick1(tBx);
  // 4 He's a javelin champion: the stadium: Reg throws, the javelin flies off, CHAMP!
  const tJv = T("champion");
  shot({ at: S("He's a"), ...S1({ set: "field" }), cam: cam(FI, [0.3, 1.4, 3.4], [0.1, 1.35, 0], [0.2, 1.4, 2.9], [0.1, 1.4, 0], 48, 1.5), cInf: 1.0, focus: FI.p(0, 1.2, 0), shadowR: 8,
    stage(t, out) { room(FI, out, t); const thrown = t > tJv - 0.15; reg(FI, out, t, -0.05, 0, { xk: thrown ? "" : "j", expr: thrown ? "proud" : "stern", arms: thrown ? { l: ["out", 1], r: ["point", 1] } : { l: ["out", 0.8], r: ["shoulder", 1] }, extra: thrown ? undefined : XL.jav });
      if (thrown) { const l = t - tJv + 0.15; FI.fx(out, "javfx", (p) => K.drawJav(p.g), 0.6 + l * 3.2, 1.9 + l * 1.2 - l * l * 0.8, 0, 1.6, 0.1, { cw: 1024, ch: 64, kind: "lit", rot: 0.35 - l * 0.4 }); }
      wd(FI, out, "CHAMP!", "#2f7a48", 0.55, 2.3, 0.3, (t - tJv) * 3, 1.0); } });
  kick1(tJv);
  // 5 stuck in London…: in the rain by Big Ben, soaked
  shot({ at: S("stuck"), ...S1({ set: "london" }), cam: cam(LO, [0.2, 1.4, 3.6], [0, 1.4, 0], [0.15, 1.4, 3.1], [0, 1.45, 0], 48, 1.1), cInf: 1.0, focus: LO.p(0, 1.4, 0), shadowR: 8,
    stage(t, out) { room(LO, out, t); reg(LO, out, t, 0, 0, { expr: "sad", arms: { l: ["low", 1], r: ["low", 1] }, headTilt: -6 }); sweat(LO, out, t, 0, 1.95, 0.2, 2); } });
  // 6 …and totally broke.: pockets turned out, a moth flies away
  const tBr = T("broke");
  shot({ at: S("and totally"), ...S1({ set: "london" }), cam: cam(LO, [0, 1.25, 2.3], [0, 1.15, 0], [0, 1.25, 2.0], [0, 1.15, 0], 46, 1.3), cInf: 1.6, focus: LO.p(0, 1.1, 0), shadowR: 6,
    stage(t, out) { room(LO, out, t); reg(LO, out, t, 0, 0, { expr: t > tBr ? "worried" : "nervous", arms: { l: ["shrug", 1], r: ["shrug", 1] } });
      LO.fx(out, "pock" + Math.floor(clamp01(t - tBr) * 20), (p) => K.drawPockets(p.g, clamp01(t - tBr) * 0.99), 0, 0.95, 0.25, 0.8, 0.4, { cw: 512, ch: 256, kind: "lit" }); wd(LO, out, "BROKE!", "#c8202a", 0.45, 1.95, 0.3, (t - tBr) * 3, 0.8); } });
  kick1(tBr);
  // 7 A flight home?: the travel agency, Reg reads the flight board
  shot({ at: S("A flight"), ...S1({ set: "agent" }), cam: cam(AG, [0.1, 1.4, 3.6], [0, 1.6, -0.6], [0.05, 1.4, 3.2], [0, 1.6, -0.6], 50, 1.1), cInf: 0.9, focus: AG.p(0, 1.4, 0), shadowR: 8,
    stage(t, out) { room(AG, out, t); AG.fx(out, "fboard", (p) => K.drawBoard(p.g), 0.35, 2.0, -0.6, 1.3, 1.0, { cw: 768, ch: 576, kind: "lit" }); reg(AG, out, t, -0.3, 0.2, { expr: "look_up", arms: { l: ["hips", 1], r: ["point", 1] }, headTilt: 6 }); mk(AG, out, "?", -0.2, 2.05, 0.4, (t - T("home")) * 4, 0.4); } });
  // 8 Way too expensive.: the price tag grows huge, Reg grabs his head
  const tEx = T("expensive");
  shot({ at: S("Way too"), ...S1({ set: "agent" }), cam: cam(AG, [0, 1.35, 2.8], [0, 1.4, 0], [0, 1.35, 2.3], [0, 1.4, 0], 48, 1.4), cInf: 1.3, focus: AG.p(0, 1.4, 0), shadowR: 6,
    stage(t, out) { room(AG, out, t); reg(AG, out, t, -0.35, 0, { expr: t > tEx ? "shock" : "worried", arms: { l: ["head", 1], r: ["head", 1] } });
      const u = (t - T("Way")) * 1.4, k = Math.round(smooth(u) * 10) / 10; AG.fx(out, "price", (p) => K.drawPrice(p.g), 0.4, 1.5, 0.35, 0.4 + 0.7 * k, 0.4 + 0.7 * k, { cw: 512, ch: 512, kind: "lit", rot: Math.sin(t * 8) * 0.05 }); } });
  kick1(tEx);
  // 9 But his little daughter's birthday is coming.: home in Australia: his little girl with the birthday cake
  shot({ at: S("But his"), ...S1({ set: "home" }), cam: cam(HM, [0.1, 1.0, 2.8], [0, 0.95, 0], [0.05, 1.0, 2.35], [0, 0.95, 0], 46, 2.2), cInf: 1.2, focus: HM.p(0, 0.9, 0), shadowR: 6,
    stage(t, out) { room(HM, out, t); HM.ppl(out, 3, { ...KIDO, xk: "cake" }, 0, 0, { keep: true, expr: "grin", arms: { l: ["hold", 1], r: ["hold", 1] }, extra: XL.cake, headTilt: Math.sin(t * 5) * 5 }); sparkle(HM, out, t, 0, 1.1, 0.3, 0.25, 3); } });
  // 10 So his buddy builds a crate…: the workshop, his mate hammers the crate together, BANG!
  const bangs = [T("buddy"), T("builds"), T("crate")];
  shot({ at: S("So his buddy"), ...S1({ set: "shop" }), cam: cam(SH, [0.2, 1.3, 3.9], [0, 1.0, 0], [0.1, 1.3, 3.4], [0, 1.0, 0], 48, 2.4), cInf: 1.0, focus: SH.p(0, 0.9, 0), shadowR: 8,
    stage(t, out) { room(SH, out, t); crate(SH, out, 0.4, 0, 0.1, { label: false, s: 0.8 }); const hit = bangs.some((b) => t > b && t < b + 0.15);
      john(SH, out, t, -0.5, 0.3, { xk: "ham", expr: hit ? "angry" : "grin", arms: { l: ["hips", 1], r: [hit ? "chop" : "up", 1] }, extra: XL.hammer });
      bangs.forEach((b, i) => wd(SH, out, ["BANG!", "BAM!", "BONK!"][i], ["#c8202a", "#e8742a", "#2a5ad8"][i], 0.1 + i * 0.25, 1.4 + (i % 2) * 0.3, 0.4, (t - b) * 3, 0.65)); } });
  bangs.forEach(kick1);
  // 11 …the biggest size planes allow.: a tape measure runs along the crate, MAX SIZE board
  const tSz = T("biggest");
  shot({ at: S("the biggest"), ...S1({ set: "shop" }), cam: cam(SH, [0, 1.0, 2.6], [0, 0.75, 0], [0, 1.0, 2.25], [0, 0.75, 0], 46, 1.2), cInf: 1.3, focus: SH.p(0, 0.7, 0.2), shadowR: 6,
    stage(t, out) { room(SH, out, t); crate(SH, out, 0, 0, 0.1, { label: false }); const u = clamp01((t - tSz + 0.1) / 0.9); SH.fx(out, "tape" + Math.round(u * 20), (p) => K.drawTape(p.g, u), 0, 1.14, 0.35, 1.6, 0.3, { cw: 1024, ch: 192, kind: "lit" });
      bd(SH, out, "max", "MAX SIZE!", "THE BIGGEST", "#c8202a", 0, 1.75, 0.4, (t - T("allow")) * 3, 1.2); } });
  kick1(T("allow"));
  // 12 Tiny problem?: Reg stands next to the crate standing on end: the box is shorter than him
  const tPr = T("problem");
  shot({ at: S("Tiny"), ...S1({ set: "shop" }), cam: cam(SH, [0.1, 1.2, 3.9], [0, 1.0, 0], [0.05, 1.2, 3.5], [0, 1.05, 0], 48, 1.3), cInf: 1.0, focus: SH.p(0, 1.0, 0), shadowR: 8,
    stage(t, out) { room(SH, out, t); SH.fx(out, "crup", (p) => K.drawCrate(p.g, { label: false }), 0.4, 0.75, 0.05, 1.5, 1.0, { cw: 768, ch: 512, kind: "lit", rot: Math.PI / 2 });
      reg(SH, out, t, -0.45, 0.1, { expr: "suspicious", arms: { l: ["hips", 1], r: ["point", 1] }, headTilt: 8 }); mk(SH, out, "?", 0.4, 1.85, 0.2, (t - tPr) * 4, 0.45, "#ffe85a"); } });
  // 13 The box is shorter than he is.: Reg crammed in, knees to his chin, SQUISH!
  const tSh = T("shorter");
  shot({ at: S("The box is"), ...S1({ set: "shop" }), cam: cam(SH, [0.15, 0.85, 2.5], [0, 0.55, 0], [0.1, 0.8, 2.15], [0, 0.55, 0], 46, 2.6), cInf: 1.4, focus: SH.p(0, 0.55, 0), shadowR: 6,
    stage(t, out) { room(SH, out, t); inside(SH, out, t, 0, 0, 0, { expr: t > tSh ? "pained" : "nervous", arms: { l: ["head", 1], r: ["head", 1] }, headTilt: Math.sin(t * 7) * 4 }); wd(SH, out, "SQUISH!", "#c8202a", 0.5, 1.15, 0.5, (t - tSh) * 3, 0.75);
      john(SH, out, t, 1.15, -0.2, { expr: "laugh", arms: { l: ["hips", 1], r: ["point", 1] } }); } });
  kick1(tSh);
  // 14 He squeezes in with canned food, water… and empty bottles.: supplies drop in one by one
  const tCa = T("canned"), tWa = T("water"), tEm = T("empty");
  shot({ at: S("He squeezes"), ...S1({ set: "shop" }), cam: cam(SH, [0, 0.75, 2.2], [0, 0.5, 0], [0, 0.72, 1.9], [0, 0.48, 0], 46, 3.6), cInf: 1.5, focus: SH.p(0, 0.5, 0), shadowR: 6,
    stage(t, out) { room(SH, out, t); inside(SH, out, t, 0, 0, 0, { expr: t > tEm ? "sly" : "grin", arms: { l: ["low", 1], r: ["low", 1] }, items: [["can", 0.42, t - tCa], ["can", 0.58, t - tCa - 0.15], ["water", -0.5, t - tWa], ["empty", 0.32, t - tEm], ["empty", 0.47, t - tEm - 0.15]] });
      mk(SH, out, "!", 0.5, 0.75, 0.45, (t - tEm) * 4, 0.3); } });
  kick1(tCa); kick1(tWa); kick1(tEm);
  // 15 Why empty bottles?: close on the two empty bottles, a big ?
  shot({ at: S("Why"), ...S1({ set: "shop" }), cam: cam(SH, [0.4, 0.45, 1.1], [0.4, 0.33, 0], [0.4, 0.45, 0.95], [0.4, 0.33, 0], 44, 1.3), cInf: 2.2, focus: SH.p(0.4, 0.33, 0), shadowR: 6,
    stage(t, out) { room(SH, out, t); inside(SH, out, t, 0, 0, 0, { expr: "sly", items: [["can", 0.6, 1], ["empty", 0.32, 1], ["empty", 0.47, 1]] }); mk(SH, out, "?", 0.4, 0.68, 0.4, (t - T("bottles", T("Why"))) * 4, 0.3); } });
  // 16 …Don't ask.: Reg whistles innocently, DON'T ASK!
  shot({ at: S("Don't"), ...S1({ set: "shop" }), cam: cam(SH, [0, 0.8, 1.8], [-0.1, 0.62, 0], [0, 0.8, 1.6], [-0.1, 0.62, 0], 44, 1.0), cInf: 1.8, focus: SH.p(-0.1, 0.6, 0), shadowR: 6,
    stage(t, out) { room(SH, out, t); inside(SH, out, t, 0, 0, 0, { xk: "b", expr: "whistle", arms: { l: ["low", 1], r: ["hold", 1] }, extra: XL.bottle, headTilt: Math.sin(t * 6) * 6, items: [["can", 0.6, 1]] }); bub(SH, out, "dont", "DON'T ASK!", "#c8202a", -0.05, 0.98, 0.5, (t - T("Don't")) * 4, 0.5); } });
  // 17 Day one: thick fog.: the crate on the fogged-in tarmac, DAY 1
  shot({ at: S("Day one"), ...S1({ set: "fog" }), cam: cam(FG, [0.6, 1.1, 3.6], [0, 0.8, 0], [0.4, 1.1, 3.1], [0, 0.8, 0], 48, 1.6), cInf: 0.8, focus: FG.p(0, 0.7, 0), shadowR: 6,
    stage(t, out) { room(FG, out, t); crate(FG, out, 0, 0, 0, { stamp: "AIR MAIL" }); const l = t - S("Day one"); FG.fx(out, "cal1", (p) => K.drawCal(p.g, "1"), -0.6, 1.6, 0.4, 0.55 * smooth(l * 4), 0.64 * smooth(l * 4), { cw: 384, ch: 448, kind: "basic", rot: 0.1 });
      wd(FG, out, "FOG!", "#5a6270", 0.55, 1.5, 0.4, (t - T("fog")) * 3, 0.8); } });
  kick1(T("fog"));
  // 18 The plane doesn't even take off.: the airliner sits in the fog, GROUNDED
  const tTo = T("take");
  shot({ at: S("The plane"), ...S1({ set: "fog" }), cam: cam(FG, [-0.6, 1.3, 6.2], [-0.2, 1.4, -1], [-0.5, 1.3, 5.7], [-0.2, 1.4, -1], 52, 2.2), cInf: 0.7, focus: FG.p(0, 1.3, -1), shadowR: 8,
    stage(t, out) { room(FG, out, t); plane(FG, out, -0.1, 1.15, -1.2, 3.8); crate(FG, out, -0.6, 0, 0.8, { s: 0.6, eyes: 1, look: 1 }); wd(FG, out, "GROUNDED!", "#c8202a", 0.3, 2.6, 0.2, (t - tTo) * 3, 1.4); } });
  kick1(tTo);
  // 19 He just sits there.: inside, bored, the clock ticks
  shot({ at: S("He just"), ...S1({ set: "hold" }), cam: cam(HO, [0, 0.8, 2.3], [0, 0.55, 0], [0, 0.78, 2.0], [0, 0.55, 0], 46, 1.6), cInf: 1.4, focus: HO.p(0, 0.55, 0), shadowR: 6,
    stage(t, out) { room(HO, out, t); inside(HO, out, t, 0, 0, 0, { expr: "bored", arms: { l: ["low", 1], r: ["face", 1] }, items: [["can", 0.6, 1], ["empty", 0.45, 1]] });
      HO.fx(out, "clk" + Math.floor(t * 4), (p) => K.drawClock(p.g, Math.floor(t * 4) * 0.5), 0.6, 1.4, 0.3, 0.45, 0.45, { cw: 256, ch: 256, kind: "basic" }); } });
  // 20 In the box.: close on his bored face, Zzz
  const tIb = T("In the box");
  shot({ at: tIb - 0.1, ...S1({ set: "hold" }), cam: cam(HO, [-0.1, 0.7, 1.4], [-0.12, 0.62, 0], [-0.1, 0.7, 1.2], [-0.12, 0.62, 0], 44, 1.4), cInf: 2.0, focus: HO.p(-0.12, 0.62, 0), shadowR: 6,
    stage(t, out) { room(HO, out, t); inside(HO, out, t, 0, 0, 0, { expr: t > tIb + 0.6 ? "sleep" : "bored", arms: { l: ["low", 1], r: ["face", 1] }, headTilt: -8 }); HO.fx(out, "zzz" + Math.floor(t * 12) % 12, (p) => DR.zzz(p, Math.floor(t * 12) % 12), 0.15, 0.9, 0.35, 0.4, 0.4, { cw: 256, ch: 256, kind: "basic" }); } });
  // 21 For a whole extra day.: the calendar flips 1 -> 2, the clock spins
  const tXd = T("extra");
  shot({ at: S("For a whole"), ...S1({ set: "fog" }), cam: cam(FG, [0, 1.3, 2.4], [0, 1.25, 0], [0, 1.3, 2.05], [0, 1.25, 0], 46, 1.4), cInf: 1.4, focus: FG.p(0, 1.25, 0), shadowR: 6,
    stage(t, out) { room(FG, out, t); const n = t > tXd + 0.2 ? "2" : "1"; FG.fx(out, "cal" + n, (p) => K.drawCal(p.g, n), -0.12, 1.25, 0.2, 0.7, 0.82, { cw: 384, ch: 448, kind: "basic", rot: n === "2" ? 0.06 : -0.04 });
      FG.fx(out, "clk" + Math.floor(t * 12) % 24, (p) => K.drawClock(p.g, (Math.floor(t * 12) % 24) * 2.6), 0.45, 1.6, 0.3, 0.5, 0.5, { cw: 256, ch: 256, kind: "basic" }); wd(FG, out, "+1 DAY!", "#c8202a", 0.35, 0.85, 0.4, (t - tXd) * 3, 0.8); } });
  kick1(tXd + 0.2);
  // 22 Wait, it gets worse.: snap push-in on his face in the crate
  shot({ at: S("Wait"), ...S1({ set: "hold" }), cam: (l) => ({ pos: HO.p(-0.12, 0.66, 2.0 - glide(l / 0.8) * 0.9), look: HO.p(-0.12, 0.62, 0), fov: 44, roll: 0.03 * Math.sin(l * 4) }), cInf: 2.0, focus: HO.p(-0.12, 0.62, 0), shadowR: 6,
    stage(t, out) { room(HO, out, t); inside(HO, out, t, 0, 0, 0, { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] } }); } });
  kick1(T("worse"));
  // 23 Then Paris. Then Bombay…: the route map, the plane hops London -> Paris -> Bombay
  const tPa = T("Paris"), tBo = T("Bombay"), t23 = S("Then Paris");
  shot({ at: t23, ...S1({ set: "map" }), cam: () => ({ pos: MP.p(0, 1, 3), look: MP.p(0, 1, 0), fov: 46, roll: 0 }), cInf: 0, focus: MP.p(0, 1, 0), shadowR: 6,
    stage(t, out, c) { const u = t < tPa ? lerp(0, 0.03, clamp01((t - t23) / 0.4)) : t < tBo ? 0.03 : lerp(0.03, 0.42, clamp01((t - tBo + 0.1) / 0.5)); const k = Math.round(u * 200);
      screenCard(out, c, "map" + k, (p) => K.drawMap(p.g, k / 200), 2.5, 576, 1024, "basic"); } });
  kick1(tPa); kick1(tBo);
  // 24 …where workers leave him upside down.: two workers flip the crate onto its head
  const tUp = T("upside");
  shot({ at: S("where workers"), ...S1({ set: "bombay" }), cam: cam(BO, [0.3, 1.2, 4.0], [0, 0.9, 0], [0.2, 1.2, 3.5], [0, 0.9, 0], 48, 1.6), cInf: 1.0, focus: BO.p(0, 0.8, 0), shadowR: 8,
    stage(t, out) { room(BO, out, t); const u = smooth((t - tUp + 0.3) / 0.6); crate(BO, out, 0, Math.sin(u * Math.PI) * 0.3, 0.1, { rot: u * Math.PI, s: 0.8 });
      [[-0.8, 0], [0.8, 1]].forEach(([x, i]) => BO.ppl(out, 10 + i, WORKER(i), x, 0.1, { keep: true, expr: u > 0.95 ? "grin" : "stern", arms: u < 0.95 ? { l: ["out", 1], r: ["out", 1] } : { l: ["hips", 1], r: [i ? "point" : "hips", 1] } }));
      wd(BO, out, "OOPS!", "#c8202a", 0.0, 1.75, 0.4, (t - T("down", tUp)) * 3, 0.8); } });
  kick1(tUp + 0.3);
  // 25 In the blazing sun.: an angry sun over the upside-down crate, heat waves
  shot({ at: S("In the blazing"), ...S1({ set: "bombay" }), cam: cam(BO, [0.2, 0.9, 3.4], [0, 1.6, 0], [0.15, 0.9, 3.0], [0, 1.7, 0], 52, 1.5), cInf: 0.9, focus: BO.p(0, 1.0, 0), shadowR: 8,
    stage(t, out) { room(BO, out, t); crate(BO, out, 0, 0, 0.1, { rot: Math.PI }); const k = Math.floor(t * 10) % 40; BO.fx(out, "sun" + (k % 8), (p) => K.drawSun(p.g, (k % 8) / 8 * 2.7), 0.25, 2.55, -0.5, 1.4 + 0.05 * Math.sin(t * 6), 1.4 + 0.05 * Math.sin(t * 6), { cw: 512, ch: 512, kind: "basic" });
      BO.fx(out, "heat" + (k % 10), (p) => K.drawHeat(p.g, (k % 10) / 10), 0, 1.3, 0.3, 1.6, 1.6, { cw: 512, ch: 512, kind: "basic" }); wd(BO, out, "SIZZLE!", "#e8742a", -0.35, 1.95, 0.5, (t - T("sun")) * 3, 0.8); } });
  kick1(T("sun"));
  // 26 For hours.: inside, upside down, sweating buckets
  shot({ at: S("For hours"), ...S1({ set: "bombay" }), cam: cam(BO, [0.1, 0.55, 2.0], [0, 0.5, 0], [0.08, 0.55, 1.7], [0, 0.5, 0], 46, 1.2), cInf: 1.6, focus: BO.p(0, 0.5, 0), shadowR: 6,
    stage(t, out) { room(BO, out, t); inside(BO, out, t, 0, 0, 0, { flip: true, expr: "dazed", arms: { l: ["out", 1], r: ["out", 1] }, headTilt: Math.sin(t * 9) * 8, items: [["can", 0.55, 1], ["empty", 0.4, 1]] }); sweat(BO, out, t, -0.1, 0.45, 0.4, 3); } });
  // 27 Sixty-three hours later…: the map: Bombay -> Perth, 63 HOURS board
  const t63 = T("Sixty-three");
  shot({ at: t63 - 0.1, ...S1({ set: "map" }), cam: () => ({ pos: MP.p(0, 1, 3), look: MP.p(0, 1, 0), fov: 46, roll: 0 }), cInf: 0, focus: MP.p(0, 1, 0), shadowR: 6,
    stage(t, out, c) { const u = lerp(0.42, 1, clamp01((t - t63) / 0.8)), k = Math.round(u * 200); screenCard(out, c, "map" + k, (p) => K.drawMap(p.g, k / 200), 2.5, 576, 1024, "basic");
      const b = smooth((t - t63) * 3); if (b > 0) MP.fx(out, "b63" + Math.round(b * 8), (p) => DR.numBoard(p, "63 HOURS", "IN A BOX", "#c8202a"), 0, 1.75, 0.6, 1.3 * (0.6 + 0.4 * b), 0.65 * (0.6 + 0.4 * b), { cw: 1024, ch: 512, kind: "basic" }); } });
  kick1(t63);
  // 28 …he lands in Perth.: the airliner touches down
  const tLa = T("lands");
  shot({ at: S("he lands"), ...S1({ set: "outback" }), light: "golden", cam: cam(OB, [-0.5, 1.1, 5.5], [0, 1.4, 0], [-0.4, 1.1, 5.0], [0, 1.3, 0], 52, 1.5), cInf: 0.7, focus: OB.p(0, 1, 0), shadowR: 8,
    stage(t, out) { room(OB, out, t); const l = clamp01((t - tLa + 0.3) / 1.1); plane(OB, out, lerp(-2.4, 0.4, l), lerp(2.6, 0.8, smooth(l)), -0.8, 4.6, { rot: lerp(0.12, 0, l) }); OB.fx(out, "perth", (p) => K.drawSign(p.g, "PERTH", "#2a5ad8"), 0.55, 0.75, 1.2, 1.0, 1.0, { cw: 512, ch: 512, kind: "lit" });
      if (l >= 1) wd(OB, out, "LANDED!", "#2f7a48", -0.6, 2.4, 0.4, (t - tLa - 0.8) * 3, 1.0); } });
  // 29 He crawls out of the cargo shed…: night shed: the lid pops, stiff Reg climbs out, CREAK!
  const tCr = T("crawls");
  shot({ at: S("He crawls"), ...S1({ set: "shed" }), cam: cam(SD, [0.3, 1.1, 3.4], [0, 0.85, 0], [0.2, 1.1, 2.9], [0, 0.9, 0], 48, 2.6), cInf: 1.0, focus: SD.p(0, 0.85, 0), shadowR: 8,
    stage(t, out) { room(SD, out, t); const u = smooth((t - tCr) / 1.6); reg(SD, out, t, 0, -0.15, { xk: "c", suit: true, expr: u < 0.6 ? "pained" : "relief_open", arms: { l: ["up", 0.6 + 0.4 * u], r: ["up", 0.6 + 0.4 * u] }, headTilt: Math.sin(t * 5) * 6, s: 0.95 }, lerp(-0.85, 0.05, u));
      crate(SD, out, 0, 0, 0.2, { stamp: "AIR MAIL" }); const lu = clamp01((t - tCr + 0.2) * 2); SD.fx(out, "lid", (p) => K.drawLid(p.g), lerp(0, -1.0, lu), 1.05 + Math.sin(lu * Math.PI) * 0.3, 0.25, 1.5, 0.25, { cw: 768, ch: 128, kind: "lit", rot: lerp(0, 1.2, lu) });
      wd(SD, out, "CREAK!", "#8a5a32", 0.6, 1.9, 0.4, (t - T("out", tCr)) * 3, 0.8); } });
  kick1(tCr);
  // 30 …sneaks away…: tiptoes past the cargo, sly
  const tSn = S("sneaks");
  shot({ at: tSn, ...S1({ set: "shed" }), cam: cam(SD, [0, 1.2, 4.0], [0, 1.0, 0], [-0.3, 1.2, 3.8], [-0.3, 1.0, 0], 48, 0.9), cInf: 0.9, focus: SD.p(0, 1, 0), shadowR: 8,
    stage(t, out) { room(SD, out, t); const l = t - tSn; reg(SD, out, t, lerp(0.8, -0.6, l / 0.9), 0.2, { suit: true, expr: "sly", mode: "stroll", phase: l * 1.4, dir: [-1, 0], view: "side" }); crate(SD, out, 1.2, 0, -0.8, { stamp: "AIR MAIL", s: 0.8 }); mk(SD, out, "SHH", -0.4, 2.05, 0.3, (t - T("sneaks")) * 4, 0.5, "#ffffff"); } });
  // 31 …and hitchhikes home.: the outback road, thumb out, a kangaroo stares
  const tHi = T("hitchhikes");
  shot({ at: S("and hitchhikes"), ...S1({ set: "outback" }), cam: cam(OB, [0.4, 1.3, 4.2], [0, 1.1, 0], [0.3, 1.3, 3.7], [0, 1.1, 0], 48, 2.2), cInf: 0.9, focus: OB.p(0, 1.1, 0), shadowR: 8,
    stage(t, out) { room(OB, out, t); reg(OB, out, t, -0.3, 0.2, { suit: true, expr: "grin", arms: { l: ["hips", 1], r: ["out", 1] }, headTilt: Math.sin(t * 4) * 4 });
      OB.fx(out, "roo" + (t > tHi + 0.4 ? 1 : 0), (p) => K.drawRoo(p.g, { shock: t > tHi + 0.4 }), 0.5, 0.62, -0.2, 1.25, 1.25, { cw: 512, ch: 512, kind: "lit" }); OB.fx(out, "home", (p) => K.drawSign(p.g, "HOME →"), -0.85, 0.8, -0.9, 1.0, 1.0, { cw: 512, ch: 512, kind: "lit" });
      bub(OB, out, "lift", "LIFT?", "#2a5ad8", -0.3, 2.05, 0.4, (t - tHi) * 3, 0.7); } });
  // 32 His buddy tells the newspapers…: the front page spins in
  const tNe = T("newspapers"), t32 = S("His buddy", 50);
  shot({ at: t32, ...S1({ set: "crowd" }), cam: cam(CR, [0, 1.4, 2.6], [0, 1.4, 0], [0, 1.4, 2.25], [0, 1.4, 0], 46, 1.6), cInf: 1.3, focus: CR.p(0, 1.4, 0.3), shadowR: 6,
    stage(t, out) { room(CR, out, t); const u = clamp01((t - t32) / 0.9), k = Math.round(smooth(u) * 16) / 16; CR.fx(out, "paper", (p) => K.drawPaper(p.g), 0, 1.4, 0.3, 0.2 + 0.85 * k, (0.2 + 0.85 * k) * 1.333, { cw: 768, ch: 1024, kind: "lit", rot: (1 - k) * 6.3 });
      if (t > tNe) john(CR, out, t, 0.95, -0.6, { expr: "laugh", arms: { l: ["hips", 1], r: ["point", 1] } }); } });
  kick1(tNe);
  // 33 …and he's a national hero.: crowd cheers, flashbulbs, confetti
  const tHe = T("hero");
  shot({ at: S("and he's"), ...S1({ set: "crowd" }), cam: cam(CR, [0.3, 1.4, 4.4], [0, 1.3, 0], [0.2, 1.4, 3.8], [0, 1.35, 0], 50, 2.0), cInf: 0.9, focus: CR.p(0, 1.3, 0), shadowR: 8,
    stage(t, out) { room(CR, out, t); reg(CR, out, t, 0, 0.4, { suit: true, expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 8) * 5 });
      [[-0.75, -0.2], [0.75, -0.2], [-0.4, -0.8], [0.45, -0.8]].forEach(([x, z], i) => CR.ppl(out, 20 + i, { ...FAN(i), xk: i < 2 ? "cam" : "" }, x, z, { keep: true, expr: i < 2 ? "talk_o" : "laugh", arms: i < 2 ? { l: ["low", 1], r: ["out", 1] } : { l: ["up", 1], r: ["up", 1] }, extra: i < 2 ? XL.cam : undefined, headTilt: Math.sin(t * 10 + i) * 6 }));
      flashes(CR, out, t, [[-0.9, 1.9, 0.7], [0.9, 2.0, 0.7]], 2.5); if (t > tHe - 0.1) CR.fx(out, "conf" + Math.floor(t * 15) % 60, (p) => DR.confetti(p, Math.floor(t * 15) % 60), 0, 1.6, 1.0, 2.6, 3.2, { cw: 512, ch: 640, kind: "basic" });
      wd(CR, out, "HERO!", "#c8202a", 0, 2.35, 0.4, (t - tHe) * 3, 1.0); } });
  kick1(tHe);
  // 34 Cheapest trip ever.: Reg sits on the crate, grinning, BARGAIN!
  const tCh = T("Cheapest");
  shot({ at: S("Cheapest"), ...S1({ set: "outback" }), cam: cam(OB, [0.1, 1.15, 2.9], [0, 1.0, 0], [0.05, 1.15, 2.5], [0, 1.0, 0], 46, 1.3), cInf: 1.2, focus: OB.p(0, 1.0, 0), shadowR: 6,
    stage(t, out) { room(OB, out, t); crate(OB, out, 0, 0, 0.1, { stamp: "AIR MAIL", s: 0.7 }); reg(OB, out, t, 0, 0.0, { suit: true, mode: "sit", expr: "proud", arms: { l: ["hips", 1], r: ["point", 1] }, headTilt: Math.sin(t * 5) * 5 }, 0.66);
      wd(OB, out, "BARGAIN!", "#2f7a48", 0.45, 1.95, 0.4, (t - T("trip", tCh)) * 3, 0.9); sparkle(OB, out, t, 0, 1.4, 0.4, 0.3, 3); } });
  kick1(T("trip", tCh));
  // 35 Just ask…: loop: shot 1's view, Reg sinking back into the crate, the lid flying back on
  const tL = S("Just ask");
  shot({ at: tL, ...S1({ set: "hold" }), cam: heroCam, cInf: 0.8, focus: HO.p(0, 1.0, 0), shadowR: 6, loop: true, stage(t, out) { const k = clamp01((t - tL) / Math.max(0.3, END - tL - 0.05)); heroStage(t, out, lerp(0.75, 0.45, k)); } });
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
