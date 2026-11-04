# Alpha 0.11.6 — Earned First Watch + Rally After Defeat

## Why this was chosen
Alpha 0.11.4's nine-build matrix used hypothetical, directly assigned character profiles. This update adds a **real earned-budget baseline** before changing wave strength. All profiles start with the game's *actual* level-one starter save (520 Gold, 180 Essence, starting equipment and two starting runes) and run continuous combat from wave one. We purchase through actual live Training/Station actions, earn natural experience, Gold, Essence, milestones and loot, and spend only earned skill points. No testing code fabricates a level, item, currency, victory or milestone.

## Measured deterministic starting observations
The new `tests/earned-first-watch.js` exercises four illustrative beginner spending policies across three paired seeds (12 actual continuous sieges):

| Policy | Average waves cleared | Observed wave clears across three seeds | Starter Essence / Gold spent |
|---|---:|---|---|
| No upgrades | 5.0 | 5 / 5 / 5 | 0 / 0 |
| Might-first Training plus Ballista | 13.0 | 13 / 13 / 13 | 120 / 135 |
| Guardian-first Training plus Ballista | 7.7 | 8 / 8 / 7 | 131 / 135 |
| Mixed Quartermaster Training plus Ballista | 10.7 | 11 / 10 / 11 | 113 / 135 |

This is **not** a population win rate, a real player's unlock pacing, or a proof of balancing. In these automated single-run policies, characters did not spend *newly earned* Essence until the run ended; manual investment during a live siege can change results. All sample runs earned enough additional Essence to start buying more upgrades afterward. Starting difficulty therefore should not be broadly nerfed without testing realistic repeats and live upgrade choices.

## Actual player-facing changes
1. **First Watch Quartermaster**: During Tier I waves 1–20, recommend **Might** as the first permanent Training purchase. This is grounded in the observed sampled early offensive advantage. Other factions, later waves, training rank costs and the other two Training options remain unchanged. The recommendation is optional and never forces spending.
2. **Rally After Defeat**: Returning to the matching tier's Battle lobby after a *real defeat* displays a compact War Council rally card. It reads the existing in-session Siege Chronicle's actual reached wave, waves cleared, breaches and bosses escaped, and the *current* real Hero Essence balance.
3. **Optional one-tap recovery purchase**: Choose an affordable permanent Training rank (early wave ≤20 prioritizes Might; later severe wall pressure prioritizes Fortitude; otherwise Reflexes) using the **existing** Quartermaster Training purchase handler. The same cap, price calculation, active-siege restriction and original save key apply. A fully maxed or unaffordable choice is accurately labeled; no automatic purchases.
4. **Mobile presentation**: Gold-and-stone inset card with 44px tap target, compact portrait layout, 42px short-landscape option, and preserved Battle-lobby scroll. The rally hides for other tiers and when the previous run ended by retreat or victory.

## Unchanged and protected
No combat damage formulas, enemy HP/threat/speed curves, boss mechanics, wave counts, 30-tier progression, Training prices, permanent Sigil supply, First Watch rewards, inventory IDs, equipment, runes, or save schema have been changed. The original `primal_knight_onslaught_save_v1` persists, as do all historical migrations. The 1,250-hour target is still a design aspiration, not a measured playtime.

The required CI suite now includes `tests/earned-first-watch.js` alongside the previous sixteen scripts. It asserts real continuous waves and reward delivery, legitimate starting spending and currencies, preserved starter equipment, new session-sourced rally, and an actual click that purchases precisely one upgrade, persists that rank and preserves scroll position.

## Still to investigate
- Run an earned-budget **second- and third-attempt** test before declaring early Tier I wave-20 access balanced, including decisions to spend acquired Essence during live waves.
- Use *attainable cost-constrained* late-tier Oaths and Crest progression rather than maxed invented profiles.
- Physical iPhone Safari/Home Screen portrait, landscape, rendering and thermals remain unaccepted.
- Alpha 0.11 Hero Combat Depth remains open; retain the locked Alpha 0.12–0.15 roadmap.
