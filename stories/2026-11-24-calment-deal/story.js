// Shot plan for "He Bet She'd Die Soon… She Lived to 122" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts: in 1965 Jeanne Calment (90, Arles) sold her apartment en viager to a lawyer (André-François Raffray, 47): 2,500 francs a month until she died,
// then the flat was his. She cycled until 100, smoked until 117, sometimes ate a kilo of chocolate a week. He died in 1995 (77); his family had to keep
// paying; she died in 1997 at 122, the oldest person ever; in total more than double the apartment's value was paid. Her line: "In life, one sometimes
// makes bad deals." (Guinness World Records 2025 + 2024 articles, Wikipedia "Jeanne Calment"). Hook-first (the deal on frame 0), cut every
// ~1.5-2 s, loop ending back to the hook.
import * as K from "./draw_calment.js";
import { INK } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1700;
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
  confetti: (p, k) => { const g = p.g, W = g.canvas.width, Hh = g.canvas.height; g.clearRect(0, 0, W, Hh); const C = ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a", "#ffffff", "#c8202e"]; for (let i = 0; i < 46; i++) { const x = hh(i, 1) * W, y = ((hh(i, 2) * Hh + k * 30 * (0.6 + hh(i, 3))) % (Hh + 48)) - 24; g.save(); g.translate(x, y); g.rotate(k * 0.7 + i); g.fillStyle = C[i % 6]; g.fillRect(-9, -5, 18, 10); g.restore(); } },
  thought: (p) => { const g = p.g; g.clearRect(0, 0, 768, 640); g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 10; for (const [x, y, r] of [[120, 600, 22], [190, 530, 34]]) { g.beginPath(); g.arc(x, y, r, 0, two); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(430, 270, 300, 230, 0, 0, two); g.fill(); g.stroke(); },
};
const drawBubble = (g, s, col = "#2a2a36") => { g.clearRect(0, 0, 768, 384); g.lineJoin = "round"; g.beginPath(); g.ellipse(384, 170, 350, 140, 0, 0, two); g.moveTo(240, 290); g.lineTo(150, 370); g.lineTo(330, 300); g.fillStyle = "#ffffff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  g.beginPath(); g.ellipse(384, 170, 344, 134, 0, 0, two); g.fill(); txt(g, s, 384, 176, 100, "Bangers", col, INK, 0, 600); };

const oc = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d")); return c; };
const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });

export let SHOTS = [];
let THUMB = null;
const thumbShot = () => SHOTS[0];

// people
const JEANNE = { jacket: "#8a4aa0", pants: "#8a4aa0", dress: "#8a4aa0", boots: "#3a2a2a", hat: "hair", hair: "#d4d4de", skin: "#f4d6bc", build: "adult" };
const LAW = (age) => ({ jacket: "#2a3a5a", pants: "#2a3040", boots: INK, hat: "hair", hair: ["#2a1a10", "#7a7a80", "#e4e4e8"][age], skin: "#f0cfb0", build: age > 1 ? "stout" : "adult", ...(age ? { moustache: ["#2a1a10", "#7a7a80", "#e4e4e8"][age] } : {}) });
const FAM = (v) => ({ jacket: ["#2a2a30", "#34343c", "#2e2e36"][v % 3], pants: "#26262c", ...(v === 0 ? { dress: "#2a2a30" } : {}), boots: INK, hat: "hair", hair: ["#6a4a2a", "#2a1a10", "#b8783a"][v % 3], skin: ["#f2d2b6", "#ecd0b6", "#f4d6bc"][v % 3], build: "adult" });
const FAN = (v) => ({ jacket: ["#c8503a", "#6a9a4a", "#e8b83a", "#8a5ab0", "#3a7ac8"][v % 5], pants: ["#3a3a48", "#5a4a3a"][v % 2], boots: INK, hat: v % 3 === 2 ? "fedora" : "hair", cap: "#4a4a52", hair: ["#c89a4a", "#2a201a", "#8a5a32", "#3a2a1a"][v % 4], skin: ["#f2d2b6", "#e8b894", "#ecd0b6", "#c99067"][v % 4], build: "adult" });
const IMG = {};
const img = (key, w, h, f) => IMG[key] || (IMG[key] = oc(w, h, f));
const rhand = (key, w, h, f, dx, dy, dw, dh, rot = 0) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(rot); g.drawImage(img(key, w, h, f), dx, dy, dw, dh); g.restore(); };
const XL = {
  env: rhand("env", 256, 192, (g) => K.drawEnv(g), -70, -80, 140, 105, -0.2),
  watch: rhand("watch", 256, 320, (g) => K.drawWatch(g, 1.2), -50, -110, 100, 125),
  choc: rhand("choc", 512, 256, (g) => K.drawChoc(g, 1), -50, -100, 170, 85, -0.9),
  cig: rhand("cig", 256, 64, (g) => K.drawCig(g), -10, -30, 90, 22, -0.5),
  cup: rhand("cup", 256, 256, (g) => K.drawCup(g), -50, -100, 100, 100),
  cam: rhand("pcam", 256, 256, (g) => K.drawPhoneCam(g), -60, -90, 120, 120),
  cane: (p) => { const H = p.hands; if (!H || !H.r) return; p.g.drawImage(img("cane", 128, 640, K.drawCane), H.r[0] - 30, H.r[1] - 20, 60, 300); },
};

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const SETS = ["office", "apart", "street", "party", "drama", "bank"];
  const base = (k) => [3200 + SETS.indexOf(k) * 200, 2000, 0];
  const at = (k) => { const B = base(k), Af = (x, y, z) => [B[0] + x, B[1] + y, B[2] + z];
    return { k, p: Af,
      fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
      ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); } }; };
  const H = Object.fromEntries(SETS.map((k) => [k, at(k)]));
  const lights = { day: { light: "day", sunAz: 200, sunEl: 50, fogFar: 4000 }, night: { light: "night", sunAz: 20, sunEl: 30, fogFar: 4000 }, golden: { light: "golden", sunAz: 160, sunEl: 35, fogFar: 4000 } };
  const LT = { office: "golden", apart: "day", street: "day", party: "golden", drama: "night", bank: "day" };
  const room = (h, out, t, wallZ = -5) => { const anim = ["apart", "party", "drama"].includes(h.k) ? Math.floor(t * 10) % 40 : 0;
    h.fx(out, "wall_" + h.k + anim, (p) => K.drawWall(p.g, h.k, anim / 10), 0, 7, wallZ, 14, 14, { cw: 1024, ch: 1024, kind: "basic", normal: [0, 0, 1] });
    h.fx(out, "floor_" + h.k, (p) => K.drawFloor(p.g, K.FLOOR[h.k], h.k), 0, 0, wallZ + 9, 30, 18, { cw: 512, ch: 512, kind: "basic", flat: true }); };
  const S1 = (o) => ({ ...lights[LT[o.set]], ...o });
  const mk = (h, out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); h.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic" }); };
  const wd = (h, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); h.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const bd = (h, out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; h.fx(out, key + k, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const bub = (h, out, key, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; h.fx(out, key + s + k, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic" }); };
  const sparkle = (h, out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) h.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  const sweat = (h, out, t, x, y, z, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1; h.fx(out, "sweat", (p) => DR.sweat(p), x + (i - 1) * 0.16 + ph * 0.05 * (i - 1), y - ph * 0.25, z, 0.08, 0.08, { cw: 128, ch: 128, kind: "basic" }); } };
  const flashes = (h, out, t, pts, rate = 3) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; h.fx(out, "flash", (p) => K.drawFlash(p.g), x, y, z, 0.7 * k, 0.7 * k, { cw: 256, ch: 256, kind: "basic" }); } }); };
  // flying envelopes from (x0,y0) to (x1,y1) at depth z
  const envs = (h, out, t, x0, y0, x1, y1, z, n = 4, rate = 1.4, w = 0.3) => { for (let i = 0; i < n; i++) { const ph = (t * rate + i / n) % 1, y = lerp(y0, y1, ph) + Math.sin(ph * Math.PI) * 0.45; h.fx(out, "envf", (p) => K.drawEnv(p.g, { label: false }), lerp(x0, x1, ph), y, z + i * 0.01, w, w * 0.75, { cw: 256, ch: 192, kind: "lit", rot: Math.sin(t * 6 + i * 2) * 0.4 }); } };
  const jea = (h, out, t, x, z, o = {}, y = 0) => h.ppl(out, 1, { ...JEANNE, xk: o.xk || "" }, x, z, { keep: true, expr: o.expr ?? "grin", arms: o.arms ?? { l: ["hips", 1], r: ["hips", 1] }, headTilt: o.headTilt ?? 0, extra: o.extra, view: o.view, dir: o.dir, mode: o.mode ?? "stand", phase: o.phase, scale: o.s ?? 0.86 }, y);
  const law = (h, out, t, x, z, o = {}, y = 0) => h.ppl(out, 2, { ...LAW(o.age ?? 0), xk: o.xk || "" }, x, z, { keep: true, expr: o.expr ?? "sly", arms: o.arms ?? { l: ["hips", 1], r: ["hips", 1] }, headTilt: o.headTilt ?? 0, extra: o.extra, view: o.view, dir: o.dir, mode: o.mode ?? "stand", phase: o.phase, scale: o.s ?? 1 }, y);
  const desk = (h, out, x = 0, z = 0.35, w = 1.9) => h.fx(out, "desk", (p) => K.drawDesk(p.g), x, w * 0.25, z, w, w * 0.5, { cw: 1024, ch: 512, kind: "lit" });
  const cam = (h, p0, l0, p1, l1, fov = 46, dur = 1.8) => push(h.p(...p0), h.p(...l0), h.p(...p1), h.p(...l1), fov, dur);

  const { office: OF, apart: AP, street: ST, party: PA, drama: DM, bank: BK } = H;
  // ---- hero (shot 1 + loop): in the lawyer's office, the sly young lawyer checks his pocket watch while tiny grinning Jeanne grabs the envelope
  const heroCam = cam(OF, [0.25, 1.25, 3.3], [0, 1.1, 0], [0.12, 1.22, 2.75], [0, 1.12, 0], 50, 2.6);
  const heroStage = (t, out) => { room(OF, out, t);
    law(OF, out, t, 0.42, -0.05, { xk: "w", expr: Math.floor(t * 3) % 2 ? "sly" : "smile", arms: { l: ["hips", 1], r: ["face", 0.9] }, extra: XL.watch, headTilt: -6 + Math.sin(t * 5) * 3 });
    jea(OF, out, t, -0.45, 0.05, { xk: "e", expr: "laugh", arms: { l: ["up", 0.7], r: ["out", 1] }, extra: XL.env, headTilt: Math.sin(t * 8) * 6 });
    envs(OF, out, t, 0.35, 1.3, -0.4, 1.5, 0.35, 3, 1.2, 0.26); };
  // 1 He bet an old lady would die soon.
  shot({ a: 0, ...S1({ set: "office" }), cam: heroCam, cInf: 0.9, focus: OF.p(0, 1.1, 0), shadowR: 6, stage(t, out) { heroStage(t, out); } });
  kick1(0.3); kick1(T("die"));
  // 2 Big mistake.: Jeanne winks at the camera, OOPS!
  const tMi = T("mistake");
  shot({ at: S("Big mistake"), ...S1({ set: "apart" }), cam: cam(AP, [0, 1.15, 1.9], [0, 1.15, 0], [0, 1.15, 1.55], [0, 1.15, 0], 44, 1.2), cInf: 1.6, focus: AP.p(0, 1.15, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, 0, 0, { expr: t > tMi ? "sly" : "smile", arms: { l: ["hips", 1], r: ["point", 1] }, headTilt: 8 }); wd(AP, out, "OOPS!", "#c8202a", 0.12, 1.55, 0.3, (t - tMi) * 3, 0.7); } });
  kick1(tMi);
  // 3 Huge.: the lawyer gulps, sweat
  const tHu = T("Huge");
  shot({ at: S("Huge"), ...S1({ set: "office" }), cam: cam(OF, [0, 1.5, 1.7], [0, 1.45, 0], [0, 1.5, 1.4], [0, 1.45, 0], 44, 0.4), cInf: 1.8, focus: OF.p(0, 1.45, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, 0, 0, { expr: "gasp", arms: { l: ["head", 1], r: ["head", 1] } }); sweat(OF, out, t, 0.18, 1.75, 0.2); } });
  kick1(tHu);
  // 4 She's ninety.: Jeanne with a 90 board
  const t90 = T("ninety");
  shot({ at: S("She's ninety"), ...S1({ set: "apart" }), cam: cam(AP, [0.2, 1.2, 2.7], [0, 1.15, 0], [0.1, 1.2, 2.3], [0, 1.15, 0], 46, 1.6), cInf: 1.2, focus: AP.p(0, 1.1, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, -0.22, 0, { expr: "proud", arms: { l: ["hips", 1], r: ["up", 1] }, extra: XL.cup, xk: "cup" }); bd(AP, out, "b90", "90", "YEARS OLD", "#8a4aa0", 0.2, 1.72, 0.3, (t - t90) * 3, 0.72); } });
  kick1(t90);
  // 5 He's a lawyer, half her age.
  const tHa = T("half");
  shot({ at: S("He's a lawyer"), ...S1({ set: "office" }), cam: cam(OF, [-0.2, 1.3, 2.8], [0, 1.25, 0], [-0.1, 1.3, 2.35], [0, 1.25, 0], 46, 1.9), cInf: 1.2, focus: OF.p(0, 1.2, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, -0.2, 0, { expr: "proud", arms: { l: ["hips", 1], r: ["shoulder", 1] }, headTilt: Math.sin(t * 4) * 4 }); bd(OF, out, "bhalf", "½", "HER AGE", "#2a3a5a", 0.22, 1.85, 0.3, (t - tHa) * 3, 0.72); } });
  kick1(tHa);
  // 6 The deal? He pays her…: the contract spins in and both sign
  const tDe = T("deal"), tPa = T("pays");
  shot({ at: S("The deal"), ...S1({ set: "office" }), cam: cam(OF, [0, 1.3, 2.1], [0, 1.25, 0], [0, 1.3, 1.8], [0, 1.25, 0], 44, 1.4), cInf: 1.5, focus: OF.p(0, 1.25, 0.2), shadowR: 6,
    stage(t, out) { room(OF, out, t); desk(OF, out); const u = clamp01((t - tDe + 0.2) / 0.5), k = Math.round(smooth(u) * 12) / 12, su = Math.round(clamp01((t - tPa + 0.3) / 1.4) * 16) / 16;
      OF.fx(out, "ctr" + su + "_" + k, (p) => K.drawContract(p.g, su), 0, 1.3, 0.45, 0.2 + 0.6 * k, (0.2 + 0.6 * k) * 1.375, { cw: 512, ch: 704, kind: "lit", rot: (1 - k) * 6.3 }); } });
  kick1(tDe);
  // 7 …every single month…: envelope after envelope flies from the lawyer to Jeanne
  const tMo = T("month");
  shot({ at: S("every single"), ...S1({ set: "apart" }), cam: cam(AP, [0, 1.25, 3.2], [0, 1.15, 0], [0, 1.25, 2.8], [0, 1.15, 0], 48, 1.2), cInf: 1.1, focus: AP.p(0, 1.1, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); law(AP, out, t, 0.55, -0.1, { expr: "smile", arms: { l: ["hips", 1], r: ["out", 1] } }); jea(AP, out, t, -0.5, 0, { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 9) * 6 });
      envs(AP, out, t, 0.35, 1.25, -0.5, 1.45, 0.3, 4, 1.8); wd(AP, out, "KA-CHING!", "#2f7a48", 0, 2.0, 0.3, (t - tMo) * 3, 0.85); } });
  kick1(tMo);
  // 8 …and when she dies, her apartment is his.: the lawyer dreams of the flat in a thought bubble
  const tAp = T("apartment"), t8 = S("and when");
  shot({ at: t8, ...S1({ set: "office" }), cam: cam(OF, [0.3, 1.5, 3.0], [0.2, 1.6, 0], [0.2, 1.5, 2.6], [0.2, 1.6, 0], 50, 2.4), cInf: 1.0, focus: OF.p(0.2, 1.5, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, -0.35, 0, { expr: "sly", arms: { l: ["hips", 1], r: ["face", 1] }, headTilt: 10 });
      const u = clamp01((t - t8) / 0.5), k = Math.round(smooth(u) * 8) / 8; if (k > 0) { OF.fx(out, "thought" + k, (p) => DR.thought(p), 0.35, 1.95, 0.2, 1.3 * k, 1.08 * k, { cw: 768, ch: 640, kind: "basic" });
        const v = Math.round(clamp01((t - tAp + 0.2) * 3) * 8) / 8; if (v > 0) OF.fx(out, "aptT" + v, (p) => K.drawApt(p.g, { tag: "MINE!" }), 0.45, 2.0, 0.25, 0.55 * v, 0.69 * v, { cw: 512, ch: 640, kind: "basic" }); }
      if (t > tAp) sparkle(OF, out, t, 0.45, 2.1, 0.3, 0.2, 3); } });
  kick1(tAp);
  // 9 Easy money, right?: lawyer laughs, money rain
  const tEa = T("Easy");
  shot({ at: S("Easy money"), ...S1({ set: "office" }), cam: cam(OF, [0, 1.4, 2.3], [0, 1.35, 0], [0, 1.4, 1.95], [0, 1.35, 0], 46, 1.5), cInf: 1.4, focus: OF.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, 0, 0, { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 10) * 6 }); envs(OF, out, t, -0.7, 2.3, 0.7, 0.6, 0.35, 5, 1.1, 0.22);
      wd(OF, out, "EASY!", "#2f7a48", 0, 2.05, 0.3, (t - tEa) * 3, 0.75); } });
  kick1(tEa);
  // 10 A few years, tops.: the lawyer taps his watch
  const tTo = T("tops");
  shot({ at: S("A few"), ...S1({ set: "office" }), cam: cam(OF, [0.15, 1.35, 2.2], [0, 1.35, 0], [0.1, 1.35, 1.9], [0, 1.35, 0], 44, 1.2), cInf: 1.5, focus: OF.p(0, 1.35, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, -0.15, 0, { xk: "w", expr: "smile", arms: { l: ["hips", 1], r: ["face", 1] }, extra: XL.watch }); mk(OF, out, "TOPS!", 0.4, 1.85, 0.3, (t - tTo) * 4, 0.5, "#ffd23a"); } });
  kick1(tTo);
  // 11 Years pass.: calendar flips 1966…1975
  const t11 = S("Years pass");
  shot({ at: t11, ...S1({ set: "apart" }), cam: cam(AP, [0, 1.3, 1.6], [0, 1.3, 0], [0, 1.3, 1.4], [0, 1.3, 0], 44, 0.6), cInf: 1.8, focus: AP.p(0, 1.3, 0.2), shadowR: 6,
    stage(t, out) { room(AP, out, t); const l = t - t11, n = Math.min(9, Math.floor(l * 18)), fl = (l * 18) % 1; AP.fx(out, "cal" + n + "_" + Math.round(fl * 4), (p) => K.drawCal(p.g, String(1966 + n), n < 9 ? Math.round(fl * 4) / 4 : 0), 0, 1.3, 0.2, 0.62, 0.72, { cw: 384, ch: 448, kind: "lit", rot: Math.sin(t * 20) * 0.03 }); } });
  // 12 She's still here.: Jeanne waves, HI!
  const tSt = T("still"), t12 = S("She's still");
  shot({ at: t12, ...S1({ set: "apart" }), cam: cam(AP, [-0.1, 1.2, 2.3], [0, 1.15, 0], [0, 1.2, 2.0], [0, 1.15, 0], 46, 0.8), cInf: 1.3, focus: AP.p(0, 1.15, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, 0, 0, { expr: "laugh", arms: { l: ["hips", 1], r: ["up", 0.6 + 0.4 * Math.sin(t * 16)] }, headTilt: Math.sin(t * 8) * 6 }); wd(AP, out, "HI!", "#8a4aa0", 0.32, 1.55, 0.3, (t - tSt) * 3, 0.6); } });
  // 13 More years.: calendar flips 1976…1985, the lawyer, grey now
  const t13 = S("More years");
  shot({ at: t13, ...S1({ set: "office" }), cam: cam(OF, [0, 1.4, 2.2], [0, 1.4, 0], [0, 1.4, 1.95], [0, 1.4, 0], 44, 0.8), cInf: 1.6, focus: OF.p(0, 1.4, 0.2), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, 0.4, -0.2, { age: 1, expr: "worried", arms: { l: ["hips", 1], r: ["head", 1] } }); const l = t - t13, n = Math.min(9, Math.floor(l * 14)), fl = (l * 14) % 1;
      OF.fx(out, "calb" + n + "_" + Math.round(fl * 4), (p) => K.drawCal(p.g, String(1976 + n), n < 9 ? Math.round(fl * 4) / 4 : 0), -0.18, 1.35, 0.2, 0.55, 0.64, { cw: 384, ch: 448, kind: "lit" }); } });
  // 14 She's riding her bicycle…: Jeanne pedals down the sunny street
  const t14 = S("She's riding");
  const bikeStage = (t, out, sp = 1) => { room(ST, out, t); ST.fx(out, "bike", (p) => K.drawBike(p.g), 0, 0.5, 0.06, 1.5, 1.0, { cw: 768, ch: 512, kind: "lit" });
    ST.ppl(out, 1, JEANNE, -0.1, 0, { keep: true, expr: "laugh", view: "side", dir: [1, 0], mode: "swing", pose: 0.45 + 0.35 * Math.sin(t * 9 * sp), scale: 0.86 }, 0.22 + 0.01 * Math.sin(t * 18 * sp));
    for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; ST.fx(out, "speed", (p) => { const g = p.g; g.clearRect(0, 0, 256, 64); K.line(g, [[10, 32], [246, 32]], "rgba(255,255,255,0.9)", 14); }, -0.9 - ph * 1.2, 0.6 + i * 0.35, 0.2, 0.6, 0.12, { cw: 256, ch: 64, kind: "basic" }); } };
  shot({ at: t14, ...S1({ set: "street" }), cam: keys([{ t: 0, pos: ST.p(1.2, 1.1, 3.0), look: ST.p(0, 0.9, 0), fov: 48 }, { t: 1.8, pos: ST.p(0.5, 1.0, 2.6), look: ST.p(0, 0.95, 0), fov: 46 }]), cInf: 1.1, focus: ST.p(0, 0.9, 0), shadowR: 6, stage(t, out) { bikeStage(t, out); } });
  // 15 …at a hundred.: 100 board
  const t100 = T("hundred");
  shot({ at: S("at a hundred"), ...S1({ set: "street" }), cam: cam(ST, [-0.3, 1.3, 2.4], [0, 1.2, 0], [-0.2, 1.3, 2.1], [0, 1.25, 0], 46, 1.3), cInf: 1.3, focus: ST.p(0, 1.2, 0), shadowR: 6,
    stage(t, out) { bikeStage(t, out, 1.5); bd(ST, out, "b100", "100!", "YEARS OLD", "#c8202a", 0.05, 1.85, 0.3, (t - t100) * 3, 0.8); } });
  kick1(t100);
  // 16 She smokes.: smoke rings, ?!
  const tSm = T("smokes");
  shot({ at: S("She smokes"), ...S1({ set: "apart" }), cam: cam(AP, [0.2, 1.2, 2.2], [0, 1.2, 0], [0.1, 1.2, 1.9], [0, 1.2, 0], 44, 1.6), cInf: 1.5, focus: AP.p(0, 1.15, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, 0, 0, { xk: "cig", expr: "sly", arms: { l: ["hips", 1], r: ["face", 0.8] }, extra: XL.cig, headTilt: -6 }); AP.fx(out, "smoke" + Math.floor(t * 12) % 24, (p) => K.drawSmoke(p.g, (Math.floor(t * 12) % 24) / 24), 0.2, 1.9, 0.15, 0.4, 0.8, { cw: 256, ch: 512, kind: "basic" });
      mk(AP, out, "?!", -0.3, 1.6, 0.3, (t - tSm) * 4, 0.4, "#ffe85a"); } });
  kick1(tSm);
  // 17 Some weeks, she eats a kilo of chocolate.: munching next to a tower of chocolate bars
  const tCh = T("chocolate"), tKi = T("kilo");
  shot({ at: S("Some weeks"), ...S1({ set: "apart" }), cam: cam(AP, [0, 1.2, 2.6], [0, 1.15, 0], [0, 1.2, 2.2], [0, 1.15, 0], 46, 2.4), cInf: 1.2, focus: AP.p(0, 1.1, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, -0.25, 0, { xk: "choc", expr: Math.floor(t * 6) % 2 ? "chew" : "grin", arms: { l: ["hips", 1], r: ["feed", 1] }, extra: XL.choc });
      const n = Math.min(12, Math.max(1, Math.floor((t - tKi + 0.6) * 10))); AP.fx(out, "chp" + n, (p) => K.drawChocPile(p.g, n), 0.33, 0.6, 0.25, 0.8, 1.2, { cw: 512, ch: 768, kind: "lit" });
      wd(AP, out, "1 KG!", "#6a3a22", 0.3, 1.7, 0.35, (t - tCh) * 3, 0.65); } });
  kick1(tKi); kick1(tCh);
  // 18 Every month, he pays.: the grey lawyer at his desk, sadly holding out an envelope
  const t18 = S("Every month he");
  shot({ at: t18, ...S1({ set: "office" }), cam: cam(OF, [0.2, 1.35, 2.6], [0, 1.1, 0], [0.1, 1.35, 2.25], [0, 1.1, 0], 46, 1.6), cInf: 1.3, focus: OF.p(0, 1.1, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, 0, -0.35, { age: 1, xk: "e", expr: "sad", arms: { l: ["hips", 1], r: ["out", 1] }, extra: XL.env }); desk(OF, out); sweat(OF, out, t, 0.2, 1.7, -0.2); } });
  // 19 Every month, she's fine.
  const tFi = T("fine");
  shot({ at: S("Every month she's"), ...S1({ set: "apart" }), cam: cam(AP, [-0.15, 1.2, 2.2], [0, 1.2, 0], [-0.05, 1.2, 1.9], [0, 1.2, 0], 44, 1.4), cInf: 1.5, focus: AP.p(0, 1.15, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, 0, 0, { expr: "proud", arms: { l: ["hips", 1], r: ["up", 1] }, headTilt: Math.sin(t * 6) * 5 }); sparkle(AP, out, t, 0, 1.3, 0.3, 0.3, 3); wd(AP, out, "FINE!", "#2f7a48", 0.35, 1.8, 0.35, (t - tFi) * 3, 0.65); } });
  kick1(tFi);
  // 20 Decades later… he's still paying.: white-haired lawyer next to a towering stack of envelopes
  const t20 = S("Decades"), tPy = T("paying");
  shot({ at: t20, ...S1({ set: "office" }), cam: keys([{ t: 0, pos: OF.p(0, 1.3, 3.4), look: OF.p(0, 1.4, 0), fov: 50 }, { t: 1.8, pos: OF.p(0.1, 1.4, 2.8), look: OF.p(0, 1.4, 0), fov: 48 }]), cInf: 1.0, focus: OF.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, -0.35, -0.1, { age: 2, xk: "e", expr: "sad", arms: { l: ["hips", 1], r: ["out", 1] }, extra: XL.env });
      const n = Math.min(60, Math.floor((t - t20) * 40)); OF.fx(out, "stk" + n, (p) => K.drawStack(p.g, n), 0.5, 1.15, 0.0, 1.15, 2.3, { cw: 512, ch: 1024, kind: "lit" }); if (t > tPy) sweat(OF, out, t, -0.15, 1.7, 0.1); } });
  kick1(tPy);
  // 21 He gets old… she just gets older.: old lawyer with a cane, then Jeanne laughing behind a big birthday cake
  const tOl = T("older"), t21 = S("He gets"), tSj = T("she just");
  shot({ at: t21, ...S1({ set: "apart" }), cam: cam(AP, [0, 1.15, 3.2], [0, 1.05, 0], [0, 1.15, 2.85], [0, 1.05, 0], 48, 1.6), cInf: 1.1, focus: AP.p(0, 1.0, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); law(AP, out, t, 0.55, -0.1, { age: 2, xk: "cane", expr: "pained", arms: { l: ["hips", 1], r: ["low", 1] }, extra: XL.cane, headTilt: 12 });
      if (t > tSj - 0.1) { jea(AP, out, t, -0.45, 0.1, { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 9) * 6 }); AP.fx(out, "cake", (p) => K.drawCake(p.g, 1), -0.45, 0.45, 0.45, 0.8, 0.8, { cw: 512, ch: 512, kind: "lit" }); }
      wd(AP, out, "OLDER!", "#8a4aa0", -0.3, 2.0, 0.4, (t - tOl) * 3, 0.75); } });
  kick1(tSj); kick1(tOl);
  // 22 Wait, it gets worse.: red drama room, the old lawyer gasps
  const tWo = T("worse");
  shot({ at: S("Wait it"), ...S1({ set: "drama" }), cam: cam(DM, [0, 1.4, 2.6], [0, 1.35, 0], [0, 1.45, 1.6], [0, 1.4, 0], 46, 1.5), cInf: 1.4, focus: DM.p(0, 1.35, 0), shadowR: 6,
    stage(t, out) { room(DM, out, t); law(DM, out, t, 0, 0, { age: 2, expr: "shock", arms: { l: ["head", 1], r: ["head", 1] } }); wd(DM, out, "WORSE!", "#c8202a", 0, 2.1, 0.3, (t - tWo) * 3, 0.8); } });
  kick1(tWo);
  // 23 The lawyer… dies: his empty chair, his hat drifting down onto it, a candle
  const t23 = S("The lawyer"), tDi = T("dies", t23);
  shot({ at: t23, ...S1({ set: "office" }), cam: cam(OF, [0, 1.0, 2.6], [0, 0.9, 0], [0, 1.0, 2.1], [0, 0.9, 0], 46, 1.7), cInf: 1.3, focus: OF.p(0, 0.9, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); OF.fx(out, "chair", (p) => K.drawChair(p.g), 0, 0.62, -0.2, 1.0, 1.25, { cw: 512, ch: 640, kind: "lit" });
      const u = clamp01((t - tDi + 0.6) / 1.0); OF.fx(out, "hat", (p) => K.drawHat(p.g), Math.sin(u * 7) * 0.15 * (1 - u), lerp(1.9, 0.86, smooth(u)), 0.0, 0.5, 0.33, { cw: 384, ch: 256, kind: "lit", rot: Math.sin(u * 7) * 0.4 * (1 - u) });
      OF.fx(out, "cdl" + Math.floor(t * 10) % 20, (p) => K.drawCandle(p.g, Math.floor(t * 10) % 20), 0.7, 0.6, 0.1, 0.18, 0.54, { cw: 128, ch: 384, kind: "basic" }); } });
  // 24 …first.: Jeanne, shocked
  const tFr = T("first", tDi);
  shot({ at: tFr - 0.1, ...S1({ set: "apart" }), cam: cam(AP, [0, 1.25, 1.9], [0, 1.25, 0], [0, 1.25, 1.65], [0, 1.25, 0], 44, 0.6), cInf: 1.7, focus: AP.p(0, 1.2, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, 0, 0, { expr: "gasp", arms: { l: ["face", 1], r: ["face", 1] } }); mk(AP, out, "!?", 0.3, 1.55, 0.3, (t - tFr) * 4, 0.4); } });
  kick1(tFr);
  // 25 His family? They have to keep paying.: the family in black, the widow holds out an envelope, the son gasps
  const tFa = T("family"), tKp = T("keep paying");
  shot({ at: S("His family"), ...S1({ set: "apart" }), cam: cam(AP, [0, 1.2, 3.4], [0, 1.05, 0], [0, 1.2, 3.0], [0, 1.05, 0], 50, 1.8), cInf: 1.0, focus: AP.p(0, 1.0, 0), shadowR: 8,
    stage(t, out) { room(AP, out, t); [[0.15, 0, 0], [0.62, -0.3, 1]].forEach(([x, z, v]) => AP.ppl(out, 10 + v, { ...FAM(v), xk: v === 0 ? "e" : "" }, x, z, { keep: true, expr: v === 0 ? "sad" : "gasp", arms: v === 0 ? { l: ["hips", 1], r: ["out", 1] } : { l: ["head", 1], r: ["head", 1] }, extra: v === 0 ? XL.env : undefined }));
      jea(AP, out, t, -0.48, 0.1, { expr: "grin", arms: { l: ["hips", 1], r: ["out", 1] }, headTilt: 6 }); if (t > tKp) sweat(AP, out, t, 0.62, 1.8, -0.2); wd(AP, out, "STILL?!", "#c8202a", 0.2, 2.05, 0.3, (t - tKp) * 3, 0.7); } });
  kick1(tFa); kick1(tKp);
  // 26 And she just keeps cashing the checks.: at the bank, cheque after cheque gets CASHED!
  const t26 = S("And she just");
  shot({ at: t26, ...S1({ set: "bank" }), cam: cam(BK, [0.1, 1.35, 2.5], [0, 1.25, 0], [0.05, 1.35, 2.15], [0, 1.25, 0], 46, 2.0), cInf: 1.3, focus: BK.p(0, 1.2, 0), shadowR: 6,
    stage(t, out) { room(BK, out, t); jea(BK, out, t, -0.45, -0.1, { expr: "laugh", arms: { l: ["hips", 1], r: ["chop", 0.6 + 0.4 * Math.abs(Math.sin(t * 7))] }, headTilt: Math.sin(t * 8) * 5 });
      const l = (t - t26) * 1.6, i = Math.floor(l), pv = Math.round(Math.min(1, (l % 1) * 3) * 6) / 6; BK.fx(out, "chk" + pv, (p) => K.drawCheck(p.g, pv), 0.2, 1.3 + (i % 2) * 0.05, 0.35, 0.75, 0.34, { cw: 768, ch: 352, kind: "lit", rot: (i % 2 ? 0.08 : -0.06) }); } });
  kick1(T("checks"));
  // 27 She becomes the oldest person who ever lived.: party room, sash, confetti, flashbulbs
  const tOd = T("oldest");
  shot({ at: S("She becomes"), ...S1({ set: "party" }), cam: cam(PA, [0.2, 1.3, 3.6], [0, 1.2, 0], [0.1, 1.3, 3.1], [0, 1.25, 0], 50, 2.4), cInf: 0.9, focus: PA.p(0, 1.2, 0), shadowR: 8,
    stage(t, out) { room(PA, out, t); jea(PA, out, t, 0, 0.3, { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 8) * 5 }); PA.fx(out, "sash", (p) => K.drawSash(p.g), 0, 0.95, 0.5, 0.8, 0.2, { cw: 768, ch: 192, kind: "lit", rot: -0.15 });
      [[-0.75, -0.3], [0.75, -0.3]].forEach(([x, z], i) => PA.ppl(out, 20 + i, { ...FAN(i), xk: "cam" }, x, z, { keep: true, expr: "talk_o", arms: { l: ["low", 1], r: ["out", 1] }, extra: XL.cam, headTilt: Math.sin(t * 10 + i) * 6 }));
      flashes(PA, out, t, [[-0.9, 1.9, 0.6], [0.9, 2.0, 0.6]], 2.5); if (t > tOd - 0.1) PA.fx(out, "conf" + Math.floor(t * 15) % 60, (p) => DR.confetti(p, Math.floor(t * 15) % 60), 0, 1.6, 1.0, 2.6, 3.2, { cw: 512, ch: 640, kind: "basic" }); } });
  kick1(tOd);
  // 28 In the end, they paid more than double what the apartment was worth.: the balance tips, ×2
  const tDb = T("double");
  shot({ at: S("In the end"), ...S1({ set: "bank" }), cam: cam(BK, [0, 1.35, 3.6], [0, 1.3, 0], [0, 1.35, 3.1], [0, 1.3, 0], 46, 3.0), cInf: 1.2, focus: BK.p(0, 1.3, 0.2), shadowR: 6,
    stage(t, out) { room(BK, out, t); const k = Math.round(smooth(clamp01((t - tDb + 0.3) / 0.8)) * 10) / 10; BK.fx(out, "scale" + k, (p) => K.drawScale(p.g, k), 0, 1.3, 0.2, 1.5, 1.5, { cw: 768, ch: 768, kind: "lit" });
      if (t > tDb) sparkle(BK, out, t, 0.5, 1.2, 0.35, 0.2, 3); } });
  kick1(tDb);
  // 29 He never even got the keys.: keys dangle, a red X slams over them
  const tKe = T("keys");
  shot({ at: S("He never"), ...S1({ set: "office" }), cam: cam(OF, [0, 1.4, 1.7], [0, 1.35, 0], [0, 1.4, 1.45], [0, 1.35, 0], 44, 1.8), cInf: 1.8, focus: OF.p(0, 1.35, 0.2), shadowR: 6,
    stage(t, out) { room(OF, out, t); const x = Math.round(clamp01((t - tKe) * 4) * 6) / 6; OF.fx(out, "keys" + x, (p) => K.drawKeys(p.g, x), 0, 1.35, 0.2, 0.7, 0.7, { cw: 512, ch: 512, kind: "lit", rot: Math.sin(t * 4) * 0.15 }); } });
  kick1(tKe);
  // 30 Her verdict?: Jeanne leans in, sly
  shot({ at: S("Her verdict"), ...S1({ set: "apart" }), cam: cam(AP, [0, 1.3, 1.8], [0, 1.3, 0], [0, 1.3, 1.55], [0, 1.3, 0], 44, 0.7), cInf: 1.7, focus: AP.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, 0, 0, { xk: "cup", expr: "sly", arms: { l: ["hips", 1], r: ["up", 0.8] }, extra: XL.cup, headTilt: -8 }); } });
  // 31 "In life, one sometimes makes bad deals.": speech bubble
  const tBa = T("bad"), t31 = S("In life");
  shot({ at: t31, ...S1({ set: "apart" }), cam: cam(AP, [0.2, 1.3, 2.6], [0, 1.35, 0], [0.1, 1.3, 2.25], [0, 1.35, 0], 46, 2.6), cInf: 1.3, focus: AP.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(AP, out, t); jea(AP, out, t, -0.3, 0, { xk: "cup", expr: Math.floor(t * 5) % 2 ? "talk_o" : "smile", arms: { l: ["hips", 1], r: ["up", 0.8] }, extra: XL.cup });
      bub(AP, out, "bub", t > tBa - 0.1 ? "BAD DEALS!" : "IN LIFE…", "#8a4aa0", 0.22, 1.82, 0.3, (t - t31) * 3, 1.0); } });
  kick1(tBa);
  // 32 He sure did.: the old lawyer facepalms
  const tSu = T("sure");
  shot({ at: S("He sure"), ...S1({ set: "office" }), cam: cam(OF, [0, 1.4, 2.0], [0, 1.4, 0], [0, 1.4, 1.75], [0, 1.4, 0], 44, 0.8), cInf: 1.6, focus: OF.p(0, 1.4, 0), shadowR: 6,
    stage(t, out) { room(OF, out, t); law(OF, out, t, 0, 0, { age: 2, expr: "pained", arms: { l: ["hips", 1], r: ["face", 1] } }); mk(OF, out, "OOF", 0.12, 1.8, 0.3, (t - tSu) * 4, 0.45, "#ffd23a"); } });
  kick1(tSu);
  // 33 He bet…: loop: shot 1's view, played backwards into frame 0
  const tL = S("He bet", tSu);
  shot({ at: tL, ...S1({ set: "office" }), cam: heroCam, cInf: 0.9, focus: OF.p(0, 1.1, 0), shadowR: 6, loop: true, stage(t, out) { heroStage(t, out); } });
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
