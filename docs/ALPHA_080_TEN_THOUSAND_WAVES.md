# Primal KnIght – Onslaught | Alpha 0.8.0: 10,000-Wave Chronicle

## Vision implemented
Tier progression is **horizontal and vertical**. Clearing wave 20 unlocks the next tier (now sixteen tiers, I–XVI), but **wave 10,000 is the ultimate achievement for each individual tier**. Advancing to Tier XIII does **not** imply that Tier I wave 10,000 is attainable. The player should revisit earlier tiers with stronger Training, Research, Gear, Legacy Masteries, and newly unlocked Ascension routes.

## Milestone ladder (each tier individually)
Every tier has 25 one-time milestones: **5, 10, 15, 20, 35, 50, 75, 100, 150, 250, 400, 500, 750, 1,000, 1,500, 2,000, 2,500, 3,000, 4,000, 5,000, 6,000, 7,500, 8,000, 9,000, and 10,000**.

The original milestone rewards up through wave 100 are preserved, including Tier I Legacy unlocking at 15, next-tier unlocking at 20, the unique banner at 50, and Sigil/Essence payouts. Later milestones grant increasing one-time Sigils. Rewards are keyed by tier and wave in `p.milestones`; replaying a milestone never grants its one-time Sigils twice.

**New reward gates**
| Wave in any tier | Permanent unlock |
|---:|---|
| 150 | Vanguard Doctrine (Ascension path) |
| 400 | Bastion Covenant (Ascension path) |
| 1,000 | Armor Unbinding (Ascension path) and Ancient equipment enters the loot pool |
| 2,500 | Epoch Resonance (Ascension path) and Celestial equipment enters the loot pool |
| 5,000 | Eternal Volley (Ascension path) |
| 6,000 | Eternal equipment enters the loot pool |
| 10,000 | Eternal Conqueror achievement and a unique per-tier Eternal Victory banner |

Milestone unlock conditions check **any tier's** claimed milestone. This means the player's toughest unfinished tier may be easier to advance to wave 20 than an older tier is to wave 1,000 or higher.

## The Ascension Chronicle — Power → Training
Five new permanent, Sigil-funded routes appear beneath the existing Legacy Masteries. All are visible, but locked until their achievement milestones. The original three Legacy Masteries continue unchanged.

| Upgrade | Max ranks | Real effect |
|---|---:|---|
| Vanguard Doctrine | 40 | +6% base hero damage per rank (additive within the route) |
| Bastion Covenant | 40 | +7% maximum wall health per rank (additive within the route) |
| Armor Unbinding | 30 | Ignore +2.5% of enemy armor per rank, combined with existing Pierce and Marksman bonuses under a 90% effective armor-penetration cap |
| Epoch Resonance | 40 | +1.5% damage per rank times the square root of the current wave divided by 100; becomes especially relevant beyond wave 2,500 |
| Eternal Volley | 36 | One extra hero projectile every six ranks, with a global cap of 12 per volley |

Each path costs `ceil(baseCost × (1 + rank × 0.12 + rank² × 0.018))` Sigils for its next rank (base costs 8, 9, 13, 19, 26). Rewards at long milestones use a tier- and wave-dependent Sigil formula; the full one-time reward economy across 16 tiers is deliberately large enough to ultimately fund the combined Ascension and original Legacy maxima, but doing so requires extraordinary progress across many tiers. Focusing on a smaller number of paths first is a meaningful build choice.

## Scaling and balance
New long-wave enemy-health factor:

- Waves 1–100: `1 + 0.19 × wave` (preserves the original opening curve).
- Waves 101–10,000: `20 × (1 + (wave − 100) / 180)^1.65`.
- Each tier multiplies enemy health by `1 + 0.64 × (tier − 1)`. Armor retains its own tier and wave scaling.
- Enemy movement increases in early waves, then transitions to a slowly rising logarithmic curve rather than unbounded linear growth. Deep-tier speed remains dangerous but cannot instantly cross the battlefield.
- Breaches progressively increase damage to the fortress within a wave. Between-wave regeneration gains diminishing returns at high Stone Mending ranks, preventing an indefinitely self-sustaining all-defense strategy.

Representative *normal enemy* health before weakening effects:
| Scenario | Approx. HP |
|---|---:|
| Tier I, wave 20 | 173 |
| Tier XIII, wave 20 | 1,500 |
| Tier I, wave 100 | 720 |
| Tier I, wave 1,000 | 13,845 |
| Tier I, wave 2,500 | 58,251 |
| Tier I, wave 10,000 | 551,878 |
| Tier XVI, wave 10,000 | 5,849,900 |

A Tier I wave-10,000 normal foe has **over 350 times** the health of a Tier XIII wave-20 normal foe. Tier access is intentionally not an indication of 10,000-wave mastery on old tiers.

## Restart waystones
Earned waystones are permanent per tier at waves **100, 250, 500, 1,000, 1,500, 2,500, 4,000, 6,000, 8,000**. The Battle tier selection screen offers **Wave 1** or the **highest personally earned waystone** for the selected tier. Waystones can only be used after their respective milestone has been claimed, cannot be used to claim skipped rewards, and do not reset the once-only milestone ledger. Changing tiers selects its appropriate start.

The system does not simulate offline battles or grant rewards for skipped waves. While battles autosave progression, restarting the web app returns to the latest claimed waystone rather than attempting to resume a mid-wave scene.

## iPhone performance safeguards
The previous formula would have created over 20,000 enemies in wave 10,000. The new engine limits live entities and effects:
- **24 enemies** spawned per wave, including the boss in elite waves.
- **48 projectiles** in flight.
- **140 particles**.
- **28 combat float messages**.
- **240 stored runes** for new drops; existing saves with larger inventories are not deleted.
- Equipment inventory remains capped at 200; increasing rarity tiers are unlocked at genuinely deep achievements.
- Final wave completion stops at 10,000, awards its tier-specific banner, and returns to the tier selector.

These caps keep per-frame work bounded regardless of the numerical wave.

## Actual combat simulation QA
`tests/balance.js` loads the real game code into a deterministic Node VM, sets up representative equipment/progression, and runs the actual combat `tick` for each scenario. It is included in the GitHub quality workflow alongside `tests/smoke.js` and the syntax check.

Validated outcomes with fixed random seed:
| Profile | Scenario | Result |
|---|---|---|
| Midgame | Tier XIII · wave 20 | Cleared |
| Same midgame profile | Tier I · wave 10,000 | Fortress fell |
| Fully developed endgame | Tier I · wave 10,000 | Cleared, Eternal victory |
| Fully developed endgame | Tier XVI · wave 10,000 | Cleared, Eternal victory |

These are controlled fixtures demonstrating a deliberate difficulty gap and endgame feasibility; they **do not prove that all builds or every wave are balanced**. Ongoing iPhone visual and interactive playtests remain important for pacing and tuning. Comprehensive milestones, save compatibility, purchases, one-time rewards, waystone restart choices and equipment systems are separately verified in `tests/smoke.js`.

## Compatibility
- Existing save key remains **`primal_knight_onslaught_save_v1`**.
- Existing character levels, old rewards, Training, Legacy, Research, equipment, cosmetics and inventory are retained.
- The new `ascension` map is additive on old saves.
- Existing earned milestone keys retain their original meanings and are not granted again.
- No new purchases, premium currency, or external dependencies have been added.

## Next balance checkpoints
Observe the first 150/400/1,000/2,500/5,000-wave runs on actual iPhone hardware, evaluate resource flow and enemy survival time, then refine the higher-wave curve as player telemetry-free playtesting informs it. Avoid escalating on-screen sprite counts; difficulty should come from durable enemies, composition and investment choices, not phone-destroying rendering load.
