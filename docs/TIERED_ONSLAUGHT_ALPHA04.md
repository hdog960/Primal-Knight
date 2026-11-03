# Alpha 0.4 — Tiered Endless Onslaught

## Player flow

1. The Battle hub opens on an illustrated difficulty selection lobby (not immediately in combat).
2. Choose one unlocked tier and inspect that tier's permanent milestone track.
3. Start the siege once. Combat continues automatically from wave 1 until defeat or an explicit retreat. There are no stage breaks or Next Wave clicks.
4. Wave rewards, kill rewards, loot, XP and permanent progression continue throughout the run. Open Hero/Power/Gear/Fortress while the battle continues; the menus do not silently pause it. Manual pause and 1x/2x speed still work.
5. Milestones are awarded **once per tier, per wave**; replaying a tier never duplicates first-clear prizes. Regular earnings remain repeatable.
6. Defeat returns to the tier lobby with results. Best completed wave persists separately per tier.

## Difficulties

Twelve tier names, gradually scaling HP, armor, movement, attack damage and reward rates. Tier I unlocked by default; each tier's wave 20 unlocks the next tier. Higher waves continue after wave 20; beating it never forcibly ends a run.

## Milestones

- Wave 5: Gold
- Wave 10: Hero Essence
- Wave 15: Primal Sigils; Tier I additionally opens Legacy Masteries
- Wave 20: next difficulty tier and Sigils
- Wave 35: upgraded rune and Gold
- Wave 50: collectible, equippable cosmetic banner
- Wave 75: Sigils
- Wave 100: large Essence and Sigil payout

The milestone board updates claim states and per-tier best-wave records. All trophies are finite, one-time rewards; each tier remains endlessly replayable for normal materials and higher-wave records.

## Legacy Masteries

Wave 15 on Tier I reveals three new long-term upgrade lines under Power → Training, funded only by Primal Sigils:

- Siegebreaker: bonus boss damage
- Guardian's Oath: extra maximum wall health
- Golden Touch: more Gold per kill

## Save migration

Existing `localStorage` key is deliberately unchanged (`primal_knight_onslaught_save_v1`). Defaults are added non-destructively to older saves: tier 1, zero milestones, unlockedTier 1, empty legacy levels, zero Sigils, default Crimson Standard banner. Existing items, levels, research and currencies are not cleared. Export/Import includes the new fields.

## QA

- `node --check game.js`
- `node tests/smoke.js`: tests tier select and unlock, wave 20, persistent claim prevention, legacy purchase, ongoing navigation, rune socket, and returns to lobby
- Browser checks: 1440x900, 852x393 iPhone landscape, 393x852 iPhone portrait. On this environment, browser network navigation is restricted; tests used a self-contained local HTML/CSS/JS page with original asset bytes embedded. The actual GitHub Pages URL still requires a real-device playtest.