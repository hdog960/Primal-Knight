# Alpha 0.13.6 — Scout Routebook
**Locked phase:** Alpha 0.13, Exploration & Rewards, slice 7. **Status:** real gameplay and mobile UI implemented; physical iPhone acceptance deferred by player instruction through completion of 0.15.

## The problem solved
The existing 30 territories contain six finite SCOUT objectives each: Lost Signals at waves 47, 147, 347 and 747; Echo Return at wave 117 (unlocked only after reaching wave 250); and a three-wave Cartographer's Oath at waves 1,001–1,003. Finishing them all grants that territory's Atlas Seal, contributing one of 30 permanent mastery banners and capped account-wide power rewards. The old Battle launcher only provided **fresh wave 1, latest waystone, and the dedicated wave-100 Echo revisit**. On long-run saves, the latest waystone may be 4,000, 6,000 or higher, rendering the earlier wave-347 and wave-747 missions unnecessarily tedious to revisit.

**Scout Routebook** appears in the original Battle lobby Explorer's Charter, preserving the existing painted fantasy UI. It presents six touch-safe mission cards, named with exact target waves, current availability, and original requirements. A selected unclaimed route automatically enables SCOUT and tells the Battle launcher to start from the nearest **already earned** waystone in that exact territory at or before the objective. For example:
- Wave 47 guardian → start at wave 1, because no earlier milestone exists
- Wave 117 Echo Return → earned wave 100, and only after genuine wave-250 progress unlocks it
- Wave 147 guardian → earned wave 100
- Wave 347 guardian → earned wave 250
- Wave 747 guardian → earned wave 500
- Wave 1,001–1,003 Oath → earned wave 1,000; must still survive all three real consecutive waves

If the expected waystone isn't earned, the Routebook picks the nearest **earlier legitimate milestone** or wave 1 instead. Starting a route never marks intermediate waves cleared or bypasses a guardian, unlock condition, reward claim, boss fight, finite milestone, or rune/gear cap. The full original battle director, mechanics, enemy cap, and combat completion handlers are used. This is a navigation improvement, not a simulated conquest. Existing NORMAL, WAVE 1, latest WAYSTONE and REVISIT WAVE 100 modes remain accessible.

## Save, UI and economy integrity
Route targeting is temporary **per-lobby UI state only**, not a stored character upgrade. Manual NORMAL or regular start selection cancels it; switching tiers or restoring a backup resets it. Claimed/locked mission buttons are disabled so a one-time reward cannot be prompted again. The original `primal_knight_onslaught_save_v1` key and save/import schema are unchanged.

All 1,144 finite milestones, 30×10,000-wave structure, original Primal Sigil budget, 120 Lost Signals, 30 Cartographer one-time rewards, 30 Echo Return rings, 90 Ancestral Keepsakes, 30 Atlas Seals and original currencies are unchanged. The Routebook merely makes already available explorations practical to finish.

The responsive bronze/teal grid keeps touch targets above 44px, offers a clear selected route status and never covers the Battle controls or rendered character/world. No new downloads, sprites or per-frame rendering work are introduced.

## Automated acceptance and remaining device acceptance
`tests/scout-routebook.js` exercises the complete **30×6** deterministic missions, invalid tiers/waves, locked Echo requirements, six target wave calculations, tier-specific checkpoint isolation, no writes to the save on temporary mission selection, actual click handlers, NORMAL/manual start mode restoration, actual live siege start at earned wave 250, the real guarded wave-347 encounter with one existing capped enemy substitution, genuine guardian kill and protected one-time heirloom, forbidden repeat routing, tier changes and current-backup restore.

All previous gameplay suites remain mandatory; including JavaScript syntax, the GitHub Actions quality gate now requires **60 checks**. As directed by the player, physical iPhone Safari/Home Screen controls, landscape/portrait visual approval, Share Sheet and long-session FPS/thermal/battery review are **not certified** and must wait until all locked development through Alpha 0.15 is complete.
