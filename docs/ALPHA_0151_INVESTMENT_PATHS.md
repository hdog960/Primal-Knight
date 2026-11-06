# Alpha 0.15.1 — Earned-Cost Opening Build Choices

**Locked phase:** Alpha 0.15 First Watch and Progression Balancing, slice 2. **Gate:** 70 required automated checks, including JS syntax. No manual iPhone testing yet.

## Baseline problem
The existing real-engine three-seed starter profiles produced **5 first-run clears for no spend**, **13 for Might-first**, **7–8 for Guardian-first**, and **10–11 for Mixed**. These are comparisons of different user-like training choices and cannot be represented as a measured win probability or guarantee, but show that early decisions materially affect survival. The Battle-lobby Quartermaster already provided real-cost individual Might/Reflexes/Fortitude purchases, but only one default “suggested first” order and no way to compare different six-rank commitments before spending.

## Implemented playable solution
Three transparent optional **six-rank reference plans** are displayed for Tier I start waves 1–20:
- Blade First: Might rank 4 and Reflexes rank 2 (offense-first).
- Even Watch: Might rank 2, Reflexes rank 2, Fortitude rank 2.
- Stoneguard: Fortitude rank 4, Reflexes rank 1, Might rank 1 (defense-first with a little offense).

The interface obtains live rank prices from the exact `trainCostAt` used by Training and the Quartermaster; already owned ranks reduce the **remaining** cost. Each plan shows its remaining number of ranks, exact total Essence still needed, the **next individual** rank and its affordability. A tap explicitly buys only that next priced rank via `purchaseCouncilTraining` and the preexisting verified character save, then rerenders the quoted totals and preserves scroll. Full plans **cannot** be bought automatically. Buying ranks through any other interface immediately affects the displayed quotes. The plans are guidance rather than claimed optimum builds, and do not lock the player into one path.

No extra currency, rank cap, damage modifier, wall-mitigation boost, offline advancement, new permanent save field, changed item drop or reward schedule. Maintain the original 30×10,000 waves, unique achievement counts, 750-minute First Watch ending, and one-time Sigil economy. A save failure after a tap warns that the new rank is currently **in memory** and needs backup; no false persistence claim.

## Automated validation
`tests/first-watch-investment-paths.js` invokes real Battle-lobby button listeners across three seeded cohorts per plan (nine actual Tier I combat attempts). It asserts each purchase matches the exact current Quartermaster quote, no hidden discount/extra rank, valid save readback, identical no-click behavior, 44px+ target CSS, preserved save structure, correct completion state, combat-time refusal and bounded enemies/shots. It logs actual wave outcomes without promising that these scripted purchase profiles establish a universal balance ranking.

Next: expand genuinely earned cohort simulations across multiple repeat runs toward the First Watch endpoint, compare the costs/opportunity costs of alternative upgrade paths, then investigate mid/late game resource bottlenecks. The 1,250-hour target remains **unmeasured**; mobile hands-on QA is outstanding by player direction.
