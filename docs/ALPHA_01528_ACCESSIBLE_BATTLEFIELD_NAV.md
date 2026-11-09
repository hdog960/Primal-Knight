# Alpha 0.15.28 — Battlefield keyboard and screen-reader navigation

## Verified change
- `index.html`: The existing “Skip to Game Menus” link now targets a programmatically focusable, explicitly named navigation landmark (`role=navigation`, `tabindex=-1`). This helps keyboard and switch users land at the actual menu controls instead of only scrolling to them.
- The battlefield canvas now exposes a concise screen-reader description of automatic combat and how to reach upgrades. The descriptive text is visually hidden without being hidden from assistive technology.
- The stylesheet URL was cache-busted; the game script and save schema are unchanged. This is accessibility work, not an art or balance milestone.

## Evidence and limitations
- Implementation commit: `cdd667479edfed7f0c1425f6604f28b0efaa11bd`.
- Re-read `index.html` from main and verified the navigation role, focus target, canvas description, and unchanged game script reference. Verified main head pointed at the implementation commit immediately afterward.
- These are static source assertions only; no live browser keyboard/switch/VoiceOver testing, gameplay tests, physical iPhone test, or Pages deployment confirmation was performed in this run.
- Next: test keyboard Skip link focus behavior and VoiceOver canvas announcement in a real browser; run full quality gate, inspect live Pages deployment, and continue locked Alpha 0.15 roadmap without bypassing player visual approval.
