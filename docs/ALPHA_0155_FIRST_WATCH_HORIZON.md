# Alpha 0.15.5 — Three-Chapter First Watch Horizon & Extended Earned Cohorts

## Playable feature
The original First Watch banner shows the next chapter. The Battle lobby now additionally provides a collapsible **Three-Chapter Horizon** with three separate upcoming chapter thresholds derived entirely from the game's original 16 fixed First Watch rewards. It explicitly separates **real active combat minutes still required** from **new distinct wave victories still required**. A gate that is already met is marked as such; it does not imply that the other gate is met. Only the original unchanged `awardFirstWatch` grants rewards after both gates and earlier chapters are satisfied. Repeating old waves cannot count as unique new clears. There is no prediction of victory chance, automatic investment, backfilled time, offline income, forged chapter claims or new character-save field.

The layout matches existing fantasy charcoal/bronze and is collapsed by default rather than filling a small iPhone screen. Its disclosure summary is a minimum 44px touch target; all three cards form one mobile column at 610px width. The original First Watch banner is unchanged.

## Extended evidence
`tests/progression-economy-cohorts.js` runs 3 deterministic seeds × 2 paid strategies × **12 real successive Tier I sieges** (72 total, previously 42). Each run executes the actual combat engine to genuine defeat or progressively higher earned wave-clear ceilings (first seven attempts 35, then 50, 65 and 80 by attempt twelve), uses normally awarded currencies and XP, pays current permanent rank prices, checks one-time rewards/Sigils, and verifies saved character persistence. This is **not** 750 minutes of verified new first-clear pacing and not a measured human playthrough; a genuine Tier I cohort may encounter first-clear plateaus. Later attempts are allowed to advance farther; a ceiling is a documented test time limit, not a game progression lock.

`tests/first-watch-horizon.js` independently loads the game in a simulated DOM, checks true first three chapter gates, completes a **natural no-spend opening siege** until defeat, confirms legitimate First Blood award, and reloads the actual saved state. It separately tests mathematical time and wave boundary scenarios with **clearly synthetic fixtures**; those fixture minutes or chapter claims are not claimed as earned combat. No payoff projections or forced balance buffs are introduced in response to short-horizon deterministic spending strategy comparisons.

## Quality gate and next
**74 required checks including JS syntax**, with original tests preserved. Commit only on successful PR checks, then confirm merged-main checks and completed GitHub Pages deployment. The entire 750-minute First Watch and mid/late progression economy remain unverified. The 1,250-hour maximum progression target is a design aspiration, not an empirical finding. Manual iPhone visual, touch and endurance acceptance remains postponed to the end of locked Alpha 0.15 development at the player's request.

## CI-confirmed earned twelve-attempt results (not a synthetic clock)
The final green quality run on the corrected deeper-wave harness used seeds 15411, 15423 and 15437, for two real-priced purchase policies per seed. All later attempts were allowed as far as 50/65/80 wave clears, yet each ultimately **fell naturally** before those later limits; the wave records below are authentic results rather than harness stop points.

| Seed | Combat-first true best | Growth-first true best | Combat-first active minutes | Growth-first active minutes | First Watch chapters, both |
|---|---:|---:|---:|---:|---:|
| 15411 | 45 | 41 | 122.13 | 114.79 | 4 |
| 15423 | 46 | 42 | 118.55 | 113.28 | 4 |
| 15437 | 45 | 41 | 123.23 | 117.03 | 4 |

All six cohorts spent normal earned currencies, invested earned skill points, made twelve authentic run attempts and survived reload. The **fifth First Watch chapter** is scheduled at 35 active minutes **and 53 distinct wave victories** (ceil(35 × 1.5)). In these scripted Tier I-only trajectories, characters exceeded the time requirement but reached only 41–46 distinct waves. The remaining obstacle was genuine new clears, **not** the earlier artificial 35-wave test ceiling. The initial seven-attempt cohort comparison and fully earned baseline are preserved in the logs.

**Scope warning:** All twelve sieges took place in **Tier I**, even after the normal wave-20 unlock opened Tier II. An actual player can switch to new territories and earn more unique first clears; the Tier I-only stagnation must not be generalized to every player's First Watch. The next balance slice should study natural multi-tier progression and targeted recovery choices *before* changing chapter gates, combat damage, resource rates or reducing challenge. No one has completed a full real-time 750-minute / 1,250-hour playthrough in this test.
