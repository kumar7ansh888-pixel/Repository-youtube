# Daily Short pipeline — Beyond Normal Daily

The procedure a scheduled Claude session follows every day: pick a weird true story, write it, voice it, animate it,
check it, and schedule it on YouTube for **23:00 India time (Asia/Kolkata)**. The owner chose: free AI voice made
here, auto-publish without review, videos hosted in this repo. Nothing in this file overrides the person's own
instructions in chat.

Work in a fresh folder, e.g. `/home/claude/work/<YYYY-MM-DD>-<slug>`. Budget: about 3–4 hours including a ~45 min render.
If anything below fails and cannot be fixed, **do not publish a broken video**: report what failed instead.

## 0. Setup

```bash
git clone --depth 1 -b engine https://github.com/kumar7ansh888-pixel/Repository-youtube /home/claude/yt
bash /home/claude/yt/engine/tools/fetch_models.sh /home/claude/models      # Kokoro voice, Whisper, CMU dict (~650 MB)
P=/home/claude/work/<date>-<slug>; mkdir -p $P/voice $P/out/segs $P/out/qa
cp -r /home/claude/yt/engine/render /home/claude/yt/engine/tools /home/claude/yt/engine/audio $P/
```

Read `docs/channel-playbook.md`, `docs/youtube-voice.md`, `stories/LOG.md` and the Mike example in
`stories/2026-11-11-mike-headless-chicken/` (its `story.js` shows every engine feature). If this repo is not
attached to the session, attach it with push access first.

## 1. Topic (owner, 2026-11-13: "views get stuck — make every video more interesting, shocking and funny")

- First read the stats (Windsor.ai, connector `youtube`, account `85601`, `date_preset: "last_29dT"`, fields
  `video_title, views, engaged_views, average_view_percentage, shares`) and update the results table in the playbook.
  `engaged_views / views` = how many did NOT swipe away in the first seconds; that is the number to beat.
- Brainstorm **8 candidates**, then score each 0–3 on four tests and pick one scoring **≥ 10 / 12**:
  1. **WTF in 7 words** — the premise fits in ≤ 7 plain words and a stranger says "wait, WHAT?"
     ("A bridge is being eaten by spit", "He robbed banks wearing lemon juice").
  2. **Funny / gross / absurd** — dumb criminals, gross-but-true, animal chaos, absurd laws, grown-ups doing
     something ridiculous on purpose. Not a history lesson.
  3. **One crazy picture** — the craziest moment can be drawn in a single frame (that frame is shot 1).
  4. **Send-to-a-friend** — would a 20-year-old forward it with "bro 😂"? (Shares are ~0 so far: fix this.)
  Write the scores in SCRIPT.md. Low scorers so far: wars, treaties, troop counts, dates (Emu War, Pig War).
- A funny-weird **true** story. Never repeat a topic in `stories/LOG.md`.
- Avoid: gore, tragedies played for laughs, living private individuals, current politics, anything made for kids.
- Verify the key facts with at least two web sources. No invented numbers, quotes or causes.

## 2. Script → `$P/SCRIPT.md`

```
# <Title>

## Script
<70–85 words>

## Shot ideas
```

- Line 1 is the hook, **≤ 8 words**: the craziest fact or a hard question, mid-action ("This bridge is being eaten… by spit.").
  No date, place or full name in the first two lines (if a date matters, say it later, once).
- **No context-only lines.** Every 3–4 s there is a new escalation, joke or gross/absurd detail; if a line would not
  make a friend react, cut it. At most 2 numbers in the whole script.
- One "wait, it gets worse" twist in the last third; end on a punchline, never a summary.
- Short sentences, one beat each, "…" for a dramatic pause.
- **Loop ending:** the last words hand back to the first line ("…All for" → "A chicken that…").
- Also write the on-screen hook title, two short lines (e.g. `LIVED 18 MONTHS|WITH NO HEAD!`).

## 3. Voice (free, Kokoro v0.19, voice `am_michael`)

```bash
sed -n '/## Script/,/## Shot ideas/p' $P/SCRIPT.md | sed '1d;$d' > $P/voice/script.txt
python3 $P/tools/tts.py /home/claude/models/kokoro-en-v0_19 /home/claude/models/cmudict/cmudict.dict \
    $P/voice/script.txt $P/voice/tts.wav --voice am_michael --speed 1.12 [--lex $P/voice/lex.txt]
ffmpeg -y -i $P/voice/tts.wav -ar 48000 -ac 1 $P/voice/voice.wav
ffmpeg -y -i $P/voice/voice.wav -ar 16000 -ac 1 -c:a pcm_s16le $P/voice/v16.wav
python3 $P/tools/asr.py /home/claude/models/sherpa-onnx-whisper-base.en/base.en $P/voice/v16.wav $P/voice/transcript.txt
```

The transcript must match the script word for word (numbers may come back as digits). A mispronounced name: add a
line `name IPA` to `lex.txt` (stress mark `ˈ` before the stressed vowel, same symbols as `tts.py --print`) and redo.
Aim for **25–35 s** (shorter = higher % viewed = more reach). Over 36 s: cut words, do not speed up past 1.15.

## 4. Word timings

```bash
python3 $P/tools/align.py $P/voice/voice.wav $P/voice/words.json $P/SCRIPT.md
python3 $P/tools/snapwords.py $P/voice/voice.wav $P/voice/words.json
```

## 5. Animate: `render/src/story.js` (+ new sets in `render/src/world.js`)

- Copy the structure of the Mike `story.js`: `shot({ at: S("phrase"), light, cam: push(...), stage(t, out) {...} })`,
  one shot per beat, a cut every ~1.0–1.5 s, 22–28 shots, something moving in every shot. Phrase lookups match the first occurrence after `a`: use
  two-word phrases when a word repeats ("His name", not "His").
- Shot 1 is the hook moment, **already in motion on frame 0** (no establishing shot, no slow push-in), with a big
  reaction face. The on-screen hook title is ≤ 6 words, a claim or question (e.g. `EATEN BY SPIT?!`).
- A visual gag on every beat (reaction faces, SFX words, sight jokes); no static shot longer than 2 s. The last shot visually matches shot 1 so the loop is seamless.
- Characters: `pl(i, outfit, x, y, z, { expr, arms, extra, mode, dir/view/phase })`. Rig: expressions in
  `lib/toon.js` FACE (incl. talk_o/e/m, barker_o/e, gasp, sleep, sad), arm poses `arms: { l: [pose, k], r: [pose, k] }`
  (up, overhead, shoulder, chop, out, point, hips, head, shrug, hold, face, feed, low), overalls `bib`, squash `sq`.
  Props are canvas drawings in `extra` that read `p.hands`.
- Animals/objects: draw them on lit cards (`fxCard`, `kind: "lit"`), like `drawMike`.
- Hook title space: keep the top ~30 % of the first 2.5 s clear; captions sit at ~70 % from the top.
- New sets go in a NEW area of `world.js`, at least 2 km from everything else. Used areas: Paris x −600..600 z −700..400
  (river z 230–330 across x ±6000), TRAIN x 1500–6000 z 0..1600, FARM/DESERT/TOUR/FEST x 1300–8000 z −6000..−300,
  OCEAN x ≥ 8000, NAP x −3900..−3100 z 2600..3300, PIG (San Juan Island) x −6200..−5000 z 5100..8600 (strait + hills to z ≈ 8000), RACE (1904 marathon road) x −2300..−1300 z 5200..5900 (dry field quad x ±500 z −400..+300 around [−1800, 5600], hills to z ≈ 4700), indoor rooms at y 2000 (x 0–1200; next free x 1400). Free: x −6000..−1500, z 1000..4500 (keep 2 km from NAP and RACE).
  Keep big scenery (mountains) far from every set.
- Contact sheet after every round of fixes, and look at it:
  `cd $P/render && node render.cjs contact ../out/qa/c/s "" 540 960 && python3 ../tools/sheet.py ../out/qa/c ../out/qa/sheet.jpg`
  Every shot must read at a glance: subject in frame, nothing cut off, no walls blocking the camera.

## 6. Render (background, resumable)

```bash
cd $P/render && until node render.cjs segments ../out/segs 150 1080 1920 x 16 >> ../out/render.log 2>&1 \
  && [ "$(ls ../out/segs/seg_*.mp4 | grep -v part | wc -l)" -ge <ceil(TOTAL/150)> ]; do sleep 5; done
```

Then join and scan: `python3 $P/tools/flicker.py $P/out/video_raw.mp4`. Camera kicks show up on purpose; fix real
one-frame pops by blending the neighbour frames of that segment and re-encoding it (crf 16).

## 7. Sound

Copy `audio/soundtrack_template.py` to `audio/<slug>_soundtrack.py`; keep the SFX library, rewrite the "SFX timeline"
and "SCORE" sections for this story (anchor events to words with `Wd("phrase")`), keep the mix block. Rules: nothing
on the very first word, music ducked under speech, final −14 LUFS / −1 dBTP, end with a 0.04 s fade only (loop).

## 8. Captions + finish

```bash
python3 $P/tools/make_ass.py $P/voice/words.json $P/out/captions.ass "LINE ONE|LINE TWO" 2.55
bash $P/tools/finish.sh $P $P/out/<slug>_mix.wav /mnt/user-data/outputs/<Title_With_Underscores>.mp4
```

Final checks: transcribe the finished file's audio (every word clear), look at 12 sampled frames with captions.

## 9. Publish

```bash
cd /home/claude/yt && git fetch -q origin videos && git checkout -q -B videos origin/videos
cp <final.mp4> videos/<date>-<slug>.mp4 && git add videos && git commit -m "Add Short: <title> (<date>)" && git push origin videos
curl -sSL -o /dev/null -w "%{http_code} %{size_download}\n" https://raw.githubusercontent.com/kumar7ansh888-pixel/Repository-youtube/videos/videos/<date>-<slug>.mp4
```

The URL must return 200 and the file's exact size. Then Metricool `createScheduledPost`:

- `blogId` `8029273`, `date` `<YYYY-MM-DD>T23:00:00+05:30` (if that time has passed, the next free half hour),
- `info`: `autoPublish: true`, `providers: [{network: "youtube"}]`, `media: [<raw URL>]`,
  `publicationDate: {dateTime, timezone: "Asia/Calcutta"}`, `firstCommentText` = a one-line question that invites an opinion (e.g. "Would you have paid the $100? 🐷"), `text` = description (2 lines of story + `#shorts` and 5
  topic hashtags), `youtubeData: {title (≤ 50 chars: the absurd premise in plain words + one emoji, no "True Story", no dates — like "This bridge is being eaten by Spit 🤢"), type: "short", privacy: "public",
  tags (6–8), category: "FILM_ANIMATION", madeForKids: false, isAiGeneratedContent: false}`.

## 10. Record and report

- Add a row to `stories/LOG.md`; copy `SCRIPT.md`, `story.js`, the world.js diff, `words.json`, `captions.ass` and the
  soundtrack script to `stories/<date>-<slug>/`; move the topic in `docs/channel-playbook.md` from ideas to done.
  Commit and push to `engine`.
- Send the person the finished video file and a short message in Hinglish: topic, title, publish time, the Metricool
  planner link.
- Keep the `videos` branch lean: when it holds more than 7 videos, `git rm` the oldest ones.
