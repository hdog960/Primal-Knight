# Alpha 0.13.2 — Cartographer's Oath
**Locked phase:** Alpha 0.13 Exploration & Rewards, slice 3. **Status:** code + automated QA release increment; human iPhone acceptance intentionally deferred.

## The real gameplay addition
In every one of the 30 original territories, SCOUT can attempt the Cartographer's Oath by completing waves 1,001, 1,002 and 1,003 **consecutively in the same siege without a single fortress breach**. The oath begins immediately after the wave-1,000 depth waypoint, so revisiting an earlier region presents a defined reason to push deeper. SCOUT is selected in the existing pre-battle Explorer's Charter; NORMAL has absolutely no new enemies, trial checks or effects. A stage-broken run cannot claim completion, but the player can try again by starting a new SCOUT siege. The Battle encounter ribbon and objective strip identify each genuine current stage.

The Oath does not add enemy spawns, bypass the established 24-entity cap, create boss exceptions, replace another special wave, or grant a new currency. The existing encounter director runs the three ordinary waves unchanged. The player's accumulated skills, equipment, runes and station investments still determine whether all three fights are survived. The immediate challenge is a meaningful three-wave promise instead of a renamed single enemy.

## Finite, distinct rewards and preservation
Completing the oath in each territory grants two one-time, persistent rewards:
- A distinct selectable Hero Hall banner, "Cartographer of [territory]", with no extra power and no paid purchases; 30 distinct names.
- One deterministic territory-scaled rune (Frost, Storm, Ember, Fortune rotating by tier; rune tier from 2 through 11), uniquely identified as `cartographer_<tier>`. If the normal 240-rune pouch is full, the exact rune goes to the existing claimable Rune Vault rather than vanishing.

The additive `cartographerOaths` save ledger (keyed by territory) blocks duplication even on repeat wave clears, retries, and backup/import restoration. New characters and backups from before this release receive an empty ledger. The established save key `primal_knight_onslaught_save_v1`, 1,144 finite milestones, full equipment bag, 120 old Lost Signals and Explorer Heirloom Bonds, First Watch, finite Primal Sigil budget and 30 × 10,000-wave progression are unchanged.

## Verification and remaining acceptance
`tests/cartographer-oath.js` checks all 30 unique tiers, 3 stage identities, real director/spawn cap, untouched NORMAL path, unauthorized middle-wave starts, no early reward, real consecutive wave clears, a deliberately failed second wave, successful retry, non-duplication, equippable banner, exactly one rune, 240-rune vault protection and current/legacy backup import. Together with JavaScript syntax validation and all prior suites, the mandatory release gate is **56 checks**.

The physical iPhone art, gesture, Share Sheet, Safari Home Screen, endurance, battery and thermal review is **not performed or certified here**; per the player's explicit instructions, conduct consolidated device acceptance only after completing all development through locked Alpha 0.15. Alpha 0.13 remains open for additional rare challenges, deeper discoverables, finite milestone identity and replay incentives.
