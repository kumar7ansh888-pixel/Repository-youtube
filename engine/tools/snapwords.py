# After align.py: move word boundaries that straddle a measured pause (e.g. "…") onto the pause. Usage: snapwords.py voice.wav words.json
import json, re, subprocess, sys
wav, path = sys.argv[1], sys.argv[2]; w = json.load(open(path))
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-40dB:d=0.15', '-f', 'null', '-'], capture_output=True, text=True).stderr
gaps = list(zip([float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)], [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]))
n = 0
for x in w:
    for gs, ge in gaps:
        if x['start'] < gs < x['end'] - 0.02:
            if gs - x['start'] < x['end'] - ge: x['start'] = round(ge, 3)
            else: x['end'] = round(gs, 3)
            n += 1
    for gs, ge in gaps:
        if gs <= x['start'] < ge - 0.03: x['start'] = round(ge, 3)
json.dump(w, open(path, 'w'), indent=0); print(n, 'words snapped')
