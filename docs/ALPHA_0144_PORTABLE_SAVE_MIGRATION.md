# Alpha 0.14.4 — Verified Portable Saves and Forward-Format Protection

**Locked roadmap:** Alpha 0.14, Long-Run Quality of Life, slice 5. **Release testing:** automated; physical iPhone acceptance still deferred until development through Alpha 0.15.

## Purpose and user-facing controls
The existing `primal_knight_onslaught_save_v1` plain character JSON and original **EXPORT SAVE** button are unchanged. Players may also download **DOWNLOAD VERIFIED BACKUP** in Settings. Its optional `primal-knight-verified-v1` JSON envelope contains the exact plain character JSON text plus a deterministic FNV-1a checksum, format/schema tag, export timestamp and character-version marker. The envelope detects accidental corruption; it is *not* a security signature or encrypted file.

The same import picker accepts either format. The imported data is verified and version-checked **before** the confirmation dialog: the dialog shows current versus imported unlocked tier, character level, best wave, finite milestone count and inventory count, explicitly warning when the candidate is older. No backup is applied simply because the file was selected. The active run ends after a successfully confirmed import, never during preview. The original pre-import undo backup remains and must fit in device storage.

## Future version safety
A future `version` field on an existing primary character is never treated as a normal or corrupted v3 character. The app refuses to auto-upgrade/downgrade it, **does not restore from an older checkpoint over it**, locks all automatic character writes, and provides an explicit export of its untouched original text. The user is guided to a newer build. An explicit manual import of an older backup still works, but the newer bytes must first be quarantined just as other unreadable originals are. Earlier v1/v2 and current v3 characters continue to migrate through the existing real legacy path. Direct restore helpers also reject newer-version characters.

## Scope and verification
This slice adds no battle mechanics, auto-buys, monetary rewards, offline progress, tiers, milestone grants, remote backups or recurring services. Device-only preference keys, recovery cadence, Sigils, equipment, the 24-run Chronicle, 10,000 waves per tier and original 1,250-hour design target remain. `tests/portable-backup-migration.js` covers valid/invalid envelope checksums and metadata, read-only preflight, legacy raw JSON roundtrip, lower-progress preview, unsupported version protection (with a valid older checkpoint), original byte preservation and quarantine, and old equipment migration. **65 mandatory checks including syntax**. More failed-write safety auditing remains before Alpha 0.15 balancing.
