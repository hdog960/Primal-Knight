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

## Verified pull-request CI results — November 7, 2026

**All 85 mandatory automated checks passed** on the playable PR head. The extended existing engine study ran **344 real original-game-engine sieges** (2 deterministic seeds × 2 paid policies × 86), with the same genuinely earned first-66-siege character within each seed, then original-priced mixed or Fortitude-first Training. The new independent 85th regression executed **four further genuine opening sieges** using real initial Essence expenditures, plus separate explicitly synthetic fixture checks for imported counter bounds and legacy display.

| Seed | Later paid Training | Projectiles launched | Landed | No-hit removed | Direct-hit HP removed | Last-line kills | Landed / launched | Genuine Tier XVI best cleared |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 15411 | Mixed | 133,586 | 102,318 | 29,944 | 43,276,187 | 2,948 | 76.59% | 18 |
| 15411 | Fortitude first | 135,843 | 104,419 | 30,119 | 44,003,110 | 3,070 | 76.87% | 18 |
| 15423 | Mixed | 134,268 | 102,239 | 30,651 | 46,156,614 | 2,890 | 76.15% | 19 |
| 15423 | Fortitude first | 135,407 | 103,423 | 30,621 | 46,323,617 | 2,973 | 76.38% | 19 |

These totals are **across the entire 86-sortie progression career**, not Tier XVI alone. Higher raw total damage and last-line kills in Fortitude-first cohorts occur alongside different fight lengths and health pools, and **do not show better offensive efficiency**. Both policies reached best Tier XVI waves 18/19 with no legitimately cleared wave 20 and no Tier XVII unlock. First Watch remains XI/16; Chapter XII remains 92/83 new distinct first clears away, despite time requirement met. Real wall-breach damage remains the failure pressure recorded by 0.15.15. A projectile not yet resolved at wave end is neither landed nor classed as removed.

In the separate four-siege early check, six actual purchased Might ranks cost **58 starting Essence**, while six Fortitude ranks cost **72**. Each of two seeds authentically cleared the first six waves in both policies. Might builds had **5 / 2 breaches** versus Fortitude **14 / 12**, and 6,176 / 6,233 versus 5,635 / 5,670 direct-hit HP removed. Because actual spending, run length and defeat events were not matched, this is only a concrete short opening comparison, **not a universal superiority claim**.

**Next:** genuinely purchased, seed-paired offensive versus balanced late-frontier policies should be evaluated with explicit actual Essence spent, per-wave kill/breach pressure and wave-20 unlock integrity. No speculative live damage, costs or gates change from this narrow telemetry study. The complete 750-minute Watch, 1,250-hour design target and physical iPhone acceptance remain unverified.

**Release discipline:** Green PR CI verifies this revision's gameplay head. After adding these measurements to documentation, require fresh complete 85/85 PR CI on the final documentation commit, then independently verify merged-main quality checks and finished Pages deployment before saying this release is live.
