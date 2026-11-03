# Alpha 0.10.11 — Living Onslaught, Slice 12: One-Time Rune Reward Integrity

## Problem uncovered

During the Alpha 0.10 acceptance audit, another persistent reward-loss scenario was found. Wave **35** in each of the 30 tiers grants a **one-time earned rune**, but the legacy award path only delivered it when `p.runes.length < 240`. If a player's pouch was already full, the milestone was permanently marked **claimed** and the rune was silently discarded. Existing Relic Hunt rewards were protected by the `pendingRelics` vault, but wave milestones were not. This matters particularly on a game with 300,000 possible tier-wave victories and long-term collecting.

## Implemented changes

1. **All one-time earned runes now use one safe delivery function.** `storeEarnedRune(rune)` validates rune family, tier and ID, prevents duplicate IDs across both the owned pouch and pending queue, and returns a delivery state. A full pouch reserves the rune in the **existing saved `pendingRelics` array**, never destroying it.
2. **Wave-35 milestone protection for every tier.** The original one-time claim flag, prize Gold, rune family, rune tier, stable `milestone_<tier>:35` item ID and inventory limit remain unchanged. A full pouch queues the rune first and then saves the existing milestone claim. Later replays cannot enqueue duplicates or mint extra Gold/Sigils.
3. **Relic Hunts use the same safe delivery path** as milestones. Existing Relic Hunt IDs `relic<tier>_<wave>`, anti-farm ledgers, Knowledge bonuses, and their special full-pouch wording remain intact.
4. **The actual Battle tier lobby explains deferred rewards.** A compact decorated parchment-style notice displays how many earned runes are waiting and directs the player to **Gear → Rune Workshop**. A claimed wave-35 milestone now shows **IN RUNE VAULT** until that particular rune is collected, then **CLAIMED**.
5. **The existing Rune Workshop vault now describes both sources** (Relic Hunts and milestones), including the current count and claim button. Free a rune slot, then claim in the original earning order. There is no automatic inventory displacement or auto-deletion of a rune someone spent time collecting.

## Permanent progression and visual contracts

- Existing `primal_knight_onslaught_save_v1` and `pendingRelics` fields are reused. No new saved field, currency, tier gate, relic drop rate, combat stat, or extra repeatable reward.
- Existing 240-rune cap and 30 × 10,000-wave conquest remain locked.
- The new notice matches the established illustrated gold, teal and stone aesthetics, wraps on small iPhone screens and is hidden when there are no pending rewards.

## QA

An additional required script, `node tests/reward-integrity.js`, executes the real game and proves:
- All 30 Tier I–XXX wave-35 prizes are awarded once when the rune pouch is full.
- The original one-time Gold payouts still arrive, while Sigils and Knowledge do not change.
- All rune IDs, family rotation and valid ranks survive queueing, recovery and export/import.
- A queued duplicate or invalid rune cannot mint copies.
- A Relic Hunt joins the exact same FIFO queue while maintaining its original ledger.
- Freeing one slot redeems one reward, and freeing enough slots redeems all of them without ever exceeding the inventory cap.
- The tier lobby shows accurate vault notices and pending/claimed status.
- Ordinary wave-35 milestones still deliver instantly when there is free space.

The full GitHub Actions release suite now has **seven checks**: JS syntax, smoke, balance, encounters, deepwave, mobile-render and reward-integrity.

**Remaining acceptance work:** The user's physical iPhone Safari/Home Screen visual testing, ongoing deep-wave combat feel, and boss fairness review. These automated tests do not demonstrate completion of the design target of approximately 1,250 real hours to max. Alpha 0.10 stays open until accepted; the locked 0.11–0.15 roadmap remains unchanged.
