# Alpha 0.12.7 — Three-Banner Cohesion, Living Territories & Art

## Concrete visual defect
The original 960 × 540 illustrated fortress contains **three red cloth banners**, not two: outer-left x≈57–124, **middle guild banner x≈246–310**, and outer-right x≈834–894. Alpha 0.12.4–0.12.6 had recolored the *two edge banners* but left the center banner red, visibly undermining the intended regional palette and inconsistent with the art's three matching lion crests.

## Actual game change
For all 29 non-Tier-I territories, regional cloth recoloring, textile highlights, embroided heraldic crest strokes, hem fringe and aged fabric flecks now cover **all three painted banners**. The newly included center guild banner begins around y384 and its tapered hem ends at y507; its heraldic emblem is centered x277/y435.

The high-detail central **knight and its silhouette remain unchanged**. The UI, all ability icons, enemy sprites, existing battle-time weather and original castle stone are unchanged. The new center panel sits to the knight's left and is composited behind actual combat projectile effects.

Tier I remains original in every respect: the exact painted background and all three original red flags are intact.

The game continues to compose one small, transparent 960×540 data-SVG foreground for the selected territory, with no extra per-frame image or canvas operations. There are still 13 biome symbol/palette families and 30 deterministic compositions.

## Quality gates
The earlier `tests/territory-heraldry.js` now insists that **all three actual flag panel positions** and all three centered stitched crests are present for every tier. The new `tests/three-banner-cohesion.js` exercises the real canvas output, including the formerly missed center guild panel, all 30 deterministic variants, one-image caching across 75 redraws, original Tier I preservation, and no saved resource or upgrade changes. This increases the mandatory suite to **32 checks: 31 test scripts + JavaScript syntax check**.

## Remaining art acceptance
The test locks the SVG geometry to coordinates measured from the illustrated foreground, but visual edge precision on a real iPhone (especially against the hero's cape and small screen scaling), Safari canvas decoding, and battery/thermal pressure remain to be inspected. This is a targeted, verified code-level art correction rather than a full visual-audit certification. The locked 30 × 10,000 wave structure, finite economy, original save key, and ~1,250-active-hour full-progression *design goal* are unchanged.
