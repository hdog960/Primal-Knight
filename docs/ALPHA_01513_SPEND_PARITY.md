# Alpha 0.15.13 — Close Actual-Spend Checkpoint & Veteran Budget Choice

## Playable change
After a player **legitimately earns First Watch Chapter X**, the existing collapsible Veteran Watch panel includes a **25% / 50% / 75% Hero Essence budget selector** for the original-price Field Spending Envelope. The selected percentage changes both independent six-rank illustrative quotes, including original rank caps, sequential prices and different unspent amounts. The default remains 50%. Tapping any option re-renders the existing lobby, preserves its scroll position and open Veteran Watch disclosure, and visually marks the selected button with `aria-pressed`. All buttons provide at least 44px touch height and a narrow-iPhone one-column fallback.

**Important:** The choice is local *view-only* state and resets to 50% on game reload. It neither consumes nor reserves Essence, grants ranks, auto-starts battles, modifies any saved field, buys anything, changes the 30-territory economy, adds a paid service, changes the original art, or bypasses any chapter gate.

## Improved original-engine study
`tests/first-watch-spend-parity.js` adds an 82nd required check **including JavaScript syntax** to the old 81-check quality gate. UI-only synthetic fixtures validate 25/50/75 percent selections, invalid values, visual current-choice indication, actual sequential price math and cap limits, read-only no-save purity, and ephemeral reset.

**Earned cohort:** Two seeds (15411, 15423) × two strategies × 52 actual original-engine consecutive sieges = **208 engine-executed siege trials**, with no injected time, first-clears, currencies, items, or chapter rewards. Both strategies follow an identical genuinely earned first-18-siege character baseline, including original legally earned tiers, genuine paid gear enhancement, actual runes and original saves.

At the genuine pre-siege-19 checkpoint, the test enumerates possible actual Training purchases with original `trainCostAt` prices. It selects one mostly **Might-focused** package and one **Reflexes/Fortitude-oriented** package costing within **5% actual Essence of each other**, afforded by the identical earned save. The alternative rank choices are truly purchased through the existing original Training actions, and exact debits are independently checked before battle. This is a **genuinely close actual purchase-cost comparison at one checkpoint**, not a conclusion that builds are equal in power or that their economics will remain identical.

Beyond that controlled checkpoint, each subsequent strategy follows its own earned combat trajectory and original paid upgrades, bounded by the same externally defined **cumulative spending ceiling** of 3,600 Essence per post-18 siege. The cap is a *test policy*, never an in-game cap. Actual total expenditure can diverge as currency incomes, costs and territory unlocks change; it is reported separately. Both use the same deterministic legally unlocked frontier navigation schedule, the same simulated input timing, and the original combat engine, with real saved state checks, finite unique first-clears, one-time Sigils, owned equipment and runes, and no synthetic chapter awards.

## Evidence limits and release gate
The study may reach Chapter XI, XII or beyond **only if actually earned**. It cannot establish an end-to-end human First Watch, a balanced 1,250-active-hour completion design, or real battery, touch, iPhone rendering/thermal behavior. **Physical iPhone signoff remains deferred by the player** through the locked Alpha 0.15 roadmap. No live economy or chapter gate may be changed solely based on two scripted seeds.

**Status at implementation:** code and fixture prepared. Append exact results only after green PR CI; merge only after full 82-check pass, then verify green main-branch checks and GitHub Pages for the merged commit.
