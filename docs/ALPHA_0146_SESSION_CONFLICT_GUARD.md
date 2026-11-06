# Alpha 0.14.6 — Primary Save Conflict Guard

**Phase:** Long-Run Quality of Life, slice 7. **Gate:** 67 mandatory automated checks including JavaScript syntax. iPhone acceptance deferred through Alpha 0.15.

## What changed
Alpha 0.14.5 checked a character save **after** writing, but did not inspect the current bytes *before* replacing an existing save. An older tab could therefore overwrite a newer save produced by another Safari or Home Screen instance. This version tracks the exact primary value last observed on startup or after a verified local write/rollback. Before any primary write, a readback must match those bytes. A mismatch, missing primary or read exception locks autosave and visibly directs the player to export this tab's unsaved in-memory progress and reload to inspect the stored character. Manual backup import checks before touching the old undo slot and must not roll back over a newly detected concurrent primary.

## Important recovered-save retry fix
The checkpoint loaded from an older backup is different from a still-damaged primary in storage. Previously a quota-rejected or silent no-op attempt to persist a recovered character compared the stored *damaged original* against the *valid older checkpoint text*, wrongly treating an unchanged primary as a partial write and locking further recovery attempts. Now a write failure compares stored bytes against the exact actually-observed primary. If unchanged, retry is safe; partial or unreadable storage still triggers write-lock.

## Compatibility and limitations
No new character fields or keys. The original `primal_knight_onslaught_save_v1` JSON, verified older checkpoint, cadence, import/export formats, quarantine, undo copy, local run history and earned-only progression remain. Neither new currency nor free awards are introduced. localStorage lacks a compare-and-swap transaction across tabs, so a truly simultaneous write between preflight and setItem remains possible. This release prevents overwriting an already-observed external change; it does not claim fully atomic multi-tab syncing.

`tests/save-session-conflicts.js` models external newer saves, unexpected eviction, preflight read errors, quota retries, damaged-primary startup recovery and safe import/undo. Run all **67 checks including syntax** on the PR and merged main, and confirm GitHub Pages deployment. Physical iPhone Safari/Home Screen acceptance still outstanding until all Alpha 0.15 development is finished.
