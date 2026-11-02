# Alpha 0.3 — Complete menu replacement

## User note

Replace the old menus entirely with intuitive, beautiful, fun 32-bit fantasy-art design. No simple recolor. Deploy before requesting further user testing.

## Delivered

- New 5-hub global bottom navigation; each has a clear named purpose.
- Separate chamber layout with atmospheric scenery, new heraldry, original pixel-art icon atlas, large readable subnavigation, mobile-landscape handling.
- Rebuilt overview, talents by school, training by category, research, equipped items and inventory by slot, interactive rune socket picker, stations, enemy debuffs and local-save settings.
- Distinct currency cost indicators, rank bars, availability states, touch targets, no prompt() picker, unchanged local save key.
- Combat artwork stays independent of UI and fully existing battle logic stays active.

## QA checklist

1. Run `node --check game.js && node tests/smoke.js`.
2. On iPhone in landscape, select Hero, Skills (select all disciplines), Power, Training and Research, Gear and Rune Workshop, Fortress and Enemy Suppression, and Back to Battle.
3. Purchase training and equipment upgrades; select a rune using visible slot options; check currency changes, disabled purchase, persistence after reload.
4. Check menu scroll remains independent, never scrolls the entire browser page, and no panel is obscured by the dock.
5. Confirm pixel icon atlas `assets/menu_icons.png` exists and loads with status 200.

## Next priorities

Character animation, contextual stat breakdowns, more unique illustrations for rune and station items, accessible battle camera, balancing, improved stage variety.