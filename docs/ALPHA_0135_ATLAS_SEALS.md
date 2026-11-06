# Alpha 0.13.5 — Atlas Seals
**Locked roadmap:** Exploration & Rewards (slice 6). **Manual physical-iPhone acceptance:** deferred by player direction through completion of the Alpha 0.15 development roadmap.

## Exploration now has a long-term mastery finish line
Each of 30 existing territories contains six independently earned SCOUT exploration accomplishments:

1. Lost Signal at wave 47 (real guardian defeat, no breach).
2. Lost Signal at wave 147.
3. Lost Signal at wave 347.
4. Lost Signal at wave 747.
5. Cartographer's Oath across waves 1,001–1,003 (three genuinely consecutive breach-free victories).
6. Echo Return at wave 117 (two real marked kills, no breaches, at least half wall HP), unlocked only after reaching wave 250 and revisiting the earned wave-100 checkpoint.

Completing all six existing, finite accomplishments from one territory grants its **Atlas Seal**. There are **30 permanent seals**, one per territory, each with a distinct cosmetic **Atlas Keeper of [realm]** banner and a small, permanent +0.25% multiplier to *both* real Hero damage and maximum fortress wall HP. With all thirty seals, both bonuses cap at **+7.5%**. This is a gradual long-run incentive to revisit earlier territories to close unfinished secrets. It introduces **no new monster, paid item, Primal Sigil or endlessly farmable currency**. Unlike active Explorer set bonuses, the seals are global and cannot be stacked repeatedly within one tier.

The actual Battle Explorer's Charter presents a sixth-piece mastery ledger **0–6/6**, explicit missing Lost Signals / Cartographer / Echo markers, and a sealed visual treatment. Battle tier selection marks mastered territories, and Hero Hall explicitly reports total seals and real damage/wall percentage.

## Save safety and veteran fairness
The additive `atlasSeals` dictionary is stored in the original localStorage character save under `primal_knight_onslaught_save_v1`; it is validated as an object on backup import and normalized for older saves. `reconcileAtlasSeals()` checks *actual preexisting exploration ledgers*; if a fully earned older character has all six completed, it automatically awards its missing Atlas Seal and banner at launch and on progress-import, with no requirement to repeat the accomplishments. Missing prerequisites make inconsistent imported seal flags invalid, rather than awarding unearned passive power. The same reconcile routine preserves a missing banner for a legitimately mastered realm, and runs idempotently. During real combat, it awards the just-finished seal only after the existing Lost Signal, Oath and Echo Return grant logic completes.

**None of the old 1,144 milestone claims, Sigil totals, equipment, runes, XP, currencies, wave records, 30 × 10,000-wave goals, or 1,250-hour unverified balance target are reset or paid again.** 120 Lost Signal heirlooms, 30 Cartographer rune/banner rewards, 30 Echo rings, 90 Ancestral Keepsakes, all original boss encounters and combat roles remain as before.

## Verification and limitations
`tests/atlas-seals.js` covers all 30 realms, genuine sixth-flag completion through real wave-117 combat, no premature seal at 5/6, deterministic 30-banner identities, actual Hero damage and fortress HP, numerical 7.5% cap, repeat prevention, cosmetic/Charter/Hero Hall updates, current progress backup and legacy-save automatic backfill, rejection of invalid imported ledgers, and unchanged original Primal Sigils. The complete release workflow requires **59 checks including `node --check game.js`**, and all prior suites remain mandatory.

Testing on an actual iPhone (portrait/landscape art, touchscreen affordances, Safari Home Screen, Share Sheet, 30-minute performance/battery/thermals) has **not been performed** and is explicitly deferred until the locked Alpha 0.15 development roadmap is completed. Alpha 0.13 remains open to further depth and revisit refinement after this slice.
