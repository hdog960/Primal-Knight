# Alpha 0.15.18 — Optional Wallguard Targeting & Honest Tier XVI Trial

## Scope and intent
0.15.17's genuinely earned, paid late-frontier comparison showed **two initial saved Tier XVI careers**, each replayed into Might-only vs mixed original-cost upgrades, still stuck below Tier XVI's true wave-20 clear requirement. The new selected-territory Breach Response Ledger documented that direct damage and wall impacts vary even when attack interval is capped. This release tests **target selection** as a distinct tactical input, rather than inflating damage or weakening the enemies.

## Real in-game player choice
Before starting a siege, the Battle tier lobby now displays **Field Targeting — Siege Stance**, with two options:
- **Threat Sense (default):** The exact original `threatPriority` sort. Boss windups, specialist casts and other threatening enemies keep their established combat priorities.
- **Wallguard (opt-in):** Give an extra **205 threat-score points** to enemies that have reached the established real **y ≥ 365 near-wall watch area**, and an additional **40** at **y ≥ 405**, while preserving the original threat priority for enemies outside that band. This changes which targets *normal hero projectiles and station projectiles* are aimed at. It does **not** change automatic doctrine cast targeting, hero/station damage, enemy movement, spawn rate, enemy stats, upgrade prices or any chapter/tier reward gate.

Wallguard is **not promised to be superior**: it can deprioritize a distant Sapper, caster, or boss cast and does not provide a new damage multiplier, automatic aim buff, or extra weapon. The pre-siege selector has a simple touch-sized fantasy UI; the selection is stored only under a separate **device-local preference** `primal_knight_onslaught_focus_stance_v1`, not the existing version-3 character save. **Threat Sense remains the default** on unmodified existing installations, including when browser storage is denied. A selected stance is **snapshotted and locked** at `enterSiege`; mid-siege stance changes are rejected. The next lobby can choose again.

The Siege Chronicle and bounded, 24-entry Siege Archive preserve the actual stance and how many real hero/station shot-target decisions Wallguard **redirected away from the original top target**. These two optional fields are normalized independently; prior records display **no invented stance or redirect count**. Count a redirect only after an actual scheduled hero or functioning station attack, not on HUD rendering, comparison previews, or automatic doctrine casts. The Archive and latest-Siege report include the stance, and the original save key remains unchanged. No automatic purchases, account, paid tool, networking, server or external assets.

## Verification strategy
Continue all **86 previous required checks** and add the **87th** `tests/first-watch-wallguard.js`, covering:
- Stance normalization, legacy record distinction, imported-counter clamping and unchanged default threat order.
- A clearly labeled **synthetic target-order fixture** that includes a dangerous Sapper and a near-wall enemy, verifying Wallguard chooses the wall threat while the original priority logic remains intact; this does *not* claim earned progression.
- Disallowing mid-siege stance changes, battle-lobby controls, no new top-level character schema, device-local persistence, original finite capped enemies/shots, correct siege report & history, reload, and **four actual original-engine opening sieges** across two seeds/stances with genuine rewards, no fabricated wave records.

Expand the prior `tests/first-watch-siege-pressure.js` from **344 original earned siege careers + 80 paid offensive/mixed comparison sieges** by **80 further real-engine Tier XVI sieges**:
- Use the exact authentic, original schema siege-66 `SAVE` bytes for each of the two previously earned deterministic seeds.
- For each saved character, restore it identically and apply the original, paid mixed rank spending policy and the exact same fresh RNG seed. Only **Threat Sense** vs **Wallguard** differs at the starting decision.
- Play genuinely to defeat or bounded retreat, using original combat, loot, active time, one-time chapter/milestone and Sigil rules. The new selector is not a backdoor to Tier XVII and cannot fabricate First Watch Chapter XII.
- Record actual target redirects, real paid Essence, last-five sortie waves, breaches, near-wall kills, pressure, first clears, chapters, live Tier XVI records and potential Tier XVII eligibility. Real outcomes can change subsequent RNG and earned finances, even when seeded starts and initial saves match: **not a guaranteed causal or equal-spend comparison**.

Total regression suite: **87 mandatory checks**; *at least* **504 actual late-career engine-simulated sieges** in the expanded pressure test (344 original + 80 prior build-choice + 80 new stance-choice), plus four more stance-specific real opening sieges. Synthetic edge-case fixtures are expressly unearned.

## Required release discipline
1. All 87 full PR checks, actual results and saved-character invariants complete.
2. Add the real CI results and interpretations to this document and locked roadmap, then rerun all 87 checks on that final documented commit.
3. Merge only green final PR head, then confirm independent green merged-`main` CI and GitHub Pages deployment matching that precise merge commit.
4. Do not claim completed Tier XVI wave 20, Tier XVII, Watch Chapter XII, physical iPhone/thermal acceptance, 750 human-active minutes, or ~1,250-hour entire game progression unless actually verified.
5. Respect user's request not to manually playtest on iPhone until locked roadmap balancing is finished.

## Verified earned PR engineering results — November 7, 2026

**All 87 required checks passed on the playable PR candidate**, including the new runtime startup/save migration and four actual early opening sieges. The extended deterministic pressure regression executed its original **344 genuine career sieges**, its prior **80 original-cost Might-versus-mixed intervention sieges**, and **80 additional real original-engine targeting-stance sieges** (2 genuinely earned siege-66 checkpoints × 2 targeting stances × 20 honest attempts), without creating forged progression. Real in-game purchases, active battle time, one-time unique clears, milestone Sigils and legitimate tier unlocks were verified at every relevant step. The new opening test added 4 further genuine battles. Synthetic scoring fixtures are not counted as earned sieges.

For each seed, **Threat Sense and Wallguard began from the exact same earned primary-save bytes**, using the same newly seeded starting RNG and the same original-price mixed Training priority, with no injected resources or artificially selected locked territories.

| Seed | Stance | Original Essence actually spent after siege 66 | Unique first clears | Watch claimed | Best Tier XVI wave *cleared* | Recorded retargets | Actual breaches in 20 sieges | Effective wall HP lost | Near-wall kills |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 15411 | Threat Sense | 72,412 | 390 | 11/16 | 17 | 0 | 610 | 45,628 | 774 |
| 15411 | Wallguard | 72,412 | 391 | 11/16 | **18** | **141** | **604** | **45,215** | **810** |
| 15423 | Threat Sense | 71,845 | 400 | 11/16 | 19 | 0 | **612** | 47,064 | 810 |
| 15423 | Wallguard | 71,845 | 400 | 11/16 | 19 | **134** | 615 | **47,035** | **835** |

Both policy pairs happened to spend exactly the same Essence within their respective seed in this 20-attempt comparison. This is a **measured equality in these runs**, not a promise of equal lifetime spending in other seeds or play. Combat RNG and enemy survival diverge after targeting decisions; these are paired deterministic observations, not rigorous universal causal proofs. The values for direct-hit HP across the first pair were 13,064,088 (original) and 13,032,813 (Wallguard); second pair 14,588,793 (original) and 14,453,197 (Wallguard), again reflecting actual non-identical fight duration and enemy outcomes, not an all-source DPS ranking.

**Interpretation:** Wallguard caused genuinely different actual attack-target choices and a modest improvement in *some* late encounters. It raised earned Tier XVI best from 17 to 18 and one-time first clears by 1 in seed 15411, reduced near-wall pressure by 6 breaches and 413 effective wall HP, and added 36 kills near the wall. In seed 15423 it gained 25 extra near-wall kills and 29 fewer wall HP lost but **three more breaches**, with no wave-best improvement. We therefore retain default Threat Sense and treat Wallguard as a risk-reward option, not a universally better upgrade. Neither stance cleared Tier XVI wave 20; **Tier XVII did not unlock** and First Watch **remains 11/16**. No model of endgame 1,250-hour pace or full 750-minute human First Watch has been validated. Hardware iPhone visuals, touch/thermal and long-session performance remain explicitly deferred by player request.

The four short genuine Tier I opening battles also passed (two seeds, both stances). Both stances had identical outcomes within each opening seed, and **zero retargets** because the new near-wall/specialist-target conflict did not arise in those few waves. This is expected and confirms the opt-in behavior is situational rather than a hidden permanent statistical buff.

**Release gates still remaining after recording evidence:** The green 87-check PR source head predates these documentation updates. Rerun the **complete 87-test suite on the final documented PR head**, only then merge. Independently verify green 87-check merged-main CI and a successful GitHub Pages deployment of the **same merge commit** before declaring Alpha 0.15.18 publicly live.
