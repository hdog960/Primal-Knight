# Alpha 0.13.3 — Ancestral Keepsakes
**Roadmap:** Exploration & Rewards, slice 4. Feature implemented in the real production game. Real iPhone acceptance deferred per player instruction.

## Long-run reward variety with no progression reset
All thirty territories already have finite milestones at waves 1,500, 3,000 and 6,000. Before this update, these milestones primarily paid Primal Sigils. Each of these **90 original achievements** now additionally grants a truly equipable, upgradable, realm-named keepsake:
- **Wave 1,500 — Waystone Striders** (Boots), a milestone-specific piece that strengthens the existing equipment stat calculations, not a new speculative multiplier.
- **Wave 3,000 — Chronicle Signet** (Ring), compatible with any of four existing ring slots and ordinary rune socketing.
- **Wave 6,000 — Fallen Kingdom Regalia** (Chest), a deeper collectible affecting the real fortress armor gearing system.

The 90 unique IDs use `keepsake_<tier>_<wave>`, so no random gear ID or duplicate reward is generated. Existing item rarity boundaries apply and scale every ten territories: Rare to Legendary boots, Epic to Mythic rings, Legendary to Ancient chest armor. Each includes its source territory name. Other rewards, damage formulas, item enhancement and socket calculations remain exactly as before.

## Retain the exact original finite economy
The milestone still awards **every original Sigil** in the `deepSigils` branch; no added Primal Sigils, currency exchange, multiplier or farming loop was introduced. The original `p.milestones[tier:wave]` controls the award, and the 1,144 total milestone identities across the 30×10,000-wave game are not changed. Any earned item in the normal 200-piece inventory is safe even when unequipped: the Armory disables direct and bulk sale for exact, milestone-verified keepsakes. A full bag puts the exact item in `pendingGear`, where it is claimable through the normal Royal Armory Equipment Vault. The existing Explorer Heirloom protections are preserved independently.

## Retroactive, idempotent migration
The old release would never have given previously earned milestones their newly introduced gear. Instead of punishing returning players, `reconcileMilestoneKeepsakes()` runs at startup and after restore/import. It examines only already-earned `milestones` flags, and creates a missing item **once** when absent from both `inventory` and `pendingGear`. If the bag is full, it reserves the award. It deliberately does **not** rerun milestone reward payouts, mint Sigils, or change prior best waves, levels, ranks, equipment or `primal_knight_onslaught_save_v1` format. Repeated loads and imported backups remain idempotent.

The existing Tier Battle Chronicle now shows a true preview of each unique reward and whether it is pending in the Equipment Vault. Its illustrated in-game milestone cards have a restrained gold/teal visual identity consistent with the existing fantasy UI.

## Automated regression gate
`tests/ancestral-keepsakes.js` exercises all 90 canonical tier/wave IDs; exact rarity and slot rules; invalid-tier rejection; uninterrupted baseline Sigil totals; real `rewardMilestone` persistence and repeat-blocking; real equipment stat contribution; direct/bulk-salvage protection; full 200-slot bag reservation and claiming; previously earned three-depth milestone backfills; repeated backfill idempotency; and old/new backup import with no duplicate currency or items. All preexisting suites continue running. **57 mandatory tests including `node --check game.js`**.

Physical iPhone Safari/Home Screen gesture, art, battery and thermal checks are not performed or represented as passed. They remain deferred until the locked Alpha 0.15 development work is finished. Alpha 0.13 will continue with additional non-farmable discoveries, challenge types and reasons to revisit older regions.
