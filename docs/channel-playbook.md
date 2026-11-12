# Beyond Normal Daily — Shorts playbook

What we've learned so far making cartoon true-story shorts.

## Format that works
- **Hook first (0–2 s):** open on the craziest moment, not a date or an establishing shot. Add a big bold on-screen title for the first ~2.5 s (e.g. "IT RAINED MEAT… and they ATE it", "LIVED 18 MONTHS / WITH NO HEAD!").
- **Length:** 30–45 s. Narration ~90–110 words. Long (60 s) versions lose viewers.
- **Loop ending:** last line should flow back into the first line; no fade to black at the end. (Mike: "…All for" → "A chicken that lived eighteen months…"; last shot = Mike's statue facing right, first shot = real Mike walking right.)
- **Pacing:** a cut every ~2 s, yellow word-by-word captions, music + SFX.
- **Audience setting:** "No, it's not made for kids"; no 18+ restriction.

## Daily automation (from 2026-11-12)
- One Short a day, published automatically at **23:00 India time** via Metricool (brand 8029273, YouTube channel UCUaVL00Y35TENRYg2h6-1lw), no review step (owner's choice).
- Narration: free Kokoro v0.19 voice `am_michael` made in the cloud (owner's choice; ElevenLabs Ace Adams was used up to Mike).
- Videos hosted in the `videos` branch of github.com/kumar7ansh888-pixel/Repository-youtube; engine on the `engine` branch; procedure in `PIPELINE.md`.

## Results so far (views)
- Eiffel Tower con: ~1.2K in 48 h, 44 likes on 835 views
- Lemon juice robber: 1.7K views, 67% stayed to watch, ~29 s avg watched of 71 s
- Emu War: 1.3K, then flat — every short plateaus at 1–2K (YouTube test batch). Fix = stronger hook, shorter, loop.
- Ghost Army (long video): very low views — focus on Shorts.

## Topics done
Ghost Army, Eiffel Tower sale, Lemon juice robber, Mona Lisa theft, Hitler's nephew (user disliked), Great Emu War, Kentucky meat shower (40 s re-cut with hook), Mike the Headless Chicken (43.6 s, hook + loop format, Nov 2026), Napoleon attacked by rabbits (43.1 s, first fully automated daily run, 2026-11-12).

## Topic ideas not yet used
Pig War (1859), 1904 Olympic marathon, pigeon-guided missiles, Bosco the dog mayor, CIA spy cat (Acoustic Kitty), man who mailed himself, dancing plague of 1518.

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
