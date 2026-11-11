// Browser page entry: boots the engine on #c and exposes window.grab(f) for render.cjs
import { createEngine } from "./engine.js";
const q = Object.fromEntries(new URLSearchParams(location.search));
const W = +(q.w || 1920), H = +(q.h || 1080);
const canvas = document.getElementById("c");
(async () => {
  await Promise.all(["Rye", "AlfaSlab", "Bangers"].map((f) => document.fonts.load(`60px ${f}`)));
  const words = await (await fetch("../voice/words.json")).json();
  const E = await createEngine(canvas, W, H, words, q);
  window.TOTAL = E.TOTAL; window.FPS = E.FPS; window.SHOTLIST = E.SHOTLIST; window.renderFrame = E.renderFrame; window.probe = E.probe;
  window.grab = (f, quality = 0.95) => { const t0 = performance.now(); let id; try { id = E.renderFrame(f); } catch (e) { throw new Error(e.stack); } const t1 = performance.now(); const u = canvas.toDataURL("image/jpeg", quality); window.LAST = { pt: E.timing(), shot: id, render: Math.round(t1 - t0), enc: Math.round(performance.now() - t1) }; return u; };
  window.READY = true;
})().catch((e) => { window.BOOT_ERROR = String(e && e.stack || e); console.error(e); });
