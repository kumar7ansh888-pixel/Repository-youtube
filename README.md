# Beyond Normal Daily — Shorts engine

Cartoon 3D true-story YouTube Shorts, made end to end in the cloud: three.js toon renderer (headless Chromium via
Playwright), free Kokoro narration, synthesized music and SFX, karaoke captions, scheduled to YouTube via Metricool.

- `PIPELINE.md` — the daily procedure, step by step.
- `engine/render` — the renderer (`src/story.js` = the shot list, `src/world.js` = sets, `lib/toon.js` = character rig).
- `engine/tools` — voice (`tts.py`), transcription (`asr.py`), word timing (`align.py`, `snapwords.py`), captions
  (`make_ass.py`), QA (`flicker.py`, `sheet.py`), assembly (`finish.sh`), model download (`fetch_models.sh`).
- `engine/audio` — synth library (`dsp.py`, `instruments.py`) and the soundtrack template.
- `stories/` — every published story's sources, plus `LOG.md`.
- `docs/` — channel playbook and voice profile.
- Branch `videos` — the finished MP4s Metricool fetches.

Third-party pieces: three.js (MIT, `engine/render/three`), Kokoro-82M v0.19 voice (Apache-2.0, downloaded at run time
from the sherpa-onnx releases), Whisper base.en (MIT, sherpa-onnx export), CMU Pronouncing Dictionary (BSD), fonts Rye,
Alfa Slab One, Bangers (OFL) and Poppins (OFL).
