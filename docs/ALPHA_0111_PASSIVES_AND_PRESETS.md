# Alpha 0.11.1 — Hero Combat Depth, Slice 2: Passive Traits & Three Safe Build Presets

## New strategic options

The hero can now choose **one** active doctrine (from Alpha 0.11.0) and **one** passive trait. Passives are mutually exclusive and deliberately target different outcomes:

| Passive | Unlock | Gameplay effect | Trade-off |
|---|---:|---|---|
| Predator's Eye — Marksman | Level 1 | +8% final arrow damage against bosses and dangerous specialist units (Sapper, Frostbinder, Thornweaver, Riftstalker, Shaman, Banneret) | No lightning buff or fortress mitigation; normal goblins get no bonus |
| Storm Conductor — Arcanist | Level 3 | +10% real lightning-hit damage and a short 0.45-second slow, for Arcane Chain and lightning stations | No extra arrows or fortress mitigation |
| Rampart Oath — Guardian | Level 5 | -10% damage from real wall breaches and Sapper explosives, never below 1 point | No damage benefit or new Gold rewards |

These buffs feed the real `hurt()` hit-calculation, `sapperBlastDamage()` and the actual enemy-crossing-wall damage path, so they apply in live battles rather than changing a stat label. Multipliers are bounded and no passive increases skill points, currencies, loot drop rates or permanent Sigils. Any passive can pair with any available active doctrine, allowing mixed offense/survival builds rather than mandatory same-school pairing.

## Three saved Battle Loadouts

The Hero Hall now contains exactly three named, free slots — **Scout**, **Tempest** and **Bastion** — each with SAVE and EQUIP buttons. Every slot records the **existing owned item IDs**, rune IDs and socket placement, chosen active doctrine and selected passive. Slots are not new inventories: they store *references* only.

**Safeguards**
- A saved preset cannot create, duplicate, sell, replace or automatically fuse gear/runes, nor change Gold, knowledge, XP, quest/milestone status, Sigils or tier unlocks.
- Applying a preset validates *every* referenced item and rune, correct armor/ring slot, uniqueness of equipped item IDs and owned rune IDs, and the hero-level unlocks of active/passive choices **before any equipment is changed**.
- If a referenced item was sold, rune fused, or choice becomes unavailable, the entire operation is refused with a visible `EQUIPMENT MISSING`, `RUNE MISSING` or `HERO LEVEL LOCKED` state — no partial build switches.
- A whole-preset switch is available **between sieges**, not during fighting/intermission, to prevent circumventing cooldowns or dangerous mid-wave equipment swaps. Individual active/passive choices retain their existing ability selection behaviors in Hero Hall.
- A saved preset uses a fixed label (not arbitrary unescaped user text) and at most three slots; imports with malformed entries are normalized to empty slots.
- Once a preset is applied, its items and current max wall HP are recomputed, but the player never receives free healing or additional possessions.

## iPhone usability

- Portrait Hero Hall shows large single-column passive choices and compact, tappable SAVE/EQUIP loadout controls using original game fantasy visual language.
- The **Battle tier lobby** has a *Quick Preparation* area showing all three saved builds. A player can tap an already-saved slot to equip it without navigating into Hero and Gear repeatedly. The existing tier/waystone selector and scroll position are retained.
- Empty/unavailable slots are visibly disabled and labelled so no false success is implied.
- The Hero Hall remains the place to save or overwrite each slot; the lobby only equips known presets.

## Save data and regression coverage

Two small additive fields extend the existing `primal_knight_onslaught_save_v1` JSON: `combatPassive` and `combatLoadouts`. Old saves and JSON backups safely default to Predator's Eye with three empty loadout slots. Normalization checks levels, IDs, allowed slots and malformed structures. The original backup import/undo recovery, 30 tiers, 10,000 waves per tier, gear/rune item caps, vaults and all finite rewards remain unchanged.

New required test `tests/combat-builds.js` checks:
- Locked passive choices at hero levels 1/3/5, distinct arrow vs lightning vs fortress effects using real combat code.
- Sapper-blast and actual wall breach reduction, including nonzero damage.
- Save/apply each of three slots through real UI actions; verify original gear/rune IDs and currencies never duplicate.
- Atomic refusal of a preset after selling equipment or losing a socketed rune, then successful reuse when it is owned again.
- One-tap loadout switching in the real Battle lobby, preserved scroll, and refusal while a siege is running.
- Valid/legacy/malformed save export/import and preservation of reference-only loadout details.
- Cache-busted Alpha 0.11.1 iPhone assets and portrait-friendly button dimensions.

The release now has **12 mandatory quality checks**: JS syntax, smoke, balance, encounters, deepwave, mobile rendering, reward integrity, First Watch vault, Siege Chronicle, boss fairness, Hero Doctrines and Combat Builds.

## Still to do

Alpha 0.11 requires faction-aware battle-preparation recommendations, a balance pass with meaningful build tradeoffs and additional combat synergies/loadout improvements. Physical iPhone performance and orientation acceptance from Alpha 0.10 remain open; the ~1,250-hour completion goal remains a design target, not a measured lifetime playtest.
