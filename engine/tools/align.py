# Align the script's words to voice.mp3 without speech recognition: speech runs between pauses (ffmpeg silencedetect),
# sentences/phrases are matched to runs by dynamic programming on syllable counts, words spread by syllables.
import re, json, subprocess, sys
VOICE = sys.argv[1]; OUT = sys.argv[2]
script = open(sys.argv[3]).read().split('## Script')[1].split('## Shot ideas')[0]
script = re.sub(r'\*\*[A-Z ]+\*\*', '\n', script)
# phrases = split at . ? ! : and , ; (candidate pause points)
words = []
for tok in script.split():
    words.append(tok)
def syl(w):
    w = re.sub(r'[^a-z0-9]', '', w.lower())
    if not w: return 1
    if w.isdigit() or w in ('1930s', 'FBI', 'U.S.'):
        return {'1876': 6, '1945': 5, '1932': 5, '1911': 5, '1930s': 4, '1939': 5, '1944': 5, 'FBI': 3, 'U.S.': 2, '1943': 6, '2005': 4, '2007': 4, '2011': 4}.get(w, 3)
    w2 = re.sub(r'e$', '', w)
    n = len(re.findall(r'[aeiouy]+', w2))
    return max(1, n)
# units: break after punctuation
units, cur = [], []
for w in words:
    cur.append(w)
    if re.search(r'[.,:;!?]$', w):
        units.append(cur); cur = []
if cur: units.append(cur)
strong = [bool(re.search(r'[.:!?]$', u[-1])) for u in units]
usyl = [sum(syl(w) for w in u) for u in units]
# speech runs
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', VOICE, '-af', 'silencedetect=noise=-40dB:d=0.15', '-f', 'null', '-'], capture_output=True, text=True).stderr
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', VOICE], capture_output=True, text=True).stdout)
ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
sil = list(zip(ss, se + [dur] * (len(ss) - len(se))))
runs, t = [], 0.0
for a, b in sil:
    if a - t > 0.05: runs.append((t, a))
    t = b
if dur - t > 0.05: runs.append((t, dur))
gaps = [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
print(len(units), 'units,', len(runs), 'runs, syllables', sum(usyl), file=sys.stderr)
# DP: assign consecutive units to consecutive runs (each run gets >=1 unit; a unit may NOT span runs; merge runs if
# needed by allowing a group of runs). cost = (rate deviation)^2 + penalty for weak boundary on a long gap.
total_speech = sum(b - a for a, b in runs); rate = sum(usyl) / total_speech
INF = 1e18
U, R = len(units), len(runs)
pre = [0]
for s in usyl: pre.append(pre[-1] + s)
from functools import lru_cache
import math
sys.setrecursionlimit(100000)
best = [[INF] * (R + 1) for _ in range(U + 1)]; back = [[None] * (R + 1) for _ in range(U + 1)]
best[0][0] = 0
for i in range(U + 1):
    for j in range(R + 1):
        if best[i][j] >= INF: continue
        for i2 in range(i + 1, min(U, i + 6) + 1):
            for j2 in range(j + 1, min(R, j + 4) + 1):
                sy = pre[i2] - pre[i]; d = sum(b - a for a, b in runs[j:j2])
                c = (math.log((sy / rate) / d)) ** 2 * 10
                if j2 < R:
                    g = gaps[j2 - 1]
                    c += 0 if strong[i2 - 1] else (0.5 if g < 0.45 else 2.0)
                for jj in range(j + 1, j2):  # swallowing a real pause inside a group is expensive
                    c += 3.0 + 12.0 * gaps[jj - 1]
                if best[i][j] + c < best[i2][j2]:
                    best[i2][j2] = best[i][j] + c; back[i2][j2] = (i, j)
i, j = U, R; segs = []
while (i, j) != (0, 0):
    pi, pj = back[i][j]; segs.append((pi, i, pj, j)); i, j = pi, pj
segs.reverse()
out = []
for a, b, ra, rb in segs:
    ws = [w for u in units[a:b] for w in u]
    # spread over the speech inside runs ra..rb (skip internal gaps)
    sub = runs[ra:rb]; tot = sum(e - s for s, e in sub); sy = [syl(w) for w in ws]; S = sum(sy)
    def at(x):  # x in [0, tot] -> time
        for s, e in sub:
            if x <= e - s + 1e-9: return s + x
            x -= e - s
        return sub[-1][1]
    acc = 0
    for w, k in zip(ws, sy):
        out.append({'word': re.sub(r'[^\w\'-]', '', w), 'raw': w, 'start': round(at(acc / S * tot), 3), 'end': round(at((acc + k) / S * tot), 3)})
        acc += k
json.dump(out, open(OUT, 'w'), indent=0)
for a, b, ra, rb in segs:
    print(f"{runs[ra][0]:6.2f}-{runs[rb-1][1]:6.2f}  {' '.join(w for u in units[a:b] for w in u)}")
