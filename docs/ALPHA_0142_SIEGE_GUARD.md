# Alpha 0.14.2 — Siege Guard: Long-Session Rest Controls

**Roadmap:** Long-Run Quality of Life, slice 3. **Device testing:** deferred until development through Alpha 0.15 is complete.

## Player experience
The same real battle and manual 1×/2× pause controls remain. New opt-in Siege Guard preferences are available both when choosing a tier and inside Settings during a siege. Every toggle defaults OFF and is fully reversible. The player can choose to **pause automatically**, never fast-forward or resume automatically, at:
- A genuinely cleared wave divisible by 25, 100 or 500. The full original wave's enemies, awards, XP, first-clear checks, special objectives and one-time milestones are processed before the between-wave countdown is paused. Skipped older checkpoint numbers do not produce spurious rests.
- 15, 30 or 60 real minutes of actively simulated foreground play. Paused, hidden, idle and non-running time is excluded. At each rest the counter restarts to the next configured interval; 2× battle speed does not double elapsed time.
- A live fortress at or below 20% health, once until it has actually recovered above 35%. No alert after the fortress has fallen or after a fully cleared wave has already healed it.

Each rest is explicit in the HUD. Manual pause or 1×/2× switching does not accidentally unpause the battle; only the existing resume control does. Leaving Safari still pauses the battle. There is no idle combat, automatic upgrade spending, unearned currency, invented wave clearance, auto-retreat or purchase automation.

## Preservation and testing
Device-only validated `primal_knight_onslaught_siege_guard_v1` localStorage contains only wave/time/HP preference values and cannot grant game progress. Nothing is added to character exports or the original `primal_knight_onslaught_save_v1` key; old saves and 0.14.0 recovery checkpoints remain compatible. If browser preference storage is blocked, OFF is the safe default at a fresh load and in-session controls still work.

`tests/siege-guard.js` performs actual in-engine wave clearing and rewards followed by true between-wave pause, manual-resume and 2× preservation, elapsed-time cutoff without another combat tick, critical-wall latching, high-wave waystone boundaries, settings validation and character-save isolation. Existing 62 checks remain and this adds one for **63 mandatory checks including JavaScript syntax**. This is a focused Alpha 0.14 slice, **not** completion of Alpha 0.14. Remaining goals: deeper wave navigation, backup migrations and earned-progress discoverability, followed by Alpha 0.15 balancing and consolidated physical iPhone testing.
