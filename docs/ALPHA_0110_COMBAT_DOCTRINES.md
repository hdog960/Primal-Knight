# Alpha 0.11.0 — Hero Combat Depth, Slice 1: Selectable Auto-Cast Battle Doctrines

## Status and phase boundary

The previous Alpha 0.10 Living Onslaught implemented 10 factions, tactical encounters, bosses, specialist counterplay, safe one-time rewards and a real Siege Chronicle, with ten automated suites green. **Physical iPhone Safari portrait/landscape gameplay acceptance is still an outstanding issue; it is not silently declared complete.** To keep development moving along the locked roadmap, this release establishes the first playable **Alpha 0.11 Hero Combat Depth** mechanics while carrying the device review forward.

## Real, mechanically distinct hero builds

The existing illustrated Hero Hall now has a new **Battle Doctrines** section with three selectable disciplines. The player can equip exactly one and the auto-battling hero activates it on a real combat cooldown; no manual combat button, repetitive menus, purchase or additional currency needed.

| Doctrine | Level | Basic cooldown | Mechanical identity | Existing synergies |
|---|---:|---:|---|---|
| **Hunter's Volley — Marksman** | 1 | 10 seconds | Fires **3 extra live tracked arrows**, which focus the highest-priority threats in range and obey the existing 48-shot cap | Quiver rank III adds a fourth shot; Aim increases volley projectile power; Quiver slightly shortens cooldown |
| **Arcane Chain — Arcanist** | 3 | 12 seconds | Deals real lightning damage to **up to 3 different enemies** with a short slow; damage enters the same actual armor, guardian, Iron Ward, boss-interruption and enemy-death calculations as other lightning attacks | Spark talents and equipped Storm runes increase power; Hail increases slow duration; Spark shortens cooldown |
| **Aegis Pulse — Guardian** | 5 | 14 seconds | Heals **1.8% of max fortress HP** (never above maximum) and pushes back **up to 3 approaching threats**, slowing them briefly; holds readiness rather than wasting the cast while the wall is full and no threat is close | Stone talents increase healing modestly, capped at +1.2 percentage points; Bulwark increases knockback up to +12px and shortens cooldown |

All abilities use the existing hero damage formula where applicable, existing projectile/effect caps, single-enemy targeting priorities and meaningful cooldowns. No damage multiplication beyond the bounded values above. The base Marksman option is available immediately; new player levels unlock the other two early.

## UI and save compatibility

- The **Hero Hall** displays each distinct ability, its unlock level, real base cooldown, synergies and a clear **EQUIP/EQUIPPED/LEVEL-LOCKED** state. These are responsive single-column illustrated cards on portrait iPhone and three columns on larger screens, using the project's existing painted battlefield artwork.
- The battle displays a compact **active doctrine + time-to-auto-cast** badge, including **READY** when an eligible cast may fire. Reduced-motion and low-refresh behavior remain as before.
- The expanded **Field Manual** explains how to configure a doctrine and how it interacts with existing training and runes.
- A new additive save preference `combatDoctrine` is written under the **same** `primal_knight_onslaught_save_v1` local-storage key. Old saves and imported legacy JSON backups default to **Hunter's Volley**. Invalid or level-locked imported selections revert safely to the starter doctrine. All owned items, one-time Sigils, 30-tier progress, First Watch and reward vaults remain intact.
- Active cooldown timers and per-run cast counts are **transient**, never saved. Each new siege begins at a 3.5-second readiness timer. Switching disciplines during a running siege cannot grant an instant free cast; the current cooldown remains and is at least 3 seconds.
- Pausing, switching away from Safari or the between-wave countdown does not spend or trigger a combat auto-cast. The after-action Chronicle now notes **actual hero auto-casts** alongside its existing battle stats without altering permanent rewards.

## Automated QA

Required GitHub Actions regression suites now number **11**: JS syntax, smoke, balance, encounters, deepwave, mobile-render, reward-integrity, first-watch-vault, siege-chronicle, boss-fairness, and **hero-doctrines**.

`tests/hero-doctrines.js` exercises the live game in a seeded browser-like VM:
- Level 1/3/5 ability gating and full real Hero Hall selection through `data-action` buttons.
- Original safe save key, exact selected doctrine backup/restore and fallback for old/invalid JSON.
- Real Hunter's Volley bullets and 48-shot budget; preventing a cast without valid targets.
- Accurate cooldowns through pause, intermission, 1× and 2× speed, and switching mid-siege.
- Real lightning damage to three enemies only, Spark + Hail + socketed Storm synergy.
- Aegis wall healing, pushback of three frontline enemies, no overhealing, no wasteful empty cast, and Stone + Bulwark synergies.
- Per-siege tally and cooldown reset, iPhone battle HUD and responsive Hero Hall.

## Next locked Hero Combat Depth slices

1. **Passive discipline socket** and meaningful trade-offs that cannot make one build mandatory.
2. **Quick loadout presets** for combat doctrine + equipment/runes, without replacing or deleting earned gear.
3. **Battle preparation intelligence** that recommends useful builds against enemy factions and warns about trade-offs.
4. **Extended balance simulations**, device-specific performance/readability QA and long-run fairness review.

These are planned scopes, not claims of completed features. The original Alpha 0.10 iPhone device review remains open, and the ~1,250-hour full-progression target remains a design target rather than a measured end-to-end playtest.
