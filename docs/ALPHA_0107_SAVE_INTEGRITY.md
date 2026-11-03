# Alpha 0.10.7 — Living Onslaught, Slice 8: Save Integrity & Deep-Wave QA

## Why this slice matters
During the Living Onslaught acceptance audit we identified a severe historical restore bug: the in-game JSON backup importer still capped `unlockedTier` at **12** from an older release, even though the live game supports **30 tiers**. Importing a high-level backup could therefore appear to lock tiers the player had legitimately earned. The older import path also skipped some later save ledgers and did not rerun the previous gear migration.

## Real changes
- **Accurate Tier XXX restore:** accepts and preserves all legitimate unlocked/selected territory values from I–XXX and their best wave records, finite Sigil milestones, chapter challenges, relic claims, queued earned runes, Dominion Crests, Sovereign Oaths, Ascension, Legacy, currencies, First Watch and owned equipment. Invalid numeric tier values are bounded to the current game cap.
- **Previous-version backups migrate:** pre-v3 saved weapons/armor and socketed runes pass through the established non-destructive equipment migration, keeping item identities, rarity and plus ranks.
- **Input validation before destructive replacement:** check expected save/inventory data shapes, reject malformed JSON and incompatible records without replacing live progress, and limit the file picker to backups of at most 10 MB.
- **Emergency rollback:** when importing, first save the current permanent progress into a separate same-device recovery key, `primal_knight_onslaught_pre_import_backup_v1`. If the phone cannot store this recovery snapshot, **refuse the import**, leaving current progress intact. Settings exposes **UNDO LAST IMPORT** when the snapshot is present; undo consumes the snapshot after successful restoration.
- **Truthful save feedback:** manual SAVE NOW confirms success or warns when local storage failed. Import success is shown only after the new state really saves.
- **Unpaused return from import:** restore resets the combat control state before returning to tier selection, preventing an accidentally paused or accelerated siege after switching saves.
- The original local progression key `primal_knight_onslaught_save_v1` remains **unchanged**; there are no gameplay-balance changes and no permanent currencies/rewards added.

## Deep-wave simulation and CI gate
A new deterministic `tests/deepwave.js` loads the real game JavaScript (not a rewritten battle approximation), covering:
- Genuine Tier XXX and earlier restored JSON records, exact old currency / item identities and all later progress ledgers, recovery undo, invalid file rejection, storage quota refusal, and old gear migration.
- Two seeded conditions across Tiers **I, VII, XIII, XVI, XVII, XXIV, XXX** at waves **1, 20, 100, 250, 1,000, 5,000, 10,000**, with actual enemy creation and game ticks.
- Live enemy budget maximum **24**, projectile pool **48**, particle pool **140**, floating combat text **28**, finite HP/armor/speed/position and finite earned-resource values.
- Real chapter / elite boss insertion and the established encounter director.

Release CI now requires `node --check game.js`, `node tests/smoke.js`, `node tests/balance.js`, `node tests/encounters.js`, and `node tests/deepwave.js` to pass together.

**Scope limit:** simulated battles at selected checkpoints are not proof that an entire 1,250-hour progression was playtested, that all 300,000 potential waves were simulated, or that the physical iPhone version has received visual approval. Those remain open.

## Next acceptance step
After fixing any automated QA issues, perform the physical iPhone Safari / Add to Home Screen readability review, then decide whether the broader Alpha 0.10 phase meets its acceptance standard before advancing into the locked Alpha 0.11 Hero Combat Depth milestone.
