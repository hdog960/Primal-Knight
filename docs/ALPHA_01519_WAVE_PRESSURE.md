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

## Verified PR code result — November 7, 2026

The revised, playable PR branch passed all **88 mandatory checks**. A targeted short workflow independently passed old-history migration, the new paid opening battle/test, and existing Wallguard behavior, and was removed once complete. The larger original-engine suite preserved **344 authentic earned career sieges**, **80 genuinely funded late Might-vs-mixed comparison sieges**, and **80 further same-earned-checkpoint Threat Sense vs Wallguard siege attempts** without injected unlocks or currencies. All baseline save, reward, finite Sigil, first-clear and tier-gate assertions passed.

The **last-six-wave recorder produced actual individual outcomes** instead of treating a wave's arrival as a clear. In two genuine paid opening battles, one seed cleared six waves and fell during wave seven, while the other cleared seven and fell during wave eight. The archive kept six real waves per sortie; a separate synthetic cancellation fixture checked one incomplete retreat row and no double-counting. Malformed imported counters and old archives were kept safe.

The 80 late-stance attempts started from two **exactly saved, genuinely earned** Tier XVI post-66-siege characters. Each seed replayed two stances with the same subsequent purchase policy and initial deterministic RNG seed. They produced these **observed wave results** from actual combat, not probability predictions:

| Wave | Actual observed arrivals | Completed genuine waves | Fortresses falling in that wave |
|---|---:|---:|---:|
| 16 | 80 | 80 | 0 |
| 17 | 80 | 58 | 22 |
| 18 | 58 | 22 | 36 |
| 19 | 22 | 3 | 19 |
| 20 | 3 | **0** | **3** |

This is a **conditional sequence of 80 scripted combat continuations across only two underlying earned characters**, not 80 independent players or a broadly estimated win rate. Early losses reduce sample size at later waves. The unmodified mechanics were not tuned during this release.

The raw per-policy recorded sequences provide further detail:

| Seed | Stance | Cleared wave 17 | Cleared wave 18 | Cleared wave 19 | Cleared wave 20 | Tier XVI personal best *cleared* |
|---|---|---:|---:|---:|---:|---:|
| 15411 | Threat Sense | 11 / 20 arrivals | 0 / 11 | – | – | 17 |
| 15411 | Wallguard | 9 / 20 | 1 / 9 | 0 / 1 | – | 18 |
| 15423 | Threat Sense | 19 / 20 | 10 / 19 | 2 / 10 | 0 / 2 | 19 |
| 15423 | Wallguard | 19 / 20 | 11 / 19 | 1 / 11 | 0 / 1 | 19 |

**Interpretation:** The problem is not an isolated gate condition or a mysterious wave-20 reward issue. Successful continuation becomes uncommon across waves 17–19 and no observed run survives wave 20. Wave-20 vanguard battles are still ordinary combat encounters, and original gate checks correctly require *completion*. Some runs still reach wave 20 with little wall HP and rapidly fall, consistent with accumulated preceding-wave pressure; no causal claim about the precise enemy or optimal intervention follows from these two seed paths alone.

Cumulative wall HP removed by breaches, direct damage delivered, near-wall kills and shot outcomes remain tied to the original engine. Post-clear healing is excluded from each wave's end HP recording, so the player can see how close the fortress was to falling **before the next wave's regeneration**. No extra one-time rewards or First Watch progress was created by these measurements. Tier XVII did not unlock; First Watch remains 11/16 in the late cohorts, with Chapter XII's 483 distinct first clears unearned. Human long-session 750-minute Watch, approximately 1,250-hour lifetime balance, and real iPhone visual/gesture/endurance sign-off remain unverified.

**Release gate after documenting:** This evidence came from a green playable PR head. The complete 88-test suite must pass again for the final evidence-and-roadmap commit, then a separate merged-`main` 88-test run and Pages deployment must succeed for the exact merged commit. Do not label this release public before all of those events have been observed.

