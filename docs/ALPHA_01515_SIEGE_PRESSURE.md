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
