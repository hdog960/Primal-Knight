# Alpha 0.12.15 — Shareable Battlefield Artwork Snapshot

## Why this slice exists

Alpha 0.12's thirty territory landscapes, layered fortress and regional banners need **actual iPhone screenshots** for final quality acceptance. Existing simulated drawing tests cannot prove whether the art looks coherent on a real Safari/Home Screen device. This release adds an *in-game*, opt-in way to export the **actual rendered 960×540 battlefield canvas** as a PNG so art issues can be reported and compared without a desktop inspector or manually cropping the surrounding battle HUD.

## In-game behavior

Players can tap **SHARE BATTLEFIELD PNG** from Settings or open the existing **FPS** Device Check and tap the same button. The game paints its current territory image, three aligned fortress banners, hero/creatures, projectiles and weather directly to the existing game canvas, then immediately encodes that canvas as PNG.

The browser's native **Share** sheet is used when file sharing is supported (including eligible iPhones). From there the player—not the game—chooses Files, Photos, AirDrop, a message, or another destination. On browsers without suitable file sharing, the game attempts a local PNG download. A dismissed Share sheet does not trigger a surprise download. If the browser blocks the export, a plain-language toast recommends using a normal iPhone screenshot. No server, analytics service, background upload or connector is used.

The saved file follows `primal-knight-tier-XX-wave-YYYYY.png`. Capturing the **Canvas** intentionally excludes the HTML HUD and panels, while keeping the artwork at native 960×540; players should take a regular iPhone screenshot if they specifically want to report overlays or controls. The capture does not change the currently selected/unlocked territory, wave timers, earned rewards, active enemies, persistent progress, or the original save key. It performs just one manual redraw/PNG encode when requested, never one per frame.

## Regression and compatibility

Added `tests/battlefield-snapshot.js` to run the actual game/controller under a mocked DOM and canvas, validating fresh drawing, correct file names, a native Share Sheet with a real PNG file, local fallback, cancel/no surprise download, graceful blocked capture, Settings/FPS entry points, and no player-save mutations. Added to the required GitHub Actions quality gate for a total of **40 checks** (39 game test scripts + JS syntax).

All thirty 10,000-wave tiers, 1,144 finite rewards, economy, equipment, combat doctrine and original art are unchanged. Source remains static and iPhone-first, no external dependencies.

## Remaining physical acceptance

**Alpha 0.12 remains open.** This automated feature is not evidence that Share Sheet permissions, image downloads, touch pinch, banner art quality, or long-run thermals are working on actual iPhone hardware. Test in Safari and the installed Home Screen app, review several extracted PNGs (especially the central banner at multiple tier colors), and compare 60/30/20 draw profiles. Locked Alpha 0.13 Exploration & Rewards and onward still follow physical acceptance.
