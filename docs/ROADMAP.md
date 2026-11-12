# Roadmap — PRIMAL KNIGHT

## CURRENT DEVELOPMENT CHECKPOINT — 2026-11-11 (First Watch shaman ritual and heal readability)
Active locked milestone: Priority 0.2 First Watch combat art / mobile visual acceptance, **not complete or creator-approved**. Starting main 160bca01 had green gameplay, full quality and Pages GitHub Actions (runs 43144877391, 43144877517, 43144877325). This session added a real-time shaman ritual preparation floor sigil during the final 1.2 seconds of the existing 6-second cast, plus a .38-second fade on only the allies actually healed by healShamanAllies. Added mobile-render regression guards. These are transient enemy object art timestamps, not protected save fields; no healing amounts, combat clocks, drops, progression, tiers or currency changed. Commits 5b808683 and a4f556e. Final-head CI and Pages must be checked independently; rendered iPhone acceptance remains open.

**Next exact coding step:** Check gameplay, full-quality and Pages Actions on the final checkpoint HEAD; repair any completed red workflow first. Capture actual iPhone-landscape frames for shaman countdown/healed ally effects, enemy marching, hero bow/cape, specialist warnings and Tier IV Battle lobby overlap; correct occlusion and readability. Continue genuinely earned Tier XVI–XVII progression analysis with the existing original-engine tests, preserving all chapter and wave gates. Do not claim mobile creator approval.


## CURRENT DEVELOPMENT CHECKPOINT — 2026-11-11 (First Watch marching footfalls)
Active locked goal: Priority 0.2 visual standard / First Watch combat and visual acceptance; **not accepted or complete**. Verified initial main 583010eb; its gameplay, full quality and Pages workflows were all green. Added render-only enemy boot-contact animation and bounded dust on planted non-caster footsteps in game.js (5b985788), plus four mobile-render regression guards (2c829ce0). Existing wobble drives light/heavy/caster cadence, and reduced-motion disables the new effect. No movement, damage, currency, reward, tier, wave or save-schema change intended. Final-head GitHub checks and deployment must be independently verified; no rendered iPhone or creator approval is claimed.

**Next exact coding step:** Inspect the final-head Actions for gameplay, full quality and Pages, fix any completed red job before further features. Then capture genuine landscape/portrait mobile rendering of marching feet, hero bow/cape, specialist warnings and station flashes; correct overlap or poor leg alignment. Investigate Tier XVI–XVII earned-progression bottlenecks using the original-engine test harness. Tier IV Battle lobby overlapping panels remains a blocking rendered-mobile acceptance item requiring creator approval.

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
