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

### Alpha 0.10.8 — Living Onslaught, slice 9
Delivered: refresh-rate independent visual effects, at-most-60Hz battlefield rendering while simulation remains responsive, cheaper menu/background redraws, reduced-motion support, resource-header DOM caching, and smaller-iPhone HUD and tap-size refinements. Required new frame-pacing / CSS regression suite `tests/mobile-render.js`. See `docs/ALPHA_0108_IPHONE_FRAME_PACING.md`.

**Alpha 0.10 is not yet accepted.** Automated tests do not replace physical iPhone Safari/Home Screen QA. Validate the portrait/landscape combat view, warm boss telegraphs, early+deep wave readability and actual device performance before moving to the locked Alpha 0.11 Hero Combat Depth phase.

### Alpha 0.10.9 — Living Onslaught, slice 10
Delivered: real attack-countdown progress inside the boss HP HUD (Cinder, Void, Siege Beast, Iron Ward), mobile pause indicator, 1×/2× resume-speed selection without secretly unpausing, consistent control accessibility, background auto-pause during both fighting and intermissions, clean speed reset after run restart/import, and added real-combat UI regressions. See `docs/ALPHA_0109_BOSS_TIMELINES.md`.

**Alpha 0.10 remains open for device acceptance and encounter feel review.** Do not mistake automated QA for physical iPhone validation; keep the locked Alpha 0.11–0.15 sequence unchanged.

### Alpha 0.10.10 — Living Onslaught, slice 11
Delivered: damage-based counterplay against actual active Sapper fuse, Frostbinder frost ritual, Thornweaver ward and Riftstalker blink windups; safe specialist recovery cooldowns, no phantom explosive/chill/ward/warp outcomes after interruption, gold damage-progress strips and distinct break feedback, and actual-hit regressions proving cast windows and original noninterrupted dangers. See `docs/ALPHA_01010_SPECIALIST_COUNTERPLAY.md`.

**Alpha 0.10 remains open for user/device acceptance and subjective combat fairness review.** Preserve all locked Alpha 0.11–0.15 objectives and do not treat the estimated 1,250-hour pacing as measured.

### Alpha 0.10.11 — Living Onslaught, slice 12
Fixed the wave-35 milestone rune loss when the 240-rune pouch was already full. All one-time milestone and Relic Hunt runes now use one persistent, duplicate-safe Rune Vault; queued milestone rewards are signposted in the Battle tier lobby and Gear → Rune Workshop, with a full-capsule / portrait-friendly presentation. Added a seventh required CI script covering all 30 tier rewards, original payout invariants, first-in claim order, duplicate protection and exported/restored full-pouch saves. See `docs/ALPHA_01011_RUNE_REWARD_INTEGRITY.md`.

**Alpha 0.10 remains open for device acceptance.** The locked Alpha 0.11–0.15 objectives and the as-yet-unverified ~1,250-hour completion target are unchanged.

### Alpha 0.10.12 — Living Onslaught, slice 13
Delivered: corrected one-time First Watch rewards being silently lost at full capacity. All four gear rewards now have stable unique IDs and a protected additive `pendingGear` queue; both runes use the existing one-time Rune Vault. Battle lobby and Equipment panel show pending rewards and offer real FIFO reclaim once space is available. Original currencies, rarities, First Watch progression gates, item limits, save keys and non-repeatable ledgers are unchanged. Eighth required CI test covers all sixteen chapters, real UI recovery, and save/export/import safety. See `docs/ALPHA_01012_FIRST_WATCH_RECOVERY.md`.

**Alpha 0.10 remains pending physical iPhone and subjective combat acceptance.** Locked phases Alpha 0.11–0.15 remain the next objectives; 1,250-hour completion target is not measured.

### Alpha 0.10.13 — Living Onslaught, slice 14
Delivered: actual combat-run accounting independent from absolute tier wave history, fixing false "waves cleared this run" claims after waystone starts. A compact expandable after-action Siege Chronicle appears in the Battle tier lobby following real retreat, defeat or Eternal Victory and displays real kills, waves cleared, interrupted major-boss/specialist casts, defeated chapter/commander waves, fortress breaches and exact start/end checkpoint. Session-only metrics never pollute saves. Added ninth required CI regression covering real play events, all three endings, UI and waystone accuracy. See `docs/ALPHA_01013_SIEGE_CHRONICLE.md`.

**Alpha 0.10 remains open for physical iPhone validation and subjective battle fairness acceptance**. Preserve the locked 0.11–0.15 roadmap and do not treat the roughly 1,250-hour lifetime target as an actual measured playthrough.

### Alpha 0.10.14 — Living Onslaught, slice 15
Delivered: major-boss victory statistics now require a genuine major boss kill rather than merely clearing its wave; surviving a boss breach is recorded as `BOSSES BREACHED` in the seven-stat after-action Siege Chronicle and does not create a phantom kill. The automatic defender now appropriately prioritizes Iron Tyrant's brief protective Ward, while imminent Sapper fuses remain more urgent. Boss HUD now displays live **BREAK %** progress derived from actual post-mitigation counter damage, and the Field Manual explains the new indicators. Added tenth required CI script with real scheduled boss kills and a real breach simulation. See `docs/ALPHA_01014_BOSS_FAIRNESS.md`.

**Alpha 0.10 still needs physical iPhone acceptance and extended subjective combat/balance review** before declaring Living Onslaught complete. Alpha 0.11–0.15 remain locked and the 1,250-hour completion goal remains unverified.

### Alpha 0.11.0 — Hero Combat Depth, slice 1 (begun alongside outstanding 0.10 hardware review)
Delivered: the first real, selectable Hero Hall Battle Doctrines—Hunter's Volley (level 1), Arcane Chain (level 3), Aegis Pulse (level 5)—with actual auto-casting during combat, unique projectile/lightning/defense identities, meaningful cooldowns and bounded existing skill/rune synergies. Added responsive discipline cards, a battle cooldown HUD, transient per-run auto-cast tracking, safe additive saved selection, and an eleventh required CI suite. See `docs/ALPHA_0110_COMBAT_DOCTRINES.md`.

**No Alpha 0.10 physical iPhone acceptance is implied.** Next 0.11 requirements remain a passive ability layer, build/loadout presets and useful faction-aware pre-siege choices. Continue to preserve all locked Alpha 0.12–0.15 goals and the unverified ~1,250-hour lifetime design target.

### Alpha 0.11.1 — Hero Combat Depth, slice 2
Delivered: an exclusive passive combat trait choice with bounded real combat effects (Predator's Eye arrow specialization, Storm Conductor lightning control, Rampart Oath damage reduction); three fixed-name saved reference-only equipment/rune/active/passive presets; atomic, ownership-checked loadout switching with no item duplication; and one-tap Quick Preparation in the Battle tier lobby without repetitive menu visits. Adds `combatPassive` and `combatLoadouts` safely to the existing save key, plus a twelfth mandatory real-game regression suite. See `docs/ALPHA_0111_PASSIVES_AND_PRESETS.md`.

**Next for Hero Combat Depth:** faction-aware build preparation, meaningful offensive/survival balance checks and more durable build identity. Physical iPhone acceptance inherited from Alpha 0.10 is still pending. Original future Alpha 0.12–0.15 plan and the unmeasured ~1,250-hour goal remain unchanged.

### Alpha 0.11.2 — Hero Combat Depth, slice 3
Delivered: a genuine **faction-aware War Council** at the top of the Battle lobby, with advice grounded in the actual ten-faction encounter director, tier/wave/waystone state, first-seven-wave tutorial units and correct Siege Beast / Iron / Ember / Void boss exceptions. Dynamic best-*available* active/passive combinations, truthful owned/socketed rune advice, comparison of three stored loadouts using explicitly nonprobabilistic tactical fit scores, and a safe one-tap **EQUIP SUGGESTED PAIR** action. No changes to combat values, earned progression, item IDs, persistent schema or tier milestones. Added thirteenth CI test spanning faction rotations, real waystones, deep tiers and touch action. See `docs/ALPHA_0112_WAR_COUNCIL.md`.

**Remaining 0.11 focus:** broad balance checks for multiple viable ability/passive pairings and end-to-end combat fairness. Carry forward the uncompleted real iPhone device acceptance from 0.10 without making unsupported claims about measured 1,250-hour pacing.

### Alpha 0.11.3 — Hero Combat Depth, slice 4
Delivered: real Arcane Chain armor differentiation (**35% armor penetration**, within original 90% cap) and removal of unintended fortress station Dominion Crest damage scaling from hero arcane/lightning-chain effects. Station Thunder/Ballista remain unchanged and Storm Conductor still interacts with real lightning and arcane damage. Added a **14th required CI suite** that runs 306 seeded real-game encounters across nine active/passive combinations, all ten factions, four chapter/commander bosses and Tier XVII/XXIV/XXX checkpoints, measuring actual kills, wall HP, breaches, auto-casts and defensive playstyle. See `docs/ALPHA_0113_COMBAT_BALANCE.md`.

**Hero Combat Depth is not yet declared complete.** Controlled combat matrices do not prove a 1,250-hour max-progression time, physical iPhone smoothness or encounter fairness. Carry the real-device acceptance from Alpha 0.10 forward. Keep the locked future Alpha 0.12–0.15 phases unchanged.

### Alpha 0.11.4 — Progression-matched combat QA (under review)
A new required test compares nine real active/passive ability combinations under four specifically stated hypothetical progression-investment profiles (Tier I W20 level 8, Tier XIII W20 level 180, Tier XXIV W250 level 480, Tier XXX W10000 level 1000), with two matched seeds per scenario. It reports actual combat kills, breaches, wall health, casts and end states, while respecting historical mobile object caps and protecting prior owned gear/permanent upgrades. Legitimate earned loot and Crest milestones are permitted. See `docs/ALPHA_0114_PROGRESSION_MATCHED_BALANCE.md`.

**This is a balance diagnostics slice, not measured meta balance or a change to live combat.** Longer-term achieved-investment distribution, full-wave clear consistency and the physical iPhone acceptance remain unverified. The locked Alpha 0.12–0.15 roadmap and 1,250-hour *design goal* remain unchanged.
