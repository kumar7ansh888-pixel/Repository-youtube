// Shot plan for "They Let the Internet Name a Ship" (vertical 1080x1920), timed to voice/words.json. Captions are burned later.
// Facts: in 2016 NERC asked the public to name its new £200m polar research ship; "Boaty McBoatface", suggested as a joke by a former BBC radio
// presenter (who apologised), won with 124,109 votes, more than three times second place (Poppy-Mai, 34,371); other entries included "It's bloody
// cold here" and "I Like Big Boats & I Cannot Lie". The science minister wanted a more "suitable" name: RRS Sir David Attenborough. The name went
// to an autonomous yellow submarine (Autosub Long Range), whose 2017 Antarctic mission (Orkney Passage, up to 4,000 m) led to a 2019 PNAS finding
// on how stronger winds warm the deep ocean. In 2017 a Swedish rail operator named a train Trainy McTrainface after a public vote.
// (ITV, Global News/AP, IBTimes UK, NPR 2016 + 2019, Smithsonian 2017, CNBC / TIME 2017). Hook-first, cut every ~1.5-2 s, loop ending.
import * as K from "./draw_boaty.js";
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


const SCI = (v) => ({ jacket: "#f4f4f6", pants: v ? "#5a3a5a" : "#3a4a6a", ...(v ? { dress: "#f4f4f6" } : {}), boots: INK, hat: "hair", hair: v ? "#2a1a10" : "#8a5a32", skin: v ? "#c99067" : "#f2d2b6", build: "adult" });
const PRES = { jacket: "#3a7ac8", pants: "#2a2a36", boots: INK, hat: "hair", hair: "#2a1a10", skin: "#ecd0b6", build: "adult" };
const MIN = { jacket: "#2a2a34", pants: "#26262c", boots: INK, hat: "hair", hair: "#b89a6a", skin: "#f2d2b6", build: "adult" };
const CAPT = { jacket: "#1c2c5a", pants: "#1c2c5a", boots: INK, hat: "cap", cap: "#1c2c5a", hair: "#e4e4e8", moustache: "#e4e4e8", skin: "#f0cfb0", build: "stout" };
const FAN = (v) => ({ jacket: ["#c8503a", "#6a9a4a", "#e8b83a", "#8a5ab0", "#3a7ac8"][v % 5], pants: ["#3a3a48", "#5a4a3a"][v % 2], boots: INK, hat: "hair", hair: ["#c89a4a", "#2a201a", "#8a5a32", "#3a2a1a", "#e8d08a"][v % 5], skin: ["#f2d2b6", "#e8b894", "#ecd0b6", "#c99067", "#f4d6bc"][v % 5], build: "adult" });
const IMG = {};
const img = (key, w, h, f) => IMG[key] || (IMG[key] = oc(w, h, f));
const rhand = (key, w, h, f, dx, dy, dw, dh, rot = 0) => (p) => { const H = p.hands; if (!H || !H.r) return; const g = p.g; g.save(); g.translate(H.r[0], H.r[1]); g.rotate(rot); g.drawImage(img(key, w, h, f), dx, dy, dw, dh); g.restore(); };
const XL = {
  phone: rhand("phone", 256, 384, (g) => K.drawPhone(g, 0), -45, -120, 90, 135),
  phone2: rhand("phone2", 256, 384, (g) => K.drawPhone(g, 0.7), -45, -120, 90, 135),
  paper: rhand("paper", 256, 320, (g) => { g.clearRect(0, 0, 256, 320); K.R(g, 20, 20, 216, 280, 8, "#ffffff", 8); K.txt(g, "SORRY!", 128, 90, 54, "Bangers", "#c8202a", INK, 0, 200); for (let i = 0; i < 5; i++) K.line(g, [[50, 150 + i * 28], [206, 150 + i * 28]], "#9aa0b0", 5); }, -60, -130, 110, 140),
};

function buildShots() {
  const T = (p, a) => P(p, a);
  const S = (p, a) => P(p, a) - 0.1;
  const D = [];
  const shot = (o) => D.push(o);
  const END = TOTAL / FPS;
  const last = () => D[D.length - 1];
  const kick1 = (t) => { last().kicks = [...(last().kicks || []), t]; };
  const SETS = ["dock", "lab", "studio", "net", "gov", "deep", "station", "drama"];
  const base = (k) => [3200 + SETS.indexOf(k) * 200, 2000, 0];
  const at = (k) => { const B = base(k), Af = (x, y, z) => [B[0] + x, B[1] + y, B[2] + z];
    return { k, p: Af,
      fx: (out, key, draw, x, y, z, w, h, o = {}) => { const [X, Y, Z] = Af(x, y, z); fxCard(out, key, draw, X, Y, Z, w, h, o); },
      ppl: (out, i, o, x, z, opt = {}, y = 0) => { const [X, Y, Z] = Af(x, y, z); out.places.push(pl(i, o, X, Y, Z, opt)); } }; };
  const H = Object.fromEntries(SETS.map((k) => [k, at(k)]));
  const lights = { day: { light: "day", sunAz: 200, sunEl: 50, fogFar: 4000 }, night: { light: "night", sunAz: 20, sunEl: 30, fogFar: 4000 }, golden: { light: "golden", sunAz: 160, sunEl: 35, fogFar: 4000 } };
  const LT = { dock: "day", lab: "day", studio: "golden", net: "night", gov: "day", deep: "night", station: "day", drama: "night" };
  const room = (h, out, t, wallZ = -5) => { const anim = ["dock", "studio", "net", "deep", "station", "drama"].includes(h.k) ? Math.floor(t * 10) % 40 : 0;
    h.fx(out, "wall_" + h.k + anim, (p) => K.drawWall(p.g, h.k, anim / 10), 0, 7, wallZ, 14, 14, { cw: 1024, ch: 1024, kind: "basic", normal: [0, 0, 1] });
    h.fx(out, "floor_" + h.k, (p) => K.drawFloor(p.g, K.FLOOR[h.k], h.k), 0, 0, wallZ + 9, 30, 18, { cw: 512, ch: 512, kind: "basic", flat: true });
    if (h.k === "dock") h.fx(out, "water" + (Math.floor(t * 8) % 16), (p) => K.drawWater(p.g, (Math.floor(t * 8) % 16) / 8), 0, 0.05, -3.0, 30, 4, { cw: 512, ch: 512, kind: "basic", flat: true }); };
  const S1 = (o) => ({ ...lights[LT[o.set]], ...o });
  const mk = (h, out, s, x, y, z, u, size = 0.4, col) => { if (u <= 0) return; const k = smooth(u * 4); h.fx(out, "mark" + s + (col || ""), (p) => DR.mark(p, s, col), x, y, z, size * k, size * k, { cw: 256, ch: 256, kind: "basic" }); };
  const wd = (h, out, s, col, x, y, z, u, w = 1.0) => { if (u <= 0 || u > 1.6) return; const k = Math.round(Math.min(1, u) * 6); h.fx(out, "word" + s + k, (p) => DR.word(p, s, col, k / 6), x, y, z, w, w / 2, { cw: 512, ch: 256, kind: "basic" }); };
  const bd = (h, out, key, n, label, col, x, y, z, u, w = 1.6) => { if (u <= 0) return; const k = Math.round(smooth(u * 3) * 8) / 8; h.fx(out, key + k, (p) => DR.numBoard(p, n, label, col), x, y + (1 - k) * 0.15, z, w * (0.6 + 0.4 * k), w * 0.5 * (0.6 + 0.4 * k), { cw: 1024, ch: 512, kind: "basic" }); };
  const bub = (h, out, key, s, col, x, y, z, u, w = 1.0) => { if (u <= 0) return; const k = Math.round(smooth(u * 4) * 8) / 8; h.fx(out, key + s + k, (p) => drawBubble(p.g, s, col), x, y, z, w * k, w * 0.5 * k, { cw: 768, ch: 384, kind: "basic" }); };
  const sparkle = (h, out, t, x, y, z, s = 0.25, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 2.2 + i / n) % 1, k = Math.sin(ph * Math.PI); if (k > 0.05) h.fx(out, "spark", (p) => DR.spark(p), x + Math.cos(i * 2.1) * s * 1.6, y + Math.sin(i * 2.7) * s * 1.2, z + 0.05, s * k, s * k, { cw: 256, ch: 256, kind: "basic", rot: t * 2 }); } };
  const sweat = (h, out, t, x, y, z, n = 3) => { for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1; h.fx(out, "sweat", (p) => DR.sweat(p), x + (i - 1) * 0.16 + ph * 0.05 * (i - 1), y - ph * 0.25, z, 0.08, 0.08, { cw: 128, ch: 128, kind: "basic" }); } };
  const flashes = (h, out, t, pts, rate = 3) => { pts.forEach(([x, y, z], i) => { const ph = (t * rate + hh(i, 9)) % 1; if (ph < 0.18) { const k = 1 - ph / 0.18; h.fx(out, "flash", (p) => K.drawFlash(p.g), x, y, z, 0.7 * k, 0.7 * k, { cw: 256, ch: 256, kind: "basic" }); } }); };
  const cam = (h, p0, l0, p1, l1, fov = 46, dur = 1.8) => push(h.p(...p0), h.p(...l0), h.p(...p1), h.p(...l1), fov, dur);

  const who = (h, out, id, o, x, z, opt = {}, y = 0) => h.ppl(out, id, { ...o, xk: opt.xk || "" }, x, z, { keep: true, expr: opt.expr ?? "neutral", arms: opt.arms ?? { l: ["hips", 1], r: ["hips", 1] }, headTilt: opt.headTilt ?? 0, extra: opt.extra, view: opt.view, dir: opt.dir, mode: opt.mode ?? "stand", phase: opt.phase, scale: opt.s ?? 1 }, y);
  const { dock: DK, lab: LB, studio: SD, net: NT, gov: GV, deep: DP, station: SN, drama: DM } = H;
  const ship = (out, t, name = "", o = {}, x = 0) => DK.fx(out, "ship_" + name + (o.ice ? "i" : "") + (o.face ? "f" : ""), (p) => K.drawShip(p.g, name, o), x, 1.45 + Math.sin(t * 1.4) * 0.03, -3.4, 6.4, 3.2, { cw: 1024, ch: 512, kind: "lit", rot: Math.sin(t * 1.1) * 0.006 });
  const board = (h, out, s, x, y, z, w = 2.6, rot = 0, col) => h.fx(out, "board" + s + (col || ""), (p) => K.drawBoard(p.g, s, col), x, y, z, w, w / 2, { cw: 1024, ch: 512, kind: "lit", rot });
  const cash = (h, out, t, x, y, z, n = 6, w = 0.32) => { for (let i = 0; i < n; i++) { const ph = (t * 0.9 + i / n) % 1; h.fx(out, "cash", (p) => K.drawCash(p.g), x + (hh(i, 1) - 0.5) * 2.6 + Math.sin(ph * 8 + i) * 0.15, y + 1.4 - ph * 2.2, z + i * 0.02, w, w / 2, { cw: 256, ch: 128, kind: "lit", rot: Math.sin(t * 5 + i) * 0.6 }); } };
  const plus = (h, out, t, x, y, z, n = 5, s = "+1", rise = 1.2) => { for (let i = 0; i < n; i++) { const ph = (t * 1.3 + i / n) % 1; h.fx(out, "mark" + s, (p) => DR.mark(p, s, "#7ad04a"), x + (hh(i, 3) - 0.5) * 2.4, y + ph * rise, z, 0.28 * Math.sin(ph * Math.PI) + 0.05, 0.28 * Math.sin(ph * Math.PI) + 0.05, { cw: 256, ch: 256, kind: "basic" }); } };
  const screens = (out, t, z = -2.2, y = 1.9, w = 4.4) => { const k = Math.floor(t * 6) % 24; NT.fx(out, "scr" + k, (p) => K.drawScreens(p.g, k / 6), 0, y, z, w, w / 2, { cw: 1024, ch: 512, kind: "basic" }); };
  const onair = (out, t, y = 2.15) => { const on = (t * 1.5) % 1 < 0.7; SD.fx(out, "onair" + on, (p) => K.drawOnAir(p.g, on), 0, y, -1.6, 1.1, 0.55, { cw: 512, ch: 256, kind: "basic" }); };
  const sdesk = (out) => SD.fx(out, "sdesk", (p) => K.drawDesk(p.g), 0, 0.5, 0.4, 2.0, 1.0, { cw: 1024, ch: 512, kind: "lit" });
  const poster = (out, x = 0.5, y = 1.75, z = -1.4, w = 1.3) => LB.fx(out, "poster", (p) => K.drawPoster(p.g), x, y, z, w, w * 2 / 3, { cw: 768, ch: 512, kind: "lit" });
  const sub = (h, out, t, x, y, z, w = 1.8, o = {}) => { const pr = Math.floor(t * 20) % 6, bl = Math.floor(t * 2) % 2, ey = o.eyes ?? true; h.fx(out, "sub" + pr + bl + ey + (o.light ? "L" : "") + (o.look ?? 0), (p) => K.drawSub(p.g, { prop: pr, blink: bl, eyes: ey, light: o.light, look: o.look }), x, y, z, w, w * 0.375, { cw: 1024, ch: 384, kind: "lit", rot: o.rot ?? 0 }); };
  const bubbles = (h, out, t, x, y, z, w = 0.8) => { const k = Math.floor(t * 12) % 48; h.fx(out, "bub" + k, (p) => K.drawBubbles(p.g, k / 12), x, y, z, w, w * 2, { cw: 256, ch: 512, kind: "basic" }); };
  const train = (out, t, x, name = "", o = {}) => SN.fx(out, "train" + name + (o.face ? "f" : ""), (p) => K.drawTrain(p.g, name, o), x, 1.05, -2.2, 5.6, 2.1, { cw: 1024, ch: 384, kind: "lit" });

  // ---- hero (shot 1 + loop): at the dock a crane swings a giant BOATY McBOATFACE board onto the red polar ship, the captain gasps, +1 votes pop
  const heroCam = cam(DK, [0.3, 1.45, 4.3], [0, 1.4, -2], [0.12, 1.42, 3.7], [0, 1.4, -2], 50, 2.4);
  const heroStage = (t, out) => { room(DK, out, t); ship(out, t);
    board(DK, out, "BOATY McBOATFACE", 0.05 + Math.sin(t * 2.6) * 0.06, 1.55 + Math.sin(t * 1.3) * 0.05, -0.9, 2.0, Math.sin(t * 2.6) * 0.06);
    who(DK, out, 1, CAPT, -0.3, 2.4, { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] }, headTilt: Math.sin(t * 7) * 5 }, -0.6);
    plus(DK, out, t, 0.3, 0.55, 0.6, 4, "+1", 0.55); };
  // 1 They let the internet name a ship.
  shot({ a: 0, ...S1({ set: "dock" }), cam: heroCam, cInf: 0.9, focus: DK.p(0, 1.5, 0), shadowR: 8, stage(t, out) { heroStage(t, out); } });
  kick1(0.25); kick1(T("ship"));
  // 2 Big mistake.: a scientist facepalms, OOPS!
  const tMi = T("mistake");
  shot({ at: S("Big mistake"), ...S1({ set: "lab" }), cam: cam(LB, [0, 1.45, 2.0], [0, 1.45, 0], [0, 1.45, 1.7], [0, 1.45, 0], 44, 1.0), cInf: 1.6, focus: LB.p(0, 1.45, 0), shadowR: 6,
    stage(t, out) { room(LB, out, t); poster(out, 0.55, 1.95, -1.4, 1.1); who(LB, out, 2, SCI(0), 0, 0, { expr: "pained", arms: { l: ["hips", 1], r: ["face", 1] } }); wd(LB, out, "OOPS!", "#c8202a", -0.12, 1.85, 0.3, (t - tMi) * 3, 0.7); } });
  kick1(tMi);
  // 3 A brand-new polar research ship…: the ship glides in, sparkle
  const t3 = S("A brandnew");
  shot({ at: t3, ...S1({ set: "dock" }), cam: cam(DK, [-0.6, 1.6, 8.5], [0, 1.4, -3], [0.2, 1.5, 7.6], [0, 1.4, -3], 50, 2.2), cInf: 0.7, focus: DK.p(0, 1.4, -3), shadowR: 10,
    stage(t, out) { room(DK, out, t); const u = smooth((t - t3) / 1.6); ship(out, t, "", { ice: true }, lerp(3.5, 0, u)); sparkle(DK, out, t, 1.8, 2.4, -3.2, 0.35, 3); mk(DK, out, "NEW!", -1.3, 2.4, -2.0, (t - T("polar")) * 3, 1.3, "#ffd23a"); } });
  kick1(T("polar"));
  // 4 …two hundred million pounds.: price board, cash rain, the captain proud
  const t200 = T("two hundred");
  shot({ at: t200 - 0.15, ...S1({ set: "dock" }), cam: cam(DK, [0.1, 1.5, 4.6], [0, 1.6, -1], [0.05, 1.5, 4.1], [0, 1.6, -1], 48, 1.6), cInf: 1.0, focus: DK.p(0, 1.5, 0), shadowR: 8,
    stage(t, out) { room(DK, out, t); ship(out, t); who(DK, out, 1, CAPT, 0.55, 1.2, { expr: "proud", arms: { l: ["hips", 1], r: ["up", 1] } }); bd(DK, out, "b200", "£200M", "MILLION POUNDS", "#2f7a48", -0.35, 2.1, 1.0, (t - t200) * 3, 1.3); cash(DK, out, t, 0, 1.6, 1.4, 7); } });
  kick1(T("pounds"));
  // 5 The scientists ask the public for a name.: poster NAME OUR SHIP!, two scientists point
  const t5 = S("The scientists"), tPu = T("public");
  shot({ at: t5, ...S1({ set: "lab" }), cam: cam(LB, [0.1, 1.5, 3.4], [0, 1.45, 0], [0.05, 1.5, 2.9], [0, 1.45, 0], 48, 2.4), cInf: 1.0, focus: LB.p(0, 1.4, 0), shadowR: 6,
    stage(t, out) { room(LB, out, t); poster(out, 0, 1.95, -1.2, 1.5); who(LB, out, 2, SCI(0), -0.55, 0.3, { expr: "smile", arms: { l: ["hips", 1], r: ["point", 1] }, dir: [1, 0] }); who(LB, out, 3, SCI(1), 0.55, 0.3, { expr: t > tPu ? "talk_o" : "smile", arms: { l: ["point", 1], r: ["up", 0.7 + 0.3 * Math.sin(t * 8)] } });
      mk(LB, out, "?", 0.95, 2.2, 0.3, (t - T("name", t5)) * 4, 0.45, "#ffd23a"); } });
  kick1(tPu);
  // 6 A radio presenter suggests one… as a joke.: radio studio, ON AIR, he smirks
  const t6 = S("A radio"), tJo = T("joke");
  shot({ at: t6, ...S1({ set: "studio" }), cam: cam(SD, [0.2, 1.4, 3.0], [0, 1.35, 0], [0.1, 1.4, 2.5], [0, 1.35, 0], 46, 2.6), cInf: 1.1, focus: SD.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(SD, out, t); onair(out, t); who(SD, out, 4, PRES, 0, -0.1, { expr: t > tJo ? "sly" : (Math.floor(t * 6) % 2 ? "talk_o" : "talk_e"), arms: { l: ["hips", 1], r: [t > tJo ? "point" : "out", 1] }, headTilt: Math.sin(t * 5) * 5 }); sdesk(out);
      mk(SD, out, "LOL", 0.55, 1.95, 0.5, (t - tJo) * 4, 0.5, "#ffd23a"); } });
  kick1(tJo);
  // 7 Boaty McBoatface.: the name board slams in over flashing screens, confetti
  const t7 = S("Boaty McBoatface");
  shot({ at: t7, ...S1({ set: "net" }), cam: cam(NT, [0, 1.6, 3.9], [0, 1.6, 0], [0, 1.6, 3.5], [0, 1.6, 0], 48, 1.4), cInf: 1.0, focus: NT.p(0, 1.6, 0), shadowR: 6,
    stage(t, out) { room(NT, out, t); screens(out, t, -2.4, 1.9, 5.0); const u = clamp01((t - t7) / 0.35), k = Math.round(smooth(u) * 10) / 10; board(NT, out, "BOATY McBOATFACE", 0, 1.5 + (1 - k) * 2, 0.2, 1.8 * (0.7 + 0.3 * k), (1 - k) * 0.3);
      sparkle(NT, out, t, 0, 1.3, 0.4, 0.3, 4); if (t > t7 + 0.3) NT.fx(out, "conf" + Math.floor(t * 15) % 60, (p) => DR.confetti(p, Math.floor(t * 15) % 60), 0, 1.6, 0.8, 2.6, 3.2, { cw: 512, ch: 640, kind: "basic" }); } });
  kick1(t7 + 0.35);
  // 8 The internet loses its mind.: fans jump with phones, screens go wild
  const t8 = S("The internet loses"), tMd = T("mind");
  shot({ at: t8, ...S1({ set: "net" }), cam: cam(NT, [0.2, 1.4, 3.6], [0, 1.3, 0], [0.1, 1.4, 3.1], [0, 1.3, 0], 50, 2.0), cInf: 1.0, focus: NT.p(0, 1.2, 0), shadowR: 6,
    stage(t, out) { room(NT, out, t); screens(out, t, -2.4, 1.9, 5.0); [[-0.75, 0, 0], [0, -0.3, 1], [0.75, 0, 2]].forEach(([x, z, v]) => who(NT, out, 10 + v, FAN(v), x, z, { xk: "ph" + (v % 2), expr: v === 1 ? "laugh" : Math.floor(t * 5 + v) % 2 ? "laugh" : "grin", arms: { l: ["up", 1], r: ["up", 0.6 + 0.4 * Math.sin(t * 10 + v)] }, extra: v % 2 ? XL.phone2 : XL.phone, headTilt: Math.sin(t * 9 + v) * 7 }, Math.abs(Math.sin(t * 7 + v * 1.3)) * 0.18));
      wd(NT, out, "LOL!", "#ff2a6a", 0.4, 2.25, 0.4, (t - tMd) * 3, 0.75); } });
  kick1(tMd);
  // 9 Boaty gets over a hundred and twenty-four thousand votes.: the vote counter spins up to 124,109
  const t9 = S("Boaty gets"), tVo = T("votes");
  shot({ at: t9, ...S1({ set: "net" }), cam: cam(NT, [0, 1.6, 2.9], [0, 1.6, 0], [0, 1.6, 2.4], [0, 1.6, 0], 46, 3.0), cInf: 1.2, focus: NT.p(0, 1.6, 0.2), shadowR: 6,
    stage(t, out) { room(NT, out, t); screens(out, t, -2.4, 1.9, 5.0); const n = Math.round(124109 * smooth(clamp01((t - t9) / (tVo - t9 + 0.1))) / 997) * 997; const v = t > tVo ? 124109 : n;
      NT.fx(out, "cnt" + v, (p) => K.drawCounter(p.g, v), 0, 1.65, 0.2, 2.0, 1.0, { cw: 1024, ch: 512, kind: "basic" }); if (t > tVo) sparkle(NT, out, t, 0, 1.65, 0.3, 0.35, 4); } });
  kick1(tVo);
  // 10 Second place?: bar chart grows
  const t10 = S("Second place");
  shot({ at: t10, ...S1({ set: "lab" }), cam: cam(LB, [0, 1.45, 3.5], [0, 1.4, 0], [0, 1.45, 3.2], [0, 1.4, 0], 46, 1.2), cInf: 1.3, focus: LB.p(0, 1.4, 0.2), shadowR: 6,
    stage(t, out) { room(LB, out, t); const k = Math.round(smooth(clamp01((t - t10) / 0.8)) * 12) / 12; LB.fx(out, "bars" + k, (p) => K.drawBars(p.g, k), 0, 1.4, 0.2, 1.5, 1.5, { cw: 768, ch: 768, kind: "lit" }); } });
  // 11 Not even close.: push in on the tiny bar, the scientist gasps
  const tCl = T("close");
  shot({ at: S("Not even"), ...S1({ set: "lab" }), cam: cam(LB, [0.35, 1.3, 1.9], [0.25, 1.2, 0], [0.32, 1.25, 1.55], [0.25, 1.2, 0], 44, 2.0), cInf: 1.5, focus: LB.p(0.25, 1.2, 0.2), shadowR: 6,
    stage(t, out) { room(LB, out, t); LB.fx(out, "bars1", (p) => K.drawBars(p.g, 1), 0, 1.4, 0.2, 1.5, 1.5, { cw: 768, ch: 768, kind: "lit" }); who(LB, out, 2, SCI(0), 0.95, -0.4, { expr: "gasp", arms: { l: ["face", 1], r: ["face", 1] } }); mk(LB, out, "TINY!", 0.25, 1.55, 0.35, (t - tCl) * 4, 0.42, "#ffd23a"); } });
  kick1(tCl);
  // 12 Other entries?: the entries list on a big screen
  const t12 = S("Other entries");
  shot({ at: t12, ...S1({ set: "net" }), cam: cam(NT, [0, 1.6, 2.4], [0, 1.6, 0], [0, 1.6, 2.1], [0, 1.6, 0], 46, 1.3), cInf: 1.4, focus: NT.p(0, 1.6, 0.2), shadowR: 6,
    stage(t, out) { room(NT, out, t); screens(out, t, -2.4, 1.9, 5.0); NT.fx(out, "list" + (t > T("entries") ? 1 : -1), (p) => K.drawList(p.g, t > T("entries") ? 1 : -1), 0, 1.6, 0.2, 1.05, 1.4, { cw: 768, ch: 1024, kind: "basic", rot: Math.sin(t * 3) * 0.02 }); } });
  // 13 "It's Bloody Cold Here.": the ship wears that name, snow, the captain shivers
  const t13 = S("It's Bloody"), tCo = T("Cold");
  shot({ at: t13, ...S1({ set: "dock" }), cam: cam(DK, [0.2, 1.3, 6.6], [0, 1.2, -2], [0.1, 1.3, 6.0], [0, 1.2, -2], 50, 1.6), cInf: 1.0, focus: DK.p(0, 1.4, -1), shadowR: 8,
    stage(t, out) { room(DK, out, t); ship(out, t, "IT'S BLOODY|COLD HERE", { ice: true }); who(DK, out, 1, CAPT, 0.7, 2.6, { expr: "pained", arms: { l: ["hold", 1], r: ["hold", 1] }, headTilt: Math.sin(t * 30) * 3 }, 0);
      DK.fx(out, "snow" + Math.floor(t * 12) % 36, (p) => K.drawSnow(p.g, (Math.floor(t * 12) % 36) / 12), 0, 1.8, 1.6, 3.4, 3.4, { cw: 512, ch: 512, kind: "basic" }); mk(DK, out, "BRRR!", -0.7, 2.25, 2.0, (t - tCo) * 4, 0.6, "#7ad0ff"); } });
  kick1(tCo);
  // 14 "I Like Big Boats and I Cannot Lie.": that name on the hull, a fan dances on the dock
  const t14 = S("I Like Big"), tLi = T("Lie");
  shot({ at: t14, ...S1({ set: "dock" }), cam: cam(DK, [-0.2, 1.3, 6.6], [0, 1.2, -2], [-0.1, 1.3, 6.0], [0, 1.2, -2], 50, 2.0), cInf: 1.0, focus: DK.p(0, 1.4, -1), shadowR: 8,
    stage(t, out) { room(DK, out, t); ship(out, t, "I LIKE BIG BOATS|& I CANNOT LIE", { size: 64 }); const b = Math.floor(t * 4) % 2;
      who(DK, out, 12, FAN(3), -0.7, 2.6, { expr: "laugh", arms: b ? { l: ["up", 1], r: ["hips", 1] } : { l: ["hips", 1], r: ["up", 1] }, headTilt: b ? 10 : -10 }, Math.abs(Math.sin(t * 12.5)) * 0.1);
      mk(DK, out, "YEAH!", 0.7, 2.3, 2.0, (t - tLi) * 4, 0.6, "#ffd23a"); } });
  kick1(tLi);
  // 15 The joke guy? He apologizes.: the presenter holds up SORRY!, sweating
  const t15 = S("The joke guy"), tAp = T("apologizes");
  shot({ at: t15, ...S1({ set: "studio" }), cam: cam(SD, [0, 1.45, 2.4], [0, 1.4, 0], [0, 1.45, 2.05], [0, 1.4, 0], 44, 2.2), cInf: 1.3, focus: SD.p(0, 1.4, 0), shadowR: 6,
    stage(t, out) { room(SD, out, t); onair(out, t); who(SD, out, 4, PRES, 0, -0.1, { xk: t > tAp ? "p" : "", expr: t > tAp ? "sad" : "nervous", arms: t > tAp ? { l: ["hips", 1], r: ["up", 0.75] } : { l: ["head", 1], r: ["head", 1] }, extra: t > tAp ? XL.paper : undefined }); sdesk(out); sweat(SD, out, t, 0.2, 1.75, 0.1); } });
  kick1(tAp);
  // 16 Then the science minister steps in.: the minister marches to the podium, flashbulbs
  const t16 = S("Then the science");
  shot({ at: t16, ...S1({ set: "gov" }), cam: cam(GV, [0.3, 1.4, 3.6], [0, 1.3, 0], [0.2, 1.4, 3.1], [0, 1.3, 0], 48, 2.0), cInf: 1.0, focus: GV.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(GV, out, t); const u = smooth((t - t16) / 1.3); who(GV, out, 5, MIN, lerp(-1.5, -0.45, u), 0.35, { expr: "stern", mode: u < 1 ? "march" : "stand", phase: t * 2, view: u < 1 ? "side" : undefined, dir: [1, 0], arms: u < 1 ? undefined : { l: ["hips", 1], r: ["hips", 1] } });
      GV.fx(out, "podium", (p) => K.drawPodium(p.g), 0.55, 0.6, 0.05, 0.95, 1.19, { cw: 512, ch: 640, kind: "lit" }); flashes(GV, out, t, [[-1.0, 1.9, 0.8], [1.0, 2.0, 0.8]], 2.5); } });
  kick1(T("steps"));
  // 17 He wants something more… suitable.: at the podium, speech bubble
  const t17 = S("He wants"), tSu = T("suitable");
  shot({ at: t17, ...S1({ set: "gov" }), cam: cam(GV, [0, 1.6, 2.4], [0, 1.6, 0], [0, 1.6, 2.1], [0, 1.6, 0], 44, 1.8), cInf: 1.3, focus: GV.p(0, 1.6, 0), shadowR: 6,
    stage(t, out) { room(GV, out, t); who(GV, out, 5, MIN, -0.05, -0.35, { expr: t > tSu ? "stern" : (Math.floor(t * 6) % 2 ? "talk_o" : "talk_m"), arms: { l: ["hips", 1], r: [t > tSu ? "point" : "out", 1] }, headTilt: t > tSu ? -6 : 0 });
      GV.fx(out, "podium", (p) => K.drawPodium(p.g), 0.1, 0.6, 0.05, 0.95, 1.19, { cw: 512, ch: 640, kind: "lit" }); bub(GV, out, "bub", t > tSu - 0.1 ? "SUITABLE." : "SOMETHING…", "#1c2c5a", 0.12, 2.0, 0.3, (t - t17) * 3, 0.9); } });
  kick1(tSu);
  // 18 So the ship gets named after Sir David Attenborough.: the new name on the hull, sparkles
  const t18 = S("So the ship"), tAt = T("Sir");
  shot({ at: t18, ...S1({ set: "dock" }), cam: cam(DK, [0.3, 1.4, 7.4], [0, 1.2, -3], [0.1, 1.35, 6.6], [0, 1.2, -3], 50, 2.8), cInf: 0.8, focus: DK.p(0, 1.4, -3), shadowR: 10,
    stage(t, out) { room(DK, out, t); ship(out, t, t > tAt - 0.2 ? "RRS SIR DAVID|ATTENBOROUGH" : "", { size: 64, col: "#ffffff" }); if (t > tAt - 0.2) sparkle(DK, out, t, 0, 1.0, -3.2, 0.4, 5);
      who(DK, out, 1, CAPT, -0.95, 3.0, { expr: "proud", arms: { l: ["hips", 1], r: ["head", 1] } }); } });
  kick1(tAt);
  // 19 Boaty is sunk.: the old name board sinks into the water, bubbles, the captain waves bye
  const t19 = S("Boaty is"), tSk = T("sunk");
  shot({ at: t19, ...S1({ set: "dock" }), cam: cam(DK, [0, 0.95, 2.4], [0, 0.6, -1.4], [0, 0.9, 2.1], [0, 0.55, -1.4], 46, 1.2), cInf: 1.2, focus: DK.p(0, 0.4, -1.8), shadowR: 8,
    stage(t, out) { room(DK, out, t); ship(out, t, "RRS SIR DAVID|ATTENBOROUGH", { size: 64 }); const u = smooth(clamp01((t - t19 - 0.2) / 1.0)); board(DK, out, "BOATY McBOATFACE", 0, lerp(1.0, -0.4, u), -1.4, 1.8, 0.25 * u);
      bubbles(DK, out, t, -0.3, 0.6, -1.6, 0.6); bubbles(DK, out, t + 1.7, 0.4, 0.5, -1.6, 0.5); wd(DK, out, "SUNK!", "#2a5ad8", 0.15, 1.25, -0.3, (t - tSk) * 3, 1.0); } });
  kick1(tSk);
  // 20 Wait, it gets weirder.: red drama room, the scientist's jaw drops
  const tWe = T("weirder");
  shot({ at: S("Wait it"), ...S1({ set: "drama" }), cam: cam(DM, [0, 1.4, 2.6], [0, 1.35, 0], [0, 1.45, 2.0], [0, 1.4, 0], 46, 1.4), cInf: 1.4, focus: DM.p(0, 1.35, 0), shadowR: 6,
    stage(t, out) { room(DM, out, t); who(DM, out, 3, SCI(1), 0, 0, { expr: "shock", arms: { l: ["head", 1], r: ["head", 1] } }); wd(DM, out, "WEIRDER!", "#c8202a", 0, 1.95, 0.3, (t - tWe) * 3, 0.85); } });
  kick1(tWe);
  // 21 Boaty comes back…: the water bursts, a yellow sub pops up
  const t21 = S("Boaty comes"), tBk = T("back");
  shot({ at: t21, ...S1({ set: "dock" }), cam: cam(DK, [0.1, 0.9, 3.4], [0, 0.6, -1.8], [0.05, 0.9, 3.0], [0, 0.65, -1.8], 46, 1.0), cInf: 1.2, focus: DK.p(0, 0.6, -1.8), shadowR: 8,
    stage(t, out) { room(DK, out, t); ship(out, t, "RRS SIR DAVID|ATTENBOROUGH", { size: 64 }); const u = clamp01((t - t21) / 0.6), up = smooth(u);
      sub(DK, out, t, 0, lerp(-0.4, 0.55, up) + Math.sin(t * 3) * 0.03 * up, -1.8, 2.2, { rot: lerp(0.5, 0.08, up), look: 1 }); if (u > 0) { const k = Math.round(clamp01((t - t21) / 1.0) * 8) / 8; DK.fx(out, "spl" + k, (p) => K.drawSplash(p.g, k), 0, 0.35, -1.6, 2.2, 1.1, { cw: 512, ch: 256, kind: "basic" }); } } });
  kick1(tBk);
  // 22 …as a little yellow robot submarine.: under water, the sub smiles, BEEP!
  const t22 = S("as a little"), tRo = T("robot");
  shot({ at: t22, ...S1({ set: "deep" }), cam: cam(DP, [0, 1.5, 3.2], [0, 1.5, 0], [0, 1.5, 2.8], [0, 1.5, 0], 46, 2.0), cInf: 1.2, focus: DP.p(0, 1.5, 0), shadowR: 6,
    stage(t, out) { room(DP, out, t); sub(DP, out, t, 0.05 + Math.sin(t * 2) * 0.05, 1.5 + Math.sin(t * 2.6) * 0.05, 0, 1.7, { rot: Math.sin(t * 2) * 0.04, look: Math.sin(t * 3) > 0 ? 1 : 0 }); bubbles(DP, out, t, -0.85, 1.6, 0.1, 0.5);
      mk(DP, out, "BEEP!", 0.3, 2.1, 0.3, (t - tRo) * 4, 0.5, "#ffd21a"); } });
  kick1(tRo);
  // 23 And Boaty dives deep into the freezing sea…: the sub dives down past the ice shelf
  const t23 = S("And Boaty dives");
  shot({ at: t23, ...S1({ set: "deep" }), cam: keys([{ t: 0, pos: DP.p(0, 2.6, 3.4), look: DP.p(0, 2.3, 0), fov: 50 }, { t: 1.9, pos: DP.p(0.2, 1.3, 3.0), look: DP.p(0.2, 1.0, 0), fov: 50 }]), cInf: 1.0, focus: DP.p(0, 1.5, 0), shadowR: 6,
    stage(t, out) { room(DP, out, t); const u = clamp01((t - t23) / 1.9); sub(DP, out, t, lerp(-0.8, 0.6, u), lerp(2.8, 0.9, u), 0, 1.5, { rot: 0.55, look: 1 }); bubbles(DP, out, t, lerp(-1.3, 0.1, u), lerp(3.3, 1.5, u), -0.1, 0.6); } });
  // 24 …freezing… near Antarctica…: ice crystals, a penguin waves at the sub, BRRR!
  const t24 = T("freezing") - 0.1, tAn = T("Antarctica");
  shot({ at: t24, ...S1({ set: "deep" }), cam: cam(DP, [0, 1.6, 3.0], [0, 1.6, 0], [0, 1.55, 2.6], [0, 1.55, 0], 48, 1.8), cInf: 1.1, focus: DP.p(0, 1.5, 0), shadowR: 6,
    stage(t, out) { room(DP, out, t); sub(DP, out, t, -0.25 + (t - t24) * 0.15, 1.2, 0, 1.4, { rot: 0.05, look: 1 }); const pk = Math.floor(t * 8) % 16; DP.fx(out, "pen" + pk, (p) => K.drawPenguin(p.g, pk / 8), 0.6, 2.2 + Math.sin(t * 3) * 0.05, 0.3, 0.42, 0.63, { cw: 256, ch: 384, kind: "lit", rot: 0.3 + Math.sin(t * 3) * 0.1 });
      DP.fx(out, "snw" + Math.floor(t * 12) % 36, (p) => K.drawSnow(p.g, (Math.floor(t * 12) % 36) / 12), 0, 1.6, 0.6, 2.4, 2.4, { cw: 512, ch: 512, kind: "basic" }); mk(DP, out, "BRRR!", -0.3, 2.2, 0.4, (t - tAn) * 4, 0.5, "#7ad0ff"); } });
  kick1(tAn);
  // 25 …and helps make a real climate discovery.: headlight on, sonar rings, the bulb pops
  const t25 = S("and helps"), tDs = T("discovery");
  shot({ at: t25, ...S1({ set: "deep" }), cam: cam(DP, [0.1, 1.5, 3.4], [0, 1.45, 0], [0.05, 1.5, 3.0], [0, 1.45, 0], 46, 1.4), cInf: 1.2, focus: DP.p(0, 1.45, 0), shadowR: 6,
    stage(t, out) { room(DP, out, t); sub(DP, out, t, -0.15, 1.3, 0, 1.6, { light: true, look: 1 }); for (let i = 0; i < 3; i++) { const ph = (t * 1.2 + i / 3) % 1; const al = Math.round((1 - ph) * 5) / 5; if (al > 0) DP.fx(out, "ring" + al, (p) => { const g = p.g; g.clearRect(0, 0, 256, 256); K.E(g, 128, 128, 110, 110, 0, null, 10, `rgba(160,240,255,${al})`); }, 0.75, 1.3, 0.05, 0.3 + ph * 1.4, 0.3 + ph * 1.4, { cw: 256, ch: 256, kind: "basic" }); }
      if (t > tDs - 0.2) { const k = Math.round(smooth(clamp01((t - tDs + 0.2) * 4)) * 6) / 6; DP.fx(out, "bulb" + k, (p) => K.drawBulb(p.g), 0, 2.05, 0.2, 0.55 * k, 0.69 * k, { cw: 256, ch: 320, kind: "basic" }); } } });
  kick1(tDs);
  // 26 (discovery): the scientists cheer with the result board
  const t26 = T("discovery") + 0.35;
  shot({ at: t26, ...S1({ set: "lab" }), cam: cam(LB, [0, 1.45, 3.2], [0, 1.35, 0], [0, 1.45, 2.8], [0, 1.35, 0], 48, 1.0), cInf: 1.0, focus: LB.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(LB, out, t); [[-0.6, 2, 0], [0.6, 3, 1]].forEach(([x, id, v]) => who(LB, out, id, SCI(v), x, 0, { expr: "laugh", arms: { l: ["up", 1], r: ["up", 1] }, headTilt: Math.sin(t * 9 + v) * 6 }, Math.abs(Math.sin(t * 8 + v)) * 0.1));
      bd(LB, out, "bdisc", "DISCOVERY!", "DEEP OCEAN", "#2a5ad8", 0, 2.15, 0.3, (t - t26) * 3, 1.2); } });
  // 27 Then Sweden copies the joke.: Swedish platform, a sleek train glides in
  const t27 = S("Then Sweden");
  shot({ at: t27, ...S1({ set: "station" }), cam: cam(SN, [0.3, 1.5, 4.6], [0, 1.2, -1], [0.1, 1.45, 4.0], [0, 1.2, -1], 50, 1.6), cInf: 0.9, focus: SN.p(0, 1.2, -1), shadowR: 8,
    stage(t, out) { room(SN, out, t); const u = smooth(clamp01((t - t27) / 1.3)); train(out, t, lerp(6.0, 0, u)); who(SN, out, 13, FAN(4), -0.55, 1.4, { expr: "sly", arms: { l: ["hips", 1], r: ["point", 1] } }); mk(SN, out, "COPY!", 0.4, 2.2, 0.6, (t - T("copies")) * 4, 0.6, "#ffd23a"); } });
  kick1(T("copies"));
  // 28 Their new train?: close on the train's smiling nose
  const t28 = S("Their new");
  shot({ at: t28, ...S1({ set: "station" }), cam: cam(SN, [2.6, 1.3, 1.6], [2.0, 1.1, -2.2], [2.4, 1.25, 1.3], [2.0, 1.1, -2.2], 46, 1.2), cInf: 1.2, focus: SN.p(2.0, 1.1, -2.2), shadowR: 6,
    stage(t, out) { room(SN, out, t); train(out, t, 0, "", { face: true }); mk(SN, out, "?", 1.6, 2.0, -1.8, (t - T("train", t28)) * 4, 0.5, "#ffd23a"); } });
  // 29 Trainy McTrainface.: the name lights up on the side, the commuter cracks up
  const t29 = S("Trainy McTrainface");
  shot({ at: t29, ...S1({ set: "station" }), cam: cam(SN, [-0.7, 1.4, 5.8], [-0.9, 1.2, -1.5], [-0.75, 1.35, 5.2], [-0.9, 1.2, -1.5], 50, 1.6), cInf: 1.0, focus: SN.p(0, 1.2, -1.5), shadowR: 8,
    stage(t, out) { room(SN, out, t); train(out, t, -0.6, t > t29 + 0.15 ? "TRAINY McTRAINFACE" : "", { face: true }); if (t > t29 + 0.15) sparkle(SN, out, t, -0.9, 1.2, -2.0, 0.35, 4);
      who(SN, out, 13, FAN(4), 0.0, 2.4, { expr: "laugh", arms: { l: ["hips", 1], r: ["face", 1] }, headTilt: Math.sin(t * 10) * 7 }); } });
  kick1(t29 + 0.15);
  // 30 Lesson learned?: the scientist thinks
  const t30 = S("Lesson learned");
  shot({ at: t30, ...S1({ set: "lab" }), cam: cam(LB, [0.1, 1.5, 2.1], [0, 1.5, 0], [0.05, 1.5, 1.85], [0, 1.5, 0], 44, 1.0), cInf: 1.5, focus: LB.p(0, 1.5, 0), shadowR: 6,
    stage(t, out) { room(LB, out, t); poster(out, -0.6, 1.95, -1.4, 1.1); who(LB, out, 3, SCI(1), 0, 0, { expr: "suspicious", arms: { l: ["hips", 1], r: ["face", 0.8] }, headTilt: 8 }); mk(LB, out, "?", 0.35, 2.0, 0.3, (t - t30) * 4, 0.45, "#ffd23a"); } });
  // 31 Nope.: she shakes her head
  const tNo = T("Nope");
  shot({ at: tNo - 0.1, ...S1({ set: "lab" }), cam: cam(LB, [0, 1.5, 1.8], [0, 1.5, 0], [0, 1.5, 1.6], [0, 1.5, 0], 42, 0.6), cInf: 1.6, focus: LB.p(0, 1.5, 0), shadowR: 6,
    stage(t, out) { room(LB, out, t); who(LB, out, 3, SCI(1), 0, 0, { expr: "annoyed", arms: { l: ["hips", 1], r: ["hips", 1] }, headTilt: Math.sin(t * 18) * 10 }); wd(LB, out, "NOPE!", "#c8202a", 0, 1.9, 0.3, (t - tNo) * 3, 0.7); } });
  kick1(tNo);
  // 32 Because once again…: the internet votes again, phones up
  const t32 = S("Because once");
  shot({ at: t32, ...S1({ set: "net" }), cam: cam(NT, [0.1, 1.4, 3.6], [0, 1.35, 0], [0.05, 1.4, 3.1], [0, 1.35, 0], 50, 1.2), cInf: 1.0, focus: NT.p(0, 1.3, 0), shadowR: 6,
    stage(t, out) { room(NT, out, t); screens(out, t, -2.4, 1.9, 5.0); [[-0.7, 0, 0], [0.7, 0, 2]].forEach(([x, z, v]) => who(NT, out, 10 + v, FAN(v), x, z, { xk: "ph" + (v % 2), expr: "grin", arms: { l: ["hips", 1], r: ["up", 1] }, extra: v % 2 ? XL.phone2 : XL.phone, headTilt: Math.sin(t * 6 + v) * 5 }));
      wd(NT, out, "VOTE!", "#2a5ad8", 0, 2.25, 0.4, (t - T("again")) * 3, 0.75); } });
  kick1(T("again"));
  // 33 …they let: loop: shot 1's view, played backwards into frame 0
  const tL = S("they let", T("again"));
  shot({ at: tL, ...S1({ set: "dock" }), cam: heroCam, cInf: 0.9, focus: DK.p(0, 1.5, 0), shadowR: 8, loop: true, stage(t, out) { heroStage(t, out); } });
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
