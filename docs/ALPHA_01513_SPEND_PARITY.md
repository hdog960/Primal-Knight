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

## Measured pull-request CI observations — November 7, 2026

**The corrected PR revision passed all 82 mandatory checks including JavaScript syntax.** An initial CI attempt caught a click-event interception in the existing Wave 1 smoke test; the event handler was corrected to inspect the actual data attribute, and the full subsequent run passed, including the old smoke test.

The separate 0.15.13 study executed **208 genuine deterministic engine sieges** (52 attempts per strategy × 2 seeds × 2 strategies). Same-seed characters had identical genuinely earned saved records after siege 18. At the pre-siege-19 checkpoint the Might and mixed packages cost **3,103 vs 3,111 Essence in seed 15411 (8 / 3,111 = 0.26% gap)** and **1,538 vs 1,535 Essence in seed 15423 (3 / 1,538 = 0.20% gap)**. Every original Training purchase actually debited the recorded amount.

| Seed | Strategy | Earned active minutes | Genuine first clears | First Watch | Post-18 actual Essence spent | Pre-19 matched package cost | Highest unlocked tier |
|---|---|---:|---:|---:|---:|---:|---|
| 15411 | Might | 401.25 | 281 | 9/16 | 118,829 | 3,103 | XI |
| 15411 | Mixed | 405.23 | 371 | 10/16 | 122,215 | 3,111 | XV |
| 15423 | Might | 394.29 | 291 | 9/16 | 122,124 | 1,538 | XII |
| 15423 | Mixed | 401.74 | 380 | 11/16 | 122,314 | 1,535 | XV |

**Chapter XI was naturally awarded only in seed 15423's mixed-build route,** on 380 genuine distinct first-cleared victories with its 253-minute requirement already met. The other mixed cohort stopped at 371 unique wins, only nine short; neither Might-focused cohort earned Chapter X because they stopped at 281 and 291 unique wins (12 and 2 short of 293). Chapter XII requires 483 distinct clears and 322 minutes; nobody earned it in these 52-siege scripts.

**What the comparison proves and does not prove:** Matched initial *actual* expenditure was achieved within 0.3% in both cases. By siege 52 the seed-15423 plans had also spent remarkably close cumulative **actual** Essence (122,124 vs 122,314, a 190 Essence / about 0.16% gap) while reaching very different Chapter outcomes (IX vs XI). Seed 15411's cumulative actual expenditure differed more (118,829 vs 122,215). The builds do **not** share identical post-checkpoint inventories, territory earnings, rank counts, combat performance, survival patterns or purchase schedules. Their results do **not** prove a universal or independent causal advantage for mixed spending. The original enemy stats, costs, rewards, chapter thresholds and save format remain unchanged.

No simulated result here establishes full 750-minute human First Watch, the ~1,250-active-hour game-completion design target, average player affordability, or physical iPhone visuals, battery, performance, touch or thermal behavior. Physical iPhone acceptance remains deferred under the player's instructions.

**Release gate:** This evidence is from a verified green pull-request run. After this document update, obtain another green PR CI on the *exact documented head*, then merge and verify green merged-main quality checks plus completed GitHub Pages deployment before claiming the update is live.
