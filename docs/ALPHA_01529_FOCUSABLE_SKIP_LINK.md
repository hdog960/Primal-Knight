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
