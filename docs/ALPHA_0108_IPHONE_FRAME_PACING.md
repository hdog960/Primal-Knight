# Alpha 0.10.8 — Living Onslaught, Slice 9: iPhone Frame Pacing & Battle Readability

## Purpose
Alpha 0.10 remains in acceptance review. The iPhone-first 2.5D, original pixel-art siege scene must remain attractive while behaving consistently on 30 Hz, 60 Hz, and modern 120 Hz displays. Previously, `draw()` also advanced particles, floating damage labels, camera shake and muzzle flashes using fixed `1/60` increments. This made effects **twice as fast on a 120 Hz device**, half as fast on 30 Hz, and allowed effects to age while the game was paused. The HUD also regenerated its entire currency-card DOM at a fixed 6.25 Hz even when values did not change.

## Engine changes
- **Frame-independent effects:** Cosmetic lifetime and motion now advance in `advanceBattleVisuals(dt)` using simulated elapsed time; `draw()` renders only. Pausing genuinely freezes particle age and camera shake, not merely enemies.
- **ProMotion-friendly rendering:** Live siege simulation continues at requestAnimationFrame cadence, but the expensive 960×540 layered canvas is repainted at **no more than 60 Hz**. The underlying scene redraws at 10 Hz when the user is in an overlayed menu (combat itself still runs). In backgrounded tabs, canvas rendering is skipped.
- **Reduced motion:** `prefers-reduced-motion:reduce` uses a 30 Hz visual cap without slowing combat, and suppresses the camera-shake effect and muzzle flash. Original sprites, enemy effects, gameplay, and scene detail are preserved for ordinary settings.
- **Cached resource cards:** The Gold, Essence, Knowledge, Sigils and Skill Point header is rebuilt only if displayed values have changed, reducing unnecessary mobile layout work when resources remain constant.

## iPhone UX changes
- **Portrait HUD:** Three narrow, equal-width upper status cards can shrink without overflowing typical narrow phone widths. Labels wrap safely.
- **Special-wave legibility:** Wider compact encounter ribbon, larger live attack/counterplay text and reward-objective copy, with a consistent battlefield backdrop instead of empty-looking portrait padding.
- **Boss feedback:** Slightly larger boss name, phase, HP bar and live ability instructions in portrait, respecting the existing cinematic game art.
- **Touch targets:** Portrait battle control buttons have minimum 44×44 CSS pixel targets; compact landscape controls have at least 42×42. Existing game mechanics, button locations and five primary tabs are unchanged.

## New automated regression gate
`tests/mobile-render.js` executes the actual game script in an instrumented browser-like environment. It tests:
- Eight consecutive redraws do not age visual effects.
- Equivalent 30 Hz and 120 Hz simulated time produce near-identical transient effect lifetimes and positions.
- Combat pause freezes transient visuals.
- A 120 Hz RAF does not produce 120 expensive canvas redraws; menu and background throttles operate as intended.
- Reduced-motion preferences affect frame pacing and camera shake.
- The resource HUD avoids rebuilding itself when its values are unchanged.
- Static mobile CSS rules exist for compact layout and touch targets.

Required GitHub Actions test commands now include:
```sh
node --check game.js
node tests/smoke.js
node tests/balance.js
node tests/encounters.js
node tests/deepwave.js
node tests/mobile-render.js
```

## Scope and protected contracts
- No changes to progression, wave HP scaling, attack mathematics, special encounters, boss counterplay, drops, one-time Sigils or the user's existing save.
- Original local storage key `primal_knight_onslaught_save_v1`; no new state field needed.
- Still **not** physical iPhone/Safari device QA; a static CSS test is not a screenshot or touch interaction test. Explicit hardware review of real device layout and performance remains outstanding before closing Living Onslaught or advancing to the locked Alpha 0.11 Hero Combat Depth phase. The 1,250-hour completion target remains unverified.
