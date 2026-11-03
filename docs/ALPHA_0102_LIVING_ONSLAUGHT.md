# Alpha 0.10.2 — Living Onslaught, Slice 3

## Scope
This is the next development slice of the locked **0.10 Living Onslaught** phase, not completion of all 0.10–0.15 work. Retains 30 tiers × 10,000 waves, the 1,250-hour unverified design goal, 12.5-hour First Watch, all finite Sigil milestones, and iPhone-safe combat caps.

### Two more enemy factions (ten total)
- **Thornwake Circle:** Thornweaver mages telegraph an 0.85-second cast before providing nearby allies a temporary 14% damage-mitigation ward for 2.8 seconds. Killing the caster immediately ends the ward; effects cannot stack with themselves. Distinct original-style green antlered pixel-art variant from the established Shaman artist palette.
- **Riftborne Court:** Riftstalkers telegraph a 0.95-second phase blink before advancing a **bounded 36 world pixels**. Hero automatic targeting prioritizes the visible charge. A living Riftstalker can blink once; no instant fortress breaches. Distinct violet dual-blade pixel-art variant from the established Raider silhouette.
- Both enter the normal faction rotations from wave 20 onward. No specialist is allowed more than two active units at once. The first tutorial waves remain gentle. Five new coherent raster-grid SVG sprite variants live in `assets/`.

### Three distinct century-boss profiles
Centuries now rotate **Iron Tyrant → Cinder Regent → Void Monarch**, with corresponding original pixel-art recolor and detailed crown markers:
- Iron Tyrant raises a short 22% defensive ward after the 55%-HP phase switch.
- Cinder Regent winds up a telegraphed movement surge after the phase switch.
- Void Monarch winds up a bounded 26-pixel phase step. It cannot teleport directly across a full field.
- Chapter battles reserve 2 of the existing 24 spawn slots for one-time phase-II reinforcements: guardians, raiders, or wargs respectively. The reinforcement guard prevents duplicating the boss. All extra behavior is transient and interruptible by killing the relevant unit. Flawless Chapter remains independently claimable.

### Optional Relic Hunts
- A rare `RELIC HUNT` replaces an otherwise ordinary patrol when wave ≥30 and `wave % 89 === 43`, unless a higher-priority boss, elite, commander or treasure wave occurs.
- Hold the fortress without any breach on that wave to claim **one free rune** plus **10% of that wave's Knowledge**; the rune tier improves gradually with wave depth (maximum 12) and respects the existing 240-rune inventory cap.
- A failed challenge remains available to retry. A successful claim is recorded in a new additive `p.relicHunts['tier:wave']` save ledger; it can never be farmed repeatedly for an extra rune or Knowledge. There are **no Sigils**, unique crests, exclusive tier-unlocks, or premium currencies associated with relic hunts.
- The existing Battle HUD and pre-siege intelligence report the encounter and optional objective.

### Technical compatibility / checks
- Previous saves remain at `primal_knight_onslaught_save_v1`; absent `relicHunts` ledger is initialized without touching inventory, item identities, current ranks or milestone claims.
- Full checks: `node --check game.js`, `node tests/smoke.js`, `node tests/balance.js`, `node tests/encounters.js`.
- Encounter QA covers all ten faction rotations, specialist casting and interruption, unique boss styles, reinforcements staying at 24, correct once-only payout, failed-challenge replay, and actual HUD labels.
- Still necessary: physical iPhone Safari and Home Screen visual/playtesting, performance at long-wave waystones, and sustained player testing of the 1,250-hour target.

## Following slice
Evaluate in-device visual readability and boss attack fairness; continue adding varied major boss mechanics and rare encounters if needed, then review all 0.10 acceptance criteria before moving to 0.11 Hero Combat Depth.
