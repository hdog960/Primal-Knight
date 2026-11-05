# Alpha 0.12.11 — On-Device Performance Check

## Player-facing addition

An optional **FPS** control in the real battlefield and **START DEVICE CHECK** in Settings opens a compact performance overlay. The player can check the actual iPhone while running a long siege and copy a small, local report to share for diagnosis. This is an artwork/performance acceptance aid, not a claim that physical iPhone testing has already happened.

The diagnostics report:
- **PAINT/s** — number of actual calls to the game's 960×540 canvas `draw()`, not GPU compositor frames or screen refreshes;
- **RAF/s** — actual animation-frame callbacks arriving from Safari (potentially 60 or 120 per second);
- **SLOW** — callback-to-callback gaps of 34ms or more within a two-second sampling window, plus worst gap in milliseconds;
- **ACTIVE** — measured active siege time while the game is fighting or between waves;
- the currently observed mode: fighting, paused, menu, lobby, atlas, or hidden, and tier/wave context.

The check defaults **off** and updates its DOM text once every approximately two seconds when active. When off it executes only a single optional conditional in the frame loop. A hidden or returning tab's gap of more than 250ms does not count as "slow"; pauses do not add active-siege time. Toggling it resets all counts. Copying a report uses the browser clipboard on a user tap; if clipboard permissions are missing, the player can screenshot the visible readout. Nothing is uploaded or added to a permanent save.

## How to gather real-iPhone acceptance evidence

1. In Safari or the installed Home Screen game, start a siege in Tier I. Tap **FPS** during combat to enable the overlay.
2. Compare **PAINT/s** and **RAF/s** after two seconds. During active combat the engine targets up to 60 canvas paints per second, or 30 with Reduce Motion. The callback rate can be higher on a ProMotion display.
3. Leave the game running for a longer session, note any visual stutter, poor animation, heat, or battery usage, and copy the report or take a screenshot.
4. Repeat in a later illustrated territory, with a boss, and after returning from the World Atlas. Normal paused and idle display caps are different on purpose.
5. Turn the check off when finished; no performance data is saved.

The tool **cannot measure actual GPU FPS, battery drain, device temperature, input latency, or visual art quality**. Those still require hands-on iPhone assessment. No data is sent to any service.

## Regression acceptance

The required `tests/device-perf.js` exercises the real game controller in a Node VM: 60Hz animation callbacks paired with 15Hz paint calls, a two-second sample, a long callback gap, real paused and hidden states, resetting on toggle, DOM labels, and zero changes to permanent progression or localStorage. Combined with the existing 35 required checks, the release gate is now **36 checks** (35 gameplay scripts plus syntax).

All 30×10,000-wave progression, 1,144 achievements, encounter logic, balance, original art assets, saves (`primal_knight_onslaught_save_v1`), and the unmeasured ~1,250-hour design target remain unchanged. Complete Alpha 0.12 visual/device acceptance before moving to locked Alpha 0.13.
