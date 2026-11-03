# Alpha 0.10.6 — Living Onslaught, Slice 7: Battlefield Formations & Threat Clarity

## Purpose
Special waves should feel recognizably different in the real illustrated battlefield, not just show another label. This release introduces **actual distinct enemy entry positions**, actionable **live danger warnings**, and true **pause-safe combat simulation**. The automatic hero and high-quality established pixel sprites remain the game's visual center, with no extra enemy variants, map assets, tiers or added menus.

## Features
- **Night Ambush:** enemy soldiers enter from left and right outer battlefield flanks, with a moderate, fair head start. Approaches remain bounded away from fortress breach line.
- **Standard Assault:** standard bearers rally behind a central shield line; raiders approach from wider flanks, supported by Shamans and other soldiers.
- **Arcane Convergence:** Frostbinders, Shamans and Thornweavers appear in rear casting lanes while Guardians form a forward screen. The previous shared three-active-caster safety cap and 18% Knowledge bonus remain unchanged.
- **Relic Hunt:** the uniquely gold-marked Warden enters centrally with shield escorts on both sides; the one-time Relic Hunt reward is unchanged.
- **Chapter Boss / Siege Commander:** large bosses enter the center of the battlefield. A chapter boss's limited second-phase reinforcements arrive on opposite flanks, inside the existing 24-enemy hard cap.
- **Ordinary Patrols:** retain their original randomized entry positions for visual variety and unchanged early tutorial pressure.

**Live tactical warnings:** the existing battle encounter ribbon now temporarily announces *actual active mechanics* (Sapper fuse, Siege Beast crusher, Cinder charge, Void Step, Riftstalker blink, Frostbinder cast, Thorn Ward, Iron Ward). When no significant cast is underway, ordinary encounter/reward advice returns. The warnings use concise, stable, no-countdown text and a warm alert treatment rather than introducing a new bulky panel or animation.

**Pause discipline:** a stopped siege no longer advances enemy spawning, wall damage, intermission time, or active in-game battle time while paused. This corrects an edge case where zero-delta loops could still execute spawn/combat logic.

**Field Manual:** existing expandable Battle codex now explains special arrival patterns and live warnings, without creating a new persistent UI tab.

## Locked constraints preserved
- Single hero, fully automatic fighting, one wall, and independent Tier I–XXX progression; 10,000 waves per tier.
- Existing reward currencies, Sigil finite milestones, Relic Vault, First Watch onboarding, boss counters and rune inventory.
- The original local save key `primal_knight_onslaught_save_v1`; **no new persistent save fields**.
- Boss maximum phase-II reinforcements: 2, within 24 live/spawned enemies. No new projectiles, VFX pools or combat timers.
- Unchanged underlying enemy stats and special-wave payout; only arrival *positions*, warning visibility and pause behavior changed.
- The 1,250-hour completion duration is still a design goal; not verified by play.

## Automated checks
```sh
node --check game.js
node tests/smoke.js
node tests/balance.js
node tests/encounters.js
```
New regression checks verify real formation placement and flank separation across special waves, bounded and safe start distances, automatic spawn application, priority of genuine dangerous casts in the live HUD, death/recovery fallback, boss threat labels, and pause/unpause behavior for both battle and intermission.

## Remaining release acceptance work
Physical iPhone Safari / Home Screen readability, landscape and portrait layout verification, frame rate/performance on very deep waves, and actual player tuning of movement patterns and boss counter windows. **Do not close the overall Alpha 0.10 Living Onslaught phase or advance to Alpha 0.11 Hero Combat Depth without these acceptance checks.**
