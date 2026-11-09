# Primal Knight — CI territory atmosphere cache regression (2026-11-09)

## Observed
- Before this change, main was `6e8e0191b294e1f441c33ad5c753d49805a9cce8`.
- GitHub Actions quality run `42598260884` failed in `tests/territory-atmosphere.js:69`: `iPhone Home Screen asset cache identifiers are updated`.
- The test demanded exact `style.css?v=0.15.27` despite live HTML's valid `style.css?v=0.15.29-focus-skip` and `game.js?v=0.15.27`.

## Change
- Implementation commit `eec075dee9d0ea3b049003edc5231a8d6291b40f` changes only the territory atmosphere test's asset-cache assertion.
- It requires the existing `ALPHA 0.15.27` banner and valid numeric cache versions >= 0.15.27 for stylesheet and game script, allowing descriptive suffixes. The original 30-territory visual and reduced-motion checks remain unchanged.
- No gameplay, saves, currencies, rewards, artwork, or balance changed.

## Verification and limits
- Re-fetched the committed source and inspected the version parser.
- Executed isolated Node.js parser checks: current `0.15.29-focus-skip` and `0.15.27` pass; stale `0.15.26` and malformed versions fail.
- Full GitHub Actions suite and Pages deployment must be checked after this documentation commit; isolated parser checks are not a full gameplay run or physical iPhone test.

## Next development
1. Inspect the latest quality-check job logs. If another stale exact cache-version assertion fails, fix the specific test without weakening gameplay assertions.
2. Once CI passes, prioritize a meaningful unfinished Alpha 0.15 gameplay/First Watch milestone rather than repeating test-only sessions.
3. Verify Pages deployment and real browser/mobile visual behavior separately before claiming acceptance.

## Follow-up: territory scenes cache regression (2026-11-09)
- Inspected failed quality run `42605098747` (job `129118937985`): the next failure is `tests/territory-scenes.js:97`, a stale exact `style.css?v=0.15.27` assertion.
- Commit `c0b363118d19d48b085d0cadf48bd5c5879802b8` replaces only that assertion, reusing the proven release-floor parser from `tests/war-chest.js`. All 30-terrain, drawing-order, scene-cache and resource-integrity checks remain intact.
- Re-read the committed test and live main HTML: banner `ALPHA 0.15.27`, stylesheet `0.15.29-focus-skip`, script `0.15.27`. Isolated parser checks accept both current assets, reject `0.15.26` and malformed suffixes.
- Full Node regression suite, browser render, GitHub Actions outcome for this new commit, GitHub Pages rollout, and physical iPhone test remain unverified. Inspect CI job logs before any additional changes; prioritize substantive Alpha 0.15 gameplay work once CI is green.
