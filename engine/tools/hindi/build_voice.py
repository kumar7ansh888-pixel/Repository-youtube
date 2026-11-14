# Join the per-line Piper takes into voice/tts.wav and write voice/words.json with the ROMAN (Hinglish) words.
# Usage: python3 build_voice.py <project_dir>. lines.txt: "<Devanagari line> | <Roman line>" with the SAME word count.
# Word times: each line is trimmed, then its speech time is shared out by Devanagari letter count (good enough for captions).
import sys
import json, numpy as np, soundfile as sf, re
lines=[l.rstrip('\n').split('|') for l in open(sys.argv[1] + '/lines.txt')]
GAP=0.22; SR=None; out=[]; words=[]; t0=0.35
pieces=[np.zeros(0)]
for i,(h,r) in enumerate(lines):
    a,sr=sf.read(f'{sys.argv[1]}/voice/l/{i+1:02d}.wav',dtype='float32'); SR=sr
    e=np.sqrt(np.convolve(a*a,np.ones(int(sr*0.02))/int(sr*0.02),'same')); on=e>0.02*e.max()
    idx=np.where(on)[0]; s,en=idx[0],idx[-1]; a=a[max(0,s-int(0.03*sr)):en+int(0.05*sr)]; on=on[max(0,s-int(0.03*sr)):en+int(0.05*sr)]
    # speech time map (exclude gaps >0.08s)
    fr=int(sr*0.01); act=np.array([on[k:k+fr].any() for k in range(0,len(on),fr)])
    hw=h.split(); rw=r.split(); assert len(hw)==len(rw),(i,hw,rw)
    wt=np.array([len(re.sub(r'[^ऀ-ॿ]','',w))+1.5 for w in hw],float); cum=np.concatenate([[0],np.cumsum(wt)])/wt.sum()
    sp=np.cumsum(act)/act.sum()
    def at(f): k=int(np.searchsorted(sp,f)); return t0+min(k,len(act)-1)*0.01
    for k,w in enumerate(rw): words.append({'word':w,'start':round(at(cum[k]+1e-6),3),'end':round(at(cum[k+1]),3)})
    pieces.append(a); t0+=len(a)/sr+GAP; pieces.append(np.zeros(int(GAP*sr)))
v=np.concatenate([np.zeros(int(0.35*SR))]+pieces[1:])
sf.write(sys.argv[1] + '/voice/tts.wav',v,SR); json.dump(words,open(sys.argv[1] + '/voice/words.json','w'),ensure_ascii=False,indent=0)
print(len(v)/SR, len(words), words[:4], words[-3:])
