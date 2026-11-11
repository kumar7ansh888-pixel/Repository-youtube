# Free narration voice: Kokoro v0.19 (Apache-2.0, ONNX from the sherpa-onnx GitHub release) driven by onnxruntime,
# with our own English phonemizer (CMU dictionary -> espeak-style IPA, plus a letter-rule fallback for unknown words).
#   python3 tts.py <model_dir> <cmudict.dict> <script.txt> <out.wav> [--voice am_adam] [--speed 1.0] [--lex extra.txt]
# extra.txt: optional "word IPA" lines for names the dictionary lacks (IPA in the same style, stress marks before vowels).
import re, sys, json, wave, argparse
import numpy as np, onnxruntime as ort

ap = argparse.ArgumentParser()
ap.add_argument("model"); ap.add_argument("cmudict"); ap.add_argument("text"); ap.add_argument("out")
ap.add_argument("--voice", default="am_adam"); ap.add_argument("--speed", type=float, default=1.0); ap.add_argument("--lex", default=None)
ap.add_argument("--print", action="store_true")
A = ap.parse_args()

VOC = {}
for line in open(f"{A.model}/tokens.txt", encoding="utf-8"):
    line = line.rstrip("\n")
    if not line: continue
    sym, idx = line[: line.rfind(" ")], line[line.rfind(" ") + 1:]
    VOC[sym if sym else " "] = int(idx)

CMU = {}
for line in open(A.cmudict, encoding="utf-8"):
    w, *ph = line.split("#")[0].split()
    if not ph: continue
    if "(" in w: continue            # keep the first pronunciation only
    CMU[w] = ph
EXTRA = {}
if A.lex:
    for line in open(A.lex, encoding="utf-8"):
        if line.strip(): w, ipa = line.split(None, 1); EXTRA[w.lower()] = ipa.strip()

V = {"AA": "ɑː", "AE": "æ", "AH": "ʌ", "AO": "ɔː", "AW": "aʊ", "AY": "aɪ", "EH": "ɛ", "ER": "ɜː", "EY": "eɪ", "IH": "ɪ", "IY": "iː", "OW": "oʊ", "OY": "ɔɪ", "UH": "ʊ", "UW": "uː"}
C = {"B": "b", "CH": "tʃ", "D": "d", "DH": "ð", "F": "f", "G": "ɡ", "HH": "h", "JH": "dʒ", "K": "k", "L": "l", "M": "m", "N": "n", "NG": "ŋ", "P": "p", "R": "ɹ", "S": "s", "SH": "ʃ", "T": "t", "TH": "θ", "V": "v", "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ"}

def arpa_to_ipa(ph):
    out = []
    n = len(ph)
    for i, p in enumerate(ph):
        base, st = re.match(r"([A-Z]+)(\d?)", p).groups()
        if base in V:
            s = int(st or 0)
            if base == "AH" and s == 0: v = "ə"
            elif base == "ER" and s == 0: v = "ɚ"
            elif base == "IH" and s == 0: v = "ɪ"
            elif base == "IY" and s == 0 and i == n - 1: v = "i"
            elif base == "UW" and s == 0: v = "u"
            else: v = V[base]
            out.append(("ˈ" if s == 1 else "ˌ" if s == 2 else "") + v)
        else:
            c = C[base]
            # American flap: t/d between a vowel and an unstressed vowel
            if base in ("T", "D") and 0 < i < n - 1:
                prev = re.sub(r"\d", "", ph[i - 1]); nxt = ph[i + 1]
                if (prev in V or prev == "R") and re.match(r"[A-Z]+0$", nxt) and re.sub(r"\d", "", nxt) in V: c = "ɾ"
            out.append(c)
    return "".join(out)

# crude letter rules for words the dictionary does not know (names)
LR = [("tch", "tʃ"), ("ch", "tʃ"), ("sh", "ʃ"), ("th", "θ"), ("ph", "f"), ("ck", "k"), ("ng", "ŋ"), ("qu", "kw"), ("wh", "w"), ("gh", ""),
      ("ee", "iː"), ("ea", "iː"), ("oo", "uː"), ("ai", "eɪ"), ("ay", "eɪ"), ("oa", "oʊ"), ("ow", "oʊ"), ("ou", "aʊ"), ("oi", "ɔɪ"), ("oy", "ɔɪ"),
      ("au", "ɔː"), ("aw", "ɔː"), ("er", "ɚ"), ("ir", "ɜː"), ("ur", "ɜː"), ("ar", "ɑːɹ"), ("or", "ɔːɹ"), ("ie", "iː"),
      ("a", "æ"), ("e", "ɛ"), ("i", "ɪ"), ("o", "ɑː"), ("u", "ʌ"), ("y", "i"), ("c", "k"), ("g", "ɡ"), ("j", "dʒ"), ("x", "ks"), ("r", "ɹ"),
      ("b", "b"), ("d", "d"), ("f", "f"), ("h", "h"), ("k", "k"), ("l", "l"), ("m", "m"), ("n", "n"), ("p", "p"), ("s", "s"), ("t", "t"), ("v", "v"), ("w", "w"), ("z", "z")]
VOWELS = set("æɛɪɑʌiɚɜɔeoua")
def letters(w):
    w = re.sub(r"e$", "", w) if len(w) > 3 else w
    out, i = [], 0
    while i < len(w):
        for g, p in LR:
            if w.startswith(g, i): out.append(p); i += len(g); break
        else: i += 1
    s = "".join(out)
    m = re.search("[" + "".join(VOWELS) + "]", s)
    return s[: m.start()] + "ˈ" + s[m.start():] if m else s

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def num2w(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
    if n < 1000: return ONES[n // 100] + " hundred" + (" and " + num2w(n % 100) if n % 100 else "")
    if 1100 <= n < 2000 and n % 100 != 0 or 2010 <= n < 2100: return num2w(n // 100) + " " + (num2w(n % 100) if n % 100 >= 10 else "oh " + num2w(n % 100))
    if n < 1_000_000: return num2w(n // 1000) + " thousand" + (" " + num2w(n % 1000) if n % 1000 else "")
    return " ".join(ONES[int(d)] for d in str(n))
def normalize(t):
    t = t.replace("’", "'").replace("“", '"').replace("”", '"').replace("...", "…")
    t = re.sub(r"(\d+)¢", lambda m: num2w(int(m.group(1))) + " cents", t)
    t = re.sub(r"\$(\d+)", lambda m: num2w(int(m.group(1))) + " dollars", t)
    t = re.sub(r"(\d+)%", lambda m: num2w(int(m.group(1))) + " percent", t)
    t = re.sub(r"(\d+)s\b", lambda m: num2w(int(m.group(1))).replace("ty", "ties") if m.group(1).endswith("0") else num2w(int(m.group(1))) + "s", t)
    t = re.sub(r"\d+", lambda m: num2w(int(m.group(0))), t)
    for a, b in {"Mr.": "Mister", "Mrs.": "Missus", "Dr.": "Doctor", "St.": "Saint", "U.S.": "U S"}.items(): t = t.replace(a, b)
    return t

WEAK = {"a": "ə", "an": "ən", "the": "ðə", "and": "ənd", "of": "əv", "to": "tə", "for": "fɚ", "at": "æt", "his": "hɪz", "her": "hɚ", "him": "hɪm",
        "was": "wʌz", "were": "wɚ", "that": "ðæt", "in": "ɪn", "on": "ɑːn", "with": "wɪð", "as": "æz", "is": "ɪz", "it": "ɪt", "but": "bʌt",
        "by": "baɪ", "from": "fɹʌm", "or": "ɔːɹ", "be": "bi", "are": "ɑːɹ", "had": "hæd", "has": "hæz", "he": "hi", "she": "ʃi", "they": "ðeɪ",
        "their": "ðɛɹ", "them": "ðɛm", "you": "ju", "your": "jɚ", "we": "wi", "our": "aʊɚ", "its": "ɪts", "can": "kæn", "would": "wʊd", "could": "kʊd", "than": "ðən"}
def word_ipa(w):
    lw = w.lower()
    if lw in EXTRA: return EXTRA[lw]
    if lw in WEAK: return WEAK[lw]
    if lw in CMU: return arpa_to_ipa(CMU[lw])
    if lw.endswith("'s") and lw[:-2] in CMU: return arpa_to_ipa(CMU[lw[:-2]]) + "z"
    if "-" in lw: return "".join(word_ipa(p) for p in lw.split("-") if p)
    if len(lw) <= 4 and w.isupper(): return " ".join(arpa_to_ipa(CMU.get(c.lower(), ["EH1"])) for c in lw)
    return letters(lw)

def phonemize(text):
    toks = re.findall(r"[A-Za-z][A-Za-z'\-]*|[.,!?;:…—]", normalize(text))
    out = ""
    for tk in toks:
        if re.match(r"[.,!?;:…—]", tk): out = out.rstrip() + tk + " "
        else: out += word_ipa(tk) + " "
    return out.strip()

sess = ort.InferenceSession(f"{A.model}/model.onnx")
meta = sess.get_modelmeta().custom_metadata_map
names = meta["speaker_names"].split(",")
styles = np.fromfile(f"{A.model}/voices.bin", dtype=np.float32).reshape(len(names), 511, 256)
sid = names.index(A.voice)
SR = int(meta["sample_rate"])

raw = open(A.text, encoding="utf-8").read().strip()
sents = [s.strip() for s in re.split(r"(?<=[.!?…])\s+", raw) if s.strip()]
chunks, cur = [], ""
for s in sents:                       # pack sentences into chunks under the 510-token limit
    if cur and len(phonemize(cur + " " + s)) > 380: chunks.append(cur); cur = s
    else: cur = (cur + " " + s).strip()
if cur: chunks.append(cur)
audio = []
for ch in chunks:
    ps = phonemize(ch)
    ids = [VOC[c] for c in ps if c in VOC]
    if A.print: print(ps)
    st = styles[sid, min(len(ids), 510)][None, :]
    y = sess.run(None, {"tokens": np.array([[0] + ids + [0]], np.int64), "style": st, "speed": np.array([A.speed], np.float32)})[0].reshape(-1)
    audio += [y, np.zeros(int(SR * 0.12), np.float32)]
y = np.concatenate(audio)
y = y / max(1e-6, np.abs(y).max()) * 0.89
with wave.open(A.out, "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((y * 32767).astype(np.int16).tobytes())
print(f"{len(y) / SR:.2f}s  {len(chunks)} chunks  voice {A.voice}")
