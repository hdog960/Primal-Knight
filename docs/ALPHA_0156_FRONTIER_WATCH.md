# Alpha 0.15.6 — Frontier Watch & Earned Multi-Territory First Watch

## Production feature
In Battle's tier lobby, the new optional **Frontier Watch** appears whenever the next First Watch chapter still requires genuinely new first-time wave victories. It reads the character's original `p.unlockedTier`, `p.bestByTier`, and current First Watch chapter (derived from `p.firstWatchClaimed`, `p.battleSeconds` and `p.uniqueClears`). Up to three **already unlocked** realms with the lowest prior wave records are listed; each notes whether it is untried or what wave must be surpassed for additional unique first clears. It clearly warns that harder realms may be more difficult and no route guarantees victory.

The button **Prepare This Tier** changes the same real selected-tier state and verified local character save that the existing tier grid uses. It does **not** start combat, skip waves, set a new best, award an achievement, grant currency, claim a chapter, add save schema, change enemy strength or automatically invest. If a different tab has changed the primary save or local storage rejects the write, selection is refused rather than misrepresented as saved. The tier grid uses the same fail-closed safe selection procedure. Existing original fantasy art, 44px touch targets, compact single-column iPhone presentation and all 30×10,000 waves remain intact.

## Earned, seed-paired multi-tier verification
`tests/first-watch-multi-tier.js` runs a controlled **Tier I-only** versus **frontier routing** comparison on the same three RNG seeds, with genuine skill point investment, original-priced training and research/station upgrades, real siege wins/losses, unlocks, distinct first clears, and saved reloads. Each control stays in Tier I; the frontier policy switches to Tier II *only after Tier I wave 20 legitimately unlocks it*, with periodic return to Tier I. Ten real attempts per route and seed = **60 engine-backed sieges**, in addition to the prior 72-siege Alpha 0.15.5 regressions. Routes follow explicit scripted decisions and no full 12.5-hour playthrough is claimed. The new test also checks actual lobby click routing, locked-tier refusal, no auto-combat, cross-tab storage write locks, finite Sigil/chapter accounting, and old-save compatibility.

## Release gate and limits
**75 mandatory automated checks including JS syntax**; preserve every previous test, confirm PR CI, merge, post-merge CI and GitHub Pages. Manual iPhone acceptance remains deferred by player directive until Alpha 0.15 development finishes. The 750-minute First Watch, real mid/endgame upgrade affordability, and 1,250-active-hour maximum-progression goal remain unverified. This work does not quietly replace those objectives.

## CI-verified, genuinely earned results (three matched seeds)
The successful 75-check PR run executed 60 real-engine sieges (3 seeds × two controlled route strategies × 10 attempts), with identical **combat-first** purchasing policies for each pair. The comparison route stayed in Tier I; the frontier route used Tier II only after authentic Tier I wave-20 completion and returned to Tier I periodically. Combat ran through natural defeats or explicitly bounded test retreats, without fabricated currency, unique wave clears or chapter time.

| Seed | Tier-I-only unique clears | Frontier unique clears | Tier-I-only chapters | Frontier chapters | Tier-I-only active min | Frontier active min | Frontier best Tier I / II |
|---|---:|---:|---:|---:|---:|---:|---:|
| 15411 | 40 | 65 | 4 | 5 | 95.92 | 87.10 | 33 / 32 |
| 15423 | 41 | 65 | 4 | 5 | 92.71 | 85.50 | 33 / 32 |
| 15437 | 41 | 68 | 4 | 5 | 97.65 | 89.04 | 38 / 30 |

**Interpretation:** In all three deterministic seed pairs, routing into unlocked Tier II earned chapter five (35 active minutes **and** at least 53 genuine unique wave victories) within ten authentic sessions, while staying exclusively in Tier I did not. The route controls and original combat balance were unchanged. These outcomes support the read-only Frontier Watch guidance and suggest **not** weakening the First Watch fifth-chapter threshold prematurely.

**Important limitations:** Each sample uses the same scripted early spending priority, just three RNG seeds, and no human decisions or physical iPhone input. Tier III became legally unlocked in the frontier cohorts but was not played in this comparison. Do not generalize a guaranteed result or treat this as a full 750-minute First Watch, midgame/endgame affordability or 1,250-hour completion proof. Future work should evaluate multi-tier decision quality after chapter five, realistic gear/rune choice and late-game affordability, then physical device QA after locked development finishes.
