# Alpha 0.13.4 — Echo Returns
**Roadmap:** Alpha 0.13 Exploration & Rewards, slice 5. **Device acceptance:** still deferred, by player instruction, through completion of Alpha 0.15.

## A reason to revisit an earlier territory
Players who have **already cleared wave 250 in a territory** and genuinely claimed its **wave 100** waystone may revisit the older wave 100 checkpoint without replaying all the way from wave 1, even when newer wave 250/500/1,000 checkpoints have been unlocked. A new **REVISIT WAVE 100** choice appears beside the two original start options. It does not unlock a checkpoint by itself and does not change the save structure.

With SCOUT enabled, the **previously ordinary wave 117** is now a different kind of conditional encounter: **Memory Anchor**, a shielding Guardian, and **Revenant Courier**, a dashing Raider, replace two of the original 24 (or fewer) spawn slots. The real game AI, shooting, armor, shields, dash movement and player build do the fighting; no scripted success or new enemy slots are introduced. The normal encounter director, wave-117 non-boss classification, existing relays and all battle positions remain unchanged.

The one-time Echo Return prize requires every condition simultaneously: **both marked enemies genuinely killed; all ordinary enemies cleared; zero fortress breaches; fortress HP at least 50% of maximum when combat finishes before post-wave repairs.** Failing any condition permits a later replay but never silently awards progress. SCOUT is opt-in, and NORMAL leaves every wave unmodified.

## Real and protected rewards
Each of 30 territories awards a uniquely named, rarity-scaled **Memorybound Signet** after its first legitimate Echo Return. The 30 deterministic IDs `echo_<tier>_117` are normal equippable ring equipment with existing real stats, rune sockets and upgrades. Rarity starts at Rare and increases by region to Celestial. The ring may occupy any of the existing four ring slots. Like the old 120 explorer heirlooms and 90 Ancestral Keepsakes, these finite discoveries cannot be sold—whether directly or in bulk—once earned, even if unequipped. A full 200-item equipment bag sends the item to the same persistent `pendingGear` Vault; no item is discarded.

The additive, old-save-compatible `echoReturns` dictionary is keyed by territory and admits one claim per realm. Its presence and type are validated on backup import; older character saves get an empty ledger and retain their inventory, Sigils and progress. The original localStorage key `primal_knight_onslaught_save_v1` remains. No new paid goods, randomness, infinite currency, Primal Sigils or faux tier milestones are issued.

## Acceptance and tests
`tests/echo-returns.js` verifies all 30 deterministic rewards and non-boss wave placements; legitimately-earned prerequisite milestone; absence on NORMAL; the actual pre-siege click selection and real siege start at wave 100; two authentic capped spawn roles, real enemy deaths and kill mask; breach and insufficient-wall failures; exact first claim and duplicate blocking; actual ring equip protection against salvage, full-bag Vault storage, and current/old save imports. Including syntax, the production GitHub quality gate is **58 required checks**, with every prior test still mandatory.

The local game art uses existing drawn sprites and a restrained bronze Echo label; no new speculative visual assets or extra rendering memory are introduced. The physical iPhone Safari/Home Screen art, 30-minute battery and thermal test, touchscreen and Share Sheet validation remain **not tested** until the end of the locked Alpha 0.15 development roadmap. Alpha 0.13 exploration work continues after this slice.
