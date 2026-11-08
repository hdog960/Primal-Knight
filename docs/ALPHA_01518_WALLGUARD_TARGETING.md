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

## Measured CI outcomes
Pending complete PR verification. Fill from actual GitHub Action output; do not invent results.
