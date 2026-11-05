# Alpha 0.12.20 — Low-Allocation Siege Rendering and Targeting

## Real playable performance work

The Alpha 0.12 art and depth rendering now run in the actual iPhone browser, but the prior 60Hz canvas code created multiple short-lived arrays on every paint:

- `[...run.enemies].filter(...).sort(...)` for depth drawing, including an array copied and filtered every frame.
- `run.enemies.filter(...).sort(...)` for every auto-attack decision and again for fortress-station targeting.
- A fallback `[s.x-7,s.y+6]` array every frame for a shot whose trail was still empty.

This release replaces those temporary sprite and targeting collections with **two independent, reusable scratch arrays**. One is reserved for the original back-to-front enemy painter and the other for live automatic attack target priorities. Both are sorted with the *same* original comparators, retain stable tie behavior, and never sort or reorder the actual `run.enemies` simulation array. The combat target scratch is reused across bow and fortress stations, and both buffers are emptied after each full update/draw to avoid retaining enemies from abandoned sieges. The shot-trail fallback now uses scalar x/y coordinates instead of a throwaway pair array.

The change does **not** reduce the artwork resolution, remove enemies, weaken telegraphs, alter the attack rate, or insert extra frame-skips. It respects the existing Vivid/Balanced/Battery Saver painting limits, Reduced Motion, all boss/weather assets and the view-only World Atlas. All actual combat math, priority values, waves, rewards, health, gear, milestones and 30×10,000-wave progression remain unchanged.

## Required regression coverage

New `tests/low-allocation-combat.js` executes the real game controller and canvas drawing in a Node VM. It checks:

- 500 iterations reuse the same enemy-painter and target sorter arrays, without sorting the actual simulation array;
- identical y-depth and stable equal-depth ties compared with the original draw approach;
- original target threat ordering, including a live Fuse Sapper prioritized during real combat;
- 40 real draws paint the same enemy sprites in the original order, with the same cached background gradient;
- enemy references are cleared after paints and combat target selection;
- no character save or persistent progression changes.

Existing 44 required regressions remain intact; this release increases the CI gate to **45 checks** (44 gameplay/visual test scripts plus JavaScript syntax validation).

## Honest measurement limits

Reusing arrays reduces the number of short-lived JS allocations in these hot paths. It is **not proof of a specific iPhone frame-rate improvement, reduced battery consumption, lower thermal load or a measured duration improvement**. Such claims require physical iPhone Safari and Home Screen benchmarking using the existing opt-in Device Check and actual long-running sieges. Alpha 0.12 remains open until art, banners, touch/Share Sheet, and prolonged-device acceptance are reviewed. The locked Alpha 0.13–0.15 roadmap is unchanged. Original save key `primal_knight_onslaught_save_v1` remains compatible.
