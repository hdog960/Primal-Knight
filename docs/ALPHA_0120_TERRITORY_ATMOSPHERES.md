# Alpha 0.12.0 — Living Territories & Art, Slice 1: Weather & Light

## What ships in the real game
The same authored original illustrated battlefield and fortress foreground remain intact. A restrained, deterministic **territory atmosphere** now gives all 30 tiers their own named weather-and-light combinations. Examples: Verdant Dawn (early mist), Frost Moon (snow), Emberfall Dusk (warm embers), Stormscar Skies (rain), Astral Night (star glints), Thundergrave Storm (rain and cool lightning-season ambience), and Origin Eclipse (dim ethereal stars). Tier selection names each vista.

The atmospheric overlay is rendered **behind enemies, telegraphed boss attacks, health bars, shot trails and the original fortress foreground** so it does not obscure actual fighting or introduce mismatched art assets. Lighting uses a soft transparent tint and no global filters. Weather uses at most **18 tiny pixel rectangles + 1 static tint rectangle per canvas paint**; mist uses four translucent, low-contrast bands. There are no additional persistent particle objects, network resources, full-screen textures, heavy blur, unbounded allocations or animation-frame loops.

The scene progresses using `run.time` rather than wall-clock time; pausing a siege freezes atmospheric animation. The reduced-motion user preference disables all moving weather sprites but preserves the atmospheric tint. This is an **art/biome-identity slice**, not a new status ailment, buff, damage modifier or currency sink.

## Tier mapping
All 30 entries of `territoryVistas` correspond one-to-one with the existing `tierNames`, in locked order. Each has a unique named pairing and a weather/light family appropriate to the tier. The game provides a deterministic, safely clamped `territoryVista(tier)` for the Battle selector and canvas.

## Acceptance & what remains open
A required `tests/territory-atmosphere.js` gate checks 30 distinct identities, seven+ lighting variants and six+ weather variants, bounded rendering calls, stable identical-time output, actual movement at later unpaused battle times, low-motion static fallback, accurate Battle tier preview and the lack of progression mutations. All existing required regression checks remain.

This does **not** claim 30 independently painted battlefields, a completed comprehensive art overhaul, physical iPhone Safari/Home Screen review or unchanged in-device thermals. The broader Alpha 0.12 goals still require **tier-specific illustrated terrain and weather variants**, deeper themed boss/event flavor and actual iPhone art/performance acceptance. The original ~1,250-hour maxing objective remains a design target; saves and progression remain unchanged.

The earlier 0.11 Hero Combat Depth mobile acceptance is still outstanding. We are moving into an incremental atmospheric art slice without incorrectly claiming that past phase has passed physical-device review.
