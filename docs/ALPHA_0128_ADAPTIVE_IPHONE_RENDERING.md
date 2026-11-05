# Alpha 0.12.8 — Adaptive iPhone Render Pacing

## Concrete performance problem
The visual renderer was still asking the browser to repaint the entire illustrated 960 × 540 battlefield at **60 Hz** even when the player had not started a siege, was paused on a frozen battlefield, or was inspecting an opaque World Atlas. This repeatedly composites a detailed PNG, a dynamically decoded landscape and guild banners, weather and canvas effects even though those visual layers are not changing.

A static sky vignette also created an otherwise identical `CanvasGradient` and two stops every paint, despite having fixed coordinates and a constant color ramp.

## Actual gameplay update
`drawInterval()` now chooses canvas paint cadence according to player-visible state:
- **Active combat or wave intermission:** unchanged **60 Hz** target, or **30 Hz** for system Reduced Motion.
- **Idle, fallen/completed or paused battlefield:** **12 Hz** cap (one full canvas paint approximately every 83ms).
- **Menu overlay:** existing **10 Hz** cap.
- **World Atlas open:** **zero underlying canvas paints**, because the fullscreen artwork preview fully covers the battlefield.
- **Safari tab hidden:** existing zero canvas paints.

The `requestAnimationFrame` scheduling loop and simulation `tick(dt)` are **not stopped**; active and between-wave simulation retain their original time and frame progression. Pause continues to stop progression. Closing the Atlas restores canvas painting at the next permitted frame, and entering live combat automatically returns to full 60/30 Hz.

The Atlas open/close bit is a *transient JS variable* (not stored in localStorage); it is closed/reset when the user closes the gallery or starts a siege.

The original background vignette is now a single lazily created, reused `CanvasGradient`; the canvas uses fixed 960 × 540 logical resolution so its gradient can remain constant. Weather, boss staging, 30 generated landscapes and all three biome-colored banners remain fully intact.

## Verification
Updated `tests/mobile-render.js` explicitly tests 12Hz idle vs original 60Hz combat and 30Hz active Reduced Motion, plus existing Safari 120Hz request scheduling, menu pacing, boss warning HUD, and pause behavior.

New required `tests/adaptive-mobile-render.js` drives the actual game RAF callback and verifies idle, fighting, paused, menu, Atlas and hidden-tab states, that game-time progression still updates on intermediate callbacks even when a paint is skipped, and that dozens of consecutive paints allocate only **one** sky gradient. The prior 32 gates remain; the workflow now has **33 checks** (32 gameplay scripts and JS syntax validation).

**Important:** The reduction from a 60Hz target to a 12Hz idle target is a theoretical **80% reduction in requested idle canvas paints**, not a measured 80% drop in power use. A physical iPhone Safari/Home Screen test is still required to establish real FPS, thermal performance, responsiveness and battery impact. No economy, damage, saved character fields, achievements or 30 × 10,000 wave progression were changed.
