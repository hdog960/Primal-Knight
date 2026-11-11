# Roadmap — PRIMAL KNIGHT

## CURRENT DEVELOPMENT CHECKPOINT — 2026-11-11 (First Watch combat animation)
Active milestone: Priority 0.2, original First Watch hero/enemy combat sprite and visual readability, NOT approved/complete. Starting main 6069a317 had successful final-head gameplay regression, quality checks and Pages deployment (verified via GitHub Actions REST). Implemented layered pixel-cloak silhouette on the live rear-view defender, shot-synchronized cape recoil, real heroChill color/weight response, and reduced-motion-safe sway in game.js (9b51f898). Extended existing mandatory mobile-render regression with four animation-state guards (dbb2e622). Production JavaScript and test script parsed in V8; local full Node execution unavailable because this container cannot resolve raw.githubusercontent.com. Final-head CI and Pages for dbb2e622 were queued at last check, NOT yet passed or published. No combat numbers, saves, unlocks or economy changed. Rendered iPhone landscape/portrait visual QA, especially Tier IV Battle lobby overlap, remains pending creator approval.

**Next exact coding step:** Check final-head gameplay/quality/Pages Actions and diagnose any completed red job first; then inspect actual iPhone-sized rendered First Watch hero pose and cape layering (including reduced motion and chilled hero) and correct visible defects; continue earned Tier XVI–XVII progression investigation with existing original-engine harness. Do not claim the visual gate passed without a screenshot and creator review.


## Completed in Alpha 0.1

Static-site foundation; rear-view illustrated siege scene; standalone enemy sprites; automated target selection/projectiles; wave spawning, damage and wave rewards; basic boss; permanent local save; four currencies/resources (Gold, Hero Essence, Knowledge, Skill Points); 16 hero training branches; 24 skill nodes; 9 rarity equipment progression and enhancement; 4 rune types with 12 tiers and socketing; 5 station lines with mechanical effects; research and suppression; touch menu structure; import/export save.

## Priority 0.2 — Visual standard (before adding breadth)

1. Break the scenic world into genuine **layered foreground / terrain / distant foliage / battlement** art (remove all static background monsters, hotbar imagery and conflicting illustrated mock UI).
2. Produce coherent, original, high-resolution pixel-art sprite sheets: hero front/back animations, enemy walk/hit/death frames, projectiles, stations.
3. Add true 2.5D perspective scaling, fog/ambient motion, reactive enemy attacks, richer death animations, and satisfying station firing sequences.
4. Polish mobile landscape HUD and improve accessibility and font sizes on narrow iPhone screens.
5. Run device QA before expanding content: no clipped panel, gameplay left/right letterboxing, battlement perspective and performance target.

## Priority 0.3 — Core game depth

Make the stage structure real, not only a label: distinct biome encounters, stage selection, minibosses, boss mechanics, enemy archetypes with AI, telegraphed special attacks, wave milestone rewards, and difficulty curves. Persistent class specialties, genuinely branching skill tree gates, gear affixes and meaningful item differences.

## Priority 0.4 — Long-term buildcraft

More station types incl. stun/laser/transmutation, animated visuals, rune recipes and bonus combos, weapon evolutions, item dismantling and crafting, economic building synergies, equipment sets, and advanced suppression research. Add bulk training purchase controls (×10 / ×100 / MAX) with safe previews.

## Priority 0.5 — Longevity & gameplay polish

Endless survival, milestones, achievements, mastery/ascension, advanced tiers, new locations, more monster families and bosses, balance calibration, late-game economy, stats/analytics (local only), music and SFX with user toggle, accessibility.

## Definition of ready for public playtest

Consistent hero/enemy art (not flat icons); layered battlefield without baked static mobs; at least three complete biome stages, six distinct boss behaviors, save migration and backup, stable mobile landscape orientation, repeated-run balance pass and visual review from an actual iPhone.
