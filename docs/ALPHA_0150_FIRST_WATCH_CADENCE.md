# Alpha 0.15.0 — First Watch Opening Reward Cadence (Slice 1)

**Phase:** Progression & First Watch Balancing. **Release gate:** 69 automated checks including JavaScript syntax.

## Measured reason for a game-code change
The existing `tests/earned-first-watch.js` executes actual seeded combat with a new level-one character rather than manually granting stats or resources. Across seeds 11601, 11617 and 11633, the baseline **no-spend policy** survived five wave clears and fell at wave six around 2.52–2.58 **active** minutes. The first First Watch chapter required three minutes, so the player could die before receiving any of that chapter's earned onboarding rewards. The existing **Might First** strategy survived 13 clears, **Guardian First** 7–8, **Mixed Quartermaster** 10–11. These are bounded scripted novice strategies, **not human playtest averages or full 12.5-hour cohorts**.

## Actual production behavior
First Blood is rescheduled from minute 3 to minute **2**; unique-wave requirement consequently becomes `ceil(2×1.5)=3`, never free progress. Its real payouts remain **220 Gold / 45 Essence**. The other 15 chapters still end with the chapter at **750 real active minutes**, and their rewards, caps, gear IDs, runes, banner flags, Sigils and all other combat/upgrade formulas are unchanged.

The game now checks for the next unclaimed chapter's exact active-time threshold while the **live, unpaused siege** is ticking. If the unique-first-clear ledger already meets its threshold, the existing `awardFirstWatch()` delivers the chapter **during the current wave**, with an immediate verified save. If first clears are still missing, the existing `completeWave()` award check later grants it after a genuinely cleared new wave. There is no ticking in idle/background, no time acceleration at 2×, and no bonus chapter on repeat clears. A premature player death or retreat after the awarded threshold does not require an additional victorious wave to persist it.

## What testing means
`tests/first-watch-onboarding-cadence.js` executes real Tier I starter waves across three deterministic seeds without spending, checks first-reward arrival before first loss, persistence, one-time payouts, equipment/runes and no fabricated victories. Independent controlled test fixtures cover a delayed unique-clear gate and a later timed Sigil chapter; those fixtures are **not represented as earned real-world play**. It also checks the 16-chapter schedule, unique-clear requirements and original payout conservation. Existing 68 release checks must still pass.

## Continuation
This is a deliberately narrow first slice of the locked Alpha 0.15 phase. The next work will compare earned-upgrade costs and multiple opening 12.5-hour cohort policies, then mid/late economy, bottleneck and long-run pacing analysis. The 1,250-hour target remains **unmeasured** and should not be obtained by arbitrary idle timers. Physical iPhone visual, thermal and touch acceptance remains outstanding until Alpha 0.15 implementation is complete.
