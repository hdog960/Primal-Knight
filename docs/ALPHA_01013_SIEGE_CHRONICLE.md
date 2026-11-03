# Alpha 0.10.13 — Living Onslaught, Slice 14: Siege Chronicle & Accurate Waystone Debriefs

## Player-facing issue

The old retreat message calculated "waves cleared this run" from the absolute wave counter. After restarting from an unlocked waystone at wave 8,000 and winning only two waves, a player could see a statement like **"Cleared 8,001 this run"**. It confused long-term progress with the current session and made meaningful boss balance testing more difficult.

## Implemented gameplay-facing Chronicle

Every siege now maintains accurate, **session-only** combat metrics:
- Actual **starting wave** (including any unlocked waystone) and **last reached wave**.
- **Waves cleared in this siege**, incremented only when the existing real `completeWave()` succeeds. No invented clears from a deep-waystone start or retries.
- **Enemies defeated**, counted on actual `kill()` calls.
- **Major boss abilities interrupted**, counted on successful real Iron Ward shatters, charge/warp/crusher stops.
- **Specialist spells/fuses disrupted**, counted only when the damage-based cast counter succeeds.
- **Boss and siege-engine waves conquered**, counted after successfully clearing a chapter boss or commander encounter.
- **Total fortress breaches**, accumulated across waves, in addition to the existing independent *per-wave* `run.breaches` used by flawless bonus logic.
- **Actual Sapper detonations** appearing in the details of an after-action debrief.

The Battle tier lobby now includes a small, expandable, painted-fantasy **SIEGE CHRONICLE** strip after a retreat, defeat, or Eternal Victory. The collapsed strip shows outcome, actual waves cleared, foes defeated and total breaches. Opening it reveals the full six-stat breakdown and the true waystone-to-end wave range. It is responsive in portrait and compact landscape.

## Reset and compatibility guarantees

- Beginning a siege clears the previous report and resets all run counters.
- Existing per-wave boss interrupts and breach counters still reset per wave; the Chronicle uses separate run-lifetime totals. No change to flawless challenge rules, earning rates, damage, rewards or enemy AI.
- This is deliberately **session-only**: a report disappears when Safari reloads, to avoid adding permanent save complexity in the middle of Alpha 0.10 acceptance work. No new persistent field is added, and the existing `primal_knight_onslaught_save_v1` data remains untouched.
- Switching the bottom tabs, reopening the lobby or choosing a different tier does not double-count or regenerate report totals.
- All 30 tiers × 10,000 waves/tier, unique milestones, earning caps, save export/import, iPhone PWA access and locked Alpha 0.11–0.15 plans are unchanged.

## Automated verification

Added **ninth** required GitHub quality check `node tests/siege-chronicle.js`, plus the eight previous checks. Its real game-VM tests cover:
- Start from earned wave-100 waystone, two actual clears, and truthful "Cleared 2 this run", not 101.
- Actual kill, boss break, specialist break, successful chapter boss clear and real wall breach; verify session totals survive wave transitions.
- Accurate after-action numbers and accessible UI in the real Battle tier lobby.
- Reopening the lobby does not double-count; starting another siege resets the report, with an immediate retreat showing zero clears.
- A real wall-impact fortress defeat, plus simulated wave-10,000 Eternal Victory.
- No session counters serialized into permanent save data; compact portrait layout and Safari cache-bust checks.

## Open acceptance work

This release improves visibility into actual combat balance, but **it is not evidence that the full 1,250-hour goal or physical iPhone portrait/landscape framerates have been measured**. Real iPhone touch, readability and boss-playfeel acceptance is still outstanding before the locked Alpha 0.11 Hero Combat Depth phase should begin.
