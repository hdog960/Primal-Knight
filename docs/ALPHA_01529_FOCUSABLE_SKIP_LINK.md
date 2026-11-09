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

## 2026-11-09 — iPhone browser zoom accessibility
- Main baseline `406647e441e54072b51305b4a40abeb5758424d6` had successful quality workflow `42621963822` and Pages deployment `42621963707`.
- Updated `index.html` viewport to retain `width=device-width`, `initial-scale=1`, and `viewport-fit=cover`, while removing `maximum-scale=1` and `user-scalable=no`. This restores browser-controlled magnification for low-vision users without changing combat, saves, economy or tier progression. Implementation commit `ad26e3074bdeabef3a9e4b789fb7d4f151d9109f`.
- Extended `tests/cache-version-contract.js` with checks that the safe-area viewport remains and browser zoom is not disabled. Test commit `c55b924811f38bcebc7eb3af717bdfa799e71a2a`.
- Still required: check quality and Pages runs on latest SHA, real iPhone pinch/VoiceOver/landscape testing, and return to substantial First Watch gameplay work. No visual approval claimed.

## 2026-11-09 — World Atlas keyboard focus containment
- Baseline main `984da7a341f4442b7505a7383bf827d42a3368f8`; quality workflow `42630793750` completed successfully.
- `index.html`: while the World Atlas is visible, Tab wraps from the final available control to the first, and Shift+Tab wraps backward. Hidden/disabled controls are excluded; hidden Atlas does not intercept keyboard navigation. Existing game-owned Escape dismissal and return-focus behavior remain unchanged. Implementation commit `6f09503822da56cc70fe88cc790833b9de369be9`.
- `tests/atlas-keyboard-focus.js`: added focused production-inline-handler mock regression covering forward/backward wrapping, intermediate controls, outside focus, and closed dialog; correction commit `0bfd60113380858fee63d5890d4b8706cea4de67`.
- Not yet verified: executing the new regression with repository files, full GitHub Actions quality workflow on latest head, Pages deployment on latest head, hardware keyboard/VoiceOver or physical iPhone testing. This is a menu-accessibility change, not a combat, economy, progression, artwork or save-format change. Visual approval remains pending.
- Next: run the new regression and integrate it into required CI if not already auto-discovered; verify Pages and then resume First Watch gameplay roadmap work.


## 2026-11-09 — Portrait Battle tier picker overlap repair (awaiting visual QA)
- User-supplied iPhone screenshot showed the Tier IV illustrated vista, tier details and siege-rest preference controls overlapping, with the launch button below. Prior portrait CSS imposed a fixed 40% tier-section height and a flex-constrained milestone section while guard controls followed outside the scrolling area.
- `style.css`: in portrait, the lobby is now the single vertically scrollable surface; tier and milestone sections use natural height, tier/milestone lists no longer clip into neighboring content, and guard controls plus the launch footer participate in normal flow. This deliberately retains the existing artwork and game logic.
- `index.html`: refreshed the stylesheet cache key to `0.15.29-portrait-lobby` so installed iPhone Home Screen clients can receive the CSS.
- Implementation commits: `94d77a6a53229a08d9318e28e183d1613c0b44d3` (CSS), `729cf86b0c3595aa48f0b637b265776304c636d9` (cache key).
- QA required: browser screenshot at iPhone portrait widths with Tier IV selected, long guard labels and all rest options; check tier choice, scrolling, launch button and iOS safe areas. No physical iPhone test or visual acceptance claimed. Verify Actions and Pages on the final head. No save, reward, combat or progression changes.

## 2026-11-09 — Portrait siege guard containment follow-up
- Main before this slice: `d9de9618f4d706069eaf8cef53a7331b630391bc`; release banner still Alpha 0.15.27. User's iPhone capture showed overlapping Tier IV preview, milestone and rest settings.
- `style.css`: added narrow portrait containment for tier/guard regions, bounded territory preview, wrapped long rest-option labels, and a 44px minimum rest-button touch target. Retains the earlier single-scroll lobby repair. Implementation `6388ba10597e13e1cac0ca9ad8070c3821cf795a`.
- `index.html`: changed stylesheet key to `0.15.29-portrait-guard` for installed Home Screen refresh. Commit `00a5be20b2e9f3b7692d03a5ae5ed3f71a7be5d1`.
- **Verification pending:** full Node regression suite, GitHub Actions and Pages status on latest SHA, actual iPhone portrait screenshot/scroll and rest-button interactions. Source edits are not visual acceptance. No changes to battle, currency, save format, tiers or earned rewards.
- Next: inspect latest CI/Pages, then visually check Tier IV at 320–430px widths and correct remaining layout issues before considering this screenshot defect closed.
