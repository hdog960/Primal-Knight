# Alpha 0.12.23 — Allocation-light extended sieges

## Real game changes
This Living Territories 0.12 continuation optimizes existing combat loops that repeatedly allocate temporary JavaScript objects in multi-thousand-wave sessions. The exact gameplay effect is intentionally unchanged.

1. **Ritual shaman healing:** Rather than `filter().sort().slice(0,2)`, a stable, constant-space scan selects the same two eligible allies with the lowest health ratios. Ties preserve original order, healing stays at six percent of each ally's maximum health, and effects remain unchanged.
2. **Storm-chain arrow proc:** Rather than `filter().sort()[0]`, scan living secondary enemies once to choose the same nearest target with stable distance ties. It remains a genuine second hit, not a new ability or extra damage bonus.
3. **Specialist caps:** Replace two `filter` allocations per spawn with a single early-exit scan. Exactly the same two-of-one-specialist and three-active-caster caps still apply, including regional native vanguard reservations and previous worst-case protection.
4. **Projectile trails:** Every fired arrow / station projectile uses one 14-number `Float32Array` seven-point ring buffer allocated at shot creation. Every animation frame overwrites stored coordinates; no per-frame `[x,y]` array or `Array.shift` allocations. Oldest-trail endpoints, length and the 48-projectile cap remain the same. Rendering remains behind visual telegraphs and in front of the fortress as before.

## Acceptance and what remains
`tests/long-siege-allocation.js` runs the real game in a Node VM and independently reproduces old logic: 3,850 specialist choices, 240 randomized healing scenes, 350 nearest shock comparisons, 400 trail-frame moves and the existing 48-bullet cap. It also protects native vanguards and save state. All existing tests remain mandatory; **48 checks** including JS syntax.

No changes to player controls, XP, gold, Sigils, equipment, boss damage, Wave 1 tutorial, faction order, tiers, chapter rewards, finite milestones, or `primal_knight_onslaught_save_v1`. The ~1,250-hour completion time is a design goal, not measured.

This release reduces temporary allocation pressure by construction; its effect on physical iPhone battery, temperature, Safari FPS, rendering clarity and long-siege endurance has **not** been measured. Alpha 0.12 physical device acceptance and locked 0.13–0.15 roadmap remain outstanding.
