# Alpha 0.15.14 — First Watch Record Stretch Routes & Controlled Territory Study

## Real player-facing feature
After a **genuinely earned Chapter IX** and until First Watch completion, the existing Battle-lobby Veteran Watch gains a compact, collapsible-context **Record Stretch** section. It inspects the real first unclaimed chapter in the unchanged `earlyWatchChapters` array, its **active-minute and unique per-territory wave-clear gates**, and the character's own persisted totals. It states exact outstanding active minutes and new first-clear wave victories. It shows up to four already-unlocked and not-yet-conquered territories, sorted by highest available tier, with real existing personal bests, next wave, and an *illustrative* record stretch of at most 10 additional waves or the remaining gate deficit. The cards do **not** claim those waves will be won, that higher tiers are easier, or that their new records count before actually earned.

Each card's **View Tier** control uses the original protected `selectFrontierTier()` path, preserves existing lobby list scroll and opened Veteran Watch disclosure when available, and never enters combat, buys upgrades, grants time, unlocks a territory or awards anything. The normal selected-tier lobby setting is saved by the original guarded game function. The original save schema, upgrade costs, enemy balance, terrain art, currencies and existing Veteran Watch spending previews remain unchanged. Responsive one-column iPhone layout, 44px buttons and original bronze/charcoal fantasy styling are preserved.

## New 83rd mandatory quality check
`tests/first-watch-clear-routes.js` is added after the former 82-check gate (including JavaScript syntax). Explicitly **synthetic, UI-only** fixtures test exact Chapter X and Chapter XII gates, missing time and per-territory first-clear counts, unlocked-only route eligibility, completed Watch hiding and the never-awarding read-only renderer.

The **earned gameplay** experiment comprises **292 legitimate original-engine sieges** across two deterministic seeds (15411 and 15423), three independently executed policies per seed:
- **Fixed-route Might**, 40 genuine sieges: shares the fully earned original Tier I→VI baseline through siege 18 and genuinely affordable near-price-matched Might upgrades at pre-siege 19; then stays on *only legally unlocked Tier VII* for sieges 19–40.
- **Fixed-route Mixed**, 40 genuine sieges: the identical earned pre-19 character, a genuinely affordable Might/Reflexes/Fortitude build package within 5% of the Might package's *actual initial paid price*, and exactly the **same Tier VII** selected every later siege.
- **Frontier Extension Mixed**, 66 genuine sieges: identical actual opening and price-matched mixed package, but after siege 18 advances along the player's genuinely unlocked latest territories by the existing deterministic frontier selection policy, with **no forced unlocks**.

All policies use original Training actions, normal paid gear enhancement and owned earned runes, actual engine combat, real finite first-cleared-wave achievements, real active combat minutes, one-time Sigil checks and original save/reload. Outside initial checkpoint **later actual total Essence spending may differ** under an identical external *cumulative nominal spending ceiling*: no claims of lifetime-equivalent investment. Fixed-selected-territory comparisons control the selected Tier, not all randomized battle events or attrition. Frontier-extension results must not be mistaken for the fixed-route experiment.

## Success criteria / limitations
New quality gate must pass in PR and again on merged `main`; a GitHub Pages workflow must deploy the merged commit before release can be described as live. **Chapters XI–XVI can be claimed only when original-engine earned rewards genuinely fire; synthetic fixtures never count**. A full 750-minute First Watch, the theoretical ~1,250-active-hour completion goal, and real physical iPhone performance / touch / thermal / visual acceptance remain unverified unless independently measured. No balancing changes based on two seeds alone.

**Pending:** append observed cohort outcomes only after actual green CI, and preserve no-manual-playtesting-before-locked-roadmap-end user preference.

## Actual CI observations — November 7, 2026

The first pull-request CI attempt failed on a **test expectation**, not on an earned gameplay exploit: a fixed-Tier VII player had not unlocked Chapter IX and therefore could not be expected to exercise Chapter-IX-only navigation. The corrected new test only expects its live-navigation assertion when the character is genuinely eligible. **The corrected complete pull-request run passed all 83 required checks, including JavaScript syntax and all 292 authentic engine-executed sieges.**

| Seed | Route / paid build policy | Engine sieges | Active minutes | Genuine unique clears | Claimed Watch chapters | Highest unlocked tier | Real Essence spent since siege 19 | Best Tier VII |
|---|---|---:|---:|---:|---:|---|---:|---:|
| 15411 | Fixed Tier VII · Might | 40 | 369.47 | 206 | 8 / 16 | VIII | 77,028 | 29 |
| 15411 | Fixed Tier VII · Mixed | 40 | 392.69 | 211 | 8 / 16 | VIII | 79,025 | 34 |
| 15411 | Legal frontier · Mixed | 66 | 494.73 | 389 | 11 / 16 | XVI | 172,343 | 28 |
| 15423 | Fixed Tier VII · Might | 40 | 370.17 | 210 | 8 / 16 | VIII | 77,028 | 29 |
| 15423 | Fixed Tier VII · Mixed | 40 | 396.17 | 216 | 8 / 16 | VIII | 78,944 | 35 |
| 15423 | Legal frontier · Mixed | 66 | 489.35 | 398 | 11 / 16 | XVI | 172,600 | 28 |

**Fixed selected-territory comparison:** both same-seed policies genuinely selected Tier VII for every one of the 22 post-18 sieges, using the same authentic earned opening and original affordable Training purchases, with pre-19 package prices originally matched within 0.3%. Mixed earned **five/six** additional unique first clears (best Tier VII wave 34/35 versus 29/29), 211/216 versus 206/210 genuine total first clears, and gained much stronger wall health and shorter attack intervals; it also spent **1,997 / 1,916** more real Essence since siege 19. Both remained at Chapter VIII due to first-clear shortage; no false Chapter IX reward was injected. Fixed route isolates selected territory choice but does not equalize time, all random combat events, historical resources, or lifetime expenditure.

**Separate late frontier extension:** the genuinely earned mixed builds advanced through legally unlocked tiers only, reaching **Tier XVI** and **First Watch Chapter XI** in both seeds, with 389/398 unique first clears and 494.73/489.35 active minutes. Next **Chapter XII** requires 483 distinct first clears and 322 active minutes; the time requirement was satisfied, while the actual unique-clear deficits remained **94 / 85**. Tier XVI best records were only 16 / 17, indicating limited extra recorded progress in these specific combat builds, not proof that the design is impossible to advance. The fixed route result cannot be compared as an equal-territory 66-siege cohort, because it intentionally ran only 40 battles and held Tier VII.

**No tuning from these results alone:** do not infer causally identical RNG, universal mixed-build superiority, full 750-minute First Watch completion, an actually balanced ~1,250-hour game, or physical iPhone touch, visual, thermal or battery acceptance. Original rank prices, chapter gates, rewards, character save schema, 30 territories and 10,000 waves per territory all remain unchanged.

**Release discipline:** green PR evidence is verified. The final documented revision needs its own successful PR CI, then verified merged-main CI and GitHub Pages for the same merge commit before production is marked released.
