# Alpha 0.12.12 — iPhone Visual Performance Profiles

## Real player-facing update

Settings now contains an illustrated-style **Battlefield Performance** selector, with three local profiles:

| Profile | Active canvas paint target | Ambient-weather density |
| --- | ---: | ---: |
| Vivid (the previous default) | 60 paint calls/sec | 100% |
| Balanced | 30 paint calls/sec | 65% (rounded up) |
| Battery Saver | 20 paint calls/sec | 35% (rounded up) |

**This is a visual adjustment, not a change to battle speed.** All wave encounters, enemy movement/collision, auto-attacks, doctrine cooldowns, boss telegraphs, challenge conditions, reward distributions, achievements and saved progress continue through the existing RAF simulation. The lower profiles affect only the canvas's paint scheduling and sparse atmospheric weather rectangles. Detailed painted backgrounds, territory banners, characters and warning effects are not removed. Existing 12Hz idle/paused, 10Hz menu, zero-draw Atlas/hidden-tab caps remain unchanged.

System Reduce Motion continues to limit active visual painting to 30Hz or below; it does not override a manually selected lower rate. This release respects reduced-motion suppression of animated ambient weather and battlefield shake just as earlier versions did.

The optional on-device performance monitor displays the chosen profile and effective maximum drawing rate in both its overlay and copied report. Compare Vivid/Balanced/Battery Saver on an actual iPhone during long sieges, noting real-world readability, responsiveness, stutter and device warmth. **We cannot assert actual thermal or battery improvements from frame targets alone.**

## Save compatibility, privacy and offline use

Vivid is the default for all existing players (no surprise visual changes). The choice is stored in a **separate local-only preference key**, `primal_knight_onslaught_visual_quality_v1`, never in the character's original save key `primal_knight_onslaught_save_v1`. Invalid values safely return to Vivid, and if Safari storage is blocked, the profile still works for the current session. No data is collected or uploaded; no new services or paid features.

## Automated verification

New `tests/visual-quality.js` exercises the actual JS gameplay controller in a Node VM: Vivid 60Hz, Balanced 30Hz, Saver 20Hz, lower ambient weather density, unchanged physics updates when draws are skipped, the 12Hz pause/10Hz menu/zero hidden rules, system Reduce Motion ceiling, persistence across reload, invalid preference fallback, denied-storage resilience, device monitor labeling and unchanged player progression/save payload. CI now requires **37 checks** (36 gameplay scripts plus syntax).

## Remaining Alpha 0.12 acceptance

Physical iPhone Safari and Home Screen confirmation still needed: close inspection of all three matching original-art banners, touch/pinch handling, actual long-session responsiveness, measured device heat/battery and performance across tiers. This release does **not** complete Alpha 0.12 or authorize advancing the locked Alpha 0.13–0.15 phases.

All 30 territories, 10,000 waves per territory, 1,144 one-time achievements and the approximately 1,250-active-hour **design** target are unchanged.
