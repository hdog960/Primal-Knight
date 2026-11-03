# Primal KnIght – Onslaught

## Current release — Alpha 0.10.10 (Living Onslaught, Slice 11)

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

**Play:** https://hdog960.github.io/Primal-Knight/

Development priorities and QA notes: `docs/LOCKED_ROADMAP_010_TO_015.md`, `docs/ALPHA_01010_SPECIALIST_COUNTERPLAY.md`. Physical iPhone visual approval is still outstanding. Run `node --check game.js && node tests/smoke.js && node tests/balance.js && node tests/encounters.js && node tests/deepwave.js && node tests/mobile-render.js` for the automated suite.

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