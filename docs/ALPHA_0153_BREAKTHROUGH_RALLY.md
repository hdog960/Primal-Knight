# Alpha 0.15.3 — Breakthrough Rally (Progression Balancing Slice 4)

## Observed early bottleneck
Alpha 0.15.2's matched three-seed real-engine combat showed that Stoneguard's capped breach mitigation did improve survival, yet the defense-heavy scripted cohorts stopped at **10/8/9 unique Tier I clears after three legitimately paid attempts**. They accumulated more than ten active minutes but had not passed the second First Watch chapter's **11 distinct first-cleared waves**. The Might/Even Watch cohorts cleared that gate naturally. Instead of awarding rewards early, changing the chapter gate, weakening enemies, or deleting the Fortitude investment, this slice improves the *player's actual upgrade decisions*.

## Implemented gameplay
The real Tier I Field Quartermaster now shows **Breakthrough Rally · Stoneguard Recovery** for characters with four or more earned Fortitude ranks, five or more authentic Tier I cleared waves, fewer than 11 global first clears and no second First Watch claim. This remains visible after page reload because it is calculated using existing stored ranks and wave ledgers. It is not dependent on the previous session's temporary defeat report.

The optional rank goals are **Might 8 and Reflexes 5**, preserving current Fortitude and all other earned upgrades. Displayed cumulative and next rank prices are computed by the same `trainCostAt` used in Power Training, with already-owned ranks deducted. The UI shows remaining original Essence cost, the next affordable priced rank, the unique-wave shortfall and remaining actual active minutes. A deliberate click buys only one permanent rank through the existing pre-siege purchase procedure; it verifies the original localStorage save and reports when a write could not be confirmed. On reaching 11 genuine unique clears the guidance disappears, even when the player still needs active time. No automatic purchases, earned-currency gifts, rank resets, new inventory, trait bonuses, changes to defensive reduction, change to difficulty, new save fields or new social/premium services.

## Verification
`tests/first-watch-breakthrough-rally.js` compares the original Fortitude-heavy spend-and-retry policy with the optional offensive rally across the same three deterministic seeds, starting each character at level one. All resources come from actual battle victory payouts, First Blood and the existing milestones; every upgrade is at the current live price and uses the gameplay purchase handlers. Simulations log the highest authentic wave cleared, earned chapter-II progress and active battle minutes, and enforce no duplicated Sigils or new character save fields. They test that empty/fresh accounts never see or buy the plan and that combat-time forged clicks are refused. Any difference is a simulated policy result, **not measured human choices**.

The full existing 71 checks remain mandatory, plus this new regression = **72 checks including syntax**. Physical iPhone touch, heat, art and real-user pacing remain untested by user request until the locked Alpha 0.15 development is complete. The total 12.5-hour First Watch and ~1,250-hour final completion goals remain unverified.

## Additional production save-load fix found during regression
The genuinely persisted first siege has a nonempty `siegeHistory`. Reopening that history triggered a JavaScript temporal-dead-zone exception: `normalizeSiegeHistory()` executes during game initialization, but its call to `normalizeDoctrineTactic()` accessed the `doctrineTacticModes` constant before that catalogue had initialized. The production `normalizeDoctrineTactic` now validates the exact same three allowed policy IDs (`rapid`, `horde`, `crisis`) using primitive literal comparisons, which are safe during early startup. This changes neither player doctrine choices nor the save format. The new earned-cohort regression explicitly reboots a character with actual saved history, compares its normalized siege-history count and confirms the Breakthrough Rally quote survives a reload. This was a genuine preexisting save-load crash uncovered by the added test rather than a balance adjustment.

## Verified release evidence, including limitations
All 72 automated PR checks succeeded after the original saved-history load bug was corrected. Three paired seeded character journeys (same opening spend, matching RNG seed, exact earned skill-point investment) yielded:

| Seed | Defense-only earned Chapter II | Rally earned Chapter II | Highest real unique cleared waves |
| --- | --- | --- | --- |
| 15311 | Third siege, 13.99 active min | Second siege, 8.86 active min | Defense 13 (3 attempts), Rally 13 (2 attempts) |
| 15313 | Third siege, 13.94 active min | Second siege, 8.40 active min | Defense 14 (3 attempts), Rally 13 (2 attempts) |
| 15317 | Third siege, 14.01 active min | Second siege, 7.89 active min | Defense 14 (3 attempts), Rally 12 (2 attempts) |

The offensive Rally spends **115 genuine earned Essence** to add Might 1→8 and Reflexes 1→5 after the first defeat. Defense-only spends **272 Essence** before attempt two plus **646** before attempt three, strengthening Fortitude alone. These are distinct user-like policies with different opportunity costs and run counts; **not an apples-to-apples claim of top-wave power**. The evidence supports affordable, quicker second First Watch chapter access through player choice, not universal combat dominance. No original 11-wave gate or seven-minute active timer changed.

**Separate bug fix:** The real save/reload regression found that valid nonempty `siegeHistory` records previously triggered `ReferenceError: Cannot access 'doctrineTacticModes' before initialization` during startup; `normalizeDoctrineTactic` now uses the same three literal whitelist values and is safe at initialization. Regression verifies the actual battle history survives reload alongside Rally guidance. Physical iPhone QA remains deferred.
