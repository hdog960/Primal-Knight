# Alpha 0.12.3 — Region Relics & Boss Staging

## Intent
Continue the locked Living Territories & Art phase beyond its 29 illustrated landscapes and 30 preview postcards. Add *recognizable, region-specific physical landmarks* and subtle boss-stage atmosphere that supports rather than obscures automatic combat.

## Actual game changes
- Adds a territory-indexed list of **30 lore-consistent relic motifs**. Those are painted into the existing cached terrain SVG, not layered as icons or UI elements.
- Relic motifs include broken monuments, wardstones, shrine arches and stargates, watchfires, braziers and furnaces, blackened obelisks, shrine trees with roots, broken glass/crown fragments, lanterns and floodgates, storm conduits, solar relics and weathered banners. Hand-shaped faceted stone, shaded faces, chipped edges and light flecks blend into the existing 32-bit-inspired game scene.
- **Relics and environmental objects remain entirely outside the center marching lane** to preserve enemy silhouettes and boss counterplay.
- Tiers II–XXX retain the terrain image pipeline introduced in 0.12.1: a single local SVG picture is composed and decoded when a tier is selected, rather than recreating geometry every frame. Tier I continues to retain its original full painted art and is not overwritten.
- Introduces an **eight-mark boss-stage light response**. When an actual living chapter boss or siege commander appears, faint environment-colored torchlike brushlight appears at the *far left and right edges*, beneath enemies and their telegraphs. The effect stops immediately if the boss dies, the wave ends, or the player returns to the Battle lobby.
- The boss stage follows **simulated game time**, respects reduced-motion preferences (static lighting), and uses only eight small rectangles while active. No full-screen flash, camera shake, postprocessing, new particle objects, hit boxes or additional image downloads.

## Acceptance criteria
New `tests/territory-relics.js` validates 30 independently generated art fingerprints, the presence of at least a dozen relic types, inline-only SVG without remote references, ≤125,000 SVG source characters per territory, readable perspective causeway, determinism for every tier, eight side-only boss marks, reduced-motion, absence when a boss is not active, proper placement behind actual boss sprites/fortress, no simulation changes from repeated redraws, and no changes to local progress, resources or runes. This increases the required suite to **28 checks**, including JavaScript syntax validation.

### Explicit limitations
Artwork still requires direct iPhone Safari and Add-to-Home-Screen screenshot review for scene cohesion, text legibility and long-session battery/GPU behavior; these automated image/shape tests do not constitute an art-director acceptance. This work does not claim 30 independently painted-by-hand landscapes or complete Alpha 0.12 acceptance. No damage, weather status effect, currencies, level caps, saves or 30 tiers × 10,000 waves are changed. The 1,250-hour progression-max design target remains unmeasured.

## Next likely work
Improve coherent foreground accent silhouettes during different biomes without obscuring combat; create reliable visible-device QA and verify the enhanced scenes look cohesive with the high-detail painted battlements. Close Alpha 0.12 only after that review, then begin the locked Alpha 0.13 Exploration & Rewards phase.
