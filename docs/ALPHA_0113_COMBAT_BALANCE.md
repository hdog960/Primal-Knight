# Alpha 0.11.3 — Hero Combat Depth, Slice 4: Nine-Build Combat Balance & Armor-Piercing Magic

## Balance finding from the real combat code

The Alpha 0.11.0 Arcane Chain ability and late-game fortress Thunder Station shared the exact same `hurt(e, raw, 'lightning')` damage kind. This accidentally caused hero magic (including secondary arrow-spawned lightning) to inherit `dominionBonus('stations')`, a prestige category reserved for actual fortress stations. The coupling became more pronounced after earning the Tier XXVI Thundergrave Crest. It distorted comparisons of Arcanist versus Marksman and Guardian builds and made the War Council's Ironbound shield advice under-explained.

## Actual gameplay changes

- **Hero magic now has its own damage channel:** `'arcane'` from the direct Arcane Chain ability and arrow-created magical chain procs. Ordinary physical arrows, fortress Ballista and fortress Thunder retain their original damage kinds and formulas.
- **35% bounded armor penetration:** Arcane strikes ignore 35 percentage points of enemy armor before the existing total 90% armor-penetration ceiling. This gives Arcanist a concrete purpose against Ironbound and Crownless shield formations, including at higher tier armor scaling, without simply multiplying damage against all enemies.
- **Station prestige stays with stations:** Thunder/Ballista still receive the existing station-related Dominion Crest multiplier, but hero Arcane Chain and magically triggered arrow chains no longer double-dip into that separate late-game progression system.
- **Storm Conductor still works as designed:** The 10% exclusive lightning passive increases both hero arcane and actual fortress lightning attacks and briefly slows their targets. Existing Spark/Hail training, socketed Storm runes, sovereign boss damage, boss/specialist interruption thresholds, armor pierce cap and all other systems remain intact.
- The Hero Hall's Arcane Chain description and Field Manual now explicitly explain the 35% armor penetration and separate fortress-station bonus. This is a **modest role correction**, not a global increase to spell damage or reward rates.

## Real encounter-comparison gate

`tests/combat-balance-matrix.js` is a new **14th mandatory CI regression script**. It uses the actual game JavaScript, actual spawning director, real `tick()`, combat shots, hero abilities, stations and damage, in deterministic browser-like Node environments.

The matrix covers **306 controlled real-combat scenes**: all nine combinations of three active doctrines and three passive traits, two independent random seeds and **17 distinct encounter checkpoints**:
- 10 rotating faction starts across Tier I–X, wave 20
- Four major-boss waves: 25 (Siege Beast), 100 (Iron Tyrant), 200 (Cinder Regent), 300 (Void Monarch)
- Three outer-realm pressure checkpoints: Tier XVII / wave 100, Tier XXIV / wave 250 and Tier XXX / wave 10,000

Each scene is limited to up to **19 seconds of actual combat**. The test records actual auto-casts, kills, interruptions, breaches, surviving wall HP, battle endings, shot/enemy peaks and average group results, and prints a per-build comparison to CI logs. Original 48-projectile, 24-enemy and 140-particle/28-text caps are checked on every simulated tick. An additional matched pressure experiment with extremely durable attacking units confirms that Aegis Pulse + Rampart Oath preserves more real wall HP than Hunter's Volley + Predator's Eye under extended wall pressure, without artificially multiplying resources or disabling enemy attacks.

Separate exact-damage tests verify 35% magic armor piercing, real Storm Conductor interaction and the absence of a station crest leak into hero spells, while preserving the real station bonus.

## Results from the 306-scenario CI run

The first successful paired run on November 3, 2026 produced these **descriptive means across 34 fixed-level-20, up-to-19-second scenes per build**. They are not global performance rankings; those scenes deliberately include high-tier enemies that substantially outscale the chosen fixed hero profile.

| Active + passive | Auto-casts | Mean kills | Mean breaches | Mean wall HP fraction | Full wave clears | Defeats |
|---|---:|---:|---:|---:|---:|---:|
| Volley + Predator | 51 | 5.65 | 5.94 | 0.301 | 0 | 20 |
| Volley + Conductor | 51 | 5.82 | 5.94 | 0.299 | 0 | 20 |
| Volley + Rampart | 51 | 5.68 | 6.41 | 0.311 | 0 | 19 |
| Chain + Predator | 48 | 5.82 | 5.97 | 0.299 | 1 | 20 |
| Chain + Conductor | 49 | 5.76 | 5.94 | 0.301 | 0 | 19 |
| Chain + Rampart | 48 | 5.68 | 6.32 | 0.312 | 0 | 20 |
| Aegis + Predator | 35 | 5.47 | 5.97 | 0.302 | 0 | 20 |
| Aegis + Conductor | 34 | 5.68 | 5.85 | 0.307 | 0 | 20 |
| Aegis + Rampart | 37 | 5.38 | 6.47 | 0.309 | 0 | 20 |

**Important result:** These nearly identical averages and large defeat counts are a warning about the limitations of a fixed level-20 build at high-tier checkpoints. They do *not* validate long-run progression tuning, prove that every build is equally viable, or establish an optimal nine-build meta.

A separate **pre-wave-reward**, matched pressure check showed the expected defensive niche: Hunter's Volley + Predator's Eye ended at **4,891 HP**, while Aegis Pulse + Rampart Oath ended at **5,080 HP**, with three breaches for both, the exact same spawned attackers and one successful auto-cast each. This comparison deliberately prevents earlier wave completion from awarding passive post-wave healing to either side.

**Next useful step:** evaluate appropriately progressed heroes at tier-specific investment profiles and player-facing defeat/clear rates, then investigate builds that underperform at matched gear/training rather than flattening their unique strengths.

### Important interpretation limits

The matrix provides repeatable **relative controlled-combat evidence**, not proof that any particular build is mathematically optimal or that all nine combinations should have identical win rates. An offensive build might kill more, a defensive build might preserve more fortress health, and a caster build should counter armor better. Those are meaningful differences.

A 19-second scripted combat slice is **not** a 10,000-wave clear, a 1,250-hour playthrough, an exhaustive economy simulation or physical iPhone performance QA. The existing balance and deep-wave tests remain required. Physical iPhone Safari/installed Home Screen portrait and landscape acceptance remains pending from Alpha 0.10.

## Save and locked-roadmap guarantees

No new saved fields, tier gates, currencies, non-farmable Sigils, rune/gear items, reward milestones, tier unlocks or cooldowns. Keep the original `primal_knight_onslaught_save_v1` and exactly the same 30 tiers × 10,000 waves. Alpha 0.11 Hero Combat Depth remains open for meaningful playtest balance; the locked Alpha 0.12–0.15 sequence is unchanged.
