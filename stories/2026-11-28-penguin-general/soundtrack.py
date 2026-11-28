# Soundtrack for "This Penguin Is a General in the Army": original trend.py beat (funk -> phonk) + synthesized SFX + the voice, timed to words.json
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
TOTAL = 1757
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
def peck_tap(r=None):
    return modal(0.15, [(1900, 1, 0.012), (3100, 0.5, 0.008)], r or rng(1508)) * 0.6

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
def crackle(dur, r=None):   # fire: crackles + low roar
    r = r or rng(1601); n = ns(dur); t = tt(dur)
    roar = lp(colored(n, r, -1.0), 500) * (0.6 + 0.4 * smooth_noise(n, r, 2)) * 0.5
    pops = hp(r.standard_normal(n), 1800) * (r.random(n) < 0.0016) * 1.0; pops = ndimage.uniform_filter1d(pops, 12) * 6
    return st(fades((roar + pops) * np.minimum(1, t / 0.15), 0.01, 0.2))
def chopper(dur, r=None):
    r = r or rng(1602); t = tt(dur); n = len(t); env = (0.5 + 0.5 * np.sin(TAU * 13 * t)) ** 4
    return fades(lp(r.standard_normal(n), 400, 2) * env * 1.2 + np.sin(TAU * 52 * t) * env * 0.3, 0.2, 0.3)
def caw(r=None):
    r = r or rng(1603); t = tt(0.22); f = 900 + 500 * np.sin(np.pi * t / 0.22)
    return fades(bp(np.sign(np.sin(phase(f))) * 0.5 + 0.4 * r.standard_normal(len(t)), 600, 3000, 2) * np.sin(np.pi * t / 0.22), 0.005, 0.03) * 0.6
music = np.zeros((2, N)); sfx = np.zeros((2, N)); amb = np.zeros((2, N))
def ev(x, t, g=0.0, p=0.0):
    place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t, dbg(g))
Wd = lambda p, a=-1: P(p, a)
END = DUR
def meow(f0=620, dur=0.45, r=None):
    r = r or rng(1700); t = tt(dur); f = f0 * (1 + 0.35 * np.sin(np.pi * t / dur)) * (1 - 0.15 * t / dur)
    y = np.sin(phase(f)) + 0.45 * np.sin(2 * phase(f)) + 0.25 * np.sin(3 * phase(f)); y = bp(y, 400, 4000, 2)
    return fades(y * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.6 * 0.5, 0.01, 0.05)
def purr(dur, r=None):
    r = r or rng(1701); t = tt(dur); env = (0.5 + 0.5 * np.sin(TAU * 24 * t)) ** 2
    return fades(lp(r.standard_normal(len(t)), 300, 2) * env * 1.5, 0.1, 0.2)
def growl(dur=0.7, r=None):
    r = r or rng(1702); t = tt(dur); env = (0.5 + 0.5 * np.sin(TAU * 18 * t)) ** 1.5
    return fades(lp(r.standard_normal(len(t)), 220, 2) * env * 2.2 + 0.3 * np.sin(phase(np.full(len(t), 70.0))) * env, 0.03, 0.15)
def stamp_snd(r=None):
    r = r or rng(1703); return thud(r) * 0.9
def static(dur, r=None):
    r = r or rng(1704); t = tt(dur); return fades(hp(r.standard_normal(len(t)), 1500) * 0.4 * (0.7 + 0.3 * smooth_noise(len(t), r, 6)), 0.01, 0.1)
def door_slide(dur=0.45, r=None):
    r = r or rng(1705); t = tt(dur); return fades(bp(r.standard_normal(len(t)), 300, 2500, 2) * 0.6 * np.sin(np.pi * t / dur), 0.01, 0.05)
def pop_b(r=None):   # a balloon bursting
    r = r or rng(1801); t = tt(0.35); n = len(t)
    return fades(hp(r.standard_normal(n), 600) * np.exp(-t / 0.01) * 1.2 + lp(r.standard_normal(n), 300) * np.exp(-t / 0.05) * 0.6, 0.0003, 0.05)
def snap_rope(r=None):
    r = r or rng(1802); t = tt(0.4); n = len(t)
    return fades(bp(r.standard_normal(n), 900, 5000, 2) * np.exp(-t / 0.02) * 1.3 + np.sin(phase(180 * np.exp(-t / 0.05) + 60)) * np.exp(-t / 0.08) * 0.5, 0.0003, 0.05)
def zap(dur=0.9, r=None):
    r = r or rng(1803); t = tt(dur); n = len(t); env = (r.random(n) < 0.02).astype(float); env = ndimage.uniform_filter1d(env, 200) * 30
    y = (np.sign(np.sin(TAU * 60 * t)) * 0.3 + hp(r.standard_normal(n), 2000) * 0.6) * np.clip(env, 0, 1)
    return fades(y, 0.005, 0.1)
def hum_off(dur=0.8):
    t = tt(dur); f = 120 * (1 - 0.7 * t / dur); return fades(np.sin(phase(f)) * 0.4 * (1 - t / dur), 0.005, 0.05)
def jet(dur, r=None):
    r = r or rng(1804); n = ns(dur); t = tt(dur)
    return fades(lp(colored(n, r, -1.0), 1400) * 0.6 + bp(r.standard_normal(n), 2500, 6000, 1) * 0.15, 0.4, 0.5) * np.sin(np.pi * t / dur) ** 0.5
def inflate(dur, r=None):
    r = r or rng(1805); t = tt(dur); n = len(t); return fades(bp(r.standard_normal(n), 1500, 7000, 1) * 0.5, 0.05, 0.1)
def knock(r=None):   # hammer on wood
    r = r or rng(1900); t = tt(0.25); n = len(t)
    return fades(bp(r.standard_normal(n), 300, 2200, 2) * np.exp(-t / 0.02) * 1.2 + np.sin(phase(np.full(n, 210.0))) * np.exp(-t / 0.04) * 0.6, 0.0003, 0.05)
def tape_out(dur=0.8, r=None):   # tape measure rattling out
    r = r or rng(1901); t = tt(dur); n = len(t); clicks = (np.sin(TAU * 38 * t) > 0.97).astype(float)
    return fades(hp(r.standard_normal(n), 2500) * ndimage.uniform_filter1d(clicks, 40) * 8, 0.005, 0.05) * 0.5
def clink(f=2300, r=None):   # glass bottle
    t = tt(0.4); return fades((np.sin(TAU * f * t) + 0.5 * np.sin(TAU * f * 2.7 * t)) * np.exp(-t / 0.08) * 0.4, 0.0005, 0.05)
def can_drop(r=None):
    return clank(1.0, r or rng(1902), 520) * 0.8
def pages(r=None):   # calendar page flip
    r = r or rng(1903); t = tt(0.3); return fades(bp(r.standard_normal(len(t)), 1500, 7000, 1) * np.sin(np.pi * t / 0.3) * 0.6, 0.005, 0.05)
def splash(r=None, big=1.0):
    r = r or rng(2001); t = tt(1.2); n = len(t)
    y = bp(r.standard_normal(n), 300, 6000, 1) * np.exp(-t / (0.25 * big)) * 1.0 + lp(r.standard_normal(n), 400) * np.exp(-t / 0.15) * 0.8
    drops = hp(r.standard_normal(n), 2000) * (r.random(n) < 0.004) * np.exp(-t / 0.5); drops = ndimage.uniform_filter1d(drops, 20) * 12
    return st(fades(y + drops, 0.002, 0.2)) * 0.7
def blub(r=None, f0=320):
    t = tt(0.12); f = f0 * (1 + 2.5 * t / 0.12); return fades(np.sin(phase(f)) * np.exp(-t / 0.05) * 0.5, 0.002, 0.03)
def sonar(f=1150):
    t = tt(1.6); return fades(np.sin(TAU * f * t) * np.exp(-t / 0.45) * 0.45 + np.sin(TAU * f * 2.01 * t) * np.exp(-t / 0.2) * 0.1, 0.003, 0.1)
def robo_beep(r=None):
    y = np.concatenate([np.sin(TAU * f * tt(0.07)) * 0.35 for f in (1320, 1760, 1480)]); return fades(y, 0.002, 0.01)
def train_horn(dur=1.1):
    t = tt(dur); y = sum(np.sign(np.sin(TAU * f * t)) * 0.15 + np.sin(TAU * f * t) * 0.2 for f in (311, 392, 466)); return fades(lp(y, 2500, 2), 0.04, 0.2) * 0.6
def laughs(dur, r=None):
    r = r or rng(2002); t = tt(dur); n = len(t); y = np.zeros(n)
    for k in range(5):
        f0 = 180 + 90 * k; ha = (np.sin(TAU * (5.5 + k * 0.7) * t + k) > 0.2).astype(float); ha = ndimage.uniform_filter1d(ha, 300)
        y += bp(np.sign(np.sin(phase(f0 * (1 + 0.05 * np.sin(TAU * 3 * t))))) * 0.5 + 0.5 * r.standard_normal(n), 300, 3000, 2) * ha * 0.25
    return widen(fades(y, 0.05, 0.4), r, 19, 0.8)
def shiver(dur=0.9, r=None):
    r = r or rng(2003); t = tt(dur); return fades(bp(r.standard_normal(len(t)), 800, 3000, 2) * (0.5 + 0.5 * np.sign(np.sin(TAU * 18 * t))) * 0.4, 0.02, 0.1)
def woof(r=None, f0=210, vel=1.0):   # cartoon dog bark: pitched burst + noise
    r = r or rng(3001); t = tt(0.28); n = len(t); f = f0 * (1 + 0.6 * np.exp(-t / 0.03)) * (1 - 0.25 * t / 0.28)
    y = (np.sign(np.sin(phase(f))) * 0.35 + np.sin(phase(f * 2)) * 0.3) * np.exp(-t / 0.08) + bp(r.standard_normal(n), 400, 2500, 2) * np.exp(-t / 0.05) * 0.5
    return fades(lp(y, 3000, 2) * vel, 0.003, 0.05)
def pant(dur, r=None):
    r = r or rng(3002); t = tt(dur); n = len(t); g = (np.sin(TAU * 4.5 * t) > 0).astype(float); g = ndimage.uniform_filter1d(g, 400)
    return fades(bp(r.standard_normal(n), 900, 4000, 2) * g * 0.4, 0.02, 0.05)
def meow(r=None):
    t = tt(0.5); f = 700 + 300 * np.sin(np.pi * t / 0.5); return fades((np.sin(phase(f)) * 0.4 + np.sin(phase(f * 2)) * 0.15) * np.sin(np.pi * t / 0.5), 0.01, 0.05)
def wag_swish(dur, rate=6.0, r=None):
    r = r or rng(3003); t = tt(dur); n = len(t); g = np.abs(np.sin(np.pi * rate * t)) ** 3
    return fades(bp(r.standard_normal(n), 1200, 5000, 1) * g * 0.35, 0.01, 0.05)
def kiss(r=None):
    t = tt(0.12); return fades(np.sin(phase(1800 * (1 - t / 0.2))) * np.exp(-t / 0.03) * 0.4, 0.001, 0.02)
# ================================================================ new SFX for Nils
def squawk(r=None, f0=520, dur=0.32):   # penguin honk: buzzy, nasal
    r = r or rng(4001); t = tt(dur); f = f0 * (1 + 0.25 * np.sin(np.pi * t / dur)) * (1 + 0.02 * np.sin(TAU * 30 * t))
    y = np.sign(np.sin(phase(f))) * 0.3 + np.sin(phase(f * 2)) * 0.2 + bp(r.standard_normal(len(t)), 800, 3000, 2) * 0.15
    return fades(bp(y, 400, 3500, 2) * np.sin(np.pi * t / dur) ** 0.5, 0.005, 0.04)
def stomp(r=None):   # boots on paving
    r = r or rng(4002); t = tt(0.2); n = len(t)
    return fades(lp(r.standard_normal(n), 900, 2) * np.exp(-t / 0.03) * 1.1 + np.sin(phase(np.full(n, 75.0))) * np.exp(-t / 0.05) * 0.5, 0.0005, 0.03)
def patter(t0, n, step=0.2, g=-20):   # penguin feet: soft wet slaps
    for k in range(n):
        t = tt(0.08); ev(fades(bp(rng(4010 + k).standard_normal(len(t)), 500, 2500, 2) * np.exp(-t / 0.02) * 0.8, 0.001, 0.02), t0 + k * step, g, (k % 2 - 0.5) * 0.4)
def shing(r=None):   # sword drawn / glint
    t = tt(1.2); r = r or rng(4003)
    y = sum(np.sin(TAU * f * t) * np.exp(-t / d) for f, d in ((2950, 0.5), (4420, 0.3), (6100, 0.18))) * 0.25 + hp(r.standard_normal(len(t)), 4000) * np.exp(-t / 0.06) * 0.4
    return fades(y, 0.002, 0.2)
def fanfare(t0, notes=(67, 72, 76, 79), step=0.11, g=-14):
    for k, m in enumerate(notes):
        place(music, pan(brass(m2f(m), 0.18 if k < len(notes) - 1 else 0.55, 0.8, rng(4020 + k), kind="stab"), 0.15), t0 + k * step, dbg(g))
T = dict(outranks=Wd("outranks"), army=Wd("army"), general=Wd("general"), real=Wd("real"), knight=Wd("knighthood"), starts=Wd("starts"), norway=Wd("Norway's"), zoo=Wd("zoo"),
         love=Wd("love"), penguin2=Wd("penguin", Wd("love")), adopt=Wd("adopt"), nils=Wd("Nils"), lance=Wd("lance"), corporal1=Wd("corporal"), every=Wd("Every"), promoted=Wd("promoted"),
         corporal=Wd("Corporal", Wd("promoted")), sergeant=Wd("Sergeant"), major1=Wd("major"), march=Wd("march"), waddles=Wd("waddles"), king=Wd("King"), approves=Wd("approves"),
         knight2=Wd("knighthood", Wd("approves")), qualified=Wd("qualified"), citation=Wd("citation"), rows=Wd("Rows"), attention=Wd("attention"), inspects=Wd("inspects"),
         brigadier=Wd("Brigadier"), majorgen=Wd("Major", Wd("Brigadier")), outranks2=Wd("outranks", Wd("Brigadier")), named=Wd("named"), wait=Wd("But"), weirder=Wd("weirder"),
         died=Wd("died"), lookalike=Wd("lookalike"), promoted2=Wd("promoted", Wd("lookalike")), third=Wd("Third"), statue=Wd("statue"), dad=Wd("dad"), start=Wd("start"),
         paperwork=Wd("paperwork"), because=Wd("Because"))
ED = WORDS[-1]["end"]

# ---------------- SFX timeline (nothing on the very first word at 0.37 s) ----------------
patter(0.05, 5, 0.22, -22)
ev(squawk(rng(9001)), T["outranks"] + 0.4, -18)
for k in range(4): ev(stomp(rng(9002 + k)), T["army"] - 0.2 + k * 0.09, -18, (k - 1.5) * 0.3)
ev(sparkle_snd(rng(9006)), T["general"] + 0.1, -16)
ev(squawk(rng(9007), 600, 0.22), T["real"] + 0.35, -18)
ev(shing(), T["knight"] + 0.05, -14)
for k in range(8): ev(stomp(rng(9010 + k)), T["starts"] + k * 0.33, -21, (k % 2 - 0.5) * 0.5)
ev(whoosh(0.6, rng(9020)), T["zoo"] - 0.35, -20); ev(ping(2200), T["zoo"] + 0.25, -20)
ev(kiss(), T["love"] + 0.2, -16); ev(kiss(), T["love"] + 0.45, -18)
ev(squawk(rng(9021), 700, 0.25), T["penguin2"] + 0.35, -16)
ev(stamp_snd(rng(9022)), T["adopt"] + 0.25, -12)
ev(sparkle_snd(rng(9023)), T["nils"] + 0.05, -18)
ev(click(rng(9024)), T["corporal1"] + 0.1, -16)
for k in range(8): ev(stomp(rng(9030 + k)), T["every"] + k * 0.24, -22, (k % 2 - 0.5) * 0.5)
ev(confetti_pop(rng(9040)), T["promoted"] + 0.05, -14); ev(cheer(1.2, rng(9041)), T["promoted"] + 0.1, -22)
for k, key in enumerate(["corporal", "sergeant", "major1"]): ev(stamp_snd(rng(9042 + k)), T[key] + 0.05, -14); ev(whoosh(0.3, rng(9046 + k)), T[key] - 0.2, -22)
for k in range(4): ev(stomp(rng(9050 + k)), T["march"] - 0.2 + k * 0.22, -16, (k % 2 - 0.5) * 0.5)
patter(T["waddles"] - 0.05, 4, 0.16, -16); ev(boing(260, 0.45), T["waddles"] + 0.3, -18)
ev(pages(rng(9060)), T["king"] - 0.2, -20); ev(stamp_snd(rng(9061)), T["approves"] + 0.15, -12)
ev(shing(rng(9062)), T["knight2"] + 0.05, -14)
ev(pages(rng(9063)), T["qualified"] - 0.6, -20)
for k in range(2): ev(stomp(rng(9064 + k)), T["attention"] + 0.35 + k * 0.06, -14, (k - 0.5) * 0.4)
patter(T["inspects"] - 0.6, 4, 0.2, -20); ev(slide(600, 1200, 0.35), T["inspects"] + 0.4, -22)
ev(stamp_snd(rng(9070)), T["brigadier"] + 0.05, -14); ev(stamp_snd(rng(9071)), T["majorgen"] + 0.05, -12)
ev(slide(700, 300, 0.5), T["outranks2"] + 0.3, -20)
ev(whoosh(0.4, rng(9072)), T["wait"] - 0.4, -14); ev(boom_far(rng(9073)), T["weirder"] + 0.05, -10)
ev(slide(900, 500, 1.0), T["died"] + 0.3, -26)
ev(scratch(0.3, rng(9074)), T["lookalike"] - 0.05, -18)
ev(confetti_pop(rng(9075)), T["promoted2"] + 0.05, -14)
ev(sparkle_snd(rng(9076)), T["third"] + 0.1, -16)
ev(flashpop(rng(9077)), T["statue"] + 0.1, -18); ev(flashpop(rng(9078)), T["statue"] + 0.5, -20)
for k in range(3): ev(knock(rng(9080 + k)) * 0.4, T["dad"] - 0.45 + k * 0.18, -22)
ev(squawk(rng(9083), 640, 0.3), T["dad"] + 0.4, -16)
for k in range(3): ev(pages(rng(9084 + k)), T["paperwork"] + 0.55 + k * 0.15, -20)
ev(stamp_snd(rng(9090)), T["paperwork"] + 0.4, -12)
ev(whoosh(0.4, rng(9091)), T["because"] + 0.6, -20)
place(amb, st(lp(rng(9100).standard_normal(N), 700, 2) * (0.6 + 0.4 * smooth_noise(N, rng(9101), 0.5)) * 0.2), 0.0, dbg(-18))

# ---------------- MUSIC: original trending-style beat: Brazilian funk (the parade) -> drift phonk at "But wait… it gets weirder" ----------------
from trend import beat
xf = T["wait"] - 0.05
a = beat("funk", DUR, seed=1128, key=41, stops=[(T["waddles"] - 0.15, T["waddles"] + 0.55)])[:, :N]
b = beat("phonk", DUR, seed=11281, key=41, stops=[(T["dad"] - 0.2, T["dad"] + 0.5)])[:, :N]
w = np.clip((np.arange(N) / SR - xf) / 0.08, 0, 1)
music += a * (1 - w)[None, :] + b * w[None, :]
fanfare(T["knight"] + 0.25, g=-16); fanfare(T["promoted"] + 0.2, g=-16); fanfare(T["majorgen"] + 0.35, (67, 72, 76, 84), g=-15)
# ============================================================ mix
sfx = sfx + 0.08 * convolve_st(sfx[0] * 0.5 + sfx[1] * 0.5, make_ir(0.8, 12))
v, sr = read_wav(os.path.join(ROOT, "voice", "voice.wav")); assert sr == SR
vv = np.zeros(N); vv[: min(N, v.shape[1])] = v[0][:N]; voice = st(vv)
ctrl = 1000; nc = int(DUR * ctrl) + 2; va = np.zeros(nc)
for w in WORDS: va[max(0, int((w["start"] - 0.08) * ctrl)): int((w["end"] + 0.15) * ctrl)] = 1
env = np.zeros(nc); e = 0.0; ka, kr = 1 - np.exp(-1 / 70), 1 - np.exp(-1 / 450)
for i in range(nc): e += (va[i] - e) * (ka if va[i] > e else kr); env[i] = e
duck = np.interp(np.arange(N) / SR, np.arange(nc) / ctrl, env)
Lv = integrated(voice)
music *= dbg((Lv - 11.0) - integrated(music)); music *= dbg(-5.0 * duck)[None, :]
dip = np.zeros(N)
for (t0, t1) in [(T["wait"] - 0.15, T["wait"] + 0.9)]: dip[ns(t0):ns(t1)] = 1.6
dip = ndimage.uniform_filter1d(dip, ns(0.05)); music *= dbg(-8.0 * dip)[None, :]; sfx *= dbg(-8.0 * dip)[None, :]
sfx *= dbg((Lv - 7.0) - integrated(sfx))
amb *= dbg((Lv - 20.0) - integrated(amb)); amb *= dbg(-4.0 * duck)[None, :]
sfx *= dbg(-6.0)
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
write_wav(os.path.join(out, "nils_mix.wav"), mix); write_wav(os.path.join(out, "stem_music.wav"), music); write_wav(os.path.join(out, "stem_sfx.wav"), sfx + amb)
print(f"duration {N / SR:.3f}s  integrated {integrated(mix):.1f} LUFS  true peak {true_peak(mix):.2f} dBTP  voice {Lv:.1f}  music {integrated(music):.1f}  sfx {integrated(sfx):.1f}")
