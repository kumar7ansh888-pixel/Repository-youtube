# Beyond Normal Daily — Shorts playbook

What we've learned so far making cartoon true-story shorts.

## Format that works
- **Hook first (0–2 s):** open on the craziest moment, not a date or an establishing shot. Add a big bold on-screen title for the first ~2.5 s (e.g. "IT RAINED MEAT… and they ATE it", "LIVED 18 MONTHS / WITH NO HEAD!").
- **Length:** ~1 minute (55–60 s), English narration 140–150 words (owner, 2026-11-15). History: 25–35 s / 70–85 words from 2026-11-13; 1-minute Hindi on 2026-11-14.
- **Loop ending:** last line should flow back into the first line; no fade to black at the end. (Mike: "…All for" → "A chicken that lived eighteen months…"; last shot = Mike's statue facing right, first shot = real Mike walking right.)
- **Pacing:** a cut every ~2 s, yellow word-by-word captions, music + SFX.
- **Audience setting:** "No, it's not made for kids"; no 18+ restriction.

## Music (2026-11-17, owner)
- Owner asked for trending songs. Real ones are copyrighted (Content ID claims/mutes/blocks auto-posted Shorts; licensed trending sounds only work in the YouTube app), so every video now gets an ORIGINAL trending-style beat from `engine/audio/trend.py`: phonk (default), Brazilian funk, or sneaky comedy. Narration stays fully intelligible over phonk at voice − 11 LU with −5 dB ducking (ASR checked).

## Publish time (2026-11-16, owner)
- YouTube Studio, "When your viewers are on YouTube" (last 28 days, IST): viewers peak **18:00–22:00** every day (brightest Sun 18–22, Mon 19:00, Wed 20:00, Thu/Sat 19:00), are moderate 08:00–18:00, fade after 22:00 and are near zero 00:00–06:00. So publish at **18:30**, just before the peak; the daily run starts at 10:37.

## Format change (2026-11-15, owner)
- Back to **English** for everything: narration (Kokoro `am_michael`), captions, hook title, YouTube title/description/first comment, and the daily message. Keep the ~1-minute length. `docs/HINDI.md` is retired.

## Format change (2026-11-14, owner; superseded 2026-11-15)
- From then: ~1-minute videos narrated in **Hindi** (free Piper voice Pratham, owner's pick), captions/title in Hinglish. Procedure: `docs/HINDI.md`. (Note: 25–35 s English cuts had the better retention so far; watch whether 1-min Hindi does better in India.)

## Daily automation (from 2026-11-12)
- One Short a day, published automatically at **18:30 India time** (from 2026-11-16; was 23:00) via Metricool (brand 8029273, YouTube channel UCUaVL00Y35TENRYg2h6-1lw), no review step (owner's choice).
- Narration: free Kokoro v0.19 voice `am_michael` made in the cloud (owner's choice; ElevenLabs Ace Adams was used up to Mike).
- Videos hosted in the `videos` branch of github.com/kumar7ansh888-pixel/Repository-youtube; engine on the `engine` branch; procedure in `PIPELINE.md`.

## What the numbers say (Windsor, last 29 days, read 2026-11-17)
| Short | views | engaged (not swiped) | avg % viewed | shares |
| --- | --- | --- | --- | --- |
| This bridge is being eaten by Spit 🤢 (1:39) | 3,046 | 71% | 55% | 2 |
| The Man Who Stole the Mona Lisa 🖼️ (0:58) | 2,868 | 65% | 67% | 1 |
| This Chicken Lived 18 MONTHS Without a Head 🐔 (0:44) | 2,583 | 57% | 68% | 0 |
| He Robbed a Bank Wearing Lemon Juice 🍋 (1:11) | 2,443 | 60% | 70% | 0 |
| The Day It Rained MEAT 🥩 (0:42) | 1,624 | 47% | 70% | 0 |
| The Man Who Sold the Eiffel Tower (1:31) | 1,493 | 61% | 59% | 0 |
| Australia Declared War on Birds… and LOST 🐦 (0:52) | 1,460 | 59% | 52% | 0 |
| India Disguised the Taj Mahal… 🤯 (1:55) | 1,179 | 57% | 50% | 0 |
| Napoleon Lost a Battle… to BUNNIES 🐰 (0:43) | 1,094 | 43% | 67% | 1 |
| The Pig War: 461 Soldiers vs 5 Warships… Over a PIG 🐷 (0:43) | 1,080 | 49% | 55% | 0 |
| Hindi rat poison (11-14) / exploding whale (11-15) / airplane eater (11-16) | not in Windsor yet | – | – | – |
Lessons: 30–57% swipe away in the first seconds, so the first second decides everything; gross/absurd + modern
(spit bridge) and dumb crime (lemon juice) beat war/history-lesson topics; shares are ~0, so pick send-to-a-friend
stories. Owner's direction (2026-11-13): more interesting, shocking and funny; see PIPELINE step 1 scoring.

## Results so far (views)
- Eiffel Tower con: ~1.2K in 48 h, 44 likes on 835 views
- Lemon juice robber: 1.7K views, 67% stayed to watch, ~29 s avg watched of 71 s
- Emu War: 1.3K, then flat — every short plateaus at 1–2K (YouTube test batch). Fix = stronger hook, shorter, loop.
- Ghost Army (long video): very low views — focus on Shorts.

## Topics done
Ghost Army, Eiffel Tower sale, Lemon juice robber, Mona Lisa theft, Hitler's nephew (user disliked), Great Emu War, Kentucky meat shower (40 s re-cut with hook), Mike the Headless Chicken (43.6 s, hook + loop format, Nov 2026), Napoleon attacked by rabbits (43.1 s, first fully automated daily run, 2026-11-12), Pig War 1859 (43.3 s, 2026-11-13), 1904 Olympic marathon / gold on rat poison (2026-11-14: English 34 s cut made, then replaced by the first Hindi 1-min cut, 57 s), Oregon exploding whale 1970 (2026-11-15, English 1-min, 56.8 s), Monsieur Mangetout / the man who ate an airplane (2026-11-16, English 1-min, 56.0 s), Paul the Octopus / World Cup oracle (2026-11-17, English 1-min, first trend.py beat: funk → phonk).

## Topic ideas not yet used (re-score with the 4 tests before using; prefer funny/gross/absurd)
pigeon-guided missiles, Bosco the dog mayor, CIA spy cat (Acoustic Kitty), man who mailed himself, dancing plague of 1518.

## Production notes
- Airplane-eater set (`AIR` in world.js, x −7200 z −2000; the global grass ends at x −8000): banquet table at the origin (cloth box, top y 0.75, front z +0.55),
  the eater stands behind it at z −0.9 (only his upper body shows, so use raised arm poses: face, shoulder, point, up), runway quad y 0.10 at z −15..−5,
  plane card at z −9.5, white picket fence z −3.6 (gap at the table), red hangar at x −24 z −42, windsock x +16 z −20. Plane (drawPlane with `eat` /
  `bite`), plate, saw, oil bottle, bike, cart, TV (cake stand), skis, chandelier, coffin (handles count), plaque (bite), banana, egg, menu, x-ray, marquee,
  warning sign and record book are canvas cards in that story.js; `biteCut` / `biteAt` carve scalloped bites with destination-out.
- Props on a table: a card's lower half sinks into the table box — use `sink` ≈ 0.2 for plates, not 0.5.
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
- Exploding-whale set (`BEACH` in world.js, x −4800 z 1400): sand quad y 0.10 (no polygon offset), the sea plane (y 0.08) to −z from z −8 with foam strips, a dune ridge z 14..32 with a flat crest y ≈ 2.7 at z 20..26 (`crest(z)` in that story.js), a parking lot z 34..62, pines z 72+, headlands far out. The whale, TNT crate pile, plunger, seagulls, blubber lumps/splats, the 1970 sedan (crushed variant) and the park / "whale of a deal" signs are canvas cards in that story.js; `blast(out, e)` draws a whole explosion from seconds-since-detonation (soft round burst, fire→smoke puffs, sand column, ballistic chunks), and the loop shot counts up to the blast so the cut into shot 1 lands mid-explosion.
- A sign card faces +z by default: a camera on the beach looking at the dune (+z) sees it mirrored; give it `normal [0, 0, -1]`.
- `DR.burst` is a hard-edged square: for a big flash use a radially masked burst (`DR3.boom` in the whale story.js).
- Paul-the-Octopus sets (indoor rooms at y 2000): `aqua` x 1400 (dark-blue aquarium hall, glowing wall tanks, pedestal at the origin top y 1.0, rope line z +1.6),
  `press` x 1600 (Spanish-flag backdrop, podium top y 0.96 so a standing adult's face clears the mics), `fiesta` x 1800 (copper cauldrons, long tables, bunting).
  Next free room x 2000. The tank is ONE portrait canvas card (768 x 1024, 0.96 x 1.28 m) holding the water, the two flag boxes and Paul (`drawTank` / `drawPaul` /
  `drawBox` in that story.js): drawing the animal inside its tank as one card keeps every tank shot readable and cheap. Flags GER/SRB/ESP/NED/AUS are `flatFlag`.
- Whisper base splits long audio into chunks; a word cut at a chunk edge looks like an error ("octoprene"). Re-check suspicious words on a 10–12 s window before blaming the mix.
