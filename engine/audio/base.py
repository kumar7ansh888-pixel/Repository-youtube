# Soundtrack for "The Man Who Stole the Mona Lisa": original score + synthesized SFX + the (1.15x) voice, timed to words.json
# (the same phrase anchors as render/src/story.js). Built on the cartoon-3d-short skill's dsp.py / instruments.py.
# Mix standard from the skill: voice unchanged, music bed ducked under speech, final -14 LUFS, <= -1 dBTP.
import json, os, sys
import numpy as np
from scipy import ndimage
from dsp import SR, ns, tt, dbg, rng, lp, hp, bp, peq, colored, smooth_noise, fades, modal, pan, st, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, phase, TAU
from instruments import m2f, glock, vibes, pluck, pad, brush, snare, timpani, cymbal, brass, triangle

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
WORDS = json.load(open(os.path.join(ROOT, "voice", "words.json")))
FPS = 30
TOTAL = int(np.ceil((WORDS[-1]["end"] + 1.2) * FPS))
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
ev(murmur(3.6, rng(901)), 0, -20)
tv = W("vanished"); ev(whoosh(0.5, rng(902)), tv - 0.25, -10); ev(splat(0.6, rng(903), 2.0), tv, -14); ev(glock(m2f(93), 0.6, rng(904), dur=1.2), tv + 0.05, -10)
ev(snore(2.2), W("and nobody noticed") + 0.1, -12)
ev(ambience("city", 2.3, rng(905)), W("August") - 0.1, -16); ev(coo(rng(906)), W("August") + 0.5, -18, -0.4); ev(bell(rng(907)), W("Paris", W("August")), -22)
ev(clank(1.0, rng(908), 900), W("closed") - 0.05, -9); ev(clank(0.7, rng(909), 1300), W("closed") + 0.18, -13)
ev(creak(rng(911), 0.8), W("A handyman") + 0.05, -10); footsteps(W("A handyman") + 0.9, 4, 0.45, -20, True)
tick(W("where he's been"), 1.6, -20)
footsteps(W("He knows this"), 3, 0.4, -18)
ev(sparkle_snd(rng(912)), W("protective glass") + 0.1, -12); ev(glock(m2f(96), 0.5, rng(913), dur=1.0), W("protective glass") + 0.15, -14)
for k in range(2): ev(click(rng(914 + k), 4200), W("including this") + 0.35 + k * 0.22, -12, 0.3)
footsteps(W("He walks up") + 0.05, 3, 0.38, -20, True)
ev(scrape(0.6, rng(915)), W("lifts her") + 0.1, -16); ev(whoosh(0.5, rng(916)), W("and carries") + 0.1, -14)
chirp(W("The next morning") + 0.2); chirp(W("The next morning") + 0.8, -21)
footsteps(W("a painter comes"), 4, 0.42, -19)
for k in range(4): ev(plink(1500 + 220 * k, rng(917 + k), 0.9), W("four") + k * 0.18, -11)
ev(whoosh(0.4, rng(921), False), W("metal pegs") + 0.35, -12); ev(timpani(m2f(31), 0.8, rng(922)), W("metal pegs") + 0.4, -10)
ev(crowd(1.4, rng(923)), W("Paris panics") - 0.05, -10); ev(whistle(0.6, 1500), W("Paris panics") + 0.6, -18, 0.4)
ev(whistle(0.5, 1600), W("Police arrest") + 0.05, -14, -0.3); ev(clank(0.6, rng(924), 1800), W("poet") + 0.05, -12)
ev(thud(rng(925)), W("questioned") + 0.05, -10)
ev(scratch(1.0, rng(926)), W("They interview") + 0.4, -16)
ev(coin(rng(927)), W("believe") + 0.3, -10)
tick(W("For two years"), 2.6, -20); flutter(W("For two years") + 0.2, 6)
ev(thud(rng(928)), W("false bottom") + 0.05, -9); ev(creak(rng(929), 0.4), W("hidden in a"), -18)
ev(glock(m2f(91), 0.5, rng(930), dur=1.0), W("Florence") + 0.05, -12)
ev(phone_ring(0.9), W("The dealer calls") - 0.05, -15, 0.3)
ev(timpani(m2f(26), 1.0, rng(931)), W("twist"), -6); ev(cymbal(0.6, rng(932)), W("twist"), -14); ev(whoosh(0.7, rng(933)), W("twist") - 0.6, -12)
ev(murmur(1.6, rng(934)), W("Before the theft"), -20)
ev(crowd(2.0, rng(935)), W("After it"), -12)
for k in range(5): ev(shutter(rng(936 + k)), W("After it") + 0.3 + k * 0.38, -12, 0.4 * (-1) ** k)
ev(coin(rng(941)), W("stole") + 0.1, -10)
for k in range(3): ev(shutter(rng(942 + k)), W("is the reason") + 0.4 + k * 0.6, -16, 0.3 * (-1) ** k)
ev(glock(m2f(98), 0.6, rng(945), dur=1.6), W("famous", W("is the reason")) + 0.1, -9)
place(amb, ambience("city", DUR, rng(9)), 0, dbg(-30))

# ---------------- SCORE (original): sneaky Parisian caper in D minor, 116 bpm, swung ----------------
BPM = 116; BEAT = 60 / BPM
def note(fn, m, t, vel, g=0.0, p=0.0, **kw):
    place(music, pan(fn(m2f(m), vel, rng(int(t * 1000) % 99991), **kw), p), t, dbg(g))
def chord_pad(ms, t, dur, vel=0.5, g=0.0, warm=900):
    if dur > 0.2: place(music, pad([m2f(m) for m in ms], dur, vel, rng(int(t * 10)), att=0.3, rel=0.6, warm=warm), t, dbg(g))
SW = lambda k: (BEAT * 0.62 if k % 2 == 0 else BEAT * 0.38)
BASSL = [38, 41, 43, 44, 45, 43, 41, 40]
def walk(a, b, g=-11, step=1.0):
    t = a; k = 0
    while t < b - 0.05: note(pluck, BASSL[k % 8] - 12, t, 0.75, g, -0.15, dur=0.4, bright=0.35, pos=0.25); t += BEAT * step; k += 1
def brushes(a, b, g=-22):
    t = a; k = 0
    while t < b - 0.05:
        place(music, pan(snare(0.18 + (0.12 if k % 4 in (1, 3) else 0), rng(k + int(a * 10)), tune=0.9, snappy=0.2), 0.25), t, dbg(g)); t += SW(k); k += 1
SNEAK = [(62, 0.5), (65, 0.5), (69, 1), (68, 0.5), (67, 0.5), (65, 1), (62, 0.5), (64, 0.5), (65, 0.5), (67, 0.5), (69, 2)]
def sneak(t0, fn, vel, g, tr=0, until=1e9, p=0.15):
    t = t0
    while t < until:
        for m, d in SNEAK:
            if t >= until: return
            if fn is vibes: note(vibes, m + tr, t, vel, g, p, dur=min(1.6, d * BEAT * 2))
            elif fn is pluck: note(pluck, m + tr, t, vel, g, p, dur=0.4, bright=0.75, pos=0.1)
            elif fn is brass: place(music, pan(brass(m2f(m + tr - 12), d * BEAT * 0.85, vel, rng(int(t * 99)), kind="horn"), p), t, dbg(g))
            else: note(fn, m + tr, t, vel, g, p)
            t += d * BEAT
S = {k: W(v) for k, v in dict(hand="A handyman", morning="The next morning", panics="Paris panics", two="For two years", sell="Then he tries", twist="And here's the twist", before="Before the theft", after="After it", man="The man who").items()}
walk(0, S["hand"]); brushes(0.2, S["hand"]); sneak(0.15, pluck, 0.55, -12, until=W("vanished") - 0.1); note(glock, 86, W("vanished") + 0.1, 0.6, -9)
sneak(W("and nobody") + 0.1, vibes, 0.45, -12, until=S["hand"] - 0.1)
walk(S["hand"], S["morning"], -10); brushes(S["hand"], S["morning"], -18); sneak(S["hand"] + 0.1, pluck, 0.55, -11, until=W("His company") - 0.1)
sneak(W("His company"), vibes, 0.5, -11, 5, until=W("He walks up") - 0.1); sneak(W("He walks up"), brass, 0.5, -13, until=S["morning"] - 0.1)
chord_pad([38, 45, 50, 53], S["morning"], W("All he finds") - S["morning"], 0.4, -12, warm=1000); sneak(S["morning"] + 0.2, glock, 0.4, -14, 7, until=W("All he finds") - 0.1)
chord_pad([38, 44, 50, 53], W("All he finds"), S["panics"] - W("All he finds"), 0.45, -11, warm=700)
walk(S["panics"], S["two"], -10, 0.5); brushes(S["panics"], S["two"], -16)
t = S["panics"]
while t < S["two"] - 0.3: place(music, st(timpani(m2f(26), 0.45, rng(int(t * 10)))), t, dbg(-16)); t += BEAT * 2
sneak(W("They interview"), pluck, 0.55, -12, until=S["two"] - 0.1)
chord_pad([38, 45, 50, 53], S["two"], S["sell"] - S["two"], 0.45, -11, warm=800); sneak(S["two"] + 0.1, vibes, 0.4, -13, until=S["sell"] - 0.1)
walk(S["sell"], S["twist"], -10); brushes(S["sell"], S["twist"], -18); sneak(S["sell"] + 0.05, brass, 0.5, -12, until=S["twist"] - 0.1)
chord_pad([38, 45, 50, 53], S["before"], S["after"] - S["before"], 0.4, -12, warm=700); note(vibes, 74, S["before"] + 0.2, 0.4, -12, dur=1.4)
walk(S["after"], DUR - 0.6, -10); brushes(S["after"], DUR - 0.6, -17); sneak(S["after"] + 0.05, brass, 0.55, -11, until=DUR - 1.3)
chord_pad([38, 45, 50, 53, 57], DUR - 1.3, 1.3, 0.5, -10, warm=1200); note(glock, 86, DUR - 1.2, 0.6, -9); note(glock, 93, DUR - 1.0, 0.5, -10)

# ============================================================ mix
music = music + 0.18 * convolve_st(music[0] * 0.5 + music[1] * 0.5, make_ir(1.4, 11))
sfx = sfx + 0.08 * convolve_st(sfx[0] * 0.5 + sfx[1] * 0.5, make_ir(0.8, 12))
v, sr = read_wav(os.path.join(ROOT, "voice", "voice.wav")); assert sr == SR
vv = np.zeros(N); vv[: min(N, v.shape[1])] = v[0][:N]; voice = st(vv)
# duck the music + ambience under speech (key = words.json)
ctrl = 1000; nc = int(DUR * ctrl) + 2; va = np.zeros(nc)
for w in WORDS: va[max(0, int((w["start"] - 0.08) * ctrl)): int((w["end"] + 0.15) * ctrl)] = 1
env = np.zeros(nc); e = 0.0; ka, kr = 1 - np.exp(-1 / 70), 1 - np.exp(-1 / 450)
for i in range(nc): e += (va[i] - e) * (ka if va[i] > e else kr); env[i] = e
duck = np.interp(np.arange(N) / SR, np.arange(nc) / ctrl, env)
Lv = integrated(voice)
music *= dbg((Lv - 13.0) - integrated(music)); music *= dbg(-7.0 * duck)[None, :]   # bed ~13 LU under the voice, -7 dB more while speaking
sfx *= dbg((Lv - 7.0) - integrated(sfx))
amb *= dbg((Lv - 20.0) - integrated(amb)); amb *= dbg(-4.0 * duck)[None, :]
music *= dbg(3.0); sfx *= dbg(-6.0)            # skill standard: music +3 dB, SFX -6 dB, voice unchanged
mix = voice + music + sfx + amb
# end fade with the picture (last 0.6 s), master to -14 LUFS, limit to -1 dBTP
fe = ns(0.6); mix[:, -fe:] *= np.linspace(1, 0, fe)[None, :]
mix *= dbg(-14.0 - integrated(mix))
from scipy import signal
c = dbg(-1.2); up = np.abs(signal.resample_poly(mix, 4, 1, axis=-1)).max(0)
pk = np.pad(up, (0, max(0, 4 * N - len(up))))[: 4 * N].reshape(N, 4).max(1)
g = ndimage.minimum_filter1d(np.minimum(1, c / np.maximum(pk, 1e-12)), ns(0.006), mode="nearest")
g = np.minimum(1, ndimage.uniform_filter1d(g, ns(0.006), mode="nearest")); g = np.minimum(g, ndimage.minimum_filter1d(np.minimum(1, c / np.maximum(pk, 1e-12)), 3))
mix *= g[None, :]
out = os.path.join(ROOT, "out"); os.makedirs(out, exist_ok=True)
write_wav(os.path.join(out, "mona_mix.wav"), mix); write_wav(os.path.join(out, "stem_music.wav"), music); write_wav(os.path.join(out, "stem_sfx.wav"), sfx + amb)
print(f"duration {N / SR:.3f}s  integrated {integrated(mix):.1f} LUFS  true peak {true_peak(mix):.2f} dBTP  voice {Lv:.1f}  music {integrated(music):.1f}  sfx {integrated(sfx):.1f}")
