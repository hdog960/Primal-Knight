# Alpha 0.15.26 — Veteran Watch Route Compass

## Motivation
The prior original-engine earned Tier XVII career stagnated near wave 24, while eight genuine earlier-territory Record Stretch sieges raised unique first clears from 423 to 474. In 0.15.25 Veteran Watch started displaying the last three actual archived first-clear yields per unlocked tier. Players need the ability to choose what matters: minimal travel through previously beaten waves or actual historical yield. Neither is an exact probability of future success.

## Actual gameplay improvement
Add a two-option, iPhone-touch-sized route-order selector on the existing Veteran Watch / Record Stretch panel: **SHORTEST REPLAY** (default, identical to Alpha 0.15.25) and **RECORDED FIRST CLEARS**. The latter ranks all legitimately unlocked incomplete territories by descending sum of genuinely earned first clears in up to three actual archived sorties, then count of actual recent sorties, then smallest already-cleared-wave replay count and stable tier order. It is historical evidence, not a win-rate predictor, and a 24-record rolling archive can forget older outcomes. The active choice remains ephemeral in-memory UI and NEVER appears as an added character save field. Invalid option IDs are rejected. Restoring the Battle lobby keeps the scroll position. No rewards, level-up, fake victories, battle buffs, costs, automatic sieges or altered gate rules.

## Deeper original-price career
Extend the deterministic seed-15423 earned backtracking character by eight more original-engine siege attempts (now 24 consecutive genuine backtracking sorties after 86 original progression sieges). Continue with actual earned Essence purchase costs, original per-tier best and finite Sigil verification, and full real chapter awards. Report Chapter XII or XIII progress only if the unchanged game rules actually award it. This is not independent user data and doesn't verify the final 16-chapter Watch, 30×10,000-wave completion or 1,250-hour pacing.

## Release gates
The 95th mandatory regression (tests/first-watch-route-compass.js) verifies controls, sort order, archived records, locked tiers, no history, invalid input, no changed saved character and responsive touch UI. Preserve all previous 94 game tests and report real earned career result. Require green final PR, independently green merged-main 95-check CI, successful matching Pages deploy. Manual physical iPhone approval is deferred as requested.
