# Alpha 0.12.1 — Living Territories & Art, Slice 2: Illustrated Terrain

## Why this matters
Alpha 0.12.0 gave every tier a weather/light identity, but **all 30 still shared one green-meadow background**. This slice changes the actual combat canvas behind units and foreground battlements, not just an overlay's color.

## Delivered, in playable game code
- **Tier I** retains the existing painted `assets/battlefield.png`, the richest original background already used for the tutorial.
- **Tiers II–XXX** replace the upper **960 × 346** battlefield scenery with reproducible original illustrated landscape mattes. Each is assembled from an intentional deterministic terrain recipe rather than an external generated asset or random live particle field.
- **Thirty one-to-one landscape identities**, mapped to the locked tiers. At least thirteen authored regional color/terrain families: verdant meadow, ash frontier, frost, marsh, storm, weathered ruins, emberland, obsidian, ancient grove, astral, crystal, golden desert, and thornwild.
- **Actual distinct environmental art**: independently designed sky gradients, far mountain silhouettes, layered rolling terrain, dense low-res brush and grass texture, a readable perspective stone/dirt causeway matching enemy travel, and terrain-appropriate distant ruined towers, arches, cliff spires, pines, twisted groves and crystalline obelisks.
- Landmarks stay near the **left/right margins**, not in the approach lane; boss countdown bars, enemy sprites, projectiles and original `assets/foreground.png` fortress draw *above* the new landscapes.
- A selected tier is previewed behind the Battle tier lobby even before launching a new run. During an active fight, rendering follows the actual run tier rather than an unrelated UI selection.

## Rendering and memory discipline
The landscape is an SVG picture built only **once per tier selection** and loaded into a single cached `Image` via a local `data:image/svg+xml` URI; the existing canvas then performs **one additional static drawImage per frame**. No new HTTP requests, 30 eager background image allocations, animation timers, per-frame SVG regeneration, persistent weather particles or external JS dependencies. The previous <=60 Hz canvas redraw cap still applies, and reduced-motion settings remain respected by the existing weather layer.

The locally composed SVG content is deterministic for the same tier, makes no save/currency changes, and includes no embedded scripts, hyperlinks or remote images. SVG art is static; the separately implemented weather continues to animate with paused/active in-game time.

## Acceptance
`tests/territory-scenes.js` validates the real runtime with 30 deterministic generated scene fingerprints, at least twelve regional landform classes, correct full-size road and terrain layers, source size/complexity limits, original Tier I retention, **one image per selected tier** and cache reuse over forty redraws, front-to-back draw order, Battle selection/active-run artwork, original owned items/economy safety and iPhone version cache keys.

All prior 25 required checks continue; this adds the 26th.

## Still open — do not overclaim
This is the first broad environmental illustration overhaul, **not** a human art-director approval of all 30 lands or a claim of fully hand-painted independent maps. The SVG-painted features need actual iPhone Safari / Home Screen screenshot review for detail legibility, palette harmony, enemy silhouettes, perceived frame pacing and long-session battery/thermal behavior. Tier-specific foreground props, environmental storytelling and boss-themed scene reactions are planned next.

The locked 30 tiers × 10,000 waves, existing saves, progression economy and ~1,250 active-hour *design target* remain unchanged. Prior Hero Combat Depth hardware approval is still pending.
