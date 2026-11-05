# Alpha 0.12.18 — Shareable World Atlas Artwork PNG

## Why this release

Physical iPhone art acceptance is still the principal gate before completing the Living Territories work. The existing **Battlefield PNG** capture works only on the currently played tier and includes the momentary real siege. The **World Atlas** exposes all 30 territories—including locked ones—and can inspect Warlord and Beast environmental setpieces, but until this update it could not export a clean raster screenshot of those layers.

The Atlas now offers a **SHARE ART PNG** button beside Zoom. It renders the currently visible image stack into an actual **960×540 PNG**, using the same decoded HTML images, with the exact original depth order:

1. The original battlefield background at 960×540.
2. The selected territory landscape at 960×346, when visible.
3. The selected Iron, Ember, Rift, or Beast boss-stage illustration at 960×540, when visible.
4. The original foreground and player knight at 960×540.
5. All three matching embroidered regional banners at 960×540, when visible.

The current original-art comparison is honored. If comparison hides biome and banners, the export includes only the original battlefield layers. Any selected boss type and *real* Warlord Phase II is preserved in the exported picture, with an unambiguous filename (for example `primal-knight-atlas-tier-17-rift-phase-ii.png`). **Pan and zoom affect only inspection; the PNG always exports the whole original native-size composition**, not an accidental cropped region.

## Mobile interaction and privacy

The artwork is exported synchronously from already decoded images within the player's original tap. If Safari is still decoding one of the scene layers, it shows **ART STILL LOADING · TRY AGAIN**, rather than generating an incomplete picture. On a browser supporting the native Share Sheet, the game offers an image file to the user. If Web Share is not supported or rejects the file, a local PNG download is offered. Cancelling the Share Sheet does not trigger a surprise download. No artwork is automatically transmitted to a third party; all file sharing is user-selected.

On any browser unable to produce a PNG because of security, memory, decoding or browser limitations, it shows **ATLAS EXPORT UNAVAILABLE** and recommends a regular iPhone screenshot. This optional, one-tap export does not run inside the live game loop, create additional game sprite Image caches, change any territory unlock, modify the active siege, or touch the original player save. It does create one short-lived export canvas on demand. No paid service or analytics is used.

## Automated regression

Added mandatory `tests/atlas-image-export.js`: true original-size layer order, 960×346 matte crop, exact boss stage layer, Phase II and locked realm filenames, original comparison, no zoom crop, incomplete decode handling, native File sharing, cancelled iPhone sharing, browser download fallback, failed PNG encoding, no exports outside the modal, and unchanged player/save storage.

Extended the existing Atlas keyboard-focus test to include the new share control. The complete quality gate now has **43 required checks** (42 gameplay/visual regression scripts plus JavaScript syntax).

## Physical iPhone gate still open

The tests do not establish a physical Safari rendering pass, Home Screen Share Sheet behavior, long-session performance, device heat, or actual pixel-art acceptability. The user can now export original, regional and boss-stage images from locked and unlocked realms for direct inspection. Continue Alpha 0.12 until physical iPhone QA passes. All 30×10,000 waves, 1,144 milestones, save structure, character economy, and the approximately 1,250-active-hour unmeasured design target remain unchanged. The locked Alpha 0.13–0.15 roadmap follows this acceptance gate.
