# Soundtrack for "He Ate a Whole Airplane": original score + synthesized SFX + the voice, timed to words.json
# (same phrase anchors as render/src/story.js). Voice unchanged, music ducked under speech, -14 LUFS, <= -1 dBTP.
# Mix standard from the skill: voice unchanged, music bed ducked under speech, final -14 LUFS, <= -1 dBTP.
import json, os, sys
import numpy as np
from scipy import ndimage
from dsp import SR, ns, tt, dbg, rng, lp, hp, bp, peq, colored, smooth_noise, fades, modal, pan, st, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, phase, TAU
from instruments import m2f, glock, vibes, pluck, pad, brush, snare, timpani, cymbal, brass, triangle

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
WORDS = json.load(open(os.path.join(ROOT, "voice", "words.json")))
FPS = 30
TOTAL = 1681
DUR = TOTAL / FPS
N = ns(DUR)
norm = lambda s: "".join(c for c in s.lower() if c.isalnum() or c == "'")


def P(phrase, after=-1.0, end=False):
    ws = [norm(w) for w in phrase.split()]
    for i in range(len(WORDS) - len(ws) + 1):
        if WORDS[i]["start"] <= after:
            continue
        if all(norm(WORDS[i + k]["word"]) == w for k, w in enumerate(ws)):
            return WORDS[i + len(ws) - 1]["end"] if end else WORDS[i]["start"]
    raise KeyError(phrase)


# ================================================================ SFX library (all synthesized)
def spit(vel=1.0, r=None):
    """'ptoo': lip pop + wet breath burst"""
    r = r or rng(1); d = 0.32; t = tt(d); n = len(t)
    pop = np.sin(phase(260 * (1 + 1.5 * np.exp(-t / 0.01)))) * np.exp(-t / 0.018)
    air = bp(r.standard_normal(n), 900, 5000, 2) * np.exp(-t / 0.08) * (1 - np.exp(-t / 0.004))
    wet = bp(r.standard_normal(n), 2500, 7000, 1) * (r.random(n) < 0.02) * np.exp(-t / 0.12) * 3
    return fades((0.6 * pop + 0.9 * air + 0.4 * wet) * vel, 0.001, 0.03)


def splat(vel=1.0, r=None, size=1.0):
    r = r or rng(2); d = 0.35; t = tt(d); n = len(t)
    body = lp(r.standard_normal(n), 1800 / size, 2) * np.exp(-t / (0.04 * size)) * (1 - np.exp(-t / 0.0015))
    drops = bp(r.standard_normal(n), 1500, 6000, 1) * (r.random(n) < 0.006) * np.exp(-t / 0.15) * 4
    thump = np.sin(phase(120 * (1 + np.exp(-t / 0.01)))) * np.exp(-t / 0.03)
    return fades((1.0 * body + 0.5 * drops + 0.5 * thump) * vel, 0.0005, 0.05)


def clank(vel=1.0, r=None, f=410):
    r = r or rng(3)
    y = modal(1.2, [(f, 1, 0.35), (f * 2.41, 0.6, 0.2), (f * 3.9, 0.4, 0.12), (f * 5.2, 0.25, 0.08), (f * 7.1, 0.15, 0.05)], r)
    t = tt(1.2); hit = hp(r.standard_normal(len(t)), 2000) * np.exp(-t / 0.003)
    return fades((y * 0.7 + hit * 0.8) * vel, 0.0003, 0.1)


def drone(dur, r=None):
    """distant bomber formation: low detuned engine buzz with doppler swell"""
    r = r or rng(4); t = tt(dur); n = len(t)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    f = 82 * (1 + 0.04 * (0.5 - t / dur))
    y = np.zeros(n)
    for k, dc in enumerate([0, 0.7, -0.9, 1.6]):
        ph = phase(f * (1 + dc / 100) + 0.6 * smooth_noise(n, r, 2))
        y += np.sign(np.sin(ph)) * 0.25 + 0.4 * np.sin(2 * ph)
    y = lp(y, 900, 2) + 0.3 * lp(colored(n, r, -1), 400)
    return y * env


def bell(r=None):
    r = r or rng(5)
    return modal(1.6, [(1240, 1, 0.5), (1240 * 2.0, 0.5, 0.3), (1240 * 2.76, 0.3, 0.2), (1240 * 4.1, 0.2, 0.1)], r) * 0.6


def horn_car(f=420, dur=0.35, r=None):
    r = r or rng(6); t = tt(dur); ph = phase(np.full(len(t), f))
    y = (np.sign(np.sin(ph)) * 0.5 + np.sin(1.26 * ph) * 0.5)
    return fades(lp(y, 2500, 2) * 0.35, 0.01, 0.05)


def ship_horn(dur=2.4, r=None):
    r = r or rng(8); t = tt(dur); n = len(t)
    ph = phase(np.full(n, 98.0) * (1 + 0.004 * smooth_noise(n, r, 3)))
    y = sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 14))
    env = np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.4)
    return lp(y, 1400, 2) * env * 0.35


def scrape(dur=1.4, r=None):
    r = r or rng(9); t = tt(dur); n = len(t)
    y = bp(r.standard_normal(n), 300, 2500, 2) * (0.5 + 0.5 * smooth_noise(n, r, 11))
    y += 0.4 * np.sin(phase(180 + 60 * smooth_noise(n, r, 4))) * (0.6 + 0.4 * smooth_noise(n, r, 9))
    return y * np.sin(np.pi * t / dur) ** 0.7 * 0.6


def coo(r=None):
    r = r or rng(10); d = 0.7; t = tt(d)
    f = 340 * (1 + 0.25 * np.sin(np.pi * t / d)) * (1 + 0.02 * np.sin(TAU * 28 * t))
    y = np.sin(phase(f)) + 0.3 * np.sin(2 * phase(f))
    return fades(lp(y, 1200) * np.sin(np.pi * t / d) ** 1.5 * 0.35, 0.01, 0.05)


def flap(r=None):
    r = r or rng(11); d = 0.5; t = tt(d); n = len(t)
    e = np.abs(np.sin(TAU * 9 * t)) ** 3 * np.exp(-t / 0.3)
    return bp(r.standard_normal(n), 400, 3000, 1) * e * 0.5


def plink(f=1700, r=None, vel=1.0):
    r = r or rng(12); d = 0.4; t = tt(d)
    y = np.sin(phase(f * (1 + 0.6 * np.exp(-t / 0.012)))) * np.exp(-t / 0.06)
    return fades(y * 0.45 * vel, 0.0005, 0.04)


def click(r=None, f=3200):
    r = r or rng(13); t = tt(0.06)
    return hp(r.standard_normal(len(t)), f) * np.exp(-t / 0.004) * 0.6


def tok(r=None):
    """spit hitting fibreglass: dull hollow plastic knock"""
    r = r or rng(14)
    return modal(0.3, [(520, 1, 0.04), (870, 0.6, 0.03), (1450, 0.3, 0.02)], r) * 0.7 + splat(0.35, r, 0.6)[:ns(0.3)]


def whoosh(dur=0.6, r=None, up=True):
    r = r or rng(15); t = tt(dur); n = len(t)
    fc = np.linspace(400, 5000, n) if up else np.linspace(5000, 400, n)
    y = np.zeros(n); x = r.standard_normal(n)
    for a in range(0, n, 2048):
        b = min(n, a + 2048); y[a:b] = bp(x[a:b], max(100, fc[a] * 0.6), min(15000, fc[a] * 1.6), 1)
    return y * np.sin(np.pi * t / dur) ** 2 * 0.6


def chew(dur, r=None):
    r = r or rng(16); t = tt(dur); n = len(t)
    e = np.maximum(0, np.sin(TAU * 2.0 * t)) ** 4
    return lp(r.standard_normal(n), 900, 2) * e * 0.25 + bp(r.standard_normal(n), 2000, 5000, 1) * (r.random(n) < 0.003) * e * 2


def sizzle(dur, r=None):
    r = r or rng(17); t = tt(dur); n = len(t)
    return hp(r.standard_normal(n), 4000) * (r.random(n) < 0.05) * np.minimum(1, t / 0.5) * 0.3


def ratchet(r=None):
    r = r or rng(18); out = np.zeros(ns(0.5))
    for k in range(6):
        c = click(r, 2500); i = ns(k * 0.07); out[i:i + len(c)] += c[: len(out) - i]
    return out


def ambience(kind, dur, r=None):
    """beds: city (traffic hum + murmur), river (water lap + gulls-free breeze), market"""
    r = r or rng(19); n = ns(dur); t = np.arange(n) / SR
    if kind == "river":
        y = lp(colored(n, r, -1), 700) * (0.6 + 0.4 * smooth_noise(n, r, 0.3)) * 0.5
        y += bp(r.standard_normal(n), 300, 1200, 1) * (0.5 + 0.5 * smooth_noise(n, r, 1.3)) ** 3 * 0.4
        return widen(y, r, 15, 0.8)
    hum = lp(colored(n, r, -1.2), 500) * 0.6
    mur = bp(r.standard_normal(n), 250, 2200, 2) * (0.6 + 0.4 * smooth_noise(n, r, 3.0)) * (0.7 if kind == "city" else 1.0)
    return widen(hum + mur, r, 17, 0.9)



# ================================================================ SFX timeline
def ev(x, t, g=0.0, p=0.0):
    place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t, dbg(g))


def creak(r=None, d=0.5):
    r = r or rng(200); t = tt(d); n = len(t)
    f = 180 + 120 * smooth_noise(n, r, 6)
    y = np.sin(phase(f)) * (0.5 + 0.5 * smooth_noise(n, r, 25)) ** 2
    return bp(y + 0.3 * r.standard_normal(n) * 0.2, 200, 2500, 1) * np.sin(np.pi * t / d) * 0.5


def tie(r=None):   # rope lashing a bamboo pole: rustle + knock
    r = r or rng(201); d = 0.35; t = tt(d); n = len(t)
    return bp(r.standard_normal(n), 800, 5000, 1) * np.exp(-t / 0.12) * 0.4 + modal(d, [(520, 0.6, 0.05), (900, 0.3, 0.03)], r)


def thud(r=None):  # a dud bomb hitting earth
    r = r or rng(202); d = 1.2; t = tt(d); n = len(t)
    body = np.sin(phase(70 * (1 + 0.8 * np.exp(-t / 0.03)))) * np.exp(-t / 0.18)
    dirt = lp(r.standard_normal(n), 1200, 2) * np.exp(-t / 0.25) * 0.6
    return fades(body * 0.9 + dirt, 0.001, 0.1)


def switch(r=None):
    r = r or rng(203); return click(r, 1800) * 1.2 + click(r, 4000) * 0.4


def whistle_fall(d=1.2, r=None):  # falling bomb whistle
    t = tt(d); f = 1800 * np.exp(-t / d * 1.2) + 300
    return fades(np.sin(phase(f)) * np.minimum(1, t / 0.2) * 0.25, 0.01, 0.05)


def cloth_swoosh(d=1.6, r=None):
    r = r or rng(204); t = tt(d); n = len(t)
    return lp(r.standard_normal(n), 2500, 2) * (0.5 + 0.5 * smooth_noise(n, r, 6)) * np.sin(np.pi * t / d) ** 1.5 * 0.6


def scratch(d=1.6, r=None):
    r = r or rng(205); t = tt(d); n = len(t)
    e = np.maximum(0, np.sin(TAU * 5 * t)) ** 2
    return bp(r.standard_normal(n), 2500, 8000, 2) * e * 0.35


def boom_far(r=None):
    r = r or rng(206); d = 2.0; t = tt(d); n = len(t)
    return lp(r.standard_normal(n), 300, 2) * np.exp(-t / 0.5) * (1 - np.exp(-t / 0.01)) * 1.2


def sparkle_snd(r=None):
    r = r or rng(207); y = np.zeros(ns(0.8))
    for k, f in enumerate([2093, 2637, 3136, 4186]): x = plink(f, rng(k + 300), 0.5); i = ns(k * 0.07); y[i:i + len(x)] += x[: len(y) - i]
    return y


W = lambda p, a=-1: P(p, a)
music = np.zeros((2, N)); sfx = np.zeros((2, N)); amb = np.zeros((2, N))

def ev(x, t, g=0.0, p=0.0):
    place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t, dbg(g))
def beep(f=780, d=0.08, r=None):
    t = tt(d); return fades(np.sin(TAU * f * t) * 0.35, 0.003, 0.01)
def morse(t0, seq, g=-14):
    t = t0
    for c in seq:
        d = 0.07 if c == "." else 0.2
        ev(beep(760, d), t, g, 0.2); t += d + 0.07
def pump(r=None):   # one stroke of a foot pump: soft hiss + creak
    r = r or rng(400); d = 0.45; t = tt(d); n = len(t)
    return bp(r.standard_normal(n), 1500, 6000, 1) * np.sin(np.pi * t / d) ** 2 * 0.35
def rumble(dur, r=None, f=46):   # tank engine + track clatter
    r = r or rng(401); t = tt(dur); n = len(t)
    y = lp(np.sign(np.sin(phase(f * (1 + 0.05 * smooth_noise(n, r, 1))))) * 0.6 + colored(n, r, -1.5) * 0.8, 380, 2)
    clat = bp(r.standard_normal(n), 1500, 5000, 1) * (np.maximum(0, np.sin(TAU * 7 * t)) ** 8) * 0.5
    return (y + clat) * np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8)
def crowd(dur, r=None):   # men cheering
    r = r or rng(402); t = tt(dur); n = len(t)
    y = sum(bp(r.standard_normal(n), 300 + 180 * k, 900 + 300 * k, 1) * (0.5 + 0.5 * smooth_noise(n, r, 3 + k)) for k in range(5))
    return widen(y * np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.8) * 0.35, r, 13, 0.9)
def shell(t0, g=-4, p=0.0):
    ev(whistle_fall(0.9, rng(int(t0 * 100))), t0 - 0.9, g - 8, p); ev(boom_far(rng(int(t0 * 10) + 1)), t0, g, p); ev(thud(rng(int(t0 * 10) + 2)), t0, g - 2, p)
def hiss(dur, r=None):
    r = r or rng(403); t = tt(dur); n = len(t)
    return hp(r.standard_normal(n), 3000) * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.3) * 0.25


def chug(dur, r=None):   # steam train chuffs
    r = r or rng(600); t = tt(dur); n = len(t)
    y = bp(r.standard_normal(n), 300, 2500, 1) * (np.maximum(0, np.sin(TAU * 3.2 * t)) ** 6)
    return y * np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.6) * 0.6
def whistle(dur=1.2, f=880, r=None):   # steam / police whistle
    t = tt(dur); y = sum(np.sin(TAU * f * k * t + 0.3 * np.sin(TAU * 28 * t)) / k for k in (1, 2, 3)) * 0.2
    return fades(y, 0.05, 0.2)
def typing(dur, r=None):
    r = r or rng(601); y = np.zeros(ns(dur)); t = 0.0
    while t < dur - 0.05:
        c = clank(0.3, rng(int(t * 100) + 7), 1800 + 400 * r.random()); i = ns(t); m = min(len(c), len(y) - i); y[i:i + m] += c[:m] * 0.5; t += 0.07 + 0.08 * r.random()
    return y
def murmur(dur, r=None):
    r = r or rng(602); t = tt(dur); n = len(t)
    y = sum(bp(r.standard_normal(n), 200 + 120 * k, 600 + 200 * k, 1) * (0.4 + 0.6 * smooth_noise(n, r, 2 + k)) for k in range(4))
    return widen(y * np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6) * 0.2, r, 11, 0.8)
def coin(r=None):
    a = glock(m2f(96), 0.6, r or rng(603), dur=0.8); b = glock(m2f(100), 0.4, rng(604), dur=0.8); n = min(len(a), len(b)); return a[:n] + b[:n]

# ----# ---------------- SFX timeline ----------------
def squish(r=None):   # squeezing a lemon
    r = r or rng(700); t = tt(0.35); n = len(t)
    return bp(r.standard_normal(n), 800, 4000, 1) * np.sin(np.pi * t / 0.35) ** 2 * 0.4
def shutter(r=None):
    return clank(0.7, r or rng(701), 2500) + 0
def phone_ring(dur=1.2):
    t = tt(dur); y = (np.sin(TAU * 480 * t) + np.sin(TAU * 440 * t)) * 0.15 * (np.sin(TAU * 20 * t) > 0)
    return fades(y, 0.01, 0.05)
def siren(dur=2.5):
    t = tt(dur); f = 700 + 250 * np.sin(TAU * 0.9 * t); y = np.sin(phase(f)) * 0.18
    return fades(y, 0.2, 0.4)

def snore(dur, r=None):
    r = r or rng(900); t = tt(dur); n = len(t)
    return lp(r.standard_normal(n), 500, 2) * (np.maximum(0, np.sin(TAU * 0.7 * t)) ** 3) * 0.9
def footsteps(t0, n, step=0.42, g=-18, soft=False):
    for k in range(n): ev(tok(rng(910 + k + int(t0 * 10))), t0 + k * step, g - (6 if soft else 0), 0.1 * (-1) ** k)
def tick(t0, dur, g=-20):
    t = t0; k = 0
    while t < t0 + dur: ev(click(rng(930 + k), 2600 if k % 2 else 3000), t, g, 0.2); t += 0.5; k += 1
def chirp(t0, g=-18):
    for k in range(4): ev(glock(m2f(98 + (k % 2) * 3), 0.25, rng(950 + k), dur=0.15), t0 + k * 0.08, g, 0.5)
def flutter(t0, n, g=-22):
    for k in range(n): ev(whoosh(0.25, rng(960 + k)), t0 + k * 0.4, g, 0.3 * (-1) ** k)
def rattle(dur, r=None):
    r = r or rng(980); y = np.zeros(ns(dur)); step = int(SR / 11)
    for j in range(0, len(y) - 3000, step):
        b = r.standard_normal(2600) * np.exp(-np.arange(2600) / 380); y[j:j + 2600] += bp(b, 300, 4000, 1) * (0.8 + 0.2 * r.random())
    return y * 0.7
def boing(f0=220, dur=0.5):
    t = tt(dur); f = f0 * (1 + 0.35 * np.sin(TAU * 9 * t) * np.exp(-t * 4)); ph = np.cumsum(f) / SR
    return np.sin(TAU * ph) * np.exp(-t * 5) * 0.6
def ping(f0=2800, r=None):
    t = tt(0.5); f = f0 * (1 - 0.5 * t); ph = np.cumsum(f) / SR
    return np.sin(TAU * ph) * np.exp(-t * 9) * 0.5
def rumble(dur, r=None):
    r = r or rng(985); n = ns(dur); y = lp(r.standard_normal(n), 220, 2) * (0.6 + 0.4 * np.abs(np.sin(TAU * 4.5 * np.arange(n) / SR)))
    env = np.minimum(1, np.arange(n) / (0.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.5 * SR)); return y * env * 1.5
def engine(dur, r=None):
    t = tt(dur); y = np.sign(np.sin(TAU * 38 * t)) * 0.4 + 0.3 * np.sin(TAU * 76 * t); return lp(y, 600, 2) * (0.7 + 0.3 * np.sin(TAU * 3 * t)) * 0.5
def plop(r=None):
    t = tt(0.35); f = 180 * (1 - 0.6 * t); ph = np.cumsum(f) / SR
    r = r or rng(970); return (np.sin(TAU * ph) * np.exp(-t * 14) * 0.7 + lp(r.standard_normal(len(t)), 900, 2) * np.exp(-t * 30) * 0.5)
def splat2(r=None):
    r = r or rng(971); t = tt(0.4); return lp(r.standard_normal(len(t)), 1400, 2) * np.exp(-t * 12) * 0.9 + np.sin(TAU * 90 * t) * np.exp(-t * 20) * 0.5
def chomp(r=None):
    r = r or rng(972); t = tt(0.25); return bp(r.standard_normal(len(t)), 300, 2500, 1) * np.exp(-t * 25) * 0.9
def gulp():
    t = tt(0.3); f = 300 - 500 * t; ph = np.cumsum(f) / SR; return np.sin(TAU * ph) * np.exp(-t * 8) * 0.5
def bleargh(dur=1.0, r=None):
    r = r or rng(973); t = tt(dur); f = 140 + 40 * np.sin(TAU * 7 * t); ph = np.cumsum(f) / SR
    return (lp(r.standard_normal(len(t)), 700, 2) * 0.8 + np.sign(np.sin(TAU * ph)) * 0.25) * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.2) * 0.8
def flap(r=None):
    r = r or rng(974); t = tt(0.18); return lp(r.standard_normal(len(t)), 600, 2) * np.exp(-t * 30) * 0.8
def cluck(r=None):
    t = tt(0.12); return np.sign(np.sin(TAU * 900 * t)) * np.exp(-t * 40) * 0.25
def crickets(dur, r=None):
    t = tt(dur); return np.sin(TAU * 4200 * t) * (np.sin(TAU * 30 * t) > 0.6) * (np.sin(TAU * 1.2 * t) > 0) * 0.08
from instruments import snare_roll

# ================================================================ new SFX for Mike
def heartbeat(r=None):
    r = r or rng(1500); y = np.zeros(ns(0.6))
    for k, a in enumerate([0, 0.18]):
        t = tt(0.3); b = np.sin(phase(58 * (1 + 0.5 * np.exp(-t / 0.02)))) * np.exp(-t / 0.08) * (1.0 if k == 0 else 0.7)
        i = ns(a); y[i:i + len(b)] += b[: len(y) - i]
    return y * 0.9
def cork(r=None):
    t = tt(0.25); f = 900 * np.exp(-t / 0.04) + 300
    return fades(np.sin(phase(f)) * np.exp(-t / 0.05) * 0.6 + hp((r or rng(1501)).standard_normal(len(t)), 2500) * np.exp(-t / 0.006) * 0.5, 0.0005, 0.03)
def flashpop(r=None):
    r = r or rng(1502); t = tt(0.7); n = len(t)
    pop = hp(r.standard_normal(n), 1200) * np.exp(-t / 0.012) * 0.9
    whine = np.sin(phase(2600 + 1800 * t)) * np.exp(-t / 0.35) * 0.08
    return fades(pop + whine, 0.0003, 0.05)
def crow_gurgle(dur=0.9, r=None):
    r = r or rng(1503); t = tt(dur); n = len(t)
    f = 260 + 220 * np.sin(np.pi * t / dur) + 40 * np.sin(TAU * 11 * t) + 25 * smooth_noise(n, r, 20)
    y = (np.sin(phase(f)) + 0.5 * np.sign(np.sin(phase(f * 1.5)))) * (0.6 + 0.4 * np.abs(np.sin(TAU * 7 * t)))
    y = bp(y + 0.6 * r.standard_normal(n) * (0.5 + 0.5 * smooth_noise(n, r, 14)), 250, 2600, 2)
    return y * np.sin(np.pi * t / dur) ** 0.8 * 0.5
def buzz(dur, r=None):
    t = tt(dur); y = (np.sign(np.sin(TAU * 120 * t)) * 0.3 + np.sin(TAU * 240 * t) * 0.2) * (0.8 + 0.2 * (np.sin(TAU * 0.7 * t) > -0.9))
    return lp(y, 1800, 2) * np.minimum(1, t / 0.1) * np.minimum(1, (dur - t) / 0.2) * 0.25
def wind(dur, r=None):
    r = r or rng(1504); n = ns(dur); return lp(colored(n, r, -1.5), 900) * (0.6 + 0.4 * smooth_noise(n, r, 0.4)) * 0.5
def slide(f0, f1, dur=0.45):
    t = tt(dur); f = f0 * (f1 / f0) ** (t / dur); return fades(np.sin(phase(f)) * 0.35 * (1 + 0.15 * np.sin(TAU * 6 * t)), 0.01, 0.06)
def cheer(dur, r=None):
    r = r or rng(1505); t = tt(dur); n = len(t)
    y = sum(bp(r.standard_normal(n), 350 + 220 * k, 1100 + 400 * k, 1) * (0.5 + 0.5 * smooth_noise(n, r, 5 + k)) for k in range(6))
    whoo = sum(np.sin(phase(600 + 300 * k + 120 * smooth_noise(n, r, 2 + k))) * (smooth_noise(n, r, 1.5 + k) > 0.6) * 0.06 for k in range(3))
    return widen((y * 0.3 + whoo) * np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.6), r, 19, 0.9)
def confetti_pop(r=None):
    r = r or rng(1506); t = tt(0.3); return hp(r.standard_normal(len(t)), 800) * np.exp(-t / 0.02) * 0.7 + bp(r.standard_normal(len(t)), 3000, 9000, 1) * (r.random(len(t)) < 0.03) * np.exp(-t / 0.15)
def birds(dur, r=None):
    r = r or rng(1507); y = np.zeros(ns(dur)); t = 0.3
    while t < dur - 0.4:
        for k in range(3):
            c = glock(m2f(100 + int(r.integers(0, 5))), 0.15, rng(int(t * 100) + k), dur=0.12); i = ns(t + k * 0.06); m = min(len(c), len(y) - i); y[i:i + m] += c[:m]
        t += 0.9 + r.random() * 1.6
    return y
def peck_tap(r=None):
    return modal(0.15, [(1900, 1, 0.012), (3100, 0.5, 0.008)], r or rng(1508)) * 0.6

music = np.zeros((2, N)); sfx = np.zeros((2, N)); amb = np.zeros((2, N))
def ev(x, t, g=0.0, p=0.0):
    place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t, dbg(g))
Wd = lambda p, a=-1: P(p, a)
T = {k: Wd(*v) if isinstance(v, tuple) else Wd(v) for k, v in dict(
    man="this man", toy="toy", real="A real", plane="plane", says="Guinness says", sawed="sawed", bite="bite-sized", drank="drank", whole=("whole", 9.0),
    took="It took", years="years", stage="His stage", mister="Mister", all_="All", meant2=("meant", 14.8), starters="For starters", bikes="Bicycles", lots="Lots of",
    main="Main course", shopping="Shopping", dessert="Dessert", few="A few", yum="Yum", crunchy="crunchy", plus="Plus a", skis="skis", chand="chandelier",
    coffin="coffin", handles="Handles", doctors="Doctors", checked="checked", confused="confused", hehad="He had", pica="pica", craving="A craving", food="food",
    wait="But wait", worse="worse", gave="Guinness gave", record="record", strangest="strangest", shiny="shiny", plaque="plaque", so=("So", 43.0), ate=("plaque", 44.0),
    please="Please", seriously="Seriously", now="Now the", craziest="craziest", bananas="Bananas", sick="sick", eggs="Hard-boiled", also="Also", sick2=("sick", 53.8), but="But you").items()}
END = DUR

# ---------------- SFX timeline ----------------
# 1-2 hook: chomping already going (nothing stacked on the very first word at 0.39 s)
for k, a in enumerate([0.62, 1.22, 1.85]): ev(chomp(), a, -15, 0.1); ev(clank(0.4, rng(2000 + k), 1300), a + 0.02, -22, 0.1)
ev(chew(0.9, rng(2005)), T["man"] + 0.1, -20)
# 3 not a toy: a boing; 4 a real plane: propeller engine
ev(boing(330, 0.4), T["toy"] + 0.05, -14); place(sfx, pan(engine(T["says"] - T["real"] + 0.2, rng(2010)), 0.2), T["real"] - 0.05, dbg(-18))
# 5 Guinness says so: sparkle + ding
ev(sparkle_snd(rng(2011)), T["says"] + 0.1, -14); ev(glock(m2f(96), 0.7, rng(2012), dur=1.0), T["says"] + 0.95, -14)
# 6 the saw
ev(buzz(0.75, rng(2013)), T["sawed"], -10, 0.3); ev(scrape(0.7, rng(2014)), T["sawed"] + 0.05, -16, 0.3)
for k in range(3): ev(plink(1800 + 300 * k, rng(2015 + k), 0.6), T["bite"] + 0.1 + k * 0.14, -16, 0.3 * (-1) ** k)
# 8-9 oil + swallow
ev(gulp(), T["drank"] + 0.2, -10); ev(gulp(), T["drank"] + 0.55, -12); ev(gulp(), T["whole"] + 0.05, -8); ev(boing(160, 0.4), T["whole"] + 0.1, -16)
# 10 two years: whoosh + calendar flips
ev(whoosh(0.5, rng(2020)), T["took"] - 0.2, -18); ev(tok(rng(2021)), T["took"] + 0.4, -14); ev(tok(rng(2022)), T["took"] + 0.9, -14); ev(chew(1.2, rng(2023)), T["took"] + 0.1, -22)
# 11 marquee: crowd cheer on the name; 12 sparkle
place(amb, cheer(0.7, rng(2024)), T["mister"] - 0.1, dbg(-18)); ev(sparkle_snd(rng(2025)), T["meant2"] + 0.05, -22)
# 13-14 bikes: bike bell, chomps
ev(bell(rng(2030)), T["bikes"] + 0.05, -12); for_ = [ev(chomp(), T["lots"] + 0.15 + k * 0.5, -15) for k in range(2)]; ev(clank(0.7, rng(2031), 900), T["lots"] + 0.2, -18)
# 15 shopping cart rolls in and stops: rattle + clank
ev(rattle(0.6, rng(2032)), T["shopping"] - 0.15, -14, 0.4); ev(clank(1.0, rng(2033), 520), T["shopping"] + 0.5, -12, 0.2)
# 16-18 dessert: ding, TV static, the crunch
ev(glock(m2f(91), 0.6, rng(2034), dur=0.8), T["dessert"] + 0.1, -14)
place(amb, pan(hp(rng(2035).standard_normal(ns(T["plus"] - T["few"])), 2500) * 0.08, 0), T["few"] - 0.1, dbg(-8))
ev(chomp(), T["crunchy"] - 0.12, -8); ev(clank(1.0, rng(2036), 1500), T["crunchy"] - 0.1, -12); ev(splat2(), T["crunchy"], -16)
# 19-20 skis whoosh, chandelier tinkle
ev(whoosh(0.4, rng(2040)), T["skis"] - 0.1, -14); ev(sparkle_snd(rng(2041)), T["chand"], -14)
# 21-22 coffin: low timpani-ish thud, gasp boing; handles snapping
ev(thud(rng(2042)), T["coffin"] + 0.05, -10); ev(boing(110, 0.6), T["coffin"] + 0.2, -16)
for k in range(3): ev(clank(0.8, rng(2043 + k), 700 + 150 * k), T["handles"] - 0.1 + 0.35 * (k + 1), -12, 0.2 * (-1) ** k); ev(chew(1.0, rng(2047)), T["handles"] + 0.3, -20)
# 23-24 doctors: heartbeat, then a confused slide
for k in range(2): ev(heartbeat(rng(2050 + k)), T["checked"] + k * 0.6, -12)
ev(slide(900, 300, 0.5), T["confused"] + 0.05, -14)
# 25-26 pica: ping; craving: drool plinks, boing on "food"
ev(ping(2600, rng(2052)), T["pica"] + 0.05, -14); for_ = [ev(plink(1500, rng(2053 + k), 0.4), T["craving"] + 0.4 + k * 0.5, -20) for k in range(3)]; ev(boing(260, 0.3), T["food"] + 0.1, -16)
# 27 But wait: whoosh in
ev(whoosh(0.35, rng(2060)), T["wait"] - 0.25, -12)
# 28-29 the award: cheer, confetti, sparkle
place(amb, cheer(T["so"] - T["record"], rng(2061)), T["record"] - 0.1, dbg(-4)); for_ = [ev(confetti_pop(rng(2062 + k)), T["record"] + 0.05 + k * 0.33, -16, 0.5 * (-1) ** k) for k in range(5)]
ev(sparkle_snd(rng(2070)), T["shiny"], -12)
# 30 he eats the plaque: CHOMP + metal clank, crowd hushes
ev(chomp(), T["ate"] - 0.03, -6); ev(clank(1.0, rng(2071), 1100), T["ate"] - 0.02, -10); ev(slide(700, 200, 0.6), T["ate"] + 0.4, -18)
# 31-32 warning: two beeps; Seriously: thud
ev(beep(880, 0.12), T["please"] + 0.6, -16); ev(beep(880, 0.12), T["please"] + 0.85, -16); ev(thud(rng(2072)), T["seriously"] + 0.02, -12)
# 34-36 sick: bleargh, plop, slide
ev(bleargh(0.7, rng(2073)), T["sick"] + 0.15, -12); ev(plop(rng(2074)), T["eggs"] + 0.1, -14); ev(bleargh(0.6, rng(2075)), T["sick2"] + 0.1, -12); ev(slide(500, 180, 0.6), T["also"] + 0.1, -18)
# 37 loop: whoosh into the first chomp
ev(whoosh(0.3, rng(2080)), END - 0.24, -20)
# airfield ambience
place(amb, birds(END, rng(2090)), 0.0, dbg(-16)); place(amb, pan(wind(END, rng(2091)) * 0.5, 0), 0.0, dbg(-12))

# ---------------- SCORE (original): a cheeky French café polka in C, 132 bpm (accordion-ish pad + plucks + tuba + brushes) ----------------
BPM = 132; BEAT = 60 / BPM
def note(fn, m, t, vel, g=0.0, p=0.0, **kw):
    place(music, pan(fn(m2f(m), vel, rng(int(t * 1000) % 99991), **kw), p), t, dbg(g))
def chord_pad(ms, t, dur, vel=0.5, g=0.0, warm=900):
    if dur > 0.2: place(music, pad([m2f(m) for m in ms], dur, vel, rng(int(t * 10)), att=0.05, rel=0.3, warm=warm), t, dbg(g))
def horn(m, t, vel, g, d, kind="horn", p=0.0): place(music, pan(brass(m2f(m), d, vel, rng(int(t * 997) % 99991), kind=kind), p), t, dbg(g))
PROG = [(48, [60, 64, 67]), (43, [59, 62, 67]), (48, [60, 64, 67]), (41, [60, 65, 69]), (43, [59, 62, 65])]
def oompah(a, b, g=-13, prog=PROG):
    t = a; k = 0
    while t < b - 0.05:
        root, tones = prog[(k // 4) % len(prog)]
        if k % 2 == 0: horn(root - 12 + (7 if k % 4 == 2 else 0), t, 0.6, g, BEAT * 0.6, "tuba")
        else: chord_pad(tones, t, BEAT * 0.55, 0.4, g - 3, warm=1800)
        t += BEAT; k += 1
def brushes(a, b, g=-20):
    t = a; k = 0
    while t < b - 0.05:
        place(music, pan(snare(0.16 + (0.14 if k % 2 else 0), rng(k + int(a * 10)), tune=1.1, snappy=0.25), 0.2), t, dbg(g)); t += BEAT; k += 1
TUNE = [(72, 0.5), (71, 0.5), (72, 0.5), (76, 0.5), (79, 1), (76, 1), (77, 0.5), (76, 0.5), (74, 0.5), (71, 0.5), (74, 2), (71, 0.5), (72, 0.5), (74, 0.5), (77, 0.5), (76, 1), (72, 1), (74, 0.5), (72, 0.5), (71, 0.5), (67, 0.5), (72, 2)]
def tune(a, b, fn=pluck, g=-15, vel=0.5, tr=0):
    t = a
    while t < b - 0.05:
        for m, d in TUNE:
            if t >= b - 0.05: return
            if fn is pluck: note(pluck, m + tr, t, vel, g, -0.2, dur=0.45, bright=0.75, pos=0.12)
            else: note(fn, m + tr, t, vel, g, -0.2, dur=min(1.4, d * BEAT * 1.4))
            t += d * BEAT
# the whole piece runs under everything; sections change colour on the big beats
oompah(0.45, T["wait"] - 0.05); brushes(0.45, T["wait"] - 0.05); tune(0.6, T["stage"] - 0.1, pluck, -15, 0.5)
tune(T["stage"], T["doctors"] - 0.1, vibes, -16, 0.45); tune(T["starters"], T["doctors"] - 0.1, pluck, -17, 0.4, 12)
for m in (60, 64, 67, 72): horn(m, T["mister"] - 0.02, 0.5, -19, 0.35)
place(music, pan(timpani(m2f(36), 0.8, rng(2100)), 0), T["coffin"], dbg(-13))
tune(T["doctors"], T["wait"] - 0.1, glock, -19, 0.35)
# But wait: a stop, timpani, then a sneaky minor walk until the award
place(music, pan(timpani(m2f(40), 0.9, rng(2101)), 0), T["wait"], dbg(-10)); place(music, pan(cymbal(0.5, rng(2102), dur=1.2), 0), T["wait"], dbg(-18))
SNK = [57, 60, 64, 60, 57, 60, 63, 62]; t = T["wait"] + 0.3; k = 0
while t < T["gave"] - 0.1: note(pluck, SNK[k % 8], t, 0.55, -14, 0.1, dur=0.25, bright=0.5, pos=0.3); t += BEAT / 2; k += 1
# the award: fanfare and the polka back, bigger
for m in (60, 64, 67, 72): horn(m, T["gave"] - 0.02, 0.7, -11, 0.7)
oompah(T["gave"], T["please"] - 0.1, -12); brushes(T["gave"], T["please"] - 0.1, -18); tune(T["gave"] + 0.1, T["please"] - 0.1, brass, -14, 0.5, -12) if False else tune(T["gave"] + 0.1, T["please"] - 0.1, vibes, -14, 0.5)
# warning: stern low brass; then a snare roll into "the craziest part"
for j, m in enumerate([48, 47, 46]): horn(m, T["please"] + j * 0.5, 0.6, -14, 0.45, "tuba")
for t0, v in snare_roll(T["now"], T["bananas"] - 0.05, 0.2, 0.8, rng(2110), 26): place(music, pan(snare(v, rng(int(t0 * 1000)), dur=0.15, tune=1.0, snappy=0.7), 0.1), t0, dbg(-14))
# sick: woozy detuned pad, then the polka creeps back for the loop
chord_pad([56, 60, 63], T["bananas"], T["but"] - T["bananas"], 0.35, -18, warm=600)
for j, m in enumerate([67, 66, 65, 64]): note(vibes, m, T["bananas"] + 0.3 + j * 0.6, 0.35, -18, 0.1, dur=0.8)
oompah(T["but"] - 0.05, END + 0.1, -17); brushes(T["but"] - 0.05, END + 0.1, -23); tune(T["but"], END + 0.1, pluck, -19, 0.45)

# ============================================================ mix
music = music + 0.16 * convolve_st(music[0] * 0.5 + music[1] * 0.5, make_ir(1.3, 11))
sfx = sfx + 0.08 * convolve_st(sfx[0] * 0.5 + sfx[1] * 0.5, make_ir(0.8, 12))
# hush the bed under "Eat… All. And he meant it." so every word stays clear
gate = np.ones(N); g0, g1 = ns(T["mister"] - 0.1), ns(T["starters"] - 0.05); gate[g0:g1] = 0.3; gate = ndimage.uniform_filter1d(gate, ns(0.08)); music *= gate[None, :]; amb *= gate[None, :]
v, sr = read_wav(os.path.join(ROOT, "voice", "voice.wav")); assert sr == SR
vv = np.zeros(N); vv[: min(N, v.shape[1])] = v[0][:N]; voice = st(vv)
ctrl = 1000; nc = int(DUR * ctrl) + 2; va = np.zeros(nc)
for w in WORDS: va[max(0, int((w["start"] - 0.08) * ctrl)): int((w["end"] + 0.15) * ctrl)] = 1
env = np.zeros(nc); e = 0.0; ka, kr = 1 - np.exp(-1 / 70), 1 - np.exp(-1 / 450)
for i in range(nc): e += (va[i] - e) * (ka if va[i] > e else kr); env[i] = e
duck = np.interp(np.arange(N) / SR, np.arange(nc) / ctrl, env)
Lv = integrated(voice)
music *= dbg((Lv - 13.0) - integrated(music)); music *= dbg(-6.0 * duck)[None, :]
sfx *= dbg((Lv - 7.0) - integrated(sfx))
amb *= dbg((Lv - 20.0) - integrated(amb)); amb *= dbg(-4.0 * duck)[None, :]
music *= dbg(3.0); sfx *= dbg(-6.0)
mix = voice + music + sfx + amb
fe = ns(0.04); mix[:, -fe:] *= np.linspace(1, 0, fe)[None, :]; mix[:, :ns(0.01)] *= np.linspace(0, 1, ns(0.01))[None, :]
mix *= dbg(-14.0 - integrated(mix))
from scipy import signal
c = dbg(-1.2); up = np.abs(signal.resample_poly(mix, 4, 1, axis=-1)).max(0)
pk = np.pad(up, (0, max(0, 4 * N - len(up))))[: 4 * N].reshape(N, 4).max(1)
g = ndimage.minimum_filter1d(np.minimum(1, c / np.maximum(pk, 1e-12)), ns(0.006), mode="nearest")
g = np.minimum(1, ndimage.uniform_filter1d(g, ns(0.006), mode="nearest")); g = np.minimum(g, ndimage.minimum_filter1d(np.minimum(1, c / np.maximum(pk, 1e-12)), 3))
mix *= g[None, :]
out = os.path.join(ROOT, "out"); os.makedirs(out, exist_ok=True)
write_wav(os.path.join(out, "airplane_mix.wav"), mix); write_wav(os.path.join(out, "stem_music.wav"), music); write_wav(os.path.join(out, "stem_sfx.wav"), sfx + amb)
print(f"duration {N / SR:.3f}s  integrated {integrated(mix):.1f} LUFS  true peak {true_peak(mix):.2f} dBTP  voice {Lv:.1f}  music {integrated(music):.1f}  sfx {integrated(sfx):.1f}")
