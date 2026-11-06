# Alpha 0.14.1 — Persistent Siege Chronicle
**Locked roadmap:** Long-Run Quality of Life, slice 2. **Physical iPhone acceptance:** explicitly deferred until development through Alpha 0.15 is complete.

## Persistent, truthful run history
Before this update, the established Siege Chronicle reported defeated enemies, waves, combat doctrine timings, boss strikes and breaches, but only **within the current browser session**. Starting a new sortie erased it. Alpha 0.14.1 reuses those exact real-engine end-of-siege counters and adds a **persisted recent-24-entry journal** to the original character save. Records are added once per **actually player-launched** siege ending: retreat, fortress destruction or a genuine 10,000-wave victory. Multiple finish callbacks on the same sortie cannot create a duplicate. The next launch arms a new record; a synthetic report without a launched siege is not saved as history.

Each archived entry reports: territory, starting wave, last reached wave, outcome, waves cleared during this sortie, enemies killed, bosses beaten/escaped, boss and specialist casts broken, wall breaches, sapper sabotage, automatic doctrine casts, and a locally observed finish date. These are **per-run** counters and must never be described as complete lifetime totals. Repeated enemy or wave farming remains subject to all original economy rules.

## Real newly earned progress
At the moment the player starts a real siege, a lightweight snapshot of previously earned *finite* progress is captured: first-ever wave clears, claimed tier milestones, Lost Signals, Cartographer Oaths, Echo Returns, and Atlas Seals. When the run ends, the journal stores the nonnegative difference between those ledgers. It displays only what was actually **newly achieved in that run**; no achievements, Sigils, loot or power are minted by writing or reading the journal.

A collapsible **Siege Archive** appears inside the Battle territory lobby, filtered to the chosen tier, and in Settings with all territories together. Records are shown newest first, with bronze/teal fantasy styling and touch-readable collapsed headings. The archive remains lightweight and is not drawn in the 60Hz battle canvas.

## Save integrity and privacy
An additive `siegeHistory` array (24 records at most) plus a numeric `siegeHistorySeq` extends the **same original plain JSON character save and same `primal_knight_onslaught_save_v1` storage key**. This is not cloud sync, paid storage, telemetry or additional achievements. Current JSON exports include the archive automatically; the Alpha 0.14.0 checksum-verified rolling checkpoint protects it like other character fields. Earlier saves **correctly contain no historical run records**: no prior sessions are fabricated. Imported archives are normalized to a small whitelist of numeric fields, fixed result types and real 1–30 / 1–10,000 tier-and-wave bounds, and limited to 24 entries. They are informational only and cannot authorize unlocks. Inventory, permanent upgrades, buffs, Sigils and the 1,144 finite achievements remain unaffected.

## Automated verification
`tests/siege-history.js` tests real tier-1 wave-20 milestone and unique-clear accounting, actual retreat persistence, multiple finish calls, real short/zero-clear attempts, 24-run rollover, ID ordering, selected-tier and all-tier presentation, original localStorage retention, current and legacy JSON backup/import, hostile malformed history records and no accidental economic rewards. Original checks remain required; **62 total automated checks including JavaScript syntax**.

Still in locked Alpha 0.14: save/migration hardening, safe speed and automation options, detailed earned-progress navigation and higher-wave waystone quality of life. The roughly 1,250-hour completion goal remains **unmeasured**, and no real iPhone Safari/Home Screen art, touch, battery or thermal acceptance was performed.
