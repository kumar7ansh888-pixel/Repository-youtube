# Whisper base.en (sherpa-onnx ONNX export) run with numpy + onnxruntime only. Chunks audio at pauses (<28 s each).
import sys, re, base64, subprocess, json, numpy as np, onnxruntime as ort, wave as _w
M = sys.argv[1]; wav = sys.argv[2]
_f = _w.open(wav); sr = _f.getframerate(); x = np.frombuffer(_f.readframes(_f.getnframes()), np.int16).astype(np.float32) / 32768; assert sr == 16000
def hz2mel(f):
    f = np.asarray(f, float); m = f / (200.0 / 3); lg = f >= 1000
    return np.where(lg, 15 + np.log(np.maximum(f, 1e-9) / 1000) / (np.log(6.4) / 27), m)
def mel2hz(m):
    m = np.asarray(m, float); f = m * 200.0 / 3; lg = m >= 15
    return np.where(lg, 1000 * np.exp(np.log(6.4) / 27 * (m - 15)), f)
def melfb(n=80, nfft=400, sr=16000):
    ff = np.linspace(0, sr / 2, nfft // 2 + 1); mp = mel2hz(np.linspace(hz2mel(0), hz2mel(8000), n + 2))
    fd = np.diff(mp); ramps = mp[:, None] - ff[None]; W = np.zeros((n, len(ff)))
    for i in range(n):
        lo = -ramps[i] / fd[i]; hi = ramps[i + 2] / fd[i + 1]; W[i] = np.maximum(0, np.minimum(lo, hi))
    W *= (2.0 / (mp[2:n + 2] - mp[:n]))[:, None]; return W
FB = melfb()
def feats(a):
    win = 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(400) / 400)
    p = np.pad(a, 200, mode='reflect'); n = 1 + (len(p) - 400) // 160
    fr = np.stack([p[i * 160:i * 160 + 400] * win for i in range(n)])
    mag = np.abs(np.fft.rfft(fr, axis=1)) ** 2; mag = mag[:-1]
    m = FB @ mag.T; ls = np.log10(np.maximum(m, 1e-10)); ls = np.maximum(ls, ls.max() - 8); ls = (ls + 4) / 4
    ls = np.pad(ls, ((0, 0), (0, 1500))); 
    if ls.shape[1] > 3000: ls = ls[:, :2950]; ls = np.pad(ls, ((0, 0), (0, 50)))
    return ls[None].astype(np.float32)
so = ort.SessionOptions(); so.intra_op_num_threads = 4
enc = ort.InferenceSession(f'{M}-encoder.int8.onnx', so); dec = ort.InferenceSession(f'{M}-decoder.int8.onnx', so)
meta = enc.get_modelmeta().custom_metadata_map
L, C, S = int(meta['n_text_layer']), int(meta['n_text_ctx']), int(meta['n_text_state'])
sot = list(map(int, meta['sot_sequence'].split(','))) + [int(meta['no_timestamps'])]
eot = int(meta['eot']); bad = [int(meta[k]) for k in ('no_timestamps', 'sot', 'no_speech', 'translate')]
tok = {}
for line in open(f'{M}-tokens.txt'):
    t, i = line.split(); tok[int(i)] = t
def run(a):
    ck, cv = enc.run(None, {enc.get_inputs()[0].name: feats(a)})
    kc = np.zeros((L, 1, C, S), np.float32); vc = kc.copy(); off = np.zeros(1, np.int64)
    ins = [i.name for i in dec.get_inputs()]
    def step(t, kc, vc, off):
        o = dec.run(None, dict(zip(ins, [np.array([t], np.int64), kc, vc, ck, cv, off]))); return o[0][0, -1], o[1], o[2]
    lg, kc, vc = step(sot, kc, vc, off); off += len(sot); res = []
    lg[eot] = -np.inf; lg[int(meta['blank_id'])] = -np.inf
    for k in range(200):
        lg[bad] = -np.inf; t = int(lg.argmax())
        if t == eot: break
        res.append(t); lg, kc, vc = step([t], kc, vc, off); off += 1
    return b''.join(base64.b64decode(tok[i]) for i in res if i in tok).decode(errors='ignore').strip()
# chunk at silences
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-40dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
mids = [(float(a) + float(b)) / 2 for a, b in zip(re.findall(r'silence_start: ([\d.]+)', log), re.findall(r'silence_end: ([\d.]+)', log))]
dur = len(x) / sr; cuts = [0.0]
while dur - cuts[-1] > 26:
    c = [m for m in mids if cuts[-1] + 8 < m < cuts[-1] + 26]; cuts.append(max(c) if c else cuts[-1] + 26)
cuts.append(dur); out = []
for a, b in zip(cuts, cuts[1:]):
    t = run(x[int(a * sr):int(b * sr)]); print(f'[{a:.1f}-{b:.1f}] {t}', flush=True); out.append(t)
open(sys.argv[3], 'w').write(' '.join(out))
