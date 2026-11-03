# Alpha 0.10.3 — Living Onslaught, Slice 4: Readable Encounters & Reward Integrity

This is a focused slice of the *locked* Alpha 0.10 Living Onslaught roadmap, not permission to move ahead to the 0.11 Hero Combat Depth phase. Keep the original auto-siege experience, 30 independent tiers, 10,000 waves per tier, 1,250-hour **design target** (unverified), First Watch onboarding, one-time milestone economy and earned-only currencies.

## New and improved real gameplay

- **Live major-boss HUD:** While a chapter Warlord or Siege Beast is alive, the battlefield shows its real name, health percentage/bar, current phase and a brief readable attack warning (Crusher windup, Iron Ward, Ember charge, Void Step). It disappears outside the active battle, avoiding menu clutter. The existing encounter banner and objective indicator stay separate.
- **Relic Warden:** Every rare Relic Hunt has one guaranteed, visible Guardian-type keeper carrying the relic. The keeper is sturdier (~1.75× standard Guardian health) and slightly slower, with a distinct gold rune/ground aura, HP bar and encounter label. Standard supporting soldiers remain around it; the existing zero-breach optional challenge applies to the entire encounter.
- **Standard Assault:** An additional rare battle category (wave >= 50 and `wave % 113 === 61`, unless overtaken by a higher-priority chapter/commander/elite event) fields a recognizable blend of Bannerets, Guardians, Raiders, Shamans and Skeletons. Enemy types retain live cap rules. Winning yields +20% normal *wave Gold*, with no bonus Sigils, no finite achievement farming, no new currency.
- **Relic Vault / no lost rewards:** A successful zero-breach Relic Hunt always claims exactly one earned rune. If the normal rune inventory has 240 runes, the rune is queued in `p.pendingRelics` rather than permanently lost. In Gear → Rune Workshop, a visible claim panel retrieves queued runes when space is available. All claims are serialized into existing local-save export/import; replaying the same Relic Hunt does not queue or pay a second reward.
- **Accurate tier guidance:** The Battle tier lobby now shows the chosen territory's actual next-tier unlock wave (20/100/150/250), instead of a fixed misleading "wave 20" label. The last tier correctly indicates the 10,000-wave objective.

## Technical contracts

- Do not replace or migrate away from the storage key `primal_knight_onslaught_save_v1`.
- `pendingRelics` is a new **additive** field with a safe empty-array default for old saves. No changes to owned equipment, Training, Ascension, Sovereign Oaths, Crests or the `relicHunts` achievement ledger.
- The maximum live spawn limit remains **24**, shots **48**, particles **140**, combat floats **28**. No external packages, servers, paid service or live analytics.
- Automated verification: `node --check game.js`, `node tests/smoke.js`, `node tests/balance.js`, `node tests/encounters.js`. The latter tests boss HUD feedback, distinct Relic Warden and Standard Assault enemy spawning, reward queue, anti-duplication and bounds.
- Physical iPhone visual/play performance remains a follow-up acceptance check. In particular, confirm boss bar readability in landscape and portrait, Rune Vault retrieval UI, and whether the Warden's aura is distinct from standard shield-bearers.

## Remaining 0.10 criteria

Review how boss phases feel during extended combat, expand rare encounter variety only when it adds real gameplay, observe long-wave pressure and fairness, and complete physical iPhone validation. Do not describe Alpha 0.10 as complete until those are assessed. Then advance to the previously locked Alpha 0.11 Hero Combat Depth direction.
