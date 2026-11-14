# Rough Hindi check: whisper-small (sherpa-onnx) on ~1.5 s chunks cut at silences (whole lines get truncated by this model).
# Usage: python3 asr_chunks.py <wav>. Expect phonetic spellings; look for missing or garbled words, not exact matches.
import sys, numpy as np, soundfile as sf, sherpa_onnx
d='/home/claude/models/sherpa-onnx-whisper-small'
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/small-encoder.int8.onnx", decoder=f"{d}/small-decoder.int8.onnx", tokens=f"{d}/small-tokens.txt", language="hi", task="transcribe", num_threads=2)
a,sr=sf.read(sys.argv[1],dtype='float32'); a=a if a.ndim==1 else a.mean(1)
if sr!=16000:
    import scipy.signal as ss; a=ss.resample_poly(a,16000,sr).astype(np.float32); sr=16000
fr=int(sr*0.02); e=np.array([np.sqrt((a[i:i+fr]**2).mean()) for i in range(0,len(a)-fr,fr)]); sil=e<0.08*np.percentile(e,95)
# cut points: silences >=0.1s, aim chunks 1.2-2.5 s
cuts=[0]; run=0; last=0
for i,s in enumerate(sil):
    run=run+1 if s else 0
    t=i*0.02
    if run>=5 and t-last>1.2: cuts.append(int((t-0.05)*sr)); last=t
cuts.append(len(a)); out=[]
for x,y in zip(cuts,cuts[1:]):
    c=np.concatenate([np.zeros(4800,np.float32),a[x:y],np.zeros(16000,np.float32)]); s=r.create_stream(); s.accept_waveform(sr,c); r.decode_stream(s); out.append(s.result.text.strip())
print(' | '.join(out))
