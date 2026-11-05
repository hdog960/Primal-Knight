# Alpha 0.12.9 — Touch Artwork Inspector for the World Atlas

## Player-facing improvement
The World Atlas previously displayed each full 960×540 territory composition as a small picture on narrow iPhones, making it difficult to inspect banner stitching, terrain details, enemy approach lanes and original-painting alignment. Native browser pinch zoom is restricted by the game's full-screen viewport settings, and the only prior browse controls were Previous/Next buttons.

This slice makes the actual in-game art atlas suitable for visual inspection without adding a separate asset editor or changing combat.

- Tap **ZOOM IN · 1.8×** to magnify the entire illustrated composition; tap ZOOM OUT to restore it.
- **Drag the zoomed picture** to inspect its surroundings. Panning stays within bounded ±40% offsets so the image can't disappear offscreen.
- When not zoomed, **swipe horizontally** across the artwork to navigate to the previous or next tier. Vertical gestures and drags shorter than 46px do not trigger accidental realm changes.
- Changing territories always resets zoom and pan to the default full composition; opening and closing the Atlas also clears temporary inspection state.
- Existing **Compare Original Art** works at the selected magnification, making before/after differences easy to inspect without regenerating landscape files.

### Essential artwork-layer fix
The original battlefield uses four different art layers: the original 960×540 background, the 960×346 territory-painted top ground, the 960×540 original castle/hero foreground, and a 960×540 overlay carrying **all three matching regional banners**.

Scaling these four `<img>` elements independently would make the 346px top layer shift out of alignment with the 540px foreground, especially during drags. This release wraps them in a shared full-size, absolute-positioned `atlasArtwork` container and transforms **only that container**, keeping their perspective relationships fixed during any zoom/pan gesture.

All operations are CSS transforms on existing preview images, with **no additional HTTP calls, SVG generation, image decode, physics ticks or save writes**. The Atlas remains view-only even for unreached tiers.

### Accessibility
The dialog has an explicit 44px+ zoom control with `aria-pressed` and explanatory touch instructions. Tab and Shift+Tab wrap within the available modal buttons rather than escaping behind the opaque game. Arrow keys, Escape, and the original buttons keep working; full-size iPhone touch navigation coexists with normal vertical page scrolling outside the magnified scene.

## Regression acceptance
New required `tests/atlas-inspection.js` drives the actual UI controller and checks:
- all four layers wrapped together and a single 1.8× zoom transform;
- bounded pan from actual pointer coordinates and measured viewport dimensions;
- horizontal next/previous swipes without false vertical scrolling transitions;
- no realm transition when dragging magnified artwork;
- unchanged terrain/banner SVG sources during zoom;
- reset on tier change or closing;
- correct pressed-state accessibility and keyboard focus wrap;
- no changes to unlocked tier, selected battle tier, gear, currency, runes or stored progress.

The existing 33 required checks remain; adding this suite raises CI to **34 checks** (33 gameplay scripts plus syntax validation).

## Explicit limits
This is button-controlled 1.8× magnification, **not pinch-to-zoom**. It does not claim physical iPhone gesture or texture legibility testing, device thermal/battery measurements, or complete Alpha 0.12 art acceptance. The 30-tier × 10,000-wave progression, saved upgrades, battle balance, and unmeasured ~1,250-active-hour maxing target are unchanged.
