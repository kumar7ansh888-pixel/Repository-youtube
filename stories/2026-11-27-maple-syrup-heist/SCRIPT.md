# A Gang Stole $18 Million of Maple Syrup 🥞

## Topic scoring (4 tests, 0–3 each)
| candidate | WTF in 7 words | funny/absurd | one picture | send-to-friend | total |
| --- | --- | --- | --- | --- | --- |
| Great Canadian maple syrup heist: thieves drained the strategic syrup reserve, refilled the barrels with water | 3 | 3 | 3 | 3 | **12** |
| Sir Nils Olav: a penguin knighted by the Norwegian army | 3 | 3 | 3 | 2 | 11 (animal-gets-a-title again right after Bosco) |
| Cadaver Synod: a pope put a corpse on trial | 3 | 3 | 3 | 2 | 11 (religion, corpse) |
| Stephen Hawking's party for time travellers | 3 | 3 | 3 | 2 | 11 (drawing a real disabled scientist) |
| A man sells plots on the Moon | 3 | 2 | 3 | 2 | 10 (living businessman) |
| Wojtek, the soldier bear | 3 | 2 | 3 | 2 | 10 (war) |
| Dancing plague of 1518 | 3 | 2 | 3 | 1 | 9 (deaths disputed) |
| Boston molasses flood | 3 | 1 | 3 | 1 | 8 (deaths) |

## Hook title
$18 MILLION|OF SYRUP?!

## Script
A gang stole eighteen million dollars… of maple syrup.
Yes. Syrup.
Canada keeps a strategic syrup reserve.
Like gold… but sticky.
Thousands of barrels, stacked in one giant warehouse.
Run by an actual syrup cartel. Really.
The plan?
Truck the barrels out.
Suck out the syrup.
Fill them back up… with water.
Roll them back in. Who checks a barrel, right?
They do this for months.
Barrel after barrel after barrel.
Then they sell the syrup, bit by bit… across the border.
But wait… it gets stickier.
One day, an inspector climbs the stack…
and a barrel wobbles.
It's empty.
He nearly falls off.
Then another one. And another.
Thousands of tonnes… gone.
The police arrest the gang.
The ringleader gets eight years in prison…
and a fine of millions.
Still, somewhere out there…
someone ate some very expensive pancakes.
Because one day…

## Shot ideas
Real 3D set SYRUP in world.js: snowy Quebec yard, big warehouse (open front), stacks of white barrels, trucks, maple forest with sap buckets, sugar shack. Hook = thieves rolling a barrel out of the warehouse while syrup sloshes, frame 0 in motion. Loop: last shot = barrel rolling, matches shot 1.

## Sources
- Wikipedia, "Great Canadian Maple Syrup Heist": International Strategic Reserve of the Federation of Quebec Maple Syrup Producers (a legal cartel, 77 % of world supply); 2011–2012 nearly 3,000 tonnes worth C$18.7 million stolen; barrels trucked to a remote sugar shack, siphoned, refilled with water and returned; syrup sold in small batches in Vermont and New Brunswick; at the July 2012 inventory an inspector climbed the barrels, nearly fell, and found them empty; ringleader sentenced to 8 years and a $9.4M fine (2017).
- Mental Floss (2015): "the syrup world's equivalent of OPEC", ~75 % of world supply, "six million pounds of syrup—worth $18 million"; the inspector climbed a barrel that nearly tipped over — empty; ~1,000 more empty barrels found.
- The Canadian Encyclopedia: ~2,700 tonnes, nearly $18 million, Oct 2011–Aug 2012; empty barrels refilled with water and returned; some barrels empty, some water, some rusty; sold via New Brunswick into Ontario and the US.
- TIME (2017): $18.7 million, "dozens of barrels filled with water instead of syrup"; ringleader 8 years + $9.4 million fine.
- Kept out: names (living convicted people), arrest counts (17 vs 26 vs ~30), recovered share (two-thirds vs 450 t), exact tonnage (2,700 vs 3,000: script says "thousands of tonnes").

## YouTube
- Title: A Gang Stole $18 Million of Maple Syrup 🥞
- Description: Canada keeps a strategic reserve of maple syrup. A gang drained it barrel by barrel… and filled the barrels with water.
  #shorts #maplesyrup #heist #truestory #funnystories #didyouknow
- First comment: Would you have checked the barrels? 🥞🕵️
- Tags: maple syrup heist, great canadian maple syrup heist, syrup heist, strategic syrup reserve, funny true story, weird true story, true story shorts, animated story
- Music: original trend.py beat, sneaky comedy → drift phonk at "But wait… it gets stickier" (seed 1127 / 11271, key 45), beat stops under "Really." and "It's empty.".

## Production notes
- SYRUP set (merged into engine world.js, x -11000 z 36000): warehouse shell + roof + jail cell are built in a second Batch with castShadow off, so the sun lights the drums inside; ~1,700 3D drums (perimeter + full top layer, a grey core box inside each block). Hero drums (rolling, wobbling, stamped) are canvas cards (`drawBarrel`, `drawBarrelSide`, `drawBarrelTop` in draw_syrup.js) placed just in front of the 3D wall at x 2.92.
- Framing reminder: at fov 50 the 9:16 frame is only ±0.27·distance wide — the first contact sheet lost the thief + sleeping guard in shot 16 because they stood 1.6 m either side of the look point at 3.4 m.
- align.py put "and a fine of millions" one line early (1 s pause before it); the last three lines were re-timed by syllables inside the measured speech runs (45.12–47.17, 48.25–49.49, 49.86–54.25).
- Kokoro: "wobbles" (wˈɑːbəlz) and "arrest" (əɹˈɛst) needed lex lines; "Thieves stole" was heard as "Thieve stole", so the hook says "A gang stole".
