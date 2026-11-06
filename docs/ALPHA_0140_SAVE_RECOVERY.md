# Alpha 0.14.0 — Verified Save Checkpoints
**Locked roadmap:** Long-Run Quality of Life, slice 1. **Device visual/endurance acceptance:** deferred until all Alpha 0.15 development is complete, per player instruction.

## Risk addressed
Previously, Primal Knight saved the whole character JSON under a single `primal_knight_onslaught_save_v1` localStorage key. A truncated, damaged or unreadable primary value could cause a silent return to a fresh character. Manual JSON export and an undo-import safety copy already existed, but there was no independent automatic recovery checkpoint.

This release preserves the exact existing **original character JSON format and original save key**. A second key, `primal_knight_onslaught_checkpoint_v1`, holds an envelope with schema, creation timestamp, the **prior known-good raw character JSON** and a deterministic FNV-1a integrity digest. Only objects passing the original backup structure validator and checksummed checkpoint readback are trusted. The backup is refreshed periodically (at most around twelve verified primary writes apart) to limit synchronous iPhone localStorage write overhead, and **is deliberately older** than the latest save. Players could lose recent purchases or waves when recovering from a checkpoint; the game says so explicitly.

## Exact failure behavior
On startup:
- Valid current primary character data always wins, even when the backup is older or invalid.
- An invalid primary with a checksummed, structurally valid checkpoint recovers from that prior character and rewrites the live primary with the recovered data. Settings and the Battle lobby clearly report this partial rollback rather than falsely claiming no progress was lost.
- An invalid primary with no valid checkpoint displays a persistent warning and **blocks automatic saves**. The original damaged JSON/text remains untouched; there is no automatic level-one reset. Players can export the broken original as a .txt file, or import a known-good exported JSON save using the original import feature. Before a manual import replaces the damaged primary, those exact damaged bytes are stored in a separate `primal_knight_onslaught_damaged_original_v1` quarantine key and remain exportable.

The Settings screen shows whether the checkpoint is available, offers a confirmation-guarded **RESTORE LAST VERIFIED CHECKPOINT** option, and uses the original pre-import safety copy so restoring the older state can be undone. A checkpoint write blocked by storage quota does **not** cause a false claim that a backup exists; the primary save may still succeed. Failure to write the primary returns failure without overwriting the last verified source. The software validates essential numeric character progression before accepting stored data for recovery. It never generates unearned milestones, Sigils, inventory, rune rewards or a new character version.

## Preserved content and remaining work
All thirty original tiers and 10,000 waves per tier, 1,144 finite milestone achievements/Sigils, Training/Research/Ascension/Sovereign ranks, hero gear and runes, 120 Lost Signals, 30 Cartographer Oaths, 30 Echo Returns, 90 keepsakes, 30 Atlas Seals and 180 SCOUT navigation objectives are unchanged. There are no external dependencies, cloud accounts, analytics or paid recovery services. This is not a redesign of the medieval-fantasy art.

New `tests/save-checkpoint-recovery.js` exercises fresh saves, checksum verification, older checkpoint rotation, primary preference, truncated/structurally broken character recovery, deliberate checksum tampering, blocked writes and original byte preservation, manual import and rollback, quota failures, currencies/one-time achievements and old save compatibility. The mandatory suite is now **61 automated checks including syntax**, and all prior suites remain required.

This is **Alpha 0.14 slice 1**, not completion of the QoL phase. Next work includes configurable long-run behavior and automation, richer earned-progress/run history, convenient waystone and thousands-of-waves navigation, and deeper migrations. The 1,250-hour full progression remains an unmeasured target; physical iPhone Safari/Home Screen art, touch, battery and thermals are not marked tested.
