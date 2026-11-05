# Alpha 0.12.14 — Live Specialist Cast & Counterplay Readability

## Player-facing change

Short casts from Sappers, Riftstalkers, Frostbinders and Thornweavers were previously communicated with scattered tiny effects and temporary messages. While a real threat is charging, the existing battlefield encounter banner now shows **the cast name, actual seconds left, and the real interrupt progress**, each computed from live combat fields. Two small bars show time elapsed in the windup and progress toward breaking that spell.

The warning remains inside the existing ribbon — it does not add new floating buttons, visual glyphs over the knight, a scrolling panel, or a new game mechanic. The countdown is updated by the existing `refreshHUD()` cadence (~160ms). If several specialists cast simultaneously, the indicator shows the total number of live casts. The highest-priority danger is shown: **Sapper fuse → Rift blink → Frost rite → Thorn ward**. Equal-priority casts select the one closest to completion (then the nearer enemy). Boss warnings keep the existing separate boss health/windup panel.

Interrupt progress uses the **actual combat formula** from `specialistCounterplay()`: 18% max HP damage during Sapper/Frost/Thorn casts and 22% max HP for Rift blinks. An interrupted, defeated or finished cast immediately disappears. There are no fabricated probabilities, assumed win rates or cosmetic fake countdowns. When the wave ends, the alert is hidden. Paused battles preserve their real remaining cast time.

Mobile UI uses the established compact text/wood-and-metal battle HUD palette, small fixed bars, no pulsing or flashing, and explicit colors alongside readable text. No custom image data is generated and no background layers, boss art or regional embroidered banners are modified. Reduced Motion needs no special treatment because the text and bars only change when real game state changes.

## Automated gate

Added `tests/specialist-alerts.js` to verify all four special enemies, true live countdowns and break thresholds, overlapping threat prioritization, interrupted casts disappearing, multiple-caster count, a real `specialistCounterplay()` interrupt, defeat/wave-end hiding, narrow-screen styles and no save or image allocations. Including JavaScript syntax validation, the release quality gate rises to **39 required checks** (38 gameplay test files plus syntax).

## Backward compatibility and unfinished QA

All original 30 territories with 10,000 waves each, 1,144 finite achievements, First Watch, equipment, research, Sigils, training, boss/skill balance, and the existing `primal_knight_onslaught_save_v1` save remain unchanged. The approximate 1,250-hour completion target remains a design goal, not a measured fact. This is **Alpha 0.12 Living Territories & Art, slice 15**; it does not override the locked Alpha 0.13–0.15 roadmap or claim physical iPhone visual / battery / heat acceptance. Those require on-device testing.
