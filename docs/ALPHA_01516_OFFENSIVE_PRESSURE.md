# Alpha 0.15.16 — Offensive Tempo & Last-Line Pressure Audit

## Why this slice exists
The 0.15.15 earned frontier study reached Tier XVI best cleared waves 18 and 19, but no wave-20 completion or Tier XVII unlock. The defensive Fortitude-first policy increased fortress max HP without improving that threshold. Observed effective wall damage came from enemies reaching the wall rather than completed Sapper fuses in those particular deterministic cohorts. That does not prove a universal optimal strategy, and it does not warrant changing enemy HP, rank cost, tiers or First Watch requirements on its own.

## Actual playable feature
The **existing Siege Chronicle** and its saved, 24-entry **Siege Archive** now track the following during genuine original-engine combat:
- **Projectiles fired:** real accepted calls to `shoot` (hero arrow, automatic projectile abilities, ballista or lightning stations), not a hypothetical attack-speed rate.
- **Projectiles landed:** these projectile objects reached a living enemy and executed `hurt`.
- **Projectiles lost:** fired projectiles removed because their target had already died or because they timed out. A projectile still in flight when a wave ends is not falsely classified as lost: fired can exceed landed plus lost.
- **Direct-hit HP removed:** actual positive enemy HP removed by `hurt` after existing armor, shields, wards, crits and other original modifiers, capped to the target's remaining positive HP so overkill does not inflate the figure. Includes direct arcane combat hits and station impacts; intentionally excludes damage-over-time burn ticks. This is **not all-source DPS**.
- **Last-line kills:** genuinely defeated enemies with the actual in-scene depth `y >= 365` (within the previous breach-watch zone). The real wall breach threshold remains `y > 430`.
- **Simulated fighting seconds:** accumulated only while the original fighting tick advances, multiplied by selected combat speed; separate from real active First Watch seconds and not a claim about human session duration.

Reports render these concrete counters after a sortie. The archive uses a new `offenseTracked` flag so pre-0.15.16 records are never misrepresented as zero offensive output. The existing `wallPressureTracked` metrics, 24-history bound, guard/recovery files and character save key remain intact. No new top-level character save fields, auto-purchases, unlocks, enemies, prices, new art, network calls or dependencies. Imported counters are nonnegative safe integers, projectile outcomes cannot exceed launched count, and last-line kills cannot exceed defeats.

## Verification and quality gate
The **85th mandatory release check** is `tests/first-watch-offensive-pressure.js`. It tests legacy history distinction, malicious-field normalization, real direct projectile delivery and HP clipping, real saved archive and readable interface, old save key reload, normal original-price Training purchases from earned starting Essence, bounded original actor/projectile caps, and two seeds with Might versus Fortitude opening cohorts (four authentic engine-executed opening sieges). These are intentionally small opening probes and not a Tier XVI causal comparison.

The existing 84th test, `tests/first-watch-siege-pressure.js`, now also accounts for all six new counters across its **344 genuinely engine-executed original frontier sieges**, including two seeds, paired identical earned pre-67 careers, then mixed versus Fortitude-first paid rank priorities. This exposes direct hit output, projectiles and last-line defeats alongside measured wall pressure for the late bottleneck without altering any original gameplay. Neither cohort policy is guaranteed identical battle outcomes or actual paid spending over its lifetime.

## Pending, not silently accepted
- The full 85-check PR suite must pass on the final branch head, then again on merged `main`, followed by GitHub Pages deployment of the exact merged SHA.
- Genuine complete Tier XVI wave 20 and Tier XVII unlock remain **unverified** unless the engine actually awards them. Continue investigating offensive attack-speed/targeting combinations and breakthrough choices rather than weakening the gate.
- Chapter XII (322 active minutes **and** 483 distinct first-cleared waves) and Chapters XIII–XVI are still subject to their original real reward gates. A forced test fixture does not count as earned success.
- The full 750 active-minute First Watch, 30×10,000-wave lifetime economy, roughly 1,250-hour completion target and physical iPhone art/touch/thermal acceptance remain unverified.
- The player explicitly postponed manual iPhone acceptance until the locked roadmap's development/balance work is finished. Do not ask the player to test now.

## Earned CI results
Pending final complete green CI. Record actual observation data here after the test succeeds, without claiming equal-lifetime spend or a universal best build.
