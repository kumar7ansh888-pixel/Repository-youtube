# word-by-word karaoke captions (white -> yellow), same chunking as the Remotion caption layer
# Usage: make_ass.py words.json captions.ass ["HOOK LINE 1|HOOK LINE 2" [hook_end_seconds]]
# The optional hook is a big comic title at the top for the first seconds (line 1 yellow, line 2 red, Bangers font).
import json, re, sys
W = json.load(open(sys.argv[1])); out = sys.argv[2]
HOOK = sys.argv[3] if len(sys.argv) > 3 else ""; HOOK_END = float(sys.argv[4]) if len(sys.argv) > 4 else 2.55
chunks, cur = [], []
for w in W:
    cur.append(w)
    if len(cur) >= 4 or re.search(r'[.?!,:;…]["\']?$', w.get('raw', w['word'])): chunks.append(cur); cur = []
if cur: chunks.append(cur)
ts = lambda t: "%d:%02d:%05.2f" % (int(t // 3600), int(t % 3600 // 60), t % 60)
L = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "", "[V4+ Styles]",
     "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
     "Style: Hook,Bangers,200,&H00FFFFFF,&H00FFFFFF,&H00101010,&H96000000,0,0,0,0,100,100,3,0,1,12,8,8,40,40,190,1",
     "Style: Cap,Poppins,112,&H0000D4FF,&H00FFFFFF,&H00111111,&H64000000,1,0,0,0,100,100,0,0,1,8,5,2,60,60,470,1", "", "[Events]",
     "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
if HOOK:
    l1, _, l2 = HOOK.partition("|")
    L.append("Dialogue: 1,%s,%s,Hook,,0,0,0,,{\\fscx60\\fscy60\\t(0,180,\\fscx100\\fscy100)}{\\c&H3AE8FF&}%s%s" % (ts(0), ts(HOOK_END), l1, ("\\N{\\c&H3A48F0&\\fs224}" + l2) if l2 else ""))
for i, c in enumerate(chunks):
    a = max(0.0, c[0]['start'] - 0.05); b = min(chunks[i + 1][0]['start'] - 0.05, c[-1]['end'] + 0.7) if i + 1 < len(chunks) else c[-1]['end'] + 0.7
    parts, t = [], a
    for j, w in enumerate(c):
        nxt = c[j + 1]['start'] - 0.03 if j + 1 < len(c) else b
        lead = max(0, w['start'] - 0.03 - t)
        if lead > 0.005: parts.append("{\\k%d}" % round(lead * 100)); t += lead
        d = max(0.01, nxt - t); parts.append("{\\k%d}%s " % (round(d * 100), w.get('raw', w['word']).replace('"', ''))); t += d
    L.append("Dialogue: 0,%s,%s,Cap,,0,0,0,,%s" % (ts(a), ts(b), "".join(parts).strip()))
open(out, "w").write("\n".join(L) + "\n"); print(len(chunks), "captions")
