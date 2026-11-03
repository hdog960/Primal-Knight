# Alpha 0.10.12 — Living Onslaught, Slice 13: First Watch Reward Recovery

## Purpose and critical issue

The existing First Watch gives 16 progressive onboarding chapters across the first 750 active minutes, gated by both active time and unique cleared waves. Six of those chapters include unique one-time *item* rewards: four pieces of special-tier equipment at chapters 3, 7, 11 and 16, and two runes at chapters 5 and 10.

Previously, the code unconditionally marked a First Watch chapter as claimed while delivering the item only if the equipment bag held fewer than **200 pieces** or the rune pouch held fewer than **240 runes**. At capacity these one-time pieces of loot vanished permanently. This was a separate loss bug from the wave-35 milestone fix in 0.10.11.

## Implemented systems

1. **Protected First Watch equipment:** Every First Watch gear reward is generated with its original rarity and equipment-slot selection. It receives a stable unique ID `first_watch_gear_<chapter index>`. The original 200-item equipment cap remains unchanged. If inventory is full, the item is placed in a new additive **`pendingGear`** save queue instead of being discarded.
2. **Protected First Watch runes:** Both First Watch bonus runes use the existing `storeEarnedRune()` logic and saved `pendingRelics` vault. The original Tier 2 Frost and Tier 3 Storm runes retain their `first_watch_4` and `first_watch_9` IDs. There is no duplicate across owned and reserved runes.
3. **Recovery in the actual app:** The Battle tier lobby displays the count of queued equipment rewards, with directions to **Gear → Equipment**. The Equipment panel displays a compact **First Watch Armory** section and a functional **CLAIM EARNED EQUIPMENT** action when space is available. The existing Rune Workshop displays and redeems First Watch runes through the same Rune Vault as Relic Hunts and wave milestones.
4. **Fair redemption:** `claimPendingGear()` retrieves rewards in original earning order when slots are free. Neither the automatic hero nor any background timer deletes or replaces already-owned equipment. The existing 200-item gear cap and 240-rune cap remain hard limits.
5. **Robust compatibility:** A new additive save field `pendingGear: []` defaults safely for existing players, participates in backup import validation/normalization, and survives JSON exports and imports. The original local save key `primal_knight_onslaught_save_v1` is unchanged.

## Locked reward economy remains the same

- First Watch's Gold, Essence, Skill Points, and one-time Sigils are awarded exactly once per existing chapter, subject to the same active time and unique-clear requirements.
- Four original equipment rarity ranks are preserved: 2, 3, 3, 4. Actual item slots are still chosen by the existing gear generator.
- Original rune family, tier, ID and inventory slot rules are preserved.
- No new repeatable rewards, premium currencies, tiers, enemies, combat power, purchases or forced inventory disposal.
- Existing save backups, 30 × 10,000-wave conquest, one-time milestones and locked future Alpha 0.11–0.15 phases remain intact.

## Quality gate

A new eighth required script `tests/first-watch-vault.js` runs the real game JavaScript in a deterministic fake browser and verifies: all 16 First Watch chapters; exact original currencies; four queued equipment pieces and two queued runes at capacity; stable IDs and rarity; real Equipment claim action and disabled full-bag state; Battle lobby messaging; no duplicate awards; controlled first-in redemption; import/export survival; inventory caps; and ordinary immediate delivery when storage space exists.

The full GitHub workflow now requires syntax, smoke, balance, encounters, deepwave, mobile-render, reward-integrity and first-watch-vault tests.

## Outstanding acceptance work

Physical iPhone Safari and Home Screen layout checks, late-wave performance and boss difficulty feedback remain outstanding. CI coverage is not physical-device verification and the ~1,250-hour completion target remains unmeasured. Alpha 0.10 is still open; do not transition to 0.11 before that acceptance review.
