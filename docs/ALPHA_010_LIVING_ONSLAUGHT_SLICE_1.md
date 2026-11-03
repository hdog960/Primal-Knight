# Alpha 0.10.0 — The Living Onslaught: First Playable Slice

**Production roadmap:** [Locked Alpha 0.10.0–0.15.0 plan](LOCKED_ROADMAP_010_TO_015.md)

This release begins the first phase; it does **not** claim all planned 8–10 factions, all boss families, or the full event/decision system are finished.

## Implemented encounter director
A reproducible 100-wave **chapter director** uses the selected tier and current chapter to decide the faction. Factions rotate across chapter boundaries to keep revisited tiers varied.

| Encounter | Frequency / precedence | Content |
|---|---|---|
| Chapter Warlord | Every 100 waves | Original Warlord sprite and two-stage enrage boss |
| Siege Commander | Every 25 waves (except century bosses) | Armored Siege Beast, double breach damage |
| Elite Strike | Every 10 waves, excluding higher priorities | Ogre siege elite |
| Vanguard | Every 5 waves, excluding higher priorities | Familiar elite ogre; original cadence retained |
| Treasure Raid | Every 37 waves, excluding boss/elite | Gilded raiders, bonus wave Gold and extra drop roll |
| Night Ambush | Every 17 waves, excluding higher priorities | Raider-heavy advancing squad |
| Patrol | All remaining waves | Faction-focused mix of enemies |

The director runs from wave 1 to wave 10,000 with no enemy-count inflation, and keeps milestone rewards independent from encounter selection.

## First five enemy factions
- **Mirebound Swarm:** goblins, skeletons, rush raiders, wargs.
- **Ironbound Host:** shields and organized lines alongside lesser infantry.
- **Ashen Covenant:** a ritual-heavy mix of shamans, undead and raiders.
- **Nightpack Raiders:** fast raider/warg-heavy attacks.
- **Crownless Legion:** armored guards, shamans and elite raiders.

These rosters are the beginning of the planned 8–10 distinct factions. Initial waves 1–7 remain gentle with familiar units; shamans only enter the pool after wave 20.

## New real combat mechanics
- **Guardian (shield-bearer):** its aura reduces damage to nearby enemies within 115 in-game pixels by 22%. Defeating or isolating the guardian disables protection. It has a sturdy health/armor profile.
- **Raider:** periodically rushes at +65% movement speed for ~0.55 seconds; slower normal recovery between rushes and visible streak effects.
- **Shaman:** every ~6 seconds heals up to two wounded nearby allies for 6% of each ally's maximum HP. Does not summon extra units; active shamans are capped at 2 per wave.
- **Siege Beast:** heavy boss with 2× ordinary boss breach damage. Appears on commander waves.
- **Warlord:** a major boss every 100 waves; becomes visibly enraged when reduced below 55% health and increases movement speed by 22%.
- **Treasure Raid:** bonus wave Gold and an extra drop roll, with rare, predictable scheduling. Valuable but does not add one-time Sigils or bypass milestone economy.

## Five original self-contained pixel-art enemy sprites
The SVG assets `assets/guardian.svg`, `assets/raider.svg`, `assets/shaman.svg`, `assets/siegebeast.svg` and `assets/warlord.svg` are original crisp-pixel unit designs with transparent backgrounds and rendered via the existing canvas sprite system. Guardian rings, raider dash streaks, shaman sigils and warlord enrage rings convey combat mechanics visually.

## UI
- Battle HUD shows current special encounter, enemy faction and chapter.
- Battle tier lobby provides **Siege Intelligence** before launching, showing the faction roster and the next special encounter with its wave number.
- No new tab or constant menu interaction is required.

## Stability and balance
- Existing 30 tiers, 10,000-wave ceilings, milestone keys, Waystones, earnable currencies, gear, research, Ascension, First Watch, Sovereign Oaths and save key are not replaced.
- Existing entity limits (24 enemies, 48 projectiles, 140 particles, 28 floating combat labels) remain enforced.
- Additional wave role logic is bounded and temporary: no recurring timers or persistent enemy data in saved player progression.
- Tests: `node --check game.js`; `node tests/smoke.js`; `node tests/balance.js`; `node tests/encounters.js`.
- The new encounter tests verify director scheduling, five factions, new art assets, shield protection, raider dash, shaman heal, warlord phase transition, siege beast spawning, tier-milestone preservation and live encounter HUD.
- A real visual check on iPhone Safari still matters.

## Still planned in Alpha 0.10.0
Bring the opening five factions up to eight–ten fully characterized enemy groups; implement deeper and more varied boss phase patterns; special formations, optional objectives, rare challenges and a richer faction/lore codex; run extended early and deep-wave encounter balancing. Never claim the whole milestone completed based only on this initial release.
