# Primal KnIght — Locked Development Roadmap
**Adopted:** 2026-11-03
**Starting baseline:** Alpha 0.9.0, thirty tiers and ten thousand waves per tier.

This is the agreed production roadmap for Alpha 0.10.0 through 0.15.0. Treat its phase goals and order as the baseline. Subsequent refinements must support this plan; do not quietly replace or drop major features. Major changes of direction should be proposed for player review. Keep the live iPhone Safari build updated after each verified release. Maintain existing local saves and the 1,250-hour *design target*, which is not a measured player completion time.

## Non-negotiable experience
- Keep the game a satisfying, mostly automatic **incremental siege defender**, not an action game requiring constant attention.
- Player decisions must matter: strategic loadouts, wave objectives, progression routes and combat combinations, but never mandatory frantic tapping.
- **First 12.5 hours:** frequent early celebrations and useful purchases with deliberately widening reward intervals. Sustain variety and motivation throughout the remaining campaign, including on repeat tiers.
- Original illustrated medieval-fantasy pixel-art direction; no mismatched generic vector buttons. Distinguishable enemy silhouettes and visual effects; prioritize mobile readability, contrast and performance.
- Maintain 30 tiers, 10,000-wave final milestone in each tier, and ability to revisit earlier tiers to pursue deeper achievements.
- Preserve permanent currency, research, Training, Ascension, Sovereign Oaths, Crests, equipment, inventory, owned items and existing saves.
- Control long-run entity and particle counts; stable iPhone Safari and Home Screen performance.

## Alpha 0.10.0 — The Living Onslaught
**Goal:** Encounters become recognizable, surprising, and different to approach—not only enemies with larger HP totals.
1. Design a complete encounter **director** with 100-wave chapters, special fights, elite fights, warlord/commander encounters, and major bosses. Preserve milestone rewards separately.
2. Introduce 8–10 enemy factions over the phase with distinct silhouettes, units, roles, armor/speed profiles, strengths, weaknesses and enemy composition. Beginning slice may launch with fewer factions while building out the entire phase.
3. Real roles and mechanics: shield-bearers protect neighbors, swift raiders rush walls, casters support/heal/summon within entity cap, attackers adapt to defenses, siege beasts hit hard.
4. Real bosses with telegraphed phases, reinforcements, temporary vulnerability/armor windows and distinct art. Avoid impossible phase locks or damage spikes.
5. Rare treasure waves, events and optional reward objectives. Make decisions matter, but do not disrupt the automatic battle loop.
6. Gameplay QA: real-engine fight simulations for early, mid and endgame, multiple random seeds, wave 100 and 10,000 compatibility, mobile frame/entity constraints, save migration and regression coverage.
**Acceptance:** encounter roles materially affect combat; encounter director presents meaningful variation; new art coherent; battles function on iPhone; upgrades retain their value and no one encounter dominates rewards.

## Alpha 0.11.0 — Hero Combat Depth
- Active and passive ability choices with meaningful cooldowns and an optional auto-cast configuration.
- Equipment and rune synergies, specialized faction loadouts and a clear battle-preparation screen.
- Real opportunity costs and several viable builds, not one mandatory strongest setup.
- Responsive iPhone controls, no repetitive menu trips.

## Alpha 0.12.0 — Living Territories & Art
- Distinct tier identity: illustrated battlefield variants, time-of-day/weather, ambient effects and art consistent with existing game.
- Tier-specific combat flavor integrated with faction strategy and bosses.
- Rich, readable presentation without overloading battery or GPU.

## Alpha 0.13.0 — Exploration and Rewards
- Event and discovery system with rare encounters, optional challenges, secret enemy variations, better item identity and varied rewards.
- Expand unique milestone rewards beyond raw currencies and status bonuses.
- Reward repeated tier visits while strictly preventing farming one-time achievements.

## Alpha 0.14.0 — Long-Run Quality of Life
- More robust save integrity, recovery, export/import QA and version migration.
- Safe automation and configurable battle speed/behavior, clearer waystones, run history and earned-progress tracking.
- Convenient player navigation for thousands of waves and long-running play sessions.

## Alpha 0.15.0 — Progression and First Watch Balancing
- Full opening-12.5-hour audit and pacing refinement.
- Mid/late-game economy balance; fix dead zones, walls, upgrade trap choices and unintended runaway income.
- Long-form simulated cohorts and multi-seed battles, plus real iPhone playtests.
- Reevaluate the **1,250-hour** completion target honestly. Do not achieve it by arbitrary wait-time inflation; pace content/rewards to make the journey worthwhile.

## Delivery discipline
- Implement features **in the real game code**, not mockups or illustrations alone.
- Ship focused, semantically versioned increments. An incomplete phase must be described as a phase slice, never claimed complete.
- Run `node --check game.js`, `node tests/smoke.js`, `node tests/balance.js` and encounter-specific tests.
- Publish through GitHub Pages only after quality checks pass. Confirm actual deployment completion before announcing the release.
- State what was and was not tested. Browser visual QA on a physical iPhone remains necessary.


## Implementation ledger (append-only)

### Alpha 0.10.0 — Living Onslaught, slice 1
Delivered: deterministic 100-wave encounter director, five faction rosters, seven wave categories, shield guards, raiders, shamans, siege commanders, phase-II warlords, reward-safe treasure raids, initial enemy art, faction briefing and encounter tests.

### Alpha 0.10.1 — Living Onslaught, slice 2
Delivered: three additional factions (**eight total**), frost casters, interruptible sappers, rallying bannerets, siegebeast charge telegraphs, priority-aware automated targeting, original consistent pixel-art sprites, one-time flawless chapter objectives, mobile HUD indicator, extended combat and save-regression QA. See `docs/ALPHA_0101_LIVING_ONSLAUGHT.md`.

**Alpha 0.10.0 is still in progress.** Next: two more factions, higher-identity chapter boss variants, optional non-chapter events, improved telegraphs and iPhone hardware playtesting. Do not move to 0.11.0 until the broader Living Onslaught criteria are assessed.

### Alpha 0.10.2 — Living Onslaught, slice 3
Delivered: Thornwake Circle and Riftborne Court (ten total factions); interruptible short-lived thorn wards and bounded rift blinks; three century boss styles with original-palette sprite variants, visible phase II mechanics, and reinforcements inside the 24-enemy cap; rare zero-breach Relic Hunts with finite first-clear rune/Knowledge rewards; persistent non-farmable ledger and expanded regression QA. See `docs/ALPHA_0102_LIVING_ONSLAUGHT.md`.

**The broader Alpha 0.10 Living Onslaught phase still requires hardware approval** and further boss/event variety evaluation before 0.11 begins. Preserve all decisions and progression goals.

### Alpha 0.10.3 — Living Onslaught, slice 4
Delivered: readable on-field major-boss health, live phase labels and impending-attack warnings; real gold-marked Relic Warden foes on rare relic waves; new Standard Assault formations with a bounded +20% normal wave Gold bonus; no-loss pending Relic Vault recovery when the 240-rune cap is reached; accurate tier-gate guidance and expanded encounter tests. See `docs/ALPHA_0103_ENCOUNTER_CLARITY.md`.

**Alpha 0.10 Living Onslaught remains in review** for extended encounter variety, real-device visual legibility and boss fairness. Do not proceed to the locked 0.11 phase until these are evaluated.

### Alpha 0.10.4 — Living Onslaught, slice 5
Delivered: Arcane Convergence caster-focused encounter cadence, real mixed spell-support formations with a bounded +18% wave Knowledge reward, three-active-caster cross-type safety limit, more responsive automatic counterplay, a ten-faction Siege Codex inside Battle, and readable live tactical encounter hints. Full regression checks required; review `docs/ALPHA_0104_ARCANE_CONVERGENCE.md`.

**Alpha 0.10 remains in real-device evaluation.** Player acceptance of boss patterns, portrait/landscape HUD, Field Manual and deep-wave performance is still required. Do not advance to 0.11 until the phase acceptance criteria are evaluated.

### Alpha 0.10.5 — Living Onslaught, slice 6
Delivered: earned damage-based boss cast interruptions, counterable Iron Ward, short +12% exposed-vulnerability windows, safe repeating bounded Void Steps, improved automatic focus on boss telegraphs, actionable battlefield warnings and refreshed tactical field manual, regression checks covering interruption and duration. See `docs/ALPHA_0105_BOSS_COUNTERPLAY.md`.

**Alpha 0.10 is still under active evaluation.** Hardware legibility, extended boss fairness and deep-wave play remain pending; do not move into 0.11 until assessed.

### Alpha 0.10.6 — Living Onslaught, slice 7
Delivered: actual visually distinct special-wave arrival formations on the battlefield; clear live interruptible-threat warnings in the existing ribbon; corrected zero-speed pause for wave time/spawns/intermissions; tactical Field Manual guidance and deterministic spawn/UI/pause QA. See `docs/ALPHA_0106_FORMATIONS_AND_WARNINGS.md`.

**Alpha 0.10 remains open.** Physical iPhone visual acceptance, advanced-wave performance, and subjective enemy/boss fairness review remain necessary before advancing to locked Alpha 0.11 Hero Combat Depth.

### Alpha 0.10.7 — Living Onslaught, slice 8
Delivered: repair the legacy backup-import tier cap (12 → 30), preserve high-tier/late-wave milestones and all existing progress ledgers, run gear migration on old imported saves, reject malformed imports safely, add protected one-time pre-import recovery/undo in Settings, report storage failures accurately, and enforce seeded real-loop deep-wave / restore QA through GitHub Actions. See `docs/ALPHA_0107_SAVE_INTEGRITY.md`.

**Alpha 0.10 remains open for physical iPhone acceptance and deep-wave combat feel review.** These tests are meaningful engineering coverage but do not constitute completed 1,250-hour player testing or device visual approval. Keep the locked Alpha 0.11–0.15 roadmap unchanged.
