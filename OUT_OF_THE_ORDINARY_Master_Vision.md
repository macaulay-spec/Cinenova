# OUT OF THE ORDINARY — Master Vision & Build Spec
### A Cinenova Original · for Aria · synced to a 3:11 love song
**Status:** APPROVED DIRECTION · living document · branch `arena/019fc9be-cinenova`

> Thesis (the song's own argument, in our words): love doesn't escape the
> mundane — it transfigures it. Laundry, groceries, one shared umbrella:
> with the right person, the ordinary becomes holy ground. The website IS
> that argument: it begins grey, and a chorus sets it on fire.

---

## 1. CORE DECISIONS (locked)

1. **It's a video website.** After the intro tap, the film **auto-plays**
   (the tap is the user gesture that legally unlocks audio). The visitor
   sits back; the site performs. Skipping or finishing the film unlocks
   the scrollable universe ("wander mode") — everything already built.
2. **Real memories, real couple.** Every photograph is photorealistic and
   shows the SAME two people (character lock, §3), aged **20–21**, shot
   like camera-roll photos (phone flash, motion blur, imperfect framing)
   so nobody can tell they're generated. No emoji art as primary imagery;
   generated SVG art remains only as an offline fallback.
3. **Two worlds, one turn.** ACT I "THE ORDINARY" = the same color photos
   shown in near-monochrome with quiet captions. THE TURN (first chorus) =
   filters release, color floods, the universe ignites. ACT II = the
   existing rose-gold universe, reframed as the extraordinary half.
4. **The song is the spine.** Cues are stored as *percentages of duration*,
   so the film syncs to ANY audio: the user's own copy of the track
   (bring-your-own, played on-device — never redistributed) or the shipped
   original synth sketch in the same I–V–vi–IV feel.
5. **Copyright-safe poetry.** Captions and VO are ORIGINAL lines that echo
   the song's themes. No lyric text appears anywhere in the code or UI.
6. **Canon: the 3-year anniversary.** Together since **2023-10-12**
   (`CONFIG.togetherSince`). All story dates run 2023→today; the hero
   shows a live "days of us" counter; credits read "three years · N days".

## 2. EXPERIENCE FLOW (end to end)

```
[black] heartbeat → loading lines → "tap to begin ✦"
   tap (unlocks audio)
TITLE CARD ......... poster + VO-title + "CINENOVA ORIGINAL"
   ↓ auto
FILM MODE .......... 3:11 cue-driven cinema (auto-play, pausable)
   progress hairline · pause ⏸ · "skip to the universe →"
   ↓ auto at 100%
CREDITS ROLL ....... "directed by Leo · starring Aria · …"
   ↓ auto
TWO DOORS .......... [ ↺ replay the film ]  [ ✦ wander the universe ]
WANDER MODE ........ existing scroll experience (galaxy, timeline,
   scrapbook, bottles, letter, sky, stats, wheel, promises, secret)
```

Wander mode is also reachable any time via the ✦ monogram; Film mode is
re-openable from the music dock (🎬 button).

## 3. CHARACTER LOCK (paste into EVERY image prompt)

> COUPLE: "a young Nigerian couple, both around 20-21 years old — the
> woman with shoulder-length dark curly hair, youthful face, minimal
> makeup; the man with short black hair and light stubble, boyish smile."
> STYLE: "ultra-realistic candid smartphone photo from a real camera roll,
> NOT staged — real skin texture with pores, slight motion blur, imperfect
> snapshot framing, authentic amateur photo feel." FUTURE: "the same
> couple now in their seventies — her soft grey curls, his grey beard."

Wardrobe anchors for continuity: her blush-pink sweater (café), yellow
sundress (hill), his flannel shirt (road), denim jacket (road).

## 4. FILM TIMELINE — cues at 3:11 (percent · time · everything)

| % | ~time | visual | caption (original) | audio/VO |
|---|-------|--------|--------------------|----------|
| 0 | 0:00 | black, single star | *they said our colors would fade.* | VO-film-open |
| 4 | 0:08 | ord-mugs (grey) | *two mugs. one windowsill.* | synth, sparse |
| 8 | 0:15 | ord-keys (grey) | *your keys next to mine — the merger.* | |
| 12 | 0:23 | ord-umbrella (grey) | *one umbrella, two shoulders.* | rain foley-ish pad |
| 16 | 0:31 | ord-laundry (grey) | *laundry day. holiest of holies.* | |
| 20 | 0:38 | ord-groceries (grey) | *the grocery run: a pilgrimage.* | build begins |
| 24 | 0:46 | black | *and then — you.* | silence, 1 beat |
| 26 | 0:50 | **THE TURN** — ord-mugs floods to full color, glow-bloom, star-burst, confetti | **OUT OF THE ORDINARY** (title slam) | chorus energy; VO-turn |
| 33 | 1:03 | memory-01 color | *scene one: the first hello.* | |
| 40 | 1:16 | memory-02 color | *you, spinning. me, ruined.* | |
| 47 | 1:30 | memory-03 color | *2am fries & forever talks.* | |
| 54 | 1:43 | memory-04 color | *anywhere, as long as it's with you.* | |
| 61 | 1:57 | memory-05 color | *the pasta could wait.* | |
| 68 | 2:10 | memory-06 color | *you wished out loud. I already had you.* | |
| 75 | 2:23 | bridge: paper texture, letter line types | *you will be loved on every single day of it. the ordinary ones, most of all.* | VO-letter (excerpt) |
| 82 | 2:36 | fut-kitchen | *same kitchen. fifty years on.* | VO-future |
| 89 | 2:50 | fut-porch | *still ordinary. on purpose.* | |
| 95 | 3:01 | black, heart of stars forms | *thank you for existing.* · *happy birthday, Aria.* | VO-secret |
|100| 3:11 | credits roll | full credits | fade out → doors |

Interaction during film: tap = pause/resume; hairline progress scrubs on
drag; "skip →" jumps to doors. Keyboard: space pause, → skip.

## 5. IMAGE MANIFEST — exact prompts

### Done ✅ (in `assets/`)
- **memory-01** café: COUPLE + "at a small round café table by a rain-speckled window; her in a blush pink sweater laughing mid-sentence; him in a dark jacket smiling at her like she's the only person alive; two latte cups, golden window light."
- **memory-02** hill: COUPLE + "holding both her hands, spinning her slowly in a yellow sundress, both laughing; vast rose-gold sunset."
- **memory-03** bench: COUPLE + "at 2am sharing a paper bag of fries; her in an oversized hoodie laughing head-back; him pointing off-camera grinning; neon bokeh."
- **memory-04** road: COUPLE + "leaning on the hood of a parked vintage car at dusk; him in flannel, her denim jacket resting on his shoulder; lavender sky, first stars."
- **memory-05** kitchen: COUPLE + "slow-dancing in a cozy kitchen at night; her laughing against his chest; fairy lights, steaming pot, one candle."
- **memory-06** stars: COUPLE + "on a picnic blanket under the milky way; him pointing at a shooting star; her eyes wide with delight; lantern glow."
- **ord-mugs** "two mismatched ceramic mugs steaming on a worn kitchen counter, one blush pink one midnight blue, soft grey morning light." (shown grey in Act I, color at THE TURN)
- **ord-keys** "ceramic bowl by an apartment door holding keys with a tiny heart keychain, overcast daylight."
- **ord-umbrella** COUPLE + "sharing one black umbrella, walking toward camera, shoulders pressed, smiling at each other; wet pavement." (muted)
- **ord-laundry** COUPLE + "on the floor by an open laundry basket; her holding two mismatched socks mock-serious; him laughing." (muted)
- **ord-groceries** "shopping cart at dusk, baguette and blush flowers in a paper bag; two silhouettes walking away arm in arm." (muted)
- **fut-kitchen** FUTURE + "slow-dancing in the same cozy kitchen, foreheads touching, quiet smiles; morning light."
- **fut-porch** FUTURE + "on a wooden porch swing at sunrise wrapped in one knitted blanket; two mugs on the railing."
- **poster** heart-nebula title art · **pol-\*** scrapbook polaroids · **vo-\*** narration clips.

### Pending ⏳ (Phase 1 finish)
- **ord-toothbrush** "two toothbrushes — one pink one blue — in a single ceramic cup on a bathroom shelf, mirror bokeh, grey morning light." (muted)
- **ord-fridge** "a fridge door covered in printed photos, magnets and a child's drawing of two stick figures holding hands, warm kitchen spill-light." (muted)
- **ord-window** "rain trails on a window, two mugs on the sill, a shared blanket draped over a chair, grey-blue quiet light." (muted)
- **ord-tickets** "two creased cinema ticket stubs and a polaroid of the couple mid-laugh on a wooden table, soft lamp light." (muted)
- **fut-road** FUTURE + "the same vintage car parked on the same road at dusk; two grey-haired figures leaning on the hood exactly like the young version."

## 6. VOICEOVER SCRIPTS (one consistent "him")

- **VO-title (existing):** "Cinenova original. Out of eight billion stories… this one is ours."
- **VO-film-open ✅:** "They said our colors would fade. …They were wrong."
- **VO-turn ✅:** "And then — you. And nothing about us… was ordinary again."
- **VO-letter (existing):** full letter read (~50s) — used in film bridge AND wander-mode letter scene.
- **VO-future ✅:** "Same kitchen. Same us. Fifty years from now — we're still dancing."
- **VO-secret (existing):** "You found the hidden heart. …Thank you for existing, Aria. Happy birthday."

## 7. MUSIC (legal + technical)

- Shipped: original WebAudio synth sketch — F→C→Dm→B♭, bass root→fifth,
  lift notes, dreamy delay. (Inspired-by, not a copy.)
- Bring-your-own: Film mode offers "use my own song" → paste URL **or**
  pick a local file. Played from the visitor's device only; nothing is
  hosted, embedded, or redistributed. Cue engine reads real
  `duration`/`currentTime`; without a track, the synth drives the same cues.

## 8. TECH ARCHITECTURE (what changes in code)

1. **CueEngine** — array of `{p, img, cap, vo, fx, cls}`; rAF compares
   `audio.currentTime/duration` (or synth clock) → fires cues once;
   scrubs backwards safely on seek (re-apply state idempotently).
2. **ColorFlood** — `.ordinary` root class sets `img{filter:grayscale(.92)
   contrast(.9) brightness(.95)}`; THE TURN removes it with a 1.6s ease +
   `drop-shadow` bloom + one confetti storm + star-burst in the bg canvas.
3. **FilmOverlay** — fixed layer: letterboxed stills (slow Ken-Burns
   scale/pan), caption serif-italic lower-third, progress hairline,
   pause/skip controls; GSAP crossfades; pauses when tab hidden.
4. **Doors** — post-credits choice; wander mode = current build untouched.
5. Graceful degradation: no GSAP/audio → captions still sequence on a
   silent timer; images keep `onerror` SVG fallback.
6. Perf/a11y: ≤2 canvases active in film mode; `prefers-reduced-motion`
   swaps Ken-Burns for stills + instant captions; captions double as
   on-screen text for the VO (a11y parity); all controls keyboard-reachable.

## 9. PHASES

- **P1 (now):** realistic couple set ✅ + pending ordinary/future stills.
- **P2:** CueEngine + FilmOverlay + doors + auto-play flow.
- **P3:** THE TURN color-flood + caption/VO wiring + film controls.
- **P4:** wander-mode retheme tags ("the ordinary, made holy" etc.) +
  relics shelf scene if time.
- **P5:** new VO clips + copy pass + credits rewrite.
- **P6:** jsdom harness extensions, commit, push.

## 10. RIGHTS

Track is user-provided at runtime (personal, on-device). All imagery is
AI-generated original. Captions/VO are original. No lyric text ships.
