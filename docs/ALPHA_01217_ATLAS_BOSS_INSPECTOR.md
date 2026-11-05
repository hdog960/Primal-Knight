# Alpha 0.12.17 — World Atlas Boss Artwork Inspector

## Playable addition

The World Atlas now includes a **view-only boss-stage artwork selector**. In any of the thirty territories—including locked regions—players can choose **OFF, IRON, EMBER, RIFT, or BEAST** and optionally toggle **PHASE II**. This allows actual iPhone inspection of the 0.12.16 boss scenic details without needing to defeat or even reach that encounter.

Critically, this is **not a separate artist mockup**: the preview invokes the same real `territoryBossStaging()` routine used during boss fights with a tiny temporary, unconnected inspection state. It serializes exactly the real 32 canvas `fillRect` calls into a small static 960×540 SVG image. It therefore preserves both the exact drawing coordinates and the original biome palette, with real Phase I versus II alpha intensities. The preview image is placed **between the painted landscape and original fortress foreground** within the same artwork wrapper as the existing zoom/pinch/drag. The hero and banners remain in their original layers. No new image sprites are created or replaced in the live combat renderer.

The selector stays on the chosen boss type while players browse the 30 realms, enabling side-by-side mental comparison of each territory's palette. The existing **COMPARE ORIGINAL ART** toggle hides the boss overlay along with other new territory overlays while comparing, then restores it without reassigning the SVG. Closing the modal or launching a real siege clears all boss-preview SVG references, resets the selected style to OFF and returns Phase II to inactive. Reopening never revives stale images. All style and phase buttons have explicit `aria-pressed` state; the Phase II button is disabled when no stage is selected, and the scrollable row has mobile touch targets.

This feature is inspection only. It does not spawn real enemies, advance time, change any tier unlock, award gold, consume items, modify an encounter or write preferences to the saved game.

## Regression acceptance

New required `tests/atlas-boss-inspection.js` asserts all 120 boss/realm combinations, both real phase variants, exact 32-realm-staged rectangles and safe side positions, deterministic SVGs, no extra game `Image` objects, zoom and comparison interaction, changing realms with style intact, released data URLs on close, re-open/reset, blocked mid-battle access and no storage or character mutations. Existing Atlas and heraldry regressions remain mandatory. Total **42 quality checks** (41 gameplay scripts plus syntax).

## Unfinished physical acceptance

The update makes real-device review considerably easier but does not itself prove the art looks correct on the user's physical iPhone, or that Share Sheet, touch gestures, or long-session heat/battery are acceptable. **Alpha 0.12 stays open** pending genuine iPhone Safari/Home Screen acceptance. Locked Alpha 0.13–0.15 still follow this gate. All 30×10,000 waves, 1,144 tier milestones, save compatibility and the ~1,250 active-hour unmeasured design goal remain intact.
