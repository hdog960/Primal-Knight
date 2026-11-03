# Alpha 0.10.14 — Living Onslaught, Slice 15: Honest Boss Defeats & Fair Ward Focus

## Findings from the Siege Chronicle audit

The Alpha 0.10.13 Siege Chronicle exposed a distinction the game previously missed: **clearing a chapter boss or Siege Commander wave is not the same thing as defeating that boss**. If the major boss reached the wall, the fortress might survive the damage and the wave could still clear. The Chronicle incorrectly reported a **boss victory**, despite that enemy never being killed. This obscured the balance and counterplay data needed to assess the final Living Onslaught phase.

We also confirmed that the existing automatic hero targeting favored almost any soldier close to the fortress over the **Iron Tyrant's short, 2.2-second Iron Ward counter window**, even when the boss ward was visibly active. A player could see instructions to break the ward but receive too little automatic focus-fire for that mechanic to be meaningful.

## Implemented changes

- **Actual boss kills are required for credit.** The live enemy death function records when an actual `isBoss` enemy is defeated. On a chapter boss / Siege Commander wave, the Chronicle increases `BOSSES DEFEATED` only if that boss was truly killed. Wave survival and all original victory rewards remain unchanged: allowing a boss to breach the wall is still possible when the fortress survives, but it does not become an invented boss kill.
- **Major boss breaches are visible.** A major boss crossing the wall triggers a distinct warning and increments the session-only `BOSSES BREACHED` statistic, separate from `TOTAL BREACHES` and `BOSSES DEFEATED`. The six-stat Chronicle becomes a compact seven-stat Chronicle in an expanded portrait-friendly grid.
- **Iron Ward receives fair automatic targeting.** A warlord actively maintaining Iron Ward gains a bounded urgency bonus in the existing threat calculation. This lets the auto-hero focus the 2.2-second ward break window, while particularly dangerous Sapper countdowns close to the wall can still outrank the boss.
- **Real damage-to-interrupt progress:** The existing boss ability timeline now displays `BREAK 0–100%` alongside its *actual remaining windup time*. The percentage uses the existing after-mitigation damage accumulated in the live boss counterplay system: **10% of max HP** for Iron Ward and **9%** for Ember Charge, Void Step, and the Siege Beast Crusher. Nothing in this display causes extra damage or extends the original counter windows.
- **Field Manual:** The expandable in-game tactical manual explains that Iron Ward is a priority target, the meter reflects actual dealt damage, and the post-siege Chronicle distinguishes defeated from escaped bosses.

## Protected gameplay contracts

- All original boss damage, ability timing, thresholds, +12% exposed damage, elite composition, wave gates, reward drops, nonfarmable Sigils and Tier I–XXX × 10,000-wave structure remain unchanged.
- No new permanent save key or fields. `bossesKilledThisWave`, `bossEscapes`, and the other Chronicle counters live only inside a currently running siege and reset on new runs.
- A boss escape is not counted as a kill and does not mint new rewards, but the existing wave-clear reward remains awarded if the fortress survived and the wave is cleared.
- The established iPhone artwork, touch controls, low refresh handling and reduced-motion support remain unchanged.

## Automated QA

Added a **tenth required script** `tests/boss-fairness.js` to the GitHub Actions quality gate alongside the nine previous suites. It uses the actual game VM to exercise:
- Automatic targeting of an active Iron Ward, and priority of a Sapper near the wall over the ward.
- Exact boss interrupt progress percentages for Iron Ward, Ember Charge, Void Step and the Crusher; hiding the meter after the actual counter succeeds.
- A major boss that crosses the fortress wall: real breach damage and telemetry, wave clear but **zero boss kills** in the Chronicle.
- A real scheduled Siege Beast / Iron Tyrant / Cinder Regent / Void Monarch defeated by live damage on waves 25/100/200/300, each credited exactly once.
- Reset of per-wave and per-run counters, accurate expanded Chronicle labels, unchanged permanent save structure and iPhone responsive layout.

The previous Siege Chronicle test also now **actually kills** its synthetic chapter and final-wave bosses before expecting those victories, instead of pretending that reaching a boss wave is equivalent to winning the fight.

## Still open

This is better instrumented and fairer automatic counterplay, **not a replacement for physical iPhone Safari / Home Screen testing**. Long-wave playfeel, wall balance and user acceptance still matter. The ~1,250-hour max-progression target remains an unverified design estimate. The locked Alpha 0.11–0.15 plan is unchanged.
