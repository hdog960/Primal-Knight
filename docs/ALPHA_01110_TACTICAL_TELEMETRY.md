# Alpha 0.11.10 — Tactical Auto-Cast Feedback and Siege Chronicle

## Goal
Continue the locked Alpha 0.11 Hero Combat Depth phase by making the Alpha 0.11.9 automatic casting controls intelligible in play and reviewable after a siege. Preserve the automatic incremental defender identity. No new manual combat input is required.

## Player-facing improvements
- The existing signature ability timer now shows four distinct states: cooldown seconds, **READY** (an actionable target meets the chosen tactic), **HELD** (an eligible enemy is present but Horde/Crisis deliberately conserves the charge), and **WAITING** (there is no useful target yet). The previous `ready` indicator remains available, and an additional `status` state is exposed for UI styling.
- The **Siege Chronicle** now shows actual signature auto-casts, the number of distinct charge-hold episodes, and combat seconds spent intentionally holding a ready charge. It also labels the final active cast strategy and notes the count of urgent trigger casts when any occurred.
- Each successful auto-cast is classified by its actual trigger: Rapid, Crowd, Frontline, Repair, or Urgent. This classification is descriptive and does not change the original damage, healing, target priority, cooldown, or reward calculations.
- The hold counter increases only while a selective tactic has a living target but deliberately postpones a charged skill. No enemy means WAITING and zero additional held time; a charge that remains held for ten physics updates is **one** hold episode. Starting a new wave resets the episode flag, but preserves that siege's aggregate metrics.
- The after-action numbers are transient per siege. Starting a new siege resets them; reopening the lobby cannot re-award or re-count. No additional fields enter the player's `primal_knight_onslaught_save_v1` save.

## Validation
The new `tests/doctrine-telemetry.js` exercises actual signature casts and damage/healing through the game functions, including Horde crowd, Crisis frontline, Aegis repair, and urgent windup triggers. It checks Waiting versus Held in the live HUD, measured in-game hold time, Chronicle output, reset on retry, existing saved item/currency integrity, and no new permanent-save keys. Every previous regression script remains required.

Automated physics time is **in-game simulated seconds**, not a claim of actual elapsed wall-clock time. A strategy's number of casts does not alone indicate better balance or player success.

## Remains outside this slice
- Physical iPhone Safari and Home Screen review for portrait and landscape, long-wave performance and battery/thermals.
- Cost-realistic endgame non-Sigil gear, training, station and research investment.
- Long-form empirical validation of the 1,250-hour design target.
- Final Hero Combat Depth acceptance and the locked Alpha 0.12–0.15 phases.
