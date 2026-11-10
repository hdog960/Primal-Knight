# Alpha 0.15.27 — Pioneer Sweep: Honest first-clear targeting

## Real progression result
Alpha 0.15.26 passed the complete 95-check source-engine suite and demonstrated a truly earned seed-15423 First Watch Chapter XII, 506 distinct first clears after 110 original-price siege attempts, 99 first clears remaining for Chapter XIII's 605-wave gate, and Tier XVII unlocked through a real wave-20 milestone. The Tier XVII-only path reached only wave 24 after 20 more attempts. Chapter XIII and Tier XVIII have not been earned.

## New player-facing game behavior
Under the existing Veteran Watch Record Stretch, add a **Pioneer Sweep** panel with a single large tap target for a defensibly selected, legitimately already unlocked territory. The suggestion uses original saved per-tier record and actual earned milestone waystones, preferring paths with fewer already-completed waves to replay. It avoids recommending a tier when the latest *two genuinely measured*, original-engine archived sorties in that tier earned zero first clears and an alternative exists. Legacy or incomplete siege records do not count as verified zero-clear failures. This is a navigation aid, not an AI prediction of success, no autonomous combat, currency, items, wave clears, chapters, or unlocks. Selecting the suggestion uses the existing guarded saved tier selection, keeping mobile scroll stable. No character-save schema fields.

## Deeper actual-engine progression
Continue the same genuinely earned seed-15423 original-price character after 24 existing backtracking sieges with **12 more fully simulated original combat sorties** using the Pioneer Sweep's real tier choices. Verify earned costs (normal original Essence), live combat seconds, source-completed waves, original unique-clears best-by-tier, finite Sigils, saved-game continuity, and the Tier XVII wave-100 gate. If Chapter XIII ever awards, confirm original requirements of 403 minutes plus 605 unique first clears. Report genuine progress even if it stalls, without inventing victories. The extra test work may increase total CI runtime.

## Release bar
96th mandatory regression checks original source player UI, untried-vs-stalled rules, legacy unmeasured history, no reward mutation, locked-tier rejection, active selection and save persistence, 48+px iPhone target and no fake Watch completion. Existing 95 tests remain; release only after final-head PR green checks, independent merged-main checks and matching GitHub Pages deployment. All 16 Watch chapters, later Tier XVIII–XXX, 10,000 waves each and 1,250-hour target remain unverified. Physical iPhone review deferred as requested.

## 2026-11-10 — Route evidence visibility
- Battle's Pioneer Sweep now displays the count of archived sorties and the actual number of qualifying measured pressure records (0–2). One or zero measured records explicitly states evidence is insufficient to rule out a stall; two records without both zero clears are not labeled a proven success. If all candidate routes have measured zero-clear stalls, the panel warns that all routes may be stalled.
- `game.js` implementation `0ce7c41b651f06b9e6291e68b8d4fe2056ed2eda`; regression assertions in `tests/first-watch-pioneer-sweep.js` commit `a2cf65b132273e11bdea301506bf0630def9037e`.
- No route-selection formulas, combat, save fields, currency, earned tier unlocks or First Watch awards changed. CI and Pages on final documentation commit must be checked separately; real iPhone Tier IV overlap/visual approval still pending. Next: verify complete workflow and live deployment, then pursue earned progression/First Watch and real mobile QA.

## 2026-11-10 — Pioneer Sweep Watch time-gate clarity
- The Pioneer Sweep card now shows remaining **active combat minutes** for its actual First Watch chapter, or confirms the time requirement is met. It reuses the existing Watch gate calculation; no invented progress or new save field.
- `game.js` and `tests/first-watch-pioneer-sweep.js` updated, with regression assertions for both met and unmet time gates. No combat, rewards, wave or tier unlock changes.
- Full CI, Pages publication and real iPhone layout remain separate verification gates.

## 2026-11-10 — Shortest-replay recommendation correction
- Fixed a recommendation-order defect in `game.js`: Pioneer Sweep previously bypassed the shortest legitimate earned-waystone replay whenever that territory was already selected, even if the alternative required substantially more previously completed waves. It now prefers an unselected non-stalled alternative only when replay distance ties the best eligible route. A selected best route remains visible as already prepared, with no battle or save mutation.
- Source implementation commit `35a06546b6e3cef77f8400d484f6f544a66eb3bd`; regression assertion in `tests/first-watch-pioneer-sweep.js` commit `bb4e5ac927892c38ac95f82e2739fa15ef466b65`.
- Source syntax was checked in the JavaScript tool runtime; full Node regression, latest-head Actions and Pages deployment must be verified separately. No combat formulas, First Watch gates, tier unlocks, rewards or save fields changed. Tier IV mobile visual acceptance remains pending.
