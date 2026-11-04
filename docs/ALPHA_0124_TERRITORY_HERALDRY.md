# Alpha 0.12.4 — Biome Heraldry on the Painted Fortress

## Intent
Previous Alpha 0.12 slices improved the 29 alternative backgrounds and subtle regional boss staging, while the detailed, original castle foreground still used the same red hanging banners everywhere. The objective here is to make the player-held fortress look like it belongs in each territory **without recoloring the center knight, central skills, hand-drawn bricks, torches or siege projectiles**.

## Actual playable artwork
- Adds 13 original, line-stitched heraldic glyph families corresponding to the existing region biomes: Verdant, Ash, Frost, Marsh, Storm, Ruin, Ember, Obsidian, Grove, Astral, Crystal, Desert and Thorn.
- Tiers II–XXX receive **distinct colored cloth and heraldic embroidery** on the *two side banners of the existing original foreground image*. Color is sampled only from each region's real territory palette; SVG cloth shading, creases, textile highlights, edge chips, gilded hem stitching and terrain-linked crest motifs contribute recognizable fabric detail rather than a flat color overlay.
- **Tier I remains pixel-for-pixel unchanged**: it continues to use its original battle painting and original castle red banners.
- The transparent SVG is 960 × 540 but painted pixels lie only in side-banner regions near **x≈56–126 and x≈831–898**, below the skyline at y≈445–535. The hero at the center, boss telegraphs and UI are not color-filtered.
- The original foreground is painted first. The new transparent banners are painted **immediately afterward** and then real projectiles and combat effects draw above both; the stage retains depth ordering and combat readability.

## Performance budget
Each territory has at most **one additional small, cached Image**, created only when the selected tier changes. The tiny SVG is rendered once as a local encoded data URL; there is no network download, CSS filter on large art, extra per-frame SVG generation, new animation loop, persistent battle particle, texture atlas or save storage.
The old 60Hz / reduced-motion renderer controls remain unchanged. High-density original castle art is not modified or rewritten.

## Validation
The additional mandatory `tests/territory-heraldry.js` checks:
- all 30 distinct deterministic cloth compositions;
- the 13 symbol families cover the exact 13 terrain palettes;
- no embedded scripts, remote assets, malformed coordinates or oversized SVG pictures;
- every decorative patch stays outside the hero's central scene;
- existing Tier I asset is preserved;
- true canvas ordering: painted fortress → optional cloth accents → hero shots;
- 75 continuous canvas redraws cause **zero additional Image allocations**;
- switching regions allocates only one terrain background and one tiny banner;
- currencies, equipment, runes and stored character progress are unaffected.

This raises the required gate to **29 checks** (28 gameplay scripts and JavaScript syntax).

## Limits and next work
The generated banner fabric requires a direct real-iPhone screenshot review to confirm pixel alignment with the original red flags, consistent art quality and acceptable long-session thermals. Automated clipping/source ordering tests are *not* a physical-device art audit. Alpha 0.12 remains open until that review, and our earlier Alpha 0.11 device acceptance is also still pending. Next iteration should focus on graphical QA and targeted art corrections, then additional territory-specific scene events if the art is coherent.

The locked 30 × 10,000 tier-wave design and ~1,250-hour maximum progression *target* remain unchanged, as do the original save key and the full Alpha 0.13–0.15 roadmap.
