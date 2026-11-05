# Alpha 0.12.16 — Region-Matched Boss Battlefield Setpieces

## Real playable art update

The eight little side lights added in early Alpha 0.12 did not provide distinctive boss atmosphere. This slice preserves those existing lights and adds **four different styles of illustrated environmental setpiece**, selected from the actual live boss enemy state:

- **Iron Warlord:** fragmentary paired stone watchtowers and wall courses.
- **Ember Regent:** dark beacon braziers with restrained embers.
- **Rift Warlord:** split obelisk fragments with faint arcane inscriptions.
- **Siege Beast:** fractured earth and gouged, churned rubble.

The 30 illustrated territories determine the **actual materials and colors** of these motifs through their existing 13 terrain biome palettes. An iron watchtower in the Frost realm therefore inherits frosty materials, while the same structural style in Ash or Ruin has different lighting and stone. The setpieces appear only while a real commander/chapter boss is actively alive and battling. Their intensity rises slightly in a genuine boss phase II, never from a fake milestone.

All ornaments occupy the distant **outer-left and outer-right scenery margins**. None cross the central enemy marching causeway, the original main hero, the three fortress banners, warning arcs or the boss health panel. The existing draw order is unchanged: illustrated terrain → weather → boss setpiece → enemies and telegraphs → original fortress → heraldic banners → shots and combat feedback.

## Rendering and accessibility budget

Each active boss now requests a **fixed 32 small canvas rectangle marks**: the original eight light flecks plus 12 static brush marks on each side. Four predeclared pixel-brush templates are reused rather than allocating textures, creating per-frame SVGs, doing extra image decoding or adding animated particles. Regular waves draw zero boss-stage marks. Reduced Motion disables the time-based light shift and retains the static shapes. No full-screen flash, camera shake, input hitbox, gameplay attack or boss counterplay mechanic was introduced.

## Tests and compatibility

A new `tests/boss-stage-art.js` exercises all four styles through all 30 realm palettes, verifies deterministic fixed-time composition, static Reduced Motion, stage bounds outside the combat lane, phase II change, real canvas depth ordering and 50 repeated redraws without added images, enemy mutations, new storage fields or rewards. The older `tests/territory-relics.js` has been updated to protect its eight historic lights **and** the new bounded 32-mark stage instead of incorrectly requiring exactly eight marks.

Alpha 0.12.16 requires **41 checks total** (40 gameplay scripts plus JavaScript syntax). The existing `primal_knight_onslaught_save_v1` key, 30×10,000 waves, 1,144 tier achievements, First Watch, all skills, relics, currencies and the approximately 1,250-active-hour design target remain unchanged.

## Remaining real-iPhone acceptance

Actual device art approval (especially all three embroidered banners), pinch and Share Sheet behavior, long-session battery/heat and true responsiveness are still unverified on physical iPhone Safari/Home Screen. This patch does **not** mark Alpha 0.12 complete or unlock work on the locked Alpha 0.13–0.15 roadmap.
