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
