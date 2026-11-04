# Alpha 0.12.6 — Banner Alignment, Before/After Comparison & Atlas Memory Hygiene

## Actual art fix
Visual review of the original 960 × 540 painted `assets/foreground.png` revealed a concrete mismatch: the 0.12.4 regional cloth overlays began at **y≈445–446**, while the real original banners start around **y≈388–390**. The regional fabric therefore replaced only the bottom part of the original red banners, leaving the old red tops visible and making the new colors appear inconsistent.

This release adjusts the *actual game canvas* and Atlas SVG cloth compositions to begin at the original painted banner top instead of leaving an exposed red strip, reshapes the tapered hem to reach the original pointed cloth tips, and relocates the sewn heraldic emblems to the center of the now-correct full-height fabric. Two carefully bounded side regions are affected, with no changes to the center knight, battle skill buttons, original stones, enemies, boss warnings or projectiles.

**Tier I retains its original foreground.** All 29 alternative territories reuse the existing independent region-color and stitched crest families, now with correctly positioned banners.

## World Atlas comparison
The Battle → World Atlas dialog now has a touch-safe **Compare Original Art** toggle for Tiers II–XXX. When selected, it temporarily hides only the currently displayed generated terrain and regional banner layers to expose the original original painted landscape/fortress underneath. Pressing Show Territory Art restores the exact picture without regenerating its SVG. Switching realms resets the comparison to the territory artwork. Tier I disables Compare because it already uses only the original image.

This is entirely **view-only**. It does not change chosen/unlocked tiers, spawn bosses, modify saves, spend currencies or alter rewards.

## Real Atlas preview memory fix
The Atlas previously retained the most recently browsed large percent-encoded SVG data URLs in two hidden HTML image attributes even after it closed. On an iPhone this can prolong unnecessary image memory use.

Closing the Atlas, starting a siege, or returning to original Tier I now removes the hidden Atlas image `src` attributes (not `src=""`, which browsers might treat as a request for the current page) and resets its source/tier markers. Reopening the same territory restores its deterministic images on demand. The original *combat canvas* terrain and banner `Image` caches stay independent and untouched; the Atlas never loads all 30 images at once.

## Verification
- Existing required `tests/territory-heraldry.js` now pins the corrected cloth-top coordinates and center-crest positions, so the previous mistake cannot recur silently.
- New `tests/atlas-art-compare.js` exercises the real `game.js` controller and DOM mocks: initial artwork, original-vs-territory toggling, pressed-state accessibility, no reassigning large image sources on redraw, clearing image `src` on close/Tier I/start siege, reopening the exact art, 30-tier progress and currency preservation, and Safari release keys.
- All 30 previous requirements remain mandatory, giving **31 CI quality checks** (30 gameplay scripts plus `node --check game.js`).

### Pending real-device work
Physical iPhone Safari and Add-to-Home-Screen screenshots are still needed to confirm final banner edges against the hand-painted original at phone scale, check that artwork remains visible across orientations, and measure GPU memory and thermal pressure. The automated tests prove code geometry and reference cleanup, not browser garbage collection or actual 60fps stability.

No combat numbers, tier gating, milestone rewards, save keys or 30 × 10,000-wave structure were changed. The approximately 1,250 active-hour full-progression target remains a design goal, not an empirical measurement.
