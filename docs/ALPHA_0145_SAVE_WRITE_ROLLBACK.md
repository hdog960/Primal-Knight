# Alpha 0.14.5 — Verified Import Rollback & Write-Failure Recovery

**Locked roadmap:** Alpha 0.14, Long-Run Quality of Life, slice 6. iPhone hands-on acceptance deferred until development through Alpha 0.15.

### Failure handling
The existing `primal_knight_onslaught_save_v1` primary save and existing older `primal_knight_onslaught_checkpoint_v1` verified copy stay in the same formats. Primary writes now verify exact readback before treating the save as durable; only *after successful readback* does the older checkpoint rotate. This protects the older copy from being replaced on quota or silent no-op failures. Such failures report that recent progress is not confirmed. If a primary write produces unknown, partial or unreadable bytes, the app locks future autosaves and warns the user rather than overwriting an uncertain record.

Before importing another character, the app captures the previous exact primary and prior undo-backup bytes, and verifies its new undo snapshot or damaged-original quarantine actually persisted. On an import failure it restores the old in-memory state and attempts to restore primary/undo/quarantine values with readback verification. If the primary cannot be restored, it enters guarded write-lock mode, preserves any remaining recovery copy and displays that storage rollback could *not* be verified. No false 'original preserved' success claim. Successful Undo Last Import is only followed by removal of its backup; an undo failure retains the backup.

### Scope
No changes to waves, 30 tiers, currencies, gear, combat, ownership, one-time milestones, optional 0.14.4 portable exports, or 24-run Siege Chronicle. This improves safety under storage faults but **does not guarantee atomic storage under a failing browser**; no local-only game can promise full device recovery after catastrophic storage loss. `tests/save-write-rollback.js` injects quota, silent no-op, partial and unrollbackable writes and tests warnings, checkpoint preservation, undo semantics and validated imports. **66 mandatory CI checks including JavaScript syntax**. Future phases: finish Alpha 0.14 persistence audit and proceed to the locked Alpha 0.15 pacing/economy simulation.
