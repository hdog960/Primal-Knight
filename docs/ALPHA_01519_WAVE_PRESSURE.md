# Alpha 0.15.19 — Wave-by-Wave Siege Pressure

## Reason for this slice
The locked Alpha 0.15 progression-balance phase has reached a reproducible Tier XVI wall. The prior genuinely earned original-engine cohorts reached best cleared waves 17–19, and a **wave 20 arrival followed by a fortress fall is not a clear**. Neither original Threat Sense nor opt-in Wallguard proved a general solution; cumulative siege totals cannot identify precisely which wave inflicted the decisive damage.

## Implemented player-visible feature
The existing Battle lobby now has a collapsed **Wave Pressure** details panel for the selected, unlocked territory whenever a recent genuinely measured siege exists. It shows the **latest sortie's last six actual individual waves**: each real wave number and cleared/fallen/retreated outcome; enemy kills; true breaches and near-wall kills; actual effective fortress HP removed by breach vs Sapper damage; direct enemy HP removed; landed/launched projectiles; and fortress HP before versus after combat **before** post-clear regeneration. It does not pretend that missed waves were won or that raw direct HP is all-source DPS.

The feature only uses existing live game-engine counters, with one temporary snapshot on `beginWave` and one per-wave measurement on a real `completeWave`, or the terminal incomplete `finishSiege` when a wave actually failed or the player retreated. It explicitly prevents a duplicate terminal row after a completed wave; samples never award currency, change difficulty, restore HP, target enemies, or affect the deterministic RNG. Six rows at most are retained in a bounded in-run array and then stored in the existing **24-entry recent-siege archive**; no extra top-level character save schema, new file, or paid service.

Legacy archives lack `wavePressureTracked` and must remain unlabelled. New optional records are normalized with the existing safe counters, strictly increasing wave numbers, existing recorded wave range, permitted outcomes and clamped projectile/HP counters. Corrupted imported values are dropped or sanitized. Device performance stays bounded by six row records and does not create per-frame DOM, extra sprites or new asset loads.

The UI is fantasy-bronze/forest colored with readable responsive single-column layout on narrow iPhones. Players can review the actual latest failed wave rather than relying only on cumulative pressure. This is diagnostic evidence, not an automatic purchase recommendation.

## Required release verification
Add the **88th mandatory CI regression**, `tests/first-watch-wave-pressure.js`, preserving all 87 previous required checks. It must execute real original engine combat with genuine original-price Training, prove before-heal wave tracking, caps on projectile/enemy objects and six saved rows, old-save migration, original saved character continuation, Sigil/first-clear integrity, no archive reward fabrication, and an early manual retreat fixture. Synthetic corrupted-record normalization is clearly separated from actual earned combat.

Extend `tests/first-watch-siege-pressure.js`, which already executes 344 genuine original career sieges plus 80 original-price late offensive vs mixed and another 80 actual Threat Sense vs Wallguard late sorties, by checking bounded wave samples during real combat and aggregating **genuine measured wave 16–21 pressure** from the 80 saved-checkpoint stance-comparison sieges. The later data should report wave number, observed occurrences, actual completed vs fallen, wall damage, breached enemies, near-wall kills and effective direct-hit HP, with no injected unlocked territories or extra income.

## Integrity boundaries
The same locked 30 × 10,000-wave world, approximately 1,250-hour lifetime design target, 16 First Watch chapters, 483 first-clear Chapter XII threshold, original Tier XVI **wave-20 clear** unlock gate, 24 archive limit, device-local optional targeting stance and unchanged original character save key remain in place. A measured simulation is not physical iPhone visual, battery, touch or sustained performance acceptance; player-requested manual device review remains deferred.

## Actual observed test outcomes
Pending the full original-engine 88-check CI. Report concrete results after the run, then independently re-run PR CI on the final documented commit, merge only after green result, and independently verify merged-main CI and successful GitHub Pages deployment of the exact same SHA.
