# Alpha 0.15.12 — Veteran Watch Envelope and Matched-Spend-Ceiling Study

## Actual playable improvement
After the player has **genuinely claimed Chapter X**, the existing collapsible Veteran Watch panel gains a small, optional **Field Spending Envelope** below its existing three-rank cost quotes. This is not a new purchasing menu. It displays exactly half the character's **currently held Hero Essence**, then evaluates two independent ordered sequences of up to six next permanent Training ranks: (a) Might-only and (b) repeating Might, Reflexes, Fortitude. The sequences each stop at the first unaffordable next rank (or original rank cap), quote original `trainCostAt` prices, account for sequential price increases, disclose distinct spent and unspent totals, and explicitly do **not** claim equivalent combat power or future income. The 50% envelope is for inspection only; no balance is reserved, saved or spent.

The original Battle tier lobby, Veteran Watch Chapter XI–XVI goal display, Training button, 44px touch targets, responsive bronze/charcoal fantasy styling, 30 territories and 10,000-wave milestones remain in place. No new save keys, data fields, premium services, upgrades, equipment, time gates, enemy stats, or automatically executed purchases.

## Original-engine quality study
`tests/first-watch-budget-parity.js` extends the existing 80-check CI gate to **81 required checks including JavaScript syntax**. Explicitly synthetic fixtures validate chapter-X eligibility, 50% budget math, sequential cost/cap handling, no mutating read-only renders, and zero-currency behavior. They are **not** claimed as earned gameplay.

The separate *earned* cohort uses two deterministic seeds (15411, 15423) × two spending policies × 48 consecutive genuine engine-executed sieges = **192 real simulated sieges**. Through siege 18 both policies must have a bit-for-bit identical saved *earned* first-watch progression snapshot for the seed. The earned gear/reward/rune preparations, real purchases, once-only chapter awards, and original save loading are preserved. From siege 19, policies face the **same nominal spending ceiling** of at most 8,000 currently held Essence before each siege and up to six purchased next ranks:
- **Might envelope:** sequential original Might purchases, stopping if the next rank is above the remaining ceiling.
- **Mixed envelope:** sequential Might / Reflexes / Fortitude repeated, stopping at the first unaffordable original rank.

The comparisons check exact real Training purchase deductions, report **actual expenditure** for each cohort (which need not match across policies), changes in combat statistics and unlocked tiers, exact earned active minutes/first clears, chapters genuinely granted, one-time Sigil accounting, gear/rune integrity, and save/reload. A shared maximum spending allowance is **not an equal-actual-spend experiment**. Because the builds gain different battle rewards, even their available budgets can diverge later. The fixed six-rank sequence and artificial 8,000-per-attempt ceiling are test policies, *not* the game's own restriction or recommended player behavior.

## Acceptance limitations
Record Chapter XII only if the original engine actually grants it; neither simulated attempts nor manually assigned character fixtures prove a completion time. Never use these results to change the original economy without stronger evidence. The full 750-minute First Watch and ~1,250-active-hour completion design target, full mid/endgame affordability, physical iPhone touch/visual/battery/thermal acceptance remain unverified until separately tested. Manual real-device testing is deferred through the locked Alpha 0.15 roadmap per player request.

**Release discipline:** Merge only after 81 PR checks succeed; verify merged-main CI and completed Pages deployment before claiming the build is live. Append actual cohort findings only after CI evidence is available.

## Verified 81-check pull-request outcome — November 7, 2026

The new `tests/first-watch-budget-parity.js` and all earlier checks passed. **192 complete genuine engine-backed sieges** (two seeds × two build routes × 48 runs) used identical earned character baselines through siege 18. Synthetic UI fixtures did not contribute any credited chapter, wave victory, minute or resource. The new cost preview and all actual purchased ranks followed original prices and caps; finite Sigils, legacy gear/runes and save/reload remained valid.

| Seed | Training route | Earned minutes | Distinct first clears | Chapters | Unlocked tier | Actual Essence spent since siege 19 | Sum of nominal spending ceilings |
|---|---|---:|---:|---:|---|---:|---:|
| 15411 | Might focused | 373.77 | 244 | IX (9/16) | X | 93,978 | 133,963 |
| 15411 | Mixed | 377.15 | 367 | X (10/16) | XV | 153,950 | 201,710 |
| 15423 | Might focused | 376.21 | 286 | IX (9/16) | XI | 112,367 | 148,339 |
| 15423 | Mixed | 381.04 | 377 | X (10/16) | XV | 167,449 | 224,033 |

**No Chapter XI or Chapter XII was awarded by these 48-siege scripts.** Chapter XI needs 253 active minutes *and* 380 genuine unique first-cleared waves; the highest cohort reached 377 (three short), despite sufficient time. Both Might-focused policies missed Chapter X's 293 unique victories (49 and 7 short), despite enough minutes. These are actual battle outcomes, not new game reward gates.

**Important evidence limit:** Both plans had the same **nominal maximum** of 8,000 held Essence per siege, but spent **different actual amounts** as their rank prices, battle returns and unlocked territories diverged. Neither identical budget caps nor the resulting progress gap prove that a mixed build would win at equivalent actual investment. Do not adjust original upgrade prices or chapter thresholds from this sample alone. Further work should seek closer actual-spend-matched comparisons and separate territory-route effects, then extend genuinely earned Chapters XI–XVI and the full 750-minute First Watch. The 1,250-hour long-term design target and physical iPhone visual/touch/thermal acceptance remain unverified.

**Status:** PR regression green. Final documented commit still requires fresh green CI, merged-main CI and GitHub Pages success before a production release claim.
