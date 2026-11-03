# Alpha 0.10.5 — Living Onslaught, Slice 6: Boss Counterplay & Stagger

## Goal
Turn the already-readable enemy telegraphs into mechanical decisions. High single-target pressure and targeted builds should help the automatic hero **interrupt** dangerous moves; the user should be able to understand *why* the counter worked.

This release is **not** completion of Alpha 0.10 and does not change the locked Alpha 0.11–0.15 development roadmap. The game retains its single-hero automatic siege, 30 tiers × 10,000 waves, early First Watch onboarding, all milestone / Sigil caps, earned-currency economy and the unverified 1,250-hour design target.

## New combat behavior

**Real interruptions.** Major enemies accumulate damage received only during active telegraphs. Reaching **9% of max HP before the windup ends** interrupts the impending ability:
- **Siege Beast:** The initial crusher windup can be broken once; no phantom speed boost on cancellation.
- **Cinder Regent:** The charge is cancelled and placed on a 4.5-second cooldown.
- **Void Monarch:** The next warp is cancelled and placed on a 5.5-second cooldown. If the boss survives, it may telegraph subsequent warps. Each successful step remains bounded at 26 world pixels, separated by a 7-second cooldown, with no new step initiated within 105 pixels of the wall.

**Iron Tyrant Ward.** The Iron Ward now lasts up to 2.2 seconds; landing **10% of maximum boss HP** worth of damage while it is active destroys it early. Timed-out wards also end naturally.

**Temporary stagger payoff.** Any successful boss counter produces a 1.3-second exposed window. Further attacks during this window deal **12% more damage**. New golden battlefield outlines and existing boss HUD announce the exposed state. The HUD also clarifies which actions can be countered.

**Automation still matters.** The hero receives increased priority for an active major-boss windup while retaining priority for dangerous sappers, casters and fast breaches. Players do not need twitch controls or extra action buttons.

## Guardrails

- The counter damage required is proportional to boss health, not an extra level or currency requirement.
- Hit damage from the actual established combat formula drives the mechanic. No invisible charge accumulation outside the windup.
- Interruption has no new Sigil, relic, rune, item, or permanent-currency reward. Existing progress / saves are unchanged; transient counters are reset each wave.
- No new spawn counts, unnecessary particles or audio. Existing object pools and the 24-enemy wave limit remain intact.
- Boss mechanics should be counterable, not automatic: strong focused builds fare better than weak builds; failing the counter lets the known move proceed.

## Regression and verification

GitHub Actions runs:
```sh
node --check game.js
node tests/smoke.js
node tests/balance.js
node tests/encounters.js
```

Encounter regression coverage verifies four distinct counters, phase-II behavior, live boss HUD messaging, real exposed damage bonus, cooldowns and bounded rift movement, prioritization, one-counter-only behavior, and reset semantics.

**Still awaiting:** physical iPhone portrait/landscape HUD review, stress testing of advanced waystones and deep-wave boss readability, subjective boss tuning, and long-term playtime validation. Do not claim full Alpha 0.10 acceptance until assessed.
