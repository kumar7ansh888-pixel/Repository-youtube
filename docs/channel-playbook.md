# Beyond Normal Daily — Shorts playbook

What we've learned so far making cartoon true-story shorts.

## Format that works
- **Hook first (0–2 s):** open on the craziest moment, not a date or an establishing shot. Add a big bold on-screen title for the first ~2.5 s (e.g. "IT RAINED MEAT… and they ATE it", "LIVED 18 MONTHS / WITH NO HEAD!").
- **Length:** 25–35 s. Narration 70–85 words (from 2026-11-13; 43 s versions plateaued under 1K). Long (60 s) versions lose viewers.
- **Loop ending:** last line should flow back into the first line; no fade to black at the end. (Mike: "…All for" → "A chicken that lived eighteen months…"; last shot = Mike's statue facing right, first shot = real Mike walking right.)
- **Pacing:** a cut every ~2 s, yellow word-by-word captions, music + SFX.
- **Audience setting:** "No, it's not made for kids"; no 18+ restriction.

## Format change (2026-11-14, owner)
- From now on: ~1-minute videos narrated in **Hindi** (free Piper voice Pratham, owner's pick), captions/title in Hinglish. Procedure: `docs/HINDI.md`. (Note: 25–35 s English cuts had the better retention so far; watch whether 1-min Hindi does better in India.)

## Daily automation (from 2026-11-12)
- One Short a day, published automatically at **23:00 India time** via Metricool (brand 8029273, YouTube channel UCUaVL00Y35TENRYg2h6-1lw), no review step (owner's choice).
- Narration: free Kokoro v0.19 voice `am_michael` made in the cloud (owner's choice; ElevenLabs Ace Adams was used up to Mike).
- Videos hosted in the `videos` branch of github.com/kumar7ansh888-pixel/Repository-youtube; engine on the `engine` branch; procedure in `PIPELINE.md`.

## What the numbers say (Windsor, last 29 days, read 2026-11-14)
| Short | views | engaged (not swiped) | avg % viewed | shares |
| --- | --- | --- | --- | --- |
| This bridge is being eaten by Spit 🤢 (1:39) | 3,037 | 71% | 55% | 2 |
| The Man Who Stole the Mona Lisa 🖼️ (0:58) | 2,770 | 65% | 66% | 1 |
| He Robbed a Bank Wearing Lemon Juice 🍋 (1:11) | 2,440 | 60% | 70% | 0 |
| This Chicken Lived 18 MONTHS Without a Head 🐔 (0:44) | 2,140 | 57% | 67% | 0 |
| The Man Who Sold the Eiffel Tower (1:31) | 1,491 | 61% | 59% | 0 |
| Australia Declared War on Birds… and LOST 🐦 (0:52) | 1,458 | 59% | 52% | 0 |
| The Day It Rained MEAT 🥩 (0:42) | 1,317 | 43% | 71% | 0 |
| India Disguised the Taj Mahal… 🤯 (1:55) | 1,173 | 57% | 50% | 0 |
| Napoleon (11-12) / Pig War (11-13) | not in Windsor yet | – | – | – |
Lessons: 30–57% swipe away in the first seconds, so the first second decides everything; gross/absurd + modern
(spit bridge) and dumb crime (lemon juice) beat war/history-lesson topics; shares are ~0, so pick send-to-a-friend
stories. Owner's direction (2026-11-13): more interesting, shocking and funny; see PIPELINE step 1 scoring.

## Results so far (views)
- Eiffel Tower con: ~1.2K in 48 h, 44 likes on 835 views
- Lemon juice robber: 1.7K views, 67% stayed to watch, ~29 s avg watched of 71 s
- Emu War: 1.3K, then flat — every short plateaus at 1–2K (YouTube test batch). Fix = stronger hook, shorter, loop.
- Ghost Army (long video): very low views — focus on Shorts.

## Topics done
Ghost Army, Eiffel Tower sale, Lemon juice robber, Mona Lisa theft, Hitler's nephew (user disliked), Great Emu War, Kentucky meat shower (40 s re-cut with hook), Mike the Headless Chicken (43.6 s, hook + loop format, Nov 2026), Napoleon attacked by rabbits (43.1 s, first fully automated daily run, 2026-11-12), Pig War 1859 (43.3 s, 2026-11-13), 1904 Olympic marathon / gold on rat poison (2026-11-14: English 34 s cut made, then replaced by the first Hindi 1-min cut, 57 s).

## Topic ideas not yet used (re-score with the 4 tests before using; prefer funny/gross/absurd)
pigeon-guided missiles, Bosco the dog mayor, CIA spy cat (Acoustic Kitty), man who mailed himself, dancing plague of 1518.

## Production notes
- When cutting narration, cut only at measured silences and never split sentences that run together — a clipped word sounds like the voice "cracking".
- Don't stack SFX/music hits on the first spoken word.
- Word timings: after align.py, snap words that straddle a "…" pause to the pause end (`snapwords.py`), and split caption chunks at "…" too.
- Rig: arm poses (`arms: { l: [pose, k], r: [pose, k] }` — up, overhead, shoulder, chop, out, point, hips, head, shrug, hold, face, feed, low), talking mouth expressions (talk_o/e/m, barker_o/e), sleep/gasp/sad faces, overalls `bib`, card squash `sq`. Props read `p.hands` to sit in the hands.
- Phrase lookups in story.js match the first occurrence: "His" matched "swings his axe"; use two-word phrases for repeated words.
- Two characters that must line up (a hand and a prop on another card): put them at the same depth to avoid parallax, then compute offsets from the rig numbers (adult: W 236, u 2.36, T.a 89, HH ≈ 222, chin ≈ 420, shoulder y ≈ 447; 1 unit = 2.16 mm).
- World layout pitfall: keep big scenery (mountains, mesas) well away from every set; a desert mountain cone once swallowed the festival set.
- Display fonts (Rye, Alfa Slab One, Bangers) are in engine/render/fonts.
- Remotion can't run in the cloud (npm blocked).
- Napoleon set (`NAP` in world.js, x −3500 z 3000): meadow, château, lunch tent, six hutches at z = NAP, hunters' line z +9, coach on the poplar drive x −12. New rig hat `bicorne` (+ `plume`, `trim`), new vehicle `coach` (mat "coach"). Bunnies/horses are canvas cards (drawBunny / drawHorse in that story.js) — reuse them for any animal story.
- Render speed in the cloud: ~2.3 s/frame at 1080×1920 on 2 CPUs (≈50 min for 43 s).
- Pig War set (`PIG` in world.js, x −5600 z 5600): Cutlar's log cabin + potato patch at the origin, American tents x +10..+23 and redoubt with 7 cannons at x +30 z +6, British tents x −28..−14, beach z +33..+43, the strait (water plane) beyond +z with Vancouver Island hills. Pig / 1859 man-of-war / waving US + Union flags are canvas cards (drawPig, drawShip, drawFlag in that story.js). New rig options: bicorne `cockade` (plain colour instead of the French tricolour), helmet `spike` (pickelhaube).
- Kokoro at speed 1.1 kept a 102-word script at 43.7 s (1.05 gave 45.2 s); at 1.12 an 85-word script ran 34.5 s.
- 1904 marathon set (`RACE` in world.js, x −1800 z 5600): dirt road along x (z ±3), back fence z −5.2 + telegraph poles z −7.5, finish grandstand + arch at x −40, apple orchard x +42..+70 z −10..−28. The 1904 motor car is a canvas card (drawCar + a separate seat-back card so a seated passenger sits between them), plus drawBottle (skull label, `flip` for drinking poses), drawRat, angry sun, recipe insert — all in that story.js. Card extras are cached by o + opts only, so give `o` an `xk` key when a prop changes (medal swing, falling wreath).
- Don't put a camera behind a fence: the near fence blocked a shot until it was removed.
- Rat-poison render: 8 single frames flashed the bright-green global grass through the dry field/road quads (low road-level cameras). flicker.py only caught some; a per-frame green-pixel mask (count frames greener than both neighbours) found them all; fixed by blending neighbours. Consider raising set ground quads (field 0.05 / road 0.07) further above the global grass.
- A name ribbon must face the camera (`tag(..., nrm)`): with the camera looking along x the default [0,0,1] shows it edge-on.
