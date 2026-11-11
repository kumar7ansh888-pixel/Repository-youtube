# One-frame flicker scan: frames that differ from both neighbours while the neighbours match each other.
# Usage: flicker.py video.mp4  -> prints suspects (frame, diff_prev, diff_next, neighbours). Camera "kicks" also show up; check by eye.
import subprocess, sys, numpy as np
w, h = 54, 96
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', sys.argv[1], '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).astype(float)
out = []
for i in range(1, len(F) - 1):
    a = np.abs(F[i] - F[i - 1]).mean(); b = np.abs(F[i] - F[i + 1]).mean(); c = np.abs(F[i - 1] - F[i + 1]).mean()
    if min(a, b) > 8 and c < 0.5 * min(a, b): out.append((i, round(a, 1), round(b, 1), round(c, 1)))
print(len(F), 'frames; suspects:', out)
