# Primal KnIght – Onslaught

**Alpha 0.3 — Rebuilt Fantasy Menu Experience**

A free, single-hero, rear-view fortress defense RPG for iPhone browsers and desktop. No subscriptions or paid services: HTML/CSS/JavaScript, original pixel-art imagery and GitHub Pages.

## Play

https://hdog960.github.io/Primal-Knight/

## Current features

- One auto-attacking hero protects the wall from escalating monster waves. Battle speed/pause and boss encounters.
- **Five redesigned navigation hubs**: Battle; Hero (Overview, Skill Trees); Power (Training, Research); Gear (Equipment, Rune Workshop); Fortress (Stations, Enemy Suppression). Settings are available from the cog in the header.
- Illustrated fantasy chamber layouts, illustrated navigation icons, themed panels, clear upgrade costs and rank progress, separated currency types and touch-friendly buttons.
- All previous permanent systems preserved: 24 talents, 16 long-term training lines, 9 equipment rarity tiers, 12 rune tiers, 5 fortress stations, 6 economy research lines, 4 suppression research lines.
- On-screen rune socket picker instead of typing numbers. Equipment and training filters; skill disciplines navigable by school.
- Local device autosaves and JSON export/import. Saved progress from Alpha 0.1 and 0.2 is compatible.
- Clean battlefield artwork: separately moving monsters, projectiles and damage text, with independent wall/hero layers.

## Technical notes

- Root `index.html` and `style.css`: Alpha 0.3 shell, responsive layout and decorative fantasy design.
- `game.js`: game logic, rendering, save and progression, plus new UI routing and screen rendering.
- `menu_art.py`: derives the 32-bit-style illustrated icon atlas in `assets/menu_icons.png` from the existing original art in `art/source_composition.png` (Python/Pillow for asset generation **only**). Runtime requires no Python, network services or build tools.
- `assets/`: original sprite files and clean background/foreground layers.
- `tests/smoke.js`: combat/progression/hub tests.
- `docs/`: design vision, roadmap, QA and Alpha 0.3 release details.

## Honest limitations

The menu/navigation system has been fully rebuilt and locally checked using a DOM-free game smoke test and headless Chromium DOM simulation at desktop, landscape mobile and portrait mobile sizes. The automated browser environment blocked network navigation, so a normal iPhone visual/play test is still necessary. This is not a claim of finished character animation or finalized stage variety. The deeper long-term features remain a work in progress.