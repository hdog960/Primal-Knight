# Alpha 0.15.24 — Record Stretch

The previous release demonstrated that a genuine seed-15423 original-price character reached Tier XVII wave 24 after 106 earned sieges but still needed 58 more distinct first clears for First Watch Chapter XII. Additional blanket enemy weakening would not by itself address the need to explore 17 separate available territories.

## Player-facing improvement
Improve the existing Veteran Watch Record Stretch inside Battle. Evaluate every previously unlocked unfinished territory, not just the four numerically highest. Derive the starting wave from original earned milestone waystones using `nearestEarnedWaystone(tier,record+1)`. Display how many **already completed** waves must be replayed before a first new win is available, plus an optional ten-wave stretch target. Sort by replay distance (ascending), then lower tier ID as a stable tie-breaker. This is replay distance **not difficulty, speed, or probability of a successful win**; an untried territory naturally has zero recorded waves to replay. No new saved character fields, refunded replay rewards, victory tokens, tier unlocks or changes to battle balance.

## Real-engine experiment
A new alternate original-price **eight-siege backtracking career** is forked from the exact saved seed-15423 original 86-siege Arrowstorm character used to establish Tier XVII eligibility. The same separate Wallguard preference is restored. Each sortie buys only affordably priced original Training, chooses one of four legitimate unlocked records from the new route list, fights original engine enemies and tallies first clears solely from original `p.bestByTier`, with saved-character reload, finite Sigils and time conservation assertions. Compare its evidence descriptively with the recorded twenty-siege Tier XVII push only; route differences and purchases prevent equating the durations or win rates.

## Release gates
93 mandatory regression scripts: retain the prior 92 original-engine checks, add a focused synthetic route/waystone security check, and extend the long genuine career by eight real backtracking sorties. Require a clean final branch PR QA, green merged main for that SHA and successful exact-SHA GitHub Pages deployment. Manual iPhone acceptance remains deferred to the locked roadmap end. Full 16 Watch chapters and long-run 30x10,000-wave/1,250h pacing have NOT been verified.
