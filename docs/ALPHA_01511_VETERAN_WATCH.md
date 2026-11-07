# Alpha 0.15.11 — Veteran Watch & Earned Essence Spending Routes

## Playable feature
After **First Watch Chapter IX is actually awarded**, the Battle tier lobby gains an optional collapsed **Veteran Watch** inspection panel through the end of Chapter XVI. It lists the original six later chapter requirements (XI–XVI), each with both genuinely active battle minutes and distinct first-cleared wave gates, current remaining deficits and already-claimed markers. All data comes from the original `earlyWatchChapters`, `battleSeconds`, `uniqueClears` and `firstWatchClaimed` values. No guaranteed progress projection or invented income.

The same panel compares **exact original present-day Hero Essence prices** for two illustrative independent budgets: three consecutive Might ranks versus one Might, one Reflexes and one Fortitude rank. It calls the original `trainCostAt` sequentially and respects the original rank caps and actually held Essence. Both plans quote from the *same initial held balance*; they are not claimed equivalent in combat power and cannot both be purchased from a shared balance. A 44px navigation button opens existing Hero Training. Nothing in this panel spends currency, assigns gear, alters unlocks, changes saves, awards chapter progress or changes the combat engine. One-column layout on small iPhone screens, original bronze/charcoal design and no extra dependencies.

## Regression and earned-combat experiment
`tests/first-watch-veteran-strategy.js` adds one mandatory regression to the existing 79-check gate, bringing the planned release gate to **80 including the syntax check**. Synthetic fixtures validate UI-only chapter gate math, pricing, rank-cap behavior, read-only purity, actual Training-menu navigation, and old-schema compatibility; **these fixtures are not earned gameplay**.

A separate experiment uses deterministic, original-engine battles. Two matched seeds each execute the original valid Tier I–VI earned opening path, including legitimate Tier III/IV/V/VI unlocks, genuine paid Training, owned equipment and purchased gear enhancement, and an earned socketed Ember Rune. After siege 18 they diverge into identical, legally unlocked Tier VII+ route-selection logic, but different paid Hero Essence policies:

- **Reserve Might:** bank earned Essence and purchase up to three genuinely affordable next Might ranks before a subsequent siege.
- **Diversify Training:** continue the original Quartermaster spread among current Might, Reflexes and Fortitude offers, checking exact original debits.

Each scenario performs up to 36 full sequential, genuinely executed sieges (rather than fabricated time or first-cleared waves), with actual wins, losses, retreat, save/reload, chapter triggers, finite milestone Sigils, item continuity and current combat-stat snapshots. These are script-defined policies, **not measured human player averages**. Neither build is promised to win. Chapters XI–XVI may be reported as earned **only if the game engine truly awards them**.

## Known limits
The complete 750-minute First Watch remains unverified until an earned run actually reaches it. The approximately 1,250-active-hour completion objective is a design target and remains unmeasured. Deep 30-territory economy viability, typical player spending, battery/thermal performance, and physical iPhone visual/touch acceptance are not established by deterministic Node/CI. Manual iPhone signoff is intentionally deferred until the locked Alpha 0.15 roadmap closes, as the player requested.

## Verified PR CI observations (November 7, 2026)
After correcting a read-only plan-ID reference bug caught by the first CI attempt, the next pull-request run passed **all 80 mandatory checks**, including the earlier 79 and new strategy suite. The green run performed **144 genuine engine-executed sieges** (two seeds × two policies × 36 consecutive sieges) with no injected first-clears, chapters, time or currencies.

| Seed | Paid Training policy | Earned active minutes | Distinct first clears | Claimed chapters | Unlocked tiers | End Might / Reflexes / Fortitude ranks | Essence spent after siege 18 |
|---|---|---:|---:|---:|---:|---:|---|---:|
| 15411 | Reserve Might | 296.32 | 222 | 9 / 16 | VIII | 150 / 49 / 17 | 58,971 |
| 15411 | Diversify | 306.31 | 341 | 10 / 16 | XIV | 154 / 92 / 51 | 93,276 |
| 15423 | Reserve Might | 296.10 | 246 | 9 / 16 | IX | 152 / 59 / 15 | 63,947 |
| 15423 | Diversify | 306.80 | 382 | 11 / 16 | XV | 165 / 91 / 51 | 120,995 |

**Chapter XI was genuinely claimed only by seed 15423's diversified policy:** 382 actual distinct first-cleared waves and over 253 earned active minutes satisfied its 380-wave and 253-minute requirements. Seed 15411 diversified finished 39 distinct victories short of XI despite exceeding 253 active minutes. Neither reserve-Might policy earned X; its first-clear gate stayed 71/47 distinct waves away from 293. None of these cohorts reached Chapters XII–XVI.

**Interpretation:** In both specific matched-seed scripted experiments the diversified Quartermaster policy produced stronger measured damage/wall/fire-rate profiles, unlocked more territories and claimed more chapters. However, diversified players also invested **more total earned Essence** and thereby accessed additional new first-clear opportunities. Differences are not an isolated causal estimate of equivalent-budget Might versus mixed spending, nor proof of typical human results, a globally superior build, or a permanent Essence bottleneck. The economy/prices remain unchanged. Next design work should match *total* actual Essence spent more tightly and test later gates under more independent seeds before tuning balance. Neither the 750-minute First Watch nor approximately 1,250-hour completion target has been verified.

**Merge and production limitations:** These are verified pull-request CI findings, not yet a claim of deployed production code. After documentation changes, rerun PR CI; merge only if green, and verify main-branch CI plus GitHub Pages deployment. Physical iPhone touch/visual/thermal acceptance remains postponed until the locked roadmap's conclusion.

