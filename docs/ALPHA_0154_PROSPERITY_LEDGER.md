# Alpha 0.15.4 — Prosperity Ledger & Multi-Siege Earned Economy

## Why this actual game update
The previous 0.15.0–0.15.3 engine-backed cohorts measured only initial opening battles and one to three attempts. They showed that defensive and offensive policies spend differently and can reach First Watch chapter II on different run counts. Gold, Knowledge and Essence already have separate upgrade categories, but comparing the opportunity costs required switching Power, Fortress and Battle menus repeatedly. A single transparent, optional economic reference can make investment decisions more intentional while the longer earned-cohort models are expanded.

## Implemented
The real Battle-lobby War Council contains **The Prosperity Ledger**, a responsive three-card display with live balances, exact next-rank cost, real available/missing currency, and a one-tap, one-rank action for:

- **Attunement** (`training.essence`): consumes legitimate Hero Essence; +2.8% wave Essence per rank under original formula.
- **Advanced Studies** (`research.studies`): consumes legitimate Knowledge; +4.5% wave Knowledge per rank.
- **Midas Projector** (`stations.midas`): consumes legitimate Gold; grants bonus Gold from qualifying enemy kills through the original station behavior.

All prices use the original in-game formulas, discounts where already legitimately earned, caps, and current character levels. The click runs the original exact-price Power / Research / Fortress purchase and its verified save. The panel never refunds other upgrades, grants freebies, fakes progress, batches purchases, or claims a certain future payback. In particular, Midas benefits depend on battle RNG/foes; gold returns are not a fixed wave payout.

## Verification and further audit
`tests/progression-economy-cohorts.js` tests actual Battle-lobby click listeners, exact resource deductions with save readback, cap and insufficient-funds conditions, disallowing combat-time purchases, and the absence of new serialized fields. It uses deterministic actual combat to compare a combat-first and resource-investment-first strategy over successive real Tier I sieges across seeds, collecting true wave records, earned budgets, 16-chapter one-time gates, and milestone conservation. Repeated real progress is reloaded from localStorage to protect iPhone-save continuity. The report records the number of natural chapters reached; no boost of simulated active seconds or fabricated unique clears is permitted.

**Release gate:** 73 mandatory checks including syntax. This is a focused extended-cohort and purchase-transparency slice. No empirical claim is made about 12.5 hours of real-player onboarding, ~1,250 hours to maximum, middle/late economic balance or actual iPhone heat/touch/graphics acceptance. Those remain open in the locked roadmap.

## CI-verified longer earned-cohort observations
GitHub's 73-check quality gate successfully ran **42 actual Tier I sieges**, not static timers or artificial currency fixtures: 3 seeds × 2 spending strategies × 7 consecutive attempts. The test purchased upgrades with the live formula, invested legitimately awarded skill points, executed full combat until defeat and reloaded the resulting original save.

| Seed | Combat-first true best | Growth-first true best | Combat-first First Watch chapters | Growth-first chapters | Combat-first active minutes | Growth-first active minutes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 15411 | 33 | 32 | 4 | 3 | 61.73 | 58.76 |
| 15423 | 33 | 29 | 4 | 3 | 58.57 | 56.57 |
| 15437 | 33 | 33 | 4 | 4 | 63.21 | 60.10 |

The growth-first purchase policy spends a cumulative **97 Hero Essence**, **152 Knowledge** and **695 Gold** on exactly three real ranks of each resource perk per seed, rather than those resources being immediately available for combat. In this modest horizon it **usually advances one First Watch chapter more slowly** than combat-first, without necessarily generating higher end-of-session holdings. **This is a meaningful upfront economic opportunity cost, not evidence that resource growth never pays off.** Long-run ROI, gear choices, multiple tier strategies, 750-minute actual onboarding and endgame progression remain insufficiently sampled; we must test those without claiming a guaranteed payback time.

All six earned histories survived save/reload; chapters remained subject to both active-time and genuine first-clear gates; the finite Sigil ledger remained balanced. These are strictly scripted deterministic cohorts, not real iPhone human gameplay outcomes.
