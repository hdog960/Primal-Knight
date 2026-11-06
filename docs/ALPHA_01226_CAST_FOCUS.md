# Alpha 0.12.26 — Single Spell-Threat Focus Beacon

## Actual battlefield improvement

The existing combat HUD already announces the highest-priority interruption warning (sapper fuse, Siege Beast crusher, warlord ember/void/iron, riftstalker blink, frostbinder rite or thornweaver ward). On an iPhone screen, however, the specific target could be difficult to locate in a dense vanguard. This release annotates **the one actual enemy** the existing warning refers to.

The `activeEncounterThreat` ranking and wording are unchanged; it now also returns the corresponding enemy reference and cast type. The existing `refreshHUD` sets a transient `castFocus` pointer (not a new saved field). The single qualifying enemy is drawn with a static color-coded bar above its sprite and a small elliptical ground ring. There are eight role/attack colors and no additional asset downloads, animations, timers or new HUD panel. The beacon renders only while the actual corresponding spell/ward timer is finite and positive, the enemy is living, and the battle is active. This removes stale indicators immediately after a successful interruption, even before the next 160ms HUD refresh.

The previous Alpha 0.12.25 near-wall breach pointer is suppressed while an interruptible cast is the higher-priority threat; its existing behavior resumes automatically when there is no active spell. The live boss/specialist countdown bars, boss phases, player damage, attack targeting, AI timing and all current mechanics are unchanged.

## Automation and pending real-device review

Mandatory `tests/cast-focus-beacons.js` executes the original game in a Node VM, exercises all eight real spell types, strongest-attack selection, tie/depth ordering, exactly one painted marker per active cast, immediate cancel cleanup, near-wall fallback, ended-wave cleanup, cache-busting iPhone version and no saves. **51 required checks** include JavaScript syntax plus all 49 previous Node suites.

Physical-device verification remains outstanding: confirm actual small-screen icon clarity and contrast in portrait/landscape with a physical iPhone, prolonged 30-minute endurance review, battery/thermal observation and touch/Share Sheet behavior. Keep Alpha 0.13 Exploration & Rewards and locked 0.14–0.15 milestones unchanged. The 1,250-hour target is still an unmeasured design target.
