# Primal KnIght - Onslaught

**Alpha 0.1 • Single-hero auto-attacking fortress defense RPG**

PRIMAL KNIGHT is an original, free, iPhone-first landscape browser game. A lone red-cloaked defender stands atop a wall, viewed from behind, automatically defending the fortress against a swelling army of enemies. The game is inspired by *The Tower*'s extended upgrade progression, but has an original fantasy visual identity, equipment, skill trees, runes, defensive stations, and a layered economy.

## Play on GitHub Pages

The GitHub repository is [hdog960/Primal-Knight](https://github.com/hdog960/Primal-Knight).

1. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
2. Upload the single `Primal_Knight_Onslaught_Alpha_0.1.zip` file to the repository root using **Add file → Upload files**, then commit it. The `Import Primal KnIght game bundle` action safely extracts the assets and code, commits the actual game files, removes the archive, and publishes GitHub Pages.
3. If the deploy action ran before Pages was enabled, go to **Actions → Import Primal KnIght game bundle → Run workflow** after enabling Pages.
4. Open [the game](https://hdog960.github.io/Primal-Knight/) on your iPhone in landscape orientation. The link works only after the GitHub Pages deployment has succeeded.

Alternatively, manually extract the ZIP, upload its **contents** into the repository root (where `index.html` must sit), and publish with Pages source **Deploy from a branch → main → /(root)**.

The site is pure HTML/CSS/JavaScript. No packages, build step, backend, account, subscription, database, purchased assets, or game engine are necessary. The only required service is free GitHub Pages hosting.

## What actually works in Alpha 0.1

- **Single hero / rear-view fortress:** illustrated scenic battlefield and automatically aimed projectile effects; the hero is the only playable defender.
- **Waves and bosses:** 3 regular monster types, an ogre elite every five waves, growing HP/damage/speed, wall damage, defeat/retry and ten-wave stage labeling.
- **XP and skill points:** hero levels up from kills and cleared waves and gains **two points per level**.
- **Skill trees:** four schools, 24 talents, 5 ranks each, with unlocking level requirements and a sequential prerequisite.
- **Long-term hero training:** 16 persistent purchasable lines with individual caps up to 1,500 ranks and a distinct **Hero Essence** currency.
- **Equipment:** weapon, armor, and charm slots, nine rarity tiers, equipment drops, inventory, equipping, and 50 enhancement ranks using Gold.
- **Runes:** four types, 12 fusion tiers, combine three matching unsocketed runes for Gold, and socket one rune per equipment slot. Ember, Frost, Fortune and Storm affect actual combat.
- **Fortress stations:** ballista, cryo, Midas, thunder, and gravity structures with individual persistent upgrades, each with an actual effect.
- **Economic research & enemy suppression:** research trees bought with **Knowledge** for discounts, drops, earnings, and enemy debuffs.
- **Progress:** autosaves in localStorage, manual export/import JSON backup, and pause / 2× speed controls.

## Input and orientation

Touch or click **BEGIN SIEGE** to fight; battles continue automatically, then tap NEXT WAVE. Tap any bottom tab to pause and manage upgrades. The tab panel scrolls independently. Landscape is recommended on iPhones; portrait works with horizontal scrolling navigation but is not the visual target.

## Honest Alpha limitations

This is a real gameplay foundation but **not** the final polished art/game. The illustrated battlefield is an original assembled scene painting and therefore contains some **baked-in background enemy figures and decorative hotbar details**, which will be replaced by a clean layered scene in the next visual pass. The separately animated enemies are transparent painterly-pixel sprites. The hero currently has muzzle/glow and firing effects but not a full frame-by-frame character animation; stations currently alter combat but do not yet have separate animated fortress models. The first area uses the same art across stage labels. No procedural maps, offline earnings, equipment dismantling, skill respec, mastery/ascension, cloud save, or dozens of bosses yet. No claims of these systems being complete.

These are explicitly tracked rather than presented as finished features. The goal is an exceptionally beautiful finished game, not endless placeholder mockups.

## Project files

- `index.html` — app shell and navigation
- `style.css` — mobile/desktop HUD, menu presentation and layout
- `game.js` — combat, upgrades, save data, economy, and menus
- `assets/` — original battle painting and character pixel-art sprites used by the runtime
- `art/source_composition.png` — source painting for visual continuity and future layered rebuild
- `extract_clean.py` — optional reproducible asset-cutout tool (Python + Pillow + OpenCV, not used by the deployed game)
- `docs/` — vision, current milestone and roadmap

## Testing notes

JavaScript syntax has been checked with Node. An automated browser test was attempted, but this execution environment blocked browser navigation, so responsive appearance and live play **need device verification**. See `docs/QA.md`. No analytics or trackers.
