# Alpha 0.1 QA and known issues

## Validated

- `node --check game.js` passes JavaScript syntax validation.
- Runtime references (`index.html`, `style.css`, `game.js`, seven PNG images) packaged in expected paths.
- No npm dependencies, third-party SDKs, network calls or paid API requirements.
- Static files suitable for GitHub Pages on `main` branch at repository root.

## Verification not yet possible here

- Chromium/Playwright navigation to both local file:// and loopback HTTP was blocked by the environment's administrator policy. Do NOT describe the game as browser-tested or iPhone-tested.
- Live gameplay, panel clicks, save persistence and layout on iPhone require first-device test.

## Playtest checklist

1. Open Pages URL on iPhone with Safari, rotate landscape, tap BEGIN SIEGE.
2. Watch moving goblins and skeletons, projectile hits, damage, wall damage, defeats and wave clear.
3. Buy a Might upgrade from TRAINING; verify Essence reduces and attack strength increases.
4. Open SKILLS after leveling and invest points; verify point deduction and damage/defense effects.
5. Open GEAR and enhance equipped bow; confirm Gold cost / new plus rank.
6. Earn 3 matching runes, combine them and socket a rune.
7. Improve Ballista and Midas stations, then verify additional projectile and gold reward impact.
8. Buy a discount research and health suppression level; verify future costs and enemy HP.
9. Close/reopen tab, confirm permanent save; export JSON, verify backup file.
10. Check whether original painted background characters/hotbar details distract from live gameplay (known art issue for v0.2).

## Design debt / bugs worth prioritizing

- Background painting includes static monsters and old interface elements. This is **the largest visual debt**; replace it before expanding the visual roster.
- Hero's shots are depicted with glow effects; full independently animated sprite remains in v0.2.
- Stations have functioning modifiers but no independent rendered machinery yet.
- The battle draws projectile damage floats without a dedicated accessibility setting.
- Pause/speed/panel state interactions need device QA; action tab panels pause combat.
- Stage numbering changes after 10 waves but biome/boss encounters are not distinct stage locations yet.
- No offline idle progression (intentional for Alpha 0.1).
