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

**Status:** Development branch implementation prepared; release verification and observed earned-cohort results must be appended only after the actual CI run passes.
