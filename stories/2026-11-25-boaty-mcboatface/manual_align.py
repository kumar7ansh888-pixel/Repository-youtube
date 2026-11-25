import re, json, subprocess, sys
V, OUT, SCR = sys.argv[1:4]
lines = [l.strip() for l in open(SCR) if l.strip()]
log = subprocess.run(['ffmpeg','-hide_banner','-i',V,'-af','silencedetect=n=-35dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
dur = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',V],capture_output=True,text=True).stdout)
ss=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',log)]; se=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',log)]
runs=[];t=0
for a,b in zip(ss,se+[dur]*(len(ss)-len(se))):
    if a-t>0.05: runs.append((t,a))
    t=b
# groups of words per run (split script at phrase boundaries given manually by '|' in mapping file)
groups=[g.strip() for g in open(sys.argv[4]).read().split('\n') if g.strip()]
assert len(groups)==len(runs),(len(groups),len(runs))
def syl(w):
    w=re.sub(r'[^a-z]','',w.lower()); w2=re.sub(r'e$','',w); return max(1,len(re.findall(r'[aeiouy]+',w2)))
out=[]
for (a,b),g in zip(runs,groups):
    ws=g.split(); n=[syl(w) for w in ws]; tot=sum(n); t=a
    for w,k in zip(ws,n):
        d=(b-a)*k/tot; out.append({'word':re.sub(r'^[^\w]+|[^\w\'…]+$','',w) or w,'raw':w,'start':round(t,3),'end':round(t+d-0.02,3)}); t+=d
json.dump(out,open(OUT,'w'),ensure_ascii=False,indent=0); print(len(out),'words')
