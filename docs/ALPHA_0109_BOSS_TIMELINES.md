# Alpha 0.10.9 — Living Onslaught, Slice 10: Boss Timelines & Reliable iPhone Controls

## Why this matters

Alpha 0.10 remains in final acceptance work. Two concrete control bugs were identified in the real game: pressing **1× / 2×** while combat was paused silently restarted the battle while leaving the pause button displaying **▶**, and backgrounding Safari during an **intermission** did not trigger the same protective pause as an active wave. Both could surprise a player in a long 10,000-wave attempt.

The on-screen boss HUD also announced an attack without conveying the **actual remaining windup time**, which made the existing damage-based interrupts harder to understand.

## Shipped improvements

### Honest controls and app background behavior

- **Pausing remains a pause:** The battle speed button changes the *resume speed*, not the current simulation, while paused. The game remains frozen until the player presses **▶**.
- **Stateful, accessible controls:** Buttons, titles, accessibility pressed state, the selected speed and a compact **SIEGE PAUSED** message always agree with combat state.
- **Safe page visibility:** Both live fighting and between-wave intermissions pause when the browser backgrounds or pagehide fires, after saving progress. Returning to the game does not silently auto-resume the siege; the player chooses when to resume.
- **Reliable run restart:** Beginning a fresh siege after retreat automatically enters the selected 1×/2× speed rather than inheriting a previous zero-speed session. Importing or undoing a save import resets transport safely.
- All pause/speed values are **transient**; no permanent progression, milestone, rune or saved-data fields were added.

### Real major-boss combat countdowns

- A compact secondary meter appears inside the existing boss-health panel **only when the boss is preparing an attack or maintaining an Iron Ward**.
- Siege Beast **Crusher Strike** — 1.1-second attack preparation, progress fills as the crusher approaches.
- Cinder Regent **Ember Charge** — .9-second interruptible charge, progress fills during the real windup.
- Void Monarch **Void Step** — 1.05-second interruptible step, progress fills during the real windup.
- Iron Tyrant **Iron Ward** — remaining defense duration shrinks over its 2.2-second protection window, with a visually distinct blue bar.
- On cancellation, death or phase change, the meter hides or updates immediately rather than depicting a nonexistent windup.
- Existing enemy damage rules, interruption thresholds, +12% exposed vulnerability, encounter rewards and the 30×10,000-wave structure remain exactly as before.

### Visual direction

The timer and paused status use the established painted fantasy/illustrated-pixel aesthetic. They use compact type, warm parchment-gold trim and small-screen rules for landscape. There are no replacement icons or generic shape sprites.

## Automated QA

The existing six-check GitHub Actions gate continues to run. New test assertions in `tests/mobile-render.js` exercise:
- A true running wave, pause, speed selection while frozen, and later 2× resume.
- Exact wave time, spawning and active playtime remaining unchanged while paused.
- Backgrounding a fight and an intermission; resume without skipping the timer.
- Restart after retreat, fall-screen visibility and accessibility control state.
- Live Cinder, Iron and Siege Beast boss meters with correct measured fill and actual labels, and accurate hiding when effects end.
- Static real HTML/CSS existence checks for pause banner and boss countdown.

## Remaining acceptance work

There is still **no physical iPhone Safari or Home Screen device QA**, and this release is not an assertion that the full 1,250-hour progression target is measured. Long-wave playfeel, boss fairness, and iPhone layout in both orientations still need player evaluation before the locked **Alpha 0.11 — Hero Combat Depth** phase begins.
