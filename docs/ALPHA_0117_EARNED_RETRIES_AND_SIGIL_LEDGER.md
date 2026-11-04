# Alpha 0.11.7 — Earned Retry Laboratory + Finite Sigil Ledger

## Development goal
Continue Hero Combat Depth using actual earned resources, without pretending directly maxed test profiles prove completion times or game balance. Preserve the fixed 30 tiers × 10,000 waves and the ~1,250-hour **design target**, which is still not measured playtime.

## Multiple-attempt First Watch QA
`tests/earned-retries.js` builds nine separate, fresh level-one accounts from the real game. For each of three deterministic random seeds and three upgrade policies (Might-focused, Guardian-focused, balanced), the player repeats up to four actual continuous sieges. Between attempts, earned Essence purchases real permanent Training ranks at the existing price and earned Gold may buy the existing Ballista; levels and skill points are granted only by battle.

Checks: original starting gear/runes persist; saved character progress never decreases; repeat waves can pay normal currency/XP but never duplicate first-clear rewards, milestone Sigils, or unique victories; no forged wins, XP, coins, or enemy stats; mobile actor caps, per-wave timeout and defensive numbers remain finite.

These test routines are **scripted player policies**, not human behavior. They cannot establish typical progression time. Their descriptive output reports each real attempt's clears, character levels, and earned investment.

## New player feature: Primal Sigil Ledger
The **Power → Training** screen now includes an optional collapsed `PRIMAL SIGIL LEDGER` with a dark-forged parchment design and mobile-friendly layout. It counts:
- Currently held Sigils from the real player save;
- Unclaimed one-time milestone Sigils across the actual 30-tier milestone tables;
- Unclaimed First Watch Sigils from the real sixteen-chapter ladder;
- The portion of unclaimed tier rewards in currently unlocked versus still locked tiers;
- The **exact remaining cost** to max all Legacy, Ascension and Sovereign Oath ranks, summing the actual rank-dependent cost formulas.

Crucially, the ledger labels future awards as a hypothetical, **not-yet-spendable** upper bound requiring actual wave victories. It does not auto-spend, grant currencies, unlock territories, increase stat caps, change save format or assert that every rank can practically be earned.

`tests/sigil-ledger.js` independently sums real milestone amounts (including the different century-boss Sigil grant), compares totals with the real ledger and First Watch chapters, verifies no repeat-claim supply increases, verifies actual Legacy/Oath purchases shrink both held capacity and remaining-rank cost by the same price, and asserts real UI/asset availability.

## Unchanged
The release does not change combat damage, healing, enemies, special waves, boss counters, ability cooldowns, original in-game prices, currencies, finite Sigil rewards, save key (`primal_knight_onslaught_save_v1`), 30 tiers, 10,000 waves per tier, or the locked Alpha 0.12–0.15 roadmap.

## Acceptance and follow-up
- All previous 17 mandatory scripts plus two new scripts must pass before merging.
- Review actual repeated-attempt observations; if easy/difficult, distinguish tested automated conditions from real-player conclusions.
- Review finite Sigil supply relative to remaining Legacy/Ascension/Sovereign costs, and avoid claims about real time-to-max.
- Physical iPhone Safari / Home Screen portrait and landscape visuals, frame pacing, and thermal QA remain open.
- Hero Combat Depth phase is **not complete** merely because the economic accounting passes.
