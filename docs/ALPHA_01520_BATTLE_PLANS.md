# Alpha 0.15.20 — Earned Combat Battle Plans & Tier XVI Defensive Intervention

## Why this slice advances the existing roadmap
The genuinely earned 0.15.19 study showed sequential attrition over Tier XVI waves 17–20, not a broken milestone switch: of 80 actual late-career automated sieges, 58 completed wave 17, 22 completed wave 18, three completed wave 19, and **none completed wave 20**. No artificial Tier XVII unlock or First Watch XII claim was made. Rather than add a free damage bonus, 0.15.20 uses the already implemented, level-gated signature doctrines, passive talents, tactical cast schedules and opt-in target order in coherent combinations. The game now offers an actual, cost-free **one-tap prebattle Battle Plans panel**, not another report or a speculative promised fix.

## Three real playable strategies
The Battle lobby's collapsible **Battle Plans — Ready the Fortress** menu presents:
- **Arrowstorm Advance** (existing Hero level 1): Hunter's Volley (Vanguard), Predator's Eye, **Rapid** automatic casts, **Wallguard** projectile targeting. Offensive specialization; does not magically provide wall healing.
- **Bastion Hold** (earned Hero level 5): Aegis Pulse, Rampart Oath, **Crisis** automatic casts, Wallguard targeting. Gives up offensive magic for existing fortress healing, attacker pushback and existing passive wall-impact protection.
- **Tempest Screen** (earned Hero level 3): Arcane Chain, Storm Conductor, **Horde** timing, original **Threat Sense** targeting. Controls approach using genuine existing slow and specialist attack rules.

These are *recipes for unlocked ability selections*: no extra skills, gear, stations, Training, Sigils, currencies, leveling or combat multipliers. The first two plans share Wallguard but have radically different existing offensive/defensive doctrine/passive choices. A player's original default settings are never changed until an explicit plan selection. All abilities must **already be unlocked through real character level progression**, and plan selection is rejected during active combat/intermissions. Existing individual menus still work and may diverge from a named plan. The menu marks only a true four-way match as *current setup*, not an invented persistent plan ID.

Character choices use the **original save key and original schema fields** `combatDoctrine`, `combatPassive`, `doctrineTactic`; projectile targeting remains the existing device-local `primal_knight_onslaught_focus_stance_v1` preference. No new character schema, server sync, account, dependency, paid provider or resource is introduced. The existing save-integrity preflight protects against multiple iPhone tabs and corrupted/future saves. A failed save attempts to restore the previous in-memory choices and device preference. Touch buttons have generous minimum size, readable fantasy styling, disabled locked states and the panel remains expanded after selection.

## 89th mandatory QA and real-earned defensive test
`tests/first-watch-battle-plans.js` performs original-character startup checks, locked-level protection, no-cost choice, real saved-character/device preference reload, original actor/projectile budgets, two seeded **genuinely paid Might opening careers** to earn Hero level 5 legitimately, real Bastion/Hero Guardian play after unlock, and Tempest switch and reload. It verifies that choosing plans cannot award XP, first clears, currencies, Sigils or First Watch chapters and that active sieges reject switches. Synthetic UI tests do not count as earned success.

The full previous **88 regression checks remain required**, and the new test is the **89th**. Extend the previous original-engine 504 late-career siege simulations (344 original progression + 80 mixed-vs-Might + 80 Threat Sense-vs-Wallguard) with **80 additional genuine Tier XVI trials**: replay the exact originally earned post-siege-66 primary-save character bytes for seeds 15411 and 15423, select Arrowstorm Advance or Bastion Hold only when the character has genuinely unlocked the required doctrine/passive, use the same new deterministic starting RNG seed, retain the same original-cost mixed Training spending policy and run 20 original-engine attempts each. Log the genuinely earned first clears, active time, finite Sigils, Tier XVI **best cleared**, Tier XVII lawful unlock status, true Essence actually spent, per-wave 16–20 outcome counts, breaches, effective wall HP loss, targeted near-wall defeats, doctrine casts and direct-hit output.

The same initial saved character and starting RNG do **not** guarantee identical later combat event streams or equal post-selection spend. The study may show a defensive tactical option helps some waves, or that it does not. Never describe its outcomes as a universal causal guarantee, replace wave-20 completion with wave-20 arrival, or silently soften enemy HP, attacks, fortress damage or the Chapter XII 483 distinct-wave gate.

## Release and acceptance criteria
1. The 89-check final PR head must pass **all** existing save-integrity, opening economy, gameplay, environment and artwork regressions as well as the new real battle-plan test.
2. Record real late-game results in this document and locked roadmap. Re-run the full 89-check suite on the exact final evidence-bearing commit.
3. Merge the green final head and independently confirm **merged-main 89/89 green** and successful GitHub Pages deployment of that *same commit*, before declaring the iPhone release complete.
4. The locked 30×10,000-wave roadmap, roughly 1,250-active-hour full-game target, 16 First Watch chapters and physical iPhone visual/touch/thermal acceptance remain open; manual device review is explicitly deferred by player request.

## Observed CI outcomes
Pending genuine engine results and complete PR checks. Do not invent a Tier XVII unlock or Chapter XII claim.
