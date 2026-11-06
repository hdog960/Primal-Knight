# Alpha 0.12.25 — Breach Readability and Frontline Threat Focus

## Gameplay-facing visual changes

When at least one living, positive-HP enemy crosses world canvas y=365 during active fighting, the current encounter ribbon switches its small hint to a **real wall threat** report. The game already declares actual fortress breaches beyond world y=430; the two readings therefore describe the last 65 world-coordinate units without inventing ETA estimates.

The banner selects the most advanced (highest-y) living threat with stable arrival-order ties, categorizes its real x position as **LEFT** (x<370), **CENTER** (370≤x≤590) or **RIGHT** (x>590), and reports how many foes have reached the wall approach. From y=365 the banner says **BREACH WATCH**; from y=395 it says **BREACH IMMINENT**. The single chosen field enemy gains a static high-contrast caret and warm ground ellipse painted directly after its sprite—without loading textures, allocating images, adding animations or creating an overlay that hides the battle.

Any active existing sapper-fuse, boss-windup, rift-blink, frost or thorn cast continues to take precedence in the encounter ribbon and suppresses the frontline marker. Boss-phase and specialist bars are unchanged. Dead enemies, defeated foes, completion and intermission clear the marker. The effect changes no movement, damage, HP, AI priorities, reward formulas, boss mechanics, finite Sigils, 30 tiers/10,000 waves, or `primal_knight_onslaught_save_v1`.

## Quality gates and physical acceptance

Required `tests/breach-readability.js` exercises the actual gameplay source, real HUD and painted enemy marker, exact threshold/lane boundaries, stable tie behavior, dead enemy exclusion, boss cast priority, intermission cleanup, native waves, iPhone asset version and save isolation. The full gate now has **50 checks including syntax validation**.

Physical iPhone artwork acceptance remains outstanding: review the high-contrast marker in portrait and landscape during dense battles, confirm it does not obscure other cast circles or health bars, and complete physical-iPhone FPS/thermal/battery assessment with the previous device instrumentation. Do not claim the device has been tested until a real review is supplied. Locked Alpha 0.13–0.15 remains unchanged.
