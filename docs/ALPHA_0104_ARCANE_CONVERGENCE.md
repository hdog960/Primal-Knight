# Alpha 0.10.4 — Living Onslaught, Slice 5: Arcane Convergence & Siege Codex

## Scope and progression contract
This is another focused slice within the **locked Alpha 0.10 Living Onslaught** phase. It does not supersede the established 0.11–0.15 roadmap, or change the central single-hero automatic-siege concept. The 30 × 10,000-wave structure, one-time Sigil and tier milestone economy, rune caps, safe local save format and First Watch pacing remain intact. The 1,250-hour goal remains **unverified design intent**, not a measured player time.

## Implemented changes

1. **Arcane Convergence — a new special encounter:** Beginning at wave 94 (then repeating as `wave >= 45 && wave % 127 === 94`, when not superseded by a higher-priority event), enemy ranks combine Frostbinders, Shamans, Thornweavers, Guardians, Skeletons and Wargs. The cast and interruption tactics are existing real combat systems, not just new names or a cosmetic change. A victory gives **+18% wave Knowledge**. No Sigils, additional permanent milestone unlocks or extra first-clear claims are issued.
2. **Shared enemy spellcaster safety cap:** Across the battlefield, at most **three living caster-type enemies** (Frostbinder, Shaman, Thornweaver) may be active simultaneously; the previous cap of two active enemies per specialist type also remains in force. Excess casters become normal skeletons until earlier casters are defeated. No extra spawns, timers or platform-heavy VFX are introduced.
3. **Improved automatic counterplay:** Hero target priority now responds more aggressively to nearby support units — healing Shamans, Bannerets rallying hordes, and high-value Relic Wardens — while existing sapper fuse, frost/thorn casting and rift-blink priorities remain in place. Player tapping is still not required.
4. **Siege Codex:** Added an expandable Field Manual within the existing Battle tier lobby. It catalogs all ten existing factions and each counter, explains major boss rotation, Relic Hunts, Standard Assault, Arcane Convergence and Treasure Raids. It does not add a new permanent menu tab or alter the save.
5. **Live encounter reward and counterplay hints:** The battlefield encounter ribbon now shows short contextual tactical guidance and special-wave bonuses while those waves are active. The hint disappears on ordinary patrols and after battle.

## Verification
- `node --check game.js`
- `node tests/smoke.js`
- `node tests/balance.js`
- `node tests/encounters.js`

Encounter regression coverage tests the 94/221 special-wave schedule and precedence, actual caster roster, caps and replacements, the Knowledge bonus applied by `completeWave()`, target priority, visible encounter hints, codex content, preserved First Watch and newcomer safety.

**Not claimed:** completion of the whole Living Onslaught phase, physical iPhone Safari visual QA, full long-term pacing verified with real players, or an exhaustive biome/art overhaul. These are still required before moving into Alpha 0.11 Hero Combat Depth.

## Remaining criteria
Run a physical iPhone check of the Field Manual, special-wave banner readability, auto-target fairness, Warlord warnings and long-run screen performance. Refine in response to measured issues, then decide whether Alpha 0.10 is ready to close or needs another targeted slice.
