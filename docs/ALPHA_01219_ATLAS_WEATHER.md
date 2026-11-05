# Alpha 0.12.19 — Battle-Accurate Weather in the World Atlas

## Actual in-game art change

The Atlas previously displayed scenic backgrounds and boss-stage silhouettes but **omitted the atmosphere that the real battle canvas adds**: tier-specific light tint and the actual rain, snow, mist, ash, embers, pollen, dust or stars. That made exported PNGs less representative of what a player sees during a siege.

The Atlas now includes an optional **PREVIEW WEATHER** button, accessible across all thirty realms, including locked ones. It invokes the **same original `drawTerritoryAtmosphere()` painting routine** used in live siege combat and converts its real canvas rectangles into one very small, transparent 960×540 SVG for the currently selected realm. The sample is frozen at twelve seconds of game animation: it has a real seeded weather layout, but no running timers, periodic DOM repaints, extra combat texture decodes, or thermal overhead from animation while the Atlas is open. Every new tier changes its tint and particle layout to match its corresponding live battle.

The layered composition is now:

1. Original 960×540 battlefield.
2. The 960×346 territory painting when enabled.
3. **Optional real weather and light** at native 960×540.
4. Any original Iron, Ember, Rift or Beast boss-stage silhouette.
5. Original fortress, red-cloaked knight and battlements.
6. Three territory heraldic banners.

In its default OFF state, the Atlas looks like Alpha 0.12.18, preserving the established artwork inspection workflow. The toggle remains selected while switching realms, but resets on closing/reopening the Atlas or entering a siege. The original-art comparison hides optional regional weather alongside terrain, banners and boss-stage artwork. Weather's status text identifies the current family, confirms it is a frozen combat sample, and respects the system's Reduce Motion preference (static color tint only). The preset Vivid/Balanced/Battery Saver controls are honored when creating the sample, so lower graphics settings still have fewer ambient marks.

The existing **SHARE ART PNG** includes the weather layer in its correct position when enabled, and adds **-weather** to the filename so users can distinguish it from the clean illustration. Zoom/pan only affects inspection and does not crop the exported file. No weather PNG can be exported before a necessary SVG has finished decoding, avoiding a misleading partial composite.

## Safari display fix

Earlier `.atlas-scene img { display:block }` CSS could override the browser's default `hidden` display rule. This release explicitly sets `.atlas-scene img[hidden]{display:none!important}`, ensuring original-art comparison, unselected boss art and weather OFF really hide their corresponding overlays on physical browsers, rather than only looking hidden in JS tests. This also protects the fidelity of exported images to what is visible in the viewer.

## Quality gate and compatibility

New required `tests/atlas-weather-preview.js` checks all 30 deterministic samples, all eight weather families, the **exact real battle paint rectangle inputs**, correct six-layer export ordering with boss Phase II, original comparison, 960×540 weather SVG and PNG positioning, filenames, pinch/zoom non-regeneration, Reduced Motion, low visual settings, invisible-layer CSS, lifecycle cleanup and unchanged player saves. Atlas keyboard-focus coverage also includes the new toggle. **44 required checks** (43 gameplay scripts + JavaScript syntax).

All 30×10,000-wave tiers, 1,144 one-time achievements, original rewards and save key `primal_knight_onslaught_save_v1`, gear, runes, combat mechanics and ~1,250-hour **unmeasured design target** remain unchanged. No cloud analytics, subscriptions, paid downloads or external services were added.

## Outstanding physical-device acceptance

The static sample and automated canvas checks make artwork review more representative, but **real iPhone Safari/Home Screen acceptance remains outstanding**: verify the actual pixel art, all three banner seams, pinch/zoom controls, Share Sheet, memory usage, and long-session heat and battery. Alpha 0.12 remains open until those observations are available. The locked Alpha 0.13–0.15 roadmap remains preserved.
