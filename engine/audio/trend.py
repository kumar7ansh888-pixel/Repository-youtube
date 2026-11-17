# Original background beats in the styles that trend on YouTube Shorts (no samples, no copyrighted melodies):
#   "phonk"  drift phonk: pitched cowbell riff, sliding distorted 808, half-time clap, triplet hi-hat rolls (~140 bpm)
#   "funk"   Brazilian funk / montagem: tamborzao kick pattern, distorted 808, bell riff, claps (~130 bpm)
#   "sneaky" comedy tiptoe: pizzicato bass walk, staccato pluck melody, finger snaps (~110 bpm)
# Usage (inside a soundtrack script, after `from dsp import *`):
#   from trend import beat
#   bed = beat("phonk", DUR, seed=7, stops=[(T["axe"] + 0.35, T["dinner"] + 0.2)])   # (2, N) stereo, peak ~0.9
#   music += bed * dbg(-2)        # then the template's mix block sets its level and ducks it under the voice
# `stops` are (t0, t1) windows where the beat drops out (gags, sad beats); it comes back on the next bar line.
import numpy as np
from dsp import SR, TAU, ns, tt, rng, lp, hp, bp, phase, pan, place, widen, make_ir, convolve_st

def _exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))

def kick(f0=48.0, dur=0.7, r=None):
    t = tt(dur); f = f0 + f0 * 3.0 * np.exp(-t / 0.03)
    body = np.sin(phase(f)) * np.exp(-t / (dur * 0.35))
    click = hp((r or rng(1)).standard_normal(len(t)), 2500) * np.exp(-t / 0.002) * 0.4
    return np.tanh(2.2 * (body + click)) * 0.9

def bass808(f, dur, f_from=None, drive=3.0, glide=0.07):
    t = tt(dur)
    fr = f if f_from is None else f + (f_from - f) * np.exp(-t / glide)
    y = np.sin(phase(fr)) * np.minimum(1, t / 0.004) * np.exp(-t / max(0.25, dur * 0.8))
    y = np.tanh(drive * y) / np.tanh(drive)
    return lp(y, 2400) * np.minimum(1, (dur - t) / 0.02).clip(0, 1)

def cowbell(f, dur=0.32, r=None):
    t = tt(dur)
    sq = np.sign(np.sin(phase(np.full(len(t), f)))) + np.sign(np.sin(phase(np.full(len(t), f * 1.483))))
    y = bp(sq, f * 1.2, f * 4.5, 2)
    env = 0.75 * np.exp(-t / 0.035) + 0.25 * np.exp(-t / 0.22)
    return np.tanh(1.6 * y * env) * 0.55

def hat(dur=0.045, r=None, open_=False):
    n = ns(0.3 if open_ else dur)
    x = hp((r or rng(2)).standard_normal(n), 7000, 2)
    return x * _exp(n, 0.08 if open_ else dur * 0.35) * 0.35

def clap(r=None):
    r = r or rng(3); n = ns(0.45); y = np.zeros(n)
    for k, d in enumerate([0.0, 0.011, 0.023]):
        b = bp(r.standard_normal(ns(0.02)), 900, 3200) * _exp(ns(0.02), 0.004); i = ns(d); y[i:i + len(b)] += b
    tail = bp(r.standard_normal(n), 800, 3000) * _exp(n, 0.09) * 0.5
    return np.tanh(2 * (y + tail)) * 0.6

def snare(r=None):
    r = r or rng(4); t = tt(0.25)
    return (bp(r.standard_normal(len(t)), 1500, 7000) * np.exp(-t / 0.06) * 0.6 + np.sin(phase(np.full(len(t), 185.0))) * np.exp(-t / 0.05) * 0.5) * 0.8

def snap(r=None):
    r = r or rng(5); t = tt(0.08)
    return bp(r.standard_normal(len(t)), 1800, 6000) * np.exp(-t / 0.012) * 0.7

def bell(f, dur=0.6):
    t = tt(dur); m = np.sin(phase(np.full(len(t), f * 3.5))) * 2.2 * np.exp(-t / 0.15)
    return np.sin(TAU * f * t + m) * np.exp(-t / 0.25) * 0.4

def pluck_ks(f, dur=0.5, bright=0.5, r=None):
    from scipy.signal import lfilter
    r = r or rng(6); n = ns(dur); p = max(2, int(SR / f)); a = 0.5 + 0.49 * bright
    x = np.zeros(n); x[:p] = (r.random(p) * 2 - 1) * 0.8
    den = np.zeros(p + 2); den[0] = 1.0; den[p] = -0.996 * a; den[p + 1] = -0.996 * (1 - a)
    return lfilter([1.0], den, x) * 0.6

def m2f(m):
    return 440.0 * 2 ** ((m - 69) / 12)

STYLES = {"phonk": dict(bpm=140, key=42), "funk": dict(bpm=130, key=41), "sneaky": dict(bpm=110, key=45)}

def beat(style, dur, bpm=None, key=None, seed=1, stops=(), level=0.9):
    """Return a (2, N) stereo beat of `dur` seconds in `style`; key = MIDI root of the 808 (e.g. 42 = F#2)."""
    cfg = STYLES[style]; bpm = bpm or cfg["bpm"]; key = key if key is not None else cfg["key"]
    s16 = 60.0 / bpm / 4; N = ns(dur) + ns(2.0); out = np.zeros((2, N)); R = rng(seed)
    bars = int(dur / (16 * s16)) + 2
    def on(t):
        return all(not (a - 1e-3 <= t < b) for a, b in stops)
    def put(x, t, g=1.0, p=0.0):
        if t < dur and on(t): place(out, pan(x, p), t, g)
    if style == "phonk":
        prog = [0, 0, -2, -4]                                             # i i VII VI under the riff
        riff = [(0, 12), (3, 12), (6, 10), (8, 12), (10, 15), (12, 12), (14, 10)]   # (step, semitones over root+12)
        riff2 = [(0, 12), (3, 15), (6, 17), (8, 15), (10, 12), (12, 10), (14, 7)]
        last = None
        for b in range(bars):
            t0 = b * 16 * s16; root = key + prog[b % 4]
            for st_ in (0, 10): put(kick(46, 0.6, R), t0 + st_ * s16, 0.9)
            for st_, ln in ((0, 10), (10, 6)):
                f = m2f(root); put(bass808(f, ln * s16, last, 2.5), t0 + st_ * s16, 0.62); last = f
            put(clap(R), t0 + 8 * s16, 0.8, 0.05)
            for st_ in range(0, 16, 2): put(hat(0.04, R), t0 + st_ * s16, 0.55 if st_ % 4 else 0.7, 0.25)
            if b % 2 == 1:                                                # triplet hi-hat roll into the next bar
                for k in range(6): put(hat(0.03, R), t0 + 12 * s16 + k * (4 * s16 / 6), 0.45, 0.25)
            for st_, iv in (riff if b % 4 < 2 else riff2): put(cowbell(m2f(key + 24 + iv - 12), 0.3, R), t0 + st_ * s16, 0.7, -0.2)
    elif style == "funk":
        prog = [0, 0, 3, -2]
        kicks = [0, 3, 7, 10]; claps = [4, 12]; toms = [6, 9, 14]
        bells = [(0, 19), (2, 17), (4, 15), (7, 12), (10, 15), (12, 17), (14, 19)]
        for b in range(bars):
            t0 = b * 16 * s16; root = key + prog[b % 4]
            for st_ in kicks:
                put(kick(50, 0.45, R), t0 + st_ * s16, 0.9); put(bass808(m2f(root), 3 * s16, None, 4.0), t0 + st_ * s16, 0.75)
            for st_ in claps: put(clap(R), t0 + st_ * s16, 0.75, 0.05)
            for st_ in toms: put(snare(R) * 0.6 + np.pad(kick(140, 0.12, R), (0, ns(0.25) - ns(0.12))) * 0.4, t0 + st_ * s16, 0.6, 0.2)
            for st_ in range(16): put(hat(0.03, R), t0 + st_ * s16, 0.3 + 0.2 * (st_ % 2 == 0), -0.3)
            for st_, iv in bells: put(bell(m2f(key + 24 + iv), 0.4), t0 + st_ * s16, 0.6, -0.25)
    elif style == "sneaky":
        walk = [0, 3, 7, 3, 5, 3, 2, -1]                                  # tiptoe bass walk (minor)
        mel = [(0, 15), (2, 14), (4, 15), (6, 19), (8, 15), (11, 14), (12, 12), (14, 10)]
        for b in range(bars):
            t0 = b * 16 * s16
            for k, iv in enumerate(walk): put(pluck_ks(m2f(key + iv), 0.35, 0.3, R), t0 + k * 2 * s16, 0.8, 0.1)
            for st_ in (4, 12): put(snap(R), t0 + st_ * s16, 0.8, 0.3)
            if b % 2 == 0:
                for st_, iv in mel: put(pluck_ks(m2f(key + 12 + iv), 0.2, 0.75, R), t0 + st_ * s16, 0.55, -0.2)
    out = out[:, :ns(dur)]
    out = out + 0.12 * convolve_st(out.mean(0), make_ir(0.6, seed + 11))
    out = np.tanh(1.3 * out) / np.tanh(1.3)
    gate = np.ones(out.shape[1]); f = ns(0.02)
    for a, b in stops:                                                    # hard mute (notes and reverb ringing into a stop)
        i0, i1 = max(0, ns(a)), min(len(gate), ns(b))
        if i1 > i0:
            gate[i0:i1] = 0.0; gate[max(0, i0 - f):i0] *= np.linspace(1, 0, i0 - max(0, i0 - f))
    out *= gate[None, :]
    return out / max(1e-9, np.abs(out).max()) * level
