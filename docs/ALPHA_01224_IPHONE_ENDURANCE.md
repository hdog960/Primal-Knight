# Alpha 0.12.24 — iPhone Endurance Review

## What this slice adds
The opt-in battle **FPS** panel now exposes a real 30-minute active-siege endurance review. After enabling FPS and beginning a siege, its status reads **ENDURANCE 0:00 / 30:00**. Six milestones, each after five minutes of measured foreground active-siege callback time, capture the current tier, wave, visual preset, animation callback frequency, canvas paint-call frequency, active-mode callback gaps ≥34ms and longest active-mode callback gap. Longer sessions retain only the latest 12 records; this bounded array prevents runaway memory usage.

The player can tap **COPY REPORT** to copy the current record plus blank manual observations for iPhone battery, subjective warmth, and visibility/performance issues. **RESET** restarts the endurance review without ending a siege; turning FPS off discards the in-memory review. Neither action alters game progress. No telemetry is uploaded or stored. The live encounter HUD remains in place, and the existing SHARE BATTLEFIELD PNG button still exports the real painted scene.

The timer counts only valid active sieging callbacks in matching foreground fighting modes. Paused, menu, Atlas and hidden intervals, including large Safari return gaps, do not inflate active time. The older callback-gap totals remain available and are distinguished from the new active-only statistics.

## Verification
`tests/iphone-endurance.js` uses controlled synthetic RAF timestamps in the actual game engine, asserting six correct five-minute checkpoints, 30-minute target status, bounded checkpoints after one hour, pause/background exclusions, report contents, reset, iPhone controls, and unchanged saves. The repository quality gate increases from 48 to **49 required checks including syntax validation**. Existing gameplay/economy/spawn tests remain mandatory.

## Physical acceptance still required
This cannot measure real GPU FPS, battery percentage, CPU temperature, or thermal throttling from browser JavaScript. To finish Alpha 0.12 acceptance, play on a real iPhone with the FPS panel active for 30 minutes, preferably on Vivid, Balanced and Battery Saver separately. Copy the report after each run, optionally share a battlefield PNG and note any overheating, low readability, crashes, severe input latency or unexpected battery drain. Do not call the phase complete based only on synthetic test results. The locked Alpha 0.13–0.15 roadmap and original ~1,250-hour design target are unchanged.
