# Primal KnIght – Onslaught

## Current release — Alpha 0.11.2 (Hero Combat Depth, Slice 3)

The live game is a **free iPhone-first, mostly automatic fortress-defense RPG** with **30 tiers and 10,000 waves per tier**, 1,144 finite tier achievements, permanent Training / Ascension / Sovereign Oaths, four skill disciplines, equipment, rune crafting and a 12.5-hour First Watch reward ladder. Its long-term full-progression goal is **around 1,250 active hours (a design target, not measured player completion time)**.

**New in 0.10.2:** 10 distinct rotating enemy factions (Thornwake Circle and Riftborne Court added), telegraphed thorn-ward and rift-blink specialists, three themed century-boss styles with bounded phase-II reinforcements, and rare optional zero-breach Relic Hunts awarding one-time runes and Knowledge without farming permanent Sigils. Existing save key and progress remain intact.

**New in 0.10.3:** readable real-time major boss HP/phase/telegraph panel; distinctive Relic Warden encounters; rare Standard Assault formations and +20% wave Gold; a saved Relic Vault that preserves your earned one-time rune when the bag reaches its 240-rune cap; and accurate late-tier unlock information. All old progress and `primal_knight_onslaught_save_v1` remain supported.

**New in 0.10.4:** Arcane Convergence special formations with 18% bonus wave Knowledge; a shared cap of three living enemy casters to keep stacked spells fair; improved threat-aware automatic targeting of Shamans, Bannerets and Relic Wardens; a ten-faction expandable Field Manual inside the tier lobby; and compact battle encounter hints. Still free and iPhone-first, using the same local save.

**New in 0.10.5:** damage-driven interruptions let the hero break Cinder Regent charges, Void Monarch warps and Siege Beast crusher windups; Iron Tyrant wards can be shattered. Counters create a brief exposed window with +12% follow-up damage and clear gold battle effects. The Field Manual and boss HP overlay explain the mechanic; bounded cooldowns prevent untelegraphed rapid blinks. Saves and the established progression economy remain unchanged.

**New in 0.10.6:** meaningful special-wave battlefield formations (pincer ambushes, escorted Relic Wardens, shielded standards, spellcaster rear lanes, centric chapter bosses and two-flank reinforcements), live tactical warnings when a dangerous cast actually starts, and true pause-safe siege simulation. Existing iPhone UI, unlocks, relics and save data remain preserved.

**New in 0.10.7:** corrected JSON backup restoration so all 30 legitimately unlocked territories, high-wave records and late-game inventories/reward ledgers survive; old equipment save migration; safe import validation, a one-time Settings recovery copy with **Undo Last Import**, truthful save status, and new seeded combat stress tests for wave 10,000 across seven representative tiers. The old local save key, 30-tier milestone economy and normal progression remain unchanged.

**New in 0.10.8:** Consistent on-screen battle effects across 30/60/120 Hz displays, at most 60 large canvas repaints per second with lighter menu/background work, reduced-motion support, resource HUD refresh without redundant re-layout, and more readable boss/challenge warnings and larger battle controls on narrow iPhones. Combat balance, earned currencies, existing saves and the 30-tier conquest remain unchanged.

**New in 0.10.9:** Live, accurate countdown progress inside the boss health panel for Cinder Regent charge, Void Monarch step, Siege Beast crusher and Iron Tyrant ward. Battle-speed selection while paused no longer accidentally resumes combat, and backing out of Safari during a between-wave countdown now pauses safely. An unmistakable **SIEGE PAUSED** banner, accessible control state and a reliable 1× / 2× restart finish the update. No old saves or earned rewards were altered.

**New in 0.10.10:** Focused real combat damage can now interrupt Sapper fuses, Frostbinder chill spells, Thornweaver protective wards and Riftstalker blinks. A short gold bar above an active specialist indicates cast interruption progress, with a visible break effect when successful. These counters preserve existing boss mechanics, enemy caps, unlocked tiers, rewards and old save files.

**New in 0.10.11:** A full 240-rune pouch no longer destroys one-time wave-35 milestone runes. All 30 tiers now store reserved milestone rewards safely in the same persistent Rune Vault as Relic Hunts, without duplication or changing any earned currency. The Battle lobby and Rune Workshop now show what is reserved and how to reclaim it after freeing a slot. A new seven-part CI quality gate tests milestone delivery, duplicate protection, and exact save-restore behavior.

**New in 0.10.12:** Fixed another one-time reward loss bug: all four First Watch special gear pieces and both one-time runes now remain claimable if your 200-piece equipment bag or 240-rune pouch is full. New **First Watch Armory** section in Gear → Equipment, a Battle lobby reminder, and shared Rune Workshop recovery preserve original reward identities and caps. A new eighth CI check tests all sixteen reward chapters, the real claim button and save restoration. No existing player progress is reset.

**New in 0.10.13:** A compact expandable **Siege Chronicle** in the Battle lobby records each run's actual waves cleared, enemies defeated, boss attacks interrupted, specialist casts stopped, major boss victories, breaches and true starting waystone. Fixes an old report bug that treated all previous waves as part of a deep-waystone run. The Chronicle resets on each siege and does not change existing permanent saves, boss rewards, equipment, or progression.

**New in 0.10.14:** The Siege Chronicle now distinguishes major bosses **defeated** from bosses **breaching** the fortress, instead of crediting a boss kill merely because the player survived its wave. Iron Tyrant's short Ward receives fair automatic focus, while urgent Sapper fuses still take priority. The live boss HUD shows actual damage-based `BREAK %` progress for ward/charge/step/crusher counterplay. All original rewards, persistent saves, and 30-tier combat balance remain intact. A tenth required regression suite tests real boss kills and escapes.

**New in 0.11.0:** Playable **Hero Combat Depth** starts with three equipable automatic signature abilities in the illustrated Hero Hall: **Hunter's Volley** (three or four extra focused arrows), **Arcane Chain** (real three-target lightning and slow), and **Aegis Pulse** (bounded fortress healing and enemy pushback). Unlocked at levels 1, 3 and 5, they have meaningful live cooldowns, existing talent/rune synergies, an iPhone battle cooldown HUD and a session Chronicle cast tally. Save migration retains all previously earned progress. All eleven release checks include new real-auto-cast tests. Alpha 0.10 physical iPhone acceptance is still open.

**New in 0.11.1:** Choose one passive combat trait — **Predator's Eye** (+8% focused arrows vs bosses/specialists), **Storm Conductor** (+10% lightning damage and brief slow), or **Rampart Oath** (-10% fortress/Sapper breach damage). Save three full reference-only build presets (**Scout, Tempest, Bastion**) in Hero Hall, including owned equipment, sockets, active doctrine and passive; load them with one tap from Battle's **Quick Preparation** area. Missing gear, missing runes, level-locked abilities and active sieges block preset switching before any item changes. Old iPhone saves remain compatible, and all twelve regression checks now cover these features.

**New in 0.11.2:** Added a real **War Council** before launching a siege. It recognizes your tier, starting waystone, all ten rotating factions, the next special encounter and Iron/Ember/Void/Siege Beast boss starts. The game suggests *available* doctrine/passive combinations, shows actual owned/socketed rune options and rates all three saved loadouts for faction suitability. One button equips the suggested ability pair **without replacing gear or runes**, or changing currency or earned progression. This is tactical guidance, not a claimed win-rate simulation; all thirteen mandatory CI checks now cover the live system.

**Play:** https://hdog960.github.io/Primal-Knight/

Development priorities and QA notes: `docs/LOCKED_ROADMAP_010_TO_015.md`, `docs/ALPHA_0112_WAR_COUNCIL.md`. Physical iPhone visual approval is still outstanding. Run `node --check game.js && node tests/smoke.js && node tests/balance.js && node tests/encounters.js && node tests/deepwave.js && node tests/mobile-render.js && node tests/reward-integrity.js && node tests/first-watch-vault.js && node tests/siege-chronicle.js && node tests/boss-fairness.js && node tests/hero-doctrines.js && node tests/combat-builds.js && node tests/war-council.js` for the automated suite.

---

### Historical notes from earlier releases


**Alpha 0.3 — Rebuilt Fantasy Menu Experience**

A free, single-hero, rear-view fortress defense RPG for iPhone browsers and desktop. No subscriptions or paid services: HTML/CSS/JavaScript, original pixel-art imagery and GitHub Pages.

## Play

https://hdog960.github.io/Primal-Knight/

## Earlier foundational features

- One auto-attacking hero protects the wall from escalating monster waves. Battle speed/pause and boss encounters.
- **Five redesigned navigation hubs**: Battle; Hero (Overview, Skill Trees); Power (Training, Research); Gear (Equipment, Rune Workshop); Fortress (Stations, Enemy Suppression). Settings are available from the cog in the header.
- Illustrated fantasy chamber layouts, illustrated navigation icons, themed panels, clear upgrade costs and rank progress, separated currency types and touch-friendly buttons.
- All previous permanent systems preserved: 24 talents, 16 long-term training lines, 9 equipment rarity tiers, 12 rune tiers, 5 fortress stations, 6 economy research lines, 4 suppression research lines.
- On-screen rune socket picker instead of typing numbers. Equipment and training filters; skill disciplines navigable by school.
- Local device autosaves and JSON export/import. Saved progress from Alpha 0.1 and 0.2 is compatible.
- Clean battlefield artwork: separately moving monsters, projectiles and damage text, with independent wall/hero layers.

## Technical notes

- Root `index.html` and `style.css`: Alpha 0.3 shell, responsive layout and decorative fantasy design.
- `game.js`: game logic, rendering, save and progression, plus new UI routing and screen rendering.
- `menu_art.py`: derives the 32-bit-style illustrated icon atlas in `assets/menu_icons.png` from the existing original art in `art/source_composition.png` (Python/Pillow for asset generation **only**). Runtime requires no Python, network services or build tools.
- `assets/`: original sprite files and clean background/foreground layers.
- `tests/smoke.js`: combat/progression/hub tests.
- `docs/`: design vision, roadmap, QA and Alpha 0.3 release details.

## Honest limitations

The menu/navigation system has been fully rebuilt and locally checked using a DOM-free game smoke test and headless Chromium DOM simulation at desktop, landscape mobile and portrait mobile sizes. The automated browser environment blocked network navigation, so a normal iPhone visual/play test is still necessary. This is not a claim of finished character animation or finalized stage variety. The deeper long-term features remain a work in progress.

## Alpha 0.4 — Endless Tiered Onslaught

The old ten-wave stage progression and mandatory Next Wave button have been removed. The Battle hub now shows a **tier-select lobby** with 12 escalating difficulty tiers and visible permanent milestone rewards. Start one siege; it advances automatically through waves until you fall or retreat. Tier milestones at waves 5, 10, 15, 20, 35, 50, 75 and 100 unlock Gold, Hero Essence, Primal Sigils, new masteries, stronger runes, banners and additional difficulty tiers. Milestones are once per tier, with per-tier records. Regular combat income and gear are repeatable. Sigils fund new permanent Legacy Masteries after Tier I wave 15. No paid services or resets. See `docs/TIERED_ONSLAUGHT_ALPHA04.md`.