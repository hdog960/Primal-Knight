# Alpha 0.12.10 — iPhone World Atlas Pinch & Pan

## What changed
The illustrated, view-only World Atlas now supports genuine two-pointer pinch zoom between **1.0× and 3.0×**. Pinch scaling is anchored to the moving midpoint of both fingers: the detail under your fingers remains in place, subject to the image's safe pan limits. At any magnification above 1×, one finger can drag the picture; at full size, one-finger horizontal swipes still browse realms. The existing accessible **ZOOM IN · 1.8×** button remains as a one-tap alternative, and shows the current pinch level when magnified.

The foreground, fortress, biome-colored three-banner overlay, and 960×346 terrain painting all remain children of the same transformed 960×540 artwork wrapper. They never scale separately. Pinch gesture handlers modify only CSS transforms; no landscape SVG or banner SVG is regenerated, no battle image cache is displaced, and no gameplay or saved data is touched.

The scene captures touch input with `touch-action:none` so iPhone Safari does not hijack a two-finger artwork gesture. Other Atlas controls and content still use normal interaction. Changing tier, dismissing the Atlas, or tapping the zoom button resets the current pan/gesture safely. Cancelled touches cannot become accidental navigation. Zoom/pan limits are computed from the actual image scale: ±40% at 1.8× and ±100% at 3×.

## Quality gate
Added `tests/atlas-pinch.js`, a real game-controller VM regression for two simultaneous pointer identifiers. It checks:
- pinch scaling around the gesture midpoint, including minimum and maximum zoom;
- transition from two-finger pinch to one-finger pan and scale-aware bounded dragging;
- cancellation without accidental swipes or territory changes;
- original-art comparison, button zoom and realm switching;
- SVG source reuse, zero extra `Image` objects during gestures and preview memory release on close;
- unchanged unlocked tier, selected tier, Sigils, currency, gear, runes and achievements.

Retains all previous tests and JavaScript syntax validation, totaling **35 required checks** (34 gameplay scripts plus syntax). The old save key `primal_knight_onslaught_save_v1`, all 30 × 10,000 waves, 1,144 achievements, combat balance, and ~1,250-hour **unmeasured design target** are unchanged.

## Outstanding real-device acceptance
This update is code/CI-tested, **not physically certified** on iPhone Safari or the Home Screen install. Test pinch recognition, corner inspection of all three banner seams, portrait/landscape scroll ergonomics, sustained gameplay FPS and phone heat on an actual device before considering Alpha 0.12 Living Territories & Art complete. The locked Alpha 0.13–0.15 roadmap still follows this phase.
