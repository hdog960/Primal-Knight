# Alpha 0.12.13 — Thirty Living Skies & Battle Realm Identity

## In-game changes

The real battle renderer now uses eight carefully differentiated atmospheric patterns across thirty territory artworks: slowly drifting **mist**, long fast-moving **rain streaks**, slow fluttering **snow**, rising **embers**, drifting **ash**, windblown **dust**, floating **pollen**, and faintly shimmering **stars**. Regions of the same weather family start at different seeded positions and vary deterministically with actual game time. The already-illustrated territory matte, original Tier I landscape, layered fortress/foreground, regional banner images, enemy art and boss counterplay telegraphs remain untouched.

The existing 0.12 visual budget is protected: **one static atmospheric tint and no more than 18 pixel weather shapes per draw**. The effects use no new canvas layers, textures, particle arrays, random sampling or extra image decodes. Effects remain behind characters, projectile trails, boss staging and fortress foreground, not over warning text.

The live battle HUD now identifies the currently active territory using its **individual sky name, weather, and time-of-day light**, rather than only the tier name. It uses small, clipped text in both portrait and landscape iPhone layouts. HUD text is read-only; the realm name and weather do not grant gameplay buffs or modify enemy factions.

## Accessibility and visual modes

The reduced-motion system preference continues to draw only a static tinted background, no moving weather. Vivid/Balanced/Battery Saver settings continue to request at most 60/30/20 canvas draws a second and change weather density without affecting combat ticks. Battery Saver keeps even snow or mist visibly distinct while respecting the lower paint budget.

All weather positions are deterministic from time, tier and weather type, with a safe zero-time fallback for nonfinite timestamps. The persistent save key, all gameplay mechanics, economy, gear, skills, Sigils, 30×10,000-wave progression, 1,144 tier achievements and ~1,250-hour unmeasured long-run design goal remain unchanged.

## Automated acceptance

The new `tests/realm-weather.js` exercises the actual game script, capturing canvas draws and the real HUD update. It checks 30 distinct labels, 30 deterministic territory-seeded patterns, all eight weather types, animation over elapsed game time, reduced-motion static mode, unchanged 19-rectangle budget, compatibility with Balanced and Battery Saver, nonfinite-time fallback and absence of save mutations. This extends the mandatory regression gate to **38 checks (37 game test scripts plus JavaScript syntax)**.

## Still outstanding

Real iPhone Safari and Home Screen acceptance remains a required human QA gate: inspect the visual cohesion of scenery and three banners, verify touch/pinch gestures and the live realm badge at different sizes, and evaluate prolonged frame pacing/heat/battery. Automated rendering tests alone do **not** prove the aesthetic quality or certify physical-device thermals. Alpha 0.12 continues; locked Alpha 0.13–0.15 have not been started.
