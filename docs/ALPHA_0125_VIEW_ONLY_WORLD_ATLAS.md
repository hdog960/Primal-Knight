# Alpha 0.12.5 — View-Only World Atlas and Full Art Preview

## Why this release
The expanded Living Territories artwork is finally substantial, but normal characters cannot select locked future tiers in the Battle lobby. That made it impossible to visually inspect all 30 newly implemented landscapes and themed battlement banners without spending hundreds of hours unlocking the world. This is especially important during the current pre-acceptance art-review phase.

## The actual game feature
- A clearly labeled **World Atlas · View All 30 Territories** button appears in Battle's tier-detail panel.
- The Atlas opens a touch-friendly, screen-filling, scroll-safe **view-only dialog** containing a full **960×540 illustrated battlefield composition**.
- Artwork is composited from the original `assets/battlefield.png`, the exact current territory's full-width terrain matte (960×346 top layer), the original transparent 960×540 castle/hero foreground, and the tiny biomed heraldry overlay on the original side banners. Tier I retains its original painted backdrop and banner colors.
- Previous/Next arrows navigate all thirty regions, including still-locked realms. The region name, weather, selected environment, original region lore, and clear **AVAILABLE IN BATTLE** or **LOCKED · ART PREVIEW** labels remain visible.
- Navigation is restricted to a single pair of visible local data-SVG images at a time. No thirty-image preload or network resources. The Atlas composes its pictures from the existing deterministic functions without touching the live canvas's cached `Image` objects. That prevents expensive back-and-forth terrain decoding when the game continues to paint its idle background.
- The dialog is not a progression shortcut. It never modifies `chosenTier`, `unlockedTier`, the active wave, milestone claims, currencies, paid upgrades, items, or the save. It cannot be opened during a live siege. Opening/closing returns focus to the correct buttons, and Escape/arrow keys also work on keyboard-equipped devices.
- iPhone portrait and low-height landscape layouts are supported. Real touch controls remain at least 44 px in normal layouts.

## Acceptance
`tests/world-atlas.js` checks presence of the actual modal and art compositing layers, Tier I original art, all 30 genuine illustrated preview sources and lore texts, correct locked/unlocked messaging, no hidden tier unlocks, hard previous/next bounds, no live-canvas image-cache allocations while browsing, repeat-src efficiency, close/Escape behavior, blocked active-siege entry, and unchanged permanent resources/equipment/saves. The full required CI increases to **30 checks** (29 gameplay scripts + JavaScript syntax).

## Explicitly pending
This gives the player a convenient **art review surface**, not actual visual acceptance by itself. Real iPhone Safari/Home Screen screenshots, checking alignment of painted side banners, landscape texture consistency, boss visual clarity, touch target comfort and long-session performance/thermals remain to be performed. The locked 30 × 10,000 wave structure, approximately 1,250 active-hour *design goal*, and Alpha 0.13–0.15 roadmap are unchanged.
