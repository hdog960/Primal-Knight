# Alpha 0.15.15 — Siege Pressure Audit & Tier XVI Breakthrough Validation

## Playable addition
The existing illustrated **Siege Chronicle** and bounded persistent recent-siege archive now distinguish two sources of actual fortress HP lost:
1. **Enemy breach impact:** measured wall HP lost after an enemy reaches the wall, after existing resistance and Thorn defenses.
2. **Sapper explosion impact:** measured wall HP lost from a successfully completed Sapper fuse.

The counters use real *effective wall HP lost*, clipped to the current remaining wall HP, not raw hypothetical damage. They reset at the start of each genuinely new siege, are rounded to safe nonnegative integer totals in the final report, and are shown only for runs that were actually recorded with the new measurement. **Older local save records remain valid and do not display unmeasured zero damage as fact.** New siege archive entries retain only two bounded counters and one boolean flag, through the existing normalizer and 24-entry history limit. No new top-level save fields, currency, rewards, combat buffs, rank prices, territory gates, art assets, game dependencies or automatic purchases.

This is more actionable than a speculative recommendation: it tells the player whether the fortress was chiefly worn down by incoming enemies or completed Sapper fuses. In particular, the prior study saw Tier XVI best records of 16 and 17: the next Tier XVII unlock is the original **Tier XVI wave 20 milestone**, not Chapter XII's time gate.

## Added required original-engine testing
New `tests/first-watch-siege-pressure.js` becomes **84th required gate including JavaScript syntax**. Synthetic UI-only fixtures prove older history saves remain readable and unlabeled, actual metering for single damage events, bounded nonnegative imported counters, archive rendering and final-report display. These are **not** credited as earned battle achievements.

The separate genuine progression study executes **344 actual original-game-engine sieges**: two deterministic seeds (15411 and 15423), two paid policies per seed, 86 consecutive honest sieges per character. All four careers share the same originally paid and rewarded mixed Training path up through siege 66 within each seed, including original unlocked tiers, legitimately earned First Watch, gear/rune rewards, saves and one-time Sigils. Starting at siege 67, strategies compare:
- **Continue mixed:** original paid Training priority of Might / Reflexes / Fortitude.
- **Defensive focus:** original paid Training priority of Fortitude / Reflexes / Might.

Both use the **same external cumulative nominal spending envelope** and all purchases use original prices, earned Essence and the real `train:` action. The intervention is a study strategy only, not an in-game mandatory shopping policy; actual spend and enemy outcomes may differ.

At each siege the test checks actual pressure measures, finite unique first-cleared-wave records, original-time First Watch awards, one-time Sigils, save/reload, no invented chapter or territory unlocks, unchanged target selection policy, and the precise original **Tier XVI wave 20** requirement for the first Tier XVII entry. A Tier XVII success is counted only when genuinely awarded and accompanied by a real XVI wave-20 milestone and recorded best wave; Chapter XII only if both real 322-minute and 483-unique-first-clear gates are satisfied.

## Evidence limits and release requirements
This is a deterministic scripted game-engine study, not human play or a physical iPhone recording. It does not measure actual battery or thermals, a full 750-minute First Watch, or the theoretical ~1,250-active-hour completion target unless those thresholds genuinely occur. It should not be used to lower original waves, adjust costs, grant free upgrade ranks, or assert universal causal superiority. The locked roadmap and user's deferred-manual-review instruction remain in force.

**Status:** implementation and test prepared. Append actual outcomes only after successful full PR CI. Merge only if 84/84 checks pass; then independently verify the main-branch CI and GitHub Pages deployment of the same merge commit.

## Verified pull-request CI observations — November 7, 2026

**84 of 84 mandatory checks passed** on the new code, including the original legacy-save/regression tests and **344 genuine deterministic original-engine sieges** with no injected time, currencies, gear or unlocks. The two same-seed strategies had identical genuinely earned first-66-siege character state before spending priorities diverged.

| Seed | Late paid Training priority | Active minutes | Genuinely distinct first clears | First Watch | Tier XVI best cleared | XVI wave 20 reached? | Tier XVII opened? | Max wall HP at end | Actual Essence spent since siege 19 |
|---|---|---:|---:|---:|---:|---|---|---:|---:|
| 15411 | Continue mixed | 617.90 | 391 | XI (11/16) | 18 | No in final runs | No | 1,752 | 244,755 |
| 15411 | Fortitude first | 625.22 | 391 | XI (11/16) | 18 | Not cleared | No | 2,582 | 244,629 |
| 15423 | Continue mixed | 620.59 | 400 | XI (11/16) | 19 | Yes; fell during wave 20 | No | 1,764 | 244,445 |
| 15423 | Fortitude first | 624.35 | 400 | XI (11/16) | 19 | Yes; fell during wave 20 | No | 2,530 | 244,339 |

All four earned runs met Chapter XII's actual **322-minute** time gate but failed the **483 distinct first-cleared waves** gate by **92 / 83** (identical per seed across spending policies). No Chapter XII was credited. The original Tier XVI wave-20 milestone was not completed; reaching wave 20 without surviving it never awards Tier XVII.

**Measured effective wall pressure, summed over all 86 original-engine sorties per cohort:** seed 15411 mixed **128,240 breach HP**, guard **145,427 breach HP**; seed 15423 mixed **129,369 breach HP**, guard **145,074 breach HP**. In these tested runs the recorded Sapper impact was **zero**, not evidence that Sappers cannot harm the fortress in other circumstances. The explicit synthetic single-Sapper damage fixture independently verified that this measurement does record an explosion when one succeeds. Fortitude-focused builds did provide more maximum wall HP (**2,582 vs 1,752**, and **2,530 vs 1,764**) while slightly reducing measured hero attack damage; the extra durability did **not** improve best cleared wave at Tier XVI. More total HP lost in the defensive builds reflects bigger recoverable health pools and actual combat trajectories—not worse underlying protection.

**Interpretation:** It is premature to lower the tier requirement or boost enemies/player stats from only two deterministic seeds. These cohorts point to enemy reach-the-wall pressure and the ability to defeat attackers quickly enough, rather than raw max-health alone, as useful *next test targets*. Work toward a real legitimately completed Tier XVI wave 20 and subsequent Tier XVII entry, then Chapter XII through ordinary first clears. Additional original-engine counterfactuals should isolate offensive speed and breach-prevention tactics, while monitoring actual Essence spent. Full 750-minute First Watch, theoretical 1,250-hour completion and physical iPhone UI/thermal/battery acceptance remain unverified.

**Release discipline:** This evidence belongs to a successfully checked PR code head. After documentation changes, run the full PR CI again on the final head; merge only after green 84/84, and independently confirm merged-main CI and GitHub Pages.
