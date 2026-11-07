# Alpha 0.15.9 — Armory Field Audit & Earned Midgame Build Decisions

## Playable update
The Battle lobby adds a collapsed **Armory Field Audit** once a character actually claims the Seventh First Watch chapter (visible through Chapter IX, hidden again at X). The board uses original engine calculations for the current hero hit damage, wall maximum HP, shot interval, current socketed Ember/Frost/Storm trigger contributions and Fortune Gold contribution, genuinely owned un-equipped gear comparison options, and original one-rank price/deficit for Might, Fortitude and Runic Harmonics. Raw equipment scores come directly from the existing rarity × enhancement multiplier; they are explicitly NOT proof of stronger total DPS, appropriate strategy or a particular chance of victory. Current socket strengths are components only; skills and enemy mechanics also matter. Gear and rune alternatives are merely displayed. Four 44px navigation buttons open existing Equipment, Rune, Training and Research menus. No auto-buying, socketing, new currencies, combat modifications, chapter rewards or added permanent save fields. Existing original fantasy art and iPhone one-column readability are preserved.

## Separate evidence types
The new mandatory 78th CI check is tests/first-watch-build-audit.js. Synthetic fixture state is used **only** to verify the display appears after Chapter VII, disappears after Chapter X, shows true model prices and values, and cannot mutate a character by rendering. These synthetic chapter flags/minutes/clears are **not** described as earned play.

The test then runs a separate deterministic, actual-engine **18 consecutive sieges per policy and seed** (2 seeds × two tier strategies = 72 genuine combat runs): the previously verified earned Tier I→II→III→IV route, followed by either repeating Tier IV or entering legitimately unlocked Tier V and then VI if it genuinely unlocks. Both groups at their natural Chapter VII checkpoint pay real Gold for an enhancement of their original earned Chapter III gear, swap the original earned Chapter V Frost Rune for a different Ember Rune obtained from actual drops, and where affordable buy a real Might rank with its normal Essence price. There is no fabricated inventory, rank, combat time, chapter claim, first-clear ledger or free rune. Save/reload and finite Sigil accounting are checked after these actions.

## Scope
Report only Chapters VIII–X actually granted by the earned runs. Do not extrapolate these few scripted seeds into universal human player results, 750-minute First Watch completion or the ~1,250-active-hour full-game target. Physical iPhone visual, thermal, gesture and endurance testing remains deferred until the locked roadmap is finished, at player direction.

## CI-verified earned Tier V/VI findings
The green 78-check run completed two deterministic seeds × two route strategies × 18 consecutive genuine engine sieges = **72 real simulated sieges**. Every policy earned Chapter VII, paid **182 Gold** to enhance original earned Chapter III gear, and swapped the original earned Frost Rune for an Ember Rune dropped during real battle. All original saves, finite Sigils and first-clear ledgers were verified.

| Seed | Route | Active minutes | Unique first clears | Chapters | Tier IV/V/VI best | Ending Essence / Knowledge / Gold |
|---|---|---:|---:|---:|---|---|
| 15411 | Repeat IV | 167.33 | 129 | 7 | 32 / 0 / 0 | 4,925 / 21,172 / 623,520 |
| 15411 | Push V/VI | 165.67 | 177 | 8 | 28 / 28 / 24 | 3,591 / 21,151 / 640,251 |
| 15423 | Repeat IV | 168.94 | 131 | 7 | 33 / 0 / 0 | 5,198 / 22,477 / 656,573 |
| 15423 | Push V/VI | 166.06 | 181 | 8 | 30 / 28 / 25 | 3,892 / 22,113 / 665,618 |

**Chapter VIII requires 108 active minutes and 162 genuinely unique first-cleared waves.** Both frontier policies earned it naturally and legally unlocked Tier VII after Tier VI wave 20. Neither repeated-Tier-IV policy earned VIII. Chapter IX requires 147 minutes and 221 unique first clears. The time gate is met in both frontier policies, with **44 / 40 additional unique victories** still needed. Chapters IX and X were not earned.

**Actual-cost warning:** All policies paid 182 earned Gold to enhance their existing Chapter III equipment. Another Might rank was unaffordable at the intended upgrade checkpoint, so the optional Might purchase was correctly skipped in all four policies. This could be a meaningful midgame Essence affordability problem, but it is not proof of a systemic economy failure; a rank-specific price-versus-income study is needed. These are not universal success predictions. The same build decisions were applied to both routes, so this study does not isolate the combat effect of Ember vs Frost or enhanced gear. The full 750-minute First Watch, 1,250-hour goal, and manual iPhone visual/thermal acceptance remain unverified.
