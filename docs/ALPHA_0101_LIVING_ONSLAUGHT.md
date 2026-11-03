# Alpha 0.10.1 — Living Onslaught, Phase 2

## Roadmap phase
Alpha 0.10.0–0.10.1 represent **incremental slices** of the locked Alpha 0.10.0 Living Onslaught phase. The phase is **not yet fully complete**: additional factions, visual variants, more varied major bosses, optional encounters, and real-device QA remain scheduled before proceeding to Alpha 0.11.0.

## This release
Expanded from **five to eight rotating enemy factions**:
- **Mirebound Swarm** — mixed goblin, skeleton, raider and warg raids.
- **Ironbound Host** — armored guardian formations.
- **Ashen Covenant** — shaman support and undead troops.
- **Nightpack Raiders** — speedy rushing attacks.
- **Crownless Legion** — mixed shields, casters, raiders and undead.
- **Frostvein Conclave** *(new)* — Frostbinders that telegraph ice rites, then temporarily slow the hero's fire rate by 18% for 2.6 combat seconds. Frost spells do not stack infinitely.
- **Cinder Siegecraft** *(new)* — Sappers with a visible 1.3-second explosive fuse. Their single detonation is canceled if killed, is mitigated by defensive upgrades, and cannot exceed 2.5% of maximum fortress HP.
- **Gilded Remnant** *(new)* — Bannerets that rally nearby allies for +16% movement speed. The effect disappears when the banneret is destroyed or the unit leaves the aura.

Original pixel-grid SVG battlefield sprites: `assets/frostbinder.svg`, `assets/sapper.svg`, `assets/banneret.svg`. Drawn as distinct 24×28 silhouettes within 120×140 game sprite frames, matching the existing sharp-edged fantasy sprites.

## Battle behavior
- The encounter director retains seven existing categories: Patrol, Vanguard, Elite Strike, Siege Commander, Chapter Warlord, Treasure Raid, and Night Ambush, cycling factions by tier and 100-wave chapter.
- New specialist roles are **excluded from the first 19 waves** so early onboarding remains approachable.
- Maximum two active units per specialist type; total per-wave enemy spawn cap remains 24.
- **Threat-aware auto-targeting** now prioritizes lit sapper fuses, frost casts, dangerous bosses and nearby shield formations. No rapid manual tapping is necessary.
- **Siegebeasts** receive a visible, interruptible windup before their forward surge. Existing two-phase Warlords and guarded units are preserved.
- Mechanic state is transient within each encounter, with a reset between waves.

## New optional boss objective
At each century's Chapter Warlord, a **Flawless Chapter** challenge rewards defeating the encounter with **zero fortress breaches**. It awards **+12% of that wave's Essence and Knowledge**, once per tier and chapter. A failed objective can be attempted again. A claimed objective cannot be farmed, and the reward has no Sigil payout, preserving the finite legacy progression economy.

Earned claims are stored additively in `p.chapterChallenges` in the existing local save; old saves are initialized with an empty map without touching inventory, currencies, milestones or upgrades. The Battle ribbon shows the objective and its status.

## Verification
GitHub Actions runs:
- `node --check game.js`
- `node tests/smoke.js`
- `node tests/balance.js`
- `node tests/encounters.js`

Encounter-specific regression coverage tests eight faction rotations, all new sprites, real specialist spawning, attack-rate debuff, non-stacking/cancelable sapper attack, banner range and death, siegebeast windup, protected early waves, achievement anti-farming, and battlefield HUD.

**Not claimed:** full 1,250-hour balancing; physical iPhone visual QA; all planned Alpha 0.10.x factions and specialized bosses completed. Those remain future work under the locked roadmap.

## Next
Alpha 0.10.2: 9th and 10th factions, richer chapter bosses (distinct vulnerability windows and reinforcements within caps), rare encounter events, more victory feedback, and further deterministic runs at milestone-heavy waves.
