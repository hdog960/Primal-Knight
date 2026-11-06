# Alpha 0.13.0 — Lost Signals, Explorer's Charter

## First playable Exploration & Rewards slice
All 30 tiers have four optional secret discovery waves: 47, 147, 347 and 747. In Battle preparation the player chooses NORMAL or SCOUT. The NORMAL setting preserves all prior encounters. SCOUT upgrades the final enemy slot on an unclaimed signal wave to a turquoise-marked Lost Warden — a real guardian role with 40% higher HP, modest armor and reduced speed, but no additional entity slots.

Defeat that guardian and complete its wave without any fortress breaches to earn a named, tier-specific permanent heirloom plus modest Knowledge. The four slots are Uncommon helm, Rare amulet, Epic charm and Legendary gauntlets. A dedicated explorationFinds ledger and deterministic IDs prevent ever awarding the same discovery twice. A full 200-item inventory routes the unique gear to the already persistent Equipment Vault. Backups and imports validate and restore the additive ledger under the original primal_knight_onslaught_save_v1 key.

This is 120 optional one-time discovery opportunities, not new repeatable Sigils or a replacement for any of the existing 1,144 milestones. Revisiting older tiers can complete missed discoveries. The roadmap still requires deeper secrets, richer exploration variation, unique milestone reward identity and replay incentives.

## QA and deferred physical-device acceptance
Required tests/lost-signals.js checks 120 tier/wave combinations, SCOUT and NORMAL, real game spawning, guardian death, flawless objectives, non-duplication, vault capacity and export/import compatibility. Full release gate: 54 checks including JavaScript syntax.

By the user's explicit direction, do not request hands-on iPhone playtesting, screenshots, or endurance logs until the end of Alpha 0.15. No hardware acceptance is claimed in this release.