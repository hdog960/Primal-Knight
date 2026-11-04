# Alpha 0.11.5 — Field Quartermaster: Actionable Pre-Siege Training

## Why
The Alpha 0.11.4 balance matrix revealed that a hypothetical lightly invested First Watch hero can fail Tier I wave 20 with some offensive combinations, whereas several defensive combinations reach the next tier. This does **not** establish typical player behavior or prove balance failure, but it highlights an onboarding problem: the War Council advises on doctrines while permanent Training spending requires leaving Battle and navigating to Power. The new slice makes existing permanent choices accessible directly before each siege.

## Real gameplay
- A compact, battle-lobby **FIELD QUARTERMASTER** is embedded inside the existing **War Council**, immediately after doctrine and rune guidance.
- Choose among three **real Power → Training** lines: Might (+2 base damage), Reflexes (attack-rate growth), Fortitude (+12 base maximum wall HP).
- Shows actual owned Hero Essence, actual next-rank cost, existing rank and cap; no mocked equipment/stat gains.
- A suggested first purchase rotates according to the *actual next encounter faction*: defensive Fortitude for rush-heavy Mirebound/Nightpack/Riftborne, Might for boss/ward and shield pressure, Reflexes for support/caster-heavy opponents. The suggestions are expert rules, **not win-rate predictions**.
- Tap **TRAIN · [cost] ESSENCE** to buy **one** permanent rank on the Battle screen. No auto-spending, currency grants, hidden discounts, free equipment, or compulsory build restrictions.
- The purchase uses the same `trainCost` formula and health adjustment as Power → Training. It recomputes fortress health and persists through the unchanged `primal_knight_onslaught_save_v1` key.
- The purchase path refuses all new transactions during fighting and between-wave intermissions. It rejects unknown upgrade IDs, full ranks and insufficient Essence; repeated taps always recalculate the current price.
- The Battle lobby retains its scroll position after upgrading. Portrait iPhone uses compact touch-safe 44px rows; short landscape adapts to 42px. Both preserve the existing stone/painted War Council palette.

## Scope and guarantees
This is the first player-facing utility from the progression-scaled balance findings. It does **not** alter actual combat damage, wave threat curves, enemy factions, ability cooldowns, reward rates, Essence price formulas, Gold/Knowledge/Sigil economies, equipment, runes, milestones, 30 tiers, 10,000 waves, or the ~1,250-hour *design target*.

The rollout requires all preexisting quality checks **plus** `node tests/quartermaster.js` covering live Battle clicks, exact costs, true persistent rank increases, unchanged owned item IDs and non-Essence currencies, caps, active-siege refusal and iPhone-sized controls.

## Still open
1. Measure real player-facing First Watch investment choices and outcomes at the Tier I wave-20 gate; the prior level-8 fixture was hypothetical.
2. Build budget-aware late-tier comparisons based on *earnable* Sovereign Oath and Dominion Crest progression, rather than assuming fully maxed investment is already available.
3. Continue physical iPhone Safari/Home Screen portrait, landscape, frame timing and visual QA.
4. Preserve the locked 0.12–0.15 sequence. A new UI shortcut does not complete the broader Hero Combat Depth phase.
