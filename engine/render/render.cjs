// Drive the renderer in headless Chromium.
//   node render.cjs stills <outPrefix> <frames,comma,list> [w h]
//   node render.cjs video <out.mp4> <f0> <f1> [w h] [crf]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
});
(async () => {
  const [mode, out, a, b, c, d, e] = process.argv.slice(2);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const W = +(['stills', 'segments', 'contact'].includes(mode) ? b || 1920 : c || 1920), H = +(['stills', 'segments', 'contact'].includes(mode) ? c || 1080 : d || 1080);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--js-flags=--max-old-space-size=4096'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text().slice(0, 400)); });
  page.on('pageerror', (err) => console.error('[pageerror]', err.stack || err.message));
  await page.goto(`http://127.0.0.1:${port}/render/index.html?w=${W}&h=${H}${process.env.QS || ''}`);
  await page.waitForFunction(() => window.READY || window.BOOT_ERROR, null, { timeout: 60000 });
  const err = await page.evaluate(() => window.BOOT_ERROR);
  if (err) { console.error(err); process.exit(1); }
  const total = await page.evaluate(() => window.TOTAL);
  console.error('total frames', total);
  const grab = async (f) => Buffer.from((await page.evaluate((f) => window.grab(f, 0.95), f)).split(',')[1], 'base64');
  if (mode === 'segments') {
    // render every frame in resumable segments of `a` frames: out/seg_00000.mp4 ... (existing ones are skipped)
    const L = +a, crf = e || '16';
    fs.mkdirSync(out, { recursive: true });
    for (let s0 = +(process.env.SEG_FROM || 0); s0 < Math.min(total, +(process.env.SEG_TO || total)); s0 += L) {
      const name = path.join(out, `seg_${String(s0).padStart(5, '0')}.mp4`);
      if (fs.existsSync(name)) continue;
      const tmp = name + '.part.mp4', s1 = Math.min(total - 1, s0 + L - 1), t0 = Date.now();
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf, '-pix_fmt', 'yuv420p', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = s0; f <= s1; f++) {
        const buf = await grab(f);
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      ff.stdin.end(); await new Promise((r) => ff.on('close', r));
      fs.renameSync(tmp, name);
      console.error(`segment ${s0}-${s1} done in ${((Date.now() - t0) / 1000).toFixed(0)} s (${((Date.now() - t0) / 1000 / (s1 - s0 + 1)).toFixed(2)} s/f)`);
    }
  }
  else if (mode === 'contact') {
    const L = await page.evaluate(() => window.SHOTLIST), only = a ? a.split(',').map(Number) : null;
    for (const [id, f0, f1] of L) { if (only && !only.includes(id)) continue; const f = Math.round(f0 + (f1 - f0) * 0.6); try { const buf = await grab(f); fs.writeFileSync(`${out}${String(id).padStart(3, '0')}.jpg`, buf); } catch (e) { console.error('shot', id, 'frame', f, String(e).slice(0, 600)); } }
  }
  else if (mode === 'shots') { const L = await page.evaluate(() => window.SHOTLIST); console.log(JSON.stringify(L)); fs.writeFileSync(out, JSON.stringify(L)); }
  else if (mode === 'probe') { for (const f of a.split(',').map(Number)) console.log(f, JSON.stringify(await page.evaluate((f) => window.probe(f), f))); }
  else if (mode === 'stills') {
    for (const f of a.split(',').map(Number)) {
      const t0 = Date.now(); const buf = await grab(f);
      fs.writeFileSync(`${out}${String(f).padStart(4, '0')}.jpg`, buf);
      console.error('frame', f, JSON.stringify(await page.evaluate(() => window.LAST)), ((Date.now() - t0) / 1000).toFixed(2) + 's');
    }
  } else {
    const f0 = +a, f1 = Math.min(+b, total - 1), crf = e || '17';
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf, '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = f0; f <= f1; f++) {
      const buf = await grab(f);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if ((f - f0) % 30 === 0) console.error(`frame ${f}/${f1}  ${((Date.now() - t0) / 1000 / (f - f0 + 1)).toFixed(2)} s/f`);
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  }
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
