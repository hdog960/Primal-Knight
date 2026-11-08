# Alpha 0.15.17 — Breach Response Ledger and Earned Late-Offense Trial

## Goal and preserved design
The previous 0.15.16 evidence found that 344 genuinely executed, original-game-engine sieges plateaued at Tier XVI best cleared waves 18 and 19, below the original wave-20 next-territory gate. Fortitude-first spending increased wall capacity without clearing the blocker. Observed wall damage in those cohorts was chiefly from enemies reaching the fortress. Do **not** change live damage, prices, tier gates or one-time rewards merely to make a graph look better.

## Player-facing implementation
The Battle lobby now contains a compact, collapsed **Breach Response Ledger** for the selected, genuinely unlocked territory, shown only when at least one real recent Siege Chronicle archive record includes both measured wall-pressure and offensive telemetry. It inspects up to the three latest genuinely measured same-territory sorties in the 24-record permanent history.

Each card displays the actual start and last waves, projectile landing percentage (only when launches exist), direct attack HP removed per **simulated fighting second**, measured wall HP lost to enemy breaches and completed Sapper explosions, and close-to-wall kills versus true breaches. The direct-HP rate is intentionally **not all-source DPS**: it excludes burning damage and is not a standardized simulation. If the three records start from different waystones, it explicitly warns that the fights are not directly comparable. Earlier pre-0.15.16 records are excluded rather than presented as measured zero offense. Locked or invalid territories do not expose data.

Three separate, original-price one-rank Hero Training quotes for Might, Reflexes and Fortitude use the **current** earned Essence balance, existing cap and original price function. They are read-only and affordabilities are not claimed to predict performance. The only button opens the existing Training screen via the already protected route. No new save key, stat fields, gear items, rewards, automatic buys, base damage, prices, graphics atlas assets, networking or gameplay changes. The fantasy bronze/stone/green layout collapses to a single mobile column and uses a 44px+ navigation button.

## Test strategy
The original 85 checks remain, plus the new required **86th** `tests/first-watch-breach-response.js`, which tests an actual earned and original-price opening siege and subsequent real archive save/reload, true original observations and Training quotes, read-only UI, old history isolation, fixed-tier filtering, sampled null denominators, mixed-waystone warning, mobile style and actor/projectile caps. Synthetic display fixtures are clearly separate from genuine earned battle evidence.

Extend `tests/first-watch-siege-pressure.js` rather than constructing a fraudulent late-game character:
- Keep all **344 original-engine sieges** of Alpha 0.15.16, including identical genuinely earned first-66-siege mixed/Fortitude careers and legitimate Tier XVI records.
- Capture exact original primary-save bytes **after siege 66** from each seed's mixed-policy actual earned career, with real earned currencies, first clears, First Watch, tiers, gear, runes and Sigils unchanged.
- Reload that exact genuine checkpoint into **two** identical character runs per seed with a shared **fresh** deterministic RNG seed. Run actual siege attempts 67–86 with either Might-only or Might/Reflexes/Fortitude original-cost Training priorities and the existing cumulative nominal spending cap.
- Add **80 further original-engine siege runs** (two seeds × two policies × 20), verify original unlock and character integrity, report actual money spent and exact wave-best outcomes, and never count a Tier XVI wave-20 or Chapter XII achievement unless granted by normal engine.
- The shared initial saved character and RNG seed do not guarantee matching combat events after policy divergence, equal actual lifetime spending or a causal conclusion. Wave progress must not be fabricated. Continue researching offensive pressure if neither policy legitimately advances.

## Release gates
1. New code and all 86 regressions pass on the PR head, including additional 80 genuine late-game engine sieges.
2. Append actual observed counts to this document and the locked roadmap, rerun final PR quality checks on that exact documented commit.
3. Merge only with green final PR CI; confirm independent merged-`main` 86-check CI and GitHub Pages deployment for identical merge SHA.
4. Preserve the player's explicit no-manual-iPhone-playtesting-until-locked-roadmap-end instruction. The full 750-minute First Watch, possible 1,250-hour completion target, iPhone appearance/touch/heat/battery acceptance and deeper endgame economy remain unverified until actually tested.

## Verified pull-request engineering evidence — November 7, 2026

The **corrected PR code head passed all 86 required GitHub quality checks**, including syntax, original engine combat, older-save regressions and the new actually earned UI/Training test. The first PR attempt completed the 80-siege study but failed a **test-only assertion** that compared Gold against its pre-battle amount, despite the game legitimately awarding Gold during the battle. The corrected regression compares pre-/post-*UI-render* values taken after actual combat; the full subsequent 86-check run passed. No live combat, balances or saves were changed to make the test pass.

The original **344 real-engine frontier sieges** remain in the suite, including identical earned 66-siege baselines per seed and the 0.15.16 mixed/guard findings (Tier XVI true best waves 18 and 19, 11 Watch chapters, no Tier XVII). The new 0.15.17 intervention then loaded each seed's exact genuinely saved siege-66 character *twice*, chose an identical fresh deterministic RNG seed per comparison, and ran **80 more genuinely simulated sieges** (two seeds × Might-only versus mixed × twenty original-cost attempts). The current simulated character's historical earned resources, gear/runes, finite Sigils, first-clears, chapters, and legitimately unlocked Tier XVI were all retained. Every purchase debited actually held Essence under the original cumulative nominal cap; *actual* later expenditures differed and must not be described as equal-budget or equal-event causal proof.

| Seed | Original-price late policy | Actual Essence spent after siege 66 | Genuine unique first clears | First Watch chapters | Tier XVI best *cleared* | Breaches over 20 sieges | Effective wall HP lost over 20 sieges | Direct enemy HP removed over 20 sieges |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 15411 | Might only | 72,112 | 390 | 11/16 | 17 | 583 | 43,855 | 13,095,453 |
| 15411 | Might/Reflexes/Fortitude | 72,412 | 390 | 11/16 | 17 | 606 | 45,427 | 13,279,608 |
| 15423 | Might only | 72,112 | 400 | 11/16 | 19 | 592 | 45,295 | 14,675,761 |
| 15423 | Might/Reflexes/Fortitude | 71,845 | 399 | 11/16 | 18 | 610 | 46,719 | 14,547,134 |

The recorded projectile landing counts in the same sequence were 23,804 / 24,215 and 25,117 / 25,047 respectively. In this limited study Might-only reduced actual breaches by **23 / 18**; on seed 15423 it also earned one more genuine Tier XVI first clear than mixed, but no policy completed wave 20. Full Chapter XII (483 unique first clears **and** 322 active minutes), all 16 chapters, late-tier completion, and the roughly 1,250-active-hour lifetime design target are **not verified**. A wave-20 arrival followed by defeat is not a clear.

**Interpretation:** A modest offensive emphasis helped near-wall pressure in these two reloaded seed continuations, but outcomes are not universally causal: total simulated duration, hits, chance events, and real rank purchases diverged after the identical checkpoint. The later policy comparison is also different from the original 344-siege uninterrupted RNG careers; their end records cannot be substituted for one another. The new player ledger reports facts rather than recommending a guaranteed optimum.

**Release discipline:** This result is from the corrected, green 86-check PR code head. After appending these figures to this file and the locked roadmap, the entire PR suite must pass again on the *final documented commit*. Only then merge and independently verify 86/86 merged-main checks and GitHub Pages deployment of exactly that merge SHA. Physical iPhone visual, gesture, sustained FPS/battery/thermal acceptance remains deferred by player request until the locked balancing roadmap is finished.
