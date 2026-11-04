# Alpha 0.12.2 — Living Territories & Art, Slice 3: Illustrated Preview and Lore

## Why
Alpha 0.12.1 added 29 new real combat backdrops (plus the original Tier I). But the Battle selection UI sits over the canvas, so players still couldn't reliably preview what a new region would look like before launching. This slice closes the discoverability gap and gives every territory its own worldbuilding sentence without adding any new currency or hidden reward.

## Real UI improvements
- The selected Battle tier now presents an **illustrated region postcard** using the *same existing decoded picture* as the live battlefield, or the approved original `assets/battlefield.png` for Tier I.
- A proper title, region-specific weather/light description, and one of **30 unique authored location-lore excerpts** make each tier recognizeable before starting.
- The image, lore, and border accent all update when selecting a tier. The preview has descriptive image alt text for screen readers.
- A fixed-frame, dark-gold fantasy picture treatment preserves text contrast and shows the actual art instead of a generic icon or procedural placeholder. On portrait iPhone the preview is 110px tall (96px for very narrow screens); short landscape drops to 77px to avoid crowding milestone lists.
- During repeated Training/War Council/gear refreshes on the same selected tier, the preview URL is **not reassigned** and no extra new image is decoded. Selecting a new tier creates only that region's one image; the game's canvas shares the same encoded SVG source. All 30 images are never eagerly preloaded.

## Tests and acceptance
Required `tests/territory-preview.js` confirms 30 unique lore excerpts, live Tier I original preview, selecting Tier II/XXX exact SVG and weather content, code-only art caching through dozens of lobby updates, current currency and inventory integrity, accessible alt text, responsive CSS and Safari cache-bust. Existing 26 checks remain; the pipeline totals **27 mandatory checks** including the syntax gate.

**No** new expensive per-frame paint, combat mechanics, reward grants, extra permanent save fields, servers, file downloads or monetization.

## Remains open
Human visual approval of the 29 generated SVG backgrounds, how they harmonize with the painted foreground, actual iPhone Safari and Home Screen portrait/landscape testing, thermal impact in long sessions, additional foreground/environment storytelling integrated into boss encounters, and the broader Alpha 0.12.0 completion acceptance. The 30 × 10,000 tier/wave structure and approximate 1,250 active-hour *design goal* remain unchanged.
