# Alpha 0.15.29 — Keyboard skip-link focus transfer

## Implemented
- `index.html`: activating **SKIP TO GAME MENUS** now explicitly transfers programmatic focus to the existing `#nav` landmark, scrolls it into view, and updates the fragment without adding a history entry. The previous anchor alone could scroll without reliably moving focus in every browser.
- No combat, save format, economy, tier, artwork or gameplay-script changes.

## Verification
- Implementation commit: `6c5f3d82c27fa46d7f156e7fed514143d0074993`.
- Re-read committed `index.html` and exercised its actual inline handler in a JavaScript mock: click event, preventDefault, focus({preventScroll:true}), scrollIntoView, and history.replaceState all passed.
- Previous main `b367abf74e7f1320c00f3e7df36e6c1a4c1e3f01`: Pages deployment succeeded, but GitHub Actions **Primal KnIght - Onslaught quality checks** failed in the `Validate JavaScript and gameplay` step. Exact failing test remains unknown (logs not available through inspected API). This is a real unresolved QA blocker, not a passed gate.
- At implementation inspection, quality checks and Pages for the new commit were queued; do not assume they passed.

## Next work
- Obtain failing GitHub Actions log for the full Node suite and fix the specific regression before calling quality gate green.
- Verify Pages deployment for latest main, and test keyboard skip-link navigation and VoiceOver on a real browser/iPhone; mock execution is not a browser test.
- Continue the locked Alpha 0.15 roadmap; do not claim art acceptance or unlock later milestones without user approval.

## 2026-11-09 — Doctrine tactics CI regression follow-up
- At main `8d925b0f26332ee49861123bc9e8804dbdd35d04`, Actions quality run `42576666051` failed at `tests/doctrine-tactics.js:99`: an exact `0.15.27` asset-cache assertion rejected the current `0.15.29-focus-skip` stylesheet. Pages for that SHA succeeded (`42576666625`), but the quality gate did not.
- Updated the Doctrine Tactics test to check valid release-floor cache keys, matching the War Chest test's version parser. Initial edit `7fa20d0556ba757785aede16196cb3214195fea0` had an over-escaped query separator; corrected immediately in `429c5d12766f482cf3780c506c3356a1111b6a27` by copying the existing War Chest parser verbatim.
- This is a test-only change; game.js, index.html, style.css, saves and gameplay remain unchanged. At inspection, new Actions quality and Pages runs were queued/pending, NOT verified successful. Physical iPhone QA remains outstanding.
- Next: inspect the completed quality workflow log for the next specific failing test, fix it without weakening behavioral assertions, and confirm latest Pages deployment. Resume meaningful gameplay work once the CI gate is green.

## 2026-11-09 — Doctrine tactics parser follow-up
- Latest quality run `42584497838` failed at `tests/doctrine-tactics.js:103`, despite the prior patch: its `versionParts` regex accidentally used doubled backslashes inside a regex literal (`\\d`, `\\.`), matching literal escapes rather than numeric versions. This made valid current cache keys fail the release-floor assertion.
- Corrected the numeric regex literal to use `\d` and `\.` while preserving the release-floor and negative validation. Implementation commit `5752bfa4772fc521f0ecd5805c831bde64181b73`.
- Independently checked the actual current `index.html` values (`style.css?v=0.15.29-focus-skip`, `game.js?v=0.15.27`) against the corrected parser and verified stale/malformed keys are rejected. This is a focused static/parser check, **not** the complete GitHub Actions suite or physical iPhone testing.
- Prior Pages workflow `42584497126` succeeded for `916265e`; latest commit deployment and full CI must be checked. No gameplay, economy, art, save or tier changes. Next: inspect latest CI job logs; if green, resume the locked gameplay roadmap.
