# Soundtrack for "He Won Olympic Gold on Rat Poison" (1904 marathon): original score + synthesized SFX + the voice, timed to words.json
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
TOTAL = 1020
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

# ================================================================ new SFX for the bunnies
def squeak(r=None, f=2400):
    t = tt(0.12); return np.sin(phase(f * (1 + 0.4 * np.sin(np.pi * t / 0.12)))) * np.sin(np.pi * t / 0.12) * 0.25
def thump(r=None):   # a bunny landing on grass
    t = tt(0.12); return (np.sin(phase(110 * np.exp(-t / 0.05) + 60)) * np.exp(-t / 0.03) * 0.6 + lp((r or rng(2100)).standard_normal(len(t)), 600, 2) * np.exp(-t / 0.02) * 0.4)
def hops(t0, dur, rate=9.0, g=-20, seed=0):
    r = rng(2200 + seed); t = t0
    while t < t0 + dur: ev(thump(rng(int(t * 1000) % 99991)), t, g + 3 * r.random(), 0.6 * (r.random() - 0.5)); t += (0.5 + r.random()) / rate
def whip(r=None):
    r = r or rng(2300); t = tt(0.2); return hp(r.standard_normal(len(t)), 2500) * np.exp(-t / 0.008) * 1.0 + np.sin(phase(1800 - 6000 * t)) * np.exp(-t / 0.02) * 0.2
def gallop(t0, dur, g=-14):
    t = t0; k = 0
    while t < t0 + dur:
        for d in (0, 0.07, 0.14): ev(tok(rng(2400 + k)), t + d, g - (k % 3) * 2, 0.2); k += 1
        t += 0.42
def wahwah(t0, g=-11):   # sad trombone, original line
    for j, (m, d) in enumerate([(58, 0.32), (57, 0.32), (56, 0.32), (55, 0.9)]):
        place(music, pan(brass(m2f(m - 12), d, 0.75, rng(2500 + j), kind="horn", fall=0.0 if j < 3 else -0.6), 0.0), t0 + j * 0.34, dbg(g))

music = np.zeros((2, N)); sfx = np.zeros((2, N)); amb = np.zeros((2, N))
def ev(x, t, g=0.0, p=0.0):
    place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t, dbg(g))

# ================================================================ new SFX for the pig war
def oink(r=None, f0=170, dur=0.22):   # a cartoon snort: buzzy nasal grunt through two formants
    r = r or rng(3000); t = tt(dur); f = f0 * (1 + 0.25 * np.sin(np.pi * t / dur))
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    x = bp(saw, 450, 1000) * 1.0 + bp(saw, 1100, 1800) * 0.5 + bp(r.standard_normal(len(t)), 700, 1300) * 0.15
    return x * np.sin(np.pi * t / dur) ** 0.6 * 0.9
def musket(r=None):   # a black-powder bang: crack + low boom + smoky tail
    r = r or rng(3010); t = tt(1.2)
    crack = hp(r.standard_normal(len(t)), 1200) * np.exp(-t / 0.012)
    boom = lp(r.standard_normal(len(t)), 300, 2) * np.exp(-t / 0.25) * 1.4 + np.sin(phase(70 * np.exp(-t / 0.2) + 35)) * np.exp(-t / 0.15)
    return (crack * 0.9 + boom) * 0.7
def waves(dur, r=None):   # gentle surf on the beach
    r = r or rng(3020); n = ns(dur); x = lp(r.standard_normal(n), 900, 2)
    sw = 0.55 + 0.45 * np.sin(TAU * np.arange(n) / SR / 3.7) ** 2
    return x * sw * 0.5
def gavel(r=None):
    a, b = tok(r or rng(3030)) * 1.4, thud(rng(3031)) * 0.5; n = max(len(a), len(b))
    return np.pad(a, (0, n - len(a))) + np.pad(b, (0, n - len(b)))
def march_steps(t0, dur, rate=2.2, g=-20, seed=0):
    t = t0; k = 0
    while t < t0 + dur:
        ev(thud(rng(3100 + seed * 50 + k)) * 0.5, t, g, 0.3 * (-1) ** k); t += 1 / rate; k += 1


# ================================================================ new SFX for the 1904 marathon
def cough(r=None):   # two dry coughs
    r = r or rng(4100); y = np.zeros(ns(0.5))
    for k, t0 in enumerate((0.0, 0.22)):
        t = tt(0.16); c = bp(r.standard_normal(len(t)), 350, 2600, 2) * np.exp(-t * 22) * (1 - np.exp(-t * 400)) + np.sin(TAU * (170 - 80 * t) * t) * np.exp(-t * 25) * 0.4
        i = ns(t0); y[i:i + len(c)] += c[: len(y) - i] * (1 - 0.2 * k)
    return y * 0.9
def bubble(r=None, f=500):
    t = tt(0.12); ff = f * (1 + 2.5 * t / 0.12); return np.sin(phase(ff)) * np.sin(np.pi * t / 0.12) * 0.35
def crack(r=None):   # an egg cracking
    r = r or rng(4101); t = tt(0.18); m = modal(0.15, [(1800, 1, 0.02), (2900, 0.5, 0.01)], r); y = hp(r.standard_normal(len(t)), 2500) * np.exp(-t * 40) * 0.8; y[:len(m)] += m[:len(y)] * 0.3; return y
def toot(t0, f=420, g=-14, p=0.0):   # a 1904 bulb horn: two honks
    ev(horn_car(f, 0.16, rng(int(t0 * 100))), t0, g, p); ev(horn_car(f * 0.94, 0.22, rng(int(t0 * 100) + 1)), t0 + 0.2, g, p)
def chug_car(dur, r=None):   # a little single-cylinder putter
    t = tt(dur); y = np.sign(np.sin(TAU * 11 * t)) * 0.3 + lp((r or rng(4102)).standard_normal(len(t)), 500, 2) * (0.5 + 0.5 * (np.sin(TAU * 11 * t) > 0.6))
    return lp(y, 900, 2) * np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15) * 0.6

Wd = lambda p, a=-1: P(p, a)
T = {k: Wd(*v) if isinstance(v, tuple) else Wd(v) for k, v in dict(
    gold="gold", on="on", poison="poison", worst="The worst", ever="ever", boiling="Boiling", heat="heat", choking="Choking", dust="dust",
    arunner="A runner", cramps="cramps", sohops="so he hops", hops="hops", car="car", waves="He waves", aswhe="as he", past="past",
    breaks="The car breaks", down="down", jogs="so he jogs", pres="The President's", crowns="crowns", then="Then", snitches="snitches",
    meanwhile="Meanwhile", mailman="mailman", eats="eats", apples="apples", andtakes="and takes", nap="nap", butthe="But the", winner="winner",
    coaches="His coaches", brandy="brandy", egg="egg", strych="strychnine", rat=("Rat poison", 25), halluc="Hallucinating", heldup="held up",
    wins="he wins", soyes="So yes").items()}
T["poison2"] = Wd("poison", 25); T["wins1"] = Wd("wins")
END = DUR

# ---------------- SFX timeline ----------------
# 1-2 hook: the crowd roars (bed, from 0.5 s, nothing on the first word); two big glugs; a sparkle on "gold"; the rat squeaks and faints
place(amb, cheer(T["worst"] - 0.4, rng(4200)), 0.5, dbg(-12))
ev(gulp(), 0.62, -12); ev(gulp(), 1.05, -12); ev(sparkle_snd(rng(4201)), T["gold"] + 0.05, -13)
ev(squeak(rng(4202), 2600), T["poison"] - 0.05, -14, -0.3); ev(slide(900, 160, 0.4), T["poison"] + 0.42, -14); ev(thud(rng(4203)), T["poison"] + 0.8, -14)
# 3 the start: BANG, then the stampede
ev(musket(rng(4210)), T["worst"] + 0.02, -6)
footsteps(T["worst"] + 0.25, 8, 0.16, -20)
# 4 heat: sizzle
ev(sizzle(T["choking"] - T["boiling"] + 0.1, rng(4220)), T["boiling"] + 0.05, -16)
# 5 dust: the officials' car putters past, horn, whoosh, coughs
ev(chug_car(1.3, rng(4230)), T["choking"] - 0.1, -12, 0.2); toot(T["choking"] + 0.05, 440, -14, 0.3); ev(whoosh(0.7, rng(4231)), T["choking"] + 0.15, -14)
ev(cough(rng(4232)), T["dust"] + 0.25, -10, -0.2)
# 6 cramps: OW (a boing down + ratchet)
ev(ratchet(rng(4240)), T["cramps"] + 0.3, -16); ev(slide(700, 220, 0.35), T["cramps"] + 0.32, -14)
# 7 the hop into the car, engine starts
ev(boing(330, 0.45), T["hops"] + 0.02, -12); ev(thud(rng(4250)), T["hops"] + 0.38, -14)
ev(chug_car(T["breaks"] - T["car"] + 0.4, rng(4251)), T["car"] + 0.05, -14, 0.1)
# 8-9 waving, honking, whooshing past the runners
toot(T["waves"] + 0.25, 420, -13, 0.2); toot(T["past"] - 0.25, 400, -12, -0.3)
ev(whoosh(0.8, rng(4260)), T["aswhe"] + 0.3, -10, -0.3)
# 10 the breakdown: clank, hiss, a sad slide
ev(clank(1.0, rng(4270), 260), T["breaks"] + 0.02, -8); ev(hiss(1.0, rng(4271)), T["breaks"] + 0.12, -14); ev(slide(500, 200, 0.5), T["down"] + 0.1, -16)
# 11 jogging in (light footsteps)
footsteps(T["jogs"] + 0.1, 4, 0.3, -20, True)
# 12 crowned: a roar, confetti pop, sparkle
place(amb, cheer(T["then"] - T["pres"] + 0.4, rng(4280)), T["pres"], dbg(-8)); ev(confetti_pop(rng(4281)), T["crowns"] + 0.2, -10); ev(sparkle_snd(rng(4282)), T["crowns"] + 0.1, -14)
# 13 snitch: record scratch, gasp of the crowd as a thud
ev(slide(900, 160, 0.3), T["then"] - 0.05, -10); ev(thud(rng(4290)), T["snitches"] + 0.1, -9)
# 14-16 the mailman: running, munching, flies, snoring
footsteps(T["meanwhile"] + 0.1, 5, 0.27, -20)
for k in range(6): ev(chomp(rng(4300 + k)), T["eats"] + 0.1 + k * 0.22, -15, 0.2)
ev(buzz(T["andtakes"] - T["eats"] + 0.2, rng(4310)), T["eats"], -22, 0.4)
ev(snore(T["butthe"] - T["andtakes"] - 0.1, rng(4311)), T["andtakes"] + 0.3, -14)
# 17 the real winner: whoosh in
ev(whoosh(0.4, rng(4320)), T["butthe"] - 0.1, -14)
# 18-19 the recipe: glugs, egg crack + plop, drips and green bubbles
for k in range(3): ev(gulp(), T["brandy"] - 0.6 + k * 0.32, -13)
ev(crack(rng(4330)), T["egg"] + 0.0, -10); ev(plop(rng(4331)), T["egg"] + 0.28, -12)
for k in range(3): ev(plink(1500 + 300 * k, rng(4332 + k), 0.8), T["strych"] + 0.05 + k * 0.18, -16)
for k in range(8): ev(bubble(None, 380 + 60 * (k % 4)), T["strych"] + 0.4 + k * 0.08, -16, 0.3 * (-1) ** k)
# 20 the rat: squeak, NOPE, faint
ev(squeak(rng(4340), 2300), T["rat"] + 0.02, -12); ev(slide(900, 150, 0.4), T["poison2"] + 0.35, -14); ev(thud(rng(4341)), T["poison2"] + 0.65, -14)
# 21 hallucinating: woozy slides + sparkles
ev(slide(400, 900, 0.5), T["halluc"] + 0.05, -16, -0.4); ev(slide(900, 350, 0.5), T["halluc"] + 0.5, -16, 0.4); ev(sparkle_snd(rng(4350)), T["halluc"] + 0.2, -16)
# 22 held up: shuffling feet
footsteps(T["heldup"] + 0.05, 5, 0.22, -20, True)
# 23 the win: confetti pop + roar
ev(confetti_pop(rng(4360)), T["wins1"] + 0.02, -8); place(amb, cheer(END - T["wins1"] + 0.2, rng(4361)), T["wins1"], dbg(-8))
place(amb, pan(wind(DUR, rng(4370)) * 0.5, 0), 0.0, dbg(-14))

# ---------------- SCORE (original): a bouncy 1904 ragtime two-step in C at 126 bpm ----------------
BPM = 126; BEAT = 60 / BPM
def note(fn, m, t, vel, g=0.0, p=0.0, **kw):
    place(music, pan(fn(m2f(m), vel, rng(int(t * 1000) % 99991), **kw), p), t, dbg(g))
def chord_pad(ms, t, dur, vel=0.5, g=0.0, warm=900):
    if dur > 0.2: place(music, pad([m2f(m) for m in ms], dur, vel, rng(int(t * 10)), att=0.25, rel=0.6, warm=warm), t, dbg(g))
def horn(m, t, vel, g, d, kind="horn", p=0.0): place(music, pan(brass(m2f(m), d, vel, rng(int(t * 997) % 99991), kind=kind), p), t, dbg(g))
# I - VI7 - II7 - V7 roots and chord tones (ragtime circle)
RAG = [(36, [60, 64, 67]), (33, [61, 64, 69]), (38, [62, 66, 69]), (31, [62, 65, 71])]
def oompah(a, b, g=-12, bpm=BEAT):   # tuba on 1 + 3, plucked chord stabs on 2 + 4
    t = a; k = 0
    while t < b - 0.05:
        root, ch = RAG[(k // 4) % 4]
        if k % 2 == 0: horn(root + (7 if k % 4 == 2 else 0), t, 0.6, g, bpm * 0.5, "tuba")
        else:
            for m in ch: note(pluck, m, t, 0.35, g - 4, 0.1, dur=0.18, bright=0.6, pos=0.15)
        t += bpm; k += 1
def drums(a, b, g=-19, bpm=BEAT):
    t = a; k = 0
    while t < b - 0.05:
        place(music, pan(snare(0.35 if k % 2 else 0.18, rng(k + int(a * 10)), tune=1.15, snappy=0.8), 0.15), t, dbg(g))
        place(music, pan(brush(0.2, rng(k + 300)), -0.15), t + bpm / 2, dbg(g - 2)); t += bpm; k += 1
# syncopated tune (beats), original
RAGTUNE = [(72, 0.5), (76, 0.5), (79, 0.75), (76, 0.25), (81, 1), (79, 0.5), (76, 0.5), (74, 0.75), (72, 0.25), (74, 1),
           (71, 0.5), (74, 0.5), (77, 0.75), (74, 0.25), (79, 1), (77, 0.5), (74, 0.5), (71, 0.5), (67, 0.5), (72, 1)]
def tune(a, b, fn="pluck", g=-13, vel=0.55, tr=0, bpm=BEAT):
    t = a
    while t < b - 0.05:
        for m, d in RAGTUNE:
            if t >= b - 0.05: return
            if fn == "pluck": note(pluck, m + tr, t, vel, g, -0.2, dur=0.3, bright=0.75, pos=0.12)
            else: note(glock, m + tr, t, vel, g, 0.2, dur=0.7)
            t += d * bpm
# hook: a fanfare sting on "gold" (brass chord + glock), then the woozy minor drop on "poison"
for m in (60, 64, 67, 72): horn(m, T["gold"] + 0.02, 0.6, -14, 0.5)
for j, m in enumerate([84, 88, 91, 96]): note(glock, m, T["gold"] + 0.05 + j * 0.06, 0.5, -16, 0.2, dur=1.0)
for j, m in enumerate([63, 62, 61, 60]): horn(m - 12, T["on"] + 0.1 + j * 0.22, 0.55, -14, 0.24, "tuba")
chord_pad([48, 51, 55, 58], T["poison"], T["worst"] - T["poison"], 0.3, -20, warm=900)
# the race: ragtime two-step from the BANG until the snitch
oompah(T["worst"] + 0.05, T["then"], -12); drums(T["worst"] + 0.05, T["then"], -19); tune(T["worst"] + 0.05, T["then"], "pluck", -13, 0.55)
tune(T["sohops"], T["then"], "glock", -21, 0.3, 12)
for key in ("crowns",): place(music, pan(cymbal(0.5, rng(4400), dur=1.4), 0), T[key] + 0.02, dbg(-16))
# snitch: dead stop, two suspicious bassoon-ish brass notes
for j, m in enumerate([43, 44]): horn(m, T["snitches"] + 0.05 + j * 0.3, 0.55, -14, 0.26, "tuba")
# the mailman: a lazy habanera vamp (pluck) through the apples and the nap
HAB = [(0, 45), (0.75, 52), (1.0, 57), (1.5, 52)]
t = T["meanwhile"]; bar = 4 * BEAT * 0.5
while t < T["butthe"] - 0.1:
    for off, m in HAB:
        if t + off * BEAT < T["butthe"] - 0.1: note(pluck, m, t + off * BEAT, 0.5, -14, -0.1, dur=0.3, bright=0.4, pos=0.3)
    t += 2 * BEAT
for j, m in enumerate([69, 72, 76, 72, 69, 67]):
    if T["meanwhile"] + 0.2 + j * BEAT < T["andtakes"]: note(pluck, m, T["meanwhile"] + 0.2 + j * BEAT, 0.45, -15, 0.2, dur=0.3, bright=0.6, pos=0.15)
chord_pad([45, 52, 57, 60], T["andtakes"], T["butthe"] - T["andtakes"], 0.3, -19, warm=800)
# the real winner: ominous timpani + low brass, then a creepy chromatic pizzicato for the recipe
place(music, pan(timpani(m2f(31), 0.9, rng(4410)), 0), T["winner"] + 0.02, dbg(-8))
for m in (36, 43, 48, 51): horn(m, T["winner"] - 0.05, 0.55, -14, 0.9)
t = T["coaches"]; k = 0
CRP = [48, 49, 50, 51, 52, 51, 50, 49]
while t < T["halluc"] - 0.1: note(pluck, CRP[k % 8] + 12, t, 0.5, -15, 0.15 * (-1) ** k, dur=0.22, bright=0.4, pos=0.3); t += BEAT / 2; k += 1
place(music, pan(timpani(m2f(29), 0.8, rng(4411)), 0), T["strych"] + 0.02, dbg(-10))
# hallucinating: detuned glock wobble over a pad
for j in range(8): note(glock, [79, 83, 78, 82, 77, 81, 76, 80][j], T["halluc"] + j * 0.13, 0.4, -17, 0.4 * (-1) ** j, dur=0.6)
chord_pad([48, 52, 56, 59], T["halluc"], T["heldup"] - T["halluc"], 0.3, -19, warm=1400)
# held up -> win: the ragtime comes back big with brass, fanfare on "wins", soft roll into the loop
oompah(T["heldup"], T["soyes"], -11); drums(T["heldup"], T["soyes"], -17); tune(T["heldup"], T["soyes"], "pluck", -13, 0.6)
for m in (60, 64, 67, 72): horn(m, T["wins1"] + 0.02, 0.7, -12, 0.7)
place(music, pan(cymbal(0.7, rng(4420), dur=1.6), 0), T["wins1"] + 0.02, dbg(-13))
for t0, v in snare_roll(T["soyes"] - 0.05, END, 0.12, 0.4, rng(4430), 22): place(music, pan(snare(v, rng(int(t0 * 1000)), dur=0.15, tune=1.0, snappy=0.8), 0.1), t0, dbg(-17))

# ============================================================ mix
music = music + 0.16 * convolve_st(music[0] * 0.5 + music[1] * 0.5, make_ir(1.3, 11))
sfx = sfx + 0.08 * convolve_st(sfx[0] * 0.5 + sfx[1] * 0.5, make_ir(0.8, 12))
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
mix *= dbg(-13.6 - integrated(mix))
from scipy import signal
c = dbg(-1.2); up = np.abs(signal.resample_poly(mix, 4, 1, axis=-1)).max(0)
pk = np.pad(up, (0, max(0, 4 * N - len(up))))[: 4 * N].reshape(N, 4).max(1)
g = ndimage.minimum_filter1d(np.minimum(1, c / np.maximum(pk, 1e-12)), ns(0.006), mode="nearest")
g = np.minimum(1, ndimage.uniform_filter1d(g, ns(0.006), mode="nearest")); g = np.minimum(g, ndimage.minimum_filter1d(np.minimum(1, c / np.maximum(pk, 1e-12)), 3))
mix *= g[None, :]
out = os.path.join(ROOT, "out"); os.makedirs(out, exist_ok=True)
write_wav(os.path.join(out, "rat-poison-marathon_mix.wav"), mix); write_wav(os.path.join(out, "stem_music.wav"), music); write_wav(os.path.join(out, "stem_sfx.wav"), sfx + amb)
print(f"duration {N / SR:.3f}s  integrated {integrated(mix):.1f} LUFS  true peak {true_peak(mix):.2f} dBTP  voice {Lv:.1f}  music {integrated(music):.1f}  sfx {integrated(sfx):.1f}")
