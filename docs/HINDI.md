# Hindi 1-minute Shorts (owner's choice, 2026-11-14)

From 2026-11-14 every daily video is **about 1 minute, narrated in Hindi**. This file overrides the English-only parts of
`PIPELINE.md`; everything else there (topic scoring, facts, renderer, contact sheets, render, sound, publish, record)
still applies. Worked example: `stories/2026-11-14-hindi-rat-poison/`.

| what | choice |
| --- | --- |
| voice | free Piper `hi_IN-pratham-medium` (owner picked Pratham over Rohan), `--length-scale 0.9` |
| length | 55–60 s, about 160–175 Hindi words, 17–19 lines |
| script for the voice | Devanagari |
| captions, hook title, YouTube title + description | Hinglish (Hindi words in Roman letters) |
| cuts | every 1.5–2 s (about 30 shots), motion in every shot |

## Steps that change

0. Setup: also run `bash engine/tools/hindi/fetch_hindi.sh /home/claude/models` (Pratham voice + whisper-small, ~1 GB;
   Hugging Face is blocked, these come from the sherpa-onnx GitHub releases).
2. Script → `$P/lines.txt`, one line per sentence group: `<Devanagari> | <Roman Hinglish>`. **Both halves must have the
   same number of words** (the Roman words become the captions and the phrase anchors in `story.js`). Write numbers as
   words in both ("उन्नीस सौ चार | Unnees sau chaar"). Avoid "St." style abbreviations in the Roman half (the caption
   splitter treats "." as a sentence end: write "Saint"). Keep SCRIPT.md (both versions, shot ideas, scoring, sources).
3. Voice: `bash engine/tools/hindi/voice.sh $P` → `voice/tts.wav`, `voice/voice.wav`, `voice/words.json` (Roman words,
   times shared out by Devanagari letters inside each trimmed line). Over 60 s: cut words, or LS=0.85 at most.
4. Skip align.py / snapwords.py (English only). Check: `python3 engine/tools/hindi/asr_chunks.py $P/voice/voice.wav`;
   whisper-small is weak in Hindi and spells phonetically, so look for missing/garbled words, not exact matches.
5. `story.js`: anchor phrases are the Roman words (`S("Seedha")`, `T("zeher", 49)` for a later repeat).
8. Captions: `make_ass.py voice/words.json out/captions.ass "HOOK LINE|IN HINGLISH" 2.55`.
9. Publish: YouTube title in Hinglish (≤ 50 chars + one emoji), description in Hinglish + `#shorts` + topic hashtags,
   first comment in Hinglish.

## Pitfalls met on the first Hindi video
- `sherpa-onnx` pip (2.0.1) cannot phonemize Hindi for Piper models (no espeak frontend); use the `piper-tts` package.
- sherpa whisper-small truncates long Hindi clips: transcribe 1–2.5 s chunks (asr_chunks.py does this).
- Low cameras over a set ground quad: a negative polygonOffsetFactor pushes the near ground past the near plane and
  the global bright-green grass shows through (looked like flicker). RACE now uses factor 0 with the field at y 0.10 and
  the road at 0.14 (characters stand at G = 0.14 there). Use the same for new sets.
- Render time: ~1700 frames ≈ 75–80 min on 2 CPUs. Start the render by ~5 h before 23:00 IST at the latest.
