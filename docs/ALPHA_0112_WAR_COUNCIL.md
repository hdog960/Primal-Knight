# Alpha 0.11.2 — Hero Combat Depth, Slice 3: Faction-Aware War Council

## What changed

The pre-siege tier lobby now includes a compact **WAR COUNCIL** briefing immediately above the three existing saved-loadout cards. It uses the *actual* `encounterDirector(wave,tier)`, tier selection and unlocked waystone to identify the chapter faction, its threats and the next relevant encounter. It never fabricates currently available units or assumes a tier has fixed enemies.

At wave 1–7, the guidance recognizes the actual introductory goblin/skeleton/warg roster (regardless of the scheduled chapter faction). Every 100-wave chapter genuinely rotates among the existing ten factions. At the start of a wave-25 Siege Commander or wave-100/200/300 century warlord, boss-specific interruption strategy takes precedence over generic chapter advice.

## All ten grounded strategies

| Faction | Core battle threat | Favored unlocked response |
|---|---|---|
| Mirebound Swarm | Warg/raider flanks | Aegis Pulse + Rampart Oath |
| Ironbound Host | Shield guards shelter infantry | Arcane Chain + Storm Conductor |
| Ashen Covenant | Rear-line healing shamans | Hunter's Volley + Predator's Eye |
| Nightpack Raiders | Fast raider/warg rushes | Aegis Pulse + Rampart Oath |
| Crownless Legion | Mixed shields and ritualists | Arcane Chain + Storm Conductor |
| Frostvein Conclave | Interruptible frost rites | Hunter's Volley + Predator's Eye |
| Cinder Siegecraft | Interruptible Sapper explosions | Hunter's Volley + Predator's Eye |
| Gilded Remnant | Bannerets and shamans | Hunter's Volley + Predator's Eye |
| Thornwake Circle | Interruptible Thorn Ward casters | Hunter's Volley + Predator's Eye |
| Riftborne Court | Interruptible forward blinks | Hunter's Volley + Predator's Eye |

These are **advisory tactical matchups**, not measured optimal builds or simulated win probabilities. All three live disciplines and all three mutually exclusive passives remain viable choices, and the player's equipment, hero rank and wave pressure can change the outcome.

## A real, actionable preparation interface

- The War Council calculates a recommendation **from only the doctrines and passives already unlocked for this hero**. Level-1 characters receive a free starter recommendation rather than being pushed toward inaccessible skills. At levels 3 and 5, options expand normally.
- **EQUIP SUGGESTED PAIR** changes only the active doctrine and passive. It never changes owned items, gear, sockets, saved presets, tier history or currencies. It refuses any change during active fighting/intermission and displays **PAIR EQUIPPED** if already matched.
- The brief shows a categorical tactical concern, a concrete counterplay note, and the next actual notable event and wave in a bounded 100-wave forecast.
- It suggests an existing **Storm, Ember or Frost rune** only when that rune type has a real combat purpose for the proposed approach. The status says **SOCKETED AND READY**, **OWNED · EQUIP IN RUNE WORKSHOP**, or **NOT OWNED · OPTIONAL** based on actual saved owned/socketed rune IDs. The panel never awards, creates, sockets or spends a rune.
- The three saved Scout, Tempest and Bastion presets now display their **TACTICAL MATCH x/9** against the selected faction when actually available. The match is a simple transparent expert-rule score: 1–4 points for the active doctrine, 1–4 for the passive and at most one for a relevant *already socketed, owned* rune. It is **not** an expected win rate or an absolute damage score. An unavailable preset retains its clear reason (missing equipment/rune, level lock or active siege).
- The iPhone War Council appears before Quick Preparation inside the already-scrollable Battle lobby and uses the game's existing painted fantasy/stone trim. The actionable button is at least 44px tall in portrait and 42px in short landscape. Scroll position is preserved after selecting a build or switching wave modes.

## Compatibility and balance boundaries

- The existing `primal_knight_onslaught_save_v1` key, equipment and rune ownership, 200/240 inventory caps, four schools of talents, existing 3 loadout slots and all 30 tiers × 10,000 waves are unchanged.
- **No new saved fields and no changes to actual combat damage, cooldowns, loot, waves or income.** This slice teaches and compares the combat choices from 0.11.0–0.11.1 rather than quietly adding power or monetization.
- The first 12.5-hour First Watch incentive ladder and the 1,250-hour maximum-progression design goal are unaffected.

## Required QA

A thirteenth script, `node tests/war-council.js`, is required in GitHub Actions alongside the twelve existing suites. It uses the real game in a deterministic browser-like harness to verify:
- Actual tier-to-faction mapping for all ten factions, distinct recommendations across all three classes and level-1/3/5 gating.
- Faction chapter rotation after wave 100, current commander at 25 and Iron/Ember/Void boss counterplay at 100/200/300.
- Wave 10,000 final boss forecast and a broad set of Tier I–XXX / early-to-late wave combinations.
- Accurate owned vs socketed rune recognition, no phantom bonuses, and matchup scores.
- Real Battle lobby markup and a one-tap click that applies the recommended doctrine/passive **without touching equipment, currencies, runes, presets or permanent progress**.
- Correct waystone/fresh-start changes, scrolling, refusal during a siege and save key compatibility.

## Next locked work

The remaining Alpha 0.11 goal is a practical balance comparison of multiple viable builds across real faction/commander/boss encounters, with refinements where abilities dominate or become useless. Physical iPhone Safari and Home Screen testing remains an open acceptance task inherited from Alpha 0.10; automated DOM/combat tests do not replace a device playtest.
