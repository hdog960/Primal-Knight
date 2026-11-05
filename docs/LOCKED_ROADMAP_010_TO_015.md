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

### Alpha 0.11.5 — Field Quartermaster, Hero Combat Depth slice 6
Delivered in game: three tangible one-tap Power → Training purchases (Might/Reflexes/Fortitude) inside War Council, with exact current costs/caps, visible available Hero Essence, faction-responsive suggested order, existing save persistence, and mobile-friendly card layout. Currency is deducted only after a valid purchase; unknown IDs, insufficient resources, full ranks and active sieges cannot issue a purchase. Preserves scroll and all previously earned items, Sigils, factions and existing wave economies. New mandatory sixteenth regression suite: `tests/quartermaster.js`. See `docs/ALPHA_0115_FIELD_QUARTERMASTER.md`.

**Alpha 0.11 Hero Combat Depth is still open.** The Quartermaster improves access to spending but is not itself a wave difficulty rebalance. Current First Watch build observations need actual earned-investment validation; Tier XXX max-rank fixtures do not prove progression pacing. Physical iPhone acceptance remains necessary. Keep all locked Alpha 0.12–0.15 objectives and the unmeasured 1,250-hour design target intact.

### Alpha 0.11.6 — Earned First Watch balance and optional Rally After Defeat
The next Hero Combat Depth slice implements a first true *earned-currency* comparison: twelve naturally progressed first-session sieges (four purchase approaches × three deterministic combat seeds), tracking legal costs, naturally awarded currencies/XP/milestones and defeat points. The results suggest Might-first is a better opening training recommendation than Fortitude-first under the sampled starter conditions; this does **not** prove general build balance. The player-facing War Council now prefers Might for Tier I waves 1–20 and surfaces a live in-session last-defeat rally with actual wave, breaches, earned Essence, and one-tap affordable permanent training. No forced spending or combat retuning. See `docs/ALPHA_0116_EARNED_FIRST_WATCH.md`. Mandatory seventeenth regression: `tests/earned-first-watch.js`.

The locked phases and 1,250-hour design goal remain unchanged. Second-attempt investment curves, cost-realistic endgame, and physical iPhone visual acceptance are still open; Hero Combat Depth is not yet declared complete.

### Alpha 0.11.7 — Earned repeat attempts and finite Sigil Ledger
Nine deterministic, fresh level-one careers (three legal spent-Essence strategies × three seeds, up to four attempts each) demonstrate the early 20-wave milestone reached without modifying combat damage: Might 2–3 attempts, balanced 3, Guardian 4 in these particular scripted cases. The UI now includes a **collapsed Power → Training Sigil Ledger** counting actual held, claimed and still-unclaimed milestone/First Watch rewards across 30 tiers, plus current remaining real rank prices. An independently calculated 19th CI test verifies 189,337 total finite Sigils versus 179,102 initial full Legacy/Ascension/Oath rank costs (10,235 theoretical headroom), duplicate prevention, and conservation after purchases. See `docs/ALPHA_0117_EARNED_RETRIES_AND_SIGIL_LEDGER.md`. This does **not** validate real player acquisition pace, typical completion time or physical iPhone presentation. Save key, economies, 30 tiers, 10,000 waves and all locked Alpha 0.12–0.15 objectives remain intact.

### Alpha 0.11.8 — Cost-constrained Sigil War Chest, Hero Combat Depth slice 9
Battle's existing War Council now includes a collapsible real-Sigil **Sovereign War Chest**. Players can inspect actual available Legacy/Ascension/Oath paths, accurate next-rank prices and caps, a clearly unclaimed next Sigil milestone, and optionally buy exactly one genuine permanent rank before sieges. Uses original save and purchase rules, preserves art/touch layout, refuses invalid/locked/capped/broke and mid-siege purchases. Two additional quality tests (21 total) cover this and 162 3-stage × 3-policy × 9-build × 2-seed battles funded ONLY by milestone-based Sigils and real Sigil purchases. **All 162 matched slices cleared**, but characters' non-Sigil gear, training, station/research investment remain hypothetical (likely overpowered); this is not evidence of real endgame balance or attainable 1,250-hour completion. The locked 0.12–0.15 roadmap and original 30 × 10,000 tiers are unchanged; physical iPhone acceptance remains open. See `docs/ALPHA_0118_EARNED_SIGIL_WAR_CHEST.md`.

### Alpha 0.11.9 — Configurable automatic ability strategy
The active Hero Combat Depth system now lets players choose **Rapid, Horde, Crisis** timing of their equipped signature ability in the actual Hero Hall and War Council. All remain fully automatic; Rapid is identical to the original behavior and is the default for all legacy saves. Horde delays until real crowds/special threats, Crisis until wall pressure/danger. Original cooldowns remain intact, a held ready charge waits at 0, mid-siege strategy switching is forbidden, and three saved loadouts now round-trip their tactic field safely. One additive optional save field is normalized on startup and backup import without version-key resets. Touch-safe iPhone layout, descriptive HUD status, and two new mandatory regression suites: 22 gameplay scripts plus the JavaScript syntax check (23 required checks). No combat damage, currency, progress, drops, Sigil limits, 30 tiers or waves altered. Headless tests are not a full human/meta balance or physical device review. See `docs/ALPHA_0119_DOCTRINE_AUTO_TACTICS.md`. Hero Combat Depth remains open until physical acceptance; retain locked Alpha 0.12–0.15.


### Alpha 0.11.10 — Tactical auto-cast feedback (Hero Combat Depth slice 11)
Delivers a gameplay-observable strategy indicator (READY vs WAITING for actionable targets vs HELD for intentional selective-mode delay), nonpersistent accumulated in-game combat seconds held, distinct hold episodes, and actual successful signature-cast trigger categories. The existing Siege Chronicle reports these per-siege metrics and the ending timing mode without inventing resources, new character upgrades, or save fields. The original Rapid/Horde/Crisis decision rules, target/damage calculations, cooldowns, 30 tiers × 10,000 waves and finite Sigil economy remain unchanged. A new, mandatory 23rd gameplay test script validates Hunter Volley and Aegis Pulse casts, combat hold timing and no-target HUD, reset and save isolation; the JavaScript syntax check makes 24 mandatory checks overall. See `docs/ALPHA_01110_TACTICAL_TELEMETRY.md`. This is not proof of real-world iPhone rendering/battery QA nor the 1,250-hour target. Alpha 0.11 final hardware acceptance and long-term late-game investment accounting remain open; do not quietly skip locked Alpha 0.12–0.15 objectives.

### Alpha 0.12.0 — Living Territories & Art, atmosphere slice 1
Implemented thirty distinct territory identities in the real Battle selector and lightweight rendered environment: a unique named light/weather profile for every existing tier, with static softly colored light and low-density moving snow, rain, ash, mist, dust, pollen, embers or star glints. Keeps original painted battlefield, foreground and hero/enemy artwork; applies weather BEHIND combat sprites and boss telegraphs. Weather follows simulated game time (automatically pauses when the siege pauses), has a hard budget of no more than 19 fill rectangles per render and respects the reduced-motion preference. New 24th gameplay CI regression (`tests/territory-atmosphere.js`) enforces all 30 mappings, unique names, deterministic paints and no permanent economy changes. See `docs/ALPHA_0120_TERRITORY_ATMOSPHERES.md`.

This is the **first atmosphere slice**, not the completed Alpha 0.12 phase or 30 independently painted terrains. Illustrated battlefield variants, thematic combat flavor, coherent art review and physical iPhone/battery acceptance remain open. The pending real-device acceptance from Alpha 0.11 also remains unresolved. Preserve the locked Alpha 0.13–0.15 objectives and 1,250-hour target.

### Alpha 0.12.1 — Illustrated Terrain Mattes, Living Territories & Art slice 2
A major step past simple tint/weather overlays: the game now renders distinct terrain artwork on the actual combat canvas for tiers II–XXX. The existing painted Tier I battlefield is retained; 29 other seeded (but 100% repeatable) landscape compositions use 13 region-matched terrain families, painted mountain ridges, textured land, a perspective marching road and biome-authentic groves, spires, crystals, arches, and ruins. The painting is composed into one self-contained SVG image on first selection per tier and drawn static once per frame below enemies and the existing original foreground. No 30 eager image allocations, per-frame SVG regeneration, network requests, combat or economy changes. New `tests/territory-scenes.js` required as 25th gameplay script / 26th overall check; it validates determinism, 30 identities, complexity bounds, cache reuse, layered draw order and no lost progress. See `docs/ALPHA_0121_ILLUSTRATED_TERRAIN.md`.

**Alpha 0.12 remains open:** all generated scenes still require a visual quality pass on real iPhone Safari/Home Screen and more foreground landmarks, enemy/boss-specific environmental storytelling and GPU/battery acceptance. This does not silently close previous device acceptance or alter the locked Alpha 0.13–0.15 roadmap / ~1,250-hour design target.

### Alpha 0.12.2 — In-game region previews and authored lore, Living Territories & Art slice 3
The Battle lobby now shows the **actual selected tier's illustrated landscape**, not only weather text. The selected art, border, weather/light descriptor and a unique authored sentence for each of 30 locked tiers make the new maps identifiable before launching. The preview shares the tier-on-demand decoded terrain image, never regenerates unchanged SVG on repeated menu redraw, retains the original Tier I painting, and uses compact, readable portrait and short-landscape sizing. A 26th gameplay regression / 27th required CI check validates unique lore, actual DOM preview updates, exact image cache/reuse, no currency changes and small-iPhone responsiveness. See `docs/ALPHA_0122_TERRITORY_PREVIEWS.md`.

**Alpha 0.12 acceptance still open:** physical iPhone screenshots and playtest, illustrated art cohesion with the fortress, long-session device performance, and more environment-specific boss/biome storytelling. No phase skipping, save reset, economy changes or claim of measured 1,250-hour progression.

### Alpha 0.12.3 — Region relic landmarks and boss-stage atmosphere (Living Territories slice 4)
The original 29 illustrated territory mattes are now further distinguished by 30 lore-indexed relic/landmark compositions, including wardstones, watchfires, arch shrines, cathedral remains, cracked obelisks, twisted roots, lanterns, glass shards and conduits. These are painted into existing single-decoded images entirely outside the enemy approach lane. Real commander and chapter-boss appearances activate up to eight small edge-light brush marks tinted to the region; no full-screen effects, flashing transitions or physics-impacting status effects. Reduced-motion preferences retain static boss light; normal runs show no false boss atmosphere. A new mandatory `tests/territory-relics.js` checks real boss canvas ordering, 30 scene variants and no save/economy changes (28 checks overall). See `docs/ALPHA_0123_REGION_RELICS_AND_BOSS_STAGING.md`.

Still open: consistent high-detail visual approval of generated terrain, actual iPhone Safari portrait/landscape/thermal QA, and additional environmental narrative. This does not conclude the broader Alpha 0.12 phase or change the locked Alpha 0.13–0.15 path and 1,250h maxing design target.

### Alpha 0.12.4 — Territorially dressed fortress, Living Territories slice 5
The previously universal red hanging banners on the original painted fortress now receive 29 individually unique, translucent background-matched cloth overlays. Thirteen textile heraldry symbols fit the exact 13 existing terrain palettes. Paint applies **only** to the two side banners on the original 960×540 fortress image; it never changes the central knight, skill buttons, battlement stone or boss warnings. Tier I remains fully original. A single per-tier transparent data-SVG `Image` is created lazily and reused on all subsequent draw frames. A new required `tests/territory-heraldry.js` regression checks artwork side bounds, 30 unique deterministic designs, real canvas depth, 75 redraws without image allocations, tier-change allocation budget, original save/equipment integrity and safe fallback. Total: 28 gameplay scripts plus syntax validation = 29 checks. See `docs/ALPHA_0124_TERRITORY_HERALDRY.md`.

**Not final art acceptance:** all new overlays still need side-by-side iPhone screenshot review against the original pixel foreground; no physical iPhone battery/thermal or long-run verification has been performed. Alpha 0.12 stays open, as do outstanding older physical device checks. Preserve locked Alpha 0.13–0.15 and 1,250-hour *design* target.

### Alpha 0.12.5 — View-only World Atlas for physical art review (Living Territories slice 6)
Battle's tier detail now includes an optional full-size **World Atlas**, compositing each territory's actual illustrated terrain, the original castle foreground and matching banner heraldry. Players can browse **all 30 realms**, including locked ones, strictly for visual inspection; the selected stage, unlocks, actual wave, currencies, inventory and permanent save cannot change. The Atlas does not compete for the game's one-territory canvas Image caches and loads only its currently displayed local artwork layers. It includes biome/light/lore descriptions, clear locked-view-only labels, arrow/keyboard navigation and responsive iPhone portrait and short-landscape controls. A new `tests/world-atlas.js` is the 29th gameplay regression; with the syntax check the full suite is **30 checks**. See `docs/ALPHA_0125_VIEW_ONLY_WORLD_ATLAS.md`.

**Alpha 0.12 remains open** for real Safari/Add-to-Home-Screen art screenshots, biome/banner alignment inspection, visual quality changes, and actual device frame/thermal assessment. Do not conflate the Atlas with an unlock or completion of the world art phase; retain locked 0.13–0.15 objectives and the unmeasured ~1,250-hour balance target.

### Alpha 0.12.6 — Painted-banner alignment and World Atlas original-art compare (Living Territories slice 7)
A real art-cohesion issue was confirmed against the original 960×540 castle foreground: the new biome cloth started at y445–446 while the red banner painting begins about y388–390. Corrected both flags' painted shape tops, pointed hems and centered original heraldic embroidery in the **actual battle canvas** and corresponding Atlas artwork; Tier I remains wholly original and the central knight/stone/attack indicators are untouched. Added an accessible view-only **Compare Original Art** toggle in the Atlas to alternate the exact original and territory layers without selecting or unlocking realms. Crucially, Atlas close, Tier I return, and siege start now actively remove stale large inline SVG `src` attributes so hidden artwork doesn't unnecessarily prolong iPhone image residency. The battle's independently cached art remains intact. Existing tests now lock correct banner coordinates; the new required `tests/atlas-art-compare.js` verifies toggle, saved-progress immutability, source release and reopen. **31 required checks** including syntax. See `docs/ALPHA_0126_BANNER_ALIGNMENT_ATLAS_COMPARE.md`.

Remaining Alpha 0.12 acceptance: actual iPhone Safari/Home Screen picture comparison, side-banner edge refinement if needed, combat legibility, battery/thermal verification and other player-driven art feedback. This does not conclude 0.12 or change locked 0.13–0.15, the 30×10,000 wave structure or the unmeasured ~1,250-hour completion target.

### Alpha 0.12.7 — All three original fortress banners now match the realm (Living Territories slice 8)
Found and corrected a concrete visual-cohesion issue: the original fortress art has three red flags, but the new biomed embroidered cloth from 0.12.4–0.12.6 covered only the two outer panels. The central guild banner at original x246–310 now has the same true per-tier regional cloth, fabric shading, centered original threadwork and fringe as the left/right flags. All remain beneath combat projectiles and entirely away from the player's hero; Tier I retains all original red cloth. One tiny cached image covers the three panels without any increased per-frame image count. New required `tests/three-banner-cohesion.js` plus stronger existing tests validate 30 variants, exact banner geometry, 75 redraws without allocations and no save/progression changes. The suite now has 31 gameplay scripts plus syntax = **32 required checks**. See `docs/ALPHA_0127_THREE_BANNER_COHESION.md`.

Physical iPhone screenshots, real Safari memory/thermal performance and final visual acceptance remain open for Alpha 0.12. Retain locked Alpha 0.13–0.15 and the ~1,250-hour *design* goal.

### Alpha 0.12.8 — State-aware, battery-conscious iPhone canvas rendering (Living Territories slice 9)
The complex 960×540 illustrated battlefield is no longer redrawn at a 60Hz target while paused, idle, completed or hidden behind the fullscreen World Atlas. Active combat still targets 60 Hz (30 with system Reduced Motion); frozen scenes render at 12Hz, the existing menu at 10Hz, and an opaque open Atlas or hidden Safari tab requests zero canvas paints. The RAF physics/simulation time loop continues independently and retains all original rewards, enemy and wave logic; no save fields or currencies change. The static sky tint gradient is created once and reused instead of new each paint. Existing `tests/mobile-render.js` now distinguishes idle and active targets, with a new required `tests/adaptive-mobile-render.js` checking exact real callback transitions, live wave time unaffected by omitted paints and gradient reuse. **33 total required checks** including syntax. See `docs/ALPHA_0128_ADAPTIVE_IPHONE_RENDERING.md`.

These are code-verified draw-frequency savings, **not measured iPhone thermal or battery gains**. Physical Safari/Add-to-Home-Screen playtest and art review still gate completion of Alpha 0.12; locked Alpha 0.13–0.15 and the ~1,250-hour design target remain unchanged.

### Alpha 0.12.9 — World Atlas artwork zoom and swipe inspection (Living Territories slice 10)
The illustrated World Atlas is no longer a static tiny picture on iPhone. It now allows touch swipes to browse the actual 30 landscapes, a 1.8× detail-zoom toggle, and bounded drag-to-pan without false vertical-scroll navigation. **All four painting layers transform as one full 960×540 composition**, protecting the special 960×346 terrain perspective and regional cloth details from misaligned scaling. Tier switching, close and re-open reset inspection state; Compare Original Art remains compatible. The dialog now traps Tab/Shift+Tab keyboard focus while open and marks zoom accessibly with aria-pressed. Inspection does not modify the actual selected or unlocked battle tier, rewards, gear, savings or game image caches. New `tests/atlas-inspection.js` is required alongside prior checks, for **34 mandatory checks** overall. See `docs/ALPHA_0129_ATLAS_INSPECTION.md`.

This is on-device zoom control, **not pinch-to-zoom** or proof of physical iPhone Safari/thermal acceptance. Alpha 0.12 visual cohesion and device QA remain open before the locked 0.13 Exploration & Rewards phase; 30×10,000 waves and the ~1,250-hour *design* completion target are unchanged.

### Alpha 0.12.10 — Native two-finger artwork pinch (Living Territories slice 11)
The World Atlas now supports 1–3× two-finger pinch zoom anchored to the moving gesture midpoint, with scale-bounded panning and safe transition to single-finger drag. The existing 1.8× button, swipes, original-art comparison, all four aligned painting layers, 30 regions and view-only progression are preserved. New required `tests/atlas-pinch.js` covers dual pointers, minimum/maximum scale, drag bounds, cancellation, no SVG re-decode or extra image allocations, and no save/currency/progression mutations. **35 total required quality checks** (34 gameplay scripts + syntax), with unchanged combat, existing save key and 1,250-hour unmeasured design target.

Physical iPhone Safari/installed Home Screen artwork, gesture arbitration and long-session thermal/performance acceptance are **still outstanding**. Do not mark Alpha 0.12 complete or advance the locked 0.13–0.15 roadmap until quality is acceptable.

### Alpha 0.12.11 — Voluntary iPhone device performance check (Living Territories slice 12)
Added a real, opt-in battlefield FPS/device monitor and a Settings toggle for physical Safari/Home Screen acceptance. Measures separate canvas `draw()` and animation callback rates, >=34ms frame gaps, worst gap and active siege seconds; copyable, on-device report without analytics, localStorage or saved schema changes. The new required `tests/device-perf.js` uses real VM controller callbacks to test accounting and pausing, raising CI to **36 required checks** (35 gameplay scripts plus syntax).

**Alpha 0.12 remains open:** nobody has yet completed physical iPhone visual inspection, gesture arbitration, battery/thermal checks or measured long-session play. Never portray callback counts as GPU FPS or claim device certification. Keep all existing 30 tiers, 10,000 waves, cosmetics, finite currency economy and ~1,250-hour design target intact before Alpha 0.13.

### Alpha 0.12.12 — Optional iPhone painting rate presets (Living Territories slice 13)
A real in-game Settings selector lets players choose **Vivid 60Hz (original default), Balanced 30Hz, or Battery Saver 20Hz** canvas paint targets, with lighter ambient weather on lower profiles. The RAF combat simulation continues independently, preserving enemy behavior, boss counterplay, all rewards, saves and challenge timing. System Reduced Motion remains a 30Hz upper cap, with the 12Hz idle/paused, 10Hz menus and zero-paint Atlas/hidden-tab behaviors intact. The opt-in Device Check now reports the effective rate alongside its per-device callback numbers. A separate local-only preference key never alters character save/export data. New `tests/visual-quality.js` adds real runtime regression checks; the entire suite now comprises **37 mandatory checks** (36 gameplay scripts + syntax).

No evidence yet proves a real iPhone battery or thermal improvement, and physical art acceptance of three banners and other detailed layers remains outstanding. Alpha 0.12 is **not** marked complete. The locked Alpha 0.13–0.15 priorities and ~1,250-hour unmeasured completion design goal are unchanged.

### Alpha 0.12.13 — Living skies and territory identity in battle (Living Territories slice 14)
The real siege canvas now paints family-specific motion for mist, ash, snow, rain, embers, pollen, dust and stars, with a different deterministic seeded field for every one of the 30 territories. The battle HUD now identifies the realm's specific named sky, weather and light, with small iPhone-safe text. All atmosphere remains **behind** hero/enemy and telegraph rendering and bounded to one tint + a maximum of 18 pixel marks, honoring Reduced Motion, Balanced, Battery Saver and Vivid profiles without changing gameplay. New required `tests/realm-weather.js` brings the mandatory suite to **38 checks** (37 scripts + syntax).

**Do not graduate Alpha 0.12 yet:** actual iPhone Safari art/banner cohesion, interaction and extended-session battery/thermal/performance checks remain incomplete. No character save schema, 30×10,000-wave economy, long-run target or 0.13–0.15 roadmap changes are authorized by this slice.

### Alpha 0.12.14 — Specialist casting clarity (Living Territories slice 15)
Real combat windups for Sappers, Riftstalkers, Frostbinders and Thornweavers now supply an in-encounter HUD line and dual progress tracks: remaining seconds, attack charge and exact damage-driven spell interruption percentage. The displayed values derive from the same enemy state and actual 18% / 22% max-HP disruption thresholds as gameplay. When threats overlap, the panel prioritizes Sapper fuse, Rift blink, Frost rite and Thorn ward, counting the remaining casting enemies. Completed, interrupted, killed, or inactive enemies cannot leave a stale alert. Boss counterplay panels are unchanged; no new mechanic, currency or save fields. This is a presentation/readability fix for real siege combat, not a new graphical benchmark. Added required `tests/specialist-alerts.js` to verify true state, real interruption, portrait styles and save integrity, bringing CI to **39 mandatory checks** (38 gameplay scripts + syntax).

Alpha 0.12 remains active. Real iPhone artwork/banner/touch and long-session heat/battery tests have **not** been verified, and Alpha 0.13–0.15 remain locked until this acceptance gate.

### Alpha 0.12.15 — Shareable native 960×540 battlefield captures (Living Territories slice 16)
The game now provides a user-triggered PNG capture of the **actual painted 960×540 siege canvas** from Settings or the existing FPS Device Check. This permits iPhone QA of the layered regional terrain, three embroidered fortress banners, enemies, shots and weather without the DOM HUD covering the artwork. Browser Web Share file delivery is used when available, otherwise local PNG download; cancelled shares do not download. No background uploads, telemetry, new game resources, unlocks, progression fields or save schema changes. `tests/battlefield-snapshot.js` covers both paths, file names, actual canvas repaint and error/cancel cases, raising the suite to **40 mandatory checks (39 scripts + syntax)**.

Alpha 0.12 remains blocked on genuine iPhone Safari/Home Screen rendering, art/banners/touch, extended-session battery/thermal acceptance. Do not mark it complete or begin locked Alpha 0.13–0.15 until that quality gate has been addressed.

### Alpha 0.12.16 — Four illustrated regional boss setpieces (Living Territories slice 17)
The true live boss type (Iron Warlord, Ember Regent, Rift Warlord or Siege Beast) now determines a *recognizably different* pair of scenic side motifs behind the combat sprites: watchtower stone, braziers, split obelisks, or torn ground. Materials are taken from the current territory's existing 13-biome painterly palette; the original eight boss light marks are preserved. Total boss-stage painting is strictly bounded to **32 small edge-only brush rectangles per canvas draw**, with no extra image decoding or new background assets, no center road obstruction, no flash and static Reduced Motion rendering. True boss phase II subtly intensifies the scenery without changing enemy stats, skill mechanics, currency, rewards or saves. A new required `tests/boss-stage-art.js` verifies four styles across 30 tiers, depth ordering, absence on normal waves and save safety; existing landmark regression now protects the expanded 32-mark budget. Suite: **41 required checks** (40 scripts + syntax).

**Alpha 0.12 still requires actual iPhone Safari/Home Screen art, banner, gesture and long-session performance/thermal acceptance.** Locked Alpha 0.13–0.15 roadmap and ~1,250-active-hour design goal are preserved.

### Alpha 0.12.17 — View-only World Atlas boss-stage art inspector (Living Territories slice 18)
The World Atlas now includes OFF/IRON/EMBER/RIFT/BEAST artwork inspection and a real Warlord Phase II toggle in each of the thirty realms (disabled for the single-phase Siege Beast), including still-locked regions. The static 960×540 overlay is generated **directly by recording the actual live boss-stage canvas rectangles**, not by illustrating a separate approximation. Its 32 limited marks use the current territory's exact colors, live stage coordinates and real Phase I/II opacity, in the same visual depth layer behind the fortress, all three original banners and hero. Boss-stage selections stay active across realm browsing, but reset and release their encoded SVG URL when the Atlas closes or a real siege begins. Original-art comparison and pinch/drag zoom still work, with zero encounter simulation, rewards, tier unlocks, character save or image cache mutation. New `tests/atlas-boss-inspection.js` checks all 120 variants, modal safety, memory release, no extra images and both phases. Release gate now **42 required checks** (41 gameplay scripts plus syntax).

This facilitates but does **not complete** physical iPhone artwork, gesture and long-session battery/thermal acceptance. Keep Alpha 0.12 active and locked Alpha 0.13–0.15 unchanged until real device QA is acceptable.
