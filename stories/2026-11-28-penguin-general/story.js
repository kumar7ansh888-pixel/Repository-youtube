// Shot plan for "This Penguin Is a General in the Army" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts (SCRIPT.md sources): Sir Nils Olav, king penguin at Edinburgh Zoo, mascot of the Norwegian King's Guard since 1972 (lance corporal), promoted on
// each Guard visit (corporal 1982, sergeant 1987, RSM 1993, ..., knighted 2008 with King Harald V's approval: "in every way qualified to receive the
// honour and dignity of knighthood"), Brigadier 2016, Major General 2023 (third-highest rank), soldiers "inspected by their own mascot", Nils Olav I died
// in 1987 and a near-double took over, now Nils Olav III, bronze statue, became a father in 2026 (Wikipedia, Guinness, Edinburgh Zoo, Tattoo, Countryfile).
// Every main location is the real 3D ZOO set in world.js, moving camera in every shot. Hook-first, cut every ~1.7 s, loop ending.
import * as K from "./draw_nils.js";
import { ZOO } from "./world.js";
import { INK } from "../lib/toon.js";

export const FPS = 30;
let WORDS = [];
export let TOTAL = 1800;
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
const { txt, poly, hh, R, E } = K;

const DR = {
  mark: (p, s, col = "#ffe85a") => { const g = p.g; g.clearRect(0, 0, 256, 256); txt(g, s, 128, 136, s.length > 2 ? 110 : 200, "Bangers", col, INK, 14, 240); },
  word: (p, s, col, u) => { const g = p.g; g.clearRect(0, 0, 512, 256); g.save(); g.translate(256, 128); const k = 0.7 + 0.3 * Math.min(1, u * 3); g.scale(k, k); g.fillStyle = "#fff4b0"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * two, r = i % 2 ? 80 : 118; g.lineTo(Math.cos(a) * r * 2, Math.sin(a) * r * 0.9); } g.closePath(); g.fill(); g.stroke(); txt(g, s, 0, 6, 92, "Bangers", col, INK, 10, 400); g.restore(); },
  numBoard: (p, n, label, col) => { const g = p.g; g.clearRect(0, 0, 1024, 512); g.fillStyle = "#fbf3dc"; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.roundRect(30, 30, 964, 452, 40); g.fill(); g.stroke(); g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); g.roundRect(56, 56, 912, 400, 28); g.stroke();
    txt(g, n, 512, 210, 230, "Bangers", col, INK, 16, 900); txt(g, label, 512, 380, 110, "Bangers", "#2a2a36", INK, 0, 880); },
  spark: (p, col = "#fffbe8") => { const g = p.g; g.clearRect(0, 0, 256, 256); poly(g, [[128, 10], [148, 108], [246, 128], [148, 148], [128, 246], [108, 148], [10, 128], [108, 108]], col, 8); },
  sweat: (p) => { const g = p.g; g.clearRect(0, 0, 128, 128); g.beginPath(); g.moveTo(64, 10); g.quadraticCurveTo(110, 80, 64, 118); g.quadraticCurveTo(18, 80, 64, 10); g.fillStyle = "#8fd0ff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); },
  confetti: (p, k) => { const g = p.g, W = g.canvas.width, Hh = g.canvas.height; g.clearRect(0, 0, W, Hh); const C = ["#ff5a7a", "#ffd23a", "#4ab0ff", "#7ad04a", "#ffffff", "#c8202e"]; for (let i = 0; i < 46; i++) { const x = hh(i, 1) * W, y = ((hh(i, 2) * Hh + k * 30 * (0.6 + hh(i, 3))) % (Hh + 48)) - 24; g.save(); g.translate(x, y); g.rotate(k * 0.7 + i); g.fillStyle = C[i % 6]; g.fillRect(-9, -5, 18, 10); g.restore(); } },
  zzz: (p, k) => { const g = p.g; g.clearRect(0, 0, 256, 256); for (let i = 0; i < 3; i++) { const ph = (k / 12 + i / 3) % 1; g.globalAlpha = Math.min(1, (1 - ph) * 3); txt(g, "Z", 70 + ph * 120 + i * 6, 220 - ph * 180, 40 + ph * 50, "Bangers", "#ffffff", INK, 8); } g.globalAlpha = 1; },
  heart: (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); K.heart(g, 128, 140, 180); },
  label: (p, s, col) => { const g = p.g; g.clearRect(0, 0, 768, 256); R(g, 20, 30, 728, 196, 30, col, 10); txt(g, s, 384, 130, 120, "Bangers", "#ffffff", INK, 8, 680); },
};
const drawBubble = (g, s, col = "#2a2a36") => { g.clearRect(0, 0, 768, 384); g.lineJoin = "round"; g.beginPath(); g.ellipse(384, 170, 350, 140, 0, 0, two); g.moveTo(240, 290); g.lineTo(150, 370); g.lineTo(330, 300); g.fillStyle = "#ffffff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  g.beginPath(); g.ellipse(384, 170, 344, 134, 0, 0, two); g.fill(); txt(g, s, 384, 176, 100, "Bangers", col, INK, 0, 600); };

const pl = (i, o, x, y, z, opt = {}) => ({ i, o, x, y, z, mode: "stand", expr: "neutral", scale: 1, ...opt });
const fxCard = (out, key, draw, x, y, z, w, h, o = {}) => out.fx.push({ key, cw: o.cw ?? 512, ch: o.ch ?? 512, draw, x, y, z, w, h, ...o });
const screenCard = (out, c, key, draw, d = 0.6, cw = 1024, ch = 512, kind = "soft") => {
  const fx = c.look[0] - c.pos[0], fy = c.look[1] - c.pos[1], fz = c.look[2] - c.pos[2], n = Math.hypot(fx, fy, fz);
  const h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.03, w = h * (9 / 16) * 1.03;
  out.fx.push({ key, cw, ch, draw, x: c.pos[0] + (fx / n) * d, y: c.pos[1] + (fy / n) * d, z: c.pos[2] + (fz / n) * d, w, h, kind });
};

export let SHOTS = [];
let CAM = null;
let THUMB = null;
const thumbShot = () => SHOTS[0];


const SKIN = ["#f2d2b6", "#e8b894", "#ecd0b6", "#f4d6bc", "#e0b08a"];
const GUARD = (v) => ({ jacket: "#1a2038", pants: "#1a2038", boots: INK, hat: "shako", tuft: "#16161c", belt: "#f1efe6", buttons: "#e8c45a", rifle: true, hair: ["#c89a4a", "#3a2a1a", "#8a5a32"][v % 3], skin: SKIN[v % 5], build: "adult" });
const SALUTE = (v) => ({ ...GUARD(v), rifle: false });
const OLDOFF = { jacket: "#1a2038", pants: "#1a2038", boots: INK, hat: "shako_tall", tuft: "#16161c", belt: null, buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#d8d8dc", hair: "#d8d8dc", skin: "#f2d2b6", build: "stout" };
const KEEPER = { jacket: "#2a6a3a", pants: "#3a3a48", boots: INK, hat: "cap", cap: "#2a6a3a", hair: "#8a5a32", skin: "#f2d2b6", build: "adult" };
const FOLK = (v) => ({ jacket: ["#c8503a", "#6a9a4a", "#e8b83a", "#8a5ab0", "#3a7ac8", "#d0708a"][v % 6], pants: ["#3a3a48", "#5a4a3a", "#2a4a6a"][v % 3], boots: INK, hat: "hair", hair: ["#c89a4a", "#2a201a", "#8a5a32", "#3a2a1a", "#e8d08a", "#6a3a1a"][v % 6], skin: ["#f2d2b6", "#e8b894", "#ecd0b6", "#c99067", "#f4d6bc", "#a8704a"][v % 6], build: "adult" });

const XL = {
  hold: (draw, cw, ch, side = "r", s = 1, dx = 0, dy = 0) => (p) => { const H = p.hands; if (!H || !H[side]) return; const c = document.createElement("canvas"); c.width = cw; c.height = ch; draw(c.getContext("2d")); const w = 150 * s, h = w * ch / cw; p.g.drawImage(c, H[side][0] - w / 2 + dx, H[side][1] - h / 2 + dy, w, h); },
};

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const at = (B) => { const Af = (x, y, z) => [B[0] + x, B[1] + y, B[2] + z];
    return { p: Af,
      fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); if (o.bb && CAM) { const dx = CAM.pos[0] - X, dz = CAM.pos[2] - Z, n = Math.hypot(dx, dz) || 1; o = { ...o, normal: [dx / n, 0, dz / n] }; } fxCard(out, key, draw, X, Y, Z, w, h, o); },
      ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); } }; };
  const A = at(ZOO);
  const G = 0.14, PZ = 4.6, ROW = 3.0, ROW2 = 8.2, PLT = 1.0, DAIS = 0.47;
  const ST = [7, PLT, 1.2], DESK = [-14, 1.2, 12.4];
  const day = (o = {}) => ({ light: "day", sunAz: 200, sunEl: 50, fogFar: 2500, ...o });
  const gold = (o = {}) => ({ light: "golden", sunAz: 160, sunEl: 28, fogFar: 2500, ...o });
  const nite = (o = {}) => ({ light: "night", sunAz: 20, sunEl: 30, fogFar: 2500, ...o });
  const tc = (p0, l0, p1, l1, fov = 50, dur = 2.0) => push(A.p(...p0), A.p(...l0), A.p(...p1), A.p(...l1), fov, dur);
  const lin = (p0, v, l0, fov = 50, vl = v) => (l) => ({ pos: A.p(p0[0] + v[0] * l, p0[1] + v[1] * l, p0[2] + v[2] * l), look: A.p(l0[0] + vl[0] * l, l0[1] + vl[1] * l, l0[2] + vl[2] * l), fov, roll: 0 });
  const orbit = (c, r, y, a0, da, ly, fov = 50) => (l) => { const a = a0 + da * l; return { pos: A.p(c[0] + Math.sin(a) * r, y, c[2] + Math.cos(a) * r), look: A.p(c[0], ly, c[2]), fov, roll: 0 }; };
  const mk = (out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); A.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic", bb: true }); };
  const wd = (out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); A.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic", bb: true }); };
  const bd = (out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; A.fx(out, key + k, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic", bb: true }); };
  const lab = (out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; A.fx(out, "lab" + s + k, (p) => DR.label(p, s, col), x, y, z, w * k, w / 3 * k, { cw: 768, ch: 256, kind: "basic", bb: true }); };
  const bub = (out, key, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; A.fx(out, key + s + k, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic", bb: true }); };
  const sparkle = (out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) A.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2, bb: true }); } };
  const sweat = (out, t, x, y, z, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1; A.fx(out, "sweat", (p) => DR.sweat(p), x + (i - 1) * 0.16 + ph * 0.05 * (i - 1), y - ph * 0.25, z, 0.08, 0.08, { cw: 128, ch: 128, kind: "basic", bb: true }); } };
  const hearts = (out, t, x, y, z, n = 4, s = 0.3, spread = 1.2) => { for (let i = 0; i < n; i++) { const ph = (t * 0.7 + i / n) % 1, k = Math.sin(ph * Math.PI); A.fx(out, "heart", (p) => DR.heart(p), x + (hh(i, 3) - 0.5) * spread + Math.sin(ph * 6 + i) * 0.08, y + ph * 1.0, z + (hh(i, 4) - 0.5) * 0.3, s * k + 0.02, s * k + 0.02, { cw: 256, ch: 256, kind: "basic", bb: true }); } };
  const confetti = (out, t, x, y, z, w = 4, h = 5) => { const k = Math.floor(t * 12) % 24; A.fx(out, "conf" + k, (p) => DR.confetti(p, k), x, y, z, w, h, { cw: 512, ch: 640, kind: "basic", bb: true }); };
  const flashes = (out, t, pts, rate = 3) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; A.fx(out, "flash", (p) => K.drawFlash(p.g), x, y, z, 0.7 * k, 0.7 * k, { cw: 256, ch: 256, kind: "basic", bb: true }); } }); };
  const who = (out, id, o, x, z, opt = {}, y = G) => A.ppl(out, id, { ...o, xk: opt.xk || "" }, x, z, { keep: true, expr: opt.expr ?? "neutral", arms: opt.arms, headTilt: opt.headTilt ?? 0, tilt: opt.tilt ?? 0, extra: opt.extra, extraSide: opt.extraSide, view: opt.view, dir: opt.dir, mode: opt.mode ?? "stand", phase: opt.phase, stride: opt.stride, backView: opt.back, scale: opt.s ?? 1 }, y);
  const walker = (out, id, o, x, z, t, dir, opt = {}, y = G) => who(out, id, o, x, z, { mode: "march", stride: 1.0, phase: (t * 1.8 + id * 0.37) % 1, dir, ...opt }, y);
  // the penguin: front card (bb) or side card; h = height in m (a king penguin ~0.95 m)
  const q8 = (x) => Math.round((((x % 1) + 1) % 1) * 8) / 8;
  const pen = (out, x, z, o = {}, h = 0.95, y = G) => { const st = { ...o, k: q8(o.k ?? 0) }; delete st.side; delete st.left; const key = (o.side ? (o.left ? "pnL" : "pnS") : "pnF") + JSON.stringify(st);
    A.fx(out, key, (p) => (o.side ? K.drawPenguinSide(p.g, { ...st, left: o.left }) : K.drawPenguin(p.g, st)), x, y + h * 0.5 - h * 0.04, z, h * 2 / 3, h, { cw: 512, ch: 768, kind: "lit", bb: true, rot: o.rot ?? 0 }); };
  const waddle = (out, x, z, t, o = {}, h = 0.95, y = G) => pen(out, x, z, { side: true, k: t * 2.4, ...o }, h, y);
  // guards: a rank along x at z, saluting (arms) or presenting arms (rifle)
  const rank = (out, t, z, x0, x1, dx = 1.1, o = {}) => { let i = 0; for (let x = x0; x <= x1 + 0.01; x += dx, i++) { const sal = o.salute ? o.salute(x, i) : false;
      who(out, 100 + i + (z > 6 ? 40 : 0), sal ? SALUTE(i) : GUARD(i), x, z, { expr: o.expr ? o.expr(x, i) : "stern", arms: sal ? { l: ["low", 1], r: ["head", 1] } : undefined, back: !!o.back, s: o.s ?? 1 }); } };
  const flags = (out, t) => { const k = Math.floor(t * 8) % 8; A.fx(out, "fNO" + k, (p) => K.drawFlagNO(p.g, k / 8), -18 + 1.3, 7.3, 10.6, 2.6, 1.3, { cw: 768, ch: 384, kind: "lit", bb: true }); A.fx(out, "fSC" + k, (p) => K.drawFlagSC(p.g, k / 8), 18 + 1.3, 7.3, 10.6, 2.6, 1.3, { cw: 768, ch: 384, kind: "lit", bb: true }); };
  const plaque = (out) => A.fx(out, "plaqZ", (p) => K.drawPlaque(p.g, "PENGUINS ROCK"), -10, 0.5, 0.06, 2.4, 0.6, { cw: 1024, ch: 256, kind: "lit", normal: [0, 0, 1] });
  const gateSign = (out) => A.fx(out, "gateS", (p) => K.drawPlaque(p.g, "EDINBURGH ZOO"), 41.05, 5.9, 5.5, 8.0, 1.0, { cw: 1024, ch: 256, kind: "lit", normal: [1, 0, 0] });
  const statue = (out, sp = 0) => { pen(out, ST[0], ST[2], { bronze: true, pose: "proud", face: "proud", stars: 2, medal: true }, 1.2, PLT); A.fx(out, "plaqS", (p) => K.drawPlaque(p.g, "SIR NILS OLAV", "MAJOR GENERAL"), ST[0], 0.6, ST[2] + 0.52, 0.9, 0.23, { cw: 1024, ch: 256, kind: "lit", normal: [0, 0, 1] }); };
  const set = (out, t) => { flags(out, t); plaque(out); gateSign(out); statue(out); };
  const crowd = (out, t, n = 8, z = 11.2, x0 = -6) => { for (let i = 0; i < n; i++) who(out, 60 + i, FOLK(i), x0 + i * 1.3 + hh(i, 3) * 0.4, z + hh(i, 4) * 0.8, { expr: ["smile", "grin", "shock", "laugh"][i % 4], arms: { l: ["low", 1], r: [i % 2 ? "up" : "point", 0.7 + 0.3 * Math.sin(t * 5 + i)] } }, 0.1); };
  // the general's look: 2 stars, medals, sash
  const GEN = { stars: 2, medals: 3, sash: true };
  // ---------------- hero (shot 1 + loop): ground-level tracking beside the penguin general waddling past saluting guards ----------------
  const HV = 0.55, heroX = (l) => -1.2 + HV * l;
  const heroCam = (l) => ({ pos: A.p(heroX(l) + 0.35, 0.45, PZ + 2.4), look: A.p(heroX(l) - 0.05, 0.8, ROW - 0.4), fov: 50, roll: 0 });
  const heroStage = (l, t, out) => { set(out, t); const x = heroX(l);
    rank(out, t, ROW, -6.6, 8.8, 1.1, { salute: (gx) => gx < x + 1.4, expr: (gx) => (Math.abs(gx - x) < 1.2 ? "shock" : "stern") });
    waddle(out, x, PZ, t, { ...GEN, face: "proud" }); };
  // 1 This penguin outranks…
  shot({ a: 0, ...day(), cam: heroCam, cInf: 0.8, focus: A.p(-0.6, 0.6, PZ), shadowR: 14, stage(t, out) { heroStage(t, t, out); mk(out, "★★", heroX(t) + 0.1, 1.25, PZ + 0.1, (t - T("outranks")) * 3, 0.45, "#ffd23a"); } });
  kick1(0.12); kick1(T("outranks"));
  // 2 …almost an entire army.: drone pulls up and back: two long ranks of guards saluting the little penguin in the middle
  const t2 = S("almost");
  shot({ at: t2, ...day(), cam: tc([1.0, 1.6, 9.6], [0, 0.8, 4.6], [6.5, 9.5, 24], [0, 0.5, 3.6], 50, 2.0), cInf: 0.5, focus: A.p(0, 1, 5), shadowR: 40,
    stage(t, out) { set(out, t); rank(out, t, ROW, -9.4, 9.4, 1.1, { salute: () => true }); rank(out, t, ROW2, -9.4, 9.4, 1.1, { salute: () => true, back: true });
      waddle(out, 0.2 + (t - t2) * 0.4, PZ + 1.0, t, { ...GEN, face: "proud" }); bd(out, "barmy", "1 PENGUIN", "VS AN ARMY", "#1c3a8a", 0, 4.2, 5.4, (t - T("army")) * 3, 3.2); } });
  kick1(T("army"));
  // 3 He's a general.: low hero angle, slow orbit up at the penguin, gold stars flash on his shoulders
  const t3 = S("He's a");
  shot({ at: t3, ...day(), cam: orbit([0, 0, PZ], 1.7, 0.28, -0.45, 0.35, 0.75, 46), cInf: 1.2, focus: A.p(0, 0.7, PZ), shadowR: 8,
    stage(t, out) { set(out, t); rank(out, t, ROW, -3.3, 3.3, 1.1, { salute: () => true }); pen(out, 0, PZ, { ...GEN, pose: "proud", face: "proud" }); sparkle(out, t, 0, 0.75, PZ + 0.05, 0.2, 4);
      lab(out, "GENERAL", "#c8202e", 0, 1.32, PZ + 0.1, (t - T("general")) * 3, 0.9); } });
  kick1(T("general"));
  // 4 A real one.: whip to a guard who nods hard, the penguin salutes back in front
  const t4 = S("A real");
  shot({ at: t4, ...day(), cam: tc([-1.2, 1.2, PZ + 2.6], [0.2, 1.3, ROW], [-0.8, 1.1, PZ + 2.0], [0.2, 1.25, ROW], 46, 1.0), cInf: 1.1, focus: A.p(0.2, 1.2, ROW), shadowR: 8,
    stage(t, out) { set(out, t); rank(out, t, ROW, -2.0, 2.4, 1.1, { salute: () => true }); who(out, 102, SALUTE(2), 0.2, ROW, { expr: "stern", arms: { l: ["low", 1], r: ["head", 1] }, headTilt: Math.sin(t * 14) * 8 });
      pen(out, -0.5, PZ, { ...GEN, pose: "salute", face: "stern" }); mk(out, "REAL!", 0.5, 2.45, ROW + 0.2, (t - T("real")) * 3, 0.55, "#ffd23a"); } });
  // 5 With a knighthood.: on the dais, a sword descends to his shoulder, sparkles, SIR
  const t5 = S("With a");
  shot({ at: t5, ...day(), cam: tc([-11.4, 1.0, 12.4], [-13, DAIS + 0.7, 10.9], [-12.0, 0.85, 12.0], [-13, DAIS + 0.7, 10.9], 48, 1.1), cInf: 1.1, focus: A.p(-13, DAIS + 0.6, 10.9), shadowR: 8,
    stage(t, out) { set(out, t); pen(out, -13, 10.9, { ...GEN, pose: "bow", face: "proud" }, 0.95, DAIS); const u = clamp01((t - t5) / 0.6), gl = clamp01((t - T("knighthood")) * 1.5);
      A.fx(out, "sword" + Math.round(gl * 6), (p) => K.drawSword(p.g, gl), -13.2, DAIS + 1.5 - u * 0.45, 10.95, 1.2, 0.2, { cw: 768, ch: 128, kind: "lit", bb: true, rot: 0.5 - u * 0.4 });
      sparkle(out, t, -13, DAIS + 1.0, 11.0, 0.25, 4); wd(out, "SIR!", "#c8a020", -12.6, DAIS + 1.6, 11.0, (t - T("knighthood")) * 3, 0.8); } });
  kick1(T("knighthood"));
  // 6 It starts when Norway's royal guard visits…: tracking alongside the guard marching up the path, Norwegian flag
  const t6 = S("It starts");
  shot({ at: t6, ...day(), cam: lin([21.5, 1.2, 9.0], [-1.4, 0, 0], [25.5, 1.5, 5.0], 50), cInf: 0.7, focus: A.p(22, 1.4, 5.5), shadowR: 25,
    stage(t, out) { set(out, t); const l = t - t6; for (let i = 0; i < 10; i++) walker(out, 120 + i, GUARD(i), 25.5 - l * 1.5 + (i >> 1) * 1.2, 4.6 + (i % 2) * 1.6, t, [-1, 0], { expr: "stern" });
      A.fx(out, "fNOb" + (Math.floor(t * 8) % 8), (p) => K.drawFlagNO(p.g, (Math.floor(t * 8) % 8) / 8), 25.5 - l * 1.5 - 0.6, 3.4, 5.4, 1.6, 0.8, { cw: 768, ch: 384, kind: "lit", bb: true });
      lab(out, "NORWAY", "#c8202e", 24.6 - l * 1.4, 3.0, 6.2, (t - T("Norway's")) * 3, 2.0); } });
  // 7 …a Scottish zoo.: crane up past the stone gate arch: EDINBURGH ZOO, the marching column passes under it
  const t7 = S("a Scottish");
  shot({ at: t7, ...day(), cam: tc([50, 1.2, 12], [40, 3.5, 5.5], [52, 7.5, 13], [38, 3.0, 5.5], 50, 1.4), cInf: 0.6, focus: A.p(41, 4, 5.5), shadowR: 25,
    stage(t, out) { set(out, t); const l = t - t6; for (let i = 0; i < 10; i++) walker(out, 120 + i, GUARD(i), 44 - (t - t7) * 1.5 - (i >> 1) * 1.2, 4.6 + (i % 2) * 1.6, t, [-1, 0], { expr: "stern" });
      wd(out, "ZOO!", "#2a8a3a", 41, 7.4, 6.2, (t - T("zoo")) * 3, 2.2); } });
  kick1(T("zoo"));
  // 8 The soldiers fall in love…: low in front of the enclosure wall, a row of stern guards melts, hearts float
  const t8 = S("The soldiers");
  const love = (t) => t > T("love") - 0.1;
  shot({ at: t8, ...day(), cam: tc([2.2, 1.0, PZ + 3.6], [-0.4, 1.5, ROW], [1.4, 1.1, PZ + 2.8], [-0.4, 1.5, ROW], 48, 1.4), cInf: 1.0, focus: A.p(0, 1.4, ROW), shadowR: 10,
    stage(t, out) { set(out, t); for (let i = 0; i < 5; i++) who(out, 100 + i, GUARD(i), -2.6 + i * 1.1, ROW, { expr: love(t) ? "grin" : "stern", headTilt: love(t) ? Math.sin(t * 4 + i) * 10 : 0 }); if (love(t)) hearts(out, t, -0.4, 1.9, ROW + 0.3, 6, 0.3, 4); } });
  // 9 …with a penguin.: reverse low over the wall: the penguin pops up from behind it, shy wave, hearts
  const t9 = S("with a penguin");
  shot({ at: t9, ...day(), cam: tc([0.5, 1.05, 1.7], [0, 1.0, -0.8], [0.35, 1.0, 1.3], [0, 1.0, -0.8], 46, 0.9), cInf: 1.2, focus: A.p(0, 0.8, -0.8), shadowR: 8,
    stage(t, out) { set(out, t); const u = smooth((t - T("penguin", t9)) * 3); pen(out, 0, -0.8, { pose: "flap", k: t * 2, face: "happy" }, 0.95, 0.12 - 0.5 + u * 1.0); hearts(out, t, 0, 1.6, -0.4, 4, 0.22, 1.2); } });
  kick1(T("penguin", t9));
  // 10 So they adopt him.: top-down on the adoption certificate on the desk, a flipper print stamps it
  const t10 = S("So they");
  shot({ at: t10, ...day(), cam: (l) => ({ pos: A.p(DESK[0], DESK[1] + 1.5 - l * 0.35, DESK[2] + 0.35), look: A.p(DESK[0], DESK[1], DESK[2]), fov: 50, roll: 0.25 - l * 0.4 }), cInf: 1.2, focus: A.p(...DESK), shadowR: 6, near: 0.05,
    stage(t, out) { const n = clamp01((t - T("adopt")) * 2); A.fx(out, "adopt" + Math.round(n * 4), (p) => K.drawAdopt(p.g, n), DESK[0], DESK[1] + 0.01, DESK[2], 0.8, 0.8, { cw: 768, ch: 768, kind: "lit", flat: true }); mk(out, "BOOP!", DESK[0] + 0.2, DESK[1] + 0.25, DESK[2] + 0.2, (t - T("adopt")) * 3, 0.25, "#ffd23a"); } });
  kick1(T("adopt") + 0.2);
  // 11 His name? Nils Olav.: push in on the penguin with a keeper, a name ribbon unrolls
  const t11 = S("His name");
  shot({ at: t11, ...day(), cam: tc([1.3, 0.75, PZ + 2.4], [0, 0.8, PZ], [0.6, 0.7, PZ + 1.6], [0, 0.85, PZ], 46, 2.0), cInf: 1.2, focus: A.p(0, 0.8, PZ), shadowR: 8,
    stage(t, out) { set(out, t); pen(out, 0, PZ, { face: t > T("Nils") ? "happy" : "neutral" }); who(out, 70, KEEPER, -0.9, PZ - 0.5, { expr: "smile", arms: { l: ["low", 1], r: ["point", 1] } }); mk(out, "?", 0.4, 1.3, PZ, (t - T("name")) * 3, 0.3, "#ffd23a");
      lab(out, "NILS OLAV", "#1c3a8a", 0.1, 1.25, PZ + 0.15, (t - T("Nils")) * 3, 0.95); } });
  kick1(T("Nils"));
  // 12 Rank: lance corporal.: a guard kneels and pins a one-chevron armband, camera orbits low
  const t12 = S("Rank lance");
  shot({ at: t12, ...day(), cam: orbit([0, 0, PZ], 1.9, 0.55, 0.55, -0.35, 0.65, 46), cInf: 1.1, focus: A.p(0, 0.7, PZ), shadowR: 8,
    stage(t, out) { set(out, t); const c = t > T("corporal") ? 1 : 0; pen(out, 0.1, PZ, { chev: c, face: c ? "proud" : "neutral", pose: c ? "proud" : "stand" }); who(out, 101, SALUTE(1), -0.75, PZ - 0.35, { expr: "smile", arms: { l: ["out", 0.8], r: ["out", 0.9] } });
      bd(out, "blc", "LANCE CORPORAL", "RANK #1", "#c8202e", 0, 1.32, PZ, (t - T("lance")) * 3, 1.0); } });
  kick1(T("corporal"));
  // 13 Every time the guard comes back…: drone tracking the column marching back through the gate, a calendar flips
  const t13 = S("Every time");
  const YRS = ["1982", "1987", "1993", "2001", "2005", "2008", "2016", "2023"];
  shot({ at: t13, ...day(), cam: lin([41, 2.4, 8.6], [-2.4, -0.2, 0], [35, 1.4, 5.0], 50, [-2.4, 0, 0]), cInf: 0.5, focus: A.p(34, 1.5, 5.5), shadowR: 40,
    stage(t, out) { set(out, t); const l = t - t13; for (let i = 0; i < 12; i++) walker(out, 120 + i, GUARD(i), 36 - l * 2.4 + (i >> 1) * 1.2, 4.6 + (i % 2) * 1.6, t, [-1, 0], { expr: "stern" });
      const m = Math.min(7, Math.floor(l * 5)); lab(out, YRS[m], "#1c3a8a", 35.5 - l * 2.4, 3.0, 6.4, 1, 1.8); } });
  // 14 …he gets promoted.: the penguin gets lifted on the guards' shoulders? no: confetti burst + PROMOTED stamp, low orbit
  const t14 = S("he gets");
  shot({ at: t14, ...day(), cam: orbit([0, 0, PZ], 2.4, 0.9, -0.3, 0.4, 0.9, 48), cInf: 1.0, focus: A.p(0, 0.8, PZ), shadowR: 10,
    stage(t, out) { set(out, t); rank(out, t, ROW, -3.3, 3.3, 1.1, { salute: () => true, expr: () => "grin" }); pen(out, 0, PZ, { pose: "flap", k: t * 2, face: "happy", chev: 1 }); confetti(out, t, 0, 1.6, PZ + 0.3, 3, 3.6);
      wd(out, "PROMOTED!", "#2a8a3a", 0, 1.45, PZ + 0.4, (t - T("promoted")) * 3, 1.3); } });
  kick1(T("promoted"));
  // 15-17 Corporal. Sergeant. Sergeant major.: three snap angles, the armband gains chevrons + crown each word, rank board slams in
  const rk = (t15, word, chev, crown, cam, label) => shot({ at: t15, ...day(), cam, cInf: 1.1, focus: A.p(0, 0.7, PZ), shadowR: 8,
    stage(t, out) { set(out, t); pen(out, 0, PZ, { chev, crown, pose: "proud", face: "proud" }); A.fx(out, "rank" + chev + crown, (p) => K.drawRank(p.g, { n: chev, crown }), 0.55, 1.25, PZ + 0.2, 0.42, 0.42, { cw: 512, ch: 512, kind: "basic", bb: true, rot: Math.sin(t * 6) * 0.1 });
      lab(out, label, "#c8202e", 0, 1.17, PZ + 0.25, (t - T(word, t15)) * 4, 0.72); sparkle(out, t, 0.35, 0.8, PZ + 0.1, 0.15, 3); } });
  const t15 = S("Corporal Sergeant");
  rk(t15, "Corporal", 2, false, tc([0.9, 0.35, PZ + 1.6], [0, 0.85, PZ], [0.7, 0.45, PZ + 1.3], [0, 0.85, PZ], 46, 0.9), "CORPORAL"); kick1(T("Corporal Sergeant"));
  const t16 = S("Sergeant", t15 + 0.3);
  rk(t16, "Sergeant", 3, false, (l) => ({ pos: A.p(0.0, 2.4 - l * 0.5, PZ + 1.2), look: A.p(0, 0.6, PZ), fov: 48, roll: 0.2 - l * 0.3 }), "SERGEANT"); kick1(T("Sergeant", t15 + 0.3));
  const t17 = S("Sergeant major");
  rk(t17, "major", 3, true, orbit([0, 0, PZ], 1.6, 0.6, 0.7, -0.6, 0.75, 46), "SERGEANT MAJOR"); kick1(T("major", t17));
  // 18 He doesn't march.: boots-level, the guards stomp past in perfect step
  const t18 = S("He doesn't");
  shot({ at: t18, ...day(), cam: tc([-2, 0.3, PZ + 2.2], [1, 0.5, PZ], [-1.4, 0.32, PZ + 2.0], [1.4, 0.5, PZ], 46, 0.9), cInf: 1.0, focus: A.p(0, 0.6, PZ), shadowR: 8,
    stage(t, out) { set(out, t); const l = t - t18; for (let i = 0; i < 6; i++) walker(out, 120 + i, GUARD(i), -3.5 + l * 1.4 + i * 1.15, PZ - 0.2, t, [1, 0], { expr: "stern", phase: (t * 1.8) % 1 }); mk(out, "STOMP", 0, 1.0, PZ + 0.3, (t - T("march")) * 3, 0.5, "#ffffff"); } });
  // 19 He waddles.: tracking, the penguin wobbles along at the end of the column, side to side, WADDLE
  const t19 = S("He waddles");
  shot({ at: t19, ...day(), cam: lin([-1.2, 0.5, PZ + 2.0], [0.45, 0, 0], [-1.0, 0.6, PZ], 46), cInf: 1.1, focus: A.p(-1, 0.6, PZ), shadowR: 8,
    stage(t, out) { set(out, t); const l = t - t19; for (let i = 0; i < 3; i++) walker(out, 120 + i, GUARD(i), 0.8 + l * 1.3 + i * 1.15, PZ - 0.3, t, [1, 0], { expr: "stern" }); waddle(out, -1.0 + l * 0.45, PZ, t * 1.6, { face: "happy", chev: 3, crown: true, rot: Math.sin(t * 9) * 0.12 });
      wd(out, "WADDLE!", "#ff8a2a", -0.7 + l * 0.45, 1.35, PZ + 0.2, (t - T("waddles")) * 3, 1.0); } });
  kick1(T("waddles"));
  // 20 Then the King of Norway approves…: top-down on the royal letter on the desk, slow twist
  const t20 = S("Then the");
  shot({ at: t20, ...day(), cam: (l) => ({ pos: A.p(DESK[0], DESK[1] + 1.6 - l * 0.3, DESK[2] + 0.3), look: A.p(DESK[0], DESK[1], DESK[2]), fov: 50, roll: -0.3 + l * 0.3 }), cInf: 1.2, focus: A.p(...DESK), shadowR: 6, near: 0.05,
    stage(t, out) { const st = clamp01((t - T("approves")) * 1.8); A.fx(out, "letter" + Math.round(st * 8), (p) => K.drawLetter(p.g, st), DESK[0], DESK[1] + 0.01, DESK[2], 0.85, 0.85, { cw: 768, ch: 768, kind: "lit", flat: true }); } });
  kick1(T("approves") + 0.15);
  // 21 …a knighthood.: low hero angle up at the sword raised against the sky above the bowing penguin on the dais
  const t21 = S("a knighthood", T("approves"));
  shot({ at: t21, ...day(), cam: tc([-12.2, DAIS + 0.25, 12.2], [-13.1, DAIS + 1.3, 10.9], [-12.5, DAIS + 0.2, 11.8], [-13.1, DAIS + 1.4, 10.9], 50, 1.0), cInf: 1.0, focus: A.p(-13, DAIS + 1, 10.9), shadowR: 8,
    stage(t, out) { set(out, t); pen(out, -13, 10.9, { ...GEN, pose: "bow", face: "proud" }, 0.95, DAIS); who(out, 80, OLDOFF, -13.9, 10.5, { expr: "proud", arms: { l: ["hips", 1], r: ["overhead", 1] } }, DAIS);
      const gl = clamp01((t - t21) * 1.2); A.fx(out, "swordU" + Math.round(gl * 6), (p) => K.drawSword(p.g, gl), -13.6, DAIS + 2.1, 10.6, 1.3, 0.22, { cw: 768, ch: 128, kind: "lit", bb: true, rot: 1.3 }); sparkle(out, t, -13.3, DAIS + 2.6, 10.6, 0.3, 4); } });
  kick1(T("knighthood", t21));
  // 22 "In every way qualified," says the royal citation.: orbit round the officer reading the long scroll to the penguin
  const t22 = S("In every");
  shot({ at: t22, ...day(), cam: orbit([-13.4, 0, 10.8], 3.3, DAIS + 1.2, 0.8, -0.45, DAIS + 1.0, 50), cInf: 1.0, focus: A.p(-13.4, DAIS + 1, 10.8), shadowR: 10,
    stage(t, out) { set(out, t); const u = clamp01((t - t22) / 0.8); pen(out, -12.8, 10.9, { ...GEN, face: "proud", pose: "proud", medal: true }, 0.95, DAIS);
      who(out, 80, OLDOFF, -14.0, 10.7, { expr: "talk_o", arms: { l: ["hold", 1], r: ["hold", 1] } }, DAIS);
      A.fx(out, "scroll" + Math.round(u * 8), (p) => K.drawScroll(p.g, u), -13.95, DAIS + 1.05 - u * 0.2, 10.95, 0.55, 0.82, { cw: 512, ch: 768, kind: "lit", bb: true });
      crowd(out, t, 6, 14.5, -17); } });
  kick1(T("qualified"));
  // 23 Rows of soldiers stand at attention…: drone glides along the rank at chest height, the rows recede
  const t23 = S("Rows of");
  shot({ at: t23, ...day(), cam: lin([-7, 2.2, 7.6], [2.0, 0.2, 0], [-2, 1.4, ROW], 50, [2.0, 0, 0]), cInf: 0.7, focus: A.p(-2, 1.4, ROW), shadowR: 20,
    stage(t, out) { set(out, t); rank(out, t, ROW, -12.1, 12.1, 1.1, {}); lab(out, "ATTENTION!", "#1c3a8a", -2 + (t - t23) * 2.0, 2.65, ROW + 0.4, (t - T("attention")) * 3, 1.6); } });
  // 24 …while a penguin inspects them.: low behind the penguin walking the line; he stops, stares up at one guard, the guard sweats
  const t24 = S("while a");
  const insX = (t) => -2.2 + Math.min(1.0, (t - t24) * 0.8) * 2.0;
  shot({ at: t24, ...day(), cam: (l) => ({ pos: A.p(insX(t24 + l) + 1.6, 0.55, ROW + 2.3), look: A.p(insX(t24 + l) - 0.2, 1.1, ROW), fov: 48, roll: 0 }), cInf: 1.0, focus: A.p(0, 1.1, ROW), shadowR: 10,
    stage(t, out) { set(out, t); const x = insX(t), stop = t > T("inspects") + 0.3; rank(out, t, ROW, -4.4, 3.3, 1.1, { expr: (gx) => (Math.abs(gx - x) < 0.7 ? "worried" : "stern") });
      if (stop) pen(out, x, ROW + 0.85, { ...GEN, face: "stern", pose: "proud" }); else waddle(out, x, ROW + 0.85, t, { ...GEN, face: "stern", left: false });
      if (stop) { sweat(out, t, x + 0.1, 1.95, ROW + 0.1); mk(out, "!", x + 0.3, 2.45, ROW + 0.1, (t - T("inspects") - 0.3) * 3, 0.3, "#ffd23a"); } } });
  kick1(T("inspects"));
  // 25 Brigadier. Major general.: crane down the flagpole to the penguin, star boards slam in one then two
  const t25 = S("Brigadier");
  shot({ at: t25, ...day(), cam: tc([-1.4, 3.4, PZ + 3.4], [0, 1.6, PZ], [-0.9, 0.7, PZ + 2.2], [0, 0.95, PZ], 48, 1.6), cInf: 1.0, focus: A.p(0, 0.8, PZ), shadowR: 10,
    stage(t, out) { set(out, t); const two2 = t > T("Major general") - 0.05; rank(out, t, ROW, -3.3, 3.3, 1.1, { salute: () => true }); pen(out, 0, PZ, { stars: two2 ? 2 : 1, medals: 2, sash: true, pose: "proud", face: "proud" });
      A.fx(out, "rankS" + (two2 ? 2 : 1), (p) => K.drawRank(p.g, { stars: two2 ? 2 : 1 }), 0.6, 1.3, PZ + 0.2, 0.5, 0.5, { cw: 512, ch: 512, kind: "basic", bb: true, rot: Math.sin(t * 6) * 0.1 });
      lab(out, two2 ? "MAJOR GENERAL" : "BRIGADIER", "#c8202e", -0.1, 1.42, PZ + 0.25, (t - (two2 ? T("Major general") : T("Brigadier"))) * 4, 1.1); if (two2) bd(out, "b3rd", "3RD", "HIGHEST RANK", "#1c3a8a", 0, 2.1, PZ - 0.2, (t - T("general", T("Major general"))) * 3, 1.3); } });
  kick1(T("Brigadier")); kick1(T("Major general"));
  // 26 Now he outranks the man he was named after.: an old officer salutes the little penguin, the penguin returns it smugly, orbit
  const t26 = S("Now he");
  shot({ at: t26, ...day(), cam: orbit([0.35, 0, PZ], 3.1, 1.0, -0.4, 0.4, 1.0, 50), cInf: 1.0, focus: A.p(0.3, 1.0, PZ), shadowR: 10,
    stage(t, out) { set(out, t); const sal = t > T("outranks", t26); who(out, 80, OLDOFF, 0.9, PZ - 0.1, { expr: sal ? "worried" : "neutral", arms: sal ? { l: ["low", 1], r: ["head", 1] } : { l: ["low", 1], r: ["low", 1] } });
      pen(out, -0.2, PZ + 0.1, { ...GEN, pose: sal ? "salute" : "proud", face: "proud" }); if (sal) sweat(out, t, 1.0, 2.0, PZ);
      wd(out, "OUTRANKED!", "#c8202e", 0.4, 2.45, PZ + 0.2, (t - T("named")) * 3, 1.4); } });
  kick1(T("outranks", t26));
  // 27 But wait… it gets weirder.: stinger: night at the enclosure, fast push in on the penguin's face, eyes shrink
  const t27 = S("But wait");
  shot({ at: t27, ...nite(), cam: tc([0.4, 0.9, PZ + 3.0], [0, 0.82, PZ], [0.1, 0.84, PZ + 0.8], [0, 0.82, PZ], 44, 1.6), cInf: 1.2, focus: A.p(0, 0.8, PZ), shadowR: 8,
    stage(t, out) { set(out, t); pen(out, 0, PZ, { ...GEN, face: t > T("weirder") ? "shock" : "stern" }); wd(out, "WEIRDER!", "#8a3ac8", 0, 1.3, PZ + 0.2, (t - T("weirder")) * 3, 0.9); } });
  kick1(T("weirder"));
  // 28 The first Nils died years ago.: golden hour, crane down to Nils I's framed portrait with a wreath on a stand by the pool wall, a ghostly penguin floats up
  const t28 = S("The first");
  shot({ at: t28, ...gold(), cam: tc([-3.0, 2.4, 4.4], [-4, 0.95, 0.9], [-3.4, 1.2, 3.4], [-4, 1.0, 0.9], 48, 1.8), cInf: 1.0, focus: A.p(-4, 1, 0.9), shadowR: 10,
    stage(t, out) { set(out, t); A.fx(out, "portrait", (p) => K.drawPortrait(p.g), -4, 1.05, 0.9, 0.7, 0.875, { cw: 512, ch: 640, kind: "lit", bb: true });
      A.fx(out, "easel", (p) => { const g = p.g; g.clearRect(0, 0, 256, 512); K.line(g, [[128, 40], [40, 500]], "#6a4a2a", 22); K.line(g, [[128, 40], [216, 500]], "#6a4a2a", 22); }, -4, 0.55, 0.85, 0.5, 1.0, { cw: 256, ch: 512, kind: "lit", bb: true });
      const u = clamp01((t - T("died")) / 1.2); if (u > 0) pen(out, -3.4, 0.6, { ghost: true, face: "happy", pose: "flap", k: t }, 0.6, 1.0 + u * 1.0); mk(out, "1972–1987", -4, 1.65, 0.95, (t - T("ago")) * 3, 0.6, "#ffffff"); } });
  // 29 A lookalike took his place…: two identical penguins side by side, a guard compares them with an old photo, ? ?
  const t29 = S("A lookalike");
  shot({ at: t29, ...day(), cam: tc([1.6, 1.25, PZ + 2.6], [0, 0.9, PZ], [0.9, 1.1, PZ + 2.0], [0, 0.9, PZ], 48, 1.3), cInf: 1.0, focus: A.p(0, 0.9, PZ), shadowR: 8,
    stage(t, out) { set(out, t); pen(out, -0.35, PZ, { face: "neutral" }); pen(out, 0.35, PZ, { face: "wink" }); who(out, 101, SALUTE(1), 1.2, PZ - 0.4, { expr: "worried", arms: { l: ["low", 1], r: ["hold", 1] }, extra: XL.hold(K.drawPhoto, 384, 320, "r", 1.3), headTilt: Math.sin(t * 3) * 10 });
      mk(out, "?", -0.35, 1.2, PZ + 0.05, (t - T("lookalike")) * 3, 0.3, "#ffd23a"); mk(out, "?", 0.35, 1.25, PZ + 0.05, (t - T("lookalike") - 0.2) * 3, 0.3, "#ffd23a"); } });
  kick1(T("lookalike"));
  // 30 …and kept getting promoted.: whip orbit, chevrons and stars rain onto the new one, confetti
  const t30 = S("and kept");
  shot({ at: t30, ...day(), cam: orbit([0, 0, PZ], 2.0, 0.7, 0.6, -0.7, 0.8, 48), cInf: 1.0, focus: A.p(0, 0.8, PZ), shadowR: 8,
    stage(t, out) { set(out, t); const l = t - t30, n = Math.min(3, Math.floor(l * 3)); pen(out, 0, PZ, { chev: Math.min(3, n), crown: n >= 3, stars: l > 1.2 ? 2 : 0, pose: "flap", k: t * 2, face: "happy" }); confetti(out, t, 0, 1.5, PZ + 0.3, 2.6, 3.2);
      for (let i = 0; i < 4; i++) { const ph = (l * 1.2 + i / 4) % 1; A.fx(out, "rkF" + (i % 3), (p) => K.drawRank(p.g, { n: (i % 3) + 1 }), (hh(i, 2) - 0.5) * 1.6, 2.2 - ph * 1.8, PZ + 0.2, 0.25, 0.25, { cw: 512, ch: 512, kind: "basic", bb: true, rot: ph * 4 + i }); }
      wd(out, "PROMOTED!", "#2a8a3a", 0, 1.5, PZ + 0.4, (t - T("promoted", t30)) * 3, 1.2); } });
  kick1(T("promoted", t30));
  // 31 Today it's Nils the Third.: low orbit, a III badge flips up on a name ribbon
  const t31 = S("Today it's");
  shot({ at: t31, ...day(), cam: orbit([0, 0, PZ], 1.8, 0.35, -0.5, 0.5, 0.8, 46), cInf: 1.1, focus: A.p(0, 0.8, PZ), shadowR: 8,
    stage(t, out) { set(out, t); rank(out, t, ROW, -2.2, 2.2, 1.1, { salute: () => true }); pen(out, 0, PZ, { ...GEN, pose: "proud", face: "proud" }); lab(out, "NILS OLAV III", "#1c3a8a", 0, 1.3, PZ + 0.15, (t - T("Third")) * 3, 1.1); mk(out, "III", 0.55, 1.7, PZ + 0.1, (t - T("Third")) * 3, 0.35, "#ffd23a"); } });
  kick1(T("Third"));
  // 32 He even has a bronze statue.: crane up the bronze statue on its plinth, the real penguin beside it copies the pose
  const t32 = S("He even");
  shot({ at: t32, ...day(), cam: tc([8.6, 0.6, 4.4], [7, 1.5, 1.2], [8.4, 2.3, 5.0], [7, 1.4, 1.2], 48, 1.8), cInf: 1.0, focus: A.p(7, 1.5, 1.2), shadowR: 10,
    stage(t, out) { set(out, t); pen(out, 7.9, 2.3, { ...GEN, pose: "proud", face: t > T("statue") ? "proud" : "neutral" }); sparkle(out, t, 7, 1.9, 1.3, 0.3, 4); flashes(out, t, [[5.2, 1.6, 4.0], [9.2, 1.7, 4.2]], 2.2); crowd(out, t, 4, 5.0, 4.6);
      lab(out, "BRONZE", "#b8782a", 7, 2.75, 1.4, (t - T("bronze")) * 3, 1.0); } });
  kick1(T("statue"));
  // 33 And he just became a dad.: macro at the nest by the rocks: the egg wobbles, the penguin beams, hearts
  const t33 = S("And he just");
  shot({ at: t33, ...day(), cam: tc([-7.0, 0.5, -0.9], [-8.3, 0.4, -3.4], [-7.3, 0.45, -1.4], [-8.3, 0.4, -3.4], 46, 1.6), cInf: 1.2, focus: A.p(-8.3, 0.4, -3.4), shadowR: 8,
    stage(t, out) { const k = (t * 2) % 1; A.fx(out, "egg" + Math.round(k * 8), (p) => K.drawEgg(p.g, { k }), -8.15, 0.12 + 0.16, -3.2, 0.22, 0.28, { cw: 256, ch: 320, kind: "lit", bb: true });
      pen(out, -8.7, -3.8, { ...GEN, face: t > T("dad") ? "love" : "happy" }, 0.95, 0.12); hearts(out, t, -8.4, 0.7, -3.3, 4, 0.18, 0.8); mk(out, "DAD!", -8.3, 1.35, -3.3, (t - T("dad")) * 3, 0.45, "#ff4a6a"); } });
  kick1(T("dad"));
  // 34 So somebody… start the paperwork.: top-down on the desk, promotion forms pile up, URGENT stamp
  const t34 = S("So somebody");
  shot({ at: t34, ...day(), cam: (l) => ({ pos: A.p(DESK[0], DESK[1] + 1.8 - l * 0.45, DESK[2] + 0.3), look: A.p(DESK[0], DESK[1], DESK[2]), fov: 50, roll: 0.4 - l * 0.35 }), cInf: 1.2, focus: A.p(...DESK), shadowR: 6, near: 0.05,
    stage(t, out) { const n = 1 + Math.floor(clamp01((t - T("start")) * 1.2) * 8), st = clamp01((t - T("paperwork") - 0.3) * 2);
      A.fx(out, "papers" + n + "_" + Math.round(st * 6), (p) => K.drawPapers(p.g, n, st), DESK[0], DESK[1] + 0.01, DESK[2], 0.9, 0.9, { cw: 768, ch: 768, kind: "lit", flat: true });
      A.fx(out, "eggD" + (Math.floor(t * 8) % 8), (p) => K.drawEgg(p.g, { k: (Math.floor(t * 8) % 8) / 8, chev: true }), DESK[0] - 0.42, DESK[1] + 0.01, DESK[2] + 0.1, 0.16, 0.2, { cw: 256, ch: 320, kind: "lit", flat: true, rot: 0.3 }); } });
  kick1(T("paperwork") + 0.3);
  // 35 Because in this army…: loop: back to the ground-level tracking of shot 1
  const tL = S("Because in");
  shot({ at: tL, ...day(), cam: (l) => heroCam(l - (END - tL)), cInf: 0.8, focus: A.p(-0.6, 0.6, PZ), shadowR: 14, stage(t, out) { heroStage(t - END, t, out); } });
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
  CAM = c; if (s.stage) s.stage(t, out, c);
  out.places = out.places.filter((pl) => Math.hypot(pl.x - c.pos[0], pl.z - c.pos[2]) > 0.6 || pl.keep);
  return {
    f, t, shot: s.id, light: s.light, grade: s.grade, cam: c, focus: s.focus, cInf: s.cInf ?? 0, props: out.props, veh: out.veh,
    sunK: s.sunK, sunAz: s.sunAz, sunEl: s.sunEl, fwd: s.fwd, fogNear: s.fogNear, fogFar: s.fogFar, shadowR: s.shadowR, near: s.near,
    places: out.places, fx: out.fx, flash: s.flash ? s.flash(t) : 0, fade: 0,
  };
}
