# Alpha 0.11.4 — Progression-Matched Hero Combat QA (in progress)

## Why this slice exists
Alpha 0.11.3 added 306 actual nine-build combat comparisons, but every case used a fixed level-20 hero, even in Tier XXX at wave 10,000. Predictably, late-tier cases produced heavy defeat counts. That data is valid for a deliberately underpowered hero, **not** for the builds players reasonably bring to advanced tiers.

The new required \`tests/progression-matched-builds.js\` adds **126 independent real-game combat slices**: four **authored investment profiles**, three additional deep-wave/crest-pressure checkpoints, two reproducible random seeds and all nine (3 active × 3 passive) build combinations. Every build within a checkpoint receives identical equipment, training, talent, station, research, legacy, ascension and sovereign investment. Only the selected active doctrine and passive differ.

## Explicit test investment checkpoints

| Scenario | Target | Level | Equipment | Additional investment |
|---|---|---:|---|---|
| First Watch | Tier I, wave 20 | 8 | Uncommon +1 | Starter training and first station |
| Frontier Entry | Tier XIII, wave 20 | 180 | Legendary +12 | Midgame training, stations, first ascensions |
| Outer Territory | Tier XXIV, wave 250 | 480 | Celestial +30 | Stronger training, sovereign oaths and ascensions |
| Crest-Prepared Endgame | Tier XXX, wave 10,000 | 1,000 | Eternal +50 | Full training, ascension, sovereign oaths and late Dominion Crests |

Additional stress comparisons revisit Tier XIII at wave 3,000 and Tier XXIV at wave 5,000 with the same respective investment levels, plus a deliberately crest-unprepared Tier XXX wave 10,000 run. They are not claiming that either depth is typical for that investment. These are **hypotheses for reasonable spending**, not snapshots taken from player saves. We must not assert that a typical level-480 player actually has those upgrades, or that the 1,250-hour target was measured.

## What the gate actually tests
- Executes the genuine game's JS through deterministic Node VM, with actual faction director, spawns, projectile simulation, damage, auto-casts, boss mechanics, breaches and wave-end transitions.
- Replays each checkpoint with the same two combat seeds and identical power investment for all nine build combinations.
- Records and logs clear/defeat/censored counts, kills, fortress breaches, wall health fraction, elapsed seconds, and auto-casts for each pairing.
- Reasserts original mobile pool limits (24 enemies, 48 projectiles, 140 particles, 28 floating labels), finite game state and nonmutation of owned gear or permanent investments.
- **Does not** turn a scripted time limit into an alleged wave-clear failure or an expected win rate. The gate records unfinished waves as *in progress* and prints explicit warnings where all or no builds clear.

## Acceptance strategy
1. Keep the previous \`tests/combat-balance-matrix.js\` and all historical acceptance checks; add the matched-profile gate rather than overwriting older baseline evidence.
2. Review the grouped CI outcome logs before proposing changes to damage or healing. Favor differentiated roles (Marksman focused kills, Arcanist armored formations, Guardian survival) rather than equalizing every number.
3. If a proposed tuning change is needed, change live \`game.js\` combat math, demonstrate matching results, and prove save, economy, and deep-wave regression invariants.
4. Preserve original \`primal_knight_onslaught_save_v1\` local save, 30 tiers, 10,000 waves, one-time Sigil and First Watch rewards, and locked Alpha 0.12–0.15 roadmap.

## Explicitly unresolved
- Four investment fixtures **do not** recreate 1,250 hours of earned player progression or capture the distribution of achievable equipment.
- Brief scripted fights **do not** measure 10,000-wave clear rates or time-to-max.
- Headless Node gameplay checks **do not** count as physical iPhone Safari/Home Screen visual or performance approval.
- Alpha 0.11 Hero Combat Depth should stay open until actual balance risks, viability at comparable earned budgets, and device presentation have been reviewed.

Do not call Alpha 0.11.4 an entirely new combat feature, or claim the late-game meta is balanced just because CI passes. The value of this slice is a **more relevant, permanently enforced comparison gate**.

## Initial paired test observations — November 3, 2026
The first passing 126-scene CI run used two fixed seeds for each of the nine combinations at each checkpoint. All findings here are **two-seed engineering observations**, not population win rates:

- **First Watch, Tier I wave 20, level 8:** Hunter's Volley + Predator's Eye cleared 0/2 tests, while Arcane Chain + Rampart Oath and Aegis Pulse + Rampart Oath each cleared 2/2. Damage pressure was high, and a small sample cannot establish the typical early-player investment budget or that the default build is unviable.
- **Frontier Entry, Tier XIII wave 20, level 180:** all nine pairs cleared 2/2 with no breaches or wall damage. The same investment jumped to Tier XIII wave 3,000 and all nine failed quickly. This is an intentionally very deep *return visit* and does not imply normal frontier progression is inaccessible.
- **Outer Territory, Tier XXIV wave 250 and wave 5,000, level 480:** all pairs cleared both seeds with full wall health. Even an illustrative deeper wave was weak against this specific investment profile, so these results mostly reveal that the fixture is overpowered for these encounter checkpoints.
- **Tier XXX wave 10,000 at level 1,000:** fully invested builds cleared both seeds with or without the late Dominion Crests. The Crest-prepared version averaged roughly 7.3–7.6 combat seconds per wave; the non-Crest version took about 11–12 seconds and sustained a little wall damage, so Crests are **materially helpful** in elapsed time but were **not necessary to win these selected fixtures**. This is not proof the real Sigil economy permits maxing Sovereign Oaths before the final Crest.

**Next balance investigation:** pair actual earned-cost assumptions and attainable upgrades with intermediate-pressure wave brackets, rather than trying to make all builds have equal kill counts. Check whether Tier I wave 20 is suitably welcoming for a normal first-session character. Check whether max Sovereign Oaths without Crests is economically achievable, and whether high-investment long-wave play has enough meaningful encounters. Only then propose bounded gameplay changes with new regression tests.

All 15 required quality-check commands must pass before merging this slice. Physical iPhone gameplay review remains uncompleted.
