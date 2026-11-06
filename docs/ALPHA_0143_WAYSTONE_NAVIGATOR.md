# Alpha 0.14.3 — Earned Waystone Navigator

**Locked phase:** Alpha 0.14 Long-Run Quality of Life, slice 4.
**Acceptance:** automated release checks; physical iPhone review still deferred through Alpha 0.15 at the player's instruction.

## What changed
The Battle tier lobby now offers an optional collapsible Waystone Navigator alongside the original Wave 1, latest earned Waystone and Echo Return wave-100 selection. Each unlocked territory can have up to ten existing checkpoint markers: 100, 250, 500, 1,000, 1,500, 2,500, 4,000, 6,000, 8,000 and 9,000. Every button is computed from its original territory-specific `milestones` reward flag, not personal best or merely knowing a higher wave exists. The selected wave becomes the actual next siege's `run.startWave` and is reported by War Council and the existing Siege Chronicle.

A second, compact panel shows up to four real unclaimed milestone targets. Selecting one sets the closest **previously earned checkpoint at or before that wave**, potentially Wave 1 when there is no earned earlier checkpoint. Missed milestones behind a high personal best are identifiable. These are *navigation goals*, not automatic awards, temporary buffs, or guaranteed victories; all intervening waves must be fought legitimately.

## Precedence and preservation
The existing Scout Routebook still selects its own nearest earned starting waystone for a chosen unfinished optional objective; manually selecting a standard earned waypoint or milestone target clears that route but does not change the NORMAL/SCOUT global mode. The original fresh Wave 1, latest earned waystone and dedicated wave-100 Echo revisit options remain. Territory changes, conventional start choices and successful backup imports/undo reset custom waystone selection. Imported characters never carry extra checkpoint selections because the navigator is ephemeral UI-only state. Invalid/stale selections fall back to the original latest earned waystone (or Wave 1). All 30 tiers, 10,000 waves each, 1,144 finite milestones, enemy combat, loot, XP, currencies, existing save key/checkpoint recovery, Siege Guard and 24-run Chronicle are unchanged.

## Verification
`tests/waystone-navigator.js` verifies true original ten-waystone ledger gating, selected tier isolation, goal targeting, no fabricated waystone 600, 10,000-wave boundaries, live wave-8,000 entry and Chronicle attribution, disabled mid-run retargeting, 1/latest/Scout priority, actual user-click handlers, rerendered launch labels, existing JSON import migration and no arbitrary rewards. All previous 63 mandatory gates retained; **64 checks including JavaScript syntax** required before merge and deployment.
