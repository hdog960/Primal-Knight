# Alpha 0.15.8 — Chapters VII–X Long March Ledger

## Implemented gameplay interface
After a legitimate **Chapter VI** First Watch claim, the Battle tier lobby offers an optional collapsed **Long March Ledger**. It derives Chapters VII–X directly from the original 16-chapter First Watch reward table, including both required active battle minutes and distinct new first-cleared wave victories. Individual claimed markers reflect original reward flags. There is no predicted completion time, offline reward, generated wave clear, new save field or revised threshold.

The same panel quotes the **lowest current original next-rank price** for Hero Training (Essence), Royal Research (Knowledge), and enhancement of **currently equipped gear** (Gold). Each quote includes actual available balance and deficit; lowest cost is **not a strategic recommendation**. Buttons only open the existing permanent upgrade or Equipment menus. No automatic spending, items, rune fusion, milestone claims, combat starts or changes to any stats; all 30 tiers, ten thousand waves each, and original art remain intact. iPhone layout collapses to one column with 44px minimum buttons.

## Testing method
New mandatory 77th release check `tests/first-watch-long-march.js`. Explicit synthetic fixtures verify mathematically correct Chapter VII (77 min, 116 distinct clears), VIII (108/162), IX (147/221), X (195/293), price balance/shortfall, old-save compatibility and navigation; fixture values are **not earned combat**. A separate seed-paired actual-engine cohort extends 0.15.7's natural 12-run Tier I→II→III progression to 14 runs, comparing continuing Tier III with attempting legally unlocked Tier IV. The actual earned Chapter III gear and Chapter V Frost Rune are retained and socketed through existing actions. No injected character wealth, chapter flags or encounter unlocks are used for the earned cohort, and genuine wave victories, original purchase prices, reward conservation and save/reload are checked.

## Limitations
The full 750-minute First Watch, chapters that the earned cohorts do not actually reach, price affordability past these tested stages, and the conceptual 1,250-active-hour completion goal **remain unverified**. No hands-on iPhone acceptance until development through the locked Alpha 0.15 roadmap is finished, at player direction. Automated VM/CI tests are not a substitute for physical-device visual, thermal or touch acceptance.

## Verified deterministic earned-run results (77-check PR suite)
14 real engine sieges per seed and policy (2 seeds × 2 routes × 14 = 56 genuine runs). All four policies legitimately earned First Watch Chapter VI, Tier III, the Chapter III gear and Chapter V Frost Rune through original rewards and equipped the owned items. Only the final two destinations differed—repeat Tier III or select genuinely unlocked Tier IV. No fabricated combat time, purchased resources, wave clears, or Chapter VII claims.

| Seed | Route | Active combat min | Unique first clears | Watch chapters | Tier I / II / III / IV earned best | Final Essence / Knowledge / Gold |
|---|---|---:|---:|---:|---|---|
| 15411 | Hold Tier III | 130.42 | 98 | 6 | 33 / 32 / 33 / 0 | 4,330 / 14,391 / 424,318 |
| 15411 | Try Tier IV | 127.15 | 125 | 7 | 33 / 32 / 32 / 28 | 3,874 / 14,149 / 419,803 |
| 15423 | Hold Tier III | 129.08 | 98 | 6 | 33 / 32 / 33 / 0 | 4,329 / 14,440 / 426,065 |
| 15423 | Try Tier IV | 127.18 | 128 | 7 | 33 / 32 / 33 / 30 | 4,410 / 14,595 / 429,869 |

Chapter VII requires 77 real active battle minutes and **116** unique first-cleared waves; the Tier IV routes earned it without any rule change. Chapter VIII requires **108** minutes and **162** distinct first-cleared waves. Although all four policies surpassed the time gate, none reached 162 unique wave victories. Chapter IX (147 min/221 clears) and X (195 min/293 clears) remain unearned. No 750-minute endpoint was simulated.

The ledger's cheapest currently available one-rank price at the end of these cohorts was Essence **12**, Knowledge **12**, and equipped-gear Gold **70**. These are accurate observed original quotes *for the cheapest eligible actions*, not recommended strategic purchases. All tested ending balances could afford those particular cheapest options. That **does not** demonstrate that important mid- or endgame upgrades are affordable, nor validate a complete 1,250-hour economy.

**Interpretation and next work:** Try legitimately unlocked Tier V/VIs and test meaningful *specific* build/rune/upgrade choices, rather than assuming the cheapest upgrade is useful. Preserve real thresholds and finite currencies. Physical iPhone visual, touch, thermal and endurance acceptance remains deferred until completion of the locked development roadmap.
