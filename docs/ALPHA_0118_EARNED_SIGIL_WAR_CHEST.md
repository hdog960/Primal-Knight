# Alpha 0.11.8 — Sovereign War Chest & Milestone-Budget Combat Study

## Scope and player-facing delivery

Adds a collapsible **Sovereign War Chest** to the Battle → War Council preparation screen (where an existing saved character has unlocked Sigil progression). It complements the Power → Training ledger rather than duplicating its whole interface.

The Chest displays (1) **held, spendable Sigils** from the actual save; (2) three prioritized, genuinely unlocked and not-yet-maxed permanent Legacy, Ascension or Sovereign Oath upgrades with current rank, rank cap and the same *exact next-rank cost* used by Power → Training; (3) the next not-yet-claimed one-time Sigil milestone in the selected tier from the real milestone table. Tactical ordering uses the next enemy faction or boss pressure as a transparent heuristic, **not a predicted battle outcome**.

Touching BUY +1 spends exactly one rank through the existing permanent-power purchase action. Locked, unaffordable, invalid, maxed, and mid-siege purchases cannot succeed. The purchase persists using the existing `primal_knight_onslaught_save_v1` key and does not touch gear, runes or First Watch claims. The long Battle panel retains scroll and an open Chest through a purchase. Mobile controls have at least 44px minimum tap height (42px only on short landscape).

## The 162-case gated Sigil study

`tests/sigil-gated-combat.js` uses three *hypothetical progression checkpoints*:

| Hypothetical frontier | Encounter under test | Milestone-funded Sigils available | Earlier Dominion Crest seals |
|---|---|---:|---:|
| Entry to Dominion | Tier XVII, wave 100 | 432 | 0 |
| Mid Dominion with one revisit to each earlier Dominion tier's wave 250 | Tier XXIV, wave 150 | 5,322 | 7 |
| Tier XXX frontier, earlier Dominion tiers revisited to wave 250 | Tier XXX, wave 250 | 10,844 | 13 |

These figures come **only from original one-time milestones**. The test walks actual tier-unlock gates (Tier I–XVI wave 20, XVII–XX wave 100, XXI–XXIV wave 150, XXV–XXIX wave 250), calls the same real `rewardMilestone` function for each **assumed victory**, then purchases Legacy/Ascension/Oath ranks via the exact live purchase action. Every purchase is checked against Sigils actually granted. There are no instant maxed masteries or invented Sigil balances.

Three allocation policies (attack, fortress, mixed), all nine active/passive pairs, and two seeds across three frontiers = **162 real-combat slices**. Each combat slice has an independent, identically generated milestone-and-investment career.

Initial green CI findings: **all 162 slices cleared their target wave**. This does **NOT** prove the player can really reach those checkpoints or that the late meta is balanced. Critically, character level, training, research, station ranks and equipment were **still synthetic hypothetical non-Sigil investments** and were not purchased with earned non-Sigil currencies. In this fixture these assumptions appear very powerful. Never present these clears as verified achievable or player win rates; do not nerf endgame enemies or buff the hero based solely on them.

## QA and invariants

The existing 19 mandatory scripts remain. New:
- `tests/war-chest.js`: genuine Battle click, one-tap real cost, original save persistence, exact deducted Sigils, safe invalid/locked/capped/active-siege refusal, equipment and rune integrity and iPhone touch layout.
- `tests/sigil-gated-combat.js`: 162 actual combat scenes, genuine fixed milestone wealth, authentically purchased Sigil ranks and earned Crest seals, original enemy/projectile limits and progress-preserving wave rewards.

This work does **not** change hit damage, equipment values, the milestone reward amounts, 30 tiers × 10,000 waves, enemy patterns, starting resources, stored save schema, economy formulas, or the ~1,250-hour *design target*.

## Next step

Constrain **non-Sigil** investments (equipment +50 upgrades, training 1,200 ranks and stations) with actual Gold, Essence and Knowledge earned from plausible sessions. Further separate an attainable frontier from a post-10,000-wave mastery character. Check actual iPhone Safari/Home Screen art, portrait/landscape readability, performance and battle HUD on a real device before declaring Hero Combat Depth fully accepted. The locked 0.12–0.15 roadmap remains unchanged.
