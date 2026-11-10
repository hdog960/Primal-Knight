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

## 2026-11-09 — Portrait Battle preview and rest-control grid
- Starting main `ab2b47d22463cbf807a67e40fa1fe86026920f36`: quality Actions run `42660326771` **passed**. Physical iPhone acceptance remains pending.
- `style.css`: constrained the territory illustration to a self-contained aspect-responsive portrait card, isolated its image from adjacent text, and changed siege-rest options to a two-column grid with 48px minimum touch targets and bounded labels at portrait widths <=680px. This is a further targeted repair for the user's screenshot showing tier/rest panels overlapping; not a redesign or gameplay change. Commit `5d4f445aff944d01c1051a96000f9a480ec9ea90`.
- `index.html`: refreshed the stylesheet cache key to `0.15.29-portrait-grid` for Home Screen update propagation. Commit `7faa9780d9b8cb4bb3e69d973ee43233ab8f2b88`.
- Re-fetched both source files and statically checked grid, preview containment, minimum touch target, cache key, release banner and gameplay asset version. These are **static checks only**, not a browser screenshot, full test suite or hardware iPhone verification.
- Next: verify Actions and Pages on final head; capture real portrait Tier IV layout at 320–430px and test rest toggles/scroll/launch. Continue First Watch gameplay roadmap after visual QA; preserve original earned progression and saves.

## 2026-11-09 — Portrait Battle launch accessibility
- At inspected main `2c97dbfaf13ea4b0c52e6893bd90cf7446806770`, the 30-tier lobby already used a single portrait scroll container. Added a **sticky, normal-flow** launch footer scoped to visible portrait lobby (<=680px), with a 48px touch target, wrapping, safe-area padding and opaque separation from scrolling milestones. This keeps the earned-tier launch action available while browsing long territory lists; no absolute-position overlay is introduced.
- `style.css` implementation commit `9fd567301fc92eabfa5556001f47c8c61603ddf1`; `index.html` iPhone cache refresh commit `4becdbb201b39c57b5185640aa9eff7aa9208fbe` (`0.15.29-sticky-launch`). Focused source assertions checked portrait scoping, sticky footer, touch size, new cache key, and unchanged gameplay script reference. **Not** a browser layout test or complete CI suite.
- No changes to gameplay, earned progression, saves, economy or art. Visual gate remains **pending creator inspection**. Next: check Actions/Pages for final SHA, verify footer on physical iPhone including safe-area and 30-tier scroll, then continue meaningful First Watch progression work.

## 2026-11-09 — Short-landscape Battle lobby reachability
- Inspected current main `bdef46de003db1bfd24a9bf9bf60aebda7f20bab`, current README, Battle CSS and existing visual-gate notes. The previous portrait fix did not address the short-landscape two-column tier/rest layout.
- `style.css`: added a narrowly scoped <=460px-height, <=950px-width landscape layout. It gives the Battle lobby a single vertical scroll path, removes nested fixed-height tier/milestone clipping, wraps siege-rest controls, and keeps the launch button sticky with 44px minimum touch height. Desktop and portrait rules remain unchanged. Commit `ba7624ba56f229ec0d01e1721abfe95151a93c5f`.
- `index.html`: stylesheet cache key advanced to `0.15.29-short-landscape` for installed Home Screen refresh, while the release banner and game script stay at 0.15.27. Commit `5f9b34dbe92c4b873e7e0ef5978736452e900b20`.
- Re-fetched both changed files and passed focused source assertions for the landscape breakpoint, scrolling, sticky action, portrait rules, cache key and unchanged gameplay asset. These are static checks, **not** visual browser or hardware QA.
- No combat, tier unlocks, currency, saves, equipment or earned progression modified. Creator visual acceptance remains pending.
- Next: verify Actions and Pages for the latest head, capture short-landscape and portrait Battle screenshots, confirm tier/rest/launch interactions, then resume substantive First Watch progression work.

## 2026-11-09 — Battle lobby sticky-footer focus clearance
- Starting main: `8072b080ada05eaa25a7ada48c3cc7585a0f13c3`. Following the portrait and short-landscape lobby fixes, keyboard/switch focus and scroll-to-control behavior could still put the last tier/rest option behind the sticky launch footer.
- `style.css`: scoped scroll padding on the visible Battle lobby and scroll margins on tier, siege-rest and milestone buttons to the existing portrait (<=680px) and short-landscape (<=460px high, <=950px wide) breakpoints. This does not alter tier eligibility, earned rewards, saves or battle rules. Commit `13078dae001a62f32cbfce506f6991fb98d7c519`.
- `index.html`: advanced only the CSS cache key to `0.15.29-focus-clearance` for installed iPhone refresh; gameplay script and release banner unchanged. Commit `e1decd88ed2000d3e004bc1297c5b7143634a9b0`.
- Verification pending: GitHub Actions and Pages for final head, real keyboard focus scrolling, portrait and short-landscape browser captures, and physical iPhone QA. No creator visual approval claimed. Next: confirm CI/deployment, validate actual focus clearance in browser, then prioritize First Watch progression gameplay over further cosmetic-only adjustments.

## 2026-11-09 — Battle tier keyboard and screen-reader navigation
- Inspected current main README, Battle markup, existing mobile visual-gate notes, and cache-version regression. The game banner remains Alpha 0.15.27; do not infer a newer gameplay release from CSS version suffixes.
- Added a named accessible tier-picker group, polite atomic announcement of the selected territory heading, and a keyboard-focusable, named milestone-reward scroll region. This helps keyboard/switch and assistive-technology users inspect long tier reward lists without modifying any tier gate, rewards, saves, or combat.
- Production markup commit: `a560d7559cf7d376ac1efc9af4d3180eac8e6b39`. Existing mandatory cache-version regression extended with three Battle semantics checks in `d2834207f29bf28daf8f2a1b9350922c385dfcd3`.
- Re-fetched both committed files and confirmed all three assertions match the deployed-source markup. **Not verified:** running Node tests, GitHub Actions quality result, Pages publication, actual keyboard scrolling, VoiceOver, physical iPhone or the original Tier IV overlap visual gate.
- Next: check final-head Actions/Pages, test milestone focus and screen-reader announcements in a browser, then prioritize genuine First Watch gameplay/progression improvements. Creator visual acceptance remains pending.

## 2026-11-09 — Battle selected-territory jump (mobile reachability)
- Starting main `516f5c47297a809e6e23e5245a40c007af88de40` had successful GitHub Actions quality run `42707701473`. Alpha 0.15.27 remains the gameplay banner; no progression gates, save data, combat, rewards or equipment were changed.
- `index.html`: added a visible **VIEW SELECTED TERRITORY & REWARDS** control after the long 30-tier grid. It focuses and scrolls to the current tier's heading, without selecting a different tier or starting a siege. Reuses the existing Atlas-style button class, and makes the heading programmatically focusable. Commit `8c1a6d60e84dac1d6867c8e7ae6ebb654faec63e`.
- `tests/cache-version-contract.js`: required static assertions for button wiring, target focus and scrolling. Commit `951894381ee56b57e32d4a32493f7d27cc5c369c`. Re-fetched both files and checked five source conditions; all five passed. This is not full Node execution or iPhone browser QA.
- Next: confirm quality and Pages workflows on final head, test mobile jump/scroll/launch behavior on iPhone portrait, and resume First Watch progression work. Original user-reported Battle overlap remains visually unapproved; do not declare it fixed from static checks.

## 2026-11-09 — Battle rewards return navigation
- Baseline main `b7689c10f355d9d12b2a641660ec35ed962fdfb9`; latest previous Pages workflow `42717145647` completed successfully for that baseline. Release banner still Alpha 0.15.27.
- Added **BACK TO TERRITORY TIERS** inside the Battle rewards pane. Activating it focuses the currently marked unlocked tier when available, otherwise the first enabled tier, and scrolls the control into view. If no buttons are enabled, it focuses the grid itself. It does not launch combat, unlock tiers, modify the selected territory, or write saves.
- Production markup and handler commit `2c5d2b8c141cd2398d9175cccef4117df0f044a6`; required source regression assertions commit `b4fd31273a9dd1db7020d6e7e3c0e8df4557b295`.
- Re-fetched both files and evaluated four source contract assertions; all passed. **Not yet verified:** full Node test suite, new-head GitHub Actions and Pages, actual keyboard focus in a browser, or physical iPhone visual QA. Original Battle overlap and creator visual approval remain open.
- Next: confirm final-head CI and Pages; test back-and-forth tier navigation in a browser and return to substantial First Watch progression work.

## 2026-11-09 — Battle tier keyboard grid navigation
- Baseline main `d1a9655d92d2159f6cff7287994eb836d19583a3`: quality run `42725563342` and Pages run `42725563813` both succeeded (verified via GitHub Actions API).
- Added native arrow-key and Home/End focus movement among **currently enabled** Battle territory buttons, with clamped boundaries and scroll-to-focused control. Focus alone does not select, unlock, launch, or save anything; Enter/Space activation remains native. Implementation `f29d58c65a5280dfd1992148821dc36597701efd`.
- Added production-inline-handler regression `tests/battle-tier-keyboard.js`, corrected test regex escaping in `bbed5ecbebcec8fa51d758c745e93bab998966d6`, and wired it to mandatory Actions quality checks in `6f0e48fbea6136ff8bc16fde3cd87301584bc82d`.
- New-head full CI, Pages deployment, actual hardware keyboard/iPhone and Tier IV visual acceptance remain to be verified. Container network DNS prevented a local clone; do not call this a locally executed test.
- Next: confirm mandatory regression green and Pages on final head; then prioritize actual First Watch combat/progression milestone work rather than more tier navigation polish. The 30 x 10,000 structure, saves and 1,250-hour unverified design target remain unchanged.

- Follow-up: copied the already established inline-script extraction expression from `tests/atlas-keyboard-focus.js` into the new regression verbatim; correction commit `bd2b64ddd16d8b542be7e0bb8845813ac9435d3e`. Final-head CI and Pages must be rechecked.

## 2026-11-09 — Battle keyboard focus guard for hidden tiers and modifier shortcuts
- Baseline `dec9232e9a42f2201154dcea896040e3356cd066`: GitHub Actions quality run `42732345746` and Pages deployment `42732345683` both completed successfully (API verified). Gameplay banner remains Alpha 0.15.27.
- `index.html` keyboard tier handler now preserves Alt/Ctrl/Meta/Shift arrow shortcuts instead of intercepting them and excludes hidden territory buttons from focus movement. This is a narrowly scoped input bug fix; no combat, save schema, equipment, rewards or unlock gates changed. Implementation `9e772d84ce022fee1135d363ec50ef3ed68744b4`.
- `tests/battle-tier-keyboard.js` now checks all four modifier cases and hidden-territory skipping using the production inline handler. Test commit `0cd44985d4363a7edb9f5b846d8c7da506892c01`.
- Verification pending: mandatory CI for final head, Pages deployment and real iPhone/browser keyboard behavior. Original Tier IV portrait visual defect and creator acceptance remain open. Next: inspect full CI and Pages; return to substantive First Watch gameplay and long-term progression validation.

## 2026-11-09 — Battle tier vertical keyboard grid correction
- Starting source after the previous hidden/modifier guard: the ArrowUp/ArrowDown handler moved only one enabled territory, even when the rendered CSS grid had multiple columns. This caused vertical arrows to behave like horizontal arrows.
- `index.html`: vertical movement now uses the rendered `gridTemplateColumns` count; Left/Right remain one item, Home/End remain first/last. Focus movement does not select a tier, start combat, grant rewards, or write saves. Implementation commit `dfda970da2231286bcdf14e6695d71d236ca3212`.
- `tests/battle-tier-keyboard.js`: mock now supplies a three-column grid and asserts ArrowDown jumps three cells, ArrowUp returns to the original column, and modifier/hidden-tier protections remain. Test commit `e40fba5840c8a94f945b08daee1ea8877ce01930`.
- Re-fetched committed source and confirmed the intended production grid-column expression and new test cases. **Not verified:** full Node execution, Actions CI, Pages deployment, real browser keyboard behavior, physical iPhone or creator visual acceptance. Gameplay release remains Alpha 0.15.27.
- Next: run the mandatory Node regression and check latest CI/Pages, inspect Tier IV layout in browser, then return to substantive First Watch gameplay and progression rather than continuing navigation-only slices.

## 2026-11-09 — Pioneer Sweep measured-stall recommendation fix
- Starting main `2df54711b0ddf215a202332dc4921b96b3a965ac`; latest quality workflow `42746991353` passed. Alpha 0.15.27 remains the gameplay banner.
- Fixed `veteranPioneerSweep()` in `game.js`: when the best evidence-ranked route is already selected, an alternative is only preferred if it has the **same measured-stall status**. Previously the unselected fallback could recommend a territory with two measured zero-first-clear sorties over a selected non-stalled territory, contradicting the on-screen Pioneer Sweep promise. Implementation `012c59ae971a44aae9f5f94bb43709c21861bb40`.
- Extended existing mandatory original-engine regression `tests/first-watch-pioneer-sweep.js` to assert that selected non-stalled Tier III remains recommended rather than measured-stalled Tier IV. Test change `012a0c0d9df969e251b7586948d52fb50def178d`.
- No save schema, rewards, combat, unlock gates, currency or 30x10,000 progression changed. Local test execution **blocked by container DNS failure** cloning GitHub (`Could not resolve host: github.com`); must confirm GitHub Actions and Pages on final head before claiming passing tests/deployment. Creator Tier IV visual acceptance and physical iPhone QA remain pending.
- Next: check mandatory regression/Pages for final head; verify actual Veteran Watch suggestion in browser, continue First Watch gameplay and earned-career balancing.
