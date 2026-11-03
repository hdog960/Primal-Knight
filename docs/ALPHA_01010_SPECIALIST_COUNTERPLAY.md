# Alpha 0.10.10 — Living Onslaught, Slice 11: Specialist Cast Counterplay

## Purpose

Living Onslaught must communicate clear battlefield threats and give the hero's equipment, accuracy and offensive build **actual** counterplay against them. Since Alpha 0.10.6, the battlefield ribbon and faction manual have warned players to stop Sapper explosives, Frostbinder rites, Thornweaver wards and Riftstalker blinks. Until this release, only killing those enemies could cancel their casts; ordinary focused hits had no countering effect.

This slice makes the visible warning mechanically true without adding another manual combat button or changing the game's automatic hero focus.

## New active combat mechanics

- **Sapper fuse:** A Sapper's 1.3-second visible fuse can be disarmed by dealing a cumulative **18% of its maximum HP** during the lit countdown. It does not explode after being interrupted and cannot arm that same fuse again. Without a counter, its existing wall-damage blast remains intact.
- **Frostbinder rite:** During its .95-second frost-windup, cumulative damage equal to **18% max HP** cancels the chill attack. An interrupted Frostbinder must wait at least 5.4 seconds before attempting another cast. The hero is not chilled by a spell that never completed.
- **Thornweaver ward:** During its .85-second windup, cumulative **18% max HP** damage cancels its defensive spell. The caster waits 5.3 seconds before attempting the next ward and never protects allies from the interrupted cast.
- **Riftstalker blink:** During its .95-second purple blink warning, cumulative **22% max HP** damage disrupts the displacement. It stays in its original location; the existing single-blink-per-unit limit remains intact.

Damage is counted by the **actual existing** outgoing damage formula after armor, auras and modifiers, regardless of whether the shot comes from the hero or a defensive station. Damage outside a cast window does not count toward a later cast. When the cast starts, ends or is cancelled, its accumulated progress resets. Killing any specialist still cancels its ability through existing dead-enemy handling.

**Feedback:** A short gold progress strip appears above an enemy's HP only after a caster has been damaged during a still-active cast; a distinct floating label and small gold disruption burst indicate successful counterplay. There is no generic icon overlay and no extra expensive sprite assets.

## Compatibility and fairness

- Existing boss-specific ward and attack interrupts, exposure bonuses, HP balance and attack frequency remain unchanged.
- No new permanent currency, items, wave counts, milestones, achievements or progression unlocks. Existing Tier I–XXX × 10,000-wave conquest and the same local save key remain untouched.
- All progress tracking for these four specialist abilities is **transient**, stored only on live enemies and discarded at the end of the wave. The existing 24/48/140/28 actor/projectile/particle/float limits remain.
- The in-game Field Manual explains that focused damage, not just a full kill, breaks these casts and shows where to watch the progress indicator.

## QA

The unchanged six-gate GitHub Action now includes new real-combat regression checks in `tests/encounters.js`: partial vs completed damage counters, cancelled fuse explosions, surviving Frostbinder/Thornweaver recovery delays, no phantom Riftstep, out-of-window damage not precharging a cast, no counter on dead casters, live Sapper wall damage when not interrupted, combat feedback and drawing.

The other required tests remain `node --check game.js`, `node tests/smoke.js`, `node tests/balance.js`, `node tests/deepwave.js` and `node tests/mobile-render.js`.

**Still not satisfied:** physical iPhone portrait/landscape legibility and uninterrupted long-run player testing; the ~1,250-hour total completion target remains design intent, not measured. Alpha 0.10 remains open until device and gameplay acceptance review. This slice does not begin Alpha 0.11.
