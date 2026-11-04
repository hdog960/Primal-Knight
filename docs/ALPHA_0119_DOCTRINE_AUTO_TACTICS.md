# Alpha 0.11.9 — Tactical Automatic Signature Ability Timing

## Purpose and playable feature
Continue the locked Alpha 0.11 Hero Combat Depth requirement for **automatic ability configuration**, without converting the game into a manual action title. Players now choose their automatic timing in **Hero → Battle Doctrines** and **Battle → War Council**.

Three strategies:
- **RAPID** (default): the preexisting behavior exactly — when cooldown finishes, the game attempts to auto-cast on a valid target. Aegis still refuses an unneeded full-health pulse without nearby threats.
- **HORDE**: hold a ready ability until four living enemies are present, a truly urgent boss/specialist cast threatens, or the wall has lost at least 9% HP and the selected ability is Aegis.
- **CRISIS**: hold until a true dangerous windup (boss ward, crusher, charge, blink, nearing Sapper fuse, Shaman ritual), enemies closing on the wall (y >= 288), a dense crowd of nine enemies, a wall below 78% health, or for Aegis a wall below 91%.

All three remain **fully automatic**. An ability on HOLD keeps its cooldown at zero instead of silently wasting the charge or resetting the timer. When pressure arrives, it casts immediately, then starts the same original cooldown. A valid attack or healing target is still required by the original ability.

## Persistence, presets, and safety
- One optional save field `doctrineTactic` with values `rapid|horde|crisis`, defaulting to RAPID for all existing and old imported saves. Unknown or malformed values normalize to RAPID.
- Three existing build presets now include a `tactic` setting, without duplicating any gear or runes. Pre-existing saved presets without one normalize safely to RAPID.
- Switching timing in either screen is free and allowed only **between sieges**. A live fighting/intermission swap cannot exploit cooldown or emergency healing, and updating a saved preset applies the tactic only after normal readiness/item validation.
- The live ability HUD reports `HELD` when a ready ability is intentionally conserved rather than misreporting a ready-but-idle charge. The selected strategy appears in the HUD dataset for styling and debugging.
- UI controls are touch-safe in portrait and low-height landscape while preserving the illustrated Hero Hall and War Council.

## Acceptance
Required new `tests/doctrine-tactics.js` covers Rapid baseline, four-enemy crowd threshold, crisis near-wall and dangerous cast triggers, hold-at-zero timer, actual Battle tap and unchanged scroll, no currency/item mutation, a saved-loadout round-trip, legacy saves without this setting, and old/malformed imported backups. The prior 20 gameplay test scripts continue alongside **two new suites**, for **22 gameplay test scripts plus JavaScript syntax validation (23 required checks)**.

A second required check, `tests/doctrine-tactic-battles.js`, simulates **54 real battle slices** (three strategies × three doctrines × three battle depths × two seeds) and validates finite combat, genuine held charges and no loss of permanent investments. These are controlled synthetic low-level scenarios, not population win rates.

The release does **not** change ability damage/healing, enemy patterns, wave rewards, equipment rarity, 30-tier progression, 10,000 waves per tier, Primal Sigil economy, or the 1,250-hour *design target*. Different casting preferences can change real battles, but no comparative win rate is claimed.

## Remaining
- Measure strategy timing in long real-combat encounters, including urgent Sappers and Aegis use. Confirm that hold criteria remain responsive at fast 2× and on 30/60/120Hz iPhones.
- Physically inspect iPhone landscape/portrait UI and test long sessions for battery/thermal pressure; headless checks are not hardware certification.
- Complete pending Hero Combat Depth acceptance before entering the locked 0.12 Living Territories & Art phase.
